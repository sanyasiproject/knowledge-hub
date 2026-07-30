import type { TopicContent } from "../types";

export const rebasing: TopicContent = {
  quickSummary: [
    "Rebase replays commits from one branch onto another base commit, creating new commits with different SHAs but the same changes — producing a clean linear history without merge commits.",
    "Interactive rebase (git rebase -i) lets you reorder, edit, squash, fixup, or drop commits before sharing, enabling a polished commit history.",
    "The golden rule of rebasing: never rebase commits that have been pushed to a shared branch, because it rewrites history and forces collaborators to reconcile diverged refs.",
    "git push --force-with-lease is safer than --force after rebasing — it refuses to push if the remote has commits you have not seen, preventing accidental overwrites of others' work.",
  ],
  detailed: [
    "## Rebase vs Merge\n\nBoth integrate changes from one branch into another, but they produce different histories:\n\n**Merge** creates a merge commit with two parents, preserving the exact branching topology. The history shows when branches diverged and converged.\n\n**Rebase** takes the commits on your branch and replays them on top of the target branch, creating new commits (new SHAs) with the same diffs. The result is a linear history as if you had started your work from the latest target commit.\n\n```\nMerge:     A---B---C---M (main)\n                \\     /\n                 D---E (feature)\n\nRebase:    A---B---C---D'---E' (main + feature rebased)\n```\n\nTrade-offs: merge preserves true history and is safe for shared branches; rebase produces cleaner logs but rewrites commit SHAs. Many teams rebase locally for clean history, then merge (or fast-forward) to main.",
    "## Interactive Rebase\n\n`git rebase -i HEAD~5` opens an editor listing the last 5 commits with actions:\n- **pick** — use the commit as-is\n- **reword** — use the commit but edit the message\n- **edit** — pause after applying so you can amend the commit\n- **squash** — combine with the previous commit, prompting for a new message\n- **fixup** — like squash but discard this commit's message (keep the previous one)\n- **drop** — remove the commit entirely\n- **reorder** — rearrange lines to reorder commits\n\nUse cases: clean up WIP commits before a PR (squash \"fix typo\" into the parent), reorder commits for logical grouping, split a large commit (edit + reset + re-commit), or rewrite commit messages. Interactive rebase is the primary tool for crafting a clear, reviewable commit history.",
    "## The Golden Rule\n\nNever rebase commits that exist on a remote branch others are working on. Rebase creates new commits with new SHAs — anyone who based work on the original commits will have diverged history and face conflicts when pulling. This rule applies to `git rebase`, `git commit --amend`, and any operation that rewrites shared history.\n\nSafe scenarios for rebase:\n- Rebasing a local feature branch onto updated main before pushing\n- Interactive rebase on unpushed commits\n- Force-pushing to your own feature branch (with team agreement)\n\nUnsafe: rebasing main, rebasing a branch others have checked out, amending pushed commits on shared branches.",
    "## Squash and Fixup Workflows\n\nA common workflow: make many small commits during development, then clean up before merging:\n\n1. Work with frequent commits: \"Add handler\", \"Fix test\", \"Fix typo\", \"Add docs\"\n2. Before creating a PR: `git rebase -i main` and squash/fixup the fix commits into their logical parents\n3. Result: 1-2 clean commits like \"Add user handler with tests and docs\"\n\nThe `git commit --fixup=<sha>` command creates a commit prefixed with `fixup!` that targets a specific earlier commit. Later, `git rebase -i --autosquash main` automatically reorders these fixup commits next to their targets with the fixup action pre-selected. This workflow keeps the development history granular while producing clean history for reviewers.",
    "## Force Push Safety\n\nAfter rebasing a branch that was already pushed, you must force-push because the remote has the old SHAs:\n\n- `git push --force` — overwrites the remote branch unconditionally. Dangerous: if a teammate pushed new commits, they are silently lost.\n- `git push --force-with-lease` — checks that the remote ref matches what you last fetched. If someone pushed in the meantime, it refuses and you must fetch + rebase again. Always prefer this.\n- `git push --force-with-lease --force-if-includes` — (Git 2.30+) additionally checks that the remote tip is included in your local reflog, catching cases where you fetched but did not integrate.\n\nTeam conventions: agree on whether feature branches may be force-pushed (common), protect main/develop with branch protection rules, and use PR-based merges so the merge target is never force-pushed.",
    "## Handling Rebase Conflicts\n\nDuring rebase, conflicts can occur at each replayed commit. Git pauses and shows conflict markers just like a merge conflict. Resolution workflow:\n1. Edit conflicted files to resolve\n2. `git add <resolved files>`\n3. `git rebase --continue` to proceed to the next commit\n4. Repeat if more commits conflict\n\nAlternatives: `git rebase --abort` to cancel and return to the pre-rebase state; `git rebase --skip` to drop the current commit entirely.\n\nTip: if you find yourself resolving the same conflicts repeatedly (e.g., rebasing a long-lived branch), enable `git rerere` (reuse recorded resolution) to automatically apply previous conflict resolutions. Also consider merging more frequently to reduce the divergence window.",
  ],
  interviewQA: [
    {
      q: "When should you use rebase vs merge?",
      a: "Use rebase to maintain a clean linear history on feature branches before integration — rebase your feature onto the latest main to make the eventual merge a fast-forward. Use merge for integrating into shared branches (main, develop) to preserve the true history and avoid rewriting commits others depend on. A common workflow: rebase locally to clean up, then merge (or fast-forward merge) to main via a pull request. The golden rule: never rebase commits that have been pushed to a branch others are using.",
      followUps: [
        "What happens to commit SHAs during a rebase?",
        "Can you rebase a branch that has merge commits?",
        "What is git pull --rebase and when is it useful?",
      ],
    },
    {
      q: "Explain git push --force-with-lease and why it is preferred over --force.",
      a: "--force overwrites the remote branch unconditionally, potentially destroying commits pushed by teammates. --force-with-lease checks that the remote branch is at the same commit you last fetched — if someone pushed new commits in the meantime, the push is rejected, preventing data loss. It is strictly safer. You should still coordinate with your team and only force-push feature branches, never protected branches. Git 2.30 added --force-if-includes for even stricter safety.",
      followUps: [
        "Can force-with-lease still lose data? When?",
        "How do branch protection rules prevent force pushes?",
      ],
    },
    {
      q: "What is interactive rebase and how do you use it to clean up commit history?",
      a: "Interactive rebase (git rebase -i <base>) opens an editor listing commits with actions: pick (keep), reword (change message), squash (combine with previous, edit message), fixup (combine with previous, discard message), edit (pause for amending), drop (remove). You can also reorder commits by rearranging lines. Common use: squash 'fix typo' and 'WIP' commits into meaningful logical commits before creating a pull request. The --autosquash flag with fixup! commits automates this workflow.",
      followUps: [
        "How do you split a commit using interactive rebase?",
        "What is the difference between squash and fixup?",
      ],
    },
    {
      q: "You rebased a branch and now your teammate's branch is broken. What happened and how do you fix it?",
      a: "Rebasing rewrote the commit SHAs on the branch. Your teammate's local branch still points to the old commits, which now diverge from the rebased remote. Their git pull will try to merge the old and new histories, creating duplicates and conflicts. Fix: your teammate should run `git fetch origin` then `git reset --hard origin/<branch>` to discard their local copy and use the rebased version (assuming they have no unpushed work). If they have unpushed work, they need to rebase their local commits onto the new remote tip. Prevention: agree as a team on rebase rules and communicate before force-pushing.",
    },
  ],
  mcqs: [
    {
      q: "What does rebase do to commit SHAs?",
      options: [
        "Keeps them identical",
        "Creates new SHAs because commits are replayed with a different parent",
        "Only changes the first commit's SHA",
        "SHAs only change if there are conflicts",
      ],
      answerIndex: 1,
      explanation:
        "Rebase replays commits on a new base, and since the parent SHA is part of the commit hash input, every rebased commit gets a new SHA even if the diff is identical.",
    },
    {
      q: "What does the 'fixup' action do in interactive rebase?",
      options: [
        "Edits the commit message",
        "Removes the commit",
        "Combines the commit with the previous one, discarding its message",
        "Pauses for manual editing",
      ],
      answerIndex: 2,
      explanation:
        "fixup is like squash but automatically discards the fixup commit's message, keeping only the previous commit's message. Ideal for 'fix typo' type commits.",
    },
    {
      q: "What is the golden rule of rebasing?",
      options: [
        "Always rebase before merging",
        "Never rebase commits that have been pushed to a shared branch",
        "Always use interactive rebase",
        "Rebase only on main branch",
      ],
      answerIndex: 1,
      explanation:
        "Rebasing rewrites history (new SHAs), which causes problems for anyone who has based work on the original commits. Only rebase local or private branch commits.",
    },
    {
      q: "What does `git push --force-with-lease` check before pushing?",
      options: [
        "That the local branch is up to date with main",
        "That no merge conflicts exist",
        "That the remote ref matches what you last fetched",
        "That all tests pass",
      ],
      answerIndex: 2,
      explanation:
        "force-with-lease compares the remote branch's current commit to your last known state of it. If someone pushed new commits that you haven't fetched, the push is rejected.",
    },
  ],
  flashcards: [
    {
      front: "What does git rebase main do when on a feature branch?",
      back: "Takes all commits on feature that are not on main, then replays them one by one on top of main's latest commit. The feature branch now starts from main's tip with new commit SHAs.",
    },
    {
      front: "What is the difference between squash and fixup in interactive rebase?",
      back: "Both combine a commit with its predecessor. Squash opens an editor to write a new combined message. Fixup silently discards the commit's message and keeps the predecessor's message.",
    },
    {
      front: "What does git commit --fixup=<sha> do?",
      back: "Creates a new commit with the message 'fixup! <original message>'. When you later run git rebase -i --autosquash, this commit is automatically placed after its target with the fixup action.",
    },
    {
      front: "What is git rebase --onto?",
      back: "Replays commits from one base onto a different target. Syntax: git rebase --onto <newbase> <oldbase> <branch>. Useful for moving a branch that was based on the wrong starting point.",
    },
    {
      front: "How do you abort a rebase in progress?",
      back: "git rebase --abort — cancels the rebase and restores the branch to its exact state before the rebase began.",
    },
    {
      front: "What does git pull --rebase do?",
      back: "Fetches from the remote and rebases your local commits on top of the fetched commits instead of creating a merge commit. Keeps history linear.",
    },
    {
      front: "What is git rerere?",
      back: "Reuse Recorded Resolution — Git records how you resolved conflicts and automatically applies the same resolution if the same conflict recurs during future rebases or merges.",
    },
    {
      front: "How do you split a commit during interactive rebase?",
      back: "Mark the commit as 'edit', then when Git pauses: git reset HEAD~ (undo the commit, keep changes), git add and commit in parts, then git rebase --continue.",
    },
  ],
  glossary: [
    {
      term: "Rebase",
      definition:
        "A Git operation that replays commits from one branch onto a different base commit, creating new commits with new SHAs but identical diffs.",
    },
    {
      term: "Interactive rebase",
      definition:
        "A rebase mode (git rebase -i) that opens an editor allowing you to pick, reword, squash, fixup, edit, drop, or reorder commits.",
    },
    {
      term: "Golden rule of rebasing",
      definition:
        "Never rebase commits that have been pushed to a shared/public branch, as it rewrites history and disrupts collaborators.",
    },
    {
      term: "Squash",
      definition:
        "An interactive rebase action that combines a commit with its predecessor, prompting for a new combined commit message.",
    },
    {
      term: "Fixup",
      definition:
        "An interactive rebase action that combines a commit with its predecessor while discarding the commit's message.",
    },
    {
      term: "--force-with-lease",
      definition:
        "A safer alternative to git push --force that refuses to overwrite the remote if it has commits not present in your local tracking ref.",
    },
    {
      term: "--autosquash",
      definition:
        "A rebase flag that automatically reorders and marks fixup!/squash! commits next to their targets in interactive rebase.",
    },
    {
      term: "rebase --onto",
      definition:
        "A rebase variant that replays a range of commits onto an arbitrary new base, useful for transplanting branches.",
    },
  ],
};
