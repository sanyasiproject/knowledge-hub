import type { TopicContent } from "../types";

export const llmFundamentals: TopicContent = {
  quickSummary: [
    "Large Language Models are built on the Transformer architecture, which uses self-attention to process all tokens in parallel rather than sequentially like RNNs.",
    "The attention mechanism lets each token attend to every other token in the sequence, computing relevance scores to build context-aware representations.",
    "The context window defines the maximum number of tokens a model can consider in a single forward pass, affecting how much information it can reason over.",
    "Temperature and sampling strategies control the randomness and creativity of generated text, trading off diversity against coherence.",
  ],
  detailed: [
    `## The Transformer Architecture

The Transformer, introduced in the 2017 paper "Attention Is All You Need," replaced recurrent architectures with a fully attention-based design. Key components:

- **Encoder**: processes input tokens into contextual representations (used in BERT-style models)
- **Decoder**: generates output tokens autoregressively (used in GPT-style models)
- **Encoder-Decoder**: combines both (used in T5, original Transformer)

Modern LLMs like GPT and Claude use decoder-only architectures. Each layer contains multi-head self-attention followed by a feed-forward network, with residual connections and layer normalization.

The architecture scales well: increasing parameters, data, and compute yields predictable performance improvements (scaling laws).`,

    `## Attention Mechanism

Self-attention computes three vectors for each token: Query (Q), Key (K), and Value (V), derived from learned weight matrices.

The attention score between tokens is: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V

The division by sqrt(d_k) prevents dot products from growing too large, which would push softmax into regions with vanishing gradients.

**Multi-head attention** runs several attention computations in parallel with different learned projections, allowing the model to attend to different types of relationships simultaneously (syntactic, semantic, positional).

In decoder models, **causal (masked) attention** prevents tokens from attending to future positions, preserving the autoregressive property needed for generation.`,

    `## Context Window

The context window is the maximum sequence length a model can process. It determines how much text (prompt plus response) can fit in a single inference call.

Limitations and solutions:
- **Quadratic cost**: standard attention scales as O(n^2) with sequence length, making very long contexts expensive
- **Positional encodings**: models need position information; techniques like RoPE (Rotary Position Embedding) enable better length generalization
- **Extended context**: methods like sliding window attention, sparse attention, and ring attention allow longer contexts with manageable compute
- **Practical impact**: a larger context window means more document content, conversation history, or retrieved passages can inform the response`,

    `## Temperature and Sampling

After the model computes logits (raw scores) for the next token, a sampling strategy selects the actual token.

**Temperature** scales the logits before softmax: logits / T. Lower temperature (e.g., 0.2) sharpens the distribution, making the most likely token dominant. Higher temperature (e.g., 1.2) flattens it, increasing diversity.

**Top-k sampling** restricts the candidate pool to the k most likely tokens, then samples from that subset.

**Top-p (nucleus) sampling** includes the smallest set of tokens whose cumulative probability exceeds p (e.g., 0.9). This adapts the candidate set size based on the distribution shape.

**Greedy decoding** (temperature = 0 or top-k = 1) always picks the most likely token. Deterministic but can produce repetitive or generic text.

In practice, top-p sampling with moderate temperature (0.7-1.0) is a common default that balances coherence and variety.`,

    `## Tokenization and Vocabulary

Before text enters the model, it is broken into tokens. Most LLMs use subword tokenization (BPE or similar), which balances vocabulary size with the ability to represent any input.

Key points:
- Common words become single tokens; rare words split into subword pieces
- Vocabulary size typically ranges from 32k to 100k+ tokens
- Token count does not equal word count; on average, one English word is roughly 1.3 tokens
- Different models tokenize differently, so the same text may produce different token counts

The embedding layer maps each token ID to a dense vector, which is then processed through the Transformer layers.`,
  ],
  interviewQA: [
    {
      q: "Why did Transformers replace RNNs for language modeling?",
      a: "Transformers process all tokens in parallel via self-attention, enabling much faster training on GPUs compared to the sequential nature of RNNs. They also handle long-range dependencies better because every token can directly attend to every other token, avoiding the vanishing gradient problem that plagues long RNN sequences. Scaling laws show Transformers improve predictably with more data and compute.",
    },
    {
      q: "What is the purpose of the scaling factor sqrt(d_k) in attention?",
      a: "The dot product QK^T grows in magnitude with the dimensionality d_k. Without scaling, large dot products push the softmax into saturation where gradients become very small, making training difficult. Dividing by sqrt(d_k) keeps the variance of the dot products at a manageable scale regardless of dimension.",
    },
    {
      q: "How does temperature affect text generation?",
      a: "Temperature scales the logits before the softmax. A low temperature (near 0) makes the distribution peaky, causing the model to almost always pick the highest-probability token, producing deterministic and repetitive output. A high temperature flattens the distribution, giving lower-probability tokens a better chance of being selected, increasing creativity but also the risk of incoherent text.",
    },
    {
      q: "Why is the context window a bottleneck, and what approaches address it?",
      a: "Standard self-attention is O(n^2) in sequence length, making long contexts computationally expensive and memory-intensive. Approaches to extend context include sparse attention patterns, sliding window attention, linear attention approximations, and better positional encodings like RoPE that generalize to unseen lengths. Some architectures also use retrieval to bring in relevant information without fitting it all in the context window.",
    },
  ],
  mcqs: [
    {
      q: "Which architecture do most modern LLMs like GPT use?",
      options: [
        "Encoder-only",
        "Decoder-only",
        "Encoder-decoder",
        "Recurrent neural network",
      ],
      answerIndex: 1,
      explanation:
        "GPT-style LLMs use a decoder-only Transformer that generates tokens autoregressively using causal (masked) self-attention.",
    },
    {
      q: "What does lowering the temperature during sampling do?",
      options: [
        "Increases randomness in token selection",
        "Makes the output more deterministic and focused",
        "Increases the context window size",
        "Reduces the number of model parameters",
      ],
      answerIndex: 1,
      explanation:
        "Lower temperature sharpens the probability distribution, making the model more likely to pick high-probability tokens and producing more deterministic output.",
    },
    {
      q: "What is multi-head attention?",
      options: [
        "Running attention with multiple different query/key/value projections in parallel",
        "Applying attention to multiple documents simultaneously",
        "Using multiple models to attend to the same input",
        "Stacking attention layers without feed-forward networks",
      ],
      answerIndex: 0,
      explanation:
        "Multi-head attention runs several parallel attention computations with different learned weight matrices, allowing the model to capture different types of relationships.",
    },
    {
      q: "Top-p (nucleus) sampling includes tokens until their cumulative probability exceeds p. What happens when p = 1.0?",
      options: [
        "Only the top token is selected",
        "All tokens in the vocabulary are candidates",
        "The model switches to greedy decoding",
        "Temperature is automatically set to zero",
      ],
      answerIndex: 1,
      explanation:
        "When p = 1.0, the cumulative probability threshold includes the entire vocabulary, so all tokens are candidates weighted by their probabilities.",
    },
  ],
  flashcards: [
    {
      front: "What are the three vectors computed in self-attention?",
      back: "Query (Q), Key (K), and Value (V), each derived from the input via learned weight matrices.",
    },
    {
      front: "What is causal (masked) attention?",
      back: "Attention that prevents tokens from attending to future positions, ensuring the model can only use past context during generation.",
    },
    {
      front: "What is the context window?",
      back: "The maximum number of tokens (prompt + response) a model can process in a single forward pass.",
    },
    {
      front: "What is greedy decoding?",
      back: "Always selecting the token with the highest probability at each step. Deterministic but can be repetitive.",
    },
    {
      front: "What is top-p (nucleus) sampling?",
      back: "Sampling from the smallest set of tokens whose cumulative probability exceeds a threshold p.",
    },
    {
      front: "What scaling law trend do Transformers exhibit?",
      back: "Performance improves predictably as model parameters, training data, and compute increase.",
    },
    {
      front: "Why is attention O(n^2)?",
      back: "Every token computes attention scores with every other token, resulting in n*n score computations for a sequence of length n.",
    },
  ],
  glossary: [
    {
      term: "Transformer",
      definition: "A neural network architecture based entirely on attention mechanisms, processing all tokens in parallel.",
    },
    {
      term: "Self-Attention",
      definition: "A mechanism where each token computes relevance scores with all other tokens to build context-aware representations.",
    },
    {
      term: "Context Window",
      definition: "The maximum token length a model can handle in a single inference call.",
    },
    {
      term: "Temperature",
      definition: "A parameter that scales logits before softmax, controlling the randomness of token selection.",
    },
    {
      term: "Top-k Sampling",
      definition: "A decoding strategy that restricts token candidates to the k most probable options.",
    },
    {
      term: "Top-p Sampling",
      definition: "A decoding strategy that includes the smallest set of tokens whose cumulative probability exceeds threshold p.",
    },
    {
      term: "Autoregressive Generation",
      definition: "Producing output one token at a time, conditioning each new token on all previously generated tokens.",
    },
  ],
};
