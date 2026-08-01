import type { TopicContent } from "../types";

export const imagesLayers: TopicContent = {
  quickSummary: [
    "A container image is an ordered collection of filesystem layers (read-only tar archives) plus metadata (environment variables, entrypoint, exposed ports) that together define everything needed to run a containerized application, stored as content-addressable blobs in an OCI-compliant format.",
    "A Dockerfile is a declarative build script where each instruction (FROM, RUN, COPY, ADD) creates a new image layer; the build engine caches layers by instruction hash, so unchanged instructions reuse cached layers and only modified instructions trigger rebuilds from that point forward.",
    "Multi-stage builds use multiple FROM statements in a single Dockerfile, allowing compilation in a full SDK stage and copying only the built artifacts into a minimal runtime stage, dramatically reducing final image size and attack surface.",
    "Container registries (Docker Hub, GitHub Container Registry, AWS ECR, Google Artifact Registry, Azure ACR) store and distribute images using the OCI Distribution Specification, supporting tags, content-addressable digests, vulnerability scanning, and access control.",
  ],
  detailed: [
    "## Image Layer Architecture\n\nA container image consists of a stack of read-only layers, each representing a set of filesystem changes (added, modified, or deleted files). Each layer is a tar archive identified by its content hash (SHA256 digest), making layers content-addressable and deduplicated — if two images share a base layer, it is stored and transferred only once. The image configuration (a JSON document) records the ordered list of layer digests, environment variables, working directory, entrypoint, cmd, exposed ports, labels, and the history of Dockerfile instructions. The manifest ties the configuration to the layers and is itself content-addressable. A manifest list (or OCI index) enables multi-architecture images — a single tag can resolve to different manifests for linux/amd64, linux/arm64, etc.",
    "## Dockerfile Instructions and Layer Creation\n\nEach Dockerfile instruction creates a layer or modifies the image configuration. FROM sets the base image (the starting layer stack). RUN executes a command inside a temporary container and commits the resulting filesystem changes as a new layer — this is where package installation, compilation, and configuration happen. COPY and ADD copy files from the build context into the image as new layers. ENV, WORKDIR, EXPOSE, LABEL, USER, and ENTRYPOINT/CMD modify only the image configuration metadata without creating filesystem layers. Best practice: combine related RUN commands with && to minimize layers, clean up temporary files in the same RUN instruction (apt-get install && apt-get clean && rm -rf /var/lib/apt/lists/*), and order instructions from least to most frequently changing to maximize cache hits.",
    "## Layer Caching Strategy\n\nThe Docker build engine caches each layer by a hash of the instruction and its inputs. For RUN instructions, the cache key is the instruction text itself — identical commands reuse the cache. For COPY and ADD, the cache key includes the content hash of the source files — if any source file changes, the cache is invalidated. Cache invalidation cascades: when a layer's cache is busted, all subsequent layers are rebuilt. This means instruction order matters critically. Copy dependency manifests (package.json, requirements.txt, go.mod) before source code: the dependency installation layer is cached until the manifest changes, even when source code changes frequently. BuildKit (Docker's modern build engine) supports parallel stage execution, improved caching with cache mounts (--mount=type=cache), and secret mounts (--mount=type=secret) for build-time credentials.",
    "## Multi-Stage Builds\n\nMulti-stage builds allow a single Dockerfile to define multiple build stages, each starting with its own FROM instruction. The key pattern is compiling in a full SDK/toolchain image and then copying only the built artifacts into a minimal runtime image. For example: stage 1 uses golang:1.22 to compile the binary, stage 2 uses gcr.io/distroless/static to run it — the final image contains only the static binary and the minimal distroless base, not the Go toolchain, source code, or build dependencies. This reduces image size from hundreds of MBs to tens of MBs, eliminates build tools from the production image (reducing attack surface), and keeps build reproducibility in a single Dockerfile. Named stages (FROM golang:1.22 AS builder) allow selective COPY --from=builder for clarity.",
    "## Image Registries and Distribution\n\nContainer registries store images as blobs (layers) and manifests, accessed via the OCI Distribution Specification HTTP API. Key operations: push (upload layers and manifest), pull (download manifest and layers), and tag (associate a human-readable name like v1.2.3 with a manifest digest). Tags are mutable — pushing to the same tag overwrites the previous manifest. Digests (sha256:abc123...) are immutable references for reproducible deployments. Registries offer features like vulnerability scanning (analyzing image layers for known CVEs), image signing (Cosign, Notary/TUF for verifying provenance), garbage collection (removing unreferenced blobs), geo-replication (for reduced pull latency), and access control (per-repository permissions). Public registries like Docker Hub host community images; private registries (ECR, ACR, Artifact Registry, self-hosted Harbor) store proprietary images with authentication.",
    "## Image Size Optimization\n\nSmaller images pull faster, start faster, consume less storage, and have a smaller attack surface. Strategies: use minimal base images (Alpine Linux at ~5MB, distroless images with only the runtime, or scratch for static binaries). Multi-stage builds exclude build tools. Combine RUN instructions and clean up in the same layer (removing package manager caches, temp files). Use .dockerignore to exclude unnecessary build context (node_modules, .git, test files, docs). Pin base image versions by digest for reproducibility. Use docker image history and dive (third-party tool) to analyze layer sizes and identify bloat. For interpreted languages, use slim variants of official images (python:3.12-slim vs python:3.12).",
  ],
  interviewQA: [
    {
      q: "Explain how Docker layer caching works and how instruction order in a Dockerfile affects build performance.",
      a: "Docker caches each layer using a hash of the instruction and its inputs. When rebuilding, Docker checks if the cache is valid for each instruction sequentially. If a layer's cache is invalidated (instruction changed, source files changed for COPY), all subsequent layers are also rebuilt — cache invalidation cascades downward. To maximize caching: place instructions that change infrequently first (FROM, installing system packages) and frequently changing instructions last (COPY source code). Copy dependency manifests (package.json, requirements.txt) and install dependencies before copying application source — this way, dependency installation is cached even when source code changes. A common antipattern is COPY . . early in the Dockerfile, which busts the cache on every source change and forces all subsequent layers to rebuild.",
      followUps: [
        "How does BuildKit's cache mount differ from standard layer caching?",
        "What is the difference between --no-cache and --pull in docker build?",
      ],
    },
    {
      q: "What is a multi-stage build and why is it important for production images?",
      a: "A multi-stage build uses multiple FROM instructions in a single Dockerfile, each starting a new build stage. Typically, the first stage uses a full SDK image (Go, Java, Node.js) to compile or bundle the application. The final stage uses a minimal runtime image (distroless, Alpine, or scratch) and copies only the built artifacts from the build stage using COPY --from=builder. This produces small, secure production images because build tools, source code, intermediate files, and development dependencies are not included. For example, a Go application might compile in a 1.5 GB golang image but run in a 20 MB distroless image containing only the static binary and CA certificates.",
      followUps: [
        "Can you copy artifacts from any named stage, not just the previous one?",
        "What is a distroless image?",
      ],
    },
    {
      q: "Why should you pin base images by digest rather than tag?",
      a: "Tags are mutable — pushing a new image to the same tag (e.g., node:20-slim) silently replaces the previous image. This means building the same Dockerfile on different days can produce different images with different vulnerabilities or behavior. Digests (sha256:abc123...) are content-addressable and immutable — they always reference the exact same image content. Pinning by digest ensures reproducible builds and prevents supply chain attacks where a compromised tag points to a malicious image. The trade-off is that digest-pinned images do not receive automatic security updates — you need a process (Dependabot, Renovate) to update digests when new base images are released.",
      followUps: [
        "How do tools like Dependabot automate base image digest updates?",
        "What is image signing with Cosign?",
      ],
    },
    {
      q: "How does .dockerignore improve build performance and security?",
      a: "The Docker build context is the directory tree sent to the Docker daemon before building. Without .dockerignore, the entire directory (including .git, node_modules, test data, secrets, documentation) is sent, increasing transfer time and risking accidental inclusion of sensitive files in the image. .dockerignore specifies patterns to exclude from the build context, similar to .gitignore. Key exclusions: .git (can be large), node_modules (rebuilt inside the image), *.env files (may contain secrets), test directories, documentation, and IDE configuration. This reduces build context size, speeds up builds, and prevents credentials from being accidentally COPY'd into image layers where they persist even if deleted in a later layer.",
    },
  ],
  mcqs: [
    {
      q: "What happens when a COPY instruction's source files change during a Docker build?",
      options: [
        "Only that layer is rebuilt; subsequent layers use cache",
        "That layer and all subsequent layers are rebuilt",
        "The entire image is rebuilt from scratch",
        "Docker prompts the user to confirm the rebuild",
      ],
      answerIndex: 1,
      explanation:
        "Docker's layer caching cascades invalidation: when a layer's cache is busted (source files changed for COPY), all subsequent layers must also be rebuilt because they may depend on the changed content.",
    },
    {
      q: "What is the purpose of a multi-stage Docker build?",
      options: [
        "To build images for multiple CPU architectures",
        "To separate build dependencies from runtime, producing smaller final images",
        "To run multiple services in a single container",
        "To enable parallel container deployment",
      ],
      answerIndex: 1,
      explanation:
        "Multi-stage builds compile/build in a full toolchain image and copy only the artifacts into a minimal runtime image, excluding build tools, source code, and development dependencies from the production image.",
    },
    {
      q: "Why are image tags considered unreliable for reproducible deployments?",
      options: [
        "Tags are deleted after 30 days",
        "Tags are mutable and can be overwritten with different content",
        "Tags do not support semantic versioning",
        "Tags cannot reference multi-architecture images",
      ],
      answerIndex: 1,
      explanation:
        "Tags are mutable pointers — pushing a new image to an existing tag overwrites the previous reference. Digests (sha256:...) are immutable content-addressable references that always point to the exact same image content.",
    },
    {
      q: "Which Dockerfile instruction modifies only the image configuration without creating a filesystem layer?",
      options: ["RUN", "COPY", "ENV", "ADD"],
      answerIndex: 2,
      explanation:
        "ENV, WORKDIR, EXPOSE, LABEL, USER, ENTRYPOINT, and CMD modify the image configuration metadata (JSON) without creating filesystem layers. RUN, COPY, and ADD create new filesystem layers.",
    },
    {
      q: "What tool can you use to analyze the layers and size of a container image?",
      options: ["docker inspect", "docker stats", "dive", "docker top"],
      answerIndex: 2,
      explanation:
        "dive is a third-party tool that provides an interactive UI for exploring each layer of a container image, showing added/removed/modified files and layer sizes. docker image history provides basic layer information.",
    },
  ],
  flashcards: [
    {
      front: "What is a content-addressable layer?",
      back: "A filesystem layer identified by the SHA256 hash of its content (digest). Two layers with identical content have the same digest and are stored and transferred only once, enabling deduplication across images.",
    },
    {
      front: "Why should you COPY dependency manifests before source code in a Dockerfile?",
      back: "Dependency manifests (package.json, requirements.txt) change less frequently than source code. Copying and installing dependencies first creates a cached layer that is reused when only source code changes, avoiding expensive reinstallation on every build.",
    },
    {
      front: "What is a distroless image?",
      back: "A container base image by Google (gcr.io/distroless) that contains only the application runtime (Java, Python, Node.js, or static) and its dependencies — no shell, no package manager, no utilities — minimizing attack surface.",
    },
    {
      front: "What is a manifest list (OCI index)?",
      back: "A JSON document that maps a single image tag to multiple platform-specific manifests (linux/amd64, linux/arm64, etc.), enabling docker pull to automatically select the correct image for the host architecture.",
    },
    {
      front: "Why should you combine RUN commands in a Dockerfile?",
      back: "Each RUN creates a new layer. Files created in one RUN and deleted in a subsequent RUN still exist in the earlier layer, consuming space. Combining commands (RUN apt-get install && apt-get clean) ensures temporary files do not persist in any layer.",
    },
    {
      front: "What is BuildKit?",
      back: "Docker's modern build engine that provides parallel stage execution, improved caching, cache mounts (--mount=type=cache for persistent package caches), secret mounts (build-time credentials not stored in layers), and SSH forwarding.",
    },
    {
      front: "What is the scratch base image?",
      back: "An empty image with no filesystem, no shell, and no libraries. Used as the base for statically compiled binaries (Go, Rust) that need no runtime dependencies, producing the smallest possible container images.",
    },
    {
      front: "How does garbage collection work in container registries?",
      back: "Garbage collection identifies and removes blobs (layers) that are no longer referenced by any manifest. Deleting an image tag or manifest makes its unique layers eligible for collection, freeing storage space.",
    },
  ],
  deepDive: [
    `## The OCI Image Specification: Content-Addressable Storage

At its core, a container image is defined by the **OCI (Open Container Initiative) Image Specification**, which standardizes how images are built, stored, and distributed. An image consists of three key artifacts: the **image index** (manifest list), the **image manifest**, and the **image configuration**. The image index maps a tag to platform-specific manifests (enabling multi-architecture images). Each manifest references a configuration blob and an ordered list of layer digests. The configuration is a JSON document containing the execution parameters (entrypoint, env, user) and a history of the Dockerfile instructions that created each layer.

Every blob -- whether a layer tarball or a configuration JSON -- is stored by its **SHA256 content hash** (digest). This content-addressable design enables powerful properties: **deduplication** (identical layers across images are stored once), **integrity verification** (a corrupted blob's hash will not match its digest), and **immutable references** (a digest always points to the same content). When you \`docker pull\`, the client downloads the manifest, computes which layers it already has locally, and only fetches missing ones. This is why pulling an image that shares a base with an already-cached image is fast -- only the unique layers are transferred.`,

    `## Union Filesystems and Copy-on-Write

Container runtimes use **union filesystems** (OverlayFS, overlay2) to present the stacked read-only image layers as a single coherent filesystem. When a container starts, the runtime adds a thin **writable layer** on top of the image layers. This writable layer uses **copy-on-write (CoW)** semantics: reading a file traverses the layer stack from top to bottom until the file is found (efficient for reads). Writing to an existing file **copies it from the lower layer to the writable layer** first, then modifies the copy. This means the original image layers are never modified, and multiple containers can share the same image layers simultaneously.

The CoW mechanism has performance implications: the first write to a large file from a lower layer incurs a copy penalty. For write-heavy workloads (databases, logs), this is why **bind mounts** or **volumes** are preferred over writing to the container layer -- volumes bypass the union filesystem entirely and write directly to the host filesystem. Understanding this distinction is critical for optimizing container performance: application data should always go in volumes, while the container's writable layer should be used only for ephemeral state (temp files, PID files).`,

    `## BuildKit Architecture and Advanced Caching

**BuildKit** is Docker's modern build engine (default since Docker 23.0) and represents a significant leap over the legacy builder. It constructs a **directed acyclic graph (DAG)** of build steps from the Dockerfile, enabling **parallel execution** of independent stages. For example, in a multi-stage build where stage 1 compiles the backend and stage 2 builds the frontend, BuildKit executes both concurrently.

BuildKit introduces several advanced caching mechanisms beyond simple layer caching. **Cache mounts** (\`--mount=type=cache,target=/root/.cache\`) persist package manager caches (pip, npm, apt) across builds without including them in the final image -- this dramatically speeds up dependency installation. **Secret mounts** (\`--mount=type=secret,id=mysecret\`) inject credentials at build time without baking them into any layer. **SSH mounts** (\`--mount=type=ssh\`) forward the host's SSH agent for cloning private repositories during build. BuildKit also supports **remote cache backends** (registry-based, S3, GitHub Actions cache) for sharing build caches across CI machines, which can reduce CI build times from minutes to seconds.`,

    `## Supply Chain Security: Signing, Scanning, and SBOMs

Container image security extends beyond vulnerability scanning to encompass the entire **software supply chain**. **Image signing** with tools like **Cosign** (part of the Sigstore project) creates cryptographic signatures for image digests, allowing consumers to verify that an image was built by a trusted party and has not been tampered with. **Notary v2** and **TUF (The Update Framework)** provide more sophisticated trust models with key rotation, threshold signing, and delegation.

**Vulnerability scanning** (Trivy, Grype, Snyk Container) analyzes each layer of an image, identifying installed packages and matching them against CVE databases. Importantly, scanners check *every layer*, not just the final filesystem view -- a vulnerability in a deleted file still exists in its original layer and could potentially be extracted. This is why multi-stage builds are a security feature: build-time dependencies with vulnerabilities never make it into the production image. **SBOMs (Software Bill of Materials)** in formats like SPDX or CycloneDX provide a machine-readable inventory of all components in an image. Docker BuildKit can generate SBOMs at build time (\`--sbom=true\`), and registries like Harbor can store and query them alongside image manifests.`,
  ],
  diagrams: [
    {
      title: "Container Image Layer Stack",
      kind: "architecture",
      caption: "How Docker image layers stack from base OS up to application code.",
      mermaid: `graph TD
    WR[Writable Container Layer] --> APP[App Code Layer]
    APP --> DEP[Dependencies Layer]
    DEP --> RT[Runtime Layer Node Python etc]
    RT --> OS[Base OS Layer alpine ubuntu]
    OS --> SCRATCH[Scratch empty base]`,
    },
    {
      title: "Image Build Cache Behavior",
      kind: "sequence",
      caption: "How Docker uses layer caching to speed up subsequent builds.",
      mermaid: `sequenceDiagram
    participant Docker
    participant Cache
    participant Registry
    Docker->>Docker: Read Dockerfile instructions
    loop Each instruction
        Docker->>Cache: Check cache by instruction hash
        alt Cache hit
            Cache-->>Docker: Reuse cached layer
        else Cache miss
            Docker->>Docker: Execute instruction
            Docker->>Cache: Store new layer
        end
    end
    Docker->>Registry: Push final image`,
    },
    {
      title: "Multi-Stage Build Optimization",
      kind: "flow",
      caption: "Multi-stage Docker builds producing minimal production images.",
      mermaid: `flowchart TD
    A[Stage 1: Builder] --> B[Use full SDK image]
    B --> C[Copy source code]
    C --> D[Install build tools]
    D --> E[Compile or build artifact]
    E --> F[Stage 2: Runner]
    F --> G[Use distroless or alpine base]
    G --> H[Copy only compiled artifact from Stage 1]
    H --> I[No build tools in final image]
    I --> J[Small and secure production image]`,
    },
    {
      title: "Image Layer Concepts",
      kind: "mindmap",
      caption: "Key concepts around container image layers and storage drivers.",
      mermaid: `mindmap
  root((Image Layers))
    Union Filesystem
      OverlayFS driver
      Layer stacking
      Copy-on-write semantics
    Layer Reuse
      Shared base layers
      Cache efficiency
      Smaller pulls
    Optimization Tips
      Order instructions by change frequency
      Combine RUN commands
      Use .dockerignore
    Security
      Minimal base images
      Distroless images
      Scan layers for CVEs`,
    },
  ],
  exercises: [
    "**Dockerfile Optimization (Easy):** Given this Dockerfile, identify the caching problems and rewrite it for optimal layer caching:\n```\nFROM node:20\nCOPY . /app\nWORKDIR /app\nRUN npm install\nRUN npm run build\nEXPOSE 3000\nCMD [\"node\", \"dist/index.js\"]\n```\nHint: What changes most frequently -- dependencies or source code?",
    "**Multi-Stage Build (Medium):** Write a multi-stage Dockerfile for a C++ application that uses CMake. Stage 1 should compile the application using a full GCC image. Stage 2 should produce a minimal runtime image. The final image should be under 20MB. Consider: which libraries does the binary need at runtime? Should you use static or dynamic linking?",
    "**Layer Analysis (Medium):** An image is 1.2GB. Using `docker image history` or `dive`, you find that a single RUN layer is 800MB because it installs build tools, compiles code, and does not clean up. Rewrite the instruction to reduce this layer's size. What is the difference between cleaning up in the same RUN vs. a subsequent RUN?",
    "**Registry Security (Hard):** Design a CI/CD pipeline that: (1) builds a container image, (2) scans it for vulnerabilities, (3) signs it with Cosign, (4) pushes it to a private registry, and (5) deploys only signed images. Describe each step and the tools involved. What happens if a vulnerability is found after deployment?",
    "**Build Context Optimization (Easy):** A developer's Docker build takes 2 minutes to start before any instructions run. The project directory is 5GB (includes `.git`, `node_modules`, test fixtures, and video assets). Write a `.dockerignore` file that reduces the build context to only what is needed, and explain why each exclusion matters.",
  ],
  cheatSheet: [
    "**Layer = Dockerfile instruction output.** RUN, COPY, ADD create filesystem layers. ENV, WORKDIR, EXPOSE modify config metadata only.",
    "**Cache invalidation cascades.** One changed layer forces ALL subsequent layers to rebuild. Order: least-changing first.",
    "**Copy deps before source.** `COPY package.json . && npm install` before `COPY . .` -- deps layer is cached when only source changes.",
    "**Combine RUN + clean in one layer.** `RUN apt-get install -y pkg && apt-get clean && rm -rf /var/lib/apt/lists/*` -- separate RUN for cleanup does NOT reclaim space.",
    "**Multi-stage = small + secure.** Build in SDK image, copy artifact to distroless/Alpine/scratch. Final image has no build tools.",
    "**Tag is mutable, digest is immutable.** Pin production deployments by digest (sha256:...) for reproducibility. Use Renovate/Dependabot to update.",
    "**Use .dockerignore.** Exclude .git, node_modules, *.env, test data, docs. Smaller context = faster builds + no leaked secrets.",
    "**BuildKit cache mounts.** `RUN --mount=type=cache,target=/root/.cache pip install -r requirements.txt` -- package cache persists across builds without bloating the image.",
    "**Scan every image.** `trivy image myapp:latest` before pushing. Block deployments with critical/high CVEs.",
    "**Base image hierarchy:** scratch (0B) < distroless (~2MB) < Alpine (~5MB) < slim (~80MB) < full (~900MB). Use the smallest that works.",
  ],
  revisionNotes: [
    "A container image is an ordered stack of **read-only filesystem layers** (tar archives) identified by SHA256 content hashes, plus a JSON configuration with execution metadata.",
    "Each Dockerfile instruction that modifies the filesystem (RUN, COPY, ADD) creates a new layer. Metadata instructions (ENV, WORKDIR, EXPOSE) modify only the config JSON.",
    "**Cache invalidation cascades**: changing one layer forces all subsequent layers to rebuild. Order instructions from least to most frequently changing.",
    "**Multi-stage builds** separate build-time dependencies from runtime. COPY --from=builder copies only the final artifact into a minimal base image.",
    "Files deleted in a later layer **still exist** in the earlier layer. Always clean up in the **same RUN** instruction to avoid bloated layers.",
    "**Tags are mutable** (can be overwritten); **digests are immutable** (content-addressable). Use digests for reproducible production deployments.",
    "The **union filesystem** (OverlayFS) merges layers into a single view. The writable container layer uses **copy-on-write** -- first write to a lower-layer file copies it up.",
    "Use **volumes** for write-heavy workloads (databases, logs) to bypass the copy-on-write overhead of the container's writable layer.",
    "BuildKit enables parallel stage execution, cache mounts, secret mounts, and remote cache backends -- significantly faster and more secure than the legacy builder.",
  ],
  glossary: [
    {
      term: "Image Layer",
      definition:
        "A read-only filesystem changeset (tar archive) representing the files added, modified, or deleted by a single Dockerfile instruction, identified by its SHA256 content hash.",
    },
    {
      term: "Build Context",
      definition:
        "The directory tree sent to the Docker daemon at build time. Files not excluded by .dockerignore are available to COPY and ADD instructions.",
    },
    {
      term: "Multi-Stage Build",
      definition:
        "A Dockerfile pattern using multiple FROM instructions to separate build-time dependencies from runtime, copying only final artifacts into a minimal production image.",
    },
    {
      term: "Image Digest",
      definition:
        "An immutable, content-addressable identifier (sha256:...) for an image manifest, guaranteeing that the same digest always references the exact same image content.",
    },
    {
      term: "Union Filesystem",
      definition:
        "A filesystem that merges multiple directories (layers) into a single view, used by container runtimes to stack read-only image layers with a writable container layer.",
    },
    {
      term: ".dockerignore",
      definition:
        "A file specifying patterns to exclude from the build context, reducing context transfer time and preventing accidental inclusion of sensitive or unnecessary files in the image.",
    },
    {
      term: "Image Tag",
      definition:
        "A human-readable, mutable label (e.g., v1.2.3, latest) associated with an image manifest in a registry. Tags can be overwritten, unlike immutable digests.",
    },
    {
      term: "Container Registry",
      definition:
        "A service that stores and distributes container images, supporting push, pull, tagging, access control, and optional features like vulnerability scanning and image signing.",
    },
  ],
};
