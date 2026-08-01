import type { TopicContent } from "../types";

export const azureEntra: TopicContent = {
  quickSummary: [
    "Microsoft Entra ID (formerly Azure Active Directory) is a cloud-based identity and access management service that provides authentication via protocols like OAuth 2.0, OpenID Connect, and SAML, and serves as the identity backbone for Microsoft 365, Azure, and thousands of third-party SaaS applications.",
    "Role-Based Access Control (RBAC) in Azure governs who can do what on which resources by assigning roles (Owner, Contributor, Reader, or custom roles) to security principals (users, groups, service principals, managed identities) at a specific scope (management group, subscription, resource group, or resource).",
    "Managed identities eliminate the need for credentials in code by providing Azure resources with an automatically managed identity in Entra ID, available as system-assigned (tied to a single resource's lifecycle) or user-assigned (independent lifecycle, shareable across resources).",
    "Conditional Access policies are Entra ID's zero-trust enforcement engine, evaluating signals like user identity, device state, location, application, and risk level to make real-time access decisions: allow, block, or require additional verification such as MFA.",
  ],
  detailed: [
    "## Microsoft Entra ID Architecture\n\nEntra ID is a multi-tenant, cloud-native identity provider. Each organization gets a tenant — an isolated instance of the Entra ID directory. A tenant contains users, groups, app registrations, service principals, and policies. Unlike on-premises Active Directory, Entra ID is flat (no Organizational Units or forests) and uses REST APIs (Microsoft Graph) instead of LDAP. Authentication uses modern protocols: OAuth 2.0 for authorization, OpenID Connect (OIDC) for authentication, and SAML 2.0 for federated single sign-on with legacy apps. Entra ID issues tokens (access tokens, ID tokens, refresh tokens) that clients present to resource APIs. Token lifetimes and refresh behavior are configured through token lifetime policies or Continuous Access Evaluation (CAE), which enables near-real-time revocation.",
    "## Role-Based Access Control (RBAC)\n\nAzure RBAC is the authorization system for Azure Resource Manager operations. A role assignment consists of three elements: a security principal (who), a role definition (what), and a scope (where). Built-in roles include Owner (full access including role assignment), Contributor (full access except role assignment), Reader (read-only), and hundreds of service-specific roles like Virtual Machine Contributor or Storage Blob Data Reader. Custom roles define granular permissions using action and data action lists with wildcards and exclusions. RBAC is additive — permissions from all role assignments are combined, and there are no explicit deny assignments (except via deny assignments feature in limited scenarios). Scope hierarchy flows from management group to subscription to resource group to resource; a role assigned at a higher scope is inherited by all child scopes.",
    "## Managed Identities\n\nManaged identities solve the credential management problem for Azure-to-Azure authentication. A system-assigned managed identity is created and tied to a specific Azure resource (a VM, App Service, Function App, etc.); when the resource is deleted, the identity is automatically cleaned up. A user-assigned managed identity is created as a standalone Azure resource with its own lifecycle and can be assigned to multiple Azure resources — useful when multiple resources need the same permissions. Under the hood, Azure provisions a service principal in Entra ID for the managed identity. The Azure Instance Metadata Service (IMDS) provides a local endpoint (169.254.169.254) where the resource can request tokens without any secrets. The Azure SDK's DefaultAzureCredential class automatically discovers and uses managed identities, making code portable between local development and production.",
    "## Conditional Access\n\nConditional Access policies implement zero-trust principles by evaluating conditions before granting access. Signals include: user/group membership, IP location (named locations, trusted IPs), device platform and compliance state (via Intune), application being accessed, sign-in risk and user risk (detected by Entra ID Protection using ML-based analysis of sign-in patterns), and client application type. Access controls specify the outcome: block access entirely, grant access (optionally requiring MFA, compliant device, hybrid Entra joined device, approved client app, or app protection policy), or grant with session controls (limited session lifetime, app-enforced restrictions, Conditional Access App Control via Defender for Cloud Apps). Policies are evaluated in real time for every authentication request and follow an additive model — if multiple policies apply, the most restrictive controls win.",
    "## Entra ID Protection and Privileged Identity Management\n\nEntra ID Protection uses machine learning to detect risky sign-ins (unfamiliar locations, impossible travel, anonymous IP, malware-linked IPs) and risky users (leaked credentials, anomalous behavior). Risk levels (low, medium, high) feed into Conditional Access policies for automated remediation — for example, requiring MFA for medium-risk sign-ins or forcing password resets for high-risk users. Privileged Identity Management (PIM) provides just-in-time (JIT) privileged access: instead of permanent role assignments, users activate roles on demand for a limited duration with approval workflows, MFA requirements, and audit logging. PIM supports both Entra ID roles (Global Administrator, Application Administrator) and Azure RBAC roles, enforcing the principle of least privilege for administrative access.",
    "## Hybrid Identity and Entra Connect\n\nMicrosoft Entra Connect (formerly Azure AD Connect) synchronizes on-premises Active Directory identities to Entra ID, enabling a unified identity across cloud and on-premises. Synchronization modes include Password Hash Sync (PHS — password hashes are synced to Entra ID for cloud authentication), Pass-through Authentication (PTA — authentication requests are forwarded to on-premises AD in real-time), and Federation (ADFS or third-party IdP handles authentication). PHS is the simplest and most resilient option and also enables leaked credential detection. PTA keeps passwords exclusively on-premises but adds dependency on PTA agents. Entra Connect also supports device writeback, group writeback, and Exchange hybrid configurations. Entra Cloud Sync is the newer, lighter-weight agent for simpler multi-forest scenarios.",
  ],
  interviewQA: [
    {
      q: "Explain the difference between system-assigned and user-assigned managed identities and when you would choose each.",
      a: "A system-assigned managed identity is created with and tied to a specific Azure resource — one identity per resource, deleted when the resource is deleted. This is simpler to manage for single-resource scenarios (e.g., a VM accessing Key Vault). A user-assigned managed identity is a standalone resource with its own lifecycle — it can be assigned to multiple resources and persists independently. Choose user-assigned when multiple resources need the same permissions (e.g., several App Service instances accessing the same storage account), when you need the identity to survive resource recreation (during redeployment), or when you need to pre-configure RBAC assignments before the consuming resource exists.",
      followUps: [
        "How does DefaultAzureCredential discover managed identities?",
        "Can a resource have both system-assigned and user-assigned identities?",
      ],
    },
    {
      q: "How does Azure RBAC scope inheritance work, and what are the implications for role assignment design?",
      a: "RBAC scopes form a hierarchy: management group > subscription > resource group > resource. A role assigned at a higher scope is automatically inherited by all child scopes. For example, granting Contributor at the subscription level gives Contributor access to every resource group and resource in that subscription. Best practice is to assign roles at the narrowest scope that meets the requirement — assigning at resource group or resource level rather than subscription. Use management group assignments for organization-wide policies (e.g., Reader for auditors across all subscriptions). Custom roles can be scoped to specific subscriptions or management groups. Note that RBAC is additive with no explicit deny, so overly broad assignments cannot be narrowed by a more specific role.",
      followUps: [
        "How do deny assignments work in Azure RBAC?",
        "What is the difference between RBAC roles and Entra ID roles?",
      ],
    },
    {
      q: "Describe how Conditional Access policies enforce zero-trust access control.",
      a: "Conditional Access policies are if-then rules evaluated at authentication time. The 'if' is a set of conditions (user/group, application, device platform, location, risk level). The 'then' is an access control (block, allow with MFA, require compliant device, limit session). For zero-trust enforcement: require MFA for all users as a baseline, require managed/compliant devices for accessing sensitive applications, block access from high-risk sign-ins detected by Entra ID Protection, restrict access to applications based on named locations (e.g., block access from specific countries), and apply session controls for unmanaged devices (e.g., no download in SharePoint). Report-only mode allows testing policies without enforcement. Multiple policies are additive — the most restrictive grant controls from all matching policies must all be satisfied.",
      followUps: [
        "What is Continuous Access Evaluation and how does it relate to Conditional Access?",
        "How do you troubleshoot Conditional Access failures?",
      ],
    },
    {
      q: "What is Privileged Identity Management (PIM) and why is it important?",
      a: "PIM implements just-in-time privileged access, replacing permanent (standing) admin role assignments with time-limited, on-demand activations. Instead of a user permanently holding Global Administrator, they activate the role for a defined period (e.g., 4 hours) with MFA verification and optional approval workflows. PIM provides audit trails of all activations, access reviews to periodically recertify role assignments, and alerts for suspicious activation patterns. This reduces the attack surface by minimizing the time and number of accounts with privileged access, aligning with the least-privilege principle. PIM covers both Entra ID directory roles and Azure resource RBAC roles.",
    },
  ],
  mcqs: [
    {
      q: "Which authentication protocol does Entra ID use for modern web application single sign-on?",
      options: ["LDAP", "Kerberos", "OpenID Connect", "NTLM"],
      answerIndex: 2,
      explanation:
        "Entra ID uses OpenID Connect (built on OAuth 2.0) for modern web app authentication. LDAP and Kerberos are on-premises AD protocols. NTLM is a legacy Windows authentication protocol.",
    },
    {
      q: "In Azure RBAC, what three elements make up a role assignment?",
      options: [
        "User, password, resource",
        "Security principal, role definition, scope",
        "Tenant, subscription, policy",
        "Application, secret, endpoint",
      ],
      answerIndex: 1,
      explanation:
        "A role assignment binds a security principal (who — user, group, service principal, managed identity) to a role definition (what — Owner, Contributor, Reader, custom) at a scope (where — management group, subscription, resource group, resource).",
    },
    {
      q: "How does a managed identity obtain access tokens from Azure?",
      options: [
        "By storing credentials in environment variables",
        "By querying the Azure Instance Metadata Service (IMDS) at 169.254.169.254",
        "By reading secrets from Azure Key Vault",
        "By using certificate-based authentication with Entra ID",
      ],
      answerIndex: 1,
      explanation:
        "Managed identities obtain tokens by calling the IMDS endpoint at 169.254.169.254, which is a non-routable link-local address accessible only from within the Azure resource. No secrets are stored or transmitted.",
    },
    {
      q: "What happens when multiple Conditional Access policies apply to a single sign-in?",
      options: [
        "Only the first matching policy is applied",
        "The least restrictive policy wins",
        "All matching policies are combined and the most restrictive controls win",
        "The user is prompted to choose which policy to follow",
      ],
      answerIndex: 2,
      explanation:
        "Conditional Access policies are additive. All matching policies are evaluated, and the most restrictive grant controls from all policies must be satisfied. For example, if one policy requires MFA and another requires a compliant device, both requirements must be met.",
    },
    {
      q: "Which Entra Connect synchronization mode keeps passwords exclusively on-premises?",
      options: [
        "Password Hash Sync",
        "Pass-through Authentication",
        "Federation with ADFS",
        "Both Pass-through Authentication and Federation",
      ],
      answerIndex: 3,
      explanation:
        "Both Pass-through Authentication (PTA) and Federation (ADFS) keep passwords on-premises. PTA forwards authentication requests to on-premises agents. Federation redirects the user to an on-premises identity provider. Password Hash Sync sends password hashes to the cloud.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between Entra ID roles and Azure RBAC roles?",
      back: "Entra ID roles manage directory resources (users, groups, app registrations) — e.g., Global Administrator, User Administrator. Azure RBAC roles manage Azure resources (VMs, storage, networks) — e.g., Owner, Contributor, Reader. They are separate authorization systems.",
    },
    {
      front: "What is Continuous Access Evaluation (CAE)?",
      back: "CAE enables near-real-time enforcement of access policy changes and critical events (user disabled, password changed, location change) by allowing resource providers to subscribe to Entra ID events and reject tokens before their natural expiration.",
    },
    {
      front: "What protocols does Entra ID support for authentication?",
      back: "OAuth 2.0 (authorization), OpenID Connect (authentication, built on OAuth 2.0), and SAML 2.0 (federated SSO with legacy enterprise applications).",
    },
    {
      front: "What is a service principal in Entra ID?",
      back: "The local representation of an application or managed identity in a specific tenant. It defines what the application can access in that tenant. App registrations are global; service principals are per-tenant instances.",
    },
    {
      front: "What are named locations in Conditional Access?",
      back: "Defined IP address ranges or countries/regions used as conditions in Conditional Access policies. Trusted named locations can be excluded from MFA requirements (e.g., corporate office IPs).",
    },
    {
      front: "What is the principle of least privilege in Azure RBAC?",
      back: "Grant only the minimum permissions needed to perform a task, assign roles at the narrowest possible scope, and prefer built-in roles with limited permissions over broad roles like Owner or Contributor.",
    },
    {
      front: "What is Password Hash Sync (PHS)?",
      back: "An Entra Connect synchronization mode that syncs a hash of the on-premises AD password hash to Entra ID. Authentication happens in the cloud. Enables leaked credential detection and works even if on-premises AD is unavailable.",
    },
    {
      front: "What is an access review in Entra ID?",
      back: "A periodic review process where designated reviewers certify whether users, groups, or service principals still need their role assignments or group memberships. Unreviewd or denied assignments are automatically removed.",
    },
  ],
  glossary: [
    {
      term: "Tenant",
      definition:
        "An isolated instance of the Entra ID directory representing an organization. Contains users, groups, app registrations, policies, and other identity objects.",
    },
    {
      term: "Security Principal",
      definition:
        "An identity that can be assigned permissions in Azure: a user, security group, service principal (application identity), or managed identity.",
    },
    {
      term: "Conditional Access",
      definition:
        "Entra ID's policy engine that evaluates signals (identity, device, location, risk) at sign-in time and enforces access controls (block, MFA, device compliance, session restrictions).",
    },
    {
      term: "Managed Identity",
      definition:
        "An Entra ID identity automatically managed by Azure for an Azure resource, eliminating the need to store credentials in code. Tokens are obtained from IMDS without secrets.",
    },
    {
      term: "App Registration",
      definition:
        "A global definition of an application in Entra ID that specifies its identity configuration: redirect URIs, API permissions, certificates/secrets, and token settings.",
    },
    {
      term: "Microsoft Graph",
      definition:
        "The unified REST API for accessing Entra ID, Microsoft 365, and other Microsoft cloud service data. Replaces the legacy Azure AD Graph API.",
    },
    {
      term: "Just-In-Time (JIT) Access",
      definition:
        "A Privileged Identity Management feature that provides temporary, on-demand activation of privileged roles with time limits, MFA, and approval workflows instead of permanent assignments.",
    },
    {
      term: "Entra Connect",
      definition:
        "A synchronization tool (formerly Azure AD Connect) that bridges on-premises Active Directory with Entra ID, supporting password hash sync, pass-through authentication, and federation.",
    },
  ],
  deepDive: [
    "**Token Lifecycle and Continuous Access Evaluation (CAE) Deep Mechanics**\n\nEntra ID issues three primary token types: *ID tokens* (identity claims for the client), *access tokens* (authorization claims for the resource API), and *refresh tokens* (long-lived tokens used to obtain new access/ID tokens silently). Access tokens have a **default lifetime of 60-90 minutes** (configurable via `TokenLifetimePolicy`), while refresh tokens can last up to **90 days** with sliding window expiration. In the *traditional model*, a revoked user retains access until the access token naturally expires — a significant security gap. **Continuous Access Evaluation (CAE)** closes this gap by establishing a *backchannel* between Entra ID and resource providers (Exchange Online, SharePoint Online, Teams, Microsoft Graph). When a **critical event** fires — such as `user.revokeSignInSessions`, account disabled, password change, or high-risk user detection — the resource provider receives the event via the *event subscription model* and immediately rejects the cached access token. CAE-aware clients receive a `claims challenge` (an HTTP `401` with a `WWW-Authenticate` header containing a `claims` parameter) and must re-authenticate with Entra ID. CAE also enables **IP-based location enforcement**: even mid-session, if a request originates from an IP outside the `Conditional Access` trusted locations, the resource provider can reject the token. The CAE-capable access token lifetime is extended to **~28 hours** because real-time revocation removes the need for short-lived tokens. Developers must handle `claims challenges` using `TokenRequestContext` in the Azure SDK by extracting the `claims` value and passing it in the next `GetToken` call.",
    "**Conditional Access Policy Evaluation Engine Internals**\n\nThe Conditional Access engine operates as a **real-time policy evaluation pipeline** during every authentication and token refresh event. The evaluation follows a strict order: first, *assignments* are evaluated to determine if the policy applies (target users/groups, *cloud apps or actions*, and conditions like `locations`, `devicePlatforms`, `clientAppTypes`, `signInRiskLevel`, `userRiskLevel`, and `servicePrincipalRiskLevel`). Second, the engine determines the **effective grant controls** by aggregating all matching policies. Grant controls use an *AND* semantic by default — if Policy A requires `mfa` and Policy B requires `compliantDevice`, both must be satisfied. Within a single policy, controls can be `AND` or `OR` (e.g., require MFA *or* compliant device). **Session controls** add a third layer: `applicationEnforcedRestrictions` passes a claim to the app (used by SharePoint for limited web access), `cloudAppSecurity` routes traffic through *Microsoft Defender for Cloud Apps* for real-time monitoring, `signInFrequency` overrides the default token refresh interval (e.g., require re-authentication every 4 hours), and `persistentBrowserSession` controls whether the browser session cookie persists. The engine also evaluates **authentication context** (`acrs` claim) — an advanced feature where specific resources or actions within an app can trigger additional Conditional Access requirements (e.g., accessing *highly confidential* labeled documents requires step-up MFA even if the initial sign-in only required a password). Policies in `reportOnly` mode are evaluated but not enforced; their results appear in the *sign-in logs* under `reportOnlyAdditionalDetails` for testing before enforcement.",
    "**Entra ID Protection ML Models and Risk Scoring**\n\nEntra ID Protection employs a multi-layered **machine learning pipeline** to compute *sign-in risk* and *user risk*. **Sign-in risk** is evaluated per authentication attempt and considers: *anonymous IP detection* (signals from known VPN/Tor exit nodes), **atypical travel** (comparing the geographic location and timestamp against the user's *learned travel patterns* using a Bayesian model), *token issuer anomaly* (unusual `iss` claims or token characteristics), `password spray detection` (correlating low-confidence failed attempts across multiple accounts from similar infrastructure), *unfamiliar sign-in properties* (comparing the current session's IP, ASN, device, and browser fingerprint against the user's historical profile using a *feature vector similarity model*), and **anomalous token** (detecting replayed or modified tokens). Each detector outputs a *confidence score*, and the aggregation engine combines them into a **composite risk level**: `low`, `medium`, or `high`. **User risk** is a *persistent state* that accumulates over time: confirmed compromised credentials (from dark web monitoring via partnerships with threat intelligence providers), *anomalous user activity* patterns, and admin-confirmed compromise. User risk remains elevated until **remediation** occurs — typically a *secure password change* or admin dismissal. Risk scores feed directly into `Conditional Access` policies via the `signInRisk` and `userRisk` conditions, enabling automated responses: `low` risk might log for monitoring, `medium` risk triggers `MFA`, and `high` risk **blocks access** or forces a password reset. The ML models use **federated learning** across the Entra ID tenant population (processing *billions of authentications daily*) while maintaining tenant data isolation through **differential privacy** techniques."
  ],
  code: [
    {
      language: "bash",
      caption: "Create a Conditional Access policy requiring MFA for all users accessing Azure Management",
      source: "# Create a Conditional Access policy via Azure CLI\naz rest --method POST \\\n  --uri \"https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies\" \\\n  --headers \"Content-Type=application/json\" \\\n  --body '{\n    \"displayName\": \"Require MFA for Azure Management\",\n    \"state\": \"enabledForReportingButNotEnforced\",\n    \"conditions\": {\n      \"users\": {\n        \"includeUsers\": [\"All\"]\n      },\n      \"applications\": {\n        \"includeApplications\": [\"797f4846-ba00-4fd7-ba43-dac1f8f63013\"]\n      }\n    },\n    \"grantControls\": {\n      \"operator\": \"OR\",\n      \"builtInControls\": [\"mfa\"]\n    }\n  }'\n\n# List existing Conditional Access policies\naz rest --method GET \\\n  --uri \"https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies\"\n\n# Update policy state from report-only to enabled\naz rest --method PATCH \\\n  --uri \"https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/{policy-id}\" \\\n  --body '{\"state\": \"enabled\"}'"
    },
    {
      language: "bash",
      caption: "Assign RBAC roles and configure managed identities using Azure CLI",
      source: "# Assign the 'Reader' role to a user at a resource group scope\naz role assignment create \\\n  --assignee \"user@contoso.com\" \\\n  --role \"Reader\" \\\n  --scope \"/subscriptions/{sub-id}/resourceGroups/{rg-name}\"\n\n# Assign 'Storage Blob Data Contributor' to a managed identity\naz role assignment create \\\n  --assignee-object-id \"$(az identity show -g myRG -n myIdentity --query principalId -o tsv)\" \\\n  --assignee-principal-type ServicePrincipal \\\n  --role \"Storage Blob Data Contributor\" \\\n  --scope \"/subscriptions/{sub-id}/resourceGroups/{rg-name}/providers/Microsoft.Storage/storageAccounts/{account}\"\n\n# List all role assignments for a specific scope\naz role assignment list \\\n  --scope \"/subscriptions/{sub-id}/resourceGroups/{rg-name}\" \\\n  --output table\n\n# Create a custom RBAC role definition\naz role definition create --role-definition '{\n  \"Name\": \"VM Restart Operator\",\n  \"Description\": \"Can restart virtual machines only\",\n  \"Actions\": [\n    \"Microsoft.Compute/virtualMachines/restart/action\",\n    \"Microsoft.Compute/virtualMachines/read\"\n  ],\n  \"AssignableScopes\": [\"/subscriptions/{sub-id}\"]\n}'"
    },
    {
      language: "bash",
      caption: "Create and configure managed identities for Azure resources",
      source: "# Enable system-assigned managed identity on an App Service\naz webapp identity assign \\\n  --name myWebApp \\\n  --resource-group myRG\n\n# Create a user-assigned managed identity\naz identity create \\\n  --name mySharedIdentity \\\n  --resource-group myRG \\\n  --location eastus\n\n# Assign user-assigned identity to a VM\naz vm identity assign \\\n  --name myVM \\\n  --resource-group myRG \\\n  --identities \"/subscriptions/{sub-id}/resourceGroups/myRG/providers/Microsoft.ManagedIdentity/userAssignedIdentities/mySharedIdentity\"\n\n# Grant the managed identity access to Key Vault secrets\naz keyvault set-policy \\\n  --name myKeyVault \\\n  --object-id \"$(az identity show -g myRG -n mySharedIdentity --query principalId -o tsv)\" \\\n  --secret-permissions get list\n\n# Verify managed identity token acquisition (from within the Azure resource)\n# curl -H 'Metadata: true' \\\n#   'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net'"
    }
  ],
  diagrams: [
    {
      title: "Entra ID Component Architecture",
      kind: "architecture",
      caption: "Overview of the core Azure Entra ID components and how tenants, app registrations, managed identities, and RBAC relate to one another.",
      mermaid: `graph TD
    Tenant["Tenant<br/>(Isolated Directory)"]
    Users["Users and Groups"]
    AppReg["App Registrations"]
    SP["Service Principals"]
    MI["Managed Identities"]
    CA["Conditional Access<br/>Policies"]
    PIM["Privileged Identity<br/>Management"]
    RBAC["Azure RBAC<br/>Role Assignments"]
    MG["Management Group"]
    SUB["Subscription"]
    RG["Resource Group"]
    RES["Azure Resources"]

    Tenant --> Users
    Tenant --> AppReg
    Tenant --> CA
    Tenant --> PIM
    AppReg --> SP
    MI --> SP
    SP --> RBAC
    Users --> RBAC
    MG --> SUB --> RG --> RES
    RBAC --> RES`,
    },
    {
      title: "OAuth 2.0 Authorization Code Flow",
      kind: "sequence",
      caption: "The complete OAuth 2.0 authorization code flow from user sign-in through token exchange to API access, including the Conditional Access evaluation step.",
      mermaid: `sequenceDiagram
    participant User as User
    participant App as Client App
    participant Entra as Entra ID
    participant API as Resource API

    User->>App: Access protected page
    App->>Entra: Redirect to /authorize
    Entra->>User: Present sign-in page
    User->>Entra: Submit credentials and MFA
    Note over Entra: Evaluate Conditional Access
    Entra->>App: Return authorization code
    App->>Entra: POST /token with code and secret
    Entra->>App: Return access_token and refresh_token
    App->>API: Request with Bearer access_token
    API->>App: Return protected data
    Note over App,Entra: Token expiry - silent refresh
    App->>Entra: POST /token with refresh_token
    Entra->>App: New access_token`,
    },
    {
      title: "Conditional Access Authentication Flow",
      kind: "flow",
      caption: "Decision flow for a sign-in request evaluated against Conditional Access policies, from signal collection to final access grant or block.",
      mermaid: `flowchart TD
    A["Sign-in Request"] --> B["Collect Signals"]
    B --> C["User Identity and Group"]
    B --> D["Device Platform and Compliance"]
    B --> E["Location and IP"]
    B --> F["Sign-in Risk Level"]
    C & D & E & F --> G{"Match CA Policies?"}
    G -->|"No match"| H["Grant Access"]
    G -->|"Match found"| I{"Block Policy?"}
    I -->|"Yes"| J["Block Access"]
    I -->|"No"| K{"MFA Required?"}
    K -->|"Yes"| L["Prompt for MFA"]
    K -->|"No"| M{"Device Compliance?"}
    L -->|"Pass"| M
    L -->|"Fail"| J
    M -->|"Compliant"| N["Apply Session Controls"]
    M -->|"Not compliant"| J
    N --> O["Access Granted"]`,
    },
    {
      title: "Identity Concepts Mindmap",
      kind: "mindmap",
      caption: "Key concepts in Azure Entra ID identity and access management, organized by category.",
      mermaid: `mindmap
  root["Entra ID"]
    Authentication
      OAuth 2.0
      OpenID Connect
      SAML 2.0
      MFA
    Authorization
      Azure RBAC
      Entra ID Roles
      Conditional Access
      PIM
    Identities
      Users
      Groups
      Service Principals
      Managed Identities
    Hybrid
      Entra Connect
      Password Hash Sync
      Pass-through Auth
      Federation`,
    },
  ],
  comparison: {
    columns: ["Feature", "Password Hash Sync (PHS)", "Pass-through Authentication (PTA)", "Federation (ADFS)"],
    rows: [
      ["**Authentication location**", "Cloud (Entra ID)", "On-premises AD (via PTA agents)", "On-premises federation server (ADFS)"],
      ["**Password storage**", "Hash of hash synced to cloud", "Passwords remain on-premises only", "Passwords remain on-premises only"],
      ["**Infrastructure required**", "Entra Connect server only", "Entra Connect + PTA agents (2+ recommended)", "ADFS farm + WAP servers + Entra Connect"],
      ["**High availability**", "Built-in (cloud-based)", "Deploy multiple PTA agents", "ADFS farm with load balancing + WAP"],
      ["**Leaked credential detection**", "Supported (compares against known breaches)", "Not supported", "Not supported"],
      ["**Smart Lockout**", "Fully supported", "Supported (prevents on-prem lockouts)", "Depends on ADFS extranet lockout config"],
      ["**On-prem outage impact**", "None — cloud auth continues", "Authentication fails if all agents are down", "Authentication fails if ADFS farm is down"],
      ["**Advanced sign-in policies**", "Conditional Access only", "Conditional Access only", "ADFS claim rules + Conditional Access"],
      ["**Complexity**", "*Low* — simplest to deploy", "*Medium* — requires agent management", "*High* — full ADFS infrastructure"],
      ["**Best for**", "Most organizations; recommended default", "Strict on-prem password requirement", "Complex claims transformation or third-party IdP"]
    ]
  },
  exercises: [
    "**Lab 1: Configure Conditional Access with MFA** — Create a Conditional Access policy in *report-only* mode that requires `MFA` for all users accessing the **Azure portal** (app ID `797f4846-ba00-4fd7-ba43-dac1f8f63013`). Exclude a break-glass emergency access account. Review the *sign-in logs* to verify policy evaluation results, then switch the policy to **enabled** state. Test by signing in with a non-excluded user and confirming the MFA prompt appears.",
    "**Lab 2: Implement Managed Identity for Key Vault Access** — Deploy an **Azure App Service** with a *system-assigned managed identity* enabled. Create an `Azure Key Vault` and add a test secret. Grant the App Service's managed identity `Key Vault Secrets User` role using Azure RBAC (not access policies). Write a simple application using `DefaultAzureCredential` from the Azure SDK to retrieve the secret. Verify the application can access the secret *without any credentials in code or configuration*.",
    "**Lab 3: Design RBAC with Custom Roles** — Create a *custom RBAC role* called `VM Restart Operator` that grants only `Microsoft.Compute/virtualMachines/restart/action` and `Microsoft.Compute/virtualMachines/read` permissions. Assign this role to a test user at the **resource group** scope. Verify the user can restart VMs but *cannot* create, delete, or modify VM configurations. Test scope inheritance by confirming the role applies to all VMs within the resource group.",
    "**Lab 4: Set Up Privileged Identity Management (PIM)** — Configure PIM for the `User Administrator` Entra ID role. Set the maximum activation duration to **4 hours**, require `MFA` on activation, and require *approval* from a designated approver. As a test user, request activation of the role, complete MFA, and submit the justification. As the approver, review and approve the request. Verify the role is active for the configured duration and automatically deactivated after expiry.",
    "**Lab 5: Entra Connect Password Hash Sync with Leaked Credential Detection** — Set up **Entra Connect** in a lab environment with *Password Hash Sync* enabled. Configure Entra ID Protection to detect `leaked credentials` by enabling the risk policy for user risk. Create a Conditional Access policy that requires a **password change** for users with *high user risk*. Simulate a leaked credential scenario and verify that the user is prompted to change their password on next sign-in."
  ],
  cheatSheet: [
    "List all Entra ID users: `az ad user list --output table` | Show specific user: `az ad user show --id user@contoso.com`",
    "List role assignments at a scope: `az role assignment list --scope /subscriptions/{id} --output table` | Check your own roles: `az role assignment list --assignee $(az ad signed-in-user show --query id -o tsv)`",
    "Enable system-assigned managed identity: `az webapp identity assign -g myRG -n myApp` | Get the principal ID: `az webapp identity show -g myRG -n myApp --query principalId -o tsv`",
    "List all Conditional Access policies: `az rest --method GET --uri https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies` | Filter by state: append `?$filter=state eq 'enabled'`",
    "Review sign-in logs for a user: `az rest --method GET --uri \"https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=userPrincipalName eq 'user@contoso.com'\"` | Check for CA failures: look for `conditionalAccessStatus` field",
    "Create a user-assigned managed identity: `az identity create -g myRG -n myIdentity` | Assign to a VM: `az vm identity assign -g myRG -n myVM --identities /subscriptions/{sub}/resourceGroups/myRG/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myIdentity`"
  ],
  revisionNotes: [
    "**Entra ID authentication** uses *OAuth 2.0* (authorization), **OpenID Connect** (authentication), and *SAML 2.0* (legacy SSO). Tokens include `access tokens` (60-90 min default), `ID tokens`, and `refresh tokens` (up to 90 days). **CAE** extends access token lifetime to ~28 hours by enabling *real-time revocation* via backchannel events between Entra ID and resource providers.",
    "**Azure RBAC** is *additive* with no explicit deny (except limited deny assignments). Role assignments consist of **security principal** + **role definition** + **scope**. Scope hierarchy: `management group > subscription > resource group > resource`. Always assign at the *narrowest scope*. Built-in roles: **Owner** (full + role assignment), **Contributor** (full minus role assignment), **Reader** (read-only).",
    "**Managed identities** eliminate credentials in code. *System-assigned*: tied to one resource's lifecycle, auto-deleted. *User-assigned*: standalone resource, shareable across multiple resources, survives redeployment. Both obtain tokens from `IMDS` at `169.254.169.254`. Use `DefaultAzureCredential` in code for automatic discovery.",
    "**Conditional Access** policies are **additive** — most restrictive controls from *all matching policies* must be satisfied. Key signals: user/group, app, device platform/compliance, location (`named locations`), `signInRisk`, `userRisk`. Grant controls: `block`, `mfa`, `compliantDevice`, `hybridAzureADJoinedDevice`. Session controls: `signInFrequency`, `persistentBrowserSession`, `cloudAppSecurity`. Always test with **report-only** mode first.",
    "**Hybrid identity** options: *PHS* (simplest, cloud auth, supports leaked credential detection), *PTA* (on-prem auth via agents, passwords never leave on-prem), *Federation/ADFS* (most complex, supports advanced claims rules). **PIM** provides *just-in-time* privileged access with time-limited activations, MFA requirement, approval workflows, and full audit logging. Use PIM for both Entra ID roles and Azure RBAC roles."
  ],
};
