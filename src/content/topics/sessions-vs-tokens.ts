import type { TopicContent } from "../types";

export const sessionsVsTokens: TopicContent = {
  quickSummary: [
    "Session-based auth stores state on the server (session ID in a cookie maps to server-side data). Token-based auth stores state on the client (a signed JWT contains all the claims needed to authenticate).",
    "Sessions are stateful and easily revocable — delete the session from the server and the user is logged out immediately. Tokens are stateless and not revocable until they expire, which is why short-lived access tokens are paired with revocable refresh tokens.",
    "Sessions work best for traditional web apps (server-rendered, same-origin). Tokens work best for APIs, mobile apps, SPAs, and microservices where multiple services need to verify identity without sharing session state.",
  ],
  detailed: [
    "Cookie-based sessions: the user logs in, the server creates a session (a record in memory, a database, or Redis) containing user ID, roles, and metadata. The server sends back a session ID in a Set-Cookie header (httpOnly, secure, sameSite). On every subsequent request, the browser automatically includes the cookie. The server looks up the session by ID, retrieves the user data, and processes the request. The session is the source of truth — if you delete it server-side, the user is immediately logged out.",
    "JWT token-based auth: the user logs in, the server creates a JWT containing claims (user ID, roles, expiration) and signs it. The client stores the token and sends it in the Authorization header (Bearer <token>) with each request. The server verifies the signature and reads the claims — no database lookup needed. But once issued, the token is valid until it expires. You can't revoke it without maintaining a blocklist, which reintroduces server-side state.",
    "Stateful vs stateless: sessions are stateful — the server must store and look up session data for every request. This means session storage must be shared across server instances (sticky sessions, Redis, or a database). Tokens are stateless — any server can verify a token independently using the signing key. This makes tokens ideal for horizontal scaling and microservice architectures. The trade-off is control: stateful sessions give you immediate revocation; stateless tokens sacrifice revocation for scalability.",
    "Refresh tokens solve the JWT revocation problem. The auth server issues two tokens: a short-lived access token (5-15 minutes) and a long-lived refresh token (days to weeks). The access token is used for API requests. When it expires, the client sends the refresh token to get a new access token. Refresh tokens are stored server-side (in a database), so they CAN be revoked. This gives you the scalability of stateless access tokens with the revocation control of sessions.",
    "Token rotation: each time a refresh token is used, the server issues a new refresh token and invalidates the old one. If an attacker steals a refresh token and the legitimate user also tries to use it, one of them will present an already-used token. The server detects this reuse, invalidates the entire token family, and forces re-authentication. This is called refresh token rotation with reuse detection.",
    "Session storage options: (1) In-memory (Node.js process) — fast but lost on restart, doesn't work with multiple instances. (2) Redis — fast, supports TTL for auto-expiry, works across instances, the most common choice. (3) Database (PostgreSQL, MongoDB) — durable, supports complex queries on sessions, slower than Redis. (4) Signed cookies (cookie contains all session data, encrypted and signed) — no server-side storage, but limited by cookie size (4KB) and sends session data with every request.",
    "Security trade-offs: Sessions in httpOnly cookies are immune to XSS (JavaScript can't read them) but vulnerable to CSRF (browser sends cookies automatically with cross-origin requests — mitigate with SameSite=Strict and CSRF tokens). Tokens in localStorage are immune to CSRF (not sent automatically) but vulnerable to XSS (JavaScript can read localStorage). The safest approach: store tokens in httpOnly cookies (immune to both XSS and CSRF with SameSite=Strict) or use the BFF (Backend for Frontend) pattern.",
  ],
  deepDive: [
    "The BFF (Backend for Frontend) pattern combines the best of both worlds. A thin backend server handles authentication: it receives tokens from the IdP, stores them server-side (like a session), and issues a session cookie to the browser. The browser never sees or stores tokens — it only has a session cookie. API requests go through the BFF, which attaches the access token. This gives you: httpOnly cookie security (immune to XSS), CSRF protection (SameSite), token refresh handling on the server, and the ability to revoke sessions immediately.",
    "Session fixation attacks: an attacker sets a known session ID in the victim's browser (via URL parameter or cookie injection), then waits for the victim to log in. The session is now authenticated with a session ID the attacker knows. Prevention: always regenerate the session ID after successful login. Most frameworks do this by default.",
    "Token storage in mobile apps: mobile apps can't use httpOnly cookies (no browser). Tokens are stored in platform-specific secure storage: iOS Keychain, Android Keystore, or encrypted shared preferences. These are isolated per-app and protected by the OS. Never store tokens in plain text files, user defaults (iOS), or shared preferences (Android) without encryption.",
    "Sliding sessions vs absolute timeouts: a sliding session extends its expiry on each request (user stays active = session doesn't expire). An absolute timeout forces re-authentication after a fixed period regardless of activity. Best practice: use both — a sliding window of 30 minutes (inactivity timeout) AND an absolute timeout of 8 hours (maximum session duration). For sensitive applications, add step-up auth for critical operations.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Session-based authentication with Express and Redis",
      source: `import session from "express-session";
import RedisStore from "connect-redis";
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_SECRET!,
    name: "sid",          // Cookie name (avoid default "connect.sid")
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,     // JS can't read it (XSS protection)
      secure: true,       // HTTPS only
      sameSite: "strict", // CSRF protection
      maxAge: 30 * 60 * 1000, // 30 minutes sliding window
    },
  })
);

// Login: create session
app.post("/login", async (req, res) => {
  const user = await verifyCredentials(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Regenerate session ID to prevent session fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Session error" });
    req.session.userId = user.id;
    req.session.roles = user.roles;
    req.session.createdAt = Date.now(); // For absolute timeout
    res.json({ message: "Logged in" });
  });
});

// Logout: destroy session (immediate revocation)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sid");
    res.json({ message: "Logged out" });
  });
});

// Auth middleware with absolute timeout
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  // Absolute timeout: force re-login after 8 hours
  const eightHours = 8 * 60 * 60 * 1000;
  if (Date.now() - req.session.createdAt > eightHours) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Session expired, please log in again" });
  }
  next();
}`,
    },
    {
      language: "typescript",
      caption: "Token-based auth with access + refresh token rotation",
      source: `import jwt from "jsonwebtoken";
import crypto from "crypto";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function createTokenPair(userId: string, roles: string[]): TokenPair {
  const accessToken = jwt.sign(
    { sub: userId, roles },
    process.env.JWT_PRIVATE_KEY!,
    { algorithm: "RS256", expiresIn: "15m", issuer: "auth.example.com" }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");
  return { accessToken, refreshToken };
}

// Login: issue tokens and store refresh token
app.post("/login", async (req, res) => {
  const user = await verifyCredentials(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const tokens = createTokenPair(user.id, user.roles);
  const family = crypto.randomUUID(); // Token family for reuse detection

  // Store refresh token server-side (revocable)
  await db.refreshTokens.create({
    token: hashToken(tokens.refreshToken),
    userId: user.id,
    family,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  res.json(tokens);
});

// Refresh: rotate tokens
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  const hashedToken = hashToken(refreshToken);

  const stored = await db.refreshTokens.findByToken(hashedToken);
  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // Check for reuse: if this token was already used, revoke the entire family
  if (stored.used) {
    await db.refreshTokens.deleteByFamily(stored.family);
    return res.status(401).json({ error: "Token reuse detected, all sessions revoked" });
  }

  // Mark current token as used (not deleted, for reuse detection)
  await db.refreshTokens.markUsed(stored.id);

  // Issue new token pair
  const user = await db.users.findById(stored.userId);
  const newTokens = createTokenPair(user.id, user.roles);

  await db.refreshTokens.create({
    token: hashToken(newTokens.refreshToken),
    userId: user.id,
    family: stored.family, // Same family
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.json(newTokens);
});

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}`,
    },
  ],
  diagrams: [
    {
      title: "Session-Based Authentication Flow",
      kind: "sequence",
      caption: "Server-side sessions store auth state in memory or a database. The session ID in a cookie references server-side state on every request.",
      mermaid: `sequenceDiagram
    participant Browser
    participant Server
    participant SessionStore as Session Store - Redis

    Browser->>Server: POST /login - credentials
    Server->>Server: Validate credentials
    Server->>SessionStore: Store session data - userId and roles
    SessionStore-->>Server: session_id: abc123
    Server-->>Browser: Set-Cookie: session_id=abc123
    Browser->>Server: GET /profile - Cookie: session_id=abc123
    Server->>SessionStore: Lookup session abc123
    SessionStore-->>Server: userId: 42 - roles: admin
    Server-->>Browser: Profile data`,
    },
    {
      title: "JWT Token-Based Authentication Flow",
      kind: "sequence",
      caption: "JWT tokens are self-contained. The server validates the signature without a database lookup, enabling stateless and scalable authentication.",
      mermaid: `sequenceDiagram
    participant Browser
    participant AuthServer as Auth Server
    participant API as API Server

    Browser->>AuthServer: POST /login - credentials
    AuthServer->>AuthServer: Validate credentials
    AuthServer->>AuthServer: Sign JWT with secret - userId and roles and exp
    AuthServer-->>Browser: access_token: eyJhbG...
    Browser->>API: GET /profile - Authorization: Bearer eyJhbG...
    API->>API: Verify JWT signature
    API->>API: Check expiry claim
    API-->>Browser: Profile data - no DB lookup needed`,
    },
    {
      title: "JWT Structure",
      kind: "architecture",
      caption: "A JWT consists of three base64url-encoded parts: header specifying algorithm, payload containing claims, and signature for integrity verification.",
      mermaid: `graph LR
    JWT[JWT Token] --> Header["Header - Base64url"]
    JWT --> Payload["Payload - Base64url"]
    JWT --> Signature["Signature - Base64url"]
    Header --> H1["alg: HS256"]
    Header --> H2["typ: JWT"]
    Payload --> P1["sub: user_id"]
    Payload --> P2["iat: issued_at"]
    Payload --> P3["exp: expiry"]
    Payload --> P4["roles: admin"]
    Signature --> S1["HMAC-SHA256 of header.payload with secret"]`,
    },
    {
      title: "Session vs Token Trade-offs",
      kind: "mindmap",
      caption: "Comparing session-based and token-based authentication on key dimensions: scalability, security, revocation, and implementation complexity.",
      mermaid: `mindmap
  root((Sessions vs Tokens))
    Sessions
      Server-side state
      Instant revocation
      Requires sticky sessions or shared store
      Vulnerable to CSRF
      Simple to implement
    JWT Tokens
      Stateless - no server store
      Scales horizontally
      Hard to revoke before expiry
      Larger payload in requests
      Vulnerable to XSS if in localStorage
    When to use Sessions
      Single server or small fleet
      Need instant logout
      Traditional web apps
    When to use JWT
      Microservices
      Mobile clients
      Third-party API access`,
    },
  ],
  animations: [
    {
      title: "Refresh Token Rotation",
      steps: [
        { label: "Login", detail: "Server issues access token (AT1, 15min) and refresh token (RT1, 30 days). RT1 is stored server-side in token family F1." },
        { label: "AT1 expires", detail: "After 15 minutes, the client's access token expires. API calls return 401." },
        { label: "Refresh", detail: "Client sends RT1 to /refresh. Server verifies RT1, marks it as 'used' (not deleted), issues new AT2 + RT2 in same family F1." },
        { label: "Normal use", detail: "Client uses AT2 for API calls. RT1 is used, RT2 is the current valid refresh token." },
        { label: "Attacker steals RT1", detail: "An attacker who stole RT1 earlier tries to use it at /refresh." },
        { label: "Reuse detected", detail: "Server sees RT1 is marked 'used'. This means token theft occurred. Server deletes ALL tokens in family F1, forcing both the attacker and the legitimate user to re-authenticate." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Session-Based (Cookies)", "Token-Based (JWT)"],
    rows: [
      ["State location", "Server (Redis/DB)", "Client (token payload)"],
      ["Scalability", "Requires shared session store", "Any server can verify independently"],
      ["Revocation", "Immediate (delete session)", "Not until expiry (without blocklist)"],
      ["CSRF vulnerable?", "Yes (mitigate with SameSite + CSRF token)", "No (tokens not sent automatically)"],
      ["XSS vulnerable?", "No (httpOnly cookie)", "Yes if stored in localStorage"],
      ["Mobile support", "Awkward (cookies are browser-centric)", "Natural (Authorization header)"],
      ["Microservices", "Requires shared session store", "Each service verifies independently"],
      ["Payload size", "Small (just session ID in cookie)", "Larger (JWT carries all claims)"],
      ["Best for", "Server-rendered web apps, same origin", "APIs, SPAs, mobile, microservices"],
    ],
  },
  interviewQA: [
    {
      q: "Why not just use long-lived JWTs instead of access + refresh tokens?",
      a: "A long-lived JWT (e.g., 30 days) can't be revoked if stolen — the attacker has 30 days of access. Short-lived access tokens (15 min) limit the damage window. Refresh tokens are stored server-side and CAN be revoked. This gives you stateless verification for the hot path (access token, no DB lookup) with revocation capability for the cold path (refresh token, DB lookup only every 15 minutes).",
      followUps: [
        "How does refresh token rotation with reuse detection work?",
        "Where should the refresh token be stored on the client?",
      ],
    },
    {
      q: "If JWTs are self-contained and don't need a database lookup, why do some systems still use sessions?",
      a: "Sessions provide immediate revocation (delete the session, user is instantly logged out), smaller request size (session ID vs full JWT with claims), and simpler security (httpOnly cookies are immune to XSS). For monolithic server-rendered apps that don't need to scale horizontally or serve mobile clients, sessions are simpler and more secure. The 'no database lookup' benefit of JWTs only matters at scale.",
    },
    {
      q: "How do you handle JWT revocation for a 'logout all devices' feature?",
      a: "Options: (1) Store a 'tokenVersion' per user in the DB. Increment it on 'logout all.' Include the version in the JWT. On verification, check if the JWT's version matches the DB version. (2) Maintain a blocklist of revoked JWTs in Redis (keyed by JTI). (3) Revoke all refresh tokens for the user — existing access tokens will expire within 15 minutes, and no new ones can be issued. Option 3 is the most common because it avoids per-request DB lookups.",
    },
    {
      q: "What is the BFF (Backend for Frontend) pattern and why is it used?",
      a: "A thin backend sits between the browser and the API. It handles OAuth flows, stores tokens server-side, and issues a session cookie to the browser. The browser never sees or stores tokens — it only has a session cookie. This combines the security of httpOnly cookies (no XSS exposure) with the benefits of token-based auth for the backend (stateless API verification). It's the recommended pattern for SPAs that use OAuth.",
    },
  ],
  followUps: [
    "How do you implement logout with a stateless JWT?",
    "Why is `localStorage` the wrong place for a token?",
    "What does a refresh token rotation scheme detect that a static one doesn't?",
  ],
  mcqs: [
    {
      q: "A user stores a JWT in localStorage. Which attack vector is this vulnerable to?",
      options: ["CSRF", "XSS", "SQL Injection", "Session fixation"],
      answerIndex: 1,
      explanation:
        "localStorage is accessible to any JavaScript running on the page. An XSS vulnerability would let an attacker read the JWT. httpOnly cookies are immune to this because JavaScript cannot access them.",
    },
    {
      q: "Why should the session ID be regenerated after login?",
      options: [
        "To reduce cookie size",
        "To prevent session fixation attacks",
        "To improve performance",
        "To comply with CORS",
      ],
      answerIndex: 1,
      explanation:
        "Session fixation: an attacker sets a known session ID in the victim's browser before login. If the session ID isn't regenerated after authentication, the attacker can use the known ID to hijack the authenticated session.",
    },
    {
      q: "What is the purpose of a refresh token family in token rotation?",
      options: [
        "To group tokens by user for batch operations",
        "To detect token reuse — if a used token is presented again, the entire family is revoked",
        "To support multiple devices with a single refresh token",
        "To encode the user's role hierarchy",
      ],
      answerIndex: 1,
      explanation:
        "A token family groups all refresh tokens in a rotation chain. When a used token is presented (indicating theft), the server revokes all tokens in the family, forcing re-authentication for both the attacker and the legitimate user.",
    },
  ],
  flashcards: [
    { front: "Why are short-lived access tokens paired with refresh tokens?", back: "Short-lived tokens limit the damage window if stolen (15 min vs 30 days). Refresh tokens are stored server-side and can be revoked, providing the revocation control that stateless JWTs lack." },
    { front: "What is session fixation?", back: "An attacker sets a known session ID in the victim's browser, then waits for the victim to log in. The session is now authenticated with an ID the attacker knows. Prevention: regenerate the session ID after login." },
    { front: "httpOnly + Secure + SameSite=Strict on cookies — what does each prevent?", back: "httpOnly: prevents JavaScript access (XSS protection). Secure: cookie only sent over HTTPS. SameSite=Strict: cookie not sent on cross-origin requests (CSRF protection)." },
    { front: "What is the BFF pattern?", back: "Backend for Frontend: a thin server stores tokens and issues session cookies to the browser. Browser never handles tokens directly, combining session security with token-based backend auth." },
    { front: "Sliding session vs absolute timeout?", back: "Sliding: extends on each request (inactivity timeout). Absolute: forces re-login after a fixed duration regardless of activity. Use both together for best security." },
  ],
  revisionNotes: [
    "Sessions: server-side state (Redis/DB), session ID in httpOnly cookie, immediately revocable.",
    "Tokens: client-side state (JWT), self-contained claims, not revocable until expiry.",
    "Access + refresh pattern: short-lived access token (15 min, stateless) + long-lived refresh token (30 days, server-side, revocable).",
    "Token rotation: issue new refresh token on each use, mark old as used, detect reuse to catch theft.",
    "Security: httpOnly cookies prevent XSS, SameSite prevents CSRF, Secure enforces HTTPS.",
    "localStorage tokens are XSS-vulnerable; httpOnly cookie tokens are CSRF-vulnerable (mitigate with SameSite).",
    "BFF pattern: best of both — tokens on server, session cookie on browser.",
    "Session fixation: always regenerate session ID after authentication.",
    "Session storage: Redis (fast, shared, TTL) > DB (durable, slower) > memory (lost on restart).",
  ],
  cheatSheet: [
    "Session: server stores state, cookie carries session ID",
    "Token: client carries all state in signed JWT",
    "Access token: 15 min, stateless, in Authorization header",
    "Refresh token: 30 days, server-side, rotated on use",
    "Cookie flags: httpOnly + Secure + SameSite=Strict",
    "Session fixation: regenerate session ID after login",
    "Reuse detection: mark used refresh tokens, revoke family on reuse",
    "BFF: thin backend holds tokens, browser gets session cookie only",
    "Sliding timeout (inactivity) + absolute timeout (max duration)",
  ],
  resources: [
    { label: "OWASP Session Management Cheat Sheet", kind: "docs", note: "Comprehensive guide to secure session management including cookie attributes and timeout policies." },
    { label: "Auth0: Token Best Practices", kind: "article", note: "Detailed guide on access tokens, refresh tokens, rotation, and storage." },
    { label: "The Ultimate Guide to Handling JWTs on Frontend Clients", kind: "article", note: "Hasura blog post covering token storage, XSS vs CSRF, and the BFF pattern." },
    { label: "RFC 6749: OAuth 2.0 Authorization Framework", kind: "docs", note: "The specification that defines access tokens, refresh tokens, and grant types." },
  ],
  glossary: [
    { term: "Session", definition: "Server-side storage of user state, identified by a session ID stored in a cookie. Stateful and immediately revocable." },
    { term: "JWT (JSON Web Token)", definition: "A self-contained, signed token carrying claims (identity, permissions). Stateless — any server can verify it without a database lookup." },
    { term: "Refresh token", definition: "A long-lived token stored server-side, used to obtain new access tokens. Can be revoked, solving JWT's revocation problem." },
    { term: "Token rotation", definition: "Issuing a new refresh token on each use and invalidating the old one. Enables reuse detection for theft mitigation." },
    { term: "BFF (Backend for Frontend)", definition: "A thin backend that stores tokens server-side and issues session cookies to the browser, combining cookie security with token-based backend auth." },
    { term: "Session fixation", definition: "An attack where the attacker sets a known session ID before the victim authenticates. Prevented by regenerating the session ID after login." },
    { term: "SameSite cookie attribute", definition: "Controls when cookies are sent with cross-origin requests. 'Strict' prevents CSRF by not sending the cookie on any cross-origin request." },
  ],
  exercises: [
    "Build a **session-based auth** system using Express and Redis. Set cookies with `httpOnly`, `secure`, and `sameSite: 'strict'`. Implement login, logout, and a protected route. Then deliberately introduce a **session fixation vulnerability** by *not* regenerating the session ID after login -- demonstrate the attack by setting a known session ID in a browser before logging in. Fix it with `req.session.regenerate()`.",
    "Implement **JWT access + refresh token rotation** with reuse detection. Issue a 15-minute access token and a 30-day refresh token stored server-side. Write a test that: (1) logs in, (2) uses the refresh token to get new tokens, (3) attempts to *reuse the old refresh token* -- verify that the entire token family is revoked and both the attacker and legitimate user must re-authenticate.",
    "Compare the **XSS and CSRF attack surfaces** of three token storage strategies: *localStorage*, *sessionStorage*, and *httpOnly cookies*. For each, write a proof-of-concept attack script (e.g., a malicious `<script>` tag reading localStorage, or a cross-origin form submission exploiting cookies). Document which cookie flags (`httpOnly`, `SameSite`, `Secure`) mitigate each attack.",
    "Implement both a **sliding session timeout** (30-minute inactivity window) and an **absolute timeout** (8-hour maximum duration) in a single auth middleware. Write tests that verify: (a) the session extends on activity, (b) the session expires after 30 minutes of inactivity, and (c) the session is forcibly terminated after 8 hours regardless of activity.",
    "Design a **\"logout from all devices\"** feature using JWTs. Implement and compare three approaches: (a) a per-user `tokenVersion` stored in the database and checked on each request, (b) a Redis-based JWT **blocklist** keyed by `jti`, and (c) revoking all refresh tokens and letting access tokens expire naturally. Measure the *latency overhead* each approach adds to every API request.",
  ],
};
