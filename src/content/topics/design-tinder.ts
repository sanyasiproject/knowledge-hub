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
    "## Capacity Math That Anchors Every Design Decision\n\nDoing the arithmetic out loud is what separates a strong HLD answer from hand-waving. Swipe throughput: 2B swipes/day divided by 86,400 seconds is ~23,148 -- call it ~23K swipes/second average. Traffic concentrates in the 8-11 PM window across time zones, so plan for a 3-5x peak: ~70K-115K swipes/second. At ~100 bytes per swipe event that is only ~2.3 MB/s average ingest bandwidth -- the challenge is not bytes, it is per-event work (dedup check, reciprocal-like check, durable write) at 100K ops/second. Deck generation QPS: with 10M DAU averaging 1.5 sessions/day plus mid-session refills, assume ~20M deck builds/day, which is ~230 QPS average and ~1K QPS peak. Each deck build fans out to several Elasticsearch shards and scores 1K-10K candidates, so 1K QPS of deck builds can mean 5-10K shard queries/second and millions of scoring operations/second -- this is why decks are precomputed and cached in Redis rather than built synchronously on every open. Photo storage: 75M users x 5 photos x 200KB compressed is ~75TB of originals; serving 3-4 renditions per photo (thumbnail, card, full-screen) roughly triples that to ~200-250TB in S3, which is cheap -- the real cost is CDN egress, since one deck session can pull 200 profiles x ~150KB of card-size imagery = ~30MB per session.\n\nKey insight: swipe ingestion is write-dominated with tiny payloads, while deck generation is read-dominated with heavy fan-out -- they scale on different axes and must be separate services.\n\nCommon mistake: quoting '2B swipes/day' without converting it to per-second peak load. Interviewers want to see 2B / 86,400 = 23K/s, then a 3-5x evening peak, because that number drives the choice of Kafka + Cassandra over a relational store.\n\nFor example, at 100K swipes/second peak, a Postgres cluster doing one indexed insert plus one reciprocal-check read per swipe would need hundreds of primaries; Cassandra's leaderless log-structured writes plus a Redis fast path handle it with a modest cluster.",
    "## Geosharding the Discovery Index -- Tinder's Real Approach\n\nTinder's production discovery system is a geosharded Elasticsearch cluster, not a single global index. The world is divided into geographic cells (Tinder used an S2-based tiling), and cells are grouped into shards balanced by user count rather than by area -- so a shard might cover half of Manhattan or the entire Australian outback, because what matters is that each shard holds a roughly equal number of active users. Each shard is an Elasticsearch index holding the full discovery document (age, gender, preferences, last-active, desirability features, location) for the users physically inside its cells. A deck query for a user with a 50km radius computes which cells the radius circle covers, maps those cells to the (usually 1-3) shards that own them, fans the filtered query out to just those shards in parallel, and merges the ranked results. This keeps every query touching a tiny fraction of the fleet instead of broadcasting to all shards.\n\nMoving users are the operational wrinkle: when a user's location update crosses a shard boundary (travel, or the Passport feature), the system writes the discovery document to the new shard and deletes it from the old one -- brief double-presence is acceptable, absence is not, so write-then-delete ordering matters. Density hotspots are handled with replicas: shards covering London or NYC get more Elasticsearch replicas and more powerful nodes than rural shards, and the shard-to-cell mapping is periodically rebalanced as populations shift.\n\nKey insight: geosharding works for dating because queries are intrinsically local -- nobody in Tokyo needs Paris profiles in their deck -- so locality-based partitioning gives near-perfect query isolation, unlike a social graph where edges cross the planet.\n\nIn practice: Tinder published this design in its 'Geosharded Recommendations' engineering blog series -- shards balanced by user count over S2 cells, with a routing layer mapping cell -> shard and a background mover process for relocating users.\n\nWarning: naive geographic sharding by fixed-size cells creates massive hot shards in dense cities and near-empty shards elsewhere; always balance shards by user population, not by land area.",
    "## One Session End-to-End: Open App to First Message\n\nTracing a single session ties every component together and is a great way to close an interview answer. (1) Open app: the client authenticates via the API gateway (JWT validation, session touch in Redis) and opens a WebSocket to the WS gateway, which registers user -> gateway-node in the Redis connection registry. (2) Deck fetch: the client requests its deck; the recommendation service first checks the Redis hot-deck cache, and on a hit returns the precomputed top-200 stack in a few milliseconds. On a miss it computes the S2 cells covering the user's radius, fans out to the 1-3 owning Elasticsearch shards with preference filters, excludes already-swiped IDs via the bloom filter, scores candidates with the desirability model, caches the stack, and returns it -- p99 target under ~300ms. (3) Photo prefetch: the client pulls card-size renditions for the first ~10 profiles from CloudFront so swiping never waits on the network. (4) Swipe: each swipe POSTs to the swipe ingestion service, which checks the dedup bloom filter, acks the client immediately, and publishes the event to the Kafka swipes topic keyed by the user pair. (5) Match: a match worker consumes the event, persists it to Cassandra, and runs the reciprocal check -- if the swiped user already right-swiped back, it creates the match row and emits a match event. (6) Notify: the match service looks up both users in the connection registry and pushes 'It's a Match!' over their WebSockets (APNs/FCM for whoever is offline), and creates the chat channel keyed by match_id. (7) First message: the sender's message goes over the WebSocket to the chat service, is persisted to Cassandra (partition: match_id, cluster: timestamp), routed to the recipient's gateway node via the registry, and mirrored to a moderation topic for async NLP scanning.\n\nReal-world example: from the user's perspective the entire swipe -> match -> notification loop completes in well under a second, even though it crosses an HTTP ack, a Kafka hop, a Cassandra write, and a WebSocket push -- because every step is O(1) and the only synchronous part is the initial ack.\n\nCommon mistake: making the client wait for the full match-detection pipeline before acknowledging the swipe. Ack fast on durable enqueue; deliver the match asynchronously over the WebSocket a few hundred milliseconds later.",
  ],
  deepDive: [
    "Geospatial indexing is the foundational infrastructure challenge for a location-based dating app. The naive approach -- computing Haversine distance from the requesting user to every other user -- is O(n) and computationally infeasible at scale. Geohashing solves this by encoding latitude/longitude into a string prefix that shares common prefixes for nearby points. A geohash of precision 6 (~1.2km x 0.6km cell) allows the system to query all users in adjacent cells using simple string prefix matching, reducing the search space by orders of magnitude. However, geohash has well-known edge-case problems: two points on opposite sides of a cell boundary may be very close but share no common prefix. The solution is to always query the target cell plus all 8 neighboring cells (a 9-cell query). Google's S2 geometry library offers a superior alternative: it uses a Hilbert curve to map the sphere to 64-bit cell IDs, providing better coverage uniformity and the ability to generate a minimal set of cells that cover an arbitrary radius with tunable precision. In practice, Redis GEOADD/GEORADIUS commands (which use a sorted set with geohash-based scoring) handle moderate scale (~10M users) well, but beyond that, a dedicated geospatial index like PostGIS with spatial partitioning or a custom S2-based index in a distributed store becomes necessary.",
    "The recommendation scoring system must balance multiple competing objectives: showing users profiles they will find attractive (maximizing right-swipe rate), showing profiles of users who will find them attractive (maximizing mutual match rate), ensuring fair exposure for all users (preventing a small set of highly-attractive users from monopolizing all attention), and maintaining engagement over time (not exhausting the candidate pool too quickly). The Elo rating system, borrowed from chess, addresses the first two objectives: each user has a score that increases when they receive right-swipes and decreases on left-swipes, weighted by the swiper's own Elo. High-Elo users are preferentially shown to other high-Elo users, creating a natural tiering effect. However, pure Elo optimization leads to a 'rich get richer' dynamic that harms engagement for average users. Tinder's actual algorithm likely incorporates a desirability distribution constraint: a user's card stack is composed of a mix of Elo tiers -- mostly similar-Elo users, with occasional higher-Elo aspirational profiles to maintain excitement. Additionally, a freshness boost for new users (the 'newbie boost') ensures new profiles get initial exposure to calibrate their Elo quickly. The scoring formula also penalizes showing the same user repeatedly across sessions and incorporates a diversity constraint to avoid showing 10 consecutive profiles of the same type.\n\nExploration is the fourth ingredient alongside recency, distance, and desirability: a pure exploit-only ranker never learns whether an uncertain profile would perform well, so production systems reserve a slice of every deck (5-10%) for exploration -- epsilon-greedy insertion of under-exposed profiles, or Thompson sampling over the predicted right-swipe rate, which naturally favors candidates whose estimate is uncertain. This is also how the cold-start 'newbie boost' generalizes: a new profile has maximum uncertainty, so a bandit-style ranker gives it exposure until its estimate tightens.\n\nKey insight: the deck is a portfolio, not a top-K list -- a deliberate blend of high-probability matches (similar desirability, close, recently active), aspirational profiles, and exploration slots, because the objective is long-term match rate and retention, not per-card click-through.",
    "Anti-fraud and trust-and-safety systems are critical infrastructure for dating platforms where users are uniquely vulnerable. The threat model includes: fake profiles created for catfishing or romance scams, bot accounts that send spam or phishing links, underage users bypassing age verification, harassment and abusive messaging, and coordinated manipulation (e.g., Elo boosting rings). Photo verification uses a liveness-detection ML model: the user is prompted to mimic a randomly-selected pose, and a face-matching model compares the selfie to their profile photos, confirming both identity and liveness. Profile photos are also scanned against known databases of stolen images and run through NSFW detection models. Behavioral signals are equally important: a user who swipes right on every profile within seconds is likely a bot (legitimate users exhibit varied swipe timing and ~30-50% right-swipe rates). Message content is scanned in real-time using NLP classifiers trained on reported conversations, flagging solicitation, threats, requests for money, and links to external sites. A composite trust score is maintained per user, combining verification status, report history, behavioral signals, and account age. Users below a threshold are shadow-banned (their profile is shown to fewer users) rather than explicitly banned, which delays adversarial adaptation.",
    "Scaling the swipe ingestion pipeline to handle 2B events/day with sub-second match detection requires careful architectural choices. Each swipe is published to a Kafka topic partitioned by a hash of the swiper's user ID, ensuring all swipes from a given user land on the same partition for ordering guarantees. A stream processor (Kafka Streams or Flink) consumes the swipe events and performs match detection: for a right-swipe from User A on User B, it checks a Redis set keyed by User B for the presence of User A's ID. If found, a match event is emitted to a separate Kafka topic, triggering notifications to both users and creating a chat room. The Redis set approach provides O(1) lookup but requires ~8 bytes per entry; with 10M DAU averaging 1K right-swipes received each, this is ~80GB of Redis -- feasible with a Redis cluster. Bloom filters offer a space-efficient alternative (~1MB per user for 100K entries at 0.1% FPR) but introduce false positives that require a secondary check against the persistent swipe store. The swipe data is durably stored in a Cassandra cluster partitioned by swiper_id with a TTL of 90 days (swipes older than 90 days are unlikely to result in matches and can be archived to cold storage). During peak hours (typically 8-10 PM local time across multiple time zones), the system must handle 3-5x average throughput, requiring auto-scaling of Kafka consumers and Redis read replicas.",
    "Match detection deserves precise treatment because it is a correctness problem, not just a throughput problem. The fast path is a Redis check: when A right-swipes B, the worker does SADD likes:B A (record the inbound like) then SISMEMBER likes:A B (did B already like A?). Both are O(1), but Redis is a cache -- entries expire, nodes fail over, and bloom-filter variants admit false positives -- so Cassandra remains the source of truth: every swipe is durably written to a swipes table, and any Redis-signaled match is confirmed against it before the match row is created. The nasty race is simultaneous reciprocal right-swipes: A swipes B and B swipes A within the same few milliseconds, each worker checks for the reciprocal like before the other's write lands, and both conclude 'no match yet' -- a lost match -- or both detect it and create duplicate matches. Two standard fixes compose well. First, serialize per pair: key the Kafka swipe topic by the normalized pair ID min(A,B):max(A,B) so both swipes of a pair land on the same partition and are processed by one consumer in order -- the second swipe always sees the first. Second, make match creation idempotent: the match row's primary key is the deterministic pair ID, inserted with a Cassandra lightweight transaction (INSERT ... IF NOT EXISTS) or an equivalent conditional write, so double-detection collapses into one match.\n\nKey insight: pair-keyed partitioning turns a distributed race into a local sequential problem; the idempotent insert is the belt-and-suspenders for redelivery and multi-consumer edge cases.\n\nCommon mistake: doing check-then-insert as two separate unconditional operations. Under at-least-once Kafka delivery you will create duplicate match rows and send duplicate 'It's a Match!' pushes; the conditional insert on a deterministic key eliminates both.",
    "Swipe idempotency and repeat-free pagination are quiet requirements that dominate perceived quality. Idempotency: mobile clients retry on flaky networks, so every swipe carries a client-generated ID and the natural key (swiper, target) is itself idempotent -- the first write wins, and replays are dropped by the bloom-filter check plus the append-only Cassandra write where a re-insert of the same key is a harmless overwrite. Elo updates and analytics consumers, however, are not naturally idempotent, so they deduplicate on the swipe ID within a processing window. Repeat-free decks: the guarantee 'never show a profile I already swiped' must hold across sessions, devices, and deck refills. The bloom filter (per user, ~144KB for 100K entries at 0.1% FPR) is consulted at deck-build time to exclude seen profiles cheaply; because bloom false positives only ever hide an unswiped profile (never resurface a swiped one), the failure mode is invisible to users. Pagination without repeats falls out of the deck model: the server materializes a deck of ~200 IDs, the client consumes it as a cursor, and a refill request passes the IDs still unconsumed on the client so the server excludes in-flight cards from the next build. Served-but-not-swiped profiles are tracked in a short-TTL Redis set so two overlapping deck builds do not deal the same card twice.\n\nIn practice: teams rebuild the bloom filter from the Cassandra swipe table on cache loss rather than persisting the filter itself -- the filter is a derived structure, and rebuilds for a user take milliseconds.\n\nCommon mistake: enforcing 'no repeats' only within a single deck. Users notice repeats across sessions immediately; the exclusion check must run against the full swipe history structure, not the session state.",
    "Chat-on-match is a scoped realtime messaging system, and the scoping is the design win. A channel exists only per match, identified by the match_id, so authorization is a single lookup: a message is accepted only if sender is one of the two members of an active (non-unmatched, non-banned) match -- there is no open-DM spam surface. Delivery: the sender's WebSocket frame arrives at their gateway node, the chat service validates membership, persists to Cassandra (partition key match_id, clustering key a time-ordered message ID like a TimeUUID), then consults the Redis connection registry (user_id -> gateway node) and forwards to the recipient's node for push over their socket; offline recipients get APNs/FCM with a truncated preview. Presence is tracked by the gateway: connect/disconnect events update a presence key with a short TTL heartbeat (e.g., 30s), and 'online now' or last-seen surfaces in the chat UI from that key -- deliberately eventually consistent, since stale presence for a few seconds is harmless. Unmatch is the important teardown path: it must atomically close the channel, revoke both users' ability to send, and hide history per policy -- and it must win any race with in-flight messages, so the membership check happens at persist time, not just at socket-accept time.\n\nKey insight: because chat rooms only exist between matched pairs, room count grows with matches (~50M) rather than with user pairs (75M squared), and every expensive realtime feature -- presence, typing, receipts -- is bounded by active matches, not by the user base.",
    "The abuse and moderation pipeline runs as an asynchronous sidecar on every content and behavior stream, never in the synchronous hot path. Ingest: profile photo uploads, bio edits, chat messages, swipe events, and user reports each mirror into Kafka moderation topics. Photo pipeline: every upload passes NSFW and violence classifiers, a face-detection model (profiles without a detectable face rank lower), perceptual-hash matching against known scam/stolen-photo databases, and -- for verification -- a liveness-checked selfie matched against profile photos. Text pipeline: chat messages are scanned by NLP classifiers for solicitation, harassment, scam patterns (money, gift cards, crypto, off-platform links), with model scores written to a per-user trust ledger. Behavioral pipeline: a streaming job (Flink) over swipe events flags inhuman patterns -- 100% right-swipe rates, sub-second inter-swipe intervals, message blasts within seconds of matching -- and impossible-travel location sequences. Decisions are graduated: score decay on the trust ledger, shadow-ban (reduced deck exposure) below one threshold, human-review queue below another, hard ban with device/payment fingerprint blocking for confirmed abuse. Human reviewers handle the ambiguous middle and their labels feed back as training data.\n\nWarning: never put moderation inference on the synchronous message path -- a slow model must degrade to async scanning, not add latency to every chat message. The one exception is a cheap regex/keyword pre-filter at the gateway for known-bad content.\n\nReal-world example: romance-scam interdiction is the highest-stakes flow -- classifiers watch for the scam script shape (rapid affection, refusal to video-call, money request) across a conversation, not per message, which is why the trust ledger aggregates signals over time instead of acting on single events.",
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
        "Layered architecture with named technologies. Solid arrows trace the deck-fetch path (client -> API gateway -> recommendation service -> Redis hot deck / geosharded Elasticsearch) and the swipe-to-match-to-chat path (swipe ingestion -> Kafka -> match workers -> match service -> WebSocket gateway -> chat service).",
      mermaid: `graph TB
    subgraph ClientsL["Clients"]
        iOSApp["iOS App"]
        AndroidApp["Android App"]
    end

    subgraph EdgeL["Edge"]
        CDN["CloudFront CDN<br/>(profile photos,<br/>multiple resolutions)"]
    end

    subgraph GatewayL["Gateway Layer"]
        LB["Load Balancer<br/>(AWS ALB / Envoy)"]
        APIGW["API Gateway<br/>(JWT auth, rate limiting)"]
        WSGW["WebSocket Gateway<br/>(match + chat realtime,<br/>~100K conns per node)"]
    end

    subgraph ServicesL["Service Layer"]
        ProfileSvc["Profile Service"]
        RecoSvc["Recommendation Service<br/>(deck generation)"]
        SwipeSvc["Swipe Ingestion Service"]
        MatchSvc["Match Service"]
        ChatSvc["Chat Service"]
        BoostSvc["Boost / Payments Service"]
        TrustSvc["Trust and Safety Service<br/>(moderation)"]
    end

    subgraph CacheL["Cache Layer (Redis)"]
        RedisDedup["Swipe dedup<br/>bloom filters"]
        RedisDeck["Hot decks<br/>(precomputed stacks)"]
        RedisSess["Sessions +<br/>WS connection registry"]
    end

    subgraph AsyncL["Async Backbone"]
        KafkaSwipes["Kafka<br/>(swipe events topic)"]
        MatchWorkers["Match Workers<br/>(reciprocal-like check)"]
        MLPipe["ML Feature Pipelines<br/>(Flink / Spark)"]
    end

    subgraph DataL["Data Layer"]
        ES["Geosharded Elasticsearch<br/>(user discovery index,<br/>Tinder's real approach)"]
        Cass["Cassandra<br/>(swipes, matches, messages)"]
        PG["PostgreSQL<br/>(accounts, payments)"]
        S3P["S3<br/>(photo originals + renditions)"]
    end

    subgraph MLL["ML Layer"]
        Desir["Desirability / ELO-style<br/>scoring models"]
        PhotoMod["Photo moderation +<br/>face verification models"]
    end

    iOSApp -->|"photo fetch"| CDN
    AndroidApp -->|"photo fetch"| CDN
    CDN --> S3P
    iOSApp -->|"HTTPS"| LB
    AndroidApp -->|"HTTPS"| LB
    iOSApp -.->|"WSS"| WSGW
    AndroidApp -.->|"WSS"| WSGW
    LB --> APIGW

    APIGW -->|"1 deck fetch"| RecoSvc
    RecoSvc -->|"2 hot deck hit"| RedisDeck
    RecoSvc -->|"3 miss: geo fan-out"| ES
    RecoSvc -->|"4 rank"| Desir

    APIGW --> ProfileSvc
    ProfileSvc --> PG
    ProfileSvc --> S3P
    ProfileSvc --> TrustSvc
    APIGW --> BoostSvc
    BoostSvc --> PG

    APIGW -->|"a swipe"| SwipeSvc
    SwipeSvc -->|"b dedup"| RedisDedup
    SwipeSvc -->|"c publish"| KafkaSwipes
    KafkaSwipes -->|"d consume"| MatchWorkers
    KafkaSwipes --> MLPipe
    MatchWorkers -->|"e persist swipe/match"| Cass
    MatchWorkers -->|"f mutual like"| MatchSvc
    MatchSvc -->|"g match push"| WSGW
    MatchSvc --> ChatSvc
    ChatSvc -->|"h messages"| Cass
    ChatSvc --> WSGW
    WSGW --> RedisSess

    MLPipe --> Desir
    MLPipe -->|"index updates"| ES
    TrustSvc --> PhotoMod
    TrustSvc --> KafkaSwipes`,
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
    {
      q: "Two users right-swipe each other at almost the same instant. How do you guarantee exactly one match is created and neither swipe is lost?",
      a: "This is the classic race in swipe systems: A's worker checks 'did B like A?' before B's write lands, and B's worker checks 'did A like B?' before A's write lands -- both see no, and the match is silently lost. Or with a cache-based fast path, both see yes and create duplicate matches. The robust design layers two mechanisms. First, serialize per pair: key the Kafka swipe topic by the normalized pair ID min(A,B) + ':' + max(A,B), so both swipes of any pair land on the same partition and are consumed in order by a single worker -- whichever swipe is processed second is guaranteed to observe the first, eliminating the lost-match interleaving entirely. Second, make match creation idempotent: the match table's primary key is that same deterministic pair ID, and the insert uses a conditional write (Cassandra lightweight transaction, INSERT IF NOT EXISTS), so duplicate detection from redelivery or failover collapses to one row, and the notification fan-out is triggered off the successful insert only. Redis sets remain the low-latency fast path for the reciprocal check, but Cassandra's swipe log is the source of truth -- a Redis-signaled match is confirmed against durable state before the match row is written. Finish by noting the client contract: the swipe HTTP response may say 'match: true' optimistically from the fast path, but the authoritative 'It's a Match' event arrives over the WebSocket from the match service after the durable insert.",
      followUps: [
        "What happens if the Kafka partition owning that pair is lagging during peak -- how stale can match detection get?",
        "How would you backfill matches if a bug dropped reciprocal checks for an hour?",
      ],
    },
    {
      q: "Explain geosharding as Tinder actually implemented it. Why not one global Elasticsearch index?",
      a: "A single global index fails on two axes: every deck query would hit every shard of a 75M-user index (fan-out proportional to cluster size, not to relevance), and hot-city traffic would contend with the whole world's traffic. Tinder's production answer is geosharding: tile the planet with S2 cells, then group cells into shards balanced by active-user count -- a shard might be half of Manhattan or all of Mongolia, because equal user population per shard is what equalizes load, not equal area. Each shard is its own Elasticsearch index containing discovery documents (preferences, age, last-active, desirability features, location) for users physically inside its cells. A deck query computes the S2 cell covering of the user's search radius, routes to only the 1-3 shards owning those cells, executes the filtered query in parallel, and merges results -- so query cost is proportional to local density, not global scale. The moving parts to mention: a routing service maintaining the cell-to-shard map; a mover process that relocates a user's document when a location update crosses a shard boundary (write to new shard, then delete from old -- transient duplication is fine, absence is not); extra replicas on dense-city shards; and periodic rebalancing of the cell-to-shard assignment as populations shift. The property that makes this work is that dating queries are intrinsically local -- no query ever needs cross-planet fan-out, which is exactly the property a social feed system lacks.",
      followUps: [
        "How does the Passport feature (swipe in another city) interact with geosharding?",
        "How do you rebalance shards without downtime when a city's user count doubles?",
      ],
    },
    {
      q: "Walk me through the full request path when a user opens the app until they send a first message to a new match.",
      a: "Open: the client authenticates through the API gateway (JWT validation), and opens a WebSocket to the WS gateway, which records user -> gateway-node in a Redis connection registry. Deck: the recommendation service checks the Redis hot-deck cache; on miss it computes the S2 covering of the user's radius, fans out to the owning Elasticsearch shards with preference filters, excludes seen profiles via the per-user bloom filter, scores candidates with the desirability model, and returns ~200 ranked IDs; the client prefetches the first ~10 profiles' card-size photos from CloudFront. Swipe: each swipe POSTs to swipe ingestion, which checks the dedup bloom filter, acks immediately, and publishes to Kafka keyed by normalized pair ID. Match: a match worker persists the swipe to Cassandra, runs the reciprocal check (Redis fast path, Cassandra confirm), and on a mutual like performs an idempotent conditional insert of the match row keyed by pair ID. Notify: the match service resolves both users through the connection registry and pushes the match event over their WebSockets (APNs/FCM for offline), creating the chat channel keyed by match_id. Message: the first message travels over the sender's WebSocket to the chat service, which validates match membership, persists to Cassandra (partition match_id, clustered by TimeUUID), forwards to the recipient's gateway node, and mirrors the text to the async moderation topic. The design themes to call out: the only synchronous work anywhere is validation plus a fast durable enqueue; everything heavy (deck building, match detection, moderation) is precomputed or asynchronous, which is how the swipe-to-match loop stays under a second at 100K swipes/second peak.",
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
    {
      front: "How is Tinder's discovery index geosharded, and how does a query route?",
      back: "The planet is tiled with S2 cells; cells are grouped into Elasticsearch shards balanced by ACTIVE USER COUNT (not area). A deck query computes the S2 cell covering of the user's radius, routes to only the 1-3 shards owning those cells, runs the filtered query in parallel, and merges results. A mover process relocates a user's document when they cross a shard boundary (write new, then delete old).",
    },
    {
      front: "How do you prevent lost or duplicate matches when two users right-swipe each other simultaneously?",
      back: "Serialize per pair: key the Kafka swipe topic by min(A,B):max(A,B) so both swipes hit one partition and one consumer processes them in order -- the second swipe always sees the first. Then make the match insert idempotent: primary key = deterministic pair ID, written with a conditional insert (Cassandra LWT / INSERT IF NOT EXISTS) so duplicate detection collapses to one row.",
    },
    {
      front: "Why is deck generation precomputed and cached instead of built per request?",
      back: "~1K deck-build QPS at peak, but each build fans out to 1-3 geoshards and scores 1K-10K candidates -- synchronous builds would mean 5-10K shard queries/s and millions of scoring ops/s on the hot path. Precomputing decks into Redis turns the common case into a single O(1) cache read with p99 in milliseconds.",
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
    "Geosharding (Tinder's real approach): S2 cells grouped into Elasticsearch shards balanced by user COUNT, not area. Deck query = compute cell covering of radius -> route to 1-3 owning shards -> parallel filtered query -> merge. Mover process relocates documents across shard boundaries (write-new-then-delete-old). Hot-city shards get extra replicas.",
    "Simultaneous-swipe race: serialize per pair by keying Kafka on min(A,B):max(A,B) so one consumer sees both swipes in order, and make match insert idempotent via deterministic pair-ID primary key with a conditional write (Cassandra LWT). Redis is the fast path; Cassandra swipe log is the source of truth.",
    "Deck generation math: ~20M deck builds/day = ~230 QPS avg, ~1K QPS peak; each build fans out to 1-3 geoshards and scores 1K-10K candidates -- hence precomputed hot decks in Redis, never synchronous builds on the hot path.",
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
    "Photo storage: ~1MB per user (5 photos x 200KB compressed); 75M users = ~75TB originals, ~200-250TB with 3-4 CDN renditions",
    "Deck QPS: ~20M deck builds/day / 86400 = ~230 avg, ~1K peak; each = 1-3 geoshard queries + 1K-10K candidates scored",
    "Pair key for race-free matching: min(A,B) + ':' + max(A,B) -- Kafka partition key AND match-table primary key (INSERT IF NOT EXISTS)",
    "Geoshard balance rule: equal ACTIVE USERS per shard, not equal area; radius query touches 1-3 shards via S2 cell covering",
    "Swipe ingest bandwidth: 100K/s peak x 100B = ~10MB/s -- trivial bytes, the cost is per-event ops (dedup + reciprocal check + durable write)",
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
    {
      term: "Geosharding",
      definition:
        "Partitioning a search index by geographic region so that location-scoped queries touch only the shards covering the query area. Tinder's implementation groups S2 cells into Elasticsearch shards balanced by active-user count, so a radius query routes to 1-3 shards regardless of global scale, and a mover process relocates user documents across shard boundaries as they travel.",
    },
    {
      term: "Lightweight Transaction (LWT)",
      definition:
        "Cassandra's conditional-write mechanism (e.g., INSERT ... IF NOT EXISTS) implemented with Paxos. Used to make match creation idempotent: the match row is keyed by the deterministic pair ID, so concurrent or redelivered match detections collapse into exactly one row instead of duplicates.",
    },
    {
      term: "Connection Registry",
      definition:
        "A Redis mapping of user_id to the WebSocket gateway node currently holding that user's connection. Lets any backend service (match, chat) route a realtime push to the correct gateway node in one lookup; entries carry short-TTL heartbeats so presence and last-seen fall out of the same structure.",
    },
    {
      term: "Trust Ledger",
      definition:
        "A per-user aggregate of moderation signals -- photo verification status, NLP scores on messages, behavioral anomalies, report history -- accumulated over time rather than acted on per event. Graduated thresholds trigger shadow-banning, human review, or hard bans, which catches slow-burn abuse like romance scams that no single message reveals.",
    },
  ],
  animations: [
    {
      title: "Swipe to match",
      steps: [
        {
          label: "Candidate generation",
          detail: "Geospatial index plus filters gives a bounded candidate set; ranking orders it.",
        },
        {
          label: "Deck prefetched",
          detail: "The client holds the next N so swiping never waits on the network.",
        },
        {
          label: "Swipe recorded",
          detail: "Written as `(user, target, direction)`. High write volume, small rows.",
        },
        {
          label: "Match check",
          detail: "On a right-swipe, check whether the target already swiped right on this user.",
        },
        {
          label: "Match created",
          detail: "If so, create the match and notify both. The check must be atomic to avoid a double-create race.",
        },
        {
          label: "Storage shape",
          detail: "Swipes are write-heavy and rarely read individually — a wide-column store partitioned by user fits well.",
        },
      ],
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
    "How would you run this system multi-region -- which components are region-local (geoshards, decks, WebSocket gateways) vs global (accounts, payments), and what happens to in-flight matches during a regional failover?",
    "A celebrity joins and receives 500K right-swipes in an hour, making their inbound-likes set and geoshard a hotspot. How do you keep deck generation and match detection healthy?",
    "How would you degrade gracefully if the geosharded Elasticsearch cluster is unavailable -- can you serve a usable deck from caches alone?",
  ],
  resources: [
    {
      label: "Tinder System Design - ByteByteGo", url: "https://bytebytego.com/",
      kind: "article",
      note: "Comprehensive overview of Tinder's architecture including geospatial indexing, matching algorithm, and scaling challenges",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing are directly applicable to the swipe ingestion and chat pipelines",
    },
    {
      label: "S2 Geometry Library - Google Open Source", url: "https://s2geometry.io/",
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
