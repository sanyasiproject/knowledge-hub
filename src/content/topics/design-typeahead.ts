import type { TopicContent } from "../types";

export const designTypeahead: TopicContent = {
  quickSummary: [
    "A typeahead (autocomplete) system returns ranked suggestions as users type, requiring sub-100ms latency to feel instantaneous. The core data structure is a trie (prefix tree), where each node represents a character and paths from root to nodes represent prefixes. Suggestions are retrieved by traversing to the prefix node and collecting the top-k results.",
    "Ranking determines suggestion quality: frequency-based ranking (how often a query was searched), recency-weighted (recent searches rank higher using exponential decay), and personalized (user's own search history). Production systems combine these signals using a weighted scoring function.",
    "At scale (millions of queries per second), the trie is too large for a single machine. Partition by prefix range (a-m on shard 1, n-z on shard 2), cache aggressively (the top 20% of prefixes account for 80% of queries), and replicate read-only trie copies across regions for low latency.",
    "Real-time updates to the trie (new trending queries, corrections) use a two-tier architecture: a small mutable trie for recent updates (in-memory, rebuilt every few minutes) merged at query time with the large immutable base trie (rebuilt daily from analytics data). This avoids the complexity of concurrent trie mutations.",
  ],
  detailed: [
    "## Trie Data Structure for Prefix Search\n\nA trie stores strings character by character, with each edge labeled by a character and each node representing a prefix. For typeahead, we augment each node with the top-k suggestions for that prefix -- this is the critical optimization that avoids traversing the entire subtree on every query. When a user types 'app', we traverse root->a->p->p and immediately return the pre-computed top-k suggestions stored at that node (e.g., 'apple', 'application', 'app store'). Without pre-computed top-k, we would need to DFS the entire subtree (potentially millions of nodes for short prefixes like 'a'), which is far too slow for sub-100ms responses. The trade-off is memory: storing top-10 suggestions at every node multiplies memory usage by roughly 10x compared to a bare trie. A compressed trie (radix tree or Patricia trie) merges single-child chains into single nodes, reducing node count by 50-80% for natural language data. For example, the words 'application' and 'apple' share the prefix 'appl' as a single compressed edge rather than four separate nodes.",
    "## Ranking and Scoring Algorithms\n\n**Frequency-based ranking** is the simplest: count how many times each query has been searched and sort by count. The problem is that this favors historically popular queries over emerging trends. **Exponential decay** solves this by weighting recent searches more heavily: `score = count * decay^(now - lastSearchTime)`, where decay is a factor like 0.99 per hour. A query searched 1000 times a year ago scores lower than one searched 100 times today. **Personalized ranking** incorporates the user's own search history: if the user frequently searches for 'python programming', typing 'py' should rank this highly even if 'python snake' is globally more popular. The scoring function combines signals: `finalScore = w1 * globalFrequency + w2 * recencyScore + w3 * personalScore + w4 * contextScore`, where context might include the user's current location, time of day, or the page they are on. Weights are tuned via A/B testing and machine learning models. For trending queries, a separate detector identifies queries whose frequency has spiked in the last hour and boosts their score temporarily.",
    "## System Architecture and Scaling\n\nThe typeahead service sits behind a CDN or edge cache for the most common prefixes. When a request arrives, it first checks the edge cache (Redis or Memcached) -- cache hit rates of 70-90% are common because query prefix distributions follow a power law (Zipf's distribution). On cache miss, the request goes to a trie server. The trie is partitioned by prefix range across multiple shards: shard 1 handles prefixes starting with a-f, shard 2 handles g-m, and so on. Each shard holds its portion of the trie entirely in memory for O(L) lookup time where L is the prefix length. For read scaling, each shard is replicated across multiple read replicas in each region. A typical deployment uses 26 shards (one per letter) with 3 replicas each, totaling 78 trie servers per region. At Google's scale, the trie contains billions of entries and requires hundreds of servers, but the architecture remains the same. The API gateway routes requests to the correct shard based on the first character of the prefix, or uses consistent hashing for more granular partitioning.",
    "## Real-Time Updates and Data Pipeline\n\n**Offline pipeline**: Every 24 hours, a MapReduce/Spark job processes search logs to compute global query frequencies, applies filtering (remove offensive content, low-quality queries, spelling corrections), and builds a new immutable trie. This trie is serialized, compressed (typically 40-60% compression with LZ4), and distributed to all trie servers via a pull mechanism. **Online updates**: Between daily rebuilds, trending queries and corrections need to be reflected quickly. A streaming pipeline (Kafka + Flink) processes the real-time search event stream, detects trending queries (frequency spike detection using sliding window counters), and pushes updates to a small mutable trie layer on each server. At query time, results from both the base trie and the delta trie are merged and re-ranked. The delta trie is small (thousands of entries vs billions in the base trie), so it can be safely mutated with a read-write lock. Every few hours, the delta is merged into the base trie to prevent unbounded growth.",
    "## Multi-Language and Special Considerations\n\n**Multi-language support** requires handling different character sets (Latin, CJK, Arabic, Devanagari), input methods (pinyin for Chinese, romaji for Japanese), and word boundaries. For Chinese typeahead, the trie must support pinyin-to-character mapping: the prefix 'bei' should suggest 'Beijing' in both pinyin and characters. This is implemented as a parallel trie indexed by romanized input that maps to the original-script suggestions. **Fuzzy matching** handles typos: if a user types 'amazn', the system should still suggest 'amazon'. Edit distance computation (Levenshtein distance) is expensive -- O(m*n) per candidate. In practice, use a BK-tree or precomputed edit-distance-1 variants stored in the trie. **Offensive content filtering** runs a bloom filter or hash set check on every suggestion before returning it. The filter is updated daily and can be hot-reloaded. **Privacy** is critical: do not suggest other users' private searches. Only suggest from a curated corpus of public queries, product names, and trending topics.",
  ],
  deepDive: [
    "**Trie memory optimization** is essential for production systems. A naive trie for 1 billion unique queries with an average length of 20 characters would consume roughly 200 GB of memory (20 nodes per query * 10 bytes per node minimum). Compression techniques reduce this dramatically. **Compressed trie (radix tree)**: merge chains of single-child nodes into a single node with a multi-character edge label. This reduces node count by 50-80%. **Array-mapped trie**: instead of hash maps for children, use a sorted array of (character, childPointer) pairs, saving 40-60 bytes per node from hash map overhead. **Succinct tries** (like LOUDS encoding) represent the trie structure in 2 bits per node plus the edge labels, achieving near-information-theoretic minimum space. For a trie with 100 million nodes, LOUDS uses roughly 25 MB for structure alone. **Memory-mapped files**: instead of loading the entire trie into heap memory, memory-map the serialized trie file. The OS pages in only the accessed portions, reducing resident memory. This works well because access patterns are skewed -- most queries hit a small subset of the trie.",
    "**Serving latency breakdown** for a typeahead request shows where to optimize. Total budget: 100ms. Network round-trip (client to edge server): 10-30ms. Edge cache lookup: 1ms. Trie traversal: 0.01ms (trivial -- just following L character pointers). Top-k merge from pre-computed lists: 0.05ms. Personalization re-ranking: 1-5ms. Response serialization and network return: 5-10ms. The bottleneck is rarely the trie itself -- it is the network latency and any machine learning models in the ranking pipeline. This is why edge deployment (running trie servers in CDN points of presence) is critical for achieving sub-50ms total latency. Client-side optimizations also matter: debouncing (only send a request 100-200ms after the user stops typing), request cancellation (abort the previous in-flight request when a new character is typed), and local caching (cache results for previously typed prefixes in the browser's memory).",
    "**Trending detection and real-time ranking** requires a separate analytics pipeline. The detector compares the current query rate against the expected baseline rate (computed from the same time window in previous weeks). If `current_rate > baseline_rate * threshold` (e.g., threshold = 3x), the query is flagged as trending. False positives are managed by requiring the elevated rate to persist for at least 5 minutes. Once a trending query is detected, its score in the trie is temporarily boosted by a multiplier (e.g., 2x) that decays over hours. The implementation uses a sliding window counter per query in Redis: increment on each search, count the window every minute, compare against the precomputed baseline. At scale, this cannot be done for every query -- only for queries exceeding a minimum frequency threshold (e.g., 10 searches per minute). The streaming pipeline (Kafka -> Flink) handles this aggregation, outputting trending query updates every 30 seconds to the trie servers.",
    "**Client-side architecture** is half the battle for a good typeahead experience. The client should implement: (1) **Debouncing** with a 150-200ms delay -- do not send a request on every keystroke, wait for a pause. (2) **Request cancellation** using AbortController: when the user types a new character, abort the previous in-flight HTTP request to avoid out-of-order responses. (3) **Local prefix cache**: if the user typed 'app' and received suggestions, and then types 'appl', first filter the cached 'app' results locally for the prefix 'appl' before sending a new request. This provides instant results while the server request is in flight. (4) **Keyboard navigation**: arrow keys move selection up/down, Enter selects, Escape dismisses. (5) **Accessibility**: ARIA attributes (role='combobox', aria-autocomplete='list', aria-expanded), screen reader announcements when suggestions appear or change. (6) **Rate limiting on the client**: never send more than 10 requests per second, even without debouncing, to protect the server from keystroke floods.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Trie with Pre-computed Top-K Suggestions",
      source: `#include <array>
#include <memory>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
#include <mutex>

struct Suggestion {
    std::string text;
    double score;  // Combined ranking score

    bool operator<(const Suggestion& other) const {
        return score < other.score;  // Max-heap by score
    }
    bool operator>(const Suggestion& other) const {
        return score > other.score;
    }
};

class TrieNode {
public:
    std::unordered_map<char, std::unique_ptr<TrieNode>> children;
    bool isEndOfWord = false;
    double score = 0.0;

    // Pre-computed top-K suggestions for this prefix
    std::vector<Suggestion> topK;
    static constexpr int K = 10;

    void updateTopK(const Suggestion& suggestion) {
        // Check if this suggestion already exists
        for (auto& s : topK) {
            if (s.text == suggestion.text) {
                s.score = suggestion.score;
                // Re-sort after update
                std::sort(topK.begin(), topK.end(),
                    [](const Suggestion& a, const Suggestion& b) {
                        return a.score > b.score;
                    });
                return;
            }
        }

        if (static_cast<int>(topK.size()) < K) {
            topK.push_back(suggestion);
            std::sort(topK.begin(), topK.end(),
                [](const Suggestion& a, const Suggestion& b) {
                    return a.score > b.score;
                });
        } else if (suggestion.score > topK.back().score) {
            topK.back() = suggestion;
            std::sort(topK.begin(), topK.end(),
                [](const Suggestion& a, const Suggestion& b) {
                    return a.score > b.score;
                });
        }
    }
};

class TypeaheadTrie {
private:
    std::unique_ptr<TrieNode> root_;
    mutable std::mutex mutex_;

public:
    TypeaheadTrie() : root_(std::make_unique<TrieNode>()) {}

    // Insert a query with its score, updating top-K at every prefix node
    void insert(const std::string& query, double score) {
        std::lock_guard<std::mutex> lock(mutex_);
        TrieNode* node = root_.get();
        Suggestion suggestion{query, score};

        // Update top-K at root (empty prefix)
        node->updateTopK(suggestion);

        for (char c : query) {
            char lower = std::tolower(c);
            if (node->children.find(lower) == node->children.end()) {
                node->children[lower] = std::make_unique<TrieNode>();
            }
            node = node->children[lower].get();
            // Update top-K at each prefix node along the path
            node->updateTopK(suggestion);
        }

        node->isEndOfWord = true;
        node->score = score;
    }

    // O(L) prefix search where L = prefix length
    std::vector<Suggestion> search(const std::string& prefix,
                                    int maxResults = 10) const {
        std::lock_guard<std::mutex> lock(mutex_);
        const TrieNode* node = root_.get();

        // Traverse to the prefix node
        for (char c : prefix) {
            char lower = std::tolower(c);
            auto it = node->children.find(lower);
            if (it == node->children.end()) {
                return {};  // Prefix not found
            }
            node = it->second.get();
        }

        // Return pre-computed top-K (already sorted by score)
        int count = std::min(maxResults,
                             static_cast<int>(node->topK.size()));
        return std::vector<Suggestion>(
            node->topK.begin(), node->topK.begin() + count);
    }

    // Bulk rebuild from sorted (query, score) pairs
    void rebuild(const std::vector<std::pair<std::string, double>>& data) {
        auto newRoot = std::make_unique<TrieNode>();
        // Build trie from data sorted by score descending
        // This ensures top-K is populated efficiently
        for (const auto& [query, score] : data) {
            TrieNode* node = newRoot.get();
            Suggestion suggestion{query, score};
            node->updateTopK(suggestion);

            for (char c : query) {
                char lower = std::tolower(c);
                if (node->children.find(lower) == node->children.end()) {
                    node->children[lower] = std::make_unique<TrieNode>();
                }
                node = node->children[lower].get();
                node->updateTopK(suggestion);
            }
            node->isEndOfWord = true;
            node->score = score;
        }

        std::lock_guard<std::mutex> lock(mutex_);
        root_ = std::move(newRoot);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Ranking Engine with Frequency, Recency, and Personalization",
      source: `#include <chrono>
#include <cmath>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>

struct QueryStats {
    std::string query;
    int64_t totalSearches = 0;
    int64_t recentSearches = 0;  // Last 24 hours
    int64_t lastSearchedAt = 0;  // Epoch seconds
};

struct UserSearchHistory {
    // query -> search count for this user
    std::unordered_map<std::string, int> queryCounts;
    int64_t lastUpdated = 0;
};

class RankingEngine {
private:
    // Weights (tuned via A/B testing)
    double wFrequency_ = 0.4;
    double wRecency_ = 0.3;
    double wPersonal_ = 0.2;
    double wTrending_ = 0.1;

    // Decay factor: score halves every 24 hours
    static constexpr double DECAY_HALF_LIFE_SECS = 86400.0;
    static constexpr double DECAY_LAMBDA =
        0.693147 / DECAY_HALF_LIFE_SECS; // ln(2) / half_life

    int64_t nowSecs() {
        return std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

    // Recency score using exponential decay
    double recencyScore(int64_t lastSearchedAt) {
        double age = static_cast<double>(nowSecs() - lastSearchedAt);
        return std::exp(-DECAY_LAMBDA * age);
    }

    // Trending detection: recent/total ratio
    double trendingScore(const QueryStats& stats) {
        if (stats.totalSearches == 0) return 0.0;
        double ratio = static_cast<double>(stats.recentSearches) /
                       stats.totalSearches;
        // Boost if recent searches are disproportionately high
        // Baseline ratio would be 1/365 for uniform distribution
        double baseline = 1.0 / 365.0;
        return std::max(0.0, (ratio - baseline) / baseline);
    }

public:
    struct ScoredSuggestion {
        std::string query;
        double score;
        bool operator>(const ScoredSuggestion& other) const {
            return score > other.score;
        }
    };

    // Rank suggestions for a specific user
    std::vector<ScoredSuggestion> rank(
        const std::vector<QueryStats>& candidates,
        const UserSearchHistory* userHistory,
        int topK = 10) {

        std::vector<ScoredSuggestion> scored;
        scored.reserve(candidates.size());

        // Normalize frequency scores using log scale
        double maxFreq = 1.0;
        for (const auto& c : candidates) {
            maxFreq = std::max(maxFreq,
                static_cast<double>(c.totalSearches));
        }

        for (const auto& candidate : candidates) {
            double freqScore = std::log1p(
                static_cast<double>(candidate.totalSearches)) /
                std::log1p(maxFreq);

            double recScore = recencyScore(candidate.lastSearchedAt);

            double trendScore = trendingScore(candidate);

            // Personal score: how often this user searched this query
            double personalScore = 0.0;
            if (userHistory) {
                auto it = userHistory->queryCounts.find(candidate.query);
                if (it != userHistory->queryCounts.end()) {
                    personalScore = std::min(1.0,
                        static_cast<double>(it->second) / 10.0);
                }
            }

            double finalScore = wFrequency_ * freqScore
                              + wRecency_ * recScore
                              + wPersonal_ * personalScore
                              + wTrending_ * trendScore;

            scored.push_back({candidate.query, finalScore});
        }

        // Partial sort for top-K efficiency
        if (static_cast<int>(scored.size()) > topK) {
            std::partial_sort(scored.begin(),
                scored.begin() + topK, scored.end(),
                std::greater<ScoredSuggestion>());
            scored.resize(topK);
        } else {
            std::sort(scored.begin(), scored.end(),
                std::greater<ScoredSuggestion>());
        }

        return scored;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Compressed Trie (Radix Tree) for Memory Efficiency",
      source: `#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

// Radix tree: merges single-child chains into one node
// "application" and "apple" share prefix "appl" as ONE edge
// Saves 50-80% memory compared to character-per-node trie

struct RadixNode {
    // Edge label can be multiple characters (compressed)
    std::string edgeLabel;
    std::unordered_map<char, std::unique_ptr<RadixNode>> children;
    bool isTerminal = false;
    double score = 0.0;
    std::vector<std::pair<std::string, double>> topK;
    static constexpr int MAX_TOP_K = 10;
};

class RadixTree {
private:
    std::unique_ptr<RadixNode> root_;

    // Find the common prefix length between two strings
    size_t commonPrefixLength(const std::string& a,
                               const std::string& b) {
        size_t len = std::min(a.length(), b.length());
        for (size_t i = 0; i < len; ++i) {
            if (a[i] != b[i]) return i;
        }
        return len;
    }

public:
    RadixTree() : root_(std::make_unique<RadixNode>()) {}

    void insert(const std::string& word, double score) {
        insertHelper(root_.get(), word, 0, score);
    }

    void insertHelper(RadixNode* node, const std::string& word,
                      size_t depth, double score) {
        if (depth == word.length()) {
            node->isTerminal = true;
            node->score = score;
            return;
        }

        char firstChar = word[depth];
        auto it = node->children.find(firstChar);

        if (it == node->children.end()) {
            // No matching child: create new leaf
            auto child = std::make_unique<RadixNode>();
            child->edgeLabel = word.substr(depth);
            child->isTerminal = true;
            child->score = score;
            node->children[firstChar] = std::move(child);
            return;
        }

        RadixNode* child = it->second.get();
        std::string remaining = word.substr(depth);
        size_t commonLen = commonPrefixLength(
            child->edgeLabel, remaining);

        if (commonLen == child->edgeLabel.length()) {
            // Full edge match: recurse into child
            insertHelper(child, word, depth + commonLen, score);
        } else {
            // Partial match: split the edge
            // Create a new intermediate node at the split point
            auto splitNode = std::make_unique<RadixNode>();
            splitNode->edgeLabel = child->edgeLabel.substr(0, commonLen);

            // Existing child becomes a child of the split node
            child->edgeLabel = child->edgeLabel.substr(commonLen);
            char childKey = child->edgeLabel[0];

            // Move the existing child under split node
            splitNode->children[childKey] = std::move(it->second);

            // If the new word ends at the split point
            if (commonLen == remaining.length()) {
                splitNode->isTerminal = true;
                splitNode->score = score;
            } else {
                // Create a new child for the remaining suffix
                auto newChild = std::make_unique<RadixNode>();
                newChild->edgeLabel = remaining.substr(commonLen);
                newChild->isTerminal = true;
                newChild->score = score;
                splitNode->children[newChild->edgeLabel[0]] =
                    std::move(newChild);
            }

            node->children[firstChar] = std::move(splitNode);
        }
    }

    // Search for all words with the given prefix
    std::vector<std::pair<std::string, double>> search(
        const std::string& prefix) {
        std::vector<std::pair<std::string, double>> results;
        RadixNode* node = root_.get();
        size_t depth = 0;

        // Navigate to the prefix node
        while (depth < prefix.length()) {
            char c = prefix[depth];
            auto it = node->children.find(c);
            if (it == node->children.end()) return results;

            RadixNode* child = it->second.get();
            std::string remaining = prefix.substr(depth);

            size_t commonLen = commonPrefixLength(
                child->edgeLabel, remaining);

            if (commonLen < remaining.length() &&
                commonLen < child->edgeLabel.length()) {
                return results; // No match
            }

            node = child;
            depth += child->edgeLabel.length();
        }

        // Collect all words under this node
        std::string currentPrefix = prefix;
        collectAll(node, currentPrefix, results);
        return results;
    }

private:
    void collectAll(RadixNode* node, std::string& prefix,
        std::vector<std::pair<std::string, double>>& results) {
        if (node->isTerminal) {
            results.push_back({prefix, node->score});
        }
        for (auto& [c, child] : node->children) {
            prefix += child->edgeLabel;
            collectAll(child.get(), prefix, results);
            prefix.erase(prefix.length() - child->edgeLabel.length());
        }
    }
};

// Memory comparison for 1M unique queries, avg length 15:
// Standard trie:  ~15M nodes * 64 bytes = ~960 MB
// Radix tree:     ~3M nodes * 80 bytes  = ~240 MB (75% reduction)`,
    },
  ],
  diagrams: [
    {
      title: "Typeahead System Architecture",
      kind: "architecture",
      caption:
        "Multi-tier architecture with edge caching, partitioned trie servers, and a data pipeline for offline rebuilds and real-time updates.",
      mermaid: `graph TD
    CLIENT["Client with debounce"]
    CDN["Edge Cache - Redis"]
    GATEWAY["API Gateway"]
    SHARD1["Trie Shard a-f"]
    SHARD2["Trie Shard g-m"]
    SHARD3["Trie Shard n-s"]
    SHARD4["Trie Shard t-z"]
    DELTA["Delta Trie - trending"]
    LOGS["Search Logs"]
    SPARK["Spark Daily Rebuild"]
    KAFKA["Kafka Stream"]
    FLINK["Flink Trending Detector"]
    CLIENT --> CDN
    CDN -->|Cache miss| GATEWAY
    GATEWAY --> SHARD1
    GATEWAY --> SHARD2
    GATEWAY --> SHARD3
    GATEWAY --> SHARD4
    SHARD1 --> DELTA
    LOGS --> SPARK
    SPARK -->|Daily trie build| SHARD1
    LOGS --> KAFKA
    KAFKA --> FLINK
    FLINK -->|Trending updates| DELTA`,
    },
    {
      title: "Typeahead Query Flow",
      kind: "sequence",
      caption:
        "End-to-end sequence showing client debounce, edge cache check, trie lookup, personalized re-ranking, and response.",
      mermaid: `sequenceDiagram
    participant User
    participant Client
    participant Edge as Edge Cache
    participant GW as API Gateway
    participant Trie as Trie Shard
    participant Rank as Ranking Service
    participant PH as Personal History
    User->>Client: Types 'app' with 150ms debounce
    Client->>Client: Cancel previous request for 'ap'
    Client->>Edge: GET /suggest?q=app
    Edge->>Edge: Cache miss
    Edge->>GW: Forward request
    GW->>Trie: Lookup prefix 'app' on shard-1
    Trie-->>GW: Top 10 by global score
    GW->>Rank: Re-rank with userId context
    Rank->>PH: Get user search history
    PH-->>Rank: User previously searched 'apple music'
    Rank-->>GW: Re-ranked top 10
    GW-->>Edge: Cache for 60s
    Edge-->>Client: JSON suggestions array
    Client-->>User: Display dropdown in 80ms`,
    },
    {
      title: "Trie Prefix Lookup Flow",
      kind: "flow",
      caption:
        "Step-by-step flow of looking up prefix 'app' in a trie with pre-computed top-K suggestions at each node.",
      mermaid: `flowchart TD
    START["Query: prefix = app"] --> R["Root node"]
    R --> A["Traverse edge a"]
    A --> P1["Traverse edge p"]
    P1 --> P2["Traverse edge p"]
    P2 --> FOUND["Node found for prefix app"]
    FOUND --> TOPK["Return pre-computed top-K"]
    TOPK --> RESULT["apple 0.95, application 0.88, app store 0.82"]
    R --> MISS["If edge not found at any step"]
    MISS --> EMPTY["Return empty results"]`,
    },
    {
      title: "Trie Data Pipeline",
      kind: "architecture",
      caption:
        "Two-tier update pipeline with daily offline rebuild from search logs and real-time trending detection for the delta trie.",
      mermaid: `graph LR
    SEARCH["Search Events"]
    KAFKA["Kafka"]
    HDFS["HDFS Search Logs"]
    SPARK["Spark Job - Daily"]
    FLINK["Flink - Real-time"]
    FILTER["Content Filter"]
    BUILD["Trie Builder"]
    SERIAL["Serialize and Compress"]
    DIST["Distribute to Shards"]
    TRENDING["Trending Detector"]
    DELTA["Delta Trie Update"]
    SEARCH --> KAFKA
    KAFKA --> HDFS
    KAFKA --> FLINK
    HDFS --> SPARK
    SPARK --> FILTER
    FILTER --> BUILD
    BUILD --> SERIAL
    SERIAL --> DIST
    FLINK --> TRENDING
    TRENDING --> DELTA`,
    },
  ],
  interviewQA: [
    {
      q: "Why do we pre-compute top-K suggestions at each trie node instead of traversing the subtree at query time?",
      a: "Traversing the subtree at query time is far too slow for short prefixes. Consider the prefix 'a' -- its subtree might contain millions of words, and a DFS to collect and sort all of them could take hundreds of milliseconds or more, far exceeding the 100ms latency budget. Pre-computing top-K at each node makes the query O(L) where L is the prefix length (just follow the path and return the stored list), regardless of how many words exist under that prefix. The trade-off is memory: storing 10 suggestions per node multiplies memory by roughly 10x. And insertion becomes O(L * K) because each insertion must update the top-K list at every prefix node along the path. However, since queries vastly outnumber insertions (reads are 1000x more frequent than writes in a search system), this is an excellent trade-off. The rebuild is done offline, so insertion cost does not affect query latency.",
      followUps: [
        "How do you efficiently maintain top-K during trie construction?",
        "What happens when a suggestion's score changes?",
      ],
    },
    {
      q: "How would you partition a typeahead trie across multiple servers?",
      a: "The simplest approach is range-based partitioning by prefix: shard 1 handles all queries starting with a-f, shard 2 handles g-m, shard 3 handles n-s, and shard 4 handles t-z. This is simple to implement (route based on the first character) but can lead to hot spots because letter frequencies are non-uniform (more queries start with 's' than 'x'). A better approach uses consistent hashing on the first two or three characters of the prefix, distributing load more evenly. Each shard holds its portion of the trie entirely in memory. For read scaling, replicate each shard across multiple instances per region. The API gateway knows the partitioning scheme and routes requests directly to the correct shard without a lookup service. During a shard rebuild (new daily trie), use blue-green deployment: build the new trie on a standby instance, swap it in atomically via DNS/load balancer, and drain the old instance.",
      followUps: [
        "How do you handle queries that span shard boundaries?",
        "What is the rebalancing strategy when adding shards?",
      ],
    },
    {
      q: "How do you handle real-time trending queries in a typeahead system?",
      a: "Use a two-tier architecture: a large immutable base trie rebuilt daily and a small mutable delta trie for real-time updates. The streaming pipeline (Kafka -> Flink) processes search events in real-time, computing per-query search rates in sliding windows (e.g., 5-minute and 1-hour windows). When a query's current rate exceeds its baseline rate by a threshold (e.g., 3x), it is flagged as trending and pushed to the delta trie on each server. At query time, results from both tries are merged: base trie results are combined with delta trie results, deduplicated, and re-ranked with a trending boost. The delta trie is small (thousands of entries versus billions in the base trie), so it can be safely updated using a read-write lock without affecting query latency. Every few hours, the delta is merged into the base trie to prevent growth. This architecture avoids the complexity and risk of mutating the main trie in production.",
      followUps: [
        "How do you determine the trending threshold without too many false positives?",
        "How do you handle a trending query that becomes offensive?",
      ],
    },
    {
      q: "What client-side optimizations are critical for typeahead performance?",
      a: "First, debouncing: wait 150-200ms after the last keystroke before sending a request. This reduces request volume by 70-80% without noticeable latency to the user (typing a 5-character query generates 1-2 requests instead of 5). Second, request cancellation: when a new character is typed, abort the previous in-flight HTTP request using AbortController. This prevents out-of-order responses (the response for 'ap' arriving after the response for 'app'). Third, local prefix filtering: cache the results for each prefix. When the user extends a prefix (typing 'appl' after receiving results for 'app'), immediately filter the cached results locally for the new prefix while the server request is in flight. This provides instant visual feedback. These optimizations work together: debouncing reduces server load, cancellation prevents UI glitches, and local caching provides sub-10ms response times for prefix extensions.",
      followUps: [
        "How do you handle the case where local filtering produces different results than the server?",
        "What is the optimal debounce interval and how would you A/B test it?",
      ],
    },
    {
      q: "How do you handle multi-language typeahead, especially for CJK languages?",
      a: "CJK (Chinese, Japanese, Korean) languages pose unique challenges because they use input method editors (IMEs) where users type romanized input that is converted to native characters. For Chinese typeahead, maintain two parallel tries: one indexed by pinyin (romanized) and one by Chinese characters. When the user types 'bei', the pinyin trie returns suggestions like 'Beijing' (in characters). Japanese requires supporting both romaji-to-hiragana conversion and direct kanji lookup. The trie must handle multi-byte Unicode characters as edge labels, with proper normalization (NFC form). For Korean, the Hangul syllable composition means partial syllables need to be matched -- the user is constructing a character as they type. Word segmentation is another challenge: CJK languages do not use spaces between words, so the trie must handle unsegmented queries. Solutions include n-gram based indexing and dictionary-based segmentation. Each language's trie is effectively a separate service, with language detection routing the request to the correct trie.",
    },
  ],
  mcqs: [
    {
      q: "What is the time complexity of a prefix search in a trie with pre-computed top-K suggestions?",
      options: [
        "O(N) where N is the total number of words",
        "O(L) where L is the prefix length",
        "O(L * K) where K is the number of results",
        "O(N * log N) for sorting results",
      ],
      answerIndex: 1,
      explanation:
        "With pre-computed top-K at each node, searching for a prefix is simply traversing L characters down the trie and returning the stored list. No subtree traversal or sorting is needed at query time. This is why pre-computation is essential for sub-100ms latency.",
    },
    {
      q: "Why does a compressed trie (radix tree) use less memory than a standard trie?",
      options: [
        "It stores fewer characters",
        "It uses smaller pointers",
        "It merges single-child node chains into single nodes with multi-character edges",
        "It compresses the data using gzip",
      ],
      answerIndex: 2,
      explanation:
        "A radix tree compresses chains of nodes where each node has only one child. For example, 'ation' in 'application' becomes a single node with edge label 'ation' instead of 5 separate nodes. This reduces node count by 50-80% for natural language data.",
    },
    {
      q: "What is the primary purpose of debouncing in typeahead clients?",
      options: [
        "To improve suggestion quality",
        "To reduce the number of server requests by waiting for the user to pause typing",
        "To sort results before displaying",
        "To encrypt the search query",
      ],
      answerIndex: 1,
      explanation:
        "Debouncing waits 150-200ms after the last keystroke before sending a request. This means typing 'apple' sends 1-2 requests instead of 5 (one per character), reducing server load by 70-80%. The delay is imperceptible to users since they are still typing during the debounce window.",
    },
    {
      q: "In a two-tier trie architecture, what is the purpose of the delta trie?",
      options: [
        "To store all historical queries",
        "To hold recently trending queries that have not yet been included in the daily base trie rebuild",
        "To cache frequently accessed results",
        "To store user personal histories",
      ],
      answerIndex: 1,
      explanation:
        "The delta trie is a small mutable layer that captures real-time trending queries and corrections between daily base trie rebuilds. At query time, results from both the base and delta tries are merged. This avoids mutating the large base trie in production while keeping suggestions fresh.",
    },
  ],
  flashcards: [
    {
      front: "How does a trie with pre-computed top-K work for typeahead?",
      back: "Each trie node stores the top-K highest-scoring suggestions for its prefix. Searching for prefix 'app' traverses 3 edges (a->p->p) and immediately returns the stored list. Query time: O(L) where L is prefix length. Trade-off: O(L*K) insertion cost and approximately 10x memory overhead for storing top-K at every node.",
    },
    {
      front: "What is the difference between a trie and a radix tree?",
      back: "A trie stores one character per edge. A radix tree (compressed trie) merges single-child chains: 'ation' becomes one edge instead of 5 nodes. Radix trees use 50-80% less memory for natural language data. Trade-off: insertion and splitting logic is more complex. Both provide O(L) lookup.",
    },
    {
      front: "How does exponential decay ranking work for typeahead suggestions?",
      back: "score = baseScore * e^(-lambda * age), where lambda = ln(2) / halfLife. With a 24-hour half-life, a query's score halves every day. A query searched 100 times yesterday scores higher than one searched 1000 times last month. This naturally promotes recent trends over stale historical popularity.",
    },
    {
      front: "What is the two-tier trie architecture?",
      back: "Base trie: large, immutable, rebuilt daily from search logs via Spark. Contains billions of entries. Delta trie: small, mutable, updated in real-time from streaming pipeline. Contains trending queries. At query time, results from both are merged. Delta is periodically folded into the base trie.",
    },
    {
      front: "Why is edge caching critical for typeahead?",
      back: "Query prefixes follow Zipf's distribution: the top 20% of prefixes account for 80% of queries. Caching these popular prefixes at the edge (Redis/CDN) achieves 70-90% cache hit rates, reducing trie server load dramatically. Cache TTL: 60 seconds for popular prefixes, shorter for trending queries.",
    },
    {
      front: "How does client-side prefix filtering work?",
      back: "When results for prefix 'app' are cached locally and the user types 'appl', the client immediately filters the cached 'app' results for those matching 'appl' (instant, sub-10ms). Meanwhile, a server request for 'appl' is sent. If server results differ, they replace the filtered results. This provides seamless instant feedback.",
    },
    {
      front: "How is a typeahead trie partitioned across servers?",
      back: "Range partitioning by prefix: shard 1 handles a-f, shard 2 handles g-m, etc. Each shard holds its trie portion entirely in memory. Route by first character. Replicate each shard for read scaling. Use blue-green deployment for daily rebuilds. Alternative: consistent hashing on first 2-3 chars for more even distribution.",
    },
    {
      front: "What are the four key client-side optimizations for typeahead?",
      back: "1. Debounce (150-200ms wait after last keystroke). 2. Request cancellation (AbortController for superseded requests). 3. Local prefix cache (filter cached results before server response). 4. Keyboard navigation with ARIA accessibility. Together: 70-80% fewer requests, no out-of-order responses, instant feedback.",
    },
  ],
  exercises: [
    "**Implement a trie with pre-computed top-K in C++**: Build a trie that stores the top 10 suggestions at every node. Insert 1 million query-score pairs and benchmark prefix search latency. Verify that search time is O(L) regardless of the number of words under the prefix. Compare memory usage with and without top-K storage.",
    "**Build a typeahead ranking engine**: Implement a scoring function that combines global frequency (log-normalized), recency (exponential decay with 24-hour half-life), personalization (user search history), and trending (rate spike detection). Generate synthetic search data with known patterns and verify that ranking correctly surfaces trending and personalized results.",
    "**Design a prefix-based sharding scheme**: Given a dataset of 100 million unique queries with frequency counts, design a sharding scheme that distributes load evenly across 8 shards. Account for non-uniform letter distribution (more queries start with 's' than 'x'). Implement the routing logic and measure load balance across shards.",
    "**Implement fuzzy matching for typeahead**: Extend the trie to handle typos by generating edit-distance-1 variants for each query (insertions, deletions, substitutions, transpositions). Store variants in the trie pointing to the canonical query. Measure the memory overhead and search quality compared to exact prefix matching.",
    "**Build a trending query detector**: Using a stream of search events, implement a sliding window counter (1-minute and 1-hour windows) per query. Detect trending queries where the current rate exceeds the baseline by 3x. Test with synthetic traffic including injected spikes and verify detection latency and false positive rate.",
  ],
  revisionNotes: [
    "**Core data structure**: Trie with pre-computed top-K at every node. Search is O(L) where L = prefix length. Trade-off: 10x memory for top-K storage, O(L*K) insertion cost. Worth it because reads vastly outnumber writes.",
    "**Radix tree optimization**: Merge single-child chains into multi-character edges. Reduces node count by 50-80%. For 1M queries, avg length 15: standard trie uses approximately 960MB, radix tree approximately 240MB.",
    "**Ranking formula**: finalScore = w1*frequency + w2*recency + w3*personal + w4*trending. Recency uses exponential decay: score * e^(-lambda * age). Tune weights via A/B testing. Log-normalize frequency to prevent popular queries from dominating.",
    "**Latency budget**: 100ms total. Network: 10-30ms. Cache lookup: 1ms. Trie traversal: 0.01ms. Ranking: 1-5ms. Response serialization: 5-10ms. Bottleneck is network, not computation. Edge deployment is key.",
    "**Caching**: Zipf distribution means top 20% of prefixes serve 80% of queries. Edge cache (Redis) achieves 70-90% hit rate. TTL: 60s for common prefixes. Invalidate on trending changes.",
    "**Two-tier updates**: Base trie (immutable, daily rebuild from Spark) + Delta trie (mutable, real-time trending from Flink). Merge at query time. Delta stays small (thousands of entries). Periodically fold delta into base.",
    "**Client optimizations**: Debounce (150-200ms), request cancellation (AbortController), local prefix cache, keyboard navigation with ARIA. Reduces server requests by 70-80%.",
    "**Partitioning**: Range-based by prefix (a-f, g-m, etc.) or consistent hash on first 2-3 chars. Each shard fully in memory. Replicate for reads. Blue-green deploy for daily rebuilds.",
    "**Multi-language**: CJK needs parallel tries (pinyin + characters). Unicode normalization (NFC). IME-aware prefix matching. Per-language trie services with language detection routing.",
    "**Fuzzy matching**: Edit-distance-1 variants precomputed and stored in trie. Or use BK-tree for edit distance queries. Memory overhead of 5-10x for variant storage. Alternative: use n-gram index for approximate matching.",
  ],
  cheatSheet: [
    "**Trie search complexity**: O(L) with pre-computed top-K. Without pre-computation: O(L + subtreeSize) -- unacceptable for short prefixes.",
    "**Memory formula**: Standard trie: nodes * 64 bytes. With top-K: nodes * (64 + K * avgQueryLen). Radix tree saves 50-80% on node count.",
    "**Exponential decay**: score = base * e^(-0.693 * age / halfLife). Half-life of 24h: score halves every day. 1-week-old query has 0.8% of original score.",
    "**Debounce sweet spot**: 150-200ms. Under 100ms = too many requests. Over 300ms = noticeable delay. Benchmark: 5 chars typed in 1s generates 1-2 requests with 200ms debounce.",
    "**Cache hit rate**: Zipf distribution gives 70-90% hit rate on top prefixes. Cache the top 1M (prefix, results) pairs in Redis. Size: approximately 1M * 1KB = 1GB.",
    "**Shard count**: 26 shards (one per letter) is simple. Weight by frequency: s-shard may need 3x capacity of x-shard. Consistent hash on 2-3 char prefix for better balance.",
    "**Trending detection**: current_rate > 3x baseline_rate sustained for 5+ minutes. Baseline from same time window in previous weeks. Use Flink sliding window counters.",
    "**Serialization**: Trie to disk with LZ4 compression: 40-60% compression ratio. Memory-map for partial loading. Blue-green swap: build on standby, switch atomically.",
    "**Request cancellation**: AbortController.abort() on new keystroke. Prevents stale responses from overwriting fresh ones. Critical for correctness and reduced bandwidth.",
    "**Accessibility**: role='combobox', aria-autocomplete='list', aria-expanded='true/false', aria-activedescendant for current selection. Announce result count to screen readers.",
  ],
  glossary: [
    {
      term: "Trie (Prefix Tree)",
      definition:
        "A tree data structure where each node represents a character and paths from root to nodes represent prefixes. Enables O(L) prefix search where L is the query length. The core data structure for typeahead systems.",
    },
    {
      term: "Radix Tree (Compressed Trie)",
      definition:
        "A space-optimized trie that merges chains of single-child nodes into single nodes with multi-character edge labels. Reduces memory usage by 50-80% compared to a standard trie for natural language data.",
    },
    {
      term: "Debouncing",
      definition:
        "A client-side technique that delays sending a request until the user stops typing for a specified interval (typically 150-200ms). Reduces server request volume by 70-80% without perceptible latency.",
    },
    {
      term: "Top-K Pre-computation",
      definition:
        "Storing the K highest-ranked suggestions at every trie node, so that a prefix search returns results in O(L) time without traversing the subtree. The key optimization that makes sub-100ms typeahead possible.",
    },
    {
      term: "Exponential Decay Ranking",
      definition:
        "A time-aware scoring method where a query's score decays exponentially over time: score = base * e^(-lambda * age). Ensures recent queries rank higher than historically popular but stale ones.",
    },
    {
      term: "Delta Trie",
      definition:
        "A small, mutable trie layer that captures real-time trending queries and corrections between daily rebuilds of the main trie. Merged with the base trie at query time to provide fresh suggestions.",
    },
    {
      term: "Zipf's Distribution",
      definition:
        "A power-law distribution where the frequency of an item is inversely proportional to its rank. In typeahead, a small number of popular prefixes account for the majority of queries, making caching highly effective.",
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Standard Trie",
      "Radix Tree",
      "Hash Map",
      "Sorted Array with Binary Search",
    ],
    rows: [
      [
        "**Prefix search**",
        "O(L) native support",
        "O(L) native support",
        "Not supported natively",
        "O(L * log N) with lower_bound",
      ],
      [
        "**Memory usage**",
        "High (node per char)",
        "Medium (compressed chains)",
        "Low (no structure overhead)",
        "Low (contiguous memory)",
      ],
      [
        "**Insert time**",
        "O(L)",
        "O(L) with possible split",
        "O(1) amortized",
        "O(N) shift required",
      ],
      [
        "**Cache friendliness**",
        "Poor (pointer chasing)",
        "Better (fewer nodes)",
        "Poor (hash collisions)",
        "Excellent (contiguous)",
      ],
      [
        "**Top-K at prefix**",
        "Natural fit",
        "Natural fit",
        "Requires separate index",
        "Requires separate index",
      ],
      [
        "**Fuzzy matching**",
        "Possible with edit variants",
        "Possible with edit variants",
        "Requires n-gram index",
        "Not practical",
      ],
      [
        "**Best use case**",
        "Small to medium datasets",
        "Large datasets in memory",
        "Exact match lookups",
        "Static sorted data",
      ],
    ],
  },
  followUps: [
    "How would you implement spell correction alongside typeahead suggestions?",
    "What are the trade-offs between server-side and client-side typeahead for small datasets?",
    "How do you handle offensive or sensitive content in typeahead suggestions?",
    "How would you implement typeahead for a code editor (IDE) versus a web search engine?",
    "What machine learning techniques can improve typeahead suggestion ranking beyond frequency?",
    "How do you A/B test changes to a typeahead system without degrading user experience?",
  ],
  resources: [
    {
      label: "How Google Autocomplete Works (Google Blog)",
      kind: "article",
      note: "Google's explanation of their autocomplete system covering ranking signals, content policies, and real-time updates.",
    },
    {
      label: "System Design Interview - Ch. 13: Design Autocomplete",
      kind: "book",
      note: "Alex Xu's detailed walkthrough of typeahead design covering trie optimization, scaling, and data pipeline architecture.",
    },
    {
      label: "Building a Real-Time Autocomplete System (LinkedIn Engineering)",
      kind: "article",
      note: "LinkedIn's approach to typeahead including personalization, prefix caching, and multi-language support.",
    },
    {
      label: "Tries and Compressed Tries (Advanced Data Structures - MIT OCW)",
      kind: "video",
      note: "MIT lecture covering trie variants, radix trees, and succinct data structures with complexity analysis.",
    },
    {
      label: "Apache Lucene Suggest Module",
      kind: "repo",
      note: "Production-grade autocomplete implementation in Lucene using FSTs (Finite State Transducers) for memory-efficient prefix search.",
    },
  ],
};
