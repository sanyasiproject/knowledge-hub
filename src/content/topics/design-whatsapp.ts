import type { TopicContent } from "../types";

export const designWhatsapp: TopicContent = {
  quickSummary: [
    "WhatsApp serves ~2 billion users exchanging ~100 billion messages daily. The architecture relies on persistent XMPP-derived connections, where each user maintains a long-lived TCP session to a connection server. Messages are transiently stored on servers only until delivered, following a store-and-forward model that minimizes data at rest.",
    "End-to-end encryption (E2EE) uses the Signal Protocol, built on the X3DH (Extended Triple Diffie-Hellman) key agreement and Double Ratchet algorithm. The server never possesses plaintext messages or private keys; it acts purely as a relay. Each message uses a unique symmetric key derived from the ratcheting chain, providing forward secrecy.",
    "Message delivery guarantees use a three-state acknowledgment model: sent (single grey check), delivered (double grey check), and read (double blue check). The server assigns a globally unique message ID and persists messages in a per-user queue until the recipient acknowledges receipt, handling multi-device sync and offline scenarios.",
    "Group messaging fans out encrypted messages to each member individually. For a group of N members, the sender encrypts the message N-1 times using pairwise Signal sessions. Sender Keys optimize this: the sender distributes a symmetric Sender Key to all members, then encrypts the group message once with that key, reducing CPU cost from O(N) encryptions to O(1) plus key distribution.",
    "Media sharing decouples content from metadata. The sender encrypts the media file locally with a random AES-256 key, uploads the ciphertext to a CDN, then sends the AES key and CDN URL as an E2EE message. The recipient downloads from the CDN and decrypts locally, ensuring the CDN never sees plaintext media.",
  ],
  detailed: [
    "## High-Level Architecture\n\nWhatsApp's architecture is organized into several layers: connection servers, message routing, transient storage, media storage, and auxiliary services (presence, push notifications, key distribution). Connection servers maintain persistent TCP/TLS connections with clients using a custom binary protocol derived from XMPP. Each connection server handles hundreds of thousands of concurrent connections, and consistent hashing maps each user's phone number hash to a primary connection server. A global load balancer distributes initial connections, and DNS-based geo-routing directs users to the nearest data center. The message routing layer uses an internal pub/sub system: when user A sends a message to user B, A's connection server publishes to a routing service that looks up B's connection server in a distributed registry (backed by Mnesia or a similar in-memory store) and forwards the message. If B is offline, the message is persisted in a per-user queue in a high-throughput database. WhatsApp historically ran on Erlang/OTP, leveraging its lightweight process model to handle millions of concurrent connections with low latency and high fault tolerance.",
    "## Capacity Estimation: Working the Numbers\n\nStart every WhatsApp design with back-of-envelope math, because the numbers dictate the architecture.\n\n### Message throughput\n\n- 2B users, ~100B messages/day.\n- 100,000,000,000 / 86,400 s ≈ **1.16M messages/second average**.\n- Peak factor ×3 (evening hours, New Year's Eve spikes) → design for **~3.5M messages/second**.\n- Each message generates ~3 additional small frames (server ack, delivery receipt, read receipt), so the gateway tier actually handles **~10-14M frames/second at peak**.\n\n### Connection fleet\n\n- Assume 1B concurrently connected devices (roughly half the user base online at any moment).\n- WhatsApp famously ran **~1-2M persistent connections per server** on FreeBSD + Erlang, each connection costing only ~2KB of memory in an Erlang process.\n- 1,000,000,000 / 1,500,000 ≈ **~700 gateway servers** for the entire connected fleet — a strikingly small number, which is why the Erlang connection model is the headline fact of this design.\n\n### Offline queue storage\n\n- Assume 25% of destined recipients are offline at send time → ~25B messages/day pass through the offline queue.\n- Average encrypted payload ~1KB incl. metadata → **~25TB/day of transient queue writes**.\n- Messages are deleted on delivery ack; median residency is minutes, so steady-state queue size is a few TB replicated ×3 — small enough that a Cassandra/HBase-style cluster of a few dozen nodes suffices.\n\n### Media\n\n- If ~5% of messages carry media at ~200KB average: 5B × 200KB = **~1PB/day into blob storage**, which is why media must bypass the messaging path and go straight to S3/CDN.\n\nKey insight: messaging is a small-payload, high-fanout, connection-bound problem. The bottleneck is concurrent connections and per-message fan-out work, not storage — the store-and-forward model keeps data at rest tiny because delivered messages are deleted.\n\nCommon mistake: sizing a permanent message database for 100B messages/day. WhatsApp does not durably store delivered messages server-side; history lives in the client's local SQLite database.",
    "## Acknowledgments: What the Ticks Actually Mean\n\nThe tick marks are a visible contract about which hop has acknowledged the message, and interviewers love asking exactly where each one fires.\n\n- **Single grey tick (sent)**: the sender's gateway durably accepted the message and returned a server ack. The recipient may know nothing yet. If you kill the sender's app now, the message still delivers.\n- **Double grey tick (delivered)**: the recipient's *device* wrote the message to its local store and sent a delivery ack back through the routing layer. The user may not have seen it.\n- **Double blue tick (read)**: the recipient opened the conversation; the client emits a read receipt (a watermark, not per-message, to save traffic).\n\nEach receipt is itself a tiny message flowing the reverse path, deduplicated by message ID, with monotonic state transitions (Sent → Delivered → Read, never backward).\n\nFor example, if Bob's phone is off, Alice sees a single tick indefinitely: the server has the ciphertext queued, but no device ack exists yet.\n\nIn practice: read receipts are batched as a per-conversation watermark timestamp — \"everything up to T is read\" — turning O(messages) receipts into O(1) per chat open.\n\nCommon mistake: saying the single tick means \"delivered to the recipient's server region\" or similar. It means exactly one thing: the origin server accepted and persisted the message.",
    "## Message Delivery Pipeline and Ordering\n\nThe message lifecycle follows these steps: (1) the sender's client encrypts the message using the Signal Protocol session with the recipient, (2) the encrypted payload is sent over the persistent connection to the sender's connection server, (3) the server assigns a server-side timestamp and unique message ID, (4) the routing layer forwards the message to the recipient's connection server or enqueues it for offline delivery, (5) the recipient's connection server pushes the message to the client, (6) the client sends a delivery acknowledgment back, (7) the server removes the message from the queue and forwards the delivery receipt to the sender. Message ordering within a conversation uses the server-assigned timestamp combined with a per-conversation sequence counter. Since messages between two users always flow through deterministic routing, ordering is straightforward. For reliability, the system uses at-least-once delivery semantics with client-side deduplication based on message ID. If the delivery acknowledgment is lost, the server will retry delivery, and the client silently drops duplicates. The retry policy uses exponential backoff with jitter, starting at 1 second and capping at 5 minutes.",
    "## End-to-End Encryption Design\n\nWhatsApp implements the Signal Protocol for E2EE. Each device generates a long-term Identity Key pair (Curve25519), a medium-term Signed Pre-Key (rotated weekly), and a batch of one-time Pre-Keys (ephemeral Curve25519 pairs uploaded to the server). When Alice wants to message Bob for the first time, she fetches Bob's public key bundle from the key distribution server and performs the X3DH key agreement: she computes four ECDH shared secrets using combinations of her Identity Key, an ephemeral key, and Bob's Identity Key, Signed Pre-Key, and one-time Pre-Key. These four secrets are fed into HKDF to derive a shared root key that initializes the Double Ratchet. The Double Ratchet then derives a new symmetric key for every message, providing forward secrecy (compromising one key does not reveal past messages) and break-in recovery (future keys are safe even if current state is compromised). The server stores only public keys and encrypted message blobs; it never sees plaintext. Key verification uses a Safety Number, a hash of both parties' Identity Keys displayed as a QR code or 60-digit number that users can compare out-of-band.",
    "## Group Messaging and Sender Keys\n\nGroup chats initially used pairwise Signal sessions, meaning a message to a 256-member group required 255 separate encryptions. This was CPU-intensive and bandwidth-heavy. The Sender Keys optimization addresses this: when a user joins a group, each existing member sends that user a Sender Key message (encrypted via the pairwise session). The Sender Key contains a symmetric chain key and a signing key. To send a group message, the sender encrypts once with their Sender Key chain (which ratchets forward after each message) and signs the ciphertext. The server fans out this single ciphertext to all group members, who decrypt with the sender's Sender Key. When a member leaves, all remaining members generate new Sender Keys and redistribute them, ensuring the departed member cannot decrypt future messages. Group membership changes trigger key rotation. The server enforces group size limits (1024 members) and rate limits on group creation and membership changes to prevent abuse.",
    "## Media, Presence, and Push Notifications\n\nMedia handling is designed so that large files never transit through the message routing layer. The sender generates a random 256-bit AES key and a random IV, encrypts the media file (image, video, document) using AES-256-CBC, computes an HMAC-SHA256 over the ciphertext, and uploads the encrypted blob to a CDN. The sender then sends a regular E2EE message containing the CDN URL, AES key, IV, HMAC, and a thumbnail (also encrypted). The recipient downloads from the CDN, verifies the HMAC, and decrypts locally. Media files are stored with a TTL (typically 30 days on server) and re-uploaded if needed. Presence (online, last seen, typing) is managed by a dedicated presence service. Clients send heartbeats every 10 seconds; absence of a heartbeat for 30 seconds triggers an offline transition. Typing indicators are ephemeral events sent only to users currently viewing the conversation and are rate-limited to one event per 3 seconds. Push notifications for offline users are sent via APNs (iOS) and FCM (Android). The push payload contains only metadata (sender ID, message count) and never the message content, preserving E2EE guarantees.",
    "## Trace: One 1:1 Message End-to-End\n\nWalking a single message through the system is the fastest way to prove you understand the design.\n\n1. Alice types \"hi\" to Bob. Her client generates a client-side message ID (device ID + monotonic counter), derives the next message key from her Double Ratchet chain with Bob, and encrypts.\n2. The ciphertext frame goes out over her existing persistent TCP/TLS connection to her chat gateway (no new connection, no HTTP handshake — this is why latency is ~100ms).\n3. The gateway persists the message and returns a server ack → **single grey tick**.\n4. The messaging service asks the session registry (Redis/Mnesia-style in-memory map): \"which gateway holds Bob's connection?\"\n5. **Online path**: registry returns gateway G7; the message is forwarded to G7, which pushes it down Bob's open socket. Bob's client stores it in local SQLite, decrypts, and sends a delivery ack → **double grey tick** for Alice.\n6. **Offline path**: registry has no entry for Bob; the message is written to Bob's per-user queue in the Cassandra/HBase-style store, and the push bridge sends a content-free APNs/FCM notification (\"You have a new message\"). When Bob reconnects, his client syncs with a last-message-ID cursor, drains the queue in batches, acks, and the server deletes the queued entries.\n7. Bob opens the chat → read receipt watermark flows back → **blue ticks**.\n\nKey insight: the server never touched plaintext at any step; it routed opaque blobs and bookkept acknowledgments.",
    "## Trace: One Group Message End-to-End\n\nGroup delivery adds one encryption step and a server-side fan-out, and the division of labor is exactly what interviewers probe.\n\n1. Alice sends to a 200-member group. Her client encrypts **once** with her Sender Key chain (symmetric ratchet) and signs the ciphertext — not 199 pairwise encryptions.\n2. The single ciphertext travels to her gateway with the group ID.\n3. The group service resolves the membership list (cached, backed by the metadata store) and hands the messaging service 199 delivery tasks — **fan-out happens server-side on ciphertext**, which is safe because every member already holds Alice's Sender Key.\n4. For each member, the same online/offline branch as 1:1 applies: forward to their gateway if connected, else enqueue + push. A group send is effectively 199 independent 1:1 deliveries of identical bytes.\n5. Delivery and read receipts are aggregated: the group UI shows \"delivered to all / read by all\" only when every member's watermark has advanced, and receipts are batched to avoid an O(N×M) receipt storm.\n6. If a member is removed, every remaining member rotates their Sender Key and redistributes it over pairwise Signal sessions before the next message — the removed member can never decrypt future traffic.\n\nFor example, a 100-message burst in a 1024-member group generates ~100K delivery tasks but only 100 encryptions on the sender's phone — that asymmetry is the entire point of Sender Keys.\n\nCommon mistake: proposing client-side fan-out (sender uploads N copies). That burns the sender's battery and bandwidth O(N) and breaks on flaky mobile uplinks; server-side fan-out of a single signed ciphertext is strictly better once Sender Keys exist.",
  ],
  deepDive: [
    "## E2EE Key Hierarchy and Threat Model\n\nUnderstanding *which key defends against what* is the difference between reciting Signal and reasoning about it. The hierarchy, from most to least permanent: **Identity Key** (Curve25519, generated at install, the device's cryptographic identity — compromise means full impersonation, which is why Safety Number verification hashes both identity keys), **Signed Pre-Key** (rotated weekly, signed by the identity key so a malicious server cannot substitute its own), **One-Time Pre-Keys** (a batch of ~100 uploaded to the server, each consumed by exactly one session initiation — they let Alice start a session while Bob is offline, the asynchronous property that makes mobile messaging work), then per-session **root/chain/message keys** from the Double Ratchet, and **Sender Keys** for groups. The defensive framing per property: *forward secrecy* (ratchet deletes message keys after use) protects past messages if a device is seized today; *break-in recovery* (DH ratchet re-randomizes on each turn) protects future messages after a temporary compromise ends; *deniability* (X3DH produces no signature over message content) means transcripts cannot cryptographically prove authorship to a third party. The server's honest-but-curious threat is neutralized because it stores only public keys and ciphertext; the remaining attack surface is the key distribution step itself — a malicious server could hand Alice a fake bundle for Bob, which is exactly what out-of-band Safety Number comparison detects.\n\nKey insight: E2EE moves the trust boundary from the server to the key-distribution step. Every remaining attack on WhatsApp's crypto is some variant of \"trick a client into encrypting to the wrong public key.\"\n\nWarning: in an interview, keep this defensive and conceptual — explain what the protocol protects against, not how to attack it.",
    "## Message Ordering and Idempotency\n\nExactly-once delivery is impossible over a lossy network, so WhatsApp builds an exactly-once *illusion* from at-least-once delivery plus idempotent receivers. The client generates the message ID (device ID + monotonically increasing counter, e.g. `3EB0-9F4A-000042`) *before* first transmission — this is the idempotency key. If the server ack is lost and the client retransmits, the server recognizes the duplicate ID and acks without re-enqueueing; if server-side delivery retries race a slow device ack, the recipient recognizes the duplicate ID in its local SQLite store and silently drops it. Ordering is layered: within one sender-recipient pair, the sender's counter plus FIFO per-user queues give natural order; across senders in a group, the server timestamp at the sender's gateway is the tiebreaker, and clients render by that timestamp while tolerating late arrivals (a message can slot in above newer ones after a sync). WhatsApp deliberately chooses **per-conversation causal-ish ordering, not global ordering** — there is no consensus round per message, because a Paxos/Raft commit per message at 3.5M msg/s would be absurd. The Double Ratchet adds a second ordering constraint: message keys are derived sequentially from a chain, so out-of-order arrival forces the receiver to fast-forward the chain and cache skipped message keys (bounded, ~1000) to decrypt stragglers later.\n\nKey insight: idempotency key generated at the *client* is what makes every retry safe end-to-end; a server-assigned ID cannot deduplicate the first hop's retransmissions.\n\nCommon mistake: proposing Lamport clocks or a global sequencer for chat ordering. Per-conversation ordering with client counters plus server timestamps is sufficient, and users tolerate (and rarely notice) cross-sender interleaving anomalies.",
    "## Group Fan-Out: Server-Side vs Client-Side\n\nWho makes the N copies of a group message is a genuine trade-off, and WhatsApp's answer differs from, say, iMessage's. **Client-side fan-out** (sender encrypts pairwise and uploads N ciphertexts) maximizes cryptographic isolation — no shared group key exists — but costs the sender O(N) CPU, O(N) uplink bandwidth on the weakest link in the system (a mobile radio), and fails partially when the upload dies at member 130 of 256. **Server-side fan-out** (sender uploads one blob, server replicates to N queues) costs O(1) at the sender and moves replication to the datacenter where bandwidth is cheap, but requires all members to share a decryption capability — hence Sender Keys. WhatsApp uses pairwise (client-side) crypto only for the *key distribution* messages and server-side fan-out for the *content*. The remaining costs: membership changes are the expensive operation (leave → N-1 new Sender Keys, each distributed pairwise → O(N²) messages in the worst churn case), which motivates the 1024-member cap and batched rotations; and the server learns group metadata (who is in which group, message timing/sizes) even though content is opaque — a deliberate, documented trade-off. For very large fan-out (Channels/broadcast at 1M+ followers), the model flips again to a pub/sub tree with relaxed encryption guarantees, because per-follower queues stop making sense.\n\nIn practice: WhatsApp caps groups at 1024 because Sender Key rotation cost and receipt aggregation both scale with N; communities and channels use different delivery primitives rather than stretching the group machinery.",
    "## Media Pipeline: Encrypt-Then-Upload and Thumbnails\n\nThe media path is a textbook 'separate the control plane from the data plane' design. Sending a 40MB video: (1) the client transcodes/compresses locally, (2) generates a random 256-bit AES key + IV, encrypts with AES-256-CBC, computes HMAC-SHA256 over the ciphertext (encrypt-then-MAC), (3) uploads the encrypted blob over HTTPS directly to blob storage (S3-style) fronted by a CDN — never through the chat gateways, whose Erlang processes are tuned for thousands of tiny frames, not megabyte streams, (4) sends a normal E2EE chat message containing only the tiny control record: blob URL, AES key, IV, HMAC, file hash, size, and an encrypted ~10KB thumbnail. The recipient renders the thumbnail instantly from the message itself (this is why you see a blurry preview before the download finishes), then fetches the ciphertext from the nearest CDN edge, verifies the HMAC before decrypting (reject-then-decrypt prevents padding-oracle-style games), and decrypts locally. Two clever optimizations: **deduplication by ciphertext hash** — when the same encrypted blob is forwarded, clients re-send only the key record and the CDN serves the already-uploaded blob, so a viral video is stored once, not a million times; and **TTL-based garbage collection** (~30 days) with client-triggered re-upload if a late reader requests expired media.\n\nKey insight: the CDN can cache and dedupe aggressively precisely because it only ever sees ciphertext — E2EE and CDN economics coexist because the key travels on a different channel than the bytes.\n\nCommon mistake: sending media through the message routing layer 'for simplicity'. That turns a 1KB-frame system into a mixed workload, destroys gateway memory behavior, and is the first thing an interviewer will flag.",
    "## Signal Protocol: Double Ratchet Internals\n\nThe Double Ratchet combines a Diffie-Hellman ratchet with a symmetric key ratchet. Each time a message is sent or received, the symmetric chain ratchets forward using HMAC-based key derivation: the current chain key is fed into HMAC-SHA256 to produce both the next chain key and a message key. The message key encrypts that specific message and is then deleted. The DH ratchet advances when the conversation turn changes: if Alice was sending and now Bob replies, Bob includes a new ephemeral DH public key in his message header. Alice performs a DH computation with this new key and her current ratchet key, deriving a new root key and new sending/receiving chain keys. This means that even if an attacker compromises the current chain state, they can only decrypt messages until the next DH ratchet step, which re-randomizes all derived keys. The protocol handles out-of-order messages by allowing the receiver to store skipped message keys (up to a configurable maximum, typically 1000) indexed by the DH ratchet generation and chain index. This is critical for unreliable mobile networks where UDP-like reordering can occur at the application layer. The protocol also supports header encryption: the DH ratchet public key and chain index in the message header are encrypted with a header key derived from the previous root key, preventing metadata leakage about the ratchet state.",
    "## Consistent Hashing and Connection Server Routing\n\nWhatsApp routes users to connection servers using consistent hashing on the user's phone number. The hash ring is divided into virtual nodes (typically 150-200 vnodes per physical server) to ensure even distribution. When a connection server joins or leaves the cluster, only 1/N of the key space is remapped, minimizing disruption. Each user's primary connection server is the first node clockwise from their hash position, with the next two nodes serving as replicas for the user's offline message queue. The routing registry (historically Mnesia in Erlang, a distributed in-memory database with strong consistency within a data center) maps each online user to their connection server's address. Lookups are sub-millisecond. Cross-data-center routing uses a federation layer: each data center maintains its own hash ring and routing registry, and a global directory service (updated asynchronously with ~1 second propagation delay) maps user ID ranges to data centers. When user A in DC-East messages user B in DC-West, the routing layer detects the cross-DC case and forwards via a dedicated inter-DC message bus with TLS encryption and message batching for throughput optimization. Failure detection uses a phi-accrual failure detector that adapts its suspicion threshold based on historical heartbeat intervals, reducing false positives during network jitter.",
    "## Offline Message Queue and Multi-Device Sync\n\nOffline messages are stored in a per-user queue backed by a log-structured storage engine optimized for sequential writes and prefix scans. Each queue entry contains the encrypted message blob, server timestamp, message ID, and sender ID. The queue is partitioned by user ID hash, and each partition is replicated across three storage nodes using chain replication for strong consistency. When a user reconnects, the client sends a sync request containing the last received message ID (or server timestamp) for each conversation. The server scans the queue and streams all messages newer than the cursor, batching them into chunks of 50 messages for flow control. The client acknowledges each batch, and the server deletes acknowledged messages. For multi-device support (WhatsApp Web, WhatsApp Desktop), each linked device maintains its own encryption session with every contact. The primary phone acts as the encryption oracle during initial device linking via QR code: it re-encrypts message history for the new device. Once linked, each device independently maintains Signal Protocol sessions and receives messages directly. However, the primary phone must be online periodically to keep the linked devices active, enforced by a 14-day timeout. Message history sync between devices uses the primary phone as the source of truth, streaming encrypted history to linked devices over a local encrypted channel during initial setup.",
    "## Rate Limiting, Spam Prevention, and Abuse Detection\n\nAt WhatsApp's scale, abuse prevention requires multiple layers of defense. Rate limiting is applied at the connection server level: each user is limited to N messages per minute (varying by account age, verification status, and historical behavior). A token bucket algorithm with per-user buckets enforces this, with burst allowance of 2x the sustained rate. Forwarded messages are tracked with a forwarding counter embedded in the message metadata (not in plaintext, but as a flag the client sets). Messages forwarded more than 5 times are marked with a double-arrow icon and restricted to forwarding to only 1 chat at a time, dramatically reducing viral misinformation spread. Spam detection uses behavioral signals rather than content analysis (since the server cannot read E2EE messages): abnormal message volume, rapid contact enumeration, sending to many non-contacts, account age, and device fingerprinting. Machine learning models trained on these signals classify accounts as spam with high precision. Accounts flagged as spam are first shadow-limited (messages delivered with delays) before being banned, to avoid tipping off sophisticated spammers. Phone number verification via SMS or voice call is the primary gate against mass account creation, supplemented by device attestation (SafetyNet on Android, DeviceCheck on iOS).",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Simplified X3DH key agreement for initiating an E2EE session between Alice and Bob",
      source: `#include <cstdint>
#include <array>
#include <vector>

// Simplified type aliases for illustration
using PrivateKey = std::array<uint8_t, 32>;
using PublicKey  = std::array<uint8_t, 32>;
using SharedSecret = std::array<uint8_t, 32>;
using DerivedKey = std::array<uint8_t, 32>;

// Placeholder cryptographic primitives
SharedSecret curve25519_dh(const PrivateKey& priv, const PublicKey& pub);
DerivedKey hkdf_derive(const uint8_t* input, size_t len, const char* info);

struct KeyBundle {
    PublicKey identity_key;       // Long-term public key (IK)
    PublicKey signed_pre_key;     // Medium-term signed pre-key (SPK)
    PublicKey one_time_pre_key;   // Ephemeral one-time pre-key (OPK)
};

struct X3DHResult {
    DerivedKey shared_key;        // Root key for Double Ratchet init
    PublicKey  ephemeral_public;  // Alice's ephemeral public key (sent to Bob)
};

// Alice initiates a session with Bob using his published key bundle.
// Four DH computations provide mutual authentication and forward secrecy:
//   DH1 = DH(Alice_IK, Bob_SPK)      -> mutual authentication
//   DH2 = DH(Alice_EK, Bob_IK)       -> Alice proves freshness
//   DH3 = DH(Alice_EK, Bob_SPK)      -> key agreement core
//   DH4 = DH(Alice_EK, Bob_OPK)      -> one-time forward secrecy
X3DHResult x3dh_initiate(
    const PrivateKey& alice_identity_priv,
    const KeyBundle&  bob_bundle)
{
    // Generate Alice's ephemeral key pair for this session
    PrivateKey alice_eph_priv;  // = generate_random_key();
    PublicKey  alice_eph_pub;   // = derive_public(alice_eph_priv);

    // Four ECDH shared secrets
    SharedSecret dh1 = curve25519_dh(alice_identity_priv, bob_bundle.signed_pre_key);
    SharedSecret dh2 = curve25519_dh(alice_eph_priv,      bob_bundle.identity_key);
    SharedSecret dh3 = curve25519_dh(alice_eph_priv,      bob_bundle.signed_pre_key);
    SharedSecret dh4 = curve25519_dh(alice_eph_priv,      bob_bundle.one_time_pre_key);

    // Concatenate all four DH outputs
    std::vector<uint8_t> combined;
    combined.reserve(128);
    combined.insert(combined.end(), dh1.begin(), dh1.end());
    combined.insert(combined.end(), dh2.begin(), dh2.end());
    combined.insert(combined.end(), dh3.begin(), dh3.end());
    combined.insert(combined.end(), dh4.begin(), dh4.end());

    // Derive the root key via HKDF
    DerivedKey root_key = hkdf_derive(combined.data(), combined.size(),
                                       "WhatsAppX3DH");

    return { root_key, alice_eph_pub };
}`,
    },
    {
      language: "cpp",
      caption:
        "Message delivery acknowledgment state machine tracking sent, delivered, and read states",
      source: `#include <cstdint>
#include <string>
#include <unordered_map>
#include <chrono>
#include <stdexcept>

enum class DeliveryState : uint8_t {
    Pending     = 0,   // Queued locally, not yet sent to server
    Sent        = 1,   // Server acknowledged receipt (single grey check)
    Delivered   = 2,   // Recipient device acknowledged (double grey check)
    Read        = 3,   // Recipient opened the chat (double blue check)
    Failed      = 4    // Delivery failed after max retries
};

struct MessageStatus {
    std::string message_id;
    DeliveryState state;
    int retry_count;
    int64_t last_attempt_ms;    // Unix timestamp in milliseconds
    int64_t state_changed_ms;

    static constexpr int MAX_RETRIES = 5;
    static constexpr int64_t BASE_BACKOFF_MS = 1000;
    static constexpr int64_t MAX_BACKOFF_MS = 300000;  // 5 minutes

    MessageStatus(const std::string& id)
        : message_id(id), state(DeliveryState::Pending),
          retry_count(0), last_attempt_ms(0), state_changed_ms(0) {}

    // State transitions are strictly monotonic: Pending->Sent->Delivered->Read
    // The only backward transition is to Failed from Pending or Sent.
    bool transition(DeliveryState new_state, int64_t now_ms) {
        // Validate transition
        if (state == DeliveryState::Failed) return false;
        if (state == DeliveryState::Read)   return false;

        if (new_state == DeliveryState::Failed) {
            if (state != DeliveryState::Pending && state != DeliveryState::Sent)
                return false;
        } else if (static_cast<uint8_t>(new_state)
                   <= static_cast<uint8_t>(state)) {
            return false;  // No backward transitions
        }

        state = new_state;
        state_changed_ms = now_ms;
        return true;
    }

    // Exponential backoff with jitter for retry scheduling
    int64_t next_retry_delay_ms() const {
        if (retry_count >= MAX_RETRIES) return -1;  // Give up
        int64_t backoff = BASE_BACKOFF_MS * (1LL << retry_count);
        if (backoff > MAX_BACKOFF_MS) backoff = MAX_BACKOFF_MS;
        // Add jitter: +/- 25% (simplified; real impl uses random)
        return backoff;
    }

    bool should_retry(int64_t now_ms) const {
        if (state != DeliveryState::Pending && state != DeliveryState::Sent)
            return false;
        if (retry_count >= MAX_RETRIES) return false;
        int64_t delay = next_retry_delay_ms();
        return (now_ms - last_attempt_ms) >= delay;
    }

    void record_attempt(int64_t now_ms) {
        last_attempt_ms = now_ms;
        retry_count++;
    }
};

// Manages delivery state for all messages in a conversation
class DeliveryTracker {
    std::unordered_map<std::string, MessageStatus> messages_;

public:
    void track(const std::string& msg_id) {
        messages_.emplace(msg_id, MessageStatus(msg_id));
    }

    bool on_server_ack(const std::string& msg_id, int64_t now_ms) {
        auto it = messages_.find(msg_id);
        if (it == messages_.end()) return false;
        return it->second.transition(DeliveryState::Sent, now_ms);
    }

    bool on_delivered(const std::string& msg_id, int64_t now_ms) {
        auto it = messages_.find(msg_id);
        if (it == messages_.end()) return false;
        return it->second.transition(DeliveryState::Delivered, now_ms);
    }

    bool on_read(const std::string& msg_id, int64_t now_ms) {
        auto it = messages_.find(msg_id);
        if (it == messages_.end()) return false;
        return it->second.transition(DeliveryState::Read, now_ms);
    }

    // Bulk read receipt: mark all messages up to a watermark as read
    void on_read_watermark(int64_t watermark_ms, int64_t now_ms) {
        for (auto& [id, status] : messages_) {
            if (status.state_changed_ms <= watermark_ms &&
                status.state != DeliveryState::Read &&
                status.state != DeliveryState::Failed) {
                status.transition(DeliveryState::Read, now_ms);
            }
        }
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Consistent hashing ring for routing users to connection servers with virtual nodes",
      source: `#include <cstdint>
#include <map>
#include <string>
#include <vector>
#include <functional>
#include <stdexcept>

// MurmurHash3 finalizer for 64-bit hash (simplified)
uint64_t hash_key(const std::string& key) {
    uint64_t h = 0xcbf29ce484222325ULL;
    for (char c : key) {
        h ^= static_cast<uint64_t>(c);
        h *= 0x100000001b3ULL;
    }
    return h;
}

struct ServerNode {
    std::string server_id;     // e.g., "conn-server-042"
    std::string datacenter;    // e.g., "us-east-1"
    int current_connections;
    int max_connections;

    bool has_capacity() const {
        return current_connections < max_connections;
    }
};

class ConsistentHashRing {
    // Sorted map: hash position -> server ID
    std::map<uint64_t, std::string> ring_;
    std::map<std::string, ServerNode> servers_;
    int vnodes_per_server_;

public:
    explicit ConsistentHashRing(int vnodes_per_server = 150)
        : vnodes_per_server_(vnodes_per_server) {}

    // Add a server with N virtual nodes spread across the ring
    void add_server(const ServerNode& server) {
        servers_[server.server_id] = server;
        for (int i = 0; i < vnodes_per_server_; i++) {
            std::string vnode_key = server.server_id + "#" + std::to_string(i);
            uint64_t pos = hash_key(vnode_key);
            ring_[pos] = server.server_id;
        }
    }

    // Remove a server and all its virtual nodes
    void remove_server(const std::string& server_id) {
        for (int i = 0; i < vnodes_per_server_; i++) {
            std::string vnode_key = server_id + "#" + std::to_string(i);
            uint64_t pos = hash_key(vnode_key);
            ring_.erase(pos);
        }
        servers_.erase(server_id);
    }

    // Find the server responsible for a given user (by phone number hash)
    std::string route_user(const std::string& phone_number) const {
        if (ring_.empty()) {
            throw std::runtime_error("No servers in ring");
        }
        uint64_t user_hash = hash_key(phone_number);

        // Find first node clockwise from user's hash position
        auto it = ring_.lower_bound(user_hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // Wrap around the ring
        }
        return it->second;
    }

    // Find N distinct servers for replication (primary + replicas)
    std::vector<std::string> route_with_replicas(
        const std::string& phone_number, int replica_count) const
    {
        if (ring_.empty()) {
            throw std::runtime_error("No servers in ring");
        }
        uint64_t user_hash = hash_key(phone_number);
        auto it = ring_.lower_bound(user_hash);
        if (it == ring_.end()) it = ring_.begin();

        std::vector<std::string> result;
        auto start = it;
        do {
            // Avoid duplicate servers (different vnodes, same server)
            bool already_selected = false;
            for (const auto& s : result) {
                if (s == it->second) { already_selected = true; break; }
            }
            if (!already_selected) {
                result.push_back(it->second);
                if (static_cast<int>(result.size()) >= replica_count)
                    break;
            }
            ++it;
            if (it == ring_.end()) it = ring_.begin();
        } while (it != start);

        return result;
    }

    size_t server_count() const { return servers_.size(); }
    size_t ring_size()   const { return ring_.size(); }
};`,
    },
  ],
  diagrams: [
    {
      title: "WhatsApp High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered architecture showing the online delivery path (sender gateway to recipient gateway, numbered 1-7) and the offline path (persist to per-user queue plus push notification, numbered O1-O5). Media and key exchange bypass the message routing layer entirely.",
      mermaid: `graph TB
    subgraph CL["Clients"]
        SND["Sender App<br/>local SQLite store + E2E keys"]
        RCV["Recipient App<br/>local SQLite store + E2E keys"]
    end
    subgraph EDGE["Edge / Gateway"]
        LB1["L4 Load Balancer<br/>DNS geo-routing"]
        GW1["Chat Gateway 1<br/>Erlang, XMPP-derived protocol<br/>persistent TCP connections"]
        GW2["Chat Gateway 2<br/>1-2M connections per box"]
    end
    subgraph SVC["Services"]
        REG["Session / Connection Registry"]
        MSG["Messaging Service<br/>routing + receipts"]
        GRP["Group Service<br/>membership + fan-out"]
        PRS["Presence / Last-Seen Service"]
        MED["Media Service"]
        PSH["Push Notification Bridge"]
    end
    subgraph ASYNC["Async"]
        OFQ["Per-User Offline Message Queues"]
        KFK["Kafka<br/>async pipelines: receipts,<br/>metrics, abuse signals"]
    end
    subgraph DATA["Data"]
        CAS["Cassandra / HBase-style store<br/>offline queue + metadata"]
        RDS["Redis<br/>session registry cache"]
        BLB["S3 / Blob Store<br/>media encrypted client-side"]
    end
    subgraph SEC["Security"]
        KEYS["Signal Key Server<br/>identity keys + prekey bundles"]
    end
    subgraph EXT["External"]
        APNS["APNs / FCM"]
    end

    SND -->|"1. TLS over TCP"| LB1
    LB1 -->|"2. route to gateway"| GW1
    RCV ---|"persistent connection"| GW2
    SND -.->|"fetch prekey bundle X3DH"| KEYS
    GW1 -->|"3. ciphertext message"| MSG
    MSG -->|"4. where is recipient?"| REG
    REG -->|"5. session lookup"| RDS
    MSG -->|"6. online path: forward"| GW2
    GW2 -->|"7. push over open socket"| RCV
    MSG -->|"O1. offline path: enqueue"| OFQ
    OFQ -->|"O2. persist"| CAS
    OFQ -->|"O3. notify"| PSH
    PSH -->|"O4. push request"| APNS
    APNS -.->|"O5. wake device, no content"| RCV
    MSG --> KFK
    GW1 --> GRP
    GRP -->|"fan out ciphertext per member"| MSG
    GW1 --> PRS
    SND -->|"upload encrypted blob"| MED
    MED --> BLB
    RCV -.->|"download + decrypt locally"| MED`,
    },
    {
      title: "Message Delivery Sequence",
      kind: "sequence",
      caption:
        "Complete message lifecycle showing encryption, delivery, and acknowledgment flow",
      mermaid: `sequenceDiagram
    participant A as Alice Client
    participant CS1 as Connection Server 1
    participant R as Message Router
    participant Q as Offline Queue
    participant CS2 as Connection Server 2
    participant B as Bob Client

    A->>A: Encrypt with Signal Protocol
    A->>CS1: Send encrypted message
    CS1->>CS1: Assign msgID and timestamp
    CS1->>A: Server ACK - single check
    CS1->>R: Route to recipient
    R->>R: Lookup Bob in registry
    alt Bob is online
        R->>CS2: Forward message
        CS2->>B: Push via WebSocket
        B->>B: Decrypt message
        B->>CS2: Delivery ACK
        CS2->>R: Forward delivery ACK
        R->>CS1: Delivery receipt
        CS1->>A: Delivered - double check
        B->>CS2: Read receipt
        CS2->>CS1: Read receipt
        CS1->>A: Read - blue double check
    else Bob is offline
        R->>Q: Enqueue message
        Q->>Q: Trigger push notification
        Note over Q,B: Bob reconnects later
        B->>CS2: Sync request with last msgID
        CS2->>Q: Fetch queued messages
        Q->>CS2: Return pending messages
        CS2->>B: Deliver batch
        B->>CS2: Batch delivery ACK
    end`,
    },
    {
      title: "Delivery State Machine",
      kind: "state",
      caption:
        "Valid state transitions for message delivery acknowledgment tracking",
      mermaid: `stateDiagram-v2
    [*] --> Pending: Message created
    Pending --> Sent: Server ACK received
    Pending --> Failed: Max retries exceeded
    Sent --> Delivered: Recipient device ACK
    Sent --> Failed: Max retries exceeded
    Delivered --> Read: Recipient opens chat
    Failed --> [*]
    Read --> [*]

    note right of Pending: Queued locally
    note right of Sent: Single grey check
    note right of Delivered: Double grey check
    note right of Read: Double blue check`,
    },
    {
      title: "E2EE Key Exchange Flow",
      kind: "flow",
      caption:
        "X3DH key agreement followed by Double Ratchet initialization for a new session",
      mermaid: `flowchart TD
    A[Alice wants to message Bob] --> B[Fetch Bobs key bundle from server]
    B --> C[Bundle contains IK SPK OPK]
    C --> D1[DH1: Alice IK x Bob SPK]
    C --> D2[DH2: Alice EK x Bob IK]
    C --> D3[DH3: Alice EK x Bob SPK]
    C --> D4[DH4: Alice EK x Bob OPK]
    D1 --> E[Concatenate DH1 DH2 DH3 DH4]
    D2 --> E
    D3 --> E
    D4 --> E
    E --> F[HKDF to derive Root Key]
    F --> G[Initialize Double Ratchet]
    G --> H[Derive sending chain key]
    H --> I[Encrypt first message]
    I --> J[Send encrypted msg plus Alice EK public]
    J --> K[Bob performs same DH computations]
    K --> L[Bob derives same Root Key]
    L --> M[Bob initializes Double Ratchet]
    M --> N[Decrypt message]`,
    },
  ],
  interviewQA: [
    {
      q: "How does WhatsApp achieve end-to-end encryption while still supporting offline message delivery?",
      a: "WhatsApp uses the Signal Protocol where encryption and decryption happen entirely on client devices. The server only stores and forwards opaque encrypted blobs. When Bob is offline, the server queues the encrypted message in Bob's offline queue. It cannot read the message because it only possesses public keys, never private keys. When Bob reconnects, his client fetches the encrypted messages and decrypts them locally. The server never needs to decrypt or re-encrypt messages. Push notifications for offline users contain only metadata like sender ID and message count, never message content. This design means the server is a pure relay and storage node for ciphertext.",
      followUps: [
        "What happens if Bob's one-time pre-keys are exhausted on the server?",
        "How does the system handle key changes when a user reinstalls the app?",
        "What is the Security Code Change notification and when does it trigger?",
      ],
    },
    {
      q: "How does WhatsApp handle message delivery guarantees and what do the check marks represent?",
      a: "WhatsApp uses a three-phase acknowledgment protocol. When the sender's client transmits the encrypted message, the connection server assigns a unique message ID and server timestamp, then returns a server ACK which triggers the single grey check mark on the sender's UI. The server then routes the message to the recipient's connection server. When the recipient's device receives and stores the message, it sends a delivery ACK back through the routing layer, which triggers the double grey check. Finally, when the recipient actually opens the conversation and the message is displayed, a read receipt is sent, triggering the double blue check. Each transition is idempotent and monotonic: the state can only move forward. If any ACK is lost, the system retries with exponential backoff. The sender's client tracks per-message state and deduplicates receipts by message ID.",
      followUps: [
        "How does the read receipt watermark optimization reduce traffic compared to per-message receipts?",
        "What happens if the user disables read receipts in privacy settings?",
      ],
    },
    {
      q: "How does WhatsApp scale its connection layer to handle 2 billion users?",
      a: "WhatsApp uses Erlang/OTP for its connection servers, leveraging Erlang's lightweight process model where each connected user is a separate Erlang process consuming only ~2KB of memory. A single server can handle over 2 million concurrent connections. Consistent hashing maps users to connection servers based on phone number hash, with 150+ virtual nodes per server for even distribution. The routing registry, historically backed by Mnesia (an in-memory distributed database in the Erlang ecosystem), maps online users to their connection server addresses with sub-millisecond lookups. Geo-routing via DNS directs users to the nearest data center, and cross-DC routing uses a federation layer with an inter-DC message bus. Connection server failures are handled gracefully: clients reconnect within seconds to a different server, re-authenticate, and sync missed messages from the offline queue.",
      followUps: [
        "Why did WhatsApp choose Erlang over alternatives like Go or Java for their connection layer?",
        "How does the system handle thundering herd problems when a connection server fails?",
      ],
    },
    {
      q: "How does WhatsApp handle group messaging efficiently with end-to-end encryption?",
      a: "Group messaging initially required the sender to encrypt the message N-1 times for each group member using pairwise Signal sessions. This was O(N) in CPU and bandwidth. The Sender Keys optimization reduces this to O(1) for the common case. Each group member generates a Sender Key consisting of a symmetric chain key and an Ed25519 signing key. The Sender Key is distributed to each group member via the existing pairwise encrypted channel. To send a group message, the sender encrypts once with their Sender Key (which ratchets forward after each message to provide forward secrecy within the group), signs the ciphertext, and sends a single copy to the server. The server fans out the ciphertext to all members. When a member leaves, all remaining members must generate and redistribute new Sender Keys to ensure the departed member cannot decrypt future messages. This key rotation is the main overhead of membership changes.",
      followUps: [
        "What is the maximum group size and why does that limit exist?",
        "How do group admin privileges affect the encryption model?",
      ],
    },
    {
      q: "How does WhatsApp handle media sharing while maintaining end-to-end encryption?",
      a: "Media files are too large to send through the message routing layer, so WhatsApp decouples media encryption from media transport. The sender generates a random 256-bit AES key and a random initialization vector, encrypts the media file locally using AES-256-CBC, computes an HMAC-SHA256 integrity tag over the ciphertext, and uploads the encrypted blob to a CDN. The sender then sends a regular E2EE message through the normal message path containing the CDN URL, the AES key, the IV, the HMAC, the file size, and an encrypted thumbnail for preview. The recipient downloads the encrypted blob from the CDN, verifies the HMAC to ensure integrity, and decrypts locally. The CDN never sees the plaintext because it only handles ciphertext. Media files on the CDN have a TTL (typically 30 days) and are garbage-collected after expiry. If a recipient tries to access expired media, the app requests the sender to re-upload.",
    },
    {
      q: "Walk me through the capacity estimation for WhatsApp. What are the key numbers and what do they imply architecturally?",
      a: "Start from 2B users and ~100B messages/day. Dividing by 86,400 seconds gives ~1.16M messages/second average; applying a peak factor of 3 means designing for ~3.5M messages/second, and since every message spawns roughly three receipt frames (server ack, delivered, read), the gateways see 10M+ frames/second at peak. For connections, assume ~1B concurrently online devices; at WhatsApp's famous 1-2M persistent connections per Erlang server, the entire connected fleet needs only ~700 gateway boxes. Offline storage is small because it is transient: if 25% of recipients are offline, ~25B messages/day hit the queue at ~1KB each, about 25TB/day of writes, but median queue residency is minutes and entries are deleted on ack, so steady-state data at rest is a few TB replicated three ways. Media dominates raw bytes (5% of messages at ~200KB is ~1PB/day), which is exactly why it goes directly to blob storage/CDN and never through the chat path. The architectural implications: the system is connection-bound and fan-out-bound, not storage-bound; optimize for cheap persistent connections and fast in-memory routing lookups, and keep delivered messages off the server entirely.",
      followUps: [
        "How would the numbers change if you had to support server-stored full message history?",
        "What breaks first if traffic grows 10x: gateways, the routing registry, or the offline queue?",
      ],
    },
    {
      q: "How does WhatsApp guarantee a message is neither lost nor duplicated, given retries at every hop?",
      a: "It layers at-least-once delivery with idempotent receivers keyed on a client-generated message ID. The sender's client creates the ID (device ID plus a monotonic counter) before first transmission, so if the server ack is lost and the client retransmits, the server recognizes the duplicate and acks without re-enqueueing. Downstream, if the server retries delivery because a device ack was slow, the recipient's client finds the ID already in its local SQLite store and silently drops the duplicate. Durability comes from persisting the message at the gateway before acking (single tick), replicating the offline queue across nodes, and only deleting queue entries after an explicit device ack. The result is an exactly-once illusion built from at-least-once transport plus deduplication, which is the standard answer for any messaging system: true exactly-once across a lossy network is impossible, but idempotency makes retries harmless. The critical detail interviewers look for is that the idempotency key must be generated at the client, because a server-assigned ID cannot deduplicate retransmissions on the first hop.",
      followUps: [
        "Where exactly can a duplicate still surface to the user, and why is it acceptable?",
        "How does the Double Ratchet complicate out-of-order and duplicate handling?",
      ],
    },
    {
      q: "How does WhatsApp's multi-device architecture work without breaking end-to-end encryption?",
      a: "Each linked device (phone, WhatsApp Web, Desktop) is a first-class cryptographic endpoint with its own identity key and its own Signal sessions with every contact — there is no shared private key and the server never proxies plaintext. When Alice sends to Bob, her client actually encrypts the message separately for each of Bob's registered devices (and for her own other devices, so her Web session shows her sent messages), fanning out per-device ciphertexts. Device linking is bootstrapped by the primary phone: scanning the QR code establishes a secure channel over which the phone vouches for the new device's identity key and streams encrypted history to it. The companion device list is signed by the primary phone's key, so the server cannot silently attach a surveillance device — clients verify the signed device list before encrypting to it, and contacts see a security notification when the list changes. Trade-offs to mention: per-device fan-out multiplies encryption and delivery cost by the device count (capped at 4-5 companions), and consistency across devices relies on each device independently receiving and acking its copy from its own per-device queue.",
      followUps: [
        "Why did WhatsApp move from the phone-as-proxy model to true multi-device?",
        "How do read receipts and typing indicators stay consistent across a user's devices?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In WhatsApp's X3DH key agreement, how many Diffie-Hellman computations does the initiator perform?",
      options: [
        "Two: one with the identity key and one with the ephemeral key",
        "Three: one each with identity, signed pre-key, and ephemeral key",
        "Four: using combinations of identity, ephemeral, signed pre-key, and one-time pre-key",
        "One: a single DH between both parties identity keys",
      ],
      answerIndex: 2,
      explanation:
        "X3DH performs four DH computations: DH(Alice_IK, Bob_SPK), DH(Alice_EK, Bob_IK), DH(Alice_EK, Bob_SPK), and DH(Alice_EK, Bob_OPK). These four secrets are concatenated and fed into HKDF to derive the shared root key. Each computation serves a distinct purpose: mutual authentication, freshness proof, key agreement, and one-time forward secrecy.",
    },
    {
      q: "What is the primary benefit of the Sender Keys optimization in WhatsApp group messaging?",
      options: [
        "It eliminates the need for end-to-end encryption in groups",
        "It reduces encryption cost from O(N) per-member encryptions to O(1) per message",
        "It allows the server to decrypt and re-encrypt group messages",
        "It removes the need for key rotation when members leave",
      ],
      answerIndex: 1,
      explanation:
        "Without Sender Keys, each group message must be individually encrypted for each of N-1 members using pairwise sessions. With Sender Keys, the sender encrypts once with a symmetric key shared with all members. Key rotation is still required when members leave to maintain forward secrecy, but the per-message cost drops from O(N) to O(1).",
    },
    {
      q: "How does WhatsApp ensure the CDN cannot access plaintext media files?",
      options: [
        "The CDN uses TLS to protect files in transit",
        "The sender encrypts media locally with a random AES key and sends the key via E2EE message separately",
        "The server re-encrypts media before storing on the CDN",
        "Media files are split into chunks stored across multiple CDNs",
      ],
      answerIndex: 1,
      explanation:
        "The sender encrypts media locally with a random AES-256 key before uploading to the CDN. The decryption key, IV, and HMAC are sent as part of a regular E2EE message through the message routing layer. The CDN only handles ciphertext and never possesses the decryption key. This separates the transport of the bulk data (via CDN) from the transport of the secret key (via E2EE message channel).",
    },
    {
      q: "When a WhatsApp connection server fails, what prevents message loss for users who were connected to it?",
      options: [
        "Messages are stored in client local storage only",
        "The offline queue stores unacknowledged messages and clients re-sync on reconnection to a new server",
        "Messages are broadcast to all connection servers simultaneously",
        "The failed server automatically restarts before messages expire",
      ],
      answerIndex: 1,
      explanation:
        "Messages in transit are persisted in the offline queue (replicated across storage nodes) once the server accepts them. If a connection server fails, clients detect the broken connection and reconnect to a different server via the load balancer. On reconnection, the client sends its last received message ID, and the server streams any queued messages from the offline queue. The at-least-once delivery semantics with client-side deduplication ensures no message is lost.",
    },
  ],
  flashcards: [
    {
      front: "What protocol does WhatsApp use for end-to-end encryption?",
      back: "The Signal Protocol, which combines X3DH (Extended Triple Diffie-Hellman) for initial key agreement with the Double Ratchet algorithm for ongoing message encryption. It provides forward secrecy and break-in recovery.",
    },
    {
      front: "What do the three check mark states represent in WhatsApp?",
      back: "Single grey check = message sent (server ACK). Double grey check = message delivered (recipient device ACK). Double blue check = message read (recipient opened conversation). State transitions are monotonic and irreversible.",
    },
    {
      front: "How does the Sender Keys optimization reduce group message encryption cost?",
      back: "Instead of encrypting a group message N-1 times (once per member), the sender distributes a symmetric Sender Key to all members via pairwise channels. Group messages are then encrypted once with the Sender Key. Cost drops from O(N) to O(1) per message. Keys are rotated when members leave.",
    },
    {
      front: "How does WhatsApp handle media sharing with E2EE?",
      back: "The sender encrypts media locally with a random AES-256 key, uploads ciphertext to a CDN, then sends the AES key and CDN URL as a regular E2EE message. The CDN never sees plaintext. The recipient downloads from CDN and decrypts locally.",
    },
    {
      front: "What is the Double Ratchet and why does it provide forward secrecy?",
      back: "The Double Ratchet combines a DH ratchet (new key exchange per turn) with a symmetric ratchet (HMAC-based chain key derivation per message). Each message uses a unique key that is deleted after use. Compromising one message key does not reveal past messages because previous keys cannot be derived from the current state.",
    },
    {
      front: "How does WhatsApp route messages to the correct connection server?",
      back: "Consistent hashing on the user's phone number maps each user to a connection server. A routing registry (Mnesia-backed in-memory store) tracks which server holds each online user's connection. Virtual nodes (150+ per server) ensure even key distribution across the ring.",
    },
    {
      front: "What happens when a WhatsApp user reconnects after being offline?",
      back: "The client sends a sync request with the last received message ID per conversation. The server scans the offline queue and streams all messages newer than the cursor in batches of 50. The client ACKs each batch and the server deletes delivered messages. At-least-once semantics with client-side dedup prevents loss or duplication.",
    },
    {
      front: "How does WhatsApp detect and limit spam without reading message content?",
      back: "Since E2EE prevents content inspection, spam detection relies on behavioral signals: abnormal message volume, rapid contact enumeration, sending to many non-contacts, account age, and device fingerprinting. ML models classify accounts using these signals. Forwarded message counters limit viral spread.",
    },
    {
      front: "What is the headline capacity math for WhatsApp?",
      back: "100B messages/day / 86,400s = ~1.16M msg/s average, ~3.5M/s at 3x peak. ~1B concurrent connections at 1-2M per Erlang server means only ~700 gateway boxes. Offline queue writes ~25TB/day but transient (deleted on delivery ack); media ~1PB/day goes straight to blob storage/CDN.",
    },
    {
      front: "Why must the message idempotency key be generated by the client, not the server?",
      back: "The first hop (client to server) can also be retried when the server ack is lost. Only an ID that exists before first transmission lets the server recognize that retransmission as a duplicate. Server-assigned IDs would create a new message per retry on that hop.",
    },
    {
      front: "How does true multi-device work without a shared private key?",
      back: "Every linked device has its own identity key and its own Signal sessions. Senders encrypt each message separately for each of the recipient's devices (and their own other devices). The primary phone signs the device list, so the server cannot secretly attach a device; contacts' clients verify the list before encrypting.",
    },
  ],
  exercises: [
    "Design the offline message queue: define the data schema (message ID, user ID, encrypted blob, timestamp, retry count), choose a storage engine (LSM-tree vs B-tree), define the replication strategy (chain replication vs Raft), and calculate storage requirements for 500 million offline users each with an average of 50 pending messages of 1KB each.",
    "Implement a Double Ratchet simulator: build a simplified version that tracks DH ratchet steps and symmetric chain ratchets between two parties. Show how encrypting 10 messages from Alice, then 5 from Bob, then 3 from Alice produces unique keys for each message. Demonstrate that knowing message key #8 does not allow deriving keys #1-7.",
    "Design the group membership change protocol: when a member is removed from a 200-person group, describe the exact sequence of operations for Sender Key rotation. Calculate the number of pairwise encrypted key distribution messages required. Propose an optimization for large groups where multiple members leave in quick succession (batch key rotation).",
    "Build a consistent hashing simulator for the connection server layer: implement the hash ring with virtual nodes, simulate adding and removing servers, and measure key redistribution percentage. Compare 50, 150, and 300 virtual nodes per server for distribution evenness across 10 million users. Plot the standard deviation of per-server load.",
    "Design the read receipt aggregation system: in a group chat with 500 members, sending individual read receipts for every message creates O(N*M) traffic for N members and M messages. Design a batching and watermarking scheme that reduces this to O(N) per sync interval. Define the sync interval, batch format, and conflict resolution for out-of-order receipts.",
  ],
  revisionNotes: [
    "WhatsApp handles ~100B messages/day for ~2B users using Erlang-based connection servers that each manage 2M+ concurrent TCP connections with ~2KB memory per process.",
    "Signal Protocol = X3DH (4 DH computations for initial key agreement) + Double Ratchet (DH ratchet per turn + symmetric chain ratchet per message). Server never sees plaintext.",
    "X3DH four secrets: DH(Alice_IK, Bob_SPK), DH(Alice_EK, Bob_IK), DH(Alice_EK, Bob_SPK), DH(Alice_EK, Bob_OPK). Concatenated and fed into HKDF for root key.",
    "Three-state delivery: Pending -> Sent (server ACK, single grey) -> Delivered (device ACK, double grey) -> Read (user opened, double blue). Transitions are monotonic. Failed state on max retries.",
    "Group Sender Keys: distribute symmetric key via pairwise sessions, encrypt group messages once O(1) instead of O(N). Rotate all keys when any member leaves.",
    "Media encryption: random AES-256 key generated per file, ciphertext uploaded to CDN, key sent via E2EE message. CDN never possesses plaintext.",
    "Consistent hashing with 150+ vnodes/server routes users to connection servers. Mnesia routing registry provides sub-ms lookups for online user locations.",
    "Offline queue uses log-structured storage with chain replication across 3 nodes. Sync on reconnect uses last-message-ID cursor with batched delivery of 50 messages per chunk.",
    "Presence via 10-second heartbeats, 30-second offline timeout. Typing indicators are ephemeral, rate-limited to 1 per 3 seconds, sent only to active conversation viewers.",
    "Spam detection without content: behavioral signals (volume, contact patterns, account age, device fingerprint). Forwarded messages tracked with counter; 5+ forwards restricted to 1 chat at a time.",
    "Capacity math: 100B msgs / 86,400s ≈ 1.16M msg/s average, ~3.5M/s peak (×3); ~1B concurrent connections / 1.5M per box ≈ ~700 gateway servers; offline queue ~25TB/day transient writes, deleted on ack.",
    "Idempotency: client-generated message ID (device ID + monotonic counter) makes every retry safe — server dedups on enqueue, recipient dedups against local SQLite. Exactly-once illusion from at-least-once + dedup.",
    "Fan-out split: pairwise (client-side) crypto for Sender Key distribution only; server-side fan-out of one signed ciphertext for content. Client-side content fan-out wastes O(N) mobile uplink.",
    "Multi-device: each device has its own identity key and Signal sessions; sender encrypts per device; device list signed by primary phone so the server cannot inject a hidden device.",
    "Named tech map: Erlang/FreeBSD gateways, Mnesia/Redis-style session registry, Cassandra/HBase-style offline queue, Kafka-style async pipelines, S3 + CDN for client-encrypted media, APNs/FCM push bridge.",
  ],
  cheatSheet: [
    "Protocol: custom binary over TCP/TLS (XMPP-derived). WebSocket as fallback. Full-duplex persistent connections.",
    "Encryption: Signal Protocol = X3DH + Double Ratchet. Forward secrecy + break-in recovery. Server is blind relay.",
    "Key types: Identity Key (permanent), Signed Pre-Key (weekly rotation), One-Time Pre-Keys (ephemeral, consumed on first message).",
    "Delivery states: Pending -> Sent -> Delivered -> Read. Monotonic transitions. Exponential backoff retry with 5 max attempts.",
    "Group optimization: Sender Keys reduce per-message encryption from O(N) to O(1). Key rotation on membership change.",
    "Media: client-side AES-256 encryption, upload ciphertext to CDN, send key via E2EE message. CDN sees only ciphertext.",
    "Routing: consistent hashing on phone number, 150 vnodes/server, Mnesia registry for connection lookup, cross-DC federation.",
    "Storage: Erlang/Mnesia for routing state, LSM-based store for offline queues, CDN for media. Messages deleted after delivery.",
    "Scale numbers: ~2B users, ~100B msgs/day, 2M connections/server, ~2KB/connection, 1024 max group size.",
    "Anti-spam: behavioral ML (no content access), forwarding counter with 5+ restriction, phone verification, device attestation.",
    "Capacity: 100B/day ≈ 1.16M msg/s avg, ~3.5M/s peak; ~700 gateways at 1.5M conns each; queue writes ~25TB/day but transient; media ~1PB/day to blob store.",
    "Idempotency key = client-generated message ID; at-least-once transport + dedup at server and recipient = exactly-once illusion. Ordering is per-conversation, never global.",
    "Multi-device: per-device identity keys and sessions, sender encrypts per device, signed device list blocks server-injected devices, 4-5 companion cap.",
  ],
  glossary: [
    {
      term: "X3DH (Extended Triple Diffie-Hellman)",
      definition:
        "A key agreement protocol that uses four Diffie-Hellman computations to establish a shared secret between two parties who may be asynchronously offline. It provides mutual authentication, forward secrecy, and deniability.",
    },
    {
      term: "Double Ratchet",
      definition:
        "A key management algorithm that combines a Diffie-Hellman ratchet (new key pair per conversation turn) with a symmetric-key ratchet (HMAC chain per message) to derive a unique encryption key for each message, providing forward secrecy and break-in recovery.",
    },
    {
      term: "Sender Key",
      definition:
        "A symmetric key distributed to group members via pairwise encrypted channels, used to encrypt group messages with O(1) cost instead of O(N) per-member encryption. Rotated when group membership changes.",
    },
    {
      term: "Forward Secrecy",
      definition:
        "A property of a cryptographic protocol where compromising the current session key does not allow decryption of past session communications. In WhatsApp, achieved by the Double Ratchet deleting each message key after use.",
    },
    {
      term: "Store-and-Forward",
      definition:
        "A messaging pattern where the server stores a message temporarily and forwards it to the recipient when they are available. WhatsApp uses this for offline delivery, storing encrypted blobs until the recipient reconnects.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A distributed hashing technique where adding or removing a node changes the mapping for only 1/N of the keys. Used in WhatsApp to assign users to connection servers with minimal disruption during scaling events.",
    },
    {
      term: "Mnesia",
      definition:
        "An Erlang-native distributed real-time database that stores data in-memory with optional disk persistence. WhatsApp uses it for the routing registry that maps online users to their connection server addresses.",
    },
    {
      term: "Prekey Bundle",
      definition:
        "The set of public keys (Identity Key, Signed Pre-Key, one One-Time Pre-Key) a client uploads to the server so that others can initiate an E2EE session with it asynchronously, even while it is offline. Fetching a bundle is the first step of X3DH.",
    },
    {
      term: "Idempotency Key",
      definition:
        "A client-generated unique identifier (device ID plus monotonic counter in WhatsApp) attached to a message before first transmission, allowing every hop to detect and discard retried duplicates. It converts at-least-once delivery into an exactly-once illusion.",
    },
    {
      term: "Fan-Out",
      definition:
        "Replicating one logical message into N physical deliveries, one per recipient or device. WhatsApp performs fan-out server-side on ciphertext (enabled by Sender Keys for groups and per-device sessions for multi-device), keeping the sender's cost O(1).",
    },
    {
      term: "Break-In Recovery",
      definition:
        "The Double Ratchet property that a temporarily compromised session heals itself: the next DH ratchet turn re-randomizes the root key, so an attacker who captured current state cannot decrypt messages after the next key exchange.",
    },
  ],
  animations: [
    {
      title: "End-to-end delivery with receipts",
      steps: [
        {
          label: "A sends",
          detail: "Message encrypted on A's device; the server never sees plaintext.",
        },
        {
          label: "Server stores and routes",
          detail: "Persisted until delivered, then routed to B's connected node.",
        },
        {
          label: "Single tick",
          detail: "Server received it.",
        },
        {
          label: "Double tick",
          detail: "Delivered to B's device, which acknowledges.",
        },
        {
          label: "Blue ticks",
          detail: "B opened the chat and the read receipt propagated back.",
        },
        {
          label: "B offline",
          detail: "Message queues server-side and a push notification is sent; delivered when B reconnects.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Pairwise Signal Sessions",
      "Sender Keys",
      "Server-Side Encryption",
      "No Encryption",
    ],
    rows: [
      [
        "Per-message encryption cost",
        "O(N) for group of N",
        "O(1) after key distribution",
        "O(1) server encrypts once",
        "O(0) no encryption overhead",
      ],
      [
        "Forward secrecy",
        "Per-message via Double Ratchet",
        "Per-message via chain ratchet",
        "Per-session only via TLS",
        "None",
      ],
      [
        "Server reads content",
        "No, server is blind relay",
        "No, server is blind relay",
        "Yes, server holds keys",
        "Yes, plaintext on server",
      ],
      [
        "Key rotation on member leave",
        "Not needed, sessions are pairwise",
        "Required, all members regen keys",
        "Server re-keys internally",
        "Not applicable",
      ],
      [
        "Bandwidth for group of 256",
        "255x message size per send",
        "1x message size per send",
        "1x message size per send",
        "1x message size per send",
      ],
      [
        "Offline key exchange",
        "X3DH with pre-keys on server",
        "Pairwise session for key distribution",
        "Server handles all keys",
        "Not applicable",
      ],
    ],
  },
  followUps: [
    "How would you add end-to-end encrypted backups, where the user can restore chat history on a new device without the server accessing plaintext?",
    "How would you design the multi-device architecture so that WhatsApp Web and Desktop work without the phone being online?",
    "What changes are needed to support disappearing messages with guaranteed deletion across all devices and the server?",
    "How would you design a system to detect and prevent account takeover via SIM swap attacks on the phone verification system?",
    "How would you implement encrypted search over message history without the server indexing plaintext?",
    "How would you scale presence and typing indicators for a user with 10,000 contacts, most of whom are online simultaneously?",
    "How would you design broadcast Channels with millions of followers, and why does the per-user offline queue model stop working there?",
    "How would you handle a region-wide gateway datacenter outage so that 100M affected users reconnect without a thundering herd?",
    "How would you add message reactions and edits while preserving E2EE and the existing receipt model?",
  ],
  resources: [
    {
      label: "WhatsApp Encryption Technical White Paper",
      kind: "docs",
      note: "Official document describing the Signal Protocol integration, X3DH, Double Ratchet, and Sender Keys as implemented in WhatsApp.",
    },
    {
      label: "The Signal Protocol: Technical Documentation",
      kind: "docs",
      note: "Detailed specification of X3DH key agreement and Double Ratchet algorithm by Open Whisper Systems.",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapters on replication, partitioning, and stream processing directly applicable to WhatsApp's message routing and storage architecture.",
    },
    {
      label: "WhatsApp Engineering at Scale - Rick Reed InfoQ Talk",
      kind: "video",
      note: "Talk by WhatsApp engineer on how Erlang/OTP enables 2M+ connections per server and the operational architecture behind WhatsApp's backend.",
    },
    {
      label: "libsignal-protocol-c - Signal Foundation",
      kind: "repo",
      note: "Open-source C implementation of the Signal Protocol used as reference for understanding X3DH and Double Ratchet internals.",
    },
  ],
};
