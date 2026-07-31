import type { TopicContent } from "../types";

export const containerFundamentals: TopicContent = {
  quickSummary: [
    "Containers are lightweight, isolated processes that share the host operating system kernel, using Linux namespaces for resource isolation (PID, network, mount, user, UTS, IPC, cgroup) and cgroups for resource limits (CPU, memory, I/O), providing near-native performance without the overhead of a full virtual machine.",
    "Unlike virtual machines that run a complete guest OS on a hypervisor, containers package only the application and its dependencies into a layered filesystem image, sharing the host kernel and achieving millisecond startup times, minimal memory overhead, and higher density per host.",
    "The Open Container Initiative (OCI) defines industry standards for container formats (image-spec) and runtimes (runtime-spec), ensuring interoperability across container engines like Docker, containerd, CRI-O, and Podman.",
    "Overlay filesystems (OverlayFS, overlay2) enable containers to share common base layers efficiently while maintaining isolated writable layers per container, reducing disk usage and enabling fast container creation through copy-on-write semantics.",
  ],
  detailed: [
    "## Linux Namespaces\n\nNamespaces are the foundational isolation mechanism for containers. Each namespace type isolates a specific system resource. PID namespace: each container sees its own process tree starting from PID 1, unable to see or signal processes in other containers. Network namespace: each container gets its own network stack (interfaces, IP addresses, routing tables, iptables rules, sockets), connected to the host via virtual ethernet pairs (veth). Mount namespace: each container has its own filesystem mount table, seeing only its own root filesystem and explicitly mounted volumes. UTS namespace: isolates hostname and domain name, allowing each container its own hostname. IPC namespace: isolates System V IPC objects and POSIX message queues. User namespace: maps container UIDs/GIDs to different host UIDs/GIDs, enabling rootless containers where root inside the container maps to an unprivileged user on the host. Cgroup namespace: isolates the cgroup hierarchy view so containers see their own cgroup root.",
    "## Control Groups (cgroups)\n\nCgroups enforce resource limits and accounting for groups of processes. Cgroups v1 uses separate hierarchies per resource controller: cpu (CPU time allocation via shares and CFS quotas), cpuset (pin processes to specific CPU cores), memory (hard and soft memory limits with OOM killer integration), blkio (block I/O throttling), devices (device access control), pids (limit number of processes), and net_cls/net_prio (network traffic classification). Cgroups v2 (unified hierarchy) places all controllers in a single tree, enabling coordinated resource management, pressure stall information (PSI) for detecting resource contention, and better support for delegation to unprivileged users. When a container exceeds its memory limit, the kernel's OOM killer terminates processes within that cgroup. CPU limits use the Completely Fair Scheduler (CFS) quota: for example, a quota of 50ms per 100ms period gives a container 0.5 CPU cores.",
    "## Containers vs Virtual Machines\n\nVirtual machines run a full guest operating system on virtualized hardware provided by a hypervisor (Type 1: bare-metal like KVM, Xen, VMware ESXi; Type 2: hosted like VirtualBox). Each VM has its own kernel, system libraries, and init system, consuming GBs of memory and taking seconds to minutes to boot. Containers share the host kernel — they are just isolated processes with namespace and cgroup boundaries. This means containers start in milliseconds, consume MBs of overhead, and achieve much higher density (hundreds of containers vs. tens of VMs per host). However, containers have a weaker security boundary because they share the kernel — a kernel vulnerability can affect all containers. Kata Containers and gVisor address this by running containers inside lightweight micro-VMs or user-space kernels respectively, combining container UX with VM-level isolation.",
    "## OCI Specifications\n\nThe Open Container Initiative maintains two key specs. The Runtime Specification defines how to run a filesystem bundle: the runtime reads a config.json specifying namespaces, cgroups, mounts, root filesystem path, and lifecycle hooks, then creates and starts the container process. runc is the reference implementation. The Image Specification defines a portable container image format: a manifest listing content-addressable layers (tar+gzip archives), a configuration object with metadata (environment variables, entrypoint, exposed ports, labels), and an index for multi-platform images. The Distribution Specification defines the HTTP API for pushing and pulling images from registries. These specs ensure that an image built with Docker can run on containerd, CRI-O, Podman, or any OCI-compliant runtime.",
    "## Overlay Filesystem\n\nOverlayFS (overlay2 driver in Docker) implements a union filesystem with two layers: a lower directory (read-only, the image layers) and an upper directory (read-write, the container layer). When a file is read, OverlayFS checks the upper layer first, then falls back to the lower layer — this is transparent to the process. When a file from the lower layer is modified, it is copied to the upper layer on first write (copy-on-write), and subsequent reads/writes operate on the upper copy. Deleting a lower-layer file creates a whiteout file in the upper layer. Multiple containers based on the same image share the lower layers, storing only their unique changes in individual upper layers. This sharing dramatically reduces disk usage and enables instant container creation since no filesystem copy is needed.",
    "## Container Security Considerations\n\nBeyond namespaces and cgroups, containers use several additional security mechanisms. Linux capabilities break the monolithic root privilege into fine-grained capabilities (CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN, etc.) — containers typically drop all capabilities except the minimum required. Seccomp (Secure Computing Mode) profiles restrict which system calls a container can make; Docker's default profile blocks approximately 44 of 300+ syscalls. AppArmor and SELinux provide mandatory access control (MAC) policies that restrict file access, network operations, and capability usage regardless of the process's UID. Read-only root filesystems prevent containers from modifying their own image layers. These layers of defense implement defense-in-depth, but the shared kernel remains the fundamental difference from VM isolation.",
  ],
  interviewQA: [
    {
      q: "How do Linux namespaces provide isolation for containers?",
      a: "Namespaces partition kernel resources so each container sees its own isolated instance. PID namespace gives each container its own process tree (PID 1 is the container's init process). Network namespace provides a separate network stack with its own interfaces, IPs, and routing. Mount namespace isolates the filesystem mount table. UTS namespace isolates hostname. IPC namespace isolates inter-process communication. User namespace maps UIDs between container and host, enabling rootless containers. Cgroup namespace isolates the view of the cgroup hierarchy. Together, these namespaces make a container appear to be a standalone system while being just an isolated process group on the host.",
      followUps: [
        "What is a rootless container and how does user namespace enable it?",
        "How are network namespaces connected to the host network?",
      ],
    },
    {
      q: "What happens when a container exceeds its memory cgroup limit?",
      a: "When a container's memory usage hits the hard limit set by the memory cgroup, the kernel's Out-Of-Memory (OOM) killer activates within that cgroup. It selects a process to terminate based on an OOM score (considering memory usage, process age, and oom_score_adj). The container runtime detects the OOM event and reports it (Docker shows 'OOMKilled' in container status). Soft limits (memory.soft_limit_in_bytes in v1, memory.low in v2) allow temporary exceeding under low memory pressure but trigger reclaim under pressure. In Kubernetes, OOMKilled containers are restarted according to the pod's restartPolicy, and pods exceeding their memory request may be evicted.",
      followUps: [
        "How does cgroups v2 differ from v1?",
        "What is Pressure Stall Information (PSI)?",
      ],
    },
    {
      q: "Why are containers considered to have weaker isolation than VMs, and what mitigations exist?",
      a: "Containers share the host kernel, meaning a kernel exploit in one container can compromise all containers and the host. VMs have their own kernel running on virtualized hardware, so a guest exploit is contained by the hypervisor. Mitigations include: dropping unnecessary Linux capabilities, applying seccomp profiles to restrict syscalls, using AppArmor/SELinux for mandatory access control, running rootless containers (user namespaces), using read-only root filesystems, and deploying micro-VM runtimes like Kata Containers (runs each container in a lightweight QEMU/Firecracker VM) or gVisor (intercepts syscalls in a user-space kernel). These mitigations create defense-in-depth but add complexity and performance overhead.",
      followUps: [
        "How does gVisor's architecture differ from Kata Containers?",
        "What syscalls does Docker's default seccomp profile block?",
      ],
    },
    {
      q: "Explain how OverlayFS enables efficient container storage.",
      a: "OverlayFS merges a read-only lower directory (image layers) with a read-write upper directory (container layer) into a unified view. Reads check the upper layer first, then fall back to lower layers. Writes to existing lower-layer files trigger copy-on-write: the file is copied to the upper layer, and modifications happen on the copy. Deletions create whiteout files in the upper layer. Since multiple containers from the same image share the read-only lower layers, only unique container modifications consume additional disk space. Container creation is nearly instant because no filesystem copy occurs — just a new empty upper directory is created and merged with the shared lower layers.",
    },
  ],
  mcqs: [
    {
      q: "Which Linux namespace provides each container with its own network stack?",
      options: [
        "PID namespace",
        "Mount namespace",
        "Network namespace",
        "UTS namespace",
      ],
      answerIndex: 2,
      explanation:
        "The network namespace gives each container its own network interfaces, IP addresses, routing tables, and iptables rules. Containers are connected to the host via virtual ethernet pairs (veth).",
    },
    {
      q: "What mechanism does the kernel use when a container exceeds its memory cgroup limit?",
      options: [
        "Process throttling",
        "Memory ballooning",
        "OOM killer",
        "Swap compression",
      ],
      answerIndex: 2,
      explanation:
        "The kernel's OOM (Out-Of-Memory) killer selects and terminates processes within the cgroup that exceeded its memory limit. The container runtime then reports the container as OOMKilled.",
    },
    {
      q: "What does copy-on-write mean in the context of OverlayFS?",
      options: [
        "Files are duplicated when an image is pulled",
        "Files from lower layers are copied to the upper layer only when modified",
        "The entire filesystem is copied when a container starts",
        "Write operations are logged before execution",
      ],
      answerIndex: 1,
      explanation:
        "Copy-on-write means lower-layer files are only copied to the writable upper layer when a process first modifies them. Unmodified files are read directly from the shared lower layers, saving disk space.",
    },
    {
      q: "Which container runtime provides VM-level isolation using lightweight micro-VMs?",
      options: ["runc", "containerd", "Kata Containers", "CRI-O"],
      answerIndex: 2,
      explanation:
        "Kata Containers runs each container inside a lightweight virtual machine (using QEMU or Firecracker), providing hardware-level isolation while maintaining the container user experience and OCI compatibility.",
    },
    {
      q: "What is the primary advantage of cgroups v2 over v1?",
      options: [
        "Faster process creation",
        "Unified hierarchy with all controllers in a single tree",
        "Support for more CPU cores",
        "Built-in container image management",
      ],
      answerIndex: 1,
      explanation:
        "Cgroups v2 uses a unified hierarchy where all resource controllers exist in a single tree, enabling coordinated resource management, simpler delegation, and features like Pressure Stall Information (PSI).",
    },
  ],
  flashcards: [
    {
      front: "What are the seven types of Linux namespaces used by containers?",
      back: "PID (process IDs), Network (network stack), Mount (filesystem mounts), UTS (hostname), IPC (inter-process communication), User (UID/GID mapping), and Cgroup (cgroup hierarchy view).",
    },
    {
      front: "How do containers differ from VMs in resource overhead?",
      back: "Containers share the host kernel and start in milliseconds with MBs of overhead. VMs run full guest OSes on virtualized hardware, taking seconds to minutes to boot with GBs of overhead. Containers achieve much higher density per host.",
    },
    {
      front: "What is runc?",
      back: "The reference implementation of the OCI runtime specification. It reads a config.json and filesystem bundle, creates the namespaces and cgroups, and spawns the container process. Used as the low-level runtime by Docker, containerd, and CRI-O.",
    },
    {
      front: "What is a whiteout file in OverlayFS?",
      back: "A special marker file created in the upper (writable) layer when a file from a lower (read-only) layer is deleted. It tells OverlayFS to hide the lower-layer file from the merged view.",
    },
    {
      front: "What are Linux capabilities?",
      back: "Fine-grained decomposition of root (UID 0) privileges into individual capabilities like CAP_NET_BIND_SERVICE (bind to privileged ports) and CAP_SYS_ADMIN (various admin operations). Containers drop most capabilities to reduce the attack surface.",
    },
    {
      front: "What is seccomp in container security?",
      back: "Secure Computing Mode — a Linux kernel feature that restricts which system calls a process can make. Docker's default seccomp profile blocks approximately 44 dangerous syscalls while allowing the ~300 needed for normal operation.",
    },
    {
      front: "What is a rootless container?",
      back: "A container running entirely without root privileges on the host, enabled by user namespaces that map container root (UID 0) to an unprivileged host UID. Prevents privilege escalation even if the container is compromised.",
    },
    {
      front: "What does the OCI Image Specification define?",
      back: "A portable container image format consisting of: a manifest (list of content-addressable layers), a configuration object (metadata, env vars, entrypoint), and an optional index for multi-platform images (different architectures/OS).",
    },
  ],
  glossary: [
    {
      term: "Namespace",
      definition:
        "A Linux kernel feature that partitions system resources (PIDs, network, mounts, etc.) so each group of processes sees its own isolated instance of that resource.",
    },
    {
      term: "Cgroup (Control Group)",
      definition:
        "A Linux kernel feature that limits, accounts for, and isolates resource usage (CPU, memory, I/O, PIDs) of a collection of processes.",
    },
    {
      term: "OCI (Open Container Initiative)",
      definition:
        "An industry governance body maintaining open standards for container image formats (image-spec), container runtimes (runtime-spec), and image distribution (distribution-spec).",
    },
    {
      term: "OverlayFS",
      definition:
        "A union filesystem that merges a read-only lower directory with a read-write upper directory, used by container runtimes to efficiently layer container images with copy-on-write semantics.",
    },
    {
      term: "Copy-on-Write (CoW)",
      definition:
        "A resource management technique where shared data is only duplicated when modified, allowing multiple containers to share base image layers until a write operation requires a private copy.",
    },
    {
      term: "veth Pair",
      definition:
        "A pair of virtual Ethernet interfaces connected like a pipe — packets sent on one end appear on the other. Used to connect a container's network namespace to the host or a bridge network.",
    },
    {
      term: "OOM Killer",
      definition:
        "A Linux kernel mechanism that terminates processes when the system or cgroup runs out of memory, selecting victims based on memory usage and OOM score to free up resources.",
    },
    {
      term: "gVisor",
      definition:
        "A container runtime sandbox by Google that provides a user-space kernel (Sentry) intercepting container syscalls, offering stronger isolation than native namespaces without the overhead of full virtualization.",
    },
  ],
  deepDive: [
    "**Linux namespaces** are the *foundational isolation primitive* that makes containers possible. When the container runtime calls `clone()` with namespace flags (CLONE_NEWPID, CLONE_NEWNET, CLONE_NEWNS, etc.), the kernel creates a new *isolated view* of the specified resource for the child process. The **PID namespace** is particularly elegant: the first process in a new PID namespace becomes PID 1 -- the init process for that namespace. This process is responsible for reaping zombie children, and if it exits, the kernel destroys all processes in the namespace. The **user namespace** is crucial for **rootless containers**: it maps UID 0 inside the container to an unprivileged UID (e.g., 100000) on the host via `/etc/subuid` and `/etc/subgid` mappings. This means even if a process *escapes* the container, it runs as an unprivileged user on the host. The combination of all seven namespace types creates the illusion of a standalone machine while being merely a set of restricted processes on the host.",
    "**Cgroups v2** represents a fundamental redesign of Linux resource management. Unlike cgroups v1's *per-controller hierarchy* (separate trees for CPU, memory, I/O), v2 uses a **unified hierarchy** where all controllers share a single tree rooted at `/sys/fs/cgroup`. This seemingly simple change has profound implications: resource limits can now be *coordinated* across controllers (e.g., memory pressure can influence I/O priority), and **Pressure Stall Information (PSI)** metrics (`/proc/pressure/{cpu,memory,io}`) provide real-time visibility into whether processes are being starved. CPU limits in cgroups use the **CFS bandwidth controller**: `cpu.max` specifies `quota period` (e.g., `50000 100000` means 50ms of CPU time per 100ms period = 0.5 cores). Memory limits via `memory.max` trigger the OOM killer; `memory.high` is a *soft throttle* that slows allocations before hitting the hard limit. Kubernetes 1.25+ defaults to cgroups v2, using PSI for better **pod eviction** decisions.",
    "The **OCI runtime specification** is what allows the container ecosystem to be *modular and interchangeable*. A container runtime receives a **filesystem bundle** (a directory containing `rootfs/` and `config.json`) and is responsible for creating the container process with the specified namespaces, cgroups, mounts, and security profiles. The `config.json` is remarkably detailed: it specifies Linux capabilities to grant or deny (e.g., drop `CAP_SYS_ADMIN`, keep `CAP_NET_BIND_SERVICE`), **seccomp** syscall filters (a BPF program that intercepts every syscall), **AppArmor** or **SELinux** labels, the **rlimits** for the process, and **lifecycle hooks** (prestart, createRuntime, poststart, poststop). This standardization means you can swap `runc` for **crun** (a C implementation, 50x faster startup), **youki** (Rust), **Kata Containers** (micro-VM), or **gVisor** (user-space kernel) without changing your container images or orchestration tooling."
  ],
  code: [
    {
      language: "bash",
      caption: "Creating a container from scratch using Linux namespaces, cgroups, and chroot",
      source: `#!/bin/bash
# === Build a container from scratch — no Docker, just Linux primitives ===
# This demonstrates what container runtimes do under the hood.

set -euo pipefail

ROOTFS="/tmp/mycontainer/rootfs"
CGROUP_PATH="/sys/fs/cgroup/mycontainer"

# 1. Create a minimal root filesystem (Alpine-based)
mkdir -p "$ROOTFS"
# Download and extract Alpine Linux minirootfs
curl -sL https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/\\
alpine-minirootfs-3.19.0-x86_64.tar.gz | tar xz -C "$ROOTFS"

# 2. Set up cgroups v2 resource limits
sudo mkdir -p "$CGROUP_PATH"
echo "50000 100000" | sudo tee "$CGROUP_PATH/cpu.max"      # 0.5 CPU cores
echo "134217728" | sudo tee "$CGROUP_PATH/memory.max"       # 128 MB hard limit
echo "104857600" | sudo tee "$CGROUP_PATH/memory.high"      # 100 MB soft throttle
echo "20" | sudo tee "$CGROUP_PATH/pids.max"                # Max 20 processes

# 3. Launch the "container" with namespace isolation
# unshare creates new namespaces; chroot changes the root filesystem
sudo unshare \\
    --pid          \\  # New PID namespace (process sees PID 1)
    --net          \\  # New network namespace (isolated network stack)
    --mount        \\  # New mount namespace (isolated filesystem mounts)
    --uts          \\  # New UTS namespace (own hostname)
    --ipc          \\  # New IPC namespace (isolated shared memory)
    --cgroup       \\  # New cgroup namespace
    --fork         \\  # Fork so PID 1 is the container's init
    --mount-proc   \\  # Mount /proc inside the new PID namespace
    chroot "$ROOTFS" /bin/sh -c '
        hostname mycontainer          # Set container hostname (UTS namespace)
        echo "PID inside container:"
        ps aux                        # Only sees its own processes
        echo "Hostname: $(hostname)"
        echo "Network interfaces:"
        ip addr show                  # Only sees loopback (no veth yet)
        exec /bin/sh                  # Interactive shell
    '

# 4. Cleanup
sudo rmdir "$CGROUP_PATH"
sudo rm -rf /tmp/mycontainer`
    },
    {
      language: "yaml",
      caption: "Dockerfile and docker-compose.yml with security hardening: read-only rootfs, capabilities, seccomp",
      source: `# === Dockerfile — security-hardened production container ===

FROM alpine:3.19 AS builder
RUN apk add --no-cache gcc musl-dev
COPY app.c /build/
RUN gcc -static -o /build/app /build/app.c    # Static binary for scratch image

# Multi-stage: final image has NO shell, NO package manager
FROM scratch
COPY --from=builder /build/app /app

# Non-root user (UID 65534 = nobody)
USER 65534:65534
ENTRYPOINT ["/app"]

# === docker-compose.yml — runtime security constraints ===
# version: "3.9"   (compose spec — version is optional)

services:
  secure-app:
    build: .
    read_only: true                    # Read-only root filesystem
    tmpfs:
      - /tmp:size=10m,noexec           # Writable tmp, no execution
    security_opt:
      - no-new-privileges:true         # Prevent privilege escalation
      - seccomp:./seccomp-profile.json # Custom syscall filter
      - apparmor:docker-default        # AppArmor MAC profile
    cap_drop:
      - ALL                            # Drop ALL Linux capabilities
    cap_add:
      - NET_BIND_SERVICE               # Only allow binding to ports < 1024
    deploy:
      resources:
        limits:
          cpus: "0.5"                  # CFS quota: 50ms per 100ms
          memory: 128M                 # OOM kill at 128MB
          pids: 20                     # Max 20 processes
        reservations:
          memory: 64M                  # Guaranteed 64MB
    healthcheck:
      test: ["/app", "--healthcheck"]
      interval: 30s
      timeout: 5s
      retries: 3`
    },
    {
      language: "bash",
      caption: "Inspecting container internals: namespaces, cgroups, capabilities, and OverlayFS layers",
      source: `#!/bin/bash
# === Inspect a running container's Linux primitives ===

CONTAINER="secure-app"
PID=$(docker inspect --format '{{.State.Pid}}' "$CONTAINER")

echo "=== Container PID on host: $PID ==="

# 1. View the namespaces the process belongs to
echo "--- Namespaces ---"
ls -la /proc/$PID/ns/
# Output shows: cgroup, ipc, mnt, net, pid, user, uts — one per namespace type

# 2. View cgroup limits
echo "--- Cgroup v2 Limits ---"
CGROUP=$(cat /proc/$PID/cgroup | cut -d: -f3)
echo "CPU quota: $(cat /sys/fs/cgroup$CGROUP/cpu.max)"       # e.g., 50000 100000
echo "Memory max: $(cat /sys/fs/cgroup$CGROUP/memory.max)"   # e.g., 134217728
echo "Memory current: $(cat /sys/fs/cgroup$CGROUP/memory.current)"
echo "PIDs max: $(cat /sys/fs/cgroup$CGROUP/pids.max)"
echo "PIDs current: $(cat /sys/fs/cgroup$CGROUP/pids.current)"

# 3. View Linux capabilities
echo "--- Capabilities ---"
cat /proc/$PID/status | grep -i cap
# CapEff shows effective capabilities in hex — decode with capsh:
capsh --decode=$(grep CapEff /proc/$PID/status | awk '{print $2}')

# 4. View OverlayFS layers
echo "--- OverlayFS Layers ---"
docker inspect --format '{{.GraphDriver.Data.MergedDir}}' "$CONTAINER"
docker inspect --format '{{.GraphDriver.Data.UpperDir}}' "$CONTAINER"    # Writable layer
docker inspect --format '{{.GraphDriver.Data.LowerDir}}' "$CONTAINER"    # Read-only image layers

# 5. View seccomp status
echo "--- Seccomp ---"
grep Seccomp /proc/$PID/status
# Seccomp: 2  means seccomp filter is active (BPF-based)

# 6. PSI (Pressure Stall Information) — cgroups v2 only
echo "--- Pressure Stall Info ---"
cat /sys/fs/cgroup$CGROUP/memory.pressure
cat /sys/fs/cgroup$CGROUP/cpu.pressure`
    }
  ],
  diagrams: [
    {
      title: "Container vs Virtual Machine Architecture",
      kind: "architecture" as const,
      caption: "Structural comparison showing how containers share the host kernel while VMs each run their own",
      mermaid: `graph TB
    subgraph Containers["Container Architecture"]
        direction TB
        CA["App A"]
        CB["App B"]
        CC["App C"]
        BinsA["Bins/Libs"]
        BinsB["Bins/Libs"]
        BinsC["Bins/Libs"]
        CRT["Container Runtime<br/>(containerd / CRI-O)"]
        HK["Host OS Kernel<br/>(shared)"]
        HW1["Hardware"]

        CA --- BinsA
        CB --- BinsB
        CC --- BinsC
        BinsA --- CRT
        BinsB --- CRT
        BinsC --- CRT
        CRT --- HK
        HK --- HW1
    end

    subgraph VMs["Virtual Machine Architecture"]
        direction TB
        VA["App X"]
        VB["App Y"]
        GA["Guest OS<br/>(full kernel)"]
        GB["Guest OS<br/>(full kernel)"]
        HYP["Hypervisor<br/>(KVM / Xen)"]
        HK2["Host OS Kernel"]
        HW2["Hardware"]

        VA --- GA
        VB --- GB
        GA --- HYP
        GB --- HYP
        HYP --- HK2
        HK2 --- HW2
    end`
    },
    {
      title: "Linux Namespace Isolation Layers",
      kind: "mindmap" as const,
      caption: "The seven Linux namespace types and what each isolates for container processes",
      mermaid: `mindmap
  root((Container<br/>Namespaces))
    PID
      Own process tree
      PID 1 = container init
      Cannot see host processes
    Network
      Own interfaces
      Own IP addresses
      Own routing table
      Own iptables rules
    Mount
      Own filesystem view
      OverlayFS root
      Volume mounts
    UTS
      Own hostname
      Own domain name
    IPC
      Own shared memory
      Own message queues
      Own semaphores
    User
      UID/GID mapping
      Rootless containers
      root inside = unprivileged outside
    Cgroup
      Own cgroup root view
      Resource limit isolation`
    },
    {
      title: "OverlayFS Copy-on-Write Layer Stack",
      kind: "flow" as const,
      caption: "How OverlayFS merges read-only image layers with a writable container layer using copy-on-write",
      mermaid: `flowchart TB
    subgraph Image["Image Layers (read-only)"]
        L1["Layer 1: Base OS<br/>/bin, /lib, /etc"]
        L2["Layer 2: Runtime<br/>/usr/local/bin/python"]
        L3["Layer 3: App deps<br/>/app/requirements.txt"]
        L4["Layer 4: App code<br/>/app/main.py"]
        L1 --> L2 --> L3 --> L4
    end

    subgraph Container["Container Layer (read-write)"]
        UL["Upper Layer<br/>/app/main.py (modified)<br/>/tmp/cache.db (new)<br/>.wh.oldfile (whiteout)"]
    end

    L4 --> |"OverlayFS<br/>union mount"| MV["Merged View<br/>(what the container sees)"]
    UL --> MV

    MV --> R{"Read /app/main.py"}
    R --> |"Found in upper"| UL
    MV --> R2{"Read /bin/sh"}
    R2 --> |"Not in upper,<br/>fall through"| L1
    MV --> W{"Write /etc/config"}
    W --> |"Copy-on-Write:<br/>copy from L1 to upper,<br/>then modify"| UL`
    }
  ],
  comparison: {
    columns: ["Feature", "Containers", "Virtual Machines", "Kata Containers", "gVisor"],
    rows: [
      ["**Isolation level**", "Process-level (namespaces + cgroups)", "*Hardware-level* (hypervisor)", "Hardware + container UX", "User-space kernel"],
      ["**Startup time**", "*Milliseconds*", "Seconds to minutes", "~1 second", "~150ms"],
      ["**Memory overhead**", "*MBs* (shared kernel)", "GBs (full guest OS)", "~30MB per micro-VM", "~15MB per sandbox"],
      ["**Density per host**", "*Hundreds*", "Tens", "Tens to hundreds", "Hundreds"],
      ["**Kernel sharing**", "Shared host kernel", "Separate guest kernel", "Separate guest kernel", "User-space Sentry kernel"],
      ["**Security boundary**", "Weak (kernel exploit = host compromise)", "*Strong* (hypervisor boundary)", "*Strong* (VM boundary)", "Moderate (syscall interception)"],
      ["**Performance**", "*Near-native*", "~5-10% overhead", "~1-3% overhead", "~5-15% syscall overhead"],
      ["**OCI compatible**", "Yes", "No (different format)", "Yes", "Yes (runsc runtime)"]
    ]
  },
  exercises: [
    "**Namespace Exploration**: Run `sudo unshare --pid --fork --mount-proc /bin/bash` to create a new PID namespace. Inside, run `ps aux` and verify you only see processes in your namespace. Try `kill -9 1` from the *host* and observe what happens to the namespace. Document the relationship between PID 1 in the namespace and the actual PID on the host (find it with `grep NSpid /proc/<host_pid>/status`).",
    "**Cgroup Resource Limiting**: Create a cgroup under `/sys/fs/cgroup/test-cgroup/`. Set `memory.max` to 50MB and `pids.max` to 5. Write your shell's PID into `cgroup.procs`, then run a memory-intensive command (e.g., `python3 -c \"x = bytearray(100*1024*1024)\"`). Observe the OOM kill. Then try forking more than 5 processes and observe the `EAGAIN` error.",
    "**OverlayFS Hands-On**: Create a manual OverlayFS mount: make `lower/`, `upper/`, `work/`, and `merged/` directories. Place files in `lower/`. Mount with `sudo mount -t overlay overlay -o lowerdir=lower,upperdir=upper,workdir=work merged/`. Read a file from `merged/` (comes from lower). Modify it. Verify the copy-on-write by checking that the file now exists in `upper/`. Delete a lower-layer file and find the *whiteout* marker in `upper/`.",
    "**Security Audit**: Run a container with `docker run --rm -it alpine sh`. Inside, check capabilities with `cat /proc/1/status | grep Cap`, decode with `capsh`, and list available syscalls. Then run the same container with `--cap-drop=ALL --cap-add=NET_BIND_SERVICE --security-opt=no-new-privileges` and compare. Document which capabilities were dropped and how this reduces the attack surface.",
    "**Multi-Runtime Comparison**: Install both `runc` and `crun` (or `youki`). Create an OCI bundle manually (rootfs + config.json) and run it with each runtime. Measure startup time using `time` for 100 iterations. Compare the performance characteristics and explain why `crun` (written in C) is faster than `runc` (written in Go) for container creation."
  ],
  cheatSheet: [
    "`unshare --pid --net --mount --fork /bin/sh` -- Create new **PID, network, and mount namespaces**; `--fork` ensures the shell becomes PID 1 in the new namespace",
    "`echo 50000 100000 > /sys/fs/cgroup/mygroup/cpu.max` -- Limit a cgroup to **0.5 CPU cores** (50ms quota per 100ms period) using the CFS bandwidth controller",
    "`docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE --read-only --security-opt=no-new-privileges myapp` -- **Hardened container**: drop all capabilities, read-only rootfs, prevent privilege escalation",
    "`docker inspect --format '{{.GraphDriver.Data.UpperDir}}' <container>` -- Find the **writable OverlayFS layer** for a running container; all modifications live here",
    "`grep Seccomp /proc/<pid>/status` -- Check if a process has **seccomp** filtering enabled: 0=disabled, 1=strict, 2=filter (BPF-based, used by Docker)",
    "`cat /proc/<pid>/cgroup` -- View which **cgroup** a process belongs to; follow the path under `/sys/fs/cgroup/` to see resource limits and current usage"
  ],
  revisionNotes: [
    "Containers are **isolated processes**, not lightweight VMs. They use **seven Linux namespaces** (PID, Network, Mount, UTS, IPC, User, Cgroup) for isolation and **cgroups** for resource limits. The shared host kernel is both their *strength* (performance, density) and *weakness* (security boundary).",
    "**Cgroups v2** unified hierarchy is the modern standard (Kubernetes 1.25+ default). Key files: `cpu.max` (CFS quota), `memory.max` (hard limit, triggers OOM), `memory.high` (soft throttle), `pids.max` (fork bomb protection). **PSI metrics** provide real-time resource pressure visibility.",
    "**OverlayFS** enables efficient image sharing: multiple containers share *read-only lower layers*, storing only unique changes in per-container *upper layers*. **Copy-on-write** means files are only duplicated when modified. Deletions create **whiteout files**. This is why container creation is nearly instant -- no filesystem copy needed.",
    "Container security is **defense-in-depth**: drop unnecessary *Linux capabilities*, apply *seccomp* syscall filters (Docker blocks ~44 dangerous syscalls by default), use *AppArmor/SELinux* MAC policies, run *rootless* (user namespaces), and use *read-only root filesystems*. For VM-level isolation with container UX, use **Kata Containers** or **gVisor**.",
    "The **OCI specifications** (runtime-spec, image-spec, distribution-spec) make the container ecosystem *modular*: images built with Docker run on containerd, CRI-O, or Podman. Runtimes are swappable: `runc` (reference, Go), `crun` (fast, C), `youki` (Rust), Kata (micro-VM), gVisor (user-space kernel)."
  ],
};
