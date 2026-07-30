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
};
