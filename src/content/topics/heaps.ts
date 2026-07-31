import type { TopicContent } from "../types";

export const heaps: TopicContent = {
  quickSummary: [
    "A heap is a complete binary tree that satisfies the heap property: in a min-heap every parent is smaller than or equal to its children; in a max-heap every parent is larger than or equal to its children.",
    "Heaps are the standard backing structure for priority queues, providing O(log n) insert and O(log n) extract-min/max, with O(1) peek at the top element.",
    "Because a heap is a complete binary tree, it can be stored implicitly in a contiguous array with no pointers: for a node at index i, the left child is at 2i + 1, the right child at 2i + 2, and the parent at floor((i - 1) / 2).",
    "Heapsort sorts in-place in O(n log n) worst case and uses O(1) extra space, but it is not stable and has poor cache locality compared to quicksort or mergesort.",
  ],
  detailed: [
    "A binary heap is a complete binary tree stored as an array. 'Complete' means every level is fully filled except possibly the last, which is filled from left to right. This guarantees the tree height is always floor(log₂ n), bounding all traversal operations at O(log n).",
    "The two fundamental repair operations are sift-up (also called bubble-up or percolate-up) and sift-down (bubble-down, percolate-down, heapify). Sift-up restores the heap property after an insertion at the bottom by swapping the new element upward until it finds a valid parent. Sift-down restores the property after removing the root by placing the last element at the root and swapping it downward with its smaller (min-heap) or larger (max-heap) child until the property holds.",
    "A priority queue is an abstract data type that supports insert, peek (find the highest-priority element), and extract (remove the highest-priority element). Binary heaps are the most common concrete implementation, but other heap variants exist with different trade-offs. For example, Fibonacci heaps offer O(1) amortized insert and decrease-key, which is important for algorithms like Dijkstra's shortest path.",
    "Building a heap from an unordered array can be done in O(n) time using Floyd's bottom-up algorithm, which calls sift-down on each non-leaf node starting from the last internal node back to the root. Although there are O(n / 2) calls to sift-down, the total work sums to O(n) because nodes near the bottom (where most nodes live) have very short sift-down distances.",
    "Heaps appear throughout systems programming and algorithm design: operating system schedulers use priority queues to choose the next process, Dijkstra's algorithm uses a min-heap for efficient relaxation, the median-maintenance problem is solved with two heaps, and external sorting algorithms (like k-way merge) use a min-heap to merge sorted runs.",
  ],
  deepDive: [
    "The O(n) build-heap proof relies on the observation that a complete binary tree of height h has at most ceil(n / 2^(h+1)) nodes at height h. Each node at height h requires at most h swaps during sift-down. Summing over all heights: sum from h=0 to floor(log n) of ceil(n / 2^(h+1)) * h. This series converges to O(n) because sum(h / 2^h) for h = 0 to infinity equals 2. This is a key result: building a heap is linear, not O(n log n).",
    "Fibonacci heaps achieve O(1) amortized insert, find-min, merge, and decrease-key, with O(log n) amortized extract-min. The decrease-key improvement is critical: it drops Dijkstra's complexity from O((V + E) log V) with a binary heap to O(V log V + E) with a Fibonacci heap. However, Fibonacci heaps have large constant factors and poor cache behavior, so binary heaps or pairing heaps often win in practice. Pairing heaps are simpler to implement and empirically competitive, though their theoretical decrease-key bound remains an open problem.",
    "A d-ary heap generalizes the binary heap to d children per node. Increasing d reduces the tree height to log_d(n), speeding up sift-up (and thus insert and decrease-key) to O(log_d n). However, sift-down becomes slower because each level requires d comparisons to find the smallest child, giving O(d * log_d n) for extract-min. In practice, 4-ary heaps often outperform binary heaps on modern hardware due to reduced cache misses, since the shorter tree means fewer memory accesses.",
    "Heapsort works by building a max-heap from the input array in O(n), then repeatedly extracting the maximum (swapping it to the end of the array and sifting down the new root) n - 1 times. Each extraction is O(log n), giving O(n log n) total. Unlike mergesort, heapsort is in-place (O(1) extra space). Unlike quicksort, heapsort has O(n log n) worst-case guarantee. But heapsort's access pattern is cache-unfriendly because sift-down jumps between widely separated array indices, making it 2-3x slower than quicksort in practice on most inputs.",
    "In concurrent and real-time systems, specialized heap variants exist. A concurrent skip-list-based priority queue offers lock-free operations. A calendar queue (used in discrete event simulation) provides O(1) average-case insert and delete-min for events with bounded time horizons. Van Emde Boas trees offer O(log log U) operations when keys are integers in a bounded universe [0, U), though they use O(U) space.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Min-heap with sift-up and sift-down from scratch",
      source: `#include <iostream>
#include <stdexcept>
#include <vector>

class MinHeap {
    std::vector<int> data_;

    int parent(int i) const { return (i - 1) / 2; }
    int left(int i)   const { return 2 * i + 1; }
    int right(int i)  const { return 2 * i + 2; }

    void sift_up(int i) {
        while (i > 0 && data_[i] < data_[parent(i)]) {
            std::swap(data_[i], data_[parent(i)]);
            i = parent(i);
        }
    }

    void sift_down(int i) {
        int n = static_cast<int>(data_.size());
        while (true) {
            int smallest = i;
            int l = left(i), r = right(i);
            if (l < n && data_[l] < data_[smallest]) smallest = l;
            if (r < n && data_[r] < data_[smallest]) smallest = r;
            if (smallest == i) break;
            std::swap(data_[i], data_[smallest]);
            i = smallest;
        }
    }

public:
    void push(int val) {
        data_.push_back(val);
        sift_up(static_cast<int>(data_.size()) - 1);
    }

    int pop() {
        if (data_.empty()) throw std::out_of_range("pop from empty heap");
        int root = data_[0];
        data_[0] = data_.back();
        data_.pop_back();
        if (!data_.empty()) sift_down(0);
        return root;
    }

    int peek() const {
        if (data_.empty()) throw std::out_of_range("peek at empty heap");
        return data_[0];
    }

    size_t size() const { return data_.size(); }
    bool empty() const  { return data_.empty(); }
};

int main() {
    MinHeap h;
    for (int v : {5, 3, 8, 1, 2, 7})
        h.push(v);
    std::cout << h.pop() << "\\n"; // 1
    std::cout << h.pop() << "\\n"; // 2
    std::cout << h.pop() << "\\n"; // 3
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Using std::priority_queue and heap algorithms from <algorithm>",
      source: `#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

int main() {
    // --- Basic usage with heap algorithms ---
    std::vector<int> nums = {5, 3, 8, 1, 2, 7};
    std::make_heap(nums.begin(), nums.end(), std::greater<>{}); // min-heap, O(n)

    // Pop minimum (front after make_heap with greater<>)
    std::pop_heap(nums.begin(), nums.end(), std::greater<>{});
    std::cout << nums.back() << "\\n"; // 1
    nums.pop_back();

    // Push a new value
    nums.push_back(0);
    std::push_heap(nums.begin(), nums.end(), std::greater<>{});
    std::pop_heap(nums.begin(), nums.end(), std::greater<>{});
    std::cout << nums.back() << "\\n"; // 0
    nums.pop_back();

    // --- Priority queue with (priority, task) pairs ---
    // std::priority_queue is a max-heap by default; use greater<> for min-heap
    using Task = std::pair<int, std::string>;
    std::priority_queue<Task, std::vector<Task>, std::greater<Task>> tasks;

    tasks.push({2, "code review"});
    tasks.push({1, "fix prod bug"});
    tasks.push({3, "write tests"});

    while (!tasks.empty()) {
        auto [priority, task] = tasks.top();
        tasks.pop();
        std::cout << "Priority " << priority << ": " << task << "\\n";
    }
    // Priority 1: fix prod bug
    // Priority 2: code review
    // Priority 3: write tests

    // --- Top-k elements using partial_sort ---
    std::vector<int> data = {40, 10, 90, 20, 50, 60, 30, 80, 70};

    // 3 largest: partial_sort puts top 3 at the front (descending)
    std::partial_sort(data.begin(), data.begin() + 3, data.end(), std::greater<>{});
    std::cout << "Top 3:";
    for (int i = 0; i < 3; ++i) std::cout << " " << data[i]; // 90 80 70
    std::cout << "\\n";

    // 3 smallest: partial_sort ascending
    std::partial_sort(data.begin(), data.begin() + 3, data.end());
    std::cout << "Bottom 3:";
    for (int i = 0; i < 3; ++i) std::cout << " " << data[i]; // 10 20 30
    std::cout << "\\n";

    // --- Merging k sorted ranges (using a min-heap) ---
    std::vector<std::vector<int>> sorted_lists = {{1,4,7},{2,5,8},{3,6,9}};
    // Min-heap of (value, list_index, element_index)
    using Entry = std::tuple<int, int, int>;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<>> pq;

    for (int i = 0; i < (int)sorted_lists.size(); ++i)
        if (!sorted_lists[i].empty())
            pq.push({sorted_lists[i][0], i, 0});

    std::vector<int> merged;
    while (!pq.empty()) {
        auto [val, li, ei] = pq.top(); pq.pop();
        merged.push_back(val);
        if (ei + 1 < (int)sorted_lists[li].size())
            pq.push({sorted_lists[li][ei + 1], li, ei + 1});
    }
    std::cout << "Merged:";
    for (int v : merged) std::cout << " " << v; // 1 2 3 4 5 6 7 8 9
    std::cout << "\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Heapsort implementation (in-place, O(n log n) worst case)",
      source: `#include <algorithm>
#include <iostream>
#include <vector>

void sift_down(std::vector<int>& arr, int start, int end) {
    // Repair the max-heap property for node at 'start'
    // within the range [start, end).
    int root = start;
    while (true) {
        int child = 2 * root + 1;
        if (child >= end) break;
        // Pick the larger child
        if (child + 1 < end && arr[child] < arr[child + 1])
            ++child;
        if (arr[root] < arr[child]) {
            std::swap(arr[root], arr[child]);
            root = child;
        } else {
            break;
        }
    }
}

void heapsort(std::vector<int>& arr) {
    int n = static_cast<int>(arr.size());

    // Phase 1: Build a max-heap (Floyd's algorithm, O(n))
    for (int i = n / 2 - 1; i >= 0; --i)
        sift_down(arr, i, n);

    // Phase 2: Repeatedly extract the max to the end
    for (int end = n - 1; end > 0; --end) {
        std::swap(arr[0], arr[end]); // move max to sorted region
        sift_down(arr, 0, end);      // restore heap on reduced range
    }
}

int main() {
    std::vector<int> data = {38, 27, 43, 3, 9, 82, 10};
    heapsort(data);
    for (int v : data) std::cout << v << " ";
    std::cout << "\\n"; // 3 9 10 27 38 43 82
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Binary heap array-to-tree mapping",
      kind: "architecture",
      caption:
        "Shows how array indices [0..n-1] map to a complete binary tree: index 0 is the root, left child of i is 2i+1, right child is 2i+2, parent is floor((i-1)/2).",
    },
    {
      title: "Sift-down / extract-min operation flow",
      kind: "flow",
      caption:
        "Step-by-step flow of removing the root from a min-heap: replace root with last element, then repeatedly swap with the smaller child until the heap property is restored.",
    },
    {
      title: "Heap variant comparison mind map",
      kind: "mindmap",
      caption:
        "Branching diagram of heap variants: binary heap, d-ary heap, binomial heap, Fibonacci heap, pairing heap, and their key trade-offs in insert, extract, decrease-key, and merge.",
    },
  ],
  animations: [
    {
      title: "Inserting into a min-heap (sift-up)",
      steps: [
        {
          label: "Start with heap [1, 3, 5, 7, 4, 6]",
          detail:
            "The existing min-heap is valid. We want to insert the value 2.",
        },
        {
          label: "Append 2 at the end: [1, 3, 5, 7, 4, 6, 2]",
          detail:
            "The new element is placed at index 6 (the next available position to keep the tree complete). Its parent is at index floor((6-1)/2) = 2, which holds value 5.",
        },
        {
          label: "Compare 2 with parent 5: swap",
          detail:
            "2 < 5 violates the min-heap property. Swap them. Array becomes [1, 3, 2, 7, 4, 6, 5]. Now 2 is at index 2; its parent is at index 0, which holds value 1.",
        },
        {
          label: "Compare 2 with parent 1: no swap needed",
          detail:
            "2 > 1, so the heap property is satisfied. Sift-up terminates. Final heap: [1, 3, 2, 7, 4, 6, 5].",
        },
      ],
    },
    {
      title: "Extract-min from a min-heap (sift-down)",
      steps: [
        {
          label: "Start with heap [1, 3, 2, 7, 4, 6, 5]",
          detail:
            "We extract the minimum value 1 from the root (index 0).",
        },
        {
          label: "Move last element to root: [5, 3, 2, 7, 4, 6]",
          detail:
            "Remove the root (1) and replace it with the last element (5). The heap now has 6 elements. The heap property is likely violated at the root.",
        },
        {
          label: "Sift-down: compare 5 with children 3 and 2, swap with 2",
          detail:
            "The smaller child is 2 (index 2). Since 5 > 2, swap them. Array becomes [2, 3, 5, 7, 4, 6]. Now check index 2.",
        },
        {
          label: "Sift-down: compare 5 with child 6, no swap needed",
          detail:
            "At index 2, the only child is 6 (index 5). 5 < 6, so the heap property holds. Sift-down terminates. Final heap: [2, 3, 5, 7, 4, 6].",
        },
      ],
    },
    {
      title: "Building a heap with Floyd's algorithm",
      steps: [
        {
          label: "Unordered array: [4, 10, 3, 5, 1]",
          detail:
            "We want to build a min-heap in O(n) time. Start from the last non-leaf node: index floor(5/2) - 1 = 1.",
        },
        {
          label: "Sift-down at index 1 (value 10)",
          detail:
            "Children of index 1 are index 3 (value 5) and index 4 (value 1). Smallest child is 1. Swap 10 and 1. Array: [4, 1, 3, 5, 10].",
        },
        {
          label: "Sift-down at index 0 (value 4)",
          detail:
            "Children of index 0 are index 1 (value 1) and index 2 (value 3). Smallest child is 1. Swap 4 and 1. Array: [1, 4, 3, 5, 10].",
        },
        {
          label: "Continue sift-down at index 1 (value 4)",
          detail:
            "After the swap, check index 1. Children are index 3 (5) and index 4 (10). 4 < 5 and 4 < 10, so no swap needed. Final min-heap: [1, 4, 3, 5, 10].",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Heap Type",
      "Insert",
      "Extract-Min/Max",
      "Decrease-Key",
      "Merge",
      "Find-Min/Max",
      "Space",
      "Notes",
    ],
    rows: [
      [
        "Binary Min-Heap",
        "O(log n)",
        "O(log n)",
        "O(log n)",
        "O(n)",
        "O(1)",
        "O(n)",
        "Simple array-based; great cache locality; most common in practice",
      ],
      [
        "Binary Max-Heap",
        "O(log n)",
        "O(log n)",
        "O(log n)",
        "O(n)",
        "O(1)",
        "O(n)",
        "Identical structure to min-heap but reverses comparison; used in heapsort",
      ],
      [
        "d-ary Heap",
        "O(log_d n)",
        "O(d log_d n)",
        "O(log_d n)",
        "O(n)",
        "O(1)",
        "O(n)",
        "d=4 often best in practice due to cache lines; shallower tree",
      ],
      [
        "Binomial Heap",
        "O(1) amortized",
        "O(log n)",
        "O(log n)",
        "O(log n)",
        "O(log n) or O(1)",
        "O(n)",
        "Collection of binomial trees; efficient merge makes it useful for mergeable priority queues",
      ],
      [
        "Fibonacci Heap",
        "O(1) amortized",
        "O(log n) amortized",
        "O(1) amortized",
        "O(1)",
        "O(1)",
        "O(n)",
        "Best theoretical bounds; O(1) decrease-key powers Dijkstra; high constant factors in practice",
      ],
      [
        "Pairing Heap",
        "O(1)",
        "O(log n) amortized",
        "O(log n) amortized",
        "O(1)",
        "O(1)",
        "O(n)",
        "Simpler than Fibonacci; empirically fast; exact decrease-key bound is an open problem",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How would you find the kth largest element in an unsorted array?",
      a: "Use a min-heap of size k. Iterate through the array: push each element onto the heap, and if the heap size exceeds k, pop the minimum. After processing all elements, the root of the heap is the kth largest. Time: O(n log k), space: O(k). Alternatively, use quickselect for O(n) average case.",
      followUps: [
        "What if you need the kth smallest instead? (Use a max-heap of size k, or negate values with a min-heap.)",
        "When would quickselect be preferred over the heap approach? (When you can afford O(n) average with O(n^2) worst case, or when k is close to n.)",
        "How would you handle a stream of elements where you need a running kth largest? (Maintain a min-heap of size k; each new element is compared to the root.)",
      ],
    },
    {
      q: "Explain why building a heap from an unordered array is O(n) and not O(n log n).",
      a: "Floyd's build-heap calls sift-down on each non-leaf node from bottom to top. Nodes near the bottom (where most nodes reside) have very short sift-down paths. Specifically, at height h there are at most ceil(n / 2^(h+1)) nodes, each doing at most h swaps. The total work is sum of h * n / 2^(h+1) for h from 0 to log n, which converges to O(n) because the series sum(h / 2^h) = 2.",
      followUps: [
        "Why is a top-down build (repeated insertions) O(n log n)? (Each of the n insertions does sift-up costing O(log n) in the worst case.)",
        "Does build-heap order matter? (Yes, bottom-up is O(n); top-down is O(n log n).)",
      ],
    },
    {
      q: "How do you implement a median-finding data structure using heaps?",
      a: "Maintain two heaps: a max-heap for the lower half and a min-heap for the upper half. When a new number arrives, insert it into the appropriate heap based on comparison with the current median. Then rebalance so the heaps differ in size by at most 1. The median is the top of the larger heap, or the average of both tops if sizes are equal. Insert and find-median are both O(log n).",
      followUps: [
        "What if you also need to support delete-median? (Pop from the larger heap and rebalance.)",
        "How would you extend this to find arbitrary percentiles? (Use order-statistic trees or segment trees instead.)",
      ],
    },
    {
      q: "Compare heapsort with mergesort and quicksort.",
      a: "Heapsort: O(n log n) worst case, in-place (O(1) extra space), not stable, poor cache locality. Mergesort: O(n log n) worst case, stable, but O(n) extra space (for arrays). Quicksort: O(n log n) average, O(n^2) worst case (mitigated by randomized pivot), in-place, not stable, but excellent cache locality and fastest in practice on random data. Heapsort is preferred when you need a guaranteed O(n log n) in-place sort without caring about stability.",
      followUps: [
        "Why is heapsort cache-unfriendly? (Sift-down accesses indices that are exponentially far apart in the array, causing cache misses.)",
        "Can heapsort be made stable? (Not easily, because the extract-and-swap phase destroys relative order of equal elements.)",
      ],
    },
    {
      q: "How does Dijkstra's algorithm use a priority queue, and why does the choice of heap matter?",
      a: "Dijkstra extracts the vertex with the smallest tentative distance (extract-min) and relaxes its neighbors (potentially calling decrease-key). With a binary heap, extract-min and decrease-key are both O(log V), giving O((V + E) log V) total. With a Fibonacci heap, decrease-key drops to O(1) amortized, yielding O(V log V + E). For dense graphs where E is close to V^2, the Fibonacci heap improvement is significant in theory.",
      followUps: [
        "In practice, do people use Fibonacci heaps for Dijkstra? (Rarely; binary heaps or d-ary heaps win due to lower constant factors and better cache behavior.)",
        "What happens if the graph has negative edge weights? (Dijkstra fails; use Bellman-Ford instead.)",
      ],
    },
    {
      q: "How would you merge k sorted linked lists efficiently?",
      a: "Use a min-heap of size k, initialized with the head node of each list. Repeatedly extract the minimum from the heap, append it to the result, and push the extracted node's next pointer (if non-null) into the heap. Total time: O(N log k) where N is the total number of elements across all lists. Space: O(k) for the heap.",
      followUps: [
        "What if the lists are arrays instead of linked lists? (Same approach, but track the current index in each array.)",
        "Could you use a divide-and-conquer approach instead? (Yes, merge pairs of lists log k times, also O(N log k) total.)",
      ],
    },
  ],
  followUps: [
    "How do heaps relate to tree-based data structures like BSTs and tries?",
    "What are binomial heaps and when are they preferred over binary heaps?",
    "How do priority queues apply in graph algorithms beyond Dijkstra (Prim, A*, Huffman)?",
    "What is the relationship between heaps and the selection problem (finding order statistics)?",
    "How do concurrent priority queues work in multithreaded environments?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of inserting an element into a binary min-heap with n elements?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 1,
      explanation:
        "Insertion appends the element to the end of the array (O(1)) and then performs sift-up, which traverses at most the height of the tree: O(log n).",
    },
    {
      q: "Which index formula gives the left child of a node at index i in a 0-indexed array-based heap?",
      options: ["2i", "2i + 1", "2i + 2", "i / 2"],
      answerIndex: 1,
      explanation:
        "In a 0-indexed array, the left child of index i is at 2i + 1, and the right child is at 2i + 2. In a 1-indexed array, the left child would be at 2i.",
    },
    {
      q: "What is the time complexity of building a heap from an unsorted array using Floyd's bottom-up algorithm?",
      options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
      answerIndex: 1,
      explanation:
        "Floyd's algorithm calls sift-down on each non-leaf node starting from the bottom. The total number of swaps across all nodes sums to O(n) because most nodes are near the bottom and require very few swaps.",
    },
    {
      q: "Which heap variant supports O(1) amortized decrease-key, making it theoretically optimal for Dijkstra's algorithm?",
      options: [
        "Binary heap",
        "d-ary heap",
        "Fibonacci heap",
        "Binomial heap",
      ],
      answerIndex: 2,
      explanation:
        "Fibonacci heaps achieve O(1) amortized decrease-key through a lazy structure with cascading cuts. This reduces Dijkstra's complexity to O(V log V + E).",
    },
    {
      q: "Heapsort is:",
      options: [
        "Stable and in-place",
        "Unstable and in-place",
        "Stable and not in-place",
        "Unstable and not in-place",
      ],
      answerIndex: 1,
      explanation:
        "Heapsort is in-place (uses O(1) extra space) but not stable: the swap-to-end step during extraction can change the relative order of equal elements.",
    },
    {
      q: "In a max-heap with n elements, where can the minimum element be found?",
      options: [
        "Always at the root",
        "Always at index n/2",
        "Among the leaf nodes",
        "At the last index only",
      ],
      answerIndex: 2,
      explanation:
        "In a max-heap, the minimum element must be a leaf node because every non-leaf has at least one child that is smaller or equal. The leaves occupy indices floor(n/2) through n-1.",
    },
    {
      q: "What is the worst-case time complexity of heapsort?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      answerIndex: 1,
      explanation:
        "Heapsort always runs in O(n log n) regardless of input order: O(n) to build the heap and O(n log n) for n extractions, each costing O(log n).",
    },
  ],
  exercises: [
    "Implement a max-heap from scratch with insert, extractMax, and peek operations. Verify it by inserting random values and confirming extractMax returns them in descending order.",
    "Given a stream of integers, maintain a data structure that can report the median at any point in O(log n) time per operation. Use two heaps (a max-heap for the lower half and a min-heap for the upper half).",
    "Implement k-way merge: given k sorted arrays, produce a single sorted output using a min-heap. Analyze why this is O(N log k) where N is the total element count.",
    "Modify heapsort to sort in descending order by using a min-heap instead of a max-heap. Compare the number of comparisons with the standard max-heap version.",
    "Implement a priority queue that supports both insert and decrease-key operations using a binary heap and a hash map for index tracking. Use it to implement Dijkstra's shortest path algorithm.",
    "Write a function that finds the k closest points to the origin in 2D. Compare a max-heap solution (O(n log k)) with a full sort solution (O(n log n)) and measure the difference for large n and small k.",
  ],
  flashcards: [
    {
      front: "What property must a binary heap satisfy?",
      back: "It must be a complete binary tree (every level full except possibly the last, filled left to right) AND satisfy the heap order property: in a min-heap each parent <= its children; in a max-heap each parent >= its children.",
    },
    {
      front: "How is a binary heap stored in an array?",
      back: "For 0-indexed array: node at index i has left child at 2i+1, right child at 2i+2, and parent at floor((i-1)/2). No pointers are needed because the tree is complete.",
    },
    {
      front: "What is the time complexity of building a heap using Floyd's algorithm?",
      back: "O(n). Even though sift-down is called on O(n/2) nodes, the total work sums to O(n) because most nodes are near the bottom and require only a few swaps.",
    },
    {
      front: "What is sift-up and when is it used?",
      back: "Sift-up (bubble-up) moves a node upward by swapping it with its parent while the heap property is violated. Used after inserting a new element at the bottom of the heap.",
    },
    {
      front: "What is sift-down and when is it used?",
      back: "Sift-down (bubble-down) moves a node downward by swapping it with its smallest (min-heap) or largest (max-heap) child while the heap property is violated. Used after replacing the root during extract-min/max.",
    },
    {
      front: "What advantage does a Fibonacci heap have over a binary heap?",
      back: "O(1) amortized insert, decrease-key, and merge (vs O(log n) for binary heap). This makes algorithms like Dijkstra asymptotically faster: O(V log V + E) vs O((V+E) log V).",
    },
    {
      front: "Why is heapsort not stable?",
      back: "During the extraction phase, the last element is swapped to the root position, which can place equal-valued elements out of their original relative order.",
    },
    {
      front: "How do you find the kth largest element using a heap?",
      back: "Maintain a min-heap of size k. For each element, push it and pop if size exceeds k. After processing all elements, the heap root is the kth largest. Time: O(n log k).",
    },
    {
      front: "What is the height of a complete binary tree with n nodes?",
      back: "floor(log2(n)). This bounds the cost of sift-up and sift-down at O(log n).",
    },
    {
      front: "How does a d-ary heap differ from a binary heap?",
      back: "Each node has d children instead of 2. The tree is shallower (height = log_d n), making insert faster O(log_d n), but extract-min is slower O(d * log_d n) because sift-down must compare d children at each level.",
    },
  ],
  revisionNotes: [
    "A heap is a complete binary tree with the heap-order property. Min-heap: parent <= children. Max-heap: parent >= children.",
    "Array representation: left child = 2i+1, right child = 2i+2, parent = floor((i-1)/2). No pointers needed.",
    "Insert: append to end, sift-up. O(log n).",
    "Extract-min/max: replace root with last element, sift-down. O(log n).",
    "Peek: return root. O(1).",
    "Build heap (Floyd's): sift-down from last non-leaf to root. O(n), not O(n log n).",
    "Heapsort: build max-heap O(n), then extract max n-1 times O(n log n). Total O(n log n), in-place, not stable.",
    "Priority queue = abstract data type; binary heap = common concrete implementation.",
    "For top-k problems: use a heap of size k for O(n log k) time and O(k) space.",
    "Fibonacci heap: O(1) amortized decrease-key. Critical for Dijkstra's theoretical bound but rarely used in practice.",
    "A d-ary heap with d=4 often beats binary heaps in practice due to better cache utilization.",
    "Median maintenance: max-heap for lower half + min-heap for upper half, rebalance after each insert.",
  ],
  cheatSheet: [
    "Min-heap parent <= children; Max-heap parent >= children",
    "Array indexing (0-based): left = 2i+1, right = 2i+2, parent = (i-1)//2",
    "Insert: O(log n) -- append + sift-up",
    "Extract-min/max: O(log n) -- swap root with last + sift-down",
    "Peek: O(1) -- return arr[0]",
    "Build heap: O(n) -- Floyd's bottom-up sift-down",
    "Heapsort: O(n log n) worst case, O(1) space, unstable",
    "Top-k: min-heap of size k, O(n log k)",
    "Merge k sorted lists: min-heap of size k, O(N log k)",
    "Python: import heapq -- heapify, heappush, heappop, nlargest, nsmallest, merge",
    "Java: PriorityQueue<T> (min-heap by default; pass Comparator.reverseOrder() for max-heap)",
    "C++: std::priority_queue<T> (max-heap by default; use greater<T> for min-heap)",
    "Fibonacci heap: O(1) amortized insert, decrease-key, merge; O(log n) extract-min",
  ],
  resources: [
    {
      label: "Introduction to Algorithms (CLRS) -- Chapter 6: Heapsort",
      kind: "book",
      note: "Definitive textbook treatment of binary heaps, build-heap analysis, and heapsort.",
    },
    {
      label: "Algorithm Design Manual (Skiena) -- Priority Queues",
      kind: "book",
      note: "Practical perspective on when and how to use heaps in real applications.",
    },
    {
      label: "Python heapq module documentation",
      kind: "docs",
      note: "Official reference for Python's min-heap implementation with examples.",
    },
    {
      label: "Fredman & Tarjan - Fibonacci Heaps and Their Uses in Improved Network Optimization Algorithms (1987)",
      kind: "paper",
      note: "The original Fibonacci heap paper proving O(1) amortized decrease-key.",
    },
    {
      label: "MIT OpenCourseWare 6.006 -- Heaps and Heap Sort",
      kind: "video",
      note: "Lecture covering heap operations, build-heap analysis, and heapsort with clear visualizations.",
    },
    {
      label: "Visualgo - Binary Heap Visualization",
      kind: "article",
      note: "Interactive visualization of heap insert, extract, and build-heap operations.",
    },
    {
      label: "Java PriorityQueue documentation",
      kind: "docs",
      note: "Official Java SE docs for the PriorityQueue class, which is backed by a binary min-heap.",
    },
  ],
  glossary: [
    {
      term: "Binary Heap",
      definition:
        "A complete binary tree stored in an array that satisfies the heap-order property (min or max). Supports insert and extract in O(log n).",
    },
    {
      term: "Min-Heap",
      definition:
        "A heap where every parent node is less than or equal to its children. The smallest element is always at the root.",
    },
    {
      term: "Max-Heap",
      definition:
        "A heap where every parent node is greater than or equal to its children. The largest element is always at the root.",
    },
    {
      term: "Priority Queue",
      definition:
        "An abstract data type supporting insert, peek (find highest-priority element), and extract (remove highest-priority element). Commonly implemented with a binary heap.",
    },
    {
      term: "Sift-Up (Bubble-Up)",
      definition:
        "The operation of moving a newly inserted element upward in the heap by swapping with its parent until the heap property is restored.",
    },
    {
      term: "Sift-Down (Heapify)",
      definition:
        "The operation of moving an element downward in the heap by swapping with its smallest (min-heap) or largest (max-heap) child until the heap property is restored.",
    },
    {
      term: "Complete Binary Tree",
      definition:
        "A binary tree in which every level is completely filled except possibly the last, which is filled from left to right. This structure allows array-based storage with no wasted space.",
    },
    {
      term: "Fibonacci Heap",
      definition:
        "A heap data structure consisting of a collection of trees with lazy consolidation. Achieves O(1) amortized insert, decrease-key, and merge, with O(log n) amortized extract-min.",
    },
    {
      term: "Heapsort",
      definition:
        "A comparison-based sorting algorithm that builds a max-heap and repeatedly extracts the maximum. Runs in O(n log n) worst case with O(1) extra space, but is not stable.",
    },
    {
      term: "Floyd's Build-Heap",
      definition:
        "An algorithm that constructs a heap from an unordered array in O(n) time by calling sift-down on each non-leaf node from the bottom level upward.",
    },
    {
      term: "Decrease-Key",
      definition:
        "An operation that reduces the key of an element in the heap and restores the heap property. Critical for graph algorithms like Dijkstra. O(log n) in binary heaps, O(1) amortized in Fibonacci heaps.",
    },
    {
      term: "d-ary Heap",
      definition:
        "A generalization of a binary heap where each node has d children. Reduces tree height to log_d(n) but increases per-level comparison cost to O(d).",
    },
  ],
};
