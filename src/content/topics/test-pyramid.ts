import type { TopicContent } from "../types";

export const testPyramid: TopicContent = {
  quickSummary: [
    "Mike Cohn's Test Pyramid (2009) prescribes a distribution of tests: many fast unit tests at the base, fewer integration tests in the middle, and very few slow E2E/UI tests at the top, forming a pyramid shape.",
    "The pyramid reflects a fundamental tradeoff: lower-level tests are faster, cheaper, and more stable, while higher-level tests provide more confidence that the assembled system works but are slower, more expensive, and more fragile.",
    "The Ice Cream Cone anti-pattern inverts the pyramid: teams rely heavily on manual and E2E tests with few unit tests, resulting in slow feedback, high maintenance costs, and unreliable test suites.",
    "Kent C. Dodds' Testing Trophy rebalances the pyramid for modern frontend applications, emphasizing integration tests over unit tests because component integration is where most frontend bugs occur.",
  ],
  detailed: [
    "Mike Cohn introduced the Test Pyramid in his 2009 book 'Succeeding with Agile.' The model has three layers: Unit Tests at the base (fast, numerous, cheap), Service/Integration Tests in the middle (moderate speed and count), and UI/E2E Tests at the top (slow, few, expensive). The key insight is that the cost-per-bug-found increases dramatically as you move up the pyramid. A bug caught by a unit test costs minutes to fix; the same bug caught by an E2E test costs hours due to slow feedback and harder diagnosis.",
    "A practical ratio for the pyramid is roughly 70% unit, 20% integration, 10% E2E. However, these percentages are guidelines, not rules. The right distribution depends on the application type: a data-heavy backend might need more integration tests (database queries), while a UI-heavy frontend might need more component/integration tests. The principle remains: invest most heavily in the layer where bugs are cheapest to find and fix.",
    "The Testing Trophy, proposed by Kent C. Dodds for React and frontend applications, reshapes the pyramid into a trophy: static analysis at the base (TypeScript, ESLint), a narrow band of unit tests, a large middle of integration tests, and a small top of E2E tests. The rationale is that frontend bugs rarely live in isolated functions (unit level) -- they emerge from component interactions, prop passing, state management, and rendering. Integration tests using React Testing Library (which renders real DOM) catch these bugs effectively without the fragility of full browser E2E tests.",
    "The Ice Cream Cone is an anti-pattern where most testing is manual or done through E2E/UI tests, with few automated unit and integration tests. This inverts the pyramid into an upside-down cone or ice cream shape. Teams in this situation experience: extremely slow CI pipelines (hours), high test maintenance costs (UI tests break constantly), low developer confidence (flaky tests are ignored), and late bug discovery (defects found in QA, not during development). Escaping the ice cream cone requires a deliberate investment in lower-level tests.",
    "Cost and speed tradeoffs are quantifiable. A typical unit test runs in 1-5 milliseconds, meaning 10,000 unit tests finish in under a minute. An integration test with Testcontainers takes 1-5 seconds, so 200 tests take 5-15 minutes. An E2E test takes 10-60 seconds each, so 50 tests can take 30+ minutes. This math explains why E2E-heavy suites destroy developer productivity: a 45-minute feedback loop means developers context-switch instead of waiting, reducing the value of the tests dramatically.",
    "Each layer catches different types of bugs. Unit tests catch logic errors, off-by-one mistakes, null handling issues, and algorithmic bugs. Integration tests catch serialization errors, SQL bugs, API contract violations, configuration issues, and transaction problems. E2E tests catch assembly problems, routing errors, authentication/authorization flows, cross-page state management, and browser-specific rendering issues. A balanced pyramid ensures coverage across all these failure modes.",
  ],
  deepDive: [
    "The pyramid model has been criticized for being overly simplistic. Martin Fowler notes that the metaphor is useful but the exact shape depends on the application. A microservice with minimal business logic but complex database interactions might have an 'hourglass' shape: few unit tests, many integration tests, few E2E tests. A library or SDK with pure algorithmic logic might be almost all unit tests with no integration or E2E tests. The principle to internalize is not the exact shape but the cost gradient: always prefer catching bugs at the cheapest level possible.",
    "Google's testing approach, documented in 'Software Engineering at Google,' classifies tests as small, medium, and large instead of unit, integration, and E2E. Small tests run in a single process with no I/O (matching unit tests). Medium tests can use localhost network and file I/O but must run on a single machine (matching integration tests). Large tests can span multiple machines (matching E2E). Google's recommended ratio is 80% small, 15% medium, 5% large. The classification by size (resource usage) rather than scope (what is tested) avoids semantic debates about what constitutes a 'unit.'",
    "The Testing Trophy's emphasis on integration tests aligns with the 'Write tests. Not too many. Mostly integration.' philosophy attributed to Guillermo Rauch. The argument is that integration tests provide the best return on investment: they catch real bugs (unlike overly isolated unit tests that mock everything) with reasonable speed (unlike slow E2E tests). For frontend applications using React Testing Library, an integration test renders a component with its children, mocks only the API layer, and tests user interactions -- catching the bugs that actually ship to production.",
    "Practical guidelines for each layer help teams build an effective pyramid. For the unit layer: test all business logic, domain models, utility functions, and algorithms. For the integration layer: test every repository/DAO against a real database, every API endpoint with request/response validation, and every external service client. For the E2E layer: test the 3-5 most critical user workflows (signup, login, core feature, checkout, payment). When uncertain where a test belongs, ask: 'What is the cheapest level that can catch this bug?' and write it there.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Testing Trophy in practice: integration test with React Testing Library",
      source: `// Integration test - the Trophy's sweet spot
// Tests the UserProfile component with real child components,
// mocked API, and actual user interactions
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { UserProfile } from './UserProfile';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({
      id: req.params.id,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'admin',
    }));
  }),
  rest.put('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ ...req.body, id: req.params.id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile integration', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />);

    // Verifies loading state, API call, rendering, and child components
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('allows editing and saving user name', async () => {
    const user = userEvent.setup();
    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Click edit, change name, save - tests component interaction
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Alice Smith');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Saved successfully')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load user')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});`,
    },
    {
      language: "java",
      caption: "Test pyramid layers for a Spring Boot service",
      source: `// === UNIT TEST (Base of pyramid - many of these) ===
class OrderPricingTest {
    @Test
    void calculateTotal_multipleItems_sumsCorrectly() {
        OrderPricing pricing = new OrderPricing();
        List<LineItem> items = List.of(
            new LineItem("A", 2, new BigDecimal("10.00")),
            new LineItem("B", 1, new BigDecimal("25.00"))
        );
        assertEquals(new BigDecimal("45.00"), pricing.calculateTotal(items));
    }

    @Test
    void applyDiscount_bulkOrder_applies15Percent() {
        OrderPricing pricing = new OrderPricing();
        BigDecimal total = new BigDecimal("500.00");
        assertEquals(new BigDecimal("425.00"), pricing.applyBulkDiscount(total));
    }
}

// === INTEGRATION TEST (Middle of pyramid - moderate count) ===
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderRepositoryIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository repository;

    @Test
    void save_validOrder_persistsAllFields() {
        Order order = Order.create("customer-1",
            List.of(new LineItem("Widget", 2, new BigDecimal("10.00"))));

        Order saved = repository.save(order);

        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findById(saved.getId()))
            .isPresent()
            .hasValueSatisfying(o -> {
                assertThat(o.getCustomerId()).isEqualTo("customer-1");
                assertThat(o.getItems()).hasSize(1);
            });
    }
}

// === E2E TEST (Top of pyramid - very few) ===
// Only covers the most critical user workflow
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderCheckoutE2ETest {
    @Autowired
    private TestRestTemplate rest;

    @Test
    void fullCheckoutWorkflow_createsOrderAndProcessesPayment() {
        // 1. Create a cart
        ResponseEntity<CartResponse> cart = rest.postForEntity(
            "/api/carts", new CreateCartRequest("customer-1"), CartResponse.class);
        assertThat(cart.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // 2. Add items
        rest.postForEntity("/api/carts/" + cart.getBody().getId() + "/items",
            new AddItemRequest("SKU-001", 2), Void.class);

        // 3. Checkout
        ResponseEntity<OrderResponse> order = rest.postForEntity(
            "/api/carts/" + cart.getBody().getId() + "/checkout",
            new CheckoutRequest("card_tok_test"), OrderResponse.class);
        assertThat(order.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(order.getBody().getStatus()).isEqualTo("CONFIRMED");
    }
}`,
    },
  ],
  diagrams: [
    {
      title: "Test Pyramid Layers",
      kind: "architecture",
      caption: "The three-tier testing pyramid showing unit tests at the base and end-to-end tests at the top.",
      mermaid: `graph TD
    E2E["E2E Tests
Few - Slow - Costly
browsers and full stack"]
    INT["Integration Tests
Some - Medium speed
services and databases"]
    UNIT["Unit Tests
Many - Fast - Cheap
isolated functions"]
    E2E --- INT
    INT --- UNIT`,
    },
    {
      title: "Test Scope by Layer",
      kind: "mindmap",
      caption: "What each layer of the test pyramid validates and the tools commonly used at each level.",
      mermaid: `mindmap
  root((Test Pyramid))
    Unit Tests
      Single function or class
      Mocks for dependencies
      Milliseconds to run
      Jest, JUnit, pytest
    Integration Tests
      Multiple components
      Real databases or APIs
      Seconds to run
      Testcontainers
    E2E Tests
      Full user workflow
      Real browser
      Minutes to run
      Cypress, Playwright`,
    },
    {
      title: "Test Execution Flow",
      kind: "flow",
      caption: "CI pipeline execution order from fast unit tests through integration to slow end-to-end tests.",
      mermaid: `flowchart LR
    PR["Pull Request"] --> U["Run Unit Tests
fast feedback"]
    U --> Pass1{Pass?}
    Pass1 -->|No| Fail["Block merge
fix tests"]
    Pass1 -->|Yes| I["Run Integration Tests
service boundaries"]
    I --> Pass2{Pass?}
    Pass2 -->|No| Fail
    Pass2 -->|Yes| E["Run E2E Tests
full workflow"]
    E --> Pass3{Pass?}
    Pass3 -->|No| Fail
    Pass3 -->|Yes| Merge["Merge to main"]`,
    },
    {
      title: "Ice Cream Cone Anti-Pattern",
      kind: "architecture",
      caption: "The test ice cream cone anti-pattern inverts the pyramid with too many slow E2E tests and too few unit tests.",
      mermaid: `graph TD
    UNIT2["Unit Tests
Few - undertested logic"]
    INT2["Integration Tests
Some"]
    E2E2["E2E Tests
Many - Slow - Fragile
heavy maintenance cost"]
    UNIT2 --- INT2
    INT2 --- E2E2`,
    },
  ],
  animations: [
    {
      title: "Escaping the Ice Cream Cone",
      steps: [
        {
          label: "Assess current state",
          detail:
            "Audit the existing test suite: count tests by layer, measure execution times, and identify which E2E tests could be replaced by lower-level tests. Map flaky tests and calculate their cost.",
        },
        {
          label: "Add unit tests for new code",
          detail:
            "Establish a rule: all new code must include unit tests. This prevents the cone from growing. Use TDD or test-first approaches to build the habit.",
        },
        {
          label: "Extract integration tests",
          detail:
            "For each E2E test, identify the core behavior being verified. Write targeted integration tests that cover the same scenarios faster. The E2E test now becomes redundant for those checks.",
        },
        {
          label: "Retire redundant E2E tests",
          detail:
            "Once lower-level tests cover the same behavior, remove or downgrade E2E tests to smoke tests that run less frequently. Keep only E2E tests for critical end-to-end user workflows.",
        },
        {
          label: "Maintain the pyramid",
          detail:
            "Add CI checks for test distribution (minimum unit test ratio). Review test layer decisions in code reviews. Track test execution times and catch regression toward the cone.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Unit Tests", "Integration Tests", "E2E Tests"],
    rows: [
      [
        "Execution speed",
        "1-5 ms per test",
        "100ms - 5s per test",
        "10-60s per test",
      ],
      [
        "Typical count",
        "Thousands",
        "Hundreds",
        "Tens",
      ],
      [
        "Maintenance cost",
        "Low",
        "Medium",
        "High",
      ],
      [
        "Flakiness risk",
        "Very low",
        "Low-medium",
        "High",
      ],
      [
        "Failure diagnosis",
        "Pinpoints exact function",
        "Narrows to component pair",
        "Broad -- anywhere in stack",
      ],
      [
        "Confidence level",
        "Logic is correct",
        "Components integrate correctly",
        "System works for users",
      ],
      [
        "Dependencies",
        "All mocked",
        "Some real, some mocked",
        "All real",
      ],
      [
        "Pyramid percentage",
        "~70%",
        "~20%",
        "~10%",
      ],
      [
        "Trophy percentage",
        "~15%",
        "~50%",
        "~10% (+ 25% static)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain the Test Pyramid and why it matters.",
      a: "The Test Pyramid, introduced by Mike Cohn, recommends having many fast unit tests at the base, fewer integration tests in the middle, and very few slow E2E tests at the top. It matters because of the cost gradient: bugs caught at lower levels are cheaper to find and fix. A unit test runs in milliseconds with precise failure localization. An E2E test takes seconds to minutes and failures require investigation across the entire stack. The pyramid shape ensures fast feedback loops and sustainable test maintenance costs.",
      followUps: [
        "Is the pyramid shape always correct?",
        "What application types might have a different optimal shape?",
        "How do you measure whether your test suite follows the pyramid?",
      ],
    },
    {
      q: "What is the Testing Trophy and how does it differ from the Pyramid?",
      a: "The Testing Trophy, proposed by Kent C. Dodds for frontend applications, reshapes the pyramid into a trophy: static analysis at the base, a thin unit layer, a large integration layer, and a thin E2E layer. The key difference is that integration tests take the largest share. The rationale is that frontend bugs typically emerge from component interactions, not isolated functions. A unit test of a utility function or a full E2E browser test are both less cost-effective than an integration test using React Testing Library that renders real components with mocked API calls.",
      followUps: [
        "Does the Trophy apply to backend applications?",
        "What counts as an integration test in the Trophy model?",
        "How does static analysis fit into testing strategy?",
      ],
    },
    {
      q: "What is the Ice Cream Cone anti-pattern?",
      a: "The Ice Cream Cone is an inverted pyramid where most testing is manual or E2E, with few integration and unit tests. Teams end up here when automated testing is added as an afterthought -- they start with manual QA, then automate at the UI level because it mirrors their manual testing. The results are devastating: CI pipelines take hours, tests are chronically flaky, developers ignore test failures, and bugs are caught late. Escaping requires a deliberate investment in unit and integration tests for new code while gradually replacing E2E tests with lower-level equivalents.",
      followUps: [
        "How do you convince a team to invest in restructuring their test suite?",
        "What metrics demonstrate the cost of the Ice Cream Cone?",
        "How long does it take to reshape a cone into a pyramid?",
      ],
    },
    {
      q: "How do you decide which layer a test belongs in?",
      a: "Ask: 'What is the cheapest level that can reliably catch this bug?' If the behavior depends only on inputs and outputs of a function, it is a unit test. If it depends on how two components interact (database queries, API serialization, message passing), it is an integration test. If it can only be verified by exercising the complete system from the user's perspective (login flow, checkout process, cross-page navigation), it is an E2E test. The goal is to push tests as low as possible while maintaining confidence.",
      followUps: [
        "What if a bug could be caught at multiple levels?",
        "How do you handle the 'testing diamond' shape?",
        "Should you duplicate coverage across layers?",
      ],
    },
    {
      q: "What practical metrics should you track for your test pyramid?",
      a: "Track: test count by layer (the distribution), total execution time per layer, flakiness rate (percentage of non-deterministic failures), mean time to diagnose a failure, and test-to-code ratio. These metrics reveal whether the pyramid is healthy. A growing E2E count with declining unit counts signals cone formation. Rising flakiness rates indicate tests are at the wrong layer. Increasing diagnosis time suggests failures are too broad. Review these metrics monthly and adjust strategy accordingly.",
      followUps: [
        "How do you enforce pyramid ratios in CI?",
        "What is a healthy flakiness rate?",
        "How do you measure the ROI of a test suite?",
      ],
    },
  ],
  followUps: [
    "How does the test pyramid apply to microservices architectures with many services?",
    "What is the 'Testing Diamond' and when does it make sense?",
    "How should the pyramid shape change for different application types (API-only, SPA, mobile)?",
    "What role does static analysis play in the testing strategy?",
    "How do you handle tests that span multiple pyramid levels?",
    "What is the relationship between test pyramid and deployment confidence?",
  ],
  mcqs: [
    {
      q: "In Mike Cohn's Test Pyramid, which layer should have the most tests?",
      options: [
        "E2E / UI tests",
        "Integration tests",
        "Unit tests",
        "Manual tests",
      ],
      answerIndex: 2,
      explanation:
        "The pyramid's wide base is unit tests. They are fast, cheap, and numerous, catching logic errors with millisecond feedback and pinpoint failure localization.",
    },
    {
      q: "What is the Ice Cream Cone anti-pattern?",
      options: [
        "Having too many unit tests",
        "An inverted pyramid with most testing being manual or E2E",
        "A balanced distribution of tests across all layers",
        "Using mocks instead of real dependencies",
      ],
      answerIndex: 1,
      explanation:
        "The Ice Cream Cone inverts the pyramid: heavy on manual and E2E tests, light on unit tests. This creates slow pipelines, flaky tests, and late bug detection.",
    },
    {
      q: "In the Testing Trophy, which layer gets the most emphasis?",
      options: [
        "Static analysis",
        "Unit tests",
        "Integration tests",
        "E2E tests",
      ],
      answerIndex: 2,
      explanation:
        "The Testing Trophy emphasizes integration tests as the sweet spot for frontend applications, arguing they provide the best ROI by testing real component interactions.",
    },
    {
      q: "Why are E2E tests at the top of the pyramid (fewest)?",
      options: [
        "They are the easiest to write",
        "They catch the fewest bugs",
        "They are slow, expensive, and prone to flakiness",
        "They require the least infrastructure",
      ],
      answerIndex: 2,
      explanation:
        "E2E tests are the most expensive to write, maintain, and run. They take seconds to minutes per test, are prone to flakiness, and produce broad failures that are hard to diagnose.",
    },
    {
      q: "What is Google's recommended test size ratio?",
      options: [
        "50% small, 30% medium, 20% large",
        "80% small, 15% medium, 5% large",
        "33% small, 33% medium, 33% large",
        "90% small, 8% medium, 2% large",
      ],
      answerIndex: 1,
      explanation:
        "Google classifies tests as small (single process, no I/O), medium (localhost I/O), and large (multi-machine). Their recommended ratio is 80/15/5.",
    },
    {
      q: "A typical unit test runs in how many milliseconds?",
      options: ["100-500 ms", "1-5 ms", "1000-5000 ms", "10-50 ms"],
      answerIndex: 1,
      explanation:
        "Unit tests should run in single-digit milliseconds because they have no I/O, no network calls, and no database access. This is why thousands can execute in under a minute.",
    },
  ],
  exercises: [
    "Audit an existing project's test suite. Count tests by layer (unit, integration, E2E), measure execution time per layer, and visualize the distribution. Identify whether it forms a pyramid, trophy, diamond, or ice cream cone. Propose specific changes to improve the shape.",
    "For a given feature (user registration), write tests at all three pyramid layers: 3+ unit tests for validation logic, 1-2 integration tests for database persistence and API endpoints, and 1 E2E test for the complete signup flow. Compare the maintenance cost and execution time of each layer.",
    "Take a project with too many E2E tests (ice cream cone) and refactor 5 E2E tests into lower-level equivalents. For each, identify the core behavior being tested, write a unit or integration test that covers it, then document why the E2E test can be removed or downgraded to a smoke test.",
  ],
  flashcards: [
    {
      front: "What are the three layers of Mike Cohn's Test Pyramid?",
      back: "Bottom: Unit tests (many, fast, cheap). Middle: Integration/Service tests (moderate count, moderate speed). Top: UI/E2E tests (few, slow, expensive).",
    },
    {
      front: "What is the recommended test distribution in the pyramid?",
      back: "Approximately 70% unit, 20% integration, 10% E2E. Google recommends 80% small, 15% medium, 5% large.",
    },
    {
      front: "What is the Testing Trophy?",
      back: "Kent C. Dodds' model for frontend apps: static analysis at the base, thin unit layer, large integration layer (the sweet spot), thin E2E layer at the top.",
    },
    {
      front: "What is the Ice Cream Cone anti-pattern?",
      back: "An inverted pyramid with heavy manual/E2E testing and few unit tests. Causes slow CI, high flakiness, and late bug detection.",
    },
    {
      front: "How do you decide which pyramid layer a test belongs in?",
      back: "Ask: 'What is the cheapest level that can reliably catch this bug?' Push tests as low as possible while maintaining confidence. Only use E2E for behaviors that require the full system.",
    },
    {
      front: "What does Google mean by small, medium, and large tests?",
      back: "Small: single process, no I/O (unit). Medium: localhost I/O, single machine (integration). Large: multi-machine, real infrastructure (E2E). Classification by resources, not scope.",
    },
  ],
  revisionNotes: [
    "The Test Pyramid (Cohn, 2009): many unit tests (base), fewer integration (middle), very few E2E (top). Shape reflects the cost gradient of catching bugs at each level.",
    "Practical ratio: 70/20/10 (unit/integration/e2e). Google uses 80/15/5 (small/medium/large).",
    "The Testing Trophy (Kent C. Dodds): static analysis base, thin unit, large integration, thin E2E. Integration tests are the sweet spot for frontend apps.",
    "Ice Cream Cone: heavy manual/E2E, few unit tests. Symptoms: slow CI (hours), chronic flakiness, ignored test failures, late bug detection.",
    "Each layer catches different bugs: unit=logic errors, integration=boundary bugs (SQL, serialization), E2E=assembly and UX issues.",
    "Decision heuristic: 'What is the cheapest level that can reliably catch this bug?' Always push tests as low as possible.",
    "Track pyramid health with: test count by layer, execution time, flakiness rate, and mean time to diagnose failures.",
  ],
  cheatSheet: [
    "Pyramid layers: Unit (70%, ms, isolated) > Integration (20%, seconds, real deps) > E2E (10%, minutes, full stack)",
    "Trophy layers: Static (linting/types) > Unit (thin) > Integration (thick, sweet spot) > E2E (thin)",
    "Ice Cream Cone symptoms: CI > 30 min, flakiness > 5%, developers ignore failures, most bugs found in QA",
    "Google sizing: Small = no I/O, Medium = localhost I/O, Large = multi-machine",
    "Layer decision: inputs/outputs only -> unit, component interaction -> integration, full user workflow -> E2E",
    "Escaping the cone: test-first for new code, extract integration tests from E2E, retire redundant E2E, track metrics",
  ],
  resources: [
    {
      label: "Succeeding with Agile by Mike Cohn",
      kind: "book",
      note: "The original source of the Test Pyramid concept, covering practical agile testing strategies.",
    },
    {
      label: "The Practical Test Pyramid by Ham Vocke (Martin Fowler's blog)", url: "https://martinfowler.com/",
      kind: "article",
      note: "Detailed exploration of the test pyramid with modern examples in Java and JavaScript, including practical advice for each layer.",
    },
    {
      label: "Write tests. Not too many. Mostly integration. by Kent C. Dodds",
      kind: "article",
      note: "The original Testing Trophy article explaining why integration tests provide the best ROI for frontend applications.",
    },
    {
      label: "Software Engineering at Google (O'Reilly)",
      kind: "book",
      note: "Chapter 11 covers Google's testing philosophy including the small/medium/large classification and their 80/15/5 ratio.",
    },
    {
      label: "Testing JavaScript with Kent C. Dodds",
      kind: "video",
      note: "Video course covering the Testing Trophy in practice with React Testing Library, MSW, and Cypress.",
    },
  ],
  glossary: [
    {
      term: "Test Pyramid",
      definition:
        "Mike Cohn's model recommending a distribution of tests: many fast unit tests at the base, fewer integration tests in the middle, and very few E2E tests at the top.",
    },
    {
      term: "Testing Trophy",
      definition:
        "Kent C. Dodds' model for frontend testing that emphasizes integration tests as the sweet spot, with static analysis at the base and thin unit/E2E layers.",
    },
    {
      term: "Ice Cream Cone",
      definition:
        "An anti-pattern where testing is inverted: heavy on manual and E2E tests, light on unit and integration tests, causing slow feedback and high maintenance costs.",
    },
    {
      term: "Cost Gradient",
      definition:
        "The principle that bugs caught at lower test levels are exponentially cheaper to find and fix than bugs caught at higher levels.",
    },
    {
      term: "Smoke Test",
      definition:
        "A minimal subset of tests that verify the most critical functionality works, typically run first to catch catastrophic failures before running the full suite.",
    },
    {
      term: "Test Distribution",
      definition:
        "The ratio of tests across pyramid layers (unit/integration/E2E), which indicates the health and sustainability of a test suite.",
    },
  ],
};
