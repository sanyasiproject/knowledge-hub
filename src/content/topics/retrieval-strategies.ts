import type { TopicContent } from "../types";

export const retrievalStrategies: TopicContent = {
  quickSummary: [
    "Retrieval strategies determine how a system finds relevant documents from a corpus given a user query. The two main families are dense retrieval (embedding-based similarity) and sparse retrieval (term-matching like BM25).",
    "Hybrid retrieval combines dense and sparse signals to get the best of both worlds: semantic understanding from embeddings and exact keyword matching from BM25.",
    "Re-ranking applies a more expensive cross-encoder model to a shortlist of candidates, dramatically improving precision without scanning the entire corpus.",
    "The choice of retrieval strategy directly impacts RAG quality: poor retrieval means the LLM never sees the right context, regardless of how powerful the model is.",
  ],
  detailed: [
    "## Dense Retrieval\n\nDense retrieval encodes both queries and documents into fixed-size embedding vectors using models like `text-embedding-3-large` or `e5-large`. Similarity is computed via cosine similarity or dot product in the vector space. The key advantage is semantic matching: 'automobile' matches 'car' even without lexical overlap. Dense retrieval requires a vector database (Pinecone, Weaviate, pgvector, Qdrant) that supports approximate nearest neighbor (ANN) search using algorithms like HNSW or IVF. The embedding model quality is critical: domain-specific fine-tuning often yields significant gains. Chunking strategy (size, overlap, boundaries) directly affects retrieval quality.",
    "## Sparse Retrieval (BM25)\n\nBM25 (Best Matching 25) is a probabilistic ranking function that scores documents based on term frequency, inverse document frequency, and document length normalization. It excels at exact keyword matching, rare term lookup, and entity/ID searches where dense models struggle. BM25 requires no training, no GPU, and is extremely fast. Tools like Elasticsearch, OpenSearch, and Lucene implement BM25 natively. Sparse retrieval fails at semantic matching: 'ML' will not match 'machine learning' unless you add synonyms or query expansion.",
    "## Hybrid Retrieval\n\nHybrid retrieval runs both dense and sparse retrievers in parallel, then fuses their ranked result lists. Reciprocal Rank Fusion (RRF) is the most common fusion method: it assigns scores based on rank position rather than raw scores, making it robust across different score distributions. The formula is `score(d) = sum(1 / (k + rank_i(d)))` where k is typically 60. Hybrid consistently outperforms either approach alone on benchmarks. Most vector databases now support hybrid search natively (e.g., Weaviate hybrid, Pinecone sparse-dense).",
    "## Re-ranking\n\nRe-ranking uses a cross-encoder model that takes the (query, document) pair as joint input, producing a relevance score far more accurate than bi-encoder similarity. This is too expensive for the full corpus but highly effective on a shortlist of 20-100 candidates from the first-stage retriever. Models like Cohere Rerank, `bge-reranker-v2`, and `cross-encoder/ms-marco-MiniLM` are popular choices. Re-ranking often improves Recall@5 by 10-20% over dense retrieval alone. The retrieval pipeline becomes: first-stage retrieve (fast, broad) then re-rank (slow, precise).",
    "## Evaluation Metrics\n\nRetrieval quality is measured by Recall@k (fraction of relevant docs in top k), Precision@k, MRR (Mean Reciprocal Rank), and NDCG (Normalized Discounted Cumulative Gain). For RAG, Recall@k matters most: if the relevant passage is not in the retrieved set, the LLM cannot answer correctly. Evaluation requires labeled query-document pairs; synthetic generation using an LLM to create questions from passages is a practical bootstrapping approach.",
  ],
  interviewQA: [
    {
      q: "When would you choose BM25 over dense retrieval?",
      a: "BM25 excels when queries contain rare keywords, entity names, product IDs, or exact phrases that must be matched literally. It also wins when you have no GPU budget, need zero training, or work with highly structured/technical text where lexical overlap is strong. For example, searching error codes or API parameter names is better served by BM25.",
    },
    {
      q: "How does Reciprocal Rank Fusion work in hybrid retrieval?",
      a: "RRF assigns each document a score of 1/(k + rank) from each retriever, where k is a constant (typically 60) that dampens the influence of high ranks. Scores are summed across retrievers. This is rank-based rather than score-based, which avoids the problem of different retrievers producing incomparable score scales. Documents that appear high in both lists get the highest fused score.",
    },
    {
      q: "Why is re-ranking more accurate than bi-encoder retrieval?",
      a: "Bi-encoders encode query and document independently into separate vectors, so they cannot model fine-grained token-level interactions between query and document. Cross-encoders (used in re-ranking) process the concatenated query-document pair through the full transformer, enabling rich cross-attention between every query token and every document token. This joint encoding captures nuances that independent encodings miss.",
    },
    {
      q: "What chunking strategies improve retrieval quality?",
      a: "Effective strategies include: semantic chunking (split at paragraph/section boundaries rather than fixed token counts), overlapping chunks (e.g., 512 tokens with 50-token overlap to avoid splitting relevant context), parent-child chunking (embed small chunks but retrieve the parent section for context), and metadata enrichment (attach titles, headers, and source info to each chunk for filtering).",
    },
  ],
  mcqs: [
    {
      q: "Which retrieval method is best for matching 'auto insurance' with documents about 'car coverage'?",
      options: [
        "BM25 with default settings",
        "Dense retrieval with a semantic embedding model",
        "TF-IDF with cosine similarity",
        "Exact string matching",
      ],
      answerIndex: 1,
      explanation:
        "Dense retrieval captures semantic similarity between 'auto insurance' and 'car coverage' even though they share no exact terms. BM25 and TF-IDF rely on lexical overlap and would miss this match.",
    },
    {
      q: "What does Reciprocal Rank Fusion use to combine results from multiple retrievers?",
      options: [
        "Raw similarity scores from each retriever",
        "Document embeddings averaged across retrievers",
        "Rank positions of documents in each result list",
        "Learned weights from a trained fusion model",
      ],
      answerIndex: 2,
      explanation:
        "RRF uses rank positions rather than raw scores, making it robust to different score distributions across retrievers. The formula 1/(k + rank) converts ranks to fuseable scores.",
    },
    {
      q: "Why is cross-encoder re-ranking not applied to the entire corpus?",
      options: [
        "Cross-encoders have lower accuracy than bi-encoders",
        "Cross-encoders require the query-document pair as joint input, making them O(n) per query",
        "Cross-encoders only work with sparse retrieval",
        "Cross-encoders cannot handle documents longer than 128 tokens",
      ],
      answerIndex: 1,
      explanation:
        "Cross-encoders process each (query, document) pair jointly, so scoring the entire corpus requires N forward passes. This is computationally prohibitive for large corpora but feasible for a shortlist of 20-100 candidates.",
    },
  ],
  flashcards: [
    { front: "What does BM25 stand for?", back: "Best Matching 25. It is a probabilistic ranking function based on term frequency, inverse document frequency, and document length normalization." },
    { front: "What is HNSW?", back: "Hierarchical Navigable Small World graph. An ANN algorithm that builds a multi-layer graph for fast approximate nearest neighbor search in high-dimensional vector spaces." },
    { front: "What is the key advantage of hybrid retrieval over pure dense retrieval?", back: "Hybrid retrieval captures both semantic similarity (from dense) and exact keyword matching (from sparse), consistently outperforming either method alone." },
    { front: "What is a cross-encoder?", back: "A model that takes a (query, document) pair as joint input and produces a relevance score. More accurate than bi-encoders but too expensive for full-corpus search." },
    { front: "What is Recall@k?", back: "The fraction of all relevant documents that appear in the top k retrieved results. The most important metric for RAG retrieval quality." },
    { front: "What is the typical k value in RRF?", back: "k = 60. It dampens the influence of top ranks and is the default in most implementations." },
    { front: "What is parent-child chunking?", back: "A strategy where small chunks are embedded for precise retrieval, but when matched, the larger parent section is returned to provide full context to the LLM." },
  ],
  glossary: [
    { term: "Dense Retrieval", definition: "A retrieval method that encodes queries and documents as embedding vectors and finds matches via vector similarity (cosine, dot product)." },
    { term: "BM25", definition: "A probabilistic sparse retrieval algorithm that ranks documents by term frequency, inverse document frequency, and length normalization." },
    { term: "Reciprocal Rank Fusion (RRF)", definition: "A rank-based method for combining results from multiple retrievers using the formula 1/(k + rank)." },
    { term: "Cross-encoder", definition: "A transformer model that jointly encodes a query-document pair for high-accuracy relevance scoring." },
    { term: "Bi-encoder", definition: "A model that independently encodes query and document into separate vectors, enabling fast ANN search but with less accuracy than cross-encoders." },
    { term: "ANN (Approximate Nearest Neighbor)", definition: "Algorithms like HNSW and IVF that find approximately closest vectors in sub-linear time, trading small accuracy for large speed gains." },
    { term: "NDCG", definition: "Normalized Discounted Cumulative Gain. A ranking metric that accounts for the position of relevant documents, giving more credit to hits at higher ranks." },
  ],
  deepDive: [
    "## The Embedding Pipeline: From Text to Vectors\n\nDense retrieval begins with an embedding model that maps arbitrary text into a fixed-dimensional vector space. Modern models like OpenAI's `text-embedding-3-large` (3072 dimensions) or open-source alternatives like `e5-large-v2` (1024 dimensions) are trained on contrastive objectives: pull matching query-document pairs together and push non-matching pairs apart. The quality of this mapping determines retrieval ceiling -- no amount of post-processing can recover from poor embeddings. Dimensionality reduction (e.g., Matryoshka embeddings that allow truncating to 256 or 512 dims) trades marginal accuracy for significant storage and speed gains. In production, the embedding pipeline must handle chunking (splitting documents into retrievable units), batching (sending chunks in groups to the embedding API), and storage (writing vectors to a vector database with metadata). A critical but often overlooked detail is normalization: cosine similarity requires unit-normalized vectors, and some models return unnormalized embeddings by default. The index structure (HNSW, IVF-PQ, or flat) governs the accuracy-speed tradeoff: HNSW offers ~95-99% recall at sub-millisecond latency for millions of vectors, while IVF-PQ compresses vectors for billion-scale collections at the cost of lower recall.",
    "## Hybrid Fusion: Why Rank Beats Score\n\nThe fundamental challenge of hybrid retrieval is combining results from retrievers that produce incomparable scores. A BM25 score of 12.7 and a cosine similarity of 0.83 exist on completely different scales, and normalizing them (e.g., min-max scaling) is fragile because score distributions shift across queries. Reciprocal Rank Fusion (RRF) elegantly sidesteps this by operating on rank positions rather than scores. The formula `score(d) = sum(1 / (k + rank_i(d)))` treats each retriever's output as an ordered list and assigns monotonically decreasing weights by position. The constant k (default 60) controls sensitivity: smaller k amplifies top-ranked results, larger k flattens the distribution. An alternative fusion method is Convex Combination (CC), which normalizes scores and takes a weighted sum -- this allows tuning the dense-vs-sparse weight (e.g., 0.7 dense + 0.3 sparse) but requires careful calibration per dataset. In practice, RRF is preferred for its robustness: it requires no tuning and performs well across diverse query types. Some systems implement learned fusion via a small neural network trained on relevance labels, but the marginal gain over RRF rarely justifies the complexity.",
    "## Re-ranking: The Precision Layer\n\nRe-ranking transforms a noisy top-100 candidate list into a precisely ordered top-10. Cross-encoder models like Cohere Rerank 3, `bge-reranker-v2-m3`, or `cross-encoder/ms-marco-MiniLM-L-12-v2` achieve this by processing the full (query, document) pair through a transformer, allowing deep bidirectional attention between every query token and every document token. This is qualitatively different from bi-encoder retrieval: a bi-encoder compresses each text independently into a single vector, losing fine-grained interaction signals. The cost is O(n) forward passes for n candidates, making re-ranking feasible only for shortlists. A typical production configuration retrieves 100 candidates via hybrid search, re-ranks them, and returns the top 5-10 to the LLM. Latency budgets matter: Cohere Rerank processes ~100 documents in 200-400ms, which is acceptable for most RAG applications but too slow for autocomplete. Multi-stage pipelines can add a lightweight re-ranker (e.g., a distilled model) before a heavy one for further speed gains. Re-ranking also enables relevance thresholding: filtering out candidates whose re-ranker score falls below a threshold prevents injecting irrelevant context into the LLM prompt."
  ],
  code: [
    {
      language: "typescript",
      caption: "Hybrid retrieval — dense and sparse fused with Reciprocal Rank Fusion",
      source: `type Hit = { id: string; text: string };

/**
 * RRF merges ranked lists by POSITION, not score. That matters because a
 * cosine similarity of 0.83 and a BM25 score of 14.2 are not comparable, and
 * any attempt to normalise them needs per-corpus tuning that then rots.
 *
 * score(d) = sum over lists of 1 / (k + rank(d)),  k = 60 by convention.
 */
export function reciprocalRankFusion(lists: Hit[][], k = 60): Hit[] {
  const scores = new Map<string, number>();
  const byId = new Map<string, Hit>();

  for (const list of lists) {
    list.forEach((hit, rank) => {
      byId.set(hit.id, hit);
      scores.set(hit.id, (scores.get(hit.id) ?? 0) + 1 / (k + rank + 1));
    });
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id)!)
    .filter(Boolean);
}

export async function hybridSearch(query: string, limit = 50): Promise<Hit[]> {
  // Run both in parallel — they are independent and latency is additive otherwise.
  const [dense, sparse] = await Promise.all([
    vectorSearch(query, limit),   // finds paraphrase: "cancel plan" -> "subscription termination"
    keywordSearch(query, limit),  // finds literals: ERR_4021, SKU-9912, a person's name
  ]);
  return reciprocalRankFusion([dense, sparse]).slice(0, limit);
}

// Why both: embeddings smear rare literal tokens into a semantic neighbourhood,
// so searching an exact error code returns documents about errors in general.
// BM25 nails those and misses every paraphrase. The failure modes are opposite,
// which is exactly why the combination beats either.`,
    },
    {
      language: "typescript",
      caption: "Rerank the top candidates with a cross-encoder",
      source: `/**
 * Retrieval uses a BI-encoder: query and document are embedded independently,
 * so document vectors can be precomputed and searched fast — but the document
 * was represented without knowing the question.
 *
 * A reranker is a CROSS-encoder: it reads the pair together with full
 * attention. Far more accurate, far too slow to run over a whole corpus.
 * So: retrieve wide and cheap, then rerank narrow and expensive.
 */
export async function retrieveAndRerank(query: string, topK = 5): Promise<Hit[]> {
  const candidates = await hybridSearch(query, 50);
  if (candidates.length === 0) return [];

  const res = await cohere.rerank({
    model: "rerank-english-v3.0",
    query,
    documents: candidates.map((c) => c.text),
    topN: topK,
  });

  const reranked = res.results.map((r) => ({
    ...candidates[r.index],
    relevance: r.relevanceScore,
  }));

  // A retrieval gate: if nothing clears the bar, say so rather than handing the
  // model weak context and inviting it to invent an answer.
  const GATE = 0.3; // calibrate on your own eval set, not on intuition
  return reranked.filter((r) => r.relevance >= GATE);
}

// This closes the similarity-vs-relevance gap: a passage on the same topic as
// the question scores high on cosine whether or not it contains the answer.
// Only a cross-encoder can tell those apart — which is why reranking is
// usually the single biggest quality win per unit of effort in RAG.`,
    },
  ],
  diagrams: [
    {
      title: "RAG Retrieval Pipeline",
      kind: "flow",
      caption: "Retrieval-Augmented Generation pipeline: query is embedded, similar documents retrieved from vector store, context injected into LLM prompt.",
      mermaid: `flowchart TD
    A([User query]) --> B[Embed query to vector]
    B --> C[Search vector database]
    C --> D[Top-k similar chunks retrieved]
    D --> E[Re-rank results by relevance]
    E --> F[Build prompt with context]
    F --> G[LLM generates answer]
    G --> H([Return answer with sources])`,
    },
    {
      title: "Retrieval Strategy Comparison",
      kind: "mindmap",
      caption: "Overview of retrieval strategies including sparse, dense, and hybrid retrieval, each suited to different data types and query patterns.",
      mermaid: `mindmap
  root((Retrieval Strategies))
    Sparse Retrieval
      BM25 keyword matching
      TF-IDF scoring
      Good for exact terms
      Fast - inverted index
    Dense Retrieval
      Semantic embeddings
      Vector similarity search
      Handles synonyms
      Requires GPU for scale
    Hybrid Retrieval
      Combine sparse and dense
      Reciprocal rank fusion
      Best of both worlds
    Graph Retrieval
      Knowledge graph traversal
      Multi-hop reasoning
      Entity relationships`,
    },
    {
      title: "Vector Index Types",
      kind: "architecture",
      caption: "Different vector index types used in retrieval systems: flat exact search, HNSW for approximate nearest neighbor, and IVF for partitioned search.",
      mermaid: `graph TD
    subgraph Exact["Exact Search"]
      Flat["Flat Index - brute force"]
      Flat --> FlatPros["100 percent recall - slow at scale"]
    end
    subgraph Approx["Approximate Search"]
      HNSW["HNSW - hierarchical graph"]
      IVF["IVF - inverted file"]
      HNSW --> HNSWPros["Fast - high recall tradeoff"]
      IVF --> IVFPros["Scalable - cluster-based"]
    end
    subgraph Hybrid2["Hybrid Index"]
      IVFPQ["IVF + Product Quantization"]
      IVFPQ --> HybridPros["Compressed - billion scale"]
    end`,
    },
    {
      title: "Query Expansion and Re-ranking Flow",
      kind: "sequence",
      caption: "Advanced retrieval using query expansion to broaden recall, followed by a cross-encoder re-ranker to improve precision before returning results.",
      mermaid: `sequenceDiagram
    participant User
    participant QueryProc as Query Processor
    participant VectorDB as Vector Store
    participant Reranker as Cross-Encoder Re-ranker
    participant LLM

    User->>QueryProc: Original query
    QueryProc->>QueryProc: Expand query with synonyms and HyDE
    QueryProc->>VectorDB: Multi-query retrieval
    VectorDB-->>QueryProc: Top-50 candidate chunks
    QueryProc->>Reranker: Score all 50 candidates
    Reranker-->>QueryProc: Top-5 by relevance
    QueryProc->>LLM: Prompt with top-5 context
    LLM-->>User: Final answer`,
    },
  ],
  animations: [
    {
      title: "Hybrid Retrieval with RRF Fusion",
      steps: [
        {
          label: "User query arrives",
          detail: "The query 'How does photosynthesis convert CO2?' is sent to the retrieval orchestrator, which dispatches it to both the dense and sparse retrievers in parallel.",
        },
        {
          label: "Dense retrieval runs",
          detail: "The query is embedded into a 3072-dim vector using text-embedding-3-large. An HNSW index search in pgvector returns the top 50 documents ranked by cosine similarity. Doc A (rank 1, 0.91), Doc C (rank 2, 0.87), Doc F (rank 3, 0.85)...",
        },
        {
          label: "Sparse retrieval runs",
          detail: "Elasticsearch scores documents using BM25 on the terms 'photosynthesis', 'convert', 'CO2'. Top results: Doc B (rank 1, score 14.2), Doc A (rank 2, score 12.8), Doc D (rank 3, score 11.1)...",
        },
        {
          label: "RRF fusion combines ranked lists",
          detail: "For each document, RRF computes score = sum(1/(60 + rank)). Doc A appears in both lists: 1/(60+1) + 1/(60+2) = 0.01639 + 0.01613 = 0.03252. Doc B appears only in sparse: 1/(60+1) = 0.01639. Doc A wins the fused ranking because it is highly ranked by both retrievers.",
        },
        {
          label: "Re-ranker scores the top candidates",
          detail: "The top 20 fused results are sent to Cohere Rerank v3.5 as (query, document) pairs. The cross-encoder processes each pair jointly, producing calibrated relevance scores. Doc A: 0.94, Doc C: 0.88, Doc B: 0.72. Documents below threshold 0.3 are filtered out.",
        },
        {
          label: "Final context sent to LLM",
          detail: "The top 5 re-ranked documents are assembled into the prompt context. The LLM generates an answer grounded in these highly relevant passages. Retrieval quality directly determines answer quality.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Dense Retrieval", "Sparse Retrieval (BM25)", "Hybrid Retrieval"],
    rows: [
      ["Matching type", "Semantic similarity via embeddings", "Lexical term overlap", "Both semantic and lexical"],
      ["Accuracy on semantic queries", "High -- captures synonyms and paraphrases", "Low -- misses semantic matches without lexical overlap", "High -- dense component handles semantics"],
      ["Accuracy on keyword/entity queries", "Moderate -- may miss exact terms", "High -- excels at rare terms, IDs, exact phrases", "High -- sparse component handles keywords"],
      ["Latency (1M docs)", "5-20ms with HNSW index", "5-15ms with inverted index", "15-40ms (parallel retrieval + fusion)"],
      ["Setup complexity", "High -- needs embedding model, vector DB, GPU for embedding", "Low -- Elasticsearch or Lucene out of the box", "Highest -- requires both systems plus fusion logic"],
      ["Storage cost", "High -- float32 vectors (12KB per doc at 3072 dims)", "Moderate -- inverted index with term frequencies", "Highest -- both vector and inverted indexes"],
      ["Training required", "Embedding model fine-tuning recommended for domain-specific use", "None -- unsupervised algorithm", "Optional fine-tuning for dense component"],
      ["Best for", "Open-domain QA, conversational queries, semantic search", "Technical docs, code search, entity lookup, exact phrase matching", "Production RAG where query types are mixed or unpredictable"],
    ],
  },
  exercises: [
    "Build a hybrid retrieval system that indexes a set of 100 Wikipedia articles using both pgvector (dense) and Elasticsearch (sparse). Implement RRF fusion and measure Recall@5 for a set of 20 test queries compared to dense-only and sparse-only baselines.",
    "Implement a re-ranking pipeline using a cross-encoder model (e.g., `cross-encoder/ms-marco-MiniLM-L-6-v2` from sentence-transformers). Compare the top-5 results before and after re-ranking on queries that contain both semantic intent and specific keywords.",
    "Write a chunking module that supports three strategies: fixed-size (512 tokens with 50 token overlap), paragraph-based (split on double newlines), and semantic (split using an embedding similarity threshold). Evaluate which strategy produces the best retrieval results on a test corpus.",
    "Create a retrieval evaluation harness: given a set of queries with ground-truth relevant document IDs, compute Recall@k, Precision@k, MRR, and NDCG@k. Use it to compare dense, sparse, and hybrid retrieval on your corpus.",
    "Implement query routing: build a classifier that examines the incoming query and routes keyword-heavy queries (entity names, IDs, error codes) to BM25 and semantic queries to dense retrieval, rather than always running both. Measure whether this improves latency without sacrificing accuracy.",
  ],
  cheatSheet: [
    "Dense retrieval: embed query and docs into vectors, search via ANN (HNSW/IVF) in a vector DB. Best for semantic matching.",
    "BM25 formula: `score = IDF * (tf * (k1+1)) / (tf + k1 * (1 - b + b * dl/avgdl))` where k1=1.2, b=0.75 are defaults.",
    "RRF fusion: `score(d) = sum(1 / (k + rank_i(d)))` with k=60. Rank-based, no score normalization needed.",
    "Re-ranking shortlist size: retrieve 50-100 candidates, re-rank, return top 5-10. Cross-encoder latency is ~200-400ms for 100 docs.",
    "Chunking rule of thumb: 256-512 tokens per chunk with 10-20% overlap. Respect paragraph/section boundaries when possible.",
    "Embedding model selection: `text-embedding-3-large` (OpenAI), `e5-large-v2` (open-source), `bge-large-en-v1.5` (open-source). Fine-tune on domain data for best results.",
    "Relevance threshold filtering: after re-ranking, drop documents with score < 0.3 to avoid injecting irrelevant context into the LLM.",
    "Evaluation priority for RAG: Recall@k > MRR > NDCG > Precision@k. If relevant docs are not retrieved, the LLM cannot answer.",
  ],
  revisionNotes: [
    "Dense retrieval maps text to embedding vectors and uses ANN search for semantic similarity. Requires a vector DB (pgvector, Pinecone, Weaviate) and an embedding model.",
    "BM25 is a sparse, unsupervised ranking algorithm based on term frequency and inverse document frequency. Excels at exact keyword and entity matching with zero training.",
    "Hybrid retrieval runs dense and sparse in parallel, then fuses results. RRF is the standard fusion method: it uses rank positions (not scores) so it works across any pair of retrievers.",
    "Cross-encoder re-ranking is the highest-accuracy retrieval stage but is O(n) per query, so it is only applied to a shortlist of 20-100 first-stage candidates.",
    "Chunking strategy directly impacts retrieval quality. Use semantic or paragraph-based splitting with overlap. Parent-child chunking embeds small chunks but returns the larger parent for context.",
    "Recall@k is the most important metric for RAG retrieval. If the relevant passage is not in the retrieved set, the LLM will hallucinate or refuse to answer.",
    "Production RAG pipeline: ingest (chunk -> embed -> index) then query (retrieve -> fuse -> re-rank -> generate). Each stage has tunable parameters that affect end-to-end quality.",
    "Embedding dimensionality tradeoff: higher dims (3072) give better accuracy but cost more storage and compute. Matryoshka embeddings allow truncation (e.g., to 256 dims) with graceful degradation.",
  ],
  resources: [
    { label: "Pinecone Learning Center: Retrieval Augmented Generation", kind: "docs", note: "Comprehensive guide to dense retrieval, hybrid search, and RAG architecture with Pinecone." },
    { label: "Introduction to Information Retrieval (Manning, Raghavan, Schutze)", kind: "book", note: "The foundational textbook covering BM25, TF-IDF, inverted indexes, and evaluation metrics." },
    { label: "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction (Khattab & Zaharia, 2020)", kind: "paper", note: "Introduces late interaction for balancing bi-encoder speed with cross-encoder accuracy." },
    { label: "Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods (Cormack et al., 2009)", kind: "paper", note: "The original RRF paper proving rank-based fusion beats score-based and learned methods." },
    { label: "Cohere Rerank Documentation", kind: "docs", note: "API reference and best practices for using Cohere's cross-encoder re-ranking models." },
    { label: "sentence-transformers Cross-Encoders", kind: "repo", note: "Open-source cross-encoder models and training scripts for building custom re-rankers." },
    { label: "Building RAG-based LLM Applications for Production (Anyscale)", kind: "article", note: "End-to-end guide covering chunking, embedding, retrieval, and evaluation for production RAG systems." },
    { label: "pgvector: Open-source vector similarity search for Postgres", kind: "repo", note: "PostgreSQL extension for storing embeddings and running ANN search with HNSW indexing." },
  ],
  followUps: [
    "How do you fine-tune an embedding model on domain-specific data to improve retrieval accuracy?",
    "What are the tradeoffs between different ANN algorithms (HNSW vs IVF-PQ vs ScaNN) for billion-scale vector search?",
    "How does ColBERT's late interaction approach compare to traditional bi-encoder and cross-encoder architectures?",
    "What chunking strategies work best for code, tables, and structured documents?",
    "How do you build a retrieval evaluation pipeline with synthetic query generation using LLMs?",
    "What is the role of query expansion and HyDE (Hypothetical Document Embeddings) in improving retrieval recall?",
  ],
};
