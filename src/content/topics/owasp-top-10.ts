import type { TopicContent } from "../types";

export const owaspTop10: TopicContent = {
  quickSummary: [
    "The OWASP Top 10 is a regularly updated list of the most critical web application security risks, serving as an industry-standard awareness document for developers and security teams.",
    "The 2021 edition introduced new categories like Insecure Design (A04) and Software and Data Integrity Failures (A08), reflecting the shift toward proactive security architecture rather than just patching vulnerabilities.",
    "Injection (now part of A03) remains a persistent threat, while Broken Access Control (A01) rose to the top position, indicating that authorization flaws are the most commonly exploited weakness in modern applications.",
    "Each category includes attack scenarios, prevention strategies, and references to CWEs (Common Weakness Enumerations), making it actionable for both development and security audit processes.",
  ],
  detailed: [
    `## A01: Broken Access Control

Broken access control is the most critical web security risk. It occurs when users can act outside their intended permissions.

**Common vulnerabilities:**
- Bypassing access checks by modifying URLs, internal state, or API requests
- Allowing viewing or editing of other users' data by tampering with primary keys (IDOR — Insecure Direct Object References)
- Elevation of privilege — acting as admin without being logged in, or as admin when logged in as a regular user
- Metadata manipulation such as tampering with JWTs, cookies, or hidden fields
- CORS misconfiguration allowing unauthorized API access from untrusted origins

**Prevention:**
- Deny by default — every endpoint requires explicit authorization
- Implement access control once and reuse throughout the application via middleware
- Enforce record ownership — users can only CRUD their own records unless explicitly allowed otherwise
- Disable directory listing and ensure metadata/backup files are not in web roots
- Log access control failures and alert administrators
- Rate-limit API and controller access to minimize automated attack damage`,

    `## A02-A03: Cryptographic Failures and Injection

**A02: Cryptographic Failures** (formerly Sensitive Data Exposure) focuses on failures related to cryptography that lead to exposure of sensitive data.

Key issues: transmitting data in cleartext (HTTP, SMTP, FTP), using deprecated algorithms (MD5, SHA1, DES), weak key generation, missing certificate validation, not enforcing encryption via headers like HSTS.

Prevention: classify data by sensitivity, don't store sensitive data unnecessarily, encrypt at rest and in transit, use strong algorithms (AES-256, RSA-2048+), enforce TLS with HSTS, use authenticated encryption.

**A03: Injection** covers SQL injection, NoSQL injection, OS command injection, LDAP injection, and XSS (cross-site scripting, now merged here).

An application is vulnerable when user-supplied data is not validated, filtered, or sanitized, and when dynamic queries are constructed with string concatenation.

Prevention: use parameterized queries or ORMs, validate and sanitize all input, escape output for the target context (HTML, JS, SQL), use LIMIT and other SQL controls to prevent mass data disclosure.`,

    `## A04-A06: Insecure Design, Misconfiguration, Vulnerable Components

**A04: Insecure Design** is a new category focusing on risks related to design and architectural flaws. Unlike implementation bugs, these cannot be fixed by perfect coding — they require threat modeling, secure design patterns, and reference architectures.

Examples: missing rate limiting on authentication, not applying the principle of least privilege in data flow, business logic that can be abused when steps are skipped.

**A05: Security Misconfiguration** covers improperly configured permissions, unnecessary features enabled, default accounts unchanged, overly informative error messages, and missing security headers.

Prevention: a repeatable hardening process, minimal platform (remove unused features), automated configuration verification, segmented architecture, sending security directives (CSP, X-Frame-Options).

**A06: Vulnerable and Outdated Components** addresses using libraries, frameworks, or other software modules with known vulnerabilities.

Prevention: remove unused dependencies, continuously inventory component versions, monitor CVE databases and security advisories, obtain components only from official sources, automate scanning with tools like Dependabot, Snyk, or OWASP Dependency-Check.`,

    `## A07-A08: Authentication Failures and Integrity Failures

**A07: Identification and Authentication Failures** (formerly Broken Authentication) covers weaknesses in authentication mechanisms.

Vulnerabilities: permitting credential stuffing or brute force, allowing weak passwords, improper session management (session IDs in URLs, no rotation after login), missing or ineffective MFA.

Prevention: implement MFA, enforce strong password policies, limit failed login attempts with progressive delays, use secure session management with random high-entropy session IDs, and follow NIST 800-63 guidelines.

**A08: Software and Data Integrity Failures** is a new category covering code and infrastructure that does not protect against integrity violations.

Examples: auto-update functionality that downloads updates without verification, insecure deserialization of untrusted data, CI/CD pipelines without integrity verification, applications relying on untrusted CDN sources without Subresource Integrity (SRI).

Prevention: use digital signatures to verify software/data integrity, ensure libraries are consumed from trusted repositories, use SRI for third-party resources, review CI/CD pipeline configurations for unauthorized modifications.`,

    `## A09-A10: Logging Failures and SSRF

**A09: Security Logging and Monitoring Failures** — insufficient logging, detection, monitoring, and active response allows attackers to persist, pivot, and extract data undetected. Breaches take an average of 200+ days to detect, usually by external parties rather than internal monitoring.

Prevention: log all login, access control, and server-side input validation failures with sufficient context for forensics. Ensure logs are in a format that log management solutions can consume. Establish effective monitoring and alerting, and create an incident response plan.

**A10: Server-Side Request Forgery (SSRF)** occurs when a web application fetches a remote resource without validating the user-supplied URL.

Attack scenarios: accessing internal services (\`http://localhost:8080/admin\`), reading cloud metadata (\`http://169.254.169.254/latest/meta-data/\`), scanning internal networks, or bypassing firewalls.

Prevention: sanitize and validate all client-supplied URLs, enforce allow-lists for permitted URL schemes and destinations, disable HTTP redirections, do not send raw responses to clients, segment remote resource access functionality in separate networks.`,
  ],
  interviewQA: [
    {
      q: "Why did Broken Access Control move to the number one position in the 2021 OWASP Top 10?",
      a: "Broken Access Control rose to A01 because data showed it had the highest incidence rate among tested applications — 94% of apps were tested for some form of broken access control and 3.81% had occurrences. This reflects that while injection and XSS have well-known automated prevention tools (parameterized queries, output encoding), access control is inherently application-specific and harder to automate. Each endpoint needs custom authorization logic, and developers frequently miss edge cases like IDOR, horizontal privilege escalation, and missing function-level access controls.",
    },
    {
      q: "What is the difference between Insecure Design (A04) and Security Misconfiguration (A05)?",
      a: "Insecure Design refers to fundamental architectural flaws — missing threat modeling, inadequate security requirements, or business logic that is inherently vulnerable. A perfectly implemented insecure design is still insecure. Security Misconfiguration refers to a secure design that is improperly deployed — default credentials, unnecessary services enabled, missing security headers, verbose error messages. The distinction matters: insecure design requires redesign, while misconfiguration requires proper deployment and hardening processes.",
    },
    {
      q: "How would you prevent Server-Side Request Forgery (SSRF)?",
      a: "Defense in depth: validate and sanitize all user-supplied URLs against an allow-list of permitted schemes (https only), hosts, and ports. Block requests to private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x) and link-local addresses. Disable HTTP redirects to prevent allow-list bypass. Run the fetching service in an isolated network segment with no access to internal services. Don't return raw responses to users. On cloud platforms, use IMDSv2 (requires session tokens) instead of IMDSv1 to protect metadata endpoints.",
    },
    {
      q: "What is Insecure Direct Object Reference (IDOR) and how do you prevent it?",
      a: "IDOR occurs when an application exposes internal object references (database IDs, filenames) in URLs or parameters, and fails to verify that the requesting user is authorized to access that specific object. For example, changing /api/invoices/1234 to /api/invoices/1235 to access another user's invoice. Prevention: always verify object ownership/authorization server-side, use indirect references (mapping user-visible IDs to internal ones), implement per-object access control checks in a reusable middleware layer, and avoid exposing sequential or predictable identifiers.",
    },
  ],
  mcqs: [
    {
      q: "Which vulnerability is ranked A01 (most critical) in the OWASP Top 10 2021?",
      options: [
        "Injection",
        "Broken Access Control",
        "Cryptographic Failures",
        "Security Misconfiguration",
      ],
      answerIndex: 1,
      explanation:
        "Broken Access Control moved from A05 in 2017 to A01 in 2021, reflecting the high incidence of authorization flaws across tested applications.",
    },
    {
      q: "Which category was NEW in the OWASP Top 10 2021 edition?",
      options: [
        "Injection",
        "Insecure Design",
        "Broken Authentication",
        "Cross-Site Scripting",
      ],
      answerIndex: 1,
      explanation:
        "Insecure Design (A04) was introduced in 2021 as a new category focusing on architectural and design-level security flaws, distinct from implementation bugs.",
    },
    {
      q: "What is the primary defense against SQL injection?",
      options: [
        "Input length validation",
        "Web Application Firewall",
        "Parameterized queries / prepared statements",
        "HTTPS encryption",
      ],
      answerIndex: 2,
      explanation:
        "Parameterized queries (prepared statements) separate SQL code from data, making it impossible for user input to alter the query structure. WAFs and validation are defense-in-depth measures, not primary defenses.",
    },
    {
      q: "What internal address is commonly targeted in SSRF attacks on cloud platforms?",
      options: [
        "10.0.0.1",
        "169.254.169.254",
        "192.168.1.1",
        "127.0.0.1",
      ],
      answerIndex: 1,
      explanation:
        "169.254.169.254 is the cloud metadata endpoint (AWS, GCP, Azure) that SSRF attacks target to steal IAM credentials, API keys, and other sensitive instance metadata.",
    },
  ],
  flashcards: [
    {
      front: "What is the OWASP Top 10?",
      back: "A regularly updated awareness document listing the 10 most critical web application security risks, maintained by the Open Web Application Security Project. The latest edition (2021) serves as an industry standard for security training and audit checklists.",
    },
    {
      front: "What is Insecure Direct Object Reference (IDOR)?",
      back: "A broken access control vulnerability where an application uses user-controllable input (like database IDs) to directly access objects without verifying authorization. Changing /api/orders/123 to /api/orders/124 accesses another user's order.",
    },
    {
      front: "What is Server-Side Request Forgery (SSRF)?",
      back: "An attack where the attacker tricks the server into making HTTP requests to arbitrary URLs, potentially accessing internal services (localhost, metadata endpoints) or scanning internal networks that are not accessible from the outside.",
    },
    {
      front: "What is Subresource Integrity (SRI)?",
      back: "A security feature that allows browsers to verify that files fetched from CDNs haven't been tampered with, by checking a cryptographic hash in the integrity attribute of script/link tags. Part of A08 (Software and Data Integrity Failures) prevention.",
    },
    {
      front: "What distinguishes A04 (Insecure Design) from implementation bugs?",
      back: "Insecure design means the architecture itself is flawed — no amount of perfect coding fixes a missing threat model or inadequate security requirements. Implementation bugs are coding errors in an otherwise sound design.",
    },
    {
      front: "What is credential stuffing?",
      back: "An attack that uses lists of known username/password pairs (from previous breaches) to attempt logins on other services, exploiting password reuse. Prevented by MFA, rate limiting, breach password detection, and CAPTCHA.",
    },
    {
      front: "What are the OWASP Top 10 2021 categories in order?",
      back: "A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfiguration, A06: Vulnerable Components, A07: Auth Failures, A08: Integrity Failures, A09: Logging Failures, A10: SSRF.",
    },
  ],
  deepDive: [
    `## The Evolution of Web Security Threats and the OWASP Top 10

The **OWASP Top 10** has undergone significant transformations since its inception in 2003, reflecting the ever-changing landscape of web application security. The 2021 edition represents a *paradigm shift* from reactive vulnerability patching to **proactive secure design**. The introduction of *A04: Insecure Design* acknowledges that many security failures originate not from coding mistakes but from **fundamental architectural oversights** — missing threat models, inadequate security requirements, and business logic that fails to account for adversarial behavior. This evolution mirrors the industry's growing understanding that security must be embedded into the *software development lifecycle (SDLC)* from the earliest design phases, not bolted on as an afterthought. The consolidation of XSS into the broader *Injection* category (A03) further reflects a mature understanding that **all injection attacks share the same root cause**: untrusted data crossing a trust boundary without proper validation or encoding.`,

    `## Attack Surface Analysis and Defense-in-Depth

Modern web applications expose a vastly expanded **attack surface** compared to their predecessors. Microservices architectures introduce *inter-service communication channels* that can be exploited via **SSRF** (A10), while third-party dependencies create supply chain risks addressed by *A06: Vulnerable and Outdated Components* and *A08: Software and Data Integrity Failures*. A robust defense strategy requires **defense-in-depth** — layering multiple security controls so that the failure of any single control does not compromise the entire system. For example, protecting against \`SQL injection\` involves not just *parameterized queries* (primary defense) but also **input validation**, \`least-privilege database accounts\`, **Web Application Firewalls (WAFs)**, and \`output encoding\`. Each layer catches attacks that might slip through the others. The principle of **least privilege** applies at every tier: database connections should use accounts with *minimal necessary permissions*, API endpoints should enforce **role-based access control (RBAC)**, and network segmentation should isolate sensitive services from public-facing components.`,

    `## Implementing Security at Scale: Automation and Culture

Addressing the OWASP Top 10 at enterprise scale requires a combination of **automated tooling** and *cultural transformation*. Static Application Security Testing (**SAST**) tools analyze source code for vulnerabilities like \`injection flaws\` and \`hardcoded credentials\` during the build phase. Dynamic Application Security Testing (**DAST**) tools probe running applications for misconfigurations (A05), broken access controls (A01), and authentication weaknesses (A07). Software Composition Analysis (**SCA**) tools continuously monitor dependencies for known CVEs, addressing *A06*. However, tools alone are insufficient — organizations must cultivate a **security-first culture** through regular *threat modeling workshops*, **security champions programs** (embedding security-aware developers in each team), and *continuous security training* aligned with the OWASP Top 10 categories. The shift-left movement emphasizes catching vulnerabilities early: a flaw found during **design review** costs orders of magnitude less to fix than one discovered in *production*. Metrics such as \`mean time to remediate (MTTR)\`, *vulnerability density per release*, and **security debt ratio** help organizations track their progress and hold teams accountable.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Buffer overflow prevention using safe string handling in C++",
      source: `// VULNERABLE: Buffer overflow via unsafe string copy
#include <cstring>
#include <iostream>
#include <string>
#include <array>

void vulnerable_login(const char* user_input) {
    char buffer[64];
    // DANGER: No bounds checking — classic buffer overflow (CWE-120)
    strcpy(buffer, user_input);
    std::cout << "Processing: " << buffer << std::endl;
}

// SECURE: Using std::string and bounds-checked operations
void secure_login(const std::string& user_input) {
    // std::string manages memory automatically — no overflow possible
    constexpr size_t MAX_USERNAME_LENGTH = 64;

    if (user_input.length() > MAX_USERNAME_LENGTH) {
        std::cerr << "Error: Input exceeds maximum length" << std::endl;
        return;
    }

    // Use std::array for fixed-size buffers when needed
    std::array<char, 65> buffer{};
    std::strncpy(buffer.data(), user_input.c_str(), buffer.size() - 1);
    buffer[buffer.size() - 1] = '\\0'; // Guarantee null termination

    std::cout << "Processing: " << buffer.data() << std::endl;
}

// SECURE: Input validation with allowlist pattern
bool validate_input(const std::string& input) {
    // Only allow alphanumeric characters, hyphens, and underscores
    for (char c : input) {
        if (!std::isalnum(static_cast<unsigned char>(c))
            && c != '-' && c != '_') {
            return false;
        }
    }
    return !input.empty() && input.length() <= 64;
}`,
    },
    {
      language: "typescript",
      caption: "XSS prevention in Node.js/Express with output encoding and CSP",
      source: `import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { escape as escapeHtml } from "lodash";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const app = express();
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

// --- Helmet sets security headers including CSP ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],          // No 'unsafe-inline' or 'unsafe-eval'
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],           // Prevent clickjacking
        objectSrc: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// --- VULNERABLE: Reflected XSS ---
app.get("/search-unsafe", (req: Request, res: Response) => {
  const query = req.query.q as string;
  // DANGER: User input injected directly into HTML
  res.send(\`<h1>Results for: \${query}</h1>\`);
});

// --- SECURE: Output encoding prevents XSS ---
app.get("/search-safe", (req: Request, res: Response) => {
  const query = req.query.q as string;
  // escapeHtml converts <, >, &, ", ' to HTML entities
  const safeQuery = escapeHtml(query);
  res.send(\`<h1>Results for: \${safeQuery}</h1>\`);
});

// --- SECURE: Sanitize rich HTML content ---
app.post("/comment", express.json(), (req: Request, res: Response) => {
  const userHtml = req.body.content as string;
  // DOMPurify strips dangerous tags/attributes, keeps safe HTML
  const cleanHtml = DOMPurify.sanitize(userHtml, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
  });
  res.json({ sanitized: cleanHtml });
});`,
    },
    {
      language: "typescript",
      caption: "CSRF protection in Node.js/Express using double-submit cookie pattern",
      source: `import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- Generate a cryptographically random CSRF token ---
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// --- Middleware: Set CSRF token cookie on every GET request ---
function setCsrfCookie(req: Request, res: Response, next: NextFunction): void {
  if (req.method === "GET") {
    const token = generateCsrfToken();
    res.cookie("csrf_token", token, {
      httpOnly: false,    // JS must read it to send in header
      secure: true,       // HTTPS only
      sameSite: "strict", // Prevents cross-origin cookie sending
      maxAge: 3600000,    // 1 hour
    });
  }
  next();
}

// --- Middleware: Validate CSRF token on state-changing requests ---
function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const cookieToken = req.cookies["csrf_token"];
    const headerToken = req.headers["x-csrf-token"] as string;

    if (!cookieToken || !headerToken) {
      res.status(403).json({ error: "CSRF token missing" });
      return;
    }

    // Timing-safe comparison prevents timing attacks
    const cookieBuf = Buffer.from(cookieToken);
    const headerBuf = Buffer.from(headerToken);
    if (
      cookieBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      res.status(403).json({ error: "CSRF token mismatch" });
      return;
    }
  }
  next();
}

app.use(setCsrfCookie);
app.use(validateCsrf);

// --- Protected endpoint ---
app.post("/api/transfer", (req: Request, res: Response) => {
  // Only reachable if CSRF validation passes
  const { to, amount } = req.body;
  res.json({ status: "Transfer initiated", to, amount });
});

// Client-side usage:
// const csrfToken = document.cookie
//   .split("; ")
//   .find(row => row.startsWith("csrf_token="))
//   ?.split("=")[1];
// fetch("/api/transfer", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "X-CSRF-Token": csrfToken,
//   },
//   body: JSON.stringify({ to: "user@example.com", amount: 100 }),
// });`,
    },
  ],
  diagrams: [
    {
      title: "OWASP Top 10 2021 Category Hierarchy",
      kind: "mindmap",
      caption: "Visual breakdown of all 10 OWASP categories with key sub-topics",
      mermaid: `mindmap
  root((OWASP Top 10\\n2021))
    A01: Broken Access Control
      IDOR
      Privilege Escalation
      CORS Misconfiguration
      Missing Function-Level Checks
    A02: Cryptographic Failures
      Cleartext Transmission
      Weak Algorithms
      Missing Encryption at Rest
    A03: Injection
      SQL Injection
      XSS
      Command Injection
      NoSQL Injection
    A04: Insecure Design
      Missing Threat Modeling
      Insufficient Security Requirements
      Broken Business Logic
    A05: Security Misconfiguration
      Default Credentials
      Verbose Errors
      Missing Security Headers
    A06: Vulnerable Components
      Outdated Libraries
      Unpatched Frameworks
      Supply Chain Risks
    A07: Auth Failures
      Credential Stuffing
      Weak Passwords
      Session Fixation
    A08: Integrity Failures
      Insecure Deserialization
      Unsigned Updates
      CI/CD Tampering
    A09: Logging Failures
      Missing Audit Trails
      No Alerting
      Insufficient Context
    A10: SSRF
      Cloud Metadata Access
      Internal Port Scanning
      Firewall Bypass`,
    },
    {
      title: "Web Application Attack and Defense Flow",
      kind: "flow",
      caption: "How an attacker exploits vulnerabilities and where defenses intercept the attack",
      mermaid: `flowchart TD
    A[Attacker] -->|Crafted Request| B{WAF / Rate Limiter}
    B -->|Blocked| Z[Request Denied]
    B -->|Passed| C{Input Validation}
    C -->|Invalid Input| Z
    C -->|Valid Input| D{Authentication}
    D -->|Auth Failed| Z
    D -->|Authenticated| E{Authorization / RBAC}
    E -->|Unauthorized| Z
    E -->|Authorized| F[Application Logic]
    F -->|Parameterized Query| G[(Database)]
    F -->|Output Encoding| H[Response to User]
    F -->|Sanitized URL| I[External Service]
    G -->|Data| F
    I -->|Response Filtered| F
    H -->|CSP Headers Set| J[Browser Renders Safely]

    style Z fill:#ff6b6b,color:#fff
    style J fill:#51cf66,color:#fff
    style B fill:#ffd43b,color:#000
    style C fill:#ffd43b,color:#000
    style D fill:#74c0fc,color:#000
    style E fill:#74c0fc,color:#000`,
    },
    {
      title: "Secure Authentication Sequence",
      kind: "sequence",
      caption: "Sequence diagram showing secure login with MFA, session management, and CSRF protection",
      mermaid: `sequenceDiagram
    participant U as User/Browser
    participant W as WAF
    participant S as Auth Server
    participant M as MFA Provider
    participant DB as Database

    U->>W: POST /login (username, password)
    W->>W: Rate limit check
    W->>S: Forward request
    S->>DB: Lookup user credentials
    DB-->>S: Hashed password + salt
    S->>S: bcrypt.compare(input, hash)
    alt Invalid Credentials
        S-->>U: 401 Unauthorized (generic message)
        S->>DB: Log failed attempt
    else Valid Credentials
        S->>M: Request MFA challenge
        M-->>U: Send OTP via authenticator app
        U->>S: Submit OTP
        S->>M: Verify OTP
        alt MFA Failed
            S-->>U: 401 MFA verification failed
        else MFA Success
            S->>S: Generate session ID (crypto random)
            S->>DB: Store session with expiry
            S-->>U: Set-Cookie: session_id (HttpOnly, Secure, SameSite=Strict)
            S-->>U: Set-Cookie: csrf_token (Secure, SameSite=Strict)
        end
    end`,
    },
  ],
  comparison: {
    columns: [
      "OWASP Category",
      "Attack Example",
      "Primary Defense",
      "Detection Method",
      "Severity Impact",
    ],
    rows: [
      [
        "**A01**: Broken Access Control",
        "Changing `/api/users/123` to `/api/users/124` (IDOR)",
        "Server-side authorization checks per object",
        "Access control audit logs, automated DAST scans",
        "*Critical* — full data breach, privilege escalation",
      ],
      [
        "**A02**: Cryptographic Failures",
        "Intercepting data over HTTP or using weak hashing (MD5)",
        "TLS everywhere, AES-256, bcrypt/Argon2 for passwords",
        "TLS scanner (ssllabs), code review for weak algorithms",
        "*High* — sensitive data exposure, credential theft",
      ],
      [
        "**A03**: Injection",
        "`' OR 1=1 --` in login form, `<script>alert(1)</script>` in comments",
        "Parameterized queries, output encoding, `DOMPurify`",
        "SAST tools, WAF alerts, input fuzzing",
        "*Critical* — data exfiltration, account takeover, RCE",
      ],
      [
        "**A04**: Insecure Design",
        "No rate limit on password reset allows brute-force",
        "Threat modeling, secure design patterns, abuse case testing",
        "Architecture review, business logic testing",
        "*High* — systemic vulnerability, costly redesign",
      ],
      [
        "**A05**: Security Misconfiguration",
        "Default admin credentials, stack traces in error pages",
        "Hardening baselines, automated config audits, minimal installs",
        "CIS benchmark scans, infrastructure-as-code reviews",
        "*Medium-High* — information disclosure, unauthorized access",
      ],
      [
        "**A06**: Vulnerable Components",
        "Exploiting known CVE in outdated `log4j` library",
        "SCA scanning, dependency pinning, automated updates",
        "`npm audit`, Snyk, Dependabot, OWASP Dependency-Check",
        "*Variable* — depends on component; can be *Critical* (RCE)",
      ],
      [
        "**A07**: Auth Failures",
        "Credential stuffing with breached password lists",
        "MFA, rate limiting, breach password detection",
        "Failed login monitoring, anomaly detection",
        "*High* — account takeover, identity theft",
      ],
      [
        "**A08**: Integrity Failures",
        "Malicious code injected via compromised CI/CD pipeline",
        "Code signing, SRI, pipeline integrity checks",
        "Hash verification, build provenance auditing",
        "*High* — supply chain compromise, backdoors",
      ],
      [
        "**A09**: Logging Failures",
        "Attacker dwells for months undetected due to no logging",
        "Centralized logging, SIEM, alerting on anomalies",
        "Log coverage audits, tabletop incident exercises",
        "*Medium* — enables other attacks to persist undetected",
      ],
      [
        "**A10**: SSRF",
        "Fetching `http://169.254.169.254/latest/meta-data/` via URL input",
        "URL allow-lists, block private IPs, network segmentation",
        "Outbound request monitoring, WAF SSRF rules",
        "*High* — cloud credential theft, internal network access",
      ],
    ],
  },
  exercises: [
    `**Exercise 1: Broken Access Control Audit** — You have an Express.js REST API with endpoints \`GET /api/invoices/:id\` and \`DELETE /api/invoices/:id\`. Currently, any authenticated user can access or delete any invoice by changing the \`:id\` parameter. *Task*: Implement middleware that verifies the requesting user owns the invoice before allowing access. Consider both **horizontal** (same-role user accessing another's data) and **vertical** (regular user accessing admin endpoints) privilege escalation. Write the middleware and unit tests covering at least 4 edge cases.`,

    `**Exercise 2: SQL Injection to Parameterized Queries** — The following vulnerable query exists in a codebase: \`const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'"\`. *Task*: (a) Demonstrate 3 different SQL injection payloads that could exploit this query (authentication bypass, data exfiltration, destructive). (b) Rewrite the query using **parameterized statements** with your chosen database driver. (c) Add *input validation* as a defense-in-depth layer. (d) Explain why output encoding alone would **not** prevent this vulnerability.`,

    `**Exercise 3: CSP Header Configuration** — A web application currently has no \`Content-Security-Policy\` header and loads scripts from a CDN, inline styles, and images from user-uploaded content on an S3 bucket. *Task*: (a) Write a **CSP policy** that allows these legitimate resources while blocking XSS vectors. (b) Implement the policy in *report-only mode* first, then enforce it. (c) Explain how \`nonce\`-based CSP works and when you would prefer it over *hash-based* allowlisting. (d) Set up a \`report-uri\` endpoint that logs CSP violations for monitoring.`,

    `**Exercise 4: SSRF Prevention in a URL Preview Feature** — Your application has a "link preview" feature that fetches a user-provided URL and extracts the page title and description. An attacker uses it to access \`http://169.254.169.254/latest/meta-data/iam/security-credentials/\`. *Task*: (a) Implement a **URL validation function** in Node.js that blocks requests to private IP ranges (\`10.x\`, \`172.16-31.x\`, \`192.168.x\`, \`127.x\`, \`169.254.x\`), link-local addresses, and non-HTTP(S) schemes. (b) Handle DNS rebinding attacks where a domain initially resolves to a public IP but later resolves to an internal IP. (c) Add *network segmentation* recommendations for the infrastructure layer.`,

    `**Exercise 5: Threat Modeling with STRIDE** — You are designing a new *e-commerce checkout flow* that handles payment information, user sessions, and order management. *Task*: (a) Apply the **STRIDE** threat model (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to identify at least 2 threats per category. (b) Map each identified threat to the relevant **OWASP Top 10** category. (c) Propose *mitigations* for each threat. (d) Create a data flow diagram and identify all **trust boundaries** where input validation and authorization checks must occur.`,
  ],
  cheatSheet: [
    `**Access Control**: Deny by default. Enforce authorization server-side on *every* request. Validate object ownership (\`user.id === resource.ownerId\`). Use **RBAC** or **ABAC** — never rely on client-side checks or hidden fields.`,

    `**Injection Prevention**: Use \`parameterized queries\` for SQL, \`output encoding\` for HTML (\`escapeHtml()\`), and **DOMPurify** for rich content. Never concatenate user input into queries, commands, or templates. Apply *allowlist validation* on input format.`,

    `**Cryptography Essentials**: Enforce **TLS 1.2+** everywhere with \`HSTS\` headers. Hash passwords with \`bcrypt\` or \`Argon2\` (never MD5/SHA1). Use **AES-256-GCM** for encryption at rest. Rotate keys regularly. Validate certificates and avoid custom crypto.`,

    `**Security Headers Checklist**: Set \`Content-Security-Policy\` (block inline scripts), \`X-Content-Type-Options: nosniff\`, \`X-Frame-Options: DENY\`, \`Strict-Transport-Security\`, \`Referrer-Policy: strict-origin-when-cross-origin\`, and \`Permissions-Policy\` to disable unused browser features.`,

    `**Authentication Hardening**: Require **MFA** for sensitive operations. Use *bcrypt* with cost factor >= 12. Implement \`progressive delays\` on failed logins. Generate session IDs with \`crypto.randomBytes(32)\`. Set cookies with \`HttpOnly\`, \`Secure\`, and \`SameSite=Strict\` flags.`,

    `**SSRF Defense**: Validate URLs against an **allow-list** of schemes, hosts, and ports. Block all *private/reserved IP ranges* and \`169.254.169.254\` (cloud metadata). Disable HTTP redirects. Use **IMDSv2** on AWS. Run fetching services in *isolated network segments* with no internal access.`,
  ],
  revisionNotes: [
    `The **2021 OWASP Top 10** reordered and consolidated categories: *Broken Access Control* rose to **A01** (from A05 in 2017), *XSS* was merged into **A03: Injection**, and three new categories were added — \`A04: Insecure Design\`, \`A08: Software and Data Integrity Failures\`, and \`A10: SSRF\`. This reflects a shift from purely implementation-focused vulnerabilities toward **design-level** and **supply-chain** security concerns.`,

    `**Defense-in-depth** is the unifying principle across all categories: no single control is sufficient. For injection (A03), combine *parameterized queries* + **input validation** + \`WAF rules\` + *least-privilege DB accounts*. For access control (A01), combine **server-side authorization** + *RBAC middleware* + \`audit logging\` + *rate limiting*. Each layer compensates for potential failures in the others.`,

    `**Shift-left security** means integrating security testing into the earliest SDLC phases. Use *threat modeling* during design (prevents A04), **SAST** during coding (catches A03, A02), \`SCA\` during build (catches A06, A08), and **DAST** during testing (catches A01, A05, A07, A10). Automate these in CI/CD pipelines to catch vulnerabilities before they reach production.`,

    `Key **security headers** to memorize: \`Content-Security-Policy\` (prevents XSS — A03), \`Strict-Transport-Security\` (enforces HTTPS — A02), \`X-Frame-Options\` (prevents clickjacking — A01), \`X-Content-Type-Options\` (prevents MIME sniffing — A05), and \`Referrer-Policy\` (controls information leakage — A02). These are low-cost, high-impact controls that address multiple OWASP categories simultaneously.`,

    `For **cloud-native applications**, pay special attention to: *SSRF* (A10) targeting cloud metadata endpoints — use \`IMDSv2\` and block \`169.254.169.254\`; **Security Misconfiguration** (A05) in IaC templates — scan Terraform/CloudFormation with tools like \`tfsec\` or \`checkov\`; *Vulnerable Components* (A06) in container images — scan with \`Trivy\` or \`Grype\`; and **Logging Failures** (A09) — centralize logs in a *SIEM* with automated alerting on authentication anomalies and access control violations.`,
  ],
  glossary: [
    {
      term: "OWASP",
      definition:
        "Open Web Application Security Project — a nonprofit foundation providing freely available tools, standards, and documentation for web application security.",
    },
    {
      term: "CWE",
      definition:
        "Common Weakness Enumeration — a community-developed list of software and hardware weakness types, used by OWASP to classify specific vulnerabilities within each Top 10 category.",
    },
    {
      term: "IDOR",
      definition:
        "Insecure Direct Object Reference — a type of broken access control where internal object identifiers are exposed without authorization checks, allowing unauthorized data access.",
    },
    {
      term: "SSRF",
      definition:
        "Server-Side Request Forgery — an attack that forces the server to make HTTP requests to attacker-specified destinations, often targeting internal services or cloud metadata endpoints.",
    },
    {
      term: "HSTS",
      definition:
        "HTTP Strict Transport Security — a response header that forces browsers to use HTTPS for all future requests to the domain, preventing protocol downgrade attacks.",
    },
    {
      term: "CSP",
      definition:
        "Content Security Policy — an HTTP header that controls which resources a page can load, mitigating XSS and data injection attacks by specifying allowed content sources.",
    },
    {
      term: "Threat Modeling",
      definition:
        "A structured process for identifying security threats, vulnerabilities, and countermeasures in a system's design phase, essential for preventing Insecure Design (A04) issues.",
    },
  ],
};
