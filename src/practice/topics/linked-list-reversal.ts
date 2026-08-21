import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Reverse Linked List",
      difficulty: "Easy",
      variation: "Core drill: iterative three-pointer reversal",
      link: "https://leetcode.com/problems/reverse-linked-list/",
      question: [
        "Given the head of a singly linked list, reverse the list in place and return the new head. Use the iterative approach with O(1) extra space.",
        "Example 1:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
        "Example 2:\nInput: head = []\nOutput: []",
        "Constraints:\n- The number of nodes is in the range [0, 5000]\n- -5000 <= Node.val <= 5000",
      ],
      code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head != nullptr) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }
};`,
      explanation: [
        "Walk the list with three pointers: save the next node, flip the current node's pointer backwards to prev, then advance prev and head one step.",
        "The invariant after each iteration is that prev heads a fully reversed prefix and head points at the untouched suffix, so when head runs off the end, prev is the new head of the whole reversed list.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Reverse Linked List (Recursive)",
      difficulty: "Easy",
      variation: "Core drill: recursive reversal",
      link: "https://leetcode.com/problems/reverse-linked-list/",
      question: [
        "Given the head of a singly linked list, reverse the list and return the new head. This drill requires the recursive approach: reverse the rest of the list first, then fix up the current node's links.",
        "Example 1:\nInput: head = [1,2,3]\nOutput: [3,2,1]",
        "Constraints:\n- The number of nodes is in the range [0, 5000]\n- -5000 <= Node.val <= 5000",
      ],
      code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if (head == nullptr || head->next == nullptr)
            return head;
        ListNode* newHead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newHead;
    }
};`,
      explanation: [
        "Recurse to the last node, which becomes the new head and is returned unchanged through every frame. On the way back up, head->next is the tail of the already-reversed suffix, so pointing head->next->next at head appends the current node to that reversed suffix.",
        "Setting head->next to null is essential: it makes the original first node the correct final tail and prevents a cycle mid-reversal.",
        "Time: O(n). Space: O(n) recursion stack.",
      ],
    },
    {
      name: "Middle of the Linked List",
      difficulty: "Easy",
      variation: "Fast-slow prerequisite for half reversal",
      link: "https://leetcode.com/problems/middle-of-the-linked-list/",
      question: [
        "Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node. This is the standard prerequisite step for every reverse-second-half problem.",
        "Example 1:\nInput: head = [1,2,3,4,5]\nOutput: node 3",
        "Example 2:\nInput: head = [1,2,3,4,5,6]\nOutput: node 4 (the second of the two middles)",
        "Constraints:\n- The number of nodes is in the range [1, 100]\n- 1 <= Node.val <= 100",
      ],
      code: `class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};`,
      explanation: [
        "Advance slow by one and fast by two; when fast reaches the end, slow has covered exactly half the distance and sits on the middle node (the second middle for even lengths).",
        "The loop condition checks fast and fast->next so both parities terminate cleanly without ever dereferencing null.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Palindrome Linked List",
      difficulty: "Easy",
      variation: "Reverse second half and compare",
      link: "https://leetcode.com/problems/palindrome-linked-list/",
      question: [
        "Given the head of a singly linked list, return true if it is a palindrome and false otherwise. Do it in O(n) time and O(1) space.",
        "Example 1:\nInput: head = [1,2,2,1]\nOutput: true",
        "Example 2:\nInput: head = [1,2]\nOutput: false",
        "Constraints:\n- The number of nodes is in the range [1, 10^5]\n- 0 <= Node.val <= 9",
      ],
      code: `class Solution {
public:
    bool isPalindrome(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* prev = nullptr;
        while (slow != nullptr) {
            ListNode* next = slow->next;
            slow->next = prev;
            prev = slow;
            slow = next;
        }
        while (prev != nullptr) {
            if (head->val != prev->val) return false;
            head = head->next;
            prev = prev->next;
        }
        return true;
    }
};`,
      explanation: [
        "Find the middle with fast-slow pointers, reverse the second half in place, then walk one pointer from each end toward the middle comparing values.",
        "For odd lengths the middle node ends up in the reversed half and compares against itself via the shorter first-half walk, so both parities are handled without special cases; the loop is bounded by the reversed half, which is never longer than the front half.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Swap Nodes in Pairs",
      difficulty: "Medium",
      variation: "Fixed-size group reversal (k = 2) with dummy head",
      link: "https://leetcode.com/problems/swap-nodes-in-pairs/",
      question: [
        "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem by relinking nodes, not by swapping values.",
        "Example 1:\nInput: head = [1,2,3,4]\nOutput: [2,1,4,3]",
        "Example 2:\nInput: head = [1]\nOutput: [1]",
        "Constraints:\n- The number of nodes is in the range [0, 100]\n- 0 <= Node.val <= 100",
      ],
      code: `class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        while (prev->next != nullptr && prev->next->next != nullptr) {
            ListNode* a = prev->next;
            ListNode* b = a->next;
            a->next = b->next;
            b->next = a;
            prev->next = b;
            prev = a;
        }
        return dummy.next;
    }
};`,
      explanation: [
        "A dummy node in front of the list removes the head-swap special case. For each pair (a, b), three pointer writes splice b before a and reconnect the pair to the rest of the list.",
        "prev always points at the last node of the fully processed prefix, so each swap is local and the trailing odd node, if any, is left untouched by the loop condition.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Reverse Linked List II",
      difficulty: "Medium",
      variation: "Sublist reversal by head insertion",
      link: "https://leetcode.com/problems/reverse-linked-list-ii/",
      question: [
        "Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right (1-indexed), and return the head. Do it in one pass.",
        "Example 1:\nInput: head = [1,2,3,4,5], left = 2, right = 4\nOutput: [1,4,3,2,5]",
        "Example 2:\nInput: head = [5], left = 1, right = 1\nOutput: [5]",
        "Constraints:\n- The number of nodes is n, 1 <= n <= 500\n- -500 <= Node.val <= 500\n- 1 <= left <= right <= n",
      ],
      code: `class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        for (int i = 1; i < left; ++i)
            prev = prev->next;
        ListNode* cur = prev->next;
        for (int i = left; i < right; ++i) {
            ListNode* next = cur->next;
            cur->next = next->next;
            next->next = prev->next;
            prev->next = next;
        }
        return dummy.next;
    }
};`,
      explanation: [
        "Walk prev to the node just before position left. Then perform head insertion: each iteration detaches cur's successor and reinserts it right after prev, moving one node to the front of the window per step.",
        "cur stays on the original left node, which drifts rightward and finishes as the window's tail; after right - left insertions the window is exactly reversed and both boundary links are already correct. The dummy node covers left = 1.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Odd Even Linked List",
      difficulty: "Medium",
      variation: "In-place partition by index parity",
      link: "https://leetcode.com/problems/odd-even-linked-list/",
      question: [
        "Given the head of a singly linked list, group all nodes at odd positions together followed by the nodes at even positions, preserving relative order inside each group, and return the reordered list. Positions are 1-indexed. Use O(1) space and O(n) time.",
        "Example 1:\nInput: head = [1,2,3,4,5]\nOutput: [1,3,5,2,4]",
        "Example 2:\nInput: head = [2,1,3,5,6,4,7]\nOutput: [2,3,6,7,1,5,4]",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -10^6 <= Node.val <= 10^6",
      ],
      code: `class Solution {
public:
    ListNode* oddEvenList(ListNode* head) {
        if (head == nullptr) return head;
        ListNode* odd = head;
        ListNode* even = head->next;
        ListNode* evenHead = even;
        while (even != nullptr && even->next != nullptr) {
            odd->next = even->next;
            odd = odd->next;
            even->next = odd->next;
            even = even->next;
        }
        odd->next = evenHead;
        return head;
    }
};`,
      explanation: [
        "Thread two lists simultaneously through the original nodes: odd skips over even's node and vice versa, so each node is relinked exactly once and relative order in each parity class is preserved.",
        "When the walk ends, odd is the tail of the odd list, and attaching the saved evenHead concatenates the two halves. Same in-place relinking discipline as reversal drills, applied to partitioning.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Rotate List",
      difficulty: "Medium",
      variation: "Rotation via ring-and-break",
      link: "https://leetcode.com/problems/rotate-list/",
      question: [
        "Given the head of a linked list, rotate the list to the right by k places and return the new head.",
        "Example 1:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [4,5,1,2,3]",
        "Example 2:\nInput: head = [0,1,2], k = 4\nOutput: [2,0,1]",
        "Constraints:\n- The number of nodes is in the range [0, 500]\n- -100 <= Node.val <= 100\n- 0 <= k <= 2 * 10^9",
      ],
      code: `class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (head == nullptr || head->next == nullptr || k == 0)
            return head;
        int n = 1;
        ListNode* tail = head;
        while (tail->next != nullptr) {
            tail = tail->next;
            ++n;
        }
        k %= n;
        if (k == 0) return head;
        tail->next = head;
        ListNode* newTail = head;
        for (int i = 0; i < n - k - 1; ++i)
            newTail = newTail->next;
        ListNode* newHead = newTail->next;
        newTail->next = nullptr;
        return newHead;
    }
};`,
      explanation: [
        "Count the length while finding the tail, reduce k modulo n (k can vastly exceed n), then close the list into a ring by linking tail to head.",
        "Rotating right by k means the new head is the node at index n - k, so walk n - k - 1 steps to the new tail, cut the ring there, and return the node after the cut. The ring trick makes the boundary rewiring a single break instead of two traversals.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Swapping Nodes in a Linked List",
      difficulty: "Medium",
      variation: "Kth from front and back with one pass",
      link: "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
      question: [
        "You are given the head of a linked list and an integer k. Swap the values of the kth node from the beginning and the kth node from the end (the list is 1-indexed), and return the head.",
        "Example 1:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [1,4,3,2,5]",
        "Example 2:\nInput: head = [7,9,6,6,7,8,3,0,9,5], k = 5\nOutput: [7,9,6,6,8,7,3,0,9,5]",
        "Constraints:\n- The number of nodes is n, 1 <= k <= n <= 10^5\n- 0 <= Node.val <= 100",
      ],
      code: `class Solution {
public:
    ListNode* swapNodes(ListNode* head, int k) {
        ListNode* first = head;
        for (int i = 1; i < k; ++i)
            first = first->next;
        ListNode* second = head;
        ListNode* probe = first;
        while (probe->next != nullptr) {
            probe = probe->next;
            second = second->next;
        }
        swap(first->val, second->val);
        return head;
    }
};`,
      explanation: [
        "Advance a probe k - 1 steps to land on the kth node from the front. Then move the probe and a second pointer together until the probe hits the tail; the gap of n - k steps leaves the second pointer on the kth node from the end.",
        "Swapping values is sufficient here because only positions matter; a full node relink version is possible but adds four boundary cases without changing complexity.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Reorder List",
      difficulty: "Medium",
      variation: "Split, reverse half, interleave merge",
      link: "https://leetcode.com/problems/reorder-list/",
      question: [
        "You are given the head of a singly linked list L0 -> L1 -> ... -> Ln. Reorder it in place to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ... You may not modify node values, only the links.",
        "Example 1:\nInput: head = [1,2,3,4]\nOutput: [1,4,2,3]",
        "Example 2:\nInput: head = [1,2,3,4,5]\nOutput: [1,5,2,4,3]",
        "Constraints:\n- The number of nodes is in the range [1, 5 * 10^4]\n- 1 <= Node.val <= 1000",
      ],
      code: `class Solution {
public:
    void reorderList(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next != nullptr && fast->next->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* second = slow->next;
        slow->next = nullptr;
        ListNode* prev = nullptr;
        while (second != nullptr) {
            ListNode* next = second->next;
            second->next = prev;
            prev = second;
            second = next;
        }
        ListNode* first = head;
        while (prev != nullptr) {
            ListNode* n1 = first->next;
            ListNode* n2 = prev->next;
            first->next = prev;
            prev->next = n1;
            first = n1;
            prev = n2;
        }
    }
};`,
      explanation: [
        "Three composed sub-patterns: find the middle (fast-slow with the fast->next guard so the first half is never shorter), cut the list, reverse the second half, then alternately splice one node from each half.",
        "Because the first half has equal or one greater length, the interleave loop driven by the reversed half always terminates with valid links and the middle node naturally ends the odd-length case.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Twin Sum of a Linked List",
      difficulty: "Medium",
      variation: "Reverse-half pairing on an even-length list",
      link: "https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/",
      question: [
        "In a linked list of even size n, node i and node n - 1 - i are twins. The twin sum is the sum of a node's value and its twin's value. Given the head of an even-length linked list, return the maximum twin sum.",
        "Example 1:\nInput: head = [5,4,2,1]\nOutput: 6\nExplanation: Twins (5,1) and (4,2) both sum to 6.",
        "Example 2:\nInput: head = [4,2,2,3]\nOutput: 7\nExplanation: Twins (4,3) sum to 7 and (2,2) sum to 4.",
        "Constraints:\n- The number of nodes is an even integer in the range [2, 10^5]\n- 1 <= Node.val <= 10^5",
      ],
      code: `class Solution {
public:
    int pairSum(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* prev = nullptr;
        while (slow != nullptr) {
            ListNode* next = slow->next;
            slow->next = prev;
            prev = slow;
            slow = next;
        }
        int best = 0;
        while (prev != nullptr) {
            best = max(best, head->val + prev->val);
            head = head->next;
            prev = prev->next;
        }
        return best;
    }
};`,
      explanation: [
        "Twins pair the first half with the reversed second half, so this is exactly the palindrome-list skeleton with the comparison replaced by a running maximum of sums.",
        "The list length is guaranteed even, so slow lands exactly on the start of the second half and both walking pointers cover n / 2 pairs.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Add Two Numbers II",
      difficulty: "Medium",
      variation: "Arithmetic via reversal (most-significant-first lists)",
      link: "https://leetcode.com/problems/add-two-numbers-ii/",
      question: [
        "You are given two non-empty linked lists representing two non-negative integers with the most significant digit first. Add the two numbers and return the sum as a linked list, also most significant digit first. The numbers do not contain leading zeros except the number 0 itself.",
        "Example 1:\nInput: l1 = [7,2,4,3], l2 = [5,6,4]\nOutput: [7,8,0,7]",
        "Example 2:\nInput: l1 = [0], l2 = [0]\nOutput: [0]",
        "Constraints:\n- The number of nodes in each list is in the range [1, 100]\n- 0 <= Node.val <= 9\n- No leading zeros except the value 0",
      ],
      code: `class Solution {
    ListNode* reverse(ListNode* head) {
        ListNode* prev = nullptr;
        while (head != nullptr) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        l1 = reverse(l1);
        l2 = reverse(l2);
        ListNode* result = nullptr;
        int carry = 0;
        while (l1 != nullptr || l2 != nullptr || carry != 0) {
            int sum = carry;
            if (l1 != nullptr) { sum += l1->val; l1 = l1->next; }
            if (l2 != nullptr) { sum += l2->val; l2 = l2->next; }
            carry = sum / 10;
            result = new ListNode(sum % 10, result);
        }
        return result;
    }
};`,
      explanation: [
        "Addition needs the least significant digits first, so reverse both inputs, add digit by digit with a carry, and prepend each digit to the result list, which rebuilds the answer most-significant-first without a final reversal.",
        "The loop condition includes the carry so a final overflow digit (like 999 + 1) is emitted naturally. A stack-based version avoids mutating the inputs at the cost of O(n) space.",
        "Time: O(n + m). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Plus One Linked List",
      difficulty: "Medium",
      variation: "Arithmetic without reversal (rightmost non-nine)",
      link: "https://leetcode.com/problems/plus-one-linked-list/",
      question: [
        "Given a non-negative integer represented as a linked list of digits with the most significant digit first, add one to the integer and return the head of the resulting list.",
        "Example 1:\nInput: head = [1,2,3]\nOutput: [1,2,4]",
        "Example 2:\nInput: head = [9,9]\nOutput: [1,0,0]",
        "Constraints:\n- The number of nodes is in the range [1, 100]\n- 0 <= Node.val <= 9\n- The number does not contain leading zeros except the number 0 itself",
      ],
      code: `class Solution {
public:
    ListNode* plusOne(ListNode* head) {
        ListNode* notNine = nullptr;
        for (ListNode* cur = head; cur != nullptr; cur = cur->next)
            if (cur->val != 9)
                notNine = cur;
        if (notNine == nullptr) {
            ListNode* newHead = new ListNode(1, head);
            for (ListNode* cur = head; cur != nullptr; cur = cur->next)
                cur->val = 0;
            return newHead;
        }
        notNine->val += 1;
        for (ListNode* cur = notNine->next; cur != nullptr; cur = cur->next)
            cur->val = 0;
        return head;
    }
};`,
      explanation: [
        "Adding one only carries through a trailing run of nines, so find the rightmost digit that is not nine: increment it and zero everything after it. This sidesteps the reverse-add-reverse pipeline entirely.",
        "If every digit is nine, prepend a new 1 node and zero the whole list. Comparing this with Add Two Numbers II shows when reversal is necessary (general addition) versus avoidable (increment).",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Reverse Nodes in Even Length Groups",
      difficulty: "Medium",
      variation: "Variable group sizes with conditional reversal",
      link: "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/",
      question: [
        "The nodes of a linked list are sequentially assigned to groups of lengths 1, 2, 3, 4, and so on; the last group may be shorter. Reverse the nodes in each group whose actual length is even, and return the head of the modified list.",
        "Example 1:\nInput: head = [5,2,6,3,9,1,7,3,8,4]\nOutput: [5,6,2,3,9,1,4,8,3,7]\nExplanation: Groups are [5], [2,6], [3,9,1], [7,3,8,4]; the length-2 and length-4 groups are reversed.",
        "Example 2:\nInput: head = [1,1,0,6]\nOutput: [1,0,1,6]\nExplanation: The last group [6] has length 1 (odd), so only [1,0] is reversed.",
        "Constraints:\n- The number of nodes is in the range [1, 10^5]\n- 0 <= Node.val <= 10^5",
      ],
      code: `class Solution {
public:
    ListNode* reverseEvenLengthGroups(ListNode* head) {
        ListNode* prev = head;
        int group = 2;
        while (prev->next != nullptr) {
            int count = 0;
            ListNode* node = prev;
            while (node->next != nullptr && count < group) {
                node = node->next;
                ++count;
            }
            if (count % 2 == 0) {
                ListNode* curr = prev->next;
                ListNode* p = nullptr;
                ListNode* tail = curr;
                for (int i = 0; i < count; ++i) {
                    ListNode* next = curr->next;
                    curr->next = p;
                    p = curr;
                    curr = next;
                }
                prev->next = p;
                tail->next = curr;
                prev = tail;
            } else {
                prev = node;
            }
            ++group;
        }
        return head;
    }
};`,
      explanation: [
        "The first group is the head alone (length 1, odd, never reversed), so scanning starts with prev on the head and group size 2. For each group, first count how many nodes actually exist, because the final group's real length, not its nominal size, decides whether to reverse.",
        "Even groups are reversed with the standard three-pointer loop and spliced back using prev and the saved group tail; odd groups just advance prev. The count-then-act split is what makes the ragged last group correct.",
        "Time: O(n), each node visited a constant number of times. Space: O(1).",
      ],
    },
    {
      name: "Reverse Alternate K Nodes",
      difficulty: "Medium",
      variation: "Reverse k, skip k, repeat",
      question: [
        "Given the head of a singly linked list and an integer k, reverse the first k nodes, then skip the next k nodes, and repeat this pattern until the end of the list. If fewer than k nodes remain in a reversal block, reverse all of them. Return the new head.",
        "Example 1:\nInput: head = [1,2,3,4,5,6,7,8,9], k = 3\nOutput: [3,2,1,4,5,6,9,8,7]\nExplanation: Reverse [1,2,3], skip [4,5,6], reverse [7,8,9].",
        "Example 2:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [2,1,3,4,5]\nExplanation: Reverse [1,2], skip [3,4], then reverse the final short block [5] alone.",
        "Constraints:\n- 1 <= number of nodes <= 10^5\n- 1 <= k <= 10^5",
      ],
      code: `class Solution {
public:
    ListNode* reverseAlternateK(ListNode* head, int k) {
        if (head == nullptr) return nullptr;
        ListNode* cur = head;
        ListNode* prev = nullptr;
        int count = 0;
        while (cur != nullptr && count < k) {
            ListNode* next = cur->next;
            cur->next = prev;
            prev = cur;
            cur = next;
            ++count;
        }
        head->next = cur;
        count = 0;
        while (cur != nullptr && count < k - 1) {
            cur = cur->next;
            ++count;
        }
        if (cur != nullptr)
            cur->next = reverseAlternateK(cur->next, k);
        return prev;
    }
};`,
      explanation: [
        "Reverse the first k nodes with the standard loop; the original head becomes the block's tail, so it must be linked to cur, the first node of the skipped section.",
        "Then advance k - 1 more steps to the last skipped node and recurse from the node after it, wiring the recursion's returned head into place. Each node is handled exactly once across all calls.",
        "Time: O(n). Space: O(n / 2k) recursion depth, O(1) otherwise.",
      ],
    },
    {
      name: "Reverse Nodes in k-Group",
      difficulty: "Hard",
      variation: "Full k-group reversal with remainder preserved",
      link: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
      question: [
        "Given the head of a linked list, reverse the nodes of the list k at a time and return the modified list. Nodes that remain at the end in a group of fewer than k must stay in their original order. You may not alter the node values, only the links. Follow-up: use O(1) extra space.",
        "Example 1:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [2,1,4,3,5]",
        "Example 2:\nInput: head = [1,2,3,4,5], k = 3\nOutput: [3,2,1,4,5]",
        "Constraints:\n- The number of nodes is n, 1 <= k <= n <= 5000\n- 0 <= Node.val <= 1000",
      ],
      code: `class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode* node = head;
        for (int i = 0; i < k; ++i) {
            if (node == nullptr) return head;
            node = node->next;
        }
        ListNode* prev = reverseKGroup(node, k);
        ListNode* cur = head;
        for (int i = 0; i < k; ++i) {
            ListNode* next = cur->next;
            cur->next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
};`,
      explanation: [
        "First probe k nodes ahead; if fewer exist, return head unchanged, which is precisely the leave-the-remainder rule. Otherwise recursively process everything after this group so its finished head is available as the reversal's initial prev.",
        "Reversing the current k nodes onto that prev links the block's tail (the original head) directly to the rest, so no separate reconnection step is needed. An iterative version with a dummy node achieves O(1) space; the recursion costs O(n / k) stack frames.",
        "Time: O(n). Space: O(n / k) for recursion.",
      ],
    },
  ],
};
