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
  followUps: [
    "How does a message reach a user connected to a different gateway node?",
    "How do you order messages when client clocks disagree?",
    "How do you deliver to a user who is offline?",
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
  deepDive: [
    "## Real-Time Message Delivery Pipeline\n\nThe **core challenge** in designing a chat system is achieving *sub-100ms message delivery* at scale while maintaining **strict ordering guarantees**. The pipeline begins when a client sends a message over its **WebSocket connection** to a *connection server*. This server is **stateful** — it holds the TCP socket for that user. The message is first validated (auth token, rate limiting, content policy), then assigned a **monotonically increasing sequence number** from a per-chat counter (typically backed by `Redis INCR` or a dedicated sequencer). The message is persisted to the **write-ahead log** (e.g., Kafka topic partitioned by `chatId`) *before* acknowledgment is sent back to the sender. This ensures **at-least-once delivery** even if the connection server crashes mid-flight. From the WAL, a *message router* consumes events and resolves the recipient's connection server via a **connection registry** (a Redis hash mapping `userId -> serverId`). The message is then forwarded to the target server and pushed down the recipient's WebSocket. If the recipient is **offline**, the message is stored with `delivered: false` and a **push notification** is triggered via APNs/FCM. This entire pipeline — validate, sequence, persist, route, deliver — must complete in under 100ms for the *p99* case, which requires careful **connection pooling**, **batch writes**, and **locality-aware routing**.",
    "## Scaling WebSocket Connections\n\nA single server can hold roughly **500K–1M concurrent WebSocket connections** depending on memory and file descriptor limits. For a system serving *100M+ concurrent users*, you need a fleet of connection servers behind a **Layer 4 load balancer** (not L7, since WebSocket is a long-lived connection). Key challenges include:\n\n- **Connection draining**: when a server needs to be restarted, connections must be *gracefully migrated*. The server sends a `RECONNECT` frame, and clients reconnect to a new server via the load balancer.\n- **Hot-spot mitigation**: celebrity users or viral group chats can overload a single server. Use **consistent hashing** with *virtual nodes* to distribute load, and implement **backpressure** on high-fanout groups.\n- **Cross-server routing**: since user A and user B may be on different servers, a **pub/sub backbone** (Redis Pub/Sub, Kafka, or NATS) is essential. Each connection server subscribes to channels for all users it hosts. When a message arrives for user B, the routing layer publishes to B's channel, and B's connection server picks it up.\n- **Connection state**: maintain a `heartbeat` timestamp per connection. A background **reaper process** scans for stale connections (no heartbeat for 30s) and cleans up the registry. This prevents *ghost connections* from consuming resources.",
    "## End-to-End Encryption and Security\n\nModern chat systems implement **end-to-end encryption (E2EE)** using the *Signal Protocol* (Double Ratchet Algorithm). Each user generates an **identity key pair**, a set of **pre-keys**, and a **signed pre-key**. When user A wants to message user B for the first time, A fetches B's *pre-key bundle* from the server and performs an **X3DH key agreement** to establish a shared secret. Subsequent messages use the **Double Ratchet** — combining a *Diffie-Hellman ratchet* (new DH keys per message exchange) with a *symmetric-key ratchet* (KDF chain). This provides **forward secrecy** (compromising a key doesn't expose past messages) and **break-in recovery** (future messages are secure even if a key is compromised). The server **never sees plaintext** — it stores only *ciphertext blobs*. For **group chats**, the *Sender Keys* protocol is used: the sender encrypts once with a symmetric *sender key*, and each group member has the sender key encrypted to their public key. Key rotation happens when members join or leave. Additional security measures include **message authentication codes** (HMAC) to prevent tampering, **replay protection** via sequence numbers, and **metadata minimization** — the server should know *who* is talking to *whom* as little as possible (sealed sender in Signal).",
  ],
  code: [
    {
      language: "javascript",
      caption: "Express.js WebSocket Chat Server with Redis Pub/Sub",
      source: `const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const Redis = require("ioredis");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Redis pub/sub for cross-server message routing
const redisSub = new Redis();
const redisPub = new Redis();
const redisStore = new Redis();

// In-memory connection registry: userId -> WebSocket
const connections = new Map();

// MongoDB Message schema
const MessageSchema = new mongoose.Schema({
  chatId:     { type: String, required: true, index: true },
  senderId:   { type: String, required: true },
  content:    { type: String, required: true },
  seqNumber:  { type: Number, required: true },
  delivered:  { type: Boolean, default: false },
  readBy:     [{ userId: String, readAt: Date }],
  createdAt:  { type: Date, default: Date.now },
});
MessageSchema.index({ chatId: 1, seqNumber: 1 }, { unique: true });
const Message = mongoose.model("Message", MessageSchema);

// Handle new WebSocket connections
wss.on("connection", async (ws, req) => {
  const userId = authenticateFromRequest(req); // Extract & verify JWT
  if (!userId) return ws.close(4001, "Unauthorized");

  connections.set(userId, ws);
  // Register in Redis so other servers can route to us
  await redisStore.hset("user:connections", userId, process.env.SERVER_ID);
  // Subscribe to this user's channel for cross-server messages
  redisSub.subscribe(\`user:\${userId}\`);

  // Mark user online with heartbeat
  await redisStore.hset("user:presence", userId, JSON.stringify({
    status: "online", lastSeen: Date.now(), serverId: process.env.SERVER_ID,
  }));

  ws.on("message", async (raw) => {
    const data = JSON.parse(raw);
    switch (data.type) {
      case "chat_message":
        await handleChatMessage(userId, data);
        break;
      case "typing":
        await handleTypingIndicator(userId, data);
        break;
      case "heartbeat":
        await redisStore.hset("user:presence", userId,
          JSON.stringify({ status: "online", lastSeen: Date.now() }));
        break;
    }
  });

  ws.on("close", async () => {
    connections.delete(userId);
    await redisStore.hdel("user:connections", userId);
    await redisStore.hset("user:presence", userId,
      JSON.stringify({ status: "offline", lastSeen: Date.now() }));
  });
});

async function handleChatMessage(senderId, data) {
  const { chatId, content } = data;
  // Atomically increment sequence number for this chat
  const seqNumber = await redisStore.incr(\`chat:seq:\${chatId}\`);

  // Persist message to MongoDB
  const message = await Message.create({
    chatId, senderId, content, seqNumber, delivered: false,
  });

  // Resolve recipient(s) and deliver
  const recipients = await getChatMembers(chatId, senderId);
  for (const recipientId of recipients) {
    const recipientWs = connections.get(recipientId);
    if (recipientWs && recipientWs.readyState === 1) {
      // Same server — deliver directly
      recipientWs.send(JSON.stringify({
        type: "new_message", chatId, message: message.toObject(),
      }));
      await Message.updateOne({ _id: message._id }, { delivered: true });
    } else {
      // Different server — publish via Redis
      redisPub.publish(\`user:\${recipientId}\`, JSON.stringify({
        type: "new_message", chatId, message: message.toObject(),
      }));
    }
  }
}

// Listen for cross-server messages
redisSub.on("message", (channel, payload) => {
  const userId = channel.replace("user:", "");
  const ws = connections.get(userId);
  if (ws && ws.readyState === 1) {
    ws.send(payload);
  }
});

server.listen(3000, () => console.log("Chat server running on :3000"));`,
    },
    {
      language: "typescript",
      caption: "React Chat Component with WebSocket Hook",
      source: `import React, { useEffect, useRef, useState, useCallback } from "react";

interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: string;
  content: string;
  seqNumber: number;
  createdAt: string;
}

// Custom hook for WebSocket connection management
function useChatSocket(chatId: string, token: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const ws = new WebSocket(\`wss://chat.example.com?token=\${token}\`);

    ws.onopen = () => {
      setIsConnected(true);
      // Send sync request with last known sequence number
      const lastSeq = getLastSeqNumber(chatId);
      ws.send(JSON.stringify({ type: "sync", chatId, lastSeq }));
      // Start heartbeat interval
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "heartbeat" }));
        }
      }, 5000);
      ws.addEventListener("close", () => clearInterval(heartbeat));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "new_message":
          setMessages((prev) => {
            const updated = [...prev, data.message];
            // Sort by sequence number to maintain order
            updated.sort((a, b) => a.seqNumber - b.seqNumber);
            return updated;
          });
          break;
        case "sync_response":
          setMessages((prev) => {
            const merged = [...prev, ...data.messages];
            const unique = merged.filter(
              (m, i, arr) => arr.findIndex((x) => x._id === m._id) === i
            );
            unique.sort((a, b) => a.seqNumber - b.seqNumber);
            return unique;
          });
          break;
        case "typing":
          setIsTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Exponential backoff reconnect
      reconnectRef.current = setTimeout(connect, 2000);
    };

    wsRef.current = ws;
  }, [chatId, token]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(
      JSON.stringify({ type: "chat_message", chatId, content })
    );
  }, [chatId]);

  const sendTyping = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "typing", chatId }));
  }, [chatId]);

  return { messages, isConnected, isTyping, sendMessage, sendTyping };
}

// Chat UI Component
export default function ChatRoom({ chatId, userId, token }: {
  chatId: string; userId: string; token: string;
}) {
  const { messages, isConnected, isTyping, sendMessage, sendTyping } =
    useChatSocket(chatId, token);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className={\`status-dot \${isConnected ? "online" : "offline"}\`} />
        {isConnected ? "Connected" : "Reconnecting..."}
      </div>
      <div className="messages-panel">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={\`message \${msg.senderId === userId ? "sent" : "received"}\`}
          >
            <p>{msg.content}</p>
            <span className="timestamp">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); sendTyping(); }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>Send</button>
      </div>
    </div>
  );
}

function getLastSeqNumber(chatId: string): number {
  const stored = localStorage.getItem(\`chat:seq:\${chatId}\`);
  return stored ? parseInt(stored, 10) : 0;
}`,
    },
    {
      language: "cpp",
      caption: "Lock-Free Message Queue (C++ with atomics)",
      source: `#include <atomic>
#include <memory>
#include <optional>
#include <string>
#include <chrono>

/**
 * Lock-free MPSC (Multi-Producer, Single-Consumer) message queue
 * for high-throughput chat message routing.
 *
 * Uses a linked list with atomic compare-and-swap for producers
 * and a single consumer that drains the queue in batch.
 */

struct ChatMessage {
    std::string chatId;
    std::string senderId;
    std::string content;
    uint64_t    sequenceNumber;
    std::chrono::steady_clock::time_point timestamp;
};

template <typename T>
class LockFreeQueue {
private:
    struct Node {
        T data;
        Node* next;
        explicit Node(T value) : data(std::move(value)), next(nullptr) {}
    };

    // Sentinel node keeps the queue structure simple
    std::atomic<Node*> head_;  // producers push here (LIFO stack)
    std::atomic<Node*> tail_;  // consumer reads from here

    // Padding to avoid false sharing between producer and consumer
    alignas(64) std::atomic<size_t> size_{0};

public:
    LockFreeQueue() {
        auto* sentinel = new Node(T{});
        head_.store(sentinel, std::memory_order_relaxed);
        tail_.store(sentinel, std::memory_order_relaxed);
    }

    ~LockFreeQueue() {
        // Drain remaining nodes
        while (dequeue().has_value()) {}
        delete tail_.load(std::memory_order_relaxed);
    }

    // Thread-safe: multiple producers can call concurrently
    void enqueue(T value) {
        auto* newNode = new Node(std::move(value));

        // CAS loop to atomically link the new node
        Node* oldHead = head_.load(std::memory_order_relaxed);
        do {
            newNode->next = nullptr;
        } while (!head_.compare_exchange_weak(
            oldHead, newNode,
            std::memory_order_release,
            std::memory_order_relaxed));

        // Link previous head to point to new node
        oldHead->next = newNode;
        size_.fetch_add(1, std::memory_order_relaxed);
    }

    // Single consumer only: not safe for multiple concurrent consumers
    std::optional<T> dequeue() {
        Node* oldTail = tail_.load(std::memory_order_relaxed);
        Node* next = oldTail->next;

        if (next == nullptr) {
            return std::nullopt;  // Queue is empty
        }

        T value = std::move(next->data);
        tail_.store(next, std::memory_order_release);
        delete oldTail;
        size_.fetch_sub(1, std::memory_order_relaxed);
        return value;
    }

    size_t size() const {
        return size_.load(std::memory_order_relaxed);
    }

    bool empty() const { return size() == 0; }
};

// Usage: message routing between connection servers
class MessageRouter {
    LockFreeQueue<ChatMessage> inboundQueue_;
    std::atomic<bool> running_{true};

public:
    // Called by connection server threads (producers)
    void routeMessage(ChatMessage msg) {
        inboundQueue_.enqueue(std::move(msg));
    }

    // Single router thread (consumer) — drains and dispatches
    void processLoop() {
        while (running_.load(std::memory_order_relaxed)) {
            auto msg = inboundQueue_.dequeue();
            if (msg.has_value()) {
                dispatchToTargetServer(std::move(msg.value()));
            } else {
                // Yield CPU when queue is empty — avoids busy-spin
                std::this_thread::yield();
            }
        }
    }

    void shutdown() { running_.store(false, std::memory_order_relaxed); }

private:
    void dispatchToTargetServer(ChatMessage msg) {
        // Look up recipient's connection server from registry
        // and forward the message via TCP/IPC
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Chat System Architecture",
      kind: "architecture",
      caption: "High-level architecture showing clients, connection servers, message routing, storage, and supporting services.",
      mermaid: `graph TB
    subgraph Clients
        C1[Mobile App]
        C2[Web Browser]
        C3[Desktop App]
    end

    subgraph Load_Balancer["Load Balancer (L4)"]
        LB[TCP Load Balancer]
    end

    subgraph Connection_Servers["Connection Servers (Stateful)"]
        CS1[Chat Server 1<br/>WebSocket Handler]
        CS2[Chat Server 2<br/>WebSocket Handler]
        CS3[Chat Server N<br/>WebSocket Handler]
    end

    subgraph Message_Layer["Message Routing Layer"]
        MQ[Kafka / Redis Pub-Sub<br/>Message Broker]
        SEQ[Sequence Service<br/>Redis INCR per chatId]
    end

    subgraph Storage["Storage Layer"]
        MONGO[(MongoDB / Cassandra<br/>Message Store)]
        REDIS[(Redis Cache<br/>Recent Messages +<br/>Connection Registry)]
        S3[(Object Storage<br/>Media Files)]
    end

    subgraph Services["Supporting Services"]
        PRESENCE[Presence Service<br/>Heartbeat Tracker]
        PUSH[Push Notification<br/>APNs / FCM]
        SEARCH[Search Service<br/>Elasticsearch]
        AUTH[Auth Service<br/>JWT Validation]
    end

    C1 -->|WebSocket| LB
    C2 -->|WebSocket| LB
    C3 -->|WebSocket| LB
    LB --> CS1
    LB --> CS2
    LB --> CS3

    CS1 --> SEQ
    CS2 --> SEQ
    CS3 --> SEQ

    CS1 <--> MQ
    CS2 <--> MQ
    CS3 <--> MQ

    CS1 --> MONGO
    CS2 --> MONGO
    CS3 --> MONGO

    CS1 --> REDIS
    CS2 --> REDIS
    CS3 --> REDIS

    MQ --> PUSH
    CS1 --> S3
    MONGO --> SEARCH

    CS1 --> PRESENCE
    CS2 --> PRESENCE
    CS3 --> PRESENCE

    CS1 --> AUTH`,
    },
    {
      title: "Message Delivery Sequence",
      kind: "sequence",
      caption: "End-to-end message flow from sender to receiver, including sequencing, persistence, and offline push notification fallback.",
      mermaid: `sequenceDiagram
    participant A as User A
    participant CS1 as Chat Server 1
    participant DB as MongoDB
    participant REG as Connection Registry
    participant CS2 as Chat Server 2
    participant B as User B
    participant PUSH as Push Service
    A->>CS1: Send message via WebSocket
    CS1->>CS1: Assign sequence number
    CS1->>DB: Persist message
    CS1-->>A: ACK single tick
    CS1->>REG: Lookup User B server
    REG-->>CS1: User B on CS2
    CS1->>CS2: Route message via broker
    CS2->>B: Deliver via WebSocket
    B-->>CS2: Received ACK
    CS2->>DB: Mark delivered`,
    },
    {
      title: "Presence System State Machine",
      kind: "state",
      caption: "User presence states and transitions driven by WebSocket connect, disconnect, heartbeat timeout, and explicit status changes.",
      mermaid: `stateDiagram-v2
    [*] --> Offline
    Offline --> Online : WebSocket connect
    Online --> Away : No activity for 5 min
    Away --> Online : Activity detected
    Online --> Offline : WebSocket disconnect
    Away --> Offline : WebSocket disconnect
    Online --> DoNotDisturb : User sets DND
    DoNotDisturb --> Online : User clears DND`,
    },
    {
      title: "Chat Storage Key Entities",
      kind: "network",
      caption: "Key entities and relationships in the chat system storage model: users, conversations, participants, messages, and attachments.",
      mermaid: `graph LR
    U["Users"]
    C["Conversations"]
    P["Participants"]
    M["Messages"]
    A["Attachments"]
    U --> P
    C --> P
    C --> M
    M --> A
    U --> M`,
    },
  ],
  animations: [
    {
      title: "Delivering a message across gateway nodes",
      steps: [
        {
          label: "A connects",
          detail: "WebSocket to gateway node 1. The registry records `A → node1` in Redis.",
        },
        {
          label: "B connects",
          detail: "To node 2. Registry records `B → node2`.",
        },
        {
          label: "A sends to B",
          detail: "Node 1 receives the message and persists it to the conversation store.",
        },
        {
          label: "Look up B",
          detail: "Registry says node 2.",
        },
        {
          label: "Forward",
          detail: "Node 1 publishes to node 2's channel; node 2 pushes down B's socket.",
        },
        {
          label: "B is offline",
          detail: "No entry in the registry — queue for later delivery and send a push notification instead.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "WhatsApp",
      "Slack",
      "Discord",
    ],
    rows: [
      [
        "**Primary Protocol**",
        "*XMPP-based* custom protocol (Noise Protocol for E2EE)",
        "*WebSocket* with HTTP API fallback",
        "*WebSocket* with ETF (Erlang Term Format) encoding",
      ],
      [
        "**Message Storage**",
        "Messages stored **on-device only** (E2EE); server holds ciphertext temporarily until delivered",
        "Messages stored **server-side** in a searchable database; full history available to workspace",
        "Messages stored **server-side** with full history; uses *Cassandra* for message storage at scale",
      ],
      [
        "**Encryption**",
        "**End-to-end encryption** by default using the *Signal Protocol* (Double Ratchet + X3DH)",
        "**Encryption in transit** (TLS) and at rest; *no E2EE* — server can read messages for search/compliance",
        "**Encryption in transit** (TLS); *no E2EE* — server decrypts for moderation, search, and content delivery",
      ],
      [
        "**Max Group Size**",
        "1,024 members per group; uses *Sender Keys* protocol for group E2EE",
        "No hard limit on channels; designed for **large organizations** with thousands of members per channel",
        "Server limit of **500K members**; channels within servers can have millions of concurrent viewers",
      ],
      [
        "**Presence System**",
        "Simple *last seen* timestamp; no real-time presence for groups; **privacy-focused** approach",
        "Rich presence: *online, away, DND, offline* with custom status text; updates via WebSocket heartbeat",
        "Rich presence with **activity detection** (currently playing, streaming, listening); custom status support",
      ],
      [
        "**Media Handling**",
        "Media **encrypted on client**, uploaded to servers, URL sent in message; auto-deleted after delivery",
        "Files uploaded to **S3-compatible storage**; thumbnails generated server-side; searchable and persistent",
        "CDN-backed media delivery; images proxied through `media.discordapp.net`; **lazy loading** with progressive JPEG",
      ],
      [
        "**Scalability Architecture**",
        "**Erlang/FreeBSD** stack; single server handles ~2M connections; *stateful connection servers* with XMPP routing",
        "**PHP (Hack) + Java** microservices; *MySQL* primary DB with *Vitess* sharding; message search via *Elasticsearch*",
        "**Elixir/Erlang** for real-time gateway; *Rust* for performance-critical paths; *Cassandra + ScyllaDB* for storage",
      ],
      [
        "**Offline Delivery**",
        "Server **queues messages** for up to 30 days; delivered on reconnect in sequence order",
        "No offline queue needed — all messages are **server-persisted**; client syncs via API on reconnect",
        "No offline queue — messages **always server-stored**; client fetches missed messages via REST API with `?after=` cursor",
      ],
    ],
  },
  exercises: [
    "**Design a read-receipt system**: Implement a `read watermark` mechanism where each user's read position per chat is tracked. Define the MongoDB schema, the WebSocket event flow, and how the sender sees *single tick* (sent), *double tick* (delivered), and *blue tick* (read). Consider the multi-device case where user B has 3 devices — when should the read receipt fire?",
    "**Build a typing indicator with debouncing**: Write a client-side `useTypingIndicator` React hook that sends `typing_start` on the first keystroke, suppresses further events for 3 seconds, and sends `typing_stop` after 3 seconds of inactivity. On the server side, implement the fan-out logic that forwards typing events *only* to users who have the chat window open. Measure the bandwidth savings compared to naive per-keystroke broadcasting.",
    "**Implement message search with Elasticsearch**: Design the indexing pipeline where new messages are published to a Kafka topic, consumed by an indexer service, and written to an Elasticsearch index partitioned by `chatId`. Implement a search API endpoint that accepts a query string and returns matching messages with **highlighted snippets**, respecting access control (users can only search chats they belong to). Handle the consistency lag between write and index availability.",
    "**Design a group chat fan-out strategy**: For a group with *10,000 members*, compare **fan-out on write** (push message to each member's inbox) vs. **fan-out on read** (members pull from the group timeline). Calculate the storage and write amplification for each approach. Implement a hybrid: fan-out on write for active users (online in the last 5 minutes) and fan-out on read for inactive users. Use Redis sorted sets to track active group members.",
    "**Build a connection migration system**: When a chat server needs to restart for deployment, implement a *graceful drain* protocol. The server sends a `RECONNECT` control frame to all connected clients with a `target_server` hint. Clients disconnect and reconnect to the suggested server. Implement a 30-second drain window, track migration progress, and handle clients that fail to reconnect within the window. Ensure **zero message loss** during the migration.",
  ],
  cheatSheet: [
    "**WebSocket lifecycle**: `HTTP GET /chat (Upgrade: websocket)` -> server responds `101 Switching Protocols` -> persistent full-duplex TCP connection. Close with status codes: `1000` (normal), `1001` (going away), `1008` (policy violation), `1011` (server error).",
    "**Sequence number assignment**: always server-side via `Redis INCR chat:seq:{chatId}`. Never trust client timestamps for ordering. Per-chat counter ensures *total order within a conversation*. Use `MULTI/EXEC` for atomic seq + write if needed.",
    "**Presence detection pattern**: client heartbeat every **5s**, server timeout at **30s**. Store in `Redis HSET user:presence {userId} {status, lastSeen, serverId}`. Immediate offline on WebSocket `close` event. Fan-out presence changes only to users with the contact's chat *currently open*.",
    "**Offline sync protocol**: client stores `lastSeqNumber` per chat in `localStorage`. On reconnect, sends `{type: 'sync', chatId, lastSeq}`. Server responds with `SELECT * FROM messages WHERE chatId = ? AND seqNumber > ? ORDER BY seqNumber ASC`. Batch in pages of 50 for large deltas.",
    "**Message delivery guarantees**: *at-least-once* via WAL (Kafka) before ack. Deduplicate on client using `messageId` or `(chatId, seqNumber)` pair. Idempotent processing on server side — `upsert` with unique index on `(chatId, seqNumber)` prevents duplicates.",
    "**Group chat fan-out rule of thumb**: groups < 100 members use *fan-out on write* (push to each inbox). Groups > 100 use *fan-out on read* (members pull from group timeline). Hybrid: fan-out on write to *online* members, fan-out on read for *offline* members. Track active members in `Redis ZSET` with heartbeat timestamp as score.",
  ],
  revisionNotes: [
    "The **three pillars** of a chat system are: (1) *real-time delivery* via WebSocket with pub/sub routing, (2) *message ordering* via server-assigned per-chat sequence numbers, and (3) *offline reliability* via persistent storage with delta sync on reconnect. Every design decision flows from these three requirements.",
    "**Connection servers are stateful** — each holds live WebSocket connections. This means horizontal scaling requires a *connection registry* (Redis hash: `userId -> serverId`) and a *message routing layer* (Kafka/Redis Pub/Sub) so Server A can deliver a message to a user on Server B. Consistent hashing with virtual nodes distributes users across servers.",
    "**Storage layer trade-offs**: use a *write-optimized store* (Cassandra, HBase) with partition key = `chatId` and clustering key = `seqNumber` for the message table. Cache the latest N messages per chat in **Redis** for sub-millisecond reads. Index in **Elasticsearch** for full-text search. Archive messages older than the retention period to **cold storage** (S3 + Parquet).",
    "**Presence is an eventually consistent system** — there is no need for strong consistency. A user appearing online for a few extra seconds after disconnecting is acceptable. Use *heartbeat + timeout* (not WebSocket close alone, since connections can drop silently). Debounce presence fan-out to avoid thundering-herd updates when many users connect/disconnect simultaneously.",
    "**End-to-end encryption** fundamentally changes the architecture: the server **cannot read, search, or moderate** message content. All indexing and search must happen *client-side*. Group key management adds complexity — key rotation on member join/leave, *Sender Keys* for efficient group encryption. E2EE trades server-side features for **privacy guarantees**.",
  ],
  resources: [
    {
      label: "System Design Interview — Alex Xu",
      kind: "book",
    },
    {
      label: "WebSocket Protocol — RFC 6455",
      kind: "docs",
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
