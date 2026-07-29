import type { TopicContent } from "../types";

export const garbageCollection: TopicContent = {
  quickSummary: [
    "Garbage collection (GC) automatically reclaims memory occupied by objects that are no longer reachable, eliminating manual free/delete and preventing use-after-free and double-free bugs.",
    "The two foundational strategies are reference counting (track how many references point to each object) and tracing (start from root references and mark everything reachable; sweep the rest).",
    "Modern GCs are generational (most objects die young), concurrent (collect while the application runs), and incremental (break work into small steps to reduce pause times).",
  ],
  detailed: [
    "Reference counting assigns a counter to each object. When a new reference is created, the counter increments; when a reference is dropped, it decrements. When the counter reaches zero, the object is freed immediately. CPython, Objective-C (ARC), Rust's Rc/Arc, and Swift use reference counting.",
    "The fatal flaw of simple reference counting is cycles: if A references B and B references A, both counters stay at 1 even when no external references exist. CPython solves this with a separate cycle detector that periodically traces objects that participate in cycles.",
    "Mark-and-sweep is the simplest tracing collector. Phase 1 (mark): starting from roots (stack variables, global variables, registers), traverse all reachable objects and mark them. Phase 2 (sweep): scan the entire heap and free unmarked objects. This requires stopping the application (stop-the-world pause).",
    "Mark-and-compact extends mark-and-sweep by moving surviving objects to one end of the heap after marking, eliminating fragmentation. This enables fast bump-pointer allocation but requires updating all references to moved objects.",
    "Generational GC exploits the generational hypothesis: most objects die young. The heap is divided into generations (young/eden, old/tenured). Young-generation collections are frequent and fast (few survivors); objects that survive multiple young collections are promoted to the old generation, which is collected less frequently.",
    "Concurrent and incremental collectors reduce pause times by performing GC work alongside application threads. The challenge is keeping the object graph consistent while the application mutates it. Write barriers (code inserted at every reference write) notify the GC of changes.",
    "GC roots are the starting points for tracing: local variables on thread stacks, CPU registers, global/static variables, JNI references (in Java), and finalizer queues. Anything not reachable from a root is garbage.",
    "Weak references point to an object without preventing its collection. When the GC collects the referent, the weak reference is automatically nullified. They are used for caches, observer lists, and canonicalization maps (e.g., Java WeakHashMap).",
  ],
  deepDive: [
    "The JVM's G1 (Garbage-First) collector divides the heap into equal-sized regions. It prioritizes collecting regions with the most garbage (hence 'garbage-first'). G1 performs concurrent marking, then evacuates live objects from selected regions during a short pause. It targets configurable pause-time goals (-XX:MaxGCPauseMillis).",
    "ZGC (Java 15+) and Shenandoah are ultra-low-pause collectors. ZGC uses colored pointers (metadata bits in the pointer itself) and load barriers to relocate objects concurrently, achieving sub-millisecond pauses even on multi-terabyte heaps. Shenandoah uses Brooks forwarding pointers.",
    "Go's GC is a concurrent, tri-color mark-and-sweep collector. It uses a write barrier to maintain the tri-color invariant (no black object points directly to a white object). Go targets sub-millisecond pauses and tunes automatically based on GOGC (the ratio of new heap to live heap that triggers a collection).",
    "Tri-color marking classifies objects as white (not yet seen), gray (seen but children not yet scanned), or black (seen and all children scanned). The invariant is that no black object points to a white object. Write barriers maintain this invariant when the mutator modifies references during concurrent marking.",
    "Finalization and destructors interact awkwardly with GC. Finalizers (Java finalize(), Python __del__) run after the GC determines an object is unreachable, but before the memory is freed. They can resurrect objects, delay collection, and run in unpredictable order. Modern practice favors explicit cleanup (try-with-resources, using, defer) over finalizers.",
    "Generational GC uses card tables or remembered sets to track old-to-young references. When an old-generation object is modified to point to a young-generation object, a write barrier marks the corresponding card/entry. During young-gen collection, only marked cards need scanning, avoiding a full heap traversal.",
  ],
  code: [
    {
      language: "python",
      caption: "Reference counting and cycle detection in CPython",
      source: `import sys
import gc

# Reference counting
a = [1, 2, 3]
print(sys.getrefcount(a))  # 2 (a + getrefcount's temporary ref)

b = a                       # refcount -> 3
del a                       # refcount -> 2
del b                       # refcount -> 1 (only getrefcount's ref)
                            # -> 0 when getrefcount returns -> freed

# Cycle: reference counting alone can't free these
class Node:
    def __init__(self):
        self.ref = None

x = Node()
y = Node()
x.ref = y
y.ref = x    # cycle: x -> y -> x
del x, y     # refcount of both is 1 (not 0), not freed!

# CPython's cycle detector handles this
gc.collect()  # forces cycle detection; frees x and y
print(gc.get_stats())  # shows collection statistics per generation`,
    },
    {
      language: "java",
      caption: "GC tuning and weak references in Java",
      source: `import java.lang.ref.WeakReference;
import java.lang.ref.SoftReference;
import java.util.WeakHashMap;

public class GCDemo {
    public static void main(String[] args) {
        // Strong reference: prevents GC
        Object strong = new Object();

        // Weak reference: collected at next GC
        WeakReference<Object> weak = new WeakReference<>(new Object());
        System.gc();
        System.out.println(weak.get());  // likely null

        // Soft reference: collected only under memory pressure
        SoftReference<byte[]> cache = new SoftReference<>(new byte[1024 * 1024]);

        // WeakHashMap: entries removed when keys are GC'd
        WeakHashMap<Object, String> map = new WeakHashMap<>();
        Object key = new Object();
        map.put(key, "value");
        key = null;  // key is now weakly reachable
        System.gc();
        System.out.println(map.size());  // likely 0
    }
}

// JVM GC flags:
// -XX:+UseG1GC               (G1 collector)
// -XX:MaxGCPauseMillis=200   (target pause time)
// -XX:+UseZGC                (ZGC: sub-ms pauses)
// -Xms512m -Xmx4g            (heap size bounds)
// -verbose:gc                 (GC logging)`,
    },
    {
      language: "go",
      caption: "Go's GC behavior and runtime controls",
      source: `package main

import (
	"fmt"
	"runtime"
	"runtime/debug"
)

func main() {
	// Print GC statistics
	var stats debug.GCStats
	debug.ReadGCStats(&stats)
	fmt.Println("GC pauses:", stats.PauseTotal)

	// GOGC controls GC frequency: ratio of new heap to live heap
	// Default: 100 (collect when heap doubles)
	debug.SetGCPercent(50) // collect more frequently (less memory, more CPU)

	// Force a GC cycle
	runtime.GC()

	// Get memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	fmt.Printf("HeapAlloc: %d MB\\n", m.HeapAlloc/1024/1024)
	fmt.Printf("NumGC: %d\\n", m.NumGC)
	fmt.Printf("PauseTotalNs: %d ms\\n", m.PauseTotalNs/1_000_000)
}`,
    },
    {
      language: "rust",
      caption: "Rust: no GC -- ownership and RAII instead",
      source: `use std::rc::Rc;       // single-threaded reference counting
use std::sync::Arc;     // thread-safe reference counting
use std::cell::RefCell;

fn main() {
    // Ownership: exactly one owner; dropped when owner goes out of scope
    {
        let s = String::from("hello");
        // s is dropped here -- deterministic, no GC
    }

    // Rc: shared ownership via reference counting (single-threaded)
    let a = Rc::new(vec![1, 2, 3]);
    let b = Rc::clone(&a);  // refcount = 2
    println!("{}", Rc::strong_count(&a));  // 2
    drop(b);                               // refcount = 1
    drop(a);                               // refcount = 0, freed

    // Arc: like Rc but atomic (thread-safe)
    let shared = Arc::new(42);
    let clone = Arc::clone(&shared);

    // Weak: non-owning reference, prevents cycles
    let strong = Rc::new(RefCell::new(5));
    let weak = Rc::downgrade(&strong);
    // weak.upgrade() returns Option<Rc<_>> -- None if strong is dropped
}`,
    },
  ],
  diagrams: [
    {
      title: "Generational heap layout",
      kind: "architecture",
      caption: "Heap divided into young generation (Eden + two survivor spaces) and old generation. Objects are allocated in Eden, promoted to survivor, then to old gen after surviving multiple collections.",
    },
    {
      title: "Tri-color marking",
      kind: "flow",
      caption: "Objects start white. Roots are grayed. Gray objects have their children grayed and themselves blackened. When no gray objects remain, all white objects are garbage.",
    },
  ],
  animations: [
    {
      title: "Mark-and-sweep GC cycle",
      steps: [
        { label: "Roots identified", detail: "The GC pauses the application and identifies root references: stack variables, globals, CPU registers." },
        { label: "Mark phase begins", detail: "Starting from roots, the GC traverses references and marks every reachable object as 'alive'." },
        { label: "Transitive closure", detail: "Marking continues recursively: each marked object's references are followed and their targets marked." },
        { label: "Mark phase complete", detail: "All reachable objects are marked. Unmarked objects are unreachable garbage." },
        { label: "Sweep phase", detail: "The GC scans the entire heap. Unmarked objects are freed; marked objects have their marks cleared for the next cycle." },
        { label: "Application resumes", detail: "Memory is reclaimed. The application continues until the next GC trigger (allocation threshold)." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Reference Counting", "Mark-and-Sweep", "Generational", "Concurrent (G1/ZGC)"],
    rows: [
      ["Collection timing", "Immediate (at refcount=0)", "When heap threshold hit", "Young: frequent; Old: rare", "Continuous, concurrent"],
      ["Pause time", "None (incremental)", "Long (stop-the-world)", "Short young pauses", "Sub-millisecond (ZGC)"],
      ["Handles cycles", "No (needs separate detector)", "Yes", "Yes", "Yes"],
      ["Throughput", "Overhead on every assign", "Good batch throughput", "Excellent (fast young GC)", "Slight overhead from barriers"],
      ["Fragmentation", "Can fragment", "Can fragment (mark-compact fixes)", "Compacts young gen", "Region-based compaction"],
      ["Examples", "CPython, Swift, Rust Rc", "Early JVMs, Lua", "JVM young gen, .NET Gen0/1/2", "JVM G1/ZGC, Go"],
    ],
  },
  interviewQA: [
    {
      q: "How does generational garbage collection work and why is it effective?",
      a: "Generational GC divides the heap into young and old generations based on the generational hypothesis: most objects die young. New objects are allocated in the young generation, which is collected frequently and cheaply (few survivors to copy). Objects that survive multiple young collections are promoted to the old generation, which is collected less often. This is effective because young-gen collection only needs to trace a small portion of the heap.",
      followUps: [
        "What are remembered sets? (Data structures tracking old-to-young references so young-gen collection does not need to scan the entire old generation.)",
        "What triggers a full GC? (When the old generation fills up, or System.gc() is called.)",
      ],
    },
    {
      q: "What is the difference between a weak reference and a soft reference?",
      a: "A weak reference does not prevent GC -- the referent is collected at the next GC cycle. A soft reference is stronger: the referent is kept alive as long as there is sufficient memory, and only collected when the JVM is under memory pressure. Soft references are ideal for caches; weak references for canonical maps and observer patterns.",
    },
    {
      q: "How does Go's garbage collector achieve low pause times?",
      a: "Go uses a concurrent, tri-color mark-and-sweep collector. Marking runs concurrently with the application using write barriers to maintain the tri-color invariant. The only stop-the-world phases are brief: enabling the write barrier and scanning stacks. GOGC controls the trade-off between CPU overhead and memory usage.",
    },
  ],
  followUps: [
    "See Memory Models for the underlying stack/heap architecture that GC manages.",
    "Explore Virtual Machines & Bytecode for how VM runtimes integrate with their GC.",
    "Study Concurrency vs Parallelism to understand how concurrent GCs interact with application threads.",
  ],
  mcqs: [
    {
      q: "What is the main weakness of simple reference counting?",
      options: [
        "It is too slow for real-time systems",
        "It cannot reclaim cyclic references",
        "It requires stop-the-world pauses",
        "It does not work with multi-threaded programs",
      ],
      answerIndex: 1,
      explanation: "In a reference cycle (A->B->A), both objects maintain a refcount of at least 1 even when unreachable from roots. A separate cycle detector or tracing GC is needed.",
    },
    {
      q: "What does the generational hypothesis state?",
      options: [
        "Older objects are larger than younger objects",
        "Most objects die young",
        "Objects should be allocated in the old generation first",
        "GC should always compact the heap",
      ],
      answerIndex: 1,
      explanation: "The generational hypothesis observes that most objects have very short lifetimes. This justifies frequent, cheap young-generation collections.",
    },
    {
      q: "What is a write barrier in the context of GC?",
      options: [
        "A memory fence for thread synchronization",
        "Code inserted at reference writes to notify the GC of pointer changes",
        "A protection mechanism for read-only memory",
        "A hardware feature that prevents memory corruption",
      ],
      answerIndex: 1,
      explanation: "Write barriers are small code fragments inserted at every reference store. They inform the GC of changes to the object graph, enabling concurrent and generational collection.",
    },
    {
      q: "Which GC achieves sub-millisecond pause times on multi-terabyte heaps?",
      options: ["Serial GC", "Parallel GC", "G1 GC", "ZGC"],
      answerIndex: 3,
      explanation: "ZGC (Java 15+) uses colored pointers and load barriers to perform concurrent relocation, achieving sub-millisecond pauses even on very large heaps.",
    },
  ],
  exercises: [
    "Write a Python program that creates a reference cycle, then use gc.collect() and gc.get_stats() to observe cycle detection in action.",
    "In Java, create a WeakHashMap-based cache and demonstrate that entries are removed when their keys are GC'd (use System.gc() and -verbose:gc).",
    "Benchmark allocation-heavy code under different JVM GC algorithms: -XX:+UseSerialGC, -XX:+UseG1GC, -XX:+UseZGC. Compare pause times and throughput.",
    "Implement a simple mark-and-sweep GC in Python or C for a toy heap of objects with reference fields.",
    "In Go, use runtime.MemStats to measure GC frequency and pause times. Experiment with GOGC values and observe the memory/CPU trade-off.",
  ],
  flashcards: [
    { front: "Reference counting", back: "Each object has a counter of references to it. Incremented on reference copy, decremented on reference drop. Freed at zero. Cannot handle cycles alone." },
    { front: "Mark-and-sweep", back: "Trace from roots, mark all reachable objects, sweep (free) unmarked ones. Simple but requires stop-the-world pause." },
    { front: "Generational hypothesis", back: "Most objects die young. This motivates dividing the heap into young/old generations and collecting the young gen frequently." },
    { front: "Write barrier", back: "Code inserted at reference writes to inform the GC of mutations. Enables concurrent and generational collection." },
    { front: "Tri-color marking", back: "White=unseen, Gray=seen but children unscanned, Black=fully scanned. Invariant: no black->white pointer. Enables concurrent marking." },
    { front: "Weak vs Soft reference", back: "Weak: collected at next GC. Soft: collected only under memory pressure. Both do not prevent GC of the referent." },
    { front: "ZGC", back: "Java's ultra-low-pause concurrent GC. Uses colored pointers and load barriers. Sub-ms pauses on multi-TB heaps." },
    { front: "GOGC", back: "Go's GC tuning knob: the percentage of new allocations relative to live heap that triggers a collection. Default: 100 (collect when heap doubles)." },
  ],
  revisionNotes: [
    "Two fundamental approaches: reference counting (immediate, cannot handle cycles) and tracing (mark-and-sweep, handles cycles, requires pauses).",
    "Generational GC: most objects die young -> frequent cheap young-gen collections, rare old-gen collections.",
    "Concurrent GCs (G1, ZGC, Shenandoah, Go) use write barriers and tri-color marking to collect alongside the application.",
    "ZGC achieves sub-ms pauses via colored pointers and concurrent relocation.",
    "Weak references: allow GC to collect the referent. Soft references: collected only under memory pressure.",
    "GC roots: stack variables, globals, registers, static fields -- the starting points for tracing.",
    "Finalization is unreliable and slow. Prefer explicit cleanup (try-with-resources, using, defer).",
  ],
  cheatSheet: [
    "Reference counting: immediate free, no cycles, overhead per assign (CPython, Swift, Rc/Arc)",
    "Mark-and-sweep: handles cycles, stop-the-world pause (classic GC)",
    "Mark-compact: like mark-sweep + compaction (no fragmentation, bump allocation)",
    "Generational: young gen (Eden+survivors) + old gen; young collected often",
    "G1: region-based, concurrent marking, evacuation pauses, pause-time target",
    "ZGC: colored pointers, load barriers, sub-ms pauses, multi-TB heaps",
    "Go GC: concurrent tri-color mark-sweep, GOGC tuning, sub-ms pauses",
    "Weak ref: does not prevent collection. Soft ref: collected under memory pressure",
    "Write barrier: code at every pointer store, maintains GC invariants",
    "JVM flags: -XX:+UseG1GC, -XX:+UseZGC, -XX:MaxGCPauseMillis, -verbose:gc",
  ],
  resources: [
    { label: "The Garbage Collection Handbook (Jones, Hosking, Moss)", kind: "book", note: "The definitive reference on GC algorithms, from reference counting to real-time collection." },
    { label: "Java GC Tuning Guide (Oracle)", kind: "docs", note: "Official guide to JVM garbage collectors, flags, and tuning strategies." },
    { label: "ZGC Wiki (OpenJDK)", kind: "docs", note: "Design documents and performance data for the Z Garbage Collector." },
    { label: "A Guide to the Go Garbage Collector", kind: "docs", note: "Official Go documentation on GC design, GOGC, and optimization tips." },
    { label: "Baby's First Garbage Collector (Bob Nystrom)", kind: "article", note: "A tutorial implementing a simple mark-and-sweep GC in C in under 200 lines." },
    { label: "Memory Management Reference", kind: "docs", note: "Encyclopedic reference of GC algorithms, glossary, and bibliography." },
  ],
  glossary: [
    { term: "Garbage collection", definition: "Automatic memory management that reclaims memory occupied by objects no longer reachable by the program." },
    { term: "Reference counting", definition: "A GC strategy that tracks the number of references to each object and frees it when the count reaches zero." },
    { term: "Tracing GC", definition: "A GC strategy that traces references from root objects to find all reachable objects; everything else is garbage." },
    { term: "Generational GC", definition: "A GC that divides the heap into generations based on object age, collecting younger generations more frequently." },
    { term: "Write barrier", definition: "A small piece of code executed at every reference store to maintain GC invariants for concurrent or generational collection." },
    { term: "GC roots", definition: "The starting points for tracing: stack variables, globals, registers, and other always-reachable references." },
    { term: "Stop-the-world", definition: "A GC pause during which all application threads are suspended while the collector runs." },
    { term: "Weak reference", definition: "A reference that does not prevent the referent from being garbage collected." },
  ],
};
