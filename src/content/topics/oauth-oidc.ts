import type { TopicContent } from "../types";

export const oauthOidc: TopicContent = {
  quickSummary: [
    "OAuth 2.0 is an authorization framework — it lets a third-party app access a user's resources (on Google, GitHub, etc.) without the user sharing their password. OAuth issues access tokens, not identity information.",
    "OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0 — it adds authentication by introducing an ID token (a JWT containing user identity claims like name, email, and profile picture).",
    "The Authorization Code flow with PKCE is the recommended flow for all clients (web, mobile, SPA). Implicit flow is deprecated. Client Credentials is for machine-to-machine communication with no user involved.",
  ],
  detailed: [
    "OAuth 2.0 defines four roles: Resource Owner (the user), Client (the app requesting access), Authorization Server (issues tokens — Google, Auth0, Okta), and Resource Server (the API hosting protected resources). The client never sees the user's password — it receives a limited-scope access token that grants specific permissions.",
    "Authorization Code flow (the most secure): (1) Client redirects user to the authorization server with a request for specific scopes. (2) User authenticates and grants consent. (3) Authorization server redirects back with an authorization code. (4) Client exchanges the code for tokens by calling the token endpoint (server-to-server, with client authentication). The code is short-lived (usually 10 minutes) and single-use. This two-step exchange keeps tokens off the browser's URL bar and history.",
    "PKCE (Proof Key for Code Exchange, pronounced 'pixy'): an extension that prevents authorization code interception. The client generates a random code_verifier, hashes it to create a code_challenge (SHA-256), and sends the challenge with the authorization request. When exchanging the code for tokens, the client sends the original code_verifier. The server hashes it and compares it to the stored challenge. An attacker who intercepts the code can't exchange it without the code_verifier. PKCE is required for public clients (SPAs, mobile apps) and recommended for all clients.",
    "Implicit flow (deprecated): tokens were returned directly in the URL fragment after authorization. This was designed for SPAs that couldn't make server-side requests. It's deprecated because: tokens in URLs are logged in browser history and server logs, there's no client authentication, and no refresh tokens are issued. Use Authorization Code + PKCE instead.",
    "Client Credentials flow: for machine-to-machine (M2M) communication where no user is involved. The client authenticates directly with the authorization server using its client_id and client_secret, and receives an access token. Used for: service-to-service APIs, cron jobs, backend processes. No user consent or redirect is involved.",
    "Scopes define what permissions the access token grants. For example, 'read:email' allows reading the user's email, 'repo' allows accessing GitHub repositories. Scopes are requested by the client, approved by the user, and enforced by the resource server. The principle of least privilege applies — request only the scopes you need.",
    "OIDC adds an ID token to the OAuth flow. The ID token is a JWT containing identity claims: sub (unique user ID), name, email, picture, iss (issuer), aud (audience), exp (expiration), and iat (issued at). The ID token proves WHO the user is; the access token proves WHAT they can do. OIDC also defines a UserInfo endpoint where the client can fetch additional user claims using the access token.",
    "OIDC Discovery: the authorization server publishes a JSON document at /.well-known/openid-configuration containing all its endpoints (authorization, token, userinfo, JWKS), supported flows, supported scopes, and signing algorithms. Clients can auto-configure themselves by fetching this document. This enables dynamic registration and makes it easy to switch identity providers.",
  ],
  deepDive: [
    "Token introspection (RFC 7662): allows a resource server to ask the authorization server whether an access token is valid and what claims it carries. This is useful for opaque tokens (not JWTs) that the resource server can't verify locally. The resource server sends the token to the introspection endpoint and gets back active status, scope, client_id, username, and expiration. For JWTs, local verification is preferred (no network call needed).",
    "The state parameter prevents CSRF attacks on the authorization redirect. The client generates a random state value, stores it in the session, and includes it in the authorization request. When the authorization server redirects back, it includes the state. The client verifies the state matches what was stored — if not, the redirect was forged. Without state, an attacker could initiate an OAuth flow and trick the user into linking the attacker's account.",
    "Token binding and DPoP (Demonstration of Proof-of-Possession): standard OAuth access tokens are bearer tokens — anyone who has the token can use it. DPoP binds the token to a specific client key pair. The client generates a key pair, includes the public key in a signed DPoP proof header, and the authorization server binds the access token to that key. On each request, the client must prove possession of the private key. This prevents stolen tokens from being used by attackers.",
    "OIDC back-channel logout: when a user logs out of the IdP, it sends a logout token (a JWT) to a registered back-channel logout URI of each client. The client validates the token and terminates the user's local session. This ensures SSO logout propagates to all applications without relying on front-channel redirects, which are fragile and can be blocked by browsers.",
  ],
  code: [
    {
      language: "typescript",
      caption: "OAuth 2.0 Authorization Code flow with PKCE",
      source: `import crypto from "crypto";

// Step 1: Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

// Step 2: Build authorization URL
function getAuthorizationUrl(config: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
}) {
  const state = crypto.randomBytes(16).toString("hex"); // CSRF protection
  const nonce = crypto.randomBytes(16).toString("hex"); // Replay protection (OIDC)

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    code_challenge: config.codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce, // OIDC: included in the ID token for verification
  });

  return {
    url: \`\${config.authorizationEndpoint}?\${params}\`,
    state,
    nonce,
  };
}

// Step 3: Exchange authorization code for tokens
async function exchangeCodeForTokens(
  tokenEndpoint: string,
  code: string,
  codeVerifier: string,
  clientId: string,
  redirectUri: string
) {
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier, // PKCE proof
    }),
  });

  if (!response.ok) throw new Error("Token exchange failed");

  return response.json();
  // Returns: { access_token, token_type, expires_in, refresh_token, id_token }
}`,
    },
    {
      language: "typescript",
      caption: "Validating an OIDC ID token",
      source: `import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://auth.example.com/.well-known/jwks.json",
  cache: true,
  rateLimit: true,
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

async function verifyIdToken(
  idToken: string,
  expectedNonce: string,
  clientId: string
): Promise<OIDCClaims> {
  // Decode header to get kid (key ID)
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded) throw new Error("Invalid token format");

  const publicKey = await getSigningKey(decoded.header);

  const claims = jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    issuer: "https://auth.example.com",
    audience: clientId,
  }) as OIDCClaims;

  // Verify nonce to prevent replay attacks
  if (claims.nonce !== expectedNonce) {
    throw new Error("Nonce mismatch — possible replay attack");
  }

  return claims;
}

interface OIDCClaims {
  sub: string;          // Unique user identifier
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  nonce: string;
  iss: string;          // Issuer
  aud: string;          // Audience (client_id)
  exp: number;          // Expiration
  iat: number;          // Issued at
}`,
    },
    {
      language: "typescript",
      caption: "Client Credentials flow for machine-to-machine auth",
      source: `async function getM2MAccessToken(
  tokenEndpoint: string,
  clientId: string,
  clientSecret: string,
  scopes: string[]
): Promise<string> {
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Client authentication via Basic auth
      Authorization: \`Basic \${Buffer.from(\`\${clientId}:\${clientSecret}\`).toString("base64")}\`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: scopes.join(" "),
    }),
  });

  if (!response.ok) throw new Error("M2M token request failed");

  const { access_token } = await response.json();
  return access_token;
}

// Usage: backend service calling another service
async function callInternalAPI(endpoint: string) {
  const token = await getM2MAccessToken(
    "https://auth.example.com/oauth/token",
    process.env.SERVICE_CLIENT_ID!,
    process.env.SERVICE_CLIENT_SECRET!,
    ["read:orders", "write:inventory"]
  );

  return fetch(endpoint, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
}`,
    },
  ],
  diagrams: [
    {
      title: "Authorization Code Flow with PKCE",
      kind: "sequence",
      caption:
        "Client generates PKCE verifier/challenge, redirects user to auth server, user authenticates and consents, auth server redirects back with code, client exchanges code + verifier for tokens.",
    },
    {
      title: "OAuth 2.0 vs OIDC Token Comparison",
      kind: "architecture",
      caption:
        "OAuth issues only access tokens (what can you do?). OIDC adds an ID token (who are you?) on top of OAuth. The ID token is a JWT with identity claims; the access token may be opaque or a JWT.",
    },
    {
      title: "OIDC Discovery and JWKS Flow",
      kind: "flow",
      caption:
        "Client fetches /.well-known/openid-configuration to discover endpoints. Uses the jwks_uri to fetch public keys. Verifies ID tokens locally using the fetched keys without contacting the auth server.",
    },
  ],
  animations: [
    {
      title: "Authorization Code + PKCE Flow Step by Step",
      steps: [
        { label: "Generate PKCE", detail: "Client creates random code_verifier (43-128 chars) and derives code_challenge = SHA256(code_verifier) encoded as base64url." },
        { label: "Authorization request", detail: "Client redirects browser to authorization server with client_id, redirect_uri, scopes, state (CSRF), nonce (replay), and code_challenge." },
        { label: "User authenticates", detail: "User enters credentials at the authorization server (the client never sees the password). User reviews and approves the requested scopes." },
        { label: "Authorization code returned", detail: "Auth server redirects to redirect_uri with an authorization code and the state parameter. Client verifies state matches." },
        { label: "Token exchange", detail: "Client sends code + code_verifier to the token endpoint (server-to-server). Auth server hashes the verifier and compares to stored challenge." },
        { label: "Tokens received", detail: "Auth server returns access_token (for API calls), refresh_token (for renewals), and id_token (JWT with user identity — OIDC only)." },
        { label: "Verify ID token", detail: "Client fetches JWKS from auth server, verifies ID token signature, checks issuer, audience, expiration, and nonce." },
      ],
    },
  ],
  comparison: {
    columns: ["Flow", "User Involved?", "Client Type", "Tokens Returned", "Use Case"],
    rows: [
      ["Authorization Code + PKCE", "Yes", "Web, SPA, Mobile", "Access + Refresh + ID (OIDC)", "Most common — user login with third-party IdP"],
      ["Client Credentials", "No", "Backend service", "Access only", "Machine-to-machine, service accounts"],
      ["Implicit (deprecated)", "Yes", "SPA (legacy)", "Access only (no refresh)", "Replaced by Auth Code + PKCE"],
      ["Device Code", "Yes (on separate device)", "Smart TV, CLI, IoT", "Access + Refresh", "Devices without browsers"],
      ["Resource Owner Password (deprecated)", "Yes", "Trusted first-party only", "Access + Refresh", "Legacy — avoid in new systems"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between OAuth 2.0 and OpenID Connect?",
      a: "OAuth 2.0 is an authorization framework — it answers 'what can this app access?' by issuing access tokens with scoped permissions. It does NOT tell you who the user is. OpenID Connect is an authentication layer on top of OAuth — it answers 'who is this user?' by adding an ID token (a JWT with identity claims like name, email, sub). In short: OAuth = authorization (access tokens), OIDC = authentication (ID tokens) built on OAuth.",
      followUps: [
        "Can you use OAuth for authentication without OIDC?",
        "What claims are in an OIDC ID token?",
      ],
    },
    {
      q: "Why was the Implicit flow deprecated?",
      a: "Implicit returned access tokens directly in the URL fragment, which was logged in browser history, server logs, and referrer headers. It didn't support refresh tokens, had no client authentication, and was vulnerable to token leakage and replay attacks. Authorization Code + PKCE provides the same browser-only capability but with better security: the code is exchanged for tokens server-side (or via a secure channel with PKCE), and the code is single-use and short-lived.",
    },
    {
      q: "What does PKCE protect against?",
      a: "PKCE prevents authorization code interception attacks. Without PKCE, an attacker on the same device (via a malicious app registered for the same redirect URI on mobile, or browser extensions) could intercept the authorization code and exchange it for tokens. With PKCE, exchanging the code requires the code_verifier, which only the legitimate client has. The code_challenge (hash of the verifier) was sent with the initial request, and the server verifies the verifier matches before issuing tokens.",
    },
    {
      q: "What is token introspection and when would you use it?",
      a: "Token introspection (RFC 7662) lets a resource server ask the authorization server if a token is valid. It's used when access tokens are opaque (not JWTs) so the resource server can't verify them locally. The resource server sends the token to the introspection endpoint and gets back: active status, scope, client_id, username, expiration. For JWT access tokens, local verification is preferred because it avoids the network round-trip.",
    },
  ],
  mcqs: [
    {
      q: "In the Authorization Code flow, why is the code exchanged for tokens instead of returning tokens directly?",
      options: [
        "Codes are smaller than tokens",
        "It prevents tokens from appearing in URLs, browser history, and server logs",
        "The authorization server can't generate tokens during redirect",
        "Codes provide better encryption than tokens",
      ],
      answerIndex: 1,
      explanation:
        "The two-step exchange keeps tokens off the URL bar. The code is short-lived and single-use. The token exchange happens server-to-server (or with PKCE), where tokens can be securely transmitted in the response body.",
    },
    {
      q: "What is the purpose of the 'nonce' parameter in OIDC?",
      options: [
        "To encrypt the ID token",
        "To prevent CSRF attacks",
        "To prevent replay attacks — the ID token includes the nonce for verification",
        "To specify the token format",
      ],
      answerIndex: 2,
      explanation:
        "The nonce is a random value included in the authorization request and embedded in the ID token. The client verifies the nonce in the ID token matches what it sent, preventing an attacker from replaying a stolen ID token from a different session.",
    },
    {
      q: "Which OAuth flow should be used for a cron job that calls an API with no user interaction?",
      options: [
        "Authorization Code + PKCE",
        "Implicit",
        "Client Credentials",
        "Device Code",
      ],
      answerIndex: 2,
      explanation:
        "Client Credentials is for machine-to-machine communication where no user is involved. The service authenticates with its client_id and client_secret to obtain an access token.",
    },
  ],
  flashcards: [
    { front: "OAuth 2.0 vs OIDC — what does each provide?", back: "OAuth 2.0 = authorization (access tokens, scoped permissions, 'what can you do?'). OIDC = authentication (ID tokens with identity claims, 'who are you?'). OIDC is built on top of OAuth." },
    { front: "What is PKCE and why is it needed?", back: "Proof Key for Code Exchange. Client generates code_verifier, sends SHA256 hash (code_challenge) with auth request. On token exchange, sends the verifier. Prevents code interception because attacker doesn't have the verifier." },
    { front: "What is the 'state' parameter for?", back: "CSRF protection. Client generates a random state, stores it in the session, and includes it in the auth request. On callback, verifies the returned state matches. Prevents attackers from forging authorization redirects." },
    { front: "What does /.well-known/openid-configuration contain?", back: "OIDC Discovery document: all authorization server endpoints (authorize, token, userinfo, JWKS), supported grant types, scopes, signing algorithms, and claims. Enables auto-configuration." },
    { front: "Access token vs ID token?", back: "Access token: sent to resource servers, proves what you can do (scopes/permissions). ID token: consumed by the client, proves who you are (identity claims in a JWT). Never send the ID token to APIs." },
    { front: "When to use Client Credentials flow?", back: "Machine-to-machine (M2M) communication with no user involved: service-to-service APIs, cron jobs, backend processes. The service authenticates with client_id + client_secret." },
  ],
  revisionNotes: [
    "OAuth 2.0 = authorization (access tokens). OIDC = authentication (ID tokens) on top of OAuth.",
    "Authorization Code + PKCE is the recommended flow for all clients. Implicit is deprecated.",
    "PKCE: verifier (random), challenge = SHA256(verifier). Prevents code interception.",
    "state parameter = CSRF protection. nonce parameter = replay protection (OIDC).",
    "Client Credentials = M2M, no user. Device Code = devices without browsers (TV, CLI).",
    "ID token = JWT with identity (sub, name, email). Access token = permission grant (may be opaque).",
    "OIDC Discovery at /.well-known/openid-configuration. JWKS at the jwks_uri.",
    "Token introspection (RFC 7662): resource server asks auth server if opaque token is valid.",
    "DPoP: binds access token to client key pair, preventing stolen token use.",
  ],
  cheatSheet: [
    "OAuth = authorization (access tokens) | OIDC = authentication (ID tokens)",
    "Auth Code + PKCE: generate verifier -> hash to challenge -> send challenge -> exchange code + verifier",
    "state = CSRF protection | nonce = replay protection",
    "Client Credentials: POST /token with client_id + client_secret, grant_type=client_credentials",
    "OIDC Discovery: GET /.well-known/openid-configuration",
    "JWKS: GET /jwks.json -> cache public keys -> verify JWTs locally",
    "Scopes: openid (required for OIDC), profile, email, custom scopes",
    "Never send ID tokens to APIs — use access tokens. ID tokens are for the client only.",
    "Implicit flow is deprecated — always use Auth Code + PKCE",
  ],
  resources: [
    { label: "RFC 6749: OAuth 2.0 Authorization Framework", kind: "docs", note: "The core OAuth 2.0 specification defining grant types, tokens, and endpoints." },
    { label: "RFC 7636: PKCE for OAuth 2.0", kind: "docs", note: "The PKCE extension specification for securing public clients." },
    { label: "OpenID Connect Core 1.0 Specification", kind: "docs", note: "The OIDC specification adding authentication to OAuth 2.0." },
    { label: "OAuth 2.0 Simplified (oauth.com)", kind: "article", note: "Aaron Parecki's clear, practical guide to OAuth 2.0 flows and best practices." },
    { label: "The OAuth 2.0 Authorization Framework: Bearer Token Usage (RFC 6750)", kind: "docs", note: "How to use bearer tokens in HTTP requests." },
  ],
  glossary: [
    { term: "OAuth 2.0", definition: "An authorization framework that enables third-party applications to access resources on behalf of a user without receiving their credentials." },
    { term: "OpenID Connect (OIDC)", definition: "An authentication layer on top of OAuth 2.0 that adds ID tokens containing user identity claims." },
    { term: "Authorization Code", definition: "A short-lived, single-use code returned after user authentication, exchanged for tokens at the token endpoint." },
    { term: "PKCE", definition: "Proof Key for Code Exchange — a security extension that binds the authorization request to the token exchange, preventing code interception." },
    { term: "Access Token", definition: "A credential granting permission to access specific resources. May be a JWT or an opaque string." },
    { term: "ID Token", definition: "A JWT issued by OIDC containing user identity claims (sub, name, email). Consumed by the client, never sent to resource servers." },
    { term: "Scope", definition: "A permission boundary requested by the client and approved by the user, defining what the access token can do." },
    { term: "Token Introspection", definition: "An endpoint (RFC 7662) that allows resource servers to validate opaque access tokens by querying the authorization server." },
  ],
  exercises: [
    "Implement the full **Authorization Code + PKCE** flow for a single-page application. Generate the `code_verifier` and `code_challenge`, build the authorization URL with `state` and `nonce`, handle the callback, exchange the code for tokens, and validate the **ID token** by fetching JWKS. List every security check you perform and *why*.",
    "An attacker intercepts the **authorization code** from the redirect URI. Explain step by step why they *cannot* exchange it for tokens when **PKCE** is in use. Then explain what would happen if the application used the **Implicit flow** instead -- why is it deprecated?",
    "Design the token management strategy for a mobile app that uses OIDC. Cover: where to store the **access token**, **refresh token**, and **ID token**; how to handle token expiration and *silent refresh*; and what happens when the refresh token itself expires. Why should you *never* send the ID token to your API?",
    "You are migrating a legacy app from **Resource Owner Password Credentials** (ROPC) flow to **Authorization Code + PKCE**. Outline the migration steps, explain what changes on the client and server, and describe how to handle the transition period where some clients use the old flow.",
    "Fetch the **OIDC Discovery document** from a real provider (e.g., `https://accounts.google.com/.well-known/openid-configuration`). Identify and explain the purpose of each endpoint listed: `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, `jwks_uri`, and `revocation_endpoint`. How does a client use this document for **auto-configuration**?",
  ],
};
