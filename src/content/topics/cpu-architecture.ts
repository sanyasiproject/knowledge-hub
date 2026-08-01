import type { TopicContent } from "../types";

export const cpuArchitecture: TopicContent = {
  quickSummary: [
    "A CPU executes instructions through a fetch-decode-execute cycle: fetch the instruction from memory, decode its opcode and operands, then execute the operation in the ALU or other functional unit.",
    "Von Neumann architecture uses a single memory for both instructions and data; Harvard architecture separates them, enabling simultaneous instruction fetch and data access.",
    "Pipelining overlaps multiple instructions in different stages of execution, increasing throughput but introducing hazards (data, control, structural) that must be managed.",
    "CISC processors (x86) use complex, variable-length instructions; RISC processors (ARM, RISC-V) use simple, fixed-length instructions that are easier to pipeline.",
  ],
  detailed: [
    "The Central Processing Unit consists of three main components: the Arithmetic Logic Unit (ALU) that performs mathematical and logical operations, the Control Unit (CU) that orchestrates instruction execution by generating control signals, and the register file that provides fast temporary storage. The program counter (PC) holds the address of the next instruction, the instruction register (IR) holds the currently executing instruction, and general-purpose registers hold operands and intermediate results.",
    "The Von Neumann architecture stores both program instructions and data in the same memory, connected to the CPU via a single bus. This creates the Von Neumann bottleneck: the CPU cannot simultaneously fetch an instruction and read/write data. The Harvard architecture eliminates this bottleneck by using separate memories and buses for instructions and data. Most modern CPUs use a modified Harvard architecture — separate L1 instruction and data caches but a unified main memory.",
    "Pipelining divides instruction execution into stages (classically: fetch, decode, execute, memory access, write-back) and processes one instruction per stage simultaneously. An ideal 5-stage pipeline achieves 5x throughput over a non-pipelined CPU. However, hazards reduce this: data hazards occur when an instruction depends on the result of a previous instruction still in the pipeline, control hazards occur at branches when the next instruction address is unknown, and structural hazards occur when hardware resources are contended.",
    "CISC (Complex Instruction Set Computing) architectures like x86 offer rich instruction sets with variable-length instructions, memory-to-memory operations, and complex addressing modes. RISC (Reduced Instruction Set Computing) architectures like ARM and RISC-V use fixed-length instructions, load-store architecture (only load/store access memory), and simpler addressing modes. RISC designs pipeline more efficiently and consume less power, which is why ARM dominates mobile and embedded computing. Modern x86 CPUs internally translate CISC instructions into RISC-like micro-operations (uops) to pipeline efficiently.",
    "Superscalar processors can issue multiple instructions per cycle by having multiple execution units (ALUs, FPUs, load/store units). Out-of-order execution allows the CPU to reorder instructions dynamically to fill pipeline bubbles, using techniques like register renaming (eliminating false dependencies), reservation stations (buffering instructions waiting for operands), and a reorder buffer (committing results in program order). Branch prediction uses history tables and pattern detectors to guess branch outcomes, achieving accuracy above 95% in modern CPUs.",
  ],
  deepDive: [
    "The instruction pipeline in a modern out-of-order superscalar CPU is far more complex than the classic 5-stage model. Intel's recent cores have 14+ pipeline stages. The front end fetches and decodes macro-instructions into micro-operations, predicts branches, and feeds a micro-op queue. The back end renames registers to eliminate WAR and WAW hazards, dispatches uops to reservation stations grouped by execution port, executes them out of order when operands are ready, and retires them in order through the reorder buffer (ROB). The ROB ensures precise exceptions — if a speculated instruction causes a fault, all later speculated results can be squashed.",
    "Branch prediction has evolved from simple schemes (always-taken, 1-bit saturating counter) to sophisticated multi-level predictors. The two-level adaptive predictor uses a Branch History Register (BHR) recording the last k branch outcomes and a Pattern History Table (PHT) indexed by both the BHR and the branch address. TAGE (Tagged Geometric History Length) predictors use multiple tables with geometrically increasing history lengths to capture both short and long patterns. Misprediction penalties in deep pipelines can be 15-20 cycles, making prediction accuracy critical for performance.",
    "Memory-level parallelism is another key performance factor. Modern CPUs can have dozens of outstanding cache misses in flight simultaneously through non-blocking caches and miss status holding registers (MSHRs). Hardware prefetchers detect stride patterns in memory access and speculatively fetch cache lines before they are needed. The CPU also performs store-to-load forwarding — if a load reads an address that a prior store (still in the store buffer) wrote, the data is forwarded directly without waiting for the store to commit to cache.",
    "Speculative execution — executing instructions before knowing whether they should execute — is fundamental to modern CPU performance but has security implications. The Spectre and Meltdown vulnerabilities exploit the fact that speculatively executed instructions leave observable side effects in the cache even after being squashed. Mitigations include retpolines (for indirect branch speculation), speculative store bypass disable, and microcode updates that add barriers at security-critical boundaries. These mitigations have measurable performance costs, illustrating the tension between performance and security in CPU design.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Simulating a basic fetch-decode-execute cycle",
      source: `#include <array>
#include <vector>
#include <cstdint>
#include <cstdio>

// A minimal CPU simulator demonstrating the fetch-decode-execute cycle.
class SimpleCPU {
public:
    explicit SimpleCPU(const std::vector<uint16_t>& program) {
        memory_.fill(0);
        for (size_t i = 0; i < program.size(); ++i)
            memory_[i] = program[i];
    }

    uint16_t fetch() {
        return memory_[pc_++];
    }

    struct Decoded { int opcode, rd, rs1, rs2; };

    Decoded decode(uint16_t instruction) {
        return {
            (instruction >> 12) & 0xF,
            (instruction >> 8)  & 0xF,
            (instruction >> 4)  & 0xF,
             instruction        & 0xF
        };
    }

    void execute(const Decoded& d) {
        switch (d.opcode) {
            case 0x0: halted_ = true; break;                                  // HALT
            case 0x1: regs_[d.rd] = regs_[d.rs1] + regs_[d.rs2]; break;      // ADD
            case 0x2: regs_[d.rd] = regs_[d.rs1] - regs_[d.rs2]; break;      // SUB
            case 0x3: regs_[d.rd] = d.rs1; break;                            // LOAD imm
            case 0x4: regs_[d.rd] = regs_[d.rs1] * regs_[d.rs2]; break;      // MUL
        }
    }

    void run() {
        while (!halted_ && pc_ < memory_.size()) {
            uint16_t instr = fetch();
            auto d = decode(instr);
            execute(d);
            std::printf("PC=%3d | Op=0x%x | Regs=[%d, %d, %d, %d]\\n",
                        pc_, d.opcode, regs_[0], regs_[1], regs_[2], regs_[3]);
        }
    }

private:
    std::array<uint16_t, 256> memory_{};
    std::array<int, 4> regs_{};  // R0-R3
    int pc_ = 0;
    bool halted_ = false;
};

int main() {
    // Program: R0=5, R1=3, R2 = R0+R1, R3 = R0*R1, HALT
    std::vector<uint16_t> program = {
        0x3050,  // LOAD R0, 5
        0x3130,  // LOAD R1, 3
        0x1201,  // ADD R2, R0, R1
        0x4301,  // MUL R3, R0, R1
        0x0000,  // HALT
    };
    SimpleCPU cpu(program);
    cpu.run();
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Pipeline hazard detection simulator",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

struct Instruction {
    std::string name;
    std::string dest;               // Destination register (empty if none)
    std::vector<std::string> src;   // Source registers
};

// Detect RAW (read-after-write) data hazards in an instruction sequence.
std::vector<std::string> detectDataHazards(const std::vector<Instruction>& pipeline) {
    std::vector<std::string> hazards;
    for (size_t i = 1; i < pipeline.size(); ++i) {
        for (size_t j = (i >= 2 ? i - 2 : 0); j < i; ++j) {
            if (pipeline[j].dest.empty()) continue;
            for (const auto& src : pipeline[i].src) {
                if (src == pipeline[j].dest) {
                    int distance = static_cast<int>(i - j);
                    std::string hazardType = (distance == 1)
                        ? "needs stall" : "forwarding possible";
                    hazards.push_back(
                        "RAW hazard: " + pipeline[i].name + " reads "
                        + pipeline[j].dest + " written by " + pipeline[j].name
                        + " (" + std::to_string(distance) + " cycle"
                        + (distance > 1 ? "s" : "") + " apart, "
                        + hazardType + ")");
                }
            }
        }
    }
    return hazards;
}

int main() {
    std::vector<Instruction> instructions = {
        {"ADD R1, R2, R3", "R1", {"R2", "R3"}},
        {"SUB R4, R1, R5", "R4", {"R1", "R5"}},  // RAW on R1 (1 apart)
        {"AND R6, R1, R4", "R6", {"R1", "R4"}},  // RAW on R1 (2) and R4 (1)
        {"OR  R7, R6, R2", "R7", {"R6", "R2"}},  // RAW on R6 (1)
    };

    for (const auto& h : detectDataHazards(instructions)) {
        std::cout << h << "\\n";
    }
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "CPU Internal Architecture",
      kind: "architecture",
      caption: "Internal structure of a modern CPU showing the ALU, control unit, register file, and cache hierarchy with their interconnections.",
      mermaid: `flowchart TB
    subgraph CPU["CPU Die"]
        subgraph Frontend["Front End"]
            ICache["L1 Instruction Cache\n32 KB"]
            Fetch["Instruction Fetch\nBranch Predictor"]
            Decode["Decode\nCISC to uops"]
        end

        subgraph Backend["Back End"]
            RenameDispatch["Register Rename\nand Dispatch"]
            RS["Reservation Stations\nwait for operands"]
            ALU1["ALU 1\nInteger"]
            ALU2["ALU 2\nInteger"]
            FPU["FPU\nFloat and SIMD"]
            LSU["Load Store Unit"]
            ROB["Reorder Buffer\ncommit in order"]
        end

        DCache["L1 Data Cache\n32 KB"]
        L2["L2 Cache\n256 KB"]
    end

    L3["L3 Cache - shared\n8-32 MB"]
    DRAM["Main Memory - DRAM\nGBs"]

    ICache --> Fetch --> Decode --> RenameDispatch
    RenameDispatch --> RS
    RS --> ALU1
    RS --> ALU2
    RS --> FPU
    RS --> LSU
    ALU1 --> ROB
    ALU2 --> ROB
    FPU --> ROB
    LSU --> DCache
    DCache --> L2 --> L3 --> DRAM`,
    },
    {
      title: "5-Stage Pipeline Execution Flow",
      kind: "flow",
      caption: "Classic RISC 5-stage pipeline showing how instructions overlap in IF, ID, EX, MEM, and WB stages across clock cycles.",
      mermaid: `flowchart LR
    subgraph Cycle1["Clock Cycle"]
        IF["Instruction Fetch\nLoad instruction from I-Cache\nIncrement PC"]
        ID["Instruction Decode\nRead opcode and operands\nFetch register values"]
        EX["Execute\nALU operation\nCompute address"]
        MEM["Memory Access\nLoad from D-Cache\nStore to D-Cache"]
        WB["Write Back\nWrite result to\nregister file"]
    end

    IF --> ID --> EX --> MEM --> WB

    subgraph Hazards["Hazard Handling"]
        RAW["RAW Data Hazard\nForwarding from EX to EX\nor stall pipeline"]
        Control["Control Hazard\nBranch prediction\nor flush on mispredict"]
        Structural["Structural Hazard\nDuplicate resources\nor stall"]
    end`,
    },
    {
      title: "CPU Architecture Concepts",
      kind: "mindmap",
      caption: "Key CPU architecture concepts grouped by design philosophy, pipeline mechanics, hazard types, and performance techniques.",
      mermaid: `mindmap
  root["CPU Architecture"]
    Design Philosophies
      Von Neumann
        Shared instruction and data memory
        Single bus bottleneck
      Harvard
        Separate instruction and data memory
        No bottleneck
      Modified Harvard
        Split L1 caches
        Unified main memory
    Instruction Sets
      CISC - x86
        Variable length instructions
        Many addressing modes
        Internally decoded to uops
      RISC - ARM RISC-V
        Fixed length 4 bytes
        Load-store only
        Easier to pipeline
    Pipeline Mechanics
      Fetch Decode Execute
      Superscalar - multi-issue
      Out-of-Order Execution
      Register Renaming
      Reorder Buffer
    Hazards
      Data - RAW WAR WAW
      Control - branches
      Structural - resource conflict
    Performance
      Branch Prediction
      Hardware Prefetcher
      Store-to-Load Forwarding
      SIMD Parallelism`,
    },
    {
      title: "Out-of-Order Execution Sequence",
      kind: "sequence",
      caption: "How an out-of-order CPU fetches, renames, dispatches, executes, and retires instructions while hiding latency.",
      mermaid: `sequenceDiagram
    participant FE as Front End
    participant RN as Rename Unit
    participant RS as Reservation Station
    participant ALU as ALU
    participant ROB as Reorder Buffer

    FE->>RN: Decoded uops in program order
    RN->>RN: Map arch regs to physical regs
    RN->>RS: Dispatch uops with physical reg ids
    RN->>ROB: Allocate entry - keep program order

    Note over RS,ALU: Out-of-order execution
    RS->>ALU: Issue uop when all operands ready
    ALU->>RS: Broadcast result to waiting uops
    ALU->>ROB: Mark entry complete

    Note over ROB: In-order retirement
    ROB->>ROB: Retire oldest completed entry
    ROB->>ROB: Free physical register
    ROB->>ROB: Commit architectural state`,
    },
  ],
  animations: [
    {
      title: "Fetch-Decode-Execute cycle",
      steps: [
        {
          label: "Fetch",
          detail:
            "The PC sends the current instruction address to memory. The instruction is loaded into the Instruction Register (IR). The PC is incremented to point to the next instruction.",
        },
        {
          label: "Decode",
          detail:
            "The control unit reads the opcode from the IR, determines the operation type, identifies source and destination registers, and generates the appropriate control signals.",
        },
        {
          label: "Execute",
          detail:
            "The ALU performs the operation (arithmetic, logic, comparison) using values from the register file. For load/store instructions, the ALU computes the effective memory address.",
        },
        {
          label: "Memory access",
          detail:
            "If the instruction is a load, data is read from memory/cache at the computed address. If a store, data from a register is written to the computed address. Non-memory instructions skip this stage.",
        },
        {
          label: "Write-back",
          detail:
            "The result (from the ALU or from memory) is written into the destination register in the register file. The cycle then repeats from Fetch with the next instruction.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "CISC (e.g., x86)", "RISC (e.g., ARM, RISC-V)"],
    rows: [
      ["Instruction length", "Variable (1-15 bytes on x86)", "Fixed (4 bytes typically)"],
      ["Instruction count", "Large (1000+ in x86-64)", "Small (50-200 base instructions)"],
      ["Memory access", "Many instructions can access memory directly", "Only load/store instructions access memory"],
      ["Pipelining", "Complex due to variable-length instructions", "Naturally suited to pipelining"],
      ["Code density", "Higher (fewer instructions per task)", "Lower (more instructions, but simpler)"],
      ["Power consumption", "Higher (complex decode logic)", "Lower (simpler hardware)"],
      ["Typical use case", "Desktops, servers, laptops", "Mobile, embedded, increasingly servers (Apple M-series, AWS Graviton)"],
    ],
  },
  interviewQA: [
    {
      q: "What is the Von Neumann bottleneck and how do modern CPUs mitigate it?",
      a: "The Von Neumann bottleneck is the limited throughput between the CPU and memory caused by sharing a single bus for both instructions and data. Modern CPUs mitigate it with a modified Harvard architecture: separate L1 instruction and data caches (eliminating the shared-bus contention at the fastest level), multi-level cache hierarchies (L2/L3) to reduce main memory accesses, and prefetching to hide memory latency.",
      followUps: [
        "What is the difference between a pure Harvard and modified Harvard architecture?",
        "How do cache hierarchies interact with virtual memory?",
      ],
    },
    {
      q: "Explain the three types of pipeline hazards and how each is resolved.",
      a: "Data hazards (RAW: read-after-write) occur when an instruction needs a value not yet computed by a prior instruction — resolved by forwarding/bypassing (routing the result directly from the ALU output to the next instruction's input) or by inserting stalls. Control hazards arise at branches when the next PC is unknown — resolved by branch prediction, delayed branching, or speculative execution. Structural hazards occur when two instructions need the same hardware resource — resolved by duplicating resources (e.g., separate instruction and data cache ports).",
      followUps: [
        "What is the difference between RAW, WAR, and WAW hazards?",
        "How does register renaming eliminate WAR and WAW hazards?",
      ],
    },
    {
      q: "Why do modern x86 CPUs internally use RISC-like micro-operations?",
      a: "x86 instructions are complex and variable-length, making them hard to pipeline efficiently. Modern x86 CPUs decode each CISC macro-instruction into one or more simple, fixed-format micro-operations (uops) that flow through a RISC-like out-of-order pipeline. This gives the benefits of RISC pipelining (high throughput, out-of-order execution) while maintaining backward compatibility with the x86 instruction set.",
      followUps: [
        "What is the performance cost of the x86 decode stage compared to native RISC?",
        "What is a micro-op cache and why does it help? (Intel calls it the DSB — Decoded Stream Buffer.)",
      ],
    },
    {
      q: "What is branch prediction and why is it critical for performance?",
      a: "Branch prediction is the CPU's mechanism for guessing the outcome (taken/not-taken) and target address of branch instructions before they are resolved. It is critical because a misprediction in a deep pipeline (14+ stages) wastes 15-20 cycles as all speculatively fetched instructions must be flushed. Modern predictors like TAGE achieve 95%+ accuracy by correlating branch history across multiple history lengths.",
      followUps: [
        "What is the difference between static and dynamic branch prediction?",
        "How did Spectre exploit speculative execution?",
      ],
    },
  ],
  followUps: [
    "How does the memory hierarchy (caches, RAM, disk) interact with CPU pipeline performance?",
    "What is instruction-level parallelism (ILP) and what limits it in practice?",
    "How do multi-core CPUs differ from superscalar single-core CPUs in exploiting parallelism?",
    "How does the ARM architecture achieve better performance-per-watt than x86?",
  ],
  mcqs: [
    {
      q: "In a Von Neumann architecture, instructions and data:",
      options: [
        "Are stored in separate memories with separate buses",
        "Share the same memory and bus",
        "Are stored in registers only",
        "Are always fetched simultaneously",
      ],
      answerIndex: 1,
      explanation:
        "Von Neumann architecture uses a single memory for both instructions and data, accessed through a shared bus. This simplifies design but creates the Von Neumann bottleneck.",
    },
    {
      q: "Which pipeline hazard occurs when a branch instruction makes the next PC unknown?",
      options: [
        "Data hazard",
        "Structural hazard",
        "Control hazard",
        "Resource hazard",
      ],
      answerIndex: 2,
      explanation:
        "Control hazards (branch hazards) occur when the pipeline cannot determine the next instruction address because a branch has not yet been resolved. Branch prediction mitigates this.",
    },
    {
      q: "What technique resolves RAW data hazards without stalling the pipeline?",
      options: [
        "Branch prediction",
        "Data forwarding (bypassing)",
        "Register renaming",
        "Instruction reordering",
      ],
      answerIndex: 1,
      explanation:
        "Data forwarding routes the result from the ALU output directly to the input of the dependent instruction, bypassing the register file write-back. Register renaming solves WAR/WAW, not RAW.",
    },
    {
      q: "RISC architectures typically use which memory access model?",
      options: [
        "Memory-to-memory operations",
        "Stack-based operations",
        "Load-store architecture",
        "Direct memory execution",
      ],
      answerIndex: 2,
      explanation:
        "RISC uses a load-store model: only dedicated load and store instructions access memory. All other operations work on registers. This simplifies pipeline design.",
    },
    {
      q: "A superscalar processor improves performance by:",
      options: [
        "Increasing clock speed",
        "Using longer pipelines",
        "Issuing multiple instructions per clock cycle",
        "Using larger caches",
      ],
      answerIndex: 2,
      explanation:
        "Superscalar processors have multiple execution units and can issue and execute more than one instruction per clock cycle, exploiting instruction-level parallelism.",
    },
  ],
  exercises: [
    "Trace through a 5-stage pipeline diagram for the sequence: ADD R1,R2,R3; SUB R4,R1,R5; AND R6,R1,R7. Identify all data hazards and show where forwarding or stalls are needed.",
    "Write a program for the SimpleCPU simulator above that computes the factorial of a number stored in R0 (you will need to extend the ISA with a branch instruction).",
    "Compare the instruction count and cycle count for computing the dot product of two 4-element vectors on a CISC-style vs RISC-style instruction set.",
    "Research and explain how Intel's P6 microarchitecture (Pentium Pro) pioneered out-of-order execution with register renaming and the reorder buffer.",
  ],
  flashcards: [
    {
      front: "What are the three main components of a CPU?",
      back: "ALU (Arithmetic Logic Unit) — performs operations. Control Unit (CU) — decodes instructions and generates control signals. Register File — fast temporary storage for operands and results.",
    },
    {
      front: "What is the Von Neumann bottleneck?",
      back: "The limited bandwidth between CPU and memory when instructions and data share a single bus. The CPU often stalls waiting for memory. Mitigated by caches and modified Harvard architecture.",
    },
    {
      front: "Name the 5 classic RISC pipeline stages.",
      back: "IF (Instruction Fetch), ID (Instruction Decode), EX (Execute), MEM (Memory Access), WB (Write-Back).",
    },
    {
      front: "What is data forwarding (bypassing)?",
      back: "A hardware technique that routes the ALU result directly to the input of a dependent instruction without waiting for write-back to the register file, resolving RAW hazards without stalls.",
    },
    {
      front: "CISC vs RISC: key difference in memory access?",
      back: "CISC allows many instructions to access memory directly. RISC uses load-store architecture — only load and store instructions touch memory; all computation uses registers.",
    },
    {
      front: "What is out-of-order execution?",
      back: "The CPU dynamically reorders instructions to execute them as soon as their operands are ready, rather than in strict program order. Results are committed in order via a reorder buffer.",
    },
    {
      front: "What is register renaming and what hazards does it eliminate?",
      back: "Register renaming maps architectural registers to a larger set of physical registers, eliminating false dependencies: WAR (write-after-read) and WAW (write-after-write) hazards.",
    },
    {
      front: "What is the penalty for a branch misprediction?",
      back: "All speculatively fetched instructions in the pipeline must be flushed. In a modern deep pipeline (14+ stages), this costs 15-20 cycles of lost work.",
    },
  ],
  revisionNotes: [
    "CPU = ALU + Control Unit + Registers. The ALU computes, the CU orchestrates, registers store operands.",
    "Von Neumann: shared instruction/data memory (bottleneck). Harvard: separate memories (no bottleneck but more complex). Modern CPUs: modified Harvard (split L1 caches, unified main memory).",
    "Pipeline hazards: Data (RAW — forwarding), Control (branches — prediction), Structural (resource contention — duplication).",
    "CISC: complex variable-length instructions, fewer needed per task. RISC: simple fixed-length instructions, easier to pipeline, lower power.",
    "Superscalar = multiple instructions per cycle. Out-of-order = execute when ready, commit in order. Both exploit instruction-level parallelism.",
    "Branch prediction accuracy > 95% in modern CPUs. Misprediction cost = pipeline depth in cycles.",
  ],
  cheatSheet: [
    "Fetch-Decode-Execute: PC -> Memory -> IR -> Decode -> ALU -> Write-back -> Repeat",
    "Pipeline throughput: ideal CPI = 1 (one instruction completes per cycle), actual CPI > 1 due to hazards",
    "RAW hazard fix: forwarding. WAR/WAW fix: register renaming. Control hazard fix: branch prediction.",
    "x86 = CISC externally, RISC internally (macro-ops decoded to micro-ops / uops)",
    "IPC (Instructions Per Clock) = 1/CPI. Higher IPC = better pipeline utilization.",
    "Superscalar width: modern CPUs can issue 4-8 uops per cycle from multiple execution ports.",
  ],
  resources: [
    {
      label: "Computer Organization and Design (Patterson & Hennessy)",
      kind: "book",
      note: "The definitive RISC-oriented textbook covering pipeline design, hazards, and the MIPS/RISC-V ISA in depth.",
    },
    {
      label: "Computer Architecture: A Quantitative Approach (Hennessy & Patterson)",
      kind: "book",
      note: "Advanced treatment of superscalar, out-of-order, and memory hierarchy design with quantitative analysis.",
    },
    {
      label: "Agner Fog's Microarchitecture Manual",
      kind: "docs",
      note: "Detailed reverse-engineered documentation of Intel and AMD CPU pipelines, branch predictors, and execution ports.",
    },
    {
      label: "RISC-V International Specifications",
      kind: "docs",
      note: "Open-source ISA specification. Reading the base integer ISA (RV32I) is an excellent way to understand RISC design principles.",
    },
    {
      label: "Branch Prediction and the Performance of Interpreters (Rohou et al.)",
      kind: "paper",
      note: "Academic paper exploring how branch prediction interacts with interpreter dispatch loops.",
    },
  ],
  glossary: [
    {
      term: "ALU (Arithmetic Logic Unit)",
      definition:
        "The CPU component that performs arithmetic (add, subtract, multiply) and logical (AND, OR, XOR, shift) operations on register values.",
    },
    {
      term: "Program Counter (PC)",
      definition:
        "A register that holds the memory address of the next instruction to be fetched. Incremented after each fetch; modified by branch/jump instructions.",
    },
    {
      term: "Pipeline stall (bubble)",
      definition:
        "A cycle in which no useful work is done in a pipeline stage, inserted to resolve a hazard. Reduces throughput below the ideal 1 instruction per cycle.",
    },
    {
      term: "Superscalar",
      definition:
        "A CPU design that can issue and execute multiple instructions in the same clock cycle by having multiple parallel execution units.",
    },
    {
      term: "Micro-operation (uop)",
      definition:
        "A simple, fixed-format internal instruction that modern CISC CPUs decode macro-instructions into for efficient pipelining and out-of-order execution.",
    },
    {
      term: "Branch predictor",
      definition:
        "Hardware that predicts whether a conditional branch will be taken or not taken, and predicts the target address, to keep the pipeline full.",
    },
    {
      term: "Reorder buffer (ROB)",
      definition:
        "A circular buffer that tracks instructions executed out of order and retires (commits) their results in original program order, ensuring precise exceptions.",
    },
    {
      term: "Instruction Set Architecture (ISA)",
      definition:
        "The abstract interface between hardware and software, defining the set of instructions, registers, addressing modes, and data types a CPU supports.",
    },
  ],
};
