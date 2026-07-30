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
