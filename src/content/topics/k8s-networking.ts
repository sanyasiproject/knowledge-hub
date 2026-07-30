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
