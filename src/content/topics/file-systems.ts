import type { TopicContent } from "../types";

export const fileSystems: TopicContent = {
  quickSummary: [
    "A file system is a method and data structure the operating system uses to organize, store, retrieve, and manage data on persistent storage devices, mapping human-readable names to raw blocks on disk.",
    "Core abstractions include inodes (metadata containers), directory entries (name-to-inode mappings), superblocks (file system-wide metadata), and data blocks -- together they form a layered addressing scheme from filenames to physical sectors.",
    "Modern file systems employ journaling (ext4, NTFS), copy-on-write (ZFS, Btrfs), or log-structured designs to ensure crash consistency, trading write amplification for recoverability.",
    "The Virtual File System (VFS) layer in Unix-like kernels provides a uniform interface so user-space code interacts with files identically regardless of the underlying file system implementation.",
  ],
  detailed: [
    "A file system bridges the gap between the logical view of data (named files organized in directories) and the physical reality of a storage device (a flat array of fixed-size blocks, typically 512 bytes or 4 KiB sectors). The file system allocates blocks to files, tracks which blocks are free, and stores metadata such as ownership, permissions, timestamps, and size. Without a file system, an application would need to manage raw disk offsets directly, making data sharing, protection, and organization nearly impossible.",
    "The inode is the fundamental metadata structure in Unix file systems. Each inode stores the file's type (regular, directory, symlink, device, socket, pipe), permissions, owner/group IDs, size, link count, timestamps (atime, mtime, ctime), and pointers to data blocks. Importantly, the inode does NOT store the filename -- names are stored in directory entries that map a string to an inode number. This separation enables hard links: multiple directory entries can point to the same inode, sharing the underlying data. The inode number uniquely identifies a file within a file system, and the stat() system call retrieves inode metadata.",
    "Directory structure in Unix is itself implemented as a special file whose data blocks contain a list of (name, inode number) pairs. The root directory has a well-known inode number (typically 2 in ext4). Path resolution works by starting at the root inode, reading its directory data to find the next component's inode number, loading that inode, and repeating until the final component is reached. Each lookup requires reading the directory's data blocks and searching for the name, which is why deeply nested paths with large directories can be slower to resolve.",
    "Disk layout varies by file system but typically includes: a boot block (sector 0, reserved for the bootloader), a superblock (containing file system metadata like block size, total blocks, free block count, inode count, and magic number), block group descriptors, block and inode bitmaps for allocation tracking, an inode table, and data blocks. ext4 organizes the disk into block groups (typically 128 MiB each with default 4 KiB blocks), where each group contains its own copy of the superblock (or a sparse backup), bitmaps, inode table segment, and data blocks. This locality grouping reduces seek times on rotational disks by placing a file's inode near its data blocks.",
    "File system operations are implemented through system calls: open() looks up the path and creates a file descriptor, read()/write() transfer data between user-space buffers and the page cache (which acts as a transparent caching layer backed by the file system), lseek() repositions the file offset, fsync() flushes dirty pages and metadata to durable storage, and unlink() removes a directory entry and decrements the inode link count (freeing the inode and data blocks only when the link count reaches zero and no process holds the file open).",
  ],
  deepDive: [
    "ext4 (Fourth Extended File System) is the workhorse of Linux, evolving from ext2/ext3 with backward compatibility. Key innovations include extents (replacing the indirect block mapping with a compact descriptor of contiguous block ranges, stored as a 4-level tree in the inode), delayed allocation (deferring block allocation until writeback to reduce fragmentation and enable better contiguous allocation), and a journal (by default operating in 'ordered' mode where data is written to disk before the metadata journal entry is committed, ensuring data consistency without full data journaling overhead). ext4 supports file systems up to 1 EiB and files up to 16 TiB with 4 KiB blocks. Its journaling uses JBD2 (Journaling Block Device 2), which writes metadata changes to a circular log before applying them in-place, enabling crash recovery by replaying committed transactions.",
    "NTFS (New Technology File System) is the primary file system for Windows. Its design centers on the Master File Table (MFT), a relational-database-like structure where every object on the volume (files, directories, metadata) is an MFT record. Each record is typically 1 KiB and contains a set of attribute streams -- $STANDARD_INFORMATION (timestamps, permissions), $FILE_NAME, $DATA (the file content, which can be resident in the MFT record for very small files), and $INDEX_ROOT/$INDEX_ALLOCATION (B+ tree indexes for directories). NTFS supports features like Alternate Data Streams (multiple $DATA attributes per file), transparent compression, Encrypting File System (EFS), volume shadow copies, and transactional NTFS (TxF, now deprecated). Its journal ($LogFile) is a write-ahead log recording all metadata operations for crash recovery.",
    "ZFS (Zettabyte File System) takes a radically different approach using copy-on-write (COW) semantics for all operations. Data is never overwritten in place -- modified blocks are written to new locations, and then the parent pointers (up to the root of the Merkle tree, called the uberblock) are atomically updated. This guarantees crash consistency without a separate journal. ZFS integrates volume management with the file system: storage pools (zpools) are composed of virtual devices (vdevs, which can be mirrors or RAIDZ groups), and file systems, snapshots, and clones are created within the pool. ZFS also provides end-to-end data integrity via per-block checksums (stored in parent blocks, not alongside the data), transparent compression (LZ4, ZSTD), deduplication, native encryption, and instant snapshots (which are essentially free due to COW -- a snapshot is just a pointer to the root of the tree at a point in time).",
    "Btrfs (B-tree File System) brings many ZFS-like capabilities to Linux using B-tree variants as its primary on-disk data structure. Everything in Btrfs -- file data extents, metadata, directory entries, free space tracking -- is stored in B-trees (specifically, copy-on-write B-trees). Btrfs supports subvolumes (independent file system trees that share the same storage pool), snapshots (COW clones of subvolumes), built-in RAID (0, 1, 10, 5, 6 -- though RAID 5/6 had stability issues historically), online resizing, transparent compression (zlib, LZO, ZSTD), checksumming of data and metadata (CRC32C by default, with SHA-256 and BLAKE2b options), send/receive for incremental backup, and quota groups for space accounting across snapshots.",
    "The Virtual File System (VFS) layer in Linux provides a common abstraction so that system calls like open(), read(), write(), and stat() work uniformly across ext4, XFS, Btrfs, NFS, procfs, tmpfs, FUSE, and hundreds of other file system implementations. VFS defines four core object types: superblock (represents a mounted file system), inode (represents a file or directory), dentry (directory entry cache for fast path lookup), and file (represents an open file associated with a process). Each file system implements operations through function pointer tables (super_operations, inode_operations, file_operations, address_space_operations). The dentry cache (dcache) is one of the most performance-critical caches in the kernel, caching path-to-inode lookups to avoid repeated directory traversals. When a path like /home/user/file.txt is resolved, the VFS walks the dcache and only falls through to the actual file system's lookup function on a cache miss.",
  ],
  code: [
    {
      language: "c",
      caption: "Simplified ext2/ext4 on-disk inode structure",
      source: `/* Simplified ext2 inode structure (from linux/ext2_fs.h) */
struct ext2_inode {
    __le16 i_mode;        /* File type and permissions */
    __le16 i_uid;         /* Owner UID (low 16 bits) */
    __le32 i_size;        /* File size in bytes (low 32 bits) */
    __le32 i_atime;       /* Last access time */
    __le32 i_ctime;       /* Inode change time */
    __le32 i_mtime;       /* Last modification time */
    __le32 i_dtime;       /* Deletion time */
    __le16 i_gid;         /* Group ID (low 16 bits) */
    __le16 i_links_count; /* Hard link count */
    __le32 i_blocks;      /* Blocks allocated (in 512-byte units) */
    __le32 i_flags;       /* File flags (immutable, append, etc.) */
    __le32 i_osd1;        /* OS-dependent value 1 */

    /*
     * Block pointers: the classic indirect block scheme.
     * i_block[0..11]  = direct block pointers (point to data blocks)
     * i_block[12]     = single indirect (points to a block of pointers)
     * i_block[13]     = double indirect (pointer -> pointers -> data)
     * i_block[14]     = triple indirect
     *
     * With 4 KiB blocks and 4-byte pointers:
     *   direct:  12 * 4 KiB = 48 KiB
     *   single:  1024 * 4 KiB = 4 MiB
     *   double:  1024^2 * 4 KiB = 4 GiB
     *   triple:  1024^3 * 4 KiB = 4 TiB
     *
     * ext4 replaces this with extent trees for better performance.
     */
    __le32 i_block[15];

    __le32 i_generation;  /* File version (for NFS) */
    __le32 i_file_acl;    /* Block number of extended attributes */
    __le32 i_size_high;   /* File size (high 32 bits) -- ext4 */
};

/* ext4 extent: describes a contiguous range of blocks */
struct ext4_extent {
    __le32 ee_block;      /* First logical block this extent covers */
    __le16 ee_len;        /* Number of blocks covered */
    __le16 ee_start_hi;   /* Physical block number (high 16 bits) */
    __le32 ee_start_lo;   /* Physical block number (low 32 bits) */
};`,
    },
    {
      language: "c",
      caption: "Basic file system operations using POSIX system calls",
      source: `#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <dirent.h>
#include <string.h>
#include <errno.h>

/* Demonstrate core file system operations */

/* 1. Create a file, write, read back */
void file_io_demo(void) {
    int fd = open("demo.txt", O_CREAT | O_RDWR | O_TRUNC, 0644);
    if (fd < 0) { perror("open"); return; }

    const char *data = "Hello, file system!";
    ssize_t written = write(fd, data, strlen(data));
    /* written bytes buffered in page cache, NOT yet on disk */

    fsync(fd);  /* Force flush to durable storage */

    /* Read back from beginning */
    lseek(fd, 0, SEEK_SET);
    char buf[64];
    ssize_t n = read(fd, buf, sizeof(buf) - 1);
    buf[n] = '\\0';
    printf("Read: %s\\n", buf);

    close(fd);
}

/* 2. Inspect inode metadata via stat() */
void stat_demo(const char *path) {
    struct stat st;
    if (stat(path, &st) < 0) { perror("stat"); return; }

    printf("Inode:      %lu\\n", (unsigned long)st.st_ino);
    printf("Size:       %lld bytes\\n", (long long)st.st_size);
    printf("Blocks:     %lld (512-byte units)\\n", (long long)st.st_blocks);
    printf("Hard links: %lu\\n", (unsigned long)st.st_nlink);
    printf("Type:       %s\\n",
           S_ISREG(st.st_mode)  ? "regular file" :
           S_ISDIR(st.st_mode)  ? "directory"    :
           S_ISLNK(st.st_mode)  ? "symlink"      : "other");
}

/* 3. Directory traversal */
void list_directory(const char *path) {
    DIR *dir = opendir(path);
    if (!dir) { perror("opendir"); return; }

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        /* d_type: DT_REG, DT_DIR, DT_LNK, etc. */
        printf("  inode=%lu  type=%d  name=%s\\n",
               (unsigned long)entry->d_ino,
               entry->d_type,
               entry->d_name);
    }
    closedir(dir);
}`,
    },
    {
      language: "cpp",
      caption: "Parsing the ext4 superblock from a raw disk image",
      source: `#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <iostream>

// ext4 superblock key fields (little-endian on disk)
#pragma pack(push, 1)
struct Ext4Superblock {
    uint32_t s_inodes_count;
    uint32_t s_blocks_count_lo;
    uint32_t s_r_blocks_count_lo;   // Reserved blocks
    uint32_t s_free_blocks_lo;
    uint32_t s_free_inodes_count;
    uint32_t s_first_data_block;    // 0 for 4K blocks, 1 for 1K
    uint32_t s_log_block_size;      // block_size = 1024 << this
    uint32_t s_log_cluster_size;
    uint32_t s_blocks_per_group;
    uint32_t s_clusters_per_group;
    uint32_t s_inodes_per_group;
    uint32_t s_mtime;               // Last mount time
    uint32_t s_wtime;               // Last write time
    uint16_t s_mnt_count;
    uint16_t s_max_mnt_count;
    uint16_t s_magic;               // Must be 0xEF53
    // ... remaining fields omitted for brevity
};
#pragma pack(pop)

void parse_ext4_superblock(const char* device_path) {
    std::ifstream file(device_path, std::ios::binary);
    if (!file) {
        std::cerr << "Error: cannot open " << device_path << "\\n";
        return;
    }

    // Superblock starts at byte offset 1024
    file.seekg(1024);
    Ext4Superblock sb{};
    file.read(reinterpret_cast<char*>(&sb), sizeof(sb));
    if (!file) {
        std::cerr << "Error: could not read superblock\\n";
        return;
    }

    uint64_t block_size = 1024ULL << sb.s_log_block_size;
    uint64_t total_size = static_cast<uint64_t>(sb.s_blocks_count_lo) * block_size;
    double size_gib = static_cast<double>(total_size) / (1024.0 * 1024.0 * 1024.0);

    std::printf("Magic:          0x%04X (%s)\\n",
                sb.s_magic, sb.s_magic == 0xEF53 ? "valid" : "INVALID");
    std::printf("Block size:     %llu bytes\\n", (unsigned long long)block_size);
    std::printf("Total blocks:   %u\\n", sb.s_blocks_count_lo);
    std::printf("Free blocks:    %u\\n", sb.s_free_blocks_lo);
    std::printf("Total inodes:   %u\\n", sb.s_inodes_count);
    std::printf("Free inodes:    %u\\n", sb.s_free_inodes_count);
    std::printf("Blocks/group:   %u\\n", sb.s_blocks_per_group);
    std::printf("Inodes/group:   %u\\n", sb.s_inodes_per_group);
    std::printf("Volume size:    %.2f GiB\\n", size_gib);
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " /dev/sdX1\\n";
        return 1;
    }
    parse_ext4_superblock(argv[1]);
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "ext4 Disk Layout and Block Group Structure",
      kind: "architecture",
      caption: "On-disk layout of ext4: boot block, superblock, block group descriptors, and repeating block groups with bitmaps, inode tables, and data blocks.",
      mermaid: `graph LR
    BOOT["Boot Block"]
    SB["Superblock\nFS metadata"]
    BGD["Block Group\nDescriptors"]
    BOOT --> SB --> BGD
    BGD --> BG0["Block Group 0\nBlock Bitmap\nInode Bitmap\nInode Table\nData Blocks"]
    BGD --> BG1["Block Group 1\nBlock Bitmap\nInode Bitmap\nInode Table\nData Blocks"]
    BGD --> BGN["Block Group N\n..."]`,
    },
    {
      title: "Inode-Based Path Resolution",
      kind: "flow",
      caption: "How the VFS resolves /home/user/file.txt by traversing directory inodes from the root.",
      mermaid: `flowchart TD
    START["Open /home/user/file.txt"] --> RC{Dentry cache hit?}
    RC -->|Yes| FAST["Use cached inode"]
    RC -->|No| ROOT["Load root inode 2"]
    ROOT --> D1["Read root dir blocks\nFind home entry -> inode X"]
    D1 --> D2["Load inode X\nRead home dir blocks\nFind user entry -> inode Y"]
    D2 --> D3["Load inode Y\nRead user dir blocks\nFind file.txt -> inode Z"]
    D3 --> FILE["Load inode Z\nOpen file descriptor"]
    FAST --> FILE`,
    },
    {
      title: "Journaling Write Sequence",
      kind: "sequence",
      caption: "Steps of a journaled write in ext4 ordered mode: data first, then metadata via journal, then checkpoint.",
      mermaid: `sequenceDiagram
    participant App
    participant VFS
    participant Journal
    participant Disk

    App->>VFS: write() syscall
    VFS->>Disk: Write data blocks to final location
    Disk-->>VFS: Data written
    VFS->>Journal: Write journal descriptor block
    VFS->>Journal: Write metadata blocks
    VFS->>Journal: Write commit block
    Journal-->>VFS: Transaction committed
    VFS->>Disk: Checkpoint - write metadata to final location
    Disk-->>VFS: Checkpoint complete
    VFS-->>App: write() returns`,
    },
    {
      title: "VFS Abstraction Layer",
      kind: "architecture",
      caption: "Linux VFS sits between syscalls and concrete file system implementations with four core objects.",
      mermaid: `graph TD
    SYSCALL["User Space Syscalls\nopen read write stat"]
    VFS["VFS Layer\nSuperblock / Inode / Dentry / File"]
    SYSCALL --> VFS
    VFS --> EXT4["ext4"]
    VFS --> XFS["XFS"]
    VFS --> BTRFS["Btrfs"]
    VFS --> NFS["NFS"]
    VFS --> FUSE["FUSE"]`,
    },
  ],
  animations: [
    {
      title: "File Creation and Inode Allocation",
      steps: [
        {
          label: "Application calls open() with O_CREAT",
          detail:
            "The process issues open(\"/data/report.txt\", O_CREAT | O_WRONLY, 0644). The VFS layer begins path resolution from the root dentry.",
        },
        {
          label: "Path resolution traverses the dentry cache",
          detail:
            "VFS looks up 'data' in the root directory's dentry cache. On a hit, it retrieves the cached inode. On a miss, it calls the file system's lookup() operation to read the directory from disk.",
        },
        {
          label: "File system allocates a new inode",
          detail:
            "Since report.txt does not exist, the file system scans the inode bitmap for the target block group to find a free inode. The bit is set, the free inode count in the group descriptor and superblock is decremented, and the inode is initialized with the given mode, owner, and current timestamps.",
        },
        {
          label: "Directory entry is added",
          detail:
            "A new directory entry (name='report.txt', inode=allocated_inode_number) is appended to the 'data' directory's data blocks. If the directory needs more space, a new block is allocated. The directory's mtime and ctime are updated.",
        },
        {
          label: "Journal records the transaction",
          detail:
            "In ext4 ordered mode, the metadata changes (inode bitmap, group descriptor, new inode, parent directory blocks) are written to the journal as a single atomic transaction. The journal commit block is written last, making the entire operation recoverable.",
        },
        {
          label: "File descriptor returned to user space",
          detail:
            "The kernel creates a struct file, associates it with the new inode, adds it to the process's file descriptor table, and returns the integer fd to the application. The file is now ready for write() calls.",
        },
      ],
    },
    {
      title: "Journaled Write and Crash Recovery",
      steps: [
        {
          label: "Write request arrives",
          detail:
            "The application calls write(fd, buf, 4096) to write one block of data. The data is copied into the page cache and the page is marked dirty. No disk I/O happens yet.",
        },
        {
          label: "Writeback triggers journal transaction",
          detail:
            "When the kernel writeback thread runs (or fsync is called), it begins a JBD2 transaction. In ordered mode, data blocks are written to their final on-disk locations first.",
        },
        {
          label: "Metadata written to journal",
          detail:
            "After data blocks are on disk, the journal transaction records the metadata changes: updated inode (new size, block pointers, mtime), possibly updated block bitmap, and group descriptor. A descriptor block and the metadata blocks are written to the circular journal area.",
        },
        {
          label: "Commit block written",
          detail:
            "A commit block with a checksum is written to the journal. Once this block is on disk, the transaction is considered committed and is guaranteed to be recoverable.",
        },
        {
          label: "Checkpoint: metadata written in-place",
          detail:
            "The file system eventually writes the journaled metadata to its final on-disk locations (the actual inode table, block bitmaps, etc.). Once checkpointed, the journal space can be reclaimed.",
        },
        {
          label: "Crash recovery scenario",
          detail:
            "If a crash occurs before the commit block is written, the incomplete transaction is discarded -- the file system remains in its previous consistent state. If the crash occurs after the commit block but before checkpointing, the journal is replayed on mount, reapplying the committed metadata changes.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "ext4",
      "NTFS",
      "ZFS",
      "Btrfs",
      "FAT32",
      "XFS",
    ],
    rows: [
      [
        "Max file size",
        "16 TiB",
        "16 EiB (theoretical)",
        "16 EiB",
        "16 EiB",
        "4 GiB",
        "8 EiB",
      ],
      [
        "Max volume size",
        "1 EiB",
        "256 TiB (practical)",
        "256 ZiB (theoretical)",
        "16 EiB",
        "2 TiB (without LBA)",
        "8 EiB",
      ],
      [
        "Journaling",
        "Yes (JBD2, metadata or full)",
        "Yes (write-ahead log)",
        "No (COW provides consistency)",
        "No (COW provides consistency)",
        "No",
        "Yes (metadata only)",
      ],
      [
        "Copy-on-Write",
        "No",
        "No",
        "Yes (all writes)",
        "Yes (all writes)",
        "No",
        "No (reflink COW for data)",
      ],
      [
        "Checksumming",
        "Metadata only (optional)",
        "No (relies on RAID/hardware)",
        "Yes (all data + metadata)",
        "Yes (data + metadata)",
        "No",
        "Metadata only",
      ],
      [
        "Snapshots",
        "No (LVM snapshots external)",
        "Volume Shadow Copy (external)",
        "Yes (native, instant)",
        "Yes (native, COW subvolumes)",
        "No",
        "No (LVM external)",
      ],
      [
        "Compression",
        "No",
        "Yes (per-file, LZNT1/LZX/XPRESS)",
        "Yes (LZ4, ZSTD, GZIP)",
        "Yes (ZLIB, LZO, ZSTD)",
        "No",
        "No",
      ],
      [
        "Deduplication",
        "No",
        "No (server editions only)",
        "Yes (inline or offline)",
        "Yes (offline via batch)",
        "No",
        "No",
      ],
      [
        "Allocation strategy",
        "Extents, delayed alloc",
        "B+ tree, MFT runs",
        "Dynamic block sizing, slab",
        "B-tree extents, delayed alloc",
        "Linked cluster chains (FAT)",
        "B+ tree extents, delayed alloc",
      ],
      [
        "Integrated RAID",
        "No",
        "No",
        "Yes (RAIDZ1/2/3, mirror)",
        "Yes (RAID 0/1/10/5/6)",
        "No",
        "No",
      ],
      [
        "Encryption",
        "fscrypt (per-file/directory)",
        "EFS + BitLocker (volume)",
        "Native dataset encryption",
        "fscrypt (per-file/directory)",
        "No",
        "fscrypt (per-file/directory)",
      ],
      [
        "Primary OS",
        "Linux",
        "Windows",
        "Solaris, FreeBSD, Linux",
        "Linux",
        "Cross-platform (legacy)",
        "Linux (IRIX historically)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is an inode and what information does it store? Why doesn't it contain the filename?",
      a: "An inode is a data structure on disk that stores all metadata about a file except its name: file type, permissions, owner/group, size, timestamps (atime/mtime/ctime), link count, and pointers to data blocks. The filename is stored in the parent directory's data blocks as a directory entry mapping name to inode number. This separation allows hard links -- multiple directory entries in different directories can reference the same inode, sharing the same file data. The link count tracks how many directory entries point to the inode; the inode and its data blocks are freed only when the link count drops to zero and no process has the file open.",
      followUps: [
        "What happens to an open file descriptor when unlink() is called on the file?",
        "How do symbolic links differ from hard links at the inode level?",
        "Why can't you create hard links across file system boundaries?",
      ],
    },
    {
      q: "Explain how journaling ensures crash consistency in ext4. What are the different journaling modes?",
      a: "Journaling ensures that the file system remains consistent after a crash by recording pending metadata (and optionally data) changes in a write-ahead log (the journal) before applying them in-place. If a crash occurs, the file system replays committed journal transactions on the next mount. ext4 supports three journaling modes: (1) 'journal' mode writes both data and metadata to the journal first -- safest but slowest due to double-writing all data; (2) 'ordered' mode (the default) writes data blocks to their final locations first, then journals only the metadata -- ensures data pointed to by metadata is always valid; (3) 'writeback' mode journals only metadata with no ordering guarantee for data writes -- fastest but may expose stale data in newly allocated blocks after a crash.",
      followUps: [
        "What is the performance cost of full data journaling vs ordered mode?",
        "How does the journal checkpoint process work?",
        "What is the difference between write-ahead logging and copy-on-write for crash consistency?",
      ],
    },
    {
      q: "How does copy-on-write (COW) work in ZFS and how does it enable snapshots?",
      a: "In ZFS, data is never overwritten in place. When a block is modified, the new version is written to a free location on disk, and all parent pointers up the block tree are also updated (each via COW) until the root pointer (uberblock) is atomically updated. This creates a self-consistent tree at every point in time. Snapshots exploit this: taking a snapshot simply records the current root pointer and prevents the referenced blocks from being freed. Since unmodified blocks are shared between the live file system and the snapshot (only diverging blocks consume extra space), snapshots are instant and space-efficient. Rolling back to a snapshot means switching the active root pointer. Clones extend this by creating a writable snapshot that starts as a zero-cost copy and only allocates new blocks for modified data.",
      followUps: [
        "What is the write amplification problem with COW file systems?",
        "How does ZFS handle metadata integrity with its Merkle-tree checksumming?",
        "What is the ZFS intent log (ZIL) and why is it needed if COW already provides consistency?",
      ],
    },
    {
      q: "What is the VFS layer in Linux and why is it important?",
      a: "The Virtual File System (VFS) is an abstraction layer in the Linux kernel that provides a uniform API for file operations regardless of the underlying file system. It defines four core objects: the superblock (represents a mounted file system instance), inode (represents a file), dentry (cached directory entry for path resolution), and file (represents an open file for a process). Each concrete file system (ext4, XFS, NFS, procfs, etc.) registers a set of function pointers (operation tables) that implement VFS operations for that file system's on-disk format. When user space calls read(), the VFS dispatches to the appropriate file system's read implementation. The dentry cache (dcache) is a critical performance optimization, caching recent path-to-inode lookups to avoid repeated disk reads for directory traversal. VFS enables transparent file system stacking, union mounts, and the ability to expose non-disk data (procfs, sysfs) through the familiar file API.",
      followUps: [
        "How does the dentry cache handle negative entries (lookups for non-existent files)?",
        "How does FUSE interact with VFS?",
        "What role does the page cache play in VFS read/write operations?",
      ],
    },
    {
      q: "Compare extent-based allocation (ext4, XFS) with the FAT linked-list approach. Why are extents superior for large files?",
      a: "In FAT, each cluster allocated to a file has an entry in the File Allocation Table pointing to the next cluster, forming a linked list. To read the Nth block of a file, you must traverse the chain from the beginning -- O(N) lookup time. Fragmented files have clusters scattered across the disk, causing excessive seeking. In contrast, extent-based file systems store a compact descriptor (start block, length) for each contiguous run of blocks. A single extent can describe gigabytes of contiguous data in just 12 bytes. Reading any offset in the file requires a binary search through the extent tree -- O(log N). Large sequential files often need only 1-3 extents, making metadata overhead negligible. ext4's extent tree is a B-tree rooted in the inode, supporting up to 4 levels for highly fragmented files while keeping the common case (a few extents) entirely within the inode itself.",
      followUps: [
        "How does delayed allocation in ext4 help produce larger extents?",
        "What is the fallocate() system call and how does it interact with extents?",
        "How does XFS handle extent allocation differently from ext4?",
      ],
    },
    {
      q: "What happens at the file system level when you delete a file in Linux?",
      a: "When you call unlink() on a file, the kernel removes the directory entry (the name-to-inode mapping) from the parent directory and decrements the inode's hard link count. If the link count reaches zero AND no process currently holds the file open, the inode is marked as free in the inode bitmap, the data blocks are released by clearing the corresponding bits in the block bitmap, and the free block/inode counters are updated. If the link count reaches zero but the file is still open by a process, the inode and data blocks remain allocated until the last file descriptor is closed -- this is why you can delete a file that a process is actively reading without causing an error. The directory entry removal is journaled as a metadata operation. The actual data blocks are NOT zeroed or overwritten -- they simply become available for reuse, which is why deleted files can sometimes be recovered with forensic tools.",
      followUps: [
        "What is the difference between unlink() and remove()?",
        "How does the 'open file' check work across processes?",
        "Why does deleting a large file not immediately free disk space if a process holds it open?",
      ],
    },
  ],
  followUps: [
    "How do log-structured file systems (like F2FS) differ from traditional journaling file systems, and why are they suited for flash storage?",
    "What are the trade-offs of inline data storage in inodes versus separate data blocks?",
    "How does the Linux page cache interact with file system reads and writes, and what is the difference between buffered and direct I/O?",
    "What is FUSE (Filesystem in Userspace) and what are its performance implications compared to kernel-space file systems?",
    "How do network file systems (NFS, CIFS/SMB) handle consistency and caching across multiple clients?",
    "What is file system fragmentation, how does it affect performance on HDDs vs SSDs, and how do different file systems mitigate it?",
  ],
  mcqs: [
    {
      q: "In a Unix file system, what uniquely identifies a file within a partition?",
      options: [
        "The filename",
        "The inode number",
        "The file descriptor",
        "The directory entry pointer",
      ],
      answerIndex: 1,
      explanation:
        "The inode number is unique within a file system and is the canonical identifier for a file. Filenames are just directory entries that map to inode numbers (multiple names can map to the same inode via hard links). File descriptors are process-local handles to open files, not persistent identifiers.",
    },
    {
      q: "Which ext4 journaling mode provides the best balance of performance and data safety by default?",
      options: [
        "writeback mode",
        "journal mode (full data journaling)",
        "ordered mode",
        "none (journaling disabled)",
      ],
      answerIndex: 2,
      explanation:
        "Ordered mode is ext4's default. It writes data blocks to their final locations before journaling the metadata, ensuring that metadata always points to valid data without the performance cost of double-writing all data through the journal. Writeback is faster but risks exposing stale data after a crash.",
    },
    {
      q: "What is the primary advantage of copy-on-write (COW) semantics in file systems like ZFS and Btrfs?",
      options: [
        "Faster sequential read performance",
        "Reduced storage capacity requirements",
        "Atomic updates and crash consistency without a journal",
        "Elimination of the need for block allocation bitmaps",
      ],
      answerIndex: 2,
      explanation:
        "COW ensures crash consistency by never overwriting existing data in place. A write allocates new blocks, and the tree root pointer is updated atomically. At any point, the on-disk state is consistent -- either the old tree or the new tree is referenced. This eliminates the need for a separate journal to recover from crashes.",
    },
    {
      q: "In the ext2/ext4 inode structure, why can a file with 4 KiB block size and traditional indirect block pointers reach a maximum of approximately 4 TiB?",
      options: [
        "The inode stores a 32-bit file size field",
        "The triple indirect block can address 1024^3 blocks of 4 KiB each",
        "The extent tree has a maximum depth of 4",
        "The block group descriptor limits files to 4 TiB",
      ],
      answerIndex: 1,
      explanation:
        "With 4 KiB blocks and 4-byte block pointers, each indirect block holds 1024 pointers. The triple indirect block gives 1024 * 1024 * 1024 = ~1 billion block pointers, each pointing to a 4 KiB block, yielding ~4 TiB. Adding direct and single/double indirect blocks gives slightly more, but the triple indirect dominates.",
    },
    {
      q: "What is the role of the superblock in a Unix file system?",
      options: [
        "It stores the filenames of all files in the root directory",
        "It contains file-system-wide metadata like block size, total block count, free counts, and magic number",
        "It holds the page cache configuration for the file system",
        "It stores the journal transactions for crash recovery",
      ],
      answerIndex: 1,
      explanation:
        "The superblock is the master metadata record for a file system. It stores the file system's identity (magic number), geometry (block size, blocks per group), capacity (total and free inode/block counts), and state information. Corruption of the superblock can render the file system unmountable, which is why ext4 stores backup copies in multiple block groups.",
    },
    {
      q: "Which VFS object is primarily responsible for caching path-to-inode lookups in the Linux kernel?",
      options: [
        "The superblock cache",
        "The inode cache",
        "The dentry cache (dcache)",
        "The buffer cache",
      ],
      answerIndex: 2,
      explanation:
        "The dentry cache (dcache) stores recent directory entry lookups, mapping path components to inodes. This avoids repeated traversal of directory data blocks on disk. The dcache also stores negative entries (lookups that resulted in ENOENT) to avoid repeated failed lookups.",
    },
    {
      q: "Why does FAT32 have a maximum file size of 4 GiB?",
      options: [
        "The FAT table can only hold 4 billion cluster entries",
        "The directory entry stores the file size in a 32-bit unsigned integer field",
        "The cluster size is limited to 4 KiB",
        "The partition table limits FAT32 to 4 GiB partitions",
      ],
      answerIndex: 1,
      explanation:
        "FAT32 directory entries use a 32-bit unsigned integer for the file size field, giving a maximum representable size of 2^32 - 1 = 4,294,967,295 bytes (just under 4 GiB). The FAT table itself could address a much larger file, but the size field is the limiting factor.",
    },
  ],
  exercises: [
    "Implement a simple in-memory file system that supports create, read, write, delete, mkdir, and ls operations using an inode table and directory entry structures in C or Python.",
    "Write a program that uses the stat() system call to recursively walk a directory tree, collecting and reporting: total files, total directories, total size, average file size, and the distribution of hard link counts.",
    "Create a tool that reads the ext4 superblock from a raw disk image (or loopback device) and displays key parameters: block size, total/free inodes, total/free blocks, blocks per group, and file system UUID.",
    "Design and implement a simple write-ahead journal for a key-value store on disk. Demonstrate crash recovery by simulating a crash mid-transaction and replaying the journal on restart.",
    "Write a FUSE file system (using libfuse or fusepy) that presents a read-only view of a ZIP archive as a mounted directory, translating file system operations into ZIP archive lookups.",
    "Benchmark the performance difference between buffered writes (using the page cache), O_DIRECT writes, and writes followed by fsync() on your system. Measure throughput and latency for sequential and random write patterns.",
  ],
  flashcards: [
    {
      front: "What is an inode?",
      back: "An on-disk data structure that stores all metadata about a file (type, permissions, owner, size, timestamps, data block pointers) except the filename. Each file has exactly one inode, identified by a unique inode number within its file system.",
    },
    {
      front: "What is the difference between a hard link and a symbolic link?",
      back: "A hard link is an additional directory entry pointing to the same inode (same file, shared data, link count incremented). A symbolic link is a separate file (its own inode) whose data content is the path string of the target. Hard links cannot cross file system boundaries; symlinks can. Deleting the target breaks a symlink but does not affect hard links.",
    },
    {
      front: "What are the four core VFS objects in Linux?",
      back: "Superblock (mounted file system instance), inode (file metadata and operations), dentry (cached directory entry for path lookup), and file (an open file associated with a process, holding the current offset and access mode).",
    },
    {
      front: "What is copy-on-write (COW) in file systems?",
      back: "A technique where modified data is written to a new location on disk rather than overwriting the original blocks. Parent pointers are updated (also via COW) up to the root, which is atomically swapped. Guarantees crash consistency without journaling and enables instant, space-efficient snapshots.",
    },
    {
      front: "What does fsync() do?",
      back: "fsync(fd) forces all dirty pages (modified data) and metadata associated with the file descriptor to be written from the page cache to durable storage. It blocks until the device confirms the write is complete. Essential for applications requiring durability guarantees (databases, logs).",
    },
    {
      front: "What is an extent in ext4?",
      back: "An extent is a compact descriptor (start logical block, start physical block, length) representing a contiguous run of data blocks. It replaces ext2/ext3's indirect block scheme, dramatically reducing metadata overhead for large files. ext4 stores extents in a B-tree rooted in the inode.",
    },
    {
      front: "What is the purpose of the superblock?",
      back: "The superblock stores file-system-wide metadata: magic number (identifies the FS type), block size, total and free block/inode counts, blocks per group, UUID, mount state, and journal location. It is the first structure read when mounting a file system. Backup copies exist in certain block groups for recovery.",
    },
    {
      front: "What is journaling in file systems?",
      back: "A crash-consistency technique where metadata changes (and optionally data) are written to a sequential log (journal) before being applied to their final on-disk locations. If a crash occurs, the journal is replayed on mount to restore consistency. Used by ext3/ext4 (JBD2), NTFS ($LogFile), and XFS.",
    },
    {
      front: "What is delayed allocation in ext4?",
      back: "Delayed allocation defers the mapping of logical file blocks to physical disk blocks until writeback time (when dirty pages are flushed). This allows the allocator to see the full write pattern and allocate larger contiguous extents, reducing fragmentation and improving sequential performance.",
    },
    {
      front: "What is the dentry cache (dcache)?",
      back: "A kernel-memory cache of directory entries (name-to-inode mappings) used to speed up path resolution. Avoids reading directory data blocks from disk on repeated lookups. Also caches negative entries (names that do not exist) to short-circuit failed lookups.",
    },
  ],
  revisionNotes: [
    "A file system maps named files to blocks on a storage device, providing organization, metadata, access control, and crash consistency.",
    "The inode stores all file metadata except the name: type, permissions, owner, size, timestamps, link count, and block pointers. The filename lives in the parent directory.",
    "Hard links are multiple directory entries pointing to the same inode. Symlinks are separate files containing a target path string. Hard links cannot cross file system boundaries.",
    "ext4 disk layout: boot block, superblock, block group descriptors, then repeating block groups each containing bitmaps, inode table, and data blocks.",
    "ext4 uses extents (contiguous block ranges in a B-tree) instead of indirect blocks, delayed allocation for better contiguity, and JBD2 journaling for crash consistency.",
    "Journaling modes in ext4: 'journal' (data+metadata logged), 'ordered' (default; data written first, metadata logged), 'writeback' (only metadata logged, no data ordering).",
    "COW file systems (ZFS, Btrfs) never overwrite data in place. Modified blocks go to new locations; the root pointer is atomically updated. This provides crash consistency without a journal.",
    "ZFS integrates volume management, RAIDZ, per-block checksumming (Merkle tree), compression, deduplication, encryption, and instant COW snapshots in one unified system.",
    "Btrfs uses copy-on-write B-trees for all on-disk structures, supports subvolumes, snapshots, built-in RAID, checksumming, and transparent compression.",
    "The VFS layer provides a uniform file API across all file system types via four objects: superblock, inode, dentry, file -- each with pluggable operation tables.",
    "The dentry cache (dcache) and inode cache are critical for performance, avoiding disk reads for repeated path lookups.",
    "The page cache sits between VFS and disk, buffering reads and writes. fsync() flushes dirty pages to durable storage.",
    "FAT32 is limited to 4 GiB files (32-bit size field) and 2 TiB volumes. It uses a linked-list cluster chain with O(N) random access, making it unsuitable for large files.",
    "XFS excels at large files and parallel I/O, using B+ tree allocation, allocation groups for scalability, and delayed allocation. It journals metadata only.",
  ],
  cheatSheet: [
    "ls -li: list files with inode numbers",
    "stat <file>: display inode metadata (size, blocks, permissions, timestamps, link count)",
    "df -i: show inode usage per mounted file system",
    "du -sh <dir>: summarize disk usage of a directory",
    "ln <target> <linkname>: create a hard link",
    "ln -s <target> <linkname>: create a symbolic link",
    "mount -t ext4 /dev/sda1 /mnt: mount an ext4 file system",
    "umount /mnt: unmount a file system",
    "mkfs.ext4 /dev/sda1: create an ext4 file system",
    "tune2fs -l /dev/sda1: display ext4 superblock information",
    "debugfs /dev/sda1: interactive ext2/ext4 file system debugger",
    "dumpe2fs /dev/sda1: dump ext4 file system metadata (block groups, superblock)",
    "fsck.ext4 /dev/sda1: check and repair an ext4 file system (unmounted only)",
    "xfs_info /dev/sda1: display XFS file system parameters",
    "zpool status: show ZFS pool health and configuration",
    "zfs list: list ZFS datasets, snapshots, and their space usage",
    "zfs snapshot pool/dataset@snapname: create a ZFS snapshot",
    "btrfs subvolume snapshot /mnt/data /mnt/snap: create a Btrfs snapshot",
    "btrfs filesystem show: display Btrfs file system info",
    "lsblk -f: list block devices with file system type and UUID",
    "findmnt: display mounted file systems in a tree",
    "cat /proc/filesystems: list file system types supported by the kernel",
    "strace -e trace=file <cmd>: trace file-system-related system calls",
  ],
  resources: [
    {
      label: "Operating Systems: Three Easy Pieces (OSTEP) -- File Systems chapters",
      kind: "book",
      note: "Free online textbook with excellent coverage of file system implementation, crash consistency, journaling, and log-structured file systems.",
    },
    {
      label: "Linux Kernel Documentation: ext4",
      kind: "docs",
      note: "Official kernel documentation covering ext4 on-disk format, features, mount options, and implementation details.",
    },
    {
      label: "ZFS on Linux Documentation",
      kind: "docs",
      note: "Comprehensive guide to ZFS concepts (pools, vdevs, datasets), administration, and tuning on Linux.",
    },
    {
      label: "The Design and Implementation of the FreeBSD Operating System (McKusick et al.)",
      kind: "book",
      note: "In-depth coverage of UFS/FFS file system design, including cylinder groups, soft updates, and snapshots.",
    },
    {
      label: "A Study of Linux File System Evolution (Lu et al., FAST 2013)",
      kind: "paper",
      note: "Analyzes patches to ext3, ext4, XFS, Btrfs, and ReiserFS to understand common bug patterns and file system complexity.",
    },
    {
      label: "Btrfs Wiki",
      kind: "docs",
      note: "Community-maintained documentation for Btrfs features, administration, and known issues.",
    },
    {
      label: "Understanding the Linux Virtual File System (kernel.org)",
      kind: "docs",
      note: "Detailed explanation of VFS internals: superblock, inode, dentry, and file objects and their operation tables.",
    },
    {
      label: "File Systems Unfit as Distributed Storage Backends (Aghayev et al., OSDI 2019)",
      kind: "paper",
      note: "Examines how local file system overhead impacts distributed storage systems like Ceph, proposing BlueStore as an alternative.",
    },
  ],
  glossary: [
    {
      term: "Inode",
      definition:
        "A data structure on disk that stores metadata about a file (type, permissions, size, timestamps, block pointers) but not the filename. Identified by a unique number within a file system.",
    },
    {
      term: "Superblock",
      definition:
        "The master metadata block of a file system containing global information: block size, total/free counts, magic number, and pointers to key structures. Corruption can render the file system unmountable.",
    },
    {
      term: "Extent",
      definition:
        "A contiguous range of physical blocks described by a single descriptor (start block + length), used in ext4 and XFS to efficiently map large files with minimal metadata.",
    },
    {
      term: "Journaling",
      definition:
        "A crash-consistency technique that records metadata (and optionally data) changes in a write-ahead log before committing them in-place, enabling recovery by replaying the journal after a crash.",
    },
    {
      term: "Copy-on-Write (COW)",
      definition:
        "A strategy where modified data is written to new disk locations rather than overwriting existing blocks. Used by ZFS and Btrfs to provide atomic updates, crash consistency, and efficient snapshots.",
    },
    {
      term: "Dentry (Directory Entry)",
      definition:
        "A cached mapping from a filename to an inode number, maintained by the VFS dentry cache (dcache) to accelerate path resolution without reading directory data blocks from disk.",
    },
    {
      term: "VFS (Virtual File System)",
      definition:
        "A kernel abstraction layer providing a uniform file system interface so that user-space system calls work identically across all file system implementations (ext4, XFS, NFS, procfs, etc.).",
    },
    {
      term: "Block Group",
      definition:
        "A subdivision of an ext4 file system (typically 128 MiB) containing its own bitmap, inode table, and data blocks, designed to localize related data and reduce disk seek times.",
    },
    {
      term: "MFT (Master File Table)",
      definition:
        "The central metadata structure in NTFS, where every file and directory is represented as an MFT record containing typed attribute streams ($DATA, $FILE_NAME, $STANDARD_INFORMATION, etc.).",
    },
    {
      term: "Page Cache",
      definition:
        "A kernel-managed in-memory cache of file data blocks. Reads are served from the cache when possible; writes go to the cache first and are flushed to disk asynchronously or on fsync().",
    },
    {
      term: "Hard Link",
      definition:
        "A directory entry that maps a name to an existing inode. Multiple hard links to the same inode share the same data; the file is deleted only when the last hard link is removed and no process holds it open.",
    },
    {
      term: "Symbolic Link (Symlink)",
      definition:
        "A special file that contains a pathname string pointing to another file or directory. Unlike hard links, symlinks have their own inode, can cross file system boundaries, and can become dangling if the target is deleted.",
    },
    {
      term: "FUSE (Filesystem in Userspace)",
      definition:
        "A kernel module and user-space library that allows non-privileged users to implement file systems without modifying kernel code. VFS operations are forwarded to a user-space daemon via /dev/fuse.",
    },
  ],
};
