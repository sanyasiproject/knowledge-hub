import type { TopicContent } from "../types";

export const unitTesting: TopicContent = {
  quickSummary: [
    "A unit test verifies the smallest testable piece of code -- typically a single function or method -- in complete isolation from external dependencies like databases, file systems, and network calls.",
    "The AAA pattern (Arrange-Act-Assert) provides a clear structure: set up preconditions, execute the behavior under test, then verify the expected outcome. This pattern makes tests readable and maintainable.",
    "Good unit tests are fast (milliseconds each), deterministic (same result every run), isolated (no shared state between tests), and self-validating (pass or fail without human interpretation).",
    "Unit testing frameworks like JUnit (Java), Jest (TypeScript/JavaScript), and pytest (Python) provide test runners, assertion libraries, lifecycle hooks, and parameterized test support out of the box.",
  ],
  detailed: [
    "What constitutes a 'unit' is debated. The classicist (Detroit/Chicago) school treats a unit as a behavior -- a cluster of closely related classes working together -- and only isolates external dependencies. The mockist (London) school defines a unit as a single class and mocks all collaborators. The classicist approach tends to produce less brittle tests because refactoring internal class structures does not break tests. The mockist approach gives more precise failure localization but can lead to tests that mirror implementation details.",
    "The AAA pattern structures every test into three distinct phases. Arrange sets up the test fixtures, input data, and any required stubs or mocks. Act invokes the method or function being tested, usually as a single line. Assert checks that the result matches expectations. Some practitioners add a fourth phase -- Annihilate or Cleanup -- for releasing resources, though modern frameworks handle this via teardown hooks. The Given-When-Then format from BDD is conceptually identical but uses domain language.",
    "Test isolation means each test runs independently with no reliance on the order of execution or shared mutable state. Tests should not read from or write to databases, file systems, or network services. Dependencies are replaced with test doubles (stubs, mocks, fakes). Isolation also means tests should not depend on each other -- test B should not assume test A ran first. Frameworks enforce this by creating fresh test instances or running tests in random order.",
    "Naming conventions make test failures self-documenting. Common patterns include: methodName_scenario_expectedBehavior (e.g., calculateDiscount_expiredCoupon_returnsZero), should_expectedBehavior_when_scenario (e.g., should_throwException_when_balanceInsufficient), or simply descriptive sentences in frameworks that support string descriptions (Jest's 'it' blocks, pytest's plain function names). The name should communicate intent so that a failing test immediately tells you what broke.",
    "Parameterized tests eliminate duplication when the same logic must be verified across multiple inputs. JUnit 5's @ParameterizedTest with @CsvSource or @MethodSource, Jest's test.each, and pytest's @pytest.mark.parametrize all allow defining a test template that runs against a table of inputs and expected outputs. This is especially valuable for boundary conditions, equivalence classes, and combinatorial scenarios.",
    "Testing edge cases systematically requires thinking about boundary values (0, -1, MAX_INT, empty string, null), equivalence partitions (ranges of inputs that should produce the same outcome), and error conditions (invalid input, missing data, concurrent access). A checklist approach -- null, empty, single element, maximum size, negative, overflow, special characters -- ensures coverage of common failure modes.",
    "Test organization follows the project structure. Tests typically mirror the source directory layout (src/services/UserService.java maps to test/services/UserServiceTest.java). Within a test class, related tests are grouped using nested classes (JUnit 5 @Nested), describe blocks (Jest), or test classes (pytest). Shared fixtures are extracted to setup methods (@BeforeEach, beforeEach, setup) rather than duplicated across tests.",
  ],
  deepDive: [
    "The FIRST principles of unit testing (Fast, Isolated, Repeatable, Self-validating, Timely) provide a quality checklist. Fast means the entire unit test suite should run in seconds, not minutes -- if tests are slow, developers skip them. Isolated means no test depends on another or on external state. Repeatable means running the test 1000 times produces the same result with no flakiness. Self-validating means no human judgment is required -- the test either passes or fails with a clear assertion message. Timely means tests are written close to the production code, ideally before or immediately after.",
    "Code coverage metrics (line, branch, condition, path) measure what percentage of production code is exercised by tests, but coverage alone does not guarantee quality. A test suite can achieve 100% line coverage with zero assertions -- it executes every line but verifies nothing. Mutation testing addresses this by injecting small changes (mutations) into the production code and checking that at least one test fails. If a mutant survives (all tests still pass), it reveals a gap in the test suite's fault-detection ability. Tools like PIT (Java), Stryker (JavaScript/TypeScript), and mutmut (Python) automate this process.",
    "The test boundary problem asks: how much should a unit test cover? Testing too small a unit (individual private methods) couples tests to implementation details, making refactoring painful. Testing too large a unit blurs the line with integration testing and makes failure diagnosis harder. The pragmatic middle ground tests public APIs of modules or classes, treating the internal implementation as a black box. If a private method is complex enough to need its own tests, it may deserve extraction into its own class with a public interface.",
    "Flaky unit tests -- tests that intermittently pass or fail without code changes -- are a serious problem that erodes trust in the test suite. Common causes include time-dependent logic (use a clock abstraction), random number generation (use seeded generators), shared mutable state between tests, and floating-point comparison without epsilon tolerance. Detecting flakiness requires running the suite multiple times or tracking test results over CI builds. Quarantining flaky tests (running them separately and not blocking the build) prevents them from blocking the team while they are being fixed.",
  ],
  code: [
    {
      language: "java",
      caption: "JUnit 5 unit test with AAA pattern and parameterized tests",
      source: `import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import static org.junit.jupiter.api.Assertions.*;

class PriceCalculatorTest {

    private PriceCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PriceCalculator(new InMemoryTaxRateProvider());
    }

    @Test
    @DisplayName("applies 10% discount for orders over $100")
    void applyDiscount_orderOverThreshold_returns10PercentOff() {
        // Arrange
        Order order = new Order(List.of(
            new LineItem("Widget", 60.00, 2)
        ));

        // Act
        double total = calculator.calculateTotal(order);

        // Assert
        assertEquals(108.00, total, 0.01); // 120 - 12 discount
    }

    @ParameterizedTest(name = "subtotal {0} -> discount {1}")
    @CsvSource({
        "50.00, 0.00",
        "100.00, 0.00",
        "100.01, 10.00",
        "200.00, 20.00",
        "1000.00, 100.00"
    })
    void applyDiscount_variousSubtotals_calculatesCorrectDiscount(
            double subtotal, double expectedDiscount) {
        double discount = calculator.computeDiscount(subtotal);
        assertEquals(expectedDiscount, discount, 0.01);
    }

    @ParameterizedTest
    @NullAndEmptySource
    void calculateTotal_nullOrEmptyItems_throwsException(List<LineItem> items) {
        assertThrows(IllegalArgumentException.class,
            () -> calculator.calculateTotal(new Order(items)));
    }

    @Nested
    @DisplayName("Tax calculation")
    class TaxTests {
        @Test
        void calculateTax_standardRate_appliesTaxAfterDiscount() {
            Order order = new Order(List.of(
                new LineItem("Gadget", 200.00, 1)
            ));
            double total = calculator.calculateTotal(order);
            // 200 - 20 discount = 180, then 10% tax = 198
            assertEquals(198.00, total, 0.01);
        }
    }
}`,
    },
    {
      language: "typescript",
      caption: "Jest unit tests with mocking and edge case coverage",
      source: `import { UserService } from './UserService';
import { UserRepository } from './UserRepository';
import { EmailService } from './EmailService';

// Jest auto-mocking
jest.mock('./UserRepository');
jest.mock('./EmailService');

describe('UserService', () => {
  let userService: UserService;
  let mockRepo: jest.Mocked<UserRepository>;
  let mockEmail: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockRepo = new UserRepository() as jest.Mocked<UserRepository>;
    mockEmail = new EmailService() as jest.Mocked<EmailService>;
    userService = new UserService(mockRepo, mockEmail);
  });

  describe('registerUser', () => {
    it('should save user and send welcome email', async () => {
      // Arrange
      const userData = { name: 'Alice', email: 'alice@example.com' };
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({ id: '123', ...userData });

      // Act
      const user = await userService.registerUser(userData);

      // Assert
      expect(user.id).toBe('123');
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice' })
      );
      expect(mockEmail.sendWelcome).toHaveBeenCalledWith('alice@example.com');
    });

    it('should throw if email is already registered', async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: '1', name: 'Bob', email: 'bob@test.com' });

      await expect(
        userService.registerUser({ name: 'Bob2', email: 'bob@test.com' })
      ).rejects.toThrow('Email already registered');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it.each([
      ['empty name', { name: '', email: 'a@b.com' }],
      ['invalid email', { name: 'Test', email: 'not-an-email' }],
      ['name too long', { name: 'A'.repeat(256), email: 'a@b.com' }],
    ])('should reject %s', async (_desc, userData) => {
      await expect(
        userService.registerUser(userData)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('deactivateUser', () => {
    it('should mark user inactive and not delete data', async () => {
      mockRepo.findById.mockResolvedValue({
        id: '1', name: 'Carol', email: 'carol@test.com', active: true
      });

      await userService.deactivateUser('1');

      expect(mockRepo.update).toHaveBeenCalledWith('1', { active: false });
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});`,
    },
    {
      language: "cpp",
      caption: "Google Test unit tests with fixtures and parameterized tests",
      source: `#include <gtest/gtest.h>
#include <stdexcept>
#include <tuple>
#include "InventoryManager.h"  // InventoryManager, InsufficientStockError

// Test fixture — fresh inventory for each test
class InventoryManagerTest : public ::testing::Test {
protected:
    InventoryManager inventory;

    void SetUp() override {
        inventory.addProduct("SKU-001", "Widget", 100, 9.99);
        inventory.addProduct("SKU-002", "Gadget", 5, 49.99);
    }
};

TEST_F(InventoryManagerTest, AddProductIncreasesCount) {
    EXPECT_EQ(inventory.productCount(), 2);
    inventory.addProduct("SKU-003", "Doohickey", 10, 4.99);
    EXPECT_EQ(inventory.productCount(), 3);
}

TEST_F(InventoryManagerTest, ReserveStockDecrementsAvailable) {
    inventory.reserve("SKU-001", 10);
    EXPECT_EQ(inventory.available("SKU-001"), 90);
}

TEST_F(InventoryManagerTest, ReserveInsufficientStockThrows) {
    EXPECT_THROW({
        inventory.reserve("SKU-002", 10);
    }, InsufficientStockError);
}

// Parameterized test for order totals
class OrderTotalTest
    : public InventoryManagerTest,
      public ::testing::WithParamInterface<std::tuple<int, double>> {};

TEST_P(OrderTotalTest, CalculatesCorrectTotal) {
    auto [quantity, expectedTotal] = GetParam();
    double total = inventory.calculateTotal("SKU-001", quantity);
    EXPECT_NEAR(total, expectedTotal, 0.01);
}

INSTANTIATE_TEST_SUITE_P(
    VariousQuantities, OrderTotalTest,
    ::testing::Values(
        std::make_tuple(1,  9.99),
        std::make_tuple(10, 99.90),
        std::make_tuple(0,  0.00)
    )
);

TEST_F(InventoryManagerTest, ReserveNonexistentSkuThrows) {
    EXPECT_THROW({
        inventory.reserve("SKU-999", 1);
    }, std::out_of_range);
}

TEST_F(InventoryManagerTest, AddDuplicateSkuUpdatesQuantity) {
    inventory.addProduct("SKU-001", "Widget", 50, 9.99);
    EXPECT_EQ(inventory.available("SKU-001"), 150);
}`,
    },
  ],
  diagrams: [
    {
      title: "Unit Test Anatomy",
      kind: "architecture",
      caption: "Structure of a well-written unit test following the Arrange-Act-Assert pattern.",
      mermaid: `graph TD
    UT["Unit Test"] --> ARR["Arrange
set up SUT and dependencies
create test doubles"]
    UT --> ACT["Act
call the method under test
one action per test"]
    UT --> ASS["Assert
verify output or state
one logical assertion"]
    ARR --> SUT["System Under Test"]
    ACT --> SUT
    SUT --> ASS`,
    },
    {
      title: "Unit Testing Best Practices",
      kind: "mindmap",
      caption: "Key properties and best practices that make unit tests valuable, maintainable, and trustworthy.",
      mermaid: `mindmap
  root((Unit Testing))
    FIRST Properties
      Fast - milliseconds
      Isolated - no IO
      Repeatable - deterministic
      Self-validating - pass or fail
      Timely - written with code
    Good Test Design
      One assertion per test
      Descriptive test names
      No logic in tests
      Test behavior not internals
    Avoid
      Shared mutable state
      Test interdependence
      Over-mocking`,
    },
    {
      title: "Test Isolation with Mocks",
      kind: "sequence",
      caption: "How mocks replace real dependencies to isolate the unit under test from external systems.",
      mermaid: `sequenceDiagram
    participant T as Test
    participant SUT as OrderService
    participant M as Mock Repository
    participant M2 as Mock EmailService
    T->>M: stub findById returns order
    T->>M2: expect sendConfirmation called once
    T->>SUT: placeOrder(customerId, items)
    SUT->>M: findById(customerId)
    M-->>SUT: stubbed order
    SUT->>M2: sendConfirmation(order)
    T->>M2: verify expectations`,
    },
    {
      title: "Unit Test Workflow",
      kind: "flow",
      caption: "Developer workflow integrating unit tests via TDD or test-after with CI enforcement.",
      mermaid: `flowchart TD
    A(["Write or modify code"]) --> B{TDD approach?}
    B -->|Yes| C["Write failing test first"]
    C --> D["Write minimal code to pass"]
    B -->|No| E["Write code first"]
    E --> F["Write tests after"]
    D --> G["Run test suite"]
    F --> G
    G --> H{All tests pass?}
    H -->|No| I["Fix failing tests or code"]
    I --> G
    H -->|Yes| J["Commit and push"]
    J --> K["CI runs full suite"]`,
    },
  ],
  animations: [
    {
      title: "AAA Pattern Execution Flow",
      steps: [
        {
          label: "Arrange",
          detail:
            "Create the object under test, set up input data, configure stubs to return predetermined values, and initialize any required test fixtures.",
        },
        {
          label: "Act",
          detail:
            "Invoke the single method or function being tested with the arranged inputs. This should be exactly one call -- if you need multiple calls, you likely need multiple tests.",
        },
        {
          label: "Assert",
          detail:
            "Verify the result matches expectations using assertion methods. Check return values, state changes, and interactions with mocks. Use specific assertion messages for clear failure diagnostics.",
        },
        {
          label: "Cleanup (implicit)",
          detail:
            "The framework's teardown hook (@AfterEach, afterEach) runs automatically, releasing resources and resetting shared state to ensure the next test starts clean.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "JUnit 5 (Java)",
      "Jest (TypeScript/JS)",
      "pytest (Python)",
    ],
    rows: [
      [
        "Test annotation/function",
        "@Test",
        "test() / it()",
        "def test_*()",
      ],
      [
        "Setup/Teardown",
        "@BeforeEach / @AfterEach",
        "beforeEach() / afterEach()",
        "fixtures with @pytest.fixture",
      ],
      [
        "Parameterized tests",
        "@ParameterizedTest + @CsvSource",
        "test.each([])",
        "@pytest.mark.parametrize",
      ],
      [
        "Assertions",
        "assertEquals, assertTrue, assertThrows",
        "expect().toBe(), .toThrow()",
        "assert, pytest.raises()",
      ],
      [
        "Grouping/Nesting",
        "@Nested inner classes",
        "describe() blocks",
        "Test classes",
      ],
      [
        "Mocking",
        "Mockito (separate library)",
        "Built-in jest.mock()",
        "unittest.mock / pytest-mock",
      ],
      [
        "Test discovery",
        "Classpath scanning",
        "File pattern (*.test.ts)",
        "File pattern (test_*.py)",
      ],
      [
        "Parallel execution",
        "junit-platform.properties config",
        "--workers flag",
        "pytest-xdist plugin",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is a unit test and how does it differ from an integration test?",
      a: "A unit test verifies a single function, method, or class in isolation from external dependencies. All collaborators are replaced with test doubles. An integration test verifies that multiple components work together correctly, often involving real databases, APIs, or file systems. Unit tests are fast (milliseconds), focused, and numerous, while integration tests are slower, broader, and fewer in number.",
      followUps: [
        "How do you decide what counts as a 'unit' in your projects?",
        "Can a unit test ever use a real database?",
        "What is the classicist vs mockist debate?",
      ],
    },
    {
      q: "Explain the AAA pattern and why it matters.",
      a: "AAA stands for Arrange-Act-Assert. Arrange sets up the preconditions and inputs. Act executes the behavior being tested, ideally as a single method call. Assert verifies the outcome. This pattern matters because it gives every test a consistent, readable structure. When a test fails, the three sections make it immediately clear what was being tested and what went wrong. It also prevents tests from doing too much -- if you cannot clearly separate the three phases, the test is likely testing too many things.",
      followUps: [
        "What is the BDD equivalent of AAA?",
        "Should the Act section always be a single line?",
        "How do you handle tests that need multiple assertions?",
      ],
    },
    {
      q: "How do you handle testing private methods?",
      a: "Generally, you should not test private methods directly. Instead, test them indirectly through the public interface that uses them. If a private method is complex enough that it seems to need its own tests, that is a design smell -- the method likely belongs in its own class where it would be public and independently testable. In some languages, you can use package-private visibility (Java) or test-specific access patterns, but this usually indicates a need for refactoring rather than creative testing workarounds.",
      followUps: [
        "What if the private method has complex branching logic?",
        "How does the Extract Class refactoring help here?",
        "Are there legitimate cases for testing internals?",
      ],
    },
    {
      q: "What makes a unit test 'flaky' and how do you fix it?",
      a: "A flaky test is one that passes and fails intermittently without any code changes. Common causes include: reliance on system time (fix by injecting a clock abstraction), non-deterministic ordering of collections (fix by sorting or using order-independent assertions), shared mutable state between tests (fix by isolating test state), floating-point comparisons without tolerance (fix by using delta/epsilon assertions), and race conditions in async code (fix by properly awaiting promises or using synchronization). The fix is always to eliminate the non-determinism, not to retry the test.",
      followUps: [
        "How do you detect flaky tests in a CI pipeline?",
        "What is test quarantining?",
        "Should flaky tests block the build?",
      ],
    },
    {
      q: "What is the difference between code coverage and test effectiveness?",
      a: "Code coverage measures the percentage of lines, branches, or paths executed by tests. It tells you what code was run but not whether it was correctly verified. A test with no assertions can achieve 100% line coverage while catching zero bugs. Test effectiveness measures whether tests actually detect faults. Mutation testing measures this by introducing small changes (mutants) to production code and checking that tests fail. A high mutation score indicates the test suite genuinely validates behavior, not just exercises code paths.",
      followUps: [
        "What is a good target for code coverage?",
        "Explain how mutation testing works.",
        "What are the different types of coverage metrics?",
      ],
    },
    {
      q: "How do you test code that depends on external services?",
      a: "Replace external dependencies with test doubles. Use dependency injection to pass in a mock, stub, or fake implementation instead of the real service. For example, instead of calling a real HTTP API, inject a stub that returns predetermined responses. For database access, inject an in-memory repository implementation. The key principle is that unit tests should never make network calls, file system operations, or database queries. These boundaries are where unit tests end and integration tests begin.",
      followUps: [
        "What is the difference between a mock and a stub?",
        "How does dependency injection facilitate testing?",
        "When should you use a fake instead of a mock?",
      ],
    },
  ],
  followUps: [
    "How do you structure a test suite for a microservice with dozens of classes?",
    "What is the role of test fixtures vs factories in test data management?",
    "How do you test pure functions vs stateful objects differently?",
    "When should you use snapshot testing instead of explicit assertions?",
    "How do you balance test coverage targets with development speed?",
    "What strategies help make legacy code unit-testable?",
  ],
  mcqs: [
    {
      q: "What does the 'Arrange' phase of the AAA pattern involve?",
      options: [
        "Invoking the method under test",
        "Setting up preconditions, inputs, and test doubles",
        "Verifying the expected outcome",
        "Cleaning up resources after the test",
      ],
      answerIndex: 1,
      explanation:
        "Arrange is the setup phase where you create the object under test, prepare input data, and configure any stubs or mocks needed for the test.",
    },
    {
      q: "Which of the following is NOT a characteristic of a good unit test?",
      options: [
        "Runs in milliseconds",
        "Produces the same result every time",
        "Requires a running database",
        "Clearly indicates what failed when it breaks",
      ],
      answerIndex: 2,
      explanation:
        "Unit tests should be isolated from external dependencies like databases. Tests requiring a database are integration tests, not unit tests.",
    },
    {
      q: "What does mutation testing measure?",
      options: [
        "How many lines of code are executed by tests",
        "Whether tests detect intentionally introduced faults in production code",
        "The percentage of branches covered by the test suite",
        "How fast the test suite runs",
      ],
      answerIndex: 1,
      explanation:
        "Mutation testing injects small changes (mutants) into the production code and checks whether tests fail. Surviving mutants indicate gaps in test effectiveness.",
    },
    {
      q: "In JUnit 5, which annotation is used to run a test with multiple inputs?",
      options: [
        "@RepeatedTest",
        "@ParameterizedTest",
        "@TestFactory",
        "@TestTemplate",
      ],
      answerIndex: 1,
      explanation:
        "@ParameterizedTest combined with a source annotation like @CsvSource or @MethodSource allows running the same test logic with different inputs.",
    },
    {
      q: "Why should private methods generally NOT be tested directly?",
      options: [
        "Private methods never contain bugs",
        "Testing them couples tests to implementation details, making refactoring harder",
        "Test frameworks cannot access private methods",
        "Private methods are always trivial",
      ],
      answerIndex: 1,
      explanation:
        "Testing private methods directly couples your tests to the internal implementation. When you refactor internals, these tests break even though external behavior is unchanged. Test through the public API instead.",
    },
    {
      q: "What is the classicist (Detroit) approach to unit testing?",
      options: [
        "Mock every collaborator of the class under test",
        "Only test through the UI using end-to-end tests",
        "Test behaviors using real collaborators, only mocking external boundaries",
        "Write tests after all code is complete",
      ],
      answerIndex: 2,
      explanation:
        "The classicist school treats a 'unit' as a behavior rather than a class. It uses real collaborators and only mocks external dependencies like databases or APIs, producing less brittle tests.",
    },
  ],
  exercises: [
    "Write a complete test class for a ShoppingCart that supports addItem, removeItem, getTotal, and applyCoupon methods. Cover at least: adding duplicate items increments quantity, removing a non-existent item throws an exception, applying an expired coupon is rejected, and the total correctly sums items with different quantities.",
    "Take an existing untested function that parses CSV data into objects. Write parameterized tests covering: valid input with various column counts, empty input, malformed rows (missing commas, extra columns), special characters in values, and very large input. Use boundary value analysis to determine your test cases.",
    "Refactor a test class that has shared mutable state between tests (e.g., a static list that tests add to) so that each test is fully isolated. Verify isolation by running tests in random order and confirming all pass.",
    "Write a test for an async function that fetches user data from an API. Mock the HTTP client to return success, error (404, 500), timeout, and malformed JSON responses. Verify that each scenario is handled correctly.",
  ],
  flashcards: [
    {
      front: "What does AAA stand for in unit testing?",
      back: "Arrange-Act-Assert: Arrange sets up the test, Act invokes the behavior, Assert verifies the result.",
    },
    {
      front: "What is the difference between the classicist and mockist schools of unit testing?",
      back: "Classicist (Detroit) treats a unit as a behavior using real collaborators, mocking only external boundaries. Mockist (London) treats a unit as a single class, mocking all collaborators.",
    },
    {
      front: "What does FIRST stand for in unit testing principles?",
      back: "Fast, Isolated, Repeatable, Self-validating, Timely -- five qualities every good unit test should have.",
    },
    {
      front: "What is mutation testing?",
      back: "A technique that injects small faults (mutants) into production code and checks whether tests detect them. Surviving mutants reveal weaknesses in the test suite.",
    },
    {
      front: "Why is code coverage alone insufficient to measure test quality?",
      back: "Coverage shows which code was executed but not whether it was correctly verified. A test with no assertions can achieve 100% coverage while catching zero bugs.",
    },
    {
      front: "What is a parameterized test?",
      back: "A test template that runs the same assertion logic against multiple sets of inputs and expected outputs, reducing duplication when testing many scenarios for the same behavior.",
    },
    {
      front: "What is a flaky test?",
      back: "A test that intermittently passes and fails without code changes, typically caused by time-dependence, shared state, non-deterministic ordering, or race conditions.",
    },
  ],
  revisionNotes: [
    "A unit test isolates the smallest testable piece of code from all external dependencies. The scope of a 'unit' depends on your school: classicist (behavior-level) or mockist (class-level).",
    "AAA (Arrange-Act-Assert) is the standard unit test structure. The Act phase should ideally be a single method call. Multiple assertions are fine if they verify a single logical concept.",
    "FIRST principles: Fast (ms), Isolated (no shared state), Repeatable (deterministic), Self-validating (binary pass/fail), Timely (written close to the production code).",
    "Parameterized tests run the same test logic against multiple inputs. Use them for boundary values, equivalence classes, and combinatorial scenarios to avoid copy-paste duplication.",
    "Never test private methods directly -- test them through the public API. If a private method is too complex to test indirectly, extract it into its own class.",
    "Code coverage measures execution, not verification. Mutation testing measures whether tests actually detect faults. Aim for meaningful coverage, not a vanity percentage.",
    "Common naming conventions: methodName_scenario_expected, should_expected_when_scenario, or plain descriptive strings. The name should explain the failure when the test breaks.",
  ],
  cheatSheet: [
    "JUnit 5: @Test, @BeforeEach, @AfterEach, @Nested, @DisplayName, @ParameterizedTest + @CsvSource",
    "Jest: describe(), it()/test(), beforeEach(), afterEach(), expect().toBe/toEqual/toThrow, jest.mock()",
    "pytest: def test_*(), @pytest.fixture, @pytest.mark.parametrize, pytest.raises(), conftest.py for shared fixtures",
    "Assertion best practices: one logical concept per test, use specific matchers (containsExactly vs contains), include failure messages for complex assertions",
    "Mocking rule of thumb: mock what you do not own (external APIs, databases), use real objects for your own code when possible",
    "Test file placement: mirror the source directory structure. UserService.ts -> UserService.test.ts (same dir or parallel test dir)",
    "Run tests in random order to catch hidden dependencies: JUnit 5 @TestMethodOrder(Random), pytest -p randomly, Jest --randomize",
  ],
  resources: [
    {
      label: "Unit Testing Principles, Practices, and Patterns by Vladimir Khorikov",
      kind: "book",
      note: "Comprehensive guide to writing maintainable unit tests with the classicist approach. Covers the distinction between output-based, state-based, and communication-based testing.",
    },
    {
      label: "JUnit 5 User Guide",
      kind: "docs",
      note: "Official documentation covering all JUnit 5 features including parameterized tests, nested tests, extensions, and parallel execution.",
    },
    {
      label: "Jest Documentation", url: "https://jestjs.io/docs/getting-started",
      kind: "docs",
      note: "Complete reference for Jest including mocking, snapshot testing, async testing, and custom matchers.",
    },
    {
      label: "pytest Documentation",
      kind: "docs",
      note: "Official pytest docs covering fixtures, parametrize, plugins, and configuration.",
    },
    {
      label: "The Art of Unit Testing by Roy Osherove",
      kind: "book",
      note: "Practical guide covering test doubles, test organization, and patterns for writing readable and maintainable unit tests.",
    },
  ],
  glossary: [
    {
      term: "Unit Test",
      definition:
        "A test that verifies the smallest testable piece of code in isolation from external dependencies, running in milliseconds with deterministic results.",
    },
    {
      term: "AAA Pattern",
      definition:
        "Arrange-Act-Assert -- a three-phase structure for unit tests: set up preconditions, invoke the behavior, and verify the outcome.",
    },
    {
      term: "Test Isolation",
      definition:
        "The property that each test runs independently with no reliance on execution order, shared state, or external systems.",
    },
    {
      term: "Parameterized Test",
      definition:
        "A test template that executes the same logic with multiple sets of inputs and expected outputs, reducing duplication.",
    },
    {
      term: "Code Coverage",
      definition:
        "A metric measuring the percentage of production code lines, branches, or paths executed during testing. Does not measure test quality.",
    },
    {
      term: "Mutation Testing",
      definition:
        "A technique that injects small faults into production code to verify that the test suite detects them, measuring test effectiveness.",
    },
    {
      term: "Test Double",
      definition:
        "A generic term for any object that stands in for a real dependency during testing: includes dummies, stubs, spies, mocks, and fakes.",
    },
    {
      term: "Flaky Test",
      definition:
        "A test that produces inconsistent results (sometimes passes, sometimes fails) without any change to the code under test.",
    },
  ],
};
