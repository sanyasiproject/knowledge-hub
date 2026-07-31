import type { TopicContent } from "../types";

export const advancedRag: TopicContent = {
  quickSummary: [
    "Advanced RAG techniques go beyond naive retrieve-and-generate by improving query understanding, retrieval quality, and answer synthesis through multi-step pipelines.",
    "Query rewriting transforms vague or conversational queries into retrieval-optimized forms. HyDE generates a hypothetical answer first, then uses its embedding to retrieve real documents.",
    "Agentic RAG gives the LLM the ability to decide when and how to retrieve, iterate on results, and use tools beyond simple vector search.",
    "Graph RAG combines knowledge graphs with retrieval, enabling multi-hop reasoning over structured relationships that flat document retrieval misses.",
  ],
  detailed: [
    "## Query Rewriting\n\nRaw user queries are often conversational, ambiguous, or poorly suited for retrieval. Query rewriting uses an LLM to reformulate the query before retrieval. Techniques include: **query decomposition** (breaking a complex question into sub-questions), **step-back prompting** (generating a broader question to retrieve background context), **query expansion** (adding synonyms or related terms), and **contextual reformulation** (incorporating chat history into a standalone query for multi-turn conversations). Each rewritten query retrieves its own set of documents, and results are merged. This dramatically improves recall for complex questions.",
    "## HyDE (Hypothetical Document Embeddings)\n\nHyDE asks the LLM to generate a hypothetical answer to the query without any context. This hallucinated answer is then embedded, and its embedding is used to retrieve real documents. The insight is that a hypothetical answer is closer in embedding space to real answers than the original question is. HyDE is especially effective for questions where the query phrasing differs significantly from how the answer appears in documents. The downside is added latency (one LLM call before retrieval) and the risk that a poor hypothetical answer leads to irrelevant retrievals.",
    "## Agentic RAG\n\nAgentic RAG treats retrieval as a tool the LLM can invoke on demand rather than a fixed pipeline step. The agent can: decide whether retrieval is needed, choose which index or data source to query, evaluate retrieved results and re-retrieve if insufficient, combine information across multiple retrieval steps, and use non-retrieval tools (calculators, APIs, databases) alongside document search. Frameworks like LangGraph, CrewAI, and custom ReAct loops implement this pattern. The agent maintains a scratchpad of findings and iterates until it has enough context to answer confidently.",
    "## Graph RAG\n\nGraph RAG extracts entities and relationships from documents to build a knowledge graph, then uses graph traversal alongside vector retrieval. This enables multi-hop reasoning: 'What projects did the CEO of Company X's parent company approve?' requires traversing CEO -> Company X -> parent company -> projects. Microsoft's GraphRAG implementation creates community summaries at multiple hierarchy levels, enabling both local (specific entity) and global (corpus-wide theme) queries. Graph construction can be automated using LLMs for entity/relation extraction, though quality depends heavily on extraction accuracy.",
    "## Evaluation and Iteration\n\nAdvanced RAG systems require systematic evaluation. Key metrics include: **faithfulness** (is the answer grounded in retrieved context?), **answer relevance** (does it address the question?), **context relevance** (are retrieved docs pertinent?), and **context recall** (did retrieval find all needed information?). Frameworks like RAGAS, DeepEval, and custom LLM-as-judge pipelines automate these evaluations. The critical insight is that RAG evaluation must assess the retrieval and generation stages independently to identify bottlenecks.",
  ],
  deepDive: [
    "## Hybrid Search: Combining BM25 and Vector Retrieval\n\nPure vector search excels at semantic similarity but can miss exact keyword matches critical for domain-specific terms, product names, or codes. BM25 (the algorithm behind traditional search engines like Elasticsearch) is term-frequency based and handles exact matches well but fails at semantic understanding. **Hybrid search** runs both retrieval methods in parallel and merges results using **Reciprocal Rank Fusion (RRF)**: `score(d) = sum(1 / (k + rank_i(d)))` across all retriever rankings, where `k` is typically 60. This consistently outperforms either method alone. Production systems like Pinecone, Weaviate, and Qdrant offer built-in hybrid search. The weighting between sparse (BM25) and dense (vector) results can be tuned per use case -- technical documentation benefits from higher BM25 weight, while conversational queries benefit from higher vector weight.",
    "## Cross-Encoder Reranking\n\nBi-encoder retrieval (embedding query and documents independently, then computing cosine similarity) is fast but limited in accuracy because query and document don't interact during encoding. **Cross-encoders** take the query-document pair as a single input and produce a relevance score with full attention between them. This is dramatically more accurate but too slow for searching millions of documents. The standard pattern is a two-stage pipeline: (1) retrieve top-k candidates (k=50-100) using fast bi-encoder or hybrid search, (2) rerank with a cross-encoder and keep top-n (n=5-10). Models like `cross-encoder/ms-marco-MiniLM-L-12-v2` or Cohere Rerank provide strong reranking. Reranking typically improves nDCG@10 by 5-15% over retrieval alone.",
    "## Chunk Optimization Strategies\n\nChunking strategy profoundly affects retrieval quality. **Fixed-size chunking** (e.g., 512 tokens with 50-token overlap) is simple but splits content at arbitrary boundaries. **Semantic chunking** uses embedding similarity between sentences to find natural breakpoints, grouping semantically coherent passages. **Parent-child chunking** (also called small-to-big) embeds small chunks for precise retrieval but returns the larger parent chunk for context. **Proposition-based chunking** uses an LLM to decompose documents into atomic factual statements, each embedded independently. The optimal strategy depends on document type: structured docs (API references, legal contracts) benefit from section-aware chunking using headings, while narrative text benefits from semantic chunking. Always benchmark multiple strategies against your evaluation set -- there is no universal best chunk size.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Hybrid search with Reciprocal Rank Fusion (BM25 + vector) — C++ pseudocode",
      source: `#include <string>
#include <vector>
#include <algorithm>
#include <iostream>
#include <cmath>
#include <map>

struct Document {
    std::string page_content;
    std::map<std::string, std::string> metadata;
};

// Abstract base class for any retriever
class Retriever {
public:
    virtual ~Retriever() = default;
    virtual std::vector<Document> retrieve(const std::string& query, int k) = 0;
};

// BM25 sparse retriever (keyword-based)
class BM25Retriever : public Retriever {
    std::vector<Document> corpus;
public:
    explicit BM25Retriever(const std::vector<Document>& docs) : corpus(docs) {}

    std::vector<Document> retrieve(const std::string& query, int k) override {
        // In production: compute BM25 scores (TF-IDF variant) against corpus
        // Return top-k documents ranked by term-frequency relevance
        return std::vector<Document>(corpus.begin(),
            corpus.begin() + std::min(k, (int)corpus.size()));
    }
};

// Dense vector retriever (semantic similarity)
class VectorRetriever : public Retriever {
public:
    std::vector<Document> retrieve(const std::string& query, int k) override {
        // In production: embed query via embedding model, search FAISS/Qdrant index
        // Return top-k documents by cosine similarity
        return {};
    }
};

// Reciprocal Rank Fusion to merge ranked lists from multiple retrievers
class EnsembleRetriever {
    std::vector<Retriever*> retrievers;
    std::vector<double> weights;  // e.g., {0.4, 0.6}
    int rrf_k = 60;              // RRF constant

public:
    EnsembleRetriever(std::vector<Retriever*> ret, std::vector<double> w)
        : retrievers(std::move(ret)), weights(std::move(w)) {}

    std::vector<Document> invoke(const std::string& query, int k = 20) {
        // score(d) = sum_i( weight_i / (rrf_k + rank_i(d)) )
        std::map<std::string, double> fused_scores;
        std::map<std::string, Document> doc_map;

        for (size_t i = 0; i < retrievers.size(); ++i) {
            auto results = retrievers[i]->retrieve(query, k);
            for (int rank = 0; rank < (int)results.size(); ++rank) {
                const auto& key = results[rank].page_content;
                fused_scores[key] += weights[i] / (rrf_k + rank + 1);
                doc_map[key] = results[rank];
            }
        }

        // Sort by fused RRF score descending
        std::vector<std::pair<double, Document>> ranked;
        for (auto& [key, score] : fused_scores)
            ranked.push_back({score, doc_map[key]});
        std::sort(ranked.begin(), ranked.end(),
            [](auto& a, auto& b) { return a.first > b.first; });

        std::vector<Document> output;
        for (int i = 0; i < std::min(k, (int)ranked.size()); ++i)
            output.push_back(ranked[i].second);
        return output;
    }
};

int main() {
    std::vector<Document> documents = { /* loaded corpus */ };

    BM25Retriever bm25(documents);
    VectorRetriever vector_ret;

    // Combine with RRF: 0.4 weight for BM25, 0.6 for semantic
    EnsembleRetriever ensemble({&bm25, &vector_ret}, {0.4, 0.6});

    auto results = ensemble.invoke("How does attention work in transformers?");
    for (int i = 0; i < std::min(5, (int)results.size()); ++i)
        std::cout << results[i].page_content.substr(0, 200) << "\\n";
}`,
    },
    {
      language: "cpp",
      caption: "Two-stage retrieval with cross-encoder reranking — C++ pseudocode",
      source: `#include <string>
#include <vector>
#include <algorithm>
#include <iostream>
#include <iomanip>

struct Document {
    std::string page_content;
};

// Stage 1: Fast bi-encoder retrieval using a vector index
class BiEncoderRetriever {
public:
    std::vector<Document> similarity_search(const std::string& query, int k) {
        // In production: embed query, search FAISS/Chroma/Qdrant index
        // Returns top-k candidates ranked by cosine similarity
        return {};  // placeholder
    }
};

// Stage 2: Cross-encoder reranker for precise relevance scoring
class CrossEncoderReranker {
    // Model: e.g., "cross-encoder/ms-marco-MiniLM-L-12-v2"
public:
    // Score a query-document pair with full cross-attention
    double predict(const std::string& query, const std::string& document) {
        // In production: tokenize (query, document) as a single sequence,
        // run through a transformer model, return the relevance logit
        return 0.0;  // placeholder
    }

    // Batch scoring for efficiency
    std::vector<double> predict_batch(
        const std::string& query,
        const std::vector<Document>& documents
    ) {
        std::vector<double> scores;
        scores.reserve(documents.size());
        for (const auto& doc : documents)
            scores.push_back(predict(query, doc.page_content));
        return scores;
    }
};

int main() {
    BiEncoderRetriever retriever;
    CrossEncoderReranker reranker;

    std::string query = "What are the benefits of retrieval augmented generation?";

    // Stage 1: Retrieve top-50 candidates (fast, approximate)
    auto candidates = retriever.similarity_search(query, 50);

    // Stage 2: Rerank with cross-encoder (slow, precise)
    auto scores = reranker.predict_batch(query, candidates);

    // Pair scores with documents and sort descending
    std::vector<std::pair<double, Document>> ranked;
    for (size_t i = 0; i < candidates.size(); ++i)
        ranked.push_back({scores[i], candidates[i]});

    std::sort(ranked.begin(), ranked.end(),
        [](const auto& a, const auto& b) { return a.first > b.first; });

    // Keep top-5 after reranking
    for (int i = 0; i < std::min(5, (int)ranked.size()); ++i) {
        std::cout << std::fixed << std::setprecision(4)
                  << "Score: " << ranked[i].first << " | "
                  << ranked[i].second.page_content.substr(0, 100) << "\\n";
    }
}`,
    },
    {
      language: "cpp",
      caption: "Query decomposition pipeline — C++ pseudocode",
      source: `#include <string>
#include <vector>
#include <sstream>
#include <iostream>

struct Document {
    std::string page_content;
};

// Abstract LLM client — wraps API calls to a chat model
class LLMClient {
public:
    // Send a prompt and return the model's text response
    std::string complete(const std::string& prompt, double temperature = 0.0) {
        // In production: call chat completion API (e.g., Anthropic, OpenAI)
        // with the given prompt and temperature
        return "";  // placeholder
    }
};

// Retriever that searches a document index
class DocumentRetriever {
public:
    std::vector<Document> retrieve(const std::string& query, int k = 5) {
        // In production: embed query, search vector store, return top-k
        return {};  // placeholder
    }
};

// Retrieval QA: retrieve context, then generate an answer
class RetrievalQA {
    LLMClient& llm;
    DocumentRetriever& retriever;
public:
    RetrievalQA(LLMClient& l, DocumentRetriever& r) : llm(l), retriever(r) {}

    std::string answer(const std::string& query) {
        auto docs = retriever.retrieve(query, 5);
        std::string context;
        for (const auto& doc : docs)
            context += doc.page_content + "\\n";

        std::string prompt = "Context:\\n" + context +
            "\\nQuestion: " + query + "\\nAnswer:";
        return llm.complete(prompt);
    }
};

// Split a newline-separated string into individual lines
std::vector<std::string> split_lines(const std::string& text) {
    std::vector<std::string> lines;
    std::istringstream stream(text);
    std::string line;
    while (std::getline(stream, line))
        if (!line.empty()) lines.push_back(line);
    return lines;
}

int main() {
    LLMClient llm;
    DocumentRetriever retriever;
    RetrievalQA qa(llm, retriever);

    std::string question =
        "How does GraphRAG compare to standard RAG for multi-hop reasoning?";

    // Step 1: Decompose complex query into sub-questions
    std::string decompose_prompt =
        "Break the following question into 2-4 independent sub-questions\\n"
        "that can each be answered separately to address the original question.\\n"
        "Return each sub-question on a new line.\\n\\n"
        "Question: " + question + "\\nSub-questions:";

    std::string decomposition = llm.complete(decompose_prompt);
    auto sub_questions = split_lines(decomposition);

    // Step 2: Retrieve and answer each sub-question independently
    std::vector<std::string> sub_answers;
    for (const auto& sub_q : sub_questions) {
        std::string answer = qa.answer(sub_q);
        sub_answers.push_back("Q: " + sub_q + "\\nA: " + answer);
    }

    // Step 3: Synthesize sub-answers into final answer
    std::string combined;
    for (const auto& sa : sub_answers)
        combined += sa + "\\n\\n";

    std::string synthesis_prompt =
        "Given these sub-questions and answers, provide a comprehensive\\n"
        "answer to the original question.\\n\\n"
        "Original question: " + question + "\\n\\n"
        "Sub-answers:\\n" + combined + "\\n"
        "Final answer:";

    std::string final_answer = llm.complete(synthesis_prompt);
    std::cout << final_answer << "\\n";
}`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Naive RAG", "Advanced RAG", "Agentic RAG", "Graph RAG"],
    rows: [
      ["Query handling", "Pass-through (raw query)", "Rewriting, decomposition, HyDE", "Agent decides strategy per query", "Entity-aware query routing"],
      ["Retrieval", "Single vector search", "Hybrid search + reranking", "Multi-step, multi-source, iterative", "Graph traversal + vector search"],
      ["Reasoning", "Single-hop (one passage)", "Multi-query fusion", "Multi-hop via reasoning loop", "Multi-hop via graph edges"],
      ["Adaptability", "Fixed pipeline", "Configurable pipeline stages", "Dynamic tool selection", "Schema-driven traversal"],
      ["Best for", "Simple factual Q&A", "Complex queries, domain search", "Open-ended research, multi-source", "Entity relationships, global themes"],
      ["Latency", "Low (1 retrieval + 1 LLM call)", "Medium (rewrite + retrieve + rerank + generate)", "High (multiple reasoning iterations)", "Medium-High (graph construction + traversal)"],
      ["Implementation complexity", "Low", "Medium", "High", "High (graph construction pipeline)"],
    ],
  },
  diagrams: [
    {
      title: "Advanced RAG Pipeline Architecture",
      kind: "architecture" as const,
      caption: "End-to-end architecture showing query rewriting, hybrid retrieval, cross-encoder reranking, and augmented generation stages with feedback loops for evaluation.",
    },
    {
      title: "Query Rewriting Flow",
      kind: "flow" as const,
      caption: "Decision flow for query transformation: raw query is analyzed, then routed through decomposition, HyDE, step-back prompting, or contextual reformulation based on query characteristics.",
    },
  ],
  animations: [
    {
      title: "HyDE Retrieval Process",
      steps: [
        { label: "Receive user query", detail: "The user submits a natural language question, e.g., 'What causes gradient vanishing in deep networks?'" },
        { label: "Generate hypothetical answer", detail: "The LLM generates a plausible but unverified answer to the query without any retrieved context. This answer uses vocabulary and structure similar to real documents." },
        { label: "Embed the hypothetical answer", detail: "The hypothetical answer is passed through the same embedding model used for the document index, producing a dense vector representation." },
        { label: "Retrieve real documents", detail: "The hypothetical answer's embedding is used to search the vector store. Because it resembles real answers in structure, it retrieves more relevant documents than the original question embedding would." },
        { label: "Generate grounded answer", detail: "The retrieved real documents are passed as context to the LLM, which generates a final answer grounded in actual sources rather than the hypothetical one." },
      ],
    },
  ],
  interviewQA: [
    {
      q: "How does HyDE improve retrieval over standard query embedding?",
      a: "HyDE generates a hypothetical answer using the LLM, then embeds that answer instead of the raw query. Since the hypothetical answer resembles real answers in vocabulary and structure, its embedding is closer to relevant documents in vector space than the question embedding would be. This bridges the asymmetry between how questions and answers are phrased. The trade-off is one additional LLM call before retrieval, adding latency.",
    },
    {
      q: "What makes agentic RAG different from a standard RAG pipeline?",
      a: "Standard RAG follows a fixed retrieve-then-generate pipeline. Agentic RAG gives the LLM agency: it decides whether to retrieve, which sources to query, evaluates result quality, and can re-retrieve or use other tools. The LLM operates in a reasoning loop (like ReAct), maintaining state across steps. This handles complex queries that require multiple retrieval rounds, cross-source synthesis, or fallback to alternative data sources.",
    },
    {
      q: "When would you use Graph RAG over standard vector RAG?",
      a: "Graph RAG excels when answers require multi-hop reasoning across entities and relationships, when the corpus has rich structured relationships (org charts, supply chains, legal hierarchies), or when you need corpus-wide thematic summaries rather than specific passage retrieval. Standard vector RAG is better for direct factual questions where a single passage contains the answer.",
    },
    {
      q: "How do you evaluate a RAG system end-to-end?",
      a: "Evaluate retrieval and generation independently. For retrieval: measure context precision, context recall, and relevance of retrieved chunks. For generation: measure faithfulness (grounding in context), answer relevance, and hallucination rate. Use frameworks like RAGAS with LLM-as-judge for automated evaluation. Compare against a labeled test set of question-answer-context triples. Track metrics per query type to identify specific failure patterns.",
    },
  ],
  mcqs: [
    {
      q: "What is the main insight behind HyDE?",
      options: [
        "Questions and answers have identical embeddings",
        "A hypothetical answer's embedding is closer to real answers than the question's embedding",
        "Generating hypothetical answers eliminates the need for a vector database",
        "HyDE replaces the need for chunking documents",
      ],
      answerIndex: 1,
      explanation:
        "HyDE exploits the fact that a generated (hypothetical) answer uses vocabulary and phrasing similar to real answers, producing an embedding that is closer to relevant documents than the original question embedding.",
    },
    {
      q: "Which technique breaks a complex question into simpler sub-questions before retrieval?",
      options: [
        "HyDE",
        "Query decomposition",
        "Graph RAG",
        "Reciprocal Rank Fusion",
      ],
      answerIndex: 1,
      explanation:
        "Query decomposition splits a complex multi-part question into independent sub-questions, retrieves for each, and merges the results to answer the original question comprehensively.",
    },
    {
      q: "What does Graph RAG enable that flat vector retrieval cannot?",
      options: [
        "Faster embedding generation",
        "Multi-hop reasoning across entity relationships",
        "Lower latency retrieval",
        "Smaller index sizes",
      ],
      answerIndex: 1,
      explanation:
        "Graph RAG builds a knowledge graph of entities and relationships, enabling traversal across multiple hops (e.g., person -> company -> parent company -> projects) that flat document retrieval cannot achieve.",
    },
    {
      q: "In RAG evaluation, what does 'faithfulness' measure?",
      options: [
        "Whether the query was correctly rewritten",
        "Whether the answer is grounded in the retrieved context",
        "Whether all relevant documents were retrieved",
        "Whether the embedding model is accurate",
      ],
      answerIndex: 1,
      explanation:
        "Faithfulness measures whether the generated answer is supported by and grounded in the retrieved context, detecting hallucinations where the model generates claims not present in the provided documents.",
    },
  ],
  flashcards: [
    { front: "What is query decomposition?", back: "Breaking a complex multi-part question into simpler sub-questions, retrieving for each independently, then merging results to answer the original question." },
    { front: "What does HyDE stand for?", back: "Hypothetical Document Embeddings. The LLM generates a hypothetical answer, which is embedded and used to retrieve real documents." },
    { front: "What is step-back prompting in RAG?", back: "Generating a broader, more general question from the original query to retrieve background context that helps answer the specific question." },
    { front: "What is agentic RAG?", back: "A RAG architecture where the LLM decides when, how, and what to retrieve in a reasoning loop, rather than following a fixed retrieve-then-generate pipeline." },
    { front: "What is RAGAS?", back: "An open-source framework for evaluating RAG systems, measuring faithfulness, answer relevance, context precision, and context recall using LLM-as-judge." },
    { front: "What are community summaries in GraphRAG?", back: "Hierarchical summaries of entity clusters (communities) in the knowledge graph, enabling global queries about corpus-wide themes rather than just local entity lookups." },
    { front: "What is contextual reformulation?", back: "Rewriting a conversational follow-up query to be standalone by incorporating relevant context from chat history, so the retriever can process it without conversation context." },
  ],
  followUps: [
    "How do you tune the weighting between BM25 and vector retrieval in hybrid search for different domains?",
    "What are the trade-offs between cross-encoder reranking and ColBERT-style late interaction models?",
    "How does RAPTOR (tree-based recursive summarization) compare to standard chunking strategies for long documents?",
    "When should you use a fine-tuned embedding model vs. an off-the-shelf one for domain-specific RAG?",
    "How do you handle RAG over structured data (tables, databases) vs. unstructured text?",
  ],
  exercises: [
    "Build a hybrid search pipeline using LangChain's `EnsembleRetriever` with BM25 and FAISS, then compare retrieval quality against pure vector search on 20 test queries using nDCG@10.",
    "Implement a two-stage retrieval system with a bi-encoder for candidate generation and a cross-encoder for reranking. Measure the improvement in answer relevance using RAGAS.",
    "Create a query decomposition pipeline that breaks complex questions into sub-questions, retrieves for each, and synthesizes a final answer. Test with multi-hop questions.",
    "Compare three chunking strategies (fixed-size 512 tokens, semantic chunking, parent-child chunking) on a technical documentation corpus and measure retrieval precision and recall.",
    "Build a simple evaluation harness using RAGAS to measure faithfulness, answer relevance, context precision, and context recall across a test set of 50 question-answer pairs.",
  ],
  cheatSheet: [
    "**Hybrid search**: Combine BM25 (exact match) + vector (semantic) with Reciprocal Rank Fusion; use `weights=[0.4, 0.6]` as a starting point.",
    "**Reranking**: Retrieve top-50 with bi-encoder, rerank to top-5 with cross-encoder (`cross-encoder/ms-marco-MiniLM-L-12-v2`).",
    "**HyDE**: Generate hypothetical answer -> embed it -> retrieve with that embedding. Adds one LLM call of latency.",
    "**Query decomposition**: Break complex question into 2-4 sub-questions, retrieve and answer each, then synthesize.",
    "**Chunk sizes**: Start with 512 tokens, 50-token overlap. Use semantic chunking for narrative text, section-aware for structured docs.",
    "**Evaluation metrics**: Faithfulness (grounding), answer relevance, context precision, context recall. Use RAGAS or DeepEval.",
    "**Parent-child chunking**: Embed small chunks (128 tokens) for precision, return parent chunk (512-1024 tokens) for context.",
    "**Step-back prompting**: Generate a broader question first to retrieve background context, then answer the specific question.",
  ],
  revisionNotes: [
    "Advanced RAG improves on naive RAG at three stages: **pre-retrieval** (query rewriting, HyDE, decomposition), **retrieval** (hybrid search, multi-index), and **post-retrieval** (reranking, compression, filtering).",
    "**Hybrid search** with RRF consistently outperforms pure vector or pure keyword search across benchmarks.",
    "**Cross-encoders** are 5-15% more accurate than bi-encoders for relevance scoring but 100x slower, so use them only for reranking a small candidate set.",
    "**HyDE** works because hypothetical answers are closer in embedding space to real answers than questions are, but it adds latency and can mislead retrieval if the hypothetical answer is poor.",
    "**Agentic RAG** uses a ReAct loop where the LLM decides when to retrieve, what to query, and whether results are sufficient before generating.",
    "**Graph RAG** enables multi-hop reasoning by extracting entities and relationships into a knowledge graph, supporting queries that require traversing multiple edges.",
    "**Chunking strategy** has outsized impact on retrieval quality. Always benchmark multiple strategies; there is no universal best chunk size.",
    "**RAG evaluation** must assess retrieval and generation independently. Use RAGAS metrics: faithfulness, answer relevance, context precision, context recall.",
  ],
  resources: [
    { label: "Gao et al. - Retrieval-Augmented Generation for Large Language Models: A Survey", kind: "paper" as const, note: "Comprehensive survey covering the full taxonomy of RAG techniques including advanced retrieval, augmentation, and generation strategies." },
    { label: "LangChain RAG Documentation", kind: "docs" as const, note: "Official guides for building RAG pipelines with hybrid search, reranking, query transformations, and evaluation using LangChain." },
    { label: "RAGAS Documentation", kind: "docs" as const, note: "Framework for evaluating RAG pipelines with metrics for faithfulness, answer relevance, context precision, and context recall." },
    { label: "Sentence-Transformers: Cross-Encoders", kind: "repo" as const, note: "Library providing pre-trained cross-encoder models for reranking, with examples for information retrieval and semantic search." },
    { label: "Microsoft GraphRAG", kind: "repo" as const, note: "Microsoft's implementation of Graph RAG using LLM-extracted knowledge graphs with community summaries for local and global queries." },
  ],
  glossary: [
    { term: "Query Rewriting", definition: "Using an LLM to transform a raw user query into one or more retrieval-optimized queries before searching the document index." },
    { term: "HyDE", definition: "Hypothetical Document Embeddings. A technique where a generated hypothetical answer is embedded to retrieve real documents with higher relevance." },
    { term: "Agentic RAG", definition: "A RAG architecture where an LLM agent autonomously decides retrieval strategy, evaluates results, and iterates until sufficient context is gathered." },
    { term: "Graph RAG", definition: "Combining knowledge graph construction with retrieval to enable multi-hop reasoning over entity relationships extracted from documents." },
    { term: "Faithfulness", definition: "A RAG evaluation metric measuring whether the generated answer is supported by the retrieved context, detecting hallucinations." },
    { term: "ReAct", definition: "Reasoning and Acting. A prompting pattern where the LLM alternates between reasoning steps and tool/action invocations." },
    { term: "Context Recall", definition: "The fraction of information needed to answer a question that was successfully retrieved from the corpus." },
  ],
};
