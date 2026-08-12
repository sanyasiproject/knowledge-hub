import type { TopicContent } from "../types";

export const redisPersistence: TopicContent = {
  quickSummary: [
    "Redis offers two persistence mechanisms — RDB (point-in-time snapshots) and AOF (append-only file logging every write) — plus a hybrid mode that combines both for fast restarts with minimal data loss.",
    "RDB uses fork() to create a child process that writes a compact binary snapshot. AOF logs every write command and can be configured with different fsync policies (always, everysec, no) to balance durability against performance.",
    "The default hybrid mode (aof-use-rdb-preamble yes) writes an RDB snapshot as the AOF prefix, followed by incremental commands — giving fast load times with near-zero data loss.",
  ],
  detailed: [
    "RDB persistence saves the dataset as a compressed binary file (dump.rdb) at configured intervals. The SAVE command blocks the server; BGSAVE forks a child process that writes the snapshot while the parent continues serving requests. The save directive in redis.conf triggers automatic BGSAVE — e.g., 'save 900 1' means save if at least 1 key changed in 900 seconds. RDB files are compact, ideal for backups and disaster recovery, but you lose all writes since the last snapshot on crash.",
    "AOF persistence logs every write command in a protocol-compatible format. On restart, Redis replays the AOF to reconstruct the dataset. The appendfsync setting controls durability: 'always' calls fsync after every write (safest, slowest), 'everysec' (default) fsyncs once per second (at most 1 second of data loss), and 'no' lets the OS decide when to flush (fastest, up to 30 seconds of data loss on Linux). AOF files grow over time and must be compacted via BGREWRITEAOF.",
    "AOF rewrite (BGREWRITEAOF) forks a child that generates a new, minimal AOF containing only the commands needed to recreate the current dataset. The parent buffers new writes during the rewrite and appends them to the new AOF when the child finishes. This avoids unbounded file growth. Redis 7.0 introduced multi-part AOF: a base file (RDB or AOF format) plus incremental files, eliminating the need for a single monolithic rewrite.",
    "Hybrid persistence (aof-use-rdb-preamble yes, default since Redis 4.0) writes the AOF base as an RDB snapshot during rewrite. On restart, Redis loads the compact RDB prefix quickly, then replays only the incremental AOF commands. This combines RDB's fast loading with AOF's durability.",
    "The fork() mechanism is central to both RDB and AOF rewrite. Redis calls fork() to create a child process that shares the parent's memory pages via copy-on-write (COW). The child writes the snapshot while the parent modifies pages — only modified pages are copied. On a server with 10 GB of data and 10% write rate during the snapshot, the child needs roughly 1 GB of additional memory. This COW behavior depends on the OS; Linux's Transparent Huge Pages (THP) can cause 2 MB page copies instead of 4 KB, dramatically increasing memory usage during fork. Redis explicitly advises disabling THP.",
    "The fsync policy affects not just durability but also latency. With appendfsync always, every write blocks until the kernel flushes the AOF buffer to disk — adding disk I/O latency (potentially milliseconds on HDD, microseconds on NVMe). With everysec, a background thread handles fsync, so write latency is unaffected, but the server may block if the previous fsync has not completed (to prevent buffer from growing unboundedly). The no-appendfsync-on-rewrite option prevents fsync during AOF rewrite to avoid latency spikes.",
  ],
  deepDive: [
    "RDB file format: the file starts with a 'REDIS' magic string and version number, followed by database selector bytes, key-value pairs with type-specific encodings, and an EOF marker with a CRC64 checksum. Values are encoded using the same compact formats as in-memory (intset, listpack) when possible, plus LZF compression for large strings. The RDB format is versioned (currently version 10 in Redis 7.x) and backward-compatible. Tools like redis-rdb-tools can parse and analyze RDB files offline.",
    "AOF rewrite internals in Redis 7.0+: Multi-part AOF uses a manifest file (appendonly.aof.manifest) that lists the base file and incremental files. During BGREWRITEAOF, the child writes a new base (RDB or AOF format). New incremental files are created after each rewrite. Old files are garbage-collected. This eliminates the atomicity risk of the old single-file rewrite (renaming the temp file over the old AOF) and enables incremental backups by shipping individual AOF files.",
    "Fork performance on large datasets: fork() is generally O(1) in Linux (it copies page tables, not data), but page table copying scales with resident set size. On a 64 GB dataset, fork can take 100-200ms, during which Redis is frozen. Huge pages (2 MB) reduce page table size by 512x, making fork faster, but THP's COW granularity (2 MB vs 4 KB) increases memory overhead during writes. The solution is to use huge pages for page table efficiency but disable THP's automatic merging. Alternatively, use io-threads or Redis on Flash to reduce resident memory.",
    "Data safety analysis: with AOF appendfsync everysec, you can lose at most ~2 seconds of data (the current second plus the prior second if fsync was delayed). With RDB only, you lose all changes since the last BGSAVE. With hybrid AOF, you get the best of both: fast recovery (RDB prefix loads in seconds for multi-GB datasets) and minimal data loss (at most 1-2 seconds with everysec). For truly zero data loss, use appendfsync always with replicas, accepting the performance cost.",
  ],
  code: [
    {
      language: "redis",
      caption: "RDB configuration and manual snapshot",
      source: `# redis.conf — RDB save points
save 900 1       # Save if >= 1 key changed in 15 minutes
save 300 10      # Save if >= 10 keys changed in 5 minutes
save 60 10000    # Save if >= 10000 keys changed in 1 minute

# Trigger manual background save
BGSAVE
# Background saving started

# Check last save timestamp
LASTSAVE
# (integer) 1688000000

# Check RDB status
INFO persistence
# rdb_bgsave_in_progress:0
# rdb_last_save_time:1688000000
# rdb_last_bgsave_status:ok
# rdb_last_bgsave_time_sec:2

# Disable RDB completely
CONFIG SET save ""`,
    },
    {
      language: "redis",
      caption: "AOF configuration and fsync policies",
      source: `# redis.conf — AOF settings
appendonly yes
appendfilename "appendonly.aof"
appenddirname "appendonlydir"

# fsync policies
appendfsync everysec    # Default: fsync once per second
# appendfsync always    # fsync after every write (safest)
# appendfsync no        # Let OS decide (fastest)

# Prevent fsync during rewrite to avoid latency spikes
no-appendfsync-on-rewrite yes

# Auto-trigger rewrite when AOF grows by 100% over last rewrite size
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Hybrid AOF (RDB preamble, default since Redis 4.0)
aof-use-rdb-preamble yes

# Manual AOF rewrite
BGREWRITEAOF
# Background append only file rewriting started

# Check AOF status
INFO persistence
# aof_enabled:1
# aof_rewrite_in_progress:0
# aof_last_rewrite_time_sec:1
# aof_current_size:1048576
# aof_base_size:524288`,
    },
    {
      language: "bash",
      caption: "Inspecting and repairing AOF files",
      source: `# Check AOF file integrity
redis-check-aof --fix appendonlydir/appendonly.aof.1.incr.aof

# Analyze RDB file
redis-check-rdb dump.rdb

# Parse RDB file with rdb tools (third-party)
rdb --command json dump.rdb > dump.json
rdb --command memory dump.rdb --bytes 128 > memory-report.csv

# Monitor fork and persistence events
redis-cli monitor | grep -E "BGSAVE|BGREWRITEAOF"

# Check copy-on-write memory usage after fork
grep -A2 "Background" /var/log/redis/redis-server.log
# Background saving terminated with success
# RDB: 42 MB of memory used by copy-on-write`,
    },
    {
      language: "cpp",
      caption: "Monitoring persistence health programmatically",
      source: `// Using redis-plus-plus (sw::redis) to monitor persistence health
#include <sw/redis++/redis++.h>
#include <iostream>
#include <string>
#include <chrono>
#include <ctime>

int main() {
    auto redis = sw::redis::Redis("tcp://127.0.0.1:6379");

    // INFO persistence returns a bulk string; parse key-value pairs
    auto info_str = redis.command<std::string>("INFO", "persistence");
    auto parse_field = [&](const std::string& key) -> std::string {
        auto pos = info_str.find(key + ":");
        if (pos == std::string::npos) return "";
        auto start = pos + key.size() + 1;
        auto end = info_str.find("\\r\\n", start);
        return info_str.substr(start, end - start);
    };

    // Check last successful save
    long last_save = std::stol(parse_field("rdb_last_save_time"));
    std::string bgsave_err = parse_field("rdb_last_bgsave_status");
    std::string aof_err = parse_field("aof_last_bgrewrite_status");

    // Alert if last save is stale
    auto now = std::time(nullptr);
    if (now - last_save > 3600) {
        std::cout << "WARNING: Last RDB save was "
                  << (now - last_save) << "s ago" << std::endl;
    }

    if (bgsave_err != "ok") {
        std::cerr << "ERROR: Last BGSAVE failed: " << bgsave_err << std::endl;
    }

    // Check AOF growth ratio
    long aof_current = std::stol(parse_field("aof_current_size"));
    long aof_base = std::stol(parse_field("aof_base_size"));
    if (aof_base > 0 && static_cast<double>(aof_current) / aof_base > 2.0) {
        std::cout << "WARNING: AOF is "
                  << static_cast<double>(aof_current) / aof_base
                  << "x base size, rewrite needed" << std::endl;
    }

    // Check fork COW memory (latency impact)
    long cow_size = std::stol(parse_field("rdb_last_cow_size"));
    std::cout << "Last fork COW memory: "
              << static_cast<double>(cow_size) / 1024.0 / 1024.0
              << " MB" << std::endl;
    return 0;
}`,
    },
    {
      language: "redis",
      caption: "Runtime persistence tuning",
      source: `# Switch from RDB-only to AOF without restart
CONFIG SET appendonly yes
# Redis starts an initial AOF rewrite in background

# Change fsync policy at runtime
CONFIG SET appendfsync always

# Temporarily disable RDB saves
CONFIG SET save ""

# Re-enable with new thresholds
CONFIG SET save "300 10 60 10000"

# Force rewrite AOF now
BGREWRITEAOF

# Persist config changes to redis.conf
CONFIG REWRITE

# Debug: simulate a crash recovery
DEBUG LOADAOF    # Reload AOF (testing only, not for production)
DEBUG RELOAD     # Save + quit + reload (testing only)`,
    },
  ],
  diagrams: [
    {
      title: "RDB Snapshot via fork and Copy-on-Write",
      kind: "sequence",
      caption: "Redis forks a child process for BGSAVE. The child writes the RDB snapshot while the parent continues serving requests. Modified pages trigger OS copy-on-write.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant P as Redis Parent
    participant Ch as Child Process
    participant D as Disk

    P->>Ch: fork()
    Note over Ch: Shares memory via COW
    C->>P: SET key value
    P->>P: Modify page - COW copy
    Ch->>D: Write RDB snapshot
    Ch->>Ch: Serialize all keys
    Ch->>D: fsync and close file
    Ch-->>P: Exit SIGCHLD
    P->>D: Rename temp to dump.rdb`,
    },
    {
      title: "AOF Rewrite Multi-Part File Flow",
      kind: "flow",
      caption: "BGREWRITEAOF forks a child to write a new base file. The parent buffers new commands. On completion the manifest is updated and old files are garbage-collected.",
      mermaid: `flowchart TD
    A([BGREWRITEAOF triggered]) --> B[Fork child process]
    B --> C[Child writes new base RDB]
    B --> D[Parent buffers new writes]
    C --> E[Child exits]
    D --> F[Rewrite buffer accumulated]
    E --> G[Append buffer to new incremental AOF]
    G --> H[Update manifest file]
    H --> I[Garbage-collect old files]
    I --> J([Rewrite complete])`,
    },
    {
      title: "Persistence Mode Comparison",
      kind: "architecture",
      caption: "Comparison of RDB-only, AOF-only, and Hybrid persistence modes showing their trade-offs in data safety, recovery speed, and file size.",
      mermaid: `graph LR
    subgraph RDB["RDB Only"]
      R1[Compact binary snapshot]
      R2[Fast restart]
      R3[Data loss on crash]
    end
    subgraph AOF["AOF Only"]
      A1[Every write logged]
      A2[Slow restart - replay all]
      A3[1-2 sec data loss max]
    end
    subgraph Hybrid["Hybrid Mode"]
      H1[RDB preamble in AOF]
      H2[Fast load and low data loss]
      H3[Default since Redis 4.0]
    end
    RDB --> Hybrid
    AOF --> Hybrid`,
    },
    {
      title: "AOF fsync Policy Decision",
      kind: "flow",
      caption: "Choosing the right appendfsync policy based on durability requirements and performance constraints.",
      mermaid: `flowchart TD
    A([Choose fsync policy]) --> B{Zero data loss required?}
    B -->|Yes| C[appendfsync always]
    C --> C1[fsync after every write]
    C1 --> C2[Safest - highest latency]
    B -->|No| D{1 second loss acceptable?}
    D -->|Yes| E[appendfsync everysec]
    E --> E1[Background fsync per second]
    E1 --> E2[Recommended default]
    D -->|No strict need| F[appendfsync no]
    F --> F1[OS decides when to flush]
    F1 --> F2[Fastest - least durable]`,
    },
  ],
  animations: [
    {
      title: "Copy-on-write during BGSAVE",
      steps: [
        { label: "Fork", detail: "Redis calls fork(). The OS creates a child process that shares all memory pages with the parent. No data is copied yet — both processes reference the same physical pages." },
        { label: "Child starts writing", detail: "The child process iterates through the keyspace, serializing each key-value pair to the RDB file. It reads from shared memory pages." },
        { label: "Parent receives writes", detail: "A client sends a SET command. The parent needs to modify a memory page. The OS intercepts the write and copies that page (4 KB) before allowing the modification. The child still sees the original page." },
        { label: "COW accumulation", detail: "As more writes arrive, more pages are copied. The memory overhead equals the number of modified pages times 4 KB. With THP enabled, each copy is 2 MB instead." },
        { label: "Child completes", detail: "The child finishes writing the RDB file, syncs it to disk, and exits. The parent replaces the old dump.rdb with the new one atomically (rename). COW pages are freed." },
      ],
    },
    {
      title: "AOF rewrite lifecycle",
      steps: [
        { label: "Trigger", detail: "Either auto-aof-rewrite-percentage threshold is exceeded, or an admin runs BGREWRITEAOF. Redis forks a child process." },
        { label: "Child writes base", detail: "The child iterates the dataset and writes a new base file (RDB format if hybrid is enabled, otherwise AOF commands). This is the minimal representation of the current dataset." },
        { label: "Parent buffers", detail: "While the child writes, the parent appends new write commands to both the old incremental AOF and a rewrite buffer. This captures changes during the rewrite." },
        { label: "Child signals done", detail: "The child process finishes and exits. The parent is notified via SIGCHLD." },
        { label: "Switch files", detail: "The parent writes the buffered commands to a new incremental AOF file, updates the manifest to reference the new base + new incremental, and garbage-collects old files." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "RDB", "AOF (everysec)", "Hybrid (RDB preamble + AOF)"],
    rows: [
      ["Data loss on crash", "All changes since last save (minutes)", "At most ~2 seconds", "At most ~2 seconds"],
      ["File size", "Compact (compressed binary)", "Larger (text commands, grows until rewrite)", "Compact base + small incremental"],
      ["Restart speed", "Very fast (binary load)", "Slow (replay all commands)", "Fast (binary load + small replay)"],
      ["Write performance impact", "None between saves; fork latency spike", "Minimal (background fsync)", "Minimal (background fsync)"],
      ["Fork memory overhead", "Once per save interval", "Once per rewrite", "Once per rewrite"],
      ["Backup friendliness", "Excellent (single compact file)", "Poor (large, multi-file)", "Good (manifest + files)"],
      ["Recovery correctness", "Point-in-time only", "Command-by-command replay", "RDB base + command replay"],
      ["Default since", "Redis 1.0", "Redis 1.0 (optional)", "Redis 4.0 (hybrid preamble)"],
    ],
  },
  interviewQA: [
    {
      q: "What happens if Redis crashes during a BGSAVE (while the child is writing the RDB file)?",
      a: "Nothing is lost. The child writes to a temporary file (temp-<pid>.rdb). If the child crashes or the server crashes, the temp file is simply discarded on next startup. The previous dump.rdb remains intact. Only after the child successfully completes and syncs the file does the parent atomically rename it to dump.rdb.",
      followUps: [
        "What if the disk fills up during BGSAVE?",
        "How does Redis handle BGSAVE failure — does it retry automatically?",
      ],
    },
    {
      q: "Why does Redis recommend disabling Transparent Huge Pages (THP)?",
      a: "THP uses 2 MB pages instead of 4 KB. During fork-based persistence, copy-on-write copies entire pages when they are modified. With THP, modifying a single byte triggers a 2 MB copy instead of 4 KB — a 512x increase. On a write-heavy workload during BGSAVE, this can cause memory usage to spike dramatically and even trigger OOM kills. Redis logs a warning on startup if THP is enabled.",
      followUps: [
        "How do you disable THP on Linux?",
        "Are there any cases where THP helps Redis?",
      ],
    },
    {
      q: "Explain the trade-offs between appendfsync always, everysec, and no.",
      a: "appendfsync always guarantees zero data loss (every write is fsynced before acknowledging) but adds disk latency to every command — potentially 1-10ms per operation on HDD. everysec (default) fsyncs in a background thread once per second, adding no latency to commands but risking up to ~2 seconds of data loss. 'no' delegates fsyncing to the OS (typically every 30 seconds on Linux), giving maximum throughput but up to 30 seconds of potential data loss. Most production deployments use everysec as the optimal balance.",
    },
    {
      q: "How does Redis 7.0 multi-part AOF improve over the single-file AOF?",
      a: "Single-file AOF required an atomic rename to replace the old file — if the server crashed between writing the new AOF and renaming, data could be lost or corrupted. Multi-part AOF uses a manifest file that lists a base file and incremental files. The manifest is updated atomically. Old files are garbage-collected safely. This also enables incremental backups (ship individual incremental files) and reduces the rewrite's risk window.",
    },
  ],
  followUps: [
    "RDB or AOF — what exactly do you lose with each on a crash?",
    "Why does the fork for an RDB snapshot cause a latency spike, and how large is it?",
    "If Redis is your cache, does persistence matter at all?",
  ],
  mcqs: [
    {
      q: "With appendfsync everysec, what is the maximum data loss on a crash?",
      options: ["Zero — all writes are durable", "At most 1 second", "At most ~2 seconds", "Up to 30 seconds"],
      answerIndex: 2,
      explanation: "The background fsync runs every second, but if the previous fsync was delayed, up to 2 seconds of data may be in the OS buffer. The Redis documentation states 'up to one to two seconds of writes.'",
    },
    {
      q: "What format does hybrid AOF use for its base file?",
      options: ["AOF text commands", "RDB binary format", "JSON", "Protocol Buffers"],
      answerIndex: 1,
      explanation: "With aof-use-rdb-preamble yes (default since Redis 4.0), the AOF base is written in compact RDB format for fast loading, followed by incremental AOF commands.",
    },
    {
      q: "Which system call does Redis use to create the child process for BGSAVE?",
      options: ["exec()", "fork()", "clone()", "spawn()"],
      answerIndex: 1,
      explanation: "Redis uses fork() which creates a child process sharing the parent's memory via copy-on-write. This is fundamental to how Redis achieves point-in-time snapshots without blocking.",
    },
    {
      q: "What triggers an automatic AOF rewrite?",
      options: [
        "When AOF file exceeds 1 GB",
        "Every 60 seconds",
        "When AOF size exceeds auto-aof-rewrite-percentage of the base size AND auto-aof-rewrite-min-size",
        "When memory usage exceeds maxmemory",
      ],
      answerIndex: 2,
      explanation: "Redis triggers BGREWRITEAOF when the current AOF size grows by auto-aof-rewrite-percentage (default 100%) over the last rewrite base size, AND the AOF is at least auto-aof-rewrite-min-size (default 64 MB).",
    },
    {
      q: "What is the copy-on-write page size with Transparent Huge Pages enabled?",
      options: ["4 KB", "64 KB", "2 MB", "1 GB"],
      answerIndex: 2,
      explanation: "THP uses 2 MB pages, so each COW copy during fork-based persistence copies 2 MB instead of the standard 4 KB, potentially causing massive memory spikes.",
    },
  ],
  flashcards: [
    { front: "What is the default AOF fsync policy in Redis?", back: "appendfsync everysec — fsyncs once per second in a background thread, risking at most ~2 seconds of data loss." },
    { front: "How does Redis ensure RDB file integrity?", back: "The RDB file includes a CRC64 checksum at the end. Redis verifies it on load. The file is written to a temp file first and atomically renamed on completion." },
    { front: "What is the BGSAVE command?", back: "Triggers a background RDB save by forking a child process. The parent continues serving clients while the child writes the snapshot." },
    { front: "What does no-appendfsync-on-rewrite do?", back: "Prevents fsync calls during AOF rewrite to avoid latency spikes from competing disk I/O between the main process fsyncing the AOF and the child writing the rewrite file." },
    { front: "What config enables hybrid AOF persistence?", back: "aof-use-rdb-preamble yes (default since Redis 4.0). The AOF base file is written in RDB format for fast loading." },
    { front: "What is the auto-aof-rewrite-percentage default?", back: "100 — Redis triggers a rewrite when the AOF grows to double the size of the last rewrite base, provided it also exceeds auto-aof-rewrite-min-size (64 MB)." },
    { front: "Why is fork() latency a concern for large Redis instances?", back: "fork() copies page tables, which scales with resident memory. A 64 GB instance may see 100-200ms of freeze during fork. All client commands are blocked during this time." },
    { front: "How does multi-part AOF (Redis 7.0) organize files?", back: "A manifest file references a base file (RDB or AOF) plus one or more incremental AOF files. Old files are garbage-collected after rewrite." },
  ],
  revisionNotes: [
    "RDB: point-in-time binary snapshots via BGSAVE (fork + COW). Compact files, fast recovery, but data loss between saves.",
    "AOF: append-only log of write commands. Three fsync policies: always (zero loss, slow), everysec (default, ~2s loss), no (OS-managed, ~30s loss).",
    "Hybrid AOF (default since 4.0): RDB preamble for fast load + AOF tail for recent writes. Best of both worlds.",
    "Multi-part AOF (Redis 7.0): manifest + base + incremental files. Safer rewrite, enables incremental backups.",
    "fork() creates a child sharing memory via COW. Only modified pages (4 KB each) are copied. Disable THP to avoid 2 MB COW copies.",
    "BGREWRITEAOF compacts the AOF by generating a minimal base from the current dataset. Runs in a forked child.",
    "RDB files include CRC64 checksum. Written to temp file first, atomically renamed on success.",
    "Use CONFIG SET appendonly yes to enable AOF at runtime without restart. Redis performs an initial rewrite.",
    "Monitor persistence health via INFO persistence: check rdb_last_bgsave_status, aof_last_bgrewrite_status, and rdb_last_save_time.",
  ],
  cheatSheet: [
    "BGSAVE — trigger background RDB snapshot",
    "BGREWRITEAOF — trigger background AOF rewrite",
    "LASTSAVE — Unix timestamp of last successful RDB save",
    "INFO persistence — full persistence status and metrics",
    "CONFIG SET appendonly yes — enable AOF at runtime",
    "CONFIG SET appendfsync everysec — change fsync policy at runtime",
    "CONFIG SET save '300 10 60 10000' — set RDB auto-save thresholds",
    "CONFIG REWRITE — persist runtime config changes to redis.conf",
    "redis-check-aof --fix <file> — check and repair corrupted AOF",
    "redis-check-rdb <file> — validate RDB file integrity",
    "Disable THP: echo never > /sys/kernel/mm/transparent_hugepage/enabled",
    "MEMORY USAGE key — check per-key memory footprint",
    "DEBUG SLEEP 0 — no-op to test latency monitoring",
  ],
  resources: [
    { label: "Redis Persistence Documentation", kind: "docs", note: "Official guide covering RDB, AOF, and hybrid persistence." },
    { label: "Redis Administration Guide", kind: "docs", note: "Production deployment guidance including persistence tuning and THP." },
    { label: "Redis in Action — Chapter 4: Persistence", kind: "book", note: "Practical coverage of RDB and AOF trade-offs with worked examples." },
    { label: "Antirez blog — Redis persistence demystified", kind: "article", note: "Deep dive into fork mechanics, AOF rewrite, and data safety guarantees." },
    { label: "Redis source: rdb.c and aof.c", kind: "repo", note: "Core persistence implementation. rdbSave(), rewriteAppendOnlyFile(), and related functions." },
  ],
  glossary: [
    { term: "RDB (Redis Database)", definition: "Point-in-time binary snapshot of the entire dataset, written by a forked child process." },
    { term: "AOF (Append-Only File)", definition: "Write-ahead log that records every write command. Replayed on restart to reconstruct the dataset." },
    { term: "BGSAVE", definition: "Background save command that forks a child process to write an RDB snapshot without blocking the server." },
    { term: "BGREWRITEAOF", definition: "Background AOF rewrite that creates a minimal AOF (or RDB preamble) from the current dataset." },
    { term: "fsync", definition: "System call that forces the OS to flush file buffers to disk, ensuring durability. Controlled by the appendfsync setting." },
    { term: "Copy-on-Write (COW)", definition: "OS mechanism where forked processes share memory pages until one writes, triggering a page copy. Enables point-in-time snapshots." },
    { term: "Transparent Huge Pages (THP)", definition: "Linux feature using 2 MB pages instead of 4 KB. Harmful for Redis due to increased COW granularity during fork." },
    { term: "Multi-part AOF", definition: "Redis 7.0 feature splitting the AOF into a manifest, base file, and incremental files for safer rewrites and incremental backups." },
    { term: "aof-use-rdb-preamble", definition: "Config option (default yes) that writes the AOF base in compact RDB format for faster loading." },
  ],
  exercises: [
    "Configure Redis with **RDB-only persistence** (`save 60 1000`) and load 50,000 keys. Trigger `BGSAVE`, then immediately kill the Redis process with `kill -9` *before* the next save. Restart and count how many keys survived. Repeat the experiment with **AOF (`appendfsync everysec`)** and compare the data loss.",
    "Set up Redis with **hybrid AOF persistence** (`aof-use-rdb-preamble yes`). Load 1 million keys, trigger `BGREWRITEAOF`, and inspect the resulting files in the `appendonlydir/` directory. Identify the *RDB base file* and the *incremental AOF file*. How large is each? Time the restart and compare it to restarting with a pure AOF file.",
    "Write a **monitoring script** that polls `INFO persistence` every 5 seconds and alerts when: (a) `rdb_last_bgsave_status` is not `ok`, (b) time since `rdb_last_save_time` exceeds 10 minutes, or (c) AOF current size is more than **3x the base size** (indicating a rewrite is overdue). Test each alert condition by simulating failures.",
    "Measure the **fork latency** and **copy-on-write memory overhead** of `BGSAVE` on datasets of 1 GB, 5 GB, and 10 GB. While the child is writing, run a write-heavy workload and monitor `rdb_last_cow_size` from `INFO persistence`. Then enable Transparent Huge Pages, repeat the test, and document the difference in COW memory. *Disable THP afterward.*",
    "Compare the three `appendfsync` policies (*always*, *everysec*, *no*) by benchmarking `redis-benchmark -t set -n 100000` with each setting. Record throughput (ops/sec) and average latency. Then crash Redis during the benchmark for each policy and measure actual data loss. Present a table summarizing the **throughput vs. durability** trade-off.",
  ],
};
