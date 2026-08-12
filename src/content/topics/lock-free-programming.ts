import type { TopicContent } from "../types";

export const lockFreeProgramming: TopicContent = {
  quickSummary: [
    "Lock-free programming uses atomic operations (primarily Compare-And-Swap) instead of mutexes to coordinate concurrent access, guaranteeing system-wide progress even when individual threads stall.",
    "Progress guarantees form a hierarchy: obstruction-free (progress when running alone) < lock-free (at least one thread always progresses) < wait-free (every thread completes in bounded steps).",
    "The ABA problem occurs when a CAS reads value A, another thread changes it to B then back to A, making CAS falsely succeed; solutions include tagged pointers, hazard pointers, and epoch-based reclamation.",
    "Canonical lock-free data structures include the Treiber stack (LIFO via CAS on head) and the Michael-Scott queue (two-pointer FIFO with sentinel node), both foundational in concurrent systems.",
  ],

  detailed: [
    "Lock-free programming is a concurrency paradigm that avoids mutual exclusion locks in favor of atomic read-modify-write primitives such as Compare-And-Swap (CAS), Fetch-And-Add, and Load-Linked/Store-Conditional. The core idea is that threads optimistically attempt their operation and retry if a concurrent modification is detected, rather than blocking to acquire exclusive access. This eliminates problems like deadlock, priority inversion, and convoying that plague lock-based designs, though it introduces its own complexity around memory ordering, safe memory reclamation, and correctness reasoning.",

    "The progress guarantees in non-blocking algorithms are formally stratified. An algorithm is obstruction-free if any single thread, running in isolation (with all others suspended), will complete in a finite number of steps. Lock-freedom strengthens this: among all concurrently executing threads, at least one is guaranteed to complete its operation in a finite number of steps, meaning the system as a whole always makes progress even though individual threads may starve. Wait-freedom is the strongest guarantee: every thread completes its operation in a bounded number of steps regardless of the behavior of other threads, eliminating starvation entirely but often at significant implementation complexity and performance cost.",

    "The Compare-And-Swap (CAS) operation is the workhorse of lock-free programming. It atomically reads a memory location, compares it to an expected value, and writes a new value only if the comparison succeeds, returning whether the swap occurred. A typical CAS loop pattern reads the current state, computes the desired new state, then attempts CAS; on failure (another thread modified the location), it re-reads and retries. Memory ordering is critical: most lock-free algorithms require at least acquire-release semantics on atomic operations to prevent the compiler and CPU from reordering instructions in ways that break correctness. C++ provides std::memory_order_acquire, std::memory_order_release, and std::memory_order_seq_cst for fine-grained control.",

    "The ABA problem is a subtle bug specific to CAS-based algorithms. A thread reads value A from a shared pointer, gets preempted, and during that time another thread changes the pointer to B, frees the node at A, allocates a new node that happens to occupy the same address, and links it back as A. When the original thread resumes, its CAS succeeds because the pointer value is A again, but the node is semantically different, leading to corruption. Solutions include tagged pointers (appending a monotonically increasing counter to the pointer so the CAS also validates the generation), hazard pointers (each thread publishes which nodes it is currently accessing, preventing reclamation of in-use nodes), and epoch-based reclamation (threads enter an epoch before accessing shared data and retired nodes are freed only after all threads have advanced past the epoch in which the node was retired).",

    "Real-world lock-free data structures include the Treiber stack, which maintains a single atomic head pointer and pushes/pops via CAS, and the Michael-Scott queue, which uses separate atomic head and tail pointers with a sentinel node. The Michael-Scott queue is notably used in Java's ConcurrentLinkedQueue. Designing correct lock-free algorithms requires careful reasoning about all possible interleavings, appropriate memory fences, and safe memory reclamation. Tools like ThreadSanitizer, model checkers (CDSChecker), and formal verification (TLA+) are invaluable for validating correctness.",
  ],

  deepDive: [
    "Hazard pointers, introduced by Maged Michael in 2004, provide a deterministic safe memory reclamation scheme for lock-free data structures. Each thread maintains a small set of hazard pointer slots (typically one or two) that it uses to publish which nodes it is currently accessing. Before dereferencing a pointer obtained from a shared atomic variable, a thread writes that pointer into its hazard pointer slot and then re-validates the pointer (checks it has not changed). When a thread wants to retire a node, it adds the node to a thread-local retired list. Periodically, the thread scans all hazard pointers across all threads and frees only those retired nodes not referenced by any hazard pointer. This guarantees that no thread will access freed memory, solving the ABA problem and preventing use-after-free, with bounded memory overhead proportional to the number of threads times the number of hazard pointer slots.",

    "Epoch-based reclamation (EBR), used in systems like Crossbeam in Rust, takes a different approach. A global epoch counter (cycling through 0, 1, 2) tracks the current era. When a thread begins a lock-free operation, it announces it has entered the current epoch. Retired nodes are placed in a per-epoch retire list. The global epoch can advance only when all active threads have announced the current epoch, meaning no thread is still operating in an older epoch. Nodes retired two epochs ago can then be safely freed because no thread could still hold a reference to them. EBR is simpler and faster than hazard pointers in practice but has a weakness: a single stalled thread prevents epoch advancement, causing unbounded memory accumulation. Hybrid schemes like DEBRA and IBR address this limitation.",

    "Wait-free algorithms guarantee per-thread bounded completion and are significantly harder to design. The universal construction by Herlihy proves that any sequential object can be made wait-free using CAS, but the naive construction has poor performance. Practical wait-free algorithms use helping mechanisms: a fast thread that detects a slow thread struggling to complete its operation will help the slow thread finish before proceeding with its own work. The wait-free queue by Kogan and Petrank (2011) uses this approach, achieving practical performance close to lock-free designs while maintaining the stronger guarantee. Fast-path/slow-path designs combine a lock-free fast path with a wait-free slow path that kicks in only when contention is detected.",

    "Memory ordering is a subtle but critical aspect of lock-free programming. Modern CPUs reorder memory operations for performance, and compilers do the same. Lock-free algorithms must use appropriate memory fences or atomic operation orderings to ensure correctness. The C++ memory model defines six orderings: relaxed (no ordering guarantees), consume (data-dependent ordering, largely deprecated), acquire (reads after the acquire see writes before the corresponding release), release (writes before the release are visible after the corresponding acquire), acq_rel (both acquire and release), and seq_cst (total order across all seq_cst operations). Most lock-free algorithms require acquire on loads and release on stores at minimum. Using seq_cst everywhere is correct but unnecessarily expensive on architectures with weak memory models like ARM and POWER. x86 provides relatively strong ordering (Total Store Order) making many orderings free, but portable code must not rely on this.",
  ],

  code: [
    {
      language: "cpp",
      caption: "Treiber Lock-Free Stack in C++ using CAS",
      source: `\`\`\`cpp
#include <atomic>
#include <optional>

template <typename T>
class LockFreeStack {
    struct Node {
        T data;
        Node* next;
        Node(T val) : data(std::move(val)), next(nullptr) {}
    };

    std::atomic<Node*> head{nullptr};

public:
    void push(T val) {
        Node* new_node = new Node(std::move(val));
        new_node->next = head.load(std::memory_order_relaxed);
        // CAS loop: retry if another thread modified head
        while (!head.compare_exchange_weak(
            new_node->next, new_node,
            std::memory_order_release,
            std::memory_order_relaxed)) {
            // new_node->next is updated by CAS on failure
        }
    }

    std::optional<T> pop() {
        Node* old_head = head.load(std::memory_order_acquire);
        while (old_head) {
            // Attempt to swing head to next node
            if (head.compare_exchange_weak(
                old_head, old_head->next,
                std::memory_order_acquire,
                std::memory_order_relaxed)) {
                T val = std::move(old_head->data);
                // WARNING: naive delete; real code needs
                // hazard pointers or epoch-based reclamation
                delete old_head;
                return val;
            }
            // old_head updated by CAS on failure
        }
        return std::nullopt;
    }
};
\`\`\``,
    },
    {
      language: "cpp",
      caption: "Tagged Pointer to solve ABA problem in C++",
      source: `\`\`\`cpp
#include <atomic>
#include <cstdint>

// Pack a pointer and a counter into a single 64-bit word
// on 64-bit systems, use top 16 bits for tag (assuming
// 48-bit virtual addresses)
struct TaggedPtr {
    uintptr_t packed;

    TaggedPtr() : packed(0) {}
    TaggedPtr(void* ptr, uint16_t tag) {
        packed = reinterpret_cast<uintptr_t>(ptr)
               | (static_cast<uintptr_t>(tag) << 48);
    }

    void* ptr() const {
        return reinterpret_cast<void*>(
            packed & 0x0000FFFFFFFFFFFF);
    }

    uint16_t tag() const {
        return static_cast<uint16_t>(packed >> 48);
    }

    bool operator==(const TaggedPtr& o) const {
        return packed == o.packed;
    }
};

// Usage in a CAS loop:
// std::atomic<TaggedPtr> head;
// TaggedPtr old_head = head.load();
// TaggedPtr new_head(new_node, old_head.tag() + 1);
// head.compare_exchange_strong(old_head, new_head);
// The incremented tag prevents ABA: even if the pointer
// value recycles, the tag will differ.
\`\`\``,
    },
    {
      language: "rust",
      caption: "Lock-Free Stack using Crossbeam epoch-based reclamation in Rust",
      source: `\`\`\`rust
use crossbeam_epoch::{self as epoch, Atomic, Owned, Shared};
use std::sync::atomic::Ordering;

pub struct LockFreeStack<T> {
    head: Atomic<Node<T>>,
}

struct Node<T> {
    data: T,
    next: Atomic<Node<T>>,
}

impl<T> LockFreeStack<T> {
    pub fn new() -> Self {
        Self {
            head: Atomic::null(),
        }
    }

    pub fn push(&self, val: T) {
        let mut node = Owned::new(Node {
            data: val,
            next: Atomic::null(),
        });
        let guard = epoch::pin();
        loop {
            let head = self.head.load(Ordering::Relaxed, &guard);
            node.next.store(head, Ordering::Relaxed);
            match self.head.compare_exchange(
                head,
                node,
                Ordering::Release,
                Ordering::Relaxed,
                &guard,
            ) {
                Ok(_) => return,
                Err(e) => node = e.new,
            }
        }
    }

    pub fn pop(&self) -> Option<T> {
        let guard = epoch::pin();
        loop {
            let head = self.head.load(Ordering::Acquire, &guard);
            let head_ref = unsafe { head.as_ref()? };
            let next = head_ref.next.load(Ordering::Relaxed, &guard);
            if self.head.compare_exchange(
                head,
                next,
                Ordering::Relaxed,
                Ordering::Relaxed,
                &guard,
            ).is_ok() {
                // Safe to defer deallocation until no
                // thread holds a reference
                unsafe {
                    guard.defer_destroy(head);
                    return Some(std::ptr::read(&head_ref.data));
                }
            }
        }
    }
}

unsafe impl<T: Send> Send for LockFreeStack<T> {}
unsafe impl<T: Send> Sync for LockFreeStack<T> {}
\`\`\``,
    },
    {
      language: "java",
      caption: "Michael-Scott Lock-Free Queue in Java",
      source: `\`\`\`java
import java.util.concurrent.atomic.AtomicReference;

public class MSQueue<T> {
    private static class Node<T> {
        final T value;
        final AtomicReference<Node<T>> next;

        Node(T value) {
            this.value = value;
            this.next = new AtomicReference<>(null);
        }
    }

    private final AtomicReference<Node<T>> head;
    private final AtomicReference<Node<T>> tail;

    public MSQueue() {
        Node<T> sentinel = new Node<>(null);
        head = new AtomicReference<>(sentinel);
        tail = new AtomicReference<>(sentinel);
    }

    public void enqueue(T value) {
        Node<T> newNode = new Node<>(value);
        while (true) {
            Node<T> curTail = tail.get();
            Node<T> next = curTail.next.get();
            if (curTail == tail.get()) {
                if (next == null) {
                    // Tail is pointing to last node
                    if (curTail.next.compareAndSet(null, newNode)) {
                        // Enqueue done; try to advance tail
                        tail.compareAndSet(curTail, newNode);
                        return;
                    }
                } else {
                    // Tail is lagging; help advance it
                    tail.compareAndSet(curTail, next);
                }
            }
        }
    }

    public T dequeue() {
        while (true) {
            Node<T> curHead = head.get();
            Node<T> curTail = tail.get();
            Node<T> next = curHead.next.get();
            if (curHead == head.get()) {
                if (curHead == curTail) {
                    if (next == null) return null; // empty
                    tail.compareAndSet(curTail, next);
                } else {
                    T value = next.value;
                    if (head.compareAndSet(curHead, next)) {
                        return value;
                    }
                }
            }
        }
    }
}
\`\`\``,
    },
    {
      language: "java",
      caption: "AtomicStampedReference to solve ABA in Java",
      source: `\`\`\`java
import java.util.concurrent.atomic.AtomicStampedReference;

public class ABAFreeStack<T> {
    private static class Node<T> {
        T data;
        Node<T> next;
        Node(T data) { this.data = data; }
    }

    // AtomicStampedReference bundles an int stamp with
    // the reference, preventing ABA
    private final AtomicStampedReference<Node<T>> head =
        new AtomicStampedReference<>(null, 0);

    public void push(T val) {
        Node<T> newNode = new Node<>(val);
        int[] stampHolder = new int[1];
        while (true) {
            Node<T> oldHead = head.get(stampHolder);
            int oldStamp = stampHolder[0];
            newNode.next = oldHead;
            if (head.compareAndSet(
                    oldHead, newNode,
                    oldStamp, oldStamp + 1)) {
                return;
            }
        }
    }

    public T pop() {
        int[] stampHolder = new int[1];
        while (true) {
            Node<T> oldHead = head.get(stampHolder);
            if (oldHead == null) return null;
            int oldStamp = stampHolder[0];
            Node<T> next = oldHead.next;
            if (head.compareAndSet(
                    oldHead, next,
                    oldStamp, oldStamp + 1)) {
                return oldHead.data;
            }
        }
    }
}
\`\`\``,
    },
    {
      language: "rust",
      caption: "Lock-free MPSC channel sketch using atomics in Rust",
      source: `\`\`\`rust
use std::sync::atomic::{AtomicPtr, Ordering};
use std::ptr;

struct Node<T> {
    data: Option<T>,
    next: AtomicPtr<Node<T>>,
}

/// Simplified lock-free MPSC queue (multiple producers,
/// single consumer) based on Vyukov's design.
pub struct MpscQueue<T> {
    head: AtomicPtr<Node<T>>,  // consumer reads here
    tail: AtomicPtr<Node<T>>,  // producers append here
}

impl<T> MpscQueue<T> {
    pub fn new() -> Self {
        let sentinel = Box::into_raw(Box::new(Node {
            data: None,
            next: AtomicPtr::new(ptr::null_mut()),
        }));
        Self {
            head: AtomicPtr::new(sentinel),
            tail: AtomicPtr::new(sentinel),
        }
    }

    /// Lock-free push (safe for multiple producers).
    pub fn push(&self, val: T) {
        let new_node = Box::into_raw(Box::new(Node {
            data: Some(val),
            next: AtomicPtr::new(ptr::null_mut()),
        }));
        // Atomically swap tail to new_node
        let prev = self.tail.swap(new_node, Ordering::AcqRel);
        // Link old tail to new node; this linearizes
        // the enqueue
        unsafe {
            (*prev).next.store(new_node, Ordering::Release);
        }
    }

    /// Single-consumer pop. Returns None if empty.
    pub fn pop(&self) -> Option<T> {
        unsafe {
            let head = self.head.load(Ordering::Acquire);
            let next = (*head).next.load(Ordering::Acquire);
            if next.is_null() {
                return None;
            }
            self.head.store(next, Ordering::Release);
            let data = (*next).data.take();
            drop(Box::from_raw(head)); // free sentinel
            data
        }
    }
}

unsafe impl<T: Send> Send for MpscQueue<T> {}
unsafe impl<T: Send> Sync for MpscQueue<T> {}
\`\`\``,
    },
  ],

  diagrams: [
    {
      title: "CAS Loop Operation Flow",
      kind: "flow" as const,
      caption: "Flowchart showing the read-compare-swap retry loop that underpins all lock-free algorithms.",
      mermaid: `flowchart TD
    A["Load current value into expected"] --> B["Compute desired value from expected"]
    B --> C["Execute CAS: compare memory with expected"]
    C --> D{"CAS succeeded?"}
    D -->|Yes| E["Operation complete - value updated atomically"]
    D -->|No| F["Another thread modified value"]
    F --> G["Update expected with actual current value"]
    G --> B`,
    },
    {
      title: "ABA Problem Sequence",
      kind: "sequence" as const,
      caption: "Sequence diagram showing how Thread 1 reads A, Thread 2 changes A to B back to A, and Thread 1's CAS falsely succeeds.",
      mermaid: `sequenceDiagram
    participant T1 as Thread 1
    participant Mem as Shared Memory
    participant T2 as Thread 2

    T1->>Mem: Read head = Node A (addr 0x100)
    Note over T1: Thread 1 preempted
    T2->>Mem: Pop Node A (free 0x100)
    T2->>Mem: Pop Node B
    T2->>Mem: Push new node allocated at 0x100
    Note over Mem: head = 0x100 again but different node
    T1->>Mem: CAS(head, 0x100, A.next)
    Note over T1,Mem: CAS succeeds but A.next is stale pointer
    Note over Mem: Memory corruption - dangling pointer`,
    },
    {
      title: "Lock-Free Stack Architecture",
      kind: "architecture" as const,
      caption: "Structure of a Treiber lock-free stack using a single atomic head pointer and CAS for push and pop.",
      mermaid: `graph TD
    HEAD["Atomic Head Pointer"] --> N1["Node D - top of stack"]
    N1 --> N2["Node C"]
    N2 --> N3["Node B"]
    N3 --> N4["Node A"]
    N4 --> NULL["null"]
    PUSH["push - create node, set next to head, CAS head"] --> HEAD
    POP["pop - read head, read next, CAS head to next"] --> HEAD
    TAG["Tagged Pointer - ptr plus version counter"] -.->|prevents ABA| HEAD`,
    },
    {
      title: "Progress Guarantee Hierarchy",
      kind: "mindmap" as const,
      caption: "Hierarchy of progress guarantees from weakest to strongest, with key properties and typical use cases.",
      mermaid: `mindmap
  root((Progress Guarantees))
    Blocking - Lock-Based
      Mutex and spinlock
      Deadlock possible
      Priority inversion risk
      Simple to reason about
    Obstruction-Free
      Progress if run alone
      No deadlock
      CAS with backoff
    Lock-Free
      System-wide progress
      Some threads may starve
      Treiber stack
      Michael-Scott queue
    Wait-Free
      Per-thread bounded steps
      No starvation
      Highest complexity
      Helping mechanism needed`,
    },
  ],

  animations: [
    {
      title: "Lock-Free Stack Push and Pop via CAS",
      steps: [
        {
          label: "Initial state",
          detail:
            "Stack has nodes [C -> B -> A]. Head pointer points to C.",
        },
        {
          label: "Thread 1 begins push(D)",
          detail:
            "Thread 1 creates node D, reads head = C, sets D.next = C.",
        },
        {
          label: "Thread 2 concurrently pops",
          detail:
            "Thread 2 reads head = C, reads C.next = B, CAS(head, C, B) succeeds. Head now points to B.",
        },
        {
          label: "Thread 1 CAS fails",
          detail:
            "Thread 1 attempts CAS(head, C, D) but head is now B, not C. CAS fails.",
        },
        {
          label: "Thread 1 retries",
          detail:
            "Thread 1 re-reads head = B, sets D.next = B, attempts CAS(head, B, D).",
        },
        {
          label: "Thread 1 CAS succeeds",
          detail:
            "CAS(head, B, D) succeeds. Stack is now [D -> B -> A]. Both operations completed correctly without locks.",
        },
      ],
    },
    {
      title: "ABA Problem and Tagged Pointer Solution",
      steps: [
        {
          label: "Thread 1 reads head",
          detail:
            "Thread 1 reads head = Node A (address 0x100), preparing to pop. Gets preempted.",
        },
        {
          label: "Thread 2 pops A and B",
          detail:
            "Thread 2 pops A (frees 0x100), then pops B. Stack is now [C].",
        },
        {
          label: "Thread 2 pushes new node at recycled address",
          detail:
            "Thread 2 allocates a new node that happens to get address 0x100, pushes it. Head = 0x100 again.",
        },
        {
          label: "Thread 1 resumes, CAS falsely succeeds",
          detail:
            "Thread 1's CAS(head, 0x100, A.next) succeeds because head is 0x100. But A.next pointed to the OLD node B, which is freed. Corruption!",
        },
        {
          label: "Tagged pointer prevents ABA",
          detail:
            "With tagged pointers, head stores (ptr, version). Thread 1 read (0x100, v=5). After Thread 2's operations, head is (0x100, v=8).",
        },
        {
          label: "CAS correctly fails with tag mismatch",
          detail:
            "Thread 1's CAS compares (0x100, 5) with current (0x100, 8). Tags differ, CAS fails. Thread 1 retries safely.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Property",
      "Lock-Based",
      "Obstruction-Free",
      "Lock-Free",
      "Wait-Free",
    ],
    rows: [
      [
        "Progress guarantee",
        "None (deadlock possible)",
        "Progress if run alone",
        "System-wide progress guaranteed",
        "Per-thread bounded progress",
      ],
      [
        "Starvation possible",
        "Yes",
        "Yes",
        "Yes (individual threads)",
        "No",
      ],
      [
        "Deadlock possible",
        "Yes",
        "No",
        "No",
        "No",
      ],
      [
        "Priority inversion",
        "Yes",
        "No",
        "No",
        "No",
      ],
      [
        "Implementation complexity",
        "Low",
        "Medium",
        "High",
        "Very high",
      ],
      [
        "Typical throughput",
        "Good (low contention)",
        "Variable",
        "Excellent (high contention)",
        "Good (overhead from helping)",
      ],
      [
        "Memory reclamation",
        "Simple (unlock then free)",
        "Complex (SMR needed)",
        "Complex (SMR needed)",
        "Complex (SMR needed)",
      ],
      [
        "Primary mechanism",
        "Mutex / spinlock",
        "CAS with backoff",
        "CAS retry loop",
        "CAS + helping mechanism",
      ],
      [
        "Real-time suitability",
        "Poor",
        "Fair",
        "Good",
        "Excellent",
      ],
      [
        "Example",
        "pthread_mutex + std::queue",
        "Obstruction-free deque",
        "Treiber stack, MS-queue",
        "Kogan-Petrank queue",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What is the difference between lock-free and wait-free?",
      a: "Lock-free guarantees that at least one thread among all concurrent threads makes progress in a finite number of steps, ensuring system-wide progress but allowing individual thread starvation. Wait-free guarantees that every thread completes its operation in a bounded number of steps, eliminating starvation entirely. Wait-free is strictly stronger but harder to implement and often has higher overhead due to helping mechanisms.",
      followUps: [
        "Can you give an example of a practical wait-free algorithm?",
        "Why are most production concurrent data structures lock-free rather than wait-free?",
      ],
    },
    {
      q: "Explain the ABA problem and how to solve it.",
      a: "The ABA problem occurs in CAS-based algorithms when a thread reads value A, gets preempted, another thread changes the value to B then back to A, and the original thread's CAS succeeds despite the semantic change. Solutions: (1) Tagged/stamped pointers that pair the pointer with a monotonically increasing counter so the CAS also validates the generation. (2) Hazard pointers where threads publish pointers they are accessing, preventing premature reclamation. (3) Epoch-based reclamation where nodes are freed only after all threads have moved past the retirement epoch.",
      followUps: [
        "What are the tradeoffs between hazard pointers and epoch-based reclamation?",
        "How does Java's AtomicStampedReference address ABA?",
      ],
    },
    {
      q: "How does a CAS loop work and what are its performance implications?",
      a: "A CAS loop reads the current value, computes the desired new value, then attempts an atomic compare-and-swap. If another thread modified the value concurrently, CAS fails and the loop retries. Under low contention this converges quickly, but under high contention threads may spin repeatedly, wasting CPU cycles and causing cache-line bouncing. Exponential backoff or combining techniques can mitigate contention.",
    },
    {
      q: "Describe the Michael-Scott queue and why it uses a sentinel node.",
      a: "The Michael-Scott queue is a lock-free FIFO queue with separate head and tail atomic pointers. It uses a sentinel (dummy) node so that head and tail never point to null, simplifying the empty-queue case and avoiding a problematic race where enqueue and dequeue compete on the same node. Enqueue appends to tail's next and advances tail; dequeue reads head's next and advances head. A helping mechanism lets enqueuers advance a lagging tail pointer.",
      followUps: [
        "What happens if the tail pointer lags behind?",
        "How does this compare to a two-lock queue?",
      ],
    },
    {
      q: "What memory ordering constraints are needed for a correct lock-free stack?",
      a: "Push requires release ordering on the CAS so that the node's initialization (data, next pointer) is visible to other threads before the node becomes reachable via head. Pop requires acquire ordering on the CAS or the load of head so that the thread sees the complete node contents. Without these orderings, a thread could read a partially-initialized node. On x86 (TSO), acquire and release are essentially free, but ARM and POWER require explicit barriers.",
    },
    {
      q: "What are hazard pointers and when would you use them over epoch-based reclamation?",
      a: "Hazard pointers are a safe memory reclamation scheme where each thread publishes pointers it is currently accessing. Before freeing a retired node, the reclaiming thread scans all hazard pointers and only frees nodes not referenced by any thread. Use hazard pointers over EBR when threads may block or stall for long periods, since EBR requires all threads to periodically advance their epoch and a stalled thread prevents reclamation system-wide. Hazard pointers provide bounded memory overhead regardless of thread behavior.",
      followUps: [
        "What is the memory overhead of hazard pointers?",
        "How does the scan phase work efficiently?",
      ],
    },
    {
      q: "Why is lock-free programming relevant to real-time systems?",
      a: "Real-time systems require bounded response times. Lock-based approaches can cause unbounded delays through priority inversion (a high-priority task waiting for a lock held by a low-priority task) and convoying. Lock-free algorithms guarantee system-wide progress regardless of thread scheduling, and wait-free algorithms provide per-thread bounded completion, making them suitable for hard real-time constraints.",
    },
    {
      q: "How does Rust's ownership model help with lock-free programming?",
      a: "Rust's ownership and borrowing rules prevent data races at compile time. The Send and Sync traits ensure that types are only shared across threads when it is safe to do so. Libraries like crossbeam provide epoch-based reclamation with safe APIs, and the type system enforces that you pin an epoch guard before accessing shared data. This eliminates entire classes of bugs (use-after-free, double-free) that plague C/C++ lock-free code, though unsafe blocks are still needed for the core pointer manipulations.",
    },
  ],

  followUps: [
    "What is the ABA problem and how do you defend against it?",
    "Lock-free vs wait-free — what's the actual guarantee difference?",
    "Why can a lock-free algorithm perform worse than a locking one under high contention?",
    "Why is 'use a library' usually the correct answer here?",
  ],
  mcqs: [
    {
      q: "Which progress guarantee does the Treiber stack provide?",
      options: [
        "Wait-free",
        "Lock-free",
        "Obstruction-free",
        "Blocking",
      ],
      answerIndex: 1,
      explanation:
        "The Treiber stack uses a CAS loop that guarantees at least one thread succeeds per round of contention, making it lock-free. Individual threads can be starved by continuous contention, so it is not wait-free.",
    },
    {
      q: "What is the primary purpose of a tagged pointer in lock-free algorithms?",
      options: [
        "To compress pointer size for cache efficiency",
        "To prevent the ABA problem by adding a version counter",
        "To encode type information in the pointer",
        "To align memory for SIMD operations",
      ],
      answerIndex: 1,
      explanation:
        "Tagged pointers pair the address with a monotonically increasing counter. Even if the pointer value recycles (ABA), the counter will differ, causing CAS to correctly fail.",
    },
    {
      q: "In the Michael-Scott queue, what happens when a thread finds tail->next is not null during enqueue?",
      options: [
        "It retries the entire operation from scratch",
        "It returns an error indicating contention",
        "It helps advance the tail pointer before retrying",
        "It blocks until the tail pointer is updated",
      ],
      answerIndex: 2,
      explanation:
        "The helping mechanism is a key feature of the MS-queue. If tail is lagging (tail->next is not null), the enqueuing thread CAS-advances tail to tail->next before retrying its own enqueue, ensuring the data structure remains consistent.",
    },
    {
      q: "Which memory reclamation scheme can cause unbounded memory growth if a single thread stalls?",
      options: [
        "Hazard pointers",
        "Reference counting",
        "Epoch-based reclamation",
        "Tagged pointers",
      ],
      answerIndex: 2,
      explanation:
        "EBR requires all threads to advance past an epoch before retired nodes from that epoch can be freed. A stalled thread prevents epoch advancement, causing all retired nodes to accumulate indefinitely.",
    },
    {
      q: "What C++ memory ordering is the minimum required on a CAS in a lock-free push to ensure the new node's data is visible to consumers?",
      options: [
        "memory_order_relaxed",
        "memory_order_consume",
        "memory_order_release",
        "memory_order_seq_cst",
      ],
      answerIndex: 2,
      explanation:
        "Release ordering on the store (CAS success) ensures that all prior writes (node initialization) are visible to a thread that performs an acquire load on the same atomic variable. Relaxed would allow consumers to see uninitialized data.",
    },
    {
      q: "Which of the following is NOT a property of lock-free algorithms?",
      options: [
        "Freedom from deadlock",
        "Guaranteed per-thread bounded completion",
        "System-wide progress guarantee",
        "No priority inversion",
      ],
      answerIndex: 1,
      explanation:
        "Per-thread bounded completion is a property of wait-free algorithms. Lock-free only guarantees that at least one thread makes progress; individual threads can theoretically starve.",
    },
  ],

  flashcards: [
    {
      front: "What does CAS stand for and what does it do?",
      back: "Compare-And-Swap: atomically reads a memory location, compares it to an expected value, and writes a new value only if the current value matches the expected value. Returns success/failure.",
    },
    {
      front: "What is the ABA problem?",
      back: "A CAS-specific bug where a value changes from A to B and back to A between a thread's read and CAS, making the CAS falsely succeed despite the semantic state having changed.",
    },
    {
      front: "What is the difference between lock-free and wait-free?",
      back: "Lock-free: at least one thread always makes progress (system-wide guarantee). Wait-free: every thread completes in bounded steps (per-thread guarantee). Wait-free is strictly stronger.",
    },
    {
      front: "What is a hazard pointer?",
      back: "A per-thread published pointer indicating which shared nodes the thread is currently accessing. Nodes referenced by any hazard pointer cannot be freed, solving safe memory reclamation in lock-free structures.",
    },
    {
      front: "What is epoch-based reclamation?",
      back: "A memory reclamation scheme using a global epoch counter. Threads announce their current epoch; retired nodes are freed only after all threads have advanced past the retirement epoch. Simpler than hazard pointers but vulnerable to stalled threads.",
    },
    {
      front: "What is the Treiber stack?",
      back: "A lock-free LIFO stack using a single atomic head pointer. Push and pop both use CAS on head. Push: set new_node.next = head, CAS head to new_node. Pop: read head.next, CAS head to head.next.",
    },
    {
      front: "Why does the Michael-Scott queue use a sentinel node?",
      back: "The sentinel (dummy) node ensures head and tail are never null, simplifying the empty-queue case and preventing races when the queue transitions between empty and non-empty states.",
    },
    {
      front: "What is memory_order_acquire in C++?",
      back: "A memory ordering constraint ensuring that no reads or writes in the current thread can be reordered before this load. Paired with release, it establishes a happens-before relationship for synchronization.",
    },
    {
      front: "What is obstruction-freedom?",
      back: "The weakest non-blocking progress guarantee: a thread is guaranteed to complete its operation in a finite number of steps if it runs in isolation (all other threads are suspended).",
    },
    {
      front: "What is the helping mechanism in wait-free algorithms?",
      back: "A technique where a fast thread detects that a slower thread is struggling to complete its operation and helps it finish before proceeding. This ensures every thread completes in bounded steps, achieving the wait-free guarantee.",
    },
  ],

  revisionNotes: [
    "Lock-free algorithms use atomic RMW operations (primarily CAS) instead of locks. They guarantee system-wide progress: at least one thread always completes, but individual threads may starve.",
    "Progress hierarchy: blocking < obstruction-free < lock-free < wait-free. Each level strictly strengthens the guarantee. Most practical concurrent data structures are lock-free.",
    "CAS loop pattern: (1) load current state, (2) compute desired state, (3) CAS. On failure, re-read and retry. Use acquire ordering on loads, release on stores at minimum.",
    "ABA problem is unique to CAS-based algorithms. Three main solutions: tagged/stamped pointers (version counter), hazard pointers (publish-then-verify), epoch-based reclamation (defer freeing to safe epochs).",
    "Hazard pointers give bounded memory overhead and tolerate stalled threads but have scanning overhead. EBR is faster in practice but a stalled thread prevents all reclamation. Choose based on your thread model.",
    "Treiber stack: single atomic head, push/pop via CAS. Michael-Scott queue: head + tail + sentinel, with a helping mechanism to advance a lagging tail pointer. Both are lock-free.",
    "Memory ordering matters: x86 TSO makes acquire/release essentially free, but ARM/POWER have weak models requiring explicit barriers. Write portable code using C++ memory orderings or Rust's Ordering enum.",
    "Testing lock-free code requires specialized tools: ThreadSanitizer for data races, stress tests with many threads, model checkers (CDSChecker, GenMC), and formal methods (TLA+, SPIN) for correctness proofs.",
  ],

  cheatSheet: [
    "CAS loop: let old = atom.load(Acquire); loop { let new = f(old); match atom.CAS(old, new, AcqRel) { Ok => break, Err(cur) => old = cur } }",
    "Lock-free push (Treiber): new_node.next = head.load(); while !head.CAS(new_node.next, new_node) {}",
    "Lock-free pop (Treiber): loop { old = head.load(); if old == null return None; if head.CAS(old, old.next) return old.data }",
    "MS-queue enqueue: append to tail.next via CAS, then advance tail. If tail.next != null, help advance tail first.",
    "Tagged pointer ABA fix: store (ptr, counter) in atomic; increment counter on every CAS so recycled addresses have different tags.",
    "Hazard pointer protocol: (1) write ptr to HP slot, (2) verify ptr unchanged, (3) access node, (4) clear HP slot. Scan all HPs before freeing retired nodes.",
    "EBR protocol: pin(epoch) before accessing shared data, unpin() after. Retire nodes to current epoch's list. Advance global epoch when all threads have entered current epoch.",
    "Memory ordering minimum: stores that publish data use Release; loads that consume published data use Acquire. Use SeqCst only when total ordering across all atomics is required.",
  ],

  resources: [
    {
      label: "The Art of Multiprocessor Programming by Herlihy & Shavit",
      kind: "book" as const,
      note: "The definitive textbook on concurrent data structures and non-blocking algorithms, covering lock-free and wait-free designs with formal proofs.",
    },
    {
      label: "Hazard Pointers: Safe Memory Reclamation for Lock-Free Objects (Maged Michael, 2004)",
      kind: "paper" as const,
      note: "The original paper introducing hazard pointers for safe memory reclamation in lock-free data structures.",
    },
    {
      label: "Simple, Fast, and Practical Non-Blocking and Blocking Concurrent Queue Algorithms (Michael & Scott, 1996)",
      kind: "paper" as const,
      note: "The seminal paper on the Michael-Scott queue, the most widely used lock-free queue algorithm.",
    },
    {
      label: "Crossbeam - Rust concurrency library",
      kind: "repo" as const,
      note: "Production-quality Rust library providing epoch-based reclamation, lock-free data structures, and scoped threads.",
    },
    {
      label: "CppCon: Lock-Free Programming talks by Herb Sutter and Fedor Pikus",
      kind: "video" as const,
      note: "Excellent conference talks covering practical lock-free programming in C++ with real-world examples and performance analysis.",
    },
    {
      label: "java.util.concurrent.atomic package documentation",
      kind: "docs" as const,
      note: "Official Java documentation for atomic classes including AtomicReference, AtomicStampedReference, and the VarHandle API for lock-free programming.",
    },
  ],

  glossary: [
    {
      term: "CAS (Compare-And-Swap)",
      definition:
        "An atomic CPU instruction that compares a memory location to an expected value and, only if they match, replaces it with a new value. The fundamental building block of most lock-free algorithms.",
    },
    {
      term: "ABA Problem",
      definition:
        "A correctness hazard in CAS-based algorithms where a value changes from A to B and back to A, causing a CAS to falsely succeed because it cannot distinguish the original A from the recycled A.",
    },
    {
      term: "Lock-Free",
      definition:
        "A progress guarantee ensuring that among all concurrently executing threads, at least one will complete its operation in a finite number of steps, regardless of the scheduling or failure of other threads.",
    },
    {
      term: "Wait-Free",
      definition:
        "The strongest non-blocking progress guarantee: every thread will complete its operation in a bounded number of steps, regardless of the behavior of other threads. Eliminates starvation.",
    },
    {
      term: "Obstruction-Free",
      definition:
        "The weakest non-blocking progress guarantee: a thread will complete in finite steps if it executes in isolation. Does not guarantee progress under contention without additional mechanisms like backoff.",
    },
    {
      term: "Hazard Pointer",
      definition:
        "A per-thread pointer that advertises which shared nodes the thread is currently accessing, preventing those nodes from being reclaimed. Provides safe memory reclamation with bounded memory overhead.",
    },
    {
      term: "Epoch-Based Reclamation (EBR)",
      definition:
        "A memory reclamation scheme that defers freeing of retired nodes until all threads have advanced past the epoch in which the node was retired, ensuring no thread holds a stale reference.",
    },
    {
      term: "Memory Ordering",
      definition:
        "Constraints on how memory operations can be reordered by the compiler and CPU. Lock-free algorithms require specific orderings (acquire, release, seq_cst) to ensure inter-thread visibility of shared data.",
    },
    {
      term: "Treiber Stack",
      definition:
        "A lock-free LIFO stack data structure using a single atomic head pointer with CAS-based push and pop operations. One of the simplest and most foundational lock-free data structures.",
    },
    {
      term: "Michael-Scott Queue",
      definition:
        "A lock-free FIFO queue using separate head and tail atomic pointers with a sentinel node. Features a helping mechanism where threads advance a lagging tail pointer. Used in Java's ConcurrentLinkedQueue.",
    },
  ],
  exercises: [
    "Implement a **lock-free counter** in C++ using `std::atomic<int>` and a CAS loop. Then benchmark it against a `std::mutex`-protected counter under *low contention* (2 threads) and *high contention* (16 threads). Explain why the relative performance changes.",
    "The **Treiber stack** shown in the code examples has a memory leak / use-after-free bug in `pop()`. Identify the exact race window that could cause a thread to dereference freed memory. Then sketch how you would fix it using **hazard pointers** -- describe the protocol each thread must follow before accessing a node.",
    "Construct a concrete **ABA problem** scenario for a lock-free stack: write out the step-by-step interleaving of two threads (with memory addresses) that leads to corruption. Then show how a **tagged pointer** (with a 16-bit version counter) prevents the bug by causing the CAS to fail.",
    "Compare **epoch-based reclamation** (EBR) and **hazard pointers** for a lock-free queue used by 64 threads, where some threads may occasionally block for up to 5 seconds on I/O. Which scheme would you choose, and why? What is the worst-case *memory overhead* of each approach in this scenario?",
    "Write a **Michael-Scott queue** `enqueue` operation in pseudocode. Carefully annotate which `std::memory_order` you would use for each atomic operation (*load*, *store*, and *CAS*) and justify each choice. What would break if you used `memory_order_relaxed` everywhere?",
  ],
};
