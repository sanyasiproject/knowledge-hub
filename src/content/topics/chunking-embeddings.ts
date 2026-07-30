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
};
