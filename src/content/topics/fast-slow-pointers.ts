import type { TopicContent } from "../types";

export const fastSlowPointers: TopicContent = {
  quickSummary: [
    "Two pointers over the same sequence at different speeds — `slow` one step, `fast` two. If a cycle exists they must meet; if not, `fast` falls off the end.",
    "After the meeting, resetting one pointer to the head and walking both **one step at a time** lands them exactly on the cycle's entry node.",
    "O(n) time, **O(1) space** — the whole point versus the hash-set solution, which is also O(n) time but O(n) space.",
  ],
  detailed: [
    "Floyd's cycle detection (the \"tortoise and hare\") works on any structure where each element has exactly one successor: a linked list's `next`, an array read as `i -> a[i]`, or a numeric function applied repeatedly. Such a sequence is eventually periodic — it either terminates or enters a loop — and two pointers moving at speeds 1 and 2 close the gap between them by exactly one node per step once both are inside the loop, so they are guaranteed to collide within one lap.\n\nKey insight: the technique is not about linked lists, it is about **iterated functions with O(1) memory**. Anything of the form \"apply f repeatedly and detect repetition\" is a candidate.",
    "## When do I reach for this\n\nTwo recognition cues. First, the problem is about a **cycle, a loop, or infinite repetition** and the interviewer has hinted at constant space — that is Floyd's, near-verbatim. Second, you need a **positional landmark in one pass** over a structure you cannot index or measure cheaply: the middle node, the node k from the end, or the second half of a list. Moving one pointer at twice the speed of another turns \"I need to know the length first\" into a single traversal.\n\nClassic problems it solves:\n\n| Problem | Role of the two speeds |\n| --- | --- |\n| Linked List Cycle | do they meet at all |\n| Linked List Cycle II | meeting point plus reset gives the entry node |\n| Middle of the Linked List | `fast` at the end means `slow` is at the middle |\n| Palindrome Linked List | `slow` finds the middle, then reverse the second half |\n| Reorder List | same middle-then-reverse split |\n| Happy Number | `f(x)` = sum of squared digits; the cycle means not happy |\n| Find the Duplicate Number | treat `i -> a[i]` as a linked list; the duplicate is the cycle entry |",
    "## Why the reset trick finds the entry\n\nLet `m` be the distance from head to the cycle entry, `c` the cycle length, and `k` the distance from the entry to the meeting point. When they meet, `slow` has walked `m + k` (plus possibly whole laps) and `fast` has walked exactly twice that. The difference is a whole number of laps, which reduces to `m ≡ -k (mod c)`. So walking `m` more steps from the meeting point also lands on the entry. Start one pointer at the head, keep the other at the meeting point, advance both one step at a time, and they collide precisely at the entry.\n\nCommon mistake: starting the loop with `fast = head->next` for the *middle* problem and then reusing the same skeleton for cycle detection. Cycle detection needs both pointers to start at the head, otherwise the algebra above does not hold.",
    "## Cost and the alternative\n\n**Time O(n)**: `slow` walks at most `m + c` nodes before the meeting, and the entry phase walks at most `m` more. **Space O(1)** — two pointers, no allocation. A hash set of visited nodes is easier to write and also O(n) time, but O(n) space; interviewers ask for Floyd's specifically to force the space down. Neither mutates the list, unlike the \"mark visited by reversing pointers\" hacks, which are destructive and hard to justify.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Cycle detection plus cycle entry — Floyd's, O(1) space",
      source: `struct ListNode { int val; ListNode* next; };

bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;              // 1 step
        fast = fast->next->next;        // 2 steps
        if (slow == fast) return true;  // gap closes by 1 per step -> must meet
    }
    return false;                        // fast ran off the end: no cycle
}

// Returns the first node of the cycle, or nullptr if the list is acyclic.
ListNode* cycleEntry(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {                 // phase 2: reset and walk in lockstep
            ListNode* p = head;
            while (p != slow) { p = p->next; slow = slow->next; }
            return p;                       // meeting point == cycle entry
        }
    }
    return nullptr;
}
// Both: O(n) time, O(1) space. Neither mutates the list.`,
    },
    {
      language: "cpp",
      caption: "Middle node, palindrome list, and happy number — same skeleton",
      source: `// Middle of a list in one pass. For even length this returns the second middle.
ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    return slow;
}

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    while (head) { ListNode* nx = head->next; head->next = prev; prev = head; head = nx; }
    return prev;
}

bool isPalindromeList(ListNode* head) {
    ListNode* mid = middleNode(head);      // split
    ListNode* second = reverseList(mid);   // reverse the tail in place
    ListNode* a = head;
    ListNode* b = second;
    bool ok = true;
    while (ok && b) { if (a->val != b->val) ok = false; a = a->next; b = b->next; }
    reverseList(second);                   // restore the list before returning
    return ok;
}
// isPalindromeList: O(n) time, O(1) space (a copy into a vector would be O(n) space).

int squaredDigitSum(int x) {
    int s = 0;
    while (x) { int d = x % 10; s += d * d; x /= 10; }
    return s;
}

bool isHappy(int n) {                      // the sequence is an iterated function
    int slow = n, fast = n;
    do {
        slow = squaredDigitSum(slow);
        fast = squaredDigitSum(squaredDigitSum(fast));
    } while (slow != fast);
    return slow == 1;                      // met at 1 -> happy; met elsewhere -> cycle
}
// isHappy: O(log n) digits per step, bounded number of steps; O(1) space.`,
    },
  ],
  cheatSheet: [
    "Cycle test: both start at `head`, `slow += 1`, `fast += 2`; they meet iff a cycle exists.",
    "Entry node: on meeting, reset one pointer to `head` and step **both by 1** — they collide at the entry.",
    "Middle: loop `while (fast && fast->next)`; `slow` ends on the middle (second middle if even).",
    "Guard `fast && fast->next` before dereferencing — this is where null-deref bugs live.",
    "O(n) time, O(1) space. Hash-set alternative is O(n) time but O(n) space.",
  ],
  interviewQA: [
    {
      q: "Prove that resetting one pointer to the head after the meeting finds the start of the cycle.",
      a: "Let `m` be the number of steps from the head to the cycle entry, `c` the cycle length, and `k` the offset of the meeting point from the entry, measured along the cycle. When they meet, `slow` has taken `m + k` steps (assuming it has not yet completed a full lap, which it cannot since it is slower) and `fast` has taken `2(m + k)` steps. Both are at the same node, so their step counts differ by a whole number of laps: `2(m + k) - (m + k) = m + k = p * c` for some integer `p >= 1`. Rearranging, `m = p * c - k`. So walking `m` steps forward from the meeting point moves `p` full laps back to the entry minus the `k` you were already past — landing exactly on the entry. That is why a pointer starting at the head and one starting at the meeting point, both moving one step per iteration, collide precisely at the entry after `m` steps. Total cost stays O(n) time and O(1) space.",
      followUps: [
        "How would you also compute the cycle's length from the same meeting point?",
        "Does the proof still hold if fast moves three steps at a time?",
      ],
    },
    {
      q: "Why must the pointers meet if a cycle exists — could fast jump over slow?",
      a: "No, and the reason is the gap argument. Once both pointers are inside the cycle, look at the distance from `fast` to `slow` measured forward along the cycle. Each iteration `fast` gains exactly one position on `slow`, since it moves two and `slow` moves one. So that gap decreases by exactly 1 per step and therefore hits 0 — it cannot skip past 0 because it changes by unit steps, which is precisely why a step size of 2 is safe. If `fast` moved three steps at a time the gap would shrink by 2 per step and could stride over `slow` when the parity is wrong; detection still works eventually because of modular arithmetic, but the clean one-per-step argument is lost and the entry-finding formula changes. Since `slow` enters the cycle after at most `m` steps and the gap is at most `c - 1` at that moment, they meet within `m + c` iterations, giving O(n).",
      followUps: [
        "What is the meeting behaviour for speeds 1 and 4?",
        "How does Brent's algorithm compare in number of function evaluations?",
      ],
    },
    {
      q: "Find the Duplicate Number is an array problem. How does a linked-list cycle algorithm apply, and what are the constraints that make it work?",
      a: "The setup is an array of `n + 1` integers where every value is in the range 1..n, so by pigeonhole at least one value repeats. Read the array as a function `i -> a[i]`: starting from index 0, each index has exactly one successor, which is exactly the successor structure a linked list has. Because every value is at least 1, no path ever returns to index 0, so index 0 is outside any cycle — the sequence must therefore run into a cycle whose entry is a node with two incoming edges, and a node with two incoming edges is exactly a repeated value. Run Floyd's with `slow = a[slow]` and `fast = a[a[fast]]`, then do the reset phase, and the entry index is the duplicated number. It is O(n) time and O(1) space, and it does not modify the array — which matters, because the alternative O(1)-space trick of negating `a[abs(x)]` as a visited marker mutates the input. Sorting would be O(n log n) and also mutating; a frequency array is O(n) extra space.",
      followUps: [
        "Where exactly does the argument break if values could be 0?",
        "How would you extend this to report all duplicates rather than one?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Floyd's cycle entry — the two phases",
      back: "Phase 1: `slow += 1`, `fast += 2` from the head until they meet. Phase 2: reset one to the head, advance both by 1; they collide at the cycle entry. O(n) time, O(1) space.",
    },
    {
      front: "Why can't fast skip over slow?",
      back: "Inside the cycle the forward gap shrinks by exactly 1 each step (2 - 1), so it must hit 0. With a step size of 3 the gap shrinks by 2 and can stride past.",
    },
    {
      front: "Fast/slow beyond cycles",
      back: "Middle of list, palindrome list (middle then reverse), reorder list, happy number, find-the-duplicate via `i -> a[i]`. All O(1) space.",
    },
  ],
};
