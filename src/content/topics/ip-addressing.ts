import type { TopicContent } from "../types";

export const ipAddressing: TopicContent = {
  quickSummary: [
    "An IP address is a numerical label assigned to each device on a network; IPv4 uses 32 bits (4 octets like 192.168.1.1) while IPv6 uses 128 bits (8 groups of 4 hex digits like 2001:0db8::1).",
    "Subnetting divides a larger network into smaller, more manageable sub-networks by borrowing host bits for the network portion, controlled by a subnet mask (e.g., 255.255.255.0 or /24 in CIDR notation).",
    "CIDR (Classless Inter-Domain Routing) replaced the wasteful classful system (Class A/B/C) by allowing arbitrary prefix lengths, enabling efficient allocation and route aggregation (supernetting).",
    "Private address ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are non-routable on the public internet and require NAT (Network Address Translation) for external communication.",
  ],
  detailed: [
    "IPv4 addresses are 32-bit numbers, conventionally written in dotted-decimal notation as four octets separated by periods (e.g., 192.168.1.100). Each octet ranges from 0 to 255. The address space is split into a network portion (identifying the subnet) and a host portion (identifying the device within that subnet). The boundary between network and host bits is defined by the subnet mask. For example, a /24 mask (255.255.255.0) means the first 24 bits identify the network and the remaining 8 bits identify hosts, yielding 2^8 - 2 = 254 usable host addresses (subtracting the network address and broadcast address).",
    "The original classful addressing scheme divided IPv4 into five classes. Class A (0.0.0.0 - 127.255.255.255) used an 8-bit network prefix, supporting 128 networks with ~16.7 million hosts each. Class B (128.0.0.0 - 191.255.255.255) used 16-bit prefixes for 16,384 networks of ~65,534 hosts. Class C (192.0.0.0 - 223.255.255.255) used 24-bit prefixes for ~2.1 million networks of 254 hosts. Class D (224-239) was reserved for multicast, and Class E (240-255) for experimental use. This rigid system wasted enormous amounts of address space because organizations received entire class blocks far larger than needed.",
    "CIDR, introduced in 1993 (RFC 1519), eliminated class boundaries by allowing subnet masks of any length. A CIDR notation like 10.0.0.0/22 means the first 22 bits are the network prefix, leaving 10 host bits for 1,022 usable addresses. CIDR enables route aggregation (supernetting): multiple contiguous network blocks can be advertised as a single route, shrinking global routing tables. For instance, four /24 networks (192.168.0.0/24 through 192.168.3.0/24) can be aggregated into one /22 route (192.168.0.0/22).",
    "IPv6 was designed to solve IPv4 address exhaustion with a 128-bit address space providing approximately 3.4 x 10^38 unique addresses. IPv6 addresses are written as eight groups of four hexadecimal digits separated by colons (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334). Leading zeros within a group can be omitted, and one contiguous sequence of all-zero groups can be replaced with :: (e.g., 2001:db8::8a2e:370:7334). IPv6 eliminates the need for NAT, has built-in IPsec support, supports stateless address auto-configuration (SLAAC), and uses a simplified header format for faster routing.",
    "Subnet masks work through bitwise AND operations. When a router receives a packet, it performs a bitwise AND between the destination IP and the subnet mask to extract the network address, then consults its routing table. For example, IP 192.168.5.130 AND mask 255.255.255.192 (/26) yields network 192.168.5.128. The host portion is found by ANDing with the inverted mask (wildcard mask). The broadcast address is obtained by ORing the network address with the wildcard mask: 192.168.5.128 OR 0.0.0.63 = 192.168.5.191.",
  ],
  deepDive: [
    "Variable Length Subnet Masking (VLSM) allows different subnets within the same network to use different prefix lengths, optimizing address utilization. Without VLSM, if a network needed subnets of 100, 50, and 10 hosts, every subnet would need to accommodate the largest (100 hosts, requiring a /25), wasting addresses in smaller subnets. With VLSM, the 100-host subnet gets a /25 (126 usable), the 50-host subnet gets a /26 (62 usable), and the 10-host subnet gets a /28 (14 usable). VLSM planning typically starts by allocating the largest subnet first from the address block, then carving progressively smaller subnets from the remaining space, ensuring no overlaps.",
    "NAT (Network Address Translation) maps private IP addresses to public ones, allowing multiple devices to share a single public IP. Static NAT provides a one-to-one mapping (useful for servers that need consistent external addresses). Dynamic NAT uses a pool of public addresses assigned on demand. PAT (Port Address Translation, also called NAT overload) maps many private addresses to a single public IP by differentiating connections through unique source port numbers. A typical home router uses PAT: internal devices (192.168.1.x) all appear as one public IP, with the router tracking sessions via a translation table mapping (private IP, private port) to (public IP, assigned port). NAT breaks end-to-end connectivity and complicates protocols like SIP and FTP that embed IP addresses in payloads, requiring Application Layer Gateways (ALGs).",
    "Subnetting math relies on powers of two. Given a /n prefix, the number of host addresses is 2^(32-n), usable hosts are 2^(32-n) - 2. To find how many bits to borrow for a required number of subnets, compute ceiling(log2(subnets)). To find the prefix for a required number of hosts, find the smallest n such that 2^(32-n) - 2 >= required hosts. The subnet increment (block size) is 2^(32-n) or equivalently 256 minus the relevant octet of the subnet mask. For example, /26 has a block size of 64, so subnets start at .0, .64, .128, and .192 within the last octet. Given an IP, finding its subnet is done by rounding down to the nearest multiple of the block size.",
    "IPv6 address types include unicast, multicast, and anycast (there is no broadcast in IPv6). Unicast types include: Global Unicast (2000::/3, the routable equivalent of public IPv4), Link-Local (fe80::/10, auto-configured on every interface for neighbor discovery, mandatory and non-routable), Unique Local (fc00::/7, analogous to IPv4 private ranges, for internal use), and Loopback (::1/128). Multicast (ff00::/8) replaces IPv4 broadcast; Solicited-Node Multicast (ff02::1:ff00:0/104) is used by Neighbor Discovery Protocol instead of ARP. Anycast addresses look like regular unicast addresses but are assigned to multiple interfaces; packets go to the nearest one topologically, useful for load balancing DNS and CDN endpoints.",
    "Supernetting (route aggregation) is the inverse of subnetting: combining multiple smaller, contiguous prefixes into one larger prefix. For aggregation to work, the blocks must be contiguous, their count must be a power of two, and the first block's network address must be evenly divisible by the total size. For example, 172.16.0.0/24 through 172.16.3.0/24 (four /24s) aggregate to 172.16.0.0/22 because 172.16.0.0 is divisible by 1024 (2^10, the host space of a /22). Supernetting reduces routing table entries and is essential for ISPs managing thousands of customer prefixes. BGP routers use longest-prefix match, so more-specific routes override aggregates when needed.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Subnet calculator: compute network address, broadcast, host range, and usable hosts from CIDR notation",
      source: `#include <iostream>
#include <string>
#include <cstdint>
#include <sstream>
#include <arpa/inet.h>
#include <iomanip>

// Convert dotted-decimal IP string to 32-bit host-order integer
uint32_t ip_to_int(const std::string& ip) {
    struct in_addr addr;
    inet_pton(AF_INET, ip.c_str(), &addr);
    return ntohl(addr.s_addr);
}

// Convert 32-bit host-order integer to dotted-decimal string
std::string int_to_ip(uint32_t n) {
    struct in_addr addr;
    addr.s_addr = htonl(n);
    char buf[INET_ADDRSTRLEN];
    inet_ntop(AF_INET, &addr, buf, sizeof(buf));
    return buf;
}

void subnet_info(const std::string& cidr) {
    // Parse CIDR: split on '/'
    auto slash = cidr.find('/');
    std::string ip_str = cidr.substr(0, slash);
    int prefix_len = std::stoi(cidr.substr(slash + 1));

    uint32_t ip = ip_to_int(ip_str);

    // Build subnet mask
    uint32_t mask = (prefix_len == 0) ? 0 : (~0U << (32 - prefix_len));
    uint32_t wildcard   = mask ^ 0xFFFFFFFF;
    uint32_t network    = ip & mask;
    uint32_t broadcast  = network | wildcard;
    uint32_t first_host = network + 1;
    uint32_t last_host  = broadcast - 1;
    int total  = 1 << (32 - prefix_len);
    int usable = total - 2;

    std::cout << std::setw(16) << "cidr: " << cidr << "\\n"
              << std::setw(16) << "network: " << int_to_ip(network) << "\\n"
              << std::setw(16) << "broadcast: " << int_to_ip(broadcast) << "\\n"
              << std::setw(16) << "subnet_mask: " << int_to_ip(mask) << "\\n"
              << std::setw(16) << "wildcard_mask: " << int_to_ip(wildcard) << "\\n"
              << std::setw(16) << "first_host: " << (usable > 0 ? int_to_ip(first_host) : "N/A") << "\\n"
              << std::setw(16) << "last_host: " << (usable > 0 ? int_to_ip(last_host) : "N/A") << "\\n"
              << std::setw(16) << "usable_hosts: " << std::max(usable, 0) << "\\n"
              << std::setw(16) << "total_addresses: " << total << "\\n";
}

int main() {
    subnet_info("192.168.10.0/26");
    // Output:
    //            cidr: 192.168.10.0/26
    //         network: 192.168.10.0
    //       broadcast: 192.168.10.63
    //     subnet_mask: 255.255.255.192
    //   wildcard_mask: 0.0.0.63
    //      first_host: 192.168.10.1
    //       last_host: 192.168.10.62
    //    usable_hosts: 62
    // total_addresses: 64
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Bitwise IP manipulation: check if an IP belongs to a subnet, classify private ranges",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <cstdint>
#include <arpa/inet.h>

uint32_t ip_to_int(const std::string& ip) {
    struct in_addr addr;
    inet_pton(AF_INET, ip.c_str(), &addr);
    return ntohl(addr.s_addr);
}

bool ip_in_subnet(const std::string& ip, const std::string& cidr) {
    auto slash = cidr.find('/');
    std::string net_str = cidr.substr(0, slash);
    int prefix = std::stoi(cidr.substr(slash + 1));
    uint32_t mask = (prefix == 0) ? 0 : (~0U << (32 - prefix));
    return (ip_to_int(ip) & mask) == (ip_to_int(net_str) & mask);
}

std::string classify_ip(const std::string& ip) {
    struct { const char* cidr; const char* label; } ranges[] = {
        {"10.0.0.0/8",      "Private (Class A)"},
        {"172.16.0.0/12",   "Private (Class B)"},
        {"192.168.0.0/16",  "Private (Class C)"},
        {"127.0.0.0/8",     "Loopback"},
        {"169.254.0.0/16",  "Link-Local (APIPA)"},
    };
    for (const auto& r : ranges) {
        if (ip_in_subnet(ip, r.cidr)) return r.label;
    }
    return "Public";
}

int main() {
    std::cout << std::boolalpha;
    std::cout << ip_in_subnet("192.168.1.50", "192.168.1.0/24") << "\\n";  // true
    std::cout << ip_in_subnet("192.168.2.1", "192.168.1.0/24") << "\\n";   // false
    std::cout << classify_ip("10.0.3.5") << "\\n";       // Private (Class A)
    std::cout << classify_ip("172.20.1.1") << "\\n";     // Private (Class B)
    std::cout << classify_ip("8.8.8.8") << "\\n";        // Public
    std::cout << classify_ip("169.254.100.1") << "\\n";  // Link-Local (APIPA)
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "CIDR aggregation: merge a list of contiguous prefixes into the smallest set of supernets",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cstdint>
#include <arpa/inet.h>

struct CidrBlock {
    uint32_t network;  // host-order
    int prefix;

    uint32_t end() const { return network + (1U << (32 - prefix)); }
};

uint32_t ip_to_int(const std::string& ip) {
    struct in_addr addr;
    inet_pton(AF_INET, ip.c_str(), &addr);
    return ntohl(addr.s_addr);
}

std::string int_to_ip(uint32_t n) {
    struct in_addr addr;
    addr.s_addr = htonl(n);
    char buf[INET_ADDRSTRLEN];
    inet_ntop(AF_INET, &addr, buf, sizeof(buf));
    return buf;
}

CidrBlock parse_cidr(const std::string& cidr) {
    auto slash = cidr.find('/');
    uint32_t net = ip_to_int(cidr.substr(0, slash));
    int prefix = std::stoi(cidr.substr(slash + 1));
    uint32_t mask = (prefix == 0) ? 0 : (~0U << (32 - prefix));
    return {net & mask, prefix};
}

std::vector<std::string> aggregate_cidrs(std::vector<std::string> cidr_list) {
    // Parse and sort by network address
    std::vector<CidrBlock> blocks;
    for (const auto& c : cidr_list) blocks.push_back(parse_cidr(c));
    std::sort(blocks.begin(), blocks.end(),
        [](const CidrBlock& a, const CidrBlock& b) { return a.network < b.network; });

    // Merge contiguous blocks with the same prefix into a shorter prefix
    bool merged = true;
    while (merged) {
        merged = false;
        std::vector<CidrBlock> next;
        size_t i = 0;
        while (i < blocks.size()) {
            if (i + 1 < blocks.size()
                && blocks[i].prefix == blocks[i+1].prefix
                && blocks[i].end() == blocks[i+1].network
                && (blocks[i].network & ~(~0U << (32 - blocks[i].prefix + 1))) == 0) {
                // Two adjacent same-prefix blocks that align -> merge
                next.push_back({blocks[i].network, blocks[i].prefix - 1});
                i += 2;
                merged = true;
            } else {
                next.push_back(blocks[i]);
                ++i;
            }
        }
        blocks = std::move(next);
    }

    std::vector<std::string> result;
    for (const auto& b : blocks) {
        result.push_back(int_to_ip(b.network) + "/" + std::to_string(b.prefix));
    }
    return result;
}

int main() {
    // Four contiguous /24s collapse into one /22
    auto result = aggregate_cidrs({
        "192.168.0.0/24", "192.168.1.0/24",
        "192.168.2.0/24", "192.168.3.0/24"
    });
    for (const auto& r : result) std::cout << r << " ";
    std::cout << "\\n";  // 192.168.0.0/22

    // Non-contiguous blocks stay separate
    auto mixed = aggregate_cidrs({
        "10.0.0.0/24", "10.0.1.0/24", "10.0.4.0/24"
    });
    for (const auto& r : mixed) std::cout << r << " ";
    std::cout << "\\n";  // 10.0.0.0/23 10.0.4.0/24
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "IPv4 Address Structure and Subnetting",
      kind: "architecture",
      caption: "A 32-bit IPv4 address is split into network and host portions by the subnet mask. A /26 mask gives 4 subnets from a /24, each with 64 addresses and 62 usable hosts.",
      mermaid: `graph TD
    subgraph CIDR["192.168.1.0/24 - 256 addresses"]
      S0["Subnet 0: 192.168.1.0/26\nhosts .1 to .62\nbroadcast .63"]
      S1["Subnet 1: 192.168.1.64/26\nhosts .65 to .126\nbroadcast .127"]
      S2["Subnet 2: 192.168.1.128/26\nhosts .129 to .190\nbroadcast .191"]
      S3["Subnet 3: 192.168.1.192/26\nhosts .193 to .254\nbroadcast .255"]
    end
    MASK["/26 mask = 255.255.255.192\nborrow 2 bits from host\n4 subnets x 64 addresses = 256"]
    MASK --> CIDR`,
    },
    {
      title: "NAT Packet Translation Flow",
      kind: "flow",
      caption: "PAT rewrites the source IP and port on egress, records the mapping, and restores the destination on ingress. Many private hosts share one public IP via unique ports.",
      mermaid: `flowchart LR
    HOST["Internal Host\n192.168.1.10:49152"] -->|sends TCP SYN| ROUTER
    ROUTER["NAT Router\npublic IP 203.0.113.5"]
    ROUTER -->|"rewrite src to\n203.0.113.5:12345\nstore mapping"| TABLE["Translation Table\n192.168.1.10:49152\n<-> 203.0.113.5:12345"]
    ROUTER -->|"packet with\nsrc 203.0.113.5:12345"| SERVER["Internet Server\n8.8.8.8:443"]
    SERVER -->|"reply to\n203.0.113.5:12345"| ROUTER
    ROUTER -->|"lookup table\nrewrite dst to\n192.168.1.10:49152"| HOST`,
    },
    {
      title: "VLSM Subnet Allocation",
      kind: "flow",
      caption: "VLSM allocates different prefix lengths to different subnets. Always start with the largest requirement and work downward to avoid wasted address space.",
      mermaid: `flowchart TD
    START["192.168.1.0/24\n256 total addresses"] --> SORT["Sort requirements\nlargest first:\n100 hosts, 50, 25, 2"]
    SORT --> A["Allocate 192.168.1.0/25\n126 usable for 100 hosts\nnext base: .128"]
    A --> B["Allocate 192.168.1.128/26\n62 usable for 50 hosts\nnext base: .192"]
    B --> C["Allocate 192.168.1.192/27\n30 usable for 25 hosts\nnext base: .224"]
    C --> D["Allocate 192.168.1.224/30\n2 usable for point-to-point\nnext base: .228"]
    D --> E["228 used of 256\n28 addresses remaining"]`,
    },
    {
      title: "IPv4 vs IPv6 Address Types",
      kind: "network",
      caption: "IPv4 address categories versus their IPv6 equivalents, showing the mapping from classful/private/loopback to global unicast, unique local, and link-local.",
      mermaid: `graph LR
    subgraph IPv4["IPv4 Address Space"]
      PVT4["Private\n10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16"]
      LB4["Loopback\n127.0.0.1"]
      LL4["Link-Local APIPA\n169.254.0.0/16"]
      PUB4["Public\nroutable on internet"]
    end
    subgraph IPv6["IPv6 Address Space"]
      UL6["Unique Local\nfc00::/7\nanalog of private"]
      LB6["Loopback\n::1/128"]
      LL6["Link-Local\nfe80::/10\nauto-configured"]
      GU6["Global Unicast\n2000::/3\nroutable on internet"]
      MC6["Multicast\nff00::/8\nreplaces broadcast"]
    end
    PVT4 -.->|equivalent| UL6
    LB4 -.->|equivalent| LB6
    LL4 -.->|equivalent| LL6
    PUB4 -.->|equivalent| GU6`,
    },
  ],
  animations: [
    {
      title: "Subnetting a /24 Network Step-by-Step",
      steps: [
        {
          label: "Start with the base network",
          detail: "Begin with 192.168.1.0/24. The subnet mask is 255.255.255.0, giving 256 total addresses (254 usable hosts). The network address is 192.168.1.0 and the broadcast is 192.168.1.255.",
        },
        {
          label: "Decide how many subnets are needed",
          detail: "Suppose we need 4 subnets. We need to borrow ceil(log2(4)) = 2 bits from the host portion. The new prefix length is /24 + 2 = /26.",
        },
        {
          label: "Calculate the new subnet mask",
          detail: "A /26 mask is 255.255.255.192 in dotted decimal. The block size is 2^(32-26) = 64 addresses per subnet (62 usable hosts each).",
        },
        {
          label: "Enumerate the subnets",
          detail: "Subnet 0: 192.168.1.0/26 (hosts .1-.62, broadcast .63). Subnet 1: 192.168.1.64/26 (hosts .65-.126, broadcast .127). Subnet 2: 192.168.1.128/26 (hosts .129-.190, broadcast .191). Subnet 3: 192.168.1.192/26 (hosts .193-.254, broadcast .255).",
        },
        {
          label: "Verify the result",
          detail: "4 subnets x 64 addresses = 256 total addresses, which equals the original /24 block. No addresses are wasted or overlapping. Each subnet's network and broadcast addresses are correctly derived using bitwise AND and OR with the mask.",
        },
      ],
    },
    {
      title: "How NAT Translates a Packet",
      steps: [
        {
          label: "Internal host sends a packet",
          detail: "Host 192.168.1.10 sends a TCP SYN to 8.8.8.8:443. The source is 192.168.1.10:49152. This packet arrives at the NAT router's internal interface.",
        },
        {
          label: "Router rewrites the source",
          detail: "The NAT router replaces the source IP 192.168.1.10 with its public IP 203.0.113.5 and assigns a unique external port (e.g., 12345). It records the mapping: (192.168.1.10:49152) <-> (203.0.113.5:12345) in its translation table.",
        },
        {
          label: "Packet reaches the destination",
          detail: "The server at 8.8.8.8:443 receives the packet with source 203.0.113.5:12345. It has no knowledge of the private address. It sends its SYN-ACK reply to 203.0.113.5:12345.",
        },
        {
          label: "Router translates the reply",
          detail: "The NAT router receives the reply on port 12345, looks up the translation table, and rewrites the destination from 203.0.113.5:12345 back to 192.168.1.10:49152. The packet is forwarded to the internal host.",
        },
        {
          label: "Connection established",
          detail: "The internal host receives the SYN-ACK and completes the TCP handshake. All subsequent packets in this flow are translated using the same table entry. The entry is removed after the connection closes or a timeout expires.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "IPv4", "IPv6", "Classful Addressing", "CIDR"],
    rows: [
      [
        "Address size",
        "32 bits (4 bytes)",
        "128 bits (16 bytes)",
        "32 bits with fixed class boundaries",
        "32 bits with variable-length prefix",
      ],
      [
        "Address space",
        "~4.3 billion (2^32)",
        "~3.4 x 10^38 (2^128)",
        "Same as IPv4 but rigidly partitioned",
        "Same as IPv4 but flexibly allocated",
      ],
      [
        "Notation",
        "Dotted decimal (192.168.1.1)",
        "Colon-separated hex (2001:db8::1)",
        "Dotted decimal with implicit class",
        "Dotted decimal with /prefix (10.0.0.0/22)",
      ],
      [
        "Subnetting flexibility",
        "Flexible with CIDR",
        "Always uses prefix-based subnetting",
        "Fixed at /8, /16, or /24 only",
        "Any prefix length from /0 to /32",
      ],
      [
        "Address assignment",
        "Manual, DHCP",
        "SLAAC, DHCPv6, manual",
        "Large blocks per class",
        "Right-sized blocks via allocation",
      ],
      [
        "NAT usage",
        "Widely required due to scarcity",
        "Generally unnecessary; end-to-end",
        "Contributed to the need for NAT",
        "Reduced waste but NAT still needed",
      ],
      [
        "Broadcast",
        "Supported (directed and limited)",
        "No broadcast; uses multicast instead",
        "Supported per class",
        "Supported within each CIDR block",
      ],
      [
        "Route aggregation",
        "Possible with CIDR supernetting",
        "Built-in with hierarchical allocation",
        "Not possible across classes",
        "Core capability; reduces routing table size",
      ],
      [
        "Header complexity",
        "Variable length (20-60 bytes)",
        "Fixed 40-byte base header + extensions",
        "Same as IPv4",
        "Same as IPv4",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Given the CIDR block 10.10.0.0/22, how many usable host addresses are available, and what is the broadcast address?",
      a: "A /22 prefix leaves 32 - 22 = 10 host bits, giving 2^10 = 1024 total addresses. Subtract 2 (network and broadcast) for 1022 usable hosts. The network address is 10.10.0.0. The broadcast is calculated by setting all host bits to 1: 10.10.0.0 OR 0.0.3.255 = 10.10.3.255.",
      followUps: [
        "What is the valid host range for this subnet?",
        "If you needed to split this /22 into subnets of at least 200 hosts each, what prefix length would you use and how many subnets would result?",
      ],
    },
    {
      q: "Explain the difference between a subnet mask and a wildcard mask. Where is each one used?",
      a: "A subnet mask has contiguous 1-bits from the left indicating the network portion (e.g., 255.255.255.0 for /24). A wildcard mask is the bitwise inverse of the subnet mask (e.g., 0.0.0.255 for /24). Subnet masks are used in interface configuration, routing tables, and DHCP. Wildcard masks are used in access control lists (ACLs) on Cisco routers and in OSPF network statements, where 1-bits indicate 'don't care' positions. For example, the wildcard 0.0.0.255 matches any host in a /24, while 0.0.3.255 matches any address in a /22 block.",
      followUps: [
        "How would you write an ACL entry to match all hosts in 172.16.0.0/20?",
        "Can a wildcard mask be non-contiguous, and when would you use one?",
      ],
    },
    {
      q: "What is VLSM and why is it important? Walk through an example.",
      a: "VLSM (Variable Length Subnet Masking) allows different subnets within the same address space to have different prefix lengths, matching each subnet's size to its actual host requirement. Without VLSM, a uniform mask wastes addresses in small subnets. Example: given 192.168.1.0/24, you need subnets for 100, 50, 25, and 2 hosts. Allocate: 192.168.1.0/25 (126 hosts) for 100; 192.168.1.128/26 (62 hosts) for 50; 192.168.1.192/27 (30 hosts) for 25; 192.168.1.224/30 (2 hosts) for point-to-point links. Total used: 128+64+32+4 = 228 out of 256 addresses, with 28 remaining for future growth.",
      followUps: [
        "What routing protocol feature is required to support VLSM?",
        "How do you verify that VLSM subnets do not overlap?",
      ],
    },
    {
      q: "Why was IPv6 designed, and what are its key improvements over IPv4?",
      a: "IPv6 was created primarily to solve IPv4 address exhaustion. Key improvements include: (1) a vastly larger 128-bit address space; (2) simplified header format (fixed 40 bytes, no header checksum, no fragmentation by routers) for faster forwarding; (3) mandatory IPsec support; (4) SLAAC for stateless auto-configuration using interface identifiers derived from MAC addresses or random values (privacy extensions); (5) elimination of broadcast in favor of multicast and anycast; (6) flow labels for QoS handling; and (7) extension headers replacing IPv4's variable-length options field, enabling more efficient processing.",
      followUps: [
        "How does SLAAC work, and what is the role of Router Solicitation/Advertisement?",
        "What is a dual-stack deployment and how does it differ from tunneling approaches?",
      ],
    },
    {
      q: "How does longest prefix match work in routing, and why does it matter for CIDR?",
      a: "When a router has multiple routes matching a destination IP, it selects the route with the longest (most specific) prefix. For example, if the routing table has 10.0.0.0/8 and 10.0.1.0/24, a packet destined for 10.0.1.5 matches both, but /24 is chosen because it is more specific (24 > 8). This mechanism is what makes CIDR work: ISPs can advertise an aggregate route (e.g., /16), while individual customers' more-specific routes (/24) override it when needed. Routing lookups are typically implemented using tries (prefix trees) or TCAM hardware for O(W) worst-case matching, where W is the address width.",
      followUps: [
        "What happens if two routes have the same prefix length but different next hops?",
        "How does a router handle a default route (0.0.0.0/0) in relation to longest prefix match?",
      ],
    },
    {
      q: "Explain the three types of NAT (Static, Dynamic, PAT). When would you use each?",
      a: "Static NAT maps one private IP to one public IP permanently. It is used when an internal server (e.g., a web server at 192.168.1.10) must be reachable from outside at a consistent public address. Dynamic NAT uses a pool of public IPs assigned on a first-come-first-served basis; when the pool is exhausted, new connections are denied. PAT (Port Address Translation) maps many private IPs to a single public IP by assigning unique source ports to each connection. PAT is by far the most common: a typical home router uses PAT to let dozens of devices share one public IP. Dynamic NAT is rare in practice because PAT achieves the same goal more efficiently.",
      followUps: [
        "What is the difference between SNAT and DNAT?",
        "How does NAT traversal work for protocols like WebRTC?",
      ],
    },
  ],
  followUps: [
    "Explore how DHCP assigns IP addresses and works with relay agents across subnets.",
    "Study DNS resolution and how domain names map to IP addresses using A (IPv4) and AAAA (IPv6) records.",
    "Learn about routing protocols (OSPF, BGP, EIGRP) and how they build and maintain routing tables.",
    "Investigate IPv6 transition mechanisms: dual-stack, 6to4, Teredo, NAT64, and DNS64.",
    "Understand VLANs and how they relate to subnetting at Layer 2 vs Layer 3.",
    "Study network security concepts: firewalls, ACLs, IPsec, and how they interact with addressing.",
  ],
  mcqs: [
    {
      q: "How many usable host addresses are available in a /28 subnet?",
      options: ["14", "16", "30", "32"],
      answerIndex: 0,
      explanation: "A /28 has 32 - 28 = 4 host bits, giving 2^4 = 16 total addresses. Subtract 2 for the network and broadcast addresses: 16 - 2 = 14 usable hosts.",
    },
    {
      q: "Which of the following is a valid IPv6 link-local address?",
      options: ["2001:db8::1", "fe80::1", "ff02::1", "::1"],
      answerIndex: 1,
      explanation: "Link-local addresses in IPv6 always fall in the fe80::/10 range. 2001:db8::/32 is the documentation prefix, ff02::1 is all-nodes multicast, and ::1 is the loopback address.",
    },
    {
      q: "What is the subnet mask for a /20 network?",
      options: [
        "255.255.240.0",
        "255.255.248.0",
        "255.255.224.0",
        "255.255.252.0",
      ],
      answerIndex: 0,
      explanation: "A /20 mask has 20 ones followed by 12 zeros. The first two octets are all ones (255.255). The third octet has 4 ones and 4 zeros: 11110000 = 240. The fourth octet is all zeros. So the mask is 255.255.240.0.",
    },
    {
      q: "Which private IP range provides the largest address space?",
      options: [
        "172.16.0.0/12",
        "10.0.0.0/8",
        "192.168.0.0/16",
        "169.254.0.0/16",
      ],
      answerIndex: 1,
      explanation: "10.0.0.0/8 has 2^24 = 16,777,216 addresses. 172.16.0.0/12 has 2^20 = 1,048,576 addresses. 192.168.0.0/16 has 2^16 = 65,536 addresses. 169.254.0.0/16 is link-local (APIPA), not a private range for general use.",
    },
    {
      q: "If you need to create exactly 8 subnets from a /24 network, what prefix length should you use?",
      options: ["/26", "/27", "/28", "/25"],
      answerIndex: 1,
      explanation: "To create 8 subnets, you need to borrow ceil(log2(8)) = 3 bits from the host portion. The new prefix length is /24 + 3 = /27, yielding 2^3 = 8 subnets, each with 2^5 - 2 = 30 usable hosts.",
    },
    {
      q: "What is the broadcast address for the subnet 172.16.32.0/20?",
      options: [
        "172.16.47.255",
        "172.16.63.255",
        "172.16.32.255",
        "172.16.255.255",
      ],
      answerIndex: 0,
      explanation: "A /20 has 12 host bits. The third octet of the network is 32 (00100000). Setting the lower 4 bits of this octet and all 8 bits of the fourth octet to 1 gives: 00101111.11111111 = 47.255. So the broadcast is 172.16.47.255.",
    },
    {
      q: "In IPv6, what does the :: notation represent?",
      options: [
        "A single group of zeros",
        "One or more contiguous groups of all-zero values",
        "The subnet mask",
        "The default gateway",
      ],
      answerIndex: 1,
      explanation: "The :: shorthand represents one or more contiguous 16-bit groups of all zeros. It can only be used once in an address to avoid ambiguity. For example, 2001:db8::1 expands to 2001:0db8:0000:0000:0000:0000:0000:0001.",
    },
  ],
  exercises: [
    "Given the network 172.16.0.0/16, design a VLSM scheme to accommodate the following departments: Engineering (500 hosts), Sales (200 hosts), HR (50 hosts), and Management (10 hosts). List each subnet's CIDR, usable range, and broadcast address.",
    "Write a program that takes a list of IP addresses and a CIDR block, and outputs which IPs are inside the block and which are outside. Use only bitwise operations (no library IP parsing).",
    "Calculate the number of /26 subnets that can be created from a /19 network. Verify by listing the first and last three subnet addresses.",
    "An organization has been assigned 203.0.113.0/24. They need 5 subnets: one with 100 hosts, two with 30 hosts each, and two point-to-point links (2 hosts each). Design the addressing scheme using VLSM, ensuring no address waste.",
    "Convert the IPv6 address 2001:0db8:0000:0000:0000:ff00:0042:8329 to its shortest valid form. Then expand fe80::1%eth0 to its full 128-bit representation and explain the %eth0 suffix.",
    "Build a routing table simulator: given a table of CIDR routes with next-hop addresses, implement longest-prefix-match lookup. Test with at least 5 destination IPs that exercise default routes, specific routes, and overlapping prefixes.",
  ],
  flashcards: [
    {
      front: "How many usable hosts in a /24 subnet?",
      back: "254 usable hosts. Total addresses = 2^(32-24) = 256. Subtract 2 for the network address (.0) and broadcast address (.255).",
    },
    {
      front: "What are the three RFC 1918 private IPv4 address ranges?",
      back: "10.0.0.0/8 (10.0.0.0 - 10.255.255.255), 172.16.0.0/12 (172.16.0.0 - 172.31.255.255), and 192.168.0.0/16 (192.168.0.0 - 192.168.255.255).",
    },
    {
      front: "What is the subnet mask for /20 in dotted decimal?",
      back: "255.255.240.0. The first 20 bits are 1s: 11111111.11111111.11110000.00000000.",
    },
    {
      front: "What does CIDR stand for and what problem does it solve?",
      back: "Classless Inter-Domain Routing. It replaced wasteful classful addressing by allowing arbitrary prefix lengths, enabling efficient allocation and route aggregation.",
    },
    {
      front: "How does a router determine the network address from an IP and subnet mask?",
      back: "Bitwise AND: IP AND subnet_mask = network address. For example, 192.168.5.130 AND 255.255.255.192 = 192.168.5.128.",
    },
    {
      front: "What is the IPv6 link-local address range and its purpose?",
      back: "fe80::/10. Automatically configured on every IPv6 interface, used for neighbor discovery and local-segment communication. Not routable beyond the link.",
    },
    {
      front: "What is PAT (Port Address Translation)?",
      back: "A form of NAT where many private IPs share one public IP. Connections are distinguished by unique source port numbers, tracked in a translation table.",
    },
    {
      front: "What is the formula for usable hosts given a prefix length n?",
      back: "Usable hosts = 2^(32 - n) - 2. The subtracted 2 accounts for the network address (all host bits 0) and the broadcast address (all host bits 1).",
    },
    {
      front: "What is VLSM?",
      back: "Variable Length Subnet Masking: using different prefix lengths for different subnets within the same network, so each subnet is right-sized for its host count. Requires a routing protocol that carries prefix length info (e.g., OSPF, EIGRP, BGP).",
    },
    {
      front: "What is the block size (subnet increment) for a /26?",
      back: "64. Calculated as 2^(32-26) = 2^6 = 64. Subnets start at multiples of 64 within the last octet: .0, .64, .128, .192.",
    },
  ],
  revisionNotes: [
    "IPv4 = 32 bits (4 octets), ~4.3 billion addresses. IPv6 = 128 bits (8 hex groups), ~3.4 x 10^38 addresses.",
    "Subnet mask: contiguous 1-bits define the network portion. /n means the first n bits are network. Wildcard mask = bitwise NOT of subnet mask.",
    "Network address = IP AND mask. Broadcast = network OR wildcard. First host = network + 1. Last host = broadcast - 1.",
    "Usable hosts = 2^(32-n) - 2. Block size = 2^(32-n). Number of subnets from borrowing b bits = 2^b.",
    "CIDR replaced classful (A=/8, B=/16, C=/24) with arbitrary prefix lengths. Enables supernetting (route aggregation) and efficient allocation.",
    "VLSM: different subnets can have different prefix lengths. Always allocate the largest subnet first when planning VLSM.",
    "Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. These require NAT to reach the public internet.",
    "NAT types: Static (1:1), Dynamic (pool), PAT/NAT overload (many:1 with port differentiation). PAT is the most common.",
    "IPv6 has no broadcast; uses multicast (ff00::/8) and anycast instead. Link-local (fe80::/10) is auto-configured and mandatory.",
    "Longest prefix match: routers pick the most specific matching route. This is the foundation of CIDR routing.",
  ],
  cheatSheet: [
    "/32 = 1 host (host route) | /31 = 2 addresses (point-to-point per RFC 3021) | /30 = 4 addresses, 2 usable",
    "/28 = 16 addresses, 14 usable | /27 = 32 addresses, 30 usable | /26 = 64 addresses, 62 usable",
    "/25 = 128 addresses, 126 usable | /24 = 256 addresses, 254 usable (one 'Class C')",
    "/22 = 1024 addresses, 1022 usable | /20 = 4096 addresses | /16 = 65536 addresses (one 'Class B')",
    "Subnet mask quick table: /25=128, /26=192, /27=224, /28=240, /29=248, /30=252 (last octet values)",
    "To find number of subnets: borrow b bits -> 2^b subnets. To find prefix: need h hosts -> find smallest n where 2^(32-n)-2 >= h.",
    "Private ranges: 10.0.0.0/8 | 172.16.0.0/12 (172.16-172.31) | 192.168.0.0/16",
    "IPv6 short forms: drop leading zeros, replace one longest run of :0000: groups with ::. Example: 2001:0db8:0000:0000:0000:0000:0000:0001 -> 2001:db8::1",
    "IPv6 scopes: ::1/128 loopback | fe80::/10 link-local | fc00::/7 unique local | 2000::/3 global unicast | ff00::/8 multicast",
    "NAT: src rewrite on egress, dst rewrite on ingress. PAT adds port mapping. Translation table tracks (private_ip:port <-> public_ip:port).",
    "Supernetting rule: blocks must be contiguous, count must be power of 2, first block must be aligned to combined size.",
  ],
  resources: [
    {
      label: "RFC 791 - Internet Protocol (IPv4 specification)",
      kind: "docs",
      note: "The foundational specification defining IPv4 packet format, addressing, and fragmentation.",
    },
    {
      label: "RFC 4291 - IP Version 6 Addressing Architecture",
      kind: "docs",
      note: "Defines IPv6 address types (unicast, multicast, anycast), scopes, and text representation rules.",
    },
    {
      label: "RFC 1918 - Address Allocation for Private Internets",
      kind: "docs",
      note: "Defines the three private IPv4 address ranges (10/8, 172.16/12, 192.168/16) and their usage guidelines.",
    },
    {
      label: "Computer Networking: A Top-Down Approach by Kurose & Ross",
      kind: "book",
      note: "Chapters 4-5 cover IP addressing, subnetting, CIDR, NAT, and routing in depth with clear examples.",
    },
    {
      label: "TCP/IP Illustrated, Volume 1 by W. Richard Stevens",
      kind: "book",
      note: "Classic reference with packet-level detail on IP addressing, subnetting, ARP, and ICMP.",
    },
    {
      label: "Practical Networking - Subnetting Mastery (YouTube series)",
      kind: "video",
      note: "Step-by-step video tutorials covering subnetting fundamentals, VLSM, and CIDR with practice problems.",
    },
    {
      label: "Subnet Calculator by David C",
      kind: "repo",
      note: "Open-source subnet calculator with VLSM support, useful for verifying manual calculations.",
    },
    {
      label: "RFC 4632 - CIDR: The Internet Address Assignment and Aggregation Plan",
      kind: "docs",
      note: "Best current practice document explaining CIDR motivation, allocation strategies, and route aggregation.",
    },
  ],
  glossary: [
    {
      term: "CIDR (Classless Inter-Domain Routing)",
      definition: "An addressing scheme that uses variable-length prefixes (e.g., /22) instead of fixed classful boundaries, enabling efficient IP allocation and route aggregation.",
    },
    {
      term: "Subnet Mask",
      definition: "A 32-bit value with contiguous leading 1-bits that identifies the network portion of an IP address. Applied via bitwise AND to extract the network address.",
    },
    {
      term: "Wildcard Mask",
      definition: "The bitwise inverse of a subnet mask, used in ACLs and OSPF. Bits set to 1 indicate 'don't care' positions when matching addresses.",
    },
    {
      term: "NAT (Network Address Translation)",
      definition: "A technique that remaps private IP addresses to public ones in packet headers as they cross a router, enabling multiple hosts to share limited public addresses.",
    },
    {
      term: "VLSM (Variable Length Subnet Masking)",
      definition: "The practice of using different subnet mask lengths for different subnets within the same network, optimizing address space utilization.",
    },
    {
      term: "Broadcast Address",
      definition: "The last address in a subnet (all host bits set to 1). Packets sent to this address are delivered to all hosts on that subnet.",
    },
    {
      term: "SLAAC (Stateless Address Autoconfiguration)",
      definition: "An IPv6 mechanism where hosts generate their own addresses by combining a network prefix (from Router Advertisements) with an interface identifier, without needing DHCP.",
    },
    {
      term: "Supernetting",
      definition: "Aggregating multiple contiguous network prefixes into a single, shorter prefix to reduce routing table size. The inverse of subnetting.",
    },
    {
      term: "Loopback Address",
      definition: "127.0.0.1 in IPv4 (entire 127.0.0.0/8 block) or ::1 in IPv6. Used to send traffic to the local host without touching the network.",
    },
    {
      term: "Link-Local Address",
      definition: "An address valid only on the local network segment. IPv4: 169.254.0.0/16 (APIPA). IPv6: fe80::/10 (auto-configured, used for neighbor discovery).",
    },
    {
      term: "Anycast",
      definition: "An addressing method where the same IP address is assigned to multiple nodes; packets are routed to the topologically nearest instance. Used in IPv6 natively and in IPv4 for services like DNS root servers.",
    },
    {
      term: "Octet",
      definition: "An 8-bit segment of an IP address. IPv4 addresses have four octets, each ranging from 0 to 255 in decimal.",
    },
  ],
};
