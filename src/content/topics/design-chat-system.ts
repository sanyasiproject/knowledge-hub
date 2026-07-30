import type { TopicContent } from "../types";

export const designChatSystem: TopicContent = {
  quickSummary: [
    "A chat system requires real-time, bidirectional communication. WebSockets maintain a persistent TCP connection between client and server, enabling instant message delivery without polling overhead.",
    "Message ordering is guaranteed within a single chat using monotonically increasing sequence numbers assigned by the server. Each chat maintains its own sequence counter to ensure participants see messages in the correct order.",
    "Presence (online/offline/typing) is tracked through heartbeat signals. Clients send periodic heartbeats to the server; if no heartbeat is received within a timeout, the user is marked offline. Presence updates are fanned out to relevant contacts.",
    "Offline delivery stores messages for disconnected users in a persistent queue. When the user reconnects, undelivered messages are fetched and delivered in order, ensuring no messages are lost.",
  ],
  detailed: [
    "## Communication Protocols\n\n**WebSocket** is the primary protocol for chat. After an HTTP handshake upgrade, a full-duplex TCP connection is maintained. Both client and server can send messages at any time without request-response overhead. For the initial connection, the client uses HTTP to authenticate, then upgrades to WebSocket. **Server-Sent Events (SSE)** is an alternative for simpler use cases (notifications) but is unidirectional (server to client only). **Long polling** is a fallback for environments where WebSockets are blocked: the client sends a request, the server holds it open until new data is available or a timeout occurs. WebSocket servers maintain in-memory mappings of userId -> connection. Connection servers are stateful (each connection lives on one server), so a connection-aware routing layer or a shared registry (Redis pub/sub) is needed to route messages to the right server.",
    "## Message Flow and Ordering\n\nWhen user A sends a message to user B: (1) A's client sends the message over its WebSocket to Chat Server 1. (2) Chat Server 1 assigns a sequence number (monotonically increasing per chat), stores the message in the database, and publishes to a message queue. (3) If B is online and connected to Chat Server 2, the message is routed there (via pub/sub or a message queue) and pushed to B's WebSocket. (4) If B is offline, the message is stored and delivered on reconnect. **Ordering**: each chat (conversation) has its own sequence counter. The server assigns sequence numbers, not the client, because client clocks are unreliable. Messages within a chat are ordered by sequence number. For group chats, all messages go through a single sequencer per group to maintain total order. Clients display messages sorted by sequence number.",
    "## Presence and Typing Indicators\n\n**Online/offline presence**: when a user connects via WebSocket, they are marked online in a presence service (Redis hash: userId -> {status, lastSeen, serverId}). The client sends heartbeats every 5-10 seconds. If no heartbeat is received for 30 seconds, the user is marked offline. On disconnect (WebSocket close), immediate offline marking. **Typing indicators**: when a user starts typing, the client sends a 'typing' event to the server. The server forwards it to other participants in the chat. Typing events are ephemeral (not stored). To avoid flooding, the client debounces: send 'typing started' on first keystroke, then suppress for 3 seconds, send 'typing stopped' after 3 seconds of inactivity. **Fan-out**: presence changes and typing events are sent only to users who are (1) online and (2) currently viewing a chat with that user, to minimize unnecessary traffic.",
    "## Offline Delivery and Sync\n\nWhen a user is offline, messages are stored in the database with a 'delivered' flag set to false. On reconnect, the client sends its last known sequence number for each chat. The server returns all messages with sequence numbers greater than the last known. This is the **sync protocol**: the client maintains a local sequence cursor, and the server sends the delta. For push notifications: when a message arrives for an offline user, the chat server triggers a push notification via APNs/FCM. The notification contains a preview but not the full message (for security and size reasons). When the user opens the app, the full sync happens. **Read receipts**: when a user reads messages up to sequence N, the client sends a 'read' event. The server updates the read watermark and notifies the sender. This enables double-check (delivered) and blue-check (read) indicators.",
    "## Group Chat and Scalability\n\n**Group messages** follow the same pattern but with fan-out to all group members. For a group of N members, one message generates N-1 deliveries. Small groups (< 100) can use fan-out on write to each member's message queue. Large groups (> 100) may need a group message service where members pull messages. **Scalability**: chat servers are stateful (each holds WebSocket connections), so horizontal scaling requires a connection registry. Use consistent hashing to assign users to chat servers. A message routing layer (Kafka, Redis Pub/Sub) ensures messages reach the right server. **Storage**: messages are stored in a database optimized for sequential writes and range reads by (chatId, sequenceNumber). Cassandra and HBase are common choices for their write throughput and range scan performance. **Media messages**: images and videos are uploaded to object storage (S3), and the message contains only the media URL.",
  ],
  interviewQA: [
    {
      q: "Why use WebSockets instead of HTTP polling for a chat system?",
      a: "HTTP polling wastes resources: clients repeatedly ask 'any new messages?' even when there are none. Long polling improves this but still has overhead from re-establishing connections. WebSockets maintain a persistent, full-duplex connection: the server pushes messages instantly when they arrive, with no polling overhead. The connection setup cost is paid once. For a system with millions of concurrent users, the difference in server resource consumption (connections, CPU for handling polls) is massive. WebSockets also have lower latency: a message is delivered in one hop (server push) vs. waiting for the next poll interval.",
    },
    {
      q: "How do you ensure message ordering in a distributed chat system?",
      a: "Assign a monotonically increasing sequence number per chat (conversation). A single sequencer per chat ensures total ordering. For 1:1 chats, either participant's server can sequence (use a centralized counter in Redis with INCR). For group chats, route all messages through a single partition in Kafka keyed by chatId, or use a dedicated sequencer service. The sequence number is assigned at the server, not the client, because client clocks drift. Clients render messages sorted by sequence number. If messages arrive out of order (possible in distributed systems), the client buffers and sorts before displaying.",
    },
    {
      q: "How do you handle the scenario where a user has multiple devices?",
      a: "Each device maintains its own WebSocket connection, identified by (userId, deviceId). When a message arrives for a user, it is delivered to all active connections for that user. Each device maintains its own sync cursor (last sequence number received per chat). When a device comes online, it syncs from its own cursor, not a global one. Read receipts are per-user (not per-device): when any device reads a message, the read watermark advances for the user. Notifications are sent only to devices that have not received the message via WebSocket (using a small delay to check if the WebSocket delivery succeeded).",
    },
    {
      q: "How would you design the storage layer for chat messages?",
      a: "Chat messages are a write-heavy, append-only workload with reads primarily by (chatId, time range). A wide-column store like Cassandra is ideal: partition key is chatId, clustering key is sequenceNumber. This gives fast sequential writes and efficient range scans for loading chat history. For small deployments, PostgreSQL with a (chatId, sequenceNumber) index works fine. Index recent messages in Redis for instant access to the latest N messages per chat. Archive old messages to cold storage after a retention period. For search across messages, use Elasticsearch with the message text indexed by chatId.",
    },
  ],
  mcqs: [
    {
      q: "After the initial HTTP handshake, a WebSocket connection provides:",
      options: [
        "Unidirectional server-to-client communication",
        "Request-response communication only",
        "Full-duplex bidirectional communication over a persistent TCP connection",
        "Connectionless UDP-based messaging",
      ],
      answerIndex: 2,
      explanation:
        "WebSocket upgrades an HTTP connection to a persistent, full-duplex TCP connection. Both client and server can send messages independently at any time without the overhead of new HTTP requests.",
    },
    {
      q: "Message ordering in a chat is ensured by:",
      options: [
        "Client-side timestamps",
        "Server-assigned monotonically increasing sequence numbers per chat",
        "Database auto-increment IDs across all chats",
        "Message hash values",
      ],
      answerIndex: 1,
      explanation:
        "The server assigns sequence numbers per chat because client clocks are unreliable. A per-chat counter ensures messages within a single conversation are totally ordered, regardless of which server processed them.",
    },
    {
      q: "A user is marked offline when:",
      options: [
        "They close the app immediately",
        "No heartbeat is received within the timeout period",
        "They stop sending messages for 5 minutes",
        "The server restarts",
      ],
      answerIndex: 1,
      explanation:
        "Presence is tracked via periodic heartbeats. If the server does not receive a heartbeat within the configured timeout (e.g., 30 seconds), the user is marked offline. WebSocket close events provide immediate detection, but heartbeats catch cases where the connection drops silently.",
    },
    {
      q: "When a user reconnects after being offline, the sync protocol:",
      options: [
        "Resends all messages in the chat history",
        "Sends only messages with sequence numbers greater than the client's last known sequence",
        "Sends a summary of missed messages",
        "Requires the user to manually refresh",
      ],
      answerIndex: 1,
      explanation:
        "The client tracks the last sequence number it received per chat. On reconnect, it sends this cursor to the server, which returns the delta (all messages with higher sequence numbers). This is efficient and ensures no messages are missed.",
    },
  ],
  flashcards: [
    {
      front: "How does a WebSocket connection get established?",
      back: "It starts as a regular HTTP request with an Upgrade: websocket header. The server responds with 101 Switching Protocols. After this handshake, the connection becomes a persistent, full-duplex TCP channel for bidirectional real-time communication.",
    },
    {
      front: "How are messages ordered in a chat system?",
      back: "Each chat has a monotonically increasing sequence counter on the server. When a message arrives, it is assigned the next sequence number. Clients display messages sorted by sequence number. Server assigns the number (not the client) because client clocks are unreliable.",
    },
    {
      front: "How does the presence system work?",
      back: "Client sends heartbeats every 5-10 seconds. Server stores status in Redis (userId -> {online, lastSeen, serverId}). If no heartbeat for 30 seconds, user is marked offline. WebSocket close events provide immediate detection. Presence changes are fanned out to relevant contacts.",
    },
    {
      front: "How does offline message delivery work?",
      back: "Messages for offline users are stored in the database with delivered=false. On reconnect, the client sends its last known sequence number per chat. The server returns all messages with higher sequence numbers. Push notifications alert the user of new messages while offline.",
    },
    {
      front: "How are typing indicators implemented?",
      back: "Client sends 'typing started' on first keystroke, debounced for 3 seconds. 'Typing stopped' is sent after 3 seconds of inactivity. These events are forwarded to other chat participants via WebSocket. They are ephemeral (not persisted). Only sent to users currently viewing the chat.",
    },
    {
      front: "What database is commonly used for chat message storage?",
      back: "Cassandra or HBase: partition key is chatId, clustering key is sequenceNumber. Optimized for sequential writes and range reads. Redis caches recent messages for fast access. Elasticsearch indexes messages for search. Old messages are archived to cold storage.",
    },
    {
      front: "How do you route messages between chat servers?",
      back: "Chat servers are stateful (hold WebSocket connections). A connection registry (Redis) maps userId to serverId. When server A receives a message for user B on server C, it routes via a pub/sub layer (Redis Pub/Sub or Kafka). Server C pushes to B's WebSocket.",
    },
  ],
  glossary: [
    {
      term: "WebSocket",
      definition:
        "A protocol providing full-duplex communication over a single, persistent TCP connection. Initiated via an HTTP upgrade handshake. Used for real-time applications like chat.",
    },
    {
      term: "Heartbeat",
      definition:
        "A periodic signal sent by the client to the server (or vice versa) to indicate the connection is still alive. Used for presence detection and connection health monitoring.",
    },
    {
      term: "Sequence Number",
      definition:
        "A monotonically increasing integer assigned to each message within a chat to ensure total ordering. Assigned by the server, not the client.",
    },
    {
      term: "Presence",
      definition:
        "The online/offline/away status of a user, typically tracked via heartbeats and WebSocket connection events. Stored in a fast lookup store like Redis.",
    },
    {
      term: "Read Receipt",
      definition:
        "A signal indicating that a recipient has read messages up to a certain point (sequence number). Enables 'seen' or 'read' indicators in the chat UI.",
    },
    {
      term: "Fan-Out (Chat)",
      definition:
        "Delivering a single group message to all group members. For small groups, the server pushes to each member's connection. For large groups, members may pull messages.",
    },
    {
      term: "Sync Protocol",
      definition:
        "The mechanism by which a reconnecting client catches up on missed messages by sending its last known sequence number and receiving the delta from the server.",
    },
  ],
};
