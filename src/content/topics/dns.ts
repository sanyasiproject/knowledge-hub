import type { TopicContent } from "../types";

export const dns: TopicContent = {
  quickSummary: [
    "DNS (Domain Name System) translates human-readable domain names like example.com into IP addresses that computers use to route traffic across the internet.",
    "It operates as a distributed, hierarchical database spanning root servers, TLD servers, and authoritative nameservers, with aggressive caching at every layer to keep lookups fast.",
    "Common record types include A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail routing), NS (delegation), TXT (arbitrary metadata), and SRV (service location).",
    "DNS is a foundational internet protocol — virtually every HTTP request, email delivery, and service discovery flow begins with a DNS lookup.",
  ],
  detailed: [
    "The DNS namespace is organized as an inverted tree. At the top is the root zone (denoted by a trailing dot), below it are top-level domains (TLDs) like .com, .org, and country-code TLDs like .uk, and below those are second-level domains registered by organizations. Each level delegates authority to the next, forming a chain of trust and responsibility that makes the system scalable to billions of names.",
    "A full DNS resolution begins when a client application calls a stub resolver, which forwards the query to a recursive resolver (typically operated by the ISP or a public service like 8.8.8.8). The recursive resolver walks the hierarchy: it asks a root server which TLD server handles .com, then asks that TLD server which authoritative nameserver handles example.com, and finally asks the authoritative server for the actual record. Each answer includes a TTL (time-to-live) that controls how long the result can be cached.",
    "Record types serve distinct purposes. An A record maps a name to an IPv4 address; AAAA does the same for IPv6. A CNAME record creates an alias — looking up www.example.com might return a CNAME pointing to example.com, which then resolves to an A record. MX records direct email by specifying mail servers with priority values. NS records delegate a zone to specific nameservers. TXT records carry arbitrary text and are widely used for SPF, DKIM, and domain verification. SOA records define zone-level parameters such as the serial number, refresh interval, and negative caching TTL.",
    "Recursive resolution means a single resolver does all the walking on behalf of the client and returns the final answer. Iterative resolution means each server the resolver contacts returns a referral to the next server rather than doing the work itself — the resolver must follow each referral. In practice, recursive resolvers perform iterative queries behind the scenes, assembling the full answer before returning it to the client's stub resolver.",
    "Caching is critical to DNS performance and scalability. Without caching, every web page load could trigger dozens of queries up to the root servers. Recursive resolvers cache responses according to their TTL, and many operating systems and browsers maintain their own DNS caches. Negative caching (caching NXDOMAIN responses) prevents repeated lookups for non-existent names. The trade-off is propagation delay: after a DNS change, stale cached records persist until their TTL expires, which is why lowering TTLs before planned changes is a common operational practice.",
  ],
  deepDive: [
    "A DNS message consists of a fixed 12-byte header followed by four variable-length sections: Question (what is being asked), Answer (resource records answering the question), Authority (NS records pointing to authoritative servers), and Additional (extra records like glue A records). The header contains a 16-bit transaction ID for matching responses to queries, flags indicating whether the message is a query or response, whether recursion is desired or available, and a response code (RCODE) such as NOERROR, NXDOMAIN, or SERVFAIL. Names in the wire format use length-prefixed labels with a compression scheme that replaces repeated suffixes with pointers, keeping packets compact.",
    "DNSSEC (DNS Security Extensions) adds cryptographic authentication to DNS responses. Each zone signs its records with a private key, producing RRSIG records. The corresponding public key is published as a DNSKEY record, and a DS (Delegation Signer) record in the parent zone chains trust upward to the root. Validating resolvers verify the signature chain from the root's trust anchor down to the queried record. DNSSEC proves authenticity and integrity — it prevents cache poisoning and spoofing — but it does not encrypt queries or responses, so eavesdropping remains possible without additional measures.",
    "DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) encrypt DNS traffic to prevent eavesdropping and tampering on the wire. DoT wraps standard DNS messages in TLS on port 853. DoH encodes DNS queries as HTTPS requests (typically using wire-format payloads with application/dns-message content type) on port 443, making DNS traffic indistinguishable from regular HTTPS and harder to block. Both approaches shift trust from the network path to the recursive resolver operator and have sparked debate about centralization, enterprise visibility, and the role of ISPs in DNS resolution.",
    "Anycast is the deployment model used by most large DNS providers and all 13 root server identities. Multiple physical servers in different geographic locations share the same IP address; BGP routing directs each client to the topologically nearest instance. This provides low latency, automatic failover, and natural DDoS absorption — attack traffic is distributed across all anycast nodes rather than concentrated on a single target. The 13 root server letters actually represent over 1,500 physical instances worldwide.",
    "Zone transfers (AXFR for full, IXFR for incremental) replicate zone data from a primary nameserver to its secondaries. AXFR sends the entire zone file; IXFR sends only changes since a given SOA serial number, saving bandwidth. Transfers should be restricted by IP with ACLs and protected with TSIG (Transaction Signature) shared-secret authentication to prevent unauthorized parties from downloading the full zone contents — a common reconnaissance step in security assessments. Glue records are A/AAAA records included in the parent zone for nameservers that reside within the zone they serve, breaking the circular dependency (e.g., if ns1.example.com is the nameserver for example.com, the .com zone must include ns1.example.com's IP as glue). DNS amplification attacks exploit open resolvers by sending small queries with a spoofed source IP; the resolver returns a much larger response (amplification factors of 50x or more) to the victim, making DNS a popular vector for volumetric DDoS attacks. Mitigations include response rate limiting (RRL), disabling open recursion, and BCP 38 source-address validation.",
  ],
  code: [
    {
      language: "python",
      caption: "DNS lookup using Python's dnspython library",
      source: `import dns.resolver

# Resolve A records
answers = dns.resolver.resolve("example.com", "A")
for rdata in answers:
    print(f"A record: {rdata.address}")

# Resolve MX records with priority
mx_answers = dns.resolver.resolve("example.com", "MX")
for rdata in mx_answers:
    print(f"MX: priority={rdata.preference}, server={rdata.exchange}")

# Resolve TXT records (e.g., SPF)
txt_answers = dns.resolver.resolve("example.com", "TXT")
for rdata in txt_answers:
    print(f"TXT: {rdata.to_text()}")

# Reverse DNS lookup
from dns.reversename import from_address
rev_name = from_address("93.184.216.34")
ptr_answers = dns.resolver.resolve(rev_name, "PTR")
for rdata in ptr_answers:
    print(f"PTR: {rdata.target}")`,
    },
    {
      language: "bash",
      caption: "Common dig commands for DNS troubleshooting",
      source: `# Basic A record lookup
dig example.com A

# Query a specific nameserver
dig @8.8.8.8 example.com A

# Get all record types for a domain
dig example.com ANY

# Trace the full resolution path from root to authoritative
dig +trace example.com

# Short output — just the answer
dig +short example.com A

# Check MX records
dig example.com MX +noall +answer

# Query for DNSSEC records
dig example.com DNSKEY +dnssec

# Reverse DNS lookup
dig -x 93.184.216.34

# Check SOA record and zone serial
dig example.com SOA +short

# Check nameserver delegation
dig example.com NS +noall +authority`,
    },
    {
      language: "python",
      caption: "Minimal iterative DNS resolver demonstrating the resolution chain",
      source: `import socket
import struct

def build_query(domain: str, qtype: int = 1) -> bytes:
    """Build a minimal DNS query packet."""
    import os
    txn_id = os.urandom(2)
    flags = (0).to_bytes(2, "big")         # standard query, recursion NOT desired
    counts = struct.pack("!HHHH", 1, 0, 0, 0)  # 1 question
    # Encode domain name as length-prefixed labels
    qname = b""
    for label in domain.split("."):
        qname += bytes([len(label)]) + label.encode()
    qname += b"\\x00"  # root label
    question = qname + struct.pack("!HH", qtype, 1)  # type A, class IN
    return txn_id + flags + counts + question

def parse_response(data: bytes):
    """Extract the first A record or NS referral from a DNS response."""
    flags = struct.unpack("!H", data[2:4])[0]
    ancount = struct.unpack("!H", data[6:8])[0]
    nscount = struct.unpack("!H", data[8:10])[0]
    arcount = struct.unpack("!H", data[10:12])[0]
    # Skip question section
    offset = 12
    while data[offset] != 0:
        offset += data[offset] + 1
    offset += 5  # null byte + QTYPE + QCLASS
    # Parse answer records
    for _ in range(ancount):
        offset += 2 if data[offset] & 0xC0 else (data[offset] + 1)
        rtype = struct.unpack("!H", data[offset:offset+2])[0]
        rdlen = struct.unpack("!H", data[offset+8:offset+10])[0]
        if rtype == 1 and rdlen == 4:
            ip = ".".join(str(b) for b in data[offset+10:offset+14])
            return ("answer", ip)
        offset += 10 + rdlen
    return ("referral", None)  # simplified — follow NS in Additional

def resolve(domain: str):
    """Walk the DNS tree from a root server (simplified)."""
    server = "198.41.0.4"  # a.root-servers.net
    print(f"Resolving {domain} starting from root {server}")
    for step in range(10):
        query = build_query(domain)
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(3)
        sock.sendto(query, (server, 53))
        data, _ = sock.recvfrom(512)
        sock.close()
        kind, value = parse_response(data)
        if kind == "answer":
            print(f"Resolved: {domain} -> {value}")
            return value
        print(f"Step {step}: referred, next server needed")
    raise Exception("Resolution failed")

# resolve("example.com")  # uncomment to run`,
    },
  ],
  diagrams: [
    {
      title: "DNS resolution hierarchy",
      kind: "architecture",
      caption: "The hierarchical structure from root servers through TLD servers to authoritative nameservers, with recursive resolvers acting as intermediaries for clients.",
    },
    {
      title: "Recursive DNS query flow",
      kind: "sequence",
      caption: "Sequence of messages: client to recursive resolver, resolver to root, root referral to TLD, TLD referral to authoritative, authoritative answer back through the resolver to the client.",
    },
    {
      title: "DNS record type taxonomy",
      kind: "mindmap",
      caption: "Map of DNS record types grouped by function: address records (A, AAAA), alias/delegation (CNAME, NS, DNAME), mail (MX), security (DNSKEY, DS, RRSIG, TLSA), service discovery (SRV), and metadata (TXT, SOA, PTR).",
    },
    {
      title: "DNSSEC chain of trust",
      kind: "flow",
      caption: "Trust flows from the root KSK through DS records in each parent zone down to the DNSKEY and RRSIG records in the target zone, forming a verifiable signature chain.",
    },
  ],
  animations: [
    {
      title: "Full recursive DNS resolution",
      steps: [
        { label: "Application calls stub resolver", detail: "A program calls getaddrinfo('www.example.com'). The OS stub resolver checks its local cache first." },
        { label: "Query sent to recursive resolver", detail: "Cache miss — the stub forwards the query to the configured recursive resolver (e.g., 8.8.8.8) with the Recursion Desired (RD) flag set." },
        { label: "Recursive resolver checks its cache", detail: "The resolver looks for www.example.com in its cache. If found and the TTL has not expired, it returns the cached answer immediately." },
        { label: "Query root server", detail: "Cache miss — the resolver sends an iterative query to a root server (e.g., 198.41.0.4). The root does not know the answer but returns a referral: the NS records for .com and their glue A records." },
        { label: "Query TLD server", detail: "The resolver follows the referral and queries a .com TLD server. It returns another referral: the NS records for example.com." },
        { label: "Query authoritative server", detail: "The resolver queries one of example.com's authoritative nameservers. It returns the A record for www.example.com along with the TTL." },
        { label: "Response cached and returned", detail: "The recursive resolver caches the answer (and the intermediate NS referrals) according to their TTLs, then returns the final A record to the client's stub resolver." },
        { label: "Connection established", detail: "The application now has the IP address and can open a TCP connection to the web server." },
      ],
    },
    {
      title: "DNSSEC validation walkthrough",
      steps: [
        { label: "Resolver requests DNSKEY for root", detail: "The validating resolver already has the root zone's trust anchor (KSK hash). It fetches the root DNSKEY RRset and verifies the RRSIG over it using the trust anchor." },
        { label: "Verify DS for .com in root zone", detail: "The resolver fetches the DS record for .com from the root zone and verifies its RRSIG using the now-trusted root ZSK." },
        { label: "Fetch and verify .com DNSKEY", detail: "The resolver fetches .com's DNSKEY RRset and checks that the KSK's hash matches the DS record from the root. It then verifies the RRSIG over the DNSKEY RRset." },
        { label: "Verify DS for example.com", detail: "The resolver fetches the DS record for example.com from the .com zone and verifies it using .com's ZSK." },
        { label: "Validate the final answer", detail: "The resolver fetches example.com's DNSKEY, verifies it against the DS, then uses example.com's ZSK to verify the RRSIG over the queried A record. If all signatures check out, the response is marked as authenticated (AD flag)." },
      ],
    },
  ],
  comparison: {
    columns: ["Record Type", "Purpose", "Example Value", "Common Use Case", "TTL Guidance"],
    rows: [
      ["A", "Maps name to IPv4 address", "93.184.216.34", "Hosting a website or API endpoint", "300-3600s; lower before migrations"],
      ["AAAA", "Maps name to IPv6 address", "2606:2800:220:1:248:1893:25c8:1946", "IPv6-enabled services", "Same as A record"],
      ["CNAME", "Alias to another domain name", "www.example.com -> example.com", "Pointing subdomains to a canonical name or CDN", "3600s+; cannot coexist with other records at zone apex"],
      ["MX", "Mail exchange with priority", "10 mail.example.com", "Routing inbound email to mail servers", "3600s; keep stable for email reliability"],
      ["NS", "Delegates a zone to nameservers", "ns1.example.com", "Zone delegation; pointing to DNS hosting provider", "86400s; rarely changes"],
      ["TXT", "Arbitrary text data", "v=spf1 include:_spf.google.com ~all", "SPF, DKIM, domain verification, DMARC", "3600s; depends on verification requirements"],
      ["SRV", "Service location with port and priority", "10 5 5060 sip.example.com", "VoIP, XMPP, LDAP service discovery", "3600s; adjust for failover speed"],
      ["SOA", "Zone metadata and serial number", "ns1.example.com admin.example.com 2024010101 ...", "Zone transfers, negative caching TTL", "Set by zone; refresh/retry/expire timers"],
      ["PTR", "Reverse IP to name mapping", "34.216.184.93.in-addr.arpa -> example.com", "Reverse DNS for email deliverability, logging", "86400s; must match forward A record"],
    ],
  },
  interviewQA: [
    {
      q: "Walk me through what happens when you type 'example.com' into a browser, focusing on the DNS portion.",
      a: "The browser first checks its own DNS cache. If it misses, it calls the OS stub resolver, which checks the OS cache. On a miss there, the stub resolver sends a recursive query to the configured DNS resolver (e.g., ISP or 8.8.8.8). The recursive resolver performs iterative queries: it asks a root server for .com, gets a referral to a .com TLD server, asks the TLD server for example.com, gets a referral to example.com's authoritative nameserver, and finally gets the A record. Each response is cached according to its TTL. The final IP is returned to the browser, which then initiates a TCP handshake.",
      followUps: [
        "What happens if the recursive resolver's cache already has the NS records for .com but not for example.com?",
        "How does negative caching work if the domain does not exist?",
        "What role does the TTL play in DNS propagation delays?",
      ],
    },
    {
      q: "What is the difference between an A record and a CNAME record? Can you use a CNAME at the zone apex?",
      a: "An A record maps a domain name directly to an IPv4 address, while a CNAME creates an alias pointing one name to another name — the resolver must then resolve the target name to get the actual IP. Per RFC 1034, a CNAME cannot coexist with any other record type at the same name, and since the zone apex requires SOA and NS records, a standard CNAME at the apex violates the spec. Some DNS providers work around this with proprietary ALIAS or ANAME pseudo-records that resolve the target server-side and return an A record, but these are not standardized.",
      followUps: [
        "What is a DNAME record and how does it differ from CNAME?",
        "How do CDN providers handle apex domains without CNAME support?",
      ],
    },
    {
      q: "Explain DNSSEC. What attacks does it prevent, and what doesn't it protect against?",
      a: "DNSSEC adds cryptographic signatures to DNS records. Each zone has a ZSK (Zone Signing Key) that signs individual RRsets and a KSK (Key Signing Key) that signs the DNSKEY RRset. A DS record in the parent zone hashes the child's KSK, creating a chain of trust from the signed root zone down. DNSSEC prevents cache poisoning (Kaminsky attack), response spoofing, and record tampering. However, it does NOT encrypt DNS traffic — queries and responses are still plaintext and visible to on-path observers. It also does not prevent DDoS attacks and can actually amplify them because signed responses are larger. Zone walking (enumerating records via NSEC) is another concern, partially mitigated by NSEC3.",
      followUps: [
        "What is the difference between KSK and ZSK, and why have two keys?",
        "How does NSEC3 prevent zone enumeration?",
        "What is the relationship between DNSSEC and DNS-over-HTTPS?",
      ],
    },
    {
      q: "How would you debug a DNS issue where users report intermittent failures resolving your domain?",
      a: "Start with dig +trace to walk the resolution path and identify where it breaks. Check the authoritative nameservers with dig @ns1.example.com example.com to verify they are responding correctly. Compare results from multiple resolvers (8.8.8.8, 1.1.1.1, the user's ISP resolver) to identify caching or propagation issues. Check the SOA serial numbers across primary and secondary nameservers to ensure zone transfers are working. Look at TTL values — very low TTLs increase the chance of transient failures. Check for SERVFAIL responses which might indicate DNSSEC validation failures, broken delegation, or lame nameservers. Use tools like dnsviz.net to visualize the DNSSEC chain and identify broken signatures or expired keys.",
      followUps: [
        "What is a lame delegation and how do you fix it?",
        "How would you handle an issue where only one geographic region is affected?",
      ],
    },
    {
      q: "What is DNS-over-HTTPS and how does it change the DNS landscape?",
      a: "DNS-over-HTTPS (DoH) encrypts DNS queries by sending them as HTTPS requests to a DoH-compatible resolver (e.g., https://dns.google/dns-query). Unlike traditional DNS over UDP/53, DoH traffic blends with normal HTTPS traffic on port 443, making it resistant to blocking and inspection. This provides privacy from on-path observers but shifts trust to the DoH resolver operator. It has significant implications: enterprises lose visibility into DNS queries for security monitoring, ISPs cannot apply DNS-based content filtering, and it centralizes DNS resolution to a few large providers. DNS-over-TLS (DoT) on port 853 offers similar encryption but is easier to identify and block on the network.",
      followUps: [
        "How does DoH affect enterprise security monitoring?",
        "What is Oblivious DNS-over-HTTPS (ODoH)?",
      ],
    },
    {
      q: "Explain how DNS-based load balancing works and its limitations.",
      a: "DNS-based load balancing returns different IP addresses for the same domain name on each query — this can be simple round-robin (cycling through a list), weighted (returning IPs in proportion to configured weights), or geo-based (returning the nearest server's IP based on the resolver's location). The key limitation is caching: once a resolver caches an answer, it keeps returning that IP until the TTL expires, so traffic distribution is coarse-grained and unresponsive to real-time load changes. DNS also cannot perform health checks inline — if a server goes down, its IP may still be cached. Solutions like AWS Route 53 health checks or low TTLs (30-60s) partially mitigate this, but they increase query volume and resolution latency.",
      followUps: [
        "How does anycast differ from DNS-based load balancing?",
        "What are the trade-offs of using very low TTLs for load balancing?",
      ],
    },
  ],
  followUps: [
    "How do CDNs use DNS to direct users to the nearest edge server?",
    "What is split-horizon DNS and when would you use it?",
    "How do DNS rebinding attacks work and how do browsers defend against them?",
    "What role does DNS play in email authentication (SPF, DKIM, DMARC)?",
    "How does multicast DNS (mDNS) work for local service discovery?",
    "What are the implications of running your own recursive resolver vs. using a public one?",
    "How do wildcard DNS records work and what are their pitfalls?",
  ],
  mcqs: [
    {
      q: "Which DNS record type is used to delegate a subdomain to a different set of nameservers?",
      options: ["A", "CNAME", "NS", "MX"],
      answerIndex: 2,
      explanation: "NS (Name Server) records delegate authority for a zone or subdomain to specified nameservers. A records map to IPs, CNAME creates aliases, and MX routes email.",
    },
    {
      q: "A recursive resolver receives a query for www.example.com and has no cached data. What is the first server it contacts?",
      options: ["example.com's authoritative nameserver", "A .com TLD server", "A root nameserver", "The client's ISP nameserver"],
      answerIndex: 2,
      explanation: "With an empty cache, a recursive resolver must start at the root of the DNS hierarchy. The root server will refer it to the .com TLD server, which will then refer it to example.com's authoritative server.",
    },
    {
      q: "What problem do glue records solve?",
      options: [
        "They encrypt DNS queries between resolver and nameserver",
        "They break circular dependencies when a nameserver's name is within the zone it serves",
        "They allow multiple domains to share a single IP address",
        "They enable zone transfers between primary and secondary nameservers",
      ],
      answerIndex: 1,
      explanation: "If ns1.example.com is the nameserver for example.com, you need ns1.example.com's IP to query example.com, but you need to query example.com to find ns1.example.com's IP. Glue records in the parent (.com) zone provide the IP directly, breaking the cycle.",
    },
    {
      q: "Which of the following does DNSSEC NOT protect against?",
      options: [
        "Cache poisoning attacks",
        "Spoofed DNS responses",
        "Eavesdropping on DNS queries",
        "Tampered DNS records",
      ],
      answerIndex: 2,
      explanation: "DNSSEC provides authentication and integrity (proving records are genuine and unmodified) but does NOT encrypt DNS traffic. Eavesdropping protection requires DNS-over-TLS or DNS-over-HTTPS.",
    },
    {
      q: "In a DNS amplification DDoS attack, the attacker sends queries with:",
      options: [
        "The victim's IP as the destination address",
        "The attacker's real IP as the source address",
        "The victim's IP as the spoofed source address",
        "An encrypted payload targeting the DNS resolver",
      ],
      answerIndex: 2,
      explanation: "The attacker spoofs the source IP to be the victim's address and sends queries (often for large TXT or ANY records) to open resolvers. The resolvers send their large responses to the victim, amplifying the attack traffic.",
    },
    {
      q: "What is the maximum size of a standard DNS UDP response before EDNS0 is required?",
      options: ["256 bytes", "512 bytes", "1024 bytes", "4096 bytes"],
      answerIndex: 1,
      explanation: "The original DNS specification (RFC 1035) limits UDP responses to 512 bytes. EDNS0 (Extension Mechanisms for DNS) allows larger UDP payloads, commonly up to 4096 bytes, avoiding the need to fall back to TCP for moderately large responses.",
    },
    {
      q: "Which DNS-over-encryption protocol operates on port 853?",
      options: ["DNS-over-HTTPS (DoH)", "DNS-over-TLS (DoT)", "DNS-over-QUIC (DoQ)", "DNSSEC"],
      answerIndex: 1,
      explanation: "DNS-over-TLS uses a dedicated port 853 and wraps standard DNS wire-format messages in TLS. DoH uses port 443 (standard HTTPS). DoQ uses a QUIC-based protocol. DNSSEC is not an encryption protocol.",
    },
  ],
  exercises: [
    "Use dig +trace to resolve a domain of your choice and document each step of the resolution chain — root referral, TLD referral, and authoritative answer. Note the TTLs at each level.",
    "Set up a local caching DNS resolver using Unbound or dnsmasq. Configure it to forward to a public resolver and verify it caches responses by running the same query twice and comparing query times.",
    "Write a script that monitors DNS propagation: given a domain and a list of public resolvers, query each one and report when they all return the same updated record.",
    "Examine the DNSSEC chain for a signed domain using dig +dnssec and dnsviz.net. Trace the chain of trust from the root KSK to the final RRSIG and identify each cryptographic link.",
    "Configure a DNS zone file for a test domain that includes A, AAAA, CNAME, MX, TXT (with SPF), and NS records. Explain why you chose each TTL value.",
    "Simulate a DNS amplification scenario in a lab environment: measure the response size for different query types (A vs TXT vs ANY) and calculate the amplification factor.",
    "Compare the latency and privacy characteristics of plain DNS, DoT, and DoH by running queries against equivalent resolvers (e.g., 8.8.8.8 for plain, dns.google for DoH) and capturing packets with tcpdump or Wireshark.",
  ],
  flashcards: [
    { front: "What does a recursive resolver do?", back: "It accepts a query from a client and performs the entire resolution process — walking from root to TLD to authoritative server — returning the final answer. It caches intermediate and final results according to their TTLs." },
    { front: "What is the purpose of a glue record?", back: "A glue record provides the IP address of a nameserver whose name is within the zone it serves, breaking the circular dependency. It is stored in the parent zone (e.g., the .com zone holds glue for ns1.example.com)." },
    { front: "What is the TTL in a DNS record?", back: "Time To Live — a value in seconds that tells resolvers how long they may cache the record before they must re-query the authoritative server. Lower TTLs mean faster propagation of changes but more query traffic." },
    { front: "Why can't you place a CNAME at the zone apex?", back: "RFC 1034 requires that a CNAME cannot coexist with any other record type at the same name. The zone apex must have SOA and NS records, creating a conflict. Some providers offer proprietary ALIAS/ANAME records as a workaround." },
    { front: "What is the difference between AXFR and IXFR?", back: "AXFR (Authoritative Transfer) copies the entire zone from primary to secondary. IXFR (Incremental Transfer) sends only changes since a specified SOA serial number, saving bandwidth for large zones with small updates." },
    { front: "What does the AD flag in a DNS response mean?", back: "The Authenticated Data flag indicates that the recursive resolver validated the response using DNSSEC. It means the entire chain of trust from the root to the queried record was cryptographically verified." },
    { front: "How does DNS-over-HTTPS differ from DNS-over-TLS?", back: "DoH sends DNS queries as HTTPS requests on port 443, blending with normal web traffic and making it hard to block. DoT wraps DNS in TLS on a dedicated port 853, which is easier to identify and filter. Both encrypt the query and response." },
    { front: "What is a DNS amplification attack?", back: "An attacker sends small DNS queries to open resolvers with the victim's IP spoofed as the source. The resolvers return much larger responses (amplification factors of 50x+) to the victim, overwhelming it with traffic. Mitigations include response rate limiting, disabling open recursion, and source-address validation (BCP 38)." },
    { front: "What is negative caching in DNS?", back: "Caching NXDOMAIN (non-existent domain) responses so that repeated lookups for names that do not exist are answered from cache rather than generating upstream queries. The negative cache TTL is defined in the SOA record's minimum field." },
    { front: "What is anycast in the context of DNS?", back: "Multiple servers in different locations share the same IP address. BGP routing directs each query to the topologically nearest server. All 13 root server identities use anycast, with over 1,500 total instances worldwide, providing low latency and DDoS resilience." },
    { front: "What is the SOA record?", back: "Start of Authority — contains zone metadata: the primary nameserver, admin email, zone serial number, and timing parameters (refresh, retry, expire, and minimum/negative-cache TTL). It is mandatory for every DNS zone." },
    { front: "What is EDNS0?", back: "Extension Mechanisms for DNS — extends the original 512-byte UDP limit by adding an OPT pseudo-record to queries/responses. It enables larger payloads (commonly 4096 bytes), DNSSEC support, and additional flags without changing the core protocol." },
  ],
  revisionNotes: [
    "DNS is a distributed, hierarchical naming system — root -> TLD -> authoritative, with recursive resolvers doing the walking for clients.",
    "Key record types: A/AAAA (addresses), CNAME (alias, no apex), MX (mail), NS (delegation), TXT (SPF/DKIM/verification), SOA (zone metadata), SRV (service discovery), PTR (reverse).",
    "Resolution: stub resolver -> recursive resolver -> iterative queries up the hierarchy. Caching at every layer reduces load.",
    "TTL controls cache duration — lower = faster propagation but more queries. Negative caching (NXDOMAIN) uses SOA minimum TTL.",
    "Glue records break circular dependencies for in-zone nameservers. Stored in the parent zone.",
    "DNSSEC: RRSIG signs records with ZSK, DNSKEY publishes keys, DS in parent chains trust. Proves authenticity, not confidentiality.",
    "DoH (port 443, HTTPS) and DoT (port 853, TLS) encrypt DNS traffic. DoH blends with web traffic; DoT is easier to filter.",
    "Anycast: same IP on multiple servers worldwide. Used by root servers and large providers for latency and DDoS resilience.",
    "Zone transfers: AXFR (full) and IXFR (incremental). Secure with TSIG and IP ACLs.",
    "DNS amplification: spoofed-source queries to open resolvers produce large responses aimed at victim. Mitigate with RRL and BCP 38.",
    "EDNS0 extends the 512-byte UDP limit to support DNSSEC and larger responses without TCP fallback.",
  ],
  cheatSheet: [
    "dig example.com A — basic A record lookup",
    "dig +short example.com — just the answer, no noise",
    "dig +trace example.com — full resolution path from root",
    "dig @8.8.8.8 example.com — query a specific resolver",
    "dig example.com MX +noall +answer — MX records only",
    "dig example.com ANY — all record types (may be restricted)",
    "dig -x 1.2.3.4 — reverse DNS lookup (PTR)",
    "dig example.com SOA +short — zone serial and SOA params",
    "dig example.com DNSKEY +dnssec — DNSSEC keys and signatures",
    "nslookup example.com — simpler lookup tool (cross-platform)",
    "host example.com — concise lookup output",
    "whois example.com — domain registration info (not DNS, but related)",
    "A record: name -> IPv4 | AAAA: name -> IPv6",
    "CNAME: alias -> canonical name (no apex!) | MX: mail server + priority",
    "NS: zone delegation | TXT: SPF, DKIM, verification",
    "SOA: zone serial, refresh, retry, expire, neg-cache TTL",
    "TTL in seconds: 300 = 5min, 3600 = 1hr, 86400 = 1day",
    "DNSSEC chain: Root KSK -> DS -> child KSK -> ZSK -> RRSIG -> record",
    "DoT = port 853, DoH = port 443, plain DNS = port 53 (UDP/TCP)",
  ],
  resources: [
    { label: "RFC 1034 — Domain Names: Concepts and Facilities", kind: "docs", note: "The foundational RFC defining the DNS architecture, namespace, and resolution model." },
    { label: "RFC 1035 — Domain Names: Implementation and Specification", kind: "docs", note: "Companion to RFC 1034 covering the wire protocol, message format, and master file format." },
    { label: "DNS and BIND (5th Edition) by Cricket Liu & Paul Albitz", kind: "book", note: "The definitive guide to DNS administration, covering BIND configuration, zone management, and troubleshooting." },
    { label: "RFC 4033-4035 — DNSSEC Introduction and Protocol", kind: "docs", note: "The trio of RFCs defining DNSSEC: introduction, records/protocol, and validation." },
    { label: "RFC 8484 — DNS Queries over HTTPS (DoH)", kind: "docs", note: "Specifies how DNS queries are encoded in HTTPS requests for encrypted resolution." },
    { label: "Cloudflare Learning Center — DNS", kind: "article", note: "Accessible, well-illustrated explanations of DNS concepts from basics through advanced topics." },
    { label: "DNSviz.net", kind: "docs", note: "Online tool for visualizing DNSSEC chains of trust and diagnosing validation issues." },
    { label: "PowerDNS documentation", kind: "docs", note: "Comprehensive docs for the open-source PowerDNS authoritative server and recursor." },
    { label: "A Warm Welcome to DNS by Evan Jones", kind: "article", note: "Practical walkthrough of how DNS works with real query examples and common pitfalls." },
    { label: "The DNS Camel (APNIC blog by Geoff Huston)", kind: "article", note: "Analysis of DNS protocol complexity growth and the challenges of modern DNS." },
  ],
  glossary: [
    { term: "Root server", definition: "One of the 13 named authorities (A through M) at the top of the DNS hierarchy that direct queries to the appropriate TLD servers. Each identity is served by multiple anycast instances." },
    { term: "TLD (Top-Level Domain)", definition: "The highest level of domain names in the hierarchy, such as .com, .org, .net (generic TLDs) or .uk, .jp (country-code TLDs). Managed by designated registries." },
    { term: "Authoritative nameserver", definition: "A DNS server that holds the actual zone data for a domain and can provide definitive answers (not from cache) for records within that zone." },
    { term: "Recursive resolver", definition: "A DNS server that receives queries from clients and performs the full resolution process by iteratively querying the hierarchy, caching results along the way." },
    { term: "Stub resolver", definition: "A minimal DNS client built into the operating system that forwards queries to a recursive resolver and caches results locally." },
    { term: "TTL (Time To Live)", definition: "A value in seconds attached to each DNS record that specifies how long resolvers and clients may cache the record before re-querying." },
    { term: "Glue record", definition: "An A or AAAA record for a nameserver that is included in the parent zone to break circular dependencies when the nameserver's name is within the zone it serves." },
    { term: "Zone transfer", definition: "The mechanism (AXFR or IXFR) by which a secondary nameserver obtains a copy of zone data from the primary nameserver." },
    { term: "DNSSEC", definition: "DNS Security Extensions — a suite of specifications that add cryptographic signatures to DNS records, enabling resolvers to verify the authenticity and integrity of responses." },
    { term: "NXDOMAIN", definition: "A DNS response code indicating that the queried domain name does not exist in the DNS. Subject to negative caching per the SOA minimum TTL." },
    { term: "EDNS0", definition: "Extension Mechanisms for DNS — allows DNS messages larger than 512 bytes over UDP and adds support for additional flags and options like the DNSSEC OK bit." },
    { term: "Anycast", definition: "A network addressing technique where the same IP address is announced from multiple locations; BGP routing directs clients to the nearest instance." },
    { term: "DNS amplification", definition: "A DDoS technique where small queries with spoofed source IPs are sent to open resolvers, which return much larger responses to the victim." },
    { term: "RRSIG", definition: "A DNSSEC record containing the cryptographic signature over a set of DNS records (RRset), used by validating resolvers to verify authenticity." },
    { term: "SOA (Start of Authority)", definition: "A mandatory DNS record at the zone apex containing the primary nameserver, admin contact, serial number, and timing parameters for zone maintenance." },
  ],
};
