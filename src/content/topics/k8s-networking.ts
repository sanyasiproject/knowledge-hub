import type { TopicContent } from "../types";

export const k8sNetworking: TopicContent = {
  quickSummary: [
    "Kubernetes networking follows a flat model: every pod gets a unique IP, and all pods can communicate without NAT, regardless of which node they are on.",
    "Services provide stable virtual IPs (ClusterIP) with automatic load balancing across pod endpoints; NodePort and LoadBalancer types expose services externally.",
    "Ingress resources define HTTP/HTTPS routing rules (host/path-based) backed by an Ingress controller like NGINX, Traefik, or cloud ALBs.",
    "CoreDNS provides cluster-internal DNS, resolving service names to ClusterIPs and enabling service discovery via `<svc>.<ns>.svc.cluster.local`.",
    "NetworkPolicies act as pod-level firewalls, controlling ingress and egress traffic based on pod labels, namespace selectors, and CIDR blocks.",
  ],
  detailed: [
    "## Service Types\n\n**ClusterIP** (default) assigns a virtual IP reachable only within the cluster. Kube-proxy programs iptables/IPVS rules to distribute traffic across healthy pod endpoints. **NodePort** extends ClusterIP by opening a static port (30000-32767) on every node, making the service reachable at `<NodeIP>:<NodePort>`. **LoadBalancer** extends NodePort by provisioning a cloud load balancer that routes external traffic to the NodePorts. **ExternalName** maps a service to a DNS CNAME (e.g., an external database), performing no proxying. Choosing the right type depends on whether traffic is internal-only, needs simple external access, or requires production-grade load balancing.",
    "## Ingress and Ingress Controllers\n\nAn Ingress resource defines layer-7 HTTP routing rules: route `api.example.com` to the `api` service, route `example.com/static` to the `cdn` service. An Ingress controller (a pod running NGINX, Traefik, HAProxy, or a cloud-native ALB controller) watches Ingress objects and configures the reverse proxy accordingly. Ingress supports TLS termination (via Secrets containing certificates), path-based routing, host-based virtual hosting, and annotations for rate limiting, redirects, and authentication. The newer Gateway API provides a more expressive, role-oriented alternative to Ingress.",
    "## DNS and Service Discovery\n\nCoreDNS runs as a Deployment in the `kube-system` namespace and serves DNS for the cluster. Every Service gets a DNS record: `<service>.<namespace>.svc.cluster.local` resolves to the ClusterIP. Headless Services (clusterIP: None) return individual pod IPs as A records, enabling clients to discover all endpoints. Pods get DNS search domains configured so that `my-service` resolves within the same namespace. StatefulSet pods get individual DNS entries: `<pod-name>.<headless-service>.<namespace>.svc.cluster.local`. External DNS controllers can sync Service/Ingress records to cloud DNS providers.",
    "## CNI (Container Network Interface)\n\nCNI plugins implement the flat pod networking model. When a pod is created, the CNI plugin assigns it an IP from the pod CIDR, sets up virtual ethernet pairs, and configures routing so the pod can communicate with pods on other nodes. Popular CNI plugins include **Calico** (BGP-based routing with NetworkPolicy support), **Cilium** (eBPF-based with advanced observability and security), **Flannel** (simple overlay network using VXLAN), and **Weave** (mesh network with encryption). The CNI plugin choice affects performance, security features, and NetworkPolicy support.",
    "## NetworkPolicy\n\nNetworkPolicies are Kubernetes-native firewalls applied at the pod level. By default, all pods accept all traffic. Once a NetworkPolicy selects a pod, that pod's traffic is restricted to what the policy explicitly allows. Policies specify `ingress` rules (who can send traffic to selected pods) and `egress` rules (where selected pods can send traffic), using pod selectors, namespace selectors, and IP CIDR blocks. Policies are additive -- multiple policies combine with OR logic. The CNI plugin must support NetworkPolicies (Calico, Cilium do; Flannel alone does not). A deny-all default policy combined with explicit allow policies implements a zero-trust network model.",
  ],
  interviewQA: [
    {
      q: "Explain the difference between ClusterIP, NodePort, and LoadBalancer service types.",
      a: "ClusterIP creates a virtual IP accessible only within the cluster for internal service-to-service communication. NodePort extends ClusterIP by opening a port on every node (30000-32767), allowing external access via any node's IP. LoadBalancer extends NodePort by provisioning a cloud load balancer that distributes external traffic across nodes. Each type builds on the previous one: LoadBalancer includes a NodePort, which includes a ClusterIP.",
      followUps: [
        "When would you use ExternalName instead?",
        "Why might you prefer Ingress over LoadBalancer for HTTP services?",
      ],
    },
    {
      q: "How does DNS-based service discovery work in Kubernetes?",
      a: "CoreDNS runs as a cluster add-on and creates DNS records for every Service. A ClusterIP Service gets an A record at `<name>.<namespace>.svc.cluster.local` resolving to its virtual IP. Pods have search domains configured so that within the same namespace, you can use just the service name. Headless Services return pod IPs directly as A records, enabling direct pod discovery. StatefulSet pods get individual DNS entries via their headless Service.",
      followUps: [
        "What is the difference between a regular Service and a headless Service in DNS?",
        "How do DNS search domains work in pod resolv.conf?",
      ],
    },
    {
      q: "What are NetworkPolicies and how do you implement zero-trust networking?",
      a: "NetworkPolicies are pod-level firewall rules that restrict ingress and egress traffic. By default, all traffic is allowed. To implement zero-trust, first apply a deny-all policy to every namespace (empty podSelector selects all pods, empty ingress/egress blocks deny everything). Then add specific allow policies for each legitimate communication path. The CNI plugin must support NetworkPolicies -- Calico and Cilium do, but Flannel alone does not.",
      followUps: [
        "Are NetworkPolicies namespace-scoped or cluster-scoped?",
        "How do you allow DNS egress in a deny-all policy?",
      ],
    },
    {
      q: "What is the Gateway API and how does it improve on Ingress?",
      a: "The Gateway API is a newer, more expressive API for managing traffic routing. It separates concerns into GatewayClass (infrastructure provider), Gateway (cluster operator configures listeners), and HTTPRoute (application developer defines routing rules). This role-oriented model is more flexible than Ingress, supports TCP/UDP routing (not just HTTP), weighted traffic splitting for canary deployments, and header-based matching without relying on controller-specific annotations.",
    },
  ],
  mcqs: [
    {
      q: "Which Service type provisions a cloud load balancer?",
      options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"],
      answerIndex: 2,
      explanation:
        "LoadBalancer type tells the cloud provider to create an external load balancer that routes traffic to the NodePorts on cluster nodes.",
    },
    {
      q: "What DNS record does a headless Service create?",
      options: [
        "A single A record pointing to the ClusterIP",
        "Individual A records for each pod IP",
        "A CNAME record pointing to the node",
        "No DNS records are created",
      ],
      answerIndex: 1,
      explanation:
        "A headless Service (clusterIP: None) skips the virtual IP and returns individual pod IPs as A records, enabling direct pod discovery.",
    },
    {
      q: "What happens to a pod's traffic when a NetworkPolicy first selects it?",
      options: [
        "All traffic is allowed by default as before",
        "All traffic is denied except what the policy explicitly allows",
        "Only egress traffic is restricted",
        "The pod is isolated from its namespace but not from others",
      ],
      answerIndex: 1,
      explanation:
        "Once any NetworkPolicy selects a pod, that pod switches from default-allow to default-deny for the direction (ingress/egress) the policy specifies. Only explicitly allowed traffic passes.",
    },
    {
      q: "Which CNI plugin uses eBPF for networking and security?",
      options: ["Flannel", "Calico", "Cilium", "Weave"],
      answerIndex: 2,
      explanation:
        "Cilium uses eBPF programs in the Linux kernel for high-performance networking, load balancing, and security enforcement, and can even replace kube-proxy.",
    },
    {
      q: "What NodePort range does Kubernetes use by default?",
      options: ["1024-65535", "8000-9000", "30000-32767", "49152-65535"],
      answerIndex: 2,
      explanation:
        "NodePort services allocate ports from the 30000-32767 range by default, configurable via the API server's --service-node-port-range flag.",
    },
  ],
  flashcards: [
    {
      front: "What is the Kubernetes networking model's fundamental rule?",
      back: "Every pod gets a unique IP and all pods can communicate with each other without NAT (flat network).",
    },
    {
      front: "ClusterIP vs NodePort vs LoadBalancer?",
      back: "ClusterIP: internal only. NodePort: adds a port on every node. LoadBalancer: adds a cloud LB on top of NodePort. Each builds on the previous.",
    },
    {
      front: "What does CoreDNS provide?",
      back: "Cluster DNS resolving service names to ClusterIPs (`<svc>.<ns>.svc.cluster.local`) and headless services to individual pod IPs.",
    },
    {
      front: "What is a NetworkPolicy?",
      back: "A pod-level firewall rule that restricts ingress/egress traffic by pod selector, namespace selector, or CIDR block. Requires CNI support.",
    },
    {
      front: "What does a CNI plugin do?",
      back: "Assigns pod IPs, sets up virtual networking, and configures routing so pods on different nodes can communicate.",
    },
    {
      front: "What is an Ingress?",
      back: "A layer-7 HTTP routing resource defining host/path rules, backed by an Ingress controller (NGINX, Traefik) that configures the reverse proxy.",
    },
    {
      front: "How do you implement zero-trust networking in K8s?",
      back: "Apply a deny-all NetworkPolicy to all namespaces, then add specific allow policies for each legitimate communication path.",
    },
    {
      front: "What is the Gateway API?",
      back: "A newer, role-oriented alternative to Ingress with GatewayClass, Gateway, and HTTPRoute resources supporting TCP/UDP, weighted routing, and header matching.",
    },
  ],
  deepDive: [
    "The **Kubernetes networking model** mandates three fundamental rules: every Pod gets its own *unique IP address*, all Pods can reach every other Pod *without NAT*, and the IP a Pod sees for itself is the same IP others use to reach it. Implementing this flat network falls to **CNI plugins**, each of which takes a different approach. **Flannel** uses a simple *VXLAN overlay* -- it encapsulates Pod-to-Pod traffic in UDP packets that traverse the underlay network, trading some performance for operational simplicity. **Calico** avoids encapsulation entirely by using *BGP peering* to distribute Pod routes to every node, achieving near-native throughput but requiring either a BGP-capable fabric or an IP-in-IP fallback for cross-subnet traffic. **Cilium** rewrites the networking stack at the *kernel level* using **eBPF programs**, replacing kube-proxy entirely (`kubeProxyReplacement: true`) and enabling features like *transparent encryption* (WireGuard), *L7 policy enforcement* (HTTP method/path matching), and *Hubble observability* without sidecar proxies. Choosing a CNI plugin is one of the most consequential infrastructure decisions in a cluster because it determines **NetworkPolicy support**, *encryption capabilities*, *performance characteristics*, and *observability depth*.",
    "**kube-proxy** is the component responsible for translating `Service` objects into *data-plane forwarding rules*. In the default **iptables mode**, kube-proxy creates chains of `DNAT` rules that randomly select a backend Pod for each new connection, achieving statistically even distribution. However, iptables rules scale *O(n)* with the number of Services and endpoints -- clusters with 10,000+ Services can see noticeable rule-update latency and CPU consumption on every node. **IPVS mode** (`--proxy-mode=ipvs`) uses the kernel's *IP Virtual Server* module, which stores rules in a hash table and supports multiple load-balancing algorithms: `rr` (round-robin), `lc` (least connections), `wrr` (weighted round-robin), `sh` (source hashing for session affinity), and more. IPVS scales *O(1)* for rule lookups, making it the recommended mode for large clusters. Beyond kube-proxy entirely, Cilium's eBPF-based `kube-proxy replacement` handles service load balancing directly in the kernel's XDP/TC hooks, reducing per-packet overhead and enabling *Maglev consistent hashing* for better connection distribution during endpoint changes.",
    "The **Gateway API** (graduated to GA in Kubernetes 1.31 for core resources) represents a generational leap beyond Ingress. Its *role-oriented design* separates infrastructure concerns (**GatewayClass** -- managed by the platform provider), cluster-level configuration (**Gateway** -- managed by cluster operators who define listeners with ports, protocols, and TLS settings), and application routing (**HTTPRoute**, **GRPCRoute**, **TCPRoute**, **UDPRoute** -- managed by application developers). This separation enables *self-service routing* without granting developers access to infrastructure configuration. Key capabilities absent from Ingress include: **traffic splitting** with weights (e.g., `90%` to stable, `10%` to canary via `backendRefs` weights), **header-based matching** and modification, **request mirroring** for shadow traffic testing, **cross-namespace routing** via `ReferenceGrant` (allowing an HTTPRoute in namespace A to reference a Service in namespace B), and **TLS passthrough** for end-to-end encryption. The extensibility model uses *policy attachment* -- custom policies (like rate limiting or authentication) can be attached to Gateways, Routes, or BackendRefs using the `targetRef` pattern, avoiding the annotation sprawl that plagues Ingress configurations.",
  ],
  code: [
    {
      language: "yaml",
      caption: "**NetworkPolicy** implementing *zero-trust*: deny all traffic, then allow specific ingress and DNS egress",
      source: `# Step 1: Default deny all ingress and egress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}    # selects ALL pods in namespace
  policyTypes:
    - Ingress
    - Egress
---
# Step 2: Allow frontend pods to receive traffic on port 8080
# and allow egress to the API service + DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: api-server
      ports:
        - protocol: TCP
          port: 3000
    - to:                    # Allow DNS resolution
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53`,
    },
    {
      language: "yaml",
      caption: "**Gateway API** setup: *GatewayClass*, *Gateway* with TLS, and *HTTPRoute* with traffic splitting",
      source: `# GatewayClass -- managed by platform team
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: cloud-lb
spec:
  controllerName: example.com/gateway-controller
---
# Gateway -- managed by cluster operator
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: api-gateway
  namespace: infra
spec:
  gatewayClassName: cloud-lb
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      tls:
        mode: Terminate
        certificateRefs:
          - name: api-tls-cert
            kind: Secret
      allowedRoutes:
        namespaces:
          from: Selector
          selector:
            matchLabels:
              gateway-access: "true"
---
# HTTPRoute -- managed by app developer (canary split)
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route
  namespace: api-team
spec:
  parentRefs:
    - name: api-gateway
      namespace: infra
  hostnames:
    - "api.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /v2
      backendRefs:
        - name: api-stable
          port: 8080
          weight: 90
        - name: api-canary
          port: 8080
          weight: 10`,
    },
    {
      language: "bash",
      caption: "Diagnostic **kubectl** commands for *debugging networking*, DNS, and services",
      source: `# Verify DNS resolution from inside a pod
kubectl run dnstest --rm -it --image=busybox:1.36 --restart=Never -- \\
  nslookup my-service.default.svc.cluster.local

# Check endpoints backing a Service
kubectl get endpoints my-service -o wide

# Inspect kube-proxy mode (iptables vs IPVS)
kubectl get configmap kube-proxy -n kube-system -o yaml | grep mode

# List IPVS rules on a node (if using IPVS mode)
kubectl debug node/worker-1 -it --image=nicolaka/netshoot -- \\
  ipvsadm -Ln

# Trace NetworkPolicy effects with Cilium
kubectl exec -n kube-system cilium-xxxxx -- \\
  cilium monitor --type policy-verdict

# Verify Ingress controller routing
kubectl describe ingress my-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller --tail=50

# Test service connectivity with curl
kubectl run curlpod --rm -it --image=curlimages/curl --restart=Never -- \\
  curl -v http://my-service.default.svc.cluster.local:8080/health`,
    },
  ],
  diagrams: [
    {
      title: "Kubernetes Service Types and Traffic Flow",
      kind: "flow",
      caption: "External traffic enters via LoadBalancer, which routes to NodePort on every node, which forwards to ClusterIP, where kube-proxy distributes to pod endpoints.",
      mermaid: `flowchart TB
    EXT["External Client"] -->|DNS to LB IP| LB["Cloud Load Balancer\nLoadBalancer Service"]
    LB -->|NodePort on any node| NP["NodePort 30000-32767\non every node"]
    NP -->|kube-proxy DNAT| CIP["ClusterIP\nVirtual IP - iptables or IPVS"]
    CIP --> P1["Pod 1\n10.244.1.5"]
    CIP --> P2["Pod 2\n10.244.2.8"]
    CIP --> P3["Pod 3\n10.244.3.3"]
    subgraph Internal["Internal Service Discovery"]
      SVC2["Service my-svc\nClusterIP only"] -->|svc.ns.svc.cluster.local| CIP2["ClusterIP"]
      CIP2 --> P4["Backend Pod"]
    end`,
    },
    {
      title: "DNS-Based Service Discovery",
      kind: "sequence",
      caption: "CoreDNS resolves service names to ClusterIPs. Pods use search domains so short names work within the same namespace without the full FQDN.",
      mermaid: `sequenceDiagram
    participant Pod as App Pod
    participant DNS as CoreDNS
    participant SVC as Service ClusterIP
    participant Back as Backend Pod
    Pod->>DNS: resolve my-service
    Note over Pod,DNS: /etc/resolv.conf search domain\nmy-service -> my-service.default.svc.cluster.local
    DNS-->>Pod: ClusterIP 10.96.100.5
    Pod->>SVC: HTTP request to 10.96.100.5:80
    SVC->>SVC: kube-proxy iptables DNAT
    SVC->>Back: forward to 10.244.2.8:8080
    Back-->>Pod: HTTP response`,
    },
    {
      title: "NetworkPolicy Zero-Trust Model",
      kind: "architecture",
      caption: "A default-deny policy blocks all traffic to selected pods. Explicit allow policies are added for each legitimate path. The CNI plugin enforces the rules at the kernel level.",
      mermaid: `graph LR
    subgraph NS["Namespace: production"]
      FE["frontend pod\nlabel: app=frontend"]
      API["api pod\nlabel: app=api"]
      DB["database pod\nlabel: app=db"]
    end
    ING["Ingress Controller\nnamespace: ingress-nginx"]
    ING -->|allowed by NetworkPolicy\nport 80 from ingress-nginx ns| FE
    FE -->|allowed by NetworkPolicy\nport 3000 to app=api| API
    API -->|allowed by NetworkPolicy\nport 5432 to app=db| DB
    BAD["Other pods"] -. blocked by default-deny .- FE
    BAD -. blocked .- DB
    NOTE["Default deny policy\nselects all pods\nblocks all ingress and egress\nDNS egress explicitly allowed"]`,
    },
    {
      title: "Ingress and Gateway API Routing",
      kind: "network",
      caption: "Ingress routes HTTP traffic by host and path. The newer Gateway API separates concerns: GatewayClass for infra, Gateway for listeners, HTTPRoute for app routing rules.",
      mermaid: `graph TD
    subgraph Ingress["Ingress - Single Resource"]
      IC["Ingress Controller\nNGINX Traefik"]
      IR["Ingress Resource\napi.example.com -> api-svc\nexample.com/static -> cdn-svc"]
      IC --> IR
    end
    subgraph GatewayAPI["Gateway API - Role-Oriented"]
      GC["GatewayClass\ninfrastructure provider"]
      GW["Gateway\noperator configures listeners\nHTTPS port 443"]
      HR["HTTPRoute\ndeveloper defines routes\nweighted 90/10 canary split"]
      GC --> GW
      GW --> HR
    end
    HR -->|routes to| SVC1["stable-svc 90%"]
    HR -->|routes to| SVC2["canary-svc 10%"]`,
    },
  ],
  comparison: {
    columns: ["Feature", "Flannel", "Calico", "Cilium", "Weave"],
    rows: [
      ["**Networking model**", "*VXLAN overlay*", "*BGP routing* (or IP-in-IP)", "*eBPF* kernel programs", "*Mesh overlay*"],
      ["**NetworkPolicy**", "No (needs Calico addon)", "Yes (full support)", "Yes (L3/L4 + *L7*)", "Yes (basic)"],
      ["**Performance**", "Good (encap overhead)", "**Excellent** (native routing)", "**Excellent** (kernel bypass)", "Moderate"],
      ["**Encryption**", "No", "WireGuard optional", "**WireGuard** built-in", "IPsec (sleeve mode)"],
      ["**Observability**", "Minimal", "Flow logs", "**Hubble** (deep L7 visibility)", "Basic flow logs"],
      ["**kube-proxy replacement**", "No", "Via eBPF (with Calico eBPF)", "**Yes** (full replacement)", "No"],
      ["**Complexity**", "*Low*", "*Medium*", "*Medium-High*", "*Low*"],
      ["**Best for**", "Simple clusters, dev/test", "Production, BGP-capable DCs", "Advanced security + observability", "Small clusters, encryption"],
    ],
  },
  exercises: [
    "**Implement zero-trust networking**: Create a namespace `secure-app` with three Deployments (`frontend`, `api`, `database`). Apply a *default-deny-all* NetworkPolicy, then write targeted policies allowing: `frontend` ingress from Ingress controller only, `frontend` to `api` on port 3000, `api` to `database` on port 5432, and DNS egress for all pods. Verify with `kubectl exec` curl tests that unauthorized paths are blocked.",
    "**Set up Gateway API with canary routing**: Install a Gateway API-compatible controller (e.g., *Envoy Gateway* or *NGINX Gateway Fabric*). Create a `GatewayClass`, a `Gateway` with HTTPS listener, and an `HTTPRoute` that splits traffic 90/10 between a stable and canary backend. Gradually shift weights and observe traffic distribution using `kubectl logs`.",
    "**Debug DNS resolution failures**: Deliberately misconfigure a Service (e.g., wrong selector labels so no endpoints exist). Use `kubectl run` with a *busybox* or *netshoot* debug pod to trace the failure: check `nslookup`, verify endpoints with `kubectl get endpoints`, inspect CoreDNS logs, and fix the issue. Document each diagnostic step.",
    "**Compare kube-proxy modes**: Set up two test clusters (or reconfigure one), one with **iptables** mode and one with **IPVS** mode. Deploy 100 Services and measure `iptables -L -n | wc -l` vs `ipvsadm -Ln | wc -l`. Benchmark connection latency and CPU usage under load using `wrk` or `hey`. Document the performance differences.",
    "**Build a multi-namespace Ingress**: Create three namespaces (`team-a`, `team-b`, `shared-infra`). Deploy different applications in each team namespace. Configure an NGINX Ingress controller in `shared-infra` with *host-based routing* (`a.example.com` and `b.example.com`) and *path-based routing* (`/api` vs `/web`). Add TLS termination using a self-signed certificate Secret.",
  ],
  cheatSheet: [
    "**Service DNS format**: `<service>.<namespace>.svc.cluster.local` -- within the same namespace, just use `<service>` thanks to search domains in `/etc/resolv.conf`",
    "**Headless Service**: Set `clusterIP: None` to get individual Pod IPs as DNS A records instead of a single VIP -- required for StatefulSets and peer discovery",
    "**NetworkPolicy default deny**: An empty `podSelector: {}` selects *all pods*; empty `ingress: []` / `egress: []` arrays deny all traffic in that direction",
    "**NodePort range**: `30000-32767` by default; override with `--service-node-port-range` on the API server (e.g., `--service-node-port-range=20000-30000`)",
    "**Debug pod networking**: `kubectl run netshoot --rm -it --image=nicolaka/netshoot -- bash` gives you `curl`, `dig`, `nslookup`, `tcpdump`, `iperf`, `traceroute`",
    "**kube-proxy mode check**: `kubectl get cm kube-proxy -n kube-system -o yaml | grep mode` -- empty string means iptables (default); set to `ipvs` for large clusters",
  ],
  revisionNotes: [
    "Kubernetes networking is **flat**: every Pod gets a unique IP, all Pods communicate *without NAT*. **CNI plugins** implement this -- *Flannel* (VXLAN overlay), *Calico* (BGP routing), *Cilium* (eBPF with L7 visibility and kube-proxy replacement).",
    "**Services** provide stable VIPs: *ClusterIP* (internal), *NodePort* (external via node ports 30000-32767), *LoadBalancer* (cloud LB provisioning). **kube-proxy** implements forwarding via *iptables* (O(n) rules) or *IPVS* (O(1) hash lookups, multiple algorithms).",
    "**CoreDNS** resolves `<svc>.<ns>.svc.cluster.local` to ClusterIPs. **Headless Services** (`clusterIP: None`) return individual Pod IPs. **StatefulSet** pods get unique DNS entries via `<pod>.<headless-svc>.<ns>.svc.cluster.local`.",
    "**NetworkPolicies** are *additive*, pod-level firewalls. Once a policy selects a pod, unmatched traffic in that direction is *denied*. Implement zero-trust with a default-deny policy + explicit allow rules. The CNI must support them (*Calico* and *Cilium* do; *Flannel* alone does not).",
    "**Gateway API** (GA in K8s 1.31) replaces Ingress with a *role-oriented model*: `GatewayClass` (infra provider), `Gateway` (operator), `HTTPRoute` (developer). Supports *traffic splitting*, *header matching*, *cross-namespace routing* via `ReferenceGrant`, and extensibility via *policy attachment*.",
  ],
  glossary: [
    {
      term: "ClusterIP",
      definition:
        "The default Service type that assigns a virtual IP reachable only within the cluster for internal load balancing.",
    },
    {
      term: "Ingress",
      definition:
        "A Kubernetes resource defining layer-7 HTTP/HTTPS routing rules (host and path based) for external access to services.",
    },
    {
      term: "CoreDNS",
      definition:
        "The cluster DNS server that resolves service and pod names to IP addresses for in-cluster service discovery.",
    },
    {
      term: "CNI",
      definition:
        "Container Network Interface -- a plugin standard for configuring pod networking, IP allocation, and inter-node routing.",
    },
    {
      term: "NetworkPolicy",
      definition:
        "A Kubernetes resource that acts as a pod-level firewall, controlling allowed ingress and egress traffic based on selectors and CIDRs.",
    },
    {
      term: "Headless Service",
      definition:
        "A Service with clusterIP: None that returns individual pod IPs in DNS queries instead of a single virtual IP.",
    },
    {
      term: "NodePort",
      definition:
        "A Service type that opens a static port (30000-32767) on every node, enabling external access without a cloud load balancer.",
    },
    {
      term: "Gateway API",
      definition:
        "A next-generation Kubernetes API for traffic routing with role-based separation (GatewayClass, Gateway, HTTPRoute) and richer features than Ingress.",
    },
  ],
};
