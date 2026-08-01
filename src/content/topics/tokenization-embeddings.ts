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
      language: "cpp",
      caption: "BPE tokenization from scratch -- training and encoding",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>

// === Simple BPE Tokenizer Implementation ===

using Token = std::string;
using Pair = std::pair<Token, Token>;

struct BPETokenizer {
    std::vector<Pair> merges;          // ordered merge rules
    std::map<Token, int> vocab;        // token -> id

    // Train BPE on a corpus: learn merge rules
    void train(const std::vector<std::string>& corpus, int num_merges) {
        // Initialize: split each word into characters
        std::vector<std::vector<Token>> words;
        std::map<int, int> word_freq;
        for (size_t i = 0; i < corpus.size(); ++i) {
            std::vector<Token> chars;
            for (char c : corpus[i]) chars.push_back(std::string(1, c));
            words.push_back(chars);
            word_freq[i] = 1;
        }

        for (int step = 0; step < num_merges; ++step) {
            // Count adjacent pairs across all words
            std::map<Pair, int> pair_counts;
            for (size_t w = 0; w < words.size(); ++w) {
                for (size_t i = 0; i + 1 < words[w].size(); ++i) {
                    pair_counts[{words[w][i], words[w][i+1]}] += word_freq[w];
                }
            }
            if (pair_counts.empty()) break;

            // Find most frequent pair
            auto best = std::max_element(pair_counts.begin(), pair_counts.end(),
                [](const auto& a, const auto& b) { return a.second < b.second; });
            Pair top_pair = best->first;
            Token merged = top_pair.first + top_pair.second;
            merges.push_back(top_pair);

            // Apply merge to all words
            for (auto& word : words) {
                for (size_t i = 0; i + 1 < word.size(); ) {
                    if (word[i] == top_pair.first && word[i+1] == top_pair.second) {
                        word[i] = merged;
                        word.erase(word.begin() + i + 1);
                    } else { ++i; }
                }
            }
        }

        // Build vocabulary
        int id = 0;
        for (int c = 0; c < 256; ++c) vocab[std::string(1, (char)c)] = id++;
        for (const auto& [p1, p2] : merges) vocab[p1 + p2] = id++;
    }

    // Encode a string using learned merges
    std::vector<int> encode(const std::string& text) const {
        std::vector<Token> tokens;
        for (char c : text) tokens.push_back(std::string(1, c));

        // Apply merges in order
        for (const auto& [p1, p2] : merges) {
            for (size_t i = 0; i + 1 < tokens.size(); ) {
                if (tokens[i] == p1 && tokens[i+1] == p2) {
                    tokens[i] = p1 + p2;
                    tokens.erase(tokens.begin() + i + 1);
                } else { ++i; }
            }
        }

        std::vector<int> ids;
        for (const auto& t : tokens) {
            auto it = vocab.find(t);
            ids.push_back(it != vocab.end() ? it->second : -1);
        }
        return ids;
    }
};

int main() {
    BPETokenizer bpe;
    std::vector<std::string> corpus = {"low", "lower", "lowest", "low", "low"};
    bpe.train(corpus, 10);

    std::cout << "Merge rules learned:\\n";
    for (const auto& [a, b] : bpe.merges)
        std::cout << "  " << a << " + " << b << " -> " << a + b << "\\n";

    auto ids = bpe.encode("lowest");
    std::cout << "\\nToken IDs for 'lowest': ";
    for (int id : ids) std::cout << id << " ";
    std::cout << "\\nVocab size: " << bpe.vocab.size() << "\\n";
}`,
    },
    {
      language: "cpp",
      caption: "Computing and comparing embeddings with cosine similarity",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <iomanip>
#include <numeric>

// === Embedding Operations (vectors assumed pre-computed) ===

using Embedding = std::vector<double>;

double dot_product(const Embedding& a, const Embedding& b) {
    return std::inner_product(a.begin(), a.end(), b.begin(), 0.0);
}

double norm(const Embedding& v) {
    return std::sqrt(dot_product(v, v));
}

double cosine_similarity(const Embedding& a, const Embedding& b) {
    double d = dot_product(a, b);
    double na = norm(a), nb = norm(b);
    return (na > 0 && nb > 0) ? d / (na * nb) : 0.0;
}

void normalize(Embedding& v) {
    double n = norm(v);
    if (n > 0) for (auto& x : v) x /= n;
}

int main() {
    // Simulated 4-dimensional embeddings (in practice, 384-3072 dims)
    // Pre-computed from a sentence embedding model
    std::vector<std::string> sentences = {
        "The cat sat on the mat.",
        "A kitten was resting on the rug.",
        "Stock prices surged after the earnings report.",
        "The feline lounged on the carpet.",
    };

    std::vector<Embedding> embeddings = {
        {0.8, 0.5, 0.1, 0.2},   // cat/mat
        {0.75, 0.55, 0.05, 0.25}, // kitten/rug
        {0.1, 0.05, 0.9, 0.8},  // stocks
        {0.78, 0.52, 0.08, 0.22}, // feline/carpet
    };

    // L2-normalize embeddings
    for (auto& emb : embeddings) normalize(emb);

    std::cout << "Embedding dimension: " << embeddings[0].size() << "\\n";
    std::cout << "Vector norm (should be ~1.0): "
              << std::fixed << std::setprecision(4) << norm(embeddings[0]) << "\\n";

    // Compute pairwise cosine similarity matrix
    // For normalized vectors, cosine similarity = dot product
    size_t n = sentences.size();
    std::vector<std::vector<double>> sim_matrix(n, std::vector<double>(n));

    for (size_t i = 0; i < n; ++i)
        for (size_t j = 0; j < n; ++j)
            sim_matrix[i][j] = dot_product(embeddings[i], embeddings[j]);

    std::cout << "\\nPairwise Cosine Similarity Matrix:\\n";
    for (size_t i = 0; i < n; ++i)
        std::cout << "  [" << i << "] " << sentences[i].substr(0, 50) << "\\n";

    std::cout << "\\n";
    for (size_t i = 0; i < n; ++i) {
        std::cout << "  [" << i << "]";
        for (size_t j = 0; j < n; ++j)
            std::cout << " " << std::setprecision(3) << sim_matrix[i][j];
        std::cout << "\\n";
    }

    // Find the most similar pair (excluding self-similarity)
    double best_score = -2.0;
    size_t best_i = 0, best_j = 0;
    for (size_t i = 0; i < n; ++i)
        for (size_t j = i + 1; j < n; ++j)
            if (sim_matrix[i][j] > best_score) {
                best_score = sim_matrix[i][j];
                best_i = i; best_j = j;
            }

    std::cout << "\\nMost similar pair (score=" << best_score << "):\\n";
    std::cout << "  [" << best_i << "] " << sentences[best_i] << "\\n";
    std::cout << "  [" << best_j << "] " << sentences[best_j] << "\\n";
}`,
    },
    {
      language: "cpp",
      caption: "Dimensionality reduction with PCA for embedding visualization",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <numeric>
#include <iomanip>
#include <algorithm>
#include <fstream>

// === Simple PCA-based Dimensionality Reduction for Embeddings ===

using Embedding = std::vector<double>;

Embedding subtract(const Embedding& a, const Embedding& b) {
    Embedding r(a.size());
    for (size_t i = 0; i < a.size(); ++i) r[i] = a[i] - b[i];
    return r;
}

double dot(const Embedding& a, const Embedding& b) {
    return std::inner_product(a.begin(), a.end(), b.begin(), 0.0);
}

Embedding mean_embedding(const std::vector<Embedding>& embeddings) {
    size_t dim = embeddings[0].size();
    Embedding m(dim, 0.0);
    for (const auto& e : embeddings)
        for (size_t i = 0; i < dim; ++i) m[i] += e[i];
    for (auto& v : m) v /= embeddings.size();
    return m;
}

// Power iteration to find the dominant eigenvector of the covariance matrix
Embedding power_iteration(const std::vector<Embedding>& centered, int iters = 100) {
    size_t dim = centered[0].size();
    Embedding v(dim, 1.0);  // initial guess
    for (int it = 0; it < iters; ++it) {
        Embedding new_v(dim, 0.0);
        for (const auto& x : centered) {
            double d = dot(x, v);
            for (size_t i = 0; i < dim; ++i) new_v[i] += d * x[i];
        }
        double norm = std::sqrt(dot(new_v, new_v));
        for (auto& val : new_v) val /= norm;
        v = new_v;
    }
    return v;
}

struct Point2D { double x, y; std::string label; int index; };

int main() {
    // Simulated 8-dimensional embeddings for sentences in 3 clusters
    std::vector<std::string> labels = {
        "animal","animal","animal","animal",
        "tech","tech","tech","tech",
        "food","food","food","food"
    };

    // Pre-computed embeddings (simulated, 8-dim)
    std::vector<Embedding> embeddings = {
        {0.9, 0.8, 0.1, 0.2, 0.05, 0.1, 0.7, 0.6},  // animal cluster
        {0.85, 0.75, 0.15, 0.18, 0.08, 0.12, 0.72, 0.58},
        {0.88, 0.82, 0.12, 0.22, 0.06, 0.09, 0.68, 0.62},
        {0.92, 0.78, 0.11, 0.19, 0.07, 0.11, 0.71, 0.59},
        {0.1, 0.15, 0.9, 0.85, 0.8, 0.75, 0.1, 0.12},  // tech cluster
        {0.12, 0.18, 0.88, 0.82, 0.78, 0.72, 0.08, 0.15},
        {0.08, 0.12, 0.92, 0.88, 0.82, 0.78, 0.12, 0.1},
        {0.11, 0.14, 0.87, 0.84, 0.79, 0.74, 0.09, 0.13},
        {0.4, 0.45, 0.3, 0.35, 0.2, 0.9, 0.85, 0.1},  // food cluster
        {0.42, 0.48, 0.28, 0.32, 0.22, 0.88, 0.82, 0.12},
        {0.38, 0.43, 0.32, 0.38, 0.18, 0.92, 0.87, 0.08},
        {0.41, 0.46, 0.29, 0.34, 0.21, 0.89, 0.84, 0.11},
    };

    std::cout << "Original embedding dimensions: " << embeddings[0].size() << "\\n";

    // Center the data
    Embedding m = mean_embedding(embeddings);
    std::vector<Embedding> centered;
    for (const auto& e : embeddings) centered.push_back(subtract(e, m));

    // Find first principal component via power iteration
    Embedding pc1 = power_iteration(centered);

    // Deflate and find second principal component
    std::vector<Embedding> deflated = centered;
    for (auto& x : deflated) {
        double proj = dot(x, pc1);
        for (size_t i = 0; i < x.size(); ++i) x[i] -= proj * pc1[i];
    }
    Embedding pc2 = power_iteration(deflated);

    // Project embeddings onto 2D
    std::vector<Point2D> points;
    for (size_t i = 0; i < embeddings.size(); ++i) {
        points.push_back({
            dot(centered[i], pc1),
            dot(centered[i], pc2),
            labels[i],
            static_cast<int>(i)
        });
    }

    // Output projected 2D coordinates by cluster
    std::cout << "\\nPCA Projection to 2D:\\n";
    for (const auto& p : points) {
        std::cout << "  [" << std::setw(2) << p.index << "] "
                  << std::setw(8) << p.label << " -> ("
                  << std::fixed << std::setprecision(3) << p.x << ", "
                  << p.y << ")\\n";
    }

    // Write to CSV for external plotting
    std::ofstream csv("embedding_pca.csv");
    csv << "index,label,x,y\\n";
    for (const auto& p : points)
        csv << p.index << "," << p.label << "," << p.x << "," << p.y << "\\n";
    std::cout << "\\nProjection saved to embedding_pca.csv\\n";
}`,
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
