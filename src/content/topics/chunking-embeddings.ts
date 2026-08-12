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
  followUps: [
    "What is small-to-big retrieval and what problem does it solve?",
    "How do you chunk a document containing tables and code?",
    "What has to happen when you change embedding model?",
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
  resources: [
    {
      label: "Anthropic engineering — Contextual Retrieval",
      kind: "article",
    },
    {
      label: "MTEB: Massive Text Embedding Benchmark — Muennighoff et al., 2022",
      kind: "paper",
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
      language: "typescript",
      caption: "Recursive splitting — break on the most semantic boundary that fits",
      source: `type Chunk = { text: string; index: number; sourceId: string };

/**
 * Try separators in order of how much meaning they preserve: paragraphs
 * before sentences, sentences before words. Splitting mid-sentence is a last
 * resort because it produces chunks that embed poorly.
 */
export function recursiveSplit(
  text: string,
  { chunkSize = 400, overlap = 60 }: { chunkSize?: number; overlap?: number } = {}
): string[] {
  const separators = ["\\n\\n", "\\n", ". ", " "];

  function split(input: string, depth = 0): string[] {
    if (input.length <= chunkSize) return [input];
    if (depth >= separators.length) {
      // No separator left — hard-cut with overlap.
      const out: string[] = [];
      for (let i = 0; i < input.length; i += chunkSize - overlap) {
        out.push(input.slice(i, i + chunkSize));
      }
      return out;
    }

    const parts = input.split(separators[depth]);
    const chunks: string[] = [];
    let buf = "";

    for (const part of parts) {
      const candidate = buf ? buf + separators[depth] + part : part;
      if (candidate.length <= chunkSize) {
        buf = candidate;
      } else {
        if (buf) chunks.push(buf);
        buf = part.length > chunkSize ? "" : part;
        if (part.length > chunkSize) chunks.push(...split(part, depth + 1));
      }
    }
    if (buf) chunks.push(buf);
    return chunks;
  }

  return split(text).filter((c) => c.trim().length > 0);
}

// Overlap exists so a fact sitting on a boundary appears whole in one chunk.
// Without it, "the refund window is" ends one chunk and "30 days" starts the
// next, and neither retrieves usefully.`,
    },
    {
      language: "typescript",
      caption: "Small-to-big — embed precisely, return with context",
      source: `type Parent = { id: string; text: string };
type Child = { id: string; parentId: string; text: string; vector: number[] };

/**
 * The tension: small chunks match precisely but lose context; large chunks
 * keep context but their embedding averages several topics and matches nothing
 * strongly. Small-to-big refuses the trade — embed small, return big.
 */
export async function buildIndex(parents: Parent[]) {
  const children: Child[] = [];

  for (const parent of parents) {
    const pieces = recursiveSplit(parent.text, { chunkSize: 300, overlap: 40 });
    const vectors = await embedAll(pieces);

    pieces.forEach((text, i) => {
      children.push({
        id: \`\${parent.id}::\${i}\`,
        parentId: parent.id,   // the link that makes this work
        text,
        vector: vectors[i],
      });
    });
  }
  return children;
}

export async function retrieve(query: string, children: Child[], parents: Map<string, Parent>, k = 4) {
  const [q] = await embedAll([query]);

  const scored = children
    .map((c) => ({ child: c, score: cosine(q, c.vector) }))
    .sort((a, b) => b.score - a.score);

  // Match on the small chunk, but hand the model the PARENT section, and
  // de-duplicate — several children often share one parent.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { child } of scored) {
    if (seen.has(child.parentId)) continue;
    seen.add(child.parentId);
    const parent = parents.get(child.parentId);
    if (parent) out.push(parent.text);
    if (out.length >= k) break;
  }
  return out;
}

// Contextual retrieval is the other big win here: prepend a one-line,
// LLM-generated summary of the parent document to each child BEFORE embedding.
// It gives the small chunk enough context to be found by queries that never
// mention the terms in that chunk.`,
    },
  ],

  diagrams: [
    {
      title: "Chunking and Embedding Pipeline",
      kind: "flow",
      caption: "End-to-end pipeline from raw documents through chunking, embedding, and storage for vector search.",
      mermaid: `flowchart TD
    A["Raw Documents"] --> B["Pre-process and Clean"]
    B --> C{"Chunking Strategy"}
    C -->|Fixed size| D["Fixed-size Chunks"]
    C -->|Semantic| E["Sentence or Paragraph Chunks"]
    C -->|Recursive| F["Recursive Character Split"]
    D & E & F --> G["Add Metadata and Context"]
    G --> H["Embedding Model"]
    H --> I["Dense Vectors"]
    I --> J["Vector Store"]
    J --> K["Index Built"]`,
    },
    {
      title: "Retrieval-Augmented Generation Architecture",
      kind: "architecture",
      caption: "Architecture of a RAG system showing how chunked embeddings power semantic retrieval at query time.",
      mermaid: `graph LR
    subgraph Ingestion["Ingestion Pipeline"]
        DOC["Documents"]
        CHUNK["Chunker"]
        EMBED["Embedding Model"]
        VS["Vector Store"]
    end
    subgraph Query["Query Pipeline"]
        Q["User Query"]
        QE["Query Embedder"]
        RET["Retriever"]
        CTX["Context Builder"]
        LLM["LLM"]
        ANS["Answer"]
    end
    DOC --> CHUNK --> EMBED --> VS
    Q --> QE --> RET
    VS --> RET
    RET --> CTX --> LLM --> ANS`,
    },
    {
      title: "Chunking Strategy Comparison",
      kind: "mindmap",
      caption: "Overview of chunking strategies and their trade-offs for different document types.",
      mermaid: `mindmap
  root((Chunking Strategies))
    Fixed Size
      Simple to implement
      May split sentences
      Overlap parameter
    Sentence-based
      Preserves meaning
      Variable size
      NLP tokenizer needed
    Recursive
      Tries multiple separators
      Respects structure
      Configurable hierarchy
    Semantic
      Groups related content
      Highest quality
      Slowest to compute
    Document-based
      Respects headings
      Metadata-aware`,
    },
    {
      title: "Embedding Similarity Search",
      kind: "sequence",
      caption: "Sequence of operations when a user query is embedded and matched against stored document chunks.",
      mermaid: `sequenceDiagram
    participant U as User
    participant API as API Layer
    participant EM as Embedding Model
    participant VS as Vector Store
    participant LLM as Language Model
    U->>API: Submit query
    API->>EM: Embed query text
    EM-->>API: Query vector
    API->>VS: ANN search top-k
    VS-->>API: Ranked chunks with scores
    API->>LLM: Query + retrieved context
    LLM-->>API: Generated answer
    API-->>U: Return answer with sources`,
    },
  ],

  animations: [
    {
      title: "Small-to-big retrieval",
      steps: [
        {
          label: "The tension",
          detail: "Small chunks match precisely but lack context; large chunks have context but match weakly.",
        },
        {
          label: "Split small",
          detail: "300-token chunks, embedded individually. Each has a focused embedding.",
        },
        {
          label: "Keep the link",
          detail: "Each small chunk records which parent section it came from.",
        },
        {
          label: "Retrieve small",
          detail: "The query matches a precise chunk — high precision, because the embedding isn't diluted.",
        },
        {
          label: "Return big",
          detail: "The parent section is passed to the model, so it has the surrounding context to interpret it.",
        },
        {
          label: "Result",
          detail: "Precise matching and complete context, instead of trading one for the other.",
        },
      ],
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
