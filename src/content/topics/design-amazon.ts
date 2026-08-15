import type { TopicContent } from "../types";

export const designAmazon: TopicContent = {
  quickSummary: [
    "Amazon is an e-commerce platform serving ~300M active customers, shipping ~1.6M packages daily. The system decomposes into microservices: product catalog, search, cart, order processing, payment, inventory, recommendations, and reviews. Each service is independently scaled and deployed.",
    "The product catalog uses a distributed NoSQL store (DynamoDB) for fast key-value reads and an inverted index (Elasticsearch/OpenSearch) for full-text search with TF-IDF and learning-to-rank models. Search must return results in under 200ms even across hundreds of millions of SKUs.",
    "Order processing follows an event-driven, saga-based architecture: place order, reserve inventory, process payment, confirm order, initiate fulfillment. Each step is idempotent and compensatable, allowing rollback on failure without distributed transactions.",
    "Inventory management is one of the hardest subproblems. Distributed locks (Redlock or DynamoDB conditional writes) prevent overselling during flash sales. Reservations use a two-phase approach: soft reserve on add-to-cart with a TTL, hard reserve on order placement.",
    "The recommendation engine accounts for ~35% of revenue. It combines collaborative filtering (users who bought X also bought Y), content-based filtering (product attribute similarity), and real-time session signals to generate personalized product suggestions.",
  ],
  detailed: [
    "## Capacity Estimation: Put Numbers on the Board First\n\nStart every e-commerce design by sizing the problem, because the numbers dictate the architecture. Assume ~300M active customers and ~1.6M packages shipped per day. Work the arithmetic out loud:\n\n- Orders: 1.6M orders/day / 86,400 s/day ≈ **18-20 orders/s average**. Prime Day peaks run ~10x normal and are bursty, so budget **~200-500 orders/s peak** for the checkout path.\n- Reads vs writes: product pages are read-dominated at roughly **100:1**. If each order represents ~20 product-page views plus search queries, that is 1.6M x 20 ≈ 32M product views/day ≈ 370 views/s average, with browse peaks of **50k-100k page views/s** during events (many browsers never buy).\n- Catalog size: ~350M SKUs x ~5 KB of structured metadata ≈ **1.75 TB** of catalog data — small enough to replicate widely; it is the request rate, not the byte count, that forces the caching tier.\n- Cache sizing: the classic 80/20 rule says 20% of SKUs get 80% of traffic. Caching the hot 20% ≈ 70M items x 5 KB ≈ **350 GB** — a modest Redis cluster (e.g., 6 x 64 GB nodes with replicas) absorbs the read storm.\n- Images: 350M SKUs x ~5 images x ~200 KB ≈ **350 TB** in S3, served via CloudFront so origin traffic stays tiny.\n- Orders storage: 1.6M orders/day x ~2 KB ≈ 3.2 GB/day ≈ **~1.2 TB/year** in Aurora/Postgres — trivially small, which is why orders can afford full ACID.\n\nKey insight: the read:write asymmetry (~100:1) means the browse path and the checkout path are effectively two different systems: browse is a caching/CDN problem tolerating staleness, checkout is a low-QPS correctness problem demanding transactions. Never design them with the same consistency model.\n\nCommon mistake: candidates size storage carefully but forget QPS. 1.75 TB of catalog is boring; 100k reads/s against it is the actual problem.",
    "## High-Level Architecture and Service Decomposition\n\nAmazon's architecture is a canonical example of microservices at scale, with over 1,000 independent services communicating via asynchronous messaging and synchronous APIs. The core services include Product Catalog, Search, Cart, Order, Payment, Inventory, Fulfillment, Recommendations, and Reviews. An API Gateway (or BFF layer) routes client requests to the appropriate downstream services, handles authentication, rate limiting, and request shaping. Service-to-service communication uses a mix of synchronous gRPC calls for latency-sensitive paths and asynchronous event buses (Kafka/SQS/SNS) for eventual-consistency workflows like analytics, notifications, and inventory sync. Each service owns its data store, following the database-per-service pattern, which eliminates cross-service schema coupling but introduces challenges around distributed transactions and data consistency. The front end is served through a CDN (CloudFront) with edge caching for static assets and personalized content assembled via edge-side includes or client-side composition.",
    "## Product Catalog and Search\n\nThe product catalog stores hundreds of millions of SKUs with attributes like title, description, price, images, category hierarchy, seller information, and inventory status. DynamoDB provides single-digit-millisecond reads by product ID, while a separate search cluster (OpenSearch) maintains an inverted index over product text fields. When a seller updates a product, an event is published to a change data capture stream, and a search indexer asynchronously updates the inverted index. Search ranking combines text relevance (BM25/TF-IDF), product popularity (sales velocity, click-through rate), seller quality score, and personalization signals. A re-ranking layer using a machine learning model (gradient-boosted trees or a neural ranker) produces the final ordering. Faceted search (filter by brand, price range, rating, Prime eligibility) is implemented via aggregation queries on the inverted index. Autocomplete and query suggestion use a prefix trie backed by a precomputed dictionary of popular queries, updated hourly from search logs.",
    "## Shopping Cart and Order Processing\n\nThe shopping cart is a session-scoped service that persists cart items in a fast key-value store (DynamoDB or Redis) keyed by user ID or session token. Carts must survive server failures and merge gracefully when a guest user logs in (merge guest cart into authenticated cart, preferring higher quantities). Cart operations (add, remove, update quantity) are idempotent by including a client-generated request ID checked against a deduplication window. Order processing follows the saga pattern: the Order Service orchestrates a sequence of steps -- validate cart, reserve inventory, authorize payment, confirm order, and queue for fulfillment. Each step publishes a domain event, and compensating actions (release inventory, void payment authorization) fire if any downstream step fails. The Order Service itself is a state machine with states like CREATED, INVENTORY_RESERVED, PAYMENT_AUTHORIZED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, and RETURNED. SQS dead-letter queues capture events that fail repeatedly for manual investigation.",
    "## Payment Processing and Idempotency\n\nPayment processing requires exactly-once semantics despite network unreliability. Every payment request carries an idempotency key (typically the order ID), and the payment service stores the result of each key in a durable log. If a retry arrives with the same key, the stored result is returned without re-executing the charge. The payment flow involves: (1) authorize the payment method for the order amount, placing a hold on the customer's card, (2) upon order confirmation, capture the authorized amount, (3) if the order is cancelled before capture, void the authorization. For marketplace orders with multiple sellers, the payment is split: Amazon collects the full amount and disburses to each seller minus commission, using a ledger-based accounting system that records every debit and credit as an immutable journal entry. PCI-DSS compliance requires tokenization of card data; the payment service never stores raw card numbers but references tokens from a vault. Fraud detection runs as a synchronous pre-authorization check using ML models trained on historical chargeback data.",
    "## Inventory Management and Fulfillment\n\nInventory is distributed across hundreds of fulfillment centers worldwide. Each center maintains a local inventory count, and a global inventory service aggregates availability by region. The system uses a reservation model: when a customer adds an item to cart, a soft reservation (TTL of 15 minutes) is placed; upon order confirmation, it converts to a hard reservation. Distributed locking via DynamoDB conditional writes (optimistic concurrency with version numbers) or Redis-based Redlock prevents two customers from reserving the last unit simultaneously. During flash sales or Prime Day, the system pre-partitions hot inventory items across multiple lock shards to avoid contention bottlenecks. Fulfillment routing selects the optimal warehouse based on proximity to the customer, current stock levels, shipping cost, and delivery promise. A background reconciliation process continuously compares physical counts with system counts to detect and correct drift caused by returns, damages, or miscounts.",
    "## Named Technology Per Service\n\nAnchor each service to a concrete, defensible technology choice rather than generic boxes. A strong mapping: **Product Catalog** on DynamoDB (key-value reads by ASIN in single-digit ms, auto-partitioned) fronted by a **Redis** product cache; **Search** on Elasticsearch/OpenSearch fed by a CDC pipeline; **Cart** on DynamoDB (the AP workload that literally motivated Dynamo) with a Redis session cache; **Orders and Payments** on Aurora PostgreSQL (ACID, foreign keys, auditable ledger); **Images** on S3 behind CloudFront; **Events** on Kafka (order lifecycle, inventory sync, analytics fan-out) with SQS + dead-letter queues for worker retry semantics; **Recommendations** on a feature store (e.g., SageMaker Feature Store) serving precomputed item-to-item similarities; **Analytics** landing in Redshift via Kafka -> Firehose. Pricing is its own service because price is computed (promotions, dynamic pricing, regional tax), not a static catalog attribute — denormalizing it into search or catalog caches requires an invalidation path.\n\n| Service | Store | Why |\n| --- | --- | --- |\n| Catalog | DynamoDB + Redis | 100:1 reads, key lookup by ASIN, staleness OK |\n| Search | Elasticsearch | inverted index, facets, BM25 + ML re-rank |\n| Cart | DynamoDB | always-writable, LWW/merge, Dynamo heritage |\n| Orders | Aurora Postgres | ACID, low write QPS, audit trail |\n| Inventory | DynamoDB conditional writes | atomic decrement, no oversell |\n| Payments | Postgres ledger + token vault | immutable journal, PCI scope isolation |\n| Images | S3 + CloudFront | 350 TB blobs, edge-cached |\n| Events | Kafka | ordered, replayable order-event log |\n\nIn practice: interviewers reward the *why* column far more than the logo column — every choice should trace back to a workload property (read ratio, consistency need, data shape).",
    "## One Purchase, End to End: Tracing the Order Saga\n\nWalk a single purchase through the system to prove the design hangs together. (1) **Browse**: the client hits CloudFront for images/static assets and the API Gateway for data; the product page is assembled from the Redis product cache (hit rate >95%), falling back to DynamoDB catalog reads on miss. (2) **Search**: the query goes to the Search Service, which runs BM25 retrieval + ML re-ranking on Elasticsearch and returns product IDs hydrated from the catalog cache. (3) **Add to cart**: the Cart Service writes {userId, sku, qty} to DynamoDB with a client-generated request ID for idempotency — no inventory is held yet. (4) **Checkout**: the Checkout/Order Service re-validates price and availability, creates an order row in Aurora in state CREATED, and publishes an OrderCreated event to Kafka. (5) **Saga executes**: orchestration workers consume the event and run the sequence — *reserve inventory* (DynamoDB conditional write: decrement only if stock >= qty), then *authorize/charge payment* (call the external processor with idempotency key = orderId), then *confirm* (order -> CONFIRMED, confirmation email via Notification Service), then *fulfill* (event to the warehouse pipeline, which picks a fulfillment center by proximity, stock, and delivery promise). (6) **Compensation on failure**: if payment is declined after inventory was reserved, the saga runs the compensating action — release the reservation (conditional increment), mark the order CANCELLED, notify the customer. If fulfillment fails post-charge, compensation refunds the payment and releases inventory.\n\nKey insight: the saga trades the atomicity of a distributed transaction for a guarantee that the system always converges to a consistent terminal state (CONFIRMED-and-fulfilled or fully-compensated CANCELLED), which is why every step must be both idempotent and compensatable.\n\nCommon mistake: reserving inventory at add-to-cart time. Carts abandon at ~70%; holding stock for every cart starves real buyers. Reserve at checkout, optionally with a short soft-hold TTL.",
  ],
  deepDive: [
    "## Why the Cart Lives in DynamoDB: the Real Origin Story\n\nThe shopping cart is the reason Dynamo exists — in the 2004-2007 era, Amazon's Oracle-backed cart suffered outages during peak season, and the business insight was brutal: an unavailable cart is lost revenue, while a slightly stale cart is merely an annoyance. The 2007 Dynamo paper explicitly names the shopping cart as the motivating workload for an 'always writable' store: writes must never be rejected, even during network partitions or node failures. Dynamo achieved this with leaderless replication, sloppy quorums with hinted handoff, and vector clocks to detect concurrent versions — pushing conflict resolution to read time. When two divergent cart versions surface (say the user added items from their phone and laptop during a partition), the cart service performs a *semantic merge*: union the item sets and take the max quantity per SKU. The famous side effect is that deleted items can occasionally resurrect after a merge — Amazon accepted this because re-deleting an item is a one-click fix, whereas losing an added item loses a sale.\n\nKey insight: the merge is business-aware, not storage-generic. Last-writer-wins at the storage layer would silently drop items; the union-with-max-quantity merge encodes the product decision 'never lose something the customer meant to buy'.\n\nIn practice: modern DynamoDB hides vector clocks behind the API, but the interview lesson stands — for the cart, choose AP, design an application-level merge, and be able to say which anomaly (item resurrection) you accepted and why.",
    "## Inventory Consistency: Preventing (or Pricing) Oversell\n\nInventory is where the AP-everywhere philosophy stops, and there are three defensible strategies. **Strategy 1 — conditional writes (CP on the decrement):** the reservation is a single atomic DynamoDB conditional write, ConditionExpression 'stock >= :qty', decrementing in the same operation; a losing racer gets ConditionalCheckFailedException and the customer sees 'just sold out'. No distributed lock is required for a single item because the write itself is the linearization point — this is simpler and safer than Redlock and should be your default answer. **Strategy 2 — reservation ledger:** instead of mutating a counter, append reservation rows (orderId, sku, qty, TTL, state=SOFT|HARD) and compute availability as stock minus active reservations; expired soft holds self-release, and the append-only shape gives a natural audit trail. **Strategy 3 — oversell-and-apologize:** for high-supply items, accept orders optimistically against an eventually consistent count and reconcile asynchronously; the rare oversell becomes a cancellation email plus a goodwill credit.\n\nCommon mistake: proposing distributed locks (Redlock) as the first answer. A conditional write gives the same safety in one round trip with no lock-expiry edge cases; locks only enter the picture when a reservation spans multiple items or systems.\n\nKey insight: overselling is a *business* decision dressed as a technical one — Amazon oversells cheap, restockable goods (apologize) but never oversells a flash-sale PS5 (conditional writes), because the cost of the apology differs by orders of magnitude.\n\nReal-world example: airlines run the extreme version of strategy 3 — they deliberately oversell seats because no-show statistics make it profitable, and the 'compensation' (rebooking + voucher) is a priced-in cost.",
    "## Idempotent Payments: Exactly-Once Effects on an At-Least-Once Network\n\nThe network gives you at-least-once delivery, so the payment layer must convert duplicate requests into single charges. The mechanism is an idempotency key — typically the orderId or a per-attempt UUID — sent with every charge request. The payment service does an atomic insert-if-absent of the key into a durable table *before* calling the processor, storing state=IN_PROGRESS; on success it updates to state=SUCCEEDED with the response payload; any retry with the same key reads the record and replays the stored response instead of re-charging. Three failure windows matter: (a) retry arrives while the original is IN_PROGRESS — return 409/retry-later rather than issuing a second processor call; (b) the service crashes after charging but before recording success — on recovery, query the processor by idempotency key (Stripe et al. support this) to resolve the ambiguity, never blind-retry; (c) client retries with a *different* key for the same order — prevent by deriving the key deterministically from the orderId. Retries themselves use exponential backoff with jitter, and the auth/capture split bounds the blast radius: authorization places a hold, capture happens only on order confirmation, and void cancels the hold — so most failures are compensated by voiding an auth, not refunding a settled charge.\n\nKey insight: idempotency must be enforced at every hop that has a side effect — client to order service, order service to payment service, payment service to processor — a single non-idempotent link reintroduces double-charging.\n\nCommon mistake: storing the idempotency key only in a cache with TTL. If the key expires before the retry window closes (e.g., a mobile client retries hours later), the duplicate charge returns; the key store must be as durable as the payment record itself.",
    "## Catalog-to-Search Denormalization Pipeline\n\nSearch documents are deliberately denormalized snapshots of many source-of-truth tables, and keeping them fresh is a pipeline problem. The catalog (DynamoDB), pricing service, inventory service, and reviews service each own a slice of what a search result displays: title/brand/attributes, current price, in-stock flag, star rating. The pipeline: every source emits change events via CDC (DynamoDB Streams, Postgres logical decoding) into Kafka; a *document builder* service consumes them, joins the slices into one flat search document per SKU, and bulk-indexes into Elasticsearch. Ordering and dedup are handled by versioning each document with the source event timestamp and using external versioning on the index request so stale updates are rejected. Full reindexes (mapping changes, ranking-feature additions) run against a shadow index with an alias flip — blue/green for indexes — so a bad build never serves traffic. Freshness SLAs differ per field: price and availability changes should be searchable within seconds (fast lane: partial document update), while description edits can lag minutes (batch lane).\n\nKey insight: denormalization moves the join from query time to write time — you pay with a pipeline and eventual consistency, and you win 10-50ms faceted queries over 350M SKUs that no query-time join could deliver.\n\nCommon mistake: letting services write directly to Elasticsearch. Without the single document-builder chokepoint you get write races between services, no version ordering, and no way to rebuild the index from source when it drifts.\n\nIn practice: teams add a nightly reconciliation job that samples SKUs, recomputes documents from sources, and diffs against the live index — drift detection is the difference between a pipeline you trust and one you don't.",
    "## Flash Sales and Hot Items: Surviving the Stampede\n\nA flash sale inverts the normal load profile: instead of 100M SKUs sharing traffic, one SKU absorbs 100k+ requests/s against maybe 10k units of stock — a hot-partition problem no amount of generic horizontal scaling fixes. The playbook layers defenses: (1) **Token bucket admission control** at the gateway per user and per SKU — the vast majority of requests are rejected cheaply at the edge with a friendly 'high demand' page before touching any datastore. (2) **Request queueing**: admitted checkout attempts enter a FIFO queue (SQS/Kafka) sized near the stock count; a small consumer pool processes them sequentially against inventory, converting an unbounded concurrency problem into bounded throughput — this is the 'virtual waiting room' pattern Ticketmaster and sneaker drops use. (3) **Inventory sharding**: split 10k units into, say, 20 partitions of 500 with independent conditional-write counters so successful reservations don't serialize on one DynamoDB partition key; rebalance leftover stock between shards near sell-out. (4) **Serve the page statically**: the product page for a flash-sale item is pre-rendered and pushed to the CDN with a tiny dynamic 'stock state' endpoint, so 99% of the traffic never reaches origin. (5) **Degrade around the sale**: disable recommendations and reviews on that page, shed non-critical load, and pre-scale the checkout fleet since autoscaling reacts in minutes but the spike arrives in seconds.\n\nKey insight: the goal is not to make the datastore survive 100k writes/s — it is to ensure only ~10k requests (the stock count, plus margin) ever become writes, and everyone else gets a fast, honest rejection.\n\nWarning: fairness matters as much as throughput — without per-user token buckets and bot detection, scalpers' scripts win every unit and the sale damages the brand even though the system 'stayed up'.",
    "Scaling Amazon's search infrastructure to handle peak loads (e.g., Prime Day with 10x normal traffic) requires a multi-layered caching strategy. The first layer is a CDN-level cache for search result pages with stable queries (e.g., 'iPhone 15 case'). The second layer is an application-level cache (Redis cluster) storing serialized search results keyed by normalized query plus filters. The third layer is the OpenSearch cluster itself, which uses in-memory segment caching. To avoid thundering herd on cache expiry, staggered TTLs and probabilistic early recomputation are employed. Index sharding follows a product-category-based scheme so that queries constrained to a category hit only the relevant shards. During indexing, a shadow cluster receives updates first, and once it passes health checks, traffic is gradually shifted via weighted routing. This blue-green indexing approach prevents serving stale or corrupt indices.",
    "The recommendation engine is a complex pipeline blending offline and online components. Offline, a collaborative filtering model (matrix factorization or deep neural network) is trained on the full purchase and browsing history, producing item-to-item similarity matrices and user embedding vectors stored in a feature store. Online, when a user visits a product page, the system retrieves pre-computed similar items, applies real-time session context (recent views, cart contents, time of day), and re-ranks using a lightweight model. The 'Customers who bought this also bought' feature uses item-to-item collaborative filtering with co-purchase frequency normalized by item popularity to avoid recommending universally popular items. A/B testing infrastructure continuously evaluates recommendation algorithms, measuring click-through rate, add-to-cart rate, and downstream purchase conversion. Cold-start for new products is handled by content-based features (category, brand, price range, description embeddings) until sufficient interaction data accumulates.",
    "Handling failure scenarios at Amazon's scale requires designing every service for graceful degradation. If the recommendation service is down, the product page still renders with a static 'popular in this category' fallback. If the payment gateway times out, the order enters a PENDING_PAYMENT state and a retry worker attempts authorization with exponential backoff. Circuit breakers (Hystrix-style) prevent cascading failures: if a downstream service exceeds its error budget, the circuit opens and requests are immediately failed or routed to a fallback. Each service publishes health metrics (latency p99, error rate, throughput) to a centralized monitoring system, and automated alerts trigger runbook-driven remediation. Data durability is ensured through multi-AZ replication for databases and cross-region replication for critical data like orders and payments. The CAP theorem trade-off is navigated carefully: the cart service favors availability (AP) using last-writer-wins conflict resolution, while the inventory service favors consistency (CP) to prevent overselling.",
    "Security and compliance form a critical dimension of the architecture. All inter-service communication is encrypted via mutual TLS, and every request carries a signed JWT with the caller's identity and scopes. PCI-DSS compliance mandates that cardholder data is isolated in a separate, hardened network segment with strict access controls, audit logging, and regular penetration testing. GDPR compliance requires the ability to export and delete a customer's personal data across all services, which is facilitated by a centralized customer data registry that maps data locations. Rate limiting and bot detection at the API Gateway layer protect against credential stuffing and inventory hoarding. DDoS mitigation uses AWS Shield and WAF rules that adapt based on real-time traffic analysis.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Product Search with TF-IDF Ranking",
      source: `#include <cmath>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <sstream>

struct Product {
    std::string id;
    std::string title;
    std::string description;
    double salesRank;     // lower is better
    double avgRating;
};

struct SearchResult {
    std::string productId;
    double score;
    bool operator>(const SearchResult& o) const { return score > o.score; }
};

class ProductSearchIndex {
    // Inverted index: term -> list of (productIndex, termFrequency)
    std::unordered_map<std::string, std::vector<std::pair<int, int>>> invertedIndex;
    std::vector<Product> products;
    int totalDocs = 0;

    std::vector<std::string> tokenize(const std::string& text) {
        std::vector<std::string> tokens;
        std::istringstream stream(text);
        std::string word;
        while (stream >> word) {
            // Lowercase normalization
            std::string lower;
            for (char c : word) {
                if (std::isalnum(c)) lower += std::tolower(c);
            }
            if (!lower.empty()) tokens.push_back(lower);
        }
        return tokens;
    }

public:
    void addProduct(const Product& product) {
        int idx = static_cast<int>(products.size());
        products.push_back(product);
        totalDocs++;

        // Index title (weighted 3x) and description
        std::unordered_map<std::string, int> termFreqs;
        for (const auto& tok : tokenize(product.title)) termFreqs[tok] += 3;
        for (const auto& tok : tokenize(product.description)) termFreqs[tok] += 1;

        for (const auto& [term, freq] : termFreqs) {
            invertedIndex[term].emplace_back(idx, freq);
        }
    }

    // TF-IDF scoring with sales rank and rating boost
    std::vector<SearchResult> search(const std::string& query, int topK = 10) {
        auto queryTerms = tokenize(query);
        std::unordered_map<int, double> scores;

        for (const auto& term : queryTerms) {
            auto it = invertedIndex.find(term);
            if (it == invertedIndex.end()) continue;

            const auto& postings = it->second;
            // IDF = log(N / df)
            double idf = std::log(
                static_cast<double>(totalDocs) / static_cast<double>(postings.size())
            );

            for (const auto& [docIdx, tf] : postings) {
                // TF = 1 + log(tf)
                double tfScore = 1.0 + std::log(static_cast<double>(tf));
                scores[docIdx] += tfScore * idf;
            }
        }

        // Combine TF-IDF with business signals
        std::vector<SearchResult> results;
        results.reserve(scores.size());
        for (const auto& [idx, tfidf] : scores) {
            const auto& p = products[idx];
            // Normalize sales rank (inverse, capped)
            double salesBoost = 1.0 / (1.0 + std::log1p(p.salesRank));
            // Rating boost: 0.8 to 1.2 range
            double ratingBoost = 0.8 + (p.avgRating / 5.0) * 0.4;
            double finalScore = tfidf * salesBoost * ratingBoost;
            results.push_back({p.id, finalScore});
        }

        std::partial_sort(
            results.begin(),
            results.begin() + std::min(topK, static_cast<int>(results.size())),
            results.end(),
            std::greater<SearchResult>()
        );
        if (static_cast<int>(results.size()) > topK) results.resize(topK);
        return results;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Distributed Lock for Inventory Reservation",
      source: `#include <string>
#include <chrono>
#include <vector>
#include <mutex>
#include <unordered_map>
#include <functional>
#include <random>
#include <thread>

// Simulates a Redis-like store for distributed locking (Redlock concept)
class RedisNode {
    std::mutex mu;
    // key -> (lockValue, expiryTime)
    std::unordered_map<std::string, std::pair<std::string,
        std::chrono::steady_clock::time_point>> locks;
public:
    // SET key value NX PX milliseconds
    bool tryAcquire(const std::string& key, const std::string& value,
                    int ttlMs) {
        std::lock_guard<std::mutex> g(mu);
        auto now = std::chrono::steady_clock::now();
        auto it = locks.find(key);
        if (it != locks.end() && it->second.second > now) {
            return false; // Lock held by someone else
        }
        locks[key] = {value, now + std::chrono::milliseconds(ttlMs)};
        return true;
    }

    // Release only if we still own the lock
    bool release(const std::string& key, const std::string& value) {
        std::lock_guard<std::mutex> g(mu);
        auto it = locks.find(key);
        if (it != locks.end() && it->second.first == value) {
            locks.erase(it);
            return true;
        }
        return false;
    }
};

class DistributedLock {
    std::vector<RedisNode*> nodes; // Typically 5 nodes
    int quorum;
    int lockTtlMs;

    std::string generateLockValue() {
        static thread_local std::mt19937 rng(std::random_device{}());
        std::uniform_int_distribution<uint64_t> dist;
        return std::to_string(dist(rng));
    }

public:
    DistributedLock(std::vector<RedisNode*> redisNodes, int ttlMs = 10000)
        : nodes(std::move(redisNodes)), lockTtlMs(ttlMs) {
        quorum = static_cast<int>(nodes.size()) / 2 + 1;
    }

    // Redlock algorithm: acquire lock on majority of nodes
    std::string acquire(const std::string& resourceKey) {
        std::string lockVal = generateLockValue();
        auto start = std::chrono::steady_clock::now();
        int acquired = 0;

        for (auto* node : nodes) {
            if (node->tryAcquire(resourceKey, lockVal, lockTtlMs)) {
                acquired++;
            }
        }

        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - start).count();
        int remainingTtl = lockTtlMs - static_cast<int>(elapsed);

        if (acquired >= quorum && remainingTtl > 0) {
            return lockVal; // Lock acquired successfully
        }

        // Failed to get quorum; release any acquired locks
        for (auto* node : nodes) {
            node->release(resourceKey, lockVal);
        }
        return ""; // Empty string indicates failure
    }

    void release(const std::string& resourceKey, const std::string& lockVal) {
        for (auto* node : nodes) {
            node->release(resourceKey, lockVal);
        }
    }
};

// Inventory reservation using distributed lock
struct InventoryReservation {
    std::string skuId;
    std::string orderId;
    int quantity;
    enum Status { SOFT, HARD, RELEASED } status;
};

class InventoryService {
    DistributedLock& lockService;
    // sku -> available count (in production, backed by DynamoDB)
    std::unordered_map<std::string, int> inventory;
    std::vector<InventoryReservation> reservations;
    std::mutex dataMu;

public:
    InventoryService(DistributedLock& lock) : lockService(lock) {}

    bool reserveInventory(const std::string& sku, const std::string& orderId,
                          int qty) {
        std::string lockKey = "inv_lock:" + sku;
        std::string lockVal = lockService.acquire(lockKey);
        if (lockVal.empty()) return false; // Could not acquire lock

        bool success = false;
        {
            std::lock_guard<std::mutex> g(dataMu);
            auto it = inventory.find(sku);
            if (it != inventory.end() && it->second >= qty) {
                it->second -= qty;
                reservations.push_back({sku, orderId, qty,
                    InventoryReservation::HARD});
                success = true;
            }
        }

        lockService.release(lockKey, lockVal);
        return success;
    }

    void releaseReservation(const std::string& sku, const std::string& orderId,
                            int qty) {
        std::string lockKey = "inv_lock:" + sku;
        std::string lockVal = lockService.acquire(lockKey);
        if (lockVal.empty()) return; // Retry logic would go here

        {
            std::lock_guard<std::mutex> g(dataMu);
            inventory[sku] += qty;
        }
        lockService.release(lockKey, lockVal);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Order State Machine Implementation",
      source: `#include <string>
#include <unordered_map>
#include <vector>
#include <functional>
#include <stdexcept>
#include <chrono>
#include <sstream>

enum class OrderState {
    CREATED,
    INVENTORY_RESERVED,
    PAYMENT_AUTHORIZED,
    CONFIRMED,
    PICKING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURN_REQUESTED,
    RETURNED,
    REFUNDED
};

enum class OrderEvent {
    RESERVE_INVENTORY,
    INVENTORY_RESERVED_OK,
    INVENTORY_RESERVE_FAIL,
    AUTHORIZE_PAYMENT,
    PAYMENT_AUTH_OK,
    PAYMENT_AUTH_FAIL,
    CONFIRM_ORDER,
    START_PICKING,
    SHIP,
    DELIVER,
    CANCEL,
    REQUEST_RETURN,
    COMPLETE_RETURN,
    ISSUE_REFUND
};

struct Transition {
    OrderState from;
    OrderEvent event;
    OrderState to;
    // Compensating action to execute on rollback
    std::function<void(const std::string&)> compensate;
};

struct AuditEntry {
    OrderState from;
    OrderState to;
    OrderEvent event;
    std::chrono::system_clock::time_point timestamp;
};

class OrderStateMachine {
    std::vector<Transition> transitions;
    // orderId -> current state
    std::unordered_map<std::string, OrderState> orders;
    // orderId -> audit trail
    std::unordered_map<std::string, std::vector<AuditEntry>> auditLog;

    const Transition* findTransition(OrderState from, OrderEvent event) const {
        for (const auto& t : transitions) {
            if (t.from == from && t.event == event) return &t;
        }
        return nullptr;
    }

public:
    OrderStateMachine() {
        // Define valid state transitions
        transitions = {
            {OrderState::CREATED, OrderEvent::RESERVE_INVENTORY,
             OrderState::CREATED, nullptr},
            {OrderState::CREATED, OrderEvent::INVENTORY_RESERVED_OK,
             OrderState::INVENTORY_RESERVED, nullptr},
            {OrderState::CREATED, OrderEvent::INVENTORY_RESERVE_FAIL,
             OrderState::CANCELLED, nullptr},

            {OrderState::INVENTORY_RESERVED, OrderEvent::AUTHORIZE_PAYMENT,
             OrderState::INVENTORY_RESERVED, nullptr},
            {OrderState::INVENTORY_RESERVED, OrderEvent::PAYMENT_AUTH_OK,
             OrderState::PAYMENT_AUTHORIZED, nullptr},
            {OrderState::INVENTORY_RESERVED, OrderEvent::PAYMENT_AUTH_FAIL,
             OrderState::CANCELLED,
             [](const std::string& orderId) {
                 // Compensate: release reserved inventory
                 // inventoryService.releaseReservation(orderId);
             }},

            {OrderState::PAYMENT_AUTHORIZED, OrderEvent::CONFIRM_ORDER,
             OrderState::CONFIRMED, nullptr},
            {OrderState::CONFIRMED, OrderEvent::START_PICKING,
             OrderState::PICKING, nullptr},
            {OrderState::PICKING, OrderEvent::SHIP,
             OrderState::SHIPPED, nullptr},
            {OrderState::SHIPPED, OrderEvent::DELIVER,
             OrderState::DELIVERED, nullptr},

            // Cancellation from multiple states
            {OrderState::CREATED, OrderEvent::CANCEL,
             OrderState::CANCELLED, nullptr},
            {OrderState::INVENTORY_RESERVED, OrderEvent::CANCEL,
             OrderState::CANCELLED,
             [](const std::string& orderId) {
                 // Compensate: release inventory
             }},
            {OrderState::PAYMENT_AUTHORIZED, OrderEvent::CANCEL,
             OrderState::CANCELLED,
             [](const std::string& orderId) {
                 // Compensate: release inventory + void payment auth
             }},
            {OrderState::CONFIRMED, OrderEvent::CANCEL,
             OrderState::CANCELLED,
             [](const std::string& orderId) {
                 // Compensate: release inventory + void payment +
                 // cancel fulfillment
             }},

            // Returns flow
            {OrderState::DELIVERED, OrderEvent::REQUEST_RETURN,
             OrderState::RETURN_REQUESTED, nullptr},
            {OrderState::RETURN_REQUESTED, OrderEvent::COMPLETE_RETURN,
             OrderState::RETURNED, nullptr},
            {OrderState::RETURNED, OrderEvent::ISSUE_REFUND,
             OrderState::REFUNDED, nullptr},
        };
    }

    std::string createOrder(const std::string& orderId) {
        orders[orderId] = OrderState::CREATED;
        auditLog[orderId].push_back({
            OrderState::CREATED, OrderState::CREATED,
            OrderEvent::RESERVE_INVENTORY,
            std::chrono::system_clock::now()
        });
        return orderId;
    }

    bool applyEvent(const std::string& orderId, OrderEvent event) {
        auto it = orders.find(orderId);
        if (it == orders.end()) {
            throw std::runtime_error("Order not found: " + orderId);
        }

        OrderState currentState = it->second;
        const Transition* t = findTransition(currentState, event);
        if (!t) {
            return false; // Invalid transition
        }

        OrderState previousState = currentState;
        it->second = t->to;

        // Record audit trail
        auditLog[orderId].push_back({
            previousState, t->to, event,
            std::chrono::system_clock::now()
        });

        return true;
    }

    // Execute compensating actions when saga step fails
    void compensate(const std::string& orderId, OrderEvent failedEvent) {
        auto it = orders.find(orderId);
        if (it == orders.end()) return;

        const Transition* t = findTransition(it->second, failedEvent);
        if (t && t->compensate) {
            t->compensate(orderId);
        }
    }

    OrderState getState(const std::string& orderId) const {
        auto it = orders.find(orderId);
        if (it == orders.end()) {
            throw std::runtime_error("Order not found");
        }
        return it->second;
    }

    const std::vector<AuditEntry>& getAuditTrail(
        const std::string& orderId) const {
        static const std::vector<AuditEntry> empty;
        auto it = auditLog.find(orderId);
        return it != auditLog.end() ? it->second : empty;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Amazon High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered microservices architecture: the checkout write path through the order saga, Kafka, and the fulfillment pipeline is numbered 1-8; the browse/search/add-to-cart read path through caches and Elasticsearch is numbered B1-B8",
      mermaid: `graph TB
    subgraph Clients["Clients"]
        Web["Web Browser"]
        Mobile["Mobile Apps<br/>iOS / Android"]
        Alexa["Alexa / Partner APIs"]
    end
    subgraph Edge["Edge Layer"]
        CDN["CloudFront CDN<br/>images + static assets"]
    end
    subgraph Gateway["Gateway Layer"]
        LB["Load Balancer<br/>AWS ALB / ELB"]
        APIGW["API Gateway<br/>auth, rate limiting, routing"]
    end
    subgraph Services["Service Layer"]
        CatalogSvc["Product Catalog Service"]
        SearchSvc["Search Service"]
        CartSvc["Cart Service"]
        CheckoutSvc["Checkout / Order Service"]
        InvSvc["Inventory Service"]
        PaySvc["Payment Service"]
        PriceSvc["Pricing Service"]
        ReviewSvc["Reviews Service"]
        RecoSvc["Recommendation Service"]
        NotifSvc["Notification Service"]
    end
    subgraph Cache["Cache Layer"]
        ProdCache["Redis Product Cache<br/>hot product pages"]
        CartCache["Redis Cart Cache<br/>active sessions"]
    end
    subgraph Async["Async Processing"]
        Kafka["Kafka<br/>order events topic"]
        SagaWorkers["Order Orchestration<br/>Saga Workers"]
        Fulfill["Warehouse / Fulfillment<br/>Pipeline"]
    end
    subgraph Data["Data Layer"]
        CartDB["DynamoDB Cart Store<br/>born from cart availability needs"]
        OrderDB["Aurora PostgreSQL<br/>orders, ACID"]
        ES["Elasticsearch<br/>product search index"]
        S3["S3<br/>product images"]
        DWH["Redshift<br/>data warehouse"]
    end
    subgraph External["External"]
        PayGW["Payment Processors<br/>Visa, Stripe, banks"]
    end
    Web --> CDN
    Mobile --> CDN
    Web --> LB
    Mobile --> LB
    Alexa --> LB
    CDN --> S3
    LB --> APIGW
    APIGW -->|"B1. search query"| SearchSvc
    APIGW -->|"B3. product page"| CatalogSvc
    APIGW -->|"B6. add to cart"| CartSvc
    APIGW -->|"1. place order"| CheckoutSvc
    APIGW --> ReviewSvc
    APIGW --> RecoSvc
    SearchSvc -->|"B2. query index"| ES
    CatalogSvc -->|"B4. cache read"| ProdCache
    CatalogSvc -->|"B5. fetch price"| PriceSvc
    CartSvc -->|"B7. session cache"| CartCache
    CartSvc -->|"B8. persist cart"| CartDB
    CheckoutSvc -->|"2. reserve inventory"| InvSvc
    CheckoutSvc -->|"3. authorize payment"| PaySvc
    CheckoutSvc -->|"5. persist order"| OrderDB
    CheckoutSvc -->|"6. publish OrderPlaced"| Kafka
    PaySvc -->|"4. charge"| PayGW
    Kafka -->|"7. order events"| SagaWorkers
    Kafka --> NotifSvc
    Kafka --> DWH
    SagaWorkers --> InvSvc
    SagaWorkers --> PaySvc
    SagaWorkers -->|"8. queue fulfillment"| Fulfill`,
    },
    {
      title: "Order Processing Saga Flow",
      kind: "sequence",
      caption:
        "Saga orchestration for order placement with compensating actions on failure",
      mermaid: `sequenceDiagram
    participant C as Customer
    participant OS as Order Service
    participant IS as Inventory Service
    participant PS as Payment Service
    participant FS as Fulfillment Service
    participant NS as Notification Service

    C->>OS: Place Order
    OS->>OS: Create Order CREATED
    OS->>IS: Reserve Inventory
    alt Inventory Available
        IS-->>OS: Reserved OK
        OS->>OS: State INVENTORY_RESERVED
        OS->>PS: Authorize Payment
        alt Payment Authorized
            PS-->>OS: Auth OK
            OS->>OS: State CONFIRMED
            OS->>FS: Queue Fulfillment
            OS->>NS: Send Confirmation Email
            FS-->>OS: Shipped
            OS->>NS: Send Shipping Notification
        else Payment Failed
            PS-->>OS: Auth Failed
            OS->>IS: Release Inventory
            OS->>OS: State CANCELLED
            OS->>NS: Send Cancellation Email
        end
    else Out of Stock
        IS-->>OS: Reserve Failed
        OS->>OS: State CANCELLED
        OS->>NS: Send Out of Stock Email
    end`,
    },
    {
      title: "Order State Machine",
      kind: "state",
      caption:
        "All valid order states and transitions including cancellation and returns",
      mermaid: `flowchart TD
    CREATED["CREATED"] --> |Inventory Reserved| INV_RESERVED["INVENTORY RESERVED"]
    CREATED --> |Reserve Failed| CANCELLED["CANCELLED"]
    INV_RESERVED --> |Payment Authorized| PAY_AUTH["PAYMENT AUTHORIZED"]
    INV_RESERVED --> |Payment Failed| CANCELLED
    INV_RESERVED --> |User Cancels| CANCELLED
    PAY_AUTH --> |Confirmed| CONFIRMED["CONFIRMED"]
    PAY_AUTH --> |User Cancels| CANCELLED
    CONFIRMED --> |Picking Started| PICKING["PICKING"]
    CONFIRMED --> |User Cancels| CANCELLED
    PICKING --> |Shipped| SHIPPED["SHIPPED"]
    SHIPPED --> |Delivered| DELIVERED["DELIVERED"]
    DELIVERED --> |Return Requested| RETURN_REQ["RETURN REQUESTED"]
    RETURN_REQ --> |Return Completed| RETURNED["RETURNED"]
    RETURNED --> |Refund Issued| REFUNDED["REFUNDED"]`,
    },
    {
      title: "Inventory Reservation Network",
      kind: "network",
      caption:
        "Distributed lock and reservation flow across fulfillment centers",
      mermaid: `graph LR
    CartSvc["Cart Service"] --> |Soft Reserve TTL 15min| InvSvc["Inventory Service"]
    OrderSvc["Order Service"] --> |Hard Reserve| InvSvc
    InvSvc --> LockMgr["Distributed Lock Manager"]
    LockMgr --> R1["Redis Node 1"]
    LockMgr --> R2["Redis Node 2"]
    LockMgr --> R3["Redis Node 3"]
    LockMgr --> R4["Redis Node 4"]
    LockMgr --> R5["Redis Node 5"]
    InvSvc --> FC1["Fulfillment Center East"]
    InvSvc --> FC2["Fulfillment Center West"]
    InvSvc --> FC3["Fulfillment Center Central"]
    FC1 --> InvDB1["Local Inventory DB"]
    FC2 --> InvDB2["Local Inventory DB"]
    FC3 --> InvDB3["Local Inventory DB"]
    InvSvc --> GlobalAgg["Global Availability Aggregator"]`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the product search system for Amazon?",
      a: "The search system uses an inverted index (OpenSearch/Elasticsearch) built from the product catalog. When a seller creates or updates a product, a change data capture event triggers asynchronous index updates. The query pipeline has multiple stages: query parsing and spell correction, retrieval using BM25/TF-IDF against the inverted index, filtering by facets (category, price range, Prime eligibility), and a re-ranking phase using a machine learning model that incorporates click-through rates, conversion rates, and personalization signals. Autocomplete is powered by a prefix trie populated from popular search queries. For scalability, the index is sharded by product category so queries constrained to a category only hit relevant shards. Caching at both the CDN level (for identical queries) and application level (Redis, with normalized query keys) reduces load on the search cluster during peak traffic.",
      followUps: [
        "How would you handle typo correction and fuzzy matching?",
        "How do you prevent search result manipulation by sellers?",
        "How would you implement personalized search ranking?",
      ],
    },
    {
      q: "How does the order processing saga handle partial failures?",
      a: "The order saga uses an orchestrator pattern where the Order Service coordinates each step sequentially: reserve inventory, authorize payment, confirm order, and queue fulfillment. Each step is idempotent, meaning retrying the same step with the same idempotency key produces the same result without side effects. If a step fails, the orchestrator executes compensating actions for all previously completed steps in reverse order. For example, if payment authorization fails after inventory is reserved, the compensating action releases the reserved inventory. The saga state is persisted in a durable store so that if the orchestrator itself crashes, it can resume from the last completed step upon restart. Dead-letter queues capture events that fail after exhausting retries, and an operations dashboard flags these for manual investigation. This approach avoids distributed transactions (2PC) which would be too slow and fragile across microservices.",
      followUps: [
        "What happens if the compensating action itself fails?",
        "How do you ensure idempotency across all saga steps?",
        "Why choose orchestration over choreography for this saga?",
      ],
    },
    {
      q: "How do you prevent overselling during a flash sale like Prime Day?",
      a: "Overselling prevention requires strong consistency on inventory counts. The primary mechanism is a distributed lock using the Redlock algorithm across multiple Redis nodes: before decrementing inventory, the service acquires a lock on the specific SKU, checks availability, decrements, and releases the lock. For hot items during flash sales, a single lock becomes a bottleneck, so the inventory is pre-sharded: if 10,000 units are available, they are split across 10 virtual partitions of 1,000 each, and each lock only covers one partition. This allows 10 concurrent reservations without contention. Additionally, DynamoDB conditional writes provide a database-level safeguard: the write includes a condition expression that the quantity must be greater than or equal to the requested amount, and the write atomically decrements. If two concurrent writes race, one will fail the condition check. A queue-based approach can also be used for extremely hot items, where all purchase requests enter a FIFO queue and a single consumer processes them sequentially, guaranteeing no oversell at the cost of higher latency.",
      followUps: [
        "How do you handle the case where a lock expires before the operation completes?",
        "What is the trade-off between lock granularity and contention?",
        "How would you implement a waitlist when items sell out?",
      ],
    },
    {
      q: "How does Amazon's recommendation engine work at scale?",
      a: "The recommendation engine combines offline batch processing with real-time serving. Offline, collaborative filtering models (item-to-item using co-purchase data, user-to-item using matrix factorization) are trained on the full interaction history and produce precomputed similarity matrices and user embedding vectors stored in a feature store. Online serving retrieves candidate items from the precomputed sets and applies a real-time re-ranking model that incorporates the user's current session signals: recent page views, cart contents, time of day, and device type. The item-to-item collaborative filtering normalizes co-purchase frequency by each item's overall popularity to avoid recommending universally purchased items like batteries. Cold-start for new products is handled by content-based features: category, brand, price range, and text embedding similarity to established products. The system uses A/B testing extensively, running hundreds of concurrent experiments measuring click-through rate, add-to-cart rate, and purchase conversion to continuously improve recommendation quality.",
      followUps: [
        "How do you handle the filter bubble problem in recommendations?",
        "How would you incorporate real-time browsing signals?",
        "What metrics determine if a recommendation algorithm is better?",
      ],
    },
    {
      q: "How would you design the shopping cart service for high availability?",
      a: "The cart service stores cart data in a distributed key-value store (DynamoDB or Redis) keyed by user ID for authenticated users and session token for guests. High availability is achieved by multi-AZ replication with the cart service favoring availability over consistency (AP in CAP theorem), following the approach described in Amazon's Dynamo paper. When a guest user logs in, the system merges the guest cart with the authenticated cart, using a last-writer-wins strategy with a bias toward higher quantities to avoid losing items the customer intended to buy. All cart operations (add, remove, update quantity) are idempotent by including a client-generated request ID; the server maintains a deduplication window (e.g., 5 minutes in Redis) to detect retries. The cart also maintains soft inventory reservations with a 15-minute TTL to give users confidence that items will be available at checkout, though these reservations are best-effort and do not guarantee availability. Cart data is kept lean (just SKU IDs and quantities), with product details fetched at render time from the catalog service to ensure prices and availability are always current.",
      followUps: [
        "How do you handle cart merging conflicts?",
        "What happens when a carted item goes out of stock?",
        "How would you implement a saved-for-later feature?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for this system.",
      a: "Anchor on two published numbers: ~300M active customers and ~1.6M packages/day. Orders: 1.6M / 86,400s gives roughly 18-20 orders/s average; Prime Day runs ~10x with bursts, so design the checkout path for 200-500 orders/s. Reads dominate: with ~20 product views per order plus pure browsers, product-page traffic is on the order of tens of thousands of reads/s at peak — call the read:write ratio 100:1. Storage: 350M SKUs at ~5KB of metadata is only ~1.75TB, so the catalog fits comfortably in a replicated NoSQL store; the challenge is QPS, not bytes. Cache sizing with the 80/20 rule: hot 20% of SKUs is ~70M items x 5KB = ~350GB, a mid-size Redis cluster. Images: 350M SKUs x 5 images x 200KB = ~350TB in S3 behind a CDN. Orders: 1.6M/day x 2KB = ~1.2TB/year, tiny enough to justify a fully ACID relational store. The conclusion to state explicitly: browse and checkout are different systems — browse is a high-QPS caching problem tolerating staleness; checkout is a low-QPS transactional problem demanding correctness.",
      followUps: [
        "How would the numbers change for a flash-sale-heavy business like a sneaker marketplace?",
        "How do you capacity-plan for a 10x spike that lasts only 48 hours?",
        "Which of these estimates would you validate first with real telemetry?",
      ],
    },
    {
      q: "Why is the shopping cart in DynamoDB but orders in a relational database?",
      a: "Because the two workloads sit at opposite ends of the CAP trade-off. The cart must be always-writable: Amazon's own Dynamo paper cites the shopping cart as the motivating workload — a customer unable to add an item is lost revenue, while a briefly inconsistent cart is a minor annoyance. So the cart uses an AP store (Dynamo/DynamoDB) with leaderless replication and application-level conflict resolution: on divergent versions, union the items and take max quantity per SKU, accepting the rare resurrected-deleted-item anomaly. Orders are the opposite: low write volume (~20-500/s), but every row is money — they need atomic multi-row transactions (order + order_items + ledger entries), foreign-key integrity, and a queryable audit trail, which is exactly what Aurora/PostgreSQL provides. The volume math makes this free: ~1.2TB of orders per year is trivial for a relational store. The general principle to articulate: choose consistency per workload, not per company — the same page load can touch an AP cart and a CP inventory counter, and that is correct design, not inconsistency.",
      followUps: [
        "What anomalies does the cart's eventual consistency expose to users?",
        "Could you build the cart on Postgres with high availability instead?",
        "Where else in this design would you insist on strong consistency?",
      ],
    },
    {
      q: "How do you keep the search index consistent with the catalog, pricing, and inventory data?",
      a: "Treat the search document as a denormalized materialized view maintained by a CDC pipeline. Each source of truth — catalog (DynamoDB Streams), pricing and reviews (Postgres logical decoding or outbox events) — publishes change events to Kafka. A single document-builder service consumes them, assembles one flat document per SKU, and bulk-writes to Elasticsearch using external versioning (source event timestamp as version) so out-of-order or duplicate events cannot regress a document. Different fields get different freshness lanes: price and availability updates take a fast partial-update path with seconds-level SLA; description or attribute edits can batch with minutes-level lag. Schema or ranking changes are handled by building a shadow index and flipping an alias — blue/green for indexes — so a bad rebuild never serves traffic. Finally, run a reconciliation job that periodically samples SKUs, recomputes documents from the sources, and diffs against the live index to catch silent drift. The key point: never let services write to the index directly; the single builder is what makes the index rebuildable and its ordering enforceable.",
      followUps: [
        "How do you reindex 350M documents without downtime?",
        "How would you handle a poison event that repeatedly crashes the document builder?",
        "Should in-stock status live in the search index at all, or be checked at render time?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Which consistency model is most appropriate for Amazon's shopping cart service?",
      options: [
        "Strong consistency with distributed transactions",
        "Eventual consistency with last-writer-wins conflict resolution",
        "Linearizable consistency with Paxos consensus",
        "Causal consistency with vector clocks",
      ],
      answerIndex: 1,
      explanation:
        "Amazon's Dynamo paper established that the cart service should favor availability (AP). Eventual consistency with last-writer-wins ensures the cart is always writable even during network partitions, and losing a rare cart update is preferable to the cart being unavailable.",
    },
    {
      q: "In the order processing saga, what should happen if payment authorization fails after inventory has been reserved?",
      options: [
        "Retry payment indefinitely until it succeeds",
        "Execute a compensating action to release the reserved inventory",
        "Keep the inventory reserved and wait for manual intervention",
        "Roll back using a distributed two-phase commit",
      ],
      answerIndex: 1,
      explanation:
        "The saga pattern uses compensating actions instead of distributed transactions. When payment fails, the orchestrator triggers the compensating action for the inventory step (release reservation) and moves the order to CANCELLED state.",
    },
    {
      q: "Why does the Redlock algorithm require acquiring locks on a majority (quorum) of Redis nodes?",
      options: [
        "To improve write throughput across the cluster",
        "To ensure only one client holds the lock even if a minority of nodes fail",
        "To distribute the lock data evenly across nodes",
        "To reduce memory usage on individual nodes",
      ],
      answerIndex: 1,
      explanation:
        "A quorum (N/2 + 1) ensures mutual exclusion: two clients cannot both acquire majority locks simultaneously because their majorities must overlap in at least one node. This provides safety even when a minority of Redis nodes crash or become unreachable.",
    },
    {
      q: "What is the primary reason Amazon's product search uses a two-phase retrieval-then-reranking approach?",
      options: [
        "To reduce the index size",
        "To first narrow candidates cheaply with BM25, then apply expensive ML ranking on a small set",
        "To support different search languages",
        "To bypass the need for an inverted index",
      ],
      answerIndex: 1,
      explanation:
        "BM25/TF-IDF retrieval is computationally cheap and can scan millions of documents quickly, producing a candidate set of hundreds. The expensive ML re-ranking model (which considers click data, personalization, etc.) then only needs to score this small candidate set, making the pipeline both fast and high-quality.",
    },
  ],
  flashcards: [
    {
      front: "What is the saga pattern in distributed systems?",
      back: "A saga is a sequence of local transactions where each step has a compensating action. If any step fails, previously completed steps are undone by executing their compensating actions in reverse order, providing atomicity without distributed transactions.",
    },
    {
      front: "How does Redlock achieve distributed mutual exclusion?",
      back: "Redlock acquires a lock on a majority (N/2 + 1) of independent Redis nodes with a TTL. If the quorum is achieved before the TTL expires, the lock is granted. Two clients cannot both achieve quorum simultaneously because their majorities must overlap.",
    },
    {
      front: "What is a soft reservation vs hard reservation in inventory?",
      back: "A soft reservation is a temporary hold (e.g., 15-minute TTL) placed when an item is added to cart, giving the user time to check out. A hard reservation is a permanent decrement applied when the order is confirmed, guaranteeing the item for fulfillment.",
    },
    {
      front: "Why does Amazon use eventual consistency for the cart?",
      back: "The cart prioritizes availability over consistency (AP in CAP). A briefly stale cart is acceptable, but an unavailable cart means lost sales. Last-writer-wins conflict resolution handles concurrent updates, and the system biases toward keeping items rather than dropping them.",
    },
    {
      front: "What is idempotency in payment processing?",
      back: "An idempotent payment operation produces the same result regardless of how many times it is called with the same idempotency key. The payment service stores results keyed by idempotency key (e.g., order ID), returning the stored result on retries instead of charging again.",
    },
    {
      front: "How does TF-IDF work in product search?",
      back: "TF (Term Frequency) measures how often a term appears in a product listing. IDF (Inverse Document Frequency) measures how rare the term is across all listings. TF-IDF = TF x IDF, ranking products higher when they contain terms that are frequent in the listing but rare overall.",
    },
    {
      front: "What is item-to-item collaborative filtering?",
      back: "Instead of finding similar users, item-to-item CF computes similarity between products based on co-purchase patterns. For product A, it finds products frequently bought together with A, normalized by each product's overall popularity to avoid recommending universally popular items.",
    },
    {
      front: "What is the database-per-service pattern?",
      back: "Each microservice owns its private data store, and no other service can access it directly. Services communicate only via APIs or events. This eliminates schema coupling and allows independent scaling, but introduces challenges around cross-service queries and distributed transactions.",
    },
    {
      front: "How does a DynamoDB conditional write prevent overselling?",
      back: "The decrement carries a condition expression (stock >= requested qty) evaluated atomically with the write. Concurrent racers serialize at the storage layer; the loser receives ConditionalCheckFailedException and the customer sees 'sold out'. No distributed lock is needed for a single-item reservation.",
    },
    {
      front: "Why did Amazon build Dynamo for the shopping cart?",
      back: "Peak-season outages of the relational cart cost sales, and an unavailable cart is worse than a stale one. Dynamo made the cart always-writable via leaderless replication, sloppy quorums, and read-time conflict resolution — the 2007 paper names the cart as the motivating workload.",
    },
    {
      front: "What is the token bucket pattern in flash sales?",
      back: "An admission-control rate limiter at the gateway: each user/SKU bucket holds tokens refilled at a fixed rate; a request without a token is rejected cheaply at the edge. It converts a 100k req/s stampede into a bounded trickle before any datastore is touched.",
    },
    {
      front: "What is CDC (change data capture) and why does search need it?",
      back: "CDC streams every committed change from a source database (DynamoDB Streams, Postgres logical decoding) as ordered events. The search pipeline consumes CDC via Kafka to rebuild denormalized Elasticsearch documents, keeping the index a derived, rebuildable view of the sources of truth.",
    },
  ],
  exercises: [
    "Design a cart merging algorithm: given a guest cart and an authenticated user cart, write logic that merges them correctly. Handle conflicts where the same SKU appears in both carts (pick higher quantity). Consider edge cases like items that went out of stock, price changes, and maximum quantity limits.",
    "Implement a simplified order saga orchestrator that coordinates three steps (reserve inventory, authorize payment, confirm order). Each step should be idempotent and have a compensating action. Simulate failures at each step and verify that compensating actions execute correctly in reverse order.",
    "Build a product search ranking pipeline: create an inverted index from a set of product listings, implement BM25 scoring, and add a re-ranking layer that boosts results based on sales rank and average rating. Compare the ranking quality with and without the re-ranking layer.",
    "Design a flash-sale inventory system that can handle 100,000 concurrent purchase requests for a single item with 1,000 units available. Implement inventory sharding (split 1,000 units across 10 partitions) and demonstrate that no overselling occurs under concurrent access.",
    "Implement a payment idempotency layer: create a service that accepts payment requests with idempotency keys, stores results in a durable log, and correctly handles retries, concurrent requests with the same key, and key expiration after a configurable window.",
  ],
  revisionNotes: [
    "Amazon's architecture uses 1,000+ microservices following database-per-service pattern with async event bus (Kafka/SQS) for cross-service communication",
    "Product search uses inverted index (OpenSearch) with BM25 retrieval followed by ML re-ranking incorporating click-through rates, conversion, and personalization",
    "Shopping cart favors availability (AP) using DynamoDB/Redis with last-writer-wins conflict resolution, as described in the Amazon Dynamo paper",
    "Order processing uses the saga pattern with orchestration: each step is idempotent and has a compensating action for rollback on failure",
    "Payment idempotency is achieved by storing results keyed by idempotency key (order ID); retries return stored results without re-charging",
    "Inventory uses soft reservations (TTL on cart add) and hard reservations (on order confirm) with distributed locks (Redlock or DynamoDB conditional writes)",
    "Flash sale scaling: pre-shard hot inventory across multiple lock partitions to reduce contention from a single-lock bottleneck",
    "Recommendations combine offline collaborative filtering (co-purchase item-to-item similarity) with online re-ranking using real-time session signals",
    "Circuit breakers prevent cascading failures; each service has a fallback (e.g., static popular items if recommendation service is down)",
    "Scale numbers: ~300M active customers, ~1.6M packages/day, sub-200ms search latency, 10x traffic spikes during Prime Day",
    "Capacity math: 1.6M orders/day ~= 18-20 orders/s average, 200-500/s Prime-Day peak; read:write ~100:1 on product pages; hot-20% catalog cache ~= 350GB Redis",
    "Cart merge is semantic, not LWW: union item sets, max quantity per SKU; accepts rare resurrected-deleted-item anomaly to never lose an added item",
    "Search index is a denormalized materialized view: CDC (DynamoDB Streams/outbox) -> Kafka -> single document builder -> Elasticsearch with external versioning; blue/green alias flip for reindexes",
    "Payment idempotency record has states (IN_PROGRESS/SUCCEEDED); on crash-after-charge, query the processor by key to resolve — never blind-retry; key store must be durable, not a TTL cache",
    "Flash sale playbook: token buckets at the edge -> FIFO queue sized near stock -> sharded inventory counters -> pre-rendered CDN page -> degrade non-critical features",
    "Overselling is a business choice: conditional writes (never oversell scarce items) vs oversell-and-apologize (cheap restockable goods) vs reservation ledger (auditable holds with TTL)",
  ],
  cheatSheet: [
    "Product Catalog: DynamoDB for key-value reads, OpenSearch for full-text search with facets",
    "Cart: Redis/DynamoDB, keyed by userId or sessionToken, AP model with LWW conflict resolution",
    "Order Saga: CREATED -> INVENTORY_RESERVED -> PAYMENT_AUTHORIZED -> CONFIRMED -> SHIPPED -> DELIVERED",
    "Compensating Actions: release inventory, void payment auth, cancel fulfillment (executed in reverse on failure)",
    "Idempotency: every write operation carries a client-generated idempotency key; results are stored and replayed on retry",
    "Inventory Lock: Redlock across 5 Redis nodes, quorum = 3, with TTL to prevent deadlocks",
    "Flash Sale: shard inventory into N partitions, each with its own lock, to allow N concurrent reservations",
    "Search Pipeline: query parsing -> BM25 retrieval -> facet filtering -> ML re-ranking -> caching",
    "Recommendations: offline item-to-item CF + online session re-ranking; ~35% of revenue attributed to recommendations",
    "Failure Handling: circuit breakers, dead-letter queues, graceful degradation with static fallbacks, multi-AZ replication",
    "Numbers: 300M customers | 1.6M orders/day (~20/s avg, 200-500/s peak) | 100:1 read:write | 350GB hot cache | 350TB images in S3",
    "Tech map: Catalog=DynamoDB+Redis | Search=Elasticsearch | Cart=DynamoDB (AP) | Orders=Aurora Postgres (CP) | Events=Kafka | Images=S3+CloudFront",
    "Oversell prevention: DynamoDB conditional write 'stock >= qty' is the default answer — atomic, no lock, loser gets ConditionalCheckFailed",
    "Cart merge rule: union items, max(qty) per SKU; deleted items may resurrect — accepted trade-off from the Dynamo paper",
    "Payment safety: idempotency key = f(orderId), durable insert-if-absent before charging, replay stored result on retry; auth -> capture -> void lifecycle",
    "Hot item: edge token bucket -> waiting-room queue -> sharded counters; only ~stock-count requests ever become writes",
  ],
  glossary: [
    {
      term: "Saga Pattern",
      definition:
        "A design pattern for managing distributed transactions as a sequence of local transactions, each with a compensating action that undoes its effect if a later step fails.",
    },
    {
      term: "Idempotency Key",
      definition:
        "A unique identifier (often a UUID or order ID) sent with a request so that retrying the same request produces the same result without duplicate side effects.",
    },
    {
      term: "Redlock",
      definition:
        "A distributed lock algorithm by Redis that acquires locks on a majority of independent Redis nodes to ensure mutual exclusion even during node failures.",
    },
    {
      term: "Inverted Index",
      definition:
        "A data structure mapping each unique term to the list of documents (products) containing that term, enabling fast full-text search retrieval.",
    },
    {
      term: "BM25",
      definition:
        "A probabilistic ranking function used in information retrieval that scores documents based on term frequency, inverse document frequency, and document length normalization.",
    },
    {
      term: "Collaborative Filtering",
      definition:
        "A recommendation technique that predicts user preferences based on the behavior of similar users (user-based) or similar items (item-based) using historical interaction data.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A stability pattern that monitors failures to a downstream service and, after exceeding a threshold, short-circuits requests to a fallback instead of overwhelming the failing service.",
    },
    {
      term: "Conditional Write",
      definition:
        "A write that succeeds only if a server-evaluated condition holds (e.g., DynamoDB ConditionExpression 'stock >= qty'), making check-and-update atomic and eliminating the need for a separate lock in single-item reservations.",
    },
    {
      term: "Change Data Capture (CDC)",
      definition:
        "A technique that streams every committed change from a database (via DynamoDB Streams, binlog, or logical decoding) as ordered events, used to keep derived views like search indexes and caches in sync with the source of truth.",
    },
    {
      term: "Hot Partition",
      definition:
        "A shard or partition key receiving disproportionate traffic (e.g., one flash-sale SKU), overwhelming its node while the rest of the cluster idles; mitigated by key sharding, caching, and admission control.",
    },
    {
      term: "Token Bucket",
      definition:
        "A rate-limiting algorithm where each request consumes a token from a bucket refilled at a fixed rate; allows short bursts up to bucket capacity while enforcing an average rate, used for per-user and per-SKU admission control.",
    },
    {
      term: "Compensating Action",
      definition:
        "The semantic undo for a completed saga step — release a reservation, void a payment authorization, issue a refund — executed in reverse order when a later step fails, restoring business consistency without a distributed rollback.",
    },
    {
      term: "Denormalization",
      definition:
        "Duplicating data from multiple sources of truth into one read-optimized document or table (e.g., the Elasticsearch product document combining catalog, price, rating, and stock), trading write-time pipeline complexity for fast reads.",
    },
  ],
  animations: [
    {
      title: "Checkout without overselling",
      steps: [
        {
          label: "Cart",
          detail: "Held per user; not a reservation — stock is not held while browsing.",
        },
        {
          label: "Checkout begins",
          detail: "Availability re-checked, because it may have changed since the item was added.",
        },
        {
          label: "Reserve atomically",
          detail: "`UPDATE inventory SET qty = qty - 1 WHERE sku = ? AND qty > 0`, with the affected row count checked.",
        },
        {
          label: "Payment",
          detail: "Charged with an idempotency key, so a retry can't double-charge.",
        },
        {
          label: "Payment fails",
          detail: "Compensate by releasing the reservation — a saga, since payment and inventory are separate services.",
        },
        {
          label: "Order placed",
          detail: "An `OrderPlaced` event fans out to fulfilment, email, and analytics.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "DynamoDB",
      "PostgreSQL",
      "OpenSearch",
      "Redis",
    ],
    rows: [
      [
        "Best Use Case",
        "Product catalog, cart, session data",
        "Orders, payments, transactional data",
        "Full-text product search, analytics",
        "Caching, distributed locks, cart sessions",
      ],
      [
        "Consistency Model",
        "Eventually consistent (strong optional)",
        "Strong consistency with ACID",
        "Near real-time (async indexing)",
        "Single-node strong, cluster eventual",
      ],
      [
        "Read Latency",
        "Single-digit ms",
        "Low ms with indexes",
        "10-100ms for complex queries",
        "Sub-millisecond",
      ],
      [
        "Scaling Strategy",
        "Auto-partitioned by partition key",
        "Read replicas, manual sharding",
        "Index sharding by category",
        "Cluster mode with hash slots",
      ],
      [
        "Data Model",
        "Key-value and document",
        "Relational with joins",
        "Document with inverted index",
        "Key-value, lists, sets, sorted sets",
      ],
      [
        "Durability",
        "Multi-AZ replication",
        "WAL with streaming replication",
        "Replica shards across nodes",
        "AOF and RDB snapshots (optional)",
      ],
    ],
  },
  followUps: [
    "Design Amazon's review and rating aggregation system with fraud detection",
    "Design the fulfillment center routing and last-mile delivery optimization",
    "Design Amazon Prime Video's streaming architecture",
    "Design the seller marketplace and multi-tenant catalog management",
    "Design Amazon's real-time pricing engine with dynamic pricing",
    "Design the return and refund processing pipeline",
    "Design a flash-sale / limited-drop system (virtual waiting room, fairness, bot defense)",
    "Design the promotions and coupon engine with stacking rules and abuse prevention",
    "Design Amazon's search autocomplete and query-suggestion service",
  ],
  resources: [
    {
      label: "Amazon Dynamo Paper", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      kind: "paper",
      note: "Foundational paper on Amazon's highly available key-value store, explaining the trade-offs behind the cart service design",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Comprehensive coverage of distributed systems concepts used throughout Amazon's architecture: replication, partitioning, transactions, and stream processing",
    },
    {
      label: "System Design Interview by Alex Xu", url: "https://bytebytego.com/",
      kind: "book",
      note: "Practical system design interview preparation covering e-commerce, search, and distributed systems patterns",
    },
    {
      label: "Amazon Builder's Library",
      kind: "article",
      note: "Collection of articles by Amazon engineers on real-world practices: avoiding fallback, using shuffle sharding, and implementing retries with backoff",
    },
    {
      label: "Martin Fowler - Saga Pattern", url: "https://martinfowler.com/",
      kind: "article",
      note: "Detailed explanation of the saga pattern for managing distributed transactions in microservice architectures",
    },
  ],
};
