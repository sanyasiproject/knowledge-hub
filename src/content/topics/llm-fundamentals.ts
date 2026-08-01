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
  deepDive: [
    `## Inside the Transformer: From Input to Output

The **Transformer architecture** operates through a carefully orchestrated pipeline that converts raw text into meaningful representations and, ultimately, generated output. When text enters a decoder-only model like **GPT** or **Claude**, it first passes through a **tokenizer** (typically *Byte-Pair Encoding* or *SentencePiece*) that splits the input into subword units. Each token is mapped to a dense **embedding vector** — typically 4096 to 12288 dimensions in modern models — and combined with **positional encodings** (such as *RoPE* or *learned embeddings*) so the model knows token order. This combined representation enters a stack of \`N\` identical layers, each containing a **multi-head causal self-attention** block followed by a **feed-forward network** (FFN). The attention block lets every token compute weighted relevance scores against all preceding tokens (causal masking prevents attending to future positions), while the FFN — typically a two-layer MLP with a **GeLU** or **SwiGLU** activation — transforms each token's representation independently. **Residual connections** and **layer normalization** (often *RMSNorm* in newer models) wrap each sub-block, stabilizing gradient flow across dozens or even hundreds of layers. The final layer's output is projected through an **unembedding matrix** to produce logits over the vocabulary, from which the next token is sampled.`,

    `## Scaling Laws and Emergent Capabilities

One of the most consequential discoveries in modern AI is the predictability of **scaling laws**. Research by *Kaplan et al. (2020)* and later *Hoffmann et al. (2022)* (the **Chinchilla** paper) demonstrated that model performance — measured by cross-entropy loss — follows a *power-law* relationship with three variables: **parameter count** (\`N\`), **dataset size** (\`D\`), and **compute budget** (\`C\`). The Chinchilla-optimal ratio suggests that parameters and training tokens should scale roughly equally: a 70B-parameter model should train on approximately 1.4 trillion tokens. Beyond smooth scaling, researchers have observed **emergent capabilities** — abilities that appear abruptly at certain model scales rather than improving gradually. Examples include *chain-of-thought reasoning*, *few-shot arithmetic*, and *code generation*. These emergent behaviors are not explicitly trained; they arise from the model's exposure to diverse data at sufficient scale. However, this phenomenon remains debated: some researchers argue that emergent abilities may be artifacts of how performance is measured (e.g., using *exact-match accuracy* vs. *token-level log-likelihood*). Regardless, scaling has been the dominant strategy: **GPT-4**, **Claude**, and **Gemini** all leverage massive parameter counts and training corpora to achieve broad general-purpose capabilities.`,

    `## Practical Inference: Latency, Throughput, and Optimization

Running LLMs in production introduces engineering challenges beyond model quality. **Inference latency** has two phases: the *prefill* phase processes all prompt tokens in parallel (compute-bound), and the *decode* phase generates tokens one at a time autoregressively (memory-bandwidth-bound). The **KV cache** stores previously computed key and value tensors so they are not recomputed at each generation step, trading memory for speed. For a model with \`L\` layers, \`H\` attention heads, and head dimension \`d\`, the KV cache grows as \`2 * L * H * d * sequence_length\` per request, which can consume tens of gigabytes for long contexts. **Quantization** techniques — such as *GPTQ*, *AWQ*, and *GGUF* — reduce model weights from \`float16\` (16-bit) to \`int8\` or even \`int4\`, cutting memory requirements by 2-4x with minimal quality loss. **Speculative decoding** uses a smaller *draft model* to propose several tokens at once, which the larger model then verifies in parallel, improving throughput. Serving frameworks like **vLLM** use *PagedAttention* to manage KV cache memory efficiently across concurrent requests, while **continuous batching** maximizes GPU utilization by dynamically adding new requests to an in-flight batch. Understanding these tradeoffs between *latency*, *throughput*, *memory*, and *quality* is essential for deploying LLMs at scale.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Local model inference using llama.cpp (C++ LLM runtime)",
      source: `// Run inference on a local LLM using llama.cpp.
// Demonstrates model loading, tokenization, generation parameters, and decoding.

#include <llama.h>
#include <common.h>
#include <iostream>
#include <string>
#include <vector>

int main() {
    // Initialize llama.cpp backend
    llama_backend_init();

    // Load model parameters
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 99;  // Offload all layers to GPU

    llama_model* model = llama_load_model_from_file(
        "models/llama-3.1-8b-instruct.gguf", model_params
    );
    if (!model) {
        std::cerr << "Failed to load model" << std::endl;
        return 1;
    }

    // Create inference context
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 2048;    // Context window size
    ctx_params.n_batch = 512;   // Batch size for prompt processing

    llama_context* ctx = llama_new_context_with_model(model, ctx_params);

    // Tokenize the prompt
    std::string prompt = "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n"
                         "You are a helpful AI assistant.<|eot_id|>"
                         "<|start_header_id|>user<|end_header_id|>\\n"
                         "Explain the attention mechanism in 3 sentences.<|eot_id|>"
                         "<|start_header_id|>assistant<|end_header_id|>\\n";

    std::vector<llama_token> tokens(prompt.size() + 1);
    int n_tokens = llama_tokenize(model, prompt.c_str(), prompt.size(),
                                  tokens.data(), tokens.size(), true, false);
    tokens.resize(n_tokens);

    // Evaluate the prompt (prefill phase)
    llama_batch batch = llama_batch_init(n_tokens, 0, 1);
    for (int i = 0; i < n_tokens; ++i) {
        llama_batch_add(batch, tokens[i], i, {0}, false);
    }
    batch.logits[batch.n_tokens - 1] = true;  // Get logits for last token
    llama_decode(ctx, batch);

    // Autoregressive generation with sampling
    llama_sampler* sampler = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(sampler, llama_sampler_init_temp(0.7f));      // Temperature
    llama_sampler_chain_add(sampler, llama_sampler_init_top_p(0.9f, 1));  // Nucleus sampling
    llama_sampler_chain_add(sampler, llama_sampler_init_penalties(
        64, 1.1f, 0.0f, 0.0f  // Repetition penalty
    ));
    llama_sampler_chain_add(sampler, llama_sampler_init_dist(42));        // Random seed

    int max_new_tokens = 256;
    for (int i = 0; i < max_new_tokens; ++i) {
        llama_token new_token = llama_sampler_sample(sampler, ctx, -1);

        // Check for end-of-sequence
        if (llama_token_is_eog(model, new_token)) break;

        // Decode token to text and print
        char buf[128];
        int len = llama_token_to_piece(model, new_token, buf, sizeof(buf), 0, true);
        std::cout << std::string(buf, len);

        // Prepare next batch with the generated token
        llama_batch_clear(batch);
        llama_batch_add(batch, new_token, n_tokens + i, {0}, true);
        llama_decode(ctx, batch);
    }
    std::cout << std::endl;

    // Cleanup
    llama_sampler_free(sampler);
    llama_batch_free(batch);
    llama_free(ctx);
    llama_free_model(model);
    llama_backend_free();

    return 0;
}`,
    },
    {
      language: "typescript",
      caption: "Claude API integration with the Anthropic SDK (Node.js)",
      source: `/**
 * Call the Claude API using the official Anthropic TypeScript SDK.
 * Demonstrates messages, streaming, and tool use.
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  // Set via environment variable
});

// --- Basic message ---
async function basicCompletion(): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    temperature: 0.7,
    system: "You are a concise technical assistant.",
    messages: [
      { role: "user", content: "What is the KV cache in LLM inference?" },
    ],
  });

  // Extract text from the response content blocks
  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

// --- Streaming response ---
async function streamCompletion(): Promise<void> {
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      { role: "user", content: "Explain top-p sampling step by step." },
    ],
  });

  // Process tokens as they arrive
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  // Access the final aggregated message
  const finalMessage = await stream.finalMessage();
  console.log("\\nStop reason:", finalMessage.stop_reason);
  console.log("Token usage:", finalMessage.usage);
}

// Run both examples
(async () => {
  console.log("=== Basic Completion ===");
  console.log(await basicCompletion());

  console.log("\\n=== Streaming Completion ===");
  await streamCompletion();
})();`,
    },
    {
      language: "cpp",
      caption: "Computing and displaying attention weights in C++",
      source: `// Compute scaled dot-product attention weights and display as a matrix.
// Demonstrates the core attention calculation without framework dependencies.

#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
#include <string>
#include <numeric>
#include <algorithm>

using Matrix = std::vector<std::vector<float>>;

// Softmax over each row of a matrix
Matrix softmax(const Matrix& mat) {
    Matrix result(mat.size(), std::vector<float>(mat[0].size()));
    for (size_t i = 0; i < mat.size(); ++i) {
        float max_val = *std::max_element(mat[i].begin(), mat[i].end());
        float sum = 0.0f;
        for (size_t j = 0; j < mat[i].size(); ++j) {
            result[i][j] = std::exp(mat[i][j] - max_val);
            sum += result[i][j];
        }
        for (size_t j = 0; j < mat[i].size(); ++j) {
            result[i][j] /= sum;
        }
    }
    return result;
}

// Matrix multiply: A (m x k) * B^T (n x k) -> (m x n)
Matrix matmul_transposed(const Matrix& A, const Matrix& B) {
    size_t m = A.size(), n = B.size(), k = A[0].size();
    Matrix result(m, std::vector<float>(n, 0.0f));
    for (size_t i = 0; i < m; ++i)
        for (size_t j = 0; j < n; ++j)
            for (size_t p = 0; p < k; ++p)
                result[i][j] += A[i][p] * B[j][p];
    return result;
}

// Apply causal mask: set upper-triangle entries to -infinity
void apply_causal_mask(Matrix& scores) {
    for (size_t i = 0; i < scores.size(); ++i)
        for (size_t j = i + 1; j < scores[0].size(); ++j)
            scores[i][j] = -1e9f;
}

int main() {
    // Simulated tokens and their Q, K embeddings (d_k = 4)
    std::vector<std::string> tokens = {"The", "cat", "sat", "on", "the", "mat"};
    size_t seq_len = tokens.size();
    size_t d_k = 4;

    // Random Q and K matrices (seq_len x d_k) — in practice, from learned projections
    Matrix Q = {
        {0.1f, 0.9f, 0.3f, 0.5f}, {0.8f, 0.2f, 0.7f, 0.1f},
        {0.3f, 0.6f, 0.4f, 0.8f}, {0.5f, 0.1f, 0.9f, 0.2f},
        {0.2f, 0.7f, 0.1f, 0.6f}, {0.9f, 0.3f, 0.5f, 0.4f},
    };
    Matrix K = Q;  // Self-attention: Q and K derived from same input

    // Step 1: Compute raw attention scores = Q * K^T / sqrt(d_k)
    Matrix scores = matmul_transposed(Q, K);
    float scale = std::sqrt(static_cast<float>(d_k));
    for (auto& row : scores)
        for (auto& val : row)
            val /= scale;

    // Step 2: Apply causal mask (decoder-style)
    apply_causal_mask(scores);

    // Step 3: Softmax to get attention weights
    Matrix attention = softmax(scores);

    // Display the attention heatmap as a formatted table
    std::cout << "Attention Weights (Layer 0, Head 0)\\n";
    std::cout << std::string(60, '-') << "\\n";

    // Column headers
    std::cout << std::setw(8) << " ";
    for (const auto& tok : tokens)
        std::cout << std::setw(8) << tok;
    std::cout << "\\n";

    // Attention matrix rows
    for (size_t i = 0; i < seq_len; ++i) {
        std::cout << std::setw(8) << tokens[i];
        for (size_t j = 0; j < seq_len; ++j)
            std::cout << std::setw(8) << std::fixed << std::setprecision(3)
                      << attention[i][j];
        std::cout << "\\n";
    }

    // Highlight: which token does "sat" (index 2) attend to most?
    size_t query_idx = 2;
    auto max_it = std::max_element(attention[query_idx].begin(),
                                    attention[query_idx].end());
    size_t max_key = std::distance(attention[query_idx].begin(), max_it);
    std::cout << "\\n'" << tokens[query_idx] << "' attends most to '"
              << tokens[max_key] << "' (weight: " << *max_it << ")\\n";

    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Transformer Decoder Architecture",
      kind: "architecture",
      caption: "Internal structure of a decoder-only Transformer showing embeddings, stacked blocks, and the autoregressive output loop.",
      mermaid: `graph TD
    A["Input Tokens"] --> B["Token Embeddings + Positional Encoding"]
    B --> C["Transformer Block x N"]
    C --> D["Final Layer Norm"]
    D --> E["Linear Projection to Vocabulary"]
    E --> F["Logits"]
    F --> G["Sampling - temperature, top-p, top-k"]
    G --> H["Next Token"]
    H -->|"Autoregressive loop"| B
    subgraph Block["Single Transformer Block"]
        B1["RMSNorm"] --> B2["Multi-Head Causal Self-Attention"]
        B2 --> B3["Residual Add"]
        B3 --> B4["RMSNorm"]
        B4 --> B5["Feed-Forward Network"]
        B5 --> B6["Residual Add"]
    end`,
    },
    {
      title: "LLM Inference Pipeline",
      kind: "flow",
      caption: "End-to-end inference flow showing prefill, KV cache initialisation, and the token-by-token decode loop.",
      mermaid: `flowchart TD
    A["User Prompt"] --> B["Tokenize Input"]
    B --> C["Prefill Phase - process all prompt tokens in parallel"]
    C --> D["Initialise KV Cache"]
    D --> E["Compute Attention using cached K and V"]
    E --> F["Feed-Forward Network"]
    F --> G["Compute Logits"]
    G --> H["Sample Next Token"]
    H --> I{"EOS token or\nmax tokens reached?"}
    I -->|No| J["Append token to KV Cache"]
    J --> E
    I -->|Yes| K["Detokenize Output"]
    K --> L["Generated Response"]`,
    },
    {
      title: "Token Sampling Decision Flow",
      kind: "flow",
      caption: "Decision flow for sampling strategies: how temperature, top-k, and top-p filters are applied to raw logits before sampling.",
      mermaid: `flowchart TD
    A["Raw Logits from Model"] --> B["Apply Temperature Scaling\nlogits = logits / T"]
    B --> C{"top-k > 0?"}
    C -->|Yes| D["Keep top-k highest logits\nset rest to negative infinity"]
    C -->|No| E["Keep all logits"]
    D --> F{"top-p < 1.0?"}
    E --> F
    F -->|Yes| G["Sort descending, cumulative softmax\nremove tokens beyond threshold p"]
    F -->|No| H["Keep filtered logits as-is"]
    G --> I["Softmax to Probabilities"]
    H --> I
    I --> J["Multinomial Sample"]
    J --> K["Selected Token ID"]`,
    },
    {
      title: "LLM Training and Inference Concepts Mindmap",
      kind: "mindmap",
      caption: "Key concepts across LLM architecture, training, and inference organised as a mindmap.",
      mermaid: `mindmap
  root((LLM Fundamentals))
    Architecture
      Transformer blocks
      Multi-head attention
      Residual connections
      RoPE positional encoding
    Training
      Next token prediction
      Chinchilla scaling laws
      RLHF alignment
      SFT fine-tuning
    Inference
      Prefill phase
      Decode phase
      KV cache
      Speculative decoding
    Sampling
      Temperature
      Top-k filtering
      Top-p nucleus
      Repetition penalty
    Optimisation
      Quantisation int8 int4
      Continuous batching
      PagedAttention vLLM
      FlashAttention`,
    },
  ],

  comparison: {
    columns: ["Feature", "GPT-4", "BERT", "LLaMA 3", "Claude"],
    rows: [
      ["**Architecture**", "Decoder-only", "Encoder-only", "Decoder-only", "Decoder-only"],
      ["**Primary Use Case**", "General-purpose generation", "Embeddings, classification, NER", "Open-weight generation & research", "General-purpose generation & analysis"],
      ["**Training Approach**", "Autoregressive (next-token prediction)", "Masked language modeling (MLM)", "Autoregressive (next-token prediction)", "Autoregressive + RLHF/Constitutional AI"],
      ["**Access Model**", "Closed-source, API only", "Open-source, self-hosted", "Open-weight, self-hosted or API", "Closed-source, API only"],
      ["**Context Window**", "Up to 128K tokens", "512 tokens (original)", "Up to 128K tokens", "Up to 200K tokens"],
      ["**Tokenizer**", "BPE (`cl100k_base`)", "WordPiece (30K vocab)", "BPE (128K vocab)", "BPE (custom)"],
      ["**Parameter Sizes**", "Undisclosed (estimated >1T)", "110M (base), 340M (large)", "8B, 70B, 405B", "Undisclosed"],
      ["**Key Strength**", "Broad reasoning, multimodal", "Bidirectional context understanding", "Open ecosystem, strong per-param perf", "Long context, safety, instruction following"],
    ],
  },

  exercises: [
    "**Attention Weight Analysis**: Given a 4-token sequence `[\"The\", \"cat\", \"sat\", \"down\"]` with causal masking, draw the attention mask matrix. Which positions can the token `\"sat\"` (position 2) attend to? Calculate the attention scores if `Q_sat * K^T = [1.2, 0.8, 2.0, 1.5]` — apply the mask, scale by `sqrt(d_k) = 8`, then compute the softmax output.",
    "**Temperature Exploration**: Write a Python script that takes a fixed logit vector `[2.0, 1.0, 0.5, 0.1, -1.0]` and plots the resulting probability distributions for temperatures `T = 0.1, 0.5, 1.0, 2.0`. Observe how the distribution shifts from near-deterministic to near-uniform. At what temperature does the least likely token exceed 10% probability?",
    "**KV Cache Memory Estimation**: A model has `L = 32` layers, `H = 32` attention heads, head dimension `d = 128`, and uses `float16` (2 bytes per value). Calculate the KV cache memory required for a *single request* with a context length of 8192 tokens. Then estimate how many concurrent requests a GPU with 24 GB of free memory can serve (ignoring model weights).",
    "**Tokenizer Comparison**: Install the `tiktoken` library (OpenAI) and `transformers` (Hugging Face). Tokenize the same paragraph of technical text with both `cl100k_base` (GPT-4) and `LlamaTokenizer` (LLaMA 3). Compare token counts, note where they split differently, and identify which tokenizer is more efficient for code vs. natural language.",
    "**Build a Mini Sampling Function**: Implement a Python function `sample_next_token(logits, temperature=1.0, top_k=0, top_p=1.0)` that applies temperature scaling, top-k filtering, top-p (nucleus) filtering, and returns a sampled token index. Test it with synthetic logit vectors and verify that `temperature=0` produces greedy behavior while `top_p=0.9` excludes low-probability tail tokens.",
  ],

  cheatSheet: [
    "**Attention formula**: `Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V` — scale prevents gradient vanishing in softmax",
    "**KV cache size**: `2 * num_layers * num_heads * head_dim * seq_len * bytes_per_param` — grows linearly with sequence length, dominates memory during decode",
    "**Temperature**: `T < 1.0` = more deterministic (sharper distribution), `T > 1.0` = more random (flatter distribution), `T = 0` = greedy decoding",
    "**Top-p sampling**: include tokens from most to least likely until cumulative probability exceeds `p`; adaptive candidate set unlike fixed top-k",
    "**Chinchilla-optimal ratio**: train tokens should be roughly `20x` the parameter count (e.g., 70B params needs ~1.4T tokens for compute-optimal training)",
    "**Token vs. word estimate**: ~1.3 tokens per English word on average; code and non-Latin scripts typically use more tokens per character",
  ],

  revisionNotes: [
    "The **Transformer** replaced RNNs by using *self-attention* for parallel processing. Decoder-only variants (GPT, Claude, LLaMA) dominate modern LLMs. Each layer has **multi-head causal attention** + **FFN**, wrapped with *residual connections* and *layer norm*. Positional information comes from encodings like **RoPE**.",
    "**Attention** computes `softmax(QK^T / sqrt(d_k)) * V`. The `sqrt(d_k)` scaling is critical for stable gradients. **Multi-head attention** uses parallel projections to capture different relationship types (syntax, semantics, coreference). **Causal masking** prevents future-token leakage during autoregressive generation.",
    "**Scaling laws** show that loss decreases as a power law with increased parameters, data, and compute. The **Chinchilla** result revealed many models were under-trained relative to their size. **Emergent capabilities** — like chain-of-thought reasoning — appear suddenly at certain scales, though the mechanism is debated.",
    "**Inference optimization** is a major engineering concern. The **KV cache** avoids redundant computation during decoding but consumes significant memory. **Quantization** (int8, int4) reduces memory 2-4x with minimal quality loss. **Speculative decoding** uses a small draft model for faster throughput. **Continuous batching** and **PagedAttention** (vLLM) maximize GPU utilization across concurrent requests.",
    "**Sampling strategies** control output quality: *temperature* scales logits before softmax, *top-k* limits candidates to the k most likely, *top-p* (nucleus) adapts the candidate set dynamically. For factual tasks use low temperature (`0.0-0.3`); for creative tasks use moderate temperature (`0.7-1.0`) with `top_p = 0.9`. **Repetition penalty** helps avoid degenerate loops.",
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
