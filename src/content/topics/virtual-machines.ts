import type { TopicContent } from "../types";

export const virtualMachines: TopicContent = {
  quickSummary: [
    "A virtual machine (VM) in this context is a software interpreter that executes an intermediate representation — bytecode — rather than native machine code. Examples include the JVM, CLR, CPython VM, and V8.",
    "Source code is compiled to bytecode (a compact, platform-independent instruction set), then the VM either interprets it directly, JIT-compiles it to native code, or uses a tiered strategy combining both.",
    "VMs come in two flavors: stack-based (JVM, CLR, CPython) where operands live on a virtual stack, and register-based (Lua 5, Dalvik) where operands live in virtual registers. Stack VMs have simpler codegen; register VMs emit fewer instructions.",
  ],
  detailed: [
    "The JVM executes .class files containing Java bytecode — a typed, stack-based instruction set with ~200 opcodes. Each method has a max stack depth and a local variable array. HotSpot JIT-compiles hot methods via C1 (fast, low optimization) and C2 (slow, aggressive optimization) compilers in a tiered model.",
    "The CLR executes Common Intermediate Language (CIL), also stack-based. Unlike the JVM, the CLR was designed from the start for multiple languages (C#, F#, VB.NET). Its RyuJIT compiler compiles all methods to native code at first invocation — there is no interpreter tier by default, though .NET 8 introduced a dynamic PGO pipeline with tiered compilation.",
    "CPython compiles Python source to a stack-based bytecode (the dis module exposes it). The evaluation loop in ceval.c is a giant switch-case interpreter; there is no built-in JIT (though projects like copy-and-patch JIT landed experimentally in CPython 3.13). The GIL serializes bytecode instruction execution across threads.",
    "V8 (Chrome, Node.js) compiles JavaScript to bytecode for its Ignition interpreter, then JIT-compiles hot functions with TurboFan using sea-of-nodes SSA IR. V8 collects type feedback during interpretation and uses it to speculate on types during JIT — a deoptimization bail-out occurs if speculation is wrong.",
    "Register-based VMs (Lua 5, Dalvik/ART) map values to numbered registers instead of pushing and popping a stack. This reduces the total instruction count because operands are named in-place, but each instruction is wider (needs register indices). Benchmarks typically show register VMs execute fewer dispatches for equivalent programs.",
  ],
  deepDive: [
    "Bytecode verification is critical for security. The JVM verifier performs dataflow analysis on each method before execution: it checks that the stack doesn't underflow, that local variables are definitely assigned before use, and that type-safety invariants hold. This is a fixed-point algorithm over the method's control-flow graph.",
    "JIT compilation strategies vary in sophistication. Method-based JIT (HotSpot C2) compiles an entire method when it becomes hot. Trace-based JIT (LuaJIT, early TraceMonkey) records a linear trace of executed instructions through loops and branches, then compiles that trace — great for loops, but path explosion can be a problem for branchy code.",
    "On-stack replacement (OSR) lets a JIT replace an interpreted frame with a compiled frame while a method is still executing — essential for long-running loops that need to transition to compiled code mid-iteration. The JIT must reconstruct the compiled frame's state from the interpreter's locals and stack.",
    "Inline caching (IC) is used by V8 and other VMs to speed up polymorphic property lookups. At a call site, the IC records the hidden class (shape/map) of the receiver; on subsequent calls with the same shape, the lookup is a direct offset load. Monomorphic ICs are the fastest; megamorphic sites fall back to hash-table lookups.",
    "Garbage collection in VMs is tightly coupled to the execution engine. Generational collectors (G1, ZGC, Shenandoah in the JVM; Orinoco in V8) rely on write barriers emitted by the JIT and interpreter to track cross-generation references. The JIT must emit safepoints — locations where the GC can safely pause a thread and walk its stack.",
    "Escape analysis lets a JIT compiler determine that an object never escapes the allocating method and can be scalar-replaced (its fields become local variables) or stack-allocated, eliminating the GC cost entirely. HotSpot C2 and GraalVM perform aggressive escape analysis.",
  ],
  code: [
    {
      language: "java",
      caption: "Viewing JVM bytecode with javap for a simple method",
      source: `// Source: Add.java
public class Add {
    public static int add(int a, int b) {
        return a + b;
    }
}

// Compile and disassemble:
// javac Add.java && javap -c Add
//
// Output:
// public static int add(int, int);
//   Code:
//      0: iload_0        // push local var 0 (a) onto operand stack
//      1: iload_1        // push local var 1 (b) onto operand stack
//      2: iadd           // pop two ints, push their sum
//      3: ireturn        // return int on top of stack`,
    },
    {
      language: "cpp",
      caption: "Inspecting compiler-generated assembly for a simple function (GCC/Clang)",
      source: `#include <cstdint>
#include <iostream>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Compile with: g++ -S -O0 -masm=intel factorial.cpp
// Selected output from factorial.s (x86-64, GCC, unoptimized):
//
// factorial(int):
//   push    rbp                    ; save base pointer
//   mov     rbp, rsp               ; set up stack frame
//   sub     rsp, 16                ; allocate local space
//   mov     DWORD PTR [rbp-4], edi ; store param n
//   cmp     DWORD PTR [rbp-4], 1   ; n <= 1?
//   jg      .L2                    ; if n > 1, skip to recursive case
//   mov     eax, 1                 ; return 1
//   jmp     .L3
// .L2:
//   mov     eax, DWORD PTR [rbp-4] ; load n
//   sub     eax, 1                 ; n - 1
//   mov     edi, eax               ; pass (n-1) as argument
//   call    factorial(int)         ; recursive call
//   imul    eax, DWORD PTR [rbp-4] ; result = n * factorial(n-1)
// .L3:
//   leave                          ; restore stack frame
//   ret                            ; return eax

int main() {
    std::cout << factorial(5) << std::endl;  // prints 120
    return 0;
}`,
    },
    {
      language: "csharp",
      caption: "CIL bytecode emitted for a C# method (viewed via ildasm or dotnet-ildasm)",
      source: `// Source: Math.cs
public static class Math {
    public static int Multiply(int x, int y) {
        return x * y;
    }
}

// CIL output (from ildasm):
// .method public hidebysig static int32 Multiply(int32 x, int32 y)
// {
//   .maxstack 2
//   IL_0000: ldarg.0      // push argument 0 (x)
//   IL_0001: ldarg.1      // push argument 1 (y)
//   IL_0002: mul          // pop two, push product
//   IL_0003: ret          // return top of stack
// }`,
    },
    {
      language: "javascript",
      caption: "Viewing V8 Ignition bytecode with --print-bytecode",
      source: `// Source: sum.js
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}
sum([1, 2, 3]);

// Run: node --print-bytecode --print-bytecode-filter=sum sum.js
// Selected output:
//   LdaZero                    // Load 0 into accumulator
//   Star r1                    // Store accumulator -> register r1 (total)
//   LdaZero
//   Star r2                    // r2 = i = 0
// LoopHeader:
//   Ldar r2                    // Load i into accumulator
//   LdaNamedProperty r0, [0]   // Load arr.length
//   TestLessThan r2, [1]       // i < arr.length
//   JumpIfFalse [end]
//   LdaKeyedProperty r0, r2    // Load arr[i]
//   Add r1, [2]                // total += arr[i]
//   Star r1
//   Inc r2                     // i++
//   Jump [LoopHeader]`,
    },
    {
      language: "lua",
      caption: "Lua 5 register-based bytecode (luac -l output)",
      source: `-- Source: fib.lua
function fib(n)
  if n < 2 then return n end
  return fib(n - 1) + fib(n - 2)
end

-- luac -l fib.lua (selected output):
-- function <fib.lua:1,4> (9 instructions at 0x...)
-- 1 param, 5 slots, 1 upvalue, 1 local, 2 constants
--   1  LT       0  R(0)  K(0)    ; n < 2
--   2  JMP      0  2             ; skip if false
--   3  RETURN   0  2  0          ; return R(0) = n
--   4  GETTABUP 1  0  K(1)      ; R(1) = _ENV["fib"]
--   5  SUB      2  0  K(0)      ; R(2) = n - 1 (register-based: no push/pop)
--   6  CALL     1  2  2         ; R(1) = fib(n-1)
--   7  GETTABUP 2  0  K(1)      ; R(2) = _ENV["fib"]
--   8  SUB      3  0  K(2)      ; R(3) = n - 2
--   9  CALL     2  2  2         ; R(2) = fib(n-2)
--  10  ADD      1  1  2         ; R(1) = R(1) + R(2)
--  11  RETURN   1  2  0         ; return R(1)`,
    },
    {
      language: "c",
      caption: "Simplified bytecode interpreter loop (stack-based VM in C)",
      source: `#include <stdint.h>

typedef enum {
    OP_CONST,   // push constant
    OP_ADD,     // pop two, push sum
    OP_MUL,     // pop two, push product
    OP_RET,     // return top of stack
} Opcode;

typedef struct {
    uint8_t *code;      // bytecode array
    int32_t *constants;  // constant pool
    int32_t  stack[256]; // operand stack
    int       sp;        // stack pointer
    int       ip;        // instruction pointer
} VM;

int32_t vm_run(VM *vm) {
    for (;;) {
        uint8_t op = vm->code[vm->ip++];
        switch (op) {
            case OP_CONST: {
                uint8_t idx = vm->code[vm->ip++];
                vm->stack[vm->sp++] = vm->constants[idx];
                break;
            }
            case OP_ADD: {
                int32_t b = vm->stack[--vm->sp];
                int32_t a = vm->stack[--vm->sp];
                vm->stack[vm->sp++] = a + b;
                break;
            }
            case OP_MUL: {
                int32_t b = vm->stack[--vm->sp];
                int32_t a = vm->stack[--vm->sp];
                vm->stack[vm->sp++] = a * b;
                break;
            }
            case OP_RET:
                return vm->stack[--vm->sp];
        }
    }
}`,
    },
  ],
  diagrams: [
    {
      title: "Virtual Machine Architecture",
      kind: "architecture",
      caption: "Layered architecture from physical hardware through hypervisor to guest VMs and operating systems.",
      mermaid: `graph TD
    HW["Physical Hardware
CPU, RAM, Disk, NIC"] --> HV["Hypervisor
Type 1: bare metal
Type 2: hosted"]
    HV --> VM1["Guest VM 1
Guest OS 1
Apps"]
    HV --> VM2["Guest VM 2
Guest OS 2
Apps"]
    HV --> VM3["Guest VM 3
Guest OS 3
Apps"]
    VM1 --> vCPU1["vCPU
vRAM
vDisk"]
    VM2 --> vCPU2["vCPU
vRAM
vDisk"]`,
    },
    {
      title: "VM vs Container Comparison",
      kind: "mindmap",
      caption: "Key differences between virtual machines and containers in isolation, overhead, and use cases.",
      mermaid: `mindmap
  root((Virtualization))
    Virtual Machines
      Full OS per VM
      Hardware emulation
      Strong isolation
      Minutes to start
      GBs of overhead
      Different OS possible
    Containers
      Shared host kernel
      Process isolation
      Lightweight
      Seconds to start
      MBs of overhead
      Same OS family`,
    },
    {
      title: "VM Lifecycle Flow",
      kind: "state",
      caption: "States a virtual machine transitions through from creation to deletion.",
      mermaid: `stateDiagram-v2
    [*] --> Defined : create VM config
    Defined --> Running : start VM
    Running --> Paused : pause
    Paused --> Running : resume
    Running --> Stopped : shutdown
    Stopped --> Running : start
    Running --> Suspended : suspend to disk
    Suspended --> Running : restore
    Stopped --> [*] : delete VM`,
    },
    {
      title: "Hypervisor Resource Scheduling",
      kind: "sequence",
      caption: "How a Type-1 hypervisor schedules vCPU time and handles a guest memory page fault.",
      mermaid: `sequenceDiagram
    participant G1 as Guest VM 1
    participant HV as Hypervisor
    participant G2 as Guest VM 2
    participant HW as Physical CPU
    HV->>HW: schedule G1 vCPU on pCPU0
    G1->>HV: VM exit - memory page fault
    HV->>HV: map guest physical to host physical
    HV->>G1: VM entry - resume execution
    HV->>HW: schedule G2 vCPU on pCPU0
    G2->>HV: VM exit - IO request
    HV->>HW: perform IO on behalf of guest
    HW-->>HV: IO complete
    HV->>G2: VM entry - deliver result`,
    },
  ],
  animations: [
    {
      title: "Stack-based bytecode execution of 2 + 3 * 4",
      steps: [
        { label: "CONST 2", detail: "Push 2 onto the operand stack. Stack: [2]" },
        { label: "CONST 3", detail: "Push 3 onto the operand stack. Stack: [2, 3]" },
        { label: "CONST 4", detail: "Push 4 onto the operand stack. Stack: [2, 3, 4]" },
        { label: "MUL", detail: "Pop 4 and 3, push 3*4=12. Stack: [2, 12]" },
        { label: "ADD", detail: "Pop 12 and 2, push 2+12=14. Stack: [14]" },
        { label: "RET", detail: "Pop and return 14. Stack: [] Result: 14" },
      ],
    },
    {
      title: "JIT tiered compilation lifecycle",
      steps: [
        {
          label: "Interpretation",
          detail: "Method is first executed by the interpreter. Each bytecode instruction is dispatched through a switch or threaded dispatch loop. The VM collects invocation counts and branch profiles.",
        },
        {
          label: "Tier 1 compilation (C1/baseline)",
          detail: "After the invocation counter exceeds a threshold (~1,500 in HotSpot), the method is compiled with a fast, minimally-optimizing compiler. Execution continues immediately with compiled code.",
        },
        {
          label: "Profile collection in compiled code",
          detail: "The tier 1 compiled code includes instrumentation to collect type profiles, branch frequencies, and call targets. This data feeds the optimizing compiler.",
        },
        {
          label: "Tier 2 compilation (C2/optimizing)",
          detail: "After sufficient profiling data accumulates (~10,000 invocations), the optimizing compiler kicks in: inlining, escape analysis, loop unrolling, vectorization, speculative optimizations based on type profiles.",
        },
        {
          label: "Deoptimization",
          detail: "If a speculative assumption is violated at runtime (e.g., a type guard fails), the VM deoptimizes: it reconstructs the interpreter frame from the compiled frame's state and falls back to interpretation, restarting the tiering process.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "JVM (HotSpot)", "CLR (CoreCLR)", "CPython VM", "V8"],
    rows: [
      [
        "Bytecode format",
        "Java bytecode (.class), stack-based, ~200 opcodes",
        "CIL (MSIL), stack-based, typed",
        "CPython bytecode (.pyc), stack-based, ~120 opcodes",
        "Ignition bytecode, register-accumulator hybrid, ~500 bytecodes",
      ],
      [
        "JIT strategy",
        "Tiered: C1 (fast) + C2 (optimizing)",
        "RyuJIT, single-tier AOT-at-first-call; tiered compilation + dynamic PGO in .NET 8+",
        "No production JIT (experimental copy-and-patch in 3.13)",
        "Ignition interpreter + TurboFan optimizing JIT; removed Crankshaft in 2017",
      ],
      [
        "GC",
        "Generational: G1 (default), ZGC, Shenandoah (low-latency)",
        "Generational, mark-sweep-compact, regions; background GC",
        "Reference counting + cycle detector (generational)",
        "Orinoco: generational, concurrent marking, parallel scavenge",
      ],
      [
        "Threading model",
        "Native OS threads, no GIL",
        "Native OS threads, no GIL",
        "GIL serializes bytecode execution; free-threading experimental in 3.13",
        "Single-threaded per isolate; worker threads for parallelism",
      ],
      [
        "Language support",
        "Java, Kotlin, Scala, Clojure, Groovy",
        "C#, F#, VB.NET, IronPython",
        "Python only",
        "JavaScript, TypeScript (via transpilation), WebAssembly",
      ],
      [
        "Peak performance",
        "Near-native for long-running server workloads",
        "Comparable to JVM; AOT via NativeAOT narrows startup gap",
        "10-100x slower than C for CPU-bound code",
        "Near-native for optimized hot loops; startup-sensitive workloads use snapshots",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a stack-based VM and a register-based VM?",
      a: "A stack-based VM uses an implicit operand stack: instructions pop inputs from and push results onto this stack. A register-based VM uses numbered virtual registers as operands. Stack VMs produce more compact bytecode (instructions need fewer operand fields) and simpler compilers, but execute more instructions (extra push/pop). Register VMs emit fewer total instructions because operands are named directly, but each instruction is wider. The JVM and CLR are stack-based; Lua 5 and Android's Dalvik are register-based. V8's Ignition is an accumulator-register hybrid.",
      followUps: [
        "Why did Android switch from the stack-based Dalvik to the register-based approach?",
        "How does the accumulator model in V8 differ from a pure register VM?",
      ],
    },
    {
      q: "Explain JIT compilation and why it can outperform ahead-of-time (AOT) compilation.",
      a: "JIT compilation translates bytecode to native code at runtime, using profiling data collected during execution. Because the JIT observes actual types, call targets, and branch frequencies, it can make speculative optimizations that an AOT compiler cannot: it can inline virtual calls where profiling shows a monomorphic receiver, devirtualize interface calls, eliminate dead branches that are never taken in practice, and specialize generic code for concrete types. If speculation is wrong, the JIT deoptimizes back to interpreted or baseline code. AOT compilation lacks this runtime knowledge and must be conservative.",
      followUps: [
        "What is the cost of deoptimization?",
        "When would AOT compilation be preferred over JIT?",
      ],
    },
    {
      q: "How does the JVM verify bytecode, and why is this important?",
      a: "The JVM bytecode verifier performs a static dataflow analysis on each method before execution. It walks the control-flow graph and, at each instruction, verifies: (1) the operand stack depth is consistent on all paths to a given instruction, (2) operand types match what each instruction expects, (3) local variables are definitely assigned before use, (4) object references are used in type-safe ways, and (5) protected members are accessed only from authorized classes. This is a fixed-point iteration that converges because the type lattice is finite. Verification prevents untrusted bytecode from corrupting the VM's memory or breaking type safety — critical for sandboxed execution (e.g., applets, plugin systems).",
    },
    {
      q: "What is on-stack replacement (OSR) and why is it needed?",
      a: "OSR replaces a currently-executing interpreted or baseline-compiled frame with an optimized compiled frame without waiting for the method to return and be re-entered. This is important for long-running loops: if a method enters a loop that iterates millions of times, the JIT detects the loop is hot and compiles the method, but without OSR, the compiled version would only be used on the next invocation. With OSR, the JIT compiles the method, maps the interpreter state (locals, stack, loop counter) into the compiled frame's register/stack layout, and transfers control mid-loop. The tricky part is the state reconstruction: the JIT must produce an entry point within the compiled code that expects exactly the state the interpreter has at the OSR point.",
      followUps: [
        "What limitations does OSR impose on optimizations?",
        "How does V8 handle OSR for TurboFan?",
      ],
    },
    {
      q: "Explain inline caching and its role in dynamic language VMs.",
      a: "Inline caching (IC) accelerates property lookups in dynamic languages where object shapes aren't known at compile time. At each property access site, the IC remembers the object's hidden class (V8 calls it a Map, JSC calls it a Structure). On the next access, the IC compares the object's shape to the cached shape; if it matches (monomorphic hit), the property offset is known and the lookup is a direct memory load — as fast as a C struct field access. If 2-4 different shapes are seen (polymorphic), the IC does a linear scan of cached entries. Beyond ~4 shapes (megamorphic), it falls back to a generic hash-table lookup. JIT compilers use IC data to speculate: if a site is monomorphic, the JIT can inline the property access and guard on the shape.",
    },
    {
      q: "How does escape analysis work in a JIT compiler, and what optimizations does it enable?",
      a: "Escape analysis determines whether an object's reference is visible outside the allocating method (or compilation unit). An object escapes if it is returned, stored in a field, passed to an unanalyzable method, or assigned to a global. If the object does not escape, the JIT can: (1) scalar-replace it — decompose the object into its individual fields and allocate them as locals/registers, eliminating the heap allocation entirely; (2) stack-allocate it — allocate it in the method's frame, which is freed on return without GC involvement; (3) eliminate its synchronization — if a lock is taken on a non-escaping object, the lock is removed because no other thread can access it. HotSpot C2 and GraalVM are known for aggressive escape analysis. A key limitation is that the analysis is invalidated if any call in the chain is not inlined, so escape analysis effectiveness is directly tied to inlining depth.",
    },
    {
      q: "Why does CPython use reference counting plus a cycle collector instead of a tracing GC?",
      a: "CPython uses reference counting because it provides deterministic destruction: when the last reference to an object is dropped, the object is freed immediately, and its __del__ finalizer runs promptly. This matters because Python is heavily used for resource management (file handles, database connections, locks) and programmers rely on deterministic cleanup via context managers and reference drops. However, reference counting alone cannot collect cyclic garbage (A -> B -> A). CPython adds a generational cycle detector that periodically traces container objects (lists, dicts, instances) to find and collect unreachable cycles. The GIL simplifies the implementation by ensuring reference count updates are atomic at the bytecode level without explicit locking.",
      followUps: [
        "How does the free-threading work in CPython 3.13+ without the GIL?",
        "What are the performance implications of reference counting vs. tracing GC?",
      ],
    },
    {
      q: "What are hidden classes (maps/shapes), and how do they make dynamic language VMs efficient?",
      a: "Hidden classes are an internal data structure used by VMs like V8, SpiderMonkey, and JSC to give shape to dynamically-typed objects. When you create an object and add properties, the VM creates a hidden class (called Map in V8, Shape in SpiderMonkey) that records the property names, their offsets in the object's storage, and their attributes. Objects with the same property names added in the same order share the same hidden class, so the VM can treat them like instances of a static class — property access becomes an offset lookup rather than a hash-table search. Hidden classes form transition trees: adding a property creates a transition from one hidden class to another. This is why consistent property initialization order matters for performance in JavaScript.",
    },
  ],
  followUps: [
    "How does WebAssembly fit into the VM landscape, and how does it differ from JavaScript bytecode?",
    "What is GraalVM and how does its polyglot approach differ from the standard JVM?",
    "How do garbage collection safepoints interact with JIT-compiled code?",
    "What is the difference between a method JIT and a trace JIT?",
    "How does .NET's NativeAOT compilation compare to traditional JIT execution?",
  ],
  mcqs: [
    {
      q: "Which of the following VMs uses a register-based bytecode format?",
      options: ["JVM", "CLR", "CPython VM", "Lua 5 VM"],
      answerIndex: 3,
      explanation:
        "Lua 5 uses a register-based bytecode format where instructions reference numbered virtual registers. The JVM, CLR, and CPython all use stack-based bytecode.",
    },
    {
      q: "In HotSpot's tiered compilation, what is the role of the C1 compiler?",
      options: [
        "It performs aggressive optimizations like escape analysis and loop unrolling",
        "It produces minimally-optimized code quickly and instruments it for profiling",
        "It compiles bytecode ahead of time before the application starts",
        "It is the interpreter that executes bytecode without compilation",
      ],
      answerIndex: 1,
      explanation:
        "C1 (client compiler) compiles methods quickly with basic optimizations and inserts profiling instrumentation. C2 (server compiler) later uses the profiling data for aggressive optimization.",
    },
    {
      q: "What happens during deoptimization in a JIT-compiled VM?",
      options: [
        "The JIT compiler produces slower code for the next compilation",
        "The compiled frame is replaced with an interpreter frame, and execution continues in the interpreter",
        "The program crashes with a type error",
        "The VM switches from register-based to stack-based execution",
      ],
      answerIndex: 1,
      explanation:
        "Deoptimization reconstructs the interpreter state from the compiled frame and transfers control back to the interpreter. This happens when a speculative optimization is invalidated at runtime.",
    },
    {
      q: "What does the JVM bytecode verifier check?",
      options: [
        "Only that the class file magic number is correct",
        "That the program terminates in finite time",
        "Stack depth consistency, type safety, and definite assignment of locals on all control-flow paths",
        "That no deprecated API calls are made",
      ],
      answerIndex: 2,
      explanation:
        "The verifier performs dataflow analysis to ensure type safety, consistent stack depths across control-flow merges, and that locals are assigned before use.",
    },
    {
      q: "In V8, what does the Ignition component do?",
      options: [
        "It is the optimizing JIT compiler that produces highly optimized native code",
        "It is the bytecode interpreter that also collects type feedback for TurboFan",
        "It is the garbage collector",
        "It is the parser that converts source to an AST",
      ],
      answerIndex: 1,
      explanation:
        "Ignition is V8's bytecode interpreter. It executes bytecode and collects type feedback (inline caches) that TurboFan uses for speculative optimizations.",
    },
    {
      q: "What is inline caching used for?",
      options: [
        "Caching compiled native code in a file on disk",
        "Storing the results of pure function calls",
        "Speeding up property lookups by caching the object shape and property offset at each access site",
        "Inlining functions at the bytecode level before JIT compilation",
      ],
      answerIndex: 2,
      explanation:
        "Inline caching records the hidden class (shape) and property offset at each property access site. If the next object has the same shape, the lookup is a direct memory offset load.",
    },
    {
      q: "What optimization does escape analysis enable?",
      options: [
        "Converting recursive calls to iterative loops",
        "Replacing heap allocations with stack allocations or scalar replacement when the object does not escape the method",
        "Parallelizing sequential code across multiple threads",
        "Reducing bytecode size by removing unused opcodes",
      ],
      answerIndex: 1,
      explanation:
        "If an object provably does not escape the allocating method, it can be stack-allocated or scalar-replaced (decomposed into fields in registers), eliminating the heap allocation and GC pressure.",
    },
    {
      q: "Why does CPython have a Global Interpreter Lock (GIL)?",
      options: [
        "To prevent users from running multiple Python scripts simultaneously",
        "To simplify memory management by ensuring only one thread executes Python bytecode at a time, making reference count updates safe without per-object locks",
        "To lock the global namespace from being modified at runtime",
        "To prevent race conditions in the file system",
      ],
      answerIndex: 1,
      explanation:
        "The GIL ensures that only one thread at a time can execute Python bytecode, which means reference count increments/decrements (which happen on nearly every operation) don't need atomic operations or per-object locks.",
    },
    {
      q: "What is on-stack replacement (OSR)?",
      options: [
        "Replacing one stack data structure with another at runtime",
        "A technique to swap a currently-executing interpreted frame with a compiled frame mid-execution",
        "A garbage collection strategy that compacts objects on the stack",
        "A method of resolving stack overflow errors by extending the stack",
      ],
      answerIndex: 1,
      explanation:
        "OSR allows the VM to switch from interpreted to compiled execution without waiting for the current method to return. This is critical for long-running loops that become hot mid-execution.",
    },
    {
      q: "Which statement about hidden classes (maps/shapes) in V8 is correct?",
      options: [
        "Every JavaScript object always has a unique hidden class",
        "Hidden classes are only used for class-based declarations, not object literals",
        "Objects with the same properties added in the same order share the same hidden class, enabling offset-based property access",
        "Hidden classes are only relevant during parsing, not execution",
      ],
      answerIndex: 2,
      explanation:
        "Objects constructed the same way (same properties, same order) share a hidden class. This lets the VM treat property access as a fixed-offset memory load rather than a hash lookup.",
    },
    {
      q: "In a register-based VM, what is the primary advantage over a stack-based VM?",
      options: [
        "Simpler bytecode generation from the compiler",
        "More compact bytecode instructions",
        "Fewer bytecode dispatches needed for equivalent programs",
        "Easier bytecode verification",
      ],
      answerIndex: 2,
      explanation:
        "Register-based VMs name operands in the instruction itself, avoiding the push/pop overhead. This reduces total instruction count and dispatch overhead, though each instruction is wider.",
    },
    {
      q: "What does the CLR's RyuJIT compiler do differently from HotSpot's tiered approach by default?",
      options: [
        "It interprets all code without ever JIT-compiling",
        "It compiles every method to native code at first invocation rather than interpreting first",
        "It uses a trace-based JIT like LuaJIT",
        "It only compiles methods that are called more than 10,000 times",
      ],
      answerIndex: 1,
      explanation:
        "By default, the CLR's RyuJIT compiles each method to native code the first time it is called, unlike HotSpot which starts with interpretation and only JIT-compiles hot methods.",
    },
  ],
  exercises: [
    "Write a minimal stack-based bytecode interpreter in your language of choice that supports PUSH, ADD, SUB, MUL, DIV, and PRINT instructions. Test it with a program that computes (3 + 5) * 2.",
    "Use javap -c to disassemble a Java program with a loop and an if-else branch. Annotate each bytecode instruction with what it does and trace the operand stack state through one iteration of the loop.",
    "Use Python's dis module to compare the bytecode of a list comprehension vs. an equivalent for-loop-with-append. Explain the differences in instruction count and why one is typically faster.",
    "Implement a simple hidden-class transition system: given a sequence of property additions, build a transition tree and determine which objects share the same hidden class.",
    "Profile a JavaScript function in Chrome DevTools. Find the function in the V8 compilation log (--trace-opt) and identify whether it was optimized, deoptimized, or remained in Ignition. Explain what type feedback led to the optimization or what caused deoptimization.",
    "Extend your stack-based interpreter to support local variables (LOAD and STORE instructions) and conditional jumps (JUMP_IF_ZERO). Use it to implement a simple countdown loop.",
    "Read the HotSpot source for the C1 compiler's invocation counter logic. Determine the default thresholds for tier 1 and tier 2 compilation and explain how -XX:CompileThreshold affects them.",
    "Write a benchmark that demonstrates scalar replacement via escape analysis: create a method that allocates a short-lived object in a hot loop, and show (using -XX:+PrintEscapeAnalysis) that HotSpot eliminates the allocation.",
  ],
  flashcards: [
    {
      front: "What is bytecode?",
      back: "An intermediate instruction set — more abstract than native machine code but lower-level than source code — that a virtual machine can interpret or JIT-compile. Examples: JVM bytecode, CIL, CPython bytecode.",
    },
    {
      front: "Stack-based VM vs register-based VM",
      back: "Stack VM: operands on an implicit stack; compact instructions, more dispatches. Register VM: operands in numbered registers; wider instructions, fewer dispatches. JVM/CLR/CPython are stack-based; Lua 5/Dalvik are register-based.",
    },
    {
      front: "What is JIT compilation?",
      back: "Just-In-Time compilation translates bytecode to native machine code at runtime, using profiling data to apply speculative optimizations that an ahead-of-time compiler cannot make.",
    },
    {
      front: "What is deoptimization?",
      back: "When a JIT's speculative assumption is violated at runtime, the compiled frame is replaced with an interpreter frame (reconstructing its state), and execution falls back to interpreted mode.",
    },
    {
      front: "What is on-stack replacement (OSR)?",
      back: "A technique that replaces a currently-executing interpreted or baseline-compiled frame with an optimized compiled frame mid-execution — essential for transitioning long-running loops to compiled code.",
    },
    {
      front: "What is an inline cache (IC)?",
      back: "A per-call-site cache that remembers the receiver object's hidden class and property offset. Monomorphic IC = one shape (fastest). Polymorphic = 2-4 shapes. Megamorphic = 5+ shapes (hash-table fallback).",
    },
    {
      front: "What is escape analysis?",
      back: "A JIT optimization that determines whether an object escapes its allocating method. Non-escaping objects can be scalar-replaced (fields become registers), stack-allocated, or have their locks eliminated.",
    },
    {
      front: "What are hidden classes (V8 Maps)?",
      back: "Internal structures that describe the shape of a dynamic object — which properties it has, their offsets, and attributes. Objects with the same properties in the same order share a hidden class, enabling offset-based access.",
    },
    {
      front: "What is the JVM bytecode verifier?",
      back: "A static analysis pass that checks each method's bytecode for type safety, stack depth consistency, definite assignment of locals, and access control before execution. It uses fixed-point dataflow analysis over the CFG.",
    },
    {
      front: "CPython GIL",
      back: "The Global Interpreter Lock ensures only one thread executes Python bytecode at a time, simplifying reference counting (no per-object locks needed) but preventing true CPU parallelism for Python threads.",
    },
    {
      front: "V8 Ignition + TurboFan",
      back: "Ignition is V8's bytecode interpreter that collects type feedback. TurboFan is the optimizing JIT compiler that uses that feedback for speculative optimizations via a sea-of-nodes SSA IR.",
    },
    {
      front: "What is tiered compilation?",
      back: "A strategy where code starts interpreted, is compiled with a fast/minimal compiler when warm (C1/baseline), then recompiled with an aggressive optimizing compiler when hot (C2/TurboFan). Each tier has more optimization but higher compile cost.",
    },
  ],
  revisionNotes: [
    "VMs execute bytecode, an intermediate representation between source and native code. The two main architectures are stack-based (JVM, CLR, CPython) and register-based (Lua 5, Dalvik).",
    "Stack VMs: simpler codegen, more compact instructions, but more total instructions due to push/pop overhead. Register VMs: wider instructions but fewer total dispatches.",
    "JIT compilation uses runtime profiling (type feedback, branch counts, call targets) to make speculative optimizations that AOT compilers cannot. The tradeoff is compile latency and memory for the compiler.",
    "Tiered compilation mitigates JIT latency: interpret first, then baseline-compile warm code, then aggressively optimize hot code. HotSpot uses C1+C2; V8 uses Ignition+TurboFan.",
    "Deoptimization is the safety net for speculation: when a type guard or assumption fails, the VM reconstructs an interpreter frame from the compiled state and falls back.",
    "On-stack replacement (OSR) transitions a live frame from interpreted to compiled mid-execution — critical for long-running loops.",
    "Inline caches (ICs) speed up dynamic dispatch by caching object shapes at each call site. Monomorphic sites are the fastest; megamorphic sites force hash-table lookups.",
    "Hidden classes (Maps/Shapes) give structure to dynamic objects, enabling offset-based property access instead of hash-table lookups. Consistent property order matters for sharing hidden classes.",
    "Escape analysis enables scalar replacement, stack allocation, and lock elision for non-escaping objects — eliminating heap allocation and GC pressure.",
    "The JVM verifier prevents untrusted bytecode from violating type safety or corrupting memory — essential for security in sandboxed environments.",
    "CPython uses reference counting (deterministic destruction) + a cycle collector. The GIL serializes bytecode execution, simplifying refcount operations but limiting parallelism.",
  ],
  cheatSheet: [
    "javap -c MyClass — disassemble JVM bytecode for a class",
    "javap -v MyClass — verbose output including constant pool and stack map frames",
    "python -m dis module.py — disassemble CPython bytecode for a module",
    "dis.dis(func) — disassemble a single Python function's bytecode",
    "node --print-bytecode --print-bytecode-filter=funcName file.js — dump V8 Ignition bytecode",
    "node --trace-opt --trace-deopt file.js — log V8 JIT optimization and deoptimization events",
    "ildasm Assembly.dll — disassemble .NET CIL bytecode (Windows) or dotnet-ildasm on Linux",
    "luac -l script.lua — list Lua bytecodes for a script",
    "-XX:+PrintCompilation — HotSpot flag to log JIT compilation events",
    "-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining — show HotSpot inlining decisions",
    "-XX:+PrintEscapeAnalysis — show HotSpot escape analysis results",
    "-XX:CompileThreshold=N — set HotSpot invocation count threshold for JIT compilation",
    "dotnet publish -p:PublishAot=true — produce a NativeAOT binary (.NET 8+)",
    "%OptimizationStatus(func) in V8 d8 shell — query optimization state (0=not compiled, 1=optimized, etc.)",
  ],
  resources: [
    {
      label: "The Java Virtual Machine Specification (JVM SE 21)",
      kind: "docs",
      note: "The authoritative reference for bytecode semantics, verification, class file format, and execution model.",
    },
    {
      label: "ECMA-335: Common Language Infrastructure (CLI)",
      kind: "docs",
      note: "The official spec for CIL bytecode, the CLR type system, and metadata format.",
    },
    {
      label: "Inside the Python Virtual Machine (Obi Ike-Nwosu)",
      kind: "book",
      note: "Walks through CPython's ceval.c interpreter loop, bytecode format, and object model in detail.",
    },
    {
      label: "V8 blog: Ignition and TurboFan",
      kind: "article",
      note: "Official V8 team articles on the Ignition bytecode interpreter and TurboFan optimizing compiler pipeline.",
    },
    {
      label: "Virtual Machines: Versatile Platforms for Systems and Processes (Smith & Nair)",
      kind: "book",
      note: "Comprehensive textbook covering both process VMs (JVM, CLR) and system VMs (VMware, Xen), with deep treatment of binary translation and JIT compilation.",
    },
    {
      label: "The Implementation of Lua 5.0 (Ierusalimschy, de Figueiredo, Celes)",
      kind: "paper",
      note: "Explains the design rationale for Lua's register-based VM, including instruction encoding and performance tradeoffs vs. stack-based designs.",
    },
    {
      label: "A Survey of Adaptive Optimization in Virtual Machines (Arnold, Fink, Grove, Hind, Sweeney)",
      kind: "paper",
      note: "Covers tiered compilation, profile-guided optimization, deoptimization, and on-stack replacement across multiple VM implementations.",
    },
    {
      label: "GraalVM documentation",
      kind: "docs",
      note: "Covers the Graal JIT compiler, Truffle framework for implementing language interpreters, and polyglot capabilities.",
    },
    {
      label: "OpenJDK HotSpot source code",
      kind: "repo",
      note: "The reference implementation of the JVM. Key directories: src/hotspot/share/opto (C2 optimizing compiler), src/hotspot/share/c1 (C1 compiler), src/hotspot/share/interpreter.",
    },
    {
      label: "LuaJIT Wiki: Bytecode format and trace compilation",
      kind: "docs",
      note: "Documents LuaJIT's trace-based JIT compiler, SSA IR, and allocation sinking optimizations.",
    },
  ],
  glossary: [
    {
      term: "Bytecode",
      definition:
        "A compact, platform-independent instruction set that a virtual machine interprets or JIT-compiles. More abstract than native machine code, enabling portability and security checks.",
    },
    {
      term: "JIT (Just-In-Time) Compilation",
      definition:
        "Runtime translation of bytecode to native machine code, using profiling data to apply speculative optimizations. Trades compile-time latency for peak execution speed.",
    },
    {
      term: "AOT (Ahead-Of-Time) Compilation",
      definition:
        "Compiling source or bytecode to native code before execution, eliminating JIT warmup cost but losing runtime profiling opportunities. Examples: GraalVM Native Image, .NET NativeAOT.",
    },
    {
      term: "Operand Stack",
      definition:
        "The virtual stack in a stack-based VM where bytecode instructions push and pop operands. Each method frame has its own operand stack with a declared maximum depth.",
    },
    {
      term: "Deoptimization",
      definition:
        "The process of discarding JIT-compiled code and falling back to interpreted execution when a speculative assumption (type guard, branch prediction) is violated at runtime.",
    },
    {
      term: "On-Stack Replacement (OSR)",
      definition:
        "A technique to replace a currently-executing stack frame (interpreted or baseline-compiled) with an optimized compiled frame mid-execution, without waiting for the method to return.",
    },
    {
      term: "Inline Cache (IC)",
      definition:
        "A per-call-site cache of object shape and property offset data, enabling fast property lookups. States: uninitialized, monomorphic (one shape), polymorphic (few shapes), megamorphic (many shapes).",
    },
    {
      term: "Hidden Class (Map/Shape/Structure)",
      definition:
        "An internal metadata structure describing the layout of a dynamically-typed object — which properties exist, their storage offsets, and attributes. Enables offset-based property access instead of hash-table lookup.",
    },
    {
      term: "Escape Analysis",
      definition:
        "A static analysis that determines whether an object's reference is visible outside its allocating method. Non-escaping objects can be scalar-replaced, stack-allocated, or have their locks eliminated.",
    },
    {
      term: "Tiered Compilation",
      definition:
        "A JIT strategy using multiple compiler tiers of increasing optimization aggressiveness: interpret -> baseline compile -> optimizing compile. Balances fast startup with peak throughput.",
    },
    {
      term: "Constant Pool",
      definition:
        "A per-class (JVM) or per-module table of constants — numbers, strings, class references, method references — that bytecode instructions reference by index rather than embedding inline.",
    },
    {
      term: "Safepoint",
      definition:
        "A point in compiled or interpreted code where the VM can safely pause a thread for garbage collection, deoptimization, or thread suspension. At a safepoint, all object references are in known locations.",
    },
    {
      term: "Sea of Nodes",
      definition:
        "An intermediate representation used by V8's TurboFan and HotSpot's C2 where both data flow and control flow are represented as edges in a single graph. Enables powerful optimizations via graph rewriting.",
    },
    {
      term: "Type Feedback",
      definition:
        "Runtime profiling data collected during interpretation (or baseline execution) that records actual types, call targets, and branch frequencies at specific code locations. Used by the optimizing JIT for speculative compilation.",
    },
  ],
};
