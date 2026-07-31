import type { TopicContent } from "../types";

export const jwt: TopicContent = {
  quickSummary: [
    "A JSON Web Token (JWT) is a compact, URL-safe, self-contained token that carries claims (user identity, permissions, metadata) as a signed JSON payload — the server can verify its authenticity without a database lookup.",
    "JWTs have three parts separated by dots: Header (algorithm + type), Payload (claims like sub, exp, iat), and Signature (HMAC or RSA signature of header + payload).",
    "JWTs are stateless but irreversible — once issued, they can't be revoked until they expire, making short expiration times and refresh token rotation critical.",
  ],
  detailed: [
    "A JWT encodes three base64url-encoded JSON objects separated by dots: header.payload.signature. The header specifies the signing algorithm (HS256 for HMAC-SHA256, RS256 for RSA-SHA256, ES256 for ECDSA). The payload contains claims — standardized fields like sub (subject/user ID), exp (expiration), iat (issued at), iss (issuer), aud (audience) — plus any custom claims you add.",
    "The signature is computed over the encoded header and payload using a secret key (symmetric, HMAC) or a private key (asymmetric, RSA/ECDSA). The server verifies the signature using the same secret or the corresponding public key. This ensures the token hasn't been tampered with. Asymmetric signing is preferred in microservice architectures: the auth service signs with a private key, and all other services verify with the public key — no shared secret.",
    "The stateless nature of JWTs is both their superpower and their Achilles' heel. The server doesn't need to store sessions or query a database to verify a token — it just checks the signature and expiration. But this means you can't revoke a JWT before it expires (there's no server-side record to invalidate). If a user logs out or their account is compromised, the token remains valid until expiration.",
    "To mitigate this, use short-lived access tokens (5-15 minutes) paired with longer-lived refresh tokens. When the access token expires, the client sends the refresh token to get a new access token. Refresh tokens are stored server-side (in a database), so they can be revoked. This pattern (access + refresh) gives you the performance of stateless tokens with the control of stateful sessions.",
    "JWTs are often used for API authentication (Authorization: Bearer <token>), single sign-on (SSO), and service-to-service communication. They should not be used to store sensitive data (the payload is only encoded, not encrypted, by default) or as a replacement for sessions when you need immediate revocation.",
  ],
  deepDive: [
    "Common security pitfalls: (1) Using 'none' algorithm — some libraries accept alg: 'none', bypassing signature verification entirely. Always validate the algorithm server-side. (2) Algorithm confusion — if the server expects RS256 (asymmetric) but accepts HS256 (symmetric), an attacker can sign a token using the public key as the HMAC secret. Fix: hardcode the expected algorithm, never trust the token's header. (3) Missing expiration — always set and check exp. (4) Storing JWTs in localStorage — vulnerable to XSS. Use httpOnly cookies instead.",
    "JWE (JSON Web Encryption) encrypts the entire payload, not just signs it. Use JWE when the token contains sensitive data that shouldn't be readable by the client or intermediaries. JWS (JSON Web Signature, the standard JWT) only guarantees integrity, not confidentiality — anyone can decode the payload with base64.",
    "JWKS (JSON Web Key Set) is a standard for publishing the public keys used to verify JWTs. The auth server publishes a JWKS endpoint (/.well-known/jwks.json) containing the public keys. API servers fetch and cache these keys, rotating automatically when the auth server rotates signing keys. This is how OAuth 2.0 resource servers verify access tokens without contacting the auth server.",
    "Token size matters: JWTs can grow large if you add many claims (roles, permissions, user details). Every HTTP request carries the token, so a 2KB JWT adds 2KB to every API call. Keep payloads minimal — store only the user ID and essential claims, and look up the rest from a database or cache when needed.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Creating and verifying JWTs with jsonwebtoken (Node.js)",
      source: `const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET; // For HMAC (symmetric)

// --- Create a token ---
function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,                // Subject (user ID)
      email: user.email,           // Custom claim
      roles: user.roles,           // Custom claim
    },
    SECRET,
    {
      expiresIn: '15m',            // Short-lived access token
      issuer: 'myapp.com',
      audience: 'api.myapp.com',
    }
  );
}

// --- Verify a token ---
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],       // CRITICAL: whitelist algorithms
      issuer: 'myapp.com',
      audience: 'api.myapp.com',
    });
    return decoded; // { sub: '123', email: '...', roles: [...], iat: ..., exp: ... }
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new Error('Token expired');
    if (err.name === 'JsonWebTokenError') throw new Error('Invalid token');
    throw err;
  }
}

// --- Middleware ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}`,
    },
    {
      language: "cpp",
      caption: "JWT structure decoded — what's actually inside",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// Base64url decode (simplified for JWT use)
std::string base64url_decode(const std::string& input) {
    // Replace URL-safe characters and add padding
    std::string b64 = input;
    for (char& c : b64) {
        if (c == '-') c = '+';
        else if (c == '_') c = '/';
    }
    while (b64.size() % 4 != 0) b64 += '=';

    static const std::string chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string result;
    int val = 0, bits = -8;
    for (unsigned char c : b64) {
        if (c == '=') break;
        size_t pos = chars.find(c);
        if (pos == std::string::npos) continue;
        val = (val << 6) + static_cast<int>(pos);
        bits += 6;
        if (bits >= 0) {
            result += static_cast<char>((val >> bits) & 0xFF);
            bits -= 8;
        }
    }
    return result;
}

// Split a string by a delimiter character
std::vector<std::string> split(const std::string& s, char delim) {
    std::vector<std::string> parts;
    std::istringstream stream(s);
    std::string token;
    while (std::getline(stream, token, delim)) {
        parts.push_back(token);
    }
    return parts;
}

int main() {
    std::string token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWxpY2UiLCJpYXQiOjE3MTYwMDAwMDB9."
        "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    auto parts = split(token, '.');

    // Decode header
    std::string header = base64url_decode(parts[0]);
    std::cout << "Header:  " << header << "\\n";
    // {"alg":"HS256","typ":"JWT"}

    // Decode payload
    std::string payload = base64url_decode(parts[1]);
    std::cout << "Payload: " << payload << "\\n";
    // {"sub":"123","name":"Alice","iat":1716000000}

    // The signature (parts[2]) is NOT decodable as JSON --
    // it's the HMAC of header.payload.
    // Only the server with the secret can verify it.
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "JWT structure",
      kind: "architecture",
      caption: "Three base64url parts: Header (alg, typ) + Payload (sub, exp, iat, custom claims) + Signature (HMAC/RSA of header.payload).",
    },
    {
      title: "Access + Refresh token flow",
      kind: "sequence",
      caption: "Client authenticates → receives access token (15min) + refresh token (7d). Access token is used for API calls. When expired, refresh token is sent to get a new access token.",
    },
  ],
  animations: [
    {
      title: "JWT authentication flow",
      steps: [
        { label: "Login", detail: "Client sends credentials (username/password) to the auth endpoint." },
        { label: "Token creation", detail: "Server verifies credentials, creates a JWT with the user's ID, roles, and an expiration time. Signs it with a secret or private key." },
        { label: "Token returned", detail: "Server sends back the JWT (and optionally a refresh token). Client stores the JWT." },
        { label: "API request", detail: "Client includes the JWT in the Authorization header: 'Bearer eyJhbG...'." },
        { label: "Verification", detail: "Server extracts the token, verifies the signature (using the secret or public key), checks expiration, and reads claims." },
        { label: "Authorization", detail: "Server uses claims (roles, permissions) from the token to authorize the request. No database lookup needed." },
        { label: "Token expired", detail: "After 15 minutes, the access token expires. Client sends the refresh token to get a new access token." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "JWT (Stateless)", "Session Cookie (Stateful)"],
    rows: [
      ["Storage", "Client-side (cookie or header)", "Server-side (DB/Redis)"],
      ["Verification", "Signature check (no DB lookup)", "Session ID lookup in DB"],
      ["Revocation", "Hard (wait for expiry)", "Easy (delete session)"],
      ["Scalability", "Excellent (no shared state)", "Requires shared session store"],
      ["Size", "Larger (payload + signature)", "Small (just session ID)"],
      ["Cross-domain", "Easy (Authorization header)", "Harder (cookie domain rules)"],
      ["XSS risk", "High if in localStorage", "Low with httpOnly cookies"],
      ["Best for", "APIs, microservices, SPAs", "Traditional web apps, admin panels"],
    ],
  },
  interviewQA: [
    {
      q: "What are the three parts of a JWT?",
      a: "Header (JSON with algorithm and token type, base64url-encoded), Payload (JSON with claims like sub, exp, iat, and custom data, base64url-encoded), and Signature (HMAC or RSA signature of the encoded header + payload, ensuring integrity). They're concatenated with dots: header.payload.signature.",
      followUps: [
        "Is the payload encrypted? (No — it's only base64-encoded, meaning anyone can decode and read it. Use JWE for encryption if the payload is sensitive.)",
        "What's the difference between HS256 and RS256? (HS256 is symmetric — same secret for signing and verifying. RS256 is asymmetric — private key signs, public key verifies. RS256 is preferred in microservices.)",
      ],
    },
    {
      q: "How do you handle JWT revocation?",
      a: "JWTs are stateless, so you can't truly revoke them before expiration without adding server-side state. Practical strategies: (1) Use short-lived access tokens (5-15 min) so compromised tokens expire quickly. (2) Maintain a server-side blocklist of revoked token IDs (jti claim) — checked on each request (defeats some stateless benefits). (3) Use refresh token rotation — when a refresh token is used, issue a new one and invalidate the old one. (4) Change the signing key — invalidates ALL tokens, nuclear option. (5) Use token versioning — store a per-user version counter, reject tokens with old versions.",
      followUps: [
        "Doesn't a blocklist defeat the purpose of stateless tokens? (Partially — but checking a small blocklist is much faster than looking up every session. The blocklist only grows for the token's remaining lifetime.)",
      ],
    },
    {
      q: "Where should you store JWTs on the client?",
      a: "For web apps: httpOnly, Secure, SameSite cookies. This protects against XSS (JavaScript can't read httpOnly cookies) and CSRF (SameSite=Strict or Lax). Never store JWTs in localStorage or sessionStorage — they're accessible to any JavaScript, so a single XSS vulnerability exposes the token. For mobile apps: use secure storage (Keychain on iOS, Keystore on Android). For SPAs making cross-domain API calls: httpOnly cookies with proper CORS, or in-memory (lost on page refresh, use refresh tokens to recover).",
    },
  ],
  followUps: [
    "What is the 'none' algorithm attack and how do you prevent it?",
    "How does JWKS (JSON Web Key Set) work for key rotation?",
    "What is the difference between JWS and JWE?",
    "How do you implement refresh token rotation?",
    "Should you store user roles in the JWT or look them up per request?",
  ],
  mcqs: [
    {
      q: "What does the JWT signature verify?",
      options: [
        "That the payload is encrypted",
        "That the token hasn't been tampered with",
        "That the user is authorized for the request",
        "That the token is stored securely",
      ],
      answerIndex: 1,
      explanation: "The signature verifies integrity — that the header and payload haven't been modified since the token was signed. It does NOT encrypt the payload.",
    },
    {
      q: "Which is the safest place to store a JWT in a web browser?",
      options: ["localStorage", "sessionStorage", "httpOnly cookie", "URL query parameter"],
      answerIndex: 2,
      explanation: "httpOnly cookies cannot be accessed by JavaScript, protecting against XSS attacks. localStorage/sessionStorage are vulnerable to XSS. URL parameters expose tokens in logs and referrer headers.",
    },
    {
      q: "Why are short-lived access tokens recommended?",
      options: [
        "They use less storage",
        "They limit the damage window if a token is compromised",
        "They are faster to verify",
        "They don't need signatures",
      ],
      answerIndex: 1,
      explanation: "Since JWTs can't be easily revoked, a compromised short-lived token (5-15 min) is only useful for a brief window. Refresh tokens (revocable, stored server-side) are used to get new access tokens.",
    },
  ],
  exercises: [
    "Decode a JWT from jwt.io manually using base64 — identify the header, payload, and signature. What claims are present?",
    "Implement a JWT-based auth system with access tokens (15 min) and refresh tokens (7 days) in Node.js or Python. Include refresh token rotation.",
    "Demonstrate the 'none' algorithm vulnerability: create a token with alg: 'none' and test if your server accepts it. Fix the vulnerability.",
    "Build a middleware that extracts roles from a JWT and enforces role-based access control (admin can DELETE, user can only GET/POST).",
  ],
  flashcards: [
    { front: "JWT structure", back: "Header.Payload.Signature — three base64url-encoded parts separated by dots." },
    { front: "HS256 vs RS256", back: "HS256 = symmetric (shared secret). RS256 = asymmetric (private key signs, public key verifies). RS256 preferred for microservices." },
    { front: "Can you revoke a JWT?", back: "Not natively — JWTs are stateless. Use short expiry + refresh tokens, or maintain a blocklist (adds server-side state)." },
    { front: "Where to store JWT in browser?", back: "httpOnly, Secure, SameSite cookie. Never in localStorage (XSS vulnerable)." },
    { front: "Standard JWT claims", back: "sub (subject), exp (expiration), iat (issued at), iss (issuer), aud (audience), jti (JWT ID)." },
  ],
  revisionNotes: [
    "JWT = Header.Payload.Signature (base64url-encoded, dot-separated).",
    "Payload is signed, NOT encrypted. Anyone can read it. Use JWE for encryption.",
    "Stateless = no DB lookup to verify. But can't revoke before expiry.",
    "Use short-lived access tokens (15 min) + revocable refresh tokens (7 days).",
    "Store in httpOnly cookies (web) or secure storage (mobile). Never localStorage.",
    "Always whitelist algorithms server-side. Never trust alg from the token header.",
  ],
  cheatSheet: [
    "Signing: jwt.sign(payload, secret, { expiresIn: '15m', algorithm: 'HS256' })",
    "Verifying: jwt.verify(token, secret, { algorithms: ['HS256'] }) — whitelist algos!",
    "Claims: sub (who), exp (when expires), iat (when issued), iss (who issued), aud (for whom)",
    "Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    "Refresh flow: access expired → POST /auth/refresh { refreshToken } → new access + refresh",
  ],
  resources: [
    { label: "RFC 7519 — JSON Web Token", kind: "paper", note: "The JWT specification." },
    { label: "jwt.io", kind: "docs", note: "Interactive JWT decoder and debugger." },
    { label: "Auth0: JWT Handbook", kind: "book", note: "Free e-book covering JWT in depth." },
    { label: "Critical vulnerabilities in JSON Web Token libraries", kind: "article", note: "Tim McLean's article on algorithm confusion attacks." },
  ],
  glossary: [
    { term: "Claim", definition: "A key-value pair in the JWT payload — standard (sub, exp) or custom (roles, email)." },
    { term: "JWS", definition: "JSON Web Signature — a signed JWT (the common case). Guarantees integrity, not confidentiality." },
    { term: "JWE", definition: "JSON Web Encryption — an encrypted JWT. Guarantees both integrity and confidentiality of the payload." },
    { term: "JWKS", definition: "JSON Web Key Set — a published set of public keys for verifying JWTs, enabling key rotation." },
    { term: "Refresh token", definition: "A long-lived, revocable token stored server-side, used to obtain new access tokens without re-authentication." },
  ],
};
