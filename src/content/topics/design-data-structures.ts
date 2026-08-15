import type { TopicContent } from "../types";

export const designDataStructures: TopicContent = {
  quickSummary: [
    "The whole family is one move: **pair a hash map with a second structure**. The map gives O(1) lookup; the partner (list, array, stack, heap) gives the ordering, recency, or randomness the map cannot.",
    "Recognition cue: the prompt says *design a structure supporting X and Y in O(1)* and no single container does both — that mismatch is the hint, not a trap.",
    "The map never stores the payload, it stores a **handle** — an iterator or an index — into the partner structure. Keeping that handle valid is where the bugs live.",
  ],
  detailed: [
    "## The pairing technique\n\nNo single standard container gives you both content-addressed lookup and positional structure. A hash map finds a key in O(1) but has no order; a list or array has order but O(n) search. So you keep both and make the map point *into* the other one.\n\n| Need | Map value | Partner | Gives you |\n| --- | --- | --- | --- |\n| Recency eviction (LRU) | list iterator | doubly linked list | O(1) move-to-front, O(1) evict tail |\n| Random element (RandomizedSet) | array index | `vector` | O(1) uniform pick |\n| Frequency buckets (LFU) | node handle | list of lists | O(1) promote across buckets |\n| Ordered keys | — | balanced BST / skip list | O(log n) predecessor |\n\nKey insight: ask \"which operation cannot be O(1) with only a hash map?\" The answer names the partner structure you need.",
    "## LRU cache — hash map plus doubly linked list\n\nThe list holds `(key, value)` pairs ordered most-recent-first; the map sends a key to its **iterator** in that list. `get` finds the iterator, splices its node to the front, returns the value. `put` either updates and splices, or — when at capacity — reads the key off the tail, erases it from the map, pops the tail, and pushes the new pair at the front.\n\nWhy a *doubly* linked list: eviction removes from the tail, and unlinking a node in O(1) needs its predecessor, which only a back pointer provides.\n\nWarning: with `std::list`, use `splice` to move a node, never erase-and-reinsert. `splice` relinks the existing node so every iterator stays valid, including the one already stored in your map; erase invalidates that iterator and leaves the map pointing at freed memory. This is the single most common bug in the C++ version of this problem.\n\nBoth operations are O(1) expected. Space is O(capacity).",
    "## Min stack — auxiliary stack or encoded deltas\n\nA stack with `push`, `pop`, `top` and `getMin` all in O(1). The straightforward answer keeps a second stack of running minima: on push, store `min(x, currentMin)`; on pop, pop both. Now `getMin` is just the auxiliary top. O(1) everywhere, O(n) extra space.\n\nThe space-tightening variant stores each element **encoded relative to the minimum at the time of the push**: push `2*x - min` when `x < min` and update `min = x`, otherwise push `x` unchanged. A stored value below the current min signals \"this push changed the minimum\", and the previous min is recovered as `2*min - stored`. It is O(1) auxiliary space, but it can overflow (use a wider integer for the stored values) and it is genuinely harder to read — I mention it as a follow-up rather than leading with it.\n\nRelated: **Min Stack**, **Max Stack**, and building a queue with O(1) amortised min from two such stacks.",
    "## Insert / delete / getRandom in O(1)\n\nRandom access in O(1) demands a contiguous array; deletion from the middle of an array is O(n) — unless order does not matter. It does not, so: keep a `vector` of values plus a map from value to its index. To delete, **swap the doomed element with the last one**, fix the moved element's index in the map, then `pop_back`. `getRandom` is one modulo on the vector size.\n\nCommon mistake: erasing the map entry before writing the moved element's new index, or mishandling the case where the deleted element *is* the last one — there the write and the erase target the same key, so erase must come last. Guard it explicitly or the map ends up with a stale entry pointing past the end.\n\nAll three operations O(1) expected, O(n) space. Classic problem: **Insert Delete GetRandom O(1)** (and the duplicates-allowed variant, where the map's value becomes a set of indices).",
    "## What interviewers are actually testing\n\nLess the data structure, more the API discipline: what happens on `get` of a missing key, on `put` with capacity zero, on `pop` of an empty stack, on `getRandom` of an empty set. State your contract before you code.\n\nIn practice: say the complexity of every method out loud as you finish it, and say **expected** O(1) for hash-map operations rather than plain O(1) — worst case is O(n) under adversarial collisions, and acknowledging that unprompted reads as rigour. If thread safety comes up, note that these structures need external locking, and that a real cache would shard by key to avoid one global mutex.",
  ],
  code: [
    {
      language: "cpp",
      caption: "LRU cache — std::list + unordered_map of iterators; splice keeps the stored iterators valid",
      source: `class LRUCache {
    int cap;
    // Most-recent at the FRONT. Node stores the key too, so eviction can
    // find the map entry to erase from the tail node alone.
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> pos;

public:
    explicit LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        // splice RELINKS the node in place: it->second stays valid.
        // erase + push_front would dangle the iterator held in the map.
        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) {                     // update + promote
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            return;
        }
        if (cap <= 0) return;                      // degenerate capacity
        if ((int)order.size() == cap) {            // evict the tail
            pos.erase(order.back().first);
            order.pop_back();
        }
        order.emplace_front(key, value);
        pos[key] = order.begin();
    }
};
// get and put: O(1) expected. Space O(capacity).`,
    },
    {
      language: "cpp",
      caption: "Min stack (auxiliary stack) and insert/delete/getRandom in O(1) (vector + index map)",
      source: `class MinStack {
    vector<int> data;
    vector<int> mins;          // mins[i] = min of data[0..i]
public:
    void push(int x) {
        data.push_back(x);
        mins.push_back(mins.empty() ? x : min(x, mins.back()));
    }
    void pop() {               // caller must not pop an empty stack
        data.pop_back();
        mins.pop_back();
    }
    int top()    const { return data.back(); }
    int getMin() const { return mins.back(); }
};
// All four operations O(1) worst case. Space O(n).
// Delta-encoded variant trades that O(n) for O(1) at the cost of
// overflow risk and readability — mention it, don't lead with it.

class RandomizedSet {
    vector<int> vals;                  // dense, so getRandom is one modulo
    unordered_map<int, int> idx;       // value -> its position in vals
public:
    bool insert(int x) {
        if (idx.count(x)) return false;
        idx[x] = (int)vals.size();
        vals.push_back(x);
        return true;
    }
    bool remove(int x) {
        auto it = idx.find(x);
        if (it == idx.end()) return false;
        int i = it->second;
        int last = vals.back();
        vals[i] = last;                // overwrite the hole with the tail
        idx[last] = i;                 // fix the moved element's index...
        vals.pop_back();
        idx.erase(x);                  // ...and erase LAST, so x == last is safe
        return true;
    }
    int getRandom() const {            // assumes non-empty
        return vals[rand() % vals.size()];
    }
};
// insert / remove / getRandom: O(1) expected. Space O(n).`,
    },
  ],
  cheatSheet: [
    "Hash map for O(1) lookup + a second structure for the ordering it lacks. The map stores a **handle**, not the payload.",
    "LRU = `unordered_map<K, list::iterator>` + doubly linked list; `splice` to promote (erase would invalidate the stored iterator).",
    "Min stack = parallel stack of running minima. O(1) all round, O(n) space; delta encoding buys O(1) space but risks overflow.",
    "O(1) insert/delete/getRandom = `vector` + value→index map; delete by swapping with the last element, then `pop_back`, then erase the map key.",
    "Doubly linked (not singly) whenever you must unlink an arbitrary or tail node in O(1).",
    "Say **expected** O(1) for hash-based operations; state behaviour for missing keys, empty structures, and zero capacity before coding.",
  ],
  interviewQA: [
    {
      q: "Design an LRU cache with O(1) get and put. Why a doubly linked list, and what is the C++-specific pitfall?",
      a: "I keep a doubly linked list of `(key, value)` nodes ordered most-recently-used at the front, and a hash map from key to that node's position in the list. `get` looks the key up; a miss returns the sentinel, a hit moves the node to the front and returns its value. `put` on an existing key updates the value and moves the node to the front; on a new key, if we are at capacity I read the key stored in the tail node, erase that key from the map, drop the tail, then push the new pair at the front and record its position in the map.\n\nThe list must be doubly linked because eviction and promotion both unlink a node that is not the head, and O(1) unlinking needs the predecessor pointer. Storing the key inside the node matters too — otherwise evicting the tail gives me a value but no way to find the map entry to remove, and I would be back to an O(n) scan.\n\nThe C++ pitfall is iterator invalidation. Since the map holds `std::list` iterators, promoting a node with erase-then-`push_front` invalidates the very iterator the map is storing, and the next lookup dereferences freed memory. `list::splice` relinks the existing node without constructing or destroying anything, so all iterators — including the one in the map — remain valid. Both operations are O(1) expected, bounded by the hash lookup, with O(capacity) space.",
      followUps: [
        "How does LFU differ, and how do you get O(1) there?",
        "How would you make this thread-safe without serialising all traffic on one mutex?",
      ],
    },
    {
      q: "Design a stack that also reports its minimum in O(1). Can you do it without a second O(n) stack?",
      a: "The clean answer is a parallel stack of running minima: on push I append `min(x, currentMin)`, on pop I pop both, and `getMin` reads the auxiliary top. Every operation is O(1) worst case — no hashing, no amortisation — at the cost of O(n) extra space. A small optimisation is to push onto the auxiliary stack only when `x <= currentMin` and pop it only when the popped value equals the current min, which saves space on data with few new minima; the `<=` rather than `<` is essential so duplicate minima are tracked correctly.\n\nFor genuine O(1) extra space I encode values relative to the minimum at push time. If `x` is less than the current minimum I push `2*x - min` — a value strictly below `x`, and therefore below the new minimum — and set `min = x`. Otherwise I push `x` unchanged. On pop, if the stored value is below the current minimum, that push is the one that lowered it, and the previous minimum is recovered as `2*min - stored`. `top` similarly returns `min` rather than the stored value in that case. The catch is overflow: `2*x - min` can exceed the range of the element type, so the storage needs to be wider than the input type. I would present the two-stack version first as the readable default and offer the encoded one as the space-optimal follow-up.",
      followUps: [
        "Now build a queue with O(1) amortised getMin.",
        "How do you get the minimum over a sliding window instead?",
      ],
    },
    {
      q: "Support insert, delete, and getRandom, all in O(1) expected time.",
      a: "`getRandom` with uniform probability in O(1) forces a dense contiguous array — you need to index a random slot directly. But deleting from the middle of an array is O(n) because of the shift. The escape is that the *order* of elements is never observable through this API: only membership and a uniform random draw. So I hold a `vector` of values plus a hash map from value to its index in that vector. Insert pushes to the back and records the index. Delete looks up the index, copies the last element into that slot, updates the moved element's index in the map, pops the back, and erases the deleted key. `getRandom` is one modulo of the vector size.\n\nTwo ordering details matter. The map erase must come *after* writing the moved element's index, because when the element being deleted is itself the last one, the write and the erase touch the same key — doing them in the wrong order leaves a stale entry pointing one past the end of the vector, and the next `getRandom` reads out of bounds. And `getRandom` needs a documented contract for the empty set. All three are O(1) expected, O(n) space.\n\nIf duplicates are allowed, the map's value becomes a set of indices for each value; delete picks any index from that set and the swap logic is identical, just with an extra set update for the moved element. That stays O(1) expected.",
      followUps: [
        "Extend it to allow duplicates while keeping getRandom proportional to multiplicity.",
        "Why is the complexity 'expected' rather than worst-case O(1)?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The design-a-structure master technique",
      back: "Pair a hash map (O(1) lookup) with a second structure supplying the missing property — order, recency, randomness. The map stores a handle (iterator or index), not the payload.",
    },
    {
      front: "LRU cache in C++: why splice, not erase + push_front?",
      back: "`list::splice` relinks the existing node, so the iterator stored in the hash map stays valid. Erase destroys the node and dangles that iterator. Both ops O(1) expected, O(capacity) space.",
    },
    {
      front: "O(1) delete from an array (RandomizedSet)",
      back: "Swap the target with the last element, update the moved element's index in the map, `pop_back`, then erase the target's key last (handles target == last). O(1) expected.",
    },
  ],
};
