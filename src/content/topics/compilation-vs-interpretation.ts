import type { TopicContent } from "../types";

export const compilationVsInterpretation: TopicContent = {
  quickSummary: [
    "Compilation translates an entire program from source code to machine code (or an intermediate form) before execution; interpretation executes source code or bytecode line by line at runtime.",
    "Ahead-of-Time (AOT) compilation produces native binaries with maximum startup speed but loses runtime adaptability; Just-In-Time (JIT) compilation compiles hot code paths at runtime, combining portability with near-native performance.",
    "Most modern language implementations are hybrids: Java compiles to bytecode then JIT-compiles to native code; Python compiles to bytecode then interprets it; TypeScript transpiles to JavaScript which is then JIT-compiled by V8.",
    "The compilation pipeline involves lexing, parsing, semantic analysis, intermediate representation (IR) generation, optimization passes, and code generation — each stage transforms the program into a lower-level representation.",
  ],
  detailed: [
    "A compiler is a program that translates source code in one language into another language, typically a lower-level one. The classic compilation pipeline has a front end (lexing, parsing, semantic analysis), a middle end (optimization on an intermediate representation), and a back end (target-specific code generation and register allocation). GCC and LLVM/Clang are the two dominant open-source compiler infrastructures.",
    "An interpreter executes a program directly without producing a separate executable. Tree-walk interpreters traverse the AST node by node, evaluating as they go. Bytecode interpreters first compile the source to a compact bytecode (an instruction set for a virtual machine), then execute the bytecode in a loop — this is significantly faster than tree-walking. CPython, Ruby's YARV, and Lua all use bytecode interpretation.",
    "Just-In-Time (JIT) compilation bridges the gap between interpretation and AOT compilation. The program starts running in an interpreter or on bytecode, and the JIT compiler identifies 'hot' code paths (frequently executed loops or methods) and compiles them to optimized native code at runtime. The JVM's HotSpot, V8's TurboFan, and .NET's RyuJIT are production JIT compilers. JIT compilation can outperform AOT in some cases because it can optimize based on runtime profiling data (e.g., inlining virtual calls when only one implementation is observed).",
    "Transpilers (source-to-source compilers) translate from one high-level language to another. TypeScript transpiles to JavaScript, Kotlin can transpile to JavaScript, and Babel transpiles modern JavaScript to older versions for browser compatibility. Transpilers reuse the target language's existing runtime and tooling rather than generating machine code directly.",
    "Linking is the final stage of AOT compilation that combines multiple object files and libraries into a single executable or shared library. Static linking copies library code into the executable (larger binary, no runtime dependencies). Dynamic linking references shared libraries loaded at runtime (smaller binary, but requires the library to be present). The linker also resolves symbol references between compilation units, performs relocation, and can apply link-time optimizations (LTO).",
    "Intermediate Representations (IRs) are the backbone of modern compiler infrastructure. LLVM IR is a typed, SSA-form (Static Single Assignment) representation that serves as the common language between front ends (Clang for C/C++, rustc for Rust, swiftc for Swift) and back ends (x86, ARM, RISC-V). The JVM's bytecode and .NET's Common Intermediate Language (CIL) serve a similar role for their ecosystems, enabling language interoperability on a shared runtime.",
  ],
  deepDive: [
    "Optimization passes transform the IR to produce faster or smaller code. Key passes include: constant folding (evaluate 2+3 at compile time), dead code elimination (remove unreachable code), loop-invariant code motion (hoist invariant computations out of loops), inlining (replace function calls with the function body), strength reduction (replace expensive ops like multiplication with cheaper ones like shifts), and vectorization (convert scalar loops to SIMD instructions). LLVM applies over 100 passes in its default optimization pipeline.",
    "Profile-Guided Optimization (PGO) uses runtime profiling data to inform AOT compilation. The program is first compiled with instrumentation, run on representative inputs to collect branch frequencies and call counts, then recompiled using that profile. PGO enables accurate inlining decisions, optimal code layout (hot/cold splitting), and better branch prediction hints. It can improve performance by 10-20% for large applications. AutoFDO extends this by sampling production binaries without recompilation.",
    "Tiered compilation is used by the JVM HotSpot and .NET to balance startup time and peak performance. Code starts in an interpreter (tier 0), then is compiled by a fast, low-optimization compiler (C1/tier 1-3 in HotSpot), and finally recompiled by a heavily optimizing compiler (C2/tier 4) once the method is identified as hot. Each tier collects more profiling data that feeds the next tier's optimizations. This allows applications to start quickly while eventually reaching near-AOT performance.",
    "Deoptimization is the JIT compiler's escape hatch when speculative optimizations prove wrong. For example, a JIT may inline a virtual method call based on the observation that only one class implements the method. If a new class is loaded that provides a different implementation, the JIT must 'deoptimize' — discard the optimized native code, reconstruct the interpreter state, and fall back to interpreted execution. The ability to deoptimize is what makes speculative optimizations safe.",
    "WebAssembly (Wasm) represents a new point in the compilation-interpretation spectrum. It is a portable, compact binary format designed as a compilation target for languages like C, C++, Rust, and Go. Browsers AOT-compile Wasm to native code at load time (much faster than JIT-compiling JavaScript because Wasm is pre-validated and typed). WASI extends Wasm beyond the browser, enabling server-side and edge computing with near-native performance and sandboxed execution.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Inspecting compiled output: examining compiler-generated assembly from C++",
      source: `// file: fibonacci.cpp
#include <cstdint>

// A simple function whose compiled output we want to inspect
int64_t fibonacci(int n) {
    int64_t a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        int64_t temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}

// Compile with -S to emit assembly instead of an object file:
//   g++ -O2 -S -masm=intel fibonacci.cpp -o fibonacci.s
//
// Key output (x86-64, abbreviated):
//   fibonacci:
//     xor     rax, rax          ; a = 0
//     mov     rdx, 1            ; b = 1
//   .loop:
//     test    edi, edi          ; if (n <= 0) done
//     jle     .done
//     lea     rcx, [rax + rdx]  ; temp = a + b
//     mov     rax, rdx          ; a = b
//     mov     rdx, rcx          ; b = temp
//     dec     edi               ; --n
//     jmp     .loop
//   .done:
//     ret
//
// Use objdump to inspect an already-compiled object file:
//   g++ -O2 -c fibonacci.cpp -o fibonacci.o
//   objdump -d -M intel fibonacci.o
//
// Use -fdump-tree-optimized to see the compiler's internal IR:
//   g++ -O2 -fdump-tree-optimized fibonacci.cpp`,
    },
    {
      language: "c",
      caption: "Viewing LLVM IR: the intermediate representation between source and machine code",
      source: `// file: add.c
int add(int a, int b) {
    return a + b;
}

// Compile to LLVM IR:  clang -S -emit-llvm add.c -o add.ll
//
// Resulting LLVM IR (add.ll):
// define i32 @add(i32 %a, i32 %b) {
//   %1 = add nsw i32 %a, %b
//   ret i32 %1
// }
//
// Key observations:
// - SSA form: each variable assigned exactly once (%1)
// - Typed: i32 (32-bit integer)
// - Platform-independent: same IR for x86 and ARM
// - 'nsw' = no signed wrap (enables overflow-based optimizations)

// Then compile IR to assembly: llc add.ll -o add.s
// Or to object code: llc -filetype=obj add.ll -o add.o`,
    },
    {
      language: "java",
      caption: "Java bytecode: javap disassembly and JIT compilation",
      source: `// file: Factorial.java
public class Factorial {
    public static long factorial(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// Compile: javac Factorial.java  (produces Factorial.class)
// Disassemble: javap -c Factorial
//
// Output:
//   public static long factorial(int);
//     Code:
//        0: lconst_1          // push 1L onto stack
//        1: lstore_1          // store in local variable 'result'
//        2: iconst_2          // push 2
//        3: istore_3          // store in local variable 'i'
//        4: iload_3           // load i
//        5: iload_0           // load n
//        6: if_icmpgt 18      // if i > n, jump to return
//        9: lload_1           // load result
//       10: iload_3           // load i
//       11: i2l               // convert int to long
//       12: lmul              // result * i
//       13: lstore_1          // store back to result
//       14: iinc 3, 1         // i++
//       17: goto 4            // loop back
//       18: lload_1           // load result
//       19: lreturn           // return
//
// At runtime, HotSpot JIT compiles this to native x86/ARM code
// after ~10,000 invocations (C2 threshold).`,
    },
    {
      language: "typescript",
      caption: "Transpilation: TypeScript to JavaScript",
      source: `// TypeScript source (input to tsc)
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  const { name, age } = user;
  return \\\`Hello, \\\${name}! You are \\\${age} years old.\\\`;
}

const alice: User = { name: "Alice", age: 30 };
console.log(greet(alice));

// After transpilation (tsc --target ES5):
// "use strict";
// function greet(user) {
//     var name = user.name, age = user.age;
//     return "Hello, " + name + "! You are " + age + " years old.";
// }
// var alice = { name: "Alice", age: 30 };
// console.log(greet(alice));
//
// Key observations:
// - All type annotations removed (types are compile-time only)
// - Template literals converted to string concatenation (ES5 target)
// - const/let converted to var (ES5 target)
// - Interface declaration completely erased`,
    },
    {
      language: "bash",
      caption: "Full C compilation pipeline: preprocessing, compilation, assembly, linking",
      source: `# 1. Preprocessing: expand macros, includes, conditionals
gcc -E main.c -o main.i
# main.i contains the fully expanded source (often thousands of lines)

# 2. Compilation: source -> assembly
gcc -S main.i -o main.s
# main.s contains x86 assembly (human-readable)

# 3. Assembly: assembly -> object code
gcc -c main.s -o main.o
# main.o contains machine code + symbol table + relocation entries

# 4. Linking: combine object files + libraries -> executable
gcc main.o -lm -o main
# The linker resolves symbols (e.g., printf from libc),
# applies relocations, and produces the final ELF binary

# Inspect the symbol table
nm main.o
# T main        (defined in this file, text section)
# U printf       (undefined -- needs to be resolved by linker)

# Inspect sections
objdump -h main.o
# .text   (machine code)
# .data   (initialized globals)
# .bss    (zero-initialized globals)
# .rodata (read-only data: string literals)`,
    },
    {
      language: "javascript",
      caption: "V8 JIT compilation pipeline: Ignition interpreter + TurboFan optimizing compiler",
      source: `// V8 processes JavaScript in multiple tiers:
//
// 1. Parser -> AST
// 2. Ignition: AST -> bytecode (executed immediately)
// 3. TurboFan: hot bytecode -> optimized machine code
//
// Run Node.js with --print-bytecode to see Ignition output:
// node --print-bytecode script.js

function sumArray(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

// Call it enough times to trigger TurboFan optimization
const data = Array.from({ length: 1000 }, (_, i) => i);
for (let i = 0; i < 10000; i++) {
  sumArray(data);
}

// V8 optimizations applied by TurboFan:
// - Type specialization: assumes arr is always a dense int array
// - Bounds check elimination: proves i < arr.length
// - Loop unrolling: processes multiple elements per iteration
// - SIMD vectorization: uses SSE/AVX for parallel addition
//
// If arr later contains mixed types, V8 deoptimizes back to Ignition`,
    },
    {
      language: "rust",
      caption: "Rust compilation: MIR and LLVM IR stages",
      source: `// Rust compilation pipeline:
// 1. Parsing -> AST
// 2. HIR (High-level IR) -- desugaring, name resolution
// 3. Type checking + borrow checking on HIR
// 4. MIR (Mid-level IR) -- control flow graph, used for:
//    - Borrow checking (non-lexical lifetimes)
//    - Optimization (constant propagation, dead code elim)
//    - Monomorphization of generics
// 5. LLVM IR -- handed off to LLVM for:
//    - Platform-specific optimization
//    - Code generation for target architecture
// 6. Linking -> final binary

// View MIR:  cargo rustc -- -Z mir-opt-level=0 --emit=mir
// View LLVM IR:  cargo rustc -- --emit=llvm-ir

fn factorial(n: u64) -> u64 {
    (1..=n).product()
}

fn main() {
    // After monomorphization, there is a concrete factorial
    // implementation for u64 (no runtime generics overhead).
    println!("{}", factorial(20)); // 2432902008176640000
}`,
    },
  ],
  diagrams: [
    {
      title: "Compilation vs Interpretation Pipeline",
      kind: "flow",
      caption: "Side-by-side flow comparison of how compiled and interpreted languages process source code to execution.",
      mermaid: `flowchart TD
    SRC["Source Code"]
    SRC --> COMP_PATH & INTERP_PATH

    subgraph COMP_PATH["Compiled Path"]
        direction TD
        LEX1["Lexer and Parser"] --> AST1["AST"]
        AST1 --> OPT1["Optimiser"]
        OPT1 --> OBJ["Machine Code or Bytecode"]
        OBJ --> EXEC1["Direct CPU Execution"]
    end

    subgraph INTERP_PATH["Interpreted Path"]
        direction TD
        LEX2["Lexer and Parser"] --> AST2["AST"]
        AST2 --> EVAL["Tree-walk Evaluator"]
        EVAL --> EXEC2["Result via Interpreter"]
    end`,
    },
    {
      title: "Language Execution Models",
      kind: "architecture",
      caption: "Architecture of different language execution models from pure interpretation to native compilation.",
      mermaid: `graph LR
    SRC["Source Code"]
    SRC --> INT["Interpreter\nPython, Ruby"]
    SRC --> JIT["JIT Compiler\nJava JVM, JS V8"]
    SRC --> AOT["AOT Compiler\nC, C++, Rust, Go"]
    SRC --> TRANS["Transpiler\nTypeScript, Babel"]

    INT --> OUT1["Immediate Output\nNo compile step"]
    JIT --> BC["Bytecode"] --> RT["Runtime Optimisation"]
    AOT --> BIN["Native Binary"]
    TRANS --> JS["Target Language"] --> AOT`,
    },
    {
      title: "JIT Compilation Sequence",
      kind: "sequence",
      caption: "How a JIT compiler progressively optimises hot code paths at runtime.",
      mermaid: `sequenceDiagram
    participant VM as VM or Runtime
    participant INTERP as Interpreter
    participant PROF as Profiler
    participant JIT as JIT Compiler
    participant CPU as CPU
    VM->>INTERP: Execute bytecode
    INTERP->>PROF: Record call counts
    PROF-->>VM: Hot path detected
    VM->>JIT: Compile hot function
    JIT-->>VM: Native machine code
    VM->>CPU: Execute native code
    CPU-->>VM: Faster result
    VM->>PROF: Continue profiling`,
    },
  ],
  animations: [
    {
      title: "From Source Code to Execution: Compilation Pipeline",
      steps: [
        { label: "Lexing (Tokenization)", detail: "The lexer reads raw characters and produces a stream of tokens: keywords (if, return), identifiers (x, factorial), literals (42, \"hello\"), and operators (+, ==). Whitespace and comments are discarded." },
        { label: "Parsing", detail: "The parser consumes tokens and builds an Abstract Syntax Tree (AST). A function definition becomes a node with children for parameters, return type, and body. Syntax errors are reported here." },
        { label: "Semantic Analysis", detail: "The compiler walks the AST to resolve names (which 'x' does this refer to?), check types (can you add an int and a string?), and verify scoping rules. The output is a typed, annotated AST." },
        { label: "IR Generation", detail: "The typed AST is lowered to an intermediate representation (LLVM IR, JVM bytecode, etc.). This is a simpler, more uniform representation closer to machine semantics but still platform-independent." },
        { label: "Optimization", detail: "The optimizer applies passes to the IR: constant folding, dead code elimination, inlining, loop unrolling, vectorization. Each pass transforms the IR into a more efficient form." },
        { label: "Code Generation", detail: "The back end converts optimized IR into target-specific machine code: register allocation, instruction selection, instruction scheduling. The output is an object file (.o) containing relocatable machine code." },
        { label: "Linking", detail: "The linker combines object files, resolves cross-file symbol references, and produces the final executable or shared library." },
      ],
    },
    {
      title: "JIT Warm-Up and Deoptimization Cycle",
      steps: [
        { label: "Cold start", detail: "The method is first executed by the interpreter (or baseline compiler). Execution is slow but starts immediately with zero compilation delay." },
        { label: "Profiling", detail: "The interpreter collects execution counts and type profiles: how often each branch is taken, what types flow through each variable, which virtual methods are actually called." },
        { label: "Tier-up to optimized code", detail: "Once the method is hot (e.g., 10,000 invocations), the JIT compiler uses the profile data to generate optimized native code with speculative optimizations like type specialization and inlining." },
        { label: "Deoptimization trigger", detail: "A new class is loaded that invalidates a speculative assumption (e.g., a monomorphic call site becomes polymorphic). The JIT must deoptimize." },
        { label: "Fallback to interpreter", detail: "The optimized code is discarded. The JIT reconstructs the interpreter frame from the machine state and resumes in the interpreter. New profiling data is collected for a future recompilation." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "AOT Compilation", "JIT Compilation", "Interpretation", "Transpilation"],
    rows: [
      ["When code is translated", "Before execution (build time)", "During execution (runtime)", "Executed directly at runtime", "Before execution (build time)"],
      ["Output format", "Native machine code", "Native machine code (cached)", "None (direct execution of AST/bytecode)", "Source code in another language"],
      ["Startup time", "Fast (code is pre-compiled)", "Slow (compilation overhead at start)", "Instant (no compilation step)", "N/A (depends on target language runtime)"],
      ["Peak performance", "High (full optimization budget)", "Very high (runtime profiling enables speculative opts)", "Low (interpretation overhead per instruction)", "Depends on target language"],
      ["Portability", "Low (platform-specific binary)", "High (bytecode runs on any VM)", "High (source code is portable)", "High (targets widely-supported language)"],
      ["Debugging", "Harder (optimized code differs from source)", "Moderate (can deoptimize to interpreter)", "Easy (direct source correspondence)", "Moderate (source maps needed)"],
      ["Examples", "C/C++ (GCC/Clang), Rust, Go", "Java (HotSpot), C# (.NET), JS (V8)", "CPython, Ruby (MRI), Bash", "TypeScript->JS, Kotlin->JS, Babel"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a compiler and an interpreter?",
      a: "A compiler translates an entire program from source code to a target language (usually machine code or bytecode) before execution. The output is a standalone artifact (binary or bytecode file). An interpreter executes the program directly, processing and evaluating one statement or bytecode instruction at a time without producing a separate output file. In practice, many implementations combine both: CPython compiles to bytecode then interprets it; the JVM compiles to bytecode, interprets it, and then JIT-compiles hot paths to native code.",
      followUps: [
        "What are the advantages of bytecode interpretation over tree-walk interpretation?",
        "Why do JIT compilers sometimes outperform AOT compilers?",
      ],
    },
    {
      q: "How does JIT compilation work?",
      a: "JIT compilation starts by executing code in an interpreter or baseline compiler. The runtime monitors which methods or loops are executed frequently (hot code) and collects profiling data (type information, branch frequencies). When a method exceeds a hotness threshold, the JIT compiler uses the profile data to generate highly optimized native code with speculative optimizations like type specialization and inlining. If assumptions are invalidated (e.g., a new type appears), the JIT deoptimizes — discards the optimized code and falls back to interpretation.",
      followUps: [
        "What is tiered compilation?",
        "What is on-stack replacement (OSR)?",
      ],
    },
    {
      q: "What is an intermediate representation (IR) and why is it important?",
      a: "An IR is a data structure or code format that represents the program between the source language and the target machine code. It decouples the front end (language-specific parsing and type checking) from the back end (platform-specific code generation). LLVM IR, for example, allows Clang (C/C++), rustc (Rust), and swiftc (Swift) to share the same optimization and code generation infrastructure. IRs like SSA form enable powerful optimizations because each variable is assigned exactly once, making data flow analysis straightforward.",
      followUps: [
        "What is SSA (Static Single Assignment) form?",
        "How does LLVM's IR enable cross-language optimization?",
      ],
    },
    {
      q: "Explain the linking stage of compilation.",
      a: "After compilation, each source file produces an object file containing machine code with unresolved symbol references (e.g., calls to functions defined in other files or libraries). The linker resolves these references by matching symbol definitions across all object files and libraries. Static linking copies library code into the executable. Dynamic linking records references to shared libraries (.so/.dll) resolved at load time. The linker also performs relocation (adjusting addresses for the final memory layout) and can apply link-time optimization (LTO) across compilation units.",
      followUps: [
        "What is the difference between static and dynamic linking?",
        "What is link-time optimization (LTO)?",
      ],
    },
    {
      q: "What is WebAssembly and where does it fit in the compilation spectrum?",
      a: "WebAssembly (Wasm) is a portable, compact binary format designed as a compilation target for languages like C, C++, Rust, and Go. It sits between AOT and JIT: the source language is AOT-compiled to Wasm bytecode, which the browser then AOT-compiles to native code at load time (much faster than JIT-compiling JavaScript because Wasm is pre-validated and statically typed). Wasm provides near-native performance, sandboxed execution, and deterministic behavior. WASI extends it beyond browsers for server-side use.",
      followUps: [
        "How does Wasm achieve near-native performance?",
        "What is WASI and how does it extend Wasm?",
      ],
    },
    {
      q: "What are the key optimization passes a compiler performs?",
      a: "Major optimization passes include: (1) Constant folding — evaluate constant expressions at compile time, (2) Dead code elimination — remove unreachable or unused code, (3) Inlining — replace function calls with the function body to eliminate call overhead and enable further optimization, (4) Loop-invariant code motion — hoist computations that don't change across iterations out of loops, (5) Strength reduction — replace expensive operations with cheaper equivalents, (6) Vectorization — convert scalar operations to SIMD instructions for parallel processing, and (7) Register allocation — map virtual registers to physical CPU registers, minimizing memory loads/stores.",
    },
  ],
  followUps: [
    "Explore how profile-guided optimization (PGO) uses runtime data to improve AOT compilation.",
    "Study how V8's TurboFan JIT optimizes JavaScript and when it deoptimizes.",
    "Learn about GraalVM's polyglot compilation and Truffle framework for language implementation.",
    "Investigate link-time optimization (LTO) and cross-module inlining.",
    "Understand how WebAssembly is compiled and executed in browser engines.",
  ],
  mcqs: [
    {
      q: "Which of the following is a key advantage of JIT over AOT compilation?",
      options: [
        "Faster startup time",
        "Smaller binary size",
        "Runtime profiling enables speculative optimizations",
        "No need for a runtime environment",
      ],
      answerIndex: 2,
      explanation: "JIT compilers collect runtime profiling data (type information, branch frequencies) and use it for speculative optimizations like type specialization and monomorphic inlining. AOT compilers lack this information.",
    },
    {
      q: "What does SSA (Static Single Assignment) form guarantee?",
      options: [
        "Each variable is assigned exactly once",
        "All assignments are to static variables",
        "Variables are never reassigned after initialization",
        "All functions are pure",
      ],
      answerIndex: 0,
      explanation: "In SSA form, each variable is defined exactly once, and each use refers to exactly one definition. This simplifies data flow analysis and enables optimizations like constant propagation and dead code elimination.",
    },
    {
      q: "What is the role of the linker in the compilation pipeline?",
      options: [
        "Convert source code to tokens",
        "Optimize intermediate representation",
        "Resolve symbol references across object files and libraries to produce a final executable",
        "Execute the compiled program",
      ],
      answerIndex: 2,
      explanation: "The linker combines separately compiled object files, resolves cross-file symbol references (e.g., function calls to other modules), performs relocation, and produces the final executable or shared library.",
    },
    {
      q: "What is deoptimization in the context of JIT compilation?",
      options: [
        "Removing unused optimization passes",
        "Falling back from optimized native code to interpreted execution when speculative assumptions are invalidated",
        "Compiling with reduced optimization levels for faster build times",
        "Reverting source code changes that caused performance regressions",
      ],
      answerIndex: 1,
      explanation: "When a JIT's speculative assumption (e.g., a call site is always monomorphic) is violated, the optimized code is discarded and execution falls back to the interpreter. This ensures correctness at the cost of temporary performance loss.",
    },
    {
      q: "Why is WebAssembly faster to compile in browsers than JavaScript?",
      options: [
        "WebAssembly has a simpler syntax",
        "WebAssembly is pre-validated, statically typed, and requires no speculative optimization",
        "WebAssembly uses a better compression algorithm",
        "WebAssembly skips the garbage collector",
      ],
      answerIndex: 1,
      explanation: "Wasm is a compact, pre-validated binary format with static types, enabling straightforward AOT compilation. JavaScript requires parsing, type inference, speculative optimization, and deoptimization — all of which add overhead.",
    },
    {
      q: "What does a transpiler produce?",
      options: [
        "Native machine code",
        "Bytecode for a virtual machine",
        "Source code in another high-level language",
        "An intermediate representation",
      ],
      answerIndex: 2,
      explanation: "A transpiler (source-to-source compiler) translates source code from one high-level language to another. TypeScript to JavaScript and Kotlin to JavaScript are common examples.",
    },
  ],
  exercises: [
    "Compile a simple C function with gcc -S and examine the generated x86 assembly. Then compile with -O2 and compare: identify at least three optimizations the compiler applied.",
    "Use Python's dis module to disassemble a function and map each bytecode instruction back to the corresponding source line. Then compare the bytecode for a loop-based vs. list-comprehension implementation of the same logic.",
    "Write a simple arithmetic expression evaluator: implement it first as a tree-walk interpreter (evaluate the AST directly), then as a bytecode compiler + VM (compile to stack-based bytecodes, then execute). Benchmark both approaches.",
    "Use javap -c to disassemble a Java class file. Identify the bytecode instructions for a loop, an if-else, and a virtual method call. Run the program with -XX:+PrintCompilation to observe which methods the JIT compiles.",
    "Compile a Rust program with --emit=llvm-ir and examine the LLVM IR. Identify SSA form (phi nodes, single assignment), and trace how a high-level construct (like a for loop over an iterator) is lowered to IR-level branches and comparisons.",
  ],
  flashcards: [
    { front: "What is AOT (Ahead-of-Time) compilation?", back: "Translating source code entirely to native machine code before execution (at build time). Examples: C/C++ (GCC, Clang), Rust, Go. Produces fast-starting binaries but limits runtime adaptability." },
    { front: "What is JIT (Just-In-Time) compilation?", back: "Compiling code to native machine code during execution, targeting frequently run (hot) code paths. Enables runtime profiling and speculative optimization. Examples: JVM HotSpot, V8 TurboFan, .NET RyuJIT." },
    { front: "What is an intermediate representation (IR)?", back: "A platform-independent code representation between source and machine code. Enables shared optimization passes across languages (LLVM IR) or platforms (JVM bytecode). Typically in SSA form." },
    { front: "What is a transpiler?", back: "A source-to-source compiler that translates from one high-level language to another (e.g., TypeScript to JavaScript, Kotlin to JavaScript). Reuses the target language's runtime." },
    { front: "What is SSA (Static Single Assignment) form?", back: "An IR property where each variable is assigned exactly once. Multiple assignments to the same source variable produce distinct SSA variables. Simplifies data flow analysis and enables constant propagation, dead code elimination." },
    { front: "What is deoptimization?", back: "The JIT compiler's fallback mechanism: when a speculative optimization assumption is violated at runtime, the optimized native code is discarded and execution reverts to the interpreter, preserving correctness." },
    { front: "What is the difference between static and dynamic linking?", back: "Static linking copies library code into the executable (self-contained, larger). Dynamic linking references shared libraries loaded at runtime (smaller binary, requires library presence, enables updates without recompilation)." },
    { front: "What is PGO (Profile-Guided Optimization)?", back: "Compiling once with instrumentation, running on representative inputs, then recompiling using the collected profile data to optimize branch layout, inlining decisions, and code placement. 10-20% speedup typical." },
  ],
  revisionNotes: [
    "Compiler pipeline: Lexer -> Parser -> Semantic Analysis -> IR Generation -> Optimization -> Code Generation -> Linking.",
    "Interpretation types: tree-walk (slow, simple) vs. bytecode (faster, CPython/YARV/Lua). Bytecode is a compact instruction set for a virtual machine.",
    "JIT compilation: interpret first, profile hot paths, compile to native code with speculative optimizations, deoptimize if assumptions break.",
    "LLVM architecture: multiple front ends (Clang, rustc, swiftc) emit LLVM IR; shared middle-end optimization; multiple back ends (x86, ARM, Wasm).",
    "Linking: static (copy into binary) vs. dynamic (reference shared libs). LTO optimizes across compilation units.",
    "Key optimizations: constant folding, DCE, inlining, LICM, strength reduction, vectorization, register allocation.",
    "WebAssembly: portable binary format, AOT-compiled in browsers, near-native speed, sandboxed execution. WASI extends to server-side.",
  ],
  cheatSheet: [
    "gcc -E: preprocess only. gcc -S: compile to assembly. gcc -c: compile to object file. gcc file.o -o binary: link.",
    "javap -c Class: disassemble Java bytecode. javap -p -v Class: verbose with private members.",
    "python -m dis module: disassemble Python bytecode. python -m py_compile file.py: compile to .pyc.",
    "clang -S -emit-llvm file.c: emit LLVM IR. opt -O2 file.ll: apply optimization passes to IR.",
    "node --print-bytecode: show V8 Ignition bytecode. node --trace-opt / --trace-deopt: trace JIT compilation.",
    "rustc --emit=llvm-ir / --emit=mir: emit Rust's intermediate representations.",
    "wasm-objdump -d file.wasm: disassemble WebAssembly module.",
    "JVM JIT flags: -XX:+PrintCompilation (log JIT events), -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining (log inlining decisions).",
  ],
  resources: [
    { label: "Compilers: Principles, Techniques, and Tools (Dragon Book) by Aho, Lam, Sethi, Ullman", kind: "book", note: "The classic compiler textbook covering lexing, parsing, optimization, and code generation. Graduate-level but foundational." },
    { label: "Crafting Interpreters by Robert Nystrom", url: "https://craftinginterpreters.com/", kind: "book", note: "Practical guide to building two interpreters (tree-walk in Java, bytecode VM in C) for the Lox language. Free online." },
    { label: "LLVM Language Reference Manual", kind: "docs", note: "Official documentation for LLVM IR syntax, semantics, and optimization passes." },
    { label: "The Java Virtual Machine Specification", kind: "docs", note: "Formal specification of JVM bytecode, class file format, and execution semantics. Essential for understanding JVM internals." },
    { label: "V8 Blog", kind: "article", note: "Technical blog posts from the V8 team explaining Ignition, TurboFan, optimization strategies, and performance characteristics of JavaScript compilation." },
    { label: "WebAssembly Specification", kind: "docs", note: "The official W3C specification for WebAssembly binary format, text format, and execution semantics." },
  ],
  glossary: [
    { term: "Lexer (Tokenizer)", definition: "The first stage of compilation that reads raw source characters and produces a stream of tokens (keywords, identifiers, literals, operators), discarding whitespace and comments." },
    { term: "Parser", definition: "The stage that consumes tokens and builds an Abstract Syntax Tree (AST) representing the syntactic structure of the program according to the language grammar." },
    { term: "Abstract Syntax Tree (AST)", definition: "A tree data structure representing the syntactic structure of source code. Each node corresponds to a construct (expression, statement, declaration) in the source language." },
    { term: "Intermediate Representation (IR)", definition: "A platform-independent code representation used between the front end and back end of a compiler. Enables language-independent optimizations." },
    { term: "SSA (Static Single Assignment)", definition: "An IR property where each variable is assigned exactly once. Uses phi functions at control-flow join points to reconcile definitions from different paths." },
    { term: "JIT (Just-In-Time) Compilation", definition: "Compilation performed during program execution, targeting frequently executed code paths. Enables runtime profiling and speculative optimization." },
    { term: "Deoptimization", definition: "The process of discarding JIT-compiled native code and reverting to interpreted execution when speculative optimization assumptions are violated." },
    { term: "Link-Time Optimization (LTO)", definition: "An optimization technique that performs whole-program analysis and optimization across compilation unit boundaries during the linking stage." },
    { term: "Transpiler", definition: "A source-to-source compiler that translates code from one high-level language to another (e.g., TypeScript to JavaScript), rather than to machine code." },
  ],
};
