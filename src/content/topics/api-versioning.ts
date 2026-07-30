import type { TopicContent } from "../types";

export const apiVersioning: TopicContent = {
  quickSummary: [
    "API versioning allows you to evolve an API without breaking existing clients — common strategies include URL path versioning (/v1/users), custom header versioning (Api-Version: 2), and query parameter versioning (?version=1).",
    "Breaking changes (removing fields, renaming endpoints, changing response structure) require a new version; non-breaking changes (adding optional fields, new endpoints) can be deployed without versioning.",
    "Deprecation strategies involve sunset headers, migration guides, and grace periods to give consumers time to upgrade before old versions are removed.",
  ],
  detailed: [
    "URL path versioning (/api/v1/users, /api/v2/users) is the most common and visible approach. The version is part of the URL, making it easy to route, cache, and document. Each version can have its own controller/handler. Downsides: URL pollution (the resource identity changes between versions), difficulty sharing code between versions, and clients must update URLs to migrate. Used by GitHub, Stripe, and Google APIs.",
    "Header versioning uses a custom header (e.g., Api-Version: 2 or Accept: application/vnd.myapi.v2+json) to specify the version. The URL stays clean and represents the resource identity. The server reads the header and routes to the appropriate handler. Content negotiation via the Accept header aligns with REST principles (the same resource at different representations). Downsides: harder to test in a browser, less visible in logs, and CDN caching requires Vary header configuration. Used by GitHub (Accept header) and Stripe (Stripe-Version header).",
    "Query parameter versioning (/api/users?version=2) keeps the URL path clean while making the version visible. Easy to test and switch between versions. Downsides: mixes versioning concern with query parameters, can interfere with caching (different query strings = different cache keys), and feels less RESTful. Often used for internal APIs or as a fallback mechanism.",
    "Breaking changes are modifications that cause existing clients to fail: removing or renaming a field, changing a field's type, removing an endpoint, changing authentication requirements, altering error response format, or making an optional parameter required. Non-breaking changes are additive: adding new optional fields to a response, adding new endpoints, adding optional query parameters, or adding new enum values (if clients handle unknown values gracefully).",
    "Deprecation is the process of signaling that a version or feature will be removed. Best practices: (1) announce deprecation well in advance (6-12 months for public APIs), (2) add Sunset and Deprecation HTTP headers to responses, (3) publish migration guides showing how to adapt to the new version, (4) monitor usage of deprecated versions to identify clients that need to migrate, (5) provide tooling (SDKs, codemods) to automate migration where possible, (6) eventually return 410 Gone for sunset endpoints.",
    "Semantic versioning (SemVer) for APIs: MAJOR.MINOR.PATCH. Major version increments indicate breaking changes (new URL path version). Minor version increments add backward-compatible functionality. Patch version fixes bugs without changing the API contract. In practice, most API versioning only uses the major version number (v1, v2, v3) because clients care about breaking changes, not internal improvements.",
  ],
  deepDive: [
    "Stripe's versioning approach is unique and instructive. Instead of numbered versions, Stripe uses date-based versions (e.g., 2023-10-16). Each API key is pinned to the version that was current when the key was created. Clients can override with the Stripe-Version header. Internally, Stripe maintains a chain of version transformations: each version change is a small, reversible transform. A request for version 2020-08-27 passes through all transforms between that version and the current one. This allows maintaining many versions without duplicating code.",
    "API evolution without versioning is possible with careful design. GraphQL uses schema evolution: deprecated fields remain functional while new fields are added. REST APIs can use the expand pattern (clients opt into additional data), additive changes only, and tolerant readers (clients ignore unknown fields). The robustness principle (Postel's Law) — 'be conservative in what you send, liberal in what you accept' — guides this approach. However, some breaking changes are unavoidable (security fixes, legal requirements), making a versioning strategy necessary.",
    "Backend implementation of multiple API versions can follow several patterns: (1) Route-based — separate route handlers per version with shared business logic. (2) Middleware/transformer — a single current implementation with middleware that transforms requests/responses for older versions (Stripe's approach). (3) Branch-based — separate code branches per version (simple but maintenance-heavy). (4) Feature flags — version differences controlled by feature flags within shared code. The transformer approach is most maintainable for long-lived APIs because new features only need to be implemented once.",
    "API gateway versioning offloads version routing to the infrastructure layer. API gateways (Kong, AWS API Gateway, Apigee) can route different versions to different backend services or apply request/response transformations. This enables independent deployment of version-specific services and gradual migration. The gateway can also enforce deprecation by injecting Sunset headers or returning warnings for deprecated versions.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Express — URL path versioning with separate routers",
      source: `import express from 'express';

const app = express();

// V1 routes
const v1Router = express.Router();
v1Router.get('/users', async (req, res) => {
  const users = await db.users.findAll();
  // V1 response shape: flat object with fullName
  res.json(users.map(u => ({
    id: u.id,
    fullName: \`\${u.firstName} \${u.lastName}\`,
    email: u.email,
  })));
});

v1Router.get('/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: user.id,
    fullName: \`\${user.firstName} \${user.lastName}\`,
    email: user.email,
  });
});

// V2 routes — breaking changes from V1
const v2Router = express.Router();
v2Router.get('/users', async (req, res) => {
  const users = await db.users.findAll();
  // V2 response shape: nested name object, added createdAt
  res.json({
    data: users.map(u => ({
      id: u.id,
      name: { first: u.firstName, last: u.lastName },
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    })),
    meta: { total: users.length },
  });
});

v2Router.get('/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  res.json({
    data: {
      id: user.id,
      name: { first: user.firstName, last: user.lastName },
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

// Mount versioned routes
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

app.listen(3000);`,
    },
    {
      language: "typescript",
      caption: "Header-based versioning with middleware transformer pattern",
      source: `import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// Version detection middleware
function detectVersion(req: Request, res: Response, next: NextFunction) {
  // Check custom header first, then Accept header, then default
  const headerVersion = req.headers['api-version'] as string;
  const acceptVersion = parseAcceptVersion(req.headers.accept);

  req.apiVersion = headerVersion
    ? parseInt(headerVersion, 10)
    : acceptVersion ?? 2; // Default to latest

  // Add deprecation headers for old versions
  if (req.apiVersion === 1) {
    res.set('Deprecation', 'true');
    res.set('Sunset', 'Sat, 01 Mar 2025 00:00:00 GMT');
    res.set('Link', '</api/docs/migration-v1-to-v2>; rel="deprecation"');
  }

  next();
}

function parseAcceptVersion(accept?: string): number | undefined {
  // Parse: application/vnd.myapi.v2+json
  const match = accept?.match(/application\\/vnd\\.myapi\\.v(\\d+)\\+json/);
  return match ? parseInt(match[1], 10) : undefined;
}

// Response transformer: current implementation -> versioned response
function transformResponse(version: number, resource: string, data: any): any {
  if (version >= 2) return data; // Current version, no transform needed

  // V1 transformations
  if (resource === 'user') {
    // V2 has nested name; V1 expects flat fullName
    if (Array.isArray(data.data)) {
      return data.data.map((u: any) => ({
        id: u.id,
        fullName: \`\${u.name.first} \${u.name.last}\`,
        email: u.email,
      }));
    }
    const u = data.data;
    return {
      id: u.id,
      fullName: \`\${u.name.first} \${u.name.last}\`,
      email: u.email,
    };
  }

  return data;
}

app.use(detectVersion);

// Single implementation — always the latest version
app.get('/api/users', async (req: Request, res: Response) => {
  const users = await db.users.findAll();

  // Build V2 (current) response
  const response = {
    data: users.map(u => ({
      id: u.id,
      name: { first: u.firstName, last: u.lastName },
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    })),
    meta: { total: users.length },
  };

  // Transform for older versions
  res.json(transformResponse(req.apiVersion, 'user', response));
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      apiVersion: number;
    }
  }
}`,
    },
    {
      language: "typescript",
      caption: "Deprecation headers and sunset middleware",
      source: `import { Request, Response, NextFunction } from 'express';

interface VersionConfig {
  version: number;
  status: 'current' | 'deprecated' | 'sunset';
  sunsetDate?: string;        // ISO date when version will be removed
  migrationGuide?: string;    // URL to migration documentation
}

const VERSION_CONFIG: VersionConfig[] = [
  { version: 1, status: 'sunset', sunsetDate: '2024-06-01' },
  {
    version: 2,
    status: 'deprecated',
    sunsetDate: '2025-03-01',
    migrationGuide: 'https://api.example.com/docs/migrate-v2-to-v3',
  },
  { version: 3, status: 'current' },
];

export function versionGateMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = req.apiVersion;
  const config = VERSION_CONFIG.find(v => v.version === version);

  if (!config) {
    return res.status(400).json({
      error: {
        code: 'INVALID_VERSION',
        message: \`API version \${version} does not exist. Supported versions: \${
          VERSION_CONFIG.filter(v => v.status !== 'sunset').map(v => v.version).join(', ')
        }\`,
      },
    });
  }

  if (config.status === 'sunset') {
    return res.status(410).json({
      error: {
        code: 'VERSION_SUNSET',
        message: \`API version \${version} was removed on \${config.sunsetDate}. Please upgrade.\`,
        migrationGuide: config.migrationGuide,
      },
    });
  }

  if (config.status === 'deprecated') {
    // RFC 8594: Sunset header
    res.set('Sunset', new Date(config.sunsetDate!).toUTCString());
    // RFC 8594: Deprecation header
    res.set('Deprecation', 'true');
    // Link to migration guide
    if (config.migrationGuide) {
      res.set('Link', \`<\${config.migrationGuide}>; rel="deprecation"\`);
    }
    // Warning header (RFC 7234)
    res.set('Warning', \`299 - "API version \${version} is deprecated and will be removed on \${config.sunsetDate}"\`);
  }

  next();
}

// Usage in route:
// GET /api/users
// Response headers for v2:
//   Sunset: Sat, 01 Mar 2025 00:00:00 GMT
//   Deprecation: true
//   Link: <https://api.example.com/docs/migrate-v2-to-v3>; rel="deprecation"
//   Warning: 299 - "API version 2 is deprecated and will be removed on 2025-03-01"`,
    },
    {
      language: "typescript",
      caption: "API changelog and version negotiation utility",
      source: `// Track breaking vs non-breaking changes
interface ApiChange {
  version: string;       // SemVer or date-based
  date: string;
  type: 'breaking' | 'non-breaking' | 'deprecation';
  description: string;
  migration?: string;    // Migration instructions
}

const API_CHANGELOG: ApiChange[] = [
  {
    version: '3.0.0',
    date: '2024-09-01',
    type: 'breaking',
    description: 'User response: "fullName" replaced with "name" object containing "first" and "last"',
    migration: 'Replace user.fullName with \`\${user.name.first} \${user.name.last}\`',
  },
  {
    version: '3.0.0',
    date: '2024-09-01',
    type: 'breaking',
    description: 'All list endpoints now return { data: [], meta: { total } } wrapper instead of raw arrays',
    migration: 'Access list results via response.data instead of the response directly',
  },
  {
    version: '2.5.0',
    date: '2024-07-15',
    type: 'non-breaking',
    description: 'Added "createdAt" field to User response',
  },
  {
    version: '2.4.0',
    date: '2024-06-01',
    type: 'deprecation',
    description: 'Deprecated "fullName" field on User — use "name.first" and "name.last" instead',
  },
  {
    version: '2.3.0',
    date: '2024-05-01',
    type: 'non-breaking',
    description: 'Added GET /api/users/:id/activity endpoint',
  },
];

// Determine if a change is breaking
function isBreakingChange(change: string): boolean {
  const breakingPatterns = [
    'removed field',
    'renamed field',
    'changed type',
    'removed endpoint',
    'changed response structure',
    'made parameter required',
    'changed authentication',
    'removed enum value',
    'changed error format',
  ];
  return breakingPatterns.some(p => change.toLowerCase().includes(p));
}

// Non-breaking changes that are safe to deploy without versioning
function isNonBreakingChange(change: string): boolean {
  const safePatterns = [
    'added optional field',
    'added endpoint',
    'added optional parameter',
    'added enum value',
    'increased rate limit',
    'added header',
    'improved error message',
  ];
  return safePatterns.some(p => change.toLowerCase().includes(p));
}`,
    },
  ],
  comparison: {
    columns: ["Strategy", "Visibility", "Caching", "REST Purity", "Migration Effort"],
    rows: [
      ["URL path (/v1/)", "High — version in URL", "Easy — different URLs = different cache", "Low — resource identity changes", "High — clients update all URLs"],
      ["Custom header (Api-Version: 2)", "Low — hidden in headers", "Requires Vary header", "Medium — URL stays clean", "Low — change one header"],
      ["Accept header (content negotiation)", "Low — hidden in headers", "Requires Vary: Accept", "High — true content negotiation", "Low — change Accept header"],
      ["Query parameter (?v=2)", "Medium — visible in URL", "Different params = different cache", "Low — mixes concerns", "Low — add/change query param"],
      ["Date-based (Stripe-Version)", "Medium — in header", "Requires Vary header", "Medium", "Low — change header value"],
    ],
  },
  interviewQA: [
    {
      q: "What are the trade-offs between URL path versioning and header versioning?",
      a: "URL path versioning is explicit, easy to route, easy to cache (different URLs), and easy to document. But it changes the resource identity (the same user has different URIs in different versions), pollutes URLs, and requires clients to update all URLs when migrating. Header versioning keeps URLs clean (one URI per resource), aligns with REST content negotiation, and makes migration easier (change one header). But it is less visible, harder to test in browsers, requires Vary headers for caching, and is more complex to implement. Most public APIs choose URL path versioning for its simplicity and discoverability.",
      followUps: [
        "How does Stripe's date-based versioning work?",
        "Which approach would you recommend for a microservice internal API?",
      ],
    },
    {
      q: "How do you decide whether a change requires a new API version?",
      a: "A new version is required only for breaking changes: removing or renaming fields, changing field types, removing endpoints, changing response structure (e.g., wrapping in a data object), making optional parameters required, or changing authentication. Non-breaking changes can be deployed without versioning: adding optional fields, new endpoints, optional parameters, new enum values (if clients handle unknowns), increasing rate limits, or adding new response headers. The key principle: existing clients should continue to work without modifications after a non-breaking change.",
      followUps: [
        "Is adding a required field to a request body a breaking change?",
        "How do you handle enum values — is adding one breaking?",
      ],
    },
    {
      q: "How would you implement a deprecation strategy for a public API?",
      a: "A phased approach: (1) Announce deprecation at least 6-12 months before removal. Add Deprecation and Sunset HTTP headers to all responses from the deprecated version. (2) Publish a migration guide with code examples showing how to update. (3) Monitor usage metrics — identify which clients are still on the old version and reach out directly. (4) Provide automated migration tools (updated SDKs, codemods). (5) Start returning Warning headers with the sunset date. (6) After the sunset date, return 410 Gone with a message pointing to the migration guide. Throughout, track adoption of the new version and adjust timelines based on migration progress.",
    },
    {
      q: "Explain Stripe's approach to API versioning and why it is effective.",
      a: "Stripe uses date-based versions (e.g., 2023-10-16). Each API key is pinned to the version current at key creation time. Clients can override with the Stripe-Version header. Internally, each version change is implemented as a small, reversible transformation function. Requests pass through a chain of transformations between the client's version and the current version. This is effective because: (1) no code duplication — there is one current implementation, (2) old versions are maintained cheaply via transforms, (3) clients never break unexpectedly (pinned to their version), and (4) clients can upgrade incrementally by testing with a newer version header before committing.",
    },
  ],
  mcqs: [
    {
      q: "Which of the following is a breaking API change?",
      options: [
        "Adding a new optional query parameter",
        "Adding a new field to the response body",
        "Renaming an existing response field",
        "Adding a new API endpoint",
      ],
      answerIndex: 2,
      explanation:
        "Renaming a response field is a breaking change because existing clients that read the old field name will fail. Adding optional parameters, new fields, and new endpoints are all non-breaking (additive) changes.",
    },
    {
      q: "What HTTP header indicates when a deprecated API version will be removed?",
      options: ["Expires", "Sunset", "Cache-Control", "Deprecation-Date"],
      answerIndex: 1,
      explanation:
        "The Sunset header (RFC 8594) indicates the date after which the resource/endpoint will no longer be available. It is paired with the Deprecation header (which signals that deprecation is in effect) and a Link header pointing to migration documentation.",
    },
    {
      q: "Why is URL path versioning the most commonly used strategy for public APIs?",
      options: [
        "It is the most RESTful approach",
        "It is the most performant",
        "It is explicit, easy to route, easy to cache, and easy to document",
        "It uses less bandwidth than header versioning",
      ],
      answerIndex: 2,
      explanation:
        "URL path versioning is popular because the version is visible in the URL, making it easy to discover, test in browsers, route at the infrastructure level, cache (different URLs = different cache entries), and document. Despite not being the most RESTful approach (it changes resource identity), its simplicity wins in practice.",
    },
    {
      q: "In Stripe's date-based versioning, what happens when a client does not send a Stripe-Version header?",
      options: [
        "The latest version is used",
        "The request is rejected with an error",
        "The version pinned to the client's API key is used",
        "The oldest supported version is used",
      ],
      answerIndex: 2,
      explanation:
        "Each Stripe API key is pinned to the version that was current when the key was created. If no Stripe-Version header is sent, the pinned version is used. This ensures existing integrations never break, even as Stripe releases new versions. Clients can explicitly test newer versions by sending the header.",
    },
  ],
  flashcards: [
    {
      front: "What are the three main API versioning strategies?",
      back: "URL path (/api/v1/users), custom header (Api-Version: 2 or Accept: application/vnd.api.v2+json), and query parameter (/api/users?version=2). URL path is most common for public APIs; header versioning is most RESTful.",
    },
    {
      front: "What is the difference between a breaking and non-breaking API change?",
      back: "Breaking: removing/renaming fields, changing types, removing endpoints, changing response structure, making optional params required. Non-breaking: adding optional fields, new endpoints, optional params, new enum values. Non-breaking changes do not need a new version.",
    },
    {
      front: "What are the Sunset and Deprecation HTTP headers?",
      back: "Deprecation: true signals that the endpoint/version is deprecated. Sunset: <date> specifies when it will be removed. Used together with a Link header pointing to migration docs. Defined in RFC 8594.",
    },
    {
      front: "How does the transformer pattern for API versioning work?",
      back: "Maintain one current implementation. Each version difference is a small, reversible transformation. Older version requests pass through a chain of transforms to translate between the client's expected format and the current format. Avoids code duplication. Used by Stripe.",
    },
    {
      front: "What is Postel's Law and how does it relate to API evolution?",
      back: "Be conservative in what you send, liberal in what you accept. Clients should ignore unknown fields (tolerant readers). Servers should accept old formats gracefully. This principle enables non-breaking evolution without explicit versioning.",
    },
    {
      front: "Why does header-based versioning require a Vary header for caching?",
      back: "Without Vary: Api-Version, a CDN may cache the response for one version and serve it to clients requesting a different version (same URL). The Vary header tells caches that the response varies by the Api-Version header, creating separate cache entries per version.",
    },
  ],
  revisionNotes: [
    "Three strategies: URL path (most common, explicit), header (most RESTful, clean URLs), query param (simple but mixes concerns).",
    "Breaking changes: remove/rename fields, change types, remove endpoints, change response structure. Require new version.",
    "Non-breaking changes: add optional fields, new endpoints, optional params. No new version needed.",
    "Deprecation flow: announce -> add Sunset/Deprecation headers -> migration guide -> monitor usage -> 410 Gone.",
    "Stripe uses date-based versions with API key pinning and a chain of reversible transforms internally.",
    "Transformer pattern: one current codebase + version transforms = maintainable multi-version support.",
    "Semantic versioning for APIs: MAJOR (breaking), MINOR (additive), PATCH (bug fix). Usually only MAJOR matters.",
    "Vary header is required for header-based versioning to work correctly with CDN caching.",
  ],
  cheatSheet: [
    "URL path: app.use('/api/v1', v1Router); app.use('/api/v2', v2Router);",
    "Header: req.headers['api-version'] or parse Accept: application/vnd.myapi.v2+json",
    "Sunset header: res.set('Sunset', 'Sat, 01 Mar 2025 00:00:00 GMT')",
    "Deprecation header: res.set('Deprecation', 'true')",
    "Link to migration: res.set('Link', '</docs/migrate>; rel=\"deprecation\"')",
    "410 Gone for sunset versions: res.status(410).json({ error: 'Version removed' })",
    "Vary for caching: res.set('Vary', 'Api-Version') when using header versioning",
    "Breaking = removal/rename/type change; Non-breaking = addition of optional fields/endpoints",
  ],
  resources: [
    { label: "Stripe API Versioning", kind: "docs", note: "Stripe's documentation on their date-based versioning approach with API key pinning." },
    { label: "RFC 8594: The Sunset HTTP Header Field", kind: "docs", note: "The specification for the Sunset header used to signal endpoint removal dates." },
    { label: "API Design Patterns by JJ Geewax", kind: "book", note: "Covers versioning strategies, backward compatibility, and API evolution in detail." },
    { label: "Microsoft REST API Guidelines: Versioning", kind: "docs", note: "Microsoft's recommendations for API versioning including URL and header approaches." },
    { label: "Roy Fielding's REST Dissertation, Chapter 5", kind: "article", note: "Original REST constraints including the uniform interface principle relevant to versioning." },
    { label: "Evolving HTTP APIs by Mark Nottingham", kind: "article", note: "Practical guide on evolving APIs without breaking changes, covering tolerant readers and additive changes." },
  ],
  glossary: [
    { term: "Breaking change", definition: "A modification to an API that causes existing clients to fail. Includes removing fields, renaming endpoints, changing response structure, or altering authentication." },
    { term: "Non-breaking change", definition: "An additive modification that does not affect existing clients. Includes adding optional fields, new endpoints, or optional parameters." },
    { term: "Sunset header", definition: "An HTTP response header (RFC 8594) indicating the date after which a resource or API version will no longer be available." },
    { term: "Content negotiation", definition: "The mechanism by which a client and server agree on the response format using the Accept and Content-Type headers. Can be used for API versioning via custom media types." },
    { term: "Semantic versioning (SemVer)", definition: "A versioning scheme (MAJOR.MINOR.PATCH) where major increments indicate breaking changes, minor increments add backward-compatible features, and patches fix bugs." },
    { term: "Tolerant reader", definition: "A design principle where clients ignore unknown fields in API responses, enabling the server to add new fields without breaking existing clients." },
    { term: "API gateway", definition: "An infrastructure component that routes API requests, handles versioning, authentication, rate limiting, and request/response transformation." },
    { term: "Vary header", definition: "An HTTP header that tells caches which request headers affect the response. Required for header-based versioning to prevent serving cached responses for the wrong version." },
  ],
};
