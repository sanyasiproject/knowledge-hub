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
  followUps: [
    "Why is the first token slow but the rest fast?",
    "Why does the KV cache dominate memory at long context?",
    "What does 4-bit quantisation actually cost you in quality?",
    "Why does batching help decode more than prefill?",
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
  resources: [
    {
      label: "FlashAttention — Dao et al., 2022",
      kind: "paper",
    },
    {
      label: "Efficient Memory Management for LLM Serving with PagedAttention (vLLM) — Kwon et al., 2023",
      kind: "paper",
    },
    {
      label: "vLLM documentation",
      kind: "docs",
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
  deepDive: [
    `## Why Inference Is Memory-Bandwidth-Bound

The fundamental bottleneck in **autoregressive LLM generation** is not arithmetic — it is *memory bandwidth*. During the **decode phase**, each generated token requires loading the *entire model's weights* from GPU HBM into the compute cores, yet performs only a tiny amount of computation per loaded byte. For a 70B-parameter model in FP16, that is roughly **140 GB of weight data** transferred for a single matrix-vector multiply per layer. The GPU's arithmetic units finish the multiply almost instantly, then sit idle waiting for the next chunk of weights to arrive.

This is captured by the concept of **arithmetic intensity** — the ratio of FLOPs performed to bytes moved. A single-token decode step has an arithmetic intensity near \`1 FLOP/byte\`, far below the **ops:byte ratio** of modern GPUs (which often exceed \`100:1\` on an A100 or H100). The GPU is therefore *starved for data*, not for compute. This is the opposite of the **prefill phase**, where an entire prompt is processed in parallel, achieving high arithmetic intensity and saturating the GPU's tensor cores.

This memory-bandwidth bottleneck fundamentally shapes every optimization strategy. **Quantization** reduces the bytes loaded per parameter (INT8 halves bandwidth, INT4 quarters it). **Batching** amortizes the single weight-load across many tokens, pushing arithmetic intensity up toward the compute-bound regime. **KV caching** avoids re-loading weights for redundant recomputation. **Speculative decoding** converts multiple serial decode steps into a single high-arithmetic-intensity verify pass. Understanding this bottleneck is the *prerequisite* to reasoning about any inference optimization.`,

    `## KV Caching, PagedAttention, and Memory Management

KV caching is essential for efficient autoregressive generation, but it introduces a **memory management nightmare**. Each request's KV cache grows dynamically as tokens are generated, and the system must pre-allocate memory for the *maximum possible* sequence length since the final length is unknown. In naive implementations, this leads to massive **internal fragmentation** — a request allocated for 2048 tokens but generating only 200 wastes over 90% of its reserved memory. With thousands of concurrent requests, this fragmentation can waste *tens of gigabytes* of GPU memory.

**PagedAttention**, introduced by *vLLM*, solves this by borrowing the **virtual memory** paradigm from operating systems. Instead of allocating contiguous memory for each request's full KV cache, it divides the cache into fixed-size **blocks** (analogous to memory pages, typically holding 16 tokens each). A **block table** maps each request's logical KV positions to physical memory blocks, just as a page table maps virtual to physical addresses. New blocks are allocated *on demand* as tokens are generated, and freed immediately when a request completes. This eliminates internal fragmentation almost entirely.

The virtual memory analogy extends further. **Copy-on-write** semantics allow requests sharing a common prefix (e.g., the same system prompt) to *share* physical KV cache blocks, with copying deferred until their sequences diverge. This is critical for techniques like **parallel sampling** (generating multiple completions for one prompt) and **beam search**, where sequences share long common prefixes. PagedAttention achieves near-optimal memory utilization — vLLM reports only ~4% waste compared to ~60-80% in naive pre-allocation — enabling **2-4x higher throughput** by fitting more concurrent requests in the same GPU memory. The combination of \`PagedAttention\` + \`continuous batching\` is the foundation of modern high-throughput serving systems.`,

    `## The Future of Inference Optimization

**Speculative decoding** is rapidly evolving beyond the original draft-model paradigm. **Medusa** attaches multiple lightweight *prediction heads* to the target model itself, each head predicting a future token at a different position. This eliminates the need for a separate draft model and its associated memory overhead, while leveraging the target model's own hidden states for higher acceptance rates. **EAGLE** (Extrapolation Algorithm for Greater Language-model Efficiency) takes a different approach: it trains a lightweight *feature extrapolation* network that predicts the target model's hidden states for future positions, then uses those extrapolated features to draft tokens. EAGLE achieves **3-5x speedups** on code generation tasks — substantially higher than vanilla speculative decoding.

**Hardware-aware optimizations** are becoming increasingly important as the gap between compute and memory bandwidth widens with each GPU generation. Techniques like **Flash Attention 3** exploit the *asynchronous* nature of H100 Tensor Cores, overlapping GEMM computation with softmax via \`warp specialization\`. **FP8 inference** on Hopper and Blackwell architectures doubles throughput versus FP16 with near-zero quality loss, especially when combined with *per-channel scaling*. Custom CUDA kernels that fuse **RoPE embedding**, **attention**, and **layer normalization** into single kernel launches are becoming standard, reducing kernel launch overhead and intermediate memory traffic.

The most exciting frontier is the **convergence** of previously independent optimization techniques. Systems like **TensorRT-LLM** and **SGLang** combine \`INT4 quantization\` + \`continuous batching\` + \`PagedAttention\` + \`speculative decoding\` + \`Flash Attention\` in a single serving stack, achieving multiplicative speedups. **Disaggregated inference** separates the compute-bound prefill phase from the memory-bound decode phase onto different hardware, optimizing each independently. Looking ahead, **mixture-of-experts (MoE)** routing, **early exit** strategies, and **adaptive computation** promise to reduce the *effective* model size per token, fundamentally changing the memory-bandwidth calculus that has driven optimization for the past several years.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "The KV cache — why decode is O(1) per token instead of O(n)",
      source: `type Vec = Float32Array;

/**
 * During generation each new token attends to every previous token, which
 * needs their key and value vectors. Recomputing those every step would be
 * quadratic. Caching them makes per-token work constant in sequence length.
 */
export class KVCache {
  private keys: Vec[] = [];
  private values: Vec[] = [];

  constructor(
    private readonly maxLen: number,
    private readonly headDim: number,
    private readonly numLayers: number,
    private readonly numKVHeads: number
  ) {}

  append(k: Vec, v: Vec) {
    if (this.keys.length >= this.maxLen) throw new Error("context window exhausted");
    this.keys.push(k);
    this.values.push(v);
  }

  get length() { return this.keys.length; }

  /** Bytes held, at fp16. This is usually the real limit on batch size. */
  bytes(batchSize: number): number {
    const perToken = 2 * this.numLayers * this.numKVHeads * this.headDim * 2; // K and V, 2 bytes each
    return perToken * this.keys.length * batchSize;
  }
}

// Worked example — a 70B-class model, 80 layers, 8 KV heads, head dim 128:
//   per token  = 2 * 80 * 8 * 128 * 2 bytes ≈ 327 KB
//   32k context, batch of 16 ≈ 327KB * 32,000 * 16 ≈ 167 GB
// That exceeds the weights by a wide margin, which is why the KV cache — not
// the model — is what caps concurrency on a GPU.
//
// The two levers:
// - Grouped-query attention: share K/V across query heads, shrinking the cache
//   several-fold for a small quality cost.
// - PagedAttention (vLLM): manage the cache in non-contiguous pages to remove
//   fragmentation and share identical prefixes between requests.
//
// This also explains the latency shape users notice: PREFILL processes the
// whole prompt in parallel and is compute-bound (that is time-to-first-token),
// while DECODE emits one token at a time, re-reading weights and cache, and is
// memory-bandwidth-bound — hence roughly constant per token.`,
    },
  ],
  diagrams: [
    {
      title: "LLM Inference Request Pipeline",
      kind: "sequence",
      caption: "Flow of a request through an optimized LLM inference pipeline.",
      mermaid: `sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant Cache as KV Cache
    participant Batcher as Request Batcher
    participant GPU as GPU Worker
    Client->>Gateway: Inference request
    Gateway->>Cache: Check prefix KV cache
    alt Cache hit
        Cache-->>Gateway: Return cached attention states
    else Cache miss
        Gateway->>Batcher: Enqueue request
        Batcher->>Batcher: Dynamic batching window
        Batcher->>GPU: Batched forward pass
        GPU-->>Cache: Store KV states
        GPU-->>Gateway: Generated tokens
    end
    Gateway-->>Client: Streamed response`,
    },
    {
      title: "Quantization Precision Decision",
      kind: "flow",
      caption: "Selecting model quantization precision based on constraints.",
      mermaid: `flowchart TD
    A[Deploy inference model] --> B{Memory constrained?}
    B -- No --> C[FP32 full precision]
    B -- Yes --> D{Accuracy critical?}
    D -- Yes --> E[BF16 or FP16 mixed precision]
    D -- No --> F{Extreme memory constraint?}
    F -- Yes --> G[INT4 quantization GPTQ or AWQ]
    F -- No --> H[INT8 quantization]
    G --> I[Benchmark accuracy regression]
    H --> I
    E --> J[Deploy to production]
    I --> J`,
    },
    {
      title: "Inference Optimization Techniques",
      kind: "mindmap",
      caption: "Key techniques to improve LLM inference throughput and latency.",
      mermaid: `mindmap
  root((Inference Optimization))
    Batching
      Dynamic batching
      Continuous batching
    KV Cache
      Prefix caching
      PagedAttention vLLM
    Quantization
      INT8 post-training
      INT4 GPTQ
      AWQ activation aware
    Parallelism
      Tensor parallelism
      Pipeline parallelism
    Compilation
      TorchCompile
      TensorRT
      XLA`,
    },
    {
      title: "Continuous vs Static Batching",
      kind: "architecture",
      caption: "How continuous batching improves GPU utilization over static batching.",
      mermaid: `graph TD
    subgraph Static Batching
        SB1[Full batch arrives] --> SB2[All requests run together]
        SB2 --> SB3[Wait for all to finish]
        SB3 --> SB4[GPU idles between batches]
    end
    subgraph Continuous Batching
        CB1[Request arrives] --> CB2[Add to active batch]
        CB2 --> CB3[Finished request leaves]
        CB3 --> CB4[New request fills slot]
        CB4 --> CB5[GPU always utilized]
    end`,
    },
  ],
  animations: [
    {
      title: "Prefill, decode, and the KV cache",
      steps: [
        {
          label: "Prefill",
          detail: "The whole prompt is processed in one parallel pass. Compute-bound; cost grows with prompt length. This is time-to-first-token.",
        },
        {
          label: "KV cache filled",
          detail: "Keys and values for every prompt token are stored so they're never recomputed.",
        },
        {
          label: "Decode one token",
          detail: "Only the newest token's K and V are computed; it attends to the cache. Memory-bandwidth-bound.",
        },
        {
          label: "Repeat",
          detail: "Each token re-reads the weights and the cache — which is why decode speed is roughly constant per token.",
        },
        {
          label: "Cache grows",
          detail: "It scales with batch × sequence length × layers × heads, and at long context exceeds the weights themselves.",
        },
        {
          label: "Consequences",
          detail: "Shorten the prompt or cache its prefix to improve TTFT; batch to improve decode throughput.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Technique", "Speedup", "Quality Impact", "Memory Impact", "Complexity"],
    rows: [
      [
        "**Quantization (INT8)**",
        "~1.5-2x throughput",
        "*Negligible* — <1% degradation on most benchmarks",
        "~2x reduction in model memory",
        "Low — post-training quantization with calibration dataset",
      ],
      [
        "**Quantization (INT4)**",
        "~2-4x throughput",
        "*Minor* — 1-3% degradation; sensitive to calibration quality",
        "~4x reduction in model memory",
        "Medium — requires careful calibration (GPTQ/AWQ) or QAT",
      ],
      [
        "**KV Caching**",
        "~10-100x per-token speedup",
        "*None* — mathematically identical output",
        "Increases memory: `O(layers × heads × dim × seq_len)`",
        "Low — standard in all modern frameworks",
      ],
      [
        "**Continuous Batching**",
        "~2-5x throughput",
        "*None* — identical output per request",
        "Moderate increase from managing concurrent KV caches",
        "Medium — requires serving framework support (vLLM, TGI)",
      ],
      [
        "**Speculative Decoding**",
        "~2-3x latency reduction",
        "*None* — provably lossless, identical output distribution",
        "Additional memory for draft model (~5-10% of target)",
        "High — requires compatible draft model and rejection sampling logic",
      ],
      [
        "**Flash Attention**",
        "~1.5-3x attention speedup",
        "*None* — exact attention computation",
        "Reduces attention memory from `O(n²)` to `O(n)`",
        "Low — drop-in replacement via libraries (FlashAttention-2/3)",
      ],
    ],
  },
  exercises: [
    "**KV Cache Memory Budget**: A model has *32 layers*, *32 KV heads*, and a *head dimension of 128*, using `FP16` storage. Calculate the KV cache memory required for a single sequence of 4096 tokens. Then determine how many concurrent sequences can fit in **24 GB** of GPU memory reserved for KV cache. How does switching to **GQA with 8 KV groups** change these numbers?",
    "**Quantization Round-Trip Error**: Implement a program that takes a vector of 1000 random `FP32` values drawn from a normal distribution, quantizes them to **INT8** (symmetric, per-tensor), then dequantizes back to FP32. Measure the *mean absolute error* and *max absolute error*. Repeat with **INT4** quantization. Plot error distributions and discuss how **outlier values** affect quantization quality.",
    "**Speculative Decoding Acceptance Rate**: Given a draft model with per-token acceptance probability *p = 0.8* and a speculation length of *k = 5* tokens, calculate the **expected number of accepted tokens** per speculation round using the geometric distribution. How does this compare to generating tokens one at a time? At what acceptance probability does speculative decoding with `k = 5` break even versus standard decoding (assuming the draft model is 10x faster)?",
    "**Continuous Batching Simulation**: Write a simulation of a continuous batching scheduler. Model incoming requests as a Poisson process with *lambda = 10 requests/second*, where each request generates between 50 and 500 tokens. Compare **average latency** and **GPU utilization** between static batching (batch size 8, wait until full) and continuous batching. Assume a single decode step takes `20ms` regardless of batch size (memory-bandwidth-bound).",
    "**PagedAttention Fragmentation Analysis**: Consider a system serving requests with sequence lengths uniformly distributed between 100 and 2000 tokens. With a naive allocator that pre-allocates for *max_seq_len = 2048*, calculate the **expected internal fragmentation ratio**. Then calculate the fragmentation with PagedAttention using a *block size of 16 tokens*. What is the theoretical maximum waste per request in each scheme?",
  ],
  cheatSheet: [
    "**Memory-bandwidth bottleneck**: Decode is *bandwidth-bound* (low arithmetic intensity). Quantization, batching, and caching all target this. Prefill is *compute-bound*.",
    "**KV cache sizing**: `2 × layers × kv_heads × head_dim × seq_len × bytes_per_param`. For *GQA*, use `kv_groups` instead of `num_heads` — this is the main memory saving.",
    "**Quantization quick picks**: `INT8` for safe, near-lossless compression (~2x). `INT4/NF4` for aggressive compression (~4x) with GPTQ or AWQ. Always use a *calibration dataset* representative of your workload.",
    "**Speculative decoding rule of thumb**: Speedup ≈ `1 / (1 - p)` where *p* is acceptance rate, up to speculation length *k*. Works best when draft model closely matches target distribution.",
    "**PagedAttention block size**: Default is typically **16 tokens** per block. Smaller blocks reduce fragmentation but increase block-table overhead. Almost always use the framework default.",
    "**Optimization stacking order**: Start with `Flash Attention` (free wins) → add `KV caching` (always on) → apply `quantization` (if memory-constrained) → enable `continuous batching` (for throughput) → add `speculative decoding` (for latency).",
  ],
  revisionNotes: [
    "Autoregressive **decode** is fundamentally *memory-bandwidth-bound*, not compute-bound. Every optimization — quantization, batching, caching, speculative decoding — can be understood as addressing this single bottleneck by either reducing bytes moved or amortizing weight loads across more useful work.",
    "**KV caching** eliminates redundant computation by storing key-value projections from previous tokens. **PagedAttention** solves the resulting memory management problem by treating KV cache like virtual memory pages, reducing fragmentation from ~60-80% to ~4% and enabling 2-4x more concurrent requests.",
    "**Speculative decoding** is the only major optimization that reduces *per-token latency* without any quality trade-off. It works by converting serial decode steps into a parallel verification pass, exploiting the fact that verification has much higher arithmetic intensity than generation.",
    "**Quantization** (INT8/INT4) and **batching** (continuous/dynamic) are complementary: quantization reduces per-parameter memory bandwidth, while batching amortizes the fixed cost of loading weights across multiple tokens. Together they can achieve **10x+ throughput** improvements over naive single-request FP16 inference.",
    "Modern serving stacks (vLLM, TensorRT-LLM, SGLang) combine *all* major optimizations — `Flash Attention` + `PagedAttention` + `continuous batching` + `quantization` + `speculative decoding` — and their benefits are **approximately multiplicative**, making the choice of serving framework as important as model selection.",
  ],
};
