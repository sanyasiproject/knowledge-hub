import type { TopicContent } from "../types";

export const memoryModels: TopicContent = {
  quickSummary: [
    "Memory models define how a program's data is organized in memory (stack, heap, static segments) and how concurrent threads are allowed to observe each other's writes.",
    "The stack stores local variables and function call frames with automatic LIFO allocation; the heap stores dynamically allocated objects with explicit or GC-managed lifetimes.",
    "Value types (int, struct in C/Go) hold data directly and are copied on assignment; reference types (objects in Java, pointers in C) hold addresses and share the underlying data.",
    "Hardware memory models (x86-TSO, ARM/POWER relaxed) and language memory models (C++11, Java Memory Model) define the ordering guarantees for concurrent reads and writes across cores.",
  ],
  detailed: [
    "A process's virtual address space is divided into several segments. The text (code) segment holds machine instructions and is typically read-only. The data segment holds initialized global and static variables. The BSS segment holds zero-initialized globals. The stack grows downward (on most architectures) and stores local variables, function arguments, and return addresses. The heap occupies the remaining space and grows upward, managed by malloc/free or a garbage collector.",
    "Stack allocation is extremely fast — it only requires adjusting the stack pointer. Each function call pushes a stack frame containing local variables, the saved return address, and the saved base pointer. When the function returns, the frame is popped. This LIFO discipline means stack-allocated data cannot outlive its enclosing function. Stack size is limited (typically 1-8 MB per thread), and exceeding it causes a stack overflow.",
    "Heap allocation (malloc in C, new in Java/C++) is slower because the allocator must search for a free block, manage fragmentation, and (in GC languages) later reclaim unused objects. However, heap objects can outlive the function that created them and can be arbitrarily large. Modern allocators like jemalloc and tcmalloc use thread-local caches, size-class segregation, and arena-based allocation to minimize contention and fragmentation.",
    "Memory alignment is the requirement that data be placed at addresses that are multiples of its size (or a specified boundary). A 4-byte int typically must sit at an address divisible by 4. Misaligned access may cause a hardware fault (ARM), a performance penalty (x86), or undefined behavior (C standard). Compilers insert padding bytes between struct fields to maintain alignment, which can cause a struct's size to exceed the sum of its fields' sizes.",
    "The C/C++ memory model (since C++11/C11) defines the semantics of concurrent memory access. It provides atomic types and memory orderings: seq_cst (sequentially consistent — strongest), acquire/release (for producer-consumer synchronization), and relaxed (no ordering guarantees, only atomicity). The model allows compilers and hardware to reorder non-atomic accesses freely, making data races undefined behavior.",
    "The Java Memory Model (JMM, JSR-133) defines a happens-before relation that determines when a thread is guaranteed to see another thread's writes. Key rules: an unlock of a monitor happens-before every subsequent lock of the same monitor; a write to a volatile field happens-before every subsequent read of that field; thread start/join establish happens-before edges. Without these relationships, the JVM and CPU may reorder operations, leading to surprising results like seeing a partially constructed object.",
  ],
  deepDive: [
    "Hardware memory models vary dramatically. x86 provides Total Store Order (TSO): stores from a single core are seen by all other cores in the order they were issued, and loads are not reordered with earlier loads. This strong model means most x86 programs accidentally work correctly without explicit barriers. ARM and POWER provide much weaker guarantees: both loads and stores can be reordered, and explicit barrier instructions (DMB, DSB, ISB on ARM) are required to enforce ordering. This is why lock-free algorithms that work on x86 may break on ARM.",
    "Store buffers and cache coherence protocols (MESI, MOESI) are the hardware mechanisms behind memory ordering. When a core writes to a cache line, the write enters its store buffer before being committed to L1 cache. Other cores may not see the write until the store buffer is flushed. Memory barriers (mfence on x86, dmb on ARM) force the store buffer to drain, ensuring visibility. The MESI protocol maintains coherence by tracking each cache line's state: Modified, Exclusive, Shared, or Invalid.",
    "False sharing occurs when two threads write to different variables that happen to reside on the same cache line (typically 64 bytes). Each write invalidates the other core's cache line, forcing expensive coherence traffic even though no actual data is shared. The fix is to pad variables to separate cache lines. Java's @Contended annotation and C++'s alignas(64) address this. In performance-critical code, false sharing can reduce throughput by 10-100x.",
    "Escape analysis is a compiler optimization that determines whether an object's reference escapes the method or thread that allocated it. If it does not escape, the compiler can allocate it on the stack instead of the heap (stack allocation), eliminate synchronization on it (lock elision), or break it into its constituent fields (scalar replacement). The JVM's JIT compiler performs escape analysis aggressively, turning many short-lived objects into stack allocations transparently.",
    "Memory-mapped I/O and mmap blur the boundary between memory and storage. mmap maps a file's contents directly into the process's virtual address space; reads and writes to the mapped region are handled by the OS paging system, loading pages from disk on demand and flushing dirty pages back. This is the foundation of memory-mapped databases (LMDB, SQLite WAL mode) and shared-memory IPC. However, it requires careful handling of page faults, which can introduce unpredictable latency.",
  ],
  code: [
    {
      language: "c",
      caption: "Stack vs heap allocation and their lifetimes",
      source: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Returns a pointer to a heap-allocated string (caller must free)
char* create_greeting(const char* name) {
    // Stack allocation: 'buffer' lives only in this function
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Hello, %s!", name);

    // Heap allocation: survives after this function returns
    char* result = malloc(strlen(buffer) + 1);
    if (result) strcpy(result, buffer);
    return result;
    // 'buffer' is gone after return; 'result' persists
}

int main(void) {
    char* msg = create_greeting("Alice");
    printf("%s\\n", msg);  // "Hello, Alice!"
    free(msg);             // Manual deallocation required
    return 0;
}`,
    },
    {
      language: "c",
      caption: "Struct layout, padding, and alignment",
      source: `#include <stdio.h>
#include <stddef.h>

// Without packing, the compiler inserts padding for alignment
struct Padded {
    char  a;    // 1 byte  + 3 bytes padding (align next to 4)
    int   b;    // 4 bytes
    char  c;    // 1 byte  + 3 bytes padding (align struct to 4)
};  // Total: 12 bytes, not 6

// Reordering fields to minimize padding
struct Packed {
    int   b;    // 4 bytes
    char  a;    // 1 byte
    char  c;    // 1 byte + 2 bytes padding (align struct to 4)
};  // Total: 8 bytes

int main(void) {
    printf("sizeof(Padded) = %zu\\n", sizeof(struct Padded));  // 12
    printf("sizeof(Packed) = %zu\\n", sizeof(struct Packed));  // 8

    // Verify offsets
    printf("Padded.a offset: %zu\\n", offsetof(struct Padded, a));  // 0
    printf("Padded.b offset: %zu\\n", offsetof(struct Padded, b));  // 4
    printf("Padded.c offset: %zu\\n", offsetof(struct Padded, c));  // 8
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "C++11 memory ordering: acquire/release for producer-consumer",
      source: `#include <atomic>
#include <thread>
#include <cassert>

std::atomic<int>  data{0};
std::atomic<bool> ready{false};

void producer() {
    data.store(42, std::memory_order_relaxed);      // (1) write data
    ready.store(true, std::memory_order_release);    // (2) release: all
    // writes before (2) are visible to any thread
    // that reads 'ready' with acquire ordering
}

void consumer() {
    while (!ready.load(std::memory_order_acquire))   // (3) acquire: see
        ;  // spin                                    // all writes before
                                                      // the matching release
    assert(data.load(std::memory_order_relaxed) == 42); // guaranteed
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);
    t1.join();
    t2.join();
    return 0;
}`,
    },
    {
      language: "java",
      caption: "Java Memory Model: volatile and happens-before",
      source: `public class VolatileExample {
    // Without volatile, the reader thread may never see updated = true
    // because the JIT may cache the value in a register or reorder reads.
    private static volatile boolean updated = false;
    private static int value = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread writer = new Thread(() -> {
            value = 42;           // (1) ordinary write
            updated = true;       // (2) volatile write -- creates
            // a happens-before edge to any subsequent volatile read
        });

        Thread reader = new Thread(() -> {
            while (!updated) {    // (3) volatile read -- acquires
                Thread.yield();   // all writes before the matching
            }                     // volatile write
            // Guaranteed to see value == 42 because (1) happens-before
            // (2) and (2) happens-before (3)
            System.out.println("Value: " + value);  // 42
        });

        reader.start();
        writer.start();
        reader.join();
        writer.join();
    }
}`,
    },
    {
      language: "rust",
      caption: "Ownership and borrowing: compile-time memory safety",
      source: `use std::collections::HashMap;

fn main() {
    // Ownership: each value has exactly one owner
    let mut scores: HashMap<String, i32> = HashMap::new();

    // Inserting transfers ownership of the String keys
    scores.insert(String::from("Alice"), 100);
    scores.insert(String::from("Bob"), 85);

    // Immutable borrow: multiple readers, no writers
    let alice_score = scores.get("Alice"); // &Option<&i32>
    println!("Alice: {:?}", alice_score);

    // Mutable borrow: one writer, no readers
    // The immutable borrow 'alice_score' must not be used after this
    scores.entry(String::from("Alice")).and_modify(|s| *s += 10);
    println!("Updated scores: {:?}", scores);

    // Box<T>: heap allocation with single ownership
    let boxed = Box::new([0u8; 1_000_000]); // 1 MB on the heap
    println!("Boxed array length: {}", boxed.len());
    // Automatically freed when 'boxed' goes out of scope
}`,
    },
    {
      language: "go",
      caption: "Value types vs reference types in Go",
      source: `package main

import "fmt"

type Point struct {
    X, Y int
}

func main() {
    // Structs are value types: assignment copies
    a := Point{1, 2}
    b := a          // b is an independent copy
    b.X = 99
    fmt.Println(a)  // {1 2} -- unchanged
    fmt.Println(b)  // {99 2}

    // Slices are reference types: they share underlying array
    s1 := []int{1, 2, 3}
    s2 := s1        // s2 shares the same backing array
    s2[0] = 99
    fmt.Println(s1) // [99 2 3] -- changed!

    // Maps are reference types too
    m1 := map[string]int{"a": 1}
    m2 := m1
    m2["b"] = 2
    fmt.Println(m1) // map[a:1 b:2] -- m1 sees m2's write

    // Use pointer for shared mutable access to value types
    p := &a
    p.Y = 100
    fmt.Println(a)  // {1 100} -- modified via pointer
}`,
    },
    {
      language: "c",
      caption: "False sharing: demonstrating cache-line contention",
      source: `#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <time.h>

#define ITERATIONS 100000000

// BAD: two counters on the same cache line (64 bytes)
struct SharedLine {
    long counter_a;  // offset 0
    long counter_b;  // offset 8 -- same cache line!
};

// GOOD: padded to separate cache lines
struct PaddedLine {
    long counter_a;
    char _pad[56];   // push counter_b to the next 64-byte line
    long counter_b;
};

void* increment_a(void* arg) {
    long* counter = (long*)arg;
    for (long i = 0; i < ITERATIONS; i++) (*counter)++;
    return NULL;
}

void* increment_b(void* arg) {
    long* counter = (long*)arg;
    for (long i = 0; i < ITERATIONS; i++) (*counter)++;
    return NULL;
}

int main(void) {
    struct PaddedLine padded = {0, {0}, 0};
    pthread_t t1, t2;
    struct timespec start, end;

    clock_gettime(CLOCK_MONOTONIC, &start);
    pthread_create(&t1, NULL, increment_a, &padded.counter_a);
    pthread_create(&t2, NULL, increment_b, &padded.counter_b);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    clock_gettime(CLOCK_MONOTONIC, &end);

    double elapsed = (end.tv_sec - start.tv_sec) +
                     (end.tv_nsec - start.tv_nsec) / 1e9;
    printf("Padded: %.3f seconds\\n", elapsed);
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Process Virtual Address Space Layout",
      kind: "architecture",
      caption: "Virtual address space from low to high addresses showing all segments, heap growth direction, and per-thread stacks.",
      mermaid: `graph TD
    HIGH["High Addresses - Kernel Space reserved"]
    TSTK["Thread Stacks - one per thread grows downward"]
    MMAP["Memory-Mapped Region - shared libs and mmap"]
    HEAP["Heap - grows upward via malloc and new - shared across threads"]
    BSS["BSS - zero-initialised global and static variables"]
    DATA["Data - initialised global and static variables"]
    TEXT["Text - read-only executable code"]
    LOW["Low Addresses - NULL page - unmapped to catch null dereference"]
    HIGH --> TSTK --> MMAP --> HEAP --> BSS --> DATA --> TEXT --> LOW`,
    },
    {
      title: "Happens-Before in Java Memory Model",
      kind: "sequence",
      caption: "How a volatile write by Thread A establishes a happens-before edge ensuring Thread B sees all preceding writes.",
      mermaid: `sequenceDiagram
    participant A as Thread A - Producer
    participant JMM as Java Memory Model
    participant B as Thread B - Consumer

    A->>A: data = 42
    A->>A: result = compute()
    A->>JMM: volatile flag = true - release write
    Note over A,JMM: All prior writes flushed before volatile store
    B->>JMM: read volatile flag - acquire read
    Note over B,JMM: Spin until flag is true
    JMM-->>B: flag = true
    B->>B: read data
    B->>B: read result
    Note over B: Guaranteed to see data=42 and result via happens-before`,
    },
    {
      title: "Store Buffer Reordering on Weak Memory Models",
      kind: "flow",
      caption: "How store buffers on ARM can cause writes to appear out of order to other cores, and how a memory barrier prevents this.",
      mermaid: `flowchart TD
    A["Core 0: Write X = 1"] --> B["Write enters Core 0 store buffer - not yet visible"]
    B --> C["Core 0: Write Y = 1"] --> D["Write enters store buffer"]
    D --> E["Core 1: Read Y"]
    E --> F{"Y visible\nfrom store buffer?"}
    F -->|Yes Y=1 committed first| G["Core 1 reads Y = 1"]
    F -->|No| H["Core 1 reads Y = 0"]
    G --> I["Core 1: Read X"]
    I --> J["X may still be 0 - still in Core 0 store buffer"]
    J --> K["Inconsistency - saw Y=1 but X=0"]
    L["Insert DMB barrier between writes on Core 0"] --> M["Store buffer drains in order before barrier completes"]
    M --> N["Core 1 sees X=1 before Y=1 - consistent"]`,
    },
    {
      title: "Memory Ordering Levels",
      kind: "mindmap",
      caption: "C++ memory ordering levels from most relaxed to sequentially consistent with guarantees and typical use cases.",
      mermaid: `mindmap
  root((C++ Memory Ordering))
    memory_order_relaxed
      No synchronisation guarantee
      Only atomicity
      Use for counters with no ordering needed
    memory_order_acquire
      Load with acquire semantics
      No reads or writes reordered before this load
      Pairs with a release store
    memory_order_release
      Store with release semantics
      No reads or writes reordered after this store
      Pairs with an acquire load
    memory_order_acq_rel
      Read-modify-write operations
      Both acquire and release
      fetch_add on shared counters
    memory_order_seq_cst
      Total global order across all threads
      Most expensive - default for std::atomic
      Use when unsure`,
    },
  ],
  animations: [
    {
      title: "Stack Frame Lifecycle During Function Calls",
      steps: [
        { label: "main() called", detail: "The OS pushes main's stack frame: return address, saved base pointer, and local variables (e.g., int x = 10). The stack pointer (SP) moves downward." },
        { label: "foo(x) called from main", detail: "The argument x is pushed (or passed in a register). A new frame is pushed for foo(): return address, saved BP, and foo's locals. SP moves down further." },
        { label: "bar() called from foo", detail: "Another frame is pushed for bar(). Each frame is a contiguous block. The call stack now has three frames: main -> foo -> bar." },
        { label: "bar() returns", detail: "bar's frame is popped: SP moves back up, and control returns to foo(). bar's local variables are now invalid (the memory may be reused)." },
        { label: "foo() returns", detail: "foo's frame is popped similarly. The return value is placed in a register (or on the stack per calling convention). Control returns to main()." },
        { label: "Observation", detail: "Stack allocation is O(1) — just adjust SP. Deallocation is automatic on return. But stack-allocated data cannot outlive its frame, and stack size is limited." },
      ],
    },
    {
      title: "Store Buffer and Memory Barrier on ARM",
      steps: [
        { label: "Core 0 writes X = 1", detail: "The write enters Core 0's store buffer. It is NOT yet visible to other cores. Core 0 can see its own write via store-buffer forwarding." },
        { label: "Core 0 writes Y = 1", detail: "This write also enters the store buffer. The hardware may commit these writes to cache in any order on weakly-ordered architectures like ARM." },
        { label: "Core 1 reads Y", detail: "Core 1 might see Y = 1 (if that write was committed first) but still see X = 0 (if X's write is still in Core 0's store buffer). This is a real reordering." },
        { label: "Insert DMB barrier", detail: "A DMB (Data Memory Barrier) instruction on Core 0 between the two writes forces the store buffer to drain in order. X = 1 is committed before Y = 1." },
        { label: "Core 1 reads Y = 1 after barrier", detail: "Now if Core 1 sees Y = 1, it is guaranteed to also see X = 1, because the barrier enforced ordering. This is the acquire/release pattern at the hardware level." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "C/C++", "Java", "Rust", "Go", "Python"],
    rows: [
      ["Stack allocation", "Automatic for locals", "Primitives on stack, objects on heap", "Automatic for locals, Box<T> for heap", "Automatic for locals, escape analysis may heap-allocate", "Everything on heap (CPython)"],
      ["Heap allocation", "malloc/free (manual)", "new + GC (automatic)", "Box::new, Vec, etc. (ownership)", "make/new + GC", "All objects heap-allocated"],
      ["Memory safety", "Programmer responsibility (UB risk)", "GC + bounds checks (safe)", "Ownership + borrow checker (safe, no GC)", "GC + bounds checks (safe)", "GC + managed runtime (safe)"],
      ["Concurrency model", "Atomics + memory_order (C++11)", "volatile + synchronized + JMM", "Send/Sync traits + ownership", "Goroutines + channels + sync pkg", "GIL prevents true parallelism"],
      ["Value vs reference", "Structs = value, pointers = reference", "Primitives = value, objects = reference", "All types = value by default, references explicit", "Structs = value, slices/maps/channels = reference", "Everything = reference"],
      ["False sharing mitigation", "alignas(64), __attribute__((aligned))", "@Contended annotation", "repr(align(64))", "Struct padding manually", "Not a practical concern (GIL)"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between stack and heap memory?",
      a: "The stack is a LIFO (last-in, first-out) region for local variables and function frames. Allocation is O(1) — just move the stack pointer. It is automatically freed when a function returns. The heap is a general-purpose region for dynamically allocated objects. Allocation requires finding a free block (slower), and deallocation is either manual (C/C++) or handled by a garbage collector. Heap objects can outlive the function that created them but risk fragmentation and memory leaks.",
      followUps: [
        "What causes a stack overflow?",
        "How do modern allocators like jemalloc reduce heap fragmentation?",
      ],
    },
    {
      q: "What is memory alignment and why does it matter?",
      a: "Alignment is the requirement that a data type be stored at a memory address divisible by its size (or a specified boundary). A 4-byte int should be at an address divisible by 4. Aligned access is faster because the CPU can fetch the data in a single memory transaction. Misaligned access may cause a fault (ARM), require two memory reads (x86), or be undefined behavior. Compilers insert padding bytes in structs to maintain alignment.",
      followUps: [
        "How can you minimize struct padding?",
        "What does __attribute__((packed)) do in GCC?",
      ],
    },
    {
      q: "Explain the Java Memory Model's happens-before relationship.",
      a: "The happens-before relation defines which writes are guaranteed to be visible to which reads. Key rules: (1) program order — each action in a thread happens-before the next, (2) monitor lock — unlock happens-before subsequent lock of the same monitor, (3) volatile write happens-before subsequent volatile read of the same variable, (4) thread start/join. Without a happens-before edge, the JVM and hardware may reorder operations, meaning Thread B might see stale or partially written values from Thread A.",
      followUps: [
        "What is the difference between volatile and synchronized in Java?",
        "Can the JVM reorder operations within a single thread?",
      ],
    },
    {
      q: "What is false sharing and how do you prevent it?",
      a: "False sharing occurs when two threads modify independent variables that share the same cache line (typically 64 bytes). Each write invalidates the other core's copy of the entire cache line, causing expensive coherence traffic despite no actual data sharing. Prevention: pad variables to separate cache lines using alignas(64) in C++, @Contended in Java, or manual struct padding. In benchmarks, false sharing can degrade performance by 10-100x.",
      followUps: [
        "What is the MESI cache coherence protocol?",
        "How can you detect false sharing in production?",
      ],
    },
    {
      q: "How does Rust prevent memory bugs without garbage collection?",
      a: "Rust uses an ownership system enforced at compile time. Each value has exactly one owner; when the owner goes out of scope, the value is dropped (freed). References are either shared (&T, read-only, many allowed) or exclusive (&mut T, read-write, only one at a time). The borrow checker verifies that references never outlive the data they point to (lifetimes) and that shared and exclusive borrows never coexist. This prevents use-after-free, double-free, and data races statically.",
      followUps: [
        "What is a lifetime annotation in Rust?",
        "When would you use unsafe in Rust?",
      ],
    },
    {
      q: "What is escape analysis and how does it optimize memory allocation?",
      a: "Escape analysis determines whether a reference to an object escapes the method or thread that allocated it. If it does not escape, the JIT compiler can: (1) stack-allocate the object instead of heap-allocating it, eliminating GC pressure, (2) eliminate synchronization on the object (lock elision), or (3) decompose the object into its individual fields (scalar replacement). The JVM HotSpot JIT, Go compiler, and GraalVM all perform escape analysis.",
    },
  ],
  followUps: [
    "Study garbage collection algorithms (mark-and-sweep, generational, concurrent) as the heap management layer above memory models.",
    "Explore lock-free data structures and how they depend on specific memory ordering guarantees.",
    "Learn about memory-mapped I/O (mmap) and its use in databases and IPC.",
    "Investigate NUMA (Non-Uniform Memory Access) architectures and their impact on memory-intensive applications.",
    "Understand how virtual memory, page tables, and TLBs translate virtual addresses to physical addresses.",
  ],
  mcqs: [
    {
      q: "What is the default memory ordering for std::atomic operations in C++?",
      options: ["relaxed", "acquire", "release", "seq_cst"],
      answerIndex: 3,
      explanation: "The default memory ordering for C++ atomics is memory_order_seq_cst (sequentially consistent), which is the strongest ordering and easiest to reason about, but potentially the slowest.",
    },
    {
      q: "In the Java Memory Model, which of the following does NOT establish a happens-before relationship?",
      options: [
        "volatile write followed by volatile read of the same variable",
        "Monitor unlock followed by monitor lock",
        "Two ordinary (non-volatile, non-synchronized) writes to the same variable",
        "Thread.start() and the started thread's first action",
      ],
      answerIndex: 2,
      explanation: "Ordinary writes without synchronization do not establish happens-before relationships. This is why data races on non-volatile, non-synchronized fields can lead to seeing stale or partially written values.",
    },
    {
      q: "What causes false sharing?",
      options: [
        "Two threads sharing a lock",
        "Two threads writing to different variables on the same cache line",
        "A thread reading its own write from a store buffer",
        "Two threads reading the same variable simultaneously",
      ],
      answerIndex: 1,
      explanation: "False sharing occurs when independent variables share a cache line. Each write invalidates the entire line on other cores, causing unnecessary coherence traffic even though no data is actually shared.",
    },
    {
      q: "What does Rust's borrow checker prevent?",
      options: [
        "Stack overflow",
        "Use-after-free, double-free, and data races",
        "Integer overflow",
        "Deadlocks",
      ],
      answerIndex: 1,
      explanation: "The borrow checker enforces ownership and borrowing rules at compile time, preventing use-after-free, double-free, dangling references, and data races. It does not prevent stack overflow, integer overflow, or deadlocks.",
    },
    {
      q: "Why might a struct's sizeof be larger than the sum of its fields' sizes?",
      options: [
        "The compiler adds a vtable pointer",
        "The compiler inserts padding bytes for memory alignment",
        "The struct includes a hidden reference count",
        "The compiler reserves space for future fields",
      ],
      answerIndex: 1,
      explanation: "Compilers insert padding bytes between fields (and at the end of the struct) to ensure each field meets its alignment requirement. This can cause sizeof(struct) to exceed the sum of individual field sizes.",
    },
    {
      q: "What does x86-TSO guarantee that ARM does not?",
      options: [
        "Atomic 64-bit loads",
        "Stores from a single core are seen by all cores in program order",
        "Cache coherence",
        "Virtual memory support",
      ],
      answerIndex: 1,
      explanation: "x86 Total Store Order (TSO) guarantees that stores from a single core are seen by all other cores in the order they were issued. ARM's weaker model allows store reordering, requiring explicit barrier instructions.",
    },
  ],
  exercises: [
    "Write a C program that demonstrates the difference between stack and heap allocation by allocating a large array on each. Measure the allocation time using clock_gettime. Then intentionally cause a stack overflow and observe the error.",
    "Create a C struct with fields of varying sizes (char, int, double, short) in two different orderings. Use sizeof and offsetof to show how field order affects padding and total struct size. Find the order that minimizes padding.",
    "Write a multithreaded C++ program that demonstrates a data race on a non-atomic variable, then fix it using std::atomic with acquire/release ordering. Verify with ThreadSanitizer (compile with -fsanitize=thread).",
    "Implement a simple arena allocator in C: pre-allocate a large block and hand out sub-blocks via pointer bumping. Compare its allocation speed to malloc for 1 million small allocations.",
    "Write a Java program that demonstrates the effect of volatile: one thread writes a flag, another thread reads it. Show that without volatile, the reader may spin forever due to the JIT caching the value in a register.",
  ],
  flashcards: [
    { front: "What is the stack used for?", back: "Local variables, function call frames (return address, saved registers, arguments). LIFO allocation/deallocation, very fast (just adjust SP), but limited in size and lifetime." },
    { front: "What is the heap used for?", back: "Dynamically allocated objects that need to outlive the creating function or whose size is unknown at compile time. Slower allocation, requires explicit free or garbage collection." },
    { front: "What is memory alignment?", back: "The requirement that data be stored at addresses divisible by its size (e.g., 4-byte int at address divisible by 4). Ensures efficient single-transaction CPU access." },
    { front: "What is the MESI protocol?", back: "A cache coherence protocol with four states per cache line: Modified (dirty, exclusive), Exclusive (clean, exclusive), Shared (clean, copies exist), Invalid (stale). Ensures all cores see a consistent view of memory." },
    { front: "What does 'seq_cst' memory ordering mean?", back: "Sequentially consistent: all threads agree on a single total order of all seq_cst operations. The strongest ordering guarantee, easiest to reason about, but may incur the most hardware barriers." },
    { front: "What is a store buffer?", back: "A hardware queue between a CPU core and its L1 cache. Writes enter the store buffer and are visible to the local core immediately but to other cores only after the buffer drains to cache." },
    { front: "What is escape analysis?", back: "A compiler optimization that determines if an object's reference escapes its creating method/thread. If it does not, the object can be stack-allocated, its locks elided, or its fields scalar-replaced." },
    { front: "What is false sharing?", back: "When independent variables on the same cache line are written by different threads, causing unnecessary cache-line invalidations and coherence traffic despite no actual data sharing." },
  ],
  revisionNotes: [
    "Process memory layout (low to high): Text, Data, BSS, Heap (grows up), free space, Stack (grows down).",
    "Stack: LIFO, O(1) alloc/dealloc, limited size (~1-8 MB/thread), automatic lifetime. Heap: arbitrary lifetime, slower alloc, fragmentation risk.",
    "Alignment: fields placed at addresses divisible by their size. Compiler inserts padding. Reorder fields largest-first to minimize padding.",
    "C++11 memory orderings (weak to strong): relaxed, acquire, release, acq_rel, seq_cst. Default is seq_cst.",
    "Java Memory Model: happens-before via volatile, synchronized, Thread.start/join. Without HB edges, reads may see stale values.",
    "x86-TSO is relatively strong (stores ordered per core). ARM/POWER are weak (stores and loads may reorder). Write portable code using language-level atomics, not hardware assumptions.",
    "False sharing: pad hot variables to separate 64-byte cache lines. Use @Contended (Java), alignas(64) (C++), or repr(align(64)) (Rust).",
  ],
  cheatSheet: [
    "Stack allocation: extremely fast (move SP), automatic deallocation, limited size. Use for small, short-lived data.",
    "Heap allocation: malloc/new, slower, requires free/GC, unlimited size. Use for dynamic-lifetime or large data.",
    "Struct padding rule: each field aligned to its own size; total struct size rounded up to the largest field's alignment.",
    "C++ atomics: std::atomic<T> with memory_order_{relaxed, acquire, release, acq_rel, seq_cst}.",
    "Java volatile: guarantees visibility (happens-before) and prevents reordering. NOT atomic for compound ops like ++.",
    "Rust ownership: one owner, move semantics. &T = shared borrow (many), &mut T = exclusive borrow (one). Lifetimes prevent dangling refs.",
    "Cache line: typically 64 bytes. False sharing = independent data on same line. Fix with padding/alignment.",
    "Memory barriers: mfence (x86), dmb/dsb/isb (ARM), __sync_synchronize (GCC builtin).",
    "Escape analysis: JVM/Go can stack-allocate non-escaping objects, eliminating GC pressure.",
  ],
  resources: [
    { label: "What Every Programmer Should Know About Memory by Ulrich Drepper", kind: "paper", note: "Comprehensive (114-page) deep dive into CPU caches, NUMA, memory ordering, and optimization techniques. Free PDF." },
    { label: "C++ Concurrency in Action by Anthony Williams", kind: "book", note: "Definitive guide to the C++ memory model, atomics, lock-free programming, and concurrent data structures." },
    { label: "Java Memory Model FAQ by Jeremy Manson and Brian Goetz", kind: "article", note: "Official FAQ explaining happens-before, volatile, final field semantics, and common JMM pitfalls." },
    { label: "The Rustonomicon", kind: "docs", note: "Official guide to unsafe Rust, covering raw pointers, memory layout, aliasing rules, and FFI. Essential for systems-level Rust." },
    { label: "A Primer on Memory Consistency and Cache Coherence (Morgan & Claypool)", kind: "book", note: "Graduate-level text covering TSO, relaxed consistency, MESI/MOESI protocols, and formal memory model specifications." },
    { label: "Jeff Preshing's Blog on Lock-Free Programming", kind: "article", note: "Excellent series of articles explaining memory ordering, barriers, and lock-free algorithms with clear diagrams." },
  ],
  glossary: [
    { term: "Stack Frame", definition: "A contiguous block of memory on the stack containing a function's local variables, arguments, return address, and saved registers. Created on function entry, destroyed on return." },
    { term: "Heap Fragmentation", definition: "The condition where free heap memory is divided into many small non-contiguous blocks, making it impossible to satisfy large allocation requests even though total free memory is sufficient." },
    { term: "Cache Line", definition: "The smallest unit of data transfer between main memory and CPU cache, typically 64 bytes on modern x86 and ARM processors." },
    { term: "Memory Barrier (Fence)", definition: "A CPU instruction that enforces ordering constraints on memory operations, preventing the hardware from reordering loads and stores across the barrier." },
    { term: "Happens-Before", definition: "A partial order relation in a memory model that guarantees visibility: if action A happens-before action B, then B is guaranteed to see the effects of A." },
    { term: "Store Buffer", definition: "A hardware FIFO queue between a CPU core and its cache. Writes are buffered here before being committed to the cache hierarchy, allowing the core to continue executing without waiting." },
    { term: "False Sharing", definition: "A performance pathology where threads writing to independent variables on the same cache line cause unnecessary cache coherence traffic, severely degrading throughput." },
    { term: "Escape Analysis", definition: "A compiler optimization that determines whether an object reference escapes its creating scope, enabling stack allocation, lock elision, or scalar replacement for non-escaping objects." },
    { term: "Total Store Order (TSO)", definition: "A memory consistency model (used by x86) that guarantees stores from a single core are seen by all other cores in program order, while allowing a core's loads to be satisfied from its own store buffer." },
  ],
};
