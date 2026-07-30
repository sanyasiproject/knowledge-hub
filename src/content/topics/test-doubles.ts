import type { TopicContent } from "../types";

export const testDoubles: TopicContent = {
  quickSummary: [
    "Test doubles are objects that stand in for real dependencies during testing. The five types — dummy, stub, spy, mock, and fake — each serve a different purpose and offer different trade-offs between isolation, realism, and coupling to implementation details.",
    "Stubs provide canned answers to calls made during a test. Mocks go further: they are pre-programmed with expectations about which calls they will receive and can fail the test if those expectations are not met.",
    "Fakes are lightweight working implementations (e.g., an in-memory database) that behave realistically but skip production concerns like persistence or network I/O.",
    "Over-mocking is one of the most common testing anti-patterns: when tests mock too many collaborators or verify internal method calls, they become fragile mirrors of implementation rather than reliable guardians of behavior.",
  ],
  detailed: [
    "A dummy is the simplest test double. It is passed around but never actually used — its only purpose is to satisfy a parameter list. For example, a function that requires a logger but never logs during the code path under test can receive a dummy logger. Dummies have no behavior; calling methods on them typically throws or returns nothing.",
    "A stub is a test double that returns predetermined responses when called. Stubs answer questions the system under test asks of its collaborators but do not verify how they were called. For example, a stub payment gateway might always return 'approved' regardless of the amount. Stubs decouple the test from the real collaborator's behavior and are ideal for state-based testing where you assert on the final state of the system, not on the interactions that produced it.",
    "A spy records information about how it was called — which methods, with what arguments, how many times — without replacing the underlying behavior (though some spy implementations do replace it). After the code under test runs, the test inspects the spy's recordings. Spies sit between stubs and mocks: they capture interaction data but leave the assertion to the test rather than failing automatically on unexpected calls.",
    "A mock is a test double pre-programmed with expectations. Before the code under test runs, you tell the mock exactly which calls to expect, in what order, and with what arguments. After execution, the mock verifies that every expected call happened and no unexpected calls were made. This is interaction-based testing. Mocks are powerful for verifying side effects (e.g., 'did we send exactly one email?') but create tight coupling between the test and the implementation.",
    "A fake is a simplified but functional implementation of a dependency. An in-memory repository, a local SMTP server, or a SQLite database standing in for PostgreSQL are all fakes. Fakes behave realistically — they maintain state, enforce constraints, and return meaningful results — but avoid the cost, latency, or complexity of the real thing. Because fakes have real logic, they themselves may need tests (contract tests) to ensure they stay faithful to the interface they replace.",
    "The distinction between interaction testing and state testing is fundamental. State testing asserts on the result or the final state of the system after an action. Interaction testing asserts on how the system communicated with its collaborators. State testing is generally more resilient to refactoring because it tests what happened, not how. Interaction testing is necessary when the side effect itself is the important outcome (sending an email, writing to a queue) but should be used sparingly.",
    "Over-mocking occurs when tests replace so many collaborators with mocks that they test nothing but the wiring between objects. Symptoms include: tests that break whenever you refactor internal method signatures, tests that pass even when the real integration is broken, and tests that read like a restatement of the production code. The remedy is to push mocks to architectural boundaries (network, database, file system) and let internal collaborators use real implementations.",
  ],
  deepDive: [
    "Contract tests solve a critical problem with test doubles: how do you know the double behaves like the real thing? A contract test suite defines the expected behavior of an interface and runs against both the real implementation and the fake. If the fake passes the contract tests, consumers can trust it as a stand-in. This pattern is especially valuable in microservice architectures where each team owns a service and provides a fake for its consumers. Pact and Spring Cloud Contract are popular contract testing frameworks.",
    "The hand-rolled vs. framework debate has practical implications. Hand-rolled test doubles are plain classes you write yourself that implement the same interface as the real dependency. They are explicit, easy to debug, and do not require learning a mocking framework. Framework-generated mocks (Mockito, Jest, unittest.mock) are faster to write, support sophisticated matching and verification, but can obscure test intent behind DSL complexity. A pragmatic approach is to hand-roll fakes for core domain interfaces (repositories, gateways) and use frameworks for one-off stubs in unit tests.",
    "Test isolation exists on a spectrum. At one extreme, solitary unit tests mock every collaborator so each class is tested in complete isolation. At the other extreme, sociable unit tests let the real object graph run and only mock at the system boundary. Solitary tests pinpoint failures precisely but miss integration bugs and break easily during refactoring. Sociable tests catch integration issues and survive refactoring but produce less precise failure messages. Most effective test suites blend both strategies, isolating at architectural seams rather than at every class boundary.",
    "Mock frameworks have converged on similar concepts despite language differences. Mockito (Java) popularized the verify-after pattern where you call the code under test first and verify interactions afterward, replacing the expect-then-act style of older frameworks like EasyMock. Jest (JavaScript) provides jest.fn() for spies and jest.mock() for module-level replacement. Python's unittest.mock offers patch() as a context manager for temporary replacement and MagicMock for auto-specced doubles. All three support argument matchers, call counting, and return value configuration — the syntax differs but the mental model is the same.",
  ],
  code: [
    {
      language: "java",
      caption:
        "Dummy, Stub, and Mock with Mockito — testing an order service",
      source: `// --- Production code ---
interface InventoryService {
    boolean isInStock(String productId, int quantity);
}

interface EmailService {
    void sendConfirmation(String orderId, String customerEmail);
}

interface AuditLogger {
    void log(String event, Map<String, String> metadata);
}

class OrderService {
    private final InventoryService inventory;
    private final EmailService email;
    private final AuditLogger audit;

    OrderService(InventoryService inventory, EmailService email, AuditLogger audit) {
        this.inventory = inventory;
        this.email = email;
        this.audit = audit;
    }

    public String placeOrder(String productId, int qty, String customerEmail) {
        if (!inventory.isInStock(productId, qty)) {
            throw new OutOfStockException(productId);
        }
        String orderId = UUID.randomUUID().toString();
        email.sendConfirmation(orderId, customerEmail);
        return orderId;
    }
}

// --- Tests ---
import static org.mockito.Mockito.*;

class OrderServiceTest {

    // AuditLogger is a DUMMY — passed to satisfy the constructor, never called
    // InventoryService is a STUB — returns a canned answer
    // EmailService is a MOCK — we verify it was called correctly
    @Test
    void placeOrder_sendsConfirmationEmail() {
        // Dummy: no behavior needed, just fills a parameter
        AuditLogger dummyLogger = mock(AuditLogger.class);

        // Stub: always returns true for stock checks
        InventoryService stubInventory = mock(InventoryService.class);
        when(stubInventory.isInStock("SKU-42", 2)).thenReturn(true);

        // Mock: we will verify interactions after the act
        EmailService mockEmail = mock(EmailService.class);

        OrderService service = new OrderService(stubInventory, mockEmail, dummyLogger);

        // Act
        String orderId = service.placeOrder("SKU-42", 2, "alice@example.com");

        // Assert — state check
        assertNotNull(orderId);

        // Verify — interaction check (this is the mock assertion)
        verify(mockEmail).sendConfirmation(eq(orderId), eq("alice@example.com"));
        verifyNoMoreInteractions(mockEmail);
    }
}`,
    },
    {
      language: "python",
      caption:
        "Spy and Fake in Python — testing a user registration flow",
      source: `"""
Demonstrates a Fake (in-memory repository) and a Spy (recording calls).
"""
from dataclasses import dataclass, field
from unittest.mock import MagicMock, call

# --- Production interfaces and code ---
@dataclass
class User:
    email: str
    name: str
    hashed_password: str = ""

class UserRepository:
    """Abstract interface — production uses PostgreSQL."""
    def save(self, user: User) -> None: ...
    def find_by_email(self, email: str) -> User | None: ...

class WelcomeEmailSender:
    def send(self, to: str, name: str) -> None: ...

class UserRegistrationService:
    def __init__(self, repo: UserRepository, emailer: WelcomeEmailSender):
        self.repo = repo
        self.emailer = emailer

    def register(self, email: str, name: str, password: str) -> User:
        if self.repo.find_by_email(email):
            raise ValueError(f"Email {email} already registered")
        user = User(email=email, name=name, hashed_password=self._hash(password))
        self.repo.save(user)
        self.emailer.send(to=email, name=name)
        return user

    def _hash(self, pw: str) -> str:
        return f"hashed_{pw}"  # simplified for demo

# --- FAKE: in-memory repository with real behavior ---
class FakeUserRepository(UserRepository):
    def __init__(self):
        self._users: dict[str, User] = {}

    def save(self, user: User) -> None:
        self._users[user.email] = user

    def find_by_email(self, email: str) -> User | None:
        return self._users.get(email)

# --- Tests ---
def test_register_saves_user_and_sends_email():
    fake_repo = FakeUserRepository()

    # SPY: records how send() was called, using MagicMock
    spy_emailer = MagicMock(spec=WelcomeEmailSender)

    service = UserRegistrationService(fake_repo, spy_emailer)
    user = service.register("bob@test.com", "Bob", "s3cret")

    # State assertion against the fake
    assert fake_repo.find_by_email("bob@test.com") is not None
    assert fake_repo.find_by_email("bob@test.com").name == "Bob"

    # Spy assertion: check recorded calls
    spy_emailer.send.assert_called_once_with(to="bob@test.com", name="Bob")

def test_register_rejects_duplicate_email():
    fake_repo = FakeUserRepository()
    fake_repo.save(User(email="bob@test.com", name="Bob"))

    spy_emailer = MagicMock(spec=WelcomeEmailSender)
    service = UserRegistrationService(fake_repo, spy_emailer)

    try:
        service.register("bob@test.com", "Bob", "s3cret")
        assert False, "Should have raised ValueError"
    except ValueError:
        pass

    # Spy assertion: email should NOT have been sent
    spy_emailer.send.assert_not_called()`,
    },
    {
      language: "typescript",
      caption:
        "Hand-rolled doubles vs Jest mocks — testing a notification system",
      source: `// --- Production code ---
interface NotificationChannel {
  send(userId: string, message: string): Promise<boolean>;
}

interface UserPreferences {
  getPreferredChannel(userId: string): Promise<"email" | "sms" | "push">;
}

class NotificationRouter {
  constructor(
    private channels: Record<string, NotificationChannel>,
    private prefs: UserPreferences
  ) {}

  async notify(userId: string, message: string): Promise<boolean> {
    const channel = await this.prefs.getPreferredChannel(userId);
    const sender = this.channels[channel];
    if (!sender) throw new Error(\`No channel configured for: \${channel}\`);
    return sender.send(userId, message);
  }
}

// --- HAND-ROLLED STUB for UserPreferences ---
class StubUserPreferences implements UserPreferences {
  constructor(private channel: "email" | "sms" | "push") {}
  async getPreferredChannel(_userId: string) {
    return this.channel;
  }
}

// --- HAND-ROLLED SPY for NotificationChannel ---
class SpyNotificationChannel implements NotificationChannel {
  calls: Array<{ userId: string; message: string }> = [];

  async send(userId: string, message: string): Promise<boolean> {
    this.calls.push({ userId, message });
    return true;
  }
}

// --- Test using hand-rolled doubles ---
describe("NotificationRouter (hand-rolled doubles)", () => {
  it("routes to the user preferred channel", async () => {
    const stubPrefs = new StubUserPreferences("sms");
    const spySms = new SpyNotificationChannel();
    const spyEmail = new SpyNotificationChannel();

    const router = new NotificationRouter(
      { sms: spySms, email: spyEmail },
      stubPrefs
    );

    await router.notify("user-1", "Your order shipped");

    // Spy assertions
    expect(spySms.calls).toHaveLength(1);
    expect(spySms.calls[0]).toEqual({
      userId: "user-1",
      message: "Your order shipped",
    });
    expect(spyEmail.calls).toHaveLength(0);
  });
});

// --- Same test using Jest framework mocks ---
describe("NotificationRouter (Jest mocks)", () => {
  it("routes to the user preferred channel", async () => {
    const mockPrefs: UserPreferences = {
      getPreferredChannel: jest.fn().mockResolvedValue("sms"),
    };
    const mockSms: NotificationChannel = {
      send: jest.fn().mockResolvedValue(true),
    };
    const mockEmail: NotificationChannel = {
      send: jest.fn().mockResolvedValue(true),
    };

    const router = new NotificationRouter(
      { sms: mockSms, email: mockEmail },
      mockPrefs
    );

    await router.notify("user-1", "Your order shipped");

    expect(mockSms.send).toHaveBeenCalledWith("user-1", "Your order shipped");
    expect(mockEmail.send).not.toHaveBeenCalled();
  });
});`,
    },
  ],
  diagrams: [
    {
      title: "Test Double Type Hierarchy",
      kind: "mindmap",
      caption:
        "The five types of test doubles arranged by increasing complexity and behavioral fidelity, from dummies (no behavior) to fakes (real behavior).",
    },
    {
      title: "Where to Place Test Doubles in a Layered Architecture",
      kind: "architecture",
      caption:
        "Test doubles are most effective at architectural boundaries (HTTP clients, databases, message queues) rather than between internal domain objects.",
    },
  ],
  animations: [
    {
      title: "From Over-Mocked to Well-Structured Tests",
      steps: [
        {
          label: "Over-mocked test",
          detail:
            "Every internal collaborator is mocked. The test verifies a chain of method calls: service.process() calls validator.validate(), then mapper.map(), then repo.save(). The test is a mirror of the implementation.",
        },
        {
          label: "Identify the real boundary",
          detail:
            "The validator and mapper are internal domain logic with no I/O. Only the repository crosses an architectural boundary (database). These internal collaborators should use real implementations.",
        },
        {
          label: "Replace internal mocks with real objects",
          detail:
            "Remove mocks for the validator and mapper. Let them run with real logic. The test now exercises the actual validation and mapping behavior alongside the service orchestration.",
        },
        {
          label: "Keep the boundary double",
          detail:
            "The repository remains a fake (in-memory implementation) or a stub. The test now asserts on the final state in the fake repository rather than verifying a chain of method calls.",
        },
        {
          label: "Result: resilient test",
          detail:
            "Refactoring the internals (renaming methods, splitting classes, changing the mapping logic) no longer breaks the test. The test fails only when the observable behavior changes — which is exactly when it should fail.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Type",
      "Has Behavior?",
      "Returns Data?",
      "Records Calls?",
      "Verifies Expectations?",
      "Best For",
    ],
    rows: [
      [
        "Dummy",
        "No",
        "No",
        "No",
        "No",
        "Filling required parameters that are irrelevant to the test",
      ],
      [
        "Stub",
        "Minimal (canned)",
        "Yes",
        "No",
        "No",
        "Controlling indirect inputs; state-based testing",
      ],
      [
        "Spy",
        "Optional",
        "Optional",
        "Yes",
        "No (manual)",
        "Capturing side effects for later assertion",
      ],
      [
        "Mock",
        "Configured",
        "Yes",
        "Yes",
        "Yes (automatic)",
        "Verifying interactions and side effects",
      ],
      [
        "Fake",
        "Yes (simplified real)",
        "Yes",
        "No",
        "No",
        "Realistic behavior without production overhead",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a mock and a stub?",
      a: "A stub provides canned responses to method calls — it answers questions the system under test asks. A mock goes further: it is pre-programmed with expectations about which methods will be called, with what arguments, and in what order. The stub supports state-based testing (assert on the result), while the mock supports interaction-based testing (assert on how collaborators were called). The key distinction is that mocks verify behavior, stubs supply data.",
      followUps: [
        "When would you prefer state-based testing over interaction-based?",
        "Can a single test double act as both a stub and a mock?",
      ],
    },
    {
      q: "What is the over-mocking anti-pattern and how do you avoid it?",
      a: "Over-mocking happens when tests mock internal collaborators rather than just external boundaries, turning the test into a mirror of the implementation. Every refactoring breaks the tests even though behavior is unchanged. To avoid it, only mock at architectural boundaries — database, network, file system, external services — and use real implementations for internal domain logic. If you find yourself mocking more than two collaborators in a single test, that is a smell.",
      followUps: [
        "How does over-mocking relate to the fragile test problem?",
        "What is the sociable unit test approach?",
      ],
    },
    {
      q: "What is a fake and when would you use one over a mock?",
      a: "A fake is a simplified but functional implementation of a dependency — for example, an in-memory database or a local file-based message queue. Unlike a mock, a fake has real working logic and maintains state. Use a fake when you need realistic behavior across multiple operations (e.g., save then query), when mock setup would be too complex, or when you want tests that survive refactoring. Fakes are especially valuable for repository interfaces where insert-then-read sequences need to work correctly.",
      followUps: [
        "How do you ensure a fake stays faithful to the real implementation?",
        "What are contract tests?",
      ],
    },
    {
      q: "What are contract tests and why are they important?",
      a: "Contract tests define the expected behavior of an interface and run against both the real implementation and its test double (usually a fake). They ensure the fake stays in sync with the real implementation as it evolves. Without contract tests, a fake can silently drift from reality, causing tests to pass against the fake but fail in production. This is especially critical in microservice architectures where teams provide fakes of their services to consumers.",
    },
    {
      q: "When should you use interaction testing vs. state testing?",
      a: "Use state testing (assert on the result or final state) as your default — it is more resilient to refactoring and tests what matters: the outcome. Use interaction testing (verify method calls on mocks) when the side effect IS the important outcome and there is no observable state change to assert on. Sending an email, publishing to a message queue, or calling an external API are good candidates for interaction testing because the effect is not visible in the system under test's state.",
      followUps: [
        "Can you give an example where interaction testing is the only option?",
      ],
    },
    {
      q: "What is the difference between hand-rolled test doubles and framework-generated mocks?",
      a: "Hand-rolled doubles are classes you write yourself that implement the same interface as the real dependency. They are explicit, debuggable, and make test intent clear. Framework mocks (Mockito, Jest, unittest.mock) are generated dynamically with less code but can obscure intent behind DSL complexity. A practical guideline: hand-roll fakes for core domain interfaces you test frequently (repositories, gateways) and use framework mocks for one-off stubs in simpler tests.",
      followUps: [
        "What are the maintenance trade-offs of hand-rolled fakes?",
      ],
    },
    {
      q: "How do you decide which dependencies to mock in a unit test?",
      a: "Mock dependencies that cross architectural boundaries: databases, external HTTP services, file systems, message brokers, clocks, and random number generators. Do not mock internal domain objects, value objects, or pure functions — let them run with real implementations. The rule of thumb is: if the dependency involves I/O, latency, or non-determinism, use a test double. If it is deterministic in-process logic, use the real thing.",
    },
  ],
  mcqs: [
    {
      q: "Which type of test double provides canned responses but does NOT verify how it was called?",
      options: ["Mock", "Stub", "Spy", "Fake"],
      answerIndex: 1,
      explanation:
        "A stub returns predetermined data when called but does not track or verify interactions. Mocks verify expectations, spies record calls, and fakes have working implementations.",
    },
    {
      q: "What is the primary risk of over-mocking in unit tests?",
      options: [
        "Tests run too slowly",
        "Tests become tightly coupled to implementation details and break during refactoring",
        "Tests consume too much memory",
        "Tests cannot run in parallel",
      ],
      answerIndex: 1,
      explanation:
        "Over-mocking creates tests that mirror the implementation rather than verifying behavior. Any internal refactoring breaks the tests even when the observable behavior is unchanged.",
    },
    {
      q: "An in-memory database used in place of PostgreSQL during testing is an example of which test double?",
      options: ["Stub", "Mock", "Fake", "Dummy"],
      answerIndex: 2,
      explanation:
        "A fake is a simplified but working implementation. An in-memory database maintains state, enforces constraints, and returns realistic results — it has real behavior, unlike a stub or mock.",
    },
    {
      q: "What do contract tests ensure?",
      options: [
        "That mocks verify all expected method calls",
        "That the test double behaves consistently with the real implementation",
        "That all classes have unit tests",
        "That integration tests cover all API endpoints",
      ],
      answerIndex: 1,
      explanation:
        "Contract tests run the same behavioral assertions against both the real implementation and the fake, ensuring they stay in sync as the codebase evolves.",
    },
    {
      q: "A test double that records which methods were called and with what arguments, but leaves the assertion to the test code, is called a:",
      options: ["Mock", "Stub", "Spy", "Dummy"],
      answerIndex: 2,
      explanation:
        "A spy records interaction data (method names, arguments, call counts) for the test to inspect afterward. Unlike a mock, it does not automatically fail on unexpected calls.",
    },
    {
      q: "Which testing approach is MOST resilient to refactoring?",
      options: [
        "Interaction testing with strict mock expectations",
        "State-based testing with assertions on outcomes",
        "Testing with dummies for all dependencies",
        "Verifying exact method call order on mocks",
      ],
      answerIndex: 1,
      explanation:
        "State-based testing asserts on what happened (the result or final state), not how it happened. Refactoring the internals does not break the test as long as the outcome remains the same.",
    },
    {
      q: "In Mockito, what does verify(emailService).send(any(), any()) check?",
      options: [
        "That emailService.send() returns a value",
        "That emailService.send() was called exactly once with any arguments",
        "That emailService.send() was stubbed correctly",
        "That emailService is a real implementation",
      ],
      answerIndex: 1,
      explanation:
        "Mockito's verify() checks that the specified method was called on the mock. By default, it asserts exactly one invocation. The any() matchers accept any argument value.",
    },
  ],
  flashcards: [
    {
      front: "What is a dummy in testing?",
      back: "An object passed to satisfy a parameter list but never actually used. It has no behavior and exists only to make the code compile or the function signature happy.",
    },
    {
      front: "What is a stub in testing?",
      back: "A test double that returns predetermined (canned) responses when called. It provides indirect inputs to the system under test but does not verify how it was called.",
    },
    {
      front: "What is a spy in testing?",
      back: "A test double that records information about how it was called — which methods, with what arguments, how many times. The test inspects these recordings after the code under test runs.",
    },
    {
      front: "What is a mock in testing?",
      back: "A test double pre-programmed with expectations about which calls it will receive. It automatically verifies that the expected interactions occurred and fails the test if they did not.",
    },
    {
      front: "What is a fake in testing?",
      back: "A simplified but functional implementation of a dependency (e.g., in-memory database). It has real working logic and maintains state, but avoids the cost and complexity of the production implementation.",
    },
    {
      front: "State testing vs. interaction testing?",
      back: "State testing asserts on the result or final state after an action (what happened). Interaction testing asserts on how the system communicated with its collaborators (how it happened). State testing is more refactoring-resilient.",
    },
    {
      front: "What is the over-mocking anti-pattern?",
      back: "Mocking too many internal collaborators so that tests become mirrors of the implementation. They break on every refactoring and test wiring rather than behavior. Fix by mocking only at architectural boundaries.",
    },
    {
      front: "What are contract tests?",
      back: "Tests that define expected interface behavior and run against both the real implementation and its fake, ensuring the fake stays faithful to reality as the codebase evolves.",
    },
    {
      front: "Hand-rolled doubles vs. framework mocks?",
      back: "Hand-rolled: explicit classes you write, easy to debug, clear intent. Framework mocks: less boilerplate, powerful matching/verification DSL, but can obscure test intent. Use hand-rolled for core interfaces, frameworks for one-off stubs.",
    },
  ],
  revisionNotes: [
    "Five types of test doubles in order of complexity: Dummy (no behavior) -> Stub (canned answers) -> Spy (records calls) -> Mock (verifies expectations) -> Fake (working implementation).",
    "Stubs support state-based testing; mocks support interaction-based testing. Default to state-based and only use interaction-based when the side effect is the outcome you care about.",
    "Mock at architectural boundaries (database, network, file system, external APIs), not between internal domain objects.",
    "Over-mocking creates fragile tests coupled to implementation. The test should break only when observable behavior changes, not when you refactor internal method names.",
    "Contract tests run the same assertions against the real implementation and the fake to ensure they stay in sync.",
    "Fakes are ideal for dependencies with complex state (repositories, caches) where stub setup would be unwieldy.",
    "Mockito (Java): when().thenReturn() for stubs, verify() for mocks. Jest (JS): jest.fn() for spies, jest.mock() for module replacement. unittest.mock (Python): patch() for temporary replacement, MagicMock for auto-spec doubles.",
    "Solitary unit tests mock every collaborator; sociable unit tests mock only at system boundaries. Most effective test suites blend both.",
  ],
  cheatSheet: [
    "Dummy: new NoOpLogger() — fills a parameter, never called",
    "Stub: when(repo.findById(1)).thenReturn(user) — supplies data",
    "Spy: verify call count and arguments AFTER execution",
    "Mock: set expectations BEFORE execution, auto-verifies",
    "Fake: class InMemoryUserRepo implements UserRepo { ... }",
    "State test: assertEquals(expected, service.calculate(input))",
    "Interaction test: verify(emailService).send(orderId, email)",
    "Over-mocking smell: more than 2-3 mocks in one test setup",
    "Contract test: run same test suite against Real and Fake impls",
    "Mock boundaries: DB, HTTP, filesystem, clock, random — not domain logic",
    "Mockito: @Mock + @InjectMocks for auto-wiring in Java tests",
    "Jest: jest.spyOn(object, 'method') to spy without replacing",
    "Python: with patch('module.ClassName') as mock_cls: ...",
  ],
  resources: [
    {
      label: "xUnit Test Patterns — Gerard Meszaros",
      kind: "book",
      note: "The definitive reference that coined the test double taxonomy (dummy, stub, spy, mock, fake).",
    },
    {
      label: "Mocks Aren't Stubs — Martin Fowler",
      kind: "article",
      note: "Classic essay explaining the distinction between classical (state) and mockist (interaction) testing styles.",
    },
    {
      label: "Growing Object-Oriented Software, Guided by Tests — Freeman & Pryce",
      kind: "book",
      note: "The book that popularized the London school of TDD with mock-driven design.",
    },
    {
      label: "Mockito Documentation",
      kind: "docs",
      note: "Official documentation for the most widely used Java mocking framework.",
    },
    {
      label: "Jest Mock Functions Guide",
      kind: "docs",
      note: "Official Jest documentation covering jest.fn(), jest.mock(), and jest.spyOn().",
    },
    {
      label: "Python unittest.mock Documentation",
      kind: "docs",
      note: "Standard library reference for patch(), MagicMock, and spec-based mocking.",
    },
    {
      label: "Testing on the Toilet: Know Your Test Doubles — Google",
      kind: "article",
      note: "Concise Google engineering blog post on choosing the right test double type.",
    },
  ],
  glossary: [
    {
      term: "Test Double",
      definition:
        "A generic term for any object that stands in for a real dependency during testing. Encompasses dummies, stubs, spies, mocks, and fakes.",
    },
    {
      term: "Dummy",
      definition:
        "A test double passed to satisfy a parameter list but never actually used or called during the test.",
    },
    {
      term: "Stub",
      definition:
        "A test double that returns predetermined responses when called, providing indirect inputs to the system under test.",
    },
    {
      term: "Spy",
      definition:
        "A test double that records information about calls made to it (method names, arguments, call counts) for later assertion by the test.",
    },
    {
      term: "Mock",
      definition:
        "A test double pre-programmed with expectations that automatically verifies the expected interactions occurred.",
    },
    {
      term: "Fake",
      definition:
        "A simplified but functional implementation of a dependency that behaves realistically without production overhead (e.g., in-memory database).",
    },
    {
      term: "Contract Test",
      definition:
        "A test suite that defines expected interface behavior and runs against both the real implementation and its test double to ensure consistency.",
    },
    {
      term: "Interaction Testing",
      definition:
        "A testing approach that verifies how the system under test communicates with its collaborators (which methods were called, with what arguments).",
    },
    {
      term: "State Testing",
      definition:
        "A testing approach that asserts on the result or final state of the system after an action, rather than on the interactions that produced it.",
    },
    {
      term: "Over-Mocking",
      definition:
        "An anti-pattern where too many collaborators are replaced with mocks, causing tests to mirror implementation details and break on every refactoring.",
    },
  ],
};
