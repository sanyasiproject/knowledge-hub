import type { TopicContent } from "../types";

export const designUber: TopicContent = {
  quickSummary: [
    "Uber processes ~20M rides/day with millions of concurrent drivers sending location updates every 4 seconds. The system must match riders to nearby drivers in real-time (< 5 seconds), compute accurate ETAs, and handle surge pricing during demand spikes.",
    "Geospatial indexing is the backbone: the world is divided into cells using geohash or quadtree structures so that nearby-driver queries resolve in O(log N) time instead of scanning all drivers. Google S2 cells (used by Uber) provide hierarchical spatial indexing with configurable precision.",
    "The matching service pairs riders with optimal drivers considering distance, ETA, driver rating, trip direction, and vehicle type. Uber uses a dispatch optimization system that solves a batched bipartite matching problem every 2 seconds rather than greedy first-come-first-served.",
    "Surge pricing uses a real-time supply-demand model: each geographic zone tracks the ratio of open ride requests to available drivers. When demand exceeds supply by a threshold, a multiplier is applied to fares. The multiplier is recalculated every 1-2 minutes per zone.",
    "The trip lifecycle flows through states: REQUESTED, MATCHED, DRIVER_EN_ROUTE, ARRIVED, TRIP_IN_PROGRESS, COMPLETED, CANCELLED. Each transition triggers downstream events: notifications, ETA updates, billing calculations, and driver availability changes.",
  ],
  detailed: [
    "## Requirements and Scale Estimation\n\nEvery number in this design flows from two inputs: 20M rides/day and 5M concurrent drivers pinging GPS every 4 seconds. Functional requirements include rider requesting a ride, real-time driver-rider matching, ETA computation, fare estimation with dynamic pricing, trip tracking, and payment processing. Non-functional requirements demand sub-second location update ingestion, matching latency under 5 seconds, 99.99% availability, and strong consistency for payment but eventual consistency for location data.\n\n### Capacity math, step by step\n\n- Ride requests: 20M rides/day / 86,400 s = ~230 rides/s average; with a 3x peak-to-average ratio that is ~700 ride requests/s at peak. Each request fans out into a fare estimate, a nearby-driver query, ~20 ETA computations, and a match decision.\n- Location writes: 5M concurrent drivers x (1 ping / 4 s) = 1.25M location writes/s. At ~100 bytes per ping (driverId, lat, lng, timestamp, heading, speed, accuracy) that is ~125 MB/s of raw ingest and 1.25M x 86,400 x 100 B = ~10.8 TB/day of location history.\n- WebSocket connections: 5M drivers + roughly 1M riders actively watching a trip = ~6M concurrent sockets. A tuned gateway node (Go/Netty class) comfortably holds ~100K connections, so you need ~60 WebSocket gateway nodes plus headroom, fronted by an L4 load balancer with connection-count-aware routing.\n- Nearby-driver reads: ~700 requests/s x 1 geo query, plus map-screen driver previews and re-dispatches, lands around 100-500K geo index reads/s at peak. This is why the index must be in memory: even 1 ms per query on a disk-backed store would not survive this fan-out.\n\nKey insight: writes dominate reads by roughly 1000:1 (1.25M writes/s vs ~700 ride requests/s). The architecture is shaped by the write path — that is why location goes to an in-memory index fed by Kafka rather than to the transactional database.\n\nCommon mistake: estimating storage for driver pings as if they must all live in the OLTP database. Live positions are ephemeral (only the latest ping per driver matters for matching, ~5M rows total); the 10 TB/day history stream goes to Cassandra/HDFS for analytics and is TTL'd or downsampled after days.",
    "## High-Level Architecture\n\nThe system decomposes into two distinct traffic paths — a firehose write path for driver pings and a request/response path for rides — plus a shared realtime layer. On the write path, the Driver App holds a persistent WebSocket to a WebSocket Gateway; pings flow to the Location Ingestion service, which validates and Kalman-smooths them, publishes to Kafka (partitioned by city), and updates the in-memory geospatial index (H3/S2 cells, live positions mirrored in Redis for cross-service reads). On the request path, the Rider App hits the API Gateway (auth, rate limiting), which routes to the Pricing Service for a fare quote, then to the Matching/Dispatch Service, which queries the geo index for candidates, asks the ETA/Routing Service for pickup ETAs, and dispatches an offer back through the WebSocket Gateway. The Trip Service owns the ride lifecycle state machine, persisting trips to PostgreSQL and emitting every state transition to Kafka; the Payments Service pre-authorizes via an external processor (Stripe/Adyen/Braintree) and captures on completion; the Notification Service pushes trip updates (APNs/FCM, SMS fallback).\n\n### Named tech per layer\n\n| Layer | Technology | Why |\n| --- | --- | --- |\n| Edge | Envoy/NGINX L4 LB + API gateway + WebSocket gateway | Separate stateless HTTP from long-lived socket state |\n| Stream | Kafka (city-partitioned topics) | Durable buffer for 1.25M pings/s; replay on restart |\n| Geo index | H3 (Uber) or S2 (Google) cells in memory / Redis | O(1) cell lookup, ring expansion for radius search |\n| Trips/users/payments | PostgreSQL | ACID transactions, money must not be eventually consistent |\n| Location history | Cassandra | Write-optimized LSM store for 10 TB/day append-only data |\n| Live positions + surge cache | Redis | Sub-ms reads for map rendering and pricing |\n| Routing | OSM road graph + contraction hierarchies; ML ETA correction (Uber DeepETA) | Millisecond path queries at continent scale |\n\nIn practice: all synchronous inter-service calls are gRPC with deadlines and circuit breakers (Uber's internal stack is Go/Java services on a mesh), and everything asynchronous — analytics, surge signals, ML features, receipts — hangs off the Kafka event stream rather than adding synchronous hops to the hot path.",
    "## Geospatial Indexing: H3/S2 Hexagonal Geosharding\n\nThe entire matching problem reduces to one query — 'give me available drivers near this point' — and the geo index exists to answer it in microseconds. Naive geohashing encodes lat/lng by interleaving coordinate bits; precision 6 (e.g., '9q8yyk') covers roughly 1.2 km x 0.6 km, and a nearby-driver query reads the rider's cell plus its 8 neighbors. Uber's production system uses H3, its open-source hexagonal hierarchical index: the globe is tiled with hexagons at 16 resolutions (res 7 hexes average ~5 km2, res 9 ~0.1 km2), and each hex has a 64-bit integer id.\n\n### How geosharding actually works\n\n- Every driver ping maps lat/lng to an H3 cell id in O(1) (a few hundred nanoseconds — pure math, no I/O).\n- The index is a hash map from cell id to the set of drivers currently in that cell: cellId -> {driverId: lastPing}. A driver moving between cells is a delete + insert, both O(1).\n- A radius search is 'k-ring expansion': fetch the rider's hex, then ring 1 (6 neighbors), then ring 2 (12 more), stopping once enough candidates are found. This bounds work to the local area regardless of global driver count.\n- The cell id doubles as the sharding key: contiguous ranges of cells (i.e., geographic regions/cities) are assigned to index shards via consistent hashing, so one shard owns one metro and keeps it fully in RAM (~50 MB for 100K drivers at ~500 bytes each).\n\nKey insight: hexagons beat squares (geohash/quadtree) for movement modeling because all 6 neighbors of a hex are equidistant from its center, while a square has 4 near neighbors and 4 diagonal ones ~41% farther. That makes ring-based radius search and per-cell surge zones far less distorted. S2 (Google's cube-projection + Hilbert curve alternative) solves the same problem with near-uniform quadrilateral cells and is what many geo systems use instead.\n\nCommon mistake: storing driver positions in PostgreSQL and querying WHERE lat BETWEEN ... AND lng BETWEEN ... with a B-tree index. B-trees index one dimension well; a 2D range query degenerates into scanning a huge latitude band. Even PostGIS with an R-tree cannot sustain 1.25M updates/s — the index must be in memory.",
    "## Driver-Rider Matching and ETA Calculation\n\nMatching is not simply assigning the closest driver. Uber's dispatch system collects all unmatched ride requests and available drivers in a region, then solves a batched assignment problem every 2 seconds. The objective function minimizes total pickup ETA across all pairs while considering driver preferences, vehicle type match, and predicted trip value. This is modeled as a minimum-cost bipartite matching problem solved with the Hungarian algorithm or auction-based methods. For ETA calculation, the system maintains a road-network graph with ~100M edges globally. Real-time ETAs combine: (1) a graph shortest-path algorithm (A* with landmark heuristics) to compute route distance, (2) real-time traffic data from driver GPS traces aggregated per road segment, and (3) an ML model that adjusts for time-of-day, weather, and special events. Historical trip data shows that ML-adjusted ETAs are 20-30% more accurate than pure graph routing. The Haversine formula provides quick straight-line distance estimates for initial filtering (eliminating drivers more than 10 km away before running expensive graph routing).",
    "## One Ride, End to End\n\nTracing a single request through every component is the fastest way to prove the design hangs together. The rider opens the app: the client calls the API Gateway, which fans out to Pricing (fare quote using the current surge multiplier for the pickup hex, read from Redis) and ETA (rough pickup time from nearby-driver density). The rider confirms.\n\n1. Request: the gateway creates a ride request; the Trip Service writes a trip row in PostgreSQL in state REQUESTED and emits a trip-requested event to Kafka.\n2. Candidate search: Matching queries the geo index shard for the pickup hex — k-ring expansion returns, say, 12 available drivers within 2 rings.\n3. Rank: Matching asks the ETA service for road-network pickup ETAs on the top candidates (Haversine pre-filter first), builds a cost per pair, and runs the batched assignment for the current 2-second window.\n4. Offer: the winning driver gets a dispatch offer over their WebSocket with a 10-15 s countdown. The offer places a soft lock on the driver so no other match grabs them. Decline or timeout releases the lock and the request re-enters the next batch with the driver excluded.\n5. Accept: driver taps accept — Trip Service transitions REQUESTED -> MATCHED -> DRIVER_EN_ROUTE (each transition is a compare-and-set on the trip row plus a Kafka event). Payments pre-authorizes the estimated fare with the processor using idempotency key tripId:auth.\n6. Trip: ARRIVED when the driver's GPS enters the pickup geofence, TRIP_IN_PROGRESS on start; rider and observers stream the driver's position via the WebSocket gateway (fed from the location stream, throttled to ~1 update/s for the map).\n7. Completion: at dropoff the trip transitions to COMPLETED, the fare is finalized (distance + time from the GPS trace, surge multiplier locked at request time), and Payments captures against the earlier authorization with key tripId:capture. Receipt, rating prompt, and driver-earnings update all fan out asynchronously from the trip-completed Kafka event.\n\nKey insight: the surge multiplier is locked at request time, not completion time — otherwise the price a rider agreed to could change mid-trip, which is both a product and a legal problem.",
    "## Surge Pricing, Payments, and Failure Handling\n\nSurge pricing divides each city into hexagonal zones (~1 km2 each). For each zone, the system continuously computes the supply-demand ratio: available drivers divided by open ride requests. When demand exceeds supply beyond a threshold (e.g., ratio < 0.5), a surge multiplier is applied: typically 1.2x to 3x, capped at a regulatory maximum. The multiplier is smoothed over a 5-minute rolling window to avoid oscillation. Payment processing uses a two-phase approach: authorize the estimated fare when the ride is matched, then capture the actual fare on completion. This handles scenarios where the actual fare differs from the estimate. For failure handling, the system implements circuit breakers between services, fallback matching (greedy nearest-driver if the optimizer is down), and idempotent payment operations. If the matching service fails, riders see increased wait times but the system degrades gracefully rather than going offline. Driver location updates are buffered in Kafka so that a location service restart recovers state from the last few seconds of the stream. Trip state is event-sourced, allowing reconstruction from the event log if the Trip Service database fails.",
  ],
  deepDive: [
    "## Why Naive Lat/Lng Queries Fail, and How Ring Expansion Wins\n\nThe deepest interview differentiator on this problem is explaining WHY a database range query cannot serve nearby-driver search. A B-tree can index latitude OR longitude, not both: SELECT ... WHERE lat BETWEEN a AND b AND lng BETWEEN c AND d uses the index for one dimension, then filters the other — in a dense city that means scanning every driver in a 1-degree latitude band (potentially hundreds of thousands of rows) to find 20 nearby ones. Spatial indexes (R-trees in PostGIS) fix the read but die on the write side: 1.25M position updates/s means 1.25M index mutations/s with page splits, WAL writes, and vacuum pressure. The solution inverts the data structure — instead of asking 'which drivers are within radius r of point p', pre-bucket drivers into fixed cells so the question becomes 'which cells overlap my search area', which is pure arithmetic.\n\n### Hex ring expansion search\n\n- Convert the pickup point to its H3 cell (res 8-9 for urban search). Look up that cell's driver set: O(1).\n- Not enough candidates? Expand to ring 1 — the 6 hexes touching the center — then ring 2 (12 hexes), ring 3 (18 hexes). Ring k adds 6k cells, so total cells after k rings is 1 + 3k(k+1); even ring 5 is only 91 cell lookups, each a hash-map hit.\n- Stop when you have N candidates (e.g., 20) or hit a max radius. Sparse suburbs naturally expand further; dense downtowns stop at ring 1. The algorithm is self-adapting with zero tuning.\n- Each candidate's last ping carries a timestamp: discard entries older than ~10 s (stale drivers who disconnected) at read time rather than eagerly cleaning the index.\n\nKey insight: cell size is a tuning knife-edge. Too coarse (res 6, ~36 km2) and every query returns thousands of candidates to filter; too fine (res 11, ~0.002 km2) and you burn CPU on deep ring expansion. Production systems pick a resolution where a typical urban query resolves within 1-2 rings, and may use coarser resolution for suburban shards.\n\nCommon mistake: forgetting driver movement between cells. Every ping potentially moves a driver from cell A to cell B — the update must atomically remove-then-insert, or a crash between the two operations leaves the driver duplicated or vanished. Single-threaded shard event loops (Redis-style) or per-cell locks solve this cheaply.",
    "## Sharding the Location Service for Global Scale\n\nThe location service cannot run as a single instance at Uber's scale. The primary sharding strategy is geographic: each major city or metro area gets its own location service shard. A city like New York with ~80K active drivers at peak holds its entire geospatial index in ~40 MB of RAM (80K drivers x 500 bytes per driver record including geohash, coordinates, status, vehicle info). Cross-city rides (e.g., a driver near a city boundary) are handled by registering drivers in multiple shards for overlapping boundary zones. Within a city, the geospatial index uses consistent hashing on geohash prefixes to distribute across multiple nodes for fault tolerance. Each node is replicated with a hot standby that consumes the same Kafka partition of location updates. Failover time is under 2 seconds since the standby has a warm cache. Uber's system (named Ringpop) uses a SWIM protocol-based membership for node discovery and consistent hashing for request routing.",
    "## The Matching Algorithm in Depth\n\nThe naive greedy approach (assign each request to the nearest available driver) yields suboptimal global outcomes. Consider two riders A and B and two drivers X and Y. Driver X is closest to both riders, but assigning X to A might leave B with a 15-minute wait, while assigning X to B and Y to A gives both a 5-minute wait. Uber's batched matching collects requests over a 2-second window and solves the assignment as an optimization problem. The cost matrix C[i][j] represents the cost of assigning rider i to driver j, incorporating pickup ETA, predicted trip revenue, driver fatigue score, and rider priority. The Hungarian algorithm solves this in O(n^3) time, which is feasible for batches of ~100-500 requests per city per 2-second window. For larger cities, the problem is decomposed into geographic sub-regions that are solved independently. An important edge case is handling shared rides (UberPool): here the matching must consider detour impact on existing passengers, requiring simulation of the new route with the additional pickup/dropoff inserted into the current trip plan. The system evaluates all possible insertion points and selects the one minimizing total detour.",
    "## Real-Time Data Pipeline and Analytics\n\nEvery location update, trip event, and pricing decision flows into Uber's real-time data pipeline built on Apache Kafka and Apache Flink. Kafka topics are partitioned by city and data type: location-updates-nyc, trip-events-sf, etc. Flink jobs compute real-time aggregations: drivers available per zone per minute, average pickup times, surge multiplier effectiveness, and anomaly detection (e.g., a sudden drop in driver supply indicating a system issue). These aggregations feed back into the pricing and matching systems with sub-minute latency. For historical analytics, data flows from Kafka into HDFS via a connector, then into Hive/Presto tables for batch analysis. The total data volume exceeds 100 PB across all of Uber's storage. A key challenge is exactly-once processing semantics: duplicate location updates (from retries) must be deduplicated using driverId + timestamp as a natural key. Flink's checkpointing with Kafka offsets provides effectively-once processing, though the location service also implements client-side deduplication using a sliding-window bloom filter per driver.",
    "## The Surge Pricing Pipeline End to End\n\nSurge is a closed-loop control system, and interviewers reward candidates who describe it as a pipeline rather than a formula. The input signals flow from Kafka: open ride requests per hex (demand), available drivers per hex (supply), plus leading indicators — riders opening the app without requesting ('eyeballs'), event calendars, weather, and drivers about to complete trips nearby (imminent supply). A Flink job aggregates these per H3 hex per ~30-second window and computes a raw imbalance score. A smoothing stage applies an exponentially weighted moving average over ~5 minutes and hysteresis (surge rises fast, decays slowly) to prevent oscillation: without it, surge spikes, demand collapses, surge crashes, demand floods back — a feedback loop with riders as the plant. The ML layer (gradient-boosted or deep models) predicts demand 10-30 minutes ahead so surge can pre-position drivers before a concert lets out rather than react after. The resulting multiplier per hex is written to the Redis surge cache, versioned, and read by the Pricing Service on every fare quote; the quote embeds the multiplier so the price is locked for that ride.\n\nWarning: surge multipliers are regulated in many jurisdictions (caps during declared emergencies, disclosure requirements), so the pipeline needs per-region policy caps applied AFTER the model output — never trained into the model, where they would be impossible to audit.\n\nIn practice: surge is smoothed spatially as well as temporally — neighboring hexes are blended so a rider cannot walk one block to cross a hard 1.0x/2.5x boundary, which used to be a well-known rider trick.",
    "## Trip State Machine and Exactly-Once Payment\n\nMoney is where eventual consistency goes to die, so the trip lifecycle and the payment flow must be designed together. The trip is a persisted state machine in PostgreSQL: REQUESTED -> MATCHED -> DRIVER_EN_ROUTE -> ARRIVED -> TRIP_IN_PROGRESS -> COMPLETED, with cancellation edges. Every transition is a conditional update (UPDATE trips SET state='ARRIVED' WHERE id=? AND state='DRIVER_EN_ROUTE'), which makes duplicate or out-of-order events from flaky mobile clients harmless — an event that does not match the expected current state is rejected or ignored. Each successful transition also appends an event row and publishes to Kafka in the same transaction (transactional outbox pattern), so downstream consumers see exactly the transitions that actually happened.\n\n### Exactly-once payment via idempotency + saga\n\n- Networks give you at-least-once delivery at best, so 'exactly-once payment' is engineered as: idempotent operations + retries + reconciliation.\n- Every call to the payment processor carries an idempotency key derived from the trip: tripId:auth for pre-authorization at match, tripId:capture for capture at completion. Stripe/Adyen/Braintree all dedupe on this key server-side, so a timed-out request retried five times charges once.\n- The complete flow is a saga: authorize -> ride -> capture, with compensating actions — if the trip is cancelled, the compensation is voiding the authorization; if capture permanently fails, the compensation is flagging the trip for the retry queue and dunning flow rather than blocking trip completion.\n- The payment state machine (PENDING_AUTH -> AUTHORIZED -> CAPTURED / VOIDED / FAILED) is stored alongside the trip, and an hourly reconciliation job diffs internal state against the processor's records to catch the inevitable drift (auth succeeded at the processor but the response was lost).\n\nKey insight: never make payment capture synchronous with trip completion in the user flow. The rider gets 'trip complete' immediately; capture happens asynchronously with retries. Blocking a driver's next dispatch on a payment processor's p99 latency would be a self-inflicted outage.\n\nCommon mistake: using a random UUID as the idempotency key on each retry. The key must be deterministic from the business operation (tripId + operation type) — a fresh UUID per attempt makes every retry look like a new charge, which is precisely the double-charge bug the key exists to prevent.",
    "## Degraded Modes: Designing for Partial Failure\n\nA ride in progress must survive every dependency failing, because the physical trip continues whether or not your services are up. GPS gaps are the most common degradation: tunnels, urban canyons, and dead phone batteries silence a driver mid-trip. The location service dead-reckons short gaps using last-known heading and speed (the Kalman filter's prediction step with no measurement update) and widens the position uncertainty; the trip is NOT auto-cancelled on silence — the driver app buffers its GPS trace locally and replays it on reconnect, and fare calculation uses the reconciled trace. Matching degrades next: if the batched optimizer is slow or down, dispatch falls back to greedy nearest-driver per request — worse global outcomes, but rides still happen. Pricing degrades to multiplier 1.0x or the last cached surge value (choose deliberately: stale surge can badly over- or under-price after a demand shift). Payments degrade most gracefully of all: if the processor is down at trip end, the trip still completes, the capture enters a retry queue with exponential backoff, and only after repeated failures over hours does it escalate to account-level collection (retry on next ride, email dunning).\n\n- GPS gap during trip: dead-reckon, buffer client-side, reconcile fare from replayed trace.\n- Geo index shard crash: standby replays the city's Kafka partition; a few seconds of stale positions, matching pauses briefly in one metro only.\n- Optimizer down: greedy fallback matching, alert on pickup-ETA regression.\n- Payment processor outage: complete the trip, queue capture with backoff, hourly reconciliation catches stragglers.\n- Regional DC failure: fail over to secondary region; in-flight trips continue from driver-phone cached state and reconcile on reconnect.\n\nReal-world example: Uber drivers routinely go through tunnels with riders aboard; if trip state required continuous connectivity, every Lincoln Tunnel crossing would orphan a trip. The driver app is deliberately the source of truth for the in-progress trip, syncing to the server opportunistically.\n\nKey insight: rank failures by blast radius and design the fallback per failure, not one global 'maintenance mode'. Location loss affects one driver; a geo shard affects one city; the payment processor affects revenue timing but should never affect whether wheels turn.",
    "## Handling Edge Cases and Regional Failures\n\nSeveral edge cases deserve attention in a production Uber-scale system. GPS drift in urban canyons (tall buildings blocking satellite signals) causes driver positions to jump erratically. The location service applies a Kalman filter to smooth GPS readings, using heading and speed to predict the next position and reject outlier updates that imply physically impossible movement (e.g., teleporting 5 km in 4 seconds). Airport pickups require geofencing: drivers must be in a designated queue zone, and the matching algorithm respects first-in-first-out ordering within the geofence rather than using proximity-based matching. For regional failures (e.g., an entire data center going offline), the system fails over to a secondary region. Trip state must be replicated cross-region with RPO < 5 seconds. During failover, in-progress trips continue using cached state on the driver's phone, which reconciles with the server when connectivity is restored. Payment authorization tokens are stored in a globally replicated database (CockroachDB or Spanner) to prevent double charges during failover.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Geohash encoding: converts latitude and longitude into a geohash string by interleaving coordinate bits and mapping to base-32 characters",
      source: `#include <string>
#include <cstdint>

// Encode lat/lng into a geohash string of given precision.
// Each character encodes 5 bits (base-32). Precision 6 ~ 1.2km x 0.6km cells.
std::string geohash_encode(double lat, double lng, int precision = 6) {
    static const char base32[] = "0123456789bcdefghjkmnpqrstuvwxyz";

    double lat_range[2] = {-90.0, 90.0};
    double lng_range[2] = {-180.0, 180.0};

    std::string hash;
    hash.reserve(precision);
    int bits = 0;
    int current_char = 0;
    bool use_lng = true;  // alternate: lng bits in odd positions, lat in even

    while ((int)hash.size() < precision) {
        if (use_lng) {
            double mid = (lng_range[0] + lng_range[1]) / 2.0;
            if (lng >= mid) {
                current_char |= (1 << (4 - bits));
                lng_range[0] = mid;
            } else {
                lng_range[1] = mid;
            }
        } else {
            double mid = (lat_range[0] + lat_range[1]) / 2.0;
            if (lat >= mid) {
                current_char |= (1 << (4 - bits));
                lat_range[0] = mid;
            } else {
                lat_range[1] = mid;
            }
        }
        use_lng = !use_lng;
        bits++;

        if (bits == 5) {
            hash += base32[current_char];
            bits = 0;
            current_char = 0;
        }
    }
    return hash;
}

// Get the 8 neighboring geohash cells for edge-case handling in spatial queries.
// In production, neighbors are computed by incrementing/decrementing the
// interleaved bit representation and re-encoding.
std::vector<std::string> geohash_neighbors(const std::string& hash) {
    // Simplified: decode center, offset by cell width/height, re-encode.
    // Full implementation handles wraparound at boundaries.
    std::vector<std::string> result;
    // ... offset in 8 directions and re-encode each
    return result;
}`,
    },
    {
      language: "cpp",
      caption:
        "Quadtree spatial index: inserts driver positions and performs range queries to find all drivers within a bounding box, used for efficient nearby-driver lookups",
      source: `#include <vector>
#include <memory>
#include <cmath>

struct Point {
    double lat, lng;
    int driver_id;
};

struct BoundingBox {
    double min_lat, max_lat, min_lng, max_lng;

    bool contains(double lat, double lng) const {
        return lat >= min_lat && lat <= max_lat &&
               lng >= min_lng && lng <= max_lng;
    }

    bool intersects(const BoundingBox& other) const {
        return !(other.min_lat > max_lat || other.max_lat < min_lat ||
                 other.min_lng > max_lng || other.max_lng < min_lng);
    }
};

class QuadTree {
    static constexpr int MAX_POINTS = 4;
    static constexpr int MAX_DEPTH = 20;

    BoundingBox bounds_;
    std::vector<Point> points_;
    std::unique_ptr<QuadTree> children_[4];  // NW, NE, SW, SE
    int depth_;

    void subdivide() {
        double mid_lat = (bounds_.min_lat + bounds_.max_lat) / 2;
        double mid_lng = (bounds_.min_lng + bounds_.max_lng) / 2;

        children_[0] = std::make_unique<QuadTree>(
            BoundingBox{mid_lat, bounds_.max_lat, bounds_.min_lng, mid_lng}, depth_ + 1);
        children_[1] = std::make_unique<QuadTree>(
            BoundingBox{mid_lat, bounds_.max_lat, mid_lng, bounds_.max_lng}, depth_ + 1);
        children_[2] = std::make_unique<QuadTree>(
            BoundingBox{bounds_.min_lat, mid_lat, bounds_.min_lng, mid_lng}, depth_ + 1);
        children_[3] = std::make_unique<QuadTree>(
            BoundingBox{bounds_.min_lat, mid_lat, mid_lng, bounds_.max_lng}, depth_ + 1);

        for (auto& p : points_) {
            for (auto& child : children_) {
                if (child->bounds_.contains(p.lat, p.lng)) {
                    child->insert(p);
                    break;
                }
            }
        }
        points_.clear();
    }

public:
    QuadTree(BoundingBox bounds, int depth = 0)
        : bounds_(bounds), depth_(depth) {}

    void insert(const Point& p) {
        if (!bounds_.contains(p.lat, p.lng)) return;

        if (children_[0] == nullptr) {
            points_.push_back(p);
            if ((int)points_.size() > MAX_POINTS && depth_ < MAX_DEPTH) {
                subdivide();
            }
            return;
        }
        for (auto& child : children_) {
            if (child->bounds_.contains(p.lat, p.lng)) {
                child->insert(p);
                return;
            }
        }
    }

    void query_range(const BoundingBox& range, std::vector<Point>& results) const {
        if (!bounds_.intersects(range)) return;

        for (auto& p : points_) {
            if (range.contains(p.lat, p.lng)) {
                results.push_back(p);
            }
        }
        if (children_[0] != nullptr) {
            for (auto& child : children_) {
                child->query_range(range, results);
            }
        }
    }

    // Remove a driver by ID (used when driver moves to a new cell).
    bool remove(int driver_id) {
        for (auto it = points_.begin(); it != points_.end(); ++it) {
            if (it->driver_id == driver_id) {
                points_.erase(it);
                return true;
            }
        }
        if (children_[0] != nullptr) {
            for (auto& child : children_) {
                if (child->remove(driver_id)) return true;
            }
        }
        return false;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Haversine distance and simplified driver matching: computes great-circle distance between two GPS coordinates and implements a basic matching cost function",
      source: `#include <cmath>
#include <vector>
#include <algorithm>
#include <limits>

constexpr double EARTH_RADIUS_KM = 6371.0;
constexpr double DEG_TO_RAD = M_PI / 180.0;

// Haversine formula: great-circle distance between two GPS points.
// Used for fast distance filtering before expensive road-network routing.
double haversine_km(double lat1, double lng1, double lat2, double lng2) {
    double dlat = (lat2 - lat1) * DEG_TO_RAD;
    double dlng = (lng2 - lng1) * DEG_TO_RAD;
    double a = std::sin(dlat / 2) * std::sin(dlat / 2) +
               std::cos(lat1 * DEG_TO_RAD) * std::cos(lat2 * DEG_TO_RAD) *
               std::sin(dlng / 2) * std::sin(dlng / 2);
    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    return EARTH_RADIUS_KM * c;
}

struct Driver {
    int id;
    double lat, lng;
    double rating;        // 1.0 - 5.0
    int completed_trips;
    bool is_available;
};

struct RideRequest {
    int rider_id;
    double pickup_lat, pickup_lng;
    double dest_lat, dest_lng;
    int vehicle_type;  // 0=economy, 1=premium, 2=XL
};

// Matching cost: lower is better. Combines pickup distance, driver quality,
// and predicted trip alignment (does the driver's heading align with pickup direction).
double match_cost(const RideRequest& req, const Driver& d, double pickup_eta_sec) {
    double distance_km = haversine_km(req.pickup_lat, req.pickup_lng, d.lat, d.lng);

    // Primary factor: pickup ETA (from road-network routing, passed in)
    double eta_cost = pickup_eta_sec;

    // Quality bonus: prefer higher-rated drivers (small weight)
    double quality_bonus = (5.0 - d.rating) * 30.0;  // 0-120 sec penalty

    // Experience factor: new drivers get slight priority for onboarding
    double experience_factor = (d.completed_trips < 50) ? -20.0 : 0.0;

    return eta_cost + quality_bonus + experience_factor;
}

// Greedy matching fallback: used when the batched optimizer is unavailable.
// Assigns each request to the lowest-cost available driver.
struct MatchResult {
    int rider_id;
    int driver_id;
    double cost;
};

std::vector<MatchResult> greedy_match(
    const std::vector<RideRequest>& requests,
    std::vector<Driver>& drivers
) {
    std::vector<MatchResult> results;
    std::vector<bool> driver_taken(drivers.size(), false);

    for (auto& req : requests) {
        double best_cost = std::numeric_limits<double>::max();
        int best_idx = -1;

        for (int i = 0; i < (int)drivers.size(); i++) {
            if (!drivers[i].is_available || driver_taken[i]) continue;

            double dist = haversine_km(req.pickup_lat, req.pickup_lng,
                                        drivers[i].lat, drivers[i].lng);
            if (dist > 10.0) continue;  // skip drivers > 10km away

            // Approximate ETA: assume 30 km/h average urban speed
            double eta_sec = (dist / 30.0) * 3600.0;
            double cost = match_cost(req, drivers[i], eta_sec);

            if (cost < best_cost) {
                best_cost = cost;
                best_idx = i;
            }
        }

        if (best_idx >= 0) {
            results.push_back({req.rider_id, drivers[best_idx].id, best_cost});
            driver_taken[best_idx] = true;
        }
    }
    return results;
}`,
    },
  ],
  diagrams: [
    {
      title: "Uber High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered view of the platform: the driver-ping ingestion path (driver app to WebSocket gateway to location ingestion to Kafka to geo index) and the ride-request path (rider app to matching to trip to payments) with named data stores, ML models, and external providers",
      mermaid: `graph TB
    subgraph Clients["Clients"]
        RiderApp["Rider App"]
        DriverApp["Driver App<br/>GPS ping every 4s"]
    end
    subgraph Edge["Edge / Gateway"]
        LB["Load Balancer<br/>L4 anycast"]
        APIGW["API Gateway<br/>auth, rate limit, routing"]
        WSGW["WebSocket Gateway<br/>persistent driver + rider conns"]
    end
    subgraph Services["Core Services"]
        LocIngest["Location Ingestion<br/>validate, Kalman-smooth"]
        Match["Matching / Dispatch<br/>batched assignment every 2s"]
        Trip["Trip Service<br/>trip state machine"]
        Pricing["Pricing / Surge<br/>per-hex supply-demand"]
        ETASvc["ETA / Routing<br/>A-star + contraction hierarchies"]
        Pay["Payments<br/>auth then capture, idempotent"]
        Notif["Notification Service<br/>push + SMS fallback"]
    end
    subgraph Realtime["Realtime Layer"]
        Kafka["Kafka<br/>location + trip event streams"]
        GeoIdx["Geospatial Index<br/>H3/S2 cells, city-sharded<br/>in-memory / Redis"]
    end
    subgraph Data["Data Stores"]
        PG[("PostgreSQL<br/>trips, users, payments")]
        Cass[("Cassandra<br/>location history, trip events")]
        Redis[("Redis<br/>live driver positions,<br/>surge cache")]
    end
    subgraph ML["ML Systems"]
        SurgeML["Surge Prediction Model"]
        ETAML["ETA Correction Model"]
    end
    subgraph Ext["External"]
        Maps["Maps Provider<br/>OSM / Google tiles"]
        PSP["Payment Processor<br/>Stripe / Adyen / Braintree"]
    end

    DriverApp -->|"GPS ping"| LB
    RiderApp -->|"request ride"| LB
    LB --> APIGW
    LB --> WSGW
    WSGW -->|"1.25M pings/s"| LocIngest
    LocIngest -->|"publish"| Kafka
    Kafka -->|"consume + update cell"| GeoIdx
    Kafka -->|"archive history"| Cass
    GeoIdx --> Redis

    APIGW --> Match
    APIGW --> Trip
    APIGW --> Pricing
    Match -->|"nearby drivers?"| GeoIdx
    Match -->|"pickup ETAs"| ETASvc
    Match -->|"create trip"| Trip
    Match -->|"offer via socket"| WSGW
    Trip --> PG
    Trip -->|"state events"| Kafka
    Trip --> Pay
    Trip --> Notif
    Notif --> WSGW
    Pricing --> Redis
    Pricing --> SurgeML
    ETASvc --> ETAML
    ETASvc --> Maps
    Pay --> PSP
    Pay --> PG
    Kafka --> SurgeML
    Kafka --> ETAML`,
    },
    {
      title: "Ride Request Flow",
      kind: "sequence",
      caption:
        "End-to-end sequence from ride request to driver assignment and trip start",
      mermaid: `sequenceDiagram
    participant R as Rider
    participant GW as API Gateway
    participant PS as Pricing Service
    participant MS as Matching Service
    participant LS as Location Service
    participant ETA as ETA Service
    participant D as Driver
    participant TS as Trip Service

    R->>GW: Request ride with pickup and destination
    GW->>PS: Get fare estimate and surge multiplier
    PS-->>GW: Fare estimate with 1.5x surge
    GW-->>R: Show fare estimate
    R->>GW: Confirm ride request
    GW->>MS: Create ride request
    MS->>LS: Find nearby available drivers
    LS-->>MS: Return 12 candidate drivers
    MS->>ETA: Compute pickup ETA for each candidate
    ETA-->>MS: ETAs for all candidates
    MS->>MS: Run matching algorithm
    MS->>TS: Create trip record
    MS->>D: Send ride offer
    D->>MS: Accept ride
    MS-->>R: Driver assigned with ETA
    TS->>TS: Update trip state to DRIVER_EN_ROUTE`,
    },
    {
      title: "Trip State Machine",
      kind: "state",
      caption:
        "Lifecycle states of a trip from request through completion or cancellation",
      mermaid: `stateDiagram-v2
    [*] --> REQUESTED
    REQUESTED --> MATCHING: Finding drivers
    MATCHING --> MATCHED: Driver assigned
    MATCHING --> NO_DRIVERS: Timeout 30s
    NO_DRIVERS --> [*]
    MATCHED --> DRIVER_EN_ROUTE: Driver accepts
    MATCHED --> CANCELLED: Rider cancels
    DRIVER_EN_ROUTE --> ARRIVED: Driver at pickup
    DRIVER_EN_ROUTE --> CANCELLED: Rider cancels with fee
    ARRIVED --> TRIP_IN_PROGRESS: Rider picked up
    ARRIVED --> NO_SHOW: Rider no show 5min
    NO_SHOW --> [*]
    TRIP_IN_PROGRESS --> COMPLETED: Reached destination
    COMPLETED --> [*]
    CANCELLED --> [*]`,
    },
    {
      title: "Geospatial Indexing and Driver Lookup",
      kind: "flow",
      caption:
        "How a nearby driver query flows through the geospatial indexing layer",
      mermaid: `flowchart TD
    A[Rider requests pickup at lat lng] --> B[Compute geohash prefix precision 6]
    B --> C[Identify target cell plus 8 neighbors]
    C --> D[Query in-memory index for drivers in 9 cells]
    D --> E{Found enough candidates?}
    E -->|Yes| F[Filter by availability and vehicle type]
    E -->|No| G[Expand search radius by reducing precision to 5]
    G --> D
    F --> H[Compute Haversine distance for each]
    H --> I[Discard drivers beyond 10 km]
    I --> J[Request road-network ETA for top 20]
    J --> K[Return ranked candidate list to Matching Service]`,
    },
  ],
  interviewQA: [
    {
      q: "How does Uber handle millions of driver location updates per second?",
      a: "Drivers maintain persistent WebSocket connections to the Location Service and send GPS updates every 4 seconds. The Location Service is sharded by city/region, so each shard handles only its metro area's drivers (e.g., 80K drivers in NYC). Updates are written to an in-memory geospatial index (geohash map or quadtree) and simultaneously published to Kafka for downstream consumers. The in-memory approach avoids database write bottlenecks entirely. Each shard has hot standby replicas consuming the same Kafka partition, enabling sub-2-second failover. The total ingestion rate of ~1.25M updates/second is distributed across hundreds of shards globally.",
      followUps: [
        "How would you handle GPS drift in urban canyons with tall buildings?",
        "What happens if a Location Service shard goes down mid-ride?",
        "How do you handle drivers near city boundaries who could serve riders in either city?",
      ],
    },
    {
      q: "Why does Uber use batched matching instead of immediately assigning the nearest driver?",
      a: "Greedy nearest-driver assignment produces suboptimal global outcomes. If two riders are near the same intersection and one driver is closest to both, greedy assignment gives one rider a 2-minute pickup and the other a 15-minute pickup. Batched matching collects all requests in a 2-second window and solves a minimum-cost bipartite assignment, often giving both riders a 5-minute pickup. This increases overall rider satisfaction and reduces average wait times by 10-20%. The 2-second batch window is small enough that riders don't perceive added latency but large enough to accumulate meaningful batches in dense urban areas. The Hungarian algorithm solves the assignment in O(n^3), which is fast for batches of a few hundred requests.",
      followUps: [
        "How would you extend matching to handle shared rides like UberPool?",
        "What is the fallback if the batch optimizer is temporarily unavailable?",
      ],
    },
    {
      q: "How does surge pricing work and how do you prevent oscillation?",
      a: "Each city is divided into hexagonal zones of roughly 1 km2. For each zone, the system tracks a real-time supply-demand ratio: available drivers divided by open ride requests. When the ratio drops below a threshold (e.g., 0.5), a surge multiplier is applied to fares in that zone. The multiplier increases with the severity of the imbalance. To prevent oscillation (surge goes up, riders stop requesting, surge drops, riders flood back), the system applies temporal smoothing: the multiplier is computed as a weighted moving average over a 5-minute window. Additionally, surge is communicated transparently to riders, and gradual ramp-down prevents abrupt price drops. The system also factors in predicted supply: if many drivers are currently completing trips nearby and will become available in 5 minutes, the surge is dampened.",
      followUps: [
        "How do you handle regulatory caps on surge pricing in certain cities?",
        "What data would you use to predict demand spikes before they happen?",
      ],
    },
    {
      q: "How would you design the ETA calculation system?",
      a: "ETA computation combines three layers. First, a road-network graph with ~100M edges globally, built from OpenStreetMap data and augmented with turn restrictions and one-way streets. A* search with landmark-based heuristics computes the shortest-time path. Second, real-time traffic data: aggregate driver GPS traces per road segment every 2 minutes to compute current average speeds, replacing static speed limits in the graph. Third, an ML model trained on millions of historical trips that adjusts ETAs for factors the graph misses: time-of-day patterns, weather, local events, pickup/dropoff delays at specific locations (airports, stadiums). The ML model can reduce ETA error by 20-30% compared to pure graph routing. For real-time serving, the graph is partitioned using contraction hierarchies to reduce query time from seconds to milliseconds.",
      followUps: [
        "How do you handle ETA accuracy for very short trips vs cross-city trips?",
        "How frequently do you update traffic data on each road segment?",
      ],
    },
    {
      q: "How do you ensure payment consistency in a distributed system with regional failovers?",
      a: "Payments use a two-phase approach: pre-authorization at ride match time and capture at trip completion. The payment service writes to a globally replicated database (e.g., Google Spanner or CockroachDB) to ensure that authorization tokens are available even during regional failover. All payment operations are idempotent: each uses a unique idempotency key (tripId + operation type) so that retries after network failures never result in double charges. If the trip service fails mid-ride, the driver app caches trip state locally and syncs on reconnection. The payment system has a reconciliation job that runs every hour to detect and fix discrepancies between authorized and captured amounts. For refunds and dispute resolution, the full trip event log (sourced from Kafka) provides an auditable record of every state transition.",
      followUps: [
        "How would you handle a scenario where the payment capture fails after the trip is completed?",
        "What consistency model do you use for the payment database vs the trip database?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for the location ingestion path.",
      a: "Start from drivers: 5M concurrent drivers x 1 ping per 4 seconds = 1.25M writes/second. Each ping is ~100 bytes (driverId, lat/lng, timestamp, heading, speed, accuracy), so ~125 MB/s of ingest and ~10.8 TB/day of history. Only the latest ping per driver matters for matching, so the live working set is just 5M records (~2.5 GB globally, tens of MB per city shard) — the full history streams to Cassandra/HDFS with a TTL. Connection count: 5M driver sockets plus ~1M rider sockets watching trips = ~6M concurrent WebSockets; at ~100K connections per gateway node that is ~60 nodes plus headroom. The read side is comparatively tiny: ~700 ride requests/s at peak, each triggering one k-ring geo query and ~20 ETA computations. The 1000:1 write-to-read ratio is the argument for an in-memory index fed by Kafka instead of a database.",
      followUps: [
        "How would the numbers change if you reduced ping frequency to every 10 seconds for idle drivers?",
        "Where does backpressure go if the geo index consumer falls behind Kafka?",
      ],
    },
    {
      q: "Why did Uber build H3 with hexagons instead of using square grid cells?",
      a: "Three reasons. First, neighbor uniformity: every hexagon has exactly 6 neighbors, all at the same center-to-center distance. A square has 4 edge neighbors and 4 corner neighbors ~41% farther away, which distorts any computation that treats 'adjacent cell' as 'roughly equidistant' — ring-based radius search, surge zone smoothing, and demand gradient calculations all behave more predictably on hexes. Second, k-ring expansion is clean: ring k adds exactly 6k cells, so expanding search radius is simple arithmetic. Third, hexagons approximate circles better than squares, so a hex-based surge zone or search area has less corner error relative to the true radius of interest. The trade-off is that hexagons do not perfectly subdivide into child hexagons (H3's hierarchy is approximate, with ~7 children per parent and slight boundary mismatch), whereas S2/quadtree squares nest exactly — which is why systems needing exact hierarchical containment sometimes prefer S2.",
      followUps: [
        "When would S2's exact hierarchical nesting matter more than hex neighbor uniformity?",
        "How do you pick the H3 resolution for driver search vs surge zones?",
      ],
    },
    {
      q: "The driver's phone loses connectivity for 3 minutes during an active trip. What happens?",
      a: "Nothing user-visible should break. The driver app is the source of truth for an in-progress trip: it continues recording the GPS trace and any state changes (arrived, trip started) locally. Server-side, the location service stops receiving pings; it dead-reckons the position briefly using the Kalman filter's prediction step and marks the driver's position as stale rather than cancelling anything — the rider's map may show a frozen or estimated car position. The trip state machine has no timeout that cancels an active trip on silence alone. On reconnect, the app replays its buffered trace and state transitions; the server applies them through the same conditional state-transition logic (duplicates and out-of-order events are rejected by the compare-and-set), and the fare is computed from the reconciled full trace. The key design principle: connectivity affects observability of the trip, never the existence of the trip.",
      followUps: [
        "What if the driver app crashes entirely and loses its local buffer?",
        "How do you distinguish a connectivity gap from a driver going off-route or offline intentionally?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Why does Uber query 9 geohash cells (target plus 8 neighbors) instead of just the target cell?",
      options: [
        "To load-balance queries across multiple servers",
        "Because drivers move between cells every few seconds",
        "To handle edge effects where a nearby driver is in an adjacent cell",
        "To increase the total number of candidate drivers for better matching",
      ],
      answerIndex: 2,
      explanation:
        "A rider at the edge of a geohash cell might have the nearest driver in an adjacent cell. Querying only the target cell would miss that driver. The 9-cell query (target plus 8 surrounding cells) ensures complete spatial coverage for nearby driver search.",
    },
    {
      q: "What is the primary advantage of batched bipartite matching over greedy nearest-driver assignment?",
      options: [
        "It reduces the number of database queries",
        "It optimizes global outcomes by considering all riders and drivers simultaneously",
        "It eliminates the need for ETA calculation",
        "It reduces the load on the Location Service",
      ],
      answerIndex: 1,
      explanation:
        "Batched matching solves the assignment problem globally: it finds the pairing that minimizes total pickup time across all rider-driver pairs in the batch, rather than greedily assigning each rider to the nearest available driver which can leave later riders with much longer waits.",
    },
    {
      q: "What technique does Uber use to prevent surge pricing oscillation?",
      options: [
        "Setting a fixed maximum multiplier cap",
        "Applying a weighted moving average over a 5-minute window",
        "Only updating surge prices once per hour",
        "Randomly selecting which zones receive surge pricing",
      ],
      answerIndex: 1,
      explanation:
        "A weighted moving average smooths the surge multiplier over a 5-minute window, preventing rapid oscillation where prices spike, riders stop requesting, prices drop, and riders flood back. The gradual adjustment gives both riders and drivers time to respond to pricing signals.",
    },
    {
      q: "Why is the Haversine formula insufficient as the sole ETA estimator?",
      options: [
        "It cannot handle coordinates near the poles",
        "It computes straight-line distance ignoring road networks, traffic, and obstacles",
        "It is too computationally expensive for real-time use",
        "It requires knowledge of Earth's exact shape which varies by region",
      ],
      answerIndex: 1,
      explanation:
        "Haversine computes the great-circle distance between two points on a sphere, ignoring roads, traffic, one-way streets, bridges, tunnels, and other real-world routing constraints. A 2 km straight-line distance might be a 5 km drive. Haversine is used only for fast preliminary filtering (eliminating distant drivers) before expensive road-network routing.",
    },
  ],
  flashcards: [
    {
      front: "How many location updates per second does Uber's system ingest?",
      back: "Approximately 1.25 million updates/second (5M active drivers sending GPS pings every 4 seconds).",
    },
    {
      front: "What is a geohash precision 6 cell size?",
      back: "Roughly 1.2 km x 0.6 km, suitable for urban driver search with 9-cell neighbor queries.",
    },
    {
      front: "Why does Uber use Google S2 cells instead of standard geohash?",
      back: "S2 cells provide uniform area coverage (geohash cells distort near poles), no edge discontinuities at the antimeridian, and hierarchical indexing via Hilbert curves.",
    },
    {
      front: "What is the batch interval for Uber's matching optimizer?",
      back: "2 seconds. Requests are collected over this window and solved as a minimum-cost bipartite matching problem using the Hungarian algorithm.",
    },
    {
      front: "How does Uber prevent surge pricing oscillation?",
      back: "By applying a 5-minute weighted moving average to the surge multiplier and gradually ramping down prices rather than dropping them abruptly.",
    },
    {
      front: "What is the two-phase payment approach in ride-hailing?",
      back: "Pre-authorize the estimated fare when the ride is matched, then capture the actual fare upon trip completion. This handles fare differences and prevents double-charging via idempotency keys.",
    },
    {
      front: "What three layers compose Uber's ETA calculation?",
      back: "1) Road-network graph routing (A* with contraction hierarchies), 2) Real-time traffic from aggregated GPS traces, 3) ML model adjusting for time-of-day, weather, and local events.",
    },
    {
      front: "How much memory does a city-level location shard use?",
      back: "Approximately 40-50 MB for a city with 80-100K active drivers (500 bytes per driver record including geohash, coordinates, status, and vehicle info).",
    },
    {
      front: "What is H3 and how does k-ring expansion work?",
      back: "Uber's open-source hexagonal hierarchical spatial index: the globe is tiled with hexagons at 16 resolutions, each with a 64-bit cell id. K-ring search fetches the center hex, then ring 1 (6 hexes), ring 2 (12), etc. — ring k adds 6k cells — stopping when enough driver candidates are found.",
    },
    {
      front: "Why not store live driver positions in PostgreSQL with a lat/lng B-tree index?",
      back: "B-trees index one dimension: a 2D range query scans an entire latitude band. Even R-tree/PostGIS indexes cannot sustain 1.25M position updates/second. Live positions belong in an in-memory cell-bucketed index; only history goes to disk (Cassandra).",
    },
    {
      front: "How is exactly-once payment achieved over an at-least-once network?",
      back: "Deterministic idempotency keys (tripId:auth, tripId:capture) that the payment processor dedupes on, a saga with compensating actions (void auth on cancellation), and an hourly reconciliation job that diffs internal payment state against processor records.",
    },
    {
      front: "How many WebSocket gateway nodes does the system need?",
      back: "~5M driver sockets + ~1M rider sockets = ~6M concurrent connections. At ~100K connections per tuned gateway node, roughly 60 nodes plus headroom for failover and deploys.",
    },
  ],
  exercises: [
    "Design a geospatial index that supports inserting 1M driver locations/second and querying all drivers within a 3 km radius in under 10 ms. Compare geohash-based and quadtree-based approaches in terms of insertion cost, query cost, and memory overhead.",
    "Implement a surge pricing simulator: given a stream of ride requests and driver availability updates for a single zone, compute the surge multiplier over time using a sliding-window supply-demand ratio. Handle edge cases where supply drops to zero.",
    "Design the trip state machine with all transitions, including edge cases: driver cancels after accepting, rider changes destination mid-trip, driver app loses connectivity for 2 minutes during an active trip. Define what happens to billing and driver availability in each case.",
    "Build a simplified ETA service that uses the Haversine formula for straight-line distance, then applies a city-specific road factor (typically 1.3-1.5x) and a time-of-day speed multiplier. Compare your estimates against actual trip data and measure the error distribution.",
    "Design the data model and matching algorithm for a shared-ride (UberPool) system. Given an active trip with pickup A and dropoff B, evaluate whether a new request with pickup C and dropoff D can be inserted into the route with less than 5 minutes of detour for the existing passenger.",
  ],
  revisionNotes: [
    "Uber ingests ~1.25M GPS updates/sec from ~5M active drivers sending pings every 4 seconds. Location Service is sharded by city with in-memory geospatial indexes.",
    "Geohash precision 6 cells are ~1.2km x 0.6km. Always query target cell plus 8 neighbors to avoid missing drivers at cell edges.",
    "Google S2 cells are preferred over geohash for uniform cell area and no pole/antimeridian edge effects. S2 level 12 cells are ~3.3 km2.",
    "Batched matching (2-sec windows) using the Hungarian algorithm produces 10-20% better average pickup times than greedy nearest-driver assignment.",
    "Surge pricing uses per-zone supply-demand ratio with a 5-minute rolling average to prevent oscillation. Zones are ~1 km2 hexagons.",
    "ETA = road-network A* routing + real-time traffic from GPS traces + ML adjustment. ML reduces error by 20-30% over pure graph routing.",
    "Payment uses pre-auth at match time + capture at completion. Idempotency keys (tripId + operation) prevent double charges during retries.",
    "Trip state machine: REQUESTED -> MATCHING -> MATCHED -> DRIVER_EN_ROUTE -> ARRIVED -> TRIP_IN_PROGRESS -> COMPLETED. Cancellation possible from multiple states.",
    "The Location Service uses Kafka for durability: on restart, replay recent Kafka messages to rebuild the in-memory index within seconds.",
    "GPS drift mitigation: Kalman filter smooths readings, rejecting physically impossible jumps (e.g., 5 km in 4 seconds).",
    "H3 k-ring search: center hex + ring k adds 6k cells (ring 5 = only 91 lookups total). Self-adapting: dense areas stop at ring 1, sparse areas expand further.",
    "Hexagons beat squares: all 6 neighbors equidistant (squares have 4 diagonal neighbors ~41% farther), cleaner ring expansion and less-distorted surge zones.",
    "WebSocket capacity: ~6M concurrent sockets (5M drivers + 1M watching riders) at ~100K per gateway node = ~60 nodes plus headroom.",
    "Payments = idempotency keys (tripId:auth / tripId:capture) + saga with compensations (void on cancel) + hourly reconciliation. Capture is async — never block trip completion on the processor.",
    "Trip transitions are conditional updates (compare-and-set on expected current state) + transactional-outbox Kafka events, making duplicate/out-of-order mobile events harmless.",
    "Degraded modes: dead-reckon GPS gaps (never auto-cancel active trips on silence), greedy matching if the optimizer dies, queue payment captures if the processor is down.",
  ],
  cheatSheet: [
    "20M rides/day, ~700 rides/sec peak, ~1.25M location updates/sec, ~10 TB/day location data",
    "Geohash: interleave lat/lng bits, base-32 encode. Precision 6 = ~1.2km x 0.6km. Query 9 cells for edge coverage.",
    "Quadtree: recursive spatial subdivision. O(log N) insert/query. Good for non-uniform driver density (dense downtown, sparse suburbs).",
    "Haversine: a = sin2(dlat/2) + cos(lat1)*cos(lat2)*sin2(dlng/2), d = 2R*atan2(sqrt(a), sqrt(1-a)). Quick distance filter before routing.",
    "Matching: batched bipartite assignment every 2 sec. Cost = f(pickup ETA, driver rating, experience, trip value). Hungarian algo O(n3).",
    "Surge = available_drivers / open_requests per zone. Multiplier applied when ratio < 0.5. Smoothed over 5-min window.",
    "ETA stack: A* on road graph with contraction hierarchies + real-time traffic overlay + ML model. Sub-100ms query time.",
    "Location Service: city-sharded, in-memory index, WebSocket ingestion, Kafka persistence, hot standby replicas, <2s failover.",
    "Trip states: REQUESTED -> MATCHING -> MATCHED -> EN_ROUTE -> ARRIVED -> IN_PROGRESS -> COMPLETED. Each transition emits Kafka event.",
    "Payment: pre-auth at match, capture at completion. Globally replicated DB for auth tokens. Hourly reconciliation job for discrepancies.",
    "H3: 16 resolutions, 64-bit cell ids, res 9 ~0.1 km2. k-ring: total cells after k rings = 1 + 3k(k+1).",
    "Tech map: Kafka (streams), H3/S2 in memory + Redis (geo + live positions), PostgreSQL (trips/users/payments), Cassandra (location history), gRPC + Envoy mesh (services), Stripe/Adyen (PSP).",
    "Sockets: 6M concurrent / 100K per node = ~60 WebSocket gateways. Offer flow: soft-lock driver, 10-15s countdown, release on decline/timeout.",
    "Idempotency keys are deterministic per operation (tripId:capture), never random per retry. Saga compensation: void auth on cancel.",
    "Degradation ladder: dead-reckon GPS gaps -> greedy matching fallback -> surge to 1.0x or cached -> queue payment captures. Trip existence never depends on connectivity.",
  ],
  glossary: [
    {
      term: "Geohash",
      definition:
        "A spatial encoding system that converts latitude and longitude into a short alphanumeric string by recursively bisecting coordinate ranges and interleaving the resulting bits. Longer strings represent smaller geographic areas.",
    },
    {
      term: "Quadtree",
      definition:
        "A tree data structure for 2D spatial indexing where each internal node has exactly four children representing quadrants. Points are recursively partitioned until each leaf contains fewer than a threshold number of points.",
    },
    {
      term: "Haversine Formula",
      definition:
        "A trigonometric formula for computing the great-circle distance between two points on a sphere given their latitudes and longitudes. Accurate for Earth distances but ignores terrain and road networks.",
    },
    {
      term: "Surge Pricing",
      definition:
        "Dynamic fare adjustment based on real-time supply-demand imbalance. When rider demand exceeds available driver supply in a zone, a multiplier is applied to fares to incentivize more drivers to enter the area and moderate excess demand.",
    },
    {
      term: "Contraction Hierarchies",
      definition:
        "A speed-up technique for shortest-path queries on road networks. The graph is preprocessed by iteratively contracting least-important nodes and adding shortcut edges, enabling query-time speedups of 1000x or more over plain Dijkstra.",
    },
    {
      term: "Hungarian Algorithm",
      definition:
        "An O(n3) algorithm for solving the minimum-cost assignment problem in a bipartite graph. In ride-hailing, it finds the optimal rider-to-driver pairing that minimizes total pickup cost across all matches in a batch.",
    },
    {
      term: "S2 Geometry",
      definition:
        "A library by Google that projects Earth's surface onto the six faces of a cube and uses Hilbert curves to define hierarchical cells. It provides uniform-area spatial indexing without the distortions of rectangular geohash grids.",
    },
    {
      term: "H3",
      definition:
        "Uber's open-source hexagonal hierarchical spatial index. The globe is tiled with hexagons at 16 resolutions, each cell identified by a 64-bit integer. Hexagons give equidistant neighbors and clean k-ring radius expansion, making them well suited to driver search and surge zones.",
    },
    {
      term: "K-ring Expansion",
      definition:
        "The radius-search pattern on a hex grid: query the center cell, then successive rings of neighbors (ring k contains 6k cells) until enough candidates are found. Bounds query cost to the local area regardless of total driver count.",
    },
    {
      term: "Idempotency Key",
      definition:
        "A deterministic identifier (e.g., tripId + operation type) attached to a payment or API request so the receiver can deduplicate retries. Guarantees that an operation retried after a timeout executes at most once, the foundation of exactly-once payment semantics.",
    },
    {
      term: "Saga Pattern",
      definition:
        "A way to manage a multi-step distributed transaction as a sequence of local transactions, each with a compensating action to undo it (e.g., void a payment authorization if the trip is cancelled). Trades atomicity for availability while preserving eventual business consistency.",
    },
    {
      term: "Transactional Outbox",
      definition:
        "A pattern where a service writes its state change and the corresponding event to the same database in one transaction; a relay then publishes the event to Kafka. Prevents the classic bug where the database commit succeeds but the event publish is lost (or vice versa).",
    },
    {
      term: "Dead Reckoning",
      definition:
        "Estimating a vehicle's current position from its last known position, heading, and speed when GPS updates are missing (tunnels, urban canyons). In a Kalman filter this is the prediction step running without measurement updates, with growing uncertainty.",
    },
  ],
  animations: [
    {
      title: "Matching a rider to a driver",
      steps: [
        {
          label: "Drivers report location",
          detail: "Every few seconds, into a geospatial index (geohash or S2 cells) in memory.",
        },
        {
          label: "Rider requests",
          detail: "Their location maps to a cell.",
        },
        {
          label: "Query neighbours",
          detail: "Fetch drivers in that cell and adjacent ones — a bounded set, not a global scan.",
        },
        {
          label: "Rank",
          detail: "By ETA using road distance, not straight-line, plus driver rating and acceptance rate.",
        },
        {
          label: "Offer and lock",
          detail: "Offer to the best driver with a short timeout; the assignment must be atomic so no driver gets two rides.",
        },
        {
          label: "Trip state",
          detail: "A state machine — requested, accepted, started, completed — with location streamed for the duration.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Geohash Grid",
      "Quadtree",
      "Google S2 Cells",
      "R-tree",
    ],
    rows: [
      [
        "Cell shape",
        "Rectangle (varies with latitude)",
        "Rectangle (uniform subdivision)",
        "Roughly square (projected cube face)",
        "Minimum bounding rectangle",
      ],
      [
        "Insertion complexity",
        "O(1) hash map insert",
        "O(log N) tree traversal",
        "O(1) hash of cell ID",
        "O(log N) with rebalancing",
      ],
      [
        "Range query",
        "O(k) for k cells queried",
        "O(log N + m) for m results",
        "O(k) for k cells queried",
        "O(log N + m) for m results",
      ],
      [
        "Edge handling",
        "Must query 8 neighbors for edge cases",
        "Natural via tree traversal",
        "Hierarchical containment, no edge issues",
        "Overlap-based search, handles naturally",
      ],
      [
        "Uniform cell area",
        "No, cells stretch near equator and shrink at poles",
        "Yes within bounds, but global coverage is uneven",
        "Yes, Hilbert curve gives near-uniform cells",
        "Not applicable, bounds are data-driven",
      ],
      [
        "Memory overhead",
        "Low, just hash map entries",
        "Moderate, tree node pointers",
        "Low, cell ID computation is stateless",
        "High, internal nodes store bounding boxes",
      ],
      [
        "Best for",
        "Simple proximity queries, easy to implement",
        "Non-uniform point distributions",
        "Global-scale uniform indexing",
        "Complex spatial queries with varied shapes",
      ],
    ],
  },
  followUps: [
    "How would you extend this design to support scheduled rides (book a ride for tomorrow at 8 AM)?",
    "How would you design the driver onboarding and real-time earnings tracking system?",
    "How does UberPool (shared rides) change the matching algorithm and routing engine?",
    "How would you handle cross-border rides where pricing, regulations, and payment methods change mid-trip?",
    "What observability and monitoring would you build to detect matching quality degradation in real time?",
    "How would you design a driver incentive system that balances supply across zones without creating perverse incentives?",
    "How would you shrink the 1.25M pings/sec write load — adaptive ping rates, client-side batching, or dead-reckoning on the server?",
    "How would you detect and handle GPS spoofing by drivers gaming airport queues or surge zones?",
    "How would the design change for a food-delivery variant (Uber Eats) where a 'trip' has three parties and two legs?",
    "What changes if you must support cash payments in markets where card penetration is low?",
  ],
  resources: [
    {
      label: "Uber Engineering Blog: Ringpop and Distributed Location Service", url: "https://www.uber.com/blog/engineering/",
      kind: "article",
      note: "Describes Uber's SWIM-based consistent hashing for sharding the real-time location service across nodes.",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing directly apply to Uber's architecture. Essential reading for the data layer design.",
    },
    {
      label: "Google S2 Geometry Library", url: "https://s2geometry.io/",
      kind: "repo",
      note: "The spatial indexing library used by Uber for hierarchical cell-based geospatial queries. Understanding S2 cells is critical for the location service design.",
    },
    {
      label: "System Design Interview Vol 2 by Alex Xu - Proximity Service Chapter", url: "https://bytebytego.com/",
      kind: "book",
      note: "Covers geospatial indexing approaches (geohash, quadtree, S2) with trade-off analysis directly relevant to Uber's driver lookup system.",
    },
    {
      label: "Uber Engineering: How Uber Computes ETA at Scale", url: "https://www.uber.com/blog/engineering/",
      kind: "article",
      note: "Details the contraction hierarchy approach for road-network routing and the ML model that adjusts ETAs using historical trip data.",
    },
  ],
};
