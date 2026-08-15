import type { TopicContent } from "../types";

export const minCut: TopicContent = {
  quickSummary: [
    "An **s-t cut** splits the vertices into `S` (containing the source) and `T` (containing the sink); its capacity counts only the edges going `S -> T`.",
    "**Max-flow min-cut theorem**: the maximum s-t flow equals the minimum s-t cut capacity. Compute one and you have proved the other.",
    "After max-flow, the cut is free: BFS from `s` over edges with residual capacity > 0. Reached nodes form `S`. Cost is **O(V + E)** on top of the flow.",
  ],
  detailed: [
    "The duality has an easy direction and a hard one. Every flow is at most every cut, because all flow must cross any S-T boundary, and the boundary edges cap it — so max-flow ≤ min-cut. The hard direction is constructive: when no augmenting path remains, let `S` be the residual-reachable set from `s`. Every edge `S -> T` must be saturated (otherwise it would extend reachability) and every edge `T -> S` must carry zero flow, so the net flow across the cut equals the cut capacity. That exhibits a cut equal to the flow, forcing equality.",
    "Reading the cut off the residual graph is a BFS, not a search over subsets. Run max-flow, then flood from `s` using only edges with `cap > 0` in the residual structure. The cut edges are the original edges whose tail is marked and whose head is not.\n\nCommon mistake: listing edges by 'flow == capacity'. Saturated edges exist that are not on the minimum cut. The cut is defined by the reachability partition, not by saturation alone.",
    "Project selection (maximum closure) is the flagship application. Projects have profits, prerequisites have costs, and choosing a project forces choosing its prerequisites. Build: source -> each profit node with capacity = profit, each cost node -> sink with capacity = cost, and prerequisite edges with infinite capacity so a cut can never sever them. The answer is `sum of positive profits - min cut`; the `S` side of the cut is the set to select.\n\nKey insight: infinite-capacity edges encode 'this implication may not be broken', which is how logical constraints enter a flow model.",
    "The same partition trick covers image segmentation (foreground/background labelling with smoothness penalties) and 'minimum edges to disconnect' questions, where every edge gets capacity 1 and the min cut is the number of edge-disjoint s-t paths (Menger's theorem).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Recover the minimum cut from the residual graph after max-flow",
      source: `// Assumes a Dinic-style structure: e[] edges with .to/.cap, g[u] edge ids,
// and that maxflow(s, t) has already been run so e[].cap holds residuals.
vector<char> sourceSide(const Dinic& d, int s) {
    vector<char> vis(d.n, 0);
    queue<int> q;
    vis[s] = 1; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int id : d.g[u]) {
            int v = d.e[id].to;
            if (d.e[id].cap > 0 && !vis[v]) {   // residual capacity left
                vis[v] = 1;
                q.push(v);
            }
        }
    }
    return vis;                                  // vis[v] = 1  <=>  v is in S
}

// The cut edges are the ORIGINAL edges crossing the partition.
// Original edges sit at even indices (each addEdge pushed forward then reverse).
vector<pair<int, int>> cutEdges(const Dinic& d, int s) {
    vector<char> vis = sourceSide(d, s);
    vector<pair<int, int>> res;
    for (int id = 0; id < (int)d.e.size(); id += 2) {
        int v = d.e[id].to, u = d.e[id ^ 1].to;   // reverse edge points back at u
        if (vis[u] && !vis[v]) res.push_back({u, v});
    }
    return res;
}`,
    },
    {
      language: "cpp",
      caption: "Maximum closure / project selection built as a min-cut network",
      source: `// profit[i] > 0 : project earns money.  profit[i] < 0 : task costs money.
// dep[i] = list of nodes that i requires.
// Answer = (sum of positive profits) - maxflow(S, T).
ll projectSelection(const vector<ll>& profit, const vector<vector<int>>& dep) {
    int n = (int)profit.size();
    int S = n, T = n + 1;
    Dinic d(n + 2);
    const ll INF = LLONG_MAX / 4;
    ll total = 0;

    for (int i = 0; i < n; ++i) {
        if (profit[i] > 0) { total += profit[i]; d.addEdge(S, i, profit[i]); }
        else if (profit[i] < 0) { d.addEdge(i, T, -profit[i]); }
        for (int j : dep[i]) d.addEdge(i, j, INF);   // unbreakable implication
    }
    return total - d.maxflow(S, T);
}`,
    },
  ],
  comparison: {
    columns: ["Question", "Model", "Answer read from"],
    rows: [
      ["Fewest edges to disconnect s from t", "Every edge capacity 1", "Min cut = max flow value"],
      ["Fewest vertices to disconnect s from t", "Split vertices, capacity 1 on split edge", "Min cut on the split graph"],
      ["Best subset with prerequisites", "Maximum closure network", "Positive profit sum − min cut; S side = chosen set"],
      ["Global min cut (no fixed s, t)", "Stoer-Wagner, O(V³)", "Not a flow problem"],
    ],
  },
  cheatSheet: [
    "max-flow = min-cut. Computing the flow proves the cut is optimal.",
    "Cut recovery: BFS from s on residual edges with cap > 0, O(V + E) time and O(V) extra space.",
    "S = residual-reachable from s; cut edges go S -> T and are all saturated.",
    "Use INF capacity for constraints that must never be cut (prerequisites, implications).",
    "Min *vertex* cut needs node splitting; min *global* cut needs Stoer-Wagner, not flow.",
  ],
  interviewQA: [
    {
      q: "Prove that max flow equals min cut.",
      a: "One direction is a counting argument: for any cut (S, T), all flow leaving s eventually crosses from S to T, and net crossing flow is bounded by the total capacity of S -> T edges, so every flow is at most every cut. For the other direction, take a maximum flow — one with no augmenting path — and define S as the vertices reachable from s in the residual graph. The sink is not in S, so (S, T) is a valid cut. Any edge from S to T has zero residual capacity, hence carries flow equal to its capacity; any edge from T to S has zero flow, else its reverse residual edge would extend S. So the net flow across the cut equals the cut's capacity exactly. A flow that equals some cut, combined with flow ≤ cut always, makes both optimal.",
      followUps: ["Where does the proof break if capacities can be negative?", "How does this generalise to multi-commodity flow?"],
    },
    {
      q: "You must choose profitable projects, but each requires prerequisite equipment that costs money. How do you solve it optimally?",
      a: "Model it as maximum closure and solve with min cut. Create a node per project and per piece of equipment. Connect source to each profit node with capacity equal to its profit, each cost node to sink with capacity equal to its cost, and add an infinite-capacity edge from a project to every prerequisite it needs. Run max flow; the answer is the sum of all positive profits minus the max-flow value. The infinite edges guarantee no minimum cut ever separates a project from a prerequisite, so the source side of the cut is a valid closed set, and cutting a source edge means declining a profit while cutting a sink edge means paying a cost. Complexity is the flow cost, O(V²·E) with Dinic, plus O(V + E) to read the chosen set off the cut.",
    },
  ],
  flashcards: [
    { front: "How do you find the minimum cut after computing max flow?", back: "BFS from s over residual edges with capacity > 0; reachable set is S, and the S -> T original edges are the cut. O(V + E)." },
    { front: "Is every saturated edge part of the minimum cut?", back: "No. The cut is defined by residual reachability from s; saturated edges outside that boundary are not cut edges." },
    { front: "Maximum closure answer formula?", back: "Sum of positive profits − min cut, with INF-capacity edges for prerequisites." },
  ],
};
