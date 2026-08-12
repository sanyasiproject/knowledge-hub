import type { TopicContent } from "../types";

export const consensus: TopicContent = {
  quickSummary: [
    "Consensus protocols enable distributed nodes to agree on a single value or sequence of values despite failures — the foundation for leader election, replicated state machines, and distributed coordination.",
    "Paxos (Lamport, 1989) is the foundational consensus algorithm using proposers, acceptors, and learners with a two-phase prepare/accept protocol — correct but notoriously difficult to implement and understand.",
    "Raft (Ongaro & Ousterhout, 2014) was designed for understandability, decomposing consensus into leader election, log replication, and safety — used in etcd, CockroachDB, and TiKV.",
    "Both Paxos and Raft tolerate up to f failures in a cluster of 2f+1 nodes (majority quorum), guaranteeing safety (agreement) as long as a majority of nodes are reachable.",
  ],
  detailed: [
    `## The Consensus Problem

**Consensus** requires a set of distributed nodes to agree on a value satisfying three properties: **Agreement** (all correct nodes decide the same value), **Validity** (the decided value was proposed by some node), and **Termination** (all correct nodes eventually decide).

The **FLP impossibility result** (1985) proves that deterministic consensus is impossible in an asynchronous system with even one crash failure — there is always a possible execution that prevents termination. Practical protocols circumvent this using timeouts (partial synchrony assumption), randomization, or failure detectors. All practical consensus protocols assume at most f failures in 2f+1 nodes.`,

    `## Paxos

**Paxos** (Leslie Lamport) has three roles: **proposers** suggest values, **acceptors** vote on proposals, and **learners** learn the decided value. The protocol has two phases:

**Phase 1 (Prepare)**: A proposer selects a unique proposal number N and sends Prepare(N) to a majority of acceptors. Each acceptor responds with a promise not to accept proposals with numbers less than N, and the highest-numbered proposal it has already accepted (if any).

**Phase 2 (Accept)**: If the proposer receives promises from a majority, it sends Accept(N, V) where V is the value from the highest-numbered accepted proposal, or its own value if no acceptor had accepted anything. Acceptors accept if they have not promised to a higher-numbered proposal.

**Multi-Paxos** optimizes for a sequence of decisions by establishing a stable leader who skips Phase 1 for subsequent rounds, reducing message complexity from 4 to 2 per decision.`,

    `## Raft

**Raft** decomposes consensus into three subproblems:

**Leader election**: Nodes are followers, candidates, or leaders. Followers become candidates after an election timeout. A candidate requests votes from all nodes; it wins if it gets a majority. The leader sends periodic heartbeats to prevent new elections. Each term (logical clock) has at most one leader.

**Log replication**: The leader receives client requests, appends them to its log, and replicates entries to followers. An entry is **committed** once a majority of nodes have stored it. The leader notifies followers of committed entries, and they apply them to their state machines.

**Safety**: Raft guarantees that if a log entry is committed, it will be present in the logs of all future leaders. The election restriction ensures only candidates with logs at least as up-to-date as any majority member can win. This avoids the need for Paxos's complex recovery protocol.`,

    `## Log Replication in Detail

The leader maintains a **nextIndex** (next entry to send) and **matchIndex** (highest replicated entry) for each follower. AppendEntries RPCs include the leader's term, the previous log entry's index and term (for consistency checking), and new entries.

If a follower's log does not match the leader's at the previous entry, it rejects the AppendEntries. The leader decrements nextIndex and retries until a matching point is found, then sends all entries from there. This mechanism handles follower crashes and ensures log convergence.

**Committed entries** are entries stored by a majority. The leader tracks the commit index and includes it in AppendEntries — followers apply entries up to the commit index to their state machines. Once committed, an entry is durable: any future leader's log will contain it.`,

    `## Practical Considerations

**Cluster membership changes** are handled by joint consensus (Raft) or reconfiguration protocols (Paxos). Adding or removing nodes requires careful coordination to avoid split-brain during the transition. Raft uses a two-phase approach: first the old and new configurations form a joint majority, then the new configuration takes over.

**Performance**: consensus latency is bounded by the slowest node in the majority. Geographic distribution increases latency significantly. Optimizations include **batching** (group multiple proposals into one round), **pipelining** (send new proposals without waiting for previous commits), and **read leases** (the leader serves reads locally for a lease duration without contacting followers, trading freshness for latency).

**Implementations**: etcd and Consul use Raft; ZooKeeper uses ZAB (similar to Paxos); CockroachDB and TiKV use Raft; Google's Chubby used Paxos.`,

    `## Byzantine Fault Tolerance

**Byzantine failures** occur when a node behaves arbitrarily — it may send conflicting messages to different peers, fabricate data, or collude with other faulty nodes. PBFT (Practical Byzantine Fault Tolerance) by Castro and Liskov (1999) uses a three-phase protocol (pre-prepare, prepare, commit) requiring agreement from 2f+1 out of 3f+1 nodes.

BFT is essential in blockchain systems (where nodes are untrusted) and multi-organization systems. However, the O(n^2) message complexity per round limits scalability. Modern variants like HotStuff (used in Facebook's Diem/Libra) reduce this to O(n) by using a leader-driven approach with threshold signatures. The practical tradeoff is clear: if you control all nodes and they are not compromised, crash-fault tolerance (Raft, Paxos) is far more efficient. BFT is reserved for adversarial environments.`,
  ],
  interviewQA: [
    {
      q: "What is the FLP impossibility result and how do practical systems work around it?",
      a: "The Fischer-Lynch-Paterson (1985) result proves that no deterministic algorithm can guarantee consensus in a fully asynchronous distributed system if even one process can crash. The issue is that you cannot distinguish a crashed process from a very slow one. Practical systems work around this by assuming partial synchrony — they use timeouts to suspect failures (if no response within T seconds, assume crash). This means termination is guaranteed only when the system behaves synchronously for long enough. Randomized protocols (like randomized Paxos) offer probabilistic termination guarantees.",
    },
    {
      q: "How does Raft's leader election guarantee at most one leader per term?",
      a: "Each node can vote for at most one candidate per term. A candidate needs a majority of votes to become leader. Since any two majorities overlap, at most one candidate can get a majority in any term. If a candidate does not win (split vote), the term ends with no leader and a new election starts with an incremented term. Randomized election timeouts reduce the probability of repeated split votes.",
    },
    {
      q: "Why was Raft designed when Paxos already solved consensus?",
      a: "Raft was explicitly designed for understandability. Paxos is notoriously difficult to understand and implement correctly — the original paper is abstract, and practical implementations (Multi-Paxos) require many details not specified in the paper. Raft decomposes consensus into clearly separable subproblems (leader election, log replication, safety) with concrete algorithms for each. It specifies practical details like cluster membership changes and log compaction. Empirical studies showed students understood Raft significantly better than Paxos.",
    },
    {
      q: "How does ZAB differ from Raft and Paxos, and why does ZooKeeper use it?",
      a: "ZAB (ZooKeeper Atomic Broadcast) is optimized for primary-backup replication with atomic broadcast rather than general consensus. It has two phases: recovery (electing a leader and synchronizing state) and broadcast (the leader orders and replicates changes). Unlike Raft, ZAB guarantees that all transactions from a previous leader are delivered before any new leader's transactions, preserving causal ordering. ZooKeeper uses ZAB because its workload is read-heavy with relatively few writes — ZAB's design serves reads locally from any replica while funneling writes through the leader, matching ZooKeeper's access patterns well.",
      followUps: [
        "How does ZAB handle leader recovery differently from Raft?",
        "What is the performance impact of ZAB's ordering guarantee?",
      ],
    },
  ],
  followUps: [
    "Why does consensus require a majority rather than any two nodes agreeing?",
    "What happens to availability during a partition in a Raft cluster?",
    "Why is Raft considered more understandable than Paxos, and does that matter?",
  ],
  mcqs: [
    {
      q: "How many node failures can a 5-node Raft cluster tolerate while maintaining consensus?",
      options: ["1", "2", "3", "4"],
      answerIndex: 1,
      explanation:
        "A cluster of 2f+1 nodes tolerates f failures. With 5 nodes (2*2+1), the cluster tolerates 2 failures. 3 nodes remain, forming a majority quorum needed for agreement.",
    },
    {
      q: "How many nodes are required to tolerate f Byzantine faults?",
      options: ["f+1", "2f+1", "3f+1", "4f+1"],
      answerIndex: 2,
      explanation:
        "Byzantine fault tolerance requires 3f+1 nodes because the protocol needs 2f+1 agreeing nodes, and up to f of those might be faulty. This ensures at least f+1 honest nodes agree on the correct value.",
    },
    {
      q: "In Paxos Phase 1, what does an acceptor's 'promise' mean?",
      options: [
        "It will accept the proposer's value",
        "It will not accept proposals with a lower proposal number",
        "It has already decided on a value",
        "It will forward the proposal to all learners",
      ],
      answerIndex: 1,
      explanation:
        "An acceptor's promise means it will not accept any proposal with a number lower than N (the prepare request's number). It may still accept proposals with higher numbers from other proposers.",
    },
    {
      q: "What ensures that a committed Raft log entry is present in all future leaders' logs?",
      options: [
        "The leader sends committed entries to all nodes before stepping down",
        "The election restriction requires candidates to have logs at least as up-to-date as any majority",
        "Committed entries are stored in a separate durable log",
        "ZooKeeper tracks committed entries across leader changes",
      ],
      answerIndex: 1,
      explanation:
        "Raft's election restriction ensures a candidate can only win if its log is at least as up-to-date as a majority of nodes. Since committed entries exist on a majority, any winning candidate must have them.",
    },
  ],
  flashcards: [
    {
      front: "What are the three properties of consensus?",
      back: "Agreement (all correct nodes decide the same value), Validity (the decided value was proposed by some node), and Termination (all correct nodes eventually decide).",
    },
    {
      front: "What is the FLP impossibility result?",
      back: "In a fully asynchronous system, no deterministic algorithm can guarantee consensus if even one process can crash. Practical systems use timeouts (partial synchrony) to work around this.",
    },
    {
      front: "What are the three subproblems Raft decomposes consensus into?",
      back: "Leader election (choosing a single leader per term), Log replication (leader replicates entries to followers), and Safety (guaranteeing committed entries persist across leader changes).",
    },
    {
      front: "What is Multi-Paxos?",
      back: "An optimization of Paxos where a stable leader skips Phase 1 (Prepare) for subsequent decisions, reducing per-decision messages from 4 to 2. Most practical Paxos implementations are actually Multi-Paxos.",
    },
    {
      front: "What is a Raft term?",
      back: "A logical time period acting as a logical clock. Each term begins with an election; at most one leader exists per term. Terms are monotonically increasing and used to detect stale leaders.",
    },
    {
      front: "What is a read lease in consensus protocols?",
      back: "An optimization where the leader serves reads locally for a lease duration without contacting followers. This reduces read latency but reads may be slightly stale if the leader is partitioned and a new leader is elected.",
    },
    {
      front: "How do consensus protocols handle cluster membership changes?",
      back: "Raft uses joint consensus: during transition, decisions require agreement from majorities of both old and new configurations. This prevents split-brain during the membership change.",
    },
  ],
  deepDive: [
    `## Raft Internals: Leader Election and Log Consistency

**Raft's leader election** mechanism is deceptively elegant but hides subtle invariants that are critical for correctness. When a follower's **election timer** expires (randomized between 150ms and 300ms), it transitions to the *candidate* state, increments its **term**, votes for itself, and sends \`RequestVote\` RPCs to all peers. The \`RequestVote\` includes the candidate's **last log index** and **last log term** — this is the *election restriction* that prevents stale candidates from winning. A voter grants its vote only if the candidate's log is at least as up-to-date as its own, where "up-to-date" is defined lexicographically: first compare the **last log term** (higher wins), then the **last log index** (longer wins). This single check is what guarantees the **Leader Completeness Property**: any committed entry will be present in every future leader's log. Without it, a leader with a truncated log could overwrite committed entries on followers, violating safety. The subtlety is that a *committed* entry is one replicated to a majority — and any majority overlaps with the majority that elected the new leader, so the new leader must have that entry.

**Log consistency** in Raft is maintained through the \`AppendEntries\` RPC's **consistency check**. Each \`AppendEntries\` message includes \`prevLogIndex\` and \`prevLogTerm\` — the index and term of the entry immediately preceding the new entries. A follower rejects the RPC if its log does not contain an entry at \`prevLogIndex\` with term \`prevLogTerm\`. On rejection, the leader **decrements** \`nextIndex\` for that follower and retries. This backtracking finds the latest point where the leader and follower agree, and the leader then overwrites everything after that point. This is safe because the leader never overwrites *committed* entries — the election restriction ensures the leader has all committed entries, so anything it overwrites on a follower was *uncommitted* (from a deposed leader's incomplete replication). In practice, implementations use **binary search** or **conflict term optimization** (the follower returns the first index of the conflicting term) to reduce the number of rejected RPCs from O(log length) to O(1) in most cases.

**Raft's commitment rule** has a critical subtlety regarding entries from *previous terms*. A leader cannot commit an entry from a prior term by merely counting replicas — it must commit an entry from its *own* term first, which transitively commits all preceding entries. This rule prevents a scenario (illustrated in Figure 8 of the Raft paper) where an entry replicated to a majority could be overwritten by a future leader. The fix is simple: the leader only updates \`commitIndex\` when an entry from its **current term** is stored on a majority. Once that happens, all prior entries are also committed by the *Log Matching Property* (if two logs contain an entry with the same index and term, all preceding entries are identical). This is one of the most commonly misunderstood aspects of Raft and a frequent source of bugs in implementations.`,

    `## Paxos Deep Dive: From Single-Decree to Multi-Paxos

**Single-decree Paxos** solves the problem of agreeing on exactly one value. The protocol's correctness hinges on the **proposal numbering** invariant: each proposer selects globally unique, monotonically increasing proposal numbers (typically \`round * N + proposer_id\` where N is the number of proposers). In **Phase 1** (Prepare), a proposer sends \`Prepare(n)\` to a quorum of acceptors. An acceptor responds with a *promise* not to accept any proposal numbered less than \`n\`, and piggybacks the highest-numbered proposal it has already accepted (the \`accepted_proposal\` and \`accepted_value\`). In **Phase 2** (Accept), the proposer must use the value from the highest-numbered accepted proposal among the responses — this is the key constraint that preserves safety. If no acceptor had accepted anything, the proposer is free to choose its own value. The proposer sends \`Accept(n, v)\` to a quorum; acceptors accept if they haven't promised to a higher number. A value is **chosen** when a majority of acceptors accept the same proposal number.

The leap from single-decree to **Multi-Paxos** is where most implementation complexity lies. Multi-Paxos runs a separate Paxos instance for each slot in a *replicated log*, but optimizes by electing a **distinguished proposer** (leader). Once a leader completes Phase 1 for a given slot, it can skip Phase 1 for subsequent slots — sending only Phase 2 (Accept) messages, reducing latency from **2 round-trips to 1**. The leader maintains a \`firstUncommittedSlot\` and assigns incoming client requests to consecutive slots. If the leader fails, a new leader must run Phase 1 for all uncommitted slots to discover any previously accepted values. This recovery process is the source of significant complexity: the new leader may find gaps in the log (slots where no value was chosen) and must fill them, possibly with **no-op** entries, before it can proceed.

**Flexible Paxos** (Howard et al., 2016) relaxes the traditional quorum requirement: Phase 1 and Phase 2 quorums need not be the same size — they only need to *intersect*. For example, with 5 nodes you could use a Phase 1 quorum of 4 and a Phase 2 quorum of 2 (since 4+2 > 5, they always intersect). Since Phase 2 is the fast path during normal operation, this reduces the number of nodes that must acknowledge each write, improving throughput. This insight generalizes to **grid quorums** and **hierarchical quorums** for geo-distributed deployments where different data centers have different latency characteristics.`,

    `## Byzantine Fault Tolerance: PBFT and Modern Variants

**PBFT** (Practical Byzantine Fault Tolerance) operates in a system of \`3f+1\` replicas to tolerate \`f\` Byzantine faults. The protocol proceeds in three phases within a **view** (led by a primary replica): **Pre-prepare** — the primary assigns a sequence number to the client request and broadcasts \`<PRE-PREPARE, v, n, d>\` (view, sequence number, digest) to all replicas. **Prepare** — upon receiving a valid pre-prepare, each replica broadcasts \`<PREPARE, v, n, d, i>\` to all other replicas. A replica is *prepared* when it has the pre-prepare and \`2f\` matching prepare messages (total \`2f+1\` including itself). **Commit** — each prepared replica broadcasts \`<COMMIT, v, n, d, i>\`. A replica *commits* when it has \`2f+1\` matching commit messages. The two rounds of all-to-all communication give PBFT its characteristic **O(n^2)** message complexity per operation, which limits practical deployments to around 20-30 replicas.

**View changes** in PBFT handle primary failures. If a replica suspects the primary is faulty (timeout on request processing), it sends a \`<VIEW-CHANGE, v+1, ...>\` message containing its prepared certificates. When the new primary (determined by \`v+1 mod n\`) collects \`2f+1\` view-change messages, it constructs a \`<NEW-VIEW>\` message that proves the view change is legitimate and includes all requests that were prepared in the old view. This ensures no committed request is lost across view changes — analogous to Raft's election restriction but more complex because the adversary is *Byzantine*, not just crash-faulty.

**HotStuff** (Yin et al., 2019) fundamentally reimagines BFT consensus by introducing a *linear* message pattern: instead of all-to-all broadcast, replicas send messages only to the leader, who aggregates them using **threshold signatures** (specifically BLS signatures that can be combined into a single compact proof that \`2f+1\` replicas agreed). HotStuff uses a three-phase protocol (prepare, pre-commit, commit) where each phase involves the leader collecting \`2f+1\` signed votes, combining them into a **Quorum Certificate (QC)**, and broadcasting the QC. This reduces per-phase communication to **O(n)** messages instead of O(n^2). Additionally, HotStuff achieves **optimistic responsiveness** — the protocol proceeds at network speed rather than waiting for predetermined timeouts when the leader is honest. HotStuff's pipelined variant (used in blockchain systems like Diem/Libra and Aptos) amortizes the cost further by overlapping phases of consecutive proposals, achieving effective **one-round-trip latency** during normal operation.`,
  ],

  code: [
    {
      language: "cpp",
      caption:
        "Simplified Raft node state and RequestVote RPC handler demonstrating the **election restriction** and **term-based voting** logic.",
      source: `#include <cstdint>
#include <vector>
#include <string>
#include <mutex>
#include <optional>

enum class Role { Follower, Candidate, Leader };

struct LogEntry {
    uint64_t term;
    std::string command;
};

struct RequestVoteArgs {
    uint64_t term;
    uint32_t candidate_id;
    uint64_t last_log_index;
    uint64_t last_log_term;
};

struct RequestVoteReply {
    uint64_t term;
    bool vote_granted;
};

class RaftNode {
    std::mutex mu_;
    uint32_t id_;
    uint64_t current_term_ = 0;
    std::optional<uint32_t> voted_for_;
    std::vector<LogEntry> log_;         // 1-indexed; log_[0] is sentinel
    uint64_t commit_index_ = 0;
    uint64_t last_applied_ = 0;
    Role role_ = Role::Follower;

    // Leader-only state (reinitialized on election)
    std::vector<uint64_t> next_index_;  // per follower
    std::vector<uint64_t> match_index_; // per follower

public:
    explicit RaftNode(uint32_t id) : id_(id) {
        // Sentinel entry at index 0 with term 0
        log_.push_back({0, ""});
    }

    /**
     * Handle an incoming RequestVote RPC.
     *
     * Grants vote only if:
     *   1. Candidate's term >= our current term
     *   2. We haven't voted for someone else this term
     *   3. Candidate's log is at least as up-to-date as ours
     *      (compared lexicographically: last_log_term, then last_log_index)
     */
    RequestVoteReply handleRequestVote(const RequestVoteArgs& args) {
        std::lock_guard<std::mutex> lock(mu_);
        RequestVoteReply reply{current_term_, false};

        // Step down if we see a higher term
        if (args.term > current_term_) {
            current_term_ = args.term;
            role_ = Role::Follower;
            voted_for_.reset();
        }

        // Reject stale term
        if (args.term < current_term_) {
            reply.term = current_term_;
            return reply;
        }

        // Check if we can vote for this candidate
        bool can_vote = !voted_for_.has_value()
                        || voted_for_.value() == args.candidate_id;

        // Election restriction: candidate's log must be at least as
        // up-to-date as ours
        uint64_t our_last_term  = log_.back().term;
        uint64_t our_last_index = log_.size() - 1;

        bool log_ok = (args.last_log_term > our_last_term)
                      || (args.last_log_term == our_last_term
                          && args.last_log_index >= our_last_index);

        if (can_vote && log_ok) {
            voted_for_ = args.candidate_id;
            reply.vote_granted = true;
            // Reset election timer (omitted for brevity)
        }

        reply.term = current_term_;
        return reply;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Paxos acceptor implementing **Phase 1 (Prepare)** and **Phase 2 (Accept)** with the promise/accept invariants.",
      source: `#include <cstdint>
#include <optional>
#include <string>
#include <mutex>

struct Proposal {
    uint64_t number;   // Globally unique proposal number
    std::string value;
};

struct PrepareRequest {
    uint64_t proposal_number;
};

struct PrepareResponse {
    bool promise_granted;
    uint64_t highest_promised;
    std::optional<Proposal> accepted; // Highest-numbered accepted proposal
};

struct AcceptRequest {
    uint64_t proposal_number;
    std::string value;
};

struct AcceptResponse {
    bool accepted;
    uint64_t highest_promised;
};

/**
 * A single Paxos **Acceptor**.
 *
 * Invariants maintained:
 *   - Once a promise is made for proposal N, no proposal < N is accepted.
 *   - The accepted proposal is always the highest-numbered one accepted.
 */
class PaxosAcceptor {
    std::mutex mu_;

    // Highest proposal number we have promised not to accept below
    uint64_t highest_promised_ = 0;

    // The accepted proposal (if any)
    std::optional<Proposal> accepted_proposal_;

public:
    /**
     * Phase 1: Handle a Prepare(N) request.
     *
     * If N > highest_promised_:
     *   - Update highest_promised_ to N (promise not to accept < N)
     *   - Return the currently accepted proposal (if any)
     * Otherwise:
     *   - Reject (we already promised to a higher proposal)
     */
    PrepareResponse handlePrepare(const PrepareRequest& req) {
        std::lock_guard<std::mutex> lock(mu_);
        PrepareResponse resp;

        if (req.proposal_number > highest_promised_) {
            highest_promised_ = req.proposal_number;
            resp.promise_granted = true;
            resp.highest_promised = highest_promised_;
            resp.accepted = accepted_proposal_;
        } else {
            resp.promise_granted = false;
            resp.highest_promised = highest_promised_;
            resp.accepted = std::nullopt;
        }

        return resp;
    }

    /**
     * Phase 2: Handle an Accept(N, V) request.
     *
     * Accept if and only if N >= highest_promised_.
     * The proposer must set V to the value from the highest-numbered
     * accepted proposal returned in Phase 1, or its own value if
     * no acceptor had previously accepted.
     */
    AcceptResponse handleAccept(const AcceptRequest& req) {
        std::lock_guard<std::mutex> lock(mu_);
        AcceptResponse resp;

        if (req.proposal_number >= highest_promised_) {
            highest_promised_ = req.proposal_number;
            accepted_proposal_ = Proposal{req.proposal_number, req.value};
            resp.accepted = true;
        } else {
            resp.accepted = false;
        }

        resp.highest_promised = highest_promised_;
        return resp;
    }

    /** Query the currently accepted proposal (for learners). */
    std::optional<Proposal> getAccepted() const {
        return accepted_proposal_;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Raft **AppendEntries** handler demonstrating the log consistency check, conflict resolution, and commit index advancement.",
      source: `#include <cstdint>
#include <vector>
#include <string>
#include <algorithm>
#include <mutex>

struct LogEntry {
    uint64_t term;
    std::string command;
};

struct AppendEntriesArgs {
    uint64_t term;
    uint32_t leader_id;
    uint64_t prev_log_index;
    uint64_t prev_log_term;
    std::vector<LogEntry> entries;
    uint64_t leader_commit;
};

struct AppendEntriesReply {
    uint64_t term;
    bool success;
    // Optimization: on failure, return info to help leader
    // skip ahead instead of decrementing nextIndex one at a time
    uint64_t conflict_term;
    uint64_t conflict_index;
};

class RaftFollower {
    std::mutex mu_;
    uint64_t current_term_ = 0;
    std::vector<LogEntry> log_; // 1-indexed, log_[0] is sentinel
    uint64_t commit_index_ = 0;
    uint64_t last_applied_ = 0;

public:
    RaftFollower() {
        log_.push_back({0, ""}); // Sentinel
    }

    /**
     * Handle AppendEntries RPC from the leader.
     *
     * Steps:
     *   1. Reject if leader's term < current term
     *   2. Consistency check: log must contain entry at prev_log_index
     *      with term == prev_log_term
     *   3. On conflict: delete the conflicting entry and all after it
     *   4. Append new entries not already in the log
     *   5. Advance commit_index if leader_commit > commit_index
     */
    AppendEntriesReply handleAppendEntries(const AppendEntriesArgs& args) {
        std::lock_guard<std::mutex> lock(mu_);
        AppendEntriesReply reply{current_term_, false, 0, 0};

        // Step down / update term
        if (args.term > current_term_) {
            current_term_ = args.term;
        }

        // Reject stale leaders
        if (args.term < current_term_) {
            reply.term = current_term_;
            return reply;
        }

        uint64_t last_index = log_.size() - 1;

        // Consistency check: do we have the prev entry?
        if (args.prev_log_index > last_index) {
            // We don't have enough entries
            reply.conflict_term  = 0;
            reply.conflict_index = last_index + 1;
            return reply;
        }

        if (log_[args.prev_log_index].term != args.prev_log_term) {
            // Conflicting entry at prev_log_index
            uint64_t conflict_term = log_[args.prev_log_index].term;
            reply.conflict_term = conflict_term;

            // Find first index with this conflicting term
            uint64_t idx = args.prev_log_index;
            while (idx > 0 && log_[idx - 1].term == conflict_term) {
                --idx;
            }
            reply.conflict_index = idx;
            return reply;
        }

        // Append new entries, handling overlaps
        for (size_t i = 0; i < args.entries.size(); ++i) {
            uint64_t log_idx = args.prev_log_index + 1 + i;

            if (log_idx < log_.size()) {
                if (log_[log_idx].term != args.entries[i].term) {
                    // Conflict: truncate log from here
                    log_.resize(log_idx);
                    log_.push_back(args.entries[i]);
                }
                // else: entry already matches, skip
            } else {
                log_.push_back(args.entries[i]);
            }
        }

        // Advance commit index
        if (args.leader_commit > commit_index_) {
            uint64_t new_last = log_.size() - 1;
            commit_index_ = std::min(args.leader_commit, new_last);
        }

        // Apply committed entries to state machine
        while (last_applied_ < commit_index_) {
            ++last_applied_;
            // applyToStateMachine(log_[last_applied_].command);
        }

        reply.success = true;
        reply.term = current_term_;
        return reply;
    }
};`,
    },
  ],

  diagrams: [
    {
      title: "Raft Leader Election Sequence",
      kind: "sequence",
      caption: "A follower times out, becomes a candidate, broadcasts RequestVote, collects a majority, and transitions to leader sending heartbeats.",
      mermaid: `sequenceDiagram
    participant A as Node A - Follower
    participant B as Node B - Follower
    participant C as Node C - Follower

    Note over A: Election timeout expires
    A->>A: Increment term, vote for self
    Note over A: Transition to Candidate
    A->>B: RequestVote term=T+1
    A->>C: RequestVote term=T+1
    B->>B: Check term and log freshness
    B-->>A: VoteGranted true
    C->>C: Check term and log freshness
    C-->>A: VoteGranted true
    Note over A: Majority votes received - become Leader
    loop Heartbeat
        A->>B: AppendEntries heartbeat
        A->>C: AppendEntries heartbeat
    end`,
    },
    {
      title: "Raft Node State Transitions",
      kind: "state",
      caption: "A Raft node cycles among Follower, Candidate, and Leader states driven by election timeouts, vote outcomes, and term comparisons.",
      mermaid: `stateDiagram-v2
    [*] --> Follower
    Follower --> Candidate : election timeout fires
    Candidate --> Leader : receives majority votes
    Candidate --> Follower : discovers higher term
    Candidate --> Candidate : election timeout - split vote
    Leader --> Follower : discovers higher term
    Leader --> Follower : network partition healed`,
    },
    {
      title: "Distributed Consensus System Architecture",
      kind: "architecture",
      caption: "A five-node Raft cluster with one leader and four followers; clients route all writes through the leader which replicates to a quorum before committing.",
      mermaid: `graph TD
    Client["Client"] --> LB["Load Balancer"]
    LB --> Leader["Leader Node 1"]
    Leader -->|"AppendEntries"| F1["Follower Node 2"]
    Leader -->|"AppendEntries"| F2["Follower Node 3"]
    Leader -->|"AppendEntries"| F3["Follower Node 4"]
    Leader -->|"AppendEntries"| F4["Follower Node 5"]
    F1 -->|"ACK"| Leader
    F2 -->|"ACK"| Leader
    Leader --> SM["State Machine - committed entries"]
    Note1["Majority = 3 of 5 nodes"]`,
    },
    {
      title: "Paxos Prepare and Accept Flow",
      kind: "flow",
      caption: "Paxos two-phase protocol: Phase 1 obtains promises from a majority of acceptors, Phase 2 sends the Accept request to commit a value.",
      mermaid: `flowchart TD
    P["Proposer picks N"] --> PrepBroadcast["Broadcast Prepare N to all acceptors"]
    PrepBroadcast --> PromiseCheck{"Majority promised?"}
    PromiseCheck -->|"No"| HigherN["Increment N, retry"]
    HigherN --> PrepBroadcast
    PromiseCheck -->|"Yes"| PriorVal{"Prior accepted value?"}
    PriorVal -->|"Yes"| UseHighest["Use highest-N prior value"]
    PriorVal -->|"No"| UseOwn["Use proposer own value"]
    UseHighest --> AcceptBroadcast["Broadcast Accept N value"]
    UseOwn --> AcceptBroadcast
    AcceptBroadcast --> AcceptCheck{"Majority accepted?"}
    AcceptCheck -->|"Yes"| Chosen["Value chosen - notify learners"]
    AcceptCheck -->|"No"| HigherN`,
    },
  ],

  animations: [
    {
      title: "Raft electing a leader and committing an entry",
      steps: [
        {
          label: "Followers wait",
          detail: "Each follower has a randomised election timeout, so they don't all time out together.",
        },
        {
          label: "Timeout fires",
          detail: "One follower becomes a candidate, increments the term, and requests votes.",
        },
        {
          label: "Majority votes",
          detail: "With votes from a majority it becomes leader. A majority is required so two leaders can't be elected in the same term.",
        },
        {
          label: "Client writes",
          detail: "The leader appends the entry to its log and replicates it to followers.",
        },
        {
          label: "Committed",
          detail: "Once a majority has persisted it, the entry is committed and the leader replies to the client.",
        },
        {
          label: "Partition",
          detail: "The minority side can't reach a majority, so it cannot commit anything — consistency is preserved by refusing to be available.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "Raft",
      "Paxos / Multi-Paxos",
      "ZAB (ZooKeeper)",
      "PBFT",
    ],
    rows: [
      [
        "**Fault model**",
        "Crash-fault tolerant",
        "Crash-fault tolerant",
        "Crash-fault tolerant",
        "Byzantine fault tolerant",
      ],
      [
        "**Nodes required**",
        "`2f+1` for `f` faults",
        "`2f+1` for `f` faults",
        "`2f+1` for `f` faults",
        "`3f+1` for `f` faults",
      ],
      [
        "**Leader required?**",
        "Yes (strong leader)",
        "Optional (*distinguished proposer* in Multi-Paxos)",
        "Yes (primary)",
        "Yes (primary), rotated on view change",
      ],
      [
        "**Message complexity**",
        "O(n) per operation",
        "O(n) per operation (Multi-Paxos steady state)",
        "O(n) per write",
        "O(n^2) per operation",
      ],
      [
        "**Latency (writes)**",
        "1 round-trip (leader to majority)",
        "1 round-trip (Multi-Paxos steady state)",
        "1 round-trip (primary to quorum)",
        "2 round-trips (pre-prepare + prepare + commit)",
      ],
      [
        "**Log ordering**",
        "Total order via leader",
        "Per-slot consensus; gaps possible",
        "Total order with *causal prefix* guarantee",
        "Total order via primary",
      ],
      [
        "**Understandability**",
        "High (designed for clarity)",
        "Low (abstract specification)",
        "Medium",
        "Low (complex view-change protocol)",
      ],
      [
        "**Reconfiguration**",
        "Joint consensus (two-phase)",
        "Reconfiguration protocol (varies)",
        "Dynamic membership via ZK config",
        "View change with 2f+1 agreement",
      ],
      [
        "**Key implementations**",
        "etcd, CockroachDB, TiKV, Consul",
        "Google Chubby, Spanner (via Paxos)",
        "Apache ZooKeeper",
        "Hyperledger, Diem/Libra (HotStuff variant)",
      ],
      [
        "**Read optimization**",
        "Read leases, *ReadIndex* protocol",
        "Read at any acceptor (stale reads)",
        "Reads served locally by any replica",
        "Reads require full BFT round",
      ],
    ],
  },

  exercises: [
    "**Raft Split-Brain Scenario**: Consider a 5-node Raft cluster where a network partition separates nodes {A, B} from {C, D, E}. Node A was the leader before the partition. Explain step-by-step what happens: (a) Can node A continue committing entries? (b) What happens on the {C, D, E} side? (c) When the partition heals, how does the cluster reconcile? Trace the term numbers and log states through the entire process.",
    "**Paxos Dueling Proposers**: Two proposers, P1 and P2, repeatedly preempt each other with increasing proposal numbers in single-decree Paxos (a *livelock* scenario). (a) Show a specific execution trace where neither proposer succeeds after 4 rounds. (b) Explain why this does not violate safety. (c) Design a backoff strategy that probabilistically breaks the livelock. (d) Explain how Multi-Paxos avoids this problem in practice.",
    "**Implement Raft Log Compaction**: Write C++ pseudocode for Raft **snapshot** and **InstallSnapshot** RPC handling. Your implementation should: (a) decide when to trigger a snapshot (e.g., when log exceeds 10,000 entries), (b) serialize the state machine state and the last included index/term, (c) handle the `InstallSnapshot` RPC on the follower side (replacing its log with the snapshot if the snapshot covers entries the follower doesn't have), (d) handle the case where the follower already has entries beyond the snapshot.",
    "**BFT Quorum Arithmetic**: Prove why Byzantine fault tolerance requires `3f+1` nodes rather than `2f+1`. Construct a concrete scenario with `2f+1 = 5` nodes and `f = 2` Byzantine nodes where safety is violated (two different correct nodes commit different values). Then show why `3f+1 = 7` nodes prevents this scenario.",
    "**Consensus Performance Analysis**: You are deploying a Raft-based key-value store across 3 data centers: US-East (primary), US-West (80ms RTT to East), and EU-West (120ms RTT to East). (a) What is the minimum write latency with a 3-node cluster (one per DC)? (b) What if you use a 5-node cluster (2 in East, 2 in West, 1 in EU)? (c) Design a *read lease* mechanism and calculate the maximum staleness window. (d) How would you handle the case where the leader is in EU-West?",
  ],

  cheatSheet: [
    "**Quorum formula**: For crash faults, `2f+1` nodes tolerate `f` failures (majority quorum = `f+1`). For Byzantine faults, `3f+1` nodes tolerate `f` failures (quorum = `2f+1`). *Two quorums must always intersect* — this is the fundamental invariant enabling consensus.",
    "**Raft term rule**: Every RPC includes the sender's term. If a node receives a message with a higher term, it *immediately steps down* to follower and updates its term. If it receives a message with a *lower* term, it rejects the message. This ensures stale leaders are deposed quickly.",
    "**Paxos proposer rule**: In Phase 2, the proposer **must** use the value from the *highest-numbered* accepted proposal returned in Phase 1 promises. Only if *no* acceptor reported an accepted value may the proposer use its own. Violating this breaks safety.",
    "**Raft commitment subtlety**: A leader **cannot** commit entries from *previous terms* by counting replicas alone. It must first commit an entry from its *own current term*, which transitively commits all prior entries via the Log Matching Property. See Raft paper Figure 8.",
    "**FLP workaround**: Deterministic consensus is impossible in pure async systems (FLP 1985). Practical protocols use **partial synchrony** — they assume the system is eventually synchronous (messages are delivered within a bound *eventually*). Safety holds always; liveness requires synchrony.",
    "**Leader lease for reads**: To serve linearizable reads without a quorum round-trip, the leader grants itself a *lease* (shorter than the election timeout). During the lease, no new leader can be elected, so the current leader's state is authoritative. If the lease expires, the leader must re-confirm leadership before serving reads.",
  ],

  revisionNotes: [
    "**Core invariant**: All consensus protocols rely on *quorum intersection* — any two quorums share at least one member. For crash-fault protocols (Raft, Paxos), quorums are simple majorities (`f+1` of `2f+1`). For BFT (PBFT), quorums are `2f+1` of `3f+1`. This intersection guarantees that any decision is visible to future quorums.",
    "**Raft vs Paxos mental model**: Think of Raft as a *strong-leader protocol* where the leader is the single source of truth — all writes go through it, and it pushes to followers. Paxos is more *symmetric* — any proposer can propose, and the protocol resolves conflicts via proposal numbers. Multi-Paxos adds a stable leader for efficiency, making it operationally similar to Raft.",
    "**Safety vs. liveness**: Consensus protocols guarantee **safety** (agreement + validity) *unconditionally* — even during partitions, no two correct nodes decide differently. **Liveness** (termination) requires partial synchrony — during a partition or asynchronous period, the protocol may stall (no new values decided) but never makes a wrong decision. This is the fundamental tradeoff dictated by FLP.",
    "**Practical deployment checklist**: (1) Use **odd-numbered** clusters (3, 5, 7) — even numbers waste a node without improving fault tolerance. (2) Set election timeouts to *at least 10x* the heartbeat interval. (3) Monitor **commit latency** (time from client request to majority ack) — it reveals network and disk bottlenecks. (4) Implement **log compaction** (snapshots) early — unbounded logs cause OOM and slow recovery. (5) Test **leader failover** under load before production.",
    "**Key complexity comparison**: Raft/Multi-Paxos achieve **O(n)** messages per decision in steady state (leader sends to all, majority responds). PBFT requires **O(n^2)** due to all-to-all communication in the prepare and commit phases. HotStuff achieves **O(n)** for BFT using threshold signatures and a star topology (all messages go through the leader).",
  ],

  resources: [
    {
      label: "In Search of an Understandable Consensus Algorithm (Raft) — Ongaro & Ousterhout",
      kind: "paper",
    },
    {
      label: "Paxos Made Simple — Leslie Lamport",
      kind: "paper",
    },
    {
      label: "etcd documentation — Raft in practice",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "Consensus",
      definition:
        "The problem of getting distributed nodes to agree on a single value or sequence of values, satisfying agreement, validity, and termination properties.",
    },
    {
      term: "Paxos",
      definition:
        "A foundational consensus algorithm using proposers, acceptors, and learners with a two-phase prepare/accept protocol.",
    },
    {
      term: "Raft",
      definition:
        "A consensus algorithm designed for understandability, decomposing the problem into leader election, log replication, and safety. Used in etcd, CockroachDB, TiKV.",
    },
    {
      term: "Quorum",
      definition:
        "A majority subset of nodes (more than half) required for decisions in consensus protocols. In a cluster of 2f+1 nodes, a quorum is f+1.",
    },
    {
      term: "FLP Impossibility",
      definition:
        "The proof that deterministic consensus is impossible in a fully asynchronous system with even one crash failure.",
    },
    {
      term: "Term (Raft)",
      definition:
        "A logical time period in Raft, beginning with an election. At most one leader exists per term. Used to detect stale leaders.",
    },
    {
      term: "Committed Entry",
      definition:
        "A log entry that has been replicated to a majority of nodes and is guaranteed to be durable and applied to all state machines.",
    },
    {
      term: "Byzantine Failure",
      definition:
        "A failure mode where a node behaves arbitrarily — sending conflicting messages, fabricating data, or colluding with other faulty nodes. Requires 3f+1 nodes to tolerate f faults.",
    },
    {
      term: "ZAB (ZooKeeper Atomic Broadcast)",
      definition:
        "The consensus protocol underlying Apache ZooKeeper, designed for primary-backup replication with atomic broadcast and causal ordering guarantees.",
    },
    {
      term: "Split Vote",
      definition:
        "A situation in Raft where multiple candidates start elections simultaneously and split the votes so no candidate achieves a majority. Resolved by randomized election timeouts.",
    },
    {
      term: "Log Compaction",
      definition:
        "The process of reducing log size by replacing committed entries with a state snapshot. Necessary because consensus logs grow unbounded and slow down recovery.",
    },
  ],
};
