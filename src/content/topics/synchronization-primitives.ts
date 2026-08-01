import type { TopicContent } from "../types";

export const synchronizationPrimitives: TopicContent = {
  quickSummary: [
    "Synchronization primitives are low-level mechanisms -- mutexes, semaphores, spinlocks, read-write locks, and condition variables -- that coordinate access to shared resources among concurrent threads or processes, preventing race conditions and ensuring data consistency.",
    "A mutex (mutual exclusion lock) provides exclusive ownership: exactly one thread can hold it at a time, and only the owner may release it. A semaphore generalizes this to a counting mechanism that allows up to N concurrent accessors, making it suitable for resource pools and producer-consumer patterns.",
    "Spinlocks busy-wait in a tight loop (spinning) rather than yielding the CPU, which avoids context-switch overhead but wastes cycles; they are optimal only for very short critical sections on multiprocessor systems, and are heavily used inside OS kernels.",
    "Choosing the right primitive depends on contention level, critical section duration, number of readers vs. writers, and whether the code runs in user space or kernel space. Misuse leads to deadlocks, priority inversion, convoying, and performance collapse.",
  ],
  detailed: [
    "A race condition occurs when the correctness of a program depends on the relative timing or interleaving of concurrent operations. For example, two threads incrementing a shared counter without synchronization may both read the same value, increment it, and write back, losing one update (the classic lost-update problem). A critical section is a code region that accesses shared mutable state and must execute atomically with respect to other critical sections on the same data. Synchronization primitives enforce mutual exclusion over critical sections, ensuring that only one thread (or a controlled number) executes the protected code at any time.",
    "A mutex is the simplest and most common synchronization primitive. When a thread calls lock(), it either acquires the mutex and proceeds or blocks until the mutex becomes available. The thread that holds the mutex is its owner, and only the owner may call unlock(). This ownership semantics distinguishes mutexes from semaphores and enables features like priority inheritance (temporarily boosting the holder's priority to prevent priority inversion) and recursive locking (allowing the owner to re-acquire the mutex without deadlocking, provided it releases it the same number of times). On modern OSes, mutexes typically use a fast-path atomic compare-and-swap in user space and fall back to a kernel futex call only on contention.",
    "A semaphore, introduced by Dijkstra in 1965, maintains an internal counter initialized to some non-negative value N. The wait() (P/down/acquire) operation decrements the counter; if the result is negative, the calling thread blocks. The signal() (V/up/release) operation increments the counter and wakes one blocked thread if any. A binary semaphore (N=1) can enforce mutual exclusion like a mutex, but lacks ownership semantics -- any thread can signal, not just the one that waited. Counting semaphores (N>1) are used to limit concurrent access to a pool of N identical resources (e.g., database connection pools, bounded buffers). The producer-consumer pattern uses two semaphores (empty slots and full slots) plus a mutex to synchronize buffer access.",
    "A spinlock is a lock where the waiting thread repeatedly tests the lock variable in a tight loop (spinning or busy-waiting) rather than blocking and yielding the CPU. Spinlocks avoid the overhead of context switches and kernel transitions, making them ideal for very short critical sections (a few instructions) on multiprocessor systems. However, on uniprocessor systems spinlocks are wasteful because the spinning thread prevents the lock holder from running. Adaptive spinlocks combine spinning with blocking: they spin for a short time and then fall back to a blocking wait. The Linux kernel uses spinlocks extensively to protect data structures accessed in interrupt handlers, where sleeping is forbidden.",
    "Read-write locks (RWLocks or shared-exclusive locks) optimize for workloads with many readers and few writers. Multiple threads can hold the lock in shared (read) mode simultaneously, but a thread requesting exclusive (write) mode must wait until all readers release. Write-preferring policies prevent writer starvation by blocking new readers once a writer is waiting. RWLocks improve throughput when read operations vastly outnumber writes but add overhead compared to plain mutexes, so they are only beneficial when the critical section is long enough to amortize the extra bookkeeping. Condition variables complement mutexes by allowing a thread to atomically release a mutex and sleep until a condition is signaled by another thread, avoiding busy-waiting on application-level predicates.",
  ],
  deepDive: [
    "A futex (fast userspace mutex) is a Linux kernel mechanism that underpins most user-space synchronization primitives (pthreads mutexes, semaphores, condition variables, and Java's ReentrantLock). In the uncontended case, a futex operation is a single atomic compare-and-swap in user space with no system call -- the thread acquires or releases the lock entirely without entering the kernel. Only when contention occurs does the thread invoke the futex(2) system call to block in the kernel's wait queue keyed by the futex's memory address. This design makes uncontended locking extremely fast (typically 10-25 ns) while still providing proper blocking and wakeup semantics under contention. The futex interface supports both shared (process-shared, backed by shared memory) and private (single-process) semantics, with private futexes being faster because they avoid global hash table lookups.",
    "Read-write locks come in several flavors with different fairness guarantees. A reader-preferring RWLock grants read access as long as no writer holds the lock, which can starve writers indefinitely under sustained read load. A writer-preferring RWLock blocks new readers as soon as a writer is waiting, preventing writer starvation but potentially reducing read concurrency. A fair RWLock (like Java's ReentrantReadWriteLock with fairness=true) processes requests in FIFO order. SeqLocks, used in the Linux kernel, take a different approach: writers increment a sequence counter before and after updating, and readers optimistically read data without locking, then verify the counter hasn't changed. If it has, they retry. SeqLocks never block writers but may cause readers to retry, making them ideal for frequently read, rarely written data like system clocks.",
    "Condition variables provide a mechanism for threads to wait for arbitrary application-level predicates, not just lock availability. A condition variable is always associated with a mutex. The canonical usage pattern is: lock the mutex, check the predicate in a while loop (not an if statement, because of spurious wakeups), call wait() if the predicate is false (which atomically releases the mutex and blocks the thread), and re-check on wakeup. Another thread locks the mutex, modifies the shared state to make the predicate true, calls signal() (wake one waiter) or broadcast() (wake all waiters), and unlocks the mutex. The while-loop check guards against both spurious wakeups (allowed by POSIX for implementation efficiency) and the thundering herd problem when broadcast() wakes multiple waiters but only one can proceed.",
    "Lock-free programming eliminates locks entirely, using atomic hardware instructions to ensure progress guarantees. The key primitives are compare-and-swap (CAS), which atomically compares a memory location to an expected value and swaps it if they match (returning success/failure), and fetch-and-add, which atomically increments a value and returns the old value. Lock-free algorithms guarantee that at least one thread makes progress in a finite number of steps, even if other threads are suspended. Wait-free algorithms guarantee that every thread makes progress. Classic lock-free data structures include Michael-Scott queues, Harris's linked lists, and Treiber stacks. These algorithms are notoriously difficult to implement correctly due to the ABA problem (a location changes from A to B and back to A, making CAS falsely succeed), which is typically solved with tagged pointers or hazard pointers.",
    "Memory barriers (fences) are hardware instructions that enforce ordering constraints on memory operations. Modern CPUs execute instructions out of order and use store buffers, which means that without barriers, other CPUs may observe memory writes in a different order than the program specifies. A full memory barrier ensures that all loads and stores before the barrier are visible to other CPUs before any loads and stores after the barrier. Acquire semantics (used when taking a lock) ensure that subsequent reads see all writes made before the corresponding release. Release semantics (used when releasing a lock) ensure that all prior writes are visible before the release. The C11/C++11 memory model formalizes these as memory_order_acquire, memory_order_release, memory_order_seq_cst (sequentially consistent -- the strongest and default), and memory_order_relaxed (no ordering guarantees). The test-and-set instruction atomically writes 1 to a memory location and returns its old value, providing the simplest possible spinlock, but it causes cache-line bouncing under contention. The test-and-test-and-set optimization reads the lock with a regular load first and only attempts the atomic operation when the lock appears free, reducing cache coherence traffic.",
  ],
  code: [
    {
      language: "c",
      caption: "Mutex usage in C with pthreads, and equivalent Python threading.Lock",
      source: `/* C: Protecting a shared counter with a pthread mutex */
#include <pthread.h>
#include <stdio.h>

static int counter = 0;
static pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;

void *increment(void *arg) {
    for (int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&mtx);      /* enter critical section */
        counter++;                      /* safe: only one thread at a time */
        pthread_mutex_unlock(&mtx);    /* leave critical section */
    }
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, increment, NULL);
    pthread_create(&t2, NULL, increment, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("Counter = %d\\n", counter);  /* always 200000 */
    pthread_mutex_destroy(&mtx);
    return 0;
}

# ---- Python equivalent ----
# import threading
#
# counter = 0
# lock = threading.Lock()
#
# def increment():
#     global counter
#     for _ in range(100000):
#         with lock:          # acquires on entry, releases on exit
#             counter += 1
#
# t1 = threading.Thread(target=increment)
# t2 = threading.Thread(target=increment)
# t1.start(); t2.start()
# t1.join(); t2.join()
# print(f"Counter = {counter}")  # always 200000`,
    },
    {
      language: "cpp",
      caption: "Producer-consumer pattern using semaphores and a mutex in C++",
      source: `#include <iostream>
#include <thread>
#include <mutex>
#include <semaphore>
#include <deque>
#include <string>
#include <chrono>
#include <random>
#include <vector>

constexpr int BUFFER_SIZE = 5;

std::deque<std::string> buffer;
std::mutex mtx;                                         // protects the buffer
std::counting_semaphore<BUFFER_SIZE> empty_slots(BUFFER_SIZE);  // counts empty slots
std::counting_semaphore<BUFFER_SIZE> full_slots(0);             // counts full slots

void producer(const std::string& name, int count) {
    std::mt19937 rng(std::random_device{}());
    std::uniform_int_distribution<int> dist(10, 50);

    for (int i = 0; i < count; ++i) {
        std::string item = name + "-item-" + std::to_string(i);
        empty_slots.acquire();           // wait for an empty slot (decrements empty)
        {
            std::lock_guard<std::mutex> lock(mtx);  // exclusive access to buffer
            buffer.push_back(item);
            std::cout << "  " << name << " produced " << item
                      << "  (buffer: " << buffer.size() << ")\\n";
        }
        full_slots.release();            // signal that a slot is now full
        std::this_thread::sleep_for(std::chrono::milliseconds(dist(rng)));
    }
}

void consumer(const std::string& name, int count) {
    std::mt19937 rng(std::random_device{}());
    std::uniform_int_distribution<int> dist(10, 80);

    for (int i = 0; i < count; ++i) {
        full_slots.acquire();            // wait for a full slot (decrements full)
        std::string item;
        {
            std::lock_guard<std::mutex> lock(mtx);  // exclusive access to buffer
            item = buffer.front();
            buffer.pop_front();
            std::cout << "  " << name << " consumed " << item
                      << "  (buffer: " << buffer.size() << ")\\n";
        }
        empty_slots.release();           // signal that a slot is now empty
        std::this_thread::sleep_for(std::chrono::milliseconds(dist(rng)));
    }
}

// Two producers (6 items each) and two consumers (6 items each)
int main() {
    std::vector<std::thread> threads;
    threads.emplace_back(producer, "P1", 6);
    threads.emplace_back(producer, "P2", 6);
    threads.emplace_back(consumer, "C1", 6);
    threads.emplace_back(consumer, "C2", 6);

    for (auto& t : threads) t.join();
    std::cout << "All items produced and consumed.\\n";
}`,
    },
    {
      language: "c",
      caption: "Spinlock implementation using compare-and-swap (CAS) with test-and-test-and-set optimization",
      source: `#include <stdatomic.h>
#include <stdio.h>
#include <pthread.h>

/*
 * A simple spinlock using atomic_flag (guaranteed lock-free by the standard).
 * Uses test-and-test-and-set (TTAS) to reduce cache-line bouncing:
 *   1. Read the lock with a relaxed load (local cache hit, no bus traffic).
 *   2. Only attempt the expensive atomic exchange when the lock appears free.
 */

typedef struct {
    atomic_int locked;   /* 0 = free, 1 = held */
} spinlock_t;

static inline void spin_init(spinlock_t *sl) {
    atomic_store(&sl->locked, 0);
}

static inline void spin_lock(spinlock_t *sl) {
    for (;;) {
        /* Test: read with relaxed ordering (cheap, stays in cache) */
        while (atomic_load_explicit(&sl->locked, memory_order_relaxed)) {
            /* Optionally insert a pause/yield hint for the CPU:
               __builtin_ia32_pause() on x86, __yield() on ARM */
        }
        /* Test-and-set: attempt to acquire with acquire semantics */
        int expected = 0;
        if (atomic_compare_exchange_weak_explicit(
                &sl->locked, &expected, 1,
                memory_order_acquire,   /* success: acquire barrier */
                memory_order_relaxed    /* failure: retry cheaply  */
            )) {
            return;  /* lock acquired */
        }
        /* CAS failed (another thread grabbed it), retry outer loop */
    }
}

static inline void spin_unlock(spinlock_t *sl) {
    atomic_store_explicit(&sl->locked, 0, memory_order_release);
}

/* ---- Usage ---- */
static spinlock_t lock;
static long shared_counter = 0;

void *worker(void *arg) {
    for (int i = 0; i < 1000000; i++) {
        spin_lock(&lock);
        shared_counter++;
        spin_unlock(&lock);
    }
    return NULL;
}

int main(void) {
    spin_init(&lock);
    pthread_t t1, t2;
    pthread_create(&t1, NULL, worker, NULL);
    pthread_create(&t2, NULL, worker, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("Counter = %ld\\n", shared_counter);  /* always 2000000 */
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Synchronization Primitives Overview",
      kind: "mindmap",
      caption: "Taxonomy of common synchronization primitives and their use cases in concurrent programming.",
      mermaid: `mindmap
  root((Sync Primitives))
    Mutex
      Mutual exclusion
      One owner at a time
      Blocking acquire
    Semaphore
      Counting access
      N concurrent users
      Binary semaphore
    Condition Variable
      Wait for condition
      Signal and broadcast
      Used with mutex
    Read-Write Lock
      Concurrent readers
      Exclusive writer
      Reader preference`,
    },
    {
      title: "Mutex Lock-Unlock Flow",
      kind: "flow",
      caption: "How threads compete for a mutex and the flow of acquiring, holding, and releasing the lock.",
      mermaid: `flowchart TD
    T1["Thread 1"] -->|acquire| L{Mutex available?}
    T2["Thread 2"] -->|acquire| L
    L -->|yes - locked| CS["Critical Section
execute protected code"]
    L -->|no - blocked| W["Wait in queue"]
    CS --> R["Release mutex"]
    R --> N["Notify next waiter"]
    N --> W`,
    },
    {
      title: "Producer-Consumer with Semaphore",
      kind: "sequence",
      caption: "Producer and consumer threads coordinating via counting semaphores to manage buffer capacity.",
      mermaid: `sequenceDiagram
    participant P as Producer
    participant FS as FreeSlots Semaphore
    participant B as Buffer
    participant IS as ItemsReady Semaphore
    participant C as Consumer
    P->>FS: wait - decrement free slots
    P->>B: write item to buffer
    P->>IS: signal - increment items ready
    C->>IS: wait - decrement items ready
    C->>B: read item from buffer
    C->>FS: signal - increment free slots`,
    },
    {
      title: "Deadlock State Diagram",
      kind: "state",
      caption: "How two threads can reach deadlock when each holds one lock and waits for the other.",
      mermaid: `stateDiagram-v2
    [*] --> ThreadsRunning
    ThreadsRunning --> T1HoldsA : Thread1 acquires Lock A
    T1HoldsA --> Deadlock : Thread1 waits for Lock B
Thread2 holds Lock B
Thread2 waits for Lock A
    ThreadsRunning --> T2HoldsB : Thread2 acquires Lock B
    T2HoldsB --> Deadlock
    Deadlock --> [*] : timeout or detection`,
    },
  ],
  animations: [
    {
      title: "Mutex Acquire and Release",
      steps: [
        { label: "Initial state", detail: "The mutex is unlocked. Thread A and Thread B are both ready to enter the critical section." },
        { label: "Thread A acquires", detail: "Thread A calls lock(). The atomic CAS succeeds (0 -> 1). Thread A is now the owner and enters the critical section." },
        { label: "Thread B attempts acquire", detail: "Thread B calls lock(). The CAS fails because the mutex is already held (value is 1). Thread B is moved to the mutex's wait queue and blocks (deschedules)." },
        { label: "Thread A releases", detail: "Thread A calls unlock(). The mutex value is set to 0 with release semantics. The kernel wakes Thread B from the wait queue." },
        { label: "Thread B acquires", detail: "Thread B is rescheduled, retries the CAS (0 -> 1), succeeds, and enters the critical section as the new owner." },
        { label: "Thread B releases", detail: "Thread B calls unlock(). The mutex returns to the unlocked state. No waiters remain, so no thread is woken." },
      ],
    },
    {
      title: "Producer-Consumer with Semaphores",
      steps: [
        { label: "Initialization", detail: "Buffer of size 3 is empty. Semaphore 'empty' = 3 (three free slots). Semaphore 'full' = 0 (no items available). A mutex protects the buffer." },
        { label: "Producer adds item 1", detail: "Producer calls empty.wait() (3->2), acquires mutex, appends item to buffer, releases mutex, calls full.signal() (0->1)." },
        { label: "Producer adds item 2", detail: "Producer calls empty.wait() (2->1), acquires mutex, appends item, releases mutex, calls full.signal() (1->2). Buffer now has 2 items." },
        { label: "Consumer takes item 1", detail: "Consumer calls full.wait() (2->1), acquires mutex, removes front item from buffer, releases mutex, calls empty.signal() (1->2)." },
        { label: "Buffer fills up", detail: "Producer adds two more items. empty = 0. The next producer call to empty.wait() blocks because no free slots remain." },
        { label: "Consumer frees a slot", detail: "Consumer calls full.wait() and removes an item. It then calls empty.signal() (0->1), waking the blocked producer, which can now add its item." },
      ],
    },
    {
      title: "Spinlock Contention and Cache Behavior",
      steps: [
        { label: "Lock is free", detail: "The lock variable resides in a cache line shared across CPUs. Its value is 0 (free). Both CPU 0 and CPU 1 have the line in Shared state." },
        { label: "CPU 0 acquires via CAS", detail: "CPU 0 issues a CAS(0->1). The cache line transitions to Modified on CPU 0, Invalidated on CPU 1. CPU 0 enters the critical section." },
        { label: "CPU 1 spins (TTAS)", detail: "CPU 1 performs a relaxed load. Cache miss forces a read from CPU 0 (line goes to Shared). CPU 1 sees value 1 and spins locally on its cached copy without generating bus traffic." },
        { label: "CPU 0 releases", detail: "CPU 0 stores 0 with release semantics. The cache line is Modified on CPU 0, Invalidated on CPU 1." },
        { label: "CPU 1 detects free", detail: "CPU 1's next relaxed load incurs a cache miss, fetches the updated line (value 0), exits the spin loop, and attempts CAS(0->1)." },
        { label: "CPU 1 acquires", detail: "CAS succeeds. CPU 1 enters the critical section. The TTAS optimization minimized bus traffic during the spin phase." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Mutex", "Semaphore", "Spinlock", "Read-Write Lock", "Condition Variable"],
    rows: [
      ["Mechanism", "Blocking (sleep/wake)", "Blocking (counter + queue)", "Busy-wait (spinning)", "Blocking (shared/exclusive modes)", "Blocking (wait/signal on predicate)"],
      ["Ownership", "Yes (only owner can unlock)", "No (any thread can signal)", "Optional (depends on implementation)", "Shared by readers, exclusive for writers", "N/A (used with a mutex)"],
      ["Concurrency", "One thread at a time", "Up to N threads (counting)", "One thread at a time", "Multiple readers OR one writer", "N/A (coordinates via mutex)"],
      ["Best for", "General critical sections", "Resource pools, bounded buffers", "Very short critical sections on SMP", "Read-heavy workloads", "Waiting for complex predicates"],
      ["CPU usage while waiting", "Low (thread sleeps)", "Low (thread sleeps)", "High (burns CPU cycles)", "Low (thread sleeps)", "Low (thread sleeps)"],
      ["Context switch overhead", "Yes (on contention)", "Yes (on contention)", "No (avoids context switch)", "Yes (on contention)", "Yes (on wait/signal)"],
      ["Priority inversion", "Solvable (priority inheritance)", "Not directly solvable", "Risk of livelock under priority issues", "Complex (writer priority variants)", "Inherits from associated mutex"],
      ["Recursive locking", "Supported (recursive mutex)", "N/A (counter-based)", "Generally not supported", "Not typically supported", "N/A"],
      ["Kernel vs. user space", "Both (pthreads, futex-backed)", "Both (POSIX, System V)", "Primarily kernel; user-space possible", "Both (pthread_rwlock)", "Both (pthread_cond)"],
      ["Typical latency (uncontended)", "10-25 ns (futex fast path)", "10-30 ns", "5-10 ns (single CAS)", "15-40 ns", "N/A (always used with mutex)"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a mutex and a binary semaphore?",
      a: "While both enforce mutual exclusion (only one thread in the critical section at a time), the key difference is ownership. A mutex has an owner: only the thread that locked it can unlock it. This enables priority inheritance (the OS can boost the holder's priority to prevent priority inversion) and recursive locking (the owner can re-acquire without deadlocking). A binary semaphore has no ownership -- any thread can call signal(), making it suitable for signaling between threads (e.g., one thread produces data and signals another to consume it) but unsuitable for cases where ownership semantics are needed. Using a semaphore as a mutex without care can lead to subtle bugs if the wrong thread signals.",
      followUps: [
        "Can you give an example where using a semaphore instead of a mutex would cause a bug?",
        "How does priority inheritance work with mutexes?",
        "What happens if a thread tries to unlock a mutex it does not own?",
      ],
    },
    {
      q: "When would you choose a spinlock over a mutex?",
      a: "Choose a spinlock when (1) the critical section is extremely short (a few instructions, typically under 1 microsecond), (2) you are on a multiprocessor/multicore system so the spinning thread runs on a different core from the lock holder, (3) context-switch overhead would dominate the time spent in the critical section, and (4) preemption of the lock holder is unlikely. Spinlocks are commonly used in OS kernels to protect data structures accessed in interrupt handlers, where the thread cannot sleep. On a uniprocessor system, spinlocks are wasteful because the spinning thread prevents the lock holder from running. In user-space code, mutexes with futex fast paths are usually preferable because they spin briefly (adaptive) before blocking.",
      followUps: [
        "What is an adaptive spinlock?",
        "Why can't you use a mutex in an interrupt handler?",
        "What is the test-and-test-and-set optimization?",
      ],
    },
    {
      q: "Explain the producer-consumer problem and how semaphores solve it.",
      a: "The producer-consumer (bounded buffer) problem involves producers adding items to a fixed-size buffer and consumers removing them. The constraints are: producers must block when the buffer is full, consumers must block when the buffer is empty, and concurrent access to the buffer must be serialized. The solution uses two counting semaphores and a mutex. Semaphore 'empty' is initialized to the buffer size (N) and represents free slots; semaphore 'full' is initialized to 0 and represents items available. A producer calls empty.wait() (blocking if no free slots), acquires the mutex, adds an item, releases the mutex, and calls full.signal(). A consumer calls full.wait() (blocking if no items), acquires the mutex, removes an item, releases the mutex, and calls empty.signal(). The order is important: semaphore wait before mutex lock prevents deadlock.",
      followUps: [
        "What happens if you lock the mutex before the semaphore wait?",
        "Can you solve producer-consumer with only condition variables?",
        "How does this extend to multiple producers and multiple consumers?",
      ],
    },
    {
      q: "What is a futex and why is it important?",
      a: "A futex (fast userspace mutex) is a Linux kernel synchronization mechanism that allows user-space locking to be extremely fast in the common (uncontended) case. The key insight is that most lock operations are uncontended -- no other thread is competing for the lock. A futex uses an atomic compare-and-swap in user space to acquire or release the lock without any system call. Only when contention is detected (the CAS fails because another thread holds the lock) does the thread invoke the futex(2) system call to block in the kernel's wait queue. This makes uncontended lock/unlock operations cost only about 10-25 nanoseconds (a single atomic instruction) versus hundreds of nanoseconds for a system call. Pthreads mutexes, semaphores, condition variables, and Java's synchronized/ReentrantLock are all typically implemented on top of futexes on Linux.",
      followUps: [
        "What is the difference between private and shared futexes?",
        "How does the futex wait queue work?",
        "What are the alternatives to futexes on non-Linux systems?",
      ],
    },
    {
      q: "What is the ABA problem in lock-free programming and how is it solved?",
      a: "The ABA problem occurs in lock-free algorithms using compare-and-swap (CAS). A thread reads value A from a shared location, is preempted, and while it is paused another thread changes the value from A to B and back to A. When the first thread resumes and performs CAS, it succeeds because the value is still A, but the underlying state may have changed in ways that invalidate the operation (e.g., nodes in a lock-free stack may have been popped and freed). Solutions include: (1) Tagged pointers -- pair the pointer with a monotonically increasing version counter and CAS on the combined word; the counter changes even if the pointer value returns to A. (2) Hazard pointers -- each thread publishes pointers it is currently accessing; memory reclamation is deferred until no thread references the node. (3) Epoch-based reclamation (used in crossbeam for Rust) -- threads declare epochs and memory is freed only when all threads have advanced past the epoch in which the node was retired.",
      followUps: [
        "Can you walk through a concrete ABA scenario with a lock-free stack?",
        "What is the performance overhead of tagged pointers vs. hazard pointers?",
        "How does double-width CAS help with the ABA problem?",
      ],
    },
    {
      q: "What are memory barriers and why do lock-free algorithms need them?",
      a: "Memory barriers (fences) are hardware instructions that enforce ordering constraints on memory operations. Modern CPUs reorder loads and stores for performance (out-of-order execution, store buffers, cache hierarchies). Without barriers, one CPU may observe another CPU's writes in a different order than they were issued, leading to subtle bugs in concurrent code. An acquire barrier ensures that all loads/stores after the barrier see all writes that happened before the corresponding release barrier on another thread. For example, when thread A writes data and then releases a lock (release barrier), thread B acquiring the lock (acquire barrier) is guaranteed to see thread A's data writes. Lock-free algorithms must use appropriate memory orderings (acquire, release, seq_cst) on their atomic operations to ensure correctness. The C11/C++11 memory model provides memory_order_relaxed, memory_order_acquire, memory_order_release, memory_order_acq_rel, and memory_order_seq_cst to give programmers fine-grained control.",
      followUps: [
        "What is the difference between memory_order_seq_cst and memory_order_acq_rel?",
        "Give an example where missing a memory barrier causes a bug.",
        "How do x86 and ARM differ in their memory ordering guarantees?",
      ],
    },
  ],
  followUps: [
    "How do condition variables relate to monitors, and how does Java's synchronized/wait/notify implement them?",
    "What is lock coarsening vs. lock striping, and when should you use each?",
    "How do reader-writer locks compare to RCU (Read-Copy-Update) in the Linux kernel?",
    "What are the tradeoffs between optimistic and pessimistic concurrency control?",
    "How does transactional memory (hardware and software) aim to replace traditional locking?",
    "What is lock elision using hardware transactional memory (Intel TSX)?",
  ],
  mcqs: [
    {
      q: "Which of the following is NOT a property that distinguishes a mutex from a binary semaphore?",
      options: [
        "A mutex has ownership semantics (only the locker can unlock)",
        "A mutex supports priority inheritance",
        "A mutex uses an internal counter",
        "A mutex can support recursive locking",
      ],
      answerIndex: 2,
      explanation:
        "Both mutexes and binary semaphores use an internal state (locked/unlocked or counter 0/1). The distinguishing features of a mutex are ownership (only the owner can unlock), support for priority inheritance, and recursive locking. A binary semaphore lacks ownership -- any thread can signal it.",
    },
    {
      q: "In the producer-consumer pattern with semaphores, what happens if the producer acquires the mutex BEFORE calling empty.wait()?",
      options: [
        "No change in behavior",
        "Potential deadlock: the producer holds the mutex while blocked on empty.wait(), preventing the consumer from acquiring the mutex to free a slot",
        "A race condition on the buffer",
        "Improved performance due to reduced context switches",
      ],
      answerIndex: 1,
      explanation:
        "If the producer locks the mutex first and then calls empty.wait() when the buffer is full, it blocks while holding the mutex. The consumer cannot acquire the mutex to remove an item and signal the empty semaphore, resulting in deadlock.",
    },
    {
      q: "What is the primary advantage of the test-and-test-and-set (TTAS) spinlock over a plain test-and-set spinlock?",
      options: [
        "TTAS eliminates the ABA problem",
        "TTAS reduces cache coherence traffic by spinning on a local cached copy",
        "TTAS provides fairness guarantees",
        "TTAS supports recursive locking",
      ],
      answerIndex: 1,
      explanation:
        "A plain test-and-set spinlock issues an atomic read-modify-write on every spin iteration, causing cache-line invalidations and heavy bus/interconnect traffic. TTAS first reads with a regular (relaxed) load, which hits the local cache, and only attempts the expensive atomic CAS when the lock appears free, dramatically reducing coherence traffic.",
    },
    {
      q: "A futex's primary performance benefit comes from:",
      options: [
        "Using kernel-mode spinlocks internally",
        "Avoiding system calls in the uncontended case by using user-space atomic operations",
        "Disabling interrupts during lock acquisition",
        "Using hardware transactional memory",
      ],
      answerIndex: 1,
      explanation:
        "A futex uses an atomic compare-and-swap in user space for the uncontended path, requiring no system call (which would cost hundreds of nanoseconds). The kernel is only involved when contention is detected and a thread must block. This makes uncontended locking cost approximately 10-25 ns.",
    },
    {
      q: "In the C11 memory model, which memory ordering provides the weakest guarantees?",
      options: [
        "memory_order_seq_cst",
        "memory_order_acquire",
        "memory_order_relaxed",
        "memory_order_release",
      ],
      answerIndex: 2,
      explanation:
        "memory_order_relaxed provides no ordering guarantees -- the compiler and CPU may freely reorder relaxed operations with respect to other memory operations. It only guarantees atomicity of the individual operation. Stronger orderings are: acquire (subsequent reads see prior writes), release (prior writes are visible to acquirers), and seq_cst (total global order).",
    },
    {
      q: "Which synchronization primitive is most suitable for protecting a configuration object that is read by hundreds of threads but updated once per hour?",
      options: [
        "Mutex",
        "Spinlock",
        "Read-write lock",
        "Binary semaphore",
      ],
      answerIndex: 2,
      explanation:
        "A read-write lock allows multiple readers to hold the lock concurrently (shared mode), only requiring exclusive access for the rare writes. This maximizes read throughput. A mutex or spinlock would serialize all readers unnecessarily, and a binary semaphore lacks the shared/exclusive distinction.",
    },
  ],
  exercises: [
    "Implement a thread-safe bounded queue in your language of choice using a mutex and two condition variables (not_full and not_empty). Test it with multiple producers and consumers and verify no items are lost or duplicated.",
    "Write a readers-writer lock from scratch using only a mutex and a condition variable. Support both reader-preferring and writer-preferring policies. Measure throughput under varying read-to-write ratios.",
    "Implement a dining philosophers solution using mutexes with a resource ordering strategy (always pick up the lower-numbered fork first). Verify that deadlock cannot occur and demonstrate liveness.",
    "Build a lock-free stack (Treiber stack) using atomic compare-and-swap operations. Test it under high contention with multiple threads pushing and popping concurrently. Identify and address the ABA problem.",
    "Compare the performance of a mutex, spinlock, and atomic CAS loop for protecting a shared counter incremented by 8 threads for 10 million iterations each. Measure wall-clock time and CPU utilization. Explain the results in terms of contention, context switches, and cache behavior.",
    "Implement a barrier synchronization primitive (all N threads must arrive before any can proceed) using a mutex and a condition variable. Extend it to a reusable barrier that can be used across multiple phases.",
  ],
  flashcards: [
    {
      front: "What is a critical section?",
      back: "A region of code that accesses shared mutable state and must be executed by at most one thread at a time to prevent race conditions. It is protected by synchronization primitives like mutexes.",
    },
    {
      front: "How does a counting semaphore differ from a binary semaphore?",
      back: "A binary semaphore has a maximum value of 1 (locked/unlocked). A counting semaphore's counter can range from 0 to N, allowing up to N threads to hold it concurrently. Counting semaphores are used for resource pooling and bounded buffers.",
    },
    {
      front: "What is priority inversion and how is it solved?",
      back: "Priority inversion occurs when a high-priority thread is blocked by a low-priority thread holding a lock, while medium-priority threads preempt the low-priority holder. Solutions: priority inheritance (boost holder to waiter's priority) and priority ceiling (assign each lock the ceiling priority of its highest-priority user).",
    },
    {
      front: "What is a futex?",
      back: "A fast userspace mutex (Linux). It performs an atomic CAS in user space for the uncontended case (no system call). Only on contention does it invoke the futex(2) syscall to block/wake threads in the kernel. This makes uncontended locks ~10-25 ns.",
    },
    {
      front: "Why must condition variable waits use a while loop, not an if statement?",
      back: "Because of spurious wakeups (POSIX allows implementations to wake threads without a signal for efficiency) and the thundering herd (broadcast may wake multiple waiters but only one can proceed). The while loop re-checks the predicate after each wakeup.",
    },
    {
      front: "What is the ABA problem?",
      back: "In lock-free CAS algorithms, a memory location changes from A to B and back to A. A thread's CAS succeeds because it sees the expected A, but the underlying state (e.g., list nodes) has changed. Solved with tagged pointers (version counters), hazard pointers, or epoch-based reclamation.",
    },
    {
      front: "What is the test-and-test-and-set (TTAS) optimization?",
      back: "Instead of spinning with an expensive atomic instruction on every iteration, TTAS first reads the lock with a cheap relaxed load (hits the local cache). It only issues the atomic CAS when the lock appears free, reducing cache coherence bus traffic under contention.",
    },
    {
      front: "What is the difference between acquire and release memory semantics?",
      back: "Acquire semantics (on lock): all subsequent loads/stores are ordered after the acquire -- they see all writes that happened before the corresponding release. Release semantics (on unlock): all prior loads/stores are ordered before the release -- they are visible to any thread that subsequently acquires.",
    },
    {
      front: "What is a SeqLock?",
      back: "A reader-writer synchronization mechanism used in the Linux kernel. Writers increment a sequence counter before and after writing. Readers optimistically read data without locking, then check if the counter changed; if so, they retry. Writers never block; readers may retry. Ideal for frequently read, rarely written data.",
    },
    {
      front: "When should you NOT use a spinlock?",
      back: "On uniprocessor systems (spinning prevents the holder from running), when the critical section is long (wastes CPU), in user-space code where the holder might be preempted (causes long spins), and when power consumption matters (spinning burns energy).",
    },
  ],
  revisionNotes: [
    "Race conditions arise from unsynchronized access to shared mutable state. Critical sections must be protected by synchronization primitives.",
    "Mutex = ownership + mutual exclusion. Only the owner can unlock. Supports priority inheritance and recursive locking.",
    "Semaphore = counter + wait queue. wait() decrements (blocks if negative); signal() increments (wakes a waiter). No ownership -- any thread can signal. Binary (N=1) or counting (N>1).",
    "Spinlock = busy-wait using atomic instructions. No context switch overhead but wastes CPU. Best for very short critical sections on multiprocessor systems. TTAS optimization reduces cache traffic.",
    "RWLock = shared (many readers) + exclusive (one writer). Reader-preferring (may starve writers) vs. writer-preferring (may reduce read concurrency). Only beneficial when reads vastly outnumber writes and the critical section is non-trivial.",
    "Condition variable = wait for an arbitrary predicate, always used with a mutex. wait() atomically releases mutex and blocks. Always use a while loop (spurious wakeups). signal() wakes one; broadcast() wakes all.",
    "Futex = user-space fast path (CAS, no syscall) + kernel slow path (block/wake on contention). Underpins pthreads mutex, semaphore, condvar on Linux.",
    "Lock-free programming uses CAS, fetch-and-add, and memory barriers to avoid locks. Guarantees progress even if threads are suspended. Watch for the ABA problem.",
    "Memory ordering: relaxed (no ordering), acquire (reads after see prior writes), release (writes before are visible), seq_cst (total global order). x86 is relatively strong (TSO); ARM/POWER are weak.",
    "Common pitfalls: locking the mutex before the semaphore wait (can deadlock), using if instead of while with condition variables, holding locks across blocking calls, and forgetting memory barriers in lock-free code.",
  ],
  cheatSheet: [
    "pthread_mutex_lock(&mtx) / pthread_mutex_unlock(&mtx) -- basic mutex in C (POSIX)",
    "threading.Lock() in Python -- with lock: block acquires on entry, releases on exit",
    "sem_wait(&sem) / sem_post(&sem) -- POSIX named/unnamed semaphore",
    "threading.Semaphore(N) in Python -- acquire() decrements, release() increments",
    "pthread_rwlock_rdlock(&rw) / pthread_rwlock_wrlock(&rw) / pthread_rwlock_unlock(&rw) -- POSIX rwlock",
    "pthread_cond_wait(&cond, &mtx) / pthread_cond_signal(&cond) -- condition variable (always in a while loop)",
    "atomic_compare_exchange_weak(&var, &expected, desired) -- C11 CAS for lock-free algorithms",
    "std::mutex / std::lock_guard<std::mutex> -- C++ RAII mutex wrapper (releases on scope exit)",
    "std::shared_mutex / std::shared_lock / std::unique_lock -- C++17 reader-writer lock",
    "java.util.concurrent.locks.ReentrantLock / ReentrantReadWriteLock -- Java explicit locks with tryLock, fairness",
    "synchronized (obj) { ... } -- Java intrinsic monitor lock; obj.wait() / obj.notify() for condition waits",
    "Memory orderings: memory_order_relaxed < memory_order_acquire/release < memory_order_seq_cst",
    "Spinlock rule of thumb: use only when critical section < 1 us AND running on SMP AND preemption is disabled or unlikely",
    "Producer-consumer with semaphores: empty.wait() -> mutex.lock() -> produce -> mutex.unlock() -> full.signal() (never lock mutex before semaphore wait)",
  ],
  resources: [
    {
      label: "Operating System Concepts (Silberschatz, Galvin, Gagne)",
      kind: "book",
      note: "Chapters 6-7 cover synchronization, mutexes, semaphores, monitors, and deadlocks in depth. The gold standard OS textbook.",
    },
    {
      label: "The Art of Multiprocessor Programming (Herlihy & Shavit)",
      kind: "book",
      note: "Covers lock-free and wait-free algorithms, CAS, memory models, and concurrent data structures. Essential for advanced concurrency.",
    },
    {
      label: "Linux kernel futex implementation (kernel/futex/)",
      kind: "repo",
      note: "The actual Linux kernel source for futexes. Study futex.c and the Documentation/locking/ directory for real-world low-level synchronization.",
    },
    {
      label: "POSIX Threads Programming (Lawrence Livermore National Lab tutorial)",
      kind: "article",
      note: "Comprehensive tutorial on pthreads: mutexes, condition variables, rwlocks, barriers, with clear examples and common pitfalls.",
    },
    {
      label: "C++ Concurrency in Action (Anthony Williams)",
      kind: "book",
      note: "Covers C++11/14/17 concurrency: std::mutex, atomics, memory orderings, lock-free programming, and the C++ memory model.",
    },
    {
      label: "Ulrich Drepper - Futexes Are Tricky (2011 paper)",
      kind: "paper",
      note: "Explains futex semantics, correct usage patterns, and the subtleties of implementing mutexes and condition variables on top of futexes.",
    },
    {
      label: "Jeff Preshing's blog on lock-free programming",
      kind: "article",
      note: "Excellent series covering memory ordering, acquire/release semantics, CAS patterns, and practical lock-free techniques with clear diagrams.",
    },
    {
      label: "CppCon talks on concurrency (YouTube)",
      kind: "video",
      note: "Herb Sutter's 'atomic<> Weapons' and Fedor Pikus's lock-free talks are standout resources for understanding memory models and atomics.",
    },
  ],
  glossary: [
    { term: "Race condition", definition: "A bug where program correctness depends on the relative timing of concurrent operations accessing shared state without proper synchronization." },
    { term: "Critical section", definition: "A code region that accesses shared mutable state and must execute atomically with respect to other critical sections on the same data." },
    { term: "Mutex (mutual exclusion lock)", definition: "A synchronization primitive that enforces exclusive access. Only the owning thread can release it. Supports priority inheritance and recursive locking." },
    { term: "Semaphore", definition: "A counter-based synchronization primitive. wait() decrements and blocks if negative; signal() increments and wakes a waiter. No ownership semantics. Binary (N=1) or counting (N>1)." },
    { term: "Spinlock", definition: "A lock where the waiting thread busy-waits in a loop (spinning) rather than blocking. Avoids context-switch overhead but wastes CPU. Best for short critical sections on SMP." },
    { term: "Read-write lock (RWLock)", definition: "A lock allowing concurrent shared (read) access or exclusive (write) access. Optimizes read-heavy workloads." },
    { term: "Condition variable", definition: "A mechanism for a thread to atomically release a mutex and wait until a predicate is signaled by another thread. Always used with a while loop and a mutex." },
    { term: "Futex", definition: "Fast userspace mutex (Linux). Uses atomic CAS in user space for uncontended locks (no syscall) and falls back to kernel blocking on contention." },
    { term: "Compare-and-swap (CAS)", definition: "An atomic hardware instruction that compares a memory location to an expected value and swaps it with a new value if they match. Returns success/failure. Foundation of lock-free programming." },
    { term: "Memory barrier (fence)", definition: "A hardware instruction enforcing ordering constraints on memory operations, ensuring that writes before the barrier are visible to other CPUs before reads after the barrier." },
    { term: "Acquire semantics", definition: "Memory ordering where all loads and stores after the acquire are guaranteed to see all writes that preceded the corresponding release on another thread." },
    { term: "Release semantics", definition: "Memory ordering where all loads and stores before the release are guaranteed to be visible to any thread that subsequently performs an acquire." },
    { term: "ABA problem", definition: "In lock-free CAS algorithms, a value changes from A to B and back to A, causing a CAS to falsely succeed. Solved with tagged pointers, hazard pointers, or epoch-based reclamation." },
    { term: "Priority inversion", definition: "A high-priority thread is indirectly blocked by a low-priority thread holding a lock, while medium-priority threads preempt the holder. Solved by priority inheritance or priority ceiling." },
    { term: "Spurious wakeup", definition: "A condition variable wait returning without a corresponding signal/broadcast. Allowed by POSIX for implementation efficiency. Guarded by always re-checking the predicate in a while loop." },
    { term: "SeqLock", definition: "A reader-writer mechanism where writers increment a sequence counter before and after updates. Readers read optimistically and retry if the counter changed. Writers never block." },
    { term: "Lock-free", definition: "A concurrent algorithm guaranteeing that at least one thread makes progress in a finite number of steps, regardless of scheduling. Uses atomic operations instead of locks." },
    { term: "Wait-free", definition: "A stronger guarantee than lock-free: every thread makes progress in a bounded number of steps, regardless of other threads' behavior." },
  ],
};
