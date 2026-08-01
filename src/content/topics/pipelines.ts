import type { TopicContent } from "../types";

export const pipelines: TopicContent = {
  quickSummary: [
    "CI/CD pipelines are automated workflows that take code from commit to production, consisting of stages (build, test, scan, deploy) connected by artifacts and quality gates.",
    "Stages represent logical phases of the pipeline; each stage contains one or more jobs that can run in parallel. A stage must pass before the next one begins.",
    "Artifacts are files produced by one stage (compiled binaries, Docker images, test reports) and consumed by downstream stages or stored for deployment.",
    "Quality gates are checkpoints between stages — automated checks (test pass rate, coverage threshold, security scan results) or manual approvals that must pass before the pipeline proceeds.",
    "Popular pipeline platforms include GitHub Actions, GitLab CI, Jenkins, CircleCI, and Azure DevOps Pipelines.",
  ],
  detailed: [
    "## Pipeline Architecture\n\nA pipeline is a directed acyclic graph (DAG) of stages. The simplest pipeline is linear: Build then Test then Deploy. More sophisticated pipelines fan out into parallel tracks — unit tests, integration tests, security scans, and linting all run simultaneously after the build, then converge at a gate before deployment. Each stage runs in an isolated environment (container, VM, or ephemeral runner) to ensure reproducibility. Pipeline-as-code stores the pipeline definition alongside application code, so changes to the pipeline go through the same review process as code changes.",

    "## GitHub Actions\n\nGitHub Actions uses YAML workflow files in `.github/workflows/`. A workflow is triggered by events (push, pull_request, schedule, workflow_dispatch). Each workflow contains jobs that run on runners (GitHub-hosted or self-hosted). Jobs contain steps — either shell commands (`run:`) or reusable actions (`uses:`). Jobs within a workflow run in parallel by default; use `needs:` to define dependencies. Artifacts are uploaded with `actions/upload-artifact` and downloaded with `actions/download-artifact`. GitHub Actions integrates tightly with pull requests, showing check status inline. Matrix builds let you test across multiple OS/language versions with a single job definition.",

    "## Jenkins\n\nJenkins is the veteran CI/CD server, highly extensible through its plugin ecosystem. Modern Jenkins uses declarative or scripted Pipelines defined in a `Jenkinsfile` (Groovy-based). A declarative pipeline has `pipeline { agent, stages, post }` blocks. Stages contain steps; parallel stages are supported. Jenkins runs on a controller with distributed agents (nodes) executing builds. Jenkins' strength is flexibility — it can orchestrate virtually anything — but it requires significant maintenance: plugin updates, security patches, controller scaling, and agent management. Jenkins X and CloudBees CI are Kubernetes-native evolutions.",

    "## GitLab CI\n\nGitLab CI is configured via `.gitlab-ci.yml` at the repository root. It uses stages (ordered phases) and jobs (units of work within stages). Jobs in the same stage run in parallel. GitLab runners (shared or self-managed) execute jobs in Docker containers or VMs. GitLab CI has first-class support for environments, review apps (ephemeral per-MR deployments), container registries, and security scanning (SAST, DAST, dependency scanning). DAG mode (`needs:` keyword) allows jobs to depend on specific upstream jobs rather than entire stages, enabling more parallelism.",

    "## Artifacts, Caching, and Gates\n\nArtifacts are files produced during a pipeline run: compiled binaries, Docker images, test reports, coverage data, SBOM files. They are stored by the CI platform and can be downloaded or passed between stages. Caching differs from artifacts: caches speed up builds by persisting dependencies (node_modules, .m2) across pipeline runs, while artifacts are unique outputs of a specific run. Quality gates are automated or manual checkpoints: 'do not deploy if test coverage drops below 80%,' 'require security team approval for production deployments,' 'block merge if SAST finds critical vulnerabilities.' Gates enforce organizational standards without slowing developers on low-risk changes.",

    "## Pipeline Best Practices\n\nFail fast — put quick checks (linting, compilation, unit tests) before slow ones (E2E tests, performance tests). Use caching aggressively to reduce build times. Pin action/plugin versions for reproducibility. Use matrix builds for cross-platform/cross-version testing. Keep secrets in the platform's secret store, never in pipeline files. Monitor pipeline metrics: duration, success rate, queue time, flake rate. Use reusable workflows/templates to avoid copy-pasting pipeline definitions across repositories. Implement branch protection rules that require pipeline success before merging.",
  ],
  interviewQA: [
    {
      q: "What is the difference between an artifact and a cache in a CI/CD pipeline?",
      a: "An artifact is a unique output of a specific pipeline run — a compiled binary, Docker image, or test report — stored for downstream consumption or deployment. Artifacts are versioned and tied to a particular commit/build. A cache is a performance optimization that persists reusable data (installed dependencies, build caches) across pipeline runs to avoid redundant work. Caches are not tied to a specific build and may be evicted or invalidated. You deploy artifacts; you never deploy caches.",
      followUps: [
        "How do you handle artifact storage for long-running projects?",
        "What happens if a cache becomes stale or corrupted?",
      ],
    },
    {
      q: "How would you design a pipeline for a microservices monorepo?",
      a: "Use path-based triggering so each service's pipeline only runs when its directory changes. Share common pipeline templates for consistency but allow service-specific overrides. Build and push Docker images tagged with the commit SHA. Run service-level unit and integration tests in parallel. Use a matrix or dynamic pipeline generation to test only affected services. Gate deployments per service, not globally. Maintain a shared library pipeline that triggers downstream service pipelines when the library changes.",
      followUps: [
        "How do you handle shared library changes that affect multiple services?",
        "What are the trade-offs of monorepo vs polyrepo for CI/CD?",
      ],
    },
    {
      q: "What is a quality gate and how do you implement one?",
      a: "A quality gate is a checkpoint in the pipeline that blocks progression unless specific criteria are met. Examples: minimum test coverage percentage, zero critical security vulnerabilities, all required reviewers approved, performance benchmarks within acceptable thresholds. In GitHub Actions, you implement gates using required status checks on branch protection rules. In GitLab, you use `allow_failure: false` and `when: manual` for approval gates. In Jenkins, the `input` step pauses the pipeline for manual approval.",
    },
    {
      q: "How do you handle secrets in CI/CD pipelines?",
      a: "Store secrets in the platform's built-in secret management (GitHub Secrets, GitLab CI Variables marked protected/masked, Jenkins Credentials). Never commit secrets to pipeline definition files. For more advanced needs, integrate with external secret managers (HashiCorp Vault, AWS Secrets Manager) and fetch secrets at runtime. Restrict secret access by environment — production secrets should not be available to feature branch builds. Audit secret access. Rotate secrets regularly and use short-lived credentials (OIDC federation with cloud providers) where possible.",
    },
  ],
  mcqs: [
    {
      q: "In GitHub Actions, which keyword defines dependencies between jobs?",
      options: ["depends_on", "requires", "needs", "after"],
      answerIndex: 2,
      explanation: "The `needs:` keyword in a GitHub Actions job specifies which other jobs must complete successfully before it can start.",
    },
    {
      q: "What is the purpose of a matrix build?",
      options: [
        "To deploy to multiple environments simultaneously",
        "To test the same code across multiple combinations of OS, language version, or configuration",
        "To split a single test suite across workers for speed",
        "To build multiple microservices in a single pipeline",
      ],
      answerIndex: 1,
      explanation: "A matrix build generates job variants from a combination of parameters (e.g., Node 18/20 on Ubuntu/macOS), running the same steps across all combinations.",
    },
    {
      q: "In GitLab CI, what does the `needs:` keyword enable?",
      options: [
        "Manual approval gates between stages",
        "DAG mode, allowing jobs to depend on specific upstream jobs instead of entire stages",
        "Conditional job execution based on variables",
        "Automatic retry of failed jobs",
      ],
      answerIndex: 1,
      explanation: "GitLab CI's `needs:` creates a directed acyclic graph (DAG) of job dependencies, enabling more parallelism by not waiting for all jobs in a previous stage.",
    },
    {
      q: "Which is a CI/CD anti-pattern?",
      options: [
        "Failing fast by running quick checks before slow ones",
        "Storing pipeline definitions as code alongside application code",
        "Using the same pipeline YAML by copy-pasting across 50 repositories",
        "Caching dependencies between pipeline runs",
      ],
      answerIndex: 2,
      explanation: "Copy-pasting pipeline definitions leads to inconsistency and maintenance burden. Use reusable workflows, templates, or shared pipeline libraries instead.",
    },
  ],
  flashcards: [
    { front: "What is pipeline-as-code?", back: "Defining CI/CD pipelines in version-controlled configuration files (Jenkinsfile, .github/workflows/, .gitlab-ci.yml) rather than through a GUI." },
    { front: "What is a GitHub Actions runner?", back: "A server that executes workflow jobs. Can be GitHub-hosted (managed VMs) or self-hosted (your own infrastructure)." },
    { front: "What is a Jenkinsfile?", back: "A text file containing the definition of a Jenkins Pipeline, written in Groovy-based declarative or scripted syntax." },
    { front: "What is a review app in GitLab?", back: "An ephemeral environment deployed automatically for each merge request, allowing reviewers to test changes in a running application." },
    { front: "What does 'fail fast' mean in pipeline design?", back: "Place quick checks (linting, unit tests) early in the pipeline so failures are caught in seconds, before expensive stages (E2E tests, deployments) run." },
    { front: "What is OIDC federation in CI/CD?", back: "Using OpenID Connect tokens from the CI platform to authenticate with cloud providers, avoiding long-lived static credentials." },
    { front: "What is a reusable workflow?", back: "A workflow template that can be called from other workflows, reducing duplication across repositories (GitHub Actions: `workflow_call` trigger)." },
    { front: "What is branch protection?", back: "Repository settings that require specific conditions (passing CI checks, code review approvals) before code can be merged to protected branches." },
  ],
  glossary: [
    { term: "Stage", definition: "A logical phase in a pipeline (build, test, deploy) that groups related jobs and runs sequentially relative to other stages." },
    { term: "Job", definition: "A unit of work within a stage, consisting of steps that run on a single runner/agent." },
    { term: "Artifact", definition: "A file produced by a pipeline job (binary, image, report) stored for downstream use or deployment." },
    { term: "Quality Gate", definition: "A checkpoint requiring specific criteria (test pass rate, coverage, approvals) to be met before the pipeline proceeds." },
    { term: "Runner / Agent", definition: "A machine or container that executes pipeline jobs on behalf of the CI/CD platform." },
    { term: "Matrix Build", definition: "A pipeline pattern that tests code across multiple combinations of parameters (OS, language version, configuration)." },
    { term: "Pipeline-as-Code", definition: "The practice of defining CI/CD pipelines in version-controlled files alongside application source code." },
    { term: "DAG (Directed Acyclic Graph)", definition: "A pipeline execution model where jobs declare specific dependencies rather than running in rigid stage order, enabling greater parallelism." },
  ],
  deepDive: [
    "## Pipeline Design Patterns\n\nPipeline architectures fall into four main patterns. **Linear pipelines** execute stages sequentially: Build -> Test -> Deploy. They are simple and easy to reason about but slow because nothing runs in parallel. **Fan-out / fan-in pipelines** run multiple jobs in parallel after a shared build stage (e.g., unit tests, integration tests, SAST, and linting all run concurrently), then converge at a quality gate before deployment. This pattern dramatically reduces wall-clock time. **DAG pipelines** (supported natively in GitLab CI and GitHub Actions) allow fine-grained job dependencies: a job declares exactly which upstream jobs it needs, skipping the rigid stage model entirely. This enables maximum parallelism -- for example, deploying a frontend as soon as its tests pass without waiting for unrelated backend tests. **Matrix pipelines** generate job variants from parameter combinations (OS x language version x database), ensuring compatibility across environments without duplicating pipeline definitions.",

    "## Pipeline Optimization and Observability\n\nPipeline duration is a developer-experience metric: slow pipelines erode trust and encourage bypassing CI. Key optimization strategies include: **incremental builds** that skip unchanged modules (Nx, Turborepo, Bazel); **dependency caching** to avoid re-downloading node_modules or Maven artifacts; **test splitting** that distributes a test suite across parallel runners proportionally by historical duration (e.g., CircleCI's test splitting, Jest `--shard`); and **ephemeral runners** that scale to zero when idle (GitHub-hosted runners, GitLab autoscaling runners on Kubernetes). Observability means tracking pipeline metrics -- p50/p95 duration, failure rate, flake rate, queue wait time -- and alerting when they degrade. Tools like Datadog CI Visibility, Honeycomb, and GitLab's pipeline analytics dashboards provide this. Treat your pipeline as production infrastructure: monitor it, set SLOs for build time, and run incident reviews when it breaks.",

    "## Security in Pipelines (Supply Chain Hardening)\n\nPipelines are a high-value attack surface because they have write access to production. Supply chain hardening includes: **pinning action/image versions by SHA** (not mutable tags) to prevent dependency hijacking; **least-privilege credentials** scoped to the specific stage and environment; **OIDC federation** with cloud providers (GitHub Actions OIDC, GitLab CI ID tokens) to eliminate long-lived static secrets; **SLSA provenance** generation to create a verifiable build attestation; **artifact signing** with Sigstore/cosign so downstream consumers can verify image integrity; and **network isolation** for self-hosted runners to prevent lateral movement. Review third-party actions and orbs before use -- a compromised GitHub Action can exfiltrate every secret in your repository.",
  ],
  code: [
    {
      language: "yaml",
      caption: "GitHub Actions: Multi-stage CI/CD with matrix testing, caching, and environment deployments",
      source: `name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write  # OIDC federation

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: npx jest --shard=\${{ matrix.shard }}/3 --ci --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-\${{ matrix.shard }}
          path: coverage/

  lint-and-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm audit --audit-level=high

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: [test, lint-and-scan]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/deploy-staging
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://my-app-staging --delete

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://my-app.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/deploy-prod
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://my-app-prod --delete`,
    },
    {
      language: "groovy",
      caption: "Jenkinsfile: Declarative pipeline with parallel stages, Docker agent, and approval gate",
      source: `pipeline {
    agent none

    environment {
        REGISTRY = 'registry.example.com'
        IMAGE    = 'myorg/myapp'
    }

    stages {
        stage('Build') {
            agent {
                docker { image 'node:20-alpine' }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
                stash includes: 'dist/**', name: 'build-artifacts'
            }
        }

        stage('Quality Checks') {
            parallel {
                stage('Unit Tests') {
                    agent {
                        docker { image 'node:20-alpine' }
                    }
                    steps {
                        sh 'npm ci'
                        unstash 'build-artifacts'
                        sh 'npm test -- --ci --coverage'
                    }
                    post {
                        always {
                            junit 'reports/junit.xml'
                            publishHTML(target: [
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }
                stage('SAST') {
                    agent {
                        docker { image 'semgrep/semgrep:latest' }
                    }
                    steps {
                        sh 'semgrep scan --config=auto --error'
                    }
                }
                stage('Lint') {
                    agent {
                        docker { image 'node:20-alpine' }
                    }
                    steps {
                        sh 'npm ci'
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Docker Image') {
            agent any
            steps {
                unstash 'build-artifacts'
                script {
                    def tag = "\${env.REGISTRY}/\${env.IMAGE}:\${env.GIT_COMMIT[0..7]}"
                    sh "docker build -t \${tag} ."
                    sh "docker push \${tag}"
                }
            }
        }

        stage('Deploy to Staging') {
            agent any
            steps {
                sh "kubectl set image deployment/myapp myapp=\${REGISTRY}/\${IMAGE}:\${env.GIT_COMMIT[0..7]} -n staging"
                sh 'kubectl rollout status deployment/myapp -n staging --timeout=120s'
            }
        }

        stage('Approval') {
            steps {
                input message: 'Deploy to production?', submitter: 'release-managers'
            }
        }

        stage('Deploy to Production') {
            agent any
            steps {
                sh "kubectl set image deployment/myapp myapp=\${REGISTRY}/\${IMAGE}:\${env.GIT_COMMIT[0..7]} -n production"
                sh 'kubectl rollout status deployment/myapp -n production --timeout=180s'
            }
        }
    }

    post {
        failure {
            slackSend channel: '#ci-alerts', color: 'danger',
                      message: "Pipeline failed: \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
        }
    }
}`,
    },
    {
      language: "yaml",
      caption: "GitLab CI: Multi-stage pipeline with DAG mode, review apps, and container scanning",
      source: `stages:
  - build
  - test
  - scan
  - deploy

variables:
  IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE .
    - docker push $IMAGE
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

unit-tests:
  stage: test
  image: $IMAGE
  needs: [build]
  script:
    - npm test -- --ci --coverage
  coverage: '/Statements\\s*:\\s*(\\d+\\.?\\d*)%/'
  artifacts:
    reports:
      junit: reports/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: test
  image: $IMAGE
  needs: [build]
  services:
    - postgres:16-alpine
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: runner
    POSTGRES_PASSWORD: secret
    DATABASE_URL: postgresql://runner:secret@postgres:5432/testdb
  script:
    - npm run test:integration

container-scan:
  stage: scan
  needs: [build]
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE

sast:
  stage: scan
  needs: []  # No dependencies -- runs immediately
  image: semgrep/semgrep:latest
  script:
    - semgrep scan --config=auto --error --json -o semgrep-report.json .
  artifacts:
    reports:
      sast: semgrep-report.json

deploy-review:
  stage: deploy
  needs: [unit-tests, integration-tests]
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://$CI_COMMIT_REF_SLUG.review.example.com
    on_stop: stop-review
    auto_stop_in: 1 week
  script:
    - helm upgrade --install review-$CI_COMMIT_REF_SLUG ./chart
      --set image=$IMAGE
      --set ingress.host=$CI_COMMIT_REF_SLUG.review.example.com
      --namespace review
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

stop-review:
  stage: deploy
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  script:
    - helm uninstall review-$CI_COMMIT_REF_SLUG --namespace review
  when: manual
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: manual

deploy-production:
  stage: deploy
  needs: [unit-tests, integration-tests, container-scan]
  environment:
    name: production
    url: https://app.example.com
  script:
    - helm upgrade --install myapp ./chart
      --set image=$IMAGE
      --namespace production
      --wait --timeout 180s
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual`,
    },
  ],
  comparison: {
    columns: ["Pattern", "Parallelism", "Complexity", "Use Case", "Platform Support"],
    rows: [
      ["Linear", "None -- stages run sequentially", "Low", "Simple projects with few stages; quick to set up and debug", "All platforms"],
      ["Fan-out / Fan-in", "High -- multiple jobs run in parallel within a stage, converging at a gate", "Medium", "Most production pipelines; balances speed with clear stage boundaries", "All platforms (native parallel stages)"],
      ["DAG (Directed Acyclic Graph)", "Maximum -- jobs depend on specific upstream jobs, not entire stages", "High", "Large monorepos, microservices; minimizes wait time by removing artificial stage barriers", "GitLab CI (needs:), GitHub Actions (needs:), Azure Pipelines"],
      ["Matrix", "High -- generates job variants from parameter combinations", "Medium", "Cross-platform libraries; testing across OS, language, and database versions", "GitHub Actions (strategy.matrix), GitLab CI (parallel:matrix), Azure Pipelines"],
    ],
  },
  diagrams: [
    {
      title: "Fan-out / Fan-in Pipeline Flow",
      kind: "flow",
      caption: "A typical production pipeline: build fans out to parallel quality checks, which converge at a quality gate before staging and production deploys.",
      mermaid: `flowchart TD
    Trigger([Push or PR]) --> Build[Build and Compile\nCache dependencies]
    Build --> FanOut{Parallel Quality Checks}
    FanOut --> Unit[Unit Tests\nSharded 3x]
    FanOut --> Int[Integration Tests\nWith DB service]
    FanOut --> Lint[Lint and Type Check]
    FanOut --> SAST[SAST Security Scan]
    Unit --> Gate{Quality Gate}
    Int --> Gate
    Lint --> Gate
    SAST --> Gate
    Gate -->|All pass| Staging[Deploy to Staging]
    Gate -->|Any fail| Notify[Notify Developer\nPipeline stops]
    Staging --> Approval{Manual Approval}
    Approval -->|Approved| Prod[Deploy to Production]
    Approval -->|Rejected| Hold[Hold for fixes]`,
    },
    {
      title: "DAG Pipeline Execution Order",
      kind: "architecture",
      caption: "DAG mode removes rigid stage boundaries. Frontend and backend tracks execute independently, maximizing parallelism.",
      mermaid: `graph TD
    Checkout[Checkout Code] --> FEBuild[Frontend Build]
    Checkout --> BEBuild[Backend Build]
    FEBuild --> FETest[Frontend Tests]
    BEBuild --> BETest[Backend Tests]
    BEBuild --> ContainerScan[Container Scan]
    FETest --> FEDeploy[Frontend Deploy]
    BETest --> BEDeploy[Backend Deploy]
    ContainerScan --> BEDeploy
    FEDeploy --> E2E[End-to-End Tests]
    BEDeploy --> E2E
    E2E --> Release[Release]`,
    },
    {
      title: "CI/CD Pipeline Execution Lifecycle",
      kind: "sequence",
      caption: "Interaction between developer, CI platform, runners, and deployment targets across the full pipeline lifecycle.",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant CI as CI Platform
    participant Runner as Runner / Pod
    participant Reg as Container Registry
    participant K8s as Kubernetes
    Dev->>CI: git push triggers webhook
    CI->>Runner: Allocate runner, checkout code
    Runner->>Runner: Build image, run tests
    Runner->>Reg: Push image with commit SHA tag
    Runner-->>CI: Report test results
    CI->>Dev: Notify on failure
    CI->>CI: Wait for manual approval
    CI->>K8s: Update Deployment image tag
    K8s->>K8s: Rolling update with readiness probes
    K8s-->>CI: Rollout complete
    CI-->>Dev: Deployment success`,
    },
  ],
  animations: [
    {
      title: "CI/CD Pipeline Execution Lifecycle",
      steps: [
        { label: "Trigger", detail: "A developer pushes a commit or opens a pull request. The CI platform detects the event via webhook and enqueues a pipeline run." },
        { label: "Runner Allocation", detail: "The platform assigns available runners (containers or VMs) to each job. GitHub Actions spins up fresh Ubuntu VMs; GitLab may use a Kubernetes executor to create pods on demand." },
        { label: "Build Stage", detail: "Source code is checked out, dependencies are restored from cache, and the application is compiled. Build artifacts (dist/, Docker image) are uploaded to artifact storage." },
        { label: "Parallel Testing", detail: "Multiple jobs fan out: unit tests (sharded across 3 runners), integration tests (with a Postgres service container), linting, and SAST scanning all execute simultaneously." },
        { label: "Quality Gate", detail: "All parallel jobs must succeed. The platform evaluates pass/fail status, test coverage thresholds, and security scan results. If any check fails, the pipeline stops and the developer is notified." },
        { label: "Deploy to Staging", detail: "Artifacts are deployed to the staging environment. For Kubernetes, this means updating the Deployment image tag and waiting for rollout to complete. For static sites, syncing to an S3 bucket." },
        { label: "Manual Approval", detail: "A release manager reviews the staging deployment and approves production release via the CI platform's UI. This is a manual quality gate." },
        { label: "Deploy to Production", detail: "The same artifact (immutable, built once) is deployed to production. Post-deploy health checks verify the application is serving traffic correctly." },
      ],
    },
  ],
  exercises: [
    "Write a GitHub Actions workflow that builds a Node.js app, runs tests with 3 shards in parallel using strategy.matrix, uploads coverage artifacts from each shard, and only deploys to staging if all shards pass.",
    "Create a Jenkinsfile with a parallel stage that runs unit tests, integration tests, and a security scan concurrently. Add a post block that sends a Slack notification on failure.",
    "Design a GitLab CI pipeline for a monorepo containing a frontend (React) and backend (Go) service. Use DAG mode (needs:) so each service's test and deploy jobs run independently without waiting for the other service.",
    "Implement a pipeline that builds a Docker image, pushes it to a registry, scans it with Trivy for HIGH/CRITICAL vulnerabilities, and blocks deployment if any are found. Include proper OIDC-based authentication to avoid static credentials.",
    "Set up branch protection rules and a GitHub Actions workflow so that: PRs require passing CI, at least one approval, and no critical SAST findings before merging to main. Write the workflow YAML and describe the branch protection settings.",
  ],
  cheatSheet: [
    "GitHub Actions job dependency: `needs: [job-a, job-b]` -- job waits for listed jobs to succeed",
    "GitHub Actions matrix: `strategy: { matrix: { node: [18, 20], os: [ubuntu-latest, macos-latest] } }` generates 4 job variants",
    "GitHub Actions cache: `actions/cache@v4` with `path` and `key` (use hashFiles for cache busting)",
    "GitLab CI DAG mode: add `needs: [job-name]` to skip stage ordering and depend on specific jobs",
    "GitLab CI rules: `rules: [{ if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH' }]` for conditional job execution",
    "Jenkins parallel: `parallel { stage('A') { ... } stage('B') { ... } }` inside a parent stage",
    "Jenkins input gate: `input message: 'Deploy?', submitter: 'release-managers'` pauses for manual approval",
    "Pin actions by SHA, not tag: `uses: actions/checkout@<full-sha>` prevents supply chain attacks from tag mutation",
  ],
  revisionNotes: [
    "A pipeline is a DAG of stages/jobs triggered by events (push, PR, schedule, manual). Stages run sequentially; jobs within a stage can run in parallel.",
    "Artifacts are build outputs (binaries, images, reports) tied to a specific run. Caches are reusable data (dependencies) shared across runs to speed up builds.",
    "Quality gates block pipeline progression: automated (coverage >= 80%, zero critical CVEs) or manual (release manager approval).",
    "GitHub Actions uses YAML in .github/workflows/, triggered by events. Jobs use `needs:` for ordering. Matrix builds test across parameter combinations.",
    "Jenkins uses a Groovy-based Jenkinsfile. Declarative syntax: `pipeline { agent, stages, post }`. Supports parallel stages, input steps for approval, and extensive plugins.",
    "GitLab CI uses .gitlab-ci.yml. Supports DAG mode via `needs:`, review apps for per-MR environments, built-in container registry, and SAST/DAST scanning.",
    "Security: pin dependencies by SHA, use OIDC for cloud auth (no static secrets), scan containers with Trivy/Grype, generate SLSA provenance, sign artifacts with Sigstore.",
    "Optimization: fail fast (lint before E2E), cache dependencies, shard tests across parallel runners, use ephemeral runners, and monitor pipeline metrics (p50 duration, flake rate).",
  ],
  resources: [
    { label: "GitHub Actions Documentation", kind: "docs", note: "Official reference for workflow syntax, events, runners, expressions, and reusable workflows." },
    { label: "GitLab CI/CD Documentation", kind: "docs", note: "Comprehensive guide covering .gitlab-ci.yml syntax, DAG mode, environments, review apps, and Auto DevOps." },
    { label: "Continuous Delivery by Jez Humble and David Farley", kind: "book", note: "The foundational text on deployment pipelines, build automation, and release engineering practices." },
    { label: "SLSA (Supply-chain Levels for Software Artifacts)", kind: "docs", note: "Framework for end-to-end software supply chain integrity, including build provenance and verification." },
    { label: "Fireship: CI/CD in 100 Seconds", kind: "video", note: "Quick visual overview of CI/CD pipeline concepts, ideal as a refresher before diving into platform-specific details." },
  ],
};
