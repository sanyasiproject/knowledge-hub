import type { TopicContent } from "../types";

export const designNetflix: TopicContent = {
  quickSummary: [
    "Netflix serves ~230 million subscribers globally, delivering ~1 billion hours of video per week. The platform uses a microservices architecture with thousands of services running on AWS, while video delivery is handled by Open Connect, Netflix's own CDN with appliances embedded in ISP networks worldwide.",
    "Adaptive Bitrate (ABR) streaming dynamically adjusts video quality based on network conditions. Video is pre-encoded into multiple bitrate/resolution profiles and chunked into small segments (2-10 seconds). The client monitors buffer level and throughput to select the optimal bitrate for each segment, minimizing rebuffering while maximizing visual quality.",
    "The recommendation engine drives ~80% of content watched on Netflix. It combines collaborative filtering (users with similar tastes), content-based filtering (genre, actors, director metadata), and deep learning models. Recommendations are personalized per profile and updated in near real-time based on viewing behavior.",
    "Content ingestion involves a multi-stage pipeline: raw media is uploaded, transcoded into hundreds of encoding profiles (varying resolution, bitrate, codec), and distributed to Open Connect Appliances (OCAs) worldwide. Netflix uses per-title encoding optimization, allocating bits based on content complexity rather than using fixed bitrate ladders.",
    "Fault tolerance is built into every layer. Netflix pioneered Chaos Engineering with tools like Chaos Monkey to randomly terminate instances in production. Circuit breakers, bulkheads, and fallback mechanisms ensure graceful degradation. If the recommendation service fails, users see a generic popular-content row instead of a blank screen.",
  ],
  detailed: [
    "## High-Level Architecture\n\nNetflix follows a two-plane architecture: the **control plane** runs on AWS and handles everything except video delivery (user authentication, profiles, billing, content catalog, recommendations, search, API gateway), while the **data plane** is Open Connect, Netflix's purpose-built CDN that serves actual video bytes. The API gateway (Zuul) handles routing, authentication, rate limiting, and request decoration for all client requests. Behind the gateway, hundreds of microservices communicate via gRPC and asynchronous event buses. Each service owns its data store, following the database-per-service pattern. Netflix uses Cassandra for high-write workloads like viewing history, MySQL for billing and account data, Elasticsearch for search, and EVCache (memcached-based) as a distributed caching layer that handles 30+ million requests per second. The entire control plane runs across multiple AWS regions with active-active failover for high availability.",
    "## Video Ingestion and Encoding Pipeline\n\nWhen a new title arrives, it enters the content ingestion pipeline. The raw media file (often a high-resolution master in ProRes or JPEG2000) is uploaded to S3 and triggers an encoding workflow orchestrated by a DAG-based pipeline engine. Netflix encodes each title into **hundreds of output files**: multiple resolutions (from 240p to 4K), multiple bitrates per resolution, multiple codecs (H.264, H.265/HEVC, VP9, AV1), and formats for different devices. Per-title encoding optimization analyzes the visual complexity of each title: a static dialogue scene needs fewer bits than an action sequence, so the bitrate ladder is customized per title rather than using a fixed ladder. Each encoded file is chunked into segments of 2-10 seconds, enabling adaptive streaming. The encoded assets are then pushed to Open Connect Appliances strategically placed in ISP networks worldwide, using a popularity-based pre-positioning algorithm. Titles predicted to be popular in a region are proactively pushed to nearby OCAs before peak hours.",
    "## CDN and Open Connect Architecture\n\nOpen Connect is Netflix's custom CDN comprising thousands of appliances (OCAs) deployed inside ISP networks globally. Each OCA is a commodity server loaded with high-capacity SSDs and HDDs, running FreeBSD with a custom HTTP server optimized for large sequential reads. When a client requests a video, the playback service on AWS returns a ranked list of OCA URLs that can serve the content, ordered by proximity, load, and health. The client connects to the best OCA using HTTPS and begins fetching video segments. If an OCA fails mid-stream, the client seamlessly switches to the next OCA in the list. The OCA network is organized into two tiers: **embedded OCAs** sit inside ISP networks and serve the most popular content, while **fill OCAs** in IXP locations serve less popular content and fill the embedded OCAs. Content popularity follows a Zipf distribution: a small fraction of titles accounts for the majority of traffic, so embedded OCAs with limited storage can still serve most requests locally. The steering service uses BGP data, DNS resolution, and real-time health telemetry to direct clients optimally.",
    "## Recommendation Engine and Personalization\n\nNetflix's recommendation system is a multi-stage pipeline. The **candidate generation** stage retrieves a broad set of potentially relevant titles using collaborative filtering models (matrix factorization, neural collaborative filtering) and content-based signals. The **ranking** stage applies a more complex model (deep neural networks) to score and rank candidates for a specific user. The **re-ranking** stage applies business rules (diversity, freshness, promotional boosts) and assembles the final rows on the homepage. Collaborative filtering identifies users with similar viewing patterns: if users A and B both watched and rated many of the same titles highly, titles that A watched but B has not are recommended to B. Content-based filtering uses metadata features: genre, cast, director, tags, and even visual features extracted from thumbnails. Netflix also personalizes artwork: different users see different thumbnail images for the same title, chosen by a contextual bandit algorithm that learns which image best drives engagement for each user segment. The entire pipeline runs on Spark for batch processing and Flink for real-time event processing.",
    "## Low-Level Design: Data Models and Key Algorithms\n\nThe **user profile service** stores user data in Cassandra with partition key userId. Each profile contains preferences, maturity settings, language, and a viewing history log. Viewing history is an append-only event stream stored in Cassandra with partition key (profileId) and clustering key (timestamp), enabling efficient range queries for recent activity. The **content catalog service** stores metadata in a graph-like structure: titles have relationships to genres, actors, directors, and similar titles. This is backed by a combination of MySQL for structured metadata and Elasticsearch for full-text search. For the adaptive bitrate algorithm, the client maintains a sliding window of recent throughput measurements and a buffer occupancy model. The algorithm selects the highest bitrate whose estimated download time for the next segment is less than the segment duration, with a safety margin based on current buffer level. Consistent hashing is used extensively: for routing users to cache shards in EVCache, for distributing content across OCA clusters, and for partitioning data in Cassandra. Netflix uses virtual nodes (vnodes) in their consistent hash ring to ensure uniform distribution even when nodes have heterogeneous capacity.",
    "## Capacity Estimation: Why the Numbers Force Open Connect\n\nDoing the arithmetic up front is what turns this from a generic design into the Netflix design. Assume ~250M subscribers globally. At evening peak, roughly 8-10% stream concurrently: 250M x 0.10 = **25M concurrent streams**. At an average delivered bitrate of ~5 Mbps (a blend of mobile SD and living-room 4K), peak egress is 25M x 5 Mbps = 125,000,000 Mbps = **~125 Tbps** of sustained video traffic.\n\nKey insight: No commercial CDN or cloud egress model survives that number economically. A 5 Mbps stream consumes 5/8 MB/s x 3600s = ~2.25 GB per viewing hour; 25M concurrent viewers burn ~56 PB per hour at peak. Even at an aggressive $0.01/GB CDN rate that is ~$560K per peak hour — hundreds of millions per year. Owning the appliances and peering settlement-free with ISPs turns a per-GB cost into a mostly fixed hardware cost, which is exactly why Open Connect exists.\n\nCatalog storage math: with a catalog of ~15,000 titles averaging ~1.5 hours, one codec family's full bitrate ladder (from ~235 Kbps up to ~16 Mbps for 4K) sums to roughly 50 Mbps of aggregate encoded bitrate, i.e. ~6.25 MB/s x 5,400s = **~34 GB per title per codec family**. Across 3-4 codec families (H.264, HEVC, VP9, AV1) plus audio tracks and subtitles, budget ~120-150 GB per title, so the whole encoded catalog is 15,000 x ~135 GB = **~2 PB**. That is small for S3 — the real cost is that popular subsets of it are replicated onto thousands of OCAs, which is why popularity prediction and Zipf-aware placement matter more than raw storage.\n\nCommon mistake: Candidates estimate storage as the bottleneck. For a fixed catalog service like Netflix, storage is trivial (~2 PB) while egress bandwidth (~125 Tbps peak) is the number that dictates the entire architecture. Say the bandwidth number early.",
    "## Adaptive Streaming: DASH, Bitrate Ladders, and Per-Title Encoding\n\nEvery Netflix stream is just a sequence of small HTTP GETs against static files — there is no long-lived video protocol. Titles are packaged for **MPEG-DASH** (and device-specific variants): each title is encoded into a ladder of quality levels — for example 235 Kbps @ 320x240, 750 Kbps @ 608x342, 1,750 Kbps @ 1280x720, 4,500 Kbps @ 1920x1080, up to ~16 Mbps @ 4K — and each rendition is chunked into 2-10 second segments. The client downloads a manifest (MPD) listing every rendition and segment URL, then independently decides, segment by segment, which rung of the ladder to fetch.\n\nPer-title encoding replaces the one-size-fits-all ladder with a per-content one. Netflix runs trial encodes across the resolution-bitrate space, scores each with **VMAF** (their perceptual quality metric), and keeps the convex hull of points that maximize quality per bit. For example, an animated series may hit VMAF 95 at 1080p with only 2 Mbps, while a grainy dark thriller may need 6 Mbps for the same score — a fixed ladder would waste bits on the first and starve the second.\n\nIn practice: because segments are plain cacheable HTTP objects, the entire delivery tier needs no session state — any OCA holding the bytes can serve any viewer, mid-stream failover is just retrying the next segment URL against the next OCA in the ranked list, and TCP/TLS (moving to HTTPS with session reuse) does the rest.\n\nKey insight: ABR pushes the intelligence to the client. The server-side stays dumb and cacheable; the client owns the control loop (throughput EWMA + buffer occupancy). This inversion is what lets a 125 Tbps system run on commodity static-file servers.",
    "## The Netflix Stack by Name\n\nInterviewers reward candidates who can name the real components, because each name encodes a design decision. **Zuul** is the edge API gateway: routing, authentication, rate limiting, request decoration, and canary traffic shaping. **Eureka** is the service registry — services self-register and clients discover instances without hardcoded endpoints, which is what makes chaos-killing instances survivable. **Ribbon** does client-side load balancing over Eureka's view. **Hystrix** (patterns now carried by resilience4j) wraps every inter-service call in a circuit breaker with a bounded thread pool and a fallback. **EVCache** is the memcached-based distributed cache absorbing 30M+ reads/sec in front of the databases. **Cassandra** stores the high-write, partition-friendly data (viewing history, member state); **MySQL** keeps the strongly transactional billing and account records. **Kafka** is the firehose event bus; **Flink** does stateful stream processing over it; **Spark** handles batch training and analytics. **Spinnaker** is the multi-cloud continuous-delivery platform that ships thousands of deployments a day with automated canary analysis, and **Titus** runs containerized batch and service workloads.\n\nIn practice: you do not need to memorize all of these — but dropping Zuul, Eureka, EVCache, Cassandra, Kafka, and Open Connect at the right moments signals you have studied the real system rather than a generic microservices template.",
    "## Tracing 'Press Play' End-to-End\n\nWalking the full playback-start path ties every component together and is a killer interview move. 1. The client (already authenticated; device holds a token) sends a play request for a title to **Zuul**, which validates the token, applies rate limits, and routes to the playback API. 2. The **playback service** checks entitlements (is this profile allowed to watch this title in this region?) using the user/profile service and licensing rules, consulting **EVCache** first and Cassandra/MySQL on miss. 3. In parallel, the **DRM/license service** issues a decryption license (Widevine/PlayReady/FairPlay depending on device). 4. The **steering service** ranks candidate OCAs for this client using BGP-derived network maps, the client's IP/ISP, current OCA load, and health telemetry, and returns a prioritized list of OCA URLs. 5. The playback service assembles the response: the DASH manifest with the per-title bitrate ladder plus the ranked OCA URLs. 6. The client opens HTTPS to the top OCA, starts fetching segments at a conservative bitrate, and the ABR loop takes over — stepping quality up as measured throughput allows. 7. Throughout playback the client emits telemetry events (startplay, rebuffer, bitrate switches, errors) into **Kafka**, where **Flink** jobs update 'continue watching' state, feed recommendation features, and drive real-time operational dashboards.\n\nKey insight: after step 6, AWS is out of the data path entirely. The control plane's job is ~1 second of work at play start; the following two hours of bytes flow only between the viewer and an appliance inside their own ISP.\n\nCommon mistake: drawing video bytes flowing through the API gateway. Zuul never touches a video segment — separating the control plane from the data plane is the single most important line in the whole diagram.",
  ],
  deepDive: [
    "Netflix's approach to encoding represents a paradigm shift from traditional fixed-bitrate ladders to per-title and per-shot encoding optimization. The key insight is that visual complexity varies dramatically: an animated children's show achieves excellent quality at bitrates where a dark action film would look terrible. Netflix uses the Video Multimethod Assessment Fusion (VMAF) metric, which they developed, to objectively measure perceptual quality. For each title, an encoding search algorithm explores the bitrate-resolution space to find the Pareto-optimal set of encoding points that maximize VMAF scores across bitrates. More recently, Netflix moved to per-shot encoding, where the bitrate allocation varies within a single title based on scene complexity. This technique reduced bandwidth consumption by ~20% while maintaining or improving perceptual quality. The encoded chunks use fragmented MP4 with Common Media Application Format (CMAF) for low-latency compatibility across devices.",
    "The recommendation system's evolution illustrates the increasing sophistication of ML at Netflix. Early systems used simple collaborative filtering (the Netflix Prize era, 2006-2009, focused on predicting star ratings). Modern systems use a rich ensemble of models. Session-based models capture short-term intent: if a user just finished a thriller, the system boosts similar titles in real-time. Contextual bandits handle the explore-exploit tradeoff: the system must occasionally recommend novel content to learn user preferences, balanced against exploiting known preferences for immediate engagement. Netflix uses counterfactual evaluation to estimate the impact of recommendation changes offline before deploying them. The personalized thumbnail selection system alone drove a measurable increase in engagement. Interleaving experiments allow Netflix to run thousands of A/B tests simultaneously on the recommendation pipeline, comparing different model variants in real-time with statistical rigor.",
    "Chaos Engineering at Netflix goes far beyond random instance termination. Chaos Monkey kills individual instances; Chaos Kong simulates entire AWS region failures to test cross-region failover. Latency Monkey injects artificial delays to test timeout and retry logic. Netflix also developed the concept of 'swimlanes' for fault isolation: different request paths are isolated so that a failure in the recommendation service does not affect video playback. The Hystrix library (now succeeded by resilience4j patterns) implements circuit breakers that trip when error rates exceed thresholds, preventing cascade failures. Bulkhead patterns isolate thread pools per dependency so that a slow downstream service does not consume all threads in the caller. Retry budgets limit the amplification factor during outages: if 50% of requests fail, the system retries only a fraction rather than doubling the load on an already struggling service. Graceful degradation is explicitly designed: every UI component has a fallback (cached data, generic defaults, or hiding the component entirely).",
    "Netflix's data infrastructure operates at enormous scale with sophisticated real-time and batch processing pipelines. Apache Kafka serves as the central event bus, handling millions of events per second: playback starts, pauses, seeks, quality changes, errors, and impression logs. These events feed into multiple consumers: real-time dashboards (via Druid), ML feature stores (via Flink), data warehouses (via Spark into Iceberg tables on S3), and alerting systems. The viewing history service alone processes billions of events daily. To handle this scale, Netflix developed several open-source tools: Mantis for real-time stream processing with backpressure, Atlas for dimensional time-series telemetry, and Conductor for orchestrating long-running workflows. Data is the foundation of nearly every product decision: content acquisition, UI changes, encoding parameters, and CDN placement are all data-driven with rigorous A/B testing frameworks.",
    "Open Connect's operational design is as interesting as its topology, and it revolves around one constraint: never let cache-fill traffic compete with viewer traffic. OCAs are populated during nightly **fill windows** — off-peak hours negotiated per ISP — when each appliance compares its manifest against a centrally computed placement plan and pulls only the deltas, preferring to fill from peer OCAs at the same site or nearby fill OCAs before reaching back to S3. The placement plan is recomputed daily from popularity predictions per region: a title trending in Brazil is pre-positioned onto Brazilian embedded OCAs before the evening peak, so first-play requests hit local disk. Steering is BGP-driven: ISPs announce the prefixes an embedded OCA should serve via BGP sessions with the appliance, giving Netflix an ISP-authored map of which subscribers are 'behind' which cache; the steering service combines that with continuous health telemetry (each OCA reports load, disk state, and serving capacity every few seconds) to rank URLs per client. Failure handling is layered: an unhealthy OCA is simply omitted from new rankings, clients mid-stream fail over to the next URL in their list, and if an entire embedded site is lost traffic spills to IXP fill sites — degraded latency, not an outage. For example, during an ISP power event an entire cluster can vanish and viewers see at most a brief quality dip as their players re-resolve to the next-best site.",
    "Resilience at the microservice layer is designed around a blunt question: what does the member see when this dependency dies? Every remote call runs inside a **bulkhead** — a bounded thread pool or semaphore per dependency — so a hung downstream service can exhaust only its own small pool, never the caller's whole capacity. A **circuit breaker** wraps the call: once the rolling error rate crosses a threshold the circuit opens and calls fail fast for a cooldown window, shedding load off the struggling service instead of piling queued retries onto it. The crucial part is the **fallback** chosen for each circuit, decided by product impact, not by engineering convenience. If the personalization service fails, the homepage silently swaps personalized rows for cached or regionally popular rows — the member sees a slightly less-tailored page, not an error. If the bookmark service fails, playback starts from the beginning rather than refusing to start. If ratings fail, the UI simply hides the ratings widget. Real-world example: this is the canonical 'personalized vs popular rows' fallback — recommendations drive 80% of viewing, yet the system treats them as gracefully degradable, because a generic homepage that plays video beats a personalized error page every time. Retry budgets cap amplification (retry at most a fixed fraction of failed calls), and Zuul can shed or reprioritize whole traffic classes at the edge, keeping the playback path alive even when browsing paths are brownout-degraded.",
    "The recommendation system is really two systems stitched together: an offline training world and an online serving world. Offline, Spark pipelines over Iceberg tables on S3 train the heavy models — matrix factorization embeddings, deep ranking networks, artwork bandit priors — on months of impression and playback logs; training runs take hours and ship versioned model artifacts plus precomputed candidate sets and embeddings to the serving tier. Online, serving must assemble a homepage in tens of milliseconds, so it never trains anything: it loads the precomputed embeddings and model weights, pulls fresh user features (what you watched an hour ago, current device, time of day) from a feature store fed by Flink jobs consuming Kafka, and runs cheap inference — candidate retrieval via approximate nearest-neighbor search over embeddings, then a ranking pass, then business re-ranking. Results are cached in EVCache and partially precomputed: much of a member's homepage is assembled in advance and refreshed on events (finishing a title triggers a targeted recompute) rather than on every request. Key insight: the offline/online split is the standard answer to 'how do you serve ML at scale' — slow, expensive learning happens offline on batch infrastructure; fast, cheap inference happens online against precomputed state, with a streaming layer (Kafka + Flink) narrowing the freshness gap between the two.",
    "Chaos engineering exists because Netflix concluded that failure testing in staging is a fiction: production is the only environment with real traffic mixes, real data volumes, real dependency graphs, and real AWS weather. The reasoning is economic and cultural at once. Economically, the cost of a controlled, scoped failure injected during business hours (engineers watching, small blast radius, instant rollback) is tiny compared to the cost of discovering the same weakness during a regional outage on a Friday night. Culturally, knowing Chaos Monkey will eventually kill any instance forces every team to build stateless, redundant, auto-recovering services by default — resilience stops being a review checklist and becomes a survival requirement. The practice matured into a discipline: define steady state (e.g., stream-starts-per-second), hypothesize it holds under the injected fault, run the experiment on a small slice, and halt automatically if the metric deviates. Warning: chaos engineering without mature observability and automated rollback is just vandalism — the tooling (Atlas telemetry, canary analysis in Spinnaker, regional traffic evacuation) had to exist first. In an interview, frame it as the verification step of the resilience story: circuit breakers and fallbacks are claims; chaos experiments are the proof those claims hold in production.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Adaptive Bitrate Selection Algorithm (simplified buffer-based ABR)",
      source: `#include <vector>
#include <algorithm>
#include <cmath>

struct BitrateProfile {
    int bitrate_kbps;    // e.g., 300, 750, 1500, 3000, 5000, 8000
    int width;
    int height;
    double vmaf_score;   // perceptual quality score (0-100)
};

struct ABRState {
    double buffer_seconds;         // current buffer occupancy
    double throughput_kbps;        // estimated throughput (EWMA)
    double segment_duration_sec;   // typically 4 seconds
    int current_bitrate_index;
};

class AdaptiveBitrateSelector {
    std::vector<BitrateProfile> profiles_;  // sorted ascending by bitrate
    double throughput_ewma_;
    double alpha_ = 0.3;  // EWMA smoothing factor

    // Buffer thresholds for buffer-based ABR (BBA)
    static constexpr double RESERVOIR = 8.0;    // seconds, minimum safe buffer
    static constexpr double CUSHION   = 30.0;   // seconds, comfortable buffer
    static constexpr double MAX_BUF   = 60.0;   // seconds, maximum buffer

public:
    explicit AdaptiveBitrateSelector(std::vector<BitrateProfile> profiles)
        : profiles_(std::move(profiles)), throughput_ewma_(0) {
        std::sort(profiles_.begin(), profiles_.end(),
                  [](auto& a, auto& b) { return a.bitrate_kbps < b.bitrate_kbps; });
    }

    void update_throughput(double measured_kbps) {
        if (throughput_ewma_ == 0)
            throughput_ewma_ = measured_kbps;
        else
            throughput_ewma_ = alpha_ * measured_kbps + (1 - alpha_) * throughput_ewma_;
    }

    // Hybrid ABR: combines throughput estimation with buffer level
    int select_bitrate(const ABRState& state) {
        // Step 1: Throughput-based ceiling - never pick a bitrate above
        // a safe fraction of estimated throughput
        double safe_throughput = throughput_ewma_ * 0.85;

        int throughput_max_index = 0;
        for (int i = 0; i < (int)profiles_.size(); ++i) {
            if (profiles_[i].bitrate_kbps <= safe_throughput)
                throughput_max_index = i;
        }

        // Step 2: Buffer-based selection (BBA-style)
        int buffer_index;
        if (state.buffer_seconds < RESERVOIR) {
            // Emergency: drop to lowest bitrate
            buffer_index = 0;
        } else if (state.buffer_seconds >= CUSHION) {
            // Buffer is healthy: allow highest bitrate
            buffer_index = (int)profiles_.size() - 1;
        } else {
            // Linear interpolation between lowest and highest
            double fraction = (state.buffer_seconds - RESERVOIR) / (CUSHION - RESERVOIR);
            buffer_index = (int)(fraction * (profiles_.size() - 1));
        }

        // Step 3: Take the minimum of throughput-based and buffer-based
        int selected = std::min(throughput_max_index, buffer_index);

        // Step 4: Limit upward switches to one step at a time (avoid oscillation)
        if (selected > state.current_bitrate_index)
            selected = state.current_bitrate_index + 1;

        return std::clamp(selected, 0, (int)profiles_.size() - 1);
    }

    const BitrateProfile& get_profile(int index) const {
        return profiles_[index];
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Collaborative Filtering - Cosine Similarity for User-Based Recommendations",
      source: `#include <vector>
#include <unordered_map>
#include <cmath>
#include <algorithm>
#include <queue>

// Sparse user-item rating matrix representation
struct UserRatings {
    int user_id;
    std::unordered_map<int, float> ratings;  // item_id -> rating (1-5)
};

class CollaborativeFilter {
    std::vector<UserRatings> users_;

    // Compute cosine similarity between two users over co-rated items
    double cosine_similarity(const UserRatings& a, const UserRatings& b) const {
        double dot = 0.0, norm_a = 0.0, norm_b = 0.0;
        int co_rated = 0;

        for (const auto& [item, rating_a] : a.ratings) {
            auto it = b.ratings.find(item);
            if (it != b.ratings.end()) {
                double ra = rating_a, rb = it->second;
                dot    += ra * rb;
                norm_a += ra * ra;
                norm_b += rb * rb;
                ++co_rated;
            }
        }

        // Require minimum co-rated items to avoid spurious similarity
        if (co_rated < 3 || norm_a == 0 || norm_b == 0)
            return 0.0;

        double sim = dot / (std::sqrt(norm_a) * std::sqrt(norm_b));

        // Significance weighting: penalize low overlap
        double weight = std::min(1.0, co_rated / 20.0);
        return sim * weight;
    }

public:
    void add_user(UserRatings user) {
        users_.push_back(std::move(user));
    }

    // Find top-K similar users to the target user
    std::vector<std::pair<int, double>> find_similar_users(int target_user_id,
                                                           int k) const {
        const UserRatings* target = nullptr;
        for (const auto& u : users_) {
            if (u.user_id == target_user_id) { target = &u; break; }
        }
        if (!target) return {};

        // Min-heap of (similarity, user_id) to track top K
        using Entry = std::pair<double, int>;
        std::priority_queue<Entry, std::vector<Entry>, std::greater<>> min_heap;

        for (const auto& other : users_) {
            if (other.user_id == target_user_id) continue;

            double sim = cosine_similarity(*target, other);
            if (sim <= 0) continue;

            min_heap.push({sim, other.user_id});
            if ((int)min_heap.size() > k)
                min_heap.pop();
        }

        std::vector<std::pair<int, double>> result;
        while (!min_heap.empty()) {
            auto [sim, uid] = min_heap.top();
            min_heap.pop();
            result.push_back({uid, sim});
        }
        std::sort(result.begin(), result.end(),
                  [](auto& a, auto& b) { return a.second > b.second; });
        return result;
    }

    // Predict rating for target user on a given item using KNN
    double predict_rating(int target_user_id, int item_id, int k = 20) const {
        auto neighbors = find_similar_users(target_user_id, k);

        double weighted_sum = 0.0;
        double sim_sum = 0.0;

        for (auto& [uid, sim] : neighbors) {
            for (const auto& u : users_) {
                if (u.user_id == uid) {
                    auto it = u.ratings.find(item_id);
                    if (it != u.ratings.end()) {
                        weighted_sum += sim * it->second;
                        sim_sum += std::abs(sim);
                    }
                    break;
                }
            }
        }

        return sim_sum > 0 ? weighted_sum / sim_sum : 0.0;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Consistent Hashing Ring for CDN Node Selection with Virtual Nodes",
      source: `#include <map>
#include <string>
#include <vector>
#include <functional>
#include <cstdint>
#include <stdexcept>
#include <sstream>

class ConsistentHashRing {
    // Sorted map: hash_value -> physical_node_id
    std::map<uint64_t, std::string> ring_;
    int vnodes_per_node_;

    // FNV-1a 64-bit hash for good distribution
    static uint64_t fnv1a_hash(const std::string& key) {
        uint64_t hash = 14695981039346656037ULL;
        for (unsigned char c : key) {
            hash ^= c;
            hash *= 1099511628211ULL;
        }
        return hash;
    }

    std::string make_vnode_key(const std::string& node, int vnode_index) const {
        std::ostringstream oss;
        oss << node << "#vnode" << vnode_index;
        return oss.str();
    }

public:
    explicit ConsistentHashRing(int vnodes_per_node = 150)
        : vnodes_per_node_(vnodes_per_node) {}

    // Add a physical node (e.g., OCA server) with virtual nodes
    void add_node(const std::string& node_id) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            uint64_t hash = fnv1a_hash(make_vnode_key(node_id, i));
            ring_[hash] = node_id;
        }
    }

    // Remove a node and all its virtual nodes
    void remove_node(const std::string& node_id) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            uint64_t hash = fnv1a_hash(make_vnode_key(node_id, i));
            ring_.erase(hash);
        }
    }

    // Find the node responsible for a given content key
    std::string get_node(const std::string& content_key) const {
        if (ring_.empty())
            throw std::runtime_error("Hash ring is empty");

        uint64_t hash = fnv1a_hash(content_key);

        // Find first node at or after the hash position (clockwise)
        auto it = ring_.lower_bound(hash);
        if (it == ring_.end())
            it = ring_.begin();  // wrap around

        return it->second;
    }

    // Get N distinct physical nodes for replication/fallback
    std::vector<std::string> get_nodes(const std::string& content_key,
                                        int count) const {
        if (ring_.empty())
            throw std::runtime_error("Hash ring is empty");

        std::vector<std::string> result;
        uint64_t hash = fnv1a_hash(content_key);
        auto it = ring_.lower_bound(hash);

        int visited = 0;
        while ((int)result.size() < count && visited < (int)ring_.size()) {
            if (it == ring_.end())
                it = ring_.begin();

            // Skip duplicate physical nodes (from vnodes)
            bool duplicate = false;
            for (const auto& r : result) {
                if (r == it->second) { duplicate = true; break; }
            }

            if (!duplicate)
                result.push_back(it->second);

            ++it;
            ++visited;
        }

        return result;
    }

    size_t node_count() const {
        // Count distinct physical nodes
        std::map<std::string, bool> seen;
        for (const auto& [_, node] : ring_)
            seen[node] = true;
        return seen.size();
    }

    size_t ring_size() const { return ring_.size(); }
};`,
    },
  ],
  diagrams: [
    {
      title: "Netflix High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered two-plane architecture: AWS control plane (Zuul, Eureka, playback, DRM, recommendations) plus Open Connect data plane for video delivery. Solid path = playback start (auth, steering, manifest, segments); the encode path flows offline from S3 masters through per-title encoding into the OCA tiers.",
      mermaid: `graph TB
    subgraph CL["Clients"]
        TV["Smart TV Player"]
        MOB["Mobile Player<br/>iOS / Android"]
        WEB["Web Player<br/>Browser DASH"]
    end

    subgraph EDGE["Edge - Open Connect CDN"]
        OCAE["Embedded OCAs<br/>inside ISP networks"]
        OCAF["Fill OCAs<br/>at IXP sites"]
    end

    subgraph CP["Control Plane on AWS"]
        ZUUL["Zuul API Gateway"]
        EUR["Eureka<br/>Service Discovery"]
        PLAY["Playback and<br/>Steering Service"]
        DRM["License / DRM<br/>Service"]
        USR["User and Profile<br/>Service"]
        REC["Recommendation<br/>Service"]
        ABC["A/B Config<br/>Service"]
    end

    subgraph ASY["Async Pipeline"]
        KAF["Kafka Event Bus"]
        FLK["Flink Stream<br/>Processing"]
    end

    subgraph DATA["Data Tier"]
        EVC["EVCache<br/>Memcached Tier"]
        CAS["Cassandra<br/>Viewing History"]
        SQL["MySQL<br/>Billing"]
        S3M["S3<br/>Content Masters"]
    end

    subgraph ENC["Encoding - Offline"]
        PTE["Per-Title Encoding Pipeline<br/>produces bitrate ladders"]
    end

    subgraph RES["Resilience"]
        HYS["Hystrix-style<br/>Circuit Breakers"]
        CHA["Chaos Engineering<br/>Chaos Monkey / Kong"]
    end

    TV -->|"1 auth + play request"| ZUUL
    MOB --> ZUUL
    WEB --> ZUUL
    ZUUL --> EUR
    ZUUL -->|"2 steering"| PLAY
    PLAY --> DRM
    PLAY -->|"3 manifest + ranked OCA URLs"| TV
    TV -->|"4 video segments"| OCAE
    MOB --> OCAE
    WEB --> OCAE

    ZUUL --> USR
    ZUUL --> REC
    ZUUL --> ABC
    USR --> EVC
    USR --> CAS
    USR --> SQL
    REC --> EVC
    PLAY --> EVC

    USR --> KAF
    PLAY --> KAF
    KAF --> FLK
    FLK --> REC
    FLK --> CAS

    S3M --> PTE
    PTE -->|"offline encode push"| OCAF
    OCAF -->|"off-peak fill window"| OCAE

    HYS -.->|"wraps inter-service calls"| PLAY
    HYS -.-> REC
    CHA -.->|"fault injection in prod"| CP`,
    },
    {
      title: "Video Playback Sequence",
      kind: "sequence",
      caption:
        "End-to-end flow from play button click to video segment delivery",
      mermaid: `sequenceDiagram
    participant C as Client
    participant AG as API Gateway
    participant PS as Playback Service
    participant SS as Steering Service
    participant OCA as Open Connect OCA
    participant T as Telemetry

    C->>AG: Play request with title ID
    AG->>PS: Get playback manifest
    PS->>SS: Get ranked OCA list
    SS-->>PS: OCA URLs sorted by proximity and load
    PS-->>AG: Manifest with OCA URLs and bitrate ladder
    AG-->>C: Playback manifest

    loop Each Video Segment
        C->>C: ABR selects bitrate based on buffer and throughput
        C->>OCA: GET segment at selected bitrate
        OCA-->>C: Video segment bytes
        C->>T: Report quality metrics
    end

    Note over C,OCA: If OCA fails client switches to next OCA in list`,
    },
    {
      title: "Content Encoding and Distribution Flow",
      kind: "flow",
      caption:
        "From raw media upload through encoding to CDN distribution",
      mermaid: `flowchart TD
    Upload["Raw Media Upload"]
    QC["Quality Check"]
    Analyze["Complexity Analysis"]
    Ladder["Generate Bitrate Ladder"]
    Encode["Parallel Encoding Jobs"]
    H264["H.264 Profiles"]
    HEVC["H.265 HEVC Profiles"]
    AV1["AV1 Profiles"]
    Chunk["Segment into Chunks"]
    Store["Store in S3"]
    Popular["Popularity Prediction"]
    Fill["Push to Fill OCAs"]
    Embed["Push to Embedded OCAs"]

    Upload --> QC
    QC --> Analyze
    Analyze --> Ladder
    Ladder --> Encode
    Encode --> H264
    Encode --> HEVC
    Encode --> AV1
    H264 --> Chunk
    HEVC --> Chunk
    AV1 --> Chunk
    Chunk --> Store
    Store --> Popular
    Popular --> Fill
    Fill --> Embed`,
    },
    {
      title: "Recommendation Pipeline",
      kind: "flow",
      caption:
        "Multi-stage recommendation pipeline from candidate generation to personalized rows",
      mermaid: `flowchart TD
    VH["Viewing History"]
    UP["User Profile"]
    CF["Collaborative Filtering"]
    CB["Content-Based Filtering"]
    TR["Trending and Popular"]
    CG["Candidate Generation"]
    DNN["Deep Neural Network Ranker"]
    RR["Re-Ranking and Business Rules"]
    PF["Personalized Artwork Selection"]
    HP["Homepage Rows Assembly"]

    VH --> CF
    VH --> CB
    UP --> CF
    UP --> CB
    TR --> CG
    CF --> CG
    CB --> CG
    CG --> DNN
    DNN --> RR
    RR --> PF
    PF --> HP`,
    },
  ],
  interviewQA: [
    {
      q: "How does Netflix deliver video content to 230+ million subscribers globally with minimal buffering?",
      a: "Netflix built Open Connect, a custom CDN with thousands of appliances (OCAs) embedded directly inside ISP networks. This eliminates most internet transit: video bytes travel a short path from the OCA within the user's ISP to the user's device. Content is proactively pushed to OCAs based on popularity predictions, so popular titles are already cached locally before users request them. The playback service returns a ranked list of OCA URLs based on proximity, server load, and health. The client uses adaptive bitrate streaming to match video quality to the user's available bandwidth in real-time, fetching segments at lower bitrates if throughput drops. This combination of edge caching, intelligent steering, and adaptive streaming achieves a rebuffer rate well below 1% globally.",
      followUps: [
        "How does Netflix decide which content to cache on which OCA?",
        "What happens during an ISP peering dispute?",
        "How does Netflix handle live streaming differently from on-demand?",
      ],
    },
    {
      q: "Explain how Netflix's adaptive bitrate (ABR) algorithm works.",
      a: "Netflix's ABR algorithm is a hybrid approach combining throughput estimation with buffer-based logic. The client measures download throughput using an exponentially weighted moving average (EWMA) of recent segment download times. Simultaneously, it monitors the playback buffer occupancy. The algorithm selects the highest bitrate that can be sustained without depleting the buffer: if throughput is high and the buffer is healthy (above a cushion threshold), it selects a higher bitrate; if the buffer drops near a reservoir threshold, it immediately drops to the lowest bitrate to prevent rebuffering. Upward bitrate switches are conservative (one step at a time) to avoid oscillation, while downward switches can be aggressive (multiple steps) to prevent stalls. Netflix also factors in device capabilities, screen resolution, and the user's data plan settings. The algorithm is continuously refined using A/B testing on real user populations.",
      followUps: [
        "How does per-title encoding optimization interact with ABR?",
        "What metrics does Netflix use to evaluate ABR quality?",
        "How would you handle ABR for live streaming vs. VOD?",
      ],
    },
    {
      q: "How does Netflix's recommendation engine work at a high level?",
      a: "Netflix uses a multi-stage recommendation pipeline. The first stage is candidate generation, which retrieves a broad set of potentially relevant titles using collaborative filtering (finding users with similar viewing patterns) and content-based filtering (matching on genre, cast, director metadata). The second stage is ranking, where a deep neural network scores each candidate based on hundreds of features: user history, time of day, device, recent interactions, and title attributes. The third stage applies business rules for diversity (not showing five thrillers in a row), freshness (boosting new releases), and contractual obligations. Netflix also personalizes artwork: different users see different thumbnail images for the same title, selected by a contextual bandit that optimizes for click-through rate. The system processes billions of events daily and updates recommendations in near real-time using a combination of Spark batch jobs and Flink stream processing.",
      followUps: [
        "How does Netflix handle the cold-start problem for new users?",
        "What is the explore-exploit tradeoff in recommendations?",
        "How does Netflix evaluate recommendation quality offline?",
      ],
    },
    {
      q: "How does Netflix handle failures and ensure high availability?",
      a: "Netflix is a pioneer of Chaos Engineering, proactively injecting failures in production to build resilience. Chaos Monkey randomly terminates instances to ensure services handle single-node failures. Chaos Kong simulates entire region outages to verify cross-region failover works. Every service implements circuit breakers: when error rates to a downstream dependency exceed a threshold, the circuit opens and the service returns a fallback response (cached data or defaults) instead of waiting and failing. Bulkhead patterns isolate thread pools per dependency so a slow service cannot consume all resources. Retry budgets prevent retry storms during outages by limiting the amplification factor. The architecture uses swimlanes for fault isolation: the video playback path is isolated from the browsing and recommendation path, so a failure in recommendations does not prevent users from watching content they have already found. Netflix runs active-active across multiple AWS regions with stateless services and replicated data stores.",
      followUps: [
        "What is the difference between Chaos Monkey and Chaos Kong?",
        "How do circuit breakers prevent cascade failures?",
        "How does Netflix replicate data across regions?",
      ],
    },
    {
      q: "How would you design the data model for Netflix's viewing history service?",
      a: "The viewing history service must handle billions of write events daily (play, pause, seek, stop) with low latency and high write throughput. Cassandra is an excellent fit: partition key is the profileId, clustering key is timestamp descending, so recent history for any profile is a single partition scan. Each event record includes profileId, titleId, timestamp, event type, playback position, device type, and encoding profile. For the 'continue watching' feature, a separate materialized view tracks the most recent playback position per title per profile, keyed by (profileId, titleId). This avoids scanning the full history to find where a user left off. Event data also flows through Kafka to downstream consumers: the recommendation engine (to update user preferences), the analytics pipeline (for content performance metrics), and the billing service (for usage tracking). Hot data (last 30 days) stays in Cassandra; older data is archived to S3 in Parquet format for batch analytics. EVCache sits in front of Cassandra for the most frequent reads (current session state, recently watched list).",
      followUps: [
        "How do you handle concurrent viewing on multiple devices?",
        "What consistency level does Netflix use for Cassandra?",
        "How would you migrate this data model if requirements change?",
      ],
    },
    {
      q: "Estimate Netflix's peak bandwidth requirements and explain what that implies for the design.",
      a: "Start with subscribers: ~250M. At evening peak roughly 10% stream concurrently, giving ~25M concurrent streams. At an average delivered bitrate of ~5 Mbps (blending mobile SD up to living-room 4K), peak egress is 25M x 5 Mbps = ~125 Tbps. Sanity-check with data volume: 5 Mbps is ~2.25 GB per viewing hour, so peak consumption is ~56 PB/hour. No cloud egress or commercial CDN pricing survives that: even at $0.01/GB it is hundreds of millions of dollars per year. The implication is that video bytes must never touch AWS or a per-GB-billed CDN — Netflix must own the delivery tier (Open Connect) and peer settlement-free with ISPs, converting a marginal per-GB cost into fixed hardware cost. Contrast with storage: the whole encoded catalog is only ~2 PB (15K titles x ~135 GB across all codecs and ladders), which is trivial. Bandwidth, not storage, dictates this architecture.",
      followUps: [
        "How would these numbers change for a live sports event with 20M viewers of the same stream?",
        "How much storage does a single embedded OCA need to achieve a high hit rate, given Zipf popularity?",
      ],
    },
    {
      q: "Why did Netflix build its own CDN instead of using Akamai or CloudFront?",
      a: "Three reasons: economics, workload fit, and control. Economically, at ~125 Tbps peak, per-GB CDN pricing is ruinous; owning appliances and peering settlement-free with ISPs makes delivery a fixed cost. Workload fit: Netflix serves a bounded, highly predictable catalog with Zipf-distributed popularity — perfect for proactive push during off-peak fill windows, unlike a general-purpose pull-through CDN designed for unpredictable web assets. Netflix knows tonight's popular titles per region in advance and pre-positions them, so cache hit rates are extremely high with no origin-fetch latency on first play. Control: Netflix tunes the entire stack — FreeBSD, the HTTP server, NIC offload, disk layout for large sequential reads — achieving far more throughput per box than generic edge servers, and integrates steering with its own BGP data and client telemetry. The trade-off honesty an interviewer wants: this only pays off at extreme, sustained, predictable scale. For almost any other company, a commercial CDN is the right answer, and ISPs cooperate here because hosting OCAs slashes their transit costs too.",
      followUps: [
        "What is in it for the ISP hosting a free Netflix appliance?",
        "At what scale does building your own CDN start to make sense?",
      ],
    },
    {
      q: "Walk me through what happens when a user presses Play.",
      a: "1) The client sends a play request with its auth token to Zuul, which validates, rate-limits, and routes it. 2) The playback service checks entitlements (profile, region, plan) via the user service, hitting EVCache first, Cassandra/MySQL on miss. 3) The DRM service issues a decryption license appropriate to the device (Widevine, PlayReady, or FairPlay). 4) The steering service ranks OCAs for this client using BGP-derived maps of which ISP prefixes sit behind which appliance, plus real-time OCA load and health, and returns a prioritized URL list. 5) The client receives the DASH manifest (per-title bitrate ladder plus segment URLs) and OCA list. 6) It opens HTTPS to the top OCA and fetches segments, starting at a conservative bitrate and letting the ABR loop step quality up. 7) Telemetry (start, rebuffers, bitrate switches) flows into Kafka, where Flink updates continue-watching state and recommendation features. The punchline: after step 6, AWS is out of the data path — two hours of video flows only between the viewer and an appliance inside their own ISP, while the control plane did about one second of work.",
      followUps: [
        "What happens if the top-ranked OCA dies mid-stream?",
        "Where can this flow degrade gracefully vs. where must it hard-fail?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Netflix's Open Connect CDN places appliances (OCAs) primarily at:",
      options: [
        "AWS data centers co-located with compute instances",
        "Inside ISP networks and at Internet Exchange Points",
        "In end users homes as set-top boxes",
        "In dedicated Netflix-owned data centers",
      ],
      answerIndex: 1,
      explanation:
        "Open Connect Appliances are deployed inside ISP networks (embedded OCAs) and at Internet Exchange Points (fill OCAs). This minimizes the network distance between the video source and the viewer, reducing latency and transit costs while improving streaming quality.",
    },
    {
      q: "In adaptive bitrate streaming, when the client buffer drops below the reservoir threshold, the algorithm should:",
      options: [
        "Maintain the current bitrate to avoid quality fluctuation",
        "Gradually increase bitrate to fill the buffer faster",
        "Immediately switch to the lowest available bitrate",
        "Pause playback until the buffer recovers",
      ],
      answerIndex: 2,
      explanation:
        "When the buffer drops below the reservoir (minimum safe level), the ABR algorithm aggressively drops to the lowest bitrate. Lower bitrate segments download faster relative to their playback duration, allowing the buffer to refill quickly and preventing a rebuffering stall.",
    },
    {
      q: "Netflix's per-title encoding optimization improves efficiency by:",
      options: [
        "Using a single codec for all content to reduce complexity",
        "Customizing the bitrate-resolution ladder based on each titles visual complexity",
        "Encoding only in the highest resolution and downscaling on the client",
        "Skipping encoding for content that is rarely watched",
      ],
      answerIndex: 1,
      explanation:
        "Per-title optimization analyzes each title's visual complexity and generates a custom bitrate ladder. Simple content (animation, static scenes) achieves high quality at lower bitrates, while complex content (action, dark scenes) gets allocated more bits. This reduces overall bandwidth by ~20% with no quality loss.",
    },
    {
      q: "Consistent hashing with virtual nodes is used in Netflix's CDN to:",
      options: [
        "Encrypt content keys for DRM protection",
        "Distribute content across OCA nodes with minimal remapping when nodes join or leave",
        "Sort video segments by popularity for caching priority",
        "Compress video segments before distribution",
      ],
      answerIndex: 1,
      explanation:
        "Consistent hashing ensures that when an OCA node is added or removed, only a small fraction of content mappings change (approximately 1/N of keys). Virtual nodes provide uniform distribution even with heterogeneous hardware. This minimizes cache invalidation and rebalancing overhead during scaling events.",
    },
  ],
  flashcards: [
    {
      front: "What are the two planes in Netflix's architecture?",
      back: "Control plane (AWS): handles business logic, authentication, recommendations, catalog, and API routing. Data plane (Open Connect): handles actual video byte delivery through OCAs embedded in ISP networks worldwide.",
    },
    {
      front: "What is VMAF and why does Netflix use it?",
      back: "Video Multimethod Assessment Fusion is a perceptual video quality metric developed by Netflix. It predicts human perception of quality more accurately than PSNR or SSIM. Netflix uses it to optimize per-title encoding ladders and evaluate ABR algorithm performance.",
    },
    {
      front: "How does Netflix handle the cold-start problem in recommendations?",
      back: "For new users, Netflix uses onboarding preference selection (pick titles you like), popularity-based recommendations, content-based filtering on selected genres, and demographic signals. As the user watches more content, collaborative filtering signals strengthen and personalization improves.",
    },
    {
      front: "What is EVCache and what role does it play?",
      back: "EVCache is Netflix's distributed caching layer built on memcached. It handles 30+ million requests per second, sitting in front of Cassandra and other data stores. It caches user sessions, profile data, recommendation results, and content metadata to reduce database load and latency.",
    },
    {
      front: "What is the purpose of Chaos Monkey?",
      back: "Chaos Monkey randomly terminates production instances to ensure that services are resilient to individual node failures. It forces engineers to design services that handle failures gracefully with redundancy, stateless design, and proper fallback mechanisms.",
    },
    {
      front: "How does Netflix's CDN steering work?",
      back: "The steering service uses BGP routing data, DNS resolution, real-time OCA health telemetry, and server load metrics to rank OCA URLs for each client request. Clients receive a prioritized list and connect to the best available OCA, failing over to alternatives if needed.",
    },
    {
      front: "What is per-shot encoding optimization?",
      back: "An evolution of per-title optimization where bitrate allocation varies within a single title based on scene complexity. Simple scenes (dialogue, static shots) get fewer bits while complex scenes (action, dark sequences) get more. This reduces bandwidth by ~20% while maintaining quality.",
    },
    {
      front: "What is Netflix's peak egress bandwidth, roughly, and why does it matter?",
      back: "~250M subscribers x ~10% peak concurrency x ~5 Mbps average = ~125 Tbps. This single number is why Netflix built Open Connect: per-GB CDN or cloud egress pricing is economically impossible at that scale, so delivery must run on owned appliances with settlement-free ISP peering.",
    },
    {
      front: "What are Zuul and Eureka?",
      back: "Zuul is Netflix's edge API gateway: routing, authentication, rate limiting, request decoration, and canary traffic shaping for all client API calls. Eureka is the service registry: services self-register and callers discover live instances dynamically, which makes instance churn (deploys, chaos kills, autoscaling) invisible to clients.",
    },
    {
      front: "Why do OCAs fill only during off-peak windows?",
      back: "So cache-fill traffic never competes with viewer traffic on ISP links. Overnight, each OCA diffs its content against a daily popularity-based placement plan and pulls only deltas, preferring peer OCAs and fill OCAs over S3. Tomorrow's popular titles are on local disk before the evening peak.",
    },
    {
      front: "How does Netflix run A/B tests on recommendations?",
      back: "Netflix uses interleaving experiments where different recommendation algorithm variants are mixed within a single user session. Results from different models are interleaved in the UI, and engagement signals determine which model produces better results. This requires fewer users than traditional A/B testing for statistical significance.",
    },
  ],
  exercises: [
    "Design the content ingestion pipeline: given a raw 4K movie file, describe the complete workflow from upload to the file being available for streaming worldwide. Include encoding profiles, quality checks, storage, and CDN distribution. Estimate the total storage required for one title across all encoding profiles.",
    "Implement a simplified recommendation engine: given a user-item interaction matrix with 1000 users and 5000 titles, design and implement a system that generates top-10 recommendations for a user. Choose between collaborative filtering and content-based approaches, justify your choice, and analyze the time and space complexity.",
    "Design the playback session service that tracks what each user is watching in real-time. Handle concurrent viewing on multiple devices for the same profile, synchronize the 'continue watching' position, and emit events to downstream consumers. Specify the data model, API contracts, and consistency guarantees.",
    "Build a CDN simulator: implement consistent hashing to distribute 10,000 content items across 50 OCA nodes with virtual nodes. Simulate adding and removing 5 nodes and measure the percentage of content that needs to be remapped. Compare uniform distribution across nodes.",
    "Design the Netflix search system: support prefix matching, typo tolerance, and multi-language queries against the content catalog (titles, actors, directors, genres). Specify the indexing strategy, ranking algorithm, and how to keep the search index consistent with the catalog service. Handle at least 100,000 queries per second.",
  ],
  revisionNotes: [
    "Netflix uses a two-plane architecture: AWS for control plane (business logic, API, recommendations) and Open Connect for data plane (video delivery via OCAs in ISP networks).",
    "Adaptive Bitrate streaming combines throughput estimation (EWMA) with buffer occupancy to select the optimal bitrate per segment. Buffer below reservoir triggers immediate quality drop; buffer above cushion allows highest quality.",
    "Content is encoded using per-title optimization: each title gets a custom bitrate-resolution ladder based on visual complexity, measured by VMAF. This saves ~20% bandwidth versus fixed ladders.",
    "Open Connect Appliances are organized in two tiers: embedded OCAs in ISP networks for popular content, and fill OCAs at IXPs for long-tail content. Content follows a Zipf popularity distribution.",
    "The recommendation pipeline has three stages: candidate generation (collaborative + content-based filtering), ranking (deep neural network), and re-ranking (diversity, freshness, business rules).",
    "Netflix uses Cassandra for high-write workloads (viewing history), MySQL for transactional data (billing), EVCache for caching (30M+ req/sec), Elasticsearch for search, and Kafka for event streaming.",
    "Chaos Engineering tools: Chaos Monkey (instance termination), Chaos Kong (region failure), Latency Monkey (delay injection). Circuit breakers, bulkheads, and retry budgets prevent cascade failures.",
    "Consistent hashing with virtual nodes distributes content across OCA clusters and cache shards. Only ~1/N keys remap when a node is added or removed.",
    "Personalized artwork selection uses contextual bandits to show different thumbnail images to different users for the same title, optimizing click-through rate.",
    "Netflix processes billions of events daily through Kafka, with Flink for real-time processing and Spark for batch analytics. Data drives encoding decisions, content acquisition, and A/B testing.",
    "Capacity headline numbers: ~250M subs, ~10% peak concurrency = ~25M streams, x ~5 Mbps = ~125 Tbps peak egress. Encoded catalog is only ~2 PB — bandwidth, not storage, forces the custom CDN.",
    "Press Play path: Zuul (auth) -> playback service (entitlements via EVCache/Cassandra) -> DRM license -> steering service (BGP maps + OCA health) -> DASH manifest + ranked OCA URLs -> client streams segments from embedded OCA. AWS exits the data path after play start.",
    "Recommendation serving is split offline/online: Spark trains models and precomputes embeddings on batch data; online serving does cheap inference over precomputed state with fresh features from Kafka+Flink, cached in EVCache.",
    "OCA fill happens only during off-peak fill windows, pulling deltas from peer/fill OCAs before S3, following a daily popularity-based placement plan per region.",
  ],
  cheatSheet: [
    "Scale: ~230M subscribers, ~1B hours/week, thousands of microservices on AWS",
    "CDN: Open Connect with OCAs in ISP networks; content pre-positioned by popularity prediction",
    "ABR: hybrid throughput + buffer-based; EWMA for throughput estimation; conservative upswitch, aggressive downswitch",
    "Encoding: per-title/per-shot optimization using VMAF; H.264, HEVC, VP9, AV1 codecs; hundreds of profiles per title",
    "Recommendations: collaborative filtering + content-based + DNN ranking; personalized artwork via contextual bandits",
    "Storage: Cassandra (viewing history), MySQL (billing), EVCache (caching), Elasticsearch (search), S3 (encoded assets)",
    "Resilience: Chaos Monkey/Kong, circuit breakers, bulkheads, swimlanes, retry budgets, graceful degradation with fallbacks",
    "Consistent hashing: used for OCA content distribution and EVCache shard routing; virtual nodes for uniform distribution",
    "Event pipeline: Kafka as central bus; Flink for real-time; Spark for batch; Druid for real-time analytics dashboards",
    "API Gateway: Zuul handles routing, auth, rate limiting, request decoration for all client API traffic",
    "Capacity math: 250M subs x 10% peak x 5 Mbps = ~125 Tbps egress; ~2.25 GB/viewer-hour; catalog ~2 PB encoded (15K titles x ~135 GB)",
    "Named stack: Zuul (gateway), Eureka (discovery), Ribbon (client LB), Hystrix (circuit breakers), EVCache, Cassandra, Kafka, Flink, Spark, Spinnaker (CD), Titus (containers)",
    "Fallback ladder: personalization down -> popular rows; bookmarks down -> play from start; ratings down -> hide widget. Never block playback on a non-playback dependency",
    "DASH: manifest (MPD) + 2-10s segments; ladder ~235 Kbps to ~16 Mbps; per-title ladder from VMAF convex-hull search",
  ],
  glossary: [
    {
      term: "Open Connect Appliance (OCA)",
      definition:
        "A custom Netflix server deployed inside ISP networks or at IXPs, containing SSDs/HDDs loaded with video content. OCAs run FreeBSD with a custom HTTP server optimized for sequential reads. They serve video bytes directly to nearby subscribers, minimizing internet transit.",
    },
    {
      term: "Adaptive Bitrate Streaming (ABR)",
      definition:
        "A technique where the video player dynamically selects the quality level (bitrate and resolution) for each video segment based on current network throughput and buffer occupancy. This maximizes visual quality while minimizing rebuffering events.",
    },
    {
      term: "VMAF (Video Multimethod Assessment Fusion)",
      definition:
        "A perceptual video quality metric developed by Netflix that predicts human quality perception. It combines multiple elementary metrics into a single score (0-100) using a support vector machine trained on human subjective data. Used to optimize encoding parameters.",
    },
    {
      term: "Collaborative Filtering",
      definition:
        "A recommendation technique that identifies users with similar viewing patterns and recommends titles that similar users enjoyed. User-based CF finds similar users; item-based CF finds similar items. Netflix uses matrix factorization and neural approaches for scalability.",
    },
    {
      term: "Chaos Engineering",
      definition:
        "The discipline of experimenting on a distributed system to build confidence in its ability to withstand turbulent conditions in production. Netflix pioneered this with tools like Chaos Monkey (random instance kills) and Chaos Kong (region-level failure simulation).",
    },
    {
      term: "EVCache",
      definition:
        "Netflix's distributed caching solution built on top of memcached. It provides a low-latency, high-throughput caching layer that handles over 30 million requests per second, used for session data, profile information, and recommendation results.",
    },
    {
      term: "Zuul",
      definition:
        "Netflix's edge API gateway. Every client API request passes through Zuul for authentication, routing, rate limiting, request decoration, and traffic shaping (including canary and failover routing). It handles control-plane traffic only — video segments never pass through it.",
    },
    {
      term: "Eureka",
      definition:
        "Netflix's service discovery registry. Service instances register themselves on startup and heartbeat while alive; clients query Eureka (usually via Ribbon client-side load balancing) to find healthy instances. This dynamic membership is what makes autoscaling, red/black deploys, and chaos-induced instance churn transparent to callers.",
    },
    {
      term: "MPEG-DASH",
      definition:
        "Dynamic Adaptive Streaming over HTTP: an open standard where video is encoded at multiple quality levels, chunked into short segments, and described by a manifest (MPD). The client picks a quality per segment via plain HTTP GETs, making delivery stateless and cacheable by any HTTP server.",
    },
    {
      term: "Bitrate Ladder",
      definition:
        "The set of encoded renditions (bitrate + resolution pairs) available for a title, e.g. from ~235 Kbps at 320x240 up to ~16 Mbps at 4K. Netflix customizes the ladder per title (and per shot) by searching the encoding space and keeping the VMAF-optimal convex hull.",
    },
    {
      term: "Bulkhead Pattern",
      definition:
        "Resilience pattern that isolates each downstream dependency behind its own bounded thread pool or semaphore, named after ship compartments. A hung dependency can exhaust only its own small pool, so one slow service cannot consume all threads and sink the whole caller.",
    },
    {
      term: "Contextual Bandit",
      definition:
        "A reinforcement learning approach used by Netflix for personalized artwork selection. The algorithm balances exploring new thumbnail images (to learn which performs best) with exploiting known good images (to maximize engagement), adapting selections based on user context features.",
    },
  ],
  animations: [
    {
      title: "Starting playback",
      steps: [
        {
          label: "Browse",
          detail: "Metadata and personalised rows served from a low-latency store; recommendations precomputed offline.",
        },
        {
          label: "Play pressed",
          detail: "Client requests a playback manifest and a licence for DRM.",
        },
        {
          label: "Nearest cache chosen",
          detail: "Open Connect appliances sit inside ISPs — the content is often one hop away.",
        },
        {
          label: "Adaptive streaming",
          detail: "Client starts at a conservative bitrate and steps up as it measures throughput.",
        },
        {
          label: "Buffer management",
          detail: "It keeps reading ahead; a dip in bandwidth drops quality rather than stalling.",
        },
        {
          label: "Why pre-positioned",
          detail: "Popular titles are pushed to edge caches ahead of demand, so the origin serves almost nothing.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Netflix Open Connect",
      "Traditional CDN (Akamai/CloudFront)",
      "Peer-to-Peer (P2P) Delivery",
    ],
    rows: [
      [
        "Infrastructure",
        "Custom OCAs embedded in ISP networks",
        "Shared edge servers at PoPs worldwide",
        "End-user devices act as nodes",
      ],
      [
        "Cost Model",
        "Netflix owns hardware, free peering with ISPs",
        "Pay per GB transferred, shared infrastructure",
        "Minimal infrastructure cost, uses user bandwidth",
      ],
      [
        "Content Control",
        "Full control over caching, routing, and hardware",
        "Limited control, vendor-managed policies",
        "No central control, depends on peer availability",
      ],
      [
        "Latency",
        "Very low, server within ISP network",
        "Low, server at nearest PoP (may be further)",
        "Variable, depends on peer proximity and availability",
      ],
      [
        "Scalability",
        "Deploy more OCAs; ISPs benefit from reduced transit",
        "Scales via vendor; may have cost spikes",
        "Scales naturally with more users, but quality degrades with fewer peers",
      ],
      [
        "Reliability",
        "Fallback across multiple OCAs; Netflix controls failover",
        "Vendor-managed failover across PoPs",
        "Unreliable if insufficient peers; not suitable for guaranteed QoS",
      ],
      [
        "Use Case Fit",
        "High-volume, predictable catalog (VOD streaming)",
        "General purpose (web assets, streaming, APIs)",
        "Live events, popular content with many concurrent viewers",
      ],
    ],
  },
  followUps: [
    "Design Netflix's live streaming architecture for sports events and how it differs from VOD",
    "Deep dive into Netflix's microservices communication patterns: synchronous (gRPC) vs. asynchronous (Kafka)",
    "Explore Netflix's A/B testing framework and how they run thousands of experiments simultaneously",
    "Design a content rights management system handling regional licensing and expiration across 190+ countries",
    "Study Netflix's data pipeline architecture: Kafka, Flink, Spark, and Iceberg for batch and real-time analytics",
    "Compare Netflix's architecture with YouTube's: different scale characteristics, live vs. UGC, monetization models",
    "Design the DRM and license delivery flow across Widevine, PlayReady, and FairPlay, including offline downloads",
    "Estimate and design OCA storage tiering: how much SSD vs. HDD per appliance given Zipf-distributed popularity",
    "Design Netflix's ad-supported tier: ad decisioning, server-side ad insertion, and frequency capping at streaming scale",
  ],
  resources: [
    {
      label: "Netflix TechBlog", url: "https://netflixtechblog.com/",
      kind: "article",
      note: "Official engineering blog covering Open Connect, recommendation systems, encoding, and infrastructure in depth",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Covers distributed systems fundamentals (consistent hashing, replication, partitioning) that underpin Netflix's architecture",
    },
    {
      label: "System Design Interview by Alex Xu - Vol 1 and 2", url: "https://bytebytego.com/",
      kind: "book",
      note: "Includes Netflix-style streaming and recommendation system design chapters with structured approaches",
    },
    {
      label: "Netflix Open Connect Overview",
      kind: "docs",
      note: "Official documentation on Open Connect's CDN architecture, ISP partnerships, and OCA deployment",
    },
    {
      label: "High Performance Browser Networking by Ilya Grigorik", url: "https://hpbn.co/",
      kind: "book",
      note: "Deep coverage of HTTP/2, TLS, WebSocket, and streaming protocols relevant to video delivery optimization",
    },
  ],
};
