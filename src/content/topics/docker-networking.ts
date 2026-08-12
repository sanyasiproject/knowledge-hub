import type { TopicContent } from "../types";

export const dockerNetworking: TopicContent = {
  quickSummary: [
    "Docker bridge networking is the default network mode where containers connect to a virtual bridge (docker0) on the host, receiving private IP addresses and communicating with each other via the bridge while accessing external networks through NAT on the host's IP — user-defined bridge networks additionally provide automatic DNS resolution between containers by name.",
    "Host networking removes network isolation entirely, giving the container direct access to the host's network interfaces and ports without any NAT or port mapping, providing near-native network performance at the cost of port conflicts and reduced isolation.",
    "Overlay networking enables multi-host container communication by encapsulating container traffic in VXLAN tunnels between Docker Swarm nodes or Kubernetes hosts, creating a virtual Layer 2 network that spans multiple physical hosts while maintaining container IP addressing.",
    "Docker volumes are managed storage units that persist data independently of container lifecycle, while bind mounts map a specific host directory into the container — both solve the ephemeral nature of the container's writable layer but differ in portability, management, and performance characteristics.",
  ],
  detailed: [
    "## Bridge Networking\n\nThe default bridge network (docker0) is a Linux bridge created when Docker starts. Each container gets a veth (virtual Ethernet) pair: one end is in the container's network namespace (typically eth0), the other is attached to the docker0 bridge. Containers on the default bridge can communicate by IP address but not by container name — there is no built-in DNS. User-defined bridge networks provide automatic DNS resolution: containers resolve each other's names via Docker's embedded DNS server (127.0.0.11). User-defined bridges also provide better isolation (containers on different bridges cannot communicate) and allow containers to be attached/detached at runtime. Port publishing (-p 8080:80) creates iptables DNAT rules that forward traffic from the host's port 8080 to the container's port 80. Without port publishing, container ports are accessible only from the host and other containers on the same network.",
    "## Host and None Networks\n\nHost networking (--network host) bypasses Docker's network namespacing entirely. The container shares the host's network namespace, seeing all host interfaces, IP addresses, and ports. A server binding to port 80 in the container binds directly to port 80 on the host — no NAT, no port mapping, no iptables rules. This provides the best network performance (no bridge overhead, no NAT translation) and is useful for network-intensive applications or monitoring tools that need access to host network traffic. The downside is port conflicts (two containers cannot both bind to port 80) and zero network isolation. None networking (--network none) provides a completely isolated network namespace with only the loopback interface, used for security-sensitive containers that should have no network access.",
    "## Overlay Networks and Multi-Host Communication\n\nOverlay networks create a virtual Layer 2 network spanning multiple Docker hosts using VXLAN (Virtual Extensible LAN) encapsulation. Each container on the overlay network gets an IP from the overlay subnet. When container A on host 1 communicates with container B on host 2, the traffic is encapsulated in a VXLAN packet (UDP port 4789), routed between hosts over the underlay network, and decapsulated at the destination. Docker Swarm manages overlay networking natively with a built-in key-value store for network state. Overlay networks support encryption (IPsec) for data-in-transit protection. In Kubernetes, overlay networking is provided by CNI plugins (Flannel, Calico, Cilium, Weave) with similar encapsulation approaches but using the Kubernetes networking model where every pod gets a unique IP.",
    "## Docker DNS and Service Discovery\n\nDocker's embedded DNS server (127.0.0.11) runs in every user-defined network and resolves container names and network aliases to container IP addresses. When a container joins a user-defined network, Docker registers its name and any --network-alias values in the DNS server. DNS round-robin provides basic load balancing for containers with the same alias. In Docker Swarm, services get a Virtual IP (VIP) that load-balances across all service tasks using IPVS (IP Virtual Server) in the Linux kernel — this is more reliable than DNS round-robin because clients do not cache stale DNS entries. Docker Compose automatically creates a user-defined bridge network for each project and registers services by their service name, enabling service-name-based communication without explicit networking configuration.",
    "## Volumes and Bind Mounts\n\nDocker volumes are managed by the Docker daemon and stored in /var/lib/docker/volumes/ by default. They are the preferred mechanism for persistent data because Docker manages their lifecycle (create, inspect, remove), they work on both Linux and Windows, they can be shared among multiple containers, and volume drivers enable remote storage backends (NFS, cloud storage, distributed filesystems). Bind mounts map an arbitrary host path into the container using -v /host/path:/container/path. They provide direct file access between host and container (useful for development hot-reloading) but are less portable because they depend on the host's directory structure. tmpfs mounts store data in the host's memory only — data does not persist and is never written to disk, useful for sensitive data like secrets. Volume behavior on container creation: named volumes pre-populate from the image content at the mount point; bind mounts override the mount point entirely.",
    "## Port Mapping and Network Security\n\nPort publishing creates iptables rules in the DOCKER chain. -p 8080:80 creates a DNAT rule mapping host:8080 to container:80 for all interfaces (0.0.0.0). Binding to a specific interface (-p 127.0.0.1:8080:80) restricts access to localhost. Docker modifies iptables directly, which can bypass host firewall rules (ufw, firewalld) — a common security pitfall where docker -p effectively punches through the firewall. Mitigations include: binding to localhost where external access is not needed, using Docker's --iptables=false flag (then manually managing rules), or using network policies. Inter-container communication on the same bridge is unrestricted by default; the --icc=false flag on the Docker daemon disables it, requiring explicit --link or published ports. In production, use user-defined networks with proper segmentation rather than relying on default bridge behavior.",
  ],
  animations: [
    {
      title: "Why `localhost` breaks inside a container",
      steps: [
        {
          label: "Container starts",
          detail: "It gets its own network namespace, with its own loopback interface.",
        },
        {
          label: "App calls localhost:5432",
          detail: "That resolves to the container's own loopback — not the host's.",
        },
        {
          label: "Nothing there",
          detail: "Connection refused, even though Postgres is running on the host.",
        },
        {
          label: "Bridge network",
          detail: "On a user-defined bridge, containers reach each other by service name — `postgres:5432`.",
        },
        {
          label: "Reaching the host",
          detail: "Use `host.docker.internal`, or run the dependency as another container on the same network.",
        },
        {
          label: "`--network host`",
          detail: "Shares the host's namespace, so localhost works — at the cost of all network isolation.",
        },
      ],
    },
  ],
  interviewQA: [
    {
      q: "What is the difference between the default bridge network and a user-defined bridge network?",
      a: "The default bridge (docker0) provides basic Layer 2 connectivity between containers by IP address only — there is no DNS resolution, all containers share the same default bridge, and containers must be linked for name resolution (legacy feature). User-defined bridges provide automatic DNS resolution by container name, better isolation (containers on different bridges cannot communicate), the ability to connect/disconnect containers at runtime without restarting, and configurable subnets and gateways. In practice, you should always use user-defined bridge networks. Docker Compose creates one automatically for each project.",
      followUps: [
        "How does Docker's embedded DNS server work?",
        "Can a container be connected to multiple networks?",
      ],
    },
    {
      q: "How does Docker port mapping work under the hood?",
      a: "When you publish a port with -p 8080:80, Docker creates iptables rules in the DOCKER chain. Specifically, a DNAT (Destination NAT) rule rewrites incoming packets destined for host:8080 to the container's IP:80. A corresponding MASQUERADE rule handles return traffic. For TCP, Docker also creates ACCEPT rules in the FORWARD chain. This means Docker modifies iptables directly, which can bypass host-level firewall tools like ufw or firewalld — a known security concern. Binding to a specific interface (-p 127.0.0.1:8080:80) adds an IP match condition to the DNAT rule, restricting access to localhost connections only.",
      followUps: [
        "How can you prevent Docker from bypassing the host firewall?",
        "What is the difference between -p and --expose?",
      ],
    },
    {
      q: "When would you use host networking versus bridge networking?",
      a: "Use host networking when you need maximum network performance without NAT overhead (latency-sensitive applications), when the container needs to see host-level network traffic (monitoring tools, network proxies), or when managing port mappings is impractical (applications binding to dynamic port ranges). Use bridge networking for application containers that need network isolation, predictable port mapping, DNS-based service discovery, and security boundaries between services. Host networking sacrifices isolation and introduces port conflict risks. Most production workloads use bridge or overlay networking; host networking is the exception for performance-critical or infrastructure-level containers.",
    },
    {
      q: "Explain the difference between volumes and bind mounts.",
      a: "Volumes are managed by Docker (docker volume create), stored in /var/lib/docker/volumes/, portable across hosts (with volume drivers), and support named references. Named volumes pre-populate from image content at the mount point on first use. Bind mounts map a specific host directory path into the container, depending on the host's filesystem structure. Bind mounts override whatever exists at the container mount point. Volumes are preferred for production data persistence (databases, application state). Bind mounts are preferred for development workflows (mounting source code for hot-reloading, sharing configuration files). tmpfs mounts provide in-memory-only storage for sensitive data.",
      followUps: [
        "What are volume drivers and when would you use them?",
        "How do anonymous volumes differ from named volumes?",
      ],
    },
  ],
  followUps: [
    "How do two containers on different hosts reach each other?",
    "What does `--network host` give up?",
    "Why does `localhost` inside a container not mean what people expect?",
  ],
  mcqs: [
    {
      q: "Which Docker network mode provides automatic DNS resolution between containers?",
      options: [
        "Default bridge",
        "User-defined bridge",
        "Host",
        "None",
      ],
      answerIndex: 1,
      explanation:
        "User-defined bridge networks run Docker's embedded DNS server (127.0.0.11) which resolves container names and aliases. The default bridge does not provide DNS resolution — containers can only communicate by IP address.",
    },
    {
      q: "What protocol does Docker overlay networking use for encapsulation?",
      options: ["GRE", "IPsec", "VXLAN", "WireGuard"],
      answerIndex: 2,
      explanation:
        "Docker overlay networks use VXLAN (Virtual Extensible LAN) on UDP port 4789 to encapsulate container traffic for multi-host communication. Optional IPsec encryption can be enabled on top of VXLAN.",
    },
    {
      q: "What is the security concern with Docker port publishing (-p)?",
      options: [
        "Published ports are unencrypted by default",
        "Docker iptables rules can bypass host firewalls (ufw, firewalld)",
        "Port mapping conflicts with systemd",
        "Published ports cannot be changed after container creation",
      ],
      answerIndex: 1,
      explanation:
        "Docker directly modifies iptables, inserting rules in the DOCKER chain that take effect before host firewall rules. This means docker -p can expose a port even when ufw or firewalld is configured to block it.",
    },
    {
      q: "What happens when a named volume is first mounted to a container?",
      options: [
        "The container fails to start if the volume is empty",
        "The volume is pre-populated with the image content at the mount point",
        "The mount point in the container is cleared",
        "Docker copies the volume content from the registry",
      ],
      answerIndex: 1,
      explanation:
        "When a named volume is empty and mounted to a container for the first time, Docker copies the image content at the mount point into the volume. Bind mounts do not have this behavior — they override the mount point entirely.",
    },
    {
      q: "What network mode gives a container zero network access?",
      options: ["bridge", "host", "none", "overlay"],
      answerIndex: 2,
      explanation:
        "The 'none' network mode provides only the loopback interface — the container has no external network connectivity, useful for security-sensitive workloads that should be completely network-isolated.",
    },
  ],
  flashcards: [
    {
      front: "What is docker0?",
      back: "The default Linux bridge created by the Docker daemon. Containers on the default network attach to this bridge via veth pairs. It provides IP connectivity but no DNS resolution between containers.",
    },
    {
      front: "How does Docker DNS round-robin work?",
      back: "Multiple containers with the same --network-alias resolve to multiple IPs. Docker's DNS returns all IPs in round-robin order, providing basic load balancing. Swarm services use IPVS-based VIP load balancing instead.",
    },
    {
      front: "What is a veth pair?",
      back: "A pair of virtual Ethernet interfaces connected like a pipe. One end is in the container's network namespace (eth0), the other is attached to the Docker bridge. Packets sent on one end appear on the other.",
    },
    {
      front: "What is a tmpfs mount in Docker?",
      back: "A mount that stores data in the host's memory only, never written to the host filesystem or container layer. Data is lost when the container stops. Used for sensitive data like secrets or temporary processing.",
    },
    {
      front: "How does overlay networking enable multi-host communication?",
      back: "Container traffic is encapsulated in VXLAN packets (UDP 4789), routed over the underlay network between hosts, and decapsulated at the destination — creating a virtual Layer 2 network spanning multiple physical hosts.",
    },
    {
      front: "What is the difference between -p and --expose in Docker?",
      back: "-p publishes a port by creating iptables DNAT rules mapping a host port to a container port. --expose only documents that the container listens on a port (metadata); it does not create any port mapping or firewall rules.",
    },
    {
      front: "Where are Docker volumes stored by default?",
      back: "/var/lib/docker/volumes/ on the Docker host. Each named volume gets its own directory managed by the Docker daemon. Volume drivers can redirect storage to remote backends.",
    },
    {
      front: "Why might Docker bypass your host firewall?",
      back: "Docker inserts iptables rules in the DOCKER chain that execute before rules managed by ufw or firewalld. A published port (-p) is accessible externally even if the firewall is configured to block it.",
    },
  ],
  resources: [
    {
      label: "Docker documentation — networking overview",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "Bridge Network",
      definition:
        "A software-defined Layer 2 network (Linux bridge) that connects containers on the same host, providing isolated communication with optional port publishing to the host.",
    },
    {
      term: "Overlay Network",
      definition:
        "A multi-host virtual network using VXLAN encapsulation that allows containers on different physical hosts to communicate as if on the same Layer 2 network.",
    },
    {
      term: "VXLAN",
      definition:
        "Virtual Extensible LAN — a network encapsulation protocol (UDP port 4789) that wraps Layer 2 Ethernet frames inside Layer 4 UDP packets, enabling virtual Layer 2 networks over Layer 3 infrastructure.",
    },
    {
      term: "Port Publishing",
      definition:
        "Docker's mechanism for exposing container ports to the host network via iptables DNAT rules, mapping a host port to a container port (e.g., -p 8080:80).",
    },
    {
      term: "Volume",
      definition:
        "A Docker-managed persistent storage unit that exists independently of containers, stored in /var/lib/docker/volumes/ by default, and supports pluggable drivers for remote storage backends.",
    },
    {
      term: "Bind Mount",
      definition:
        "A direct mapping of a specific host filesystem path into a container, providing immediate host-container file sharing but depending on the host directory structure.",
    },
    {
      term: "Embedded DNS",
      definition:
        "Docker's built-in DNS server (127.0.0.11) in user-defined networks that resolves container names and network aliases to container IP addresses for service discovery.",
    },
    {
      term: "IPVS",
      definition:
        "IP Virtual Server — a Linux kernel-level Layer 4 load balancer used by Docker Swarm for distributing traffic to service tasks via a Virtual IP (VIP), more reliable than DNS round-robin.",
    },
  ],
  deepDive: [
    "**Docker networking** is built on top of Linux kernel primitives — *network namespaces*, *veth pairs*, *bridges*, and *iptables* — that together create isolated yet connectable network environments for containers. When Docker starts, it creates a default bridge called `docker0` and assigns it a private subnet (typically `172.17.0.0/16`). Each container launched on this bridge gets its own network namespace with a `veth` pair: one end becomes `eth0` inside the container, the other end is plugged into the `docker0` bridge. This architecture means:\n\n- Containers on the same bridge can reach each other by IP address\n- Outbound traffic from containers is **NATed** (masqueraded) through the host's IP\n- Inbound traffic requires explicit **port publishing** (`-p`) which creates `iptables DNAT` rules\n- The default bridge does **not** provide DNS — only user-defined bridges run Docker's embedded DNS at `127.0.0.11`",
    "**Overlay networking** extends container communication across multiple hosts using **VXLAN encapsulation** (UDP port 4789). In a Docker Swarm cluster, the Swarm manager maintains a distributed key-value store that tracks which container IPs live on which host. When container A on host 1 sends a packet to container B on host 2, the local VTEP (VXLAN Tunnel Endpoint) encapsulates the Layer 2 frame inside a UDP packet, routes it over the physical network to the destination host, where the remote VTEP decapsulates it and delivers it to container B's network namespace. Key considerations include:\n\n- Overlay networks add ~10-15% latency overhead due to encapsulation\n- The `--opt encrypted` flag enables *IPsec ESP* encryption between nodes\n- Each overlay network creates a separate VXLAN segment with a unique **VNI** (VXLAN Network Identifier)\n- **Ingress routing mesh** in Swarm publishes service ports on *every* node, forwarding to the correct task via IPVS",
    "**Volume management** is critical for stateful containers because the container's writable layer (managed by the storage driver — overlay2, devicemapper, etc.) is *ephemeral* and tied to the container's lifecycle. Docker provides three mount types: **volumes** (managed in `/var/lib/docker/volumes/`), **bind mounts** (arbitrary host paths), and **tmpfs mounts** (in-memory only). Volumes are the preferred production approach because they decouple data from the container lifecycle, support volume drivers for remote storage (e.g., `local`, `nfs`, `rexray/ebs`, `convoy`), and provide consistent behavior across platforms. Important patterns include:\n\n- *Named volumes* pre-populate from image content on first mount; *anonymous volumes* get a random hash name and are harder to manage\n- `docker volume prune` removes all *unused* volumes — dangerous for backup volumes not currently attached\n- **Read-only bind mounts** (`:ro` suffix) prevent the container from modifying host files, improving security\n- Volume data persists across `docker stop`, `docker start`, and `docker rm` — only `docker volume rm` or `docker volume prune` deletes it",
    "**Network security and troubleshooting** require understanding how Docker manipulates the host's network stack. Docker creates several iptables chains (`DOCKER`, `DOCKER-ISOLATION-STAGE-1`, `DOCKER-ISOLATION-STAGE-2`, `DOCKER-USER`) to manage traffic. The `DOCKER-USER` chain is the recommended place for custom firewall rules because Docker never modifies it. Common pitfalls include:\n\n- Published ports bypassing `ufw`/`firewalld` because Docker's chains are evaluated first\n- DNS resolution failures when containers use the default bridge instead of user-defined networks\n- Network namespace debugging: use `docker exec <container> ip addr`, `docker network inspect`, and `nsenter --net=/proc/<pid>/ns/net` for deep inspection\n- **Container-to-container traffic** on the same bridge is unrestricted by default; use `--icc=false` on the daemon or network policies (in Kubernetes) to restrict it\n- MTU mismatches between overlay networks and the physical network causing packet fragmentation and performance degradation",
  ],
  code: [
    {
      language: "bash",
      caption: "Create and inspect user-defined bridge networks",
      source: `# Create a user-defined bridge network with a custom subnet
docker network create \\
  --driver bridge \\
  --subnet 10.0.1.0/24 \\
  --gateway 10.0.1.1 \\
  --opt com.docker.network.bridge.name=my_bridge \\
  my_app_network

# Run two containers on the custom network
docker run -d --name web --network my_app_network nginx:alpine
docker run -d --name api --network my_app_network node:alpine

# Verify DNS resolution between containers
docker exec web ping -c 3 api
# PING api (10.0.1.3): 56 data bytes
# 64 bytes from 10.0.1.3: seq=0 ttl=64 time=0.095 ms

# Inspect the network to see connected containers
docker network inspect my_app_network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'

# Connect an existing container to an additional network
docker network connect my_app_network existing_container`,
    },
    {
      language: "bash",
      caption: "Port mapping, host networking, and network debugging",
      source: `# Publish ports with specific interface binding
docker run -d --name web_public -p 8080:80 nginx:alpine           # All interfaces
docker run -d --name web_local -p 127.0.0.1:8081:80 nginx:alpine  # Localhost only
docker run -d --name web_range -p 9000-9010:9000-9010 myapp       # Port range

# Run a container with host networking (no NAT, no port mapping)
docker run -d --name monitor --network host prometheus/prometheus

# Run a container with no network access
docker run -d --name isolated --network none alpine sleep 3600

# Debug container networking
docker exec web_public ip addr show
docker exec web_public cat /etc/resolv.conf
docker exec web_public nslookup api

# Inspect iptables rules created by Docker
sudo iptables -t nat -L DOCKER -n -v
sudo iptables -L DOCKER-USER -n -v

# View network namespace of a container
PID=$(docker inspect --format '{{.State.Pid}}' web_public)
sudo nsenter --target $PID --net ip addr`,
    },
    {
      language: "bash",
      caption: "Volume management and data persistence",
      source: `# Create and use named volumes
docker volume create postgres_data
docker run -d --name db \\
  -v postgres_data:/var/lib/postgresql/data \\
  -e POSTGRES_PASSWORD=secret \\
  postgres:15

# Bind mount for development (hot-reloading)
docker run -d --name dev_app \\
  -v $(pwd)/src:/app/src:cached \\
  -v /app/node_modules \\
  -p 3000:3000 \\
  node:18-alpine npm run dev

# Read-only bind mount for configuration
docker run -d --name web \\
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \\
  -v $(pwd)/certs:/etc/ssl/certs:ro \\
  nginx:alpine

# tmpfs mount for sensitive data (in-memory only)
docker run -d --name secure_app \\
  --tmpfs /app/secrets:rw,noexec,size=64m \\
  myapp:latest

# Inspect, list, and prune volumes
docker volume inspect postgres_data
docker volume ls --filter dangling=true
docker volume prune --filter "label!=keep"`,
    },
    {
      language: "dockerfile",
      caption: "Dockerfile with networking and volume best practices",
      source: `FROM node:18-alpine AS base

# Declare the port the application listens on
EXPOSE 3000

# Declare a volume mount point for persistent data
VOLUME ["/app/data"]

# Install curl for container health checks
RUN apk add --no-cache curl

# Health check using the exposed port
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]`,
    },
    {
      language: "bash",
      caption: "Docker Compose networking with multiple networks",
      source: `# docker-compose.yml with isolated frontend/backend networks
cat <<'YAML'
version: "3.9"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - frontend
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro

  api:
    build: ./api
    networks:
      - frontend
      - backend
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    networks:
      - backend
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
  backend:
    driver: bridge
    internal: true  # No external access

volumes:
  pg_data:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt
YAML`,
    },
  ],
  diagrams: [
    {
      title: "Docker Bridge Network Architecture",
      kind: "architecture",
      mermaid: `graph TB
    subgraph Host["Docker Host"]
      subgraph NS1["Container A namespace"]
        eth0a["eth0\n10.0.1.2"]
      end
      subgraph NS2["Container B namespace"]
        eth0b["eth0\n10.0.1.3"]
      end
      subgraph Bridge["User-defined Bridge br-xxxx"]
        vethA["veth-a"]
        vethB["veth-b"]
        DNS["Embedded DNS\n127.0.0.11"]
      end
      IPT["iptables DNAT and MASQUERADE"]
      HostNIC["Host NIC eth0\n192.168.1.100"]
    end
    Internet["External Network"]
    eth0a --- vethA
    eth0b --- vethB
    vethA --- DNS
    vethB --- DNS
    Bridge --- IPT
    IPT --- HostNIC
    HostNIC --- Internet`,
      caption: "Each container has its own network namespace connected to the bridge via veth pairs; iptables handles NAT for outbound and port publishing for inbound traffic.",
    },
    {
      title: "Overlay Network VXLAN Encapsulation",
      kind: "flow",
      mermaid: `flowchart LR
    subgraph Node1["Swarm Node 1"]
      CA["Container A\n10.0.0.2"]
      VTEP1["VTEP\nVXLAN Endpoint"]
      NIC1["eth0\n192.168.1.10"]
    end
    subgraph Node2["Swarm Node 2"]
      NIC2["eth0\n192.168.1.11"]
      VTEP2["VTEP\nVXLAN Endpoint"]
      CB["Container B\n10.0.0.3"]
    end
    CA -->|L2 Frame| VTEP1
    VTEP1 -->|VXLAN Encap UDP 4789| NIC1
    NIC1 -->|Underlay Network| NIC2
    NIC2 -->|VXLAN Decap| VTEP2
    VTEP2 -->|L2 Frame| CB`,
      caption: "VXLAN encapsulates container L2 frames inside UDP packets, enabling containers on different hosts to share an L2 segment.",
    },
    {
      title: "Docker DNS Resolution Sequence",
      kind: "sequence",
      mermaid: `sequenceDiagram
    participant App as Container: app
    participant DNS as Docker DNS 127.0.0.11
    participant DB as Container: postgres
    App->>DNS: Query A record for postgres
    DNS->>DNS: Lookup container name in network registry
    DNS-->>App: Response 10.0.1.5
    App->>DB: TCP SYN to 10.0.1.5:5432
    DB-->>App: TCP SYN-ACK
    App->>DB: SQL query over established connection`,
      caption: "Docker's embedded DNS resolves service names to container IPs, enabling containers to discover each other by name.",
    },
    {
      title: "Docker Network Driver Comparison",
      kind: "mindmap",
      mermaid: `mindmap
  root((Docker Network Drivers))
    bridge
      Default for single host
      NAT via iptables
      User-defined for DNS
    host
      No network namespace
      Uses host IP directly
      Highest performance
    overlay
      Multi-host via VXLAN
      Requires Swarm or manual key store
      Encrypted option
    macvlan
      Container gets MAC address
      Direct L2 access
      No NAT overhead
    none
      No network stack
      Fully isolated container`,
      caption: "Docker network driver options from isolated bridge to high-performance host and multi-host overlay, each with distinct trade-offs.",
    },
  ],
  exercises: [
    "Create a multi-container application with Docker Compose that has three services (web, api, database) on two networks: a 'frontend' network connecting web and api, and an 'internal' backend network connecting api and database. Verify that the web container cannot directly reach the database container, but the api container can reach both.",
    "Set up a Docker environment where you create a named volume, write data to it from one container, stop and remove that container, then start a new container mounting the same volume and verify the data persists. Repeat the exercise with a bind mount and compare the behavior.",
    "Investigate Docker's iptables rules by running a container with port publishing (-p 8080:80), then use 'iptables -t nat -L DOCKER -n' and 'iptables -L DOCKER-USER -n' to trace the NAT and filter rules Docker created. Add a custom rule to the DOCKER-USER chain to restrict access to the published port from a specific IP range.",
    "Build a Docker Swarm cluster with at least two nodes (use docker-machine or VMs), create an overlay network, deploy a replicated service with 3 replicas, and verify that containers on different hosts can communicate by name. Test the ingress routing mesh by accessing the service from any node's IP.",
    "Debug a DNS resolution failure: create two containers on the default bridge network and attempt to ping by container name (it will fail). Then create a user-defined bridge, attach both containers, and demonstrate that DNS resolution works. Use 'docker exec' to inspect /etc/resolv.conf in both scenarios.",
  ],
  cheatSheet: [
    "`docker network ls` — list all networks; `docker network inspect <name>` — show network details, connected containers, and IPAM config",
    "`docker network create --driver bridge --subnet 10.0.0.0/24 <name>` — create a user-defined bridge with a custom subnet",
    "`docker run --network <name> --name <container>` — attach a container to a specific network at launch",
    "`docker network connect <network> <container>` / `docker network disconnect <network> <container>` — attach/detach a running container to/from a network",
    "`docker run -p 127.0.0.1:8080:80` — publish port bound to localhost only; omit the IP to bind to all interfaces (0.0.0.0)",
    "`docker volume create <name>` / `docker volume inspect <name>` / `docker volume rm <name>` — manage named volumes",
    "`docker run -v <volume>:/path` (named volume) vs `-v /host/path:/path` (bind mount) vs `--tmpfs /path` (in-memory mount)",
    "`docker volume prune` — remove all unused volumes (WARNING: irreversible); use `--filter` to target specific labels",
  ],
  revisionNotes: [
    "The **default bridge** provides IP-only connectivity with no DNS; **user-defined bridges** add automatic DNS resolution, better isolation, and runtime connect/disconnect — always prefer user-defined bridges.",
    "**Port publishing** (`-p`) creates iptables DNAT rules that can bypass host firewalls (ufw/firewalld). Bind to `127.0.0.1` for localhost-only access. Use the `DOCKER-USER` chain for custom firewall rules.",
    "**Host networking** (`--network host`) removes all network isolation for maximum performance; **none networking** (`--network none`) provides complete network isolation with only loopback.",
    "**Overlay networks** use VXLAN (UDP 4789) for multi-host communication. Docker Swarm manages overlay networking natively; Kubernetes uses CNI plugins (Flannel, Calico, Cilium).",
    "**Named volumes** are managed by Docker, persist across container lifecycle, and pre-populate from image content on first mount. **Bind mounts** map host paths directly and override mount points.",
    "**tmpfs mounts** store data in memory only — never written to disk, lost on container stop. Use for secrets and sensitive temporary data.",
    "Docker's embedded DNS server at `127.0.0.11` resolves container names and `--network-alias` values. Swarm services use IPVS-based Virtual IP load balancing instead of DNS round-robin.",
    "Docker Compose automatically creates a user-defined bridge per project and registers services by name, enabling DNS-based service discovery without explicit network configuration.",
  ],
};
