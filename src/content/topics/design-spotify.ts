import type { TopicContent } from "../types";

export const designSpotify: TopicContent = {
  quickSummary: [
    "Spotify serves ~600M users and ~100M tracks using a microservices architecture. Audio is encoded in multiple codecs (Ogg Vorbis for desktop, AAC for mobile/web) at various bitrates (96/160/320 kbps). A CDN edge-caching layer delivers audio chunks close to users, reducing latency and backbone bandwidth.",
    "The recommendation engine powers Discover Weekly and Daily Mix using a hybrid approach: collaborative filtering identifies taste clusters from listening history, while NLP models analyze playlist titles and track metadata. Audio feature extraction (tempo, energy, valence) via CNNs on spectrograms further refines suggestions.",
    "Playlist management supports both user-created and algorithmic playlists. Playlists are stored as ordered lists of track references with versioning for concurrent edits. Social features (follow, collaborative playlists, friend activity) rely on a social graph service backed by a graph database.",
    "Offline mode downloads encrypted audio files to local storage with DRM protection. A download manager handles queue prioritization, partial resume, and storage quota enforcement. Podcast support adds RSS ingestion, episode metadata parsing, and separate playback position tracking.",
    "The system uses event-driven architecture with Kafka for play events, search queries, and user interactions. These events feed real-time analytics, royalty calculation pipelines, and the recommendation engine. Failure isolation via circuit breakers ensures degraded playback (cached content) even during backend outages.",
  ],
  detailed: [
    "## High-Level Architecture\n\nSpotify's architecture is decomposed into several core services: an API Gateway that handles authentication and request routing, an Audio Streaming Service that manages codec selection and chunk delivery, a Metadata Service for track/artist/album information, a Recommendation Service for personalized content, a Playlist Service for CRUD operations on playlists, and a Search Service backed by Elasticsearch. The API Gateway sits behind a global load balancer and terminates TLS. Client applications (mobile, desktop, web) communicate via HTTP/2 for metadata requests and a custom streaming protocol for audio delivery. The Audio Streaming Service selects the appropriate audio file based on the client's device type, network conditions, and user subscription tier (free users get lower bitrates). Audio files are stored in object storage (GCS/S3) and cached at edge PoPs worldwide. The Metadata Service uses PostgreSQL with read replicas for structured data (tracks, artists, albums) and caches hot queries in Redis. All services communicate asynchronously through Kafka topics for event-driven workflows such as play count aggregation, royalty computation, and recommendation model updates.",
    "## Capacity Estimation (Back-of-Envelope)\n\nSizing the system first keeps every later design decision honest. Assume ~600M monthly users, ~250M daily actives, and a catalog of ~100M tracks.\n\n### Catalog storage\n\n- Average track ~3.5 minutes at 320 kbps Ogg = 210s x 40 KB/s = ~8.4 MB, but averaged across the encoding ladder a variant is ~3 MB.\n- 100M tracks x ~6 encodings (Ogg 96/160/320, AAC 128/256, HE-AAC 24) x ~3 MB avg = ~1.8 PB of encoded audio, plus ~100M x ~30 MB lossless masters = ~3 PB. Call it ~5 PB with replication factor amortized into object-storage durability — small enough that storage is NOT the hard problem; delivery is.\n\n### Streaming egress\n\n- Peak concurrent streams: ~5% of MAU = 30M concurrent. At 160 kbps average that is 30M x 160 kbps = 4.8 Tbps of egress. This is why a multi-CDN edge layer is non-negotiable: origin object storage could never serve that directly.\n- A 90%+ CDN hit rate cuts origin egress to under ~500 Gbps, and because listening is extremely head-heavy (top 10-15% of tracks take most plays), a modest L1 edge cache achieves it.\n\n### Event throughput\n\n- 250M DAU x ~40 tracks/day = ~10B play events/day = ~115K events/sec average, ~350K/sec peak. At ~500 bytes/event that is ~60 MB/s average into Kafka — trivially handled by a few dozen partitions, but the ordering key (userId) and exactly-once royalty semantics are the real design constraints.\n- Metadata QPS: each play needs a metadata + license lookup; with Redis caching at 99% hit rate, PostgreSQL sees only ~1-3K QPS.\n\nKey insight: Spotify is read-heavy and delivery-bound. Storage (~petabytes) is cheap; the 4-5 Tbps egress and the 10B/day event stream are what shape the architecture.\n\nCommon mistake: candidates size storage meticulously and never compute egress. Interviewers want the 30M concurrent x 160 kbps multiplication — it justifies the entire CDN layer in one line.",
    "## Audio Streaming and Codec Pipeline\n\nAudio ingestion begins when a label or artist uploads a master file (typically WAV or FLAC). The ingestion pipeline transcodes this into multiple formats and bitrates: Ogg Vorbis at 96/160/320 kbps for desktop, AAC at 128/256 kbps for mobile and web, and HE-AAC at 24 kbps for ultra-low bandwidth scenarios. Each transcoded file is split into fixed-size chunks (typically 5-10 seconds) to enable adaptive bitrate switching mid-stream. The client maintains a ring buffer that prefetches 2-3 chunks ahead of the current playback position. When network conditions degrade, the client seamlessly switches to a lower bitrate variant without interrupting playback. Gapless playback between tracks is achieved by pre-decoding the first chunk of the next track while the current track finishes. The streaming protocol uses HTTP range requests against CDN edge servers, with fallback to origin servers if the edge cache misses. Audio normalization metadata (ReplayGain values) is stored per track and applied client-side to maintain consistent perceived loudness across tracks.",
    "## Recommendation Engine and Discover Weekly\n\nThe recommendation system combines three signal types: collaborative filtering, natural language processing, and raw audio analysis. Collaborative filtering uses matrix factorization (ALS - Alternating Least Squares) on the user-track interaction matrix to compute latent factor vectors for both users and tracks. Users with similar listening patterns cluster together, and tracks popular within a cluster but not yet heard by a target user become candidates. NLP models process playlist titles, descriptions, and music blog text to build semantic embeddings for tracks. If a track frequently appears in playlists titled 'chill Sunday morning' alongside another track, they share semantic proximity even without direct co-listening data. Audio feature extraction runs convolutional neural networks on mel-spectrograms to compute features like tempo, energy, danceability, and valence. The final ranking model blends these three signal sources using a learned weighting, personalized per user. Discover Weekly is generated weekly via a batch pipeline (Spark/Dataflow) that produces 30 candidate tracks per user, while Daily Mix and Release Radar use near-real-time streaming pipelines for fresher content.",
    "## Playlist Management and Social Features\n\nPlaylists are stored as versioned ordered lists in a dedicated Playlist Service backed by Cassandra. Each playlist entry contains a track reference, insertion timestamp, and the user who added it. Collaborative playlists use operational transformation (OT) to merge concurrent edits from multiple contributors without conflicts. The social graph service, backed by Neo4j or a similar graph database, manages follow relationships between users, artists, and playlists. Friend activity feeds are generated via fan-out on write for users with fewer than 5,000 followers and fan-out on read for high-follower accounts. The search service indexes track titles, artist names, album names, lyrics, and podcast transcripts in Elasticsearch with custom analyzers for multilingual support. Search ranking combines text relevance with popularity signals (play count, save count) and personalization (user's listening history). Autocomplete uses a prefix trie with frequency-weighted suggestions, updated hourly from search query logs.",
    "## Offline Mode and Podcast Support\n\nOffline playback requires downloading encrypted audio files to the device. Files are encrypted with a device-specific key derived from the user's authentication token, preventing file sharing between devices. The download manager prioritizes downloads based on user behavior: frequently played playlists download first, and tracks are removed from offline storage using an LRU policy when the storage quota is reached. Download progress survives app restarts via a persistent task queue stored in SQLite. For podcasts, Spotify ingests RSS feeds from publishers on a configurable polling interval (typically 15-30 minutes). New episodes trigger metadata parsing (title, description, duration, chapters), audio transcoding into the standard codec pipeline, and notification delivery to subscribers. Podcast playback tracks per-episode progress (resume position) separately from music, stored in a dedicated user-state service. Ad insertion for free-tier podcast listeners uses server-side ad stitching, where ad segments are dynamically inserted into the audio stream at predefined marker positions before the chunks reach the client.",
    "## The Encoding Ladder\n\nEvery master is transcoded once into a fixed ladder of codec/bitrate variants so the client can pick per device, tier, and network. Naming the exact ladder is an easy way to show depth in an interview:\n\n| Codec | Bitrates | Target | Why |\n| --- | --- | --- | --- |\n| Ogg Vorbis | 96 / 160 / 320 kbps | Desktop, Android app | Open codec, no per-unit licensing, good quality/size |\n| AAC-LC | 128 / 256 kbps | iOS, Web (MSE/EME) | Hardware decode = battery savings; browser support |\n| HE-AAC v2 | 24 kbps | 2G/emerging markets | Intelligible audio on ~3 KB/s links |\n| FLAC/WAV | lossless | Ingestion master + Hi-Fi tier | Re-encode source when ladder changes |\n\nTranscoding is an embarrassingly parallel batch job: new uploads land in object storage, a message on a transcode queue fans out one worker per variant, and outputs are chunked, checksummed (SHA-256 in the manifest), and registered in the metadata store.\n\nIn practice: keeping the lossless master means a new codec (e.g. adding Opus) is a backfill job over 100M tracks — roughly 100M x 6 min of CPU-audio-time, which a few thousand preemptible cores clear in days.\n\nKey insight: free tier is capped at 160 kbps and premium unlocks 320 kbps — bitrate selection is a business lever, not just a network optimization.",
    "## Pressing Play, End-to-End\n\nTracing one Play tap through every layer is the single best way to present this design. The target is sub-300ms perceived start time.\n\n1. Client checks its local cache: recently played segments and prefetched tracks live in an LRU on-device cache. A hit means playback starts in ~10ms with zero network calls (metadata is also cached locally).\n2. On miss, the client calls the API Gateway over an already-warm HTTP/2 connection; OAuth token validated at the edge (~5ms, Redis session lookup).\n3. Playback Service fetches track metadata from Redis (~1ms hit; PostgreSQL fallback) and calls the Licensing Service: is this track playable in the user's region and tier? License data is small and cached aggressively; a denial returns an alternative-catalog response.\n4. The service assembles a manifest: segment URLs for each ladder variant, signed with short-lived tokens so the CDN can authorize without calling back, plus ReplayGain loudness metadata.\n5. Client picks a starting bitrate from its recent throughput estimate, then issues an HTTP range GET for segment 0 to the nearest CDN PoP. L1 hit (~90% of requests) returns in 20-50ms; a miss cascades L2 then origin, streaming through to the client while caching asynchronously.\n6. Decode of segment 0 begins before segment 1 arrives; the ring buffer prefetches 2-3 segments ahead and playback starts as soon as ~1 second of audio is buffered.\n7. Meanwhile the client predicts the NEXT track (next in queue/playlist, or the autoplay model's top candidate) and prefetches its manifest plus first segment — this is why consecutive tracks start instantly and gapless playback works.\n8. Play progress events are batched locally and flushed to Kafka every ~30-60s and on track end — asynchronously, never blocking the audio path.\n\nKey insight: the fast path touches only Redis and the CDN. PostgreSQL, Cassandra, and Kafka are all off the critical playback path by design.\n\nCommon mistake: putting the license check or the play-event write synchronously in front of first audio byte. License results are cacheable per (track, region, tier); events are fire-and-forget.",
  ],
  deepDive: [
    "## Scaling the Audio Delivery Network\n\nSpotify's CDN strategy is a hybrid of third-party CDNs (Fastly, Akamai, Google CDN) and its own edge infrastructure deployed at ISP peering points. The system uses a two-tier caching architecture: L1 caches at edge PoPs store the hottest 10-15% of tracks (top charts, new releases, viral content), while L2 regional caches hold a broader catalog. Cache admission policies use a combination of request frequency and track popularity scores, with new releases receiving a popularity boost to pre-warm caches before traffic spikes. When a cache miss occurs, the edge server fetches from the nearest regional cache or origin, streams the first chunk immediately to the client, and caches asynchronously. Consistent hashing maps track IDs to origin storage nodes, with virtual nodes ensuring even distribution across a heterogeneous storage fleet. During peak events (album drops by major artists), the system pre-distributes audio files to edge caches 1-2 hours before the release time based on pre-save counts and historical traffic patterns. Failure handling includes automatic failover between CDN providers using real-time latency and error rate monitoring, ensuring that a single CDN outage does not disrupt playback globally.",
    "## Real-Time Event Processing and Royalty Calculation\n\nEvery play event generates a structured event containing user ID, track ID, timestamp, duration played, skip flag, and device context. These events flow into Kafka topics partitioned by user ID for ordering guarantees. A Flink streaming pipeline deduplicates events (handling client retries), validates play eligibility (must play at least 30 seconds for a royalty-qualifying stream), and enriches events with track metadata. The enriched events feed multiple downstream consumers: a real-time play counter (backed by Redis HyperLogLog for unique listener counts), a royalty calculation engine that apportions the subscriber's monthly fee across rights holders based on their share of the user's listening time (the streamshare model), and the recommendation engine's feedback loop. The royalty pipeline must be auditable and exactly-once: Flink's checkpointing with Kafka transactional producers ensures no duplicate or lost payments. Monthly royalty reports aggregate billions of events into per-rights-holder payment summaries, stored in a data warehouse (BigQuery/Snowflake) for label access via a reporting portal. The analytics pipeline also powers Spotify for Artists dashboards, providing near-real-time streaming counts, listener demographics, and playlist placement data.\n\n### Why exactly-once is really exactly-once-ish\n\nTrue end-to-end exactly-once is impossible with an at-least-once client: a phone can crash after playing but before flushing its event batch, or replay a batch after a flaky upload. So the pipeline layers defenses: (1) every event carries a client-generated UUID and a monotonically increasing per-device sequence number; (2) Flink dedupes on (deviceId, sequenceNo) within a multi-day keyed-state window; (3) Kafka transactional producers + Flink checkpoints make the processing graph itself exactly-once; (4) offline plays are journaled locally with the DRM lease and reconciled on reconnect, timestamped with the original play time.\n\n### Reconciliation as the safety net\n\nStream counts are money, so streaming output is never the final word. A nightly batch job (Spark over the raw Kafka archive in object storage) independently recomputes per-track counts and diffs them against the streaming pipeline's aggregates. Divergence beyond a small epsilon pages an on-call and freezes the affected accounting period; monthly close runs entirely from the batch (lambda-architecture style), with the streaming numbers serving dashboards only.\n\nKey insight: use streaming for freshness and batch for correctness — the royalty ledger of record is the replayable raw event log, not any derived aggregate.\n\nCommon mistake: claiming 'Kafka gives exactly-once' and stopping. Kafka transactions only cover broker-to-processor; client retries, offline replay, and cross-system sinks still need idempotency keys and reconciliation.",
    "## Consistency, Availability, and Partition Tolerance Trade-offs\n\nSpotify's system design makes deliberate CAP trade-offs per service. The Audio Streaming Service prioritizes availability and partition tolerance: if the metadata service is temporarily unreachable, the client can still play cached audio and display locally stored metadata. The Playlist Service uses eventual consistency for read replicas but strong consistency for writes (quorum writes in Cassandra with LOCAL_QUORUM) to prevent data loss on collaborative playlists. The recommendation engine is inherently eventually consistent since model updates propagate through batch pipelines with multi-hour latency. Search indexing has a similar lag, with new tracks becoming searchable within minutes via a near-real-time indexing pipeline. User authentication uses strong consistency (if a password changes, all sessions must reflect it immediately), backed by a globally replicated identity store with synchronous replication. Play count displays are eventually consistent with a lag of up to 5 minutes, which is acceptable for UI purposes. The system employs circuit breakers at service boundaries: if the recommendation service is down, the client falls back to cached recommendations or popularity-based defaults. Bulkhead isolation ensures that a failing podcast ingestion pipeline does not impact music playback.",
    "## Security, DRM, and Content Protection\n\nAudio content protection uses Widevine DRM for encrypted streaming and offline playback. Each audio chunk is encrypted with a content key, and the client obtains a license (containing the decryption key) from a license server after authentication. Licenses are time-bound and tied to the user's subscription status: if a subscription lapses, offline licenses expire and cached files become unplayable. The client-side player runs in a sandboxed environment to prevent memory scraping of decrypted audio. API security uses OAuth 2.0 with short-lived access tokens (1 hour) and refresh tokens stored securely in the platform's keychain. Rate limiting at the API Gateway prevents abuse: per-user limits on API calls (search, playlist operations) and per-IP limits on authentication attempts. Content integrity is verified via SHA-256 checksums embedded in the streaming manifest: the client validates each chunk after download and before decoding, requesting a re-fetch on mismatch. Fraud detection systems monitor for artificial streaming (bots, stream farms) using behavioral signals: listening patterns, device fingerprints, IP clustering, and skip rates.",
    "## Playlist Data Model at Scale\n\nPlaylists look trivial and are one of the hardest data models in the system: 4B+ playlists, some with 10K+ tracks, hot celebrity playlists read millions of times a day, and collaborative playlists edited concurrently from phones that were offline for hours.\n\n### Storage layout\n\nCassandra partitions by `playlist_id`; each row is a revision entry, not a mutable position. The playlist is modeled as an append-only operation log — `add(trackRef, afterAnchor)`, `remove(entryId)`, `move(entryId, afterAnchor)` — plus periodic materialized snapshots so a read is `latest snapshot + ops since` rather than a replay from the beginning. Track positions use anchor references (entry UUIDs) instead of integer indexes, so a move does not renumber thousands of rows.\n\n### Versioning and sync\n\nEvery playlist has a monotonically increasing revision number. Clients sync by sending `(playlistId, lastKnownRevision)` and receiving a diff of operations — tiny payloads even for huge playlists, and the same mechanism drives offline reconciliation: a client that edited offline submits its ops based on revision N; the server transforms them against revisions N+1..M (operational transformation) and returns the rebased result. Duplicate adds converge because entry IDs are client-generated UUIDs (idempotent replay).\n\n### Hot playlists\n\nFor example, Today's Top Hits has tens of millions of followers, so its reads never hit Cassandra directly: the materialized snapshot is cached in Redis and at the edge, invalidated by revision bump. Follower fan-out for update notifications goes through Kafka rather than synchronous writes.\n\nKey insight: model playlists as an op log with snapshots, not as a mutable array. You get versioning, cheap diffs, collaborative merge, and offline sync from one design decision.\n\nCommon mistake: storing position as an integer column. Every insert at the top becomes an O(n) renumber, and two concurrent inserts at position 3 conflict irreconcilably.",
    "## Recommendation Architecture: Offline Batch plus Online Features\n\nThe recommendation stack is a textbook lambda split: heavy learning offline, cheap personalization online.\n\n### Offline (hours to weekly)\n\nSpark jobs over the full interaction matrix run ALS to produce ~100-dim user and track embedding vectors; CNNs over mel-spectrograms embed acoustic similarity (crucial for cold-start tracks with no play history); NLP models embed tracks from playlist-title and music-blog co-occurrence. The weekly Discover Weekly job does candidate generation (approximate nearest neighbor search over track embeddings, via an ANN index like Annoy — built at Spotify for exactly this), scoring, and diversity filtering, then materializes 30 tracks per user into a serving store. Serving a recommendation is then a key-value read, not an inference call.\n\n### Online (milliseconds)\n\nA feature store keeps fresh short-term signals: last-N plays, skips in the current session, time of day, device. Lightweight online rankers re-order precomputed candidates using these — this is how Autoplay and session radio adapt within minutes while the embeddings behind them are days old.\n\n### Feedback loop\n\nSkips within 30 seconds are strong negative labels; completes, saves, and playlist-adds are positives. These flow back through the Kafka -> Flink -> feature pipeline path, so the play-event stream is simultaneously the royalty source and the training-data source.\n\nIn practice: evaluation is the hard part — offline metrics (precision@30 on held-out future listens) are gated by online A/B tests on retention and listening time, because optimizing click-through alone degrades long-term satisfaction.\n\nCommon mistake: proposing real-time retraining of the whole model. Embedding training is batch by nature; freshness comes from the online feature layer and candidate re-ranking, not from retraining ALS every minute.",
    "## Gapless Playback and Prefetching Internals\n\nGapless playback is a client-systems problem that most candidates hand-wave; walking the buffer mechanics wins points.\n\n### The double-decode pipeline\n\nThe player keeps two decoder contexts. While track A plays from its ring buffer, the client (a) predicts track B — next queue item, or the autoplay model's top candidate — (b) fetches B's manifest and first 1-2 segments, and (c) pre-decodes B's first segment into a second PCM buffer. At A's final sample the audio callback switches buffers within a single audio-device callback period (~10ms), so there is no audible gap. Optional crossfade mixes the two PCM streams over the configured overlap window.\n\n### Codec-level gotchas\n\nLossy codecs pad encoder delay and trailing samples; Ogg and AAC carry gapless metadata (encoder delay + true sample length) in the manifest so the client trims padding — without this you get the classic click between live-album tracks.\n\n### Prefetch budget\n\nPrefetching is a bandwidth/battery trade-off: on Wi-Fi the client may prefetch several upcoming tracks; on metered mobile it limits to the next track's first segment; radio-mode prediction confidence gates how much of B is fetched. Buffer sizing follows from bitrate: at 160 kbps, a 30-second safety buffer is only ~600 KB — memory is never the constraint, the radio's wake-ups are (batching fetches lets the cellular radio sleep, a major battery win).\n\nKey insight: perceived performance comes from moving work ahead of the play head — prefetch the next segment, the next track, and even the manifest, all speculatively and cancellable.\n\nWarning: prefetched-but-unplayed segments must not count as royalty streams — another reason play events are emitted by the playback clock, not by the network layer.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Audio Streaming Ring Buffer with Prefetch",
      source: `#include <vector>
#include <cstdint>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <optional>
#include <string>
#include <atomic>

/**
 * Ring buffer for audio chunk streaming with prefetch.
 * Maintains a fixed-size circular buffer of audio chunks.
 * The producer (network thread) writes chunks ahead of playback.
 * The consumer (audio decoder thread) reads chunks sequentially.
 * Prefetch triggers when buffer occupancy drops below a threshold.
 */

struct AudioChunk {
    std::vector<uint8_t> data;
    uint32_t chunkIndex;
    uint32_t bitrateKbps;
    double   durationSec;
    std::string trackId;
};

class AudioRingBuffer {
private:
    std::vector<std::optional<AudioChunk>> buffer_;
    size_t capacity_;
    size_t head_ = 0;  // next write position (producer)
    size_t tail_ = 0;  // next read position (consumer)
    size_t count_ = 0;

    mutable std::mutex mtx_;
    std::condition_variable notEmpty_;
    std::condition_variable notFull_;

    // Prefetch callback: invoked when buffer falls below threshold
    std::function<void(uint32_t nextChunkIndex)> prefetchCallback_;
    size_t prefetchThreshold_;

    std::atomic<bool> stopped_{false};

public:
    AudioRingBuffer(size_t capacity, size_t prefetchThreshold,
                    std::function<void(uint32_t)> prefetchCb)
        : buffer_(capacity),
          capacity_(capacity),
          prefetchThreshold_(prefetchThreshold),
          prefetchCallback_(std::move(prefetchCb)) {}

    // Producer: enqueue a fetched audio chunk
    bool enqueue(AudioChunk chunk) {
        std::unique_lock<std::mutex> lock(mtx_);
        notFull_.wait(lock, [this] {
            return count_ < capacity_ || stopped_.load();
        });
        if (stopped_.load()) return false;

        buffer_[head_] = std::move(chunk);
        head_ = (head_ + 1) % capacity_;
        ++count_;

        notEmpty_.notify_one();
        return true;
    }

    // Consumer: dequeue the next chunk for playback
    std::optional<AudioChunk> dequeue() {
        std::unique_lock<std::mutex> lock(mtx_);
        notEmpty_.wait(lock, [this] {
            return count_ > 0 || stopped_.load();
        });
        if (stopped_.load() && count_ == 0) return std::nullopt;

        auto chunk = std::move(buffer_[tail_]);
        buffer_[tail_].reset();
        tail_ = (tail_ + 1) % capacity_;
        --count_;

        // Trigger prefetch if buffer is running low
        if (count_ <= prefetchThreshold_ && prefetchCallback_) {
            uint32_t nextNeeded = chunk->chunkIndex + count_ + 1;
            lock.unlock();
            prefetchCallback_(nextNeeded);
        } else {
            lock.unlock();
        }

        notFull_.notify_one();
        return chunk;
    }

    size_t occupancy() const {
        std::lock_guard<std::mutex> lock(mtx_);
        return count_;
    }

    void stop() {
        stopped_.store(true);
        notEmpty_.notify_all();
        notFull_.notify_all();
    }

    // Flush buffer on track change or seek
    void flush() {
        std::lock_guard<std::mutex> lock(mtx_);
        for (auto& slot : buffer_) slot.reset();
        head_ = tail_ = count_ = 0;
    }
};

// Usage example:
// AudioRingBuffer buf(8, 2, [&](uint32_t idx) {
//     networkThread.fetchChunk(currentTrackId, idx);
// });
// Producer thread: buf.enqueue(fetchedChunk);
// Decoder thread:  auto chunk = buf.dequeue();`,
    },
    {
      language: "cpp",
      caption: "Collaborative Filtering - Cosine Similarity for Recommendations",
      source: `#include <vector>
#include <cmath>
#include <unordered_map>
#include <algorithm>
#include <string>
#include <utility>

/**
 * Collaborative filtering using cosine similarity on user-track
 * interaction vectors. This is the core computation behind
 * Discover Weekly: find users with similar taste, then recommend
 * tracks those similar users enjoy but the target user hasn't heard.
 *
 * In production, this runs as a distributed Spark/Flink job over
 * hundreds of millions of user vectors. The C++ snippet shows the
 * per-user similarity and recommendation logic.
 */

struct UserProfile {
    std::string userId;
    // Sparse vector: trackIndex -> play count (normalized)
    std::unordered_map<uint32_t, float> trackWeights;
};

// Compute cosine similarity between two sparse user vectors
double cosineSimilarity(const UserProfile& a, const UserProfile& b) {
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;

    // Iterate over the smaller vector for efficiency
    const auto& smaller = (a.trackWeights.size() < b.trackWeights.size())
                          ? a.trackWeights : b.trackWeights;
    const auto& larger  = (a.trackWeights.size() < b.trackWeights.size())
                          ? b.trackWeights : a.trackWeights;

    for (const auto& [trackIdx, weightA] : smaller) {
        auto it = larger.find(trackIdx);
        if (it != larger.end()) {
            dotProduct += weightA * it->second;
        }
    }

    for (const auto& [_, w] : a.trackWeights) normA += w * w;
    for (const auto& [_, w] : b.trackWeights) normB += w * w;

    if (normA == 0.0 || normB == 0.0) return 0.0;
    return dotProduct / (std::sqrt(normA) * std::sqrt(normB));
}

struct ScoredTrack {
    uint32_t trackIndex;
    double   score;
};

// Generate recommendations for a target user
std::vector<ScoredTrack> recommendTracks(
    const UserProfile& target,
    const std::vector<UserProfile>& allUsers,
    size_t topK = 30,
    size_t neighborCount = 50)
{
    // Step 1: Find most similar users (nearest neighbors)
    std::vector<std::pair<double, size_t>> similarities;
    similarities.reserve(allUsers.size());
    for (size_t i = 0; i < allUsers.size(); ++i) {
        if (allUsers[i].userId == target.userId) continue;
        double sim = cosineSimilarity(target, allUsers[i]);
        if (sim > 0.01) {  // skip near-zero similarity
            similarities.push_back({sim, i});
        }
    }

    // Partial sort to get top neighbors efficiently
    size_t nNeighbors = std::min(neighborCount, similarities.size());
    std::partial_sort(similarities.begin(),
                      similarities.begin() + nNeighbors,
                      similarities.end(),
                      [](const auto& a, const auto& b) {
                          return a.first > b.first;
                      });

    // Step 2: Aggregate track scores from neighbors
    std::unordered_map<uint32_t, double> candidateScores;
    for (size_t i = 0; i < nNeighbors; ++i) {
        double sim = similarities[i].first;
        const auto& neighbor = allUsers[similarities[i].second];
        for (const auto& [trackIdx, weight] : neighbor.trackWeights) {
            // Only recommend tracks the target hasn't heard
            if (target.trackWeights.find(trackIdx) ==
                target.trackWeights.end()) {
                candidateScores[trackIdx] += sim * weight;
            }
        }
    }

    // Step 3: Rank candidates and return top-K
    std::vector<ScoredTrack> results;
    results.reserve(candidateScores.size());
    for (const auto& [trackIdx, score] : candidateScores) {
        results.push_back({trackIdx, score});
    }

    size_t nResults = std::min(topK, results.size());
    std::partial_sort(results.begin(),
                      results.begin() + nResults,
                      results.end(),
                      [](const auto& a, const auto& b) {
                          return a.score > b.score;
                      });
    results.resize(nResults);
    return results;
}`,
    },
    {
      language: "cpp",
      caption: "Consistent Hashing Ring for Distributed Audio Storage",
      source: `#include <map>
#include <string>
#include <vector>
#include <functional>
#include <cstdint>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <stdexcept>

/**
 * Consistent hashing ring for distributing audio files across
 * storage nodes. Virtual nodes ensure even distribution even
 * when physical nodes have different capacities.
 *
 * Used to determine which storage node holds a given track's
 * audio files, enabling O(1) lookup and minimal remapping
 * when nodes are added or removed.
 */

class ConsistentHashRing {
private:
    // Sorted map of hash positions to node identifiers
    std::map<uint64_t, std::string> ring_;
    int virtualNodesPerNode_;

    // FNV-1a 64-bit hash for deterministic, well-distributed hashing
    static uint64_t fnv1aHash(const std::string& key) {
        uint64_t hash = 14695981039346656037ULL;
        for (char c : key) {
            hash ^= static_cast<uint64_t>(c);
            hash *= 1099511628211ULL;
        }
        return hash;
    }

    std::string makeVirtualKey(const std::string& node, int idx) {
        std::ostringstream oss;
        oss << node << "#vn" << std::setfill('0')
            << std::setw(4) << idx;
        return oss.str();
    }

public:
    explicit ConsistentHashRing(int virtualNodesPerNode = 150)
        : virtualNodesPerNode_(virtualNodesPerNode) {}

    // Add a storage node with its virtual nodes
    void addNode(const std::string& nodeId) {
        for (int i = 0; i < virtualNodesPerNode_; ++i) {
            std::string vKey = makeVirtualKey(nodeId, i);
            uint64_t hash = fnv1aHash(vKey);
            ring_[hash] = nodeId;
        }
    }

    // Remove a storage node and all its virtual nodes
    void removeNode(const std::string& nodeId) {
        for (int i = 0; i < virtualNodesPerNode_; ++i) {
            std::string vKey = makeVirtualKey(nodeId, i);
            uint64_t hash = fnv1aHash(vKey);
            ring_.erase(hash);
        }
    }

    // Find which node stores a given track's audio files
    std::string getNode(const std::string& trackId) const {
        if (ring_.empty()) {
            throw std::runtime_error("Hash ring is empty");
        }
        uint64_t hash = fnv1aHash(trackId);
        // Find the first node at or after this hash position
        auto it = ring_.lower_bound(hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // wrap around the ring
        }
        return it->second;
    }

    // Get N replica nodes for redundancy (distinct physical nodes)
    std::vector<std::string> getReplicaNodes(
        const std::string& trackId, int replicaCount = 3) const
    {
        if (ring_.empty()) {
            throw std::runtime_error("Hash ring is empty");
        }
        std::vector<std::string> replicas;
        uint64_t hash = fnv1aHash(trackId);
        auto it = ring_.lower_bound(hash);

        while (replicas.size() < static_cast<size_t>(replicaCount)) {
            if (it == ring_.end()) it = ring_.begin();
            // Only add if this physical node isn't already a replica
            if (std::find(replicas.begin(), replicas.end(),
                          it->second) == replicas.end()) {
                replicas.push_back(it->second);
            }
            ++it;
        }
        return replicas;
    }

    size_t nodeCount() const {
        // Count distinct physical nodes
        std::vector<std::string> unique;
        for (const auto& [_, node] : ring_) {
            if (std::find(unique.begin(), unique.end(), node)
                == unique.end()) {
                unique.push_back(node);
            }
        }
        return unique.size();
    }

    size_t ringSize() const { return ring_.size(); }
};

// Usage:
// ConsistentHashRing ring(150);
// ring.addNode("storage-us-east-1a");
// ring.addNode("storage-us-west-2b");
// ring.addNode("storage-eu-west-1c");
// auto node = ring.getNode("track:spotify:4uLU6hMCjMI75M1A2tKUQC");
// auto replicas = ring.getReplicaNodes("track:...", 3);`,
    },
  ],
  diagrams: [
    {
      title: "Spotify System Architecture",
      kind: "architecture",
      caption:
        "Layered architecture: clients with local cache and offline downloads, CDN edge for audio segments, gateway, core services, Redis cache, Kafka async pipelines feeding royalty/analytics/ML, polyglot data stores, and the Discover Weekly-style ML platform. Solid path on the left is play-a-song (metadata, license check, CDN segments); the Kafka branch is the play-event analytics path.",
      mermaid: `graph TB
    subgraph Clients["Clients"]
        MOB["Mobile App<br/>local segment cache +<br/>encrypted offline downloads"]
        DSK["Desktop App<br/>Ogg Vorbis player + cache"]
        WEB["Web Player<br/>AAC via EME/Widevine"]
    end

    subgraph Edge["Edge - Audio Delivery"]
        CDN["Multi-CDN<br/>Fastly / Akamai / Cloud CDN"]
        L1C["L1 Edge Cache<br/>hot 10-15% of tracks"]
        L2C["L2 Regional Cache<br/>broad catalog"]
    end

    subgraph Gateway["Gateway Layer"]
        GLB["Global Load Balancer<br/>GeoDNS + Anycast + TLS"]
        APIGW["API Gateway<br/>OAuth 2.0, rate limits, routing"]
    end

    subgraph Services["Core Services"]
        PLAY["Playback/Streaming Service<br/>manifest + codec/bitrate selection"]
        SRCH["Search Service"]
        PLS["Playlist Service<br/>versioned, collaborative"]
        LIB["Library Service<br/>saves, likes, follows of albums"]
        SOC["Social/Follow Service<br/>friend activity feed"]
        LIC["Licensing Service<br/>region rights + royalty tracking"]
        RECS["Recommendation Service<br/>serves precomputed playlists"]
    end

    subgraph CacheLayer["Cache"]
        RMETA["Redis<br/>track/artist/album metadata"]
        RSESS["Redis<br/>sessions + playback state"]
    end

    subgraph Async["Async - Event Pipeline"]
        KAF["Kafka<br/>play/skip/save events<br/>partitioned by userId"]
        FLK["Flink Stream Processing<br/>dedupe + 30s royalty validation"]
        ROY["Royalty Pipeline<br/>streamshare aggregation"]
        ANA["Analytics<br/>Spotify for Artists"]
        MLP["ML Feature Pipelines<br/>interaction matrix updates"]
    end

    subgraph DataStores["Data"]
        CASS["Cassandra<br/>playlists + library"]
        PG["PostgreSQL<br/>users + licensing/rights"]
        ES["Elasticsearch<br/>search index"]
        S3A["S3/GCS<br/>audio masters + encoded segments"]
        BQ["BigQuery<br/>warehouse + royalty reports"]
    end

    subgraph MLPlat["ML - Discover Weekly Pipeline"]
        ALS["Collaborative Filtering<br/>ALS on Spark"]
        CNN["Audio Analysis CNN<br/>mel-spectrograms"]
        NLP["NLP Embeddings<br/>playlist titles + blogs"]
        GEN["Weekly Batch Generator<br/>30 tracks per user"]
    end

    MOB --> GLB
    DSK --> GLB
    WEB --> GLB
    GLB --> APIGW
    APIGW --> PLAY
    APIGW --> SRCH
    APIGW --> PLS
    APIGW --> LIB
    APIGW --> SOC
    APIGW --> RECS
    APIGW --> RSESS

    PLAY -->|"1. metadata lookup"| RMETA
    PLAY -->|"2. license check"| LIC
    LIC --> PG
    PLAY -->|"3. signed segment URLs"| MOB
    MOB -->|"4. HTTP range GET segments"| CDN
    CDN --> L1C
    L1C -->|"miss"| L2C
    L2C -->|"miss"| S3A

    SRCH --> ES
    PLS --> CASS
    LIB --> CASS
    SOC --> CASS

    MOB -->|"batched play events"| KAF
    PLAY --> KAF
    KAF --> FLK
    FLK --> ROY
    FLK --> ANA
    FLK --> MLP
    ROY --> BQ
    ANA --> BQ
    MLP --> ALS
    ALS --> GEN
    CNN --> GEN
    NLP --> GEN
    GEN --> RECS`,
    },
    {
      title: "Audio Streaming Flow",
      kind: "sequence",
      caption: "Sequence of operations when a user presses play: authentication, metadata fetch, CDN chunk delivery, and adaptive bitrate switching.",
      mermaid: `sequenceDiagram
    participant C as Client App
    participant GW as API Gateway
    participant MS as Metadata Service
    participant SS as Streaming Service
    participant CDN as CDN Edge
    participant OBJ as Object Storage

    C->>GW: Play track request with auth token
    GW->>GW: Validate token and rate limit
    GW->>MS: Fetch track metadata
    MS-->>GW: Track info with codec variants
    GW-->>C: Streaming manifest with chunk URLs
    C->>CDN: Request chunk 0 via HTTP range
    CDN->>CDN: Check L1 cache
    alt Cache Hit
        CDN-->>C: Return cached chunk
    else Cache Miss
        CDN->>OBJ: Fetch from origin
        OBJ-->>CDN: Audio chunk data
        CDN->>CDN: Cache chunk async
        CDN-->>C: Return chunk
    end
    C->>C: Decode and buffer chunk
    C->>CDN: Prefetch chunks 1 and 2
    CDN-->>C: Prefetched chunks
    Note over C: Adaptive bitrate check
    C->>SS: Report playback event via Kafka`,
    },
    {
      title: "Recommendation Pipeline Flow",
      kind: "flow",
      caption: "Data flow from user interactions through feature extraction, model training, and personalized playlist generation.",
      mermaid: `flowchart TD
    A["User Play Events"] --> B["Kafka Event Stream"]
    B --> C["Flink Enrichment"]
    C --> D["Feature Store"]

    D --> E["Collaborative Filtering - ALS"]
    D --> F["NLP Playlist Analysis"]
    D --> G["Audio Feature CNN"]

    E --> H["Candidate Generation"]
    F --> H
    G --> H

    H --> I["Ranking Model - Blended Score"]
    I --> J["Diversity Filter"]
    J --> K["Discover Weekly - 30 Tracks"]
    J --> L["Daily Mix Playlists"]
    J --> M["Release Radar"]

    N["User Feedback - Skips and Saves"] --> B`,
    },
    {
      title: "Offline Download State Machine",
      kind: "state",
      caption: "States and transitions for a track being downloaded for offline playback.",
      mermaid: `stateDiagram-v2
    [*] --> Queued
    Queued --> Downloading : Network available
    Downloading --> Paused : Network lost
    Paused --> Downloading : Network restored
    Downloading --> Verifying : All chunks received
    Verifying --> Ready : Checksum valid
    Verifying --> Failed : Checksum mismatch
    Failed --> Queued : Retry
    Ready --> Expired : License expired
    Expired --> Queued : Subscription renewed
    Ready --> Removed : Storage cleanup LRU
    Removed --> Queued : User re-downloads`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the audio streaming pipeline to minimize latency and handle variable network conditions?",
      a: "The audio streaming pipeline uses chunked delivery over HTTP range requests to CDN edge servers. Each track is pre-transcoded into multiple bitrate variants (96/160/320 kbps), and the client receives a streaming manifest listing chunk URLs for each variant. The client maintains a ring buffer that prefetches 2-3 chunks ahead of the current playback position. When the buffer occupancy drops below a threshold, the prefetch callback triggers additional chunk requests. For adaptive bitrate, the client monitors download throughput over a sliding window: if throughput drops below the current bitrate's requirement for 3 consecutive chunks, it switches down to the next lower variant. Switching up requires sustained higher throughput for 5 chunks to avoid oscillation. Gapless playback is achieved by pre-loading the first chunk of the next track in a separate decode buffer while the current track plays its final chunk. This entire pipeline means time-to-first-byte is determined by CDN edge proximity, typically under 50ms for cached content.",
      followUps: [
        "How would you handle a scenario where a popular album drops and millions of users try to stream it simultaneously?",
        "What metrics would you monitor to detect audio quality degradation in production?",
        "How does the client handle mid-stream codec switching without audible artifacts?",
      ],
    },
    {
      q: "Explain how Spotify's recommendation engine generates Discover Weekly playlists.",
      a: "Discover Weekly combines three complementary approaches. Collaborative filtering uses Alternating Least Squares (ALS) matrix factorization to decompose the user-track interaction matrix into latent factor vectors. Users with similar factor vectors have similar taste, and tracks favored by similar users but unheard by the target become candidates. NLP models analyze playlist titles and descriptions: if a track appears in many playlists titled 'workout energy' alongside another track, they share semantic proximity even without co-listening overlap. Audio feature extraction uses convolutional neural networks on mel-spectrograms to compute features like tempo, energy, and valence, enabling discovery of sonically similar tracks from different popularity tiers. The final ranking model blends scores from all three sources with learned per-user weights and applies diversity constraints (no more than 2 tracks from the same artist, genre variety). A batch Spark pipeline runs weekly, processing billions of play events to generate 30 candidates per user, then applies post-filters like recency bias and explicit content settings.",
      followUps: [
        "How would you evaluate the quality of recommendations? What metrics matter?",
        "How do you handle the cold-start problem for new users with no listening history?",
        "What is the trade-off between exploration and exploitation in recommendations?",
      ],
    },
    {
      q: "How would you design the playlist service to handle collaborative playlists with concurrent edits?",
      a: "The playlist service stores playlists in Cassandra with partition key as playlist_id and clustering key as a position ordinal. Each entry contains a track reference, the user who added it, and a timestamp. For collaborative playlists where multiple users can add, remove, or reorder tracks simultaneously, we use operational transformation (OT) to merge edits. Each edit is represented as an operation (insert at position N, delete at position M, move from P to Q) with a version vector. When the server receives an operation, it transforms it against any concurrent operations that have been applied since the client's last known version, then applies the transformed operation. This ensures convergence: all clients eventually see the same playlist state regardless of operation order. For simpler conflict resolution, a last-writer-wins approach with per-entry timestamps can suffice, but OT provides a better user experience for active collaborative playlists. The service uses LOCAL_QUORUM consistency for writes to prevent data loss, and eventual consistency for reads with client-side version checking to detect stale reads.",
      followUps: [
        "How would you handle a playlist with millions of tracks?",
        "What happens if two users simultaneously try to add the same track?",
        "How would you implement undo/redo for playlist edits?",
      ],
    },
    {
      q: "How does Spotify handle offline playback and DRM?",
      a: "Offline playback requires downloading encrypted audio chunks to the device's local storage. Each chunk is encrypted using AES-256-CTR with a content key specific to the track. The content key itself is encrypted with a device-bound key derived from the user's authentication credentials and the device hardware fingerprint, meaning files copied to another device are unplayable. The download manager runs as a background service that prioritizes downloads based on a scoring function: frequently played playlists and recently added tracks score higher. When the device storage quota (configurable, default 10GB) is approached, an LRU eviction policy removes the least recently played offline tracks. Download tasks are persisted in SQLite so they survive app restarts and crashes, supporting partial chunk resume via HTTP range headers. DRM licenses are time-bound (typically 30 days) and require periodic online check-ins to renew. If the user's subscription lapses or the license expires, the decryption key is revoked and cached files become unplayable until the subscription is restored and a new license is obtained.",
      followUps: [
        "How would you prevent screen recording or audio capture of DRM-protected content?",
        "What happens if the user changes devices frequently?",
        "How would you handle offline playback for podcasts differently from music?",
      ],
    },
    {
      q: "How would you design the search system to handle 100M+ tracks with autocomplete?",
      a: "The search system uses Elasticsearch with a custom index schema. Tracks, artists, albums, playlists, and podcast episodes are indexed as separate document types in a unified index. Each document contains fields for exact match (artist name), full-text search (track title with language-specific analyzers), and phonetic matching (for misspelled queries). The index is sharded by a hash of the entity ID across multiple Elasticsearch nodes, with replicas for read scaling. Search ranking combines BM25 text relevance with popularity signals (global play count, user-country play count) and personalization (boosting results the user has previously interacted with). Autocomplete uses an edge-ngram analyzer that indexes prefixes of terms, combined with a completion suggester weighted by query frequency from search logs updated hourly. For sub-50ms response times at scale, the search API caches the top 10K queries in Redis with a 5-minute TTL. The near-real-time indexing pipeline consumes new track events from Kafka and updates the Elasticsearch index within 2-3 minutes of ingestion, so new releases become searchable quickly.",
      followUps: [
        "How would you handle multilingual search with non-Latin scripts?",
        "How would you implement 'search within playlist' functionality?",
        "What would you do if Elasticsearch becomes a bottleneck?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for a Spotify-scale music service.",
      a: "Start with users and catalog: ~600M MAU, ~250M DAU, ~100M tracks. Storage: a track averages ~3 MB per encoded variant; with ~6 ladder variants (Ogg 96/160/320, AAC 128/256, HE-AAC 24) that is 100M x 6 x 3 MB = ~1.8 PB encoded, plus ~3 PB of lossless masters — single-digit petabytes, comfortably cheap in object storage. Egress is the real number: peak concurrency ~5% of MAU = 30M streams; at 160 kbps average that is 4.8 Tbps, which mandates a multi-CDN edge with 90%+ hit rate so origin sees under ~500 Gbps. Events: 250M DAU x ~40 plays = ~10B events/day = ~115K/sec average, ~350K/sec peak, ~60 MB/s into Kafka at 500 bytes/event. Metadata reads are absorbed by Redis (99% hit rate), leaving relational stores at low thousands of QPS. The conclusion to state explicitly: storage is trivial, delivery bandwidth and the event pipeline's correctness requirements are what drive the architecture.",
      followUps: [
        "How does the head-heavy popularity distribution change your cache sizing?",
        "How would podcast video streaming change these numbers?",
        "What changes if the lossless Hi-Fi tier becomes 20% of streams?",
      ],
    },
    {
      q: "Royalty payments depend on play counts. How do you make counting accurate when clients are unreliable?",
      a: "Layer idempotency, transactional processing, and reconciliation. Clients attach a UUID and per-device sequence number to every play event and journal events locally (including offline plays, which sync later with original timestamps). Kafka partitions by userId for ordering; Flink dedupes on (deviceId, sequenceNo) in keyed state, validates the 30-second royalty threshold from the playback clock (not network activity, so prefetched segments never count), and uses checkpointing plus Kafka transactional producers for exactly-once processing within the pipeline. But end-to-end exactly-once with lossy mobile clients is unattainable, so the design adds reconciliation: raw events are archived to object storage, and a nightly Spark batch independently recomputes counts and diffs against the streaming aggregates; the monthly financial close is computed from the batch, while streaming numbers only power dashboards. Divergence beyond a threshold freezes the accounting period and alerts. This lambda split — streaming for freshness, replayable batch for the ledger of record — is the honest answer interviewers look for, rather than 'Kafka has exactly-once'.",
      followUps: [
        "How would you backfill corrected counts after finding a bug in the streaming pipeline?",
        "How do you handle a device that replays a month of offline events at once?",
        "Where does fraud detection (stream farms) fit into this pipeline?",
      ],
    },
    {
      q: "How do you keep the critical playback path fast at p99 while the rest of the system is eventually consistent?",
      a: "Design the play path to touch only caches and the CDN. The manifest request hits the API gateway, a Redis session lookup, Redis-cached track metadata, and a cached license decision keyed by (track, region, tier) — no relational database, no Kafka, nothing synchronous that can add tail latency. Segment URLs are pre-signed with short-lived tokens so the CDN authorizes locally without callbacks. Audio bytes come from the CDN L1 at 20-50ms, and the client hides everything else: ring-buffer prefetch of 2-3 segments, speculative prefetch of the next track's manifest and first segment, and on-device caching of recently played audio so repeat plays are fully local. Everything with weaker latency or consistency needs — play counts, library updates, recommendations, social feeds — is pushed behind Kafka and served from eventually consistent stores. Degradation is graceful by construction: if metadata or recommendation services are down, circuit breakers trip and the client plays cached content with locally stored metadata. State the invariant explicitly: no user-perceivable playback action ever waits on a system of record.",
      followUps: [
        "How do short-lived signed URLs interact with long offline sessions?",
        "What is your p99 budget per hop for a 300ms time-to-first-audio target?",
        "How do you monitor perceived start latency from real devices?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Spotify uses chunked audio delivery primarily because:",
      options: [
        "It reduces the total file size of audio tracks",
        "It enables adaptive bitrate switching and progressive playback",
        "It simplifies the audio encoding process",
        "It eliminates the need for a CDN",
      ],
      answerIndex: 1,
      explanation:
        "Chunked delivery allows the client to start playback before the entire file is downloaded (progressive playback) and to switch between bitrate variants mid-stream based on network conditions (adaptive bitrate). This is essential for smooth playback on variable mobile networks.",
    },
    {
      q: "In collaborative filtering for music recommendations, cosine similarity is preferred over Euclidean distance because:",
      options: [
        "It is computationally cheaper to calculate",
        "It measures the angle between vectors, making it invariant to the magnitude of listening counts",
        "It only works with sparse vectors",
        "It guarantees unique recommendations for every user",
      ],
      answerIndex: 1,
      explanation:
        "Cosine similarity measures the angle between two user vectors, not the magnitude. A user who listens 10x more than another but to the same proportion of tracks will have the same cosine similarity. This makes it robust for comparing users with different overall listening volumes.",
    },
    {
      q: "Consistent hashing with virtual nodes is used for audio storage distribution because:",
      options: [
        "It encrypts audio files automatically",
        "It minimizes data remapping when storage nodes are added or removed",
        "It compresses audio files more efficiently",
        "It provides faster read speeds than direct hashing",
      ],
      answerIndex: 1,
      explanation:
        "When a storage node is added or removed in consistent hashing, only the keys that map to the affected segment of the ring need to be remapped, not all keys. Virtual nodes further improve balance by giving each physical node multiple positions on the ring, ensuring even key distribution.",
    },
    {
      q: "Spotify qualifies a stream for royalty payment only after 30 seconds of playback because:",
      options: [
        "Audio quality is too low before 30 seconds",
        "It prevents artificial inflation of play counts from bots and accidental plays",
        "The codec requires 30 seconds to initialize",
        "CDN billing is calculated in 30-second increments",
      ],
      answerIndex: 1,
      explanation:
        "The 30-second threshold filters out accidental clicks, rapid skipping, and bot-generated plays that would artificially inflate stream counts and distort royalty payments. This industry-standard threshold balances fraud prevention with fair counting of genuine listener engagement.",
    },
  ],
  flashcards: [
    {
      front: "What audio codecs does Spotify use and why?",
      back: "Ogg Vorbis for desktop (open-source, good quality-to-size ratio), AAC for mobile/web (hardware decoder support on iOS/Android reduces battery drain), and HE-AAC for ultra-low bandwidth. Each track is transcoded at multiple bitrates: 96/160/320 kbps. The client selects based on subscription tier, device type, and network conditions.",
    },
    {
      front: "How does Spotify's adaptive bitrate streaming work?",
      back: "Tracks are pre-chunked into 5-10 second segments at multiple bitrates. The client monitors download throughput over a sliding window. If throughput drops below the current bitrate's requirement for 3 consecutive chunks, it switches to a lower variant. Switching up requires sustained higher throughput for 5 chunks to prevent oscillation. The ring buffer prefetches 2-3 chunks ahead.",
    },
    {
      front: "What is ALS (Alternating Least Squares) in the context of Spotify's recommendations?",
      back: "ALS is a matrix factorization technique that decomposes the user-track interaction matrix into two lower-rank matrices: user factors and track factors. It alternates between fixing user factors to solve for track factors and vice versa. The dot product of a user vector and track vector predicts the user's affinity for that track. Used in the collaborative filtering component of Discover Weekly.",
    },
    {
      front: "How does Spotify handle gapless playback between tracks?",
      back: "The client pre-loads and decodes the first chunk of the next track into a separate buffer while the current track plays its final chunk. When the current track's audio samples are exhausted, the decoder seamlessly switches to the pre-decoded next-track buffer. Crossfade (optional) blends the final samples of the current track with the initial samples of the next.",
    },
    {
      front: "What is the two-tier CDN caching strategy for audio?",
      back: "L1 caches at edge PoPs store the hottest 10-15% of tracks (top charts, new releases, viral content). L2 regional caches hold a broader catalog. Cache admission uses request frequency plus popularity scoring. New releases get a popularity boost for pre-warming. Cache misses cascade: edge -> regional -> origin (object storage). Multiple CDN providers (Fastly, Akamai, Google CDN) provide redundancy.",
    },
    {
      front: "How does the 30-second royalty threshold work?",
      back: "A play event must reach 30 seconds of actual playback to qualify as a royalty-generating stream. The Flink streaming pipeline validates this by checking the duration_played field in play events. Streams under 30 seconds (skips, accidental plays) are counted for analytics but excluded from royalty calculations. This prevents artificial inflation by bots and stream farms.",
    },
    {
      front: "How does Spotify implement offline DRM?",
      back: "Audio chunks are encrypted with AES-256-CTR using a per-track content key. The content key is wrapped with a device-bound key derived from the user's auth token and device hardware fingerprint. Licenses are time-bound (30 days) and require periodic online renewal. If the subscription lapses, the license expires and cached files become unplayable. Files cannot be transferred between devices.",
    },
    {
      front: "How does Spotify's podcast ingestion pipeline work?",
      back: "The system polls publisher RSS feeds every 15-30 minutes. New episodes trigger metadata extraction (title, description, duration, chapters), audio transcoding into standard codec variants, and push notifications to subscribers. Episode playback progress (resume position) is tracked per-user in a dedicated state service, separate from music playback state. Free-tier listeners receive dynamically inserted ads via server-side ad stitching.",
    },
    {
      front: "What are the three headline capacity numbers for a Spotify-scale design?",
      back: "(1) Catalog: 100M tracks x ~6 encoded variants x ~3 MB = ~1.8 PB encoded audio plus ~3 PB lossless masters — cheap. (2) Egress: ~30M peak concurrent streams x 160 kbps = ~4.8 Tbps, which forces a multi-CDN edge with 90%+ hit rate. (3) Events: ~10B play events/day = ~115K/s average, ~350K/s peak, ~60 MB/s into Kafka. Delivery and event correctness, not storage, are the hard problems.",
    },
    {
      front: "How are playlists modeled to support versioning and collaborative editing?",
      back: "As an append-only operation log (add/remove/move) in Cassandra partitioned by playlist_id, with periodic materialized snapshots and a monotonic revision number. Entries are anchored by client-generated UUIDs, not integer positions, so moves don't renumber and duplicate submissions are idempotent. Clients sync by revision diff; offline edits are rebased via operational transformation against intervening revisions.",
    },
    {
      front: "Why is play counting 'exactly-once-ish' rather than exactly-once, and how is accuracy achieved?",
      back: "Mobile clients can crash or replay batches, so true end-to-end exactly-once is impossible. Accuracy is layered: client UUID + per-device sequence numbers for idempotency, Flink keyed-state dedupe, playback-clock (not network) 30s validation, Kafka transactions + checkpointing inside the pipeline, and a nightly Spark batch over the raw event archive that reconciles streaming aggregates. The monthly royalty close is computed from the batch.",
    },
  ],
  exercises: [
    "Design an adaptive bitrate controller: Implement a module that monitors network throughput over a sliding window of the last 10 chunk downloads. Define the logic for switching between bitrate tiers (96/160/320 kbps). Include hysteresis to prevent oscillation (require 3 consecutive low-throughput chunks to downgrade, 5 high-throughput chunks to upgrade). Simulate with variable bandwidth traces and measure rebuffering events versus average bitrate delivered.",
    "Build a simplified Discover Weekly pipeline: Given a dataset of 10,000 users and 5,000 tracks with play counts, implement the full recommendation flow: (1) normalize play counts using TF-IDF weighting, (2) compute pairwise cosine similarities for a target user against all others, (3) select the top-50 nearest neighbors, (4) aggregate candidate tracks weighted by similarity score, (5) apply diversity filters (max 2 tracks per artist). Evaluate precision@30 against a held-out test set of actual future listens.",
    "Implement a consistent hashing ring with rebalancing: Build a consistent hash ring with virtual nodes and implement the rebalancing logic for when a storage node is added or removed. Track which keys (track IDs) need to be migrated, compute the migration plan, and simulate the transfer. Measure the percentage of keys that must be remapped versus a naive modulo hash approach. Add weighted virtual nodes where higher-capacity nodes receive more positions on the ring.",
    "Design a download manager for offline mode: Implement a download queue manager that handles prioritization (recently played playlists first), concurrent download limits (max 3 parallel), bandwidth throttling (configurable limit), partial resume on failure (track byte offset per chunk), and LRU eviction when storage quota is reached. Persist the queue state to SQLite so it survives app restarts. Include unit tests for edge cases: network toggling, app kill during download, storage full mid-download.",
    "Build a real-time play event processing pipeline: Using Apache Kafka and a stream processing framework of your choice, build a pipeline that consumes play events, deduplicates retries (using event ID and idempotent processing), validates the 30-second threshold for royalty eligibility, enriches events with track metadata from a lookup table, and produces aggregated per-track play counts updated every 60 seconds. Compare exactly-once semantics approaches: Kafka transactions versus application-level deduplication with Redis.",
  ],
  revisionNotes: [
    "Spotify's core audio pipeline: master file -> transcode to multiple codecs/bitrates (Ogg Vorbis, AAC, HE-AAC) -> chunk into 5-10 second segments -> store in object storage -> cache at CDN edge PoPs -> deliver via HTTP range requests. Client maintains a ring buffer with prefetch for smooth playback.",
    "Adaptive bitrate switching: client monitors throughput over a sliding window. Downgrade after 3 low-throughput chunks, upgrade after 5 high-throughput chunks. Hysteresis prevents oscillation. Gapless playback pre-decodes the first chunk of the next track before the current one ends.",
    "Recommendation engine uses three signal types: (1) collaborative filtering via ALS matrix factorization on user-track interactions, (2) NLP analysis of playlist titles and music blog text for semantic embeddings, (3) CNN-based audio feature extraction on mel-spectrograms. Final ranking blends all three with learned per-user weights.",
    "Playlist storage uses Cassandra with partition key = playlist_id. Collaborative playlists use operational transformation to merge concurrent edits. Writes use LOCAL_QUORUM for consistency; reads are eventually consistent with client-side version checking.",
    "Offline DRM: AES-256-CTR encryption per chunk, content key wrapped with device-bound key. Licenses expire after 30 days. LRU eviction when storage quota is reached. Download tasks persist in SQLite for crash recovery and partial resume.",
    "CDN strategy: hybrid third-party (Fastly, Akamai) and owned edge infrastructure. Two-tier caching: L1 hot tracks at edge, L2 broader catalog at regional level. Pre-warming for major album releases based on pre-save counts. Automatic CDN failover using latency and error rate monitoring.",
    "Event processing: every play event flows through Kafka -> Flink for deduplication, 30-second validation, and enrichment. Feeds real-time play counters (Redis HyperLogLog for unique listeners), royalty calculation (streamshare model), and recommendation feedback loops. Exactly-once via Flink checkpointing with Kafka transactions.",
    "Search uses Elasticsearch with BM25 text relevance + popularity signals + personalization boost. Autocomplete via edge-ngram analyzer and completion suggester. Near-real-time indexing pipeline (Kafka -> ES) ensures new tracks searchable within 2-3 minutes.",
    "CAP trade-offs per service: streaming prioritizes availability (play cached audio during outages), playlists use strong write consistency (LOCAL_QUORUM), recommendations are eventually consistent (batch pipeline lag), authentication requires strong consistency globally.",
    "Scale numbers: ~600M users, ~100M tracks, billions of daily play events. Each track stored in 3+ codec/bitrate variants. CDN serves petabytes of audio daily. Recommendation models retrained weekly on the full interaction matrix.",
    "Capacity math to memorize: 100M tracks x ~6 variants x ~3 MB = ~1.8 PB encoded (+~3 PB masters); 30M peak concurrent x 160 kbps = ~4.8 Tbps egress (hence multi-CDN); 250M DAU x 40 plays = ~10B events/day = ~115K/s avg, ~350K/s peak into Kafka. Storage cheap, delivery and event correctness hard.",
    "Playlist model: append-only op log (add/remove/move with UUID anchors) + materialized snapshots + monotonic revision numbers. Clients sync via revision diffs; offline edits are OT-rebased on reconnect; never store integer positions.",
    "Royalty accuracy: client UUID + per-device sequence numbers -> Flink dedupe -> 30s validation from playback clock -> exactly-once processing via checkpoints + Kafka transactions -> nightly Spark batch reconciliation against raw archived events; monthly close comes from batch, not streaming.",
    "Recommendation split: offline batch (ALS embeddings, CNN audio analysis, NLP embeddings, weekly ANN candidate generation -> materialized 30-track playlists) + online layer (feature store with session signals re-ranking precomputed candidates). Freshness from re-ranking, not retraining.",
  ],
  cheatSheet: [
    "Audio codecs: Ogg Vorbis (desktop) at 96/160/320 kbps, AAC (mobile/web) at 128/256 kbps, HE-AAC at 24 kbps for low bandwidth. Chunk size: 5-10 seconds. Ring buffer prefetch: 2-3 chunks ahead.",
    "Adaptive bitrate: downgrade after 3 low-throughput chunks, upgrade after 5 high-throughput chunks. Sliding window throughput measurement. Crossfade and gapless via pre-decoded next-track buffer.",
    "Collaborative filtering: ALS matrix factorization -> user factor vectors and track factor vectors -> cosine similarity for neighbor finding -> weighted aggregation of neighbor preferences -> diversity post-filter.",
    "Consistent hashing: 150 virtual nodes per physical node. FNV-1a hash. Replication factor 3 (walk ring clockwise, skip duplicate physical nodes). O(log N) lookup via sorted map.",
    "CDN tiers: L1 edge PoP (top 10-15% tracks) -> L2 regional (broader catalog) -> origin (object storage). Pre-warm for major releases. Multi-CDN failover.",
    "Royalty pipeline: play event -> Kafka -> Flink (dedupe + 30s validation + enrichment) -> royalty engine (streamshare: user fee * artist share of user listening time). Exactly-once via checkpointing.",
    "Offline DRM: AES-256-CTR per chunk, device-bound key wrapping, 30-day license expiry, LRU eviction at storage quota, SQLite task persistence for resume.",
    "Search stack: Elasticsearch (BM25 + popularity + personalization), edge-ngram autocomplete, Redis cache for top 10K queries (5-min TTL), near-real-time indexing via Kafka consumer.",
    "Podcast ingestion: RSS polling every 15-30 min -> metadata parse -> transcode -> notify subscribers. Per-episode resume position in user-state service. Server-side ad stitching for free tier.",
    "Failure handling: circuit breakers at service boundaries, bulkhead isolation, CDN failover, cached recommendations as fallback, degraded mode (play cached audio when metadata service is down).",
    "Capacity one-liners: ~1.8 PB encoded catalog (100M x 6 x 3 MB), ~4.8 Tbps peak egress (30M x 160 kbps), ~10B play events/day (~115K/s avg, ~350K/s peak, ~60 MB/s into Kafka).",
    "Play-path invariant: manifest = gateway + Redis session + Redis metadata + cached license check; audio = signed URLs + CDN range GETs. No SQL, no Kafka, nothing synchronous on the critical path; events fire-and-forget.",
    "Playlist storage: op log + snapshots + revision numbers; UUID anchors not integer positions; sync via revision diffs; OT rebase for offline/concurrent edits.",
    "Royalty ledger of record = replayable raw event archive + nightly batch recompute; streaming aggregates are dashboards only. Dedupe key: (deviceId, sequenceNo).",
  ],
  glossary: [
    {
      term: "Ogg Vorbis",
      definition:
        "An open-source lossy audio codec used by Spotify for desktop streaming. Provides good quality-to-size ratio without patent licensing fees. Supports variable bitrate encoding.",
    },
    {
      term: "Adaptive Bitrate Streaming (ABR)",
      definition:
        "A technique where the client dynamically selects from pre-encoded audio variants at different bitrates based on current network conditions. Prevents rebuffering by downgrading quality when bandwidth is limited.",
    },
    {
      term: "ALS (Alternating Least Squares)",
      definition:
        "A matrix factorization algorithm that decomposes a user-item interaction matrix into lower-rank user and item factor matrices by alternating between fixing one and solving for the other. Core algorithm behind collaborative filtering at Spotify.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A distributed hashing scheme where adding or removing a node only remaps a fraction of keys (K/N on average). Virtual nodes improve balance. Used to distribute audio files across storage nodes.",
    },
    {
      term: "Mel-Spectrogram",
      definition:
        "A visual representation of an audio signal's frequency content over time, scaled to the mel frequency scale (which approximates human pitch perception). Used as input to CNNs for audio feature extraction in Spotify's recommendation engine.",
    },
    {
      term: "Streamshare Model",
      definition:
        "Spotify's royalty distribution method where each subscriber's monthly fee is divided among rights holders in proportion to their share of that subscriber's total listening time. Replaced the older pro-rata model.",
    },
    {
      term: "Ring Buffer",
      definition:
        "A fixed-size circular buffer where the write pointer wraps around to the beginning after reaching the end. Used in audio streaming to maintain a bounded prefetch window of upcoming audio chunks for smooth playback.",
    },
    {
      term: "Encoding Ladder",
      definition:
        "The fixed set of codec/bitrate variants every track is transcoded into (e.g. Ogg Vorbis 96/160/320 kbps, AAC 128/256 kbps, HE-AAC 24 kbps). Clients select a rung per device, subscription tier, and measured throughput; keeping the lossless master allows re-encoding when the ladder changes.",
    },
    {
      term: "Operational Transformation (OT)",
      definition:
        "A concurrency-control technique that rewrites (transforms) an editing operation against concurrent operations applied since the editor's base version, so all replicas converge to the same state. Used to merge concurrent and offline edits on collaborative playlists.",
    },
    {
      term: "Gapless Playback",
      definition:
        "Playing consecutive tracks with no audible silence by pre-decoding the next track's first segment into a second PCM buffer and switching buffers at the exact final sample. Requires codec gapless metadata (encoder delay and true sample length) to trim lossy-codec padding.",
    },
    {
      term: "Annoy (Approximate Nearest Neighbors)",
      definition:
        "An ANN index library (built at Spotify) that finds nearest neighbors in high-dimensional embedding spaces using random projection trees. Used for fast candidate generation over track/user embedding vectors in the recommendation pipeline.",
    },
    {
      term: "Signed Segment URL",
      definition:
        "A CDN URL carrying a short-lived cryptographic token that lets the edge authorize a request locally without calling back to origin services. Keeps license enforcement off the latency-critical audio path.",
    },
  ],
  animations: [
    {
      title: "Playing a track",
      steps: [
        {
          label: "Client requests playback",
          detail: "Auth checked, licensing region resolved.",
        },
        {
          label: "Manifest returned",
          detail: "Encoded variants at several bitrates, with URLs pointing at the CDN.",
        },
        {
          label: "Prefetch",
          detail: "The client fetches the first seconds immediately and buffers ahead — perceived instant start.",
        },
        {
          label: "Next track predicted",
          detail: "Prefetched during the current one, so transitions have no gap.",
        },
        {
          label: "Offline",
          detail: "Encrypted download with a licence that expires, requiring periodic revalidation.",
        },
        {
          label: "Playback events",
          detail: "Batched and sent asynchronously for royalties and recommendations — never blocking playback.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "HTTP Progressive Download",
      "HLS/DASH Streaming",
      "Spotify Custom Protocol",
      "WebRTC (Real-time)",
    ],
    rows: [
      [
        "Delivery Model",
        "Single file download, play while downloading",
        "Manifest-based, segmented delivery with variant playlists",
        "Chunked HTTP range requests with custom manifest and ring buffer",
        "Peer-to-peer with STUN/TURN, sub-second latency",
      ],
      [
        "Adaptive Bitrate",
        "Not supported, single bitrate per file",
        "Native support via variant streams in manifest",
        "Client-side switching based on throughput monitoring with hysteresis",
        "Codec-level adaptation (VP8/Opus dynamic bitrate)",
      ],
      [
        "Latency to First Byte",
        "Low, but no seeking until buffered",
        "Moderate, segment duration adds latency (2-10s segments)",
        "Very low, small chunks (5-10s) with CDN edge caching",
        "Ultra-low (sub-100ms), designed for real-time",
      ],
      [
        "Offline Support",
        "Download entire file, simple DRM",
        "Segment download with license-based DRM",
        "Encrypted chunk download with device-bound keys and license expiry",
        "Not applicable, requires live connection",
      ],
      [
        "CDN Compatibility",
        "Standard HTTP CDN, no special requirements",
        "Requires CDN support for manifest and segment delivery",
        "Standard HTTP CDN with custom cache warming and multi-CDN failover",
        "Requires TURN relay servers for NAT traversal",
      ],
      [
        "Best For",
        "Simple audio/podcast, no quality adaptation needed",
        "Video streaming (Netflix, YouTube), live events",
        "Music streaming with gapless playback and offline",
        "Live audio calls, real-time collaboration",
      ],
    ],
  },
  followUps: [
    "Design a music royalty calculation system that processes billions of play events monthly with exactly-once guarantees and produces auditable per-rights-holder payment reports.",
    "Design a real-time lyrics synchronization system that displays time-aligned lyrics as a track plays, supporting user-contributed corrections and multi-language translations.",
    "Design a social listening feature (Group Session / Jam) where multiple users control a shared playback queue in real-time across different devices and network conditions.",
    "Design a podcast transcription and search system that automatically transcribes episodes using speech-to-text, indexes the transcripts, and supports in-episode search with timestamp navigation.",
    "Design a fraud detection system for identifying artificial streaming (bot farms, stream manipulation) using behavioral analysis, device fingerprinting, and anomaly detection.",
    "Design an audio ads insertion platform for free-tier users that dynamically stitches targeted ads into audio streams based on user demographics, listening context, and advertiser budgets.",
    "Design Spotify Wrapped: a yearly batch job that aggregates a full year of per-user listening into personalized, shareable stories for 600M users within a launch window of hours.",
    "Design a Hi-Fi lossless streaming tier: how do FLAC bitrates (~1000+ kbps) change the CDN strategy, prefetch budgets, and mobile data handling?",
    "Design cross-device playback handoff (Spotify Connect): discovering active devices, transferring the playback session and buffer state, and keeping a single source of truth for the queue.",
  ],
  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Covers distributed systems fundamentals essential for Spotify's architecture: consistent hashing, stream processing, replication, and partitioning.",
    },
    {
      label: "Spotify Engineering Blog",
      kind: "article",
      note: "First-party engineering posts covering recommendation algorithms, infrastructure decisions, and scaling challenges at Spotify.",
    },
    {
      label: "System Design Interview by Alex Xu (Vol. 1 and 2)", url: "https://bytebytego.com/",
      kind: "book",
      note: "Structured approach to system design interviews with relevant chapters on streaming, notification systems, and search architecture.",
    },
    {
      label: "Mining of Massive Datasets (Leskovec, Rajaraman, Ullman)",
      kind: "book",
      note: "Covers recommendation systems, collaborative filtering, and matrix factorization algorithms used in Spotify's Discover Weekly pipeline.",
    },
    {
      label: "Apache Kafka Documentation", url: "https://kafka.apache.org/documentation/",
      kind: "docs",
      note: "Reference for event streaming architecture, exactly-once semantics, and stream processing patterns used in Spotify's play event pipeline.",
    },
  ],
};
