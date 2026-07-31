import type { TopicContent } from "../types";

export const linkedLists: TopicContent = {
  quickSummary: [
    "A linked list stores elements in non-contiguous nodes connected by pointers, giving O(1) insertion/deletion at a known position but O(n) random access since you must traverse from the head.",
    "Singly linked lists have a next pointer per node; doubly linked lists add a prev pointer, enabling O(1) removal of a node when you hold a reference to it.",
    "The fast/slow pointer technique (Floyd's tortoise and hare) detects cycles in O(n) time and O(1) space, and also finds the middle of a list in a single pass.",
    "Linked lists are the backbone of LRU caches (doubly linked list + hash map), adjacency lists for graphs, and the chaining strategy in hash tables.",
  ],
  detailed: [
    "A singly linked list consists of nodes, each containing a value and a pointer to the next node. The list is identified by a head pointer; the last node's next pointer is null. Unlike arrays, linked list nodes can be scattered anywhere in memory, so accessing the i-th element requires traversing i nodes from the head — O(n). However, once you hold a reference to a node, inserting or deleting after it is O(1): just rewire one or two pointers. This makes linked lists ideal when the dominant operations are insertions and deletions at arbitrary positions, and random access is rare.",
    "A doubly linked list adds a prev pointer to each node, allowing traversal in both directions. The key advantage is that deletion of a node becomes O(1) when you have a direct reference to it — you can reach both its predecessor and successor without traversal. Many implementations use a sentinel (dummy) head and tail node to eliminate edge cases: the sentinel's next is the real first node, and its prev is the real last node, so insertion at the head or tail is the same code as insertion in the middle.",
    "Circular linked lists connect the last node back to the first (singly circular) or connect both endpoints (doubly circular). They are useful for round-robin scheduling, circular buffers, and problems where the data naturally wraps around (e.g., Josephus problem). In a circular singly linked list, traversal terminates when you return to the starting node; a common mistake is forgetting this termination condition, leading to infinite loops.",
    "Floyd's cycle detection algorithm uses two pointers: slow moves one step at a time, fast moves two steps. If the list has a cycle, fast will eventually lap slow and they will meet inside the cycle. To find the cycle's entry point, reset one pointer to the head and advance both one step at a time — they meet at the cycle start. This works because if the distance from head to cycle start is a, and the meeting point is b steps into the cycle of length c, then 2(a+b) = a+b+kc, so a = kc−b, meaning both pointers reach the cycle start simultaneously.",
    "Reversing a singly linked list in-place is a fundamental operation. You maintain three pointers — prev (initially null), curr (initially head), and next (saved before rewiring). At each step, set curr.next = prev, advance prev to curr, and curr to next. After traversal, prev is the new head. This O(n) time, O(1) space technique is a building block for many problems: reversing sublists, checking palindromes (reverse second half, compare), and rearranging nodes (odd-even linked list).",
  ],
  deepDive: [
    "The LRU (Least Recently Used) cache is the canonical real-world application of a doubly linked list combined with a hash map. The doubly linked list maintains elements in access-recency order: the most recently used node is at the head, the least recently used is at the tail. The hash map provides O(1) lookup from key to list node. On access, the node is moved to the head (O(1) with a doubly linked list). On eviction, the tail node is removed (O(1)). This gives both get and put operations O(1) time complexity. The data structure is used in CPU caches, database buffer pools, and web browser caches.",
    "The merge of two sorted linked lists is an O(n+m) operation that forms the basis of merge sort on linked lists. Unlike arrays, merge sort on linked lists achieves O(1) auxiliary space because splitting uses the slow/fast pointer technique (no index arithmetic needed), and merging rewires existing nodes instead of allocating a new array. This makes linked list merge sort preferable to quicksort on linked lists, since quicksort relies on random access for its partitioning step. The recursive merge compares the heads of both lists, picks the smaller, and recurses on the remainder.",
    "Skip lists are a probabilistic extension of linked lists that provide O(log n) search, insert, and delete on average. Each node has multiple forward pointers at different levels; higher levels skip over more nodes. Searching starts at the highest level and drops down when it overshoots. Skip lists are simpler to implement than balanced BSTs and are used in Redis sorted sets and LevelDB/RocksDB memtables. The expected space overhead is O(n) with a promotion probability of 1/2.",
    "XOR linked lists are a memory-optimization trick for doubly linked lists: instead of storing both prev and next, each node stores prev XOR next. Traversal is possible because if you know the address of the previous node, you can recover next = stored XOR prev. This halves the pointer overhead but sacrifices code clarity, garbage-collector compatibility (in managed languages), and debuggability. It is rarely used in practice but occasionally appears in interviews and embedded systems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Singly linked list with reverse, cycle detection, and merge sorted",
      source: `#include <iostream>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v = 0, ListNode* n = nullptr) : val(v), next(n) {}
};

// Reverse a singly linked list in O(n) time, O(1) space
ListNode* reverse_list(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;  // new head
}

// Floyd's cycle detection: O(n) time, O(1) space
bool has_cycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

// Return the node where the cycle begins, or nullptr
ListNode* find_cycle_start(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            // Phase 2: find entry point
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }
    return nullptr;
}

// Merge two sorted linked lists. O(n+m) time, O(1) space
ListNode* merge_sorted(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}`,
    },
    {
      language: "cpp",
      caption: "LRU Cache using doubly linked list and hash map",
      source: `#include <iostream>
#include <unordered_map>

struct DLLNode {
    int key, val;
    DLLNode* prev;
    DLLNode* next;
    DLLNode(int k = 0, int v = 0)
        : key(k), val(v), prev(nullptr), next(nullptr) {}
};

class LRUCache {
    int capacity_;
    std::unordered_map<int, DLLNode*> cache_;  // key -> node
    DLLNode head_, tail_;  // sentinels

    void remove(DLLNode* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void add_front(DLLNode* node) {
        node->next = head_.next;
        node->prev = &head_;
        head_.next->prev = node;
        head_.next = node;
    }

public:
    LRUCache(int capacity) : capacity_(capacity) {
        head_.next = &tail_;
        tail_.prev = &head_;
    }

    ~LRUCache() {
        DLLNode* curr = head_.next;
        while (curr != &tail_) {
            DLLNode* next = curr->next;
            delete curr;
            curr = next;
        }
    }

    int get(int key) {
        auto it = cache_.find(key);
        if (it == cache_.end()) return -1;
        DLLNode* node = it->second;
        remove(node);
        add_front(node);  // mark as most recently used
        return node->val;
    }

    void put(int key, int value) {
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            remove(it->second);
            delete it->second;
            cache_.erase(it);
        }
        DLLNode* node = new DLLNode(key, value);
        cache_[key] = node;
        add_front(node);
        if (static_cast<int>(cache_.size()) > capacity_) {
            DLLNode* lru = tail_.prev;
            remove(lru);
            cache_.erase(lru->key);
            delete lru;
        }
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Singly vs Doubly Linked List Node Structure",
      kind: "architecture",
      caption:
        "Each singly linked list node has a value and a next pointer. Doubly linked list nodes add a prev pointer, enabling bidirectional traversal and O(1) deletion with a node reference.",
    },
    {
      title: "Floyd's Cycle Detection Pointer Movement",
      kind: "flow",
      caption:
        "Slow pointer moves one step, fast pointer moves two steps per iteration. If a cycle exists, they converge inside the cycle. Resetting slow to head and advancing both by one finds the cycle entry.",
    },
  ],
  animations: [
    {
      title: "Reversing a Singly Linked List In-Place",
      steps: [
        {
          label: "Initialize pointers",
          detail:
            "Set prev = null, curr = head (node A). The list is A -> B -> C -> D -> null.",
        },
        {
          label: "Reverse first link",
          detail:
            "Save next = B. Set A.next = null (prev). Move prev = A, curr = B. List state: A <- ... B -> C -> D.",
        },
        {
          label: "Reverse second link",
          detail:
            "Save next = C. Set B.next = A. Move prev = B, curr = C. Partial reversed chain: B -> A -> null.",
        },
        {
          label: "Reverse third link",
          detail:
            "Save next = D. Set C.next = B. Move prev = C, curr = D. Chain: C -> B -> A -> null.",
        },
        {
          label: "Reverse last link",
          detail:
            "Save next = null. Set D.next = C. Move prev = D, curr = null. Chain: D -> C -> B -> A -> null.",
        },
        {
          label: "Return new head",
          detail:
            "curr is null so the loop ends. prev points to D, which is the new head. The list is fully reversed.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "Singly Linked List",
      "Doubly Linked List",
      "Circular Linked List",
      "Array / Dynamic Array",
    ],
    rows: [
      [
        "Access by index",
        "O(n)",
        "O(n)",
        "O(n)",
        "O(1)",
      ],
      [
        "Insert at head",
        "O(1)",
        "O(1)",
        "O(1)",
        "O(n)",
      ],
      [
        "Insert at tail",
        "O(n) without tail ptr, O(1) with",
        "O(1) with sentinel",
        "O(1) with tail ptr",
        "O(1) amortized",
      ],
      [
        "Delete known node",
        "O(n) — need predecessor",
        "O(1)",
        "O(n) singly / O(1) doubly",
        "O(n)",
      ],
      [
        "Memory overhead",
        "1 pointer per node",
        "2 pointers per node",
        "1-2 pointers per node",
        "None (contiguous)",
      ],
      [
        "Cache performance",
        "Poor (scattered nodes)",
        "Poor (scattered nodes)",
        "Poor (scattered nodes)",
        "Excellent (contiguous)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How do you detect a cycle in a linked list, and how do you find where the cycle starts?",
      a: "Use Floyd's tortoise-and-hare algorithm. Move slow one step and fast two steps per iteration. If they meet, a cycle exists. To find the entry: reset slow to head, keep fast at the meeting point, and advance both one step at a time — they meet at the cycle's start. This works because if the distance from head to cycle entry is 'a' and the meeting point is 'b' steps into a cycle of length 'c', then 2(a+b) = a+b+kc, so a = kc-b.",
      followUps: [
        "What if you need to find the length of the cycle?",
        "Can you detect a cycle using O(n) space instead? (hash set approach)",
        "How would you remove the cycle once detected?",
      ],
    },
    {
      q: "How would you reverse a linked list in groups of k?",
      a: "Process the list in chunks of k nodes. For each chunk, reverse k nodes using the standard three-pointer technique (prev, curr, next). Connect the tail of the previous reversed chunk to the head of the current reversed chunk. Keep track of the first node in each group (which becomes the tail after reversal) to wire it to the next group's head. Handle the last group specially if it has fewer than k nodes (either reverse or leave as-is, depending on the problem variant). Time: O(n), Space: O(1).",
      followUps: [
        "What if you should not reverse the last group when it has fewer than k nodes?",
        "Can you do this recursively? What is the space complexity then?",
      ],
    },
    {
      q: "Design an LRU cache with O(1) get and put.",
      a: "Use a hash map for O(1) key lookup and a doubly linked list to maintain access order. The most recently used item is at the head; the least recently used is at the tail. On get: look up the node via the map, move it to the head (O(1) with doubly linked list), return the value. On put: if the key exists, update and move to head; if new, create a node at the head and add to the map; if over capacity, remove the tail node and delete its key from the map. Sentinel head/tail nodes eliminate null-check edge cases.",
      followUps: [
        "How would you make this thread-safe?",
        "How does this differ from an LFU cache?",
        "What data structure does Python's OrderedDict use internally?",
      ],
    },
    {
      q: "How do you find the intersection point of two singly linked lists?",
      a: "Compute the lengths of both lists. Advance the pointer of the longer list by the difference in lengths. Then advance both pointers one step at a time — they will meet at the intersection node (or both reach null if no intersection). Alternatively, use the two-pointer trick: pointer A traverses list A then switches to list B's head; pointer B does the reverse. They meet at the intersection after at most len(A)+len(B) steps because both travel the same total distance. Time: O(n+m), Space: O(1).",
      followUps: [
        "What if the lists might have cycles?",
        "Can you solve it with a hash set? What is the trade-off?",
      ],
    },
  ],
  followUps: [
    "How does merge sort on a linked list achieve O(1) auxiliary space, and why is it preferred over quicksort for lists?",
    "What are skip lists and how do they give O(log n) search over a linked list structure?",
    "How do linked lists relate to memory allocators (free lists) in operating systems?",
    "Why do modern systems often prefer arrays over linked lists despite the theoretical insertion advantage?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of deleting a node from the middle of a singly linked list when you only have a pointer to that node (not its predecessor)?",
      options: [
        "O(1) — copy next node's data and delete next",
        "O(n) — must traverse from head to find predecessor",
        "O(1) — simply set node to null",
        "Impossible without the head pointer",
      ],
      answerIndex: 0,
      explanation:
        "You can copy the next node's value into the current node and then delete the next node by setting current.next = current.next.next. This is O(1) but does not work for the last node in the list.",
    },
    {
      q: "In Floyd's cycle detection, if the slow pointer has moved 's' steps when they meet, how many steps has the fast pointer moved?",
      options: ["s", "2s", "s + 1", "s^2"],
      answerIndex: 1,
      explanation:
        "The fast pointer moves exactly twice as fast as the slow pointer, so it has moved 2s steps when they meet.",
    },
    {
      q: "What is the space complexity of an LRU cache holding n items, implemented with a doubly linked list and a hash map?",
      options: ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
      answerIndex: 1,
      explanation:
        "Both the hash map and the doubly linked list store n entries, so the total space is O(n). Each entry appears exactly once in both structures.",
    },
    {
      q: "Which linked list variant allows O(1) deletion of a node when you have a direct reference to it?",
      options: [
        "Singly linked list",
        "Doubly linked list",
        "Circular singly linked list",
        "Skip list",
      ],
      answerIndex: 1,
      explanation:
        "A doubly linked list lets you access both the predecessor (via prev) and successor (via next) of any node, so deletion is O(1). A singly linked list requires O(n) traversal to find the predecessor.",
    },
    {
      q: "What is the time complexity of finding the middle node of a singly linked list using the fast/slow pointer technique?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 2,
      explanation:
        "The slow pointer traverses n/2 nodes and the fast pointer traverses n nodes, both in a single pass. The total work is O(n).",
    },
  ],
  exercises: [
    "Implement a function that checks if a singly linked list is a palindrome in O(n) time and O(1) space. Hint: find the middle, reverse the second half, compare, then restore the list.",
    "Write a function to remove the N-th node from the end of a singly linked list in one pass. Use two pointers separated by N nodes.",
    "Implement a function that flattens a multilevel doubly linked list (where some nodes have a child pointer to another list) into a single-level list in DFS order.",
    "Build a function to add two numbers represented as linked lists where each node contains a single digit stored in reverse order (e.g., 342 is stored as 2->4->3). Return the sum as a new linked list.",
  ],
  flashcards: [
    {
      front: "What is the time complexity of inserting at the head of a singly linked list?",
      back: "O(1). Create a new node, set its next to the current head, and update the head pointer.",
    },
    {
      front: "How does Floyd's algorithm find the start of a cycle?",
      back: "After slow and fast meet inside the cycle, reset one pointer to head. Advance both one step at a time — they meet at the cycle's entry point because the distance from head to entry equals the distance from meeting point to entry (mod cycle length).",
    },
    {
      front: "Why is deletion O(1) in a doubly linked list but O(n) in a singly linked list?",
      back: "A doubly linked list node has a prev pointer, so you can directly access and update the predecessor. In a singly linked list, you must traverse from the head to find the predecessor.",
    },
    {
      front: "What are sentinel (dummy) nodes and why are they useful?",
      back: "Sentinel nodes are placeholder nodes at the head and/or tail that never hold real data. They eliminate null checks and edge cases for empty lists, single-element lists, and head/tail insertions/deletions.",
    },
    {
      front: "How does an LRU cache achieve O(1) for both get and put?",
      back: "A hash map provides O(1) lookup by key. A doubly linked list maintains access order, allowing O(1) move-to-front and O(1) evict-from-tail. The two structures reference the same node objects.",
    },
    {
      front: "What is the difference between a circular and a non-circular linked list?",
      back: "In a circular linked list, the last node's next pointer points back to the head (and in doubly circular, the head's prev points to the tail). In a non-circular list, the last node's next is null.",
    },
    {
      front: "How do you merge two sorted linked lists in O(n+m) time?",
      back: "Use a dummy head node and a tail pointer. Compare the heads of both lists, append the smaller node to tail, advance that list's pointer. Repeat until one list is exhausted, then append the remainder.",
    },
    {
      front: "Why is linked list merge sort preferred over quicksort for linked lists?",
      back: "Merge sort splits the list using slow/fast pointers (O(n)) and merges by rewiring pointers (O(1) extra space). Quicksort needs random access for efficient partitioning, which linked lists do not provide.",
    },
  ],
  revisionNotes: [
    "Singly linked list: O(1) insert/delete at head, O(n) access, O(n) search. Doubly: adds O(1) delete of a known node.",
    "Always consider edge cases: empty list, single node, cycle present, operations on head/tail nodes.",
    "Fast/slow pointers: use for cycle detection (Floyd's), finding the middle, and detecting palindromes.",
    "LRU cache = doubly linked list (order) + hash map (lookup). Both operations are O(1).",
    "Reversing a linked list uses three pointers (prev, curr, next) and is the building block for many problems: reverse in groups of k, palindrome check, reorder list.",
    "Circular lists need careful termination conditions — traverse until you return to the starting node, not until null.",
  ],
  cheatSheet: [
    "Reverse: prev=null, curr=head; while curr: nxt=curr.next, curr.next=prev, prev=curr, curr=nxt; return prev",
    "Cycle detection: slow=fast=head; while fast and fast.next: slow=slow.next, fast=fast.next.next; if slow==fast: cycle found",
    "Find middle: slow=fast=head; while fast and fast.next: slow=slow.next, fast=fast.next.next; slow is middle",
    "Merge two sorted: use dummy node, compare heads, wire smaller, advance that pointer. Append remaining list at end.",
    "Delete node without head pointer: copy next node's value to current, set current.next = current.next.next (fails for tail node)",
    "Intersection of two lists: advance longer list's pointer by length difference, then walk both until they meet",
  ],
  resources: [
    {
      label: "LeetCode Linked List Study Plan",
      kind: "article",
      note: "Curated problem set covering reversal, cycle detection, merge, and advanced pointer techniques.",
    },
    {
      label: "Introduction to Algorithms (CLRS) - Chapter 10: Elementary Data Structures",
      kind: "book",
      note: "Formal treatment of linked lists, sentinels, and pointer-based data structures.",
    },
    {
      label: "Bjarne Stroustrup - Why you should avoid linked lists (CppCon talk)",
      kind: "video",
      note: "Explains why arrays often outperform linked lists in practice due to cache locality, despite worse theoretical complexity for insertions.",
    },
    {
      label: "Redis Sorted Sets and Skip Lists",
      kind: "docs",
      note: "Real-world use of skip lists (a probabilistic linked list extension) in Redis for O(log n) sorted set operations.",
    },
    {
      label: "Linux Kernel Linked List Implementation (list.h)",
      kind: "repo",
      note: "The kernel's intrusive doubly linked list — a masterclass in C-level linked list design with container_of macro.",
    },
  ],
  glossary: [
    {
      term: "Node",
      definition:
        "The fundamental unit of a linked list, containing a data field and one or more pointer fields linking to other nodes.",
    },
    {
      term: "Head pointer",
      definition:
        "A pointer (or reference) to the first node in the linked list. The list is accessed and identified through this pointer.",
    },
    {
      term: "Sentinel node",
      definition:
        "A dummy node placed at the boundary of a linked list (head and/or tail) to simplify edge-case handling. It does not store real data.",
    },
    {
      term: "Floyd's algorithm",
      definition:
        "A cycle detection algorithm using two pointers (slow and fast) that move at different speeds. Also known as the tortoise and hare algorithm.",
    },
    {
      term: "Doubly linked list",
      definition:
        "A linked list variant where each node has both a next and a prev pointer, enabling bidirectional traversal and O(1) deletion of a known node.",
    },
    {
      term: "Circular linked list",
      definition:
        "A linked list where the last node's next pointer points back to the first node, forming a closed loop. Can be singly or doubly linked.",
    },
    {
      term: "Skip list",
      definition:
        "A probabilistic data structure built on top of a linked list with multiple levels of forward pointers, providing O(log n) average-case search, insert, and delete.",
    },
    {
      term: "Intrusive linked list",
      definition:
        "A linked list design where the link pointers are embedded directly in the data structure rather than wrapping data in a separate node object. Used in the Linux kernel.",
    },
  ],
};
