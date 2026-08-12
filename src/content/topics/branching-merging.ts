import type { TopicContent } from "../types";

export const branchingMerging: TopicContent = {
  quickSummary: [
    "A Git branch is a lightweight movable pointer to a commit — creating a branch is instantaneous (just writing a 40-byte SHA to a file), making branches cheap and central to Git workflows.",
    "A fast-forward merge occurs when the target branch has no new commits since the source branched off — Git simply moves the pointer forward with no merge commit.",
    "A three-way merge combines two diverged branches by finding their common ancestor and creating a merge commit with two parents, preserving the full history of both branches.",
    "Merge conflicts arise when both branches modify the same lines in the same file; Git marks the conflicts with <<<<<<<, =======, and >>>>>>> markers for manual resolution.",
    "Git Flow uses long-lived develop and main branches with feature, release, and hotfix branches; trunk-based development keeps all work on main with short-lived feature branches.",
  ],
  detailed: [
    "## Branches as Pointers\n\nA branch in Git is simply a file in `.git/refs/heads/` containing the SHA-1 of the commit it points to. Creating a branch (`git branch feature`) writes one 40-byte file — no data is copied. `git checkout feature` (or `git switch feature`) updates HEAD to point to the new branch and adjusts the working tree. Because branches are so cheap, Git encourages branching for every feature, bug fix, or experiment.\n\nThe `git branch` command lists branches; `git branch -d <name>` deletes a merged branch (the commits remain in the DAG and are eventually garbage-collected only if unreachable). `git branch -m old new` renames a branch.",
    "## Fast-Forward Merge\n\nWhen you merge branch B into branch A, and A has had no new commits since B was created, the histories have not diverged. Git performs a fast-forward: it simply moves A's pointer to B's latest commit. No merge commit is created and the history remains linear.\n\n```\nBefore:  A---B---C (main)\n                  \\\n                   D---E (feature)\n\nAfter ff merge:  A---B---C---D---E (main, feature)\n```\n\nUse `git merge --no-ff feature` to force a merge commit even when fast-forward is possible, preserving the fact that work happened on a branch. This is common in Git Flow to maintain a clear record of feature integrations.",
    "## Three-Way Merge\n\nWhen both branches have new commits since their divergence point, Git performs a three-way merge. It identifies the merge base (common ancestor), compares both branches against it, and combines the changes into a new merge commit with two parents.\n\n```\nBefore:  A---B---C---F (main)\n                  \\\n                   D---E (feature)\n\nAfter:   A---B---C---F---G (main)\n                  \\       /\n                   D---E (feature)\n```\n\nThe merge commit G has two parents: F and E. This preserves the topology of parallel development. Git's merge algorithm handles non-overlapping changes automatically — only conflicting edits require manual intervention.",
    "## Merge Conflicts and Resolution\n\nConflicts occur when both branches modify the same lines in the same file, or when one branch deletes a file the other modifies. Git inserts conflict markers:\n\n```\n<<<<<<< HEAD\ncurrent branch content\n=======\nincoming branch content\n>>>>>>> feature\n```\n\nResolution workflow: (1) `git status` shows conflicted files, (2) open each file and edit to the desired result removing all markers, (3) `git add <file>` to mark as resolved, (4) `git commit` to complete the merge. Tools: `git mergetool` launches a visual diff tool, `git merge --abort` cancels the merge entirely.\n\nTips to reduce conflicts: merge frequently (small deltas), communicate about shared files, use consistent code formatting, and split large changes into smaller PRs.",
    "## Branching Strategies: Git Flow\n\nGit Flow defines a structured branching model:\n- **main** — production-ready code; every commit is a release\n- **develop** — integration branch for features\n- **feature/** — branched from develop, merged back via PR\n- **release/** — branched from develop for release prep (version bumps, final fixes), merged to both main and develop\n- **hotfix/** — branched from main for urgent production fixes, merged to both main and develop\n\nPros: clear separation of concerns, supports parallel releases. Cons: complex, many long-lived branches, slow integration, merge overhead. Best suited for software with scheduled releases and multiple supported versions.",
    "## Branching Strategies: Trunk-Based Development\n\nTrunk-based development keeps the mainline (main/trunk) always releasable:\n- Developers commit directly to main or merge short-lived feature branches (< 2 days)\n- Feature flags hide incomplete work in production\n- Continuous integration runs on every push\n- Releases are cut from main via tags or release branches that live only for stabilization\n\nPros: fast integration, fewer merge conflicts, simpler branch model, enables continuous delivery. Cons: requires mature CI/CD, feature flags add complexity, discipline needed to keep main green. Favored by high-performing engineering organizations (Google, Meta) and aligns with DORA metrics research showing trunk-based correlates with elite delivery performance.",
  ],
  animations: [
    {
      title: "Why a long-lived branch hurts",
      steps: [
        {
          label: "Branch created",
          detail: "Diverges from main. Zero conflicts on day one.",
        },
        {
          label: "Two weeks pass",
          detail: "Main receives 80 commits, some touching the same files.",
        },
        {
          label: "Merge attempted",
          detail: "Conflicts across many files, in code the author may not have written.",
        },
        {
          label: "Compounding",
          detail: "Resolving them requires understanding both sides' intent — and mistakes here silently reintroduce bugs.",
        },
        {
          label: "Short-lived branches",
          detail: "Merged within a day or two, conflicts are small and the context is fresh.",
        },
        {
          label: "Feature flags",
          detail: "Let you merge incomplete work safely, so the branch doesn't need to live long.",
        },
      ],
    },
  ],
  interviewQA: [
    {
      q: "What is the difference between a fast-forward merge and a three-way merge?",
      a: "A fast-forward merge happens when the target branch has no new commits since the source branched off — Git simply advances the branch pointer, creating no merge commit and maintaining a linear history. A three-way merge is required when both branches have diverged with new commits. Git finds the common ancestor (merge base), compares both branches against it, combines non-conflicting changes, and creates a merge commit with two parents. Use --no-ff to force a merge commit even when fast-forward is possible.",
      followUps: [
        "When would you choose --no-ff over a fast-forward?",
        "How does Git determine the merge base?",
        "What is an octopus merge?",
      ],
    },
    {
      q: "Compare Git Flow and trunk-based development. When would you choose each?",
      a: "Git Flow uses long-lived branches (main, develop, feature, release, hotfix) with formal merge ceremonies. It suits teams with scheduled releases, multiple supported versions, or strict release management. Trunk-based development has everyone working on main (or very short-lived branches), relying on CI/CD and feature flags. It suits teams practicing continuous delivery who want fast integration and fewer merge conflicts. Research (DORA/Accelerate) shows trunk-based correlates with higher software delivery performance.",
      followUps: [
        "How do feature flags work in trunk-based development?",
        "What is GitHub Flow and how does it differ from Git Flow?",
      ],
    },
    {
      q: "How do you resolve a merge conflict in Git?",
      a: "When a merge produces conflicts, Git marks the affected files with <<<<<<< / ======= / >>>>>>> markers showing both versions. Steps: (1) run git status to see which files are conflicted (listed as 'both modified'), (2) open each file and edit to the correct final content, removing all conflict markers, (3) git add each resolved file to mark it resolved in the index, (4) git commit to finalize the merge. You can also use git mergetool for a visual diff, or git merge --abort to cancel the entire merge and return to the pre-merge state.",
      followUps: [
        "What strategies reduce the frequency of merge conflicts?",
        "What is rerere and how does it help with repeated conflicts?",
      ],
    },
  ],
  followUps: [
    "Trunk-based or GitFlow — what does team size and release cadence change?",
    "How do you resolve a conflict you don't understand?",
    "Why do long-lived branches make merges disproportionately painful?",
  ],
  mcqs: [
    {
      q: "When does Git perform a fast-forward merge?",
      options: [
        "When both branches have diverged",
        "When the target branch has no new commits since the source branched off",
        "When there are merge conflicts",
        "When using the --squash flag",
      ],
      answerIndex: 1,
      explanation:
        "A fast-forward occurs when the current branch can simply move its pointer forward to the incoming branch's latest commit because there is a direct linear path between them.",
    },
    {
      q: "What does `git merge --no-ff feature` do differently from a regular merge?",
      options: [
        "It rebases instead of merging",
        "It forces a merge commit even when fast-forward is possible",
        "It squashes all commits into one",
        "It deletes the feature branch after merging",
      ],
      answerIndex: 1,
      explanation:
        "--no-ff (no fast-forward) always creates a merge commit, preserving the fact that work happened on a separate branch even when the history is linear.",
    },
    {
      q: "In Git Flow, which branch do feature branches merge into?",
      options: ["main", "develop", "release", "hotfix"],
      answerIndex: 1,
      explanation:
        "In Git Flow, feature branches are created from develop and merged back into develop. Only release and hotfix branches merge into main.",
    },
    {
      q: "What command cancels an in-progress merge?",
      options: [
        "git merge --cancel",
        "git merge --abort",
        "git reset --merge",
        "git revert merge",
      ],
      answerIndex: 1,
      explanation:
        "git merge --abort aborts the merge process and restores the state to before the merge began, including the working tree and index.",
    },
    {
      q: "How many parents does a merge commit have?",
      options: ["Zero", "One", "Two (or more)", "Exactly three"],
      answerIndex: 2,
      explanation:
        "A standard merge commit has two parents — the tips of the two branches being merged. Octopus merges can have more than two parents.",
    },
  ],
  flashcards: [
    {
      front: "What is a branch in Git internally?",
      back: "A branch is a lightweight pointer — a file in .git/refs/heads/ containing the 40-character SHA-1 of the commit it points to. Creating a branch is just creating this file.",
    },
    {
      front: "What is a merge base?",
      back: "The common ancestor commit of two branches — the most recent commit reachable from both. Git uses it as the reference point in a three-way merge to determine what changed on each side.",
    },
    {
      front: "What does git switch do?",
      back: "Switches the current branch (updates HEAD and the working tree). Introduced in Git 2.23 as a clearer alternative to git checkout for branch switching.",
    },
    {
      front: "What is an octopus merge?",
      back: "A merge with more than two parents — merging multiple branches simultaneously. Git supports this natively. Used rarely, mostly for combining several independent feature branches at once.",
    },
    {
      front: "What is git rerere?",
      back: "Reuse Recorded Resolution — Git records how you resolved a conflict and automatically applies the same resolution if the same conflict recurs. Enable with git config rerere.enabled true.",
    },
    {
      front: "What is the difference between git branch -d and git branch -D?",
      back: "-d deletes a branch only if it has been fully merged into the current branch (safe delete). -D force-deletes the branch regardless of merge status.",
    },
    {
      front: "What is GitHub Flow?",
      back: "A simplified branching model: main is always deployable, feature branches are created from main, pull requests enable code review, and branches are merged back to main and deployed immediately.",
    },
    {
      front: "What are DORA metrics?",
      back: "Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service. Research shows trunk-based development correlates with elite performance on these metrics.",
    },
  ],
  resources: [
    {
      label: "Pro Git — Chacon & Straub (free online)",
      kind: "book",
    },
    {
      label: "Trunk Based Development — trunkbaseddevelopment.com",
      kind: "article",
    },
  ],
  glossary: [
    {
      term: "Branch",
      definition:
        "A movable pointer to a commit, stored as a 40-byte file in .git/refs/heads/. Enables parallel lines of development.",
    },
    {
      term: "Fast-forward merge",
      definition:
        "A merge where the branch pointer simply advances to the incoming commit because no divergence has occurred. Produces no merge commit.",
    },
    {
      term: "Three-way merge",
      definition:
        "A merge that uses the common ancestor (merge base) and both branch tips to combine diverged histories, producing a merge commit with two parents.",
    },
    {
      term: "Merge conflict",
      definition:
        "A situation where both branches modify the same lines in the same file, requiring manual resolution by the developer.",
    },
    {
      term: "Git Flow",
      definition:
        "A branching model using long-lived main and develop branches with feature, release, and hotfix branches for structured release management.",
    },
    {
      term: "Trunk-based development",
      definition:
        "A branching strategy where developers integrate into a single main branch frequently, using short-lived branches and feature flags.",
    },
    {
      term: "Feature flag",
      definition:
        "A conditional toggle in code that enables or disables functionality at runtime, allowing incomplete features to be merged to main without being visible to users.",
    },
    {
      term: "Merge base",
      definition:
        "The most recent common ancestor commit of two branches, used as the reference point for three-way merge comparison.",
    },
  ],

  deepDive: [
    "## How Git Stores Branches Internally\n\nUnder the hood, a Git branch is nothing more than a **40-byte file** stored in `.git/refs/heads/`. When you run `git branch feature-login`, Git creates the file `.git/refs/heads/feature-login` containing the SHA-1 hash of the current commit. The special ref `HEAD` (stored in `.git/HEAD`) is typically a *symbolic reference* pointing to the current branch — e.g., `ref: refs/heads/main`. When you commit, Git updates the branch file that HEAD points to with the new commit's SHA.\n\nThis design has profound implications:\n- Branch creation is **O(1)** — no file copying, no snapshots, just one file write\n- Switching branches (`git switch`) updates HEAD and adjusts the working tree via the index\n- Deleting a branch removes the pointer file; the commits remain in the object database until `git gc` prunes unreachable objects (default: 2 weeks via `gc.pruneExpire`)\n- **Packed refs**: for performance, Git periodically packs loose ref files into `.git/packed-refs`, a single file with one line per ref",

    "## Merge Algorithms in Depth\n\nGit's default merge strategy is **ort** (Ostensibly Recursive's Twin, replacing the older *recursive* strategy in Git 2.34+). The algorithm works as follows:\n\n1. **Find the merge base**: Git walks the commit DAG to find the *lowest common ancestor* (LCA) of the two branch tips. If multiple LCAs exist (criss-cross merges), ort recursively merges them to produce a virtual merge base.\n2. **Three-way diff**: Git diffs both branch tips against the merge base. Changes that appear on only one side are applied cleanly. Changes on both sides to *different* regions of the same file are combined.\n3. **Conflict detection**: When both sides modify the *same lines*, Git cannot auto-resolve and writes conflict markers.\n\nOther strategies include:\n- `resolve` — simpler, single merge base, faster but less capable\n- `octopus` — merges more than two branches simultaneously (used by `git merge A B C`); aborts if conflicts arise\n- `ours` — keeps the current branch's tree entirely, discarding the other branch's changes (useful for recording that a merge happened without taking changes)\n- `subtree` — adjusts one tree to match the other's structure before merging, useful for project subdirectory merges",

    "## Rebase vs. Merge: Trade-offs\n\n**Rebasing** (`git rebase main`) replays your branch's commits on top of the target branch, rewriting commit SHAs to produce a *linear* history. **Merging** preserves the original commit graph with an explicit merge commit.\n\n| Aspect | Merge | Rebase |\n|--------|-------|--------|\n| History | Preserves true topology | Linear, cleaner `git log` |\n| Commit SHAs | Unchanged | Rewritten (new SHAs) |\n| Conflict resolution | Once, at merge time | Per-commit during rebase |\n| Safety | Safe for shared branches | **Never rebase published/shared commits** |\n| Bisect friendliness | Merge commits can confuse bisect | Linear history is bisect-friendly |\n\nA common workflow combines both: *rebase locally* to clean up feature branch history, then *merge with --no-ff* into the integration branch to preserve the feature boundary. Interactive rebase (`git rebase -i`) lets you squash, reorder, edit, or drop commits before merging — essential for crafting a clean, reviewable history.",

    "## Advanced Conflict Resolution Techniques\n\nBeyond basic marker editing, Git provides powerful conflict resolution tools:\n\n- **`git rerere`** (Reuse Recorded Resolution): Enable with `git config --global rerere.enabled true`. Git records how you resolve each conflict and automatically applies the same resolution if the identical conflict recurs — invaluable during long-running rebases or repeated merges.\n- **`git checkout --ours <file>` / `git checkout --theirs <file>`**: Accept one side entirely for a conflicted file. Combine with `git checkout --conflict=merge <file>` to re-create conflict markers if you need to start over.\n- **Merge strategies with options**: `git merge -X theirs feature` auto-resolves conflicts by favoring the incoming branch. Similarly, `-X ours` favors the current branch. These are *strategy options*, not the `ours` strategy.\n- **`git diff --cc`**: Shows a combined diff for merge conflicts, helping you understand what both sides changed relative to the base.\n- **Binary file conflicts**: Git cannot merge binaries. Use `git checkout --ours/--theirs` or configure a custom merge driver in `.gitattributes` (e.g., for `*.pbxproj` files in Xcode projects or `*.vcxproj` in C++ Visual Studio projects).",
  ],

  code: [
    {
      language: "bash",
      caption: "Creating, switching, and managing branches",
      source: `# Create a new branch from current HEAD
git branch feature/add-parser

# Create and switch to the branch in one command
git switch -c feature/add-parser

# List all branches (local and remote)
git branch -a

# Rename a branch
git branch -m old-name new-name

# Delete a fully merged branch
git branch -d feature/add-parser

# Force-delete an unmerged branch (use with caution)
git branch -D experimental-refactor

# See which branches contain a specific commit
git branch --contains abc1234`,
    },
    {
      language: "bash",
      caption: "Merging strategies and options",
      source: `# Fast-forward merge (default when possible)
git switch main
git merge feature/add-parser

# Force a merge commit even when ff is possible
git merge --no-ff feature/add-parser

# Squash all feature commits into a single staged change
git merge --squash feature/add-parser
git commit -m "Add parser module"

# Merge with automatic conflict resolution favoring incoming changes
git merge -X theirs feature/add-parser

# Abort a conflicted merge and return to pre-merge state
git merge --abort

# Octopus merge: combine multiple branches at once
git merge feature/lexer feature/parser feature/codegen`,
    },
    {
      language: "bash",
      caption: "Resolving merge conflicts step by step",
      source: `# 1. Start the merge (conflicts arise)
git merge feature/refactor-engine
# CONFLICT (content): Merge conflict in src/engine.cpp

# 2. See which files are conflicted
git status
# both modified: src/engine.cpp

# 3. Open the file, resolve markers, then stage
# (edit src/engine.cpp to remove <<<<<<< / ======= / >>>>>>>)
git add src/engine.cpp

# 4. Complete the merge
git commit

# Alternative: use a visual merge tool
git mergetool

# Alternative: accept one side entirely
git checkout --theirs src/engine.cpp
git add src/engine.cpp

# Enable rerere to auto-resolve recurring conflicts
git config --global rerere.enabled true`,
    },
    {
      language: "bash",
      caption: "Rebasing a feature branch onto main",
      source: `# Rebase feature branch onto latest main
git switch feature/optimize-allocator
git rebase main

# If conflicts arise during rebase, resolve and continue
git add src/allocator.cpp
git rebase --continue

# Abort the rebase entirely
git rebase --abort

# Interactive rebase: squash, reorder, edit last 5 commits
git rebase -i HEAD~5
# In the editor, change 'pick' to 'squash' for commits to combine

# After rebasing, force-push to update a remote feature branch
# (only do this on branches YOU own, never on shared branches)
git push --force-with-lease origin feature/optimize-allocator`,
    },
    {
      language: "cpp",
      caption: "C++ example: feature flag pattern for trunk-based development",
      source: `// feature_flags.h — compile-time and runtime feature toggles
#pragma once
#include <string>
#include <unordered_map>

// Compile-time flags (set via CMake: -DENABLE_NEW_PARSER=ON)
#ifndef ENABLE_NEW_PARSER
#define ENABLE_NEW_PARSER 0
#endif

// Runtime feature flag registry
class FeatureFlags {
public:
    static FeatureFlags& instance() {
        static FeatureFlags flags;
        return flags;
    }

    void setFlag(const std::string& name, bool enabled) {
        flags_[name] = enabled;
    }

    bool isEnabled(const std::string& name) const {
        auto it = flags_.find(name);
        return it != flags_.end() && it->second;
    }

private:
    std::unordered_map<std::string, bool> flags_;
};

// Usage in application code:
// if (FeatureFlags::instance().isEnabled("new_allocator")) {
//     return newAllocator.allocate(size);
// } else {
//     return legacyAllocator.allocate(size);
// }`,
    },
  ],

  diagrams: [
    {
      title: "Git Flow Branching Model",
      kind: "architecture",
      caption: "The standard Git Flow topology: main, develop, feature, release, and hotfix branches and their merge directions.",
      mermaid: `graph TD
    main["main - production"]
    develop["develop - integration"]
    feature["feature branches"]
    release["release branches"]
    hotfix["hotfix branches"]
    develop --> feature
    feature -->|merge back| develop
    develop --> release
    release -->|merge| main
    release -->|merge| develop
    main --> hotfix
    hotfix -->|merge| main
    hotfix -->|merge| develop`,
    },
    {
      title: "Merge Conflict Resolution Flow",
      kind: "flow",
      caption: "Decision flow for detecting and resolving merge conflicts step by step.",
      mermaid: `flowchart TD
    A([git merge feature]) --> B{Conflicts?}
    B -->|No| C([Merge complete])
    B -->|Yes| D[git status - find conflicted files]
    D --> E[Open file and resolve markers]
    E --> F{Method?}
    F -->|Manual edit| G[Edit file and remove markers]
    F -->|Accept ours| H[git checkout --ours file]
    F -->|Accept theirs| I[git checkout --theirs file]
    G --> J[git add resolved file]
    H --> J
    I --> J
    J --> K{More conflicts?}
    K -->|Yes| E
    K -->|No| L[git commit]
    L --> C`,
    },
    {
      title: "Rebase vs Merge Sequence",
      kind: "sequence",
      caption: "How merge creates a merge commit with two parents, while rebase replays commits to produce a linear history.",
      mermaid: `sequenceDiagram
    participant main
    participant feature
    main->>main: commit C3
    feature->>feature: commit C4
    feature->>feature: commit C5
    Note over main,feature: Merge path
    feature->>main: git merge feature
    main->>main: merge commit M1 with parents C3 and C5
    Note over main,feature: Rebase path
    feature->>feature: git rebase main
    Note over feature: C4 and C5 replayed as C4-prime and C5-prime
    feature->>main: git merge feature - fast forward
    Note over main: Linear history C3 then C4-prime then C5-prime`,
    },
    {
      title: "Branch Lifecycle State Machine",
      kind: "state",
      caption: "States a branch passes through from creation to deletion in a typical Git workflow.",
      mermaid: `stateDiagram-v2
    [*] --> Created : git switch -c branch
    Created --> Active : first commit
    Active --> Active : more commits
    Active --> OpenPR : push and open pull request
    OpenPR --> UnderReview : reviewer assigned
    UnderReview --> Active : changes requested
    UnderReview --> Merged : approved and merged
    Merged --> Deleted : git branch -d
    Deleted --> [*]`,
    },
  ],

  exercises: [
    "Create a repository with a `main` branch. Make 3 commits on main, then create a `feature` branch and add 2 commits. Merge the feature branch back into main using fast-forward. Verify the linear history with `git log --oneline --graph`. Then reset, repeat with `--no-ff`, and compare the graph output.",
    "Simulate a merge conflict: create two branches from the same commit, modify the same lines of a C++ source file (`main.cpp`) on both branches, then merge one into the other. Practice resolving the conflict manually by editing the markers, then try again using `git checkout --ours` and `git checkout --theirs` to see the difference.",
    "Set up a small Git Flow workflow: initialize a repo with `main` and `develop` branches. Create a `feature/add-logger` branch from develop, add commits, merge it back. Then create a `release/1.0` branch, make a version bump commit, merge to both main and develop. Tag main as `v1.0`.",
    "Practice interactive rebase: create a feature branch with 5 commits (including a typo fix and a \"WIP\" commit). Use `git rebase -i HEAD~5` to squash the typo fix into its parent commit, reword the WIP message, and reorder commits logically. Verify the cleaned history with `git log`.",
    "Enable `git rerere`, create a conflict scenario, resolve it, then recreate the same conflict (e.g., by aborting the merge and retrying). Observe how rerere automatically applies your previous resolution. Check the recorded resolutions in `.git/rr-cache/`.",
  ],

  cheatSheet: [
    "`git branch <name>` — create a new branch; `git switch -c <name>` — create and switch in one step",
    "`git merge <branch>` — merge branch into current; `--no-ff` forces a merge commit; `--squash` collapses into one changeset",
    "`git merge --abort` — cancel an in-progress conflicted merge and restore pre-merge state",
    "`git rebase <base>` — replay current branch commits on top of base; `git rebase -i HEAD~N` for interactive editing",
    "`git branch -d <name>` — safe delete (must be merged); `git branch -D <name>` — force delete unmerged branch",
    "`git log --oneline --graph --all` — visualize branch topology in the terminal",
    "`git mergetool` — launch configured visual merge tool; `git config merge.tool <tool>` to set default (e.g., vimdiff, meld, kdiff3)",
    "`git rerere` — enable with `git config --global rerere.enabled true` to automatically reuse recorded conflict resolutions",
  ],

  revisionNotes: [
    "A Git branch is just a 40-byte file containing a commit SHA — branch creation is O(1) and virtually free, so branch early and often.",
    "Fast-forward merges produce no merge commit and keep history linear; three-way merges create a merge commit with two parents when branches have diverged.",
    "Use `--no-ff` when you want to preserve the record that work happened on a feature branch, even if fast-forward was possible.",
    "Merge conflicts only occur when both branches modify the same lines of the same file — non-overlapping changes are auto-merged.",
    "Git Flow suits teams with scheduled releases and multiple supported versions; trunk-based development suits continuous delivery with short-lived branches and feature flags.",
    "Never rebase commits that have been pushed to a shared branch — rebase rewrites commit SHAs, which causes divergence for others who based work on those commits.",
    "Interactive rebase (`git rebase -i`) is your tool for cleaning up commit history before merging — squash fixups, reword messages, reorder logically.",
    "`git rerere` records your conflict resolutions and replays them automatically — essential for long-running branches or repeated rebase workflows.",
  ],
};
