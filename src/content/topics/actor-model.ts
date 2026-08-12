import type { TopicContent } from "../types";

export const actorModel: TopicContent = {
  quickSummary: [
    "The Actor Model, proposed by Carl Hewitt in 1973, is a mathematical model of concurrent computation where 'actors' are the universal primitives. Each actor can send messages to other actors, create new actors, and determine its behavior for the next message it receives. There is no shared state -- all communication happens through asynchronous message passing.",
    "Erlang/OTP is the most prominent implementation, powering telecom switches requiring 99.9999999% uptime. Its 'let it crash' philosophy embraces failure: instead of defensive programming, supervisors monitor worker processes and restart them on failure, forming supervision trees that provide fault tolerance at the architectural level.",
    "Communicating Sequential Processes (CSP), formalized by Tony Hoare in 1978, is a related but distinct model used by Go channels and Clojure's core.async. While actors send messages to named processes, CSP communicates through named channels -- the sender and receiver are decoupled through the channel abstraction.",
    "Akka (now Apache Pekko) brought the actor model to the JVM with typed actors, cluster sharding, persistence (event sourcing), and location transparency -- actors communicate identically whether on the same JVM or across a network, enabling elastic distributed systems."
  ],

  detailed: [
    "## Actor Model Fundamentals (Hewitt 1973)\n\nThe Actor Model defines three fundamental capabilities for each actor upon receiving a message: (1) **Send** a finite number of messages to other actors whose addresses it knows, (2) **Create** a finite number of new actors, (3) **Designate** the behavior to be used for the next message it receives. There is no assumed ordering of message delivery -- messages may arrive in any order, and the model is inherently non-deterministic. Each actor has a mailbox (message queue) and processes one message at a time, guaranteeing sequential consistency within a single actor. This eliminates data races by construction -- no locks, no mutexes, no shared mutable state.",

    "## Erlang/OTP and Supervision Trees\n\nErlang processes are lightweight (roughly 300 bytes of memory each), preemptively scheduled by the BEAM VM, and fully isolated -- a crash in one process cannot corrupt another's memory. OTP (Open Telecom Platform) provides behaviors: gen_server (client-server), gen_statem (state machines), gen_event (event handling), and supervisor (fault tolerance). Supervision trees organize processes hierarchically: supervisors monitor children and apply restart strategies -- one_for_one (restart only the crashed child), one_for_all (restart all children), rest_for_one (restart the crashed child and those started after it). This architecture powered Ericsson's AXD301 ATM switch achieving nine nines of availability.",

    "## CSP vs Actor Model\n\nCSP and the Actor Model address concurrency differently. In the Actor Model, processes are named entities with identity -- you send messages to a specific actor. In CSP, channels are the named entities -- processes are anonymous and communicate through shared channels. Go channels implement CSP: goroutines (lightweight threads) communicate through typed channels with optional buffering. CSP channels are synchronous by default (the sender blocks until the receiver is ready), enforcing a rendezvous. Actor mailboxes are asynchronous by default (the sender never blocks). CSP select statements allow waiting on multiple channels simultaneously, analogous to Erlang's receive with pattern matching across message types.",

    "## Location Transparency and Distribution\n\nLocation transparency means actors communicate using the same mechanism regardless of whether they are in the same process, on the same machine, or across a network. Erlang achieves this natively -- Erlang nodes connect via a distribution protocol, and sending a message to a remote pid is syntactically identical to a local send. Akka Cluster extends this with cluster sharding (automatically distributing actors across nodes), split-brain resolution, and cluster singleton patterns. This abstraction enables elastic scaling: actors can be migrated between nodes without changing application code. The tradeoff is that network failures, latency, and partial failures cannot be fully abstracted away (the fallacies of distributed computing).",

    "## Message Passing vs Shared Memory\n\nThe actor model's central thesis is that message passing is a safer and more composable concurrency primitive than shared memory with locks. Shared memory concurrency suffers from: data races, deadlocks, priority inversion, lock convoy, and the difficulty of reasoning about interleaved execution. Message passing eliminates these by removing shared mutable state entirely. However, it introduces its own challenges: mailbox overflow, message ordering guarantees (Erlang guarantees ordering between two specific processes but not globally), potential for deadlocks through circular message dependencies, and the cost of copying data between actors (Erlang copies all messages; Akka can use shared references within the same JVM).",

    "## Let-it-Crash Philosophy\n\nTraditional defensive programming wraps every operation in try-catch blocks, leading to complex error handling that often masks or mishandles failures. The let-it-crash philosophy instead separates error handling from business logic: worker processes handle the happy path and crash on any unexpected condition; supervisor processes handle recovery by restarting workers with clean state. This approach yields simpler code (no defensive error handling), faster recovery (restart is often faster than diagnosis), and isolation of failure (a crashed process cannot corrupt the system). The key insight is that most transient errors (network timeouts, resource exhaustion, corrupted state) are best handled by restarting with a known good state."
  ],

  deepDive: [
    "## BEAM VM Internals and Scheduling\n\nThe BEAM (Bogdan/Bjorn's Erlang Abstract Machine) uses preemptive scheduling based on reduction counting -- each process gets approximately 4000 reductions (roughly equivalent to function calls) before being preempted. This ensures soft real-time guarantees: no single process can starve others. The VM runs one scheduler per CPU core, each with its own run queue, and uses work-stealing for load balancing. Process memory is individually garbage collected (per-process heap), meaning GC pauses affect only one process, not the entire system. Binary data larger than 64 bytes is stored on a shared heap with reference counting, enabling efficient message passing of large payloads without copying. The BEAM also supports hot code reloading: a module can have two versions loaded simultaneously, allowing running processes to be upgraded without downtime.",

    "## Akka Persistence and Event Sourcing\n\nAkka Persistence implements event sourcing for actors: instead of storing current state, the actor persists a sequence of events (the journal). State is reconstructed by replaying events, and snapshots periodically checkpoint state to bound recovery time. This provides: (1) complete audit trail of all state changes, (2) the ability to rebuild state at any point in time, (3) natural fit with CQRS (Command Query Responsibility Segregation), (4) reliable state recovery after actor restart. The journal can be backed by Cassandra, PostgreSQL, or other stores. Akka Cluster Sharding combined with persistence enables stateful distributed actors that survive node failures -- the shard coordinator ensures each entity actor exists on exactly one node, and persistence ensures its state survives relocation.",

    "## Mailbox Semantics and Back-Pressure\n\nMailbox overflow is a critical concern in actor systems. Erlang processes have unbounded mailboxes by default -- a slow consumer can accumulate millions of messages, consuming memory until the node crashes. Monitoring via process_info(Pid, message_queue_len) and setting alarms is essential. Akka provides configurable mailbox types: bounded mailboxes (block or drop on overflow), priority mailboxes, and custom implementations. Back-pressure mechanisms include: (1) ask pattern with timeouts (Akka), (2) demand-based flow control (Reactive Streams / Akka Streams), (3) load shedding (dropping messages under pressure), (4) circuit breakers that stop sending when a downstream actor is overwhelmed. The choice between unbounded (risk OOM) and bounded (risk deadlock or message loss) mailboxes is a fundamental architectural decision.",

    "## Actor Model in Distributed Systems\n\nMicrosoft's Orleans framework introduced 'virtual actors' (grains) -- actors that are automatically instantiated when addressed and deactivated when idle, eliminating explicit lifecycle management. This simplifies distributed programming by treating actors as always-existing logical entities. Similarly, Cloudflare's Durable Objects provide single-threaded, globally consistent actors at the edge. The actor model naturally maps to domain-driven design: each aggregate root can be an actor, processing commands sequentially and emitting domain events. However, distributed actor systems must handle network partitions (CAP theorem), exactly-once vs at-least-once delivery semantics, and the challenge of maintaining causal ordering across actor boundaries."
  ],

  code: [
    {
      language: "erlang",
      caption: "Erlang/OTP gen_server with supervisor -- a counter process with fault tolerance",
      source: `%%% Counter gen_server -- handles increment, decrement, and get
-module(counter).
-behaviour(gen_server).

%% API
-export([start_link/1, increment/1, decrement/1, get/1]).
%% gen_server callbacks
-export([init/1, handle_call/3, handle_cast/2, handle_info/2]).

%% Public API
start_link(Name) ->
    gen_server:start_link({local, Name}, ?MODULE, 0, []).

increment(Name) -> gen_server:cast(Name, increment).
decrement(Name) -> gen_server:cast(Name, decrement).
get(Name)       -> gen_server:call(Name, get).

%% Callbacks
init(InitialCount) ->
    {ok, InitialCount}.

handle_call(get, _From, Count) ->
    {reply, Count, Count};
handle_call(_Request, _From, State) ->
    {reply, {error, unknown_request}, State}.

handle_cast(increment, Count) ->
    {noreply, Count + 1};
handle_cast(decrement, Count) ->
    {noreply, Count - 1};
handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

%%% Supervisor -- restarts counter on crash
-module(counter_sup).
-behaviour(supervisor).
-export([start_link/0, init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    SupFlags = #{
        strategy  => one_for_one,  %% restart only crashed child
        intensity => 5,            %% max 5 restarts
        period    => 60            %% within 60 seconds
    },
    Children = [
        #{
            id       => my_counter,
            start    => {counter, start_link, [my_counter]},
            restart  => permanent,
            shutdown => 5000,
            type     => worker,
            modules  => [counter]
        }
    ],
    {ok, {SupFlags, Children}}.

%% Usage in shell:
%% counter_sup:start_link().
%% counter:increment(my_counter).
%% counter:increment(my_counter).
%% counter:get(my_counter).        %% => 2
%% exit(whereis(my_counter), kill). %% supervisor restarts it
%% counter:get(my_counter).        %% => 0 (fresh state)`
    },
    {
      language: "go",
      caption: "CSP concurrency in Go -- fan-out/fan-in pipeline with channels",
      source: `package main

import (
\t"fmt"
\t"math"
\t"sync"
)

// generator produces values on a channel (CSP producer)
func generate(nums ...int) <-chan int {
\tout := make(chan int)
\tgo func() {
\t\tfor _, n := range nums {
\t\t\tout <- n // synchronous send -- blocks until received
\t\t}
\t\tclose(out)
\t}()
\treturn out
}

// worker reads from input channel, processes, writes to output
func isPrimeWorker(in <-chan int, out chan<- string, wg *sync.WaitGroup) {
\tdefer wg.Done()
\tfor n := range in {
\t\tif isPrime(n) {
\t\t\tout <- fmt.Sprintf("%d is prime", n)
\t\t} else {
\t\t\tout <- fmt.Sprintf("%d is not prime", n)
\t\t}
\t}
}

func isPrime(n int) bool {
\tif n < 2 {
\t\treturn false
\t}
\tfor i := 2; i <= int(math.Sqrt(float64(n))); i++ {
\t\tif n%i == 0 {
\t\t\treturn false
\t\t}
\t}
\treturn true
}

// fanOut distributes work across multiple goroutines
// fanIn merges results back into a single channel
func main() {
\tnums := generate(2, 3, 4, 17, 19, 20, 23, 97, 100)

\t// Fan-out: 3 workers reading from same channel
\tresults := make(chan string)
\tvar wg sync.WaitGroup
\tfor i := 0; i < 3; i++ {
\t\twg.Add(1)
\t\tgo isPrimeWorker(nums, results, &wg)
\t}

\t// Close results channel when all workers done
\tgo func() {
\t\twg.Wait()
\t\tclose(results)
\t}()

\t// Fan-in: collect all results
\tfor result := range results {
\t\tfmt.Println(result)
\t}

\t// Select statement -- CSP multiplexing
\t// ch1 := make(chan string)
\t// ch2 := make(chan string)
\t// select {
\t// case msg := <-ch1:
\t//     fmt.Println("from ch1:", msg)
\t// case msg := <-ch2:
\t//     fmt.Println("from ch2:", msg)
\t// case <-time.After(1 * time.Second):
\t//     fmt.Println("timeout")
\t// }
}`
    },
    {
      language: "scala",
      caption: "Akka Typed actors -- a bank account with command/event pattern",
      source: `import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import akka.actor.typed.scaladsl.Behaviors

// Commands (messages the actor receives)
sealed trait AccountCommand
final case class Deposit(amount: BigDecimal, replyTo: ActorRef[AccountEvent])
    extends AccountCommand
final case class Withdraw(amount: BigDecimal, replyTo: ActorRef[AccountEvent])
    extends AccountCommand
final case class GetBalance(replyTo: ActorRef[AccountEvent])
    extends AccountCommand

// Events (responses)
sealed trait AccountEvent
final case class Deposited(balance: BigDecimal) extends AccountEvent
final case class Withdrawn(balance: BigDecimal) extends AccountEvent
final case class BalanceResult(balance: BigDecimal) extends AccountEvent
final case class InsufficientFunds(balance: BigDecimal, attempted: BigDecimal)
    extends AccountEvent

// Actor definition using functional style
object BankAccount {
  def apply(accountId: String): Behavior[AccountCommand] =
    account(accountId, balance = BigDecimal(0))

  private def account(
      accountId: String,
      balance: BigDecimal
  ): Behavior[AccountCommand] =
    Behaviors.receive { (context, message) =>
      message match {
        case Deposit(amount, replyTo) =>
          val newBalance = balance + amount
          context.log.info(
            s"Account $accountId: deposited $amount, balance: $newBalance"
          )
          replyTo ! Deposited(newBalance)
          account(accountId, newBalance) // new behavior with updated state

        case Withdraw(amount, replyTo) =>
          if (amount > balance) {
            replyTo ! InsufficientFunds(balance, amount)
            Behaviors.same // state unchanged
          } else {
            val newBalance = balance - amount
            context.log.info(
              s"Account $accountId: withdrew $amount, balance: $newBalance"
            )
            replyTo ! Withdrawn(newBalance)
            account(accountId, newBalance)
          }

        case GetBalance(replyTo) =>
          replyTo ! BalanceResult(balance)
          Behaviors.same
      }
    }
}

// Supervision -- restart on failure with backoff
import akka.actor.typed.SupervisorStrategy
import scala.concurrent.duration._

object SupervisedAccount {
  def apply(accountId: String): Behavior[AccountCommand] =
    Behaviors
      .supervise(BankAccount(accountId))
      .onFailure[Exception](
        SupervisorStrategy
          .restartWithBackoff(
            minBackoff = 200.millis,
            maxBackoff = 10.seconds,
            randomFactor = 0.1
          )
      )
}

// Starting the actor system
// val system = ActorSystem(BankAccount("acc-001"), "bank")
// system ! Deposit(100.0, replyAdapter)`
    }
  ],

  diagrams: [
    {
      title: "Actor Supervision Tree",
      kind: "architecture",
      caption: "Hierarchical supervision in Erlang/OTP: supervisors manage worker actors and restart them on failure, escalating up the tree if restart thresholds are exceeded.",
      mermaid: `flowchart TD
    APP["Application Supervisor"]
    S1["Subsystem Supervisor A"]
    S2["Subsystem Supervisor B"]
    W1["Worker 1"]
    W2["Worker 2"]
    W3["Worker 3"]
    W4["Worker 4"]
    APP --> S1
    APP --> S2
    S1 --> W1
    S1 --> W2
    S2 --> W3
    S2 --> W4`,
    },
    {
      title: "Actor Message Passing",
      kind: "sequence",
      caption: "Actors communicate exclusively via asynchronous messages deposited into mailboxes; no shared memory is accessed.",
      mermaid: `sequenceDiagram
    participant A as Actor A
    participant MB_B as Mailbox B
    participant B as Actor B
    participant MB_C as Mailbox C
    participant C as Actor C
    A->>MB_B: send(msg1)
    B->>MB_B: dequeue msg1
    B->>MB_C: send(msg2)
    C->>MB_C: dequeue msg2
    C-->>A: send(reply)`,
    },
    {
      title: "Actor Lifecycle States",
      kind: "state",
      caption: "An actor transitions through created, idle, processing, and terminated states, with failure leading to supervisor-driven restart.",
      mermaid: `stateDiagram-v2
    [*] --> Created : spawn
    Created --> Idle : initialised
    Idle --> Processing : message dequeued
    Processing --> Idle : message handled
    Processing --> Failed : unhandled error
    Failed --> Idle : supervisor restarts
    Idle --> Terminated : stop signal
    Terminated --> [*]`,
    },
    {
      title: "Actor Network Topology",
      kind: "network",
      caption: "A sample actor topology showing how actors form a communication graph — each node is an actor, each edge a message channel.",
      mermaid: `flowchart LR
    GW["Gateway Actor"]
    AUTH["Auth Actor"]
    ROUTER["Router Actor"]
    SVC1["Service Actor 1"]
    SVC2["Service Actor 2"]
    DB["DB Proxy Actor"]
    LOG["Logger Actor"]
    GW --> AUTH
    GW --> ROUTER
    ROUTER --> SVC1
    ROUTER --> SVC2
    SVC1 --> DB
    SVC2 --> DB
    SVC1 --> LOG
    SVC2 --> LOG`,
    },
  ],

  animations: [
    {
      title: "Actor Message Processing Lifecycle",
      steps: [
        { label: "Message arrives", detail: "An incoming message is enqueued in the actor's mailbox (FIFO queue). The actor may be idle or processing another message." },
        { label: "Dequeue and match", detail: "The actor picks the next message from the mailbox and pattern-matches it against its receive handlers to determine how to process it." },
        { label: "Process and respond", detail: "The actor executes the matched handler: updating internal state, sending messages to other actors, or creating new actors. Only one message is processed at a time." },
        { label: "Designate next behavior", detail: "The actor optionally changes its behavior for the next message (Erlang: return new state; Akka: return new Behavior). This enables state machines without mutable state." },
        { label: "Failure and supervision", detail: "If processing throws an exception, the actor crashes. Its supervisor is notified and applies its restart strategy -- restarting the actor with fresh state, stopping it, or escalating the failure." }
      ]
    },
    {
      title: "Supervision Tree Recovery",
      steps: [
        { label: "Worker crashes", detail: "A worker process encounters an unrecoverable error (e.g., database connection lost) and terminates abnormally." },
        { label: "Supervisor notified", detail: "The parent supervisor receives an EXIT signal containing the child's PID and the crash reason." },
        { label: "Restart strategy applied", detail: "Under one_for_one: only the crashed child restarts. Under one_for_all: all sibling workers restart. Under rest_for_one: the crashed child and all children started after it restart." },
        { label: "Restart intensity check", detail: "The supervisor checks whether the number of restarts exceeds its threshold (e.g., 5 restarts in 60 seconds). If exceeded, the supervisor itself terminates, escalating to its parent." },
        { label: "System stabilizes", detail: "The restarted worker initializes with clean state and resumes processing messages. The supervision tree has self-healed without manual intervention." }
      ]
    }
  ],

  comparison: {
    columns: ["Feature", "Erlang/OTP Actors", "Akka (JVM) Actors", "Go CSP (Channels)", "Orleans Virtual Actors"],
    rows: [
      ["Concurrency unit", "Erlang process (~300 bytes)", "Actor (JVM object)", "Goroutine (~2-8 KB)", "Grain (virtual actor)"],
      ["Communication", "Async message passing (pid ! Msg)", "ActorRef ! message (typed or untyped)", "Channel send/receive (ch <- val)", "Method calls (RPC-like)"],
      ["Mailbox", "Unbounded per-process queue", "Configurable (bounded, priority)", "Buffered or unbounded channel", "Automatic turn-based queuing"],
      ["Scheduling", "Preemptive (reduction-based)", "Cooperative (dispatcher threads)", "Cooperative (goroutine yielding)", "Task-based (.NET thread pool)"],
      ["Failure handling", "Let-it-crash + supervision trees", "Supervision strategies + backoff", "Panic/recover + context cancellation", "Automatic reactivation on failure"],
      ["Distribution", "Native (Erlang distribution protocol)", "Akka Cluster + Remoting", "No built-in distribution", "Silo-based clustering (built-in)"],
      ["State persistence", "Mnesia / ETS tables", "Akka Persistence (event sourcing)", "External (database, Redis)", "Grain state with storage providers"],
      ["Hot code reload", "Native (code versioning per module)", "Not supported natively", "Not supported", "Rolling deployment via silos"],
      ["Location transparency", "Full (remote pids work like local)", "Full (ActorRef abstraction)", "None (channels are local)", "Full (grains addressed by identity)"],
      ["Garbage collection", "Per-process GC (no global pause)", "JVM GC (stop-the-world possible)", "Go GC (concurrent, low-latency)", ".NET GC (generational)"],
      ["Typical use case", "Telecom, messaging, IoT", "Event-driven microservices", "Web servers, CLI tools, pipelines", "Gaming, IoT, cloud-native services"]
    ]
  },

  interviewQA: [
    {
      q: "What is the difference between the Actor Model and CSP, and when would you choose one over the other?",
      a: "The Actor Model (Hewitt 1973) uses named processes with mailboxes -- you send messages directly to a specific actor. CSP (Hoare 1978) uses named channels -- processes are anonymous and communicate through shared channels. Key differences: (1) Actor mailboxes are asynchronous (fire-and-forget), CSP channels are synchronous by default (sender blocks until receiver is ready). (2) Actors have identity and can be addressed remotely (location transparency), CSP channels are typically local. (3) Actors naturally model distributed systems, CSP naturally models pipeline/dataflow patterns. Choose actors (Erlang, Akka) for distributed, fault-tolerant systems needing supervision and location transparency. Choose CSP (Go) for local concurrency patterns like fan-out/fan-in pipelines, worker pools, and request multiplexing.",
      followUps: [
        "How does Go's select statement relate to Erlang's receive with pattern matching?",
        "Can you implement actor-like patterns in Go, or CSP patterns in Erlang?"
      ]
    },
    {
      q: "Explain the 'let-it-crash' philosophy and how supervision trees provide fault tolerance.",
      a: "Let-it-crash means that instead of writing defensive error-handling code for every possible failure, you let processes crash on unexpected errors and delegate recovery to supervisors. A supervision tree is a hierarchy where supervisor processes monitor worker processes. When a worker crashes, the supervisor applies a restart strategy: one_for_one (restart only the failed child), one_for_all (restart all children), or rest_for_one (restart the failed child and those started after it). Supervisors have restart intensity limits (e.g., max 5 restarts in 60 seconds) -- exceeding the limit causes the supervisor itself to crash, escalating to its parent. This provides: (1) separation of error handling from business logic, (2) recovery to a known good state, (3) isolation of failures, (4) automatic self-healing. The key insight is that most bugs are caused by unexpected state -- restarting with clean state resolves many transient failures.",
      followUps: [
        "What happens when the top-level supervisor in an OTP application crashes?",
        "How do you handle state that must survive restarts?"
      ]
    },
    {
      q: "How does location transparency work in actor systems, and what are its limitations?",
      a: "Location transparency means that the mechanism for sending a message to an actor is identical regardless of whether the actor is in the same process, on the same machine, or on a remote node. In Erlang, a pid (process identifier) works the same way locally and remotely -- 'Pid ! Message' sends the message regardless of location. In Akka, ActorRef abstracts the physical location. This enables: elastic scaling (move actors between nodes), transparent failover (restart actors on different nodes), and simplified programming (no special network code). Limitations stem from the fallacies of distributed computing: (1) network calls are not instantaneous -- latency is orders of magnitude higher, (2) messages can be lost or duplicated in transit, (3) partial failures mean some nodes are up while others are down, (4) serialization overhead -- messages must be encoded/decoded for network transport. Production systems must account for these realities despite the transparency abstraction.",
      followUps: [
        "How does Akka Cluster Sharding handle node failures?",
        "What delivery guarantees does Erlang distribution provide?"
      ]
    },
    {
      q: "What are the challenges of mailbox management in actor systems, and how do you handle back-pressure?",
      a: "Actor mailboxes buffer incoming messages, but an actor processing messages slower than they arrive leads to mailbox growth, memory exhaustion, and eventual system failure. Challenges: (1) Unbounded mailboxes (Erlang default) risk out-of-memory crashes. (2) Bounded mailboxes risk message loss or sender blocking (potential deadlock). (3) Priority inversion when low-priority messages fill the queue ahead of high-priority ones. Back-pressure strategies include: (1) demand-based flow control (Akka Streams / Reactive Streams) -- downstream actors signal how many messages they can handle. (2) Bounded mailboxes with explicit overflow policies (drop oldest, drop newest, block sender). (3) Circuit breakers that stop sending when a downstream actor is overloaded. (4) Work-pulling pattern -- workers request work from a coordinator rather than having work pushed to them. (5) Load shedding -- dropping messages under extreme load with appropriate error signaling.",
      followUps: [
        "How does the work-pulling pattern differ from a traditional task queue?",
        "How do Akka Streams implement back-pressure across actor boundaries?"
      ]
    }
  ],

  followUps: [
    "How does the actor model avoid locks entirely?",
    "What happens when an actor's mailbox grows faster than it can process — where's the backpressure?",
    "Why is supervision (let it crash) a design choice rather than an admission of defeat?",
  ],
  mcqs: [
    {
      q: "In the Actor Model, what are the three fundamental actions an actor can take upon receiving a message?",
      options: [
        "Read state, write state, delete state",
        "Send messages, create actors, designate next behavior",
        "Lock, process, unlock",
        "Fork, join, synchronize"
      ],
      answerIndex: 1,
      explanation: "Carl Hewitt's original 1973 formulation defines three capabilities: send a finite number of messages to other actors, create a finite number of new actors, and designate the behavior to be used for the next message received. There is no concept of shared state, locks, or synchronization primitives."
    },
    {
      q: "What restart strategy should a supervisor use when all child processes depend on each other's state and one crashes?",
      options: [
        "one_for_one -- restart only the crashed child",
        "one_for_all -- restart all children",
        "rest_for_one -- restart the crashed child and those started after it",
        "simple_one_for_one -- restart using a template"
      ],
      answerIndex: 1,
      explanation: "one_for_all restarts all children when any one crashes. This is appropriate when children have interdependent state -- restarting only one would leave the others with stale references or inconsistent state. one_for_one is for independent children, and rest_for_one is for ordered dependencies."
    },
    {
      q: "How do Go channels (CSP) differ from actor mailboxes by default?",
      options: [
        "Channels are unbounded; mailboxes are bounded",
        "Channels are synchronous (blocking); mailboxes are asynchronous (non-blocking send)",
        "Channels support pattern matching; mailboxes do not",
        "Channels are typed; mailboxes accept any message type"
      ],
      answerIndex: 1,
      explanation: "Unbuffered Go channels are synchronous -- the sender blocks until a receiver is ready (rendezvous). Actor mailboxes (in Erlang and Akka) are asynchronous by default -- the send operation returns immediately and the message is queued. While Go channels can be buffered and Akka mailboxes can be bounded, the default semantics differ fundamentally."
    },
    {
      q: "What is 'location transparency' in the context of actor systems?",
      options: [
        "Actors do not have a fixed memory address",
        "The message-sending mechanism is identical regardless of whether the target actor is local or remote",
        "Actors can freely move between physical locations without being restarted",
        "The actor's internal state is invisible to other actors"
      ],
      answerIndex: 1,
      explanation: "Location transparency means the API for communicating with an actor is the same whether the actor is in the same process, on the same machine, or on a different node. In Erlang, Pid ! Msg works identically for local and remote pids. In Akka, ActorRef abstracts physical location. This is distinct from state encapsulation or actor mobility."
    },
    {
      q: "What problem does the BEAM VM's per-process garbage collection solve?",
      options: [
        "It eliminates the need for garbage collection entirely",
        "It prevents global GC pauses from affecting all processes simultaneously",
        "It allows processes to share memory without locks",
        "It enables real-time deterministic memory deallocation"
      ],
      answerIndex: 1,
      explanation: "The BEAM VM gives each Erlang process its own heap, collected independently. When one process triggers GC, only that process pauses -- all other processes continue running. This is critical for soft real-time systems (telecom, messaging) where global stop-the-world pauses would violate latency requirements. JVM-based actor systems like Akka inherit JVM GC characteristics, which may cause global pauses."
    }
  ],

  flashcards: [
    { front: "Who proposed the Actor Model and when?", back: "Carl Hewitt, Peter Bishop, and Richard Steiger proposed the Actor Model in 1973 at MIT. It was designed as a mathematical model for concurrent computation where actors are the universal primitives." },
    { front: "What are the three things an actor can do upon receiving a message?", back: "1) Send a finite number of messages to other actors. 2) Create a finite number of new actors. 3) Designate the behavior to be used for the next message it receives." },
    { front: "What is the 'let-it-crash' philosophy?", back: "Instead of writing defensive error-handling code, let processes crash on unexpected errors and delegate recovery to supervisor processes that restart them with clean state. This separates business logic from error handling." },
    { front: "Name the three OTP supervisor restart strategies.", back: "one_for_one: restart only the crashed child. one_for_all: restart all children. rest_for_one: restart the crashed child and all children started after it." },
    { front: "How does CSP differ from the Actor Model?", back: "CSP uses named channels (processes are anonymous); Actor Model uses named processes (communication is direct). CSP channels are synchronous by default; actor mailboxes are asynchronous. CSP decouples sender/receiver identity through the channel." },
    { front: "What is location transparency?", back: "The ability to send messages to an actor using the same syntax and semantics regardless of whether the actor is local (same process/machine) or remote (different node/data center). Erlang pids and Akka ActorRefs provide this." },
    { front: "How much memory does an Erlang process use?", back: "Approximately 300 bytes initially. Erlang processes are extremely lightweight compared to OS threads (~1-8 MB stack) or even goroutines (~2-8 KB), enabling millions of concurrent processes on a single machine." },
    { front: "What are virtual actors (Orleans grains)?", back: "Virtual actors are automatically instantiated when addressed and deactivated when idle. There is no explicit lifecycle management -- the runtime handles activation, placement, and garbage collection. This simplifies distributed programming by treating actors as always-existing logical entities." }
  ],

  revisionNotes: [
    "The Actor Model (Hewitt 1973) has three primitives per actor on message receipt: send messages, create actors, designate next behavior. No shared state exists -- all communication is via asynchronous message passing.",
    "Erlang/OTP implements actors as lightweight processes (~300 bytes) on the BEAM VM with preemptive scheduling (reduction-based), per-process GC (no global pauses), and native distribution protocol for multi-node communication.",
    "Supervision trees are hierarchical process structures where supervisors monitor and restart workers. Restart strategies: one_for_one, one_for_all, rest_for_one. Restart intensity limits cause supervisor escalation on repeated failures.",
    "CSP (Hoare 1978) differs from actors: named channels vs named processes, synchronous by default vs asynchronous, local vs distributable. Go implements CSP with goroutines and channels; select multiplexes across channels.",
    "Akka brings actors to the JVM with typed actors, cluster sharding, persistence (event sourcing), and location transparency via ActorRef. Supervision uses SupervisorStrategy with restart, stop, resume, and escalate directives.",
    "Mailbox management is critical: unbounded mailboxes risk OOM, bounded risk deadlock/loss. Back-pressure solutions include demand-based flow control (Reactive Streams), work-pulling pattern, circuit breakers, and load shedding.",
    "Location transparency enables uniform message sending regardless of actor location but cannot fully abstract network realities: latency, partial failure, message loss, and serialization overhead (fallacies of distributed computing).",
    "The let-it-crash philosophy separates error handling from business logic: workers handle the happy path, supervisors handle recovery. Most transient errors resolve by restarting with clean state."
  ],

  cheatSheet: [
    "Actor = isolated unit with mailbox + state + behavior. Processes one message at a time. No shared mutable state.",
    "Erlang send: Pid ! Message. Receive: receive Pattern -> Action end. Spawn: spawn(fun() -> loop(State) end).",
    "OTP behaviors: gen_server (request/reply), gen_statem (state machines), gen_event (pub/sub), supervisor (fault tolerance).",
    "Supervisor child spec: #{id, start, restart (permanent|transient|temporary), shutdown, type (worker|supervisor)}.",
    "Go channel: ch := make(chan Type, bufferSize). Send: ch <- value. Receive: val := <-ch. Select: multiplexes channels.",
    "Akka typed actor: Behaviors.receive { (ctx, msg) => msg match { case Cmd => ... Behaviors.same } }. Ref: ActorRef[T].",
    "BEAM scheduling: ~4000 reductions per time slice, work-stealing across schedulers, per-process heap and GC.",
    "Back-pressure patterns: bounded mailboxes, work-pulling (workers request tasks), demand signaling (Reactive Streams), circuit breakers."
  ],

  resources: [
    { label: "Hewitt, Bishop, Steiger -- A Universal Modular ACTOR Formalism (1973)", kind: "paper", note: "The foundational paper defining the Actor Model" },
    { label: "Joe Armstrong -- Programming Erlang: Software for a Concurrent World (2nd ed.)", kind: "book", note: "Comprehensive guide to Erlang/OTP by one of its creators" },
    { label: "Akka Documentation -- Actor Model and Typed Actors", kind: "docs", note: "Official Akka documentation covering typed actors, clustering, and persistence" },
    { label: "Rob Pike -- Concurrency Is Not Parallelism (2012 talk)", kind: "video", note: "Explains Go's CSP approach and the distinction between concurrency and parallelism" },
    { label: "Microsoft Orleans Documentation", kind: "docs", note: "Virtual actor (grain) model for .NET -- automatic lifecycle, distributed state management" }
  ],

  glossary: [
    { term: "Actor", definition: "A computational entity that receives messages, processes them one at a time, can send messages to other actors, create new actors, and determine its behavior for the next message." },
    { term: "Mailbox", definition: "A message queue associated with each actor where incoming messages are buffered until the actor is ready to process them. Typically FIFO, but can support priority ordering." },
    { term: "Supervision Tree", definition: "A hierarchical structure where supervisor processes monitor and restart child processes (workers or other supervisors) according to configurable restart strategies." },
    { term: "Let-it-crash", definition: "A philosophy where processes are allowed to fail on unexpected errors rather than trying to handle every possible failure, with supervisors responsible for recovery." },
    { term: "Location Transparency", definition: "The property that message sending to an actor uses the same mechanism regardless of the actor's physical location -- local, on another machine, or in another data center." },
    { term: "CSP (Communicating Sequential Processes)", definition: "A formal model of concurrency by Tony Hoare (1978) where processes communicate through named channels rather than directly addressing each other." },
    { term: "BEAM", definition: "Bogdan/Bjorn's Erlang Abstract Machine -- the virtual machine that executes Erlang and Elixir code, featuring preemptive scheduling, per-process GC, and native distribution." },
    { term: "Back-pressure", definition: "A flow-control mechanism where a slow consumer signals upstream producers to reduce their sending rate, preventing mailbox overflow and memory exhaustion." }
  ],

  exercises: [
    "Design a **chat room server** using the actor model. Each chat room is an actor, and each connected user is an actor. Define the message types for *joining a room*, *sending a message*, *leaving a room*, and *listing active users*. How would you structure the **supervision tree** so that a crash in one user's actor does not affect others?",
    "Implement a simple **actor framework** in C++ using `std::thread` and a thread-safe message queue (`std::mutex` + `std::condition_variable`). Each actor should have a `mailbox` (queue of `std::variant` messages), a processing loop, and a `send()` method. Compare your implementation's overhead with Erlang's *300-byte* process footprint -- what are the fundamental reasons for the difference?",
    "You have a pipeline: **SensorActor** -> **AggregatorActor** -> **StorageActor**. The sensor produces 10,000 messages/sec, the aggregator batches them into groups of 100, and the storage actor writes to disk at 50 batches/sec. Identify where *backpressure* will build up, propose **two different mitigation strategies** (one using bounded mailboxes, one using demand-based flow control), and explain the trade-offs.",
    "Compare the **let-it-crash** philosophy with traditional `try-catch` error handling by writing the same feature -- a *database connection pool actor* -- both ways. In the defensive version, handle every possible failure inline. In the let-it-crash version, use a supervisor with `one_for_one` strategy. Which version is simpler? Which recovers faster from a corrupted connection state?",
    "Given a distributed actor system spanning **three data centers**, design a `UserSessionActor` that maintains login state. Address these concerns: (1) How does **location transparency** help or hinder your design? (2) What happens during a *network partition* between data centers? (3) How would you use **Akka Persistence** or Erlang's `mnesia` to ensure session state survives node failures?"
  ],
};
