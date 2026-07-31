import type { TopicContent } from "../types";

export const grpc: TopicContent = {
  quickSummary: [
    "gRPC is a high-performance RPC framework built on HTTP/2 and Protocol Buffers (protobuf), enabling strongly-typed service definitions with code generation for 10+ languages.",
    "It supports four communication patterns: unary (request-response), server streaming (server sends multiple responses), client streaming (client sends multiple requests), and bidirectional streaming (both sides stream simultaneously).",
    "Key features include multiplexed connections over HTTP/2, binary serialization (smaller and faster than JSON), deadlines/timeouts, interceptors (middleware), built-in load balancing, and automatic code generation from .proto files.",
  ],
  detailed: [
    "Protocol Buffers (protobuf) is gRPC's default serialization format. A .proto file defines messages (data structures) and services (RPC methods). The protoc compiler generates client stubs and server interfaces in the target language. Protobuf uses field numbers (not names) for wire encoding, enabling backward-compatible schema evolution. Fields can be added without breaking existing clients as long as field numbers are not reused.",
    "HTTP/2 is the transport layer, providing: multiplexing (multiple RPC calls over a single TCP connection), header compression (HPACK), flow control, and binary framing. Unlike HTTP/1.1 where each request needs its own connection (or head-of-line blocking with pipelining), HTTP/2 allows concurrent streams on one connection. This dramatically reduces connection overhead for microservice-to-microservice communication.",
    "Unary RPC is the simplest pattern: one request, one response — like a function call. Server streaming sends one request and receives a stream of responses (e.g., subscribing to stock price updates). Client streaming sends a stream of requests and receives one response (e.g., uploading chunks of a file). Bidirectional streaming allows both sides to send messages independently over the same connection (e.g., chat, collaborative editing).",
    "Deadlines and timeouts propagate across service boundaries. When a client sets a deadline (absolute time) or timeout (relative duration), it is carried in the gRPC metadata. Each downstream service knows how much time remains and can short-circuit if the deadline has passed. This prevents cascading waits in deep call chains — if the original client's deadline expires, all downstream work is abandoned.",
    "Interceptors are gRPC's middleware mechanism. Unary interceptors wrap individual RPC calls; stream interceptors wrap streaming calls. Common uses: logging, metrics collection, authentication (extracting tokens from metadata), retry logic, rate limiting, and distributed tracing (propagating trace context). Interceptors are composable — you chain them in order, and each can modify the request/response or short-circuit the call.",
    "gRPC supports client-side load balancing: the client resolves a service name to multiple backend addresses (via DNS, Consul, etcd, or a custom resolver) and distributes calls across them using policies like round-robin, pick-first, or weighted. This avoids the latency of a proxy-based load balancer (L7 proxy). For server-side load balancing, an L7-aware proxy (Envoy, Linkerd) is needed because HTTP/2 multiplexing means a standard L4 load balancer sends all streams to the same backend.",
  ],
  deepDive: [
    "Protobuf wire format uses varints for integers (smaller values use fewer bytes), length-delimited encoding for strings and bytes, and field tags (field_number << 3 | wire_type) to identify fields. This makes protobuf 3-10x smaller and 20-100x faster to serialize/deserialize than JSON. However, the binary format is not human-readable, making debugging harder. Tools like grpcurl and gRPC reflection help by enabling ad-hoc requests and schema discovery.",
    "gRPC reflection is a server-side service that exposes the server's protobuf schema at runtime. Clients like grpcurl can query the reflection service to discover available services and methods without needing the .proto files. This is the gRPC equivalent of REST's OpenAPI documentation but is queryable at runtime.",
    "Connection management in gRPC: a single gRPC channel maintains one or more HTTP/2 connections. The channel handles reconnection, name resolution, and load balancing. Channels are expensive to create (DNS resolution, TLS handshake, HTTP/2 negotiation) but cheap to use (multiplexed streams). Best practice: create one channel per target service and reuse it for the lifetime of the application. Keep-alive pings detect dead connections; idle connections are closed after a configurable timeout.",
    "gRPC-Web is a variant that works in browsers. Browsers do not support HTTP/2 trailers (required by gRPC) or client-initiated bidirectional streaming. gRPC-Web uses HTTP/1.1 or HTTP/2 without trailers, encoding the trailer in the response body. An Envoy proxy or a gRPC-Web proxy translates between gRPC-Web and native gRPC. Only unary and server streaming are supported; client and bidirectional streaming are not available in browsers.",
  ],
  code: [
    {
      language: "protobuf",
      caption: "Protobuf service definition with all four RPC patterns",
      source: `syntax = "proto3";

package order;

option go_package = "github.com/example/order/proto";

// Messages
message Order {
  string id = 1;
  string customer_id = 2;
  repeated OrderItem items = 3;
  OrderStatus status = 4;
  double total_amount = 5;
}

message OrderItem {
  string product_id = 1;
  string name = 2;
  int32 quantity = 3;
  double price = 4;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_SHIPPED = 3;
  ORDER_STATUS_DELIVERED = 4;
  ORDER_STATUS_CANCELLED = 5;
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
}

message CreateOrderResponse {
  Order order = 1;
}

message GetOrderRequest {
  string id = 1;
}

message OrderUpdate {
  string order_id = 1;
  OrderStatus new_status = 2;
  string message = 3;
}

message UploadChunk {
  string order_id = 1;
  bytes data = 2;
  int32 chunk_number = 3;
}

message UploadResult {
  string order_id = 1;
  int64 total_bytes = 2;
  bool success = 3;
}

message ChatMessage {
  string sender_id = 1;
  string content = 2;
}

// Service with all four RPC patterns
service OrderService {
  // Unary: one request, one response
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);
  rpc GetOrder(GetOrderRequest) returns (Order);

  // Server streaming: one request, stream of responses
  rpc WatchOrderStatus(GetOrderRequest) returns (stream OrderUpdate);

  // Client streaming: stream of requests, one response
  rpc UploadDocument(stream UploadChunk) returns (UploadResult);

  // Bidirectional streaming: both sides stream
  rpc CustomerChat(stream ChatMessage) returns (stream ChatMessage);
}`,
    },
    {
      language: "typescript",
      caption: "gRPC server implementation in Node.js",
      source: `import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Status } from '@grpc/grpc-js/build/src/constants';

const packageDef = protoLoader.loadSync('./proto/order.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDef) as any;

// Unary RPC handler
async function createOrder(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
) {
  const { customer_id, items } = call.request;

  // Check deadline
  const deadline = call.getDeadline();
  if (deadline !== Infinity && Date.now() > deadline) {
    callback({
      code: Status.DEADLINE_EXCEEDED,
      message: 'Request deadline exceeded before processing',
    });
    return;
  }

  // Read metadata (e.g., auth token)
  const token = call.metadata.get('authorization')[0];
  if (!token) {
    callback({
      code: Status.UNAUTHENTICATED,
      message: 'Missing authorization token',
    });
    return;
  }

  const order = await db.orders.create({ customer_id, items });
  callback(null, { order });
}

// Server streaming RPC handler
function watchOrderStatus(call: grpc.ServerWritableStream<any, any>) {
  const orderId = call.request.id;

  const unsubscribe = eventBus.subscribe(\`order:\${orderId}\`, (update) => {
    call.write({
      order_id: orderId,
      new_status: update.status,
      message: update.message,
    });

    if (update.status === 'ORDER_STATUS_DELIVERED') {
      call.end();
    }
  });

  call.on('cancelled', () => unsubscribe());
}

// Bidirectional streaming RPC handler
function customerChat(call: grpc.ServerDuplexStream<any, any>) {
  call.on('data', (message: any) => {
    console.log(\`Received: \${message.content}\`);
    call.write({
      sender_id: 'support-agent',
      content: \`Received your message: \${message.content}\`,
    });
  });

  call.on('end', () => call.end());
  call.on('error', (err) => console.error('Stream error:', err));
}

// Start server
const server = new grpc.Server({
  'grpc.max_receive_message_length': 10 * 1024 * 1024,
  'grpc.keepalive_time_ms': 60000,
  'grpc.keepalive_timeout_ms': 20000,
});

server.addService(proto.order.OrderService.service, {
  CreateOrder: createOrder,
  GetOrder: getOrder,
  WatchOrderStatus: watchOrderStatus,
  UploadDocument: uploadDocument,
  CustomerChat: customerChat,
});

server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    console.log(\`gRPC server running on port \${port}\`);
  }
);`,
    },
    {
      language: "go",
      caption: "gRPC client in Go with deadline, interceptor, and server streaming",
      source: `package main

import (
    "context"
    "fmt"
    "io"
    "log"
    "time"

    pb "github.com/example/order/proto"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    "google.golang.org/grpc/metadata"
)

// Unary client interceptor for logging and auth
func authInterceptor(
    ctx context.Context,
    method string,
    req, reply interface{},
    cc *grpc.ClientConn,
    invoker grpc.UnaryInvoker,
    opts ...grpc.CallOption,
) error {
    start := time.Now()
    md := metadata.Pairs("authorization", "Bearer my-token")
    ctx = metadata.NewOutgoingContext(ctx, md)

    err := invoker(ctx, method, req, reply, cc, opts...)
    log.Printf("[gRPC] %s | %v | %v", method, time.Since(start), err)
    return err
}

func main() {
    conn, err := grpc.NewClient(
        "order-service:50051",
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithUnaryInterceptor(authInterceptor),
        grpc.WithDefaultServiceConfig(\`{
            "loadBalancingConfig": [{"round_robin": {}}],
            "methodConfig": [{
                "name": [{"service": "order.OrderService"}],
                "retryPolicy": {
                    "maxAttempts": 3,
                    "initialBackoff": "0.1s",
                    "maxBackoff": "1s",
                    "backoffMultiplier": 2,
                    "retryableStatusCodes": ["UNAVAILABLE"]
                }
            }]
        }\`),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    client := pb.NewOrderServiceClient(conn)

    // Unary call with deadline
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    resp, err := client.CreateOrder(ctx, &pb.CreateOrderRequest{
        CustomerId: "cust_123",
        Items: []*pb.OrderItem{
            {ProductId: "prod_1", Name: "Widget", Quantity: 2, Price: 29.99},
        },
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Created order: %s\\n", resp.Order.Id)

    // Server streaming - watch order status
    stream, err := client.WatchOrderStatus(ctx, &pb.GetOrderRequest{
        Id: resp.Order.Id,
    })
    if err != nil {
        log.Fatal(err)
    }

    for {
        update, err := stream.Recv()
        if err == io.EOF {
            break
        }
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("Order %s: %s - %s\\n",
            update.OrderId, update.NewStatus, update.Message)
    }
}`,
    },
  ],
  diagrams: [
    {
      title: "gRPC Communication Patterns",
      kind: "sequence",
      caption: "Sequence diagrams showing all four **gRPC streaming patterns**: *unary*, *server streaming*, *client streaming*, and *bidirectional streaming*.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant S as Server

    rect rgb(200, 220, 255)
    Note over C,S: **Unary RPC** — one request, one response
    C->>S: CreateOrder(request)
    S-->>C: CreateOrderResponse
    end

    rect rgb(200, 255, 220)
    Note over C,S: **Server Streaming** — one request, stream of responses
    C->>S: WatchOrderStatus(orderId)
    S-->>C: StatusUpdate 1
    S-->>C: StatusUpdate 2
    S-->>C: StatusUpdate 3 (final)
    end

    rect rgb(255, 220, 200)
    Note over C,S: **Client Streaming** — stream of requests, one response
    C->>S: UploadChunk 1
    C->>S: UploadChunk 2
    C->>S: UploadChunk 3 (end)
    S-->>C: UploadResult
    end

    rect rgb(255, 255, 200)
    Note over C,S: **Bidirectional Streaming** — both sides stream
    C->>S: ChatMessage A
    S-->>C: ChatMessage B
    C->>S: ChatMessage C
    S-->>C: ChatMessage D
    end`
    },
    {
      title: "gRPC Deadline Propagation Across Services",
      kind: "sequence",
      caption: "How a **deadline** set by the original client *propagates* through a chain of microservices via gRPC metadata, with each service calculating remaining time.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant A as Service A
    participant B as Service B
    participant DB as Database

    Note over C: Sets deadline: 5s from now
    C->>A: GetOrder(id)<br/>deadline = T+5s
    Note over A: Time elapsed: 1s<br/>Remaining: 4s
    A->>B: GetInventory(productId)<br/>deadline = T+5s (propagated)
    Note over B: Time elapsed: 2s<br/>Remaining: 2s
    B->>DB: SELECT stock<br/>deadline = T+5s
    Note over DB: Time elapsed: 1s
    DB-->>B: stock = 42
    B-->>A: InventoryResponse
    A-->>C: OrderResponse

    Note over C,DB: If total > 5s → DEADLINE_EXCEEDED<br/>All downstream work cancelled`
    },
    {
      title: "gRPC Load Balancing: L4 vs L7 vs Client-Side",
      kind: "architecture",
      caption: "Comparison of **L4 load balancing** (fails with HTTP/2 multiplexing), **L7 proxy** (Envoy), and *client-side load balancing* approaches for gRPC traffic.",
      mermaid: `graph TD
    subgraph L4Problem ["**L4 Load Balancer** *(problematic)*"]
        CL4["Client"] -->|"single HTTP/2<br/>connection"| LB4["**TCP LB**"]
        LB4 -->|"ALL streams<br/>go to one backend"| S4A["Server A ⚠️ overloaded"]
        LB4 -.->|"no traffic"| S4B["Server B (idle)"]
    end

    subgraph L7Solution ["**L7 Proxy (Envoy)** *(correct)*"]
        CL7["Client"] -->|"HTTP/2"| LB7["**Envoy**<br/>*understands frames*"]
        LB7 -->|"stream 1, 3"| S7A["Server A"]
        LB7 -->|"stream 2, 4"| S7B["Server B"]
    end

    subgraph ClientSide ["**Client-Side LB** *(built-in)*"]
        CCS["Client<br/>*round_robin policy*"] -->|"RPC 1, 3"| SCA["Server A"]
        CCS -->|"RPC 2, 4"| SCB["Server B"]
    end`
    },
  ],
  exercises: [
    "**Build a gRPC CRUD service:** Define a `.proto` file for a `ProductService` with `Create`, `Get`, `Update`, `Delete`, and `List` RPCs. Implement the server in **Node.js** using `@grpc/grpc-js`. Write a client that exercises each RPC. Add an *interceptor* on the server side that logs the method name, duration, and status code for every call.",
    "**Implement server streaming:** Create a gRPC service where the client sends a `SubscribeToPrice(productId)` request and the server streams back *price updates* every 2 seconds. Implement in Node.js. The client should print each update and gracefully handle `call.on('end')`. Add a **deadline** of 30 seconds so the stream auto-terminates. Verify `DEADLINE_EXCEEDED` is returned after 30s.",
    "**Add deadline propagation:** Build a chain of three gRPC services: `Gateway -> OrderService -> InventoryService`. The Gateway sets a 5-second deadline. Each service logs the *remaining deadline* before making the downstream call. Simulate a slow database query in `InventoryService` (3-second sleep). Verify that when the total chain exceeds the deadline, all services receive `DEADLINE_EXCEEDED` and stop processing.",
    "**Implement retry with service config:** Configure a gRPC client in **Go** with a `service config` JSON that enables automatic retries for `UNAVAILABLE` status codes with *exponential backoff* (`initialBackoff: 0.1s`, `maxBackoff: 1s`, `maxAttempts: 3`). Write a flaky server that fails 50% of requests. Measure the client's observed success rate and verify it increases with retries enabled.",
    "**Compare gRPC vs REST performance:** Build the same API (create and list 1000 items) in both gRPC (protobuf) and REST (JSON over Express). Benchmark both with a load testing tool (`ghz` for gRPC, `autocannon` for REST). Compare **throughput** (RPS), *payload size* (protobuf vs JSON), and *p99 latency*. Document the results and explain why gRPC outperforms for this use case.",
  ],
  comparison: {
    columns: ["Aspect", "gRPC", "REST", "GraphQL"],
    rows: [
      ["Protocol", "HTTP/2 (binary framing)", "HTTP/1.1 or HTTP/2", "HTTP/1.1 or HTTP/2 (typically POST)"],
      ["Serialization", "Protobuf (binary, compact)", "JSON (text, verbose)", "JSON (text)"],
      ["Contract", ".proto file (code generation)", "OpenAPI/Swagger (optional)", "SDL schema (required)"],
      ["Streaming", "All four patterns (unary, server, client, bidi)", "SSE for server push; WebSocket separate", "Subscriptions via WebSocket"],
      ["Browser support", "gRPC-Web (proxy required)", "Native", "Native"],
      ["Performance", "Very high (binary, multiplexed, compressed)", "Good", "Good (but N+1 risk)"],
      ["Tooling", "protoc, grpcurl, reflection", "curl, Postman, Swagger UI", "GraphiQL, Apollo DevTools"],
      ["Best for", "Microservice-to-microservice, low-latency, streaming", "Public APIs, browser-to-server", "Flexible frontend data needs"],
    ],
  },
  interviewQA: [
    {
      q: "Why does gRPC use HTTP/2 and what benefits does it provide?",
      a: "HTTP/2 provides multiplexing (multiple concurrent RPC streams over a single TCP connection, eliminating head-of-line blocking), header compression (HPACK reduces repeated metadata overhead), flow control (per-stream backpressure), and binary framing (more efficient parsing than HTTP/1.1 text). These features are critical for gRPC because microservice architectures involve high-frequency inter-service calls that would create excessive connection overhead with HTTP/1.1.",
      followUps: [
        "What is head-of-line blocking and how does HTTP/2 solve it?",
        "Why can't standard L4 load balancers effectively balance gRPC traffic?",
      ],
    },
    {
      q: "Explain the four gRPC streaming patterns and give a use case for each.",
      a: "Unary: one request, one response — standard request-response, e.g., creating an order. Server streaming: one request, stream of responses — e.g., subscribing to real-time stock prices or watching deployment logs. Client streaming: stream of requests, one response — e.g., uploading a large file in chunks, with the server responding with the final result. Bidirectional streaming: both sides stream independently — e.g., chat applications, collaborative editing, or real-time gaming where both client and server continuously send updates.",
    },
    {
      q: "How do gRPC deadlines differ from timeouts, and why are they important?",
      a: "A timeout is relative ('wait 5 seconds'), while a deadline is absolute ('must complete by 14:30:05.000 UTC'). gRPC propagates deadlines across service boundaries via metadata. In a chain A -> B -> C, if A sets a 5s deadline and B takes 3s, C knows it has only 2s remaining. Without deadlines, each service would use its own independent timeout, potentially waiting long after the original client has given up. Deadlines prevent wasted work in deep call chains.",
    },
    {
      q: "Why can't a standard L4 load balancer effectively distribute gRPC traffic?",
      a: "gRPC uses HTTP/2, which multiplexes many RPC calls over a single long-lived TCP connection. An L4 (TCP) load balancer assigns connections to backends, not individual requests. Once a connection is established to a backend, all RPCs on that connection go to the same backend. This leads to uneven load distribution. Solution: use an L7 (application-level) load balancer like Envoy that understands HTTP/2 framing, or use gRPC's built-in client-side load balancing.",
    },
  ],
  mcqs: [
    {
      q: "What encoding format does gRPC use by default for message serialization?",
      options: ["JSON", "XML", "Protocol Buffers (binary)", "MessagePack"],
      answerIndex: 2,
      explanation:
        "gRPC uses Protocol Buffers (protobuf) as its default serialization format. Protobuf is a binary format that is smaller and faster to serialize/deserialize than text-based formats like JSON.",
    },
    {
      q: "Which gRPC streaming pattern allows both sides to send messages simultaneously?",
      options: [
        "Unary RPC",
        "Server streaming RPC",
        "Client streaming RPC",
        "Bidirectional streaming RPC",
      ],
      answerIndex: 3,
      explanation:
        "Bidirectional streaming allows both client and server to send a stream of messages independently over the same connection. Neither side needs to wait for the other to finish.",
    },
    {
      q: "What happens when a gRPC deadline is exceeded?",
      options: [
        "The server continues processing and sends the response when ready",
        "The RPC is cancelled with DEADLINE_EXCEEDED status code",
        "The client automatically retries the request",
        "The connection is terminated",
      ],
      answerIndex: 1,
      explanation:
        "When the deadline expires, the RPC fails with DEADLINE_EXCEEDED. The cancellation propagates to the server and downstream services, allowing them to stop unnecessary work. The connection itself is not affected.",
    },
    {
      q: "Why is protobuf's use of field numbers important for schema evolution?",
      options: [
        "Field numbers are faster to type",
        "It enables backward-compatible evolution — fields can be renamed or added without breaking the wire format",
        "It enforces field ordering",
        "It reduces .proto file size",
      ],
      answerIndex: 1,
      explanation:
        "Protobuf encodes field numbers (not names) on the wire. Field names can be changed without affecting serialized data. New fields can be added with new numbers, and old clients ignore unknown field numbers, enabling backward and forward compatibility.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between a gRPC channel and a connection?",
      back: "A channel is a logical concept handling name resolution, load balancing, and reconnection. Under the hood it maintains HTTP/2 connections. Create one channel per service and reuse it.",
    },
    {
      front: "What are gRPC interceptors?",
      back: "Middleware for gRPC calls. Unary interceptors wrap request-response calls; stream interceptors wrap streaming calls. Used for logging, auth, tracing, metrics, and retry logic. Chained in order on both client and server.",
    },
    {
      front: "What is gRPC reflection?",
      back: "A server-side service that exposes the protobuf schema at runtime. Clients like grpcurl can discover available services and methods without .proto files. The gRPC equivalent of Swagger.",
    },
    {
      front: "How does protobuf achieve backward compatibility?",
      back: "Fields are identified by number on the wire. New fields with new numbers can be added (old clients ignore them). Removed fields should have their numbers reserved to prevent reuse.",
    },
    {
      front: "What is gRPC-Web and why is it needed?",
      back: "A gRPC variant for browsers. Browsers lack HTTP/2 trailer support and client-initiated bidirectional streaming. gRPC-Web uses a proxy (Envoy) and supports only unary + server streaming.",
    },
    {
      front: "Why use client-side load balancing with gRPC?",
      back: "HTTP/2 multiplexes RPCs over one TCP connection. L4 load balancers assign at connection level, sending all RPCs to one backend. Client-side LB (round-robin) distributes individual RPCs across backends.",
    },
  ],
  revisionNotes: [
    "gRPC = HTTP/2 + protobuf + code generation. High performance, strongly typed, polyglot.",
    "Protobuf: binary format, field numbers on wire, 3-10x smaller than JSON, backward compatible via field numbering.",
    "Four patterns: unary, server streaming, client streaming, bidirectional streaming.",
    "Deadlines propagate across services via metadata. Prevents wasted work in deep call chains.",
    "Interceptors = gRPC middleware. Unary + stream variants. Chain for logging, auth, tracing, retry.",
    "Channel: logical connection. Create once per service, reuse. Handles reconnection and LB.",
    "L4 LB does not work well with gRPC (HTTP/2 multiplexing). Use L7 (Envoy) or client-side LB.",
    "gRPC-Web: browser support via proxy. Only unary + server streaming.",
  ],
  cheatSheet: [
    "Proto: syntax = \"proto3\"; service S { rpc M(Req) returns (Res); }",
    "Code gen: protoc --go_out=. --go-grpc_out=. proto/service.proto",
    "Deadline: ctx, cancel := context.WithTimeout(ctx, 5*time.Second)",
    "Metadata: md := metadata.Pairs(\"key\", \"value\"); ctx = metadata.NewOutgoingContext(ctx, md)",
    "Status codes: OK, CANCELLED, DEADLINE_EXCEEDED, NOT_FOUND, ALREADY_EXISTS, PERMISSION_DENIED, UNAUTHENTICATED, UNAVAILABLE, INTERNAL",
    "Client LB config: {\"loadBalancingConfig\": [{\"round_robin\": {}}]}",
    "grpcurl: grpcurl -plaintext localhost:50051 list",
    "Retry config in service config JSON: retryPolicy with maxAttempts, backoff, retryableStatusCodes",
  ],
  resources: [
    { label: "gRPC Official Documentation", kind: "docs", note: "Covers concepts, tutorials, and language-specific guides." },
    { label: "Protocol Buffers Language Guide (proto3)", kind: "docs", note: "Complete reference for protobuf syntax and schema evolution." },
    { label: "gRPC Up and Running by Kasun Indrasiri", kind: "book", note: "Practical guide covering all streaming patterns, interceptors, and production deployment." },
    { label: "Envoy Proxy gRPC Bridging", kind: "docs", note: "Setting up Envoy as L7 load balancer for gRPC and gRPC-Web." },
    { label: "grpcurl GitHub Repository", kind: "repo", note: "CLI tool for interacting with gRPC servers, supporting reflection." },
    { label: "Buf - Protobuf Tooling", kind: "repo", note: "Modern protobuf linting, breaking change detection, and code generation." },
  ],
  glossary: [
    { term: "Protocol Buffers (protobuf)", definition: "Google's language-neutral binary serialization format. Defined via .proto files, compiled to language-specific code." },
    { term: "Unary RPC", definition: "The simplest gRPC pattern: one request, one response. Analogous to a function call." },
    { term: "Server streaming RPC", definition: "Client sends one request, server returns a stream of responses. Used for real-time feeds and event subscriptions." },
    { term: "Bidirectional streaming RPC", definition: "Both client and server send streams of messages independently over the same connection." },
    { term: "Deadline", definition: "An absolute timestamp by which a gRPC call must complete. Propagated across service boundaries via metadata." },
    { term: "Interceptor", definition: "gRPC middleware that wraps RPC calls for cross-cutting concerns like auth, logging, and tracing." },
    { term: "Channel", definition: "A logical connection to a gRPC server handling name resolution, connection management, and load balancing." },
    { term: "gRPC-Web", definition: "A variant of gRPC for browsers, requiring a proxy and supporting only unary and server streaming." },
  ],
};
