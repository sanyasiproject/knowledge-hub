import type { TopicContent } from "../types";

export const graphDatabases: TopicContent = {
  quickSummary: [
    "Graph databases store data as nodes (entities) and relationships (edges) with properties on both, enabling efficient traversal of highly connected data without expensive joins.",
    "Neo4j is the leading property graph database, using the Cypher query language for declarative pattern matching over graph structures.",
    "Graph databases excel at relationship-heavy queries — social networks, recommendation engines, fraud detection, knowledge graphs — where relational databases require multiple self-joins or recursive CTEs.",
    "Index-free adjacency means each node directly references its neighbors, making traversal time proportional to the subgraph visited, not the total graph size.",
  ],
  detailed: [
    "The property graph model consists of nodes (vertices) and relationships (edges). Both can have labels (types) and properties (key-value pairs). Relationships are directed, have exactly one type, and connect exactly two nodes. Unlike relational databases where relationships are implicit (foreign keys resolved via joins), graph databases make relationships first-class citizens stored alongside the data they connect.",
    "Index-free adjacency is the key architectural differentiator of native graph databases like Neo4j. Each node contains a direct pointer to its adjacent nodes and relationships. Traversing from one node to its neighbors is a constant-time operation regardless of the total graph size. In contrast, relational databases must perform index lookups or hash joins to follow foreign key relationships, with cost proportional to the table size.",
    "Cypher is Neo4j's declarative graph query language. It uses ASCII-art patterns to describe graph structures: (a)-[:KNOWS]->(b) matches node a connected to node b via a KNOWS relationship. Cypher supports pattern matching, filtering, aggregation, path finding, and graph mutations. Its visual syntax makes complex traversals readable compared to equivalent SQL with multiple self-joins.",
    "Graph algorithms run natively on the graph structure for analytics and machine learning. Shortest path algorithms (Dijkstra, A*) find optimal routes. Community detection (Louvain, Label Propagation) identifies clusters. Centrality algorithms (PageRank, Betweenness) measure node importance. Similarity algorithms (Jaccard, Cosine) find related nodes. Neo4j's Graph Data Science library provides production-ready implementations of these algorithms.",
    "Traversal strategies determine how the graph is explored. Breadth-first search (BFS) explores neighbors level by level — ideal for shortest path in unweighted graphs. Depth-first search (DFS) follows paths to their end before backtracking — useful for cycle detection and topological sorting. Bidirectional traversal starts from both endpoints simultaneously, meeting in the middle for exponential speedup on shortest-path queries.",
    "Graph databases handle schema-optional data naturally. Nodes with the same label can have different properties, and new relationship types can be introduced without migration. Schema enforcement (property existence constraints, property type constraints, relationship count constraints) is available when needed but optional.",
    "Relationship types encode semantic meaning: a Person WORKS_AT a Company, LIVES_IN a City, KNOWS another Person. This is richer than relational foreign keys, which express only 'references' without semantic context. Multiple relationship types between the same nodes capture different aspects of their connection.",
    "Performance characteristics differ from relational databases. Graph databases are slower for full-table scans and aggregations over all entities (e.g., 'average salary of all employees'). They shine when queries involve variable-length paths, recursive traversals, or pattern matching over connected data — scenarios where relational databases degrade due to cascading joins.",
  ],
  deepDive: [
    "Neo4j's native storage engine uses separate store files for nodes, relationships, properties, and labels. Each node record is a fixed-size (15 bytes) entry containing pointers to its first relationship and first property. Relationship records (34 bytes) form a doubly-linked list for each node and store pointers to start/end nodes, relationship type, and next/previous relationships for both nodes. This fixed-size record structure enables O(1) lookups by internal ID and efficient traversal without index lookups.",
    "Transaction handling in Neo4j uses write-ahead logging and MVCC. Readers see a consistent snapshot and are never blocked by writers. Writers acquire record-level locks; deadlocks are detected and one transaction is rolled back. Neo4j supports full ACID transactions, including across multiple nodes and relationships within a single transaction — unlike many NoSQL stores that limit atomicity to single records.",
    "Neo4j's query planner transforms Cypher queries into execution plans using cost-based optimization. It considers index availability, cardinality estimates, and join strategies. The EXPLAIN command shows the plan without executing; PROFILE shows the plan with actual row counts and database hits. Understanding query plans is essential for performance tuning — a bad plan can turn a millisecond query into a minutes-long scan.",
    "Causal clustering in Neo4j provides high availability and read scaling. A core cluster of servers uses the Raft consensus protocol for writes, ensuring data durability. Read replicas asynchronously replicate data from core servers, handling read traffic. Causal consistency is maintained through bookmarks: after a write, the client receives a bookmark that, when passed to subsequent reads (even on different servers), guarantees those reads see the write.",
    "RDF (Resource Description Framework) triple stores are an alternative graph model where data is stored as subject-predicate-object triples. SPARQL is the query language. RDF is the foundation of the Semantic Web and linked data. Compared to property graphs, RDF has a more rigid, standardized model (W3C standard) but property graphs are more intuitive for application developers and typically offer better performance for traversal-heavy workloads.",
  ],
  code: [
    {
      language: "cypher",
      caption: "Creating nodes and relationships",
      source: `// Create people with properties
CREATE (alice:Person {name: 'Alice', age: 34, role: 'Engineer'})
CREATE (bob:Person {name: 'Bob', age: 29, role: 'Designer'})
CREATE (carol:Person {name: 'Carol', age: 41, role: 'Manager'})

// Create a company and city
CREATE (acme:Company {name: 'Acme Corp', founded: 2010})
CREATE (sf:City {name: 'San Francisco', state: 'CA'})

// Create relationships with properties
CREATE (alice)-[:WORKS_AT {since: 2019, department: 'Platform'}]->(acme)
CREATE (bob)-[:WORKS_AT {since: 2021, department: 'Product'}]->(acme)
CREATE (carol)-[:MANAGES {since: 2020}]->(alice)
CREATE (carol)-[:MANAGES {since: 2021}]->(bob)
CREATE (alice)-[:KNOWS {since: 2018}]->(bob)
CREATE (alice)-[:LIVES_IN]->(sf)
CREATE (acme)-[:HEADQUARTERED_IN]->(sf)`
    },
    {
      language: "cypher",
      caption: "Pattern matching and traversal queries",
      source: `// Find friends of friends (2nd degree connections)
MATCH (me:Person {name: 'Alice'})-[:KNOWS]->()-[:KNOWS]->(fof:Person)
WHERE fof <> me
  AND NOT (me)-[:KNOWS]->(fof)
RETURN DISTINCT fof.name AS suggestion, count(*) AS mutual_friends
ORDER BY mutual_friends DESC

// Find the shortest path between two people
MATCH path = shortestPath(
  (a:Person {name: 'Alice'})-[:KNOWS*..6]-(b:Person {name: 'Dave'})
)
RETURN path, length(path) AS hops

// All paths up to 4 hops (with relationship types)
MATCH path = (a:Person {name: 'Alice'})-[*..4]-(b:Person {name: 'Dave'})
RETURN path, [r IN relationships(path) | type(r)] AS rel_types,
       [n IN nodes(path) | n.name] AS node_names

// Variable-length pattern: all people in Alice's management chain
MATCH (alice:Person {name: 'Alice'})<-[:MANAGES*]-(manager:Person)
RETURN manager.name, length(
  shortestPath((alice)<-[:MANAGES*]-(manager))
) AS levels_up`
    },
    {
      language: "cypher",
      caption: "Aggregation, CASE, and subqueries",
      source: `// Department headcount and average tenure
MATCH (p:Person)-[w:WORKS_AT]->(c:Company {name: 'Acme Corp'})
RETURN w.department AS department,
       count(p) AS headcount,
       avg(date().year - w.since) AS avg_years,
       collect(p.name) AS members
ORDER BY headcount DESC

// Conditional categorization
MATCH (p:Person)-[w:WORKS_AT]->(c:Company)
RETURN p.name,
  CASE
    WHEN date().year - w.since >= 5 THEN 'Senior'
    WHEN date().year - w.since >= 2 THEN 'Mid-level'
    ELSE 'Junior'
  END AS seniority

// Subquery: find people whose teams are larger than average
CALL {
  MATCH (p:Person)-[:WORKS_AT]->(c:Company)
  RETURN c, count(p) AS total
}
WITH c, total
MATCH (manager:Person)-[:MANAGES]->(report:Person)-[:WORKS_AT]->(c)
WITH manager, count(report) AS team_size, total
WHERE team_size > total * 0.2
RETURN manager.name, team_size`
    },
    {
      language: "cypher",
      caption: "Fraud detection: finding suspicious transaction rings",
      source: `// Find circular money flows (potential money laundering)
MATCH ring = (a:Account)-[:TRANSFERRED_TO*3..6]->(a)
WHERE ALL(t IN relationships(ring)
  WHERE t.amount > 10000
    AND t.timestamp > datetime() - duration('P30D'))
WITH a, ring,
     reduce(total = 0, t IN relationships(ring) | total + t.amount) AS ring_total
WHERE ring_total > 100000
RETURN a.account_id,
       length(ring) AS ring_size,
       ring_total,
       [t IN relationships(ring) | {
         from: startNode(t).account_id,
         to: endNode(t).account_id,
         amount: t.amount,
         timestamp: t.timestamp
       }] AS transactions
ORDER BY ring_total DESC

// Find accounts with unusual fan-out patterns
MATCH (a:Account)-[t:TRANSFERRED_TO]->(target:Account)
WHERE t.timestamp > datetime() - duration('P7D')
WITH a, count(DISTINCT target) AS unique_targets,
     sum(t.amount) AS total_sent
WHERE unique_targets > 50 AND total_sent > 500000
RETURN a.account_id, unique_targets, total_sent`
    },
    {
      language: "cypher",
      caption: "Graph Data Science: PageRank and community detection",
      source: `// Project a named graph for analysis
CALL gds.graph.project(
  'social-graph',
  'Person',
  'KNOWS',
  { relationshipProperties: ['since'] }
)

// Run PageRank to find influential people
CALL gds.pageRank.stream('social-graph')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS person, score
RETURN person.name, round(score, 4) AS pageRank
ORDER BY pageRank DESC
LIMIT 10

// Detect communities using Louvain
CALL gds.louvain.stream('social-graph')
YIELD nodeId, communityId
WITH gds.util.asNode(nodeId) AS person, communityId
RETURN communityId, collect(person.name) AS members, count(*) AS size
ORDER BY size DESC

// Betweenness centrality: find bridge nodes
CALL gds.betweenness.stream('social-graph')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS person, score
WHERE score > 0
RETURN person.name, round(score, 2) AS betweenness
ORDER BY betweenness DESC`
    },
  ],
  diagrams: [
    {
      title: "Property Graph Data Model",
      kind: "architecture",
      caption: "Core components of a property graph: nodes, relationships, and properties.",
      mermaid: `graph LR
    Alice[Person: Alice] -->|KNOWS| Bob[Person: Bob]
    Alice -->|WORKS_AT| Acme[Company: Acme]
    Bob -->|WORKS_AT| Acme
    Alice -->|LIKES| Movie[Movie: Interstellar]
    Bob -->|LIKES| Movie`,
    },
    {
      title: "Graph Query vs SQL Join",
      kind: "sequence",
      caption: "Comparing SQL join chains to graph traversal for relationship queries.",
      mermaid: `sequenceDiagram
    participant App
    participant SQL as Relational DB
    participant GDB as Graph DB
    App->>SQL: Find friends of friends
    SQL->>SQL: JOIN users ON friend_id
    SQL->>SQL: JOIN again for second hop
    SQL->>SQL: N joins for N hops expensive
    SQL-->>App: Result with performance cost
    App->>GDB: MATCH path depth 2
    GDB->>GDB: Traverse edges directly
    GDB-->>App: Result in constant time per hop`,
    },
    {
      title: "Graph Traversal Strategies",
      kind: "flow",
      caption: "BFS and DFS traversal strategies used in graph database queries.",
      mermaid: `flowchart TD
    A[Start Node] --> B{Traversal Type?}
    B -- BFS --> C[Enqueue neighbors]
    C --> D[Visit level by level]
    D --> E{All visited?}
    E -- No --> C
    E -- Yes --> F[BFS Result]
    B -- DFS --> G[Push to stack]
    G --> H[Visit depth first]
    H --> I{All visited?}
    I -- No --> G
    I -- Yes --> J[DFS Result]`,
    },
    {
      title: "Graph Database Use Cases",
      kind: "mindmap",
      caption: "Common industry applications of graph databases.",
      mermaid: `mindmap
  root((Graph DB Uses))
    Social Networks
      Friend suggestions
      Influence analysis
    Fraud Detection
      Transaction rings
      Identity linkage
    Knowledge Graphs
      Entity relationships
      Semantic search
    Recommendations
      Collaborative filter
      Item similarity
    Supply Chain
      Dependency trees
      Impact analysis`,
    },
  ],
  animations: [
    {
      title: "Shortest path discovery (bidirectional BFS)",
      steps: [
        { label: "Start from both endpoints", detail: "Initialize two BFS frontiers: one expanding from the source node, one from the target node." },
        { label: "Expand source frontier", detail: "Visit all neighbors of the source frontier nodes. Mark them as visited with distance from source." },
        { label: "Expand target frontier", detail: "Visit all neighbors of the target frontier nodes. Mark them as visited with distance from target." },
        { label: "Check for intersection", detail: "After each expansion, check if any node appears in both frontiers. If so, a shortest path exists through that node." },
        { label: "Reconstruct path", detail: "Trace back from the intersection node to the source (via source frontier) and to the target (via target frontier). Combine for the full shortest path." },
        { label: "Performance advantage", detail: "Bidirectional BFS explores O(b^(d/2)) nodes instead of O(b^d) for single-direction BFS, where b is branching factor and d is path length — exponential speedup." },
      ],
    },
    {
      title: "Cypher query execution pipeline",
      steps: [
        { label: "Parse", detail: "The Cypher string is parsed into an abstract syntax tree (AST), validating syntax and resolving identifiers." },
        { label: "Semantic analysis", detail: "The planner checks that labels, relationship types, and properties are valid. It resolves variable scopes and type-checks expressions." },
        { label: "Logical plan", detail: "The AST is transformed into a logical plan — a tree of operators (Scan, Expand, Filter, Projection) that describes what to compute." },
        { label: "Cost-based optimization", detail: "The optimizer considers available indexes, cardinality estimates, and join strategies. It may reorder operations, push filters down, or choose between index scan and label scan." },
        { label: "Physical plan", detail: "The logical plan is compiled into an executable physical plan with specific algorithms (hash join vs. nested loop, index-backed vs. full scan)." },
        { label: "Execute and stream", detail: "The plan executes using a volcano/pull model: each operator pulls rows from its children. Results stream to the client as they are produced." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Neo4j (Property Graph)", "Amazon Neptune", "ArangoDB (Multi-Model)"],
    rows: [
      ["Data model", "Property graph (nodes + relationships + properties)", "Property graph + RDF triples", "Documents + graphs + key-value"],
      ["Query language", "Cypher", "Gremlin (TinkerPop) + SPARQL", "AQL (unified query language)"],
      ["Storage", "Native graph (index-free adjacency)", "Purpose-built for graph workloads", "RocksDB-based (LSM tree)"],
      ["Transactions", "Full ACID", "Full ACID", "Full ACID (multi-document)"],
      ["Scaling", "Causal clustering (read replicas)", "Managed auto-scaling (up to 15 read replicas)", "Sharding + replication"],
      ["Graph algorithms", "GDS library (PageRank, Louvain, etc.)", "Limited built-in analytics", "Pregel-based graph analytics"],
      ["Ideal use case", "Complex traversals, knowledge graphs, recommendations", "AWS-native graph workloads", "Polyglot persistence in one engine"],
    ],
  },
  interviewQA: [
    {
      q: "When would you choose a graph database over a relational database?",
      a: "Choose a graph database when the core value of the data is in its relationships and the dominant queries involve traversals of variable or unknown depth. Social networks (friends-of-friends), recommendation engines (users who bought X also bought Y), fraud detection (finding suspicious transaction rings), knowledge graphs, and network/IT infrastructure mapping are canonical use cases. If queries involve many self-joins or recursive CTEs in SQL, a graph database likely offers both cleaner queries and better performance. Do not choose a graph database for simple CRUD with well-defined schemas, heavy aggregations over entire datasets, or columnar analytics.",
      followUps: [
        "Can you combine a graph database with a relational database in the same architecture?",
        "How do graph databases handle data that does not naturally form a graph?",
      ],
    },
    {
      q: "What is index-free adjacency and why does it matter?",
      a: "Index-free adjacency means each node physically stores direct pointers to its adjacent nodes and relationships in the storage engine. Traversing from a node to its neighbor is a pointer dereference — O(1) regardless of graph size. In a relational database, following a foreign key requires an index lookup whose cost grows logarithmically with table size. For traversals that span many hops (e.g., shortest path over 6 degrees of separation), this difference compounds: the graph database's cost is proportional to the subgraph visited, while the relational cost is proportional to the total data size times the number of joins.",
    },
    {
      q: "Explain the difference between Cypher's MATCH and OPTIONAL MATCH.",
      a: "MATCH requires the pattern to exist — if no matching data is found, the entire row is filtered out (like an INNER JOIN). OPTIONAL MATCH attempts to find the pattern but returns NULL for unmatched variables (like a LEFT OUTER JOIN). This is important when you want to include nodes that may or may not have certain relationships. For example, MATCH (p:Person) OPTIONAL MATCH (p)-[:HAS_PHONE]->(phone) returns all people, with phone data where it exists and NULL where it does not.",
      followUps: [
        "How does OPTIONAL MATCH interact with WHERE clauses?",
        "What is the performance implication of OPTIONAL MATCH on large graphs?",
      ],
    },
    {
      q: "How does Neo4j handle write scalability in a clustered setup?",
      a: "Neo4j causal clustering uses the Raft consensus protocol for writes. All writes go through the leader of the core cluster, which replicates them to a majority of core members before acknowledging. This limits write throughput to a single leader's capacity — Neo4j does not shard writes across multiple independent write leaders. Read scalability is addressed by read replicas that asynchronously replicate from core servers. For workloads requiring extreme write throughput, the data model or architecture may need to partition across multiple independent Neo4j clusters at the application level.",
    },
  ],
  followUps: [
    "What query would be catastrophic as a SQL self-join but cheap here?",
    "When is a graph database the wrong answer despite the data being graph-shaped?",
    "How does index-free adjacency actually work?",
  ],
  mcqs: [
    {
      q: "What does index-free adjacency mean in a native graph database?",
      options: [
        "No indexes are needed for any query",
        "Each node stores direct pointers to its neighbors, making traversal O(1)",
        "Relationships are stored in a separate index table",
        "The database automatically creates indexes on all properties",
      ],
      answerIndex: 1,
      explanation: "Index-free adjacency means nodes contain physical pointers to adjacent nodes, so traversal is a direct pointer dereference rather than an index lookup.",
    },
    {
      q: "In Cypher, what does the pattern (a)-[:KNOWS*2..4]->(b) match?",
      options: [
        "Exactly 2 to 4 KNOWS relationships between a and b",
        "Paths from a to b following 2 to 4 consecutive KNOWS relationships",
        "All nodes within 2 to 4 hops of a via any relationship type",
        "A KNOWS relationship with a weight between 2 and 4",
      ],
      answerIndex: 1,
      explanation: "The *2..4 syntax specifies variable-length paths of 2 to 4 hops, all of which must be KNOWS relationships. This matches chains like a-[:KNOWS]->x-[:KNOWS]->b (2 hops) up to 4 hops.",
    },
    {
      q: "Which graph algorithm would you use to find the most influential users in a social network?",
      options: [
        "Dijkstra's shortest path",
        "Louvain community detection",
        "PageRank centrality",
        "A* pathfinding",
      ],
      answerIndex: 2,
      explanation: "PageRank measures the importance of a node based on the number and quality of relationships pointing to it. Originally developed by Google for web pages, it directly applies to finding influential users in social networks.",
    },
    {
      q: "What is the key limitation of Neo4j's causal clustering for write scalability?",
      options: [
        "It does not support transactions",
        "All writes go through a single Raft leader — no write sharding",
        "Read replicas cannot serve any queries",
        "It requires at least 10 nodes to operate",
      ],
      answerIndex: 1,
      explanation: "Neo4j uses Raft consensus with a single leader for writes. While this ensures strong consistency, write throughput is limited to what one leader can handle. Read replicas scale reads but not writes.",
    },
    {
      q: "What is the difference between MATCH and OPTIONAL MATCH in Cypher?",
      options: [
        "MATCH is faster; OPTIONAL MATCH is slower but more accurate",
        "MATCH filters out non-matching rows; OPTIONAL MATCH returns NULLs for unmatched patterns",
        "MATCH works on nodes; OPTIONAL MATCH works on relationships",
        "There is no difference — they are aliases",
      ],
      answerIndex: 1,
      explanation: "MATCH acts like an INNER JOIN — rows without matching patterns are excluded. OPTIONAL MATCH acts like a LEFT OUTER JOIN — unmatched patterns produce NULLs rather than filtering out the row.",
    },
  ],
  flashcards: [
    { front: "What are the two main elements of the property graph model?", back: "Nodes (entities with labels and properties) and Relationships (directed edges with a type and properties connecting exactly two nodes)." },
    { front: "What is index-free adjacency?", back: "A storage technique where each node physically stores pointers to its neighbors, making traversal a constant-time operation independent of total graph size." },
    { front: "What does Cypher's shortestPath() function do?", back: "Finds the shortest path between two nodes matching a given pattern. Uses bidirectional BFS internally for efficiency." },
    { front: "Name three categories of graph algorithms.", back: "Centrality (PageRank, Betweenness), Community Detection (Louvain, Label Propagation), and Pathfinding (Dijkstra, A*, shortest path)." },
    { front: "How does Neo4j ensure causal consistency in a cluster?", back: "Through bookmarks. After a write, the client receives a bookmark. Passing it to subsequent reads (on any server) guarantees those reads see the write." },
    { front: "What is the difference between a property graph and an RDF triple store?", back: "Property graphs have nodes and relationships with arbitrary properties on both. RDF stores data as subject-predicate-object triples with URIs. Property graphs are more flexible; RDF is more standardized (W3C)." },
    { front: "What makes graph databases poor at full-table aggregations?", back: "Graph storage is optimized for pointer-chasing traversals, not sequential scans. Computing 'average salary of all employees' requires visiting every node — columnar or row-based stores do this faster." },
  ],
  revisionNotes: [
    "Property graph = nodes (with labels, properties) + relationships (directed, typed, with properties). Both are first-class citizens.",
    "Index-free adjacency: O(1) traversal per hop. Cost is proportional to subgraph visited, not total graph size.",
    "Cypher patterns use ASCII art: (a)-[:REL]->(b). Variable-length: *2..4. MATCH = inner join, OPTIONAL MATCH = left join.",
    "Graph algorithms: PageRank (influence), Louvain (communities), Dijkstra (weighted shortest path), Betweenness (bridge nodes).",
    "Neo4j is ACID-compliant with MVCC. Writers take record-level locks; readers are never blocked.",
    "Causal clustering: Raft consensus for writes (single leader), read replicas for scaling reads, bookmarks for causal consistency.",
    "Use graph databases for relationship-heavy, traversal-heavy queries. Avoid for simple CRUD, heavy aggregations, or columnar analytics.",
  ],
  cheatSheet: [
    "CREATE (n:Label {prop: value}) — create node",
    "CREATE (a)-[:REL_TYPE {prop: value}]->(b) — create relationship",
    "MATCH (n:Label {prop: value}) RETURN n — find nodes",
    "MATCH (a)-[:REL]->(b) RETURN a, b — traverse relationships",
    "MATCH path = shortestPath((a)-[*..10]-(b)) RETURN path — shortest path",
    "MATCH (a)-[:REL*2..5]->(b) RETURN b — variable-length paths",
    "OPTIONAL MATCH (n)-[:REL]->(m) — left-outer-join style match",
    "WHERE n.prop > 10 AND exists((n)-[:REL]->()) — filtering",
    "WITH n, count(*) AS cnt — intermediate aggregation (like SQL's subquery)",
    "MERGE (n:Label {key: value}) ON CREATE SET n.created = datetime() — get or create",
    "EXPLAIN / PROFILE MATCH ... — show / execute query plan",
    "CREATE INDEX FOR (n:Label) ON (n.prop) — property index",
    "CALL gds.pageRank.stream('graph') YIELD nodeId, score — run algorithm",
  ],
  exercises: [
    "Model a **social network** in Neo4j with `Person`, `Company`, and `City` nodes. Create at least 6 people with `KNOWS`, `WORKS_AT`, and `LIVES_IN` relationships. Then write a Cypher query to find *friends-of-friends* suggestions for a given user -- people who are 2 hops away via `KNOWS` but not directly connected, ranked by number of mutual friends.",
    "Write a Cypher query for **fraud detection** that finds circular money flows (rings) of 3-6 hops in a transaction graph where each `TRANSFERRED_TO` relationship has an `amount > 10000` within the last 30 days. Use `reduce` to compute the total amount flowing through each ring. Explain why this query is *impractical* in SQL without recursive CTEs.",
    "Run **PageRank** and **Louvain community detection** on a social graph using Neo4j's Graph Data Science library. First project the graph with `gds.graph.project`, then stream PageRank results to find the top 10 influential people, and stream Louvain results to identify communities. Write all three Cypher/GDS calls and interpret the results.",
    "Compare modeling a many-to-many **students-to-courses** relationship in *PostgreSQL* (junction table with JOINs) versus *Neo4j* (direct `ENROLLED_IN` relationships). Write the equivalent query in both SQL and Cypher to find all students who share at least 3 courses with a given student. Analyze which approach is more readable and performant as the dataset scales.",
    "Design a **knowledge graph** for a technical documentation system where `Concept` nodes are connected by `DEPENDS_ON`, `RELATED_TO`, and `PREREQUISITE_OF` relationships. Write a Cypher query using `shortestPath` to find the learning path from a beginner concept to an advanced one, and a `MATCH (c)<-[:PREREQUISITE_OF*]-(prereq)` query to list all transitive prerequisites.",
  ],
  resources: [
    { label: "Neo4j Documentation", kind: "docs", note: "Official reference for Cypher, administration, clustering, and the Graph Data Science library." },
    { label: "Graph Databases (O'Reilly, by Robinson, Webber, Eifrem)", kind: "book", note: "Foundational book on graph database concepts, data modeling, and Neo4j by its creators." },
    { label: "Neo4j GraphAcademy (free courses)", kind: "video", note: "Interactive courses on Cypher, data modeling, graph algorithms, and Neo4j administration." },
    { label: "Designing Data-Intensive Applications — Ch. 2", url: "https://dataintensive.net/", kind: "book", note: "Martin Kleppmann compares document, relational, and graph models with trade-off analysis." },
    { label: "The Neo4j Graph Data Science library", kind: "repo", note: "Open-source library providing production-ready graph algorithms for Neo4j." },
    { label: "Pregel: A System for Large-Scale Graph Processing (Google, 2010)", kind: "paper", note: "Foundational paper on vertex-centric graph computation, influencing graph analytics in all modern graph databases." },
  ],
  glossary: [
    { term: "Property graph", definition: "A graph model where both nodes and relationships can have labels (types) and properties (key-value pairs). The dominant model in application-facing graph databases." },
    { term: "Cypher", definition: "Neo4j's declarative graph query language using ASCII-art pattern syntax to describe and query graph structures." },
    { term: "Index-free adjacency", definition: "A storage technique where each node contains direct physical pointers to its neighbors, enabling constant-time traversal per hop." },
    { term: "Traversal", definition: "The process of visiting nodes and following relationships in a graph, typically using BFS (breadth-first) or DFS (depth-first) strategies." },
    { term: "PageRank", definition: "A centrality algorithm that measures node importance based on the number and quality of incoming relationships. Originally developed by Google for ranking web pages." },
    { term: "Louvain algorithm", definition: "A community detection algorithm that maximizes modularity to identify densely connected groups of nodes within a larger graph." },
    { term: "Causal clustering", definition: "Neo4j's clustering architecture using Raft consensus for writes and read replicas for scalability, with bookmarks ensuring causal consistency." },
    { term: "RDF", definition: "Resource Description Framework — a W3C standard for representing data as subject-predicate-object triples, queried with SPARQL. The foundation of the Semantic Web." },
    { term: "MERGE", definition: "A Cypher clause that matches existing patterns or creates them if they do not exist — an idempotent 'get or create' operation." },
    { term: "Betweenness centrality", definition: "A measure of how often a node lies on the shortest path between other pairs of nodes — identifying 'bridge' nodes that connect different parts of the graph." },
  ],
};
