import type { TopicContent } from "../types";

export const osiTcpipModel: TopicContent = {
  quickSummary: [
    "The OSI (Open Systems Interconnection) model is a 7-layer reference framework — Physical, Data Link, Network, Transport, Session, Presentation, Application — that standardizes how network communication functions are organized. It was developed by ISO in 1984 primarily as a teaching and design tool.",
    "The TCP/IP model is a 4-layer practical model — Network Access (Link), Internet, Transport, Application — that maps directly to the protocols powering the modern internet. It was developed by DARPA in the 1970s and predates OSI.",
    "Data flows down the stack on the sender side (encapsulation: each layer adds its own header), crosses the physical medium, then flows up the stack on the receiver side (decapsulation: each layer strips its header and passes the payload upward).",
    "OSI is used for conceptual understanding and troubleshooting methodology; TCP/IP is used for actual protocol implementation. Most real-world networking discussions map protocols to both models interchangeably.",
  ],
  detailed: [
    "The OSI model divides network communication into seven distinct layers, each with a specific responsibility. Layer 1 (Physical) deals with raw bit transmission over physical media — voltages, light pulses, radio frequencies, pin layouts, and signaling rates. Layer 2 (Data Link) provides node-to-node data transfer, framing, MAC addressing, error detection (CRC), and media access control. It is further divided into the LLC (Logical Link Control) and MAC (Media Access Control) sublayers. Ethernet, Wi-Fi (802.11), and PPP operate here.",
    "Layer 3 (Network) handles logical addressing and routing — determining the best path for packets across interconnected networks. IP (both v4 and v6), ICMP, OSPF, BGP, and ARP operate at this layer. Layer 4 (Transport) provides end-to-end communication services: TCP offers reliable, ordered, connection-oriented delivery with flow control and congestion control; UDP offers lightweight, connectionless, best-effort delivery. Port numbers at this layer multiplex connections between applications on the same host.",
    "Layer 5 (Session) manages dialog control between applications — establishing, maintaining, and terminating sessions, handling checkpointing and recovery. Layer 6 (Presentation) handles data translation, encryption/decryption, compression, and format conversion (e.g., EBCDIC to ASCII, JPEG encoding, SSL/TLS encryption). Layer 7 (Application) is the interface between the network and user-facing applications — HTTP, FTP, SMTP, DNS, SNMP, and SSH all operate here. In practice, Layers 5-7 are often collapsed because modern protocols like HTTP handle session, presentation, and application concerns within a single protocol.",
    "The TCP/IP model simplifies this into four layers. The Network Access (Link) layer combines OSI Layers 1 and 2, handling physical transmission and data-link framing. The Internet layer corresponds to OSI Layer 3, with IP as the cornerstone protocol. The Transport layer maps to OSI Layer 4, providing TCP and UDP. The Application layer merges OSI Layers 5-7, encompassing protocols like HTTP, DNS, SMTP, and TLS directly.",
    "Encapsulation is the process by which each layer wraps the data from the layer above with its own header (and sometimes trailer). At the Application layer, data is generated. The Transport layer segments it and adds a TCP/UDP header (forming a segment or datagram). The Internet layer adds an IP header (forming a packet). The Network Access layer adds a frame header and trailer with MAC addresses and CRC (forming a frame). Finally, the Physical layer converts the frame into bits on the wire. Decapsulation reverses this process on the receiving end, with each layer reading and stripping its header before passing the payload up.",
  ],
  deepDive: [
    "Each OSI layer produces a specific Protocol Data Unit (PDU). Layer 1 deals with raw bits. Layer 2 produces frames — an Ethernet frame includes a preamble (7 bytes), start frame delimiter, destination MAC (6 bytes), source MAC (6 bytes), EtherType/length (2 bytes), payload (46-1500 bytes), and FCS/CRC (4 bytes). Layer 3 produces packets — an IPv4 packet header is 20-60 bytes containing version, IHL, DSCP, total length, identification, flags, fragment offset, TTL, protocol number, header checksum, source IP (4 bytes), destination IP (4 bytes), and options. Layer 4 produces segments (TCP) or datagrams (UDP) — a TCP segment header is 20-60 bytes with source/destination ports, sequence number, acknowledgment number, data offset, flags (SYN, ACK, FIN, RST, PSH, URG), window size, checksum, and urgent pointer. Layers 5-7 produce application-level data/messages.",
    "Real protocol examples at each layer illustrate the model concretely. At Layer 2, Ethernet (IEEE 802.3) uses CSMA/CD for shared media, while Wi-Fi (IEEE 802.11) uses CSMA/CA. ARP bridges Layers 2 and 3, resolving IP addresses to MAC addresses via broadcast. At Layer 3, OSPF (link-state) and BGP (path-vector) are routing protocols; ICMP carries error messages and diagnostics (ping, traceroute). At Layer 4, TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish connections, sliding window for flow control, and algorithms like Reno/Cubic/BBR for congestion control. QUIC (used by HTTP/3) is a Transport-layer protocol built on top of UDP that integrates TLS 1.3 encryption and multiplexed streams, blurring the traditional layering.",
    "The OSI model remains a reference model because it was designed top-down by committee before protocols were implemented — many of its protocols (X.25, X.400, X.500) lost to TCP/IP equivalents. TCP/IP was designed bottom-up alongside working code on ARPANET, making it inherently practical. The OSI model's value lies in its clean separation of concerns for teaching, troubleshooting (start at Layer 1 and work up), and vendor interoperability standards. TCP/IP's value lies in its simplicity and the fact that every device on the internet implements it. Modern networking education teaches both: OSI for the conceptual vocabulary and TCP/IP for the operational reality.",
    "In practice, the boundary between layers is not always clean. NAT (Network Address Translation) modifies Layer 3 (IP) and Layer 4 (port) information, violating strict layering. Deep packet inspection (DPI) examines Layer 7 content at Layer 3 devices. MPLS (Multi-Protocol Label Switching) operates between Layers 2 and 3, sometimes called Layer 2.5. TLS logically belongs to the Presentation layer (Layer 6) but is implemented as a library above the Transport layer (Layer 4) in the TCP/IP model. These cross-layer interactions highlight why the rigid 7-layer model is a simplification of real-world networking.",
    "The concept of protocol multiplexing is critical to understanding how layers interact. At Layer 2, the EtherType field tells the receiver which Layer 3 protocol the payload belongs to (0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP). At Layer 3, the Protocol field in the IP header identifies the Layer 4 protocol (6 = TCP, 17 = UDP, 1 = ICMP). At Layer 4, port numbers identify the application (80 = HTTP, 443 = HTTPS, 53 = DNS). This demultiplexing chain allows a single network interface to handle traffic for many protocols and applications simultaneously.",
  ],
  code: [
    {
      language: "python",
      caption: "Constructing an Ethernet frame + IPv4 packet + TCP segment from scratch (using struct)",
      source: `import struct

# --- Layer 2: Ethernet Frame Header ---
dst_mac = bytes.fromhex("ffffffffffff")        # Broadcast
src_mac = bytes.fromhex("001122334455")         # Source MAC
ether_type = 0x0800                              # IPv4

eth_header = struct.pack("!6s6sH", dst_mac, src_mac, ether_type)
# 14 bytes: dst(6) + src(6) + type(2)

# --- Layer 3: IPv4 Packet Header (20 bytes, no options) ---
version_ihl = 0x45        # Version 4, IHL 5 (20 bytes)
dscp_ecn = 0x00
total_length = 40          # IP header(20) + TCP header(20)
identification = 54321
flags_offset = 0x4000      # Don't Fragment
ttl = 64
protocol = 6               # TCP
checksum = 0               # Placeholder (computed later)
src_ip = bytes([192, 168, 1, 100])
dst_ip = bytes([10, 0, 0, 1])

ip_header = struct.pack("!BBHHHBBH4s4s",
    version_ihl, dscp_ecn, total_length,
    identification, flags_offset,
    ttl, protocol, checksum,
    src_ip, dst_ip
)

# Compute IP header checksum
def ip_checksum(header: bytes) -> int:
    if len(header) % 2:
        header += b"\\x00"
    total = sum(struct.unpack("!%dH" % (len(header) // 2), header))
    total = (total >> 16) + (total & 0xFFFF)
    total += total >> 16
    return ~total & 0xFFFF

chk = ip_checksum(ip_header)
ip_header = ip_header[:10] + struct.pack("!H", chk) + ip_header[12:]

# --- Layer 4: TCP Segment Header (20 bytes, no options) ---
src_port = 12345
dst_port = 80
seq_num = 1000
ack_num = 0
data_offset_flags = (5 << 12) | 0x002   # Data offset=5, SYN flag
window = 65535
tcp_checksum = 0                          # Simplified
urgent = 0

tcp_header = struct.pack("!HHIIHHH H",
    src_port, dst_port,
    seq_num, ack_num,
    data_offset_flags, window,
    tcp_checksum, urgent
)

# Full packet = Ethernet + IP + TCP
frame = eth_header + ip_header + tcp_header
print(f"Total frame size: {len(frame)} bytes")
print(f"  Ethernet header: {len(eth_header)} bytes")
print(f"  IP header:       {len(ip_header)} bytes")
print(f"  TCP header:      {len(tcp_header)} bytes")
print(f"  Hex dump: {frame.hex()}")`,
    },
    {
      language: "python",
      caption: "Raw socket: sending a crafted ICMP Echo Request (ping) with manual header construction",
      source: `import socket
import struct
import os
import time

def build_icmp_echo(identifier: int, seq: int, payload: bytes) -> bytes:
    """Build an ICMP Echo Request packet (Type 8, Code 0)."""
    icmp_type = 8   # Echo Request
    icmp_code = 0
    checksum = 0
    # Pack header with zero checksum first
    header = struct.pack("!BBHHH",
        icmp_type, icmp_code, checksum, identifier, seq
    )
    packet = header + payload

    # Compute checksum over entire ICMP packet
    if len(packet) % 2:
        packet += b"\\x00"
    total = sum(struct.unpack("!%dH" % (len(packet) // 2), packet))
    total = (total >> 16) + (total & 0xFFFF)
    total += total >> 16
    checksum = ~total & 0xFFFF

    # Repack with correct checksum
    header = struct.pack("!BBHHH",
        icmp_type, icmp_code, checksum, identifier, seq
    )
    return header + payload

def ping(dest: str, count: int = 4):
    """Send ICMP Echo Requests using a raw socket (requires root)."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
    sock.settimeout(2.0)
    pid = os.getpid() & 0xFFFF

    for seq in range(1, count + 1):
        payload = struct.pack("!d", time.time())  # Timestamp as payload
        packet = build_icmp_echo(pid, seq, payload)
        sock.sendto(packet, (dest, 0))

        try:
            data, addr = sock.recvfrom(1024)
            # IP header is first 20 bytes; ICMP starts at byte 20
            icmp_header = data[20:28]
            rtype, rcode, rchk, rid, rseq = struct.unpack("!BBHHH", icmp_header)
            rtt_payload = data[28:36]
            send_time = struct.unpack("!d", rtt_payload)[0]
            rtt_ms = (time.time() - send_time) * 1000
            print(f"Reply from {addr[0]}: seq={rseq} ttl={data[8]} "
                  f"time={rtt_ms:.2f}ms")
        except socket.timeout:
            print(f"Request timed out for seq={seq}")

    sock.close()

# Usage (requires root/admin privileges):
# ping("8.8.8.8")`,
    },
    {
      language: "python",
      caption: "Protocol analysis: parsing a captured Ethernet frame and printing layer-by-layer details",
      source: `import struct
from typing import Dict, Any

def parse_ethernet(frame: bytes) -> Dict[str, Any]:
    """Parse Ethernet frame header (14 bytes)."""
    dst, src, ethertype = struct.unpack("!6s6sH", frame[:14])
    return {
        "dst_mac": ":".join(f"{b:02x}" for b in dst),
        "src_mac": ":".join(f"{b:02x}" for b in src),
        "ethertype": f"0x{ethertype:04x}",
        "ethertype_name": {0x0800: "IPv4", 0x86DD: "IPv6",
                           0x0806: "ARP"}.get(ethertype, "Unknown"),
        "payload": frame[14:]
    }

def parse_ipv4(data: bytes) -> Dict[str, Any]:
    """Parse IPv4 header (20+ bytes)."""
    ver_ihl = data[0]
    ihl = (ver_ihl & 0x0F) * 4   # Header length in bytes
    fields = struct.unpack("!BBHHHBBH4s4s", data[:20])
    return {
        "version": ver_ihl >> 4,
        "header_length": ihl,
        "total_length": fields[2],
        "ttl": fields[5],
        "protocol": fields[6],
        "protocol_name": {1: "ICMP", 6: "TCP", 17: "UDP"}.get(fields[6], "Other"),
        "src_ip": ".".join(str(b) for b in fields[8]),
        "dst_ip": ".".join(str(b) for b in fields[9]),
        "payload": data[ihl:]
    }

def parse_tcp(data: bytes) -> Dict[str, Any]:
    """Parse TCP header (20+ bytes)."""
    fields = struct.unpack("!HHIIBBHHH", data[:20])
    data_offset = (fields[4] >> 4) * 4
    flags = fields[5]
    flag_names = []
    for name, bit in [("FIN",0x01),("SYN",0x02),("RST",0x04),
                       ("PSH",0x08),("ACK",0x10),("URG",0x20)]:
        if flags & bit:
            flag_names.append(name)
    return {
        "src_port": fields[0],
        "dst_port": fields[1],
        "seq": fields[2],
        "ack": fields[3],
        "flags": flag_names,
        "window": fields[6],
        "payload_size": len(data) - data_offset
    }

# Example: parse a raw captured frame
raw = bytes.fromhex(
    "ffffffffffff00112233445508004500002800010000"
    "4006b1c6c0a80164c0a80101303900501234567800"
    "000000500200ffffd5e40000"
)
eth = parse_ethernet(raw)
print(f"=== Layer 2 (Ethernet) ===")
print(f"  Src MAC:  {eth['src_mac']}")
print(f"  Dst MAC:  {eth['dst_mac']}")
print(f"  Type:     {eth['ethertype_name']} ({eth['ethertype']})")

if eth["ethertype"] == "0x0800":
    ip = parse_ipv4(eth["payload"])
    print(f"\\n=== Layer 3 (IPv4) ===")
    print(f"  Src IP:   {ip['src_ip']}")
    print(f"  Dst IP:   {ip['dst_ip']}")
    print(f"  TTL:      {ip['ttl']}")
    print(f"  Protocol: {ip['protocol_name']} ({ip['protocol']})")

    if ip["protocol_name"] == "TCP":
        tcp = parse_tcp(ip["payload"])
        print(f"\\n=== Layer 4 (TCP) ===")
        print(f"  Src Port: {tcp['src_port']}")
        print(f"  Dst Port: {tcp['dst_port']}")
        print(f"  Seq:      {tcp['seq']}")
        print(f"  Flags:    {', '.join(tcp['flags'])}")
        print(f"  Window:   {tcp['window']}")`,
    },
  ],
  diagrams: [
    {
      title: "OSI 7-Layer Model Architecture",
      kind: "architecture",
      caption:
        "The seven layers of the OSI model from Physical (Layer 1) at the bottom to Application (Layer 7) at the top, showing the PDU type at each layer and example protocols.",
    },
    {
      title: "OSI vs TCP/IP Layer Mapping",
      kind: "architecture",
      caption:
        "Side-by-side comparison showing how the 7 OSI layers map to the 4 TCP/IP layers: Application+Presentation+Session collapse into TCP/IP Application; Transport maps 1:1; Network maps to Internet; Data Link+Physical collapse into Network Access.",
    },
    {
      title: "Encapsulation and Decapsulation Flow",
      kind: "flow",
      caption:
        "Data flows down the sender's stack — Application data is wrapped with a TCP header (segment), then an IP header (packet), then an Ethernet header and trailer (frame), then transmitted as bits. The receiver reverses the process, stripping headers at each layer.",
    },
    {
      title: "TCP Three-Way Handshake Sequence",
      kind: "sequence",
      caption:
        "Client sends SYN (seq=x), server responds with SYN-ACK (seq=y, ack=x+1), client sends ACK (ack=y+1). Connection is now established and data transfer can begin.",
    },
    {
      title: "Packet Journey Through a Network",
      kind: "network",
      caption:
        "A packet traversing from Host A through a switch (Layer 2), router (Layer 3), across the internet, through another router and switch to Host B. At each hop, the Layer 2 frame is stripped and rebuilt with new MAC addresses while the Layer 3 packet remains unchanged.",
    },
  ],
  animations: [
    {
      title: "Encapsulation: Sending an HTTP Request",
      steps: [
        {
          label: "Application Layer generates data",
          detail:
            'The browser creates an HTTP GET request: "GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n". This is the application-layer payload — pure data with no network headers yet.',
        },
        {
          label: "Transport Layer adds TCP header",
          detail:
            "TCP wraps the HTTP data with a 20-byte header: source port (e.g., 49152), destination port (80), sequence number, acknowledgment number, flags (PSH+ACK), window size, and checksum. The result is a TCP segment.",
        },
        {
          label: "Network Layer adds IP header",
          detail:
            "IP wraps the TCP segment with a 20-byte header: version (4), TTL (64), protocol (6 = TCP), source IP (192.168.1.100), destination IP (93.184.216.34). The result is an IP packet.",
        },
        {
          label: "Data Link Layer adds Ethernet header and trailer",
          detail:
            "Ethernet wraps the IP packet with a 14-byte header (destination MAC, source MAC, EtherType 0x0800) and a 4-byte FCS trailer for error detection. The result is an Ethernet frame.",
        },
        {
          label: "Physical Layer transmits bits",
          detail:
            "The Ethernet frame is converted to electrical signals (copper), light pulses (fiber), or radio waves (Wi-Fi) and transmitted over the physical medium. A preamble and start frame delimiter are prepended for clock synchronization.",
        },
        {
          label: "Receiver decapsulates layer by layer",
          detail:
            "The receiving NIC checks the FCS, strips the Ethernet header, and passes the IP packet up. The IP layer verifies the checksum and strips its header. TCP verifies its checksum, reassembles segments in order, and passes the HTTP payload to the web server application.",
        },
      ],
    },
    {
      title: "ARP Resolution: Bridging Layer 2 and Layer 3",
      steps: [
        {
          label: "Host A wants to send to Host B's IP",
          detail:
            "Host A has an IP packet for 192.168.1.50 but does not know the corresponding MAC address. It checks its ARP cache — no entry found.",
        },
        {
          label: "ARP Request broadcast",
          detail:
            'Host A sends an ARP Request as an Ethernet broadcast (destination MAC ff:ff:ff:ff:ff:ff): "Who has 192.168.1.50? Tell 192.168.1.100". Every device on the local network segment receives this frame.',
        },
        {
          label: "Host B responds with ARP Reply",
          detail:
            'Host B recognizes its own IP and sends a unicast ARP Reply back to Host A: "192.168.1.50 is at MAC aa:bb:cc:dd:ee:ff". This is sent directly to Host A\'s MAC address.',
        },
        {
          label: "ARP cache updated and packet sent",
          detail:
            "Host A stores the IP-to-MAC mapping in its ARP cache (typically with a timeout of 20-60 minutes). It can now construct the Ethernet frame with the correct destination MAC and transmit the original IP packet.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "OSI Layer",
      "OSI Layer Name",
      "TCP/IP Layer",
      "PDU",
      "Key Protocols",
      "Devices",
    ],
    rows: [
      [
        "7",
        "Application",
        "Application",
        "Data/Message",
        "HTTP, FTP, SMTP, DNS, SSH, SNMP, DHCP",
        "Proxy, Load Balancer, WAF",
      ],
      [
        "6",
        "Presentation",
        "Application",
        "Data",
        "TLS/SSL, JPEG, MPEG, ASCII, EBCDIC",
        "—",
      ],
      [
        "5",
        "Session",
        "Application",
        "Data",
        "NetBIOS, RPC, PPTP, SIP",
        "—",
      ],
      [
        "4",
        "Transport",
        "Transport",
        "Segment / Datagram",
        "TCP, UDP, QUIC, SCTP",
        "—",
      ],
      [
        "3",
        "Network",
        "Internet",
        "Packet",
        "IPv4, IPv6, ICMP, OSPF, BGP, ARP",
        "Router, L3 Switch",
      ],
      [
        "2",
        "Data Link",
        "Network Access",
        "Frame",
        "Ethernet, Wi-Fi (802.11), PPP, VLAN (802.1Q)",
        "Switch, Bridge, NIC",
      ],
      [
        "1",
        "Physical",
        "Network Access",
        "Bits",
        "Ethernet PHY, DSL, SONET, 802.11 PHY, USB",
        "Hub, Repeater, Cable, Antenna",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What are the seven layers of the OSI model and what does each one do?",
      a: "From bottom to top: (1) Physical — transmits raw bits over a physical medium. (2) Data Link — provides node-to-node delivery, MAC addressing, framing, and error detection. (3) Network — handles logical addressing (IP) and routing across networks. (4) Transport — provides end-to-end delivery, segmentation, flow control (TCP) or best-effort delivery (UDP). (5) Session — manages sessions/dialogues between applications. (6) Presentation — handles data translation, encryption, and compression. (7) Application — provides network services directly to user applications (HTTP, DNS, SMTP).",
      followUps: [
        "Which layers are combined in the TCP/IP model and why?",
        "Give a real-world analogy for each layer.",
      ],
    },
    {
      q: "How does encapsulation work as data moves down the OSI stack?",
      a: "Each layer adds its own header (and sometimes trailer) to the data received from the layer above. The Application layer produces raw data. Transport adds port numbers and sequence info (segment). Network adds source/destination IP addresses (packet). Data Link adds MAC addresses and error-checking CRC (frame). Physical converts to bits. Each layer treats everything from the layer above — including its headers — as opaque payload. This modularity allows any layer's protocol to be swapped without affecting other layers.",
      followUps: [
        "What is the maximum size of an Ethernet frame and what happens if the payload exceeds it?",
        "Explain MTU and IP fragmentation.",
      ],
    },
    {
      q: "What is the difference between TCP and UDP, and when would you choose each?",
      a: "TCP is connection-oriented, reliable, and ordered. It uses a three-way handshake, sequence numbers, acknowledgments, retransmissions, and flow/congestion control. The overhead is higher (20-byte minimum header). UDP is connectionless, unreliable, and unordered — it sends datagrams with minimal overhead (8-byte header) and no built-in retransmission. Choose TCP for applications requiring reliability (HTTP, file transfer, email). Choose UDP for latency-sensitive applications where occasional loss is acceptable (DNS queries, live video streaming, VoIP, online gaming). QUIC (HTTP/3) is built on UDP but adds its own reliability and encryption.",
      followUps: [
        "How does TCP congestion control work?",
        "Why is DNS typically over UDP rather than TCP?",
        "Explain head-of-line blocking and how QUIC solves it.",
      ],
    },
    {
      q: "Why is the OSI model considered a 'reference model' while TCP/IP is considered a 'practical model'?",
      a: "The OSI model was designed by committee (ISO) as a theoretical framework before implementations existed. Its strict 7-layer separation is ideal for understanding concepts but some layers (Session, Presentation) rarely map to distinct protocols in practice. TCP/IP was developed alongside ARPANET — protocols were implemented and tested first, then organized into layers. TCP/IP has only 4 layers because it pragmatically combines functions that work together. Nearly every device on the internet runs TCP/IP; almost nothing runs the OSI protocol suite (X.25, X.400). OSI succeeded as a teaching tool; TCP/IP succeeded as an engineering solution.",
      followUps: [
        "What were the OSI protocol implementations and why did they fail?",
        "What is the PACELC or Hybrid model?",
      ],
    },
    {
      q: "Explain how a packet travels from one host to another across multiple routers.",
      a: "The source host creates an IP packet with its own IP as source and the final destination IP. It wraps this in an Ethernet frame addressed to its default gateway's MAC (found via ARP). The gateway router receives the frame, strips the Ethernet header, examines the IP destination, consults its routing table, and re-encapsulates the packet in a new frame addressed to the next hop's MAC. This process repeats at each router — the IP packet stays the same (source and destination IP unchanged, TTL decremented by 1 at each hop), but the Ethernet frame is rebuilt at each hop with the MAC addresses of the current and next-hop routers. When the final router reaches the destination's local network, it ARPs for the destination host's MAC and delivers the frame.",
      followUps: [
        "What happens when TTL reaches zero?",
        "How does traceroute exploit TTL?",
        "What changes in the packet when NAT is involved?",
      ],
    },
    {
      q: "What is ARP and why is it necessary?",
      a: "ARP (Address Resolution Protocol) maps Layer 3 IP addresses to Layer 2 MAC addresses. It is necessary because Ethernet switches forward frames based on MAC addresses, not IP addresses. When a host needs to send an IP packet to another host on the same subnet, it must first discover the destination's MAC address. It broadcasts an ARP Request ('Who has 192.168.1.50?'), and the owner of that IP responds with its MAC address. The mapping is cached in an ARP table to avoid repeated broadcasts. ARP is a security weakness — ARP spoofing/poisoning allows an attacker to associate their MAC with another host's IP, enabling man-in-the-middle attacks.",
      followUps: [
        "How does ARP differ from NDP in IPv6?",
        "What is Gratuitous ARP?",
        "How can ARP spoofing be mitigated?",
      ],
    },
  ],
  followUps: [
    "How does VLAN tagging (802.1Q) add a virtual layer to Layer 2?",
    "What is the role of MPLS and where does it fit in the OSI/TCP/IP models?",
    "How does IPv6 differ from IPv4 at the Network layer?",
    "What is the relationship between TLS and the OSI Presentation layer?",
    "How do SDN (Software-Defined Networking) and NFV change the traditional layered model?",
    "What is the difference between circuit switching and packet switching at the Physical/Data Link layers?",
    "How does QUIC (HTTP/3) blur the boundaries between Transport and Application layers?",
  ],
  mcqs: [
    {
      q: "Which OSI layer is responsible for logical addressing and routing?",
      options: [
        "Data Link (Layer 2)",
        "Network (Layer 3)",
        "Transport (Layer 4)",
        "Session (Layer 5)",
      ],
      answerIndex: 1,
      explanation:
        "The Network layer (Layer 3) handles logical addressing using IP addresses and determines the best route for packets to travel from source to destination across interconnected networks.",
    },
    {
      q: "What is the PDU (Protocol Data Unit) at the Transport layer?",
      options: ["Frame", "Packet", "Segment", "Bit"],
      answerIndex: 2,
      explanation:
        "The Transport layer PDU is called a segment (for TCP) or datagram (for UDP). Frames belong to the Data Link layer, packets to the Network layer, and bits to the Physical layer.",
    },
    {
      q: "Which TCP/IP layer combines the functionality of OSI Layers 5, 6, and 7?",
      options: [
        "Network Access",
        "Internet",
        "Transport",
        "Application",
      ],
      answerIndex: 3,
      explanation:
        "The TCP/IP Application layer merges the Session, Presentation, and Application layers of the OSI model. Protocols like HTTP, TLS, and DNS all operate within this single TCP/IP layer.",
    },
    {
      q: "During encapsulation, what does the Data Link layer add to an IP packet?",
      options: [
        "Source and destination port numbers",
        "Source and destination MAC addresses and FCS trailer",
        "Source and destination IP addresses",
        "Sequence and acknowledgment numbers",
      ],
      answerIndex: 1,
      explanation:
        "The Data Link layer wraps the IP packet in a frame by adding a header with source/destination MAC addresses and EtherType, plus a Frame Check Sequence (FCS) trailer for error detection using CRC.",
    },
    {
      q: "What field in the IPv4 header identifies the Layer 4 protocol?",
      options: [
        "EtherType",
        "TTL (Time to Live)",
        "Protocol number",
        "Port number",
      ],
      answerIndex: 2,
      explanation:
        "The Protocol field in the IPv4 header (1 byte at offset 9) identifies the upper-layer protocol: 6 for TCP, 17 for UDP, 1 for ICMP. EtherType is in the Ethernet header, not IP. Port numbers are in the TCP/UDP header.",
    },
    {
      q: "Which of the following correctly orders the TCP three-way handshake?",
      options: [
        "ACK, SYN, SYN-ACK",
        "SYN, ACK, SYN-ACK",
        "SYN, SYN-ACK, ACK",
        "SYN-ACK, SYN, ACK",
      ],
      answerIndex: 2,
      explanation:
        "TCP connection establishment follows: (1) Client sends SYN, (2) Server responds with SYN-ACK, (3) Client sends ACK. After these three messages, the connection is established and data can flow bidirectionally.",
    },
    {
      q: "At which OSI layer does a network switch primarily operate?",
      options: [
        "Physical (Layer 1)",
        "Data Link (Layer 2)",
        "Network (Layer 3)",
        "Transport (Layer 4)",
      ],
      answerIndex: 1,
      explanation:
        "A standard network switch operates at Layer 2 (Data Link), forwarding frames based on MAC addresses using its MAC address table. A hub operates at Layer 1. A Layer 3 switch can also perform routing functions.",
    },
  ],
  exercises: [
    "Use Wireshark to capture a simple HTTP request. Identify and annotate each layer: find the Ethernet header (MAC addresses, EtherType), IP header (source/destination IP, TTL, protocol), TCP header (ports, flags, sequence numbers), and HTTP payload. Note the total size of headers vs. payload.",
    "Write a program that constructs a raw Ethernet frame containing an IPv4 packet with a UDP datagram. Send it using a raw socket and verify receipt with tcpdump or Wireshark. Experiment with changing the TTL and observe the effect.",
    "Implement a simplified TCP three-way handshake simulator: two objects (Client, Server) exchange SYN, SYN-ACK, and ACK messages, tracking sequence and acknowledgment numbers at each step. Extend it to handle a data transfer and connection teardown (FIN/ACK).",
    "Given a hex dump of an Ethernet frame, manually parse it byte by byte: extract the destination MAC, source MAC, EtherType, IP version/IHL, total length, TTL, protocol, source/destination IP, source/destination ports, and TCP flags. Verify by comparing with Wireshark output.",
    "Set up a lab with three virtual machines connected via two routers. Trace a ping from VM1 to VM3 using tcpdump at each hop. Document how the MAC addresses change at each router while the IP addresses remain constant. Draw a diagram showing the frame at each hop.",
    "Compare TCP and UDP by writing a file transfer program using each protocol. Measure throughput, latency, and reliability (introduce artificial packet loss). Explain the results in terms of TCP's congestion control and retransmission mechanisms.",
  ],
  flashcards: [
    {
      front: "What are the 7 layers of the OSI model (bottom to top)?",
      back: "Physical, Data Link, Network, Transport, Session, Presentation, Application. Mnemonic: 'Please Do Not Throw Sausage Pizza Away'.",
    },
    {
      front: "What are the 4 layers of the TCP/IP model (bottom to top)?",
      back: "Network Access (Link), Internet, Transport, Application. The TCP/IP model merges OSI Layers 1-2 into Network Access and Layers 5-7 into Application.",
    },
    {
      front: "What is the PDU at each OSI layer?",
      back: "Layer 1: Bits. Layer 2: Frames. Layer 3: Packets. Layer 4: Segments (TCP) / Datagrams (UDP). Layers 5-7: Data/Messages.",
    },
    {
      front: "What is encapsulation in networking?",
      back: "The process of wrapping data from an upper layer with a header (and sometimes trailer) at each lower layer. Each layer treats the entire output of the layer above as its payload, adding its own control information.",
    },
    {
      front: "What does ARP do and at which layers does it operate?",
      back: "ARP (Address Resolution Protocol) resolves IP addresses (Layer 3) to MAC addresses (Layer 2). It broadcasts a request on the local network, and the target host replies with its MAC address. The mapping is cached in the ARP table.",
    },
    {
      front: "What is the difference between a hub, switch, and router?",
      back: "Hub (Layer 1): broadcasts all traffic to all ports. Switch (Layer 2): forwards frames to specific ports based on MAC address table. Router (Layer 3): forwards packets between networks based on IP routing table.",
    },
    {
      front: "What does the TTL field in an IP header do?",
      back: "Time to Live is decremented by 1 at each router hop. When it reaches 0, the packet is discarded and an ICMP Time Exceeded message is sent back. This prevents packets from looping indefinitely. Traceroute exploits this by sending packets with incrementally increasing TTLs.",
    },
    {
      front: "What are the key differences between TCP and UDP?",
      back: "TCP: connection-oriented, reliable, ordered, flow/congestion control, 20-byte header minimum. UDP: connectionless, unreliable, unordered, no flow control, 8-byte header. TCP guarantees delivery; UDP prioritizes speed.",
    },
    {
      front: "What is the EtherType field in an Ethernet frame?",
      back: "A 2-byte field indicating which Layer 3 protocol is encapsulated in the frame's payload. Common values: 0x0800 (IPv4), 0x86DD (IPv6), 0x0806 (ARP). This is how the Data Link layer knows which Network layer protocol to hand the payload to.",
    },
    {
      front: "Why did TCP/IP win over the OSI protocol suite?",
      back: "TCP/IP was developed alongside working ARPANET code (bottom-up, practical). OSI was designed by committee (top-down, theoretical). TCP/IP was freely available in BSD Unix; OSI protocols were expensive and complex. By the time OSI protocols were ready, TCP/IP had already achieved critical mass.",
    },
  ],
  revisionNotes: [
    "The OSI model has 7 layers: Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7). Remember with 'Please Do Not Throw Sausage Pizza Away'.",
    "The TCP/IP model has 4 layers: Network Access, Internet, Transport, Application. It merges OSI L1+L2 at the bottom and OSI L5+L6+L7 at the top.",
    "PDUs: bits (L1), frames (L2), packets (L3), segments/datagrams (L4), data (L5-L7).",
    "Encapsulation adds headers going down the stack; decapsulation strips them going up. Each layer's header contains addressing or control info relevant to that layer's function.",
    "Layer 2 uses MAC addresses (48-bit, hardware-burned). Layer 3 uses IP addresses (32-bit IPv4 or 128-bit IPv6, logically assigned). Layer 4 uses port numbers (16-bit, 0-65535).",
    "TCP three-way handshake: SYN -> SYN-ACK -> ACK. Connection teardown: FIN -> ACK, FIN -> ACK (or combined FIN-ACK).",
    "Routers operate at Layer 3 (rewrite MAC addresses at each hop, decrement TTL). Switches operate at Layer 2 (forward based on MAC table). Hubs operate at Layer 1 (broadcast everything).",
    "ARP resolves IP to MAC on the local network. DNS resolves domain names to IP addresses at the Application layer. These are often confused but operate at completely different layers.",
    "The Protocol field in IP (Layer 3) and port numbers in TCP/UDP (Layer 4) together enable demultiplexing — routing incoming data to the correct application process.",
    "MTU (Maximum Transmission Unit) is a Layer 2 concept — Ethernet's default MTU is 1500 bytes. If an IP packet exceeds the MTU, it must be fragmented (IPv4) or the sender must reduce its packet size (IPv6 uses Path MTU Discovery).",
  ],
  cheatSheet: [
    "OSI Layers: 7-Application, 6-Presentation, 5-Session, 4-Transport, 3-Network, 2-Data Link, 1-Physical",
    "TCP/IP Layers: Application, Transport, Internet, Network Access (Link)",
    "PDU names: Data -> Segment -> Packet -> Frame -> Bits (top to bottom)",
    "Ethernet frame: Dst MAC(6B) | Src MAC(6B) | EtherType(2B) | Payload(46-1500B) | FCS(4B)",
    "IPv4 header: 20-60 bytes. Key fields: Version, IHL, Total Length, TTL, Protocol, Src IP, Dst IP",
    "TCP header: 20-60 bytes. Key fields: Src Port, Dst Port, Seq#, Ack#, Flags, Window, Checksum",
    "UDP header: 8 bytes only. Fields: Src Port, Dst Port, Length, Checksum",
    "Common EtherTypes: 0x0800=IPv4, 0x86DD=IPv6, 0x0806=ARP, 0x8100=VLAN",
    "Common IP Protocol numbers: 1=ICMP, 6=TCP, 17=UDP, 47=GRE, 89=OSPF",
    "Well-known ports: 20/21=FTP, 22=SSH, 23=Telnet, 25=SMTP, 53=DNS, 80=HTTP, 443=HTTPS",
    "TCP flags: SYN(0x02), ACK(0x10), FIN(0x01), RST(0x04), PSH(0x08), URG(0x20)",
    "TCP handshake: SYN(seq=x) -> SYN-ACK(seq=y,ack=x+1) -> ACK(ack=y+1)",
    "MTU: Ethernet default=1500B. MSS = MTU - IP header(20B) - TCP header(20B) = 1460B",
    "ARP: Broadcast request (ff:ff:ff:ff:ff:ff), unicast reply. Cached with ~20min timeout",
    "Traceroute: Sends packets with TTL=1,2,3... Each expired hop returns ICMP Time Exceeded",
  ],
  resources: [
    {
      label: "Computer Networking: A Top-Down Approach (Kurose & Ross)",
      kind: "book",
      note: "The standard university textbook. Covers TCP/IP in depth with a top-down approach starting from the Application layer. Excellent for building intuition.",
    },
    {
      label: "TCP/IP Illustrated, Volume 1 (W. Richard Stevens)",
      kind: "book",
      note: "The definitive reference for TCP/IP protocol internals. Uses real packet traces to explain every protocol in detail. Essential for anyone doing network programming.",
    },
    {
      label: "RFC 791 — Internet Protocol (IPv4)",
      kind: "paper",
      note: "The original specification for IPv4. Defines the packet header format, addressing, fragmentation, and routing fundamentals.",
    },
    {
      label: "RFC 793 — Transmission Control Protocol (TCP)",
      kind: "paper",
      note: "The foundational TCP specification. Describes the three-way handshake, flow control, retransmission, and connection management.",
    },
    {
      label: "Wireshark Official Documentation and User Guide",
      kind: "docs",
      note: "Learn to use the most popular network protocol analyzer. Hands-on packet capture and analysis is the best way to internalize the layered model.",
    },
    {
      label: "Practical Networking — OSI Model (YouTube series by Ed Harmoush)",
      kind: "video",
      note: "Clear, visual explanations of each OSI layer with real-world examples. Good for visual learners who want to supplement textbook study.",
    },
    {
      label: "Beej's Guide to Network Programming",
      kind: "article",
      note: "A practical, hands-on guide to socket programming in C. Excellent for understanding how applications interact with the Transport layer through the socket API.",
    },
    {
      label: "The TCP/IP Guide (Charles M. Kozierok)",
      kind: "docs",
      note: "A comprehensive, freely available online reference covering every protocol in the TCP/IP suite with detailed diagrams and explanations.",
    },
  ],
  glossary: [
    {
      term: "OSI Model",
      definition:
        "Open Systems Interconnection model — a 7-layer conceptual framework created by ISO (1984) that standardizes the functions of a communication system into distinct layers, each serving the layer above it.",
    },
    {
      term: "TCP/IP Model",
      definition:
        "A 4-layer practical networking model (Network Access, Internet, Transport, Application) that describes the protocol suite powering the internet. Developed by DARPA alongside ARPANET in the 1970s.",
    },
    {
      term: "PDU (Protocol Data Unit)",
      definition:
        "The unit of data at a specific layer: bits (Physical), frames (Data Link), packets (Network), segments/datagrams (Transport), data/messages (Application).",
    },
    {
      term: "Encapsulation",
      definition:
        "The process of wrapping upper-layer data with lower-layer headers (and trailers) as it moves down the protocol stack. Each layer treats the output from the layer above as opaque payload.",
    },
    {
      term: "MAC Address",
      definition:
        "Media Access Control address — a 48-bit (6-byte) hardware identifier assigned to a network interface card. Written as six colon-separated hex pairs (e.g., 00:1A:2B:3C:4D:5E). Used for Layer 2 addressing.",
    },
    {
      term: "IP Address",
      definition:
        "Internet Protocol address — a logical address assigned to a network interface for Layer 3 communication. IPv4 uses 32 bits (e.g., 192.168.1.1); IPv6 uses 128 bits (e.g., 2001:db8::1).",
    },
    {
      term: "TTL (Time to Live)",
      definition:
        "A field in the IP header that limits a packet's lifetime. Decremented by 1 at each router; when it reaches 0, the packet is discarded and an ICMP Time Exceeded message is returned to the sender.",
    },
    {
      term: "MTU (Maximum Transmission Unit)",
      definition:
        "The maximum size of a Layer 3 packet that can be carried in a single Layer 2 frame without fragmentation. Ethernet's default MTU is 1500 bytes.",
    },
    {
      term: "ARP (Address Resolution Protocol)",
      definition:
        "A protocol that maps IPv4 addresses to MAC addresses on a local network segment. Uses broadcast requests and unicast replies. Results are cached in an ARP table.",
    },
    {
      term: "Socket",
      definition:
        "A software endpoint for network communication, identified by the combination of an IP address and a port number. The OS socket API (Berkeley sockets) is the standard interface between applications and the Transport layer.",
    },
    {
      term: "Three-Way Handshake",
      definition:
        "TCP's connection establishment process: (1) Client sends SYN with initial sequence number, (2) Server responds with SYN-ACK, (3) Client sends ACK. Establishes synchronized sequence numbers for reliable bidirectional communication.",
    },
    {
      term: "QUIC",
      definition:
        "A Transport-layer protocol built on UDP that provides multiplexed streams, integrated TLS 1.3 encryption, and reduced connection establishment latency. Used by HTTP/3. Eliminates head-of-line blocking present in TCP.",
    },
  ],
};
