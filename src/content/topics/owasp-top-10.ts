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
