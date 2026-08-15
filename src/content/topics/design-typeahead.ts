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
    "## Capacity Estimation and Back-of-Envelope Math\n\nStart every typeahead design with the arithmetic, because the numbers dictate the architecture. Assume 5 billion searches per day and that each search generates about 4 typeahead requests after debouncing (a 6-character query with a 150ms debounce fires roughly 3-5 requests, not 6). That is 5B * 4 = 20B suggestion requests per day. Dividing by 86,400 seconds gives 20,000,000,000 / 86,400 ≈ 230K QPS average. Peak traffic is typically 3x average, so provision for roughly 700K QPS at peak. For storage: with 100M unique suggestion phrases at an average of 30 bytes each, raw phrase data is about 3 GB; a radix-compressed trie with precomputed top-10 (storing suggestion IDs, not full strings, at each node) lands in the 50-100 GB range -- large for one box but comfortable across 10-20 shards holding 5-10 GB each fully in memory. Key insight: precomputed top-K is what makes 700K QPS feasible -- each read is O(prefix length) pointer hops (typically 2-5) plus returning a stored list, so a single in-memory shard can serve 100K+ QPS, and the edge cache absorbs 70-90% of traffic before it ever reaches a shard. Bandwidth: a response of 10 suggestions at ~50 bytes each plus JSON overhead is about 1 KB, so 230K QPS ≈ 230 MB/s aggregate egress, well within CDN territory. Daily log volume for the offline pipeline: 20B requests * ~100 bytes per log line ≈ 2 TB/day of raw logs to aggregate.",
    "## Ranking and Scoring Algorithms\n\n**Frequency-based ranking** is the simplest: count how many times each query has been searched and sort by count. The problem is that this favors historically popular queries over emerging trends. **Exponential decay** solves this by weighting recent searches more heavily: `score = count * decay^(now - lastSearchTime)`, where decay is a factor like 0.99 per hour. A query searched 1000 times a year ago scores lower than one searched 100 times today. **Personalized ranking** incorporates the user's own search history: if the user frequently searches for 'python programming', typing 'py' should rank this highly even if 'python snake' is globally more popular. The scoring function combines signals: `finalScore = w1 * globalFrequency + w2 * recencyScore + w3 * personalScore + w4 * contextScore`, where context might include the user's current location, time of day, or the page they are on. Weights are tuned via A/B testing and machine learning models. For trending queries, a separate detector identifies queries whose frequency has spiked in the last hour and boosts their score temporarily.",
    "## System Architecture and Scaling\n\nThe typeahead service sits behind a CDN or edge cache for the most common prefixes. When a request arrives, it first checks the edge cache (Redis or Memcached) -- cache hit rates of 70-90% are common because query prefix distributions follow a power law (Zipf's distribution). On cache miss, the request goes to a trie server. The trie is partitioned by prefix range across multiple shards: shard 1 handles prefixes starting with a-f, shard 2 handles g-m, and so on. Each shard holds its portion of the trie entirely in memory for O(L) lookup time where L is the prefix length. For read scaling, each shard is replicated across multiple read replicas in each region. A typical deployment uses 26 shards (one per letter) with 3 replicas each, totaling 78 trie servers per region. At Google's scale, the trie contains billions of entries and requires hundreds of servers, but the architecture remains the same. The API gateway routes requests to the correct shard based on the first character of the prefix, or uses consistent hashing for more granular partitioning.",
    "## Real-Time Updates and Data Pipeline\n\n**Offline pipeline**: Every 24 hours, a MapReduce/Spark job processes search logs to compute global query frequencies, applies filtering (remove offensive content, low-quality queries, spelling corrections), and builds a new immutable trie. This trie is serialized, compressed (typically 40-60% compression with LZ4), and distributed to all trie servers via a pull mechanism. **Online updates**: Between daily rebuilds, trending queries and corrections need to be reflected quickly. A streaming pipeline (Kafka + Flink) processes the real-time search event stream, detects trending queries (frequency spike detection using sliding window counters), and pushes updates to a small mutable trie layer on each server. At query time, results from both the base trie and the delta trie are merged and re-ranked. The delta trie is small (thousands of entries vs billions in the base trie), so it can be safely mutated with a read-write lock. Every few hours, the delta is merged into the base trie to prevent unbounded growth.",
    "## Trie with Precomputed Top-K vs Elasticsearch Prefix Queries\n\nInterviewers often ask why not just use Elasticsearch, so know both sides. Elasticsearch offers `match_phrase_prefix`, `edge_ngram` analyzers, and a completion suggester; the completion suggester is itself an in-memory FST (finite state transducer), which is conceptually the same idea as a compressed trie with weights. Using ES buys you operational maturity, replication, fuzzy matching, and filtering out of the box -- a strong choice for mid-scale products (millions of documents, tens of thousands of QPS). The custom trie service wins at extreme scale: it eliminates the query parsing, scoring, and coordination overhead of a general-purpose engine, guarantees O(prefix length) reads with precomputed top-K, and gives you full control over the memory layout (succinct encodings, memory-mapped snapshots). Common mistake: proposing an edge_ngram index without acknowledging its write amplification -- indexing 'apple' as 'a', 'ap', 'app', 'appl', 'apple' multiplies index size by average word length, which is exactly the same space-for-speed trade-off as precomputed top-K, just hidden inside the search engine. In practice: start with the ES completion suggester, and migrate to a dedicated sharded trie service only when p99 latency or index rebuild cost forces the issue.",
    "## Sharding the Trie and the Hot-Shard Problem\n\nA 50-100 GB trie must be partitioned, and the naive scheme -- one shard per first letter -- creates severe skew because letter frequencies follow a power law (in English, prefixes starting with 's', 't', and 'c' carry far more traffic than 'x' or 'z'). Better: partition by prefix range weighted by observed traffic, so ranges are uneven in the alphabet but even in load (for example a-e, f-l, m-r, s-z might become a-c, d-h, i-r, s, t-z with 's' getting its own shard). The deeper problem is short prefixes: single-character prefixes like 'a' or 's' receive enormous traffic and their top-K lists change slowly, so do not serve them from the trie at all. Key insight: serve 1-2 character prefixes entirely from a Redis hot-prefix cache (at most 26 + 26*26 = 702 entries for lowercase Latin) refreshed every few minutes -- this removes the hottest keys from the shards and turns the hot-shard problem into a trivial cache. For routing, the gateway holds a small in-memory range map (prefix range to shard address) versioned alongside the trie snapshots, so resharding is just publishing a new map. Replicate each shard 3x per region for reads and failure tolerance; because the trie snapshot is immutable, replicas never diverge and any replica can serve any read.",
    "## Filtering, Safety, and Policy Layer\n\nEvery suggestion shown to a user is effectively content your product publishes, so filtering is a first-class component, not an afterthought. Apply filtering at two stages. First, at build time: the trie builder runs the aggregated candidate list through a blocklist (profanity, slurs, illegal content), policy classifiers (violence, adult content, harassment of named individuals), and quality filters (misspellings below a threshold, queries seen from too few distinct users -- which also protects privacy by never suggesting one user's unique query). Second, at serve time: a fast in-memory check (hash set or bloom filter over normalized suggestion text) catches anything that slipped through or was blocklisted after the snapshot was built, and this filter must be hot-reloadable within minutes because trending events surface new abusive queries faster than any daily rebuild. Real-world example: Google removes autocomplete predictions that violate its policies on hate, violence, and personal information, and pairs automated filtering with a user reporting mechanism that feeds the blocklist. Warning: the trending overlay is the most dangerous path -- it is designed to surface queries quickly, which is exactly what coordinated abuse exploits, so trending candidates need stricter thresholds (minimum distinct-user counts, classifier checks) before they are ever shown.",
    "## Multi-Language and Special Considerations\n\n**Multi-language support** requires handling different character sets (Latin, CJK, Arabic, Devanagari), input methods (pinyin for Chinese, romaji for Japanese), and word boundaries. For Chinese typeahead, the trie must support pinyin-to-character mapping: the prefix 'bei' should suggest 'Beijing' in both pinyin and characters. This is implemented as a parallel trie indexed by romanized input that maps to the original-script suggestions. **Fuzzy matching** handles typos: if a user types 'amazn', the system should still suggest 'amazon'. Edit distance computation (Levenshtein distance) is expensive -- O(m*n) per candidate. In practice, use a BK-tree or precomputed edit-distance-1 variants stored in the trie. **Offensive content filtering** runs a bloom filter or hash set check on every suggestion before returning it. The filter is updated daily and can be hot-reloaded. **Privacy** is critical: do not suggest other users' private searches. Only suggest from a curated corpus of public queries, product names, and trending topics.",
  ],
  deepDive: [
    "**Trie memory optimization** is essential for production systems. A naive trie for 1 billion unique queries with an average length of 20 characters would consume roughly 200 GB of memory (20 nodes per query * 10 bytes per node minimum). Compression techniques reduce this dramatically. **Compressed trie (radix tree)**: merge chains of single-child nodes into a single node with a multi-character edge label. This reduces node count by 50-80%. **Array-mapped trie**: instead of hash maps for children, use a sorted array of (character, childPointer) pairs, saving 40-60 bytes per node from hash map overhead. **Succinct tries** (like LOUDS encoding) represent the trie structure in 2 bits per node plus the edge labels, achieving near-information-theoretic minimum space. For a trie with 100 million nodes, LOUDS uses roughly 25 MB for structure alone. **Memory-mapped files**: instead of loading the entire trie into heap memory, memory-map the serialized trie file. The OS pages in only the accessed portions, reducing resident memory. This works well because access patterns are skewed -- most queries hit a small subset of the trie.",
    "**Serving latency breakdown** for a typeahead request shows where to optimize. Total budget: 100ms. Network round-trip (client to edge server): 10-30ms. Edge cache lookup: 1ms. Trie traversal: 0.01ms (trivial -- just following L character pointers). Top-k merge from pre-computed lists: 0.05ms. Personalization re-ranking: 1-5ms. Response serialization and network return: 5-10ms. The bottleneck is rarely the trie itself -- it is the network latency and any machine learning models in the ranking pipeline. This is why edge deployment (running trie servers in CDN points of presence) is critical for achieving sub-50ms total latency. Client-side optimizations also matter: debouncing (only send a request 100-200ms after the user stops typing), request cancellation (abort the previous in-flight request when a new character is typed), and local caching (cache results for previously typed prefixes in the browser's memory).",
    "**Trending detection and real-time ranking** requires a separate analytics pipeline. The detector compares the current query rate against the expected baseline rate (computed from the same time window in previous weeks). If `current_rate > baseline_rate * threshold` (e.g., threshold = 3x), the query is flagged as trending. False positives are managed by requiring the elevated rate to persist for at least 5 minutes. Once a trending query is detected, its score in the trie is temporarily boosted by a multiplier (e.g., 2x) that decays over hours. The implementation uses a sliding window counter per query in Redis: increment on each search, count the window every minute, compare against the precomputed baseline. At scale, this cannot be done for every query -- only for queries exceeding a minimum frequency threshold (e.g., 10 searches per minute). The streaming pipeline (Kafka -> Flink) handles this aggregation, outputting trending query updates every 30 seconds to the trie servers.",
    "**Versioned snapshot deployment** is how the base trie is updated without downtime or partial states. The offline pipeline (query logs -> Kafka -> Spark/Flink aggregation -> trie builder) emits an immutable, self-contained snapshot: serialized trie segments per shard, a manifest with version number, shard-range map, checksums, and build metadata. Snapshots land in an object store (S3/GCS); shard servers poll or receive a push notification, download their segment, memory-map it, warm the hottest prefixes, and then atomically flip a pointer from the old snapshot to the new one -- readers in flight finish on the old version (a simple RCU-style scheme, since snapshots are read-only there is no locking). Key insight: immutability is what makes the whole serving tier simple -- no write path on the hot servers means no locks, no compaction, no replica divergence, and rollback is just re-pointing at the previous version. The manifest version also flows into cache keys (edge cache entries are tagged with the snapshot version), so a bad snapshot can be rolled back without serving stale-poisoned cache entries. Canary the rollout: deploy the new snapshot to one replica per shard, compare suggestion quality metrics (CTR on suggestions, empty-result rate) against the fleet for 15-30 minutes, then roll fleet-wide. In practice: teams keep the last 3-5 snapshot versions on disk so rollback is seconds, not a rebuild.",
    "**Trending delta overlay mechanics** deserve precision because merging two ranked lists correctly is subtle. The overlay holds short-window counts (for example 5-minute and 1-hour sliding windows maintained by Flink) for queries whose recent rate significantly exceeds baseline. At query time the suggestion service fetches top-K from the base trie shard and top-M (M is small, like 3) trending candidates matching the prefix from the overlay, then merges: trending scores must be mapped onto the same scale as base scores, typically by expressing both as estimated near-term probability of the user wanting that completion. A common scheme: `mergedScore = max(baseScore, trendBoost * recentRate / expectedRate)` with the boost decaying over hours so a spike ages out naturally even if the stream lags. Deduplicate by normalized query text (case-folded, whitespace-collapsed, Unicode NFC) because the same query often exists in both structures. Common mistake: letting the overlay bypass the filtering layer -- trending candidates must pass the same blocklist and stricter distinct-user thresholds, otherwise coordinated typing campaigns can push abusive suggestions live within minutes. Size the overlay small (tens of thousands of entries) so it fits in a per-server hash map keyed by prefix; if it grows beyond that, the aggregation thresholds are too loose.",
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
        "Layered architecture: debounced clients hit the edge cache first; misses flow to the suggestion service, which fans out to sharded trie stores with precomputed top-K and merges a real-time trending overlay. The offline pipeline rebuilds versioned trie snapshots from query logs.",
      mermaid: `graph TB
    subgraph CLIENTS["Clients"]
        BROWSER["Browser / Mobile App<br/>debounce 150-200ms<br/>cancel in-flight requests"]
        LCACHE["Client-side prefix cache<br/>filter locally on prefix extension"]
    end
    subgraph EDGE["Edge Layer"]
        CDN["CDN / Edge cache<br/>popular prefixes, TTL 60s<br/>70-90% hit rate on Zipf traffic"]
    end
    subgraph SERVING["Serving Layer"]
        GW["API Gateway / Load Balancer<br/>routes by prefix range"]
        SVC["Suggestion Service<br/>merge, dedupe, re-rank"]
        REDIS["Redis hot-prefix cache<br/>1-2 char prefixes served here"]
        SH1["Trie Shard 1<br/>prefix range a-f<br/>precomputed top-K per node"]
        SH2["Trie Shard 2<br/>prefix range g-m<br/>precomputed top-K per node"]
        SH3["Trie Shard 3<br/>prefix range n-z<br/>precomputed top-K per node"]
    end
    subgraph TREND["Trending Overlay"]
        TSTORE["Short-window counters<br/>5-min sliding windows<br/>delta trie merged at query time"]
    end
    subgraph OFFLINE["Offline Pipeline"]
        LOGS["Query Logs"]
        KAFKA["Kafka"]
        AGG["Aggregation Jobs<br/>Spark / Flink<br/>frequency + decay scoring"]
        BUILDER["Trie Builder<br/>top-K precompute<br/>blocklist filtering"]
        SNAP["Versioned Snapshot Store<br/>blue-green deployment"]
    end
    BROWSER --> LCACHE
    BROWSER -->|"1. GET /suggest?q=prefix"| CDN
    CDN -->|"2. cache miss"| GW
    GW -->|"3."| SVC
    SVC -->|"4a. hot prefix"| REDIS
    SVC -->|"4b. route by range"| SH1
    SVC --> SH2
    SVC --> SH3
    TSTORE -->|"5. merge trending delta"| SVC
    BROWSER -.->|"search events"| LOGS
    LOGS --> KAFKA
    KAFKA --> AGG
    KAFKA -.->|"real-time counts"| TSTORE
    AGG --> BUILDER
    BUILDER --> SNAP
    SNAP -.->|"load new version"| SH1
    SNAP -.-> SH2
    SNAP -.-> SH3`,
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
        "Two-tier update pipeline with daily offline rebuild from search logs and real-time trending detection for the delta trie. Edge labels 1-7 trace the daily offline rebuild stages; R1-R3 trace the real-time trending branch.",
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
    SEARCH -->|"1. log event"| KAFKA
    KAFKA -->|"2. archive"| HDFS
    KAFKA -->|"R1. stream"| FLINK
    HDFS -->|"3. daily batch read"| SPARK
    SPARK -->|"4. aggregate counts"| FILTER
    FILTER -->|"5. clean candidates"| BUILD
    BUILD -->|"6. trie with top-K"| SERIAL
    SERIAL -->|"7. snapshot"| DIST
    FLINK -->|"R2. windowed rates"| TRENDING
    TRENDING -->|"R3. push delta"| DELTA`,
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
      q: "Walk me through the capacity estimation for a Google-scale typeahead system.",
      a: "Start from search volume: 5 billion searches per day. Each search generates roughly 4 suggestion requests after debouncing (not one per keystroke), giving 20 billion requests per day. Divide by 86,400 seconds: about 230K QPS average, and with a 3x peak factor, roughly 700K QPS at peak. Storage: 100 million unique phrases at 30 bytes average is only 3 GB raw, but a trie with precomputed top-10 per node (storing suggestion IDs rather than duplicated strings) grows to roughly 50-100 GB -- too big for one machine, comfortable across 10-20 in-memory shards of 5-10 GB each. Read cost per request is O(prefix length), typically 2-5 pointer hops plus returning a precomputed list, so a single shard sustains 100K+ QPS. The edge cache absorbs 70-90% of traffic because prefixes are Zipf-distributed, so shards see perhaps 70-200K QPS at peak collectively -- easily handled with 3 replicas per shard. Bandwidth: ~1 KB per response means about 230 MB/s aggregate at average load. The offline pipeline must process about 2 TB of logs daily for the rebuild. The takeaway to state explicitly: the math shows the system is read-dominated and cache-friendly, which justifies the immutable-snapshot, precomputed-top-K architecture.",
      followUps: [
        "How does the estimate change if you cannot debounce (e.g., a native keyboard integration)?",
        "How would you size the Redis hot-prefix cache from these numbers?",
      ],
    },
    {
      q: "Why not just use Elasticsearch for autocomplete instead of building a custom trie service?",
      a: "Elasticsearch is often the right answer at mid-scale, and saying so shows judgment. Its completion suggester is backed by an in-memory FST -- conceptually a weighted compressed trie -- and gives you replication, fuzzy matching, filtering, and operational tooling for free. The alternatives within ES, match_phrase_prefix and edge_ngram indexing, are worse for this use case: prefix queries do expensive term expansion at query time, and edge_ngram inflates the index by roughly the average word length because every prefix of every term is indexed (the same space-for-speed trade as precomputed top-K, hidden in the engine). A custom sharded trie service wins when you need extreme scale or tight tail latency: no query parsing or scoring overhead, guaranteed O(prefix length) reads, custom memory layout (succinct encodings, memory-mapped versioned snapshots), and full control over the merge with a trending overlay and personalization layer. It costs you an offline build pipeline, snapshot deployment machinery, and shard routing that ES would otherwise provide. A good answer sequences it: prototype and mid-scale on the ES completion suggester; migrate to a dedicated trie tier when p99 latency, rebuild cost, or index size forces it.",
      followUps: [
        "What does the ES completion suggester use internally and what are its limits?",
        "How would you migrate live traffic from ES to a custom trie tier safely?",
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
      front: "What is the back-of-envelope QPS for a 5B-searches/day typeahead?",
      back: "5B searches * ~4 debounced requests each = 20B requests/day. 20B / 86,400s ≈ 230K QPS average; with a 3x peak factor, ~700K QPS peak. Reads are O(prefix length) thanks to precomputed top-K, and the edge cache absorbs 70-90%, so the shard tier sees only a fraction of this.",
    },
    {
      front: "How do you solve the hot-shard problem for short prefixes?",
      back: "Do not serve 1-2 character prefixes from the trie at all. There are at most 26 + 676 = 702 such lowercase Latin prefixes; keep their top-K lists in a Redis hot-prefix cache refreshed every few minutes. This removes the highest-traffic keys from the shards, leaving traffic-weighted prefix-range partitioning to balance the rest.",
    },
    {
      front: "How are trie snapshots deployed safely to the serving fleet?",
      back: "The builder emits immutable versioned snapshots (segments + manifest with checksums) to object storage. Shards download, memory-map, warm hot prefixes, then atomically flip a pointer -- no locks since snapshots are read-only. Canary one replica per shard on quality metrics; rollback is re-pointing to the previous version. Edge-cache keys carry the snapshot version.",
    },
    {
      front: "Trie service vs Elasticsearch completion suggester -- when each?",
      back: "ES completion suggester (an in-memory weighted FST) is ideal to mid-scale: replication, fuzzy matching, filtering for free. A custom sharded trie wins at extreme scale: O(prefix length) reads without query-engine overhead, custom memory layout, and control over trending/personalization merging -- at the cost of owning the build pipeline and snapshot deployment.",
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
    "**Capacity math**: 5B searches/day * 4 requests each = 20B/day ≈ 230K QPS avg, ~700K peak (3x). 100M phrases: ~3GB raw, 50-100GB as trie with top-K -> 10-20 shards of 5-10GB in memory. ~1KB per response -> ~230MB/s egress. ~2TB/day logs into the rebuild pipeline.",
    "**Hot-shard fix**: 1-2 char prefixes (at most 702 lowercase Latin combos) carry the most traffic but change slowly -- serve them from a Redis hot-prefix cache refreshed every few minutes, never from the trie shards.",
    "**Snapshot deployment**: immutable versioned snapshots in object store; shards download, memory-map, warm, then atomically flip a pointer (RCU-style). Canary one replica per shard on quality metrics; keep last 3-5 versions for instant rollback. Tag edge-cache keys with snapshot version.",
    "**Filtering**: build-time blocklist + classifiers + minimum distinct-user threshold (privacy), plus a hot-reloadable serve-time hash-set/bloom check. Trending overlay needs stricter thresholds -- it is the fastest abuse path.",
    "**Trie vs Elasticsearch**: ES completion suggester = weighted FST, great to mid-scale; edge_ngram inflates index by avg word length. Custom trie tier wins on tail latency, memory layout control, and trending/personalization merge -- but you own the pipeline and deployment machinery.",
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
    "**QPS math**: 5B searches/day * 4 requests = 20B/day; 20B / 86,400s ≈ 230K QPS avg; * 3 peak factor ≈ 700K QPS peak.",
    "**Trie size**: 100M phrases * 30B ≈ 3GB raw; with top-10 IDs per node ≈ 50-100GB; shard into 10-20 * 5-10GB in-memory shards.",
    "**Hot prefixes**: 26 + 26*26 = 702 possible 1-2 char lowercase prefixes -- serve all from Redis, refresh every few minutes, keep them off the shards.",
    "**Snapshot flip**: download -> mmap -> warm -> atomic pointer swap; readers finish on old version; rollback = re-point to previous snapshot.",
    "**Trending merge**: mergedScore = max(baseScore, boost * recentRate/expectedRate), boost decays over hours; dedupe on normalized text; trending must pass filtering.",
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
  animations: [
    {
      title: "Suggestions as you type",
      steps: [
        {
          label: "Prefix index",
          detail: "A trie or an FST maps prefixes to top completions, precomputed with popularity weights.",
        },
        {
          label: "Client debounces",
          detail: "Waits for a short pause so it doesn't query on every keystroke.",
        },
        {
          label: "Query",
          detail: "Prefix sent; the service walks to that node and returns its precomputed top-k.",
        },
        {
          label: "Cached",
          detail: "Popular prefixes are cached at the edge — most traffic is a small set of prefixes.",
        },
        {
          label: "Client-side too",
          detail: "Results for 'ca' let the client filter locally for 'car' without a round trip.",
        },
        {
          label: "Updating",
          detail: "Popularity changes are applied to the index in batches, not per query.",
        },
      ],
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
    "How would the design change for autocomplete over private data (e.g., a user's own documents or emails)?",
    "How do you prevent coordinated abuse from pushing offensive queries into trending suggestions?",
    "How would you shrink the trie to run on-device for offline autocomplete?",
    "What consistency guarantees do suggestion snapshots need across shards and regions?",
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
