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

  followUps: [
    "Why does a private subnet still need a NAT gateway, and what does it cost?",
    "Security group or NACL — what's the practical difference?",
    "How does a VPC endpoint change both cost and security?",
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

  deepDive: [
    "## The Anatomy of VPC Packet Flow\n\nUnderstanding how a packet traverses an AWS VPC is **critical** for debugging connectivity issues and designing secure architectures. When an EC2 instance in a *private subnet* initiates an outbound HTTP request, the packet first passes through the instance's **Security Group** (stateful evaluation — only outbound rules checked). It then hits the **subnet-level NACL** (stateless — outbound rules evaluated by *rule number*, first match wins). The packet enters the **route table** associated with that subnet, which determines the next hop — typically a `NAT Gateway` in a public subnet for internet-bound traffic. The NAT Gateway performs *source address translation*, replacing the instance's private IP with its own Elastic IP, then forwards the packet through the **Internet Gateway** to the public internet. Return traffic follows the reverse path: IGW → NAT Gateway (which maintains the connection state) → subnet NACL (inbound rules now) → Security Group (automatically allowed because SGs are stateful). This multi-layer traversal explains why **VPC Flow Logs** are invaluable — they capture accepted and rejected packets at the ENI level, helping you pinpoint *exactly* where a connection is being dropped.\n\nA common pitfall is forgetting that NACLs require **ephemeral port rules**. When your application connects to an external API on port `443`, the return traffic comes back on a *random high port* (1024–65535). If your NACL's inbound rules don't allow this range, the response is silently dropped even though the Security Group would have allowed it. This is the most frequent cause of \"it works with Security Groups but breaks when I add custom NACLs\" scenarios.",

    "## DNS Resolution and Hybrid Networking Deep Dive\n\nRoute 53 **Resolver** is the often-overlooked component that makes DNS work in complex hybrid environments. Every VPC gets a *default DNS resolver* at the VPC CIDR base +2 address (e.g., `10.0.0.2` for a `10.0.0.0/16` VPC). This resolver handles queries for **private hosted zones**, public DNS, and AWS service endpoints. In hybrid architectures connecting AWS to on-premises data centers, you need **Route 53 Resolver Endpoints**: *inbound endpoints* allow on-premises DNS servers to resolve AWS private hosted zone records, and *outbound endpoints* let AWS resources resolve on-premises domain names by forwarding queries to corporate DNS servers via **Resolver Rules**.\n\nThe interplay between `enableDnsSupport` and `enableDnsHostnames` VPC settings is subtle but important. `enableDnsSupport` activates the VPC DNS resolver itself — without it, *no DNS resolution works* in the VPC. `enableDnsHostnames` assigns public DNS hostnames to instances with public IPs (e.g., `ec2-54-xx-xx-xx.compute-1.amazonaws.com`). Both must be **true** for VPC *interface endpoints* to work correctly, as they rely on private hosted zones to override public service endpoints with private IPs.",

    "## Cost Optimization in AWS Networking\n\n**Data transfer costs** are the hidden tax in AWS networking and frequently the *largest surprise* on the monthly bill. Cross-AZ traffic costs **$0.01/GB each way** ($0.02 round-trip), which adds up quickly for chatty microservices spanning multiple AZs. Cross-region transfer is even more expensive at **$0.02–$0.09/GB** depending on regions. NAT Gateway data processing charges of **$0.045/GB** compound this — an application pulling 10TB/month of S3 data through a NAT Gateway pays $450/month in processing fees alone, which could be *completely eliminated* with a free **Gateway VPC Endpoint** for S3.\n\nKey cost optimization strategies: (1) Use `VPC endpoints` for all supported AWS services — Gateway endpoints for S3/DynamoDB are free, and Interface endpoints cost ~$7/month per AZ but eliminate NAT processing charges. (2) Minimize cross-AZ traffic by deploying **AZ-aware** service discovery and enabling *topology-aware routing* in EKS. (3) Use **S3 Transfer Acceleration** only when the speed improvement justifies the premium — it costs $0.04–$0.08/GB on top of standard transfer. (4) Monitor with **VPC Flow Logs** exported to S3 (cheaper than CloudWatch), and analyze with *Athena* to identify top talkers and unexpected cross-AZ patterns. (5) Consider **AWS PrivateLink** for service-to-service communication across VPCs instead of peering or TGW when you only need to expose specific services — it avoids the per-GB TGW data processing charge of **$0.02/GB**."
  ],

  code: [
    {
      language: "yaml",
      caption: "CloudFormation template defining a complete VPC with public and private subnets, NAT Gateway, and route tables",
      source: `AWSTemplateFormatVersion: "2010-09-09"
Description: Production VPC with public/private subnets across 2 AZs

Resources:
  # --- VPC ---
  ProductionVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: production-vpc

  # --- Internet Gateway ---
  InternetGateway:
    Type: AWS::EC2::InternetGateway
  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref ProductionVPC
      InternetGatewayId: !Ref InternetGateway

  # --- Public Subnets ---
  PublicSubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ProductionVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs ""]
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: public-subnet-a

  PublicSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ProductionVPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs ""]
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: public-subnet-b

  # --- Private Subnets ---
  PrivateSubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ProductionVPC
      CidrBlock: 10.0.10.0/24
      AvailabilityZone: !Select [0, !GetAZs ""]
      Tags:
        - Key: Name
          Value: private-subnet-a

  PrivateSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ProductionVPC
      CidrBlock: 10.0.11.0/24
      AvailabilityZone: !Select [1, !GetAZs ""]
      Tags:
        - Key: Name
          Value: private-subnet-b

  # --- NAT Gateway (AZ-A) ---
  NatEIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc
  NatGateway:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NatEIP.AllocationId
      SubnetId: !Ref PublicSubnetA

  # --- Route Tables ---
  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref ProductionVPC
  PublicRoute:
    Type: AWS::EC2::Route
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PrivateRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref ProductionVPC
  PrivateRoute:
    Type: AWS::EC2::Route
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      NatGatewayId: !Ref NatGateway

  # --- S3 Gateway Endpoint (free, avoids NAT costs) ---
  S3Endpoint:
    Type: AWS::EC2::VPCEndpoint
    Properties:
      VpcId: !Ref ProductionVPC
      ServiceName: !Sub com.amazonaws.\${AWS::Region}.s3
      RouteTableIds:
        - !Ref PrivateRouteTable

Outputs:
  VpcId:
    Value: !Ref ProductionVPC
  PublicSubnets:
    Value: !Join [",", [!Ref PublicSubnetA, !Ref PublicSubnetB]]
  PrivateSubnets:
    Value: !Join [",", [!Ref PrivateSubnetA, !Ref PrivateSubnetB]]`
    },
    {
      language: "bash",
      caption: "AWS CLI commands for common VPC networking operations — security groups, NACLs, and Route 53",
      source: `#!/bin/bash
# ========================================
# Security Group Management
# ========================================

# Create a security group for a web application
aws ec2 create-security-group \\
  --group-name web-app-sg \\
  --description "Allow HTTPS inbound, restrict outbound" \\
  --vpc-id vpc-0abc123def456

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \\
  --group-id sg-0abc123 \\
  --protocol tcp \\
  --port 443 \\
  --cidr 0.0.0.0/0

# Allow app tier to accept traffic ONLY from the ALB security group
aws ec2 authorize-security-group-ingress \\
  --group-id sg-app-tier \\
  --protocol tcp \\
  --port 8080 \\
  --source-group sg-alb-tier

# ========================================
# NACL Rules (stateless — need both directions)
# ========================================

# Allow inbound HTTPS
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-0abc123 \\
  --rule-number 100 \\
  --protocol tcp \\
  --port-range From=443,To=443 \\
  --cidr-block 0.0.0.0/0 \\
  --rule-action allow \\
  --ingress

# Allow return traffic on ephemeral ports (CRITICAL for stateless NACLs)
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-0abc123 \\
  --rule-number 100 \\
  --protocol tcp \\
  --port-range From=1024,To=65535 \\
  --cidr-block 0.0.0.0/0 \\
  --rule-action allow \\
  --egress

# ========================================
# Route 53 — Weighted Routing for Canary Deployment
# ========================================

# Send 90% of traffic to the stable version
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234567890 \\
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "stable",
        "Weight": 90,
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "stable-alb-123.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# Send 10% to the canary version
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234567890 \\
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "SetIdentifier": "canary",
        "Weight": 10,
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "canary-alb-456.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# ========================================
# VPC Flow Logs — Enable and Query
# ========================================

# Enable VPC Flow Logs to S3 (cheaper than CloudWatch)
aws ec2 create-flow-logs \\
  --resource-type VPC \\
  --resource-ids vpc-0abc123def456 \\
  --traffic-type ALL \\
  --log-destination-type s3 \\
  --log-destination arn:aws:s3:::my-flow-logs-bucket/vpc-logs/`
    },
    {
      language: "json",
      caption: "CloudFront distribution configuration with S3 origin, OAC, caching policy, and WAF integration",
      source: `{
  "DistributionConfig": {
    "Origins": {
      "Items": [
        {
          "Id": "S3-static-assets",
          "DomainName": "my-app-assets.s3.us-east-1.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          },
          "OriginAccessControlId": "E2QWRUHEXAMPLE"
        },
        {
          "Id": "ALB-api-backend",
          "DomainName": "internal-api-alb-123.us-east-1.elb.amazonaws.com",
          "CustomOriginConfig": {
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "https-only",
            "OriginKeepaliveTimeout": 60,
            "OriginReadTimeout": 30
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-static-assets",
      "ViewerProtocolPolicy": "redirect-to-https",
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "Compress": true,
      "AllowedMethods": ["GET", "HEAD"]
    },
    "CacheBehaviors": {
      "Items": [
        {
          "PathPattern": "/api/*",
          "TargetOriginId": "ALB-api-backend",
          "ViewerProtocolPolicy": "https-only",
          "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
          "OriginRequestPolicyId": "216adef6-5c7f-47e4-b989-5492eafa07d3",
          "AllowedMethods": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
        }
      ]
    },
    "WebACLId": "arn:aws:wafv2:us-east-1:123456789012:global/webacl/my-web-acl/abc123",
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:123456789012:certificate/abc-123",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "DefaultRootObject": "index.html",
    "Enabled": true,
    "Comment": "Production CDN with S3 static + ALB API origins"
  }
}`
    }
  ],

  diagrams: [
    {
      title: "Three-Tier VPC Architecture",
      kind: "architecture",
      caption: "Production VPC layout with public, application, and data subnets across two Availability Zones, including IGW, NAT Gateway, and VPC endpoints",
      mermaid: `graph TB
  subgraph VPC["VPC 10.0.0.0/16"]
    IGW["Internet Gateway"]

    subgraph AZ1["Availability Zone A"]
      PubA["Public Subnet<br/>10.0.1.0/24<br/>ALB, NAT GW"]
      AppA["Private App Subnet<br/>10.0.10.0/24<br/>ECS / EC2"]
      DbA["Private Data Subnet<br/>10.0.20.0/24<br/>RDS Primary"]
    end

    subgraph AZ2["Availability Zone B"]
      PubB["Public Subnet<br/>10.0.2.0/24<br/>ALB"]
      AppB["Private App Subnet<br/>10.0.11.0/24<br/>ECS / EC2"]
      DbB["Private Data Subnet<br/>10.0.21.0/24<br/>RDS Standby"]
    end

    NAT["NAT Gateway"]
    S3EP["S3 Gateway Endpoint"]
  end

  Internet((Internet)) --> IGW
  IGW --> PubA
  IGW --> PubB
  PubA --> NAT
  NAT --> AppA
  NAT --> AppB
  AppA --> DbA
  AppB --> DbB
  AppA --> S3EP
  AppB --> S3EP
  DbA <-.-> DbB`
    },
    {
      title: "Packet Flow Through VPC Security Layers",
      kind: "flow",
      caption: "Step-by-step flow of an inbound HTTP request through IGW, NACL, Security Group, and back",
      mermaid: `flowchart LR
  A["Client<br/>Request"] --> B["Internet<br/>Gateway"]
  B --> C{"Subnet<br/>NACL<br/>Inbound"}
  C -->|Allow| D{"Security<br/>Group<br/>Inbound"}
  C -->|Deny| X1["Dropped"]
  D -->|Allow| E["EC2<br/>Instance"]
  D -->|Deny| X2["Dropped"]
  E --> F["Response"]
  F --> G{"Security<br/>Group<br/>Outbound<br/>(auto-allowed)"}
  G --> H{"Subnet<br/>NACL<br/>Outbound"}
  H -->|Allow| I["Internet<br/>Gateway"]
  H -->|Deny| X3["Dropped"]
  I --> J["Client<br/>Response"]

  style X1 fill:#ff6b6b,color:#fff
  style X2 fill:#ff6b6b,color:#fff
  style X3 fill:#ff6b6b,color:#fff
  style E fill:#51cf66,color:#fff`
    },
    {
      title: "Transit Gateway Hub-and-Spoke Topology",
      kind: "network",
      caption: "Transit Gateway connecting multiple VPCs, shared services, and on-premises network through a central hub",
      mermaid: `graph TB
  TGW["Transit Gateway<br/>(Regional Hub)"]

  subgraph Prod["Production"]
    VPC1["Prod VPC A<br/>10.1.0.0/16"]
    VPC2["Prod VPC B<br/>10.2.0.0/16"]
  end

  subgraph Dev["Development"]
    VPC3["Dev VPC<br/>10.3.0.0/16"]
    VPC4["Staging VPC<br/>10.4.0.0/16"]
  end

  subgraph Shared["Shared Services"]
    VPC5["DNS / Monitoring<br/>10.5.0.0/16"]
    VPC6["Egress VPC<br/>10.6.0.0/16"]
  end

  OnPrem["On-Premises<br/>Data Center"]
  VPN["Site-to-Site VPN /<br/>Direct Connect"]

  VPC1 --> TGW
  VPC2 --> TGW
  VPC3 --> TGW
  VPC4 --> TGW
  VPC5 --> TGW
  VPC6 --> TGW
  OnPrem --> VPN --> TGW

  TGW -.->|"Prod Route Table"| Prod
  TGW -.->|"Dev Route Table"| Dev
  TGW -.->|"Shared Route Table"| Shared`
    },
    {
      title: "Route 53 DNS Resolution Flow",
      kind: "sequence",
      caption: "Sequence of DNS resolution with Route 53 failover routing policy and health checks",
      mermaid: `sequenceDiagram
  participant Client
  participant R53 as Route 53
  participant HC as Health Check
  participant Primary as Primary (us-east-1)
  participant Secondary as Secondary (eu-west-1)

  Client->>R53: DNS query: api.example.com
  R53->>HC: Check primary health
  HC->>Primary: HTTP GET /health
  Primary-->>HC: 200 OK
  HC-->>R53: Healthy
  R53-->>Client: A record: Primary IP

  Note over Client,Secondary: Later — primary fails

  Client->>R53: DNS query: api.example.com
  R53->>HC: Check primary health
  HC->>Primary: HTTP GET /health
  Primary--xHC: Timeout / 500
  HC-->>R53: Unhealthy (3 consecutive failures)
  R53-->>Client: A record: Secondary IP
  Client->>Secondary: Request served by DR region`
    }
  ],

  animations: [
    {
      title: "A request from a private subnet to the internet",
      steps: [
        {
          label: "Instance in a private subnet",
          detail: "No public IP, and the route table has no internet gateway route — nothing inbound can reach it.",
        },
        {
          label: "Outbound needed",
          detail: "It has to call an external API.",
        },
        {
          label: "Route to NAT",
          detail: "The private subnet's route table sends 0.0.0.0/0 to a NAT gateway in a public subnet.",
        },
        {
          label: "NAT translates",
          detail: "The NAT gateway rewrites the source to its own public IP and forwards via the internet gateway.",
        },
        {
          label: "Return path",
          detail: "Responses come back to the NAT, which maps them to the originating instance. Unsolicited inbound has nowhere to go.",
        },
        {
          label: "The bill",
          detail: "NAT gateways charge per hour and per GB processed. A VPC endpoint keeps AWS-service traffic off the NAT entirely.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Security Group", "Network ACL", "AWS WAF"],
    rows: [
      ["**Scope**", "Instance / ENI level", "Subnet level", "CloudFront / ALB / API Gateway"],
      ["**Statefulness**", "*Stateful* — return traffic auto-allowed", "*Stateless* — must allow both directions", "*Stateless* — rules evaluated per request"],
      ["**Rule type**", "Allow only (implicit deny)", "Allow *and* deny", "Allow, block, count, CAPTCHA"],
      ["**Evaluation**", "All rules evaluated (union)", "Numbered order, *first match wins*", "Priority order, first match wins"],
      ["**Use case**", "Primary instance-level firewall", "Subnet-wide deny rules, defense-in-depth", "Application-layer protection (SQL injection, XSS, rate limiting)"],
      ["**IP blocking**", "Cannot explicitly deny an IP", "Can deny specific IP ranges", "Can deny IPs, geo-block countries, rate-limit"],
      ["**Protocol support**", "TCP, UDP, ICMP", "TCP, UDP, ICMP, protocol number", "HTTP/HTTPS only (Layer 7)"],
      ["**Cost**", "Free", "Free", "Per rule + per million requests"]
    ]
  },

  exercises: [
    "**Design a Multi-AZ VPC:** Create a VPC with CIDR `10.0.0.0/16` containing 3 subnet tiers (public, app, data) across 2 AZs. Configure route tables so public subnets route through an IGW, app subnets through a NAT Gateway, and data subnets have *no internet route*. Add a Gateway VPC Endpoint for S3. Verify connectivity by launching an EC2 instance in each tier and testing `curl` to the internet and to S3.",
    "**Security Group Chain:** Set up a three-tier application with an ALB, an application server, and an RDS instance. Configure Security Groups so the ALB accepts `443` from `0.0.0.0/0`, the app server accepts `8080` *only from the ALB SG*, and the database accepts `5432` *only from the app SG*. Verify that you **cannot** connect directly to the database from the ALB subnet.",
    "**Route 53 Failover:** Create a *failover routing policy* in Route 53 with two ALBs in different regions. Configure health checks on the primary. Simulate a failure (stop the primary instances) and verify that DNS resolves to the secondary within the health check threshold. Measure the **actual failover time** including DNS TTL propagation.",
    "**CloudFront with Multiple Origins:** Deploy a CloudFront distribution with two origins: an S3 bucket for `/static/*` and an ALB for `/api/*`. Configure **Origin Access Control** so the S3 bucket rejects direct access. Set TTL to `86400` for static assets and `0` for API calls. Use `curl -I` to verify cache headers (`X-Cache: Hit from cloudfront`) for static content and `Miss` for API calls.",
    "**Transit Gateway Network Segmentation:** Set up a Transit Gateway with 3 VPCs: *production*, *development*, and *shared-services*. Configure TGW route tables so production and development **cannot** communicate with each other, but both can reach shared-services. Verify with `ping` and `traceroute` that cross-environment traffic is blocked while shared-services access works."
  ],

  cheatSheet: [
    "**VPC Sizing:** Use `/16` for production (65,536 IPs). AWS reserves **5 IPs per subnet** (network, VPC router, DNS, future, broadcast). A `/24` subnet gives 251 usable IPs, not 256.",
    "**Public vs Private Subnet:** A subnet is *public* only if its route table has `0.0.0.0/0 → IGW`. Simply having a public IP is **not enough** — the route must exist.",
    "**SG vs NACL Quick Rule:** Security Groups = *allow list at instance level* (stateful). NACLs = *allow + deny at subnet level* (stateless, needs ephemeral port `1024-65535` rules for return traffic).",
    "**NAT Gateway Costs:** $0.045/hr + **$0.045/GB** processed. Use **VPC Gateway Endpoints** (free) for S3 and DynamoDB to avoid NAT charges on AWS service traffic.",
    "**Route 53 Alias vs CNAME:** Use **Alias** for AWS resources (ALB, CloudFront, S3) — works at zone apex, free queries. CNAME cannot be used at zone apex and incurs query charges.",
    "**Transit Gateway vs Peering:** Peering = *no hop, lowest latency, no hourly cost*, non-transitive. TGW = *centralized hub, transitive routing*, $0.05/hr per attachment + $0.02/GB data processing."
  ],

  revisionNotes: [
    "**VPC Fundamentals:** A VPC spans a *region* (all AZs), while subnets exist in a *single AZ*. Every VPC has a **main route table** (default for unassociated subnets) and a **default Security Group** (allows all traffic within the SG, denies all else inbound). Always create *custom* route tables and SGs rather than modifying defaults.",
    "**Security Layers Stack:** Traffic passes through **NACL → Security Group** on the way in, and **Security Group → NACL** on the way out. Remember: SGs are *stateful* (no return-traffic rules needed), NACLs are *stateless* (you **must** allow ephemeral ports 1024–65535 for return traffic). For blocking a specific IP, you *must* use a NACL deny rule — Security Groups have no deny mechanism.",
    "**DNS and Content Delivery:** Route 53 **Alias records** are the preferred way to point to AWS resources — they work at the *zone apex* (unlike CNAME), are free for AWS-target queries, and support health checks. CloudFront's key optimization: even for *uncacheable dynamic content*, it provides TLS termination at the edge, persistent origin connections, and AWS backbone routing, all of which reduce latency.",
    "**Connectivity Patterns at Scale:** For 2–5 VPCs, *VPC Peering* is simpler and cheaper (no hourly charge, no data processing fee). For 5+ VPCs or *any transitive routing need*, use **Transit Gateway** — it acts as a regional hub with route table-based segmentation. Key TGW cost: **$0.05/hr per attachment** + $0.02/GB processed. Use TGW route tables to enforce *network segmentation* (e.g., isolate prod from dev while both reach shared services).",
    "**Cost Awareness:** The three biggest networking cost traps are: (1) **NAT Gateway data processing** — use VPC endpoints for AWS services. (2) **Cross-AZ data transfer** at $0.01/GB each way — deploy AZ-aware services and co-locate tightly coupled components. (3) **CloudFront invalidations** — use *versioned file names* (`app.v2.js`) instead of invalidating paths, which costs $0.005 per path after the first 1,000/month."
  ],

  resources: [
    {
      label: "AWS VPC documentation",
      kind: "docs",
    },
    {
      label: "AWS Well-Architected Framework",
      kind: "docs",
    },
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
