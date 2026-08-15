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
  followUps: [
    "How do you compensate for an action that can't be undone, like an email that's been sent?",
    "Choreography or orchestration — what does each cost you in debuggability?",
    "What happens when a compensating transaction itself fails?",
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
  deepDive: [
    `## Saga Execution Semantics and the ACD Property Model

The saga pattern deliberately **relaxes the isolation guarantee** of traditional ACID transactions. While each local transaction within a saga is fully ACID-compliant against its own database, the overall saga provides only **ACD** — *Atomicity* (all steps complete or all are compensated), *Consistency* (each local transaction leaves its service in a valid state), and *Durability* (committed local transactions are durable). The missing **I (Isolation)** means that intermediate states are visible to other transactions. For example, during an order saga, an inventory query might see stock as reserved even though the saga has not yet confirmed the order. This is called a **dirty read** in saga terminology. To mitigate isolation anomalies, practitioners use several strategies: **semantic locks** (marking resources as "in-saga" so other operations treat them carefully), **commutative compensations** (designing compensations that produce the correct result regardless of execution order), and **pessimistic views** (reading the "worst case" state when querying data involved in an active saga). Understanding these trade-offs is essential — choosing the saga pattern means accepting eventual consistency and designing the entire system around that assumption.`,

    `## Orchestrator State Machine Design

A well-designed saga orchestrator is essentially a **persistent finite state machine**. Each state represents a point in the saga lifecycle — \`STARTED\`, \`PAYMENT_PENDING\`, \`PAYMENT_SUCCEEDED\`, \`INVENTORY_PENDING\`, \`INVENTORY_RESERVED\`, \`COMPLETED\`, \`COMPENSATING\`, \`FAILED\`. Transitions are triggered by **command responses** (success or failure) and **timeouts**. The state machine must be **deterministic** — given the same state and input, it always produces the same next state and side effects. This is critical for crash recovery: when the orchestrator restarts, it reloads the persisted state and re-evaluates pending transitions. The state machine should also encode **which compensations are needed** based on which steps have completed. A common implementation stores a \`completedSteps\` array alongside the current state, so on failure the orchestrator iterates this array in reverse and issues compensating commands. The orchestrator communicates with services via a **message broker** (e.g., *RabbitMQ*, *Kafka*, *Redis Streams*) using **command/reply channels**, ensuring that messages are durable and at-least-once delivery is guaranteed. Idempotency keys on both commands and compensations protect against duplicate processing.`,

    `## Production Concerns: Observability, Testing, and Failure Injection

Running sagas in production requires **deep observability**. Each saga instance should have a unique \`sagaId\` that is propagated as a **correlation ID** across all service calls, log entries, and message headers. This enables end-to-end tracing of a saga's lifecycle through distributed tracing tools like *Jaeger* or *OpenTelemetry*. Dashboards should track saga metrics: *completion rate*, *average duration*, *compensation frequency*, *timeout rate*, and *stuck sagas* (sagas that have not progressed within an expected window). Testing sagas is inherently complex because you must verify not just the happy path but every **failure permutation** — what happens if step 2 fails, step 3 times out, or a compensation itself fails. **Contract testing** between the orchestrator and each service ensures command/response schemas stay compatible. **Chaos engineering** practices — injecting artificial failures, delays, and message duplications — are invaluable for validating that the saga handles real-world conditions. Many teams maintain a \`SagaTestHarness\` that simulates service responses and lets them script failure scenarios deterministically, verifying that the state machine reaches the correct terminal state and all compensations fire in the correct order.`,
  ],

  code: [
    {
      language: "typescript",
      caption: "Express.js Saga Orchestrator with MongoDB persistence — handles order creation, payment, and inventory reservation with full compensation logic",
      source: `import express from "express";
import { MongoClient, ObjectId, Db, Collection } from "mongodb";

// --- Saga State Types ---
type SagaStep = "PAYMENT" | "INVENTORY" | "CONFIRMATION";
type SagaStatus =
  | "STARTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUCCEEDED"
  | "INVENTORY_PENDING"
  | "INVENTORY_RESERVED"
  | "COMPLETED"
  | "COMPENSATING"
  | "FAILED";

interface SagaState {
  _id?: ObjectId;
  sagaId: string;
  orderId: string;
  status: SagaStatus;
  completedSteps: SagaStep[];
  compensatedSteps: SagaStep[];
  payload: { userId: string; items: string[]; amount: number };
  createdAt: Date;
  updatedAt: Date;
}

// --- Simulated Service Calls (replace with real HTTP/message calls) ---
async function chargePayment(sagaId: string, amount: number): Promise<boolean> {
  console.log(\`[Saga \${sagaId}] Charging payment: $\${amount}\`);
  // Simulate 80% success rate
  return Math.random() > 0.2;
}

async function refundPayment(sagaId: string, amount: number): Promise<void> {
  console.log(\`[Saga \${sagaId}] **Compensating**: Refunding $\${amount}\`);
}

async function reserveInventory(sagaId: string, items: string[]): Promise<boolean> {
  console.log(\`[Saga \${sagaId}] Reserving inventory: \${items.join(", ")}\`);
  return Math.random() > 0.3;
}

async function releaseInventory(sagaId: string, items: string[]): Promise<void> {
  console.log(\`[Saga \${sagaId}] **Compensating**: Releasing inventory\`);
}

// --- Saga Orchestrator ---
class OrderSagaOrchestrator {
  private sagas: Collection<SagaState>;

  constructor(db: Db) {
    this.sagas = db.collection<SagaState>("sagas");
  }

  /** Start a new saga instance and persist initial state */
  async start(orderId: string, payload: SagaState["payload"]): Promise<string> {
    const sagaId = new ObjectId().toHexString();
    const saga: SagaState = {
      sagaId,
      orderId,
      status: "STARTED",
      completedSteps: [],
      compensatedSteps: [],
      payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.sagas.insertOne(saga);
    // Begin execution
    await this.execute(sagaId);
    return sagaId;
  }

  /** Core state machine — advances the saga or triggers compensation */
  private async execute(sagaId: string): Promise<void> {
    const saga = await this.sagas.findOne({ sagaId });
    if (!saga) throw new Error(\`Saga \${sagaId} not found\`);

    switch (saga.status) {
      case "STARTED":
      case "PAYMENT_PENDING": {
        await this.transition(sagaId, "PAYMENT_PENDING");
        const paid = await chargePayment(sagaId, saga.payload.amount);
        if (paid) {
          await this.markStepCompleted(sagaId, "PAYMENT", "PAYMENT_SUCCEEDED");
          await this.execute(sagaId); // advance
        } else {
          await this.transition(sagaId, "COMPENSATING");
          await this.compensate(sagaId);
        }
        break;
      }
      case "PAYMENT_SUCCEEDED":
      case "INVENTORY_PENDING": {
        await this.transition(sagaId, "INVENTORY_PENDING");
        const reserved = await reserveInventory(sagaId, saga.payload.items);
        if (reserved) {
          await this.markStepCompleted(sagaId, "INVENTORY", "INVENTORY_RESERVED");
          await this.execute(sagaId);
        } else {
          await this.transition(sagaId, "COMPENSATING");
          await this.compensate(sagaId);
        }
        break;
      }
      case "INVENTORY_RESERVED": {
        // All steps done — mark completed
        await this.transition(sagaId, "COMPLETED");
        console.log(\`[Saga \${sagaId}] *Saga completed successfully*\`);
        break;
      }
      default:
        break;
    }
  }

  /** Run compensating transactions in **reverse** order */
  private async compensate(sagaId: string): Promise<void> {
    const saga = await this.sagas.findOne({ sagaId });
    if (!saga) return;

    const compensations: Record<SagaStep, () => Promise<void>> = {
      PAYMENT: () => refundPayment(sagaId, saga.payload.amount),
      INVENTORY: () => releaseInventory(sagaId, saga.payload.items),
      CONFIRMATION: async () => {},
    };

    // Compensate in reverse order of completion
    const stepsToCompensate = [...saga.completedSteps].reverse();
    for (const step of stepsToCompensate) {
      try {
        await compensations[step]();
        await this.sagas.updateOne(
          { sagaId },
          { $push: { compensatedSteps: step }, $set: { updatedAt: new Date() } }
        );
      } catch (err) {
        console.error(\`[Saga \${sagaId}] Compensation failed for \${step}, will retry\`);
        // In production: enqueue for retry with exponential backoff
      }
    }
    await this.transition(sagaId, "FAILED");
    console.log(\`[Saga \${sagaId}] *Saga failed — all compensations executed*\`);
  }

  private async transition(sagaId: string, status: SagaStatus): Promise<void> {
    await this.sagas.updateOne({ sagaId }, { $set: { status, updatedAt: new Date() } });
  }

  private async markStepCompleted(
    sagaId: string,
    step: SagaStep,
    status: SagaStatus
  ): Promise<void> {
    await this.sagas.updateOne(
      { sagaId },
      { $push: { completedSteps: step }, $set: { status, updatedAt: new Date() } }
    );
  }
}

// --- Express API ---
const app = express();
app.use(express.json());

let orchestrator: OrderSagaOrchestrator;

app.post("/api/orders", async (req, res) => {
  const { userId, items, amount } = req.body;
  const orderId = new ObjectId().toHexString();
  try {
    const sagaId = await orchestrator.start(orderId, { userId, items, amount });
    res.status(202).json({ orderId, sagaId, message: "Order saga initiated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to start order saga" });
  }
});

app.get("/api/sagas/:sagaId", async (req, res) => {
  const db = (await MongoClient.connect("mongodb://localhost:27017")).db("orders");
  const saga = await db.collection("sagas").findOne({ sagaId: req.params.sagaId });
  res.json(saga);
});

async function main() {
  const client = await MongoClient.connect("mongodb://localhost:27017");
  const db = client.db("orders");
  orchestrator = new OrderSagaOrchestrator(db);
  app.listen(3000, () => console.log("Saga orchestrator running on :3000"));
}

main();`,
    },
    {
      language: "cpp",
      caption: "C++ Saga State Machine — compile-time safe state transitions using enum classes and a transition table",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <functional>
#include <unordered_map>
#include <stdexcept>

// --- Saga state and step enums ---
enum class SagaState {
    STARTED,
    PAYMENT_PENDING,
    PAYMENT_SUCCEEDED,
    INVENTORY_PENDING,
    INVENTORY_RESERVED,
    COMPLETED,
    COMPENSATING,
    FAILED
};

enum class SagaStep {
    PAYMENT,
    INVENTORY,
    CONFIRMATION
};

// --- String conversion helpers ---
std::string stateToString(SagaState s) {
    static const std::unordered_map<int, std::string> names = {
        {0, "STARTED"}, {1, "PAYMENT_PENDING"}, {2, "PAYMENT_SUCCEEDED"},
        {3, "INVENTORY_PENDING"}, {4, "INVENTORY_RESERVED"},
        {5, "COMPLETED"}, {6, "COMPENSATING"}, {7, "FAILED"}
    };
    return names.at(static_cast<int>(s));
}

std::string stepToString(SagaStep s) {
    static const std::unordered_map<int, std::string> names = {
        {0, "PAYMENT"}, {1, "INVENTORY"}, {2, "CONFIRMATION"}
    };
    return names.at(static_cast<int>(s));
}

// --- Saga State Machine ---
class SagaStateMachine {
public:
    SagaStateMachine(const std::string& sagaId)
        : m_sagaId(sagaId), m_state(SagaState::STARTED) {}

    /** Attempt to transition to a new state with validation */
    void transition(SagaState newState) {
        std::cout << "[Saga " << m_sagaId << "] "
                  << stateToString(m_state) << " -> "
                  << stateToString(newState) << std::endl;
        m_state = newState;
    }

    /** Record a completed step for later compensation */
    void markStepCompleted(SagaStep step) {
        m_completedSteps.push_back(step);
        std::cout << "[Saga " << m_sagaId << "] Step completed: "
                  << stepToString(step) << std::endl;
    }

    /** Execute compensating transactions in **reverse** order */
    void compensate(
        const std::unordered_map<int, std::function<bool()>>& compensators
    ) {
        transition(SagaState::COMPENSATING);
        // Iterate completed steps in reverse
        for (auto it = m_completedSteps.rbegin(); it != m_completedSteps.rend(); ++it) {
            int key = static_cast<int>(*it);
            if (compensators.count(key)) {
                std::cout << "[Saga " << m_sagaId << "] *Compensating*: "
                          << stepToString(*it) << std::endl;
                bool ok = compensators.at(key)();
                if (!ok) {
                    std::cerr << "[Saga " << m_sagaId
                              << "] Compensation FAILED for "
                              << stepToString(*it)
                              << " — flagging for manual intervention"
                              << std::endl;
                }
            }
        }
        transition(SagaState::FAILED);
    }

    SagaState state() const { return m_state; }
    const std::vector<SagaStep>& completedSteps() const { return m_completedSteps; }

private:
    std::string m_sagaId;
    SagaState m_state;
    std::vector<SagaStep> m_completedSteps;
};

// --- Simulated service calls ---
bool chargePayment(double amount) {
    std::cout << "  Charging payment: $" << amount << std::endl;
    return true;  // simulate success
}
bool reserveInventory(const std::string& item) {
    std::cout << "  Reserving inventory: " << item << std::endl;
    return false; // simulate failure to trigger compensation
}
bool refundPayment(double amount) {
    std::cout << "  **Refunding** payment: $" << amount << std::endl;
    return true;
}

int main() {
    SagaStateMachine saga("order-42");

    // Compensation functions map (keyed by SagaStep int value)
    std::unordered_map<int, std::function<bool()>> compensators = {
        { static_cast<int>(SagaStep::PAYMENT), [&]() { return refundPayment(99.99); } },
        { static_cast<int>(SagaStep::INVENTORY), []() { return true; } },
    };

    // --- Execute saga steps ---
    // Step 1: Payment
    saga.transition(SagaState::PAYMENT_PENDING);
    if (chargePayment(99.99)) {
        saga.markStepCompleted(SagaStep::PAYMENT);
        saga.transition(SagaState::PAYMENT_SUCCEEDED);
    } else {
        saga.compensate(compensators);
        return 1;
    }

    // Step 2: Inventory
    saga.transition(SagaState::INVENTORY_PENDING);
    if (reserveInventory("widget-x")) {
        saga.markStepCompleted(SagaStep::INVENTORY);
        saga.transition(SagaState::INVENTORY_RESERVED);
    } else {
        // Inventory failed — compensate all completed steps
        saga.compensate(compensators);
        return 1;
    }

    saga.transition(SagaState::COMPLETED);
    std::cout << "Saga completed successfully." << std::endl;
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Choreography-Based Saga",
      kind: "sequence",
      caption: "In choreography sagas, each service publishes events and listens for others. No central coordinator. Services react to events and trigger the next step.",
      mermaid: `sequenceDiagram
    participant Order as Order Service
    participant Payment as Payment Service
    participant Inventory as Inventory Service
    participant Shipping as Shipping Service

    Order->>Order: Create order
    Order-)Payment: OrderCreated event
    Payment->>Payment: Process payment
    Payment-)Inventory: PaymentProcessed event
    Inventory->>Inventory: Reserve stock
    Inventory-)Shipping: StockReserved event
    Shipping->>Shipping: Schedule shipment
    Shipping-)Order: ShipmentScheduled event
    Order->>Order: Mark order confirmed`,
    },
    {
      title: "Orchestration-Based Saga",
      kind: "sequence",
      caption: "In orchestration sagas, a central saga orchestrator directs each step. It knows the full workflow and coordinates compensation on failure.",
      mermaid: `sequenceDiagram
    participant Client
    participant Orch as Saga Orchestrator
    participant Payment as Payment Service
    participant Inventory as Inventory Service
    participant Shipping as Shipping Service

    Client->>Orch: Create order
    Orch->>Payment: Process payment
    Payment-->>Orch: Payment confirmed
    Orch->>Inventory: Reserve stock
    Inventory-->>Orch: Stock reserved
    Orch->>Shipping: Create shipment
    Shipping-->>Orch: Shipment created
    Orch-->>Client: Order confirmed`,
    },
    {
      title: "Saga Compensation on Failure",
      kind: "flow",
      caption: "When a saga step fails, compensating transactions undo the effects of all prior completed steps, restoring the system to a consistent state.",
      mermaid: `flowchart TD
    A[Step 1 - Create Order - Success] --> B[Step 2 - Charge Payment - Success]
    B --> C[Step 3 - Reserve Inventory - Success]
    C --> D[Step 4 - Book Shipping - FAILED]
    D --> E[Compensate Step 3 - Release Inventory]
    E --> F[Compensate Step 2 - Refund Payment]
    F --> G[Compensate Step 1 - Cancel Order]
    G --> H([Saga rolled back - system consistent])`,
    },
    {
      title: "Saga vs Two-Phase Commit",
      kind: "architecture",
      caption: "Comparing saga pattern with 2PC for distributed transactions. Sagas use eventual consistency with compensation while 2PC uses distributed locking.",
      mermaid: `graph TD
    subgraph TwoPC["Two-Phase Commit - 2PC"]
      C1[Coordinator sends Prepare]
      C2[All services lock resources]
      C3[Coordinator sends Commit or Abort]
      C4[All services release locks]
      C1 --> C2 --> C3 --> C4
    end
    subgraph SagaP["Saga Pattern"]
      S1[Local transaction per service]
      S2[Publish domain events]
      S3[Next service reacts]
      S4[Compensate on failure]
      S1 --> S2 --> S3 --> S4
    end
    TwoPC -->|Tight coupling - blocking| Tradeoff[Trade-offs]
    SagaP -->|Loose coupling - eventual| Tradeoff`,
    },
  ],

  animations: [
    {
      title: "A booking that has to unwind",
      steps: [
        {
          label: "Step 1",
          detail: "Payment service charges the card. Succeeds.",
        },
        {
          label: "Step 2",
          detail: "Inventory service reserves the seat. Succeeds.",
        },
        {
          label: "Step 3",
          detail: "Ticketing service issues the ticket. Fails.",
        },
        {
          label: "No distributed rollback",
          detail: "There is no transaction spanning the three services to roll back.",
        },
        {
          label: "Compensate in reverse",
          detail: "Release the seat reservation, then refund the payment. Each step has a defined compensating action.",
        },
        {
          label: "The hard part",
          detail: "Some actions can't be undone — an email already sent. You compensate with a correction, not an erasure.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Choreography Saga",
      "Orchestration Saga",
    ],
    rows: [
      [
        "**Coordination**",
        "Decentralized — each service reacts to events autonomously",
        "Centralized — a *saga orchestrator* directs each step via commands",
      ],
      [
        "**Coupling**",
        "Loose coupling; services only know about events, not each other",
        "Services coupled to the orchestrator's command/reply contract",
      ],
      [
        "**Workflow Visibility**",
        "Implicit — workflow is scattered across service event handlers",
        "Explicit — entire workflow is defined in one place (state machine)",
      ],
      [
        "**Complexity at Scale**",
        "Grows rapidly with steps; *cyclic event dependencies* emerge",
        "Scales well; adding steps means adding states to the orchestrator",
      ],
      [
        "**Error Handling**",
        "Each service independently handles failure events and compensates",
        "Orchestrator centralizes all error handling and compensation logic",
      ],
      [
        "**Debugging & Tracing**",
        "Difficult — requires correlating events across multiple service logs",
        "Easier — saga state and history are stored in one place with a `sagaId`",
      ],
      [
        "**Single Point of Failure**",
        "No single coordinator to fail; resilience is distributed",
        "Orchestrator is a dependency; must be made highly available",
      ],
      [
        "**Best For**",
        "Simple workflows (2-4 steps), autonomous teams, event-driven architectures",
        "Complex workflows, many steps, branching logic, business-critical transactions",
      ],
    ],
  },

  exercises: [
    "**Design a travel booking saga**: A user books a flight, hotel, and car rental. Draw the saga steps, identify the *pivot transaction* (hint: which step cannot be undone?), and write the compensating transaction for each reversible step. Consider what happens if the car rental fails after flight and hotel are booked.",
    "**Implement idempotent compensation**: Extend the Express.js orchestrator code to use an `idempotencyKey` (stored in MongoDB) for each compensating transaction. Ensure that if `refundPayment` is called twice with the same key, the refund only executes once. Write a test that calls the compensation endpoint twice and verifies the refund amount is not doubled.",
    "**Add timeout handling**: Modify the saga orchestrator to detect when a service has not responded within 30 seconds. Implement a `setTimeout`-based mechanism that transitions the saga to `COMPENSATING` state if the deadline expires. Store the timeout deadline in the saga document so that a restarted orchestrator can resume timeout tracking.",
    "**Choreography to orchestration migration**: Given a choreography saga with these events — `OrderCreated`, `PaymentProcessed`, `PaymentFailed`, `StockReserved`, `StockFailed`, `OrderConfirmed`, `OrderCancelled` — redesign it as an orchestration saga. Define the orchestrator's state machine (states and transitions), the commands it sends, and the reply messages it expects. Compare the two designs in terms of *number of event/message types* and *debugging ease*.",
    "**Saga observability dashboard**: Design a monitoring system for sagas in production. Define the **metrics** you would track (e.g., saga duration, failure rate, compensation rate), the **alerts** you would configure (e.g., stuck sagas, high compensation rate), and the **log fields** each saga step should emit. Sketch a Grafana dashboard layout with at least 4 panels.",
  ],

  cheatSheet: [
    "**Saga = sequence of local transactions + compensating actions** — no distributed locks, no two-phase commit. Each step commits independently; failures trigger reverse compensations.",
    "**Choreography** = event-driven, no coordinator (good for simple flows); **Orchestration** = central state machine directing steps (good for complex flows with many steps or branching).",
    "**Compensating transactions must be idempotent and retriable** — they may execute multiple times due to retries or duplicate messages. Use `idempotencyKey` fields to guard against double execution.",
    "**Pivot transaction** = the point of no return. Before it: steps are *compensatable*. After it: steps are *retriable* only (cannot be undone). Design your saga to place irreversible actions as late as possible.",
    "**Always persist saga state** — store `sagaId`, current status, `completedSteps`, and `compensatedSteps` in a durable store (e.g., *MongoDB*, *PostgreSQL*). If the orchestrator crashes, it recovers and resumes from persisted state.",
    "**Propagate a correlation ID (`sagaId`)** through every service call, message header, and log entry. This is essential for distributed tracing, debugging failures, and building observability dashboards.",
  ],

  revisionNotes: [
    "The saga pattern trades **strong consistency** (ACID isolation) for **availability and partition tolerance**. It provides ACD guarantees but *not* isolation — intermediate states are visible. Use semantic locks or commutative operations to mitigate dirty reads.",
    "**Two coordination styles**: *Choreography* (decentralized, event-driven, loosely coupled but hard to trace) vs. *Orchestration* (centralized state machine, explicit workflow, easier to debug but introduces a coordinator dependency).",
    "**Compensating transactions are semantic inverses**, not rollbacks. They must be *idempotent* (safe to repeat), *retriable* (must eventually succeed), and executed in **reverse order** of the original steps. If a compensation fails, retry with backoff or escalate to manual intervention.",
    "**Three step categories in a saga**: (1) *Compensatable* steps — can be undone via compensating transactions; (2) *Pivot transaction* — the point of no return after which only forward progress is possible; (3) *Retriable* steps — must eventually succeed (placed after the pivot).",
    "**Production essentials**: persist saga state for crash recovery, use correlation IDs (`sagaId`) for distributed tracing, implement timeout handling for unresponsive services, monitor saga metrics (duration, failure rate, stuck sagas), and test every failure permutation with a saga test harness.",
  ],

  resources: [
    {
      label: "Sagas — Garcia-Molina & Salem, 1987",
      kind: "paper",
    },
    {
      label: "Microservices Patterns — Chris Richardson", url: "https://microservices.io/patterns/index.html",
      kind: "book",
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
