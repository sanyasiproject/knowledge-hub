import type { TopicContent } from "../types";

export const contextSwitching: TopicContent = {
  quickSummary: [
    "A context switch is the process of saving the state (registers, program counter, stack pointer) of the currently running process/thread and restoring the state of the next one to run.",
    "Context switches are pure overhead -- no useful work is done during the switch itself, and they cause cache and TLB pollution.",
    "Typical context-switch cost on modern hardware is 1-10 microseconds for the direct cost, but indirect costs (cache misses, TLB flushes) can be much larger.",
    "Context switches are triggered by interrupts, system calls, scheduling decisions (preemption, time quantum expiry), and voluntary yields.",
  ],
  detailed: [
    "When the OS decides to switch from one process to another, it must save the entire execution context of the current process into its Process Control Block (PCB). This includes the program counter, CPU registers (general-purpose, floating-point, SIMD), stack pointer, process state, memory management information (page table base register), and any CPU-specific control registers. The OS then loads the saved context of the next process from its PCB and resumes execution.",
    "Thread context switches within the same process are cheaper than process context switches because threads share the same address space. A thread switch only needs to save and restore register state, stack pointer, and program counter -- it does not need to switch page tables or flush the TLB. This is one of the key performance advantages of multi-threading over multi-processing.",
    "The direct cost of a context switch includes saving and restoring registers (dozens of registers on x86-64, including 16 general-purpose, 16 YMM/ZMM SIMD registers, and control registers). But the indirect cost is often far larger: the new process's working set is not in the CPU cache, causing a burst of cache misses. On a process switch, the TLB is typically flushed (unless the CPU supports PCID/ASID tagging), meaning every memory access after the switch incurs a TLB miss and page table walk until the TLB is repopulated.",
    "Modern CPUs mitigate context-switch costs through hardware features. Process Context Identifiers (PCID on Intel, ASID on ARM) tag TLB entries with a process identifier, avoiding TLB flushes on context switches. Last-level caches are large enough that multiple working sets may coexist. Hardware also provides fast register save/restore instructions (XSAVE/XRSTOR for extended register state on x86).",
    "The frequency of context switches varies by workload. A desktop system might perform 1,000-10,000 context switches per second, while a heavily loaded server could see 100,000+. Excessive context switching is a symptom of too many runnable threads competing for too few cores, and can be diagnosed with tools like vmstat (cs column), perf sched, or pidstat -w.",
  ],
  deepDive: [
    "On x86-64 Linux, a context switch involves: (1) entering kernel mode via interrupt/syscall, (2) saving the current task's register state into its kernel stack's pt_regs structure, (3) calling schedule() which invokes __schedule() -> context_switch() -> switch_to(), (4) switch_mm_irqs_off() changes the page table base (CR3 register) if switching between processes, (5) switch_to() performs the actual register swap using assembly, switching the kernel stack pointer, and (6) returning to user mode for the new task. The switch_to macro on x86-64 saves/restores callee-saved registers (rbx, rbp, r12-r15) and swaps the stack pointer.",
    "TLB management during context switches is critical for performance. Without PCID, writing to CR3 (the page table base register) flushes all TLB entries, and the new process starts with a cold TLB. With PCID (supported since Intel Haswell), the hardware can retain TLB entries for multiple address spaces simultaneously, tagged by a 12-bit identifier. Linux allocates PCIDs per-CPU using a 6-entry LRU cache (TLB_NR_DYN_ASIDS). When the PCID space is full and a new process is loaded, the least-recently-used PCID is evicted and its TLB entries are flushed.",
    "Voluntary vs involuntary context switches reveal different system behaviors. Voluntary switches happen when a process blocks on I/O, waits on a lock, or calls sched_yield(). Involuntary switches happen when the scheduler preempts a process (timer interrupt, higher-priority task arrival). High voluntary switches indicate I/O-heavy workloads. High involuntary switches indicate CPU contention. The /proc/[pid]/status file shows both counts (voluntary_ctxt_switches and nonvoluntary_ctxt_switches).",
    "In real-time and latency-sensitive applications, context-switch overhead is a critical concern. Techniques to minimize it include: CPU pinning (isolating cores for critical tasks using isolcpus and taskset), using SCHED_FIFO to avoid preemption, reducing the number of runnable threads to match core count, using user-space scheduling (like goroutines or green threads) where switches are just stack swaps without kernel involvement, and leveraging huge pages to reduce TLB pressure.",
    "User-space context switching, as used in coroutines and green threads, is dramatically cheaper than kernel context switching. A coroutine switch only needs to save and restore the stack pointer and a few registers (typically 6-8 callee-saved registers), with no kernel transition, no TLB flush, and no mode switch. Libraries like Boost.Context or libco achieve switch times under 100 nanoseconds, roughly 100x faster than a full kernel context switch.",
  ],
  code: [
    {
      language: "c",
      caption: "Simplified context switch in xv6 (educational OS)",
      source: `// xv6 swtch.S -- switch between two kernel thread contexts
// void swtch(struct context **old, struct context *new);
//
// Save callee-saved registers on the old stack,
// switch stacks, restore callee-saved registers from the new stack.

.globl swtch
swtch:
    # Save old callee-saved registers
    movl 4(%esp), %eax    # eax = &old->context
    movl 8(%esp), %edx    # edx = new context

    # Push callee-saved registers onto old stack
    pushl %ebp
    pushl %ebx
    pushl %esi
    pushl %edi

    # Switch stacks
    movl %esp, (%eax)     # save old stack pointer
    movl %edx, %esp       # load new stack pointer

    # Restore callee-saved registers from new stack
    popl %edi
    popl %esi
    popl %ebx
    popl %ebp
    ret                   # return to new thread's saved return address`,
    },
    {
      language: "cpp",
      caption: "Measuring context-switch overhead using pipe ping-pong",
      source: `#include <unistd.h>
#include <sys/wait.h>
#include <chrono>
#include <cstdio>
#include <cstdlib>

void measure_context_switch(int iterations = 100000) {
    // Measure context-switch time by bouncing a byte between
    // parent and child processes through pipes.
    int p2c[2], c2p[2]; // parent-to-child, child-to-parent
    pipe(p2c);
    pipe(c2p);

    pid_t pid = fork();
    if (pid == 0) {
        // Child: read from p2c, write to c2p
        close(p2c[1]);
        close(c2p[0]);
        char buf;
        for (int i = 0; i < iterations; ++i) {
            read(p2c[0], &buf, 1);
            write(c2p[1], "x", 1);
        }
        _exit(0);
    } else {
        // Parent: write to p2c, read from c2p
        close(p2c[0]);
        close(c2p[1]);
        char buf;

        auto start = std::chrono::steady_clock::now();
        for (int i = 0; i < iterations; ++i) {
            write(p2c[1], "x", 1);
            read(c2p[0], &buf, 1);
        }
        auto end = std::chrono::steady_clock::now();

        waitpid(pid, nullptr, 0);
        auto elapsed_ns = std::chrono::duration_cast<
            std::chrono::nanoseconds>(end - start).count();
        // Each iteration = 2 context switches (parent->child, child->parent)
        long per_switch_ns = elapsed_ns / (2 * iterations);
        std::printf("Estimated context-switch time: %ld ns\\n", per_switch_ns);
    }
}

int main() {
    measure_context_switch();
    return 0;
}`,
    },
    {
      language: "c",
      caption: "User-space coroutine context switch (minimal setjmp/longjmp example)",
      source: `#include <stdio.h>
#include <setjmp.h>
#include <stdlib.h>

#define STACK_SIZE 65536

typedef struct {
    jmp_buf env;
    char *stack;
    void (*func)(void *);
    void *arg;
    int finished;
} Coroutine;

static Coroutine *current;
static jmp_buf main_env;

void coroutine_yield(void) {
    if (setjmp(current->env) == 0) {
        longjmp(main_env, 1);  // return to scheduler
    }
}

void coroutine_resume(Coroutine *co) {
    current = co;
    if (setjmp(main_env) == 0) {
        longjmp(co->env, 1);  // jump to coroutine
    }
}

// Note: production coroutine libraries use assembly (e.g., Boost.Context)
// for proper stack switching. setjmp/longjmp is shown for illustration.`,
    },
  ],
  diagrams: [
    {
      title: "Context switch between two processes",
      kind: "sequence",
      caption: "Shows Process A running, interrupt occurs, kernel saves A's state to PCB_A, loads PCB_B's state, Process B resumes.",
    },
    {
      title: "Hardware context: what gets saved",
      kind: "architecture",
      caption: "Program counter, general registers, stack pointer, FP/SIMD registers, flags register, page table base (CR3), segment registers.",
    },
    {
      title: "Thread vs process context switch cost breakdown",
      kind: "flow",
      caption: "Thread switch: save/restore registers only. Process switch: registers + page table switch + TLB flush (unless PCID).",
    },
  ],
  animations: [
    {
      title: "Process context switch step by step",
      steps: [
        { label: "Timer interrupt fires", detail: "The hardware timer fires, triggering an interrupt. CPU saves the current instruction pointer and flags, then jumps to the interrupt handler in kernel mode." },
        { label: "Save user registers", detail: "The interrupt handler pushes all user-mode registers (rax, rbx, ..., r15, rflags, rip, rsp) onto the kernel stack in a pt_regs structure." },
        { label: "Scheduler selects next process", detail: "The scheduler's pick_next_task() function examines the run queue (e.g., CFS red-black tree) and selects the process with the smallest vruntime." },
        { label: "Switch address space", detail: "If switching to a different process, switch_mm() loads the new process's page table base into CR3. Without PCID, this flushes the TLB." },
        { label: "Switch kernel stack", detail: "switch_to() swaps the kernel stack pointer from the old task's stack to the new task's stack, and saves/restores callee-saved registers." },
        { label: "Restore user registers", detail: "As the new task returns from its last kernel entry point, the saved pt_regs are popped back into the CPU registers." },
        { label: "Return to user mode", detail: "IRET (or SYSRET) returns to user mode, restoring the new process's program counter and stack pointer. The new process resumes execution." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Thread Context Switch", "Process Context Switch", "Coroutine Switch"],
    rows: [
      ["What is saved", "Registers, PC, SP", "Registers, PC, SP, page tables, FP state", "A few callee-saved registers + SP"],
      ["TLB flush needed", "No (same address space)", "Yes (unless PCID/ASID)", "No (user-space, same process)"],
      ["Kernel involvement", "Yes (kernel threads) / No (user threads)", "Yes", "No"],
      ["Typical cost", "~1-3 us", "~3-10 us (+ cache/TLB misses)", "~10-100 ns"],
      ["Cache impact", "Minimal (shared address space)", "Significant (different working set)", "Minimal"],
      ["Triggers", "Scheduler preemption, blocking", "Scheduler preemption, blocking", "Explicit yield"],
      ["Example", "pthreads on same process", "Fork/exec, separate processes", "Go goroutines, Lua coroutines"],
    ],
  },
  interviewQA: [
    {
      q: "What happens during a context switch?",
      a: "The OS saves the entire execution state (registers, program counter, stack pointer, page table base register) of the currently running process into its Process Control Block (PCB), then loads the saved state of the next process from its PCB and resumes execution. On x86-64, this involves saving/restoring ~30+ registers, potentially flushing the TLB by writing to CR3, and switching kernel stacks. The direct cost is 1-10 microseconds, but indirect costs from cache and TLB pollution can add tens of microseconds more.",
      followUps: [
        "Why is a thread context switch cheaper than a process context switch?",
        "What is PCID and how does it help?",
      ],
    },
    {
      q: "Why are context switches considered overhead?",
      a: "Context switches produce no useful application work. The direct costs include saving/restoring registers and switching stacks. The indirect costs are often worse: the new process's data and instructions are not in the CPU cache, causing a burst of cache misses that can last thousands of cycles. The TLB is flushed on process switches (without PCID), meaning every memory access needs a page table walk until the TLB is repopulated. Branch predictor state is also invalidated. These indirect costs can make the effective context-switch cost 10-100x the direct register swap time.",
      followUps: [
        "How can you measure context-switch overhead?",
        "What techniques reduce context-switch frequency?",
      ],
    },
    {
      q: "How do you diagnose excessive context switching on a Linux system?",
      a: "Use vmstat to check the 'cs' (context switches per second) column -- anything over 50,000-100,000/s on a lightly loaded system warrants investigation. Use pidstat -w to see per-process voluntary and involuntary context switches. Use perf sched record/latency to get detailed scheduling event analysis. Check /proc/[pid]/status for cumulative counts. High involuntary switches suggest CPU contention (too many runnable threads). High voluntary switches suggest frequent blocking on I/O or locks. The solution often involves reducing thread count, using async I/O, or tuning scheduler parameters.",
    },
    {
      q: "What is the difference between voluntary and involuntary context switches?",
      a: "A voluntary context switch happens when a process willingly gives up the CPU -- typically by making a blocking system call (read, write, sleep, mutex lock) or calling sched_yield(). An involuntary context switch happens when the kernel forcibly preempts a running process, either because its time quantum expired (timer interrupt) or because a higher-priority process became runnable. High voluntary switches indicate I/O-bound behavior. High involuntary switches indicate CPU contention -- more runnable threads than available cores.",
    },
    {
      q: "How do green threads / goroutines achieve faster context switches than OS threads?",
      a: "Green threads and goroutines perform context switches entirely in user space, avoiding the kernel mode transition. They only need to save and restore a small set of callee-saved registers (6-8 on x86-64) and the stack pointer -- the calling convention guarantees the caller has already saved caller-saved registers. There is no TLB flush, no CR3 write, no interrupt handler overhead, and no kernel stack switch. A Go goroutine switch takes about 100-200 nanoseconds vs. 3-10 microseconds for a kernel thread switch. The Go runtime also uses small, growable stacks (starting at 2-8 KB vs. 1-8 MB for OS threads), enabling millions of concurrent goroutines.",
      followUps: [
        "What are the downsides of user-space scheduling?",
        "How does Go's scheduler (M:N threading) work?",
      ],
    },
  ],
  followUps: [
    "How does CPU scheduling interact with context switching?",
    "What is the role of the TLB in context-switch performance?",
    "How do hardware interrupts trigger context switches?",
    "What are the trade-offs of user-space vs kernel-space threading?",
    "How does NUMA topology affect context-switch costs?",
  ],
  mcqs: [
    {
      q: "Which type of context switch is the cheapest?",
      options: ["Process to process", "Kernel thread to kernel thread", "User-space coroutine switch", "Interrupt handler invocation"],
      answerIndex: 2,
      explanation: "User-space coroutine switches only swap a few registers and the stack pointer in user mode, with no kernel transition, TLB flush, or page table switch. They cost ~10-100 ns vs. microseconds for kernel switches.",
    },
    {
      q: "What hardware feature avoids TLB flushes during process context switches?",
      options: ["Huge pages", "PCID/ASID", "Hardware prefetcher", "Branch prediction"],
      answerIndex: 1,
      explanation: "Process Context Identifiers (PCID on Intel, ASID on ARM) tag TLB entries with a process identifier, allowing entries from multiple address spaces to coexist in the TLB without flushing.",
    },
    {
      q: "Why is a thread context switch cheaper than a process context switch?",
      options: [
        "Threads have fewer registers",
        "Threads share the address space, so no page table switch or TLB flush is needed",
        "Thread scheduling is done in user space",
        "Threads do not use the CPU cache",
      ],
      answerIndex: 1,
      explanation: "Threads within the same process share page tables. Switching between them requires only saving/restoring registers, not changing the page table base (CR3) or flushing the TLB.",
    },
    {
      q: "What Linux command shows per-process context-switch counts?",
      options: ["top", "ps aux", "pidstat -w", "htop"],
      answerIndex: 2,
      explanation: "pidstat -w shows voluntary and involuntary context switches per process per time interval. The information is also available in /proc/[pid]/status.",
    },
    {
      q: "Which register on x86-64 holds the page table base address and triggers a TLB flush when written?",
      options: ["RSP", "RIP", "CR3", "EFLAGS"],
      answerIndex: 2,
      explanation: "CR3 (Control Register 3) holds the physical address of the page directory. Writing to CR3 traditionally flushes the TLB (unless PCID is used with the NOFLUSH bit).",
    },
  ],
  exercises: [
    "Write a program that creates two processes communicating via pipes, and measure the average context-switch time by timing many round trips. Compare with thread-based communication using mutexes and condition variables.",
    "Use perf sched record and perf sched latency on a running system to analyze context-switch patterns. Identify which processes cause the most switches and categorize them as voluntary vs involuntary.",
    "Implement a simple user-space coroutine library in C using setjmp/longjmp or inline assembly. Benchmark the switch time against pthread context switches.",
    "Monitor context switches on a web server under increasing load using vmstat. Plot context switches/second vs. requests/second and identify the point where context-switch overhead becomes the bottleneck.",
    "Investigate the effect of CPU pinning on context-switch rates: run a multi-threaded application with and without taskset, and compare involuntary context-switch counts.",
  ],
  flashcards: [
    { front: "What is saved during a context switch?", back: "Program counter, CPU registers (general-purpose, FP, SIMD), stack pointer, flags register, and for process switches: page table base register (CR3), and potentially segment registers." },
    { front: "What is the typical direct cost of a context switch?", back: "1-10 microseconds for the register save/restore. Indirect costs (cache misses, TLB repopulation) can add 10-100+ microseconds depending on working set size." },
    { front: "Why do process switches flush the TLB?", back: "Each process has its own page table, so writing the new page table base to CR3 traditionally invalidates all TLB entries. PCID/ASID hardware can avoid this." },
    { front: "What is PCID?", back: "Process Context Identifier -- a hardware feature (12-bit tag on Intel) that allows TLB entries from multiple address spaces to coexist, avoiding TLB flushes on context switches." },
    { front: "Voluntary vs involuntary context switch?", back: "Voluntary: process blocks on I/O or yields. Involuntary: scheduler preempts the process (timer interrupt or higher-priority task)." },
    { front: "How to check context-switch rate on Linux?", back: "vmstat (cs column), pidstat -w (per-process), /proc/[pid]/status (cumulative counts), perf sched (detailed analysis)." },
    { front: "Why are coroutine switches faster?", back: "No kernel transition, no TLB flush, no page table switch. Only save/restore ~6-8 callee-saved registers and stack pointer. ~10-100 ns vs. microseconds." },
    { front: "What is the PCB?", back: "Process Control Block -- a kernel data structure that stores a process's state: registers, PC, memory maps, open files, scheduling info, and PID. Used to save/restore context." },
    { front: "What triggers a context switch?", back: "Timer interrupt (quantum expiry), I/O completion interrupt, system call that blocks, explicit yield, higher-priority task becoming runnable." },
  ],
  revisionNotes: [
    "Context switch = save current state + load next state. Pure overhead -- no application work done.",
    "Process switch: registers + page tables (CR3) + TLB flush. Thread switch: registers only.",
    "Direct cost: 1-10 us. Indirect cost (cache/TLB pollution): potentially 10-100+ us.",
    "PCID/ASID avoids TLB flush by tagging entries with process ID. Supported since Intel Haswell.",
    "Voluntary switch = process blocks. Involuntary = preemption. Track via pidstat -w or /proc/pid/status.",
    "User-space coroutine switch: ~10-100 ns. Only save callee-saved registers + stack pointer.",
    "Excessive context switching (>100k/s) indicates CPU contention. Fix: reduce thread count, use async I/O, pin CPUs.",
    "x86-64 has ~30+ registers to save: 16 GP, 16 YMM/ZMM (SIMD), control registers, flags.",
  ],
  cheatSheet: [
    "Context switch cost: coroutine (~100ns) < thread (~1-3us) < process (~3-10us + cache/TLB miss penalty)",
    "What is saved: PC, SP, GP registers, FP/SIMD state, flags, CR3 (process switch only)",
    "PCID: 12-bit process tag avoids TLB flush on CR3 write (Intel Haswell+)",
    "Linux switch path: interrupt -> save pt_regs -> schedule() -> context_switch() -> switch_mm() + switch_to() -> restore pt_regs -> iret",
    "Diagnose: vmstat cs | pidstat -w | /proc/pid/status | perf sched latency",
    "Voluntary = blocking I/O/lock; Involuntary = preemption by timer/higher-priority task",
    "Reduce switches: CPU pinning (taskset/isolcpus), match thread count to cores, async I/O, user-space scheduling",
    "XSAVE/XRSTOR: fast save/restore of extended register state (SSE, AVX, etc.)",
  ],
  resources: [
    { label: "Operating Systems: Three Easy Pieces", kind: "book", note: "Chapter 6 covers mechanism of context switching with clear diagrams." },
    { label: "Linux Kernel Development (Robert Love)", kind: "book", note: "Chapter 3 explains process management and context switching in Linux." },
    { label: "xv6 source code", kind: "repo", note: "The swtch.S and proc.c files show a minimal, readable context-switch implementation." },
    { label: "lmbench - Context Switch Benchmark", kind: "repo", note: "Standard tool for measuring context-switch latency on Unix systems." },
    { label: "Measuring Context Switch Time", kind: "article", note: "Detailed methodology for accurate context-switch benchmarking." },
    { label: "How Does a Context Switch Work (LiveOverflow)", kind: "video", note: "Visual explanation of the low-level mechanics of context switching." },
  ],
  glossary: [
    { term: "Context switch", definition: "The process of saving one task's CPU state and restoring another's, enabling multitasking." },
    { term: "PCB (Process Control Block)", definition: "Kernel data structure storing all information needed to manage and resume a process." },
    { term: "PCID", definition: "Process Context Identifier; hardware TLB tag that avoids flushing TLB entries on address space switches." },
    { term: "ASID", definition: "Address Space Identifier; ARM equivalent of PCID for TLB tagging." },
    { term: "TLB", definition: "Translation Lookaside Buffer; hardware cache of virtual-to-physical address translations." },
    { term: "CR3", definition: "x86 control register holding the page table base address. Writing to it switches address spaces." },
    { term: "pt_regs", definition: "Linux kernel structure holding the user-space register state saved on kernel entry." },
    { term: "Callee-saved registers", definition: "Registers that a called function must preserve (rbx, rbp, r12-r15 on x86-64). Only these need saving on cooperative switches." },
    { term: "Mode switch", definition: "Transition between user mode and kernel mode (or vice versa), triggered by interrupts or system calls." },
    { term: "Coroutine", definition: "A user-space cooperative multitasking primitive that yields control explicitly, enabling very fast context switches." },
  ],
};
