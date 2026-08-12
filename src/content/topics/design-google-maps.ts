import type { TopicContent } from "../types";

export const designGoogleMaps: TopicContent = {
  quickSummary: [
    "Google Maps ingests petabytes of geospatial data (satellite imagery, street-level photos, road graphs, points of interest) and serves over 1 billion monthly active users across web and mobile. The system must render map tiles at sub-second latency, compute real-time driving directions, and continuously update traffic conditions.",
    "Spatial indexing structures such as quadtrees, R-trees, and geohash encodings partition the Earth's surface so that nearest-neighbor, range, and containment queries execute efficiently. Geohashes convert 2D coordinates into a single sortable string, enabling prefix-based proximity lookups in standard databases.",
    "Map rendering follows a tile pyramid model: the world is recursively subdivided into 256x256 pixel tiles at each zoom level (0-21). Level 0 has 1 tile, level N has 4^N tiles. Clients request only the visible tiles for the current viewport and zoom, and a CDN caches pre-rendered raster or vector tiles close to the user.",
    "Routing relies on graph algorithms (Dijkstra, A*, contraction hierarchies) applied to a weighted road graph with billions of edges. Real-time traffic data from GPS probes adjusts edge weights, enabling dynamic ETA computation and rerouting. Contraction hierarchies pre-process the graph to answer long-distance queries in milliseconds.",
    "Supporting services include geocoding (address to coordinates), reverse geocoding (coordinates to address), place search (fuzzy text matching over POI databases), and ETA estimation (combining distance, live traffic, historical patterns, and road type). Each is independently scalable and fault-tolerant.",
  ],
  detailed: [
    "## High-Level Architecture\n\nThe system is decomposed into several independently deployable services: a Tile Service for map rendering, a Routing Service for directions, a Traffic Service for real-time road conditions, a Geocoding Service for address resolution, a Place Service for POI search, and an ETA Service. A global CDN sits in front of the Tile Service and caches rendered tiles at edge locations. Clients (web and mobile) interact through an API Gateway that routes requests, enforces rate limits, and handles authentication. The road graph, satellite imagery, and POI data are stored in specialized backends: the road graph in a graph database or adjacency-list representation on distributed storage, imagery in object storage (e.g., Google Cloud Storage), and POI data in a search-optimized store like Elasticsearch. A data ingestion pipeline continuously integrates updates from satellite providers, street-view cars, user-reported edits, and third-party data feeds. All services publish metrics and traces to a centralized observability platform for monitoring latency, error rates, and throughput.",
    "## Map Tile Rendering and Serving\n\nThe tile pyramid follows the Slippy Map convention: at zoom level z, the world is divided into 2^z columns and 2^z rows, producing 4^z tiles total. At zoom level 21, there are over 4 trillion tiles, but most are ocean or uninhabited terrain and need not be pre-rendered. A tile server receives requests in the form /{z}/{x}/{y}.png (raster) or .pbf (vector). For raster tiles, a rendering pipeline composites layers (terrain, roads, labels, buildings) using a style sheet and produces PNG images. Vector tiles encode geometry and metadata in Protocol Buffer format, allowing the client to render and style locally, which reduces bandwidth and enables smooth zooming and rotation. Pre-rendering is done offline for popular zoom levels and regions; less-visited tiles are rendered on demand and cached. The CDN serves cached tiles with long TTLs (days to weeks for base map tiles) and short TTLs for traffic overlay tiles. Cache invalidation is triggered by map data updates (new roads, building changes). Edge servers are placed in every major metro to keep tile latency under 100ms for the vast majority of users.",
    "## Routing Algorithms and Road Graph\n\nThe road graph models intersections as nodes and road segments as directed edges with weights (travel time, distance, toll cost). The graph has billions of nodes and edges globally. Dijkstra's algorithm finds the shortest path but explores too many nodes for continental-scale queries. A* improves on Dijkstra by using a heuristic (straight-line distance to the destination) to guide exploration toward the goal, reducing the search space significantly. For production-scale routing, contraction hierarchies (CH) are the standard approach: during preprocessing, the algorithm iteratively contracts the least important nodes, adding shortcut edges that preserve shortest-path distances. At query time, a bidirectional search from source and target meets in the middle, traversing only shortcut edges and important nodes, answering queries in microseconds. The preprocessing takes hours but is done offline and updated periodically. Edge weights are adjusted in real time using live traffic data: a Traffic Service collects GPS speed samples from millions of devices, aggregates them per road segment, and publishes updated weights. The routing engine blends live weights with historical averages for segments without recent data.",
    "## Spatial Indexing and Data Structures\n\nThree spatial indexing strategies are central to the system. A **quadtree** recursively divides a 2D region into four quadrants; each leaf node contains a bounded number of spatial objects (POIs, road segments). Queries descend only into quadrants that overlap the search region, pruning large portions of the space. An **R-tree** groups nearby objects into minimum bounding rectangles (MBRs) organized in a balanced tree; it excels at range and nearest-neighbor queries and is used in PostGIS and SQLite's R*-tree module. **Geohashing** encodes latitude and longitude into a base-32 string by interleaving their binary representations. Points sharing a common geohash prefix are spatially close, enabling proximity queries via simple string prefix matching in any sorted key-value store. However, geohash has edge cases at cell boundaries where nearby points may have very different prefixes; the standard mitigation is to query the target cell and its eight neighbors. The choice of indexing method depends on the query pattern: quadtrees for dynamic insertions and viewport queries, R-trees for complex geometric queries, and geohashes for database-friendly proximity lookups.",
    "## Traffic, ETA, and Failure Handling\n\nReal-time traffic data is collected from GPS-equipped devices (phones, fleet vehicles) reporting speed and location every few seconds. A stream processing pipeline (e.g., Apache Kafka plus Apache Flink) ingests these reports, maps them to road segments using hidden Markov model map-matching, aggregates speeds per segment over sliding windows (e.g., 2-minute windows), and publishes updated segment speeds to the Traffic Service. ETA estimation combines the shortest-path distance with segment-level speed estimates, adds delays for turns, traffic signals, and tolls, and applies a machine-learned correction factor trained on historical trip data. The ML model accounts for time of day, day of week, weather, and special events. For fault tolerance, the system replicates critical data (road graph, tile cache) across multiple data centers. If the Traffic Service is unavailable, the routing engine falls back to historical speed profiles. Tile serving degrades gracefully: stale tiles are served from CDN cache even if the origin is down. The Routing Service is partitioned geographically (e.g., by continent or country) so that a failure in one region does not affect others. Circuit breakers and retry budgets prevent cascading failures across service boundaries.",
  ],
  deepDive: [
    "Contraction hierarchies deserve deeper examination because they are the backbone of production routing at Google-scale. The preprocessing phase assigns an importance score to each node (based on edge difference, spatial diversity, and contracted neighbor count), then contracts nodes in increasing importance order. Contracting a node u means: for every pair of neighbors (v, w), if the shortest path from v to w goes through u, add a shortcut edge v->w with weight w(v,u)+w(u,w), then remove u from the active graph. This produces a hierarchy where the most important nodes (highway junctions, major intersections) remain at the top. Query time uses a bidirectional Dijkstra that searches upward in the hierarchy from both source and target. The search spaces are tiny compared to the full graph, typically visiting only a few hundred nodes even for cross-country routes. Updates to edge weights (due to traffic) require partial re-contraction, which is handled by customizable contraction hierarchies (CCH) that separate the topology preprocessing from the metric (weight) customization, allowing sub-second metric updates.",
    "Map-matching is a non-trivial problem that sits at the intersection of the Traffic and Routing services. Raw GPS traces are noisy (5-15m accuracy) and may jump between parallel roads, tunnels, or overpasses. A hidden Markov model (HMM) approach treats each GPS observation as an emission and each candidate road segment as a hidden state. Transition probabilities are based on the shortest-path distance between candidate segments, and emission probabilities are based on the Gaussian distance from the GPS point to the segment. The Viterbi algorithm finds the most probable sequence of road segments, producing a clean, topologically consistent trace. This matched trace is then used to compute per-segment travel times, which feed into the traffic aggregation pipeline. The quality of map-matching directly impacts ETA accuracy, so the system continuously evaluates match quality using ground-truth data from fleet vehicles with high-precision GPS.",
    "Vector tiles represent a major evolution from raster tiles. Instead of pre-rendered pixel images, vector tiles encode geometric primitives (points, lines, polygons) and associated attributes in a compact binary format (Mapbox Vector Tile specification uses Protocol Buffers). The client GPU renders these primitives using programmable shaders, enabling smooth rotation, tilting, and continuous zooming without visible pixelation. Vector tiles are typically 5-10x smaller than equivalent raster tiles, reducing bandwidth and storage costs. The trade-off is higher client-side computation: mobile devices must decode and render the geometry, which can strain low-end hardware. The rendering pipeline applies style sheets (analogous to CSS for maps) that define how each feature type (road, building, water, park) appears at each zoom level. Styles can be changed client-side without re-fetching tiles, enabling dark mode, satellite overlay, and accessibility themes. Label placement is a particularly challenging subproblem: labels must not overlap, must follow road curvature, and must prioritize more important features, all computed in real time during rendering.",
    "Scaling the place search and geocoding services to handle billions of queries per day requires careful architecture. Geocoding uses a combination of address parsing (splitting '123 Main St, Springfield, IL 62704' into components), fuzzy matching against an address database, and spatial validation (ensuring the matched address is in the correct geographic region). The address database is partitioned by country and indexed by normalized address tokens. For place search, an inverted index maps text tokens to POI records, augmented with spatial filtering (only return results near the user's location). Ranking combines text relevance, geographic proximity, popularity (based on visit frequency from anonymized location data), recency of reviews, and business status (open/closed). Autocomplete is powered by a prefix trie with ranked suggestions, updated in near-real-time as new businesses are added. The system handles misspellings via edit-distance matching and phonetic encoding (Soundex, Metaphone). All of this runs on a sharded, replicated cluster with sub-50ms p99 latency targets.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "A* pathfinding on a weighted road graph using a priority queue and haversine heuristic",
      source: `#include <vector>
#include <queue>
#include <unordered_map>
#include <cmath>
#include <limits>

struct Edge {
    int to;
    double weight; // travel time in seconds
};

struct Node {
    double lat, lon;
    std::vector<Edge> adj;
};

// Haversine distance in meters (used as heuristic)
double haversine(double lat1, double lon1, double lat2, double lon2) {
    constexpr double R = 6371000.0; // Earth radius in meters
    double dlat = (lat2 - lat1) * M_PI / 180.0;
    double dlon = (lon2 - lon1) * M_PI / 180.0;
    double a = std::sin(dlat / 2) * std::sin(dlat / 2) +
               std::cos(lat1 * M_PI / 180.0) * std::cos(lat2 * M_PI / 180.0) *
               std::sin(dlon / 2) * std::sin(dlon / 2);
    return R * 2.0 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
}

// A* search: returns shortest travel time from src to dst
// parent map can be used to reconstruct the path
double aStarSearch(const std::vector<Node>& graph, int src, int dst,
                   std::unordered_map<int, int>& parent) {
    int n = static_cast<int>(graph.size());
    std::vector<double> g(n, std::numeric_limits<double>::infinity());
    // min-heap: (f-score, node)
    using PQEntry = std::pair<double, int>;
    std::priority_queue<PQEntry, std::vector<PQEntry>, std::greater<>> pq;

    g[src] = 0.0;
    double h0 = haversine(graph[src].lat, graph[src].lon,
                          graph[dst].lat, graph[dst].lon) / 30.0;
    // heuristic: distance / assumed avg speed (30 m/s ~ 108 km/h)
    pq.push({h0, src});
    parent.clear();

    while (!pq.empty()) {
        auto [f, u] = pq.top();
        pq.pop();

        if (u == dst) return g[dst];
        if (f > g[u] + haversine(graph[u].lat, graph[u].lon,
                                  graph[dst].lat, graph[dst].lon) / 30.0 + 1e-9)
            continue; // stale entry

        for (const auto& edge : graph[u].adj) {
            double tentative = g[u] + edge.weight;
            if (tentative < g[edge.to]) {
                g[edge.to] = tentative;
                parent[edge.to] = u;
                double h = haversine(graph[edge.to].lat, graph[edge.to].lon,
                                     graph[dst].lat, graph[dst].lon) / 30.0;
                pq.push({tentative + h, edge.to});
            }
        }
    }
    return std::numeric_limits<double>::infinity(); // unreachable
}`,
    },
    {
      language: "cpp",
      caption:
        "Geohash encoding and decoding: converts lat/lon to a base-32 geohash string and back",
      source: `#include <string>
#include <cmath>

static const char BASE32[] = "0123456789bcdefghjkmnpqrstuvwxyz";

// Encode latitude and longitude into a geohash string of given precision
std::string geohashEncode(double lat, double lon, int precision = 12) {
    double latRange[2] = {-90.0, 90.0};
    double lonRange[2] = {-180.0, 180.0};
    std::string hash;
    hash.reserve(precision);
    int bits = 0;
    int ch = 0;
    bool isLon = true; // alternate between lon and lat bits

    while (static_cast<int>(hash.size()) < precision) {
        double mid;
        if (isLon) {
            mid = (lonRange[0] + lonRange[1]) / 2.0;
            if (lon >= mid) {
                ch |= (1 << (4 - bits));
                lonRange[0] = mid;
            } else {
                lonRange[1] = mid;
            }
        } else {
            mid = (latRange[0] + latRange[1]) / 2.0;
            if (lat >= mid) {
                ch |= (1 << (4 - bits));
                latRange[0] = mid;
            } else {
                latRange[1] = mid;
            }
        }
        isLon = !isLon;
        bits++;
        if (bits == 5) {
            hash += BASE32[ch];
            bits = 0;
            ch = 0;
        }
    }
    return hash;
}

// Decode a geohash string back to lat/lon (center of the cell)
void geohashDecode(const std::string& hash, double& lat, double& lon) {
    double latRange[2] = {-90.0, 90.0};
    double lonRange[2] = {-180.0, 180.0};
    bool isLon = true;

    for (char c : hash) {
        int idx = 0;
        for (int i = 0; i < 32; i++) {
            if (BASE32[i] == c) { idx = i; break; }
        }
        for (int bit = 4; bit >= 0; bit--) {
            if (isLon) {
                double mid = (lonRange[0] + lonRange[1]) / 2.0;
                if (idx & (1 << bit)) lonRange[0] = mid;
                else                  lonRange[1] = mid;
            } else {
                double mid = (latRange[0] + latRange[1]) / 2.0;
                if (idx & (1 << bit)) latRange[0] = mid;
                else                  latRange[1] = mid;
            }
            isLon = !isLon;
        }
    }
    lat = (latRange[0] + latRange[1]) / 2.0;
    lon = (lonRange[0] + lonRange[1]) / 2.0;
}`,
    },
    {
      language: "cpp",
      caption:
        "Quadtree for 2D spatial indexing: insert points and query all points within a rectangular region",
      source: `#include <vector>
#include <memory>

struct Point {
    double x, y; // longitude, latitude
    int id;      // POI or node identifier
};

struct Rect {
    double xMin, yMin, xMax, yMax;

    bool contains(const Point& p) const {
        return p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax;
    }
    bool intersects(const Rect& other) const {
        return !(other.xMin > xMax || other.xMax < xMin ||
                 other.yMin > yMax || other.yMax < yMin);
    }
};

class QuadTree {
    static constexpr int CAPACITY = 8;
    Rect boundary;
    std::vector<Point> points;
    std::unique_ptr<QuadTree> nw, ne, sw, se; // children

    void subdivide() {
        double mx = (boundary.xMin + boundary.xMax) / 2.0;
        double my = (boundary.yMin + boundary.yMax) / 2.0;
        nw = std::make_unique<QuadTree>(Rect{boundary.xMin, my, mx, boundary.yMax});
        ne = std::make_unique<QuadTree>(Rect{mx, my, boundary.xMax, boundary.yMax});
        sw = std::make_unique<QuadTree>(Rect{boundary.xMin, boundary.yMin, mx, my});
        se = std::make_unique<QuadTree>(Rect{mx, boundary.yMin, boundary.xMax, my});
    }

public:
    explicit QuadTree(const Rect& bounds) : boundary(bounds) {}

    bool insert(const Point& p) {
        if (!boundary.contains(p)) return false;

        if (points.size() < CAPACITY && !nw) {
            points.push_back(p);
            return true;
        }
        if (!nw) {
            subdivide();
            // redistribute existing points
            for (const auto& pt : points) {
                nw->insert(pt) || ne->insert(pt) ||
                sw->insert(pt) || se->insert(pt);
            }
            points.clear();
        }
        return nw->insert(p) || ne->insert(p) ||
               sw->insert(p) || se->insert(p);
    }

    void queryRange(const Rect& range, std::vector<Point>& found) const {
        if (!boundary.intersects(range)) return;

        for (const auto& p : points) {
            if (range.contains(p)) found.push_back(p);
        }
        if (nw) {
            nw->queryRange(range, found);
            ne->queryRange(range, found);
            sw->queryRange(range, found);
            se->queryRange(range, found);
        }
    }
};

// Usage:
// QuadTree tree(Rect{-180, -90, 180, 90}); // whole world
// tree.insert({-73.9857, 40.7484, 1});      // Empire State Building
// std::vector<Point> results;
// tree.queryRange(Rect{-74.0, 40.7, -73.9, 40.8}, results);`,
    },
  ],
  diagrams: [
    {
      title: "Google Maps High-Level Architecture",
      kind: "architecture",
      caption:
        "Service decomposition showing clients, API gateway, core services, data stores, and CDN",
      mermaid: `graph LR
    Client["Client Web/Mobile"] --> CDN["CDN Edge"]
    Client --> GW["API Gateway"]
    CDN --> TS["Tile Service"]
    GW --> TS
    GW --> RS["Routing Service"]
    GW --> GS["Geocoding Service"]
    GW --> PS["Place Search Service"]
    GW --> ES["ETA Service"]
    RS --> TF["Traffic Service"]
    ES --> TF
    TS --> TileStore["Tile Storage S3"]
    RS --> GraphDB["Road Graph Store"]
    GS --> AddrDB["Address Database"]
    PS --> SearchIdx["Search Index"]
    TF --> Kafka["Kafka Stream"]
    Kafka --> Flink["Flink Processing"]
    Flink --> TF`,
    },
    {
      title: "Map Tile Request Flow",
      kind: "sequence",
      caption:
        "Sequence of events when a client pans the map and requests new tiles",
      mermaid: `sequenceDiagram
    participant C as Client
    participant CDN as CDN Edge
    participant TS as Tile Service
    participant Store as Tile Storage
    participant Renderer as Tile Renderer

    C->>CDN: GET /tiles/14/4823/6160.pbf
    alt Cache Hit
        CDN-->>C: 200 OK cached vector tile
    else Cache Miss
        CDN->>TS: Forward request
        TS->>Store: Lookup pre-rendered tile
        alt Tile exists
            Store-->>TS: Return tile bytes
        else Tile not found
            TS->>Renderer: Render on demand
            Renderer-->>TS: Generated tile
            TS->>Store: Cache rendered tile
        end
        TS-->>CDN: Return tile
        CDN-->>C: 200 OK vector tile
    end`,
    },
    {
      title: "Routing Request Flow",
      kind: "flow",
      caption:
        "Steps from user route request through graph search and traffic adjustment to final directions",
      mermaid: `flowchart TD
    A["User enters origin and destination"] --> B["Geocode addresses to coordinates"]
    B --> C["Identify graph partition"]
    C --> D["Load contraction hierarchy for region"]
    D --> E["Bidirectional search from source and target"]
    E --> F["Merge forward and reverse search"]
    F --> G["Unpack shortcut edges to full path"]
    G --> H["Fetch live traffic for path segments"]
    H --> I["Adjust edge weights with traffic"]
    I --> J["Compute ETA with ML correction"]
    J --> K["Generate turn-by-turn instructions"]
    K --> L["Return polyline and directions to client"]`,
    },
    {
      title: "Spatial Indexing Comparison",
      kind: "mindmap",
      caption:
        "Overview of spatial indexing strategies used across Google Maps services",
      mermaid: `graph TD
    SI["Spatial Indexing"] --> QT["Quadtree"]
    SI --> RT["R-tree"]
    SI --> GH["Geohash"]
    SI --> H3["H3 Hexagonal Grid"]
    QT --> QT1["Recursive 4-way split"]
    QT --> QT2["Viewport tile queries"]
    QT --> QT3["Dynamic insert and delete"]
    RT --> RT1["Minimum bounding rectangles"]
    RT --> RT2["Range and nearest neighbor"]
    RT --> RT3["Used in PostGIS"]
    GH --> GH1["Base-32 string encoding"]
    GH --> GH2["Prefix-based proximity"]
    GH --> GH3["Edge case at cell borders"]
    H3 --> H31["Hexagonal cells"]
    H3 --> H32["Uniform area coverage"]
    H3 --> H33["Used by Uber and ride-sharing"]`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the map tile serving system to handle billions of tile requests per day?",
      a: "The tile serving system uses a multi-layer caching strategy. At the outermost layer, a global CDN (like Google's own edge network or Cloudflare) caches tiles at hundreds of edge locations worldwide, serving the majority of requests without hitting origin servers. Base map tiles are immutable for long periods, so they carry long Cache-Control TTLs (weeks or months). Behind the CDN, a distributed tile cache (Memcached or Redis cluster) holds recently accessed tiles in memory. The origin tile servers read pre-rendered tiles from object storage (Google Cloud Storage or S3). For tiles not yet rendered (uncommon zoom levels or newly mapped areas), a rendering pipeline generates them on demand using the raw geospatial data and a style specification, then writes the result to storage and cache. Traffic overlay tiles have short TTLs (1-5 minutes) because they change frequently. The system shards tile storage by zoom level and geographic region to distribute load evenly.",
      followUps: [
        "How would you handle cache invalidation when map data is updated?",
        "What is the difference between raster and vector tiles, and when would you choose each?",
        "How do you handle tile rendering for areas with very dense data like downtown Tokyo?",
      ],
    },
    {
      q: "Why are contraction hierarchies preferred over plain A* for production routing?",
      a: "Plain A* on the full road graph is too slow for continental-scale queries. Even with the haversine heuristic, A* may explore millions of nodes for a cross-country route, taking seconds per query, which is unacceptable when serving millions of concurrent routing requests. Contraction hierarchies (CH) preprocess the graph by contracting less important nodes and adding shortcut edges, creating a multi-level hierarchy. At query time, a bidirectional search from source and target only traverses upward in the hierarchy, visiting a few hundred nodes regardless of the physical distance, answering queries in microseconds. The preprocessing cost is high (hours for a continental graph) but is done offline and amortized over billions of queries. The trade-off is that edge weight updates (from traffic) require re-preprocessing, but customizable contraction hierarchies (CCH) solve this by separating topology from metric, allowing weight updates in milliseconds without full re-contraction.",
      followUps: [
        "How do you handle multi-modal routing (driving plus transit)?",
        "What happens to routing quality during the preprocessing update window?",
      ],
    },
    {
      q: "How does the system estimate ETA accurately given constantly changing traffic?",
      a: "ETA estimation is a multi-signal prediction problem. The baseline is the sum of travel times along each road segment on the planned route, using either live speed data (if available for that segment) or historical speed profiles (average speed by time of day and day of week). A machine-learned model then applies corrections based on features like: number and type of intersections along the route, left turns across traffic, highway on/off ramp delays, weather conditions (rain reduces speeds by an estimated percentage), and known construction zones. The model is trained on millions of completed trips where the actual travel time is known, minimizing the gap between predicted and actual ETA. For segments without recent GPS probe data (rural roads, low-traffic areas), the system falls back to speed limits with a statistical discount factor. The ETA is continuously updated during navigation as the driver progresses, incorporating newly observed traffic ahead. Google reports their ETA predictions are accurate to within a few percent on well-trafficked routes.",
      followUps: [
        "How would you detect and handle incidents (accidents, road closures) in real time?",
        "How does the ETA model handle seasonal variations and special events?",
      ],
    },
    {
      q: "Explain how geohashing works and its limitations for proximity queries.",
      a: "Geohashing converts a (latitude, longitude) pair into a compact string by interleaving the binary representations of the two coordinates and encoding the result in base-32. Each character of the geohash narrows the bounding box: a 6-character geohash represents a cell roughly 1.2km x 0.6km. Two points sharing a long common prefix are guaranteed to be in the same or adjacent cells, making proximity queries efficient as database prefix scans (WHERE geohash LIKE 'abc%'). However, geohash has a critical edge-case problem: two points on opposite sides of a cell boundary may share no common prefix despite being meters apart. The standard mitigation is to query not just the target cell but also its eight surrounding neighbors. Another limitation is non-uniform cell shapes near the poles, where cells become elongated. Despite these issues, geohash is widely used because it integrates seamlessly with any sorted key-value store or SQL database with a B-tree index, requiring no specialized spatial database extension.",
      followUps: [
        "How does Google S2 geometry library improve on basic geohashing?",
        "When would you choose an R-tree over geohashing?",
      ],
    },
    {
      q: "How would you handle failure scenarios in the routing and traffic services?",
      a: "The routing service is partitioned by geographic region (e.g., per country or continent). Each partition has multiple replicas across data centers, so a single data center outage does not affect routing for that region. If the traffic service is unavailable, the routing engine gracefully degrades by using historical speed profiles instead of live traffic data. This produces slightly less accurate ETAs but still functional routes. The contraction hierarchy graph is loaded into memory on routing servers; if a server crashes, a new instance loads the graph from distributed storage (this takes seconds to minutes, so spare capacity handles traffic during recovery). Circuit breakers between services prevent cascading failures: if the geocoding service is slow, the routing service returns an error rather than blocking indefinitely. For the tile service, the CDN continues serving cached tiles even if the origin is completely down, providing a read-only degraded experience. All services implement retry with exponential backoff and jitter for transient failures, and dead-letter queues capture failed traffic data points for later reprocessing.",
      followUps: [
        "How would you test the system's behavior under partial failures?",
        "What monitoring and alerting would you set up for these failure modes?",
      ],
    },
  ],
  mcqs: [
    {
      q: "At zoom level 15, approximately how many tiles cover the entire Earth in the Slippy Map tile scheme?",
      options: [
        "About 32,000 tiles",
        "About 1 million tiles",
        "About 1 billion tiles",
        "About 4 trillion tiles",
      ],
      answerIndex: 2,
      explanation:
        "At zoom level z, the total number of tiles is 4^z. For z=15, 4^15 = 1,073,741,824, which is approximately 1 billion tiles. Each zoom level quadruples the number of tiles from the previous level.",
    },
    {
      q: "Contraction hierarchies improve routing query speed primarily by:",
      options: [
        "Using a better heuristic function than A*",
        "Preprocessing the graph to add shortcut edges so that queries traverse far fewer nodes",
        "Partitioning the graph into disconnected subgraphs",
        "Converting the road network into a grid",
      ],
      answerIndex: 1,
      explanation:
        "Contraction hierarchies preprocess the graph by iteratively removing less important nodes and adding shortcut edges that preserve shortest-path distances. At query time, a bidirectional search visits only a few hundred important nodes instead of millions, reducing query time from seconds to microseconds.",
    },
    {
      q: "The primary limitation of geohash-based proximity queries is:",
      options: [
        "Geohashes cannot represent locations south of the equator",
        "Nearby points across a cell boundary may have completely different geohash prefixes",
        "Geohashes require a specialized database engine",
        "Geohash precision cannot be adjusted",
      ],
      answerIndex: 1,
      explanation:
        "Geohash cells have hard boundaries. Two points a few meters apart but on opposite sides of a cell boundary will have entirely different geohash strings with no shared prefix. The standard solution is to query the target cell plus its eight neighboring cells to catch all nearby points.",
    },
    {
      q: "Vector tiles differ from raster tiles in that they:",
      options: [
        "Are always larger in file size",
        "Encode geometry as primitives that the client renders, enabling smooth zoom and rotation",
        "Can only show satellite imagery",
        "Require server-side rendering for each unique viewport",
      ],
      answerIndex: 1,
      explanation:
        "Vector tiles encode roads, buildings, and other features as geometric primitives (points, lines, polygons) in a binary format like Protocol Buffers. The client GPU renders these using shaders, allowing smooth continuous zooming, rotation, and tilting without pixelation. They are typically 5-10x smaller than raster tiles.",
    },
  ],
  flashcards: [
    {
      front: "What is the tile pyramid / Slippy Map convention?",
      back: "At zoom level z, the world is divided into 2^z columns and 2^z rows, producing 4^z tiles. Level 0 has 1 tile covering the whole world; each successive level quadruples the number of tiles, increasing detail.",
    },
    {
      front: "How does A* improve over Dijkstra for routing?",
      back: "A* uses a heuristic function h(n) (e.g., straight-line distance to target) to prioritize exploring nodes closer to the goal. This dramatically reduces the number of nodes explored compared to Dijkstra, which expands uniformly in all directions.",
    },
    {
      front: "What are contraction hierarchies?",
      back: "A preprocessing technique that contracts unimportant nodes from the road graph, adding shortcut edges to preserve shortest paths. Query-time bidirectional search visits only important nodes, answering in microseconds even for continental distances.",
    },
    {
      front: "How does geohash encoding work?",
      back: "Interleave the binary representations of latitude and longitude, then encode the result in base-32. Each character narrows the bounding box. Shared prefixes indicate spatial proximity, enabling prefix-based database lookups.",
    },
    {
      front: "What is map-matching and why is it important?",
      back: "Map-matching snaps noisy GPS traces to the road network using an HMM and the Viterbi algorithm. It is essential for computing accurate per-segment travel times from raw GPS probe data, which feeds traffic estimation.",
    },
    {
      front: "How are traffic speeds aggregated from GPS probes?",
      back: "GPS-equipped devices report speed and location every few seconds. A stream pipeline (Kafka + Flink) maps reports to road segments, aggregates speeds over sliding windows (e.g., 2 minutes), and publishes updated segment speeds.",
    },
    {
      front: "What is the quadtree capacity threshold?",
      back: "Each quadtree node holds up to a fixed capacity of points (e.g., 8). When the capacity is exceeded, the node subdivides into four children (NW, NE, SW, SE) and redistributes its points.",
    },
    {
      front: "How does the CDN handle map tile caching?",
      back: "Base map tiles have long TTLs (days to weeks) since they change infrequently. Traffic overlay tiles have short TTLs (1-5 minutes). On origin failure, the CDN serves stale cached tiles for graceful degradation.",
    },
  ],
  exercises: [
    "Design a tile rendering pipeline that supports both raster (PNG) and vector (PBF) output. Specify the data flow from raw geospatial data through styling, compositing, and encoding. Address how you would prioritize rendering for popular regions and zoom levels versus on-demand rendering for less-visited areas.",
    "Implement a bidirectional Dijkstra algorithm for routing and compare its performance against unidirectional Dijkstra on a graph with 1 million nodes. Measure the number of nodes explored and wall-clock time for queries of varying distances (1km, 10km, 100km, 1000km).",
    "Build a geohash-based nearest-neighbor search that queries the target cell and its 8 neighbors. Handle the edge case where the query point is near the antimeridian (180 degrees longitude). Benchmark against a brute-force scan for datasets of 10K, 100K, and 1M points.",
    "Design the real-time traffic ingestion pipeline. Specify how GPS probe data flows from devices through Kafka, map-matching, segment aggregation, and into the Traffic Service. Include error handling for malformed GPS data, duplicate reports, and out-of-order timestamps.",
    "Architect a place search service that supports autocomplete with sub-100ms latency. Define the indexing strategy (prefix trie, inverted index, geospatial filter), the ranking signals (text relevance, proximity, popularity), and the sharding scheme for global scale.",
  ],
  revisionNotes: [
    "Google Maps serves 1B+ MAU with sub-second latency for tile rendering, routing, and place search across petabytes of geospatial data.",
    "The tile pyramid uses the Slippy Map convention: 4^z tiles at zoom level z. Vector tiles (Protocol Buffers) are 5-10x smaller than raster tiles and enable client-side rendering with smooth zoom/rotation.",
    "Spatial indexing uses quadtrees (viewport queries, dynamic inserts), R-trees (range and nearest-neighbor queries), and geohashes (prefix-based proximity in any sorted store).",
    "Geohash limitation: nearby points across cell boundaries have no shared prefix. Mitigate by querying the target cell plus 8 neighbors.",
    "Routing uses contraction hierarchies for production speed: preprocess to add shortcut edges, then bidirectional search visits only hundreds of nodes for any distance. Query time: microseconds.",
    "A* uses a heuristic (haversine distance / max speed) to guide search toward the target, reducing explored nodes compared to Dijkstra.",
    "Real-time traffic: GPS probes -> Kafka -> map-matching (HMM + Viterbi) -> segment speed aggregation (Flink) -> Traffic Service. Sliding window: 2 minutes.",
    "ETA = sum of segment travel times + ML correction (time of day, weather, turns, signals). Trained on millions of completed trips.",
    "Failure handling: geographic partitioning for routing, CDN serves stale tiles on origin failure, historical speeds as traffic fallback, circuit breakers between services.",
    "Place search combines inverted index (text), geospatial filter (proximity), and ranking (popularity, recency, business status). Autocomplete via prefix trie with ranked suggestions.",
  ],
  cheatSheet: [
    "Tile count at zoom z: 4^z tiles. Zoom 0 = 1 tile, zoom 10 = ~1M tiles, zoom 20 = ~1T tiles.",
    "Geohash precision: 4 chars ~ 39km, 6 chars ~ 1.2km, 8 chars ~ 38m, 12 chars ~ 3.7cm.",
    "A* time complexity: O(E) worst case, but heuristic typically reduces explored nodes by 10-100x vs Dijkstra.",
    "Contraction hierarchies: preprocessing O(n log n) with shortcuts, query time O(k) where k is a few hundred nodes regardless of distance.",
    "Vector tile format: Mapbox Vector Tile (MVT) spec, encoded in Protocol Buffers, typically 20-50 KB per tile.",
    "CDN TTLs: base tiles days-weeks, traffic overlay 1-5 min, satellite imagery months.",
    "Map-matching: HMM emission = Gaussian(GPS error), transition = shortest path distance. Solve with Viterbi in O(T * S^2).",
    "Road graph scale: ~1 billion nodes, ~2 billion edges globally. In-memory for a single country: 2-10 GB.",
    "Traffic aggregation window: 2-minute sliding window, update frequency every 1-2 minutes to segment speed store.",
    "ETA accuracy: within 2-5% on well-trafficked routes; degrades to 10-15% on rural/low-data roads.",
  ],
  glossary: [
    {
      term: "Quadtree",
      definition:
        "A tree data structure that recursively partitions a 2D space into four quadrants. Each internal node has exactly four children. Used for efficient spatial queries like range search and nearest neighbor over point or region data.",
    },
    {
      term: "Geohash",
      definition:
        "A geocoding system that encodes latitude and longitude into a short alphanumeric string by interleaving their binary representations and encoding in base-32. Nearby locations share common prefixes, enabling proximity queries via string prefix matching.",
    },
    {
      term: "Contraction Hierarchies",
      definition:
        "A speed-up technique for shortest-path queries. It preprocesses a graph by iteratively contracting less important nodes and adding shortcut edges. Query-time bidirectional search visits only important nodes, achieving microsecond query times on continental graphs.",
    },
    {
      term: "Tile Pyramid",
      definition:
        "A hierarchical scheme for serving map imagery where the world is recursively divided into square tiles at increasing zoom levels. Each level quadruples the tile count, providing progressively more detail. Also known as the Slippy Map tile scheme.",
    },
    {
      term: "Map-Matching",
      definition:
        "The process of aligning raw, noisy GPS traces to the known road network. Typically uses a hidden Markov model where road segments are hidden states and GPS observations are emissions, solved with the Viterbi algorithm.",
    },
    {
      term: "R-tree",
      definition:
        "A balanced tree data structure for indexing multi-dimensional spatial data. Objects are grouped into minimum bounding rectangles (MBRs) at each tree level. Supports efficient range queries, nearest-neighbor searches, and spatial joins.",
    },
    {
      term: "Vector Tile",
      definition:
        "A map tile format that encodes geographic features (roads, buildings, labels) as geometric primitives in a binary format (typically Protocol Buffers) rather than pre-rendered pixel images. The client renders the geometry using GPU shaders, enabling smooth zoom, rotation, and style changes.",
    },
  ],
  animations: [
    {
      title: "Computing a route",
      steps: [
        {
          label: "Road network as a graph",
          detail: "Intersections are nodes, road segments are edges weighted by traversal time.",
        },
        {
          label: "Naive Dijkstra",
          detail: "Correct, but exploring a continent-scale graph per request is far too slow.",
        },
        {
          label: "Precompute hierarchy",
          detail: "Contraction hierarchies precompute shortcuts so long routes skip local detail.",
        },
        {
          label: "Bidirectional search",
          detail: "Search from both ends and meet in the middle, cutting explored nodes dramatically.",
        },
        {
          label: "Live traffic",
          detail: "Edge weights updated from aggregated device speeds, so the same query returns different routes by time of day.",
        },
        {
          label: "Serve",
          detail: "Tiles and routes are cached aggressively at the edge; the hard computation happens rarely.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Quadtree",
      "R-tree",
      "Geohash",
      "H3 Hex Grid",
    ],
    rows: [
      [
        "Structure",
        "Recursive 4-way space partition",
        "Balanced tree of bounding rectangles",
        "1D string from interleaved lat/lon bits",
        "Hierarchical hexagonal cells on icosahedron",
      ],
      [
        "Best for",
        "Viewport queries, map tile indexing",
        "Range and nearest-neighbor queries",
        "Database-friendly proximity lookups",
        "Uniform area coverage, ride-sharing",
      ],
      [
        "Insert complexity",
        "O(log n) average",
        "O(log n) with possible rebalancing",
        "O(1) compute hash then B-tree insert",
        "O(1) compute cell ID",
      ],
      [
        "Range query",
        "Prune non-overlapping quadrants",
        "Prune non-overlapping MBRs",
        "Prefix scan plus 8 neighbor cells",
        "k-ring neighbor traversal",
      ],
      [
        "Edge cases",
        "Deep trees in clustered regions",
        "Overlap between MBRs degrades performance",
        "Boundary artifacts between cells",
        "Pentagon cells at 12 icosahedron vertices",
      ],
      [
        "Database integration",
        "Custom implementation required",
        "Native in PostGIS, SQLite R*-tree",
        "Works with any sorted index",
        "Library-based, cell ID as integer key",
      ],
    ],
  },
  followUps: [
    "How would you extend this design to support offline maps with downloadable map packs?",
    "How does Google Street View integrate with the Maps architecture, and how are panoramic images served?",
    "Design a ride-sharing service (like Uber) that builds on the Maps routing and ETA infrastructure.",
    "How would you add indoor mapping and navigation for large buildings like airports and malls?",
    "Explore how autonomous vehicle mapping (HD maps) differs from consumer-grade Google Maps.",
    "How would you design a real-time transit tracking and prediction system integrated with Maps?",
  ],
  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters on partitioning and stream processing are directly relevant to traffic ingestion and tile sharding.",
    },
    {
      label: "System Design Interview Vol. 2 by Alex Xu - Google Maps Chapter",
      kind: "book",
      note: "Covers tile serving, routing with contraction hierarchies, and proximity search in interview context.",
    },
    {
      label: "Google S2 Geometry Library",
      kind: "repo",
      note: "Google's open-source spherical geometry library used internally for spatial indexing. Provides hierarchical cell decomposition of the sphere.",
    },
    {
      label: "Mapbox Vector Tile Specification",
      kind: "docs",
      note: "The open specification for vector tiles using Protocol Buffers. Widely adopted by mapping platforms including Mapbox and OpenMapTiles.",
    },
    {
      label: "Contraction Hierarchies: Faster and Simpler Hierarchical Routing (Geisberger et al.)",
      kind: "article",
      note: "The foundational academic paper on contraction hierarchies, describing preprocessing and query algorithms in detail.",
    },
  ],
};
