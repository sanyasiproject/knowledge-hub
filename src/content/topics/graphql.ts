import type { TopicContent } from "../types";

export const graphql: TopicContent = {
  quickSummary: [
    "GraphQL is a query language and runtime for APIs that lets clients request exactly the data they need in a single request, eliminating over-fetching and under-fetching problems common with REST.",
    "A GraphQL schema defines types and their relationships using a strongly-typed SDL (Schema Definition Language). Resolvers are functions that fetch the actual data for each field in the schema.",
    "GraphQL supports three operation types: queries (read data), mutations (write data), and subscriptions (real-time data via WebSocket).",
    "The N+1 problem is GraphQL's most common performance pitfall: naively resolving nested fields causes one query per parent record. DataLoader solves this by batching and caching database calls.",
  ],
  detailed: [
    "## Schema and Type System\n\nThe schema is the contract between client and server. It defines types (`type User { id: ID!, name: String!, posts: [Post!]! }`), queries (`type Query { user(id: ID!): User }`), mutations (`type Mutation { createUser(name: String!): User! }`), and subscriptions. SDL supports: scalar types (String, Int, Float, Boolean, ID), object types, enums, interfaces, unions, input types, and custom scalars. The `!` suffix means non-nullable. Every schema has a root `Query` type; `Mutation` and `Subscription` are optional. The schema is introspectable: clients can query `__schema` to discover all types and fields at runtime, enabling tools like GraphiQL and auto-generated documentation.",
    "## Resolvers\n\nResolvers are functions that populate data for each field in the schema. A resolver receives four arguments: `parent` (the result of the parent resolver), `args` (field arguments from the query), `context` (shared per-request state like auth and dataloaders), and `info` (query AST and schema metadata). The resolution process is top-down: the root resolver runs first, then field resolvers run for each requested field. Default resolvers extract same-named properties from the parent object. You only need custom resolvers for fields that require computation, database queries, or cross-service calls.",
    "## Queries, Mutations, and Subscriptions\n\n**Queries** read data and are expected to be side-effect-free. **Mutations** write data and return the updated state. By convention, mutations use input types for complex arguments: `createUser(input: CreateUserInput!): User!`. **Subscriptions** provide real-time updates over WebSocket. The client sends a subscription operation, and the server pushes events as they occur. Subscriptions use a pub/sub pattern: resolvers publish events to channels, and the subscription resolver filters and delivers relevant events to connected clients. Common use cases include chat messages, notifications, and live dashboards.",
    "## The N+1 Problem and DataLoader\n\nConsider a query that fetches 10 users and each user's posts. Without optimization: 1 query for users + 10 queries for posts (one per user) = 11 queries. This is the N+1 problem. **DataLoader** solves it by: (1) collecting all requested keys during a single tick of the event loop, (2) making a single batched database call for all keys, (3) distributing results back to individual resolvers. DataLoader also provides per-request caching: if the same user is resolved twice in one request, the database is only queried once. DataLoader instances must be created per-request (in the context factory) to prevent data leaking between requests.",
    "## Security and Performance\n\nGraphQL's flexibility creates attack surface. **Query depth limiting** prevents deeply nested queries that could exhaust server resources. **Query complexity analysis** assigns cost to each field and rejects queries above a threshold. **Rate limiting** should be based on query complexity, not just request count. **Persisted queries** (pre-registered query hashes) prevent arbitrary queries in production. **Authorization** must be implemented in resolvers or a middleware layer: the schema describes what data exists, authorization determines who can access it. Never rely on schema visibility for security: assume attackers know your full schema via introspection.",
  ],
  deepDive: [
    "## Schema Design Best Practices\n\nGood schema design is the foundation of a maintainable GraphQL API. **Naming conventions**: use camelCase for fields and arguments, PascalCase for types, and SCREAMING_SNAKE_CASE for enum values. **Nullability strategy**: make fields non-nullable by default and only use nullable fields when null carries semantic meaning (e.g., a user's middle name). This forces the server to handle errors explicitly rather than silently returning null. **Pagination**: prefer Relay-style cursor-based pagination (`first`, `after`, `last`, `before` with a `Connection` type containing `edges` and `pageInfo`) over offset-based pagination, which breaks when items are inserted or deleted. **Input types**: always use dedicated input types for mutations (`input CreateUserInput { name: String!, email: String! }`) rather than individual arguments -- this makes the API extensible without breaking changes. **Deprecation**: use the `@deprecated(reason: \"Use newField instead\")` directive instead of removing fields, giving clients time to migrate.",
    "## Caching in GraphQL\n\nHTTP-level caching (ETags, Cache-Control) works poorly with GraphQL because all queries go to a single endpoint via POST. **Normalized client caching** (used by Apollo Client and urql) solves this: each entity is stored by its `__typename` and `id`, so updating a user in one query automatically updates it everywhere in the UI. This requires every type to have a stable `id` field. **Server-side caching** uses DataLoader's per-request cache and can be extended with a shared cache (Redis) keyed by query hash or field-level cache directives. **Persisted queries** help CDN caching: since queries are registered ahead of time, they can use GET requests with the query hash as a parameter, making them cacheable by standard HTTP infrastructure. **Automatic Persisted Queries (APQ)** is a hybrid: the client sends a hash first, and the server requests the full query only on a cache miss, then caches it for future requests.",
    "## Federation and Microservices\n\n**Apollo Federation** lets multiple teams own parts of a GraphQL schema independently. Each team builds a **subgraph** (a standalone GraphQL service that owns specific types) and a **gateway** (Apollo Router) merges them into a single **supergraph** that clients query. Key directives: `@key` marks an entity's primary key for cross-subgraph references, `@external` declares fields owned by another subgraph, and `@requires` specifies fields needed for a computed field. **Schema stitching** was the predecessor to Federation -- it merged schemas at the gateway level but required more manual configuration and didn't scale well with many teams. Federation's **entity resolution** pattern lets subgraphs extend types they don't own: if the Users subgraph defines `User`, the Reviews subgraph can extend it with a `reviews` field without modifying the Users service. The gateway handles the orchestration, making a single client request that fans out to multiple subgraphs transparently.",
  ],
  code: [
    {
      language: "graphql",
      caption: "Defining types, queries, and mutations in SDL",
      source: `type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  comments: [Comment!]!
  published: Boolean!
}

type Comment {
  id: ID!
  text: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}

input CreatePostInput {
  title: String!
  body: String!
  published: Boolean = false
}`,
    },
    {
      language: "graphql",
      caption: "Query composition with fragments and variables",
      source: `# Fragment for reusable field sets
fragment UserFields on User {
  id
  name
  email
}

fragment PostSummary on Post {
  id
  title
  published
  author {
    ...UserFields
  }
}

# Query using fragments and variables
query GetUserWithPosts($userId: ID!, $first: Int = 10) {
  user(id: $userId) {
    ...UserFields
    posts(first: $first) {
      edges {
        node {
          ...PostSummary
          comments {
            id
            text
            author {
              ...UserFields
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

# Variables (passed separately as JSON)
# { "userId": "123", "first": 5 }`,
    },
    {
      language: "typescript",
      caption: "Node.js resolvers with DataLoader to solve the N+1 problem",
      source: `import DataLoader from "dataloader";
import { db } from "./database";

// Create DataLoader instances per-request in the context factory
function createContext({ req }) {
  return {
    user: authenticate(req),
    loaders: {
      // Batches: collects all user IDs requested in one tick,
      // makes a single SELECT ... WHERE id IN (...) query
      userLoader: new DataLoader(async (userIds: readonly string[]) => {
        const users = await db.users.findByIds([...userIds]);
        // Must return results in the same order as input IDs
        const userMap = new Map(users.map(u => [u.id, u]));
        return userIds.map(id => userMap.get(id) || null);
      }),
      postsByUserLoader: new DataLoader(async (userIds: readonly string[]) => {
        const posts = await db.posts.findByUserIds([...userIds]);
        const grouped = new Map<string, Post[]>();
        posts.forEach(p => {
          const list = grouped.get(p.authorId) || [];
          list.push(p);
          grouped.set(p.authorId, list);
        });
        return userIds.map(id => grouped.get(id) || []);
      }),
    },
  };
}

const resolvers = {
  Query: {
    user: (_, { id }, { loaders }) => loaders.userLoader.load(id),
    users: (_, { first, after }) => db.users.paginate({ first, after }),
  },
  Post: {
    // Uses the DataLoader — even if 100 posts are returned,
    // only 1 batched query fetches all their authors
    author: (post, _, { loaders }) => loaders.userLoader.load(post.authorId),
  },
  User: {
    posts: (user, _, { loaders }) => loaders.postsByUserLoader.load(user.id),
  },
};`,
    },
    {
      language: "graphql",
      caption: "Mutation with input type and subscription for real-time updates",
      source: `# Mutation
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    body
    published
    author {
      id
      name
    }
  }
}

# Subscription — receives real-time updates via WebSocket
subscription OnPostCreated {
  postCreated {
    id
    title
    author {
      name
    }
  }
}

# Variables for the mutation
# {
#   "input": {
#     "title": "GraphQL Best Practices",
#     "body": "Always use DataLoader...",
#     "published": true
#   }
# }`,
    },
  ],
  comparison: {
    columns: ["Aspect", "GraphQL", "REST"],
    rows: [
      ["Data fetching", "Client specifies exact fields needed; single request for nested data", "Fixed response shape per endpoint; multiple calls for related resources"],
      ["Endpoint structure", "Single endpoint (e.g., /graphql) for all operations", "Multiple endpoints, one per resource (e.g., /users, /posts)"],
      ["Versioning", "No versioning needed — add fields, deprecate old ones", "Requires URL versioning (/v1/, /v2/) or header-based versioning"],
      ["Caching", "Requires normalized client cache (Apollo) or persisted queries for CDN", "Native HTTP caching (ETags, Cache-Control) works out of the box"],
      ["Type safety", "Strongly typed schema with introspection and code generation", "Relies on OpenAPI/Swagger specs (optional, often out of date)"],
      ["Real-time", "Built-in subscriptions over WebSocket", "Requires separate WebSocket or SSE implementation"],
      ["Learning curve", "Steeper — SDL, resolvers, DataLoader, client cache concepts", "Simpler — standard HTTP methods and status codes"],
    ],
  },
  diagrams: [
    {
      title: "GraphQL Request Lifecycle",
      kind: "sequence",
      caption: "How a GraphQL query is parsed, validated, and resolved on the server.",
      mermaid: `sequenceDiagram
    participant Client
    participant Server as GraphQL Server
    participant Resolver
    participant DB as Data Source
    Client->>Server: POST /graphql with query
    Server->>Server: Parse query to AST
    Server->>Server: Validate against schema
    alt Validation error
        Server-->>Client: 400 Validation errors
    end
    Server->>Resolver: Execute field resolvers
    Resolver->>DB: Fetch required data
    DB-->>Resolver: Data returned
    Resolver-->>Server: Resolved fields
    Server-->>Client: JSON response`,
    },
    {
      title: "REST vs GraphQL Data Fetching",
      kind: "flow",
      caption: "Comparing REST multiple round-trips to GraphQL single precise request.",
      mermaid: `flowchart TD
    subgraph REST Multiple Requests
        R1[GET /user/1] --> R2[GET /user/1/posts]
        R2 --> R3[GET /posts/1/comments]
        R3 --> R4[3 round trips with overfetch]
    end
    subgraph GraphQL Single Request
        G1[POST /graphql] --> G2[Resolve user fields]
        G2 --> G3[Resolve nested posts]
        G3 --> G4[Resolve nested comments]
        G4 --> G5[One response exact fields]
    end`,
    },
    {
      title: "GraphQL Schema Structure",
      kind: "architecture",
      caption: "Core building blocks of a GraphQL schema definition.",
      mermaid: `graph TD
    Schema --> Query[Query type root reads]
    Schema --> Mutation[Mutation type root writes]
    Schema --> Subscription[Subscription type realtime]
    Query --> OT[Object Types]
    OT --> SF[Scalar fields]
    OT --> NF[Nested object fields]
    OT --> LF[List fields]
    Schema --> Interfaces
    Schema --> Unions
    Schema --> InputTypes[Input Types for args]`,
    },
    {
      title: "N+1 Problem and DataLoader Solution",
      kind: "flow",
      caption: "How the N+1 query problem arises in GraphQL and how DataLoader solves it.",
      mermaid: `flowchart TD
    A[Query posts with authors] --> B[Resolve posts list 1 query]
    B --> C{DataLoader used?}
    C -- No --> D[Resolve author for post 1]
    D --> E[Resolve author for post 2]
    E --> F[Resolve author for post N]
    F --> G[N plus 1 total DB queries]
    C -- Yes --> H[Batch all author IDs]
    H --> I[Single query WHERE id IN ids]
    I --> J[1 query total]`,
    },
  ],
  animations: [
    {
      title: "GraphQL query resolution step by step",
      steps: [
        { label: "Client sends query", detail: "The client sends a query document specifying exactly which fields it needs, along with any variables." },
        { label: "Parse and validate", detail: "The server parses the query string into an AST and validates it against the schema — checking types, field existence, and argument correctness." },
        { label: "Execute root resolver", detail: "The executor starts at the root Query type and calls the resolver for the top-level field (e.g., user(id: \"123\"))." },
        { label: "Resolve nested fields", detail: "For each field in the selection set, the executor calls the corresponding resolver, passing the parent result. DataLoader collects IDs and defers database calls." },
        { label: "DataLoader batches", detail: "At the end of the event loop tick, DataLoader fires a single batched query for all collected IDs (e.g., SELECT * FROM posts WHERE user_id IN (...))." },
        { label: "Assemble response", detail: "Results are assembled into the exact shape requested by the client and returned as JSON. Only requested fields are included — no over-fetching." },
      ],
    },
  ],
  interviewQA: [
    {
      q: "How does GraphQL solve the over-fetching and under-fetching problems of REST?",
      a: "In REST, each endpoint returns a fixed data shape. Over-fetching: `/users/1` returns all user fields when you only need the name. Under-fetching: you need user + posts + comments, requiring 3 separate REST calls. GraphQL lets the client specify exactly which fields to return in a single request: `{ user(id: 1) { name posts { title } } }` returns only the requested fields in one round trip. The client controls the response shape, not the server.",
    },
    {
      q: "What is the N+1 problem in GraphQL and how do you solve it?",
      a: "When resolving nested fields, each parent record triggers a separate database query for its children. For 10 users, you get 1 query for users + 10 individual queries for each user's posts. DataLoader solves this by batching: it collects all requested IDs during a single event loop tick, makes one batched query (e.g., `SELECT * FROM posts WHERE user_id IN (1,2,...,10)`), and distributes results to individual resolvers. DataLoader must be instantiated per-request to avoid cache leaks between users.",
    },
    {
      q: "How should authorization be implemented in GraphQL?",
      a: "Authorization should be implemented in the resolver or business logic layer, not in the schema. The schema defines what data exists; resolvers check who can access it. Common patterns: check the authenticated user in context before returning data, use directive-based authorization (@auth(role: ADMIN)), or implement an authorization middleware layer. Never rely on hiding fields from the schema: attackers can discover your schema via introspection. Always validate permissions per field access.",
    },
    {
      q: "When would you choose GraphQL over REST?",
      a: "GraphQL excels when: clients need flexible queries with varying data requirements (mobile vs. web), the data model has complex relationships requiring multiple REST calls, multiple client teams need different views of the same data, or you want a strongly-typed API contract with auto-generated documentation. REST is better for: simple CRUD with fixed data shapes, file uploads, caching (REST uses HTTP caching natively; GraphQL requires custom caching), and when the team is small and the API surface is limited.",
    },
  ],
  mcqs: [
    {
      q: "What are the four arguments a GraphQL resolver receives?",
      options: [
        "query, schema, context, response",
        "parent, args, context, info",
        "request, response, next, error",
        "type, field, value, metadata",
      ],
      answerIndex: 1,
      explanation:
        "Resolvers receive: parent (result from the parent resolver), args (arguments passed to the field), context (shared per-request state like auth/dataloaders), and info (query AST and schema metadata).",
    },
    {
      q: "How does DataLoader solve the N+1 problem?",
      options: [
        "By caching all database results permanently",
        "By collecting keys during one event loop tick and making a single batched query",
        "By pre-loading all data at server startup",
        "By using GraphQL subscriptions instead of queries",
      ],
      answerIndex: 1,
      explanation:
        "DataLoader batches: it defers individual load calls, collects all requested keys during one tick of the event loop, then makes a single batched database call and distributes results.",
    },
    {
      q: "What does the `!` suffix mean in GraphQL SDL?",
      options: [
        "The field is deprecated",
        "The field is non-nullable (must always return a value)",
        "The field is unique",
        "The field is indexed",
      ],
      answerIndex: 1,
      explanation:
        "The `!` suffix marks a field as non-nullable. `String!` means the field will always return a String, never null. `[Post!]!` means a non-null list of non-null Post objects.",
    },
    {
      q: "Why should DataLoader instances be created per-request?",
      options: [
        "To improve performance through shared caching",
        "To prevent data leaking between different users' requests",
        "Because DataLoader instances cannot be reused",
        "To ensure DataLoader uses the correct database connection",
      ],
      answerIndex: 1,
      explanation:
        "DataLoader caches results. If shared across requests, user A's request might return cached data from user B's request, leaking private data. Per-request instances ensure isolation.",
    },
  ],
  flashcards: [
    { front: "What are GraphQL's three operation types?", back: "Queries (read data, side-effect-free), Mutations (write data, return updated state), and Subscriptions (real-time updates via WebSocket)." },
    { front: "What is the N+1 problem?", back: "Resolving N child records with N individual database queries plus 1 parent query. DataLoader solves it by batching all child queries into a single call." },
    { front: "What are the four resolver arguments?", back: "parent (parent result), args (field arguments), context (per-request shared state), info (query AST and schema metadata)." },
    { front: "What is schema introspection?", back: "The ability to query `__schema` and `__type` to discover all types, fields, and documentation at runtime. Powers tools like GraphiQL." },
    { front: "What is a persisted query?", back: "A pre-registered query identified by hash. Clients send the hash instead of the full query string, preventing arbitrary queries in production." },
    { front: "How does GraphQL handle real-time data?", back: "Subscriptions over WebSocket. The server pushes events using a pub/sub pattern. Clients subscribe to specific event types and receive updates as they occur." },
    { front: "What does `[Post!]!` mean in SDL?", back: "A non-null list of non-null Post objects. The list itself is always present (outer !), and every element in the list is a non-null Post (inner !)." },
  ],
  glossary: [
    { term: "SDL (Schema Definition Language)", definition: "GraphQL's type definition syntax for declaring types, queries, mutations, and subscriptions." },
    { term: "Resolver", definition: "A function that populates data for a specific field in the schema, receiving parent, args, context, and info." },
    { term: "DataLoader", definition: "A utility that batches and caches database calls within a single request to solve the N+1 problem." },
    { term: "Introspection", definition: "GraphQL's built-in ability to query the schema itself, discovering types, fields, and documentation at runtime." },
    { term: "Mutation", definition: "A GraphQL operation type for write operations that modify server-side data and return the updated state." },
    { term: "Subscription", definition: "A GraphQL operation type for real-time updates, delivering server-pushed events over WebSocket." },
    { term: "Persisted Query", definition: "A pre-registered query identified by hash, preventing clients from sending arbitrary queries to the server." },
  ],
  followUps: [
    "How does Apollo Client's normalized cache work, and when would you choose it over a simple query cache?",
    "What are the trade-offs of schema-first vs code-first GraphQL development?",
    "How does Apollo Federation differ from schema stitching, and when would you use each?",
    "What strategies exist for handling file uploads in GraphQL?",
    "How would you implement field-level authorization without repeating auth checks in every resolver?",
    "What is the difference between a GraphQL interface and a union, and when would you use each?",
  ],
  exercises: [
    "Design a GraphQL schema for an e-commerce platform with Users, Products, Orders, and Reviews. Include pagination for product listings, input types for creating orders, and a subscription for order status updates. Consider nullability carefully.",
    "You have a GraphQL API where a query fetching 50 products with their categories and reviews generates 150+ database queries. Identify the problem, implement DataLoader to solve it, and explain how you would verify the fix by inspecting the query count.",
    "Your GraphQL API is receiving deeply nested queries that cause server timeouts (e.g., user -> posts -> comments -> author -> posts -> comments...). Implement query depth limiting and query complexity analysis. Define cost values for each field and set a maximum complexity threshold.",
    "Migrate a REST API with endpoints GET /users/:id, GET /users/:id/posts, POST /users, and PATCH /users/:id to GraphQL. Write the schema, resolvers, and explain what changes clients need to make. Discuss what you gain and lose in the migration.",
    "Implement a real-time chat feature using GraphQL subscriptions. Design the schema (Message, Conversation types), the subscription resolver with pub/sub, and explain how you would handle authentication on the WebSocket connection.",
  ],
  cheatSheet: [
    "**Schema**: \`type Query { }\` is the entry point for reads; \`type Mutation { }\` for writes; \`type Subscription { }\` for real-time.",
    "**Non-nullable**: \`String!\` = always returns a value; \`[Post!]!\` = non-null list of non-null posts.",
    "**Resolver args**: \`(parent, args, context, info)\` -- parent is the parent object, context holds per-request state like auth and DataLoaders.",
    "**DataLoader**: create per-request, batch by collecting IDs during one event loop tick, return results in input order.",
    "**Fragments**: \`fragment UserFields on User { id name }\` -- reuse field selections across queries to stay DRY.",
    "**Variables**: pass dynamic values separately from the query string: \`query GetUser($id: ID!) { user(id: $id) { name } }\`.",
    "**Deprecation**: \`field: String @deprecated(reason: \"Use newField\")\` -- never remove fields, deprecate them.",
    "**Security checklist**: enable depth limiting, complexity analysis, persisted queries in production, and disable introspection.",
  ],
  revisionNotes: [
    "GraphQL = single endpoint, client-driven queries, strongly typed schema.",
    "Three operations: Query (read), Mutation (write), Subscription (real-time).",
    "Resolver chain: root -> nested fields, each resolver gets (parent, args, context, info).",
    "N+1 problem: use DataLoader to batch and cache database calls per-request.",
    "Fragments enable reusable field selections; variables separate dynamic values from query structure.",
    "HTTP caching doesn't work well with GraphQL; use normalized client caches (Apollo) or persisted queries.",
    "Federation: subgraphs own types independently, gateway merges them into a supergraph.",
    "Security: depth limiting, complexity analysis, persisted queries, resolver-level authorization.",
  ],
  resources: [
    { label: "graphql.org — Official specification and documentation", kind: "docs", note: "The authoritative reference for the GraphQL spec, type system, and best practices." },
    { label: "Apollo GraphQL documentation", kind: "docs", note: "Comprehensive guides for Apollo Server, Client, Federation, and Router." },
    { label: "Learning GraphQL by Eve Porcello and Alex Banks", kind: "book", note: "Practical introduction covering schema design, resolvers, and client integration." },
    { label: "Production Ready GraphQL by Marc-Andre Giroux", kind: "book", note: "Advanced patterns for schema design, performance, security, and versioning at scale." },
    { label: "GraphQL Best Practices — GitHub Engineering Blog", kind: "article", note: "GitHub's experience building and scaling their GraphQL API." },
  ],
};
