import type { TopicContent } from "../types";

export const tcpUdp: TopicContent = {
  quickSummary: [
    "TCP (Transmission Control Protocol) is a connection-oriented, reliable transport protocol that guarantees in-order delivery of a byte stream between two endpoints using three-way handshakes, acknowledgements, retransmissions, and flow/congestion control.",
    "UDP (User Datagram Protocol) is a connectionless, best-effort transport protocol that sends datagrams with no delivery guarantees, no ordering, and no congestion control — minimal overhead makes it ideal for latency-sensitive applications like video streaming, DNS, and online gaming.",
    "Both protocols sit at OSI Layer 4 (Transport) and are multiplexed by port numbers over IP, but they serve fundamentally different reliability-vs-latency trade-offs.",
    "Modern protocols like QUIC build UDP-based reliable transport in user space, combining TCP-like reliability with UDP-like flexibility and avoiding head-of-line blocking across streams.",
  ],
  detailed: [
    "TCP is connection-oriented: before any data flows, the two endpoints perform a three-way handshake (SYN, SYN-ACK, ACK) to synchronize sequence numbers and establish connection state. This state includes send and receive buffers, sequence counters, window sizes, and timers. The connection is torn down with a four-way FIN handshake (FIN, ACK, FIN, ACK) or abruptly with a RST. Each side maintains a Transmission Control Block (TCB) tracking the connection's full state. This statefulness means routers and firewalls can track TCP connections (conntrack), and middleboxes can perform NAT reliably.",
    "TCP provides reliable, ordered byte-stream delivery. Every byte sent is assigned a sequence number. The receiver acknowledges received data with ACK segments carrying the next expected sequence number. If the sender does not receive an ACK within a Retransmission Timeout (RTO), it retransmits the unacknowledged segment. Duplicate ACKs trigger Fast Retransmit (retransmit after 3 duplicate ACKs without waiting for the RTO). Selective Acknowledgements (SACK, RFC 2018) allow the receiver to report non-contiguous blocks it has received, so the sender retransmits only truly lost segments rather than everything from the gap onward.",
    "UDP is connectionless: each datagram is independent with no handshake, no connection state, and no teardown. The sender fires a datagram at the destination IP and port; the network delivers it on a best-effort basis. Datagrams may arrive out of order, be duplicated, or be lost entirely — UDP provides no mechanism to detect or correct any of these. This simplicity gives UDP extremely low overhead: the header is only 8 bytes (source port, destination port, length, checksum) compared to TCP's minimum 20-byte header. Applications that need reliability over UDP must implement it themselves at the application layer.",
    "TCP implements flow control using a sliding window protocol. The receiver advertises a receive window (rwnd) in every ACK, telling the sender how much buffer space remains. The sender never sends more than rwnd bytes beyond the last acknowledged byte. This prevents a fast sender from overwhelming a slow receiver. TCP also implements congestion control to prevent overwhelming the network itself — the sender maintains a congestion window (cwnd) and sends at the rate of min(cwnd, rwnd). Congestion control algorithms (Reno, Cubic, BBR) adjust cwnd based on network feedback (packet loss, RTT changes).",
    "The TCP header is 20-60 bytes: source/destination ports (16 bits each), sequence number (32 bits), acknowledgement number (32 bits), data offset (4 bits), reserved bits, flags (URG, ACK, PSH, RST, SYN, FIN — 6 bits, plus ECE and CWR for ECN), window size (16 bits, scaled by window scaling option), checksum (16 bits), urgent pointer (16 bits), and up to 40 bytes of options (MSS, window scaling, timestamps, SACK). The UDP header is just 8 bytes: source port (16 bits), destination port (16 bits), length (16 bits), and checksum (16 bits, optional in IPv4, mandatory in IPv6).",
  ],
  deepDive: [
    "TCP's sliding window and congestion control form the heart of its performance characteristics. The send window is min(cwnd, rwnd). During slow start, cwnd begins at the Initial Window (typically 10 MSS per RFC 6928) and doubles every RTT (exponential growth) until it hits the slow start threshold (ssthresh) or a loss occurs. After ssthresh, the algorithm enters congestion avoidance, where cwnd grows linearly (additive increase). On packet loss detected by triple duplicate ACKs, cwnd is halved (multiplicative decrease) — this is the classic AIMD (Additive Increase, Multiplicative Decrease) behavior of TCP Reno. TCP Cubic (Linux default since 2.6.19) replaces AIMD's linear growth with a cubic function of time since the last congestion event, enabling faster window recovery on high-bandwidth, high-latency links (long fat networks). BBR (Bottleneck Bandwidth and RTT), developed by Google, takes a fundamentally different approach: instead of using packet loss as the congestion signal, it estimates the bottleneck bandwidth and minimum RTT, then paces packets to match the delivery rate, achieving higher throughput and lower latency on lossy links.",
    "Nagle's algorithm (RFC 896) reduces the number of small packets on the wire by buffering outgoing data until either a full MSS-sized segment accumulates or the previous segment is acknowledged. While this improves bandwidth efficiency, it introduces latency for interactive applications. The TCP_NODELAY socket option disables Nagle's algorithm, which is critical for protocols like SSH, real-time games, and HTTP/2 where latency matters more than bandwidth efficiency. A related issue is the interaction between Nagle's algorithm and delayed ACKs (where the receiver waits up to 200ms before sending an ACK, hoping to piggyback it on a data segment). When both are enabled, a sender waiting for an ACK (Nagle) meets a receiver waiting to piggyback (delayed ACK), causing up to 200ms of unnecessary latency — a well-known performance pitfall.",
    "UDP is the protocol of choice for real-time applications where timeliness trumps reliability. In video conferencing (WebRTC), a lost video frame is useless by the time a retransmission arrives — the application simply conceals the loss with error concealment or forward error correction (FEC). DNS uses UDP for queries because the entire request/response fits in a single datagram, avoiding TCP's handshake overhead. Game networking uses UDP with application-level reliability only for critical state (player positions use unreliable updates; inventory changes use reliable sequenced messages). RTP (Real-time Transport Protocol) runs over UDP and adds sequence numbers, timestamps, and payload type identification without TCP's head-of-line blocking problem, where a single lost segment stalls all subsequent data in the stream.",
    "QUIC (RFC 9000) is a modern transport protocol built on UDP that provides TCP-like reliability with significant improvements. It multiplexes multiple independent streams over a single connection, eliminating head-of-line blocking — a lost packet on stream A does not stall streams B and C. QUIC integrates TLS 1.3 into the handshake, achieving 0-RTT connection establishment for resumed connections (vs. TCP + TLS requiring 2-3 RTTs). Connection migration is built in: a QUIC connection is identified by a Connection ID rather than the IP/port 4-tuple, so it survives network changes (e.g., switching from Wi-Fi to cellular). QUIC runs in user space, enabling rapid iteration on congestion control and loss recovery without waiting for OS kernel updates. HTTP/3 is HTTP over QUIC, and it is now the default protocol for major browsers and services like Google, Facebook, and Cloudflare.",
    "TCP performance tuning involves several kernel parameters and socket options. The receive buffer size (net.core.rmem_max, SO_RCVBUF) limits the receive window and thus throughput on high-BDP (Bandwidth-Delay Product) links — the buffer must be at least BDP bytes to keep the pipe full. Window scaling (RFC 7323) extends the 16-bit window field to 30 bits, supporting windows up to 1 GB. TCP timestamps (also RFC 7323) enable precise RTT measurement and protect against sequence number wraparound (PAWS) on fast links. TCP Fast Open (TFO, RFC 7413) allows data in the SYN packet for repeat connections, saving one RTT. On the security side, SYN cookies defend against SYN flood attacks by encoding connection state in the SYN-ACK's sequence number, avoiding TCB allocation until the handshake completes.",
  ],
  code: [
    {
      language: "cpp",
      caption: "TCP echo server and client demonstrating connection lifecycle in C++",
      source: `#include <iostream>
#include <cstring>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

// === TCP Echo Server ===
void tcp_server(const char* host = "127.0.0.1", int port = 9000) {
    int srv = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);
    bind(srv, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));

    listen(srv, 5);                          // backlog of 5 pending connections
    std::cout << "TCP server listening on " << host << ":" << port << "\\n";

    sockaddr_in client_addr{};
    socklen_t client_len = sizeof(client_addr);
    int conn = accept(srv, reinterpret_cast<sockaddr*>(&client_addr), &client_len);
    std::cout << "Connection accepted\\n";

    char buf[4096];
    while (true) {
        ssize_t n = recv(conn, buf, sizeof(buf), 0);  // read from the byte stream
        if (n <= 0) break;                             // client closed (FIN received)
        send(conn, buf, n, 0);                         // echo back
    }
    std::cout << "Connection closed\\n";

    close(conn);
    close(srv);
}

// === TCP Echo Client ===
void tcp_client(const char* host = "127.0.0.1", int port = 9000) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);

    connect(sock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));  // SYN -> SYN-ACK -> ACK

    const char* msg = "Hello, TCP!";
    send(sock, msg, strlen(msg), 0);

    char buf[4096]{};
    ssize_t n = recv(sock, buf, sizeof(buf), 0);
    std::cout << "Received: " << std::string(buf, n) << "\\n";

    close(sock);  // sends FIN -> graceful close
}

// Run server in background, then client
int main() {
    std::thread t(tcp_server, "127.0.0.1", 9000);
    t.detach();

    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    tcp_client();  // Output: Received: Hello, TCP!
}`,
    },
    {
      language: "cpp",
      caption: "UDP echo server and client in C++ -- no connection, no guarantees",
      source: `#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

// === UDP Echo Server ===
void udp_server(const char* host = "127.0.0.1", int port = 9001) {
    int sock = socket(AF_INET, SOCK_DGRAM, 0);  // SOCK_DGRAM = UDP

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);
    bind(sock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));

    std::cout << "UDP server listening on " << host << ":" << port << "\\n";

    while (true) {
        char buf[65535];
        sockaddr_in client_addr{};
        socklen_t client_len = sizeof(client_addr);
        ssize_t n = recvfrom(sock, buf, sizeof(buf), 0,
                             reinterpret_cast<sockaddr*>(&client_addr), &client_len);
        std::cout << "Datagram received: " << std::string(buf, n) << "\\n";
        sendto(sock, buf, n, 0,
               reinterpret_cast<sockaddr*>(&client_addr), client_len);  // echo back
    }
    close(sock);
}

// === UDP Echo Client ===
void udp_client(const char* host = "127.0.0.1", int port = 9001) {
    int sock = socket(AF_INET, SOCK_DGRAM, 0);

    // Set receive timeout -- must handle loss ourselves
    struct timeval tv{2, 0};  // 2 seconds
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);

    const char* msg = "Hello, UDP!";
    sendto(sock, msg, strlen(msg), 0,
           reinterpret_cast<sockaddr*>(&addr), sizeof(addr));  // no handshake -- just send

    char buf[65535];
    ssize_t n = recvfrom(sock, buf, sizeof(buf), 0, nullptr, nullptr);
    if (n > 0)
        std::cout << "Received: " << std::string(buf, n) << "\\n";
    else
        std::cout << "No response -- datagram may have been lost\\n";

    close(sock);
}

// Key differences from TCP:
// - No connect()/accept() -- no connection state
// - Each sendto/recvfrom is an independent datagram
// - No guaranteed delivery -- we added a timeout as basic loss detection
// - No stream ordering -- datagrams may arrive out of order
// - No flow control -- sender can flood the receiver`,
    },
    {
      language: "text",
      caption: "TCP and UDP header structure (byte layout)",
      source: `TCP Header (20-60 bytes):
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |Res|N|C|E|U|A|P|R|S|F|                                |
| Offset|   |S|W|C|R|C|S|S|Y|I|         Window Size            |
|  (4b) |   | |R|E|G|K|H|T|N|N|           (16 bits)            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (0-40 bytes)                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

UDP Header (8 bytes only):
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP flags: SYN (synchronize), ACK (acknowledge), FIN (finish),
RST (reset), PSH (push), URG (urgent), ECE/CWR (ECN-related),
NS (ECN-nonce). Data Offset: header length in 32-bit words.`,
    },
  ],
  diagrams: [
    {
      title: "TCP Three-Way Handshake and Four-Way Teardown",
      kind: "sequence",
      caption: "Connection establishment (SYN, SYN-ACK, ACK) and graceful termination (FIN, ACK, FIN, ACK) between client and server, showing sequence number exchange.",
    },
    {
      title: "TCP vs UDP Protocol Stack",
      kind: "architecture",
      caption: "OSI/TCP-IP layer comparison showing where TCP and UDP sit relative to IP, application protocols (HTTP, DNS, RTP), and the physical network.",
    },
    {
      title: "TCP Congestion Control State Machine",
      kind: "state",
      caption: "States: Slow Start -> Congestion Avoidance -> Fast Recovery. Transitions on: ssthresh reached, triple duplicate ACK, timeout. Shows cwnd changes at each transition.",
    },
    {
      title: "TCP Sliding Window Mechanism",
      kind: "flow",
      caption: "Visualization of the send window partitioned into: bytes sent and acknowledged, bytes sent but unacknowledged (in flight), bytes sendable (within window), and bytes not yet sendable (beyond window).",
    },
    {
      title: "QUIC vs TCP+TLS Connection Establishment",
      kind: "sequence",
      caption: "Comparison of round-trips: TCP (1 RTT handshake) + TLS 1.3 (1 RTT) = 2 RTTs vs QUIC 1-RTT (new connection) or 0-RTT (resumed connection).",
    },
  ],
  animations: [
    {
      title: "TCP Three-Way Handshake Step-Through",
      steps: [
        { label: "Client sends SYN", detail: "Client selects an Initial Sequence Number (ISN, e.g. 1000), sets the SYN flag, and sends the segment. Client enters SYN_SENT state. No data is transmitted yet." },
        { label: "Server receives SYN, sends SYN-ACK", detail: "Server receives the SYN, allocates a TCB (Transmission Control Block), selects its own ISN (e.g. 5000), and replies with SYN+ACK: ACK=1001 (client ISN+1), SEQ=5000. Server enters SYN_RCVD state." },
        { label: "Client receives SYN-ACK, sends ACK", detail: "Client receives SYN-ACK, confirms the server's ISN, and sends ACK: SEQ=1001, ACK=5001. Client enters ESTABLISHED state. This ACK can carry data (TCP Fast Open allows data even in the SYN)." },
        { label: "Connection established", detail: "Server receives the ACK, enters ESTABLISHED state. Both sides now have synchronized sequence numbers and agreed-upon parameters (MSS, window scale, SACK permitted). Data transfer can begin in both directions." },
      ],
    },
    {
      title: "TCP Congestion Control: Slow Start to Steady State",
      steps: [
        { label: "Initial state", detail: "cwnd = 1 MSS (or IW = 10 MSS per RFC 6928). ssthresh is set high (e.g. 64KB). The sender can transmit only cwnd bytes before waiting for ACKs." },
        { label: "Slow start phase", detail: "For each ACK received, cwnd increases by 1 MSS. Since each RTT acknowledges all segments sent, cwnd effectively doubles every RTT: 1 -> 2 -> 4 -> 8 -> 16 MSS. Despite the name, growth is exponential." },
        { label: "Reaching ssthresh", detail: "When cwnd reaches ssthresh, the algorithm transitions from slow start to congestion avoidance. Now cwnd grows by ~1 MSS per RTT (linear/additive increase) instead of doubling." },
        { label: "Packet loss detected", detail: "Three duplicate ACKs trigger Fast Retransmit: retransmit the lost segment immediately. ssthresh is set to cwnd/2, cwnd is set to ssthresh + 3 MSS (Fast Recovery in Reno). This is the multiplicative decrease." },
        { label: "Recovery and steady state", detail: "After recovery, cwnd resumes additive increase from the new ssthresh. The sawtooth pattern emerges: linear growth, loss, halve, linear growth. Cubic and BBR modify this pattern for better utilization." },
      ],
    },
    {
      title: "UDP Datagram Delivery: Best Effort in Action",
      steps: [
        { label: "Application writes datagram", detail: "The application calls sendto() with a destination IP:port and a data buffer. The OS wraps the data with an 8-byte UDP header (src port, dst port, length, checksum) and passes it to IP." },
        { label: "IP routing and forwarding", detail: "IP adds its header and routes the datagram hop-by-hop. Each router independently forwards based on its routing table. No connection state exists at any hop — each datagram is independently routed." },
        { label: "Possible loss or reordering", detail: "Router buffers overflow (tail drop), a link fails, or datagrams take different paths. Datagram 2 may arrive before datagram 1, or not at all. UDP provides no detection or correction for any of this." },
        { label: "Receiver processes datagram", detail: "The destination OS delivers the datagram to the socket bound to the destination port via recvfrom(). The application gets the data and the sender's address. If the datagram was lost, the application simply never receives it." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "TCP", "UDP"],
    rows: [
      ["Connection model", "Connection-oriented (3-way handshake to establish, 4-way to teardown)", "Connectionless (no handshake, no state)"],
      ["Reliability", "Guaranteed delivery via ACKs, retransmissions, and sequence numbers", "Best-effort: no ACKs, no retransmissions"],
      ["Ordering", "Strict in-order byte-stream delivery guaranteed by sequence numbers", "No ordering guarantee; datagrams may arrive in any order"],
      ["Flow control", "Sliding window with receiver-advertised window (rwnd)", "None — sender can transmit at any rate"],
      ["Congestion control", "Built-in (Slow Start, AIMD, Cubic, BBR)", "None — application must implement if needed"],
      ["Header size", "20-60 bytes (20 base + up to 40 bytes of options)", "8 bytes (fixed)"],
      ["Data boundary", "Byte stream — no message boundaries preserved", "Message-oriented — each sendto/recvfrom is a discrete datagram"],
      ["Speed/Latency", "Higher latency (handshake, ACK waits, retransmissions)", "Lower latency (no handshake, no waiting for ACKs)"],
      ["Overhead", "Higher (connection state, buffers, timers per connection)", "Minimal (no per-connection state)"],
      ["Broadcast/Multicast", "Not supported (connection is point-to-point)", "Supported (can send to broadcast/multicast addresses)"],
      ["Head-of-line blocking", "Yes — one lost segment stalls all subsequent data", "No — each datagram is independent"],
      ["Use cases", "HTTP/HTTPS, SSH, FTP, SMTP, database connections", "DNS, DHCP, VoIP, video streaming, gaming, QUIC"],
      ["Error detection", "Mandatory checksum + sequence number validation", "Optional checksum in IPv4, mandatory in IPv6"],
      ["Connection state", "Both endpoints maintain TCB (buffers, timers, sequence numbers)", "No connection state — stateless"],
      ["Max segment/datagram", "MSS negotiated (typically 1460 bytes on Ethernet)", "Max 65,535 bytes (limited by 16-bit length field minus IP header)"],
    ],
  },
  interviewQA: [
    {
      q: "Explain the TCP three-way handshake and why it requires exactly three messages.",
      a: "The three-way handshake (SYN, SYN-ACK, ACK) synchronizes sequence numbers in both directions and confirms both sides can send and receive. The client sends SYN with its Initial Sequence Number (ISN_C). The server responds with SYN-ACK containing its own ISN_S and acknowledging ISN_C+1. The client sends ACK acknowledging ISN_S+1. Three messages are the minimum needed because each direction requires one SYN to propose a sequence number and one ACK to confirm receipt — the server combines its SYN and ACK into one segment. A two-way handshake would not confirm the server's SYN was received by the client, leaving the server's sequence number unacknowledged and enabling stale duplicate SYNs to establish ghost connections.",
      followUps: [
        "What is a SYN flood attack and how do SYN cookies defend against it?",
        "How does TCP Fast Open (TFO) reduce handshake latency?",
        "What happens if the final ACK of the handshake is lost?",
      ],
    },
    {
      q: "How does TCP handle packet loss, and what is the difference between Fast Retransmit and RTO-based retransmission?",
      a: "TCP detects loss two ways. First, the Retransmission Timeout (RTO): if no ACK arrives within the RTO interval (calculated from smoothed RTT and RTT variance per Jacobson's algorithm), the sender retransmits the oldest unacknowledged segment and enters slow start (cwnd = 1 MSS). Second, Fast Retransmit: when the sender receives three duplicate ACKs (indicating the receiver got later segments but is missing one), it immediately retransmits the suspected lost segment without waiting for the RTO. Fast Retransmit is triggered by reordering evidence rather than a timer, so it responds faster — typically within one RTT rather than the RTO (which can be 200ms-1s+). Combined with SACK, the sender can identify exactly which segments are missing and retransmit only those.",
      followUps: [
        "How is RTO calculated from RTT measurements?",
        "What is the difference between TCP Reno's Fast Recovery and TCP NewReno?",
        "How does SACK improve retransmission efficiency?",
      ],
    },
    {
      q: "Why would you choose UDP over TCP for a real-time application like video conferencing?",
      a: "In video conferencing, timeliness matters more than completeness. TCP's reliability mechanisms — retransmissions and head-of-line blocking — introduce latency that degrades the user experience more than a few lost frames. If a video frame's packet is lost and TCP retransmits it, by the time the retransmission arrives, the application has moved on to rendering newer frames, making the retransmitted data useless. UDP lets the application decide what to do about loss: skip the frame, interpolate from neighboring frames, or use Forward Error Correction (FEC) to reconstruct lost data from redundant packets. Additionally, UDP avoids head-of-line blocking — loss on one stream does not stall others. WebRTC uses UDP with SRTP for media and SCTP (over DTLS over UDP) for data channels, applying selective reliability only where needed.",
      followUps: [
        "How does WebRTC handle NAT traversal with UDP (STUN/TURN/ICE)?",
        "What is Forward Error Correction and how does it work with UDP?",
        "How does jitter buffering compensate for UDP's lack of ordering?",
      ],
    },
    {
      q: "Explain TCP congestion control: what problem does it solve, and how do Cubic and BBR differ?",
      a: "TCP congestion control prevents senders from overwhelming network capacity, which would cause buffer overflow (packet loss) at routers. Without it, multiple TCP flows would collapse the network (congestion collapse, observed on the early internet in 1986). Classic Reno uses AIMD: increase cwnd by 1 MSS per RTT (additive increase), halve cwnd on loss (multiplicative decrease), producing a sawtooth pattern. Cubic (Linux default) replaces the linear increase with a cubic function of time since the last loss event: it quickly recovers to the pre-loss window size, then probes cautiously above it. This makes Cubic more aggressive on high-BDP links where Reno's linear probe is too slow. BBR (Bottleneck Bandwidth and RTT) is fundamentally different: instead of treating packet loss as the congestion signal, it continuously estimates the bottleneck bandwidth (max delivery rate) and minimum RTT (propagation delay), then paces packets to match the estimated BDP. BBR achieves higher throughput on lossy links (where loss-based algorithms unnecessarily reduce their rate) and lower queuing delay (it avoids filling buffers).",
      followUps: [
        "What is bufferbloat and how does BBR address it?",
        "How does ECN (Explicit Congestion Notification) provide a loss-free congestion signal?",
        "What fairness issues can arise when BBR and Cubic flows share a bottleneck?",
      ],
    },
    {
      q: "What is QUIC and why was it built on UDP instead of creating a new transport protocol?",
      a: "QUIC is a reliable, multiplexed, encrypted transport protocol standardized in RFC 9000. It was built on UDP for a pragmatic reason: deploying a new IP protocol number is nearly impossible because middleboxes (NATs, firewalls, load balancers) only pass TCP and UDP. By running over UDP, QUIC traverses existing infrastructure without modification. QUIC improves on TCP+TLS in several ways: (1) it integrates TLS 1.3 into the handshake for 1-RTT connections (0-RTT for resumed), (2) it multiplexes independent streams without head-of-line blocking — a lost packet on stream 1 does not stall stream 2, unlike TCP where the byte stream is monolithic, (3) connections are identified by a Connection ID, not the IP/port 4-tuple, enabling seamless migration when the client changes networks, (4) it runs in user space so congestion control and loss recovery can be iterated without kernel updates. HTTP/3 uses QUIC as its transport, and it is supported by all major browsers.",
      followUps: [
        "How does QUIC's stream multiplexing avoid head-of-line blocking?",
        "What is 0-RTT resumption and what are its security implications (replay attacks)?",
        "How does QUIC handle connection migration when switching from Wi-Fi to cellular?",
      ],
    },
    {
      q: "What is Nagle's algorithm and when should you disable it?",
      a: "Nagle's algorithm (RFC 896) reduces the number of small packets (tinygrams) on the network. It buffers outgoing data and delays sending until either: (1) a full MSS-sized segment has accumulated, or (2) all previously sent data has been acknowledged. This coalesces many small writes into fewer, larger segments, improving bandwidth efficiency. However, it adds latency — small messages are delayed waiting for an ACK. You should disable it (TCP_NODELAY socket option) for interactive and latency-sensitive protocols: SSH keystrokes, real-time multiplayer games, HTTP/2 (which has its own framing), financial trading systems, and any protocol where the application sends small messages that need immediate delivery. A notorious performance bug occurs when Nagle's algorithm interacts with delayed ACKs: the sender waits for an ACK (Nagle), the receiver waits 200ms hoping to piggyback the ACK on a response (delayed ACK), causing unnecessary 200ms delays.",
      followUps: [
        "How does TCP_CORK differ from TCP_NODELAY?",
        "What is the delayed ACK timer and why does it interact poorly with Nagle?",
        "When is Nagle's algorithm actually beneficial?",
      ],
    },
  ],
  followUps: [
    "How does TCP handle connection reset (RST) and in what scenarios is it sent?",
    "What is the TIME_WAIT state in TCP and why does it last for 2*MSL?",
    "How does TCP window scaling work and why is it needed for high-bandwidth links?",
    "What is the difference between TCP keepalive and application-level heartbeats?",
    "How does multipath TCP (MPTCP) work and what problems does it solve?",
    "How does UDP-Lite differ from UDP, and where is it used?",
    "What is SCTP and how does it compare to TCP and UDP?",
    "How do load balancers handle TCP vs UDP traffic differently?",
  ],
  mcqs: [
    {
      q: "What is the minimum size of a TCP header?",
      options: ["8 bytes", "16 bytes", "20 bytes", "32 bytes"],
      answerIndex: 2,
      explanation: "The TCP header has a minimum size of 20 bytes (5 x 32-bit words) containing source/destination ports, sequence number, acknowledgement number, data offset, flags, window size, checksum, and urgent pointer. Options can extend it up to 60 bytes.",
    },
    {
      q: "During TCP's three-way handshake, what flags are set in the second message (server to client)?",
      options: ["SYN only", "ACK only", "SYN + ACK", "FIN + ACK"],
      answerIndex: 2,
      explanation: "The server responds with both SYN (to synchronize its own sequence number) and ACK (to acknowledge the client's SYN) in a single segment, which is why the handshake requires only three messages instead of four.",
    },
    {
      q: "Which congestion control mechanism does TCP use when cwnd is below ssthresh?",
      options: ["Congestion avoidance (linear increase)", "Slow start (exponential increase)", "Fast recovery", "Multiplicative decrease"],
      answerIndex: 1,
      explanation: "When cwnd < ssthresh, TCP is in slow start phase where cwnd increases by 1 MSS for each ACK received, effectively doubling every RTT (exponential growth). Once cwnd reaches ssthresh, TCP switches to congestion avoidance with linear increase.",
    },
    {
      q: "Why does UDP support broadcast and multicast while TCP does not?",
      options: [
        "UDP has a larger address space in its header",
        "TCP's connection-oriented model requires a dedicated connection between exactly two endpoints",
        "UDP uses a different IP version that supports multicast",
        "TCP's checksum algorithm is incompatible with multicast",
      ],
      answerIndex: 1,
      explanation: "TCP requires a connection (state, sequence numbers, acknowledgements) between exactly two endpoints. Broadcast/multicast sends to multiple recipients, making it impossible to maintain per-connection state, perform handshakes, or handle acknowledgements from multiple receivers.",
    },
    {
      q: "What triggers TCP Fast Retransmit?",
      options: [
        "The retransmission timeout (RTO) expires",
        "The receiver sends a NAK (negative acknowledgement)",
        "The sender receives three duplicate ACKs for the same sequence number",
        "The congestion window drops to zero",
      ],
      answerIndex: 2,
      explanation: "Fast Retransmit is triggered when the sender receives three duplicate ACKs (four ACKs total for the same sequence number). This indicates the receiver got subsequent segments but is missing one, so the sender retransmits immediately without waiting for the slower RTO timer.",
    },
    {
      q: "What is the size of a UDP header?",
      options: ["4 bytes", "8 bytes", "16 bytes", "20 bytes"],
      answerIndex: 1,
      explanation: "The UDP header is exactly 8 bytes: source port (2 bytes), destination port (2 bytes), length (2 bytes), and checksum (2 bytes). This minimal overhead is one of UDP's key advantages for latency-sensitive applications.",
    },
    {
      q: "How does QUIC avoid TCP's head-of-line blocking problem?",
      options: [
        "By using a larger receive buffer",
        "By disabling retransmissions for lost packets",
        "By multiplexing independent streams where loss on one stream does not stall others",
        "By sending all data as UDP broadcast",
      ],
      answerIndex: 2,
      explanation: "QUIC multiplexes multiple independent streams within a single connection. Unlike TCP where the entire byte stream is ordered (so a lost segment stalls all data behind it), QUIC delivers each stream independently — a lost packet on stream A only blocks stream A while streams B and C continue unimpeded.",
    },
  ],
  exercises: [
    "Implement a reliable file transfer protocol over UDP: add sequence numbers, ACKs, retransmission with configurable timeout, and in-order reassembly. Measure throughput compared to TCP for the same file on a lossy link (use tc/netem to simulate loss).",
    "Write a TCP server that handles 1000 concurrent connections using epoll (Linux) or kqueue (macOS). Measure memory usage per connection and compare with a UDP server handling the same number of clients.",
    "Use Wireshark to capture a TCP connection: identify the three-way handshake, data transfer with ACKs, window size changes, and the four-way teardown. Annotate each segment with its sequence and acknowledgement numbers.",
    "Implement Nagle's algorithm in a toy TCP stack: buffer small writes, flush on ACK or when MSS bytes accumulate. Demonstrate the delayed ACK interaction by pairing it with a receiver that delays ACKs by 200ms. Then disable Nagle and compare latencies.",
    "Build a simple congestion control simulator: implement slow start and AIMD in Python, simulate a bottleneck link with a fixed buffer, and plot cwnd over time showing the sawtooth pattern. Compare Reno vs Cubic growth curves.",
    "Create a UDP-based chat application that supports multiple clients. Implement application-level features that TCP provides for free: message ordering (sequence numbers), reliability (ACK + retransmit), and duplicate detection.",
  ],
  flashcards: [
    { front: "What does TCP stand for and what layer does it operate at?", back: "Transmission Control Protocol, operating at OSI Layer 4 (Transport layer). It provides reliable, ordered, error-checked delivery of a byte stream between applications." },
    { front: "What are the six original TCP flags?", back: "SYN (synchronize sequence numbers), ACK (acknowledgement), FIN (finish/close), RST (reset/abort), PSH (push data to application immediately), URG (urgent data present). Later additions: ECE, CWR (ECN), NS." },
    { front: "What is the TCP receive window (rwnd)?", back: "A 16-bit field (extended by window scaling to 30 bits) advertised by the receiver in every ACK segment. It tells the sender how many bytes the receiver is willing to accept, implementing flow control to prevent receiver buffer overflow." },
    { front: "What is the difference between flow control and congestion control?", back: "Flow control prevents the sender from overwhelming the receiver (managed by rwnd). Congestion control prevents the sender from overwhelming the network (managed by cwnd). The effective send window is min(cwnd, rwnd)." },
    { front: "What is the UDP checksum and is it mandatory?", back: "A 16-bit one's complement checksum covering the UDP header, data, and a pseudo-header (source/dest IP, protocol, length). It is optional in IPv4 (set to 0 to skip) but mandatory in IPv6 because IPv6 has no IP-level checksum." },
    { front: "What is TCP's TIME_WAIT state?", back: "After sending the final ACK in a connection teardown, the closing side enters TIME_WAIT for 2x MSL (Maximum Segment Lifetime, typically 60s). This ensures delayed segments from the old connection expire before the same port pair is reused, and allows retransmission of the final ACK if lost." },
    { front: "What is the Bandwidth-Delay Product (BDP)?", back: "BDP = bandwidth x RTT. It represents the maximum amount of data in flight (in the network pipe) at any time. TCP buffers must be at least BDP bytes to fully utilize the link. Example: 1 Gbps link, 50ms RTT = 6.25 MB BDP." },
    { front: "How does QUIC achieve 0-RTT connection resumption?", back: "On a resumed connection, the client sends a previously cached server configuration along with encrypted application data in the first packet. The server can process this data immediately without a handshake round-trip. Trade-off: 0-RTT data is vulnerable to replay attacks, so only idempotent requests should use it." },
    { front: "What is head-of-line (HOL) blocking in TCP?", back: "When a segment is lost, TCP must deliver all subsequent data in order. Even though later segments have arrived and are buffered, they cannot be delivered to the application until the lost segment is retransmitted and received. This stalls all data on the connection, not just the stream that lost a packet." },
    { front: "What is MSS and how is it negotiated?", back: "Maximum Segment Size: the largest amount of data (excluding TCP/IP headers) that can be sent in a single TCP segment. It is communicated via the MSS option during the SYN handshake. Typical value on Ethernet: 1460 bytes (1500 MTU - 20 IP header - 20 TCP header)." },
  ],
  revisionNotes: [
    "TCP = connection-oriented, reliable, ordered byte stream. UDP = connectionless, unreliable, unordered datagrams. Both use port numbers for multiplexing over IP.",
    "TCP handshake: SYN (client ISN) -> SYN-ACK (server ISN + ACK) -> ACK. Teardown: FIN -> ACK -> FIN -> ACK. TIME_WAIT lasts 2*MSL after final ACK.",
    "TCP reliability: sequence numbers, cumulative ACKs, retransmission (RTO timeout or Fast Retransmit on 3 dup ACKs), SACK for selective retransmission.",
    "TCP flow control: receiver advertises rwnd (receive window) in ACKs. Sender never sends more than rwnd unacknowledged bytes. Window scaling option extends 16-bit field to 30 bits.",
    "TCP congestion control: cwnd managed by the sender. Slow start (exponential growth to ssthresh), congestion avoidance (linear growth), Fast Recovery (on 3 dup ACKs: ssthresh = cwnd/2, retransmit). Effective window = min(cwnd, rwnd).",
    "Cubic: cubic function of time since last loss for faster recovery on high-BDP links. BBR: model-based, estimates bottleneck bandwidth and min RTT, paces packets to match, avoids buffer-filling.",
    "UDP header: 8 bytes (src port, dst port, length, checksum). No connection state, no reliability, no ordering, no flow/congestion control. Supports broadcast/multicast.",
    "Nagle's algorithm buffers small sends until ACK or full MSS. Disable with TCP_NODELAY for interactive apps. Beware Nagle + delayed ACK interaction causing 200ms delays.",
    "QUIC: reliable transport over UDP. Independent stream multiplexing (no HOL blocking), integrated TLS 1.3 (1-RTT / 0-RTT), Connection ID-based migration, user-space implementation. HTTP/3 = HTTP over QUIC.",
    "Key socket options: SO_REUSEADDR (reuse TIME_WAIT ports), TCP_NODELAY (disable Nagle), SO_RCVBUF/SO_SNDBUF (buffer sizes), TCP_QUICKACK (disable delayed ACKs), TCP_FASTOPEN (data in SYN).",
  ],
  cheatSheet: [
    "TCP: SOCK_STREAM | UDP: SOCK_DGRAM",
    "TCP header: 20-60B | UDP header: 8B",
    "TCP handshake: SYN -> SYN-ACK -> ACK (1.5 RTT)",
    "TCP teardown: FIN -> ACK -> FIN -> ACK (2 RTT)",
    "Fast Retransmit: 3 duplicate ACKs -> retransmit immediately",
    "Effective window = min(cwnd, rwnd)",
    "Slow start: cwnd doubles per RTT (exponential)",
    "Congestion avoidance: cwnd += 1 MSS per RTT (linear)",
    "Loss detected: ssthresh = cwnd/2, cwnd = 1 MSS (timeout) or cwnd/2 (fast recovery)",
    "MSS = MTU - IP header (20B) - TCP header (20B) = 1460B on Ethernet",
    "BDP = bandwidth * RTT (buffer size must be >= BDP for full utilization)",
    "TCP_NODELAY disables Nagle | TCP_CORK delays until uncorked or MSS full",
    "UDP max datagram: 65,535B (16-bit length field) - 8B header = 65,527B data",
    "QUIC: UDP-based, TLS-integrated, stream-multiplexed, 0-RTT capable",
    "TIME_WAIT: 2 * MSL (typically 60-120s) after active close",
    "SYN cookies: encode state in SYN-ACK ISN to prevent SYN flood TCB exhaustion",
  ],
  resources: [
    { label: "RFC 793 - Transmission Control Protocol", kind: "docs", note: "The original TCP specification defining the protocol's core mechanics, state machine, and header format." },
    { label: "RFC 768 - User Datagram Protocol", kind: "docs", note: "The UDP specification — remarkably short at just 3 pages, reflecting the protocol's simplicity." },
    { label: "RFC 9000 - QUIC: A UDP-Based Multiplexed and Secure Transport", kind: "docs", note: "The QUIC transport protocol specification, the foundation for HTTP/3." },
    { label: "TCP/IP Illustrated, Volume 1 by W. Richard Stevens", kind: "book", note: "The definitive reference for understanding TCP/IP internals with packet-level analysis. Chapters 17-24 cover TCP in extraordinary detail." },
    { label: "Computer Networking: A Top-Down Approach by Kurose & Ross", kind: "book", note: "Widely used networking textbook with excellent coverage of TCP congestion control and the transport layer." },
    { label: "RFC 5681 - TCP Congestion Control", kind: "docs", note: "Defines slow start, congestion avoidance, fast retransmit, and fast recovery algorithms." },
    { label: "BBR: Congestion-Based Congestion Control (ACM Queue)", kind: "paper", note: "Google's paper on BBR congestion control, explaining the model-based approach that estimates bottleneck bandwidth and RTT." },
    { label: "RFC 7323 - TCP Extensions for High Performance", kind: "docs", note: "Defines window scaling, timestamps, and PAWS (Protection Against Wrapped Sequence numbers) for high-bandwidth links." },
    { label: "Beej's Guide to Network Programming", kind: "article", note: "Practical, hands-on guide to socket programming in C covering both TCP and UDP with clear examples." },
    { label: "QUIC Working Group at IETF", kind: "docs", note: "Collection of QUIC-related RFCs including loss detection (RFC 9002) and HTTP/3 (RFC 9114)." },
  ],
  glossary: [
    { term: "MSS (Maximum Segment Size)", definition: "The largest amount of data in bytes that TCP will send in a single segment, excluding TCP and IP headers. Negotiated during the handshake via TCP options, typically 1460 bytes on Ethernet (1500 MTU minus 40 bytes of headers)." },
    { term: "cwnd (Congestion Window)", definition: "A sender-side variable limiting how many bytes can be in flight (sent but unacknowledged). Managed by the congestion control algorithm to prevent network overload. The effective send rate is limited to min(cwnd, rwnd) / RTT." },
    { term: "rwnd (Receive Window)", definition: "The number of bytes the receiver is willing to accept, advertised in the Window Size field of every ACK. Implements flow control to prevent the sender from overrunning the receiver's buffer." },
    { term: "RTT (Round-Trip Time)", definition: "The time for a packet to travel from sender to receiver and for the acknowledgement to return. TCP continuously measures RTT to set retransmission timeouts (RTO = SRTT + 4*RTTVAR per RFC 6298)." },
    { term: "ISN (Initial Sequence Number)", definition: "The starting sequence number chosen by each side during the TCP handshake. Should be unpredictable (RFC 6528) to prevent TCP sequence prediction attacks. Modern OSes use a combination of a clock and a cryptographic hash." },
    { term: "SACK (Selective Acknowledgement)", definition: "A TCP option (RFC 2018) that allows the receiver to report non-contiguous blocks of received data, enabling the sender to retransmit only the specific missing segments rather than everything after the gap." },
    { term: "BDP (Bandwidth-Delay Product)", definition: "The product of a link's bandwidth and its round-trip time, representing the maximum amount of data that can be in transit at any moment. TCP buffers must be at least BDP bytes to fully utilize the link." },
    { term: "Nagle's Algorithm", definition: "A TCP optimization (RFC 896) that buffers small outgoing segments, sending them only when either a full MSS has accumulated or the previous segment has been acknowledged. Disabled with the TCP_NODELAY socket option." },
    { term: "SYN Flood", definition: "A denial-of-service attack where the attacker sends many SYN segments with spoofed source addresses, causing the server to allocate TCBs for half-open connections that will never complete. SYN cookies defend against this by encoding state in the ISN." },
    { term: "Head-of-Line (HOL) Blocking", definition: "A performance issue where a lost or delayed packet at the front of a queue blocks all subsequent packets from being delivered, even if they have arrived. Present in TCP (byte stream ordering) and HTTP/2 over TCP, but eliminated in QUIC's independent streams." },
    { term: "QUIC", definition: "A modern transport protocol (RFC 9000) running over UDP that provides reliable, encrypted, multiplexed transport with independent streams, integrated TLS 1.3, connection migration, and user-space congestion control. Used by HTTP/3." },
    { term: "TCB (Transmission Control Block)", definition: "The data structure maintained by the OS for each TCP connection, containing the connection's state: sequence numbers, window sizes, timers, buffer pointers, and socket addresses. Allocated on SYN receipt, freed after TIME_WAIT expires." },
  ],
};
