import type { TopicContent } from "../types";

export const designTicketmaster: TopicContent = {
  quickSummary: [
    "Ticket booking systems face extreme concurrency challenges — millions of users compete for thousands of seats during popular event on-sales, requiring distributed locking, seat reservation with TTL, and queue-based access control to prevent overselling.",
    "Seat reservation uses a two-phase approach: a temporary hold (TTL of 5-10 minutes) reserves the seat while the user completes payment, and only after successful payment does the hold convert to a confirmed booking — expired holds automatically release seats back to inventory.",
    "A virtual waiting room (queue-based access control) throttles incoming traffic during flash sales, admitting users at a controlled rate that the booking system can handle, preventing system overload while providing a fair, first-come-first-served experience.",
    "Inventory management must handle the tension between consistency (never sell the same seat twice) and availability (never show a seat as unavailable when it is actually free) — optimistic locking with version checks is preferred over pessimistic locks for read-heavy seat browsing.",
    "The system must handle partial failures gracefully: if payment succeeds but booking confirmation fails, the system must either complete the booking asynchronously or refund automatically — orphaned holds and zombie reservations are detected and cleaned up by a background reconciliation process.",
  ],
  detailed: [
    "## Seat Inventory Model and Data Design\nThe seat inventory is the core data structure of the system. Each venue has a hierarchical model: venue → sections → rows → seats. Each seat has a unique identifier (venue_id + section + row + seat_number) and a state (AVAILABLE, HELD, BOOKED, BLOCKED). The state transitions are: AVAILABLE → HELD (user selects seat), HELD → BOOKED (payment confirmed), HELD → AVAILABLE (hold expires or user cancels), AVAILABLE → BLOCKED (venue removes from sale). For general admission (GA) events without assigned seating, the inventory is a simple counter of available tickets per tier (e.g., 5000 GA, 500 VIP). The seat map is pre-loaded for each event and cached aggressively — it changes only when the venue modifies the layout, which happens rarely. Pricing is attached at the section or row level and can vary by event (dynamic pricing). The database schema uses a composite key (event_id, seat_id) with the state and a version column for optimistic locking. Indexes on (event_id, state) enable efficient queries for available seats in a section. At scale, each event's seat inventory can be partitioned onto a dedicated database shard or Redis instance, since events are independent of each other.",

    "## Capacity Estimation: Why the Waiting Room Exists\nRun the arithmetic before choosing the architecture — the numbers explain almost every design decision in this system. Consider a stadium on-sale: 100K tickets, 10M fans arriving in the first minute. That is a 100:1 ratio of demand to supply — 99% of the people hitting your system will not get a ticket no matter how fast it is, so the goal is not to serve everyone, it is to serve exactly as many as the inventory supports while everyone else waits fairly. If each admitted user takes about 5 minutes to browse, hold, and pay, and you want roughly 50K concurrent active shoppers on the booking backend, the admission rate is 50,000 / 300s ≈ 170 users/sec (round to 200-1,000/sec depending on backend headroom); at 500/sec the entire 10M-person queue would take 10,000,000 / 500 = 20,000s ≈ 5.5 hours to drain, but the sale ends long before that — the queue mostly exists to reject demand gracefully, not to serve it all. The database write load is bounded by seats, not by fans: there are only 100K confirmed-booking row updates in the entire sale, so even if 90% sell in the first 2 minutes that is 90,000 / 120 = 750 writes/sec — trivial for any relational database. Hold churn is the real hot path: if each ticket is held 3-5 times before someone completes payment (abandonments, payment failures), that is 300-500K hold/release operations, peaking around 5-10K ops/sec — comfortably inside a single Redis node's 100K+ ops/sec budget. The crushing load is reads: 10M queued users polling status every 3 seconds is 3.3M requests/sec, which is why queue polling must terminate at the edge (CDN or a lightweight queue tier) and never touch the booking backend. Key insight: the waiting room converts an unbounded, spiky arrival rate into a bounded, tunable admission rate — the backend is sized for the admission rate, and the edge is sized for the arrival rate.",

    "## Seat Reservation with TTL and Distributed Locking\nWhen a user selects a seat, the system must atomically transition it from AVAILABLE to HELD and associate it with the user's session, preventing other users from selecting the same seat. This is implemented as an optimistic locking update: UPDATE seats SET state='HELD', held_by=user_id, held_until=NOW()+5min, version=version+1 WHERE event_id=? AND seat_id=? AND state='AVAILABLE' AND version=?. If the update affects zero rows, the seat was already taken — the user sees an error and must select another seat. The hold has a TTL (typically 5-10 minutes) that gives the user time to complete payment. A background process runs every 30 seconds, querying for seats where held_until < NOW() and transitioning them back to AVAILABLE. Redis can augment or replace the database for hot events: the seat state is cached in Redis with EXPIRE for automatic TTL management, and the database is updated asynchronously. For events with extremely high concurrency (100K+ simultaneous seat selections), the database becomes a bottleneck — Redis with Lua scripts provides atomic read-modify-write operations at 100K+ ops/sec on a single node. The Lua script checks state, sets HELD with TTL, and returns success/failure in a single atomic operation.",

    "## Virtual Waiting Room and Traffic Management\nDuring high-demand on-sales (popular concerts, sports finals), millions of users arrive within seconds of the sale opening. Without throttling, this traffic surge overwhelms the booking system, causing cascading failures, timeouts, and a terrible user experience. The virtual waiting room is a queue that sits in front of the booking system. When an on-sale begins, all users are placed in a queue and assigned a position. Users are admitted to the booking system at a controlled rate (e.g., 1000 users per second) based on the system's measured capacity. The queue is implemented as a distributed queue (Redis sorted set with join timestamp as score, or a dedicated queue service like AWS SQS). Each user receives a queue token and polls for their turn — the polling response includes their current position and estimated wait time. When admitted, the token is exchanged for a booking session with a TTL. Anti-gaming measures prevent queue manipulation: tokens are tied to device fingerprints to prevent one person from joining the queue multiple times, and CAPTCHA is presented before queue entry. The admission rate is dynamically adjusted based on system health metrics (error rate, latency, database connection pool usage).",

    "## Payment Integration and Booking Confirmation\nThe booking flow after seat selection involves: (1) create a reservation record linking the user, event, and held seats; (2) redirect to payment; (3) on payment success, transition seats from HELD to BOOKED and confirm the reservation; (4) on payment failure or timeout, release the hold. This flow must handle several failure scenarios. If the payment provider times out, the system must query the provider for the payment status before deciding whether to confirm or release — never assume failure on timeout. If payment succeeds but the booking confirmation fails (e.g., database error), the system must retry the confirmation with exponential backoff, using an idempotency key to prevent duplicate bookings. If retries exhaust, a background reconciliation process detects 'paid but unconfirmed' reservations and completes them. The reverse scenario — confirmation succeeds but payment actually failed (delayed webhook) — triggers an automatic cancellation and refund. The booking confirmation generates a unique ticket with a QR code or barcode, sent to the user via email and stored in their account. For multi-seat bookings, all seats in a single reservation are handled atomically: either all are booked or none (no partial bookings).",

    "## Scaling for Flash Sales and High-Demand Events\nA popular event on-sale might see 10 million users competing for 50,000 tickets, with 90% of tickets sold in the first 2 minutes. The system must handle: peak API traffic of 100K+ requests per second, peak seat selection attempts of 50K+ per second, and peak payment initiations of 10K+ per second. The architecture separates read-heavy operations (browsing seat maps, checking availability) from write-heavy operations (holding seats, confirming bookings). Read operations are served from a cached seat map with eventual consistency (a few seconds stale is acceptable for browsing). Write operations go through the distributed locking layer (Redis) with strong consistency per seat. The system is horizontally scaled: multiple application server instances behind a load balancer, with sticky sessions to keep a user's booking flow on the same instance. Auto-scaling triggers on queue depth and CPU metrics. The database is sharded by event_id, so different events do not compete for resources. For the highest-demand events, a dedicated infrastructure stack (separate Redis cluster, database shard, and application server pool) is provisioned in advance. Post-sale, the infrastructure is scaled down. Monitoring dashboards track real-time metrics: tickets sold per second, queue depth, seat hold rate, payment success rate, and system error rate.",
  ],
  deepDive: [
    "The choice between optimistic and pessimistic locking for seat reservation has significant implications for system behavior under load. Pessimistic locking (SELECT FOR UPDATE) holds a database lock on the seat row while the user makes their selection, preventing any other user from even reading the seat's state. This guarantees consistency but creates contention: if 1000 users try to select seats in the same section simultaneously, they serialize on the database lock, causing massive latency spikes and potential deadlocks. Optimistic locking (version-based compare-and-swap) allows all users to read seat availability concurrently and only check for conflicts at write time — if two users select the same seat, one succeeds and the other gets a conflict error. The conflict rate depends on the ratio of concurrent users to available seats: for an event with 50,000 seats and 10,000 concurrent selectors, the probability of two users selecting the exact same seat is low (about 0.01% per selection). For a nearly sold-out event with 100 remaining seats and 10,000 competing users, the conflict rate approaches 99%. In this regime, optimistic locking degrades because almost every attempt fails and must be retried. The practical solution is a hybrid: use optimistic locking for general seat selection, but switch to a queue-and-assign model for the last few percent of seats, where the system assigns the next available seat rather than letting users choose.",

    "Distributed seat locking at extreme scale (100K+ concurrent seat selections per second) pushes beyond what a single database can handle, even with optimistic locking. The solution is to move the hot-path locking to Redis, which supports 100K+ atomic operations per second on a single node and can be clustered for higher throughput. A Redis Lua script implements the atomic seat state transition: check if the seat key exists and its state is AVAILABLE, set it to HELD with an EXPIRE (TTL), and return success — all in a single atomic operation that cannot be interrupted. The Redis state is the authority for seat availability during active sales, while the relational database is the durable record of confirmed bookings. A synchronization layer ensures that Redis and the database stay consistent: when a booking is confirmed, the database is updated first (source of truth), then Redis is updated; if they diverge, the database wins. Failure of a Redis node during a sale is handled by Redis Cluster failover — the replica takes over within seconds, and any seats held on the failed node whose TTL has not been replicated will simply become available again (better to release a few holds than to lose availability). This eventual consistency on failure is acceptable because the hold is just a temporary reservation, not a confirmed booking.",

    "The economics and fairness of ticket sales create unique design requirements. Scalpers use bots to buy tickets faster than humans, leading to resale at inflated prices. Anti-bot measures include: CAPTCHA at queue entry (invisible reCAPTCHA for minimal friction, with escalation to visual CAPTCHA for suspicious behavior), device fingerprinting to detect multiple sessions from the same device, rate limiting per IP address and per user account, and behavioral analysis (human users move mice, pause between clicks, and make mistakes — bots submit forms instantly with perfect accuracy). Purchase limits (e.g., maximum 4 tickets per customer) are enforced per account and per payment method. Verified fan programs (like Ticketmaster's Verified Fan) pre-register interested buyers and use lottery or priority queues instead of first-come-first-served, reducing the advantage of speed that bots exploit. Dynamic pricing adjusts ticket prices based on demand, reducing the economic incentive for scalping — if the primary market price is close to the resale market price, scalping becomes unprofitable. These measures exist in tension with user experience: every anti-bot check adds friction for legitimate buyers.",

    "Post-sale operations and the secondary market add significant complexity. Ticket transfers must be supported (sending a ticket to another person), requiring the ticket identity to be mutable while maintaining an audit trail. Refund policies vary by event and must be enforced: some events allow refunds until 48 hours before the event, others are non-refundable. For cancelled or postponed events, the system must bulk-process refunds for all ticket holders. Waitlists for sold-out events must be managed: when a ticket is released (refund, cancellation, or transfer failure), the next person on the waitlist is offered the ticket with a time-limited acceptance window. The secondary marketplace (resale) integrates with the primary system: resale tickets are verified against the original booking, transferred to the new buyer, and often subject to price caps set by the venue or artist. All of these operations must maintain the fundamental invariant: the number of confirmed bookings for an event never exceeds the venue capacity, and each confirmed booking maps to exactly one valid ticket.",

    "Overselling prevention comes down to a choice between two correct designs: pessimistic seat holds with a TTL, or optimistic version-checks at confirm time — and for assigned seating, holds win on user experience, not on correctness. The optimistic design lets any number of users put the same seat in their cart and resolves the conflict only at checkout: the confirm runs UPDATE seats SET state='BOOKED' WHERE seat_id=? AND version=?, exactly one user succeeds, and everyone else learns after entering payment details that the seat is gone. That is technically consistent but a terrible experience — the user invested 3-4 minutes of checkout effort and lost a race they did not know they were in. The pessimistic-hold design moves the conflict to the cheapest possible moment: the instant of seat selection. The atomic hold (Redis Lua script or conditional UPDATE with state='AVAILABLE') either succeeds in milliseconds or fails immediately, so the losing user just clicks a different seat — one wasted click instead of one wasted checkout. The TTL is what makes pessimistic holds safe at scale: unlike a classic pessimistic database lock that can be held indefinitely by a crashed client, a hold self-releases after 5-10 minutes, bounding the worst-case inventory lockup. Key insight: the hold is not the final guard — the confirm step still performs a conditional transition (HELD by this user → BOOKED) and the database keeps a uniqueness invariant on booked seats, so even a bug in the hold layer cannot double-sell. In practice: production systems layer both — pessimistic holds for UX, plus an optimistic conditional confirm as the last line of defense.",

    "The waiting room is a fairness mechanism as much as a load shedder, and its internal design matters. Arrival-time ordering sounds fair but rewards network proximity and scripted clients — the user on fiber next to the data center always beats the user on mobile. A common refinement is randomized batching: everyone who arrives within the same short window (for example, the 60 seconds before the on-sale opens) is assigned a random position within that batch, so pre-positioning gives no advantage; arrivals after the sale opens are ordered behind the batch by true arrival time. Admission itself is a token bucket: the bucket refills at the target admission rate (say 500 tokens/sec), each admitted user consumes a token, and the rate is adjusted in real time from backend health signals — p99 booking latency, error rate, database connection pool saturation. Admission grants a signed, short-lived token (a JWT carrying queue id, user id, and expiry) that the API gateway validates statelessly on every booking request, so a user cannot skip the queue by guessing URLs and the booking tier does not need to consult queue state. Queue position and estimated wait are served from an edge-cacheable endpoint — position only needs to be approximate (updated every few seconds), which turns 3M+ polls/sec into cheap cache hits. Common mistake: letting admitted users keep their session forever — the admission token must have a TTL (10-15 minutes) so abandoned sessions return capacity to the queue instead of silently starving it.",

    "Hot-row contention is the classic failure mode when one event dominates traffic, and the per-seat data model is the primary defense. If availability is tracked as a single counter row per event or per section (available_count = available_count - 1), every purchase for that event serializes on one row lock — 10K purchases/sec against one row means the lock queue, not the hardware, is the bottleneck, and lock-wait timeouts cascade into retries that make it worse. Modeling one row per seat spreads the writes: two users buying different seats touch different rows and never contend, so the natural contention unit shrinks from 'the event' to 'the individual seat', where genuine conflicts (two humans clicking the same seat in the same second) are rare and fail fast. This is why the hold path avoids aggregate counters entirely and why 'available seats in section' counts are computed asynchronously or served as slightly-stale cached aggregates rather than maintained transactionally. Remaining hot spots are handled by moving them off the database: the hold itself lives in Redis (single-threaded, no lock queue, fail-fast semantics), and the database only sees the low-rate confirm traffic bounded by ticket count. For example, a 60K-seat stadium sale generates at most 60K confirm writes spread over minutes, while the same sale modeled as a counter would funnel every one of those writes plus every failed attempt through one row. Warning: never put a synchronously-maintained 'tickets_remaining' counter on the checkout path of an assigned-seat event — derive it from seat states instead.",

    "General admission inverts the assigned-seat design: there is no specific seat to lock, only a quantity, so the counter that was an anti-pattern for assigned seating becomes the correct tool — with a conditional decrement. The GA tier is a single inventory number (say 5,000 floor tickets), and a purchase of n tickets executes an atomic conditional decrement: in Redis, a Lua script that reads the count, checks count >= n, decrements, and returns the result in one atomic step (or DECRBY followed by a compensating INCRBY if the result went negative); in SQL, UPDATE ga_inventory SET remaining = remaining - n WHERE tier_id=? AND remaining >= n, checking affected rows. There is no per-seat hold phase to protect UX because there is nothing to choose — any ticket is as good as any other, so the decrement can happen at checkout initiation with a TTL-tracked pending purchase that increments the count back if payment fails or times out. The counter is a genuine hot spot here, but a tolerable one: the operation is a single in-memory atomic op (sub-microsecond in Redis), not a disk-backed row lock held across a transaction, and one Redis node sustains 100K+ decrements/sec — far above any realistic checkout rate. For very large GA inventories, the counter can be sharded (10 sub-counters of 500 each, pick one at random, rebalance in the background) to spread load, at the cost of occasionally telling a user a shard is empty while another has stock. Key insight: assigned seating shards naturally by seat; general admission must choose between one hot counter (simple, usually fine) and sharded counters (scales further, adds rebalancing complexity).",

    "Payment-timeout compensation is where the reservation flow earns its keep, because the payment provider is a third party you cannot make atomic with your inventory. The moment checkout starts, the system is running a distributed transaction across the seat hold (yours) and the charge (the PSP's), coordinated by a saga rather than two-phase commit: hold seats, create a pending payment record with an idempotency key, call the PSP, then either confirm (HELD → BOOKED) or compensate (release the hold, void or refund the charge). Timeouts are the ambiguous middle: a timed-out charge call may have succeeded on the PSP side, so the compensating action is never 'assume failure and release' — it is 'query the PSP for the authoritative status of this idempotency key, then act'. If the PSP says succeeded, confirm the booking even though the user saw an error page (and notify them); if failed, release the hold immediately; if the PSP is unreachable, park the reservation in a PENDING_RECONCILIATION state and let a background reconciler resolve it against the PSP's records, extending the seat hold so the seat is not resold while the payment's fate is unknown. The hold TTL and the payment window interact: a 5-minute hold with a 30-second payment call is fine, but if the user starts payment at 4:50, the system should atomically extend the hold (conditional update: extend only if still held by this user) rather than let it lapse mid-charge. Common mistake: releasing a hold on payment timeout without querying the PSP first — this is the exact sequence that sells a seat twice: user A's charge actually succeeded, the hold was released, user B bought the seat, and now two people hold valid-looking confirmations for one seat.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Seat reservation with optimistic locking and TTL",
      source: `#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>
#include <optional>
#include <vector>

enum class SeatState { AVAILABLE, HELD, BOOKED, BLOCKED };

struct Seat {
    std::string seat_id;      // e.g., "SEC-A_ROW-3_SEAT-12"
    SeatState state;
    std::string held_by;      // user_id when HELD or BOOKED
    int64_t held_until;       // Unix ms timestamp for HELD TTL
    int version;              // Optimistic locking version
    int64_t price_cents;
};

struct ReservationResult {
    bool success;
    std::string message;
    std::vector<std::string> reserved_seats;
    int64_t expires_at;
};

class SeatInventory {
    std::unordered_map<std::string, Seat> seats_; // seat_id -> Seat
    std::mutex mu_;
    static constexpr int HOLD_TTL_MS = 5 * 60 * 1000; // 5 minutes

    int64_t now_ms() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

public:
    void initialize_seats(const std::vector<Seat>& event_seats) {
        std::lock_guard<std::mutex> lk(mu_);
        for (const auto& s : event_seats) {
            seats_[s.seat_id] = s;
        }
    }

    // Atomically hold multiple seats (all-or-nothing)
    ReservationResult hold_seats(
        const std::vector<std::string>& seat_ids,
        const std::string& user_id
    ) {
        std::lock_guard<std::mutex> lk(mu_);
        auto now = now_ms();

        // First pass: verify all seats are available
        for (const auto& sid : seat_ids) {
            auto it = seats_.find(sid);
            if (it == seats_.end()) {
                return {false, "Seat " + sid + " not found", {}, 0};
            }
            auto& seat = it->second;

            // Auto-expire stale holds
            if (seat.state == SeatState::HELD && now > seat.held_until) {
                seat.state = SeatState::AVAILABLE;
                seat.held_by.clear();
                seat.version++;
            }

            if (seat.state != SeatState::AVAILABLE) {
                return {false, "Seat " + sid + " is not available", {}, 0};
            }
        }

        // Second pass: atomically hold all seats
        int64_t expires_at = now + HOLD_TTL_MS;
        std::vector<std::string> reserved;
        for (const auto& sid : seat_ids) {
            auto& seat = seats_[sid];
            seat.state = SeatState::HELD;
            seat.held_by = user_id;
            seat.held_until = expires_at;
            seat.version++;
            reserved.push_back(sid);
        }

        return {true, "Seats held successfully", reserved, expires_at};
    }

    // Confirm booking after payment
    bool confirm_booking(
        const std::vector<std::string>& seat_ids,
        const std::string& user_id
    ) {
        std::lock_guard<std::mutex> lk(mu_);
        // Verify all seats are held by this user
        for (const auto& sid : seat_ids) {
            auto it = seats_.find(sid);
            if (it == seats_.end()) return false;
            if (it->second.state != SeatState::HELD ||
                it->second.held_by != user_id) return false;
        }
        // Transition to BOOKED
        for (const auto& sid : seat_ids) {
            seats_[sid].state = SeatState::BOOKED;
            seats_[sid].held_until = 0; // No expiry for bookings
            seats_[sid].version++;
        }
        return true;
    }

    // Release expired holds (called by background cleanup)
    int release_expired_holds() {
        std::lock_guard<std::mutex> lk(mu_);
        auto now = now_ms();
        int released = 0;
        for (auto& [id, seat] : seats_) {
            if (seat.state == SeatState::HELD && now > seat.held_until) {
                seat.state = SeatState::AVAILABLE;
                seat.held_by.clear();
                seat.version++;
                released++;
            }
        }
        return released;
    }
};`
    },
    {
      language: "cpp",
      caption: "Virtual waiting room queue with position tracking",
      source: `#include <map>
#include <string>
#include <chrono>
#include <mutex>
#include <unordered_map>
#include <random>
#include <sstream>
#include <iomanip>

struct QueueEntry {
    std::string token;
    std::string user_id;
    std::string device_fingerprint;
    int64_t join_time;
    bool admitted;
};

struct QueueStatus {
    int position;              // 0 = admitted
    int total_ahead;
    int estimated_wait_seconds;
    bool admitted;
    std::string token;
};

class VirtualWaitingRoom {
    // Ordered by join time (sorted set equivalent)
    std::map<int64_t, std::string> queue_;     // join_time -> token
    std::unordered_map<std::string, QueueEntry> entries_; // token -> entry
    std::unordered_map<std::string, std::string> device_to_token_;
    std::mutex mu_;

    int admission_rate_;     // Users per second
    int64_t last_admission_time_ = 0;
    int admitted_count_ = 0;

    int64_t now_ms() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

    std::string generate_token() {
        static thread_local std::mt19937_64 rng(std::random_device{}());
        std::uniform_int_distribution<uint64_t> dist;
        std::stringstream ss;
        ss << std::hex << dist(rng) << dist(rng);
        return ss.str();
    }

public:
    VirtualWaitingRoom(int admission_rate = 1000)
        : admission_rate_(admission_rate) {}

    // User joins the queue
    QueueStatus join(const std::string& user_id,
                     const std::string& device_fp) {
        std::lock_guard<std::mutex> lk(mu_);

        // Prevent duplicate queue entries from same device
        auto dev_it = device_to_token_.find(device_fp);
        if (dev_it != device_to_token_.end()) {
            return get_status_locked(dev_it->second);
        }

        std::string token = generate_token();
        int64_t join_time = now_ms();

        QueueEntry entry{token, user_id, device_fp, join_time, false};
        queue_[join_time] = token;
        entries_[token] = entry;
        device_to_token_[device_fp] = token;

        return get_status_locked(token);
    }

    // Check queue position (called by polling client)
    QueueStatus check_status(const std::string& token) {
        std::lock_guard<std::mutex> lk(mu_);
        process_admissions();
        return get_status_locked(token);
    }

    void set_admission_rate(int rate) {
        std::lock_guard<std::mutex> lk(mu_);
        admission_rate_ = rate;
    }

private:
    void process_admissions() {
        auto now = now_ms();
        if (last_admission_time_ == 0) last_admission_time_ = now;

        int64_t elapsed_ms = now - last_admission_time_;
        int to_admit = static_cast<int>(
            elapsed_ms * admission_rate_ / 1000
        );

        int admitted = 0;
        for (auto it = queue_.begin();
             it != queue_.end() && admitted < to_admit;) {
            auto& entry = entries_[it->second];
            if (!entry.admitted) {
                entry.admitted = true;
                admitted++;
                admitted_count_++;
            }
            it = queue_.erase(it);
        }

        if (admitted > 0) last_admission_time_ = now;
    }

    QueueStatus get_status_locked(const std::string& token) {
        auto it = entries_.find(token);
        if (it == entries_.end()) {
            return {-1, 0, 0, false, token};
        }
        auto& entry = it->second;
        if (entry.admitted) {
            return {0, 0, 0, true, token};
        }

        int position = 0;
        for (auto& [t, tok] : queue_) {
            if (tok == token) break;
            if (!entries_[tok].admitted) position++;
        }

        int est_wait = (admission_rate_ > 0)
            ? position / admission_rate_
            : 9999;

        return {position + 1, position, est_wait, false, token};
    }
};`
    },
    {
      language: "cpp",
      caption: "Redis-like atomic seat hold with Lua script simulation",
      source: `#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>

// Simulates Redis atomic operations for seat locking
// In production, this would be a Redis Lua script:
// EVAL "
//   local state = redis.call('HGET', KEYS[1], 'state')
//   if state == 'AVAILABLE' then
//     redis.call('HMSET', KEYS[1],
//       'state', 'HELD',
//       'held_by', ARGV[1],
//       'version', redis.call('HINCRBY', KEYS[1], 'version', 1))
//     redis.call('EXPIRE', KEYS[1]..':hold', ARGV[2])
//     return 1
//   end
//   return 0
// " 1 seat:event123:SEC-A_ROW-3_SEAT-12 user456 300

class RedisSeatLock {
    struct SeatEntry {
        std::string state;      // "AVAILABLE", "HELD", "BOOKED"
        std::string held_by;
        int64_t expire_at;
        int version;
    };

    std::unordered_map<std::string, SeatEntry> store_;
    std::mutex mu_;

    int64_t now_ms() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

    std::string make_key(const std::string& event_id,
                          const std::string& seat_id) {
        return "seat:" + event_id + ":" + seat_id;
    }

public:
    // Initialize seat as available
    void add_seat(const std::string& event_id,
                   const std::string& seat_id) {
        std::lock_guard<std::mutex> lk(mu_);
        auto key = make_key(event_id, seat_id);
        store_[key] = {"AVAILABLE", "", 0, 0};
    }

    // Atomic hold attempt (equivalent to Redis Lua script)
    // Returns: 1 = success, 0 = seat not available
    int try_hold(const std::string& event_id,
                  const std::string& seat_id,
                  const std::string& user_id,
                  int ttl_seconds = 300) {
        std::lock_guard<std::mutex> lk(mu_);
        auto key = make_key(event_id, seat_id);
        auto it = store_.find(key);
        if (it == store_.end()) return 0;

        auto& entry = it->second;
        auto now = now_ms();

        // Auto-expire stale holds
        if (entry.state == "HELD" && now > entry.expire_at) {
            entry.state = "AVAILABLE";
            entry.held_by.clear();
        }

        // Atomic check-and-set
        if (entry.state == "AVAILABLE") {
            entry.state = "HELD";
            entry.held_by = user_id;
            entry.expire_at = now + ttl_seconds * 1000LL;
            entry.version++;
            return 1; // Success
        }
        return 0; // Seat not available
    }

    // Confirm booking (hold -> booked)
    int confirm(const std::string& event_id,
                 const std::string& seat_id,
                 const std::string& user_id) {
        std::lock_guard<std::mutex> lk(mu_);
        auto key = make_key(event_id, seat_id);
        auto it = store_.find(key);
        if (it == store_.end()) return 0;

        auto& entry = it->second;
        if (entry.state == "HELD" && entry.held_by == user_id) {
            entry.state = "BOOKED";
            entry.expire_at = 0; // No expiry for confirmed bookings
            entry.version++;
            return 1;
        }
        return 0;
    }

    // Release a hold (cancel or timeout)
    int release(const std::string& event_id,
                 const std::string& seat_id,
                 const std::string& user_id) {
        std::lock_guard<std::mutex> lk(mu_);
        auto key = make_key(event_id, seat_id);
        auto it = store_.find(key);
        if (it == store_.end()) return 0;

        auto& entry = it->second;
        if (entry.state == "HELD" && entry.held_by == user_id) {
            entry.state = "AVAILABLE";
            entry.held_by.clear();
            entry.expire_at = 0;
            entry.version++;
            return 1;
        }
        return 0;
    }
};`
    },
  ],
  diagrams: [
    {
      title: "Ticket Booking System Architecture",
      kind: "architecture",
      caption: "Layered architecture: the edge waiting room admits users at a controlled rate, the browse path is served from cache, and the reserve-hold-pay-confirm path flows through Redis seat holds and the per-seat inventory database, with async hold-expiry and notifications.",
      mermaid: `graph TB
    subgraph CLIENTS["Clients"]
        WEB["Web App"]
        MOB["Mobile App"]
    end
    subgraph EDGE["Edge"]
        CDN["CDN<br/>static assets + seat map snapshots"]
        WR["Waiting Room / Virtual Queue<br/>admits users at controlled rate"]
    end
    subgraph GATEWAY["Gateway"]
        LB["Load Balancer + API Gateway"]
        BOT["Bot Detection<br/>fingerprint + rate limits"]
    end
    subgraph SERVICES["Services"]
        BROWSE["Event Browse Service<br/>cacheable reads"]
        SEATMAP["Seat Map Service<br/>real-time availability"]
        RESV["Reservation Service<br/>seat hold + TTL"]
        CHECKOUT["Checkout / Payment Service"]
    end
    subgraph DATA["Data"]
        META["Event Metadata + Search"]
        REDIS["Redis Seat-Hold Locks<br/>TTL per hold"]
        INV["Seat Inventory DB<br/>one row per seat"]
    end
    subgraph ASYNC["Async"]
        KAFKA["Kafka Booking Events"]
        SWEEP["Hold-Expiry Sweeper"]
        NOTIF["Notification Service<br/>email / SMS / wallet"]
    end
    PSP["Payment Provider PSP"]

    WEB --> CDN
    MOB --> CDN
    WEB --> WR
    MOB --> WR
    WR -->|"admission token"| LB
    LB --> BOT
    BOT -->|"browse path"| BROWSE
    BOT --> SEATMAP
    BOT -->|"reserve path"| RESV
    BROWSE --> META
    SEATMAP --> REDIS
    SEATMAP --> INV
    RESV -->|"1 hold seat with TTL"| REDIS
    RESV -->|"2 proceed to pay"| CHECKOUT
    CHECKOUT -->|"3 charge"| PSP
    CHECKOUT -->|"4 confirm HELD to BOOKED"| INV
    CHECKOUT --> KAFKA
    KAFKA --> NOTIF
    SWEEP -->|"scan expired holds"| REDIS
    SWEEP -->|"release back to AVAILABLE"| INV
    KAFKA --> SWEEP`
    },
    {
      title: "Seat Booking Sequence",
      kind: "sequence",
      caption: "End-to-end sequence from queue admission through seat selection, hold, payment, and booking confirmation.",
      mermaid: `sequenceDiagram
    participant U as User
    participant Q as Waiting Room
    participant B as Booking Server
    participant R as Redis Seat Lock
    participant P as Payment Service
    participant D as Database

    U->>Q: Join queue
    Q-->>U: Position 4523, est 5 min
    Note over Q: User polls for admission
    Q-->>U: Admitted (session token)
    U->>B: Browse available seats
    B->>R: Get seat states
    R-->>B: Seat map with availability
    B-->>U: Available seats displayed
    U->>B: Select seats A3-12, A3-13
    B->>R: Atomic hold (Lua script)
    R-->>B: Hold success, TTL 5 min
    B-->>U: Seats held, proceed to payment
    U->>B: Submit payment
    B->>P: Charge card
    P-->>B: Payment success
    B->>R: Confirm booking
    R-->>B: Confirmed
    B->>D: Persist booking record
    D-->>B: Stored
    B-->>U: Booking confirmed + ticket`
    },
    {
      title: "Seat State Machine",
      kind: "flow",
      caption: "Valid state transitions for a seat from available through hold and booking, including expiration and cancellation paths.",
      mermaid: `flowchart TD
    AVAILABLE["AVAILABLE"] -->|"User selects"| HELD["HELD TTL 5min"]
    HELD -->|"Payment succeeds"| BOOKED["BOOKED"]
    HELD -->|"TTL expires"| AVAILABLE
    HELD -->|"User cancels"| AVAILABLE
    HELD -->|"Payment fails"| AVAILABLE
    BOOKED -->|"Refund processed"| AVAILABLE
    BOOKED -->|"Transfer to another user"| BOOKED
    AVAILABLE -->|"Venue blocks"| BLOCKED["BLOCKED"]
    BLOCKED -->|"Venue unblocks"| AVAILABLE`
    },
    {
      title: "Flash Sale Traffic Management",
      kind: "flow",
      caption: "How incoming traffic is managed during a high-demand on-sale using the virtual waiting room and adaptive admission control.",
      mermaid: `flowchart TD
    TRAFFIC["Incoming Traffic 10M users"] --> BOT{"Bot Detection"}
    BOT -->|"Bot detected"| BLOCK["Block + CAPTCHA"]
    BOT -->|"Human"| QUEUE["Virtual Waiting Room"]
    QUEUE --> POSITION["Assign Queue Position"]
    POSITION --> POLL["User Polls Position"]
    POLL --> CHECK{"Admitted?"}
    CHECK -->|"No"| POLL
    CHECK -->|"Yes"| SESSION["Create Booking Session"]
    SESSION --> BROWSE["Browse Available Seats"]
    BROWSE --> SELECT["Select + Hold Seats"]
    SELECT --> PAYMENT["Payment Flow"]
    PAYMENT --> CONFIRM["Booking Confirmed"]
    PAYMENT -->|"Fails"| RELEASE["Release Hold"]
    RELEASE --> BROWSE`
    },
  ],
  interviewQA: [
    {
      q: "How would you design a ticket booking system like Ticketmaster that handles millions of concurrent users during popular event on-sales?",
      a: "The key architectural insight is separating traffic management from booking logic. A virtual waiting room sits in front of the booking system, queuing millions of users and admitting them at a controlled rate (e.g., 1000/sec) that the booking backend can handle. Users are placed in a queue and assigned a position when the sale opens, with estimated wait times shown during polling. The booking system uses a two-phase reservation: when a user selects seats, they are temporarily held (AVAILABLE -> HELD with 5-minute TTL) using atomic operations in Redis (Lua scripts for check-and-set), and after payment succeeds, the hold converts to a confirmed booking (HELD -> BOOKED). The seat inventory is sharded by event — each event gets its own Redis instance and database partition, since events are independent. Expired holds are cleaned up by automatic TTL expiration in Redis and a background sweep in the database. The system uses optimistic locking for seat selection (versioned compare-and-swap), which performs well when many seats are available but degrades for nearly sold-out events where conflict rates are high.",
      followUps: [
        "How would you handle the case where a user's session expires while they are entering payment details?",
        "What happens if Redis goes down during an active sale?",
        "How do you prevent scalper bots from buying all the tickets?",
      ],
    },
    {
      q: "How does the virtual waiting room work and why is it necessary?",
      a: "The virtual waiting room is a queue-based traffic shaping system that prevents the booking backend from being overwhelmed during high-demand events. When 10 million users arrive in the first 30 seconds of a sale, directly hitting the booking API would cause cascading failures — database connection exhaustion, memory pressure, and timeout storms. Instead, all users are routed to the waiting room, which assigns each a position based on arrival time. The queue is implemented as a Redis sorted set (score = join timestamp) or a dedicated queue service. Users poll every 2-5 seconds for their status, receiving their position and estimated wait time. The admission controller releases users at a rate matching the backend's capacity — this rate is dynamically adjusted based on real-time system health metrics (booking latency p99, error rate, database CPU). When admitted, the user receives a signed session token (JWT) with a TTL that the booking API validates on every request. Anti-gaming measures include device fingerprinting to prevent multiple queue entries, CAPTCHA before queue entry, and randomized queue position for entries within the same second (to prevent advantage from network proximity).",
      followUps: [
        "How do you determine the optimal admission rate?",
        "What if the queue itself becomes a bottleneck?",
        "How do you handle fairness across different geographic regions?",
      ],
    },
    {
      q: "How do you prevent overselling — ensuring the same seat is never sold to two different customers?",
      a: "Overselling prevention relies on atomic seat state transitions with strong consistency guarantees. The primary mechanism is a Redis Lua script that atomically checks the seat state, transitions it to HELD, and sets a TTL — all in a single operation that cannot be interleaved with another client's operation. The script is equivalent to: if state == 'AVAILABLE' then set state = 'HELD', held_by = user, EXPIRE = TTL, return 1, else return 0. Since Redis is single-threaded, this is inherently serializable — two concurrent attempts for the same seat will be processed sequentially, and the second will see the state as HELD and fail. For confirmed bookings, the database serves as the durable source of truth with a UNIQUE constraint on (event_id, seat_id, state='BOOKED') — the database will reject any attempt to double-book at the constraint level even if the application layer has a bug. The hold TTL ensures that seats are not permanently locked by abandoned sessions — a user who selects seats but never completes payment will have their hold automatically released after 5 minutes. A reconciliation job runs every minute, comparing Redis seat states against database booking records to detect and resolve any divergence.",
      followUps: [
        "What happens in a Redis cluster during a network partition — could overselling occur?",
        "How do you handle partial failures in multi-seat bookings?",
      ],
    },
    {
      q: "What are the trade-offs between optimistic and pessimistic locking for seat reservation?",
      a: "Pessimistic locking (SELECT FOR UPDATE) acquires an exclusive lock on the seat row, guaranteeing that only one transaction can modify it at a time. This is simple and correct but creates severe contention: if 1000 users try to select seats in the same section, they serialize on the database lock, creating seconds-long wait times and potential deadlocks when multiple seats are selected in different orders. Optimistic locking uses a version column — the application reads the seat with its version, attempts an UPDATE with a WHERE version = N clause, and retries if zero rows are affected (meaning another transaction changed the seat). This allows full read concurrency and only serializes at write time. For most of the sale (many seats available), optimistic locking works excellently because conflict rates are low — users rarely pick the exact same seat simultaneously. As the event approaches sold-out (few seats remaining), conflict rates spike and optimistic locking degrades into a retry storm. The practical solution is a hybrid: use optimistic locking during the main sale, and switch to a server-assigned seat model for the last 5-10% of inventory — instead of the user choosing a specific seat, the system assigns the best available seat, eliminating selection conflicts entirely.",
      followUps: [
        "How would you implement the switch from user-selected to server-assigned seats?",
        "What is the maximum conflict rate before optimistic locking becomes impractical?",
      ],
    },
    {
      q: "How would you handle the payment flow to ensure no tickets are lost and no duplicate bookings occur?",
      a: "The payment flow must handle four failure scenarios: (1) payment succeeds, booking confirmation succeeds — the happy path, the user gets their tickets. (2) Payment fails — the hold is released immediately and the user is shown the error, seats return to AVAILABLE. (3) Payment succeeds but booking confirmation fails (e.g., database error) — this is the dangerous case. The system retries the confirmation with exponential backoff using an idempotency key to prevent duplicate bookings. If retries exhaust, a background reconciliation job detects 'paid but unconfirmed' payments by cross-referencing the payment provider's records against the booking database, and completes the booking. (4) Payment times out — the system must NOT assume failure. It queries the payment provider for the transaction status. If the provider confirms success, proceed with booking. If the provider confirms failure, release the hold. If the provider also does not know (rare), the payment is marked as 'pending reconciliation' and resolved when the provider's settlement report arrives. The hold TTL (5 minutes) must be long enough to accommodate payment processing (typically 5-30 seconds) plus user input time. If the hold is about to expire during payment processing, the system can extend it by 2 minutes to avoid releasing seats that are mid-payment.",
      followUps: [
        "How do you extend a seat hold without creating a race condition?",
        "What if the payment provider webhook arrives before the synchronous payment response?",
      ],
    },
    {
      q: "One event is generating 95% of all traffic. How do you avoid hot-row contention in the database?",
      a: "The root cause of hot-row contention is funneling many writers through one row, so the fix is to change the data model, not just add hardware. First, model inventory as one row per seat rather than a counter per event or section: two users buying different seats then touch different rows and never contend, shrinking the contention unit from 'the event' to 'the individual seat', where real conflicts are rare and fail fast. Second, never maintain a synchronous 'tickets_remaining' counter on the checkout path — derive availability counts asynchronously from seat states and serve them as slightly-stale cached aggregates, since browsing tolerates a few seconds of staleness. Third, move the highest-churn operation (holds, which happen 3-5 times per ticket due to abandonment) out of the database entirely into Redis, where a single-threaded atomic Lua script gives fail-fast semantics with no lock queue; the database then only sees confirm traffic, which is bounded by ticket count, not fan count — a 60K-seat sellout is at most 60K confirm writes spread over minutes. Finally, shard by event_id so one hot event gets a dedicated Redis instance and database partition and cannot degrade other events. For general admission, where a counter is unavoidable, keep it as an atomic in-memory conditional decrement in Redis (100K+ ops/sec) and shard the counter only if measurements demand it.",
      followUps: [
        "How would you serve section-level availability counts without a transactional counter?",
        "When would you shard a general-admission counter, and what does it cost?",
      ],
    },
    {
      q: "How does the design differ between assigned seating and general admission (GA)?",
      a: "Assigned seating is an identity problem — each unit of inventory is unique, so the design centers on per-seat rows, per-seat holds with TTL, and atomic per-seat state transitions (AVAILABLE → HELD → BOOKED); the hold phase exists because the user chose a specific seat and losing it after entering payment details is a bad experience. General admission is a quantity problem — any ticket is interchangeable, so there is nothing to choose and nothing to hold by identity; inventory is a counter per tier, and a purchase is an atomic conditional decrement: UPDATE ga_inventory SET remaining = remaining - n WHERE tier_id = ? AND remaining >= n (check affected rows), or the equivalent Redis Lua script. The interesting inversion is that the counter, which is an anti-pattern for assigned seating (hot-row contention), is the correct tool for GA — it is a single sub-microsecond atomic operation, and one Redis node sustains far more decrements per second than any realistic checkout rate. GA still needs compensation: the decrement happens at checkout start with a TTL-tracked pending purchase, and payment failure or timeout increments the count back. Overselling risk also differs: assigned seating can oversell only via a race on one seat (prevented by atomic transitions plus a database uniqueness invariant), while GA can oversell via a lost compensation (a decrement whose failed payment never incremented back is under-selling; a compensating increment applied twice is over-selling) — so GA compensations must be idempotent, keyed by the pending-purchase id. Mixed venues run both models side by side: per-seat rows for reserved sections, counters for GA floor.",
      followUps: [
        "How do you make the GA compensating increment idempotent?",
        "How would you handle a hybrid event where GA tickets can be upgraded to assigned seats?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Why is a Redis Lua script preferred over separate GET and SET commands for seat locking?",
      options: [
        "Lua scripts are faster than individual commands",
        "Lua scripts execute atomically — no other command can interleave between the state check and the state change",
        "Lua scripts use less memory",
        "Lua scripts are easier to debug",
      ],
      answerIndex: 1,
      explanation: "With separate GET and SET commands, another client could change the seat state between your GET (seeing AVAILABLE) and your SET (changing to HELD), causing two users to hold the same seat. A Lua script runs atomically in Redis's single-threaded execution model, making the check-and-set operation indivisible.",
    },
    {
      q: "What is the primary purpose of the seat hold TTL (Time-To-Live)?",
      options: [
        "To speed up the booking process",
        "To prevent seats from being permanently locked by abandoned sessions that never complete payment",
        "To reduce database storage",
        "To improve cache hit rates",
      ],
      answerIndex: 1,
      explanation: "Without a TTL, a user who selects seats but abandons the session (closes browser, loses connection, gets distracted) would permanently lock those seats. The TTL (typically 5-10 minutes) ensures that unheld seats automatically return to AVAILABLE, maintaining inventory availability.",
    },
    {
      q: "In a flash sale with 10 million users and 50,000 tickets, what is the primary role of the virtual waiting room?",
      options: [
        "To verify user identity",
        "To throttle incoming traffic to a rate the booking system can handle, preventing cascading failures",
        "To sort users by ticket quantity",
        "To process payments faster",
      ],
      answerIndex: 1,
      explanation: "Without the waiting room, 10 million simultaneous requests would overwhelm the booking system (database connections, memory, CPU). The waiting room queues users and admits them at a controlled rate (e.g., 1000/sec) that matches the backend's capacity, ensuring the system remains responsive for admitted users.",
    },
    {
      q: "Why might optimistic locking fail for nearly sold-out events?",
      options: [
        "Optimistic locking does not work with Redis",
        "With few seats remaining and many competing users, nearly every seat selection attempt conflicts with another user, causing a retry storm",
        "Optimistic locking cannot handle multi-seat bookings",
        "Optimistic locking is too slow for high-concurrency scenarios",
      ],
      answerIndex: 1,
      explanation: "Optimistic locking works well when conflict probability is low (many seats, few users selecting the same one). With 100 remaining seats and 10,000 competing users, the probability that two users select the same seat approaches certainty, causing nearly all attempts to fail and retry — a retry storm that makes the system unresponsive.",
    },
  ],
  flashcards: [
    { front: "What is the two-phase seat reservation approach?", back: "Phase 1: temporary HOLD with TTL (5-10 min) when user selects seat. Phase 2: HOLD converts to BOOKED after payment confirmation. If payment fails or TTL expires, seat returns to AVAILABLE automatically." },
    { front: "Why use Redis Lua scripts for seat locking?", back: "Redis executes Lua scripts atomically (single-threaded). The script checks seat state AND sets it to HELD in one indivisible operation, preventing race conditions where two users hold the same seat." },
    { front: "What is a virtual waiting room?", back: "A queue-based traffic shaping system that sits in front of the booking service. Users are queued and admitted at a controlled rate matching backend capacity. Prevents system overload during flash sales with millions of concurrent users." },
    { front: "How does optimistic locking work for seats?", back: "Read seat with version N. Attempt UPDATE WHERE version=N. If 0 rows affected, another transaction changed the seat (conflict) — retry. Allows full read concurrency; serializes only at write time. Degrades when few seats remain (high conflict rate)." },
    { front: "How is overselling prevented?", back: "Atomic Redis Lua script for HELD state. Database UNIQUE constraint on (event_id, seat_id) for BOOKED state. Hold TTL auto-releases abandoned seats. Reconciliation job detects Redis-DB divergence." },
    { front: "What happens if payment succeeds but booking confirmation fails?", back: "Retry confirmation with exponential backoff using idempotency key. If retries exhaust, background reconciliation detects 'paid but unconfirmed' by cross-referencing payment provider records. Never assume failure on timeout — query provider for status." },
    { front: "How are scalper bots prevented?", back: "CAPTCHA at queue entry, device fingerprinting, rate limiting per IP, behavioral analysis (bots submit instantly, humans have natural delays), purchase limits per account/payment method, Verified Fan pre-registration with lottery." },
    { front: "What is the hybrid locking strategy for near-sellout?", back: "Use optimistic locking (user selects specific seat) when many seats available. Switch to server-assigned seats (system picks best available) when inventory drops below 5-10%, eliminating selection conflicts entirely." },
    { front: "Why is DB write load bounded by seats, not fans?", back: "There are only as many confirmed-booking writes as tickets: 100K tickets = 100K row updates total. Even at 90% sold in 2 minutes that is ~750 writes/sec. Fan-scale load (queue polling, browsing) is reads and must terminate at the edge." },
    { front: "Why do TTL seat holds beat optimistic version-check-on-confirm for assigned seats?", back: "Same correctness, better UX: the hold resolves the conflict at seat-click time in milliseconds (loser picks another seat), while optimistic confirm makes the loser complete checkout before learning the seat is gone. TTL bounds worst-case lockup; conditional confirm remains the last-line guard." },
    { front: "How does general admission handle inventory?", back: "Counter per tier with atomic conditional decrement: UPDATE ... SET remaining = remaining - n WHERE remaining >= n (or a Redis Lua script). Payment failure triggers an idempotent compensating increment keyed by pending-purchase id. No per-seat hold — tickets are interchangeable." },
    { front: "Why avoid a tickets_remaining counter for assigned-seat checkout?", back: "A single counter row serializes every purchase on one row lock — hot-row contention. Per-seat rows spread writes so only genuine same-seat conflicts contend. Derive availability counts asynchronously as cached, slightly-stale aggregates." },
  ],
  exercises: [
    "Design the database schema for a ticket booking system including tables for venues, events, seat inventory, reservations, bookings, and waitlists. Include indexes optimized for the two hottest queries: 'available seats in section X for event Y' and 'expired holds needing cleanup'.",
    "Implement a Redis Lua script that atomically holds a batch of seats (all-or-nothing semantics). The script must: check that all requested seats are AVAILABLE, set them all to HELD with a TTL, and return success only if all seats were available. If any seat is not available, none should be changed.",
    "Build a virtual waiting room simulator that handles 1 million queued users with configurable admission rates. Implement adaptive rate control that reduces admission when the booking system reports high latency (>500ms p99) and increases when latency drops below 200ms.",
    "Design the complete payment failure handling flow for ticket booking. Define the state machine, retry logic, reconciliation process, and alert thresholds. Handle all four failure scenarios: payment succeeds + booking succeeds, payment fails, payment succeeds + booking fails, and payment times out.",
    "Implement an anti-bot detection system for the waiting room that uses behavioral signals: time between page load and queue join, mouse movement patterns, typing speed on CAPTCHA, and request header analysis. Define scoring thresholds for challenge escalation (invisible CAPTCHA, visual CAPTCHA, block).",
  ],
  revisionNotes: [
    "Two-phase booking: HOLD with TTL (5 min) → BOOKED after payment. Expired holds auto-release. All-or-nothing for multi-seat bookings.",
    "Redis Lua scripts provide atomic check-and-set for seat locking. Single-threaded execution prevents race conditions. 100K+ ops/sec per node.",
    "Virtual waiting room queues millions of users, admits at controlled rate (e.g., 1000/sec). Implemented as Redis sorted set (score = join time).",
    "Optimistic locking: version-based CAS. Works well with many available seats (low conflict). Degrades at near-sellout (high conflict → retry storm).",
    "Hybrid strategy: user-selected seats when inventory > 10%, server-assigned best-available when inventory < 10%.",
    "Payment failure handling: never assume failure on timeout. Query provider for status. Retry confirmation with idempotency key. Background reconciliation catches orphans.",
    "Anti-bot: CAPTCHA, device fingerprinting, rate limiting, behavioral analysis, purchase limits, Verified Fan lottery.",
    "Event sharding: each event gets dedicated Redis instance + DB partition. Events are independent — no cross-event contention.",
    "Scale targets: 10M users → 100K+ req/sec API, 50K+ seat selections/sec, 10K+ payments/sec. 90% of tickets sold in first 2 minutes.",
    "Reconciliation: compare Redis seat states vs DB booking records every minute. DB is source of truth. UNIQUE constraint prevents double-booking at DB level.",
    "Capacity math: 100K tickets, 10M fans = 100:1 demand. DB confirm writes bounded by seats (~750/sec even at 90% in 2 min); queue polling (3M+/sec) must terminate at the edge.",
    "Hot-row defense: one row per seat, never a synchronous tickets_remaining counter on the checkout path — derive counts async and serve stale cached aggregates.",
    "GA vs assigned: assigned = per-seat rows + TTL holds; GA = counter with conditional decrement (remaining >= n) plus idempotent compensating increment on payment failure.",
    "Payment timeout: saga with compensation. Never release the hold on timeout without querying the PSP for the idempotency key's status — that sequence sells a seat twice.",
    "Waiting-room fairness: randomize positions within the pre-open arrival batch, token-bucket admission tuned by backend health, signed short-TTL admission JWT validated statelessly at the gateway.",
  ],
  cheatSheet: [
    "Seat states: AVAILABLE → HELD (TTL 5min) → BOOKED | AVAILABLE → BLOCKED",
    "Redis Lua: atomic check state + set HELD + EXPIRE in single op, 100K+ ops/sec",
    "Hold TTL: 5-10 minutes. Background cleanup every 30 seconds for expired holds",
    "Waiting room: Redis sorted set, score=join_time, admit at controlled rate",
    "Admission rate: dynamically adjusted based on backend latency + error rate",
    "Optimistic lock: UPDATE WHERE version=N, retry on conflict. Fails at near-sellout",
    "Hybrid: user-selected seats > 10% inventory, server-assigned < 10%",
    "Payment timeout: query provider for status, never assume failure",
    "Anti-bot: CAPTCHA + fingerprint + rate limit + behavioral analysis + purchase limit",
    "Shard by event_id: separate Redis + DB per event, no cross-event contention",
    "Capacity: DB writes bounded by seats not fans — 100K tickets = 100K confirms total (~750/sec peak)",
    "Hot rows: one row per seat, no synchronous counters on checkout path; counts derived async",
    "GA: atomic conditional decrement (remaining >= n) + idempotent compensating increment",
    "Holds beat optimistic-confirm on UX: conflict fails at seat click (ms), not after checkout effort",
    "Fairness: randomized batch positions pre-open, token-bucket admission, signed admission JWT with TTL",
  ],
  glossary: [
    { term: "Virtual Waiting Room", definition: "A queue-based traffic management system that sits in front of the booking service, throttling user admission to a rate the backend can handle during high-demand events." },
    { term: "Seat Hold / Temporary Reservation", definition: "A time-limited lock on a seat (typically 5-10 minutes) that prevents other users from selecting it while the holding user completes payment. Automatically releases on expiry." },
    { term: "Optimistic Locking", definition: "A concurrency control method that allows multiple readers but checks for conflicts at write time using a version number. If the version changed since the read, the write is rejected and must be retried." },
    { term: "Pessimistic Locking", definition: "A concurrency control method that acquires an exclusive lock before reading, preventing all other transactions from accessing the locked resource. Guarantees consistency but creates contention." },
    { term: "Flash Sale", definition: "A high-demand event where a limited inventory (e.g., concert tickets) goes on sale to a massive audience simultaneously, creating extreme concurrency on the booking system." },
    { term: "Redis Lua Script", definition: "A script executed atomically within Redis's single-threaded event loop. Used for complex operations (check-and-set, multi-key transactions) that must not be interleaved with other commands." },
    { term: "Overselling", definition: "The failure mode where more tickets are sold than seats available, typically caused by race conditions in the seat reservation logic. Prevented by atomic locking and database uniqueness constraints." },
  ],
  animations: [
    {
      title: "Selling the last seat once",
      steps: [
        {
          label: "High contention",
          detail: "Ten thousand people want the same 500 seats the moment sales open.",
        },
        {
          label: "Queue at the door",
          detail: "A virtual waiting room admits users at a controlled rate, so the system is never asked to do the impossible.",
        },
        {
          label: "Seat held, not sold",
          detail: "Selecting a seat takes a short-lived hold — a row lock or a Redis key with a TTL.",
        },
        {
          label: "Checkout window",
          detail: "The user has a few minutes. The hold prevents anyone else selecting it.",
        },
        {
          label: "Hold expires",
          detail: "If they abandon, the seat returns to the pool automatically — no manual cleanup.",
        },
        {
          label: "Purchase",
          detail: "An atomic conditional update converts the hold to a sale. Exactly one buyer can win.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Optimistic Locking", "Pessimistic Locking (SELECT FOR UPDATE)", "Redis Lua Atomic Lock", "Distributed Lock (Redlock)"],
    rows: [
      ["Consistency", "Eventual (retry on conflict)", "Strong (exclusive lock)", "Strong (atomic single-node)", "Strong (quorum-based)"],
      ["Throughput", "High when conflicts are low", "Low (serialized access)", "Very high (100K+ ops/sec)", "Medium (quorum latency)"],
      ["Contention Behavior", "Retry storm at high conflict rate", "Queue/wait at lock", "Fail-fast (no blocking)", "Fail or wait with timeout"],
      ["Failure Mode", "Excessive retries", "Deadlock possible with multi-seat", "Single point of failure (node)", "Tolerates minority node failures"],
      ["Best For", "Read-heavy, low conflict", "Small transactions, guaranteed serial", "Hot-path seat locking", "Cross-node coordination"],
      ["Implementation Complexity", "Low (version column)", "Low (SQL clause)", "Medium (Lua scripting)", "High (quorum protocol)"],
    ],
  },
  followUps: [
    "How would you design a ticket resale (secondary market) feature that integrates with the primary booking system?",
    "How would you implement dynamic pricing for tickets based on real-time demand signals?",
    "How would you design the ticket delivery system (mobile tickets, QR codes, Apple Wallet integration)?",
    "How would you handle event cancellation and bulk refund processing for tens of thousands of ticket holders?",
    "How would you extend the system to support season tickets, subscription packages, and bundled events?",
    "How would you design an analytics dashboard for event organizers showing real-time sales velocity, revenue, and audience demographics?",
    "How would you make queue admission fair across regions and device types without rewarding network proximity?",
    "How would you migrate an event from optimistic version-check booking to TTL seat holds with zero downtime mid-sale?",
    "How would you design a presale with access codes so codes cannot be shared or brute-forced at scale?",
  ],
  resources: [
    { label: "Designing Data-Intensive Applications (Kleppmann)", url: "https://dataintensive.net/", kind: "book", note: "Chapters on transactions, concurrency control, and distributed systems provide the theoretical foundation for booking system design." },
    { label: "How Ticketmaster Handles Flash Sales (QCon Talk)", kind: "video", note: "Conference presentation on virtual waiting rooms, queue fairness, and scaling strategies for high-demand ticket sales." },
    { label: "Redis Lua Scripting Documentation", kind: "docs", note: "Official Redis documentation on Lua scripting for atomic operations, essential for implementing the seat locking layer." },
    { label: "System Design Interview (Alex Xu) - Chapter on Booking Systems", url: "https://bytebytego.com/", kind: "book", note: "Covers seat reservation patterns, distributed locking, and the challenges of inventory management under high concurrency." },
    { label: "Queue-it (Virtual Waiting Room SaaS)", kind: "article", note: "Documentation and architecture blog posts from a leading virtual waiting room provider, showing production patterns for traffic management." },
  ],
};
