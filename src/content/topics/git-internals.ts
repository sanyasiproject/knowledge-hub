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
