import type { TopicContent } from "../types";

export const hashingPasswords: TopicContent = {
  quickSummary: [
    "Passwords must be hashed (not encrypted) before storage — hashing is a one-way function, so even if the database is breached, original passwords cannot be recovered.",
    "Bcrypt, Argon2, and scrypt are password-specific hashing algorithms that are deliberately slow (key stretching), making brute-force and dictionary attacks computationally expensive.",
    "Salting adds a unique random value to each password before hashing, ensuring identical passwords produce different hashes and defeating precomputed rainbow table attacks.",
    "Peppering adds a server-side secret to the hash input, providing an additional layer of defense — even with the database stolen, the attacker also needs the pepper from the application server.",
  ],
  detailed: [
    `## Why Hash Passwords (Not Encrypt)

Encryption is reversible — anyone with the key can decrypt and read the original passwords. If the key is compromised alongside the database, all passwords are exposed. Password hashing is one-way: there is no key, and the original password cannot be recovered from the hash.

**Verification without reversal:**
\`\`\`
Registration: hash(password) -> stored_hash
Login: hash(input_password) == stored_hash?
\`\`\`

**Why not use general-purpose hash functions (SHA-256)?**
SHA-256 is designed to be fast — a modern GPU can compute billions of SHA-256 hashes per second. An attacker with a stolen database can try every common password in seconds. Password hashing algorithms (bcrypt, argon2) are deliberately slow, taking 100ms+ per hash, making brute-force attacks impractical.

**The math:**
- SHA-256: ~10 billion hashes/second on a GPU. A dictionary of 10 million passwords is checked in 1 millisecond.
- Bcrypt (cost=12): ~10 hashes/second on a GPU. The same dictionary takes ~12 days.
- Argon2 (memory-hard): Even slower with high memory requirements that limit GPU parallelism.`,

    `## Bcrypt

Bcrypt is the most widely used password hashing algorithm, based on the Blowfish cipher. Introduced in 1999, it remains secure and is available in every major programming language.

**Key features:**
- **Work factor (cost)**: A parameter that controls computation time. Cost 10 means 2^10 = 1024 rounds of processing. Each increment doubles the time. Recommended minimum: cost 12 (about 250ms on modern hardware).
- **Built-in salt**: Bcrypt generates and stores a 128-bit salt automatically in the hash output. No separate salt management needed.
- **Fixed output format**: \`$2b$12$salt22chars.hash31chars\` — includes algorithm identifier, cost, salt, and hash in one string.

\`\`\`
$2b$12$WApznUPhDubN0oeveSXHp.xLFkON6NHM0ET0IByAGvnI90hSF4QMq
 |   |  |                    |
 |   |  salt (22 chars)      hash (31 chars)
 |   cost factor (12)
 algorithm (2b = bcrypt)
\`\`\`

**Limitations:**
- Maximum password length of 72 bytes (characters beyond this are silently ignored)
- CPU-bound only — can be parallelized on GPUs (though still slow)
- No memory-hardness — Argon2 is more resistant to specialized hardware attacks`,

    `## Argon2

Argon2 won the Password Hashing Competition (PHC) in 2015 and is considered the state-of-the-art password hashing algorithm.

**Three variants:**
- **Argon2d**: Data-dependent memory access, maximizing resistance to GPU cracking but vulnerable to side-channel attacks. Use for cryptocurrency mining and backend-only scenarios.
- **Argon2i**: Data-independent memory access, resistant to side-channel attacks. Use when the hashing runs in a potentially adversarial environment.
- **Argon2id**: Hybrid — first pass uses Argon2i (side-channel resistant), subsequent passes use Argon2d (GPU resistant). Recommended for password hashing.

**Tunable parameters:**
- **Memory** (m): Amount of RAM required (e.g., 64MB). This is what makes Argon2 "memory-hard" — GPUs have limited per-core memory, severely limiting parallelism.
- **Iterations** (t): Number of passes over memory. More iterations = more time.
- **Parallelism** (p): Number of threads used. Should match the server's available cores.

**OWASP recommended minimums:**
- Argon2id with m=19456 (19 MB), t=2, p=1
- Or bcrypt with cost=12 as a well-tested alternative

Argon2's memory-hardness is its key advantage: custom ASIC/GPU crackers cannot efficiently attack it because they need massive amounts of fast memory per hash computation.`,

    `## Scrypt and PBKDF2

**Scrypt** is a memory-hard key derivation function designed in 2009. Like Argon2, it requires significant memory, making GPU and ASIC attacks expensive.

Parameters: N (CPU/memory cost), r (block size), p (parallelism). A common setting is N=16384, r=8, p=1.

Used extensively in cryptocurrency (Litecoin, Dogecoin) and supported in many languages. Drawback compared to Argon2: less flexible tuning and harder to configure correctly.

**PBKDF2** (Password-Based Key Derivation Function 2) is an older standard (RFC 2898, NIST SP 800-132). It applies HMAC-SHA256 repeatedly (iterations parameter).

- Widely supported (built into .NET, Java, Python, openssl)
- NIST and FIPS compliant — required in some regulated environments
- Not memory-hard — vulnerable to GPU parallelization
- OWASP recommends 600,000+ iterations with HMAC-SHA256 if you must use PBKDF2
- Generally less preferred than bcrypt or Argon2 for new applications`,

    `## Salting and Peppering

**Salt:**
A unique random value generated for each password, stored alongside the hash. Purpose:
- Prevents identical passwords from having identical hashes
- Defeats rainbow tables (precomputed hash-to-password lookup tables)
- Each password must be cracked individually, even if multiple users have the same password

Salts are not secret — they are stored in the database alongside the hash. Their purpose is uniqueness, not secrecy. Bcrypt and Argon2 handle salting automatically.

**Pepper:**
A secret value added to the password before hashing, stored separately from the database (environment variable, HSM, secrets manager). If the database is breached but the pepper is not, the attacker cannot even begin cracking because they are missing an input to the hash function.

\`\`\`
hash = argon2(password + pepper, salt)
\`\`\`

Implementation options:
- Prepend/append pepper to password before hashing
- HMAC the password with the pepper, then hash the result
- Encrypt the hash with the pepper key (allows pepper rotation without rehashing)

**Pepper rotation** is challenging because all existing hashes must be updated. The encrypt-the-hash approach allows re-encrypting stored hashes with a new pepper key without knowing the original passwords.`,
  ],
  interviewQA: [
    {
      q: "Why can't you use SHA-256 for password hashing?",
      a: "SHA-256 is designed to be extremely fast — modern GPUs compute billions of SHA-256 hashes per second. This makes brute-force attacks trivial: an attacker with a stolen database can check every common password (dictionaries of millions of passwords) in milliseconds. Password hashing algorithms like bcrypt and Argon2 are deliberately slow (100ms+ per hash), making brute-force attacks take years instead of seconds. Additionally, raw SHA-256 lacks built-in salting, memory-hardness, and configurable work factors that password hashing algorithms provide.",
    },
    {
      q: "What is the difference between a salt and a pepper in password hashing?",
      a: "A salt is a unique random value per password, stored in the database alongside the hash. Its purpose is uniqueness — ensuring identical passwords produce different hashes, defeating rainbow tables. It is not secret. A pepper is a global secret shared across all passwords, stored separately from the database (env variable, HSM). Its purpose is secrecy — even with the full database stolen, the attacker cannot crack hashes without the pepper. You need both: salt for per-password uniqueness, pepper for an additional secret layer.",
    },
    {
      q: "Why is Argon2 preferred over bcrypt for new applications?",
      a: "Argon2 is memory-hard — it requires significant RAM per hash computation (configurable, e.g., 64MB). GPUs and ASICs have limited per-core memory, so they cannot efficiently parallelize Argon2 attacks the way they can parallelize bcrypt attacks. Argon2 also offers three tunable dimensions (memory, iterations, parallelism) versus bcrypt's single cost factor, allowing more precise security/performance tradeoffs. Argon2 won the Password Hashing Competition in 2015 and is recommended by OWASP. However, bcrypt remains a solid choice with decades of proven security.",
    },
  ],
  mcqs: [
    {
      q: "Why should passwords be hashed rather than encrypted?",
      options: [
        "Hashing is faster than encryption",
        "Hashing is one-way — even if the database is breached, passwords cannot be reversed",
        "Encryption requires more storage space",
        "Hashing produces smaller output",
      ],
      answerIndex: 1,
      explanation:
        "Hashing is a one-way function with no key to recover. Even if the entire database is stolen, the original passwords cannot be derived from the hashes. Encryption is reversible — if the key is compromised, all passwords are exposed.",
    },
    {
      q: "What is the primary purpose of a salt in password hashing?",
      options: [
        "To make the hash algorithm faster",
        "To keep the hash secret from the database administrator",
        "To ensure identical passwords produce different hashes, defeating rainbow tables",
        "To encrypt the password before hashing",
      ],
      answerIndex: 2,
      explanation:
        "Salts are unique random values per password that ensure identical passwords produce different hashes. This prevents precomputed rainbow table attacks and forces attackers to crack each password individually.",
    },
    {
      q: "Which password hashing algorithm is memory-hard and won the Password Hashing Competition?",
      options: ["bcrypt", "PBKDF2", "Argon2", "SHA-256"],
      answerIndex: 2,
      explanation:
        "Argon2 won the Password Hashing Competition in 2015. Its memory-hardness (requiring significant RAM per computation) makes it resistant to GPU and ASIC-based attacks.",
    },
    {
      q: "What is a known limitation of bcrypt?",
      options: [
        "It does not support salting",
        "It has a maximum password length of 72 bytes",
        "It cannot be configured for different work factors",
        "It uses MD5 internally",
      ],
      answerIndex: 1,
      explanation:
        "Bcrypt silently truncates passwords at 72 bytes. Characters beyond this limit are ignored, which can be a security concern for very long passwords or passphrases.",
    },
  ],
  flashcards: [
    {
      front: "What is key stretching?",
      back: "Deliberately making a hash function slow by applying many rounds of computation (bcrypt cost factor, PBKDF2 iterations). This makes brute-force attacks computationally expensive — taking years instead of seconds.",
    },
    {
      front: "What is a rainbow table?",
      back: "A precomputed lookup table mapping hash values back to their plaintext inputs. Salting defeats rainbow tables because each salt requires a completely separate rainbow table, making precomputation infeasible.",
    },
    {
      front: "What makes Argon2 'memory-hard'?",
      back: "Argon2 requires a configurable amount of RAM per hash computation (e.g., 64MB). GPUs have limited per-core memory, so they cannot efficiently parallelize many Argon2 computations simultaneously, unlike CPU-only algorithms like bcrypt.",
    },
    {
      front: "What is the bcrypt output format?",
      back: "$2b$12$salt22chars.hash31chars — includes algorithm version ($2b), cost factor (12 = 2^12 rounds), 22-character salt, and 31-character hash in a single string.",
    },
    {
      front: "How does peppering differ from salting?",
      back: "Salts are unique per password and stored in the database (public, for uniqueness). Peppers are a single secret value for all passwords, stored outside the database (secret, for additional security layer if database is breached).",
    },
    {
      front: "What is the OWASP recommendation for password hashing in 2024?",
      back: "Argon2id with m=19456 (19MB), t=2, p=1 as the primary recommendation. Bcrypt with cost=12 as a well-tested alternative. PBKDF2 with 600,000+ iterations of HMAC-SHA256 if regulatory compliance requires it.",
    },
    {
      front: "Why should you increase the work factor over time?",
      back: "Hardware gets faster each year. A cost factor that takes 250ms today may only take 50ms in five years. Regularly increase the work factor to maintain the same resistance to brute-force. Rehash passwords at login time when they authenticate successfully.",
    },
  ],
  glossary: [
    {
      term: "Bcrypt",
      definition:
        "A password hashing algorithm based on the Blowfish cipher with a configurable cost factor and built-in salting. The most widely deployed password hash algorithm.",
    },
    {
      term: "Argon2",
      definition:
        "The winner of the 2015 Password Hashing Competition, featuring memory-hardness and three variants (Argon2d, Argon2i, Argon2id) for different security/performance tradeoffs.",
    },
    {
      term: "Salt",
      definition:
        "A unique random value generated per password, stored alongside the hash, ensuring identical passwords produce different hashes and defeating precomputed lookup tables.",
    },
    {
      term: "Pepper",
      definition:
        "A secret value stored separately from the database (in application config or HSM), added to passwords before hashing to provide an additional layer of defense if the database is breached.",
    },
    {
      term: "Key Stretching",
      definition:
        "The practice of making a hash function deliberately slow through repeated computation rounds, making brute-force attacks computationally expensive.",
    },
    {
      term: "Rainbow Table",
      definition:
        "A precomputed table mapping hash values to their corresponding plaintexts, used to reverse unsalted hashes. Defeated by salting each password with a unique value.",
    },
    {
      term: "Memory-Hardness",
      definition:
        "A property of hash functions (Argon2, scrypt) that require significant RAM per computation, preventing efficient parallelization on GPUs and ASICs that have limited per-core memory.",
    },
  ],
  deepDive: [
    `**Password hashing** is fundamentally different from **encryption** because it is a *one-way* operation — there is no \`decrypt()\` function. When a user registers, the server computes \`hash(password + salt)\` and stores only the resulting **digest**. During login, the same computation is performed on the *submitted password*, and the result is compared to the **stored hash**. This means the server **never stores** the original password in *any recoverable form*. If the database is breached, attackers obtain hashes that cannot be *reversed* — they can only be attacked by **brute force**, trying candidate passwords one by one through the same \`hash()\` function. The choice of algorithm determines how *expensive* each guess is: \`SHA-256\` allows **billions** of guesses per second, while \`bcrypt\` or \`argon2id\` limit attackers to **single-digit** guesses per second per core.`,

    `The concept of **memory-hardness** in algorithms like \`Argon2\` and \`scrypt\` is a *critical evolution* in password hashing. Traditional CPU-bound algorithms like \`bcrypt\` can be attacked using **GPUs** or **ASICs** (Application-Specific Integrated Circuits) that pack thousands of cores running in *parallel*. Memory-hard functions counter this by requiring each hash computation to consume a **large block of RAM** — for example, \`Argon2id\` configured with \`m=65536\` demands **64 MB** per hash. Since GPUs have *limited per-core memory* (often just a few KB of fast local memory), they cannot run many parallel instances. This makes **custom cracking hardware** economically *impractical*. The \`memory\` parameter, combined with \`iterations\` (t) and \`parallelism\` (p), gives defenders a *three-dimensional* tuning space to balance **security** against server **latency**.`,

    `**Operational best practices** go beyond just choosing the right algorithm. First, always use a **cryptographically secure random number generator** (\`crypto.randomBytes()\` in Node.js, \`CSPRNG\` in .NET) for salt generation — *never* use \`Math.random()\`. Second, implement **pepper rotation** by encrypting the hash output with a *symmetric key* (the pepper) using \`AES-256-GCM\`, so you can re-encrypt stored hashes with a new pepper **without knowing** the original passwords. Third, plan for **work factor upgrades**: store the algorithm and parameters alongside each hash (bcrypt does this *automatically* in its \`$2b$12$...\` format), and **rehash** passwords transparently at login time when a user authenticates with a hash using *outdated* parameters. Finally, enforce **rate limiting** and **account lockout** policies at the application layer — even the strongest hash is *vulnerable* if an attacker can make **unlimited** login attempts against the live service.`,
  ],
  code: [
    {
      language: "C++",
      caption: "Hashing a password with bcrypt using the bcrypt.h library",
      source: `#include <bcrypt/BCrypt.hpp>
#include <iostream>
#include <string>

int main() {
    std::string password = "SuperSecretP@ss!";

    // Generate a hash with work factor 12 (2^12 rounds)
    std::string hash = BCrypt::generateHash(password, 12);
    std::cout << "Bcrypt hash: " << hash << std::endl;

    // Verify a password against a stored hash
    bool valid = BCrypt::validatePassword(password, hash);
    std::cout << "Password valid: " << (valid ? "true" : "false") << std::endl;

    // Wrong password check
    bool invalid = BCrypt::validatePassword("wrongpassword", hash);
    std::cout << "Wrong password valid: " << (invalid ? "true" : "false") << std::endl;

    return 0;
}`,
    },
    {
      language: "Node.js",
      caption: "Hashing and verifying passwords with Argon2 in Node.js",
      source: `const argon2 = require("argon2");

async function hashAndVerify() {
  const password = "SuperSecretP@ss!";

  // Hash with Argon2id (recommended variant)
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,        // 3 iterations
    parallelism: 1,     // 1 thread
  });

  console.log("Argon2id hash:", hash);
  // Output: $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>

  // Verify a password against the stored hash
  const isValid = await argon2.verify(hash, password);
  console.log("Password valid:", isValid); // true

  // Verify with wrong password
  const isInvalid = await argon2.verify(hash, "wrongpassword");
  console.log("Wrong password valid:", isInvalid); // false
}

hashAndVerify().catch(console.error);`,
    },
    {
      language: "Node.js",
      caption: "Implementing pepper rotation with AES-256-GCM encryption over bcrypt hashes",
      source: `const bcrypt = require("bcrypt");
const crypto = require("crypto");

const PEPPER_KEY = crypto.randomBytes(32); // Store in env/HSM, not in code

// Encrypt a bcrypt hash with the pepper key (AES-256-GCM)
function encryptWithPepper(hash, pepperKey) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", pepperKey, iv);
  const encrypted = Buffer.concat([cipher.update(hash, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

// Decrypt a peppered hash
function decryptWithPepper(encryptedHash, pepperKey) {
  const buf = Buffer.from(encryptedHash, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", pepperKey, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}

async function registerUser(password) {
  const hash = await bcrypt.hash(password, 12);
  const pepperedHash = encryptWithPepper(hash, PEPPER_KEY);
  // Store pepperedHash in database
  return pepperedHash;
}

async function verifyUser(password, storedPepperedHash) {
  const hash = decryptWithPepper(storedPepperedHash, PEPPER_KEY);
  return bcrypt.compare(password, hash);
}`,
    },
  ],
  diagrams: [
    {
      title: "Password Hashing and Verification Flow",
      kind: "flow",
      caption: "Shows the registration and login flow with salting, hashing, and optional peppering.",
      mermaid: `flowchart TD
    A["User submits password"] --> B["Generate random salt via CSPRNG"]
    B --> C["Concatenate password + salt + pepper"]
    C --> D["Apply hash algorithm\\n(bcrypt / Argon2id)"]
    D --> E["Store hash + salt + algorithm params\\nin database"]

    F["User attempts login"] --> G["Retrieve stored hash + salt\\nfrom database"]
    G --> H["Hash submitted password\\nwith stored salt + pepper"]
    H --> I{"Hashes match?"}
    I -- Yes --> J["Grant access"]
    I -- No --> K["Reject login"]
    J --> L{"Work factor outdated?"}
    L -- Yes --> M["Rehash with updated params\\nand store new hash"]
    L -- No --> N["Done"]`,
    },
    {
      title: "Password Hashing Algorithm Selection Decision Tree",
      kind: "flow",
      caption: "Decision tree for choosing the right password hashing algorithm based on requirements.",
      mermaid: `flowchart TD
    A["Need to hash passwords"] --> B{"Regulatory compliance\\nrequired? (FIPS/NIST)"}
    B -- Yes --> C["Use PBKDF2\\nHMAC-SHA256\\n600,000+ iterations"]
    B -- No --> D{"Memory-hard\\nresistance needed?"}
    D -- Yes --> E{"Side-channel\\nconcerns?"}
    E -- Yes --> F["Use Argon2id\\nm=64MB, t=3, p=1"]
    E -- No --> G["Use Argon2d\\nfor max GPU resistance"]
    D -- No --> H["Use bcrypt\\ncost factor >= 12"]
    F --> I["Recommended for\\nmost applications"]`,
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "bcrypt",
      "Argon2id",
      "scrypt",
      "PBKDF2",
    ],
    rows: [
      [
        "**Year introduced**",
        "1999",
        "2015",
        "2009",
        "2000",
      ],
      [
        "**Memory-hard**",
        "*No*",
        "*Yes* (configurable)",
        "*Yes* (configurable)",
        "*No*",
      ],
      [
        "**Tunable parameters**",
        "`cost` (1 dimension)",
        "`memory`, `iterations`, `parallelism` (3 dimensions)",
        "`N`, `r`, `p` (3 dimensions)",
        "`iterations` (1 dimension)",
      ],
      [
        "**Max password length**",
        "72 bytes",
        "Unlimited",
        "Unlimited",
        "Unlimited",
      ],
      [
        "**Built-in salt**",
        "*Yes* (128-bit, automatic)",
        "*Yes* (automatic)",
        "*Yes* (automatic)",
        "*No* (manual salt required)",
      ],
      [
        "**GPU/ASIC resistance**",
        "Moderate",
        "**High** (memory-bound)",
        "**High** (memory-bound)",
        "*Low* (easily parallelized)",
      ],
      [
        "**OWASP recommendation**",
        "`cost >= 12`",
        "`m=19456, t=2, p=1`",
        "Not primary recommendation",
        "`600,000+ iterations` (HMAC-SHA256)",
      ],
      [
        "**Best use case**",
        "General purpose, *well-tested*",
        "**New applications** (state-of-the-art)",
        "Cryptocurrency, key derivation",
        "FIPS/NIST compliance required",
      ],
    ],
  },
  exercises: [
    "**Implement a registration and login system** using `Argon2id` in *Node.js*. Store the hash in a database (or a JSON file for simplicity). Verify that identical passwords produce *different* hashes due to unique salts.",
    "**Benchmark hash computation times** across `bcrypt` (cost 10, 12, 14) and `Argon2id` (varying memory from 16MB to 128MB). Plot the results and determine the *optimal* parameters for a target latency of **250ms** on your hardware.",
    "**Build a pepper rotation mechanism**: encrypt bcrypt hashes with `AES-256-GCM` using a pepper key. Write a migration script that *re-encrypts* all stored hashes when the pepper key is rotated, **without** needing the original passwords.",
    "**Crack a set of unsalted SHA-256 hashes** from a practice dataset using a dictionary attack (use a common password list like `rockyou.txt`). Then salt the same passwords and demonstrate that the *rainbow table* approach **fails** against salted hashes.",
    "**Write a middleware** in *Express.js* that automatically **rehashes** passwords at login time when the stored hash uses an *outdated* work factor (e.g., bcrypt cost < 12). Log the upgrade and ensure the user experience is *seamless*.",
  ],
  cheatSheet: [
    "**Algorithm choice**: Use `Argon2id` for new applications; `bcrypt` (cost >= 12) as a proven fallback; `PBKDF2` only when *FIPS compliance* is required.",
    "**Salt**: Always use a **unique, random** salt per password (minimum *128 bits*). `bcrypt` and `Argon2` handle this *automatically* -- never generate salts manually with these algorithms.",
    "**Pepper**: Store a **server-side secret** outside the database (env var, *HSM*, secrets manager). Use `AES-256-GCM` encryption over the hash for easy **pepper rotation**.",
    "**Work factor tuning**: Target **250ms** per hash on your production hardware. *Increase* the work factor annually to keep pace with hardware improvements.",
    "**Never use** `MD5`, `SHA-1`, or `SHA-256` *alone* for password hashing -- they are **too fast** and lack built-in salting and key stretching.",
    "**Rehash on login**: When a user authenticates successfully, check if their hash uses *outdated parameters* and **transparently rehash** with current settings. Store the algorithm version alongside each hash.",
  ],
  revisionNotes: [
    "**Hashing vs. Encryption**: Hashing is *one-way* (no decryption key), encryption is *reversible*. Passwords must always be **hashed**, never encrypted. The server verifies by re-hashing the input and comparing with the stored hash.",
    "**Salt** = *unique random value per password*, stored in the DB (not secret, ensures uniqueness). **Pepper** = *global secret*, stored outside the DB (adds a secret layer). Use **both** for defense in depth.",
    "**Argon2id** is the *state-of-the-art*: memory-hard (`m`), configurable iterations (`t`), and parallelism (`p`). OWASP minimum: `m=19456, t=2, p=1`. **Bcrypt** is the battle-tested alternative: set `cost >= 12` (each increment *doubles* computation time).",
    "**GPU/ASIC resistance** comes from **memory-hardness** -- `Argon2` and `scrypt` require large RAM per hash, limiting parallelism on hardware with *limited per-core memory*. `bcrypt` and `PBKDF2` are CPU-only and more *vulnerable* to GPU attacks.",
    "**Operational essentials**: use `crypto.randomBytes()` or equivalent **CSPRNG** for salts; plan for **work factor upgrades** and **pepper rotation**; enforce *rate limiting* and *account lockout* at the application layer; store algorithm + params alongside each hash for future-proofing.",
  ],
};
