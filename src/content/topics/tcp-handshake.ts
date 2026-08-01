import type { TopicContent } from "../types";

export const tcpHandshake: TopicContent = {
  quickSummary: [
    "The TCP three-way handshake (SYN, SYN-ACK, ACK) is the connection-establishment procedure that synchronizes sequence numbers between a client and server before any application data flows, guaranteeing reliable, ordered, full-duplex communication.",
    "Each side selects an Initial Sequence Number (ISN) and the handshake ensures both peers acknowledge each other's ISN, establishing a shared state that underpins TCP's reliability guarantees — retransmission, duplicate detection, and in-order delivery.",
    "The handshake transitions both endpoints through well-defined TCP states (CLOSED -> SYN_SENT -> ESTABLISHED for the client; CLOSED -> LISTEN -> SYN_RECEIVED -> ESTABLISHED for the server) and negotiates connection parameters like Maximum Segment Size (MSS) and window scale.",
    "The three-way handshake is vulnerable to SYN flood attacks (half-open connection exhaustion), mitigated by SYN cookies, SYN proxies, and rate limiting — understanding the handshake is essential for both networking fundamentals and security.",
  ],
  detailed: [
    "Step 1 — SYN (Synchronize): The client initiates a connection by sending a TCP segment with the SYN flag set. This segment contains the client's Initial Sequence Number (ISN), say x. The ISN is a 32-bit number that serves as the starting point for numbering all bytes the client will send. The client transitions from the CLOSED state to SYN_SENT. The SYN segment also carries options like MSS (Maximum Segment Size, typically 1460 bytes on Ethernet), window scale factor, SACK permitted, and timestamps — these are negotiated during the handshake and cannot be changed later.",
    "Step 2 — SYN-ACK (Synchronize-Acknowledge): The server, which has been in LISTEN state (via a passive open), receives the SYN and responds with a segment that has both SYN and ACK flags set. The server's ISN is set to y, and the acknowledgment number is set to x+1 (the client's ISN plus one), indicating the server has received the client's SYN and expects the next byte to be numbered x+1. The server transitions to SYN_RECEIVED. This single segment serves dual purposes: it synchronizes the server's sequence number with the client and acknowledges the client's SYN.",
    "Step 3 — ACK (Acknowledge): The client receives the SYN-ACK and sends back an ACK segment with the acknowledgment number set to y+1 (the server's ISN plus one). The sequence number on this ACK is x+1. The client transitions to ESTABLISHED. When the server receives this ACK, it also transitions to ESTABLISHED. At this point, the connection is fully open and both sides can send data. Notably, this third ACK can carry application data (piggybacked), though many implementations send an empty ACK.",
    "Sequence numbers are fundamental to TCP's reliability. Each byte of data is assigned a sequential number starting from the ISN. The receiver uses acknowledgment numbers to confirm which bytes have been received. If the sender doesn't receive an ACK within a timeout (Retransmission Timeout, RTO), it retransmits the data. The handshake establishes the baseline for this entire mechanism — without synchronized ISNs, neither side could properly track or acknowledge data.",
    "The handshake also establishes the receive window size for flow control. Each side advertises how many bytes it is willing to buffer (the window size field, up to 65,535 bytes without window scaling, or up to ~1 GB with the window scale option negotiated during the handshake). This prevents a fast sender from overwhelming a slow receiver. The MSS option, exchanged only during the handshake, tells each side the largest segment it can receive, avoiding IP fragmentation and improving throughput.",
  ],
  deepDive: [
    "ISN Selection and Security: The Initial Sequence Number must not be predictable. Early TCP implementations used a simple incrementing counter (ISN incremented by 128,000 every second and 64,000 for each new connection), making TCP sequence prediction attacks trivial — an attacker could guess the next ISN and inject spoofed segments into a connection. Modern implementations use RFC 6528's algorithm: ISN = M + F(local_ip, local_port, remote_ip, remote_port, secret_key), where M is a 4-microsecond timer and F is a cryptographic hash (MD5 or SHA-256). This makes ISNs unpredictable to off-path attackers while remaining deterministic for the host, preventing the birthday-problem collision issues that pure random selection would cause.",
    "SYN Cookies: When a server receives a SYN, it normally allocates a Transmission Control Block (TCB) to track the half-open connection and places it in the SYN queue (backlog). A SYN flood attack sends thousands of SYN segments from spoofed IP addresses, filling this queue and preventing legitimate connections. SYN cookies (invented by Daniel J. Bernstein) eliminate the need to store state for half-open connections. Instead of allocating a TCB, the server encodes the connection state (MSS, timestamp, a hash of the addresses/ports and a secret) into the ISN of the SYN-ACK. When the client's ACK arrives, the server reconstructs the connection state from the acknowledgment number (which is the SYN cookie + 1). The trade-off: SYN cookies disable TCP options that require remembering state from the SYN (like window scaling and SACK), though modern implementations use timestamp-based encoding to recover some options.",
    "TCP State Machine — Connection and Termination: The full TCP state machine has 11 states. During connection establishment: CLOSED -> (active open, send SYN) -> SYN_SENT -> (receive SYN-ACK, send ACK) -> ESTABLISHED for the client; CLOSED -> (passive open) -> LISTEN -> (receive SYN, send SYN-ACK) -> SYN_RECEIVED -> (receive ACK) -> ESTABLISHED for the server. TCP also supports simultaneous open: if both sides send SYN at the same time, each transitions SYN_SENT -> SYN_RECEIVED -> ESTABLISHED, using a four-segment exchange instead of three. This is rare but fully specified in RFC 793.",
    "Four-Way Termination and TIME_WAIT: TCP connection teardown uses a four-way handshake because the connection is full-duplex — each direction must be closed independently. The initiator sends FIN (FIN_WAIT_1), the peer ACKs (CLOSE_WAIT), the peer sends its own FIN (LAST_ACK), and the initiator ACKs (TIME_WAIT). The TIME_WAIT state lasts 2*MSL (Maximum Segment Lifetime, typically 60 seconds total) for two critical reasons: (1) to reliably retransmit the final ACK if it's lost, and (2) to ensure old duplicate segments from the closed connection have expired before a new connection reuses the same port tuple. On busy servers (load balancers, proxies), TIME_WAIT accumulation can exhaust ephemeral ports — mitigated with SO_REUSEADDR, SO_REUSEPORT, tcp_tw_reuse, and tcp_tw_recycle (the last is deprecated due to NAT issues).",
    "SYN Flood Attacks and Defenses: Beyond SYN cookies, modern defenses include: (1) SYN proxies/firewalls that complete the handshake on behalf of the server and only forward established connections, (2) increasing the backlog queue size (tcp_max_syn_backlog), (3) reducing the SYN-ACK retry count (tcp_synack_retries), (4) rate limiting SYN segments per source IP using iptables/nftables, and (5) network-level filtering with BCP38 (ingress filtering) to prevent IP spoofing. Cloud providers also use Anycast and scrubbing centers to absorb volumetric SYN floods. TCP Fast Open (TFO, RFC 7413) allows data in the SYN segment for repeat connections using a cached cookie, reducing latency by one RTT but introducing new security considerations around replay attacks of the TFO data.",
  ],
  code: [
    {
      language: "bash",
      caption:
        "Capturing and analyzing a TCP three-way handshake with tcpdump",
      source: `# Capture TCP handshake packets on port 443
sudo tcpdump -i eth0 -nn -S 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0' \\
  and port 443 -c 10

# Example output of a three-way handshake:
# 14:23:01.000001 IP 192.168.1.10.54321 > 93.184.216.34.443:
#   Flags [S], seq 1234567890, win 65535, options [mss 1460,sackOK,
#   TS val 123456 ecr 0, nop, wscale 7], length 0
#
# 14:23:01.025000 IP 93.184.216.34.443 > 192.168.1.10.54321:
#   Flags [S.], seq 987654321, ack 1234567891, win 65535,
#   options [mss 1460,sackOK, TS val 789012 ecr 123456,
#   nop, wscale 7], length 0
#
# 14:23:01.025100 IP 192.168.1.10.54321 > 93.184.216.34.443:
#   Flags [.], seq 1234567891, ack 987654322, win 512, length 0
#
# Reading the output:
#   [S]  = SYN flag set (step 1: client initiates)
#   [S.] = SYN + ACK flags set (step 2: server responds)
#   [.]  = ACK flag only (step 3: client confirms)
#   seq  = sequence number (absolute with -S flag)
#   ack  = acknowledgment number (peer's seq + 1)
#   win  = receive window size (flow control)
#   mss  = maximum segment size (1460 = 1500 MTU - 20 IP - 20 TCP)
#   wscale 7 = window scale factor (actual window = win * 2^7)

# Verify connection states with ss (modern netstat)
ss -tn state syn-sent
ss -tn state syn-recv
ss -tn state established`,
    },
    {
      language: "cpp",
      caption:
        "TCP client/server demonstrating the handshake with POSIX sockets in C++",
      source: `#include <iostream>
#include <cstring>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <unistd.h>

// Server side: passive open (LISTEN -> SYN_RECEIVED -> ESTABLISHED)
void tcp_server(const char* host = "127.0.0.1", int port = 9999) {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // bind() associates the socket with an address
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);
    bind(server_fd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));

    // listen(backlog) transitions socket to LISTEN state
    // backlog = max number of half-open connections (SYN queue size)
    listen(server_fd, 5);
    std::cout << "[SERVER] Listening on " << host << ":" << port
              << " (state: LISTEN)\\n";

    // accept() blocks until a client completes the 3-way handshake
    // Internally: receive SYN -> send SYN-ACK -> receive ACK
    // Returns only AFTER the connection is ESTABLISHED
    sockaddr_in client_addr{};
    socklen_t client_len = sizeof(client_addr);
    int conn = accept(server_fd, reinterpret_cast<sockaddr*>(&client_addr), &client_len);
    std::cout << "[SERVER] Connection established (state: ESTABLISHED)\\n";

    char buf[1024]{};
    ssize_t n = recv(conn, buf, sizeof(buf), 0);
    std::cout << "[SERVER] Received: " << std::string(buf, n) << "\\n";

    const char* reply = "Hello from server!";
    send(conn, reply, strlen(reply), 0);

    // close() initiates four-way termination (FIN handshake)
    close(conn);
    close(server_fd);
}

// Client side: active open (SYN_SENT -> ESTABLISHED)
void tcp_client(const char* host = "127.0.0.1", int port = 9999) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);

    // Set TCP_NODELAY to disable Nagle's algorithm (send immediately)
    int flag = 1;
    setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));

    // connect() triggers the three-way handshake:
    //   1. Kernel sends SYN with client ISN (state -> SYN_SENT)
    //   2. Kernel receives SYN-ACK from server
    //   3. Kernel sends ACK (state -> ESTABLISHED)
    // connect() returns only after ESTABLISHED
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, host, &addr.sin_addr);

    std::cout << "[CLIENT] Initiating connection (sending SYN)...\\n";
    connect(sock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));
    std::cout << "[CLIENT] Connection established (state: ESTABLISHED)\\n";

    const char* msg = "Hello from client!";
    send(sock, msg, strlen(msg), 0);

    char buf[1024]{};
    ssize_t n = recv(sock, buf, sizeof(buf), 0);
    std::cout << "[CLIENT] Received: " << std::string(buf, n) << "\\n";

    // close() sends FIN to initiate graceful shutdown
    close(sock);
}

// Run server in background, then connect with client
int main() {
    std::thread server_thread(tcp_server, "127.0.0.1", 9999);
    server_thread.detach();

    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    tcp_client();
}`,
    },
    {
      language: "cpp",
      caption:
        "Crafting and inspecting a raw SYN packet with raw sockets in C++ for handshake analysis",
      source: `#include <iostream>
#include <cstring>
#include <cstdint>
#include <sys/socket.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <unistd.h>

// Pseudo-header for TCP checksum calculation
struct PseudoHeader {
    uint32_t src_addr;
    uint32_t dst_addr;
    uint8_t  placeholder;
    uint8_t  protocol;
    uint16_t tcp_length;
};

uint16_t checksum(const void* data, int len) {
    auto* ptr = static_cast<const uint16_t*>(data);
    uint32_t sum = 0;
    for (; len > 1; len -= 2) sum += *ptr++;
    if (len == 1) sum += *reinterpret_cast<const uint8_t*>(ptr);
    sum = (sum >> 16) + (sum & 0xFFFF);
    sum += (sum >> 16);
    return static_cast<uint16_t>(~sum);
}

int main() {
    const char* target_ip = "93.184.216.34";
    int target_port = 80;
    uint16_t src_port = 54321;      // ephemeral port
    uint32_t our_isn  = 1000;       // our Initial Sequence Number

    // Create a raw socket (requires root/CAP_NET_RAW)
    int sock = socket(AF_INET, SOCK_RAW, IPPROTO_TCP);
    if (sock < 0) { perror("socket"); return 1; }

    // Tell the kernel we provide our own IP header
    int one = 1;
    setsockopt(sock, IPPROTO_IP, IP_HDRINCL, &one, sizeof(one));

    // Build the packet buffer (IP header + TCP header)
    char packet[4096]{};
    auto* iph = reinterpret_cast<struct iphdr*>(packet);
    auto* tcph = reinterpret_cast<struct tcphdr*>(packet + sizeof(struct iphdr));

    // IP header
    iph->ihl     = 5;
    iph->version = 4;
    iph->tot_len = htons(sizeof(struct iphdr) + sizeof(struct tcphdr));
    iph->id      = htons(54321);
    iph->ttl     = 64;
    iph->protocol = IPPROTO_TCP;
    iph->saddr   = inet_addr("0.0.0.0");  // kernel fills source IP
    iph->daddr   = inet_addr(target_ip);

    // TCP header with SYN flag
    //   sport: ephemeral port
    //   dport: target port
    //   flags: SYN
    //   seq:   our Initial Sequence Number
    tcph->source  = htons(src_port);
    tcph->dest    = htons(target_port);
    tcph->seq     = htonl(our_isn);
    tcph->ack_seq = 0;
    tcph->doff    = 5;              // header length in 32-bit words
    tcph->syn     = 1;              // SYN flag set
    tcph->window  = htons(65535);

    // Compute TCP checksum using pseudo-header
    PseudoHeader psh{};
    psh.src_addr   = iph->saddr;
    psh.dst_addr   = iph->daddr;
    psh.protocol   = IPPROTO_TCP;
    psh.tcp_length = htons(sizeof(struct tcphdr));

    char csum_buf[sizeof(PseudoHeader) + sizeof(struct tcphdr)];
    std::memcpy(csum_buf, &psh, sizeof(psh));
    std::memcpy(csum_buf + sizeof(psh), tcph, sizeof(struct tcphdr));
    tcph->check = checksum(csum_buf, sizeof(csum_buf));

    // Send SYN packet (step 1 of the handshake)
    sockaddr_in dest{};
    dest.sin_family = AF_INET;
    dest.sin_port   = htons(target_port);
    inet_pton(AF_INET, target_ip, &dest.sin_addr);

    std::cout << "[*] Sending SYN packet...\\n";
    sendto(sock, packet, ntohs(iph->tot_len), 0,
           reinterpret_cast<sockaddr*>(&dest), sizeof(dest));

    // Receive SYN-ACK (step 2)
    char recv_buf[4096]{};
    ssize_t n = recv(sock, recv_buf, sizeof(recv_buf), 0);
    if (n > 0) {
        auto* resp_ip  = reinterpret_cast<struct iphdr*>(recv_buf);
        auto* resp_tcp = reinterpret_cast<struct tcphdr*>(recv_buf + resp_ip->ihl * 4);

        if (resp_tcp->syn && resp_tcp->ack) {
            std::cout << "[+] Received SYN-ACK:\\n";
            std::cout << "    Server ISN (seq): " << ntohl(resp_tcp->seq) << "\\n";
            std::cout << "    Ack number:       " << ntohl(resp_tcp->ack_seq)
                      << " (our ISN + 1 = " << our_isn + 1 << ")\\n";
            std::cout << "    Window size:      " << ntohs(resp_tcp->window) << "\\n";
        } else if (resp_tcp->rst) {
            std::cout << "[-] Port closed (RST received)\\n";
        }
    } else {
        std::cout << "[-] No response (filtered or host unreachable)\\n";
    }

    close(sock);
}`,
    },
  ],
  diagrams: [
    {
      title: "TCP Three-Way Handshake",
      kind: "sequence",
      caption: "SYN, SYN-ACK, and ACK exchange that establishes a TCP connection between client and server.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C: CLOSED
    Note over S: LISTEN
    C->>S: SYN seq=x
    Note over C: SYN_SENT
    S-->>C: SYN-ACK seq=y ack=x+1
    Note over S: SYN_RECEIVED
    C->>S: ACK ack=y+1
    Note over C: ESTABLISHED
    Note over S: ESTABLISHED`,
    },
    {
      title: "TCP Connection State Machine",
      kind: "state",
      caption: "Full TCP connection lifecycle from CLOSED through handshake, data transfer, to termination.",
      mermaid: `stateDiagram-v2
    [*] --> CLOSED
    CLOSED --> LISTEN : passive open
    CLOSED --> SYN_SENT : active open - send SYN
    LISTEN --> SYN_RECEIVED : receive SYN - send SYN-ACK
    SYN_SENT --> ESTABLISHED : receive SYN-ACK - send ACK
    SYN_RECEIVED --> ESTABLISHED : receive ACK
    ESTABLISHED --> FIN_WAIT_1 : close - send FIN
    FIN_WAIT_1 --> FIN_WAIT_2 : receive ACK
    FIN_WAIT_2 --> TIME_WAIT : receive FIN - send ACK
    TIME_WAIT --> CLOSED : timeout 2MSL`,
    },
    {
      title: "TCP Four-Way Termination",
      kind: "sequence",
      caption: "FIN and ACK exchange that gracefully closes a TCP connection in both directions.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: FIN
    Note over C: FIN_WAIT_1
    S-->>C: ACK
    Note over C: FIN_WAIT_2
    Note over S: CLOSE_WAIT
    S->>C: FIN
    Note over S: LAST_ACK
    C-->>S: ACK
    Note over C: TIME_WAIT
    Note over S: CLOSED`,
    },
    {
      title: "TCP vs UDP at a Glance",
      kind: "mindmap",
      caption: "Key characteristics contrasting TCP reliable ordered delivery with UDP lightweight datagrams.",
      mermaid: `mindmap
  root((Transport Layer))
    TCP
      Connection-oriented
      Three-way handshake
      Reliable delivery
      Ordered segments
      Flow control
      Congestion control
    UDP
      Connectionless
      No handshake
      Best-effort
      Unordered datagrams
      Low overhead
      Real-time use cases`,
    },
  ],
  animations: [
    {
      title: "TCP Three-Way Handshake Step-by-Step",
      steps: [
        {
          label: "Client: Active Open",
          detail:
            "The client application calls connect(). The kernel selects an ephemeral port (49152-65535), generates an ISN using a cryptographic algorithm, and constructs a SYN segment with the ISN as the sequence number. TCP options (MSS, window scale, SACK, timestamps) are included. The client socket transitions from CLOSED to SYN_SENT.",
        },
        {
          label: "SYN Segment in Flight",
          detail:
            "The SYN segment travels through the network. It has the SYN flag bit set in the TCP header (bit 1 of the 6 control bits). The segment carries no payload data but the SYN itself consumes one sequence number — this is why the ACK number will be ISN+1, not ISN.",
        },
        {
          label: "Server: Receive SYN",
          detail:
            "The server's kernel receives the SYN on a socket in LISTEN state. It validates the segment (checksum, destination port has a listener). It allocates a Transmission Control Block (TCB) entry in the SYN queue (backlog), recording the client's ISN and options. The server transitions to SYN_RECEIVED.",
        },
        {
          label: "Server: Send SYN-ACK",
          detail:
            "The server generates its own ISN and sends a segment with both SYN and ACK flags set. The sequence number is the server's ISN (y). The acknowledgment number is client_ISN+1 (x+1), confirming receipt of the client's SYN. The server includes its own TCP options (MSS, window scale).",
        },
        {
          label: "Client: Receive SYN-ACK",
          detail:
            "The client kernel receives the SYN-ACK, validates it matches the outstanding SYN (correct ack number = client_ISN+1). It records the server's ISN and negotiated options. The client transitions from SYN_SENT to ESTABLISHED. The connect() call is now almost ready to return.",
        },
        {
          label: "Client: Send ACK",
          detail:
            "The client sends an ACK segment with sequence number x+1 and acknowledgment number y+1 (server_ISN+1). This segment can optionally carry application data (piggybacking). The client's connect() call returns successfully.",
        },
        {
          label: "Server: Receive ACK — Connection Established",
          detail:
            "The server receives the ACK, removes the entry from the SYN queue, creates a fully established connection socket, and places it on the accept queue. The server transitions to ESTABLISHED. The server's accept() call returns with the new connected socket. Both sides can now send and receive data.",
        },
      ],
    },
    {
      title: "TCP Four-Way Termination",
      steps: [
        {
          label: "Initiator: Send FIN",
          detail:
            "The application calls close(). The kernel sends a FIN segment indicating no more data will be sent from this side. The socket transitions from ESTABLISHED to FIN_WAIT_1. Like SYN, the FIN consumes one sequence number.",
        },
        {
          label: "Peer: ACK the FIN",
          detail:
            "The receiving side acknowledges the FIN with an ACK. The initiator transitions to FIN_WAIT_2. The peer transitions to CLOSE_WAIT. The connection is now half-closed — the peer can still send data.",
        },
        {
          label: "Peer: Send its own FIN",
          detail:
            "When the peer's application also calls close(), the kernel sends a FIN segment. The peer transitions from CLOSE_WAIT to LAST_ACK.",
        },
        {
          label: "Initiator: Final ACK and TIME_WAIT",
          detail:
            "The initiator ACKs the peer's FIN and enters TIME_WAIT for 2*MSL (typically 60 seconds). This ensures the final ACK is delivered reliably and prevents old segments from a prior connection from being misinterpreted on a new connection using the same port tuple.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "TCP State",
      "Side",
      "Trigger",
      "Action Taken",
      "Next State",
    ],
    rows: [
      [
        "CLOSED",
        "Client",
        "Application calls connect()",
        "Send SYN with client ISN",
        "SYN_SENT",
      ],
      [
        "LISTEN",
        "Server",
        "Application calls listen()",
        "Wait for incoming SYN",
        "LISTEN",
      ],
      [
        "LISTEN",
        "Server",
        "Receive SYN from client",
        "Send SYN-ACK with server ISN, ack client ISN+1",
        "SYN_RECEIVED",
      ],
      [
        "SYN_SENT",
        "Client",
        "Receive SYN-ACK from server",
        "Send ACK with ack server ISN+1",
        "ESTABLISHED",
      ],
      [
        "SYN_RECEIVED",
        "Server",
        "Receive ACK from client",
        "Move connection to accept queue",
        "ESTABLISHED",
      ],
      [
        "ESTABLISHED",
        "Either",
        "Application calls close()",
        "Send FIN segment",
        "FIN_WAIT_1",
      ],
      [
        "ESTABLISHED",
        "Either",
        "Receive FIN from peer",
        "Send ACK for the FIN",
        "CLOSE_WAIT",
      ],
      [
        "FIN_WAIT_1",
        "Initiator",
        "Receive ACK for FIN",
        "Wait for peer's FIN",
        "FIN_WAIT_2",
      ],
      [
        "FIN_WAIT_2",
        "Initiator",
        "Receive FIN from peer",
        "Send ACK, start 2*MSL timer",
        "TIME_WAIT",
      ],
      [
        "TIME_WAIT",
        "Initiator",
        "2*MSL timer expires",
        "Release connection resources",
        "CLOSED",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Why does TCP use a three-way handshake instead of a two-way handshake?",
      a: "A two-way handshake would only confirm that the client can reach the server and the server can reach the client. It would not confirm that the client received the server's Initial Sequence Number (ISN). Without the third ACK, the server would have no assurance that the client is ready to receive data starting from the server's ISN. Additionally, a two-way handshake cannot prevent stale duplicate SYN segments from opening ghost connections — if an old SYN arrives at the server, it would allocate resources for a connection the client never intended. The three-way handshake ensures both sides have synchronized sequence numbers and agree that the connection is live.",
      followUps: [
        "What is the simultaneous open scenario, and how does it differ from the standard handshake?",
        "How does TCP Fast Open reduce the handshake to effectively two messages for repeat connections?",
      ],
    },
    {
      q: "What is a SYN flood attack and how do SYN cookies defend against it?",
      a: "A SYN flood attack exploits the three-way handshake by sending a high volume of SYN segments, typically with spoofed source IP addresses. Each SYN causes the server to allocate a Transmission Control Block (TCB) in its SYN backlog queue and send a SYN-ACK. Since the source IPs are fake, no ACK ever arrives — the half-open connections accumulate until the backlog is full, and the server can no longer accept legitimate connections. SYN cookies defend against this by eliminating server-side state for half-open connections. Instead of storing the connection parameters in a TCB, the server encodes them (MSS, a timestamp, and a cryptographic hash of the connection tuple and a secret) into the Initial Sequence Number of the SYN-ACK. When a legitimate client returns the ACK, the server extracts and validates the encoded state from the acknowledgment number (SYN cookie + 1), reconstructing the connection without ever having stored it.",
      followUps: [
        "What TCP options are lost when SYN cookies are active?",
        "How does a SYN proxy differ from SYN cookies?",
        "What is the role of BCP38 in preventing SYN floods?",
      ],
    },
    {
      q: "Why does the TIME_WAIT state last for 2*MSL, and what problems does it cause on high-traffic servers?",
      a: "TIME_WAIT lasts 2*MSL (Maximum Segment Lifetime, typically 30 seconds per MSL, so 60 seconds total) for two reasons: (1) If the final ACK is lost, the peer will retransmit its FIN; the initiator must remain in TIME_WAIT to re-send the ACK. One MSL covers the ACK's travel time and one MSL covers the retransmitted FIN. (2) It ensures that all segments from the old connection have been flushed from the network before the same four-tuple (source IP, source port, dest IP, dest port) can be reused, preventing data corruption from old segments being delivered to a new connection. On high-traffic servers (reverse proxies, load balancers), thousands of TIME_WAIT sockets can accumulate, exhausting ephemeral ports. Mitigations include SO_REUSEADDR (allows binding to a port in TIME_WAIT), tcp_tw_reuse (allows reusing TIME_WAIT sockets for outbound connections if timestamps confirm safety), increasing the ephemeral port range, and using connection pooling (HTTP keep-alive) to avoid frequent teardowns.",
      followUps: [
        "Why was tcp_tw_recycle removed from Linux?",
        "How do HTTP keep-alive connections reduce TIME_WAIT accumulation?",
      ],
    },
    {
      q: "How are Initial Sequence Numbers (ISNs) chosen, and why does it matter?",
      a: "Modern TCP implementations select ISNs using the algorithm from RFC 6528: ISN = M + F(local_ip, local_port, remote_ip, remote_port, secret_key), where M is a monotonically increasing timer (incremented every 4 microseconds) and F is a cryptographic PRF (typically MD5 or HMAC-SHA256). The timer component ensures ISNs from the same host don't wrap around and collide during a connection's lifetime (the 32-bit sequence space wraps every ~4.55 hours at 1 Gbps). The cryptographic component ensures ISNs are unpredictable to off-path attackers. Predictable ISNs (as in early implementations that used a simple global counter) enable TCP sequence prediction attacks: an attacker guesses the server's ISN in a spoofed connection and injects data (e.g., injecting commands into an rsh session). The Mitnick attack of 1994 famously exploited predictable ISNs.",
      followUps: [
        "What is the PAWS (Protection Against Wrapped Sequence numbers) mechanism?",
        "How does the TCP timestamp option help with ISN-related issues?",
      ],
    },
    {
      q: "What happens during a simultaneous open in TCP?",
      a: "A simultaneous open occurs when both peers send SYN segments to each other at the same time before either receives the other's SYN. Both sides transition from CLOSED to SYN_SENT. When each side receives the other's SYN while in SYN_SENT, they transition to SYN_RECEIVED and respond with a SYN-ACK. When each side receives the SYN-ACK, they transition to ESTABLISHED. The result is a four-segment exchange (SYN, SYN, SYN-ACK, SYN-ACK) instead of the usual three-segment handshake, but only one connection is established (not two). This is rare in practice because it requires both sides to know each other's IP and port in advance and to initiate at nearly the same time, but the TCP state machine fully supports it as specified in RFC 793.",
      followUps: [
        "How does simultaneous close differ from the standard four-way termination?",
        "In what real-world scenarios might a simultaneous open actually occur?",
      ],
    },
    {
      q: "Explain how TCP Fast Open (TFO) reduces handshake latency.",
      a: "TCP Fast Open (RFC 7413) allows data to be sent in the SYN segment of subsequent connections to the same server, saving one full round-trip time (RTT). On the first connection, the client requests a TFO cookie by including an empty TCP Fast Open option in its SYN. The server generates a cookie (an encrypted or MACed value derived from the client's IP address and a server secret) and returns it in the SYN-ACK. On subsequent connections, the client includes the cached cookie and application data in its SYN segment. The server validates the cookie and, if valid, passes the data to the application immediately — before the handshake completes. The server still sends a SYN-ACK and waits for the client's ACK, but the request processing has already begun. TFO is particularly beneficial for short-lived HTTP connections, reducing page load times. The security trade-off is that the data in the SYN can be replayed by a network attacker (it's delivered to the application before the handshake fully authenticates the client), so the application must be idempotent for TFO data.",
      followUps: [
        "How does TFO interact with SYN cookies?",
        "What is the difference between TFO and TCP session resumption?",
      ],
    },
  ],
  followUps: [
    "How does TLS 1.3 layer its own handshake on top of the TCP handshake, and what is 0-RTT?",
    "What is QUIC and how does it eliminate the TCP handshake entirely?",
    "How does TCP window scaling affect throughput on high-bandwidth-delay-product links?",
    "What are the differences between TCP and SCTP connection establishment?",
    "How do load balancers handle the TCP handshake — does the backend server see the original SYN?",
    "What is the relationship between the TCP handshake and NAT traversal challenges?",
  ],
  mcqs: [
    {
      q: "During the TCP three-way handshake, what flags are set in the second segment (from server to client)?",
      options: ["SYN only", "ACK only", "SYN and ACK", "FIN and ACK"],
      answerIndex: 2,
      explanation:
        "The second segment of the handshake has both SYN and ACK flags set. The SYN synchronizes the server's ISN with the client, and the ACK acknowledges the client's SYN (by setting ack = client_ISN + 1).",
    },
    {
      q: "If a client's ISN is 1000 and the server's ISN is 5000, what acknowledgment number does the client send in the third handshake segment?",
      options: ["1000", "1001", "5000", "5001"],
      answerIndex: 3,
      explanation:
        "The client acknowledges the server's SYN by setting the acknowledgment number to server_ISN + 1 = 5001. The SYN flag consumes one sequence number, so the next expected byte from the server is 5001.",
    },
    {
      q: "What is the primary purpose of the TIME_WAIT state in TCP?",
      options: [
        "To allow the application to finish processing buffered data",
        "To ensure old duplicate segments expire and the final ACK can be retransmitted if lost",
        "To prevent the server from accepting new connections too quickly",
        "To allow the OS to reclaim memory from the closed socket",
      ],
      answerIndex: 1,
      explanation:
        "TIME_WAIT serves two purposes: (1) ensuring old segments from this connection expire (preventing data corruption on a new connection reusing the same four-tuple), and (2) allowing the final ACK to be retransmitted if the peer's FIN is resent.",
    },
    {
      q: "How do SYN cookies prevent SYN flood attacks?",
      options: [
        "By dropping all SYN packets when the backlog is full",
        "By encoding connection state in the server's ISN instead of allocating a backlog entry",
        "By requiring clients to solve a computational puzzle before connecting",
        "By limiting each IP address to one SYN per second",
      ],
      answerIndex: 1,
      explanation:
        "SYN cookies encode the connection parameters (MSS, timestamp, hash of addresses/ports/secret) into the ISN of the SYN-ACK. When the client returns the ACK, the server reconstructs state from ack-1, eliminating the need for SYN queue storage.",
    },
    {
      q: "Why can't TCP use a two-way handshake (SYN, SYN-ACK) to establish a connection?",
      options: [
        "Because the server needs to allocate more memory",
        "Because the client would not have confirmed receipt of the server's ISN, and stale SYNs could open ghost connections",
        "Because two-way handshakes are only supported in UDP",
        "Because the firewall requires three packets to identify a TCP connection",
      ],
      answerIndex: 1,
      explanation:
        "Without the third ACK, the server cannot confirm the client received its ISN. Also, a stale duplicate SYN (from a previous attempt) could cause the server to open a connection the client never intended, wasting resources.",
    },
    {
      q: "What Linux kernel parameter controls the maximum number of half-open connections in the SYN backlog?",
      options: [
        "net.core.somaxconn",
        "net.ipv4.tcp_max_syn_backlog",
        "net.ipv4.tcp_fin_timeout",
        "net.ipv4.ip_local_port_range",
      ],
      answerIndex: 1,
      explanation:
        "tcp_max_syn_backlog controls the size of the SYN queue (half-open connections). somaxconn controls the accept queue (fully established connections waiting for accept()). tcp_fin_timeout controls how long FIN_WAIT_2 lasts.",
    },
    {
      q: "In TCP Fast Open (TFO), when can the client send data in the SYN segment?",
      options: [
        "On every connection attempt",
        "Only on the first connection to a server",
        "On subsequent connections after obtaining a TFO cookie from the server",
        "Only when the server has SYN cookies enabled",
      ],
      answerIndex: 2,
      explanation:
        "TFO requires a two-phase process: on the first connection, the client requests and caches a TFO cookie from the server. On subsequent connections, the client includes the cookie and application data in its SYN segment.",
    },
  ],
  exercises: [
    "Use tcpdump or Wireshark to capture a real TCP handshake to a website. Identify the ISNs, MSS values, window scale factors, and calculate the actual receive window size for each side.",
    "Write a program that creates 1000 TCP connections to a local server, closes them immediately, and then counts TIME_WAIT sockets using 'ss -s'. Experiment with SO_LINGER to observe the effect on TIME_WAIT accumulation.",
    "Implement a basic TCP state machine in your language of choice that transitions through CLOSED -> SYN_SENT -> ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED, validating that only legal transitions are allowed.",
    "Use Scapy or a raw socket library to craft a SYN packet with custom TCP options (MSS, window scale, timestamps, SACK). Send it to a local server and parse the SYN-ACK response to verify the negotiated options.",
    "Set up a test environment where you simulate a SYN flood attack (against your own server only) and measure how many half-open connections fill the backlog. Then enable SYN cookies (sysctl net.ipv4.tcp_syncookies=1) and observe the difference in behavior.",
    "Write a concurrent TCP server that logs the time difference between receiving the SYN (connection arrival) and the application calling accept(). Measure how the accept queue depth and listen backlog affect this latency under load.",
  ],
  flashcards: [
    {
      front: "What are the three segments of the TCP handshake and their flags?",
      back: "1) SYN (client to server, SYN flag set, carries client ISN). 2) SYN-ACK (server to client, SYN+ACK flags set, carries server ISN and acks client ISN+1). 3) ACK (client to server, ACK flag set, acks server ISN+1). Connection is ESTABLISHED after all three complete.",
    },
    {
      front: "Why does a SYN consume one sequence number even though it carries no data?",
      back: "The SYN (and FIN) flags are designed to be reliably delivered, so they must be acknowledgeable. Consuming a sequence number allows the receiver to ACK the SYN with ISN+1, confirming its receipt. If the SYN didn't consume a sequence number, there would be no way to distinguish an ACK for the SYN from an ACK for the first data byte.",
    },
    {
      front: "What is a Transmission Control Block (TCB)?",
      back: "A TCB is the kernel data structure that stores all state for a TCP connection: local/remote IP and port, sequence numbers, window sizes, timers (retransmission, keepalive, TIME_WAIT), congestion control variables, and buffer pointers. A TCB is allocated during the handshake and freed after the connection fully closes (after TIME_WAIT expires).",
    },
    {
      front: "What is the difference between the SYN queue and the accept queue?",
      back: "The SYN queue (syn backlog) holds half-open connections — connections that have received a SYN and sent a SYN-ACK but not yet received the final ACK. The accept queue (listen backlog, controlled by somaxconn) holds fully established connections waiting for the application to call accept(). SYN floods target the SYN queue; a slow application drains the accept queue.",
    },
    {
      front: "How does the TCP window scale option work?",
      back: "The standard TCP window size field is 16 bits, limiting the receive window to 65,535 bytes. The window scale option, negotiated during the handshake, specifies a shift count (0-14) applied to the window field. The actual window = advertised_window * 2^scale. With scale=7, the window can be up to 65,535 * 128 = ~8 MB. This is critical for high-bandwidth, high-latency links (large BDP).",
    },
    {
      front: "What is Maximum Segment Size (MSS) and when is it negotiated?",
      back: "MSS specifies the largest amount of TCP payload data a host is willing to receive in a single segment. It is announced as a TCP option only during the SYN and SYN-ACK (handshake). Typical MSS on Ethernet is 1460 bytes (1500 byte MTU minus 20 bytes IP header minus 20 bytes TCP header). MSS is unidirectional — each side can announce a different value.",
    },
    {
      front: "What is the purpose of RFC 6528 for ISN generation?",
      back: "RFC 6528 specifies a secure ISN generation algorithm: ISN = M + F(local_ip, local_port, remote_ip, remote_port, secret_key), where M is a 4-microsecond timer and F is a cryptographic PRF. This prevents off-path attackers from predicting ISNs (blocking sequence prediction attacks) while ensuring ISNs don't collide for the same connection tuple.",
    },
    {
      front:
        "What is the PAWS mechanism and how does it relate to sequence numbers?",
      back: "Protection Against Wrapped Sequence numbers (PAWS, RFC 7323) uses TCP timestamps to reject old duplicate segments whose sequence numbers have wrapped around. On high-speed links (10 Gbps+), the 32-bit sequence space can wrap in seconds. PAWS checks that each segment's timestamp is non-decreasing; if a segment has an older timestamp than the last one received, it's a duplicate from a previous wrap and is discarded.",
    },
    {
      front: "What happens if the final ACK of the three-way handshake is lost?",
      back: "If the server's SYN_RECEIVED state doesn't receive the ACK within a timeout, it retransmits the SYN-ACK (controlled by tcp_synack_retries, typically 5 retries with exponential backoff). The client, already in ESTABLISHED state, may start sending data. The server will accept the data segment as an implicit ACK of the SYN-ACK and transition to ESTABLISHED, since any valid segment from the client proves it received the SYN-ACK.",
    },
    {
      front: "How does TCP Fast Open save one RTT?",
      back: "On a first connection, the client requests a TFO cookie. On subsequent connections, the client sends the cookie plus request data in the SYN itself. The server validates the cookie and delivers the data to the application immediately (before the handshake completes), then sends its response in the SYN-ACK. The client can receive the response after just one RTT instead of the usual handshake RTT + request RTT = 2 RTTs.",
    },
  ],
  revisionNotes: [
    "The TCP three-way handshake consists of SYN (client ISN=x), SYN-ACK (server ISN=y, ack=x+1), and ACK (ack=y+1). Both SYN and FIN consume one sequence number.",
    "The handshake synchronizes Initial Sequence Numbers (ISNs) between client and server, establishing the baseline for reliable, ordered byte-stream delivery.",
    "TCP options (MSS, window scale, SACK, timestamps) can only be negotiated during the SYN and SYN-ACK exchange; they cannot be changed after the connection is established.",
    "The SYN queue holds half-open connections (SYN received, SYN-ACK sent, awaiting ACK). The accept queue holds completed connections awaiting accept(). They are sized independently.",
    "Modern ISN generation uses a cryptographic PRF plus a timer (RFC 6528) to prevent sequence prediction attacks while avoiding collisions.",
    "SYN cookies encode connection state in the ISN of the SYN-ACK, eliminating the need for SYN queue storage and defending against SYN flood attacks at the cost of some TCP options.",
    "TIME_WAIT lasts 2*MSL (typically 60s) to ensure old segments expire and the final ACK can be retransmitted. Mitigate accumulation with SO_REUSEADDR, tcp_tw_reuse, and connection pooling.",
    "TCP Fast Open (TFO) allows data in the SYN on repeat connections using a cached cookie, saving one RTT. The trade-off is replay vulnerability of the SYN data.",
    "TCP termination is a four-way handshake (FIN, ACK, FIN, ACK) because the connection is full-duplex and each direction closes independently.",
    "The TCP state machine has 11 states. Key transitions: CLOSED->SYN_SENT->ESTABLISHED (active open), LISTEN->SYN_RECEIVED->ESTABLISHED (passive open), ESTABLISHED->FIN_WAIT_1->FIN_WAIT_2->TIME_WAIT->CLOSED (active close).",
  ],
  cheatSheet: [
    "SYN: client -> server | seq=x | flags=[SYN] | client state: CLOSED -> SYN_SENT",
    "SYN-ACK: server -> client | seq=y, ack=x+1 | flags=[SYN,ACK] | server state: LISTEN -> SYN_RECEIVED",
    "ACK: client -> server | seq=x+1, ack=y+1 | flags=[ACK] | both states: ESTABLISHED",
    "MSS = MTU - IP header (20) - TCP header (20) = 1460 bytes on Ethernet (MTU 1500)",
    "Window scale: actual_window = advertised_window * 2^scale_factor (max scale = 14)",
    "SYN queue = half-open connections (tcp_max_syn_backlog) | Accept queue = completed connections (somaxconn)",
    "ISN = timer_M + HMAC(src_ip, src_port, dst_ip, dst_port, secret) per RFC 6528",
    "SYN cookie = encoded(MSS_index, timestamp_bits, crypto_hash) stuffed into server ISN",
    "TIME_WAIT = 2 * MSL (typically 60s) | Mitigate: SO_REUSEADDR, tcp_tw_reuse, keep-alive",
    "TCP Fast Open: SYN+data+cookie on repeat connections saves 1 RTT",
    "Four-way close: FIN -> ACK -> FIN -> ACK | Half-close allows one-directional data flow",
    "TCP flags (6 bits): URG, ACK, PSH, RST, SYN, FIN | SYN and FIN each consume 1 seq number",
    "Check SYN queue overflow: netstat -s | grep 'SYNs to LISTEN' or nstat -az TcpExtTCPReqQFullDoCookies",
    "ss -tn state syn-recv | wc -l  -- count current half-open connections",
  ],
  resources: [
    {
      label: "RFC 793 — Transmission Control Protocol (Original Specification)",
      kind: "docs",
      note: "The foundational TCP specification defining the three-way handshake, state machine, and segment format. Dense but authoritative.",
    },
    {
      label: "RFC 6528 — Defending Against Sequence Number Attacks",
      kind: "docs",
      note: "Specifies the modern ISN generation algorithm using a cryptographic PRF to prevent sequence prediction attacks.",
    },
    {
      label: "RFC 7413 — TCP Fast Open",
      kind: "docs",
      note: "Defines the TFO mechanism for sending data in the SYN segment of repeat connections, reducing latency by one RTT.",
    },
    {
      label: "TCP/IP Illustrated, Volume 1 by W. Richard Stevens",
      kind: "book",
      note: "The classic reference for TCP internals. Chapters 18-20 cover connection establishment, termination, and the state machine in exceptional detail with real packet traces.",
    },
    {
      label: "Computer Networking: A Top-Down Approach by Kurose & Ross",
      kind: "book",
      note: "Chapter 3 covers TCP connection management with clear diagrams and the three-way handshake explained at an introductory-to-intermediate level.",
    },
    {
      label: "SYN Cookies — D.J. Bernstein (cr.yp.to/syncookies.html)",
      kind: "article",
      note: "The original description of SYN cookies by their inventor, explaining the encoding scheme and trade-offs.",
    },
    {
      label: "Beej's Guide to Network Programming",
      kind: "article",
      note: "Practical guide to socket programming in C. Covers the socket API calls (socket, bind, listen, accept, connect) that trigger the TCP handshake.",
    },
    {
      label: "Wireshark TCP Analysis Documentation",
      kind: "docs",
      note: "Explains how to use Wireshark to capture and analyze TCP handshakes, including expert info on retransmissions, zero windows, and resets.",
    },
    {
      label: "Cloudflare Blog: SYN Packet Handling in the Wild",
      kind: "article",
      note: "Deep dive into how Cloudflare handles SYN floods at scale, covering SYN cookies, SYN proxying, and kernel tuning.",
    },
  ],
  glossary: [
    {
      term: "SYN (Synchronize)",
      definition:
        "A TCP control flag used to initiate a connection. A SYN segment carries the sender's Initial Sequence Number and requests synchronization of sequence numbers between the two endpoints.",
    },
    {
      term: "ACK (Acknowledge)",
      definition:
        "A TCP control flag indicating the acknowledgment number field is valid. The acknowledgment number specifies the next sequence number the sender expects to receive from the peer.",
    },
    {
      term: "ISN (Initial Sequence Number)",
      definition:
        "The starting sequence number chosen by each side of a TCP connection during the handshake. Modern implementations use a cryptographic algorithm (RFC 6528) to make ISNs unpredictable to off-path attackers.",
    },
    {
      term: "MSS (Maximum Segment Size)",
      definition:
        "The largest amount of data (in bytes) that a TCP endpoint is willing to receive in a single segment. Negotiated via a TCP option during the SYN/SYN-ACK exchange. Typically 1460 bytes on Ethernet.",
    },
    {
      term: "TCB (Transmission Control Block)",
      definition:
        "The kernel data structure that stores all state for a TCP connection, including addresses, ports, sequence numbers, window sizes, timers, and buffer pointers.",
    },
    {
      term: "SYN Queue (SYN Backlog)",
      definition:
        "A per-listener kernel queue that holds connections in the SYN_RECEIVED state (SYN received, SYN-ACK sent, awaiting final ACK). Sized by tcp_max_syn_backlog.",
    },
    {
      term: "Accept Queue (Listen Backlog)",
      definition:
        "A per-listener kernel queue that holds fully established connections waiting for the application to call accept(). Sized by the min of the listen() backlog argument and somaxconn.",
    },
    {
      term: "TIME_WAIT",
      definition:
        "A TCP state entered by the side that initiates connection termination. Lasts 2*MSL (typically 60 seconds) to ensure old segments expire and the final ACK can be retransmitted if lost.",
    },
    {
      term: "MSL (Maximum Segment Lifetime)",
      definition:
        "The maximum time a TCP segment is assumed to survive in the network. Typically 30 seconds (Linux) or 2 minutes (RFC 793). TIME_WAIT lasts 2*MSL.",
    },
    {
      term: "SYN Cookies",
      definition:
        "A defense against SYN flood attacks where the server encodes connection state (MSS, timestamp, cryptographic hash) into the ISN of the SYN-ACK, eliminating the need to store half-open connection state in memory.",
    },
    {
      term: "TCP Fast Open (TFO)",
      definition:
        "An extension (RFC 7413) that allows a client to send application data in the SYN segment of repeat connections by including a previously cached TFO cookie, saving one round-trip time.",
    },
    {
      term: "Window Scale",
      definition:
        "A TCP option (RFC 7323) negotiated during the handshake that specifies a bit-shift factor (0-14) applied to the 16-bit window size field, enabling receive windows up to ~1 GB for high-bandwidth-delay-product links.",
    },
    {
      term: "FIN (Finish)",
      definition:
        "A TCP control flag used to signal that the sender has no more data to transmit. Like SYN, it consumes one sequence number and must be acknowledged, enabling the four-way connection termination.",
    },
    {
      term: "RST (Reset)",
      definition:
        "A TCP control flag used to abruptly terminate a connection or reject an invalid segment. Unlike FIN, RST does not go through the graceful four-way termination — the connection is immediately torn down.",
    },
  ],
};
