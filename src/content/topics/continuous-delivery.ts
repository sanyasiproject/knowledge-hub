import type { TopicContent } from "../types";

export const continuousDelivery: TopicContent = {
  quickSummary: [
    "Continuous Delivery (CD) ensures that code is always in a deployable state — every commit that passes the pipeline can be released to production at the push of a button.",
    "Continuous Delivery is distinct from Continuous Deployment: CD keeps the release decision manual (a human clicks 'deploy'), while continuous deployment automatically pushes every passing commit to production.",
    "Deployment automation eliminates manual runbooks — infrastructure provisioning, artifact promotion, database migrations, smoke tests, and health checks are all scripted and repeatable.",
    "Rollback strategies (automated rollback, blue-green switch, database backward compatibility) are essential because failures will happen — the goal is to minimize mean time to recovery.",
  ],
  detailed: [
    "## CD vs Continuous Deployment\n\nContinuous Delivery means every commit that passes the full pipeline (build, test, security scan, staging deploy) is *ready* for production but requires a human decision to release. Continuous Deployment removes that manual step — every passing commit goes to production automatically. Most organizations start with Continuous Delivery because it provides safety while still enabling frequent releases. The distinction matters: CD is about capability ('we *can* deploy at any time'), while continuous deployment is about practice ('we *do* deploy every commit').",

    "## The Deployment Pipeline\n\nA CD pipeline extends CI by adding deployment stages: artifact promotion, environment provisioning, database migration, deployment execution, smoke testing, and monitoring. The pipeline is the *only* path to production — no SSH-and-copy, no manual console changes. Each environment (dev, staging, production) uses the same deployment mechanism with environment-specific configuration injected at deploy time. This ensures that the process tested in staging is identical to what runs in production, eliminating 'works in staging but not prod' surprises.",

    "## Deployment Automation\n\nAutomated deployments cover: building and tagging immutable artifacts (Docker images, AMIs, JARs), provisioning or updating infrastructure (Terraform, CloudFormation), running database migrations (Flyway, Liquibase, Alembic) with backward-compatible changes, deploying the new version using the chosen release strategy (rolling, blue-green, canary), executing smoke tests against the live deployment, and verifying health checks and key metrics. Every step is scripted, version-controlled, and idempotent. If a deployment fails partway through, re-running it should resume safely.",

    "## Rollback Strategies\n\nRollback is not optional — it is a first-class concern in CD. Strategies include: (1) Redeployment rollback — deploy the previous known-good artifact through the same pipeline. (2) Blue-green rollback — switch the load balancer back to the previous environment. (3) Canary rollback — route 100% traffic back to the stable version. (4) Feature flag rollback — disable the problematic feature without redeploying. Database rollback is the hardest part: backward-compatible migrations (expand-and-contract pattern) ensure the previous code version still works with the new schema, avoiding the need for risky schema rollbacks.",

    "## Database Migrations in CD\n\nDatabase changes are the biggest challenge in continuous delivery because they are stateful and difficult to reverse. The expand-and-contract pattern handles this: (1) Expand — add the new column/table without removing old ones; deploy code that writes to both old and new. (2) Migrate — backfill data from old to new. (3) Contract — once all code uses the new schema, remove the old column/table. Each step is a separate deployment, and the system is always in a consistent state. Tools like Flyway and Liquibase version migrations and apply them in order, with checksums to detect tampering.",

    "## Measuring CD Maturity\n\nThe DORA metrics quantify delivery performance: deployment frequency (how often you deploy), lead time for changes (commit to production), change failure rate (percentage of deployments causing incidents), and mean time to recovery (how quickly you fix failures). Elite performers deploy on demand (multiple times per day), have lead times under an hour, change failure rates under 15%, and recover in under an hour. CD practices — automated pipelines, trunk-based development, comprehensive testing, deployment automation — are the primary drivers of these metrics.",
  ],
  interviewQA: [
    {
      q: "What is the difference between Continuous Delivery and Continuous Deployment?",
      a: "Continuous Delivery ensures every commit that passes the pipeline is deployable but keeps the production release as a manual decision. Continuous Deployment automates that final step — every passing commit goes to production without human intervention. Continuous Delivery is the prerequisite; continuous deployment is the next level. Many regulated industries use Continuous Delivery because they require manual approval gates before production releases, even though the actual deployment is fully automated.",
      followUps: [
        "When would you choose Continuous Delivery over Continuous Deployment?",
        "How do you handle compliance approvals in a continuous deployment model?",
      ],
    },
    {
      q: "How do you handle database migrations in a Continuous Delivery pipeline?",
      a: "Use versioned, forward-only migrations managed by tools like Flyway or Liquibase. Each migration is a numbered script applied in order. Critically, migrations must be backward-compatible: the previous application version must work with the new schema. This is achieved using the expand-and-contract pattern — add new columns/tables first, update code to use them, then remove old ones in a later migration. Never rename or drop columns in the same deployment that changes the code using them. Test migrations against a copy of production data before applying to production.",
      followUps: [
        "How do you handle migration failures in production?",
        "What is the expand-and-contract pattern?",
      ],
    },
    {
      q: "What makes an artifact 'immutable' and why does it matter?",
      a: "An immutable artifact is built once and deployed to every environment without modification. The same Docker image, JAR, or binary that passes tests in CI is promoted to staging and then to production. Environment-specific configuration is injected externally (environment variables, config maps, secrets). This eliminates 'it passed tests but the production build is different' problems. Immutability also enables reliable rollback — you can always redeploy a known-good artifact. If you rebuild for each environment, you introduce variables (dependency versions, build flags) that may cause subtle differences.",
    },
    {
      q: "How do you implement zero-downtime deployments?",
      a: "Use rolling deployments (update instances one at a time while others serve traffic), blue-green deployments (switch traffic between two environments), or canary releases (gradually shift traffic). Ensure health checks are configured so the load balancer only routes traffic to healthy instances. Use connection draining to let in-flight requests complete before shutting down old instances. Database schema changes must be backward-compatible. Preload caches before cutover. Test the deployment process regularly so it is reliable when it matters.",
    },
  ],
  mcqs: [
    {
      q: "What is the key difference between Continuous Delivery and Continuous Deployment?",
      options: [
        "Continuous Delivery is faster than Continuous Deployment",
        "Continuous Delivery requires a manual release decision; Continuous Deployment automates it",
        "Continuous Deployment does not require automated tests",
        "Continuous Delivery only applies to web applications",
      ],
      answerIndex: 1,
      explanation: "In CD, every passing commit is deployable but a human decides when to release. In continuous deployment, the release to production is automated — no manual gate.",
    },
    {
      q: "What is the expand-and-contract pattern for database migrations?",
      options: [
        "Scale the database up before migration and down after",
        "Add new schema elements first, migrate data, then remove old elements in a later step",
        "Run migrations in a transaction that can be rolled back",
        "Use a separate database for each deployment version",
      ],
      answerIndex: 1,
      explanation: "Expand adds new columns/tables alongside old ones. Code writes to both. After all code uses the new schema, the contract step removes the old elements. Each step is backward-compatible.",
    },
    {
      q: "What is an immutable artifact?",
      options: [
        "An artifact that cannot be deleted from storage",
        "An artifact built once and deployed unchanged to all environments",
        "An artifact with no external dependencies",
        "An artifact that includes its own runtime environment",
      ],
      answerIndex: 1,
      explanation: "An immutable artifact is built once during CI. The same binary/image is promoted through environments. Configuration is injected externally, ensuring consistency.",
    },
    {
      q: "Which DORA metric measures how quickly an organization recovers from production failures?",
      options: [
        "Deployment frequency",
        "Lead time for changes",
        "Change failure rate",
        "Mean time to recovery (MTTR)",
      ],
      answerIndex: 3,
      explanation: "MTTR measures the time from a production incident being detected to the service being restored. Elite performers recover in under an hour.",
    },
    {
      q: "What is connection draining?",
      options: [
        "Removing idle database connections from the pool",
        "Allowing in-flight requests to complete before removing an instance from the load balancer",
        "Flushing DNS caches during deployment",
        "Emptying message queues before shutting down consumers",
      ],
      answerIndex: 1,
      explanation: "Connection draining ensures that active requests are completed before an instance is terminated during a deployment, preventing errors for in-progress users.",
    },
  ],
  flashcards: [
    { front: "What does 'always deployable' mean in CD?", back: "Every commit that passes the full pipeline is in a state where it could be released to production at any moment, even if the team chooses not to release it yet." },
    { front: "What is artifact promotion?", back: "Moving a tested, validated artifact from one environment (dev to staging to prod) without rebuilding it, ensuring the same binary reaches production." },
    { front: "What is a smoke test?", back: "A quick, high-level test run against a freshly deployed environment to verify that the most critical paths work (app starts, login works, key API responds)." },
    { front: "What is Flyway?", back: "A database migration tool that uses versioned SQL scripts applied in order, with checksums to ensure migrations have not been tampered with." },
    { front: "What is environment parity?", back: "The principle that dev, staging, and production environments should be as identical as possible in configuration, infrastructure, and deployment process." },
    { front: "What is deployment frequency?", back: "A DORA metric measuring how often an organization deploys to production. Elite performers deploy on demand, multiple times per day." },
    { front: "What is a release train?", back: "A scheduled deployment cadence (e.g., weekly) where all changes ready by the cutoff date are deployed together as a batch." },
  ],
  glossary: [
    { term: "Continuous Delivery (CD)", definition: "A practice ensuring that code is always in a deployable state, with production releases requiring only a manual approval." },
    { term: "Continuous Deployment", definition: "An extension of CD where every commit that passes the pipeline is automatically deployed to production without manual intervention." },
    { term: "Immutable Artifact", definition: "A build output created once and deployed unchanged to all environments, with configuration injected externally." },
    { term: "Expand-and-Contract", definition: "A database migration pattern that adds new schema elements alongside old ones, migrates data, then removes old elements in separate steps." },
    { term: "Rollback", definition: "Reverting a production deployment to a previous known-good state, either by redeploying an older artifact or switching traffic." },
    { term: "Connection Draining", definition: "Allowing in-flight requests to complete before removing an instance from the load balancer during deployment." },
    { term: "Smoke Test", definition: "A quick validation that critical functionality works after a deployment, typically covering startup, authentication, and key API endpoints." },
    { term: "DORA Metrics", definition: "Four metrics (deployment frequency, lead time, change failure rate, MTTR) that measure software delivery and operational performance." },
  ],

  deepDive: [
    "**Pipeline architecture** is the backbone of any CD system. Teams practicing **trunk-based development** commit directly to `main` (or a single shared branch) with short-lived feature branches lasting hours, not days — this minimizes merge conflicts and keeps the pipeline flowing. In contrast, **feature branching** models like *Gitflow* create longer-lived branches that can drift from trunk, increasing integration risk. Regardless of branching model, every pipeline should produce **immutable artifacts** stored in an *artifact registry* (e.g., `Docker Hub`, `JFrog Artifactory`, `AWS ECR`). **Environment promotion** strategies dictate how artifacts move from `dev` to `staging` to `production` — this can be sequential gating with manual approvals, or fully automated promotion based on test results. **GitOps** takes this further: the desired state of every environment is declared in a *Git repository*, and a reconciliation controller (like `ArgoCD` or `Flux`) continuously syncs the cluster to match. This makes Git the **single source of truth** for both application code *and* infrastructure state, providing an auditable history of every change.",

    "**Advanced deployment strategies** go beyond simple rolling updates. A **canary release** routes a small percentage (e.g., *5%*) of production traffic to the new version while monitoring key metrics — **error rate**, **latency p99**, and **saturation**. Tools like `Flagger` and `Argo Rollouts` automate *progressive delivery*: they define a `Canary` custom resource that specifies the traffic-shifting schedule (e.g., *5% → 10% → 25% → 50% → 100%*), the **analysis queries** (Prometheus, Datadog, CloudWatch), and the **rollback threshold**. If metrics breach the threshold at any step, the controller **automatically rolls back** to the stable version — no human intervention required. **Blue-green deployments** maintain two identical production environments; traffic switches atomically via load balancer or DNS, enabling instant rollback by flipping back. **Traffic shifting** can also be managed at the *service mesh* layer (e.g., `Istio` `VirtualService` weights), giving fine-grained control over which users or requests hit the new version — enabling *dark launches*, *A/B tests*, and *shadow traffic* patterns.",

    "**CD in regulated environments** (finance, healthcare, government) requires reconciling *speed* with **compliance**. The key principle is **compliance as code**: encode regulatory requirements as automated pipeline checks rather than manual checklists. Every pipeline run generates a comprehensive **audit trail** — who triggered the build, what commit was deployed, which tests passed, who approved the release, and when it reached production. **Separation of duties** is enforced structurally: developers cannot approve their own changes, and the pipeline uses *distinct service accounts* for build, deploy, and production access. Traditional **Change Advisory Boards (CABs)** that meet weekly to review changes are replaced by **automated governance** — policy-as-code tools like `Open Policy Agent (OPA)` validate that deployments meet compliance rules *before* they execute. Pre-approved *standard changes* (fully tested, low-risk deployments through the pipeline) can bypass CAB entirely, while *emergency changes* follow a streamlined fast-track process with post-hoc review. This approach satisfies auditors while maintaining deployment velocity.",
  ],

  code: [
    {
      language: "yaml",
      caption: "GitHub Actions CD pipeline — build, test, and deploy to Kubernetes",
      source: `name: CD Pipeline
on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: npm ci && npm test
      - name: Build Docker image
        run: |
          docker build -t \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} .
      - name: Push to registry
        run: |
          echo "\${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
          docker push \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          kubectl set image deployment/myapp \\
            myapp=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} \\
            --namespace=staging
      - name: Run smoke tests
        run: npm run test:smoke -- --target=https://staging.example.com

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production    # requires manual approval
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          kubectl set image deployment/myapp \\
            myapp=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} \\
            --namespace=production
      - name: Verify health
        run: |
          kubectl rollout status deployment/myapp --namespace=production --timeout=300s`,
    },
    {
      language: "yaml",
      caption: "Kubernetes rolling deployment manifest with health checks and resource limits",
      source: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # add 1 extra pod during update
      maxUnavailable: 0    # never drop below desired count
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: ghcr.io/org/myapp:BUILD_SHA
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
      terminationGracePeriodSeconds: 30   # connection draining`,
    },
    {
      language: "sql",
      caption: "Flyway-style expand-and-contract database migration (versioned, forward-only)",
      source: `-- V3__expand_add_email_column.sql
-- EXPAND phase: add new column without removing old ones
-- Old code continues to work with 'username' column

ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Backfill from existing data (run in batches for large tables)
UPDATE users SET email = username || '@legacy.example.com'
  WHERE email IS NULL;

-- Add index for the new column
CREATE INDEX idx_users_email ON users(email);

------------------------------------------------------------
-- V4__contract_drop_username.sql  (deployed AFTER code migration)
-- CONTRACT phase: remove old column once all code uses 'email'
-- Only run this AFTER verifying no queries reference 'username'

-- Safety check: ensure no NULL emails exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email IS NULL) THEN
    RAISE EXCEPTION 'Cannot contract: NULL emails still exist';
  END IF;
END $$;

ALTER TABLE users DROP COLUMN username;

-- Each migration file is checksummed by Flyway to prevent tampering
-- Migrations are applied in version order and never modified after execution`,
    },
  ],

  diagrams: [
    {
      title: "CD Pipeline Flow - Commit to Production",
      kind: "flow",
      caption: "End-to-end continuous delivery pipeline showing gates, artifact promotion, and environment progression from commit to production.",
      mermaid: `flowchart LR
    A["Developer Commit"] --> B["Build and Unit Tests"]
    B --> C{Tests Pass?}
    C -- No --> D["Notify and Fix"]
    C -- Yes --> E["Build Immutable Artifact"]
    E --> F["Push to Artifact Registry"]
    F --> G["Deploy to Dev"]
    G --> H["Integration Tests"]
    H --> I{Tests Pass?}
    I -- No --> D
    I -- Yes --> J["Deploy to Staging"]
    J --> K["Smoke Tests and QA"]
    K --> L{Approved?}
    L -- No --> D
    L -- Yes --> M["Deploy to Production"]
    M --> N["Health Checks"]
    N --> O{Healthy?}
    O -- No --> P["Automatic Rollback"]
    O -- Yes --> Q["Monitor and Observe"]`,
    },
    {
      title: "Blue-Green and Canary Deployment Architecture",
      kind: "architecture",
      caption: "Blue-green uses atomic traffic switching for instant rollback; canary gradually shifts traffic with metric-driven promotion.",
      mermaid: `flowchart TB
    subgraph BlueGreen["Blue-Green Deployment"]
        LB1["Load Balancer"] --> BGS{"Traffic Switch"}
        BGS -- "100%" --> BLUE["Blue Environment\nv1.2 Current"]
        BGS -. "0 to 100%" .-> GREEN["Green Environment\nv1.3 New"]
        BLUE --> DB1[("Shared Database")]
        GREEN --> DB1
    end

    subgraph Canary["Canary Deployment"]
        LB2["Load Balancer"] --> SPLIT{"Traffic Split"}
        SPLIT -- "95%" --> STABLE["Stable Pool v1.2"]
        SPLIT -- "5%" --> CAN["Canary Pool v1.3"]
        CAN --> METRICS["Metrics Analysis\nerror rate and latency"]
        METRICS -- "OK" --> PROMOTE["Promote 5 to 25 to 100%"]
        METRICS -- "Degraded" --> ROLLBACK["Rollback to Stable"]
    end`,
    },
    {
      title: "Expand-and-Contract Database Migration",
      kind: "sequence",
      caption: "Three-phase migration strategy ensuring the previous application version is always compatible with the schema at every step.",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant Pipeline as CD Pipeline
    participant App2 as App v2 Dual-Write
    participant App3 as App v3 New Only
    participant DB as Database

    Note over Dev,DB: Phase 1 - EXPAND
    Dev->>Pipeline: Deploy migration V3
    Pipeline->>DB: ALTER TABLE ADD COLUMN email
    Pipeline->>DB: Backfill email from username
    Dev->>Pipeline: Deploy App v2
    Pipeline->>App2: Deploy dual-write code
    App2->>DB: INSERT username and email both

    Note over Dev,DB: Phase 2 - VERIFY
    App2->>DB: Confirm all rows have email
    App2->>DB: Read from email column primary

    Note over Dev,DB: Phase 3 - CONTRACT
    Dev->>Pipeline: Deploy App v3
    Pipeline->>App3: Deploy new-only code
    Dev->>Pipeline: Deploy migration V4
    Pipeline->>DB: ALTER TABLE DROP COLUMN username`,
    },
    {
      title: "Deployment Pipeline State Machine",
      kind: "state",
      caption: "States a deployment passes through from commit to production, including rollback paths triggered by health check failures.",
      mermaid: `stateDiagram-v2
    [*] --> Building: Code pushed to main
    Building --> Testing: Build artifact created
    Testing --> SecurityScan: Unit tests pass
    SecurityScan --> StagingDeploy: No critical CVEs
    StagingDeploy --> SmokeTest: Deploy to staging

    Testing --> Failed: Tests fail
    SecurityScan --> Failed: Critical vulnerability found
    SmokeTest --> Failed: Smoke tests fail

    SmokeTest --> AwaitingApproval: All checks pass
    AwaitingApproval --> ProductionDeploy: Human approves
    ProductionDeploy --> HealthCheck: Deploy complete
    HealthCheck --> Live: Health checks pass
    HealthCheck --> RollingBack: Health checks fail
    RollingBack --> Live: Previous version restored

    Failed --> [*]: Notify team
    Live --> [*]: Monitor`,
    },
  ],

  comparison: {
    columns: ["**Strategy**", "**Downtime**", "**Rollback Speed**", "**Resource Cost**", "**Complexity**", "**Best For**"],
    rows: [
      ["**Rolling Update**", "*Zero* (gradual)", "*Minutes* — redeploy old version", "*Low* — 1 extra pod at a time", "*Low*", "Stateless services with good health checks"],
      ["**Blue-Green**", "*Zero* (atomic switch)", "*Seconds* — flip load balancer", "*High* — 2x infrastructure", "*Medium*", "Critical services needing instant rollback"],
      ["**Canary**", "*Zero* (gradual shift)", "*Seconds* — route back to stable", "*Medium* — small canary pool", "*High*", "High-traffic services needing metric validation"],
      ["**Recreate**", "*Yes* — all pods replaced", "*Minutes* — redeploy old version", "*Low* — no parallel run", "*Low*", "Dev/test environments or stateful singletons"],
      ["**Feature Flags**", "*Zero* (toggle in config)", "*Instant* — disable flag", "*None* — same deployment", "*Medium*", "Decoupling deploy from release; A/B testing"],
    ],
  },

  exercises: [
    "**Build a CD pipeline from scratch**: Set up a `GitHub Actions` or `GitLab CI` pipeline that builds a Docker image on every commit to `main`, pushes it to a container registry, deploys to a *staging* environment, runs smoke tests, and then requires **manual approval** before deploying to production. Measure your **lead time for changes** from commit to production.",
    "**Implement blue-green deployments**: Using `Kubernetes` (or `Docker Compose` for simplicity), create two identical environments (*blue* and *green*). Write a script that deploys the new version to the inactive environment, runs health checks, and then switches the `Service` or load balancer to point to the new environment. Practice **rolling back** by switching back to the previous environment.",
    "**Practice expand-and-contract database migrations**: Using `Flyway` or plain SQL scripts, implement a schema change that renames a column using the *three-phase approach*: (1) add the new column and backfill, (2) deploy code that writes to both, (3) drop the old column. Verify that the application works correctly at **every intermediate step**.",
    "**Measure and improve DORA metrics**: Instrument your pipeline to track the *four DORA metrics*: `deployment frequency`, `lead time for changes`, `change failure rate`, and `mean time to recovery`. Set up a **dashboard** (Grafana, Datadog, or a spreadsheet) and identify which metric is your bottleneck. Implement one improvement and measure its impact over two weeks.",
    "**Implement canary releases with automated rollback**: Deploy a canary version that receives *10%* of traffic. Set up **metric-based analysis** (error rate < 1%, p99 latency < 500ms) using `Prometheus` or `CloudWatch`. Configure automatic rollback if metrics breach thresholds. Test by deploying a deliberately broken version and verifying the system **self-heals**.",
  ],

  cheatSheet: [
    "**CD vs Continuous Deployment**: CD = every commit is *deployable* (manual release); Continuous Deployment = every commit is *deployed* (automated release). CD is the prerequisite.",
    "**Immutable Artifacts**: Build once, deploy everywhere. Tag with `git SHA`, never `latest`. Store in a registry (`ECR`, `GCR`, `Artifactory`). Inject config via **env vars** or `ConfigMaps`.",
    "**Deployment Strategies**: `Rolling` = gradual, low cost; `Blue-Green` = instant rollback, 2x cost; `Canary` = metric-driven, medium cost; `Feature Flags` = decouple deploy from release.",
    "**Expand-and-Contract**: (1) *Expand* — add new column, backfill data; (2) *Migrate* — deploy dual-write code, verify; (3) *Contract* — drop old column. **Never** rename/drop in the same deploy as code changes.",
    "**DORA Metrics**: `Deployment Frequency` (how often), `Lead Time` (commit → prod), `Change Failure Rate` (% causing incidents), `MTTR` (time to recover). Elite: multiple deploys/day, <1hr lead time, <15% failure rate, <1hr recovery.",
    "**Rollback Checklist**: (1) Is the database migration backward-compatible? (2) Can the previous artifact be redeployed? (3) Are feature flags in place for risky changes? (4) Is connection draining configured? (5) Are health checks reliable?",
  ],

  revisionNotes: [
    "**Continuous Delivery** keeps every commit *deployable* with a **manual release gate**, while **Continuous Deployment** automates the final step. The pipeline is the **only** path to production — it builds **immutable artifacts**, runs tests, and promotes through environments. Key enablers: `trunk-based development`, `artifact registries`, and `GitOps` for declarative environment state.",
    "**Deployment strategies** trade off between *rollback speed*, *resource cost*, and *complexity*. **Blue-green** gives instant rollback via load balancer switch but requires **2x infrastructure**. **Canary** progressively shifts traffic with automated metric analysis (use `Flagger` or `Argo Rollouts`). **Rolling updates** are the simplest but rollback requires a full redeployment. **Feature flags** decouple deployment from release entirely.",
    "**Database migrations** are the hardest part of CD because they are *stateful* and difficult to reverse. The **expand-and-contract** pattern is essential: add new schema → deploy dual-write code → backfill → deploy new-only code → drop old schema. Each step must be **backward-compatible**. Use versioned, forward-only migration tools (`Flyway`, `Liquibase`) with checksums.",
    "**DORA metrics** are the standard for measuring CD maturity: *deployment frequency*, *lead time for changes*, *change failure rate*, and *MTTR*. In **regulated environments**, encode compliance as code — automated policy checks (`OPA`), audit trails, separation of duties enforced by pipeline roles, and pre-approved standard changes replace manual **CAB** reviews.",
    "**Rollback** is a first-class concern: blue-green flips the LB, canary routes back to stable, feature flags toggle off, and redeployment pushes the previous artifact. **Database rollback** is avoided by ensuring every migration is backward-compatible — the old code version must work with the new schema during the transition window.",
  ],
};
