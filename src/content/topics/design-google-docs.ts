import type { TopicContent } from "../types";

export const designGoogleDocs: TopicContent = {
  quickSummary: [
    "Google Docs enables real-time collaborative editing by propagating each user's keystrokes to all participants over persistent WebSocket connections, resolving conflicts so every client converges to the same document state.",
    "Operational Transformation (OT) is the classic approach: a central server receives operations from clients, transforms them against concurrent operations to preserve user intent, and broadcasts the canonical result -- this is what Google Docs uses in production.",
    "Conflict-free Replicated Data Types (CRDTs) offer a decentralized alternative where every operation commutes by construction, eliminating the need for a central transformation server -- used by Figma and the Yjs/Automerge ecosystem.",
    "Documents are stored as a sequence of revisions; each revision captures a delta (insert, delete, format) plus metadata (author, timestamp, revision ID), enabling full version history, undo, and time-travel replay.",
    "Presence indicators (cursor positions, selection highlights, avatar badges) are ephemeral state broadcast over the same WebSocket channel but handled separately from the durable document model to avoid polluting the revision log.",
  ],
  detailed: [
    `## System Overview

A collaborative document editor must solve four problems simultaneously: (1) extremely low-latency local editing -- the user must never wait for the server before seeing their own keystrokes; (2) convergence -- all clients must reach the same document state; (3) intent preservation -- if Alice inserts at position 5 while Bob deletes position 3, Alice's character should appear at the correct shifted position; (4) scalability -- the system must support millions of documents with dozens of concurrent editors each.

The architecture follows a client-server model. Each client maintains a local copy of the document and applies operations optimistically. Operations are sent to a central collaboration server over a persistent WebSocket connection. The server serializes operations into a total order, transforms them as needed, and broadcasts the transformed operations to all other clients. A separate storage layer persists snapshots and revision deltas to a distributed database (Google uses Colossus/Bigtable internally; an external design would use something like Cloud Spanner or DynamoDB).

Key insight: every document is sharded to exactly one authoritative session server at a time. That single server owns the op sequencer and transform engine for the document, which makes convergence trivial to reason about -- there is one total order per document, established in one place.`,

    `## Capacity Estimation

Back-of-envelope math grounds the design and shows why per-document single-writer sequencing scales.

**Write throughput.** Assume 10M concurrent active editors worldwide, each producing ~1 operation/second while typing (keystrokes are batched into ops). That is 10M ops/s globally. Each op is ~100 bytes (component list, base revision, author, doc ID), so op-log ingest is 10M x 100 B = 1 GB/s, or roughly 86 TB/day of raw operation log across the fleet.

**Log growth and compaction.** Raw logs are compacted aggressively: a snapshot is taken every N ops (say N = 1,000). A 100 KB document snapshot every 1,000 ops replaces ~100 KB of log with one snapshot plus a short tail, and old deltas beyond the history-retention window are merged. Effective retained storage is closer to a few TB/day after compaction and compression.

**Why one server per document works.** A document rarely has more than ~50 simultaneous collaborators. At 50 editors x 1 op/s, a single document sees at most ~50 ops/s -- trivial for a single-threaded sequencer that does an O(pending) transform and one log append per op. The load problem is horizontal, not vertical: with an average of ~2 editors per active document, 10M editors means ~5M active documents producing ~10M ops/s in aggregate. If one session server sustains ~10K ops/s, it can own ~5,000 active documents, so the fleet needs on the order of 1,000 session servers -- sharded by document ID via consistent hashing, with a directory service mapping docId to its current authoritative server.

**Fan-out.** Each accepted op is broadcast to the other collaborators: 10M ops/s x ~1-2 recipients on average = 10-20M messages/s across the WebSocket gateway tier -- this is why presence and broadcast go through a pub/sub fan-out layer rather than the sequencer itself.

Common mistake: candidates try to make the OT engine itself distributed or multi-leader per document. That reintroduces the notoriously hard TP2 correctness problem. Scale across documents (millions of independent shards), never within one document.`,

    `## Operational Transformation (OT)

OT was invented at Xerox PARC in 1989 and is the algorithm family behind Google Docs, Apache Wave, and Microsoft Office Online. The core idea: when two operations are generated concurrently (neither has seen the other's effect), a **transform function** adjusts one operation's parameters so it can be applied after the other while preserving both users' intent.

For a text document, the two basic operations are Insert(pos, char) and Delete(pos). The transform function T(op1, op2) returns a modified op1' such that applying op2 then op1' produces the same result as applying op1 then op2'. For example, if op1 = Insert(5, 'A') and op2 = Delete(3), then op1' = Insert(4, 'A') because the deletion shifted all positions after 3 leftward by one.

Google's OT implementation uses the Jupiter protocol (Nichols et al., 1995), which maintains a **state space graph** per client-server pair. Each node in the graph represents a document state, and edges represent operations. The server maintains one state vector per client, ensuring it can always find the correct transformation path. This centralized approach avoids the complexity of distributed OT (dOT), which requires transformation properties (TP1/TP2) that are notoriously difficult to satisfy correctly.`,

    `## CRDTs as an Alternative

**Conflict-free Replicated Data Types** take a fundamentally different approach: instead of transforming operations after the fact, they design the data structure so that all operations commute naturally. For collaborative text, the two main CRDT approaches are:

- **Sequence CRDTs** (e.g., RGA, LSEQ, Logoot): each character is assigned a unique, immutable identifier that determines its position. Inserts create a new ID between two existing IDs; deletes mark a character as a tombstone. Because IDs are unique and the ordering is deterministic, all replicas converge without a central server.
- **Tree CRDTs** (e.g., Automerge): model the document as a tree of operations where each operation references its causal predecessor, forming a DAG. Concurrent operations are merged by deterministic tie-breaking rules (e.g., lexicographic comparison of actor IDs).

CRDTs trade off metadata overhead (every character carries a unique ID, tombstones accumulate) for true peer-to-peer capability and offline-first editing. Yjs achieves practical performance by using run-length encoding and a block-based structure that compresses the ID space. For a Google Docs design, CRDTs are a valid choice if the system needs strong offline support or peer-to-peer sync; OT with a central server is simpler when you already have reliable server infrastructure.`,

    `## Real-Time Sync, Presence, and Offline Support

The WebSocket connection carries two categories of messages: **document operations** (inserts, deletes, format changes) and **ephemeral state** (cursor positions, selection ranges, user presence). Document operations are persisted and transformed; ephemeral state is broadcast-only and dropped if the client disconnects.

Each client runs a state machine with three states: **Synchronized** (no pending operations), **AwaitingConfirm** (one operation sent, awaiting server acknowledgment), and **AwaitingConfirmWithBuffer** (one operation in flight plus one buffered locally). This three-state model (from CodeMirror's collab extension) prevents the client from flooding the server while still allowing low-latency local editing.

**Offline editing** is supported by queuing operations locally and replaying them when the connection is restored. The server must transform the queued operations against any operations it received from other clients during the offline period. For long offline sessions, this can produce a large transformation chain; in practice, the system periodically takes a snapshot and rebases the offline operations against it. CRDTs handle offline editing more naturally because operations are designed to merge without a server.`,

    `## Storage, Version History, and Access Control

Documents are stored in two forms: **snapshots** (the full document at a point in time) and **deltas** (individual operations with metadata). A snapshot is taken every N operations (e.g., every 100 or 1000 revisions) or when the document is idle. To reconstruct any historical version, the system loads the nearest prior snapshot and replays deltas forward.

Version history is presented as a timeline of named revisions. Each revision records the author, timestamp, and the set of deltas since the previous revision. The system auto-groups nearby edits by the same author into a single revision (e.g., grouping all edits within a 30-second window) to avoid cluttering the history with individual keystrokes.

Access control uses a capabilities-based model: each document has an ACL listing viewers, commenters, and editors. The collaboration server checks permissions on every incoming operation. Link-sharing generates a capability token embedded in the URL. For enterprise deployments, the ACL integrates with an organization's identity provider (SAML/OIDC), and audit logs track all access and edits for compliance.`,
  ],
  deepDive: [
    `## Transform Intuition: A Concrete Two-User Example

The transform function exists to answer one question: "this operation was created against an older document -- where should it land now?" Walk through the canonical two-user insert case.

Both Alice and Bob start from the document "CAT" at revision 5. Alice types 'H' at position 1, intending "CHAT". Concurrently, Bob types 'S' at position 3, intending "CATS". Both apply locally and optimistically: Alice sees "CHAT", Bob sees "CATS".

Alice's op reaches the server first and becomes revision 6; the document is now "CHAT". Bob's Insert(3, 'S') then arrives, stamped base=5 -- it was created before Bob saw Alice's insert. Applying it verbatim to "CHAT" would produce "CHAST": Bob's 'S' lands inside the word instead of at the end, silently corrupting his intent. So the server transforms: Alice inserted at position 1, which is at or before Bob's position 3, so every position at or after 1 shifted right by one. Bob's op becomes Insert(4, 'S'), the document becomes "CHATS", and the transformed op is broadcast. Alice's client applies Insert(4, 'S') to its "CHAT" and also gets "CHATS". Bob's client receives Alice's Insert(1, 'H') and transforms it against his own pending op (no shift needed since 1 < 3), turning his "CATS" into "CHATS".

Key insight: transformation is symmetric bookkeeping about position shifts. An insert before your position pushes you right; a delete before your position pulls you left; everything after your position is irrelevant. All of OT's apparent complexity is making this bookkeeping exhaustive (every op-type pair) and consistent (same answer no matter which side transforms).

Common mistake: forgetting the tie-break when two users insert at the exact same position. Without a deterministic rule (e.g., lower client ID takes the earlier slot), Alice's client and Bob's client can order the two characters differently and permanently diverge while both believe they are in sync.`,

    `## OT Transform Functions in Detail

The correctness of OT hinges on the transform function satisfying **Transformation Property 1 (TP1)**: for any two concurrent operations a and b on the same document state, applying a then T(b, a) must produce the same state as applying b then T(a, b). For the insert/delete model:

- **Insert vs Insert**: If Insert(p1, c1) and Insert(p2, c2) are concurrent: if p1 < p2, the second insert shifts to p2+1; if p1 > p2, the first insert shifts to p1+1; if p1 == p2, tie-break by client ID (lower ID wins the earlier position).
- **Insert vs Delete**: If Insert(p1, c) and Delete(p2): if p1 <= p2, the delete shifts to p2+1 (the insert pushed it right); if p1 > p2, the insert shifts to p1-1 (the delete pulled it left).
- **Delete vs Delete**: If Delete(p1) and Delete(p2): if p1 < p2, the second delete shifts to p2-1; if p1 > p2, the first shifts to p1-1; if p1 == p2, one becomes a no-op (both deleted the same character).

For rich-text editing, Google Docs uses a more complex model based on **retain/insert/delete** operations (similar to the OT.js library). A single operation is a sequence of components: Retain(n) skips n characters, Insert(s) inserts string s, Delete(n) removes n characters. The transform function walks both operations in parallel, component by component, producing the transformed pair. This representation naturally handles formatting operations (bold, italic) as retain operations with attributes attached.`,

    `## CRDT Internals: RGA and Yjs

The **Replicated Growable Array (RGA)** is one of the most practical sequence CRDTs. Each element is a tuple (id, value, tombstone, causal_link) where id = (timestamp, replicaId) provides a unique total order. Insertion creates a new element whose causal_link points to the element it follows; the position in the sequence is determined by traversing the linked list. Concurrent inserts at the same position are ordered by their timestamp (Lamport clock), with replica ID as tie-breaker.

**Yjs** (used by many open-source editors) optimizes RGA by representing consecutive characters inserted by the same user as a single **block** rather than individual elements. A block stores (clientId, clock, content, originLeft, originRight). When two blocks conflict (same origin), Yjs uses a deterministic comparison of (clientId, clock) to order them. Deletions are tracked as ranges within blocks, and garbage collection periodically removes tombstoned blocks when all replicas have observed the deletion. This block-based approach reduces metadata overhead from O(1) per character to amortized O(1) per editing run, making CRDTs practical for documents with millions of characters.`,

    `## Conflict Resolution and Edge Cases

Beyond basic insert/delete conflicts, a real system must handle several tricky scenarios:

**Cursor Stability**: When Alice is typing at position 10 and Bob inserts text at position 5, Alice's cursor must shift to position 15. The cursor is represented as an operation-aware position marker that transforms along with document operations. In CRDT systems, the cursor references a character ID rather than a numeric position, so it stays stable regardless of remote insertions.

**Undo/Redo**: Naive undo (reversing the last operation) breaks in collaborative editing because other users' operations may have interleaved. The correct approach is **selective undo**: the system maintains a per-user operation history and generates an inverse operation that is then transformed against all subsequent operations before applying. For example, if Alice inserted 'A' at position 5, then Bob inserted 'B' at position 3 (shifting Alice's 'A' to position 6), undoing Alice's insert must delete at position 6, not 5.

**Intention Preservation for Formatting**: If Alice bolds characters 5-10 and Bob simultaneously deletes characters 7-8, the resulting document should have characters 5-6 and 9-10 bold (with the range adjusted). OT handles this by transforming the format range against the deletion; CRDTs attach formatting as metadata on individual characters, so deletions automatically remove the character and its formatting.`,

    `## Offline Editing and Sync Protocols

Offline editing introduces unbounded divergence: a user may edit for hours without connectivity. When reconnecting, the client must reconcile its local state with the server's current state -- which may have diverged significantly.

For OT-based systems, the reconnection protocol works as follows: (1) the client sends its last known server revision number and its queue of local operations; (2) the server identifies all operations that occurred since that revision; (3) the server transforms the client's queued operations against the server's operations (in order); (4) the server applies the transformed client operations and broadcasts them; (5) the client receives any operations it missed and transforms them against its local state. If the divergence is too large (thousands of operations), the server may instead send the latest snapshot and ask the client to diff its local state against it.

CRDT-based systems handle offline editing more gracefully because operations are designed to merge associatively and commutatively. The client simply sends its accumulated operations on reconnect, and every replica merges them without a central transformation step. However, the trade-off is that the merged result may contain surprises (e.g., two users independently rewrote the same paragraph, and the CRDT interleaves their characters). Most CRDT systems detect such large-scale conflicts and present them to the user for manual resolution rather than attempting automatic merging.`,

    `## OT vs CRDT: An Honest Comparison

Neither approach dominates; each is the right answer to a different deployment question. Be suspicious of any framing where one is simply "better".

**Why Google Docs uses OT with a central server.** Docs already requires a server for persistence, permissions, search indexing, and export -- so "no central server" buys nothing. Given a server, centralized OT (Jupiter) only needs TP1, operations stay tiny (position + content, ~100 bytes), the document in memory is just the text plus formatting spans with zero per-character metadata, and rich-text semantics (bold ranges, lists, tables, suggestions) map cleanly onto the retain/insert/delete component model. The server is also the natural enforcement point for permissions and the natural producer of an ordered revision log for history.

**When CRDTs win.** CRDTs earn their overhead when there is no reliable central sequencer: true peer-to-peer sync, end-to-end-encrypted documents where the server must not read content, local-first apps that must merge weeks of offline edits, and multi-device sync without coordination. They also decouple availability from any single server -- a CRDT replica can always accept writes.

**The honest costs.** CRDT text carries per-character (or per-run) unique IDs plus tombstones; a heavily edited document can hold several times its visible size in metadata, and tombstone garbage collection is only safe once every replica has observed the deletion -- hard when replicas can stay offline indefinitely. Yjs-style block encoding makes the overhead practical, not free. On the OT side, the costs are the mandatory server, the difficulty of proving transform functions correct for every op-type pair (many published OT algorithms were later shown buggy), and long-offline rebases that grow linearly with divergence.

In practice: modern systems blur the line. Figma runs CRDT-style merge rules through a central server anyway (for permissions and ordering); several editors ship OT online with a CRDT-like local queue for offline. Choose OT when you have a server and rich text; choose CRDTs when offline/P2P/E2EE is a product requirement, and budget for the metadata.`,

    `## Permission Enforcement at the Operation Level

Access control in a collaborative editor cannot stop at "can this user open the document" -- it must be enforced on every operation, at the single authoritative session server, because that is the only chokepoint every mutation passes through.

When a client connects, the gateway authenticates the session and the doc session server loads the document's ACL (owner, editors, commenters, viewers) into memory, subscribing to ACL-change events. Each incoming op is checked against the cached role: viewers' ops are rejected outright; commenters may only produce comment-service mutations, never document ops; editors pass. The check is a map lookup, so per-op enforcement costs nanoseconds -- there is no excuse to skip it.

The interesting case is a mid-session downgrade: an editor is demoted to viewer while ops are in flight. The permissions service publishes the change; the session server updates its cache and rejects the in-flight ops with a permission error carrying the current revision. The client must then roll back its optimistic local applications -- this is why clients keep unacknowledged ops in a buffer with enough information to invert them. There is an unavoidable race window of one propagation delay; the invariant that matters is that nothing enters the canonical op log after the server has observed the revocation, because the log is the document.

Warning: never enforce permissions only at the gateway or client. The gateway is a connection router that should stay ACL-free, and the client is untrusted by definition. The op log must record the authenticated author of every op anyway (for history and audit), so the session server already has everything it needs to authorize.

Real-world example: Google Docs additionally scopes link-sharing with capability tokens and, for Workspace enterprise tenants, mirrors every accepted op's metadata into audit logs -- op-level enforcement is what makes "who changed this and were they allowed to" answerable.`,

    `## Cold Start: Loading a Document from Snapshot Plus Replay Tail

When the first client opens a cold document, no session server owns it yet. The directory service assigns one (consistent hashing on docId), and that server must materialize the in-memory document before accepting ops.

The load path is: (1) fetch document metadata and ACL; (2) fetch the latest snapshot, which records the full document content and the revision number it represents, say revision 41,000; (3) read the op log tail -- every op after 41,000, at most N ops if snapshots are taken every N ops -- and replay it in order to reach the head revision; (4) start accepting client connections and ops. With N = 1,000 ops of ~100 bytes and a ~100 KB snapshot, the whole load is a few hundred KB and low single-digit milliseconds of replay -- fast enough that users never perceive cold start.

Key insight: the snapshot interval N is precisely the knob that trades write amplification against cold-start latency. Small N means frequent snapshot writes but a tiny replay tail; large N means cheap steady-state writes but slow, memory-hungry cold starts. N in the hundreds-to-thousands range keeps both costs negligible for text documents.

The same machinery serves three other features for free. Version history reconstructs any revision by loading the nearest earlier snapshot and replaying forward to the target. Failover is just a cold start on a new server: because every accepted op was durably appended to the log before being ACKed, the replacement server replays to the exact head revision and clients resubmit any unACKed ops. And compaction runs in the background, writing fresh snapshots and letting old log segments (beyond the history retention policy) be archived to cheaper storage.

Common mistake: ACKing an op to the client before the log append is durable. If the session server then crashes, the replacement replays a log that is missing an op the client believes was accepted -- the client and server permanently disagree on revision numbers. Durability before acknowledgment is non-negotiable; the in-memory document is a cache, the log is the truth.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "OT transform function for insert/delete operations on a plain-text document",
      source: `#include <variant>
#include <string>
#include <utility>
#include <stdexcept>

// --- Operation types ---
struct Insert {
    int pos;
    char ch;
    int clientId;  // tie-breaker for concurrent inserts at same position
};

struct Delete {
    int pos;
};

using Op = std::variant<Insert, Delete>;

// Transform op1 assuming op2 has already been applied.
// Returns the adjusted op1'.
Op transform(const Op& op1, const Op& op2) {
    return std::visit([](auto&& a, auto&& b) -> Op {
        using A = std::decay_t<decltype(a)>;
        using B = std::decay_t<decltype(b)>;

        if constexpr (std::is_same_v<A, Insert> && std::is_same_v<B, Insert>) {
            // Insert vs Insert
            if (a.pos < b.pos) {
                return Insert{a.pos, a.ch, a.clientId};
            } else if (a.pos > b.pos) {
                return Insert{a.pos + 1, a.ch, a.clientId};
            } else {
                // Same position: lower clientId wins earlier spot
                if (a.clientId < b.clientId) {
                    return Insert{a.pos, a.ch, a.clientId};
                } else {
                    return Insert{a.pos + 1, a.ch, a.clientId};
                }
            }
        } else if constexpr (std::is_same_v<A, Insert> && std::is_same_v<B, Delete>) {
            // Insert vs Delete
            if (a.pos <= b.pos) {
                return Insert{a.pos, a.ch, a.clientId};
            } else {
                return Insert{a.pos - 1, a.ch, a.clientId};
            }
        } else if constexpr (std::is_same_v<A, Delete> && std::is_same_v<B, Insert>) {
            // Delete vs Insert
            if (a.pos < b.pos) {
                return Delete{a.pos};
            } else {
                return Delete{a.pos + 1};
            }
        } else {
            // Delete vs Delete
            if (a.pos < b.pos) {
                return Delete{a.pos};
            } else if (a.pos > b.pos) {
                return Delete{a.pos - 1};
            } else {
                // Both deleted the same character -- no-op
                // Represented as a delete at an invalid position (sentinel)
                return Delete{-1};
            }
        }
    }, op1, op2);
}

// Apply an operation to a document string
std::string apply(const std::string& doc, const Op& op) {
    return std::visit([&doc](auto&& o) -> std::string {
        using T = std::decay_t<decltype(o)>;
        if constexpr (std::is_same_v<T, Insert>) {
            std::string result = doc;
            result.insert(result.begin() + o.pos, o.ch);
            return result;
        } else {
            if (o.pos < 0 || o.pos >= static_cast<int>(doc.size())) {
                return doc;  // no-op for sentinel deletes
            }
            std::string result = doc;
            result.erase(result.begin() + o.pos);
            return result;
        }
    }, op);
}`,
    },
    {
      language: "cpp",
      caption: "CRDT-based collaborative text using a simplified RGA (Replicated Growable Array)",
      source: `#include <vector>
#include <string>
#include <algorithm>
#include <optional>
#include <cstdint>

// Unique identifier for each character in the CRDT
struct CharId {
    uint32_t replicaId;
    uint32_t clock;

    bool operator==(const CharId& o) const {
        return replicaId == o.replicaId && clock == o.clock;
    }
    bool operator<(const CharId& o) const {
        // Higher clock wins (most recent); tie-break by replicaId
        if (clock != o.clock) return clock > o.clock;
        return replicaId < o.replicaId;
    }
};

struct RGAChar {
    CharId id;
    char value;
    bool tombstone = false;           // deleted characters are marked, not removed
    std::optional<CharId> originLeft; // the character this was inserted after
};

class RGADocument {
    uint32_t myReplicaId_;
    uint32_t clock_ = 0;
    std::vector<RGAChar> chars_;

    // Find index of character with given ID (-1 if not found)
    int findIndex(const CharId& id) const {
        for (int i = 0; i < static_cast<int>(chars_.size()); ++i) {
            if (chars_[i].id == id) return i;
        }
        return -1;
    }

    // Find the correct insertion position after originLeft
    int findInsertPos(const std::optional<CharId>& originLeft,
                      const CharId& newId) const {
        int startIdx = 0;
        if (originLeft.has_value()) {
            startIdx = findIndex(*originLeft) + 1;
        }
        // Scan right past any characters with higher priority (concurrent inserts)
        int pos = startIdx;
        while (pos < static_cast<int>(chars_.size())) {
            if (chars_[pos].id < newId) break;  // newId has higher priority
            ++pos;
        }
        return pos;
    }

public:
    explicit RGADocument(uint32_t replicaId) : myReplicaId_(replicaId) {}

    // Local insert: returns the operation to broadcast
    RGAChar localInsert(int visiblePos, char ch) {
        // Map visible position to internal position (skip tombstones)
        std::optional<CharId> origin;
        int visible = 0;
        for (int i = 0; i < static_cast<int>(chars_.size()); ++i) {
            if (visible == visiblePos) {
                if (i > 0) origin = chars_[i - 1].id;
                break;
            }
            if (!chars_[i].tombstone) ++visible;
        }

        CharId newId{myReplicaId_, ++clock_};
        RGAChar newChar{newId, ch, false, origin};
        remoteInsert(newChar);  // apply locally
        return newChar;         // broadcast this
    }

    // Remote insert: integrate a character from another replica
    void remoteInsert(const RGAChar& op) {
        clock_ = std::max(clock_, op.id.clock);
        int pos = findInsertPos(op.originLeft, op.id);
        chars_.insert(chars_.begin() + pos, op);
    }

    // Delete by visible position: returns the CharId to broadcast
    CharId localDelete(int visiblePos) {
        int visible = 0;
        for (auto& c : chars_) {
            if (!c.tombstone) {
                if (visible == visiblePos) {
                    c.tombstone = true;
                    return c.id;
                }
                ++visible;
            }
        }
        return CharId{0, 0};  // not found
    }

    // Remote delete: mark character as tombstone
    void remoteDelete(const CharId& id) {
        int idx = findIndex(id);
        if (idx >= 0) chars_[idx].tombstone = true;
    }

    // Render the visible document
    std::string toString() const {
        std::string result;
        for (const auto& c : chars_) {
            if (!c.tombstone) result += c.value;
        }
        return result;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Document versioning system with snapshot and delta storage",
      source: `#include <string>
#include <vector>
#include <unordered_map>
#include <chrono>
#include <variant>
#include <cstdint>

// --- Delta representation ---
struct InsertDelta  { int pos; std::string text; };
struct DeleteDelta  { int pos; int len; };
struct FormatDelta  { int pos; int len; std::string attr; std::string value; };
using Delta = std::variant<InsertDelta, DeleteDelta, FormatDelta>;

struct Revision {
    uint64_t revisionId;
    uint64_t baseRevision;       // the revision this delta applies to
    std::string authorId;
    std::chrono::system_clock::time_point timestamp;
    std::vector<Delta> deltas;
};

struct Snapshot {
    uint64_t revisionId;
    std::string content;         // full document text at this revision
    // In production, this would also store formatting metadata
};

class VersionStore {
    static constexpr int SNAPSHOT_INTERVAL = 100;

    std::unordered_map<uint64_t, Snapshot> snapshots_;
    std::vector<Revision> revisions_;
    uint64_t latestRevision_ = 0;

    // Apply a single delta to a document string
    std::string applyDelta(const std::string& doc, const Delta& d) const {
        return std::visit([&doc](auto&& delta) -> std::string {
            using T = std::decay_t<decltype(delta)>;
            if constexpr (std::is_same_v<T, InsertDelta>) {
                std::string r = doc;
                r.insert(delta.pos, delta.text);
                return r;
            } else if constexpr (std::is_same_v<T, DeleteDelta>) {
                std::string r = doc;
                r.erase(delta.pos, delta.len);
                return r;
            } else {
                // FormatDelta: in a real system this modifies a rich-text model
                return doc;
            }
        }, d);
    }

public:
    VersionStore() {
        // Initial empty snapshot
        snapshots_[0] = Snapshot{0, ""};
    }

    // Commit a new revision
    uint64_t commit(const std::string& authorId,
                    const std::vector<Delta>& deltas) {
        uint64_t revId = ++latestRevision_;
        Revision rev{revId, revId - 1, authorId,
                     std::chrono::system_clock::now(), deltas};
        revisions_.push_back(rev);

        // Take periodic snapshots
        if (revId % SNAPSHOT_INTERVAL == 0) {
            std::string doc = reconstruct(revId);
            snapshots_[revId] = Snapshot{revId, doc};
        }
        return revId;
    }

    // Reconstruct document at any revision
    std::string reconstruct(uint64_t targetRevision) const {
        // Find the nearest snapshot at or before targetRevision
        uint64_t snapshotRev = 0;
        for (const auto& [rev, snap] : snapshots_) {
            if (rev <= targetRevision && rev > snapshotRev) {
                snapshotRev = rev;
            }
        }
        std::string doc = snapshots_.at(snapshotRev).content;

        // Replay deltas from snapshot to target
        for (const auto& rev : revisions_) {
            if (rev.revisionId > snapshotRev &&
                rev.revisionId <= targetRevision) {
                for (const auto& d : rev.deltas) {
                    doc = applyDelta(doc, d);
                }
            }
        }
        return doc;
    }

    // Get revision history (for the UI timeline)
    struct RevisionSummary {
        uint64_t revisionId;
        std::string authorId;
        std::chrono::system_clock::time_point timestamp;
        int deltaCount;
    };

    std::vector<RevisionSummary> getHistory(uint64_t fromRev,
                                            uint64_t toRev) const {
        std::vector<RevisionSummary> result;
        for (const auto& rev : revisions_) {
            if (rev.revisionId >= fromRev && rev.revisionId <= toRev) {
                result.push_back({
                    rev.revisionId, rev.authorId,
                    rev.timestamp,
                    static_cast<int>(rev.deltas.size())
                });
            }
        }
        return result;
    }

    uint64_t getLatestRevision() const { return latestRevision_; }
};`,
    },
  ],
  diagrams: [
    {
      title: "High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered architecture: every edit flows client -> gateway -> the document's single authoritative session server (transform + sequence) -> broadcast to other clients and append to the op log",
      mermaid: `graph TB
    subgraph ClientsLayer["Clients"]
        CA["Editor A<br/>local op buffer<br/>optimistic apply"]
        CB["Editor B<br/>local op buffer<br/>optimistic apply"]
        CC["Editor C<br/>local op buffer<br/>optimistic apply"]
    end

    subgraph GatewayLayer["Gateway"]
        LB["Load Balancer"]
        WSG["WebSocket Gateway<br/>sticky connections<br/>routes by docId"]
    end

    subgraph CoreLayer["Collaboration Core"]
        DSS["Doc Session Service<br/>each doc sharded to ONE<br/>authoritative server"]
        OTE["OT Transform Engine<br/>transform vs concurrent ops"]
        SEQ["Op Sequencer<br/>assigns revision numbers"]
    end

    subgraph PersistLayer["Persistence"]
        OPLOG["Op Log Store<br/>append-only revisions"]
        SNAP["Snapshot Store<br/>periodic compaction"]
        META["Document Metadata DB<br/>title, owner, sharing"]
    end

    subgraph PresenceLayer["Presence"]
        PRS["Presence Service<br/>cursors, selections,<br/>who is online"]
        PUBSUB["Pub/Sub Fanout"]
    end

    subgraph SupportLayer["Supporting Services"]
        ACL["Permissions / ACL Service<br/>checked per operation"]
        CMT["Comments Service<br/>anchored to doc ranges"]
        OFF["Offline Sync and<br/>Export Pipeline"]
    end

    CA -->|"1 - edit op + base revision"| LB
    CB <--> LB
    CC <--> LB
    LB <--> WSG
    WSG -->|"2 - route to doc session"| DSS
    DSS --> OTE
    OTE --> SEQ
    SEQ -->|"3 - append canonical op"| OPLOG
    OPLOG -.->|"every N ops"| SNAP
    SEQ -->|"4 - ACK + broadcast"| WSG
    WSG -->|"5 - transformed op"| CB
    WSG -->|"5 - transformed op"| CC
    DSS -->|"authorize each op"| ACL
    DSS --> META
    WSG <--> PRS
    PRS <--> PUBSUB
    DSS --> CMT
    OFF --> OPLOG
    OFF --> SNAP`,
    },
    {
      title: "OT Client State Machine",
      kind: "state",
      caption: "Three-state model for client-side operation handling",
      mermaid: `stateDiagram-v2
    [*] --> Synchronized

    Synchronized --> AwaitingConfirm: User edits locally<br/>Send op to server
    AwaitingConfirm --> Synchronized: Server ACKs op<br/>No pending edits
    AwaitingConfirm --> AwaitingWithBuffer: User edits while<br/>awaiting ACK
    AwaitingWithBuffer --> AwaitingConfirm: Server ACKs op<br/>Send buffered op
    AwaitingWithBuffer --> AwaitingWithBuffer: User edits again<br/>Merge into buffer

    Synchronized --> Synchronized: Receive remote op<br/>Apply directly
    AwaitingConfirm --> AwaitingConfirm: Receive remote op<br/>Transform against pending
    AwaitingWithBuffer --> AwaitingWithBuffer: Receive remote op<br/>Transform against pending and buffer`,
    },
    {
      title: "Real-Time Sync Sequence",
      kind: "sequence",
      caption: "Message flow when two clients edit concurrently",
      mermaid: `sequenceDiagram
    participant A as Client A
    participant S as Server
    participant B as Client B

    Note over A,B: Both start at revision 5

    A->>A: Type 'X' at pos 3
    A->>S: Insert(3, X) base=5
    B->>B: Delete pos 7
    B->>S: Delete(7) base=5

    S->>S: Receive Insert(3,X) first<br/>Apply as rev 6
    S->>B: Insert(3, X) rev=6
    S->>A: ACK rev=6

    S->>S: Receive Delete(7) base=5<br/>Transform against rev 6<br/>Delete(8) becomes rev 7
    S->>A: Delete(8) rev=7
    S->>B: ACK rev=7

    B->>B: Apply Insert(3,X)<br/>Transform local cursor

    Note over A,B: Both converge to same state`,
    },
    {
      title: "OT vs CRDT Decision Mindmap",
      kind: "mindmap",
      caption: "Key factors when choosing between OT and CRDT for collaborative editing",
      mermaid: `mindmap
  root((Collaboration<br/>Algorithm))
    OT
      Central server required
      Lower metadata overhead
      Proven at scale by Google
      Simpler for rich text
      Server is single point of failure
    CRDT
      Peer-to-peer capable
      Offline-first by design
      Higher memory for tombstones
      Automerge and Yjs ecosystem
      No central bottleneck
    Hybrid
      Use OT for online editing
      Use CRDT for offline queue
      Server mediates conflicts
      Best of both worlds`,
    },
  ],
  interviewQA: [
    {
      q: "How does Operational Transformation ensure all clients converge to the same document state?",
      a: "OT uses a central server to establish a total order on operations. Each client sends its operations to the server along with the revision number it was based on. The server transforms incoming operations against any operations that were applied since that base revision, using transform functions that satisfy Transformation Property 1 (TP1): applying op_a then transform(op_b, op_a) yields the same state as applying op_b then transform(op_a, op_b). The server broadcasts the transformed operation to all clients. Since all clients apply operations in the server-determined order and the transform function is deterministic, every client converges to the same state.",
      followUps: [
        "What happens if the transform function does not satisfy TP1?",
        "Why does Google Docs use the Jupiter protocol instead of generic distributed OT?",
      ],
    },
    {
      q: "What are the trade-offs between OT and CRDTs for collaborative editing?",
      a: "OT requires a central server to serialize operations, which simplifies correctness (only TP1 needed) but creates a single point of failure and makes offline editing harder. CRDTs are designed so all operations commute, enabling peer-to-peer sync and natural offline support without a central server. However, CRDTs carry higher metadata overhead -- each character needs a unique ID, and deleted characters remain as tombstones until garbage collected. OT produces smaller wire messages and is better understood for rich-text operations (bold, lists, tables). CRDTs excel in offline-first and decentralized scenarios. Google Docs uses OT because they have reliable server infrastructure; Figma uses a CRDT-inspired approach for its multiplayer features.",
    },
    {
      q: "How would you handle a user who has been editing offline for several hours and then reconnects?",
      a: "On reconnect, the client sends its last known server revision and its queue of locally buffered operations. The server identifies all operations committed since that revision. For OT, it transforms the client's buffered operations against each server operation in sequence -- this can be expensive if divergence is large (thousands of ops), so the system may instead send the latest snapshot and have the client diff its local state against it. For CRDTs, the client simply sends its accumulated operations and every replica merges them automatically since CRDT operations commute. In both cases, if the offline edits conflict heavily with online edits (e.g., both users rewrote the same paragraph), the system should detect the conflict and present both versions to the user rather than silently interleaving characters.",
      followUps: [
        "How do you detect that two users edited the same paragraph?",
        "What is the maximum practical offline divergence before rebasing becomes too expensive?",
      ],
    },
    {
      q: "How do you implement collaborative undo in a multi-user document?",
      a: "Naive undo -- simply reversing the last operation -- breaks in collaborative editing because other users' operations may have changed the document between the user's operations. The correct approach is selective undo: maintain a per-user operation history, generate the inverse of the operation being undone, then transform that inverse against all operations that occurred after the original. For example, if Alice inserted 'A' at position 5, then Bob inserted 'B' at position 3 (shifting Alice's 'A' to position 6), undoing Alice's insert generates Delete(5), which is transformed against Bob's Insert(3) to become Delete(6). This ensures the undo removes exactly Alice's character regardless of subsequent edits. CRDT-based systems can implement undo by toggling the tombstone flag back on an inserted character, but must still handle cascading effects on formatting and cursor positions.",
    },
    {
      q: "How do presence indicators (cursors, selections) work without polluting the document revision history?",
      a: "Presence state is treated as ephemeral data, separate from the durable document model. Each client periodically broadcasts its cursor position and selection range over the WebSocket channel as lightweight messages (e.g., {userId, cursorPos, selectionStart, selectionEnd, color}). These messages are forwarded to other clients but never persisted to the revision store. When a remote document operation arrives, each client locally transforms all known cursor positions using the same OT transform logic applied to the document. This keeps cursors in sync with the document state. Presence messages are sent at a throttled rate (e.g., 10Hz) to avoid flooding the network. When a user disconnects, the server broadcasts a 'leave' event so other clients can remove that user's cursor.",
    },
    {
      q: "Isn't routing every edit of a document through a single server a scalability bottleneck? Walk through the numbers.",
      a: "No, because the bottleneck analysis is per document, and per-document load is tiny. A document rarely has more than ~50 simultaneous collaborators, and an active editor produces roughly 1 operation/second, so the busiest realistic document sees ~50 ops/s -- trivial for one single-threaded sequencer doing a transform and a log append per op. The scale problem is horizontal: 10M concurrent editors at ~2 editors per active document means ~5M independent active documents producing ~10M ops/s in aggregate. You shard documents across session servers with consistent hashing on docId (a directory service maps docId to its current owner); if one server sustains ~10K ops/s it owns ~5,000 active documents, so ~1,000 servers cover the fleet. The single-writer-per-document design is what makes correctness easy (one total order, only TP1 needed) precisely because documents are small independent shards. Making the OT engine itself distributed or multi-leader would reintroduce the TP2 problem for essentially no capacity benefit.",
      followUps: [
        "What happens when a session server crashes while owning 5,000 documents?",
        "How would you handle one pathological document with 10,000 concurrent editors (e.g., a public link goes viral)?",
      ],
    },
    {
      q: "A client opens a document that no server currently has in memory. What happens, and how do you keep this fast?",
      a: "The directory service assigns the document to a session server (consistent hashing on docId). That server performs a cold start: load metadata and the ACL, fetch the latest snapshot (full content plus the revision number it represents), then read and replay the op log tail -- all ops after the snapshot revision -- to reach head. Only then does it accept connections and ops. Speed comes from bounding the tail: if a snapshot is taken every N ops (say 1,000), replay is at most 999 ops of ~100 bytes each, so the whole load is a few hundred KB and a few milliseconds. The snapshot interval N is the tuning knob: smaller N means more snapshot-write amplification but faster cold starts. The same snapshot-plus-tail machinery gives you version history (replay to any past revision), crash failover (the replacement server replays the durable log to the exact head, since every op is appended before it is ACKed), and background compaction. The key correctness rule is durability before acknowledgment -- ACKing an op that is not yet in the log means a failover loses an edit the client believes was accepted.",
      followUps: [
        "How do you pick the snapshot interval for very large documents (100 MB books)?",
        "How do clients resynchronize after the failover -- what do they resend?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In OT, what does Transformation Property 1 (TP1) guarantee?",
      options: [
        "Operations can be applied in any order without transformation",
        "Applying op_a then transform(op_b, op_a) yields the same state as applying op_b then transform(op_a, op_b)",
        "The server can process operations without knowing client state",
        "Deleted characters are permanently removed from the data structure",
      ],
      answerIndex: 1,
      explanation:
        "TP1 ensures convergence: regardless of which concurrent operation is applied first, transforming the other against it produces the same final state. This is the fundamental correctness property that all OT systems must satisfy.",
    },
    {
      q: "What is a tombstone in the context of CRDT-based collaborative text editing?",
      options: [
        "A checkpoint saved before a destructive operation",
        "A marker indicating a character was deleted, kept to maintain unique ID ordering",
        "A special operation that undoes the last insert",
        "A snapshot of the document taken at regular intervals",
      ],
      answerIndex: 1,
      explanation:
        "CRDTs cannot simply remove deleted characters because other replicas may reference their unique IDs for ordering. Instead, deleted characters are marked as tombstones -- they remain in the data structure for ordering purposes but are excluded when rendering the visible text. Garbage collection can remove tombstones once all replicas have observed the deletion.",
    },
    {
      q: "Why does the OT client state machine have three states (Synchronized, AwaitingConfirm, AwaitingWithBuffer) instead of just two?",
      options: [
        "To support exactly three concurrent users",
        "To batch local edits while one operation is in flight, preventing the client from flooding the server",
        "To handle three types of operations: insert, delete, and format",
        "To track the three most recent server revisions",
      ],
      answerIndex: 1,
      explanation:
        "The three-state model ensures the client sends at most one operation at a time. In AwaitingConfirm, the client has one operation in flight. If the user keeps typing, edits are merged into a buffer (AwaitingWithBuffer) rather than sent immediately. When the ACK arrives, the buffer is sent as a single operation. This prevents flooding and simplifies transformation logic.",
    },
    {
      q: "What advantage does the Jupiter protocol (used by Google Docs) have over generic distributed OT?",
      options: [
        "It eliminates the need for a server entirely",
        "It uses CRDTs instead of OT for better offline support",
        "It only requires TP1 by using a centralized server to establish total order, avoiding the harder TP2 requirement",
        "It stores documents as binary blobs for faster serialization",
      ],
      answerIndex: 2,
      explanation:
        "Generic distributed OT (without a central server) requires both TP1 and TP2, and TP2 is notoriously difficult to satisfy correctly -- many published algorithms have been proven incorrect. Jupiter sidesteps TP2 entirely by using a central server as the single source of truth that establishes a total order on operations, requiring only the simpler TP1 property.",
    },
  ],
  flashcards: [
    {
      front: "What is Operational Transformation (OT)?",
      back: "An algorithm family where concurrent operations are mathematically adjusted (transformed) so that applying them in any order produces the same final document state. Used by Google Docs. Requires a central server in practice (Jupiter protocol) to avoid the harder TP2 correctness property.",
    },
    {
      front: "What is a CRDT and how does it differ from OT?",
      back: "A Conflict-free Replicated Data Type designs the data structure so all operations commute by construction -- no transformation step needed. Each character gets a unique immutable ID. Enables peer-to-peer sync and offline editing. Trade-off: higher metadata overhead (unique IDs + tombstones) vs. OT's smaller wire format.",
    },
    {
      front: "What is TP1 (Transformation Property 1)?",
      back: "The correctness condition for OT: for concurrent ops a and b, applying a then T(b,a) must yield the same state as applying b then T(a,b). Guarantees all clients converge. The Jupiter protocol only requires TP1 (not TP2) because a central server establishes total order.",
    },
    {
      front: "What are tombstones in CRDTs?",
      back: "Deleted characters in a sequence CRDT are marked as tombstones rather than physically removed. They must be retained because other replicas may reference their unique IDs for ordering concurrent inserts. Garbage collected only after all replicas have observed the deletion.",
    },
    {
      front: "How does the three-state client model work in collaborative editing?",
      back: "Synchronized: no pending ops. AwaitingConfirm: one op sent to server, waiting for ACK. AwaitingWithBuffer: one op in flight + new local edits buffered. When ACK arrives in AwaitingWithBuffer, the buffer is sent as the next op. Prevents flooding the server while keeping local editing instant.",
    },
    {
      front: "How is cursor presence handled without affecting document history?",
      back: "Cursor positions and selections are ephemeral state broadcast over WebSocket but never persisted. When remote document ops arrive, cursor positions are transformed using the same OT transform logic. Broadcast at a throttled rate (~10Hz). Disconnection triggers a 'leave' event to remove the cursor.",
    },
    {
      front: "How does selective undo work in collaborative editing?",
      back: "Instead of reversing the last global operation, the system tracks per-user operation history. To undo, it generates the inverse of the user's operation, then transforms that inverse against all operations that occurred after the original. This correctly undoes only the user's change regardless of interleaved edits by others.",
    },
    {
      front: "How is version history stored efficiently?",
      back: "Two-tier storage: periodic full snapshots (every N revisions) plus individual deltas between snapshots. To reconstruct any version: load the nearest prior snapshot, replay deltas forward. Auto-grouping combines nearby edits by the same author (e.g., 30-second windows) into named revisions for the UI timeline.",
    },
    {
      front: "Why does routing all edits of one document through a single server scale?",
      back: "Per-doc load is tiny: rarely >50 collaborators at ~1 op/s each = ~50 ops/s, trivial for one sequencer. Scale is horizontal across ~millions of independent active docs, sharded by docId (consistent hashing + directory service). Single-writer per doc keeps one total order, so only TP1 is needed.",
    },
    {
      front: "What happens on cold start when a document is opened on a fresh session server?",
      back: "Load metadata + ACL, fetch the latest snapshot (content + its revision number), replay the op-log tail (at most N ops if snapshots are taken every N) to reach head, then accept connections. Same machinery gives version history, crash failover, and compaction. Rule: log append must be durable before the op is ACKed.",
    },
    {
      front: "How are permissions enforced during live editing?",
      back: "At the authoritative doc session server, per operation: it caches the ACL, checks the author's role on every incoming op, and subscribes to ACL-change events. On mid-session downgrade it rejects in-flight ops; the client rolls back its optimistic edits. Never rely on gateway- or client-side checks alone.",
    },
  ],
  exercises: [
    "Implement a basic OT server in your language of choice that handles Insert and Delete operations from two clients. Verify convergence by having both clients apply the same concurrent operations in different orders and checking that the final documents match.",
    "Build a simple sequence CRDT (RGA) that supports insert and delete. Create two replicas, perform concurrent inserts at the same position on each replica, merge the operations, and verify both replicas produce identical output.",
    "Design the WebSocket message protocol for a collaborative editor: define message types for operation submission, server acknowledgment, remote operation broadcast, cursor/presence updates, and reconnection. Write a state machine that handles each message type on the client side.",
    "Implement a version history system that stores snapshots every 100 revisions and deltas in between. Write a function that reconstructs the document at any arbitrary revision number. Measure the performance difference between reconstructing from a nearby snapshot vs. replaying all deltas from the beginning.",
    "Simulate an offline editing scenario: two clients diverge for 50 operations each. Implement the reconciliation protocol that transforms and merges both operation queues when the offline client reconnects. Test with conflicting edits to the same text region and verify the merge produces a sensible result.",
  ],
  revisionNotes: [
    "Google Docs uses OT with the Jupiter protocol -- a central server serializes all operations and only requires TP1, avoiding the notoriously hard TP2 property needed for decentralized OT.",
    "The OT transform function adjusts positions: Insert vs Delete shifts the insert position left/right depending on relative positions; Delete vs Delete at the same position becomes a no-op.",
    "CRDTs assign each character a unique immutable ID (replicaId + Lamport clock). Inserts create new IDs; deletes create tombstones. All operations commute, enabling peer-to-peer sync.",
    "Yjs optimizes CRDTs by grouping consecutive characters from the same user into blocks, reducing metadata from O(n) per character to amortized O(1) per editing run.",
    "The client runs a three-state machine: Synchronized, AwaitingConfirm, AwaitingWithBuffer. At most one operation is in flight at a time; local edits are buffered and merged.",
    "Presence (cursors, selections) is ephemeral state -- broadcast over WebSocket at throttled rate, never persisted. Cursor positions are transformed using OT logic when remote operations arrive.",
    "Selective undo: generate the inverse of the user's operation, transform it against all subsequent operations (including other users' edits), then apply. Never undo other users' work.",
    "Version history uses snapshot + delta storage. Snapshots taken every N revisions; any version is reconstructed by loading nearest snapshot and replaying deltas forward.",
    "Offline reconnection: client sends buffered ops + last known revision. Server transforms buffered ops against all ops since that revision. For large divergence, server may send a fresh snapshot instead.",
    "Access control: per-document ACL with viewer/commenter/editor roles. Collaboration server checks permissions on every incoming operation. Link-sharing uses capability tokens in URLs.",
    "Sharding: each document is owned by exactly ONE authoritative session server (consistent hashing on docId + directory service). Correctness is easy because there is one total order per doc; scale comes from millions of independent doc shards.",
    "Capacity anchors: 10M concurrent editors x ~1 op/s = 10M ops/s; ~100 B/op = ~1 GB/s log ingest (~86 TB/day raw, compacted via snapshots). Max ~50 collaborators/doc = ~50 ops/s/doc -- trivial for one sequencer.",
    "Cold start = load latest snapshot + replay op-log tail (at most N ops if snapshotting every N). Same machinery powers version history, failover, and compaction. Never ACK an op before its log append is durable.",
    "Mid-session permission downgrade: session server subscribes to ACL changes, rejects in-flight ops after revocation; client rolls back optimistic edits. Enforce at the session server, never only at gateway or client.",
  ],
  cheatSheet: [
    "OT core: transform(op1, op2) returns op1' adjusted for op2 having been applied first. Must satisfy TP1 for convergence.",
    "Jupiter protocol: centralized OT -- server maintains state vector per client, establishes total order, avoids TP2.",
    "CRDT sequence types: RGA (linked list with unique IDs), LSEQ/Logoot (position identifiers between existing IDs), Automerge (tree-based DAG).",
    "Tombstones: CRDT deletes mark characters as invisible rather than removing them. GC only after all replicas have seen the delete.",
    "Client states: Synchronized (idle) -> AwaitingConfirm (op in flight) -> AwaitingWithBuffer (op in flight + local buffer).",
    "Presence protocol: {userId, cursor, selection, color} broadcast at ~10Hz over WebSocket, not persisted.",
    "Snapshot interval: full document saved every N revisions (100-1000). Deltas stored individually for replay.",
    "Offline sync (OT): queue ops locally, on reconnect send queue + base revision, server transforms against missed ops.",
    "Offline sync (CRDT): just send accumulated ops -- commutative by design, no server-side transformation needed.",
    "Selective undo: inverse(userOp) transformed against all subsequent ops = correct undo in collaborative context.",
    "Sharding: docId -> one authoritative session server (consistent hashing + directory). Scale across docs, never within one doc.",
    "Capacity: 10M editors x 1 op/s x 100 B = 1 GB/s op-log ingest; ~50 ops/s max per doc; ~1,000 session servers at ~10K ops/s each.",
    "Cold start: snapshot(rev R) + replay ops (R, head]. Snapshot every N ops bounds replay; N trades write amplification vs cold-start latency.",
    "Durability rule: append op to log BEFORE ACK. In-memory doc is a cache; the op log is the truth.",
    "Op-level authz: session server caches ACL, checks every op, subscribes to revocation events; rejected in-flight ops trigger client rollback.",
  ],
  glossary: [
    {
      term: "Operational Transformation (OT)",
      definition:
        "An algorithm family that resolves conflicts between concurrent editing operations by mathematically transforming one operation against another so both can be applied in either order and converge to the same state.",
    },
    {
      term: "CRDT (Conflict-free Replicated Data Type)",
      definition:
        "A data structure designed so that all operations commute by construction, allowing replicas to merge state without conflict resolution. For text, each character carries a unique immutable ID.",
    },
    {
      term: "Tombstone",
      definition:
        "In CRDTs, a marker indicating that a character has been deleted. The character's unique ID and position in the structure are retained for ordering; only its visibility is removed.",
    },
    {
      term: "TP1 (Transformation Property 1)",
      definition:
        "The correctness condition stating that for concurrent operations a and b, applying a then transform(b, a) must produce the same state as applying b then transform(a, b).",
    },
    {
      term: "Jupiter Protocol",
      definition:
        "A centralized OT protocol where a server maintains a state space graph per client. By serializing operations through a central server, it only requires TP1 (not the harder TP2), simplifying correctness.",
    },
    {
      term: "Fencing Token",
      definition:
        "A monotonically increasing number issued with each leadership grant or session. Used to prevent stale clients from applying outdated operations -- the server rejects any operation with a token older than the highest seen.",
    },
    {
      term: "RGA (Replicated Growable Array)",
      definition:
        "A sequence CRDT where each element has a unique ID (timestamp + replicaId) and a causal link to the element it was inserted after. Concurrent inserts at the same position are ordered deterministically by their IDs.",
    },
  ],
  animations: [
    {
      title: "Two people typing at once",
      steps: [
        {
          label: "Both edit",
          detail: "A inserts at position 5; B inserts at position 3, concurrently.",
        },
        {
          label: "Naive apply",
          detail: "Applying A's edit after B's puts it in the wrong place — the documents diverge.",
        },
        {
          label: "Operational transformation",
          detail: "A's operation is transformed against B's so its intent is preserved at the new position.",
        },
        {
          label: "Or CRDTs",
          detail: "Each character gets a unique, ordered identifier, so concurrent inserts merge deterministically with no central transform.",
        },
        {
          label: "Server relays",
          detail: "Operations are broadcast to all connected clients over WebSocket, with a version vector to order them.",
        },
        {
          label: "Persistence",
          detail: "The document is stored as a log of operations plus periodic snapshots — which also gives history and undo.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "OT (Jupiter/Google Docs)",
      "CRDT (RGA/Yjs)",
      "Hybrid (OT online + CRDT offline)",
    ],
    rows: [
      [
        "Server requirement",
        "Central server required for serialization",
        "No server needed; peer-to-peer capable",
        "Server for online; peers for offline queue",
      ],
      [
        "Correctness property",
        "Must satisfy TP1; Jupiter avoids TP2",
        "Commutativity by construction",
        "TP1 for online ops; CRDT merge for offline",
      ],
      [
        "Metadata overhead",
        "Low -- operations carry position + content only",
        "High -- each char carries unique ID + tombstones",
        "Medium -- online ops are lightweight; offline ops carry IDs",
      ],
      [
        "Offline editing",
        "Queue ops and transform on reconnect; expensive for long divergence",
        "Natural -- ops merge automatically on reconnect",
        "Strong -- offline ops stored as CRDT, merged seamlessly",
      ],
      [
        "Rich text support",
        "Well-understood retain/insert/delete model",
        "More complex; formatting as character metadata",
        "Uses OT model for formatting operations",
      ],
      [
        "Scalability",
        "Server is bottleneck; shard by document",
        "No central bottleneck; scales with replicas",
        "Server handles hot path; peers reduce load",
      ],
      [
        "Production examples",
        "Google Docs, Microsoft Office Online",
        "Figma, Yjs ecosystem, Automerge",
        "Apple Notes (iCloud + local CRDT-like merge)",
      ],
    ],
  },
  followUps: [
    "How would you extend this design to support collaborative editing of spreadsheets or slides, where the data model is a grid or object tree rather than a linear text sequence?",
    "How do you handle permission changes in real time -- e.g., an editor is downgraded to viewer while they have pending edits in flight?",
    "What strategies can you use to reduce CRDT tombstone overhead in a document that has been heavily edited over months or years?",
    "How would you design the commenting and suggestion system (like Google Docs comments) on top of the OT/CRDT document model?",
    "How do you handle image and media embedding in a collaborative document, where the payload is large and binary rather than text operations?",
    "How would you add end-to-end encryption to a collaborative document editor while still supporting real-time OT on the server?",
    "A session server crashes while owning thousands of active documents -- design the failover path and explain what clients must resend to resynchronize.",
    "One document goes viral with 10,000 concurrent viewers and 500 editors -- how do you keep the single-writer sequencer alive (read-only fanout tiers, edit throttling, follower replicas)?",
    "How would you choose the snapshot interval N for documents that range from 1 KB notes to 100 MB books, and what breaks if N is uniform?",
  ],
  resources: [
    {
      label: "Operational Transformation -- Wikipedia",
      kind: "article",
      note: "Comprehensive overview of OT history, algorithms (dOPT, Jupiter, GOT), and the TP1/TP2 properties with examples.",
    },
    {
      label: "Designing Data-Intensive Applications -- Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapter 9 covers consistency and consensus; Chapter 5 covers replication. Kleppmann also authored Automerge, a prominent CRDT library.",
    },
    {
      label: "Yjs -- A CRDT Framework for Shared Editing",
      kind: "repo",
      note: "Production-quality CRDT implementation used by many collaborative editors. Excellent documentation on the block-based RGA optimization.",
    },
    {
      label: "Real Differences Between OT and CRDT for Co-Editors -- Seph Gentle",
      kind: "article",
      note: "Practical comparison by a former Google Wave engineer, discussing where each approach wins and common misconceptions.",
    },
    {
      label: "CRDTs: The Hard Parts -- Martin Kleppmann (Strange Loop 2020)",
      kind: "video",
      note: "Deep dive into the challenges of building practical CRDTs: performance, garbage collection, move operations, and undo.",
    },
  ],
};
