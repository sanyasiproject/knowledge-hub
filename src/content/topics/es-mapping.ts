import type { TopicContent } from "../types";

export const esMapping: TopicContent = {
  quickSummary: [
    "Elasticsearch mappings define how documents and their fields are stored and indexed. A mapping specifies field types (text, keyword, integer, date, geo_point, nested, etc.), analyzers, and indexing options. Think of it as the schema of your index, analogous to a database table definition but more flexible.",
    "There are two main string field types: 'text' fields are analyzed (tokenized, lowercased, stemmed) for full-text search, while 'keyword' fields are stored as-is for exact matching, sorting, and aggregations. Multi-fields allow a single source field to be indexed both ways using the fields parameter.",
    "Dynamic mapping automatically detects and maps new fields based on their JSON type (string -> text+keyword, number -> long/float, boolean -> boolean, object -> object). While convenient for prototyping, production systems should use explicit mappings to prevent mapping explosions and ensure correct field types.",
    "Index templates and component templates let you define mappings that automatically apply to new indices matching a pattern. This is essential for time-series data (logs-*, metrics-*) where new indices are created regularly. Component templates are reusable building blocks that index templates compose.",
    "Mapping parameters control detailed indexing behavior: 'index' (whether a field is searchable), 'doc_values' (whether a field supports sorting/aggregations), 'store' (whether the original value is stored separately from _source), 'enabled' (whether an object field is parsed at all), 'null_value' (index a substitute when the field is null), and 'copy_to' (copy field values into a combined field)."
  ],

  detailed: [
    "## Core Field Types\n\nElasticsearch provides a rich set of field types. **Text** fields are analyzed through an analyzer pipeline for full-text search; they support match queries but cannot be used for sorting or aggregations (use a keyword sub-field). **Keyword** fields store exact values without analysis; used for filtering (term query), sorting, and aggregations. **Numeric** types include byte, short, integer, long, float, double, half_float, and scaled_float (stores a float as a long with a scaling factor for fixed precision). **Date** fields parse date strings into epoch milliseconds internally; you can specify multiple formats. **Boolean** stores true/false. **Binary** stores Base64-encoded binary data. **Range** types (integer_range, date_range, ip_range) store a range of values rather than a single value. **IP** stores IPv4 and IPv6 addresses. Choosing the right type is critical for query capabilities and index size.",

    "## Text vs Keyword: The Fundamental Distinction\n\nThe text/keyword distinction is the most important concept in Elasticsearch mappings. A **text** field passes through an analyzer: 'New York City' becomes tokens ['new', 'york', 'city']. You can search for any of these tokens, but you cannot sort by or aggregate on a text field (the original value is not preserved in a sortable form). A **keyword** field stores the exact value 'New York City' as a single token. You can filter for exact matches and aggregate on it, but a match query for 'new' will not find it. **Multi-fields** solve this tension: map the source field as text for search, and add a '.keyword' sub-field for sorting and aggregation. Dynamic mapping does this by default for string fields. The fielddata option technically allows text fields to be used for aggregations by loading an uninverted in-memory structure, but this is extremely memory-expensive and almost always wrong.",

    "## Geo Types and Spatial Queries\n\n**geo_point** stores a latitude/longitude pair and enables geo queries: geo_bounding_box (rectangle), geo_distance (radius from a point), and geo_polygon. Points can be specified as objects {lat, lon}, strings '41.12,-71.34', arrays [-71.34, 41.12] (note: GeoJSON order is lon,lat), or WKT 'POINT(-71.34 41.12)'. **geo_shape** stores arbitrary GeoJSON geometries (polygons, lines, multi-polygons) and supports geo_shape queries with spatial relations: INTERSECTS, DISJOINT, WITHIN, CONTAINS. Geo shapes use a BKD tree internally. For common use cases like 'find all stores within 10km', geo_point with a geo_distance query is sufficient and more efficient. For complex spatial operations like 'find all delivery zones that contain this point', geo_shape is needed.",

    "## Nested and Object Types\n\nJSON objects can be mapped as **object** (default) or **nested** type. The distinction matters for arrays of objects. With the default object mapping, an array of objects is flattened: [{first:'John', last:'Smith'}, {first:'Alice', last:'White'}] becomes first:['John','Alice'], last:['Smith','White']. A query for first:John AND last:White would incorrectly match because the cross-object association is lost. The **nested** type preserves the association by indexing each object as a hidden separate document. Nested queries search within individual nested documents. However, nested fields have costs: each nested document counts toward the index.mapping.nested_objects.limit (default 10000), nested queries are slower than object queries, and updating any nested object re-indexes all nested documents in that parent. Use nested only when you need to query array elements independently.",

    "## Dynamic Mapping and Its Pitfalls\n\nDynamic mapping lets Elasticsearch automatically create field mappings when it encounters new fields in indexed documents. Detection rules: JSON strings -> text with keyword sub-field, integers -> long, floats -> float (or long if no decimal), booleans -> boolean, objects -> object, arrays -> type of first element, null -> no mapping until a non-null value arrives. Dynamic mapping is controlled by the 'dynamic' parameter: 'true' (default, auto-map new fields), 'false' (ignore new fields but still store in _source), 'strict' (reject documents with unmapped fields), 'runtime' (auto-map as runtime fields). **Dynamic templates** customize auto-mapping with rules: map all strings matching '*_count' as integers, map all strings longer than 256 chars as text-only (no keyword sub-field). The major pitfall is **mapping explosion**: uncontrolled dynamic mapping from high-cardinality key names (e.g., indexing arbitrary JSON) can create thousands of fields, consuming cluster memory and causing performance issues.",

    "## Index Templates and Component Templates\n\nIndex templates automatically apply settings and mappings to new indices matching a pattern. **Component templates** are reusable building blocks containing partial settings or mappings. **Index templates** compose one or more component templates plus optional overrides. Priority determines which template wins when multiple match. Example: a component template defines common mappings (timestamp, host, message), and index templates for 'logs-*' and 'metrics-*' compose it with their specific fields. **Data streams** (for append-only time-series data) use index templates exclusively. The lifecycle: define component templates for shared settings, compose them in index templates with index patterns, and new indices automatically get the right configuration. Legacy index templates (v1 API _template) are deprecated in favor of composable templates (v2 API _index_template + _component_template)."
  ],

  deepDive: [
    "## Mapping Parameters Deep Dive\n\nBeyond field types, mapping parameters control fine-grained indexing behavior. **index: false** disables indexing for a field -- it is stored in _source but not searchable, saving disk space and indexing time. Useful for fields you only need to retrieve, never query. **doc_values: false** disables the columnar storage used for sorting and aggregations. For text-heavy fields you only search (never sort/aggregate), disabling doc_values saves significant disk space (doc values can be 30-50% of index size). **store: true** stores the field value separately from _source, allowing you to retrieve individual fields without parsing the entire _source JSON. Rarely needed since _source filtering is usually sufficient. **enabled: false** on an object means Elasticsearch does not parse or index the field at all -- it is stored as raw JSON in _source. Useful for metadata blobs you never query. **null_value** specifies a substitute value to index when the field is null, since null values are not indexable by default. **copy_to** copies the value into another field at index time, useful for creating combined 'all' fields for cross-field search without increasing storage.",

    "## Runtime Fields vs Index-Time Fields\n\nRuntime fields (introduced in ES 7.11) define fields at query time using Painless scripts rather than at index time. The field value is computed from _source on the fly during each query. Benefits: (1) no re-indexing required to add or modify fields, (2) no index size increase, (3) schema flexibility. Costs: (1) slower queries because values are computed per-document, (2) no support for certain aggregation types. Runtime fields can be defined in the mapping (persistent) or in the search request (ephemeral). A common pattern: start with a runtime field for experimentation, and once the field definition is stable, promote it to an index-time field by adding it to the mapping and re-indexing. Runtime fields support types: keyword, long, double, date, ip, boolean, geo_point, and lookup (cross-index joins).",

    "## Mapping Limitations and Workarounds\n\n**Mappings are immutable**: once a field is mapped, its type cannot be changed. To change a field type, you must create a new index with the correct mapping and reindex data. **Mapping explosion**: the default field limit is 1000 (index.mapping.total_fields.limit). High-cardinality key-value data should use the flattened field type instead of object, which indexes the entire object as a single field supporting keyword-like queries. **Nested field limits**: default 50 nested fields, 10000 nested objects per document. **Multi-field overhead**: each sub-field creates its own inverted index, increasing disk usage. **Join field**: the only way to model parent-child relationships, but it requires all related documents to live on the same shard (routing by parent ID) and has significant query-time overhead compared to denormalization. In general, denormalize data in Elasticsearch rather than modeling relational structures.",

    "## Flattened Field Type\n\nThe flattened type (introduced in ES 7.3) addresses the mapping explosion problem for arbitrary key-value data. Instead of creating a separate field mapping for each key in an object, the entire object is mapped as a single field. All leaf values are indexed as keywords. You can query with term-level queries on both keys and values: 'labels.priority' (dot-separated path) or just values. Limitations: only keyword-like queries (no full-text search, no range queries on numeric values, no aggregations on individual keys). For logging and monitoring use cases where labels/tags have unpredictable keys, flattened is essential. Alternative: use dynamic templates with 'enabled: false' to store but not index arbitrary objects, or use runtime fields to extract specific values at query time.",

    "## Mapping Best Practices for Production\n\nSet dynamic: strict on production indices to catch unintended new fields early. Use explicit mappings for all known fields. Apply index templates with appropriate priority so new indices get correct mappings automatically. Disable doc_values on text fields you never sort/aggregate. Disable indexing on fields you only retrieve. Use keyword type (not text) for structured data like IDs, status codes, and enum values. Use scaled_float instead of float when you need fixed precision (e.g., currency). Set ignore_malformed: true on fields where occasional bad data should not reject the entire document. Use date format arrays to handle multiple date formats. Set coerce: false to reject numeric strings in numeric fields rather than silently converting them. Monitor field count with _mapping API and set appropriate total_fields.limit."
  ],

  code: [
    {
      language: "json",
      caption: "Creating an index with explicit mappings covering common field types",
      source: `PUT /products
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "standard"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "english"
      },
      "sku": {
        "type": "keyword"
      },
      "price": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "quantity": {
        "type": "integer"
      },
      "created_at": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "location": {
        "type": "geo_point"
      },
      "tags": {
        "type": "keyword"
      },
      "is_active": {
        "type": "boolean"
      },
      "metadata": {
        "type": "flattened"
      },
      "variants": {
        "type": "nested",
        "properties": {
          "color": { "type": "keyword" },
          "size": { "type": "keyword" },
          "price": { "type": "scaled_float", "scaling_factor": 100 }
        }
      }
    }
  }
}`
    },
    {
      language: "json",
      caption: "Dynamic templates to control how new fields are auto-mapped",
      source: `PUT /logs
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "match": "*_id",
          "mapping": {
            "type": "keyword",
            "ignore_above": 512
          }
        }
      },
      {
        "counts_as_integers": {
          "match": "*_count",
          "mapping": {
            "type": "integer"
          }
        }
      },
      {
        "timestamps": {
          "match": "*_at",
          "mapping": {
            "type": "date",
            "format": "strict_date_optional_time||epoch_millis"
          }
        }
      },
      {
        "labels_as_flattened": {
          "match": "labels",
          "mapping": {
            "type": "flattened"
          }
        }
      },
      {
        "default_strings": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    ],
    "properties": {
      "@timestamp": { "type": "date" },
      "message": { "type": "text" },
      "level": { "type": "keyword" }
    }
  }
}`
    },
    {
      language: "json",
      caption: "Composable index templates with component templates for production",
      source: `// Step 1: Create reusable component templates
PUT /_component_template/base_settings
{
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "5s",
      "codec": "best_compression"
    }
  }
}

PUT /_component_template/common_mappings
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host": { "type": "keyword" },
        "service": { "type": "keyword" },
        "trace_id": {
          "type": "keyword",
          "index": true,
          "doc_values": false
        }
      }
    }
  }
}

// Step 2: Compose into an index template
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "priority": 200,
  "composed_of": ["base_settings", "common_mappings"],
  "template": {
    "settings": {
      "number_of_shards": 5
    },
    "mappings": {
      "properties": {
        "message": { "type": "text" },
        "level": { "type": "keyword" },
        "logger": { "type": "keyword" },
        "stack_trace": {
          "type": "text",
          "index": false
        }
      }
    }
  },
  "data_stream": {}
}

// New indices matching logs-* automatically get:
// - 5 shards (overridden), 1 replica, best_compression
// - @timestamp, host, service, trace_id from common_mappings
// - message, level, logger, stack_trace from the template`
    },
    {
      language: "json",
      caption: "Runtime fields and field aliasing for schema evolution without re-indexing",
      source: `// Add a runtime field to an existing mapping
PUT /orders/_mapping
{
  "runtime": {
    "total_with_tax": {
      "type": "double",
      "script": {
        "source": "emit(doc['subtotal'].value * (1 + doc['tax_rate'].value))"
      }
    },
    "day_of_week": {
      "type": "keyword",
      "script": {
        "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ROOT))"
      }
    }
  }
}

// Query using runtime fields just like regular fields
POST /orders/_search
{
  "query": {
    "range": {
      "total_with_tax": { "gte": 100 }
    }
  },
  "aggs": {
    "orders_by_day": {
      "terms": { "field": "day_of_week" }
    }
  }
}

// Ephemeral runtime field in a search request (not persisted)
POST /orders/_search
{
  "runtime_mappings": {
    "profit_margin": {
      "type": "double",
      "script": {
        "source": "emit((doc['revenue'].value - doc['cost'].value) / doc['revenue'].value)"
      }
    }
  },
  "query": {
    "range": {
      "profit_margin": { "gte": 0.2 }
    }
  }
}`
    }
  ],

  diagrams: [
    {
      title: "Elasticsearch Field Type Decision Tree",
      kind: "flow",
      caption: "Decision flow for choosing field types: string -> full-text search? -> text (+ keyword multi-field). Exact match only? -> keyword. Number -> range queries? -> integer/long/float. Date -> date with formats. Location -> geo_point or geo_shape. Array of objects with independent queries -> nested."
    },
    {
      title: "Multi-Field Indexing",
      kind: "architecture",
      caption: "A single source value 'New York City' is indexed three ways: as text field (tokens: [new, york, city] for full-text search), as keyword sub-field (exact value for sorting/aggregation), and optionally as autocomplete sub-field (edge ngrams: [ne, new, new_, ...])."
    },
    {
      title: "Object vs Nested Document Storage",
      kind: "architecture",
      caption: "Object type flattens arrays: [{a:1,b:2},{a:3,b:4}] becomes a:[1,3], b:[2,4] losing cross-field correlation. Nested type stores each element as a hidden Lucene document, preserving {a:1,b:2} and {a:3,b:4} as discrete units for accurate querying."
    }
  ],

  animations: [
    {
      title: "Dynamic Mapping in Action",
      steps: [
        { label: "First document arrives", detail: "Document {name: 'Widget', price: 9.99, active: true} is indexed. No mappings exist yet." },
        { label: "Type detection", detail: "Elasticsearch inspects each field's JSON type: 'Widget' is a string, 9.99 is a float, true is a boolean." },
        { label: "Auto-mapping created", detail: "Mappings are generated: name -> text with keyword sub-field, price -> float, active -> boolean." },
        { label: "Second document with new field", detail: "Document {name: 'Gadget', price: 19.99, active: true, category: 'electronics'} arrives with a new 'category' field." },
        { label: "Mapping extended", detail: "Dynamic mapping adds category -> text with keyword sub-field. The mapping now has 4 fields." },
        { label: "Type conflict", detail: "Document {name: 'Thing', price: 'twenty dollars'} arrives. 'price' is already mapped as float. This document is rejected with a mapper_parsing_exception." }
      ]
    },
    {
      title: "Reindex for Mapping Change",
      steps: [
        { label: "Identify mapping issue", detail: "Field 'status' was auto-mapped as text but should be keyword (you need exact match filtering and aggregations, not full-text search)." },
        { label: "Create new index", detail: "PUT /products_v2 with explicit mapping where status is keyword. Cannot change type on existing index." },
        { label: "Reindex data", detail: "POST /_reindex with source: products, dest: products_v2. Data is read from old index and re-indexed with new mappings." },
        { label: "Switch alias", detail: "Update the 'products' alias to point to products_v2 instead of products_v1. Applications see no change." },
        { label: "Delete old index", detail: "DELETE /products_v1 to reclaim disk space. The mapping change is complete with zero downtime." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "text", "keyword"],
    rows: [
      ["Analysis", "Analyzed through an analyzer (tokenized, lowercased, stemmed)", "Not analyzed. Stored as-is as a single token."],
      ["Search queries", "match, match_phrase, multi_match (full-text)", "term, terms, prefix, wildcard, regexp (exact)"],
      ["Sorting", "Not sortable (use keyword sub-field)", "Sortable. Uses doc_values by default."],
      ["Aggregations", "Not aggregatable (fielddata=true is expensive)", "Aggregatable. Efficient via doc_values."],
      ["Use cases", "Prose text, descriptions, article bodies, comments", "IDs, status codes, tags, enum values, email addresses"],
      ["Max length", "No hard limit (but huge fields slow indexing)", "ignore_above parameter (default 256 in dynamic mapping)"],
      ["Storage", "Inverted index (terms -> doc IDs)", "Inverted index (single token) + doc_values (column store)"],
      ["Default for strings", "Dynamic mapping creates text + keyword multi-field", "Must be explicitly specified unless using dynamic templates"]
    ]
  },

  interviewQA: [
    {
      q: "What is the difference between text and keyword field types in Elasticsearch?",
      a: "A text field is analyzed (tokenized, lowercased, stemmed) for full-text search. 'New York City' becomes tokens [new, york, city]. A keyword field stores the exact value as a single token for exact matching, sorting, and aggregations. You can use multi-fields to index a field as both types. The key rule: use text for human-readable prose you want to search within, and keyword for structured data you want to filter, sort, or aggregate on.",
      followUps: [
        "What happens if you try to sort on a text field?",
        "When would you disable the keyword sub-field on a string?",
        "What is the fielddata option on text fields and why is it dangerous?"
      ]
    },
    {
      q: "Why can you not change a field's mapping type once it is set?",
      a: "Mappings are tied to the physical data structure on disk. A text field has an inverted index with analyzed tokens; a keyword field has an inverted index with exact values plus doc_values. Changing the type would require rebuilding these structures from the original data, which Elasticsearch does not do automatically. The solution is to create a new index with the correct mapping, use the _reindex API to copy data, and then switch an alias. This aligns with Lucene's immutable segment architecture -- you cannot modify existing segments, only create new ones.",
      followUps: [
        "How do aliases help with zero-downtime reindexing?",
        "What is the _reindex API and what are its limitations?"
      ]
    },
    {
      q: "When should you use nested type instead of object type?",
      a: "Use nested when you have arrays of objects and need to query individual objects independently. The default object type flattens arrays, losing cross-field associations: [{color:'red', size:'L'}, {color:'blue', size:'S'}] becomes color:[red,blue], size:[L,S], so a query for 'red AND S' would incorrectly match. Nested preserves the association by indexing each object as a hidden separate Lucene document. The trade-off: nested queries are slower, each nested object counts toward the limit (default 10000 per doc), and updates re-index all nested objects. If you do not need to query individual array elements, object type is simpler and faster.",
      followUps: [
        "How does the nested query differ from a regular bool query?",
        "What is the join field type and how does it compare to nested?"
      ]
    },
    {
      q: "What is dynamic mapping and what are its risks?",
      a: "Dynamic mapping automatically creates field mappings when Elasticsearch encounters new fields. Strings become text+keyword, numbers become long or float, booleans become boolean. Risks: (1) mapping explosion -- indexing arbitrary JSON with thousands of unique keys can create thousands of fields, consuming heap memory and degrading performance; (2) incorrect type detection -- the first document determines the type, so if a field appears as '42' (string) first, it becomes text, and subsequent numeric values may fail; (3) inefficient types -- all numbers default to long even if byte would suffice. Mitigations: use 'dynamic: strict' in production, define explicit mappings, set total_fields.limit, and use dynamic_templates for predictable patterns.",
      followUps: [
        "What is the flattened field type and how does it prevent mapping explosion?",
        "How do dynamic templates work?"
      ]
    },
    {
      q: "How do index templates work in Elasticsearch?",
      a: "Index templates automatically apply settings and mappings to new indices matching a name pattern (e.g., 'logs-*'). Modern Elasticsearch uses composable templates: component templates define reusable fragments (common fields, standard settings), and index templates compose multiple component templates plus optional overrides. Priority determines precedence when multiple templates match. This is essential for time-series data where indices are created daily/weekly. Data streams require an index template. The key benefit is consistency -- all indices matching a pattern get the same shard count, replica count, mappings, and analyzers without manual configuration."
    }
  ],

  mcqs: [
    {
      q: "What happens when you index a document with a new field into an index with dynamic mapping set to 'strict'?",
      options: [
        "The field is automatically mapped and the document is indexed",
        "The field is ignored but the document is indexed",
        "The document is rejected with a strict_dynamic_mapping_exception",
        "The field is stored as a runtime field"
      ],
      answerIndex: 2,
      explanation: "With dynamic: strict, Elasticsearch rejects any document containing fields not explicitly defined in the mapping. This prevents accidental schema changes in production. Use dynamic: false to silently ignore unmapped fields while still storing them in _source."
    },
    {
      q: "What is the primary advantage of the 'nested' type over the default 'object' type?",
      options: [
        "Nested fields use less disk space",
        "Nested fields preserve the independence of each object in an array for querying",
        "Nested fields are automatically flattened for better performance",
        "Nested fields support full-text search on object keys"
      ],
      answerIndex: 1,
      explanation: "The nested type indexes each object in an array as a hidden separate Lucene document, preserving cross-field associations. This prevents false positives when querying arrays of objects. The default object type flattens arrays, losing the association between fields within each object."
    },
    {
      q: "Which mapping parameter would you use to save disk space on a text field that is searched but never used for sorting or aggregations?",
      options: [
        "index: false",
        "doc_values: false",
        "store: false",
        "enabled: false"
      ],
      answerIndex: 1,
      explanation: "doc_values is the columnar storage used for sorting and aggregations. Disabling it on text fields you only search saves significant disk space (doc_values can be 30-50% of index size). Note: text fields have doc_values disabled by default; this is more relevant for keyword fields you never sort/aggregate."
    },
    {
      q: "How does the 'flattened' field type help prevent mapping explosion?",
      options: [
        "It compresses field names to reduce memory usage",
        "It indexes the entire object as a single field with all leaf values as keywords",
        "It automatically deletes fields that exceed the field limit",
        "It converts all values to a single string type"
      ],
      answerIndex: 1,
      explanation: "The flattened type maps an entire object as a single field, regardless of how many keys it has. All leaf values are indexed as keywords. This prevents mapping explosion from arbitrary key-value data (e.g., labels, tags) where each unique key would otherwise create a separate field mapping."
    },
    {
      q: "What is the correct way to change a field's type from 'text' to 'keyword' in an existing index?",
      options: [
        "PUT /_mapping with the updated field type",
        "DELETE the field and re-add it with the new type",
        "Create a new index with the correct mapping and reindex the data",
        "Use the _update_by_query API to change the field type"
      ],
      answerIndex: 2,
      explanation: "Field types are immutable once set. The only way to change a type is to create a new index with the correct mapping, use _reindex to copy data, and optionally switch an alias for zero-downtime migration. Neither _mapping updates nor _update_by_query can change existing field types."
    }
  ],

  flashcards: [
    { front: "What is the difference between text and keyword field types?", back: "Text: analyzed (tokenized) for full-text search. Cannot sort/aggregate. Keyword: exact value, single token. Used for filtering, sorting, aggregations. Use multi-fields for both." },
    { front: "What are multi-fields in Elasticsearch?", back: "Multi-fields let a single source field be indexed multiple ways. E.g., 'name' as text for search + 'name.keyword' as keyword for sorting. Defined with the 'fields' parameter in the mapping." },
    { front: "What does dynamic: strict do?", back: "Rejects documents with unmapped fields (strict_dynamic_mapping_exception). Prevents accidental schema changes. Use in production. Alternative: dynamic: false (silently ignores unmapped fields, still stores in _source)." },
    { front: "What is the nested field type for?", back: "Preserves independence of objects in arrays. Without nested, [{a:1,b:2},{a:3,b:4}] is flattened to a:[1,3],b:[2,4], losing cross-field association. Nested indexes each object as a separate hidden Lucene document." },
    { front: "What is the flattened field type?", back: "Maps an entire JSON object as a single field. All leaf values indexed as keywords. Prevents mapping explosion from arbitrary key-value data. Trade-off: no full-text search, no range queries on values." },
    { front: "What is the copy_to mapping parameter?", back: "Copies a field's value into another field at index time. Used to create a combined 'search_all' field from multiple source fields. No additional storage for the source -- only the target field stores the copied values." },
    { front: "What is a component template?", back: "A reusable building block containing partial settings or mappings. Index templates compose multiple component templates. Enables DRY configuration across index patterns (e.g., common timestamp mapping used by logs-* and metrics-*)." },
    { front: "What is scaled_float and when to use it?", back: "Stores a float as a long internally with a scaling_factor (e.g., 100 for 2 decimal places). More efficient than float for fixed-precision values like currency. Avoids floating-point precision issues." },
    { front: "What does ignore_above do on keyword fields?", back: "Skips indexing values longer than the specified length (e.g., 256 characters). The value is still stored in _source. Prevents huge values from bloating the inverted index. Default in dynamic mapping: 256." },
    { front: "What is the difference between index:false and enabled:false?", back: "index:false: field is parsed and stored in _source but not indexed (not searchable). enabled:false: field is not parsed at all, stored as raw JSON in _source. enabled applies only to object fields." }
  ],

  revisionNotes: [
    "Text = analyzed for full-text search. Keyword = exact value for filter/sort/agg. Multi-fields = both.",
    "Dynamic mapping: true (auto-map), false (ignore but store), strict (reject), runtime (auto as runtime fields).",
    "Mappings are immutable. Change type = new index + _reindex + alias swap.",
    "Nested type preserves array-of-object independence. Object type flattens arrays. Use nested only when needed.",
    "Flattened type: one field for entire object. All values as keywords. Prevents mapping explosion.",
    "Composable templates: component templates (reusable parts) + index templates (compose + override). Priority resolves conflicts.",
    "doc_values: columnar store for sort/agg. Disable to save disk on search-only fields.",
    "copy_to: index-time value copy to a combined field. No extra source storage.",
    "scaled_float: stores float as long * scaling_factor. Better for currency than float.",
    "Runtime fields: computed at query time from _source. No re-indexing. Slower queries. Good for experimentation."
  ],

  cheatSheet: [
    "text: analyzed, full-text search. keyword: exact value, sort, agg.",
    "Multi-field: {type: text, fields: {keyword: {type: keyword}}}",
    "dynamic: strict in production to prevent accidental schema changes",
    "Nested: preserves array-of-object independence. Hidden Lucene docs.",
    "Flattened: entire object as one field, all leaves as keywords. Anti-explosion.",
    "Mapping change: new index -> _reindex -> alias swap. No in-place type change.",
    "index: false = not searchable. doc_values: false = not sortable/aggregatable.",
    "enabled: false = not parsed at all. Raw JSON in _source only.",
    "copy_to: combine fields at index time. null_value: index substitute for null.",
    "Component template: reusable fragment. Index template: composes components + pattern.",
    "scaled_float with scaling_factor: 100 for currency (stores as long internally)",
    "ignore_above: 256 on keyword = skip indexing values longer than 256 chars"
  ],

  exercises: [
    "You have an index where `status` was auto-mapped as `text` but you need it as `keyword` for filtering and aggregations. Perform a **zero-downtime mapping migration**: create a new index `products_v2` with the correct mapping, write the `POST /_reindex` command, and switch the `products` alias. Include the alias swap command using `POST /_aliases`.",
    "Design a mapping for a **multi-language blog** where each post has a `title` and `body` in English and Spanish. Use *multi-fields* so that each language variant is analyzed with the appropriate language analyzer (`english`, `spanish`) while also having a `keyword` sub-field. Write the full `PUT /blog` mapping.",
    "Your team is indexing arbitrary JSON metadata from IoT devices, causing **mapping explosion** (field count exceeding 1000). Refactor the mapping to use the `flattened` field type for the metadata object. Show the before-and-after mapping, and explain what query capabilities are *lost* with flattened (no full-text search, no range queries on numeric values).",
    "Create a **composable index template** setup for a logging platform: one *component template* for common fields (`@timestamp`, `host`, `service`), another for standard settings (3 shards, `best_compression`), and an *index template* for `logs-*` that composes both and adds `message` (text) and `level` (keyword). Write all three `PUT` requests.",
    "Add a **runtime field** called `age_days` to an existing `orders` index that computes the number of days since `created_at` using a Painless script. Write the `PUT /orders/_mapping` request, then write a search query that filters for orders older than 30 days using the runtime field. Explain when you would *promote* this to an index-time field.",
  ],
  resources: [
    { label: "Elasticsearch Mapping Reference", kind: "docs", note: "Official documentation covering all field types, mapping parameters, and dynamic mapping rules" },
    { label: "Elasticsearch: The Definitive Guide - Mapping chapter", kind: "book", note: "Detailed explanations of mapping concepts with practical examples and best practices" },
    { label: "Elastic Blog: Flattened field type", kind: "article", note: "Introduction to the flattened type for preventing mapping explosion with arbitrary key-value data" },
    { label: "Elasticsearch Runtime Fields documentation", kind: "docs", note: "Guide to defining and using runtime fields for schema-on-read flexibility" },
    { label: "Elastic Common Schema (ECS) Reference", kind: "docs", note: "Standard field names and types for common data sources. Great reference for mapping design." },
    { label: "Elasticsearch Index Templates documentation", kind: "docs", note: "Official guide to composable index templates and component templates" }
  ],

  glossary: [
    { term: "Mapping", definition: "The schema definition for an Elasticsearch index, specifying field names, types, analyzers, and indexing parameters." },
    { term: "Multi-field", definition: "A mapping feature that indexes a single source field in multiple ways (e.g., as both text and keyword) under different sub-field names." },
    { term: "Dynamic Mapping", definition: "Automatic field type detection and mapping creation when Elasticsearch encounters new fields in indexed documents." },
    { term: "Nested Type", definition: "A field type that indexes each object in an array as a separate hidden Lucene document, preserving cross-field associations for accurate querying." },
    { term: "Flattened Type", definition: "A field type that maps an entire JSON object as a single field, indexing all leaf values as keywords to prevent mapping explosion." },
    { term: "Doc Values", definition: "A columnar, on-disk data structure built at index time that enables efficient sorting, aggregations, and scripted field access." },
    { term: "Component Template", definition: "A reusable building block containing partial index settings or mappings, composed into index templates." },
    { term: "Runtime Field", definition: "A field computed at query time from _source using a Painless script, requiring no re-indexing to add or modify." },
    { term: "Index Template", definition: "A configuration that automatically applies settings and mappings to new indices matching a name pattern." },
    { term: "scaled_float", definition: "A numeric type that stores floating-point values as scaled long integers, providing fixed-precision storage more efficient than native floats." }
  ]
};
