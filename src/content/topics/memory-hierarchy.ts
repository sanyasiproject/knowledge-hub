import type { TopicContent } from "../types";

export const memoryHierarchy: TopicContent = {
  quickSummary: [
    "Memory is organized in a hierarchy from fastest/smallest (registers, L1 cache) to slowest/largest (disk/SSD), exploiting the locality of reference principle.",
    "Caches store recently accessed data in fixed-size cache lines (typically 64 bytes) and use associativity (direct-mapped, set-associative, fully associative) to map memory addresses to cache locations.",
    "Virtual memory abstracts physical RAM using page tables and the TLB, giving each process its own address space and enabling demand paging from disk.",
    "Cache coherence protocols (MESI, MOESI) ensure that multiple CPU cores see a consistent view of shared memory in multiprocessor systems.",
  ],
  detailed: [
    "The memory hierarchy exists because no single technology provides both the speed and capacity a modern CPU needs. Registers access in a single cycle (~0.3 ns), L1 cache in 3-5 cycles (~1 ns), L2 in 10-20 cycles (~5 ns), L3 in 30-70 cycles (~20 ns), main memory (DRAM) in 100-300 cycles (~100 ns), and SSD/disk in millions of cycles (~100 us for SSD, ~10 ms for HDD). The hierarchy works because programs exhibit temporal locality (recently accessed data is likely to be accessed again) and spatial locality (data near recently accessed addresses is likely to be accessed soon).",
    "A cache is organized as an array of cache lines (blocks), each holding a contiguous chunk of memory (typically 64 bytes). When the CPU accesses an address, the cache extracts a tag, index, and offset from the address. The index selects a cache set, the tag is compared against stored tags in that set to check for a hit, and the offset selects the specific byte within the line. Direct-mapped caches have one line per set (fast but high conflict-miss rate), fully associative caches allow a line to go anywhere (low miss rate but slow lookup), and N-way set-associative caches strike a balance with N lines per set.",
    "When a cache miss occurs, the cache must fetch the line from the next level and possibly evict an existing line. Replacement policies determine which line to evict: LRU (Least Recently Used) evicts the line unused for the longest time, providing good hit rates but expensive tracking in high-associativity caches. Pseudo-LRU approximates LRU with less hardware. Random replacement is simple and performs surprisingly well. Write policies determine when modified data reaches lower levels: write-through writes to both cache and memory on every store (simpler coherence, higher bandwidth), while write-back marks lines dirty and writes to memory only on eviction (lower bandwidth, more complex).",
    "Virtual memory gives each process a private, contiguous address space mapped to physical memory through page tables. The OS divides virtual and physical memory into fixed-size pages (typically 4 KB). A virtual address is split into a virtual page number (VPN) and page offset. The VPN indexes into a multi-level page table to find the physical frame number. The TLB (Translation Lookaside Buffer) caches recent virtual-to-physical translations, with typical hit rates above 99%. A TLB miss triggers a page table walk in hardware or software. A page fault occurs when the page is not in physical memory and must be loaded from disk — this is extremely expensive (~10 ms for HDD).",
    "In multiprocessor systems, each core has its own L1/L2 caches, so the same memory address can be cached in multiple locations. Cache coherence protocols ensure all cores see a consistent value. The MESI protocol tracks each cache line's state: Modified (dirty, exclusive), Exclusive (clean, only copy), Shared (clean, may exist in other caches), or Invalid. When a core writes to a Shared line, it broadcasts an invalidation to all other caches holding that line. Snooping protocols have each cache monitor the bus; directory-based protocols use a centralized directory to track which caches hold each line, scaling better to many cores.",
  ],
  deepDive: [
    "Cache performance is quantified by the miss rate and miss penalty. The average memory access time (AMAT) formula is: AMAT = Hit Time + Miss Rate x Miss Penalty. For a multi-level cache: AMAT = L1 Hit Time + L1 Miss Rate x (L2 Hit Time + L2 Miss Rate x (L3 Hit Time + L3 Miss Rate x Memory Latency)). Misses are classified as compulsory (first access to a block — cold miss), capacity (the working set exceeds cache size), and conflict (multiple addresses map to the same set in a non-fully-associative cache). Understanding the 3 Cs helps optimize: increasing cache size reduces capacity misses, increasing associativity reduces conflict misses, and prefetching reduces compulsory misses.",
    "Modern systems use huge pages (2 MB or 1 GB) to reduce TLB pressure. A standard 4 KB page requires one TLB entry per page; with a 64-entry TLB, you can only cover 256 KB of memory. Using 2 MB huge pages, the same TLB covers 128 MB. This is critical for workloads with large working sets (databases, scientific computing). The tradeoff is internal fragmentation — a 2 MB page wastes space if only a few KB are used. Linux supports transparent huge pages (THP) that automatically promote contiguous 4 KB pages to huge pages.",
    "Non-Uniform Memory Access (NUMA) architectures connect multiple CPU sockets, each with local DRAM. Accessing local memory is fast (~100 ns), but accessing remote memory through the interconnect (e.g., AMD Infinity Fabric, Intel UPI) adds 50-100% latency. NUMA-aware software (OS schedulers, database buffer pools, JVM garbage collectors) tries to allocate memory on the same NUMA node as the thread that uses it. Tools like numactl and libnuma give programmers explicit control over memory placement and thread affinity.",
    "Cache-oblivious algorithms are designed to perform well across the entire memory hierarchy without knowing cache sizes or line sizes. The key idea is recursive decomposition: divide the problem until subproblems fit in cache at every level. Cache-oblivious matrix transpose, for example, recursively divides the matrix into quadrants until they fit in L1 cache, achieving O(N^2 / B) cache misses (where B is the cache line size) without knowing B. The Funnel Sort algorithm achieves optimal O((N/B) log_{M/B}(N/B)) cache misses for sorting, matching the lower bound.",
  ],
  code: [
    {
      language: "c",
      caption: "Demonstrating cache spatial locality: row-major vs column-major array traversal",
      source: `#include <stdio.h>
#include <time.h>

#define N 4096

static int matrix[N][N];

int main(void) {
    clock_t start, end;

    /* Row-major traversal: exploits spatial locality.
     * Consecutive accesses hit the same cache line (64 bytes = 16 ints).
     * Expected: fast — nearly every access is a cache hit.
     */
    start = clock();
    long sum_row = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum_row += matrix[i][j];
    end = clock();
    printf("Row-major:    %.3f ms (sum=%ld)\\n",
           1000.0 * (end - start) / CLOCKS_PER_SEC, sum_row);

    /* Column-major traversal: destroys spatial locality.
     * Consecutive accesses are N*sizeof(int) = 16384 bytes apart,
     * causing a cache miss on nearly every access.
     * Expected: 5-20x slower than row-major.
     */
    start = clock();
    long sum_col = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum_col += matrix[i][j];
    end = clock();
    printf("Column-major: %.3f ms (sum=%ld)\\n",
           1000.0 * (end - start) / CLOCKS_PER_SEC, sum_col);

    return 0;
}`,
    },
    {
      language: "python",
      caption: "Simulating a set-associative cache",
      source: `from collections import OrderedDict

class SetAssociativeCache:
    """N-way set-associative cache simulator with LRU replacement."""

    def __init__(self, num_sets: int, ways: int, line_size: int = 64):
        self.num_sets = num_sets
        self.ways = ways
        self.line_size = line_size
        # Each set is an OrderedDict (LRU order) mapping tag -> data
        self.sets: list[OrderedDict] = [OrderedDict() for _ in range(num_sets)]
        self.hits = 0
        self.misses = 0

    def _parse_address(self, addr: int) -> tuple[int, int]:
        block_addr = addr // self.line_size
        set_index = block_addr % self.num_sets
        tag = block_addr // self.num_sets
        return set_index, tag

    def access(self, addr: int) -> bool:
        set_idx, tag = self._parse_address(addr)
        cache_set = self.sets[set_idx]

        if tag in cache_set:
            cache_set.move_to_end(tag)  # Mark as most recently used
            self.hits += 1
            return True  # Hit
        else:
            self.misses += 1
            if len(cache_set) >= self.ways:
                cache_set.popitem(last=False)  # Evict LRU entry
            cache_set[tag] = True  # Insert new line
            return False  # Miss

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

# Simulate: 4-way set-associative, 16 sets, 64-byte lines
cache = SetAssociativeCache(num_sets=16, ways=4, line_size=64)

# Sequential access pattern (good locality)
for addr in range(0, 4096, 4):   # stride-4 through 4 KB
    cache.access(addr)
for addr in range(0, 4096, 4):   # repeat — should all hit
    cache.access(addr)

print(f"Hits: {cache.hits}, Misses: {cache.misses}")
print(f"Hit rate: {cache.hit_rate:.1%}")`,
    },
  ],
  diagrams: [
    {
      title: "Memory hierarchy pyramid",
      kind: "architecture",
      caption:
        "Layered view from registers at the top (fastest, smallest, most expensive per byte) down through L1/L2/L3 caches, main memory (DRAM), SSD, and HDD (slowest, largest, cheapest per byte).",
    },
    {
      title: "Set-associative cache address mapping",
      kind: "flow",
      caption:
        "How a memory address is decomposed into tag, set index, and block offset fields, and how the tag is compared against entries in the selected set.",
    },
  ],
  animations: [
    {
      title: "Cache miss and eviction (LRU)",
      steps: [
        {
          label: "Address arrives",
          detail:
            "The CPU issues a memory access. The cache controller extracts the set index and tag from the address.",
        },
        {
          label: "Set lookup",
          detail:
            "The controller checks all tags in the selected set in parallel. Each way's tag is compared against the incoming tag.",
        },
        {
          label: "Hit or miss?",
          detail:
            "If a tag matches and the valid bit is set, it is a cache hit — the data is returned immediately. If no tag matches, it is a miss.",
        },
        {
          label: "Fetch from next level",
          detail:
            "On a miss, the entire cache line (64 bytes) is fetched from L2 (or L3, or main memory). The CPU may stall or continue with other instructions.",
        },
        {
          label: "Evict LRU line",
          detail:
            "If the set is full, the least recently used line is selected for eviction. If it is dirty (modified), it is written back to the next level first.",
        },
        {
          label: "Install new line",
          detail:
            "The fetched line is stored in the freed cache way, the tag and valid bit are updated, and the data is returned to the CPU.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Level", "Typical Size", "Latency", "Managed By", "Technology"],
    rows: [
      ["Registers", "~1 KB (32-128 registers)", "< 1 ns (1 cycle)", "Compiler", "SRAM (flip-flops)"],
      ["L1 Cache", "32-64 KB per core", "~1 ns (3-5 cycles)", "Hardware", "SRAM"],
      ["L2 Cache", "256 KB - 1 MB per core", "~5 ns (10-20 cycles)", "Hardware", "SRAM"],
      ["L3 Cache", "8-64 MB shared", "~20 ns (30-70 cycles)", "Hardware", "SRAM"],
      ["Main Memory (DRAM)", "8-512 GB", "~100 ns (100-300 cycles)", "OS", "DRAM"],
      ["SSD", "256 GB - 8 TB", "~100 us", "OS", "Flash NAND"],
      ["HDD", "1-20 TB", "~10 ms", "OS", "Magnetic disk"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between write-back and write-through cache policies?",
      a: "Write-through writes data to both the cache and the next level of memory on every store, ensuring consistency but generating high memory bus traffic. Write-back only writes to the cache, marking the line as dirty; the modified data is written to the next level only when the line is evicted. Write-back reduces bandwidth requirements but makes cache coherence more complex in multiprocessor systems.",
      followUps: [
        "What is a write buffer and how does it help write-through performance?",
        "How does write-back interact with cache coherence protocols?",
        "What is a write-allocate policy vs. no-write-allocate?",
      ],
    },
    {
      q: "Explain the three Cs of cache misses.",
      a: "Compulsory (cold) misses happen on the first access to a block — unavoidable unless prefetching is used. Capacity misses occur when the working set exceeds the cache size — blocks are evicted and later needed again. Conflict misses occur in non-fully-associative caches when multiple blocks map to the same set and evict each other even though the cache has unused space in other sets. Increasing cache size reduces capacity misses; increasing associativity reduces conflict misses; prefetching reduces compulsory misses.",
      followUps: [
        "What is a fourth C sometimes mentioned? (Coherence misses in multiprocessor systems.)",
        "How can loop tiling reduce capacity misses in matrix multiplication?",
      ],
    },
    {
      q: "What is a TLB and why is it important?",
      a: "The TLB (Translation Lookaside Buffer) is a small, fast cache that stores recent virtual-to-physical page translations. Without it, every memory access would require a multi-level page table walk (3-5 memory accesses for a 4-level page table on x86-64). The TLB typically has 64-1024 entries and achieves 99%+ hit rates. A TLB miss triggers a hardware page table walk. A TLB flush (e.g., on context switch) is expensive because all translations must be re-fetched.",
      followUps: [
        "What are ASIDs and how do they reduce TLB flush overhead?",
        "How do huge pages improve TLB coverage?",
      ],
    },
    {
      q: "How does the MESI cache coherence protocol work?",
      a: "MESI tracks each cache line in one of four states: Modified (only copy, dirty), Exclusive (only copy, clean), Shared (may be in other caches, clean), or Invalid (not valid). On a read miss, the line enters Exclusive if no other cache has it, or Shared if another cache does. On a write, the line becomes Modified and all other copies are invalidated. On a snoop (another cache reads/writes the same address), a Modified line must write back and transition to Shared or Invalid. MOESI adds Owned to avoid unnecessary write-backs.",
      followUps: [
        "What is false sharing and how does MESI cause it?",
        "What is the difference between snooping and directory-based coherence?",
      ],
    },
  ],
  followUps: [
    "How do NUMA architectures extend the memory hierarchy across multiple CPU sockets?",
    "What is cache-oblivious algorithm design and how does it exploit the hierarchy without knowing cache parameters?",
    "How does the OS page replacement algorithm (e.g., clock algorithm) relate to cache replacement policies?",
  ],
  mcqs: [
    {
      q: "Which type of cache miss occurs when multiple blocks map to the same set and evict each other?",
      options: [
        "Compulsory miss",
        "Capacity miss",
        "Conflict miss",
        "Coherence miss",
      ],
      answerIndex: 2,
      explanation:
        "Conflict misses happen in direct-mapped and set-associative caches when too many blocks compete for the same set, even if the cache has unused space elsewhere. Increasing associativity reduces conflict misses.",
    },
    {
      q: "What is the typical size of a cache line in modern CPUs?",
      options: ["8 bytes", "32 bytes", "64 bytes", "256 bytes"],
      answerIndex: 2,
      explanation:
        "Most modern x86 and ARM CPUs use 64-byte cache lines. This size balances spatial locality (fetching nearby data) against wasted bandwidth when only a few bytes are needed.",
    },
    {
      q: "In a 4-way set-associative cache, each set contains:",
      options: [
        "1 cache line",
        "2 cache lines",
        "4 cache lines",
        "The entire cache",
      ],
      answerIndex: 2,
      explanation:
        "N-way set-associative means each set contains N cache lines (ways). A 4-way cache has 4 lines per set, so a given address can be stored in any of 4 locations within its set.",
    },
    {
      q: "What happens during a TLB miss?",
      options: [
        "The program crashes with a segmentation fault",
        "The hardware performs a page table walk to find the translation",
        "The page is loaded from disk",
        "The cache is flushed",
      ],
      answerIndex: 1,
      explanation:
        "A TLB miss triggers a page table walk — the hardware (on x86) traverses the multi-level page table in memory to find the virtual-to-physical mapping and loads it into the TLB. A page fault (page not in RAM) is different and much more expensive.",
    },
    {
      q: "The AMAT formula (Average Memory Access Time) is:",
      options: [
        "Hit Time x Miss Rate + Miss Penalty",
        "Hit Time + Miss Rate x Miss Penalty",
        "Hit Time + Miss Penalty / Miss Rate",
        "(Hit Time + Miss Penalty) x Miss Rate",
      ],
      answerIndex: 1,
      explanation:
        "AMAT = Hit Time + Miss Rate x Miss Penalty. Every access pays the hit time; misses additionally pay the miss penalty, weighted by how often misses occur.",
    },
  ],
  exercises: [
    "Calculate the AMAT for a system with L1 (1 ns, 5% miss rate), L2 (5 ns, 20% miss rate of L1 misses), and main memory (100 ns). Then recalculate if L1 miss rate drops to 2%.",
    "Write a program that demonstrates the performance difference between accessing an array sequentially (stride-1) vs. with a stride equal to the cache line size. Measure and explain the timing difference.",
    "Design a 2-way set-associative cache with 8 sets and 32-byte lines. For the address sequence [0, 64, 128, 0, 64, 256, 0], trace the tag/set for each access and determine hits vs. misses using LRU replacement.",
    "Research and explain how Linux's transparent huge pages (THP) work, including the khugepaged daemon, and discuss the trade-offs for database workloads.",
  ],
  flashcards: [
    {
      front: "What is the principle of locality?",
      back: "Programs tend to access data near recently accessed addresses (spatial locality) and re-access recently used data (temporal locality). The entire memory hierarchy exploits this principle.",
    },
    {
      front: "Direct-mapped vs fully associative vs set-associative cache?",
      back: "Direct-mapped: 1 way per set (fast, high conflict misses). Fully associative: 1 set total (no conflict misses, slow lookup). Set-associative: N ways per set (balanced — the standard choice).",
    },
    {
      front: "AMAT formula?",
      back: "Average Memory Access Time = Hit Time + Miss Rate x Miss Penalty. For multi-level: nest the formula, with each level's miss penalty being the AMAT of the next level.",
    },
    {
      front: "What is false sharing?",
      back: "When two cores modify different variables that happen to reside on the same cache line, the coherence protocol bounces the line between cores (invalidate-on-write), causing severe performance degradation even though there is no true data sharing.",
    },
    {
      front: "What triggers a page fault vs a TLB miss?",
      back: "TLB miss: the translation is not in the TLB but the page is in RAM — a page table walk resolves it (~100 cycles). Page fault: the page is not in RAM at all — the OS must load it from disk (~10 ms for HDD).",
    },
    {
      front: "MESI states?",
      back: "Modified: dirty, only copy. Exclusive: clean, only copy. Shared: clean, may be in other caches. Invalid: not valid. Transitions are triggered by local reads/writes and remote snoops.",
    },
    {
      front: "What are the three Cs of cache misses?",
      back: "Compulsory (first access — cold miss). Capacity (working set > cache size). Conflict (multiple blocks map to same set in non-fully-associative cache). Sometimes a 4th C: Coherence.",
    },
    {
      front: "Write-back vs write-through?",
      back: "Write-through: every write goes to cache AND memory (simple, high bandwidth). Write-back: writes go to cache only, dirty lines written on eviction (lower bandwidth, more complex coherence).",
    },
  ],
  revisionNotes: [
    "Memory hierarchy: Registers > L1 > L2 > L3 > DRAM > SSD > HDD. Each level trades speed for capacity. Exploits temporal and spatial locality.",
    "Cache addressing: address = [tag | set index | block offset]. Tag identifies the block, index selects the set, offset selects the byte within the line.",
    "Replacement policies: LRU (best hit rate, expensive hardware), pseudo-LRU (approximation), random (simple, decent performance).",
    "TLB: caches page table entries. TLB miss = page table walk (~100 cycles). Page fault = load from disk (~10 ms). Huge pages improve TLB coverage.",
    "MESI: M(odified), E(xclusive), S(hared), I(nvalid). Write to Shared line invalidates all other copies. Snooping for buses; directory-based for many-core.",
    "AMAT = Hit Time + Miss Rate x Miss Penalty. Reducing miss rate (larger cache, higher associativity, prefetching) or miss penalty (faster next level) improves AMAT.",
  ],
  cheatSheet: [
    "Latency hierarchy: register ~0.3ns, L1 ~1ns, L2 ~5ns, L3 ~20ns, DRAM ~100ns, SSD ~100us, HDD ~10ms",
    "Cache line size: typically 64 bytes. Address split: [tag | set index | offset (6 bits for 64B)]",
    "N-way set-associative: total lines = num_sets x N. More ways = fewer conflict misses, slower lookup.",
    "AMAT = Hit Time + Miss Rate x Miss Penalty",
    "3 Cs: Compulsory, Capacity, Conflict (+ Coherence in multiprocessor)",
    "TLB: 64-1024 entries, 99%+ hit rate. Huge pages (2MB/1GB) increase TLB coverage dramatically.",
  ],
  resources: [
    {
      label: "Computer Architecture: A Quantitative Approach (Hennessy & Patterson)",
      kind: "book",
      note: "Chapters on memory hierarchy design are the gold standard. Covers AMAT analysis, cache optimization, and virtual memory in depth.",
    },
    {
      label: "What Every Programmer Should Know About Memory (Ulrich Drepper)",
      kind: "article",
      note: "Comprehensive paper covering DRAM internals, cache architecture, NUMA, and practical optimization techniques. Essential reading for systems programmers.",
    },
    {
      label: "Gallery of Processor Cache Effects (Igor Ostrovsky)",
      kind: "article",
      note: "Visual demonstrations of cache behavior with benchmarks showing the effects of stride, working set size, and associativity on performance.",
    },
    {
      label: "Linux perf c2c (cache-to-cache)",
      kind: "docs",
      note: "Tool for detecting false sharing and cache contention in production Linux systems. Part of the perf toolset.",
    },
    {
      label: "Cache-Oblivious Algorithms (Frigo, Leiserson, Prokop, Ramachandran)",
      kind: "paper",
      note: "Foundational paper introducing algorithms that achieve optimal cache performance without knowing cache parameters.",
    },
  ],
  glossary: [
    {
      term: "Cache line (block)",
      definition:
        "The smallest unit of data transfer between cache levels, typically 64 bytes. A cache miss fetches an entire line, exploiting spatial locality.",
    },
    {
      term: "Associativity",
      definition:
        "The number of cache locations (ways) where a given memory block can be placed. Higher associativity reduces conflict misses but increases lookup time and hardware cost.",
    },
    {
      term: "TLB (Translation Lookaside Buffer)",
      definition:
        "A fast cache storing recent virtual-to-physical address translations, avoiding costly page table walks on every memory access.",
    },
    {
      term: "Page fault",
      definition:
        "An exception raised when a virtual page is valid but not currently in physical memory. The OS handles it by loading the page from disk (major fault) or resolving a soft condition (minor fault).",
    },
    {
      term: "MESI protocol",
      definition:
        "A cache coherence protocol with four states (Modified, Exclusive, Shared, Invalid) ensuring that multiple caches maintain a consistent view of shared memory.",
    },
    {
      term: "Write-back",
      definition:
        "A cache write policy where stores only update the cache; modified (dirty) lines are written to the next level only upon eviction, reducing memory bus traffic.",
    },
    {
      term: "Spatial locality",
      definition:
        "The tendency for programs to access memory addresses near recently accessed addresses. Exploited by fetching entire cache lines and by prefetching.",
    },
    {
      term: "False sharing",
      definition:
        "A performance pathology where cores modify independent variables on the same cache line, causing unnecessary coherence traffic and cache invalidations.",
    },
  ],
};
