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
