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
};
