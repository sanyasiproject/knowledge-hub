import type { TopicContent } from "../types";

export const designUrlShortener: TopicContent = {
  quickSummary: [
    "A URL shortener maps a long URL to a short key (e.g., bit.ly/abc123), stores the mapping, and redirects users who visit the short URL. The core challenge is generating unique, compact short keys at scale.",
    "Base62 encoding (a-z, A-Z, 0-9) converts a numeric ID into a compact string. A 7-character base62 key provides 62^7 = ~3.5 trillion unique URLs, sufficient for most use cases.",
    "Key generation strategies include: auto-incrementing ID + base62, pre-generated key service (KGS), random generation with collision checking, or hash-based (MD5/SHA256 truncation). Each has trade-offs in uniqueness, predictability, and distributed scalability.",
    "The read path (redirect) must be extremely fast. Use a cache (Redis) in front of the database to serve popular short URLs with sub-millisecond latency. Use 301 (permanent) or 302 (temporary) redirects based on whether you need analytics.",
  ],
  detailed: [
    "## Requirements and Estimation\n\nFunctional: create short URL from long URL, redirect short URL to long URL, optional custom aliases, optional expiration, click analytics. Non-functional: low latency redirects (<100ms), high availability (redirects must never fail), eventual consistency is acceptable for analytics. Scale: assume 100M new URLs/month = ~40 URLs/second write, 100:1 read-to-write ratio = 4000 redirects/second. Storage: 100M URLs/month x 12 months x 5 years x 500 bytes = ~300GB. Cache: 20% of daily reads, ~4000 QPS x 86400 / 5 x 500B = ~35GB fits in one Redis node.",
    "## Key Generation Approaches\n\n**Auto-increment + Base62**: use a global counter, convert each number to base62. Simple but creates a single point of failure and keys are predictable (sequential). Mitigate with multiple counter ranges (server 1 gets odd numbers, server 2 gets even). **Pre-generated Key Service (KGS)**: a service pre-generates random keys and stores them in a database with two tables: unused_keys and used_keys. When a new URL is created, take a key from unused_keys and move it to used_keys. The KGS can pre-load keys into memory for fast allocation. If a KGS server dies, those in-memory keys are lost (acceptable since the key space is huge). **Hash-based**: compute MD5 or SHA256 of the long URL, take the first 7 characters. Collisions are possible; check the database and rehash or append a counter. **Random**: generate a random 7-character base62 string, check for collision, retry. Collision probability is low with 3.5 trillion possible keys but increases over time.",
    "## System Architecture\n\n**Write path**: Client sends long URL to the API server. API server calls the Key Generation Service to get a unique short key. The mapping (shortKey -> longURL, createdAt, expiresAt, userId) is stored in a database (NoSQL like DynamoDB for simple key-value lookups, or PostgreSQL). The short URL is returned. **Read path**: User visits short.url/abc123. The API server checks Redis cache for the key. Cache hit: redirect immediately. Cache miss: query database, populate cache, redirect. Use an LRU eviction policy. **Analytics**: on each redirect, publish a click event (timestamp, short key, referrer, user agent, IP) to Kafka. A separate analytics service consumes events and aggregates them into a data warehouse. This keeps the redirect path fast by offloading analytics to an async pipeline.",
    "## 301 vs 302 Redirects\n\nHTTP 301 (Moved Permanently) tells the browser to cache the redirect and never hit the server again for that URL. Reduces server load but prevents click tracking since subsequent visits go directly to the destination. HTTP 302 (Found/Temporary) tells the browser to check with the server every time, enabling click analytics but increasing server load. Most URL shorteners use 302 because analytics (click counts, geographic distribution, referrer tracking) are a core feature. If analytics are not needed and you want to minimize load, use 301.",
    "## Scaling and Reliability\n\n**Database scaling**: partition by the first character(s) of the short key for even distribution. With base62, you can have 62 partitions. **Cache scaling**: use a Redis cluster with consistent hashing. Hot keys (viral URLs) might need special handling (local caching on app servers). **Rate limiting**: prevent abuse by limiting URL creation per user/IP. **Expiration**: a background job periodically scans for expired URLs and removes them, returning keys to the pool. **Custom aliases**: check the database for uniqueness before accepting. Store in the same table with a flag. **High availability**: replicate the database (primary-replica), run multiple app servers behind a load balancer, and ensure the KGS has standby instances.",
  ],
  interviewQA: [
    {
      q: "Why is base62 used instead of base64 for URL shortening?",
      a: "Base62 uses a-z, A-Z, and 0-9, which are all URL-safe characters. Base64 includes '+' and '/' which have special meanings in URLs and would need percent-encoding, making the short URL longer and less clean. Base62 avoids this while still providing a large key space: 62^7 = ~3.5 trillion unique keys. Some implementations use base58, further removing visually ambiguous characters (0, O, I, l) to prevent user confusion.",
    },
    {
      q: "How would you handle the case where two users shorten the same long URL?",
      a: "Two approaches: (1) Give each request a unique short URL. This is simpler, avoids looking up existing URLs, and lets each user have their own analytics. The trade-off is slightly more storage. (2) Return the same short URL for identical long URLs. This requires a secondary index on the long URL to check for existence, adding read latency on writes. Most real-world shorteners (bit.ly, TinyURL) use approach 1 because analytics per link are a core feature, and storage is cheap.",
    },
    {
      q: "How does the Key Generation Service (KGS) work in a distributed environment?",
      a: "The KGS pre-generates millions of random 7-character keys and stores them in a database with two tables: unused_keys and used_keys. Multiple KGS servers each load a batch of keys (e.g., 10,000) into memory from unused_keys using a SELECT-and-DELETE transaction. Each server hands out keys from its in-memory batch without database calls. When the batch is exhausted, it loads another batch. If a KGS server crashes, those in-memory keys are wasted but the key space is so large this is negligible. Concurrency between KGS servers is handled at the database level (each batch is exclusively claimed).",
    },
    {
      q: "How would you add click analytics without slowing down redirects?",
      a: "Use an async pipeline. On each redirect, the app server publishes a lightweight click event (shortKey, timestamp, IP, user-agent, referrer) to Kafka. The redirect returns immediately without waiting for the event to be processed. A separate analytics consumer reads from Kafka, enriches events (geo-lookup from IP, device parsing from user-agent), and writes aggregated data to a data warehouse or time-series database. Users query analytics through a separate API that reads from the warehouse. This decouples the latency-critical redirect from the data-intensive analytics processing.",
    },
  ],
  mcqs: [
    {
      q: "How many unique URLs can a 7-character base62 key represent?",
      options: [
        "~7 million",
        "~280 million",
        "~3.5 trillion",
        "~1 quadrillion",
      ],
      answerIndex: 2,
      explanation:
        "62^7 = 3,521,614,606,208, which is approximately 3.5 trillion. This is more than sufficient for virtually any URL shortening use case.",
    },
    {
      q: "Which HTTP redirect status code should a URL shortener use if click analytics are important?",
      options: [
        "301 Moved Permanently",
        "302 Found",
        "304 Not Modified",
        "307 Temporary Redirect",
      ],
      answerIndex: 1,
      explanation:
        "302 causes the browser to contact the server on every visit, allowing click tracking. 301 tells the browser to cache the redirect and skip the server on future visits, preventing analytics.",
    },
    {
      q: "What is the primary advantage of a Key Generation Service (KGS) over hash-based key generation?",
      options: [
        "KGS produces shorter keys",
        "KGS guarantees uniqueness without collision checking",
        "KGS is faster to compute",
        "KGS works only with SQL databases",
      ],
      answerIndex: 1,
      explanation:
        "KGS pre-generates unique keys, so there is no possibility of collision at the time of URL creation. Hash-based approaches can produce collisions when two different URLs hash to the same key prefix.",
    },
    {
      q: "Why partition the URL database by the first character of the short key?",
      options: [
        "It ensures alphabetical ordering of URLs",
        "Base62 characters distribute roughly evenly, giving balanced partitions",
        "It enables faster hash computation",
        "It is required by NoSQL databases",
      ],
      answerIndex: 1,
      explanation:
        "If keys are generated randomly, each base62 character appears with roughly equal probability. Partitioning by the first character gives ~62 partitions with approximately equal data, enabling horizontal scaling.",
    },
  ],
  flashcards: [
    {
      front: "What is base62 encoding?",
      back: "An encoding using 62 characters: a-z (26), A-Z (26), 0-9 (10). Used in URL shorteners because all characters are URL-safe. A 7-character base62 string encodes ~3.5 trillion unique values.",
    },
    {
      front: "What are the key generation strategies for URL shorteners?",
      back: "1. Auto-increment ID + base62 conversion. 2. Pre-generated Key Service (KGS) with unused/used key tables. 3. Hash-based (MD5/SHA256 truncated to 7 chars, collision check). 4. Random generation with collision check. KGS is most commonly recommended.",
    },
    {
      front: "What is the difference between 301 and 302 redirects?",
      back: "301 (Permanent): browser caches the redirect and never contacts the server again. Reduces load but prevents analytics. 302 (Temporary): browser contacts the server every time, enabling click tracking. Most shorteners use 302.",
    },
    {
      front: "How do you handle URL shortener analytics at scale?",
      back: "Async pipeline: on redirect, publish click event to Kafka (shortKey, timestamp, IP, user-agent, referrer). A separate consumer enriches and aggregates events into a data warehouse. Redirect returns immediately, analytics are eventually consistent.",
    },
    {
      front: "How much storage does a URL shortener need for 5 years?",
      back: "At 100M URLs/month: 100M x 12 x 5 = 6B URLs. At ~500 bytes per record (short key + long URL + metadata): 6B x 500B = ~3TB. Easily handled by a sharded database or a distributed key-value store.",
    },
    {
      front: "What is a Key Generation Service (KGS)?",
      back: "A dedicated service that pre-generates random unique short keys. Keys are stored in unused_keys table. KGS servers load batches into memory and hand them out without DB calls. Used keys move to used_keys table. Guarantees uniqueness without collision checking at write time.",
    },
    {
      front: "How do you handle custom aliases in a URL shortener?",
      back: "Check if the alias already exists in the database. If available, store it like any other short key with a custom flag. If taken, return an error. Custom aliases should be validated: allowed characters, length limits, not on a blocked list. They are stored in the same table as generated keys.",
    },
  ],
  glossary: [
    {
      term: "Base62 Encoding",
      definition:
        "An encoding scheme using 62 alphanumeric characters (a-z, A-Z, 0-9) to represent numbers compactly. URL-safe without requiring percent-encoding.",
    },
    {
      term: "Key Generation Service (KGS)",
      definition:
        "A dedicated service that pre-generates unique short keys in advance, storing them for fast allocation when new URLs are created. Eliminates collision concerns.",
    },
    {
      term: "301 Redirect",
      definition:
        "HTTP status indicating a permanent redirect. Browsers cache this and do not contact the original URL again, reducing server load but preventing click tracking.",
    },
    {
      term: "302 Redirect",
      definition:
        "HTTP status indicating a temporary redirect. Browsers contact the server on every request, enabling analytics but increasing server load.",
    },
    {
      term: "Short Key",
      definition:
        "The unique identifier in a shortened URL (the 'abc123' in short.url/abc123). Typically 6-8 characters using base62 encoding.",
    },
    {
      term: "Click Analytics",
      definition:
        "Tracking and aggregating data about redirect events: total clicks, unique visitors, geographic distribution, referrers, devices, and time-series trends.",
    },
    {
      term: "Cache Stampede",
      definition:
        "When a popular cache entry expires and many simultaneous requests hit the database. Mitigated with locking, probabilistic early refresh, or background refresh.",
    },
  ],
};
