import type { TopicContent } from "../types";

export const virtualMemory: TopicContent = {
  quickSummary: [
    "Virtual memory gives each process its own private address space, abstracting physical memory so programs can use more memory than physically available via demand paging to disk.",
    "The MMU (Memory Management Unit) translates virtual addresses to physical addresses using page tables; the TLB caches recent translations for speed.",
    "A page fault occurs when a referenced page is not in physical memory, triggering the OS to load it from disk -- this is orders of magnitude slower than a memory access.",
    "Page replacement algorithms (LRU, Clock, Optimal) decide which page to evict when physical memory is full; poor choices lead to thrashing.",
  ],
  detailed: [
    "Virtual memory is an abstraction that provides each process with the illusion of a large, contiguous, private address space. The address space is divided into fixed-size pages (typically 4 KB), which map to physical frames in RAM via page tables. This separation enables memory isolation between processes, simplified memory management, and the ability to use disk as an extension of RAM through swapping.",
    "Address translation is performed by hardware (the MMU). Given a virtual address, the CPU splits it into a virtual page number (VPN) and an offset within the page. The VPN indexes into the page table to find the corresponding physical frame number (PFN). The physical address is PFN concatenated with the offset. Because a full page table for a 64-bit address space would be enormous, multi-level page tables are used, where only populated regions of the address space have page table entries allocated.",
    "The Translation Lookaside Buffer (TLB) is a small, fast, fully-associative cache inside the CPU that stores recent virtual-to-physical translations. A TLB hit resolves the address in 1-2 cycles. A TLB miss requires a page table walk through memory, taking 10-100 cycles. On x86-64, page table walks are handled by hardware; on some architectures (MIPS, older ARM), the OS handles TLB misses in software.",
    "Demand paging means pages are only loaded into physical memory when accessed. When a process accesses a page that is not resident (the present bit is 0 in the page table entry), a page fault exception is raised. The OS page fault handler determines if the access is valid (segmentation fault if not), finds a free frame (or evicts a page), reads the page from disk (swap space or file-backed mapping), updates the page table, and restarts the faulting instruction. A page fault to disk takes ~5-10 milliseconds -- about 1 million times slower than a memory access.",
    "Thrashing occurs when the set of pages actively used by running processes (the working set) exceeds available physical memory. The system spends most of its time handling page faults, swapping pages in and out, with CPU utilization dropping to near zero. Detection involves monitoring page fault rates; the solution is either adding memory, reducing the multiprogramming degree, or using the working set model to ensure each process has enough frames for its working set.",
  ],
  deepDive: [
    "Modern x86-64 processors use a 4-level page table structure (PML4, PDPT, PD, PT) for 48-bit virtual addresses, and newer CPUs support 5-level paging (PML5) for 57-bit virtual addresses. Each level contains 512 entries (9 bits per level), and each entry is 8 bytes. The page table entry contains the physical frame number, a present/absent bit, read/write permission, user/supervisor bit, accessed bit (set by hardware on access), dirty bit (set on write), and NX (no-execute) bit. The CR3 register points to the PML4 table's physical address.",
    "Huge pages (2 MB or 1 GB on x86-64) reduce TLB pressure by covering more memory with fewer entries. A single 2 MB huge page replaces 512 regular 4 KB page table entries and their TLB entries. Linux supports transparent huge pages (THP), which the kernel automatically promotes/demotes, and explicit huge pages via hugetlbfs. Databases like Oracle and PostgreSQL benefit significantly from huge pages because their large memory footprints cause TLB thrashing with 4 KB pages.",
    "Page replacement algorithms determine which page to evict when a page fault occurs and no free frames are available. The Optimal (Belady's) algorithm evicts the page that will not be used for the longest time in the future -- it is provably optimal but requires future knowledge. LRU (Least Recently Used) approximates Optimal by evicting the page least recently accessed, but maintaining exact LRU ordering in hardware is expensive. The Clock (Second-Chance) algorithm approximates LRU cheaply: pages are arranged in a circular list, each with a reference bit set by hardware on access. The clock hand scans pages: if the reference bit is 1, clear it and move on; if 0, evict that page. Enhanced Clock also considers the dirty bit to prefer evicting clean pages.",
    "Copy-on-write (COW) is a critical optimization for fork(). Instead of copying the parent's entire address space, the child shares the parent's page frames, with all shared pages marked read-only. When either process writes to a shared page, a page fault occurs, and only then does the OS copy the page and give the writer its own private copy. This makes fork() nearly instantaneous regardless of process size, and pages that are only read (like code segments) are never copied.",
    "Memory-mapped files (mmap) integrate the file system with virtual memory. A file is mapped into the process's address space, and pages are demand-loaded from the file on access. Writes to mapped pages are eventually flushed back to the file. This provides zero-copy I/O, shared memory between processes (MAP_SHARED), and is the basis for loading executables and shared libraries. The Linux page cache unifies file I/O and virtual memory: both read() and mmap() access the same cached pages, avoiding double-buffering.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Virtual address translation (simulating 2-level page table)",
      source: `#include <iostream>
#include <map>
#include <cstdint>
#include <stdexcept>
#include <iomanip>

struct PageTableEntry {
    uint32_t frame_num;
    bool present;
};

uint32_t translate(uint32_t virtual_addr,
                   const std::map<uint32_t, PageTableEntry>& page_table,
                   uint32_t page_size = 4096) {
    // Calculate offset bits: log2(page_size)
    uint32_t offset_bits = 0;
    for (uint32_t ps = page_size; ps > 1; ps >>= 1) ++offset_bits;  // 12 for 4096

    uint32_t vpn = virtual_addr >> offset_bits;
    uint32_t offset = virtual_addr & (page_size - 1);

    auto it = page_table.find(vpn);
    if (it == page_table.end()) {
        throw std::runtime_error("Segmentation fault: VPN " +
                                 std::to_string(vpn) + " not mapped");
    }

    const auto& entry = it->second;
    if (!entry.present) {
        throw std::runtime_error("Page fault: VPN " +
                                 std::to_string(vpn) + " not in memory (on disk)");
    }

    uint32_t physical_addr = (entry.frame_num << offset_bits) | offset;
    return physical_addr;
}

int main() {
    // Example: 16-bit address space, 4 KB pages
    std::map<uint32_t, PageTableEntry> page_table = {
        {0, {5, true}},   // virtual page 0 -> frame 5, present
        {1, {3, true}},   // virtual page 1 -> frame 3, present
        {2, {7, false}},  // virtual page 2 -> frame 7, on disk
        {3, {1, true}},   // virtual page 3 -> frame 1, present
    };

    // Translate virtual address 0x1A3C (VPN=1, offset=0xA3C)
    uint32_t va = 0x1A3C;
    uint32_t pa = translate(va, page_table);
    std::cout << "VA 0x" << std::hex << std::setw(4) << std::setfill('0') << va
              << " -> PA 0x" << std::setw(4) << pa << "\\n";
    // frame 3, offset 0xA3C = 0x3A3C
}`,
    },
    {
      language: "cpp",
      caption: "LRU and Clock page replacement algorithm simulation",
      source: `#include <iostream>
#include <list>
#include <unordered_map>
#include <vector>

int lru_page_replacement(const std::vector<int>& pages, int num_frames) {
    // Simulate LRU page replacement. Returns number of page faults.
    std::list<int> order;  // front = LRU, back = MRU
    std::unordered_map<int, std::list<int>::iterator> frame_map;
    int faults = 0;

    for (int page : pages) {
        if (frame_map.count(page)) {
            // Move to back (most recently used)
            order.erase(frame_map[page]);
            order.push_back(page);
            frame_map[page] = std::prev(order.end());
        } else {
            ++faults;
            if (static_cast<int>(order.size()) >= num_frames) {
                // Evict least recently used (front)
                int evicted = order.front();
                frame_map.erase(evicted);
                order.pop_front();
            }
            order.push_back(page);
            frame_map[page] = std::prev(order.end());
        }
    }
    return faults;
}

int clock_page_replacement(const std::vector<int>& pages, int num_frames) {
    // Simulate Clock (Second-Chance) page replacement.
    std::vector<int> frames(num_frames, -1);
    std::vector<int> ref_bits(num_frames, 0);
    int hand = 0, faults = 0;
    std::unordered_map<int, int> page_to_slot;

    for (int page : pages) {
        if (page_to_slot.count(page)) {
            ref_bits[page_to_slot[page]] = 1;  // set reference bit
        } else {
            ++faults;
            while (ref_bits[hand] == 1) {
                ref_bits[hand] = 0;               // clear reference bit
                hand = (hand + 1) % num_frames;   // advance hand
            }
            // Evict page at hand position
            if (frames[hand] != -1) {
                page_to_slot.erase(frames[hand]);
            }
            frames[hand] = page;
            page_to_slot[page] = hand;
            ref_bits[hand] = 1;
            hand = (hand + 1) % num_frames;
        }
    }
    return faults;
}

int main() {
    std::vector<int> ref_string = {
        7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1
    };
    std::cout << "LRU faults:   " << lru_page_replacement(ref_string, 3) << "\\n";
    std::cout << "Clock faults: " << clock_page_replacement(ref_string, 3) << "\\n";
}`,
    },
    {
      language: "c",
      caption: "x86-64 page table entry structure",
      source: `#include <stdint.h>

/*
 * x86-64 Page Table Entry (PTE) layout (64 bits):
 *
 * Bits  0:     Present (P) - page is in physical memory
 * Bits  1:     Read/Write (R/W) - 0=read-only, 1=read-write
 * Bits  2:     User/Supervisor (U/S) - 0=kernel only, 1=user accessible
 * Bits  3:     Page Write-Through (PWT)
 * Bits  4:     Page Cache Disable (PCD)
 * Bits  5:     Accessed (A) - set by hardware on access
 * Bits  6:     Dirty (D) - set by hardware on write
 * Bits  7:     Page Size (PS) - 0=4KB, 1=2MB/1GB (in PDE/PDPTE)
 * Bits  8:     Global (G) - don't flush from TLB on CR3 write
 * Bits  9-11:  Available for OS use
 * Bits  12-51: Physical frame number (40 bits = 1 TB addressable)
 * Bits  52-62: Available / reserved
 * Bit   63:    No Execute (NX) - prevent code execution
 */

typedef struct {
    uint64_t present       : 1;
    uint64_t rw            : 1;
    uint64_t user          : 1;
    uint64_t pwt           : 1;
    uint64_t pcd           : 1;
    uint64_t accessed      : 1;
    uint64_t dirty         : 1;
    uint64_t page_size     : 1;
    uint64_t global        : 1;
    uint64_t os_bits       : 3;
    uint64_t pfn           : 40;
    uint64_t available     : 11;
    uint64_t nx            : 1;
} __attribute__((packed)) PageTableEntry;

/* Extract physical address from PTE */
static inline uint64_t pte_to_phys(PageTableEntry pte) {
    return (uint64_t)pte.pfn << 12;  /* frame number * 4096 */
}

/* Check if page is present and writable */
static inline int pte_is_writable(PageTableEntry pte) {
    return pte.present && pte.rw;
}`,
    },
  ],
  diagrams: [
    {
      title: "Virtual Memory Address Translation",
      kind: "flow",
      caption: "How a virtual address is translated to a physical address via the page table and TLB.",
      mermaid: `flowchart TD
    A["Process requests
virtual address VA"] --> B["Check TLB
Translation Lookaside Buffer"]
    B --> C{TLB hit?}
    C -->|Yes| D["Get physical address PA
fast path"]
    C -->|No| E["Walk page table
in memory"]
    E --> F{Page present?}
    F -->|Yes| G["Load TLB entry
return PA"]
    G --> D
    F -->|No| H["Page fault
OS loads from disk"]
    H --> G
    D --> I["Access physical memory
at PA"]`,
    },
    {
      title: "Virtual Memory Layout",
      kind: "architecture",
      caption: "Typical process virtual address space layout from kernel space to stack and heap.",
      mermaid: `graph TD
    VS["Virtual Address Space"] --> KS["Kernel Space
high addresses
not user accessible"]
    VS --> Stack["Stack
grows downward
local variables"]
    VS --> Mmap["Memory-mapped files
and shared libraries"]
    VS --> Heap["Heap
grows upward
malloc and new"]
    VS --> BSS["BSS segment
uninitilized globals"]
    VS --> Data["Data segment
initialized globals"]
    VS --> Text["Text segment
code
read-only"]`,
    },
    {
      title: "Page Replacement Policies",
      kind: "mindmap",
      caption: "Common page replacement algorithms used when physical memory is full and a page must be evicted.",
      mermaid: `mindmap
  root((Page Replacement))
    FIFO
      Evict oldest page
      Simple to implement
      Belady anomaly
    LRU
      Evict least recently used
      Good hit rate
      Expensive tracking
    Clock Algorithm
      Approximates LRU
      Reference bit
      Circular buffer
    Optimal
      Evict furthest future use
      Theoretical best
      Not implementable`,
    },
    {
      title: "Demand Paging Sequence",
      kind: "sequence",
      caption: "How the OS handles a page fault by loading the missing page from disk into physical memory.",
      mermaid: `sequenceDiagram
    participant P as Process
    participant MMU as MMU Hardware
    participant OS as OS Kernel
    participant Disk as Disk
    P->>MMU: access virtual address 0x4000
    MMU->>OS: page fault - page not present
    OS->>OS: find free frame or evict victim
    OS->>Disk: load page from swap or file
    Disk-->>OS: page data
    OS->>MMU: update page table entry
    OS->>P: resume execution
    P->>MMU: retry access 0x4000
    MMU-->>P: physical memory access`,
    },
  ],
  animations: [
    {
      title: "Page fault handling",
      steps: [
        { label: "CPU issues memory access", detail: "Process tries to read virtual address 0x7FFF_1234. MMU checks TLB -- miss. Begins page table walk." },
        { label: "Page table walk", detail: "MMU traverses PML4 -> PDPT -> PD -> PT. Finds PTE for VPN 0x7FFF1. Present bit is 0 -- page is on disk." },
        { label: "Page fault trap", detail: "CPU raises exception #14 (page fault). Saves faulting address in CR2. Transfers control to OS page fault handler." },
        { label: "OS validates access", detail: "Handler checks process's VMA list: is 0x7FFF_1234 a valid mapped address? Yes, it is in the heap region. Access type (read) is permitted." },
        { label: "Find free frame", detail: "OS checks free frame list. No free frames available -- must evict a page. Runs Clock algorithm to select victim." },
        { label: "Evict victim page", detail: "Clock selects frame 42 (clean page, reference bit 0). Since it is clean, no disk write needed. Frame 42 is now free." },
        { label: "Load page from disk", detail: "OS reads the needed page from swap partition into frame 42. This disk I/O takes ~5-10ms. Process is blocked; other processes run." },
        { label: "Update page table and resume", detail: "OS sets PTE: PFN=42, present=1, accessed=1. TLB is updated. CPU restarts the faulting instruction, which now succeeds." },
      ],
    },
  ],
  comparison: {
    columns: ["Algorithm", "Approximates Optimal?", "Hardware Support Needed", "Overhead", "Belady's Anomaly?", "Used In Practice"],
    rows: [
      ["Optimal (Belady)", "Is optimal", "Future knowledge (impossible)", "N/A", "No", "Theoretical benchmark only"],
      ["FIFO", "Poor", "None", "Very low", "Yes", "Rarely (simple embedded systems)"],
      ["LRU", "Good", "Counter or stack per page", "High (exact), Medium (approx)", "No", "Approximated in most OSes"],
      ["Clock (Second-Chance)", "Good (approx LRU)", "Reference bit (hardware)", "Low", "No", "Linux, most Unix systems"],
      ["Enhanced Clock (NRU)", "Better than Clock", "Reference + dirty bits", "Low", "No", "Many production OSes"],
      ["LFU", "Moderate", "Counter per page", "Medium", "No", "Specialized workloads"],
      ["Working Set", "Good", "Reference bits + timer", "Medium-High", "No", "Windows (approximated)"],
    ],
  },
  interviewQA: [
    {
      q: "What is virtual memory and why do we need it?",
      a: "Virtual memory provides each process with its own private, contiguous address space independent of physical memory size and layout. It serves three critical purposes: (1) Isolation -- each process cannot access another's memory, providing security and stability. (2) Abstraction -- programmers don't need to worry about physical memory layout, sharing, or fragmentation. (3) Overcommitment -- the combined virtual address spaces of all processes can exceed physical RAM by using disk as backing store. The OS and MMU hardware transparently map virtual addresses to physical addresses through page tables.",
      followUps: [
        "What are the performance implications of virtual memory?",
        "How does virtual memory interact with CPU caches?",
      ],
    },
    {
      q: "Explain how a TLB works and why it is necessary.",
      a: "The Translation Lookaside Buffer is a small (typically 64-1024 entries), fast, content-addressable cache inside the CPU that stores recent virtual-to-physical page translations. It is necessary because every memory access requires address translation, and a full page table walk through 4 levels of page tables in memory takes 4 sequential memory accesses (~100+ cycles). With a TLB hit (typical hit rate >99%), translation takes 1-2 cycles. The TLB is typically split into separate instruction TLB (iTLB) and data TLB (dTLB), each with L1 and L2 levels. TLB misses are handled either by hardware (x86 page table walker) or software (MIPS/SPARC trap to OS TLB miss handler).",
      followUps: [
        "What causes TLB thrashing?",
        "How do huge pages help TLB performance?",
        "What happens to the TLB during a context switch?",
      ],
    },
    {
      q: "What is thrashing and how do you detect and prevent it?",
      a: "Thrashing occurs when the working sets of all active processes exceed physical memory. The system spends most time servicing page faults (swapping pages in and out), and CPU utilization drops because processes are perpetually blocked waiting for disk I/O. Symptoms: high page fault rate, high disk I/O, low CPU utilization despite many runnable processes. Detection: monitor page fault rate (vmstat si/so columns), page scan rate, and swap usage. Prevention: (1) Add more RAM, (2) reduce the multiprogramming degree (suspend some processes), (3) use the working set model to ensure each process has enough frames, (4) use swap on fast storage (SSD). Linux's OOM killer is a last resort that terminates processes to free memory.",
    },
    {
      q: "Explain Belady's anomaly.",
      a: "Belady's anomaly is the counterintuitive phenomenon where increasing the number of page frames can increase the page fault rate for certain page replacement algorithms. It occurs with FIFO: for example, with reference string 1,2,3,4,1,2,5,1,2,3,4,5, using 3 frames causes 9 faults, but using 4 frames causes 10 faults. This happens because FIFO does not use recency information, so adding frames can cause different pages to be retained at unlucky times. Stack-based algorithms like LRU and Optimal are immune to Belady's anomaly: the set of pages in memory with n+1 frames is always a superset of the set with n frames.",
      followUps: [
        "Why is LRU immune to Belady's anomaly?",
        "What is a stack algorithm?",
      ],
    },
    {
      q: "How does copy-on-write work with fork()?",
      a: "When a process calls fork(), the OS does not copy the parent's memory. Instead, both parent and child share the same physical frames, with all page table entries marked read-only. When either process writes to a shared page, a write-protection page fault occurs. The fault handler allocates a new frame, copies the content of the shared page into it, updates the writing process's page table to point to the new frame with read-write permissions, and decrements the reference count on the original frame. If the reference count drops to 1, the remaining process's page table entry is also made writable. This makes fork() O(1) in time (only page table entries are duplicated, not pages), and pages that are never written (like code segments) are never copied.",
      followUps: [
        "How does exec() interact with copy-on-write?",
        "What is the overhead of COW page faults?",
      ],
    },
    {
      q: "What is the difference between swapping and paging?",
      a: "Paging moves individual pages between RAM and disk on demand (page-level granularity). When a page fault occurs, only the needed page is brought in. Swapping, in the traditional sense, moves an entire process's memory to/from disk. Modern systems primarily use paging because it is more efficient -- only the pages actually needed are in memory, not the entire process. However, under severe memory pressure, Linux can swap out entire processes. The terms are sometimes used interchangeably in casual usage. Linux swap space is used for anonymous pages (heap, stack) that have no file backing. File-backed pages (mmap, executables) are paged from/to the file system directly.",
    },
  ],
  followUps: [
    "How do memory-mapped files (mmap) work with virtual memory?",
    "What is the Linux page cache and how does it unify file I/O and VM?",
    "How does ASLR use virtual memory for security?",
    "What are huge pages and when should you use them?",
    "How does virtual memory work in containers (cgroups memory limits)?",
  ],
  mcqs: [
    {
      q: "How many levels does an x86-64 page table have (standard, not 5-level)?",
      options: ["2", "3", "4", "5"],
      answerIndex: 2,
      explanation: "Standard x86-64 uses 4-level page tables: PML4, PDPT (Page Directory Pointer Table), PD (Page Directory), and PT (Page Table), mapping 48-bit virtual addresses.",
    },
    {
      q: "Which page replacement algorithm can exhibit Belady's anomaly?",
      options: ["LRU", "Optimal", "FIFO", "Clock"],
      answerIndex: 2,
      explanation: "FIFO can exhibit Belady's anomaly because it is not a stack algorithm. LRU, Optimal, and their approximations are stack algorithms and are immune.",
    },
    {
      q: "What is the typical size of a page on x86-64?",
      options: ["512 bytes", "4 KB", "64 KB", "1 MB"],
      answerIndex: 1,
      explanation: "The default page size on x86-64 is 4 KB (4096 bytes). Huge pages of 2 MB and 1 GB are also supported.",
    },
    {
      q: "What hardware component caches virtual-to-physical address translations?",
      options: ["L1 cache", "TLB", "Branch predictor", "Write buffer"],
      answerIndex: 1,
      explanation: "The Translation Lookaside Buffer (TLB) is a specialized cache for page table entries, providing fast address translation without a full page table walk.",
    },
    {
      q: "What causes thrashing?",
      options: [
        "Too many context switches",
        "Working set exceeds physical memory",
        "Too many TLB entries",
        "Page size is too large",
      ],
      answerIndex: 1,
      explanation: "Thrashing occurs when the combined working sets of active processes exceed available physical memory, causing constant page faults and disk I/O.",
    },
    {
      q: "In copy-on-write after fork(), when does a page actually get copied?",
      options: [
        "Immediately during fork()",
        "When either process reads the page",
        "When either process writes to the page",
        "When the child calls exec()",
      ],
      answerIndex: 2,
      explanation: "COW pages are shared read-only. Only a write triggers a protection fault, causing the OS to copy the page and give the writer its own private copy.",
    },
  ],
  exercises: [
    "Given a 32-bit virtual address space with 4 KB pages and a two-level page table (10-bit first level, 10-bit second level, 12-bit offset), calculate the size of each page table level and the total memory used for page tables for a process using 1 MB of memory.",
    "Implement FIFO, LRU, and Clock page replacement algorithms. Run them on the same reference string and compare fault counts. Demonstrate Belady's anomaly with FIFO by finding a reference string where 4 frames produce more faults than 3.",
    "Write a program that demonstrates demand paging by allocating a large array with mmap and measuring the time to access the first page vs. subsequent pages.",
    "Calculate the effective memory access time given: TLB hit rate = 98%, TLB access time = 1 ns, memory access time = 100 ns, page fault rate = 0.001%, disk access time = 10 ms.",
    "Analyze the /proc/[pid]/smaps file for a running process. Identify private vs. shared pages, clean vs. dirty pages, and calculate the working set size.",
  ],
  flashcards: [
    { front: "What is a page table?", back: "A per-process data structure that maps virtual page numbers to physical frame numbers, along with permission and status bits (present, dirty, accessed, R/W, NX)." },
    { front: "What is a TLB?", back: "Translation Lookaside Buffer -- a fast hardware cache of recent page table entries, providing 1-2 cycle address translation on hits vs. 100+ cycles for a full page table walk." },
    { front: "What triggers a page fault?", back: "Accessing a virtual page whose present bit is 0 in the page table (page not in physical memory), or violating permissions (writing to read-only page, executing NX page)." },
    { front: "What is demand paging?", back: "Loading pages into physical memory only when they are accessed, rather than loading the entire program at startup. Initial access triggers a page fault." },
    { front: "What is Belady's anomaly?", back: "The counterintuitive phenomenon where FIFO page replacement can produce MORE page faults with MORE frames. Does not occur with stack algorithms like LRU." },
    { front: "What is the working set?", back: "The set of pages a process has referenced in the recent past (within a time window). If the working set exceeds available frames, thrashing occurs." },
    { front: "How does copy-on-write optimize fork()?", back: "Parent and child share the same physical pages (marked read-only). Pages are copied only when written to, making fork() nearly instantaneous." },
    { front: "What is a dirty page?", back: "A page that has been modified since being loaded from disk. Dirty pages must be written back to disk before eviction; clean pages can be discarded." },
    { front: "What is the Clock algorithm?", back: "A page replacement algorithm approximating LRU. Pages are in a circular list with reference bits. The hand advances, clearing reference bits until finding a 0, which is evicted." },
    { front: "What is the effective access time formula?", back: "EAT = TLB_hit_rate * (TLB_time + mem_time) + TLB_miss_rate * (TLB_time + page_walk_time) + page_fault_rate * page_fault_time" },
  ],
  revisionNotes: [
    "Virtual address = VPN + offset. VPN indexes page table to get PFN. Physical address = PFN + offset.",
    "x86-64: 4-level page table (PML4/PDPT/PD/PT), 9 bits per level, 12-bit offset = 48-bit VA.",
    "TLB: ~64-1024 entries, >99% hit rate typical. Miss = 4 memory accesses for page walk.",
    "Page fault cost: ~5-10 ms (disk). Memory access: ~100 ns. Ratio: ~100,000x slower.",
    "Clock algorithm: circular list + reference bits. Cheap LRU approximation used in practice.",
    "Belady's anomaly: FIFO only. Stack algorithms (LRU, Optimal) are immune.",
    "COW: fork() shares pages read-only. Write triggers fault and copy. Makes fork() O(1).",
    "Thrashing: working set > RAM. Symptoms: high page faults, high disk I/O, low CPU utilization.",
    "Huge pages (2 MB / 1 GB) reduce TLB misses for large-memory workloads (databases, VMs).",
    "mmap unifies file I/O and VM. File-backed pages evict to file; anonymous pages evict to swap.",
  ],
  cheatSheet: [
    "Virtual address: VPN (indexes page table) + offset (within page)",
    "x86-64 page: 4 KB default | 2 MB / 1 GB huge pages",
    "x86-64 page table: 4 levels x 512 entries x 8 bytes = 9+9+9+9+12 = 48-bit VA",
    "PTE bits: Present, R/W, U/S, Accessed, Dirty, NX, PFN (40 bits)",
    "TLB hit: ~1-2 cycles | TLB miss: ~10-100 cycles (page walk) | Page fault: ~5-10 ms (disk)",
    "EAT = (1-p) * memory_time + p * page_fault_time (p = page fault rate)",
    "FIFO: simple, Belady's anomaly | LRU: good, expensive | Clock: practical LRU approx",
    "Working set: pages accessed in time window | If > frames => thrashing",
    "COW: fork shares pages RO, copy on write fault | exec discards all pages",
    "Linux: /proc/meminfo, /proc/pid/smaps, vmstat, free -h for VM diagnostics",
  ],
  resources: [
    { label: "Operating Systems: Three Easy Pieces (OSTEP)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", kind: "book", note: "Free online. Chapters 13-23 cover virtual memory comprehensively with excellent clarity." },
    { label: "Operating System Concepts (Silberschatz)", kind: "book", note: "Chapters 9-10 cover virtual memory, demand paging, and page replacement algorithms." },
    { label: "Computer Systems: A Programmer's Perspective (CS:APP)", kind: "book", note: "Chapter 9 provides the programmer's view of virtual memory with x86 specifics." },
    { label: "Intel 64 and IA-32 Software Developer's Manual, Vol. 3A", kind: "docs", note: "Chapter 4 covers x86-64 paging architecture in complete detail." },
    { label: "Understanding the Linux Virtual Memory Manager (Mel Gorman)", kind: "book", note: "Deep dive into Linux VM internals: page tables, page cache, swap, OOM killer." },
    { label: "Virtual Memory lecture - MIT 6.004", kind: "video", note: "Clear explanation of page tables, TLB, and address translation with worked examples." },
  ],
  glossary: [
    { term: "Virtual address", definition: "An address in a process's private address space, translated to a physical address by the MMU using page tables." },
    { term: "Physical frame", definition: "A fixed-size block of physical RAM that holds one page of virtual memory." },
    { term: "Page table", definition: "A per-process data structure mapping virtual page numbers to physical frame numbers and associated permissions." },
    { term: "TLB", definition: "Translation Lookaside Buffer; a fast CPU cache of recent virtual-to-physical translations." },
    { term: "Page fault", definition: "An exception raised when accessing a virtual page not currently in physical memory, triggering OS intervention." },
    { term: "Demand paging", definition: "Loading pages only when accessed, not preemptively, to minimize memory usage." },
    { term: "Thrashing", definition: "A state where the system spends most time handling page faults due to insufficient physical memory for active working sets." },
    { term: "Working set", definition: "The set of pages a process actively uses within a recent time window." },
    { term: "Copy-on-write", definition: "An optimization where forked processes share pages until one writes, triggering a copy of only the modified page." },
    { term: "Dirty bit", definition: "A bit in the PTE set by hardware when the page is written to, indicating it must be written back to disk before eviction." },
    { term: "MMU", definition: "Memory Management Unit; hardware that performs virtual-to-physical address translation using page tables and TLB." },
    { term: "Swap space", definition: "Disk area used to store pages evicted from physical memory (for anonymous pages without file backing)." },
  ],
};
