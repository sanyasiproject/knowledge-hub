import type { TopicContent } from "../types";

export const designSearchEngine: TopicContent = {
  quickSummary: [
    "A web-scale search engine has four major subsystems: a crawler that discovers and fetches billions of pages, an indexer that builds inverted indices mapping terms to document IDs, a ranking layer that scores results using signals like TF-IDF, PageRank, and user engagement, and a query-processing frontend that parses queries, retrieves candidates, and returns ranked results in under 200ms.",
    "The inverted index is the core data structure: for every term in the corpus, it stores a sorted postings list of (docID, term-frequency, position) tuples. At Google scale, the index is sharded across thousands of machines by document ID (doc-partitioned) or by term (term-partitioned), with doc-partitioned being the dominant approach because it allows each shard to score independently.",
    "PageRank models the web as a directed graph and computes a stationary probability distribution over pages by simulating a random surfer. It requires iterative computation over the entire link graph (billions of edges), typically using MapReduce or Pregel-style graph processing, and converges in 50-100 iterations.",
    "Query processing involves tokenization, stemming, spell correction, query expansion, and synonym matching before the query even hits the index. Autocomplete is served by a separate trie or prefix index built from query logs, returning suggestions in under 50ms.",
    "Scaling to billions of documents requires aggressive caching (result cache, posting-list cache, rendered-snippet cache), tiered indexing (hot tier for popular pages, cold tier for the long tail), and geographic distribution of serving clusters to minimize user-perceived latency.",
  ],
  detailed: [
    "## Web Crawling at Scale\nThe crawler is a distributed system that starts from seed URLs, fetches pages, extracts links, and adds new URLs to the frontier queue. A politeness policy (robots.txt compliance, per-host rate limiting to 1 request per second) prevents overloading target servers. URL deduplication uses a Bloom filter or a consistent-hash-based distributed set to avoid re-crawling the same page. Freshness is maintained by re-crawling popular or frequently-changing pages more often (adaptive crawl scheduling). At Google's scale, the crawler processes roughly 50 billion pages, with the frontier queue itself requiring distributed storage. DNS resolution is a bottleneck at this scale, so crawlers maintain a local DNS cache with TTL-aware refresh. The fetched HTML is stored in a distributed file system (like GFS/Colossus) for offline indexing.",

    "## Inverted Index Construction\nThe indexer processes raw HTML by stripping tags, tokenizing text, applying stemming (Porter stemmer) and stop-word removal, and then building the inverted index. For each term, a postings list stores tuples of (docID, term-frequency, field-weights, positions). Positions enable phrase queries and proximity scoring. The index is built offline using MapReduce: the map phase emits (term, docID, tf, positions) pairs, and the reduce phase merges them into sorted postings lists. Index compression is critical; techniques like variable-byte encoding, PForDelta, and Elias-Fano encoding reduce the index size by 4-10x while still allowing fast sequential and skip-based access. The final index is sharded by document ID range across thousands of machines, with each shard holding a complete inverted index for its document subset.",

    "## Ranking: From TF-IDF to Learning-to-Rank\nTF-IDF (Term Frequency-Inverse Document Frequency) is the foundational relevance signal: it boosts terms that appear frequently in a document but rarely across the corpus. BM25 improves on raw TF-IDF by adding document-length normalization and a saturation function so that additional term occurrences have diminishing returns. PageRank provides a query-independent quality signal by analyzing the link graph: pages linked by many high-quality pages receive a higher rank. Modern search engines combine hundreds of signals (BM25, PageRank, click-through rate, freshness, domain authority, spam score) using a machine-learned ranking model (LambdaMART, neural re-rankers). Retrieval happens in two stages: a fast first stage retrieves the top-k candidates (thousands) using the inverted index, and a slower second stage re-ranks the top candidates using expensive features and ML models. This two-stage architecture is essential because evaluating an ML model on every document in the corpus would be computationally infeasible.",

    "## Query Processing Pipeline\nWhen a user types a query, the frontend first performs spell correction (using edit-distance models trained on query logs and a language model), tokenization, and query expansion (adding synonyms and related terms). The processed query is broadcast to all index shards in parallel; each shard scores its local documents and returns its top-k results. A root aggregator merges the per-shard results, re-ranks if needed, generates snippets by extracting the best matching passage from each document, and returns the final SERP. The entire pipeline must complete in under 200ms for a good user experience. Caching plays a huge role: the top 10-20% of queries account for 50-60% of traffic, so a result cache with LRU eviction dramatically reduces index load. Snippet generation uses the stored document text and highlights query terms in context.",

    "## Autocomplete and Spell Correction\nAutocomplete suggestions are served from a separate system that indexes popular queries from query logs. A trie (prefix tree) stores queries weighted by frequency, and a prefix lookup returns the top-k completions by aggregate popularity. For personalization, a secondary trie stores per-user query history. The trie is updated in near-real-time as new queries arrive. Spell correction uses a combination of edit-distance (Levenshtein), phonetic similarity (Soundex/Metaphone), and a noisy-channel model that combines a language model P(correction) with an error model P(typo|correction). At query time, candidate corrections are generated within edit distance 2 of each query term, scored, and the top suggestion is shown as 'Did you mean...' or applied automatically if confidence is high. Both autocomplete and spell correction must respond in under 50ms to feel instantaneous.",
  ],
  deepDive: [
    "Inverted index compression is a deep topic with real performance implications. Variable-byte encoding represents small gaps (the delta between consecutive docIDs in a postings list) in fewer bytes, but wastes bits on alignment. PForDelta packs blocks of 128 gaps using a base bit-width chosen to fit most values, with exceptions stored separately. Elias-Fano encoding is theoretically near-optimal for monotone sequences and supports O(1) random access, making it ideal for skip pointers. In practice, modern engines use a hybrid: PForDelta for dense postings lists (common terms) and Elias-Fano for sparse ones (rare terms). The choice of compression scheme affects not just space but query latency, because decompression speed determines how fast you can intersect postings lists for multi-term queries. Block-max WAND (Weak AND) is an optimization that skips entire blocks of postings that cannot possibly score high enough to enter the top-k, reducing the number of documents scored by 5-10x without affecting result quality.",

    "PageRank computation at web scale is a massive distributed systems problem. The link graph has billions of nodes and trillions of edges, requiring partitioned storage and message-passing computation. The basic algorithm initializes all pages with equal rank (1/N), then iteratively updates each page's rank as the sum of rank/out-degree contributions from all pages linking to it, with a damping factor (typically 0.85) that models the probability of the random surfer continuing to follow links versus jumping to a random page. Convergence typically requires 50-100 iterations, each of which scans the entire graph. Dead ends (pages with no outlinks) and spider traps (cycles that accumulate rank) are handled by the damping factor and by distributing dead-end rank evenly. Topic-Sensitive PageRank computes multiple PageRank vectors biased toward different topic categories, allowing the ranking to be personalized based on the query's topic. The computation uses frameworks like Pregel or GraphX that partition the graph across machines and exchange rank updates in supersteps.",

    "Fault tolerance and availability in a search serving system require careful design. Each index shard is replicated across multiple machines (typically 3 replicas) in different failure domains. If a replica fails, the query is routed to a surviving replica with minimal latency impact. The root aggregator uses a scatter-gather pattern with a deadline: if a shard does not respond within 50ms, the aggregator returns results from the shards that did respond, accepting slightly degraded recall. This is a deliberate trade-off of completeness for latency. Index updates (adding new or refreshed pages) use a dual-buffer scheme: queries are served from the active index while a new index is built offline. Once the new index is ready, an atomic swap makes it live. For real-time indexing of breaking news, a small in-memory real-time index is merged with the main index results at query time. Geographic replication across data centers ensures that users are served from the nearest cluster, reducing round-trip latency to under 20ms.",

    "The economics of search at scale are worth understanding for system design interviews. Serving a single query touches hundreds of machines (one per shard, plus aggregators, spell-checkers, ad servers, snippet generators). At 100,000 QPS, this means tens of millions of machine-operations per second. The cost of serving is dominated by CPU (for scoring and decompression) and memory (for caching posting lists and results). The index itself is tens of petabytes compressed. Keeping this infrastructure running costs hundreds of millions of dollars annually, which is why search is primarily an advertising-funded business. Design decisions are driven by cost-efficiency: tiered indexing puts the most-accessed pages in memory and relegates the long tail to SSD or disk. Approximate retrieval (using hashing or quantized embeddings) trades a small amount of recall for massive speedups. These trade-offs between cost, latency, and quality are central to the system design discussion.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Inverted index construction from a document corpus",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <algorithm>
#include <cmath>

struct Posting {
    int docId;
    int termFreq;
    std::vector<int> positions; // positions of term in document
};

class InvertedIndex {
    // term -> list of postings (sorted by docId)
    std::unordered_map<std::string, std::vector<Posting>> index_;
    int totalDocs_ = 0;

public:
    void addDocument(int docId, const std::string& text) {
        totalDocs_++;
        std::unordered_map<std::string, std::vector<int>> termPositions;
        std::istringstream stream(text);
        std::string token;
        int pos = 0;

        while (stream >> token) {
            // Lowercase normalization (simplified stemming)
            std::transform(token.begin(), token.end(), token.begin(), ::tolower);
            termPositions[token].push_back(pos++);
        }

        for (auto& [term, positions] : termPositions) {
            index_[term].push_back({
                docId,
                static_cast<int>(positions.size()),
                std::move(positions)
            });
        }
    }

    // Retrieve postings list for a term
    const std::vector<Posting>& getPostings(const std::string& term) const {
        static const std::vector<Posting> empty;
        auto it = index_.find(term);
        return it != index_.end() ? it->second : empty;
    }

    // Boolean AND query: intersect postings lists
    std::vector<int> queryAND(const std::vector<std::string>& terms) const {
        if (terms.empty()) return {};

        // Start with the shortest postings list (optimization)
        std::vector<std::pair<std::string, int>> termsByFreq;
        for (auto& t : terms) {
            termsByFreq.push_back({t, (int)getPostings(t).size()});
        }
        std::sort(termsByFreq.begin(), termsByFreq.end(),
                  [](auto& a, auto& b) { return a.second < b.second; });

        // Intersect using two-pointer merge
        std::vector<int> result;
        auto& first = getPostings(termsByFreq[0].first);
        for (auto& p : first) result.push_back(p.docId);

        for (size_t i = 1; i < termsByFreq.size(); i++) {
            auto& postings = getPostings(termsByFreq[i].first);
            std::vector<int> docIds;
            for (auto& p : postings) docIds.push_back(p.docId);

            std::vector<int> intersection;
            std::set_intersection(result.begin(), result.end(),
                                  docIds.begin(), docIds.end(),
                                  std::back_inserter(intersection));
            result = std::move(intersection);
        }
        return result;
    }

    int getTotalDocs() const { return totalDocs_; }
    int getDocFreq(const std::string& term) const {
        return (int)getPostings(term).size();
    }
};`,
    },
    {
      language: "cpp",
      caption: "TF-IDF and BM25 scoring implementation",
      source: `#include <cmath>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>

struct ScoredDoc {
    int docId;
    double score;
    bool operator>(const ScoredDoc& o) const { return score > o.score; }
};

class Ranker {
    // BM25 parameters
    static constexpr double k1 = 1.2;   // term frequency saturation
    static constexpr double b  = 0.75;  // document length normalization

public:
    // Classic TF-IDF: tf * log(N / df)
    static double tfidf(int termFreq, int docFreq, int totalDocs) {
        double tf  = 1.0 + std::log(termFreq);        // log-scaled TF
        double idf = std::log((double)totalDocs / docFreq); // inverse doc freq
        return tf * idf;
    }

    // BM25: improved TF-IDF with length normalization and saturation
    // docLen = number of terms in document
    // avgDocLen = average document length across corpus
    static double bm25(int termFreq, int docFreq, int totalDocs,
                       int docLen, double avgDocLen) {
        double idf = std::log((totalDocs - docFreq + 0.5) / (docFreq + 0.5) + 1.0);
        double tfNorm = (termFreq * (k1 + 1.0)) /
                        (termFreq + k1 * (1.0 - b + b * docLen / avgDocLen));
        return idf * tfNorm;
    }

    // Score all matching documents for a multi-term query
    // Returns top-k results sorted by score
    static std::vector<ScoredDoc> rankDocuments(
        const std::vector<std::string>& queryTerms,
        const InvertedIndex& index,
        const std::unordered_map<int, int>& docLengths,
        double avgDocLen,
        int topK)
    {
        std::unordered_map<int, double> scores;
        int N = index.getTotalDocs();

        for (auto& term : queryTerms) {
            auto& postings = index.getPostings(term);
            int df = postings.size();
            if (df == 0) continue;

            for (auto& posting : postings) {
                int docLen = docLengths.count(posting.docId)
                           ? docLengths.at(posting.docId) : (int)avgDocLen;
                scores[posting.docId] +=
                    bm25(posting.termFreq, df, N, docLen, avgDocLen);
            }
        }

        // Extract top-k using partial sort
        std::vector<ScoredDoc> results;
        results.reserve(scores.size());
        for (auto& [docId, score] : scores) {
            results.push_back({docId, score});
        }

        int k = std::min(topK, (int)results.size());
        std::partial_sort(results.begin(), results.begin() + k, results.end(),
                          [](auto& a, auto& b) { return a.score > b.score; });
        results.resize(k);
        return results;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Trie-based autocomplete with frequency-weighted suggestions",
      source: `#include <string>
#include <vector>
#include <queue>
#include <array>
#include <memory>
#include <algorithm>

struct Suggestion {
    std::string query;
    int frequency;
    bool operator<(const Suggestion& o) const { return frequency < o.frequency; }
};

class AutocompleteTrie {
    struct TrieNode {
        std::array<std::unique_ptr<TrieNode>, 128> children{}; // ASCII range
        bool isEnd = false;
        int frequency = 0;
        int maxChildFreq = 0;  // max frequency in this subtree (for pruning)
    };

    std::unique_ptr<TrieNode> root_ = std::make_unique<TrieNode>();

public:
    // Insert a query with its search frequency
    void insert(const std::string& query, int freq) {
        TrieNode* node = root_.get();
        for (char c : query) {
            int idx = static_cast<unsigned char>(c);
            if (!node->children[idx]) {
                node->children[idx] = std::make_unique<TrieNode>();
            }
            node->maxChildFreq = std::max(node->maxChildFreq, freq);
            node = node->children[idx].get();
        }
        node->isEnd = true;
        node->frequency = freq;
        node->maxChildFreq = std::max(node->maxChildFreq, freq);
    }

    // Return top-k suggestions for a given prefix
    std::vector<Suggestion> suggest(const std::string& prefix, int k = 5) const {
        // Navigate to the prefix node
        const TrieNode* node = root_.get();
        for (char c : prefix) {
            int idx = static_cast<unsigned char>(c);
            if (!node->children[idx]) return {};  // no completions
            node = node->children[idx].get();
        }

        // DFS to collect all completions, using min-heap for top-k
        std::priority_queue<Suggestion> maxHeap;
        std::string current = prefix;
        collectSuggestions(node, current, maxHeap);

        // Extract top-k sorted by frequency (descending)
        std::vector<Suggestion> results;
        while (!maxHeap.empty() && (int)results.size() < k) {
            results.push_back(maxHeap.top());
            maxHeap.pop();
        }
        return results;
    }

private:
    void collectSuggestions(const TrieNode* node, std::string& current,
                           std::priority_queue<Suggestion>& heap) const {
        if (!node) return;
        if (node->isEnd) {
            heap.push({current, node->frequency});
        }
        for (int i = 0; i < 128; i++) {
            if (node->children[i]) {
                current.push_back(static_cast<char>(i));
                collectSuggestions(node->children[i].get(), current, heap);
                current.pop_back();
            }
        }
    }
};

// Usage example:
// AutocompleteTrie trie;
// trie.insert("how to cook rice", 50000);
// trie.insert("how to tie a tie", 30000);
// trie.insert("how to lose weight", 80000);
// auto suggestions = trie.suggest("how to", 5);
// Returns: [{how to lose weight, 80000}, {how to cook rice, 50000}, ...]`,
    },
  ],
  diagrams: [
    {
      title: "Search Engine High-Level Architecture",
      kind: "architecture",
      caption:
        "End-to-end flow from web crawling through indexing and serving, showing the major subsystems and data stores.",
      mermaid: `graph LR
    Crawler["Web Crawler"] --> Store["Document Store"]
    Store --> Indexer["Indexer - MapReduce"]
    Indexer --> InvIndex["Inverted Index Shards"]
    Indexer --> LinkGraph["Link Graph"]
    LinkGraph --> PR["PageRank Compute"]
    PR --> RankDB["Rank Store"]
    User["User Query"] --> FE["Frontend / API"]
    FE --> QP["Query Processor"]
    QP --> Scatter["Scatter to Shards"]
    Scatter --> InvIndex
    InvIndex --> Gather["Gather + Merge"]
    RankDB --> Gather
    Gather --> Rerank["Re-Ranker ML Model"]
    Rerank --> Snippet["Snippet Generator"]
    Snippet --> FE`,
    },
    {
      title: "Query Processing Sequence",
      kind: "sequence",
      caption:
        "Detailed sequence of a user query from input to rendered results, including spell correction, shard fan-out, and snippet generation.",
      mermaid: `sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant SC as Spell Checker
    participant QP as Query Processor
    participant S1 as Index Shard 1
    participant S2 as Index Shard N
    participant RR as Re-Ranker
    participant SG as Snippet Generator

    U->>FE: Submit query
    FE->>SC: Check spelling
    SC-->>FE: Corrected query
    FE->>QP: Tokenize and expand query
    QP->>S1: Score local docs
    QP->>S2: Score local docs
    S1-->>QP: Top-k local results
    S2-->>QP: Top-k local results
    QP->>RR: Merge and re-rank
    RR-->>QP: Final ranked list
    QP->>SG: Generate snippets
    SG-->>QP: Snippets with highlights
    QP-->>FE: SERP response
    FE-->>U: Render results in 200ms`,
    },
    {
      title: "Inverted Index Lookup Flow",
      kind: "flow",
      caption:
        "How a multi-term query is resolved using the inverted index with postings list intersection and scoring.",
      mermaid: `flowchart TD
    Q["Input Query: 'distributed systems'"] --> T["Tokenize: 'distributed', 'systems'"]
    T --> L1["Lookup postings for 'distributed'"]
    T --> L2["Lookup postings for 'systems'"]
    L1 --> P1["Postings: doc3, doc7, doc15, doc22, doc89"]
    L2 --> P2["Postings: doc2, doc7, doc22, doc45, doc89"]
    P1 --> INT["Intersect postings lists using two-pointer merge"]
    P2 --> INT
    INT --> MATCH["Matching docs: doc7, doc22, doc89"]
    MATCH --> SCORE["Score each doc using BM25 + PageRank"]
    SCORE --> SORT["Sort by combined score"]
    SORT --> TOPK["Return top-k results"]`,
    },
    {
      title: "Crawler State Machine",
      kind: "flow",
      caption: "Lifecycle of a URL through the crawl pipeline, from discovery to indexing.",
      mermaid: `flowchart TD
    SEED["Seed URLs"] --> FRONTIER["URL Frontier Queue"]
    FRONTIER --> DEDUP{"Seen before? Bloom Filter"}
    DEDUP -->|Yes| SKIP["Skip URL"]
    DEDUP -->|No| ROBOTS{"Check robots.txt"}
    ROBOTS -->|Blocked| SKIP
    ROBOTS -->|Allowed| RATE{"Rate Limit Check"}
    RATE -->|Wait| RATE
    RATE -->|OK| FETCH["Fetch Page via HTTP"]
    FETCH --> PARSE["Parse HTML"]
    PARSE --> EXTRACT["Extract Links"]
    EXTRACT --> FRONTIER
    PARSE --> STORE["Store in Document Store"]
    STORE --> INDEX["Send to Indexer"]`,
    },
  ],
  animations: [
    {
      title: "Query to results",
      steps: [
        {
          label: "Index built offline",
          detail: "Documents are crawled, analysed into terms, and written to an inverted index: term → posting list.",
        },
        {
          label: "Query analysed",
          detail: "Same analyser as index time — tokenised, lowercased, stemmed. A mismatch here silently breaks matching.",
        },
        {
          label: "Posting lists fetched",
          detail: "One per term; intersected for AND semantics.",
        },
        {
          label: "Scored",
          detail: "BM25 ranks by term frequency, inverse document frequency, and length normalisation.",
        },
        {
          label: "Re-ranked",
          detail: "A second-stage model reorders the top N using features too expensive to compute over everything.",
        },
        {
          label: "Served",
          detail: "Top 10 returned; deep pagination is deliberately expensive and usually capped.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "TF-IDF / BM25",
      "PageRank",
      "Learning-to-Rank",
      "Neural Re-Ranker",
    ],
    rows: [
      [
        "Signal type",
        "Query-dependent textual relevance",
        "Query-independent link authority",
        "Combines hundreds of features",
        "Learned semantic similarity",
      ],
      [
        "Computation cost",
        "Low - computed at query time from index",
        "High - offline iterative graph computation",
        "Medium - feature extraction + model inference",
        "Very high - transformer inference per doc pair",
      ],
      [
        "Latency impact",
        "Minimal - integer arithmetic on postings",
        "None at query time - precomputed score",
        "Moderate - 5-20ms for top-1000 candidates",
        "High - 50-100ms so only applied to top-50",
      ],
      [
        "Handles synonyms",
        "No - exact term matching only",
        "No - link structure only",
        "Partially - if synonym features included",
        "Yes - embeddings capture semantic similarity",
      ],
      [
        "Spam resistance",
        "Low - vulnerable to keyword stuffing",
        "Medium - link farms can manipulate",
        "High - spam features trained explicitly",
        "Medium - can be fooled by adversarial text",
      ],
      [
        "Update frequency",
        "Real-time as index updates",
        "Weekly to monthly batch recomputation",
        "Model retrained weekly to monthly",
        "Model retrained weekly, embeddings cached",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How would you design the crawler to handle billions of pages while being polite to web servers?",
      a: "The crawler uses a distributed architecture with hundreds of crawler workers pulling URLs from a shared frontier queue (e.g., Kafka or a priority queue in Redis). Politeness is enforced by partitioning the frontier by domain and ensuring each domain has at most one outstanding request, with a minimum delay of 1 second between requests to the same host. A Bloom filter (or a distributed set in a key-value store) deduplicates URLs to avoid redundant fetches. The frontier is prioritized by page importance (estimated via inlink count or historical PageRank) and freshness (pages that change frequently are re-crawled sooner). DNS resolution is batched and cached locally because at billions of pages, DNS becomes a bottleneck. The system respects robots.txt by fetching and caching it per domain before crawling any page. If a host returns HTTP 429 or 503, the crawler backs off exponentially for that domain.",
      followUps: [
        "How do you handle URL normalization to avoid crawling the same content at different URLs?",
        "How would you detect and handle crawler traps like infinite calendar pages?",
        "How do you decide the re-crawl frequency for each page?",
      ],
    },
    {
      q: "Walk me through how you would build the inverted index for a corpus of 10 billion web pages.",
      a: "The index is built offline using a MapReduce-style pipeline. In the map phase, each document is tokenized, stemmed, and for each term we emit (term, docID, term-frequency, positions). The shuffle phase groups all emissions by term. In the reduce phase, we sort postings by docID within each term and apply delta encoding (storing gaps between consecutive docIDs instead of absolute IDs), then compress using PForDelta or variable-byte encoding. The compressed postings lists are written to SSTable-like files. For 10 billion documents with an average of 500 unique terms each, the raw index has roughly 5 trillion postings entries. With compression, the index fits in approximately 20-40TB. The index is sharded by document ID range across several thousand machines, with each shard holding roughly 5-10 million documents. Each shard machine keeps hot postings lists in memory and serves queries independently. Building the full index from scratch takes several days of MapReduce computation.",
      followUps: [
        "Why doc-partitioned sharding over term-partitioned sharding?",
        "How do you handle index updates for newly crawled pages without rebuilding the entire index?",
        "What compression schemes would you use and why?",
      ],
    },
    {
      q: "How does query fan-out work, and how do you handle slow shards?",
      a: "When a query arrives, the query processor broadcasts it to all index shards in parallel (scatter phase). Each shard independently retrieves and scores its local top-k documents, then returns them to a root aggregator. The aggregator merges the per-shard results into a global top-k (gather phase). To handle slow shards, the aggregator enforces a strict deadline (e.g., 50ms). If a shard does not respond in time, the aggregator proceeds with results from the responding shards. This means some queries may have slightly reduced recall, but latency stays bounded. Each shard is replicated 3x, and the query router picks the least-loaded replica for each shard. If a shard is consistently slow, it is taken out of rotation. The fan-out degree is large (thousands of shards), so tail latency is a real concern. Techniques like hedged requests (sending the same request to two replicas and taking the first response) reduce p99 latency at the cost of additional load. Result caching at the aggregator level absorbs repeated queries, which account for a large fraction of traffic.",
      followUps: [
        "How would you implement hedged requests without doubling your serving cost?",
        "What happens if an entire data center goes down during a query?",
      ],
    },
    {
      q: "Explain how you would implement autocomplete with sub-50ms latency.",
      a: "Autocomplete is served from a trie (prefix tree) built from historical query logs. Each node in the trie represents a character, and terminal nodes store the query string and its frequency (search count). When the user types a prefix, we traverse to the corresponding trie node and retrieve the top-k most frequent completions in that subtree. To avoid a full DFS on each keystroke, we precompute and cache the top-k completions at every node (or at nodes above a certain depth). The trie is small enough to fit entirely in memory on each serving machine (a few GB for hundreds of millions of unique queries). For personalization, a per-user trie of recent queries is layered on top of the global trie. The trie is updated in near-real-time: new queries are batched every few minutes and merged into the trie. The system must handle the bursty nature of trending queries (e.g., breaking news) by also incorporating a short-term frequency window. Serving latency is dominated by network round-trip, not computation, since a trie lookup is O(prefix length).",
      followUps: [
        "How do you handle offensive or sensitive autocomplete suggestions?",
        "How would you extend autocomplete to support fuzzy matching for typos?",
      ],
    },
    {
      q: "How would you handle real-time indexing for breaking news while maintaining the batch index?",
      a: "The architecture uses a dual-index approach: a large static index rebuilt periodically (daily or weekly) via batch MapReduce, and a small real-time index that ingests newly crawled pages within minutes. The real-time index is an in-memory inverted index (similar to Lucene's NRT reader) that holds the most recent documents. At query time, results from both indices are merged: the static index provides coverage of the full web, while the real-time index ensures freshness. The real-time index is much smaller (millions of docs vs. billions), so it can be rebuilt or compacted frequently. Periodically, the real-time index is merged into the static index during the next batch rebuild. This approach is used by systems like Elasticsearch and Twitter's Earlybird. The challenge is ensuring consistency: a document should not appear in both indices simultaneously, which is handled by maintaining a set of docIDs in the real-time index and excluding them from static index results. The real-time index is replicated for availability, and writes go through a WAL for durability.",
      followUps: [
        "How do you decide which pages qualify for real-time indexing vs. waiting for the batch cycle?",
        "What happens to ranking quality when a page has no PageRank because it was just discovered?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In a doc-partitioned search index, what happens when a query is processed?",
      options: [
        "The query is sent to only the shard containing the most relevant term",
        "The query is broadcast to all shards, each scores locally, results are merged",
        "A single machine scores all documents sequentially",
        "The query is first routed to the term-shard, then to the doc-shard",
      ],
      answerIndex: 1,
      explanation:
        "In doc-partitioned indexing, each shard holds a complete inverted index for its subset of documents. Every query must be broadcast to all shards because any shard might contain relevant documents. Each shard independently retrieves and scores its top-k results, and a root aggregator merges the per-shard results into a global ranking.",
    },
    {
      q: "What is the primary advantage of BM25 over raw TF-IDF?",
      options: [
        "BM25 uses neural embeddings for semantic matching",
        "BM25 incorporates document length normalization and term frequency saturation",
        "BM25 eliminates the need for an inverted index",
        "BM25 computes PageRank inline with relevance scoring",
      ],
      answerIndex: 1,
      explanation:
        "BM25 improves on raw TF-IDF in two key ways: it applies a saturation function so that additional occurrences of a term have diminishing returns (preventing long documents from dominating), and it normalizes by document length so that a term appearing 5 times in a 100-word document is scored higher than 5 times in a 10,000-word document. These properties make BM25 more robust for real-world retrieval.",
    },
    {
      q: "Why do search engines use a two-stage retrieval architecture (candidate retrieval + re-ranking)?",
      options: [
        "Because the inverted index cannot handle Boolean queries",
        "Because running an expensive ML model on every document in the corpus is computationally infeasible",
        "Because PageRank can only be computed in the second stage",
        "Because users only care about the first page of results anyway",
      ],
      answerIndex: 1,
      explanation:
        "The corpus contains billions of documents, and evaluating a complex ML model (which might take milliseconds per document) on every one would take hours. Instead, the first stage uses the inverted index with BM25 to cheaply retrieve the top few thousand candidates, and the second stage applies expensive features (neural re-ranking, click models, freshness signals) only to this small candidate set. This keeps total latency under 200ms.",
    },
    {
      q: "What does the damping factor in PageRank represent?",
      options: [
        "The probability that a random surfer clicks on a search ad",
        "The probability that a random surfer continues following links rather than jumping to a random page",
        "The rate at which old pages lose their ranking over time",
        "The fraction of pages that are spam",
      ],
      answerIndex: 1,
      explanation:
        "The damping factor (typically 0.85) models the random surfer: with probability 0.85, the surfer follows a link on the current page, and with probability 0.15, they jump to a uniformly random page. This prevents rank from accumulating in spider traps (cycles) and ensures that every page has a non-zero rank. It also handles dead ends (pages with no outlinks) by redistributing their rank.",
    },
  ],
  flashcards: [
    {
      front: "What is an inverted index?",
      back: "A data structure that maps each unique term to a sorted list of document IDs (postings list) where that term appears, along with metadata like term frequency and positions. It enables sub-second retrieval over billions of documents by turning a full-text search into a set intersection problem.",
    },
    {
      front: "What is TF-IDF and what does each component measure?",
      back: "TF (Term Frequency) measures how often a term appears in a document (more occurrences = more relevant). IDF (Inverse Document Frequency) measures how rare a term is across the entire corpus (rarer terms are more discriminative). The product TF * IDF gives higher scores to terms that are frequent in the target document but rare overall.",
    },
    {
      front: "How does PageRank work at a high level?",
      back: "PageRank models the web as a directed graph and simulates a random surfer who follows links with probability 0.85 and jumps to a random page with probability 0.15. After iterative computation (50-100 iterations), each page converges to a stationary probability representing its authority. Pages linked by many high-authority pages receive higher rank.",
    },
    {
      front: "What is doc-partitioned vs. term-partitioned index sharding?",
      back: "Doc-partitioned: each shard holds all terms for a subset of documents. Every query goes to all shards. Term-partitioned: each shard holds all documents for a subset of terms. A query only goes to shards owning its terms. Doc-partitioned is preferred because each shard can score independently, and adding documents only affects one shard.",
    },
    {
      front: "What is BM25's key improvement over raw TF-IDF?",
      back: "BM25 adds term frequency saturation (additional occurrences have diminishing returns via a parameter k1) and document length normalization (via parameter b). This prevents long documents from dominating and produces more robust relevance scores. Parameters k1=1.2 and b=0.75 are standard defaults.",
    },
    {
      front: "How does the query aggregator handle slow shards?",
      back: "The aggregator sets a strict deadline (e.g., 50ms). If a shard does not respond in time, results are returned from responding shards only, trading recall for latency. Hedged requests (sending to two replicas, using the first response) reduce tail latency. Each shard is replicated 3x for fault tolerance.",
    },
    {
      front: "What is a Bloom filter and why is it used in crawling?",
      back: "A Bloom filter is a space-efficient probabilistic data structure that tests set membership with no false negatives but possible false positives. In crawling, it tracks seen URLs to avoid re-fetching. A Bloom filter for 10 billion URLs with 1% false positive rate requires about 12GB of memory, far less than storing all URL strings.",
    },
    {
      front: "What is the noisy-channel model for spell correction?",
      back: "It models a typo as: user intended query Q, which passed through a noisy channel producing the observed misspelling M. The correction maximizes P(Q|M) = P(M|Q) * P(Q), where P(M|Q) is the error model (probability of the specific typo given edit operations) and P(Q) is the language model (probability of the candidate being a real query). Candidates are generated within edit distance 1-2.",
    },
  ],
  exercises: [
    "Design a URL frontier for a distributed crawler that handles 1 billion URLs. Specify the data structure, sharding strategy, priority scheme (important pages first), and politeness enforcement. Estimate the memory and storage requirements.",
    "Implement a simplified inverted index that supports phrase queries (e.g., 'New York City' must appear as a contiguous phrase). Use term positions stored in the postings list and describe how you would extend the two-pointer intersection algorithm to check adjacency.",
    "Given a web graph with 100 million nodes, estimate the storage requirements for the adjacency list representation. Then describe how you would compute PageRank using a MapReduce framework, specifying the mapper and reducer logic and the number of iterations needed.",
    "Design the caching layer for a search engine handling 100,000 QPS. Identify what to cache (result cache, postings cache, snippet cache), estimate cache sizes, choose eviction policies, and calculate the expected hit rates based on query frequency distributions following a power law.",
    "Build a spell-correction system that combines edit distance, phonetic similarity, and a language model. Define the candidate generation step, the scoring function, and the threshold for automatically applying corrections vs. showing 'Did you mean...'. Handle multi-word queries where only one word is misspelled.",
  ],
  revisionNotes: [
    "The inverted index maps terms to sorted postings lists of (docID, TF, positions). Compression via delta encoding + PForDelta reduces size 4-10x. At 10B docs with 500 terms each, expect ~5 trillion postings entries and 20-40TB compressed index.",
    "BM25 formula: score = IDF * (tf * (k1+1)) / (tf + k1 * (1 - b + b * docLen/avgDocLen)). Default parameters: k1=1.2, b=0.75. Saturation prevents long-document bias; length normalization adjusts for document size.",
    "PageRank: PR(p) = (1-d)/N + d * sum(PR(q)/outDegree(q)) for all q linking to p. Damping factor d=0.85. Converges in 50-100 iterations. Handles dead ends and spider traps via the (1-d)/N teleportation term.",
    "Two-stage retrieval: Stage 1 uses inverted index + BM25 to retrieve top-1000 candidates cheaply. Stage 2 applies expensive ML re-ranker (LambdaMART or neural) to top candidates only. Total latency budget: 200ms.",
    "Doc-partitioned sharding: each shard has a full index for its doc subset. Queries fan out to ALL shards. Preferred over term-partitioned because shards score independently, no cross-shard communication during scoring, and rebalancing is simpler.",
    "Crawler politeness: 1 req/sec per host, respect robots.txt, exponential backoff on 429/503. URL dedup via Bloom filter (12GB for 10B URLs at 1% FP rate). Adaptive re-crawl: popular/changing pages crawled more frequently.",
    "Autocomplete: trie of historical queries weighted by frequency. Precompute top-k at each node. Fits in ~2-4GB RAM for 500M unique queries. Update in near-real-time (batch every few minutes). Latency dominated by network RTT, not computation.",
    "Spell correction: noisy-channel model maximizes P(M|Q) * P(Q). Generate candidates within edit distance 2. Score using language model from query logs. Auto-correct if confidence > threshold, else show 'Did you mean...'.",
    "Fault tolerance: 3 replicas per shard in different failure domains. Aggregator enforces 50ms deadline; proceeds without slow shards. Hedged requests to reduce p99 latency. Geographic replication for <20ms user RTT.",
    "Result caching: top 20% of queries = 60% of traffic. LRU cache at aggregator absorbs repeated queries. Posting list cache in shard memory for hot terms. Snippet cache avoids re-reading document store.",
  ],
  cheatSheet: [
    "Inverted Index: term -> sorted list of (docID, TF, positions). Core data structure. Enables sub-second lookup over billions of docs.",
    "BM25(tf, df, N, docLen, avgDocLen) = IDF * (tf*(k1+1)) / (tf + k1*(1-b+b*dl/avgdl)). k1=1.2, b=0.75.",
    "PageRank: iterative, PR(p) = 0.15/N + 0.85 * sum(PR(q)/out(q)). 50-100 iterations on full web graph.",
    "Index compression: delta-encode docIDs, then PForDelta (dense lists) or Elias-Fano (sparse lists). 4-10x compression ratio.",
    "Postings intersection: sort by shortest list first, then two-pointer merge. Skip pointers accelerate intersection of long lists.",
    "Query pipeline: spell-check -> tokenize -> stem -> expand synonyms -> fan-out to shards -> merge -> re-rank -> snippet -> return.",
    "Shard fan-out: broadcast query to all doc-partitioned shards. Each returns local top-k. Aggregator merges. Deadline: 50ms per shard.",
    "Autocomplete: trie of query logs, prefix lookup, top-k by frequency. Precompute top-k at each node. Sub-50ms latency.",
    "Caching layers: result cache (LRU at aggregator), postings cache (in-memory on shard), snippet cache. Hit rate follows power law.",
    "Scale numbers: 50B pages crawled, 20-40TB index, 100K+ QPS, <200ms end-to-end latency, thousands of index shards, 3x replication.",
  ],
  glossary: [
    {
      term: "Inverted Index",
      definition:
        "A data structure mapping each term to a sorted postings list of documents containing that term, with metadata like term frequency and positions. The fundamental data structure enabling efficient full-text search.",
    },
    {
      term: "Postings List",
      definition:
        "A sorted sequence of (docID, term-frequency, positions) tuples for a given term. Sorted by docID to enable efficient intersection (AND queries) via merge algorithms. Compressed using delta encoding and variable-length integer schemes.",
    },
    {
      term: "TF-IDF",
      definition:
        "Term Frequency - Inverse Document Frequency. A scoring function where TF measures how often a term appears in a document, and IDF measures how rare it is across the corpus. The product gives high scores to terms that are frequent in the document but rare overall.",
    },
    {
      term: "PageRank",
      definition:
        "A link-analysis algorithm that assigns a numerical weight to each web page based on the structure of incoming links. Models a random surfer who follows links with probability d (damping factor, typically 0.85) and jumps to a random page otherwise.",
    },
    {
      term: "BM25",
      definition:
        "Best Match 25, a ranking function that extends TF-IDF with term frequency saturation (parameter k1) and document length normalization (parameter b). The de facto standard for first-stage retrieval in modern search engines.",
    },
    {
      term: "Bloom Filter",
      definition:
        "A space-efficient probabilistic data structure that tests whether an element is in a set. False positives are possible but false negatives are not. Used in crawlers for URL deduplication (12GB for 10B URLs at 1% FP rate).",
    },
    {
      term: "WAND (Weak AND)",
      definition:
        "A query processing optimization that skips documents in the postings list that cannot possibly enter the top-k results, based on precomputed upper-bound scores per term. Block-Max WAND extends this to skip entire compressed blocks, reducing scoring work by 5-10x.",
    },
  ],
  followUps: [
    "How would you extend this search engine to handle image and video search?",
    "How would you implement personalized search results based on user history and location?",
    "How does advertising integration work in a search engine, and how do you ensure ads don't degrade organic result quality?",
    "How would you design a search engine for a specific vertical (e.g., e-commerce product search) vs. general web search?",
    "What changes would you make to support voice queries and conversational search?",
    "How would you detect and handle SEO spam, link farms, and adversarial content?",
  ],
  resources: [
    {
      label: "Introduction to Information Retrieval - Manning, Raghavan, Schutze",
      kind: "book",
      note: "The definitive textbook covering inverted indices, scoring, evaluation, and web search. Freely available online from Stanford.",
    },
    {
      label: "The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page, 1998)",
      kind: "paper",
      note: "The original Google paper describing PageRank, the crawler, and the index architecture. Essential reading for search engine design.",
    },
    {
      label: "Apache Lucene / Elasticsearch Documentation",
      kind: "docs",
      note: "Production-grade inverted index and search library. Study its segment-based architecture, BM25 implementation, and near-real-time indexing for practical search system design.",
    },
    {
      label: "Designing Data-Intensive Applications - Martin Kleppmann, Chapter 3",
      kind: "book",
      note: "Covers storage engines, indexing structures (B-trees, LSM-trees, SSTables), and how they relate to search index construction and serving.",
    },
    {
      label: "Google Research Blog - Search and Information Retrieval",
      kind: "article",
      note: "Ongoing publications about ranking improvements, neural search, and infrastructure evolution. Good for understanding modern search beyond classical IR.",
    },
  ],
};
