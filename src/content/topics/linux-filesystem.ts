import type { TopicContent } from "../types";

export const linuxFilesystem: TopicContent = {
  quickSummary: [
    "The Filesystem Hierarchy Standard (FHS) organizes Linux directories: /bin for essential binaries, /etc for configuration, /home for user data, /var for variable data, /tmp for temporary files, and /proc and /sys for virtual kernel interfaces.",
    "An inode stores file metadata (permissions, ownership, timestamps, data block pointers) but not the filename — directory entries map names to inode numbers, which is why hard links work.",
    "ext4 is the default Linux filesystem, supporting journaling for crash recovery, extents for efficient large-file storage, delayed allocation, and volumes up to 1 EiB with files up to 16 TiB.",
    "File permissions use a three-tier model (owner, group, others) with read (4), write (2), and execute (1) bits; chmod changes permissions and chown changes ownership.",
    "Hard links share the same inode (cannot cross filesystems, cannot link directories), while symbolic links are separate files containing a path to the target (can cross filesystems, can link directories, can dangle).",
  ],
  detailed: [
    "## Filesystem Hierarchy Standard (FHS)\n\nThe FHS defines a predictable directory layout:\n- **/** — root of the entire filesystem tree\n- **/bin, /sbin** — essential user and system binaries (often symlinked to /usr/bin on modern systems)\n- **/etc** — system-wide configuration files (text-based, human-editable)\n- **/home** — user home directories\n- **/var** — variable data: logs (/var/log), mail, spool, databases\n- **/tmp** — temporary files, cleared on reboot\n- **/usr** — secondary hierarchy for user programs, libraries, docs\n- **/proc** — virtual filesystem exposing kernel and process info as files\n- **/sys** — virtual filesystem exposing device and kernel subsystem info\n- **/dev** — device files (block and character devices)\n- **/mnt, /media** — mount points for temporary and removable media",
    "## Inodes and Directory Entries\n\nEvery file on a Linux filesystem is represented by an inode — a data structure containing the file's metadata: file type, permissions, owner UID/GID, size, timestamps (atime, mtime, ctime), link count, and pointers to the data blocks. The inode does NOT contain the filename. A directory is a special file that maps filenames to inode numbers. This separation means a single inode can have multiple names (hard links), and renaming a file is just changing the directory entry without touching the inode or data. The `ls -i` command shows inode numbers; `stat` shows full inode info.",
    "## ext4 Filesystem Internals\n\next4 (fourth extended filesystem) evolved from ext3 and is the default on most Linux distributions. Key features:\n- **Journaling** — writes metadata changes to a journal before committing them, enabling fast recovery after crashes without full fsck\n- **Extents** — replaces the traditional indirect block mapping with extent trees; an extent describes a contiguous run of blocks, reducing metadata overhead for large files\n- **Delayed allocation** — delays block allocation until data is flushed to disk, allowing the allocator to make better decisions about contiguous placement\n- **Online resize** — grow the filesystem while mounted\n- **Limits** — max volume 1 EiB, max file 16 TiB, max filename 255 bytes\n\nAlternatives: XFS (high-performance, default on RHEL), Btrfs (copy-on-write, snapshots), ZFS (pooled storage, checksums).",
    "## Permissions: rwx, chmod, chown\n\nEach file has three permission sets: user (owner), group, and others. Each set has read (r=4), write (w=2), and execute (x=1) bits. For directories, read means list contents, write means create/delete entries, execute means traverse (cd into).\n\n- `chmod 755 file` — owner rwx, group r-x, others r-x\n- `chmod u+x file` — add execute for owner\n- `chown user:group file` — change owner and group\n- `umask 022` — default permission mask (new files get 644, directories 755)\n\nSpecial bits:\n- **setuid (4000)** — process runs as file owner (e.g., /usr/bin/passwd)\n- **setgid (2000)** — process runs as file group; on directories, new files inherit the directory's group\n- **sticky bit (1000)** — on directories like /tmp, only file owner can delete their files",
    "## Mount, fstab, and Block Devices\n\nLinux presents all filesystems as a single unified tree rooted at /. The `mount` command attaches a filesystem on a block device to a directory (mount point): `mount /dev/sda1 /mnt`. `/etc/fstab` defines persistent mounts loaded at boot, specifying device, mount point, filesystem type, and options (e.g., `noatime`, `ro`). `findmnt` and `lsblk` show the current mount tree and block device layout. `df -h` shows disk usage per mount. Unmounting with `umount` detaches the filesystem; lazy unmount (`umount -l`) detaches immediately but cleans up when no longer in use.",
    "## Hard Links and Symbolic Links\n\nA **hard link** is an additional directory entry pointing to the same inode. Created with `ln target linkname`. Multiple hard links share the same data — the file is only deleted when the last link is removed (link count drops to 0). Hard links cannot cross filesystem boundaries (different inodes per filesystem) and cannot link to directories (to prevent cycles).\n\nA **symbolic link** (symlink) is a separate file whose content is the path to the target. Created with `ln -s target linkname`. Symlinks can cross filesystems, link to directories, and point to nonexistent targets (dangling links). They have their own inode and permissions (though the target's permissions govern access). `readlink -f` resolves a symlink chain to the final target.",
  ],
  interviewQA: [
    {
      q: "What is an inode and what information does it store?",
      a: "An inode is a filesystem data structure that stores all metadata about a file except its name: file type, permissions, owner/group IDs, file size, timestamps (access, modification, change), hard link count, and pointers to the data blocks on disk. Each inode has a unique number within its filesystem. Directory entries map filenames to inode numbers, which is why a file can have multiple names (hard links) pointing to the same inode.",
      followUps: [
        "What happens when a filesystem runs out of inodes?",
        "How does ls -i help in debugging?",
        "What is the difference between mtime, ctime, and atime?",
      ],
    },
    {
      q: "What is the difference between hard links and symbolic links?",
      a: "A hard link is another directory entry pointing to the same inode — it shares the same data and metadata, and the file persists until all hard links are removed. A symbolic link is a separate file (with its own inode) that contains the path to the target. Hard links cannot cross filesystem boundaries or link to directories; symlinks can do both but may dangle if the target is deleted. Hard links are indistinguishable from the original; symlinks are visibly different (ls -l shows ->).",
      followUps: [
        "Why can't hard links span filesystems?",
        "Can you hard link to a directory? Why is it dangerous?",
      ],
    },
    {
      q: "Explain the setuid bit and give an example of why it is both useful and dangerous.",
      a: "The setuid bit (chmod u+s or mode 4xxx) causes a program to execute with the permissions of the file owner rather than the invoking user. Example: /usr/bin/passwd is owned by root with setuid set, so regular users can change their own password by writing to /etc/shadow (which only root can write). The danger is that a vulnerability in a setuid-root program gives an attacker root access. Security practice: minimize setuid binaries, use capabilities instead (cap_net_bind_service, etc.), and audit with find / -perm -4000.",
    },
    {
      q: "What does journaling do in ext4 and why does it matter?",
      a: "Journaling writes pending metadata (and optionally data) changes to a dedicated journal area before applying them to the main filesystem. If the system crashes mid-write, the journal is replayed on the next mount to bring the filesystem to a consistent state — this avoids a full fsck scan which can take hours on large volumes. ext4 supports three journaling modes: journal (safest, journals data too), ordered (default, journals metadata and forces data writes before metadata commit), and writeback (fastest, only journals metadata, data may be stale after crash).",
    },
  ],
  followUps: [
    "What is an inode, and what happens when you run out of them despite having free space?",
    "Why does deleting a large file not free space while a process holds it open?",
    "Hard link or symlink — what breaks with each?",
  ],
  mcqs: [
    {
      q: "What does the execute (x) permission mean on a directory?",
      options: [
        "Permission to run scripts in the directory",
        "Permission to list the directory contents",
        "Permission to access (traverse) the directory and reach files inside it",
        "Permission to delete the directory",
      ],
      answerIndex: 2,
      explanation:
        "The execute bit on a directory controls the ability to traverse it (cd into it and access files by name). The read bit controls listing contents; write controls creating/deleting entries.",
    },
    {
      q: "Which of the following is true about hard links?",
      options: [
        "They can cross filesystem boundaries",
        "They have a different inode number than the original file",
        "They share the same inode as the original file",
        "They can link to directories by default",
      ],
      answerIndex: 2,
      explanation:
        "A hard link is an additional directory entry pointing to the same inode. Because inodes are per-filesystem, hard links cannot cross filesystem boundaries.",
    },
    {
      q: "What is stored in an inode?",
      options: [
        "The filename and file contents",
        "The filename and metadata",
        "Metadata and pointers to data blocks, but not the filename",
        "Only the filename",
      ],
      answerIndex: 2,
      explanation:
        "An inode stores file metadata (permissions, timestamps, size, block pointers) but the filename is stored in the directory entry, not the inode.",
    },
    {
      q: "What does the sticky bit on /tmp prevent?",
      options: [
        "Users from reading each other's files",
        "Users from creating files",
        "Users from deleting or renaming files they do not own",
        "Root from accessing the directory",
      ],
      answerIndex: 2,
      explanation:
        "The sticky bit (chmod +t) on a directory means only the file owner, directory owner, or root can delete or rename files in it — preventing users from removing each other's temporary files.",
    },
  ],
  flashcards: [
    {
      front: "What does /proc contain?",
      back: "A virtual filesystem that exposes kernel and per-process information as readable files. Examples: /proc/cpuinfo, /proc/meminfo, /proc/<pid>/status.",
    },
    {
      front: "What is the umask and how does it affect new files?",
      back: "The umask is a bitmask subtracted from default permissions when creating files. With umask 022, new files get 644 (666-022) and directories get 755 (777-022).",
    },
    {
      front: "What is a dangling symlink?",
      back: "A symbolic link whose target has been deleted or moved. The symlink still exists but points to a nonexistent path, causing 'No such file or directory' errors.",
    },
    {
      front: "What command shows disk usage per filesystem?",
      back: "df -h — displays filesystem, size, used, available, use%, and mount point in human-readable format.",
    },
    {
      front: "What is the difference between mtime and ctime?",
      back: "mtime (modification time) changes when file content is modified. ctime (change time) changes when file metadata (permissions, ownership, link count) or content changes. There is no creation time in traditional Unix.",
    },
    {
      front: "What does mount --bind do?",
      back: "Creates a bind mount — makes a directory (or file) accessible at another location in the filesystem tree. Unlike symlinks, bind mounts work at the VFS level and are invisible to applications.",
    },
    {
      front: "What filesystem type provides copy-on-write snapshots on Linux?",
      back: "Btrfs and ZFS both support copy-on-write (COW) semantics and snapshots. Btrfs is in the mainline kernel; ZFS requires a separate module.",
    },
    {
      front: "How do you find all setuid files on a system?",
      back: "find / -perm -4000 -type f — searches for regular files with the setuid bit set.",
    },
  ],
  deepDive: [
    "## The Virtual Filesystem (VFS) Layer\n\nThe Linux **Virtual Filesystem (VFS)** is an *abstraction layer* inside the kernel that provides a **uniform interface** to every filesystem implementation. When a user-space program calls `open()`, `read()`, or `write()`, it talks to VFS, which then dispatches the request to the correct filesystem driver -- be it **ext4**, **XFS**, **Btrfs**, **NFS**, or even pseudo-filesystems like **/proc** and **/sys**. VFS defines a set of *object types* -- `super_block`, `inode`, `dentry`, and `file` -- that every filesystem must implement. The `super_block` represents a mounted filesystem, the `inode` represents a file on disk, the `dentry` (directory entry) caches the *name-to-inode* mapping for fast path resolution, and the `file` object represents an *open file descriptor* in a process. This design means applications never need to know which filesystem they are working with; the VFS translates everything transparently. The **dentry cache** (dcache) is particularly critical for performance: it caches directory lookups so that repeated path resolutions like `/usr/local/bin/python3` do not require re-reading directory blocks from disk each time.",

    "## Journaling Modes and Crash Recovery in Depth\n\nThe ext4 journal is a *circular log* stored in a dedicated area of the filesystem (often inode 8). When the filesystem writes metadata -- such as updating an inode's block pointers after appending data -- it first writes the changes as a **transaction** to the journal. Only after the journal transaction is safely on disk does ext4 **commit** the actual metadata to its final location. This two-phase approach ensures that a power failure during the commit leaves the journal intact for replay on the next mount. ext4 supports three journaling modes: **journal** mode writes *both* data and metadata to the journal (safest but slowest, roughly 2x write amplification); **ordered** mode (the default) journals only metadata but forces data blocks to be written *before* the metadata commit, so you never get metadata pointing to stale data; **writeback** mode journals metadata only with no data ordering, giving the best performance but risking stale data exposure after a crash. The journaling mode is set at mount time via `data=journal|ordered|writeback` in `/etc/fstab`. For most production workloads, **ordered** is the right trade-off between *safety* and *throughput*.",

    "## Copy-on-Write Filesystems: Btrfs and ZFS\n\nUnlike ext4's *in-place update* model, **copy-on-write (COW)** filesystems like **Btrfs** and **ZFS** never overwrite existing data. When a block is modified, the filesystem writes the new version to a *free location* and updates the parent pointers, creating a new *tree path* from root to leaf. This makes **snapshots** essentially free -- a snapshot is just a reference to the old root pointer, and only blocks that change after the snapshot consume additional space. Btrfs, included in the mainline kernel, offers features like *transparent compression* (`zstd`, `lzo`), *checksumming* of both data and metadata (detecting silent corruption), *subvolumes* (independent filesystem trees within a single Btrfs pool), *RAID support* at the filesystem level, and *online defragmentation*. ZFS, originally from Sun Microsystems, provides similar capabilities with **raidz** (its RAID implementation), `send/receive` for incremental replication, and **ARC** (Adaptive Replacement Cache) for intelligent caching. ZFS runs on Linux via the **OpenZFS** project as a kernel module but is not included in the mainline kernel due to *licensing incompatibilities* between CDDL and GPL. For production servers requiring data integrity guarantees, COW filesystems provide a fundamentally stronger safety model than traditional journaling."
  ],
  code: [
    {
      language: "bash",
      caption: "Filesystem inspection and management commands",
      source: `# Show inode information for a file
stat /etc/passwd
# Output: File, Size, Blocks, IO Block, Inode, Links, Access, Modify, Change

# List files with their inode numbers
ls -li /etc/passwd

# Create a hard link and observe shared inode
ln /etc/hosts /tmp/hosts-hardlink
ls -li /etc/hosts /tmp/hosts-hardlink   # same inode number

# Create a symbolic link
ln -s /var/log/syslog /tmp/syslog-link
readlink -f /tmp/syslog-link            # resolve full target path

# Show filesystem disk usage and mount points
df -hT                                  # -T shows filesystem type
findmnt --real                          # tree view of real mounts

# Check filesystem type and features
dumpe2fs /dev/sda1 | grep -i 'filesystem features'

# Find all setuid binaries (security audit)
find / -perm -4000 -type f -exec ls -la {} \\; 2>/dev/null

# Show directory entry cache statistics
cat /proc/sys/fs/dentry-state`
    },
    {
      language: "cpp",
      caption: "C++ system calls for filesystem operations (stat, opendir, readlink)",
      source: `#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <iostream>
#include <cstring>

// Retrieve and display inode metadata using stat()
void inspect_inode(const char* path) {
    struct stat st;
    if (stat(path, &st) == -1) {
        perror("stat");
        return;
    }
    std::cout << "File: " << path << "\\n"
              << "  Inode:      " << st.st_ino << "\\n"
              << "  Size:       " << st.st_size << " bytes\\n"
              << "  Hard links: " << st.st_nlink << "\\n"
              << "  Permissions: " << std::oct << (st.st_mode & 0777)
              << std::dec << "\\n"
              << "  Block size: " << st.st_blksize << "\\n";
}

// List directory entries with their inode numbers
void list_directory(const char* dirpath) {
    DIR* dir = opendir(dirpath);
    if (!dir) { perror("opendir"); return; }

    struct dirent* entry;
    while ((entry = readdir(dir)) != nullptr) {
        std::cout << "  inode=" << entry->d_ino
                  << "  type=" << (int)entry->d_type
                  << "  name=" << entry->d_name << "\\n";
    }
    closedir(dir);
}

// Resolve a symbolic link target using readlink()
void resolve_symlink(const char* linkpath) {
    char target[PATH_MAX];
    ssize_t len = readlink(linkpath, target, sizeof(target) - 1);
    if (len == -1) { perror("readlink"); return; }
    target[len] = '\\0';
    std::cout << linkpath << " -> " << target << "\\n";
}

int main() {
    inspect_inode("/etc/passwd");
    list_directory("/etc");
    resolve_symlink("/usr/bin/python3");
    return 0;
}`
    },
    {
      language: "bash",
      caption: "Advanced filesystem operations: mount, fstab, and filesystem checks",
      source: `# Mount a filesystem with specific options
sudo mount -t ext4 -o noatime,data=ordered /dev/sdb1 /mnt/data

# Create a loop device from a file (useful for testing)
dd if=/dev/zero of=/tmp/test.img bs=1M count=100
mkfs.ext4 /tmp/test.img
sudo mount -o loop /tmp/test.img /mnt/test

# Check and repair a filesystem (unmounted only)
sudo fsck.ext4 -f /dev/sdb1

# Show extent layout for a file on ext4
sudo filefrag -v /var/log/syslog

# Display superblock information
sudo tune2fs -l /dev/sda1

# Example /etc/fstab entry:
# /dev/sda1  /         ext4  defaults,noatime       0  1
# UUID=abc.. /home     ext4  defaults               0  2
# tmpfs      /tmp      tmpfs nodev,nosuid,size=2G   0  0

# Lazy unmount (detach even if busy)
sudo umount -l /mnt/busy-mount

# Show open files on a mount point (why umount fails)
lsof +D /mnt/data`
    }
  ],
  diagrams: [
    {
      title: "Linux Filesystem Hierarchy",
      kind: "mindmap",
      caption: "Key directories in the FHS and their purposes",
      mermaid: `mindmap
  root["/  (root)"]
    /bin
      Essential user binaries
    /sbin
      System binaries
    /etc
      Configuration files
    /home
      User home directories
    /var
      /var/log
      /var/spool
      /var/tmp
    /tmp
      Temporary files
    /usr
      /usr/bin
      /usr/lib
      /usr/share
    /proc
      Virtual kernel info
    /sys
      Device/driver info
    /dev
      Device files
    /mnt & /media
      Mount points`
    },
    {
      title: "Inode and Directory Entry Architecture",
      kind: "architecture",
      caption: "How directory entries map filenames to inodes, and inodes point to data blocks on disk",
      mermaid: `graph LR
    subgraph Directory
        DE1["Entry: passwd → inode 42"]
        DE2["Entry: shadow → inode 78"]
        DE3["Entry: hosts → inode 42"]
    end
    subgraph Inode_Table
        I42["Inode 42<br/>perms: 644<br/>links: 2<br/>size: 2.4K"]
        I78["Inode 78<br/>perms: 640<br/>links: 1<br/>size: 1.1K"]
    end
    subgraph Data_Blocks
        DB1["Block 1001"]
        DB2["Block 1002"]
        DB3["Block 2005"]
    end
    DE1 --> I42
    DE3 --> I42
    DE2 --> I78
    I42 --> DB1
    I42 --> DB2
    I78 --> DB3`
    },
    {
      title: "VFS Layer and Filesystem Dispatch",
      kind: "flow",
      caption: "How user-space system calls flow through VFS to the concrete filesystem driver",
      mermaid: `flowchart TB
    APP["User Application<br/>open(), read(), write()"]
    VFS["VFS Layer<br/>super_block, inode,<br/>dentry, file objects"]
    DCACHE["Dentry Cache<br/>(dcache)"]
    EXT4["ext4 Driver"]
    XFS["XFS Driver"]
    BTRFS["Btrfs Driver"]
    PROC["/proc Driver"]
    BLK["Block Device Layer"]
    DISK["Physical Disk"]

    APP --> VFS
    VFS --> DCACHE
    VFS --> EXT4
    VFS --> XFS
    VFS --> BTRFS
    VFS --> PROC
    EXT4 --> BLK
    XFS --> BLK
    BTRFS --> BLK
    BLK --> DISK`
    }
  ],
  animations: [
    {
      title: "Deleted the file, disk still full",
      steps: [
        {
          label: "Large log deleted",
          detail: "`rm huge.log` returns immediately.",
        },
        {
          label: "`df` unchanged",
          detail: "Free space hasn't moved.",
        },
        {
          label: "Why",
          detail: "`rm` removes the directory entry. The inode and its blocks persist while any process holds the file open.",
        },
        {
          label: "Find the holder",
          detail: "`lsof | grep deleted` shows the process still holding it.",
        },
        {
          label: "Free the space",
          detail: "Restart or signal the process to reopen its log. Only then are the blocks released.",
        },
        {
          label: "Doing it right",
          detail: "Use `logrotate` with `copytruncate`, or have the process reopen on SIGHUP.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "ext4", "XFS", "Btrfs", "ZFS"],
    rows: [
      ["**Max Volume Size**", "1 EiB", "8 EiB", "16 EiB", "256 ZiB"],
      ["**Max File Size**", "16 TiB", "8 EiB", "16 EiB", "16 EiB"],
      ["**Journaling**", "Yes (metadata + optional data)", "Yes (metadata only)", "No (COW instead)", "No (COW instead)"],
      ["**Copy-on-Write**", "No", "No (reflink support added)", "Yes", "Yes"],
      ["**Snapshots**", "No", "No", "Yes (subvolume snapshots)", "Yes (dataset snapshots)"],
      ["**Data Checksumming**", "Metadata only", "Metadata only", "Yes (data + metadata)", "Yes (data + metadata)"],
      ["**Compression**", "No", "No", "Yes (`zstd`, `lzo`, `zlib`)", "Yes (`lz4`, `zstd`, `gzip`)"],
      ["**RAID Support**", "Via `mdadm`", "Via `mdadm`", "Built-in (RAID 0/1/10/5/6)", "Built-in (`raidz1/2/3`)"],
      ["**Default Distro**", "Ubuntu, Debian", "RHEL, CentOS, Rocky", "openSUSE (optional)", "FreeBSD (Linux via OpenZFS)"],
      ["**Kernel Inclusion**", "Yes (mainline)", "Yes (mainline)", "Yes (mainline)", "No (license conflict)"]
    ]
  },
  exercises: [
    "**Inode Exhaustion Drill**: Create a small ext4 filesystem with `mkfs.ext4 -N 100` on a loop device. Write a script to create empty files until inode exhaustion occurs. Observe the error, check `df -i`, and explain why disk space remains but no files can be created. What `tune2fs` setting controls inode allocation?",
    "**Hard Link vs Symlink Lab**: Create a file, a hard link, and a symlink to it. Use `ls -li` to compare inodes. Delete the original file -- what happens to each link? Use `stat` to observe link counts before and after. Then move the original to a different filesystem and repeat -- why does the hard link fail?",
    "**Permission Debugging Challenge**: Set up a directory `/tmp/permlab` with sticky bit. As *user A*, create a file. As *user B*, try to delete it and explain the error. Then add setgid to the directory, create new files from both users, and verify group ownership inheritance. Document each step with `ls -la` output.",
    "**Journaling Recovery Simulation**: Create an ext4 filesystem on a loop device, mount it, write data, and simulate a crash with `echo 1 > /proc/sysrq-trigger` (in a VM). Observe journal replay on remount via `dmesg`. Compare recovery time with `fsck` on a non-journaled filesystem.",
    "**Mount Namespace Exploration**: Use `unshare --mount` to create a new mount namespace. Mount a tmpfs inside it, create files, and exit. Verify the mount is invisible from the host. Explain how this relates to container isolation and how `findmnt` shows different views per namespace."
  ],
  cheatSheet: [
    "`ls -li` -- list files with **inode numbers**; `stat <file>` -- full inode metadata including *atime*, *mtime*, *ctime*",
    "`df -hT` -- disk usage per filesystem with **type**; `df -i` -- inode usage; `du -sh <dir>` -- directory size summary",
    "`chmod 755 <file>` -- set **rwxr-xr-x**; `chmod u+s` -- set **setuid**; `chmod +t <dir>` -- set **sticky bit**; `umask 022` -- default mask",
    "`ln <target> <link>` -- create **hard link** (same inode); `ln -s <target> <link>` -- create **symlink**; `readlink -f` -- resolve symlink chain",
    "`mount -t ext4 /dev/sdb1 /mnt` -- mount filesystem; `umount -l /mnt` -- **lazy unmount**; `findmnt --real` -- show mount tree",
    "`tune2fs -l /dev/sda1` -- ext4 superblock info; `dumpe2fs` -- detailed filesystem dump; `filefrag -v` -- file extent/fragmentation map"
  ],
  revisionNotes: [
    "An **inode** stores *all* file metadata (permissions, ownership, timestamps, data block pointers) **except the filename**. Directory entries map names to inode numbers. This is why hard links work -- multiple names can reference the same inode.",
    "**ext4 journaling** uses three modes: `journal` (safest, logs data + metadata), `ordered` (default, metadata journal with data-ordering guarantee), and `writeback` (fastest, metadata only, risk of stale data after crash). The journal enables fast recovery by *replaying* committed transactions instead of running a full `fsck`.",
    "**Hard links** share the same inode and cannot cross filesystem boundaries or link directories. **Symbolic links** are separate files containing a path, can cross filesystems and link directories, but may **dangle** if the target is deleted. Use `ls -li` to distinguish them.",
    "The **VFS layer** provides a uniform `open()`/`read()`/`write()` interface across all filesystem types. It defines four core objects: `super_block` (mounted FS), `inode` (file metadata), `dentry` (name-to-inode cache), and `file` (open file descriptor). The **dentry cache** is critical for path resolution performance.",
    "Special permission bits: **setuid** (`4000`) runs process as file owner (e.g., `/usr/bin/passwd`); **setgid** (`2000`) runs as file group and on directories forces group inheritance; **sticky bit** (`1000`) on directories prevents users from deleting others' files (e.g., `/tmp`)."
  ],
  resources: [
    {
      label: "The Linux Programming Interface — Michael Kerrisk",
      kind: "book",
    },
    {
      label: "Filesystem Hierarchy Standard",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "FHS",
      definition:
        "Filesystem Hierarchy Standard — a specification defining the directory structure and contents of Unix-like operating systems.",
    },
    {
      term: "inode",
      definition:
        "A data structure on disk that stores a file's metadata (permissions, timestamps, size, block pointers) and is identified by a unique number within its filesystem.",
    },
    {
      term: "ext4",
      definition:
        "The fourth extended filesystem — the default Linux filesystem featuring journaling, extents, delayed allocation, and support for volumes up to 1 EiB.",
    },
    {
      term: "chmod",
      definition:
        "Command to change file permission bits. Accepts octal (chmod 755) or symbolic (chmod u+x) notation.",
    },
    {
      term: "chown",
      definition:
        "Command to change file owner and group: chown user:group file.",
    },
    {
      term: "symlink",
      definition:
        "Symbolic link — a file that contains a path to another file or directory. Can cross filesystems and may dangle if the target is removed.",
    },
    {
      term: "journaling",
      definition:
        "A technique where filesystem changes are first written to a log (journal) before being committed, enabling fast crash recovery without a full filesystem check.",
    },
    {
      term: "mount point",
      definition:
        "A directory in the filesystem tree where a separate filesystem (from a device or network share) is attached and made accessible.",
    },
  ],
};
