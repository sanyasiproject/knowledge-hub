import type { TopicContent } from "../types";

export const dockerCompose: TopicContent = {
  quickSummary: [
    "Docker Compose is a tool for defining and running multi-container Docker applications using a declarative YAML file (`compose.yaml`).",
    "Services, networks, and volumes are the three top-level primitives; services map to containers, networks provide DNS-based service discovery, and volumes persist data across restarts.",
    "The `depends_on` directive controls startup order, and with health-check conditions it can delay dependent services until their dependencies are truly ready.",
    "Compose profiles let you group optional services (e.g., debug tools, seed jobs) and activate them selectively with `--profile`, keeping the default stack lean.",
    "Compose Watch (v2.22+) enables live file-sync and auto-rebuild during development, replacing manual bind-mount workflows with explicit sync, rebuild, and sync+restart actions.",
  ],
  detailed: [
    "## Services\n\nA service is the fundamental unit in Compose. Each service declaration produces one or more containers from a single image (built locally or pulled from a registry). Key properties include `image`, `build` (with context, dockerfile, args, target for multi-stage builds), `command`, `entrypoint`, `environment`, `env_file`, `ports` (host:container mapping), and `deploy` (replicas, resource limits). Services can be scaled with `docker compose up --scale web=3`, but for production scaling Kubernetes or Swarm is preferred.",
    "## Networks\n\nCompose creates a default bridge network for every project, enabling automatic DNS resolution between services by service name. You can define custom networks to isolate traffic: a `frontend` network connecting the reverse proxy and web server, and a `backend` network connecting the web server and database. Services list which networks they join. Network drivers include `bridge` (single host), `overlay` (multi-host Swarm), and `host` (share the host network stack). External networks let multiple Compose projects communicate.",
    "## Volumes and Bind Mounts\n\nNamed volumes are the preferred way to persist data (databases, uploads) because Docker manages their lifecycle and they survive `docker compose down`. Bind mounts map a host directory into a container and are useful for development (live code reloading) but couple the container to the host filesystem layout. Tmpfs mounts provide in-memory storage for sensitive data that should not be written to disk. Volume drivers can back volumes with NFS, cloud storage, or distributed file systems.",
    "## depends_on and Health Checks\n\n`depends_on` by itself only guarantees container start order, not that the dependency is ready to accept connections. Adding `condition: service_healthy` makes Compose wait for the dependency's health check to pass before starting the dependent service. Health checks are defined with `healthcheck.test` (a command like `pg_isready` or `curl -f http://localhost/health`), `interval`, `timeout`, `retries`, and `start_period`. This eliminates fragile sleep-based wait scripts.",
    "## Profiles\n\nProfiles assign services to named groups. Services without a profile always start. Services with a profile only start when that profile is activated via `--profile` or the `COMPOSE_PROFILES` environment variable. Common patterns: a `debug` profile for tools like pgAdmin or Mailhog, a `seed` profile for one-shot data-loading jobs, and a `monitoring` profile for Prometheus and Grafana. Multiple profiles can be activated simultaneously.",
    "## Compose Watch\n\nIntroduced in Compose v2.22, `watch` provides three file-sync actions: `sync` (copy changed files into the running container without restart), `rebuild` (rebuild the image and recreate the container on changes to dependency files like `package.json`), and `sync+restart` (sync the file then restart the container, useful for config files). Each action specifies a `path` to watch and an optional `target` inside the container. This replaces error-prone bind-mount setups and gives explicit control over what triggers a rebuild versus a hot reload.",
  ],
  interviewQA: [
    {
      q: "What is the difference between `depends_on` and using health checks in Docker Compose?",
      a: "`depends_on` alone only controls container startup order -- it starts the dependency container before the dependent one, but does not wait for the dependency to be 'ready'. Adding `condition: service_healthy` makes Compose wait until the dependency's health check passes before starting the dependent service. This is critical for databases that take several seconds to initialize.",
      followUps: [
        "How would you implement a health check for a PostgreSQL service?",
        "What happens if a health check never passes?",
      ],
    },
    {
      q: "How do Compose networks provide service discovery, and when would you create custom networks?",
      a: "Compose automatically creates a default bridge network and registers each service name as a DNS entry, so containers can reach each other by service name (e.g., `http://api:3000`). You create custom networks to segment traffic -- for example, a `frontend` network for the reverse proxy and web app, and a `backend` network for the web app and database. The reverse proxy cannot directly reach the database because they share no common network, enforcing a basic layer of isolation.",
      followUps: [
        "Can two separate Compose projects communicate over a shared network?",
        "What is the difference between bridge and overlay network drivers?",
      ],
    },
    {
      q: "Explain the difference between named volumes and bind mounts. When would you use each?",
      a: "Named volumes are managed by Docker, stored in Docker's storage directory, survive `docker compose down`, and are portable across hosts. Bind mounts map a specific host path into the container, coupling it to the host filesystem. Use named volumes for persistent data (databases, uploads) and bind mounts for development workflows where you want the container to reflect live code changes on the host. In production, bind mounts are generally avoided because they depend on the host directory structure.",
    },
    {
      q: "What are Compose profiles and how do they help manage optional services?",
      a: "Profiles let you tag services with a profile name. Services without a profile always start with `docker compose up`, while services with a profile only start when you pass `--profile <name>`. This keeps the default stack minimal -- you might have a `debug` profile for pgAdmin and a `monitoring` profile for Prometheus. Multiple profiles can be activated at once, and the `COMPOSE_PROFILES` environment variable can set defaults per developer.",
    },
  ],
  mcqs: [
    {
      q: "What does `depends_on` with `condition: service_healthy` guarantee?",
      options: [
        "The dependent container starts only after the dependency container is created",
        "The dependent container starts only after the dependency's health check passes",
        "The dependent container shares the same network namespace as the dependency",
        "The dependent container mounts the dependency's volumes automatically",
      ],
      answerIndex: 1,
      explanation:
        "With `condition: service_healthy`, Compose waits for the health check to report healthy before starting the dependent service, ensuring the dependency is actually ready.",
    },
    {
      q: "Which Compose Watch action rebuilds the image and recreates the container?",
      options: ["sync", "rebuild", "sync+restart", "restart"],
      answerIndex: 1,
      explanation:
        "The `rebuild` action triggers a full image rebuild and container recreation, appropriate for changes to dependency files like `package.json` or `requirements.txt`.",
    },
    {
      q: "What is the default network driver for a Compose project on a single host?",
      options: ["host", "overlay", "bridge", "macvlan"],
      answerIndex: 2,
      explanation:
        "Compose creates a bridge network by default for single-host deployments. Overlay is used in Docker Swarm for multi-host networking.",
    },
    {
      q: "How do you activate a Compose profile from the command line?",
      options: [
        "`docker compose up --services=debug`",
        "`docker compose up --profile debug`",
        "`docker compose up --group debug`",
        "`docker compose up --tag debug`",
      ],
      answerIndex: 1,
      explanation:
        "The `--profile` flag activates named profiles. Services assigned to that profile are included in the startup, alongside services with no profile.",
    },
  ],
  flashcards: [
    {
      front: "What are the three top-level primitives in a Compose file?",
      back: "Services (containers), Networks (communication), and Volumes (persistent storage).",
    },
    {
      front: "How does Compose provide DNS-based service discovery?",
      back: "Each service name is registered as a DNS entry on the project's default bridge network, so containers can reach each other by name.",
    },
    {
      front: "What is the difference between named volumes and bind mounts?",
      back: "Named volumes are Docker-managed and portable; bind mounts map a specific host path into the container and are host-dependent.",
    },
    {
      front: "What does `depends_on: condition: service_healthy` do?",
      back: "It delays starting the dependent service until the dependency's health check reports healthy, ensuring true readiness.",
    },
    {
      front: "What are the three Compose Watch actions?",
      back: "sync (copy files without restart), rebuild (rebuild image and recreate container), sync+restart (sync files then restart container).",
    },
    {
      front: "What is a Compose profile used for?",
      back: "Grouping optional services that only start when explicitly activated with `--profile`, keeping the default stack lean.",
    },
    {
      front: "How do you persist database data across `docker compose down`?",
      back: "Use a named volume. Unlike bind mounts, named volumes survive container removal and `docker compose down` (unless `--volumes` is passed).",
    },
    {
      front: "What does `docker compose up --scale web=3` do?",
      back: "It runs three container instances of the `web` service. Port mappings must avoid conflicts (use ranges or omit host ports).",
    },
  ],
  glossary: [
    {
      term: "Service",
      definition:
        "A Compose primitive that defines a container's image, build instructions, configuration, and runtime behavior.",
    },
    {
      term: "Named Volume",
      definition:
        "A Docker-managed storage unit that persists data independently of container lifecycle and is referenced by name in the Compose file.",
    },
    {
      term: "Bridge Network",
      definition:
        "The default single-host network driver that provides container isolation and DNS-based service discovery within a Compose project.",
    },
    {
      term: "Health Check",
      definition:
        "A periodic command or HTTP probe that Docker runs inside a container to determine if the service is ready to accept traffic.",
    },
    {
      term: "Profile",
      definition:
        "A Compose feature that tags services into named groups, allowing selective activation of optional services.",
    },
    {
      term: "Compose Watch",
      definition:
        "A development feature (v2.22+) that monitors file changes and applies sync, rebuild, or sync+restart actions to running containers.",
    },
    {
      term: "Bind Mount",
      definition:
        "A volume type that maps a specific host filesystem path into a container, commonly used for development-time code sharing.",
    },
    {
      term: "Overlay Network",
      definition:
        "A multi-host network driver used in Docker Swarm that enables containers on different hosts to communicate as if on the same LAN.",
    },
  ],
};
