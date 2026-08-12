import type { TopicContent } from "../types";

export const cryptoBasics: TopicContent = {
  quickSummary: [
    "Symmetric encryption (AES) uses the same key for encryption and decryption — fast and efficient for bulk data, but requires secure key distribution between parties.",
    "Asymmetric encryption (RSA, ECC) uses a public-private key pair — anyone can encrypt with the public key but only the private key holder can decrypt, solving the key distribution problem at the cost of slower performance.",
    "Cryptographic hash functions (SHA-256, SHA-3) produce a fixed-size fingerprint of any input — they are one-way (irreversible), deterministic, and collision-resistant, used for integrity verification and password storage.",
    "HMAC (Hash-based Message Authentication Code) combines a hash function with a secret key to provide both integrity verification and authentication — proving the message was not tampered with and came from a trusted sender.",
  ],
  detailed: [
    `## Symmetric Encryption

Symmetric encryption uses the same secret key for both encryption and decryption. It is fast and suitable for encrypting large volumes of data.

**AES (Advanced Encryption Standard)** is the dominant symmetric algorithm, adopted by NIST in 2001. It supports key sizes of 128, 192, or 256 bits.

**Block cipher modes** determine how AES processes data larger than one 128-bit block:
- **ECB (Electronic Codebook)**: Each block encrypted independently. Insecure — identical plaintext blocks produce identical ciphertext, revealing patterns. Never use for real encryption.
- **CBC (Cipher Block Chaining)**: Each block XORed with the previous ciphertext block before encryption. Requires an initialization vector (IV). Secure but sequential (not parallelizable).
- **CTR (Counter)**: Encrypts a counter value, then XORs the result with plaintext. Parallelizable and no padding needed.
- **GCM (Galois/Counter Mode)**: CTR mode + built-in authentication tag. Provides both confidentiality and integrity (authenticated encryption). The recommended mode for most applications.

**Key challenge**: Both parties must share the same key securely. This is the fundamental limitation of symmetric encryption, addressed by asymmetric encryption for key exchange.`,

    `## Asymmetric Encryption

Asymmetric encryption uses mathematically related key pairs — a public key (shared openly) and a private key (kept secret).

**RSA** (Rivest-Shamir-Adleman): Based on the difficulty of factoring large prime numbers. Common key sizes: 2048 or 4096 bits. Used for encryption, digital signatures, and key exchange. Slower than symmetric encryption by orders of magnitude.

**ECC** (Elliptic Curve Cryptography): Based on elliptic curve discrete logarithm problem. Provides equivalent security to RSA with much smaller keys — a 256-bit ECC key is as strong as a 3072-bit RSA key. Faster and more efficient, especially on mobile devices.

**Common uses:**
- **Encryption**: Encrypt with the recipient's public key; only their private key can decrypt. Used for secure messaging and key exchange.
- **Digital signatures**: Sign with the sender's private key; anyone with the public key can verify. Proves authenticity and non-repudiation.
- **Key exchange**: Asymmetric encryption is too slow for bulk data. In practice (TLS), it is used to exchange a symmetric session key, which then encrypts the actual data (hybrid encryption).

**Diffie-Hellman** key exchange allows two parties to establish a shared secret over an insecure channel without ever transmitting the secret itself, using modular exponentiation.`,

    `## Cryptographic Hash Functions

A hash function maps arbitrary-length input to a fixed-size output (digest/hash) with these properties:

- **Deterministic**: Same input always produces the same hash
- **One-way (preimage resistant)**: Computationally infeasible to reverse the hash to find the original input
- **Collision resistant**: Computationally infeasible to find two different inputs producing the same hash
- **Avalanche effect**: A small change in input produces a drastically different hash

**Common algorithms:**
- **MD5** (128-bit): Broken — collision attacks are practical. Never use for security.
- **SHA-1** (160-bit): Deprecated — collision demonstrated by Google in 2017.
- **SHA-256** (256-bit): Part of SHA-2 family. Currently the industry standard.
- **SHA-3** (variable): Based on Keccak sponge construction, different internal design from SHA-2. Provides diversity if SHA-2 is ever compromised.

**Use cases:**
- File integrity verification (checksums)
- Digital signatures (hash the document, then sign the hash)
- Password storage (with salting and key-stretching — see bcrypt/argon2)
- Data deduplication
- Merkle trees in blockchain and Git`,

    `## HMAC (Hash-based Message Authentication Code)

HMAC combines a cryptographic hash function with a secret key to produce a message authentication code. It provides both integrity (the message was not tampered with) and authentication (the message came from someone who knows the key).

**HMAC construction:**
\`\`\`
HMAC(K, M) = H((K' XOR opad) || H((K' XOR ipad) || M))
\`\`\`
Where K' is the key (padded or hashed to block size), opad/ipad are fixed padding constants, H is the hash function, and M is the message.

**Difference from plain hashing:**
- Hash alone: anyone can compute H(message) — it proves integrity but not authenticity
- HMAC: only someone with the key can compute HMAC(key, message) — it proves both integrity and authenticity

**Common uses:**
- API authentication (AWS Signature V4 uses HMAC-SHA256)
- JWT signature verification (HS256 = HMAC-SHA256)
- Webhook verification (services send HMAC of payload for recipient to verify)
- Cookie tampering detection

**HMAC vs digital signatures:** HMAC uses symmetric keys (both parties share the same key), while digital signatures use asymmetric keys (signer has private key, verifiers have public key). HMAC is faster but requires shared secrets. Digital signatures provide non-repudiation (proving WHO signed).`,

    `## Practical Cryptography Guidelines

**Do:**
- Use established libraries (OpenSSL, libsodium, Web Crypto API) — never implement crypto algorithms yourself
- Use AES-256-GCM for symmetric encryption (provides both confidentiality and integrity)
- Use RSA-2048+ or ECC P-256+ for asymmetric operations
- Use SHA-256 or SHA-3 for hashing
- Generate cryptographically secure random numbers for keys and IVs (crypto.randomBytes, SecureRandom)
- Rotate encryption keys periodically
- Use envelope encryption for large-scale key management (encrypt data key with master key)

**Do not:**
- Use MD5 or SHA-1 for any security purpose
- Use ECB mode for block ciphers
- Reuse IVs/nonces with the same key
- Store encryption keys alongside encrypted data
- Use encryption when you need hashing (passwords) or hashing when you need encryption (confidentiality)
- Roll your own cryptographic protocols
- Hardcode keys in source code

**Hybrid encryption pattern (used by TLS):**
1. Generate a random symmetric session key
2. Encrypt the session key with the recipient's public key (asymmetric)
3. Encrypt the data with the session key (symmetric)
4. Send both the encrypted session key and the encrypted data`,
  ],
  interviewQA: [
    {
      q: "Why do we use hybrid encryption (asymmetric + symmetric) rather than pure asymmetric encryption?",
      a: "Asymmetric encryption (RSA, ECC) is computationally expensive — orders of magnitude slower than symmetric encryption (AES). It is impractical for encrypting large amounts of data. Hybrid encryption solves this: use asymmetric encryption to securely exchange a random symmetric session key (solving the key distribution problem), then use symmetric encryption to encrypt the actual data (providing speed). This is exactly how TLS works — the handshake uses asymmetric crypto to agree on a session key, then all data is encrypted with AES.",
    },
    {
      q: "What is the difference between encryption, hashing, and encoding?",
      a: "Encryption is reversible with a key — transforms data so only authorized parties can read it (AES, RSA). It provides confidentiality. Hashing is a one-way function — produces a fixed-size fingerprint that cannot be reversed (SHA-256). It provides integrity verification. Encoding is reversible without a key — transforms data for compatibility or transport (Base64, URL encoding). It provides no security whatsoever. A common mistake is treating encoding as encryption (Base64 is not encryption) or using encryption where hashing is needed (passwords should be hashed, not encrypted).",
    },
    {
      q: "Why should you never use ECB mode for AES encryption?",
      a: "ECB (Electronic Codebook) mode encrypts each 16-byte block independently with the same key. Identical plaintext blocks produce identical ciphertext blocks, which reveals patterns in the data. The classic demonstration is encrypting a bitmap image — the shapes remain visible in the ciphertext because identical color regions produce identical encrypted blocks. Use GCM mode instead, which provides both confidentiality (counter-based stream cipher) and integrity (authentication tag), and where identical plaintext blocks produce different ciphertext due to the counter.",
    },
    {
      q: "What is the difference between HMAC and a digital signature?",
      a: "HMAC uses a symmetric shared secret — both the sender and verifier must know the same key. It provides integrity (message not tampered) and authentication (came from someone who knows the key), but not non-repudiation (you cannot prove which party produced it since both share the key). Digital signatures use asymmetric keys — the signer uses their private key, verifiers use the public key. This provides integrity, authentication, AND non-repudiation (only the private key holder could have signed). HMAC is faster and simpler; signatures are needed when you must prove exactly who signed something.",
    },
  ],
  followUps: [
    "When do you use symmetric versus asymmetric encryption, and why not just use asymmetric everywhere?",
    "What does a MAC give you that encryption alone does not?",
    "Why is 'don't roll your own crypto' about mode and nonce choices rather than the algorithm?",
  ],
  mcqs: [
    {
      q: "Which AES block cipher mode provides both confidentiality and integrity (authenticated encryption)?",
      options: ["ECB", "CBC", "CTR", "GCM"],
      answerIndex: 3,
      explanation:
        "GCM (Galois/Counter Mode) combines counter-mode encryption with a Galois field-based authentication tag, providing both confidentiality and integrity in a single operation.",
    },
    {
      q: "What advantage does ECC have over RSA?",
      options: [
        "ECC uses simpler math",
        "ECC provides equivalent security with much smaller key sizes",
        "ECC does not require key pairs",
        "ECC is based on prime factoring",
      ],
      answerIndex: 1,
      explanation:
        "A 256-bit ECC key provides security equivalent to a 3072-bit RSA key, making ECC more efficient in terms of computation, bandwidth, and storage — especially important on mobile and IoT devices.",
    },
    {
      q: "What property of a cryptographic hash function means a small input change produces a completely different hash?",
      options: [
        "Collision resistance",
        "Preimage resistance",
        "Avalanche effect",
        "Determinism",
      ],
      answerIndex: 2,
      explanation:
        "The avalanche effect means that changing even a single bit of input produces a drastically different hash output, making it impossible to predict or control hash values through incremental input changes.",
    },
    {
      q: "What does HMAC provide that a plain hash does not?",
      options: [
        "Faster computation",
        "Larger output size",
        "Authentication (proof the message came from someone who knows the key)",
        "Reversibility",
      ],
      answerIndex: 2,
      explanation:
        "HMAC incorporates a secret key, so only someone who knows the key can produce or verify the MAC. A plain hash can be computed by anyone, proving only integrity but not who produced it.",
    },
  ],
  flashcards: [
    {
      front: "What is symmetric vs asymmetric encryption?",
      back: "Symmetric uses one shared key for encrypt/decrypt (AES — fast, for bulk data). Asymmetric uses a public/private key pair (RSA, ECC — slow, for key exchange and signatures). In practice, hybrid: asymmetric exchanges a symmetric session key.",
    },
    {
      front: "Why is AES-GCM the recommended encryption mode?",
      back: "GCM provides authenticated encryption — both confidentiality (data is unreadable) and integrity (data is not tampered with) in a single operation, with an authentication tag. It is also parallelizable for performance.",
    },
    {
      front: "What hash algorithms are currently considered secure?",
      back: "SHA-256 and SHA-3 are secure. MD5 (broken, collisions are trivial) and SHA-1 (collision demonstrated in 2017) should never be used for security purposes.",
    },
    {
      front: "What is envelope encryption?",
      back: "A pattern where data is encrypted with a data encryption key (DEK), and the DEK is encrypted with a master key (KEK). The encrypted DEK is stored alongside the data. Used in AWS KMS, GCP KMS — allows key rotation without re-encrypting all data.",
    },
    {
      front: "What is a nonce/IV and why must it never be reused?",
      back: "An initialization vector (IV) or nonce is a random value used with the encryption key to ensure identical plaintexts produce different ciphertexts. Reusing a nonce with the same key can leak plaintext (in CTR/GCM, XORing two ciphertexts cancels the keystream).",
    },
    {
      front: "What is the Diffie-Hellman key exchange?",
      back: "A protocol allowing two parties to establish a shared secret over an insecure channel. Each generates a private/public value; they exchange public values and combine with their private value to derive the same shared secret. An eavesdropper who sees both public values cannot derive the shared secret.",
    },
    {
      front: "What is non-repudiation and which cryptographic mechanism provides it?",
      back: "Non-repudiation means the signer cannot deny having signed a message. Only digital signatures (asymmetric crypto) provide it — since only the private key holder can sign. HMAC does not provide non-repudiation because both parties share the same key.",
    },
  ],
  deepDive: [
    `## The Mathematics Behind RSA and Why Key Size Matters

**RSA** relies on a deceptively simple mathematical fact: multiplying two large **prime numbers** is trivial, but *factoring* their product back into those primes is computationally infeasible for sufficiently large numbers. When you generate an RSA key pair, the system selects two random primes *p* and *q*, computes their product \`n = p * q\`, and derives the public exponent *e* and private exponent *d* such that \`(m^e)^d mod n = m\` for any message *m*. The security of the entire scheme rests on the assumption that an attacker who knows *n* (which is public) cannot efficiently recover *p* and *q*. As of today, the **General Number Field Sieve (GNFS)** is the fastest known classical algorithm for factoring, and its sub-exponential runtime means that doubling the key size more than squares the difficulty. This is why **2048-bit RSA** is considered the minimum: a 1024-bit key was once standard but is now within reach of well-resourced adversaries. Looking ahead, **Shor's algorithm** running on a sufficiently powerful *quantum computer* could factor in polynomial time, which is why post-quantum cryptography research (lattice-based, code-based, hash-based schemes) is accelerating.`,

    `## How AES-GCM Achieves Authenticated Encryption Internally

**AES-GCM** (Galois/Counter Mode) is the workhorse of modern symmetric cryptography because it solves *two problems simultaneously*: **confidentiality** and **integrity**. Internally, GCM operates in two parallel tracks. The **CTR (Counter) track** generates a keystream by encrypting successive counter values (\`IV || 0x00000002\`, \`IV || 0x00000003\`, ...) with the AES block cipher, then \`XOR\`-ing the keystream with the plaintext to produce ciphertext. This makes encryption *parallelizable* and eliminates the need for padding. The **GHASH track** runs a *Galois field multiplication* over the ciphertext blocks and any additional authenticated data (AAD) to produce a 128-bit **authentication tag**. The recipient recomputes the tag and compares it to the received tag before even looking at the decrypted plaintext. If a single bit of ciphertext or AAD was altered, the tag will not match, and the entire message is rejected. A critical operational requirement is that the **96-bit IV/nonce must never be reused** with the same key. Reusing a nonce in GCM is catastrophic: it allows an attacker to recover the GHASH key *H* and forge authentication tags, completely destroying both confidentiality and integrity guarantees. This is why *nonce management* (random generation or deterministic counters) is one of the most important implementation details.`,

    `## Key Derivation, Salting, and Password Storage Best Practices

Raw passwords should **never** be stored in any form that is directly reversible. The correct approach is to use a **key derivation function (KDF)** designed to be *intentionally slow* and *memory-hard*. **bcrypt** hashes the password with a configurable cost factor (work factor) that determines how many rounds of the internal Blowfish-based computation are performed. **Argon2** (winner of the 2015 Password Hashing Competition) goes further by being both *CPU-hard* and *memory-hard*, requiring a configurable amount of RAM, which defeats GPU-based and ASIC-based cracking attacks. Both algorithms internally prepend a random **salt** (typically 16 bytes) to each password before hashing, ensuring that identical passwords produce *different* hashes. Without salting, an attacker could precompute a **rainbow table** mapping common passwords to their hashes and instantly look up any match. The salt forces the attacker to crack each hash individually. For deriving encryption keys from passwords (as opposed to storing password hashes), use \`PBKDF2\`, \`scrypt\`, or \`HKDF\`. **HKDF** (HMAC-based Key Derivation Function) is particularly useful when you need to derive *multiple keys* from a single shared secret (e.g., separate encryption key and MAC key from one Diffie-Hellman output), using an *extract-then-expand* paradigm defined in **RFC 5869**.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "SHA-256 Hashing with OpenSSL (C++)",
      source: `#include <openssl/evp.h>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

// Compute the **SHA-256** hash of an arbitrary input string
// using the OpenSSL *EVP* (envelope) API.
std::string sha256(const std::string& input) {
    // Create a message-digest context
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    const EVP_MD* md = EVP_sha256();

    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_len = 0;

    // Initialize, update with data, and finalize the digest
    EVP_DigestInit_ex(ctx, md, nullptr);
    EVP_DigestUpdate(ctx, input.c_str(), input.size());
    EVP_DigestFinal_ex(ctx, hash, &hash_len);

    EVP_MD_CTX_free(ctx);

    // Convert the binary digest to a hex string
    std::ostringstream oss;
    for (unsigned int i = 0; i < hash_len; ++i)
        oss << std::hex << std::setfill('0') << std::setw(2)
            << static_cast<int>(hash[i]);

    return oss.str();
}

int main() {
    std::string message = "Hello, Cryptography!";
    std::cout << "Input:  " << message << "\\n";
    std::cout << "SHA-256: " << sha256(message) << "\\n";
    return 0;
}
// Compile: g++ -o sha256_demo sha256_demo.cpp -lssl -lcrypto`,
    },
    {
      language: "cpp",
      caption: "AES-256-GCM Symmetric Encryption with OpenSSL (C++)",
      source: `#include <openssl/evp.h>
#include <openssl/rand.h>
#include <cstring>
#include <iostream>
#include <vector>

// **AES-256-GCM** authenticated encryption example.
// Encrypts plaintext and produces ciphertext + a 128-bit *authentication tag*.

bool aes256_gcm_encrypt(
    const std::vector<unsigned char>& key,       // 32 bytes (256 bits)
    const std::vector<unsigned char>& iv,        // 12 bytes (96-bit nonce)
    const std::string& plaintext,
    std::vector<unsigned char>& ciphertext,
    std::vector<unsigned char>& tag              // 16 bytes (128-bit tag)
) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();

    // Initialize encryption with \`AES-256-GCM\`
    EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, nullptr, nullptr);

    // Set the IV length (default is 12 bytes for GCM)
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, iv.size(), nullptr);

    // Provide key and IV
    EVP_EncryptInit_ex(ctx, nullptr, nullptr, key.data(), iv.data());

    // Encrypt the plaintext
    ciphertext.resize(plaintext.size() + 16);
    int out_len = 0;
    EVP_EncryptUpdate(ctx,
        ciphertext.data(), &out_len,
        reinterpret_cast<const unsigned char*>(plaintext.c_str()),
        plaintext.size());
    int total_len = out_len;

    // Finalize encryption
    EVP_EncryptFinal_ex(ctx, ciphertext.data() + total_len, &out_len);
    total_len += out_len;
    ciphertext.resize(total_len);

    // Extract the **authentication tag**
    tag.resize(16);
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, tag.data());

    EVP_CIPHER_CTX_free(ctx);
    return true;
}

int main() {
    // Generate a random 256-bit key and 96-bit IV
    std::vector<unsigned char> key(32), iv(12);
    RAND_bytes(key.data(), key.size());
    RAND_bytes(iv.data(), iv.size());

    std::string plaintext = "Sensitive payload: account_id=42";
    std::vector<unsigned char> ciphertext, tag;

    aes256_gcm_encrypt(key, iv, plaintext, ciphertext, tag);

    std::cout << "Plaintext size:  " << plaintext.size() << " bytes\\n";
    std::cout << "Ciphertext size: " << ciphertext.size() << " bytes\\n";
    std::cout << "Auth tag size:   " << tag.size() << " bytes\\n";
    return 0;
}
// Compile: g++ -o aes_gcm_demo aes_gcm_demo.cpp -lssl -lcrypto`,
    },
    {
      language: "cpp",
      caption: "HMAC-SHA256 Message Authentication with OpenSSL (C++)",
      source: `#include <openssl/hmac.h>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

// Compute **HMAC-SHA256** over a message using a secret key.
// This provides both *integrity* and *authentication*.
std::string hmac_sha256(const std::string& key, const std::string& message) {
    unsigned char result[EVP_MAX_MD_SIZE];
    unsigned int result_len = 0;

    HMAC(EVP_sha256(),
         key.c_str(), key.size(),
         reinterpret_cast<const unsigned char*>(message.c_str()),
         message.size(),
         result, &result_len);

    std::ostringstream oss;
    for (unsigned int i = 0; i < result_len; ++i)
        oss << std::hex << std::setfill('0') << std::setw(2)
            << static_cast<int>(result[i]);

    return oss.str();
}

int main() {
    std::string secret = "my-api-secret-key";
    std::string payload = "user_id=100&action=transfer&amount=500";

    std::string mac = hmac_sha256(secret, payload);
    std::cout << "Payload: " << payload << "\\n";
    std::cout << "HMAC:    " << mac << "\\n";

    // Verification: recompute and compare
    std::string verify = hmac_sha256(secret, payload);
    std::cout << "Valid:   " << (mac == verify ? "YES" : "NO") << "\\n";
    return 0;
}
// Compile: g++ -o hmac_demo hmac_demo.cpp -lssl -lcrypto`,
    },
  ],

  diagrams: [
    {
      title: "Hybrid Encryption Flow - TLS Pattern",
      kind: "sequence",
      caption: "Asymmetric encryption handles the key exchange handshake. Once both sides share a session key, faster symmetric AES-GCM encrypts all data.",
      mermaid: `sequenceDiagram
    participant Client
    participant Server
    Client->>Server: ClientHello with supported ciphers
    Server->>Client: ServerHello and Certificate with public key
    Client->>Client: Generate random session key
    Client->>Server: Session key encrypted with server public key
    Server->>Server: Decrypt session key with private key
    Client->>Server: Data encrypted with AES-GCM session key
    Server->>Client: Data encrypted with AES-GCM session key`,
    },
    {
      title: "Cryptographic Primitives Overview",
      kind: "mindmap",
      caption: "The main cryptographic primitives, their algorithms, and primary use cases.",
      mermaid: `mindmap
  root[Cryptography]
    Symmetric Encryption
      AES-256-GCM
      Fast bulk data
      Shared key required
    Asymmetric Encryption
      RSA-2048
      ECC P-256
      Key exchange
      Digital signatures
    Hashing
      SHA-256
      SHA-3
      Integrity and fingerprinting
    Password Hashing
      bcrypt
      Argon2id
      Intentionally slow
    MAC
      HMAC-SHA256
      Integrity plus authentication`,
    },
    {
      title: "AES-GCM Internal Architecture",
      kind: "flow",
      caption: "AES-GCM runs two parallel tracks: CTR mode encrypts plaintext, GHASH authenticates both ciphertext and additional data to produce a 128-bit authentication tag.",
      mermaid: `flowchart TD
    KEY["AES Key 128 or 256 bit"] --> AES["AES Block Cipher"]
    NONCE["Nonce 96 bit"] --> CTR["Counter Generator"]
    CTR --> AES
    AES --> KS["Keystream Block"]
    PT["Plaintext Blocks"] --> XOR["XOR with Keystream"]
    KS --> XOR
    XOR --> CT["Ciphertext Blocks"]
    CT --> GHASH["GHASH - Galois Field Multiply"]
    AAD["Additional Auth Data"] --> GHASH
    GHASH --> TAG["Auth Tag 128 bit"]
    CT --> OUT["Encrypted Output"]
    TAG --> OUT`,
    },
    {
      title: "Symmetric vs Asymmetric Key Usage",
      kind: "architecture",
      caption: "When to use symmetric vs asymmetric encryption, showing the typical hybrid envelope encryption pattern used in TLS, PGP, and cloud KMS.",
      mermaid: `graph TD
    A["Choose Crypto Primitive"] --> B{Use case?}
    B -->|Bulk data encryption| C["AES-256-GCM - symmetric"]
    B -->|Key exchange| D["ECDH or RSA - asymmetric"]
    B -->|Digital signature| E["ECDSA or RSA-PSS - asymmetric"]
    B -->|Password storage| F["Argon2id or bcrypt"]
    B -->|Integrity only| G["HMAC-SHA256"]
    C --> H["Envelope Pattern: wrap AES key with RSA or ECC"]
    D --> H`,
    },
  ],

  animations: [
    {
      title: "Why TLS uses both kinds of cryptography",
      steps: [
        {
          label: "Asymmetric is slow",
          detail: "Public-key operations are orders of magnitude more expensive than symmetric ones — unusable for bulk data.",
        },
        {
          label: "Symmetric needs a shared key",
          detail: "Fast, but both sides must already have the same secret — which is the problem you started with.",
        },
        {
          label: "Handshake",
          detail: "Asymmetric crypto authenticates the server and establishes a shared secret over an untrusted network.",
        },
        {
          label: "Session",
          detail: "That shared secret keys a symmetric cipher for the actual data. Fast for the rest of the connection.",
        },
        {
          label: "Integrity",
          detail: "An authenticated cipher (AEAD) detects tampering — encryption alone would not.",
        },
        {
          label: "Forward secrecy",
          detail: "Ephemeral keys mean a later theft of the server's private key can't decrypt recorded past sessions.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "**AES-256** (Symmetric)",
      "**RSA-2048** (Asymmetric)",
      "**ECC P-256** (Asymmetric)",
    ],
    rows: [
      [
        "Type",
        "Symmetric (shared key)",
        "Asymmetric (key pair)",
        "Asymmetric (key pair)",
      ],
      [
        "Key Size",
        "256 bits",
        "2048 bits (public + private)",
        "256 bits (equivalent to RSA-3072)",
      ],
      [
        "Security Basis",
        "Substitution-permutation network",
        "Integer factoring problem",
        "Elliptic curve discrete log problem",
      ],
      [
        "Speed",
        "*Very fast* (hardware-accelerated via AES-NI)",
        "*Slow* (~1000x slower than AES for encryption)",
        "*Moderate* (~10x faster than RSA for signing)",
      ],
      [
        "Primary Use",
        "Bulk data encryption",
        "Key exchange, digital signatures, encryption",
        "Key exchange (ECDH), digital signatures (ECDSA)",
      ],
      [
        "Quantum Resistance",
        "Partially (Grover's halves effective key size; AES-256 -> 128-bit security)",
        "**Broken** by Shor's algorithm",
        "**Broken** by Shor's algorithm",
      ],
      [
        "Key Distribution",
        "Requires secure channel to share key",
        "Public key shared openly",
        "Public key shared openly",
      ],
      [
        "Non-repudiation",
        "No (shared key means either party could have produced the ciphertext)",
        "Yes (only private key holder can sign)",
        "Yes (only private key holder can sign)",
      ],
      [
        "Standard / Adoption",
        "NIST FIPS 197 (2001); universal",
        "PKCS#1; TLS, SSH, PGP; being phased out for ECC",
        "NIST P-256 / secp256r1; TLS 1.3, modern protocols",
      ],
    ],
  },

  exercises: [
    "**Hash Collision Experiment**: Write a C++ program that generates random 4-character strings and computes their SHA-256 hashes. Count how many strings you need to generate before finding two that share the same *first 4 hex characters* (16-bit prefix collision). Compare this to the theoretical birthday bound of `2^(n/2)` where `n = 16` bits. Extend to 5, 6, and 7 hex characters and plot the relationship.",
    "**AES Mode Comparison**: Encrypt a 128x128 pixel BMP image (a simple checkerboard pattern) using AES-256 in both **ECB** mode and **CBC** mode with OpenSSL's command-line tool. Visually compare the output files. Explain *why* ECB mode preserves patterns while CBC does not. Document which block cipher mode properties account for this difference.",
    "**HMAC Verification Pipeline**: Build a C++ program that (1) reads a file, (2) computes its `HMAC-SHA256` using a secret key, and (3) writes the HMAC to a `.sig` file. Then write a *verifier* that re-reads the file, recomputes the HMAC, and compares it to the stored `.sig`. Test by tampering with a single byte of the original file and confirming that verification fails.",
    "**Diffie-Hellman Key Exchange Simulation**: Implement a simplified Diffie-Hellman key exchange in C++ using small prime numbers (for demonstration). Both \"Alice\" and \"Bob\" should generate private values, compute public values using `g^a mod p`, exchange public values, and independently derive the *same shared secret*. Print each step to show how the math works. Then explain why an eavesdropper who sees both public values cannot recover the shared secret.",
    "**Envelope Encryption Demo**: Using OpenSSL in C++, implement an *envelope encryption* workflow: (1) generate a random 256-bit **data encryption key (DEK)**, (2) encrypt a file with `AES-256-GCM` using the DEK, (3) encrypt the DEK itself with an RSA-2048 **key encryption key (KEK)**, (4) store the encrypted DEK alongside the ciphertext. Then implement the decryption path. Discuss why this pattern allows key rotation without re-encrypting all data.",
  ],

  cheatSheet: [
    "**Symmetric vs Asymmetric**: Symmetric (AES) = same key, fast, bulk data. Asymmetric (RSA/ECC) = key pair, slow, key exchange + signatures. In practice, always *hybrid*: asymmetric exchanges a symmetric session key.",
    "**AES Mode Selection**: Use `AES-GCM` (authenticated encryption) for almost everything. Avoid `ECB` (leaks patterns), `CBC` without HMAC (no integrity), and `CTR` alone (no authentication). GCM = confidentiality + integrity in one pass.",
    "**Hash Function Choice**: Use `SHA-256` or `SHA-3`. Never `MD5` (collisions trivial) or `SHA-1` (collision demonstrated 2017). For passwords, use `bcrypt` or `Argon2` (intentionally slow + salted), **not** raw SHA-256.",
    "**Nonce/IV Rules**: Always generate a *cryptographically random* IV for each encryption operation. **Never reuse** an IV with the same key, especially in GCM mode (reuse leaks the GHASH key and allows forgery). For GCM: 96-bit (12-byte) nonce is standard.",
    "**HMAC vs Signature**: HMAC = symmetric key, fast, proves integrity + authentication but **not** non-repudiation. Digital signature = asymmetric key, slower, proves integrity + authentication **+** non-repudiation. Use HMAC for API auth; use signatures when you need to prove *who* signed.",
    "**Key Size Equivalences**: AES-128 ~ RSA-3072 ~ ECC-256. AES-256 ~ RSA-15360 ~ ECC-521. ECC provides equivalent security with *much* smaller keys. Prefer ECC (P-256/Curve25519) over RSA for new systems.",
  ],

  revisionNotes: [
    "**Core triad**: *Confidentiality* (encryption prevents unauthorized reading), *Integrity* (hashing/MAC detects tampering), *Authentication* (HMAC/signatures prove origin). Every crypto decision maps to one or more of these goals.",
    "**The hybrid encryption pattern** is fundamental: (1) generate random symmetric key, (2) encrypt the symmetric key with the recipient's public key, (3) encrypt data with the symmetric key, (4) send encrypted key + encrypted data. This combines the *key distribution* advantage of asymmetric crypto with the *speed* of symmetric crypto. TLS, PGP, and S/MIME all use this pattern.",
    "**AES-GCM internals** to remember: CTR track encrypts counter values and XORs with plaintext (parallel, no padding). GHASH track multiplies ciphertext blocks in a Galois field to produce a 128-bit authentication tag. The 96-bit nonce **must never repeat** with the same key -- nonce reuse is catastrophic (leaks GHASH key *H*, allows tag forgery).",
    "**Password storage is not encryption** -- it is *one-way hashing* with salt and intentional slowness. Use `Argon2id` (memory-hard + CPU-hard, PHC winner) or `bcrypt` (cost-factor adjustable). Raw `SHA-256(password)` is crackable via rainbow tables and GPU brute-force. Always add a random **salt** per user to defeat precomputed attacks.",
    "**Post-quantum awareness**: RSA and ECC are both *broken* by Shor's algorithm on a quantum computer. AES-256 retains ~128-bit security against Grover's algorithm (which halves effective key length). NIST has standardized post-quantum algorithms: **ML-KEM** (Kyber) for key exchange and **ML-DSA** (Dilithium) for signatures. Start planning migration for long-lived data.",
  ],

  resources: [
    {
      label: "Cryptography Engineering — Ferguson, Schneier & Kohno",
      kind: "book",
    },
    {
      label: "Serious Cryptography — Jean-Philippe Aumasson",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "AES (Advanced Encryption Standard)",
      definition:
        "The dominant symmetric encryption algorithm, operating on 128-bit blocks with 128, 192, or 256-bit keys. Adopted by NIST in 2001 to replace DES.",
    },
    {
      term: "RSA",
      definition:
        "An asymmetric encryption algorithm based on the difficulty of factoring large prime products. Used for encryption, digital signatures, and key exchange with key sizes of 2048+ bits.",
    },
    {
      term: "SHA-256",
      definition:
        "A cryptographic hash function from the SHA-2 family producing a 256-bit digest. Currently the industry standard for integrity verification and digital signatures.",
    },
    {
      term: "HMAC",
      definition:
        "Hash-based Message Authentication Code — combines a hash function with a secret key to provide both message integrity and authentication of the sender.",
    },
    {
      term: "Authenticated Encryption",
      definition:
        "Encryption that provides both confidentiality and integrity/authenticity in a single operation, such as AES-GCM, preventing both reading and tampering with ciphertext.",
    },
    {
      term: "Key Exchange",
      definition:
        "A protocol (like Diffie-Hellman) that allows two parties to establish a shared cryptographic key over an insecure channel without transmitting the key itself.",
    },
    {
      term: "Digital Signature",
      definition:
        "A cryptographic scheme using asymmetric keys where the signer's private key produces a signature that anyone with the public key can verify, providing integrity, authentication, and non-repudiation.",
    },
  ],
};
