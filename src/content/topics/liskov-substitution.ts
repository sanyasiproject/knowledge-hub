import type { TopicContent } from "../types";

export const liskovSubstitution: TopicContent = {
  quickSummary: [
    "If S is a subtype of T, then objects of type T can be replaced with objects of type S without altering the correctness of the program.",
    "LSP goes beyond type compatibility -- subtypes must honor the behavioral contract (preconditions, postconditions, invariants) of the supertype.",
    "The classic violation is the Rectangle/Square problem: Square restricts Rectangle's independent width/height setting, breaking client expectations.",
    "LSP violations lead to fragile code where clients must check the concrete type to avoid errors, defeating the purpose of polymorphism."
  ],
  detailed: [
    "Barbara Liskov formalized the principle in 1987: 'If for each object o1 of type S there is an object o2 of type T such that for all programs P defined in terms of T, the behavior of P is unchanged when o1 is substituted for o2, then S is a subtype of T.' This is behavioral subtyping, not just structural compatibility.",
    "LSP is enforced through contract rules: (1) Preconditions cannot be strengthened in a subtype -- if the base accepts any positive number, the subtype cannot restrict to only even numbers. (2) Postconditions cannot be weakened -- if the base guarantees a sorted result, the subtype must also guarantee it. (3) Invariants of the base type must be preserved by the subtype.",
    "The Rectangle/Square problem illustrates LSP perfectly. Mathematically, a square is a rectangle. But in OOP, if Rectangle has independent setWidth() and setHeight() methods, Square cannot honor both independently (setting width must also set height). A client testing a Rectangle expects setWidth(5) followed by setHeight(10) to yield area 50, but a Square would yield 100. The substitution breaks program correctness.",
    "Covariance and contravariance relate to LSP in method signatures. Return types can be covariant (more specific in the subtype) because a more specific return still satisfies the base contract. Parameter types should be contravariant (more general in the subtype) because accepting a broader input is safe. Java enforces covariant return types but does not support contravariant parameters -- it uses overloading instead.",
    "LSP violations often surface as: instanceof/typeof checks before calling methods, unexpected exceptions thrown by subtypes, silent behavior changes when substituting implementations, and 'not supported' methods that throw UnsupportedOperationException. These are symptoms of a broken type hierarchy."
  ],
  deepDive: [
    "Design by Contract (DbC), formalized by Bertrand Meyer, provides the rigorous framework for LSP. Each method has a precondition (what must be true before the call), a postcondition (what the method guarantees after the call), and class invariants (what is always true about the object's state). LSP requires: subtype preconditions <= supertype preconditions (same or weaker), subtype postconditions >= supertype postconditions (same or stronger), and subtype preserves all supertype invariants.",
    "The history list constraint (Liskov and Wing, 1994) adds a temporal dimension: the subtype should not allow state changes that the supertype's specification would forbid. For example, if a base ImmutableList guarantees that its elements never change, a MutableList subtype that allows modification violates LSP even if it implements all the same methods, because clients depending on immutability would be broken.",
    "LSP has deep implications for exception handling. If a base method declares it throws IOException, a subtype method can throw FileNotFoundException (a subclass of IOException -- covariant exception) but should not throw a broader Exception or a completely unrelated exception. Throwing new, unexpected exceptions strengthens the precondition implicitly (callers must handle more cases).",
    "In practice, LSP violations often stem from modeling 'is-a' relationships based on real-world taxonomy rather than behavioral contracts. A penguin 'is a' bird, but if the Bird class has a fly() method, Penguin cannot implement it correctly. The fix is to model based on capability (Flyable interface) rather than taxonomy, or to ensure the base class's contract does not promise flight."
  ],
  code: [
    {
      language: "java",
      caption: "Classic LSP violation: Rectangle/Square problem",
      source: `// Base class with independent width and height
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) {
        this.width = width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public int getArea() { return width * height; }
}

// LSP VIOLATION: Square constrains Rectangle's behavior
public class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // forces height = width, breaking independence
    }

    @Override
    public void setHeight(int height) {
        this.width = height;
        this.height = height; // forces width = height
    }
}

// Client code that works with Rectangle but breaks with Square
public class AreaCalculatorTest {
    // This test passes for Rectangle but FAILS for Square
    public static void testRectangleArea(Rectangle rect) {
        rect.setWidth(5);
        rect.setHeight(10);
        assert rect.getArea() == 50 :
            "Expected area 50 but got " + rect.getArea();
        // Square yields 100 because setHeight(10) also sets width to 10
    }

    public static void main(String[] args) {
        testRectangleArea(new Rectangle()); // passes
        testRectangleArea(new Square());    // FAILS -- LSP violated
    }
}`
    },
    {
      language: "java",
      caption: "LSP-compliant design: use immutable shapes or separate interfaces",
      source: `// Solution 1: Immutable shapes -- no setters, no behavioral mismatch
public abstract class Shape {
    public abstract int getArea();
}

public class Rectangle extends Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() { return width; }
    public int getHeight() { return height; }

    @Override
    public int getArea() { return width * height; }

    public Rectangle withWidth(int newWidth) {
        return new Rectangle(newWidth, this.height);
    }

    public Rectangle withHeight(int newHeight) {
        return new Rectangle(this.width, newHeight);
    }
}

public class Square extends Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    public int getSide() { return side; }

    @Override
    public int getArea() { return side * side; }

    public Square withSide(int newSide) {
        return new Square(newSide);
    }
}

// Solution 2: Program to capabilities, not taxonomy
public interface Measurable {
    int getArea();
    int getPerimeter();
}

public interface Resizable {
    Resizable resize(double factor);
}

// Both Rectangle and Square implement Measurable
// Only Rectangle implements independently resizable dimensions
// No inheritance relationship that creates behavioral conflicts`
    },
    {
      language: "typescript",
      caption: "LSP violation and fix: Bird/Penguin problem",
      source: `// VIOLATION: Not all birds can fly
interface Bird {
  fly(): void;
  eat(): void;
  makeSound(): string;
}

class Sparrow implements Bird {
  fly(): void { console.log("Sparrow flying"); }
  eat(): void { console.log("Sparrow eating seeds"); }
  makeSound(): string { return "Chirp!"; }
}

class Penguin implements Bird {
  fly(): void {
    // LSP VIOLATION: throws where base contract promises flight
    throw new Error("Penguins cannot fly!");
  }
  eat(): void { console.log("Penguin eating fish"); }
  makeSound(): string { return "Squawk!"; }
}

// Client code breaks when substituting Penguin for Bird
function migrateBirds(birds: Bird[]): void {
  birds.forEach(bird => bird.fly()); // crashes on Penguin
}

// FIX: Segregate capabilities into focused interfaces
interface Animal {
  eat(): void;
  makeSound(): string;
}

interface Flyable {
  fly(): void;
  getMaxAltitude(): number;
}

interface Swimmable {
  swim(): void;
  getMaxDepth(): number;
}

class FixedSparrow implements Animal, Flyable {
  eat(): void { console.log("Eating seeds"); }
  makeSound(): string { return "Chirp!"; }
  fly(): void { console.log("Flying"); }
  getMaxAltitude(): number { return 3000; }
}

class FixedPenguin implements Animal, Swimmable {
  eat(): void { console.log("Eating fish"); }
  makeSound(): string { return "Squawk!"; }
  swim(): void { console.log("Swimming"); }
  getMaxDepth(): number { return 500; }
}

// Client code now works correctly -- only expects what the type promises
function migrateFlyingAnimals(flyers: Flyable[]): void {
  flyers.forEach(f => f.fly()); // type-safe, no surprises
}`
    }
  ],
  diagrams: [
    {
      title: "LSP Contract Rules",
      kind: "architecture",
      caption: "Shows the three contract rules: preconditions can only be weakened (same or more permissive), postconditions can only be strengthened (same or more restrictive), and invariants must be preserved."
    },
    {
      title: "Covariance and Contravariance in LSP",
      kind: "flow",
      caption: "Return types are covariant (subtype can return more specific type). Parameter types are contravariant (subtype should accept more general types). This preserves substitutability."
    }
  ],
  animations: [
    {
      title: "Rectangle/Square Substitution Failure",
      steps: [
        { label: "Client receives Rectangle", detail: "A function accepts a Rectangle parameter. It expects independent width and height control." },
        { label: "Client sets width to 5", detail: "Calls setWidth(5). For Rectangle, width=5, height unchanged. For Square, width=5, height=5." },
        { label: "Client sets height to 10", detail: "Calls setHeight(10). For Rectangle, width=5, height=10. For Square, width=10, height=10." },
        { label: "Client checks area", detail: "Expects getArea() == 50 (5 * 10). Rectangle returns 50 (correct). Square returns 100 (10 * 10) -- WRONG." },
        { label: "LSP violated", detail: "The program's correctness changes when Square is substituted for Rectangle. The subtype broke the supertype's behavioral contract." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "LSP Compliant", "LSP Violation"],
    rows: [
      ["Substitutability", "Subtype can replace supertype anywhere without errors", "Substitution causes incorrect behavior or exceptions"],
      ["Preconditions", "Same or weaker than supertype (accepts same or more inputs)", "Stronger than supertype (rejects valid inputs)"],
      ["Postconditions", "Same or stronger than supertype (guarantees same or more)", "Weaker than supertype (guarantees less)"],
      ["Invariants", "All supertype invariants preserved", "Some invariants violated by subtype"],
      ["Client code", "Works with abstraction, no type checks needed", "Requires instanceof checks to avoid breakage"],
      ["Exception behavior", "Throws same or narrower exceptions", "Throws unexpected or broader exceptions"],
      ["Design approach", "Model based on behavior and capability", "Model based on real-world taxonomy (is-a)"]
    ]
  },
  interviewQA: [
    {
      q: "What is the Liskov Substitution Principle?",
      a: "LSP states that objects of a supertype should be replaceable with objects of a subtype without altering the correctness of the program. It is not just about type compatibility -- the subtype must honor the behavioral contract of the supertype, including preconditions, postconditions, and invariants. If client code works correctly with the base type, it must also work correctly with any subtype.",
      followUps: [
        "Who is Barbara Liskov and when was LSP formulated?",
        "How does LSP differ from simple polymorphism?"
      ]
    },
    {
      q: "Explain the Rectangle/Square problem.",
      a: "Mathematically, a square is a rectangle. But in OOP, if Rectangle has independent setWidth() and setHeight() methods, Square cannot honor this contract -- setting one dimension must also set the other. A client expecting setWidth(5) + setHeight(10) = area 50 gets area 100 with a Square. The fix is to avoid mutable shared setters: use immutable shapes, or don't create an inheritance relationship between Rectangle and Square.",
      followUps: [
        "How would you redesign this hierarchy?",
        "Is the issue specific to mutability?"
      ]
    },
    {
      q: "What are preconditions and postconditions in the context of LSP?",
      a: "Preconditions are what must be true before a method call (what the method requires). Postconditions are what the method guarantees after execution (what the caller can expect). LSP requires: subtypes cannot strengthen preconditions (they must accept at least everything the supertype accepts) and cannot weaken postconditions (they must guarantee at least everything the supertype guarantees). Violating these rules means a subtype cannot safely substitute for the supertype.",
      followUps: [
        "What are invariants and how do they relate to LSP?",
        "Give an example of a strengthened precondition."
      ]
    },
    {
      q: "How does LSP relate to covariance and contravariance?",
      a: "Covariance means a subtype's method can return a more specific type (narrowing the return). This is safe because a more specific return still satisfies the base contract. Contravariance means a subtype's method could accept a more general parameter type (widening the input). This is safe because accepting more inputs only weakens the precondition. Java supports covariant return types natively. These rules ensure that substitutability is preserved through method signatures.",
      followUps: [
        "Why doesn't Java support contravariant parameter types?",
        "How do generics wildcards relate to variance?"
      ]
    },
    {
      q: "What are common signs of LSP violations in code?",
      a: "Signs include: (1) instanceof/typeof checks before calling methods on a base type. (2) Methods that throw UnsupportedOperationException or NotImplementedException. (3) Empty method implementations in subtypes. (4) Comments like 'this method does nothing for this subtype.' (5) Client code that behaves differently based on which subtype it receives. (6) Unit tests that pass for the base type but fail for a subtype.",
      followUps: [
        "How do you fix an LSP violation once you find one?",
        "Is it ever acceptable to throw UnsupportedOperationException?"
      ]
    },
    {
      q: "How does LSP relate to the other SOLID principles?",
      a: "LSP protects the OCP: if subtypes are not substitutable, clients cannot rely on abstractions and must check concrete types, defeating polymorphism. ISP helps prevent LSP violations by keeping interfaces small -- a class is less likely to have unsupportable methods. DIP encourages depending on abstractions, which only works if LSP ensures those abstractions are trustworthy.",
      followUps: [
        "Can you follow OCP but violate LSP?",
        "How does ISP prevent LSP violations?"
      ]
    }
  ],
  followUps: [
    "How does Design by Contract (DbC) formalize LSP?",
    "What is the history list constraint in the Liskov-Wing formulation?",
    "How do sealed classes or final methods help enforce LSP?",
    "What is the difference between structural subtyping and behavioral subtyping?",
    "How does LSP apply to generic types and wildcards?",
    "How do you write unit tests that verify LSP compliance?"
  ],
  mcqs: [
    {
      q: "What does LSP require of a subtype's preconditions?",
      options: [
        "They must be stronger than the supertype's",
        "They must be the same as the supertype's",
        "They must be the same or weaker than the supertype's",
        "They can be anything as long as the types match"
      ],
      answerIndex: 2,
      explanation: "A subtype must accept at least everything the supertype accepts. Strengthening preconditions would reject inputs the supertype allows, breaking substitutability."
    },
    {
      q: "In the Rectangle/Square problem, what specifically violates LSP?",
      options: [
        "Square has fewer methods than Rectangle",
        "Square's setWidth/setHeight have coupled side effects that break Rectangle's independent dimension contract",
        "Square is not a mathematical subtype of Rectangle",
        "Rectangle's area calculation is incorrect"
      ],
      answerIndex: 1,
      explanation: "Rectangle's contract implies independent width and height setting. Square couples them, so setWidth(5) + setHeight(10) yields area 100 instead of the expected 50."
    },
    {
      q: "What is covariant return type?",
      options: [
        "A subtype method returns a more general type than the supertype method",
        "A subtype method returns the exact same type as the supertype method",
        "A subtype method returns a more specific type than the supertype method",
        "A subtype method returns void instead of a value"
      ],
      answerIndex: 2,
      explanation: "Covariant return means the subtype's return type is more specific (a subclass of) the supertype's return type. This is safe because a more specific return still satisfies the base contract."
    },
    {
      q: "Which of these is a common symptom of LSP violation?",
      options: [
        "Using dependency injection",
        "Code that checks instanceof before calling methods on a base type",
        "Having many implementations of an interface",
        "Using the Factory pattern"
      ],
      answerIndex: 1,
      explanation: "If client code must check the concrete type before safely using an object, the subtype is not truly substitutable, indicating an LSP violation."
    },
    {
      q: "How should a subtype handle exceptions according to LSP?",
      options: [
        "It should throw the same exception types or narrower (more specific) subtypes",
        "It should throw broader exception types for safety",
        "It should never throw exceptions",
        "It can throw any exception type regardless of the supertype's contract"
      ],
      answerIndex: 0,
      explanation: "Throwing the same or narrower exceptions preserves the caller's exception handling. Throwing broader or unexpected exceptions strengthens the implicit precondition on callers."
    },
    {
      q: "What is behavioral subtyping?",
      options: [
        "A subtype that has more methods than the supertype",
        "A subtype that implements the same interface",
        "A subtype that preserves the behavioral contract (pre/postconditions, invariants) of the supertype",
        "A subtype that has the same fields as the supertype"
      ],
      answerIndex: 2,
      explanation: "Behavioral subtyping goes beyond structural compatibility. The subtype must honor the supertype's behavioral contract -- preconditions, postconditions, and invariants -- to ensure safe substitution."
    }
  ],
  exercises: [
    "Identify the LSP violation in a Bird class hierarchy where Penguin extends Bird with a fly() method. Refactor using interface segregation (Flyable, Swimmable) so that all subtypes are substitutable for their declared interfaces.",
    "Write a test suite that verifies LSP compliance for a collection hierarchy: ArrayList, LinkedList, and UnmodifiableList all implement List. Which operations, if any, violate LSP?",
    "Design an immutable shape hierarchy (Circle, Rectangle, Square, Triangle) where all shapes implement a Measurable interface. Prove that LSP holds by writing a polymorphic area-summation function that works with any Measurable.",
    "Given a payment processing hierarchy with CreditCardPayment, DebitCardPayment, and CryptoPayment extending Payment, identify potential LSP violations (e.g., CryptoPayment cannot refund). Propose a redesign.",
    "Implement a Stack class and a Queue class. Explain why having Queue extend Stack (or vice versa) would violate LSP, even though both are collections."
  ],
  flashcards: [
    { front: "State LSP in one sentence.", back: "Objects of a supertype should be replaceable with objects of a subtype without altering the correctness of the program." },
    { front: "What is behavioral subtyping?", back: "A subtype that preserves the behavioral contract of the supertype: preconditions cannot be strengthened, postconditions cannot be weakened, and invariants must be preserved." },
    { front: "Why does Square extending Rectangle violate LSP?", back: "Rectangle's contract allows independent width/height setting. Square couples them (setting one changes both), so clients expecting independent dimensions get incorrect results." },
    { front: "What is covariance in return types?", back: "A subtype method can return a more specific type than the supertype method. This is safe because the more specific return still satisfies the base contract." },
    { front: "What is contravariance in parameters?", back: "A subtype method could accept a more general parameter type than the supertype method. This weakens the precondition, which is safe for substitutability." },
    { front: "What is the history list constraint?", back: "A rule from Liskov-Wing (1994): the subtype must not allow state changes that the supertype's specification would forbid. E.g., a mutable list cannot substitute for an immutable list." },
    { front: "Name three symptoms of LSP violation.", back: "1) instanceof checks before method calls. 2) Methods throwing UnsupportedOperationException. 3) Empty/no-op method implementations in subtypes." }
  ],
  revisionNotes: [
    "LSP: subtypes must be substitutable for supertypes without breaking program correctness.",
    "It is about behavioral contracts, not just type/interface compatibility.",
    "Preconditions: cannot be strengthened in subtypes. Postconditions: cannot be weakened.",
    "Invariants of the supertype must be preserved by all subtypes.",
    "Rectangle/Square: classic violation because Square breaks independent dimension control.",
    "Covariant returns (more specific) and contravariant parameters (more general) preserve LSP.",
    "Symptoms: instanceof checks, UnsupportedOperationException, empty method bodies.",
    "Fix violations: use interface segregation, favor composition over inheritance, make types immutable.",
    "LSP protects OCP: if subtypes are not substitutable, polymorphism and abstraction break down."
  ],
  cheatSheet: [
    "Subtype preconditions <= supertype preconditions (same or weaker).",
    "Subtype postconditions >= supertype postconditions (same or stronger).",
    "All supertype invariants must hold in the subtype.",
    "Return types: covariant (more specific) is safe.",
    "Parameter types: contravariant (more general) is safe.",
    "No new exceptions beyond what the supertype declares.",
    "If you need instanceof before calling a method, the hierarchy likely violates LSP.",
    "Model based on behavior/capability, not real-world taxonomy.",
    "Immutable types avoid many LSP pitfalls (no state mutation to break contracts)."
  ],
  resources: [
    { label: "A Behavioral Notion of Subtyping (Liskov & Wing, 1994)", kind: "paper", note: "The foundational paper formalizing behavioral subtyping with the history list constraint." },
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "Chapter 9 covers LSP with practical examples and its role in architecture." },
    { label: "Object-Oriented Software Construction by Bertrand Meyer", kind: "book", note: "Design by Contract formalism that underpins LSP's precondition/postcondition rules." },
    { label: "Refactoring.Guru -- Liskov Substitution Principle", kind: "article", note: "Visual explanation with code examples of violations and fixes." }
  ],
  glossary: [
    { term: "Liskov Substitution Principle (LSP)", definition: "Objects of a supertype must be replaceable with objects of any subtype without altering program correctness." },
    { term: "Behavioral Subtyping", definition: "A subtype that preserves the behavioral contract (preconditions, postconditions, invariants) of the supertype, not just structural compatibility." },
    { term: "Precondition", definition: "A condition that must be true before a method is called. Subtypes cannot strengthen (make more restrictive) the preconditions of inherited methods." },
    { term: "Postcondition", definition: "A condition guaranteed to be true after a method executes. Subtypes cannot weaken (guarantee less than) the postconditions of inherited methods." },
    { term: "Invariant", definition: "A condition that is always true about an object's state throughout its lifetime. Subtypes must preserve all invariants of the supertype." },
    { term: "Covariance", definition: "A subtype relationship that preserves the direction of the original type relationship. Return types are covariant: a subtype method can return a more specific type." },
    { term: "Contravariance", definition: "A subtype relationship that reverses the direction. Parameter types should be contravariant: a subtype method could accept a more general type." },
    { term: "Design by Contract (DbC)", definition: "A methodology where software components define formal contracts (preconditions, postconditions, invariants) that govern their interactions." }
  ]
};
