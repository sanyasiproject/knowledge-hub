import type { TopicContent } from "../types";

export const locksAndAtomics: TopicContent = {
  quickSummary: [
    "Locks (mutexes, spinlocks, semaphores) enforce mutual exclusion by allowing only one (or a bounded number of) threads to access a critical section at a time, trading throughput for correctness.",
    "Atomic operations (CAS, fetch-add, load/store) provide lock-free synchronization by leveraging hardware-level indivisible read-modify-write instructions, avoiding the overhead of OS-managed blocking.",
    "Memory ordering constraints (relaxed, acquire, release, seq_cst) and memory barriers control how compilers and CPUs may reorder reads and writes, ensuring that inter-thread communication is visible in the intended order.",
    "Deadlock prevention strategies — lock ordering, try-lock with back-off, and lock-free algorithms — are essential for building robust concurrent systems that do not freeze under contention.",
  ],

  detailed: [
    "A mutex (mutual exclusion lock) is the most common synchronization primitive. When a thread acquires a mutex, every other thread that attempts to acquire it is blocked until the owner releases it. Recursive mutexes allow the same thread to lock multiple times without deadlocking on itself, maintaining an internal count. Reader-writer locks (RWLocks) generalize the concept: many readers may hold the lock simultaneously, but a writer requires exclusive access. This distinction is critical for read-heavy workloads where a plain mutex would serialize readers unnecessarily.",
    "Spinlocks differ from mutexes in their waiting strategy. Instead of yielding the CPU and entering a kernel wait queue, a spinlock busy-waits in a tight loop, repeatedly checking whether the lock has been released. This makes spinlocks extremely efficient when the critical section is tiny (a few nanoseconds) and contention is low, because they avoid the cost of a context switch. However, under high contention or long critical sections, spinlocks waste CPU cycles and can cause priority inversion on systems without priority inheritance.",
    "Semaphores and condition variables round out the blocking-primitive family. A counting semaphore maintains an integer counter: a wait (P) decrements it, blocking if the result would be negative, and a signal (V) increments it, potentially waking a blocked thread. Condition variables let threads sleep until a predicate becomes true, always used in conjunction with a mutex to avoid lost-wake and spurious-wakeup races. Together, these primitives enable patterns like producer-consumer queues, bounded buffers, and barrier synchronization.",
    "Atomic operations bypass locks entirely by using hardware instructions such as compare-and-swap (CAS), fetch-and-add, and atomic load/store. CAS is the cornerstone of lock-free programming: it atomically checks whether a memory location holds an expected value and, only if so, replaces it with a new value, returning success or failure. Lock-free data structures — stacks, queues, counters — are built on CAS loops that retry on contention rather than blocking.",
    "Memory ordering is the subtlest aspect of atomics. Modern CPUs execute instructions out of order and maintain store buffers that delay writes. Without explicit ordering constraints, one thread's writes may appear in a different order to another thread. The C++ memory model defines four key orderings: relaxed (no ordering guarantees beyond atomicity), acquire (prevents reads/writes after the acquire from being reordered before it), release (prevents reads/writes before the release from being reordered after it), and sequentially consistent (seq_cst), which provides a single total order visible to all threads. Choosing the weakest sufficient ordering is key to performance on weakly-ordered architectures like ARM and RISC-V.",
  ],

  deepDive: [
    "The ABA problem is a notorious pitfall in CAS-based algorithms. Thread T1 reads value A from a shared location and is preempted. Thread T2 changes the value from A to B and back to A. When T1 resumes, its CAS succeeds because the value is still A, yet the underlying state may have changed (e.g., a node was freed and reallocated). Solutions include tagged pointers (appending a monotonically increasing counter to the pointer), hazard pointers, and epoch-based reclamation. In Java, AtomicStampedReference solves this by pairing the reference with an integer stamp that changes on every update.",
    "Memory barriers (fences) are the low-level mechanism underlying acquire/release semantics. A store-fence ensures that all preceding stores are visible before any subsequent store. A load-fence ensures that all subsequent loads see values at least as recent as the fence. A full fence (mfence on x86, dmb on ARM) combines both. On x86, the strong memory model (Total Store Order) means most acquire/release patterns are free — only seq_cst stores require an mfence. On ARM and RISC-V, the weak memory model means nearly every atomic needs explicit barrier instructions, making ordering choice a real performance lever.",
    "Deadlock prevention follows four classical strategies mapped to Coffman's four conditions. Breaking mutual exclusion is rarely practical, but breaking hold-and-wait (acquire all locks atomically or release before requesting more), breaking no-preemption (use try_lock and back off), and breaking circular wait (impose a global lock ordering) are standard techniques. Modern systems also use lock-free and wait-free algorithms to sidestep deadlock entirely: a lock-free algorithm guarantees system-wide progress (at least one thread completes in finite steps), while a wait-free algorithm guarantees per-thread progress.",
    "Hardware transactional memory (HTM), available via Intel TSX (now deprecated on many SKUs) and IBM POWER, offers an alternative to locks. A transaction speculatively executes a critical section; if no conflict is detected, it commits atomically. On conflict, it aborts and falls back to a lock-based path. HTM can dramatically reduce contention overhead for low-conflict workloads, but its abort-and-retry model means it is not a universal replacement. Rust's ecosystem does not yet expose HTM, C++ offers vendor intrinsics, and Java's Project Loom focuses on virtual threads rather than HTM.",
  ],

  code: [
    {
      language: "cpp",
      caption: "Mutex and lock_guard in C++",
      source: `#include <mutex>
#include <thread>
#include <vector>
#include <iostream>

class BankAccount {
    mutable std::mutex mtx_;
    double balance_ = 0.0;
public:
    void deposit(double amount) {
        std::lock_guard<std::mutex> lock(mtx_);
        balance_ += amount;
    }

    double balance() const {
        std::lock_guard<std::mutex> lock(mtx_);
        return balance_;
    }

    // Transfer using std::scoped_lock to avoid deadlock
    static void transfer(BankAccount& from, BankAccount& to, double amount) {
        std::scoped_lock lock(from.mtx_, to.mtx_);
        from.balance_ -= amount;
        to.balance_ += amount;
    }
};

int main() {
    BankAccount a, b;
    a.deposit(1000);

    std::vector<std::thread> threads;
    for (int i = 0; i < 100; ++i) {
        threads.emplace_back([&]() {
            BankAccount::transfer(a, b, 1.0);
        });
    }
    for (auto& t : threads) t.join();

    std::cout << "A: " << a.balance()
              << " B: " << b.balance() << "\\n";
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "CAS loop and memory ordering in C++",
      source: `#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

// Lock-free stack using CAS
template <typename T>
class LockFreeStack {
    struct Node {
        T data;
        Node* next;
        Node(T val) : data(std::move(val)), next(nullptr) {}
    };
    std::atomic<Node*> head_{nullptr};

public:
    void push(T val) {
        Node* node = new Node(std::move(val));
        node->next = head_.load(std::memory_order_relaxed);
        // CAS loop: retry if another thread pushed first
        while (!head_.compare_exchange_weak(
            node->next, node,
            std::memory_order_release,
            std::memory_order_relaxed)) {
            // node->next is updated by compare_exchange_weak on failure
        }
    }

    bool pop(T& result) {
        Node* old_head = head_.load(std::memory_order_acquire);
        while (old_head &&
               !head_.compare_exchange_weak(
                   old_head, old_head->next,
                   std::memory_order_acquire,
                   std::memory_order_relaxed)) {
            // retry
        }
        if (!old_head) return false;
        result = std::move(old_head->data);
        delete old_head;  // simplified; real code needs safe reclamation
        return result, true;
    }
};

int main() {
    LockFreeStack<int> stack;
    std::vector<std::thread> producers, consumers;

    for (int i = 0; i < 4; ++i) {
        producers.emplace_back([&, i]() {
            for (int j = 0; j < 1000; ++j)
                stack.push(i * 1000 + j);
        });
    }
    for (auto& t : producers) t.join();

    int count = 0;
    int val;
    while (stack.pop(val)) ++count;
    std::cout << "Popped " << count << " items\\n";
}`,
    },
    {
      language: "rust",
      caption: "Mutex and RwLock in Rust",
      source: `use std::sync::{Arc, Mutex, RwLock};
use std::thread;

fn mutex_example() {
    let counter = Arc::new(Mutex::new(0u64));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("Counter: {}", *counter.lock().unwrap());
}

fn rwlock_example() {
    let config = Arc::new(RwLock::new(String::from("v1.0")));
    let mut handles = vec![];

    // Spawn many readers
    for i in 0..5 {
        let config = Arc::clone(&config);
        handles.push(thread::spawn(move || {
            let val = config.read().unwrap();
            println!("Reader {i} sees: {val}");
        }));
    }

    // One writer
    {
        let config = Arc::clone(&config);
        handles.push(thread::spawn(move || {
            let mut val = config.write().unwrap();
            *val = String::from("v2.0");
            println!("Writer updated config");
        }));
    }

    for h in handles { h.join().unwrap(); }
}

fn main() {
    mutex_example();
    rwlock_example();
}`,
    },
    {
      language: "rust",
      caption: "Atomics and Ordering in Rust",
      source: `use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;

// Spinlock built from AtomicBool
struct SpinLock {
    locked: AtomicBool,
}

impl SpinLock {
    fn new() -> Self {
        SpinLock { locked: AtomicBool::new(false) }
    }

    fn lock(&self) {
        // Test-and-set with acquire ordering
        while self.locked
            .compare_exchange_weak(
                false, true,
                Ordering::Acquire,
                Ordering::Relaxed,
            )
            .is_err()
        {
            // Spin with a hint to reduce power consumption
            std::hint::spin_loop();
        }
    }

    fn unlock(&self) {
        self.locked.store(false, Ordering::Release);
    }
}

fn main() {
    let lock = Arc::new(SpinLock::new());
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..8 {
        let lock = Arc::clone(&lock);
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..10_000 {
                lock.lock();
                // Critical section: non-atomic increment is safe
                // because the spinlock guarantees exclusion.
                counter.fetch_add(1, Ordering::Relaxed);
                lock.unlock();
            }
        }));
    }

    for h in handles { h.join().unwrap(); }
    println!("Total: {}", counter.load(Ordering::SeqCst));
}`,
    },
    {
      language: "java",
      caption: "ReentrantLock, Condition, and AtomicInteger in Java",
      source: `import java.util.concurrent.locks.*;
import java.util.concurrent.atomic.AtomicInteger;

public class BoundedBuffer<T> {
    private final Object[] items;
    private int putIdx, takeIdx, count;

    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull  = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public BoundedBuffer(int capacity) {
        items = new Object[capacity];
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) notFull.await();
            items[putIdx] = item;
            putIdx = (putIdx + 1) % items.length;
            count++;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) notEmpty.await();
            T item = (T) items[takeIdx];
            takeIdx = (takeIdx + 1) % items.length;
            count--;
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }

    // Atomic counter example
    public static void atomicCounterDemo() throws InterruptedException {
        AtomicInteger counter = new AtomicInteger(0);
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.incrementAndGet();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("Atomic counter: " + counter.get());
    }

    public static void main(String[] args) throws Exception {
        atomicCounterDemo();
    }
}`,
    },
    {
      language: "java",
      caption: "CAS loop and AtomicStampedReference to solve ABA",
      source: `import java.util.concurrent.atomic.AtomicStampedReference;
import java.util.concurrent.atomic.AtomicReference;

public class CASExamples {

    // Simple CAS loop to implement lock-free max
    static final AtomicReference<Integer> sharedMax =
        new AtomicReference<>(Integer.MIN_VALUE);

    static void updateMax(int candidate) {
        while (true) {
            Integer current = sharedMax.get();
            if (candidate <= current) return;
            if (sharedMax.compareAndSet(current, candidate)) return;
            // CAS failed — another thread updated; retry
        }
    }

    // ABA-safe update using AtomicStampedReference
    static void abaSafeDemo() {
        AtomicStampedReference<String> ref =
            new AtomicStampedReference<>("A", 0);

        int[] stampHolder = new int[1];
        String val = ref.get(stampHolder);
        int stamp = stampHolder[0];

        // Simulate ABA: another thread changes A -> B -> A
        ref.compareAndSet("A", "B", 0, 1);
        ref.compareAndSet("B", "A", 1, 2);

        // Our CAS now fails because stamp 0 != current stamp 2
        boolean success = ref.compareAndSet(val, "C", stamp, stamp + 1);
        System.out.println("CAS succeeded (should be false): " + success);

        // Correct: re-read stamp
        val = ref.get(stampHolder);
        stamp = stampHolder[0];
        success = ref.compareAndSet(val, "C", stamp, stamp + 1);
        System.out.println("CAS with fresh stamp (should be true): " + success);
    }

    public static void main(String[] args) {
        // CAS max demo
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    updateMax(id * 1000 + j);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        System.out.println("Max value: " + sharedMax.get());

        abaSafeDemo();
    }
}`,
    },
  ],

  diagrams: [
    {
      title: "Thread State Transitions During Lock Acquisition",
      kind: "state" as const,
      caption: "How a thread moves between Running, Blocked, and Ready states when acquiring and releasing a mutex.",
      mermaid: `stateDiagram-v2
    [*] --> Ready
    Ready --> Running: Scheduler selects thread
    Running --> Ready: Preempted by scheduler
    Running --> Blocked: mutex.lock() - lock held by another thread
    Blocked --> Ready: mutex.unlock() by owner - kernel wakes thread
    Running --> Running: mutex.lock() succeeds - lock was free
    Running --> [*]: Thread exits`,
    },
    {
      title: "CAS Retry Loop Flow",
      kind: "flow" as const,
      caption: "Flowchart of a compare-and-swap loop used for lock-free atomic operations.",
      mermaid: `flowchart TD
    A["Load atomic variable into expected"] --> B["Compute desired value"]
    B --> C["CAS: if memory equals expected write desired"]
    C --> D{"Success?"}
    D -->|Yes| E["Update applied atomically - continue"]
    D -->|No| F["Contention detected - another thread modified value"]
    F --> G["Read actual current value as new expected"]
    G --> B`,
    },
    {
      title: "Acquire-Release Memory Ordering",
      kind: "sequence" as const,
      caption: "How a release store on Thread A and an acquire load on Thread B establish a happens-before edge that makes writes visible.",
      mermaid: `sequenceDiagram
    participant A as Thread A - Producer
    participant Mem as Shared Memory
    participant B as Thread B - Consumer

    A->>Mem: Write data = 42
    A->>Mem: Write flag = 1 with release ordering
    Note over A,Mem: All prior writes flushed before flag store
    B->>Mem: Read flag with acquire ordering
    Note over B,Mem: Spin until flag equals 1
    Mem-->>B: flag = 1
    B->>Mem: Read data
    Mem-->>B: data = 42
    Note over B: Guaranteed to see data = 42 due to acquire-release pair`,
    },
    {
      title: "Synchronisation Primitive Comparison",
      kind: "mindmap" as const,
      caption: "Key properties of mutex, spinlock, semaphore, and RWLock across blocking behaviour, overhead, and use cases.",
      mermaid: `mindmap
  root((Sync Primitives))
    Mutex
      Sleeps via OS wait queue
      Context switch overhead
      General mutual exclusion
      Futex-based on Linux
    Spinlock
      Busy-waits in CPU loop
      No context switch
      Very short critical sections
      Wastes CPU under contention
    Semaphore
      Counter-based
      Limits N concurrent accessors
      Producer-consumer coordination
      Not tied to one owner
    RWLock
      Multiple concurrent readers
      Exclusive writers
      Read-heavy workloads
      Writer starvation risk`,
    },
  ],

  animations: [
    {
      title: "Mutex Lock and Unlock Lifecycle",
      steps: [
        {
          label: "Thread A requests lock",
          detail:
            "Thread A calls mutex.lock(). The mutex is currently free, so the kernel grants ownership immediately.",
        },
        {
          label: "Thread A enters critical section",
          detail:
            "Thread A reads and modifies the shared data structure. The mutex prevents any other thread from entering.",
        },
        {
          label: "Thread B requests lock",
          detail:
            "Thread B calls mutex.lock(). The mutex is held by A, so B is moved to the kernel wait queue and its execution is suspended.",
        },
        {
          label: "Thread A releases lock",
          detail:
            "Thread A calls mutex.unlock(). The kernel checks the wait queue, finds B, and moves B to the ready queue.",
        },
        {
          label: "Thread B acquires lock",
          detail:
            "The scheduler runs B, which now owns the mutex and enters the critical section to perform its work.",
        },
      ],
    },
    {
      title: "Compare-and-Swap (CAS) Retry Loop",
      steps: [
        {
          label: "Load current value",
          detail:
            "Thread reads the atomic variable into a local 'expected' variable. On x86 this is a plain MOV with acquire semantics.",
        },
        {
          label: "Compute desired value",
          detail:
            "Thread computes the new value based on the expected value (e.g., expected + 1 for an atomic increment).",
        },
        {
          label: "Execute CAS instruction",
          detail:
            "Hardware compares the memory location to 'expected'. If they match, it atomically writes 'desired' and returns success.",
        },
        {
          label: "CAS fails — contention detected",
          detail:
            "Another thread modified the value between our load and CAS. The instruction returns the actual current value as the new 'expected'.",
        },
        {
          label: "Recompute and retry",
          detail:
            "Thread recomputes 'desired' from the updated 'expected' value and jumps back to the CAS instruction.",
        },
        {
          label: "CAS succeeds",
          detail:
            "No contention this time. The value is atomically updated and the thread continues past the loop.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Property",
      "Mutex",
      "Spinlock",
      "Semaphore",
      "RWLock",
    ],
    rows: [
      [
        "Blocking behavior",
        "Sleeps (OS wait queue)",
        "Busy-waits (CPU loop)",
        "Sleeps when count is 0",
        "Sleeps writers; readers concurrent",
      ],
      [
        "Best use case",
        "General-purpose mutual exclusion",
        "Very short critical sections, no preemption",
        "Limiting concurrent access to N resources",
        "Read-heavy workloads with rare writes",
      ],
      [
        "Overhead",
        "Context switch (~1-10 µs)",
        "None while uncontested; wastes CPU under contention",
        "Similar to mutex",
        "Slightly higher than mutex (reader count tracking)",
      ],
      [
        "Reentrancy",
        "Recursive mutex variant available",
        "Typically not reentrant",
        "Inherently reentrant (counter-based)",
        "Not reentrant for writers",
      ],
      [
        "Fairness",
        "Usually FIFO (depends on OS)",
        "Unfair by default (no queue)",
        "Usually FIFO",
        "Writer starvation possible without policy",
      ],
      [
        "Deadlock risk",
        "Yes (lock ordering needed)",
        "Yes, plus risk of livelock",
        "Yes (can deadlock if count mismanaged)",
        "Yes (upgrade from read to write can deadlock)",
      ],
      [
        "Kernel involvement",
        "Yes (futex or similar)",
        "No (user-space only)",
        "Yes",
        "Yes",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What is the difference between a mutex and a spinlock, and when would you choose one over the other?",
      a: "A mutex puts the waiting thread to sleep via the OS scheduler, incurring a context-switch cost (~1-10 µs). A spinlock busy-waits in a loop, wasting CPU but avoiding the context switch. Choose a spinlock when the critical section is extremely short (tens of nanoseconds) and you are on a multicore system where spinning on one core while another core releases is faster than sleeping. Choose a mutex for longer critical sections or when the system is CPU-bound and you cannot afford to waste cycles spinning.",
      followUps: [
        "How does a hybrid mutex like Linux futex combine both approaches?",
        "What happens if you use a spinlock in a single-core system?",
      ],
    },
    {
      q: "Explain compare-and-swap (CAS) and how it enables lock-free programming.",
      a: "CAS is a hardware-supported atomic instruction that takes three arguments: a memory address, an expected value, and a desired value. It atomically checks if the memory holds the expected value; if so, it writes the desired value and returns success; otherwise it returns failure and the current value. Lock-free algorithms use CAS in retry loops: read the current state, compute the new state, and CAS to commit. If CAS fails (another thread intervened), re-read and retry. This guarantees system-wide progress without any thread holding a lock.",
    },
    {
      q: "What is the ABA problem and how do you solve it?",
      a: "The ABA problem occurs when a CAS-based algorithm reads value A, gets preempted, another thread changes A to B and back to A, and then the original thread's CAS succeeds despite the intermediate state change. This is dangerous when the value is a pointer to memory that was freed and reallocated. Solutions include tagged/stamped pointers (AtomicStampedReference in Java), hazard pointers, and epoch-based reclamation (crossbeam in Rust).",
    },
    {
      q: "What are the four Coffman conditions for deadlock, and how do you prevent deadlock in practice?",
      a: "The four conditions are: (1) mutual exclusion — resources cannot be shared, (2) hold and wait — a thread holds one resource while waiting for another, (3) no preemption — resources cannot be forcibly taken, (4) circular wait — a cycle of threads each waiting for a resource held by the next. Practical prevention strategies: impose a global lock ordering to break circular wait, use try_lock with timeout and back-off to break hold-and-wait, or use lock-free algorithms to eliminate locks entirely.",
      followUps: [
        "How does std::scoped_lock in C++ prevent deadlock?",
        "What is the difference between deadlock prevention and deadlock detection?",
      ],
    },
    {
      q: "Explain memory ordering: what is the difference between relaxed, acquire, release, and seq_cst?",
      a: "Relaxed: guarantees atomicity only; no ordering constraints on surrounding operations. Acquire: ensures that no read or write after the acquire can be reordered before it (load fence). Release: ensures that no read or write before the release can be reordered after it (store fence). Sequentially consistent (seq_cst): provides a single total order across all threads, as if all atomic operations were interleaved in one global sequence. seq_cst is the strongest (and most expensive, especially on ARM); relaxed is the weakest. Acquire-release pairs are the standard pattern for producer-consumer communication.",
    },
    {
      q: "What is a condition variable and why must it be used with a mutex?",
      a: "A condition variable lets a thread wait until a predicate becomes true, signaled by another thread. It must be paired with a mutex to prevent a race condition: without the mutex, the signaling thread could signal after the waiting thread checks the predicate but before it actually waits, causing a lost wake-up. The standard pattern is: lock the mutex, check the predicate in a while loop (to handle spurious wakeups), call wait (which atomically releases the mutex and suspends), and re-acquire the mutex on wake.",
      followUps: [
        "What are spurious wakeups and why do they happen?",
      ],
    },
    {
      q: "How does a reader-writer lock work, and what is writer starvation?",
      a: "A reader-writer lock allows multiple readers to hold the lock concurrently but requires exclusive access for writers. When a writer requests the lock, it must wait for all current readers to release. Writer starvation occurs when a continuous stream of readers prevents the writer from ever acquiring the lock. Solutions include writer-preference policies (block new readers when a writer is waiting) or fair locks that alternate between readers and writers.",
    },
    {
      q: "What is the difference between lock-free and wait-free algorithms?",
      a: "A lock-free algorithm guarantees that at least one thread makes progress in a finite number of steps, even if other threads are delayed or preempted. A wait-free algorithm is stronger: every thread completes its operation in a bounded number of steps regardless of other threads. Wait-free is harder to achieve and often has higher constant overhead, but provides better latency guarantees. Most practical concurrent data structures are lock-free rather than wait-free.",
    },
  ],

  followUps: [
    "When is a spinlock better than a mutex, and when is it much worse?",
    "Why does a read-write lock sometimes perform worse than a plain mutex?",
    "What is priority inversion and how does priority inheritance fix it?",
    "Why must you never hold a lock across a network call?",
  ],
  mcqs: [
    {
      q: "Which memory ordering provides the weakest guarantees in the C++ memory model?",
      options: [
        "memory_order_acquire",
        "memory_order_relaxed",
        "memory_order_seq_cst",
        "memory_order_release",
      ],
      answerIndex: 1,
      explanation:
        "memory_order_relaxed guarantees only atomicity — no ordering constraints on surrounding operations. It is the weakest ordering.",
    },
    {
      q: "What problem does AtomicStampedReference in Java solve?",
      options: [
        "Priority inversion",
        "The ABA problem",
        "Deadlock detection",
        "Cache line false sharing",
      ],
      answerIndex: 1,
      explanation:
        "AtomicStampedReference pairs a reference with an integer stamp that changes on every update, so CAS detects intermediate changes even if the value returns to its original state.",
    },
    {
      q: "On an x86 processor, which atomic operation typically requires an explicit memory fence?",
      options: [
        "Atomic load with acquire semantics",
        "Atomic store with release semantics",
        "Atomic store with seq_cst semantics",
        "Atomic load with relaxed semantics",
      ],
      answerIndex: 2,
      explanation:
        "x86 has a strong memory model (TSO) where loads have acquire and stores have release semantics naturally. Only seq_cst stores need an explicit MFENCE instruction.",
    },
    {
      q: "Which of the following is NOT one of the four Coffman conditions for deadlock?",
      options: [
        "Mutual exclusion",
        "Starvation",
        "No preemption",
        "Circular wait",
      ],
      answerIndex: 1,
      explanation:
        "The four Coffman conditions are mutual exclusion, hold and wait, no preemption, and circular wait. Starvation is a different liveness problem, not a deadlock condition.",
    },
    {
      q: "In a CAS (compare-and-swap) loop, what happens when the CAS operation fails?",
      options: [
        "The thread is blocked until the lock is released",
        "An exception is thrown",
        "The expected value is updated to the current value and the loop retries",
        "The thread yields its time slice to the OS",
      ],
      answerIndex: 2,
      explanation:
        "On CAS failure, the instruction returns the actual current value, which becomes the new expected value. The thread recomputes its desired value and retries without blocking.",
    },
    {
      q: "Why must a condition variable always be used with a mutex?",
      options: [
        "The OS requires it for scheduling purposes",
        "To prevent lost wake-ups caused by race conditions between checking the predicate and waiting",
        "Condition variables internally use the mutex for memory allocation",
        "It is a language requirement with no technical justification",
      ],
      answerIndex: 1,
      explanation:
        "Without a mutex, a signal could be sent after the predicate is checked but before the thread waits, causing the thread to miss the signal and sleep indefinitely (lost wake-up).",
    },
  ],

  flashcards: [
    {
      front: "What does CAS stand for and what does it do?",
      back: "Compare-And-Swap. It atomically checks if a memory location holds an expected value and, if so, replaces it with a new value. Returns success/failure. It is the foundation of lock-free programming.",
    },
    {
      front: "What is the difference between acquire and release memory ordering?",
      back: "Acquire prevents subsequent reads/writes from being reordered before the atomic load. Release prevents preceding reads/writes from being reordered after the atomic store. Together they establish a happens-before relationship between a producer (release) and consumer (acquire).",
    },
    {
      front: "What is a spurious wakeup?",
      back: "A spurious wakeup is when a thread waiting on a condition variable is awakened without a corresponding signal or broadcast. This is why condition variable waits must always be in a while loop that rechecks the predicate.",
    },
    {
      front: "What is the ABA problem?",
      back: "In CAS-based algorithms, thread T1 reads A, another thread changes A->B->A, and T1's CAS succeeds despite the intermediate change. Solved with stamped/tagged pointers or safe memory reclamation schemes.",
    },
    {
      front: "Name the four Coffman conditions for deadlock.",
      back: "1) Mutual exclusion 2) Hold and wait 3) No preemption 4) Circular wait. All four must hold simultaneously for deadlock to occur. Breaking any one prevents deadlock.",
    },
    {
      front: "What is a recursive (reentrant) mutex?",
      back: "A mutex that allows the same thread to lock it multiple times without deadlocking. It maintains an internal count and only truly releases when the count drops to zero. Useful for recursive functions that need synchronization.",
    },
    {
      front: "What is false sharing and how does it affect atomics?",
      back: "False sharing occurs when two unrelated atomic variables reside on the same cache line. When one core modifies its variable, the entire cache line is invalidated on other cores, causing unnecessary cache coherence traffic. Solved by padding variables to separate cache lines (alignas(64) in C++).",
    },
    {
      front: "What is the difference between lock-free and wait-free?",
      back: "Lock-free: system-wide progress guaranteed (at least one thread completes in finite steps). Wait-free: per-thread progress guaranteed (every thread completes in bounded steps). Wait-free is strictly stronger but harder to implement.",
    },
    {
      front: "What is a memory barrier (fence)?",
      back: "A CPU instruction that enforces ordering constraints on memory operations. A load fence prevents subsequent loads from executing before the fence. A store fence prevents preceding stores from being delayed past the fence. A full fence combines both.",
    },
    {
      front: "How does std::scoped_lock prevent deadlock in C++?",
      back: "std::scoped_lock uses a deadlock-avoidance algorithm (internally similar to std::lock) to acquire multiple mutexes simultaneously without risking circular wait, regardless of the order in which they are passed.",
    },
  ],

  revisionNotes: [
    "Mutexes block the thread via the OS (context switch cost ~1-10 µs); spinlocks busy-wait (zero context switch cost but waste CPU). Use spinlocks only for sub-microsecond critical sections on multicore systems.",
    "Always use std::scoped_lock (C++) or lock ordering to acquire multiple mutexes and prevent deadlock. Never hold one lock while requesting another without a consistent global order.",
    "CAS is the atomic primitive underlying all lock-free data structures. A CAS loop reads, computes, and attempts to commit; on failure it retries with the updated value. No blocking, guaranteed system-wide progress.",
    "Memory ordering from weakest to strongest: relaxed < acquire/release < seq_cst. On x86 (TSO), acquire and release are essentially free. On ARM/RISC-V, each ordering level adds explicit barrier instructions.",
    "Condition variables must always be used with a mutex and a while-loop predicate check to handle both lost wake-ups and spurious wake-ups correctly.",
    "The ABA problem affects CAS on pointers. Solve with stamped references (Java AtomicStampedReference), tagged pointers (C++ with version counter), or epoch-based reclamation (Rust crossbeam).",
    "Reader-writer locks allow concurrent reads but exclusive writes. Watch for writer starvation in read-heavy workloads; use writer-preference or fair policies when needed.",
    "False sharing degrades atomic performance when unrelated variables share a cache line. Align atomics to cache-line boundaries (typically 64 bytes) using alignas or #[repr(align(64))].",
  ],

  cheatSheet: [
    "std::mutex + std::lock_guard — basic RAII mutex in C++. Use std::scoped_lock for multiple mutexes.",
    "std::atomic<T>::compare_exchange_weak(expected, desired, success_order, fail_order) — CAS in C++. Use weak in loops, strong for single attempts.",
    "Rust: Arc<Mutex<T>> for shared mutable state across threads. .lock().unwrap() returns a MutexGuard that auto-unlocks on drop.",
    "Rust: AtomicUsize::fetch_add(1, Ordering::Relaxed) — cheapest atomic increment when no ordering is needed relative to other data.",
    "Java: ReentrantLock + Condition for fine-grained waiting. Always lock/unlock in try/finally. Use AtomicInteger.compareAndSet() for lock-free patterns.",
    "Memory ordering rule of thumb: use Relaxed for counters/statistics, Acquire/Release for producer-consumer handoffs, SeqCst only when you need a total order visible to all threads.",
    "Deadlock prevention checklist: (1) define a global lock order, (2) use try_lock with timeout, (3) prefer lock-free structures, (4) use scoped_lock for multi-lock acquisition.",
    "Cache-line padding: alignas(64) in C++, #[repr(align(64))] in Rust, @Contended in Java (JDK internal) to prevent false sharing on hot atomics.",
  ],

  resources: [
    {
      label: "C++ Concurrency in Action (2nd Edition) by Anthony Williams",
      kind: "book" as const,
      note: "The definitive guide to C++ atomics, memory model, lock-free programming, and concurrent data structures.",
    },
    {
      label: "The Rustonomicon — Atomics and Unsafe Concurrency",
      kind: "docs" as const,
      note: "Official Rust documentation on unsafe concurrency, atomic ordering, and building synchronization primitives from scratch.",
    },
    {
      label: "Java Concurrency in Practice by Brian Goetz",
      kind: "book" as const,
      note: "Classic reference for Java synchronization, concurrent collections, atomic variables, and the Java Memory Model.",
    },
    {
      label: "Preshing on Programming — Memory Ordering blog series",
      kind: "article" as const,
      note: "Accessible deep-dive into memory ordering, barriers, acquire/release semantics, and how they map to real hardware (x86, ARM).",
    },
    {
      label: "CppReference — std::memory_order documentation",
      kind: "docs" as const,
      note: "Formal specification of C++ memory orderings with examples of valid and invalid reorderings for each ordering level.",
    },
    {
      label: "Is Parallel Programming Hard, And, If So, What Can You Do About It? by Paul McKenney", url: "https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html",
      kind: "book" as const,
      note: "Free online book from a Linux kernel developer covering RCU, memory barriers, lock-free techniques, and formal memory models.",
    },
  ],

  glossary: [
    {
      term: "Mutex",
      definition:
        "Mutual exclusion lock. A synchronization primitive that allows only one thread to access a critical section at a time. Blocking — waiting threads are suspended by the OS.",
    },
    {
      term: "Spinlock",
      definition:
        "A lock where the waiting thread busy-waits in a loop checking a flag, avoiding OS involvement. Efficient for very short critical sections on multicore systems.",
    },
    {
      term: "Semaphore",
      definition:
        "A counter-based synchronization primitive. A counting semaphore allows up to N concurrent accesses; a binary semaphore (count=1) behaves like a mutex but without ownership semantics.",
    },
    {
      term: "CAS (Compare-and-Swap)",
      definition:
        "A hardware atomic instruction that compares a memory location to an expected value and, if equal, writes a new value atomically. The foundation of lock-free programming.",
    },
    {
      term: "Memory Ordering",
      definition:
        "Rules governing how atomic operations may be reordered by the compiler and CPU. Ranges from relaxed (no ordering) to sequentially consistent (global total order).",
    },
    {
      term: "Memory Barrier (Fence)",
      definition:
        "A CPU instruction that prevents reordering of memory operations across the barrier. Types include load fences, store fences, and full fences.",
    },
    {
      term: "Happens-Before",
      definition:
        "A formal ordering relationship in a memory model. If operation A happens-before operation B, then B is guaranteed to see the effects of A. Established by acquire/release pairs, thread creation/join, and mutex lock/unlock.",
    },
    {
      term: "ABA Problem",
      definition:
        "A CAS pitfall where a value changes from A to B and back to A, causing a CAS to succeed even though the underlying state changed. Solved with stamped pointers or safe memory reclamation.",
    },
    {
      term: "Lock-Free",
      definition:
        "A progress guarantee: at least one thread in the system completes its operation in a finite number of steps, even if other threads are suspended. Implies no deadlock.",
    },
    {
      term: "False Sharing",
      definition:
        "A performance degradation that occurs when threads on different cores modify independent variables that share the same cache line, triggering unnecessary cache coherence invalidations.",
    },
  ],
  exercises: [
    "Write a C++ program with two `std::atomic<int>` counters that suffer from **false sharing**. Benchmark it, then fix it using `alignas(64)` padding. Measure the performance difference and explain *why* false sharing causes the slowdown in terms of the **MESI cache coherence protocol**.",
    "Implement a **bounded producer-consumer queue** in C++ using `std::mutex` and `std::condition_variable`. Then identify: why must the `wait()` call use a **while loop** instead of an `if`? What is a *spurious wakeup*, and what would go wrong without the loop?",
    "You have a function `transfer(Account& from, Account& to, double amount)` that must lock both accounts. Two threads call `transfer(a, b, 50)` and `transfer(b, a, 30)` concurrently. Show the **deadlock** interleaving, then fix it using (a) `std::scoped_lock`, and (b) a manual **global lock ordering** strategy based on account ID.",
    "Implement a **spinlock** in C++ using `std::atomic<bool>` with `compare_exchange_weak`. Use `memory_order_acquire` on lock and `memory_order_release` on unlock. Explain: what would go wrong if you used `memory_order_relaxed` for both? Write a test that demonstrates the failure on a weakly-ordered architecture.",
    "A shared counter is incremented by 8 threads, each performing 1,000,000 increments. Compare three approaches: (a) `std::mutex` with `lock_guard`, (b) `std::atomic<int>` with `fetch_add`, and (c) a CAS loop with `compare_exchange_weak`. Predict which will be fastest and why, then verify by benchmarking.",
  ],
};
