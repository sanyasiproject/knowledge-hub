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
};
