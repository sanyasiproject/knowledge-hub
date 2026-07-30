import type { TopicContent } from "../types";

export const awsNetworking: TopicContent = {
  quickSummary: [
    "A VPC (Virtual Private Cloud) is a logically isolated virtual network in AWS. You define the IP address range (CIDR block), create subnets across Availability Zones, and control routing, gateways, and access. Every AWS resource requiring network connectivity runs inside a VPC.",
    "Subnets are segments of a VPC's IP range within a single AZ. Public subnets have a route to an Internet Gateway (allowing direct internet access); private subnets route outbound internet traffic through a NAT Gateway while remaining unreachable from the internet.",
    "Security Groups are stateful firewalls at the instance/ENI level — if you allow inbound traffic, the response is automatically allowed out. NACLs are stateless firewalls at the subnet level — you must explicitly allow both inbound and outbound. Security Groups are the primary control; NACLs provide defense-in-depth.",
    "Route 53 is AWS's DNS service supporting public and private hosted zones, health checks, and routing policies (simple, weighted, latency-based, failover, geolocation, multi-value). CloudFront is a global CDN with 450+ edge locations for low-latency content delivery.",
    "VPC Peering enables private connectivity between two VPCs (same or cross-account/region) but is non-transitive. Transit Gateway is a regional hub that connects multiple VPCs and on-premises networks through a central point, simplifying complex network topologies."
  ],

  detailed: [
    "## VPC Architecture\n\nA VPC is the foundational networking construct in AWS, providing isolated network space for your resources.\n\n**CIDR blocks:**\n- Primary CIDR: /16 (65,536 IPs) to /28 (16 IPs). Common choice: 10.0.0.0/16\n- Secondary CIDRs can be added later to expand the address space\n- Plan CIDR ranges carefully to avoid overlaps if you need VPC peering or hybrid connectivity\n- AWS reserves 5 IPs per subnet (first 4 and last 1)\n\n**Subnets:**\n- Each subnet exists in exactly one AZ\n- Public subnet: has a route to an Internet Gateway (IGW) and instances can have public IPs\n- Private subnet: no direct route to the internet; uses NAT Gateway for outbound access\n- Best practice: create subnets in at least 2 AZs for high availability\n- Typical architecture: public subnets for load balancers, private subnets for application and database tiers\n\n**Internet Gateway (IGW):**\n- Highly available, horizontally scaled gateway providing internet access to the VPC\n- Attached to the VPC, not the subnet — subnets become public by routing 0.0.0.0/0 to the IGW\n\n**NAT Gateway:**\n- Managed NAT service allowing private subnet resources to access the internet (software updates, API calls) without being reachable from the internet\n- Deployed per AZ for high availability\n- Supports up to 55 Gbps bandwidth, auto-scales\n- Costs: hourly charge + per-GB data processing fee (can be significant for high-traffic workloads)\n- Alternative: NAT Instance (self-managed EC2, cheaper but less resilient)\n\n**VPC Endpoints:**\n- Gateway endpoints: free, for S3 and DynamoDB (route table entry)\n- Interface endpoints (PrivateLink): ENI in your subnet with private IP, for 100+ AWS services. Keeps traffic on AWS network, avoids NAT Gateway costs for AWS service calls",

    "## Security Groups and NACLs\n\nAWS provides two layers of network security that work together for defense-in-depth.\n\n**Security Groups (stateful):**\n- Applied at the instance/ENI level\n- Default: deny all inbound, allow all outbound\n- Rules specify: protocol, port range, and source/destination (CIDR or another security group)\n- Stateful: if inbound is allowed, return traffic is automatically allowed regardless of outbound rules\n- Can reference other security groups as source/destination (e.g., allow inbound from the ALB security group)\n- Up to 5 security groups per ENI; rules are evaluated collectively (union of all rules)\n- Changes take effect immediately\n- No explicit deny rules — only allow rules. Traffic not matching any rule is denied\n\n**Network ACLs (stateless):**\n- Applied at the subnet level — all traffic entering or leaving the subnet is evaluated\n- Default NACL: allows all inbound and outbound traffic\n- Custom NACLs: deny all by default\n- Stateless: you must create rules for both inbound AND outbound traffic (including ephemeral port ranges for return traffic)\n- Rules have numbered priority — evaluated in order, first match wins\n- Support both allow and deny rules\n- Useful for blocking specific IP ranges (deny rules) that security groups cannot do\n\n**Best practices:**\n- Use security groups as the primary network control — they are simpler and more flexible\n- Use NACLs for subnet-wide deny rules (e.g., blocking known malicious IPs)\n- Reference security groups in rules instead of CIDR blocks when possible (self-referencing, cross-tier)\n- Keep security groups focused: separate groups for web tier, app tier, and database tier\n- Document the purpose of each security group and review quarterly",

    "## Route 53\n\nRoute 53 is a highly available, scalable DNS service and domain registrar.\n\n**Hosted zones:**\n- Public hosted zone: resolves domain names from the internet\n- Private hosted zone: resolves names only within associated VPCs (internal DNS)\n\n**Record types:**\n- A: maps name to IPv4 address\n- AAAA: maps name to IPv6 address\n- CNAME: maps name to another name (cannot be used at zone apex — use Alias instead)\n- Alias: AWS-specific record type that maps to AWS resources (ALB, CloudFront, S3) at the zone apex. Free for queries to AWS resources, supports health checks\n- MX: mail server routing\n- TXT: text records for verification, SPF, DKIM\n\n**Routing policies:**\n- **Simple:** Single resource, no health checks. Basic DNS resolution\n- **Weighted:** Distribute traffic by percentage (e.g., 80% to blue, 20% to green for canary deployments)\n- **Latency-based:** Route to the region with lowest latency from the user\n- **Failover:** Active-passive with health checks — auto-failover to secondary on primary failure\n- **Geolocation:** Route based on user's geographic location (continent, country, US state)\n- **Geoproximity:** Route based on geographic proximity with bias to shift traffic between resources\n- **Multi-value answer:** Return multiple healthy endpoints (basic DNS-level load balancing)\n\n**Health checks:**\n- Monitor endpoint health (HTTP, HTTPS, TCP)\n- Can monitor CloudWatch alarms or other health checks (calculated health checks)\n- Integrated with routing policies to automatically remove unhealthy endpoints\n- Configure threshold (e.g., 3 consecutive failures), interval (10 or 30 seconds), and regions",

    "## CloudFront\n\nCloudFront is a global Content Delivery Network (CDN) with 450+ edge locations that caches and delivers content close to end users.\n\n**Core concepts:**\n- **Distribution:** A CloudFront deployment with configuration for origins, behaviors, and caching\n- **Origin:** Where CloudFront fetches content — S3 bucket, ALB, EC2, or any HTTP server\n- **Edge location:** AWS data center that caches content near users\n- **Regional edge cache:** Larger caches between edge locations and origins, reducing origin load\n\n**Features:**\n- HTTPS with free AWS-managed SSL/TLS certificates (ACM)\n- Custom domain names (CNAMEs)\n- Origin Access Control (OAC): restrict S3 access so content is only served through CloudFront\n- Lambda@Edge and CloudFront Functions: run code at edge locations for request/response manipulation (URL rewriting, header manipulation, A/B testing, authentication)\n- Field-level encryption: encrypt sensitive form fields at the edge, decrypt only at the application\n\n**Cache behavior:**\n- Cache based on URL path patterns (e.g., /api/* to ALB, /static/* to S3)\n- Cache key includes URL, headers, query strings, and cookies (configurable)\n- TTL controls: minimum, maximum, and default TTL settings\n- Cache invalidation: remove objects from all edge caches (use sparingly — costs per path)\n- Versioned file names (style.v2.css) are preferred over invalidation\n\n**Security:**\n- AWS Shield Standard (DDoS protection) included at no extra cost\n- AWS WAF integration for application-layer security rules\n- Geo-restriction: allow or block content by country\n- Signed URLs and signed cookies for private content distribution",

    "## VPC Peering and Transit Gateway\n\nConnecting multiple VPCs and on-premises networks is a fundamental enterprise networking requirement.\n\n**VPC Peering:**\n- Private connectivity between two VPCs using AWS backbone (no internet traversal)\n- Supports same-region, cross-region, and cross-account peering\n- Non-transitive: if VPC-A peers with VPC-B and VPC-B peers with VPC-C, A cannot reach C through B\n- CIDR blocks must not overlap\n- Each peering connection requires route table updates in both VPCs\n- No single point of failure, no bandwidth bottleneck\n- Best for: small number of VPCs needing direct connectivity (full mesh becomes complex beyond 4-5 VPCs)\n\n**Transit Gateway (TGW):**\n- Regional network hub connecting multiple VPCs, VPN connections, and Direct Connect gateways\n- Hub-and-spoke model: each VPC connects to the TGW, which handles routing between them\n- Transitive routing: VPC-A can reach VPC-C through the TGW\n- Route tables on the TGW control which attachments can communicate\n- Supports inter-region peering between Transit Gateways\n- Scales to thousands of VPCs\n- Best for: complex multi-VPC architectures, centralized egress, shared services VPCs\n\n**Transit Gateway use cases:**\n- Centralized internet egress: all VPCs route outbound traffic through a shared egress VPC\n- Shared services: a central VPC with DNS, monitoring, and security tools accessible by all spoke VPCs\n- Network segmentation: use TGW route tables to isolate production from development VPCs\n- Hybrid connectivity: connect on-premises networks via VPN or Direct Connect to multiple VPCs through TGW\n\n**VPC Peering vs. Transit Gateway:**\n- Peering: no hop, lowest latency, no additional cost (data transfer only), non-transitive\n- TGW: centralized management, transitive routing, hourly + per-GB charges, slight additional latency\n- Small scale (2-5 VPCs): peering is simpler and cheaper\n- Large scale (10+ VPCs) or complex routing: TGW is operationally necessary"
  ],

  interviewQA: [
    {
      q: "Design a VPC architecture for a three-tier web application with high availability.",
      a: "I would create a VPC with a /16 CIDR (e.g., 10.0.0.0/16) spanning at least 2 AZs. Three subnet tiers per AZ: (1) Public subnets for the ALB with routes to an Internet Gateway. (2) Private application subnets for ECS/EC2 instances, routed through NAT Gateways (one per AZ for HA). (3) Private data subnets for RDS Multi-AZ and ElastiCache with no internet route. Security groups: ALB SG allows 443 from 0.0.0.0/0; App SG allows traffic only from the ALB SG; DB SG allows port 3306/5432 only from the App SG. VPC endpoints for S3 and DynamoDB to avoid NAT costs. VPC Flow Logs enabled for security monitoring.",
      followUps: ["Why use separate subnets for each tier?", "How do you handle DNS for internal services?"]
    },
    {
      q: "Explain the difference between Security Groups and NACLs.",
      a: "Security Groups are stateful firewalls at the instance level — allow inbound, and return traffic is automatically allowed. They only have allow rules; unmatched traffic is denied. NACLs are stateless firewalls at the subnet level — you must define both inbound and outbound rules, including ephemeral port ranges for return traffic. NACLs support deny rules and are evaluated by rule number (first match wins). In practice, Security Groups are the primary control because they are simpler and more flexible (can reference other SGs). NACLs are used for subnet-wide deny rules, like blocking known malicious IP ranges, which Security Groups cannot do.",
      followUps: ["What are ephemeral ports and why do NACLs need them?", "Can you block a specific IP with a Security Group?"]
    },
    {
      q: "When would you choose Transit Gateway over VPC Peering?",
      a: "Transit Gateway when: (1) You have more than 4-5 VPCs — full mesh peering becomes unmanageable (N*(N-1)/2 connections). (2) You need transitive routing — peering is non-transitive. (3) You want centralized network management with route tables controlling inter-VPC traffic. (4) You need centralized egress or shared services accessible to all VPCs. (5) You're connecting on-premises networks to multiple VPCs. VPC Peering when: (1) Connecting 2-3 VPCs with simple requirements. (2) You need lowest possible latency (no hop through TGW). (3) Cost sensitivity — peering has no hourly charge. The trade-off is simplicity and cost (peering) vs. scalability and centralized management (TGW).",
      followUps: ["How does Transit Gateway handle routing between VPCs?", "What is the cost model for Transit Gateway?"]
    },
    {
      q: "How would you optimize CloudFront for a dynamic API backend?",
      a: "For dynamic content that cannot be cached, CloudFront still provides value: (1) TLS termination at the edge reduces latency for the SSL handshake. (2) Connection keep-alive between CloudFront and the origin reduces connection setup overhead. (3) AWS backbone routing is faster than public internet paths. Configuration: set TTL to 0 for API paths so CloudFront forwards every request but maintains persistent connections to the origin. Use cache policies to not cache based on Authorization headers. Enable origin shield to reduce origin load from multiple edge locations. Add CloudFront Functions for header manipulation or simple authentication checks at the edge."
    }
  ],

  mcqs: [
    {
      q: "What makes a subnet 'public' in AWS?",
      options: [
        "It has a public IP address range",
        "Its route table has a route to an Internet Gateway",
        "It has a Network ACL allowing all traffic",
        "It is in the us-east-1 region"
      ],
      answerIndex: 1,
      explanation: "A subnet is public when its route table contains a route for 0.0.0.0/0 pointing to an Internet Gateway. This, combined with instances having public IPs, enables direct internet access."
    },
    {
      q: "Security Groups are stateful. This means:",
      options: [
        "Rules persist across instance reboots",
        "Return traffic is automatically allowed regardless of outbound rules",
        "Rules are applied in order of priority",
        "They maintain a log of all connections"
      ],
      answerIndex: 1,
      explanation: "Stateful means if you allow inbound traffic on a port, the response traffic is automatically allowed out without needing an explicit outbound rule. NACLs are stateless and require both directions."
    },
    {
      q: "VPC Peering is non-transitive. This means:",
      options: [
        "It cannot cross AWS regions",
        "If A peers with B and B peers with C, A cannot reach C through B",
        "Traffic is encrypted in transit",
        "It requires a Transit Gateway"
      ],
      answerIndex: 1,
      explanation: "Non-transitive means peering does not chain. VPC-A peered with VPC-B and VPC-B peered with VPC-C does not give A connectivity to C. Each pair must be explicitly peered, or use Transit Gateway for transitive routing."
    },
    {
      q: "Which Route 53 routing policy would you use for active-passive failover?",
      options: ["Weighted", "Latency-based", "Failover", "Geolocation"],
      answerIndex: 2,
      explanation: "Failover routing directs traffic to a primary resource and automatically switches to a secondary resource when the primary fails health checks. It is designed specifically for active-passive HA."
    },
    {
      q: "What is the purpose of a VPC Gateway Endpoint?",
      options: [
        "Connect to on-premises networks",
        "Access S3 and DynamoDB without traversing the internet or NAT Gateway",
        "Provide internet access to private subnets",
        "Enable VPC peering across regions"
      ],
      answerIndex: 1,
      explanation: "Gateway endpoints provide free, private access to S3 and DynamoDB via route table entries, keeping traffic on the AWS network and avoiding NAT Gateway data processing charges."
    }
  ],

  flashcards: [
    { front: "VPC CIDR Planning", back: "Choose non-overlapping ranges if VPCs will peer. Common: 10.0.0.0/16. AWS reserves 5 IPs per subnet. Secondary CIDRs can be added later. Plan for growth." },
    { front: "Public vs. Private Subnet", back: "Public: route table entry 0.0.0.0/0 -> IGW, instances can have public IPs. Private: no IGW route, uses NAT Gateway for outbound internet. Databases always go in private subnets." },
    { front: "NAT Gateway", back: "Managed NAT for private subnet outbound internet access. Deploy per AZ for HA. Hourly + per-GB charge. Use VPC endpoints for AWS services to reduce NAT costs." },
    { front: "Security Groups vs. NACLs", back: "SG: stateful, instance-level, allow-only rules, reference other SGs. NACL: stateless, subnet-level, allow+deny rules, numbered priority, need ephemeral port rules." },
    { front: "Route 53 Alias Record", back: "AWS-specific DNS record that maps to AWS resources (ALB, CloudFront, S3) at zone apex. Free for queries to AWS resources. Preferred over CNAME for AWS targets." },
    { front: "CloudFront Origin Access Control", back: "Restricts S3 bucket access so content is only served through CloudFront, preventing direct S3 URL access. Replaces the older Origin Access Identity (OAI)." },
    { front: "Transit Gateway", back: "Regional hub connecting multiple VPCs and on-premises networks. Supports transitive routing, centralized management, and network segmentation via route tables." },
    { front: "VPC Endpoints", back: "Gateway endpoints (free): S3 and DynamoDB. Interface endpoints (PrivateLink): 100+ services via private IP in your subnet. Both keep traffic off the public internet." }
  ],

  glossary: [
    { term: "VPC", definition: "Virtual Private Cloud — logically isolated virtual network in AWS with configurable IP ranges, subnets, routing, and security controls." },
    { term: "Subnet", definition: "A range of IP addresses within a VPC, existing in a single AZ. Public subnets route to the internet; private subnets do not." },
    { term: "Security Group", definition: "Stateful virtual firewall at the instance/ENI level with allow-only rules. Return traffic is automatically permitted." },
    { term: "NACL", definition: "Network Access Control List — stateless firewall at the subnet level supporting both allow and deny rules, evaluated by rule number." },
    { term: "Route 53", definition: "AWS managed DNS service supporting public/private zones, health checks, and multiple routing policies for traffic management." },
    { term: "CloudFront", definition: "AWS global CDN with 450+ edge locations for low-latency content delivery, DDoS protection, and edge compute capabilities." },
    { term: "Transit Gateway", definition: "Regional network hub connecting multiple VPCs, VPN, and Direct Connect through a central routing point with transitive routing." },
    { term: "NAT Gateway", definition: "Managed service enabling outbound internet access for private subnet resources without allowing inbound connections from the internet." }
  ]
};
