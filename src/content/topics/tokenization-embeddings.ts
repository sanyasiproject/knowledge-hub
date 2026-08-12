import type { TopicContent } from "../types";

export const tokenizationEmbeddings: TopicContent = {
  quickSummary: [
    "Tokenization converts raw text into discrete token IDs that a model can process, using subword algorithms like BPE or WordPiece to balance vocabulary size with coverage.",
    "Byte Pair Encoding (BPE) iteratively merges the most frequent adjacent byte/character pairs to build a vocabulary of subword units.",
    "Embeddings map discrete tokens into continuous high-dimensional vector spaces where semantic similarity is captured by geometric proximity.",
    "Vector similarity metrics like cosine similarity and dot product enable searching, clustering, and comparing meaning across text segments.",
  ],
  detailed: [
    `## Byte Pair Encoding (BPE)

BPE starts with individual characters (or bytes) and iteratively merges the most frequent adjacent pair into a new token. This process repeats until the desired vocabulary size is reached.

Example: given the corpus "low lower lowest", BPE might merge "l" + "o" into "lo", then "lo" + "w" into "low", building common subwords.

Advantages:
- Handles any input text, including rare words and new terms, by breaking them into known subword pieces
- Balances vocabulary size (typically 32k-100k) with sequence length
- Language-agnostic: works across scripts and languages

GPT-style models use BPE (often byte-level BPE, operating on UTF-8 bytes rather than Unicode characters). The tiktoken library implements the tokenizer used by OpenAI models.`,

    `## WordPiece and SentencePiece

**WordPiece** (used by BERT) is similar to BPE but selects merges that maximize the likelihood of the training corpus rather than just frequency. Subword pieces that are not word-initial are prefixed with "##" (e.g., "playing" becomes "play" + "##ing").

**SentencePiece** treats the input as a raw byte stream without pre-tokenization into words. It applies BPE or Unigram algorithms directly, making it truly language-agnostic and suitable for multilingual models. It is used by T5, LLaMA, and many multilingual models.

**Unigram** tokenization starts with a large vocabulary and iteratively removes tokens that least affect the training corpus likelihood, producing a probabilistic model over subword segments.`,

    `## Embedding Spaces

An embedding is a dense vector (typically 256 to 4096 dimensions) that represents a token, word, sentence, or document in continuous space.

Key properties of well-trained embedding spaces:
- **Semantic similarity**: similar meanings cluster together (e.g., "king" and "monarch" are nearby)
- **Analogies**: vector arithmetic captures relationships (e.g., king - man + woman approximates queen)
- **Compositionality**: sentence embeddings aggregate token-level information into a single vector

Word embeddings (Word2Vec, GloVe) are static -- each word has one vector regardless of context. Contextual embeddings from Transformer models produce different vectors for the same word depending on surrounding text ("bank" in "river bank" vs "bank account").`,

    `## Vector Similarity Metrics

**Cosine similarity** measures the angle between two vectors: cos(A, B) = (A . B) / (||A|| * ||B||). It ranges from -1 to 1 and is direction-sensitive, ignoring magnitude. Most commonly used for text similarity.

**Dot product** (inner product) = A . B. It captures both direction and magnitude. Faster to compute but sensitive to vector norms.

**Euclidean distance** measures the straight-line distance between vectors. Lower distance means higher similarity. Less common for high-dimensional embeddings because distances tend to converge.

**Choosing a metric**: cosine similarity is the default for normalized embeddings. If embeddings are already L2-normalized (unit vectors), cosine similarity and dot product are equivalent. Most embedding models output normalized vectors.`,

    `## Practical Considerations

**Embedding models**: dedicated models like text-embedding-ada-002, Cohere Embed, and open-source options (BGE, E5, GTE) are trained specifically for producing high-quality sentence embeddings. They differ from LLMs in that they are optimized for representation quality, not generation.

**Dimensionality**: higher dimensions capture more nuance but increase storage and compute costs. Matryoshka Representation Learning allows truncating vectors to fewer dimensions with graceful degradation.

**Tokenizer-model coupling**: each model has its own tokenizer. Using a mismatched tokenizer produces garbage. Always use the tokenizer that came with the model.

**Token limits**: embedding models have maximum input lengths (typically 512 to 8192 tokens). Text exceeding the limit must be chunked before embedding.`,
  ],
  interviewQA: [
    {
      q: "How does BPE handle a word it has never seen during training?",
      a: "BPE breaks the unknown word into the longest matching subword pieces from its vocabulary. Since the vocabulary always includes individual characters or bytes as a fallback, any input can be tokenized. The word is represented as a sequence of known subword tokens, which the model processes using its learned representations for those pieces.",
    },
    {
      q: "What is the difference between static and contextual embeddings?",
      a: "Static embeddings like Word2Vec assign a single fixed vector to each word regardless of context. Contextual embeddings from Transformer models produce different vectors for the same word based on its surrounding text. For example, 'bank' gets different representations in 'river bank' and 'bank account'. Contextual embeddings are more expressive but require a forward pass through the model.",
    },
    {
      q: "Why is cosine similarity preferred over Euclidean distance for text embeddings?",
      a: "Cosine similarity measures the angle between vectors, focusing on direction rather than magnitude. In high-dimensional spaces, Euclidean distances tend to converge (the curse of dimensionality), making them less discriminative. Cosine similarity is also invariant to vector length, so documents of different sizes can be compared fairly. Most embedding models produce normalized vectors, making cosine similarity both effective and efficient.",
    },
    {
      q: "What happens if you use the wrong tokenizer with a model?",
      a: "The token IDs will not correspond to the embeddings the model learned. A token ID that meant 'hello' in the correct tokenizer might map to a completely different subword in the wrong one. The model's output will be nonsensical. Always use the tokenizer that was paired with the model during training.",
    },
  ],
  followUps: [
    "Why do code and non-English text cost more tokens?",
    "Can you compare embeddings from two different models?",
    "Why isn't high cosine similarity the same as relevance?",
  ],
  mcqs: [
    {
      q: "What does BPE start with before any merges?",
      options: [
        "Complete words from a dictionary",
        "Individual characters or bytes",
        "Pre-defined subword units",
        "Sentence-level tokens",
      ],
      answerIndex: 1,
      explanation:
        "BPE initializes the vocabulary with individual characters (or bytes in byte-level BPE) and builds up subword tokens by iteratively merging the most frequent pairs.",
    },
    {
      q: "Which similarity metric is invariant to vector magnitude?",
      options: [
        "Dot product",
        "Euclidean distance",
        "Cosine similarity",
        "Manhattan distance",
      ],
      answerIndex: 2,
      explanation:
        "Cosine similarity measures the angle between vectors, so scaling a vector's magnitude does not change the result.",
    },
    {
      q: "What distinguishes WordPiece from BPE?",
      options: [
        "WordPiece uses character-level tokenization only",
        "WordPiece selects merges based on likelihood maximization rather than frequency",
        "WordPiece does not support subword tokenization",
        "WordPiece requires pre-training on labeled data",
      ],
      answerIndex: 1,
      explanation:
        "While BPE merges the most frequent pair, WordPiece selects the merge that maximizes the likelihood of the training corpus.",
    },
    {
      q: "What is Matryoshka Representation Learning?",
      options: [
        "A technique for training models on nested datasets",
        "An approach where embeddings can be truncated to fewer dimensions with graceful quality degradation",
        "A multi-language tokenization strategy",
        "A method to compress model weights",
      ],
      answerIndex: 1,
      explanation:
        "Matryoshka embeddings are trained so that the first d dimensions of the full vector are themselves a useful embedding, allowing flexible dimensionality reduction.",
    },
  ],
  flashcards: [
    {
      front: "What does BPE stand for?",
      back: "Byte Pair Encoding -- a subword tokenization algorithm that iteratively merges the most frequent adjacent pairs.",
    },
    {
      front: "What prefix does WordPiece use for non-initial subwords?",
      back: "## (double hash), e.g., 'playing' becomes 'play' + '##ing'.",
    },
    {
      front: "What is the range of cosine similarity?",
      back: "-1 to 1, where 1 means identical direction, 0 means orthogonal, and -1 means opposite.",
    },
    {
      front: "What are contextual embeddings?",
      back: "Embeddings from Transformer models that produce different vectors for the same word depending on its surrounding context.",
    },
    {
      front: "Why must you use the correct tokenizer for a given model?",
      back: "Token IDs are model-specific. A mismatched tokenizer maps IDs to wrong embeddings, producing nonsensical output.",
    },
    {
      front: "What is SentencePiece?",
      back: "A tokenization framework that operates on raw byte streams without language-specific pre-tokenization, used by T5 and LLaMA.",
    },
    {
      front: "What is a typical embedding dimension range for modern models?",
      back: "256 to 4096 dimensions, balancing representational capacity against storage and compute costs.",
    },
  ],
  resources: [
    {
      label: "Neural Machine Translation of Rare Words with Subword Units (BPE) — Sennrich et al., 2016",
      kind: "paper",
    },
    {
      label: "SentencePiece — Kudo & Richardson, 2018",
      kind: "paper",
    },
  ],
  glossary: [
    {
      term: "BPE (Byte Pair Encoding)",
      definition: "A subword tokenization algorithm that iteratively merges the most frequent adjacent pairs of characters or bytes.",
    },
    {
      term: "WordPiece",
      definition: "A subword tokenization algorithm that selects merges maximizing training corpus likelihood, used by BERT.",
    },
    {
      term: "SentencePiece",
      definition: "A language-agnostic tokenization framework that operates directly on raw byte streams.",
    },
    {
      term: "Embedding",
      definition: "A dense vector representation of a token, word, or text segment in continuous high-dimensional space.",
    },
    {
      term: "Cosine Similarity",
      definition: "A metric measuring the cosine of the angle between two vectors, capturing directional similarity independent of magnitude.",
    },
    {
      term: "Contextual Embedding",
      definition: "An embedding that varies based on surrounding context, as produced by Transformer models.",
    },
    {
      term: "Matryoshka Embeddings",
      definition: "Embeddings trained so that truncating to fewer dimensions still yields useful representations.",
    },
  ],
  deepDive: [
    `## From One-Hot to Dense Embeddings: The Evolution of Text Representation

The earliest approaches to representing text for machine learning relied on **one-hot encoding**, where each word in the vocabulary received a sparse vector with a single \`1\` at its index and \`0\`s everywhere else. This was *computationally wasteful* and encoded **no semantic information** -- "king" and "queen" were as distant as "king" and "refrigerator." *Distributional semantics* changed this: **Word2Vec** and **GloVe** learned **dense vectors** (typically 100-300 dimensions) from co-occurrence statistics, capturing meaning in geometry. However, these models used *word-level vocabularies*, struggling with **out-of-vocabulary (OOV)** words -- misspellings, morphological variants, and rare terms produced no representation at all.

**Subword tokenization** was the breakthrough that solved open vocabularies. Instead of treating each word as atomic, algorithms like **BPE**, **WordPiece**, and **Unigram** decompose words into *learned subword units*. The word \`"unhappiness"\` might become \`["un", "happi", "ness"]\`, allowing the model to generalize across morphological patterns. This means the model **never encounters a truly unknown token** -- any input decomposes into known subword pieces, with individual bytes or characters as the ultimate fallback. The shift from word-level to subword-level tokenization enabled models like **GPT**, **BERT**, and **T5** to handle *arbitrary text* in any language without maintaining impossibly large vocabularies.`,

    `## BPE Training: The Algorithm in Detail

**Byte Pair Encoding** training begins by splitting the training corpus into individual characters (or bytes in *byte-level BPE*). The algorithm then follows an iterative **greedy merge** process:

1. **Initialize**: represent every word as a sequence of characters plus a special end-of-word marker. Count the frequency of each word in the corpus.
2. **Count pairs**: scan all symbol sequences and count every *adjacent pair* of symbols. For example, in \`["l", "o", "w"]\` appearing 5 times, the pair \`("l", "o")\` gets 5 counts.
3. **Merge the top pair**: find the pair with the **highest frequency** across the entire corpus. Create a *new symbol* by concatenating the pair (e.g., \`"l" + "o" -> "lo"\`). Replace all occurrences of this pair in every word's representation.
4. **Update vocabulary**: add the new merged symbol to the vocabulary and record the **merge rule** (e.g., \`"l" + "o" -> "lo"\`).
5. **Repeat** steps 2-4 until the vocabulary reaches the desired size (commonly \`32,000\` to \`100,000\` tokens).

The **merge rules are ordered** -- during inference, they are applied in the same order they were learned. This deterministic process ensures *consistent tokenization*. The fundamental **trade-off** is between vocabulary size and sequence length: a *larger vocabulary* produces shorter token sequences (faster inference, more context per window) but requires more embedding parameters. A *smaller vocabulary* uses less memory but creates longer sequences, increasing computational cost. Modern models like **GPT-4** use ~\`100k\` tokens, while earlier models like **GPT-2** used ~\`50k\`, reflecting an empirical shift toward larger vocabularies as compute became cheaper.`,

    `## The Geometry of Embedding Spaces

**Cosine similarity** works as the default metric for embeddings because well-trained embedding models produce vectors where *direction encodes semantics* and *magnitude is normalized*. When vectors are **L2-normalized** (unit length), cosine similarity reduces to the **dot product**, making it both semantically meaningful and computationally efficient. The key insight is that embedding training objectives (like the *skip-gram* objective in Word2Vec or the *masked language modeling* objective in BERT) naturally push semantically related tokens toward similar **angular positions** in the high-dimensional space.

During **fine-tuning**, the geometry of the embedding space undergoes *targeted deformation*. Pre-trained embeddings capture general linguistic similarity, but fine-tuning for a specific task (e.g., **semantic search** or **classification**) reshapes the space so that task-relevant distinctions are amplified. For instance, fine-tuning for legal document search might pull \`"breach of contract"\` and \`"contractual violation"\` closer while pushing apart \`"breach of contract"\` and \`"data breach"\` -- a distinction the pre-trained space may not have prioritized.

**Contrastive learning**, as used in models like **sentence-transformers** (SBERT), explicitly sculpts the vector space using *positive and negative pairs*. The training objective (often **InfoNCE** or **triplet loss**) simultaneously **pulls** anchor-positive pairs closer and **pushes** anchor-negative pairs apart. This produces embedding spaces with remarkable structure: semantically similar sentences form tight clusters, paraphrases become near-neighbors, and unrelated content is pushed to distant regions. The \`all-MiniLM-L6-v2\` model, for example, was trained with *contrastive objectives* on over **1 billion sentence pairs**, producing a \`384\`-dimensional space where cosine similarity directly correlates with human judgments of textual similarity.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Byte-pair encoding — learning a vocabulary by merging frequent pairs",
      source: `type Vocab = Map<string, number>;

/**
 * BPE starts from characters and repeatedly merges the most frequent adjacent
 * pair. Common words end up as one token; rare ones stay split. That is why
 * "the" costs one token and a surname costs four.
 */
export function trainBPE(corpus: string[], numMerges: number) {
  // Each word as a list of symbols, with a marker for word-end.
  let words = corpus.flatMap((line) => line.split(/\\s+/)).filter(Boolean)
    .map((w) => [...w, "</w>"]);

  const merges: [string, string][] = [];

  for (let step = 0; step < numMerges; step++) {
    // Count adjacent pairs across the whole corpus.
    const pairs = new Map<string, number>();
    for (const symbols of words) {
      for (let i = 0; i < symbols.length - 1; i++) {
        const key = \`\${symbols[i]} \${symbols[i + 1]}\`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
    if (pairs.size === 0) break;

    const [best] = [...pairs.entries()].sort((a, b) => b[1] - a[1])[0];
    const [left, right] = best.split(" ");
    merges.push([left, right]);

    // Apply the merge everywhere.
    words = words.map((symbols) => {
      const out: string[] = [];
      for (let i = 0; i < symbols.length; i++) {
        if (symbols[i] === left && symbols[i + 1] === right) {
          out.push(left + right);
          i++;
        } else {
          out.push(symbols[i]);
        }
      }
      return out;
    });
  }

  return merges;
}

// The consequence that shows up in production:
// English prose is ~1.3 tokens per word. Code, JSON, and non-Latin scripts are
// far worse, because their character sequences were rarer in training and so
// never got merged into single tokens. Estimating tokens as words can be off
// by 2-3x — always count with the real tokeniser before sizing a context.
//
// It also explains why models cannot count letters: the model never sees
// characters, only these merged symbols.`,
    },
    {
      language: "typescript",
      caption: "Similarity is not relevance — why reranking exists",
      source: `const query = "What is the refund window for enterprise customers?";

const passages = [
  "Enterprise refunds are handled by the account management team.",   // topical, no answer
  "Customers on any plan may request a refund within 30 days.",       // answers it
  "Our enterprise tier includes priority support and an SLA.",        // topical, no answer
];

const [q, ...docs] = await embedAll([query, ...passages]);
const scored = passages.map((text, i) => ({ text, score: cosine(q, docs[i]) }));

// Typical outcome: the two "enterprise" passages score HIGHER than the one
// that actually contains the answer, because they share more vocabulary with
// the question. Embeddings measure topical closeness, not whether the passage
// answers anything.
scored.sort((a, b) => b.score - a.score);

// This is exactly the gap a cross-encoder reranker closes: it reads the
// question and the passage TOGETHER and judges relevance, rather than
// comparing two independently-produced vectors.
//
// It is also why a fixed similarity threshold is a bad relevance filter — the
// right cutoff varies per query and per corpus, and a confident-looking 0.85
// can be a non-answer.`,
    },
  ],
  diagrams: [
    {
      title: "Tokenization Pipeline",
      kind: "flow",
      caption: "How raw text is converted to token IDs through vocabulary lookup and subword splitting.",
      mermaid: `flowchart TD
    A["Raw Text
hello world"] --> B["Normalize
lowercase, unicode"]
    B --> C["Pre-tokenize
split on whitespace"]
    C --> D["Apply BPE or WordPiece
subword splitting"]
    D --> E["Map to token IDs
vocabulary lookup"]
    E --> F["Token ID sequence
[15339, 995]"]
    F --> G["Feed to model
as integer tensor"]`,
    },
    {
      title: "Embedding Space Concepts",
      kind: "mindmap",
      caption: "Key properties and applications of word and sentence embeddings in NLP.",
      mermaid: `mindmap
  root((Embeddings))
    Properties
      Dense vectors
      Semantic similarity
      Cosine distance
      High dimensionality
    Word2Vec
      Skip-gram
      CBOW
      Local context
    Transformer Embeddings
      Contextual
      BERT and GPT
      Positional encoding
    Applications
      Semantic search
      Clustering
      RAG retrieval`,
    },
    {
      title: "Token to Embedding to Output",
      kind: "sequence",
      caption: "Data flow from token IDs through embedding lookup and transformer layers to output logits.",
      mermaid: `sequenceDiagram
    participant T as Tokenizer
    participant E as Embedding Layer
    participant TF as Transformer
    participant LM as LM Head
    T->>E: token IDs [101, 7592, 102]
    E->>TF: dense vectors 768-dim + positional encoding
    TF->>TF: multi-head attention x N layers
    TF->>LM: contextual hidden states
    LM->>LM: project to vocab size
    LM-->>T: logits over vocabulary`,
    },
    {
      title: "Semantic Similarity Architecture",
      kind: "architecture",
      caption: "How two texts are encoded to embeddings and compared via cosine similarity for retrieval.",
      mermaid: `graph LR
    Q["Query Text"] --> TE["Text Encoder
sentence-transformers"]
    D1["Doc 1"] --> TE
    D2["Doc 2"] --> TE
    D3["Doc 3"] --> TE
    TE --> QV["Query Vector
768-dim"]
    TE --> DV1["Doc 1 Vector"]
    TE --> DV2["Doc 2 Vector"]
    TE --> DV3["Doc 3 Vector"]
    QV --> CS["Cosine Similarity"]
    DV1 --> CS
    DV2 --> CS
    DV3 --> CS
    CS --> Top["Top-K Results"]`,
    },
  ],
  animations: [
    {
      title: "Why the model can't count letters",
      steps: [
        {
          label: "The question",
          detail: "'How many r's in strawberry?'",
        },
        {
          label: "Tokenisation",
          detail: "The word splits into a few sub-word tokens — perhaps 'str', 'aw', 'berry'.",
        },
        {
          label: "What the model sees",
          detail: "Three integer ids. Not a sequence of characters.",
        },
        {
          label: "The task",
          detail: "Counting a character requires access to characters the model was never given.",
        },
        {
          label: "Why it still often answers",
          detail: "It has seen text discussing spelling, so it pattern-matches — which is why it's confidently wrong rather than silent.",
        },
        {
          label: "The fix",
          detail: "Give it a tool. This is a computation problem, not a knowledge problem.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Method", "Merge Strategy", "Used By", "Strengths", "Limitations"],
    rows: [
      [
        "BPE",
        "Merges the most **frequent** adjacent pair at each step; purely frequency-driven greedy algorithm",
        "GPT-2, GPT-3, GPT-4 (via tiktoken), RoBERTa, BART",
        "Simple and deterministic; handles any input via byte-level fallback; *fast encoding* with pre-compiled merge tables",
        "Greedy frequency heuristic may not produce globally optimal segmentation; sensitive to corpus composition",
      ],
      [
        "WordPiece",
        "Selects the merge that maximizes **likelihood** of the training corpus; uses *mutual information* scoring",
        "BERT, DistilBERT, ELECTRA, MobileBERT",
        "Linguistically motivated merges; the `##` prefix clearly marks subword continuations; well-suited for *morphologically rich* languages",
        "More complex to train than BPE; the `##` prefix convention adds special handling during decoding",
      ],
      [
        "SentencePiece",
        "A **framework** (not a single algorithm) that applies BPE or Unigram on raw byte streams *without pre-tokenization*",
        "T5, LLaMA, ALBERT, XLNet, mBART, multilingual models",
        "Truly language-agnostic (no whitespace assumptions); treats space as a regular character (`\\u2581`); *reversible* tokenization",
        "Requires training a model file (`.model`); slightly more complex integration than vocabulary-only tokenizers",
      ],
      [
        "Unigram",
        "Starts with a *large vocabulary* and iteratively **removes** tokens that least impact corpus likelihood; probabilistic model",
        "Used within SentencePiece (T5, ALBERT); XLNet",
        "Produces a *probabilistic segmentation* -- can sample multiple valid tokenizations; theoretically grounded in language modeling",
        "Training is more computationally expensive; the subtractive approach can be harder to tune; less intuitive than additive merging",
      ],
    ],
  },
  exercises: [
    "**Implement BPE from scratch**: Write a Python function that takes a corpus of text and a target vocabulary size, then performs BPE training. Track the merge operations and verify that applying the learned merges to new text produces valid tokenization. Compare your output with `tiktoken` on the same input.",
    "**Tokenizer comparison experiment**: Take a paragraph of text in *English* and a paragraph in a *non-Latin script* language (e.g., Chinese, Arabic, or Hindi). Tokenize both with `tiktoken` (BPE), a BERT tokenizer (WordPiece), and a T5 tokenizer (SentencePiece/Unigram). Compare the resulting token counts, subword boundaries, and how each handles unknown characters. Document which tokenizer is most *efficient* for each language.",
    "**Embedding similarity search engine**: Using `sentence-transformers`, build a simple *semantic search* system. Embed a collection of at least 50 text passages, store them in a numpy array, and implement a query function that returns the **top-k most similar** passages for a given query using cosine similarity. Measure how results change when you switch between `all-MiniLM-L6-v2` (384-dim) and `all-mpnet-base-v2` (768-dim).",
    "**Fine-tuning impact analysis**: Take a pre-trained sentence-transformer and compute embeddings for 20 sentence pairs (10 similar, 10 dissimilar). Record the cosine similarity scores. Then **fine-tune** the model on a small dataset of labeled pairs using `SentenceTransformer.fit()` with *contrastive loss*. Re-compute the similarities and visualize how the embedding space changed -- did the gap between similar and dissimilar pairs increase?",
    "**Vocabulary size ablation study**: Using HuggingFace's `tokenizers` library, train BPE tokenizers with vocabulary sizes of `1,000`, `5,000`, `10,000`, `32,000`, and `50,000` on the same corpus. For each, measure: average sequence length, percentage of single-character tokens used, and tokenization speed. Plot the **trade-off curve** between vocabulary size and sequence length.",
  ],
  cheatSheet: [
    "**BPE encoding**: `tiktoken.encoding_for_model(\"gpt-4\").encode(text)` -- returns a list of `int` token IDs; decode with `.decode(ids)`",
    "**Cosine similarity shortcut**: for *L2-normalized* vectors, `cosine_similarity = dot_product` -- skip the division by norms entirely",
    "**Embedding dimensions**: `all-MiniLM-L6-v2` = **384d**, `all-mpnet-base-v2` = **768d**, `text-embedding-3-large` = **3072d** (truncatable via *Matryoshka*)",
    "**Token count rule of thumb**: ~`1 token per 4 characters` in English for BPE tokenizers; non-Latin scripts and code typically use *more tokens per character*",
    "**Batch encoding**: `model.encode(sentences, batch_size=32, normalize_embeddings=True)` -- always set `normalize_embeddings=True` when using cosine similarity downstream",
    "**SentencePiece whitespace**: SentencePiece replaces leading spaces with `\\u2581` (lower one eighth block) -- this makes tokenization *fully reversible* without language-specific rules",
  ],
  revisionNotes: [
    "**Subword tokenization** (BPE, WordPiece, Unigram) solves the open-vocabulary problem by decomposing words into *learned subword units*, ensuring **no input is ever truly unknown** -- characters or bytes serve as the ultimate fallback.",
    "BPE is a **greedy, frequency-based** merge algorithm: start with characters, count adjacent pairs, merge the most frequent, repeat. The *ordered merge rules* are applied deterministically during inference. Vocabulary size trades off against sequence length.",
    "**Embeddings** map discrete tokens into *continuous vector spaces* where **geometric proximity encodes semantic similarity**. Cosine similarity is the standard metric because direction (not magnitude) carries meaning in normalized embedding spaces.",
    "**Contrastive learning** (used in sentence-transformers) explicitly shapes embedding geometry by *pulling similar pairs together* and *pushing dissimilar pairs apart*, producing spaces where cosine similarity directly correlates with human similarity judgments.",
    "**Always use the correct tokenizer for your model** -- token IDs are arbitrary indices into a model-specific vocabulary. A mismatched tokenizer maps IDs to wrong embeddings, producing *completely nonsensical* outputs.",
  ],
};
