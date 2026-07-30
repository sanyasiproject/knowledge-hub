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
