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
};
