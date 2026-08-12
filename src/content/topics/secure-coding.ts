import type { TopicContent } from "../types";

export const secureCoding: TopicContent = {
  quickSummary: [
    "Secure coding is the practice of writing software that is resistant to attack by applying security principles at every stage of development, from input handling to deployment.",
    "Input validation (never trust user input) and output encoding (context-aware escaping) form the foundational defense against injection attacks, XSS, and data corruption.",
    "The principle of least privilege limits each component to only the permissions it needs, reducing the blast radius when a compromise occurs.",
    "Defense in depth layers multiple security controls so that the failure of any single control does not compromise the system.",
  ],
  detailed: [
    `## Input Validation

Input validation is the first line of defense. Every piece of data from an external source — user forms, API requests, file uploads, URL parameters, headers, cookies — must be treated as untrusted.

**Validation strategies:**
- **Allow-list (whitelist)**: Define exactly what is acceptable. Only allow characters, patterns, types, and ranges that are valid for the field. Reject everything else.
- **Type checking**: Ensure integers are integers, emails match email patterns, dates are valid dates.
- **Length limits**: Enforce minimum and maximum lengths to prevent buffer overflow and resource exhaustion.
- **Range checking**: Numeric values should be within expected bounds.
- **Canonicalization**: Convert data to a standard form before validation — decode URL encoding, normalize Unicode, resolve path traversals (../) before checking.

**Common mistakes:**
- Validating on the client side only (easily bypassed)
- Using deny-lists (impossible to enumerate all bad inputs)
- Validating format but not semantic meaning (a valid email format does not mean a legitimate address)
- Forgetting to validate data from "trusted" internal services (they may be compromised)

Validation should happen as early as possible — at the application boundary — and should be centralized in reusable validation functions or middleware.`,

    `## Output Encoding

Even with perfect input validation, data must be encoded for its output context to prevent injection. The same string requires different encoding depending on where it appears:

**HTML context**: Convert \`<\` to \`&lt;\`, \`>\` to \`&gt;\`, \`&\` to \`&amp;\`, \`"\` to \`&quot;\`, \`'\` to \`&#x27;\`

**JavaScript context**: Use JavaScript string escaping. Never insert user data into inline scripts.

**URL context**: Use percent-encoding for special characters.

**CSS context**: Use CSS hex encoding for untrusted values in style attributes.

**SQL context**: Use parameterized queries (not encoding — parameterized queries are structurally separate).

Modern frameworks handle much of this automatically — React escapes JSX expressions, Angular sanitizes bindings, Django auto-escapes templates. But developers must understand where auto-escaping does not apply:
- Rendering raw HTML (\`dangerouslySetInnerHTML\`, \`| safe\`, \`{!! !!}\`)
- Building URLs dynamically
- Writing to JavaScript contexts
- Generating email content`,

    `## Least Privilege and Access Control

**Principle of Least Privilege** means every program, process, and user should operate with the minimum set of privileges necessary to complete the task.

**Application level:**
- Database connections should use accounts with only the required permissions (SELECT-only for read operations, no DROP/ALTER for application accounts)
- API keys should be scoped to specific resources and operations
- File system access should be limited to required directories
- Network access should be restricted to necessary hosts and ports

**Code level:**
- Functions should only access data they need (avoid passing entire objects when only one field is required)
- Modules should expose minimal public interfaces
- Secrets should be injected via environment variables or secret managers, never hardcoded
- Temporary elevated privileges should be dropped immediately after use

**Infrastructure level:**
- Containers should run as non-root users
- Service accounts should have minimal IAM roles
- Network policies should follow zero-trust (deny all, allow specific)

When a breach occurs, least privilege limits the blast radius — a compromised read-only database connection cannot modify or delete data.`,

    `## Defense in Depth

Defense in depth applies multiple layers of security controls so no single failure is catastrophic:

**Layer 1 — Network**: Firewalls, network segmentation, WAF, DDoS protection, TLS everywhere.

**Layer 2 — Application**: Input validation, output encoding, authentication, authorization, session management, error handling.

**Layer 3 — Data**: Encryption at rest, field-level encryption for sensitive data, database access controls, audit logging.

**Layer 4 — Monitoring**: Logging all security-relevant events, intrusion detection, alerting on anomalies, incident response procedures.

**Practical example — preventing SQLi:**
1. Input validation rejects unexpected characters (first layer)
2. Parameterized queries prevent injection even if validation fails (second layer)
3. Database account has minimal permissions, limiting what a successful injection can do (third layer)
4. WAF blocks known SQLi patterns (fourth layer)
5. Database audit logs detect unusual queries (fifth layer)

Each layer assumes the previous one might fail. This is the core mindset of secure coding.`,

    `## Secure Error Handling and Logging

**Error handling:**
- Never expose stack traces, database errors, or internal details to end users — these reveal architecture, technology stack, and potential attack vectors
- Use generic user-facing error messages ("Something went wrong") with internal error codes for debugging
- Catch specific exceptions rather than generic ones — broad catches can mask security issues
- Fail securely — if an authorization check throws an exception, the default should be to deny access, not grant it
- Clean up resources (close connections, release locks) in finally blocks to prevent resource exhaustion attacks

**Logging:**
- Log authentication successes and failures (with username, IP, timestamp)
- Log authorization failures (who tried to access what they shouldn't)
- Log input validation failures (potential attack probing)
- Never log sensitive data: passwords, tokens, credit card numbers, PII
- Use structured logging (JSON) for machine-parseable analysis
- Protect log integrity — logs should be append-only and stored separately from the application
- Set appropriate log levels — security events should not be silenced by log level configuration

**Secrets management:**
- Never hardcode secrets in source code
- Use environment variables, vault systems (HashiCorp Vault, AWS Secrets Manager), or config services
- Rotate secrets regularly and on suspected compromise
- Audit secret access`,
  ],
  interviewQA: [
    {
      q: "Why is allow-listing preferred over deny-listing for input validation?",
      a: "Deny-listing tries to enumerate every dangerous input pattern, but attackers constantly find new encodings, bypass techniques, and edge cases that the deny-list doesn't cover. Allow-listing defines exactly what is acceptable — characters, format, length, range — and rejects everything else. This provides a much stronger guarantee because you don't need to anticipate every possible attack, only define what valid input looks like. For example, a username field that allows only alphanumeric characters and underscores (allow-list) is inherently resistant to SQL injection, XSS, and command injection regardless of future attack discoveries.",
    },
    {
      q: "Explain defense in depth with a concrete example.",
      a: "Consider protecting a user profile update endpoint. Layer 1 (Network): WAF filters obvious attack patterns, TLS encrypts transport. Layer 2 (Application): authentication verifies user identity, authorization confirms they can edit this specific profile, input validation checks field formats. Layer 3 (Data): parameterized queries prevent SQLi, output encoding prevents XSS, the database user has only UPDATE permission on specific columns. Layer 4 (Monitoring): failed authorization attempts are logged and trigger alerts, data changes are audit-logged. If any single layer fails — say a developer forgets output encoding — the CSP header and WAF still prevent XSS. No single failure compromises the system.",
    },
    {
      q: "What does it mean to 'fail securely' and why is it important?",
      a: "Failing securely means that when an error occurs, the system defaults to a secure state rather than an open one. For example, if an authorization check throws an exception, access should be denied — not granted because the check 'didn't explicitly return false.' If a TLS certificate validation fails, the connection should be rejected — not downgraded to unencrypted. If a rate limiter's backing store is unavailable, requests should be throttled or rejected — not allowed without limits. The principle prevents errors from creating security holes.",
    },
    {
      q: "How should sensitive data be handled in application logs?",
      a: "Sensitive data (passwords, tokens, credit cards, PII) should never appear in logs. Use masking or redaction — log only the last 4 digits of a card number, replace email bodies with a hash or identifier. For request logging, filter or redact sensitive headers (Authorization, Cookie) and body fields. Implement structured logging with field-level classification so sensitive fields are automatically redacted. Store logs in append-only, access-controlled storage separate from the application. Ensure log aggregation services and dashboards also respect data classification policies.",
    },
  ],
  followUps: [
    "What does 'fail securely' mean concretely in an authorisation check?",
    "Why is an allowlist almost always better than a blocklist?",
    "Where are the trust boundaries in a typical web application?",
  ],
  mcqs: [
    {
      q: "Which input validation approach is most secure?",
      options: [
        "Deny-listing known dangerous characters",
        "Allow-listing only expected valid patterns",
        "Client-side JavaScript validation",
        "Encoding all input before storage",
      ],
      answerIndex: 1,
      explanation:
        "Allow-listing defines exactly what valid input looks like and rejects everything else, providing stronger security than deny-listing which can be bypassed with novel attack patterns.",
    },
    {
      q: "What is the correct behavior when an authorization check throws an unexpected exception?",
      options: [
        "Grant access since the check did not explicitly deny",
        "Retry the check three times then grant access",
        "Deny access (fail secure)",
        "Log the error and skip authorization",
      ],
      answerIndex: 2,
      explanation:
        "Failing securely means defaulting to the more restrictive option when errors occur. An authorization exception should result in denied access, not a security bypass.",
    },
    {
      q: "Which item should NEVER appear in application logs?",
      options: [
        "Failed login attempt timestamps",
        "Cleartext passwords or authentication tokens",
        "User IP addresses for security events",
        "Authorization failure details",
      ],
      answerIndex: 1,
      explanation:
        "Passwords and authentication tokens are sensitive credentials that should never be logged. If logs are compromised, exposed credentials lead to direct account takeover.",
    },
    {
      q: "What is the principle of least privilege?",
      options: [
        "Only administrators should have access to production systems",
        "Every component should operate with the minimum permissions needed for its task",
        "All users should have read-only access by default",
        "Privileges should be rotated every 30 days",
      ],
      answerIndex: 1,
      explanation:
        "Least privilege means granting only the minimum permissions necessary to perform a function. This limits the damage from compromised components — a read-only database account cannot delete data even if exploited.",
    },
  ],
  flashcards: [
    {
      front: "What is canonicalization in input validation?",
      back: "Converting data to a standard form before validation — decoding URL encoding, normalizing Unicode, resolving path traversals. Without canonicalization, attackers can bypass validation using encoded or alternative representations of malicious input.",
    },
    {
      front: "Why is client-side validation insufficient for security?",
      back: "Client-side validation runs in the user's browser and can be bypassed by disabling JavaScript, modifying the DOM, or sending requests directly via tools like curl or Burp Suite. Server-side validation is mandatory; client-side is only for UX.",
    },
    {
      front: "What is defense in depth?",
      back: "A security strategy that layers multiple independent controls so that no single point of failure compromises the system. If input validation fails, parameterized queries still prevent SQLi; if both fail, database permissions limit damage.",
    },
    {
      front: "What does 'fail secure' mean?",
      back: "When an error or exception occurs, the system defaults to a secure/denied state rather than an open/allowed state. Example: if an auth check throws an exception, access is denied rather than granted.",
    },
    {
      front: "Why should different output contexts use different encoding?",
      back: "Each context (HTML, JavaScript, URL, CSS, SQL) has different special characters and escape sequences. HTML entity encoding prevents XSS in HTML but not in JavaScript contexts, where JS-specific escaping is needed.",
    },
    {
      front: "What is the blast radius principle?",
      back: "Designing systems so that a compromise of one component limits the damage to the smallest possible scope. Achieved through least privilege, network segmentation, isolation, and minimal trust between components.",
    },
    {
      front: "Name three things that should always be logged for security.",
      back: "1) Authentication events (successes and failures with timestamps and IPs), 2) Authorization failures (who tried to access what), 3) Input validation failures (potential attack probing). Never log credentials or PII.",
    },
  ],
  resources: [
    {
      label: "OWASP Cheat Sheet Series",
      kind: "docs",
    },
    {
      label: "OWASP Application Security Verification Standard (ASVS)",
      kind: "docs",
    },
    {
      label: "Threat Modeling: Designing for Security — Adam Shostack",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Input Validation",
      definition:
        "The process of verifying that user-supplied data conforms to expected type, format, length, and range before processing, serving as the first line of defense against injection attacks.",
    },
    {
      term: "Output Encoding",
      definition:
        "Converting special characters to their safe equivalents for a specific output context (HTML, JS, URL) to prevent interpreted execution of user-supplied data.",
    },
    {
      term: "Least Privilege",
      definition:
        "A security principle stating that every component should operate with the minimum set of permissions necessary to complete its task, limiting the impact of compromise.",
    },
    {
      term: "Defense in Depth",
      definition:
        "A security strategy employing multiple layered controls so that no single point of failure compromises the system's overall security posture.",
    },
    {
      term: "Fail Secure",
      definition:
        "A design principle where system errors and exceptions default to a denied/secure state rather than an open/allowed state, preventing errors from creating security vulnerabilities.",
    },
    {
      term: "Canonicalization",
      definition:
        "Converting input to a standard normalized form before validation, preventing bypass attacks that use alternative encodings or representations of malicious content.",
    },
    {
      term: "Secrets Management",
      definition:
        "The practice of securely storing, accessing, and rotating sensitive credentials (API keys, passwords, certificates) using dedicated systems like HashiCorp Vault or cloud secret managers.",
    },
  ],
  deepDive: [
    `**Secure coding** is not merely a checklist of *techniques* — it is a **mindset** that must permeate every phase of the software development lifecycle. From the moment a developer writes \`if (user.isAdmin)\` without verifying the **authentication context**, a vulnerability is born. The *attack surface* of modern applications spans **APIs**, **WebSocket connections**, \`localStorage\`, **service workers**, and even \`postMessage\` channels between iframes. Understanding that **every boundary** between *trusted* and *untrusted* code is a potential exploit vector is the foundation of the **secure coding discipline**. Developers must adopt *threat modeling* early — asking "**what could go wrong?**" at the *design phase*, not after deployment.`,

    `The most **critical** secure coding practices revolve around *data handling*. **Parameterized queries** (using \`PreparedStatement\` in Java or \`$1, $2\` placeholders in PostgreSQL) are the *gold standard* for **SQL injection prevention** — never build queries with **string concatenation**. For **cross-site scripting (XSS)**, output encoding must be *context-aware*: \`&lt;\` escaping works in **HTML body** context but is *useless* inside a \`<script>\` tag, where **JavaScript-specific escaping** is required. *Memory-safe languages* like **Rust** and **Go** eliminate entire categories of vulnerabilities (\`buffer overflows\`, \`use-after-free\`, \`double-free\`), but even in **C/C++**, disciplined use of \`std::string\`, \`std::vector\`, and *smart pointers* like \`std::unique_ptr\` dramatically reduces risk.`,

    `**Cryptography** in secure coding demands *extreme care* — the mantra is "**never roll your own crypto**." Use established libraries like \`libsodium\`, **OpenSSL**, or the *Web Crypto API* and rely on **well-vetted algorithms**: \`AES-256-GCM\` for *symmetric encryption*, \`RSA-OAEP\` or **X25519** for *key exchange*, and \`bcrypt\` or \`argon2id\` for **password hashing**. A common *anti-pattern* is using \`MD5\` or \`SHA-1\` for password storage — these are **fast hashes** designed for *integrity checks*, not password protection, and can be brute-forced at billions of attempts per second on modern **GPUs**. Additionally, **secrets rotation**, *certificate pinning*, and proper \`TLS\` configuration (disabling **TLS 1.0/1.1**, using *strong cipher suites*) are essential components of a **defense-in-depth** cryptographic posture.`,
  ],
  code: [
    {
      language: "C++",
      caption: "Safe string handling with std::string and input bounds checking",
      source: `#include <iostream>
#include <string>
#include <stdexcept>
#include <algorithm>

// Secure input validation: allow-list approach
bool isValidUsername(const std::string& username) {
    if (username.empty() || username.size() > 32) {
        return false; // Enforce length limits
    }
    // Allow only alphanumeric characters and underscores
    return std::all_of(username.begin(), username.end(), [](char c) {
        return std::isalnum(static_cast<unsigned char>(c)) || c == '_';
    });
}

// Secure error handling: fail securely, never expose internals
std::string authenticateUser(const std::string& username, const std::string& password) {
    if (!isValidUsername(username)) {
        throw std::invalid_argument("Invalid input"); // Generic message
    }
    // Use parameterized query via prepared statement (pseudo-code)
    // NEVER: "SELECT * FROM users WHERE name='" + username + "'"
    // ALWAYS: PreparedStatement with bound parameters
    return "authenticated_token";
}

int main() {
    try {
        std::string user;
        std::getline(std::cin, user);
        auto token = authenticateUser(user, "secret");
        std::cout << "Login successful" << std::endl;
    } catch (const std::exception&) {
        // Log internally, show generic message to user
        std::cerr << "Authentication failed" << std::endl;
    }
    return 0;
}`,
    },
    {
      language: "Node.js",
      caption: "Express middleware for input validation, rate limiting, and secure headers",
      source: `const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(helmet()); // Set secure HTTP headers (CSP, HSTS, etc.)

// Rate limiting to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
});

// Input validation middleware using allow-list approach
const validateLogin = [
  body('username')
    .isAlphanumeric().withMessage('Invalid characters')
    .isLength({ min: 3, max: 32 }).withMessage('Invalid length')
    .trim()
    .escape(),
  body('password')
    .isLength({ min: 8, max: 128 }),
];

app.post('/api/login', loginLimiter, validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log detailed errors internally, return generic message
    console.error('Validation failed:', errors.array());
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Use parameterized query — NEVER string concatenation
    // db.query('SELECT * FROM users WHERE name = $1', [req.body.username]);
    res.json({ message: 'Login successful' });
  } catch (err) {
    // Never expose stack traces or DB errors to the client
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000);`,
    },
    {
      language: "C++",
      caption: "RAII-based resource management and memory-safe patterns to prevent leaks and overflows",
      source: `#include <memory>
#include <vector>
#include <fstream>
#include <string>
#include <stdexcept>

// RAII wrapper for secure file handling — auto-closes on scope exit
class SecureFileReader {
    std::ifstream file_;
public:
    explicit SecureFileReader(const std::string& path) : file_(path) {
        if (!file_.is_open()) {
            throw std::runtime_error("Cannot open file");
        }
    }
    ~SecureFileReader() { if (file_.is_open()) file_.close(); }

    // Prevent copying to avoid double-close
    SecureFileReader(const SecureFileReader&) = delete;
    SecureFileReader& operator=(const SecureFileReader&) = delete;

    std::string readLine() {
        std::string line;
        if (!std::getline(file_, line)) {
            throw std::runtime_error("Read failed");
        }
        if (line.size() > 4096) { // Enforce max line length
            throw std::runtime_error("Line exceeds safe limit");
        }
        return line;
    }
};

// Use smart pointers instead of raw new/delete
void processData() {
    // unique_ptr: automatic cleanup, no memory leaks
    auto buffer = std::make_unique<std::vector<uint8_t>>(1024);

    // Bounds-checked access with .at() instead of []
    try {
        buffer->at(0) = 0xFF;  // Throws if out of range
    } catch (const std::out_of_range& e) {
        // Handle bounds violation securely
    }

    // SecureFileReader auto-closes even if exception is thrown
    SecureFileReader reader("/etc/config.dat");
    auto line = reader.readLine();
}`,
    },
  ],
  diagrams: [
    {
      title: "OWASP Top 10 Attack Vectors",
      kind: "mindmap",
      caption: "Overview of the OWASP Top 10 most critical web application security risks and their attack categories.",
      mermaid: `mindmap
  root((OWASP Top 10))
    Injection
      SQL Injection
      Command Injection
      LDAP Injection
    Broken Authentication
      Weak passwords
      Session fixation
      Missing MFA
    Broken Access Control
      IDOR
      Privilege escalation
      Missing authorization
    Cryptographic Failures
      Weak algorithms
      Hardcoded secrets
      Missing encryption
    Security Misconfiguration
      Default credentials
      Verbose errors
      Open cloud storage
    Vulnerable Components
      Outdated libraries
      Known CVEs`,
    },
    {
      title: "SQL Injection Attack and Defense",
      kind: "flow",
      caption: "How SQL injection attacks work and the defense strategy using parameterized queries to prevent attacker-controlled SQL execution.",
      mermaid: `flowchart TD
    A([User input: username]) --> B{Using string concatenation?}
    B -->|Yes - vulnerable| C["Query: SELECT * FROM users WHERE name= ' + input + '"]
    C --> D["Attacker input: ' OR 1=1 --"]
    D --> E[All rows returned - data breach]
    B -->|No - parameterized| F["Query: SELECT * FROM users WHERE name = ?"]
    F --> G[Input bound as data - not code]
    G --> H[No injection possible]
    H --> I([Safe query executed])`,
    },
    {
      title: "Defense in Depth Layers",
      kind: "architecture",
      caption: "Security defense in depth uses multiple layers so that bypassing one layer does not compromise the system. Each layer independently reduces risk.",
      mermaid: `graph TD
    Internet[Internet] --> WAF[Web Application Firewall]
    WAF --> LB[Load Balancer - TLS termination]
    LB --> Auth[Authentication Layer - OAuth and JWT]
    Auth --> AuthZ[Authorization - RBAC]
    AuthZ --> Validation[Input Validation and Sanitization]
    Validation --> App[Application Logic]
    App --> ORM[ORM - Parameterized Queries]
    ORM --> DB[(Encrypted Database)]
    DB --> Audit[Audit Logging]`,
    },
    {
      title: "Secure Development Lifecycle",
      kind: "flow",
      caption: "Security integrated throughout the software development lifecycle: threat modeling in design, SAST in development, DAST in testing, and monitoring in production.",
      mermaid: `flowchart LR
    Plan[Plan] -->|Threat modeling| Design[Design]
    Design -->|Security architecture review| Develop[Develop]
    Develop -->|SAST - lint rules - code review| Test[Test]
    Test -->|DAST - pen testing - dependency scan| Release[Release]
    Release -->|Signed artifacts - SBOM| Deploy[Deploy]
    Deploy -->|Runtime monitoring - WAF| Monitor[Monitor]
    Monitor -->|Incident response| Plan`,
    },
  ],
  animations: [
    {
      title: "Where validation belongs",
      steps: [
        {
          label: "Untrusted input arrives",
          detail: "Body, query, params, headers, and anything from another service.",
        },
        {
          label: "Validate at the boundary",
          detail: "Parse against a schema; reject unknown fields on writes so mass assignment can't set `role` or `price`.",
        },
        {
          label: "Now it's typed",
          detail: "Past this point the rest of the code can rely on the shape — validation is not repeated everywhere.",
        },
        {
          label: "Authorise the object",
          detail: "Not just the route: does this caller own this specific resource?",
        },
        {
          label: "Encode on output",
          detail: "Escape for the context it lands in — HTML, attribute, JS, URL each differ.",
        },
        {
          label: "Fail securely",
          detail: "On any error, deny. A check that throws must not fall through to allow.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Insecure Practice",
      "Secure Practice",
      "Risk if Insecure",
    ],
    rows: [
      [
        "**SQL Queries**",
        "String concatenation: `\"SELECT * FROM users WHERE id=\" + id`",
        "Parameterized queries: `db.query('SELECT * FROM users WHERE id=$1', [id])`",
        "*SQL injection* — full database compromise",
      ],
      [
        "**Password Storage**",
        "Plain text or `MD5`/`SHA-1` hashing",
        "`bcrypt` or `argon2id` with unique salt per password",
        "*Credential theft* — mass account takeover",
      ],
      [
        "**Error Messages**",
        "Expose stack traces and DB errors to users",
        "Generic user-facing messages; detailed internal logging",
        "*Information disclosure* — reveals architecture to attackers",
      ],
      [
        "**Input Validation**",
        "Client-side only or deny-list approach",
        "Server-side allow-list validation with canonicalization",
        "*Injection attacks* — XSS, command injection, path traversal",
      ],
      [
        "**Secrets Management**",
        "Hardcoded in source code or config files",
        "Environment variables or vault systems (`HashiCorp Vault`, `AWS Secrets Manager`)",
        "*Credential exposure* — keys leaked via source control",
      ],
      [
        "**HTTP Headers**",
        "No security headers set",
        "`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`",
        "*XSS, clickjacking, MIME sniffing* attacks",
      ],
    ],
  },
  exercises: [
    "**Vulnerability Audit**: Take an existing small web application (or use OWASP *Juice Shop*) and identify at least **5 security vulnerabilities**. For each, document the *vulnerability type* (e.g., `SQLi`, `XSS`, `IDOR`), the **affected code**, and write a *secure fix* with proper input validation and output encoding.",
    "**Parameterized Query Refactor**: Find a codebase that uses **string concatenation** for `SQL` queries. Refactor *all* queries to use **parameterized statements**. Test with inputs containing `'; DROP TABLE users; --` to confirm the *injection is neutralized*.",
    "**Secure Authentication System**: Build a **login system** in *Node.js* or *Python* that implements: `bcrypt` password hashing with **unique salts**, *rate limiting* (max 5 attempts per 15 minutes), **secure session management** with `HttpOnly`/`Secure`/`SameSite` cookies, and *CSRF protection*. Write tests proving each control works.",
    "**Threat Modeling Exercise**: Choose a feature you are currently developing and create a **STRIDE threat model**. Identify *Spoofing*, *Tampering*, *Repudiation*, *Information Disclosure*, *Denial of Service*, and *Elevation of Privilege* threats. Propose **mitigations** for each using `secure coding` techniques covered in this topic.",
    "**Security Header Configuration**: Configure a web server (e.g., *Express* with `helmet`, or **Nginx**) to return all recommended security headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. Use a tool like \`securityheaders.com\` to **verify** your configuration scores an *A+*.",
  ],
  cheatSheet: [
    "**Input Validation**: Always use *allow-list* (whitelist) validation on the **server side**. Validate `type`, *length*, **range**, and *format*. Canonicalize before validating. Never rely on **client-side** validation alone.",
    "**SQL Injection Prevention**: Use `parameterized queries` or **prepared statements** — *never* concatenate user input into SQL strings. Apply **least privilege** to database accounts (e.g., `SELECT`-only for read operations).",
    "**XSS Prevention**: Apply *context-aware* **output encoding** — `HTML entities` for HTML body, *JavaScript escaping* for `<script>` contexts, **percent-encoding** for URLs. Use `Content-Security-Policy` headers to block inline scripts.",
    "**Password Storage**: Hash with `bcrypt` (cost factor **12+**) or `argon2id`. Always use a *unique salt* per password. **Never** use `MD5`, `SHA-1`, or *unsalted hashes*.",
    "**Secrets Management**: Store secrets in *environment variables* or a **vault** (`HashiCorp Vault`, `AWS Secrets Manager`). **Never** hardcode in source code. *Rotate* on schedule and on suspected compromise.",
    "**Error Handling**: *Fail securely* — deny access on exceptions. Return **generic messages** to users; log *detailed errors* internally. Never expose `stack traces`, **database errors**, or *internal paths* to end users.",
  ],
  revisionNotes: [
    "The **three pillars** of secure coding are *input validation* (never trust user input), **output encoding** (context-aware escaping for HTML, JS, URL, SQL), and `least privilege` (minimum permissions at every layer — code, database, infrastructure).",
    "**Defense in depth** layers *independent* security controls: `WAF` at the network layer, *authentication/authorization* at the application layer, **parameterized queries** at the data layer, and `audit logging` at the monitoring layer. Each layer assumes the *previous one might fail*.",
    "**Fail securely** means defaulting to a *denied/closed state* on errors. If an `authorization check` throws an exception, **deny access**. If `TLS validation` fails, *reject the connection*. If the `rate limiter` is unavailable, **throttle requests**. Never let errors create security bypasses.",
    "**Cryptographic best practices**: use `AES-256-GCM` for *symmetric encryption*, `bcrypt`/`argon2id` for **password hashing** (never `MD5`/`SHA-1`), and *established libraries* (`libsodium`, **OpenSSL**, `Web Crypto API`). **Never** implement custom cryptographic algorithms.",
    "**Security logging** must capture *authentication events* (successes and failures), **authorization failures**, and `input validation` rejections — but **never** log *passwords*, `tokens`, *credit card numbers*, or **PII**. Use *structured logging* and store logs in **append-only**, access-controlled storage.",
  ],
};
