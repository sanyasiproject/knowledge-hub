import type { TopicContent } from "../types";

export const integrationTesting: TopicContent = {
  quickSummary: [
    "Integration tests verify that multiple components work together correctly -- testing the seams between modules, services, databases, and external APIs where bugs most commonly hide.",
    "Unlike unit tests, integration tests use real infrastructure (databases via Testcontainers, HTTP servers, message queues) to catch configuration errors, serialization bugs, and protocol mismatches that mocks cannot reveal.",
    "Integration tests sit in the middle of the test pyramid: fewer than unit tests but more than end-to-end tests. They are slower (seconds vs milliseconds) but provide higher confidence that the system actually works as assembled.",
    "Contract testing (Pact, Spring Cloud Contract) verifies that API producers and consumers agree on message formats and behaviors without requiring both services to run simultaneously.",
  ],
  detailed: [
    "Integration tests target the boundaries between components: the repository layer talking to a real database, the HTTP client calling a real API endpoint, the message producer writing to a real queue. These boundaries are where unit tests with mocks provide false confidence -- a mock returns what you tell it to, not what the real system returns. Integration tests catch schema mismatches, SQL syntax errors, serialization issues, connection pool exhaustion, and transaction isolation bugs that only appear with real infrastructure.",
    "Testcontainers is a library (available for Java, Python, Node.js, Go, and .NET) that spins up lightweight Docker containers for databases, message brokers, and other services during test execution. Instead of maintaining a shared test database, each test class gets a fresh, disposable container with a known state. This eliminates the 'works on my machine' problem and makes tests reproducible across CI environments. PostgreSQL, MySQL, MongoDB, Redis, Kafka, and RabbitMQ are all supported out of the box.",
    "API integration testing verifies the HTTP layer of a service: route matching, request parsing, authentication, validation, response serialization, and error handling. Spring Boot provides @WebMvcTest and @SpringBootTest with TestRestTemplate. Express/NestJS applications use supertest. FastAPI provides TestClient built on httpx. These tests start the server (or a slice of it) and send real HTTP requests, catching issues like missing content-type headers, incorrect status codes, and broken JSON serialization.",
    "Contract testing solves the integration testing problem for distributed systems. In consumer-driven contract testing (Pact), the consumer defines the expected request/response format in a contract file. The provider then verifies it can fulfill that contract. This decouples consumer and provider teams: they can test independently without spinning up both services. Provider-driven approaches (Spring Cloud Contract) work the other way: the provider publishes contracts that consumers verify against stubs.",
    "Test environment management is a critical concern for integration tests. Strategies include: ephemeral databases via Testcontainers (preferred for CI), shared test databases with transaction rollback (each test runs in a transaction that is rolled back), schema-per-test-class isolation, and Docker Compose for multi-service setups. The key requirement is test isolation: one test's data must never affect another test's results.",
    "Fixtures and seeding prepare the database or service with known data before tests run. Approaches include SQL scripts executed before each test, programmatic fixture builders (factory patterns), and snapshot-based seeding from production data (scrubbed of PII). The builder pattern for test data -- Order.builder().withItem('Widget', 2).withCoupon('SAVE10').build() -- provides readable, maintainable test setup without brittle SQL scripts.",
  ],
  deepDive: [
    "The 'integration test' label covers a wide spectrum. Narrow integration tests verify a single component against one real dependency (e.g., a repository against a database). Broad integration tests verify the interaction between multiple components or services. The narrower the test, the faster and more deterministic it is. Broad integration tests approach end-to-end territory and share many of their drawbacks: slow execution, complex setup, and potential flakiness. A pragmatic approach is to heavily invest in narrow integration tests and use broad ones sparingly for critical workflows.",
    "Database transaction strategies in integration tests affect both isolation and performance. The simplest approach rolls back the transaction after each test, leaving the database unchanged. This is fast but cannot test transaction boundaries or behavior that requires committed data (triggers, materialized views, read-after-write in a separate connection). An alternative is truncating tables between tests, which is slower but allows testing committed behavior. Testcontainers sidesteps the issue by providing a fresh database for each test class or suite, at the cost of container startup time (mitigated by reuse mode).",
    "Consumer-driven contract testing with Pact follows a specific workflow. The consumer writes a test that defines interactions: 'given a user with ID 42 exists, when I GET /users/42, I expect a 200 with a JSON body containing name and email.' Pact records this as a contract file (pact.json). The consumer publishes the contract to a Pact Broker. The provider retrieves the contract and verifies it by replaying the requests against a running instance of the provider service. If the provider fulfills all contracts, both sides can deploy independently. The Pact Broker also supports 'can I deploy?' checks based on verification results.",
    "Testcontainers' container reuse feature (withReuse(true)) keeps containers running between test runs, dramatically reducing feedback time during local development. The container is started once and reused until explicitly stopped. This is safe because tests should manage their own data isolation (via truncation or transactions). In CI, containers typically start fresh for each build. The singleton container pattern -- initializing the container in a shared base class or module-level fixture -- ensures only one container is created per test suite.",
  ],
  code: [
    {
      language: "java",
      caption: "Spring Boot integration test with Testcontainers and PostgreSQL",
      source: `import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void createOrder_persistsAndReturnsCreatedOrder() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest(
            "customer-123",
            List.of(new OrderItem("SKU-001", 2, new BigDecimal("29.99")))
        );

        // Act
        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
            "/api/orders", request, OrderResponse.class
        );

        // Assert - HTTP layer
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCustomerId()).isEqualTo("customer-123");

        // Assert - Database layer
        Order persisted = orderRepository.findById(response.getBody().getId()).orElseThrow();
        assertThat(persisted.getItems()).hasSize(1);
        assertThat(persisted.getTotal()).isEqualByComparingTo(new BigDecimal("59.98"));
    }

    @Test
    void getOrder_nonExistent_returns404() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/orders/non-existent-id", String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}`,
    },
    {
      language: "typescript",
      caption: "API integration test with supertest and an in-memory database",
      source: `import request from 'supertest';
import { createApp } from '../app';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let app: Express.Application;
let prisma: PrismaClient;

beforeAll(async () => {
  // Use a test-specific SQLite database
  process.env.DATABASE_URL = 'file:./test.db';
  execSync('npx prisma migrate deploy', { env: process.env });
  prisma = new PrismaClient();
  app = createApp(prisma);
});

afterEach(async () => {
  // Clean up between tests
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/products', () => {
  it('should create a product and persist it', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Widget', price: 9.99, sku: 'WDG-001' })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Widget',
      price: 9.99,
      sku: 'WDG-001',
    });
    expect(res.body.id).toBeDefined();

    // Verify persistence
    const product = await prisma.product.findUnique({
      where: { id: res.body.id },
    });
    expect(product).not.toBeNull();
    expect(product!.name).toBe('Widget');
  });

  it('should reject duplicate SKU with 409', async () => {
    await request(app)
      .post('/api/products')
      .send({ name: 'Widget', price: 9.99, sku: 'WDG-001' })
      .expect(201);

    await request(app)
      .post('/api/products')
      .send({ name: 'Widget 2', price: 19.99, sku: 'WDG-001' })
      .expect(409);
  });

  it('should validate required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Widget' }) // missing price and sku
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'price' }),
        expect.objectContaining({ field: 'sku' }),
      ])
    );
  });
});

describe('GET /api/products/:id', () => {
  it('should return 404 for non-existent product', async () => {
    await request(app)
      .get('/api/products/non-existent-id')
      .expect(404);
  });
});`,
    },
    {
      language: "python",
      caption: "Python integration test with pytest and testcontainers",
      source: `import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import create_app
from app.database import Base
from app.models import User

@pytest.fixture(scope="module")
def postgres():
    """Spin up a PostgreSQL container for the test module."""
    with PostgresContainer("postgres:15-alpine") as pg:
        yield pg

@pytest.fixture(scope="module")
def db_engine(postgres):
    engine = create_engine(postgres.get_connection_url())
    Base.metadata.create_all(engine)
    return engine

@pytest.fixture
def db_session(db_engine):
    """Each test gets a fresh transaction that is rolled back."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    app = create_app(session_override=db_session)
    return TestClient(app)

class TestUserAPI:
    def test_create_user_persists_to_database(self, client, db_session):
        response = client.post("/api/users", json={
            "name": "Alice",
            "email": "alice@example.com"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Alice"

        # Verify in database
        user = db_session.query(User).filter_by(id=data["id"]).first()
        assert user is not None
        assert user.email == "alice@example.com"

    def test_duplicate_email_returns_conflict(self, client):
        client.post("/api/users", json={
            "name": "Bob", "email": "bob@example.com"
        })
        response = client.post("/api/users", json={
            "name": "Bob2", "email": "bob@example.com"
        })
        assert response.status_code == 409

    def test_get_nonexistent_user_returns_404(self, client):
        response = client.get("/api/users/99999")
        assert response.status_code == 404`,
    },
  ],
  diagrams: [
    {
      title: "Integration Test Boundaries",
      kind: "architecture",
      caption:
        "Shows the layers of an application and where integration tests operate: between the API layer and database, between services and external APIs, and between message producers and brokers.",
    },
    {
      title: "Consumer-Driven Contract Testing Flow",
      kind: "flow",
      caption:
        "Illustrates how consumer tests generate contracts, contracts are published to a broker, and providers verify contracts independently.",
    },
  ],
  animations: [
    {
      title: "Testcontainers Lifecycle",
      steps: [
        {
          label: "Container request",
          detail:
            "The test framework requests a PostgreSQL (or other) container. Testcontainers pulls the Docker image if not cached locally.",
        },
        {
          label: "Container startup",
          detail:
            "A fresh container starts with an empty database. Testcontainers waits for readiness (port open, health check passes) before returning control to the test.",
        },
        {
          label: "Dynamic configuration",
          detail:
            "The container exposes a random port. The test framework injects the JDBC URL / connection string into the application context using @DynamicPropertySource or environment variables.",
        },
        {
          label: "Test execution",
          detail:
            "Tests run against the real database. Each test manages isolation via transaction rollback, table truncation, or separate schemas.",
        },
        {
          label: "Container teardown",
          detail:
            "After the test suite completes, the container is stopped and removed. No cleanup scripts are needed because the container is ephemeral.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Unit Tests", "Integration Tests", "E2E Tests"],
    rows: [
      [
        "Scope",
        "Single function/class in isolation",
        "Multiple components with real dependencies",
        "Entire system from user perspective",
      ],
      [
        "Speed",
        "Milliseconds per test",
        "Seconds per test",
        "Seconds to minutes per test",
      ],
      [
        "Dependencies",
        "All mocked/stubbed",
        "Some real (DB, API), some mocked",
        "All real, production-like",
      ],
      [
        "Failure diagnosis",
        "Pinpoints exact function/line",
        "Narrows to component interaction",
        "Broad -- could be anywhere in the stack",
      ],
      [
        "Maintenance cost",
        "Low (stable APIs)",
        "Medium (infrastructure changes)",
        "High (UI changes, flakiness)",
      ],
      [
        "Confidence level",
        "Logic correctness",
        "Components work together",
        "System works for real users",
      ],
      [
        "Test count (pyramid)",
        "Many (70-80%)",
        "Moderate (15-20%)",
        "Few (5-10%)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Why can't unit tests with mocks replace integration tests?",
      a: "Mocks return exactly what you program them to return, not what the real system returns. They cannot catch SQL syntax errors, schema mismatches, serialization bugs, connection pool issues, or protocol-level problems. For example, a mocked repository will happily accept a query that would fail in real PostgreSQL due to a column name typo. Integration tests with a real database catch these issues because they exercise the actual query against the actual database engine.",
      followUps: [
        "Can you give an example of a bug that only integration tests would catch?",
        "How do you decide what to mock vs what to test with real dependencies?",
        "What is the cost of maintaining integration tests vs unit tests?",
      ],
    },
    {
      q: "What is Testcontainers and why would you use it?",
      a: "Testcontainers is a library that provides lightweight, throwaway instances of databases, message brokers, and other services as Docker containers during tests. You would use it to get a real database (PostgreSQL, MySQL, MongoDB) for each test run without maintaining a shared test database. Each test class gets a clean container with known state, making tests reproducible across developer machines and CI. It eliminates the 'works on my machine' problem because the database version, configuration, and schema are defined in code.",
      followUps: [
        "How does Testcontainers handle container startup time?",
        "What is the singleton container pattern?",
        "Can Testcontainers work without Docker installed locally?",
      ],
    },
    {
      q: "Explain consumer-driven contract testing.",
      a: "In consumer-driven contract testing, the consumer of an API writes tests that define the expected interactions: specific requests and the expected responses. These expectations are recorded as a contract file (e.g., a Pact file). The contract is published to a shared broker. The provider then retrieves these contracts and verifies them by replaying the recorded requests against its actual implementation. If verification passes, both consumer and provider can deploy independently, confident that they are compatible. This decouples deployment schedules and eliminates the need for always-running integration environments.",
      followUps: [
        "What is the difference between Pact and Spring Cloud Contract?",
        "How do you handle breaking API changes with contract testing?",
        "What is the 'can I deploy?' feature in Pact Broker?",
      ],
    },
    {
      q: "How do you achieve test data isolation in integration tests?",
      a: "Several strategies exist. Transaction rollback wraps each test in a database transaction that is rolled back after assertions, leaving the database unchanged. Table truncation clears all tables between tests, which is slower but handles committed-data scenarios. Testcontainers provides fresh containers per test class. Schema-per-test creates isolated database schemas. The choice depends on the tradeoff between isolation, speed, and whether you need to test committed data (triggers, read-after-write). Transaction rollback is fastest but cannot test transaction boundaries.",
      followUps: [
        "When does transaction rollback not work?",
        "How do you seed test data efficiently?",
        "What is the builder pattern for test fixtures?",
      ],
    },
    {
      q: "What is the difference between narrow and broad integration tests?",
      a: "Narrow integration tests verify a single component against one real dependency, such as a repository class against a real database. They are relatively fast, deterministic, and have clear failure causes. Broad integration tests verify interactions between multiple components or services -- for example, testing that Service A calls Service B which writes to a database. Broad tests provide more confidence but are slower, harder to set up, and harder to debug when they fail. A practical strategy is to rely heavily on narrow integration tests and use broad ones sparingly for critical end-to-end workflows.",
      followUps: [
        "How do you draw the line between a broad integration test and an e2e test?",
        "Which type should you write more of?",
        "How do you manage test environments for broad integration tests?",
      ],
    },
  ],
  followUps: [
    "How do you handle integration tests for event-driven architectures with message queues?",
    "What strategies exist for integration testing microservices without deploying all services?",
    "How do you test database migrations in an integration test suite?",
    "What is the role of Docker Compose in integration testing?",
    "How do you handle flaky integration tests caused by timing issues?",
    "What is the best approach for testing third-party API integrations?",
  ],
  mcqs: [
    {
      q: "What is the primary advantage of Testcontainers over shared test databases?",
      options: [
        "Testcontainers tests run faster",
        "Each test gets a fresh, isolated database instance with known state",
        "Testcontainers does not require Docker",
        "Testcontainers supports more database types",
      ],
      answerIndex: 1,
      explanation:
        "Testcontainers provides throwaway containers, so each test class gets a clean database. This eliminates shared state issues and the 'works on my machine' problem.",
    },
    {
      q: "In consumer-driven contract testing, who writes the contract?",
      options: [
        "The API provider defines the contract",
        "The API consumer defines the expected interactions",
        "A third-party testing team writes the contract",
        "The contract is auto-generated from API documentation",
      ],
      answerIndex: 1,
      explanation:
        "In consumer-driven contract testing (e.g., Pact), the consumer defines what it expects from the provider. The provider then verifies it can fulfill those expectations.",
    },
    {
      q: "Which test isolation strategy cannot test database triggers or materialized views?",
      options: [
        "Table truncation between tests",
        "Fresh Testcontainers per test class",
        "Transaction rollback after each test",
        "Schema-per-test isolation",
      ],
      answerIndex: 2,
      explanation:
        "Transaction rollback never commits data, so features that depend on committed data (triggers, materialized views, read-after-write in a separate connection) cannot be tested.",
    },
    {
      q: "What does @DynamicPropertySource do in a Spring Boot test with Testcontainers?",
      options: [
        "Creates dynamic test data",
        "Injects container connection properties into the Spring application context at runtime",
        "Generates random test inputs",
        "Dynamically selects which tests to run",
      ],
      answerIndex: 1,
      explanation:
        "@DynamicPropertySource allows injecting runtime values (like the randomly assigned port of a Testcontainer) into Spring's property system so the application connects to the test container.",
    },
    {
      q: "Which of these bugs would a unit test with mocks likely NOT catch?",
      options: [
        "A null pointer in business logic",
        "An off-by-one error in a loop",
        "A typo in a SQL column name",
        "An incorrect if-else condition",
      ],
      answerIndex: 2,
      explanation:
        "A mocked repository returns whatever you program it to return. It never executes real SQL, so a column name typo would go undetected. Only an integration test against a real database would catch this.",
    },
  ],
  exercises: [
    "Write an integration test for a REST endpoint that creates a user. Use Testcontainers (or an equivalent) to spin up a real database. Verify that the response contains the correct data AND that the user is persisted in the database with the correct fields.",
    "Set up consumer-driven contract testing between two services: an Order Service (consumer) that calls a Product Service (provider) to check product availability. Write the consumer test that generates the contract, and the provider verification test.",
    "Write integration tests for a repository class that performs CRUD operations with pagination. Test edge cases: empty results, partial pages, sort order, and concurrent modifications. Use transaction rollback for isolation.",
    "Create a Docker Compose file for integration testing a service that depends on PostgreSQL and Redis. Write a test that verifies the service correctly caches database results in Redis and invalidates the cache on updates.",
  ],
  flashcards: [
    {
      front: "What is the key difference between unit tests and integration tests?",
      back: "Unit tests isolate a single function/class using test doubles for all dependencies. Integration tests verify that real components work together, using actual databases, APIs, or message brokers.",
    },
    {
      front: "What is Testcontainers?",
      back: "A library that provides lightweight, disposable Docker containers (databases, message brokers, etc.) for integration tests. Each test gets a fresh container with known state.",
    },
    {
      front: "What is consumer-driven contract testing?",
      back: "The API consumer defines expected interactions in a contract file. The provider verifies it can fulfill those contracts. Both can deploy independently once contracts are verified.",
    },
    {
      front: "What is the transaction rollback strategy for test isolation?",
      back: "Each test runs inside a database transaction that is rolled back after assertions. Fast but cannot test committed-data features like triggers or materialized views.",
    },
    {
      front: "What is a narrow integration test?",
      back: "A test that verifies a single component against one real dependency (e.g., repository + database). Faster and more deterministic than broad integration tests that involve multiple services.",
    },
    {
      front: "What is @DynamicPropertySource in Spring Boot tests?",
      back: "An annotation that injects runtime-determined properties (like a Testcontainer's JDBC URL) into the Spring application context, replacing static configuration.",
    },
  ],
  revisionNotes: [
    "Integration tests catch bugs that unit tests with mocks cannot: SQL errors, schema mismatches, serialization issues, connection pool problems, and configuration errors.",
    "Testcontainers provides ephemeral Docker containers for databases and services. Use @Container and @DynamicPropertySource in Spring Boot, or pytest fixtures with testcontainers-python.",
    "Test data isolation strategies: transaction rollback (fast but cannot test committed data), table truncation (slower but tests committed behavior), fresh containers (cleanest but slowest startup).",
    "Contract testing decouples producer and consumer deployment. Consumer writes expected interactions -> publishes contract to broker -> provider verifies against contract.",
    "Narrow integration tests (one component + one dependency) should be the majority. Broad integration tests (multiple components) should be used sparingly for critical paths.",
    "Use the builder pattern or factory methods for test data creation instead of raw SQL scripts. This makes test setup readable and maintainable.",
  ],
  cheatSheet: [
    "Testcontainers (Java): @Container + @Testcontainers annotation, @DynamicPropertySource for Spring config injection",
    "Testcontainers (Python): with PostgresContainer() as pg, then pg.get_connection_url()",
    "Spring Boot: @SpringBootTest(webEnvironment = RANDOM_PORT) + TestRestTemplate for full integration tests",
    "supertest (Node.js): request(app).post('/path').send(body).expect(201) for Express/NestJS API tests",
    "Contract testing: consumer writes Pact test -> generates contract -> publishes to broker -> provider verifies",
    "Test isolation priority: transaction rollback (fast) > table truncation (moderate) > fresh container (cleanest)",
    "Always test both the HTTP response AND the database state in API integration tests",
  ],
  resources: [
    {
      label: "Testcontainers Documentation",
      kind: "docs",
      note: "Official docs for Java, Python, Node.js, Go, and .NET. Covers database modules, Docker Compose, networking, and CI configuration.",
    },
    {
      label: "Pact Documentation",
      kind: "docs",
      note: "Comprehensive guide to consumer-driven contract testing, Pact Broker, and CI/CD integration for contract verification.",
    },
    {
      label: "Growing Object-Oriented Software, Guided by Tests by Steve Freeman and Nat Pryce",
      kind: "book",
      note: "Demonstrates test-driven development with a strong focus on integration testing, walking through a real project end-to-end.",
    },
    {
      label: "Spring Boot Testing Documentation",
      kind: "docs",
      note: "Official guide for @SpringBootTest, @WebMvcTest, @DataJpaTest, and test slicing for integration tests.",
    },
  ],
  glossary: [
    {
      term: "Integration Test",
      definition:
        "A test that verifies the interaction between two or more real components, such as a service layer and a database, catching bugs at component boundaries.",
    },
    {
      term: "Testcontainers",
      definition:
        "A library that provides lightweight, throwaway Docker containers for databases and services during automated tests, ensuring reproducible and isolated test environments.",
    },
    {
      term: "Contract Testing",
      definition:
        "A testing approach where API consumers and providers independently verify they agree on message formats and behaviors using shared contract files.",
    },
    {
      term: "Test Fixture",
      definition:
        "The fixed state of a set of objects used as a baseline for running tests, including predefined database records, configuration, and test doubles.",
    },
    {
      term: "Narrow Integration Test",
      definition:
        "An integration test that exercises a single component against one real external dependency, providing focused coverage with reasonable speed.",
    },
    {
      term: "Pact Broker",
      definition:
        "A service that stores and manages contract files (pacts), tracks verification results, and supports 'can I deploy?' queries for safe independent deployment.",
    },
    {
      term: "Test Slice",
      definition:
        "In Spring Boot, a partial application context that loads only the beans relevant to a specific layer (e.g., @WebMvcTest for controllers, @DataJpaTest for repositories).",
    },
  ],
};
