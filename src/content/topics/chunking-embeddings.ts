import type { TopicContent } from "../types";

export const chunkingEmbeddings: TopicContent = {
  quickSummary: [
    "Chunk size is a critical hyperparameter in RAG systems: too small and chunks lack context, too large and they dilute relevance and may exceed embedding model limits.",
    "Chunk overlap duplicates content at boundaries to ensure information spanning two chunks is not lost during retrieval.",
    "Semantic chunking uses embedding similarity to detect topic shifts and create chunks aligned with natural content boundaries.",
    "Embedding model selection impacts retrieval quality significantly -- models differ in dimensionality, maximum input length, language support, and domain specialization.",
  ],
  detailed: [
    `## Chunk Size Selection

Chunk size determines the granularity of retrieval. Common sizes range from 128 to 2048 tokens.

**Small chunks (128-256 tokens)**:
- Higher retrieval precision: each chunk focuses on a single idea
- More chunks to search through, increasing compute
- May lack sufficient context for the LLM to generate a good answer
- Better for precise Q&A over factual content

**Large chunks (1024-2048 tokens)**:
- More context per chunk, reducing the number needed
- Lower retrieval precision: irrelevant content may be included
- Fewer chunks in the index, faster search
- Better for summarization or complex reasoning tasks

**Finding the right size**: start with 512 tokens, evaluate retrieval quality on representative queries, and adjust. The optimal size depends on document type, query type, and the embedding model's maximum input length.

A practical pattern is to retrieve small chunks but expand them with surrounding context before passing to the LLM (parent-child or window expansion).`,

    `## Overlap Strategies

Overlap ensures that content at chunk boundaries appears in both adjacent chunks.

**Fixed overlap**: a set number of tokens (e.g., 50-100) or percentage (10-20%) is repeated between consecutive chunks. Simple to implement.

**Sentence-boundary overlap**: overlap at the nearest sentence boundary to avoid splitting mid-sentence. Produces cleaner chunks.

**No overlap**: some semantic chunking approaches produce non-overlapping chunks by splitting at natural topic boundaries, making overlap unnecessary.

Trade-offs:
- More overlap increases index size and embedding cost but reduces boundary information loss
- Zero overlap risks missing information that spans a boundary
- Excessive overlap creates near-duplicate chunks that waste retrieval slots

A common starting point is 10-15% overlap with sentence-boundary alignment.`,

    `## Semantic Chunking

Semantic chunking detects natural topic boundaries rather than splitting at arbitrary positions.

**Embedding-based approach**:
1. Split the document into sentences
2. Compute embeddings for each sentence (or sliding window of sentences)
3. Calculate similarity between consecutive sentences
4. Split where similarity drops below a threshold (topic boundary)

**LLM-based approach**: use an LLM to identify logical section boundaries. More accurate but expensive for large-scale indexing.

**Document-structure approach**: use headers, sections, paragraphs, and other structural elements as natural boundaries. Works well for well-formatted documents (HTML, markdown, PDFs with clear structure).

Semantic chunking produces variable-size chunks, which complicates batching but improves retrieval quality by keeping related information together.

Libraries like LangChain, LlamaIndex, and Unstructured provide built-in semantic chunking implementations.`,

    `## Embedding Model Selection

The embedding model converts text into vectors for similarity search. Model choice significantly impacts retrieval quality.

**Key factors**:
- **Dimensionality**: ranges from 384 to 4096. Higher dimensions capture more nuance but increase storage and search cost.
- **Max input length**: typically 512 to 8192 tokens. Must be at least as large as your chunk size.
- **Language support**: multilingual models (e5-multilingual, multilingual-e5-large) handle cross-language retrieval.
- **Domain specialization**: some models are fine-tuned for specific domains (code, medical, legal).
- **Benchmark performance**: MTEB (Massive Text Embedding Benchmark) provides standardized comparisons.

Popular models:
- **OpenAI text-embedding-3-small/large**: strong general-purpose, variable dimensionality
- **Cohere Embed v3**: supports multiple input types (search query vs document)
- **BGE, E5, GTE**: strong open-source options
- **Nomic Embed**: long-context (8192 tokens) open-source model

Always use the same embedding model for indexing and querying. Mismatched models produce incompatible vector spaces.`,

    `## Advanced Patterns

**Multi-vector retrieval**: embed a document chunk multiple times with different representations (summary, questions it answers, raw text). Retrieve across all representations for better recall.

**Late interaction models** (ColBERT): store per-token embeddings rather than a single vector per chunk. Enables more fine-grained matching at the cost of larger index size.

**Hypothetical question generation**: for each chunk, generate questions the chunk answers and embed those questions. Query-to-question matching can outperform query-to-passage matching.

**Parent-child retrieval**: embed small chunks for precise retrieval but return their parent (larger context) to the LLM. Combines retrieval precision with generation context.

**Metadata enrichment**: add title, section name, document source, date, and other metadata to chunks. Use metadata filters to narrow search before vector similarity.

**Evaluation**: measure retrieval quality independently from generation. Key metrics are recall@K, precision@K, and MRR. Use a test set of query-relevant document pairs.`,
  ],
  interviewQA: [
    {
      q: "How do you decide on chunk size for a RAG system?",
      a: "Start with 512 tokens as a baseline. Evaluate on representative queries using retrieval metrics (recall@K, MRR). Smaller chunks (128-256) work better for precise factual Q&A. Larger chunks (1024+) work better for summarization or reasoning tasks that need more context. Also consider the embedding model's max input length and the LLM's context window. A practical pattern is parent-child retrieval: embed small chunks for precision but return surrounding context to the LLM.",
    },
    {
      q: "When would you choose semantic chunking over fixed-size chunking?",
      a: "Semantic chunking is preferred when documents have clear topical structure that fixed-size splitting would break, when chunk quality matters more than indexing speed, and when the document format does not provide reliable structural boundaries. Fixed-size chunking is simpler, faster, and sufficient when documents are homogeneous or when the embedding model and overlap handle boundary issues well enough. Start with fixed-size and upgrade to semantic if retrieval quality is insufficient.",
    },
    {
      q: "Why must you use the same embedding model for indexing and querying?",
      a: "Different embedding models map text to different vector spaces with different dimensions, scales, and semantic relationships. A vector from model A and a vector from model B are not comparable -- cosine similarity between them is meaningless. Even models with the same dimensionality encode different semantic relationships. Always use the identical model and version for both indexing and querying.",
    },
    {
      q: "What is parent-child retrieval and why is it useful?",
      a: "Parent-child retrieval embeds small child chunks (e.g., 128 tokens) for precise similarity search but returns the larger parent chunk (e.g., 1024 tokens) to the LLM. This combines the retrieval precision of small chunks with the contextual richness of larger chunks. It avoids the trade-off of choosing a single chunk size that compromises on either precision or context.",
    },
  ],
  mcqs: [
    {
      q: "What is the main risk of using very small chunks (e.g., 64 tokens)?",
      options: [
        "They are too expensive to embed",
        "They lack sufficient context for the LLM to generate useful answers",
        "They cannot be stored in a vector database",
        "They always produce duplicate results",
      ],
      answerIndex: 1,
      explanation:
        "Very small chunks may contain only a fragment of an idea, forcing the LLM to reason with insufficient context, potentially leading to incomplete or incorrect answers.",
    },
    {
      q: "What does semantic chunking use to detect topic boundaries?",
      options: [
        "Fixed token counts",
        "Random sampling",
        "Embedding similarity drops between consecutive text segments",
        "File size thresholds",
      ],
      answerIndex: 2,
      explanation:
        "Semantic chunking computes embeddings for consecutive segments and splits where similarity drops significantly, indicating a topic shift.",
    },
    {
      q: "Why is MTEB relevant when choosing an embedding model?",
      options: [
        "It provides a training framework for embedding models",
        "It is a standardized benchmark for comparing embedding model performance across tasks",
        "It is a vector database implementation",
        "It provides free embedding API access",
      ],
      answerIndex: 1,
      explanation:
        "MTEB (Massive Text Embedding Benchmark) evaluates embedding models across diverse tasks (retrieval, classification, clustering), enabling standardized comparison.",
    },
    {
      q: "What is the benefit of parent-child retrieval?",
      options: [
        "It eliminates the need for an embedding model",
        "It combines precise retrieval from small chunks with rich context from larger parent chunks",
        "It reduces the total number of documents indexed",
        "It removes the need for chunk overlap",
      ],
      answerIndex: 1,
      explanation:
        "Small child chunks enable precise similarity matching, while returning the larger parent chunk ensures the LLM has enough surrounding context to generate a well-informed response.",
    },
  ],
  flashcards: [
    {
      front: "What is a typical starting chunk size for RAG?",
      back: "512 tokens, then tune based on retrieval quality evaluation on representative queries.",
    },
    {
      front: "What does chunk overlap prevent?",
      back: "Information loss at chunk boundaries, where important content might span two adjacent chunks.",
    },
    {
      front: "What is semantic chunking?",
      back: "Splitting documents at natural topic boundaries detected via embedding similarity drops between consecutive segments.",
    },
    {
      front: "What is MTEB?",
      back: "Massive Text Embedding Benchmark -- a standardized benchmark for comparing embedding models across retrieval, classification, and clustering tasks.",
    },
    {
      front: "What is parent-child retrieval?",
      back: "Embedding small child chunks for precise search but returning the larger parent chunk to the LLM for richer context.",
    },
    {
      front: "Why not use different embedding models for indexing and querying?",
      back: "Different models produce incompatible vector spaces. Similarity scores between vectors from different models are meaningless.",
    },
    {
      front: "What is multi-vector retrieval?",
      back: "Embedding each chunk with multiple representations (raw text, summary, generated questions) and searching across all of them.",
    },
  ],
  glossary: [
    {
      term: "Chunk Size",
      definition: "The number of tokens or characters in each text segment created during document splitting for RAG indexing.",
    },
    {
      term: "Chunk Overlap",
      definition: "The portion of content duplicated between adjacent chunks to prevent information loss at boundaries.",
    },
    {
      term: "Semantic Chunking",
      definition: "Splitting documents at natural topic boundaries detected through embedding similarity analysis.",
    },
    {
      term: "MTEB",
      definition: "Massive Text Embedding Benchmark, a standardized evaluation suite for comparing embedding model performance.",
    },
    {
      term: "Parent-Child Retrieval",
      definition: "A strategy that retrieves small precise chunks but returns their larger parent context to the LLM.",
    },
    {
      term: "ColBERT",
      definition: "A late-interaction retrieval model that stores per-token embeddings for fine-grained matching.",
    },
    {
      term: "Multi-Vector Retrieval",
      definition: "Representing each document with multiple embedding vectors from different perspectives for improved recall.",
    },
  ],

  deepDive: [
    `## Why Chunking Strategy Is the Most Impactful Decision in RAG

Chunking is often treated as a *preprocessing detail*, but it is arguably the **single most impactful architectural decision** in a RAG pipeline. The relationship between **chunk granularity**, **retrieval precision**, and **generation quality** forms a tightly coupled triangle: changing one vertex shifts the others. When chunks are too *coarse*, the retrieval step returns passages bloated with irrelevant context, and the LLM must sift through noise to find the answer — leading to **hallucinations**, hedging, or outright wrong answers. When chunks are too *fine*, each fragment lacks the surrounding context the LLM needs to reason, causing **incomplete or misleading generations** even when the *correct* chunk is retrieved.

The practical consequence is that **no single chunk size is optimal** across all query types within the same corpus. A factual lookup ("What is the default port for PostgreSQL?") benefits from a tight 128-token chunk that contains exactly one fact. A reasoning query ("Compare the isolation levels in PostgreSQL and MySQL") needs 512–1024 tokens of structured explanation. This is why production systems increasingly adopt **hybrid strategies**: small chunks for retrieval precision paired with context expansion (parent-child, sliding window) for generation quality. Treating chunk size as a fixed hyperparameter rather than a *retrieval-generation trade-off* is one of the most common mistakes in RAG system design.`,

    `## The Mechanics of Semantic Chunking

Semantic chunking replaces arbitrary token-count splitting with **embedding-similarity-driven boundary detection**. The core algorithm works as follows: first, the document is split into *atomic units* — typically sentences, using a sentence tokenizer like \`nltk.sent_tokenize\` or \`spaCy\`. Next, each sentence (or a *sliding window* of 2–3 sentences for stability) is embedded using a sentence-transformer model such as \`all-MiniLM-L6-v2\`. The algorithm then computes the **cosine similarity** between consecutive sentence embeddings. A significant *drop* in similarity — below a chosen **threshold** — signals a **topic boundary**, and the document is split at that point.

**Threshold selection** is the critical tuning parameter. A *percentile-based* approach (e.g., split at points where similarity falls below the 25th percentile of all consecutive similarities) adapts to document-specific similarity distributions and is more robust than a fixed threshold like \`0.75\`. However, semantic chunking has important **edge cases**. *Tables* and *code blocks* produce erratic sentence-level embeddings because their structure is not natural prose — these should be detected and kept as **atomic chunks** using format-aware preprocessing. Similarly, *enumerated lists* often show low inter-item similarity despite being logically related; a **look-ahead buffer** that requires *N consecutive* low-similarity scores before splitting helps avoid fragmenting lists. Libraries like \`langchain.text_splitter.SemanticChunker\` and \`llama_index.node_parser.SemanticSplitterNodeParser\` implement these patterns with configurable breakpoint thresholds.`,

    `## Advanced Retrieval: Beyond Single-Vector Search

Single-vector retrieval — one embedding per chunk, one embedding per query, cosine similarity — is the baseline, but it has well-documented limitations. **Multi-vector representations** address the *representation bottleneck*: instead of compressing an entire chunk into a single vector, the system generates *multiple* embeddings per chunk — the raw text embedding, an embedding of a *generated summary*, and embeddings of *hypothetical questions* the chunk answers. At query time, the system searches across all representations, dramatically improving **recall** for queries phrased differently from the source text.

**Hypothetical Document Embeddings (HyDE)** flip the retrieval problem: instead of embedding the *query* and matching against *documents*, the system uses an LLM to generate a *hypothetical answer* to the query, embeds *that*, and searches for real documents similar to the hypothetical answer. This works because \`document-to-document\` similarity is often stronger than \`query-to-document\` similarity — queries are short and ambiguous, while documents and hypothetical answers share structural and lexical patterns. The trade-off is **latency**: HyDE requires an LLM call before retrieval.

**Late interaction models** like **ColBERT** take a fundamentally different approach. Instead of a single vector per chunk, ColBERT stores **per-token embeddings** for both queries and documents. At retrieval time, it computes a *MaxSim* operation — for each query token, find the maximum similarity to any document token, then sum across query tokens. This preserves **fine-grained lexical matching** while still operating in embedding space, achieving retrieval quality that often exceeds single-vector models by **5–15% on recall@10**. The cost is a significantly larger index (one vector per token rather than per chunk), making it best suited for high-value corpora where retrieval quality justifies the storage overhead.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Fixed-size chunking with overlap using a **RecursiveCharacterTextSplitter** in C++",
      source: `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <numeric>

// --- Recursive character text splitter ---
// Tries separators in priority order:
// "\\n\\n" (paragraphs) -> "\\n" (lines) -> ". " (sentences) -> " " (words) -> "" (chars)

struct RecursiveCharacterTextSplitter {
    int chunk_size;
    int chunk_overlap;
    std::vector<std::string> separators;

    RecursiveCharacterTextSplitter(
        int chunk_size = 512,
        int chunk_overlap = 64,
        std::vector<std::string> separators = {"\\n\\n", "\\n", ". ", " ", ""}
    ) : chunk_size(chunk_size),
        chunk_overlap(chunk_overlap),
        separators(std::move(separators)) {}

    // Split text on the first applicable separator, then recurse
    std::vector<std::string> split_text(const std::string& text, int sep_idx = 0) const {
        if ((int)text.size() <= chunk_size || sep_idx >= (int)separators.size()) {
            return {text};
        }
        const auto& sep = separators[sep_idx];
        std::vector<std::string> parts;

        if (sep.empty()) {
            // Character-level split as last resort
            for (int i = 0; i < (int)text.size(); i += chunk_size - chunk_overlap) {
                parts.push_back(text.substr(i, chunk_size));
            }
            return parts;
        }

        // Split on current separator
        std::vector<std::string> segments;
        size_t pos = 0;
        while (pos < text.size()) {
            size_t found = text.find(sep, pos);
            if (found == std::string::npos) {
                segments.push_back(text.substr(pos));
                break;
            }
            segments.push_back(text.substr(pos, found - pos + sep.size()));
            pos = found + sep.size();
        }

        // Merge segments into chunks respecting chunk_size
        std::string current;
        for (const auto& seg : segments) {
            if ((int)(current.size() + seg.size()) > chunk_size && !current.empty()) {
                parts.push_back(current);
                // Apply overlap: keep tail of current chunk
                if (chunk_overlap > 0 && (int)current.size() > chunk_overlap) {
                    current = current.substr(current.size() - chunk_overlap);
                } else {
                    current.clear();
                }
            }
            current += seg;
        }
        if (!current.empty()) parts.push_back(current);

        // Recurse on chunks that are still too large, using next separator
        std::vector<std::string> result;
        for (const auto& chunk : parts) {
            if ((int)chunk.size() > chunk_size) {
                auto sub = split_text(chunk, sep_idx + 1);
                result.insert(result.end(), sub.begin(), sub.end());
            } else {
                result.push_back(chunk);
            }
        }
        return result;
    }
};

int main() {
    // Read document
    std::ifstream file("knowledge_base.txt");
    std::stringstream buf;
    buf << file.rdbuf();
    std::string document_text = buf.str();

    RecursiveCharacterTextSplitter splitter(512, 64);
    auto chunks = splitter.split_text(document_text);

    std::cout << "Created " << chunks.size() << " chunks\\n";
    double avg = 0;
    for (const auto& c : chunks) avg += c.size();
    avg /= chunks.size();
    std::cout << "Avg chunk length: " << (int)avg << " chars\\n";

    // Smaller chunk size example (analogous to token-based splitting)
    RecursiveCharacterTextSplitter small_splitter(256, 32);
    auto small_chunks = small_splitter.split_text(document_text);
    std::cout << "Small-chunk split: " << small_chunks.size() << " chunks\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Semantic chunking using sentence embeddings and *cosine similarity* thresholds in C++",
      source: `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
#include <numeric>

// --- Sentence splitting (simplified: split on ". ", "! ", "? ") ---
std::vector<std::string> split_sentences(const std::string& text) {
    std::vector<std::string> sentences;
    size_t start = 0;
    for (size_t i = 0; i < text.size(); ++i) {
        if ((text[i] == '.' || text[i] == '!' || text[i] == '?')
            && i + 1 < text.size() && text[i + 1] == ' ') {
            sentences.push_back(text.substr(start, i - start + 1));
            start = i + 2;
        }
    }
    if (start < text.size()) {
        sentences.push_back(text.substr(start));
    }
    return sentences;
}

// --- Cosine similarity between two vectors ---
double cosine_similarity(const std::vector<double>& a, const std::vector<double>& b) {
    double dot = 0.0, norm_a = 0.0, norm_b = 0.0;
    for (size_t i = 0; i < a.size(); ++i) {
        dot    += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }
    return dot / (std::sqrt(norm_a) * std::sqrt(norm_b) + 1e-9);
}

// --- Placeholder: embed a sentence into a vector ---
// In production, call an embedding model (e.g., ONNX Runtime with a sentence-transformer).
std::vector<double> embed_sentence(const std::string& sentence, int dim = 384) {
    std::vector<double> vec(dim, 0.0);
    for (size_t i = 0; i < sentence.size(); ++i) {
        vec[i % dim] += static_cast<double>(sentence[i]) / 128.0;
    }
    // Normalize
    double norm = 0.0;
    for (double v : vec) norm += v * v;
    norm = std::sqrt(norm) + 1e-9;
    for (double& v : vec) v /= norm;
    return vec;
}

// --- Semantic chunking algorithm ---
// Split text at topic boundaries detected via embedding similarity drops.
//
// percentile_threshold: percentile below which similarity triggers a boundary.
// min_chunk_size: minimum number of sentences per chunk.
std::vector<std::string> semantic_chunk(
    const std::string& text,
    int percentile_threshold = 25,
    int min_chunk_size = 2
) {
    // Step 1: Split into sentences
    auto sentences = split_sentences(text);
    if ((int)sentences.size() <= min_chunk_size) {
        return {text};
    }

    // Step 2: Embed each sentence
    std::vector<std::vector<double>> embeddings;
    embeddings.reserve(sentences.size());
    for (const auto& s : sentences) {
        embeddings.push_back(embed_sentence(s));
    }

    // Step 3: Compute cosine similarity between consecutive sentences
    std::vector<double> similarities;
    for (size_t i = 0; i + 1 < embeddings.size(); ++i) {
        similarities.push_back(cosine_similarity(embeddings[i], embeddings[i + 1]));
    }

    // Step 4: Determine split threshold using percentile
    std::vector<double> sorted_sims = similarities;
    std::sort(sorted_sims.begin(), sorted_sims.end());
    int pct_idx = (int)(percentile_threshold / 100.0 * sorted_sims.size());
    pct_idx = std::min(pct_idx, (int)sorted_sims.size() - 1);
    double threshold = sorted_sims[pct_idx];

    // Step 5: Identify boundary indices (where similarity drops below threshold)
    std::vector<int> boundaries = {0};  // start of first chunk
    for (int i = 0; i < (int)similarities.size(); ++i) {
        if (similarities[i] < threshold
            && (i + 1 - boundaries.back()) >= min_chunk_size) {
            boundaries.push_back(i + 1);
        }
    }
    boundaries.push_back((int)sentences.size());  // end of last chunk

    // Step 6: Build chunks from boundary indices
    std::vector<std::string> chunks;
    for (size_t b = 0; b + 1 < boundaries.size(); ++b) {
        std::string chunk;
        for (int j = boundaries[b]; j < boundaries[b + 1]; ++j) {
            if (!chunk.empty()) chunk += " ";
            chunk += sentences[j];
        }
        chunks.push_back(chunk);
    }
    return chunks;
}

int main() {
    std::ifstream file("article.txt");
    std::stringstream buf;
    buf << file.rdbuf();
    std::string document = buf.str();

    auto chunks = semantic_chunk(document, 25);

    for (size_t i = 0; i < chunks.size(); ++i) {
        // Count words
        std::istringstream iss(chunks[i]);
        int word_count = std::distance(
            std::istream_iterator<std::string>(iss),
            std::istream_iterator<std::string>());
        std::cout << "--- Chunk " << (i + 1) << " (" << word_count << " words) ---\\n";
        if (chunks[i].size() > 200) {
            std::cout << chunks[i].substr(0, 200) << "...\\n";
        } else {
            std::cout << chunks[i] << "\\n";
        }
        std::cout << "\\n";
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Parent-child retrieval setup with **metadata linking** for precise search + rich context in C++",
      source: `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <cmath>
#include <numeric>
#include <random>

// --- Data structures ---
struct ParentChunk {
    std::string id;
    std::string text;
    std::string source;
};

struct ChildChunk {
    std::string id;
    std::string text;
    std::string parent_id;  // link to parent
    std::string source;
};

struct RetrievalResult {
    std::string parent_text;
    std::string matched_child;
    double score;
    std::string source;
};

// --- Simple UUID generator ---
std::string generate_uuid() {
    static std::mt19937 rng(std::random_device{}());
    static std::uniform_int_distribution<int> dist(0, 15);
    const char* hex = "0123456789abcdef";
    std::string uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    for (char& c : uuid) {
        if (c == 'x') c = hex[dist(rng)];
        else if (c == 'y') c = hex[(dist(rng) & 0x3) | 0x8];
    }
    return uuid;
}

// --- Fixed-size splitter (simplified recursive character text splitter) ---
std::vector<std::string> split_fixed(const std::string& text, int chunk_size, int overlap = 0) {
    std::vector<std::string> chunks;
    if (text.empty()) return chunks;
    int step = std::max(1, chunk_size - overlap);
    for (int i = 0; i < (int)text.size(); i += step) {
        chunks.push_back(text.substr(i, chunk_size));
        if (i + chunk_size >= (int)text.size()) break;
    }
    return chunks;
}

// --- Cosine similarity ---
double cosine_similarity(const std::vector<double>& a, const std::vector<double>& b) {
    double dot = 0.0, na = 0.0, nb = 0.0;
    for (size_t i = 0; i < a.size(); ++i) {
        dot += a[i] * b[i];
        na  += a[i] * a[i];
        nb  += b[i] * b[i];
    }
    return dot / (std::sqrt(na) * std::sqrt(nb) + 1e-9);
}

// --- Placeholder embedding function ---
// In production, use an embedding model via ONNX Runtime or a remote API.
std::vector<double> embed(const std::string& text, int dim = 384) {
    std::vector<double> vec(dim, 0.0);
    for (size_t i = 0; i < text.size(); ++i) {
        vec[i % dim] += static_cast<double>(text[i]) / 128.0;
    }
    double norm = 0.0;
    for (double v : vec) norm += v * v;
    norm = std::sqrt(norm) + 1e-9;
    for (double& v : vec) v /= norm;
    return vec;
}

// --- Build parent-child index ---
// Parent chunks: large, stored in a docstore (not embedded).
// Child chunks: small, embedded for retrieval, linked to parents via metadata.
struct Document {
    std::string text;
    std::string source;
};

std::pair<std::vector<ParentChunk>, std::vector<ChildChunk>>
build_parent_child_index(
    const std::vector<Document>& documents,
    int parent_chunk_size = 1024,
    int child_chunk_size = 256,
    int child_overlap = 32
) {
    std::vector<ParentChunk> parent_store;
    std::vector<ChildChunk> child_index;

    for (const auto& doc : documents) {
        auto parent_texts = split_fixed(doc.text, parent_chunk_size, 0);

        for (const auto& parent_text : parent_texts) {
            std::string parent_id = generate_uuid();

            // Store parent in docstore
            parent_store.push_back({parent_id, parent_text, doc.source});

            // Split parent into children and link via metadata
            auto child_texts = split_fixed(parent_text, child_chunk_size, child_overlap);
            for (const auto& child_text : child_texts) {
                child_index.push_back({
                    generate_uuid(),
                    child_text,
                    parent_id,    // link to parent
                    doc.source
                });
            }
        }
    }
    return {parent_store, child_index};
}

// --- Retrieve child chunks by similarity, then return parent context ---
std::vector<RetrievalResult> retrieve_with_parent_context(
    const std::string& query,
    const std::vector<ChildChunk>& child_index,
    const std::vector<ParentChunk>& parent_store,
    int top_k = 3
) {
    // Embed query
    auto query_emb = embed(query);

    // Compute similarity scores for all children
    std::vector<std::pair<double, int>> scored;
    for (int i = 0; i < (int)child_index.size(); ++i) {
        auto child_emb = embed(child_index[i].text);
        double score = cosine_similarity(query_emb, child_emb);
        scored.push_back({score, i});
    }

    // Sort descending by score, take top_k
    std::sort(scored.begin(), scored.end(),
              [](const auto& a, const auto& b) { return a.first > b.first; });

    // Build parent lookup
    std::unordered_map<std::string, const ParentChunk*> parent_lookup;
    for (const auto& p : parent_store) {
        parent_lookup[p.id] = &p;
    }

    // Map children -> unique parents
    std::unordered_set<std::string> seen_parents;
    std::vector<RetrievalResult> results;

    for (int k = 0; k < (int)scored.size() && (int)results.size() < top_k; ++k) {
        int idx = scored[k].second;
        const auto& child = child_index[idx];
        if (seen_parents.count(child.parent_id)) continue;

        seen_parents.insert(child.parent_id);
        const auto* parent = parent_lookup.at(child.parent_id);
        results.push_back({
            parent->text,
            child.text,
            scored[k].first,
            parent->source
        });
    }
    return results;
}

// --- Usage ---
int main() {
    auto read_file = [](const std::string& path) {
        std::ifstream f(path);
        std::stringstream buf;
        buf << f.rdbuf();
        return buf.str();
    };

    std::vector<Document> docs = {
        {read_file("doc1.txt"), "doc1.txt"},
        {read_file("doc2.txt"), "doc2.txt"},
    };

    auto [parents, children] = build_parent_child_index(docs);
    std::cout << "Parents: " << parents.size()
              << ", Children: " << children.size() << "\\n";

    auto results = retrieve_with_parent_context(
        "How does semantic chunking detect topic boundaries?",
        children, parents
    );

    for (const auto& r : results) {
        std::cout << "Score: " << r.score << " | Source: " << r.source << "\\n";
        std::cout << "Matched child: " << r.matched_child.substr(0, 100) << "...\\n";
        std::cout << "Parent context: " << r.parent_text.substr(0, 200) << "...\\n\\n";
    }
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "RAG Chunking Pipeline",
      kind: "flow",
      caption: "End-to-end flow from raw document to retrieved chunks for LLM generation",
      mermaid: `flowchart LR
    A["📄 Raw Document"] --> B["🔪 Chunking"]
    B --> C["🧮 Embedding"]
    C --> D["🗄️ Vector Store"]
    E["❓ User Query"] --> F["🧮 Query Embedding"]
    F --> G["🔍 Similarity Search"]
    D --> G
    G --> H["📋 Top-K Chunks"]
    H --> I["🤖 LLM Generation"]
    E --> I
    I --> J["💬 Answer"]

    subgraph Indexing Pipeline
        A
        B
        C
        D
    end

    subgraph Retrieval Pipeline
        E
        F
        G
        H
        I
        J
    end`,
    },
    {
      title: "Parent-Child Retrieval Architecture",
      kind: "architecture",
      caption: "Small child chunks are embedded for precise retrieval; matched children map back to larger parent chunks sent to the LLM",
      mermaid: `flowchart TB
    DOC["📄 Source Document"] --> PS["Parent Splitter<br/>(1024 tokens)"]
    PS --> P1["Parent Chunk 1"]
    PS --> P2["Parent Chunk 2"]
    PS --> P3["Parent Chunk N"]

    P1 --> CS1["Child Splitter<br/>(256 tokens)"]
    P2 --> CS2["Child Splitter<br/>(256 tokens)"]

    CS1 --> C1A["Child 1a"]
    CS1 --> C1B["Child 1b"]
    CS1 --> C1C["Child 1c"]
    CS2 --> C2A["Child 2a"]
    CS2 --> C2B["Child 2b"]

    C1A --> EMB["Embedding Model"]
    C1B --> EMB
    C1C --> EMB
    C2A --> EMB
    C2B --> EMB
    EMB --> VS["Vector Store<br/>(child embeddings + parent_id)"]

    P1 --> DS["Document Store<br/>(parent chunks by ID)"]
    P2 --> DS
    P3 --> DS

    Q["User Query"] --> QE["Query Embedding"]
    QE --> VS
    VS -->|"top-K child matches"| LOOKUP["Parent ID Lookup"]
    LOOKUP --> DS
    DS -->|"full parent context"| LLM["LLM Generation"]
    Q --> LLM`,
    },
  ],

  comparison: {
    columns: ["Strategy", "Chunk Quality", "Speed", "Complexity", "Best For"],
    rows: [
      [
        "**Fixed-Size**",
        "Low — splits at arbitrary positions, may break mid-sentence or mid-concept",
        "Very Fast — simple character/token counting",
        "Minimal — no dependencies beyond a tokenizer",
        "Prototyping, homogeneous corpora, baseline benchmarks",
      ],
      [
        "**Fixed with Overlap**",
        "Medium — boundary content preserved via overlap, but splits still arbitrary",
        "Very Fast — same as fixed-size with minor overhead",
        "Low — one extra parameter (`overlap`)",
        "General-purpose RAG when simplicity is preferred over precision",
      ],
      [
        "**Sentence-Based**",
        "Medium-High — respects sentence boundaries, no mid-sentence breaks",
        "Fast — sentence tokenization is lightweight",
        "Low — requires a sentence tokenizer (`nltk`, `spaCy`)",
        "Documents with well-formed prose, news articles, documentation",
      ],
      [
        "**Semantic**",
        "High — chunks align with topic boundaries, preserves conceptual coherence",
        "Slow — requires embedding every sentence and computing similarities",
        "High — needs an embedding model, threshold tuning, edge-case handling",
        "Knowledge bases, technical docs, multi-topic documents",
      ],
      [
        "**Document-Structure**",
        "High — leverages author-defined sections, headers, and formatting",
        "Fast — parsing structure is lightweight",
        "Medium — requires format-aware parsers (HTML, Markdown, PDF)",
        "Well-structured documents: wikis, API docs, legal/medical texts",
      ],
    ],
  },

  exercises: [
    "**Chunk Size Experiment**: Take a 10-page technical document and chunk it at 128, 256, 512, and 1024 tokens using `RecursiveCharacterTextSplitter`. Write 5 test queries, retrieve top-3 chunks for each, and *manually score* retrieval relevance at each size. Plot a chart of chunk size vs. average relevance score.",
    "**Semantic vs. Fixed Chunking**: Implement both *fixed-size* (512 tokens, 64-token overlap) and *semantic chunking* (percentile threshold = 25) on the same document. Compare the resulting chunks: count how many fixed-size chunks split a paragraph mid-thought vs. how many semantic chunks preserve full paragraphs. Measure retrieval `recall@5` on 10 test queries.",
    "**Parent-Child Retrieval Pipeline**: Build a complete parent-child retrieval system: parent chunks of 1024 tokens, child chunks of 256 tokens. Use `ChromaDB` or `FAISS` for the vector store and a simple `dict` for the parent docstore. Test with queries that require *context beyond* the child chunk to answer correctly — verify the parent provides sufficient context.",
    "**Embedding Model Comparison**: Embed the same set of 100 chunks with three different models (`all-MiniLM-L6-v2`, `bge-base-en-v1.5`, `text-embedding-3-small`). For 20 test queries, compute `recall@5` and `MRR` with each model. Analyze: which model wins overall? Are there query types where a smaller model outperforms a larger one?",
    "**HyDE Implementation**: Implement a *Hypothetical Document Embedding* pipeline: given a user query, use an LLM to generate a hypothetical answer (1-2 paragraphs), embed the hypothetical answer, and retrieve real chunks similar to it. Compare retrieval quality (`recall@10`) against standard query embedding on 15 test queries. Measure the latency overhead of the additional LLM call.",
  ],

  cheatSheet: [
    "**Start with 512 tokens, 10% overlap** — this is the most robust default. Tune chunk size based on retrieval evaluation, *not* intuition.",
    "**Always match embedding models** — use the *exact same model and version* for indexing and querying. Mismatched models produce incompatible vector spaces and *silent* retrieval failures.",
    "**Sentence-boundary alignment** — use `RecursiveCharacterTextSplitter` with separators `[\"\\n\\n\", \"\\n\", \". \", \" \"]` to avoid mid-sentence splits. Never split inside code blocks or tables.",
    "**Parent-child for precision + context** — embed *small* chunks (128–256 tokens) for retrieval but return the *parent* chunk (512–1024 tokens) to the LLM. This sidesteps the chunk-size trade-off entirely.",
    "**Semantic chunking threshold** — use a *percentile-based* threshold (e.g., 25th percentile of consecutive similarities) rather than a fixed cosine value. Percentile adapts to document-specific similarity distributions.",
    "**Evaluate retrieval independently** — measure `recall@K`, `precision@K`, and `MRR` on a test set of *(query, relevant_chunk)* pairs *before* evaluating end-to-end generation quality. Bad retrieval cannot be fixed by a better LLM.",
  ],

  revisionNotes: [
    "Chunk size is a **retrieval-generation trade-off**, not a fixed hyperparameter. Small chunks improve *retrieval precision* but reduce *generation context*. Large chunks do the opposite. **Parent-child retrieval** resolves this by decoupling the two concerns.",
    "**Semantic chunking** detects topic boundaries by computing embedding similarity between consecutive sentences and splitting where similarity drops below a *percentile-based threshold*. It produces higher-quality chunks than fixed-size splitting but requires an embedding model and careful handling of tables, code blocks, and lists.",
    "**Multi-vector retrieval** (raw text + summary + generated questions) and **HyDE** (embed a hypothetical answer instead of the query) both address the *vocabulary mismatch* problem where queries and relevant documents use different words. They improve recall at the cost of additional compute.",
    "**ColBERT** and other *late interaction* models store per-token embeddings and compute fine-grained *MaxSim* scores at retrieval time. They achieve 5–15% higher recall than single-vector models but require significantly more storage.",
    "**Evaluation is non-negotiable**: always measure retrieval quality (`recall@K`, `MRR`) on a representative test set independently from generation quality. A RAG system with poor retrieval cannot be saved by prompt engineering or a more capable LLM.",
  ],
};
