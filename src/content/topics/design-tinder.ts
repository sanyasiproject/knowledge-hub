import type { TopicContent } from "../types";

export const designTinder: TopicContent = {
  quickSummary: [
    "Tinder is a location-based dating app serving ~75M MAU across 190+ countries, processing ~2B swipes/day and generating ~1.5M dates/week. The core loop is simple: show a stack of nearby profiles, swipe right (like) or left (pass), and notify both users on a mutual match. Beneath this simplicity lies a sophisticated system handling geolocation indexing, real-time matching, recommendation scoring, and abuse prevention.",
    "The profile recommendation engine is the heart of the system. It must balance multiple signals -- geographic proximity, user preferences (age, gender, distance radius), attractiveness scoring (Elo/Gale-Shapley inspired), activity recency, and profile completeness -- to produce a ranked stack of candidates. A naive approach of scanning all users within a radius is O(n) per request and does not scale; geospatial indexing (geohash, S2 cells, or R-trees) is essential to reduce the candidate set before scoring.",
    "The matching subsystem must handle extreme write throughput: 2B swipes/day is ~23K swipes/second on average, with 3-5x peaks during evening hours. Each swipe is a write operation that must also check for a reciprocal like (mutual match detection). This is modeled as a directed graph edge insertion plus a reverse-edge lookup, optimized with bloom filters or Redis sets for O(1) match detection.",
    "Real-time chat activates only after a mutual match, which is a natural access-control boundary. The chat system uses WebSocket connections for message delivery, with a message broker (Kafka) for durability and fan-out. Media messages (photos in chat) are uploaded to object storage (S3) and served via CDN. Push notifications via APNs/FCM handle offline delivery.",
    "Anti-fraud and safety are existential concerns for dating platforms. The system must detect fake profiles (photo verification via face-matching ML), catfishing (reverse image search), spam bots (behavioral analysis of swipe patterns and message velocity), and harassment (NLP-based content moderation on chat messages). A trust-and-safety pipeline runs asynchronously on every profile and message.",
  ],
  detailed: [
    "## Functional and Non-Functional Requirements\n\nThe core functional requirements are: user registration with phone/social login, profile creation with photos and bio, location-based discovery of nearby users filtered by preferences (age, gender, distance), swiping (like/pass/super-like) on recommended profiles, mutual match detection and notification, and real-time 1:1 chat between matched users. Secondary features include Boost (temporarily increase visibility), Rewind (undo last swipe), Passport (change location), and Top Picks (curated daily recommendations). Non-functional requirements are demanding: the system must support 75M MAU with ~10M concurrent users during peak hours, process 23K+ swipes/second, deliver match notifications within 1 second, support chat message delivery under 200ms for online users, maintain 99.95% availability, and handle geographic distribution across 190+ countries. Data privacy is paramount -- location data, sexual orientation, and messaging content are highly sensitive PII requiring encryption at rest and in transit, with GDPR right-to-deletion support across all data stores.",
    "## Capacity Estimation and Data Model\n\nWith 75M MAU and ~10M DAU, assume each user performs ~100 swipes/session, 1-2 sessions/day, yielding ~2B swipes/day. Each swipe event is ~100 bytes (swiper_id, swiped_id, direction, timestamp), so swipe storage is ~200GB/day or ~73TB/year. User profiles average ~5KB each (bio, preferences, metadata) plus ~5 photos at ~200KB each compressed, totaling ~1MB per user and ~75TB for all profile media. The data model centers on three entities: User (id, name, bio, gender, preferences, location, last_active, elo_score), Swipe (swiper_id, swiped_id, direction, timestamp), and Match (user1_id, user2_id, matched_at, chat_room_id). Location is stored as a latitude/longitude pair plus a precomputed geohash for indexing. The swipe table is append-only and can be partitioned by swiper_id for write distribution. Matches are a much smaller dataset (~50M total) and can be stored in a relational database. Chat messages (sender_id, room_id, content, timestamp, status) are partitioned by room_id and stored in a time-series-optimized store like Cassandra.",
    "## High-Level Architecture\n\nThe system decomposes into six major services: (1) Profile Service manages user data, photos, and preferences in a PostgreSQL primary with read replicas, with photos stored in S3 and served via CloudFront CDN; (2) Location Service ingests location updates (every ~5 minutes when app is foregrounded) and maintains a geospatial index using Redis with geospatial commands (GEOADD/GEORADIUS) or a dedicated geospatial database; (3) Recommendation Service produces ranked candidate stacks by querying the geospatial index for nearby users, filtering by preferences, removing already-swiped users, and scoring/ranking the remainder; (4) Swipe Service records swipe events to a Kafka topic and performs match detection by checking for a reciprocal like in a Redis set; (5) Match and Chat Service manages the match lifecycle and real-time messaging via WebSocket gateway with Kafka-backed message persistence; (6) Trust and Safety Service runs ML pipelines for photo verification, spam detection, and content moderation. An API Gateway fronts all services, handling authentication (JWT), rate limiting, and request routing. Service-to-service communication uses gRPC for synchronous calls and Kafka for async event flows.",
    "## Matching Algorithm and Recommendation Engine\n\nThe recommendation pipeline executes in three phases: candidate generation, filtering, and scoring/ranking. In candidate generation, the Location Service returns all user IDs within the requesting user's distance preference (e.g., 50km radius) using a geospatial query -- this might return 50K-500K candidates in a dense city. The filtering phase eliminates users already swiped on (maintained in a bloom filter per user, ~1MB for 100K swipes at 0.1% false positive rate), users whose preferences do not match the requester (e.g., age/gender mismatch), inactive users (no activity in 7+ days), and blocked users. This typically reduces candidates to 1K-10K. The scoring phase computes a composite score for each candidate based on: geographic distance (closer is better, exponential decay), Elo-like attractiveness score (users who receive more right-swipes have higher scores, matched users tend to have similar Elos), profile completeness (more photos and longer bio boost score), activity recency (recently active users score higher to increase match probability), and mutual preference alignment. The top ~200 candidates are returned as the user's card stack, with the highest-scored profiles shown first. The Elo system updates asynchronously: a right-swipe on a high-Elo user boosts the swiper's Elo less than a right-swipe from a high-Elo user, similar to chess rating dynamics.",
    "## Real-Time Chat and Push Notifications\n\nChat is activated only upon mutual match, which serves as both a product feature and an architectural simplification -- it limits the number of active chat rooms and provides a natural authorization boundary. The chat architecture uses a WebSocket gateway that maintains persistent connections with mobile clients. When User A sends a message, it hits the gateway, which publishes the message to a Kafka topic partitioned by chat_room_id. A consumer writes the message to Cassandra (partitioned by room_id, clustered by timestamp) and forwards it to the WebSocket connection of User B if online. If User B is offline, a push notification is sent via APNs (iOS) or FCM (Android) with a truncated message preview. Message delivery semantics are at-least-once with client-side deduplication using message IDs. Read receipts and typing indicators are transmitted as ephemeral WebSocket events without persistence. Media messages (photos) are uploaded directly to S3 via a presigned URL, and only the S3 key is sent as a chat message; the recipient's client fetches the image via CDN. Rate limiting on messages (e.g., 50 messages/minute per user) and content filtering (profanity, harassment, solicitation detection via NLP) are enforced at the gateway layer before persistence.",
  ],
  deepDive: [
    "Geospatial indexing is the foundational infrastructure challenge for a location-based dating app. The naive approach -- computing Haversine distance from the requesting user to every other user -- is O(n) and computationally infeasible at scale. Geohashing solves this by encoding latitude/longitude into a string prefix that shares common prefixes for nearby points. A geohash of precision 6 (~1.2km x 0.6km cell) allows the system to query all users in adjacent cells using simple string prefix matching, reducing the search space by orders of magnitude. However, geohash has well-known edge-case problems: two points on opposite sides of a cell boundary may be very close but share no common prefix. The solution is to always query the target cell plus all 8 neighboring cells (a 9-cell query). Google's S2 geometry library offers a superior alternative: it uses a Hilbert curve to map the sphere to 64-bit cell IDs, providing better coverage uniformity and the ability to generate a minimal set of cells that cover an arbitrary radius with tunable precision. In practice, Redis GEOADD/GEORADIUS commands (which use a sorted set with geohash-based scoring) handle moderate scale (~10M users) well, but beyond that, a dedicated geospatial index like PostGIS with spatial partitioning or a custom S2-based index in a distributed store becomes necessary.",
    "The recommendation scoring system must balance multiple competing objectives: showing users profiles they will find attractive (maximizing right-swipe rate), showing profiles of users who will find them attractive (maximizing mutual match rate), ensuring fair exposure for all users (preventing a small set of highly-attractive users from monopolizing all attention), and maintaining engagement over time (not exhausting the candidate pool too quickly). The Elo rating system, borrowed from chess, addresses the first two objectives: each user has a score that increases when they receive right-swipes and decreases on left-swipes, weighted by the swiper's own Elo. High-Elo users are preferentially shown to other high-Elo users, creating a natural tiering effect. However, pure Elo optimization leads to a 'rich get richer' dynamic that harms engagement for average users. Tinder's actual algorithm likely incorporates a desirability distribution constraint: a user's card stack is composed of a mix of Elo tiers -- mostly similar-Elo users, with occasional higher-Elo aspirational profiles to maintain excitement. Additionally, a freshness boost for new users (the 'newbie boost') ensures new profiles get initial exposure to calibrate their Elo quickly. The scoring formula also penalizes showing the same user repeatedly across sessions and incorporates a diversity constraint to avoid showing 10 consecutive profiles of the same type.",
    "Anti-fraud and trust-and-safety systems are critical infrastructure for dating platforms where users are uniquely vulnerable. The threat model includes: fake profiles created for catfishing or romance scams, bot accounts that send spam or phishing links, underage users bypassing age verification, harassment and abusive messaging, and coordinated manipulation (e.g., Elo boosting rings). Photo verification uses a liveness-detection ML model: the user is prompted to mimic a randomly-selected pose, and a face-matching model compares the selfie to their profile photos, confirming both identity and liveness. Profile photos are also scanned against known databases of stolen images and run through NSFW detection models. Behavioral signals are equally important: a user who swipes right on every profile within seconds is likely a bot (legitimate users exhibit varied swipe timing and ~30-50% right-swipe rates). Message content is scanned in real-time using NLP classifiers trained on reported conversations, flagging solicitation, threats, requests for money, and links to external sites. A composite trust score is maintained per user, combining verification status, report history, behavioral signals, and account age. Users below a threshold are shadow-banned (their profile is shown to fewer users) rather than explicitly banned, which delays adversarial adaptation.",
    "Scaling the swipe ingestion pipeline to handle 2B events/day with sub-second match detection requires careful architectural choices. Each swipe is published to a Kafka topic partitioned by a hash of the swiper's user ID, ensuring all swipes from a given user land on the same partition for ordering guarantees. A stream processor (Kafka Streams or Flink) consumes the swipe events and performs match detection: for a right-swipe from User A on User B, it checks a Redis set keyed by User B for the presence of User A's ID. If found, a match event is emitted to a separate Kafka topic, triggering notifications to both users and creating a chat room. The Redis set approach provides O(1) lookup but requires ~8 bytes per entry; with 10M DAU averaging 1K right-swipes received each, this is ~80GB of Redis -- feasible with a Redis cluster. Bloom filters offer a space-efficient alternative (~1MB per user for 100K entries at 0.1% FPR) but introduce false positives that require a secondary check against the persistent swipe store. The swipe data is durably stored in a Cassandra cluster partitioned by swiper_id with a TTL of 90 days (swipes older than 90 days are unlikely to result in matches and can be archived to cold storage). During peak hours (typically 8-10 PM local time across multiple time zones), the system must handle 3-5x average throughput, requiring auto-scaling of Kafka consumers and Redis read replicas.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Geohash Encoding and Neighbor Computation for Proximity Search",
      source: `#include <string>
#include <vector>
#include <cmath>
#include <array>
#include <unordered_set>

// Geohash encoding for efficient proximity queries.
// Encodes (lat, lon) into a base-32 string where shared prefixes
// indicate spatial proximity. Used to partition users into grid cells
// for candidate generation in the recommendation pipeline.

class Geohash {
    static constexpr char BASE32[] = "0123456789bcdefghjkmnpqrstuvwxyz";

    // Decode a base-32 character to its 5-bit value
    static int charToVal(char c) {
        for (int i = 0; i < 32; ++i)
            if (BASE32[i] == c) return i;
        return -1;
    }

public:
    // Encode latitude/longitude to a geohash string of given precision.
    // Precision 6 ~ 1.2km x 0.6km cells, good for dating app proximity.
    // Precision 5 ~ 5km x 5km, useful for coarser initial filtering.
    static std::string encode(double lat, double lon, int precision = 6) {
        double latRange[2] = {-90.0, 90.0};
        double lonRange[2] = {-180.0, 180.0};
        std::string hash;
        bool isLon = true;
        int bit = 0, hashVal = 0;

        while (static_cast<int>(hash.size()) < precision) {
            double mid;
            if (isLon) {
                mid = (lonRange[0] + lonRange[1]) / 2.0;
                if (lon >= mid) { hashVal |= (1 << (4 - bit)); lonRange[0] = mid; }
                else { lonRange[1] = mid; }
            } else {
                mid = (latRange[0] + latRange[1]) / 2.0;
                if (lat >= mid) { hashVal |= (1 << (4 - bit)); latRange[0] = mid; }
                else { latRange[1] = mid; }
            }
            isLon = !isLon;
            if (++bit == 5) {
                hash += BASE32[hashVal];
                bit = 0;
                hashVal = 0;
            }
        }
        return hash;
    }

    // Decode a geohash back to its center (lat, lon).
    static std::pair<double, double> decode(const std::string& hash) {
        double latRange[2] = {-90.0, 90.0};
        double lonRange[2] = {-180.0, 180.0};
        bool isLon = true;

        for (char c : hash) {
            int val = charToVal(c);
            for (int bit = 4; bit >= 0; --bit) {
                double mid;
                if (isLon) {
                    mid = (lonRange[0] + lonRange[1]) / 2.0;
                    if (val & (1 << bit)) lonRange[0] = mid;
                    else lonRange[1] = mid;
                } else {
                    mid = (latRange[0] + latRange[1]) / 2.0;
                    if (val & (1 << bit)) latRange[0] = mid;
                    else latRange[1] = mid;
                }
                isLon = !isLon;
            }
        }
        return {(latRange[0] + latRange[1]) / 2.0,
                (lonRange[0] + lonRange[1]) / 2.0};
    }

    // Get all 8 neighbors + self (9-cell query) to handle edge cases
    // where nearby users fall in adjacent geohash cells.
    static std::vector<std::string> getNeighbors(const std::string& hash) {
        auto [lat, lon] = decode(hash);
        int precision = static_cast<int>(hash.size());

        // Cell dimensions at precision 6: ~1.2km x 0.6km
        // Step by roughly one cell width in each direction
        double latStep = 180.0 / std::pow(2, (precision * 5) / 2);
        double lonStep = 360.0 / std::pow(2, (precision * 5 + 1) / 2);

        std::unordered_set<std::string> neighbors;
        for (int dlat = -1; dlat <= 1; ++dlat) {
            for (int dlon = -1; dlon <= 1; ++dlon) {
                double nlat = lat + dlat * latStep;
                double nlon = lon + dlon * lonStep;
                // Clamp latitude, wrap longitude
                nlat = std::max(-89.9, std::min(89.9, nlat));
                if (nlon > 180.0) nlon -= 360.0;
                if (nlon < -180.0) nlon += 360.0;
                neighbors.insert(encode(nlat, nlon, precision));
            }
        }
        return {neighbors.begin(), neighbors.end()};
    }

    // Approximate Haversine distance in km for final ranking
    static double distanceKm(double lat1, double lon1,
                              double lat2, double lon2) {
        constexpr double R = 6371.0; // Earth radius in km
        double dLat = (lat2 - lat1) * M_PI / 180.0;
        double dLon = (lon2 - lon1) * M_PI / 180.0;
        double a = std::sin(dLat / 2) * std::sin(dLat / 2) +
                   std::cos(lat1 * M_PI / 180.0) *
                   std::cos(lat2 * M_PI / 180.0) *
                   std::sin(dLon / 2) * std::sin(dLon / 2);
        return R * 2.0 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
    }
};`,
    },
    {
      language: "cpp",
      caption: "Swipe Processing with Match Detection Using Bloom Filters",
      source: `#include <vector>
#include <string>
#include <functional>
#include <cstdint>
#include <cmath>
#include <unordered_map>
#include <unordered_set>
#include <mutex>
#include <optional>

// Bloom filter for space-efficient "already swiped" checks.
// At 0.1% FPR with 100K entries, requires ~144KB per user vs
// ~800KB for a full hash set -- critical at 10M DAU scale.

class BloomFilter {
    std::vector<bool> bits;
    int numHashes;
    size_t size;

    size_t hash(const std::string& key, int seed) const {
        size_t h = std::hash<std::string>{}(key) ^ (seed * 0x9e3779b97f4a7c15ULL);
        h ^= h >> 33;
        h *= 0xff51afd7ed558ccdULL;
        h ^= h >> 33;
        return h % size;
    }

public:
    BloomFilter(int expectedItems = 100000, double fpr = 0.001)
        : size(static_cast<size_t>(-1.0 * expectedItems * std::log(fpr)
               / (std::log(2) * std::log(2)))),
          numHashes(static_cast<int>(
              static_cast<double>(size) / expectedItems * std::log(2))),
          bits(size, false) {}

    void add(const std::string& key) {
        for (int i = 0; i < numHashes; ++i)
            bits[hash(key, i)] = true;
    }

    bool mightContain(const std::string& key) const {
        for (int i = 0; i < numHashes; ++i)
            if (!bits[hash(key, i)]) return false;
        return true;
    }
};

// Swipe direction
enum class SwipeDir { LEFT, RIGHT, SUPER_LIKE };

struct SwipeEvent {
    std::string swiperId;
    std::string swipedId;
    SwipeDir direction;
    int64_t timestamp;
};

struct Match {
    std::string user1;
    std::string user2;
    int64_t matchedAt;
    std::string chatRoomId;
};

// Match detection engine.
// Maintains per-user sets of who liked them (inbound likes).
// On a right-swipe from A->B, checks if B previously liked A.
// Uses bloom filters for "already swiped" deduplication.

class MatchEngine {
    // userId -> set of userIds who have right-swiped on them
    std::unordered_map<std::string, std::unordered_set<std::string>> inboundLikes;
    // userId -> bloom filter of already-swiped userIds
    std::unordered_map<std::string, BloomFilter> swipedFilters;
    std::mutex mu;

    std::string generateChatRoomId(const std::string& u1,
                                     const std::string& u2) {
        // Deterministic room ID from sorted user pair
        return (u1 < u2) ? u1 + ":" + u2 : u2 + ":" + u1;
    }

public:
    // Process a swipe event. Returns a Match if mutual like detected.
    std::optional<Match> processSwipe(const SwipeEvent& event) {
        std::lock_guard<std::mutex> lock(mu);

        // Initialize bloom filter for new users
        if (swipedFilters.find(event.swiperId) == swipedFilters.end()) {
            swipedFilters.emplace(event.swiperId, BloomFilter());
        }

        // Check for duplicate swipe (idempotency)
        auto& filter = swipedFilters[event.swiperId];
        if (filter.mightContain(event.swipedId)) {
            return std::nullopt; // Already swiped, skip
        }
        filter.add(event.swipedId);

        // Left swipe -- no match possible
        if (event.direction == SwipeDir::LEFT) {
            return std::nullopt;
        }

        // Right swipe or super-like: record inbound like for swipedUser
        inboundLikes[event.swipedId].insert(event.swiperId);

        // Check if swipedUser previously liked swiper (mutual match)
        auto it = inboundLikes.find(event.swiperId);
        if (it != inboundLikes.end() &&
            it->second.count(event.swipedId) > 0) {

            // Mutual match detected!
            Match match;
            match.user1 = event.swiperId;
            match.user2 = event.swipedId;
            match.matchedAt = event.timestamp;
            match.chatRoomId = generateChatRoomId(
                event.swiperId, event.swipedId);

            // Clean up: remove from inbound sets
            it->second.erase(event.swipedId);
            inboundLikes[event.swipedId].erase(event.swiperId);

            return match;
        }

        return std::nullopt;
    }

    // Check if a user has already been swiped on
    bool alreadySwiped(const std::string& userId,
                        const std::string& targetId) {
        std::lock_guard<std::mutex> lock(mu);
        auto it = swipedFilters.find(userId);
        if (it == swipedFilters.end()) return false;
        return it->second.mightContain(targetId);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Recommendation Scorer with Elo Rating and Multi-Signal Ranking",
      source: `#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include <ctime>
#include <unordered_map>

struct UserProfile {
    std::string id;
    double latitude;
    double longitude;
    int age;
    int gender;          // 0=M, 1=F, 2=NB
    double eloScore;     // Attractiveness rating, initial 1500
    int photoCount;
    int bioLength;
    int64_t lastActive;  // Unix timestamp
    bool isVerified;
};

struct Preferences {
    int minAge, maxAge;
    int genderPref;      // -1 = any
    double maxDistanceKm;
};

struct ScoredCandidate {
    std::string userId;
    double score;
    double distanceKm;
    bool operator>(const ScoredCandidate& o) const {
        return score > o.score;
    }
};

// Elo rating system adapted for dating.
// Unlike chess where outcomes are binary (win/lose), here:
//   - Right-swipe = "win" for the swiped user
//   - Left-swipe = "loss" for the swiped user
// K-factor varies by confidence (number of ratings received).

class EloRatingSystem {
    std::unordered_map<std::string, double> ratings;  // userId -> Elo
    std::unordered_map<std::string, int> ratingCounts;

    double expectedScore(double ratingA, double ratingB) {
        return 1.0 / (1.0 + std::pow(10.0, (ratingB - ratingA) / 400.0));
    }

    double kFactor(const std::string& userId) {
        int count = ratingCounts[userId];
        if (count < 50) return 40.0;   // New user: volatile
        if (count < 200) return 24.0;  // Settling
        return 16.0;                    // Established
    }

public:
    double getRating(const std::string& userId) {
        auto it = ratings.find(userId);
        return (it != ratings.end()) ? it->second : 1500.0;
    }

    // Update ratings after a swipe event.
    // swipedRight: true if the swiper liked the target.
    void recordSwipe(const std::string& swiperId,
                     const std::string& targetId,
                     bool swipedRight) {
        double swiperElo = getRating(swiperId);
        double targetElo = getRating(targetId);

        // The target's Elo changes based on the swipe
        double expected = expectedScore(targetElo, swiperElo);
        double actual = swipedRight ? 1.0 : 0.0;
        double k = kFactor(targetId);

        ratings[targetId] = targetElo + k * (actual - expected);
        ratingCounts[targetId]++;

        // The swiper's Elo slightly adjusts based on who they swipe on
        // Right-swiping high-Elo users does not boost you,
        // but RECEIVING right-swipes from high-Elo users does.
    }
};

// Multi-signal recommendation scorer.
// Produces a composite score for each candidate user to determine
// their position in the card stack shown to the requesting user.

class RecommendationScorer {
    EloRatingSystem& eloSystem;

    // Weights for each scoring signal (tuned via A/B testing)
    static constexpr double W_DISTANCE   = 0.25;
    static constexpr double W_ELO_MATCH  = 0.30;
    static constexpr double W_ACTIVITY   = 0.15;
    static constexpr double W_PROFILE    = 0.10;
    static constexpr double W_VERIFIED   = 0.10;
    static constexpr double W_FRESHNESS  = 0.10;

    // Distance score: exponential decay, 0km=1.0, maxDist=0.0
    double distanceScore(double distKm, double maxDist) {
        if (distKm >= maxDist) return 0.0;
        return std::exp(-3.0 * distKm / maxDist);
    }

    // Elo compatibility: highest when Elos are similar,
    // slight asymmetry to occasionally show aspirational profiles
    double eloMatchScore(double userElo, double candidateElo) {
        double diff = candidateElo - userElo;
        // Gaussian centered slightly above user's Elo (+50)
        // to create aspirational pull without frustration
        return std::exp(-std::pow(diff - 50.0, 2) / (2 * 200.0 * 200.0));
    }

    // Activity recency: users active in last hour score highest
    double activityScore(int64_t lastActive) {
        int64_t now = std::time(nullptr);
        double hoursAgo = static_cast<double>(now - lastActive) / 3600.0;
        if (hoursAgo < 1.0) return 1.0;
        if (hoursAgo > 168.0) return 0.05;  // 7+ days: near-zero
        return 1.0 / (1.0 + std::log(hoursAgo));
    }

    // Profile completeness: more photos and longer bio = higher score
    double profileScore(int photoCount, int bioLength) {
        double photoFactor = std::min(1.0, photoCount / 5.0);
        double bioFactor = std::min(1.0, bioLength / 300.0);
        return 0.6 * photoFactor + 0.4 * bioFactor;
    }

public:
    RecommendationScorer(EloRatingSystem& elo) : eloSystem(elo) {}

    // Score a single candidate for a given user
    ScoredCandidate scoreCandidate(const UserProfile& user,
                                     const UserProfile& candidate,
                                     double distKm) {
        double score =
            W_DISTANCE  * distanceScore(distKm, 50.0) +
            W_ELO_MATCH * eloMatchScore(user.eloScore, candidate.eloScore) +
            W_ACTIVITY  * activityScore(candidate.lastActive) +
            W_PROFILE   * profileScore(candidate.photoCount,
                                        candidate.bioLength) +
            W_VERIFIED  * (candidate.isVerified ? 1.0 : 0.0) +
            W_FRESHNESS * 0.5; // Placeholder for session freshness

        return {candidate.id, score, distKm};
    }

    // Score and rank all candidates, return top-K for the card stack
    std::vector<ScoredCandidate> rankCandidates(
        const UserProfile& user,
        const std::vector<UserProfile>& candidates,
        const std::vector<double>& distances,
        int topK = 200)
    {
        std::vector<ScoredCandidate> scored;
        scored.reserve(candidates.size());

        for (size_t i = 0; i < candidates.size(); ++i) {
            scored.push_back(
                scoreCandidate(user, candidates[i], distances[i]));
        }

        // Partial sort for top-K efficiency
        if (static_cast<int>(scored.size()) > topK) {
            std::partial_sort(scored.begin(),
                              scored.begin() + topK,
                              scored.end(),
                              std::greater<>());
            scored.resize(topK);
        } else {
            std::sort(scored.begin(), scored.end(), std::greater<>());
        }

        return scored;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "High-Level System Architecture",
      kind: "architecture",
      caption:
        "Major services and data flow in the Tinder-like dating app system",
      mermaid: `graph TD
    Client["Mobile Client<br/>(iOS/Android)"]
    CDN["CDN<br/>(CloudFront)"]
    APIGW["API Gateway<br/>(Auth, Rate Limit)"]
    WSGateway["WebSocket Gateway<br/>(Chat, Notifications)"]

    ProfileSvc["Profile Service"]
    LocationSvc["Location Service"]
    RecommendSvc["Recommendation<br/>Service"]
    SwipeSvc["Swipe Service"]
    MatchSvc["Match & Chat<br/>Service"]
    TrustSvc["Trust & Safety<br/>Service"]

    PG["PostgreSQL<br/>(Profiles, Matches)"]
    Redis["Redis Cluster<br/>(Geo Index, Likes)"]
    Kafka["Kafka<br/>(Events Bus)"]
    Cassandra["Cassandra<br/>(Chat Messages)"]
    S3["S3<br/>(Photos, Media)"]
    ML["ML Pipeline<br/>(Scoring, Moderation)"]

    Client -->|HTTPS| CDN
    Client -->|HTTPS| APIGW
    Client -->|WSS| WSGateway
    CDN -->|Photos| S3

    APIGW --> ProfileSvc
    APIGW --> LocationSvc
    APIGW --> RecommendSvc
    APIGW --> SwipeSvc

    ProfileSvc --> PG
    ProfileSvc --> S3
    LocationSvc --> Redis
    RecommendSvc --> Redis
    RecommendSvc --> PG
    RecommendSvc --> ML

    SwipeSvc --> Kafka
    SwipeSvc --> Redis
    Kafka --> MatchSvc
    MatchSvc --> PG
    MatchSvc --> WSGateway
    MatchSvc --> Cassandra

    TrustSvc --> ML
    TrustSvc --> Kafka
    WSGateway --> Cassandra`,
    },
    {
      title: "Swipe and Match Detection Flow",
      kind: "sequence",
      caption:
        "Sequence of events from swipe to match notification for both users",
      mermaid: `sequenceDiagram
    participant A as User A (Swiper)
    participant API as API Gateway
    participant SS as Swipe Service
    participant Redis as Redis (Likes Set)
    participant Kafka as Kafka
    participant MS as Match Service
    participant WS as WebSocket Gateway
    participant B as User B

    A->>API: POST /swipe (right on User B)
    API->>SS: Record swipe
    SS->>Redis: Check bloom filter (already swiped?)
    Redis-->>SS: Not found
    SS->>Kafka: Publish SwipeEvent
    SS->>Redis: Add A to B's inbound likes
    SS->>Redis: Check if B liked A
    Redis-->>SS: B liked A = YES
    SS->>Kafka: Publish MatchEvent(A, B)
    SS-->>API: 200 OK (match: true)
    API-->>A: Match notification

    Kafka->>MS: Consume MatchEvent
    MS->>MS: Create chat room
    MS->>WS: Notify User B
    WS->>B: Push: "You matched with A!"`,
    },
    {
      title: "Recommendation Pipeline Flow",
      kind: "flow",
      caption:
        "Three-phase recommendation pipeline from geospatial query to ranked card stack",
      mermaid: `flowchart TD
    Start["User opens app<br/>(lat, lon, preferences)"]
    GeoQuery["Geospatial Query<br/>Find users in radius<br/>(Redis GEORADIUS)"]
    RawCandidates["Raw Candidates<br/>(50K-500K users)"]

    FilterSwiped["Filter: Already Swiped<br/>(Bloom filter check)"]
    FilterPrefs["Filter: Preference Mismatch<br/>(age, gender)"]
    FilterInactive["Filter: Inactive > 7 days"]
    FilterBlocked["Filter: Blocked Users"]
    FilteredSet["Filtered Candidates<br/>(1K-10K users)"]

    ScoreDistance["Score: Distance<br/>(exponential decay)"]
    ScoreElo["Score: Elo Compatibility<br/>(Gaussian match)"]
    ScoreActivity["Score: Activity Recency<br/>(log decay)"]
    ScoreProfile["Score: Profile Completeness<br/>(photos + bio)"]
    Composite["Composite Score<br/>(weighted sum)"]
    TopK["Top-K Selection<br/>(partial sort, K=200)"]
    Stack["Card Stack<br/>Served to Client"]

    Start --> GeoQuery
    GeoQuery --> RawCandidates
    RawCandidates --> FilterSwiped
    FilterSwiped --> FilterPrefs
    FilterPrefs --> FilterInactive
    FilterInactive --> FilterBlocked
    FilterBlocked --> FilteredSet

    FilteredSet --> ScoreDistance
    FilteredSet --> ScoreElo
    FilteredSet --> ScoreActivity
    FilteredSet --> ScoreProfile

    ScoreDistance --> Composite
    ScoreElo --> Composite
    ScoreActivity --> Composite
    ScoreProfile --> Composite

    Composite --> TopK
    TopK --> Stack`,
    },
    {
      title: "User Profile State Machine",
      kind: "state",
      caption:
        "Lifecycle states of a user profile from creation through verification and moderation",
      mermaid: `stateDiagram-v2
    [*] --> Registered: Sign up
    Registered --> ProfileCreated: Add photos + bio
    ProfileCreated --> PendingVerification: Submit photo verification
    ProfileCreated --> Active: Skip verification

    PendingVerification --> Verified: ML face match passes
    PendingVerification --> ProfileCreated: Verification failed

    Verified --> Active: Profile goes live
    Active --> Reported: User reported
    Active --> Boosted: Activate Boost
    Active --> Paused: User pauses account
    Active --> Shadowbanned: Trust score below threshold

    Boosted --> Active: Boost expires (30 min)
    Reported --> UnderReview: Multiple reports
    Reported --> Active: Report dismissed
    UnderReview --> Active: Cleared by moderation
    UnderReview --> Banned: Violation confirmed
    Shadowbanned --> Active: Trust score recovers
    Shadowbanned --> Banned: Continued violations
    Paused --> Active: User unpauses
    Banned --> [*]`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the matching algorithm to detect mutual likes in real-time at 2B swipes/day?",
      a: "The key insight is that match detection is a reverse-edge lookup in a directed graph -- when A likes B, you need to check if B previously liked A. The most efficient approach uses a Redis-based data structure: maintain a set per user containing the IDs of everyone who has right-swiped on them (inbound likes). When A swipes right on B, two operations happen atomically: (1) add A's ID to B's inbound-likes set, and (2) check if B's ID exists in A's inbound-likes set. If the check succeeds, emit a match event. Redis SET operations (SADD + SISMEMBER) are O(1) and can handle the throughput. The memory footprint is manageable: with 10M DAU and an average of 1K inbound likes per user, that is roughly 80GB across a Redis cluster. For the 'already swiped' deduplication (to avoid showing the same profile twice), a bloom filter per user is more space-efficient than a full set -- 144KB vs 800KB per user for 100K entries at 0.1% false-positive rate. The entire swipe event is also published to Kafka for durable storage and downstream processing (Elo updates, analytics). During peak hours, Kafka consumer groups auto-scale horizontally since swipe events are partitioned by swiper ID.",
    },
    {
      q: "How would you handle the geospatial indexing to efficiently find nearby users?",
      a: "The fundamental challenge is converting a 2D proximity query ('all users within 50km') into an efficient index lookup. Geohashing is the most common approach: it encodes (lat, lon) into a string where shared prefixes indicate spatial proximity. At precision 6, each cell is roughly 1.2km x 0.6km. To find users within 50km, you compute the geohash of the requesting user, determine which geohash prefixes (at a coarser precision, say 4 characters for ~40km cells) cover the search radius, and query all users with those prefixes. The critical edge case is that two physically adjacent points may have completely different geohash prefixes if they straddle a cell boundary -- the standard solution is to always include all 8 neighboring cells in the query (a 9-cell search). For a production system at Tinder's scale, Redis GEO commands (GEOADD/GEORADIUS backed by sorted sets with geohash-based scores) handle up to ~10M users efficiently. Beyond that, Google's S2 geometry library is superior because it maps the sphere using a Hilbert space-filling curve onto 64-bit cell IDs, providing more uniform cell sizes and the ability to compute a minimal covering of any arbitrary region. Location updates are batched -- the app sends updates every 5 minutes while foregrounded, and these are written to the geospatial index asynchronously.",
    },
    {
      q: "How would you design the Elo scoring system to balance user experience?",
      a: "A pure Elo system ranks every user on a single attractiveness axis, which creates a 'rich get richer' problem: top-Elo users get shown to everyone, receive all the right-swipes, and their Elo climbs further, while low-Elo users get minimal exposure. The solution is to use Elo for scoring but NOT for strict stack ordering. Instead, compose the card stack from a distribution of Elo tiers: roughly 60% similar-Elo users (highest match probability), 25% slightly-higher-Elo users (aspirational, maintains engagement), and 15% slightly-lower-Elo users (ensures those users get exposure too). The Elo update formula itself needs adaptation from chess: the K-factor (how much a single swipe changes the rating) should be high for new users (K=40, so their Elo calibrates quickly within ~50 swipes) and low for established users (K=16, so their rating is stable). A 'newbie boost' gives new users temporarily inflated exposure regardless of Elo, serving dual purposes: it provides a good first-day experience and generates enough swipe data to calibrate their Elo. Additionally, swipe velocity should be factored in -- a user who right-swipes on everyone provides less signal than one who is selective, so right-swipes from selective users should carry more Elo weight.",
    },
    {
      q: "How do you prevent fake profiles and spam bots on a dating platform?",
      a: "Fake profile detection operates on three layers: identity verification, behavioral analysis, and content moderation. For identity verification, implement a photo verification flow where users take a real-time selfie mimicking a randomly generated pose; a face-matching ML model compares this selfie against their profile photos to confirm identity, and a liveness detection model ensures it is a real person (not a photo of a photo). For behavioral analysis, legitimate users exhibit specific patterns: 30-50% right-swipe rates, variable swipe timing (1-5 seconds per profile), and diverse messaging. Bots typically swipe right on everyone at inhuman speed and send templated messages within seconds of matching. Build a classifier trained on these behavioral signals, running in near-real-time on a sliding window of recent activity. For content moderation, scan all profile text and chat messages through NLP classifiers for spam (URLs, solicitation keywords), harassment, and scam patterns (requests for money, gift cards, cryptocurrency). The output is a composite trust score per user, updated continuously. Rather than hard-banning suspect accounts (which triggers adversaries to create new accounts immediately), use shadow-banning: reduce the shadow-banned user's visibility in others' recommendation stacks without notifying them, which slows adversarial adaptation.",
    },
    {
      q: "How would you scale the chat system for matched users?",
      a: "The chat system benefits from a natural scaling advantage: chat rooms only exist between matched users, so the total number of active rooms is much smaller than the total user base -- roughly 50M matches with perhaps 5M actively chatting at any time. The architecture uses a WebSocket gateway layer that maintains persistent connections with mobile clients. The gateway is horizontally scaled, with each gateway node handling ~100K concurrent connections. A connection registry (Redis) maps each online user to their gateway node, so when a message arrives for User B, the system looks up which gateway node holds B's connection and routes the message there. Message persistence uses Cassandra with a partition key of chat_room_id and clustering key of timestamp, which naturally supports the 'load older messages' pagination pattern. Message ordering is guaranteed within a partition, and at-least-once delivery is achieved by Kafka-backed message processing with client-side deduplication using monotonic message IDs. For offline users, a push notification is sent via APNs/FCM with the first 100 characters of the message. Typing indicators and read receipts are ephemeral -- sent only through WebSocket to currently-connected peers, never persisted, keeping the hot path extremely lightweight.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary reason for using geohash-based indexing instead of computing Haversine distance for every user pair?",
      options: [
        "Geohash is more accurate for short distances than Haversine",
        "Geohash reduces the search space from O(n) to O(1) prefix lookups, making proximity queries feasible at scale",
        "Geohash eliminates the need for latitude/longitude storage entirely",
        "Geohash provides exact distance measurements without floating-point errors",
      ],
      answerIndex: 1,
      explanation:
        "Geohash converts a 2D spatial proximity query into a 1D string prefix lookup. Instead of computing distance to every user (O(n)), you query only users sharing the same geohash prefix or neighboring prefixes, reducing the candidate set by orders of magnitude. It trades some precision (edge-case handling with 9-cell queries) for massive computational savings.",
    },
    {
      q: "In a dating app's match detection system, why are bloom filters preferred over hash sets for tracking 'already swiped' users?",
      options: [
        "Bloom filters provide zero false positives unlike hash sets",
        "Bloom filters support deletion of elements while hash sets do not",
        "Bloom filters use significantly less memory per user (~144KB vs ~800KB for 100K entries) with acceptable false positive rates",
        "Bloom filters provide faster lookups than hash sets at all sizes",
      ],
      answerIndex: 2,
      explanation:
        "At 10M DAU with ~100K swipes tracked per user, the memory difference is dramatic: bloom filters at 0.1% FPR use ~144KB per user (1.4TB total) vs hash sets at ~800KB per user (8TB total). The trade-off is a 0.1% chance of incorrectly marking a user as already-swiped (a minor UX impact), but the 5-6x memory savings makes the system feasible without enormous Redis clusters.",
    },
    {
      q: "Why does the Elo rating system use a higher K-factor for new users compared to established users?",
      options: [
        "New users need their ratings artificially inflated to keep them engaged",
        "Higher K-factor means ratings change more per swipe, allowing new users to quickly reach their true attractiveness tier",
        "Lower K-factor for established users prevents them from ever losing rating",
        "K-factor has no effect on the rate of convergence",
      ],
      answerIndex: 1,
      explanation:
        "A high K-factor (e.g., 40) for new users means each swipe moves their Elo significantly, so within ~50 swipes their rating converges near their true level. For established users (K=16), ratings change slowly, providing stability. This mirrors chess rating systems and ensures new users are quickly placed in the appropriate tier for recommendation quality.",
    },
    {
      q: "What is the primary advantage of shadow-banning over hard-banning suspected fake accounts?",
      options: [
        "Shadow-banning is easier to implement technically",
        "Shadow-banned users continue generating revenue through ads",
        "Shadow-banning delays adversarial adaptation because the bad actor does not know they have been detected",
        "Shadow-banning avoids any legal liability from false positives",
      ],
      answerIndex: 2,
      explanation:
        "When a bot or fake profile is hard-banned, the operator immediately knows their detection signals and adapts their next account to evade them. Shadow-banning (reducing the account's visibility in recommendation stacks without notification) means the operator sees declining engagement but cannot pinpoint why, slowing the adversarial feedback loop. This buys time for the trust-and-safety team to study the attack pattern and build more robust detectors.",
    },
  ],
  flashcards: [
    {
      front: "How does geohash encoding enable efficient proximity queries?",
      back: "Geohash converts 2D (lat, lon) coordinates into a 1D string where nearby points share common prefixes. Querying all users within a radius becomes a string prefix lookup (plus 8 neighboring cells for edge cases) instead of O(n) Haversine distance computations. Precision 6 gives ~1.2km x 0.6km cells.",
    },
    {
      front: "What is the 9-cell query pattern in geohash, and why is it necessary?",
      back: "Two physically adjacent points can have completely different geohash prefixes if they straddle a cell boundary. The 9-cell pattern queries the target cell plus all 8 surrounding cells, ensuring no nearby users are missed due to boundary artifacts. This adds at most 9x the single-cell cost but guarantees coverage.",
    },
    {
      front: "How does Tinder-style match detection work at the data structure level?",
      back: "Maintain a Redis SET per user containing IDs of everyone who right-swiped on them (inbound likes). When A swipes right on B: (1) SADD A to B's set, (2) SISMEMBER B in A's set. If step 2 returns true, it is a mutual match. Both operations are O(1). Alternatively, check reciprocal entries in a Kafka stream consumer.",
    },
    {
      front: "How does the Elo rating system adapt from chess to dating?",
      back: "Each user has an Elo score (initial 1500). Right-swipes are 'wins' and left-swipes are 'losses' for the swiped user. The K-factor varies: high (40) for new users for fast calibration, low (16) for established users for stability. Unlike chess, the card stack is NOT strictly Elo-ordered; it mixes tiers for engagement.",
    },
    {
      front: "What is shadow-banning and why is it preferred for dating app safety?",
      back: "Shadow-banning reduces a suspected fake/spam account's visibility in recommendation stacks without notifying the user. The account still functions but is shown to far fewer people. This delays adversarial adaptation because the bad actor cannot confirm detection, unlike hard-banning which provides immediate feedback to adjust evasion tactics.",
    },
    {
      front: "Why use bloom filters for the 'already swiped' check?",
      back: "With 10M DAU tracking ~100K swipes each, a full hash set requires ~800KB/user (8TB total) while a bloom filter at 0.1% FPR uses ~144KB/user (1.4TB total). The trade-off is a 0.1% chance of skipping an unswiped user -- an acceptable UX cost for a 5-6x memory reduction.",
    },
    {
      front: "How is chat message delivery handled for offline users?",
      back: "Messages are persisted to Cassandra (partitioned by room_id, clustered by timestamp) regardless of recipient status. For offline recipients, a push notification is sent via APNs (iOS) or FCM (Android) with a truncated preview. When the user comes online, the client fetches missed messages from Cassandra using the last-seen message ID as a cursor.",
    },
    {
      front: "What are the three phases of the recommendation pipeline?",
      back: "1) Candidate Generation: geospatial query returns 50K-500K nearby users. 2) Filtering: remove already-swiped (bloom filter), preference mismatches, inactive, and blocked users -- reduces to 1K-10K. 3) Scoring/Ranking: compute weighted composite score (distance, Elo, activity, profile completeness) and return top-200 as the card stack.",
    },
  ],
  exercises: [
    "Design the data model and API for the 'Super Like' feature where a user gets 1 free super-like per day (more with premium). Consider how super-likes should affect the recipient's card stack ordering (should they appear first?), how to implement the daily quota with timezone handling, and how match detection differs for super-likes vs regular likes.",
    "Implement a location spoofing detection system. Consider signals like: GPS accuracy metadata, impossible travel (user in NYC at 3pm and London at 3:05pm), VPN/proxy detection, accelerometer data correlation with location changes, and WiFi BSSID cross-referencing. Design the detection pipeline and the response action (warn, restrict Passport feature, or ban).",
    "Design the 'Boost' feature that increases a user's visibility for 30 minutes. Specify how the boost multiplier integrates with the recommendation scoring formula, how to handle concurrent boosts in a dense area (if 1000 users boost simultaneously, they cannot all be #1), and how to measure and guarantee the promised increase in profile views.",
    "Design a read-receipt and typing-indicator system for the chat feature. Consider the trade-offs between reliability and latency: should these be persisted or ephemeral? How do you handle the case where User A sees 'typing...' but User B's app crashes before sending? Design the protocol for both WebSocket-connected and polling-based clients.",
    "Design an A/B testing framework for the recommendation algorithm. You want to test whether a new scoring model improves match rates without degrading user experience. Address: how to split users into test/control groups (geographic, random, or stratified), what metrics to track (right-swipe rate, match rate, conversation rate, retention), how to handle network effects (User A in test group matches with User B in control group), and how to determine statistical significance with the available sample size.",
  ],
  revisionNotes: [
    "Core scale: ~75M MAU, ~10M DAU, ~2B swipes/day (~23K/sec average, 70K-100K/sec peak), ~1.5M dates/week. Each swipe is ~100 bytes; daily swipe storage is ~200GB.",
    "Geospatial indexing: Geohash encodes (lat, lon) as a base-32 string with shared prefixes for nearby points. Precision 6 = ~1.2km x 0.6km cells. Always use 9-cell queries (target + 8 neighbors) to handle cell boundary edge cases. Redis GEORADIUS works up to ~10M users; beyond that, consider S2 geometry library.",
    "Match detection: Directed graph problem -- A likes B, check if B liked A. Use Redis SETs for inbound likes (SADD + SISMEMBER = O(1)). Memory: ~80GB for 10M DAU with 1K inbound likes each. Publish match events to Kafka for downstream processing.",
    "Already-swiped deduplication: Bloom filters save 5-6x memory over hash sets (~144KB vs ~800KB per user for 100K entries at 0.1% FPR). False positives mean a user occasionally does not see an unswiped profile -- acceptable trade-off.",
    "Elo rating system: Initial score 1500. K-factor: 40 (new, <50 ratings), 24 (settling, <200), 16 (established). Right-swipe = 'win' for target. Card stack mixes Elo tiers: ~60% similar, ~25% aspirational, ~15% lower for exposure fairness.",
    "Recommendation pipeline: (1) Geo query -> 50K-500K candidates, (2) Filter (bloom, prefs, activity, blocks) -> 1K-10K, (3) Score (distance 0.25, Elo 0.30, activity 0.15, profile 0.10, verified 0.10, freshness 0.10) -> top 200 card stack.",
    "Chat architecture: WebSocket gateway (100K connections/node), Kafka for message durability, Cassandra for persistence (partition by room_id, cluster by timestamp). Typing indicators and read receipts are ephemeral (WebSocket only, not persisted). Offline delivery via APNs/FCM push.",
    "Trust and safety: Three layers -- photo verification (liveness + face match ML), behavioral analysis (swipe patterns, message velocity), content moderation (NLP on messages). Shadow-banning over hard-banning to slow adversarial adaptation. Composite trust score updated continuously.",
    "Data storage choices: PostgreSQL for profiles and matches (structured, relational queries). Redis for geo index and likes sets (low-latency, O(1) operations). Cassandra for chat messages (time-series, high write throughput). S3 + CDN for photos. Kafka for event streaming.",
    "Key non-functional requirements: Match notification <1 second, chat delivery <200ms for online users, 99.95% availability, GDPR compliance with right-to-deletion across all stores, encryption at rest and in transit for location and messaging data.",
  ],
  cheatSheet: [
    "Swipes/sec = 2B/day / 86400 = ~23K avg, peak 3-5x = ~70K-100K/sec",
    "Geohash precision 5 = ~5km cell, precision 6 = ~1.2km cell, precision 7 = ~150m cell",
    "Bloom filter size = -n*ln(p) / (ln2)^2; for n=100K, p=0.001: ~144KB",
    "Redis GEORADIUS: O(N+log(M)) where N = results, M = total elements in the sorted set",
    "Elo expected score: E(A) = 1 / (1 + 10^((R_B - R_A) / 400))",
    "Elo update: R_new = R_old + K * (actual - expected); K = 40 (new), 16 (established)",
    "Haversine: d = 2R * arcsin(sqrt(sin^2(dlat/2) + cos(lat1)*cos(lat2)*sin^2(dlon/2)))",
    "Chat partition key: room_id; cluster key: timestamp; enables efficient range scans for message history",
    "WebSocket gateway sizing: ~100K connections per node, 50 nodes = 5M concurrent users",
    "Photo storage: ~1MB per user (5 photos x 200KB compressed); 75M users = ~75TB total media",
  ],
  glossary: [
    {
      term: "Geohash",
      definition:
        "A hierarchical spatial encoding that converts a 2D (latitude, longitude) coordinate into a 1D alphanumeric string where nearby points share common prefixes. Used to convert proximity queries into efficient string prefix lookups in databases and caches.",
    },
    {
      term: "Elo Rating",
      definition:
        "A zero-sum rating system originally designed for chess, adapted here to score user attractiveness. Each user has a numeric rating; when User A swipes on User B, B's rating adjusts based on the expected vs actual outcome weighted by a K-factor that reflects rating confidence.",
    },
    {
      term: "Bloom Filter",
      definition:
        "A space-efficient probabilistic data structure that tests whether an element is a member of a set. It can return false positives (saying an element is present when it is not) but never false negatives. Used here to check if a user has already been swiped on without storing the full set of swiped IDs.",
    },
    {
      term: "Shadow Ban",
      definition:
        "A moderation technique where a suspected bad actor's content is hidden from other users without notifying the account. The user can still use the app normally, but their profile appears in far fewer recommendation stacks, limiting their ability to cause harm while delaying their awareness of detection.",
    },
    {
      term: "S2 Geometry",
      definition:
        "Google's spherical geometry library that uses a Hilbert curve to map the Earth's surface to 64-bit cell IDs. It provides more uniform cell sizes than geohash (which distorts near poles) and can compute minimal cell coverings for arbitrary shapes, making it ideal for complex proximity queries.",
    },
    {
      term: "Mutual Match",
      definition:
        "A bidirectional like between two users -- User A right-swiped User B AND User B right-swiped User A. This event unlocks the chat feature between the two users and is detected by checking for a reciprocal edge in the directed swipe graph.",
    },
    {
      term: "Card Stack",
      definition:
        "The ordered list of recommended user profiles presented to a user for swiping. Generated by the recommendation pipeline through candidate generation (geo query), filtering (preferences, already-swiped), and scoring/ranking (Elo, distance, activity), typically containing ~200 profiles per session.",
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Geohash",
      "S2 Geometry (Google)",
      "PostGIS R-Tree",
      "Redis GEORADIUS",
    ],
    rows: [
      [
        "Cell Shape",
        "Rectangular, varies by latitude",
        "Quadrilateral, more uniform sizes",
        "Bounding rectangles (MBR)",
        "Sorted set with geohash-based score",
      ],
      [
        "Query Type",
        "Prefix match + 9-cell neighbor",
        "Cell covering of arbitrary region",
        "Spatial index range scan",
        "Built-in radius/box query",
      ],
      [
        "Precision Control",
        "String length (1-12 chars)",
        "Cell level (0-30, 64-bit ID)",
        "Index resolution auto-tuned",
        "Fixed precision, results sorted by distance",
      ],
      [
        "Edge Cases",
        "Boundary artifacts (need 9-cell workaround)",
        "Hilbert curve ensures locality",
        "No boundary issues (exact geometry)",
        "Handles internally, transparent to user",
      ],
      [
        "Scale Limit",
        "Billions (string index in any DB)",
        "Billions (used by Google Maps)",
        "Millions (single-node PostgreSQL)",
        "~10M per Redis node (sorted set)",
      ],
      [
        "Implementation Effort",
        "Low (simple encoding algorithm)",
        "Medium (requires S2 library integration)",
        "Low (SQL extension, built-in operators)",
        "Very low (built-in Redis commands)",
      ],
    ],
  },
  followUps: [
    "How would you extend the system to support group matching features (e.g., Tinder Social) where groups of friends can match with other groups?",
    "How would you design the Passport feature that lets users change their virtual location to swipe in a different city, and what abuse vectors does this introduce?",
    "How would you implement video calling between matched users, including the signaling server, TURN/STUN for NAT traversal, and quality adaptation for varying network conditions?",
    "How would you design the monetization infrastructure to support multiple subscription tiers (Plus, Gold, Platinum) with different feature gates, cross-platform purchase validation (App Store, Play Store), and subscription lifecycle management?",
    "How would you handle the cold-start problem for new users who have no swipe history, ensuring they receive good recommendations and their Elo calibrates quickly?",
    "How would you design the system to comply with data privacy regulations (GDPR, CCPA) including right-to-deletion across all data stores (PostgreSQL, Redis, Cassandra, Kafka, S3, ML training data)?",
  ],
  resources: [
    {
      label: "Tinder System Design - ByteByteGo",
      kind: "article",
      note: "Comprehensive overview of Tinder's architecture including geospatial indexing, matching algorithm, and scaling challenges",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing are directly applicable to the swipe ingestion and chat pipelines",
    },
    {
      label: "S2 Geometry Library - Google Open Source",
      kind: "docs",
      note: "Documentation for the S2 spherical geometry library used for production-grade geospatial indexing beyond simple geohash",
    },
    {
      label: "Building Tinder's Real-Time Chat - InfoQ Talk",
      kind: "video",
      note: "Engineering talk covering WebSocket architecture, message delivery guarantees, and scaling the chat infrastructure",
    },
    {
      label: "Redis Geospatial Commands Documentation",
      kind: "docs",
      note: "Official Redis docs for GEOADD, GEORADIUS, and GEOSEARCH commands used for location-based user discovery",
    },
  ],
};
