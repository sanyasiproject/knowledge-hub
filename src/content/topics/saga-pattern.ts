import type { TopicContent } from "../types";

export const sagaPattern: TopicContent = {
  quickSummary: [
    "The saga pattern manages distributed transactions across multiple services by breaking them into a sequence of local transactions, each with a compensating action to undo its effects if a later step fails.",
    "Choreography sagas use events — each service listens for events and triggers the next step autonomously — providing loose coupling but making the workflow implicit and harder to monitor.",
    "Orchestration sagas use a central coordinator that directs each service step-by-step, providing explicit workflow visibility and centralized error handling at the cost of a coordination dependency.",
    "Compensating transactions are the undo operations for each step (e.g., refund payment, unreserve inventory) — they must be idempotent since they may be invoked multiple times during failure recovery.",
  ],
  detailed: [
    `## Why Sagas Exist

In a monolith, a single database transaction can atomically update orders, payments, and inventory. In microservices, each service owns its database — **distributed transactions** (two-phase commit) are impractical due to latency, availability concerns, and the fact that many databases and message brokers do not support them.

The **saga pattern** (originally from a 1987 paper by Garcia-Molina and Salem) replaces a single distributed transaction with a sequence of local transactions. Each step updates one service's database and publishes an event or sends a command. If any step fails, previously completed steps are undone via **compensating transactions** — application-level undo operations.`,

    `## Choreography Sagas

In a **choreography saga**, each service reacts to events and publishes its own events. Example — Order saga:
1. OrderService creates order (status: PENDING), publishes OrderCreated
2. PaymentService hears OrderCreated, charges card, publishes PaymentProcessed
3. InventoryService hears PaymentProcessed, reserves stock, publishes StockReserved
4. OrderService hears StockReserved, marks order CONFIRMED

If InventoryService fails: it publishes StockReservationFailed; PaymentService hears it and refunds (compensating transaction); OrderService hears refund and marks order FAILED.

Pros: no central coordinator, services are fully decoupled. Cons: the workflow is spread across services, difficult to understand as a whole, hard to add new steps, and cyclic event dependencies can emerge.`,

    `## Orchestration Sagas

In an **orchestration saga**, a central **saga orchestrator** controls the workflow:
1. Orchestrator sends ChargePayment command to PaymentService
2. PaymentService responds with success/failure
3. On success, orchestrator sends ReserveStock to InventoryService
4. InventoryService responds with success/failure
5. On success, orchestrator sends ConfirmOrder to OrderService
6. On any failure, orchestrator sends compensating commands to previously successful services

The orchestrator maintains the saga state (current step, which steps completed, which need compensation). It can be implemented as a state machine or process manager. Tools like Temporal, Camunda, and AWS Step Functions provide orchestration frameworks.

Pros: explicit workflow logic, easier to understand and modify, centralized error handling. Cons: the orchestrator is a coupling point and potential bottleneck.`,

    `## Compensating Transactions

Compensating transactions are not simple "rollbacks" — they are **semantic inverses**. Charging a credit card is compensated by issuing a refund, not by undoing the charge. Sending an email cannot be compensated — you might send a correction email instead.

Design rules: (1) compensating transactions must be **idempotent** — they may be invoked multiple times if the compensation itself fails and is retried; (2) they must be **retriable** — they should eventually succeed (possibly with manual intervention); (3) the order of compensation is typically reverse of execution; (4) some steps are **pivot transactions** — once executed, the saga can only move forward (e.g., after goods are shipped, you cannot un-ship them, only initiate a return).`,

    `## Saga State and Failure Handling

The saga's state must be persisted durably — if the orchestrator crashes mid-saga, it must recover and resume. State machines are common: each state represents which step the saga is at, and transitions are triggered by success/failure responses.

**Failure modes**: (1) a service is temporarily unavailable — retry with exponential backoff; (2) a service permanently rejects — trigger compensation; (3) the orchestrator crashes — recover from persisted state; (4) a compensating transaction fails — retry until success or flag for manual intervention. **Timeout handling** is critical: if a service does not respond within a deadline, the saga must decide whether to retry, compensate, or escalate.`,
  ],
  interviewQA: [
    {
      q: "When would you choose a choreography saga over an orchestration saga?",
      a: "Choose choreography when: the workflow is simple (2-4 steps), services are owned by different teams who want full autonomy, and you want maximum decoupling. Choose orchestration when: the workflow is complex with many steps, branching logic, or error handling; when you need visibility into saga state; when the workflow changes frequently; or when compensating transaction logic is intricate. In practice, orchestration is more common for business-critical workflows because it is easier to reason about, debug, and modify.",
    },
    {
      q: "What is a pivot transaction in a saga and why does it matter?",
      a: "A pivot transaction is a step after which the saga can only move forward — it cannot be compensated. For example, shipping a physical product or sending a notification. Before the pivot, any failure triggers compensation. After the pivot, the saga must complete (possibly with retries). This divides the saga into compensatable steps (before pivot), the pivot itself, and retriable steps (after pivot). The pivot determines the saga's point of no return.",
    },
    {
      q: "How do you handle the case where a compensating transaction itself fails?",
      a: "Compensating transactions must be designed as idempotent and retriable. If one fails: (1) retry with exponential backoff — most failures are transient; (2) if retries are exhausted, persist the failure state and alert operators for manual intervention; (3) log the saga state comprehensively so operators can complete compensation manually. Never leave a saga in a partially compensated state silently. The system should track which compensations succeeded and which are pending.",
    },
  ],
  mcqs: [
    {
      q: "What is the fundamental difference between a saga and a distributed transaction (2PC)?",
      options: [
        "Sagas are faster than 2PC",
        "Sagas use local transactions with compensating actions instead of global locks",
        "2PC does not support multiple services",
        "Sagas guarantee strong consistency while 2PC provides eventual consistency",
      ],
      answerIndex: 1,
      explanation:
        "2PC uses global locks and a prepare/commit protocol for atomic distributed transactions. Sagas break the transaction into local transactions, each independently committed, with compensating transactions to handle failures — no global locks.",
    },
    {
      q: "In a choreography saga, who decides to trigger compensating transactions?",
      options: [
        "A central saga orchestrator",
        "Each service independently reacts to failure events and compensates",
        "The message broker handles compensation",
        "The database rolls back automatically",
      ],
      answerIndex: 1,
      explanation:
        "In choreography, there is no central coordinator. Each service listens for failure events and independently decides whether to execute its compensating transaction.",
    },
    {
      q: "Why must compensating transactions be idempotent?",
      options: [
        "To improve performance",
        "Because they may be invoked multiple times during retry scenarios",
        "Because they run in parallel",
        "To maintain strong consistency",
      ],
      answerIndex: 1,
      explanation:
        "If a compensating transaction fails and is retried, or if duplicate failure events are received, the compensation may execute multiple times. Idempotency ensures repeating it produces the same result without side effects.",
    },
  ],
  flashcards: [
    {
      front: "What is a saga?",
      back: "A pattern for managing distributed transactions by decomposing them into a sequence of local transactions, each with a compensating action to undo its effects if a subsequent step fails.",
    },
    {
      front: "What is a compensating transaction?",
      back: "An application-level undo operation that semantically reverses a completed step. It is not a database rollback — it is a new forward action (e.g., issuing a refund to compensate a charge).",
    },
    {
      front: "What is a pivot transaction?",
      back: "A saga step that is the point of no return — once executed, the saga can only move forward. Steps before the pivot are compensatable; steps after are retriable.",
    },
    {
      front: "How does a choreography saga handle failure?",
      back: "The failing service publishes a failure event. Other services that previously completed their steps listen for failure events and independently execute their compensating transactions.",
    },
    {
      front: "Why is orchestration preferred for complex sagas?",
      back: "Orchestration centralizes workflow logic in one place, making it easier to understand, modify, debug, and monitor. Choreography scatters logic across services, and complex workflows become difficult to trace.",
    },
    {
      front: "What tools support saga orchestration?",
      back: "Temporal (durable execution), Camunda (BPMN workflow engine), AWS Step Functions (serverless state machines), MassTransit/NServiceBus (.NET saga frameworks), and Axon Framework (Java/Kotlin).",
    },
    {
      front: "How is saga state persisted?",
      back: "The orchestrator stores saga state (current step, completed steps, pending compensations) in a durable store. If the orchestrator crashes, it recovers from persisted state and resumes the saga.",
    },
  ],
  glossary: [
    {
      term: "Saga",
      definition:
        "A pattern for managing distributed transactions as a sequence of local transactions with compensating actions for failure recovery.",
    },
    {
      term: "Choreography Saga",
      definition:
        "A saga implementation where each service reacts to events autonomously, with no central coordinator directing the workflow.",
    },
    {
      term: "Orchestration Saga",
      definition:
        "A saga implementation where a central orchestrator directs each step, maintains state, and triggers compensations on failure.",
    },
    {
      term: "Compensating Transaction",
      definition:
        "An idempotent operation that semantically undoes the effect of a previously completed saga step.",
    },
    {
      term: "Pivot Transaction",
      definition:
        "A saga step after which compensation is no longer possible — the saga can only move forward from this point.",
    },
    {
      term: "Saga Orchestrator",
      definition:
        "A component that controls saga execution, maintains state, sends commands to services, and triggers compensations on failure.",
    },
    {
      term: "Process Manager",
      definition:
        "A stateful component that routes messages based on the current state of a long-running process, often used to implement saga orchestration.",
    },
  ],
};
