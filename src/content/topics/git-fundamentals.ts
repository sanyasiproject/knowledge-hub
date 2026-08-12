import type { TopicContent } from "../types";

export const gitFundamentals: TopicContent = {
  quickSummary: [
    "Git is a distributed version control system where every clone contains the full repository history — no server is required for commits, branching, or log inspection.",
    "The three-tree architecture consists of the working tree (your files on disk), the staging area (index — a snapshot you are building for the next commit), and HEAD (the latest commit on the current branch).",
    "A commit is an immutable snapshot of the entire project at a point in time, identified by a SHA-1 hash, containing a pointer to a tree object, parent commit(s), author, and message.",
    "Core workflow: edit files in the working tree, stage changes with git add (moves them to the index), then git commit to create a new commit pointing to HEAD.",
  ],
  detailed: [
    "## The Three Trees: Working Tree, Index, HEAD\n\nGit manages content through three distinct areas:\n- **Working tree** — the actual files on your filesystem that you edit directly\n- **Staging area (index)** — a file (`.git/index`) that records what will go into the next commit; `git add` copies file content from the working tree to the index\n- **HEAD** — a reference to the current branch's latest commit; `git commit` creates a new commit from the index and advances HEAD\n\n`git status` compares these three trees: changes between HEAD and index are \"staged,\" changes between index and working tree are \"unstaged.\" `git diff` shows unstaged changes; `git diff --staged` shows staged changes. Understanding this model is essential — nearly every Git command is an operation on one or more of these trees.",
    "## Commits and the DAG\n\nEach commit object contains: a tree SHA (snapshot of all files), zero or more parent commit SHAs (zero for the root commit, one for normal commits, two or more for merges), author/committer info, and a message. Commits form a directed acyclic graph (DAG) where each commit points to its parent(s). This immutable chain provides complete history — every commit is content-addressed by its SHA-1 hash, meaning any modification produces a different hash, making tampering detectable.\n\nBest practices for commit messages: use imperative mood (\"Add feature\" not \"Added feature\"), keep the subject line under 50 characters, add a blank line then detailed body if needed, reference issue numbers.",
    "## Essential Commands\n\n- `git init` — create a new repository in the current directory\n- `git clone <url>` — copy a remote repository with full history\n- `git add <files>` — stage changes (add to index)\n- `git commit -m \"message\"` — create a commit from staged changes\n- `git status` — show working tree and index state\n- `git log --oneline --graph` — display commit history as a graph\n- `git diff` — show unstaged changes (working tree vs index)\n- `git diff --staged` — show staged changes (index vs HEAD)\n- `git show <commit>` — display a commit's changes and metadata\n- `git restore <file>` — discard working tree changes (replaces checkout --)\n- `git restore --staged <file>` — unstage a file (replaces reset HEAD)",
    "## Remotes and Collaboration\n\nA remote is a named reference to another repository, typically on a server. `origin` is the default remote name after cloning.\n- `git remote -v` — list remotes and their URLs\n- `git fetch <remote>` — download new commits and refs without merging\n- `git pull` — fetch + merge (or fetch + rebase with --rebase)\n- `git push <remote> <branch>` — upload local commits to the remote\n\nRemote-tracking branches (e.g., `origin/main`) are read-only references that update on fetch/pull. They show where the remote's branch pointed last time you communicated. `git branch -vv` shows each local branch's tracking relationship and ahead/behind count.",
    "## Undoing Changes\n\nGit provides multiple levels of undo:\n- **Amend last commit**: `git commit --amend` — replaces the last commit (new SHA); only use before pushing\n- **Unstage files**: `git restore --staged <file>` — moves changes from index back to working tree only\n- **Discard working changes**: `git restore <file>` — reverts file to index state\n- **Revert a commit**: `git revert <commit>` — creates a new commit that undoes the specified commit (safe for shared history)\n- **Reset**: `git reset --soft HEAD~1` (uncommit, keep staged), `--mixed` (uncommit + unstage, keep working tree), `--hard` (discard everything — destructive)\n\nRule of thumb: use `revert` for commits already pushed to shared branches; use `reset` only for local unpushed work.",
    "## .gitignore and Configuration\n\n`.gitignore` lists patterns of files Git should not track (build artifacts, dependencies, secrets). Patterns: `*.log` ignores all .log files, `node_modules/` ignores the directory, `!important.log` negates a pattern. Git processes `.gitignore` files in each directory, with more specific ones overriding less specific. Already-tracked files are not affected by .gitignore — use `git rm --cached <file>` to untrack them.\n\nConfiguration levels: `--system` (/etc/gitconfig), `--global` (~/.gitconfig), `--local` (.git/config). Local overrides global overrides system. Key settings: `user.name`, `user.email`, `core.autocrlf`, `pull.rebase`.",
  ],
  interviewQA: [
    {
      q: "Explain the difference between the working tree, the staging area (index), and HEAD.",
      a: "The working tree is the directory of files you edit on disk. The staging area (index) is a snapshot being assembled for the next commit — git add copies file content into it. HEAD points to the latest commit on the current branch. When you run git status, it compares all three: differences between HEAD and index are 'staged for commit,' differences between index and working tree are 'not staged.' This three-tree model gives you fine-grained control over exactly what goes into each commit.",
      followUps: [
        "What does git diff show vs git diff --staged?",
        "How does git stash interact with these three areas?",
        "What happens internally when you run git add?",
      ],
    },
    {
      q: "What is the difference between git reset and git revert?",
      a: "git reset moves the branch pointer backward, effectively removing commits from the branch history. It is destructive (the commits become unreferenced) and should only be used on unpushed/local work. git revert creates a new commit that undoes the changes of a specified commit — history is preserved and it is safe for shared branches. Use revert on public history, reset on private local history.",
      followUps: [
        "What are the differences between --soft, --mixed, and --hard reset?",
        "Can you recover commits after a hard reset?",
      ],
    },
    {
      q: "What is the difference between git fetch and git pull?",
      a: "git fetch downloads new commits, branches, and tags from the remote repository but does not modify your working tree or local branches — it only updates remote-tracking branches (e.g., origin/main). git pull is a convenience command that runs git fetch followed by git merge (or git rebase if configured). fetch is safer because it lets you review changes before integrating them.",
      followUps: [
        "When would you prefer pull --rebase over a regular pull?",
        "What does git fetch --prune do?",
      ],
    },
    {
      q: "How are commits identified and why does Git use SHA-1 hashes?",
      a: "Every commit is identified by a SHA-1 hash computed from its content: the tree snapshot, parent commit hash(es), author, timestamp, and message. This content-addressing means identical content always produces the same hash, and any modification produces a completely different hash. This provides integrity verification — you can confirm that history has not been tampered with. It also enables deduplication and efficient storage. Git is migrating to SHA-256 for stronger collision resistance.",
    },
  ],
  followUps: [
    "What's the difference between the working tree, the index, and HEAD?",
    "How would you undo a commit that's already pushed?",
    "What does `git reflog` recover, and what can it not?",
  ],
  mcqs: [
    {
      q: "What does `git add` do?",
      options: [
        "Creates a new commit",
        "Copies file content from the working tree to the staging area (index)",
        "Pushes changes to the remote repository",
        "Creates a new branch",
      ],
      answerIndex: 1,
      explanation:
        "git add stages changes by copying the current content of specified files from the working tree into the index. The index then represents what will go into the next commit.",
    },
    {
      q: "Which command creates a new commit that undoes a previous commit without rewriting history?",
      options: [
        "git reset --hard",
        "git revert",
        "git checkout",
        "git restore",
      ],
      answerIndex: 1,
      explanation:
        "git revert creates a new commit with changes that reverse the specified commit. Unlike reset, it preserves history and is safe for shared branches.",
    },
    {
      q: "What does `git diff --staged` show?",
      options: [
        "Differences between working tree and index",
        "Differences between index and HEAD",
        "Differences between two branches",
        "Differences between local and remote",
      ],
      answerIndex: 1,
      explanation:
        "git diff --staged (or --cached) compares the index (staging area) to HEAD, showing exactly what will be included in the next commit.",
    },
    {
      q: "What does HEAD point to in Git?",
      options: [
        "The remote repository",
        "The staging area",
        "The current branch's latest commit (or a specific commit in detached state)",
        "The working directory root",
      ],
      answerIndex: 2,
      explanation:
        "HEAD is a symbolic reference that usually points to the current branch, which in turn points to the latest commit. In detached HEAD state, HEAD points directly to a commit.",
    },
    {
      q: "Which git reset mode keeps changes staged in the index?",
      options: ["--hard", "--mixed", "--soft", "--keep"],
      answerIndex: 2,
      explanation:
        "git reset --soft moves HEAD but leaves the index and working tree unchanged, so the 'removed' commit's changes remain staged and ready to recommit.",
    },
  ],
  flashcards: [
    {
      front: "What is the staging area (index)?",
      back: "A file at .git/index that records the snapshot being prepared for the next commit. git add copies content into it; git commit creates a commit from it.",
    },
    {
      front: "What is a detached HEAD state?",
      back: "When HEAD points directly to a commit instead of a branch name. Commits made in this state are not on any branch and may be lost if you switch away without creating a branch.",
    },
    {
      front: "What does git stash do?",
      back: "Saves uncommitted changes (staged and unstaged) to a stack and restores the working tree to HEAD. Use git stash pop to reapply them later.",
    },
    {
      front: "What is a fast-forward in Git?",
      back: "When the target branch has not diverged from the source, Git simply moves the branch pointer forward to the latest commit — no merge commit is created.",
    },
    {
      front: "How do you see which remote a local branch tracks?",
      back: "git branch -vv — shows each local branch, its tracking remote branch, and how many commits it is ahead/behind.",
    },
    {
      front: "What does git log --oneline --graph show?",
      back: "A compact commit history with abbreviated SHAs, one commit per line, and ASCII art showing the branch/merge structure of the DAG.",
    },
    {
      front: "What is the difference between author and committer in Git?",
      back: "The author is who originally wrote the change; the committer is who applied it. They differ when patches are emailed (git format-patch/am) or commits are rebased/cherry-picked.",
    },
    {
      front: "What does git rm --cached <file> do?",
      back: "Removes the file from the index (stops tracking it) without deleting it from the working tree. Useful for files that were accidentally committed before being added to .gitignore.",
    },
  ],
  deepDive: [
    "## Git's Internal Object Model\n\nAt its core, Git is a **content-addressable filesystem** — every piece of data is stored as an *object* identified by a **SHA-1 hash** of its contents. There are four object types: **blob** (file content without metadata), **tree** (a directory listing mapping filenames to blob or tree SHAs), **commit** (a snapshot pointing to a tree, parent commit(s), author, committer, and message), and **tag** (a named reference to another object, typically a commit). When you run `git add`, Git compresses the file content into a *blob object* in `.git/objects/`. When you `git commit`, Git creates a *tree object* capturing the index state and a *commit object* referencing that tree. Because objects are immutable and content-addressed, identical content is stored exactly once — this is how Git achieves both **deduplication** and **integrity verification**. You can inspect any object with `git cat-file -p <sha>` to see its raw content.",

    "## Merge Strategies and Conflict Resolution\n\nGit supports multiple **merge strategies**, each suited to different scenarios. The default **recursive** strategy (now called `ort` in modern Git) handles most two-branch merges by finding the *best common ancestor* and performing a three-way merge. When the same lines are modified in both branches, Git marks the file with **conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`) and halts the merge for manual resolution. The **fast-forward** strategy applies when the target branch has not diverged — Git simply moves the branch pointer forward without creating a merge commit, keeping history linear. You can force a merge commit even in fast-forward cases with `git merge --no-ff`, which is useful for preserving *feature branch topology* in the history graph. For complex merges involving more than two branches, Git provides the **octopus** strategy. Understanding these strategies helps you choose between `git merge` (preserves branch history, creates merge commits) and `git rebase` (replays commits on top of the target, producing a *linear history* at the cost of rewriting commit SHAs).",

    "## Reflog, Garbage Collection, and Data Recovery\n\nOne of Git's most powerful safety nets is the **reflog** — a local log recording every change to `HEAD` and branch tips, retained for **90 days** by default. Even after a destructive `git reset --hard` or a botched `git rebase`, the \"lost\" commits still exist as *unreachable objects* in the repository. Running `git reflog` shows the history of HEAD movements, and you can recover any previous state with `git checkout <reflog-entry>` or `git reset --hard <sha>`. Git periodically runs **garbage collection** (`git gc`) to compress objects into *packfiles* and remove unreachable objects older than the reflog retention period. You can trigger it manually with `git gc --prune=now`, but be aware this permanently removes unreachable objects. The combination of content-addressed storage, the reflog, and deferred garbage collection means that Git is remarkably forgiving — **data loss requires deliberate effort**, not accidental commands.",
  ],

  code: [
    {
      language: "bash",
      caption: "Essential Git workflow: init, stage, commit, branch, merge",
      source: `# Initialize a new repository
git init my-project && cd my-project

# Configure identity for this repo
git config user.name "Dev User"
git config user.email "dev@example.com"

# Create initial files and make the first commit
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit: add README"

# Create and switch to a feature branch
git checkout -b feature/add-login

# Make changes and commit
echo "login() { ... }" > auth.cpp
git add auth.cpp
git commit -m "Add login function skeleton"

# Switch back to main and merge
git checkout main
git merge feature/add-login

# View the commit graph
git log --oneline --graph --all

# Push to remote
git remote add origin https://github.com/user/my-project.git
git push -u origin main`,
    },
    {
      language: "bash",
      caption: "C++ project Git workflow: branching, .gitignore, tagging a release",
      source: `# Clone an existing C++ project
git clone https://github.com/team/cpp-engine.git
cd cpp-engine

# Set up .gitignore for C++ build artifacts
cat > .gitignore << 'EOF'
# Build output
build/
*.o
*.obj
*.exe
*.out
*.a
*.so
*.dylib

# IDE files
.vscode/
.idea/
*.swp
CMakeCache.txt
CMakeFiles/
EOF

git add .gitignore
git commit -m "Add .gitignore for C++ build artifacts"

# Create a feature branch for a new rendering module
git checkout -b feature/renderer

# Develop iteratively with granular commits
echo "#include \\"renderer.h\\"" > src/renderer.cpp
echo "#pragma once" > include/renderer.h
git add src/renderer.cpp include/renderer.h
git commit -m "Add renderer module skeleton"

# Build and test (not tracked by git)
mkdir -p build && cd build
cmake .. && make -j\$(nproc)
cd ..

# Interactive staging: review and stage hunks selectively
git add -p src/renderer.cpp

# Rebase onto latest main before merging
git fetch origin
git rebase origin/main

# Merge with a merge commit for clear history
git checkout main
git merge --no-ff feature/renderer -m "Merge feature/renderer: add rendering module"

# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0: renderer module"
git push origin main --tags`,
    },
    {
      language: "bash",
      caption: "Undoing mistakes and data recovery with reflog",
      source: `# Oops: committed to the wrong branch
# Step 1: Note the commit SHA
git log --oneline -1
# e.g., output: a1b2c3d Fix: correct buffer overflow

# Step 2: Undo the commit but keep changes staged
git reset --soft HEAD~1

# Step 3: Stash the changes and switch branches
git stash
git checkout feature/bugfix
git stash pop
git commit -m "Fix: correct buffer overflow"

# Recovering from a hard reset using reflog
git reset --hard HEAD~3   # Accidentally wiped 3 commits!
git reflog                # Find the lost commit SHA
# e.g., output: a1b2c3d HEAD@{1}: commit: important work
git reset --hard a1b2c3d  # Restore to that point

# Reverting a pushed commit safely
git revert abc1234 --no-edit
git push origin main

# Cherry-pick a specific commit from another branch
git cherry-pick def5678`,
    },
  ],

  diagrams: [
    {
      title: "Git Object Model",
      kind: "architecture",
      caption: "How Git stores content as a graph of blob, tree, and commit objects.",
      mermaid: `graph TD
    C2[Commit HEAD] --> T2[Tree root]
    C2 --> C1[Commit parent]
    C1 --> T1[Tree root prev]
    T2 --> B1[Blob file1.txt]
    T2 --> B2[Blob file2.txt]
    T2 --> ST[Subtree src]
    ST --> B3[Blob main.js]
    T1 --> B1`,
    },
    {
      title: "Git Branch Workflow",
      kind: "flow",
      caption: "Typical feature branch workflow from creation to merge.",
      mermaid: `flowchart TD
    A[Start on main] --> B[git checkout -b feature]
    B --> C[Make changes]
    C --> D[git add and commit]
    D --> E{More changes?}
    E -- Yes --> C
    E -- No --> F[git push origin feature]
    F --> G[Open Pull Request]
    G --> H{Review passed?}
    H -- No --> C
    H -- Yes --> I[Merge to main]
    I --> J[Delete feature branch]`,
    },
    {
      title: "Git File State Transitions",
      kind: "state",
      caption: "How files transition between working directory, staging area, and repository.",
      mermaid: `stateDiagram-v2
    [*] --> Untracked: new file created
    Untracked --> Staged: git add
    Staged --> Committed: git commit
    Committed --> Modified: edit file
    Modified --> Staged: git add
    Staged --> Modified: git restore --staged
    Committed --> Untracked: git rm`,
    },
    {
      title: "Merge vs Rebase Strategy",
      kind: "sequence",
      caption: "Comparing merge and rebase for integrating branch changes.",
      mermaid: `sequenceDiagram
    participant Main
    participant Feature
    Note over Main,Feature: Branches diverged
    Main->>Main: Commit M1
    Feature->>Feature: Commit F1
    Feature->>Feature: Commit F2
    Note over Main: Merge creates merge commit
    Feature->>Main: Merge F1 and F2
    Main->>Main: Merge commit
    Note over Feature: Rebase replays commits linearly
    Feature->>Feature: Rebase F1 onto M1
    Feature->>Feature: Rebase F2 onto rebased F1`,
    },
  ],

  animations: [
    {
      title: "Working tree, index, HEAD",
      steps: [
        {
          label: "Edit a file",
          detail: "The change exists only in the working tree. `git status` shows it as unstaged.",
        },
        {
          label: "`git add`",
          detail: "A snapshot of that file is copied into the index (staging area) — a proposed next commit.",
        },
        {
          label: "Edit again",
          detail: "Now the file differs from both the index and HEAD. Committing captures the staged version, not the newest edit.",
        },
        {
          label: "`git commit`",
          detail: "The index becomes a commit object; HEAD moves to it.",
        },
        {
          label: "Undoing",
          detail: "`git restore --staged` unstages; `git restore` discards working-tree changes; `git reset` moves HEAD.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "**Git**", "**SVN (Subversion)**", "**Mercurial (Hg)**"],
    rows: [
      ["Architecture", "*Distributed* — full repo clone", "*Centralized* — single server", "*Distributed* — full repo clone"],
      ["Branching", "Lightweight pointer; `git branch` is instant", "Directory copy; expensive on large repos", "Named branches or bookmarks; heavier than Git"],
      ["Speed", "Very fast (local operations)", "Slower (server round-trips for log, diff)", "Fast (comparable to Git for most operations)"],
      ["Staging area", "Yes — explicit `git add` to index", "No — commits track working copy directly", "No — uses `hg record` for partial commits"],
      ["History rewriting", "`rebase`, `amend`, `filter-branch`", "Not supported (history is immutable)", "Limited (`hg histedit`, evolve extension)"],
      ["Learning curve", "Steeper (many concepts and commands)", "Simpler (linear workflow)", "Moderate (simpler than Git, fewer footguns)"],
      ["Merge handling", "Recursive/ort strategy; excellent", "Three-way merge; adequate", "Good; premerge and internal:merge"],
      ["Ecosystem", "Dominant: GitHub, GitLab, Bitbucket", "Apache; legacy enterprise use", "Smaller community; used by some large projects"],
    ],
  },

  exercises: [
    "**Repository Archaeology**: Clone any open-source repository and use `git log --oneline --graph --all` to visualize the commit graph. Identify at least one *merge commit*, one *fast-forward merge*, and a *branch point*. Use `git show <sha>` to inspect the merge commit's two parents.",
    "**Conflict Resolution Lab**: Create a repo with a file `config.txt`. Make two branches (`branch-a` and `branch-b`) that both modify the **same line** of `config.txt`. Merge `branch-a` into `main`, then attempt to merge `branch-b`. Resolve the resulting conflict, examining the `<<<<<<<`, `=======`, `>>>>>>>` markers, and complete the merge with `git add` and `git commit`.",
    "**Reflog Rescue Mission**: Create a series of 5 commits, then run `git reset --hard HEAD~3` to \"lose\" three commits. Use `git reflog` to find the lost commits and restore them with `git reset --hard <sha>`. Verify the full history is back with `git log --oneline`.",
    "**C++ Build Artifact Hygiene**: Set up a C++ project with a `CMakeLists.txt`, create a proper `.gitignore` that excludes `build/`, `*.o`, and IDE files. Accidentally `git add build/main.o`, then fix it using `git rm --cached build/main.o`. Verify with `git status` that the file is untracked but still on disk.",
    "**Interactive Rebase Practice**: Create a feature branch with 5 commits including one typo-fix commit and one \"WIP\" commit. Use `git rebase -i HEAD~5` to *squash* the typo fix into the relevant commit, *reword* a poorly written message, and *drop* the WIP commit. Push the cleaned-up branch and compare the before/after history.",
  ],

  cheatSheet: [
    "`git init` / `git clone <url>` — Create a new repo or copy an existing one with full history",
    "`git add <files>` / `git add -p` — Stage all changes in files, or **interactively select hunks** to stage",
    "`git commit -m \"msg\"` / `git commit --amend` — Create a commit, or **rewrite the last commit** (pre-push only)",
    "`git branch <name>` / `git checkout -b <name>` — Create a branch / create **and** switch to it in one command",
    "`git merge <branch>` / `git rebase <branch>` — Integrate changes: merge preserves topology, rebase linearizes history",
    "`git stash` / `git stash pop` — **Shelve** uncommitted changes temporarily and restore them later",
    "`git log --oneline --graph --all` — Compact visual history of **all branches** as an ASCII DAG",
    "`git reflog` — Show the local history of HEAD movements — your **safety net** for recovering lost commits",
  ],

  revisionNotes: [
    "Git's **three-tree model** (working tree, index, HEAD) is the foundation of everything — `git status` compares all three, `git add` moves data from working tree to index, `git commit` moves index to a new commit under HEAD.",
    "**Commits are immutable snapshots**, not diffs. Each commit stores a full tree object referencing all files. Git computes diffs on the fly. Commits form a *DAG* (directed acyclic graph) via parent pointers.",
    "**Merge vs. Rebase**: `git merge` creates a merge commit preserving branch topology (non-linear history). `git rebase` replays commits on top of the target branch for *linear history* but rewrites SHAs — never rebase commits already pushed to shared branches.",
    "**Undoing work safely**: Use `git revert` for public/pushed commits (creates an inverse commit). Use `git reset` for local/unpushed commits (`--soft` keeps staged, `--mixed` unstages, `--hard` discards all). The **reflog** retains every HEAD movement for 90 days — your escape hatch after mistakes.",
    "**Remote workflow**: `git fetch` downloads without modifying your branches (safe). `git pull` = fetch + merge (or rebase). Always `git fetch` + inspect before integrating. Remote-tracking branches (`origin/main`) are updated on fetch and are read-only locally.",
  ],

  resources: [
    {
      label: "Pro Git — Chacon & Straub (free online)",
      kind: "book",
    },
    {
      label: "Git reference documentation",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "Working tree",
      definition:
        "The directory of actual files on disk that you edit. Represents the current state of the project outside of Git's internal storage.",
    },
    {
      term: "Staging area (index)",
      definition:
        "An intermediate area (.git/index) where changes are collected before being committed. git add moves changes into the index.",
    },
    {
      term: "HEAD",
      definition:
        "A symbolic reference pointing to the current branch (which points to the latest commit), or directly to a commit in detached HEAD state.",
    },
    {
      term: "SHA-1 hash",
      definition:
        "A 40-character hexadecimal string uniquely identifying each Git object (commit, tree, blob, tag), computed from its content.",
    },
    {
      term: "Remote",
      definition:
        "A named reference to another Git repository (typically on a server). 'origin' is the default name for the repository you cloned from.",
    },
    {
      term: "DAG",
      definition:
        "Directed Acyclic Graph — the data structure formed by Git commits, where each commit points to its parent(s) and no cycles exist.",
    },
    {
      term: ".gitignore",
      definition:
        "A file specifying patterns of files that Git should not track. Applies to untracked files only — already-tracked files are unaffected.",
    },
    {
      term: "Remote-tracking branch",
      definition:
        "A read-only local reference (e.g., origin/main) that records where a remote branch pointed the last time you fetched from that remote.",
    },
  ],
};
