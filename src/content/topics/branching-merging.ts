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
};
