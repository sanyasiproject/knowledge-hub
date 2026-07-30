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
