import type { TopicContent } from "../types";

export const topKHeap: TopicContent = {
  quickSummary: [
    "To keep the k **largest** items, hold a **min-heap of size k**: the root is the weakest survivor, so a new item only needs one comparison against it.",
    "O(n log k) time and O(k) space — better than sorting's O(n log n) time and O(n) space whenever k is much smaller than n, and it works on a stream you cannot store.",
    "Flip the heap for the mirror problem: k smallest items need a **max-heap** of size k, whose root is the worst kept item.",
  ],
  detailed: [
    "The instinct is to sort and slice, which is correct but does more work than asked: sorting fully orders all n elements when you only care about the boundary between rank k and rank k + 1. A bounded heap discards that extra information. Push the first k elements, then for each remaining element compare it to the root — if it is not better than the weakest survivor, drop it in O(1); otherwise pop the root and push it in O(log k).\n\nCommon mistake: reaching for a **max**-heap for the k largest. That gives you the biggest element at the root, which is exactly the one you never want to evict; you would have to hold all n elements. The heap's polarity is always the *opposite* of the extreme you are collecting.",
    "## When do I reach for this\n\nThree cues. The problem says **\"top k\", \"k largest/smallest\", \"k most frequent\", or \"k closest\"** and k is small relative to n. Or the input is a **stream** — infinite, or too large for memory — so sorting is not even available and you need bounded memory. Or you need to answer top-k repeatedly as data arrives, where a maintained heap gives O(log k) per update instead of a re-sort.\n\nClassic problems it solves:\n\n| Problem | Heap contents |\n| --- | --- |\n| Kth Largest Element in an Array | min-heap of size k, answer is the root |\n| Kth Largest Element in a Stream | same heap, kept alive across `add` calls |\n| Top K Frequent Elements | min-heap of size k ordered by count |\n| K Closest Points to Origin | max-heap of size k ordered by squared distance |\n| Sort Characters By Frequency | heap over the frequency map |\n| Find K Closest Elements | max-heap by distance to the target |",
    "## Cost, and when NOT to use it\n\nBuilding the first k costs O(k), each of the remaining n - k elements costs O(1) on rejection or O(log k) on acceptance, so worst case is **O(n log k) time, O(k) space**. Compare the alternatives:\n\n| Approach | Time | Space | Streaming |\n| --- | --- | --- | --- |\n| Sort then slice | O(n log n) | O(n) | no |\n| Min-heap of size k | O(n log k) | O(k) | **yes** |\n| Quickselect (nth_element) | O(n) average, O(n²) worst | O(1) | no |\n| Counting sort on bounded keys | O(n + range) | O(range) | no |\n\nIn practice: if the whole array is already in memory, k is close to n, and you do not need the top k *sorted*, `std::nth_element` beats the heap with expected O(n). The heap wins on streams, on repeated queries, and when you want a hard O(n log k) rather than a probabilistic bound.",
    "## Ordering and ties\n\nA C++ `priority_queue` is a max-heap by default; a min-heap is `priority_queue<T, vector<T>, greater<T>>`. For pairs the default comparison is lexicographic, which is usually what you want if you put the ranking key first. Ties at the k-th boundary are broken arbitrarily unless you add a deterministic secondary key — worth saying out loud in an interview, because \"top k frequent\" with ties is otherwise ambiguous. The heap's contents are the answer set but **not in sorted order**; if the output must be sorted, pop k times (O(k log k)) or sort the k survivors.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Kth largest and top-k frequent — min-heap of size k",
      source: `// Kth largest value. The heap holds the k best seen so far; its root is the kth.
int kthLargest(const vector<int>& a, int k) {
    priority_queue<int, vector<int>, greater<int>> minHeap;   // min-heap
    for (int x : a) {
        if ((int)minHeap.size() < k) minHeap.push(x);
        else if (x > minHeap.top()) {      // better than the weakest survivor
            minHeap.pop();
            minHeap.push(x);
        }                                   // else: O(1) rejection
    }
    return minHeap.top();
}
// Time O(n log k), space O(k). Sorting would be O(n log n) time, O(n) space.

// K most frequent elements: count, then run the same bounded heap over counts.
vector<int> topKFrequent(const vector<int>& a, int k) {
    unordered_map<int, int> cnt;
    for (int x : a) ++cnt[x];
    // pair is (count, value) so the default lexicographic order ranks by count.
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> h;
    for (auto& [val, c] : cnt) {
        h.push({c, val});
        if ((int)h.size() > k) h.pop();     // evict the least frequent survivor
    }
    vector<int> out;
    while (!h.empty()) { out.push_back(h.top().second); h.pop(); }
    return out;                             // not sorted by frequency
}
// Time O(n + m log k) with m distinct values, space O(m).`,
    },
    {
      language: "cpp",
      caption: "K closest points (max-heap) and a streaming top-k class",
      source: `// K closest to the origin -> collecting SMALLEST distances -> MAX-heap of size k.
vector<pair<int,int>> kClosest(vector<pair<int,int>>& pts, int k) {
    priority_queue<pair<long long, int>> h;          // max-heap: (dist2, index)
    for (int i = 0; i < (int)pts.size(); ++i) {
        long long d = 1LL * pts[i].first * pts[i].first
                    + 1LL * pts[i].second * pts[i].second;   // no sqrt needed
        h.push({d, i});
        if ((int)h.size() > k) h.pop();               // drop the farthest kept
    }
    vector<pair<int,int>> out;
    while (!h.empty()) { out.push_back(pts[h.top().second]); h.pop(); }
    return out;
}
// Time O(n log k), space O(k). Comparing squared distances avoids floating point.

// Streaming: answer "kth largest so far" after every arrival, in bounded memory.
class KthLargestStream {
    int k;
    priority_queue<int, vector<int>, greater<int>> h;
public:
    explicit KthLargestStream(int k_) : k(k_) {}
    int add(int x) {                          // O(log k) per element
        h.push(x);
        if ((int)h.size() > k) h.pop();
        return h.top();                       // valid once k elements have arrived
    }
};
// Space O(k) regardless of stream length — the reason sorting is not an option here.`,
    },
  ],
  cheatSheet: [
    "k **largest** → **min**-heap of size k (root = weakest survivor). k smallest → max-heap. Polarity is always inverted.",
    "Push while `size < k`; then `if (better than top) { pop(); push(); }` — rejection is O(1).",
    "O(n log k) time, O(k) space. Sorting is O(n log n)/O(n); `nth_element` is O(n) average but not streaming.",
    "C++: max-heap is `priority_queue<T>`; min-heap is `priority_queue<T, vector<T>, greater<T>>`.",
    "The k survivors are unordered — sort or pop them if the output must be ranked.",
  ],
  interviewQA: [
    {
      q: "For the k largest elements, why a min-heap of size k rather than a max-heap?",
      a: "Because the operation you perform most is eviction, and you need O(1) access to the *worst* item currently kept, not the best. A min-heap of size k puts the smallest survivor at the root, so each incoming element is one comparison away from a decision: if it is not greater than the root it cannot belong in the top k and is discarded in O(1); otherwise pop and push in O(log k). A max-heap would expose the largest element at the root, which is the one you would never remove — you would have no cheap way to identify the element to evict, so you would end up holding all n items and popping k times, which is O(n) space and O(n + k log n) time. The same logic mirrored gives the rule of thumb: to keep the k smallest you use a max-heap, because you need the largest kept item at the root. The polarity of the heap is always the opposite of the extreme you are collecting.",
      followUps: [
        "What is the root of the final heap, and why is it exactly the kth largest?",
        "How does this change if elements can be updated after insertion?",
      ],
    },
    {
      q: "Sorting is O(n log n) and the heap is O(n log k). Is the heap always the better choice?",
      a: "No. If k is comparable to n, log k is nearly log n and the heap's advantage vanishes while its constant factor and pointer-chasing make it slower in practice than a cache-friendly sort. If the entire array is in memory and you do not need the results sorted, `std::nth_element` — introselect — partitions in expected O(n) with O(1) extra space, which beats both, at the cost of an O(n²) adversarial worst case and mutating the input. If the keys come from a small bounded range, counting sort gives O(n + range). The heap's real wins are three: streaming input you cannot store or re-read, bounded memory of O(k) regardless of n, and repeated top-k queries as data arrives, where each update is O(log k) instead of a full re-sort. I would state the O(n log k) bound, then ask whether the input is a stream — that single question usually decides the approach.",
      followUps: [
        "How would you do top-k across many machines?",
        "What is the worst case of nth_element and how does introselect avoid it?",
      ],
    },
    {
      q: "Walk through K Closest Points to Origin. What is easy to get wrong?",
      a: "You are collecting the k *smallest* distances, so by the polarity rule the heap must be a **max**-heap keyed on distance, with the farthest kept point at the root ready for eviction. Push each point and pop whenever the size exceeds k; the survivors are the answer. Two traps. First, do not take a square root: the ordering of Euclidean distances is identical to the ordering of squared distances, and comparing squares keeps everything in integers, avoiding both the cost and the precision risk of floating point. Second, use a 64-bit accumulator — with coordinates up to around 10^4 the squares are fine in 32 bits, but the habit of promoting with `1LL *` costs nothing and prevents overflow when the bounds are larger than you assumed. Complexity is O(n log k) time and O(k) space. If the full array is available and k is large, `nth_element` on squared distance is O(n) average and a legitimate alternative to mention.",
      followUps: [
        "How would you return the k points sorted by distance?",
        "What changes for k closest to an arbitrary query point rather than the origin?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Top-k heap polarity rule",
      back: "k largest → min-heap of size k; k smallest → max-heap of size k. The root is the weakest survivor, i.e. the next thing to evict.",
    },
    {
      front: "Top-k with a bounded heap: complexity",
      back: "O(n log k) time, O(k) space. Rejections are O(1). Beats sorting (O(n log n), O(n)) when k << n, and is the only option on a stream.",
    },
    {
      front: "When is a heap the wrong tool for top-k?",
      back: "Array fully in memory, k close to n, output need not be sorted → `nth_element` is O(n) average, O(1) space. Bounded key range → counting sort.",
    },
  ],
};
