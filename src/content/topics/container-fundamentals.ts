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
};
