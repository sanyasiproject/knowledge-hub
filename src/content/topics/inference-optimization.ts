import type { TopicContent } from "../types";

export const inferenceOptimization: TopicContent = {
  quickSummary: [
    "Quantization reduces model weight precision (e.g., from 16-bit to 4-bit), shrinking memory footprint and increasing throughput with minimal quality loss.",
    "KV caching stores previously computed key-value pairs during autoregressive generation, avoiding redundant computation and significantly speeding up token generation.",
    "Continuous batching groups multiple inference requests together to maximize GPU utilization, amortizing the fixed cost of loading model weights across many tokens.",
    "Speculative decoding uses a small draft model to propose multiple tokens that the large model verifies in parallel, accelerating generation without changing output quality.",
  ],
  detailed: [
    `## Quantization

Quantization reduces the numerical precision of model weights and/or activations. Common formats:

- **FP16 / BF16**: half-precision, the standard training format. 2 bytes per parameter.
- **INT8**: 8-bit integer. Roughly 2x memory reduction with minimal quality loss. Supported by LLM.int8() and SmoothQuant.
- **INT4 / NF4**: 4-bit. Roughly 4x reduction. Used by GPTQ, AWQ, and QLoRA. Quality depends on calibration.
- **GGUF / GGML**: formats optimized for CPU inference with various quantization levels (Q4_K_M, Q5_K_S, etc.).

**Post-training quantization (PTQ)** quantizes an already-trained model using a small calibration dataset. No retraining needed.

**Quantization-aware training (QAT)** simulates quantization during training, generally yielding better quality but requiring a full training run.

The trade-off is always between model size / speed and output quality. For most models, 4-bit quantization preserves the vast majority of capability.`,

    `## KV Caching

During autoregressive generation, each new token requires attention over all previous tokens. Without caching, the model recomputes key and value projections for the entire sequence at every step.

KV caching stores the key (K) and value (V) tensors from previous steps. When generating token t, only the new token's Q, K, V are computed; cached K and V from tokens 1 to t-1 are reused.

**Memory cost**: KV cache size = 2 * num_layers * num_heads * head_dim * sequence_length * bytes_per_element. For a 70B model with 80 layers, this can exceed 10 GB for long sequences.

**Optimization techniques**:
- **Multi-Query Attention (MQA)**: shares K and V across all attention heads, reducing cache by num_heads times
- **Grouped-Query Attention (GQA)**: a middle ground, sharing K/V across groups of heads
- **PagedAttention** (vLLM): manages KV cache like virtual memory pages, eliminating fragmentation and enabling efficient memory sharing across requests`,

    `## Continuous Batching

Traditional static batching waits for a batch of requests to arrive, processes them together, and pads shorter sequences to match the longest. This wastes compute on padding tokens and forces all requests to finish together.

**Continuous batching** (also called iteration-level or in-flight batching) inserts new requests into the batch as soon as any existing request completes a step. Each request can start and finish independently.

Benefits:
- Higher GPU utilization by keeping the batch full
- Lower latency for short requests (they are not blocked by long ones)
- No wasted compute on padding

Frameworks implementing continuous batching include vLLM, TensorRT-LLM, and Text Generation Inference (TGI).`,

    `## Speculative Decoding

Speculative decoding addresses the problem that autoregressive generation is memory-bandwidth-bound: generating one token requires loading the full model weights but uses very little compute.

The approach:
1. A small **draft model** generates k candidate tokens autoregressively (fast, because the model is small)
2. The large **target model** processes all k tokens in a single forward pass (parallel verification)
3. Tokens are accepted from left to right as long as the target model agrees with the draft model's distribution
4. The first rejected token is resampled from a corrected distribution

Key properties:
- **Lossless**: the output distribution is mathematically identical to the target model alone
- **Speedup**: 2-3x typical, depending on how well the draft model approximates the target
- **No quality trade-off**: unlike quantization, speculative decoding does not change the output distribution

Medusa and EAGLE are variants that use additional prediction heads on the target model instead of a separate draft model.`,

    `## Other Optimization Techniques

**Flash Attention**: an IO-aware attention algorithm that reduces memory reads/writes by fusing operations, enabling longer sequences with less memory and faster computation.

**Tensor parallelism**: splits individual layers across multiple GPUs, reducing per-GPU memory and enabling larger models.

**Pipeline parallelism**: assigns different layers to different GPUs, pipelining microbatches through them.

**Operator fusion**: combines multiple operations (e.g., layer norm + linear) into a single GPU kernel to reduce memory bandwidth overhead.

**Prefix caching**: for requests sharing a common prefix (system prompt), the KV cache for the prefix is computed once and reused across requests, saving significant compute for high-traffic deployments.`,
  ],
  interviewQA: [
    {
      q: "How does KV caching improve generation speed?",
      a: "Without KV caching, generating each new token requires recomputing key and value projections for the entire sequence. KV caching stores these projections from previous steps and reuses them, so only the new token's projections are computed. This reduces the per-token cost from O(n) to O(1) in terms of attention computation, where n is the sequence length. The trade-off is memory: the cache grows linearly with sequence length.",
    },
    {
      q: "Why is speculative decoding lossless despite using a smaller model?",
      a: "Speculative decoding uses the draft model only for proposing candidates. The target model verifies every proposed token by running a full forward pass over the candidate sequence. Tokens are accepted only when the target model's distribution agrees. Any rejected token is resampled from a mathematically corrected distribution that accounts for the draft model's proposal. This ensures the final output distribution is identical to running the target model alone.",
    },
    {
      q: "What problem does continuous batching solve over static batching?",
      a: "Static batching pads all sequences to the longest length and processes them as a fixed group, wasting compute on padding and forcing short requests to wait for long ones. Continuous batching dynamically inserts and removes requests at each generation step. This eliminates padding waste, improves GPU utilization, and reduces latency for shorter requests.",
    },
    {
      q: "What is the trade-off when quantizing a model from 16-bit to 4-bit?",
      a: "The model size and memory footprint shrink by roughly 4x, and inference throughput increases due to reduced memory bandwidth requirements. The trade-off is potential quality degradation, especially on tasks requiring precise numerical reasoning or rare knowledge. Modern quantization methods (GPTQ, AWQ) with good calibration data preserve most quality, but there is always some loss at extreme compression levels.",
    },
  ],
  mcqs: [
    {
      q: "What does PagedAttention (used in vLLM) optimize?",
      options: [
        "Model weight quantization",
        "KV cache memory management by treating it like virtual memory pages",
        "The attention computation algorithm",
        "Training data loading",
      ],
      answerIndex: 1,
      explanation:
        "PagedAttention manages KV cache in non-contiguous memory blocks (pages), eliminating fragmentation and enabling efficient memory sharing across concurrent requests.",
    },
    {
      q: "In speculative decoding, what happens when the target model rejects a draft token?",
      options: [
        "The entire sequence is regenerated from scratch",
        "The draft model generates another candidate",
        "The token is resampled from a corrected distribution and all subsequent draft tokens are discarded",
        "The token is accepted with reduced confidence",
      ],
      answerIndex: 2,
      explanation:
        "When a draft token is rejected, it is resampled from a distribution that corrects for the draft model's proposal. All subsequent draft tokens are discarded since they were conditioned on the rejected token.",
    },
    {
      q: "What is Grouped-Query Attention (GQA)?",
      options: [
        "Grouping queries from different users into a single batch",
        "Sharing key-value heads across groups of query heads to reduce KV cache size",
        "Running multiple queries against a database in parallel",
        "A training technique for learning better query representations",
      ],
      answerIndex: 1,
      explanation:
        "GQA shares K and V projections across groups of attention heads (e.g., 8 query heads share 1 KV head), reducing KV cache memory while retaining more expressiveness than full Multi-Query Attention.",
    },
    {
      q: "Which quantization approach requires a full training run?",
      options: [
        "Post-training quantization (PTQ)",
        "Quantization-aware training (QAT)",
        "GPTQ",
        "Dynamic quantization",
      ],
      answerIndex: 1,
      explanation:
        "QAT simulates quantization effects during the training process, allowing the model to learn to compensate for reduced precision, but it requires a complete training run.",
    },
  ],
  flashcards: [
    {
      front: "What is quantization in the context of LLM inference?",
      back: "Reducing the numerical precision of model weights (e.g., FP16 to INT4) to decrease memory footprint and increase throughput.",
    },
    {
      front: "What does KV caching store?",
      back: "The key and value projection tensors from previous generation steps, avoiding recomputation during autoregressive decoding.",
    },
    {
      front: "What is continuous batching?",
      back: "Dynamically inserting and removing requests from the inference batch at each generation step, rather than processing fixed batches.",
    },
    {
      front: "Why is speculative decoding considered lossless?",
      back: "The target model verifies every token, and rejected tokens are resampled from a corrected distribution, preserving the exact output distribution.",
    },
    {
      front: "What is Flash Attention?",
      back: "An IO-aware attention algorithm that fuses operations to reduce memory reads/writes, enabling faster and more memory-efficient attention.",
    },
    {
      front: "What is Multi-Query Attention (MQA)?",
      back: "An attention variant where all query heads share a single set of key and value heads, drastically reducing KV cache size.",
    },
    {
      front: "What is prefix caching?",
      back: "Reusing the KV cache for a shared prompt prefix across multiple requests, avoiding redundant computation.",
    },
  ],
  glossary: [
    {
      term: "Quantization",
      definition: "Reducing numerical precision of model parameters to decrease memory usage and increase inference speed.",
    },
    {
      term: "KV Cache",
      definition: "Stored key and value tensors from previous tokens, reused during autoregressive generation to avoid recomputation.",
    },
    {
      term: "Continuous Batching",
      definition: "A serving strategy that dynamically manages the inference batch, adding new requests as existing ones complete.",
    },
    {
      term: "Speculative Decoding",
      definition: "Using a small draft model to propose tokens that a larger model verifies in parallel, accelerating generation without quality loss.",
    },
    {
      term: "Flash Attention",
      definition: "An IO-aware exact attention algorithm that reduces memory bandwidth usage through operation fusion.",
    },
    {
      term: "PagedAttention",
      definition: "A memory management technique that stores KV cache in non-contiguous pages to eliminate fragmentation.",
    },
    {
      term: "Tensor Parallelism",
      definition: "Splitting individual model layers across multiple GPUs to reduce per-device memory requirements.",
    },
  ],
};
