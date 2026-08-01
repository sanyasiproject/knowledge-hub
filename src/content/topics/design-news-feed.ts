import type { TopicContent } from "../types";

export const designNewsFeed: TopicContent = {
  quickSummary: [
    "A news feed system aggregates posts from users you follow and presents them in a ranked or chronological order. The two main approaches are fan-out on write (push model) and fan-out on read (pull model).",
    "Fan-out on write pre-computes each user's feed at post time: when a user publishes, the post is pushed to all followers' feed caches. Fast reads but expensive writes, especially for users with millions of followers.",
    "Fan-out on read computes the feed at read time: when a user opens their feed, the system fetches recent posts from all followed users and merges them. Cheap writes but slower reads and higher read-time compute.",
    "Most production systems use a hybrid approach: fan-out on write for normal users (fast reads), fan-out on read for celebrity users (avoid writing to millions of feeds), and a ranking service to order posts by relevance.",
  ],
  detailed: [
    "## Requirements and Scale\n\nFunctional: users create posts (text, images, video), follow other users, view a personalized feed, like/comment on posts. Non-functional: feed loads in <500ms, support 500M DAU, eventually consistent (a new post appearing a few seconds late is acceptable), high availability. Estimation: 500M DAU x 10 feed views/day = 5B feed reads/day = ~58K read QPS. 500M DAU x 1% posting = 5M posts/day. Average user follows 200 people. Feed shows top 50 posts. These numbers drive the architecture: reads dominate writes by 1000:1.",
    "## Fan-Out on Write (Push Model)\n\nWhen user A creates a post: (1) Store the post in the Posts table. (2) Look up all of A's followers. (3) For each follower, insert the post ID into their precomputed feed (stored in Redis as a sorted set keyed by user ID, scored by timestamp or rank). When a user opens their feed: read their precomputed feed from Redis, fetch full post details from the Posts table/cache, return. **Pros**: feed reads are extremely fast (single Redis read), simple read path. **Cons**: write amplification (a user with 10M followers triggers 10M Redis writes), wasted work for inactive users (computing feeds they never read), delay in feed update (fan-out takes time). **Optimization**: only fan out to users who have been active in the last N days.",
    "## Fan-Out on Read (Pull Model)\n\nWhen a user opens their feed: (1) Fetch the list of users they follow. (2) For each followed user, fetch their recent posts. (3) Merge and rank all posts. (4) Return the top N. **Pros**: no write amplification, no wasted work for inactive users, posts appear instantly (no fan-out delay). **Cons**: slow reads (must query many users' posts and merge), high read-time compute, hard to scale for users following thousands of accounts. **Optimization**: cache each user's recent posts, so the merge only involves cache reads. Paginate with cursors to avoid recomputing the entire feed.",
    "## Hybrid Approach and Feed Ranking\n\nThe hybrid model combines both strategies: **Regular users** (< 10K followers): fan-out on write. Their posts are pushed to followers' feeds immediately. **Celebrity users** (> 10K followers): fan-out on read. Their posts are fetched at read time and merged into the precomputed feed. At read time: (1) Read precomputed feed from Redis. (2) Fetch recent posts from followed celebrities. (3) Merge. (4) Apply ranking model. **Feed ranking** uses a scoring function considering: post age (decay), engagement signals (likes, comments, shares), user relationship strength (interaction history), content type preferences, and ML-predicted engagement probability. The ranker assigns a score to each candidate post and returns the top N. In production (Facebook, Twitter/X), the ranking model is a sophisticated ML pipeline trained on user engagement data.",
    "## Caching and Storage Design\n\n**Feed cache**: Redis sorted sets, one per user. Key: `feed:{userId}`, members: post IDs, score: timestamp or rank score. Limit to 500-1000 entries per feed. Evict oldest. **Post cache**: Redis hash or key-value. Key: `post:{postId}`, value: serialized post object. High TTL since posts rarely change. **Social graph cache**: user's following list cached in Redis sets for fast lookup during fan-out. **Media storage**: images and videos in object storage (S3) served through a CDN. Post records store only the media URL. **Database**: Posts table (postId, authorId, content, mediaUrls, createdAt), User table, Follow table (followerId, followeeId, createdAt). Follow table is the social graph, partitioned by followerId for efficient 'who do I follow' queries.",
  ],
  interviewQA: [
    {
      q: "Why do most systems use a hybrid fan-out approach instead of pure push or pull?",
      a: "Pure push (fan-out on write) is prohibitively expensive for celebrity users: a user with 50M followers would trigger 50M cache writes per post, causing massive latency and resource consumption. Pure pull (fan-out on read) makes feed loading slow for users following many accounts, as it requires fetching and merging posts from hundreds of sources at read time. The hybrid approach gets the best of both: fast reads for the majority of the feed (pre-computed via push from regular users) combined with targeted pull for celebrity content. The threshold (e.g., 10K followers) is tunable based on system capacity.",
    },
    {
      q: "How would you handle a celebrity posting to 50 million followers?",
      a: "Don't fan out the celebrity's post at write time. Instead, mark the celebrity as a 'pull' user. When any of their 50M followers loads their feed, the system fetches the precomputed feed (from regular users' push) and separately fetches recent posts from followed celebrities. These are merged and ranked client-side or in a lightweight merge service. The celebrity's recent posts are cached aggressively in Redis since 50M users will request them. This trades slightly slower reads for dramatically reduced write amplification.",
    },
    {
      q: "How does feed ranking work at a high level?",
      a: "Feed ranking scores each candidate post and returns the highest-scoring ones. The scoring function considers: (1) Recency: newer posts score higher, with an exponential decay. (2) Engagement: posts with more likes/comments/shares score higher. (3) Affinity: posts from users you interact with frequently score higher (based on likes, comments, DMs, profile views). (4) Content type: if a user engages more with videos, video posts score higher. (5) Predicted engagement: an ML model trained on historical data predicts the probability the user will like/comment/share. The final score is a weighted combination of these signals. The model is trained offline and served online via a feature store.",
    },
    {
      q: "How do you handle feed pagination?",
      a: "Use cursor-based pagination, not offset-based. The cursor is typically the timestamp or score of the last item on the current page. The next page fetches items with a score lower than the cursor. This is efficient because: (1) Redis ZREVRANGEBYSCORE with a score upper bound is O(log N + M). (2) It handles new posts appearing without shifting pages (unlike offset, where page 2 would shift if new items are added to page 1). (3) The cursor is opaque to the client: encode it as a base64 token containing the score and post ID (for tiebreaking). Return the cursor in the API response for the client to pass in the next request.",
    },
  ],
  mcqs: [
    {
      q: "Fan-out on write is expensive primarily because:",
      options: [
        "Reading the feed requires merging from many sources",
        "Each post must be written to every follower's feed cache",
        "Posts must be ranked in real time",
        "The social graph must be recalculated on each post",
      ],
      answerIndex: 1,
      explanation:
        "Fan-out on write pushes each new post to all followers' precomputed feeds. For a user with N followers, one post creation triggers N cache writes, which is the write amplification problem.",
    },
    {
      q: "In a hybrid fan-out approach, celebrity users' posts are:",
      options: [
        "Never shown in feeds",
        "Pushed to all followers at write time",
        "Fetched at read time and merged into the precomputed feed",
        "Stored in a separate database",
      ],
      answerIndex: 2,
      explanation:
        "Celebrity posts are fetched at read time (pull model) and merged into the feed that was precomputed from regular users' posts (push model). This avoids the massive write amplification of pushing to millions of followers.",
    },
    {
      q: "Why is cursor-based pagination preferred over offset-based for feeds?",
      options: [
        "Cursors use less memory",
        "Cursors are more secure",
        "New posts don't cause items to shift between pages",
        "Cursors enable faster database queries",
      ],
      answerIndex: 2,
      explanation:
        "With offset-based pagination, inserting new items at the top shifts existing items, causing duplicates or missed items across pages. Cursor-based pagination uses a stable reference point (timestamp/score), so new items don't affect already-fetched pages.",
    },
    {
      q: "Which data structure is commonly used to store a user's precomputed feed in Redis?",
      options: [
        "String",
        "List",
        "Sorted Set",
        "Hash",
      ],
      answerIndex: 2,
      explanation:
        "Redis sorted sets store post IDs scored by timestamp or rank, enabling efficient range queries (get top N posts), score-based pagination, and automatic ordering. ZREVRANGEBYSCORE fetches the feed in descending order.",
    },
  ],
  flashcards: [
    {
      front: "What is fan-out on write?",
      back: "When a user posts, the post is immediately pushed (written) to all followers' precomputed feed caches. Fast reads (just read the cache), but expensive writes proportional to follower count. Also called the push model.",
    },
    {
      front: "What is fan-out on read?",
      back: "When a user opens their feed, the system fetches recent posts from all followed users and merges/ranks them on the fly. No write amplification, but slower reads. Also called the pull model.",
    },
    {
      front: "What is the hybrid fan-out approach?",
      back: "Use fan-out on write for regular users (<10K followers) and fan-out on read for celebrities (>10K followers). At read time, merge the precomputed feed with pulled celebrity posts. Balances read speed and write cost.",
    },
    {
      front: "What signals does a feed ranking model use?",
      back: "Recency (time decay), engagement (likes/comments/shares), affinity (interaction history with author), content type preference, predicted engagement probability (ML model). The final rank is a weighted combination of these signals.",
    },
    {
      front: "How is a user's feed stored in Redis?",
      back: "As a sorted set: key is feed:{userId}, members are post IDs, scores are timestamps or rank scores. ZREVRANGEBYSCORE retrieves the top N posts. Limited to 500-1000 entries per user with oldest evicted.",
    },
    {
      front: "What is write amplification in the context of news feeds?",
      back: "When one post creation triggers writes to many followers' feed caches. A user with 1M followers causes 1M cache writes per post. This is the primary cost of fan-out on write and why celebrities are handled differently.",
    },
    {
      front: "How does cursor-based pagination work for feeds?",
      back: "The cursor encodes the score/timestamp of the last seen item. The next page requests items with scores below the cursor. This is stable even when new items are added at the top, unlike offset-based pagination which can cause duplicates or gaps.",
    },
  ],
  deepDive: [
    "**Understanding Fan-Out Trade-offs at Scale**\n\nThe core tension in news feed design lies in *when* to do the computational work of assembling a feed. **Fan-out on write** front-loads the cost: every `POST /posts` triggers a cascade of writes to followers' feed caches. For a social network with 500M DAU, where the average user follows ~200 accounts, each post potentially touches hundreds of sorted sets in Redis. The *write amplification factor* is directly proportional to the author's follower count. At Twitter's scale (~500M tweets/day), even with a modest average of 100 followers per author, that is **50 billion cache mutations per day**. The system must handle bursty writes (celebrity posting during prime time) without degrading feed read latency. To mitigate this, engineers introduce **async fan-out workers** backed by message queues like Kafka or RabbitMQ. The post service enqueues a `FanOutTask` containing the `postId` and `authorId`, and a fleet of fan-out workers consume these tasks, batch-fetching follower lists and performing `ZADD` operations on each follower's Redis sorted set. Worker concurrency, batch sizes, and queue partitioning (by author ID hash) become critical tuning knobs.",
    "**Feed Ranking and the ML Pipeline**\n\nModern feeds are *not* purely chronological. Facebook's **EdgeRank** (now deprecated in favor of deeper ML) introduced the concept of scoring each candidate post with `Score = Affinity x Weight x Decay`. Today's systems use **gradient-boosted decision trees** (XGBoost/LightGBM) or **deep neural networks** trained on engagement labels (`clicked`, `liked`, `commented`, `shared`, `reported`, `hid`). The feature vector for each `(user, post)` pair includes: *author features* (follower count, post frequency, historical engagement rate), *viewer features* (session recency, device type, topic interests), *interaction features* (messages exchanged, profile views, mutual friends), and *content features* (media type, text sentiment, entity tags, image quality score). The ranking service fetches a **candidate set** (e.g., 500 posts from the precomputed feed + celebrity pull), computes features from a **feature store** (often backed by Redis or a purpose-built system like Feast), scores them via the ML model, and returns the **top-N** with diversity constraints (no more than 3 posts from the same author, mix content types). The entire scoring pipeline must complete in <100ms to keep the end-to-end feed latency under 500ms.",
    "**Consistency, Availability, and Failure Modes**\n\nNews feed systems are designed for **eventual consistency** — a post appearing 2-5 seconds late in a follower's feed is acceptable. However, certain invariants must hold: a user must *always* see their own posts in their feed (read-your-writes consistency), and deleting a post must propagate within seconds to avoid showing removed content. For fan-out on write, if a fan-out worker crashes mid-way, some followers get the post and others do not until the worker retries. Using **idempotent `ZADD`** operations (Redis sorted set adds are naturally idempotent) ensures retries are safe. For the pull path, if the cache for a celebrity's recent posts is stale, the system falls back to a **database query** with a short TTL cache-aside pattern. **Circuit breakers** protect the ranking service: if the ML scoring service is down, the system falls back to a simpler chronological sort rather than returning an error. Feed caches are sharded across Redis clusters using **consistent hashing** (e.g., hashing `userId` to a shard). If a shard goes down, the system can either serve a *degraded feed* (missing some posts) or redirect to a replica. The key design principle is **graceful degradation**: the feed should always render *something*, even if it is slightly stale or unranked.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Node.js/Express Feed API with MongoDB and Redis",
      source: `const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const redis = new Redis({ host: 'localhost', port: 6379 });
const FEED_MAX_SIZE = 500;

let db;
MongoClient.connect('mongodb://localhost:27017')
  .then(client => { db = client.db('newsfeed'); });

// POST /posts — Create a post and fan-out to followers
app.post('/posts', async (req, res) => {
  const { authorId, content, mediaUrls } = req.body;
  const post = {
    authorId,
    content,
    mediaUrls: mediaUrls || [],
    createdAt: new Date(),
    likes: 0,
    comments: 0,
  };

  // 1. Store post in MongoDB
  const result = await db.collection('posts').insertOne(post);
  const postId = result.insertedId.toString();

  // 2. Cache the post object in Redis (TTL: 24 hours)
  await redis.set(
    \`post:\${postId}\`,
    JSON.stringify({ ...post, _id: postId }),
    'EX', 86400
  );

  // 3. Check if author is a "celebrity" (>10K followers)
  const followerCount = await db.collection('follows')
    .countDocuments({ followeeId: authorId });

  if (followerCount <= 10000) {
    // Fan-out on write for regular users
    const cursor = db.collection('follows')
      .find({ followeeId: authorId })
      .project({ followerId: 1 });

    const batch = [];
    await cursor.forEach(doc => {
      batch.push(
        redis.zadd(\`feed:\${doc.followerId}\`, Date.now(), postId)
      );
    });
    await Promise.all(batch);

    // Trim each feed to max size (async, fire-and-forget)
    const trimCursor = db.collection('follows')
      .find({ followeeId: authorId })
      .project({ followerId: 1 });
    trimCursor.forEach(doc => {
      redis.zremrangebyrank(\`feed:\${doc.followerId}\`, 0, -(FEED_MAX_SIZE + 1));
    });
  }
  // Celebrity posts are NOT fanned out — pulled at read time

  res.status(201).json({ postId });
});

// GET /feed/:userId — Retrieve personalized feed with cursor pagination
app.get('/feed/:userId', async (req, res) => {
  const { userId } = req.params;
  const cursor = req.query.cursor
    ? parseFloat(req.query.cursor)
    : '+inf';
  const pageSize = parseInt(req.query.limit) || 20;

  // 1. Read precomputed feed from Redis (fan-out on write posts)
  const postIds = await redis.zrevrangebyscore(
    \`feed:\${userId}\`,
    cursor === '+inf' ? '+inf' : \`(\${cursor}\`,
    '-inf',
    'WITHSCORES',
    'LIMIT', 0, pageSize
  );

  // 2. Pull celebrity posts (fan-out on read)
  const following = await db.collection('follows')
    .find({ followerId: userId })
    .project({ followeeId: 1 })
    .toArray();

  const celebrityIds = [];
  for (const f of following) {
    const count = await redis.get(\`follower_count:\${f.followeeId}\`);
    if (count && parseInt(count) > 10000) {
      celebrityIds.push(f.followeeId);
    }
  }

  let celebrityPosts = [];
  if (celebrityIds.length > 0) {
    celebrityPosts = await db.collection('posts')
      .find({
        authorId: { $in: celebrityIds },
        createdAt: { $gte: new Date(Date.now() - 86400000) }
      })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .toArray();
  }

  // 3. Merge precomputed + celebrity posts, sort by timestamp
  const allPostIds = [];
  for (let i = 0; i < postIds.length; i += 2) {
    allPostIds.push({ id: postIds[i], score: parseFloat(postIds[i + 1]) });
  }
  for (const cp of celebrityPosts) {
    allPostIds.push({ id: cp._id.toString(), score: cp.createdAt.getTime() });
  }
  allPostIds.sort((a, b) => b.score - a.score);
  const topN = allPostIds.slice(0, pageSize);

  // 4. Fetch full post objects
  const posts = await Promise.all(
    topN.map(async ({ id, score }) => {
      let post = await redis.get(\`post:\${id}\`);
      if (post) return { ...JSON.parse(post), _score: score };
      const dbPost = await db.collection('posts').findOne({ _id: new ObjectId(id) });
      return dbPost ? { ...dbPost, _score: score } : null;
    })
  );

  // 5. Build next cursor
  const nextCursor = topN.length > 0
    ? topN[topN.length - 1].score.toString()
    : null;

  res.json({
    posts: posts.filter(Boolean),
    nextCursor,
    hasMore: topN.length === pageSize,
  });
});

app.listen(3000, () => console.log('Feed service on :3000'));`,
    },
    {
      language: "cpp",
      caption: "C++ Fan-Out Implementation with Thread Pool and Concurrent Queue",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <mutex>
#include <thread>
#include <condition_variable>
#include <functional>
#include <string>
#include <algorithm>
#include <chrono>
#include <atomic>

// Thread-safe sorted feed (simulates Redis sorted set)
class FeedCache {
public:
    struct FeedEntry {
        std::string postId;
        double      score;  // timestamp as double
        bool operator<(const FeedEntry& o) const { return score > o.score; }
    };

    void addPost(const std::string& userId,
                 const std::string& postId,
                 double score,
                 size_t maxSize = 500) {
        std::lock_guard<std::mutex> lock(mtx_);
        auto& feed = feeds_[userId];
        feed.push_back({postId, score});
        std::sort(feed.begin(), feed.end());
        // Trim to maxSize (evict oldest)
        if (feed.size() > maxSize) {
            feed.resize(maxSize);
        }
    }

    std::vector<FeedEntry> getFeed(const std::string& userId,
                                   double cursorScore,
                                   size_t limit) {
        std::lock_guard<std::mutex> lock(mtx_);
        std::vector<FeedEntry> result;
        auto it = feeds_.find(userId);
        if (it == feeds_.end()) return result;

        for (const auto& entry : it->second) {
            if (entry.score < cursorScore) {
                result.push_back(entry);
                if (result.size() >= limit) break;
            }
        }
        return result;
    }

private:
    std::unordered_map<std::string, std::vector<FeedEntry>> feeds_;
    std::mutex mtx_;
};

// Simple thread pool for async fan-out workers
class ThreadPool {
public:
    explicit ThreadPool(size_t numThreads) : stop_(false) {
        for (size_t i = 0; i < numThreads; ++i) {
            workers_.emplace_back([this] { workerLoop(); });
        }
    }

    ~ThreadPool() {
        { std::lock_guard<std::mutex> lock(mtx_);  stop_ = true; }
        cv_.notify_all();
        for (auto& w : workers_) w.join();
    }

    void enqueue(std::function<void()> task) {
        { std::lock_guard<std::mutex> lock(mtx_); tasks_.push(std::move(task)); }
        cv_.notify_one();
    }

private:
    void workerLoop() {
        while (true) {
            std::function<void()> task;
            {
                std::unique_lock<std::mutex> lock(mtx_);
                cv_.wait(lock, [&] { return stop_ || !tasks_.empty(); });
                if (stop_ && tasks_.empty()) return;
                task = std::move(tasks_.front());
                tasks_.pop();
            }
            task();
        }
    }

    std::vector<std::thread>          workers_;
    std::queue<std::function<void()>> tasks_;
    std::mutex                        mtx_;
    std::condition_variable           cv_;
    bool                              stop_;
};

// Social graph (simulates Follow table)
class SocialGraph {
public:
    void addFollow(const std::string& follower, const std::string& followee) {
        std::lock_guard<std::mutex> lock(mtx_);
        followers_[followee].insert(follower);
        following_[follower].insert(followee);
    }

    std::vector<std::string> getFollowers(const std::string& userId) {
        std::lock_guard<std::mutex> lock(mtx_);
        auto it = followers_.find(userId);
        if (it == followers_.end()) return {};
        return {it->second.begin(), it->second.end()};
    }

    size_t followerCount(const std::string& userId) {
        std::lock_guard<std::mutex> lock(mtx_);
        auto it = followers_.find(userId);
        return it == followers_.end() ? 0 : it->second.size();
    }

private:
    std::unordered_map<std::string, std::unordered_set<std::string>> followers_;
    std::unordered_map<std::string, std::unordered_set<std::string>> following_;
    std::mutex mtx_;
};

// Fan-out service
class FanOutService {
public:
    static constexpr size_t CELEBRITY_THRESHOLD = 10000;

    FanOutService(size_t workerCount)
        : pool_(workerCount), postsProcessed_(0) {}

    // Called when a user creates a new post
    void onPostCreated(const std::string& authorId,
                       const std::string& postId) {
        double score = static_cast<double>(
            std::chrono::system_clock::now().time_since_epoch().count()
        );

        size_t count = graph_.followerCount(authorId);

        if (count <= CELEBRITY_THRESHOLD) {
            // Fan-out on write: enqueue async tasks
            auto followers = graph_.getFollowers(authorId);

            // Batch followers into chunks for parallel processing
            const size_t BATCH_SIZE = 1000;
            for (size_t i = 0; i < followers.size(); i += BATCH_SIZE) {
                size_t end = std::min(i + BATCH_SIZE, followers.size());
                std::vector<std::string> batch(
                    followers.begin() + i, followers.begin() + end
                );

                pool_.enqueue([this, batch, postId, score]() {
                    for (const auto& followerId : batch) {
                        cache_.addPost(followerId, postId, score);
                    }
                    postsProcessed_ += batch.size();
                });
            }
        }
        // Celebrity posts: skip fan-out (pulled at read time)
    }

    FeedCache&    cache() { return cache_; }
    SocialGraph&  graph() { return graph_; }
    size_t        processed() const { return postsProcessed_.load(); }

private:
    FeedCache               cache_;
    SocialGraph             graph_;
    ThreadPool              pool_;
    std::atomic<size_t>     postsProcessed_;
};

int main() {
    FanOutService svc(4);  // 4 fan-out worker threads

    // Build social graph
    for (int i = 1; i <= 100; ++i) {
        svc.graph().addFollow("user_" + std::to_string(i), "author_1");
    }

    // Author creates a post
    svc.onPostCreated("author_1", "post_abc123");

    // Allow fan-out workers to complete
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Read a follower's feed
    auto feed = svc.cache().getFeed(
        "user_1", std::numeric_limits<double>::max(), 10
    );

    std::cout << "Feed for user_1 (" << feed.size() << " items):" << std::endl;
    for (const auto& entry : feed) {
        std::cout << "  postId=" << entry.postId
                  << "  score=" << entry.score << std::endl;
    }
    std::cout << "Total fan-out writes: " << svc.processed() << std::endl;
    return 0;
}`,
    },
    {
      language: "javascript",
      caption: "Feed Ranking Scoring Function (Simplified)",
      source: `/**
 * Simplified feed ranking scorer.
 *
 * In production this would be backed by an ML model (XGBoost/DNN)
 * served via a feature store. This illustrates the scoring logic.
 */

function scoreFeedPost(post, viewer, interactionHistory) {
  // --- Recency decay (exponential) ---
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3.6e6;
  const recencyScore = Math.exp(-0.05 * ageHours);  // half-life ~14 hours

  // --- Engagement signal ---
  const engagementScore = Math.log1p(
    post.likes * 1.0 +
    post.comments * 2.0 +   // comments weighted higher
    post.shares * 3.0
  ) / 10.0;

  // --- Affinity (interaction strength between viewer and author) ---
  const history = interactionHistory[post.authorId] || {};
  const affinityScore = Math.min(1.0,
    (history.likes     || 0) * 0.1 +
    (history.comments  || 0) * 0.2 +
    (history.dms       || 0) * 0.3 +
    (history.profileViews || 0) * 0.05
  );

  // --- Content type boost ---
  const typeBoost = {
    video: 1.2,
    image: 1.1,
    link:  1.0,
    text:  0.9,
  };
  const contentScore = typeBoost[post.contentType] || 1.0;

  // --- Weighted combination ---
  const finalScore =
    0.35 * recencyScore +
    0.25 * engagementScore +
    0.25 * affinityScore +
    0.15 * contentScore;

  return { postId: post._id, score: finalScore };
}

// Rank a candidate set and return top N with diversity constraints
function rankFeed(candidates, viewer, interactionHistory, limit = 20) {
  const scored = candidates.map(post =>
    scoreFeedPost(post, viewer, interactionHistory)
  );
  scored.sort((a, b) => b.score - a.score);

  // Diversity: max 3 posts from same author
  const result = [];
  const authorCount = {};
  for (const item of scored) {
    const post = candidates.find(p => p._id === item.postId);
    const aid = post.authorId;
    authorCount[aid] = (authorCount[aid] || 0) + 1;
    if (authorCount[aid] <= 3) {
      result.push(item);
      if (result.length >= limit) break;
    }
  }
  return result;
}`,
    },
  ],
  diagrams: [
    {
      title: "News Feed System Architecture",
      kind: "architecture",
      caption: "High-level architecture showing the write path through fan-out workers, the read path merging pre-computed and celebrity posts, and the ranking service.",
      mermaid: `graph TB
    subgraph Write ["Write Path"]
        PS["Post Service"]
        MQ["Message Queue"]
        FW["Fan-Out Workers"]
        REDIS["Redis Feed Cache"]
    end
    subgraph Read ["Read Path"]
        FS["Feed Service"]
        RANKER["ML Ranker"]
    end
    subgraph Storage ["Storage"]
        DB["Posts DB - MongoDB"]
        SG["Social Graph DB"]
        FS_STORE["Feature Store"]
    end
    PS --> MQ
    MQ --> FW
    FW --> SG
    FW --> REDIS
    FS --> REDIS
    FS --> DB
    FS --> RANKER
    RANKER --> FS_STORE`,
    },
    {
      title: "Fan-Out on Write Sequence",
      kind: "sequence",
      caption: "When a user creates a post, fan-out workers asynchronously write the post ID to each follower's Redis sorted-set feed cache.",
      mermaid: `sequenceDiagram
    participant U as Author
    participant API as API Gateway
    participant PS as Post Service
    participant MQ as Message Queue
    participant FW as Fan-Out Worker
    participant SG as Social Graph
    participant RC as Redis Feed Cache
    U->>API: POST /posts
    API->>PS: Create post
    PS->>MQ: Enqueue FanOutTask
    PS-->>U: 201 Created
    MQ->>FW: Dequeue task
    FW->>SG: Get followers
    SG-->>FW: follower list
    FW->>RC: ZADD feed per follower`,
    },
    {
      title: "Fan-Out on Write vs Read",
      kind: "flow",
      caption: "Decision tree for choosing fan-out on write, fan-out on read, or a hybrid approach based on follower count and latency requirements.",
      mermaid: `flowchart TD
    A[User creates post] --> B{Has celebrity followers?}
    B -->|Yes - millions of followers| C[Fan-Out on Read]
    B -->|No - regular user| D[Fan-Out on Write]
    D --> E[Write postId to each follower Redis feed]
    C --> F[Store post in DB only]
    E --> G[Feed read is fast single Redis query]
    F --> H[Feed read fetches celebrity posts at query time]
    G --> I[Hybrid: combine both at read time]
    H --> I`,
    },
    {
      title: "Feed Ranking Pipeline",
      kind: "flow",
      caption: "After retrieving candidate posts, the ranking service scores them using ML features and applies diversity constraints before returning the final feed.",
      mermaid: `flowchart TD
    A[Retrieve candidate posts from Redis] --> B[Fetch celebrity posts from DB]
    B --> C[Merge candidates into pool]
    C --> D[Load engagement features from Feature Store]
    D --> E[Score each post via ML model]
    E --> F[Apply diversity - max 3 per author]
    F --> G[Sort by score descending]
    G --> H[Paginate with cursor token]
    H --> I[Return feed to client]`,
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "**Push** (Fan-Out on Write)",
      "**Pull** (Fan-Out on Read)",
      "**Hybrid** (Push + Pull)",
    ],
    rows: [
      [
        "**Write cost**",
        "High — O(N) writes per post where N = follower count",
        "Low — O(1), just store the post",
        "Medium — O(N) only for non-celebrity users",
      ],
      [
        "**Read latency**",
        "Very low — single cache read",
        "High — must fetch and merge from many sources",
        "Low — cache read + small celebrity merge",
      ],
      [
        "**Celebrity handling**",
        "Extremely expensive (millions of writes per post)",
        "Natural fit (posts fetched on demand)",
        "Celebrities use pull; rest use push",
      ],
      [
        "**Storage overhead**",
        "High — post ID duplicated across all follower feeds",
        "Low — posts stored once",
        "Moderate — duplication only for non-celebrity posts",
      ],
      [
        "**Inactive user waste**",
        "Yes — feeds computed for users who never read them",
        "None — feed computed only when requested",
        "Partial — can skip fan-out for users inactive > N days",
      ],
      [
        "**Post visibility delay**",
        "Small — time for async fan-out to complete",
        "None — posts visible immediately on next read",
        "Small for push users; none for pull celebrities",
      ],
      [
        "**System complexity**",
        "Moderate — fan-out workers, queue, cache management",
        "Moderate — merge logic, multi-source queries",
        "High — both paths, threshold logic, merge + rank",
      ],
      [
        "**Best suited for**",
        "Networks with low avg follower counts (private apps)",
        "Networks with many high-follower users or low read rates",
        "Large-scale public social networks (Twitter, Facebook, Instagram)",
      ],
    ],
  },
  exercises: [
    "**Design a Fan-Out Threshold Optimizer**: Given a dataset of `(userId, followerCount, avgPostsPerDay, followerActiveRate)`, write a program that determines the optimal **celebrity threshold** (fan-out on write vs. read cutoff) to minimize total system cost. Define cost as `writeCost = followerCount * postsPerDay` for push users and `readCost = followingCelebrities * readsPerDay` for pull. Plot total cost vs. threshold value.",
    "**Implement Cursor-Based Pagination**: Extend the Node.js feed API to support *bidirectional* cursor pagination. The API should accept `cursor`, `direction` (`next` or `prev`), and `limit`. Handle edge cases: what happens when new posts are inserted between page fetches? Write tests proving no posts are duplicated or skipped across pages.",
    "**Build a Simple Feed Ranker**: Implement the `scoreFeedPost` function in your language of choice. Given a list of 100 mock posts with varying `likes`, `comments`, `shares`, `createdAt`, and `contentType`, rank them using the weighted formula: `0.35 * recency + 0.25 * engagement + 0.25 * affinity + 0.15 * contentBoost`. Verify that a highly-engaged old post can outrank a recent low-engagement post.",
    "**Simulate Write Amplification**: Write a simulation that models a social network with 1M users where follower counts follow a **power-law distribution** (most users have <500 followers, a few have >1M). Simulate 10,000 posts and measure: total Redis writes under pure push, pure pull reads, and hybrid (threshold = 10K). Compare the total I/O cost of each strategy.",
    "**Design a Feed Notification System**: Extend the news feed design to support *push notifications* for high-priority posts (e.g., posts from close friends, posts in groups with notifications enabled). Design the notification pipeline: how do you avoid spamming users? How do you batch notifications? How do you handle notification preferences per user? Provide an architecture diagram and API contracts.",
  ],
  cheatSheet: [
    "**Fan-out on write** = push model: post is written to all followers' feed caches at *write time*. Use for users with `followerCount <= threshold` (typically 10K). Redis `ZADD feed:{userId} timestamp postId`.",
    "**Fan-out on read** = pull model: feed is assembled at *read time* by fetching posts from all followed users. Use for celebrities with `followerCount > threshold`. Avoids write amplification entirely.",
    "**Hybrid approach**: push for regular users + pull for celebrities. At read time, merge precomputed feed (from Redis) with freshly fetched celebrity posts, then rank. This is what **Twitter, Facebook, and Instagram** use in production.",
    "**Feed cache**: Redis sorted set per user. Key = `feed:{userId}`, member = `postId`, score = `timestamp`. Read with `ZREVRANGEBYSCORE`. Trim with `ZREMRANGEBYRANK` to cap at 500-1000 entries.",
    "**Cursor-based pagination**: encode last item's `(score, postId)` as an opaque base64 cursor. Next page = `ZREVRANGEBYSCORE feed:{userId} (cursor_score -inf LIMIT 0 pageSize`. Stable under concurrent inserts (unlike offset-based).",
    "**Ranking formula**: `Score = w1*Recency + w2*Engagement + w3*Affinity + w4*ContentBoost`. Production systems use ML models (XGBoost, deep nets) with features from a **feature store**. Must complete scoring in <100ms for 500 candidates.",
  ],
  revisionNotes: [
    "The two fundamental feed distribution strategies are **fan-out on write** (push: fast reads, expensive writes proportional to follower count) and **fan-out on read** (pull: cheap writes, expensive reads requiring multi-source merge). Production systems use a **hybrid**: push for normal users, pull for celebrities with follower counts above a configurable threshold (~10K).",
    "**Redis sorted sets** are the backbone of feed caching. Each user gets a sorted set (`feed:{userId}`) where post IDs are members and timestamps are scores. `ZADD` inserts, `ZREVRANGEBYSCORE` reads in reverse chronological order, and `ZREMRANGEBYRANK` trims to a max size. Fan-out workers consume from a **message queue** (Kafka/RabbitMQ) and perform batch `ZADD` operations asynchronously.",
    "**Feed ranking** transforms a chronological candidate set into a relevance-ordered feed. The scoring function combines *recency decay* (exponential), *engagement signals* (likes/comments/shares), *affinity* (viewer-author interaction strength), and *content type boost*. Modern systems train **ML models** on engagement labels and serve predictions via a feature store in <100ms per request.",
    "**Cursor-based pagination** is essential for feeds because new posts are continuously inserted at the top. Unlike offset-based pagination (where `page=2` shifts when new items arrive), a cursor anchored to the last seen item's score/ID provides a stable reference point. The cursor is encoded as an opaque token (base64 of score + postId for tiebreaking) and returned in each API response.",
    "**Graceful degradation** is a key design principle: if the ranking service is down, fall back to chronological order; if a Redis shard is unavailable, serve a partial feed from replicas; if celebrity post cache is stale, query the database with a short TTL. The feed should *always render something* rather than return an error. **Read-your-writes consistency** is the one hard requirement: a user must always see their own posts immediately.",
  ],
  glossary: [
    {
      term: "Fan-Out on Write",
      definition:
        "A feed distribution strategy where new posts are pushed to all followers' precomputed feeds at write time. Optimizes read latency at the cost of write amplification.",
    },
    {
      term: "Fan-Out on Read",
      definition:
        "A feed distribution strategy where a user's feed is computed at read time by fetching and merging posts from all followed users. No write amplification but slower reads.",
    },
    {
      term: "Write Amplification",
      definition:
        "When a single logical write (one post) triggers many physical writes (to every follower's feed). A key scalability challenge for push-based feed systems.",
    },
    {
      term: "Feed Ranking",
      definition:
        "The process of scoring and ordering candidate posts for a user's feed based on relevance signals like recency, engagement, affinity, and ML predictions.",
    },
    {
      term: "Social Graph",
      definition:
        "The network of follow/friend relationships between users. Stored as edges (followerId, followeeId) and queried to determine whose posts appear in a feed.",
    },
    {
      term: "Cursor-Based Pagination",
      definition:
        "A pagination method using an opaque token (cursor) representing the position of the last item, rather than numeric offsets. Stable under concurrent insertions.",
    },
    {
      term: "Affinity Score",
      definition:
        "A measure of how closely two users interact, computed from likes, comments, DMs, profile views, and other engagement signals. Used in feed ranking to prioritize content from close connections.",
    },
  ],
};
