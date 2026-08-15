import type { TopicContent } from "../types";

export const raceConditions: TopicContent = {
  quickSummary: [
    "A race condition occurs when the behavior of a system depends on the relative timing or interleaving of multiple concurrent operations, leading to unpredictable and incorrect results.",
    "Data races are a specific subset where two or more threads access the same memory location concurrently with at least one write and no synchronization, causing undefined behavior in languages like C/C++.",
    "TOCTOU (Time-of-Check-to-Time-of-Use) bugs arise when a condition is checked and then acted upon, but the condition changes between the check and the use, commonly seen in file system operations and security-sensitive code.",
    "Prevention strategies include mutual exclusion via locks, atomic operations, lock-free data structures, and detection tools such as ThreadSanitizer and the Go race detector that identify races at runtime or compile time.",
  ],

  detailed: [
    "Race conditions represent one of the most insidious classes of concurrency bugs because they are non-deterministic: a program may pass thousands of test runs and only fail under specific timing conditions in production. The fundamental issue is that concurrent operations interleave in ways the programmer did not anticipate or guard against. When two threads execute a read-modify-write sequence on shared state without synchronization, the final value depends on which thread's write lands last. This is the classic lost update problem, seen in everything from counter increments to bank account transfers.",

    "A data race is a more precisely defined concept than a race condition. The C++ and Java memory models formally define a data race as two conflicting accesses (at least one a write) to the same memory location by different threads without a happens-before relationship. In C and C++, data races cause undefined behavior, meaning the compiler is free to assume they never happen and may optimize code in ways that break under concurrent access. In Java, the Java Memory Model (JMM) provides weaker guarantees: without proper synchronization, threads may see stale or partially constructed values due to caching and instruction reordering.",

    "TOCTOU bugs are a pattern of race condition frequently found in security-critical code. The canonical example is checking whether a file exists and then opening it: between the check and the open, an attacker can replace the file with a symbolic link to a sensitive resource. TOCTOU vulnerabilities have been exploited in privilege escalation attacks on Unix systems for decades. The fix typically involves using atomic operations that combine the check and the action, such as open with O_CREAT | O_EXCL flags, or using file descriptor-based operations instead of path-based ones.",

    "Critical sections are regions of code that access shared resources and must not be executed by more than one thread at a time. Protecting critical sections is the primary mechanism for preventing race conditions. This can be achieved through mutexes, semaphores, monitors, or language-level constructs like Java's synchronized keyword or Go's sync.Mutex. The choice of synchronization primitive affects both correctness and performance: coarse-grained locking is simpler but limits parallelism, while fine-grained locking improves throughput but increases the risk of deadlocks and is harder to reason about.",

    "Detection of race conditions has advanced significantly with tools like ThreadSanitizer (TSan), which instruments memory accesses at compile time and tracks happens-before relationships at runtime. TSan can detect data races in C, C++, and Go programs with a typical 5-15x slowdown. Go's built-in race detector uses a similar approach and is enabled with the -race flag. For Java, tools like FindBugs (now SpotBugs) perform static analysis to identify potential races, while dynamic tools like Java PathFinder explore different thread interleavings systematically. Despite these tools, many race conditions remain difficult to detect because they require specific timing conditions that may not be exercised during testing.",
  ],

  deepDive: [
    "The happens-before relationship is the formal foundation for reasoning about data races. Defined by Leslie Lamport and adopted by modern memory models, it establishes a partial order over events in a concurrent program. In Java, happens-before edges are created by synchronized blocks, volatile reads and writes, thread start and join operations, and the initialization of final fields. The C++ memory model extends this with memory orderings (seq_cst, acquire, release, relaxed) that give programmers fine-grained control over which ordering guarantees they need, trading correctness assurance for performance. Understanding these orderings is essential for writing correct lock-free algorithms.",

    "Lock-free and wait-free algorithms avoid traditional mutual exclusion entirely, using atomic compare-and-swap (CAS) operations as their fundamental building block. A lock-free algorithm guarantees that at least one thread makes progress in a finite number of steps, even if other threads are suspended. Wait-free algorithms provide the stronger guarantee that every thread completes in a bounded number of steps. The ABA problem is a subtle race condition specific to CAS-based algorithms: a value changes from A to B and back to A, causing a CAS to succeed when it logically should not. Solutions include tagged pointers, hazard pointers, and epoch-based reclamation.",

    "In distributed systems, race conditions manifest at a higher level of abstraction. The lost update problem appears when two clients read a value, modify it independently, and write it back, with the last write overwriting the first. Solutions include optimistic concurrency control with version vectors, compare-and-swap at the storage level, and conflict-free replicated data types (CRDTs) that are designed to be merged without coordination. The FLP impossibility result shows that in an asynchronous distributed system, no deterministic consensus algorithm can tolerate even a single crash failure, fundamentally limiting the approaches available for preventing distributed race conditions.",

    "Modern CPU architectures introduce additional complexity through store buffers, cache coherence protocols (MESI, MOESI), and speculative execution. On x86, the Total Store Order (TSO) memory model provides relatively strong guarantees, making many races invisible on that architecture but potentially catastrophic on ARM or POWER, which have weaker memory models. This architectural variation means that code tested on x86 may exhibit data races on ARM devices. The Linux kernel's LKMM (Linux Kernel Memory Model) formalizes the guarantees provided by the kernel's synchronization primitives across all supported architectures, and tools like herd7 and klitmus7 can verify the correctness of concurrent kernel code against this model.",
  ],

  code: [
    {
      language: "java",
      caption: "Classic race condition: lost update on a shared counter",
      source: `public class CounterRace {
    private int count = 0;

    public void increment() {
        // Not atomic: read count, add 1, write count
        count++;  // This is actually: temp = count; temp = temp + 1; count = temp;
    }

    public int getCount() {
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        CounterRace counter = new CounterRace();
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) counter.increment();
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) counter.increment();
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        // Expected: 200000, Actual: some value less than 200000
        System.out.println("Count: " + counter.getCount());
    }
}

// Fix: use AtomicInteger or synchronized
// private final AtomicInteger count = new AtomicInteger(0);
// public void increment() { count.incrementAndGet(); }`,
    },
    {
      language: "java",
      caption: "Check-then-act race with synchronized fix",
      source: `import java.util.HashMap;
import java.util.Map;

public class CheckThenActRace {
    private final Map<String, String> cache = new HashMap<>();

    // BROKEN: check-then-act is not atomic
    public String getOrComputeBroken(String key) {
        if (!cache.containsKey(key)) {       // Check
            // Another thread may insert between check and act
            String value = expensiveCompute(key);
            cache.put(key, value);             // Act
        }
        return cache.get(key);
    }

    // FIXED: synchronized makes the entire operation atomic
    public synchronized String getOrComputeFixed(String key) {
        if (!cache.containsKey(key)) {
            String value = expensiveCompute(key);
            cache.put(key, value);
        }
        return cache.get(key);
    }

    // BETTER: use ConcurrentHashMap.computeIfAbsent
    // private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
    // public String getOrCompute(String key) {
    //     return cache.computeIfAbsent(key, this::expensiveCompute);
    // }

    private String expensiveCompute(String key) {
        return key.toUpperCase();
    }
}`,
    },
    {
      language: "go",
      caption: "Data race in Go and detection with the race detector",
      source: `package main

import (
\t"fmt"
\t"sync"
)

// Run with: go run -race main.go
// The race detector will report the data race on 'balance'

func main() {
\tbalance := 0
\tvar wg sync.WaitGroup

\t// BROKEN: concurrent read-modify-write without synchronization
\tfor i := 0; i < 1000; i++ {
\t\twg.Add(1)
\t\tgo func() {
\t\t\tdefer wg.Done()
\t\t\tbalance++ // DATA RACE: unsynchronized access
\t\t}()
\t}
\twg.Wait()
\tfmt.Println("Broken balance:", balance)

\t// FIXED: use a mutex to protect the critical section
\tbalance = 0
\tvar mu sync.Mutex
\tfor i := 0; i < 1000; i++ {
\t\twg.Add(1)
\t\tgo func() {
\t\t\tdefer wg.Done()
\t\t\tmu.Lock()
\t\t\tbalance++
\t\t\tmu.Unlock()
\t\t}()
\t}
\twg.Wait()
\tfmt.Println("Fixed balance:", balance)
}`,
    },
    {
      language: "go",
      caption: "TOCTOU race with file operations in Go",
      source: `package main

import (
\t"fmt"
\t"os"
)

// BROKEN: TOCTOU race between stat and open
func writeFileBroken(path string, data []byte) error {
\t// Check: does the file exist?
\t_, err := os.Stat(path)
\tif err == nil {
\t\treturn fmt.Errorf("file %s already exists", path)
\t}
\t// RACE WINDOW: another process can create the file here

\t// Act: create and write the file
\treturn os.WriteFile(path, data, 0644)
}

// FIXED: use O_EXCL to atomically check-and-create
func writeFileFixed(path string, data []byte) error {
\tf, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
\tif err != nil {
\t\tif os.IsExist(err) {
\t\t\treturn fmt.Errorf("file %s already exists", path)
\t\t}
\t\treturn err
\t}
\tdefer f.Close()

\t_, err = f.Write(data)
\treturn err
}

func main() {
\terr := writeFileFixed("/tmp/example.txt", []byte("hello"))
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t} else {
\t\tfmt.Println("File written successfully")
\t}
}`,
    },
    {
      language: "cpp",
      caption: "Race condition with std::thread and fixes using std::mutex and std::atomic",
      source: `#include <iostream>
#include <thread>
#include <mutex>
#include <atomic>
#include <vector>

// BROKEN: unsynchronized read-modify-write
class BrokenCounter {
public:
    int count = 0;
    void increment() {
        // Not atomic: load count, add 1, store count
        // Threads can interleave between these steps
        count++;
    }
};

// FIXED with mutex
class MutexCounter {
public:
    int count = 0;
    void increment() {
        std::lock_guard<std::mutex> lock(mtx_);
        count++;
    }
private:
    std::mutex mtx_;
};

// FIXED with atomic
class AtomicCounter {
public:
    std::atomic<int> count{0};
    void increment() {
        count.fetch_add(1, std::memory_order_relaxed);
    }
};

template <typename Counter>
void testCounter(const std::string& label) {
    Counter counter;
    std::vector<std::thread> threads;
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&counter]() {
            for (int j = 0; j < 100'000; ++j) {
                counter.increment();
            }
        });
    }
    for (auto& t : threads) t.join();
    std::cout << label << ": expected=1000000, actual="
              << counter.count << std::endl;
}

int main() {
    testCounter<BrokenCounter>("Broken");
    testCounter<MutexCounter>("Mutex");
    testCounter<AtomicCounter>("Atomic");
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Singleton pattern race condition and double-checked locking in C++",
      source: `#include <iostream>
#include <thread>
#include <mutex>
#include <atomic>
#include <vector>
#include <set>

// BROKEN: race condition -- two threads can both see instance_ as nullptr
class BrokenSingleton {
public:
    static BrokenSingleton* getInstance() {
        if (instance_ == nullptr) {       // Thread A checks: nullptr
            // Thread B also checks: nullptr (context switch)
            instance_ = new BrokenSingleton();  // Both create instances
        }
        return instance_;
    }
    std::string data = "initialized";
private:
    BrokenSingleton() = default;
    static BrokenSingleton* instance_;
};
BrokenSingleton* BrokenSingleton::instance_ = nullptr;

// FIXED: double-checked locking with std::atomic and std::mutex
class FixedSingleton {
public:
    static FixedSingleton* getInstance() {
        auto* p = instance_.load(std::memory_order_acquire);
        if (p == nullptr) {                          // First check (no lock)
            std::lock_guard<std::mutex> lock(mtx_);  // Acquire lock
            p = instance_.load(std::memory_order_relaxed);
            if (p == nullptr) {                      // Second check (with lock)
                p = new FixedSingleton();
                instance_.store(p, std::memory_order_release);
            }
        }
        return p;
    }
    std::string data = "initialized";
private:
    FixedSingleton() = default;
    static std::atomic<FixedSingleton*> instance_;
    static std::mutex mtx_;
};
std::atomic<FixedSingleton*> FixedSingleton::instance_{nullptr};
std::mutex FixedSingleton::mtx_;

// BEST: use C++11 static local (Meyers' Singleton, thread-safe by standard)
class MeyersSingleton {
public:
    static MeyersSingleton& getInstance() {
        static MeyersSingleton instance;  // Thread-safe in C++11+
        return instance;
    }
    std::string data = "initialized";
private:
    MeyersSingleton() = default;
};

// Verify thread safety
int main() {
    std::vector<FixedSingleton*> instances;
    std::mutex vecMtx;
    std::vector<std::thread> threads;

    for (int i = 0; i < 100; ++i) {
        threads.emplace_back([&]() {
            auto* inst = FixedSingleton::getInstance();
            std::lock_guard<std::mutex> lock(vecMtx);
            instances.push_back(inst);
        });
    }
    for (auto& t : threads) t.join();

    std::set<FixedSingleton*> unique(instances.begin(), instances.end());
    std::cout << "Unique instances: " << unique.size() << std::endl;  // Should be 1
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Lost Update Race Condition",
      kind: "sequence",
      caption: "Two threads read the same value, both increment locally, and one write overwrites the other, causing a lost update.",
      mermaid: `sequenceDiagram
    participant T1 as Thread 1
    participant MEM as Shared Memory
    participant T2 as Thread 2
    T1->>MEM: read counter = 5
    T2->>MEM: read counter = 5
    T1->>T1: local = 5 + 1 = 6
    T2->>T2: local = 5 + 1 = 6
    T1->>MEM: write counter = 6
    T2->>MEM: write counter = 6
    Note over MEM: Counter is 6, not 7 — lost update`,
    },
    {
      title: "Mutex Critical Section",
      kind: "state",
      caption: "A mutex enforces mutual exclusion. Only one thread can be in the critical section at a time; others block until the lock is released.",
      mermaid: `stateDiagram-v2
    [*] --> Unlocked
    Unlocked --> Locked : Thread acquires lock
    Locked --> Locked : Other threads block
    Locked --> Unlocked : Thread releases lock
    Unlocked --> Locked : Next thread acquires`,
    },
    {
      title: "Optimistic vs Pessimistic Locking",
      kind: "flow",
      caption: "Optimistic locking reads freely and validates at write time via version check. Pessimistic locking acquires a lock before reading to prevent conflicts entirely.",
      mermaid: `flowchart TD
    A([Access shared resource]) --> B{Strategy?}
    B -->|Optimistic| C[Read data + version]
    B -->|Pessimistic| D[Acquire lock]
    C --> E[Modify locally]
    E --> F{Version unchanged?}
    F -->|Yes| G[Write + increment version]
    F -->|No| H[Retry from read]
    D --> I[Read and modify]
    I --> J[Write]
    J --> K[Release lock]`,
    },
    {
      title: "Race Condition Prevention Techniques",
      kind: "mindmap",
      caption: "Overview of techniques to prevent race conditions grouped by approach: synchronization primitives, atomic operations, immutability, and architecture.",
      mermaid: `mindmap
  root((Race Condition Prevention))
    Synchronization
      Mutex / Lock
      Read-Write Lock
      Semaphore
      Monitor
    Atomic Operations
      CAS Compare-And-Swap
      Atomic integers
      Lock-free queues
    Immutability
      Immutable data structures
      Copy-on-write
      Functional style
    Architecture
      Actor model
      Message passing
      Single-threaded event loop`,
    },
  ],

  animations: [
    {
      title: "Lost Update: Read-Modify-Write Race",
      steps: [
        {
          label: "Initial state",
          detail:
            "Shared counter is 0. Thread A and Thread B both want to increment it.",
        },
        {
          label: "Thread A reads",
          detail:
            "Thread A reads the counter value (0) into its local register.",
        },
        {
          label: "Context switch",
          detail:
            "The OS preempts Thread A. Thread B is now scheduled to run.",
        },
        {
          label: "Thread B reads, increments, writes",
          detail:
            "Thread B reads 0, increments to 1, and writes 1 back to the counter.",
        },
        {
          label: "Thread A resumes and writes",
          detail:
            "Thread A resumes with its stale local value of 0, increments to 1, and writes 1. Thread B's update is lost.",
        },
        {
          label: "Result",
          detail:
            "Counter is 1 instead of the expected 2. One increment was completely lost due to the race.",
        },
      ],
    },
    {
      title: "TOCTOU File System Attack",
      steps: [
        {
          label: "Victim checks file",
          detail:
            "A privileged process calls access() to verify the user owns /tmp/userfile.",
        },
        {
          label: "Check passes",
          detail:
            "The file is owned by the user, so the access check returns success.",
        },
        {
          label: "Attacker intervenes",
          detail:
            "Between the check and the open, the attacker deletes /tmp/userfile and creates a symlink: /tmp/userfile -> /etc/shadow.",
        },
        {
          label: "Victim opens file",
          detail:
            "The privileged process opens /tmp/userfile, which now points to /etc/shadow.",
        },
        {
          label: "Exploitation",
          detail:
            "The attacker can now read or write /etc/shadow through the privileged process, escalating privileges.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Race Condition",
      "Data Race",
      "TOCTOU",
    ],
    rows: [
      [
        "Definition",
        "Outcome depends on non-deterministic ordering of operations",
        "Two threads access same memory with at least one write and no synchronization",
        "Condition changes between check and subsequent use",
      ],
      [
        "Scope",
        "Broad: includes logic races, protocol races, UI races",
        "Narrow: specifically about unsynchronized memory access",
        "Specific pattern: check followed by dependent action",
      ],
      [
        "Undefined behavior?",
        "No (logically wrong but defined behavior in most languages)",
        "Yes in C/C++; partially in Java (weak guarantees without volatile/synchronized)",
        "No (defined behavior, but security-relevant incorrect behavior)",
      ],
      [
        "Example",
        "Two threads both check balance >= withdrawal, both proceed",
        "Two threads writing to the same int without a lock",
        "Checking file permissions then opening the file",
      ],
      [
        "Detection tools",
        "Model checkers, stress testing, code review",
        "ThreadSanitizer, Go race detector, Helgrind",
        "Static analysis, security audits",
      ],
      [
        "Prevention",
        "Atomic operations, transactional logic, serialization",
        "Locks, atomics, memory barriers, immutable data",
        "Atomic check-and-act APIs (O_EXCL, CAS), fd-based operations",
      ],
      [
        "Can exist without the other?",
        "Yes: race condition without data race (e.g., using atomics but wrong logic)",
        "Yes: data race without race condition (e.g., benign race on a diagnostic counter)",
        "Is a subtype of race condition",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What is the difference between a race condition and a data race?",
      a: "A race condition is a semantic bug where program correctness depends on the relative timing of operations. A data race is a lower-level issue where two threads access the same memory location concurrently with at least one write and no synchronization. You can have a race condition without a data race (e.g., using atomic operations but with incorrect logic) and a data race without a race condition (e.g., a benign write to a diagnostic flag). In C/C++, data races cause undefined behavior, while race conditions produce defined but logically incorrect results.",
      followUps: [
        "Can you give an example of a race condition that is not a data race?",
        "What does 'undefined behavior' mean concretely for a data race in C++?",
      ],
    },
    {
      q: "Does Python's GIL prevent race conditions?",
      a: "No. The GIL (Global Interpreter Lock) ensures only one thread executes Python bytecode at a time, which prevents data races at the C level, but compound operations like 'counter += 1' compile to multiple bytecodes (LOAD, ADD, STORE). The GIL can release between these instructions, allowing another thread to interleave. Additionally, I/O-bound code releases the GIL, and operations involving C extensions or ctypes bypass it entirely. You still need threading.Lock or other synchronization for correctness.",
      followUps: [
        "What about multiprocessing — does it avoid race conditions?",
        "How does asyncio handle this differently from threads?",
      ],
    },
    {
      q: "What is a TOCTOU vulnerability and how do you prevent it?",
      a: "TOCTOU (Time-of-Check-to-Time-of-Use) occurs when a program checks a condition and then acts on it, but the condition can change between the two steps. The classic example is checking file permissions with access() and then opening the file — an attacker can swap the file via a symlink in between. Prevention: use atomic operations that combine the check and action (e.g., open with O_CREAT|O_EXCL), operate on file descriptors rather than paths after opening, use fstat instead of stat, and minimize the window between check and use.",
      followUps: [
        "Can TOCTOU occur in database operations?",
        "How does this relate to the confused deputy problem?",
      ],
    },
    {
      q: "How does ThreadSanitizer (TSan) detect data races?",
      a: "TSan instruments every memory access at compile time, recording the thread ID, access type (read/write), and a logical timestamp based on vector clocks. It maintains shadow memory that stores the last two accesses to each memory location. When a new access occurs, TSan checks whether it conflicts with previous accesses (different thread, at least one write) and whether a happens-before relationship exists between them via synchronization. If no happens-before edge exists, it reports a data race. TSan typically incurs 5-15x slowdown and 5-10x memory overhead.",
    },
    {
      q: "What is the ABA problem in lock-free programming?",
      a: "The ABA problem occurs in CAS (Compare-And-Swap) based algorithms when a value changes from A to B and back to A. A thread reads A, is preempted, and when it resumes, the CAS succeeds because the value is still A — but the underlying state may have changed. For example, in a lock-free stack, a node might be popped and reused; a CAS on the head pointer succeeds but the stack structure has changed. Solutions include tagged pointers (appending a monotonic counter to the pointer), hazard pointers, and epoch-based reclamation.",
      followUps: [
        "How do tagged pointers solve the ABA problem?",
        "What is the difference between lock-free and wait-free?",
      ],
    },
    {
      q: "How would you design a thread-safe singleton in Java?",
      a: "The best approaches are: (1) Use an enum, which the JVM guarantees is instantiated once and is thread-safe by specification. (2) Use the initialization-on-demand holder idiom: a static inner class whose static field holds the instance — class loading is synchronized by the JVM. (3) Use double-checked locking with a volatile field: check without lock, acquire lock, check again, then create. The volatile is essential to prevent instruction reordering that could expose a partially constructed object. Avoid the naive approach of just using synchronized on getInstance() as it creates unnecessary contention.",
      followUps: [
        "Why must the field be volatile in double-checked locking?",
        "What is the initialization-on-demand holder idiom?",
      ],
    },
    {
      q: "What strategies exist for preventing race conditions in database transactions?",
      a: "Key strategies include: (1) Pessimistic locking with SELECT FOR UPDATE to lock rows during a transaction. (2) Optimistic concurrency control using version columns — read the version, perform the update with a WHERE clause on the version, and retry if no rows were affected. (3) Serializable isolation level, which prevents all anomalies but reduces throughput. (4) Atomic operations like UPDATE counter SET value = value + 1, which avoid read-modify-write races. (5) Advisory locks for application-level coordination. (6) Idempotency keys to safely retry operations without duplication.",
    },
    {
      q: "Explain the happens-before relationship and why it matters for data races.",
      a: "The happens-before relationship is a partial order defined by the language memory model that determines when one thread's actions are guaranteed to be visible to another. In Java, it is established by: synchronized lock/unlock pairs, volatile reads/writes, Thread.start() and Thread.join(), and final field semantics. If there is no happens-before path from a write to a read of the same location, the read may see a stale value — this is a data race. The happens-before model allows compilers and CPUs to reorder instructions freely except where edges exist, enabling optimizations while providing a clear contract for programmers.",
    },
  ],

  followUps: [
    "What's the difference between a race condition and a data race?",
    "Why is `counter++` not atomic, and what does compare-and-swap do about it?",
    "Why do race conditions often disappear when you add logging?",
    "How would you write a test that reliably catches this race?",
  ],
  mcqs: [
    {
      q: "What is the output of two threads each incrementing a shared counter 100,000 times without synchronization?",
      options: [
        "Always exactly 200,000",
        "Always exactly 100,000",
        "Some value between 100,000 and 200,000, varying across runs",
        "Undefined behavior in all languages",
      ],
      answerIndex: 2,
      explanation:
        "Without synchronization, increments can be lost due to interleaved read-modify-write operations. The result is non-deterministic but bounded between the count from one thread and the sum of both. In C/C++ it would technically be undefined behavior, but in Java and Python the value is merely incorrect.",
    },
    {
      q: "Which of the following is a TOCTOU vulnerability?",
      options: [
        "Using a mutex to protect a shared counter",
        "Checking if a file exists with stat() then opening it with open()",
        "Using AtomicInteger.compareAndSet() in a retry loop",
        "Reading a volatile variable before writing it",
      ],
      answerIndex: 1,
      explanation:
        "The stat-then-open pattern is the classic TOCTOU: the file system state can change between the check and the use. An attacker can replace the file with a symlink in the race window.",
    },
    {
      q: "Python's GIL prevents which of the following?",
      options: [
        "All race conditions in Python programs",
        "Data races at the CPython interpreter level (C data structures)",
        "Logic errors from interleaved bytecode execution",
        "Race conditions in multiprocessing programs",
      ],
      answerIndex: 1,
      explanation:
        "The GIL ensures that CPython's internal data structures are not corrupted by concurrent access. However, Python-level compound operations (like +=) span multiple bytecodes and can still interleave, causing race conditions.",
    },
    {
      q: "What is the ABA problem?",
      options: [
        "A deadlock caused by acquiring locks in alphabetical order",
        "A race where a CAS succeeds because the value changed from A to B and back to A",
        "A livelock where two threads alternate between states A and B",
        "A starvation scenario where thread A always preempts thread B",
      ],
      answerIndex: 1,
      explanation:
        "The ABA problem occurs in CAS-based algorithms when the target value is changed and changed back, making the CAS think nothing happened when the underlying state has actually changed.",
    },
    {
      q: "In Java's double-checked locking pattern for singletons, why must the instance field be declared volatile?",
      options: [
        "To make the field visible across different class loaders",
        "To prevent the JIT compiler from inlining the field access",
        "To prevent instruction reordering that could expose a partially constructed object",
        "To ensure the field is stored in main memory rather than the stack",
      ],
      answerIndex: 2,
      explanation:
        "Without volatile, the JVM may reorder the object allocation and constructor execution such that another thread sees the non-null reference before the constructor completes, reading uninitialized fields.",
    },
    {
      q: "Which tool is specifically designed to detect data races in Go programs?",
      options: [
        "go vet",
        "go test -race",
        "golangci-lint",
        "delve debugger",
      ],
      answerIndex: 1,
      explanation:
        "The -race flag enables Go's built-in race detector, which uses ThreadSanitizer-based instrumentation to detect data races at runtime. go vet performs static analysis but does not detect races dynamically.",
    },
  ],

  flashcards: [
    {
      front: "What is a race condition?",
      back: "A bug where the program's correctness depends on the non-deterministic relative timing or interleaving of concurrent operations.",
    },
    {
      front: "What is a data race?",
      back: "Two or more threads access the same memory location concurrently, at least one access is a write, and there is no synchronization (happens-before relationship) between them. Causes undefined behavior in C/C++.",
    },
    {
      front: "What does TOCTOU stand for and what does it mean?",
      back: "Time-of-Check-to-Time-of-Use. A race condition where the state checked by a program changes before the program acts on the result of that check.",
    },
    {
      front: "What is a critical section?",
      back: "A region of code that accesses shared resources and must be executed by at most one thread at a time to prevent race conditions.",
    },
    {
      front: "What is the lost update problem?",
      back: "When two threads both read a value, modify it, and write it back without synchronization. One thread's update is overwritten by the other's stale computation.",
    },
    {
      front: "How does ThreadSanitizer (TSan) detect races?",
      back: "It instruments memory accesses at compile time, tracks vector clocks for happens-before relationships, and reports when two conflicting accesses (at least one write) lack a happens-before edge.",
    },
    {
      front: "Does Python's GIL prevent race conditions?",
      back: "No. The GIL prevents data races on CPython internals, but compound Python operations (e.g., +=) span multiple bytecodes that can interleave. You still need locks for correctness.",
    },
    {
      front: "What is the ABA problem?",
      back: "In CAS-based algorithms, a value changes from A to B and back to A. The CAS succeeds because it sees A, but the underlying state has changed. Solved with tagged/versioned pointers.",
    },
    {
      front: "What is the happens-before relationship?",
      back: "A partial ordering of events in a concurrent program that determines when one thread's writes are guaranteed to be visible to another thread's reads. Defined by synchronization operations in the language's memory model.",
    },
    {
      front: "How do you prevent TOCTOU file system bugs?",
      back: "Use atomic APIs that combine check and action (O_CREAT|O_EXCL for creation), operate on file descriptors instead of paths, and use fstat/fchmod/fchown instead of stat/chmod/chown.",
    },
  ],

  revisionNotes: [
    "Race condition is the broad category (outcome depends on timing); data race is the specific case of unsynchronized concurrent memory access. You can have one without the other.",
    "TOCTOU bugs arise whenever a check and its dependent action are non-atomic. The fix is always to make them atomic: use O_EXCL for file creation, CAS for memory, SELECT FOR UPDATE for databases.",
    "In C/C++, data races are undefined behavior — the compiler may assume they never happen and optimize accordingly. In Java, data races produce defined but unpredictable results governed by the JMM.",
    "Python's GIL prevents corruption of CPython interpreter state but does NOT prevent application-level race conditions. The += operator is not atomic at the bytecode level.",
    "ThreadSanitizer uses compile-time instrumentation and vector clocks to detect data races with ~5-15x slowdown. Go's -race flag uses the same technology. Both are essential for CI pipelines.",
    "Lock-free algorithms use CAS as the fundamental primitive. They guarantee system-wide progress but are tricky to implement correctly due to the ABA problem and memory ordering concerns.",
    "Double-checked locking requires volatile in Java and std::atomic in C++ to prevent the compiler/CPU from reordering the object construction so that a partially constructed object is visible to other threads.",
    "In distributed systems, race conditions manifest as lost updates, write skew, and phantom reads. Prevention strategies include optimistic concurrency control (version vectors), CRDTs, and serializable transactions.",
  ],

  cheatSheet: [
    "Always identify the critical section first: what shared state is being accessed, and which operations must be atomic?",
    "Prefer higher-level concurrency primitives (ConcurrentHashMap, channels, async/await) over raw locks when available.",
    "Use AtomicInteger/AtomicReference for simple counters and references; use locks for compound operations on multiple variables.",
    "Enable ThreadSanitizer or Go's -race detector in CI. These tools find races that stress tests miss.",
    "For TOCTOU: never separate the check from the action. Use atomic APIs: open(O_CREAT|O_EXCL), CAS, INSERT ... ON CONFLICT.",
    "In databases: use optimistic locking (version column in WHERE clause) for low-contention scenarios; pessimistic locking (SELECT FOR UPDATE) for high-contention ones.",
    "Minimize critical section scope: hold locks for the shortest time possible to reduce contention, but never so short that the invariant is broken.",
    "Document your synchronization strategy. For each piece of shared mutable state, write down what protects it (which lock, which atomic, which thread owns it).",
  ],

  resources: [
    {
      label: "Java Concurrency in Practice by Brian Goetz",
      kind: "book" as const,
      note: "The definitive guide to writing correct concurrent Java programs. Covers visibility, atomicity, the Java Memory Model, and building thread-safe classes.",
    },
    {
      label: "The Go Memory Model",
      kind: "docs" as const,
      note: "Official specification of happens-before guarantees in Go, essential for understanding when goroutine writes are visible to other goroutines.",
    },
    {
      label: "ThreadSanitizer: A Dynamic Data Race Detector (Google Research)",
      kind: "paper" as const,
      note: "The foundational paper describing the vector-clock-based algorithm used by TSan to detect data races at runtime with low false-positive rates.",
    },
    {
      label: "Is Parallel Programming Hard, And, If So, What Can You Do About It? by Paul McKenney", url: "https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html",
      kind: "book" as const,
      note: "Free online book covering advanced synchronization, RCU, memory barriers, and lock-free programming from a Linux kernel perspective.",
    },
    {
      label: "CppCon: C++ Memory Model by Herb Sutter",
      kind: "video" as const,
      note: "Comprehensive talk on the C++ memory model, atomics, and memory orderings, explaining how they map to hardware.",
    },
    {
      label: "Python threading documentation",
      kind: "docs" as const,
      note: "Official docs covering threading.Lock, RLock, Condition, Semaphore, and the relationship between the GIL and thread safety.",
    },
  ],

  glossary: [
    {
      term: "Race Condition",
      definition:
        "A bug where system behavior depends on the non-deterministic relative timing of concurrent events, causing incorrect results under certain interleavings.",
    },
    {
      term: "Data Race",
      definition:
        "Concurrent access to the same memory location by multiple threads where at least one access is a write and no synchronization exists between them. Causes undefined behavior in C/C++.",
    },
    {
      term: "TOCTOU",
      definition:
        "Time-of-Check-to-Time-of-Use. A class of race condition where the state being relied upon changes between the moment it is checked and the moment it is used.",
    },
    {
      term: "Critical Section",
      definition:
        "A code region that accesses shared resources and must execute atomically with respect to other threads to maintain invariants.",
    },
    {
      term: "Mutual Exclusion (Mutex)",
      definition:
        "A synchronization mechanism ensuring that only one thread can execute a critical section at a time, typically implemented as a lock that threads acquire and release.",
    },
    {
      term: "Compare-And-Swap (CAS)",
      definition:
        "An atomic hardware instruction that compares a memory location to an expected value and, only if they match, swaps in a new value. The foundation of lock-free algorithms.",
    },
    {
      term: "Happens-Before",
      definition:
        "A partial ordering of events in a concurrent program, defined by the language memory model, that determines when writes by one thread are guaranteed to be visible to reads by another.",
    },
    {
      term: "Memory Barrier (Fence)",
      definition:
        "A CPU instruction that enforces ordering constraints on memory operations, preventing the processor from reordering reads and writes across the barrier.",
    },
    {
      term: "Lost Update",
      definition:
        "A race condition pattern where two threads read the same value, compute modifications independently, and write back their results, with one overwriting the other's change.",
    },
    {
      term: "ThreadSanitizer (TSan)",
      definition:
        "A compile-time instrumentation tool that detects data races at runtime by tracking memory accesses and synchronization events using vector clocks.",
    },
  ],
  exercises: [
    "Write a C++ program where two threads perform `counter++` on a shared `int` (not `std::atomic`) 100,000 times each. Compile with `-fsanitize=thread` and observe the **ThreadSanitizer** report. Fix the race using (a) `std::mutex`, (b) `std::atomic<int>`, and (c) `std::atomic` with `fetch_add`. Verify that TSan no longer reports any issues.",
    "Identify the **TOCTOU vulnerability** in this pseudocode: `if (file_exists(path)) { data = read_file(path); }`. Construct a concrete attack scenario where an attacker exploits the race window using a **symlink swap**. Then rewrite the code using `open()` with `O_NOFOLLOW` to eliminate the vulnerability.",
    "A banking application has a `withdraw(account, amount)` function that checks `if (balance >= amount)` and then does `balance -= amount`. Two threads call `withdraw(acc, 80)` concurrently on an account with `balance = 100`. Trace the **interleaving** that allows both withdrawals to succeed (overdraft). Fix the race using (a) a database `SELECT ... FOR UPDATE`, and (b) **optimistic concurrency control** with a version column.",
    "In Python, demonstrate that `counter += 1` is *not atomic* despite the GIL. Write a test with 10 threads each incrementing 100,000 times, showing the final count is less than 1,000,000. Then explain: at the *bytecode level* (`dis.dis`), which instructions does `+=` compile to, and between which instructions can the GIL release?",
    "Design a **thread-safe lazy singleton** in Java using three different approaches: (a) `enum`-based, (b) **initialization-on-demand holder** idiom, and (c) **double-checked locking** with `volatile`. For approach (c), explain exactly what goes wrong *without* the `volatile` keyword -- which Java Memory Model guarantee is violated?",
  ],
};
