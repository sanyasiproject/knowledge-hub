import type { TopicContent } from "../types";

export const gitInternals: TopicContent = {
  quickSummary: [
    "Git's object model has four types: blobs (file content), trees (directories mapping names to blobs/trees), commits (snapshots pointing to a tree + parent commits), and tags (named references to objects with optional metadata).",
    "All objects are content-addressed by their SHA-1 hash and stored in .git/objects — identical content always produces the same hash, enabling deduplication and integrity verification.",
    "Refs are human-readable names (branches, tags, HEAD) stored in .git/refs/ that point to commit SHAs; the reflog records every change to refs, acting as a local safety net for recovering lost commits.",
    "Packfiles compress objects by storing deltas between similar objects, dramatically reducing repository size — Git automatically packs loose objects during gc.",
  ],
  detailed: [
    "## The Object Model: Blobs, Trees, Commits, Tags\n\nGit stores everything as objects in a content-addressable filesystem:\n\n**Blob** — stores raw file content (no filename or permissions). Two files with identical content share the same blob object.\n\n**Tree** — represents a directory. Each entry has a mode (file permissions), type (blob or tree), SHA-1, and filename. Trees reference blobs (files) and other trees (subdirectories).\n\n**Commit** — contains a pointer to a root tree (the project snapshot), zero or more parent commit SHAs, author/committer info, timestamps, and a message.\n\n**Tag (annotated)** — points to an object (usually a commit) with a tagger name, date, and message. Lightweight tags are just refs, not objects.\n\nEvery object is hashed with SHA-1: `header + content -> SHA-1`. Objects are immutable — modifying content produces a new hash. Use `git cat-file -t <sha>` to see an object's type and `git cat-file -p <sha>` to print its content.",
    "## Content Addressing and Storage\n\nWhen you `git add` a file, Git computes `SHA-1(\"blob <size>\\0<content>\")`, compresses the content with zlib, and stores it in `.git/objects/<first-2-chars>/<remaining-38-chars>`. This content-addressing has profound consequences:\n\n- **Deduplication** — identical files across commits or branches are stored once\n- **Integrity** — any corruption changes the hash, detectable by `git fsck`\n- **Immutability** — objects never change; \"modifying\" history creates new objects\n- **Efficient comparison** — comparing two trees is just comparing SHA-1 strings; only differing subtrees need recursion\n\nThe index (.git/index) caches tree/blob SHAs for the working tree, making `git status` fast by comparing file stat data against cached entries before recomputing hashes.",
    "## Refs, HEAD, and the Reflog\n\n**Refs** are pointers stored as files in `.git/refs/`:\n- `refs/heads/<branch>` — local branches\n- `refs/remotes/<remote>/<branch>` — remote-tracking branches\n- `refs/tags/<tag>` — tags\n\n**HEAD** is a symbolic ref in `.git/HEAD`, typically containing `ref: refs/heads/main`. In detached HEAD state, it contains a raw SHA-1.\n\n**Reflog** records every change to each ref and HEAD. `git reflog` shows HEAD's history; `git reflog show <branch>` shows a branch's history. Entries have the format `<ref>@{N}` (e.g., `HEAD@{3}`). The reflog is local-only and entries expire (default: 90 days for reachable, 30 days for unreachable commits).\n\nThe reflog is your safety net: even after a hard reset or accidental branch deletion, `git reflog` shows the old commit SHA, and `git checkout <sha>` or `git branch recovery <sha>` recovers it.",
    "## Packfiles and Compression\n\nInitially, each object is stored as a separate compressed file (a \"loose object\"). As the repository grows, Git packs objects into packfiles (`.git/objects/pack/`):\n\n- `git gc` (garbage collection) triggers packing\n- Packfiles use delta compression — similar objects are stored as a base object plus deltas\n- A `.idx` index file enables O(log n) lookup by SHA in the packfile\n- Git is smart about delta chains: it groups objects by filename and size, preferring recent versions as bases (so the latest version is stored fully, older ones as deltas)\n\nPackfiles dramatically reduce disk usage and improve network transfer. `git verify-pack -v <packfile>` shows the contents. `git count-objects -vH` shows loose vs packed object counts and sizes.",
    "## Garbage Collection\n\n`git gc` performs several maintenance tasks:\n1. **Packs loose objects** into packfiles with delta compression\n2. **Removes unreachable objects** — commits not referenced by any branch, tag, or reflog entry\n3. **Packs refs** — consolidates `.git/refs/` files into `.git/packed-refs` for faster lookup\n4. **Prunes reflog entries** older than the configured expiry\n\nGit runs gc automatically when thresholds are reached (default: 6700+ loose objects or 50+ packfiles). `git gc --aggressive` rebuilds packfiles with more thorough delta compression (slow, rarely needed). `git prune` removes unreachable loose objects immediately.\n\nImportant: unreachable objects are safe for at least 2 weeks by default (gc.pruneExpire), giving you time to recover from mistakes using the reflog.",
    "## Low-Level (Plumbing) Commands\n\nGit distinguishes between porcelain (user-facing) and plumbing (low-level) commands:\n\n- `git hash-object -w <file>` — compute SHA and store as blob\n- `git cat-file -t <sha>` — show object type\n- `git cat-file -p <sha>` — pretty-print object content\n- `git ls-tree <tree-sha>` — list entries in a tree object\n- `git update-index --add <file>` — add entry to the index\n- `git write-tree` — create a tree object from the current index\n- `git commit-tree <tree> -p <parent> -m \"msg\"` — create a commit object\n- `git update-ref refs/heads/branch <sha>` — update a ref\n- `git rev-parse HEAD` — resolve a ref to its SHA\n- `git fsck` — verify integrity of all objects\n\nThese commands let you understand (and manually construct) what porcelain commands do automatically.",
  ],
  animations: [
    {
      title: "What a commit actually is",
      steps: [
        {
          label: "Blob",
          detail: "File contents, stored by SHA of the content. Identical files anywhere are one blob.",
        },
        {
          label: "Tree",
          detail: "A directory: names pointing at blobs and other trees.",
        },
        {
          label: "Commit",
          detail: "A pointer to one tree, plus parent commits, author, and message.",
        },
        {
          label: "Hash chain",
          detail: "The commit's hash covers the tree and the parents, so changing any history changes every hash after it.",
        },
        {
          label: "Branch",
          detail: "Just a file containing one commit hash. Creating one is writing 41 bytes — hence branching is free.",
        },
        {
          label: "Renames",
          detail: "Not stored. Git infers them by comparing content similarity between trees.",
        },
      ],
    },
  ],
  interviewQA: [
    {
      q: "Explain Git's object model. What are the four object types and how do they relate?",
      a: "Git has four object types: blobs store raw file content (no name/permissions), trees represent directories by mapping filenames to blob/tree SHAs with mode bits, commits point to a root tree (full project snapshot) plus parent commit(s) with author info and message, and annotated tags point to an object with tagger info and a message. They form a hierarchy: a commit references a tree, which references blobs and subtrees. All are content-addressed by SHA-1 — identical content produces the same hash, enabling deduplication and integrity.",
      followUps: [
        "What happens internally when two files have identical content?",
        "How does Git efficiently compare two commits?",
        "What is a tree object entry's mode field?",
      ],
    },
    {
      q: "How would you recover a commit after an accidental git reset --hard?",
      a: "Use git reflog to find the SHA of the commit before the reset — reflog records every HEAD change. Then either git checkout <sha> to inspect it, or git branch recovery <sha> to create a branch pointing to it, or git reset --hard <sha> to move the current branch back. The reflog retains entries for 90 days (reachable) or 30 days (unreachable) by default, so recovery is possible as long as gc hasn't pruned the unreachable objects.",
      followUps: [
        "What if the reflog has also expired?",
        "How does git fsck --unreachable help?",
      ],
    },
    {
      q: "What are packfiles and why does Git use them?",
      a: "Packfiles are compressed archives of Git objects stored in .git/objects/pack/. Instead of storing each object as a separate zlib-compressed file (loose object), Git packs similar objects together using delta compression — storing a base object and binary deltas for related objects. This dramatically reduces disk usage (often 10-50x) and speeds up network transfers (clone/fetch send packfiles). Git packs automatically during gc when loose object count exceeds a threshold. An accompanying .idx file enables fast SHA-1 lookup within the packfile.",
      followUps: [
        "How does Git choose which objects to delta against?",
        "What is a thin pack in the context of fetch/push?",
      ],
    },
  ],
  followUps: [
    "What are the four object types, and how does a commit reference a tree?",
    "Why is a branch just a file containing a hash?",
    "How does Git detect a rename when it doesn't store renames?",
  ],
  mcqs: [
    {
      q: "Which Git object type stores raw file content without a filename?",
      options: ["Tree", "Commit", "Blob", "Tag"],
      answerIndex: 2,
      explanation:
        "A blob stores only the file content. The filename and permissions are stored in the tree object that references the blob.",
    },
    {
      q: "What does git cat-file -p <sha> do?",
      options: [
        "Creates a new object",
        "Pretty-prints the content of a Git object",
        "Deletes an object from the database",
        "Compresses an object into a packfile",
      ],
      answerIndex: 1,
      explanation:
        "git cat-file -p pretty-prints any Git object (blob, tree, commit, or tag) in a human-readable format, showing its stored content.",
    },
    {
      q: "How long does the reflog retain entries for unreachable commits by default?",
      options: ["7 days", "14 days", "30 days", "90 days"],
      answerIndex: 2,
      explanation:
        "By default, unreachable reflog entries expire after 30 days (gc.reflogExpireUnreachable), while reachable entries expire after 90 days (gc.reflogExpire).",
    },
    {
      q: "What triggers automatic garbage collection in Git?",
      options: [
        "Every commit",
        "When loose object count exceeds ~6700 or packfile count exceeds ~50",
        "Every 24 hours",
        "Only when manually run",
      ],
      answerIndex: 1,
      explanation:
        "Git's auto gc runs when certain thresholds are exceeded: approximately 6700 loose objects (gc.auto) or 50 packfiles (gc.autoPackLimit). It is triggered during commands like git commit and git fetch.",
    },
    {
      q: "What does git fsck do?",
      options: [
        "Formats the staging area",
        "Verifies the integrity and connectivity of all objects in the database",
        "Forces a commit",
        "Fixes merge conflicts",
      ],
      answerIndex: 1,
      explanation:
        "git fsck (filesystem check) walks the entire object graph, verifying that all objects are valid, all SHA-1 hashes match their content, and all references point to existing objects.",
    },
  ],
  flashcards: [
    {
      front: "Where are Git objects stored on disk?",
      back: ".git/objects/ — loose objects are at <first-2-hex>/<remaining-38-hex>, packfiles are in .git/objects/pack/. All objects are zlib-compressed.",
    },
    {
      front: "What is the SHA-1 input for a blob object?",
      back: "\"blob <content-size>\\0<content>\" — the word 'blob', a space, the content length in bytes, a null byte, then the raw content. This is hashed with SHA-1.",
    },
    {
      front: "What is a symbolic ref?",
      back: "A ref that points to another ref rather than directly to a SHA. HEAD is typically a symbolic ref containing 'ref: refs/heads/<branch>'. Created with git symbolic-ref.",
    },
    {
      front: "What is the difference between a lightweight tag and an annotated tag?",
      back: "A lightweight tag is just a ref pointing to a commit (a file in refs/tags/). An annotated tag is a full Git object with tagger, date, message, and optional GPG signature, referenced by a tag ref.",
    },
    {
      front: "What does git rev-parse HEAD do?",
      back: "Resolves the symbolic reference HEAD to its full 40-character SHA-1 hash. Works with any ref: git rev-parse main, git rev-parse HEAD~3.",
    },
    {
      front: "What is delta compression in packfiles?",
      back: "Storing an object as a binary diff (delta) against a similar base object rather than storing it fully. Git selects bases by filename and size similarity, preferring recent objects as bases.",
    },
    {
      front: "What is .git/packed-refs?",
      back: "A single flat file containing all refs and their SHAs, created by git pack-refs (part of gc). Faster to read than individual files in refs/ for repositories with many branches/tags.",
    },
    {
      front: "How do you find dangling (unreachable) objects?",
      back: "git fsck --unreachable lists objects not reachable from any ref. git fsck --dangling (default) shows only objects not reachable from any other unreachable object.",
    },
  ],
  deepDive: [
    `## How Git Constructs a Commit Under the Hood

When you run \`git commit\`, Git performs a precise sequence of plumbing operations. First, it calls \`write-tree\` to serialize the current index (staging area) into a tree object hierarchy. Each directory becomes a tree object whose entries point to blobs (files) or subtrees (subdirectories). If an identical tree or blob already exists in the object store, Git reuses it — this is the deduplication benefit of content-addressing. Next, Git creates a commit object via \`commit-tree\`, embedding the root tree SHA, the current HEAD as the parent, timestamps, author/committer identity (from config), and your message. Finally, \`update-ref\` advances the branch pointer to the new commit SHA. The entire operation is atomic from the ref's perspective: either the ref is updated or it is not.

Understanding this pipeline explains many Git behaviors. For instance, \`git commit --amend\` does not modify the existing commit (objects are immutable) — it creates a **new** commit with the same parent as the old one, then moves the branch pointer. The old commit still exists as a dangling object until garbage collection prunes it. Similarly, \`git rebase\` replays commits by creating new commit objects with different parents; the original commits remain reachable via the reflog.`,

    `## The Index (Staging Area) in Depth

The index, stored in \`.git/index\`, is a critical but often misunderstood data structure. It is a **flat, sorted list** of all tracked file paths with their blob SHAs, file modes, and filesystem stat data (mtime, ctime, inode, size). The index serves three distinct purposes:

1. **Staging area**: \`git add\` writes blob objects and updates the index entry for that path. \`git commit\` reads the index to build the tree.
2. **Cache for status**: \`git status\` compares filesystem stat data against index entries. If stat data matches, Git skips the expensive hash computation — this is the **stat cache optimization** that makes status fast on large repos.
3. **Merge conflict resolution**: during a merge, the index expands to hold up to three entries per path (base, ours, theirs) at stages 1, 2, and 3. Stage 0 is the normal resolved entry. \`git ls-files --stage\` reveals these entries.

The index also supports features like **assume-unchanged** and **skip-worktree** flags that tell Git to ignore certain files during status checks, useful for large generated files or local config overrides.`,

    `## SHA-1, SHA-256, and Collision Resistance

Git originally chose SHA-1 for content addressing because it provides a good balance of speed and collision resistance for a version control system. The hash input is \`"<type> <size>\\0<content>"\` — prepending the object type and size prevents cross-type collisions (a blob and a tree with the same raw bytes produce different hashes). However, SHA-1 is no longer considered cryptographically secure after the SHAnocked attack (2017) demonstrated practical collisions.

Git has been transitioning to SHA-256 via the \`extensions.objectFormat\` config. The SHA-256 support is built into Git as an alternative object format, allowing repositories to use 64-character hex hashes instead of 40-character ones. In practice, SHA-1 collisions remain extremely unlikely for naturally-occurring content (the attack requires specially crafted binary payloads), and Git includes additional hardening (\`transfer.fsckObjects\`) that detects known collision patterns during fetch/push. For new repositories with high security requirements, SHA-256 format can be selected at \`git init\` time.`,

    `## Merge Strategies and the Three-Way Merge Algorithm

Git's default merge strategy (\`ort\`, replacing the older \`recursive\`) performs a **three-way merge** using the merge base (common ancestor), the current branch tip, and the branch being merged. The algorithm works at the tree level: it walks the three trees in parallel, comparing entry-by-entry. If a file changed in only one branch, the change is accepted automatically. If a file changed in both branches, Git attempts a content-level three-way merge using the Myers diff algorithm on the blob contents.

The **ort** (Ostensibly Recursive's Twin) strategy improves on \`recursive\` by handling rename detection more efficiently, using a virtual merge base when multiple common ancestors exist (criss-cross merges), and producing fewer spurious conflicts. When Git cannot resolve a conflict automatically, it writes conflict markers into the working tree and records all three versions in the index at stages 1-3. Understanding that merges operate on trees and blobs — not "files" in the filesystem sense — clarifies why Git can cleanly merge file renames, permission changes, and directory restructuring.`,
  ],

  code: [
    {
      language: "bash",
      caption: "Manually creating a commit using plumbing commands",
      source: `# Step 1: Create a blob from file content
echo "Hello, Git internals!" | git hash-object -w --stdin
# Output: a5c19667710254f835085b99726e523457150e03

# Step 2: Build a tree that references the blob
git update-index --add --cacheinfo 100644 \\
  a5c19667710254f835085b99726e523457150e03 hello.txt
TREE_SHA=$(git write-tree)
echo "Tree SHA: $TREE_SHA"

# Step 3: Create a commit pointing to the tree
COMMIT_SHA=$(echo "Manual commit via plumbing" | \\
  git commit-tree $TREE_SHA)
echo "Commit SHA: $COMMIT_SHA"

# Step 4: Update the branch ref to point to the new commit
git update-ref refs/heads/manual-branch $COMMIT_SHA

# Verify the chain
git log --oneline manual-branch
git cat-file -p $COMMIT_SHA   # shows tree, author, message
git cat-file -p $TREE_SHA     # shows blob entry
git cat-file -p a5c19667       # shows file content`,
    },
    {
      language: "bash",
      caption: "Inspecting Git objects and understanding the object graph",
      source: `# Show the type of any object
git cat-file -t HEAD           # commit
git cat-file -t HEAD^{tree}    # tree

# Pretty-print a commit object
git cat-file -p HEAD
# tree 4b825dc642cb6eb9a060e54bf899d31e2b6f37a2
# parent 7a1f3e...
# author Sanyasi Raja <...> 1700000000 +0530
# committer Sanyasi Raja <...> 1700000000 +0530
#
# commit message here

# List entries in a tree
git ls-tree HEAD
# 100644 blob abc123... README.md
# 040000 tree def456... src

# Recursively list all blobs in a tree
git ls-tree -r HEAD --name-only

# Count loose vs packed objects
git count-objects -vH

# Verify repository integrity
git fsck --full --strict

# Show packfile contents
git verify-pack -v .git/objects/pack/*.idx | head -20`,
    },
    {
      language: "bash",
      caption: "Reflog recovery techniques",
      source: `# View HEAD's reflog (every checkout, commit, reset, rebase)
git reflog show HEAD --date=iso

# View a specific branch's reflog
git reflog show main

# Recover after accidental reset --hard
git reflog
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: important feature
git branch recovery def5678
# or: git reset --hard def5678

# Find a commit by its message when you know part of it
git reflog --grep-reflog="feature" --all

# Show diff between current HEAD and a reflog entry
git diff HEAD@{3}

# Recover a deleted branch
git reflog | grep "checkout: moving from deleted-branch"
git branch restored-branch <sha-from-reflog>

# Expire reflog entries (careful!)
git reflog expire --expire=now --all
git gc --prune=now  # actually removes unreachable objects`,
    },
    {
      language: "bash",
      caption: "Exploring packfiles and delta compression",
      source: `# Force packing of all loose objects
git gc

# List all objects in a packfile with their sizes
git verify-pack -v .git/objects/pack/*.idx | \\
  sort -k 3 -n -r | head -10
# SHA  type  size  size-in-pack  offset  depth  base-SHA

# Find the largest objects in history (useful for repo bloat)
git rev-list --objects --all | \\
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \\
  grep '^blob' | sort -k3 -n -r | head -10

# Repack with aggressive delta compression
git repack -a -d -f --depth=250 --window=250

# Show object statistics
git count-objects -vH
# count: 0           (loose objects)
# packs: 1           (packfiles)
# size-pack: 12.5 MiB`,
    },
  ],

  diagrams: [
    {
      title: "Git Internal Directory Structure",
      kind: "architecture",
      caption: "Internal structure of the .git directory and object database.",
      mermaid: `graph TD
    GIT[.git directory] --> OBJ[objects/]
    GIT --> REFS[refs/]
    GIT --> HEAD[HEAD file]
    GIT --> INDEX[index staging area]
    OBJ --> PACK[pack files]
    OBJ --> LOOSE[loose objects]
    LOOSE --> BLB[Blob file contents]
    LOOSE --> TRE[Tree directory listing]
    LOOSE --> CMT[Commit snapshot]
    LOOSE --> TAG[Annotated Tag]
    REFS --> HDS[heads branches]
    REFS --> REM[remotes]
    REFS --> TGS[tags]`,
    },
    {
      title: "Pack File Creation Process",
      kind: "flow",
      caption: "How Git creates pack files to compress loose objects during gc.",
      mermaid: `flowchart TD
    A[Many loose objects] --> B[git gc triggers]
    B --> C[Identify full object graph]
    C --> D[Compute deltas between similar objects]
    D --> E[Sort by type size name]
    E --> F[Write .pack file]
    F --> G[Write .idx index file]
    G --> H[Remove packed loose objects]
    H --> I[Compressed repository]`,
    },
    {
      title: "Git Object Chain",
      kind: "architecture",
      caption: "How commit, tree, and blob objects link together to form history.",
      mermaid: `graph LR
    C2[Commit abc123] --> T2[Tree def456]
    C2 --> C1[Parent Commit bbb111]
    C1 --> T1[Tree ccc222]
    T2 --> F1[Blob src/main.js]
    T2 --> F2[Blob README.md]
    T2 --> D1[Tree src/]
    D1 --> F3[Blob src/util.js]`,
    },
    {
      title: "Git Fetch Transfer Protocol",
      kind: "sequence",
      caption: "How git fetch transfers objects between client and remote server.",
      mermaid: `sequenceDiagram
    participant Client
    participant Server
    Client->>Server: git-upload-pack handshake
    Server-->>Client: Advertise refs and capabilities
    Client->>Server: Send want SHA list
    Client->>Server: Send have SHA list
    Server->>Server: Compute missing objects
    Server-->>Client: Pack file with deltas
    Client->>Client: Unpack objects
    Client->>Client: Update local refs`,
    },
  ],

  exercises: [
    "**Reconstruct a commit from scratch using plumbing commands.** Create a new empty repository with `git init`. Write a file, use `git hash-object -w` to store it as a blob, `git update-index` to add it to the staging area, `git write-tree` to create a tree, and `git commit-tree` to create a commit. Finally, use `git update-ref` to point a branch at your commit. Verify with `git log` and `git cat-file -p` on each object.",
    "**Investigate object deduplication.** In a repository, create two files with identical content in different directories. Run `git add` on both and use `git ls-files --stage` to examine the index. Confirm that both entries point to the same blob SHA. Then modify one file slightly, re-add, and verify that a new blob was created while the other still references the original.",
    "**Reflog disaster recovery drill.** Create a branch with 5 commits. Then run `git reset --hard HEAD~3` to lose 3 commits. Using only `git reflog` and `git branch`, recover the lost commits onto a new branch. Verify the recovery with `git log`. Then delete the recovery branch and use `git fsck --unreachable` to find the dangling commits.",
    "**Analyze packfile efficiency.** Clone a medium-sized open source repository. Run `git count-objects -vH` to see current stats. Then run `git gc` and compare the before/after numbers. Use `git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n -r | head -5` to find the 5 largest objects and identify what files they correspond to using `git rev-list --objects --all`.",
    "**Explore merge internals.** Create a repository with a base commit, then create two branches that modify the same file in different (non-overlapping) sections. Merge them and observe the automatic resolution. Then create a conflict scenario where both branches modify the same lines. Use `git ls-files --stage` during the conflict to inspect the three index stages (base, ours, theirs). Resolve manually and complete the merge.",
  ],

  cheatSheet: [
    "`git cat-file -t <sha>` — Show the type of a Git object (blob, tree, commit, tag)",
    "`git cat-file -p <sha>` — Pretty-print the content of any Git object",
    "`git ls-tree [-r] <tree-ish>` — List entries in a tree object; -r for recursive",
    "`git hash-object -w <file>` — Compute SHA-1 and store the file as a blob object",
    "`git update-index --add --cacheinfo <mode> <sha> <path>` — Add an entry to the index manually",
    "`git write-tree` — Create a tree object from the current index state",
    "`git commit-tree <tree> -p <parent> -m 'msg'` — Create a commit object manually",
    "`git update-ref refs/heads/<branch> <sha>` — Update a branch ref to point to a specific commit",
    "`git rev-parse <ref>` — Resolve any ref (HEAD, branch, tag, HEAD~3) to its full SHA",
    "`git reflog [show <ref>]` — Show the reflog for HEAD or a specific ref",
    "`git fsck [--unreachable]` — Verify object database integrity; find dangling objects",
    "`git count-objects -vH` — Show counts and sizes of loose and packed objects",
    "`git verify-pack -v <idx-file>` — Show detailed contents of a packfile",
    "`git gc [--aggressive]` — Run garbage collection: pack objects, prune unreachable, consolidate refs",
    "`git ls-files --stage` — Show index entries with their stage numbers (useful during merges)",
    "`git symbolic-ref HEAD` — Show what HEAD points to (e.g., refs/heads/main)",
  ],

  revisionNotes: [
    "Git has four object types: **blob** (file content), **tree** (directory listing), **commit** (snapshot + metadata + parent), and **annotated tag** (named reference with metadata). All are immutable and content-addressed by SHA-1.",
    "Every object is stored as `SHA-1(\"<type> <size>\\0<content>\")` — the type prefix prevents cross-type hash collisions. Objects are zlib-compressed in `.git/objects/`.",
    "The **index** (`.git/index`) serves triple duty: staging area for the next commit, stat cache for fast `git status`, and conflict resolution workspace (stages 0-3) during merges.",
    "**Refs** are human-readable pointers to commit SHAs stored in `.git/refs/`. HEAD is a symbolic ref pointing to the current branch. Detached HEAD contains a raw SHA instead.",
    "The **reflog** records every change to every ref locally. It is your safety net: `git reflog` + `git branch recovery <sha>` recovers from almost any mistake within 30-90 days.",
    "**Packfiles** use delta compression to store similar objects efficiently. Git prefers recent versions as base objects, so the latest file content is stored fully while older versions are deltas. Triggered by `git gc`.",
    "The **three-way merge** algorithm compares base (common ancestor), ours, and theirs trees entry-by-entry. Content conflicts only arise when both sides modify the same region of the same file.",
    "**Plumbing commands** (`hash-object`, `cat-file`, `write-tree`, `commit-tree`, `update-ref`) are the building blocks that porcelain commands (`add`, `commit`, `merge`) are built upon.",
  ],

  resources: [
    {
      label: "Pro Git — Git Internals chapter",
      kind: "book",
    },
    {
      label: "Building Git — James Coglan",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Blob",
      definition:
        "A Git object storing raw file content, identified by the SHA-1 of its content. Contains no filename or metadata.",
    },
    {
      term: "Tree",
      definition:
        "A Git object representing a directory — a list of entries each with mode, type (blob/tree), SHA-1, and filename.",
    },
    {
      term: "Commit object",
      definition:
        "A Git object containing a tree SHA (snapshot), parent SHA(s), author/committer info, and a message.",
    },
    {
      term: "Annotated tag",
      definition:
        "A Git object that points to another object (usually a commit) with tagger identity, date, message, and optional signature.",
    },
    {
      term: "Reflog",
      definition:
        "A local log recording every change to each ref and HEAD, enabling recovery of lost commits within the expiry window.",
    },
    {
      term: "Packfile",
      definition:
        "A compressed archive of Git objects using delta compression, stored in .git/objects/pack/ with an accompanying .idx index.",
    },
    {
      term: "Garbage collection (gc)",
      definition:
        "A maintenance operation that packs loose objects, removes unreachable objects, consolidates refs, and prunes expired reflog entries.",
    },
    {
      term: "Plumbing commands",
      definition:
        "Low-level Git commands (hash-object, cat-file, update-index, write-tree) that operate directly on the object database, as opposed to porcelain (user-facing) commands.",
    },
  ],
};
