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
