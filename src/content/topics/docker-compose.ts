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
  deepDive: [
    "## The Compose File Specification and Build Pipeline\n\nDocker Compose relies on the **Compose Specification**, an open standard that decouples the file format from any single tool. The `compose.yaml` file (preferred over the legacy `docker-compose.yml` name) is parsed into a **project model** consisting of *services*, *networks*, *volumes*, *configs*, and *secrets*. When you run `docker compose up`, the CLI resolves **build contexts** for any service with a `build` key, executes multi-stage `Dockerfile` builds (optionally leveraging **BuildKit** for layer caching, parallel stages, and secret mounts), tags the resulting image with the project name, and then creates containers from those images. Understanding this pipeline is critical: the `build.context` is the directory sent to the Docker daemon, `build.dockerfile` names the Dockerfile within that context, and `build.target` selects a specific stage in a multi-stage build. **Build arguments** (`build.args`) inject values at build time (e.g., `NODE_ENV=production`), while **environment variables** (`environment` or `env_file`) are injected at *run time*. Confusing the two is a common source of bugs in MERN stack deployments where the React frontend needs build-time `REACT_APP_*` variables baked into the static bundle.",
    "## Networking, Service Discovery, and Security Boundaries\n\nCompose networking goes far beyond the default bridge. Each project gets an **isolated bridge network** named `<project>_default`, and every service is reachable by its *service name* as a DNS hostname. For a MERN stack, this means the **Express API** can connect to MongoDB at `mongodb://mongo:27017` without hardcoding IPs. Custom networks create **security boundaries**: placing `mongo` only on a `backend` network and `nginx` only on a `frontend` network ensures the reverse proxy *cannot* reach the database directly -- the API service, joined to both networks, acts as the sole bridge. **Network aliases** let you assign additional DNS names to a service (useful when migrating from one database to another without changing application config). The `extra_hosts` directive can inject `/etc/hosts` entries for services that need to reach external systems by name. For **production-grade setups**, overlay networks extend this model across Docker Swarm nodes, while `network_mode: host` removes network isolation entirely for latency-sensitive workloads.",
    "## Development Workflow: Watch, Overrides, and Secrets Management\n\nA modern Compose development workflow combines **override files**, **Compose Watch**, and **secrets management**. The base `compose.yaml` defines production-like services, while `compose.override.yaml` (automatically merged) adds development conveniences: bind mounts for live code reloading, debug ports, and relaxed resource limits. Compose Watch (v2.22+) improves on bind mounts by giving explicit control -- `sync` actions hot-reload source files, `rebuild` actions handle dependency changes like `package.json` or `go.mod`, and `sync+restart` handles config files that require a process restart. For secrets, Compose supports a top-level `secrets` key that mounts files into `/run/secrets/<name>` inside the container, avoiding environment variables (which leak into logs, child processes, and crash dumps). In a MERN stack, you would store the **MongoDB connection string**, **JWT signing key**, and **API keys** as secrets. The `configs` top-level key similarly injects read-only configuration files (like `nginx.conf`) without baking them into the image, enabling the same image to serve multiple environments.",
  ],
  code: [
    {
      language: "yaml",
      caption: "Full MERN stack compose.yaml with health checks, networks, and Compose Watch",
      source: `# compose.yaml — MERN Stack (MongoDB, Express, React, Nginx)
services:
  # --- MongoDB ---
  mongo:
    image: mongo:7
    container_name: mern-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_password
    volumes:
      - mongo-data:/data/db
    networks:
      - backend
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    secrets:
      - mongo_password

  # --- Express API ---
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
      target: development
    container_name: mern-api
    restart: unless-stopped
    environment:
      NODE_ENV: development
      MONGO_URI: mongodb://admin:\${MONGO_PASSWORD}@mongo:27017/app?authSource=admin
      PORT: "3000"
    ports:
      - "3000:3000"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - backend
      - frontend
    develop:
      watch:
        - action: sync
          path: ./server/src
          target: /app/src
        - action: rebuild
          path: ./server/package.json

  # --- React Frontend ---
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      target: development
      args:
        REACT_APP_API_URL: http://localhost:3000/api
    container_name: mern-client
    restart: unless-stopped
    ports:
      - "5173:5173"
    networks:
      - frontend
    develop:
      watch:
        - action: sync
          path: ./client/src
          target: /app/src
        - action: rebuild
          path: ./client/package.json

  # --- Nginx Reverse Proxy ---
  nginx:
    image: nginx:alpine
    container_name: mern-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
      - client
    networks:
      - frontend

  # --- Debug Tools (profile-gated) ---
  mongo-express:
    image: mongo-express:latest
    profiles: ["debug"]
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD_FILE: /run/secrets/mongo_password
      ME_CONFIG_MONGODB_URL: mongodb://admin:\${MONGO_PASSWORD}@mongo:27017/
    ports:
      - "8081:8081"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - backend
    secrets:
      - mongo_password

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  mongo-data:

secrets:
  mongo_password:
    file: ./secrets/mongo_password.txt`,
    },
    {
      language: "dockerfile",
      caption: "Multi-stage Dockerfile for the Express API (development and production targets)",
      source: `# server/Dockerfile — Multi-stage build for Express API

# ---- Base stage ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && \\
    cp -R node_modules /prod_modules

# ---- Development stage ----
FROM node:20-alpine AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npx", "nodemon", "--watch", "src", "src/index.js"]

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /prod_modules ./node_modules
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/index.js"]`,
    },
    {
      language: "dockerfile",
      caption: "Multi-stage Dockerfile for the React client with Nginx production serving",
      source: `# client/Dockerfile — Multi-stage build for React frontend

# ---- Development stage ----
FROM node:20-alpine AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=\${REACT_APP_API_URL}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
    },
  ],
  diagrams: [
    {
      title: "MERN Stack Compose Architecture",
      kind: "architecture",
      caption: "Service topology showing network segmentation, volume mounts, and dependency flow",
      mermaid: `graph TB
  subgraph "Frontend Network"
    NGINX["**nginx** :80<br/>Reverse Proxy"]
    CLIENT["**client** :5173<br/>React Dev Server"]
    API_F["**api** :3000<br/>Express API"]
  end

  subgraph "Backend Network"
    API_B["**api** :3000<br/>Express API"]
    MONGO["**mongo** :27017<br/>MongoDB 7"]
    ME["**mongo-express** :8081<br/>Debug UI"]
  end

  subgraph "Volumes"
    VOL[("mongo-data")]
  end

  subgraph "Secrets"
    SEC[/"mongo_password.txt"/]
  end

  NGINX --> CLIENT
  NGINX --> API_F
  API_B -->|depends_on: healthy| MONGO
  ME -.->|profile: debug| MONGO
  MONGO --- VOL
  MONGO --- SEC
  ME --- SEC`,
    },
    {
      title: "Docker Compose Up Lifecycle",
      kind: "flow",
      caption: "The sequence of steps when running docker compose up with build and health checks",
      mermaid: `flowchart TD
  A["**docker compose up --build**"] --> B["Parse compose.yaml"]
  B --> C{"Services with<br/>build key?"}
  C -->|Yes| D["Resolve build context<br/>and Dockerfile"]
  C -->|No| E["Pull image<br/>from registry"]
  D --> F["Build image<br/>(BuildKit)"]
  F --> G["Tag image with<br/>project prefix"]
  E --> H["Create networks"]
  G --> H
  H --> I["Create volumes"]
  I --> J["Sort services by<br/>depends_on DAG"]
  J --> K["Start dependency<br/>services first"]
  K --> L{"Health check<br/>defined?"}
  L -->|Yes| M["Wait for<br/>service_healthy"]
  L -->|No| N["Container started =<br/>dependency met"]
  M --> O["Start dependent<br/>services"]
  N --> O
  O --> P["All services running"]
  P --> Q{"Watch mode<br/>enabled?"}
  Q -->|Yes| R["Monitor file changes<br/>sync / rebuild / restart"]
  Q -->|No| S["Attach to logs"]`,
    },
    {
      title: "Compose Watch Decision Flow",
      kind: "flow",
      caption: "How Compose Watch selects sync, rebuild, or sync+restart based on file change type",
      mermaid: `flowchart LR
  A["File change<br/>detected"] --> B{"Matches which<br/>watch rule?"}
  B -->|"Source code<br/>(src/)"|C["**action: sync**"]
  B -->|"Dependency file<br/>(package.json)"|D["**action: rebuild**"]
  B -->|"Config file<br/>(.env, config/)"|E["**action: sync+restart**"]
  C --> F["Copy changed file<br/>to container target"]
  F --> G["Hot reload picks<br/>up change"]
  D --> H["Rebuild Docker<br/>image"]
  H --> I["Recreate and<br/>restart container"]
  E --> J["Copy file to<br/>container target"]
  J --> K["Restart container<br/>process"]`,
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "**Docker Compose**",
      "**Docker Swarm**",
      "**Kubernetes (K8s)**",
    ],
    rows: [
      [
        "**Primary use case**",
        "Local dev & single-host deployment",
        "Simple multi-host orchestration",
        "Production-grade container orchestration at scale",
      ],
      [
        "**Config format**",
        "`compose.yaml` (Compose Spec)",
        "`compose.yaml` with `deploy` key",
        "YAML manifests (Deployment, Service, ConfigMap, etc.)",
      ],
      [
        "**Scaling**",
        "`--scale` flag, manual",
        "Declarative replicas via `deploy.replicas`",
        "HPA, VPA, KEDA — auto-scaling on metrics",
      ],
      [
        "**Service discovery**",
        "DNS on bridge network (service name)",
        "DNS + VIP-based load balancing",
        "CoreDNS, `ClusterIP` Services, Ingress controllers",
      ],
      [
        "**Rolling updates**",
        "Recreate only (`up --build`)",
        "`update_config` with parallelism & delay",
        "Rolling update strategy with `maxSurge` / `maxUnavailable`",
      ],
      [
        "**Health checks**",
        "`healthcheck` in compose file",
        "Same + affects rolling updates",
        "Liveness, readiness, and startup probes",
      ],
      [
        "**Secrets management**",
        "File-based (`/run/secrets`)",
        "Encrypted Raft log secrets",
        "Kubernetes Secrets (base64), external vaults (Sealed Secrets, Vault)",
      ],
      [
        "**Networking**",
        "Bridge (single host)",
        "Overlay (multi-host)",
        "CNI plugins (Calico, Cilium, Flannel), NetworkPolicies",
      ],
      [
        "**Learning curve**",
        "Low — single YAML file",
        "Medium — extends Compose with Swarm concepts",
        "High — many resource types, RBAC, CRDs, operators",
      ],
      [
        "**Best for**",
        "Dev environments, CI, small self-hosted apps",
        "Small production clusters, teams already on Docker",
        "Large-scale production, microservices, cloud-native",
      ],
    ],
  },
  exercises: [
    "**MERN Stack Setup**: Create a `compose.yaml` that runs *MongoDB*, an *Express API*, and a *React frontend*. The API must not start until MongoDB's health check passes. Add a named volume for database persistence and custom networks to isolate frontend from backend traffic.",
    "**Compose Watch Configuration**: Extend your MERN stack Compose file with `develop.watch` rules. Configure `sync` for source code changes in both the API and client, `rebuild` for `package.json` changes, and `sync+restart` for `.env` file changes. Verify each action triggers correctly by modifying the appropriate files.",
    "**Multi-Environment Overrides**: Create a base `compose.yaml` for production and a `compose.override.yaml` for development. The override should add bind mounts, expose debug ports (e.g., `9229` for Node.js inspector), relax resource limits, and enable `mongo-express` via a `debug` profile. Verify that `docker compose config` merges them correctly.",
    "**Secrets and Environment Separation**: Refactor a Compose file that passes database credentials via `environment` to use the `secrets` top-level key instead. Mount the secret files into `/run/secrets/` and update the application to read credentials from there. Confirm that `docker compose exec api env` no longer leaks the password.",
    "**Blue-Green Deployment Simulation**: Define two versions of an API service (`api-blue` and `api-green`) in the same Compose file, each on the `frontend` network. Configure the `nginx` reverse proxy to route traffic to `api-blue` by default. Practice switching traffic to `api-green` by updating `nginx.conf` and running `docker compose exec nginx nginx -s reload` without downtime.",
  ],
  cheatSheet: [
    "`docker compose up -d --build` — **Build** images and start all services in **detached** mode. The `--build` flag forces a rebuild even if the image cache is valid.",
    "`docker compose down --volumes --remove-orphans` — **Stop** and remove containers, networks, named volumes, and any orphaned containers from previous runs. Omit `--volumes` to preserve database data.",
    "`docker compose logs -f --tail=100 api mongo` — **Stream** the last 100 lines of logs from the `api` and `mongo` services. Use `--since 5m` to filter by time.",
    "`docker compose exec api sh` — **Open a shell** inside the running `api` container. Use `exec` for interactive debugging; use `run` to spin up a one-off container from a service definition.",
    "`docker compose watch` — Start **Compose Watch** to monitor file changes and apply `sync`, `rebuild`, or `sync+restart` actions defined in the `develop.watch` section of each service.",
    "`docker compose config --no-interpolate` — **Validate and display** the fully merged Compose configuration (base + overrides) without resolving environment variable interpolation. Useful for debugging merge conflicts between `compose.yaml` and `compose.override.yaml`.",
  ],
  revisionNotes: [
    "Docker Compose uses a **declarative YAML file** to define multi-container applications. The three core primitives are *services* (containers), *networks* (DNS-based discovery and traffic isolation), and *volumes* (persistent storage). Services communicate by **service name** over the project's default bridge network.",
    "**`depends_on` alone only orders container startup** — it does not wait for readiness. Combine it with `condition: service_healthy` and a `healthcheck` block (using commands like `pg_isready`, `mongosh --eval`, or `curl -f`) to ensure dependencies are truly ready before dependent services start.",
    "**Compose Watch** (v2.22+) replaces fragile bind-mount workflows with three explicit actions: `sync` copies files without restart (hot reload), `rebuild` rebuilds the image and recreates the container (dependency changes), and `sync+restart` copies files then restarts the process (config changes). Override files (`compose.override.yaml`) layer development settings on top of a production-like base.",
    "**Secrets** should be mounted via the `secrets` top-level key into `/run/secrets/` rather than passed as environment variables, which leak into logs and process listings. Similarly, **configs** inject read-only configuration files without baking them into the image.",
    "For orchestration beyond a single host, **Docker Swarm** extends Compose with `deploy` keys for replicas and rolling updates, while **Kubernetes** provides auto-scaling, advanced networking (CNI, NetworkPolicies), and a rich ecosystem of operators — but with significantly higher complexity. Choose Compose for *development and small deployments*, Swarm for *simple multi-host needs*, and Kubernetes for *production-scale microservices*.",
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
