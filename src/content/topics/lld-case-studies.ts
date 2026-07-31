import type { TopicContent } from "../types";

export const lldCaseStudies: TopicContent = {
  quickSummary: [
    "The Parking Lot LLD involves modeling Vehicle (Car, Truck, Motorcycle), ParkingSpot (Small, Medium, Large), ParkingLot, Ticket, and PaymentProcessor. Key design decisions include spot allocation strategy, multi-floor support, and handling concurrent entry/exit.",
    "The Elevator System requires modeling Elevator, ElevatorController, Request, Direction, and Floor. The core challenge is the scheduling algorithm: SCAN (elevator sweeps up then down), LOOK (reverses when no more requests in current direction), or destination dispatch (groups passengers by destination).",
    "The Library Management System models Book, Member, Librarian, Loan, Reservation, and Fine. Key considerations include tracking book copies vs. titles, handling reservations when copies are returned, and enforcing borrowing limits.",
    "The Rate Limiter LLD designs classes for different algorithms (TokenBucket, SlidingWindowCounter) behind a RateLimiter interface, with a RuleEngine to map requests to limits and a RateLimitStore for distributed state.",
  ],
  detailed: [
    "## Parking Lot Design\n\nCore classes: `ParkingLot` manages floors and entry/exit points. `ParkingFloor` contains spots. `ParkingSpot` (abstract) with subclasses `SmallSpot`, `MediumSpot`, `LargeSpot`. `Vehicle` (abstract) with subclasses `Car`, `Truck`, `Motorcycle`. `Ticket` records vehicle, spot, entry time. `PaymentProcessor` calculates fees based on duration and vehicle type. Key design decisions: (1) Spot allocation: nearest-to-entrance vs. spread-across-floors. Use a strategy pattern. (2) Vehicle-to-spot mapping: motorcycles fit in any spot, cars in medium/large, trucks only in large. (3) Concurrency: synchronize spot assignment to prevent double-booking. (4) Display board showing available spots per floor and type. The ParkingLot uses a `SpotAllocationStrategy` interface, enabling different algorithms.",
    "## Elevator System Design\n\nCore classes: `Elevator` (current floor, direction, state, door status), `ElevatorController` (dispatches requests to elevators), `Request` (source floor, direction, optional destination), `Floor` (up/down buttons), `Display` (shows current floor and direction). The controller uses a scheduling strategy: **SCAN** moves in one direction until the end, then reverses. **LOOK** reverses when no more requests ahead. **Destination Dispatch** collects destination floors at the lobby and groups passengers into elevators heading the same way, reducing stops. Design considerations: (1) Multiple elevators require a dispatcher to choose which elevator handles a request (nearest, least loaded). (2) Emergency mode overrides normal scheduling. (3) Weight sensor prevents overloading. (4) VIP/priority floors. Use the Observer pattern for display updates and Strategy for scheduling.",
    "## Library Management System\n\nCore classes: `Library` (singleton managing the system), `Book` (ISBN, title, author), `BookCopy` (physical copy with barcode, status: Available/Loaned/Reserved/Lost), `Member` (can borrow and reserve), `Librarian` extends Member with admin privileges, `Loan` (copy, member, issue date, due date, return date), `Reservation` (book, member, expiry), `Fine` (amount, status). Key interactions: (1) Borrowing: member requests a book, system finds available copy, creates Loan, marks copy as Loaned. (2) Returning: system marks copy Available, checks for pending reservations, notifies reserved member, calculates fine if overdue. (3) Reservation: if no copies available, member reserves, gets notified when a copy is returned. Design patterns: Observer for notifications, State for BookCopy status transitions, Strategy for fine calculation.",
    "## Rate Limiter LLD\n\nCore interface: `RateLimiter` with `boolean allowRequest(String clientId)`. Implementations: `TokenBucketLimiter` (bucket fills at fixed rate, each request consumes a token), `SlidingWindowCounterLimiter` (tracks request counts in time windows), `FixedWindowLimiter` (simple counter per time window). `RateLimitRule` defines limit, window, and scope (per user, per IP, per API key). `RuleEngine` maps incoming requests to applicable rules using client ID and endpoint. `RateLimitStore` interface abstracts storage, with `InMemoryStore` for single-node and `RedisStore` for distributed deployments. Key considerations: (1) Atomicity: check-and-decrement must be atomic to avoid race conditions. (2) Multiple rules: a request might be subject to 100/minute per user AND 1000/minute per API. (3) Response headers: include X-RateLimit-Remaining and Retry-After. Use Factory pattern to create the right limiter based on configuration.",
    "## Common Patterns Across Case Studies\n\nSeveral patterns recur across LLD problems: **Strategy** for swappable algorithms (spot allocation, elevator scheduling, fine calculation, rate limiting). **Observer** for notifications and display updates. **State** for objects with well-defined state transitions (parking spot, book copy, elevator). **Factory** for creating the right subclass based on input (vehicle type, limiter type). **Singleton** for system-wide managers (ParkingLot, Library). The key to acing LLD interviews is recognizing which patterns apply, keeping classes focused (SRP), and discussing trade-offs for each design decision.",
  ],
  deepDive: [
    `## Concurrency in the Parking Lot System

**Thread safety** is often overlooked in parking lot LLD but is *critical* for a real system with multiple entry/exit gates operating simultaneously.

**The race condition problem**: Two vehicles arrive at the same time, both targeting the *same available spot*. Without synchronization, both tickets could reference the **same spot**, leading to a *double-booking*. The solution involves synchronizing at the **spot assignment level**, not at the entire parking lot level (which would serialize all entries).

**Fine-grained locking approach**: Each \`ParkingFloor\` maintains a \`std::mutex\` per *spot type* (small, medium, large). When a vehicle requests a spot:
1. Acquire the lock for the *matching spot type* on the target floor.
2. Check the \`availableSpots\` set for a compatible spot.
3. If found, **atomically remove** it from the available set and assign it to the ticket.
4. Release the lock.

This allows *concurrent assignments* of different spot types on the same floor and concurrent assignments on different floors. The **granularity** of locking directly affects throughput.

**Lock-free alternative**: Use a \`std::atomic<bool>\` on each spot's \`isOccupied\` flag. Use \`compare_exchange_strong(false, true)\` to *atomically claim* a spot. If the CAS fails, try the next available spot. This eliminates lock contention entirely but requires a *scan* through spots.

**Exit concurrency** is simpler: only the ticket holder can release their specific spot, so there is **no contention** on the release path. However, updating the *display board* (available count per type) should use atomic counters to avoid stale reads.`,

    `## Advanced Elevator Scheduling: Destination Dispatch

Beyond basic SCAN/LOOK, **Destination Dispatch** is the modern approach used in high-rise buildings with many elevators. It fundamentally changes how riders interact with the system.

**Traditional vs. Destination Dispatch:**
- *Traditional*: Rider presses Up/Down at the floor. Enters any elevator going their direction. Presses destination inside.
- *Destination Dispatch*: Rider enters their **destination floor at the hallway panel**. The system assigns them to a specific elevator. No buttons inside the car (except door open/close and emergency).

**The assignment algorithm** uses a **scoring function** to pick the best elevator for each request:
\`\`\`
score(elevator, request) =
    w1 * distanceToPickup +
    w2 * currentLoad +
    w3 * existingStops +
    w4 * directionPenalty
\`\`\`

Where \`directionPenalty\` is *high* if the elevator is moving away from the request floor, and *zero* if it is moving toward it or idle.

**Zoning strategies** for large buildings:
- **Static zoning**: Elevators 1-3 serve floors 1-20, elevators 4-6 serve floors 20-40. *Simple* but inflexible -- cannot redistribute during peak times.
- **Dynamic zoning**: The controller reassigns zones based on *real-time demand*. During morning rush, more elevators serve the lobby. During lunch, more serve mid-floors with restaurants. Requires **load monitoring** and *adaptive algorithms*.
- **Express elevators**: Skip certain floor ranges entirely. Serve only lobby and floors 30+. **Reduces travel time** for high-floor riders but requires dedicated shafts.

**Edge cases to handle**: *Emergency override* (all elevators return to lobby), **fire service mode** (designated elevator goes to fire floor), weight sensor *overload* (skip pickup requests), and \`VIP priority\` (certain floors get preferential service).`,

    `## Distributed Rate Limiting with Redis

A single-node **token bucket** works well for one server, but modern systems have *multiple API servers* behind a load balancer. Rate limits must be enforced **globally across all nodes**.

**Redis-based distributed rate limiter:**
The key insight is using Redis's **atomic operations** to avoid race conditions. A Lua script executes the *check-and-decrement* atomically on the Redis server:

\`\`\`
-- Token bucket in Redis (Lua script)
local key = KEYS[1]
local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or max_tokens
local last_refill = tonumber(bucket[2]) or now

-- Refill tokens
local elapsed = now - last_refill
tokens = math.min(max_tokens, tokens + elapsed * refill_rate)

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return 1  -- allowed
else
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return 0  -- rejected
end
\`\`\`

**Multi-rule rate limiting**: A single request might be subject to *multiple limits*: \`100/minute per user\`, \`1000/minute per API key\`, and \`10000/minute global\`. The \`RuleEngine\` evaluates **all applicable rules**, and the request passes only if *all* limits allow it. Each rule has its own Redis key.

**Sliding window counter** in Redis uses two keys per window: the *current window counter* and the *previous window counter*. The effective count is: \`previous_count * overlap_percentage + current_count\`. This provides **near-exact limiting** with only \`O(1)\` memory per client, compared to the sliding window log's \`O(n)\`.

**Failure handling**: If Redis is *unavailable*, the rate limiter must have a **fallback policy**: (1) *fail open* (allow all requests -- risky but keeps the system running), (2) *fail closed* (reject all requests -- safe but causes downtime), or (3) *local fallback* (use an in-memory rate limiter per node with higher limits, accepting temporarily imprecise enforcement).`,

    `## Library System Edge Cases and Reservations

The **Library Management System** seems simple but has surprisingly complex edge cases around *reservations*, *fines*, and *concurrent operations*.

**Reservation priority queue**: When a popular book has *multiple reservations*, the system maintains a **priority queue** (FIFO by reservation timestamp). When a copy is returned:
1. Mark the copy as \`Reserved\` (not \`Available\`).
2. Dequeue the *oldest reservation*.
3. Send a \`pickup notification\` to the member.
4. Start a **pickup timer** (e.g., 48 hours).
5. If the member does not pick up within the window, *cancel their reservation*, check the queue for the next reservation, and repeat.

**Fine calculation strategies** use the **Strategy pattern**:
- \`FlatFineStrategy\`: Fixed amount per day overdue (e.g., $0.25/day).
- \`TieredFineStrategy\`: $0.10/day for first 7 days, $0.25/day for 8-30 days, $0.50/day beyond 30 days.
- \`MaxCapFineStrategy\`: Decorates any strategy with a *maximum fine cap* (never exceeds replacement cost).

**Concurrent borrowing edge case**: Two members at different terminals try to borrow the *last available copy* of the same book simultaneously. Without proper synchronization, both could succeed. Solution: Use **optimistic locking** on the \`BookCopy\` status -- check that the status is still \`Available\` at commit time, and *rollback* one transaction if it has changed.

**Lost book handling**: When a book is reported \`Lost\`:
1. Charge the member the **replacement cost** plus any *accumulated fines*.
2. Mark the \`BookCopy\` as \`Lost\`.
3. If the book has *zero available copies* and reservations exist, notify reserved members of the delay.
4. If the lost copy is later found, mark it \`Available\` and process the **next reservation** if any exist.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Parking Lot -- core classes with spot allocation strategy",
      source: `#include <iostream>
#include <vector>
#include <memory>
#include <string>
#include <unordered_map>
#include <mutex>
#include <chrono>

enum class VehicleType { MOTORCYCLE, CAR, TRUCK };
enum class SpotSize { SMALL, MEDIUM, LARGE };

class Vehicle {
protected:
    std::string licensePlate_;
    VehicleType type_;
public:
    Vehicle(std::string plate, VehicleType type)
        : licensePlate_(std::move(plate)), type_(type) {}
    virtual ~Vehicle() = default;
    VehicleType type() const { return type_; }
    const std::string& plate() const { return licensePlate_; }
    virtual SpotSize minSpotSize() const = 0;
};

class Car : public Vehicle {
public:
    explicit Car(std::string plate) : Vehicle(std::move(plate), VehicleType::CAR) {}
    SpotSize minSpotSize() const override { return SpotSize::MEDIUM; }
};

class Motorcycle : public Vehicle {
public:
    explicit Motorcycle(std::string plate) : Vehicle(std::move(plate), VehicleType::MOTORCYCLE) {}
    SpotSize minSpotSize() const override { return SpotSize::SMALL; }
};

class Truck : public Vehicle {
public:
    explicit Truck(std::string plate) : Vehicle(std::move(plate), VehicleType::TRUCK) {}
    SpotSize minSpotSize() const override { return SpotSize::LARGE; }
};

class ParkingSpot {
    int id_;
    SpotSize size_;
    bool occupied_ = false;
public:
    ParkingSpot(int id, SpotSize size) : id_(id), size_(size) {}
    int id() const { return id_; }
    SpotSize size() const { return size_; }
    bool isOccupied() const { return occupied_; }
    bool canFit(const Vehicle& v) const {
        return !occupied_ && static_cast<int>(size_) >= static_cast<int>(v.minSpotSize());
    }
    void occupy() { occupied_ = true; }
    void release() { occupied_ = false; }
};

// Strategy interface for spot allocation
class SpotAllocationStrategy {
public:
    virtual ~SpotAllocationStrategy() = default;
    virtual ParkingSpot* findSpot(
        std::vector<std::unique_ptr<ParkingSpot>>& spots,
        const Vehicle& vehicle
    ) = 0;
};

// Nearest available compatible spot (by index)
class NearestFirstStrategy : public SpotAllocationStrategy {
public:
    ParkingSpot* findSpot(
        std::vector<std::unique_ptr<ParkingSpot>>& spots,
        const Vehicle& vehicle
    ) override {
        for (auto& spot : spots) {
            if (spot->canFit(vehicle)) return spot.get();
        }
        return nullptr;
    }
};

// Smallest compatible spot to maximize utilization
class BestFitStrategy : public SpotAllocationStrategy {
public:
    ParkingSpot* findSpot(
        std::vector<std::unique_ptr<ParkingSpot>>& spots,
        const Vehicle& vehicle
    ) override {
        ParkingSpot* best = nullptr;
        for (auto& spot : spots) {
            if (spot->canFit(vehicle)) {
                if (!best || static_cast<int>(spot->size()) < static_cast<int>(best->size())) {
                    best = spot.get();
                }
            }
        }
        return best;
    }
};

struct Ticket {
    int ticketId;
    std::string vehiclePlate;
    int spotId;
    std::chrono::steady_clock::time_point entryTime;
};

class ParkingLot {
    std::vector<std::unique_ptr<ParkingSpot>> spots_;
    std::unordered_map<int, Ticket> activeTickets_; // ticketId -> Ticket
    std::unique_ptr<SpotAllocationStrategy> strategy_;
    std::mutex mutex_;
    int nextTicketId_ = 1;

public:
    ParkingLot(std::unique_ptr<SpotAllocationStrategy> strategy)
        : strategy_(std::move(strategy)) {}

    void addSpot(int id, SpotSize size) {
        spots_.push_back(std::make_unique<ParkingSpot>(id, size));
    }

    // Thread-safe entry
    std::optional<Ticket> entry(const Vehicle& vehicle) {
        std::lock_guard<std::mutex> lock(mutex_);
        ParkingSpot* spot = strategy_->findSpot(spots_, vehicle);
        if (!spot) return std::nullopt;

        spot->occupy();
        Ticket ticket{nextTicketId_++, vehicle.plate(), spot->id(),
                      std::chrono::steady_clock::now()};
        activeTickets_[ticket.ticketId] = ticket;
        return ticket;
    }

    // Thread-safe exit
    double exit(int ticketId, double ratePerHour = 5.0) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = activeTickets_.find(ticketId);
        if (it == activeTickets_.end()) return -1;

        auto& ticket = it->second;
        for (auto& spot : spots_) {
            if (spot->id() == ticket.spotId) {
                spot->release();
                break;
            }
        }
        auto duration = std::chrono::steady_clock::now() - ticket.entryTime;
        double hours = std::chrono::duration<double, std::ratio<3600>>(duration).count();
        activeTickets_.erase(it);
        return std::max(1.0, hours) * ratePerHour;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Token Bucket Rate Limiter with thread-safe operations",
      source: `#include <iostream>
#include <string>
#include <unordered_map>
#include <mutex>
#include <chrono>
#include <memory>

class RateLimiter {
public:
    virtual ~RateLimiter() = default;
    virtual bool allowRequest(const std::string& clientId) = 0;
};

class TokenBucketLimiter : public RateLimiter {
    struct Bucket {
        double tokens;
        std::chrono::steady_clock::time_point lastRefill;
    };

    double maxTokens_;
    double refillRate_;  // tokens per second
    std::unordered_map<std::string, Bucket> buckets_;
    std::mutex mutex_;

    void refill(Bucket& bucket) {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(
            now - bucket.lastRefill
        ).count();
        bucket.tokens = std::min(maxTokens_, bucket.tokens + elapsed * refillRate_);
        bucket.lastRefill = now;
    }

public:
    TokenBucketLimiter(double maxTokens, double refillRate)
        : maxTokens_(maxTokens), refillRate_(refillRate) {}

    bool allowRequest(const std::string& clientId) override {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = buckets_.find(clientId);
        if (it == buckets_.end()) {
            buckets_[clientId] = {maxTokens_ - 1, std::chrono::steady_clock::now()};
            return true;  // first request always allowed
        }

        auto& bucket = it->second;
        refill(bucket);

        if (bucket.tokens >= 1.0) {
            bucket.tokens -= 1.0;
            return true;
        }
        return false;
    }
};

class SlidingWindowCounterLimiter : public RateLimiter {
    struct Window {
        int previousCount = 0;
        int currentCount = 0;
        int64_t windowStart = 0;  // epoch seconds
    };

    int maxRequests_;
    int windowSizeSeconds_;
    std::unordered_map<std::string, Window> windows_;
    std::mutex mutex_;

    int64_t now() const {
        return std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::steady_clock::now().time_since_epoch()
        ).count();
    }

public:
    SlidingWindowCounterLimiter(int maxRequests, int windowSizeSeconds)
        : maxRequests_(maxRequests), windowSizeSeconds_(windowSizeSeconds) {}

    bool allowRequest(const std::string& clientId) override {
        std::lock_guard<std::mutex> lock(mutex_);
        auto current = now();
        auto& w = windows_[clientId];

        int64_t currentWindow = current / windowSizeSeconds_;
        int64_t storedWindow = w.windowStart / windowSizeSeconds_;

        if (currentWindow != storedWindow) {
            if (currentWindow == storedWindow + 1) {
                w.previousCount = w.currentCount;
            } else {
                w.previousCount = 0;
            }
            w.currentCount = 0;
            w.windowStart = current;
        }

        // Weighted count: previous window overlap + current window
        double elapsed = (current % windowSizeSeconds_) / static_cast<double>(windowSizeSeconds_);
        double weight = w.previousCount * (1.0 - elapsed) + w.currentCount;

        if (weight < maxRequests_) {
            w.currentCount++;
            return true;
        }
        return false;
    }
};

// Factory to create the right limiter from config
class RateLimiterFactory {
public:
    static std::unique_ptr<RateLimiter> create(
        const std::string& type, double limit, double window
    ) {
        if (type == "token_bucket") {
            return std::make_unique<TokenBucketLimiter>(limit, limit / window);
        } else if (type == "sliding_window") {
            return std::make_unique<SlidingWindowCounterLimiter>(
                static_cast<int>(limit), static_cast<int>(window)
            );
        }
        throw std::invalid_argument("Unknown limiter type: " + type);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Elevator system with State pattern and scheduling",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <string>
#include <memory>

enum class Direction { UP, DOWN, IDLE };

struct ElevatorRequest {
    int floor;
    Direction direction;  // desired travel direction
};

class Elevator {
    int id_;
    int currentFloor_ = 1;
    Direction direction_ = Direction::IDLE;
    std::set<int> upStops_;    // floors to visit going up
    std::set<int> downStops_;  // floors to visit going down
    int capacity_ = 10;
    int currentLoad_ = 0;

public:
    explicit Elevator(int id) : id_(id) {}

    int id() const { return id_; }
    int currentFloor() const { return currentFloor_; }
    Direction direction() const { return direction_; }
    int pendingStops() const { return upStops_.size() + downStops_.size(); }
    bool isOverloaded() const { return currentLoad_ >= capacity_; }

    void addStop(int floor) {
        if (floor > currentFloor_ || direction_ == Direction::UP) {
            upStops_.insert(floor);
        } else {
            downStops_.insert(floor);
        }
        if (direction_ == Direction::IDLE) {
            direction_ = (floor >= currentFloor_) ? Direction::UP : Direction::DOWN;
        }
    }

    // LOOK algorithm: move in current direction, reverse when no stops ahead
    void step() {
        if (direction_ == Direction::UP) {
            if (!upStops_.empty()) {
                currentFloor_++;
                auto it = upStops_.find(currentFloor_);
                if (it != upStops_.end()) {
                    std::cout << "Elevator " << id_ << " stops at floor "
                              << currentFloor_ << " (going UP)\\n";
                    upStops_.erase(it);
                }
            }
            if (upStops_.empty()) {
                direction_ = downStops_.empty() ? Direction::IDLE : Direction::DOWN;
            }
        } else if (direction_ == Direction::DOWN) {
            if (!downStops_.empty()) {
                currentFloor_--;
                auto it = downStops_.find(currentFloor_);
                if (it != downStops_.end()) {
                    std::cout << "Elevator " << id_ << " stops at floor "
                              << currentFloor_ << " (going DOWN)\\n";
                    downStops_.erase(it);
                }
            }
            if (downStops_.empty()) {
                direction_ = upStops_.empty() ? Direction::IDLE : Direction::UP;
            }
        }
    }

    // Scoring for dispatcher: lower is better
    int score(const ElevatorRequest& req) const {
        int distance = std::abs(currentFloor_ - req.floor);
        int dirPenalty = 0;

        if (direction_ != Direction::IDLE) {
            // Penalty if elevator is moving away from request
            if (direction_ == Direction::UP && req.floor < currentFloor_)
                dirPenalty = 10;
            if (direction_ == Direction::DOWN && req.floor > currentFloor_)
                dirPenalty = 10;
        }
        return distance + static_cast<int>(pendingStops()) * 2 + dirPenalty;
    }
};

// Dispatcher assigns requests to the best elevator
class ElevatorController {
    std::vector<std::unique_ptr<Elevator>> elevators_;

public:
    void addElevator(int id) {
        elevators_.push_back(std::make_unique<Elevator>(id));
    }

    void dispatch(const ElevatorRequest& req) {
        Elevator* best = nullptr;
        int bestScore = INT_MAX;

        for (auto& e : elevators_) {
            if (e->isOverloaded()) continue;
            int s = e->score(req);
            if (s < bestScore) {
                bestScore = s;
                best = e.get();
            }
        }
        if (best) {
            best->addStop(req.floor);
            std::cout << "Assigned floor " << req.floor
                      << " to elevator " << best->id()
                      << " (score: " << bestScore << ")\\n";
        }
    }

    void stepAll() {
        for (auto& e : elevators_) e->step();
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Parking Spot State Machine",
      kind: "state",
      caption: "State transitions for a ParkingSpot showing all valid lifecycle states including maintenance and reserved states.",
      mermaid: `stateDiagram-v2
    [*] --> Available

    Available --> Occupied: Vehicle parks (ticket issued)
    Occupied --> Available: Vehicle exits (payment processed)

    Available --> Reserved: VIP/pre-booking reservation
    Reserved --> Occupied: Reserved vehicle arrives
    Reserved --> Available: Reservation expires

    Available --> Maintenance: Spot under repair
    Maintenance --> Available: Repair complete

    Occupied --> Occupied: Time extends (no state change)

    note right of Available
        Spot can accept a vehicle.
        Shown on display board.
    end note

    note right of Occupied
        Ticket tracks vehicle + entry time.
        Payment calculated on exit.
    end note`,
    },
    {
      title: "Elevator Request Handling Sequence",
      kind: "sequence",
      caption: "Sequence diagram showing how a floor request is dispatched to the optimal elevator using the scoring algorithm.",
      mermaid: `sequenceDiagram
    participant P as Passenger
    participant FP as Floor Panel
    participant EC as ElevatorController
    participant E1 as Elevator 1
    participant E2 as Elevator 2
    participant D as Display

    P->>FP: Press destination (Floor 15)
    FP->>EC: dispatch(Request{floor:15})
    EC->>E1: score(request)
    E1-->>EC: score = 8
    EC->>E2: score(request)
    E2-->>EC: score = 3 (closer, same direction)
    EC->>E2: addStop(15)
    EC->>D: Update: Take Elevator 2
    D-->>P: Display: Elevator 2 assigned
    E2->>E2: step() moves toward floor 15
    E2->>E2: Arrives at floor 15, opens doors
    E2-->>P: Doors open`,
    },
    {
      title: "Rate Limiter Class Hierarchy",
      kind: "architecture",
      caption: "Class diagram showing the RateLimiter interface, concrete implementations, and supporting classes using Factory and Strategy patterns.",
      mermaid: `classDiagram
    class RateLimiter {
        <<interface>>
        +allowRequest(clientId: string) bool
    }

    class TokenBucketLimiter {
        -maxTokens: double
        -refillRate: double
        -buckets: Map
        -mutex: mutex
        +allowRequest(clientId: string) bool
        -refill(bucket: Bucket) void
    }

    class SlidingWindowCounterLimiter {
        -maxRequests: int
        -windowSize: int
        -windows: Map
        +allowRequest(clientId: string) bool
    }

    class FixedWindowLimiter {
        -maxRequests: int
        -windowSize: int
        +allowRequest(clientId: string) bool
    }

    class RateLimiterFactory {
        +create(type, limit, window) RateLimiter
    }

    class RateLimitRule {
        +limit: int
        +windowSeconds: int
        +scope: string
    }

    class RuleEngine {
        -rules: vector~RateLimitRule~
        +evaluate(request) bool
    }

    RateLimiter <|.. TokenBucketLimiter
    RateLimiter <|.. SlidingWindowCounterLimiter
    RateLimiter <|.. FixedWindowLimiter
    RateLimiterFactory ..> RateLimiter : creates
    RuleEngine --> RateLimiter : uses
    RuleEngine --> RateLimitRule : evaluates`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Token Bucket", "Sliding Window Log", "Sliding Window Counter", "Fixed Window"],
    rows: [
      ["**Memory per client**", "`O(1)` -- counter + timestamp", "`O(n)` -- stores every request timestamp", "`O(1)` -- two counters + timestamp", "`O(1)` -- counter + window start"],
      ["**Accuracy**", "Allows *bursts* up to bucket capacity", "**Exact** -- precise per-window counting", "*Near-exact* -- interpolates between windows", "**Approximate** -- boundary burst problem"],
      ["**Burst handling**", "Allows bursts, then throttles to refill rate", "No bursts -- strict per-window enforcement", "Minimal bursts due to interpolation", "Allows *2x burst* at window boundaries"],
      ["**Implementation complexity**", "Simple -- counter + timestamp math", "Complex -- sorted timestamp storage + cleanup", "Moderate -- two counters with weighted sum", "Simplest -- single counter with reset"],
      ["**Distributed (Redis)**", "Lua script for atomic check-decrement", "ZSET with score = timestamp, ZRANGEBYSCORE", "Two INCR keys with EXPIRE", "Single INCR key with EXPIRE"],
      ["**Best for**", "APIs tolerating occasional bursts, simple rate limiting", "Critical APIs needing *exact* enforcement", "Production APIs needing precision + efficiency", "Low-stakes internal rate limiting"],
    ],
  },
  exercises: [
    "**Design a Movie Ticket Booking System**: Model classes for \`Movie\`, \`Theater\`, \`Screen\`, \`Show\`, \`Seat\`, \`Booking\`, \`Payment\`. Handle **concurrent seat selection** (two users picking the same seat), seat locking with *timeout*, show scheduling across screens, and different pricing for seat types (\`Regular\`, \`Premium\`, \`VIP\`). Apply the **State pattern** for booking lifecycle.",
    "**Design an ATM System**: Create classes for \`ATM\`, \`Account\`, \`Card\`, \`Transaction\`, \`CashDispenser\`, \`ReceiptPrinter\`. Model the **state machine**: \`Idle\` -> \`CardInserted\` -> \`PINEntered\` -> \`SelectingTransaction\` -> \`Processing\` -> \`Dispensing\`. Handle *insufficient funds*, daily withdrawal limits, and `multi-denomination dispensing` (minimize bills used).",
    "**Extend the Parking Lot with EV Charging**: Add \`ChargingSpot\` (extends \`ParkingSpot\`), \`ChargingSession\`, and \`ChargingRate\` classes. Design the scheduling for limited chargers: *queue management* when all chargers are busy, **priority** for low-battery vehicles, time-based pricing, and handling vehicles that finish charging but do not move (apply **idle fees**).",
    "**Design a Multi-Level Cache**: Implement an \`L1Cache\` (in-process, small, fast), \`L2Cache\` (distributed Redis, medium, moderate latency), and \`Database\` fallback. Use the **Chain of Responsibility** pattern. Handle *write-through* and *write-behind* strategies. Design the **invalidation protocol** when data changes.",
    "**Design a Food Delivery Rating System**: Model \`Rating\`, \`Review\`, \`Restaurant\`, \`DeliveryPartner\`, \`RatingAggregator\`. Handle *weighted averages* (recent ratings count more), **fraud detection** (suspicious review patterns), different rating dimensions (food quality, delivery speed, packaging), and the \`Observer pattern\` to notify restaurants when their average drops below a threshold.",
  ],
  cheatSheet: [
    "**Parking Lot key classes**: `ParkingLot` -> `ParkingFloor` -> `ParkingSpot` (Small/Medium/Large). Use **Strategy** for spot allocation, `mutex` for thread safety.",
    "**Elevator scheduling**: SCAN (sweep to end) vs. LOOK (reverse when no requests ahead) vs. **Destination Dispatch** (group by destination, assign at lobby).",
    "**Library system entities**: `Book` (metadata) vs. `BookCopy` (physical instance). Borrowing operates on *copies*. Use **State pattern** for copy lifecycle.",
    "**Rate limiter atomicity**: Check-and-decrement must be *atomic*. Use `std::lock_guard` locally or **Redis Lua scripts** for distributed enforcement.",
    "**Token bucket formula**: `tokens = min(max, tokens + elapsed * refillRate)`. Allow if `tokens >= 1`, then decrement. *Allows bursts* up to bucket capacity.",
    "**Recurring patterns**: **Strategy** for algorithms, **Observer** for notifications, **State** for lifecycles, **Factory** for object creation, **Singleton** for system managers.",
    "**Concurrency tip**: Lock at the *finest granularity* possible. Locking the entire ParkingLot serializes all operations; locking per spot type per floor allows **concurrent assignments**.",
    "**Vehicle-to-spot mapping**: Motorcycle fits *any* spot. Car fits Medium/Large. Truck fits **Large only**. Always assign the *smallest compatible* spot for maximum utilization.",
  ],
  revisionNotes: [
    "**Parking Lot LLD**: Core challenge is *spot allocation strategy* (nearest vs. best-fit) and **thread-safe concurrent entry/exit**. Use Strategy pattern for allocation, mutex for synchronization.",
    "**Elevator System**: The scheduling algorithm determines performance. **LOOK** improves on SCAN by reversing early. *Destination Dispatch* groups passengers for fewer stops. Use a scoring function for multi-elevator dispatch.",
    "**Library Management**: Distinguish `Book` (metadata) from `BookCopy` (physical). The reservation *priority queue* with pickup timeout is the most complex interaction. Use **State pattern** for copy status transitions.",
    "**Rate Limiter**: Token Bucket allows bursts and is simple. Sliding Window Counter balances *precision and memory*. Fixed Window has the **boundary burst** problem. Distributed enforcement requires *atomic Redis operations*.",
    "**Common design patterns across all case studies**: Strategy (swappable algorithms), Observer (event notifications), State (lifecycle transitions), Factory (type-based creation). Recognize which applies to each problem.",
    "**Thread safety is critical**: Real systems have concurrent users. Synchronize at the *finest granularity* that ensures correctness. Prefer **lock-free** (atomic CAS) over coarse-grained mutex when possible.",
  ],
  interviewQA: [
    {
      q: "How would you handle concurrent entry and exit in a parking lot system?",
      a: "Use synchronization at the spot assignment level. When a vehicle enters, acquire a lock on the target spot (or use an atomic compare-and-swap on its status). A ParkingFloor can maintain a ConcurrentHashMap of available spots by type, and assignment uses atomic operations to claim a spot. For high throughput, avoid locking the entire floor; instead, use fine-grained locks per spot or a lock-free data structure. At exit gates, update is simpler since only the ticket holder can release their specific spot. Use transactions if the state is persisted to a database.",
    },
    {
      q: "How would you design an elevator system for a 50-story building with 8 elevators?",
      a: "Use Destination Dispatch: riders enter their destination at the lobby panel, and the system groups them into elevators going to similar floors, reducing stops. Partition elevators into zones (e.g., elevators 1-3 serve floors 1-20, 4-6 serve 20-40, 7-8 are express to 40-50). The ElevatorController uses a scoring function to assign requests: score considers distance to the request floor, current direction, load, and number of pending stops. An event-driven architecture where each elevator publishes state changes and the controller reacts. Add priority handling for emergency and VIP floors.",
    },
    {
      q: "In a library system, how do you handle the scenario where a returned book has multiple reservations?",
      a: "Maintain a priority queue of reservations per book, ordered by reservation timestamp (first-come-first-served). When a copy is returned: (1) mark copy as Reserved (not Available), (2) dequeue the oldest reservation, (3) notify the member they have N days to pick up, (4) if they don't pick up within the window, cancel their reservation, re-enqueue or notify the next person. The BookCopy goes through states: Available -> Loaned -> Reserved -> (picked up) Loaned, or Reserved -> (expired) -> check next reservation or Available. This ensures fairness and prevents indefinite holding.",
    },
    {
      q: "What are the trade-offs between token bucket and sliding window for rate limiting?",
      a: "Token bucket allows bursts up to bucket capacity, which is good for APIs where occasional spikes are acceptable. It's simple to implement and memory-efficient (just a counter and timestamp). Sliding window log tracks exact timestamps of each request, giving precise rate limiting but using more memory (O(n) per client for n requests in the window). Sliding window counter is a hybrid: it divides time into sub-windows and interpolates, offering near-exact limiting with O(1) memory. Choose token bucket for simplicity and burst tolerance, sliding window counter for precision with reasonable memory.",
    },
  ],
  mcqs: [
    {
      q: "In a parking lot LLD, which design pattern best handles different spot allocation strategies?",
      options: [
        "Singleton",
        "Observer",
        "Strategy",
        "Decorator",
      ],
      answerIndex: 2,
      explanation:
        "The Strategy pattern allows swapping between different allocation algorithms (nearest-to-entrance, spread-across-floors, etc.) at runtime without changing the ParkingLot class.",
    },
    {
      q: "In an elevator system, the LOOK algorithm differs from SCAN in that:",
      options: [
        "LOOK only moves up, never down",
        "LOOK reverses direction when there are no more requests ahead, rather than going to the end",
        "LOOK handles multiple elevators while SCAN handles one",
        "LOOK is used only for freight elevators",
      ],
      answerIndex: 1,
      explanation:
        "SCAN always travels to the end of the range before reversing. LOOK optimizes by reversing as soon as there are no pending requests in the current direction, avoiding unnecessary travel.",
    },
    {
      q: "In a library system, which class relationship best describes Book and BookCopy?",
      options: [
        "Inheritance: BookCopy extends Book",
        "Composition: Book contains BookCopies",
        "Association: BookCopy references Book",
        "Aggregation: BookCopy aggregates Book",
      ],
      answerIndex: 1,
      explanation:
        "A Book (title/ISBN/author) contains multiple BookCopies (physical copies with barcodes). Copies don't exist without their Book definition, making it composition. Each copy references its parent book.",
    },
    {
      q: "Why must the check-and-decrement operation in a distributed rate limiter be atomic?",
      options: [
        "To improve performance through batching",
        "To prevent multiple requests from passing the limit simultaneously",
        "To reduce network round trips",
        "To enable horizontal scaling",
      ],
      answerIndex: 1,
      explanation:
        "Without atomicity, two concurrent requests could both read the counter as 1 remaining, both pass the check, and both decrement, allowing 2 requests when only 1 should pass. Atomic operations (like Redis MULTI/EXEC or Lua scripts) prevent this race condition.",
    },
  ],
  flashcards: [
    {
      front: "What are the key classes in a Parking Lot LLD?",
      back: "ParkingLot, ParkingFloor, ParkingSpot (Small/Medium/Large), Vehicle (Car/Truck/Motorcycle), Ticket (vehicle, spot, entry time), PaymentProcessor, DisplayBoard, EntryGate, ExitGate, SpotAllocationStrategy.",
    },
    {
      front: "What are the three main elevator scheduling algorithms?",
      back: "SCAN: sweep to the end in one direction, then reverse. LOOK: reverse when no more requests in current direction (optimized SCAN). Destination Dispatch: collect destinations at lobby, group passengers going to similar floors into the same elevator.",
    },
    {
      front: "What is the difference between Book and BookCopy in a library system?",
      back: "Book represents metadata (ISBN, title, author, subject). BookCopy represents a physical copy (barcode, condition, status: Available/Loaned/Reserved/Lost). One Book can have many BookCopies. Borrowing operates on copies, searching operates on books.",
    },
    {
      front: "What state transitions does a BookCopy go through?",
      back: "Available -> Loaned (when borrowed) -> Available (when returned, no reservations) or Reserved (when returned, reservation exists) -> Loaned (when reserved member picks up). Any state -> Lost (when reported lost). Lost -> Available (when found/replaced).",
    },
    {
      front: "How does a Token Bucket rate limiter work?",
      back: "A bucket holds tokens up to a maximum capacity. Tokens are added at a fixed refill rate. Each request consumes one token. If the bucket is empty, the request is rejected. The bucket allows bursts up to its capacity. State: token count + last refill timestamp.",
    },
    {
      front: "What recurring design patterns appear in LLD case studies?",
      back: "Strategy: swappable algorithms. Observer: notifications/updates. State: well-defined state machines. Factory: creating correct subclass from input. Singleton: system-wide managers. Template Method: common workflow with customizable steps.",
    },
    {
      front: "How do you handle vehicle-to-spot mapping in a parking lot?",
      back: "Define a compatibility matrix: Motorcycle fits Small/Medium/Large. Car fits Medium/Large. Truck/Bus fits Large only. Prefer the smallest compatible spot to maximize utilization. This can be encoded in the Vehicle subclass or in the allocation strategy.",
    },
  ],
  glossary: [
    {
      term: "SCAN Algorithm",
      definition:
        "An elevator scheduling algorithm where the elevator moves in one direction until it reaches the end, then reverses. Similar to a disk arm sweep.",
    },
    {
      term: "Destination Dispatch",
      definition:
        "An elevator scheduling system where passengers enter their destination floor before boarding, allowing the system to group passengers and reduce stops.",
    },
    {
      term: "Token Bucket",
      definition:
        "A rate limiting algorithm using a bucket that fills with tokens at a fixed rate. Each request consumes a token; requests are rejected when the bucket is empty.",
    },
    {
      term: "Sliding Window Counter",
      definition:
        "A rate limiting algorithm that tracks request counts in fixed sub-windows and interpolates to approximate a sliding window, balancing precision and memory.",
    },
    {
      term: "State Pattern",
      definition:
        "A behavioral design pattern where an object changes its behavior based on its internal state, with each state represented as a separate class implementing a common interface.",
    },
    {
      term: "BookCopy",
      definition:
        "In a library system, a physical instance of a book with its own barcode, condition, and status, as distinct from the Book entity which holds metadata like ISBN and title.",
    },
    {
      term: "Spot Allocation Strategy",
      definition:
        "In a parking lot system, the algorithm used to assign a parking spot to an incoming vehicle. Examples: nearest to entrance, spread across floors, smallest compatible spot.",
    },
  ],
};
