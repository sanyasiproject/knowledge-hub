import type { TopicContent } from "../types";

export const fineTuning: TopicContent = {
  quickSummary: [
    "Full fine-tuning updates all model parameters on a task-specific dataset, yielding high performance but requiring significant GPU memory and compute.",
    "LoRA (Low-Rank Adaptation) freezes the base model and trains small rank-decomposed weight matrices, dramatically reducing trainable parameters and memory.",
    "PEFT (Parameter-Efficient Fine-Tuning) is a family of methods including LoRA, prefix tuning, and adapters that achieve competitive results while updating only a fraction of parameters.",
    "Data preparation for fine-tuning involves curating high-quality examples, formatting them consistently, and ensuring they represent the target task distribution.",
  ],
  detailed: [
    `## Full Fine-Tuning

Full fine-tuning updates every parameter of a pretrained model on a downstream dataset. The model starts from learned representations and adapts them to the specific task.

Process:
1. Start with a pretrained checkpoint (e.g., LLaMA, Mistral)
2. Prepare supervised training data in the expected format
3. Train with a low learning rate (1e-5 to 5e-5) to avoid catastrophic forgetting
4. Monitor validation loss for early stopping

Advantages: maximum expressiveness since all parameters adapt. Disadvantages: requires full-model GPU memory (often multiple GPUs), produces a full-sized model copy per task, and risks overfitting on small datasets.

Full fine-tuning is most justified when you have large amounts of high-quality data and the task differs substantially from the pretraining distribution.`,

    `## LoRA (Low-Rank Adaptation)

LoRA decomposes weight updates into two small matrices: W_update = A * B, where A is (d x r) and B is (r x d), with rank r much smaller than d (typically 4-64).

Key benefits:
- **Memory efficient**: only the small A and B matrices are trained; the base model is frozen
- **Composable**: multiple LoRA adapters can be trained for different tasks and swapped at inference time
- **Mergeable**: after training, the LoRA weights can be merged back into the base model with zero inference overhead

Typical configurations:
- Rank (r): 8-64, higher rank captures more complex adaptations
- Alpha: a scaling factor, commonly set to 2x the rank
- Target modules: usually applied to attention projection matrices (q_proj, v_proj, k_proj, o_proj)

LoRA achieves performance comparable to full fine-tuning on many tasks while using 10-100x fewer trainable parameters.`,

    `## QLoRA and Other PEFT Methods

**QLoRA** combines 4-bit quantization of the base model with LoRA adapters. The base model is loaded in 4-bit NormalFloat format, and LoRA adapters are trained in full precision. This enables fine-tuning a 65B parameter model on a single 48GB GPU.

**Prefix Tuning** prepends trainable virtual tokens to the input at every layer. Only these prefix vectors are trained.

**Adapters** insert small trainable bottleneck layers between existing Transformer layers. The original layers remain frozen.

**Prompt Tuning** learns soft prompt embeddings prepended to the input, trained via backpropagation rather than handcrafted.

All PEFT methods share the goal of achieving task adaptation with minimal parameter updates, enabling fine-tuning on consumer hardware and easy multi-task deployment.`,

    `## Data Preparation

Data quality matters more than quantity for fine-tuning. Guidelines:

**Format**: structure examples as instruction-response pairs, conversations, or input-output pairs depending on the model format. Common templates include Alpaca, ChatML, and ShareGPT formats.

**Quality**: remove duplicates, fix formatting errors, ensure factual correctness. A small set of high-quality examples (1,000-10,000) often outperforms a large noisy dataset.

**Diversity**: cover the breadth of expected inputs. Include edge cases, varying lengths, and different phrasings of similar requests.

**Decontamination**: remove any overlap between training data and evaluation benchmarks to avoid inflated metrics.

**Train/validation split**: always hold out data for validation to detect overfitting. A 90/10 split is common for smaller datasets.`,

    `## When to Fine-Tune vs When Not To

Fine-tuning is appropriate when:
- The task requires specialized knowledge not well represented in the base model
- You need consistent formatting or style that prompting alone cannot achieve
- Latency matters and you want to replace complex prompt chains with a single model call
- You have sufficient high-quality labeled data

Consider alternatives when:
- Few-shot prompting or RAG achieves acceptable results
- The task changes frequently (retraining is expensive)
- You lack enough quality data (risk of overfitting)
- You need the model to stay current (fine-tuned knowledge is static)

A common pattern is to start with prompting, move to RAG if context is needed, and only fine-tune when those approaches fall short.`,
  ],
  interviewQA: [
    {
      q: "How does LoRA reduce memory requirements compared to full fine-tuning?",
      a: "LoRA freezes the entire base model and only trains two small matrices per target layer. For a weight matrix of dimension d x d, LoRA trains matrices of dimension d x r and r x d where r is much smaller than d (e.g., r=16 vs d=4096). This reduces trainable parameters by 100-1000x, proportionally reducing optimizer state memory. The frozen base model parameters do not need gradient storage.",
    },
    {
      q: "What is catastrophic forgetting and how do you mitigate it during fine-tuning?",
      a: "Catastrophic forgetting occurs when fine-tuning on a new task causes the model to lose its pretrained capabilities. Mitigation strategies include using a low learning rate, training for fewer epochs, mixing in a small portion of general-purpose data, using PEFT methods that keep most parameters frozen, and applying regularization. LoRA inherently mitigates forgetting since the base model weights remain unchanged.",
    },
    {
      q: "How does QLoRA make it possible to fine-tune very large models on a single GPU?",
      a: "QLoRA quantizes the base model to 4-bit precision (NormalFloat4), reducing its memory footprint by roughly 4x compared to 16-bit. LoRA adapters are then trained in full precision on top of the quantized model. Additional techniques like paged optimizers and double quantization further reduce memory. This allows a 65B parameter model to fit in 48GB of GPU memory.",
    },
    {
      q: "Why does data quality matter more than quantity for fine-tuning?",
      a: "LLMs already have strong pretrained capabilities. Fine-tuning primarily teaches the model a new format, style, or specialized behavior rather than new knowledge from scratch. A small number of well-crafted, correctly labeled examples (1k-10k) effectively steers the model. Noisy or low-quality data can teach bad patterns and degrade performance. Quality examples also reduce the risk of overfitting since fewer epochs are needed.",
    },
  ],
  mcqs: [
    {
      q: "In LoRA, what does the rank (r) control?",
      options: [
        "The number of layers that are fine-tuned",
        "The dimensionality of the low-rank decomposition matrices",
        "The learning rate schedule",
        "The batch size during training",
      ],
      answerIndex: 1,
      explanation:
        "The rank r determines the inner dimension of the two decomposition matrices A (d x r) and B (r x d). A higher rank allows more expressive updates but increases trainable parameters.",
    },
    {
      q: "What quantization format does QLoRA use for the base model?",
      options: [
        "8-bit integer (INT8)",
        "16-bit floating point (FP16)",
        "4-bit NormalFloat (NF4)",
        "Binary (1-bit)",
      ],
      answerIndex: 2,
      explanation:
        "QLoRA uses 4-bit NormalFloat (NF4) quantization, which is information-theoretically optimal for normally distributed weights.",
    },
    {
      q: "Which PEFT method adds trainable virtual tokens at every layer?",
      options: [
        "LoRA",
        "Prompt tuning",
        "Prefix tuning",
        "Adapter layers",
      ],
      answerIndex: 2,
      explanation:
        "Prefix tuning prepends learnable virtual tokens at every Transformer layer, while prompt tuning only adds them at the input embedding level.",
    },
    {
      q: "What is the primary risk of fine-tuning on a very small dataset?",
      options: [
        "The model becomes too fast at inference",
        "Overfitting to the training examples",
        "The tokenizer vocabulary changes",
        "The model architecture is modified",
      ],
      answerIndex: 1,
      explanation:
        "With few examples, the model can memorize the training data rather than learning generalizable patterns, leading to poor performance on new inputs.",
    },
  ],
  flashcards: [
    {
      front: "What does LoRA stand for?",
      back: "Low-Rank Adaptation -- a method that trains small rank-decomposed matrices while freezing the base model.",
    },
    {
      front: "What is catastrophic forgetting?",
      back: "When fine-tuning on a new task causes the model to lose capabilities it learned during pretraining.",
    },
    {
      front: "What is PEFT?",
      back: "Parameter-Efficient Fine-Tuning -- a family of methods that adapt models by updating only a small fraction of parameters.",
    },
    {
      front: "What is the typical LoRA rank range?",
      back: "4 to 64. Higher ranks are more expressive but increase trainable parameter count.",
    },
    {
      front: "What makes QLoRA memory-efficient?",
      back: "It quantizes the base model to 4-bit and trains LoRA adapters in full precision, reducing total memory by roughly 4x.",
    },
    {
      front: "What is a common fine-tuning data format?",
      back: "Instruction-response pairs (e.g., Alpaca format) or multi-turn conversations (e.g., ChatML, ShareGPT).",
    },
    {
      front: "When should you prefer prompting over fine-tuning?",
      back: "When few-shot prompting achieves acceptable results, the task changes frequently, or you lack sufficient quality training data.",
    },
  ],
  glossary: [
    {
      term: "Full Fine-Tuning",
      definition: "Updating all parameters of a pretrained model on a downstream task dataset.",
    },
    {
      term: "LoRA",
      definition: "Low-Rank Adaptation, a PEFT method that trains small decomposed weight matrices while keeping the base model frozen.",
    },
    {
      term: "QLoRA",
      definition: "Quantized LoRA, combining 4-bit model quantization with LoRA adapters for memory-efficient fine-tuning.",
    },
    {
      term: "PEFT",
      definition: "Parameter-Efficient Fine-Tuning, a family of techniques that adapt models by modifying only a small subset of parameters.",
    },
    {
      term: "Catastrophic Forgetting",
      definition: "The phenomenon where fine-tuning on new data causes a model to lose previously learned capabilities.",
    },
    {
      term: "Adapter Layers",
      definition: "Small trainable bottleneck modules inserted between frozen Transformer layers for task-specific adaptation.",
    },
    {
      term: "Prompt Tuning",
      definition: "Learning soft prompt embeddings prepended to the input via backpropagation rather than manual prompt engineering.",
    },
  ],
};
