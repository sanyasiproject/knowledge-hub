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
