import type { TopicContent } from "../types";

export const automataTheory: TopicContent = {
  quickSummary: [
    "A DFA (deterministic finite automaton) has exactly one transition per symbol per state and recognizes exactly the regular languages; an NFA allows multiple transitions (including epsilon moves) but recognizes the same class, as every NFA can be converted to an equivalent DFA via subset construction.",
    "Regular expressions, DFAs, and NFAs are all equivalent in power — they define the regular languages, which are closed under union, concatenation, Kleene star, intersection, and complement.",
    "Context-free grammars (CFGs) generate context-free languages recognized by pushdown automata (PDAs), forming level 2 of the Chomsky hierarchy; they capture nested structures like balanced parentheses that regular languages cannot.",
    "The pumping lemma provides a necessary (not sufficient) condition for regularity or context-freeness, used to prove a language is NOT regular or NOT context-free by showing no valid decomposition exists.",
  ],
  detailed: [
    "A deterministic finite automaton (DFA) is defined by a 5-tuple (Q, Sigma, delta, q0, F): a finite set of states Q, an input alphabet Sigma, a transition function delta: Q x Sigma -> Q, a start state q0, and a set of accepting states F. The DFA reads input one symbol at a time, transitions deterministically, and accepts if it ends in an accepting state. DFAs are the simplest model of computation with memory (the current state is the memory). They are used in lexical analyzers, protocol verification, and string matching.",
    "A nondeterministic finite automaton (NFA) relaxes the DFA constraint by allowing multiple transitions for a given (state, symbol) pair and epsilon transitions (moves without consuming input). An NFA accepts if ANY path through its nondeterministic choices leads to an accepting state. The subset construction algorithm converts an NFA with n states into a DFA with at most 2^n states by tracking sets of possible NFA states. In practice, the blowup is usually much smaller. NFAs are often easier to design and are the basis for Thompson's construction of regex engines.",
    "Regular expressions provide a declarative syntax for regular languages: the base cases are the empty string (epsilon), the empty set, and single characters; the operations are union (|), concatenation, and Kleene star (*). Thompson's construction converts a regex to an NFA, and the subset construction converts that NFA to a DFA, which can then be minimized (Hopcroft's algorithm). The equivalence regex = NFA = DFA is one of the foundational results in computer science. Extended features in practical regex engines (backreferences, lookahead) go beyond regular languages and require backtracking.",
    "Context-free grammars (CFGs) consist of variables (nonterminals), terminals, production rules, and a start variable. Each rule replaces a single nonterminal with a string of terminals and nonterminals. CFGs generate the context-free languages (CFLs), which include balanced parentheses, palindromes, and most programming language syntax. Pushdown automata (PDAs) — NFAs augmented with an infinite stack — recognize exactly the CFLs. Unlike DFAs, deterministic PDAs (DPDAs) are strictly weaker than nondeterministic PDAs; not all CFLs are deterministic. The CYK algorithm parses any CFG in O(n^3) time.",
    "The Chomsky hierarchy classifies languages into four levels: Type 3 (regular) recognized by finite automata; Type 2 (context-free) recognized by pushdown automata; Type 1 (context-sensitive) recognized by linear-bounded automata; Type 0 (recursively enumerable) recognized by Turing machines. Each level strictly contains the one below it. Closure properties differ: regular languages are closed under all Boolean operations; CFLs are closed under union, concatenation, and Kleene star but NOT intersection or complement. These closure properties are essential for proving language classification and for compiler design.",
  ],
  deepDive: [
    "The pumping lemma for regular languages states: if L is regular, there exists a pumping length p such that any string s in L with |s| >= p can be written as s = xyz where |y| > 0, |xy| <= p, and xy^i z is in L for all i >= 0. To prove L is not regular, assume it is, pick a carefully chosen s, and show that no valid xyz decomposition satisfies all three conditions. For example, proving {a^n b^n | n >= 0} is not regular: choose s = a^p b^p; since |xy| <= p, y consists only of a's; pumping y up gives more a's than b's, a contradiction. The pumping lemma for CFLs is analogous but decomposes s = uvxyz with |vy| > 0 and |vxy| <= p.",
    "Minimization of DFAs uses the Myhill-Nerode theorem: two states are equivalent if no string distinguishes them (leads one to an accepting state and the other to a rejecting state). Hopcroft's algorithm iteratively refines partitions of states, starting from {accepting, non-accepting} and splitting groups where transitions on some symbol lead to different groups. The result is the unique minimal DFA for the language — any other DFA for the same language has at least as many states. This minimal DFA is canonical, so two regular languages are equal if and only if their minimal DFAs are isomorphic.",
    "Parsing algorithms bridge formal language theory and compiler construction. For CFGs, top-down parsers (LL) build the parse tree from the root, making decisions based on the next input tokens; they require the grammar to be LL(k). Bottom-up parsers (LR, LALR) reduce substrings to nonterminals, are more powerful, and handle a larger class of grammars. The Earley parser handles all CFGs in O(n^3) but runs in O(n^2) for unambiguous grammars and O(n) for deterministic grammars. Practical parsers like yacc/bison use LALR(1) tables, while recursive descent (used in GCC and V8) implements LL(1) by hand.",
    "Regular language closure properties are powerful proof tools. Since regular languages are closed under complement and intersection, we can prove a language is not regular by assuming it is, intersecting with a known regular language to simplify it, and then applying the pumping lemma to the result. For CFLs, closure under intersection with regular languages (but not with other CFLs) is particularly useful: to show a CFL has some property, intersect with a regular language to isolate the pattern. The Ogden's lemma strengthens the CFL pumping lemma by allowing the prover to mark certain positions that must be pumped.",
  ],
  code: [
    {
      language: "python",
      caption: "DFA and NFA simulation with subset construction",
      source: `class DFA:
    """Deterministic Finite Automaton."""
    def __init__(self, states, alphabet, transitions, start, accepting):
        self.states = states
        self.alphabet = alphabet
        self.delta = transitions   # dict: (state, symbol) -> state
        self.start = start
        self.accepting = accepting

    def accepts(self, string: str) -> bool:
        state = self.start
        for ch in string:
            state = self.delta.get((state, ch))
            if state is None:
                return False  # no transition = dead state
        return state in self.accepting

class NFA:
    """Nondeterministic Finite Automaton with epsilon transitions."""
    def __init__(self, states, alphabet, transitions, start, accepting):
        self.states = states
        self.alphabet = alphabet
        self.delta = transitions   # dict: (state, symbol|None) -> set of states
        self.start = start
        self.accepting = accepting

    def epsilon_closure(self, states: set) -> frozenset:
        stack = list(states)
        closure = set(states)
        while stack:
            s = stack.pop()
            for t in self.delta.get((s, None), set()):
                if t not in closure:
                    closure.add(t)
                    stack.append(t)
        return frozenset(closure)

    def to_dfa(self) -> DFA:
        """Subset construction: convert NFA to equivalent DFA."""
        start_set = self.epsilon_closure({self.start})
        dfa_states = {start_set}
        queue = [start_set]
        dfa_delta = {}
        dfa_accepting = set()

        while queue:
            current = queue.pop(0)
            if current & self.accepting:
                dfa_accepting.add(current)
            for sym in self.alphabet:
                next_states = set()
                for s in current:
                    next_states |= self.delta.get((s, sym), set())
                next_closure = self.epsilon_closure(next_states)
                dfa_delta[(current, sym)] = next_closure
                if next_closure not in dfa_states:
                    dfa_states.add(next_closure)
                    queue.append(next_closure)

        return DFA(dfa_states, self.alphabet, dfa_delta, start_set, dfa_accepting)

# Example: NFA for (a|b)*abb
nfa = NFA(
    states={0,1,2,3}, alphabet={'a','b'},
    transitions={
        (0,'a'): {0,1}, (0,'b'): {0},
        (1,'b'): {2}, (2,'b'): {3},
    },
    start=0, accepting={3}
)
dfa = nfa.to_dfa()
print(dfa.accepts("abb"))    # True
print(dfa.accepts("aabb"))   # True
print(dfa.accepts("ab"))     # False`,
    },
    {
      language: "python",
      caption: "CYK parsing algorithm for context-free grammars in CNF",
      source: `def cyk_parse(grammar: dict, start: str, string: str) -> bool:
    """
    CYK algorithm: O(n^3 * |G|) parser for CFGs in Chomsky Normal Form.
    grammar: dict mapping nonterminal -> list of productions
             each production is (A, B) for two nonterminals or (a,) for terminal
    """
    n = len(string)
    if n == 0:
        return ("",) in grammar.get(start, [])

    # table[i][j] = set of nonterminals that derive string[i..j]
    table = [[set() for _ in range(n)] for _ in range(n)]

    # Base case: single characters
    for i in range(n):
        for var, prods in grammar.items():
            for prod in prods:
                if len(prod) == 1 and prod[0] == string[i]:
                    table[i][i].add(var)

    # Fill diagonals: substrings of length 2..n
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            for k in range(i, j):
                for var, prods in grammar.items():
                    for prod in prods:
                        if len(prod) == 2:
                            B, C = prod
                            if B in table[i][k] and C in table[k+1][j]:
                                table[i][j].add(var)

    return start in table[0][n - 1]

# Grammar for {a^n b^n | n >= 1} in CNF:
# S -> AC | AB,  A -> a,  B -> b,  C -> SB
grammar = {
    "S": [("A","C"), ("A","B")],
    "A": [("a",)],
    "B": [("b",)],
    "C": [("S","B")],
}
print(cyk_parse(grammar, "S", "aabb"))    # True
print(cyk_parse(grammar, "S", "aaabbb"))  # True
print(cyk_parse(grammar, "S", "aab"))     # False`,
    },
  ],
  diagrams: [
    {
      title: "Chomsky Hierarchy",
      kind: "architecture",
      caption: "Nested containment of language classes: Regular (Type 3) inside Context-Free (Type 2) inside Context-Sensitive (Type 1) inside Recursively Enumerable (Type 0), each with its corresponding automaton model",
    },
    {
      title: "NFA to DFA Subset Construction",
      kind: "flow",
      caption: "Flowchart showing how epsilon-closure is computed, then for each DFA state (a set of NFA states) transitions are computed by unioning NFA transitions and taking epsilon-closure again",
    },
  ],
  animations: [
    {
      title: "NFA Simulation with Nondeterminism",
      steps: [
        { label: "Initialize", detail: "Start with the epsilon-closure of the start state: compute all states reachable via epsilon transitions from q0" },
        { label: "Read symbol", detail: "For each state in the current set, follow all transitions labeled with the current input symbol to get next states" },
        { label: "Epsilon closure", detail: "Expand the next-state set by following all epsilon transitions from each state, recursively" },
        { label: "Repeat", detail: "The current set of states becomes the expanded set; read the next symbol. The NFA tracks ALL possible paths simultaneously" },
        { label: "Accept or reject", detail: "After consuming all input, accept if ANY state in the current set is an accepting state; reject otherwise" },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "DFA", "NFA", "PDA", "Turing Machine"],
    rows: [
      ["Language class", "Regular", "Regular", "Context-free", "Recursively enumerable"],
      ["Memory", "Finite states only", "Finite states only", "Infinite stack", "Infinite tape"],
      ["Determinism", "Deterministic", "Nondeterministic", "Both (DPDA weaker)", "Both (equivalent)"],
      ["Transitions per (state, symbol)", "Exactly one", "Zero or more", "Zero or more (+ stack)", "One (det) or more (nondet)"],
      ["Closure under complement", "Yes", "Yes", "No (NPDA)", "No"],
      ["Practical use", "Lexers, regex engines", "Regex construction", "Parsers (CFGs)", "General computation"],
    ],
  },
  interviewQA: [
    {
      q: "How would you prove that the language {a^n b^n | n >= 0} is not regular?",
      a: "Apply the pumping lemma: assume the language is regular with pumping length p. Choose s = a^p b^p (|s| >= p, s is in L). By the pumping lemma, s = xyz with |y| > 0, |xy| <= p. Since |xy| <= p, y consists entirely of a's. Pumping up: xy^2z has more a's than b's, so it is not in L. This contradicts the pumping lemma, so L is not regular.",
      followUps: [
        "Is {a^n b^n} context-free? How would you prove it?",
        "Can you construct a PDA for this language?",
        "What is the pumping lemma for context-free languages and how does it differ?",
      ],
    },
    {
      q: "What is the worst-case blowup of subset construction, and does it occur in practice?",
      a: "An NFA with n states can produce a DFA with up to 2^n states, since each DFA state is a subset of NFA states. This worst case is achieved by languages like 'the k-th from last character is a': the NFA for (a|b)*a(a|b)^{k-1} has O(k) states, but the minimal DFA has 2^k states because it must remember the last k characters. In practice, the blowup is usually polynomial because most subsets are unreachable.",
      followUps: [
        "How does Hopcroft's algorithm minimize a DFA and what is its time complexity?",
        "Why might a regex engine use an NFA simulation instead of building the full DFA?",
      ],
    },
    {
      q: "Explain the difference between a context-free grammar and a regular grammar.",
      a: "A regular grammar (Type 3) restricts productions to A -> aB or A -> a (right-linear) or A -> Ba or A -> a (left-linear) — at most one nonterminal, on one end. A context-free grammar (Type 2) allows any string of terminals and nonterminals on the right side: A -> alpha where alpha is in (V union Sigma)*. This extra power lets CFGs generate nested structures (matched parentheses, recursive syntax) that regular grammars cannot. The restriction that only a single nonterminal appears on the left side is what makes it 'context-free' — the replacement does not depend on surrounding context.",
      followUps: [
        "What is a context-sensitive grammar and what additional power does it provide?",
        "Give an example of a language that is context-free but not regular.",
      ],
    },
    {
      q: "How are regular expressions used in compilers and what are their limitations?",
      a: "In compilers, regular expressions define the tokens (keywords, identifiers, numbers, operators) that the lexer recognizes. The lexer generator (lex/flex) converts regexes to a combined DFA that scans input in linear time. However, regular expressions cannot match nested structures like balanced braces — that requires a CFG and parser (yacc/bison). Practical regex libraries often extend beyond regular languages with features like backreferences (making matching NP-hard) and lookahead/lookbehind (increasing power but complicating the engine).",
      followUps: [
        "How does Thompson's NFA construction work for basic regex operators?",
        "What makes PCRE backreferences more powerful than true regular expressions?",
      ],
    },
  ],
  followUps: [
    "How does the Myhill-Nerode theorem provide an alternative characterization of regular languages and a method for DFA minimization?",
    "What is the relationship between deterministic and nondeterministic pushdown automata, and why are they not equivalent?",
    "How do Turing machines extend pushdown automata, and what languages can they recognize that PDAs cannot?",
  ],
  mcqs: [
    {
      q: "Which of the following languages is regular?",
      options: [
        "{a^n b^n | n >= 0}",
        "{w w^R | w in {a,b}*} (palindromes)",
        "{a^n | n is prime}",
        "{a, ab, aab, aaab, ...} = a*b",
      ],
      answerIndex: 3,
      explanation: "a*b is described by the regular expression a*b, so it is regular. The others require counting (a^n b^n), matching (palindromes), or arithmetic checks (primes) that finite automata cannot perform.",
    },
    {
      q: "What is the maximum number of states in a DFA equivalent to an NFA with 5 states?",
      options: ["5", "10", "25", "32"],
      answerIndex: 3,
      explanation: "Subset construction creates at most 2^n states for an n-state NFA. 2^5 = 32. Not all 32 subsets need be reachable, but 32 is the theoretical maximum.",
    },
    {
      q: "Context-free languages are NOT closed under which operation?",
      options: ["Union", "Concatenation", "Intersection", "Kleene star"],
      answerIndex: 2,
      explanation: "CFLs are closed under union, concatenation, and Kleene star, but NOT intersection or complement. The classic counterexample: {a^n b^n c^m} intersect {a^m b^n c^n} = {a^n b^n c^n}, which is not context-free.",
    },
    {
      q: "In the pumping lemma for regular languages, which condition is NOT required?",
      options: [
        "|y| > 0",
        "|xy| <= p",
        "xy^i z is in L for all i >= 0",
        "|xz| >= p",
      ],
      answerIndex: 3,
      explanation: "The three conditions are: |y| > 0 (y is non-empty), |xy| <= p (the pump occurs in the first p characters), and xy^i z is in L for all i >= 0 (including i=0). There is no requirement on |xz|.",
    },
    {
      q: "Which automaton model recognizes context-free languages?",
      options: [
        "Deterministic finite automaton (DFA)",
        "Nondeterministic pushdown automaton (NPDA)",
        "Linear-bounded automaton (LBA)",
        "Two-stack pushdown automaton",
      ],
      answerIndex: 1,
      explanation: "NPDAs recognize exactly the context-free languages. DFAs recognize regular languages. LBAs recognize context-sensitive languages. A two-stack PDA is equivalent to a Turing machine.",
    },
  ],
  exercises: [
    "Construct a DFA with minimum states that accepts all binary strings divisible by 3. Prove its minimality using the Myhill-Nerode theorem.",
    "Given the NFA for the regex (a|b)*abb, perform subset construction by hand to produce the equivalent DFA, then minimize it.",
    "Prove that the language {a^n b^n c^n | n >= 0} is not context-free using the pumping lemma for context-free languages.",
    "Convert the grammar S -> aSb | epsilon to Chomsky Normal Form, then trace the CYK algorithm on the input 'aabb'.",
  ],
  flashcards: [
    { front: "What are the five components of a DFA?", back: "(Q, Sigma, delta, q0, F): finite state set Q, input alphabet Sigma, transition function delta: Q x Sigma -> Q, start state q0, accepting states F subset of Q." },
    { front: "How does an NFA differ from a DFA?", back: "An NFA allows multiple transitions for a given (state, symbol) pair and may include epsilon transitions. It accepts if any nondeterministic path leads to an accepting state." },
    { front: "State the pumping lemma for regular languages.", back: "If L is regular, there exists p > 0 such that any s in L with |s| >= p can be split as s = xyz with |y| > 0, |xy| <= p, and xy^i z in L for all i >= 0." },
    { front: "What is Chomsky Normal Form (CNF)?", back: "A CFG is in CNF if every production is either A -> BC (two nonterminals) or A -> a (single terminal), plus S -> epsilon if epsilon is in the language. Any CFG can be converted to CNF." },
    { front: "What is the Chomsky hierarchy (all four levels)?", back: "Type 3: Regular (DFA/NFA). Type 2: Context-free (PDA). Type 1: Context-sensitive (LBA). Type 0: Recursively enumerable (Turing machine). Each strictly contains the lower type." },
    { front: "Are context-free languages closed under complement?", back: "No. CFLs are closed under union, concatenation, and Kleene star, but NOT under intersection or complement. However, they are closed under intersection with regular languages." },
    { front: "What is the time complexity of the CYK algorithm?", back: "O(n^3 * |G|) where n is the input length and |G| is the grammar size. It requires the grammar to be in Chomsky Normal Form." },
    { front: "What does Thompson's construction do?", back: "It converts a regular expression into an equivalent NFA with O(r) states (where r is the regex length) using structural induction on the regex operators: base cases, union, concatenation, and Kleene star." },
  ],
  revisionNotes: [
    "DFA = NFA = regex in expressive power (all define regular languages). Conversion: regex -> NFA (Thompson's), NFA -> DFA (subset construction), DFA -> minimal DFA (Hopcroft's).",
    "Pumping lemma is necessary but not sufficient: passing the pumping lemma does not prove a language is regular. It is only used to prove a language is NOT regular.",
    "CFG = PDA for nondeterministic versions. But DPDA < NPDA: deterministic context-free languages (like LR-parsable languages) are a strict subset of all CFLs.",
    "Closure properties summary: Regular languages are closed under everything (union, intersection, complement, concatenation, Kleene star). CFLs are NOT closed under intersection or complement.",
    "Every regular language is also context-free (build a CFG with only right-linear productions). The containment is strict: {a^n b^n} is context-free but not regular.",
  ],
  cheatSheet: [
    "DFA: one transition per (state, symbol). NFA: multiple transitions allowed plus epsilon moves. Same power, different convenience.",
    "Subset construction: DFA state = set of NFA states. Worst case 2^n states, usually much fewer.",
    "Pumping lemma (regular): split s = xyz, |y|>0, |xy|<=p, pump y. Pumping lemma (CFL): split s = uvxyz, |vy|>0, |vxy|<=p, pump v and y together.",
    "CNF productions: A -> BC or A -> a. Required for CYK parsing. Any CFG can be converted (remove epsilon, unit productions, and long/mixed rules).",
    "Regular closure: union, intersection, complement, concat, star, reversal, homomorphism. CFL closure: union, concat, star, intersection with regular. NOT: intersection, complement.",
    "Key undecidable problems for CFLs: universality, equivalence, ambiguity. Decidable: membership (CYK), emptiness, finiteness.",
  ],
  resources: [
    { label: "Introduction to the Theory of Computation (Sipser)", kind: "book", note: "The gold-standard textbook covering automata, computability, and complexity with rigorous proofs and clear exposition" },
    { label: "Introduction to Automata Theory, Languages, and Computation (Hopcroft, Motwani, Ullman)", kind: "book", note: "Comprehensive reference with detailed algorithms for DFA minimization, parsing, and closure proofs" },
    { label: "Automata Theory Course (Jeff Ullman, Coursera)", kind: "video", note: "Free course by one of the field's founders, covering all Chomsky hierarchy levels with graded exercises" },
    { label: "Regular Expression Matching Can Be Simple and Fast (Russ Cox)", kind: "article", note: "Explains why Thompson NFA-based regex matching is O(nm) while backtracking engines are exponential, with benchmarks" },
    { label: "JFLAP: Java Formal Languages and Automata Package", kind: "repo", note: "Interactive tool for constructing and simulating DFAs, NFAs, PDAs, Turing machines, and grammars" },
  ],
  glossary: [
    { term: "DFA (Deterministic Finite Automaton)", definition: "A finite-state machine with exactly one transition per state-symbol pair. Accepts an input string if the unique run ends in an accepting state." },
    { term: "NFA (Nondeterministic Finite Automaton)", definition: "A finite automaton that allows multiple transitions per state-symbol pair and epsilon transitions. Accepts if any possible run reaches an accepting state." },
    { term: "Regular language", definition: "A language recognizable by a DFA (equivalently, an NFA or regular expression). Closed under all Boolean and regular operations." },
    { term: "Context-free grammar (CFG)", definition: "A grammar where each production replaces a single nonterminal with a string of terminals and nonterminals, regardless of context. Generates context-free languages." },
    { term: "Pushdown automaton (PDA)", definition: "A finite automaton augmented with an infinite stack. Nondeterministic PDAs recognize exactly the context-free languages." },
    { term: "Pumping lemma", definition: "A necessary condition for a language to be regular (or context-free). Used in proofs by contradiction to show a language does NOT belong to these classes." },
    { term: "Chomsky Normal Form (CNF)", definition: "A restricted form of CFG where every production is A -> BC (two nonterminals) or A -> a (one terminal). Required by the CYK parsing algorithm." },
    { term: "Chomsky hierarchy", definition: "A classification of formal languages into four nested types: regular (Type 3), context-free (Type 2), context-sensitive (Type 1), and recursively enumerable (Type 0)." },
  ],
};
