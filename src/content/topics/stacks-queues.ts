import type { TopicContent } from "../types";

export const stacksQueues: TopicContent = {
  quickSummary: [
    "A stack is a LIFO (Last In, First Out) data structure supporting push and pop in O(1); it models function call stacks, undo history, and expression evaluation.",
    "A queue is a FIFO (First In, First Out) data structure supporting enqueue and dequeue in O(1); it models BFS traversal, task scheduling, and message buffers.",
    "Monotonic stacks maintain elements in sorted order and solve next-greater-element, stock span, and histogram problems in O(n) by avoiding redundant comparisons.",
    "Priority queues (usually implemented as binary heaps) allow O(log n) insert and extract-min/max, powering Dijkstra's algorithm, event-driven simulation, and merge-k-sorted-lists.",
  ],
  detailed: [
    "A stack exposes two core operations: push (add to top) and pop (remove from top), both O(1). It can be implemented with an array (use an index to track the top) or a linked list (push/pop at the head). The array implementation is more cache-friendly and avoids per-node allocation overhead; the linked list implementation never wastes space on unused capacity. Stacks also support peek (view top without removing) in O(1). The call stack in every programming language runtime is literally a stack: each function call pushes a frame, and returning pops it.",
    "A queue exposes enqueue (add to rear) and dequeue (remove from front), both O(1). Array-based queues use a circular buffer to avoid shifting elements: maintain front and rear indices that wrap around using modular arithmetic. Linked-list queues use a head pointer for dequeue and a tail pointer for enqueue. A deque (double-ended queue) supports O(1) insertion and removal at both ends, implemented as a circular buffer or a doubly linked list. Python's collections.deque and Java's ArrayDeque are deque implementations.",
    "Monotonic stacks are a powerful technique for problems involving the next greater or smaller element. A monotonic increasing stack keeps elements in non-decreasing order from bottom to top; when a new element is larger, you pop all smaller elements (each of which has found its 'next greater element'). Each element is pushed and popped at most once, so the total time is O(n). Classic applications include the largest rectangle in a histogram, daily temperatures, stock span, and trapping rain water.",
    "A priority queue is an abstract data type where each element has a priority and dequeue always returns the highest-priority (or lowest, for a min-heap) element. The standard implementation is a binary heap stored in an array: the parent of index i is at (i-1)/2, and children are at 2i+1 and 2i+2. Insert (sift-up) and extract-min (sift-down) are both O(log n). Building a heap from n elements is O(n) using the bottom-up heapify method, not the naive O(n log n) of n insertions.",
    "Stacks and queues have deep connections to algorithms and system design. BFS uses a queue; DFS uses a stack (or recursion, which uses the call stack). Expression evaluation uses two stacks (operands and operators) in the shunting-yard algorithm. Undo/redo systems use two stacks. Rate limiters use queues (sliding window of timestamps). Task schedulers use priority queues. The browser's back/forward buttons use two stacks.",
  ],
  deepDive: [
    "The shunting-yard algorithm (Dijkstra, 1961) parses infix expressions into postfix (reverse Polish notation) using an operator stack. It processes tokens left to right: numbers go directly to output; operators are pushed onto the stack after popping all operators with higher or equal precedence; left parentheses are pushed; right parentheses pop until the matching left parenthesis. The resulting postfix expression can be evaluated with a single stack in O(n). This algorithm is the basis for expression parsing in compilers, calculators, and spreadsheet engines.",
    "Implementing a queue using two stacks is a classic interview problem with an elegant amortized analysis. Stack 'in' receives pushes; stack 'out' serves pops. When 'out' is empty, all elements from 'in' are transferred (reversed) to 'out'. Each element is moved at most twice (once into 'in', once into 'out'), so the amortized cost per operation is O(1). This technique is used in functional programming languages where immutable stacks are the primitive and mutable queues are not available.",
    "Min-stack (a stack that supports getMin in O(1)) can be implemented by storing (value, current_min) pairs, or by using an auxiliary stack that tracks minimums. The auxiliary stack only pushes when the new element is less than or equal to the current min, and pops when the main stack pops the current min. This reduces space usage from 2n to n+k where k is the number of distinct minimums. An even cleverer approach stores 2*value - min when pushing a new minimum, using no extra space but requiring careful arithmetic on pop.",
    "Circular buffers (ring buffers) are the standard array-based queue implementation in systems programming. They use fixed-size arrays with head and tail indices that wrap around via modulo. The buffer is empty when head == tail, and full when (tail+1) % size == head (sacrificing one slot) or by maintaining a separate count. They are used for I/O buffers, audio processing pipelines, and lock-free single-producer single-consumer queues. The Linux kernel's kfifo is a notable ring buffer implementation.",
  ],
  code: [
    {
      language: "python",
      caption: "Monotonic stack: next greater element for each position",
      source: `def next_greater_elements(nums: list[int]) -> list[int]:
    """For each element, find the next element to the right that is greater.
    Returns -1 if no greater element exists. O(n) time and space."""
    n = len(nums)
    result = [-1] * n
    stack = []  # stores indices; values at these indices are monotonically decreasing

    for i in range(n):
        # Pop all elements smaller than nums[i] — they found their answer
        while stack and nums[stack[-1]] < nums[i]:
            idx = stack.pop()
            result[idx] = nums[i]
        stack.append(i)

    return result

# Example
print(next_greater_elements([2, 1, 2, 4, 3]))
# Output: [4, 2, 4, -1, -1]


def largest_rectangle_histogram(heights: list[int]) -> int:
    """Largest rectangle in histogram using monotonic stack. O(n)."""
    stack = []  # indices of bars in increasing height order
    max_area = 0

    for i, h in enumerate(heights + [0]):  # append 0 to flush remaining bars
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)

    return max_area

print(largest_rectangle_histogram([2, 1, 5, 6, 2, 3]))  # 10`,
    },
    {
      language: "python",
      caption: "Queue from two stacks and Min-stack implementation",
      source: `class QueueFromStacks:
    """FIFO queue using two LIFO stacks. Amortized O(1) per operation."""
    def __init__(self):
        self.stack_in = []
        self.stack_out = []

    def enqueue(self, val):
        self.stack_in.append(val)

    def dequeue(self):
        if not self.stack_out:
            while self.stack_in:
                self.stack_out.append(self.stack_in.pop())
        if not self.stack_out:
            raise IndexError("dequeue from empty queue")
        return self.stack_out.pop()


class MinStack:
    """Stack with O(1) push, pop, top, and getMin."""
    def __init__(self):
        self.stack = []
        self.min_stack = []  # tracks current minimums

    def push(self, val: int):
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)

    def pop(self) -> int:
        val = self.stack.pop()
        if val == self.min_stack[-1]:
            self.min_stack.pop()
        return val

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return self.min_stack[-1]`,
    },
  ],
  diagrams: [
    {
      title: "Stack vs Queue Operation Flow",
      kind: "flow",
      caption:
        "Stack: push and pop both operate on the top (same end). Queue: enqueue adds to the rear, dequeue removes from the front (opposite ends). Deque: operations at both ends.",
    },
    {
      title: "Binary Heap Array Layout",
      kind: "architecture",
      caption:
        "A min-heap stored in an array. Parent of index i is at (i-1)/2; children are at 2i+1 and 2i+2. The root (index 0) is always the minimum. Insert sifts up; extract-min sifts down.",
    },
  ],
  animations: [
    {
      title: "Monotonic Stack: Finding Next Greater Elements",
      steps: [
        {
          label: "Process element 2 (index 0)",
          detail:
            "Stack is empty. Push index 0. Stack: [0] (values: [2]).",
        },
        {
          label: "Process element 1 (index 1)",
          detail:
            "1 < 2, so no pops. Push index 1. Stack: [0, 1] (values: [2, 1]).",
        },
        {
          label: "Process element 2 (index 2)",
          detail:
            "2 > 1, pop index 1 -> result[1] = 2. 2 == 2, stop popping. Push index 2. Stack: [0, 2].",
        },
        {
          label: "Process element 4 (index 3)",
          detail:
            "4 > 2, pop index 2 -> result[2] = 4. 4 > 2, pop index 0 -> result[0] = 4. Push index 3. Stack: [3].",
        },
        {
          label: "Process element 3 (index 4)",
          detail:
            "3 < 4, no pops. Push index 4. Stack: [3, 4]. No more elements.",
        },
        {
          label: "Finalize",
          detail:
            "Remaining indices [3, 4] in stack have no next greater element: result[3] = -1, result[4] = -1. Final: [4, 2, 4, -1, -1].",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Stack", "Queue", "Deque", "Priority Queue (Heap)"],
    rows: [
      [
        "Ordering principle",
        "LIFO",
        "FIFO",
        "Both ends",
        "By priority (min/max)",
      ],
      [
        "Insert",
        "O(1) push",
        "O(1) enqueue",
        "O(1) either end",
        "O(log n) insert",
      ],
      [
        "Remove",
        "O(1) pop",
        "O(1) dequeue",
        "O(1) either end",
        "O(log n) extract",
      ],
      [
        "Peek",
        "O(1) top",
        "O(1) front",
        "O(1) either end",
        "O(1) peek-min/max",
      ],
      [
        "Typical implementation",
        "Array or linked list",
        "Circular buffer or linked list",
        "Circular buffer or doubly linked list",
        "Binary heap in array",
      ],
      [
        "Classic algorithm use",
        "DFS, expression eval",
        "BFS, scheduling",
        "Sliding window max",
        "Dijkstra, merge k lists",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How do you implement a queue using two stacks?",
      a: "Use an 'in' stack for enqueue (push to in) and an 'out' stack for dequeue (pop from out). When 'out' is empty, transfer all elements from 'in' to 'out' by popping from 'in' and pushing to 'out' — this reverses the order, giving FIFO behavior. Each element is moved at most twice, so the amortized cost per operation is O(1). The worst-case single dequeue is O(n) when transfer is needed.",
      followUps: [
        "What about implementing a stack using two queues?",
        "What is the worst-case time for a single dequeue and when does it occur?",
        "How does this relate to functional programming where stacks are the primitive?",
      ],
    },
    {
      q: "Explain how to use a monotonic stack to find the largest rectangle in a histogram.",
      a: "Maintain a stack of bar indices in increasing height order. For each new bar, while the stack's top bar is taller, pop it — the popped bar's height is the rectangle's height, and the width extends from the current index back to the new stack top + 1. After processing all bars, flush remaining bars with an imaginary bar of height 0. Each bar is pushed and popped at most once, so the algorithm is O(n). This technique generalizes to maximal rectangle in a binary matrix by treating each row as a histogram.",
      followUps: [
        "How do you extend this to find the maximal rectangle in a 0/1 matrix?",
        "Can you solve trapping rain water with a similar approach?",
      ],
    },
    {
      q: "Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1).",
      a: "Use an auxiliary min-stack alongside the main stack. On push, also push to the min-stack if the new value is less than or equal to the current minimum. On pop, if the popped value equals the min-stack's top, pop the min-stack too. getMin returns the min-stack's top. Each operation is O(1). An alternative approach stores pairs (value, current_min) on a single stack, trading 2x space for simpler code.",
      followUps: [
        "How would you implement a max-stack that also supports popMax?",
        "Can you do it with O(1) extra space using an arithmetic trick?",
      ],
    },
    {
      q: "How does a circular buffer work and where is it used?",
      a: "A circular buffer uses a fixed-size array with head (read) and tail (write) indices that wrap around using modular arithmetic. Enqueue writes at tail and advances tail = (tail+1) % size. Dequeue reads at head and advances head = (head+1) % size. The buffer is full when (tail+1) % size == head (one slot is sacrificed, or a separate count is maintained). It is used in I/O buffering, audio pipelines, network packet buffers, and lock-free SPSC queues.",
      followUps: [
        "How do you distinguish between a full and empty buffer without a count variable?",
        "What makes circular buffers suitable for lock-free concurrent programming?",
      ],
    },
  ],
  followUps: [
    "How do monotonic deques solve the sliding window maximum problem in O(n)?",
    "What is the relationship between a stack and recursion, and when should you convert recursive code to iterative with an explicit stack?",
    "How are priority queues used in Dijkstra's algorithm and what is the impact on time complexity?",
    "What are lock-free stack and queue implementations, and how do they avoid mutex overhead in concurrent systems?",
  ],
  mcqs: [
    {
      q: "What is the amortized time complexity of dequeue in a queue implemented with two stacks?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      answerIndex: 0,
      explanation:
        "Each element is pushed to the 'in' stack once and transferred to the 'out' stack at most once. Over n operations, the total work is O(n), so the amortized cost per dequeue is O(1).",
    },
    {
      q: "In a min-heap stored in a zero-indexed array, what is the index of the parent of the element at index 7?",
      options: ["2", "3", "4", "6"],
      answerIndex: 1,
      explanation:
        "Parent index = floor((i-1)/2) = floor(6/2) = 3.",
    },
    {
      q: "What problem does a monotonic decreasing stack solve efficiently?",
      options: [
        "Finding the minimum element in O(1)",
        "Finding the next greater element for each position",
        "Sorting an array in O(n)",
        "Computing prefix sums",
      ],
      answerIndex: 1,
      explanation:
        "A monotonic decreasing stack pops elements when a greater element arrives. Each popped element's 'next greater element' is the element that caused the pop. Total time is O(n) since each element is pushed and popped at most once.",
    },
    {
      q: "Which data structure is most appropriate for implementing BFS on a graph?",
      options: ["Stack", "Queue", "Priority Queue", "Min-Stack"],
      answerIndex: 1,
      explanation:
        "BFS explores nodes level by level, processing them in the order they are discovered. A queue (FIFO) ensures this order. A stack would give DFS behavior.",
    },
    {
      q: "What is the time complexity of building a binary heap from an unsorted array of n elements using bottom-up heapify?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      answerIndex: 0,
      explanation:
        "Bottom-up heapify starts from the last non-leaf and sifts down. Nodes at height h do O(h) work, and there are O(n/2^h) nodes at height h. Summing over all heights gives O(n), not O(n log n).",
    },
  ],
  exercises: [
    "Implement a function to evaluate a postfix (reverse Polish notation) expression using a single stack. Handle +, -, *, / operators and integer operands.",
    "Solve the 'Valid Parentheses' problem: given a string containing '(', ')', '{', '}', '[', ']', determine if the input string is valid (every open bracket is closed by the same type in the correct order).",
    "Implement a sliding window maximum: given an array and window size k, return the maximum element in each window position. Use a monotonic deque for O(n) time.",
    "Design a max-frequency stack: push adds an element, pop removes and returns the most frequent element (breaking ties by recency). Hint: use a map from frequency to a stack of elements.",
  ],
  flashcards: [
    {
      front: "What is the difference between a stack and a queue?",
      back: "Stack is LIFO (Last In, First Out) — push and pop from the same end. Queue is FIFO (First In, First Out) — enqueue at rear, dequeue from front.",
    },
    {
      front: "How is a binary heap stored in an array?",
      back: "Root at index 0. For node at index i: parent = (i-1)/2, left child = 2i+1, right child = 2i+2. No pointers needed — the tree structure is implicit.",
    },
    {
      front: "What is a monotonic stack?",
      back: "A stack that maintains elements in non-decreasing (or non-increasing) order. When a new element violates the order, elements are popped until the invariant is restored. Used for next-greater-element problems.",
    },
    {
      front: "What is the time complexity of bottom-up heap construction?",
      back: "O(n). Start from the last non-leaf node, sift down each node. The sum of work across all levels telescopes to O(n), not O(n log n).",
    },
    {
      front: "How does a circular buffer handle wraparound?",
      back: "It uses modular arithmetic: after index size-1, the next index wraps to 0. Enqueue: tail = (tail+1) % size. Dequeue: head = (head+1) % size.",
    },
    {
      front: "What is the shunting-yard algorithm?",
      back: "Dijkstra's algorithm for converting infix expressions to postfix using an operator stack. Handles precedence and associativity rules. The resulting postfix can be evaluated with a single value stack.",
    },
    {
      front: "Name three real-world uses of stacks.",
      back: "1) Function call stack (recursion). 2) Undo/redo in editors (two stacks). 3) Browser back/forward navigation. Also: expression parsing, syntax checking (balanced brackets).",
    },
    {
      front: "Name three real-world uses of queues.",
      back: "1) BFS traversal. 2) Task/job scheduling (printer queue, thread pool). 3) Message queues (Kafka, RabbitMQ). Also: rate limiting, I/O buffering.",
    },
  ],
  revisionNotes: [
    "Stack = LIFO, Queue = FIFO, Deque = both ends, Priority Queue = by priority. All have O(1) or O(log n) core operations.",
    "Monotonic stack: each element pushed and popped at most once -> O(n) total. Solves next-greater/smaller-element, histogram, stock span.",
    "Two-stack queue: amortized O(1) per operation. Transfer elements when 'out' stack is empty.",
    "Binary heap: array-based, parent at (i-1)/2, children at 2i+1 and 2i+2. Insert = sift up O(log n), extract = sift down O(log n), build = O(n).",
    "Circular buffer: fixed array with head/tail indices wrapping via modulo. Used for I/O buffers and lock-free SPSC queues.",
    "DFS uses a stack (or recursion); BFS uses a queue. Converting recursive DFS to iterative requires an explicit stack.",
  ],
  cheatSheet: [
    "Stack push/pop: O(1). Peek top: O(1). Implement with array (top index) or linked list (push/pop at head).",
    "Queue enqueue/dequeue: O(1). Implement with circular buffer (head/tail mod size) or linked list (head/tail pointers).",
    "Monotonic stack pattern: for i in range(n): while stack and compare(stack[-1], nums[i]): pop and record result; push i.",
    "Heap parent: (i-1)//2. Left child: 2*i+1. Right child: 2*i+2. Python heapq is a min-heap; negate values for max-heap.",
    "Valid parentheses: push open brackets; on close, check stack top matches; at end, stack should be empty.",
    "Expression evaluation: use operand stack + operator stack. Respect precedence by popping higher-precedence operators before pushing.",
  ],
  resources: [
    {
      label: "Visualgo - Stack and Queue Visualizations",
      kind: "article",
      note: "Interactive animations showing push, pop, enqueue, dequeue, and heap operations step by step.",
    },
    {
      label: "Introduction to Algorithms (CLRS) - Chapter 6: Heapsort, Chapter 10: Stacks and Queues",
      kind: "book",
      note: "Formal treatment of heap properties, heapsort, and elementary stack/queue implementations.",
    },
    {
      label: "Monotonic Stack Problems on LeetCode",
      kind: "article",
      note: "Collection of problems (Daily Temperatures, Largest Rectangle, Trapping Rain Water) that use monotonic stacks.",
    },
    {
      label: "Dijkstra's Shunting-Yard Algorithm (Wikipedia)",
      kind: "article",
      note: "Detailed explanation of the operator-precedence parsing algorithm using a stack.",
    },
    {
      label: "Java ArrayDeque Source Code (OpenJDK)",
      kind: "repo",
      note: "Production implementation of a resizable circular buffer deque. Demonstrates power-of-two sizing for fast modulo.",
    },
  ],
  glossary: [
    {
      term: "LIFO",
      definition:
        "Last In, First Out — the ordering principle of a stack. The most recently added element is removed first.",
    },
    {
      term: "FIFO",
      definition:
        "First In, First Out — the ordering principle of a queue. The earliest added element is removed first.",
    },
    {
      term: "Monotonic stack",
      definition:
        "A stack that maintains its elements in non-decreasing or non-increasing order, enforced by popping violations on each push. Used for next-greater/smaller-element problems.",
    },
    {
      term: "Binary heap",
      definition:
        "A complete binary tree stored in an array satisfying the heap property: each parent is smaller (min-heap) or larger (max-heap) than its children. Supports O(log n) insert and extract.",
    },
    {
      term: "Deque",
      definition:
        "Double-ended queue — a data structure supporting O(1) insertion and removal at both the front and back.",
    },
    {
      term: "Circular buffer",
      definition:
        "A fixed-size array with head and tail indices that wrap around using modular arithmetic, used to implement queues without element shifting.",
    },
    {
      term: "Priority queue",
      definition:
        "An abstract data type where each element has a priority, and dequeue always returns the element with the highest (or lowest) priority. Typically implemented as a binary heap.",
    },
    {
      term: "Sift down (heapify down)",
      definition:
        "The operation of moving a node down the heap by swapping it with its smaller (min-heap) or larger (max-heap) child until the heap property is restored.",
    },
  ],
};
