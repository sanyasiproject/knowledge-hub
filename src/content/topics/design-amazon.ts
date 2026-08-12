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
    "## High-Level Architecture and Service Decomposition\n\nAmazon's architecture is a canonical example of microservices at scale, with over 1,000 independent services communicating via asynchronous messaging and synchronous APIs. The core services include Product Catalog, Search, Cart, Order, Payment, Inventory, Fulfillment, Recommendations, and Reviews. An API Gateway (or BFF layer) routes client requests to the appropriate downstream services, handles authentication, rate limiting, and request shaping. Service-to-service communication uses a mix of synchronous gRPC calls for latency-sensitive paths and asynchronous event buses (Kafka/SQS/SNS) for eventual-consistency workflows like analytics, notifications, and inventory sync. Each service owns its data store, following the database-per-service pattern, which eliminates cross-service schema coupling but introduces challenges around distributed transactions and data consistency. The front end is served through a CDN (CloudFront) with edge caching for static assets and personalized content assembled via edge-side includes or client-side composition.",
    "## Product Catalog and Search\n\nThe product catalog stores hundreds of millions of SKUs with attributes like title, description, price, images, category hierarchy, seller information, and inventory status. DynamoDB provides single-digit-millisecond reads by product ID, while a separate search cluster (OpenSearch) maintains an inverted index over product text fields. When a seller updates a product, an event is published to a change data capture stream, and a search indexer asynchronously updates the inverted index. Search ranking combines text relevance (BM25/TF-IDF), product popularity (sales velocity, click-through rate), seller quality score, and personalization signals. A re-ranking layer using a machine learning model (gradient-boosted trees or a neural ranker) produces the final ordering. Faceted search (filter by brand, price range, rating, Prime eligibility) is implemented via aggregation queries on the inverted index. Autocomplete and query suggestion use a prefix trie backed by a precomputed dictionary of popular queries, updated hourly from search logs.",
    "## Shopping Cart and Order Processing\n\nThe shopping cart is a session-scoped service that persists cart items in a fast key-value store (DynamoDB or Redis) keyed by user ID or session token. Carts must survive server failures and merge gracefully when a guest user logs in (merge guest cart into authenticated cart, preferring higher quantities). Cart operations (add, remove, update quantity) are idempotent by including a client-generated request ID checked against a deduplication window. Order processing follows the saga pattern: the Order Service orchestrates a sequence of steps -- validate cart, reserve inventory, authorize payment, confirm order, and queue for fulfillment. Each step publishes a domain event, and compensating actions (release inventory, void payment authorization) fire if any downstream step fails. The Order Service itself is a state machine with states like CREATED, INVENTORY_RESERVED, PAYMENT_AUTHORIZED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, and RETURNED. SQS dead-letter queues capture events that fail repeatedly for manual investigation.",
    "## Payment Processing and Idempotency\n\nPayment processing requires exactly-once semantics despite network unreliability. Every payment request carries an idempotency key (typically the order ID), and the payment service stores the result of each key in a durable log. If a retry arrives with the same key, the stored result is returned without re-executing the charge. The payment flow involves: (1) authorize the payment method for the order amount, placing a hold on the customer's card, (2) upon order confirmation, capture the authorized amount, (3) if the order is cancelled before capture, void the authorization. For marketplace orders with multiple sellers, the payment is split: Amazon collects the full amount and disburses to each seller minus commission, using a ledger-based accounting system that records every debit and credit as an immutable journal entry. PCI-DSS compliance requires tokenization of card data; the payment service never stores raw card numbers but references tokens from a vault. Fraud detection runs as a synchronous pre-authorization check using ML models trained on historical chargeback data.",
    "## Inventory Management and Fulfillment\n\nInventory is distributed across hundreds of fulfillment centers worldwide. Each center maintains a local inventory count, and a global inventory service aggregates availability by region. The system uses a reservation model: when a customer adds an item to cart, a soft reservation (TTL of 15 minutes) is placed; upon order confirmation, it converts to a hard reservation. Distributed locking via DynamoDB conditional writes (optimistic concurrency with version numbers) or Redis-based Redlock prevents two customers from reserving the last unit simultaneously. During flash sales or Prime Day, the system pre-partitions hot inventory items across multiple lock shards to avoid contention bottlenecks. Fulfillment routing selects the optimal warehouse based on proximity to the customer, current stock levels, shipping cost, and delivery promise. A background reconciliation process continuously compares physical counts with system counts to detect and correct drift caused by returns, damages, or miscounts.",
  ],
  deepDive: [
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
        "Microservices decomposition showing core services and data stores",
      mermaid: `graph TD
    Client["Client Apps"] --> CDN["CDN CloudFront"]
    CDN --> APIGW["API Gateway"]
    APIGW --> AuthSvc["Auth Service"]
    APIGW --> SearchSvc["Search Service"]
    APIGW --> CatalogSvc["Catalog Service"]
    APIGW --> CartSvc["Cart Service"]
    APIGW --> OrderSvc["Order Service"]
    APIGW --> RecoSvc["Recommendation Service"]
    SearchSvc --> OpenSearch["OpenSearch Cluster"]
    CatalogSvc --> DynamoDB["DynamoDB"]
    CartSvc --> Redis["Redis Cluster"]
    OrderSvc --> OrderDB["Order Database"]
    OrderSvc --> PaymentSvc["Payment Service"]
    OrderSvc --> InventorySvc["Inventory Service"]
    OrderSvc --> EventBus["Kafka Event Bus"]
    PaymentSvc --> PaymentGW["Payment Gateway"]
    InventorySvc --> InvDB["Inventory DB"]
    EventBus --> FulfillSvc["Fulfillment Service"]
    EventBus --> NotifSvc["Notification Service"]
    EventBus --> AnalyticsSvc["Analytics Pipeline"]
    RecoSvc --> FeatureStore["Feature Store"]`,
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
  ],
  resources: [
    {
      label: "Amazon Dynamo Paper",
      kind: "paper",
      note: "Foundational paper on Amazon's highly available key-value store, explaining the trade-offs behind the cart service design",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Comprehensive coverage of distributed systems concepts used throughout Amazon's architecture: replication, partitioning, transactions, and stream processing",
    },
    {
      label: "System Design Interview by Alex Xu",
      kind: "book",
      note: "Practical system design interview preparation covering e-commerce, search, and distributed systems patterns",
    },
    {
      label: "Amazon Builder's Library",
      kind: "article",
      note: "Collection of articles by Amazon engineers on real-world practices: avoiding fallback, using shuffle sharding, and implementing retries with backoff",
    },
    {
      label: "Martin Fowler - Saga Pattern",
      kind: "article",
      note: "Detailed explanation of the saga pattern for managing distributed transactions in microservice architectures",
    },
  ],
};
