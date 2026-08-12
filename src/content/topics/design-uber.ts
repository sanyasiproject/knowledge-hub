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
    "## Requirements and Scale Estimation\n\nFunctional requirements include rider requesting a ride, real-time driver-rider matching, ETA computation, fare estimation with dynamic pricing, trip tracking, and payment processing. Non-functional requirements demand sub-second location update ingestion, matching latency under 5 seconds, 99.99% availability, and strong consistency for payment but eventual consistency for location data. Scale estimation: 20M rides/day translates to ~230 rides/second at peak (assuming 3x peak-to-average ratio, ~700 rides/second peak). With 5M active drivers sending GPS pings every 4 seconds, the location service ingests ~1.25M updates/second. Each update is ~100 bytes (driverId, lat, lng, timestamp, heading, speed), producing ~125 MB/s of raw location data. Storage: 1.25M updates/sec x 86400 sec/day x 100 bytes = ~10 TB/day of location history. The system needs to support reads of ~500K nearby-driver queries/second during peak hours.",
    "## High-Level Architecture\n\nThe system decomposes into several core services. The Location Service ingests driver GPS updates via a persistent WebSocket connection, writes them to an in-memory geospatial index (sharded by city/region), and publishes updates to Kafka for downstream consumers. The Matching Service subscribes to ride requests from the API Gateway, queries the Location Service for nearby available drivers, runs the matching algorithm, and dispatches the best driver. The Trip Service manages the ride lifecycle state machine, persisting trip records to a database (PostgreSQL for transactional data, Cassandra for trip events). The Pricing Service computes fare estimates and surge multipliers using real-time supply-demand signals. The ETA Service uses a combination of road-network graph routing (Dijkstra or A* on OpenStreetMap data) and ML models trained on historical trip data. An API Gateway handles authentication, rate limiting, and routes requests to backend services. All inter-service communication uses gRPC for synchronous calls and Kafka for asynchronous events.",
    "## Geospatial Indexing and Location Tracking\n\nThe core data structure for spatial queries is a geohash-based grid or a quadtree. Geohashing encodes latitude and longitude into a single string by interleaving bits of each coordinate; longer prefixes represent smaller cells. A geohash of precision 6 (e.g., '9q8yyk') covers roughly 1.2 km x 0.6 km, which is ideal for urban driver search. To find drivers near a rider, compute the rider's geohash prefix and query all drivers in that cell plus the 8 neighboring cells (to handle edge effects). The location index is an in-memory hash map: geohash prefix maps to a set of driverIds. When a driver moves, remove them from the old cell and insert into the new cell, an O(1) operation. Uber actually uses a more sophisticated approach: Google S2 geometry library, which projects Earth onto a cube and uses Hilbert curves to index cells hierarchically. S2 cells at level 12 are roughly 3.3 km2, and at level 16 roughly 0.02 km2. The advantage over geohash is uniform cell area and no edge discontinuities at the antimeridian or poles. The location service is sharded by city, with each shard holding the geospatial index for one metropolitan area, keeping the working set in memory (~50 MB for a city with 100K active drivers).",
    "## Driver-Rider Matching and ETA Calculation\n\nMatching is not simply assigning the closest driver. Uber's dispatch system collects all unmatched ride requests and available drivers in a region, then solves a batched assignment problem every 2 seconds. The objective function minimizes total pickup ETA across all pairs while considering driver preferences, vehicle type match, and predicted trip value. This is modeled as a minimum-cost bipartite matching problem solved with the Hungarian algorithm or auction-based methods. For ETA calculation, the system maintains a road-network graph with ~100M edges globally. Real-time ETAs combine: (1) a graph shortest-path algorithm (A* with landmark heuristics) to compute route distance, (2) real-time traffic data from driver GPS traces aggregated per road segment, and (3) an ML model that adjusts for time-of-day, weather, and special events. Historical trip data shows that ML-adjusted ETAs are 20-30% more accurate than pure graph routing. The Haversine formula provides quick straight-line distance estimates for initial filtering (eliminating drivers more than 10 km away before running expensive graph routing).",
    "## Surge Pricing, Payments, and Failure Handling\n\nSurge pricing divides each city into hexagonal zones (~1 km2 each). For each zone, the system continuously computes the supply-demand ratio: available drivers divided by open ride requests. When demand exceeds supply beyond a threshold (e.g., ratio < 0.5), a surge multiplier is applied: typically 1.2x to 3x, capped at a regulatory maximum. The multiplier is smoothed over a 5-minute rolling window to avoid oscillation. Payment processing uses a two-phase approach: authorize the estimated fare when the ride is matched, then capture the actual fare on completion. This handles scenarios where the actual fare differs from the estimate. For failure handling, the system implements circuit breakers between services, fallback matching (greedy nearest-driver if the optimizer is down), and idempotent payment operations. If the matching service fails, riders see increased wait times but the system degrades gracefully rather than going offline. Driver location updates are buffered in Kafka so that a location service restart recovers state from the last few seconds of the stream. Trip state is event-sourced, allowing reconstruction from the event log if the Trip Service database fails.",
  ],
  deepDive: [
    "## Sharding the Location Service for Global Scale\n\nThe location service cannot run as a single instance at Uber's scale. The primary sharding strategy is geographic: each major city or metro area gets its own location service shard. A city like New York with ~80K active drivers at peak holds its entire geospatial index in ~40 MB of RAM (80K drivers x 500 bytes per driver record including geohash, coordinates, status, vehicle info). Cross-city rides (e.g., a driver near a city boundary) are handled by registering drivers in multiple shards for overlapping boundary zones. Within a city, the geospatial index uses consistent hashing on geohash prefixes to distribute across multiple nodes for fault tolerance. Each node is replicated with a hot standby that consumes the same Kafka partition of location updates. Failover time is under 2 seconds since the standby has a warm cache. Uber's system (named Ringpop) uses a SWIM protocol-based membership for node discovery and consistent hashing for request routing.",
    "## The Matching Algorithm in Depth\n\nThe naive greedy approach (assign each request to the nearest available driver) yields suboptimal global outcomes. Consider two riders A and B and two drivers X and Y. Driver X is closest to both riders, but assigning X to A might leave B with a 15-minute wait, while assigning X to B and Y to A gives both a 5-minute wait. Uber's batched matching collects requests over a 2-second window and solves the assignment as an optimization problem. The cost matrix C[i][j] represents the cost of assigning rider i to driver j, incorporating pickup ETA, predicted trip revenue, driver fatigue score, and rider priority. The Hungarian algorithm solves this in O(n^3) time, which is feasible for batches of ~100-500 requests per city per 2-second window. For larger cities, the problem is decomposed into geographic sub-regions that are solved independently. An important edge case is handling shared rides (UberPool): here the matching must consider detour impact on existing passengers, requiring simulation of the new route with the additional pickup/dropoff inserted into the current trip plan. The system evaluates all possible insertion points and selects the one minimizing total detour.",
    "## Real-Time Data Pipeline and Analytics\n\nEvery location update, trip event, and pricing decision flows into Uber's real-time data pipeline built on Apache Kafka and Apache Flink. Kafka topics are partitioned by city and data type: location-updates-nyc, trip-events-sf, etc. Flink jobs compute real-time aggregations: drivers available per zone per minute, average pickup times, surge multiplier effectiveness, and anomaly detection (e.g., a sudden drop in driver supply indicating a system issue). These aggregations feed back into the pricing and matching systems with sub-minute latency. For historical analytics, data flows from Kafka into HDFS via a connector, then into Hive/Presto tables for batch analysis. The total data volume exceeds 100 PB across all of Uber's storage. A key challenge is exactly-once processing semantics: duplicate location updates (from retries) must be deduplicated using driverId + timestamp as a natural key. Flink's checkpointing with Kafka offsets provides effectively-once processing, though the location service also implements client-side deduplication using a sliding-window bloom filter per driver.",
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
        "Core services and data flow in the Uber platform, from rider/driver clients through the API gateway to backend services",
      mermaid: `graph LR
    RiderApp[Rider App] --> GW[API Gateway]
    DriverApp[Driver App] -->|WebSocket| LS[Location Service]
    DriverApp --> GW
    GW --> MS[Matching Service]
    GW --> TS[Trip Service]
    GW --> PS[Pricing Service]
    GW --> ETA[ETA Service]
    LS --> GeoIdx[Geospatial Index]
    LS --> Kafka[Kafka]
    MS --> LS
    MS --> ETA
    MS --> TS
    PS --> Kafka
    TS --> TripDB[(Trip DB)]
    TS --> Kafka
    Kafka --> Analytics[Analytics Pipeline]
    Kafka --> ML[ML Training]
    ETA --> RoadGraph[(Road Network Graph)]
    PS --> SupplyDemand[Supply Demand Cache]`,
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
  ],
  resources: [
    {
      label: "Uber Engineering Blog: Ringpop and Distributed Location Service",
      kind: "article",
      note: "Describes Uber's SWIM-based consistent hashing for sharding the real-time location service across nodes.",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing directly apply to Uber's architecture. Essential reading for the data layer design.",
    },
    {
      label: "Google S2 Geometry Library",
      kind: "repo",
      note: "The spatial indexing library used by Uber for hierarchical cell-based geospatial queries. Understanding S2 cells is critical for the location service design.",
    },
    {
      label: "System Design Interview Vol 2 by Alex Xu - Proximity Service Chapter",
      kind: "book",
      note: "Covers geospatial indexing approaches (geohash, quadtree, S2) with trade-off analysis directly relevant to Uber's driver lookup system.",
    },
    {
      label: "Uber Engineering: How Uber Computes ETA at Scale",
      kind: "article",
      note: "Details the contraction hierarchy approach for road-network routing and the ML model that adjusts ETAs using historical trip data.",
    },
  ],
};
