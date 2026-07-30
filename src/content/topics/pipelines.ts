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
};
