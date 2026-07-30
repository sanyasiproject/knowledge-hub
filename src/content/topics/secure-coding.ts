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
};
