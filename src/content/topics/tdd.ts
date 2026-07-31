import type { TopicContent } from "../types";

export const tdd: TopicContent = {
  quickSummary: [
    "Test-Driven Development (TDD) follows the Red-Green-Refactor cycle: write a failing test first (Red), write the simplest code to make it pass (Green), then improve the code structure without changing behavior (Refactor).",
    "The Three Laws of TDD (Robert C. Martin): (1) do not write production code except to make a failing test pass, (2) do not write more of a test than is sufficient to fail, (3) do not write more production code than is sufficient to pass the test.",
    "TDD produces code with high test coverage by construction, encourages simpler design through small increments, and provides a safety net that makes refactoring fearless.",
    "TDD works best for well-understood domains with clear business rules (domain logic, algorithms, data transformations) and is less suited for exploratory prototyping or heavily UI-driven development.",
  ],
  detailed: [
    "The Red-Green-Refactor cycle is the heartbeat of TDD. In the Red phase, you write a test for behavior that does not exist yet. The test must fail -- if it passes, either the behavior already exists or the test is wrong. In the Green phase, you write the absolute minimum code to make the test pass, even if it seems ugly or hacky. The goal is a passing test, not beautiful code. In the Refactor phase, you improve the code: extract methods, rename variables, remove duplication, apply design patterns. The tests provide a safety net ensuring that refactoring does not break behavior. Then the cycle repeats.",
    "The Three Laws of TDD constrain the developer's behavior to extremely short feedback loops. Law 1: You may not write production code unless it is to make a failing unit test pass. Law 2: You may not write more of a unit test than is sufficient to fail (compilation failures count as failures). Law 3: You may not write more production code than is sufficient to pass the currently failing test. These laws force you to work in cycles of seconds to minutes, not hours. Each cycle produces a tiny increment of tested, working code.",
    "TDD differs from test-first and test-last approaches in important ways. Test-first means writing tests before production code but without the rigid Red-Green-Refactor discipline -- you might write all tests for a feature, then implement it. Test-last (the most common approach) means writing production code first and adding tests afterward. TDD's advantage over test-first is the tight feedback loop and incremental design. Its advantage over test-last is that tests written after code tend to confirm the implementation rather than specify behavior, and developers under deadline pressure often skip them entirely.",
    "The Transformation Priority Premise (TPP), introduced by Robert C. Martin, provides a guide for what code changes to make in the Green step. Transformations are ordered from simple to complex: {} -> nil, nil -> constant, constant -> variable, unconditional -> conditional, value -> list, statement -> recursion, etc. The premise is that choosing simpler transformations leads to better algorithms. For example, when implementing a sort, TPP guides you from returning an empty list, to returning a single element, to comparing two elements, to recursion -- rather than jumping straight to a complex algorithm.",
    "Benefits of TDD include: comprehensive test coverage by construction (every line of production code was written to make a test pass), simpler design (you only add what is needed), living documentation (tests describe behavior), and fearless refactoring (the safety net catches regressions). Studies from Microsoft and IBM found that TDD reduces defect rates by 40-90% with a 15-35% increase in development time. The total cost including maintenance and debugging is often lower with TDD.",
    "Criticisms of TDD include: it can slow initial development, it is difficult with legacy code that lacks testable design, it can lead to over-testing (testing implementation details), and it does not replace design thinking -- writing tests first does not automatically produce good architecture. Some developers find the rigid cycle constraining and prefer to sketch a rough design first. TDD skeptics argue that experienced developers can achieve similar quality with disciplined test-first or test-after approaches.",
  ],
  deepDive: [
    "The Transformation Priority Premise (TPP) provides a formal framework for the Green step. The transformations, from simple to complex, are: (1) {} -> nil: no code to code that returns nil/null, (2) nil -> constant: return a hardcoded value, (3) constant -> constant+: add another constant case, (4) constant -> scalar: replace constant with a variable, (5) statement -> statements: add more unconditional logic, (6) unconditional -> if: add a conditional branch, (7) scalar -> collection: use a list instead of a single value, (8) statement -> recursion: replace iteration with recursion. The premise states that choosing simpler transformations at each step leads to simpler and more correct algorithms. Choosing a complex transformation too early (jumping to recursion when a conditional would suffice) can lead to over-engineered or incorrect solutions.",
    "TDD and design emerge together through the Refactor step. As you add tests and make them pass, patterns emerge in the code: duplicated logic begs for extraction, conditional chains suggest polymorphism, and growing parameter lists indicate missing abstractions. The Refactor step is where design happens in TDD. This is 'emergent design' -- the design is not planned upfront but evolves organically driven by the tests. However, this does not mean TDD replaces architectural thinking. High-level architecture (component boundaries, data flow, technology choices) should be planned before TDD begins. TDD operates within those boundaries.",
    "Outside-In TDD (London School) starts from the outermost component (e.g., a controller) and works inward, using mocks for dependencies that do not exist yet. As each layer is tested and implemented, the mocks are replaced with real implementations that are themselves developed with TDD. This approach is guided by user stories and produces code that naturally follows dependency inversion. Inside-Out TDD (Detroit School) starts from the domain model and works outward, building real objects without mocks. Inside-Out produces less coupled tests but may require rework as outer layers impose constraints. Most practitioners blend both approaches.",
    "TDD is particularly effective for certain problem types: business rule engines, data transformation pipelines, algorithmic challenges, API design, and domain model development. It is less effective for: exploratory prototyping (when requirements are unclear), UI layout and styling (visual output is hard to assert), infrastructure and configuration (integration tests are more appropriate), and heavily concurrent systems (testing concurrency requires different techniques). Recognizing where TDD adds value versus where it adds overhead is a sign of mature engineering judgment.",
  ],
  code: [
    {
      language: "java",
      caption: "TDD walkthrough: building a Roman Numeral converter step by step",
      source: `// Step 1 RED: Write first failing test
class RomanNumeralConverterTest {
    private RomanNumeralConverter converter = new RomanNumeralConverter();

    @Test
    void converts_1_to_I() {
        assertEquals("I", converter.toRoman(1));
    }
}
// Step 1 GREEN: Simplest code to pass
class RomanNumeralConverter {
    String toRoman(int number) {
        return "I"; // constant - simplest transformation
    }
}

// Step 2 RED: Add next test
@Test void converts_2_to_II() {
    assertEquals("II", converter.toRoman(2));
}
// Step 2 GREEN: Introduce variable
String toRoman(int number) {
    return "I".repeat(number); // constant -> scalar
}

// Step 3 RED: Force a new branch
@Test void converts_4_to_IV() {
    assertEquals("IV", converter.toRoman(4));
}
// Step 3 GREEN: Add conditional
String toRoman(int number) {
    if (number == 4) return "IV";
    return "I".repeat(number);
}

// Step 4 RED: Add 5
@Test void converts_5_to_V() {
    assertEquals("V", converter.toRoman(5));
}

// Step 4 GREEN + REFACTOR: Pattern emerges, introduce lookup table
String toRoman(int number) {
    int[] values = {5, 4, 1};
    String[] symbols = {"V", "IV", "I"};
    StringBuilder result = new StringBuilder();
    for (int i = 0; i < values.length; i++) {
        while (number >= values[i]) {
            result.append(symbols[i]);
            number -= values[i];
        }
    }
    return result.toString();
}

// Continue TDD: add tests for 9(IX), 10(X), 40(XL), 50(L), etc.
// Each test drives expansion of the values/symbols arrays
@Test void converts_9_to_IX() { assertEquals("IX", converter.toRoman(9)); }
@Test void converts_42_to_XLII() { assertEquals("XLII", converter.toRoman(42)); }
@Test void converts_1994_to_MCMXCIV() { assertEquals("MCMXCIV", converter.toRoman(1994)); }

// Final GREEN: Complete lookup table
String toRoman(int number) {
    int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    String[] symbols = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    StringBuilder result = new StringBuilder();
    for (int i = 0; i < values.length; i++) {
        while (number >= values[i]) {
            result.append(symbols[i]);
            number -= values[i];
        }
    }
    return result.toString();
}`,
    },
    {
      language: "cpp",
      caption: "TDD for a stack data structure with assertions in C++",
      source: `// test_stack.cpp - Tests written first in TDD order, with implementation below

#include <cassert>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

// stack.h - Implementation driven by tests (final version after all cycles)
template <typename T>
class Stack {
    std::vector<T> items_;
public:
    bool is_empty() const { return items_.empty(); }

    void push(const T& item) { items_.push_back(item); }

    T pop() {
        if (is_empty()) throw std::out_of_range("pop from empty stack");
        T top = std::move(items_.back());
        items_.pop_back();
        return top;
    }

    const T& peek() const {
        if (is_empty()) throw std::out_of_range("peek at empty stack");
        return items_.back();
    }

    size_t size() const { return items_.size(); }
};

// Test helpers
void expect_throws(auto fn, const std::string& msg) {
    try { fn(); assert(false && "Expected exception"); }
    catch (const std::out_of_range& e) { assert(std::string(e.what()) == msg); }
}

int main() {
    // RED-GREEN cycle 1: Stack starts empty
    { Stack<int> s; assert(s.is_empty() == true); }

    // RED-GREEN cycle 2: Push makes it non-empty
    { Stack<int> s; s.push(42); assert(s.is_empty() == false); }

    // RED-GREEN cycle 3: Pop returns pushed value
    { Stack<int> s; s.push(42); assert(s.pop() == 42); }

    // RED-GREEN cycle 4: Pop removes element
    { Stack<int> s; s.push(42); s.pop(); assert(s.is_empty() == true); }

    // RED-GREEN cycle 5: LIFO order
    {
        Stack<int> s;
        s.push(1); s.push(2); s.push(3);
        assert(s.pop() == 3);
        assert(s.pop() == 2);
        assert(s.pop() == 1);
    }

    // RED-GREEN cycle 6: Error on empty pop
    {
        Stack<int> s;
        expect_throws([&]{ s.pop(); }, "pop from empty stack");
    }

    // RED-GREEN cycle 7: Peek without removing
    {
        Stack<int> s;
        s.push(42);
        assert(s.peek() == 42);
        assert(s.is_empty() == false);
    }

    // RED-GREEN cycle 8: Size tracking
    {
        Stack<int> s;
        assert(s.size() == 0);
        s.push(1); s.push(2);
        assert(s.size() == 2);
        s.pop();
        assert(s.size() == 1);
    }

    std::cout << "All tests passed.\\n";
}`,
    },
    {
      language: "typescript",
      caption: "TDD for a string calculator kata in TypeScript with Jest",
      source: `// stringCalculator.test.ts
import { add } from './stringCalculator';

describe('String Calculator (TDD)', () => {
  // Cycle 1: empty string returns 0
  it('returns 0 for empty string', () => {
    expect(add("")).toBe(0);
  });

  // Cycle 2: single number returns itself
  it('returns the number for a single number', () => {
    expect(add("1")).toBe(1);
  });

  // Cycle 3: two numbers comma-separated
  it('returns sum of two comma-separated numbers', () => {
    expect(add("1,2")).toBe(3);
  });

  // Cycle 4: arbitrary count
  it('handles any amount of numbers', () => {
    expect(add("1,2,3,4,5")).toBe(15);
  });

  // Cycle 5: newline delimiter
  it('handles newlines as delimiters', () => {
    expect(add("1\\n2,3")).toBe(6);
  });

  // Cycle 6: custom delimiter
  it('supports custom delimiters defined in first line', () => {
    expect(add("//;\\n1;2")).toBe(3);
  });

  // Cycle 7: negative numbers throw
  it('throws on negative numbers with message listing them', () => {
    expect(() => add("1,-2,3,-4")).toThrow("negatives not allowed: -2, -4");
  });

  // Cycle 8: numbers > 1000 ignored
  it('ignores numbers greater than 1000', () => {
    expect(add("2,1001")).toBe(2);
    expect(add("1000,1001")).toBe(1000);
  });
});

// stringCalculator.ts - Final implementation
export function add(input: string): number {
  if (input === "") return 0;

  let delimiter = /[,\\n]/;
  let numbers = input;

  if (input.startsWith("//")) {
    const parts = input.split("\\n");
    delimiter = new RegExp(escapeRegex(parts[0].substring(2)));
    numbers = parts.slice(1).join("\\n");
  }

  const nums = numbers.split(delimiter).map(Number);
  const negatives = nums.filter(n => n < 0);
  if (negatives.length > 0) {
    throw new Error(\`negatives not allowed: \${negatives.join(", ")}\`);
  }
  return nums.filter(n => n <= 1000).reduce((sum, n) => sum + n, 0);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}`,
    },
  ],
  diagrams: [
    {
      title: "Red-Green-Refactor Cycle",
      kind: "flow",
      caption:
        "The TDD cycle: write a failing test (Red), make it pass with minimal code (Green), improve code structure (Refactor), then repeat. The cycle typically takes 1-5 minutes per iteration.",
    },
    {
      title: "Outside-In vs Inside-Out TDD",
      kind: "architecture",
      caption:
        "Outside-In (London) starts from the controller/API layer and works inward using mocks. Inside-Out (Detroit) starts from the domain model and works outward with real objects.",
    },
  ],
  animations: [
    {
      title: "TDD Red-Green-Refactor Walkthrough",
      steps: [
        {
          label: "Red: Write a failing test",
          detail:
            "Write a test for the next small increment of behavior. The test MUST fail -- run it to confirm. If it passes, either the behavior already exists or the test is wrong.",
        },
        {
          label: "Green: Make it pass (minimum code)",
          detail:
            "Write the absolute simplest code that makes the test pass. Hardcode return values, use if-statements, duplicate code -- anything to get green. Resist the urge to write 'good' code.",
        },
        {
          label: "Refactor: Improve without changing behavior",
          detail:
            "Now improve the code: extract methods, remove duplication, rename for clarity, apply patterns. Run tests after each change to ensure nothing breaks. This is where design emerges.",
        },
        {
          label: "Repeat: Pick the next test",
          detail:
            "Choose the next behavior to test. Use the Transformation Priority Premise to pick the simplest transformation that adds value. Continue the cycle until the feature is complete.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "TDD", "Test-First", "Test-Last"],
    rows: [
      [
        "When tests are written",
        "Before each tiny increment of code",
        "Before the implementation",
        "After the implementation",
      ],
      [
        "Feedback loop",
        "Seconds to minutes (per cycle)",
        "Minutes to hours",
        "Hours to days",
      ],
      [
        "Design approach",
        "Emergent (design evolves with tests)",
        "Planned then verified",
        "Retrofitted tests confirm existing code",
      ],
      [
        "Test coverage",
        "Near 100% by construction",
        "High but may miss edge cases",
        "Variable, often lower",
      ],
      [
        "Refactoring confidence",
        "High (safety net from start)",
        "Moderate",
        "Low until tests are written",
      ],
      [
        "Risk of over-testing",
        "Moderate (may test implementation details)",
        "Lower (tests focus on requirements)",
        "Lower (tests validate behavior)",
      ],
      [
        "Discipline required",
        "High (strict Red-Green-Refactor)",
        "Moderate",
        "Low (tests are optional pressure)",
      ],
      [
        "Best suited for",
        "Domain logic, algorithms, APIs",
        "Well-specified features",
        "Prototyping, exploration, UI",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain the Red-Green-Refactor cycle in TDD.",
      a: "Red: write a test for behavior that does not exist yet. Run it to confirm it fails. Green: write the minimum code to make the test pass, even if it is ugly. Do not add anything the test does not require. Refactor: improve the code structure -- extract methods, remove duplication, apply patterns -- while keeping all tests green. The cycle repeats every 1-5 minutes, producing small increments of tested, working code. The key discipline is never skipping the Red step (writing the test first) and never skipping the Refactor step (improving design).",
      followUps: [
        "What happens if you skip the Refactor step?",
        "How do you decide what to test next?",
        "What is the typical duration of one TDD cycle?",
      ],
    },
    {
      q: "What are the Three Laws of TDD?",
      a: "Law 1: You may not write production code unless it is to make a failing unit test pass. Law 2: You may not write more of a unit test than is sufficient to fail, and compilation failures count as failures. Law 3: You may not write more production code than is sufficient to pass the currently failing test. These laws enforce an extremely tight feedback loop: you alternate between writing a line or two of test code and a line or two of production code. This prevents big-bang development and ensures every line of production code has a corresponding test.",
      followUps: [
        "Is it practical to follow these laws strictly?",
        "How do the three laws prevent over-engineering?",
        "What happens when you violate one of the laws?",
      ],
    },
    {
      q: "What is the Transformation Priority Premise?",
      a: "The TPP, by Robert C. Martin, is a guide for choosing what code change to make in the Green step. Transformations are ordered from simple to complex: nil -> constant, constant -> variable, unconditional -> conditional, scalar -> collection, statement -> recursion. The premise is that choosing the simplest applicable transformation at each step leads to better algorithms. For example, when implementing FizzBuzz, TPP guides you from returning a constant to adding a conditional to handling the composite case, avoiding premature optimization or complex logic.",
      followUps: [
        "Can you walk through TPP with a specific example?",
        "What happens if you choose a complex transformation too early?",
        "Is TPP widely adopted in practice?",
      ],
    },
    {
      q: "When should you NOT use TDD?",
      a: "TDD is less effective for: exploratory prototyping where requirements are unclear (you cannot test what you do not understand yet), UI layout and styling (visual output is hard to assert), infrastructure configuration (integration tests are better), heavily concurrent systems (race conditions need different testing approaches), and throwaway spike code. It is also challenging with legacy code that was not designed for testability. TDD works best when you have clear business rules, well-defined inputs and outputs, and a testable architecture. Recognizing these boundaries is a sign of mature engineering judgment.",
      followUps: [
        "How do you transition from a prototype to TDD-driven code?",
        "Can TDD work with legacy code?",
        "What testing approach should you use when TDD does not fit?",
      ],
    },
    {
      q: "What is the difference between Outside-In and Inside-Out TDD?",
      a: "Outside-In (London School) starts from the outermost layer (e.g., a REST controller) and works inward, using mocks for dependencies that do not exist yet. It is guided by user stories and naturally produces dependency injection. Inside-Out (Detroit School) starts from the domain model and works outward, building real objects without mocks. Inside-Out produces tests that are less coupled to implementation but may require rework when outer layers impose constraints. Most experienced practitioners blend both: use Outside-In for the overall feature flow and Inside-Out for complex domain logic.",
      followUps: [
        "Which style do you prefer and why?",
        "How does Outside-In TDD relate to the mockist testing style?",
        "Can you combine both approaches in the same feature?",
      ],
    },
    {
      q: "What evidence supports TDD's effectiveness?",
      a: "Studies from Microsoft and IBM (Nagappan et al., 2008) found that TDD reduces defect density by 40-90% compared to non-TDD projects, with a 15-35% increase in development time. However, when total lifecycle costs (including debugging, maintenance, and regression fixing) are considered, TDD often saves time overall. Anecdotally, teams practicing TDD report higher confidence in their code, less fear of refactoring, and better design. Critics note that the studies may suffer from selection bias (motivated teams chose TDD) and that disciplined test-first approaches can achieve similar results.",
      followUps: [
        "How do you measure TDD's ROI on a team?",
        "Are there studies that show TDD does not help?",
        "How do you introduce TDD to a skeptical team?",
      ],
    },
  ],
  followUps: [
    "How does TDD change the way you think about software design?",
    "What are TDD katas and how do they help you practice?",
    "How does TDD interact with code review processes?",
    "Can TDD be applied to microservices and distributed systems?",
    "What is the relationship between TDD and SOLID principles?",
    "How do you do TDD with databases and external services?",
  ],
  mcqs: [
    {
      q: "In TDD, what is the correct order of steps?",
      options: [
        "Green, Red, Refactor",
        "Red, Green, Refactor",
        "Refactor, Red, Green",
        "Red, Refactor, Green",
      ],
      answerIndex: 1,
      explanation:
        "TDD follows Red (write failing test), Green (make it pass with minimum code), Refactor (improve code structure). The failing test must come first.",
    },
    {
      q: "According to TDD's Three Laws, when may you write production code?",
      options: [
        "Any time, as long as you write tests afterward",
        "Only to make a failing unit test pass",
        "After completing the full design document",
        "When the team lead approves the architecture",
      ],
      answerIndex: 1,
      explanation:
        "Law 1 states: you may not write production code unless it is to make a failing unit test pass. This ensures every line of production code is driven by a test.",
    },
    {
      q: "What does the Transformation Priority Premise guide?",
      options: [
        "Which test to write next",
        "The order of refactoring operations",
        "Which code change to make in the Green step, from simple to complex",
        "How to prioritize features in the backlog",
      ],
      answerIndex: 2,
      explanation:
        "TPP orders code transformations from simple (nil -> constant) to complex (statement -> recursion) and advises choosing the simplest applicable transformation at each step.",
    },
    {
      q: "How does TDD differ from test-first development?",
      options: [
        "TDD writes tests after code; test-first writes them before",
        "TDD enforces tight Red-Green-Refactor cycles; test-first may write all tests before implementing",
        "TDD only uses mocks; test-first uses real objects",
        "There is no difference; they are synonyms",
      ],
      answerIndex: 1,
      explanation:
        "TDD enforces a strict cycle of one tiny test followed by minimal code. Test-first may write multiple tests before implementing, lacking the tight feedback loop and emergent design of TDD.",
    },
    {
      q: "Which scenario is LEAST suited for TDD?",
      options: [
        "Implementing a currency conversion module",
        "Building a sorting algorithm",
        "Exploratory UI prototyping with unclear requirements",
        "Designing a REST API",
      ],
      answerIndex: 2,
      explanation:
        "TDD requires clear, testable requirements. Exploratory prototyping, where you do not know what you are building yet, is poorly suited because you cannot write meaningful tests for undefined behavior.",
    },
    {
      q: "What is Outside-In TDD also known as?",
      options: [
        "Detroit School",
        "London School",
        "Chicago School",
        "Acceptance TDD",
      ],
      answerIndex: 1,
      explanation:
        "Outside-In TDD (London School) starts from the outer layers and works inward using mocks. Inside-Out TDD (Detroit/Chicago School) starts from the domain model and works outward.",
    },
  ],
  exercises: [
    "Practice TDD with the FizzBuzz kata: write a function that returns 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, 'FizzBuzz' for multiples of both, and the number as a string otherwise. Follow strict Red-Green-Refactor with one test at a time. Document each cycle.",
    "Implement a password strength validator using TDD. Requirements: minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. Return a strength rating (weak/medium/strong). Write tests first for each rule individually, then for combinations.",
    "Use TDD to build a simple shopping cart: addItem, removeItem, calculateTotal, applyCoupon. Start with the simplest test (empty cart has zero total) and build up to discount logic. Practice the Transformation Priority Premise by choosing the simplest transformation at each step.",
    "Practice Outside-In TDD: build a REST endpoint for user registration. Start with a controller test using mocked service, then TDD the service with mocked repository, then TDD the repository against a test database. Compare your experience with Inside-Out TDD.",
  ],
  flashcards: [
    {
      front: "What are the three phases of the TDD cycle?",
      back: "Red (write failing test), Green (minimum code to pass), Refactor (improve code, keep tests green). Typical cycle time: 1-5 minutes.",
    },
    {
      front: "What are the Three Laws of TDD?",
      back: "(1) No production code except to pass a failing test. (2) No more test code than sufficient to fail. (3) No more production code than sufficient to pass the failing test.",
    },
    {
      front: "What is the Transformation Priority Premise?",
      back: "A guide for the Green step: choose transformations from simple to complex -- nil, constant, variable, conditional, collection, recursion. Simpler transformations lead to better algorithms.",
    },
    {
      front: "What is the difference between Outside-In and Inside-Out TDD?",
      back: "Outside-In (London): start from controller, mock dependencies, work inward. Inside-Out (Detroit): start from domain model, use real objects, work outward.",
    },
    {
      front: "When should you NOT use TDD?",
      back: "Exploratory prototyping (unclear requirements), UI layout/styling, infrastructure config, heavily concurrent systems, and throwaway spike code.",
    },
    {
      front: "What is emergent design in TDD?",
      back: "Design that evolves organically through the Refactor step. As tests accumulate, patterns emerge (duplication to extract, conditionals to polymorphism) that guide the code toward a clean structure.",
    },
    {
      front: "How does TDD affect defect rates?",
      back: "Studies show TDD reduces defect density by 40-90% with 15-35% increase in initial development time. Total lifecycle cost (including maintenance and debugging) is often lower.",
    },
  ],
  revisionNotes: [
    "TDD cycle: Red (failing test) -> Green (minimal code to pass) -> Refactor (improve structure). Never skip Refactor.",
    "Three Laws: (1) no production code without a failing test, (2) no more test than sufficient to fail, (3) no more code than sufficient to pass.",
    "Transformation Priority Premise: nil -> constant -> variable -> conditional -> collection -> recursion. Choose the simplest transformation.",
    "TDD vs Test-First: TDD enforces tight cycles (seconds-minutes). Test-First may write all tests before implementing.",
    "Outside-In (London): start from outer layer with mocks, work inward. Inside-Out (Detroit): start from domain, work outward with real objects.",
    "TDD works best for: domain logic, algorithms, APIs, business rules. Less suited for: UI prototyping, infrastructure, concurrency.",
    "Studies show 40-90% defect reduction with 15-35% more initial development time. Total lifecycle cost is often lower with TDD.",
  ],
  cheatSheet: [
    "Red: write ONE failing test. Green: write MINIMUM code to pass. Refactor: clean up, run tests. Repeat.",
    "Cycle time: 1-5 minutes. If longer, the step is too big. Break it down.",
    "TPP order: {} -> nil -> constant -> variable -> unconditional -> if -> collection -> recursion",
    "Start simple: first test should be the degenerate case (empty input, zero, null)",
    "Never refactor on Red. Only refactor when all tests are Green.",
    "Outside-In: controller -> service -> repository (with mocks). Inside-Out: model -> service -> controller (real objects).",
    "Good TDD test names describe behavior: should_returnZero_when_cartIsEmpty",
    "If you cannot write a test, you do not understand the requirement. Clarify before coding.",
  ],
  resources: [
    {
      label: "Test Driven Development: By Example by Kent Beck",
      kind: "book",
      note: "The foundational TDD book. Walks through two complete TDD examples: a multi-currency money system and a testing framework (xUnit).",
    },
    {
      label: "Clean Code by Robert C. Martin (Chapter 9: Unit Tests)",
      kind: "book",
      note: "Covers the Three Laws of TDD, clean test principles, and the relationship between tests and code quality.",
    },
    {
      label: "The Transformation Priority Premise by Robert C. Martin",
      kind: "article",
      note: "Introduces TPP as a guide for choosing code transformations during the Green step, with examples from FizzBuzz and word wrap.",
    },
    {
      label: "Growing Object-Oriented Software, Guided by Tests by Freeman and Pryce",
      kind: "book",
      note: "Comprehensive guide to Outside-In TDD (London School) with a complete worked example building an auction sniper application.",
    },
    {
      label: "TDD Kata Catalog",
      kind: "repo",
      note: "Collection of TDD practice exercises: FizzBuzz, Bowling Game, Roman Numerals, String Calculator, and more.",
    },
  ],
  glossary: [
    {
      term: "Red-Green-Refactor",
      definition:
        "The three-phase TDD cycle: write a failing test (Red), make it pass with minimal code (Green), improve code structure (Refactor).",
    },
    {
      term: "Transformation Priority Premise",
      definition:
        "A guide that orders code transformations from simple to complex, recommending the simplest applicable transformation in the Green step.",
    },
    {
      term: "Emergent Design",
      definition:
        "Design that evolves organically through TDD's Refactor step as patterns emerge from accumulating tests and production code.",
    },
    {
      term: "Outside-In TDD",
      definition:
        "The London School approach: start from the outermost component and work inward, using mocks for inner dependencies that do not exist yet.",
    },
    {
      term: "Inside-Out TDD",
      definition:
        "The Detroit/Chicago School approach: start from the domain model and work outward, using real objects without mocks.",
    },
    {
      term: "TDD Kata",
      definition:
        "A small, repeatable coding exercise used to practice TDD technique, such as the Bowling Game, Roman Numerals, or String Calculator.",
    },
  ],
};
