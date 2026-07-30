import type { TopicContent } from "../types";

export const paginationFiltering: TopicContent = {
  quickSummary: [
    "Pagination divides large result sets into manageable pages — the three main strategies are offset-based (LIMIT/OFFSET), cursor-based (opaque pointer to last item), and keyset (WHERE clause on indexed columns).",
    "Filtering narrows results using conditions (equality, range, full-text search), while sorting determines the order. Both interact tightly with pagination — changing a filter or sort resets the pagination window.",
    "Cursor-based pagination is the gold standard for real-time feeds and large datasets because it's stable under inserts/deletes, while offset-based is simplest to implement but breaks down at scale.",
  ],
  detailed: [
    "Offset-based pagination uses SQL's LIMIT and OFFSET (or equivalent). Page 1 is LIMIT 20 OFFSET 0, page 2 is LIMIT 20 OFFSET 20, and so on. It's simple and allows jumping to arbitrary pages, but has two critical flaws: (1) performance degrades as offset grows because the database must scan and discard rows up to the offset, and (2) results shift when rows are inserted or deleted between requests — users may see duplicates or miss items.",
    "Cursor-based pagination uses an opaque token (the cursor) that encodes the position in the result set — typically the ID or timestamp of the last item returned. The client sends this cursor back to fetch the next page. The server decodes it into a WHERE clause (e.g., WHERE id > 42 LIMIT 20). This avoids the scan-and-discard problem and is stable under concurrent writes. The trade-off is you can't jump to page N directly — you can only go forward or backward.",
    "Keyset pagination is the underlying mechanism behind cursor-based pagination. Instead of an opaque cursor, you explicitly use WHERE clauses on the sort columns: WHERE (created_at, id) > ('2024-01-15', 42) ORDER BY created_at, id LIMIT 20. This requires a unique tiebreaker column (usually the primary key) and a composite index on the sort + tiebreaker columns. It's the most performant approach for large datasets.",
    "Filtering strategies include: exact match (status=active), range (price >= 10 AND price <= 100), pattern matching (LIKE/ILIKE for partial text), full-text search (using tsvector/GIN indexes in PostgreSQL or dedicated search engines like Elasticsearch), set membership (status IN ('active','pending')), and null checks. Compound filters combine multiple conditions with AND/OR logic.",
    "Sorting is tightly coupled to pagination. When using keyset pagination, the sort order must be deterministic — always include a unique tiebreaker column. Multi-column sorting (ORDER BY priority DESC, created_at ASC, id ASC) requires matching composite indexes for performance. Changing the sort order effectively resets pagination because the cursor is relative to the current sort.",
    "Pagination metadata should include: the current page's items, whether more items exist (hasNextPage / hasPreviousPage), cursors for navigation (startCursor, endCursor), and optionally a total count. Total count is expensive on large tables — consider omitting it or caching it separately with an approximate count.",
  ],
  deepDive: [
    "The seek method (keyset pagination) has a subtle complexity with multi-column sorts: for ORDER BY a DESC, b ASC with keyset values (a0, b0), the WHERE clause is WHERE (a < a0) OR (a = a0 AND b > b0). With three columns, the conditions nest further. ORMs like Prisma abstract this, but if writing raw SQL you need to construct the row-value comparison correctly. PostgreSQL supports row comparisons directly: WHERE (a, b) < (a0, b0) for uniform sort directions, but mixed ASC/DESC requires the expanded form.",
    "For APIs that support both filtering and full-text search, a common pattern is to use a dedicated search engine (Elasticsearch, Meilisearch, Typesense) for search queries and the primary database for structured filters. The search engine returns matching IDs, which are then used to fetch and filter results from the database. This hybrid approach gives you the best of both worlds: powerful full-text search with facets and relevance scoring, plus ACID-compliant filtering.",
    "Rate of change affects pagination strategy choice. For rapidly changing feeds (social media timelines, live dashboards), cursor-based is essential because offset-based would show duplicates or gaps. For slowly changing, admin-style data (user management tables), offset-based with page numbers is fine and provides a better UX with direct page navigation.",
    "GraphQL standardized cursor-based pagination through the Relay Connection specification: edges (array of {node, cursor}), pageInfo ({hasNextPage, hasPreviousPage, startCursor, endCursor}), and optional totalCount. This has become a de facto standard even outside GraphQL.",
  ],
  code: [
    {
      language: "sql",
      caption: "Offset-based vs keyset pagination in SQL",
      source: `-- Offset-based: simple but slow at high offsets
SELECT id, title, created_at
FROM articles
WHERE status = 'published'
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 10000;  -- DB scans 10020 rows, discards 10000

-- Keyset-based: fast regardless of position
SELECT id, title, created_at
FROM articles
WHERE status = 'published'
  AND (created_at, id) < ('2024-06-15T10:30:00Z', 5432)
ORDER BY created_at DESC, id DESC
LIMIT 20;  -- DB seeks directly to the position via index

-- Required composite index for keyset pagination
CREATE INDEX idx_articles_cursor
  ON articles (status, created_at DESC, id DESC);`,
    },
    {
      language: "typescript",
      caption: "Cursor-based pagination with base64-encoded cursors",
      source: `interface PaginatedResponse<T> {
  edges: { node: T; cursor: string }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount?: number;
}

function encodeCursor(createdAt: string, id: number): string {
  return Buffer.from(JSON.stringify({ createdAt, id })).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: number } {
  return JSON.parse(Buffer.from(cursor, "base64url").toString());
}

async function getArticles(
  filters: { status?: string; authorId?: number },
  first: number = 20,
  after?: string
): Promise<PaginatedResponse<Article>> {
  const conditions: string[] = ["1=1"];
  const params: any[] = [];

  if (filters.status) {
    conditions.push(\`status = $\${params.push(filters.status)}\`);
  }
  if (filters.authorId) {
    conditions.push(\`author_id = $\${params.push(filters.authorId)}\`);
  }

  if (after) {
    const { createdAt, id } = decodeCursor(after);
    conditions.push(
      \`(created_at, id) < ($\${params.push(createdAt)}, $\${params.push(id)})\`
    );
  }

  // Fetch one extra to determine hasNextPage
  const query = \`
    SELECT id, title, created_at, status, author_id
    FROM articles
    WHERE \${conditions.join(" AND ")}
    ORDER BY created_at DESC, id DESC
    LIMIT $\${params.push(first + 1)}
  \`;

  const rows = await db.query(query, params);
  const hasNextPage = rows.length > first;
  const items = rows.slice(0, first);

  return {
    edges: items.map((row) => ({
      node: row,
      cursor: encodeCursor(row.created_at, row.id),
    })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: items.length ? encodeCursor(items[0].created_at, items[0].id) : null,
      endCursor: items.length
        ? encodeCursor(items[items.length - 1].created_at, items[items.length - 1].id)
        : null,
    },
  };
}`,
    },
    {
      language: "typescript",
      caption: "Building compound filters from query parameters",
      source: `interface FilterParam {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "like" | "ilike";
  value: string | number | (string | number)[];
}

const ALLOWED_FIELDS = new Set(["status", "priority", "created_at", "author_id", "title"]);
const OP_MAP: Record<string, string> = {
  eq: "=", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=",
  in: "IN", like: "LIKE", ilike: "ILIKE",
};

function buildWhereClause(filters: FilterParam[]): { sql: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  for (const f of filters) {
    if (!ALLOWED_FIELDS.has(f.field)) {
      throw new Error(\`Filtering on '\${f.field}' is not allowed\`);
    }
    const op = OP_MAP[f.operator];
    if (!op) throw new Error(\`Unknown operator: \${f.operator}\`);

    if (f.operator === "in") {
      const values = Array.isArray(f.value) ? f.value : [f.value];
      const placeholders = values.map((v) => \`$\${params.push(v)}\`).join(", ");
      conditions.push(\`\${f.field} IN (\${placeholders})\`);
    } else {
      conditions.push(\`\${f.field} \${op} $\${params.push(f.value)}\`);
    }
  }

  return {
    sql: conditions.length ? conditions.join(" AND ") : "1=1",
    params,
  };
}`,
    },
  ],
  diagrams: [
    {
      title: "Offset vs Cursor vs Keyset Pagination",
      kind: "flow",
      caption:
        "Offset scans from the start each time, cursor uses an opaque pointer to resume from the last seen item, keyset uses indexed WHERE clauses for direct seeking.",
    },
    {
      title: "Filtering and Pagination Pipeline",
      kind: "flow",
      caption:
        "Request arrives with filter params, sort, and cursor. Filters are validated and applied as WHERE clauses, sort order determines the index used, cursor is decoded into a seek condition, and the query is executed with LIMIT + 1 to detect hasNextPage.",
    },
  ],
  animations: [
    {
      title: "Cursor-Based Pagination Walkthrough",
      steps: [
        { label: "Initial request", detail: "Client sends GET /articles?first=3 with no cursor." },
        { label: "Query execution", detail: "Server runs SELECT ... ORDER BY created_at DESC, id DESC LIMIT 4 (3+1 to check for next page)." },
        { label: "Response", detail: "Server returns 3 items with endCursor='eyJjcmVhdGVkX2F0Ij...' and hasNextPage=true (4th row existed)." },
        { label: "Next page request", detail: "Client sends GET /articles?first=3&after=eyJjcmVhdGVkX2F0Ij..." },
        { label: "Cursor decoded", detail: "Server decodes cursor to {createdAt: '2024-06-15', id: 42} and adds WHERE (created_at, id) < ('2024-06-15', 42)." },
        { label: "Stable results", detail: "Even if new articles were inserted since the first request, the cursor ensures no duplicates or gaps — it always resumes from the exact position." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Offset-Based", "Cursor-Based", "Keyset"],
    rows: [
      ["Jump to page N", "Yes", "No", "No"],
      ["Performance at depth", "Degrades (O(offset))", "Constant", "Constant"],
      ["Stable under writes", "No (shifts on insert/delete)", "Yes", "Yes"],
      ["Implementation complexity", "Simple", "Moderate", "Moderate"],
      ["Sort flexibility", "Any sort order", "Any (cursor encodes position)", "Requires index on sort columns"],
      ["Total count", "Easy (but expensive)", "Optional (expensive)", "Optional (expensive)"],
      ["Use case", "Admin panels, small datasets", "Feeds, timelines, APIs", "Large datasets, high performance"],
    ],
  },
  interviewQA: [
    {
      q: "Why does offset-based pagination become slow with large offsets?",
      a: "The database must scan all rows up to the offset before returning the requested page. For OFFSET 100000, the DB reads 100000 rows and discards them, which is wasted I/O. There's no way to seek directly to row 100000 without scanning, because the offset is relative to the filtered and sorted result set, not a physical position.",
      followUps: [
        "How would you mitigate this if you must support page numbers?",
        "Can you use a covering index to speed up offset pagination?",
      ],
    },
    {
      q: "How does cursor-based pagination handle items being deleted between requests?",
      a: "Because the cursor encodes the sort key values of the last seen item (not its position), deletion of previously seen items doesn't affect the cursor. The WHERE clause seeks to items after the cursor position. If the cursor item itself was deleted, the condition still works because it's a range comparison (e.g., id > 42), not an equality check on a specific row.",
    },
    {
      q: "How do you implement filtering securely to prevent SQL injection?",
      a: "Always use parameterized queries — never interpolate user input into SQL strings. Validate filter fields against an allowlist of columns. Validate operators against a known set. For 'IN' clauses, generate individual parameter placeholders for each value. Use an ORM or query builder that handles parameterization automatically.",
    },
    {
      q: "Should you always return totalCount in paginated responses?",
      a: "No. COUNT(*) on large tables can be very expensive, especially with filters. Options include: omitting it entirely, using approximate counts (pg_class.reltuples in PostgreSQL), caching the count with a TTL, or computing it asynchronously. Only include it when the UX genuinely requires it (e.g., showing 'Page 3 of 47').",
    },
  ],
  mcqs: [
    {
      q: "Which pagination strategy is most resilient to concurrent inserts and deletes?",
      options: [
        "Offset-based with page numbers",
        "Cursor-based (keyset) pagination",
        "LIMIT/OFFSET with cached total count",
        "Random sampling pagination",
      ],
      answerIndex: 1,
      explanation:
        "Cursor-based pagination uses the sort key of the last seen item to determine the next page, making it immune to shifts caused by inserts or deletes in earlier positions.",
    },
    {
      q: "What is the primary disadvantage of cursor-based pagination?",
      options: [
        "It requires more database indexes",
        "It cannot handle sorting",
        "Users cannot jump to an arbitrary page number",
        "It is incompatible with filtering",
      ],
      answerIndex: 2,
      explanation:
        "Cursor-based pagination only supports forward/backward traversal. You cannot compute the cursor for page N without traversing pages 1 through N-1.",
    },
    {
      q: "When using keyset pagination with ORDER BY created_at DESC, id DESC, what must the WHERE clause for the next page look like?",
      options: [
        "WHERE id > last_id",
        "WHERE created_at < last_created_at",
        "WHERE (created_at, id) < (last_created_at, last_id)",
        "WHERE OFFSET = page_size * page_number",
      ],
      answerIndex: 2,
      explanation:
        "Row-value comparison (created_at, id) < (last_created_at, last_id) correctly handles the composite sort, including tiebreaking on id when created_at values are equal.",
    },
  ],
  flashcards: [
    { front: "Why fetch LIMIT N+1 in cursor-based pagination?", back: "The extra row lets you determine hasNextPage without a separate COUNT query. If N+1 rows are returned, there's a next page; return only N to the client." },
    { front: "What is a tiebreaker column in keyset pagination?", back: "A unique column (usually the primary key) added to the sort order to guarantee deterministic ordering when the primary sort column has duplicate values." },
    { front: "What is the Relay Connection specification?", back: "A GraphQL standard for cursor-based pagination with edges (array of {node, cursor}), pageInfo ({hasNextPage, hasPreviousPage, startCursor, endCursor}), and optional totalCount." },
    { front: "Why is OFFSET 1000000 slow?", back: "The database must scan and discard 1,000,000 rows before returning the requested page. This is O(offset) I/O regardless of the page size." },
    { front: "How do you prevent SQL injection in dynamic filters?", back: "Use parameterized queries, validate field names against an allowlist, and validate operators against a known set. Never concatenate user input into SQL strings." },
  ],
  revisionNotes: [
    "Offset-based: LIMIT/OFFSET, supports page jumping, degrades at depth, unstable under writes.",
    "Cursor-based: opaque token encoding last-seen position, constant performance, stable under writes, no page jumping.",
    "Keyset: the SQL mechanism behind cursor-based — uses WHERE on indexed sort columns with a unique tiebreaker.",
    "Always include a unique tiebreaker column in your sort order for deterministic pagination.",
    "Fetch N+1 rows to determine hasNextPage without a COUNT query.",
    "Filter fields must be validated against an allowlist to prevent SQL injection and unauthorized data access.",
    "Total counts are expensive on large tables — consider approximate counts or omitting them.",
    "Compound filters: combine multiple WHERE conditions with AND/OR, always using parameterized queries.",
  ],
  cheatSheet: [
    "Offset: SELECT ... ORDER BY col LIMIT 20 OFFSET 40",
    "Keyset: SELECT ... WHERE (col, id) < (last_val, last_id) ORDER BY col DESC, id DESC LIMIT 20",
    "Cursor = base64url(JSON.stringify({ sortValue, id }))",
    "hasNextPage = rows.length > requestedLimit (fetch limit+1)",
    "Always add a unique tiebreaker to ORDER BY for deterministic results",
    "Index must match the WHERE + ORDER BY for keyset to be fast",
    "Validate filter fields against allowlist, use parameterized queries",
    "Relay spec: { edges: [{node, cursor}], pageInfo: {hasNextPage, endCursor, ...} }",
  ],
  resources: [
    { label: "Use The Index, Luke — Pagination Done the Right Way", kind: "article", note: "Deep dive into keyset pagination with SQL examples and index design." },
    { label: "Relay Cursor Connections Specification", kind: "docs", note: "The GraphQL standard for cursor-based pagination." },
    { label: "Pagination: You're (Probably) Doing It Wrong", kind: "article", note: "Slack engineering blog on why they moved from offset to cursor-based pagination." },
  ],
  glossary: [
    { term: "Offset pagination", definition: "Pagination using LIMIT and OFFSET to skip a fixed number of rows. Simple but degrades at high offsets." },
    { term: "Cursor", definition: "An opaque token encoding the position of the last item returned, used to fetch the next page without rescanning." },
    { term: "Keyset pagination", definition: "Using WHERE clauses on indexed sort columns to seek directly to the next page. The mechanism behind cursor-based pagination." },
    { term: "Tiebreaker column", definition: "A unique column added to the sort order to ensure deterministic ordering when primary sort values are duplicated." },
    { term: "Compound filter", definition: "Multiple filter conditions combined with AND/OR logic to narrow results." },
    { term: "Faceted search", definition: "Filtering that shows available filter values and counts alongside results, commonly implemented with search engines like Elasticsearch." },
  ],
};
