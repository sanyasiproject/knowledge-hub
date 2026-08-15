import type { TopicContent } from "../types";

export const topologicalSort: TopicContent = {
  quickSummary: [
    "A linear order of a directed graph's vertices such that every edge u -> v puts u before v. Exists **iff** the graph is a DAG.",
    "Two standard constructions: Kahn's BFS on in-degrees, and DFS with the reverse of the finish order. Both O(V + E) time, O(V) space.",
    "Kahn's doubles as a cycle detector (fewer than V vertices emitted) and upgrades to the lexicographically smallest order by swapping the queue for a min-heap.",
  ],
  detailed: [
    `A topological order answers "in what sequence can I do these tasks so that every prerequisite comes first?" — build systems, course schedules, package installs, dependency-aware task runners. The order is generally not unique: any two vertices with no path between them may appear in either relative position.

Key insight: a topological order exists if and only if the graph is acyclic. A cycle would require each of its vertices to come before the others, which no linear order can satisfy — so cycle detection and topological sorting are the same problem.`,
    `## Kahn's algorithm (in-degree BFS)

1. Compute \`indeg[v]\` for every vertex — one pass over all edges.
2. Push every vertex with \`indeg == 0\` into a queue.
3. Pop u, append it to the output, and decrement \`indeg\` of each neighbour; push any that hit 0.
4. If the output has fewer than V vertices, the leftover vertices lie on (or downstream of) a cycle.

Each vertex is pushed and popped once and each edge is relaxed once, so it is O(V + E) time and O(V) space.`,
    `## DFS post-order reversal

Run DFS over every vertex. When a vertex *finishes* (all descendants done), push it onto a list. Reverse that list at the end.

The correctness argument is one line: for any edge u -> v, v always finishes before u — either DFS descends into v from u, or v was already finished when u looked at it. It cannot be grey, because a grey neighbour is a back edge and the graph is acyclic. So u lands later in the finish list and therefore earlier after reversal.

Common mistake: appending vertices on *entry* rather than on exit. That produces a plausible-looking order that is wrong whenever a vertex is reachable by two different-length paths.`,
    `## Lexicographically smallest order

Replace Kahn's plain queue with a \`priority_queue\` (min-heap): always emit the smallest available zero-in-degree vertex. That costs O(V log V + E) and is the standard follow-up question. The DFS version cannot be patched to do this — greedy choice at each step is what makes it work, so use Kahn's.

In practice: prefer Kahn's in interviews. It handles cycles without a separate colour array, has no recursion depth risk, and extends to the lexicographic and "count all orderings" variants.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Kahn's algorithm — topological order or cycle report (0-indexed)",
      source: `#include <bits/stdc++.h>
using namespace std;

// Returns a topological order, or an empty vector if the graph has a cycle.
// O(V + E) time, O(V) space.
vector<int> kahn(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) ++indeg[v];

    queue<int> q;
    for (int v = 0; v < n; ++v)
        if (indeg[v] == 0) q.push(v);

    vector<int> order;
    order.reserve(n);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);
    }

    if ((int)order.size() != n) return {};   // cycle: some vertex never hit 0
    return order;
}

// Lexicographically smallest topological order. O(V log V + E).
vector<int> kahnLexSmallest(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) ++indeg[v];

    priority_queue<int, vector<int>, greater<int>> pq;
    for (int v = 0; v < n; ++v)
        if (indeg[v] == 0) pq.push(v);

    vector<int> order;
    while (!pq.empty()) {
        int u = pq.top(); pq.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) pq.push(v);
    }
    return (int)order.size() == n ? order : vector<int>{};
}`,
    },
    {
      language: "cpp",
      caption: "DFS variant — reverse finish order, with cycle guard",
      source: `#include <bits/stdc++.h>
using namespace std;

// color: 0 = unvisited, 1 = on stack, 2 = finished.
// Sets hasCycle if a back edge is found. O(V + E) time, O(V) space.
bool dfsTopo(int u, const vector<vector<int>>& adj,
             vector<int>& color, vector<int>& finish) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return false;            // back edge -> cycle
        if (color[v] == 0 && !dfsTopo(v, adj, color, finish)) return false;
    }
    color[u] = 2;
    finish.push_back(u);   // push ON EXIT, not on entry
    return true;
}

vector<int> topoSortDFS(int n, const vector<vector<int>>& adj) {
    vector<int> color(n, 0), finish;
    finish.reserve(n);
    for (int v = 0; v < n; ++v)
        if (color[v] == 0 && !dfsTopo(v, adj, color, finish))
            return {};                              // cycle
    reverse(finish.begin(), finish.end());
    return finish;
}`,
    },
  ],
  diagrams: [
    {
      title: "Kahn's algorithm peeling a DAG",
      kind: "flow",
      caption:
        "In-degrees shown per vertex. A and B start at 0; removing them frees C, then D, then E — giving A B C D E.",
      mermaid: `flowchart LR
    A["A  indeg 0"] --> C["C  indeg 2"]
    B["B  indeg 0"] --> C
    B --> D["D  indeg 2"]
    C --> D
    D --> E["E  indeg 1"]`,
    },
  ],
  cheatSheet: [
    "Exists iff DAG. Kahn's and DFS both O(V + E) time, O(V) space.",
    "Kahn's: order.size() < V means a cycle — no extra bookkeeping needed.",
    "DFS: push on EXIT, then reverse. Pushing on entry is the classic wrong answer.",
    "Lexicographically smallest: swap Kahn's queue for a min-heap, O(V log V + E).",
    "Unique topological order iff at every Kahn step exactly one vertex has in-degree 0 (equivalently, a Hamiltonian path exists in the DAG).",
  ],
  interviewQA: [
    {
      q: "Give both topological sort algorithms and say when you would pick each.",
      a: "Kahn's is BFS on in-degrees: count in-degrees in one edge pass, seed a queue with the zero-in-degree vertices, and each time you pop a vertex append it to the output and decrement its neighbours' in-degrees, pushing any that reach zero. The DFS version runs DFS from every unvisited vertex, appends each vertex when its recursion finishes, and reverses the resulting list. Both are O(V + E) time and O(V) space. I default to Kahn's: cycle detection is free (if the output has fewer than V vertices, the rest lie on or after a cycle), there is no recursion-depth hazard, and it extends directly to the lexicographically smallest ordering by replacing the queue with a min-heap. I would reach for the DFS version when I am already running a DFS for something else, for example inside Kosaraju's first pass.",
      followUps: [
        "How would you count the number of distinct topological orderings?",
        "How do you detect that the topological order is unique?",
      ],
    },
    {
      q: "Why does the reverse DFS finish order actually produce a valid topological sort?",
      a: "Take any edge u -> v and consider the moment DFS at u examines it. If v is unvisited, DFS descends and v finishes before u returns. If v is already finished, v finished earlier by definition. The third case, v currently on the recursion stack, would mean a back edge and hence a cycle, which is excluded because the graph is a DAG. So in every allowed case tout[v] < tout[u], meaning u appears later in the finish list and therefore earlier once the list is reversed. That holds for every edge simultaneously, which is exactly the topological property. Note this argument also shows why the DFS version silently produces garbage on a cyclic graph unless you add the grey-vertex check.",
    },
  ],
  flashcards: [
    {
      front: "When does a topological order exist?",
      back: "Exactly when the directed graph is acyclic. A cycle makes a consistent linear order impossible.",
    },
    {
      front: "How does Kahn's algorithm report a cycle?",
      back: "The emitted order contains fewer than V vertices — the remaining ones never reached in-degree 0.",
    },
    {
      front: "Lexicographically smallest topological order?",
      back: "Kahn's with a min-heap instead of a queue: O(V log V + E). The DFS variant cannot do this.",
    },
  ],
};
