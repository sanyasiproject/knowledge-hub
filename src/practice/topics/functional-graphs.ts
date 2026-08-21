import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Linked List Cycle II",
      difficulty: "Medium",
      variation: "Floyd rho walk — cycle entry",
      link: "https://leetcode.com/problems/linked-list-cycle-ii/",
      question: [
        "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null. Do not modify the list, and solve it using O(1) extra memory.",
        "Example 1:\nInput: head = [3,2,0,-4], tail connects to index 1\nOutput: the node with value 2",
        "Constraints:\n- Number of nodes in [0, 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            ListNode *entry = head;
            while (entry != slow) {
                entry = entry->next;
                slow = slow->next;
            }
            return entry;
        }
    }
    return nullptr;
}`,
      explanation: [
        "A linked list is a functional graph: every node has exactly one successor, so the walk from any start is always a rho shape — a tail leading into a single cycle.",
        "Let the tail length be a and the meeting point sit b steps into the cycle of length c. When they meet, slow has walked a + b and fast has walked twice that, so the extra distance a + b is a multiple of c. Walking one pointer from the head and one from the meeting point therefore brings both to the cycle entry after exactly a steps.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Find the Duplicate Number",
      difficulty: "Medium",
      variation: "Array as a functional graph",
      link: "https://leetcode.com/problems/find-the-duplicate-number/",
      question: [
        "Given an array nums of n + 1 integers where each integer is in the range [1, n] inclusive, exactly one number is repeated. Return that repeated number without modifying the array and using only constant extra space.",
        "Example 1:\nInput: nums = [1,3,4,2,2]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^5\n- nums.length == n + 1\n- All integers appear once except one, which appears two or more times",
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
        "Treat i -> nums[i] as a successor function. Since every value lies in [1, n], index 0 is never a successor, so the walk starting at index 0 enters the cycle rather than starting inside it — which is exactly the precondition Floyd's algorithm needs.",
        "The duplicate value is the one two different indices point at, making it the cycle entry point. So finding the entry finds the duplicate.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Array Nesting",
      difficulty: "Medium",
      variation: "Permutation cycle lengths",
      link: "https://leetcode.com/problems/array-nesting/",
      question: [
        "You are given a permutation nums of the integers 0..n-1. For each index i, build the set following i, nums[i], nums[nums[i]], and so on until a value repeats. Return the length of the longest such set.",
        "Example 1:\nInput: nums = [5,4,0,3,1,6,2]\nOutput: 4\nExplanation: Starting at index 0 gives {5,6,2,0}, of size 4.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- nums is a permutation of 0..n-1",
      ],
      code: `int arrayNesting(vector<int>& nums) {
    int n = nums.size();
    vector<char> seen(n, 0);
    int best = 0;
    for (int i = 0; i < n; i++) {
        if (seen[i]) continue;
        int length = 0, cur = i;
        while (!seen[cur]) {
            seen[cur] = 1;
            cur = nums[cur];
            length++;
        }
        best = max(best, length);
    }
    return best;
}`,
      explanation: [
        "A permutation is a functional graph where every node also has exactly one predecessor, which forces the graph to be a disjoint union of pure cycles with no tails at all.",
        "So each set is simply a cycle, and cycles never overlap. That is why marking nodes globally is safe and gives linear total work instead of quadratic.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Cycle in a Graph",
      difficulty: "Hard",
      variation: "Cycle length with visit timestamps",
      link: "https://leetcode.com/problems/longest-cycle-in-a-graph/",
      question: [
        "You are given a directed graph of n nodes where each node has at most one outgoing edge, described by edges[i] being the node that i points to, or -1 if i has no outgoing edge. Return the length of the longest cycle, or -1 if no cycle exists.",
        "Example 1:\nInput: edges = [3,3,4,2,3]\nOutput: 3\nExplanation: The cycle 2 -> 4 -> 3 -> 2 has length 3.",
        "Constraints:\n- 2 <= n <= 10^5\n- edges[i] is -1 or a valid node index, and edges[i] != i",
      ],
      code: `int longestCycle(vector<int>& edges) {
    int n = edges.size();
    vector<int> visitTime(n, 0);   // 0 means never visited
    int timer = 1, best = -1;
    for (int start = 0; start < n; start++) {
        if (visitTime[start]) continue;
        int startTime = timer;
        int u = start;
        while (u != -1 && visitTime[u] == 0) {
            visitTime[u] = timer++;
            u = edges[u];
        }
        // A cycle closes only if we re-entered THIS walk.
        if (u != -1 && visitTime[u] >= startTime)
            best = max(best, timer - visitTime[u]);
    }
    return best;
}`,
      explanation: [
        "Each node having at most one outgoing edge makes this a functional graph, so every walk either runs off the end or closes into exactly one cycle. No branching means no recursion is needed.",
        "The timestamp trick distinguishes two cases: landing on a node stamped during the current walk means a fresh cycle whose length is the timestamp difference, while landing on a node from an earlier walk means we merged into already-explored territory and must stop.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Minimum Swaps to Sort a Permutation",
      difficulty: "Medium",
      variation: "Cycle decomposition counting",
      question: [
        "Given a permutation of 0..n-1, return the minimum number of swaps of any two elements needed to sort it into increasing order.",
        "Example 1:\nInput: nums = [1,2,0,4,3]\nOutput: 3\nExplanation: The cycle (0 1 2) needs 2 swaps and the cycle (3 4) needs 1, for 3 total.",
        "Constraints:\n- 1 <= n <= 10^5\n- nums is a permutation of 0..n-1",
      ],
      code: `int minSwapsToSort(vector<int>& nums) {
    int n = nums.size();
    vector<char> seen(n, 0);
    int swaps = 0;
    for (int i = 0; i < n; i++) {
        if (seen[i] || nums[i] == i) continue;
        int cycleLength = 0, cur = i;
        while (!seen[cur]) {
            seen[cur] = 1;
            cur = nums[cur];
            cycleLength++;
        }
        swaps += cycleLength - 1;
    }
    return swaps;
}`,
      explanation: [
        "Decompose the permutation into disjoint cycles. A cycle of length L needs exactly L - 1 swaps: each swap can place one element correctly and shorten the cycle by one, and no swap can fix two misplaced elements of the same cycle at once.",
        "So the answer is n minus the number of cycles, counting fixed points as cycles of length 1. This is why the total is independent of which swaps you choose.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "K-th Successor via Binary Lifting",
      difficulty: "Hard",
      variation: "Binary lifting on successors",
      question: [
        "You are given a functional graph on n nodes as an array next where next[i] is the unique successor of node i. Answer q queries of the form (start, k): report the node reached after taking exactly k successor steps from start. Preprocessing may be O(n log K) and each query must be O(log K).",
        "Example 1:\nInput: n = 4, next = [1,2,3,1], query = (0, 5)\nOutput: 2\nExplanation: The walk is 0 -> 1 -> 2 -> 3 -> 1 -> 2, so after 5 steps we are at node 2.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= k <= 10^9",
      ],
      code: `struct SuccessorJumps {
    int n, levels;
    vector<vector<int>> up;

    SuccessorJumps(vector<int>& next, long long maxK) : n(next.size()) {
        levels = 1;
        while ((1LL << levels) <= maxK) levels++;
        up.assign(levels, vector<int>(n));
        up[0] = next;
        for (int j = 1; j < levels; j++)
            for (int i = 0; i < n; i++)
                up[j][i] = up[j - 1][up[j - 1][i]];
    }

    int kthSuccessor(int start, long long k) {
        int cur = start;
        for (int j = 0; j < levels && k > 0; j++) {
            if (k & 1LL) cur = up[j][cur];
            k >>= 1;
        }
        return cur;
    }
};`,
      explanation: [
        "up[j][i] stores where node i lands after 2^j steps, built by composing the previous level with itself. Because each node has exactly one successor, this composition is well defined — the same table on a general graph would be meaningless.",
        "A query decomposes k into its binary representation and applies one jump per set bit, so at most 30 table lookups answer a k up to a billion.",
        "Time: O(n log K) preprocessing, O(log K) per query. Space: O(n log K).",
      ],
    },
    {
      name: "Count Nodes On Cycles",
      difficulty: "Medium",
      variation: "Cycle membership classification",
      question: [
        "Given a functional graph on n nodes as an array next where next[i] is the successor of node i, count how many nodes lie on some cycle. Nodes on the tails leading into cycles do not count.",
        "Example 1:\nInput: next = [1,2,0,2,4]\nOutput: 4\nExplanation: Nodes 0, 1, 2 form a 3-cycle and node 4 is a self-loop, giving 4. Node 3 is a tail node feeding into node 2.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= next[i] < n",
      ],
      code: `int countCycleNodes(vector<int>& next) {
    int n = next.size();
    // state: 0 = unvisited, 1 = in the current walk, 2 = finished
    vector<char> state(n, 0);
    vector<int> position(n, -1);
    int total = 0;
    for (int start = 0; start < n; start++) {
        if (state[start] != 0) continue;
        vector<int> path;
        int u = start;
        while (state[u] == 0) {
            state[u] = 1;
            position[u] = path.size();
            path.push_back(u);
            u = next[u];
        }
        if (state[u] == 1) {
            // Found a new cycle: everything from position[u] onward.
            total += path.size() - position[u];
        }
        for (int v : path) state[v] = 2;
    }
    return total;
}`,
      explanation: [
        "Walking forward from an unvisited node ends either on a node of the current walk (a new cycle) or on a finished node (a tail joining known structure). The three-state marking separates these cases cleanly.",
        "Recording each node's position along the current path lets the cycle be sliced off in constant time once it is detected. Every node is walked once and finalised once, so the total stays linear.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Tail Into a Cycle",
      difficulty: "Hard",
      variation: "Tail depth via reverse BFS",
      question: [
        "Given a functional graph on n nodes as an array next, for every node report the number of steps needed to first reach a node that lies on a cycle. Nodes already on a cycle have answer 0.",
        "Example 1:\nInput: next = [1,2,0,2,3]\nOutput: [0,0,0,1,2]\nExplanation: Nodes 0,1,2 form a cycle. Node 3 reaches the cycle in one step, and node 4 reaches it in two via node 3.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= next[i] < n",
      ],
      code: `vector<int> distanceToCycle(vector<int>& next) {
    int n = next.size();
    // Peel nodes with in-degree zero to isolate the cycles.
    vector<int> indeg(n, 0);
    for (int i = 0; i < n; i++) indeg[next[i]]++;
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    vector<char> onCycle(n, 1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        onCycle[u] = 0;
        if (--indeg[next[u]] == 0) q.push(next[u]);
    }
    // Reverse BFS outward from the cycle nodes.
    vector<vector<int>> rev(n);
    for (int i = 0; i < n; i++) rev[next[i]].push_back(i);
    vector<int> dist(n, -1);
    queue<int> bfs;
    for (int i = 0; i < n; i++)
        if (onCycle[i]) { dist[i] = 0; bfs.push(i); }
    while (!bfs.empty()) {
        int u = bfs.front(); bfs.pop();
        for (int v : rev[u])
            if (dist[v] == -1) { dist[v] = dist[u] + 1; bfs.push(v); }
    }
    return dist;
}`,
      explanation: [
        "Kahn-style peeling removes tail nodes layer by layer; whatever survives with non-zero in-degree is exactly the set of cycle nodes, since only cycles can sustain in-degree under repeated peeling.",
        "Reversing the edges and running a multi-source BFS from every cycle node then gives each tail node its distance in one pass, because in a functional graph the forward path is unique so the reverse BFS distance is the true tail depth.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Brent's Cycle Detection Algorithm",
      difficulty: "Hard",
      variation: "Brent's algorithm",
      question: [
        "Implement Brent's cycle-finding algorithm for a functional graph given as a successor function. Return both the length of the cycle and the index at which the cycle starts, using O(1) memory. Brent's method typically evaluates the successor function fewer times than Floyd's.",
        "Example 1:\nInput: next = [1,2,3,4,2], start = 0\nOutput: cycle length 3, cycle start index 2\nExplanation: The walk 0 -> 1 -> 2 -> 3 -> 4 -> 2 has a tail of length 2 and a cycle 2 -> 3 -> 4 of length 3.",
        "Constraints:\n- 1 <= n <= 10^6\n- The successor function is total",
      ],
      code: `pair<int,int> brentCycle(vector<int>& next, int start) {
    // Phase 1: find the cycle length using powers of two.
    int power = 1, lambda = 1;
    int tortoise = start;
    int hare = next[start];
    while (tortoise != hare) {
        if (power == lambda) {
            tortoise = hare;
            power *= 2;
            lambda = 0;
        }
        hare = next[hare];
        lambda++;
    }
    // Phase 2: find the cycle start by keeping the pointers lambda apart.
    tortoise = hare = start;
    for (int i = 0; i < lambda; i++) hare = next[hare];
    int mu = 0;
    while (tortoise != hare) {
        tortoise = next[tortoise];
        hare = next[hare];
        mu++;
    }
    return {lambda, mu};
}`,
      explanation: [
        "Brent teleports the slow pointer to the fast one whenever the fast pointer has travelled a power of two, then measures how far the fast pointer travels before catching up. That distance is the cycle length lambda directly, with no extra search.",
        "Once lambda is known, starting two pointers lambda apart from the origin and advancing both in lockstep makes them meet exactly at the cycle entry, giving the tail length mu.",
        "Both Brent and Floyd are O(mu + lambda) with O(1) space, but Brent evaluates the successor function fewer times in practice, which matters when each evaluation is expensive — as in Pollard's rho factorisation.",
        "Time: O(mu + lambda). Space: O(1).",
      ],
    },
    {
      name: "Count Fixed Points and Cycle Structure",
      difficulty: "Medium",
      variation: "Structural census",
      question: [
        "Given a permutation of 0..n-1, report the number of fixed points (nodes with next[i] == i), the total number of cycles, and the length of the longest cycle.",
        "Example 1:\nInput: nums = [0,2,1,4,5,3]\nOutput: fixed points 1, cycles 3, longest cycle 3\nExplanation: The cycles are (0), (1 2), and (3 4 5).",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- nums is a permutation of 0..n-1",
      ],
      code: `struct Census { int fixedPoints; int cycles; int longest; };

Census permutationCensus(vector<int>& nums) {
    int n = nums.size();
    vector<char> seen(n, 0);
    Census out{0, 0, 0};
    for (int i = 0; i < n; i++) {
        if (seen[i]) continue;
        int length = 0, cur = i;
        while (!seen[cur]) {
            seen[cur] = 1;
            cur = nums[cur];
            length++;
        }
        out.cycles++;
        out.longest = max(out.longest, length);
        if (length == 1) out.fixedPoints++;
    }
    return out;
}`,
      explanation: [
        "Because a permutation partitions into disjoint cycles, one linear sweep that never revisits a node collects every statistic at once.",
        "The cycle count is a genuinely useful quantity: the permutation's parity is n minus the number of cycles taken mod 2, and the minimum swaps to sort is n minus the cycle count.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Circular Array Loop",
      difficulty: "Medium",
      variation: "Direction-constrained rho walk",
      link: "https://leetcode.com/problems/circular-array-loop/",
      question: [
        "You are given a circular array nums of non-zero integers. At index i you move nums[i] steps forward if positive or backward if negative, wrapping around. Determine whether a cycle exists that has length greater than 1 and in which every move goes the same direction (all forward or all backward).",
        "Example 1:\nInput: nums = [2,-1,1,2,2]\nOutput: true\nExplanation: Indices 0 -> 2 -> 3 -> 0 all move forward and form a cycle of length 3.",
        "Constraints:\n- 1 <= nums.length <= 5000\n- -1000 <= nums[i] <= 1000 and nums[i] != 0",
      ],
      code: `bool circularArrayLoop(vector<int>& nums) {
    int n = nums.size();
    auto step = [&](int i) {
        int j = ((i + nums[i]) % n + n) % n;
        return j;
    };
    for (int i = 0; i < n; i++) {
        if (nums[i] == 0) continue;
        int slow = i, fast = i;
        // Require all moves to share the sign of nums[i].
        while (true) {
            slow = step(slow);
            if (nums[slow] * nums[i] <= 0) break;
            fast = step(fast);
            if (nums[fast] * nums[i] <= 0) break;
            fast = step(fast);
            if (nums[fast] * nums[i] <= 0) break;
            if (slow == fast) {
                if (slow == step(slow)) break;   // length-1 cycle, rejected
                return true;
            }
        }
        // Mark this failed walk so it is never retried.
        int j = i, sign = nums[i];
        while (nums[j] * sign > 0) {
            int nxt = step(j);
            nums[j] = 0;
            j = nxt;
        }
    }
    return false;
}`,
      explanation: [
        "The successor function makes this a functional graph, so Floyd's two-pointer method applies — but the extra rules mean a detected cycle must still be validated: it has to be longer than one and must not mix directions.",
        "Zeroing out a failed walk is what keeps the total work quadratic in the worst case rather than cubic; each index is abandoned at most once.",
        "Time: O(n) amortized across all starts. Space: O(1) extra, mutating the input.",
      ],
    },
    {
      name: "Planets Cycles (Steps Until Repetition)",
      difficulty: "Hard",
      variation: "Per-node walk length",
      question: [
        "There are n planets, each with exactly one teleporter leading to another planet, given as next[i]. For every starting planet, report the total number of teleportations before you arrive at a planet you have already visited on that walk. Answer for all n starts efficiently.",
        "Example 1:\nInput: n = 5, next = [1,2,0,2,3]\nOutput: [3,3,3,4,5]\nExplanation: From planet 0 the walk 0->1->2->0 repeats after 3 steps. From planet 3 the walk 3->2->0->1->2 repeats after 4 steps.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= next[i] < n",
      ],
      code: `vector<int> planetCycles(vector<int>& next) {
    int n = next.size();
    vector<int> answer(n, 0), state(n, 0), position(n, 0);
    // state: 0 unvisited, 1 on current path, 2 resolved
    for (int start = 0; start < n; start++) {
        if (state[start] != 0) continue;
        vector<int> path;
        int u = start;
        while (state[u] == 0) {
            state[u] = 1;
            position[u] = path.size();
            path.push_back(u);
            u = next[u];
        }
        int tailAnswer = 0;
        if (state[u] == 1) {
            // New cycle found inside this path.
            int cycleLength = path.size() - position[u];
            for (size_t idx = position[u]; idx < path.size(); idx++)
                answer[path[idx]] = cycleLength;
            // Nodes before the cycle walk in, then go around.
            for (int idx = (int)position[u] - 1; idx >= 0; idx--)
                answer[path[idx]] = answer[path[idx + 1]] + 1;
        } else {
            tailAnswer = answer[u];
            for (int idx = (int)path.size() - 1; idx >= 0; idx--) {
                tailAnswer++;
                answer[path[idx]] = tailAnswer;
            }
        }
        for (int v : path) state[v] = 2;
    }
    return answer;
}`,
      explanation: [
        "Every cycle node's answer is its cycle length, and every tail node's answer is one more than its successor's. Processing the path backwards propagates that in a single sweep.",
        "The two branches handle whether the walk closed on itself (a new cycle, so compute the length from positions) or ran into previously resolved territory (so reuse the stored answer). Marking nodes resolved afterwards guarantees each is processed once.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Detect the Rho Shape Parameters",
      difficulty: "Medium",
      variation: "Tail and cycle measurement",
      question: [
        "Given a functional graph as an array next and a starting node, return the pair (tailLength, cycleLength) describing the rho shape of the walk from that start. The tail length is the number of steps before entering the cycle.",
        "Example 1:\nInput: next = [1,2,3,4,2], start = 0\nOutput: (2, 3)\nExplanation: Steps 0 -> 1 form the tail of length 2, then 2 -> 3 -> 4 -> 2 is a cycle of length 3.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= next[i] < n",
      ],
      code: `pair<int,int> rhoShape(vector<int>& next, int start) {
    // Floyd phase 1: find a meeting point inside the cycle.
    int slow = next[start], fast = next[next[start]];
    while (slow != fast) {
        slow = next[slow];
        fast = next[next[fast]];
    }
    // Phase 2: tail length.
    int tail = 0;
    slow = start;
    while (slow != fast) {
        slow = next[slow];
        fast = next[fast];
        tail++;
    }
    // Phase 3: cycle length.
    int cycle = 1;
    int walker = next[fast];
    while (walker != fast) {
        walker = next[walker];
        cycle++;
    }
    return {tail, cycle};
}`,
      explanation: [
        "Every walk in a functional graph has this shape — a tail feeding a single cycle — because each node has one successor, so the first repeated node is where the walk closes.",
        "The three phases separate cleanly: meet inside the cycle, then walk one pointer from the start to locate the entry, then loop once around from the entry to measure the cycle. All in constant memory.",
        "Time: O(tail + cycle). Space: O(1).",
      ],
    },
  ],
};
