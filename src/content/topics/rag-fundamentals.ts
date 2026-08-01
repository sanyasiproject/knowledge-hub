import type { TopicContent } from "../types";

export const ragFundamentals: TopicContent = {
  quickSummary: [
    "Retrieval-Augmented Generation (RAG) enhances LLM responses by retrieving relevant documents from an external knowledge base and including them in the prompt context.",
    "Vector stores index document embeddings for fast similarity search, enabling retrieval of the most relevant passages for a given query.",
    "Chunking splits documents into smaller pieces that fit within embedding model limits and retrieval windows, balancing context preservation with granularity.",
    "Relevance scoring determines which retrieved documents are most useful, using techniques like cosine similarity, reranking, and hybrid search.",
  ],
  detailed: [
    `## The RAG Pipeline

RAG follows a retrieve-then-generate pattern:

1. **Indexing** (offline): documents are chunked, embedded into vectors, and stored in a vector database
2. **Retrieval** (at query time): the user query is embedded, and the most similar document chunks are retrieved via vector similarity search
3. **Augmentation**: retrieved chunks are inserted into the LLM prompt as context
4. **Generation**: the LLM generates a response grounded in the retrieved context

RAG solves key LLM limitations:
- **Knowledge cutoff**: the knowledge base can be updated without retraining
- **Hallucination reduction**: the model can cite specific sources
- **Domain specificity**: enterprise or proprietary data is accessible without fine-tuning
- **Transparency**: retrieved sources can be shown to users for verification`,

    `## Vector Stores and Indexing

A vector store (vector database) indexes document embeddings for efficient similarity search. Popular options include Pinecone, Weaviate, Chroma, Qdrant, pgvector, and FAISS.

Key concepts:
- **Embedding**: each document chunk is converted to a dense vector using an embedding model
- **Index type**: approximate nearest neighbor (ANN) algorithms like HNSW or IVF enable fast search at scale
- **Metadata filtering**: most vector stores support filtering by metadata (date, source, category) alongside similarity search
- **Hybrid search**: combining vector similarity with keyword search (BM25) for better recall

Indexing considerations:
- Choose an embedding model that matches your domain and language
- Store metadata alongside vectors for filtering and attribution
- Plan for index updates as documents are added, modified, or deleted
- Monitor index size and query latency as the collection grows`,

    `## Chunking Strategies

Documents must be split into chunks that are small enough to embed and retrieve but large enough to contain meaningful context.

**Fixed-size chunking**: split by character or token count (e.g., 512 tokens) with overlap (e.g., 50 tokens). Simple and predictable.

**Recursive chunking**: split by structural boundaries (paragraphs, sections, sentences) with fallback to character count. Respects document structure.

**Semantic chunking**: use embedding similarity to detect topic boundaries and split where the content shifts. More intelligent but slower.

**Document-aware chunking**: leverage document structure (HTML headers, markdown sections, PDF sections) to create chunks aligned with logical sections.

Overlap between chunks ensures that information at chunk boundaries is not lost. Typical overlap is 10-20 percent of chunk size.`,

    `## Relevance and Retrieval Quality

Retrieval quality directly impacts generation quality. If irrelevant chunks are retrieved, the model may produce incorrect answers or ignore the context entirely.

**Similarity search**: cosine similarity between query and document embeddings. Fast but can miss semantically relevant results with different wording.

**Reranking**: a second-stage model (e.g., Cohere Rerank, cross-encoder models) scores retrieved candidates more accurately than embedding similarity alone. Retrieves top-K candidates, then reranks to top-N.

**Hybrid search**: combines dense (vector) retrieval with sparse (keyword/BM25) retrieval. Catches both semantic matches and exact keyword matches.

**Query transformation**: rewriting the user query to improve retrieval. Techniques include HyDE (Hypothetical Document Embeddings), query decomposition, and step-back prompting.

**Evaluation metrics**: recall@K (what fraction of relevant documents appear in top K), MRR (Mean Reciprocal Rank), and NDCG measure retrieval quality.`,

    `## RAG Design Decisions

**Number of retrieved chunks**: too few may miss context; too many may exceed the context window or dilute the signal. Start with 3-5 and tune based on evaluation.

**Context window management**: retrieved chunks plus the prompt and expected response must fit within the model's context window. Monitor total token count.

**Citation and attribution**: include source metadata so the model can cite where information came from. This improves user trust and enables verification.

**Fallback behavior**: define what happens when no relevant documents are retrieved. The model should acknowledge the gap rather than hallucinate an answer.

**Multi-turn RAG**: in conversational settings, reformulate the current query to include conversation context before retrieval, since the latest message alone may lack context.

**Evaluation**: test end-to-end (retrieval quality + generation quality) with metrics like faithfulness (does the answer reflect the sources?), relevance (does the answer address the question?), and groundedness (is every claim supported by a source?).`,
  ],
  interviewQA: [
    {
      q: "Why use RAG instead of fine-tuning for domain-specific knowledge?",
      a: "RAG retrieves knowledge at query time from an updatable knowledge base, while fine-tuning bakes knowledge into model weights. RAG advantages: knowledge can be updated without retraining, sources can be cited for transparency, no training infrastructure is needed, and it works with any LLM. Fine-tuning is better when you need to change the model's behavior or style, not just its knowledge. Many production systems use both: RAG for dynamic knowledge and fine-tuning for style and format.",
    },
    {
      q: "What is the purpose of a reranker in a RAG pipeline?",
      a: "A reranker is a second-stage model that takes the query-document pairs retrieved by vector search and produces more accurate relevance scores. Embedding similarity is fast but approximate. A cross-encoder reranker jointly encodes the query and document, capturing fine-grained interactions that bi-encoder embeddings miss. The typical pattern is to retrieve a larger candidate set (top 20-50) with vector search, then rerank to select the best 3-5 passages.",
    },
    {
      q: "How do you evaluate a RAG system end-to-end?",
      a: "Evaluate both retrieval and generation. For retrieval: recall@K, MRR, and NDCG measure whether the right documents are retrieved. For generation: faithfulness (does the answer match the sources), relevance (does it address the question), and groundedness (is every claim supported). Tools like RAGAS and TruLens automate these evaluations. Also test for failure modes: what happens when no relevant context exists, when context is contradictory, or when the question is out of scope.",
    },
    {
      q: "What is hybrid search and when is it useful?",
      a: "Hybrid search combines dense vector retrieval (semantic similarity) with sparse keyword retrieval (BM25). It is useful when queries may contain specific terms, acronyms, or identifiers that semantic search misses, or when semantic matches alone are insufficient. For example, searching for error code 'ERR-4521' benefits from exact keyword matching, while understanding that 'authentication failure' relates to 'login error' benefits from semantic search. Most production RAG systems use hybrid search.",
    },
  ],
  mcqs: [
    {
      q: "In a RAG pipeline, when does retrieval happen?",
      options: [
        "During model training",
        "At query time, before generation",
        "After the model generates its response",
        "During document indexing",
      ],
      answerIndex: 1,
      explanation:
        "Retrieval happens at query time: the user query is embedded, similar documents are retrieved from the vector store, and they are included in the prompt before the model generates its response.",
    },
    {
      q: "What is the main advantage of a reranker over embedding similarity?",
      options: [
        "It is faster than vector search",
        "It jointly encodes query and document for more accurate relevance scoring",
        "It does not require an embedding model",
        "It works without a vector store",
      ],
      answerIndex: 1,
      explanation:
        "A cross-encoder reranker processes the query and document together, capturing fine-grained semantic interactions that bi-encoder embeddings (which encode query and document separately) cannot.",
    },
    {
      q: "What does HyDE stand for in the context of RAG?",
      options: [
        "Hybrid Dense Embeddings",
        "Hypothetical Document Embeddings",
        "High-Yield Data Extraction",
        "Hierarchical Document Encoding",
      ],
      answerIndex: 1,
      explanation:
        "HyDE generates a hypothetical document that would answer the query, then uses that document's embedding for retrieval, often improving recall over the raw query embedding.",
    },
    {
      q: "Why is chunk overlap important?",
      options: [
        "It reduces the number of chunks needed",
        "It ensures information at chunk boundaries is not lost",
        "It makes embeddings more accurate",
        "It speeds up indexing",
      ],
      answerIndex: 1,
      explanation:
        "Without overlap, important information that spans a chunk boundary could be split across two chunks, neither containing the full context. Overlap duplicates boundary content to prevent this.",
    },
  ],
  flashcards: [
    {
      front: "What are the four stages of a RAG pipeline?",
      back: "Indexing (chunk and embed documents), Retrieval (find similar chunks), Augmentation (add chunks to prompt), Generation (LLM produces response).",
    },
    {
      front: "What is a vector store?",
      back: "A database that indexes document embeddings for fast similarity search, supporting nearest-neighbor queries.",
    },
    {
      front: "What is hybrid search?",
      back: "Combining dense vector retrieval (semantic) with sparse keyword retrieval (BM25) for better recall.",
    },
    {
      front: "What is a reranker?",
      back: "A second-stage model that rescores retrieved documents more accurately than initial embedding similarity.",
    },
    {
      front: "What is HyDE?",
      back: "Hypothetical Document Embeddings -- generating a hypothetical answer to the query and using its embedding for retrieval.",
    },
    {
      front: "What is faithfulness in RAG evaluation?",
      back: "Whether the generated answer accurately reflects the information in the retrieved source documents.",
    },
    {
      front: "Why is multi-turn query reformulation important?",
      back: "The latest message in a conversation may lack context. Reformulating it with conversation history improves retrieval relevance.",
    },
  ],
  deepDive: [
    `## Embedding Models and Vector Representations

The foundation of any RAG system is the **embedding model** that converts text into dense vector representations. Models like OpenAI's \`text-embedding-3-large\`, Cohere's \`embed-v3\`, and open-source alternatives like \`BGE\` or \`E5\` produce vectors of varying dimensionality (typically **768 to 3072 dimensions**). The choice of embedding model profoundly affects retrieval quality — a model trained on *general web text* may underperform on *domain-specific corpora* such as legal contracts or medical literature. **Matryoshka Representation Learning (MRL)** enables truncating embeddings to smaller dimensions without retraining, offering a flexible trade-off between storage cost and retrieval accuracy. When selecting an embedding model, evaluate it on your *actual retrieval tasks* using benchmarks like MTEB, and consider factors such as \`max token length\` (most models cap at 512 or 8192 tokens per chunk), inference latency, and whether the model supports **instruction-prefixed embeddings** where you prepend task descriptions like \`"search_query:"\` or \`"search_document:"\` to differentiate query and document embeddings.`,

    `## Advanced Retrieval Architectures

Production RAG systems go far beyond simple *top-K cosine similarity* retrieval. **Multi-stage retrieval** pipelines first cast a wide net with a fast ANN search (retrieving 50-100 candidates), then apply a **cross-encoder reranker** to select the best 3-5 passages. **Contextual retrieval** prepends a short document-level summary to each chunk before embedding, so the embedding captures both *local detail* and *global context*. For complex queries, **query decomposition** breaks a multi-faceted question into sub-queries, retrieves independently for each, and merges results — this is critical for questions like *"Compare the revenue growth of Company A and Company B in Q3"* which require retrieving from multiple document sections. **Parent-child retrieval** indexes small chunks for precision but returns the *parent chunk* (a larger surrounding passage) to the LLM for richer context. **Recursive retrieval** starts with a summary-level index, identifies relevant documents, then retrieves specific chunks from those documents — acting like a two-tier search system. Each of these patterns addresses a specific failure mode of naive RAG: lost context, diluted relevance, or incomplete coverage.`,

    `## Evaluation, Guardrails, and Production Considerations

Deploying RAG to production requires rigorous **evaluation frameworks** and operational guardrails. The *RAGAS framework* measures four key dimensions: **faithfulness** (is the answer supported by retrieved context?), **answer relevancy** (does the answer address the question?), **context precision** (are the retrieved chunks relevant?), and **context recall** (were all necessary chunks retrieved?). Beyond automated metrics, build a **golden test set** of question-answer-source triples curated by domain experts, and run regression tests on every pipeline change. On the operational side, implement \`guardrails\` to handle failure modes: set a **relevance score threshold** below which the system admits uncertainty rather than hallucinating, add **content filters** to prevent retrieval of outdated or revoked documents, and implement **token budget management** to prevent context window overflow. Monitor retrieval latency (target **< 200ms p95** for the retrieval stage), track embedding drift as your corpus evolves, and set up alerts for sudden drops in retrieval recall. Consider **caching** frequent queries and their retrieved chunks to reduce both latency and cost — a simple LRU cache on the query embedding can eliminate redundant vector searches for repeated or near-duplicate questions.`,
  ],

  code: [
    {
      language: "javascript",
      caption:
        "Node.js/Express RAG pipeline with **MongoDB Atlas Vector Search** — handles document ingestion, embedding, and query-time retrieval",
      source: `const express = require("express");
const { MongoClient } = require("mongodb");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("rag_demo");
const collection = db.collection("documents");

// --- Embedding helper ---
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// --- Chunking utility (recursive, with overlap) ---
function chunkText(text, maxTokens = 512, overlap = 50) {
  const sentences = text.split(/(?<=[.!?])\\s+/);
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const sentence of sentences) {
    const tokenEstimate = Math.ceil(sentence.length / 4);
    if (currentLen + tokenEstimate > maxTokens && current.length > 0) {
      chunks.push(current.join(" "));
      // Keep last few sentences for overlap
      const overlapSentences = current.slice(-2);
      current = [...overlapSentences];
      currentLen = overlapSentences.join(" ").length / 4;
    }
    current.push(sentence);
    currentLen += tokenEstimate;
  }
  if (current.length > 0) chunks.push(current.join(" "));
  return chunks;
}

// --- POST /ingest: chunk, embed, and store documents ---
app.post("/ingest", async (req, res) => {
  const { title, content, source } = req.body;
  const chunks = chunkText(content);

  const docs = await Promise.all(
    chunks.map(async (chunk, index) => ({
      title,
      source,
      chunkIndex: index,
      text: chunk,
      embedding: await getEmbedding(chunk),
      createdAt: new Date(),
    }))
  );

  await collection.insertMany(docs);
  res.json({ ingested: docs.length, title });
});

// --- POST /query: retrieve relevant chunks and generate answer ---
app.post("/query", async (req, res) => {
  const { question, topK = 5 } = req.body;
  const queryEmbedding = await getEmbedding(question);

  // MongoDB Atlas Vector Search aggregation pipeline
  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: topK * 10,
          limit: topK,
        },
      },
      {
        $project: {
          text: 1,
          title: 1,
          source: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray();

  // Filter by relevance threshold
  const relevant = results.filter((r) => r.score > 0.7);

  // Build augmented prompt
  const context = relevant
    .map((r, i) => \`[Source \${i + 1}: \${r.title}]\\n\${r.text}\`)
    .join("\\n\\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: \`Answer based ONLY on the provided context.
If the context doesn't contain the answer, say "I don't have
enough information to answer that."
Cite sources using [Source N] notation.\`,
      },
      {
        role: "user",
        content: \`Context:\\n\${context}\\n\\nQuestion: \${question}\`,
      },
    ],
    temperature: 0.1,
  });

  res.json({
    answer: completion.choices[0].message.content,
    sources: relevant.map((r) => ({
      title: r.title,
      source: r.source,
      score: r.score,
    })),
  });
});

app.listen(3000, () => console.log("RAG server on :3000"));`,
    },
    {
      language: "cpp",
      caption:
        "C++ embedding utilities with normalization, truncation, and cosine similarity for RAG indexing",
      source: `/*
 * Embedding utilities for a RAG indexing pipeline.
 * Demonstrates vector normalization, Matryoshka truncation,
 * and cosine similarity ranking in pure C++.
 *
 * In production, embeddings are generated via an HTTP call to
 * an embedding API (OpenAI, Cohere, or a local model server).
 * This module handles the post-processing and similarity search.
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <numeric>
#include <iomanip>

using Embedding = std::vector<float>;
using EmbeddingMatrix = std::vector<Embedding>;

// L2-normalize a vector in place
void normalize(Embedding& vec) {
    float norm = 0.0f;
    for (float v : vec) norm += v * v;
    norm = std::sqrt(norm);
    if (norm > 0.0f) {
        for (float& v : vec) v /= norm;
    }
}

// Matryoshka truncation: reduce dimensionality without retraining
EmbeddingMatrix truncateEmbeddings(const EmbeddingMatrix& embeddings,
                                   int truncateDim, bool renormalize = true) {
    EmbeddingMatrix result;
    result.reserve(embeddings.size());
    for (const auto& emb : embeddings) {
        int dim = std::min(truncateDim, static_cast<int>(emb.size()));
        Embedding truncated(emb.begin(), emb.begin() + dim);
        if (renormalize) normalize(truncated);
        result.push_back(std::move(truncated));
    }
    return result;
}

// Cosine similarity (assumes normalized vectors, so dot product suffices)
float cosineSimilarity(const Embedding& a, const Embedding& b) {
    float dot = 0.0f;
    for (size_t i = 0; i < a.size() && i < b.size(); ++i) {
        dot += a[i] * b[i];
    }
    return dot;
}

// Compute similarity scores between a query and all documents
std::vector<float> computeSimilarities(const Embedding& queryVec,
                                       const EmbeddingMatrix& docVecs) {
    std::vector<float> scores;
    scores.reserve(docVecs.size());
    for (const auto& doc : docVecs) {
        scores.push_back(cosineSimilarity(queryVec, doc));
    }
    return scores;
}

// Rank documents by similarity score
std::vector<std::pair<int, float>> rankByScore(const std::vector<float>& scores) {
    std::vector<std::pair<int, float>> ranked;
    for (int i = 0; i < static_cast<int>(scores.size()); ++i) {
        ranked.push_back({i, scores[i]});
    }
    std::sort(ranked.begin(), ranked.end(),
              [](auto& a, auto& b) { return a.second > b.second; });
    return ranked;
}

int main() {
    // Simulated embeddings (in production, these come from an embedding API)
    std::vector<std::string> documents = {
        "RAG retrieves relevant documents before generation.",
        "Vector databases store embeddings for similarity search.",
        "Chunking splits documents into smaller retrievable units.",
        "Rerankers improve retrieval precision with cross-encoders.",
    };

    // Simulated 8-dimensional embeddings for demonstration
    EmbeddingMatrix docEmbeddings = {
        {0.8f, 0.3f, 0.5f, 0.1f, 0.9f, 0.2f, 0.4f, 0.7f},
        {0.2f, 0.9f, 0.1f, 0.8f, 0.3f, 0.7f, 0.5f, 0.4f},
        {0.5f, 0.5f, 0.7f, 0.3f, 0.6f, 0.4f, 0.8f, 0.2f},
        {0.3f, 0.7f, 0.4f, 0.6f, 0.2f, 0.8f, 0.1f, 0.9f},
    };
    for (auto& emb : docEmbeddings) normalize(emb);

    // Query embedding
    Embedding queryEmb = {0.7f, 0.4f, 0.6f, 0.2f, 0.8f, 0.3f, 0.5f, 0.6f};
    normalize(queryEmb);

    // Truncation example (reduce to 4 dimensions)
    auto truncated = truncateEmbeddings(docEmbeddings, 4);
    std::cout << "Original dims: " << docEmbeddings[0].size()
              << ", Truncated dims: " << truncated[0].size() << std::endl;

    // Compute similarities and rank
    auto scores = computeSimilarities(queryEmb, docEmbeddings);
    auto ranked = rankByScore(scores);

    std::cout << std::fixed << std::setprecision(4);
    std::cout << "\\nRanked results:" << std::endl;
    for (auto& [idx, score] : ranked) {
        std::cout << "  [" << score << "] " << documents[idx] << std::endl;
    }
    return 0;
}`,
    },
    {
      language: "javascript",
      caption:
        "MongoDB Atlas **vector search index** definition — required for the `$vectorSearch` aggregation stage",
      source: `// Create this index in MongoDB Atlas UI or via the Atlas Admin API.
// Collection: "documents" in database "rag_demo"
{
  "name": "vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "source"
      },
      {
        "type": "filter",
        "path": "createdAt"
      }
    ]
  }
}`,
    },
  ],

  diagrams: [
    {
      title: "RAG Pipeline Architecture",
      kind: "architecture",
      caption: "Offline indexing embeds documents into a vector store. Online queries embed the question, retrieve similar chunks, and augment the LLM prompt.",
      mermaid: `graph TD
    subgraph Offline Indexing
      DOC[Raw Documents] --> CHUNK[Chunking]
      CHUNK --> EMBED[Embedding Model]
      EMBED --> VS[(Vector Store)]
    end
    subgraph Online Query
      Q[User Query] --> QE[Query Embedding]
      QE --> SEARCH[ANN Search]
      VS --> SEARCH
      SEARCH --> CTX[Retrieved Chunks]
      CTX --> PROMPT[Augmented Prompt]
      PROMPT --> LLM[LLM]
      LLM --> ANS[Answer]
    end`,
    },
    {
      title: "Chunking Strategy Decision Flow",
      kind: "flow",
      caption: "The chunking approach depends on document structure and retrieval granularity needs.",
      mermaid: `flowchart TD
    A([Document to chunk]) --> B{Structured document?}
    B -->|Yes, headers/sections| C[Semantic / Markdown chunking]
    B -->|No, plain prose| D{Long paragraphs?}
    D -->|Yes| E[Recursive character splitter]
    D -->|No| F[Fixed-size with overlap]
    C --> G{Need parent context?}
    G -->|Yes| H[Parent-child chunking]
    G -->|No| I[Store as-is]
    E --> J[Embed and index]
    F --> J
    H --> J
    I --> J`,
    },
    {
      title: "Retrieval and Reranking Sequence",
      kind: "sequence",
      caption: "Query is embedded, candidate chunks are retrieved via ANN, then a cross-encoder reranker reorders them before the LLM generates an answer.",
      mermaid: `sequenceDiagram
    participant U as User
    participant APP as App
    participant EMB as Embedding Model
    participant VS as Vector Store
    participant RR as Reranker
    participant LLM as LLM
    U->>APP: question
    APP->>EMB: embed question
    EMB-->>APP: query vector
    APP->>VS: ANN search top-k=20
    VS-->>APP: 20 candidate chunks
    APP->>RR: rerank(question, chunks)
    RR-->>APP: top 5 reranked chunks
    APP->>LLM: prompt + top 5 context
    LLM-->>APP: answer
    APP-->>U: response`,
    },
    {
      title: "RAG Failure Modes",
      kind: "mindmap",
      caption: "Common failure modes in RAG systems grouped by pipeline stage.",
      mermaid: `mindmap
  root((RAG Failures))
    Retrieval
      Wrong chunks returned
      Chunk too small for context
      Embedding model mismatch
    Generation
      Hallucination despite context
      Context window overflow
      Instruction following failure
    Indexing
      Poor chunking strategy
      Stale index
      Duplicate chunks
    Query
      Vague user query
      Missing query expansion
      Language mismatch`,
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Naive RAG",
      "Advanced RAG",
      "Fine-tuning",
    ],
    rows: [
      [
        "**Knowledge Update**",
        "Add documents to vector store; *no retraining*",
        "Add documents + re-index with metadata; *no retraining*",
        "Requires *full or partial retraining* on new data",
      ],
      [
        "**Retrieval Quality**",
        "Basic `top-K` cosine similarity; prone to irrelevant results",
        "Hybrid search + **reranker** + query transformation; high precision",
        "No retrieval — knowledge is *baked into weights*",
      ],
      [
        "**Hallucination Control**",
        "Moderate — context may be noisy or insufficient",
        "Strong — relevance thresholds, **guardrails**, and citation enforcement",
        "Weak — model may still hallucinate beyond training data",
      ],
      [
        "**Implementation Complexity**",
        "*Low* — embed, store, retrieve, prompt",
        "*High* — reranking, query routing, evaluation pipelines",
        "*Very High* — training infra, dataset curation, GPU compute",
      ],
      [
        "**Cost Profile**",
        "Embedding + LLM inference per query; vector DB hosting",
        "Higher inference cost (reranker + LLM); more complex infra",
        "High upfront training cost; lower per-query inference cost",
      ],
      [
        "**Best For**",
        "Prototypes, FAQ bots, simple document Q&A",
        "Production systems requiring **high accuracy** and auditability",
        "Changing model *behavior/style* or compressing specialized knowledge",
      ],
      [
        "**Source Attribution**",
        "Basic — return chunk sources alongside answer",
        "Rich — **cited passages**, confidence scores, source links",
        "Not available — no external sources to cite",
      ],
    ],
  },

  exercises: [
    `**Build a Basic RAG Pipeline**: Using Node.js and MongoDB Atlas, create a RAG system that ingests a set of markdown files, chunks them with \`512-token\` windows and \`50-token\` overlap, generates embeddings with \`text-embedding-3-small\`, stores them with metadata, and answers user queries with source citations. Test with at least **10 documents** and evaluate retrieval quality using *recall@5*.`,

    `**Implement Hybrid Search**: Extend your RAG pipeline to support **hybrid search** by combining MongoDB Atlas vector search with a text index for keyword matching. Implement *Reciprocal Rank Fusion (RRF)* to merge results from both retrieval methods. Compare retrieval quality against pure vector search on queries containing specific terms, acronyms, or error codes.`,

    `**Add a Reranker Stage**: Integrate a cross-encoder reranker (e.g., using the \`cross-encoder/ms-marco-MiniLM-L-6-v2\` model via Python) as a microservice. Modify your pipeline to retrieve **top-20** candidates via vector search, then rerank to select the **top-3**. Measure the improvement in *answer faithfulness* and *context precision* using the RAGAS framework.`,

    `**Chunking Strategy Comparison**: Take a corpus of at least **5 long documents** (2000+ words each) and implement three chunking strategies: *fixed-size* (512 tokens), *recursive* (split by paragraphs then sentences), and *semantic* (split by embedding similarity shifts). Index each separately, run the same 20 test queries against all three, and compare **recall@5** and **answer quality**. Document which strategy works best for your corpus and why.`,

    `**Build a RAG Evaluation Harness**: Create an automated evaluation pipeline that: (1) maintains a **golden test set** of 20+ question-answer-source triples, (2) runs each question through your RAG pipeline, (3) computes *faithfulness*, *answer relevancy*, *context precision*, and *context recall* using RAGAS or a custom LLM-as-judge approach, and (4) outputs a report with pass/fail thresholds. Integrate this into your CI pipeline to catch retrieval regressions.`,
  ],

  cheatSheet: [
    `**Chunk size sweet spot**: Start with \`512 tokens\` and \`50-token overlap\` (~10%). Smaller chunks (256) improve precision but lose context; larger chunks (1024) retain context but dilute relevance. *Always benchmark on your actual queries.*`,

    `**Embedding model selection**: Use \`text-embedding-3-small\` (1536d) for cost efficiency or \`text-embedding-3-large\` (3072d) for max quality. For open-source, **BGE-large-en-v1.5** and **E5-large-v2** are top performers. Match the model to your *language and domain*.`,

    `**Retrieval pipeline pattern**: Retrieve **top-50** via ANN vector search → apply **hybrid fusion** with BM25 keyword results → **rerank** with a cross-encoder to select top-3-5 → set a *relevance score threshold* (e.g., > 0.7) to filter low-confidence results.`,

    `**MongoDB Atlas Vector Search index**: Define the index with \`"similarity": "cosine"\`, set \`numDimensions\` to match your embedding model output, and add \`"type": "filter"\` fields for metadata filtering. Use \`numCandidates = limit * 10\` for good recall.`,

    `**Prompt engineering for RAG**: Always include: (1) *system instruction* to answer only from context, (2) *fallback instruction* to admit when context is insufficient, (3) *citation format* like \`[Source N]\`, and (4) the retrieved context clearly delimited from the question.`,

    `**Evaluation metrics to track**: *Context Precision* (are retrieved chunks relevant?), *Context Recall* (are all needed chunks retrieved?), *Faithfulness* (does the answer match sources?), *Answer Relevancy* (does the answer address the question?). Use **RAGAS** or **TruLens** for automated scoring.`,
  ],

  revisionNotes: [
    `RAG follows a **retrieve-then-generate** pattern: documents are chunked and embedded *offline*, then at query time the user query is embedded, similar chunks are retrieved via **ANN search**, and the top results are injected into the LLM prompt as grounding context. The key advantage over fine-tuning is that knowledge can be *updated without retraining*.`,

    `**Hybrid search** (vector + keyword/BM25) with **Reciprocal Rank Fusion** outperforms pure vector search in most production settings. A **cross-encoder reranker** as a second stage further improves precision by jointly encoding query-document pairs, catching relevance signals that bi-encoder embeddings miss.`,

    `Chunking strategy directly impacts retrieval quality. *Recursive chunking* (split by structure, then by size) with **10-20% overlap** is the most reliable default. **Parent-child retrieval** indexes small chunks for matching but returns the larger parent chunk to the LLM for richer context.`,

    `Production RAG requires **guardrails**: relevance score thresholds to avoid hallucination on low-confidence retrievals, token budget management to prevent context window overflow, content freshness checks to exclude stale documents, and a \`fallback response\` when no relevant context is found.`,

    `Evaluate RAG end-to-end with four dimensions: **context precision**, **context recall**, **faithfulness**, and **answer relevancy**. Maintain a *golden test set* of curated question-answer-source triples, automate evaluation with frameworks like **RAGAS**, and run regression tests on every pipeline change to catch retrieval quality drops early.`,
  ],

  glossary: [
    {
      term: "RAG",
      definition: "Retrieval-Augmented Generation, a pattern that retrieves relevant documents and includes them in the LLM prompt for grounded responses.",
    },
    {
      term: "Vector Store",
      definition: "A database optimized for storing and querying high-dimensional embedding vectors via similarity search.",
    },
    {
      term: "Chunking",
      definition: "Splitting documents into smaller pieces suitable for embedding and retrieval.",
    },
    {
      term: "Reranker",
      definition: "A model that rescores retrieved candidates for more accurate relevance ranking than initial retrieval.",
    },
    {
      term: "Hybrid Search",
      definition: "Combining semantic vector search with keyword-based search for improved retrieval coverage.",
    },
    {
      term: "HNSW",
      definition: "Hierarchical Navigable Small World, an approximate nearest neighbor algorithm used in vector databases.",
    },
    {
      term: "Groundedness",
      definition: "A RAG evaluation metric measuring whether every claim in the response is supported by retrieved sources.",
    },
  ],
};
