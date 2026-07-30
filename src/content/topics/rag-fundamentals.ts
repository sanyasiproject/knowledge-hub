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
