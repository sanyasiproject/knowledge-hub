import type { TopicContent } from "../types";

export const invertedIndex: TopicContent = {
  quickSummary: [
    "An inverted index is a data structure that maps terms (words or tokens) to the list of documents (or positions within documents) where they appear. It is the foundational structure behind full-text search engines like Elasticsearch, Apache Solr, and Lucene.",
    "Building an inverted index involves an analysis pipeline: character filters clean raw text, a tokenizer splits it into tokens, and token filters normalize those tokens (lowercasing, stemming, removing stop words). The resulting terms are stored in a sorted dictionary that points to posting lists.",
    "Relevance scoring determines how well a document matches a query. Term Frequency (TF) counts how often a term appears in a document. TF-IDF adds Inverse Document Frequency to down-weight common terms. BM25 (Best Matching 25) is the modern default, adding saturation and document-length normalization to TF-IDF.",
    "Posting lists are the core of the inverted index: each term maps to an ordered list of document IDs (and optionally positions and payloads). Efficient encoding techniques like delta encoding, variable-byte encoding, and Frame of Reference (FOR) compression make posting lists compact and fast to traverse.",
    "Elasticsearch uses Apache Lucene segments under the hood. Each segment is an immutable inverted index. New documents go into an in-memory buffer, get flushed to new segments, and segments are periodically merged. This append-only design enables high write throughput while maintaining search performance."
  ],

  detailed: [
    "## The Analysis Pipeline\n\nBefore any text is indexed, it passes through an analyzer composed of three stages. **Character filters** operate on the raw character stream: html_strip removes HTML tags, mapping replaces characters (e.g., converting Roman numerals to digits), and pattern_replace uses regex substitution. **Tokenizers** break the filtered stream into individual tokens: the standard tokenizer splits on word boundaries per Unicode Text Segmentation, the whitespace tokenizer splits only on whitespace, and the pattern tokenizer splits using a regex. **Token filters** transform each token: lowercase normalizes case, stemmer reduces words to their root form (running -> run), stop removes common words (the, is, at), synonym expands or replaces tokens based on a synonym map, and edge_ngram produces prefix tokens for autocomplete. The order of token filters matters -- stemming after lowercasing produces different results than the reverse.",

    "## Term Frequency and TF-IDF\n\nTerm Frequency (TF) is the simplest relevance signal: the more times a term appears in a document, the more relevant that document is for that term. Raw TF is usually dampened with a logarithm: tf(t,d) = 1 + log(count(t,d)) to prevent a document mentioning 'search' 100 times from scoring 100x higher than one mentioning it once. Inverse Document Frequency (IDF) addresses the problem of common terms: idf(t) = log(N / df(t)) where N is total documents and df(t) is the number of documents containing term t. A term appearing in every document has an IDF near zero. TF-IDF = tf(t,d) * idf(t) combines both signals: high scores go to documents with frequent occurrences of rare terms. TF-IDF was the standard scoring model for decades but has known weaknesses around term saturation and document length bias.",

    "## BM25: The Modern Scoring Function\n\nBM25 (Best Matching 25) is a probabilistic ranking function that improves on TF-IDF in two key ways. First, it adds **term frequency saturation**: after a certain number of occurrences, additional appearances of a term contribute diminishing returns to the score. This is controlled by parameter k1 (default 1.2) -- at k1=0, BM25 is binary (term present or not); at k1=infinity, it becomes raw TF. Second, it adds **document length normalization** controlled by parameter b (default 0.75) -- at b=1, full length normalization is applied (short documents are boosted); at b=0, document length is ignored. The BM25 formula is: score(D,Q) = SUM[ idf(qi) * (tf(qi,D) * (k1+1)) / (tf(qi,D) + k1 * (1 - b + b * |D|/avgdl)) ] for each query term qi. Elasticsearch has used BM25 as its default similarity since version 5.0.",

    "## Posting List Structure and Compression\n\nA posting list for a term contains: (1) an ordered list of document IDs, (2) optionally, the term frequency per document, (3) optionally, positions within each document (needed for phrase queries and highlighting), and (4) optionally, payloads (arbitrary per-position metadata). Lucene stores posting lists in compressed form using several techniques. **Delta encoding**: instead of storing absolute doc IDs [100, 105, 110, 200], store deltas [100, 5, 5, 90] which are smaller numbers. **Variable-byte (VByte) encoding**: use fewer bytes for smaller numbers (1 byte for values < 128, 2 bytes for < 16384, etc.). **Frame of Reference (FOR)**: group deltas into blocks of 128 and bit-pack them using the minimum number of bits needed for the block. **Roaring bitmaps**: for very dense posting lists, bitmaps are more efficient than sorted lists. Posting list intersection (for AND queries) uses skip lists that allow jumping over large sections of non-matching documents.",

    "## Lucene Segments and the Inverted Index Lifecycle\n\nElasticsearch delegates index storage to Apache Lucene, which uses an immutable segment-based architecture. New documents are first written to an in-memory buffer and a transaction log (translog). A **refresh** (default every 1 second) flushes the buffer into a new Lucene segment, making documents searchable. A **flush** fsync's segments to disk and clears the translog. Over time, many small segments accumulate. **Merge** operations combine multiple segments into fewer, larger segments, reclaiming space from deleted documents (deletes are initially just marked in a bitset, not physically removed). The merge policy (tiered merge by default) controls when and how segments are merged. Each segment contains its own inverted index, stored fields, doc values, and norms. Searches fan out across all segments and merge results. Fewer, larger segments mean faster searches but merges are I/O intensive.",

    "## Building a Custom Analyzer in Elasticsearch\n\nElasticsearch allows composing analyzers from character filters, a tokenizer, and token filters. A custom analyzer is defined at index creation time in the settings. For example, an analyzer for code search might use a pattern tokenizer that splits on non-alphanumeric characters, a lowercase filter, and a camelCase token filter. For multilingual content, you might chain an ICU tokenizer with language-specific stemmers. The _analyze API lets you test an analyzer against sample text to see exactly what tokens it produces. Understanding the analysis pipeline is critical because it determines what tokens exist in the inverted index, and queries that do not match those tokens return no results. A common mistake is analyzing a field with the standard analyzer at index time but searching it with a keyword analyzer at query time."
  ],

  deepDive: [
    "## Skip Lists and Posting List Intersection\n\nWhen a boolean AND query requires intersecting two posting lists, the naive approach is a linear merge: walk both lists simultaneously, advancing the pointer on the smaller doc ID. This is O(n+m) where n and m are list lengths. Skip lists add multi-level forward pointers at regular intervals (e.g., every 128 documents), allowing the intersection algorithm to skip over large stretches of non-matching doc IDs. Lucene uses block-based skipping: posting lists are divided into blocks of 128 doc IDs. Each block header records the maximum doc ID in that block, enabling rapid skipping. For queries with many terms, Lucene uses a priority queue of iterators sorted by cost (estimated posting list length), processing the rarest term first and using its posting list to skip through the more common terms.",

    "## Finite State Transducers (FSTs) for Term Dictionaries\n\nLucene stores the term dictionary as a Finite State Transducer (FST), a compact data structure that maps byte sequences (terms) to outputs (metadata like the pointer to the posting list). An FST is like a trie but with shared suffixes as well as shared prefixes, making it extremely memory-efficient. For a typical English-language index, an FST uses about 5-10 bytes per term versus 20-40 bytes for a hash map. FSTs support prefix queries (autocomplete), fuzzy queries (edit distance), and range queries natively by traversing the automaton. The trade-off is that FSTs are immutable and must be rebuilt entirely when terms change, which aligns with Lucene's immutable segment model. The FST is loaded into memory at segment open time, which is why the term dictionary contributes significantly to heap usage.",

    "## Norms, Doc Values, and Stored Fields\n\nThe inverted index is optimized for search (term to documents), but other access patterns need different structures. **Norms** store per-field, per-document normalization factors (primarily document length) used by BM25 scoring. They are encoded as a single byte per document per field. **Doc values** are column-oriented storage for field values, used for sorting, aggregations, and scripting. They are the inverse of the inverted index: document to value rather than value to documents. Doc values use techniques like ordinal encoding (mapping strings to integers), bit packing, and run-length encoding for compression. **Stored fields** contain the original field values for retrieval (the _source field). They are row-oriented and compressed with LZ4. Understanding which structure serves which purpose is essential for optimizing index size and query performance.",

    "## Index-Time vs Query-Time Analysis\n\nA subtle but critical aspect of inverted indexes is that text is analyzed both at index time and at query time, and the analyzers must be compatible. At index time, the document text is analyzed into terms that populate the inverted index. At query time, the query string is analyzed into terms that are looked up in the index. If the index analyzer produces the stem 'run' from 'running' but the query analyzer does not stem, searching for 'running' will not match. Elasticsearch allows specifying separate index_analyzer and search_analyzer for a field. Common use cases for different analyzers: edge_ngram at index time for autocomplete (index 'search' as ['s','se','sea','sear','searc','search']) with standard at query time (search for 'sear' matches the indexed ngram). Synonym expansion can be done at either time: index-time expansion increases index size but is faster; query-time expansion keeps the index smaller but adds query overhead.",

    "## Positional Indexes and Phrase Queries\n\nA basic inverted index stores only document IDs per term, which supports bag-of-words queries. To support phrase queries ('quick brown fox') and proximity queries (quick NEAR fox), the index must also store the position of each term occurrence within each document. A positional posting list entry looks like: term -> [(doc1, [pos3, pos17, pos42]), (doc2, [pos1, pos8])]. Phrase query evaluation checks that the positions of consecutive query terms differ by exactly 1. Proximity queries (slop) allow a configurable gap. Positional data significantly increases index size -- typically 2-4x larger than a non-positional index. Lucene stores positions using delta encoding within each document. The span query family in Elasticsearch provides fine-grained positional query capabilities, including span_near (ordered proximity), span_or, and span_not."
  ],

  code: [
    {
      language: "json",
      caption: "Creating a custom analyzer in Elasticsearch with character filter, tokenizer, and token filters",
      source: `PUT /articles
{
  "settings": {
    "analysis": {
      "char_filter": {
        "html_cleaner": {
          "type": "html_strip",
          "escaped_tags": ["code", "pre"]
        }
      },
      "tokenizer": {
        "path_tokenizer": {
          "type": "pattern",
          "pattern": "[/\\\\\\\\.]"
        }
      },
      "filter": {
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        },
        "autocomplete_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 15
        }
      },
      "analyzer": {
        "content_analyzer": {
          "type": "custom",
          "char_filter": ["html_cleaner"],
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "english_stop",
            "english_stemmer"
          ]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "autocomplete_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "autocomplete_analyzer",
        "search_analyzer": "standard"
      },
      "body": {
        "type": "text",
        "analyzer": "content_analyzer"
      }
    }
  }
}`
    },
    {
      language: "json",
      caption: "Testing an analyzer with the _analyze API to see the exact tokens produced",
      source: `// Test the standard analyzer
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox jumped over 2 lazy dogs!"
}
// Output tokens: [the, quick, brown, fox, jumped, over, 2, lazy, dogs]

// Test a custom analyzer defined on an index
POST /articles/_analyze
{
  "analyzer": "content_analyzer",
  "text": "Running searches across <b>distributed</b> systems"
}
// Output tokens: [run, search, across, distribut, system]
// Note: "Running" -> stemmed to "run", stop words removed,
//       HTML stripped, "distributed" -> stemmed to "distribut"

// Analyze with explicit components (no pre-defined analyzer needed)
POST /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "porter_stem"],
  "text": "<p>Indexing and Searching</p>"
}
// Output tokens: [index, and, search]`
    },
    {
      language: "python",
      caption: "BM25 scoring implementation showing term frequency saturation and length normalization",
      source: `import math
from collections import Counter

def bm25_score(query_terms, document, corpus, k1=1.2, b=0.75):
    """
    BM25 scoring for a single document against a query.

    Parameters:
        query_terms: list of query terms (already tokenized)
        document: list of terms in the document
        corpus: list of documents (each a list of terms)
        k1: term frequency saturation parameter (default 1.2)
        b: document length normalization parameter (default 0.75)
    """
    doc_len = len(document)
    avg_doc_len = sum(len(d) for d in corpus) / len(corpus)
    N = len(corpus)

    doc_term_freqs = Counter(document)
    score = 0.0

    for term in query_terms:
        # Document frequency: how many docs contain this term
        df = sum(1 for d in corpus if term in d)
        if df == 0:
            continue

        # IDF with smoothing (Lucene's formula)
        idf = math.log(1 + (N - df + 0.5) / (df + 0.5))

        # Term frequency in this document
        tf = doc_term_freqs.get(term, 0)

        # BM25 TF component with saturation and length normalization
        # As tf grows, this approaches (k1 + 1) asymptotically
        tf_norm = (tf * (k1 + 1)) / (
            tf + k1 * (1 - b + b * doc_len / avg_doc_len)
        )

        score += idf * tf_norm

    return score

# Example
corpus = [
    "the quick brown fox jumps over the lazy dog".split(),
    "a quick brown dog outpaces the fox".split(),
    "the fox is quick and the dog is lazy".split(),
    "search engines use inverted indexes for fast retrieval".split(),
]

query = ["quick", "fox"]
for i, doc in enumerate(corpus):
    s = bm25_score(query, doc, corpus)
    print(f"Doc {i}: {s:.4f}  ->  {' '.join(doc)}")
# Doc 0: 0.6931  ->  the quick brown fox jumps over the lazy dog
# Doc 1: 0.7735  ->  a quick brown dog outpaces the fox
# Doc 2: 0.8108  ->  the fox is quick and the dog is lazy
# Doc 3: 0.0000  ->  search engines use inverted indexes ...`
    },
    {
      language: "json",
      caption: "Using the explain API to see how Elasticsearch computes BM25 scores",
      source: `// Search with explanation to see BM25 breakdown
POST /articles/_search
{
  "explain": true,
  "query": {
    "match": {
      "body": "inverted index search"
    }
  }
}

// Response includes score breakdown per document:
// {
//   "_explanation": {
//     "value": 5.234,
//     "description": "sum of:",
//     "details": [
//       {
//         "value": 2.105,
//         "description": "weight(body:invert in 0) [PerFieldSimilarity]",
//         "details": [
//           { "value": 2.079, "description": "idf, computed as log(1 + (N - n + 0.5) / (n + 0.5))" },
//           { "value": 1.012, "description": "tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl))" }
//         ]
//       },
//       {
//         "value": 1.893,
//         "description": "weight(body:index in 0) [PerFieldSimilarity]",
//         ...
//       },
//       {
//         "value": 1.236,
//         "description": "weight(body:search in 0) [PerFieldSimilarity]",
//         ...
//       }
//     ]
//   }
// }

// Configure BM25 parameters per index
PUT /articles
{
  "settings": {
    "similarity": {
      "custom_bm25": {
        "type": "BM25",
        "k1": 1.5,
        "b": 0.5,
        "discount_overlaps": true
      }
    }
  },
  "mappings": {
    "properties": {
      "body": {
        "type": "text",
        "similarity": "custom_bm25"
      }
    }
  }
}`
    }
  ],

  diagrams: [
    {
      title: "Inverted Index Structure",
      kind: "structure",
      caption: "Term dictionary maps each unique term to a posting list containing document IDs, term frequencies, and positions. The dictionary is stored as a Finite State Transducer (FST) for compact in-memory representation."
    },
    {
      title: "Elasticsearch Analysis Pipeline",
      kind: "flow",
      caption: "Raw text flows through character filters (html_strip, mapping), then a tokenizer (standard, whitespace, pattern), then token filters (lowercase, stemmer, stop, synonym) to produce the final terms stored in the inverted index."
    },
    {
      title: "Lucene Segment Lifecycle",
      kind: "flow",
      caption: "Documents are buffered in memory, refreshed into immutable segments (making them searchable), flushed to disk, and periodically merged into larger segments. Deletes are marked in a bitset until the segment is merged."
    }
  ],

  animations: [
    {
      title: "Building an Inverted Index from Documents",
      steps: [
        { label: "Ingest documents", detail: "Three documents arrive: Doc1='the quick fox', Doc2='the lazy dog', Doc3='the quick dog jumps'." },
        { label: "Analyze text", detail: "Each document passes through the analyzer. Standard analyzer lowercases and tokenizes: Doc1 -> [the, quick, fox], Doc2 -> [the, lazy, dog], Doc3 -> [the, quick, dog, jumps]." },
        { label: "Build term dictionary", detail: "Collect all unique terms and sort alphabetically: [dog, fox, jumps, lazy, quick, the]." },
        { label: "Create posting lists", detail: "For each term, record which documents contain it: dog -> [2,3], fox -> [1], jumps -> [3], lazy -> [2], quick -> [1,3], the -> [1,2,3]." },
        { label: "Add positions", detail: "If positional indexing is enabled, record positions: quick -> [(doc1,pos1), (doc3,pos1)], enabling phrase queries." },
        { label: "Compress and store", detail: "Delta-encode doc IDs (dog: [2,1] as deltas), apply variable-byte encoding, build FST for the term dictionary, write to a Lucene segment on disk." }
      ]
    },
    {
      title: "BM25 Scoring a Query",
      steps: [
        { label: "Tokenize query", detail: "Query 'quick fox' is analyzed into terms [quick, fox] using the search analyzer." },
        { label: "Look up posting lists", detail: "Retrieve posting lists: quick -> [doc1, doc3], fox -> [doc1]. These are the candidate documents." },
        { label: "Compute IDF per term", detail: "With 3 docs total: idf(quick) = log(1 + (3-2+0.5)/(2+0.5)) = 0.47, idf(fox) = log(1 + (3-1+0.5)/(1+0.5)) = 1.10. 'fox' is rarer, so it has higher IDF." },
        { label: "Compute TF normalization", detail: "For doc1 (length 3, avg length ~3.3): tf_norm(quick) = (1*2.2)/(1 + 1.2*(1-0.75+0.75*3/3.3)) = 1.03. The saturation curve limits the contribution of repeated terms." },
        { label: "Sum per-term scores", detail: "Doc1 score = idf(quick)*tf_norm(quick,doc1) + idf(fox)*tf_norm(fox,doc1). Doc3 score = idf(quick)*tf_norm(quick,doc3) + 0 (no fox). Doc1 ranks higher because it contains the rarer term 'fox'." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "TF-IDF", "BM25"],
    rows: [
      ["Term frequency handling", "Logarithmic dampening: 1 + log(tf). Unbounded growth.", "Saturation via k1 parameter. Approaches (k1+1) asymptotically."],
      ["Document length normalization", "Optional, typically cosine normalization of the TF vector.", "Built-in via parameter b (0=no normalization, 1=full normalization)."],
      ["IDF formula", "log(N/df) -- can produce negative values for very common terms.", "log(1 + (N-df+0.5)/(df+0.5)) -- always non-negative."],
      ["Tunability", "Limited. Logarithmic dampening is fixed.", "Two parameters: k1 (saturation) and b (length normalization) allow corpus-specific tuning."],
      ["Default in Elasticsearch", "Was default before ES 5.0.", "Default since Elasticsearch 5.0."],
      ["Theoretical basis", "Vector space model -- documents and queries are vectors in term space.", "Probabilistic relevance model -- probability that a document is relevant given the query."],
      ["Term saturation", "No saturation. tf=100 scores much higher than tf=10.", "Saturates. Beyond a certain tf, additional occurrences contribute very little."],
      ["Performance on short fields", "Can over-weight short documents if not normalized.", "Handles well via length normalization parameter b."]
    ]
  },

  interviewQA: [
    {
      q: "What is an inverted index and why is it called 'inverted'?",
      a: "A forward index maps documents to the terms they contain (doc -> [term1, term2, ...]). An inverted index reverses this mapping: it maps terms to the documents containing them (term -> [doc1, doc2, ...]). This inversion makes full-text search efficient -- to find all documents containing 'search', you look up one entry in the term dictionary instead of scanning every document. The term dictionary is typically sorted and stored as an FST for O(term_length) lookups.",
      followUps: [
        "How does Lucene store the inverted index on disk?",
        "What is the difference between a positional and non-positional inverted index?",
        "How do posting list intersection algorithms work for multi-term queries?"
      ]
    },
    {
      q: "Explain the difference between TF-IDF and BM25. Why did Elasticsearch switch to BM25?",
      a: "TF-IDF multiplies term frequency (how often a term appears in a document) by inverse document frequency (how rare the term is across the corpus). BM25 improves on this with two mechanisms: (1) term frequency saturation controlled by k1 -- after a point, additional occurrences contribute diminishing returns, preventing a document that mentions a term 100 times from dominating, and (2) document length normalization controlled by b -- adjusting for the fact that longer documents naturally have higher term frequencies. Elasticsearch switched to BM25 in version 5.0 because it produces more intuitive rankings out of the box, especially for corpora with varying document lengths.",
      followUps: [
        "What values would you choose for k1 and b, and why?",
        "How can you see the BM25 score breakdown for a specific search result?"
      ]
    },
    {
      q: "What role does the analyzer play in Elasticsearch, and what happens if you use different analyzers at index time and query time?",
      a: "The analyzer converts raw text into tokens stored in the inverted index. It consists of character filters (preprocessing the character stream), a tokenizer (splitting into tokens), and token filters (transforming tokens). If the index-time and query-time analyzers produce different tokens, searches may return no results or incorrect results. For example, if the index analyzer applies stemming but the search analyzer does not, searching for 'running' won't match documents indexed with the stem 'run'. Elasticsearch defaults to using the same analyzer for both, but you can set a separate search_analyzer, which is useful for edge_ngram autocomplete: index with edge_ngram to create prefix tokens, search with standard to match exact prefixes.",
      followUps: [
        "How would you debug a search that returns unexpected results due to analyzer mismatch?",
        "What is the _analyze API and how do you use it?"
      ]
    },
    {
      q: "How does Elasticsearch handle near-real-time search with its segment-based architecture?",
      a: "Elasticsearch achieves near-real-time (NRT) search through a refresh cycle. When a document is indexed, it goes into an in-memory buffer and the translog (for durability). Every 1 second (configurable via index.refresh_interval), the buffer is flushed into a new Lucene segment in the OS filesystem cache -- this makes documents searchable without waiting for an expensive fsync to disk. The translog is fsync'd periodically or on every request (configurable) for durability. This means there is typically a 1-second delay between indexing and searchability. For truly real-time requirements, you can call the _refresh API, but frequent refreshes create many small segments that hurt search performance and trigger more merges.",
      followUps: [
        "What is the difference between refresh, flush, and merge?",
        "How does the merge policy affect search and indexing performance?"
      ]
    },
    {
      q: "What are posting lists and how are they compressed in Lucene?",
      a: "A posting list is an ordered sequence of document IDs (plus optional frequencies, positions, and payloads) for a single term. Lucene compresses posting lists using several techniques: (1) delta encoding converts absolute doc IDs into differences between consecutive IDs, producing smaller numbers; (2) variable-byte encoding uses fewer bytes for smaller values; (3) Frame of Reference (FOR) groups 128 deltas into blocks and bit-packs them using the minimum number of bits needed; (4) skip lists add multi-level forward pointers for efficient intersection. For very dense lists (where most documents contain the term), roaring bitmaps may be more efficient. These techniques reduce index size by 4-10x while maintaining fast traversal."
    }
  ],

  mcqs: [
    {
      q: "In the Elasticsearch analysis pipeline, what is the correct order of processing?",
      options: [
        "Tokenizer -> Character filters -> Token filters",
        "Character filters -> Tokenizer -> Token filters",
        "Token filters -> Tokenizer -> Character filters",
        "Tokenizer -> Token filters -> Character filters"
      ],
      answerIndex: 1,
      explanation: "The analysis pipeline processes text in this order: character filters first (operating on the raw character stream, e.g., stripping HTML), then the tokenizer (splitting into tokens), then token filters (transforming individual tokens, e.g., lowercasing, stemming)."
    },
    {
      q: "What does the BM25 parameter k1 control?",
      options: [
        "Document length normalization",
        "The number of query terms to consider",
        "Term frequency saturation",
        "Inverse document frequency weighting"
      ],
      answerIndex: 2,
      explanation: "k1 controls how quickly term frequency saturates. At k1=0, only term presence matters (binary). As k1 increases, additional occurrences of a term contribute more to the score. At k1=infinity, there is no saturation (like raw TF). Default is 1.2."
    },
    {
      q: "What data structure does Lucene use to store the term dictionary in memory?",
      options: [
        "Hash map",
        "B-tree",
        "Finite State Transducer (FST)",
        "Red-black tree"
      ],
      answerIndex: 2,
      explanation: "Lucene uses a Finite State Transducer (FST), which is similar to a trie but with shared suffixes as well as shared prefixes. FSTs are extremely memory-efficient (5-10 bytes per term) and support prefix queries, fuzzy queries, and range queries natively."
    },
    {
      q: "Why does Elasticsearch have a ~1 second delay between indexing a document and it appearing in search results?",
      options: [
        "The document must be replicated to all nodes first",
        "BM25 scoring requires recomputing IDF across all segments",
        "The in-memory buffer is flushed to a new searchable segment on the refresh interval (default 1s)",
        "The inverted index must be fully rebuilt after each new document"
      ],
      answerIndex: 2,
      explanation: "Documents go into an in-memory buffer first. The refresh operation (default every 1 second) flushes this buffer into a new immutable Lucene segment in the filesystem cache, making documents searchable. This near-real-time design balances searchability with write performance."
    },
    {
      q: "Which compression technique do Lucene posting lists use to reduce document ID storage?",
      options: [
        "Huffman encoding of absolute doc IDs",
        "Delta encoding followed by variable-byte or Frame of Reference bit-packing",
        "Dictionary compression with LZ4",
        "Run-length encoding of sorted doc IDs"
      ],
      answerIndex: 1,
      explanation: "Posting lists store deltas between consecutive doc IDs (e.g., [100, 105, 110] becomes [100, 5, 5]). These smaller values are then compressed with variable-byte encoding or Frame of Reference (FOR) bit-packing in blocks of 128. This achieves 4-10x size reduction."
    }
  ],

  flashcards: [
    { front: "What is an inverted index?", back: "A data structure mapping terms to the list of documents (and positions) where they appear. The core structure behind full-text search engines. Opposite of a forward index (doc -> terms)." },
    { front: "What are the three stages of an Elasticsearch analyzer?", back: "1. Character filters (operate on raw character stream, e.g., html_strip). 2. Tokenizer (splits into tokens, e.g., standard, whitespace). 3. Token filters (transform tokens, e.g., lowercase, stemmer, stop)." },
    { front: "What is BM25's k1 parameter?", back: "Controls term frequency saturation. Default 1.2. At k1=0, only term presence matters (binary). As k1 increases, repeated term occurrences contribute more. At k1=infinity, no saturation (raw TF)." },
    { front: "What is BM25's b parameter?", back: "Controls document length normalization. Default 0.75. At b=0, document length is ignored. At b=1, full normalization (short documents boosted relative to long ones)." },
    { front: "What is a posting list?", back: "An ordered list of document IDs (plus optional frequencies, positions, and payloads) for a single term in the inverted index. Compressed using delta encoding + variable-byte/FOR bit-packing." },
    { front: "What is a Finite State Transducer (FST)?", back: "A compact data structure for the term dictionary that shares both prefixes and suffixes. Uses 5-10 bytes per term. Supports prefix, fuzzy, and range queries. Loaded into memory at segment open." },
    { front: "What is the difference between refresh and flush in Elasticsearch?", back: "Refresh: flushes in-memory buffer to a new Lucene segment in filesystem cache (makes docs searchable, default 1s). Flush: fsync's segments to disk and clears the translog (durability, less frequent)." },
    { front: "What is IDF and why does it matter?", back: "Inverse Document Frequency: idf(t) = log(N/df(t)). Down-weights common terms that appear in many documents. A term in every document has IDF near zero. Rare terms have high IDF and contribute more to relevance." },
    { front: "What is the edge_ngram token filter used for?", back: "Generates prefix tokens for autocomplete/search-as-you-type. 'search' with min_gram=2 produces ['se','sea','sear','searc','search']. Use edge_ngram at index time with standard analyzer at query time." },
    { front: "What is delta encoding in posting lists?", back: "Instead of storing absolute doc IDs [100, 105, 110, 200], store the differences [100, 5, 5, 90]. Produces smaller numbers that compress better with variable-byte or bit-packing encoding." }
  ],

  revisionNotes: [
    "Inverted index = term -> [doc IDs]. Forward index = doc -> [terms]. Inverted is efficient for search.",
    "Analyzer pipeline: character filters -> tokenizer -> token filters. Order matters.",
    "TF-IDF: tf(t,d) * idf(t). Weakness: no term saturation, no built-in length normalization.",
    "BM25: default since ES 5.0. k1=1.2 (saturation), b=0.75 (length norm). Probabilistic model.",
    "Posting lists: delta-encoded doc IDs + VByte or FOR compression. Skip lists for fast intersection.",
    "Lucene term dictionary: stored as FST (Finite State Transducer). Shares prefixes and suffixes. In-memory.",
    "Segment lifecycle: buffer -> refresh (searchable) -> flush (durable) -> merge (consolidate).",
    "Refresh interval default 1s = near-real-time search. Frequent refreshes = many small segments = slower search.",
    "Positional index stores term positions per document. Required for phrase queries and proximity queries. 2-4x larger.",
    "Index-time vs query-time analysis must be compatible. Use _analyze API to debug token mismatches."
  ],

  cheatSheet: [
    "Inverted index: term -> sorted list of (docID, tf, positions)",
    "Analyzer = char_filters + tokenizer + token_filters",
    "Standard analyzer: Unicode tokenization + lowercase. No stemming, no stop words.",
    "BM25 formula: sum of idf(qi) * (tf * (k1+1)) / (tf + k1 * (1 - b + b * dl/avgdl))",
    "k1 default 1.2 (term saturation), b default 0.75 (length normalization)",
    "Posting list compression: delta encoding + VByte or FOR bit-packing in 128-doc blocks",
    "FST: Finite State Transducer for term dictionary. ~5-10 bytes per term. In-memory.",
    "Refresh (1s default): buffer -> segment in filesystem cache. Makes docs searchable.",
    "Flush: fsync segments to disk + clear translog. Durability.",
    "Merge: combine small segments into larger ones. Reclaims deleted doc space.",
    "edge_ngram at index time + standard at query time = autocomplete",
    "_analyze API: test what tokens an analyzer produces from given text"
  ],

  resources: [
    { label: "Elasticsearch: The Definitive Guide - Inverted Index chapter", kind: "book", note: "Comprehensive explanation of how Elasticsearch builds and queries inverted indexes" },
    { label: "Introduction to Information Retrieval (Manning, Raghavan, Schutze)", kind: "book", note: "The standard academic textbook covering inverted indexes, TF-IDF, and scoring models" },
    { label: "Lucene in Action (McCandless, Hatcher, Gospodnetik)", kind: "book", note: "Deep dive into Lucene internals including segment architecture and posting list encoding" },
    { label: "BM25 The Next Generation of Lucene Relevance (Elasticsearch blog)", kind: "article", note: "Explains why Elasticsearch switched from TF-IDF to BM25 and how to tune parameters" },
    { label: "Elasticsearch Analysis documentation", kind: "docs", note: "Official reference for all built-in analyzers, tokenizers, and token filters" },
    { label: "Mike McCandless - Lucene Codec Internals (presentations)", kind: "video", note: "Deep technical talks on how Lucene encodes posting lists, doc values, and term dictionaries" }
  ],

  glossary: [
    { term: "Inverted Index", definition: "A data structure mapping terms to the documents (and positions) where they appear, enabling efficient full-text search." },
    { term: "Posting List", definition: "An ordered list of document IDs, term frequencies, and optionally positions for a single term in the inverted index." },
    { term: "Analyzer", definition: "A pipeline of character filters, a tokenizer, and token filters that converts raw text into terms for indexing or querying." },
    { term: "TF-IDF", definition: "Term Frequency-Inverse Document Frequency. A scoring model that weights terms by how frequent they are in a document relative to how rare they are across the corpus." },
    { term: "BM25", definition: "Best Matching 25. A probabilistic scoring function with term frequency saturation (k1) and document length normalization (b). Default in Elasticsearch since v5.0." },
    { term: "Finite State Transducer (FST)", definition: "A compact automaton used by Lucene to store the term dictionary in memory, sharing both prefixes and suffixes for minimal memory footprint." },
    { term: "Segment", definition: "An immutable Lucene index unit containing its own inverted index, doc values, and stored fields. New documents create new segments; old segments are merged." },
    { term: "Token Filter", definition: "A component that transforms tokens produced by the tokenizer, e.g., lowercase, stemmer, stop word removal, synonym expansion." },
    { term: "Delta Encoding", definition: "Compression technique storing differences between consecutive values instead of absolute values, producing smaller numbers that pack more efficiently." },
    { term: "Refresh", definition: "The operation that flushes the in-memory indexing buffer into a new searchable Lucene segment. Default interval is 1 second." }
  ]
};
