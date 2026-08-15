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
      language: "typescript",
      caption: "Query rewriting — a conversational follow-up is not a search query",
      source: `import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

type Turn = { role: "user" | "assistant"; content: string };

/**
 * "What about the enterprise plan?" retrieves nothing useful on its own. It has
 * to be folded into a standalone query against the conversation so far. This is
 * mandatory for any chat-over-documents product and is the single most common
 * omission.
 */
export async function rewriteStandalone(history: Turn[], question: string): Promise<string> {
  if (history.length === 0) return question;

  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // small model: this is a cheap, easy task
    max_tokens: 200,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          "Rewrite the final question so it stands alone, resolving pronouns and",
          "implied subjects from the conversation. Change nothing else. Output",
          "only the rewritten question.",
          "",
          history.map((t) => \`\${t.role}: \${t.content}\`).join("\\n"),
          \`user: \${question}\`,
        ].join("\\n"),
      },
    ],
  });

  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text.trim() : question;
}

/**
 * HyDE — embed a hypothetical ANSWER rather than the question.
 * The reasoning: a question is often more similar to other questions than to
 * its answer, while a plausible answer looks structurally like the document
 * you are hunting for. Costs one extra call; use it when recall is measurably
 * the bottleneck, not by default.
 */
export async function hyde(question: string): Promise<string> {
  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: \`Write a short passage that would answer this question, as if
from internal documentation. Invented specifics are fine — it is used only as
a search key, never shown to a user.

Question: \${question}\`,
    }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : question;
}`,
    },
    {
      language: "typescript",
      caption: "Query decomposition for multi-hop questions",
      source: `/**
 * "How does our refund policy differ between the UK and Germany, and which
 * changed most recently?" cannot be answered by top-k retrieval on one query —
 * the answer lives in several documents and requires comparing them.
 */
export async function answerMultiHop(question: string) {
  const subQuestions = await decompose(question); // -> ["UK refund policy", "Germany refund policy", ...]

  // Independent sub-questions retrieve concurrently.
  const contexts = await Promise.all(
    subQuestions.map(async (sub) => ({
      question: sub,
      chunks: await retrieveAndRerank(sub, 3),
    }))
  );

  const grounding = contexts
    .map((c) => \`## \${c.question}\\n\${c.chunks.map((k) => k.text).join("\\n\\n")}\`)
    .join("\\n\\n");

  return client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: "Answer only from the provided context. Cite the section you used for each claim. If the context does not answer part of the question, say so explicitly.",
    messages: [{ role: "user", content: \`\${grounding}\\n\\nQuestion: \${question}\` }],
  });
}

// Cost check before reaching for this: decomposition is one extra call, and
// each sub-question is its own retrieval plus rerank. On a 3-way split that is
// roughly 4x the cost and latency of a single-hop query. Route to it only when
// the question actually needs it — a classifier or a simple heuristic on
// conjunctions and comparatives is usually enough.`,
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
      caption: "End-to-end pipeline from raw query through rewriting, hybrid retrieval, reranking, context assembly, and augmented generation.",
      mermaid: `flowchart TD
    Q["User Query"]
    RW["Query Rewriter"]
    DENSE["Dense Retriever"]
    SPARSE["Sparse Retriever"]
    FUSE["Result Fusion"]
    RERANK["Cross-Encoder Reranker"]
    CTX["Context Assembler"]
    GEN["LLM Generator"]
    OUT["Final Answer"]
    Q --> RW --> DENSE & SPARSE
    DENSE --> FUSE
    SPARSE --> FUSE
    FUSE --> RERANK --> CTX --> GEN --> OUT`,
    },
    {
      title: "Query Rewriting Decision Flow",
      kind: "flow" as const,
      caption: "Incoming queries are classified and routed to the most appropriate transformation strategy before retrieval.",
      mermaid: `flowchart TD
    Q["Raw Query"]
    ANALYZE["Analyse Query"]
    COMPLEX{"Complex?"}
    AMBIG{"Ambiguous?"}
    HYDE["HyDE Generation"]
    DECOMP["Sub-query Decomposition"]
    STEPBACK["Step-Back Prompting"]
    REFORM["Contextual Reformulation"]
    RETRIEVE["Proceed to Retrieval"]
    Q --> ANALYZE --> COMPLEX
    COMPLEX -- "Yes" --> DECOMP --> RETRIEVE
    COMPLEX -- "No" --> AMBIG
    AMBIG -- "Yes" --> STEPBACK --> RETRIEVE
    AMBIG -- "No" --> HYDE --> RETRIEVE
    REFORM --> RETRIEVE`,
    },
    {
      title: "Query-Retrieve-Augment-Generate Sequence",
      kind: "sequence",
      caption: "Step-by-step interaction between the user, query processor, vector store, reranker, and LLM during a RAG request.",
      mermaid: `sequenceDiagram
    participant U as User
    participant QP as Query Processor
    participant VS as Vector Store
    participant RR as Reranker
    participant LLM as LLM
    U->>QP: submit question
    QP->>VS: embed + search
    VS-->>QP: top-k chunks
    QP->>RR: rerank chunks
    RR-->>QP: ordered results
    QP->>LLM: prompt + context
    LLM-->>U: grounded answer`,
    },
    {
      title: "Advanced RAG Techniques",
      kind: "mindmap",
      caption: "Taxonomy of techniques that improve retrieval quality, generation grounding, and overall RAG system performance.",
      mermaid: `mindmap
  root["Advanced RAG"]
    Query Enhancement
      HyDE
      Step-Back Prompting
      Sub-query Decomposition
    Retrieval
      Hybrid Search
      Multi-vector Retrieval
      Contextual Chunking
    Reranking
      Cross-Encoder
      Reciprocal Rank Fusion
    Generation
      Self-RAG
      FLARE
      Iterative Retrieval`,
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
    { label: "Gao et al. - Retrieval-Augmented Generation for Large Language Models: A Survey", url: "https://arxiv.org/abs/2005.11401", kind: "paper" as const, note: "Comprehensive survey covering the full taxonomy of RAG techniques including advanced retrieval, augmentation, and generation strategies." },
    { label: "LangChain RAG Documentation", url: "https://python.langchain.com/docs/", kind: "docs" as const, note: "Official guides for building RAG pipelines with hybrid search, reranking, query transformations, and evaluation using LangChain." },
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
