import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Implement Stack using Queues",
      difficulty: "Easy",
      variation: "Rotate-on-push, single queue",
      link: "https://leetcode.com/problems/implement-stack-using-queues/",
      question: [
        "Implement a last-in-first-out (LIFO) stack using only queues. Support push, pop, top, and empty using only standard queue operations (push to back, pop from front, front, size, empty).",
        "Example 1:\nInput: push(1), push(2), top(), pop(), empty()\nOutput: 2, 2, false",
        "Constraints:\n- 1 <= x <= 9\n- At most 100 calls total\n- pop and top are only called on a non-empty stack",
      ],
      code: `class MyStack {
    queue<int> q;
public:
    MyStack() {}
    void push(int x) {
        q.push(x);
        for (int i = 0; i < (int)q.size() - 1; i++) {
            q.push(q.front());
            q.pop();
        }
    }
    int pop() {
        int v = q.front();
        q.pop();
        return v;
    }
    int top() {
        return q.front();
    }
    bool empty() {
        return q.empty();
    }
};`,
      explanation: [
        "After each push, rotate the queue so the newest element moves to the front; the queue then permanently stores elements in stack order.",
        "This makes push O(n) but pop, top, and empty O(1) with a single queue.",
        "Time: push O(n), others O(1). Space: O(n).",
      ],
    },
    {
      name: "Implement Queue using Stacks",
      difficulty: "Easy",
      variation: "Two stacks, amortized O(1)",
      link: "https://leetcode.com/problems/implement-queue-using-stacks/",
      question: [
        "Implement a first-in-first-out (FIFO) queue using only two stacks. Support push, pop, peek, and empty using only standard stack operations.",
        "Example 1:\nInput: push(1), push(2), peek(), pop(), empty()\nOutput: 1, 1, false",
        "Constraints:\n- 1 <= x <= 9\n- At most 100 calls total\n- pop and peek are only called on a non-empty queue",
      ],
      code: `class MyQueue {
    stack<int> in, out;
    void shift() {
        if (out.empty()) {
            while (!in.empty()) {
                out.push(in.top());
                in.pop();
            }
        }
    }
public:
    MyQueue() {}
    void push(int x) {
        in.push(x);
    }
    int pop() {
        shift();
        int v = out.top();
        out.pop();
        return v;
    }
    int peek() {
        shift();
        return out.top();
    }
    bool empty() {
        return in.empty() && out.empty();
    }
};`,
      explanation: [
        "The in-stack receives pushes; when the out-stack is empty, draining the in-stack into it reverses the order, exposing the oldest element on top.",
        "Each element is moved between stacks at most once, so every operation is amortized O(1).",
        "Time: amortized O(1) per operation. Space: O(n).",
      ],
    },
    {
      name: "Design HashSet",
      difficulty: "Easy",
      variation: "Separate chaining",
      link: "https://leetcode.com/problems/design-hashset/",
      question: [
        "Design a HashSet without using any built-in hash table libraries. Implement add(key), remove(key), and contains(key).",
        "Example 1:\nInput: add(1), add(2), contains(1), contains(3), add(2), remove(2), contains(2)\nOutput: true, false, false",
        "Constraints:\n- 0 <= key <= 10^6\n- At most 10^4 calls to add, remove, and contains",
      ],
      code: `class MyHashSet {
    static const int B = 1031;
    vector<list<int>> buckets;
    list<int>::iterator find(int key, list<int>& bucket) {
        for (auto it = bucket.begin(); it != bucket.end(); ++it)
            if (*it == key) return it;
        return bucket.end();
    }
public:
    MyHashSet() : buckets(B) {}
    void add(int key) {
        auto& b = buckets[key % B];
        if (find(key, b) == b.end()) b.push_back(key);
    }
    void remove(int key) {
        auto& b = buckets[key % B];
        auto it = find(key, b);
        if (it != b.end()) b.erase(it);
    }
    bool contains(int key) {
        auto& b = buckets[key % B];
        return find(key, b) != b.end();
    }
};`,
      explanation: [
        "Keys hash into a fixed prime number of buckets; each bucket is a linked list holding the keys that collide there (separate chaining).",
        "With a prime bucket count and uniform keys, each chain stays short, giving near-constant operations.",
        "Time: O(n/B) expected per operation. Space: O(n + B).",
      ],
    },
    {
      name: "Design HashMap",
      difficulty: "Easy",
      variation: "Chaining with key-value pairs",
      link: "https://leetcode.com/problems/design-hashmap/",
      question: [
        "Design a HashMap without using any built-in hash table libraries. Implement put(key, value), get(key) (return -1 if absent), and remove(key).",
        "Example 1:\nInput: put(1,1), put(2,2), get(1), get(3), put(2,1), get(2), remove(2), get(2)\nOutput: 1, -1, 1, -1",
        "Constraints:\n- 0 <= key, value <= 10^6\n- At most 10^4 calls to put, get, and remove",
      ],
      code: `class MyHashMap {
    static const int B = 1031;
    vector<list<pair<int, int>>> buckets;
public:
    MyHashMap() : buckets(B) {}
    void put(int key, int value) {
        auto& b = buckets[key % B];
        for (auto& kv : b)
            if (kv.first == key) {
                kv.second = value;
                return;
            }
        b.push_back({key, value});
    }
    int get(int key) {
        auto& b = buckets[key % B];
        for (auto& kv : b)
            if (kv.first == key) return kv.second;
        return -1;
    }
    void remove(int key) {
        auto& b = buckets[key % B];
        for (auto it = b.begin(); it != b.end(); ++it)
            if (it->first == key) {
                b.erase(it);
                return;
            }
    }
};`,
      explanation: [
        "Same separate-chaining scheme as the HashSet, but each chain node stores a (key, value) pair; put overwrites the value when the key already exists.",
        "A prime bucket count spreads sequential keys evenly across chains.",
        "Time: O(n/B) expected per operation. Space: O(n + B).",
      ],
    },
    {
      name: "Min Stack",
      difficulty: "Medium",
      variation: "Auxiliary min tracking per node",
      link: "https://leetcode.com/problems/min-stack/",
      question: [
        "Design a stack that supports push, pop, top, and retrieving the minimum element, each in O(1) time.",
        "Example 1:\nInput: push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()\nOutput: -3, 0, -2",
        "Constraints:\n- -2^31 <= val <= 2^31 - 1\n- pop, top, and getMin are only called on a non-empty stack\n- At most 3 * 10^4 calls",
      ],
      code: `class MinStack {
    stack<pair<int, int>> st;
public:
    MinStack() {}
    void push(int val) {
        int mn = st.empty() ? val : min(val, st.top().second);
        st.push({val, mn});
    }
    void pop() {
        st.pop();
    }
    int top() {
        return st.top().first;
    }
    int getMin() {
        return st.top().second;
    }
};`,
      explanation: [
        "Each stack node carries the minimum of the stack at the moment it was pushed, so the current minimum is always readable at the top.",
        "Popping automatically restores the previous minimum with no extra bookkeeping.",
        "Time: O(1) per operation. Space: O(n).",
      ],
    },
    {
      name: "Design Circular Queue",
      difficulty: "Medium",
      variation: "Fixed array + head/count",
      link: "https://leetcode.com/problems/design-circular-queue/",
      question: [
        "Design a circular queue of fixed size k. Implement enQueue, deQueue, Front, Rear, isEmpty, and isFull. All operations should be O(1) and the buffer must reuse freed slots.",
        "Example 1:\nInput: MyCircularQueue(3), enQueue(1), enQueue(2), enQueue(3), enQueue(4), Rear(), isFull(), deQueue(), enQueue(4), Rear()\nOutput: true, true, true, false, 3, true, true, true, 4",
        "Constraints:\n- 1 <= k <= 1000\n- 0 <= value <= 1000\n- At most 3000 calls",
      ],
      code: `class MyCircularQueue {
    vector<int> buf;
    int head, count, cap;
public:
    MyCircularQueue(int k) : buf(k), head(0), count(0), cap(k) {}
    bool enQueue(int value) {
        if (count == cap) return false;
        buf[(head + count) % cap] = value;
        count++;
        return true;
    }
    bool deQueue() {
        if (count == 0) return false;
        head = (head + 1) % cap;
        count--;
        return true;
    }
    int Front() {
        return count == 0 ? -1 : buf[head];
    }
    int Rear() {
        return count == 0 ? -1 : buf[(head + count - 1) % cap];
    }
    bool isEmpty() {
        return count == 0;
    }
    bool isFull() {
        return count == cap;
    }
};`,
      explanation: [
        "A fixed array plus a head index and an element count models the ring; the tail is derived as (head + count) mod capacity.",
        "Tracking count instead of a tail pointer removes the classic full-versus-empty ambiguity of ring buffers.",
        "Time: O(1) per operation. Space: O(k).",
      ],
    },
    {
      name: "Design Circular Deque",
      difficulty: "Medium",
      variation: "Ring buffer, both ends",
      link: "https://leetcode.com/problems/design-circular-deque/",
      question: [
        "Design a circular double-ended queue of fixed size k. Implement insertFront, insertLast, deleteFront, deleteLast, getFront, getRear, isEmpty, and isFull, all in O(1).",
        "Example 1:\nInput: MyCircularDeque(3), insertLast(1), insertLast(2), insertFront(3), insertFront(4), getRear(), isFull(), deleteLast(), insertFront(4), getFront()\nOutput: true, true, true, false, 2, true, true, true, 4",
        "Constraints:\n- 1 <= k <= 1000\n- 0 <= value <= 1000\n- At most 2000 calls",
      ],
      code: `class MyCircularDeque {
    vector<int> buf;
    int head, count, cap;
public:
    MyCircularDeque(int k) : buf(k), head(0), count(0), cap(k) {}
    bool insertFront(int value) {
        if (count == cap) return false;
        head = (head - 1 + cap) % cap;
        buf[head] = value;
        count++;
        return true;
    }
    bool insertLast(int value) {
        if (count == cap) return false;
        buf[(head + count) % cap] = value;
        count++;
        return true;
    }
    bool deleteFront() {
        if (count == 0) return false;
        head = (head + 1) % cap;
        count--;
        return true;
    }
    bool deleteLast() {
        if (count == 0) return false;
        count--;
        return true;
    }
    int getFront() {
        return count == 0 ? -1 : buf[head];
    }
    int getRear() {
        return count == 0 ? -1 : buf[(head + count - 1) % cap];
    }
    bool isEmpty() {
        return count == 0;
    }
    bool isFull() {
        return count == cap;
    }
};`,
      explanation: [
        "The same head-plus-count ring buffer as the circular queue, extended so the head can also move backward (with +cap to keep the modulo non-negative) for front insertions.",
        "Deleting from the rear only needs to shrink the count, since the tail position is derived.",
        "Time: O(1) per operation. Space: O(k).",
      ],
    },
    {
      name: "Design Browser History",
      difficulty: "Medium",
      variation: "Vector + cursor (truncate on visit)",
      link: "https://leetcode.com/problems/design-browser-history/",
      question: [
        "You have a browser starting on homepage. Implement visit(url) which clears all forward history, back(steps), and forward(steps); back and forward move as far as possible and return the current URL.",
        "Example 1:\nInput: BrowserHistory(\"leetcode.com\"), visit(\"google.com\"), visit(\"facebook.com\"), visit(\"youtube.com\"), back(1), back(1), forward(1), visit(\"linkedin.com\"), forward(2), back(2), back(7)\nOutput: facebook.com, google.com, facebook.com, linkedin.com, google.com, leetcode.com",
        "Constraints:\n- 1 <= url.length <= 20\n- 1 <= steps <= 100\n- At most 5000 calls total",
      ],
      code: `class BrowserHistory {
    vector<string> pages;
    int cur;
public:
    BrowserHistory(string homepage) : pages{homepage}, cur(0) {}
    void visit(string url) {
        pages.resize(cur + 1);
        pages.push_back(url);
        cur++;
    }
    string back(int steps) {
        cur = max(0, cur - steps);
        return pages[cur];
    }
    string forward(int steps) {
        cur = min((int)pages.size() - 1, cur + steps);
        return pages[cur];
    }
};`,
      explanation: [
        "A dynamic array with a cursor is enough: visiting truncates everything after the cursor (destroying forward history) and appends the new page.",
        "back and forward just clamp the cursor to the valid range, so multi-step moves cost O(1).",
        "Time: O(1) amortized per operation (visit may shrink the vector). Space: O(n) pages.",
      ],
    },
    {
      name: "Insert Delete GetRandom O(1)",
      difficulty: "Medium",
      variation: "Vector + index map, swap-with-last",
      link: "https://leetcode.com/problems/insert-delete-getrandom-o1/",
      question: [
        "Implement RandomizedSet: insert(val) returns true if val was absent, remove(val) returns true if val was present, and getRandom() returns a uniformly random element. Each operation must run in average O(1) time.",
        "Example 1:\nInput: insert(1), remove(2), insert(2), getRandom(), remove(1), insert(2), getRandom()\nOutput: true, false, true, 1 or 2, true, false, 2",
        "Constraints:\n- -2^31 <= val <= 2^31 - 1\n- At most 2 * 10^5 calls\n- getRandom is called only when the set is non-empty",
      ],
      code: `class RandomizedSet {
    vector<int> vals;
    unordered_map<int, int> idx;
public:
    RandomizedSet() {}
    bool insert(int val) {
        if (idx.count(val)) return false;
        idx[val] = vals.size();
        vals.push_back(val);
        return true;
    }
    bool remove(int val) {
        auto it = idx.find(val);
        if (it == idx.end()) return false;
        int pos = it->second;
        int last = vals.back();
        vals[pos] = last;
        idx[last] = pos;
        vals.pop_back();
        idx.erase(it);
        return true;
    }
    int getRandom() {
        return vals[rand() % vals.size()];
    }
};`,
      explanation: [
        "A vector gives O(1) uniform sampling by index; a hash map from value to its vector position gives O(1) membership.",
        "Removal swaps the target with the last element and pops, so the vector never has holes and only one map entry needs updating.",
        "Time: O(1) average per operation. Space: O(n).",
      ],
    },
    {
      name: "Time Based Key-Value Store",
      difficulty: "Medium",
      variation: "Append-only log + binary search",
      link: "https://leetcode.com/problems/time-based-key-value-store/",
      question: [
        "Design a time-based key-value store that stores multiple values for the same key at different timestamps. set(key, value, timestamp) stores the value; get(key, timestamp) returns the value set at the largest timestamp_prev <= timestamp, or an empty string if none exists. Timestamps in set are strictly increasing per key.",
        "Example 1:\nInput: set(\"foo\",\"bar\",1), get(\"foo\",1), get(\"foo\",3), set(\"foo\",\"bar2\",4), get(\"foo\",4), get(\"foo\",5)\nOutput: bar, bar, bar2, bar2",
        "Constraints:\n- 1 <= key.length, value.length <= 100\n- 1 <= timestamp <= 10^7\n- At most 2 * 10^5 calls to set and get",
      ],
      code: `class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;
public:
    TimeMap() {}
    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }
    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& v = it->second;
        int lo = 0, hi = (int)v.size() - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (v[mid].first <= timestamp) {
                ans = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return ans == -1 ? "" : v[ans].second;
    }
};`,
      explanation: [
        "Because timestamps arrive strictly increasing per key, appending keeps each key's log sorted for free.",
        "get binary-searches the log for the rightmost entry with timestamp <= query (a floor search).",
        "Time: set O(1) amortized, get O(log n) per key. Space: O(total sets).",
      ],
    },
    {
      name: "Snapshot Array",
      difficulty: "Medium",
      variation: "Per-index version history",
      link: "https://leetcode.com/problems/snapshot-array/",
      question: [
        "Implement SnapshotArray: SnapshotArray(length) initializes an array of zeros, set(index, val) sets a value, snap() takes a snapshot and returns snap_id (the number of prior snaps), and get(index, snap_id) returns the value at that index at the time of that snapshot.",
        "Example 1:\nInput: SnapshotArray(3), set(0,5), snap(), set(0,6), get(0,0)\nOutput: 0, 5",
        "Constraints:\n- 1 <= length <= 5 * 10^4\n- 0 <= index < length\n- 0 <= val <= 10^9\n- At most 5 * 10^4 calls to set, snap, and get",
      ],
      code: `class SnapshotArray {
    vector<vector<pair<int, int>>> hist;
    int snapId;
public:
    SnapshotArray(int length) : hist(length), snapId(0) {
        for (auto& h : hist) h.push_back({-1, 0});
    }
    void set(int index, int val) {
        auto& h = hist[index];
        if (h.back().first == snapId) h.back().second = val;
        else h.push_back({snapId, val});
    }
    int snap() {
        return snapId++;
    }
    int get(int index, int snap_id) {
        auto& h = hist[index];
        int lo = 0, hi = (int)h.size() - 1, ans = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (h[mid].first <= snap_id) {
                ans = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return h[ans].second;
    }
};`,
      explanation: [
        "Instead of copying the array on snap, each index keeps its own sorted list of (snap_id, value) changes; snap just increments a counter, making it O(1).",
        "get binary-searches the index's history for the latest change at or before the requested snapshot; the sentinel (-1, 0) covers indices never written.",
        "Time: set/get O(log s) per index history, snap O(1). Space: O(length + number of sets).",
      ],
    },
    {
      name: "Design Twitter",
      difficulty: "Medium",
      variation: "Feeds via k-way merge (heap)",
      link: "https://leetcode.com/problems/design-twitter/",
      question: [
        "Design a simplified Twitter: postTweet(userId, tweetId), getNewsFeed(userId) returns the 10 most recent tweet ids from the user and everyone they follow (most recent first), follow(followerId, followeeId), and unfollow(followerId, followeeId).",
        "Example 1:\nInput: postTweet(1,5), getNewsFeed(1), follow(1,2), postTweet(2,6), getNewsFeed(1), unfollow(1,2), getNewsFeed(1)\nOutput: [5], [6,5], [5]",
        "Constraints:\n- 1 <= userId, followerId, followeeId <= 500\n- 0 <= tweetId <= 10^4\n- At most 3 * 10^4 calls in total",
      ],
      code: `class Twitter {
    int clock;
    unordered_map<int, vector<pair<int, int>>> tweets;
    unordered_map<int, unordered_set<int>> follows;
public:
    Twitter() : clock(0) {}
    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({clock++, tweetId});
    }
    vector<int> getNewsFeed(int userId) {
        priority_queue<pair<int, int>> pq;
        auto add = [&](int uid) {
            auto it = tweets.find(uid);
            if (it == tweets.end()) return;
            auto& v = it->second;
            int start = max(0, (int)v.size() - 10);
            for (int i = start; i < (int)v.size(); i++) pq.push(v[i]);
        };
        add(userId);
        for (int f : follows[userId]) add(f);
        vector<int> feed;
        while (!pq.empty() && (int)feed.size() < 10) {
            feed.push_back(pq.top().second);
            pq.pop();
        }
        return feed;
    }
    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) follows[followerId].insert(followeeId);
    }
    void unfollow(int followerId, int followeeId) {
        follows[followerId].erase(followeeId);
    }
};`,
      explanation: [
        "A global logical clock timestamps every tweet so recency is comparable across users.",
        "The feed pushes at most the 10 newest tweets from the user and each followee into a max-heap keyed on timestamp, then pops the top 10 — a bounded k-way merge.",
        "Time: getNewsFeed O(F log F) for F followees (each contributing at most 10 tweets); other operations O(1) average. Space: O(users + tweets + follow edges).",
      ],
    },
    {
      name: "LRU Cache",
      difficulty: "Medium",
      variation: "Doubly linked list + hash map",
      link: "https://leetcode.com/problems/lru-cache/",
      question: [
        "Design a Least Recently Used cache with positive capacity. get(key) returns the value or -1 and marks the key as most recently used; put(key, value) inserts or updates, evicting the least recently used key when capacity is exceeded. Both must run in O(1) average time.",
        "Example 1:\nInput: LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)\nOutput: 1, -1, -1, 3, 4",
        "Constraints:\n- 1 <= capacity <= 3000\n- 0 <= key <= 10^4\n- 0 <= value <= 10^5\n- At most 2 * 10^5 calls to get and put",
      ],
      code: `class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }
    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) {
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            return;
        }
        if ((int)order.size() == cap) {
            pos.erase(order.back().first);
            order.pop_back();
        }
        order.push_front({key, value});
        pos[key] = order.begin();
    }
};`,
      explanation: [
        "A doubly linked list keeps entries in recency order (front = most recent); a hash map points each key at its list node for O(1) lookup.",
        "list::splice relinks a node to the front without invalidating iterators, so touching an entry is O(1); eviction removes the back node.",
        "Time: O(1) average per operation. Space: O(capacity).",
      ],
    },
    {
      name: "Insert Delete GetRandom O(1) - Duplicates Allowed",
      difficulty: "Hard",
      variation: "Vector + map of index sets",
      link: "https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed/",
      question: [
        "Implement RandomizedCollection, a multiset supporting insert(val) (returns true if val was absent), remove(val) (removes one occurrence, returns true if present), and getRandom() where each element is returned with probability proportional to its count. All operations must run in average O(1).",
        "Example 1:\nInput: insert(1), insert(1), insert(2), getRandom(), remove(1), getRandom()\nOutput: true, false, true, (1 with p=2/3), true, (1 or 2 with p=1/2)",
        "Constraints:\n- -2^31 <= val <= 2^31 - 1\n- At most 2 * 10^5 calls\n- getRandom is called only when the collection is non-empty",
      ],
      code: `class RandomizedCollection {
    vector<int> vals;
    unordered_map<int, unordered_set<int>> idx;
public:
    RandomizedCollection() {}
    bool insert(int val) {
        bool absent = idx[val].empty();
        idx[val].insert(vals.size());
        vals.push_back(val);
        return absent;
    }
    bool remove(int val) {
        auto it = idx.find(val);
        if (it == idx.end() || it->second.empty()) return false;
        int pos = *it->second.begin();
        it->second.erase(pos);
        int lastPos = vals.size() - 1;
        int lastVal = vals[lastPos];
        if (pos != lastPos) {
            vals[pos] = lastVal;
            idx[lastVal].erase(lastPos);
            idx[lastVal].insert(pos);
        }
        vals.pop_back();
        return true;
    }
    int getRandom() {
        return vals[rand() % vals.size()];
    }
};`,
      explanation: [
        "The swap-with-last trick from RandomizedSet generalizes by mapping each value to the set of all its positions in the vector.",
        "Removal takes any one position of the value, moves the last element into it, and fixes that element's position set; the guard handles removing the last slot itself.",
        "getRandom samples the raw vector, so duplicates are naturally weighted by count.",
        "Time: O(1) average per operation. Space: O(n).",
      ],
    },
    {
      name: "Max Stack",
      difficulty: "Hard",
      variation: "List + ordered map of iterators",
      link: "https://leetcode.com/problems/max-stack/",
      question: [
        "Design a max stack supporting push(x), pop(), top(), peekMax(), and popMax(). popMax removes the maximum element; if there are ties, remove the one closest to the top. Aim for O(log n) per operation.",
        "Example 1:\nInput: push(5), push(1), push(5), top(), popMax(), top(), peekMax(), pop(), peekMax()\nOutput: 5, 5, 1, 5, 1, 5",
        "Constraints:\n- -10^7 <= x <= 10^7\n- At most 10^5 calls\n- pop, top, peekMax, and popMax are only called on a non-empty stack",
      ],
      code: `class MaxStack {
    list<int> seq;
    map<int, vector<list<int>::iterator>> byValue;
public:
    MaxStack() {}
    void push(int x) {
        seq.push_back(x);
        byValue[x].push_back(prev(seq.end()));
    }
    int pop() {
        int v = seq.back();
        auto& vec = byValue[v];
        vec.pop_back();
        if (vec.empty()) byValue.erase(v);
        seq.pop_back();
        return v;
    }
    int top() {
        return seq.back();
    }
    int peekMax() {
        return byValue.rbegin()->first;
    }
    int popMax() {
        auto it = prev(byValue.end());
        int v = it->first;
        auto listIt = it->second.back();
        it->second.pop_back();
        if (it->second.empty()) byValue.erase(it);
        seq.erase(listIt);
        return v;
    }
};`,
      explanation: [
        "A doubly linked list preserves stack order while allowing O(1) removal from the middle; an ordered map from value to its list iterators (in push order) finds the maximum in O(log n).",
        "For ties, the last iterator in the vector is the most recently pushed occurrence, which is the one closest to the top, matching the required tie-break.",
        "Time: push/pop/popMax O(log n), top/peekMax O(1) amortized lookup plus O(log n) map access. Space: O(n).",
      ],
    },
    {
      name: "LFU Cache",
      difficulty: "Hard",
      variation: "Frequency buckets of LRU lists",
      link: "https://leetcode.com/problems/lfu-cache/",
      question: [
        "Design a Least Frequently Used cache. get(key) returns the value or -1; put(key, value) inserts or updates. When capacity is reached, evict the least frequently used key, breaking ties by least recently used. Both operations must run in O(1) average time.",
        "Example 1:\nInput: LFUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), get(3), put(4,4), get(1), get(3), get(4)\nOutput: 1, -1, 3, -1, 3, 4",
        "Constraints:\n- 1 <= capacity <= 10^4\n- 0 <= key, value <= 10^5\n- At most 2 * 10^5 calls to get and put",
      ],
      code: `class LFUCache {
    struct Node {
        int key, val, freq;
    };
    int cap, minFreq;
    unordered_map<int, list<Node>::iterator> table;
    unordered_map<int, list<Node>> freqLists;
    void touch(list<Node>::iterator it) {
        int f = it->freq;
        Node node = *it;
        freqLists[f].erase(it);
        if (freqLists[f].empty()) {
            freqLists.erase(f);
            if (minFreq == f) minFreq = f + 1;
        }
        node.freq = f + 1;
        freqLists[node.freq].push_front(node);
        table[node.key] = freqLists[node.freq].begin();
    }
public:
    LFUCache(int capacity) : cap(capacity), minFreq(0) {}
    int get(int key) {
        auto it = table.find(key);
        if (it == table.end()) return -1;
        int val = it->second->val;
        touch(it->second);
        return val;
    }
    void put(int key, int value) {
        if (cap == 0) return;
        auto it = table.find(key);
        if (it != table.end()) {
            it->second->val = value;
            touch(it->second);
            return;
        }
        if ((int)table.size() == cap) {
            auto& lst = freqLists[minFreq];
            table.erase(lst.back().key);
            lst.pop_back();
            if (lst.empty()) freqLists.erase(minFreq);
        }
        freqLists[1].push_front({key, value, 1});
        table[key] = freqLists[1].begin();
        minFreq = 1;
    }
};`,
      explanation: [
        "Keys are grouped into per-frequency doubly linked lists kept in recency order, with a hash map from key to its node; minFreq tracks the lowest non-empty frequency.",
        "Accessing a key moves its node from list f to the front of list f+1 in O(1); eviction pops the back (least recent) of the minFreq list; any brand-new insert resets minFreq to 1.",
        "minFreq only needs to increment when its list empties during a touch, which keeps every operation constant time.",
        "Time: O(1) average per operation. Space: O(capacity).",
      ],
    },
    {
      name: "All O(1) Data Structure",
      difficulty: "Hard",
      variation: "Bucket list of count groups",
      link: "https://leetcode.com/problems/all-oone-data-structure/",
      question: [
        "Design a data structure storing string counts with inc(key), dec(key) (removing the key when its count hits 0), getMaxKey(), and getMinKey() (return an empty string if empty). Every operation must run in O(1) time; dec is only called on existing keys.",
        "Example 1:\nInput: inc(\"hello\"), inc(\"hello\"), getMaxKey(), getMinKey(), inc(\"leet\"), getMaxKey(), getMinKey()\nOutput: hello, hello, hello, leet",
        "Constraints:\n- 1 <= key.length <= 10\n- At most 5 * 10^4 calls in total",
      ],
      code: `class AllOne {
    struct Bucket {
        int count;
        unordered_set<string> keys;
    };
    list<Bucket> buckets;
    unordered_map<string, list<Bucket>::iterator> where;
public:
    AllOne() {}
    void inc(string key) {
        auto it = where.find(key);
        if (it == where.end()) {
            if (buckets.empty() || buckets.front().count != 1)
                buckets.push_front({1, {}});
            buckets.front().keys.insert(key);
            where[key] = buckets.begin();
            return;
        }
        auto cur = it->second;
        auto nxt = next(cur);
        if (nxt == buckets.end() || nxt->count != cur->count + 1)
            nxt = buckets.insert(nxt, {cur->count + 1, {}});
        nxt->keys.insert(key);
        where[key] = nxt;
        cur->keys.erase(key);
        if (cur->keys.empty()) buckets.erase(cur);
    }
    void dec(string key) {
        auto cur = where[key];
        if (cur->count == 1) {
            where.erase(key);
        } else {
            auto prv = (cur == buckets.begin()) ? buckets.end() : prev(cur);
            if (prv == buckets.end() || prv->count != cur->count - 1)
                prv = buckets.insert(cur, {cur->count - 1, {}});
            prv->keys.insert(key);
            where[key] = prv;
        }
        cur->keys.erase(key);
        if (cur->keys.empty()) buckets.erase(cur);
    }
    string getMaxKey() {
        return buckets.empty() ? "" : *buckets.back().keys.begin();
    }
    string getMinKey() {
        return buckets.empty() ? "" : *buckets.front().keys.begin();
    }
};`,
      explanation: [
        "Keys with equal counts share a bucket, and buckets live in a doubly linked list sorted by count; a hash map sends each key to its bucket.",
        "inc and dec move a key only to the adjacent bucket (count +1 or -1), creating or deleting buckets as needed, so no search is ever required and the list stays sorted by construction.",
        "Min and max are simply the front and back buckets of the list.",
        "Time: O(1) per operation. Space: O(number of keys).",
      ],
    },
  ],
};
