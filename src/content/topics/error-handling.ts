import type { TopicContent } from "../types";

export const errorHandling: TopicContent = {
  quickSummary: [
    "Prefer exceptions over error codes: exceptions separate the happy path from error handling, making both clearer. Error codes force callers to check return values, which they frequently forget, leading to silent failures.",
    "Use unchecked (runtime) exceptions in most cases. Checked exceptions (Java's throws clause) create tight coupling between layers and violate the Open/Closed Principle -- adding a new exception type requires modifying every method in the call chain.",
    "Define custom exception hierarchies aligned with your domain: DomainException as a base, with subtypes like InsufficientFundsException and OrderNotFoundException. This lets callers catch at the appropriate granularity.",
    "Adopt defensive strategies at system boundaries: fail fast for programming errors, retry with backoff for transient failures, circuit breakers for cascading failure prevention, and Result/Either types for expected failure paths."
  ],

  detailed: [
    "Exceptions vs. error codes is one of the oldest debates in software engineering. Error codes (returning -1, null, or a status enum) require the caller to check the return value after every call, leading to deeply nested if-else chains. Exceptions separate the error path from the normal flow: the try block contains only the happy path, and catch blocks handle the exceptional cases. This makes both paths easier to read and maintain.",
    "Checked exceptions in Java (exceptions that must be declared in the method signature) were designed to force callers to handle errors. In practice, they create more problems than they solve: adding a new checked exception to a low-level method requires adding throws clauses to every method in the call chain up to the handler. This violates encapsulation (callers must know implementation details) and the Open/Closed Principle (existing code must be modified). Most modern languages (C#, Python, TypeScript, Kotlin) chose not to implement checked exceptions.",
    "Custom exception hierarchies should mirror your domain, not your technology stack. Instead of throwing generic RuntimeException with a message string, create a hierarchy: AppException (base) -> DomainException (business rule violations) -> InfrastructureException (external system failures). Each exception type carries structured data (error code, entity ID, context map) rather than just a string message, enabling programmatic handling by upstream callers and API layers.",
    "The fail-fast principle states that software should report errors as close to the point of failure as possible. Validate inputs at the entry point (controller, API boundary) and throw immediately if they are invalid. Do not let bad data propagate through multiple layers before failing -- the resulting error message will be confusing and the root cause hard to trace. Guard clauses at the start of functions are the most common fail-fast pattern.",
    "Retry with exponential backoff is the standard strategy for transient failures (network timeouts, rate limits, temporary service unavailability). The key ingredients are: a maximum retry count, exponential delay (base * 2^attempt), random jitter to prevent thundering herd, and idempotency of the retried operation. Libraries like resilience4j (Java), tenacity (Python), and p-retry (TypeScript) encapsulate this pattern.",
    "The Circuit Breaker pattern, inspired by electrical circuits, prevents cascading failures. It monitors the error rate of calls to an external service. When failures exceed a threshold, the circuit 'opens' and immediately returns errors without attempting the call, giving the failing service time to recover. After a timeout, it enters a 'half-open' state and lets a test request through. If it succeeds, the circuit closes; if it fails, it opens again."
  ],

  deepDive: [
    "Result/Either types represent a paradigm shift in error handling. Instead of throwing exceptions (which are invisible in the type signature) or returning null (which callers forget to check), you return a type that explicitly encodes success or failure: `Result<T, E>` in Rust, `Either<L, R>` in functional languages, or custom sealed classes in Kotlin/TypeScript. The compiler forces callers to handle both cases, making the error path visible in the type system. This eliminates an entire class of bugs -- forgotten error handling -- at the cost of slightly more verbose call sites.",
    "Null handling is a special case of error handling that deserves its own strategy. Tony Hoare called null his 'billion-dollar mistake.' The solutions vary by language: Java has Optional<T>, Kotlin has nullable types with safe-call operators (?.), TypeScript has strict null checks, and Rust has Option<T>. The principle is the same: make null-ability explicit in the type system so the compiler catches missing null checks. Never return null from a method -- return an empty collection, an Optional, or throw an exception. Never pass null as an argument -- use overloading or optional parameters.",
    "Error handling at the architectural level involves error boundaries, dead letter queues, and compensation. In microservices, each service should translate external errors into its own domain exceptions -- do not let a database SQLException propagate across an API boundary. In event-driven systems, messages that cannot be processed go to a dead letter queue for manual review rather than blocking the entire pipeline. In long-running transactions (sagas), each step has a compensating action that undoes its effect if a later step fails.",
    "The difference between operational errors and programmer errors drives the handling strategy. Operational errors (file not found, network timeout, out of disk space) are expected at runtime and must be handled gracefully: retry, fallback, degrade, or report to the user. Programmer errors (null dereference, array index out of bounds, assertion failure) indicate bugs and should crash the process with a full stack trace so the bug is found and fixed. Silently catching programmer errors hides bugs and makes the system unreliable."
  ],

  code: [
    {
      language: "java",
      caption: "Custom exception hierarchy with structured error data",
      source: `// Base exception for the entire application
public abstract class AppException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> context;

    protected AppException(String errorCode, String message, Map<String, Object> context) {
        super(message);
        this.errorCode = errorCode;
        this.context = Collections.unmodifiableMap(context);
    }

    protected AppException(String errorCode, String message, Map<String, Object> context, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.context = Collections.unmodifiableMap(context);
    }

    public String getErrorCode() { return errorCode; }
    public Map<String, Object> getContext() { return context; }
}

// Domain-level exceptions for business rule violations
public class InsufficientFundsException extends AppException {
    public InsufficientFundsException(String accountId, BigDecimal requested, BigDecimal available) {
        super(
            "PAYMENT_001",
            String.format("Insufficient funds in account %s: requested %s, available %s",
                accountId, requested, available),
            Map.of("accountId", accountId, "requested", requested, "available", available)
        );
    }
}

public class OrderNotFoundException extends AppException {
    public OrderNotFoundException(String orderId) {
        super("ORDER_001", "Order not found: " + orderId, Map.of("orderId", orderId));
    }
}

// Infrastructure exception wrapping external system failures
public class PaymentGatewayException extends AppException {
    public PaymentGatewayException(String gatewayResponse, Throwable cause) {
        super("INFRA_001", "Payment gateway error: " + gatewayResponse,
            Map.of("gatewayResponse", gatewayResponse), cause);
    }
}

// Global exception handler translates exceptions to API responses
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        ErrorResponse body = new ErrorResponse(
            ex.getErrorCode(), ex.getMessage(), ex.getContext()
        );

        HttpStatus status = ex instanceof OrderNotFoundException
            ? HttpStatus.NOT_FOUND
            : HttpStatus.UNPROCESSABLE_ENTITY;

        log.warn("Application error: {} - {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        ErrorResponse body = new ErrorResponse("INTERNAL", "An unexpected error occurred", Map.of());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}`
    },
    {
      language: "typescript",
      caption: "Result type pattern and fail-fast validation in TypeScript",
      source: `// A Result type that makes error handling explicit in the type system
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Domain error types
interface ValidationError {
  field: string;
  message: string;
}

interface PaymentError {
  code: "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "GATEWAY_TIMEOUT";
  details: string;
}

// Functions return Result instead of throwing
function validateOrder(input: unknown): Result<ValidatedOrder, ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return err([{ field: "body", message: "Request body is required" }]);
  }

  const { items, customerId } = input as Record<string, unknown>;

  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: "items", message: "At least one item is required" });
  }

  if (typeof customerId !== "string" || customerId.trim() === "") {
    errors.push({ field: "customerId", message: "Customer ID is required" });
  }

  if (errors.length > 0) return err(errors);

  return ok({ items: items as OrderItem[], customerId: customerId as string });
}

function processPayment(order: ValidatedOrder): Result<PaymentConfirmation, PaymentError> {
  const balance = getAccountBalance(order.customerId);
  const total = calculateTotal(order.items);

  if (balance < total) {
    return err({
      code: "INSUFFICIENT_FUNDS",
      details: \`Balance \${balance} is less than order total \${total}\`,
    });
  }

  const confirmation = chargeAccount(order.customerId, total);
  return ok(confirmation);
}

// Composing Results -- the caller must handle both paths
async function handleOrderRequest(rawInput: unknown): Promise<ApiResponse> {
  const validationResult = validateOrder(rawInput);
  if (!validationResult.success) {
    return { status: 400, body: { errors: validationResult.error } };
  }

  const paymentResult = processPayment(validationResult.value);
  if (!paymentResult.success) {
    return { status: 422, body: { error: paymentResult.error } };
  }

  return { status: 200, body: { confirmation: paymentResult.value } };
}`
    },
    {
      language: "python",
      caption: "Circuit breaker and retry patterns",
      source: `import time
import random
from enum import Enum, auto
from typing import Callable, TypeVar
from dataclasses import dataclass, field

T = TypeVar("T")


# Retry with exponential backoff and jitter
def retry_with_backoff(
    func: Callable[[], T],
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    retryable_exceptions: tuple = (IOError, TimeoutError),
) -> T:
    """Retry a function with exponential backoff and jitter."""
    for attempt in range(max_attempts):
        try:
            return func()
        except retryable_exceptions as e:
            if attempt == max_attempts - 1:
                raise  # Last attempt, propagate the exception
            delay = min(base_delay * (2 ** attempt), max_delay)
            jitter = delay * random.uniform(0, 0.25)
            time.sleep(delay + jitter)
    raise RuntimeError("Unreachable")  # Satisfies type checker


# Circuit Breaker pattern
class CircuitState(Enum):
    CLOSED = auto()    # Normal operation, requests pass through
    OPEN = auto()      # Failures exceeded threshold, requests fail immediately
    HALF_OPEN = auto() # Testing if service recovered


@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    recovery_timeout: float = 30.0
    half_open_max_calls: int = 1

    _state: CircuitState = field(default=CircuitState.CLOSED, init=False)
    _failure_count: int = field(default=0, init=False)
    _last_failure_time: float = field(default=0.0, init=False)
    _half_open_calls: int = field(default=0, init=False)

    def call(self, func: Callable[[], T]) -> T:
        if self._state == CircuitState.OPEN:
            if time.time() - self._last_failure_time >= self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                self._half_open_calls = 0
            else:
                raise CircuitOpenError("Circuit is open -- failing fast")

        if self._state == CircuitState.HALF_OPEN:
            if self._half_open_calls >= self.half_open_max_calls:
                raise CircuitOpenError("Circuit is half-open -- max test calls reached")
            self._half_open_calls += 1

        try:
            result = func()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self) -> None:
        self._failure_count = 0
        self._state = CircuitState.CLOSED

    def _on_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.time()
        if self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN


class CircuitOpenError(Exception):
    """Raised when the circuit breaker is open."""
    pass


# Usage
payment_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60.0)

def process_payment(order_id: str) -> PaymentResult:
    return payment_breaker.call(
        lambda: payment_gateway.charge(order_id)
    )`
    }
  ],

  diagrams: [
    {
      title: "Circuit Breaker State Machine",
      kind: "state",
      caption: "Three states: CLOSED (normal, requests pass through, failure counter increments on errors) -> OPEN (triggered when failures exceed threshold, requests fail immediately, timer starts) -> HALF_OPEN (after recovery timeout, one test request allowed) -> back to CLOSED on success or OPEN on failure."
    },
    {
      title: "Error Handling Strategy Decision Tree",
      kind: "flow",
      caption: "Is the error a programmer bug? -> Yes: crash/log/fix. No -> Is the error transient? -> Yes: retry with backoff. No -> Is the error from an external service? -> Yes: circuit breaker + fallback. No -> Is it a business rule violation? -> Yes: return domain exception / Result.err. No -> Wrap in generic InternalError and log."
    }
  ],

  animations: [
    {
      title: "Circuit Breaker in Action",
      steps: [
        { label: "CLOSED state -- normal operation", detail: "Requests flow through to the payment service normally. The failure counter is at 0. Three successful requests pass through." },
        { label: "Failures accumulate", detail: "The payment service starts timing out. Failure count rises to 1, then 2, then hits the threshold of 3." },
        { label: "Circuit OPENS", detail: "The circuit breaker trips. All subsequent requests immediately receive a CircuitOpenError without contacting the payment service. A recovery timer starts (e.g., 60 seconds)." },
        { label: "Recovery timeout elapses -- HALF_OPEN", detail: "After 60 seconds, the circuit enters HALF_OPEN state. It allows one test request through to see if the service has recovered." },
        { label: "Test request succeeds -- circuit CLOSES", detail: "The test request succeeds. The failure counter resets to 0, the circuit returns to CLOSED, and normal traffic resumes. (If the test had failed, the circuit would return to OPEN with a new timer.)" }
      ]
    }
  ],

  comparison: {
    columns: ["Strategy", "When to Use", "Example", "Trade-off"],
    rows: [
      ["Exceptions", "Unexpected failures, exceptional conditions", "Database connection lost, file not found", "Clean separation of error path, but invisible in type signatures"],
      ["Error codes", "C/system-level code, performance-critical paths", "POSIX errno, Win32 HRESULT", "No runtime overhead, but callers forget to check return values"],
      ["Result/Either types", "Expected failure paths, functional codebases", "User input validation, API parsing", "Compiler-enforced handling, but verbose at call sites"],
      ["Checked exceptions", "Critical operations that must not be ignored (Java only)", "IOException in file I/O", "Forces handling, but creates coupling across layers"],
      ["Fail fast", "Programming errors, invalid inputs at boundaries", "Null arguments, invalid configuration", "Early detection, but can be too aggressive for user-facing flows"],
      ["Retry + backoff", "Transient failures in distributed systems", "HTTP 503, network timeouts, rate limits", "Handles temporary issues, but increases latency and requires idempotency"],
      ["Circuit breaker", "Calls to external services that may be unavailable", "Payment gateways, third-party APIs", "Prevents cascading failures, but adds complexity and may reject valid requests"],
      ["Null Object pattern", "Avoiding null checks for default behavior", "NullLogger, GuestUser", "Eliminates null checks, but can hide bugs if the null behavior is wrong"]
    ]
  },

  interviewQA: [
    {
      q: "Why does Clean Code recommend exceptions over error codes?",
      a: "Error codes mix the error-handling path with the normal path, creating deeply nested if-else structures that obscure the business logic. Exceptions separate the two: the try block contains only the happy path, and catch blocks handle errors. Additionally, error codes are easy to ignore -- a caller can simply not check the return value, leading to silent failures. Exceptions force the issue: if not caught, they propagate up the call stack and eventually crash the program with a clear stack trace, making the failure visible.",
      followUps: [
        "Are there situations where error codes are still preferable?",
        "How do Result types compare to both exceptions and error codes?",
        "How do exceptions perform in hot loops compared to error codes?"
      ]
    },
    {
      q: "What is the argument against checked exceptions?",
      a: "Checked exceptions violate the Open/Closed Principle: adding a new exception to a low-level method requires modifying the throws clause of every method in the call chain, all the way up to the handler. This creates tight coupling between layers. It also violates encapsulation: the calling method must know about exceptions from the implementation details of methods several layers below. In practice, developers work around checked exceptions by catching Exception broadly or wrapping everything in RuntimeException, defeating the purpose. Most modern languages have rejected checked exceptions entirely.",
      followUps: [
        "Does Kotlin have a better alternative to checked exceptions?",
        "When were checked exceptions actually a good design choice?",
        "How does the throws keyword in Java interact with interfaces?"
      ]
    },
    {
      q: "Explain the Circuit Breaker pattern and when to use it.",
      a: "The Circuit Breaker monitors calls to an external service and tracks failure rates. In the CLOSED state, calls pass through normally. When failures exceed a threshold, the circuit opens and immediately returns errors without calling the service, preventing cascading failures and giving the service time to recover. After a timeout, it enters HALF_OPEN state and allows one test request. If the test succeeds, the circuit closes; if it fails, it reopens. Use it when: (1) calling an external service that may be unavailable, (2) the cost of waiting for a timeout is high, (3) you want to prevent a failing downstream service from overloading your system or other downstream services.",
      followUps: [
        "How do you choose the failure threshold and recovery timeout?",
        "How does the Circuit Breaker interact with retry logic?",
        "What metrics should you monitor for circuit breaker state transitions?"
      ]
    },
    {
      q: "What are Result/Either types and why are they gaining popularity?",
      a: "Result types encode success or failure in the return type: Result<T, E> is either Ok(value) or Err(error). Unlike exceptions, which are invisible in function signatures, Result types make the error path explicit. The compiler forces callers to handle both cases, eliminating forgotten error handling. Unlike error codes, Result types cannot be confused with valid return values and carry rich error information. Rust made this pattern mainstream, and it is now common in TypeScript, Kotlin, and Swift. The trade-off is more verbose code at call sites, but the reliability gain is significant.",
      followUps: [
        "How do you chain multiple Result-returning functions without deep nesting?",
        "When should you use Result types vs. exceptions?",
        "How does Railway Oriented Programming relate to Result types?"
      ]
    },
    {
      q: "What is the difference between operational errors and programmer errors, and why does it matter?",
      a: "Operational errors are runtime conditions that can happen even in correctly written programs: network timeouts, full disks, permission denied, rate limiting. These must be handled gracefully -- retry, fallback, degrade, or report to the user. Programmer errors are bugs: null pointer dereferences, index out of bounds, broken invariants. These should crash the process with a full stack trace so the bug is discovered and fixed. The key insight is that trying to 'handle' a programmer error (e.g., catching NullPointerException and continuing) hides bugs and makes the system less reliable, not more.",
      followUps: [
        "How does this distinction affect your error handling in microservices?",
        "Should you restart a process after a programmer error?",
        "How do assertion libraries help distinguish these two types?"
      ]
    },
    {
      q: "How should you handle null in modern code?",
      a: "The fundamental rule is: make null-ability explicit in the type system. In Java, use Optional<T> for return types that may be absent (never for fields or parameters). In Kotlin, use nullable types (String?) with safe-call operators (?.). In TypeScript, enable strict null checks. Never return null from a function that could return a collection (return an empty collection instead). Never pass null as an argument (use method overloading or default parameters). For APIs, use explicit absence indicators (missing field in JSON, Optional in gRPC) rather than null values.",
      followUps: [
        "Why should Optional not be used for fields or method parameters in Java?",
        "How does Kotlin's approach differ from Java's Optional?",
        "What is the Null Object pattern and when is it useful?"
      ]
    }
  ],

  followUps: [
    "How do error boundaries work in React and how do they relate to error handling principles?",
    "What is the role of structured logging in error handling (e.g., error codes, correlation IDs)?",
    "How should microservices translate errors across API boundaries?",
    "What are dead letter queues and how do they handle unprocessable messages?",
    "How do saga patterns handle compensating transactions when a step fails?",
    "What is the relationship between error handling and observability (metrics, alerts, traces)?"
  ],

  mcqs: [
    {
      q: "Why are checked exceptions in Java considered problematic?",
      options: [
        "They are slower than unchecked exceptions at runtime",
        "They violate the Open/Closed Principle by requiring changes to method signatures up the call chain",
        "They cannot carry custom error data",
        "They are not supported by modern JVM versions"
      ],
      answerIndex: 1,
      explanation: "Adding a new checked exception to a low-level method forces modifications to the throws clause of every method in the call chain, violating the Open/Closed Principle and creating tight coupling."
    },
    {
      q: "What is the fail-fast principle?",
      options: [
        "Applications should start up as quickly as possible",
        "Errors should be detected and reported as close to the point of failure as possible",
        "Tests should fail quickly to speed up the CI pipeline",
        "Failing services should be replaced quickly by new instances"
      ],
      answerIndex: 1,
      explanation: "Fail fast means validating inputs and detecting errors early (e.g., at the API boundary), rather than letting bad data propagate through multiple layers before causing a confusing failure."
    },
    {
      q: "In the Circuit Breaker pattern, what is the HALF_OPEN state?",
      options: [
        "The circuit allows half of the incoming requests through",
        "The circuit allows one test request to check if the downstream service has recovered",
        "The circuit is transitioning between two services",
        "The circuit reduces the timeout by half"
      ],
      answerIndex: 1,
      explanation: "In HALF_OPEN state, the circuit breaker allows a limited number of test requests. If they succeed, the circuit closes (normal operation). If they fail, the circuit reopens."
    },
    {
      q: "What is the key advantage of Result types over exceptions?",
      options: [
        "They are faster at runtime",
        "They make the error path visible in the type signature, forcing callers to handle both success and failure",
        "They use less memory than exceptions",
        "They are supported by all programming languages"
      ],
      answerIndex: 1,
      explanation: "Result types make errors explicit in the return type, so the compiler ensures callers handle both paths. Exceptions are invisible in function signatures (in most languages), making it easy to forget error handling."
    },
    {
      q: "What should you return from a function that finds no matching items?",
      options: [
        "null",
        "An empty collection",
        "Throw a NoSuchElementException",
        "-1"
      ],
      answerIndex: 1,
      explanation: "Returning an empty collection (not null) lets callers iterate safely without null checks. Null is a trap -- callers forget to check it. An exception is appropriate only if 'no items' indicates an error condition."
    },
    {
      q: "When should you use retry with exponential backoff?",
      options: [
        "For all error types to improve reliability",
        "For transient failures like network timeouts, where the operation is idempotent",
        "For authentication failures to give users more chances",
        "For database constraint violations"
      ],
      answerIndex: 1,
      explanation: "Retry is appropriate for transient failures (temporary unavailability, timeouts) where the operation is idempotent. Retrying permanent failures (auth errors, constraint violations) wastes resources."
    }
  ],

  exercises: [
    "Implement a Result<T, E> type in TypeScript with map, flatMap, and mapError methods. Use it to refactor a function that currently throws exceptions for validation errors.",
    "Build a circuit breaker class in your language of choice with CLOSED, OPEN, and HALF_OPEN states. Write tests that simulate failures and verify state transitions.",
    "Review error handling in a service you own: identify places where exceptions are caught too broadly (catch Exception) and narrow them to specific exception types with appropriate handling for each.",
    "Create a custom exception hierarchy for a domain you work with. Ensure each exception carries structured data (error code, context map) and write a global exception handler that translates them to API responses.",
    "Find a function that returns null on failure. Refactor it to return Optional (Java), a union type (TypeScript), or raise a descriptive exception, and update all callers."
  ],

  flashcards: [
    { front: "Why prefer exceptions over error codes?", back: "Exceptions separate the error path from the happy path, making both clearer. Error codes mix them and are easy to ignore, leading to silent failures." },
    { front: "What is the argument against checked exceptions?", back: "They create coupling: adding a new exception to a low-level method requires modifying throws clauses in every method up the call chain, violating OCP and encapsulation." },
    { front: "Name the three states of a Circuit Breaker.", back: "CLOSED (normal operation), OPEN (failing fast, requests rejected immediately), HALF_OPEN (testing recovery with one request)." },
    { front: "What is fail-fast?", back: "Detect and report errors as early as possible, especially at system boundaries. Validate inputs immediately rather than letting bad data propagate." },
    { front: "What is a Result/Either type?", back: "A return type that explicitly encodes success or failure (Ok(value) | Err(error)), forcing callers to handle both cases at compile time." },
    { front: "Why should functions not return null?", back: "Callers forget to check for null, causing NullPointerExceptions far from the source. Return empty collections, Optional, or throw descriptive exceptions instead." },
    { front: "What is the difference between operational and programmer errors?", back: "Operational errors (network timeout, disk full) are expected and must be handled gracefully. Programmer errors (null deref, index OOB) are bugs and should crash with a stack trace." },
    { front: "What three ingredients does retry with backoff need?", back: "1) Maximum retry count. 2) Exponential delay with jitter. 3) The operation must be idempotent." }
  ],

  revisionNotes: [
    "Exceptions separate error handling from business logic; error codes mix them.",
    "Checked exceptions create tight coupling across layers; prefer unchecked exceptions.",
    "Custom exception hierarchies should mirror the domain: DomainException, InfrastructureException, etc.",
    "Fail fast at boundaries: validate inputs early, throw immediately on invalid data.",
    "Retry with backoff for transient failures only; the operation must be idempotent.",
    "Circuit Breaker: CLOSED -> OPEN (on failure threshold) -> HALF_OPEN (after timeout) -> CLOSED (on test success).",
    "Result types make errors visible in the type system; the compiler forces callers to handle both paths.",
    "Never return null -- return empty collections, Optional, or throw descriptive exceptions."
  ],

  cheatSheet: [
    "Exceptions > error codes: cleaner separation, harder to ignore",
    "Unchecked exceptions > checked: avoid coupling across layers",
    "Custom exception hierarchy: AppException -> DomainException, InfrastructureException",
    "Fail fast: validate at boundaries, throw immediately on invalid input",
    "Guard clauses: check preconditions at the start of functions",
    "Retry: exponential backoff + jitter, max retries, idempotent operations only",
    "Circuit Breaker: CLOSED -> OPEN (threshold) -> HALF_OPEN (timeout) -> CLOSED (success)",
    "Result types: explicit success/failure in return type, compiler-enforced handling",
    "Never return null: use empty collections, Optional, or exceptions",
    "Operational errors: handle gracefully. Programmer errors: crash and fix the bug."
  ],

  resources: [
    { label: "Clean Code, Chapter 7: Error Handling", kind: "book", note: "Robert C. Martin's principles for clean error handling with exceptions" },
    { label: "Release It! by Michael Nygard", kind: "book", note: "Definitive guide to stability patterns: Circuit Breaker, Timeouts, Bulkheads, and Fail Fast" },
    { label: "Effective Java, Items 69-77", kind: "book", note: "Joshua Bloch's guidelines on exceptions: checked vs unchecked, custom hierarchies, and common pitfalls" },
    { label: "Railway Oriented Programming (Scott Wlaschin)", kind: "video", note: "Functional approach to error handling using Result types and composition" },
    { label: "resilience4j documentation", kind: "docs", note: "Production-grade circuit breaker, retry, rate limiter, and bulkhead library for Java" }
  ],

  glossary: [
    { term: "Checked Exception", definition: "An exception that must be declared in the method signature (Java's throws clause). Callers are forced to handle or propagate it. Criticized for creating coupling across layers." },
    { term: "Unchecked Exception", definition: "A runtime exception that does not need to be declared in the method signature. Used for programming errors and most application exceptions in modern codebases." },
    { term: "Circuit Breaker", definition: "A stability pattern that monitors failure rates to an external service and stops sending requests (opens the circuit) when failures exceed a threshold, preventing cascading failures." },
    { term: "Fail Fast", definition: "The principle of detecting and reporting errors as early as possible, typically by validating inputs at system boundaries before processing." },
    { term: "Result Type", definition: "A type that explicitly encodes success (Ok(value)) or failure (Err(error)), making the error path visible in the function's return type and enforcing handling by the caller." },
    { term: "Exponential Backoff", definition: "A retry strategy where the delay between attempts increases exponentially (e.g., 1s, 2s, 4s, 8s), typically with added random jitter to prevent synchronized retries." },
    { term: "Operational Error", definition: "A runtime condition expected in production (network timeout, disk full, rate limit) that must be handled gracefully, as opposed to programmer errors (bugs)." },
    { term: "Guard Clause", definition: "A conditional check at the beginning of a function that returns early or throws an exception if a precondition is not met, implementing the fail-fast principle." }
  ]
};
