import type { TopicContent } from "../types";

export const tlsSsl: TopicContent = {
  quickSummary: [
    "TLS (Transport Layer Security) is a cryptographic protocol that provides confidentiality, integrity, and authentication for data in transit over a network. SSL (Secure Sockets Layer) is its deprecated predecessor — all modern 'SSL' usage actually means TLS.",
    "A TLS handshake negotiates a shared session key using asymmetric cryptography (RSA or ECDHE), then switches to fast symmetric encryption (AES-GCM, ChaCha20-Poly1305) for the bulk data transfer.",
    "Certificates, issued by Certificate Authorities (CAs) and forming a chain of trust, let clients verify a server's identity before exchanging any application data.",
    "TLS 1.3 (RFC 8446, 2018) dramatically simplified the protocol: it removed insecure cipher suites, reduced the handshake to a single round trip (1-RTT), and introduced 0-RTT resumption for repeat connections.",
  ],
  detailed: [
    "SSL was developed by Netscape in the mid-1990s. SSL 2.0 (1995) had critical flaws and was quickly replaced by SSL 3.0 (1996). The IETF standardized the protocol as TLS 1.0 (RFC 2246, 1999), which was essentially SSL 3.1. TLS 1.1 (2006) and TLS 1.2 (2008) followed with incremental improvements — adding explicit IVs to prevent CBC attacks and introducing authenticated encryption modes like AES-GCM. SSL 3.0 was formally deprecated by RFC 7568 in 2015 after the POODLE attack demonstrated that its CBC padding scheme was fundamentally broken. TLS 1.0 and 1.1 were deprecated by RFC 8996 in 2021. Today, only TLS 1.2 and TLS 1.3 should be used in production.",
    "A TLS certificate chain establishes trust hierarchically. At the top is a root CA certificate, which is self-signed and pre-installed in the operating system or browser trust store. The root CA signs intermediate CA certificates, and intermediates sign end-entity (leaf) certificates for specific domains. During the handshake, the server sends its leaf certificate plus any intermediates; the client walks the chain upward until it reaches a trusted root. If any link is missing, expired, revoked, or fails signature verification, the handshake is aborted. This chain model lets root CAs stay offline (protecting their private keys) while intermediates handle day-to-day issuance.",
    "TLS uses both asymmetric and symmetric cryptography in a complementary way. Asymmetric algorithms (RSA, ECDSA, EdDSA) are used during the handshake for authentication (proving the server holds the private key matching its certificate) and, in older cipher suites, for key exchange. However, asymmetric operations are computationally expensive — roughly 1000x slower than symmetric ones. So the handshake's real goal is to negotiate a shared symmetric key (the session key) that both parties derive from the key exchange. Once established, all application data is encrypted with a fast symmetric cipher like AES-128-GCM or ChaCha20-Poly1305, which provides both confidentiality and integrity via authenticated encryption (AEAD).",
    "HTTPS is simply HTTP over TLS. When a browser connects to https://example.com, it first completes a TLS handshake on port 443, establishing an encrypted tunnel. All subsequent HTTP requests and responses — headers, cookies, bodies — flow through that tunnel. HSTS (HTTP Strict Transport Security) tells browsers to always use HTTPS for a domain, preventing protocol downgrade attacks. Certificate Transparency (CT) logs provide a public, append-only ledger of all issued certificates, letting domain owners detect mis-issuance. Together, these mechanisms form the backbone of web security.",
    "In practice, TLS performance has improved enormously. TLS 1.3's 1-RTT handshake completes in a single round trip (down from two in TLS 1.2). Session resumption via PSK (Pre-Shared Keys) can further reduce this to 0-RTT for repeat visitors, though 0-RTT data is vulnerable to replay attacks and must be handled carefully. Hardware AES-NI instructions on modern CPUs make AES-GCM encryption effectively free in terms of throughput. The days when 'HTTPS is slow' were true are long past — the overhead of TLS on a modern stack is negligible.",
  ],
  deepDive: [
    "The TLS 1.3 handshake (RFC 8446) is a clean break from TLS 1.2. The client sends a ClientHello containing supported cipher suites AND key shares (public keys for ECDHE groups like x25519 or P-256) in a single flight. The server selects a cipher suite, responds with its own key share and certificate in the ServerHello, and both sides derive the handshake traffic keys immediately. The server then sends its Finished message. The client verifies the certificate chain, sends its Finished, and both sides switch to application traffic keys derived from the handshake secret. The entire handshake completes in 1-RTT. By contrast, TLS 1.2 required 2-RTT: the first round trip negotiated parameters, and the second exchanged key material. TLS 1.3 also encrypts the server certificate, so passive observers cannot see which site the client is connecting to (SNI remains visible, though Encrypted Client Hello — ECH — addresses this).",
    "Cipher suites in TLS 1.3 are radically simplified. TLS 1.2 had hundreds of cipher suite combinations (e.g., TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256), specifying key exchange, authentication, encryption, and MAC separately. TLS 1.3 only allows five cipher suites, all using AEAD: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256, TLS_AES_128_CCM_SHA256, and TLS_AES_128_CCM_8_SHA256. Key exchange is always ephemeral (ECDHE or DHE), and static RSA key exchange is removed entirely. This eliminates entire categories of attacks — BEAST, Lucky 13, ROBOT — that exploited CBC mode or static RSA.",
    "Perfect Forward Secrecy (PFS) guarantees that compromising a server's long-term private key does not expose past session data. With static RSA key exchange (removed in TLS 1.3, optional in TLS 1.2), the client encrypts a pre-master secret directly to the server's RSA key; if that key is later stolen, every recorded session can be decrypted. Ephemeral Diffie-Hellman (DHE or ECDHE) prevents this: each handshake generates a fresh key pair, the shared secret is computed, and the ephemeral private key is discarded. Even if an attacker records all ciphertext and later obtains the server's long-term key, they cannot reconstruct the ephemeral keys. ECDHE with Curve25519 (x25519) is the preferred choice — it offers ~128-bit security with excellent performance and no known patent issues.",
    "Certificate Transparency (CT) and OCSP stapling address two weaknesses in the CA trust model. CT requires CAs to submit every issued certificate to public, append-only logs. Browsers (Chrome enforces this since 2018) reject certificates not logged in CT, so a rogue or compromised CA cannot secretly issue a fraudulent certificate — it would appear in the logs and be detectable. OCSP (Online Certificate Status Protocol) lets clients check whether a certificate has been revoked. However, fetching OCSP responses adds latency and leaks browsing data to the CA. OCSP stapling solves this: the server periodically fetches its own OCSP response and includes (staples) it in the TLS handshake, so the client can verify revocation status without contacting the CA. OCSP Must-Staple (an X.509 extension) makes stapling mandatory, closing the soft-fail window where a client might skip the revocation check.",
    "Mutual TLS (mTLS) extends TLS by requiring the client to also present a certificate. In standard TLS, only the server authenticates; the client is anonymous at the transport layer (authentication happens at the application layer via cookies, tokens, etc.). In mTLS, the server sends a CertificateRequest during the handshake, and the client responds with its own certificate and a CertificateVerify message proving it holds the corresponding private key. mTLS is widely used for service-to-service communication in microservice architectures (e.g., Istio, Linkerd service meshes), API authentication, and zero-trust networks. 0-RTT resumption in TLS 1.3 allows clients to send application data in the first flight of a resumed connection, reducing latency to zero round trips. However, 0-RTT data has no forward secrecy against replay: an attacker who captures a 0-RTT flight can replay it. Servers must therefore ensure that 0-RTT-eligible requests are idempotent (e.g., GET but not POST) or use application-layer anti-replay mechanisms.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Creating a TLS connection and inspecting the peer certificate in C++ with OpenSSL",
      source: `#include <iostream>
#include <cstring>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/x509.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <unistd.h>

// Helper: extract one-line subject/issuer string from X509_NAME
std::string x509_name_str(X509_NAME* name) {
    char buf[256];
    X509_NAME_oneline(name, buf, sizeof(buf));
    return buf;
}

void inspect_tls_connection(const char* hostname, int port = 443) {
    // Initialize OpenSSL
    SSL_library_init();
    SSL_load_error_strings();

    // Create a secure context (verifies certs via default CA store)
    const SSL_METHOD* method = TLS_client_method();
    SSL_CTX* ctx = SSL_CTX_new(method);
    SSL_CTX_set_default_verify_paths(ctx);      // load system CA certs
    SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER, nullptr);

    // Resolve hostname and create TCP connection
    struct hostent* he = gethostbyname(hostname);
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    std::memcpy(&addr.sin_addr, he->h_addr, he->h_length);
    connect(sock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr));

    // Wrap the socket in TLS
    SSL* ssl = SSL_new(ctx);
    SSL_set_fd(ssl, sock);
    SSL_set_tlsext_host_name(ssl, hostname);    // SNI
    SSL_connect(ssl);

    // Print protocol and cipher info
    std::cout << "Protocol : " << SSL_get_version(ssl) << "\\n";
    std::cout << "Cipher   : " << SSL_get_cipher(ssl) << "\\n";

    // Inspect the peer certificate
    X509* cert = SSL_get_peer_certificate(ssl);
    if (cert) {
        std::cout << "Subject  : " << x509_name_str(X509_get_subject_name(cert)) << "\\n";
        std::cout << "Issuer   : " << x509_name_str(X509_get_issuer_name(cert)) << "\\n";

        // Validity dates
        BIO* bio = BIO_new(BIO_s_mem());
        ASN1_TIME_print(bio, X509_get_notBefore(cert));
        char not_before[64]{};
        BIO_read(bio, not_before, sizeof(not_before));
        ASN1_TIME_print(bio, X509_get_notAfter(cert));
        char not_after[64]{};
        BIO_read(bio, not_after, sizeof(not_after));
        BIO_free(bio);
        std::cout << "Valid    : " << not_before << " -> " << not_after << "\\n";

        X509_free(cert);
    }

    // Cleanup
    SSL_shutdown(ssl);
    SSL_free(ssl);
    close(sock);
    SSL_CTX_free(ctx);
}

int main() {
    inspect_tls_connection("example.com");
}`,
    },
    {
      language: "bash",
      caption: "Inspecting a certificate chain and TLS details with openssl s_client",
      source: `# Show the full certificate chain, protocol version, and cipher
openssl s_client -connect example.com:443 -servername example.com \\
  -showcerts </dev/null 2>/dev/null

# Display only the leaf certificate in human-readable form
echo | openssl s_client -connect example.com:443 -servername example.com \\
  2>/dev/null | openssl x509 -noout -text

# Check certificate expiration date
echo | openssl s_client -connect example.com:443 -servername example.com \\
  2>/dev/null | openssl x509 -noout -dates

# Test a specific TLS version (TLS 1.3 only)
openssl s_client -connect example.com:443 -tls1_3

# List supported cipher suites for TLS 1.3
openssl ciphers -v -tls1_3

# Verify OCSP stapling support
openssl s_client -connect example.com:443 -status </dev/null 2>&1 \\
  | grep -A 5 "OCSP Response"`,
    },
    {
      language: "bash",
      caption: "Setting up mutual TLS (mTLS) with openssl — generating CA, server, and client certificates",
      source: `# 1. Generate a self-signed CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key \\
  -subj "/CN=My Internal CA" -out ca.crt

# 2. Generate a server certificate signed by the CA
openssl genrsa -out server.key 2048
openssl req -new -key server.key \\
  -subj "/CN=api.internal.example.com" -out server.csr
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \\
  -CAcreateserial -days 365 -out server.crt

# 3. Generate a client certificate signed by the same CA
openssl genrsa -out client.key 2048
openssl req -new -key client.key \\
  -subj "/CN=service-a" -out client.csr
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key \\
  -CAcreateserial -days 365 -out client.crt

# 4. Test mTLS with curl (client presents its cert, verifies server via CA)
curl --cacert ca.crt \\
     --cert client.crt --key client.key \\
     https://api.internal.example.com/healthz

# 5. Start an nginx server requiring client certs (snippet)
# server {
#     listen 443 ssl;
#     ssl_certificate     /etc/tls/server.crt;
#     ssl_certificate_key /etc/tls/server.key;
#     ssl_client_certificate /etc/tls/ca.crt;
#     ssl_verify_client on;
# }`,
    },
  ],
  diagrams: [
    {
      title: "TLS Handshake Sequence",
      kind: "sequence",
      caption: "Full TLS 1.3 handshake showing ClientHello, ServerHello, certificate exchange, and key derivation.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: ClientHello - TLS version, cipher suites, random
    S-->>C: ServerHello - chosen cipher, server random
    S-->>C: Certificate - server public key
    S-->>C: ServerHelloDone
    C->>C: Verify certificate against CA
    C->>S: ClientKeyExchange - encrypted premaster secret
    C->>S: ChangeCipherSpec
    C->>S: Finished - encrypted handshake hash
    S->>S: Derive session keys
    S-->>C: ChangeCipherSpec
    S-->>C: Finished
    Note over C,S: Encrypted application data`,
    },
    {
      title: "TLS Certificate Chain",
      kind: "architecture",
      caption: "Trust chain from root CA through intermediate CA to the server leaf certificate.",
      mermaid: `graph TD
    Root["Root CA
self-signed
trusted by OS"] -->|signs| Int["Intermediate CA
signed by root"]
    Int -->|signs| Leaf["Server Certificate
example.com
signed by intermediate"]
    Leaf --> Verify["Client Verifies
chain to trusted root"]
    Root --> Trust["OS Trust Store
pre-installed CAs"]
    Trust --> Verify`,
    },
    {
      title: "Symmetric vs Asymmetric Crypto in TLS",
      kind: "mindmap",
      caption: "How TLS uses asymmetric cryptography for key exchange and symmetric for bulk data encryption.",
      mermaid: `mindmap
  root((TLS Cryptography))
    Asymmetric RSA or ECDH
      Key exchange phase
      Slow but secure
      Public key in certificate
      Private key on server
    Symmetric AES-GCM
      Data encryption phase
      Fast bulk encryption
      Session key derived
      Authenticated encryption
    Hashing SHA-256
      Certificate signatures
      HMAC integrity
      Handshake verification`,
    },
    {
      title: "TLS Record Protocol Flow",
      kind: "flow",
      caption: "How application data is fragmented, compressed, MACed, and encrypted into TLS records.",
      mermaid: `flowchart TD
    A["Application Data"] --> B["Fragment into chunks
max 16KB per record"]
    B --> C["Add record header
content type + version + length"]
    C --> D["Encrypt with session key
AES-GCM or ChaCha20"]
    D --> E["Compute MAC
integrity tag"]
    E --> F["TLS Record
ready to send over TCP"]
    F --> G["TCP Stream"]`,
    },
  ],
  animations: [
    {
      title: "TLS 1.3 handshake step by step",
      steps: [
        { label: "ClientHello", detail: "The client sends supported TLS versions, cipher suites, and key shares (e.g., x25519 public key) to the server in a single message." },
        { label: "ServerHello + key share", detail: "The server selects a cipher suite and key exchange group, sends its own public key share. Both sides now compute the shared secret using ECDHE." },
        { label: "Handshake keys derived", detail: "Both parties derive handshake traffic keys from the shared secret. All subsequent handshake messages are encrypted." },
        { label: "Server certificate + Finished", detail: "The server sends its certificate chain (encrypted), a CertificateVerify proving possession of the private key, and a Finished message (HMAC over the entire handshake transcript)." },
        { label: "Client verification", detail: "The client validates the certificate chain against its trust store, verifies the CertificateVerify signature, and checks the server's Finished HMAC." },
        { label: "Client Finished + application data", detail: "The client sends its own Finished message. Both sides derive application traffic keys. The handshake is complete in 1-RTT; encrypted application data now flows freely." },
      ],
    },
    {
      title: "Certificate chain validation",
      steps: [
        { label: "Receive leaf certificate", detail: "The client receives the server's end-entity certificate (e.g., for example.com) along with any intermediate certificates." },
        { label: "Check leaf validity", detail: "Verify the leaf certificate's validity period (notBefore/notAfter), domain name match (CN or SAN), and key usage extensions." },
        { label: "Verify leaf signature", detail: "The leaf certificate is signed by an intermediate CA. Verify the signature using the intermediate's public key." },
        { label: "Walk the chain", detail: "Repeat: verify each intermediate's signature using the next certificate in the chain, until reaching a certificate signed by a root CA." },
        { label: "Match trusted root", detail: "The final certificate in the chain must be signed by a root CA present in the client's trust store. If found, the chain is trusted." },
        { label: "Revocation check", detail: "Optionally check OCSP stapled response or CRL to ensure no certificate in the chain has been revoked." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "TLS 1.2", "TLS 1.3"],
    rows: [
      ["RFC", "RFC 5246 (2008)", "RFC 8446 (2018)"],
      ["Handshake round trips", "2-RTT (full handshake)", "1-RTT (full), 0-RTT (resumption)"],
      ["Key exchange", "RSA, DHE, ECDHE (configurable)", "ECDHE or DHE only (PFS mandatory)"],
      ["Static RSA key exchange", "Supported (no forward secrecy)", "Removed entirely"],
      ["Cipher suites", "~300+ combinations (CBC, RC4, 3DES allowed)", "5 AEAD-only suites (AES-GCM, ChaCha20-Poly1305, AES-CCM)"],
      ["CBC mode ciphers", "Supported (vulnerable to BEAST, Lucky13)", "Not supported"],
      ["Certificate encryption", "Sent in plaintext", "Encrypted (hidden from passive observers)"],
      ["0-RTT resumption", "Not available (session tickets provide 1-RTT)", "Available via PSK (with replay caveats)"],
      ["Hash for PRF/HKDF", "MD5+SHA-256 (PRF)", "HKDF with SHA-256 or SHA-384"],
      ["Renegotiation", "Supported (attack surface)", "Removed; uses KeyUpdate instead"],
      ["Compression", "Supported (vulnerable to CRIME)", "Removed"],
      ["Downgrade protection", "Optional (fallback SCSV)", "Built into random field of ServerHello"],
    ],
  },
  interviewQA: [
    {
      q: "Explain the TLS 1.3 handshake. How does it achieve 1-RTT?",
      a: "In TLS 1.3, the client sends key shares (e.g., x25519 public keys) in the ClientHello itself, rather than waiting for the server to select parameters first. The server picks a cipher suite and key exchange group, responds with its own key share in the ServerHello, and both sides immediately compute the shared secret via ECDHE. The server then sends its certificate and Finished message encrypted with handshake keys. The client verifies and sends its Finished. The entire negotiation completes in one round trip because the key exchange material is sent speculatively in the first flight.",
      followUps: [
        "What happens if the server does not support any of the key shares the client offered?",
        "How does 0-RTT resumption work and what are its risks?",
      ],
    },
    {
      q: "What is Perfect Forward Secrecy (PFS) and why does TLS 1.3 mandate it?",
      a: "PFS ensures that compromising a server's long-term private key does not allow decryption of previously recorded sessions. It is achieved by using ephemeral key pairs for each connection — with ECDHE, both client and server generate fresh key pairs, compute the shared secret, and discard the ephemeral private keys after the handshake. Even if an attacker later steals the server's long-term key (used only for signing/authentication), they cannot reconstruct the ephemeral keys. TLS 1.3 mandates PFS by removing static RSA key exchange, which encrypted the pre-master secret directly to the server's RSA key — making every past session decryptable if that key was compromised.",
      followUps: [
        "How does ECDHE differ from regular DHE in terms of security and performance?",
        "Can PFS protect against an attacker who has access to the server's memory during the handshake?",
      ],
    },
    {
      q: "How does the certificate chain of trust work? What happens if an intermediate CA is compromised?",
      a: "A certificate chain starts with a root CA (self-signed, embedded in the OS/browser trust store), which signs intermediate CAs, which in turn sign end-entity certificates. The client validates each signature upward until it reaches a trusted root. If an intermediate CA is compromised, the attacker can issue fraudulent certificates for any domain. The response is to revoke the intermediate: the root CA adds it to a CRL (Certificate Revocation List) or its OCSP responder returns 'revoked'. Certificate Transparency logs help detect unauthorized issuance — monitors and domain owners scan CT logs for unexpected certificates. The compromised intermediate's certificates can also be pinned or blocked by browsers via their CRLSets or OneCRL mechanisms.",
      followUps: [
        "What is the difference between CRL and OCSP for revocation checking?",
        "How does Certificate Transparency prevent a rogue CA from issuing undetected certificates?",
      ],
    },
    {
      q: "What is mutual TLS (mTLS) and when would you use it?",
      a: "In standard TLS, only the server authenticates by presenting a certificate. In mTLS, the client also presents a certificate, so both sides cryptographically verify each other's identity. During the handshake, the server sends a CertificateRequest message, and the client responds with its certificate and a CertificateVerify signature. mTLS is used in service-to-service communication within microservice architectures (often managed by service meshes like Istio or Linkerd), API security (where each client service has its own certificate), zero-trust networks (where network location alone grants no trust), and IoT device authentication. It eliminates the need for API keys or tokens at the transport layer.",
      followUps: [
        "How do service meshes like Istio automate mTLS certificate rotation?",
        "What are the operational challenges of managing mTLS at scale?",
      ],
    },
    {
      q: "Explain the difference between symmetric and asymmetric encryption in the context of TLS.",
      a: "Asymmetric encryption (RSA, ECDSA, EdDSA) uses a key pair — public and private — and is used in TLS for two purposes: authentication (the server proves it holds the private key matching its certificate) and key exchange (in older RSA key exchange, the client encrypts a pre-master secret to the server's public key). Symmetric encryption (AES-GCM, ChaCha20-Poly1305) uses a single shared key known to both parties and is used for bulk data encryption after the handshake. The reason TLS uses both is performance: asymmetric operations are roughly 1000x slower than symmetric ones, so the handshake uses asymmetric crypto just long enough to establish a shared symmetric key, then all application data is encrypted symmetrically.",
      followUps: [
        "Why is AES-GCM preferred over AES-CBC in modern TLS?",
        "What is an AEAD cipher and why does TLS 1.3 require it?",
      ],
    },
    {
      q: "What is OCSP stapling and what problem does it solve?",
      a: "OCSP (Online Certificate Status Protocol) allows clients to check whether a certificate has been revoked by querying the CA's OCSP responder. However, this has three problems: it adds latency (an extra network round trip), it leaks browsing information to the CA (which domain the client is visiting), and if the OCSP responder is unreachable, most clients 'soft-fail' and accept the certificate anyway — an attacker can simply block the OCSP request. OCSP stapling solves all three: the server periodically fetches its own OCSP response from the CA, caches it, and includes (staples) it in the TLS handshake. The client gets a fresh, signed revocation status without contacting the CA. The OCSP Must-Staple extension (in the certificate itself) makes this mandatory — if the stapled response is missing, the client rejects the connection, closing the soft-fail gap.",
      followUps: [
        "What is the OCSP Must-Staple extension and how is it enabled?",
        "How does CRLite improve on traditional CRL/OCSP approaches?",
      ],
    },
    {
      q: "What are the security risks of TLS 1.3's 0-RTT mode?",
      a: "0-RTT allows a client to send application data in the very first flight of a resumed TLS connection, achieving zero round-trip latency. However, 0-RTT data lacks replay protection at the TLS layer: an attacker who captures a 0-RTT flight can replay it to the server. The server cannot distinguish the replay from a legitimate retransmission. This means 0-RTT should only carry idempotent requests (like HTTP GET) — never state-changing operations like payments or database writes. Servers must implement application-layer anti-replay mechanisms (e.g., unique tokens, strike registers) if they accept non-idempotent 0-RTT data. Additionally, 0-RTT data does not have forward secrecy against compromise of the PSK — it is only protected by the resumption secret, not a fresh ECDHE exchange.",
    },
  ],
  followUps: [
    "How does Encrypted Client Hello (ECH) improve privacy beyond what TLS 1.3 provides?",
    "What is the difference between TLS termination at a load balancer vs end-to-end TLS?",
    "How do certificate pinning (HPKP) and its successor mechanisms (Expect-CT) work?",
    "What is the role of DANE and TLSA DNS records in certificate validation?",
    "How do post-quantum key exchange mechanisms (Kyber, ML-KEM) integrate with TLS?",
    "What are the practical differences between RSA, ECDSA, and EdDSA certificates?",
    "How does TLS interact with HTTP/2 and HTTP/3 (QUIC)?",
  ],
  mcqs: [
    {
      q: "How many round trips does a full TLS 1.3 handshake require?",
      options: ["0-RTT", "1-RTT", "2-RTT", "3-RTT"],
      answerIndex: 1,
      explanation: "A full TLS 1.3 handshake completes in 1 round trip. The client sends key shares in the ClientHello, and the server responds with its key share, certificate, and Finished in a single flight. 0-RTT is only available for session resumption, not the initial handshake.",
    },
    {
      q: "Which key exchange method was removed in TLS 1.3 because it does not provide forward secrecy?",
      options: ["ECDHE", "DHE", "Static RSA", "x25519"],
      answerIndex: 2,
      explanation: "Static RSA key exchange encrypts the pre-master secret directly to the server's long-term RSA key. If that key is later compromised, all past sessions can be decrypted. TLS 1.3 removed it entirely, mandating ephemeral key exchange (ECDHE or DHE) for forward secrecy.",
    },
    {
      q: "What does OCSP stapling accomplish?",
      options: [
        "It pins a specific certificate to a domain",
        "It allows the server to include a signed revocation status in the TLS handshake",
        "It encrypts the SNI field in the ClientHello",
        "It compresses TLS records to reduce bandwidth",
      ],
      answerIndex: 1,
      explanation: "OCSP stapling lets the server fetch and cache a signed OCSP response from the CA, then include it in the TLS handshake. This lets the client verify the certificate's revocation status without making a separate network request to the CA.",
    },
    {
      q: "In a certificate chain, which certificate is self-signed?",
      options: [
        "The leaf (end-entity) certificate",
        "The intermediate CA certificate",
        "The root CA certificate",
        "None — all certificates must be signed by a different entity",
      ],
      answerIndex: 2,
      explanation: "Root CA certificates are self-signed — they sign themselves. They are pre-installed in the operating system or browser trust store and serve as the ultimate trust anchor. The root signs intermediates, and intermediates sign leaf certificates.",
    },
    {
      q: "What is the primary security risk of TLS 1.3's 0-RTT mode?",
      options: [
        "It uses weaker encryption for the first flight of data",
        "It skips certificate validation",
        "It is vulnerable to replay attacks",
        "It downgrades to TLS 1.2 automatically",
      ],
      answerIndex: 2,
      explanation: "0-RTT data can be captured and replayed by an attacker because TLS 1.3 provides no replay protection at the transport layer for 0-RTT. Servers must ensure 0-RTT requests are idempotent or implement application-layer anti-replay mechanisms.",
    },
    {
      q: "Which of the following cipher suites is valid in TLS 1.3?",
      options: [
        "TLS_RSA_WITH_AES_128_CBC_SHA",
        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "TLS_AES_256_GCM_SHA384",
        "TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA",
      ],
      answerIndex: 2,
      explanation: "TLS 1.3 uses a simplified cipher suite naming scheme that only specifies the AEAD algorithm and hash. TLS_AES_256_GCM_SHA384 is one of the five allowed suites. The other options use TLS 1.2 naming conventions and include deprecated algorithms (CBC, 3DES, static RSA).",
    },
    {
      q: "In mutual TLS (mTLS), what additional message does the server send to request client authentication?",
      options: [
        "ClientKeyExchange",
        "CertificateRequest",
        "ServerKeyExchange",
        "HelloRetryRequest",
      ],
      answerIndex: 1,
      explanation: "The server sends a CertificateRequest message during the handshake to indicate that the client must present a certificate. The client then responds with its Certificate and CertificateVerify messages.",
    },
  ],
  exercises: [
    "Use openssl s_client to connect to three different websites. Compare their TLS versions, cipher suites, and certificate chain depths. Which sites support TLS 1.3? Which still allow TLS 1.2?",
    "Set up a local HTTPS server using Node.js or Python with a self-signed certificate. Then modify the client to trust the self-signed CA and establish a verified connection.",
    "Generate a full mTLS setup: create a CA, server certificate, and client certificate using openssl. Configure nginx to require client certificates and test with curl.",
    "Write a script that checks a list of domains for certificate expiration and alerts if any certificate expires within 30 days.",
    "Use Wireshark to capture a TLS 1.3 handshake. Identify the ClientHello, ServerHello, and encrypted extensions. Compare it with a TLS 1.2 capture — note the difference in round trips and the visibility of the server certificate.",
    "Implement certificate pinning in a Python or Go HTTP client. Test that the client rejects connections when the server presents a different certificate than the pinned one.",
  ],
  flashcards: [
    { front: "What does TLS stand for and what does it provide?", back: "Transport Layer Security. It provides confidentiality (encryption), integrity (tamper detection via MACs/AEAD), and authentication (certificate verification) for data in transit." },
    { front: "How many round trips does a TLS 1.3 full handshake take?", back: "1-RTT. The client sends key shares in the ClientHello, and the server responds with its key share and certificate in a single flight." },
    { front: "What is Perfect Forward Secrecy (PFS)?", back: "PFS ensures that compromising a server's long-term private key does not allow decryption of past sessions. Achieved by using ephemeral key pairs (ECDHE) for each connection — the ephemeral private keys are discarded after use." },
    { front: "Why was static RSA key exchange removed from TLS 1.3?", back: "Because it does not provide forward secrecy. The client encrypts the pre-master secret to the server's long-term RSA key, so if that key is later compromised, all recorded sessions can be decrypted." },
    { front: "What is the role of a Certificate Authority (CA)?", back: "A CA is a trusted third party that issues digital certificates binding a public key to an identity (domain name). The CA verifies the applicant's control of the domain before issuing the certificate, and the certificate is signed with the CA's private key." },
    { front: "What is OCSP stapling?", back: "The server periodically fetches a signed OCSP response (certificate revocation status) from the CA and includes it in the TLS handshake. This avoids the client needing to contact the CA separately, reducing latency and improving privacy." },
    { front: "What is an AEAD cipher?", back: "Authenticated Encryption with Associated Data. It provides both confidentiality and integrity in a single operation. Examples: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305. TLS 1.3 requires all cipher suites to be AEAD." },
    { front: "What is mutual TLS (mTLS)?", back: "A TLS configuration where both the server and client present certificates, so both sides cryptographically authenticate each other. Used in service-to-service communication, API security, and zero-trust architectures." },
    { front: "What is Certificate Transparency (CT)?", back: "A system of public, append-only logs where CAs must record every certificate they issue. Browsers can require CT compliance, making it impossible for a CA to secretly issue fraudulent certificates — any mis-issuance would be visible in the logs." },
    { front: "What is the risk of TLS 1.3's 0-RTT mode?", back: "0-RTT data is vulnerable to replay attacks. An attacker can capture and resend a 0-RTT flight, and the server cannot distinguish it from a legitimate request. Only idempotent operations should use 0-RTT." },
    { front: "What is HSTS?", back: "HTTP Strict Transport Security. An HTTP response header (Strict-Transport-Security) that tells browsers to only connect to the domain over HTTPS for a specified duration, preventing protocol downgrade attacks and cookie hijacking." },
    { front: "What curve is most commonly used for ECDHE in TLS 1.3?", back: "Curve25519 (x25519). It provides ~128-bit security, has excellent performance, a simple constant-time implementation, and no known patent issues." },
  ],
  revisionNotes: [
    "SSL is dead — SSL 2.0 and 3.0 are deprecated and insecure. All modern 'SSL' is actually TLS. Only TLS 1.2 and 1.3 should be used in production.",
    "TLS 1.3 handshake: 1-RTT. Client sends key shares (ECDHE public key) in ClientHello. Server responds with its key share, encrypted certificate, and Finished. No more separate key exchange round trip.",
    "TLS uses asymmetric crypto (RSA/ECDSA/EdDSA) for authentication and key exchange, then symmetric crypto (AES-GCM/ChaCha20-Poly1305) for bulk data. Asymmetric is ~1000x slower, so it is used only during the handshake.",
    "Perfect Forward Secrecy = ephemeral key pairs for each session. ECDHE generates fresh keys, computes the shared secret, and discards the private key. Compromising the server's long-term key does not expose past sessions.",
    "Certificate chain: Root CA (self-signed, in trust store) -> Intermediate CA -> Leaf certificate. Client validates each signature upward to a trusted root.",
    "TLS 1.3 removed: static RSA key exchange, CBC ciphers, RC4, 3DES, compression, renegotiation. Only 5 AEAD cipher suites remain.",
    "OCSP stapling: server includes signed revocation status in the handshake, so the client does not need to contact the CA. OCSP Must-Staple makes this mandatory.",
    "mTLS: both client and server present certificates. The server sends CertificateRequest; the client responds with its cert and CertificateVerify. Common in service meshes and zero-trust.",
    "0-RTT in TLS 1.3: allows sending data in the first flight of a resumed connection (zero latency), but is replay-vulnerable. Only use for idempotent requests.",
    "Certificate Transparency: public append-only logs of all issued certificates. Chrome requires CT compliance since 2018. Prevents rogue CAs from issuing undetected certificates.",
  ],
  cheatSheet: [
    "TLS 1.3 = 1-RTT handshake, ECDHE mandatory, AEAD only, no static RSA, no CBC, no compression",
    "TLS 1.2 = 2-RTT handshake, supports both RSA and ECDHE key exchange, CBC and AEAD ciphers",
    "openssl s_client -connect host:443 -servername host  -- inspect TLS connection",
    "openssl x509 -noout -text  -- read a certificate in human-readable form",
    "openssl s_client -connect host:443 -status  -- check OCSP stapling",
    "PFS: ECDHE (x25519, P-256) generates ephemeral keys per session; static RSA has no PFS",
    "Certificate chain: Root CA -> Intermediate CA -> Leaf cert (validate bottom-up)",
    "AEAD ciphers: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305 (TLS 1.3 only allows these)",
    "mTLS: server sends CertificateRequest, client sends Certificate + CertificateVerify",
    "HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
    "0-RTT: fast resumption but replay-vulnerable — only for idempotent requests (GET, not POST)",
    "CT logs: public, append-only ledger of all issued certs — detects rogue CA issuance",
    "OCSP stapling: server caches and sends signed revocation status in TLS handshake",
    "SNI (Server Name Indication): client sends hostname in ClientHello (plaintext in TLS 1.2/1.3; ECH encrypts it)",
  ],
  resources: [
    { label: "RFC 8446 — TLS 1.3", kind: "docs", note: "The definitive specification for TLS 1.3. Dense but authoritative — read sections 2 (overview) and 4 (handshake protocol) first." },
    { label: "Bulletproof TLS and PKI by Ivan Ristic", kind: "book", note: "Comprehensive guide to deploying TLS correctly. Covers cipher suite selection, certificate management, and common pitfalls." },
    { label: "The Illustrated TLS 1.3 Connection", kind: "article", note: "Interactive, byte-by-byte walkthrough of a TLS 1.3 handshake at tls13.xargs.org. Excellent for visual learners." },
    { label: "The Illustrated TLS 1.2 Connection", kind: "article", note: "Companion to the TLS 1.3 version at tls.ulfheim.net. Useful for understanding the differences between 1.2 and 1.3." },
    { label: "Qualys SSL Labs — SSL Server Test", kind: "docs", note: "Free online tool that grades a server's TLS configuration. Tests protocol versions, cipher suites, certificate chain, and known vulnerabilities." },
    { label: "Mozilla Server Side TLS Guidelines", kind: "docs", note: "Regularly updated recommended TLS configurations (Modern, Intermediate, Old) with ready-to-use configs for nginx, Apache, HAProxy." },
    { label: "Certificate Transparency — How CT Works", kind: "article", note: "Google's explainer on Certificate Transparency: why it exists, how logs work, and how monitors detect mis-issuance." },
    { label: "Cloudflare Learning Center — TLS", kind: "article", note: "Accessible articles covering TLS fundamentals, handshake mechanics, and HTTPS. Good starting point for beginners." },
    { label: "HKDF paper (RFC 5869)", kind: "paper", note: "The key derivation function used in TLS 1.3 for deriving handshake and application traffic keys from the shared secret." },
  ],
  glossary: [
    { term: "TLS (Transport Layer Security)", definition: "A cryptographic protocol that secures communication over a network by providing encryption, integrity, and authentication. Successor to SSL." },
    { term: "SSL (Secure Sockets Layer)", definition: "The deprecated predecessor to TLS, developed by Netscape. SSL 2.0 and 3.0 are insecure and should never be used." },
    { term: "ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)", definition: "A key exchange algorithm that uses elliptic curve cryptography to generate ephemeral shared secrets. Provides perfect forward secrecy." },
    { term: "AEAD (Authenticated Encryption with Associated Data)", definition: "An encryption mode that provides both confidentiality and integrity in a single operation. Examples: AES-GCM, ChaCha20-Poly1305." },
    { term: "Certificate Authority (CA)", definition: "A trusted entity that issues digital certificates, binding a public key to a domain name after verifying ownership." },
    { term: "PFS (Perfect Forward Secrecy)", definition: "A property ensuring that session keys cannot be compromised even if the server's long-term private key is later exposed." },
    { term: "SNI (Server Name Indication)", definition: "A TLS extension where the client specifies the hostname it is connecting to in the ClientHello, allowing servers to host multiple TLS domains on a single IP." },
    { term: "HSTS (HTTP Strict Transport Security)", definition: "An HTTP header that instructs browsers to only use HTTPS for a domain, preventing downgrade attacks." },
    { term: "OCSP (Online Certificate Status Protocol)", definition: "A protocol for checking the real-time revocation status of a certificate by querying the CA's OCSP responder." },
    { term: "CT (Certificate Transparency)", definition: "A framework of public, append-only logs that record all CA-issued certificates, enabling detection of mis-issuance." },
    { term: "mTLS (Mutual TLS)", definition: "A TLS configuration where both client and server authenticate via certificates, commonly used in service-to-service communication." },
    { term: "Cipher suite", definition: "A named combination of cryptographic algorithms used in a TLS connection, specifying key exchange, authentication, encryption, and hash algorithms." },
    { term: "PSK (Pre-Shared Key)", definition: "A key established in a prior TLS session and used for session resumption, enabling 0-RTT in TLS 1.3." },
    { term: "x25519", definition: "An ECDHE key exchange function using Curve25519. Fast, secure, and the most commonly used key exchange in TLS 1.3." },
    { term: "ECH (Encrypted Client Hello)", definition: "A TLS extension that encrypts the ClientHello (including SNI), preventing passive observers from seeing which domain the client is connecting to." },
  ],
};
