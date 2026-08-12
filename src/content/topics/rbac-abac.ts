import type { TopicContent } from "../types";

export const rbacAbac: TopicContent = {
  quickSummary: [
    "RBAC (Role-Based Access Control) assigns permissions to roles, then assigns roles to users. A user's access is determined entirely by their roles — simple to understand and manage, but rigid for complex policies.",
    "ABAC (Attribute-Based Access Control) evaluates access based on attributes of the user, resource, action, and environment. Policies like 'doctors can view patient records in their own department during business hours' are natural in ABAC but impossible in pure RBAC.",
    "RBAC is the right default for most applications. ABAC is needed when access decisions depend on context (time, location, resource ownership, data classification) beyond what roles can express.",
  ],
  detailed: [
    "RBAC works by defining roles (admin, editor, viewer), assigning permissions to roles (editor can create and update posts), and assigning roles to users. A user inherits all permissions from their assigned roles. The access check is simple: does the user have a role that includes the required permission? RBAC is easy to audit (list a user's roles to see all their permissions) and maps naturally to organizational structures.",
    "Role hierarchies allow roles to inherit permissions from other roles. For example: viewer < editor < admin, where each higher role inherits all permissions from lower roles plus its own. This reduces redundancy but adds complexity — circular inheritance must be prevented, and deep hierarchies can be hard to reason about.",
    "RBAC limitations emerge with contextual access rules. 'Only the document owner can delete it' requires checking a relationship between the user and the resource, not just the user's role. 'Managers can approve expenses under $5000 but only VPs can approve above $5000' requires checking a resource attribute (amount) against a role. These rules don't fit pure RBAC and lead to role explosion — creating roles like 'document-owner-editor' or 'expense-approver-under-5k' for every combination.",
    "ABAC evaluates policies based on four categories of attributes: (1) Subject attributes — user properties like department, clearance level, job title, location. (2) Resource attributes — properties of the thing being accessed, like classification, owner, creation date. (3) Action attributes — what's being done (read, write, delete, approve). (4) Environment attributes — contextual factors like current time, IP address, device type.",
    "ABAC policies are expressed as rules: 'IF subject.role = doctor AND resource.type = patient_record AND subject.department = resource.department AND environment.time IN business_hours THEN allow read.' This single policy replaces what might require dozens of RBAC roles. ABAC is more expressive but harder to audit — understanding a user's effective permissions requires evaluating all policies against all possible resource and environment combinations.",
    "Policy-Based Access Control (PBAC) is the implementation pattern for ABAC. A policy engine (OPA/Rego, Cedar, Casbin, Zanzibar) evaluates access requests against a set of policies. The application sends a structured query (subject, action, resource, context) to the policy engine and receives an allow/deny decision. This externalizes authorization logic from application code, making policies easier to change without code deployments.",
    "Relationship-Based Access Control (ReBAC) models permissions as relationships between entities in a graph. 'User A is an editor of Document X' and 'Document X is in Folder Y' and 'User B is a viewer of Folder Y' — so User B can view Document X through the folder relationship. Google Zanzibar (used by Google Drive, YouTube) is the canonical ReBAC system. SpiceDB and OpenFGA are open-source implementations.",
  ],
  deepDive: [
    "Google Zanzibar's data model uses relation tuples: (object, relation, user). For example: (doc:readme, editor, user:alice), (folder:eng, viewer, group:engineering), (doc:readme, parent, folder:eng). Access checks traverse the relationship graph: 'Can user:bob view doc:readme?' checks if bob is a viewer of doc:readme, or a viewer of any folder that contains doc:readme, or a member of any group that has viewer access, recursively. This handles complex hierarchies elegantly.",
    "The role explosion problem: in pure RBAC, expressing fine-grained context-dependent policies requires creating roles for every combination of conditions. An organization with 10 departments, 5 data classifications, and 3 access levels needs up to 150 roles. Adding a new dimension (e.g., time-based access) multiplies the role count. ABAC avoids this by expressing conditions as attributes in policies rather than encoding them into role names.",
    "Hybrid RBAC + ABAC: most production systems combine both. RBAC handles coarse-grained access (admin vs user vs viewer), while ABAC policies handle fine-grained contextual rules within each role. For example: RBAC determines that editors can modify resources, but an ABAC policy further restricts this to resources in the editor's department during business hours. This gives you RBAC's simplicity for the common case and ABAC's expressiveness for edge cases.",
    "Performance considerations: RBAC permission checks are typically O(1) — look up the user's role, check if the role has the permission (often a bitfield or set lookup). ABAC evaluations can be more expensive — fetching attributes from multiple sources, evaluating complex policy rules. ReBAC graph traversal can be deep. Caching and pre-computation are essential: cache role-permission mappings, pre-compute frequently checked ABAC decisions, and use Zanzibar-style 'check' APIs with internal caching for ReBAC.",
  ],
  code: [
    {
      language: "typescript",
      caption: "RBAC implementation with role hierarchy",
      source: `// Define permissions as an enum or constants
const Permissions = {
  READ_POST: "read:post",
  CREATE_POST: "create:post",
  UPDATE_POST: "update:post",
  DELETE_POST: "delete:post",
  MANAGE_USERS: "manage:users",
  VIEW_ANALYTICS: "view:analytics",
} as const;

type Permission = (typeof Permissions)[keyof typeof Permissions];

// Role hierarchy: each role inherits permissions from its parent
const roleHierarchy: Record<string, { permissions: Permission[]; inherits?: string }> = {
  viewer: {
    permissions: [Permissions.READ_POST],
  },
  editor: {
    permissions: [Permissions.CREATE_POST, Permissions.UPDATE_POST],
    inherits: "viewer", // Also gets READ_POST
  },
  admin: {
    permissions: [Permissions.DELETE_POST, Permissions.MANAGE_USERS, Permissions.VIEW_ANALYTICS],
    inherits: "editor", // Also gets viewer + editor permissions
  },
};

// Resolve all permissions for a role (including inherited)
function resolvePermissions(role: string): Set<Permission> {
  const permissions = new Set<Permission>();
  let current: string | undefined = role;

  while (current) {
    const roleDef = roleHierarchy[current];
    if (!roleDef) break;
    roleDef.permissions.forEach((p) => permissions.add(p));
    current = roleDef.inherits;
  }

  return permissions;
}

// Check if a user has a specific permission
function hasPermission(userRoles: string[], required: Permission): boolean {
  return userRoles.some((role) => resolvePermissions(role).has(required));
}

// Express middleware
function requirePermission(permission: Permission) {
  return (req: any, res: any, next: any) => {
    if (!hasPermission(req.user.roles, permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage
app.delete("/posts/:id",
  authenticate,
  requirePermission(Permissions.DELETE_POST),
  deletePostHandler
);`,
    },
    {
      language: "typescript",
      caption: "ABAC policy engine with attribute-based rules",
      source: `interface Subject {
  id: string;
  roles: string[];
  department: string;
  clearanceLevel: number;
}

interface Resource {
  type: string;
  ownerId: string;
  department: string;
  classification: "public" | "internal" | "confidential" | "restricted";
}

interface Environment {
  time: Date;
  ipAddress: string;
  mfaVerified: boolean;
}

interface AccessRequest {
  subject: Subject;
  action: string;
  resource: Resource;
  environment: Environment;
}

type PolicyRule = (request: AccessRequest) => "allow" | "deny" | "skip";

const classificationLevels = { public: 0, internal: 1, confidential: 2, restricted: 3 };

// Define ABAC policies
const policies: PolicyRule[] = [
  // Rule 1: Users can only access resources up to their clearance level
  (req) => {
    const resourceLevel = classificationLevels[req.resource.classification];
    if (req.subject.clearanceLevel < resourceLevel) return "deny";
    return "skip";
  },

  // Rule 2: Confidential resources require MFA
  (req) => {
    if (
      req.resource.classification === "confidential" ||
      req.resource.classification === "restricted"
    ) {
      if (!req.environment.mfaVerified) return "deny";
    }
    return "skip";
  },

  // Rule 3: Users can only modify resources in their own department
  (req) => {
    if (["update", "delete"].includes(req.action)) {
      if (req.subject.department !== req.resource.department) return "deny";
    }
    return "skip";
  },

  // Rule 4: Resource owners can always access their own resources
  (req) => {
    if (req.subject.id === req.resource.ownerId) return "allow";
    return "skip";
  },

  // Rule 5: Admins can do anything (RBAC fallback)
  (req) => {
    if (req.subject.roles.includes("admin")) return "allow";
    return "skip";
  },

  // Rule 6: Default — check RBAC permissions
  (req) => {
    const rolePerms: Record<string, string[]> = {
      viewer: ["read"],
      editor: ["read", "create", "update"],
    };
    const allowed = req.subject.roles.some((role) =>
      rolePerms[role]?.includes(req.action)
    );
    return allowed ? "allow" : "deny";
  },
];

// Evaluate policies (first explicit allow/deny wins; default deny)
function evaluate(request: AccessRequest): boolean {
  for (const policy of policies) {
    const result = policy(request);
    if (result === "allow") return true;
    if (result === "deny") return false;
  }
  return false; // Default deny
}`,
    },
    {
      language: "rego",
      caption: "OPA (Open Policy Agent) Rego policy for ABAC",
      source: `package authz

import future.keywords.if
import future.keywords.in

default allow := false

# Admins can do anything
allow if {
    "admin" in input.subject.roles
}

# Resource owners can access their own resources
allow if {
    input.subject.id == input.resource.owner_id
}

# Editors can read and write resources in their department
allow if {
    "editor" in input.subject.roles
    input.action in ["read", "create", "update"]
    input.subject.department == input.resource.department
}

# Viewers can read any resource at or below their clearance
allow if {
    "viewer" in input.subject.roles
    input.action == "read"
    clearance_sufficient
}

# Deny access to confidential+ resources without MFA
deny if {
    input.resource.classification in ["confidential", "restricted"]
    not input.environment.mfa_verified
}

clearance_sufficient if {
    levels := {"public": 0, "internal": 1, "confidential": 2, "restricted": 3}
    levels[input.resource.classification] <= input.subject.clearance_level
}

# Final decision: allow unless explicitly denied
decision := "allow" if {
    allow
    not deny
}

decision := "deny" if {
    not allow
}

decision := "deny" if {
    deny
}`,
    },
  ],
  diagrams: [
    {
      title: "RBAC Model Structure",
      kind: "architecture",
      caption: "Users are assigned to roles. Roles hold permissions. Users inherit all permissions from their assigned roles. Role hierarchies allow inheritance.",
      mermaid: `graph TD
    U1[User Alice] --> R1[Role: Editor]
    U2[User Bob] --> R1
    U2 --> R2[Role: Viewer]
    R1 --> P1[Permission: posts:write]
    R1 --> P2[Permission: posts:read]
    R2 --> P2
    R1 --> R2`,
    },
    {
      title: "ABAC Policy Evaluation Flow",
      kind: "flow",
      caption: "Access request carries subject, action, resource, and environment attributes. PDP evaluates matching policies and returns Permit or Deny.",
      mermaid: `flowchart TD
    A([Access Request]) --> B[Policy Enforcement Point]
    B --> C{Send to PDP}
    C --> D[Collect Subject Attributes]
    C --> E[Collect Resource Attributes]
    C --> F[Collect Environment Attributes]
    D --> G[Evaluate Policies]
    E --> G
    F --> G
    G --> H{Decision}
    H -->|Permit| I[Allow Request]
    H -->|Deny| J[Return 403]
    H -->|Not Applicable| K[Apply default deny]`,
    },
    {
      title: "ReBAC Relationship Graph",
      kind: "network",
      caption: "Access is derived from object relationships. A user who is a member of a group that is an editor of a document can edit it.",
      mermaid: `graph LR
    Alice[User: Alice] -->|member| TeamA[Group: Team A]
    TeamA -->|editor| DocX[Document: Report.pdf]
    Bob[User: Bob] -->|owner| DocX
    DocX -->|parent| FolderY[Folder: Q4 Reports]
    Alice -->|viewer| FolderY`,
    },
    {
      title: "RBAC vs ABAC vs ReBAC",
      kind: "mindmap",
      caption: "Comparison of three access control models by complexity, flexibility, and typical use cases.",
      mermaid: `mindmap
  root((Access Control Models))
    RBAC
      Role-based
      Simple to manage
      Best for stable job functions
      Limited context awareness
    ABAC
      Attribute-based
      Fine-grained policies
      Handles context and time
      Higher complexity
    ReBAC
      Relationship-based
      Zanzibar / Google Docs model
      Dynamic ownership chains
      Complex graph evaluation`,
    },
  ],
  animations: [
    {
      title: "ABAC Policy Evaluation Walkthrough",
      steps: [
        { label: "Access request", detail: "Dr. Smith (department: cardiology, clearance: 2) wants to read Patient Record #42 (department: cardiology, classification: confidential)." },
        { label: "Check clearance", detail: "Policy 1: resource classification 'confidential' = level 2, subject clearance = 2. Clearance sufficient — skip (no deny)." },
        { label: "Check MFA", detail: "Policy 2: resource is 'confidential', so MFA is required. environment.mfaVerified = true. Check passes — skip." },
        { label: "Check department", detail: "Policy 3: action is 'read', not 'update' or 'delete'. Rule doesn't apply — skip." },
        { label: "Check ownership", detail: "Policy 4: Dr. Smith is not the owner of this record. Rule doesn't match — skip." },
        { label: "Check RBAC", detail: "Policy 6: Dr. Smith has role 'doctor' which includes 'read'. Department matches (cardiology = cardiology). Allow." },
        { label: "Decision", detail: "Access granted. Dr. Smith can read the confidential patient record in her own department with MFA verified." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "RBAC", "ABAC", "ReBAC"],
    rows: [
      ["Decision based on", "User's roles", "Attributes of user, resource, action, environment", "Relationships between entities in a graph"],
      ["Expressiveness", "Low — roles + permissions", "High — arbitrary attribute conditions", "High — relationship traversal, inheritance"],
      ["Complexity", "Low", "High (policy authoring + attribute management)", "Medium-High (graph modeling + traversal)"],
      ["Auditability", "Easy — list user's roles and permissions", "Hard — must evaluate all policies against all contexts", "Medium — trace relationship paths"],
      ["Role explosion risk", "High with fine-grained rules", "None — conditions are in policies, not roles", "None — conditions are in relationships"],
      ["Performance", "O(1) role lookup", "Varies — attribute fetching + policy evaluation", "Graph traversal depth-dependent"],
      ["Best for", "Simple org structures, CRUD apps", "Complex policies with contextual rules", "Document/resource sharing, social graphs"],
      ["Examples", "WordPress roles, AWS IAM roles", "HIPAA compliance, classification-based access", "Google Drive, GitHub org permissions"],
    ],
  },
  interviewQA: [
    {
      q: "When would you choose ABAC over RBAC?",
      a: "When access decisions depend on context beyond the user's role: resource attributes (classification, ownership, department), environmental factors (time of day, IP, MFA status), or relationships between entities. Classic signs you need ABAC: you're creating dozens of narrow roles (role explosion), you need policies like 'only during business hours' or 'only in their department,' or you need to enforce data classification levels. RBAC is sufficient for simple CRUD applications with clear organizational roles.",
      followUps: [
        "How would you implement a hybrid RBAC + ABAC system?",
        "What is the role explosion problem?",
      ],
    },
    {
      q: "What is Google Zanzibar and how does ReBAC work?",
      a: "Zanzibar is Google's global authorization system using relationship-based access control (ReBAC). It models permissions as relationships in a graph: (document:readme, editor, user:alice) means Alice is an editor of the readme document. Access checks traverse the graph: 'Can Bob view doc:readme?' checks if Bob is directly a viewer, or if he's a member of a group that has viewer access, or if doc:readme is in a folder that Bob can view. SpiceDB and OpenFGA are open-source implementations.",
    },
    {
      q: "How do you handle the 'resource owner can always access their resource' pattern in RBAC?",
      a: "Pure RBAC can't handle this because it doesn't consider resource attributes (the owner field). You need to extend RBAC with an ownership check: after the role-based permission check passes, also verify that the user is the resource owner (or has an admin role that bypasses ownership). This is effectively a simple ABAC rule layered on top of RBAC. In code: if (action === 'delete' && resource.ownerId !== user.id && !user.roles.includes('admin')) deny.",
    },
    {
      q: "How would you externalize authorization from your application code?",
      a: "Use a policy engine like OPA (Open Policy Agent), Cedar (AWS), or Casbin. The application sends a structured access request (subject, action, resource, context) to the engine via an API call or sidecar. The engine evaluates policies (written in Rego, Cedar, or a DSL) and returns allow/deny. Policies can be updated without code deployments. This separates business logic from authorization logic and ensures consistent enforcement across services.",
    },
  ],
  followUps: [
    "At what point does role explosion tell you to move to ABAC?",
    "How do you answer 'who can access this resource?' under ABAC?",
    "Where do you enforce the policy — the gateway, the service, or the database?",
  ],
  mcqs: [
    {
      q: "What is the 'role explosion' problem in RBAC?",
      options: [
        "Too many users assigned to the admin role",
        "Creating excessive numbers of narrow roles to express fine-grained contextual policies",
        "Roles consuming too much database storage",
        "Circular role inheritance causing infinite loops",
      ],
      answerIndex: 1,
      explanation:
        "When RBAC tries to express policies that depend on context (department, classification, time), it needs a separate role for each combination. 10 departments x 5 classifications x 3 levels = 150 roles. ABAC avoids this by encoding conditions in policies rather than in role names.",
    },
    {
      q: "In ABAC, which attribute category does 'current time of day' belong to?",
      options: [
        "Subject attribute",
        "Resource attribute",
        "Action attribute",
        "Environment attribute",
      ],
      answerIndex: 3,
      explanation:
        "Environment attributes are contextual factors external to the subject and resource: time of day, IP address, device type, MFA status, network location.",
    },
    {
      q: "How does ReBAC determine if a user can access a resource?",
      options: [
        "By checking the user's role against a permission matrix",
        "By evaluating attribute-based policy rules",
        "By traversing a relationship graph from the user to the resource",
        "By looking up the user's API key permissions",
      ],
      answerIndex: 2,
      explanation:
        "ReBAC models permissions as relationships in a graph. Access checks traverse edges: user -> group membership -> group viewer of folder -> folder contains document. If a path exists, access is granted.",
    },
  ],
  flashcards: [
    { front: "RBAC: how are permissions determined?", back: "Users are assigned roles. Roles have permissions. Users inherit all permissions from their assigned roles. Access check: does any of the user's roles include the required permission?" },
    { front: "What are the four ABAC attribute categories?", back: "Subject (user properties), Resource (properties of the thing being accessed), Action (what's being done), Environment (contextual factors like time, IP, MFA)." },
    { front: "What is role explosion?", back: "Creating excessive roles in RBAC to express fine-grained contextual policies. For N dimensions with M values each, you need M^N roles. ABAC avoids this by encoding conditions in policies." },
    { front: "What is ReBAC?", back: "Relationship-Based Access Control: permissions modeled as relationships in a graph. Access checks traverse the graph (user -> group -> folder -> document). Google Zanzibar is the canonical example." },
    { front: "OPA vs Cedar vs Casbin?", back: "OPA: general-purpose policy engine, Rego language, CNCF project. Cedar: AWS-backed, designed for fine-grained authorization, Rust-based. Casbin: library-based (not a service), supports multiple policy models, many language ports." },
    { front: "What is the principle of least privilege in access control?", back: "Users should have only the minimum permissions required to perform their job. Grant narrow roles, use ABAC for contextual restrictions, regularly audit and prune unused permissions." },
  ],
  revisionNotes: [
    "RBAC: users -> roles -> permissions. Simple, auditable, but limited for contextual policies.",
    "Role hierarchy: roles inherit from parent roles (viewer < editor < admin). Prevents permission duplication.",
    "Role explosion: too many narrow roles when encoding context (dept + classification + level) into role names.",
    "ABAC: evaluates attributes of subject, resource, action, and environment. Expressive but harder to audit.",
    "PBAC: externalize ABAC policies to a policy engine (OPA, Cedar, Casbin). Separate auth logic from app code.",
    "ReBAC: permissions as relationships in a graph. Traversal determines access. Zanzibar, SpiceDB, OpenFGA.",
    "Hybrid RBAC + ABAC: RBAC for coarse-grained roles, ABAC for fine-grained contextual rules within roles.",
    "Performance: RBAC is O(1), ABAC requires attribute fetching + evaluation, ReBAC requires graph traversal. Cache aggressively.",
  ],
  cheatSheet: [
    "RBAC: user.roles.some(r => rolePermissions[r].includes(action))",
    "ABAC: evaluate(subject, action, resource, environment) -> allow/deny",
    "ReBAC: traverse graph (user, relation, resource) -> reachable?",
    "Role hierarchy: resolve by walking inherits chain, collecting permissions",
    "OPA query: POST /v1/data/authz/allow { input: { subject, action, resource } }",
    "Zanzibar tuple: (object#relation@subject) e.g. doc:readme#editor@user:alice",
    "Default deny: if no policy explicitly allows, access is denied",
    "Principle of least privilege: grant minimum required permissions",
    "Audit: RBAC = list roles; ABAC = simulate policies; ReBAC = trace graph paths",
  ],
  resources: [
    { label: "NIST RBAC Model (SP 800-207)", kind: "docs", note: "The formal NIST standard defining RBAC models: flat, hierarchical, constrained, and symmetric." },
    { label: "Google Zanzibar Paper", kind: "paper", note: "Google's Consistent, Global Authorization System — the canonical ReBAC paper." },
    { label: "Open Policy Agent (OPA) Documentation", kind: "docs", note: "General-purpose policy engine using the Rego language. CNCF graduated project." },
    { label: "AWS Cedar Language Guide", kind: "docs", note: "Policy language designed for fine-grained authorization, used by AWS Verified Permissions." },
    { label: "Casbin Documentation", kind: "docs", note: "Library-based authorization framework supporting RBAC, ABAC, and hybrid models in many languages." },
  ],
  glossary: [
    { term: "RBAC", definition: "Role-Based Access Control: permissions are assigned to roles, roles are assigned to users. Access is determined by the user's roles." },
    { term: "ABAC", definition: "Attribute-Based Access Control: access decisions based on attributes of the subject, resource, action, and environment." },
    { term: "ReBAC", definition: "Relationship-Based Access Control: permissions modeled as relationships in a graph, with access determined by graph traversal." },
    { term: "PBAC", definition: "Policy-Based Access Control: authorization logic externalized to a policy engine that evaluates structured requests against declarative policies." },
    { term: "Role explosion", definition: "The proliferation of narrow, context-specific roles in RBAC when trying to express fine-grained policies that depend on multiple dimensions." },
    { term: "Policy engine", definition: "A service (OPA, Cedar, Casbin) that evaluates authorization requests against declarative policies, separating auth logic from application code." },
    { term: "Zanzibar", definition: "Google's global authorization system implementing ReBAC with relation tuples and graph traversal for consistent, scalable access checks." },
    { term: "Principle of least privilege", definition: "Users should have only the minimum permissions necessary to perform their tasks — no more, no less." },
  ],
  exercises: [
    "Design an **RBAC system** for a content management platform with four roles: *viewer*, *editor*, *moderator*, and *admin*. Define the role hierarchy (inheritance), list permissions for each role, and implement the `hasPermission(user, permission)` function in TypeScript. Then show how adding a rule like *'editors can only edit posts in their own department'* causes **role explosion**.",
    "Implement an **ABAC policy engine** that evaluates the following rule: *'Doctors can view patient records only in their own department, only during business hours (9am-5pm), and only if MFA is verified.'* Define the `Subject`, `Resource`, and `Environment` interfaces. Write the policy evaluation function and test it with scenarios that should be allowed and denied.",
    "You are tasked with modeling **Google Drive-style sharing** permissions. Compare how you would implement *'Alice shared document X with Bob as editor, and Bob shared it with the Engineering group as viewer'* in (a) pure **RBAC**, (b) **ABAC**, and (c) **ReBAC** (Zanzibar-style relation tuples). Which model handles this most naturally, and why?",
    "Write an **OPA Rego policy** that enforces: admins can do anything; users can read resources at or below their clearance level; users can only write resources in their department; and *confidential* resources require MFA. Test the policy with `opa eval` using at least 4 different input scenarios covering allow and deny cases.",
    "An organization has 10 departments, 4 data classification levels, 3 access tiers, and 2 time-based restrictions (business hours / always). Calculate the number of roles needed in a **pure RBAC** approach. Then design an equivalent **hybrid RBAC + ABAC** solution that uses fewer than 10 roles by encoding contextual conditions as ABAC policies.",
  ],
};
