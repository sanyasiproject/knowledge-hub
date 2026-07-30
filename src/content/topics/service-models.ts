import type { TopicContent } from "../types";

export const serviceModels: TopicContent = {
  quickSummary: [
    "Cloud service models define how much of the technology stack the provider manages vs. what you manage: Infrastructure as a Service (IaaS) gives you VMs and networks, Platform as a Service (PaaS) adds the runtime/middleware, and Software as a Service (SaaS) delivers the entire application.",
    "IaaS (EC2, Azure VMs, GCE) provides maximum control — you manage from the OS up. PaaS (Heroku, App Engine, Azure App Service) manages the OS, runtime, and scaling — you just deploy code. SaaS (Gmail, Salesforce, Slack) manages everything — you just use the product.",
    "The shared responsibility model shifts security and operational burden: in IaaS you patch your OS; in PaaS the provider patches it; in SaaS you only manage user access and data. Choosing the right model trades control for operational simplicity.",
    "Function as a Service (FaaS / serverless) like AWS Lambda extends PaaS further — no servers to provision, pay-per-invocation, auto-scaling to zero — but introduces cold starts and execution time limits."
  ],

  detailed: [
    "## Infrastructure as a Service (IaaS)\n\nIaaS provides virtualized computing resources over the internet. The provider manages the physical data center, networking hardware, servers, and hypervisor layer. You manage the operating system, middleware, runtime, applications, and data.\n\n**Key characteristics:**\n- Full control over the compute environment (OS choice, kernel tuning, custom drivers)\n- You are responsible for patching, security hardening, backup, and disaster recovery at the OS level\n- Maximum flexibility but highest operational burden\n- Common pricing: per-hour or per-second compute time + storage + network egress\n\n**When to use IaaS:**\n- Legacy applications that require specific OS configurations\n- Workloads needing GPU passthrough, custom kernels, or specialized hardware\n- Compliance requirements that mandate full OS-level control\n- Lift-and-shift migrations from on-premises\n\n**Examples:** AWS EC2, Azure Virtual Machines, Google Compute Engine, DigitalOcean Droplets.",

    "## Platform as a Service (PaaS)\n\nPaaS abstracts away the infrastructure layer. The provider manages servers, networking, OS, and runtime — you deploy application code and configure scaling rules.\n\n**Key characteristics:**\n- Push code, platform handles provisioning, load balancing, health monitoring\n- Built-in support for common stacks (Node.js, Python, Java, .NET)\n- Managed databases, caching, and message queues often included\n- Less control over the underlying OS and network — can't install custom system packages easily\n- Auto-scaling and zero-downtime deployments built in\n\n**When to use PaaS:**\n- Greenfield web applications and APIs\n- Teams without dedicated DevOps/infrastructure engineers\n- Rapid prototyping where time-to-market matters more than fine-tuning\n- Microservices that follow 12-factor app principles\n\n**Examples:** Heroku, Google App Engine, Azure App Service, AWS Elastic Beanstalk, Railway, Render.",

    "## Software as a Service (SaaS)\n\nSaaS delivers fully functional applications over the internet. The provider manages everything — infrastructure, platform, application code, updates, security patches, and scaling.\n\n**Key characteristics:**\n- Accessed via browser or API — no installation, no maintenance\n- Subscription-based pricing (per-user, per-seat, usage-based tiers)\n- Multi-tenant architecture — one codebase serves all customers\n- Customization limited to configuration, integrations, and APIs\n- Provider handles availability, backups, compliance certifications\n\n**When to use SaaS:**\n- Standard business functions (email, CRM, project management, communication)\n- When building the capability in-house isn't a competitive advantage\n- When you need enterprise features (SSO, audit logs, compliance) out of the box\n\n**Examples:** Salesforce, Google Workspace, Slack, GitHub, Datadog.",

    "## Function as a Service (FaaS) & Serverless\n\nFaaS is sometimes called 'serverless' — you write individual functions triggered by events (HTTP requests, queue messages, file uploads). The provider handles all infrastructure, auto-scales from zero, and charges per invocation.\n\n**Key characteristics:**\n- No servers to provision or manage — truly zero-ops for compute\n- Pay only for actual execution time (often billed per 100ms)\n- Cold starts: first invocation after idle period has latency penalty (100ms–10s depending on runtime)\n- Execution limits: max duration (15 min on Lambda), memory limits, payload size\n- Stateless by design — state must be externalized to databases or caches\n\n**When to use FaaS:**\n- Event-driven workloads (image processing, webhooks, data transformation)\n- Irregular traffic patterns with long idle periods\n- Glue logic connecting cloud services\n- APIs with predictable, short execution times\n\n**Examples:** AWS Lambda, Azure Functions, Google Cloud Functions, Cloudflare Workers.",

    "## Choosing the Right Model\n\nThe decision depends on: (1) team skills and operational capacity, (2) control requirements, (3) cost structure preference, (4) compliance needs.\n\n**Control vs. Convenience spectrum:**\nIaaS → CaaS (Containers as a Service) → PaaS → FaaS → SaaS\n\n**Cost considerations:**\n- IaaS: predictable hourly costs, but hidden ops costs (engineer time for patching, monitoring, incident response)\n- PaaS: higher unit price but lower total cost of ownership for small teams\n- FaaS: cheapest at low scale, can become expensive at high sustained throughput\n- SaaS: subscription cost scales with users, not infrastructure\n\n**Many architectures combine models:** a SaaS product (your application) might be built on PaaS (Heroku for the web tier), using IaaS (EC2 for ML training), with FaaS (Lambda for image processing), and consuming other SaaS products (Stripe for payments, SendGrid for email)."
  ],

  deepDive: [
    "## Multi-Tenancy Architecture in SaaS\n\nSaaS platforms serve multiple customers (tenants) from shared infrastructure. The tenancy model has profound implications:\n\n**Shared everything:** One database, one schema, tenant_id column on every table. Cheapest to operate but hardest to isolate. A bad query from one tenant can impact all others (noisy neighbor). Data leaks from missing WHERE clauses are a critical risk.\n\n**Shared infrastructure, separate databases:** Each tenant gets their own database/schema. Better isolation, easier compliance (data residency), simpler backup/restore per tenant. But more infrastructure to manage and connection pooling becomes complex at scale.\n\n**Siloed (single-tenant):** Each tenant gets fully isolated infrastructure. Maximum isolation, simplest security model, easiest compliance. But highest cost and most operational complexity — deploying updates to thousands of isolated instances.\n\nMost SaaS companies start shared-everything and migrate high-value or compliance-sensitive tenants to dedicated infrastructure (hybrid model).",

    "## The XaaS Explosion\n\nBeyond IaaS/PaaS/SaaS, the 'as-a-Service' model has expanded:\n- **CaaS (Container as a Service):** Managed container orchestration (ECS, GKE, AKS) — between IaaS and PaaS\n- **DBaaS (Database as a Service):** Managed databases (RDS, Cloud SQL, PlanetScale)\n- **MaaS (Monitoring as a Service):** Datadog, New Relic, Grafana Cloud\n- **AIaaS:** Pre-trained models via API (OpenAI, Anthropic, Google AI)\n- **BaaS (Backend as a Service):** Firebase, Supabase — auth, database, storage, functions in one product\n\nThe trend is toward higher abstraction: teams want to write business logic, not manage infrastructure. The trade-off is always vendor lock-in, reduced control, and potential cost surprises at scale.",

    "## Shared Responsibility Deep Dive\n\nThe shared responsibility model defines who is accountable for each layer:\n\n| Layer | IaaS | PaaS | SaaS |\n|-------|------|------|------|\n| Data classification & governance | Customer | Customer | Customer |\n| Identity & access management | Customer | Customer | Shared |\n| Application security | Customer | Customer | Provider |\n| Network controls | Shared | Provider | Provider |\n| OS patching | Customer | Provider | Provider |\n| Physical security | Provider | Provider | Provider |\n\n**Common misconception:** 'The cloud is secure so I don't need to worry about security.' Reality: the cloud secures the infrastructure; you secure what you put in it. Most cloud breaches are due to customer misconfiguration (public S3 buckets, overly permissive IAM policies, exposed credentials), not provider failures.\n\nCompliance frameworks (SOC 2, HIPAA, PCI-DSS) require demonstrating security controls at every layer. Using a certified provider covers their layers, but you must certify yours independently."
  ],

  comparison: {
    columns: ["Aspect", "IaaS", "PaaS", "FaaS/Serverless", "SaaS"],
    rows: [
      ["You manage", "OS, middleware, apps, data", "Apps, data", "Function code, data", "Data, user access"],
      ["Provider manages", "Hardware, hypervisor, network", "Hardware through runtime", "Everything except code", "Everything"],
      ["Scaling", "Manual / auto-scaling groups", "Automatic", "Automatic to zero", "Provider handles"],
      ["Pricing", "Per-hour / per-second", "Per-instance / per-dyno", "Per-invocation / per-ms", "Per-user / per-seat"],
      ["Cold start", "Minutes (VM boot)", "Seconds (container start)", "100ms–10s", "N/A"],
      ["Vendor lock-in", "Low (VMs are portable)", "Medium (platform APIs)", "High (event model, limits)", "Very high"],
      ["Control", "Maximum", "Medium", "Low", "Minimal"],
      ["Ops burden", "High", "Medium", "Low", "None"],
      ["Examples", "EC2, Azure VMs, GCE", "Heroku, App Engine", "Lambda, Cloud Functions", "Gmail, Salesforce"]
    ]
  },

  interviewQA: [
    {
      q: "What are the three main cloud service models, and how do they differ?",
      a: "IaaS provides virtualized infrastructure (VMs, storage, networking) — you manage from the OS up. PaaS provides a managed platform — you deploy code, the provider manages the OS and runtime. SaaS delivers complete applications — you just use the product. The key difference is how much of the stack each party manages. Moving from IaaS to SaaS trades control for convenience and reduced operational burden.",
      followUps: ["Where does container-as-a-service fit?", "How does serverless relate to PaaS?"]
    },
    {
      q: "How would you decide between IaaS and PaaS for a new project?",
      a: "I'd consider: (1) Does the app need custom OS-level configuration? If yes, IaaS. (2) Does the team have infrastructure expertise? If not, PaaS reduces risk. (3) Is the app 12-factor compliant? PaaS works best with stateless, horizontally scalable apps. (4) Are there compliance requirements mandating OS-level audit? That might force IaaS. (5) Cost model — PaaS has higher unit prices but lower total cost of ownership for small teams since it eliminates ops work.",
      followUps: ["What are the 12-factor app principles?", "How do you handle PaaS vendor lock-in?"]
    },
    {
      q: "Explain the shared responsibility model in cloud computing.",
      a: "The shared responsibility model defines who is responsible for security at each layer of the stack. The provider always secures the physical infrastructure, hypervisor, and network fabric. In IaaS, the customer secures the OS, applications, and data. In PaaS, the provider additionally secures the OS and runtime. In SaaS, the provider secures almost everything — the customer manages identity/access and data classification. The key insight is that using a secure cloud doesn't automatically make your application secure — most breaches are due to customer misconfiguration.",
      followUps: ["What are common misconfigurations that lead to breaches?"]
    },
    {
      q: "What are the disadvantages of serverless/FaaS?",
      a: "Cold starts add latency on first invocation after idle (100ms to 10s depending on runtime and package size). Execution time limits (15 min on Lambda) prevent long-running tasks. Debugging and local development are harder — you can't easily replicate the cloud environment. Vendor lock-in is high because event sources and deployment models differ between providers. Cost becomes unpredictable at high sustained throughput — a constantly-invoked Lambda can be more expensive than a dedicated instance. Statelessness means all state must be externalized, adding complexity and latency."
    }
  ],

  mcqs: [
    {
      q: "In which service model does the customer manage the operating system?",
      options: ["SaaS", "PaaS", "IaaS", "All of the above"],
      answerIndex: 2,
      explanation: "In IaaS, the provider manages hardware and hypervisor; the customer manages from the OS upward. PaaS and SaaS abstract the OS away."
    },
    {
      q: "Which is NOT a characteristic of PaaS?",
      options: ["Auto-scaling built in", "Full control over OS kernel", "Managed runtime environment", "Push-to-deploy workflows"],
      answerIndex: 1,
      explanation: "PaaS abstracts the OS — you don't get kernel-level access. If you need custom kernel modules or OS tuning, you need IaaS."
    },
    {
      q: "A cold start in serverless refers to:",
      options: ["The time to boot a virtual machine", "Latency from initializing a new function instance after idle", "The time to deploy new code", "Network latency between regions"],
      answerIndex: 1,
      explanation: "Cold start is the delay when a serverless platform must create a new execution environment for a function that hasn't been invoked recently."
    },
    {
      q: "Which deployment model combines on-premises and cloud resources?",
      options: ["Public cloud", "Private cloud", "Hybrid cloud", "Community cloud"],
      answerIndex: 2,
      explanation: "Hybrid cloud combines on-premises (or private cloud) infrastructure with public cloud services, allowing data and applications to move between them."
    }
  ],

  flashcards: [
    { front: "IaaS", back: "Infrastructure as a Service — provider manages hardware/hypervisor; customer manages OS, middleware, apps, and data. Examples: EC2, Azure VMs, GCE." },
    { front: "PaaS", back: "Platform as a Service — provider manages through runtime; customer deploys code and manages data. Examples: Heroku, App Engine, Azure App Service." },
    { front: "SaaS", back: "Software as a Service — provider manages everything; customer uses the application and manages user access/data. Examples: Gmail, Salesforce, Slack." },
    { front: "FaaS / Serverless", back: "Function as a Service — event-triggered functions, auto-scale to zero, pay-per-invocation. Examples: Lambda, Cloud Functions, Azure Functions." },
    { front: "Cold start (serverless)", back: "Latency penalty (100ms–10s) when a new function instance must be initialized after a period of inactivity." },
    { front: "Shared responsibility model", back: "Security framework defining which layers the cloud provider secures vs. which the customer must secure. Shifts upward from IaaS to SaaS." },
    { front: "Multi-tenancy", back: "Architecture where a single instance of software serves multiple customers (tenants), sharing infrastructure but isolating data." },
    { front: "Vendor lock-in", back: "The cost and difficulty of migrating away from a cloud provider. Increases from IaaS (portable VMs) to FaaS/SaaS (proprietary APIs and event models)." }
  ],

  revisionNotes: [
    "IaaS = you manage OS and above; PaaS = you manage apps and data; SaaS = you manage users and data only",
    "Shared responsibility: provider always handles physical security; customer always handles data classification",
    "FaaS cold starts: JVM-based runtimes are slowest (seconds); interpreted languages (Python, Node) are fastest (100ms)",
    "PaaS is ideal for 12-factor apps: stateless, config via env vars, disposable processes",
    "Most cloud breaches are customer misconfiguration, not provider failures",
    "Cost model: IaaS has hidden ops costs; PaaS/FaaS have higher unit prices but lower TCO for small teams",
    "Vendor lock-in increases: IaaS < CaaS < PaaS < FaaS < SaaS",
    "Multi-tenancy models: shared everything (cheapest) → shared infra/separate DB → siloed (most isolated)"
  ],

  cheatSheet: [
    "IaaS: You get a VM, you manage everything from the OS up",
    "PaaS: You push code, platform handles the rest",
    "FaaS: You write a function, platform runs it on demand",
    "SaaS: You use the product, provider runs everything",
    "Shared responsibility: 'Security OF the cloud' (provider) vs 'Security IN the cloud' (customer)",
    "Cold start mitigation: provisioned concurrency, keep-alive pings, lighter runtimes",
    "12-factor app: stateless processes, config in env, backing services as attached resources",
    "Lock-in escape: use containers (CaaS) for portability between clouds"
  ],

  resources: [
    { label: "NIST Cloud Computing Definition", kind: "docs", note: "The authoritative definition of cloud service and deployment models" },
    { label: "AWS Shared Responsibility Model", kind: "docs", note: "Visual guide to who manages what on AWS" },
    { label: "The 12-Factor App", kind: "article", note: "Methodology for building cloud-native applications" },
    { label: "Cloud Computing: Concepts, Technology & Architecture (Erl)", kind: "book", note: "Comprehensive textbook on cloud computing" },
    { label: "Serverless Architectures on AWS (Sbarski)", kind: "book", note: "Practical guide to building with Lambda and friends" }
  ],

  glossary: [
    { term: "IaaS", definition: "Infrastructure as a Service — cloud model providing virtualized computing resources (VMs, storage, networking) on demand." },
    { term: "PaaS", definition: "Platform as a Service — cloud model providing a managed environment for deploying applications without managing infrastructure." },
    { term: "SaaS", definition: "Software as a Service — cloud model delivering fully managed applications accessible via browser or API." },
    { term: "FaaS", definition: "Function as a Service — event-driven compute model where the provider runs individual functions on demand, scaling automatically." },
    { term: "Multi-tenancy", definition: "Architecture pattern where a single software instance serves multiple customers, sharing resources while isolating data." },
    { term: "Cold start", definition: "The initialization delay when a serverless function is invoked after being idle, requiring a new execution environment." },
    { term: "Shared responsibility", definition: "Security model defining which cloud stack layers the provider secures versus which the customer must secure." },
    { term: "Vendor lock-in", definition: "The difficulty and cost of migrating from one cloud provider to another due to proprietary APIs, services, and data formats." }
  ]
};
