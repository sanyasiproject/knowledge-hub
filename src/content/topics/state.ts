import type { TopicContent } from "../types";

export const state: TopicContent = {
  quickSummary: [
    "The State pattern allows an object to alter its behavior when its internal state changes, appearing as if the object changed its class.",
    "Each state is encapsulated in its own class implementing a common interface, replacing sprawling if/else or switch chains with polymorphic dispatch.",
    "State transitions are explicit and localized -- either the context or the individual state classes decide what the next state should be.",
    "The pattern is closely related to finite state machines (FSMs) and is ideal when an object's behavior depends heavily on its current mode or phase."
  ],
  detailed: [
    "The State pattern consists of three participants: the Context (the object whose behavior varies), a State interface declaring all state-dependent operations, and ConcreteState classes implementing behavior for each specific state. The Context delegates calls to its current state object, and state transitions are performed by swapping that object.",
    "Unlike a naive if/else approach, adding a new state does not require modifying existing code -- you simply create a new ConcreteState class. This adheres to the Open/Closed Principle and keeps each state's logic cohesive and testable in isolation.",
    "State transitions can be managed in two ways: (1) the Context decides the next state based on return values or events, or (2) each ConcreteState sets the next state on the Context directly. The second approach distributes transition logic but can make the overall flow harder to trace.",
    "Real-world applications include TCP connection management (Listen, SynReceived, Established, Closed), vending machine controllers (Idle, CoinInserted, Dispensing, OutOfStock), UI workflow wizards (each page is a state), and document lifecycle management (Draft, Review, Published, Archived).",
    "The State pattern is often confused with the Strategy pattern. The key difference is intent: Strategy swaps algorithms chosen by the client, while State changes behavior automatically as internal conditions evolve. In State, transitions happen internally; in Strategy, the client picks the algorithm."
  ],
  deepDive: [
    "Finite State Machines (FSMs) formalize the State pattern mathematically. An FSM is defined as a 5-tuple (Q, Sigma, delta, q0, F) where Q is the set of states, Sigma the input alphabet, delta the transition function, q0 the initial state, and F the set of accepting/final states. The State pattern gives an object-oriented realization of delta by dispatching input-handling to the current state object. For more complex scenarios, hierarchical state machines (Harel statecharts) introduce nested states, history states, and orthogonal regions -- libraries like XState bring these concepts to JavaScript/TypeScript.",
    "Thread safety is a critical concern when using the State pattern in concurrent systems. If multiple threads can trigger state transitions simultaneously, you risk the context being in an inconsistent state. Solutions include synchronizing the transition method, using atomic compare-and-swap on the state reference, or employing event-driven architectures where a single thread processes state-changing events sequentially (the actor model approach).",
    "The State pattern can lead to a class explosion if there are many states. Mitigation strategies include using state tables (a data-driven approach where transitions are described in a map rather than classes), combining rarely-used states, or using the Flyweight pattern to share stateless State objects across multiple contexts. In languages with first-class functions (TypeScript, Python), you can use function objects or lambdas instead of full classes for simple states.",
    "Testing state machines effectively requires covering every transition edge, not just every state. Model-based testing tools can generate test cases from a state diagram specification, ensuring that invalid transitions are rejected and that side effects (actions) occur at the right moments. Property-based testing can also verify invariants like 'once in a terminal state, no further transitions are possible.'"
  ],
  code: [
    {
      language: "java",
      caption: "TCP Connection State pattern implementation in Java",
      source: `// State interface
public interface TcpState {
    void open(TcpConnection ctx);
    void close(TcpConnection ctx);
    void acknowledge(TcpConnection ctx);
    void send(TcpConnection ctx, byte[] data);
}

// Context
public class TcpConnection {
    private TcpState state;

    public TcpConnection() {
        this.state = new ClosedState();
    }

    public void setState(TcpState state) {
        System.out.println("Transition: " + this.state.getClass().getSimpleName()
            + " -> " + state.getClass().getSimpleName());
        this.state = state;
    }

    public void open()                { state.open(this); }
    public void close()               { state.close(this); }
    public void acknowledge()         { state.acknowledge(this); }
    public void send(byte[] data)     { state.send(this, data); }
}

// Concrete states
public class ClosedState implements TcpState {
    public void open(TcpConnection ctx) {
        System.out.println("Sending SYN...");
        ctx.setState(new SynSentState());
    }
    public void close(TcpConnection ctx) {
        System.out.println("Already closed.");
    }
    public void acknowledge(TcpConnection ctx) {
        System.out.println("Unexpected ACK in closed state.");
    }
    public void send(TcpConnection ctx, byte[] data) {
        throw new IllegalStateException("Cannot send data on a closed connection.");
    }
}

public class SynSentState implements TcpState {
    public void open(TcpConnection ctx) {
        System.out.println("Already opening...");
    }
    public void close(TcpConnection ctx) {
        System.out.println("Cancelling connection attempt.");
        ctx.setState(new ClosedState());
    }
    public void acknowledge(TcpConnection ctx) {
        System.out.println("SYN-ACK received. Connection established.");
        ctx.setState(new EstablishedState());
    }
    public void send(TcpConnection ctx, byte[] data) {
        throw new IllegalStateException("Connection not yet established.");
    }
}

public class EstablishedState implements TcpState {
    public void open(TcpConnection ctx) {
        System.out.println("Already connected.");
    }
    public void close(TcpConnection ctx) {
        System.out.println("Sending FIN...");
        ctx.setState(new FinWaitState());
    }
    public void acknowledge(TcpConnection ctx) {
        System.out.println("ACK received.");
    }
    public void send(TcpConnection ctx, byte[] data) {
        System.out.println("Sending " + data.length + " bytes.");
    }
}`
    },
    {
      language: "typescript",
      caption: "Vending machine using State pattern in TypeScript",
      source: `interface VendingState {
  insertCoin(machine: VendingMachine): void;
  selectProduct(machine: VendingMachine, product: string): void;
  dispense(machine: VendingMachine): void;
  cancel(machine: VendingMachine): void;
}

class VendingMachine {
  private state: VendingState;
  private balance = 0;
  private selectedProduct: string | null = null;
  private inventory: Map<string, { price: number; qty: number }>;

  constructor() {
    this.state = new IdleState();
    this.inventory = new Map([
      ["cola", { price: 150, qty: 5 }],
      ["chips", { price: 100, qty: 3 }],
      ["water", { price: 75, qty: 10 }],
    ]);
  }

  setState(state: VendingState): void { this.state = state; }
  getBalance(): number { return this.balance; }
  addBalance(amount: number): void { this.balance += amount; }
  resetBalance(): void { this.balance = 0; }
  getSelectedProduct(): string | null { return this.selectedProduct; }
  setSelectedProduct(p: string | null): void { this.selectedProduct = p; }
  getInventory() { return this.inventory; }

  // Public API delegates to state
  insertCoin(): void { this.state.insertCoin(this); }
  selectProduct(p: string): void { this.state.selectProduct(this, p); }
  dispense(): void { this.state.dispense(this); }
  cancel(): void { this.state.cancel(this); }
}

class IdleState implements VendingState {
  insertCoin(machine: VendingMachine): void {
    machine.addBalance(25); // each coin is 25 cents
    console.log(\`Coin inserted. Balance: \${machine.getBalance()}\`);
    machine.setState(new HasMoneyState());
  }
  selectProduct(_m: VendingMachine, _p: string): void {
    console.log("Insert coins first.");
  }
  dispense(_m: VendingMachine): void {
    console.log("Insert coins and select a product.");
  }
  cancel(_m: VendingMachine): void {
    console.log("Nothing to cancel.");
  }
}

class HasMoneyState implements VendingState {
  insertCoin(machine: VendingMachine): void {
    machine.addBalance(25);
    console.log(\`Coin inserted. Balance: \${machine.getBalance()}\`);
  }
  selectProduct(machine: VendingMachine, product: string): void {
    const item = machine.getInventory().get(product);
    if (!item || item.qty === 0) {
      console.log(\`\${product} is out of stock.\`);
      return;
    }
    if (machine.getBalance() < item.price) {
      console.log(\`Insufficient funds. \${product} costs \${item.price}, balance is \${machine.getBalance()}.\`);
      return;
    }
    machine.setSelectedProduct(product);
    machine.setState(new DispensingState());
    machine.dispense();
  }
  dispense(_m: VendingMachine): void {
    console.log("Select a product first.");
  }
  cancel(machine: VendingMachine): void {
    console.log(\`Returning \${machine.getBalance()} cents.\`);
    machine.resetBalance();
    machine.setState(new IdleState());
  }
}

class DispensingState implements VendingState {
  insertCoin(_m: VendingMachine): void {
    console.log("Please wait, dispensing in progress.");
  }
  selectProduct(_m: VendingMachine, _p: string): void {
    console.log("Please wait, dispensing in progress.");
  }
  dispense(machine: VendingMachine): void {
    const product = machine.getSelectedProduct()!;
    const item = machine.getInventory().get(product)!;
    item.qty--;
    machine.addBalance(-item.price);
    console.log(\`Dispensing \${product}.\`);
    if (machine.getBalance() > 0) {
      console.log(\`Returning change: \${machine.getBalance()} cents.\`);
    }
    machine.resetBalance();
    machine.setSelectedProduct(null);
    machine.setState(new IdleState());
  }
  cancel(_m: VendingMachine): void {
    console.log("Cannot cancel during dispensing.");
  }
}`
    },
    {
      language: "cpp",
      caption: "State pattern with C++ enum-based state machine (data-driven approach)",
      source: `#include <iostream>
#include <string>
#include <map>
#include <functional>
#include <stdexcept>
#include <utility>

enum class OrderStatus { PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED };

const char* status_name(OrderStatus s) {
    switch (s) {
        case OrderStatus::PENDING:   return "PENDING";
        case OrderStatus::CONFIRMED: return "CONFIRMED";
        case OrderStatus::SHIPPED:   return "SHIPPED";
        case OrderStatus::DELIVERED: return "DELIVERED";
        case OrderStatus::CANCELLED: return "CANCELLED";
    }
    return "UNKNOWN";
}

// Transition key: (current_state, action)
using TransitionKey = std::pair<OrderStatus, std::string>;

struct TransitionKeyHash {
    size_t operator()(const TransitionKey& k) const {
        return std::hash<int>()(static_cast<int>(k.first))
             ^ (std::hash<std::string>()(k.second) << 1);
    }
};

class Order {
    std::string id_;
    OrderStatus status_ = OrderStatus::PENDING;

    // Transition table: (current_state, action) -> (next_state, side_effect)
    using TransitionMap = std::map<TransitionKey, std::pair<OrderStatus, std::function<void()>>>;
    TransitionMap transitions_;

    void build_transitions() {
        transitions_[{OrderStatus::PENDING, "confirm"}]  = {OrderStatus::CONFIRMED, [this]{ on_confirm(); }};
        transitions_[{OrderStatus::PENDING, "cancel"}]   = {OrderStatus::CANCELLED, [this]{ on_cancel(); }};
        transitions_[{OrderStatus::CONFIRMED, "ship"}]   = {OrderStatus::SHIPPED,   [this]{ on_ship(); }};
        transitions_[{OrderStatus::CONFIRMED, "cancel"}] = {OrderStatus::CANCELLED, [this]{ on_cancel(); }};
        transitions_[{OrderStatus::SHIPPED, "deliver"}]  = {OrderStatus::DELIVERED,  [this]{ on_deliver(); }};
    }

    void on_confirm() { std::cout << "  -> Sending confirmation email for order " << id_ << "\\n"; }
    void on_ship()    { std::cout << "  -> Generating tracking number for order " << id_ << "\\n"; }
    void on_deliver() { std::cout << "  -> Recording delivery timestamp for order " << id_ << "\\n"; }
    void on_cancel()  { std::cout << "  -> Processing refund for order " << id_ << "\\n"; }

public:
    explicit Order(std::string id) : id_(std::move(id)) {
        build_transitions();
    }

    void apply(const std::string& action) {
        TransitionKey key{status_, action};
        auto it = transitions_.find(key);
        if (it == transitions_.end()) {
            throw std::invalid_argument(
                "Invalid action '" + action + "' for order in state '"
                + status_name(status_) + "'");
        }
        auto& [next_status, side_effect] = it->second;
        std::cout << "Order " << id_ << ": " << status_name(status_)
                  << " --[" << action << "]--> " << status_name(next_status) << "\\n";
        status_ = next_status;
        if (side_effect) side_effect();
    }
};

// Usage
int main() {
    Order order("ORD-42");
    order.apply("confirm");   // PENDING -> CONFIRMED
    order.apply("ship");      // CONFIRMED -> SHIPPED
    order.apply("deliver");   // SHIPPED -> DELIVERED
    // order.apply("cancel"); // throws invalid_argument -- cannot cancel delivered order
}`
    }
  ],
  diagrams: [
    {
      title: "State Pattern Class Diagram",
      kind: "architecture",
      caption: "Context delegates to the current State object. Each ConcreteState implements the full State interface and may trigger transitions on the Context."
    },
    {
      title: "TCP Connection State Machine",
      kind: "state",
      caption: "Shows the states (Closed, SynSent, Established, FinWait) and transitions triggered by open, acknowledge, close events."
    }
  ],
  animations: [
    {
      title: "Vending Machine State Transitions",
      steps: [
        { label: "Idle", detail: "Machine awaits coin insertion. Display shows 'Insert Coin'. No product can be selected." },
        { label: "Coin Inserted", detail: "User inserts a coin. Balance increments by coin value. Machine transitions to HasMoney state. Display shows current balance." },
        { label: "Product Selected", detail: "User presses a product button. Machine checks if balance >= price and product is in stock. If yes, transitions to Dispensing." },
        { label: "Dispensing", detail: "Machine physically releases the product. Deducts price from balance. All other inputs are blocked during this phase." },
        { label: "Return Change", detail: "If remaining balance > 0, coins are returned. Balance resets to zero. Machine transitions back to Idle state." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "State Pattern", "Strategy Pattern", "If/Else Chains"],
    rows: [
      ["Intent", "Object changes behavior as internal state evolves", "Client chooses an interchangeable algorithm", "Inline conditional branching"],
      ["Who decides transitions", "State objects or context internally", "Client code explicitly", "Conditions evaluated at each branch"],
      ["Adding new behavior", "Add a new ConcreteState class (OCP)", "Add a new Strategy class (OCP)", "Modify existing conditionals (violates OCP)"],
      ["Encapsulation", "Each state encapsulated in its own class", "Each algorithm encapsulated in its own class", "All logic in one method/class"],
      ["Testability", "Each state tested independently", "Each strategy tested independently", "Requires testing all branches together"],
      ["Complexity", "More classes but clearer separation", "More classes but clearer separation", "Fewer classes but growing complexity"],
      ["State awareness", "States know about each other (transitions)", "Strategies are independent of each other", "N/A -- no state objects"]
    ]
  },
  interviewQA: [
    {
      q: "What is the State pattern and when should you use it?",
      a: "The State pattern encapsulates state-dependent behavior into separate classes that share a common interface. The context object delegates operations to its current state object. Use it when an object's behavior varies significantly across discrete states and transitions between them are well-defined -- for example, a TCP connection, a vending machine, or a document workflow. It eliminates complex conditional logic that checks the current state before every operation.",
      followUps: [
        "How does the State pattern relate to finite state machines?",
        "What happens if the number of states grows very large?",
        "Can you combine the State pattern with the Observer pattern to notify listeners of transitions?"
      ]
    },
    {
      q: "How does the State pattern differ from the Strategy pattern?",
      a: "Both patterns use composition and polymorphism to delegate behavior to an encapsulated object. The difference is intent and lifecycle: Strategy lets the client choose an algorithm externally and the choice is typically stable for the operation's duration. State changes its behavior object internally as the context's state evolves -- the client doesn't directly choose the state. Additionally, State objects often know about and trigger transitions to other states, while Strategy objects are independent of each other.",
      followUps: [
        "Can a single class act as both a State and a Strategy in different contexts?",
        "Is the Flyweight pattern applicable to State objects?"
      ]
    },
    {
      q: "Who should be responsible for state transitions -- the context or the state objects?",
      a: "Both approaches are valid. When the context manages transitions, you get a centralized view of the state machine -- easier to understand the overall flow but the context must know about all states. When state objects manage transitions, the logic is more distributed and each state is self-contained, but tracing the full flow requires examining multiple classes. A hybrid approach uses a transition table in the context while letting states trigger transitions by key/event rather than by directly creating the next state object.",
      followUps: [
        "How do you prevent invalid state transitions?",
        "How would you implement a transition table approach?"
      ]
    },
    {
      q: "How do you handle shared data between states?",
      a: "Shared data lives in the context object. State objects receive the context as a parameter (or hold a reference to it) and read/write shared data through the context's interface. This keeps states stateless or nearly stateless, making them easier to test and potentially shareable via the Flyweight pattern. Avoid storing per-context data in state objects unless you guarantee each context has its own state instances.",
      followUps: [
        "What if different states need different data?",
        "How does this affect thread safety?"
      ]
    },
    {
      q: "How do you test a State pattern implementation?",
      a: "Test at two levels: (1) Unit test each ConcreteState in isolation by creating it, calling its methods with a mock or real context, and asserting both the behavior and the resulting state transition. (2) Integration test the full state machine by driving the context through sequences of events and asserting the expected final state and side effects. Pay special attention to edge cases like invalid transitions, re-entrant calls, and concurrent access. Model-based testing tools can generate transition coverage from a state diagram specification.",
      followUps: [
        "How do you ensure full transition coverage?",
        "What tools support model-based testing of state machines?"
      ]
    },
    {
      q: "What are the drawbacks of the State pattern?",
      a: "The main drawback is class explosion: each state requires its own class, which can be burdensome for machines with many states. There is also the risk of tight coupling between state classes if they directly instantiate each other. The pattern can be over-engineering for simple scenarios with just 2-3 states and few transitions. Finally, the overall flow is harder to see at a glance compared to a single method with conditionals -- you need to examine multiple classes to understand the full state machine.",
      followUps: [
        "When is it better to use a simple enum and switch statement?",
        "How do data-driven state tables compare?"
      ]
    }
  ],
  followUps: [
    "How does the State pattern integrate with event-driven architectures?",
    "What is the relationship between the State pattern and the Actor model?",
    "How do hierarchical state machines (statecharts) extend the basic State pattern?",
    "When should you prefer a data-driven state table over the State pattern?",
    "How do libraries like XState implement statecharts in JavaScript?",
    "How can you persist and restore state machine state across application restarts?"
  ],
  mcqs: [
    {
      q: "In the State pattern, what is the primary role of the Context class?",
      options: [
        "It implements all state-specific behavior directly",
        "It maintains a reference to the current state and delegates behavior to it",
        "It defines the interface for all concrete states",
        "It manages the creation and lifecycle of all state objects"
      ],
      answerIndex: 1,
      explanation: "The Context holds a reference to the current ConcreteState object and delegates all state-dependent calls to it. It does not implement the behavior itself."
    },
    {
      q: "How does the State pattern differ from using a large switch/case statement?",
      options: [
        "The State pattern is slower due to polymorphic dispatch",
        "Switch/case is more extensible when adding new states",
        "The State pattern encapsulates each state's behavior in its own class, following OCP",
        "There is no meaningful difference; both are equivalent"
      ],
      answerIndex: 2,
      explanation: "The State pattern adheres to the Open/Closed Principle -- adding a new state means adding a new class, not modifying existing switch/case blocks."
    },
    {
      q: "Which pattern is most commonly confused with the State pattern?",
      options: [
        "Observer",
        "Strategy",
        "Command",
        "Template Method"
      ],
      answerIndex: 1,
      explanation: "Strategy and State have very similar structures (context + interface + concrete implementations). The difference lies in intent: Strategy is chosen by the client; State transitions happen internally."
    },
    {
      q: "In the State pattern, if ConcreteState objects manage transitions themselves, what is a key disadvantage?",
      options: [
        "It violates the Liskov Substitution Principle",
        "The overall state machine flow is distributed across multiple classes, making it harder to trace",
        "It prevents the use of the Flyweight pattern",
        "It makes the Context class unnecessary"
      ],
      answerIndex: 1,
      explanation: "When each state decides the next state, you must read multiple classes to understand the full transition graph. Centralized transition management offers better visibility."
    },
    {
      q: "What is a Harel statechart?",
      options: [
        "A chart showing performance metrics of state machines",
        "A flat state machine with no transitions",
        "An extension of FSMs supporting nested states, history, and parallel regions",
        "A UML-specific diagram unrelated to the State pattern"
      ],
      answerIndex: 2,
      explanation: "Harel statecharts extend traditional FSMs with hierarchical (nested) states, history pseudo-states, and orthogonal (parallel) regions, making complex state machines more manageable."
    },
    {
      q: "Which design principle does the State pattern most directly support?",
      options: [
        "Single Responsibility Principle",
        "Open/Closed Principle",
        "Dependency Inversion Principle",
        "Both SRP and OCP"
      ],
      answerIndex: 3,
      explanation: "Each state class has a single responsibility (behavior for that state -- SRP), and new states can be added without modifying existing code (OCP)."
    }
  ],
  exercises: [
    "Implement a document workflow state machine with states Draft, InReview, Approved, Published, and Archived. Include actions like submit(), approve(), reject(), publish(), and archive(). Handle invalid transitions by throwing descriptive errors.",
    "Extend the vending machine example to support multiple coin denominations (5, 10, 25 cents) and a maintenance state that can only be entered/exited by an admin action.",
    "Build a traffic light controller using the State pattern where each state (Red, Green, Yellow) has a configurable duration and transitions automatically after its timer expires. Add a FlashingRed emergency state.",
    "Refactor a media player class that uses if/else chains for play(), pause(), stop(), and fastForward() into the State pattern with states Stopped, Playing, Paused, and FastForwarding.",
    "Implement a state machine for an HTTP request lifecycle (Idle, Connecting, SendingHeaders, SendingBody, AwaitingResponse, ReadingResponse, Complete, Error) and write comprehensive tests covering all valid and invalid transitions."
  ],
  flashcards: [
    { front: "What are the three participants in the State pattern?", back: "Context (the object whose behavior varies), State interface (declares state-dependent operations), and ConcreteState classes (implement behavior for each state)." },
    { front: "What is the key structural difference between State and Strategy?", back: "In State, transitions happen internally and states may know about each other. In Strategy, the client chooses the algorithm externally and strategies are independent." },
    { front: "What is a finite state machine (FSM)?", back: "A mathematical model defined by a set of states, input alphabet, transition function, initial state, and set of accepting states. The State pattern is an OO realization of the transition function." },
    { front: "What is a Harel statechart?", back: "An extension of FSMs that supports nested (hierarchical) states, history pseudo-states, and orthogonal (parallel) regions for managing complex state machines." },
    { front: "How do you handle thread safety in the State pattern?", back: "Synchronize the transition method, use atomic compare-and-swap on the state reference, or process state-changing events sequentially in a single-threaded event loop." },
    { front: "When should you prefer a state table over the State pattern?", back: "When states have simple, uniform behavior and the primary concern is defining which transitions are valid. State tables are data-driven and avoid class explosion." },
    { front: "What is the class explosion problem in the State pattern?", back: "Each state requires its own class. For machines with many states, this creates a large number of small classes that can be hard to navigate. Mitigation: use state tables, function objects, or merge trivial states." }
  ],
  revisionNotes: [
    "The State pattern replaces conditional state-checking logic with polymorphic dispatch to encapsulated state objects.",
    "Context delegates to its current state object and exposes a setState() method for transitions.",
    "Transitions can be managed by the Context (centralized) or by ConcreteState objects (distributed).",
    "State vs Strategy: same structure, different intent. State transitions internally; Strategy is chosen externally.",
    "Finite state machines formalize the concept: states + inputs + transitions + initial state + final states.",
    "Statecharts extend FSMs with nesting, history, and parallelism for complex real-world scenarios.",
    "The pattern supports OCP (add states without modifying existing code) and SRP (each state handles its own behavior).",
    "Thread safety requires synchronization or single-threaded event processing for state transitions.",
    "Testing should cover every transition edge, not just every state, including invalid transition attempts."
  ],
  cheatSheet: [
    "Context holds a State reference and delegates all state-dependent methods to it.",
    "State interface declares every method the Context needs to delegate.",
    "Each ConcreteState implements the full State interface for one specific state.",
    "Transitions: call context.setState(new NextState()) from the current state or the context itself.",
    "Use state tables (Map<(State, Event), NextState>) for data-driven approaches without class explosion.",
    "State objects should be stateless if possible -- store shared data in the Context.",
    "Guard against invalid transitions by throwing exceptions or returning error results.",
    "Consider Flyweight for sharing stateless State instances across multiple contexts."
  ],
  resources: [
    { label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)", kind: "book", note: "Chapter on State pattern -- the original and authoritative description." },
    { label: "Refactoring.Guru -- State Pattern", kind: "article", note: "Visual explanation with code examples in multiple languages." },
    { label: "XState Documentation", kind: "docs", note: "Modern JavaScript/TypeScript library implementing statecharts with visualization tools." },
    { label: "Head First Design Patterns", kind: "book", note: "Approachable coverage of State pattern with a gumball machine example." },
    { label: "Statecharts: A Visual Formalism for Complex Systems (David Harel, 1987)", kind: "paper", note: "The foundational paper on hierarchical state machines." }
  ],
  glossary: [
    { term: "Context", definition: "The object whose behavior varies based on its internal state. It holds a reference to the current State object and delegates operations to it." },
    { term: "State Interface", definition: "An interface or abstract class declaring all state-dependent operations that ConcreteState classes must implement." },
    { term: "ConcreteState", definition: "A class implementing the State interface with behavior specific to one particular state of the Context." },
    { term: "Finite State Machine (FSM)", definition: "A mathematical model of computation with a finite number of states, transitions between them triggered by inputs, and defined initial/final states." },
    { term: "Statechart (Harel)", definition: "An extension of FSMs supporting nested states, history pseudo-states, and orthogonal regions for modeling complex reactive systems." },
    { term: "Transition", definition: "The movement from one state to another, triggered by an event or condition, potentially accompanied by an action/side effect." },
    { term: "Guard Condition", definition: "A boolean predicate that must be true for a transition to fire, enabling conditional state changes beyond just the triggering event." },
    { term: "State Table", definition: "A data-driven alternative to the State pattern where transitions are described as entries in a lookup table mapping (state, event) pairs to next states and actions." }
  ]
};
