import type { TopicContent } from "../types";

export const continuousIntegration: TopicContent = {
  quickSummary: [
    "Continuous Integration (CI) is the practice of merging developer work into a shared mainline frequently — at least daily — with each integration verified by an automated build and test suite.",
    "Trunk-based development maximizes CI benefits by having all developers commit to a single branch (trunk/main), using short-lived feature branches (hours to days, not weeks).",
    "Fast feedback is the core CI value: a developer should know within minutes whether their change broke the build, failed tests, or introduced regressions.",
    "CI pipelines automate compilation, linting, unit tests, integration tests, security scans, and artifact generation on every push or pull request.",
  ],
  detailed: [
    "## Core Principles of CI\n\nCI was popularized by Extreme Programming and Martin Fowler's seminal article. The key principles are: maintain a single source repository, automate the build, make the build self-testing, commit to the mainline frequently, fix broken builds immediately, keep the build fast, test in a clone of the production environment, and make it easy to get the latest deliverables. CI is a practice and a discipline, not just a tool — installing Jenkins does not mean you are doing CI if developers work on month-long branches.",

    "## Trunk-Based Development\n\nTrunk-based development is the branching model that best supports CI. All developers work on the main branch (trunk). Feature branches, if used, live for at most a day or two before merging. This minimizes merge conflicts and ensures the team is always integrating. For features that take longer, feature flags hide incomplete work. The alternative — long-lived feature branches (GitFlow-style) — leads to painful merges, delayed integration, and deferred discovery of conflicts. Studies (DORA, Accelerate) consistently show trunk-based development correlates with higher software delivery performance.",

    "## Build Pipelines and Fast Feedback\n\nA CI pipeline typically runs: (1) checkout code, (2) install dependencies, (3) lint and static analysis, (4) compile/build, (5) run unit tests, (6) run integration tests, (7) security/vulnerability scanning, (8) build artifacts/images. The pipeline should complete in under 10 minutes for the critical path (lint + unit tests). Slower stages (integration tests, E2E tests) can run in parallel or as a second tier. If the build takes 45 minutes, developers stop integrating frequently — defeating CI's purpose. Strategies for speed: parallelization, test splitting, caching dependencies, incremental builds, and running only affected tests.",

    "## What Makes a Good CI Culture\n\nCI is as much cultural as technical. The build must be treated as sacred — a red build is the team's top priority. 'It works on my machine' is not acceptable; the CI environment is the arbiter. Developers should not pile commits on top of a broken build. Code review should happen quickly (same day) to avoid blocking integration. Flaky tests must be fixed or quarantined immediately, as they erode trust in the pipeline. The team should monitor CI metrics: build duration, failure rate, time-to-fix, and queue wait time.",

    "## CI Anti-Patterns\n\nCommon anti-patterns include: long-lived feature branches that delay integration for weeks, builds that take over 30 minutes and discourage frequent commits, ignoring or disabling failing tests instead of fixing them, not running CI on pull requests (only on merge), manual build steps that are not automated, inconsistent environments between CI and production, and treating CI as 'someone else's problem' rather than a team responsibility.",
  ],
  interviewQA: [
    {
      q: "What is Continuous Integration and why is it important?",
      a: "CI is the practice of frequently merging code changes into a shared mainline — ideally multiple times per day — with each merge automatically verified by building the software and running tests. It is important because it catches integration bugs early (when they are cheap to fix), reduces merge conflicts, provides fast feedback to developers, and keeps the codebase in a releasable state. Without CI, integration happens late in the cycle, leading to painful 'merge hell' and unpredictable release timelines.",
      followUps: [
        "How does CI relate to Continuous Delivery?",
        "What metrics would you use to measure CI effectiveness?",
      ],
    },
    {
      q: "Why does trunk-based development support CI better than GitFlow?",
      a: "Trunk-based development keeps branches short-lived (hours to a day), so integration happens continuously. GitFlow uses long-lived develop, release, and feature branches where code can diverge for weeks. This delays the discovery of integration issues, creates large risky merges, and means the mainline is rarely in a deployable state. The DORA research consistently shows that trunk-based development correlates with elite software delivery performance: higher deployment frequency, lower lead time, lower change failure rate.",
      followUps: [
        "How do you handle unfinished features in trunk-based development?",
        "Is GitFlow ever appropriate?",
      ],
    },
    {
      q: "How do you keep CI builds fast?",
      a: "Several strategies: run tests in parallel across multiple workers, split large test suites so each worker runs a subset, cache dependencies and build artifacts between runs, use incremental builds that only recompile changed modules, run only tests affected by the changed code (test impact analysis), separate fast unit tests (run on every push) from slow integration/E2E tests (run as a gating check before merge), and use powerful CI runner hardware. The target is under 10 minutes for the critical feedback loop.",
    },
    {
      q: "What should you do when the CI build breaks?",
      a: "Stop the line — fixing the build is the team's top priority. The developer whose commit broke the build should fix it within minutes, not hours. If a quick fix is not possible, revert the offending commit to restore green. Do not pile more commits on top of a broken build. Communicate the status to the team. After fixing, investigate whether the failure reveals a gap in local testing or a flaky test that needs attention. Track 'time to fix broken build' as a team health metric.",
    },
  ],
  mcqs: [
    {
      q: "According to CI best practices, how often should developers integrate their work?",
      options: [
        "Once per sprint",
        "At least once per day",
        "Only when a feature is complete",
        "Weekly, to batch changes for efficiency",
      ],
      answerIndex: 1,
      explanation: "CI calls for frequent integration — at least daily, ideally multiple times per day — to catch conflicts early and keep the mainline stable.",
    },
    {
      q: "What is the primary risk of long-lived feature branches?",
      options: [
        "They consume too much disk space",
        "They delay integration, leading to painful merges and late defect discovery",
        "They prevent code review",
        "They make it impossible to run unit tests",
      ],
      answerIndex: 1,
      explanation: "Long-lived branches accumulate divergence from the mainline. When finally merged, conflicts are large and integration bugs surface late, when they are expensive to fix.",
    },
    {
      q: "What is a flaky test?",
      options: [
        "A test that runs too slowly",
        "A test that sometimes passes and sometimes fails without code changes",
        "A test that covers too many code paths",
        "A test written in a deprecated framework",
      ],
      answerIndex: 1,
      explanation: "Flaky tests produce non-deterministic results, eroding trust in the CI pipeline. Developers start ignoring test failures, undermining the entire CI feedback loop.",
    },
    {
      q: "Which research program consistently links trunk-based development to high software delivery performance?",
      options: ["IEEE Software Survey", "DORA / Accelerate", "Chaos Engineering Group", "CNCF Maturity Model"],
      answerIndex: 1,
      explanation: "The DORA (DevOps Research and Assessment) program, published in the book 'Accelerate' by Forsgren, Humble, and Kim, identifies trunk-based development as a key predictor of elite delivery performance.",
    },
  ],
  flashcards: [
    { front: "What does CI stand for?", back: "Continuous Integration — the practice of frequently merging code into a shared mainline with automated build and test verification." },
    { front: "What is the recommended maximum CI build time for fast feedback?", back: "Under 10 minutes for the critical path (lint, compile, unit tests). Slower stages can run in parallel or as secondary checks." },
    { front: "What is trunk-based development?", back: "A branching model where all developers commit to a single main branch, using only short-lived feature branches (hours, not weeks)." },
    { front: "What is test impact analysis?", back: "A technique that determines which tests are affected by a code change and runs only those, reducing CI execution time." },
    { front: "What is the 'stop the line' principle in CI?", back: "When the build breaks, fixing it is the team's top priority. No new work is piled on top of a broken build." },
    { front: "What are the four DORA metrics?", back: "Deployment frequency, lead time for changes, change failure rate, and time to restore service." },
    { front: "What is a CI artifact?", back: "A build output (compiled binary, Docker image, test report, coverage report) produced by the CI pipeline and stored for downstream use." },
    { front: "What is the difference between a unit test and an integration test in CI?", back: "Unit tests verify individual functions/classes in isolation (fast, no external dependencies). Integration tests verify interactions between components or with real databases/APIs (slower, more realistic)." },
  ],
  glossary: [
    { term: "Continuous Integration", definition: "The practice of frequently merging code into a shared mainline, verified by automated builds and tests." },
    { term: "Trunk-Based Development", definition: "A branching strategy where developers work on a single main branch with short-lived feature branches." },
    { term: "Build Pipeline", definition: "An automated sequence of steps (compile, test, scan, package) triggered by code changes." },
    { term: "Fast Feedback", definition: "The CI principle that developers should learn within minutes whether their change is healthy." },
    { term: "Flaky Test", definition: "A test that non-deterministically passes or fails without underlying code changes, undermining CI trust." },
    { term: "Green Build", definition: "A CI build where all steps pass, indicating the codebase is in a healthy state." },
    { term: "Test Splitting", definition: "Distributing a test suite across multiple parallel workers to reduce total execution time." },
    { term: "DORA Metrics", definition: "Four key metrics (deployment frequency, lead time, change failure rate, MTTR) that measure software delivery performance." },
  ],
};
