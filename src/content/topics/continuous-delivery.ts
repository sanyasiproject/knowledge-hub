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
};
