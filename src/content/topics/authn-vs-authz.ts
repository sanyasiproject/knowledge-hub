import type { TopicContent } from "../types";

export const authnVsAuthz: TopicContent = {
  quickSummary: [
    "Authentication (authn) verifies WHO you are — proving your identity through credentials. Authorization (authz) determines WHAT you can do — checking your permissions against a policy.",
    "Authentication factors fall into three categories: knowledge (passwords, PINs), possession (phone, hardware key), and inherence (fingerprint, face). Multi-factor authentication (MFA) combines two or more factors.",
    "Authentication always happens before authorization. You must prove your identity before the system can look up what you're allowed to do.",
  ],
  detailed: [
    "Authentication answers the question 'Who is this user?' It verifies a claimed identity by checking one or more credentials. The simplest form is username + password: the user claims to be 'alice@example.com' and proves it by providing a secret only Alice should know. But passwords alone are weak — they can be phished, guessed, or stolen from breached databases.",
    "The three factors of authentication: (1) Knowledge — something you know (password, PIN, security question). The weakest factor because it can be shared, guessed, or phished. (2) Possession — something you have (phone for SMS/TOTP codes, hardware security key like YubiKey, smart card). Stronger because an attacker needs physical access. (3) Inherence — something you are (fingerprint, facial recognition, iris scan, voice). Convenient but not revocable — you can't change your fingerprint if it's compromised.",
    "Multi-factor authentication (MFA) requires credentials from at least two different factor categories. Password + TOTP code is true MFA (knowledge + possession). Password + security question is NOT MFA — both are knowledge factors. The strongest MFA combines all three factors, but two-factor is the practical standard. FIDO2/WebAuthn with hardware keys is currently the gold standard — it's phishing-resistant because the key is bound to the origin.",
    "Authorization answers 'What is this user allowed to do?' After authentication confirms identity, the authorization system checks the user's permissions. This can be as simple as a role check (if user.role === 'admin') or as complex as a policy engine evaluating attributes (the user's department, the resource's classification, the current time, the request's IP). Authorization is the enforcement of access control policies.",
    "Single Sign-On (SSO) is an authentication pattern where a single identity provider (IdP) handles authentication for multiple applications. The user authenticates once with the IdP and receives tokens that grant access to all connected applications without re-entering credentials. SAML and OIDC are the two main SSO protocols. SSO improves UX (one login for everything) and security (one password to manage, centralized MFA enforcement, immediate access revocation across all apps).",
    "Common authentication flows: (1) Form-based: user submits credentials to the app, which verifies them and creates a session. (2) Token-based: app issues a JWT after verifying credentials; client sends the token with each request. (3) SSO/Federated: app redirects to an IdP (Google, Okta, Auth0), which authenticates the user and redirects back with a token. (4) Passwordless: magic links via email, WebAuthn with biometrics, or SMS codes — no password at all.",
  ],
  deepDive: [
    "The distinction between authn and authz maps to different system components. Authentication is typically handled by a dedicated identity service (Auth0, Okta, Cognito, Keycloak) or the app's auth module. Authorization is handled by middleware, policy engines (OPA, Cedar, Casbin), or application-level checks. In microservice architectures, authentication usually happens at the API gateway, while authorization happens within each service (because each service knows its own resources and permissions).",
    "Credential storage security: never store plaintext passwords. Use adaptive hashing algorithms: bcrypt (cost factor 10-12), scrypt, or Argon2id (the current recommendation — resistant to both GPU and memory-constrained attacks). Salt is generated per-password and stored alongside the hash. Pepper is a server-side secret added before hashing for an extra layer — if the database is stolen, the attacker also needs the pepper.",
    "Step-up authentication: some sensitive operations require re-authentication even within an active session. Changing your password, making a large transfer, or accessing admin settings might require the user to re-enter their password or complete an MFA challenge, even though they're already logged in. This limits the blast radius of session hijacking.",
    "Zero Trust architecture blurs the authn/authz line: every request is authenticated and authorized, regardless of network position. There's no implicit trust based on being 'inside the network.' Each API call carries identity proof (mTLS certificates, signed tokens) and is authorized against fine-grained policies. This is the modern security model replacing perimeter-based security.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Authentication middleware: verifying identity",
      source: `import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; roles: string[] };
}

// Authentication: WHO is this?
function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
    // 401 Unauthorized = "I don't know who you are"
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
      algorithms: ["RS256"],
      issuer: "auth.example.com",
    }) as { sub: string; email: string; roles: string[] };

    req.user = { id: payload.sub, email: payload.email, roles: payload.roles };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Authorization: WHAT can they do?
function authorize(...requiredRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasRole = requiredRoles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
      // 403 Forbidden = "I know who you are, but you can't do this"
    }

    next();
  };
}

// Usage: authentication runs first, then authorization
app.get("/admin/users",
  authenticate,               // Step 1: Who is this?
  authorize("admin", "superadmin"), // Step 2: Can they access this?
  (req, res) => { /* handler */ }
);`,
    },
    {
      language: "typescript",
      caption: "Password hashing with Argon2id",
      source: `import argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,    // Hybrid: resistant to GPU + side-channel attacks
    memoryCost: 65536,        // 64 MB memory
    timeCost: 3,              // 3 iterations
    parallelism: 4,           // 4 threads
  });
  // Returns: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false; // Invalid hash format
  }
}

// Registration
async function registerUser(email: string, password: string) {
  // Validate password strength BEFORE hashing
  if (password.length < 12) throw new Error("Password too short");

  const hash = await hashPassword(password);
  await db.users.create({ email, passwordHash: hash });
}

// Login (authentication)
async function loginUser(email: string, password: string) {
  const user = await db.users.findByEmail(email);
  // Always hash-check even if user not found (prevents timing attacks)
  const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$dummysalt$dummyhash";
  const valid = await verifyPassword(password, user?.passwordHash || dummyHash);

  if (!user || !valid) {
    throw new Error("Invalid email or password"); // Same message for both
  }

  return generateTokens(user);
}`,
    },
    {
      language: "typescript",
      caption: "TOTP (Time-Based One-Time Password) verification for MFA",
      source: `import { authenticator } from "otplib";

// During MFA setup: generate secret and QR code
function setupMFA(userId: string) {
  const secret = authenticator.generateSecret();
  // Store secret encrypted in DB, associated with user
  // Generate QR code URL for authenticator apps
  const otpauthUrl = authenticator.keyuri(userId, "MyApp", secret);
  return { secret, otpauthUrl };
}

// During login: verify TOTP code (possession factor)
function verifyMFA(secret: string, userCode: string): boolean {
  return authenticator.verify({ token: userCode, secret });
  // Checks current time window and +/- 1 window for clock skew
}

// Login flow with MFA
async function loginWithMFA(email: string, password: string, totpCode?: string) {
  // Step 1: Verify password (knowledge factor)
  const user = await verifyCredentials(email, password);

  if (user.mfaEnabled) {
    if (!totpCode) {
      // Return partial auth — client must prompt for TOTP
      return { requiresMFA: true, tempToken: createTempToken(user.id) };
    }
    // Step 2: Verify TOTP (possession factor)
    if (!verifyMFA(user.mfaSecret, totpCode)) {
      throw new Error("Invalid MFA code");
    }
  }

  return { tokens: generateTokens(user) };
}`,
    },
  ],
  diagrams: [
    {
      title: "Authentication vs Authorization Flow",
      kind: "sequence",
      caption:
        "Client sends credentials to the auth service (authentication). The auth service returns a token with identity claims. On subsequent requests, the API verifies the token (authentication) then checks permissions (authorization).",
    },
    {
      title: "Multi-Factor Authentication Flow",
      kind: "flow",
      caption:
        "User provides password (knowledge factor), then receives a challenge for a second factor — TOTP code from an authenticator app (possession) or biometric scan (inherence). Both must pass for authentication to succeed.",
    },
    {
      title: "SSO with OIDC",
      kind: "sequence",
      caption:
        "User visits App A, is redirected to the IdP, authenticates once, receives tokens, and is redirected back. When visiting App B, the IdP recognizes the existing session and issues tokens without re-authentication.",
    },
  ],
  animations: [
    {
      title: "Authentication Then Authorization",
      steps: [
        { label: "Request arrives", detail: "Client sends GET /api/admin/reports with a Bearer token in the Authorization header." },
        { label: "Authentication check", detail: "Middleware extracts the token, verifies the signature and expiration. This answers: WHO is making this request? Result: user alice@example.com with roles ['editor']." },
        { label: "Authorization check", detail: "Route requires role 'admin'. Middleware checks if alice's roles include 'admin'. They don't — she's only an 'editor'." },
        { label: "403 Forbidden", detail: "The server returns 403 (not 401). It knows WHO alice is (authenticated), but she doesn't have permission (not authorized). The response says 'Insufficient permissions' without revealing what roles are required." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Authentication (AuthN)", "Authorization (AuthZ)"],
    rows: [
      ["Question answered", "Who are you?", "What can you do?"],
      ["Input", "Credentials (password, token, biometric)", "Identity + resource + action"],
      ["Output", "Identity (user ID, claims)", "Allow or deny decision"],
      ["HTTP error code", "401 Unauthorized", "403 Forbidden"],
      ["When it happens", "First — before authorization", "Second — after authentication"],
      ["Handled by", "Identity provider (IdP), auth service", "Policy engine, middleware, app logic"],
      ["Protocols", "OIDC, SAML, FIDO2/WebAuthn", "OAuth 2.0 scopes, RBAC, ABAC, OPA"],
      ["Can be centralized?", "Yes — SSO, IdP", "Partially — policy engine, but needs per-service context"],
    ],
  },
  interviewQA: [
    {
      q: "What's the difference between 401 and 403 HTTP status codes?",
      a: "401 Unauthorized means authentication failed — the server doesn't know who you are (missing or invalid credentials). 403 Forbidden means authentication succeeded but authorization failed — the server knows who you are but you don't have permission. Despite the misleading name, 401 is about authentication, not authorization.",
      followUps: [
        "Should the 403 response reveal why the request was denied?",
        "When would you return 404 instead of 403?",
      ],
    },
    {
      q: "Why is SMS-based MFA considered less secure than TOTP or hardware keys?",
      a: "SMS is vulnerable to SIM swapping (attacker convinces the carrier to transfer your number), SS7 protocol attacks (intercepting messages at the network level), and social engineering. TOTP codes are generated on-device and never transmitted. Hardware keys (FIDO2/WebAuthn) are phishing-resistant because they're cryptographically bound to the origin — a fake login page on a different domain can't use the key.",
    },
    {
      q: "How does passwordless authentication work?",
      a: "Passwordless eliminates the knowledge factor entirely. Common approaches: (1) Magic links — a time-limited, single-use URL sent via email. (2) WebAuthn — the device's biometric sensor or hardware key creates a public-private key pair bound to the origin. The server stores only the public key. (3) Passkeys — WebAuthn credentials synced across devices via cloud (iCloud Keychain, Google Password Manager). All of these are phishing-resistant because there's no password to phish.",
    },
    {
      q: "In a microservice architecture, where should authentication and authorization happen?",
      a: "Authentication should happen at the API gateway — one place to verify tokens, enforce MFA, and reject unauthenticated requests. The gateway passes the verified identity (user ID, roles) to downstream services via headers or a propagated token. Authorization should happen within each service, because each service understands its own resources and permission model. The gateway might do coarse-grained authz (is the user active?), but fine-grained checks (can this user edit THIS document?) must happen in the service that owns the resource.",
    },
  ],
  mcqs: [
    {
      q: "Which combination represents true multi-factor authentication?",
      options: [
        "Password + security question",
        "Password + TOTP code from authenticator app",
        "Fingerprint + facial recognition",
        "Two different passwords",
      ],
      answerIndex: 1,
      explanation:
        "True MFA requires factors from different categories. Password (knowledge) + TOTP (possession) spans two categories. Password + security question are both knowledge. Fingerprint + face are both inherence.",
    },
    {
      q: "A request is authenticated but returns 403. What does this mean?",
      options: [
        "The credentials are invalid",
        "The token has expired",
        "The user's identity is verified but they lack permission",
        "The server encountered an error",
      ],
      answerIndex: 2,
      explanation:
        "403 Forbidden means authentication succeeded (the server knows who you are) but authorization failed (you don't have the required permissions for this resource or action).",
    },
    {
      q: "Why should you use Argon2id over bcrypt for password hashing?",
      options: [
        "Argon2id is faster",
        "Argon2id is memory-hard, making GPU-based attacks more expensive",
        "Bcrypt doesn't support salting",
        "Argon2id produces shorter hashes",
      ],
      answerIndex: 1,
      explanation:
        "Argon2id is memory-hard (requires significant RAM per hash), making it resistant to GPU and ASIC attacks that rely on parallel computation. Bcrypt is CPU-hard but not memory-hard, making it more vulnerable to specialized hardware attacks.",
    },
  ],
  flashcards: [
    { front: "What are the three factors of authentication?", back: "Knowledge (something you know — password, PIN), Possession (something you have — phone, hardware key), Inherence (something you are — fingerprint, face)." },
    { front: "401 vs 403?", back: "401 = authentication failure (who are you?). 403 = authorization failure (you can't do that). 401 means unknown identity; 403 means known identity, insufficient permissions." },
    { front: "What makes FIDO2/WebAuthn phishing-resistant?", back: "The cryptographic key is bound to the origin (domain). A fake login page on a different domain cannot trigger the key. There is no secret to type, copy, or share." },
    { front: "What is step-up authentication?", back: "Requiring additional authentication (re-enter password, MFA challenge) for sensitive operations within an already-authenticated session, like changing passwords or initiating transfers." },
    { front: "What is the difference between SSO and MFA?", back: "SSO = one authentication grants access to multiple applications. MFA = one authentication requires multiple proof factors. They're orthogonal — you can have SSO with MFA (authenticate once with multiple factors, access many apps)." },
  ],
  revisionNotes: [
    "AuthN = who are you (identity). AuthZ = what can you do (permissions). AuthN always comes first.",
    "Three factors: knowledge (password), possession (phone/key), inherence (biometric).",
    "MFA requires factors from different categories — two passwords is not MFA.",
    "401 = unknown identity. 403 = known identity, denied permission.",
    "Passwords: hash with Argon2id (memory-hard), never store plaintext, use per-password salts.",
    "SSO: authenticate once with IdP, access multiple apps. Protocols: SAML, OIDC.",
    "WebAuthn/FIDO2/Passkeys: phishing-resistant, origin-bound, no shared secret.",
    "Microservices: authn at the gateway, authz within each service.",
  ],
  cheatSheet: [
    "AuthN -> 401 on failure | AuthZ -> 403 on failure",
    "MFA = 2+ factors from DIFFERENT categories (knowledge, possession, inherence)",
    "Hash passwords: Argon2id > scrypt > bcrypt > PBKDF2 (never MD5/SHA)",
    "FIDO2/WebAuthn = phishing-resistant (origin-bound cryptographic key)",
    "SSO protocols: OIDC (modern, JSON/JWT) vs SAML (enterprise, XML)",
    "Gateway handles authn, services handle authz",
    "Step-up auth: re-authenticate for sensitive operations within a session",
    "Timing-safe comparison for password verification (prevent timing attacks)",
  ],
  resources: [
    { label: "OWASP Authentication Cheat Sheet", kind: "docs", note: "Comprehensive guide to authentication best practices including password storage and MFA." },
    { label: "NIST SP 800-63B: Digital Identity Guidelines", kind: "docs", note: "US government standard for authentication assurance levels and authenticator requirements." },
    { label: "WebAuthn Guide (webauthn.guide)", kind: "article", note: "Interactive guide to implementing WebAuthn/FIDO2 passwordless authentication." },
    { label: "Auth0 Identity Fundamentals", kind: "docs", note: "Clear explanations of authentication vs authorization, SSO, MFA, and token-based auth." },
  ],
  glossary: [
    { term: "Authentication (AuthN)", definition: "The process of verifying a user's identity — confirming they are who they claim to be." },
    { term: "Authorization (AuthZ)", definition: "The process of determining what an authenticated user is allowed to do — checking permissions and access rights." },
    { term: "MFA", definition: "Multi-factor authentication: requiring two or more authentication factors from different categories (knowledge, possession, inherence)." },
    { term: "SSO", definition: "Single Sign-On: authenticating once with an identity provider to access multiple applications without re-entering credentials." },
    { term: "FIDO2/WebAuthn", definition: "Phishing-resistant authentication standard using origin-bound public-key cryptography, typically with hardware keys or biometric sensors." },
    { term: "Argon2id", definition: "Recommended password hashing algorithm that is both CPU-hard and memory-hard, resistant to GPU and side-channel attacks." },
    { term: "Step-up authentication", definition: "Requiring additional authentication proof for sensitive operations within an already-authenticated session." },
  ],

  exercises: [
    "Design an **authentication flow** for a banking application that supports *three login methods*: password + TOTP, passwordless via WebAuthn, and magic link via email. For each method, identify which **authentication factors** are involved and classify them. Which method is most *phishing-resistant* and why?",
    "You are building a **microservices architecture** with an API gateway, a user service, an order service, and a payment service. Draw out where *authentication* and *authorization* happen. The payment service requires **step-up authentication** for transfers over $1,000. How do you propagate the user's identity and permission context across service boundaries using `JWTs`?",
    "Implement a simple **RBAC (Role-Based Access Control)** system in C++ that supports *users*, *roles*, and *permissions*. Define a `class AuthorizationEngine` with methods `bool hasPermission(userId, resource, action)` and `void assignRole(userId, role)`. How would you extend this to **ABAC** (Attribute-Based Access Control) to support rules like *\"managers can approve expenses under $5,000 during business hours\"*?",
    "A penetration tester discovers that your login endpoint returns *\"Invalid password\"* for existing users and *\"User not found\"* for non-existent users. Explain the **security vulnerability** this creates (user enumeration), then fix the login flow. Additionally, explain why you should use a **timing-safe comparison** (e.g., `crypto.timingSafeEqual`) when verifying password hashes.",
    "Compare **SAML 2.0** and **OpenID Connect (OIDC)** for implementing SSO in an enterprise with 50 internal applications. Consider: token format (`XML` vs `JWT`), flow complexity, mobile support, and ease of implementation. When would you choose one over the other? How does each handle *single logout* (SLO)?"
  ],
};
