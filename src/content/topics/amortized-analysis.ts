import type { TopicContent } from "../types";

export const amortizedAnalysis: TopicContent = {
  quickSummary: [
    "Amortized analysis finds the average cost per operation over a worst-case sequence of operations — it is NOT average-case analysis (which assumes a probability distribution over inputs).",
    "Three techniques: aggregate method (total cost / number of ops), accounting method (assign credits to cheap ops to pay for expensive ones), and potential method (define a potential function measuring 'stored work').",
    "Classic example: dynamic array append is O(1) amortized even though individual resizes cost O(n), because resizes happen exponentially less frequently.",
    "Amortized bounds guarantee total cost across all operations — no single operation's actual cost is changed, but the average is bounded.",
  ],
  detailed: [
    "Amortized analysis answers the question: if I perform n operations in sequence, what is the average cost per operation in the worst case? Unlike average-case analysis, which reasons about expected behavior over random inputs, amortized analysis provides a hard guarantee: the total cost of any sequence of n operations is at most n times the amortized cost. No randomness or probability is involved. This makes amortized bounds stronger than average-case bounds because they hold for every possible sequence of operations.",
    "The aggregate method is the simplest approach. You compute the total cost of n operations in the worst case and divide by n. For a dynamic array that doubles its capacity when full, consider n appends starting from capacity 1. Resizes happen at insertions 1, 2, 4, 8, ..., 2^k where 2^k ≤ n. The total resize cost is 1 + 2 + 4 + ... + 2^k < 2n. Adding the n O(1) non-resize costs gives a total under 3n. Dividing by n yields O(1) amortized cost per append.",
    "The accounting method assigns an amortized cost (a 'charge') to each operation. If the charge exceeds the actual cost, the surplus is stored as credit on data structure elements. If the actual cost exceeds the charge, credits must cover the deficit. The key invariant: total credits must never go negative, ensuring the total amortized cost is an upper bound on the total actual cost. For dynamic arrays, charge 3 units per insertion: 1 for the insertion itself, 1 saved for this element's future copy during a resize, and 1 to help pay for copying an element that was already present. When a resize occurs, each element's stored credit pays for its own copy.",
    "The potential method formalizes the accounting method using a potential function Φ that maps the data structure's state to a non-negative real number. The amortized cost of operation i is defined as: â_i = c_i + Φ(D_i) - Φ(D_{i-1}), where c_i is the actual cost and D_i is the state after operation i. Summing over n operations, the total amortized cost equals the total actual cost plus Φ(D_n) - Φ(D_0). If Φ(D_n) ≥ Φ(D_0) (ensured by choosing Φ so it is non-negative and starts at 0), the total amortized cost upper bounds the total actual cost. For dynamic arrays, Φ = 2·size - capacity gives each append an amortized cost of O(1).",
    "Amortized analysis applies far beyond dynamic arrays. Splay trees use the potential method to show that any sequence of m operations on an n-node tree costs O(m log n) total, giving O(log n) amortized per operation — even though individual operations can cost O(n). Union-find with path compression and union by rank achieves O(α(n)) amortized per operation, where α is the inverse Ackermann function (effectively constant for all practical inputs). Incrementing a binary counter has O(1) amortized cost per increment despite occasional O(log n) carry propagation, as shown by the aggregate method: bit position k flips every 2^k increments.",
  ],
  deepDive: [
    "The potential method's power lies in choosing the right potential function. A good Φ should be high when the data structure is in a state that makes expensive operations likely, and low when it is in a 'relaxed' state. For dynamic arrays, Φ = 2·size - capacity captures the idea that as the array fills up (potential increases), a resize becomes imminent. After a resize doubles the capacity, the potential drops dramatically, offsetting the high actual cost. The art of amortized analysis is finding a Φ that makes the amortized costs simple and uniform.",
    "Splay trees are a remarkable application of amortized analysis. There is no explicit balance condition — the tree can be arbitrarily unbalanced after any single operation. Yet the Access Lemma proves that any sequence of m splays on an n-node tree takes O((m+n) log n) time. The potential function is Φ = Σ log(size(v)) over all nodes v, where size(v) is the number of descendants. This captures the intuition that heavily unbalanced subtrees have high potential and will be restructured (reducing potential) during future splays. The static optimality theorem shows splay trees are within a constant factor of the best static BST for any access sequence.",
    "Union-find's amortized analysis is among the most sophisticated in computer science. With both union by rank and path compression, Tarjan proved that m operations on n elements cost O(m·α(n)), where α(n) is the inverse Ackermann function. α(n) ≤ 4 for any n up to the number of atoms in the universe (≈10^80), so the bound is effectively O(m). The potential function assigns a weight to each node based on its rank and the length of its find path. Path compression shortens paths (reducing potential) while union by rank controls tree height. This is provably optimal: Fredman and Saks showed that Ω(m·α(n)) is a lower bound for any union-find implementation.",
    "A subtle but important distinction: amortized analysis applies to a data structure (a fixed sequence of operations), not to individual operations used in different contexts. If you use a dynamic array inside a loop that is itself inside another amortized argument, you cannot simply compose the amortized bounds — you need to re-analyze the combined system. Similarly, if an algorithm abandons a data structure mid-sequence (e.g., exception handling), the amortized guarantee may not hold for the partial sequence unless the potential function is non-negative at every intermediate state.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Dynamic array with amortized O(1) append — tracking resize costs",
      source: `#include <iostream>
#include <stdexcept>
#include <iomanip>

// Demonstrates amortized O(1) append with capacity doubling.
class DynamicArray {
public:
    DynamicArray()
        : data_(new int[1]), size_(0), capacity_(1), total_cost_(0) {}

    ~DynamicArray() { delete[] data_; }

    void append(int value) {
        if (size_ == capacity_) {
            resize(2 * capacity_);  // double the capacity
        }
        data_[size_] = value;
        ++size_;
        ++total_cost_;              // O(1) for the insertion itself
    }

    std::size_t size() const { return size_; }
    long long totalCost() const { return total_cost_; }

    int operator[](std::size_t idx) const {
        if (idx < size_) return data_[idx];
        throw std::out_of_range("index out of range");
    }

private:
    void resize(std::size_t new_cap) {
        int* new_data = new int[new_cap];
        for (std::size_t i = 0; i < size_; ++i) {  // copy all existing elements
            new_data[i] = data_[i];
        }
        total_cost_ += static_cast<long long>(size_); // O(n) copy cost
        delete[] data_;
        data_ = new_data;
        capacity_ = new_cap;
    }

    int* data_;
    std::size_t size_;
    std::size_t capacity_;
    long long total_cost_;
};

// Demonstration: n appends, total cost < 3n => amortized O(1)
int main() {
    DynamicArray arr;
    for (int i = 0; i < 1000; ++i) {
        arr.append(i);
    }
    std::cout << "Size: " << arr.size()
              << ", Total cost: " << arr.totalCost() << "\\n";
    std::cout << std::fixed << std::setprecision(2)
              << "Amortized cost per append: "
              << static_cast<double>(arr.totalCost()) / arr.size() << "\\n";
    // Output: Amortized cost per append is ~3.00 or less
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Binary counter increment — amortized O(1) per increment",
      source: `#include <iostream>
#include <vector>
#include <iomanip>
#include <cstdint>

// k-bit binary counter. Increment flips bits; amortized O(1) per increment.
class BinaryCounter {
public:
    explicit BinaryCounter(int k = 32)
        : bits_(k, 0), k_(k), total_flips_(0) {}

    void increment() {
        int carry = 0;
        for (int i = 0; i < k_; ++i) {
            int val = bits_[i] + (i == 0 ? 1 : carry);
            bits_[i] = val % 2;
            carry = val / 2;
            ++total_flips_;
            if (carry == 0) break;  // no more carries to propagate
        }
    }

    long long value() const {
        long long result = 0;
        for (int i = 0; i < k_; ++i) {
            if (bits_[i]) result += (1LL << i);
        }
        return result;
    }

    long long totalFlips() const { return total_flips_; }

private:
    std::vector<int> bits_;
    int k_;
    long long total_flips_;
};

// Aggregate method: bit 0 flips every increment (n times),
// bit 1 flips every 2nd (n/2 times), bit 2 every 4th (n/4), ...
// Total flips = n + n/2 + n/4 + ... < 2n => O(1) amortized
int main() {
    BinaryCounter counter;
    const int n = 1000;
    for (int i = 0; i < n; ++i) {
        counter.increment();
    }
    std::cout << "Value: " << counter.value() << "\\n";
    std::cout << "Total flips: " << counter.totalFlips() << "\\n";
    std::cout << std::fixed << std::setprecision(2)
              << "Amortized flips per increment: "
              << static_cast<double>(counter.totalFlips()) / n << "\\n";
    // Output: ~2.00 flips per increment on average
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Dynamic array resize cost pattern",
      kind: "flow",
      caption: "Shows the cost of each append operation: mostly O(1) with occasional O(n) spikes at powers of 2. The total area under the curve is less than 3n.",
    },
    {
      title: "Accounting method credit flow for dynamic array",
      kind: "flow",
      caption: "Each insertion deposits 2 credits. When a resize occurs, each element spends 1 credit to pay for its own copy, leaving zero deficit.",
    },
  ],
  animations: [
    {
      title: "Potential method applied to dynamic array appends",
      steps: [
        {
          label: "Define potential function",
          detail: "Φ(D) = 2·size - capacity. Initially Φ = 2·0 - 1 = -1; we adjust so Φ starts at 0 by using Φ = max(0, 2·size - capacity).",
        },
        {
          label: "Append without resize",
          detail: "Actual cost c_i = 1. Potential increases by 2 (size grows by 1). Amortized cost = 1 + 2 = 3.",
        },
        {
          label: "Append triggering resize (size = capacity = k)",
          detail: "Actual cost = 1 + k (insert + copy k elements). New capacity = 2k, new size = k+1. Φ changes from 2k - k = k to 2(k+1) - 2k = 2.",
        },
        {
          label: "Compute amortized cost of resize append",
          detail: "Amortized = (1 + k) + (2 - k) = 3. Same as non-resize! The potential drop of k-2 absorbs the O(k) copy cost.",
        },
        {
          label: "Verify total bound",
          detail: "Every operation has amortized cost 3. Total amortized cost for n ops = 3n. Since Φ(D_n) ≥ 0 = Φ(D_0), total actual cost ≤ 3n = O(n). Per-operation amortized cost is O(1).",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Method", "Approach", "Strengths", "When to use"],
    rows: [
      [
        "Aggregate",
        "Compute total cost of n ops, divide by n",
        "Simple, direct, no bookkeeping",
        "When all operations are the same type and cost pattern is easy to sum",
      ],
      [
        "Accounting",
        "Assign charges per operation; surplus is credit, deficit is paid from credit",
        "Intuitive 'bank account' metaphor, per-operation reasoning",
        "When different operations have different costs and you want per-op bounds",
      ],
      [
        "Potential",
        "Define Φ mapping state to non-negative real; amortized = actual + ΔΦ",
        "Most powerful and general, yields tight bounds",
        "Complex data structures (splay trees, Fibonacci heaps, union-find)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain why dynamic array append is O(1) amortized.",
      a: "When the array is not full, appending costs O(1). When the array is full (size = capacity), it doubles the capacity and copies all existing elements, costing O(n). However, a resize at size n means the previous resize was at size n/2, and n/2 cheap O(1) appends occurred in between. The total cost of n appends is: n (for the appends themselves) + 1 + 2 + 4 + ... + n (for all resize copies) < n + 2n = 3n. Dividing by n gives O(1) amortized per append. The doubling strategy is key — if capacity grew by a constant (e.g., +10), the amortized cost would be O(n).",
      followUps: [
        "What happens if you grow by 1.5x instead of 2x? Is it still O(1) amortized?",
        "What is the amortized cost of deletion from a dynamic array if you halve capacity when it is 1/4 full?",
      ],
    },
    {
      q: "What is the difference between amortized analysis and average-case analysis?",
      a: "Average-case analysis computes the expected cost assuming a probability distribution over inputs (e.g., 'on a random input, quicksort is O(n log n)'). It does not guarantee the cost for any specific input sequence. Amortized analysis computes the average cost per operation over the worst-case sequence of n operations. It guarantees that for every possible sequence, the total cost is bounded. No probabilities are involved — it is a deterministic worst-case bound on the per-operation average.",
      followUps: [
        "Can amortized cost be worse than worst-case cost for a single operation?",
        "How does expected analysis (randomized algorithms) differ from both?",
      ],
    },
    {
      q: "Describe the potential method and give an example.",
      a: "The potential method defines a potential function Φ that maps the current state of a data structure to a non-negative real number. The amortized cost of operation i is â_i = c_i + Φ(D_i) - Φ(D_{i-1}), where c_i is the actual cost. Summing, total amortized cost = total actual cost + Φ(D_n) - Φ(D_0). If Φ(D_n) ≥ Φ(D_0), the amortized total is an upper bound on the actual total. For a binary counter, let Φ = number of 1-bits. An increment that flips t ones to zeros and one zero to one has actual cost t+1 and potential change (1-t). Amortized cost = (t+1) + (1-t) = 2 = O(1).",
      followUps: [
        "How do you choose a good potential function?",
        "What happens if Φ can go negative?",
      ],
    },
  ],
  followUps: [
    "How is amortized analysis used to prove splay tree operations are O(log n) amortized?",
    "What is the amortized complexity of Fibonacci heap operations and why is it better than binary heaps for Dijkstra's algorithm?",
    "How does the inverse Ackermann function arise in union-find amortized analysis?",
  ],
  mcqs: [
    {
      q: "If a dynamic array doubles its capacity on resize, what is the amortized cost of n append operations?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      answerIndex: 2,
      explanation: "Total cost of n appends is at most 3n (n insertions + geometric series of copies < 2n). Dividing by n gives O(1) amortized.",
    },
    {
      q: "In the accounting method, what must always be true about the total credits?",
      options: [
        "Credits can be negative at intermediate steps",
        "Total credits must never go negative at any point",
        "Credits must equal zero at the end",
        "Each operation must have the same credit",
      ],
      answerIndex: 1,
      explanation: "If credits ever go negative, it means the amortized charges did not cover the actual costs — the amortized bound would be invalid. Non-negative credit balance is the fundamental invariant.",
    },
    {
      q: "Which amortized analysis technique uses a potential function Φ mapping data structure state to a non-negative real?",
      options: ["Aggregate method", "Accounting method", "Potential method", "Probabilistic method"],
      answerIndex: 2,
      explanation: "The potential method defines Φ and computes amortized cost as actual cost plus the change in potential. It is the most general of the three techniques.",
    },
    {
      q: "For a binary counter, what is the amortized cost per increment using the aggregate method?",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      answerIndex: 2,
      explanation: "In n increments, bit 0 flips n times, bit 1 flips n/2 times, bit 2 flips n/4 times, etc. Total flips = n + n/2 + n/4 + ... < 2n. Amortized cost = 2n/n = O(1).",
    },
    {
      q: "Amortized analysis differs from average-case analysis because:",
      options: [
        "It uses probability distributions over inputs",
        "It guarantees per-operation cost in the worst case",
        "It guarantees total cost over a worst-case sequence without using probability",
        "It only applies to randomized algorithms",
      ],
      answerIndex: 2,
      explanation: "Amortized analysis provides a deterministic guarantee on total cost for any operation sequence. It does not assume random inputs or use probability — it bounds the worst-case total.",
    },
  ],
  exercises: [
    "Prove that if a dynamic array grows by a constant amount (e.g., +10) instead of doubling, the amortized cost of append is O(n), not O(1). Hint: the total resize cost becomes an arithmetic series.",
    "Use the potential method with Φ = number of 1-bits to show that incrementing a binary counter has O(1) amortized cost. Write out the amortized cost calculation for an increment that flips k bits.",
    "Implement a stack with a multipop(k) operation that pops min(k, size) elements. Use the accounting method to show that any sequence of n push, pop, and multipop operations has O(n) total cost.",
    "Consider a dynamic table that doubles when full and halves when less than 1/4 full. Define a potential function and prove that both insertions and deletions have O(1) amortized cost.",
  ],
  flashcards: [
    { front: "What is amortized analysis?", back: "A technique for bounding the average cost per operation over a worst-case sequence of n operations. It gives a deterministic guarantee (no probability involved) on total cost." },
    { front: "Name the three methods of amortized analysis.", back: "1) Aggregate method: total cost / n. 2) Accounting method: assign credits to operations. 3) Potential method: define Φ and compute amortized = actual + ΔΦ." },
    { front: "Why is dynamic array append O(1) amortized with doubling?", back: "Resizes cost 1+2+4+...+n < 2n total (geometric series). Adding n O(1) appends gives total < 3n. Per-operation: 3n/n = O(1)." },
    { front: "What is the potential function for a dynamic array?", back: "Φ = 2·size - capacity. It is 0 right after a resize and grows by 2 with each append, reaching capacity just before the next resize — enough to pay for the O(n) copy." },
    { front: "What is the fundamental invariant of the accounting method?", back: "The total stored credit must never go negative at any point during the sequence. This ensures total amortized cost ≥ total actual cost." },
    { front: "What is the amortized cost of union-find operations with path compression and union by rank?", back: "O(α(n)) per operation, where α is the inverse Ackermann function. For all practical purposes, α(n) ≤ 4, so it is effectively O(1)." },
    { front: "How does amortized differ from average-case?", back: "Amortized: deterministic bound on total cost for ANY sequence. Average-case: expected cost assuming a probability distribution over inputs. Amortized is stronger — no randomness assumed." },
    { front: "What is the binary counter amortized cost for increment?", back: "O(1). Bit i flips every 2^i increments, so total flips in n increments = n + n/2 + n/4 + ... < 2n. Average = 2n/n = O(1)." },
  ],
  revisionNotes: [
    "Amortized ≠ average-case. Amortized = worst-case total / n (deterministic). Average-case = expected cost (probabilistic).",
    "Three methods: Aggregate (sum and divide), Accounting (credit/debit per operation), Potential (Φ function, amortized = actual + ΔΦ).",
    "Dynamic array doubling: total resize cost < 2n (geometric series), so O(1) amortized per append. Growing by a constant gives O(n) amortized.",
    "Key invariants: accounting credits never negative; potential function Φ ≥ 0 and Φ_final ≥ Φ_initial.",
    "Applications: dynamic arrays, binary counters, splay trees (O(log n) amortized), union-find (O(α(n)) amortized), Fibonacci heaps.",
  ],
  cheatSheet: [
    "Aggregate: T_total(n) / n — simplest method, works when all ops are the same type",
    "Accounting: assign charges, maintain non-negative credit balance at all times",
    "Potential: â_i = c_i + Φ(D_i) - Φ(D_{i-1}); need Φ ≥ 0 and Φ_final ≥ Φ_initial",
    "Dynamic array doubling: amortized O(1) append; Φ = 2·size - capacity",
    "Binary counter: amortized O(1) increment; Φ = number of 1-bits",
    "Splay tree: O(log n) amortized per operation; Φ = Σ log(subtree sizes)",
  ],
  resources: [
    { label: "CLRS Chapter 17 — Amortized Analysis", kind: "book", note: "Definitive textbook treatment covering all three methods with rigorous proofs." },
    { label: "MIT 6.046J Lecture on Amortized Analysis", kind: "video", note: "Covers aggregate, accounting, and potential methods with dynamic table and splay tree examples." },
    { label: "Tarjan's 'Amortized Computational Complexity' (1985)", kind: "paper", note: "The foundational paper introducing the potential method and its application to splay trees." },
    { label: "Jeff Erickson's Algorithm Notes — Amortized Analysis", kind: "article", note: "Freely available lecture notes with clear explanations and exercises." },
  ],
  glossary: [
    { term: "Amortized cost", definition: "The average cost per operation guaranteed over any worst-case sequence of n operations. Not a probabilistic average — it is a deterministic bound on total cost / n." },
    { term: "Aggregate method", definition: "Amortized technique that computes total worst-case cost of n operations and divides by n to get per-operation amortized cost." },
    { term: "Accounting method", definition: "Amortized technique that assigns a fixed charge (amortized cost) to each operation. Surplus is stored as credit; deficits are paid from stored credit. Credit balance must stay non-negative." },
    { term: "Potential method", definition: "Amortized technique using a potential function Φ(state) → R≥0. Amortized cost = actual cost + Φ(after) - Φ(before). Most general of the three methods." },
    { term: "Potential function (Φ)", definition: "A function mapping a data structure's state to a non-negative real number, representing 'stored work' available to pay for future expensive operations." },
    { term: "Dynamic array (vector)", definition: "A resizable array that doubles capacity when full. Append is O(1) amortized due to the geometric series of resize costs." },
    { term: "Inverse Ackermann function (α)", definition: "An extremely slowly growing function arising in union-find analysis. α(n) ≤ 4 for n up to 2^{2^{2^{65536}}}, making it effectively constant." },
    { term: "Splay tree", definition: "A self-adjusting BST with O(log n) amortized cost per operation, proven using the potential method. No explicit balance information is stored." },
  ],
};
