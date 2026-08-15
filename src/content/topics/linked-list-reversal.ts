import type { TopicContent } from "../types";

export const linkedListReversal: TopicContent = {
  quickSummary: [
    "Three pointers — `prev`, `cur`, `nxt` — walk the list once and flip every `next` edge. O(n) time, O(1) space.",
    "Every variant is the same loop plus bookkeeping: a **dummy head** for sublists, a **group boundary** for k-groups, a **slow/fast split** for palindromes.",
    "Recognition cue: the problem says *in place*, *O(1) extra space*, or *do not modify the values* — that rules out copying to an array and points at pointer surgery.",
  ],
  detailed: [
    "The whole family rests on one loop that reverses a chain of `next` pointers. You hold three references: `prev` (the already-reversed part), `cur` (the node being flipped), and a saved `nxt` so you do not lose the rest of the list the instant you overwrite `cur->next`. After the loop `prev` is the new head and `cur` is whatever came after the reversed segment.\n\nCommon mistake: overwriting `cur->next` before saving it. That severs the tail and the list becomes unreachable — save `nxt` first, always.",
    "## Reversing a sublist between positions\n\nTo reverse only positions `left..right`, allocate a **dummy node** in front of the head so position 1 has a predecessor and the head-changing case needs no special branch. Walk `prev` to the node just before `left`, then repeatedly *head-insert*: unhook the node after `cur` and splice it directly behind `prev`. After `right - left` splices the segment is reversed and both seams are already reconnected.\n\nThe alternative — reverse the segment with the plain three-pointer loop, then stitch `prev->next` and the old segment head — works too but needs four saved pointers and is easier to get wrong under time pressure.\n\nClassic problems: **Reverse Linked List**, **Reverse Linked List II**.",
    "## Reversing in k-sized groups\n\nBefore reversing a group you must confirm k nodes actually exist, so walk k steps from `groupPrev` and bail if you fall off the end (the trailing remainder stays in original order). The trick that keeps the code short is seeding `prev` with `groupNext` — the node just past the group — instead of `nullptr`, so the group's tail is already connected to the rest of the list when the loop ends. The old group head becomes the new group tail, which is exactly the next iteration's `groupPrev`.\n\nStill O(n) time: each node is visited once to count and once to flip. Space is O(1) iteratively; the recursive version is O(n/k) stack frames.\n\nClassic problems: **Reverse Nodes in k-Group**, **Swap Nodes in Pairs** (the k = 2 case).",
    "## Reversal as a tool, not a goal\n\nReversal is often the *enabling step* rather than the answer. To test a linked list for palindromy in O(1) space: find the middle with a slow/fast pointer pair, reverse the second half in place, walk the two halves in lockstep comparing values, and (politely) reverse the second half back before returning. Comparing against a copied array is O(n) space and usually the thing the interviewer is fishing for you to avoid.\n\nThe same move powers **Reorder List** (split, reverse the back half, interleave) and **Add Two Numbers II** when you are not allowed a stack.\n\nKey insight: reversing gives you backwards traversal on a singly linked list for free. Any problem that wants to read a list from the tail is a reversal problem in disguise.",
    "## Complexity and correctness checklist\n\n| Variant | Time | Space |\n| --- | --- | --- |\n| Full reversal (iterative) | O(n) | O(1) |\n| Full reversal (recursive) | O(n) | O(n) stack |\n| Sublist `left..right` | O(n) | O(1) |\n| k-group | O(n) | O(1) |\n| Palindrome via reversal | O(n) | O(1) |\n\nBefore you say \"done\", check three things: the new head is returned (not the stale one), the old head's `next` is `nullptr` or correctly re-linked (a dangling `next` creates a cycle), and single-node / empty-list inputs return without dereferencing null.",
  ],
  code: [
    {
      language: "cpp",
      caption: "The three-pointer loop, and reversing only positions left..right via head-insertion",
      source: `struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

// Reverse the whole list. Returns the new head.
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur  = head;
    while (cur) {
        ListNode* nxt = cur->next;   // SAVE first — cur->next is about to die
        cur->next = prev;            // flip the edge
        prev = cur;                  // shuffle both pointers forward
        cur  = nxt;
    }
    return prev;                     // cur is null; prev is the last node seen
}
// Time O(n), space O(1).

// Reverse positions [left, right], 1-indexed. Dummy head removes the
// "what if left == 1" special case entirely.
ListNode* reverseBetween(ListNode* head, int left, int right) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* prev = &dummy;
    for (int i = 1; i < left; ++i) prev = prev->next;   // node before the segment

    ListNode* cur = prev->next;                        // stays the segment TAIL
    for (int i = 0; i < right - left; ++i) {           // head-insert right-1..left+1
        ListNode* nxt = cur->next;
        cur->next  = nxt->next;                        // unhook nxt
        nxt->next  = prev->next;                       // splice it behind prev
        prev->next = nxt;
    }
    return dummy.next;
}
// Time O(n), space O(1). Both seams reconnect automatically.`,
    },
    {
      language: "cpp",
      caption: "Reverse in k-sized groups, and the O(1)-space palindrome check",
      source: `// Reverse every consecutive block of k nodes; a trailing block of
// fewer than k nodes is left untouched.
ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* groupPrev = &dummy;

    while (true) {
        ListNode* kth = groupPrev;                     // find the k-th node
        for (int i = 0; i < k && kth; ++i) kth = kth->next;
        if (!kth) break;                               // fewer than k left: stop

        ListNode* groupNext = kth->next;
        ListNode* prev = groupNext;                    // seed with the NEXT group
        ListNode* cur  = groupPrev->next;
        while (cur != groupNext) {                     // standard flip loop
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur  = nxt;
        }
        ListNode* newGroupPrev = groupPrev->next;      // old head = new tail
        groupPrev->next = kth;                         // stitch the front seam
        groupPrev = newGroupPrev;
    }
    return dummy.next;
}
// Time O(n) — each node counted once, flipped once. Space O(1).

// Palindrome test without copying values out.
bool isPalindrome(ListNode* head) {
    if (!head || !head->next) return true;

    ListNode* slow = head;                             // 1. find the middle
    ListNode* fast = head;
    while (fast->next && fast->next->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = reverseList(slow->next);        // 2. reverse the back half

    bool ok = true;                                    // 3. walk in lockstep
    for (ListNode *a = head, *b = second; b; a = a->next, b = b->next)
        if (a->val != b->val) { ok = false; break; }

    slow->next = reverseList(second);                  // 4. restore the input
    return ok;
}
// Time O(n), space O(1).`,
    },
  ],
  cheatSheet: [
    "Core loop: `nxt = cur->next; cur->next = prev; prev = cur; cur = nxt;` — save before you overwrite.",
    "After the loop `prev` is the new head, `cur` is the node just past the reversed part.",
    "Sublist or head-may-change → use a **dummy node** in front; it kills the `left == 1` branch.",
    "k-group: verify k nodes exist first, then seed `prev = groupNext` so the tail auto-reconnects.",
    "Need to read a singly linked list backwards in O(1) space? Reverse it (palindrome, reorder, add-from-tail).",
    "All variants: O(n) time, O(1) space iteratively; recursion costs O(n) stack.",
  ],
  interviewQA: [
    {
      q: "Walk me through reversing a singly linked list in place, and explain why the three-pointer version is preferred over recursion here.",
      a: "I keep three references. `prev` starts null and points at the already-reversed prefix, `cur` is the node I am flipping, and `nxt` is a saved copy of `cur->next` taken *before* I overwrite it — that save is the whole trick, because the moment I assign `cur->next = prev` the rest of the list is unreachable through `cur`. Each iteration is: save `nxt`, flip `cur->next = prev`, then advance `prev = cur; cur = nxt`. The loop ends when `cur` is null, at which point `prev` is the last node visited, which is the new head. That is O(n) time and O(1) space.\n\nThe recursive version is elegant — recurse to the end, then on unwind set `cur->next->next = cur; cur->next = nullptr` — but it costs O(n) stack frames and will overflow on a list of a few hundred thousand nodes. Since interviewers who ask this usually add an explicit O(1)-space constraint, and since the iterative loop is the building block for every follow-up (sublist reversal, k-groups, palindrome check), the iterative form is the one worth having in muscle memory.",
      followUps: [
        "Now reverse only the nodes between positions left and right in one pass.",
        "What breaks if you forget to null out the original head's next pointer?",
      ],
    },
    {
      q: "Reverse a linked list in groups of k. How do you handle a final group with fewer than k nodes, and what makes the pointer stitching tricky?",
      a: "I use a dummy head and a `groupPrev` pointer that always sits just before the group I am about to reverse. Each round I walk k steps from `groupPrev` to find the k-th node; if I run off the end before k steps, fewer than k nodes remain and I stop, leaving that remainder in its original order. Otherwise I record `groupNext = kth->next` and run the standard flip loop over the group — but I seed `prev` with `groupNext` rather than null. That single change means the group's tail is already pointing at the rest of the list when the loop finishes, so I only have one seam left to fix.\n\nThe stitching subtlety is that after reversing, the *old* group head is now the group's tail, so I must save `groupPrev->next` before overwriting it — that saved node becomes the next iteration's `groupPrev`. Then `groupPrev->next = kth` connects the front seam. Complexity is O(n) time (every node is touched twice: once counting, once flipping) and O(1) space. If the variant asks that a short final group also be reversed, I just drop the early bail-out and reverse whatever is left.",
      followUps: [
        "How would the recursive formulation look, and what is its space cost?",
        "Adapt this to swap nodes in pairs without a general k parameter.",
      ],
    },
    {
      q: "Determine whether a linked list is a palindrome using O(1) extra space.",
      a: "Copying values into a vector and two-pointer comparing is O(n) space, which is the solution being ruled out. Instead: find the middle with slow and fast pointers — advancing fast two steps for every one of slow, with the `fast->next && fast->next->next` guard so that on an even-length list `slow` lands on the end of the first half. Reverse the sublist starting at `slow->next` using the standard three-pointer loop. Now I have two half-lists; I walk them in lockstep from `head` and from the reversed second head, comparing values, and stop as soon as they differ. I drive the loop off the *second* half, which is never longer than the first, so an odd middle element is naturally skipped and I never dereference null.\n\nTwo details I would raise unprompted. First, I restore the list by reversing the second half back and re-attaching it — mutating the caller's input and leaving it mangled is a real bug in library code even if the test harness never notices. Second, on early exit I still need to restore, so I set a flag and break rather than returning from inside the comparison loop. Total cost: three linear passes, O(n) time, O(1) space.",
      followUps: [
        "Why the `fast->next && fast->next->next` condition rather than `fast && fast->next`?",
        "How does this same split-reverse-merge shape solve reordering a list into L0, Ln, L1, Ln-1, ...?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The three-pointer reversal loop",
      back: "`nxt = cur->next; cur->next = prev; prev = cur; cur = nxt;` Save `nxt` before overwriting. Ends with `prev` = new head. O(n) time, O(1) space.",
    },
    {
      front: "Why seed `prev = groupNext` in k-group reversal?",
      back: "So the reversed group's tail already points at the following group — only the front seam (`groupPrev->next = kth`) is left to stitch.",
    },
    {
      front: "Linked-list palindrome in O(1) space",
      back: "Slow/fast to find the middle → reverse the second half → compare halves in lockstep → reverse back to restore. O(n) time, O(1) space.",
    },
  ],
};
