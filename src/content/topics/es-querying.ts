import type { TopicContent } from "../types";

export const esQuerying: TopicContent = {
  quickSummary: [
    "Elasticsearch queries operate in two contexts: query context (how well does this document match? -- produces a relevance score) and filter context (does this document match yes/no? -- no scoring, cacheable, faster). The bool query is the primary mechanism for combining these: 'must' and 'should' clauses score, while 'filter' and 'must_not' clauses do not.",
    "Full-text queries like match, multi_match, and match_phrase analyze the query string through the field's analyzer before searching the inverted index. Term-level queries like term, terms, range, prefix, and wildcard operate on exact values without analysis, making them appropriate for keyword fields.",
    "The bool query is the workhorse of Elasticsearch querying. It combines clauses: 'must' (AND, scored), 'should' (OR, scored, minimum_should_match controls threshold), 'must_not' (NOT, unscored filter), and 'filter' (AND, unscored filter). Placing clauses in filter context when scoring is unnecessary significantly improves performance through bitset caching.",
    "Aggregations compute analytics over query results: terms aggregation for top-N values, histogram and date_histogram for bucketing, avg/sum/min/max/stats for metrics, and cardinality for approximate distinct counts. Aggregations can be nested (sub-aggregations within buckets) and combined with queries to analyze filtered subsets of data.",
    "Relevance scoring uses BM25 by default but can be customized with function_score (combining query scores with functions like field_value_factor, decay functions, and script_score), boosting (promoting or demoting results), and rescore queries (applying expensive scoring to only the top-N results from an initial query)."
  ],

  detailed: [
    "## Full-Text Queries\n\nThe **match** query is the standard full-text query. It analyzes the query string, then searches for the resulting tokens. By default it uses OR logic: 'quick fox' matches documents containing 'quick' OR 'fox'. Set operator: 'and' to require all tokens. The **match_phrase** query requires all tokens to appear in the exact order with no gaps (or configurable slop). 'quick brown fox' with slop:1 allows one word between terms. **multi_match** searches across multiple fields, with strategies: best_fields (score from the best-matching field), most_fields (sum scores from all matching fields), cross_fields (analyze as if all fields were one combined field), and phrase/phrase_prefix variants. The **query_string** query supports Lucene query syntax (AND, OR, NOT, field:value, wildcards) but is dangerous with user input because malformed syntax causes parse errors. Use **simple_query_string** for user-facing search -- it never throws parse errors.",

    "## Term-Level Queries\n\nTerm-level queries operate on exact values without analysis. The **term** query matches a single exact value -- use it on keyword, numeric, date, and boolean fields, never on text fields (because text fields are analyzed and the indexed tokens will not match the unanalyzed query value). **terms** matches any of a list of values (like SQL IN). **range** supports gt, gte, lt, lte for numeric, date, and keyword fields. **exists** checks if a field has a non-null value. **prefix** matches values starting with a prefix. **wildcard** supports * (any characters) and ? (single character) patterns. **regexp** supports full regular expressions. **fuzzy** finds terms within an edit distance (Levenshtein). Term queries on keyword fields benefit from bitset caching when used in filter context, making repeated queries extremely fast.",

    "## The Bool Query\n\nThe bool query combines multiple clauses with four occurrence types. **must**: the clause must match, and its score contributes to the document's relevance score. **should**: the clause may match; matching clauses boost the score. If there are no must clauses, at least one should clause must match (controlled by minimum_should_match). **must_not**: the clause must not match. Runs in filter context (no scoring, cacheable). **filter**: the clause must match but does not contribute to scoring. Runs in filter context. Best practice: put scoring-relevant clauses in must/should, and non-scoring constraints (date ranges, status filters, access control) in filter. This separation enables Elasticsearch to cache filter results as bitsets and skip scoring for filter clauses, significantly improving performance. Bool queries can be nested arbitrarily for complex logic.",

    "## Aggregations\n\n**Bucket aggregations** group documents into buckets: terms (top-N values), histogram (numeric ranges), date_histogram (time intervals: minute, hour, day, week, month), range (custom ranges), filters (named filter buckets), and significant_terms (statistically unusual terms). **Metric aggregations** compute statistics over numeric values: avg, sum, min, max, stats (all at once), extended_stats (variance, std_deviation), cardinality (approximate distinct count using HyperLogLog++), percentiles, and percentile_ranks. **Pipeline aggregations** operate on the output of other aggregations: derivative, cumulative_sum, moving_avg, bucket_sort, bucket_selector. Aggregations can be nested: a date_histogram with a nested terms aggregation shows top categories per time bucket. The aggs field can coexist with query -- aggregations run on the query's result set. Set size:0 to skip hits and return only aggregation results.",

    "## Relevance Scoring and function_score\n\nBM25 is the default scoring algorithm, but many use cases need custom scoring. The **function_score** query wraps a query and applies scoring functions. **field_value_factor** boosts by a field's value (e.g., boost by popularity count). **Decay functions** (linear, exp, gauss) reduce score based on distance from an origin point -- useful for geo distance (boost nearby results) or recency (boost recent documents). **script_score** uses a Painless script for arbitrary scoring logic. **random_score** adds consistent randomization (e.g., for A/B testing). Multiple functions can be combined with score_mode (multiply, sum, avg, max, min) and the overall combination with boost_mode (multiply, replace, sum, avg, max, min). The **rescore** query is a performance optimization: run a cheap query first, then apply expensive rescoring (e.g., phrase matching or ML model scoring) only to the top-N results.",

    "## Pagination and Search Performance\n\nElasticsearch offers three pagination strategies. **from/size** is the simplest (from:20, size:10 for page 3) but has a hard limit: from+size cannot exceed index.max_result_window (default 10000) because deep pagination requires coordinating increasingly large result sets across shards. **search_after** is cursor-based pagination using the sort values of the last result as the starting point for the next page. It has no depth limit and is the recommended approach for paginating beyond 10000 results. It requires a consistent sort order (typically a tiebreaker field like _id). **scroll** creates a point-in-time snapshot of results for processing large result sets. Deprecated in favor of Point in Time (PIT) + search_after for most use cases. PIT ensures a consistent view of the index across pages even as documents are indexed or deleted."
  ],

  deepDive: [
    "## Query Execution Internals\n\nWhen a search request hits the coordinating node, it executes in two phases. **Query phase**: the request is broadcast to all relevant shards (primary or replica). Each shard executes the query against its local Lucene segments, computes scores, and returns a priority queue of the top-N doc IDs and scores (not the full documents). The coordinating node merges these per-shard queues into a global top-N. **Fetch phase**: the coordinating node sends a multi-get request to the shards that hold the winning documents, retrieving the actual _source and any requested fields. This two-phase approach minimizes data transfer -- only the final results are fetched in full. For aggregations, each shard computes partial aggregation results that the coordinating node merges. The terms aggregation's accuracy depends on shard_size (how many terms each shard returns) versus the requested size.",

    "## Filter Caching and Bitsets\n\nClauses in filter context (bool.filter, bool.must_not, constant_score, filter aggregation) do not compute relevance scores and their results are cached as bitsets -- compact arrays of bits where each bit represents whether a document matches. Bitset operations (AND, OR, NOT) are extremely fast using CPU-native instructions. Elasticsearch automatically caches filter bitsets for segments larger than 10000 documents and for filters used more than a few times. This means repeated filtered queries (e.g., 'status: active AND region: US') hit the cache on subsequent runs. Filters are also faster because they skip the scoring phase entirely. Best practice: move any clause that does not need to influence relevance ranking into filter context.",

    "## Aggregation Accuracy and the Shard Size Problem\n\nThe terms aggregation distributes across shards: each shard returns its local top-N terms and counts. The coordinating node merges these, but if a term is in the global top-N but not in some shards' local top-N, its count will be underestimated. The shard_size parameter (default: size * 1.5 + 10) controls how many terms each shard returns. Increasing shard_size improves accuracy at the cost of more memory and network transfer. The response includes doc_count_error_upper_bound (maximum possible error for any term not in the result) and sum_other_doc_count (total count of terms not in the result). For exact results, set shard_size to the total number of unique terms, but this is impractical for high-cardinality fields. The composite aggregation paginates through all buckets without the accuracy problem, making it suitable for exhaustive aggregation over high-cardinality fields.",

    "## Rescoring for Performance Optimization\n\nExpensive scoring operations (large script_score computations, machine learning inference, or phrase matching with slop across large text fields) can be prohibitively slow when applied to all matching documents. The rescore API solves this by applying expensive scoring only to the top-N results from an initial cheap query. The window_size parameter controls how many top results are rescored (default 10, typically set to 100-500). Multiple rescore phases can be chained. The query_weight and rescore_query_weight parameters control how the initial and rescore scores are combined. This pattern is common in e-commerce: first pass retrieves relevant products with BM25, second pass rescores by combining relevance with business metrics (popularity, margin, inventory level) using a script_score.",

    "## Collapse and Field Collapsing\n\nField collapsing groups search results by a field value, returning only the top result per group (like SQL GROUP BY with LIMIT 1). This is useful for deduplication or showing the best result per category. The collapse parameter specifies the field to collapse on (must be a keyword or numeric field with doc_values). Inner_hits can retrieve additional results within each collapsed group. Unlike aggregations, collapse operates in the query phase and integrates with pagination. It is more efficient than a terms aggregation with top_hits for this specific pattern. Collapse combined with search_after enables paginated, deduplicated result sets."
  ],

  code: [
    {
      language: "json",
      caption: "Bool query combining scored and unscored clauses with proper context placement",
      source: `POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "wireless bluetooth headphones",
            "fields": ["name^3", "description", "category"],
            "type": "best_fields",
            "fuzziness": "AUTO"
          }
        }
      ],
      "should": [
        {
          "match_phrase": {
            "name": {
              "query": "wireless headphones",
              "boost": 2
            }
          }
        },
        {
          "term": {
            "featured": { "value": true, "boost": 1.5 }
          }
        }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "price": { "gte": 20, "lte": 200 } } },
        { "terms": { "brand": ["sony", "bose", "apple"] } }
      ],
      "must_not": [
        { "term": { "out_of_stock": true } },
        { "range": { "rating": { "lt": 3.0 } } }
      ],
      "minimum_should_match": 0
    }
  },
  "sort": [
    { "_score": "desc" },
    { "created_at": "desc" }
  ],
  "from": 0,
  "size": 20,
  "_source": ["name", "price", "brand", "rating", "image_url"]
}`
    },
    {
      language: "json",
      caption: "Nested aggregations: date histogram with sub-aggregations for analytics dashboard",
      source: `POST /orders/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "range": { "order_date": { "gte": "2024-01-01", "lt": "2025-01-01" } } },
        { "term": { "status": "completed" } }
      ]
    }
  },
  "aggs": {
    "monthly_revenue": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "month",
        "format": "yyyy-MM",
        "min_doc_count": 0,
        "extended_bounds": {
          "min": "2024-01",
          "max": "2024-12"
        }
      },
      "aggs": {
        "revenue": {
          "sum": { "field": "total_amount" }
        },
        "avg_order_value": {
          "avg": { "field": "total_amount" }
        },
        "top_categories": {
          "terms": {
            "field": "category",
            "size": 5
          },
          "aggs": {
            "category_revenue": {
              "sum": { "field": "total_amount" }
            }
          }
        },
        "unique_customers": {
          "cardinality": {
            "field": "customer_id",
            "precision_threshold": 1000
          }
        },
        "revenue_percentiles": {
          "percentiles": {
            "field": "total_amount",
            "percents": [50, 75, 90, 99]
          }
        },
        "cumulative_revenue": {
          "cumulative_sum": {
            "buckets_path": "revenue"
          }
        }
      }
    }
  }
}`
    },
    {
      language: "json",
      caption: "function_score for e-commerce relevance tuning with decay and field boosting",
      source: `POST /products/_search
{
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "must": {
            "multi_match": {
              "query": "running shoes",
              "fields": ["name^2", "description", "brand"]
            }
          },
          "filter": [
            { "term": { "status": "active" } }
          ]
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "sales_count",
            "factor": 1.2,
            "modifier": "log1p",
            "missing": 1
          },
          "weight": 2
        },
        {
          "gauss": {
            "created_at": {
              "origin": "now",
              "scale": "30d",
              "offset": "7d",
              "decay": 0.5
            }
          },
          "weight": 1.5
        },
        {
          "gauss": {
            "location": {
              "origin": { "lat": 40.7128, "lon": -74.006 },
              "scale": "10km",
              "offset": "2km",
              "decay": 0.5
            }
          },
          "weight": 1
        },
        {
          "script_score": {
            "script": {
              "source": "Math.max(0, doc['rating'].value * doc['review_count'].value / 100)"
            }
          },
          "weight": 1
        },
        {
          "filter": { "term": { "sponsored": true } },
          "weight": 3
        }
      ],
      "score_mode": "sum",
      "boost_mode": "multiply",
      "max_boost": 20
    }
  },
  "rescore": {
    "window_size": 100,
    "query": {
      "rescore_query": {
        "match_phrase": {
          "name": {
            "query": "running shoes",
            "slop": 2
          }
        }
      },
      "query_weight": 0.7,
      "rescore_query_weight": 1.2
    }
  }
}`
    },
    {
      language: "json",
      caption: "search_after pagination with Point in Time for consistent deep pagination",
      source: `// Step 1: Open a Point in Time (PIT) for consistent results
POST /products/_pit?keep_alive=5m
// Response: { "id": "46ToAwMDaWR..." }

// Step 2: First page
POST /_search
{
  "size": 20,
  "query": {
    "bool": {
      "filter": [{ "term": { "category": "electronics" } }]
    }
  },
  "pit": {
    "id": "46ToAwMDaWR...",
    "keep_alive": "5m"
  },
  "sort": [
    { "price": "asc" },
    { "_shard_doc": "asc" }
  ]
}
// Last hit has sort: [29.99, 4294967300]

// Step 3: Next page - use sort values from last hit
POST /_search
{
  "size": 20,
  "query": {
    "bool": {
      "filter": [{ "term": { "category": "electronics" } }]
    }
  },
  "pit": {
    "id": "46ToAwMDaWR...",
    "keep_alive": "5m"
  },
  "sort": [
    { "price": "asc" },
    { "_shard_doc": "asc" }
  ],
  "search_after": [29.99, 4294967300]
}

// Step 4: Close the PIT when done
DELETE /_pit
{ "id": "46ToAwMDaWR..." }`
    }
  ],

  diagrams: [
    {
      title: "Bool Query Clause Types",
      kind: "architecture",
      caption: "The four bool query clauses and how they differ in scoring and caching behavior.",
      mermaid: `graph TD
    BQ["bool query"]
    BQ --> MUST["must\nAND semantics\nContributes to score"]
    BQ --> SHOULD["should\nOR semantics\nContributes to score\nmin_should_match control"]
    BQ --> FILTER["filter\nAND semantics\nNo score\nBitset cached"]
    BQ --> MUSTNOT["must_not\nNOT semantics\nNo score\nBitset cached"]`,
    },
    {
      title: "Two-Phase Search Execution",
      kind: "sequence",
      caption: "Query phase gathers top doc IDs from all shards; fetch phase retrieves only the selected full documents.",
      mermaid: `sequenceDiagram
    participant Client
    participant Coord as Coordinating Node
    participant S1 as Shard 1
    participant S2 as Shard 2

    Client->>Coord: Search request
    Note over Coord,S2: Query Phase
    Coord->>S1: Get top-N doc IDs and scores
    Coord->>S2: Get top-N doc IDs and scores
    S1-->>Coord: doc IDs + scores
    S2-->>Coord: doc IDs + scores
    Coord->>Coord: Merge and rank global top N
    Note over Coord,S2: Fetch Phase
    Coord->>S1: Fetch full docs for selected IDs
    S1-->>Coord: Full source documents
    Coord-->>Client: Final ranked result set`,
    },
    {
      title: "Aggregation Nesting Structure",
      kind: "architecture",
      caption: "Bucket, metric, and pipeline aggregations compose into nested analytics hierarchies.",
      mermaid: `graph TD
    ROOT["Query Result Set"]
    ROOT --> BUCK["Bucket Aggregation\ndate_histogram or terms\nGroups documents into buckets"]
    BUCK --> B1["Bucket: Jan 2024"]
    BUCK --> B2["Bucket: Feb 2024"]
    B1 --> MET["Metric Aggregation\nsum / avg / cardinality\nComputes value per bucket"]
    B2 --> MET
    MET --> PIPE["Pipeline Aggregation\ncumulative_sum or derivative\nOperates on aggregation outputs"]`,
    },
    {
      title: "Query vs Filter Context Decision",
      kind: "flow",
      caption: "When to use query context for relevance scoring versus filter context for cached boolean matching.",
      mermaid: `flowchart TD
    A["Need to match documents"] --> B{Relevance score needed?}
    B -->|Yes| C["Query Context\nmust or should\nCalculates _score"]
    B -->|No| D["Filter Context\nfilter or must_not\nNo _score, bitset cached"]
    C --> E["Full-text search\nmatch, multi_match\nquery_string"]
    D --> F["Exact filters\nterm, range, exists\nFaster for repeated queries"]`,
    },
  ],

  animations: [
    {
      title: "Bool Query Execution Flow",
      steps: [
        { label: "Parse the bool query", detail: "Elasticsearch separates clauses into scored (must, should) and unscored (filter, must_not) groups." },
        { label: "Execute filter clauses first", detail: "Filter and must_not clauses are evaluated as bitsets. Cached bitsets are reused. Documents not matching filters are eliminated before scoring begins." },
        { label: "Score must clauses", detail: "For remaining candidate documents, each must clause computes a BM25 score. These scores are summed." },
        { label: "Score should clauses", detail: "Should clauses add bonus score to matching documents. minimum_should_match determines how many should clauses must match (default 0 when must is present)." },
        { label: "Combine and rank", detail: "Final score = sum of must scores + sum of matching should scores. Documents are ranked by _score descending. The shard returns its local top-N to the coordinating node." },
        { label: "Global merge", detail: "Coordinating node merges per-shard top-N queues into the global result. Fetch phase retrieves full documents for the final page." }
      ]
    },
    {
      title: "Terms Aggregation Across Shards",
      steps: [
        { label: "Broadcast to shards", detail: "The aggregation request (terms on 'category', size:5) is sent to all 3 shards." },
        { label: "Local computation", detail: "Each shard computes its local top terms using doc_values. Shard 1: {electronics:500, clothing:300, books:200}. Shard 2: {electronics:400, books:350, toys:150}. Shard 3: {clothing:450, books:250, electronics:200}." },
        { label: "Return shard_size terms", detail: "Each shard returns shard_size terms (default: size*1.5+10 = 17). This over-fetching reduces accuracy errors from terms that are globally popular but not in a shard's local top-5." },
        { label: "Merge on coordinator", detail: "Coordinating node sums counts across shards: electronics:1100, clothing:750, books:800, toys:150. Returns final top-5 with doc_count_error_upper_bound indicating maximum possible error." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "Query Context", "Filter Context"],
    rows: [
      ["Purpose", "How well does this match? (relevance ranking)", "Does this match yes/no? (binary)"],
      ["Scoring", "Computes _score using BM25 or custom similarity", "No scoring. Score contribution is 0."],
      ["Caching", "Not cached (scores depend on index statistics)", "Results cached as bitsets. Extremely fast on repeated queries."],
      ["Bool clauses", "must, should", "filter, must_not"],
      ["Performance", "Slower due to scoring computation", "Faster. Bitset operations + caching."],
      ["Use cases", "Full-text search, relevance ranking, boosting", "Date ranges, status filters, access control, geo bounds"],
      ["Standalone wrapper", "N/A (default for top-level query)", "constant_score wraps any query as a filter"],
      ["Best practice", "Use for clauses that should influence result ordering", "Use for all constraints where ranking does not matter"]
    ]
  },

  interviewQA: [
    {
      q: "What is the difference between query context and filter context in Elasticsearch?",
      a: "Query context asks 'how well does this document match?' and computes a relevance score (_score) using BM25. Filter context asks 'does this document match yes/no?' with no scoring. Filters are faster because they skip scoring and their results are cached as bitsets for reuse. In a bool query, must and should are query context; filter and must_not are filter context. Best practice: place non-scoring constraints (date ranges, status checks, access control) in filter context for performance.",
      followUps: [
        "How does Elasticsearch cache filter results?",
        "Can you nest a bool query inside a filter clause?"
      ]
    },
    {
      q: "How does the terms aggregation handle accuracy across distributed shards?",
      a: "Each shard independently computes its local top terms and returns shard_size terms (default size*1.5+10) to the coordinating node, which merges them. The accuracy problem: a term globally in the top-N might not be in every shard's local top-N, causing its count to be underestimated. Increasing shard_size improves accuracy at the cost of memory and network. The response includes doc_count_error_upper_bound to quantify the maximum possible error. For exact results on high-cardinality fields, use the composite aggregation which paginates through all buckets.",
      followUps: [
        "What is the composite aggregation and when would you use it?",
        "How does cardinality aggregation estimate distinct counts?"
      ]
    },
    {
      q: "Explain how function_score works and give a real-world example.",
      a: "function_score wraps a query and modifies its score using one or more functions. Each function computes a value that is combined with the original query score. Common functions: field_value_factor (boost by a numeric field like popularity), gauss/linear/exp decay (reduce score by distance from an origin -- geo location, date, price), script_score (arbitrary Painless logic), and weight (conditional boost with a filter). Functions are combined via score_mode (sum, multiply, avg) and merged with the original score via boost_mode (multiply, replace, sum). Example: e-commerce search that combines text relevance with recency decay, popularity boost, and geo proximity.",
      followUps: [
        "What is the rescore API and when is it more appropriate than function_score?",
        "How do decay functions work geometrically?"
      ]
    },
    {
      q: "Why should you never use a match query on a keyword field or a term query on a text field?",
      a: "A match query analyzes the query string through the field's analyzer. On a keyword field (which is not analyzed), the match query still runs analysis on the query string (default standard analyzer), producing lowercased tokens that won't match the exact keyword value. A term query does not analyze the query string. On a text field, the indexed tokens are analyzed (lowercased, stemmed), but the term query searches for the exact unanalyzed value. Searching for 'Running' with a term query won't match the indexed token 'run'. Rule: match for text fields, term for keyword fields.",
      followUps: [
        "What does the _analyze API reveal about this problem?",
        "When would you use match_phrase instead of match?"
      ]
    },
    {
      q: "How does search_after pagination work and why is it preferred over from/size for deep pagination?",
      a: "from/size has a hard limit (default 10000) because each shard must return from+size results to the coordinating node for merging -- deep pages require large in-memory priority queues across all shards. search_after uses the sort values of the last result as a cursor: each shard can efficiently seek to the starting point using its index, returning only size results. It has no depth limit and consistent memory usage. Combined with Point in Time (PIT), search_after provides a consistent snapshot even as documents change. The trade-off: you cannot jump to an arbitrary page, only iterate forward."
    }
  ],

  followUps: [
    "When do you use `filter` context instead of `query` context, and what does it buy?",
    "Why is deep pagination expensive here, and what replaces it?",
    "How does a `bool` query combine must, should, and must_not scoring?",
  ],
  mcqs: [
    {
      q: "Which bool clause should you use for a date range filter that should NOT affect relevance scoring?",
      options: [
        "must",
        "should",
        "filter",
        "must_not"
      ],
      answerIndex: 2,
      explanation: "The filter clause runs in filter context: it requires the document to match but does not contribute to the relevance score. It is also cacheable as a bitset. Date range filters, status checks, and access control constraints should go in filter for optimal performance."
    },
    {
      q: "What is the default maximum value for from + size in Elasticsearch?",
      options: [
        "1000",
        "5000",
        "10000",
        "100000"
      ],
      answerIndex: 2,
      explanation: "The default index.max_result_window is 10000. Deep pagination beyond this requires search_after with a Point in Time (PIT). The limit exists because each shard must materialize from+size results in memory, which becomes expensive for deep pages across many shards."
    },
    {
      q: "In a function_score query, what does the gauss decay function do?",
      options: [
        "Adds random noise to scores following a Gaussian distribution",
        "Reduces score based on distance from an origin point using a bell curve",
        "Normalizes scores to a Gaussian distribution across all results",
        "Applies Gaussian blur to field values before scoring"
      ],
      answerIndex: 1,
      explanation: "The gauss decay function reduces a document's score based on how far a field value is from a specified origin, following a Gaussian (bell) curve. Parameters: origin (center), scale (distance at which score decays to 'decay'), offset (no decay within this distance), and decay (score at scale distance, default 0.5). Used for geo proximity and recency boosting."
    },
    {
      q: "What happens if a bool query has only 'should' clauses and no 'must' or 'filter' clauses?",
      options: [
        "No documents match because should is optional",
        "All documents match with zero score",
        "At least one should clause must match (minimum_should_match defaults to 1)",
        "The query fails with a validation error"
      ],
      answerIndex: 2,
      explanation: "When a bool query has no must or filter clauses, minimum_should_match defaults to 1, meaning at least one should clause must match. When must or filter clauses are present, minimum_should_match defaults to 0 (should clauses are purely optional boosters)."
    },
    {
      q: "Which aggregation type would you use to compute the approximate number of distinct values in a field?",
      options: [
        "value_count",
        "terms with size set to total unique values",
        "cardinality",
        "distinct (built-in)"
      ],
      answerIndex: 2,
      explanation: "The cardinality aggregation uses the HyperLogLog++ algorithm to estimate distinct value counts with configurable precision (precision_threshold, default 3000). value_count counts total values including duplicates. There is no built-in 'distinct' aggregation. Using terms with a very large size is inefficient and impractical for high-cardinality fields."
    }
  ],

  flashcards: [
    { front: "What are the four bool query clauses?", back: "must (AND, scored), should (OR, scored, minimum_should_match), filter (AND, unscored, cached as bitset), must_not (NOT, unscored, cached as bitset)." },
    { front: "When does minimum_should_match default to 1 in a bool query?", back: "When there are no must or filter clauses. If must or filter clauses are present, minimum_should_match defaults to 0 (should clauses are purely optional score boosters)." },
    { front: "What is the difference between match and term queries?", back: "match: analyzes the query string through the field's analyzer, then searches. For text fields. term: searches the exact value without analysis. For keyword, numeric, date, boolean fields." },
    { front: "What is multi_match type: cross_fields?", back: "Treats multiple fields as one combined field. Analyzes the query once and looks for each term in any of the fields. Useful for searching across first_name + last_name as if they were one field." },
    { front: "What is the function_score gauss decay function?", back: "Reduces score based on distance from an origin using a Gaussian curve. Parameters: origin, scale (distance at decay score), offset (no-decay zone), decay (score at scale, default 0.5). Used for geo proximity and recency." },
    { front: "What is the rescore API?", back: "Applies expensive scoring (phrase matching, ML inference) only to the top-N results from an initial cheap query. window_size controls how many results are rescored. Improves performance by limiting expensive scoring." },
    { front: "How does search_after pagination work?", back: "Uses the sort values of the last result as a cursor for the next page. No depth limit, consistent memory usage. Requires a deterministic sort order (tiebreaker field). Cannot jump to arbitrary pages." },
    { front: "What is a composite aggregation?", back: "Paginates through all buckets of a multi-bucket aggregation, returning them in pages using after_key. No accuracy problem like terms aggregation. Suitable for exhaustive aggregation over high-cardinality fields." },
    { front: "What is field collapsing?", back: "Groups search results by a field value, returning only the top result per group (like SQL GROUP BY + LIMIT 1). Uses the collapse parameter. inner_hits retrieves additional results per group." },
    { front: "What is the cardinality aggregation?", back: "Estimates distinct value count using HyperLogLog++ algorithm. Approximate but fast and memory-efficient. precision_threshold controls accuracy (default 3000). Exact up to threshold, ~3% error beyond." }
  ],

  revisionNotes: [
    "Query context = scoring (must, should). Filter context = no scoring, cacheable bitsets (filter, must_not).",
    "match query: analyzes query string -> searches analyzed text fields. term query: exact value -> keyword/numeric fields.",
    "Bool: must (AND+score), should (OR+score), filter (AND+no score+cached), must_not (NOT+no score+cached).",
    "minimum_should_match: defaults to 1 if no must/filter, else 0.",
    "Aggregations: bucket (terms, date_histogram) + metric (sum, avg, cardinality) + pipeline (cumulative_sum, derivative).",
    "function_score functions: field_value_factor, gauss/exp/linear decay, script_score, random_score, weight+filter.",
    "from+size max 10000 (index.max_result_window). Use search_after + PIT for deep pagination.",
    "terms aggregation accuracy: shard_size controls how many terms each shard returns. Higher = more accurate.",
    "composite aggregation: paginated, exact, no accuracy problem. Use for exhaustive high-cardinality aggregation.",
    "rescore: apply expensive scoring to top-N only. window_size + query_weight + rescore_query_weight."
  ],

  cheatSheet: [
    "match: full-text search on text fields. Analyzes query string.",
    "term: exact value match on keyword/numeric/date. No analysis.",
    "bool: must (AND+score), should (OR+score), filter (AND+cached), must_not (NOT+cached)",
    "Put non-scoring constraints in filter for bitset caching and performance",
    "multi_match types: best_fields (max score), most_fields (sum), cross_fields (combined)",
    "function_score: field_value_factor, decay (gauss/exp/linear), script_score, random_score",
    "Aggregations: terms, histogram, date_histogram, range | avg, sum, min, max, cardinality, percentiles",
    "Pipeline aggs: cumulative_sum, derivative, moving_avg, bucket_sort, bucket_selector",
    "from+size max 10000. search_after + PIT for deep pagination. No arbitrary page jumps.",
    "minimum_should_match: 1 if no must/filter, else 0",
    "rescore: expensive scoring on top window_size results only",
    "collapse: deduplicate results by field value. inner_hits for additional results per group."
  ],

  exercises: [
    "Build a **product search query** using a `bool` query that combines: a `multi_match` on `name^3`, `description`, and `brand` in `must` (scored), a `term` filter for `status: active` and a `range` filter for `price` between 50 and 500 in `filter` (unscored), and a `must_not` clause excluding out-of-stock items. Explain *why* the status and price constraints belong in `filter` context rather than `must`.",
    "Write a **nested aggregation** query that produces a monthly revenue dashboard for the last year: a `date_histogram` on `order_date` with `calendar_interval: month`, nested `sum` aggregation on `total_amount`, a `cardinality` aggregation on `customer_id`, and a `cumulative_sum` pipeline aggregation. Set `size: 0` to skip hits.",
    "Implement a **function_score** query for an e-commerce search that combines BM25 text relevance with: a `field_value_factor` boost on `sales_count` (using `log1p` modifier), a `gauss` decay on `created_at` (favor recent products, scale of 30 days), and a conditional `weight` boost of 3x for `sponsored: true` items. Set `score_mode: sum` and `boost_mode: multiply`.",
    "Your search results page needs to go beyond 10,000 results. Implement **deep pagination** using `search_after` with a Point in Time (PIT): open a PIT with `POST /products/_pit?keep_alive=5m`, perform the first search with a sort on `[price, _shard_doc]`, then use the last hit's sort values for the next page. Write all three requests and the PIT cleanup.",
    "A user reports that searching for `'Running Shoes'` on a `keyword` field returns no results, while the same search on a `text` field works. Use the `POST /_analyze` API to demonstrate *why* this happens by showing the tokens produced for both field types. Then fix the query by choosing the correct query type (`term` vs `match`) for each field.",
  ],
  resources: [
    { label: "Elasticsearch Query DSL Reference", kind: "docs", note: "Official reference for all query types, aggregations, and scoring functions" },
    { label: "Elasticsearch: The Definitive Guide - Search chapter", url: "https://www.elastic.co/guide/index.html", kind: "book", note: "Comprehensive tutorial on full-text search, bool queries, and relevance tuning" },
    { label: "Relevant Search (Turnbull & Berryman)", kind: "book", note: "Deep dive into relevance engineering with Elasticsearch, including function_score and boosting strategies" },
    { label: "Elastic Blog: BM25 Similarity and function_score", kind: "article", note: "Practical guide to combining BM25 with custom scoring functions for production search" },
    { label: "Elasticsearch Aggregations Reference", kind: "docs", note: "Official documentation for all aggregation types including pipeline and composite aggregations" },
    { label: "Elastic Blog: Point in Time and search_after", kind: "article", note: "Guide to efficient deep pagination with consistent results using PIT + search_after" }
  ],

  glossary: [
    { term: "Query Context", definition: "Execution context where clauses compute relevance scores (_score) using BM25 or custom similarity. Used by bool must and should clauses." },
    { term: "Filter Context", definition: "Execution context where clauses produce binary yes/no matches without scoring. Results are cached as bitsets. Used by bool filter and must_not." },
    { term: "Bool Query", definition: "The primary compound query that combines must (AND+scored), should (OR+scored), filter (AND+unscored), and must_not (NOT+unscored) clauses." },
    { term: "function_score", definition: "A query wrapper that modifies relevance scores using functions like field_value_factor, decay functions, and script_score." },
    { term: "Bucket Aggregation", definition: "An aggregation that groups documents into buckets (terms, histogram, date_histogram, range). Each bucket can contain nested aggregations." },
    { term: "Metric Aggregation", definition: "An aggregation that computes a numeric value over documents: avg, sum, min, max, cardinality, percentiles, stats." },
    { term: "Pipeline Aggregation", definition: "An aggregation that operates on the output of other aggregations: cumulative_sum, derivative, moving_avg, bucket_selector." },
    { term: "search_after", definition: "Cursor-based pagination using the sort values of the last result. No depth limit. Requires deterministic sort order. Used with Point in Time for consistency." },
    { term: "Point in Time (PIT)", definition: "A lightweight snapshot of the index state that ensures consistent results across paginated search_after requests even as documents change." },
    { term: "Rescore", definition: "A query-time optimization that applies expensive scoring only to the top window_size results from an initial cheap query." }
  ]
};
