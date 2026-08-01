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

  deepDive: [
    `## The Evolution from Full Fine-Tuning to Parameter-Efficient Methods

The early days of transfer learning relied on **full fine-tuning**: take a pretrained model, unfreeze every parameter, and train on your downstream dataset. This worked well for *BERT-scale* models (110M--340M parameters), where a single GPU could comfortably hold the model, optimizer states, and gradients. But as models scaled to **billions and hundreds of billions** of parameters, full fine-tuning became impractical for most practitioners. A single training run for a 70B model can require **8x A100 80GB GPUs** just to fit in memory, and producing a separate full-weight checkpoint per task is prohibitively expensive in storage and serving costs.

This pressure catalyzed the **parameter-efficient fine-tuning (PEFT)** revolution. Methods like *LoRA*, *prefix tuning*, *adapters*, and *prompt tuning* recognized a key insight: the *weight updates* during fine-tuning are typically **low-rank** -- they occupy a small subspace of the full parameter space. By constraining updates to this subspace, PEFT methods reduce trainable parameters by **100--10,000x** while matching or approaching full fine-tuning quality. This shift has **democratized LLM customization**: researchers and startups can now fine-tune a 70B model on a *single consumer GPU* using QLoRA, and enterprises can maintain dozens of task-specific adapters that share one base model deployment. The barrier to entry dropped from \`$10,000+ GPU clusters\` to a \`$1,000 single-GPU setup\`.`,

    `## LoRA's Rank Decomposition: The Mathematics

At its core, LoRA exploits the hypothesis that weight updates during fine-tuning have **low intrinsic rank**. For a pretrained weight matrix **W0** of dimension *d x d*, the fine-tuned weight is expressed as:

\`W = W0 + delta_W = W0 + B * A\`

where **B** is a \`d x r\` matrix, **A** is a \`r x d\` matrix, and the rank \`r << d\` (typically *r = 8 to 64* while *d = 4096 to 8192*). The product **B * A** yields a \`d x d\` update matrix, but it is constrained to rank *r*, meaning it lives in an *r-dimensional subspace*.

**Initialization** is critical: **A** is initialized with a *random Gaussian* distribution, and **B** is initialized to **zero**. This ensures that at the start of training, \`delta_W = B * A = 0\`, so the model begins from the exact pretrained behavior. A scaling factor \`alpha / r\` is applied to the update, where **alpha** is a hyperparameter controlling the magnitude of adaptation.

During the **forward pass**, the output is computed as \`h = W0 * x + (alpha / r) * B * A * x\`. During **backpropagation**, gradients flow through both the frozen \`W0\` path (but *no parameter updates* are applied to W0) and the trainable \`B * A\` path. Only **A** and **B** receive gradient updates, and only their optimizer states (momentum, variance in *AdamW*) are stored. For a layer with a \`4096 x 4096\` weight matrix, full fine-tuning requires storing **16.7M** parameters and their optimizer states; with LoRA at *r = 16*, you store only \`4096 * 16 + 16 * 4096 = 131,072\` trainable parameters -- a **128x reduction**.`,

    `## Practical Considerations for Fine-Tuning Success

**Hyperparameter tuning** is essential. The **learning rate** for LoRA is typically higher than full fine-tuning -- values of \`1e-4\` to \`3e-4\` work well, compared to \`1e-5\` to \`5e-5\` for full fine-tuning. The **rank** *r* controls expressiveness: start with *r = 8* for simple tasks (style transfer, formatting) and increase to *r = 32--64* for complex domain adaptation. The **alpha** parameter scales the update magnitude; a common heuristic is \`alpha = 2 * r\`. **Target modules** determine which layers receive LoRA adapters -- applying to all linear layers (\`q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj\`) generally outperforms targeting only attention layers, at the cost of more trainable parameters.

**Data formatting** must match the model's expected template exactly. A mismatch between training format and inference format is the *most common source of degraded performance*. Use the model's native chat template (accessible via \`tokenizer.chat_template\`), ensure proper **BOS/EOS token** handling, and mask *instruction/system tokens* from the loss computation so the model only learns to generate responses. Validate formatting by decoding a few tokenized examples and inspecting them visually.

**Evaluation strategies** should go beyond loss curves. Use **task-specific benchmarks** (e.g., accuracy on classification, ROUGE for summarization), **human evaluation** for open-ended generation quality, and **regression testing** on general capabilities to detect catastrophic forgetting. Track the \`training loss vs. validation loss\` gap to detect overfitting -- if the gap widens after 1--2 epochs, stop training. For production deployments, A/B test the fine-tuned model against the base model with prompting to ensure the fine-tuning investment yields measurable improvements.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "LoRA fine-tuning concept with LibTorch (PyTorch C++ API)",
      source: `#include <torch/torch.h>
#include <iostream>
#include <string>
#include <vector>

// LoRA adapter layer: W_new = W_frozen + (alpha/r) * B @ A
struct LoRALinearImpl : torch::nn::Module {
    LoRALinearImpl(int64_t in_features, int64_t out_features,
                   int64_t rank = 16, double alpha = 32.0,
                   double dropout = 0.05)
        : rank_(rank), scale_(alpha / rank),
          frozen_(register_module("frozen",
              torch::nn::Linear(in_features, out_features))),
          lora_A_(register_parameter("lora_A",
              torch::randn({rank, in_features}) * 0.01)),
          lora_B_(register_parameter("lora_B",
              torch::zeros({out_features, rank}))),
          dropout_(register_module("dropout",
              torch::nn::Dropout(dropout)))
    {
        // Freeze the original weight -- no gradient updates
        frozen_->weight.set_requires_grad(false);
        if (frozen_->bias.defined())
            frozen_->bias.set_requires_grad(false);
    }

    torch::Tensor forward(torch::Tensor x) {
        auto base_out = frozen_->forward(x);
        // LoRA path: x -> A -> B -> scale
        auto lora_out = dropout_->forward(x);
        lora_out = torch::matmul(lora_out, lora_A_.t());  // (batch, rank)
        lora_out = torch::matmul(lora_out, lora_B_.t());  // (batch, out)
        return base_out + scale_ * lora_out;
    }

    int64_t rank_;
    double scale_;
    torch::nn::Linear frozen_{nullptr};
    torch::Tensor lora_A_, lora_B_;
    torch::nn::Dropout dropout_{nullptr};
};
TORCH_MODULE(LoRALinear);

void print_trainable_parameters(const torch::nn::Module& model) {
    int64_t total = 0, trainable = 0;
    for (const auto& p : model.parameters()) {
        total += p.numel();
        if (p.requires_grad()) trainable += p.numel();
    }
    std::cout << "trainable params: " << trainable
              << " || all params: " << total
              << " || " << (100.0 * trainable / total) << "%\\n";
}

// Example training loop sketch
void train_lora() {
    auto device = torch::kCUDA;
    // Replace a frozen linear with a LoRA-augmented version
    LoRALinear layer(4096, 4096, /*rank=*/16, /*alpha=*/32.0);
    layer->to(device);

    print_trainable_parameters(*layer);
    // Only lora_A and lora_B are trainable (~131K params vs 16.7M frozen)

    torch::optim::AdamW optimizer(
        layer->parameters(), torch::optim::AdamWOptions(2e-4));

    // Training loop (simplified)
    for (int epoch = 0; epoch < 3; ++epoch) {
        auto input = torch::randn({4, 2048, 4096}, device);
        auto target = torch::randn({4, 2048, 4096}, device);
        auto output = layer->forward(input);
        auto loss = torch::mse_loss(output, target);
        optimizer.zero_grad();
        loss.backward();
        optimizer.step();
        std::cout << "Epoch " << epoch << " loss: "
                  << loss.item<float>() << "\\n";
    }

    // Save only the LoRA adapter weights (~small file)
    torch::save({layer->lora_A_, layer->lora_B_},
                "lora-adapter.pt");
}`,
    },
    {
      language: "cpp",
      caption: "QLoRA concept with 4-bit quantization and LoRA adapters in LibTorch",
      source: `#include <torch/torch.h>
#include <iostream>
#include <cstdint>

// Simulated NF4 quantization: pack fp16 weights into 4-bit representation
struct QuantizedLinearImpl : torch::nn::Module {
    QuantizedLinearImpl(int64_t in_features, int64_t out_features)
        : in_(in_features), out_(out_features)
    {
        // Store quantized weights as uint8 (two 4-bit values per byte)
        int64_t packed_size = (in_features * out_features + 1) / 2;
        quantized_weight_ = register_buffer(
            "quantized_weight", torch::zeros({packed_size}, torch::kUInt8));
        // Quantization scale and zero-point per group (group_size=64)
        int64_t n_groups = (in_features * out_features + 63) / 64;
        scales_ = register_buffer(
            "scales", torch::ones({n_groups}, torch::kBFloat16));
        // Double quantization: quantize the scales themselves
        meta_scales_ = register_buffer(
            "meta_scales", torch::ones({(n_groups + 255) / 256}, torch::kFloat32));
    }

    // Dequantize on-the-fly during forward pass
    torch::Tensor forward(torch::Tensor x) {
        // In practice: dequantize 4-bit -> bf16, compute matmul
        // Simplified: return a placeholder showing the concept
        auto weight = dequantize();
        return torch::matmul(x, weight.t());
    }

    torch::Tensor dequantize() {
        // Reconstruct fp16 weights from 4-bit storage + scales
        // (implementation omitted -- uses NF4 lookup table)
        return torch::zeros({out_, in_}, torch::kBFloat16);
    }

    int64_t in_, out_;
    torch::Tensor quantized_weight_, scales_, meta_scales_;
};
TORCH_MODULE(QuantizedLinear);

// QLoRA: frozen 4-bit base + trainable LoRA adapters in full precision
struct QLoRALinearImpl : torch::nn::Module {
    QLoRALinearImpl(int64_t in_f, int64_t out_f,
                    int64_t rank = 64, double alpha = 128.0)
        : scale_(alpha / rank),
          base_(register_module("base", QuantizedLinear(in_f, out_f))),
          lora_A_(register_parameter("lora_A",
              torch::randn({rank, in_f}) * 0.01)),
          lora_B_(register_parameter("lora_B",
              torch::zeros({out_f, rank})))
    {
        // Freeze all base parameters -- only LoRA trains
        for (auto& p : base_->parameters())
            p.set_requires_grad(false);
        for (auto& b : base_->buffers())
            b.set_requires_grad(false);
    }

    torch::Tensor forward(torch::Tensor x) {
        auto base_out = base_->forward(x);             // 4-bit path
        auto lora_out = torch::matmul(x, lora_A_.t()); // full precision
        lora_out = torch::matmul(lora_out, lora_B_.t());
        return base_out + scale_ * lora_out;
    }

    double scale_;
    QuantizedLinear base_{nullptr};
    torch::Tensor lora_A_, lora_B_;
};
TORCH_MODULE(QLoRALinear);

// Training sketch
void train_qlora() {
    // 70B model in 4-bit fits ~35GB; LoRA adapters add ~200MB
    QLoRALinear layer(4096, 4096, /*rank=*/64, /*alpha=*/128.0);

    // Only lora_A and lora_B require gradients
    std::vector<torch::Tensor> trainable;
    for (auto& p : layer->parameters())
        if (p.requires_grad()) trainable.push_back(p);

    // Use AdamW with gradient checkpointing for memory savings
    torch::optim::AdamW optimizer(trainable,
        torch::optim::AdamWOptions(1e-4));

    std::cout << "Trainable LoRA params: "
              << trainable[0].numel() + trainable[1].numel() << "\\n";

    // Save adapter only -- 4-bit base model is NOT saved
    // torch::save({layer->lora_A_, layer->lora_B_},
    //             "qlora-adapter.pt");
}`,
    },
    {
      language: "cpp",
      caption: "Data preparation: formatting examples into ChatML and Alpaca formats",
      source: `#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <stdexcept>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct RawExample {
    std::string instruction;
    std::string input;   // optional
    std::string output;
};

// Format a single example in Alpaca/Stanford format
//   ### Instruction: ...
//   ### Input: ... (optional)
//   ### Response: ...
json format_alpaca(const std::string& instruction,
                   const std::string& input_text,
                   const std::string& output) {
    std::string text;
    text += "### Instruction:\\n" + instruction + "\\n\\n";
    if (!input_text.empty())
        text += "### Input:\\n" + input_text + "\\n\\n";
    text += "### Response:\\n" + output;
    return {{"text", text}};
}

// Format a single example in ChatML format
//   <|im_start|>system\\n...\\n<|im_end|>
//   <|im_start|>user\\n...\\n<|im_end|>
//   <|im_start|>assistant\\n...\\n<|im_end|>
json format_chatml(const std::string& system_prompt,
                   const std::string& user_message,
                   const std::string& assistant_response) {
    std::string text;
    text += "<|im_start|>system\\n" + system_prompt + "<|im_end|>\\n";
    text += "<|im_start|>user\\n" + user_message + "<|im_end|>\\n";
    text += "<|im_start|>assistant\\n" + assistant_response + "<|im_end|>";
    return {{"text", text}};
}

// Convert raw examples to fine-tuning format and save as JSONL
void prepare_dataset(
    const std::vector<RawExample>& raw_data,
    const std::string& output_path,
    const std::string& fmt = "chatml",
    const std::string& system_prompt = "You are a helpful assistant.")
{
    std::vector<json> formatted;
    int skipped = 0;

    for (const auto& ex : raw_data) {
        // Validate required fields
        if (ex.instruction.empty() || ex.output.empty()) {
            ++skipped;
            continue;
        }

        json entry;
        if (fmt == "alpaca") {
            entry = format_alpaca(ex.instruction, ex.input, ex.output);
        } else if (fmt == "chatml") {
            std::string user_msg = ex.instruction;
            if (!ex.input.empty())
                user_msg += "\\n\\nContext: " + ex.input;
            entry = format_chatml(system_prompt, user_msg, ex.output);
        } else {
            throw std::invalid_argument(
                "Unknown format: " + fmt + ". Use 'chatml' or 'alpaca'.");
        }
        formatted.push_back(entry);
    }

    // Write as JSONL
    std::ofstream out(output_path);
    for (const auto& entry : formatted)
        out << entry.dump() << "\\n";

    std::cout << "Wrote " << formatted.size()
              << " examples to " << output_path << "\\n";
    if (skipped)
        std::cout << "Skipped " << skipped
                  << " examples with missing fields\\n";
}

int main() {
    std::vector<RawExample> raw_examples = {
        {"Summarize the following article.",
         "The Federal Reserve raised interest rates by 25 basis points...",
         "The Fed increased rates by 0.25%, signaling continued inflation concerns."},
        {"Write a C++ function to reverse a string.",
         "",
         "std::string reverse(std::string s) {\\n"
         "    std::reverse(s.begin(), s.end());\\n"
         "    return s;\\n}"},
        {"Classify the sentiment of this review.",
         "The product arrived damaged and customer service was unhelpful.",
         "Negative"},
    };

    prepare_dataset(raw_examples, "train_chatml.jsonl", "chatml");
    prepare_dataset(raw_examples, "train_alpaca.jsonl", "alpaca");
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Fine-Tuning Method Decision Tree",
      kind: "flow",
      caption: "Choosing the right fine-tuning approach based on available data, GPU resources, and quality requirements.",
      mermaid: `flowchart TD
    A["Need to customize LLM behavior"] --> B{Task-specific training data available?}
    B -->|No| C["Prompt engineering\nor few-shot prompting"]
    B -->|Yes| D{Knowledge-intensive with external context?}
    D -->|Yes| E["RAG\nRetrieval-Augmented Generation"]
    D -->|No| F{GPU memory available?}
    F -->|"160GB+ multi-GPU"| G{More than 10k quality examples?}
    G -->|Yes| H["Full Fine-Tuning\nall params updated"]
    G -->|No| I["LoRA Fine-Tuning\nlow-rank adapters only"]
    F -->|"24-80GB single GPU"| I
    F -->|"8-24GB consumer GPU"| J["QLoRA Fine-Tuning\n4-bit base + LoRA adapters"]
    F -->|"API only"| K["API-based Fine-Tuning"]
    H --> L["Evaluate on held-out test set"]
    I --> L
    J --> L
    K --> L`,
    },
    {
      title: "LoRA Adapter Architecture",
      kind: "architecture",
      caption: "LoRA injects low-rank adapter matrices alongside frozen pretrained weights; only the adapters are trained.",
      mermaid: `graph LR
    X["Input Activation x"]
    X --> W0["Pretrained Weight W0\nFrozen - not updated"]
    X --> A["Down-Project A\nr x d - Trainable"]
    A --> B["Up-Project B\nd x r - Trainable"]
    B --> SCALE["Scale by alpha / r"]
    W0 -->|"W0 times x"| SUM["Element-wise Addition"]
    SCALE -->|"scaled B A x"| SUM
    SUM --> H["Output Activation h"]`,
    },
    {
      title: "Fine-Tuning Training Pipeline",
      kind: "sequence",
      caption: "Sequence of steps from dataset preparation through training to deployment.",
      mermaid: `sequenceDiagram
    participant DS as Dataset
    participant PREP as Preprocessing
    participant MODEL as Base Model
    participant TRAIN as Trainer
    participant EVAL as Evaluator

    DS->>PREP: Raw task examples
    PREP->>PREP: Tokenize and format prompts
    PREP->>TRAIN: Train / val / test splits
    TRAIN->>MODEL: Load pretrained weights
    MODEL-->>TRAIN: Weights loaded
    TRAIN->>TRAIN: Forward pass + compute loss
    TRAIN->>TRAIN: Backprop + update adapter weights
    TRAIN->>EVAL: Checkpoint after each epoch
    EVAL-->>TRAIN: Validation metrics
    TRAIN->>EVAL: Final checkpoint
    EVAL-->>TRAIN: Test set metrics`,
    },
    {
      title: "Fine-Tuning Approaches Overview",
      kind: "mindmap",
      caption: "Key fine-tuning methods, their tradeoffs, and when to apply each.",
      mermaid: `mindmap
  root((Fine-Tuning))
    Full Fine-Tuning
      All params updated
      Maximum quality
      Highest memory cost
    LoRA
      Low-rank adapters
      0.1-1 percent of params
      Mergeable at inference
    QLoRA
      4-bit quantized base
      LoRA adapters in fp16
      Consumer GPU viable
    RLHF
      Reward model
      PPO training
      Alignment focused
    Data Quality
      Instruction formatting
      Diversity
      Deduplication`,
    },
  ],

  comparison: {
    columns: ["Method", "Trainable Params", "Memory Required", "Quality", "Use Case"],
    rows: [
      [
        "Full Fine-Tuning",
        "**100%** of model params (e.g., 7B for a 7B model)",
        "**Very High** -- 4x model size (model + optimizer + gradients); 7B model needs ~120GB VRAM",
        "**Highest** -- all parameters adapt to the task fully",
        "Large datasets (50k+), *significant domain shift* from pretraining, maximum quality required",
      ],
      [
        "LoRA",
        "**0.1--1%** of model params (e.g., ~13M for a 7B model at r=16)",
        "**Moderate** -- base model in fp16 + small adapter states; 7B model needs ~16GB VRAM",
        "**Near full FT** -- comparable on most tasks, slight gap on extreme distribution shifts",
        "Most fine-tuning scenarios; *single-GPU training*, multi-task deployment with adapter swapping",
      ],
      [
        "QLoRA",
        "**0.1--1%** of model params (same as LoRA)",
        "**Low** -- base model in *4-bit* + adapter in fp16; 7B model needs ~6GB, 70B needs ~35GB",
        "**Near LoRA** -- slight quantization noise, mitigated by NF4 and double quantization",
        "*Consumer GPU* fine-tuning, very large models (70B+) on limited hardware",
      ],
      [
        "Prefix Tuning",
        "**<0.1%** -- only prefix vectors per layer (e.g., ~300K params)",
        "**Low** -- base model frozen, tiny trainable overhead",
        "**Good** -- competitive on NLU tasks, can lag on complex generation",
        "Lightweight adaptation for *classification and NLU*, multi-tenant serving with per-user prefixes",
      ],
      [
        "Prompt Tuning",
        "**<0.01%** -- only soft prompt embeddings (e.g., ~20K params)",
        "**Minimal** -- base model frozen, negligible adapter memory",
        "**Moderate** -- improves with model scale, weaker on small models (<10B)",
        "Extremely *parameter-efficient* adaptation, scales best with very large models (100B+)",
      ],
    ],
  },

  exercises: [
    "You have a **7B parameter model** and a dataset of *5,000 customer support conversations*. Your GPU has **24GB VRAM**. Choose between full fine-tuning, LoRA, and QLoRA. Justify your choice considering memory constraints, dataset size, and expected quality. What `r` (rank) and `alpha` values would you start with?",
    "A fine-tuned model performs well on your *training set* but poorly on new inputs. The **training loss** is `0.05` while the **validation loss** is `1.8`. Diagnose the problem, list *three concrete steps* to fix it, and explain how you would use LoRA's `lora_dropout` parameter as part of the solution.",
    "You need to deploy a *single base model* that serves **four different tasks**: summarization, sentiment analysis, code generation, and translation. Design an architecture using **LoRA adapters** that supports this. Explain how adapter *merging vs. swapping* works and what the trade-offs are for inference latency.",
    "Write the configuration for fine-tuning a model where you apply LoRA to *only the attention layers* (`q_proj`, `v_proj`) vs. *all linear layers*. Compare the expected **trainable parameter count**, **training time**, and **quality** for a 7B model with `r=16`. When would targeting fewer modules be preferable?",
    "Your training data contains examples in **Alpaca format**, but the base model expects **ChatML format**. Describe what will go wrong if you train without fixing the format mismatch. Write a Python function to convert between the two formats, handling edge cases like *empty input fields* and *multi-turn conversations*.",
  ],

  cheatSheet: [
    "**LoRA formula**: `W = W0 + (alpha/r) * B @ A` where B is `d x r`, A is `r x d`, and W0 is *frozen*. Initialize **B = 0** so the model starts from pretrained behavior.",
    "**Learning rate guide**: Full FT uses `1e-5` to `5e-5`; LoRA/QLoRA uses `1e-4` to `3e-4`. LoRA tolerates *higher LR* because fewer parameters means less risk of catastrophic updates.",
    "**Rank selection**: Start with `r=8` for *style/format tasks*, `r=16-32` for *domain adaptation*, `r=64` for *complex reasoning*. Set `alpha = 2 * r` as default.",
    "**QLoRA memory formula**: ~`model_params * 0.5 bytes` (4-bit) + `LoRA params * 4 bytes` (fp16 + optimizer). A *70B model* fits in ~35GB with QLoRA vs. ~280GB with full FT.",
    "**Target modules**: Applying LoRA to `all-linear` layers (attention + MLP) gives **~5% better results** than attention-only, at the cost of ~3x more trainable params.",
    "**Data quality checklist**: Deduplicate, verify format matches `tokenizer.chat_template`, mask instruction tokens from loss, hold out 10% for validation, and *decode + inspect* 5 tokenized examples before training.",
  ],

  revisionNotes: [
    "Fine-tuning weight updates are **low-rank** in practice -- LoRA exploits this by decomposing `delta_W` into two small matrices `B (d x r)` and `A (r x d)`, reducing trainable parameters by **100--1000x** while preserving quality.",
    "**QLoRA** enables fine-tuning *70B+ models on a single GPU* by combining **4-bit NF4 quantization** of the base model with LoRA adapters trained in full precision, plus *paged optimizers* and *double quantization*.",
    "**Data quality > data quantity** for fine-tuning. A curated set of *1,000--10,000 well-formatted examples* typically outperforms a noisy 100K dataset. Always match the model's *exact chat template* and mask non-response tokens from the loss.",
    "Use **prompting first**, then **RAG** for knowledge-intensive tasks, and only fine-tune when those approaches fall short. Fine-tuning is best for *consistent style/format*, *latency reduction* (replacing prompt chains), and *specialized domain adaptation*.",
    "**Evaluation must be multi-dimensional**: track `training vs. validation loss` for overfitting, use *task-specific metrics* (accuracy, ROUGE, etc.), run *regression tests* on general capabilities, and A/B test against the prompted baseline before deploying.",
  ],
};
