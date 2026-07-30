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
};
