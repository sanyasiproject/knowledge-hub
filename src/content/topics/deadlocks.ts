import type { TopicContent } from "../types";

export const deadlocks: TopicContent = {
  quickSummary: [
    "A deadlock occurs when two or more processes are each waiting for a resource held by another, forming a circular dependency that halts all of them indefinitely.",
    "Four conditions must hold simultaneously for a deadlock to occur: mutual exclusion, hold and wait, no preemption, and circular wait (the Coffman conditions).",
    "Deadlocks can be addressed by prevention (structurally eliminating one Coffman condition), avoidance (dynamically refusing unsafe allocations, e.g., Banker's algorithm), detection (finding cycles in a wait-for graph and then recovering), or simply ignoring the problem (the ostrich algorithm, used by most general-purpose OSes).",
    "Related pathologies include livelock (processes actively change state but make no progress) and priority inversion (a high-priority task is indirectly blocked by a low-priority task holding a shared resource).",
  ],
  detailed: [
    "A deadlock is a permanent blocking condition in which a set of processes each holds at least one resource and waits to acquire a resource held by another process in the set. Unlike starvation, where a process could eventually proceed, a true deadlock can never resolve on its own. Deadlocks arise in any system with shared, non-shareable resources -- operating system kernels, database transactions, distributed systems, and concurrent application code.",
    "The four Coffman conditions (1971) are individually necessary and jointly sufficient for deadlock. (1) Mutual exclusion: at least one resource must be held in a non-shareable mode. (2) Hold and wait: a process holding at least one resource is waiting to acquire additional resources held by other processes. (3) No preemption: resources cannot be forcibly taken from a process; they must be released voluntarily. (4) Circular wait: there exists a circular chain of two or more processes, each waiting for a resource held by the next process in the chain. If any one of these conditions is broken, deadlock cannot occur.",
    "A resource allocation graph (RAG) models deadlocks visually. Processes are circles, resource types are rectangles (with dots for instances), request edges go from process to resource, and assignment edges go from resource instance to process. A cycle in the RAG is a necessary condition for deadlock. If each resource type has exactly one instance, a cycle is also sufficient -- the system is deadlocked. If resource types have multiple instances, a cycle is necessary but not sufficient; further analysis (e.g., the Banker's algorithm or a wait-for graph reduction) is needed to confirm deadlock.",
    "Classic deadlock examples include the Dining Philosophers problem (five philosophers share five forks; each needs two to eat, and if all pick up their left fork simultaneously, none can get the right fork), database transactions (Transaction A locks row 1 and requests row 2, while Transaction B locks row 2 and requests row 1), and nested lock acquisition in multithreaded code (Thread 1 acquires lock A then requests lock B, while Thread 2 acquires lock B then requests lock A). The Dining Philosophers problem is often used to teach deadlock prevention via resource ordering: number the forks and always pick up the lower-numbered fork first.",
    "Operating systems typically use one of four strategies to deal with deadlocks. Prevention imposes constraints that structurally eliminate one of the Coffman conditions, such as requiring all resources to be requested at once (eliminating hold-and-wait) or imposing a total ordering on resource types (eliminating circular wait). Avoidance uses algorithms like the Banker's algorithm to dynamically check whether granting a request could lead to an unsafe state. Detection allows deadlocks to occur but periodically checks for them (e.g., via cycle detection in a wait-for graph) and then recovers by aborting or rolling back one or more processes. The fourth approach -- ignoring deadlocks -- is used by most general-purpose OSes (Linux, Windows) because the overhead of prevention or avoidance often outweighs the cost of rare deadlocks, which users typically resolve by killing a process.",
  ],
  deepDive: [
    "The Banker's algorithm, proposed by Dijkstra (1965), is the canonical deadlock avoidance algorithm. It models the system as a bank that must ensure it can always satisfy at least one customer's maximum demand. The algorithm maintains several matrices: Available (vector of currently available instances of each resource type), Max (each process's maximum demand), Allocation (resources currently allocated to each process), and Need (Max minus Allocation). When a process requests resources, the algorithm tentatively grants the request, then runs a safety check: it simulates whether all processes can finish by finding a safe sequence -- an ordering in which each process can obtain its maximum remaining need from currently available resources plus those freed by previously finished processes. If a safe sequence exists, the request is granted; otherwise, the process must wait. The time complexity is O(m * n^2) where m is the number of resource types and n is the number of processes.",
    "Deadlock prevention eliminates one of the four Coffman conditions at design time. Eliminating mutual exclusion is generally impractical for non-shareable resources like printers, but spooling (where a daemon mediates access) can convert exclusive access into shared access. Eliminating hold-and-wait requires a process to request all needed resources at once before execution (conservative allocation) or to release all held resources before requesting new ones, both of which lead to low utilization and possible starvation. Eliminating no-preemption allows the OS to forcibly reclaim resources from a process (practical for CPU registers and memory via swapping, but not for printers or database locks). Eliminating circular wait imposes a total ordering on resource types and requires processes to request resources in increasing order of their type number -- this is simple, effective, and widely used in practice.",
    "Deadlock avoidance differs from prevention in that it does not impose structural constraints; instead, it dynamically evaluates each resource request at runtime. The system must know in advance the maximum resource needs of each process (the Max matrix). While the Banker's algorithm is the textbook example, it is rarely used in practice because (a) processes seldom declare maximum resource needs in advance, (b) the number of processes is not fixed, and (c) the computational overhead of running the safety algorithm on every request is significant. However, the conceptual framework of safe and unsafe states is fundamental to understanding deadlock theory.",
    "Deadlock detection and recovery is the most pragmatic approach for systems where deadlocks are possible but infrequent. Detection involves periodically running a cycle-detection algorithm on the wait-for graph (a simplified RAG with only processes as nodes, where an edge from P_i to P_j means P_i is waiting for a resource held by P_j). For single-instance resource types, a cycle in the wait-for graph is both necessary and sufficient for deadlock. For multi-instance types, a more expensive algorithm similar to the Banker's safety check is used. Recovery options include process termination (abort all deadlocked processes, or abort one at a time until the cycle breaks, choosing victims based on priority, runtime, resources held, and remaining work) and resource preemption (forcibly taking resources and rolling back the victim process to a safe checkpoint). Selecting the victim for termination or preemption must guard against starvation by limiting the number of times any process can be chosen as victim.",
    "Livelock is a condition where processes are not blocked but continuously change state in response to each other without making progress -- like two people in a corridor who keep sidestepping in the same direction. Livelock can occur in retry-based protocols and spin-lock algorithms. It is resolved by introducing randomization (e.g., random backoff in Ethernet's CSMA/CD) or asymmetry. Priority inversion occurs when a high-priority task is blocked by a low-priority task holding a shared resource, while a medium-priority task preempts the low-priority task, indefinitely delaying the high-priority task. The classic example is the Mars Pathfinder incident (1997), where priority inversion caused the rover's system to reset repeatedly. Solutions include priority inheritance (temporarily boosting the low-priority holder's priority to that of the highest-priority waiter) and priority ceiling (assigning each mutex a ceiling priority equal to the highest priority of any task that may lock it, and boosting any locking task to that ceiling). The wait-die and wound-wait schemes, used in database concurrency control, resolve deadlocks using process timestamps: in wait-die, an older process waits for a younger one but a younger process requesting a resource held by an older one is aborted (dies); in wound-wait, an older process preempts (wounds) a younger holder, while a younger process waits for an older one. Both schemes are preemptive and prevent deadlock while avoiding starvation since timestamps ensure no process is repeatedly victimized.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Deadlock demonstration with two threads and two locks",
      source: `#include <iostream>
#include <thread>
#include <mutex>
#include <chrono>

std::mutex lockA;
std::mutex lockB;

void thread1() {
    std::cout << "Thread 1: acquiring lock A...\\n";
    lockA.lock();
    std::cout << "Thread 1: acquired lock A, sleeping...\\n";
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::cout << "Thread 1: acquiring lock B...\\n";
    lockB.lock();  // Blocked -- Thread 2 holds lock B
    std::cout << "Thread 1: acquired lock B\\n";
    lockB.unlock();
    lockA.unlock();
}

void thread2() {
    std::cout << "Thread 2: acquiring lock B...\\n";
    lockB.lock();
    std::cout << "Thread 2: acquired lock B, sleeping...\\n";
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::cout << "Thread 2: acquiring lock A...\\n";
    lockA.lock();  // Blocked -- Thread 1 holds lock A
    std::cout << "Thread 2: acquired lock A\\n";
    lockA.unlock();
    lockB.unlock();
}

int main() {
    std::thread t1(thread1);
    std::thread t2(thread2);

    // Use timed join to detect deadlock
    // (std::thread does not have timed join, so we detach after a timeout)
    std::this_thread::sleep_for(std::chrono::seconds(5));

    // In real code, if threads are still running after 5s, it is a deadlock.
    // Note: this is a demonstration -- production code should use
    // std::lock() or std::scoped_lock to avoid deadlocks.
    std::cout << "If this line does not appear promptly, DEADLOCK occurred\\n";

    t1.join();
    t2.join();
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Banker's algorithm for deadlock avoidance",
      source: `#include <iostream>
#include <vector>
#include <string>

struct BankersResult {
    bool isSafe;
    std::vector<int> safeSequence;
};

// Banker's algorithm: determines if the system is in a safe state.
// Returns {is_safe, safe_sequence}.
BankersResult bankersAlgorithm(
    std::vector<int> available,
    const std::vector<std::vector<int>>& maxDemand,
    const std::vector<std::vector<int>>& allocation)
{
    int n = static_cast<int>(allocation.size());    // number of processes
    int m = static_cast<int>(available.size());     // number of resource types

    // Calculate Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
    std::vector<std::vector<int>> need(n, std::vector<int>(m));
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            need[i][j] = maxDemand[i][j] - allocation[i][j];

    std::vector<int> work = available;
    std::vector<bool> finish(n, false);
    std::vector<int> safeSequence;

    while (static_cast<int>(safeSequence.size()) < n) {
        bool found = false;
        for (int i = 0; i < n; ++i) {
            if (finish[i]) continue;
            bool canFinish = true;
            for (int j = 0; j < m; ++j) {
                if (need[i][j] > work[j]) { canFinish = false; break; }
            }
            if (canFinish) {
                // Process i can finish; release its resources
                for (int j = 0; j < m; ++j)
                    work[j] += allocation[i][j];
                finish[i] = true;
                safeSequence.push_back(i);
                found = true;
                break;
            }
        }
        if (!found)
            return {false, {}};  // Unsafe state -- no process can finish
    }
    return {true, safeSequence};
}

int main() {
    // Example: 3 resource types (A, B, C), 5 processes (P0-P4)
    std::vector<int> available = {3, 3, 2};
    std::vector<std::vector<int>> maxDemand = {
        {7, 5, 3},  // P0
        {3, 2, 2},  // P1
        {9, 0, 2},  // P2
        {2, 2, 2},  // P3
        {4, 3, 3},  // P4
    };
    std::vector<std::vector<int>> allocation = {
        {0, 1, 0},  // P0
        {2, 0, 0},  // P1
        {3, 0, 2},  // P2
        {2, 1, 1},  // P3
        {0, 0, 2},  // P4
    };

    auto [isSafe, seq] = bankersAlgorithm(available, maxDemand, allocation);
    std::cout << "Safe: " << (isSafe ? "true" : "false") << ", Sequence: [";
    for (size_t i = 0; i < seq.size(); ++i) {
        if (i > 0) std::cout << ", ";
        std::cout << "P" << seq[i];
    }
    std::cout << "]\\n";
    // Output: Safe: true, Sequence: [P1, P3, P4, P0, P2]
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Deadlock prevention via consistent lock ordering",
      source: `#include <iostream>
#include <mutex>
#include <vector>
#include <thread>
#include <stdexcept>
#include <string>

// Prevents deadlock by enforcing a global total order on lock acquisition.
// Each lock is assigned an integer rank. Locks must be acquired in
// ascending rank order; violating the order raises an error.
class OrderedLock {
public:
    explicit OrderedLock(int rank) : rank_(rank) {}

    void lock() {
        auto& held = heldRanks();
        if (!held.empty() && held.back() >= rank_) {
            throw std::runtime_error(
                "Lock ordering violation: cannot acquire rank "
                + std::to_string(rank_) + " while holding rank "
                + std::to_string(held.back()));
        }
        mutex_.lock();
        held.push_back(rank_);
    }

    void unlock() {
        mutex_.unlock();
        auto& held = heldRanks();
        held.pop_back();
    }

    int rank() const { return rank_; }

private:
    int rank_;
    std::mutex mutex_;

    // Thread-local storage for tracking held lock ranks
    static std::vector<int>& heldRanks() {
        thread_local std::vector<int> ranks;
        return ranks;
    }
};

// Usage: both threads acquire locks in the same order (rank 1, then rank 2)
OrderedLock lockA(1);
OrderedLock lockB(2);

void safeWorker(const std::string& name) {
    std::lock_guard<OrderedLock> guardA(lockA);
    std::lock_guard<OrderedLock> guardB(lockB);
    std::cout << name << ": holding both locks safely\\n";
}

int main() {
    std::thread t1(safeWorker, "Thread-1");
    std::thread t2(safeWorker, "Thread-2");
    t1.join();
    t2.join();
    std::cout << "No deadlock -- consistent lock ordering works\\n";
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Resource Allocation Graph with Deadlock Cycle",
      kind: "network",
      caption: "Two processes P1 and P2 each hold one resource and request the other, forming a circular wait that constitutes a deadlock.",
      mermaid: `graph LR
    P1["Process P1"]
    P2["Process P2"]
    R1["Resource R1"]
    R2["Resource R2"]
    R1 -->|held by| P1
    R2 -->|held by| P2
    P1 -->|requests| R2
    P2 -->|requests| R1`,
    },
    {
      title: "Coffman Conditions for Deadlock",
      kind: "mindmap",
      caption: "All four Coffman conditions must hold simultaneously for a deadlock to occur. Eliminating any one condition prevents deadlock.",
      mermaid: `mindmap
  root[Deadlock Conditions]
    Mutual Exclusion
      Resource held exclusively
      Prevention: use sharable resources
    Hold and Wait
      Process holds while requesting more
      Prevention: request all resources at once
    No Preemption
      Resources cannot be forcibly taken
      Prevention: allow preemption and rollback
    Circular Wait
      Cycle in resource allocation graph
      Prevention: impose global lock ordering`,
    },
    {
      title: "Deadlock Handling Strategy Decision",
      kind: "flow",
      caption: "Decision flow for choosing a deadlock handling strategy based on system requirements and acceptable overhead.",
      mermaid: `flowchart TD
    A[Deadlock Risk Identified] --> B{System type?}
    B -->|Safety-critical| C[Prevention]
    B -->|General purpose OS| D{Can predict max resource needs?}
    D -->|Yes| E[Avoidance - Bankers Algorithm]
    D -->|No| F{Deadlock frequency?}
    F -->|Rare| G[Ostrich Algorithm - Ignore]
    F -->|Occasional| H[Detection and Recovery]
    C --> C1[Lock ordering or request all upfront]
    E --> E1[Safety check on each allocation]
    H --> H1[Periodic cycle detection]
    H1 --> H2[Terminate or rollback victim process]`,
    },
    {
      title: "Banker's Algorithm Safe vs Unsafe State",
      kind: "state",
      caption: "State transitions showing how the Banker's algorithm prevents entering unsafe states by denying requests that could lead to deadlock.",
      mermaid: `stateDiagram-v2
    [*] --> Safe
    Safe --> Safe : Grant request passes safety check
    Safe --> Unsafe : Grant request fails safety check
    Unsafe --> Safe : Process releases resources
    Unsafe --> Deadlocked : All processes blocked
    Deadlocked --> Safe : Terminate victim and reclaim resources
    note right of Safe
      All processes can complete
      in some ordering
    end note
    note right of Unsafe
      No guarantee all processes
      can complete
    end note`,
    },
  ],
  animations: [
    {
      title: "Deadlock Formation in Dining Philosophers",
      steps: [
        {
          label: "Initial state",
          detail:
            "Five philosophers sit at a round table. Each fork lies on the table between two philosophers. All philosophers are thinking.",
        },
        {
          label: "Philosophers get hungry",
          detail:
            "All five philosophers become hungry simultaneously and reach for their left fork.",
        },
        {
          label: "Left forks acquired",
          detail:
            "Each philosopher picks up the fork to their left. Every fork is now held by exactly one philosopher.",
        },
        {
          label: "Right fork requests",
          detail:
            "Each philosopher attempts to pick up the fork to their right, but it is held by their neighbor. All five philosophers are now blocked.",
        },
        {
          label: "Deadlock",
          detail:
            "A circular wait exists: Philosopher 0 waits for Philosopher 1's fork, Philosopher 1 waits for Philosopher 2's fork, and so on, back to Philosopher 0. No philosopher can proceed -- the system is deadlocked.",
        },
        {
          label: "Resolution via ordering",
          detail:
            "Restart with a lock ordering rule: each philosopher picks up the lower-numbered fork first. Philosopher 4 now tries for fork 0 (not fork 4), breaking the circular wait and preventing deadlock.",
        },
      ],
    },
    {
      title: "Banker's Algorithm Safety Check",
      steps: [
        {
          label: "Initialize",
          detail:
            "Set Work = Available vector. Set Finish[i] = false for all processes. Calculate Need = Max - Allocation for each process.",
        },
        {
          label: "Find a candidate",
          detail:
            "Search for a process i where Finish[i] = false and Need[i] <= Work (component-wise). If found, proceed; if none, go to the final step.",
        },
        {
          label: "Simulate completion",
          detail:
            "Tentatively release process i's resources: Work = Work + Allocation[i]. Set Finish[i] = true. Add i to the safe sequence.",
        },
        {
          label: "Repeat",
          detail:
            "Return to the candidate search step. Continue until all processes are in the safe sequence or no candidate can be found.",
        },
        {
          label: "Verdict",
          detail:
            "If all Finish[i] = true, the state is safe and the request can be granted. If any Finish[i] = false, the state is unsafe and the request must be denied to avoid potential deadlock.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Strategy",
      "When Applied",
      "Mechanism",
      "Overhead",
      "Resource Utilization",
      "Practical Use",
    ],
    rows: [
      [
        "Prevention",
        "Design time / compile time",
        "Structurally eliminates one Coffman condition (e.g., lock ordering, request-all-at-once)",
        "Low runtime overhead; may restrict programming model",
        "Often low -- resources may be held longer than needed or requested prematurely",
        "Lock ordering in multithreaded code; database two-phase locking",
      ],
      [
        "Avoidance",
        "Runtime (each request)",
        "Dynamically checks if granting a request keeps the system in a safe state (e.g., Banker's algorithm)",
        "Moderate to high -- safety check on every allocation request",
        "Better than prevention since resources are allocated as needed, but max demands must be known",
        "Rarely used in general-purpose OSes; sometimes in embedded/real-time systems",
      ],
      [
        "Detection",
        "Runtime (periodically or on suspected deadlock)",
        "Runs cycle detection on wait-for graph or resource allocation graph",
        "Low between checks; detection algorithm cost depends on frequency",
        "High -- resources are allocated freely without restriction",
        "Database systems (detect and roll back one transaction); some distributed systems",
      ],
      [
        "Recovery",
        "After detection confirms deadlock",
        "Terminates or rolls back one or more processes; may preempt resources",
        "High when recovery occurs (process restart, work lost), but infrequent",
        "N/A -- recovery restores utilization after deadlock breaks",
        "Database transaction rollback; process termination by OS or operator",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What are the four necessary conditions for deadlock?",
      a: "The four Coffman conditions are: (1) Mutual exclusion -- at least one resource is non-shareable. (2) Hold and wait -- a process holds resources while waiting for others. (3) No preemption -- resources cannot be forcibly taken. (4) Circular wait -- a circular chain of processes exists, each waiting for a resource held by the next. All four must hold simultaneously for a deadlock to occur; eliminating any one prevents deadlock.",
      followUps: [
        "Which condition is easiest to eliminate in practice and why?",
        "Can you have all four conditions present without an actual deadlock?",
      ],
    },
    {
      q: "Explain the difference between deadlock prevention and deadlock avoidance.",
      a: "Prevention imposes design-time constraints that structurally make one Coffman condition impossible (e.g., enforcing a global lock ordering to prevent circular wait). Avoidance allows all four conditions to be possible in principle but uses runtime algorithms (like the Banker's algorithm) to dynamically refuse resource requests that would move the system into an unsafe state. Prevention is simpler but more restrictive; avoidance is more flexible but requires advance knowledge of maximum resource demands.",
      followUps: [
        "Why is the Banker's algorithm rarely used in practice?",
        "What is the difference between an unsafe state and a deadlocked state?",
      ],
    },
    {
      q: "How does the Banker's algorithm work?",
      a: "The Banker's algorithm maintains Available, Max, Allocation, and Need matrices. When a process requests resources, the algorithm tentatively grants the request, then checks if the resulting state is safe by attempting to find a safe sequence -- an ordering of all processes such that each can obtain its maximum remaining need from the currently available resources plus those released by earlier processes. If a safe sequence exists, the request is granted; otherwise it is deferred. The safety check runs in O(m * n^2) time for m resource types and n processes.",
      followUps: [
        "Walk through the algorithm with a concrete numeric example.",
        "What are the assumptions and limitations of the Banker's algorithm?",
      ],
    },
    {
      q: "What is the difference between a deadlock and a livelock?",
      a: "In a deadlock, processes are permanently blocked -- they are waiting and will never proceed. In a livelock, processes are not blocked; they actively execute and change state, but their actions are unproductive responses to each other, so no global progress is made. A classic livelock example is two people in a hallway who keep sidestepping in the same direction to let each other pass. Livelocks can be resolved by introducing randomized delays or asymmetric behavior.",
      followUps: [
        "Give an example of livelock in a computer system.",
        "How does the Ethernet CSMA/CD protocol handle livelock?",
      ],
    },
    {
      q: "Explain priority inversion and how it is solved.",
      a: "Priority inversion occurs when a high-priority task H is blocked because a low-priority task L holds a resource H needs, while a medium-priority task M preempts L, indirectly delaying H despite H having higher priority than M. The solution is priority inheritance: when H blocks on a resource held by L, L temporarily inherits H's priority, preventing M from preempting it. Once L releases the resource, its priority reverts. An alternative is the priority ceiling protocol, which assigns each mutex a ceiling priority and immediately boosts any locking task to that ceiling.",
      followUps: [
        "Describe the Mars Pathfinder priority inversion incident.",
        "What is the difference between priority inheritance and priority ceiling?",
      ],
    },
    {
      q: "How do wait-die and wound-wait schemes prevent deadlock?",
      a: "Both are timestamp-based schemes used in database systems. In wait-die, if an older transaction requests a resource held by a younger one, the older transaction waits; if a younger transaction requests a resource held by an older one, the younger transaction is aborted (dies) and restarted with its original timestamp. In wound-wait, the roles are reversed: an older transaction preempts (wounds) a younger holder, forcing it to abort, while a younger transaction requesting a resource held by an older one waits. Both schemes guarantee no circular wait and prevent starvation since transactions keep their original timestamps on restart.",
      followUps: [
        "Which scheme results in fewer rollbacks and why?",
        "How do these schemes compare to two-phase locking?",
      ],
    },
    {
      q: "How would you detect a deadlock in a running system?",
      a: "For single-instance resource types, build a wait-for graph (an edge from process P to process Q means P is waiting for a resource held by Q) and run a cycle-detection algorithm (DFS-based, O(V + E)). A cycle indicates deadlock. For multi-instance resource types, use an algorithm analogous to the Banker's safety check: attempt to find an ordering in which all non-blocked processes can finish, releasing their resources to unblock others. If some processes cannot be unblocked, they are deadlocked. In practice, database systems detect deadlocks with timeout-based heuristics (if a transaction waits longer than a threshold, assume deadlock) or dedicated deadlock detector threads.",
    },
  ],
  followUps: [
    "How do distributed deadlocks differ from single-system deadlocks, and what detection algorithms exist for them?",
    "What is the two-phase locking protocol and how does it relate to deadlock?",
    "How does the Linux kernel handle lock ordering and deadlock prevention in kernel code (lockdep)?",
    "What are the trade-offs between optimistic and pessimistic concurrency control with respect to deadlocks?",
    "How do modern database engines (PostgreSQL, MySQL/InnoDB) detect and resolve deadlocks?",
    "What is a phantom deadlock in distributed systems?",
  ],
  mcqs: [
    {
      q: "Which of the following is NOT one of the four Coffman conditions for deadlock?",
      options: [
        "Mutual exclusion",
        "Hold and wait",
        "Bounded waiting",
        "Circular wait",
      ],
      answerIndex: 2,
      explanation:
        "Bounded waiting is a property of synchronization solutions (e.g., for the critical section problem), not a Coffman condition. The four conditions are mutual exclusion, hold and wait, no preemption, and circular wait.",
    },
    {
      q: "In a resource allocation graph with single-instance resource types, a cycle is:",
      options: [
        "Necessary but not sufficient for deadlock",
        "Sufficient but not necessary for deadlock",
        "Both necessary and sufficient for deadlock",
        "Neither necessary nor sufficient for deadlock",
      ],
      answerIndex: 2,
      explanation:
        "With single-instance resource types, a cycle in the resource allocation graph is both necessary and sufficient for deadlock. With multi-instance types, a cycle is necessary but not sufficient.",
    },
    {
      q: "The Banker's algorithm is an example of:",
      options: [
        "Deadlock prevention",
        "Deadlock avoidance",
        "Deadlock detection",
        "Deadlock recovery",
      ],
      answerIndex: 1,
      explanation:
        "The Banker's algorithm dynamically checks whether granting a resource request would leave the system in a safe state. This is deadlock avoidance -- it does not prevent any Coffman condition structurally, but it refuses requests that could lead to an unsafe state.",
    },
    {
      q: "In the wait-die scheme, what happens when a younger transaction requests a resource held by an older transaction?",
      options: [
        "The younger transaction waits",
        "The younger transaction is aborted (dies)",
        "The older transaction is preempted",
        "Both transactions are aborted",
      ],
      answerIndex: 1,
      explanation:
        "In wait-die, older transactions wait for younger ones, but younger transactions requesting resources held by older ones are aborted (die) and restarted with their original timestamp.",
    },
    {
      q: "Which deadlock handling strategy typically provides the highest resource utilization?",
      options: [
        "Prevention",
        "Avoidance",
        "Detection and recovery",
        "All provide equal utilization",
      ],
      answerIndex: 2,
      explanation:
        "Detection and recovery places no constraints on resource allocation, so resources are allocated freely and utilization is highest. Deadlocks are detected after the fact and resolved by termination or rollback. Prevention and avoidance both restrict allocation, reducing utilization.",
    },
    {
      q: "What distinguishes a livelock from a deadlock?",
      options: [
        "Livelock involves more than two processes",
        "In a livelock, processes are not blocked but still make no progress",
        "Livelock can only occur in distributed systems",
        "Livelock is caused by priority inversion",
      ],
      answerIndex: 1,
      explanation:
        "In a deadlock, processes are blocked and waiting indefinitely. In a livelock, processes are actively executing (not blocked) but their actions are unproductive -- they continuously react to each other without making forward progress.",
    },
    {
      q: "The Mars Pathfinder incident (1997) was caused by:",
      options: [
        "A deadlock between two subsystems",
        "A livelock in the communication protocol",
        "Priority inversion on a shared resource",
        "A race condition in the navigation code",
      ],
      answerIndex: 2,
      explanation:
        "The Mars Pathfinder experienced priority inversion: a low-priority meteorological task held a mutex needed by a high-priority bus management task, while medium-priority tasks preempted the low-priority task, causing the high-priority task to miss deadlines and triggering system resets. The fix was enabling priority inheritance.",
    },
  ],
  exercises: [
    "Given 5 processes and 3 resource types with the following Allocation and Max matrices, apply the Banker's algorithm to determine if the system is in a safe state. If safe, provide a safe sequence.",
    "Draw the resource allocation graph for a system where P1 holds R1 and requests R2, P2 holds R2 and requests R3, and P3 holds R3 and requests R1. Identify the deadlock.",
    "Implement a deadlock detector that builds a wait-for graph from a list of (holder, waiter) pairs and uses DFS to find cycles.",
    "Modify the Dining Philosophers problem to prevent deadlock using the resource ordering technique. Verify that your solution does not starve any philosopher.",
    "Design a lock manager class that tracks acquisition order across threads and raises an exception if a thread attempts to acquire locks out of order (violating the total ordering invariant).",
    "Simulate the wait-die and wound-wait schemes for a set of concurrent database transactions with known timestamps and resource requests. Compare the number of rollbacks each scheme produces.",
    "Analyze a real-world deadlock scenario (e.g., from a database slow query log or a Java thread dump) and identify which Coffman conditions are present. Propose a fix.",
  ],
  flashcards: [
    {
      front: "What is a deadlock?",
      back: "A permanent blocking condition where two or more processes are each waiting for a resource held by another, forming a circular dependency that prevents any of them from proceeding.",
    },
    {
      front: "Name the four Coffman conditions.",
      back: "1. Mutual exclusion 2. Hold and wait 3. No preemption 4. Circular wait. All four must hold simultaneously for a deadlock to exist.",
    },
    {
      front: "What does the Banker's algorithm determine?",
      back: "Whether the current system state is safe -- i.e., whether there exists a sequence in which all processes can complete by acquiring their maximum remaining resource needs. It is used for deadlock avoidance.",
    },
    {
      front: "What is a safe state?",
      back: "A state in which there exists at least one safe sequence -- an ordering of all processes such that each can obtain its maximum needed resources from available resources plus those released by previously completed processes.",
    },
    {
      front: "How does deadlock prevention differ from deadlock avoidance?",
      back: "Prevention structurally eliminates one Coffman condition at design time (e.g., lock ordering). Avoidance uses runtime algorithms (e.g., Banker's) to dynamically refuse requests that would enter an unsafe state.",
    },
    {
      front: "What is a resource allocation graph (RAG)?",
      back: "A directed graph with process nodes (circles), resource nodes (rectangles with dots for instances), request edges (process to resource), and assignment edges (resource to process). Cycles indicate potential deadlocks.",
    },
    {
      front: "What is livelock?",
      back: "A condition where processes are not blocked but actively change state in response to each other without making progress. Unlike deadlock, processes are running but accomplishing nothing useful.",
    },
    {
      front: "What is priority inversion?",
      back: "When a high-priority task is indirectly blocked by a low-priority task holding a shared resource, because medium-priority tasks preempt the low-priority holder. Solved by priority inheritance or priority ceiling protocols.",
    },
    {
      front: "Explain the wait-die scheme.",
      back: "A timestamp-based deadlock prevention scheme: an older transaction waits for a younger holder; a younger transaction requesting a resource held by an older one is aborted (dies) and restarted with its original timestamp.",
    },
    {
      front: "Explain the wound-wait scheme.",
      back: "A timestamp-based deadlock prevention scheme: an older transaction preempts (wounds) a younger holder, forcing it to abort; a younger transaction waits for an older holder. Both schemes prevent circular wait.",
    },
    {
      front: "When is a cycle in a RAG sufficient for deadlock?",
      back: "When each resource type has exactly one instance. With multiple instances, a cycle is necessary but not sufficient -- further analysis (e.g., Banker's safety algorithm) is needed.",
    },
    {
      front: "What is the ostrich algorithm?",
      back: "The strategy of ignoring deadlocks entirely, used by most general-purpose operating systems (Linux, Windows). The rationale is that deadlocks are rare enough that the overhead of prevention or avoidance is not justified.",
    },
  ],
  revisionNotes: [
    "A deadlock requires ALL four Coffman conditions simultaneously: mutual exclusion, hold and wait, no preemption, circular wait.",
    "Breaking any single Coffman condition prevents deadlock. Lock ordering (breaking circular wait) is the most practical approach in application code.",
    "RAG cycle: necessary for deadlock always, sufficient only with single-instance resource types.",
    "Banker's algorithm: maintains Available, Max, Allocation, Need matrices. Grants a request only if the resulting state is safe (a safe sequence exists).",
    "Safe state: guarantees no deadlock. Unsafe state: deadlock is possible but not guaranteed. Deadlocked state: deadlock has occurred.",
    "Detection uses wait-for graphs (single instance: cycle = deadlock) or a reduction algorithm (multi-instance).",
    "Recovery options: terminate all deadlocked processes, terminate one at a time (pick victim by cost), or roll back processes to checkpoints and preempt resources.",
    "Wait-die: older waits, younger dies. Wound-wait: older wounds (preempts), younger waits. Both use original timestamps on restart to prevent starvation.",
    "Livelock: processes are active but make no progress. Resolved with randomization or asymmetric behavior.",
    "Priority inversion: high blocks on low holding mutex, while medium preempts low. Fix: priority inheritance (boost low to high's priority while holding the mutex).",
  ],
  cheatSheet: [
    "Deadlock = circular wait among processes holding and requesting resources",
    "4 conditions (all required): Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait",
    "Prevention: break a condition at design time (ordering, all-or-nothing, preemptive release)",
    "Avoidance: Banker's algo -- check safe state before granting (O(m*n^2))",
    "Detection: cycle in wait-for graph (single-instance) or reduction algorithm (multi-instance)",
    "Recovery: process termination or resource preemption + rollback",
    "RAG cycle: necessary always; sufficient only for single-instance resources",
    "Safe state -> no deadlock guaranteed; Unsafe state -> deadlock possible",
    "Wait-die: old waits / young dies; Wound-wait: old wounds / young waits",
    "Livelock: active but no progress; fix with randomization",
    "Priority inversion fix: priority inheritance or priority ceiling protocol",
    "Ostrich algorithm: ignore deadlocks (used by Linux, Windows for most resources)",
    "Dining Philosophers: classic deadlock demo; fix with fork numbering (resource ordering)",
  ],
  resources: [
    {
      label: "Operating System Concepts (Silberschatz, Galvin, Gagne) -- Chapters 7-8",
      kind: "book",
      note: "The standard textbook treatment of deadlocks, covering all four strategies with worked examples and the Banker's algorithm.",
    },
    {
      label: "Modern Operating Systems (Tanenbaum) -- Chapter 6",
      kind: "book",
      note: "Thorough coverage of deadlocks with practical examples from real operating systems.",
    },
    {
      label: "Coffman, Elphick, Shoshani -- System Deadlocks (1971)",
      kind: "paper",
      note: "The original paper defining the four necessary conditions for deadlock.",
    },
    {
      label: "The Mars Pathfinder Priority Inversion Problem",
      kind: "article",
      note: "Detailed account of the real-world priority inversion bug on the Mars Pathfinder rover and how priority inheritance fixed it.",
    },
    {
      label: "Deadlock Detection in Linux Kernel (lockdep)",
      kind: "docs",
      note: "Documentation on the Linux kernel's lock dependency validator, which detects potential deadlocks at runtime via lock ordering analysis.",
    },
    {
      label: "Java Concurrency in Practice (Goetz et al.) -- Chapter 10",
      kind: "book",
      note: "Practical advice on avoiding deadlocks in Java applications, including lock ordering, open calls, and timed lock attempts.",
    },
    {
      label: "MIT 6.824: Distributed Systems Lecture on Deadlocks",
      kind: "video",
      note: "Covers distributed deadlock detection algorithms including centralized, distributed, and hierarchical approaches.",
    },
  ],
  glossary: [
    {
      term: "Deadlock",
      definition:
        "A state where two or more processes are permanently blocked, each waiting for a resource held by another process in a circular chain.",
    },
    {
      term: "Coffman conditions",
      definition:
        "The four necessary and jointly sufficient conditions for deadlock: mutual exclusion, hold and wait, no preemption, and circular wait.",
    },
    {
      term: "Resource Allocation Graph (RAG)",
      definition:
        "A directed graph representing processes, resources, request edges, and assignment edges, used to model and detect deadlocks.",
    },
    {
      term: "Safe state",
      definition:
        "A system state in which there exists at least one ordering (safe sequence) of processes such that all can complete without deadlock.",
    },
    {
      term: "Unsafe state",
      definition:
        "A state where no safe sequence exists. Deadlock is possible but not certain; it depends on future resource requests.",
    },
    {
      term: "Banker's algorithm",
      definition:
        "A deadlock avoidance algorithm that checks whether granting a resource request keeps the system in a safe state by searching for a safe sequence.",
    },
    {
      term: "Wait-for graph",
      definition:
        "A simplified resource allocation graph containing only process nodes, where an edge from P to Q means P is waiting for a resource held by Q.",
    },
    {
      term: "Livelock",
      definition:
        "A condition where processes continuously change state in response to each other but make no actual progress, unlike deadlock where processes are blocked.",
    },
    {
      term: "Priority inversion",
      definition:
        "A scheduling anomaly where a high-priority task is indirectly blocked by a low-priority task due to shared resource contention and preemption by medium-priority tasks.",
    },
    {
      term: "Priority inheritance",
      definition:
        "A protocol that temporarily raises the priority of a resource-holding task to the priority of the highest-priority task waiting for that resource.",
    },
    {
      term: "Starvation",
      definition:
        "A condition where a process is indefinitely denied access to a resource it needs, not because of circular dependency but because other processes are continually preferred.",
    },
    {
      term: "Circular wait",
      definition:
        "A condition where a set of processes form a circular chain, each waiting for a resource held by the next process in the chain.",
    },
  ],
};
