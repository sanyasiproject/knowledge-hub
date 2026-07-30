import type { TopicContent } from "../types";

export const lldCaseStudies: TopicContent = {
  quickSummary: [
    "The Parking Lot LLD involves modeling Vehicle (Car, Truck, Motorcycle), ParkingSpot (Small, Medium, Large), ParkingLot, Ticket, and PaymentProcessor. Key design decisions include spot allocation strategy, multi-floor support, and handling concurrent entry/exit.",
    "The Elevator System requires modeling Elevator, ElevatorController, Request, Direction, and Floor. The core challenge is the scheduling algorithm: SCAN (elevator sweeps up then down), LOOK (reverses when no more requests in current direction), or destination dispatch (groups passengers by destination).",
    "The Library Management System models Book, Member, Librarian, Loan, Reservation, and Fine. Key considerations include tracking book copies vs. titles, handling reservations when copies are returned, and enforcing borrowing limits.",
    "The Rate Limiter LLD designs classes for different algorithms (TokenBucket, SlidingWindowCounter) behind a RateLimiter interface, with a RuleEngine to map requests to limits and a RateLimitStore for distributed state.",
  ],
  detailed: [
    "## Parking Lot Design\n\nCore classes: `ParkingLot` manages floors and entry/exit points. `ParkingFloor` contains spots. `ParkingSpot` (abstract) with subclasses `SmallSpot`, `MediumSpot`, `LargeSpot`. `Vehicle` (abstract) with subclasses `Car`, `Truck`, `Motorcycle`. `Ticket` records vehicle, spot, entry time. `PaymentProcessor` calculates fees based on duration and vehicle type. Key design decisions: (1) Spot allocation: nearest-to-entrance vs. spread-across-floors. Use a strategy pattern. (2) Vehicle-to-spot mapping: motorcycles fit in any spot, cars in medium/large, trucks only in large. (3) Concurrency: synchronize spot assignment to prevent double-booking. (4) Display board showing available spots per floor and type. The ParkingLot uses a `SpotAllocationStrategy` interface, enabling different algorithms.",
    "## Elevator System Design\n\nCore classes: `Elevator` (current floor, direction, state, door status), `ElevatorController` (dispatches requests to elevators), `Request` (source floor, direction, optional destination), `Floor` (up/down buttons), `Display` (shows current floor and direction). The controller uses a scheduling strategy: **SCAN** moves in one direction until the end, then reverses. **LOOK** reverses when no more requests ahead. **Destination Dispatch** collects destination floors at the lobby and groups passengers into elevators heading the same way, reducing stops. Design considerations: (1) Multiple elevators require a dispatcher to choose which elevator handles a request (nearest, least loaded). (2) Emergency mode overrides normal scheduling. (3) Weight sensor prevents overloading. (4) VIP/priority floors. Use the Observer pattern for display updates and Strategy for scheduling.",
    "## Library Management System\n\nCore classes: `Library` (singleton managing the system), `Book` (ISBN, title, author), `BookCopy` (physical copy with barcode, status: Available/Loaned/Reserved/Lost), `Member` (can borrow and reserve), `Librarian` extends Member with admin privileges, `Loan` (copy, member, issue date, due date, return date), `Reservation` (book, member, expiry), `Fine` (amount, status). Key interactions: (1) Borrowing: member requests a book, system finds available copy, creates Loan, marks copy as Loaned. (2) Returning: system marks copy Available, checks for pending reservations, notifies reserved member, calculates fine if overdue. (3) Reservation: if no copies available, member reserves, gets notified when a copy is returned. Design patterns: Observer for notifications, State for BookCopy status transitions, Strategy for fine calculation.",
    "## Rate Limiter LLD\n\nCore interface: `RateLimiter` with `boolean allowRequest(String clientId)`. Implementations: `TokenBucketLimiter` (bucket fills at fixed rate, each request consumes a token), `SlidingWindowCounterLimiter` (tracks request counts in time windows), `FixedWindowLimiter` (simple counter per time window). `RateLimitRule` defines limit, window, and scope (per user, per IP, per API key). `RuleEngine` maps incoming requests to applicable rules using client ID and endpoint. `RateLimitStore` interface abstracts storage, with `InMemoryStore` for single-node and `RedisStore` for distributed deployments. Key considerations: (1) Atomicity: check-and-decrement must be atomic to avoid race conditions. (2) Multiple rules: a request might be subject to 100/minute per user AND 1000/minute per API. (3) Response headers: include X-RateLimit-Remaining and Retry-After. Use Factory pattern to create the right limiter based on configuration.",
    "## Common Patterns Across Case Studies\n\nSeveral patterns recur across LLD problems: **Strategy** for swappable algorithms (spot allocation, elevator scheduling, fine calculation, rate limiting). **Observer** for notifications and display updates. **State** for objects with well-defined state transitions (parking spot, book copy, elevator). **Factory** for creating the right subclass based on input (vehicle type, limiter type). **Singleton** for system-wide managers (ParkingLot, Library). The key to acing LLD interviews is recognizing which patterns apply, keeping classes focused (SRP), and discussing trade-offs for each design decision.",
  ],
  interviewQA: [
    {
      q: "How would you handle concurrent entry and exit in a parking lot system?",
      a: "Use synchronization at the spot assignment level. When a vehicle enters, acquire a lock on the target spot (or use an atomic compare-and-swap on its status). A ParkingFloor can maintain a ConcurrentHashMap of available spots by type, and assignment uses atomic operations to claim a spot. For high throughput, avoid locking the entire floor; instead, use fine-grained locks per spot or a lock-free data structure. At exit gates, update is simpler since only the ticket holder can release their specific spot. Use transactions if the state is persisted to a database.",
    },
    {
      q: "How would you design an elevator system for a 50-story building with 8 elevators?",
      a: "Use Destination Dispatch: riders enter their destination at the lobby panel, and the system groups them into elevators going to similar floors, reducing stops. Partition elevators into zones (e.g., elevators 1-3 serve floors 1-20, 4-6 serve 20-40, 7-8 are express to 40-50). The ElevatorController uses a scoring function to assign requests: score considers distance to the request floor, current direction, load, and number of pending stops. An event-driven architecture where each elevator publishes state changes and the controller reacts. Add priority handling for emergency and VIP floors.",
    },
    {
      q: "In a library system, how do you handle the scenario where a returned book has multiple reservations?",
      a: "Maintain a priority queue of reservations per book, ordered by reservation timestamp (first-come-first-served). When a copy is returned: (1) mark copy as Reserved (not Available), (2) dequeue the oldest reservation, (3) notify the member they have N days to pick up, (4) if they don't pick up within the window, cancel their reservation, re-enqueue or notify the next person. The BookCopy goes through states: Available -> Loaned -> Reserved -> (picked up) Loaned, or Reserved -> (expired) -> check next reservation or Available. This ensures fairness and prevents indefinite holding.",
    },
    {
      q: "What are the trade-offs between token bucket and sliding window for rate limiting?",
      a: "Token bucket allows bursts up to bucket capacity, which is good for APIs where occasional spikes are acceptable. It's simple to implement and memory-efficient (just a counter and timestamp). Sliding window log tracks exact timestamps of each request, giving precise rate limiting but using more memory (O(n) per client for n requests in the window). Sliding window counter is a hybrid: it divides time into sub-windows and interpolates, offering near-exact limiting with O(1) memory. Choose token bucket for simplicity and burst tolerance, sliding window counter for precision with reasonable memory.",
    },
  ],
  mcqs: [
    {
      q: "In a parking lot LLD, which design pattern best handles different spot allocation strategies?",
      options: [
        "Singleton",
        "Observer",
        "Strategy",
        "Decorator",
      ],
      answerIndex: 2,
      explanation:
        "The Strategy pattern allows swapping between different allocation algorithms (nearest-to-entrance, spread-across-floors, etc.) at runtime without changing the ParkingLot class.",
    },
    {
      q: "In an elevator system, the LOOK algorithm differs from SCAN in that:",
      options: [
        "LOOK only moves up, never down",
        "LOOK reverses direction when there are no more requests ahead, rather than going to the end",
        "LOOK handles multiple elevators while SCAN handles one",
        "LOOK is used only for freight elevators",
      ],
      answerIndex: 1,
      explanation:
        "SCAN always travels to the end of the range before reversing. LOOK optimizes by reversing as soon as there are no pending requests in the current direction, avoiding unnecessary travel.",
    },
    {
      q: "In a library system, which class relationship best describes Book and BookCopy?",
      options: [
        "Inheritance: BookCopy extends Book",
        "Composition: Book contains BookCopies",
        "Association: BookCopy references Book",
        "Aggregation: BookCopy aggregates Book",
      ],
      answerIndex: 1,
      explanation:
        "A Book (title/ISBN/author) contains multiple BookCopies (physical copies with barcodes). Copies don't exist without their Book definition, making it composition. Each copy references its parent book.",
    },
    {
      q: "Why must the check-and-decrement operation in a distributed rate limiter be atomic?",
      options: [
        "To improve performance through batching",
        "To prevent multiple requests from passing the limit simultaneously",
        "To reduce network round trips",
        "To enable horizontal scaling",
      ],
      answerIndex: 1,
      explanation:
        "Without atomicity, two concurrent requests could both read the counter as 1 remaining, both pass the check, and both decrement, allowing 2 requests when only 1 should pass. Atomic operations (like Redis MULTI/EXEC or Lua scripts) prevent this race condition.",
    },
  ],
  flashcards: [
    {
      front: "What are the key classes in a Parking Lot LLD?",
      back: "ParkingLot, ParkingFloor, ParkingSpot (Small/Medium/Large), Vehicle (Car/Truck/Motorcycle), Ticket (vehicle, spot, entry time), PaymentProcessor, DisplayBoard, EntryGate, ExitGate, SpotAllocationStrategy.",
    },
    {
      front: "What are the three main elevator scheduling algorithms?",
      back: "SCAN: sweep to the end in one direction, then reverse. LOOK: reverse when no more requests in current direction (optimized SCAN). Destination Dispatch: collect destinations at lobby, group passengers going to similar floors into the same elevator.",
    },
    {
      front: "What is the difference between Book and BookCopy in a library system?",
      back: "Book represents metadata (ISBN, title, author, subject). BookCopy represents a physical copy (barcode, condition, status: Available/Loaned/Reserved/Lost). One Book can have many BookCopies. Borrowing operates on copies, searching operates on books.",
    },
    {
      front: "What state transitions does a BookCopy go through?",
      back: "Available -> Loaned (when borrowed) -> Available (when returned, no reservations) or Reserved (when returned, reservation exists) -> Loaned (when reserved member picks up). Any state -> Lost (when reported lost). Lost -> Available (when found/replaced).",
    },
    {
      front: "How does a Token Bucket rate limiter work?",
      back: "A bucket holds tokens up to a maximum capacity. Tokens are added at a fixed refill rate. Each request consumes one token. If the bucket is empty, the request is rejected. The bucket allows bursts up to its capacity. State: token count + last refill timestamp.",
    },
    {
      front: "What recurring design patterns appear in LLD case studies?",
      back: "Strategy: swappable algorithms. Observer: notifications/updates. State: well-defined state machines. Factory: creating correct subclass from input. Singleton: system-wide managers. Template Method: common workflow with customizable steps.",
    },
    {
      front: "How do you handle vehicle-to-spot mapping in a parking lot?",
      back: "Define a compatibility matrix: Motorcycle fits Small/Medium/Large. Car fits Medium/Large. Truck/Bus fits Large only. Prefer the smallest compatible spot to maximize utilization. This can be encoded in the Vehicle subclass or in the allocation strategy.",
    },
  ],
  glossary: [
    {
      term: "SCAN Algorithm",
      definition:
        "An elevator scheduling algorithm where the elevator moves in one direction until it reaches the end, then reverses. Similar to a disk arm sweep.",
    },
    {
      term: "Destination Dispatch",
      definition:
        "An elevator scheduling system where passengers enter their destination floor before boarding, allowing the system to group passengers and reduce stops.",
    },
    {
      term: "Token Bucket",
      definition:
        "A rate limiting algorithm using a bucket that fills with tokens at a fixed rate. Each request consumes a token; requests are rejected when the bucket is empty.",
    },
    {
      term: "Sliding Window Counter",
      definition:
        "A rate limiting algorithm that tracks request counts in fixed sub-windows and interpolates to approximate a sliding window, balancing precision and memory.",
    },
    {
      term: "State Pattern",
      definition:
        "A behavioral design pattern where an object changes its behavior based on its internal state, with each state represented as a separate class implementing a common interface.",
    },
    {
      term: "BookCopy",
      definition:
        "In a library system, a physical instance of a book with its own barcode, condition, and status, as distinct from the Book entity which holds metadata like ISBN and title.",
    },
    {
      term: "Spot Allocation Strategy",
      definition:
        "In a parking lot system, the algorithm used to assign a parking spot to an incoming vehicle. Examples: nearest to entrance, spread across floors, smallest compatible spot.",
    },
  ],
};
