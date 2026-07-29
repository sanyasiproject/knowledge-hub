import type { TopicContent } from "../types";

export const memoryAllocation: TopicContent = {
  quickSummary: [
    "Memory allocation manages how programs request, use, and release memory at runtime -- divided between stack allocation (automatic, LIFO, fast) and heap allocation (dynamic, flexible, slower).",
    "Heap allocators (malloc/free) must balance speed, memory utilization, and fragmentation -- the three-way trade-off at the heart of allocator design.",
    "Fragmentation comes in two forms: external (free memory is scattered in small blocks) and internal (allocated blocks are larger than requested due to alignment or size-class rounding).",
    "Production allocators like jemalloc, tcmalloc, and mimalloc use thread-local caches, size classes, and arenas to minimize lock contention and fragmentation.",
  ],
  detailed: [
    "A process's memory is organized into several regions: the text segment (code), data segment (global/static variables), stack (function call frames, local variables), and heap (dynamic allocations). The stack grows downward from high addresses and is managed automatically by the compiler -- allocation is just decrementing the stack pointer, deallocation is incrementing it. Stack allocation is extremely fast (single instruction) but limited to LIFO order and fixed-size allocations known at compile time.",
    "Heap allocation via malloc/new provides flexibility: memory can be allocated and freed in any order, with sizes determined at runtime. The allocator maintains metadata about free and allocated blocks. When malloc is called, the allocator searches its free list for a suitable block using a placement policy (first-fit, best-fit, worst-fit, or next-fit). When free is called, the block is returned to the free list, and adjacent free blocks may be coalesced to combat fragmentation.",
    "The OS provides two system calls for heap memory: brk/sbrk (which moves the program break to grow/shrink the heap contiguously) and mmap (which maps arbitrary pages from the kernel). Modern allocators use brk for small allocations and mmap for large allocations (typically >128 KB in glibc). mmap allocations can be returned to the OS independently via munmap, while brk memory can only be returned if the top of the heap is free.",
    "External fragmentation is the primary challenge: after many allocations and frees, the heap may have enough total free memory but no single contiguous block large enough for a new request. Internal fragmentation wastes memory within allocated blocks due to alignment requirements (typically 8 or 16 bytes) and size-class rounding. The buddy system eliminates external fragmentation within power-of-2 blocks but suffers from internal fragmentation (a 65-byte request wastes nearly half of a 128-byte block).",
    "Garbage collection (GC) automates deallocation by tracing reachable objects from root references. Mark-and-sweep is the simplest approach: mark all reachable objects, sweep (free) unmarked ones. Generational GC exploits the observation that most objects die young by collecting the young generation frequently and the old generation rarely. Reference counting frees objects when their reference count drops to zero but cannot handle cycles without a supplementary cycle collector (as in Python's GC).",
  ],
  deepDive: [
    "The Linux kernel's slab allocator (and its successors SLUB and SLOB) pre-allocates caches of commonly-sized kernel objects. Each slab is one or more pages, divided into fixed-size slots for a specific object type (e.g., struct inode). When a kernel subsystem needs an inode, it gets one from the inode cache in O(1) -- no searching free lists or splitting blocks. Slabs can be full, partial, or empty. The allocator preferentially allocates from partial slabs. This eliminates fragmentation for kernel objects and enables constructor/destructor callbacks for complex initialization.",
    "The buddy system divides memory into power-of-2 blocks. When a block of size 2^k is requested but only 2^(k+1) is available, the larger block is split into two 'buddies.' When both buddies are freed, they are coalesced back into the larger block. This enables O(log n) allocation and coalescing, and the buddy's address can be computed with a single XOR operation (flip bit k in the address). The Linux kernel uses the buddy system for page allocation (the page allocator), managing free pages in lists indexed by order (0 = 1 page, 1 = 2 pages, ..., 10 = 1024 pages).",
    "jemalloc (used by FreeBSD, Rust, and formerly Firefox) divides the heap into arenas (typically one per CPU core) to reduce lock contention. Each arena manages memory in size classes: small (8-14336 bytes, in sub-page runs), large (multiples of the page size), and huge (backed directly by mmap). Thread-local caches (tcache) provide lock-free allocation for the most common sizes. jemalloc also uses extent-based management, where contiguous runs of pages form the basis for sub-dividing into smaller size classes, enabling efficient coalescing.",
    "tcmalloc (Google's Thread-Caching Malloc) takes a similar approach: a front-end thread-local cache handles allocations up to 256 KB without locking, a middle-end (transfer cache + central free list) balances between threads, and a back-end (page heap) manages spans of contiguous pages obtained from the OS. Size classes are designed to limit internal fragmentation to ~12.5%. Large allocations (>256 KB) go directly to the page heap. tcmalloc also provides detailed memory profiling and heap-checking tools.",
    "Memory pools (arena allocators) are the simplest and fastest allocation strategy when lifetimes are grouped. A pool pre-allocates a large block and bump-allocates (incrementing a pointer) for each request. Individual frees are no-ops; the entire pool is freed at once. This pattern is ideal for request-scoped allocations in web servers, compiler phases, and game frames. Allocation is O(1) with zero fragmentation within the pool. Rust's bumpalo crate and Apache's apr_pool are well-known implementations.",
  ],
  code: [
    {
      language: "c",
      caption: "Simple free-list heap allocator with first-fit and coalescing",
      source: `#include <stddef.h>
#include <stdint.h>
#include <string.h>

#define HEAP_SIZE 65536

static char heap[HEAP_SIZE];

typedef struct Block {
    size_t size;        /* payload size (excluding header) */
    int free;           /* 1 = free, 0 = allocated */
    struct Block *next; /* next block in list */
} Block;

static Block *free_list = NULL;

void heap_init(void) {
    free_list = (Block *)heap;
    free_list->size = HEAP_SIZE - sizeof(Block);
    free_list->free = 1;
    free_list->next = NULL;
}

void *my_malloc(size_t size) {
    /* Align to 8 bytes */
    size = (size + 7) & ~7;

    Block *curr = free_list;
    while (curr) {
        if (curr->free && curr->size >= size) {
            /* Split if remaining space is large enough */
            if (curr->size >= size + sizeof(Block) + 8) {
                Block *new_block = (Block *)((char *)curr + sizeof(Block) + size);
                new_block->size = curr->size - size - sizeof(Block);
                new_block->free = 1;
                new_block->next = curr->next;
                curr->size = size;
                curr->next = new_block;
            }
            curr->free = 0;
            return (char *)curr + sizeof(Block);
        }
        curr = curr->next;
    }
    return NULL; /* out of memory */
}

void my_free(void *ptr) {
    if (!ptr) return;
    Block *block = (Block *)((char *)ptr - sizeof(Block));
    block->free = 1;

    /* Coalesce adjacent free blocks */
    Block *curr = free_list;
    while (curr) {
        if (curr->free && curr->next && curr->next->free) {
            curr->size += sizeof(Block) + curr->next->size;
            curr->next = curr->next->next;
        } else {
            curr = curr->next;
        }
    }
}`,
    },
    {
      language: "c",
      caption: "Buddy system allocator",
      source: `#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define MAX_ORDER 10          /* max block = 2^10 = 1024 units */
#define POOL_SIZE (1 << MAX_ORDER)

static int pool[POOL_SIZE];  /* simulated memory */

/* Free lists: free_list[k] = linked list of free blocks of size 2^k */
typedef struct BuddyBlock {
    int order;
    int index;               /* starting index in pool */
    struct BuddyBlock *next;
} BuddyBlock;

static BuddyBlock *free_lists[MAX_ORDER + 1];
static int allocated[POOL_SIZE]; /* track allocation status */

void buddy_init(void) {
    memset(free_lists, 0, sizeof(free_lists));
    memset(allocated, 0, sizeof(allocated));
    /* One big free block of order MAX_ORDER */
    static BuddyBlock initial = { MAX_ORDER, 0, NULL };
    free_lists[MAX_ORDER] = &initial;
}

int buddy_alloc(int order) {
    /* Find smallest available block >= requested order */
    int k = order;
    while (k <= MAX_ORDER && free_lists[k] == NULL) k++;
    if (k > MAX_ORDER) return -1; /* out of memory */

    /* Remove block from free list */
    BuddyBlock *block = free_lists[k];
    free_lists[k] = block->next;

    /* Split down to requested order */
    while (k > order) {
        k--;
        /* Create buddy (right half) and add to free list */
        int buddy_idx = block->index + (1 << k);
        /* In production: use a proper block pool */
        printf("Split order %d at %d, buddy at %d\\n", k+1, block->index, buddy_idx);
    }
    allocated[block->index] = 1;
    printf("Allocated order %d block at index %d (size %d)\\n",
           order, block->index, 1 << order);
    return block->index;
}

/* Buddy address: XOR with block size */
int buddy_of(int index, int order) {
    return index ^ (1 << order);
}`,
    },
    {
      language: "python",
      caption: "Arena (bump) allocator pattern",
      source: `class Arena:
    """Simple bump allocator / memory pool.

    Allocations are O(1) pointer bumps.
    Individual frees are no-ops -- the entire arena is freed at once.
    Ideal for request-scoped or phase-scoped allocations.
    """
    def __init__(self, capacity: int):
        self.buffer = bytearray(capacity)
        self.offset = 0
        self.capacity = capacity
        self.alloc_count = 0

    def alloc(self, size: int, align: int = 8) -> memoryview:
        """Allocate 'size' bytes with given alignment."""
        # Align the offset
        aligned = (self.offset + align - 1) & ~(align - 1)
        if aligned + size > self.capacity:
            raise MemoryError(f"Arena exhausted: need {aligned + size}, have {self.capacity}")

        result = memoryview(self.buffer)[aligned:aligned + size]
        self.offset = aligned + size
        self.alloc_count += 1
        return result

    def reset(self):
        """Free all allocations at once -- O(1)."""
        self.offset = 0
        self.alloc_count = 0

    @property
    def used(self) -> int:
        return self.offset

    @property
    def remaining(self) -> int:
        return self.capacity - self.offset

# Usage: web server request handling
arena = Arena(1024 * 1024)  # 1 MB pool

for request_num in range(1000):
    # Process request -- all allocations from the arena
    header_buf = arena.alloc(256)
    body_buf = arena.alloc(4096)
    temp_buf = arena.alloc(512)
    # ... process request ...

    # Reset arena for next request -- instant, no fragmentation
    arena.reset()

print(f"Arena capacity: {arena.capacity}, final used: {arena.used}")`,
    },
  ],
  diagrams: [
    {
      title: "Process memory layout",
      kind: "architecture",
      caption: "High addresses: Stack (grows down) | ... | Heap (grows up) | BSS | Data | Text (code). Shows stack pointer and program break.",
    },
    {
      title: "Buddy system splitting and coalescing",
      kind: "flow",
      caption: "Request for 32 bytes: split 256->128->64->32. Free buddy pair: coalesce 32+32->64, then 64+64->128 if both free.",
    },
    {
      title: "Allocator hierarchy (jemalloc/tcmalloc style)",
      kind: "architecture",
      caption: "Thread-local cache -> Arena/Central cache -> Page heap -> OS (mmap/brk). Each layer handles different size classes.",
    },
  ],
  animations: [
    {
      title: "First-fit allocation and coalescing",
      steps: [
        { label: "Initial state", detail: "Heap has one large free block of 1024 bytes." },
        { label: "malloc(200)", detail: "First-fit finds the 1024-byte block. Splits into [200 allocated][824 free]. Header tracks size and free/allocated status." },
        { label: "malloc(300)", detail: "First-fit scans, finds the 824-byte free block. Splits into [300 allocated][524 free]." },
        { label: "malloc(100)", detail: "Allocates from the 524-byte block. Now: [200 alloc][300 alloc][100 alloc][424 free]." },
        { label: "free(300-byte block)", detail: "Middle block freed: [200 alloc][300 FREE][100 alloc][424 free]. External fragmentation: 724 bytes free but not contiguous." },
        { label: "free(100-byte block)", detail: "Adjacent free blocks coalesced: [200 alloc][300 FREE + 100 FREE -> 400+header FREE][424 free]. Better, but still fragmented." },
        { label: "free(200-byte block)", detail: "All blocks freed and coalesced back into single 1024-byte free block. Full coalescing restores original state." },
      ],
    },
  ],
  comparison: {
    columns: ["Strategy", "Allocation Time", "External Fragmentation", "Internal Fragmentation", "Coalescing", "Used In"],
    rows: [
      ["First-fit", "O(n) free blocks", "Moderate", "Low (exact split)", "Yes, with adjacent merge", "Simple allocators, educational"],
      ["Best-fit", "O(n) free blocks", "Low (but tiny fragments)", "Low", "Yes", "Memory-constrained systems"],
      ["Worst-fit", "O(n) free blocks", "High", "Moderate", "Yes", "Rarely used in practice"],
      ["Buddy system", "O(log n)", "Low (within order)", "High (power-of-2 rounding)", "O(log n) recursive merge", "Linux page allocator"],
      ["Slab allocator", "O(1)", "None (fixed sizes)", "Low (pre-sized objects)", "N/A (returns to slab)", "Linux kernel objects"],
      ["Size-class + tcache", "O(1) typical", "Low", "~12% (size-class rounding)", "Span-level coalescing", "jemalloc, tcmalloc, mimalloc"],
      ["Bump/Arena", "O(1)", "None", "Alignment padding only", "N/A (bulk free only)", "Request-scoped, compilers, games"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between stack and heap allocation?",
      a: "Stack allocation is automatic, LIFO-ordered, and extremely fast (just a stack pointer decrement). It is used for function local variables and call frames, with sizes known at compile time. Lifetime is tied to scope. Heap allocation is dynamic, can be allocated and freed in any order, supports runtime-determined sizes, and persists until explicitly freed (or garbage collected). Heap allocation is slower due to free-list management, fragmentation, and potential system calls. Stack memory is limited (typically 1-8 MB per thread), while heap memory is bounded by available virtual address space.",
      followUps: [
        "What happens when you stack-allocate a large array?",
        "Can you return a pointer to a stack-allocated variable?",
        "Why is stack allocation O(1)?",
      ],
    },
    {
      q: "What is memory fragmentation and how do you combat it?",
      a: "External fragmentation occurs when free memory is broken into small, non-contiguous blocks, so a large allocation fails despite sufficient total free memory. Internal fragmentation occurs when allocated blocks are larger than needed (due to alignment or size-class rounding). Solutions: compaction (moving allocated blocks to create contiguous free space -- expensive and impractical in C/C++), buddy system (limits fragmentation to power-of-2 waste), slab/size-class allocators (pre-partition into fixed sizes, eliminating external fragmentation within each class), and arena allocators (no fragmentation within the arena, bulk-free only).",
    },
    {
      q: "How does malloc work internally?",
      a: "malloc maintains a free list of available memory blocks. On allocation: it searches for a block >= requested size (using first-fit, best-fit, or size-class lookup), splits the block if much larger than needed, and returns a pointer past the block header. On free: it marks the block as free and coalesces with adjacent free blocks. For small allocations, modern allocators (glibc, jemalloc) use thread-local caches with pre-defined size classes for O(1) allocation without locking. For large allocations (typically >128 KB), malloc uses mmap to get pages directly from the OS, which can be returned independently via munmap.",
      followUps: [
        "What is the difference between brk and mmap for heap growth?",
        "What is the MMAP_THRESHOLD in glibc?",
        "Why does free not always return memory to the OS?",
      ],
    },
    {
      q: "What is the buddy system?",
      a: "The buddy system divides memory into blocks of power-of-2 sizes. When a block of size 2^k is needed but only 2^(k+1) is available, the larger block is split into two buddies. When both buddies are free, they are coalesced back. A block's buddy can be found by XORing the address with the block size, making coalescing O(1). The Linux kernel uses the buddy system for its page allocator, with orders 0 through 10 (1 to 1024 pages). It provides O(log n) allocation with limited external fragmentation, but internal fragmentation can be up to 50% (a 33-byte request wastes 31 bytes in a 64-byte block).",
    },
    {
      q: "What is a slab allocator and why is it used in the Linux kernel?",
      a: "The slab allocator pre-allocates caches of fixed-size objects for specific kernel data types (inodes, dentries, task_structs). Each cache manages slabs (one or more contiguous pages divided into slots). Allocation is O(1): grab a slot from a partially-filled slab. Deallocation is O(1): return the slot. Benefits: no fragmentation (all slots are the same size), constructors can pre-initialize objects, and per-CPU caches eliminate lock contention. SLUB (the current default in Linux) simplified the slab design by removing the separate full/partial/empty slab queues and using the page struct directly for metadata.",
      followUps: [
        "What is the difference between SLAB, SLUB, and SLOB?",
        "How does the slab allocator interact with the buddy system?",
      ],
    },
    {
      q: "When would you use an arena allocator?",
      a: "Use an arena (bump) allocator when many allocations share the same lifetime and can be freed together. Common scenarios: web server request processing (allocate everything for one request from an arena, reset after responding), compiler phases (lexer, parser, codegen each use an arena), game engine frames (per-frame temporary allocations), and document parsers. Benefits: O(1) allocation (just bump a pointer), zero fragmentation, cache-friendly linear layout, no per-object free overhead, and instant bulk deallocation. The trade-off is that individual objects cannot be freed independently.",
    },
  ],
  followUps: [
    "How does garbage collection compare to manual memory management?",
    "What are the trade-offs of different GC algorithms (mark-sweep, copying, generational)?",
    "How do Rust's ownership rules provide memory safety without GC?",
    "What is memory-mapped I/O and how does mmap relate to allocation?",
    "How do containers (cgroups) limit and account for memory allocation?",
  ],
  mcqs: [
    {
      q: "Which allocation strategy suffers the most from internal fragmentation?",
      options: ["First-fit", "Best-fit", "Buddy system", "Slab allocator"],
      answerIndex: 2,
      explanation: "The buddy system rounds all allocations to the next power of 2, potentially wasting up to 50% of the allocated block. A 33-byte request gets a 64-byte block.",
    },
    {
      q: "What system call does glibc malloc use for large allocations (>128 KB)?",
      options: ["brk", "sbrk", "mmap", "calloc"],
      answerIndex: 2,
      explanation: "Large allocations use mmap because mmap regions can be individually returned to the OS via munmap, unlike brk which can only shrink from the top of the heap.",
    },
    {
      q: "What is the time complexity of allocation in a bump/arena allocator?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      answerIndex: 2,
      explanation: "Bump allocation only increments a pointer (after alignment), which is O(1). No free-list traversal or splitting is needed.",
    },
    {
      q: "How does the buddy system find a block's buddy?",
      options: [
        "By searching the free list",
        "By XORing the block address with the block size",
        "By checking the next sequential block",
        "By maintaining a buddy pointer in the header",
      ],
      answerIndex: 1,
      explanation: "The buddy of a block at address A with size 2^k is at address A XOR 2^k. This single XOR operation makes buddy identification O(1).",
    },
    {
      q: "What is external fragmentation?",
      options: [
        "Wasted space inside allocated blocks due to alignment",
        "Free memory scattered in small non-contiguous blocks",
        "Memory leaked by forgetting to call free",
        "Stack overflow due to deep recursion",
      ],
      answerIndex: 1,
      explanation: "External fragmentation means total free memory is sufficient but no single contiguous block is large enough for a request. Free memory is fragmented across the heap.",
    },
    {
      q: "Which allocator is used by the Linux kernel for page-level allocation?",
      options: ["Slab allocator", "Buddy system", "jemalloc", "First-fit free list"],
      answerIndex: 1,
      explanation: "The Linux kernel uses the buddy system for page allocation (orders 0-10). The slab allocator sits on top of it for sub-page, object-level allocation.",
    },
  ],
  exercises: [
    "Implement a simple heap allocator with first-fit placement and block coalescing. Test it with various allocation/free patterns and measure fragmentation.",
    "Implement a buddy system allocator that supports allocations of power-of-2 sizes. Verify that buddy coalescing works correctly by allocating and freeing in different orders.",
    "Compare the performance of malloc vs. an arena allocator for allocating 1 million small objects. Measure allocation time and memory overhead.",
    "Write a program that deliberately causes external fragmentation: allocate many blocks, free every other one, then try to allocate a large block. Show that the allocation fails despite sufficient total free memory.",
    "Implement a simple mark-and-sweep garbage collector for a graph of objects. Track roots, perform reachability analysis, and sweep unreachable objects.",
  ],
  flashcards: [
    { front: "Stack vs heap allocation speed?", back: "Stack: O(1), single instruction (decrement SP). Heap: O(1) to O(n) depending on allocator, requires free-list management, potential system calls." },
    { front: "What is external fragmentation?", back: "Free memory is scattered in small non-contiguous blocks, so a large allocation fails despite sufficient total free memory." },
    { front: "What is internal fragmentation?", back: "Wasted space inside allocated blocks due to alignment padding or size-class rounding (e.g., requesting 33 bytes but getting 64)." },
    { front: "How does the buddy system find a buddy?", back: "XOR the block address with the block size: buddy_addr = block_addr XOR 2^order." },
    { front: "What is a slab allocator?", back: "Pre-allocates caches of fixed-size objects. O(1) allocation/deallocation, zero fragmentation. Used in Linux kernel for struct inode, task_struct, etc." },
    { front: "brk vs mmap for heap memory?", back: "brk extends the heap contiguously (can only shrink from top). mmap maps arbitrary pages (can be individually returned via munmap). glibc uses mmap for allocations >128 KB." },
    { front: "What is a bump/arena allocator?", back: "Allocates by incrementing a pointer. O(1) allocation, zero fragmentation, but individual frees are impossible -- the entire arena is freed at once." },
    { front: "What does jemalloc use to reduce lock contention?", back: "Per-CPU arenas and thread-local caches (tcache). Most allocations are served from the thread-local cache without any locking." },
    { front: "What is coalescing?", back: "Merging adjacent free blocks into a single larger free block to reduce external fragmentation." },
    { front: "What is the MMAP_THRESHOLD in glibc?", back: "The size (default 128 KB) above which malloc uses mmap instead of brk. Can be tuned with mallopt(M_MMAP_THRESHOLD, ...)." },
  ],
  revisionNotes: [
    "Memory layout: Text | Data | BSS | Heap (grows up) | ... | Stack (grows down).",
    "Stack: automatic, LIFO, O(1), limited size (1-8 MB). Heap: dynamic, any-order, slower, bounded by VM.",
    "malloc searches free list, splits if needed. free marks block free and coalesces adjacent free blocks.",
    "brk: contiguous heap growth, can only return memory from top. mmap: arbitrary pages, individually returnable.",
    "External fragmentation: scattered free blocks. Internal fragmentation: wasted space in allocated blocks.",
    "Buddy system: power-of-2 blocks, XOR to find buddy, O(log n) alloc/coalesce. Up to 50% internal fragmentation.",
    "Slab: fixed-size object caches, O(1), no fragmentation. Used by Linux kernel (SLUB is default).",
    "jemalloc/tcmalloc: per-thread caches + arenas + size classes = fast, low-fragmentation, low-contention.",
    "Arena/bump: O(1) alloc, zero fragmentation, bulk-free only. Perfect for request-scoped lifetimes.",
    "GC: mark-sweep (simple, pauses), copying (no fragmentation, half memory), generational (most objects die young).",
  ],
  cheatSheet: [
    "Stack: SP decrement = alloc, SP increment = dealloc. O(1). Auto-managed.",
    "Heap: malloc -> search free list -> split -> return pointer. free -> mark free -> coalesce.",
    "brk: move program break. mmap: map pages. glibc MMAP_THRESHOLD = 128 KB.",
    "Fragmentation: external (scattered free) vs internal (padding/rounding waste).",
    "Buddy: blocks = 2^k. Buddy addr = addr XOR 2^k. Linux page allocator orders 0-10.",
    "Slab (SLUB): per-type caches of fixed-size objects. O(1) alloc/free. Kernel objects.",
    "jemalloc: arenas (per-CPU) + tcache (per-thread) + size classes. Low contention.",
    "tcmalloc: thread cache (<256KB) + transfer cache + page heap. ~12.5% internal frag.",
    "Arena/bump: alloc = ptr += size. Free = reset ptr. Perfect for grouped lifetimes.",
    "Common sizes: glibc min alloc = 32 bytes (64-bit). Alignment = 16 bytes on x86-64.",
  ],
  resources: [
    { label: "Operating Systems: Three Easy Pieces (OSTEP)", kind: "book", note: "Chapter 17 covers free-space management with clear diagrams of allocation strategies." },
    { label: "Computer Systems: A Programmer's Perspective (CS:APP)", kind: "book", note: "Chapter 9.9 covers dynamic memory allocation, including an implicit free-list allocator implementation." },
    { label: "jemalloc documentation", kind: "docs", note: "Comprehensive documentation of jemalloc's arena, bin, and tcache architecture." },
    { label: "tcmalloc design doc", kind: "article", note: "Google's design document explaining tcmalloc's three-tier architecture." },
    { label: "Understanding glibc malloc", kind: "article", note: "Deep dive into glibc's ptmalloc2 internals: arenas, bins, chunks, and fastbins." },
    { label: "The Slab Allocator (Jeff Bonwick)", kind: "paper", note: "Original paper on the slab allocator, published at USENIX 1994." },
    { label: "Malloc Internals - Azeria Labs", kind: "video", note: "Visual explanation of heap exploitation basics including malloc/free internals." },
  ],
  glossary: [
    { term: "Heap", definition: "Region of memory for dynamic allocation, managed by malloc/free. Grows via brk or mmap." },
    { term: "Stack", definition: "LIFO memory region for function call frames and local variables, managed automatically by the compiler." },
    { term: "External fragmentation", definition: "Free memory scattered in small blocks such that large contiguous allocations fail despite sufficient total free space." },
    { term: "Internal fragmentation", definition: "Wasted space within allocated blocks due to alignment requirements or size-class rounding." },
    { term: "Coalescing", definition: "Merging adjacent free blocks into a single larger free block to reduce fragmentation." },
    { term: "Buddy system", definition: "Allocation scheme using power-of-2 block sizes. Buddies are found by XOR and coalesced when both are free." },
    { term: "Slab allocator", definition: "Allocator that pre-creates caches of fixed-size objects, providing O(1) allocation without fragmentation." },
    { term: "Arena allocator", definition: "Bump-pointer allocator where individual frees are no-ops and the entire arena is freed at once." },
    { term: "brk/sbrk", definition: "System calls that move the program break to grow or shrink the heap contiguously." },
    { term: "mmap", definition: "System call that maps pages of memory, used for large allocations and memory-mapped files." },
    { term: "Size class", definition: "A predefined allocation size (e.g., 8, 16, 32, ..., 256 bytes) used by modern allocators to reduce fragmentation and speed up allocation." },
    { term: "Thread-local cache", definition: "Per-thread pool of pre-allocated objects enabling lock-free allocation for common sizes." },
  ],
};
