import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Middle of the Linked List",
      difficulty: "Easy",
      variation: "Find middle",
      link: "https://leetcode.com/problems/middle-of-the-linked-list/",
      question: [
        "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
        "Example 1:\nInput: head = [1,2,3,4,5]\nOutput: [3,4,5]\nExplanation: The middle node of the list is node 3.",
        "Example 2:\nInput: head = [1,2,3,4,5,6]\nOutput: [4,5,6]\nExplanation: With two middle nodes (3 and 4), the second one is returned.",
        "Constraints:\n- The number of nodes is in the range [1, 100]\n- 1 <= Node.val <= 100",
      ],
      code: `ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
      explanation: [
        "Move a slow pointer one step and a fast pointer two steps per iteration. When fast reaches the end of the list, slow has covered exactly half the distance and therefore sits on the middle node.",
        "Because fast advances exactly twice as fast, slow lands on index n/2, which is the second middle node when n is even, matching the requirement.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Linked List Cycle",
      difficulty: "Easy",
      variation: "Cycle detection",
      link: "https://leetcode.com/problems/linked-list-cycle/",
      question: [
        "Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle if some node can be reached again by continuously following next pointers. Return true if there is a cycle, false otherwise.",
        "Example 1:\nInput: head = [3,2,0,-4], pos = 1 (tail connects to index 1)\nOutput: true",
        "Example 2:\nInput: head = [1], pos = -1 (no cycle)\nOutput: false",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      explanation: [
        "Advance slow by one and fast by two. If the list terminates, fast hits null and there is no cycle.",
        "If a cycle exists, both pointers eventually enter it, and since fast gains exactly one step on slow each iteration, the gap between them shrinks to zero, forcing a meeting inside the cycle.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Happy Number",
      difficulty: "Easy",
      variation: "Cycle detection on an implicit sequence",
      link: "https://leetcode.com/problems/happy-number/",
      question: [
        "A happy number is defined by repeatedly replacing a number with the sum of the squares of its digits. If the process reaches 1 it stays at 1 and the number is happy; otherwise it loops endlessly in a cycle that does not include 1. Return true if n is a happy number, false otherwise.",
        "Example 1:\nInput: n = 19\nOutput: true\nExplanation: 1^2 + 9^2 = 82, 8^2 + 2^2 = 68, 6^2 + 8^2 = 100, 1^2 + 0^2 + 0^2 = 1",
        "Constraints:\n- 1 <= n <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    bool isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }
private:
    int next(int n) {
        int s = 0;
        while (n > 0) {
            int d = n % 10;
            s += d * d;
            n /= 10;
        }
        return s;
    }
};`,
      explanation: [
        "The digit-square-sum function defines an implicit linked list where each number points to its successor. The sequence is bounded, so it must either reach 1 or enter a cycle.",
        "Run Floyd cycle detection on that implicit list: if fast reaches 1 the number is happy; if slow and fast meet elsewhere, the sequence is stuck in a non-1 cycle and the number is not happy. No hash set is needed.",
        "Time: O(log n) per step and a bounded number of steps. Space: O(1).",
      ],
    },
    {
      name: "Palindrome Linked List",
      difficulty: "Easy",
      variation: "Middle + reverse second half",
      link: "https://leetcode.com/problems/palindrome-linked-list/",
      question: [
        "Given the head of a singly linked list, return true if it is a palindrome, false otherwise.",
        "Example 1:\nInput: head = [1,2,2,1]\nOutput: true",
        "Example 2:\nInput: head = [1,2]\nOutput: false",
        "Constraints:\n- The number of nodes is in the range [1, 10^5]\n- 0 <= Node.val <= 9",
      ],
      code: `bool isPalindrome(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* prev = nullptr;
    while (slow) {
        ListNode* nxt = slow->next;
        slow->next = prev;
        prev = slow;
        slow = nxt;
    }
    for (ListNode* p = head; prev; p = p->next, prev = prev->next) {
        if (p->val != prev->val) return false;
    }
    return true;
}`,
      explanation: [
        "Use fast and slow pointers to find the middle, reverse the second half in place, then walk one pointer from each end toward the middle comparing values.",
        "For odd lengths the reversed half starts at the exact middle node, which compares against itself harmlessly, so the same code handles both parities.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Intersection of Two Linked Lists",
      difficulty: "Easy",
      variation: "Pointer switching to equalize lengths",
      link: "https://leetcode.com/problems/intersection-of-two-linked-lists/",
      question: [
        "Given the heads of two singly linked lists headA and headB, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return null. The lists retain their original structure and there are no cycles.",
        "Example 1:\nInput: listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], intersect at node with value 8\nOutput: Intersected at node with value 8",
        "Constraints:\n- 1 <= m, n <= 3 * 10^4\n- 1 <= Node.val <= 10^5",
      ],
      code: `ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    ListNode *a = headA, *b = headB;
    while (a != b) {
        a = a ? a->next : headB;
        b = b ? b->next : headA;
    }
    return a;
}`,
      explanation: [
        "Walk two pointers, and when one finishes its list, restart it at the head of the other list. Both pointers then traverse exactly lenA + lenB steps before meeting.",
        "After the switch, the pointers are aligned by distance from the end, so they meet at the first shared node, or both become null simultaneously when there is no intersection.",
        "Time: O(m + n). Space: O(1).",
      ],
    },
    {
      name: "Linked List Cycle II",
      difficulty: "Medium",
      variation: "Cycle entry point",
      link: "https://leetcode.com/problems/linked-list-cycle-ii/",
      question: [
        "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null. Do not modify the linked list.",
        "Example 1:\nInput: head = [3,2,0,-4], pos = 1 (tail connects to index 1)\nOutput: node at index 1\nExplanation: There is a cycle in the linked list, where tail connects to the second node.",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            ListNode* p = head;
            while (p != slow) {
                p = p->next;
                slow = slow->next;
            }
            return p;
        }
    }
    return nullptr;
}`,
      explanation: [
        "First detect the meeting point with fast and slow pointers. Let a be the distance from head to the cycle entry and b the distance from the entry to the meeting point inside a cycle of length c. Floyd analysis gives a = (c - b) plus a multiple of c.",
        "Therefore a pointer started at head and a pointer started at the meeting point, both moving one step at a time, cover the same effective distance and meet exactly at the cycle entry.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Remove Nth Node From End of List",
      difficulty: "Medium",
      variation: "Fixed gap between two pointers",
      link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
      question: [
        "Given the head of a linked list, remove the nth node from the end of the list and return its head. Do it in one pass.",
        "Example 1:\nInput: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]",
        "Example 2:\nInput: head = [1], n = 1\nOutput: []",
        "Constraints:\n- The number of nodes in the list is sz\n- 1 <= sz <= 30\n- 1 <= n <= sz",
      ],
      code: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode *fast = &dummy, *slow = &dummy;
    for (int i = 0; i <= n; i++) fast = fast->next;
    while (fast) {
        fast = fast->next;
        slow = slow->next;
    }
    ListNode* victim = slow->next;
    slow->next = victim->next;
    delete victim;
    return dummy.next;
}`,
      explanation: [
        "Advance the fast pointer n + 1 steps from a dummy node, then move both pointers together until fast falls off the end. The constant gap guarantees slow stops immediately before the node to delete.",
        "The dummy node uniformly handles the edge case of removing the head itself.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Find the Duplicate Number",
      difficulty: "Medium",
      variation: "Array as functional graph (Floyd)",
      link: "https://leetcode.com/problems/find-the-duplicate-number/",
      question: [
        "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive, there is exactly one repeated number (possibly repeated more than once). Return this repeated number without modifying the array and using only constant extra space.",
        "Example 1:\nInput: nums = [1,3,4,2,2]\nOutput: 2",
        "Example 2:\nInput: nums = [3,1,3,4,2]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- nums.length == n + 1\n- 1 <= nums[i] <= n",
      ],
      code: `int findDuplicate(vector<int>& nums) {
    int slow = nums[0], fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);
    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}`,
      explanation: [
        "Interpret the array as a function i -> nums[i]. Because values are in [1, n] and there are n + 1 slots, the walk starting at index 0 enters a rho-shaped path whose cycle entry is exactly the duplicated value, since the duplicate is the only value with two incoming edges.",
        "Run Floyd cycle detection on this implicit list: find the meeting point, then restart one pointer at the start and step both one at a time; they meet at the cycle entry, which is the duplicate.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Delete the Middle Node of a Linked List",
      difficulty: "Medium",
      variation: "Middle with an offset start",
      link: "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/",
      question: [
        "You are given the head of a linked list. Delete the middle node and return the head of the modified linked list. The middle node of a linked list of size n is the node at index floor(n / 2) using 0-based indexing.",
        "Example 1:\nInput: head = [1,3,4,7,1,2,6]\nOutput: [1,3,4,1,2,6]\nExplanation: Node with value 7 at index 3 is removed.",
        "Example 2:\nInput: head = [2,1]\nOutput: [2]\nExplanation: floor(2 / 2) = 1, so the node with value 1 is removed.",
        "Constraints:\n- The number of nodes is in the range [1, 10^5]\n- 1 <= Node.val <= 10^5",
      ],
      code: `ListNode* deleteMiddle(ListNode* head) {
    if (!head->next) return nullptr;
    ListNode *slow = head, *fast = head->next->next;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* victim = slow->next;
    slow->next = victim->next;
    delete victim;
    return head;
}`,
      explanation: [
        "To delete the middle you must stop one node before it. Giving fast a two-node head start shifts where slow lands, so slow finishes exactly on the predecessor of the middle node.",
        "The single-node list is handled up front, since deleting its middle leaves an empty list.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Swapping Nodes in a Linked List",
      difficulty: "Medium",
      variation: "Kth from start and kth from end via gap",
      link: "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
      question: [
        "You are given the head of a linked list and an integer k. Return the head of the linked list after swapping the values of the kth node from the beginning and the kth node from the end (the list is 1-indexed).",
        "Example 1:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [1,4,3,2,5]",
        "Constraints:\n- The number of nodes is n\n- 1 <= k <= n <= 10^5\n- 0 <= Node.val <= 100",
      ],
      code: `ListNode* swapNodes(ListNode* head, int k) {
    ListNode* first = head;
    for (int i = 1; i < k; i++) first = first->next;
    ListNode* second = head;
    ListNode* probe = first;
    while (probe->next) {
        probe = probe->next;
        second = second->next;
    }
    int tmp = first->val;
    first->val = second->val;
    second->val = tmp;
    return head;
}`,
      explanation: [
        "Walk a pointer k - 1 steps to reach the kth node from the start. Then start a second pointer at the head and a probe at the kth node; when the probe reaches the tail, the second pointer is exactly k nodes from the end because the gap between them stays constant.",
        "Swapping the values instead of relinking nodes keeps the code simple and is allowed by the problem.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Twin Sum of a Linked List",
      difficulty: "Medium",
      variation: "Middle + reverse + paired scan",
      link: "https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/",
      question: [
        "In a linked list of size n, where n is even, the ith node (0-indexed) is the twin of the (n - 1 - i)th node for 0 <= i < n / 2. The twin sum is the sum of a node and its twin. Given the head of a linked list with even length, return the maximum twin sum.",
        "Example 1:\nInput: head = [5,4,2,1]\nOutput: 6\nExplanation: Twins are (5,1) and (4,2); both twin sums equal 6.",
        "Constraints:\n- The number of nodes is an even integer in the range [2, 10^5]\n- 1 <= Node.val <= 10^5",
      ],
      code: `int pairSum(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* prev = nullptr;
    while (slow) {
        ListNode* nxt = slow->next;
        slow->next = prev;
        prev = slow;
        slow = nxt;
    }
    int best = 0;
    for (ListNode* p = head; prev; p = p->next, prev = prev->next) {
        best = max(best, p->val + prev->val);
    }
    return best;
}`,
      explanation: [
        "Find the middle with fast and slow pointers, reverse the second half, then scan both halves in lockstep. The kth node of the first half now pairs with its twin directly.",
        "The list has even length by constraint, so the two halves have equal size and every node is visited exactly once in the paired scan.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Reorder List",
      difficulty: "Medium",
      variation: "Middle + reverse + interleave",
      link: "https://leetcode.com/problems/reorder-list/",
      question: [
        "You are given the head of a singly linked list L0 -> L1 -> ... -> Ln-1 -> Ln. Reorder it in place to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ... You may not modify the values in the nodes, only the links.",
        "Example 1:\nInput: head = [1,2,3,4]\nOutput: [1,4,2,3]",
        "Example 2:\nInput: head = [1,2,3,4,5]\nOutput: [1,5,2,4,3]",
        "Constraints:\n- The number of nodes is in the range [1, 5 * 10^4]\n- 1 <= Node.val <= 1000",
      ],
      code: `void reorderList(ListNode* head) {
    if (!head || !head->next) return;
    ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = slow->next;
    slow->next = nullptr;
    ListNode* prev = nullptr;
    while (second) {
        ListNode* nxt = second->next;
        second->next = prev;
        prev = second;
        second = nxt;
    }
    ListNode* first = head;
    while (prev) {
        ListNode* n1 = first->next;
        ListNode* n2 = prev->next;
        first->next = prev;
        prev->next = n1;
        first = n1;
        prev = n2;
    }
}`,
      explanation: [
        "Three phases: locate the middle with fast and slow pointers, reverse the second half in place, then interleave the two halves one node at a time.",
        "Splitting so the first half is never shorter than the second guarantees the interleaving loop terminates cleanly with the middle node last for odd lengths.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Rotate List",
      difficulty: "Medium",
      variation: "Length + gap to new tail",
      link: "https://leetcode.com/problems/rotate-list/",
      question: [
        "Given the head of a linked list, rotate the list to the right by k places and return the new head.",
        "Example 1:\nInput: head = [1,2,3,4,5], k = 2\nOutput: [4,5,1,2,3]",
        "Example 2:\nInput: head = [0,1,2], k = 4\nOutput: [2,0,1]",
        "Constraints:\n- The number of nodes is in the range [0, 500]\n- -100 <= Node.val <= 100\n- 0 <= k <= 2 * 10^9",
      ],
      code: `ListNode* rotateRight(ListNode* head, int k) {
    if (!head || !head->next || k == 0) return head;
    int n = 1;
    ListNode* tail = head;
    while (tail->next) {
        tail = tail->next;
        n++;
    }
    k %= n;
    if (k == 0) return head;
    tail->next = head;
    ListNode* newTail = head;
    for (int i = 1; i < n - k; i++) newTail = newTail->next;
    ListNode* newHead = newTail->next;
    newTail->next = nullptr;
    return newHead;
}`,
      explanation: [
        "Measure the length while finding the tail, reduce k modulo n, then temporarily close the list into a ring. The new tail is n - k - 1 steps from the head; cutting the ring right after it yields the rotated list.",
        "Reducing k modulo n is essential because k can be far larger than the list length.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Length of the Cycle",
      difficulty: "Medium",
      variation: "Measure cycle length after meeting",
      question: [
        "You are given the head of a singly linked list that is guaranteed to contain a cycle. Return the number of nodes inside the cycle. If the list had no cycle the answer would be 0, but inputs in this drill always contain one.",
        "Example 1:\nInput: head = [1,2,3,4,5], tail connects to index 2\nOutput: 3\nExplanation: The cycle consists of nodes 3 -> 4 -> 5 -> back to 3.",
        "Constraints:\n- The number of nodes is in the range [1, 10^4]\n- Exactly one cycle exists",
      ],
      code: `int cycleLength(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            int len = 1;
            for (ListNode* p = slow->next; p != slow; p = p->next) len++;
            return len;
        }
    }
    return 0;
}`,
      explanation: [
        "Detect the cycle with fast and slow pointers. The meeting node is guaranteed to be inside the cycle, so walking from it until returning to itself counts every node of the cycle exactly once.",
        "This measurement is a common building block: knowing the cycle length lets you solve the cycle-entry problem with two pointers separated by exactly that gap.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Sort List",
      difficulty: "Medium",
      variation: "Middle split for merge sort",
      link: "https://leetcode.com/problems/sort-list/",
      question: [
        "Given the head of a linked list, return the list after sorting it in ascending order. Aim for O(n log n) time.",
        "Example 1:\nInput: head = [4,2,1,3]\nOutput: [1,2,3,4]",
        "Example 2:\nInput: head = [-1,5,3,4,0]\nOutput: [-1,0,3,4,5]",
        "Constraints:\n- The number of nodes is in the range [0, 5 * 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* mid = slow->next;
    slow->next = nullptr;
    ListNode* left = sortList(head);
    ListNode* right = sortList(mid);
    ListNode dummy(0);
    ListNode* t = &dummy;
    while (left && right) {
        if (left->val <= right->val) {
            t->next = left;
            left = left->next;
        } else {
            t->next = right;
            right = right->next;
        }
        t = t->next;
    }
    t->next = left ? left : right;
    return dummy.next;
}`,
      explanation: [
        "Merge sort on a linked list: split at the middle found with fast and slow pointers, recursively sort both halves, then merge them with a dummy head.",
        "Starting fast at head->next makes slow stop on the last node of the first half, so the split is balanced and recursion always terminates.",
        "Time: O(n log n). Space: O(log n) recursion stack.",
      ],
    },
    {
      name: "Circular Array Loop",
      difficulty: "Medium",
      variation: "Cycle detection with direction constraint",
      link: "https://leetcode.com/problems/circular-array-loop/",
      question: [
        "You are given a circular array nums of non-zero integers. From index i you move nums[i] steps forward if positive or backward if negative, wrapping around. A cycle is valid if it has length greater than 1 and every move in it goes in the same direction (all positive or all negative). Return true if a valid cycle exists.",
        "Example 1:\nInput: nums = [2,-1,1,2,2]\nOutput: true\nExplanation: The cycle 0 -> 2 -> 3 -> 0 moves only forward.",
        "Example 2:\nInput: nums = [-1,-2,-3,-4,-5,6]\nOutput: false\nExplanation: The only cycle has length 1, which is not allowed.",
        "Constraints:\n- 1 <= nums.length <= 5000\n- -1000 <= nums[i] <= 1000\n- nums[i] != 0",
      ],
      code: `bool circularArrayLoop(vector<int>& nums) {
    int n = nums.size();
    auto step = [&](int i) {
        return ((i + nums[i]) % n + n) % n;
    };
    for (int i = 0; i < n; i++) {
        if (nums[i] == 0) continue;
        int dir = nums[i];
        int slow = i, fast = i;
        while (nums[step(fast)] * dir > 0 && nums[step(step(fast))] * dir > 0) {
            slow = step(slow);
            fast = step(step(fast));
            if (slow == fast) {
                if (slow != step(slow)) return true;
                break;
            }
        }
        int j = i;
        while (nums[j] * dir > 0) {
            int nxt = step(j);
            nums[j] = 0;
            j = nxt;
        }
    }
    return false;
}`,
      explanation: [
        "Treat each index as a node of an implicit graph with edge i -> (i + nums[i]) mod n. From every unvisited start, run fast and slow pointers, but stop early if the walk changes sign, since a valid loop must be single-direction.",
        "When slow and fast meet, verify the loop length exceeds 1 by checking the node does not point to itself. After each failed start, zero out the visited same-direction path so no index is explored twice, keeping the total work linear.",
        "Time: O(n). Space: O(1).",
      ],
    },
  ],
};
