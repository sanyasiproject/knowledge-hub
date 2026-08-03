import type { TopicContent } from "../types";

export const designYoutube: TopicContent = {
  quickSummary: [
    "YouTube ingests ~500 hours of video per minute. Each upload triggers a transcoding pipeline that produces multiple resolutions (144p to 4K) and codec variants (H.264, VP9, AV1), generating 20-50 renditions per video. The pipeline is orchestrated as a DAG of tasks running on a distributed compute cluster, with each task writing output segments to object storage.",
    "Adaptive Bitrate Streaming (ABR) via HLS or DASH delivers video by splitting each rendition into 2-10 second segments. The client player monitors buffer levels and network throughput to dynamically switch between quality levels mid-playback, ensuring smooth viewing even on fluctuating connections.",
    "A global CDN with thousands of edge Points of Presence (PoPs) caches popular video segments close to viewers. Roughly 20% of videos account for 80% of views, so a tiered caching strategy (edge, regional, origin) serves the long tail efficiently while keeping hot content at the edge with >95% cache hit rates.",
    "The recommendation engine combines collaborative filtering, content-based signals, and deep learning models to rank candidate videos. It operates in two stages: a candidate generation phase that narrows billions of videos to a few hundred, and a ranking phase that scores and orders those candidates using real-time user engagement features.",
    "At YouTube scale (~1 billion hours watched daily, ~2 billion monthly active users), every subsystem must handle extreme write and read loads. Video metadata lives in sharded databases, comments use fan-out-on-read patterns, and the search index is updated asynchronously via change-data-capture pipelines.",
  ],
  detailed: [
    "## Video Upload and Transcoding Pipeline\n\nWhen a creator uploads a video, the file is first written to a temporary staging area in object storage (e.g., Google Cloud Storage). An upload service validates the file format, extracts metadata (duration, codec, resolution, audio tracks), and generates a unique video ID. The raw file is then placed onto a work queue for the transcoding pipeline. The transcoding pipeline is a directed acyclic graph (DAG) of tasks: the first stage demuxes the container, separating audio and video streams. The video stream is then split into groups of pictures (GOPs) that can be transcoded independently in parallel across hundreds of workers. Each worker encodes a GOP into multiple target resolutions and codecs. Audio is separately transcoded into AAC, Opus, and other formats at various bitrates. Once all segments are complete, a stitcher combines them into final renditions, generates manifest files (HLS .m3u8 or DASH .mpd), and writes everything to durable object storage. Thumbnail extraction, content moderation (via ML classifiers for nudity, violence, copyright), and subtitle generation also run as parallel DAG stages. The entire pipeline completes in minutes for short videos but can take hours for 4K+ content, so the system publishes lower resolutions first and progressively makes higher qualities available.",
    "## Adaptive Bitrate Streaming and Playback\n\nYouTube uses both HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP) to deliver video. Both protocols work by splitting each quality level into small segments (typically 2-5 seconds). The client first fetches a manifest file listing available quality levels with their bandwidth requirements. During playback, the ABR algorithm on the client continuously monitors three key signals: current network throughput (measured from recent segment download times), buffer occupancy (how many seconds of video are buffered ahead), and device capabilities (screen resolution, decoder support). When throughput drops, the algorithm switches to a lower bitrate to prevent rebuffering; when conditions improve, it ramps up quality. Buffer-based algorithms (like BBA) are more stable than purely throughput-based ones because they absorb short network fluctuations. YouTube's player also implements prefetching of the next few segments, seek optimization (partial segment downloads), and codec negotiation (preferring AV1 or VP9 over H.264 when the device supports it, since they achieve 30-50% better compression). For live streaming, segment duration is reduced to 1-2 seconds and low-latency modes bypass CDN caching to achieve sub-5-second glass-to-glass latency.",
    "## Content Delivery Network and Caching\n\nYouTube operates a private CDN (Google Global Cache) with edge servers deployed inside ISP networks worldwide. The caching architecture uses three tiers: edge caches (inside ISPs, closest to users), regional caches (in metro data centers), and origin servers (in core Google data centers where all video renditions are stored). When a user requests a video segment, DNS resolution directs them to the nearest edge server. If the segment is cached there (cache hit), it is served directly with sub-10ms latency. On a miss, the edge fetches from the regional cache, which in turn fetches from origin if needed. Popular videos (the top 20% that drive 80% of traffic) achieve cache hit rates above 95% at the edge. Long-tail content may only be cached at regional level. Cache eviction uses a combination of LRU and popularity-weighted scoring. To handle viral content, the system proactively pushes trending video segments to edge caches before user demand spikes. During peak hours, a single popular video can be served from thousands of edge locations simultaneously, distributing terabits of traffic that would overwhelm any single data center.",
    "## Recommendation Engine and Search\n\nThe recommendation system is YouTube's most critical feature, driving over 70% of total watch time. It operates as a two-stage funnel. The candidate generation stage uses multiple sources: collaborative filtering (users who watched X also watched Y), content-based similarity (video embeddings from titles, tags, visual features), subscriptions, trending, and geographic signals. Each source produces a few hundred candidates, merged into a pool of roughly 1,000-2,000 videos. The ranking stage then scores each candidate using a deep neural network trained on engagement signals: predicted watch time, click-through rate, likes, shares, and satisfaction survey responses. Features include user history (last 50 watched videos, search queries), video features (age, length, channel authority, freshness), and context (time of day, device type). The final ranking balances engagement with diversity (mixing categories) and responsibility (demoting borderline content). For search, YouTube maintains an inverted index of video metadata and auto-generated captions. The search ranking model blends text relevance with engagement signals and personalization. Both systems serve results in under 200ms despite operating over a corpus of 800+ million videos.",
    "## Data Storage and Comments at Scale\n\nVideo metadata (title, description, tags, view counts, channel info) is stored in a distributed SQL-compatible database sharded by video ID. View counts are not updated synchronously per view; instead, view events flow into a streaming pipeline (similar to Kafka), are deduplicated, and batch-aggregated into counters every few seconds. This avoids hot-key contention on viral videos. Comments use a different pattern: each video's comment thread is stored as a tree structure (top-level comments with replies). Reading comments for a video is a fan-out-on-read operation: fetch top-level comments sorted by relevance (a score combining recency, likes, and creator engagement), then lazy-load replies. Comment writes go through a moderation pipeline that runs spam detection, toxicity classification, and creator-defined filters before persisting. For the creator's own channel page and analytics, a separate materialized view aggregates subscriber counts, revenue, and per-video statistics. Notifications (new video from a subscribed channel, reply to a comment) are fanned out via a pub/sub system to push notification services and in-app notification feeds. At YouTube's scale, even seemingly simple features like the like button require careful design: like counts are eventually consistent, with the user's own action reflected immediately via optimistic UI updates.",
  ],
  deepDive: [
    "Video transcoding at scale requires careful resource management. YouTube processes billions of GOPs (groups of pictures) per day across a fleet of heterogeneous hardware including CPUs, GPUs, and custom ASICs (like Google's VCU - Video Coding Unit). The scheduling system must balance several constraints: encoding quality (two-pass encoding produces better quality but doubles compute time), latency (creators expect their video to be available quickly), and cost (GPU encoding is faster but more expensive per hour). The system uses a priority queue where premium creators and trending content get faster encoding. For codec selection, AV1 delivers roughly 30% bitrate savings over VP9 at the same quality but is 10-100x slower to encode, so YouTube selectively encodes only popular videos in AV1 where the bandwidth savings justify the compute cost. Error handling is critical: if a transcoding worker crashes mid-segment, the orchestrator retries that segment on another worker. Idempotency is ensured by writing output to a temporary location and atomically promoting it only after validation (checking segment duration, bitrate, and visual quality via VMAF scores).",
    "The ABR algorithm's design significantly impacts user experience. YouTube has evolved through multiple generations of ABR logic. Early approaches used simple throughput estimation: measure the download speed of the last few segments and pick the highest quality that fits within that bandwidth. This led to oscillations (quality bouncing up and down) and rebuffering on sudden drops. Modern approaches use buffer-based algorithms that primarily watch the buffer level: if the buffer is above a high watermark (say 30 seconds), aggressively pick the highest quality; if it falls below a low watermark (5 seconds), drop to the lowest quality; in between, interpolate. Hybrid algorithms combine both signals with machine learning models that predict future throughput based on historical network patterns, time of day, and ISP characteristics. The algorithm must also handle special cases: initial playback (start at a low quality for fast startup, then ramp up), seeking (need to fetch a new segment from a potentially different quality level), and live streaming (buffer must stay small to maintain low latency). YouTube reports that improvements to their ABR algorithm have reduced rebuffering events by over 50% while simultaneously increasing average video quality.",
    "YouTube's recommendation system faces unique challenges around feedback loops and content responsibility. The system is trained on user engagement data, but naive optimization for engagement can create filter bubbles (users only see content similar to what they have watched) and can promote sensational or misleading content that generates high click-through rates. To address this, YouTube incorporates several countermeasures. Diversity injection ensures that recommendations span multiple content categories and creators, not just the user's dominant interests. Satisfaction modeling uses survey data and long-term retention (did the user come back tomorrow?) rather than just immediate clicks. Borderline content classifiers identify videos that are not policy-violating but are low-quality or potentially harmful, and the ranking system applies a demotion factor to these. Exploration vs. exploitation is balanced by occasionally inserting fresh or less-popular content into recommendations to discover new user interests and give new creators a chance at visibility. The candidate generation stage itself uses multiple independent retrieval models precisely to ensure diversity: even if the collaborative filtering model produces a narrow set, the trending and topic-based models inject different candidates.",
    "Handling live streaming adds another dimension of complexity to YouTube's architecture. Unlike on-demand video where all segments are pre-encoded and cached, live streams produce segments in real time. The ingest path receives an RTMP or SRT stream from the broadcaster, transcodes it into multiple ABR renditions with minimal delay (typically 1-3 seconds of encoding latency), and immediately writes segments to edge caches. The manifest file is continuously updated to append new segments. For low-latency live streaming, YouTube uses chunked transfer encoding to deliver partial segments before they are fully encoded, reducing glass-to-glass latency to under 3 seconds. The chat system alongside live streams must handle massive fan-out: a popular live stream can have millions of concurrent viewers sending chat messages, requiring a separate real-time messaging infrastructure with rate limiting and moderation. DVR functionality (rewinding a live stream) requires keeping recent segments available while the live edge advances, essentially creating a sliding window of on-demand content within a live session.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Adaptive Bitrate Selection Algorithm - buffer-based approach with throughput estimation",
      source: `#include <vector>
#include <algorithm>
#include <cmath>
#include <deque>

struct BitrateLevel {
    int index;
    int bitrate_kbps;    // e.g., 250, 500, 1000, 2500, 5000, 8000
    int width;
    int height;
};

struct SegmentDownloadSample {
    double size_bytes;
    double download_time_sec;
    double timestamp;
};

class ABRController {
    std::vector<BitrateLevel> levels_;
    std::deque<SegmentDownloadSample> throughput_history_;

    // Buffer thresholds in seconds
    static constexpr double BUFFER_LOW = 5.0;
    static constexpr double BUFFER_HIGH = 30.0;
    static constexpr double STARTUP_BUFFER = 2.0;

    // Throughput estimation
    static constexpr int THROUGHPUT_WINDOW = 5;
    static constexpr double SAFETY_FACTOR = 0.85;

public:
    explicit ABRController(std::vector<BitrateLevel> levels)
        : levels_(std::move(levels)) {
        std::sort(levels_.begin(), levels_.end(),
                  [](const auto& a, const auto& b) {
                      return a.bitrate_kbps < b.bitrate_kbps;
                  });
    }

    void recordDownload(double size_bytes, double download_time_sec, double ts) {
        throughput_history_.push_back({size_bytes, download_time_sec, ts});
        if (throughput_history_.size() > THROUGHPUT_WINDOW)
            throughput_history_.pop_front();
    }

    // Harmonic mean of recent throughput samples (more conservative than
    // arithmetic mean, reducing oscillation on variable networks)
    double estimateThroughputKbps() const {
        if (throughput_history_.empty()) return levels_.front().bitrate_kbps;
        double inv_sum = 0.0;
        for (const auto& s : throughput_history_) {
            double tp = (s.size_bytes * 8.0 / 1000.0) / s.download_time_sec;
            inv_sum += 1.0 / tp;
        }
        return throughput_history_.size() / inv_sum;
    }

    // Core ABR decision: combines buffer level and throughput estimation
    int selectQuality(double buffer_sec, int current_index, bool is_startup) {
        if (is_startup && buffer_sec < STARTUP_BUFFER) {
            return 0;  // Start with lowest quality for fast initial playback
        }

        double throughput = estimateThroughputKbps() * SAFETY_FACTOR;

        // Find the highest level that fits within estimated throughput
        int throughput_choice = 0;
        for (int i = (int)levels_.size() - 1; i >= 0; --i) {
            if (levels_[i].bitrate_kbps <= throughput) {
                throughput_choice = i;
                break;
            }
        }

        // Buffer-based adjustment
        if (buffer_sec < BUFFER_LOW) {
            // Emergency: drop to lowest that fits or absolute lowest
            return std::min(throughput_choice, current_index - 1 >= 0
                           ? current_index - 1 : 0);
        }

        if (buffer_sec > BUFFER_HIGH) {
            // Buffer is healthy: allow stepping up one level at a time
            // to avoid overshooting on temporary throughput spikes
            int target = std::min(throughput_choice, current_index + 1);
            return std::min(target, (int)levels_.size() - 1);
        }

        // Interpolation zone: map buffer level linearly to quality range
        double ratio = (buffer_sec - BUFFER_LOW) / (BUFFER_HIGH - BUFFER_LOW);
        int max_allowed = (int)(ratio * (levels_.size() - 1));
        int selected = std::min(throughput_choice, max_allowed);

        // Prevent upward oscillation: only step up if we have been stable
        if (selected > current_index && buffer_sec < BUFFER_HIGH * 0.6) {
            selected = current_index;
        }

        return selected;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Video Segment Manager - handles segment storage, cache indexing, and manifest generation for HLS/DASH",
      source: `#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <optional>
#include <sstream>
#include <iomanip>
#include <cstdint>

struct VideoSegment {
    std::string video_id;
    int rendition_index;        // quality level index
    int segment_number;
    double duration_sec;         // typically 2-6 seconds
    int64_t byte_offset;         // offset in the rendition file
    int64_t byte_length;
    std::string storage_path;    // e.g., "gs://yt-segments/vid123/720p/seg_042.m4s"
    uint64_t crc32;              // integrity check
    bool is_key_segment;         // starts with an IDR frame (random access point)
};

struct Rendition {
    int index;
    int width;
    int height;
    int bitrate_kbps;
    std::string codec;           // "avc1.64001f", "vp09.00.31.08", "av01.0.08M.08"
    std::vector<VideoSegment> segments;
};

class SegmentManager {
    std::unordered_map<std::string, std::vector<Rendition>> video_renditions_;
    mutable std::mutex mu_;

public:
    void registerRendition(const std::string& video_id, Rendition rendition) {
        std::lock_guard<std::mutex> lock(mu_);
        video_renditions_[video_id].push_back(std::move(rendition));
    }

    // Locate the segment containing a given playback timestamp
    std::optional<VideoSegment> findSegment(
        const std::string& video_id, int rendition_idx, double timestamp_sec) const {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = video_renditions_.find(video_id);
        if (it == video_renditions_.end()) return std::nullopt;

        for (const auto& r : it->second) {
            if (r.index != rendition_idx) continue;
            double cumulative = 0.0;
            for (const auto& seg : r.segments) {
                if (timestamp_sec >= cumulative &&
                    timestamp_sec < cumulative + seg.duration_sec) {
                    return seg;
                }
                cumulative += seg.duration_sec;
            }
        }
        return std::nullopt;
    }

    // Find the nearest key segment at or before a timestamp (for seek operations)
    std::optional<VideoSegment> findNearestKeySegment(
        const std::string& video_id, int rendition_idx, double timestamp_sec) const {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = video_renditions_.find(video_id);
        if (it == video_renditions_.end()) return std::nullopt;

        for (const auto& r : it->second) {
            if (r.index != rendition_idx) continue;
            std::optional<VideoSegment> best;
            double cumulative = 0.0;
            for (const auto& seg : r.segments) {
                if (cumulative > timestamp_sec) break;
                if (seg.is_key_segment) best = seg;
                cumulative += seg.duration_sec;
            }
            return best;
        }
        return std::nullopt;
    }

    // Generate an HLS master playlist referencing all renditions
    std::string generateHLSMasterPlaylist(const std::string& video_id,
                                          const std::string& base_url) const {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = video_renditions_.find(video_id);
        if (it == video_renditions_.end()) return "";

        std::ostringstream m3u8;
        m3u8 << "#EXTM3U\\n#EXT-X-VERSION:4\\n";
        for (const auto& r : it->second) {
            m3u8 << "#EXT-X-STREAM-INF:BANDWIDTH=" << r.bitrate_kbps * 1000
                 << ",RESOLUTION=" << r.width << "x" << r.height
                 << ",CODECS=\\"" << r.codec << "\\"\\n";
            m3u8 << base_url << "/" << video_id << "/" << r.index
                 << "/playlist.m3u8\\n";
        }
        return m3u8.str();
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Two-Stage Recommendation Scoring - candidate generation via embedding similarity followed by ranking with engagement prediction",
      source: `#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <unordered_map>
#include <numeric>

struct VideoCandidate {
    std::string video_id;
    float embedding[128];        // learned video embedding from deep model
    float upload_age_hours;
    float video_length_sec;
    float channel_subscriber_count;
    float historical_ctr;        // historical click-through rate
    float avg_watch_percentage;  // average % of video watched by viewers
};

struct UserProfile {
    float embedding[128];        // learned user embedding
    std::vector<std::string> recent_watches;   // last 50 video IDs
    std::vector<std::string> recent_searches;
    float avg_session_length_min;
    int subscription_count;
    float time_of_day_hour;      // 0.0 - 24.0
    bool is_mobile;
};

struct ScoredCandidate {
    std::string video_id;
    float score;
    bool operator>(const ScoredCandidate& o) const { return score > o.score; }
};

class RecommendationEngine {
    static float dotProduct(const float* a, const float* b, int dim) {
        float sum = 0.0f;
        for (int i = 0; i < dim; ++i) sum += a[i] * b[i];
        return sum;
    }

    static float cosineSimilarity(const float* a, const float* b, int dim) {
        float dot = 0.0f, norm_a = 0.0f, norm_b = 0.0f;
        for (int i = 0; i < dim; ++i) {
            dot += a[i] * b[i];
            norm_a += a[i] * a[i];
            norm_b += b[i] * b[i];
        }
        if (norm_a == 0.0f || norm_b == 0.0f) return 0.0f;
        return dot / (std::sqrt(norm_a) * std::sqrt(norm_b));
    }

public:
    // Stage 1: Candidate generation via approximate nearest neighbor
    // on user-video embedding similarity. In production this uses a
    // vector index (ScaNN, FAISS) over 800M+ videos; here simplified.
    std::vector<VideoCandidate> generateCandidates(
        const UserProfile& user,
        const std::vector<VideoCandidate>& corpus,
        int top_k = 500) {

        std::vector<std::pair<float, int>> scores;
        scores.reserve(corpus.size());
        for (int i = 0; i < (int)corpus.size(); ++i) {
            float sim = cosineSimilarity(user.embedding,
                                         corpus[i].embedding, 128);
            scores.push_back({sim, i});
        }
        std::partial_sort(scores.begin(),
                          scores.begin() + std::min(top_k, (int)scores.size()),
                          scores.end(),
                          [](const auto& a, const auto& b) {
                              return a.first > b.first;
                          });

        std::vector<VideoCandidate> result;
        int n = std::min(top_k, (int)scores.size());
        for (int i = 0; i < n; ++i) {
            result.push_back(corpus[scores[i].second]);
        }
        return result;
    }

    // Stage 2: Ranking model predicts expected watch time.
    // Combines user-video affinity with video quality signals
    // and contextual features. In production this is a deep neural
    // network; here we show the feature engineering and scoring logic.
    std::vector<ScoredCandidate> rankCandidates(
        const UserProfile& user,
        const std::vector<VideoCandidate>& candidates) {

        std::vector<ScoredCandidate> scored;
        scored.reserve(candidates.size());

        for (const auto& v : candidates) {
            float affinity = dotProduct(user.embedding, v.embedding, 128);

            // Freshness boost: newer videos get a logarithmic boost
            float freshness = 1.0f / (1.0f + std::log1p(v.upload_age_hours));

            // Quality signal: videos with high watch-through rate
            // are likely more engaging
            float quality = v.avg_watch_percentage * v.historical_ctr;

            // Context: on mobile, favor shorter videos
            float length_fit = 1.0f;
            if (user.is_mobile && v.video_length_sec > 600) {
                length_fit = 600.0f / v.video_length_sec;
            }

            // Channel authority: log-scaled subscriber count
            float authority = std::log1p(v.channel_subscriber_count) / 20.0f;

            // Weighted combination (weights learned via gradient descent
            // in production; hard-coded here for illustration)
            float score = 0.40f * affinity
                        + 0.15f * freshness
                        + 0.20f * quality
                        + 0.10f * length_fit
                        + 0.10f * authority
                        + 0.05f * (user.avg_session_length_min / 60.0f);

            scored.push_back({v.video_id, score});
        }

        std::sort(scored.begin(), scored.end(), std::greater<>());
        return scored;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "YouTube High-Level Architecture",
      kind: "architecture",
      caption:
        "End-to-end system overview showing upload, transcoding, storage, CDN delivery, and recommendation paths",
      mermaid: `graph TD
    Client[Client App] -->|upload| UploadSvc[Upload Service]
    Client -->|watch| CDN[CDN Edge Cache]
    Client -->|search| SearchSvc[Search Service]
    Client -->|browse| RecoSvc[Recommendation Service]

    UploadSvc -->|raw video| ObjStore[Object Storage]
    UploadSvc -->|job| TranscodeQueue[Transcode Queue]
    TranscodeQueue --> TranscodeWorkers[Transcode Workers]
    TranscodeWorkers -->|renditions| ObjStore
    TranscodeWorkers -->|metadata| MetadataDB[Metadata DB]
    TranscodeWorkers -->|moderation| ModerationSvc[Moderation Service]

    CDN -->|miss| RegionalCache[Regional Cache]
    RegionalCache -->|miss| ObjStore

    SearchSvc --> SearchIndex[Search Index]
    RecoSvc --> CandidateGen[Candidate Generation]
    RecoSvc --> RankingModel[Ranking Model]
    CandidateGen --> UserProfileDB[User Profile Store]
    CandidateGen --> VideoEmbeddings[Video Embeddings]
    RankingModel --> FeatureStore[Feature Store]

    Client -->|comments| CommentSvc[Comment Service]
    CommentSvc --> CommentDB[Comment DB]
    CommentSvc --> SpamFilter[Spam Filter]

    Client -->|view events| EventStream[Event Stream]
    EventStream --> ViewCounter[View Counter]
    EventStream --> Analytics[Analytics Pipeline]
    EventStream --> FeatureStore`,
    },
    {
      title: "Video Upload and Transcoding Flow",
      kind: "flow",
      caption:
        "Detailed flow from creator upload through transcoding DAG to availability",
      mermaid: `flowchart TD
    A[Creator Uploads Video] --> B[Upload Service Receives File]
    B --> C{Validate Format}
    C -->|Invalid| D[Reject with Error]
    C -->|Valid| E[Store Raw File in Object Storage]
    E --> F[Extract Metadata]
    F --> G[Enqueue Transcode Job]
    G --> H[Demux Audio and Video Streams]
    H --> I[Split Video into GOPs]
    I --> J[Parallel Encode GOPs per Resolution]
    H --> K[Transcode Audio to AAC and Opus]
    J --> L[Stitch Segments per Rendition]
    K --> L
    L --> M[Generate HLS and DASH Manifests]
    M --> N[Run Content Moderation ML]
    N --> O{Policy Check}
    O -->|Blocked| P[Notify Creator of Violation]
    O -->|Approved| Q[Generate Thumbnails]
    Q --> R[Update Metadata DB]
    R --> S[Push to CDN Edge Caches]
    S --> T[Video Available for Playback]`,
    },
    {
      title: "Adaptive Bitrate Streaming Sequence",
      kind: "sequence",
      caption:
        "Client-server interaction during ABR playback showing quality switching",
      mermaid: `sequenceDiagram
    participant Player as Video Player
    participant CDN as CDN Edge
    participant Origin as Origin Storage

    Player->>CDN: GET master.m3u8 manifest
    CDN-->>Player: Manifest with quality levels

    Player->>CDN: GET 360p segment 1 for fast start
    CDN-->>Player: Segment data

    Note over Player: Buffer building, throughput measured

    Player->>CDN: GET 720p segment 2
    CDN-->>Player: Segment data

    Player->>CDN: GET 1080p segment 3
    CDN->>Origin: Cache miss, fetch from origin
    Origin-->>CDN: Segment data
    CDN-->>Player: Segment data cached and served

    Note over Player: Network degrades

    Player->>CDN: GET 480p segment 4 quality downshift
    CDN-->>Player: Segment data

    Note over Player: Network recovers

    Player->>CDN: GET 720p segment 5 quality upshift
    CDN-->>Player: Segment data

    Note over Player: User seeks to 5m30s

    Player->>CDN: GET 720p key segment near 5m30s
    CDN-->>Player: Key segment for random access`,
    },
    {
      title: "CDN Tiered Caching Network",
      kind: "network",
      caption:
        "Three-tier cache hierarchy from origin through regional to edge PoPs inside ISPs",
      mermaid: `graph LR
    Origin[Origin Data Center] --> R1[Regional Cache US West]
    Origin --> R2[Regional Cache US East]
    Origin --> R3[Regional Cache Europe]
    Origin --> R4[Regional Cache Asia]

    R1 --> E1[Edge PoP ISP-A California]
    R1 --> E2[Edge PoP ISP-B Oregon]
    R1 --> E3[Edge PoP ISP-C Washington]

    R2 --> E4[Edge PoP ISP-D New York]
    R2 --> E5[Edge PoP ISP-E Virginia]

    R3 --> E6[Edge PoP ISP-F London]
    R3 --> E7[Edge PoP ISP-G Frankfurt]

    R4 --> E8[Edge PoP ISP-H Tokyo]
    R4 --> E9[Edge PoP ISP-I Mumbai]

    E1 --> U1[Users]
    E2 --> U2[Users]
    E4 --> U3[Users]
    E6 --> U4[Users]
    E8 --> U5[Users]`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the video transcoding pipeline to handle 500 hours of uploads per minute?",
      a: "The key is parallelism at every level. First, split each video into independent GOPs (groups of pictures) at IDR frame boundaries, so each GOP can be transcoded on a separate worker without dependencies. Use a distributed task queue (like Google Cloud Tasks or a Kafka-based system) to distribute GOPs across a fleet of thousands of transcoding workers. Each worker encodes one GOP into one resolution and codec, then writes the output segment to object storage. A coordinator service tracks completion per video and triggers the stitching step once all segments for a rendition are done. Prioritize producing lower resolutions first so the video becomes watchable quickly while higher-quality renditions are still encoding. Use heterogeneous hardware: GPUs for H.264 and VP9 encoding (10x faster than CPU), and dedicated ASICs for AV1 where available. Auto-scale the worker fleet based on queue depth, maintaining a target of processing each video within 2x its duration.",
      followUps: [
        "How do you handle encoding failures or worker crashes mid-segment?",
        "How do you decide which codec to use for each video?",
        "What quality metrics do you use to validate transcoded output?",
      ],
    },
    {
      q: "Explain how adaptive bitrate streaming works and why it is important.",
      a: "Adaptive bitrate streaming splits each quality level of a video into small segments (typically 2-6 seconds each). The client downloads a manifest file listing all available quality levels with their bandwidth requirements, then begins downloading segments sequentially. After each segment download, the client measures the actual throughput achieved and the current buffer level. If throughput is high and the buffer is healthy, it requests the next segment at a higher quality. If throughput drops or the buffer depletes, it switches to a lower quality. This happens seamlessly without interrupting playback. It is critical because internet bandwidth fluctuates constantly, especially on mobile networks. Without ABR, a fixed-quality stream would either buffer frequently (if too high) or waste bandwidth on low quality (if too conservative). ABR gives each viewer the best possible quality their current connection can sustain, reducing rebuffering events by over 50% compared to fixed-rate delivery.",
      followUps: [
        "What is the difference between HLS and DASH?",
        "How do you handle quality switches during live streaming?",
        "What are the tradeoffs between shorter and longer segment durations?",
      ],
    },
    {
      q: "How does YouTube's recommendation system work at a high level?",
      a: "YouTube uses a two-stage funnel. The first stage, candidate generation, retrieves a few hundred to a thousand potential videos from a corpus of 800+ million. It uses multiple retrieval strategies in parallel: collaborative filtering (via learned user and video embeddings with approximate nearest neighbor search), content-based matching (videos similar to recently watched ones), subscriptions, trending content, and geographic popularity. These candidates are merged and deduplicated. The second stage, ranking, scores each candidate with a deep neural network that predicts expected engagement, primarily watch time. The ranking model uses hundreds of features including user history, video metadata, contextual signals (time of day, device type), and real-time engagement statistics. The final output balances predicted engagement with diversity (mixing content categories), freshness (boosting new content), and content responsibility (demoting borderline content). The system re-ranks in real time as the user interacts with recommendations, adapting within the session.",
      followUps: [
        "How do you prevent filter bubbles in recommendations?",
        "How do you handle cold-start for new videos or new users?",
        "What metrics do you optimize the recommendation model for?",
      ],
    },
    {
      q: "How do you handle view counting at YouTube scale without creating database hot spots?",
      a: "Direct database updates per view would create extreme hot spots on viral videos receiving millions of views per minute. Instead, view events are published to a distributed event stream (similar to Kafka topics partitioned by video ID). A stream processing pipeline consumes these events, applies deduplication logic (filtering out repeated views from the same user within a short window, bot detection, and validity checks like minimum watch duration), and aggregates counts in memory over micro-batches of a few seconds. The aggregated counts are then written to the database in bulk, converting millions of individual increments into a single atomic update per video per batch window. For real-time display, an in-memory counter service provides approximate counts with eventual consistency. The exact count in the database may lag by a few seconds. For viral videos, the counter service pre-allocates counter shards across multiple nodes to further distribute the write load. This design handles any level of concurrency without database contention.",
      followUps: [
        "How do you detect and filter fraudulent views?",
        "Why does YouTube sometimes show approximate view counts?",
      ],
    },
    {
      q: "How would you design the CDN layer for YouTube video delivery?",
      a: "YouTube operates a three-tier CDN. The first tier is edge caches deployed inside ISP networks (Google Global Cache), placing content as close to users as possible. The second tier is regional caches in metro data centers. The third tier is the origin in core data centers where all video renditions are stored. DNS-based routing directs each user to their nearest edge. When an edge has the requested segment (cache hit), it serves directly with minimal latency. On a miss, it fetches from the regional cache, which fetches from origin if needed, and the segment is cached at each tier as it passes through. Cache admission and eviction use popularity-weighted LRU: frequently accessed segments stay cached longer. For viral or trending content, the system proactively pushes segments to edge caches before demand peaks, based on real-time viewership velocity. This tiered approach achieves over 95% cache hit rates for popular content at the edge, while the regional tier handles the long tail efficiently without overloading the origin.",
      followUps: [
        "How do you handle cache invalidation when a video is deleted or made private?",
        "How do you route users to the optimal edge server?",
        "What happens when an edge server fails?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In adaptive bitrate streaming, when the client buffer level falls below the low watermark, the ABR algorithm should:",
      options: [
        "Maintain the current quality level to avoid oscillation",
        "Switch to the highest available quality to refill the buffer faster",
        "Switch to a lower bitrate to reduce the chance of rebuffering",
        "Pause playback until the buffer recovers",
      ],
      answerIndex: 2,
      explanation:
        "When the buffer is critically low, the priority is preventing rebuffering. A lower bitrate segment downloads faster relative to its playback duration, allowing the buffer to recover. Maintaining or increasing quality risks the buffer emptying completely, causing a stall.",
    },
    {
      q: "YouTube splits video into small segments for streaming primarily because:",
      options: [
        "It reduces the total file size of the video",
        "It enables quality switching at segment boundaries without re-downloading the entire video",
        "It makes the video impossible to download illegally",
        "It reduces the encoding quality to save bandwidth",
      ],
      answerIndex: 1,
      explanation:
        "Segmentation is the foundation of adaptive bitrate streaming. Each segment is independently decodable (starting with a key frame), so the client can switch to a different quality level at any segment boundary. This enables seamless quality adaptation without restarting the stream or re-downloading previously watched content.",
    },
    {
      q: "In YouTube's recommendation system, the candidate generation stage exists because:",
      options: [
        "The ranking model is too slow to score all 800+ million videos for every request",
        "It ensures every video gets recommended at least once",
        "It replaces the ranking stage for new users",
        "It filters out videos that violate content policies",
      ],
      answerIndex: 0,
      explanation:
        "The ranking model uses a complex deep neural network that cannot evaluate hundreds of millions of videos in real time. Candidate generation uses cheaper retrieval methods (embedding similarity via approximate nearest neighbor) to reduce the corpus from 800M+ to roughly 500-2000 candidates that the expensive ranking model can score within the latency budget of ~200ms.",
    },
    {
      q: "YouTube uses a three-tier CDN caching hierarchy. The primary benefit of placing edge caches inside ISP networks is:",
      options: [
        "It reduces the cost of origin storage",
        "It eliminates the need for video transcoding",
        "It minimizes network latency and reduces inter-network traffic for popular content",
        "It allows ISPs to modify video content before delivery",
      ],
      answerIndex: 2,
      explanation:
        "Edge caches inside ISP networks serve content without traversing inter-network peering links, reducing latency to single-digit milliseconds and avoiding bandwidth costs on peering connections. For popular content that achieves high cache hit rates at the edge, the vast majority of traffic never leaves the ISP network, benefiting both YouTube (lower bandwidth costs) and the ISP (reduced peering congestion).",
    },
  ],
  flashcards: [
    {
      front: "How much video is uploaded to YouTube per minute?",
      back: "Approximately 500 hours of video per minute, requiring a massively parallel transcoding pipeline that can produce 20-50 renditions per video across multiple resolutions and codecs.",
    },
    {
      front: "What is a GOP in video encoding and why does it matter for distributed transcoding?",
      back: "A GOP (Group of Pictures) is a sequence of frames starting with an IDR (key) frame that can be decoded independently. Splitting video at GOP boundaries enables parallel transcoding across many workers since each GOP has no dependencies on others.",
    },
    {
      front: "What are the two main ABR streaming protocols?",
      back: "HLS (HTTP Live Streaming, Apple) and DASH (Dynamic Adaptive Streaming over HTTP, MPEG standard). Both split video into small segments and use manifest files to list available quality levels. HLS uses .m3u8 manifests and .ts/.m4s segments; DASH uses .mpd manifests and .m4s segments.",
    },
    {
      front: "What is the two-stage funnel in YouTube's recommendation system?",
      back: "Stage 1 (Candidate Generation): cheap retrieval methods (embedding similarity, collaborative filtering) narrow 800M+ videos to ~500-2000 candidates. Stage 2 (Ranking): an expensive deep neural network scores candidates on predicted watch time, CTR, and satisfaction, producing the final ordered list.",
    },
    {
      front: "How does YouTube handle view counting without database hot spots?",
      back: "View events flow into a distributed event stream, are deduplicated, and batch-aggregated in micro-windows of a few seconds. Only the aggregated count is written to the database, converting millions of increments into one bulk update per video per batch. An in-memory counter service provides real-time approximate counts.",
    },
    {
      front: "What is the purpose of the three-tier CDN cache hierarchy?",
      back: "Edge caches (inside ISPs) serve popular content with minimal latency. Regional caches handle medium-popularity content. Origin stores all renditions. This achieves >95% edge hit rates for popular videos while efficiently serving the long tail without overloading a single tier.",
    },
    {
      front: "Why does AV1 encoding offer better compression than H.264 but is not used for all YouTube videos?",
      back: "AV1 achieves roughly 30% bitrate savings over VP9 (and ~50% over H.264) at equivalent quality, but encoding is 10-100x slower. YouTube selectively encodes only popular videos in AV1 where the bandwidth savings over millions of views justify the higher compute cost.",
    },
    {
      front: "How does YouTube handle seeking in a segmented video stream?",
      back: "When a user seeks, the player finds the nearest key segment (one starting with an IDR frame) at or before the seek target. It downloads that segment to establish a decodable reference frame, then continues sequential playback from there. The manifest file indexes segment timestamps to enable fast lookup.",
    },
  ],
  exercises: [
    "Design the transcoding task scheduler: given an upload queue with mixed video lengths (30 seconds to 12 hours) and a heterogeneous worker pool (CPU, GPU, ASIC), design a scheduling algorithm that minimizes time-to-first-playable-rendition while maximizing cluster utilization. Consider priority levels for different creator tiers.",
    "Implement a simplified ABR algorithm simulator: given a trace file of network bandwidth samples over time and a set of available bitrate levels, simulate segment-by-segment quality selection. Track metrics including average quality, number of quality switches, total rebuffering time, and startup delay. Compare throughput-based, buffer-based, and hybrid approaches.",
    "Design the CDN cache warming strategy for a viral video: a new video is gaining views exponentially (1K, 10K, 100K, 1M views in successive hours). Design a system that detects this growth pattern and proactively pushes segments to edge caches in regions where demand is predicted to spike. Define the trigger thresholds, the push prioritization logic, and the fallback when cache capacity is exceeded.",
    "Build a content deduplication system for video uploads: many users upload the same video (reposts, clips, mirrors). Design a fingerprinting approach that identifies duplicate or near-duplicate videos during upload, even if they have been re-encoded, cropped, or had overlays added. Consider perceptual hashing of frames, audio fingerprinting, and the tradeoff between precision and recall.",
    "Design the comments ranking system for a video with 500K comments: define the ranking signals (recency, likes, creator replies, toxicity score, user reputation), the data model for nested comment threads, and the query pattern for paginated loading. Consider how to surface the most relevant comments first while allowing chronological browsing.",
  ],
  revisionNotes: [
    "YouTube ingests ~500 hours/min of video; each upload produces 20-50 renditions across resolutions (144p-4K) and codecs (H.264, VP9, AV1)",
    "Transcoding pipeline is a DAG: demux, split into GOPs, parallel encode per resolution and codec, stitch, generate manifests, run moderation",
    "ABR streaming (HLS/DASH) splits each quality level into 2-6 second segments; client switches quality at segment boundaries based on throughput and buffer",
    "Buffer-based ABR is more stable than throughput-based: low buffer forces quality down, high buffer allows quality up, middle zone interpolates",
    "Three-tier CDN: edge (inside ISP, sub-10ms), regional (metro DC), origin (core DC); popular content >95% edge hit rate",
    "Recommendation funnel: candidate generation (embedding ANN, ~500-2K candidates from 800M+ corpus) then deep ranking model (~200ms latency budget)",
    "View counts use event streaming plus micro-batch aggregation to avoid DB hot spots; counts are eventually consistent",
    "AV1 gives ~30% bandwidth savings over VP9 but is 10-100x slower to encode; used selectively for popular videos",
    "Live streaming reduces segment duration to 1-2s, uses chunked transfer for sub-3s glass-to-glass latency",
    "Comments use fan-out-on-read with relevance ranking; writes pass through spam and toxicity moderation pipeline before persisting",
  ],
  cheatSheet: [
    "Upload path: Client -> Upload Service -> Object Storage (raw) -> Transcode Queue -> Workers -> Object Storage (renditions) -> CDN",
    "Playback path: Client -> DNS -> CDN Edge -> (miss) Regional Cache -> (miss) Origin Storage",
    "Manifest files: HLS uses .m3u8, DASH uses .mpd; both list available quality levels with bandwidth and codec info",
    "Segment duration tradeoff: shorter (2s) = faster quality switching + lower latency, longer (6s) = better compression + fewer requests",
    "Codec efficiency order: AV1 > VP9 > H.264; encoding cost order: AV1 >> VP9 > H.264",
    "Recommendation: collaborative filtering + content-based + trending + subscriptions -> candidate pool -> deep ranking model -> diversity injection -> final list",
    "View counting: event stream -> dedup -> micro-batch aggregate -> bulk DB write; in-memory counter for real-time approximate display",
    "Cache eviction: popularity-weighted LRU; proactive push for trending content; tiered admission based on predicted popularity",
    "Video storage: raw uploads in staging bucket, transcoded renditions in durable object storage with replication across regions",
    "Key metrics: Time to first byte, rebuffering ratio, average video quality, startup delay, recommendation CTR, watch time per session",
  ],
  glossary: [
    {
      term: "GOP (Group of Pictures)",
      definition:
        "A sequence of video frames beginning with an IDR (Instantaneous Decoder Refresh) key frame that can be decoded independently without reference to frames outside the group. GOPs are the unit of parallel transcoding and the basis for segment boundaries in ABR streaming.",
    },
    {
      term: "ABR (Adaptive Bitrate Streaming)",
      definition:
        "A streaming technique where video is encoded at multiple quality levels and split into small segments. The client dynamically selects the quality level for each segment based on current network conditions and buffer state, enabling seamless quality adaptation during playback.",
    },
    {
      term: "HLS (HTTP Live Streaming)",
      definition:
        "Apple's adaptive streaming protocol. Uses .m3u8 playlist files (master playlist listing renditions, media playlists listing segments) and .ts or .m4s segment files. Delivered over standard HTTP, making it compatible with existing CDN infrastructure.",
    },
    {
      term: "DASH (Dynamic Adaptive Streaming over HTTP)",
      definition:
        "An international standard (ISO/IEC 23009) for adaptive streaming. Uses .mpd (Media Presentation Description) XML manifests and .m4s segments. Codec-agnostic and more flexible than HLS, but less universally supported on Apple devices.",
    },
    {
      term: "VMAF (Video Multimethod Assessment Fusion)",
      definition:
        "A perceptual video quality metric developed by Netflix that combines multiple quality models to predict human perception of video quality on a 0-100 scale. Used to validate transcoding output quality and compare codec efficiency.",
    },
    {
      term: "Candidate Generation",
      definition:
        "The first stage of a two-stage recommendation system that uses computationally cheap methods (embedding similarity, collaborative filtering) to retrieve a manageable set of candidates (hundreds to thousands) from a corpus of hundreds of millions of items for the more expensive ranking stage.",
    },
    {
      term: "Edge PoP (Point of Presence)",
      definition:
        "A CDN cache server deployed at the network edge, often physically inside an ISP's data center. Serves cached content directly to nearby users with minimal latency and without traversing inter-network peering links, handling the majority of traffic for popular content.",
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "HLS",
      "DASH",
      "RTMP (Legacy)",
      "WebRTC (Ultra Low Latency)",
    ],
    rows: [
      [
        "Manifest Format",
        ".m3u8 playlist",
        ".mpd XML",
        "N/A (persistent connection)",
        "SDP (Session Description Protocol)",
      ],
      [
        "Segment Format",
        ".ts or .m4s (fMP4)",
        ".m4s (fMP4)",
        "FLV chunks",
        "RTP packets",
      ],
      [
        "Typical Latency",
        "6-30 seconds",
        "6-30 seconds (2-5s with low-latency extensions)",
        "1-3 seconds",
        "Sub-1 second",
      ],
      [
        "Codec Support",
        "H.264, HEVC, limited AV1",
        "Any (codec-agnostic)",
        "H.264 primarily",
        "VP8, VP9, H.264, AV1",
      ],
      [
        "CDN Compatible",
        "Yes (standard HTTP)",
        "Yes (standard HTTP)",
        "No (requires special servers)",
        "Limited (peer-to-peer focused)",
      ],
      [
        "Primary Use Case",
        "VOD and live on Apple devices",
        "VOD and live cross-platform",
        "Ingest from broadcasters",
        "Video calls and interactive live",
      ],
      [
        "DRM Support",
        "FairPlay",
        "Widevine, PlayReady, ClearKey",
        "Limited",
        "DTLS-SRTP encryption",
      ],
    ],
  },
  followUps: [
    "How would you design YouTube's copyright detection system (Content ID) to scan uploads against a database of millions of reference files in near real-time?",
    "How would you handle YouTube Shorts differently from long-form video in terms of encoding, caching, and recommendation?",
    "How would you design the monetization system, including ad insertion (pre-roll, mid-roll), auction-based ad selection, and creator revenue tracking?",
    "How would you design YouTube's live chat system to handle millions of concurrent messages during popular live streams?",
    "How would you implement YouTube's offline download feature, including DRM, storage management, and expiration policies?",
    "How would you design a real-time analytics dashboard for creators showing views, watch time, audience retention, and revenue updated within seconds?",
  ],
  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Covers distributed systems fundamentals applicable to video platform design: stream processing, replication, partitioning, and consistency models",
    },
    {
      label: "System Design Interview by Alex Xu - YouTube Chapter",
      kind: "book",
      note: "Structured walkthrough of YouTube system design covering upload, transcode, streaming, and CDN with clear diagrams and capacity estimation",
    },
    {
      label: "Deep Neural Networks for YouTube Recommendations (2016 Google Paper)",
      kind: "article",
      note: "Foundational paper describing the two-stage candidate generation and ranking architecture used in YouTube recommendations",
    },
    {
      label: "How Netflix and YouTube Deliver Content Using ABR Streaming",
      kind: "video",
      note: "Explains HLS and DASH protocols, segment-based delivery, and buffer management algorithms with visual demonstrations",
    },
    {
      label: "Video Coding Unit: Hardware-Accelerated Video Transcoding at Google Scale",
      kind: "article",
      note: "Details Google's custom ASIC for video encoding, the cost-performance tradeoffs vs GPU and CPU encoding, and deployment at YouTube scale",
    },
  ],
};
