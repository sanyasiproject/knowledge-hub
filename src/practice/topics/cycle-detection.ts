import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Linked List Cycle",
      difficulty: "Easy",
      variation: "Floyd tortoise and hare",
      link: "https://leetcode.com/problems/linked-list-cycle/",
      question: [
        "Given the head of a singly linked list, return true if the list contains a cycle. A cycle exists if some node in the list can be reached again by continuously following the next pointer. Solve it using O(1) extra memory.",
        "Example 1:\nInput: head = [3,2,0,-4], the tail connects to the node at index 1\nOutput: true\nExplanation: The tail's next pointer goes back to the node with value 2.",
        "Example 2:\nInput: head = [1], no cycle\nOutput: false",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `bool hasCycle(ListNode *head) {
    ListNode *slow = head;
    ListNode *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      explanation: [
        "Advance one pointer by a single node per step and the other by two. If the list ends, the fast pointer walks off and the loop exits with false.",
        "If a cycle exists, both pointers eventually end up inside it, and the gap between them shrinks by exactly one node each step, so it must reach zero - the pointers must meet. This is why a single meeting test is enough and no visited set is needed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Linked List Cycle II",
      difficulty: "Medium",
      variation: "Floyd cycle entry point",
      link: "https://leetcode.com/problems/linked-list-cycle-ii/",
      question: [
        "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null. Do not modify the list, and use only constant extra space.",
        "Example 1:\nInput: head = [3,2,0,-4], the tail connects to the node at index 1\nOutput: the node at index 1 (value 2)",
        "Example 2:\nInput: head = [1,2], the tail connects to the node at index 0\nOutput: the node at index 0 (value 1)",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head;
    ListNode *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
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
        "Phase one is plain tortoise and hare until the pointers meet inside the cycle. Phase two restarts one pointer at the head and moves both one step at a time; they meet at the cycle entry.",
        "Let the distance from head to the entry be a and the distance from the entry to the meeting point be b, with cycle length c. The fast pointer travelled twice the slow pointer's distance, giving a + b + kc = 2(a + b), so a = kc - b. Walking a steps from the head therefore lands exactly on the entry, which is also b steps plus whole laps from the meeting point.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Detect Cycle in an Undirected Graph",
      difficulty: "Medium",
      variation: "Undirected DFS parent check",
      link: "https://www.geeksforgeeks.org/detect-cycle-undirected-graph/",
      question: [
        "Given an undirected graph with V vertices numbered 0 to V-1 and an adjacency list adj, return true if the graph contains a cycle. The graph may be disconnected and has no self-loops or duplicate edges.",
        "Example 1:\nInput: V = 5, adj = [[1],[0,2,4],[1,3],[2,4],[1,3]]\nOutput: true\nExplanation: 1 - 2 - 3 - 4 - 1 is a cycle.",
        "Example 2:\nInput: V = 4, adj = [[1],[0,2],[1,3],[2]]\nOutput: false\nExplanation: The graph is a simple path, which is acyclic.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 10^5\n- The graph is undirected, with no self-loops and no repeated edges",
      ],
      code: `bool isCycle(int V, vector<vector<int>>& adj) {
    vector<int> visited(V, 0);
    function<bool(int, int)> dfs = [&](int u, int parent) -> bool {
        visited[u] = 1;
        for (int v : adj[u]) {
            if (!visited[v]) {
                if (dfs(v, u)) return true;
            } else if (v != parent) {
                return true;
            }
        }
        return false;
    };
    for (int i = 0; i < V; i++) {
        if (!visited[i] && dfs(i, -1)) return true;
    }
    return false;
}`,
      explanation: [
        "In an undirected graph every edge is stored twice, so the DFS always sees the edge back to its own parent. That single edge must be excused; any other edge to an already-visited vertex closes a cycle.",
        "This is the crucial difference from the directed case: here a global visited array is enough, because in an undirected DFS forest there are no cross edges - every non-tree edge joins a vertex to one of its ancestors. So 'visited and not my parent' already means 'ancestor', and no separate recursion-stack state is required.",
        "Time: O(V + E). Space: O(V) for the visited array plus recursion.",
      ],
    },
    {
      name: "Detect Cycle in a Directed Graph",
      difficulty: "Medium",
      variation: "Directed DFS colors / recursion stack",
      link: "https://www.geeksforgeeks.org/detect-cycle-in-a-graph/",
      question: [
        "Given a directed graph with V vertices numbered 0 to V-1 and an adjacency list adj where adj[u] lists the vertices reachable by a single edge out of u, return true if the graph contains a directed cycle. The graph may be disconnected.",
        "Example 1:\nInput: V = 4, adj = [[1],[2],[0],[2]]\nOutput: true\nExplanation: 0 -> 1 -> 2 -> 0 is a directed cycle.",
        "Example 2:\nInput: V = 4, adj = [[1,2],[3],[3],[]]\nOutput: false\nExplanation: The graph is a DAG (a diamond), so it has no directed cycle even though 3 is reached twice.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 10^5",
      ],
      code: `bool isCyclic(int V, vector<vector<int>>& adj) {
    vector<int> state(V, 0);
    function<bool(int)> dfs = [&](int u) -> bool {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && dfs(v)) return true;
        }
        state[u] = 2;
        return false;
    };
    for (int i = 0; i < V; i++) {
        if (state[i] == 0 && dfs(i)) return true;
    }
    return false;
}`,
      explanation: [
        "Three colors are tracked: 0 means untouched, 1 means currently on the recursion stack (grey), and 2 means fully explored (black). A cycle exists exactly when an edge points at a grey vertex, because a grey vertex is an ancestor of the current vertex in the DFS tree.",
        "This is where directed detection genuinely differs from undirected. In a directed graph, reaching an already-visited vertex is not evidence of a cycle - it may be a cross edge or a forward edge into a finished subtree, as in the diamond example. Only a back edge to a vertex still on the stack proves a cycle, so 'visited' must be split into grey and black. Using a plain visited flag here reports false cycles.",
        "Time: O(V + E). Space: O(V).",
      ],
    },
    {
      name: "Course Schedule",
      difficulty: "Medium",
      variation: "Kahn's in-degree topological sort",
      link: "https://leetcode.com/problems/course-schedule/",
      question: [
        "There are numCourses courses labeled 0 to numCourses-1. You are given prerequisites where prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses.",
        "Example 1:\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: Take course 0, then course 1.",
        "Example 2:\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: Each course requires the other, a directed cycle.",
        "Constraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000\n- All prerequisite pairs are distinct",
      ],
      code: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
        indeg[p[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int processed = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        processed++;
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return processed == numCourses;
}`,
      explanation: [
        "Finishing all courses is possible exactly when the prerequisite graph is a DAG. Kahn's algorithm repeatedly removes a vertex with in-degree zero, which is a course with no unmet prerequisites.",
        "Every vertex inside a directed cycle permanently keeps in-degree at least one, since some other cycle member always points at it, so it can never enter the queue. Therefore the count of dequeued vertices equals numCourses if and only if there is no cycle - the peeled-count test is the cycle test.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Check if a Given Graph Is a Tree",
      difficulty: "Medium",
      variation: "Union-Find, acyclic plus edge count",
      link: "https://www.geeksforgeeks.org/check-given-graph-tree/",
      question: [
        "Given n nodes labeled 0 to n-1 and a list of undirected edges, return true if the edges form a valid tree - the graph must be connected and contain no cycle.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]\nOutput: true",
        "Example 2:\nInput: n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]\nOutput: false\nExplanation: 1 - 2 - 3 - 1 is a cycle, and the graph has n edges rather than n-1.",
        "Constraints:\n- 1 <= n <= 2000\n- 0 <= edges.length <= 5000\n- There are no self-loops or repeated edges",
      ],
      code: `bool isTree(int n, vector<vector<int>>& edges) {
    if ((int)edges.size() != n - 1) return false;
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (auto& e : edges) {
        int a = find(e[0]);
        int b = find(e[1]);
        if (a == b) return false;
        parent[a] = b;
    }
    return true;
}`,
      explanation: [
        "A tree on n vertices has exactly n-1 edges, so reject any other edge count immediately. After that, only acyclicity has to be checked.",
        "Union-Find gives the cycle test directly: if the two endpoints of an edge already share a representative, they are already connected and this edge closes a cycle. An acyclic graph with n-1 edges is forced to be connected - a forest with c components has n - c edges, so n-1 edges means c = 1. That is why the two cheap checks together prove treeness.",
        "Time: O(n + E) with near-constant amortized Union-Find operations. Space: O(n).",
      ],
    },
    {
      name: "Redundant Connection",
      difficulty: "Medium",
      variation: "Union-Find cycle edge",
      link: "https://leetcode.com/problems/redundant-connection/",
      question: [
        "A tree on n nodes labeled 1 to n has had one extra edge added, producing a graph with n edges and exactly one cycle. Given the edge list in the order the edges were added, return the edge that can be removed so the result is a tree. If several answers exist, return the one that appears last in the input.",
        "Example 1:\nInput: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]",
        "Example 2:\nInput: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]\nOutput: [1,4]",
        "Constraints:\n- n == edges.length\n- 3 <= n <= 1000\n- 1 <= ai < bi <= n\n- There are no self-loops or repeated edges",
      ],
      code: `vector<int> findRedundantConnection(vector<vector<int>>& edges) {
    int n = edges.size();
    vector<int> parent(n + 1);
    for (int i = 0; i <= n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (auto& e : edges) {
        int a = find(e[0]);
        int b = find(e[1]);
        if (a == b) return e;
        parent[a] = b;
    }
    return {};
}`,
      explanation: [
        "Add the edges one at a time into a Union-Find structure. The first edge whose endpoints are already in the same component is the edge that closed the cycle.",
        "That edge is automatically the last-occurring valid answer: every earlier edge was a genuine merge of two separate components, so removing it would disconnect the graph and it cannot be the redundant one.",
        "Time: O(n) with path halving. Space: O(n).",
      ],
    },
    {
      name: "Find Eventual Safe States",
      difficulty: "Medium",
      variation: "Reverse graph Kahn / out-degree peeling",
      link: "https://leetcode.com/problems/find-eventual-safe-states/",
      question: [
        "There is a directed graph of n nodes described by a 0-indexed adjacency list graph, where graph[i] is the list of nodes reachable from node i by one edge. A node is terminal if it has no outgoing edges, and a node is safe if every possible path starting from it leads to a terminal node. Return the sorted list of all safe nodes.",
        "Example 1:\nInput: graph = [[1,2],[2,3],[5],[0],[5],[],[]]\nOutput: [2,4,5,6]\nExplanation: Nodes 5 and 6 are terminal; every path from 2 and 4 reaches 5. Nodes 0, 1 and 3 can reach the cycle 0 -> 1 -> 3 -> 0.",
        "Example 2:\nInput: graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]\nOutput: [4]",
        "Constraints:\n- n == graph.length\n- 1 <= n <= 10^4\n- 0 <= graph[i].length <= n\n- The graph may contain self-loops",
      ],
      code: `vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<vector<int>> rev(n);
    vector<int> outdeg(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : graph[u]) {
            rev[v].push_back(u);
            outdeg[u]++;
        }
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (outdeg[i] == 0) q.push(i);
    }
    vector<int> safe(n, 0);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        safe[u] = 1;
        for (int v : rev[u]) {
            if (--outdeg[v] == 0) q.push(v);
        }
    }
    vector<int> res;
    for (int i = 0; i < n; i++) {
        if (safe[i]) res.push_back(i);
    }
    return res;
}`,
      explanation: [
        "Reverse every edge and run Kahn's algorithm on out-degrees. Terminal nodes start with out-degree zero; a node becomes safe once all of its outgoing edges point at nodes already proven safe, which is exactly when its out-degree drops to zero.",
        "Nodes that lie on a cycle, or that can reach one, never have their out-degree fall to zero, because at least one outgoing edge always leads to a node still stuck in the same situation. So the peeling process proves safety and detects cycle-reachability at once, and the output is naturally in increasing order.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Find the Duplicate Number",
      difficulty: "Medium",
      variation: "Functional-graph cycle, Floyd",
      link: "https://leetcode.com/problems/find-the-duplicate-number/",
      question: [
        "Given an array nums of n + 1 integers where each integer is in the range [1, n] inclusive, there is exactly one repeated number. Return that repeated number without modifying the array and using only constant extra space.",
        "Example 1:\nInput: nums = [1,3,4,2,2]\nOutput: 2",
        "Example 2:\nInput: nums = [3,1,3,4,2]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- nums.length == n + 1\n- 1 <= nums[i] <= n\n- Exactly one number appears more than once, possibly many times",
      ],
      code: `int findDuplicate(vector<int>& nums) {
    int slow = nums[0];
    int fast = nums[0];
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
        "Read the array as a function graph: index i has a single outgoing edge to nums[i]. Since every value lies in [1, n], index 0 is never a target, so walking from index 0 enters the graph and can never return to it - the walk is a tail followed by a cycle.",
        "Two or more indices sharing the same value are precisely two edges pointing at the same node, so the entry point of the cycle is a node with in-degree at least two - the duplicated value. Applying the Linked List Cycle II two-phase Floyd algorithm returns that entry point.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Edges to Remove to Make a Graph Acyclic",
      difficulty: "Medium",
      variation: "Union-Find, spanning-forest counting",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges (possibly with several edges between the same pair), return the minimum number of edges you must delete so that the remaining graph contains no cycle.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[2,3]]\nOutput: 1\nExplanation: Deleting any one edge of the triangle 0 - 1 - 2 leaves a tree.",
        "Example 2:\nInput: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 0\nExplanation: The graph is already a forest.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- Edges are undirected; multi-edges are allowed",
      ],
      code: `int minEdgesToRemove(int n, vector<vector<int>>& edges) {
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    int removals = 0;
    for (auto& e : edges) {
        int a = find(e[0]);
        int b = find(e[1]);
        if (a == b) {
            removals++;
        } else {
            parent[a] = b;
        }
    }
    return removals;
}`,
      explanation: [
        "Greedily build a spanning forest: keep an edge when it merges two different components, discard it when both endpoints are already connected. The count of discarded edges is the answer.",
        "The kept edges form a maximum spanning forest, which has n - c edges for c components, so the answer is always E - n + c. It is optimal in both directions: a forest is acyclic so the remaining graph is valid, and no acyclic subgraph on these vertices can have more than n - c edges, so fewer deletions are impossible.",
        "Time: O(n + E). Space: O(n).",
      ],
    },
    {
      name: "Round Trip (CSES 1669)",
      difficulty: "Medium",
      variation: "Undirected cycle reconstruction via DFS",
      link: "https://cses.fi/problemset/task/1669",
      question: [
        "Byteland has n cities and m roads. Find a round trip that begins in a city, goes through two or more other cities and finally returns to the starting city. Every intermediate city must be distinct. Print the number of cities on the route (the start city counted twice) followed by the route itself, or IMPOSSIBLE if no round trip exists.",
        "Example 1:\nInput:\n5 6\n1 3\n1 2\n5 3\n1 5\n2 4\n4 5\nOutput:\n4\n3 5 1 3\nExplanation: Any valid cycle is accepted.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- Roads are undirected; each pair of cities has at most one road",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<vector<pair<int, int>>> adj;
vector<int> state, par;
int cycleStart = -1, cycleEnd = -1;

bool dfs(int u, int parentEdge) {
    state[u] = 1;
    for (auto pr : adj[u]) {
        int v = pr.first;
        int id = pr.second;
        if (id == parentEdge) continue;
        if (state[v] == 1) {
            cycleStart = v;
            cycleEnd = u;
            return true;
        }
        if (state[v] == 0) {
            par[v] = u;
            if (dfs(v, id)) return true;
        }
    }
    state[u] = 2;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    adj.assign(n + 1, {});
    state.assign(n + 1, 0);
    par.assign(n + 1, -1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(make_pair(b, i));
        adj[b].push_back(make_pair(a, i));
    }
    for (int s = 1; s <= n && cycleStart == -1; s++) {
        if (state[s] == 0) dfs(s, -1);
    }
    if (cycleStart == -1) {
        cout << "IMPOSSIBLE" << endl;
        return 0;
    }
    vector<int> cycle;
    cycle.push_back(cycleStart);
    for (int v = cycleEnd; v != cycleStart; v = par[v]) cycle.push_back(v);
    cycle.push_back(cycleStart);
    reverse(cycle.begin(), cycle.end());
    cout << (int)cycle.size() << endl;
    for (size_t i = 0; i < cycle.size(); i++) {
        if (i > 0) cout << " ";
        cout << cycle[i];
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "Run a DFS that remembers the tree edge it arrived on. When it finds an edge to a grey vertex (state 1), that vertex is an ancestor and the back edge closes a cycle; record the two endpoints and stop.",
        "Skipping by edge id rather than by parent vertex is what makes this safe: the only edge that must be ignored is the exact tree edge just used, so parallel edges between the same pair would still be reported as a cycle.",
        "The route is rebuilt by walking parent pointers from the deeper endpoint up to the ancestor, then closing the loop with the back edge. Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Round Trip II (CSES 1678)",
      difficulty: "Hard",
      variation: "Directed cycle reconstruction, grey/black DFS",
      link: "https://cses.fi/problemset/task/1678",
      question: [
        "There are n cities and m one-way flight connections. Find a route that starts in a city, uses one or more flights and returns to the same city. Print the number of cities on the route (the start city counted twice) followed by the cities in order, or IMPOSSIBLE if no such route exists.",
        "Example 1:\nInput:\n4 5\n1 3\n2 1\n2 4\n3 2\n3 4\nOutput:\n4\n2 1 3 2",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- Flights are directed; a city may have several flights to the same destination",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<vector<int>> adj;
vector<int> state, par;
int cycleStart = -1, cycleEnd = -1;

bool dfs(int u) {
    state[u] = 1;
    for (int v : adj[u]) {
        if (state[v] == 1) {
            cycleStart = v;
            cycleEnd = u;
            return true;
        }
        if (state[v] == 0) {
            par[v] = u;
            if (dfs(v)) return true;
        }
    }
    state[u] = 2;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    adj.assign(n + 1, {});
    state.assign(n + 1, 0);
    par.assign(n + 1, -1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
    }
    for (int s = 1; s <= n && cycleStart == -1; s++) {
        if (state[s] == 0) dfs(s);
    }
    if (cycleStart == -1) {
        cout << "IMPOSSIBLE" << endl;
        return 0;
    }
    vector<int> cycle;
    cycle.push_back(cycleStart);
    for (int v = cycleEnd; v != cycleStart; v = par[v]) cycle.push_back(v);
    cycle.push_back(cycleStart);
    reverse(cycle.begin(), cycle.end());
    cout << (int)cycle.size() << endl;
    for (size_t i = 0; i < cycle.size(); i++) {
        if (i > 0) cout << " ";
        cout << cycle[i];
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "The directed version needs the three-state DFS: an edge into a grey vertex is a back edge and gives a cycle, while an edge into a black vertex only re-enters a finished subtree and must be ignored.",
        "No parent edge is excused here, unlike the undirected Round Trip. A directed self-loop or a pair of opposite edges u -> v and v -> u is a genuine round trip, and the grey test reports both correctly.",
        "Once the back edge cycleEnd -> cycleStart is found, parent pointers from cycleEnd climb the DFS tree to cycleStart, giving the route. Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Longest Cycle in a Graph",
      difficulty: "Hard",
      variation: "Functional graph, visit timestamps",
      link: "https://leetcode.com/problems/longest-cycle-in-a-graph/",
      question: [
        "You are given a directed graph of n nodes numbered 0 to n-1, where each node has at most one outgoing edge. The graph is given as an array edges of size n, where edges[i] is the node that i points to, or -1 if node i has no outgoing edge. Return the length of the longest cycle, or -1 if there is no cycle.",
        "Example 1:\nInput: edges = [3,3,4,2,3]\nOutput: 3\nExplanation: The cycle is 2 -> 4 -> 3 -> 2, of length 3.",
        "Example 2:\nInput: edges = [2,-1,3,1]\nOutput: -1\nExplanation: Every walk ends at node 1, which has no outgoing edge.",
        "Constraints:\n- n == edges.length\n- 2 <= n <= 10^5\n- -1 <= edges[i] < n\n- edges[i] != i",
      ],
      code: `int longestCycle(vector<int>& edges) {
    int n = edges.size();
    vector<int> visitTime(n, -1);
    vector<int> owner(n, -1);
    int timer = 0;
    int best = -1;
    for (int i = 0; i < n; i++) {
        if (visitTime[i] != -1) continue;
        int u = i;
        while (u != -1 && visitTime[u] == -1) {
            visitTime[u] = timer++;
            owner[u] = i;
            u = edges[u];
        }
        if (u != -1 && owner[u] == i) {
            best = max(best, timer - visitTime[u]);
        }
    }
    return best;
}`,
      explanation: [
        "Each node has out-degree at most one, so following edges from any start is a single deterministic walk. Stamp every newly seen node with a global timestamp and tag it with the walk that discovered it.",
        "A walk stops either at -1 or at an already-stamped node. If that node was stamped by the current walk (owner equals the current start), the walk just closed a cycle, and the number of nodes on it is the difference between the current timer and that node's timestamp. If it belongs to an earlier walk, the cycle it leads to was already measured then, so nothing new is learned.",
        "Every node is stamped once across all walks. Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Shortest Cycle in a Graph",
      difficulty: "Hard",
      variation: "BFS from every vertex (girth)",
      link: "https://leetcode.com/problems/shortest-cycle-in-a-graph/",
      question: [
        "You are given an integer n denoting the number of nodes of a bidirected graph, labeled 0 to n-1, and a 2D array edges where edges[i] = [ui, vi] is an undirected edge. Return the length of the shortest cycle in the graph, or -1 if there is no cycle.",
        "Example 1:\nInput: n = 7, edges = [[0,1],[1,2],[2,0],[3,4],[4,5],[5,6],[6,3]]\nOutput: 3\nExplanation: The cycle 0 -> 1 -> 2 -> 0 has length 3, shorter than the 4-cycle on 3,4,5,6.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[0,2]]\nOutput: -1",
        "Constraints:\n- 3 <= n <= 1000\n- 1 <= edges.length <= 1000\n- There are no repeated edges and no self-loops",
      ],
      code: `int findShortestCycle(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    int best = INT_MAX;
    for (int s = 0; s < n; s++) {
        vector<int> dist(n, -1);
        vector<int> par(n, -1);
        dist[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    par[v] = u;
                    q.push(v);
                } else if (v != par[u]) {
                    best = min(best, dist[u] + dist[v] + 1);
                }
            }
        }
    }
    return best == INT_MAX ? -1 : best;
}`,
      explanation: [
        "For a fixed start s, BFS gives shortest distances from s. Any non-tree edge (u, v) seen during that BFS closes a closed walk of length dist[u] + dist[v] + 1 through s, so it is an upper bound on the girth.",
        "Repeating the BFS from every vertex guarantees exactness: take a genuine shortest cycle and start the BFS from any vertex s on it. The two halves of the cycle are then shortest paths from s, and the edge joining their far ends is detected as a non-tree edge, producing exactly the cycle's length. No BFS ever reports a value below the girth, because dist[u] + dist[v] + 1 always corresponds to a real closed walk containing a cycle.",
        "Time: O(n * (n + E)). Space: O(n + E).",
      ],
    },
    {
      name: "Redundant Connection II",
      difficulty: "Hard",
      variation: "Directed rooted tree, two-candidate Union-Find",
      link: "https://leetcode.com/problems/redundant-connection-ii/",
      question: [
        "A rooted tree is a directed graph where exactly one node is the root (no incoming edges) and every other node has exactly one parent. One extra directed edge was added to such a tree on n nodes labeled 1 to n, giving n edges. Given the edges in the order they were added, return an edge that can be removed so the remaining graph is a rooted tree of n nodes. If several answers exist, return the one that appears last in the input.",
        "Example 1:\nInput: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]\nExplanation: Node 3 has two parents; dropping [2,3] restores the tree rooted at 1.",
        "Example 2:\nInput: edges = [[1,2],[2,3],[3,4],[4,1],[1,5]]\nOutput: [4,1]\nExplanation: Every node has one parent, but there is a directed cycle, so a cycle edge must go.",
        "Constraints:\n- n == edges.length\n- 3 <= n <= 1000\n- 1 <= ui, vi <= n\n- ui != vi",
      ],
      code: `vector<int> findRedundantDirectedConnection(vector<vector<int>>& edges) {
    int n = edges.size();
    vector<int> incoming(n + 1, -1);
    int first = -1, second = -1;
    for (int i = 0; i < n; i++) {
        int v = edges[i][1];
        if (incoming[v] != -1) {
            first = incoming[v];
            second = i;
        } else {
            incoming[v] = i;
        }
    }
    vector<int> parent(n + 1);
    for (int i = 0; i <= n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (int i = 0; i < n; i++) {
        if (i == second) continue;
        int a = find(edges[i][0]);
        int b = find(edges[i][1]);
        if (a == b) {
            if (first == -1) return edges[i];
            return edges[first];
        }
        parent[a] = b;
    }
    return edges[second];
}`,
      explanation: [
        "Adding one edge to a rooted tree breaks it in one of two ways: some node ends up with two parents, or a directed cycle appears (or both at once). First scan for a node with two incoming edges and remember both edge indices, earlier as first and later as second.",
        "Then run undirected Union-Find over all edges except the candidate second. If no cycle appears, second was the culprit and is returned. If a cycle does appear, then either there was no double parent at all - in which case the edge closing the cycle is the answer - or the double parent exists and second is innocent, meaning first is the edge that both duplicates a parent and sits on the cycle.",
        "Skipping second rather than first is what makes the tie-breaking rule come out right: second is the later of the two duplicate edges, so preferring it whenever removing it works returns the last valid answer. Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Cycle Finding (CSES 1197)",
      difficulty: "Hard",
      variation: "Negative cycle via Bellman-Ford",
      link: "https://cses.fi/problemset/task/1197",
      question: [
        "You are given a directed graph with n nodes and m edges, where each edge has a weight that may be negative. Find any cycle whose total weight is negative. Print YES followed by the nodes of such a cycle in order (the first node repeated at the end), or NO if no negative cycle exists.",
        "Example 1:\nInput:\n4 5\n1 2 1\n2 4 1\n3 1 1\n4 1 -3\n4 3 -2\nOutput:\nYES\n1 2 4 1\nExplanation: The cycle 1 -> 2 -> 4 -> 1 has weight 1 + 1 - 3 = -1.",
        "Constraints:\n- 1 <= n <= 2500\n- 1 <= m <= 5000\n- Edge weights are between -10^9 and 10^9\n- The graph may be disconnected",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> from(m), to(m);
    vector<long long> weight(m);
    for (int i = 0; i < m; i++) {
        cin >> from[i] >> to[i] >> weight[i];
    }
    vector<long long> dist(n + 1, 0);
    vector<int> par(n + 1, -1);
    int touched = -1;
    for (int iter = 0; iter < n; iter++) {
        touched = -1;
        for (int i = 0; i < m; i++) {
            if (dist[from[i]] + weight[i] < dist[to[i]]) {
                dist[to[i]] = dist[from[i]] + weight[i];
                par[to[i]] = from[i];
                touched = to[i];
            }
        }
        if (touched == -1) break;
    }
    if (touched == -1) {
        cout << "NO" << endl;
        return 0;
    }
    int v = touched;
    for (int i = 0; i < n; i++) v = par[v];
    vector<int> cycle;
    int cur = v;
    do {
        cycle.push_back(cur);
        cur = par[cur];
    } while (cur != v);
    cycle.push_back(v);
    reverse(cycle.begin(), cycle.end());
    cout << "YES" << endl;
    for (size_t i = 0; i < cycle.size(); i++) {
        if (i > 0) cout << " ";
        cout << cycle[i];
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "Initialise every distance to 0 instead of using one source. That is equivalent to a virtual source with a zero-weight edge into every node, so a negative cycle anywhere in the graph is reachable, even in a disconnected graph.",
        "Relax all m edges n times. Without a negative cycle, shortest paths stabilise after at most n-1 rounds, so any relaxation in the n-th round proves one exists. The node touched in that final round is guaranteed to be reachable from a negative cycle through parent pointers, so walking back n parent steps lands inside the cycle; from there, following parents until the node repeats extracts the cycle itself.",
        "Time: O(n * m). Space: O(n + m).",
      ],
    },
  ],
};
