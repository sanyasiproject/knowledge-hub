import type { TopicContent } from "../types";

export const minCostMaxFlow: TopicContent = {
  quickSummary: [
    "Every edge has a **capacity** and a **per-unit cost**. Push the maximum flow, and among all maximum flows pick the cheapest one.",
    "Successive shortest paths: repeatedly augment along the **cheapest** s-t path in the residual graph. With SPFA/Bellman-Ford it is **O(F·V·E)**; with **Johnson potentials + Dijkstra** it is **O(F·E·log V)**, where `F` is the number of augmentations. Space **O(V + E)**.",
    "Reach for it when the answer is *'as much as possible, as cheaply as possible'* — transportation, weighted assignment, scheduling with penalties.",
  ],
  detailed: [
    "The reverse edge carries the negated cost. Pushing a unit along `u -> v` costs `+c`; cancelling it later must refund `+c`, so the residual edge `v -> u` has cost `-c`. This is exactly what makes shortest-path search correct — but it also means the residual graph has negative edges even when the input does not, which rules out plain Dijkstra.\n\nKey insight: negative residual costs are unavoidable, so you either use a label-correcting algorithm (SPFA) or reweight with potentials.",
    "Johnson potentials remove the negative weights. Keep `pot[v]` = shortest cost from `s` to `v` from the previous iteration, and search on the reduced cost `w'(u,v) = cost(u,v) + pot[u] - pot[v]`, which is provably non-negative on residual edges. Dijkstra then works, and after each run you update `pot[v] += dist[v]`. The initial potentials come from one Bellman-Ford pass, or are all zero when the original costs are non-negative.",
    "Correctness rests on one invariant: if the current flow is the cheapest flow of its value, augmenting along a shortest path keeps that property. This is why you must augment along a *minimum-cost* path, not any path, and why negative *cycles* must not exist in the residual graph. Sending the full bottleneck each time is fine; the number of augmentations `F` is what drives the runtime, so it is bounded by total flow with unit capacities and by O(V·E) in general.\n\nCommon mistake: stopping at max flow found by Dinic and then trying to cheapen it. The cost must be optimised during augmentation, not afterwards.",
    "The assignment problem — `n` workers, `n` tasks, cost matrix — becomes source -> workers (cap 1, cost 0), worker -> task (cap 1, cost = matrix entry), tasks -> sink (cap 1, cost 0). Max flow is `n`, and the minimum cost is the optimal assignment. The Hungarian algorithm solves the same thing in O(n³) with a smaller constant; MCMF wins when the structure is irregular (unequal sides, capacities > 1, forbidden pairs).",
  ],
  code: [
    {
      language: "cpp",
      caption: "MCMF via SPFA successive shortest paths (handles negative residual costs)",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct MCMF {
    struct Edge { int to; ll cap, cost; };
    int n;
    vector<Edge> e;              // paired: e[i^1] is the reverse of e[i]
    vector<vector<int>> g;

    explicit MCMF(int n_) : n(n_), g(n_) {}

    void addEdge(int u, int v, ll cap, ll cost) {
        g[u].push_back((int)e.size()); e.push_back({v, cap, cost});
        g[v].push_back((int)e.size()); e.push_back({u, 0, -cost});  // negated cost
    }

    // returns {max flow, min cost of that flow}
    pair<ll, ll> run(int s, int t) {
        const ll INF = LLONG_MAX / 4;
        ll flow = 0, cost = 0;
        vector<ll> dist(n);
        vector<int> pe(n);          // pe[v] = edge id used to reach v
        vector<char> inq(n, 0);

        while (true) {
            fill(dist.begin(), dist.end(), INF);
            fill(pe.begin(), pe.end(), -1);
            dist[s] = 0;
            deque<int> q; q.push_back(s); inq[s] = 1;

            while (!q.empty()) {                       // SPFA
                int u = q.front(); q.pop_front(); inq[u] = 0;
                for (int id : g[u]) {
                    if (e[id].cap <= 0) continue;
                    int v = e[id].to;
                    if (dist[u] + e[id].cost < dist[v]) {
                        dist[v] = dist[u] + e[id].cost;
                        pe[v] = id;
                        if (!inq[v]) { inq[v] = 1; q.push_back(v); }
                    }
                }
            }
            if (dist[t] >= INF) break;                 // sink unreachable: done

            ll push = INF;
            for (int v = t; v != s; v = e[pe[v] ^ 1].to)
                push = min(push, e[pe[v]].cap);        // bottleneck
            for (int v = t; v != s; v = e[pe[v] ^ 1].to) {
                e[pe[v]].cap -= push;
                e[pe[v] ^ 1].cap += push;
            }
            flow += push;
            cost += push * dist[t];
        }
        return {flow, cost};
    }
};`,
    },
    {
      language: "cpp",
      caption: "Assignment problem: n workers, n tasks, cost[i][j]",
      source: `// Minimum total cost to assign every worker exactly one task.
ll assignmentCost(const vector<vector<ll>>& cost) {
    int n = (int)cost.size();
    int S = 2 * n, T = 2 * n + 1;
    MCMF f(2 * n + 2);
    for (int i = 0; i < n; ++i) {
        f.addEdge(S, i, 1, 0);              // worker i available once
        f.addEdge(n + i, T, 1, 0);          // task i needed once
        for (int j = 0; j < n; ++j)
            f.addEdge(i, n + j, 1, cost[i][j]);
    }
    auto [flow, total] = f.run(S, T);
    return flow == n ? total : -1;          // -1: no complete assignment exists
}`,
    },
  ],
  comparison: {
    columns: ["Variant", "Shortest-path engine", "Time", "Use when"],
    rows: [
      ["SPFA / Bellman-Ford SSP", "Label correcting", "O(F · V · E)", "Costs may be negative; simplest correct version"],
      ["Johnson potentials + Dijkstra", "Dijkstra on reduced costs", "O(F · E · log V)", "Many augmentations, large graphs"],
      ["Hungarian algorithm", "Dedicated", "O(n³)", "Square assignment matrix, nothing irregular"],
      ["Plain max-flow (Dinic)", "n/a", "O(V² · E)", "Costs are irrelevant — do not pay for MCMF"],
    ],
  },
  cheatSheet: [
    "SPFA version: O(F·V·E) time, O(V + E) space. With potentials + Dijkstra: O(F·E·log V).",
    "Reverse edge cost is `-cost`; that is why the residual graph has negative weights.",
    "Reduced cost `w + pot[u] - pot[v]` is non-negative — the trick that unlocks Dijkstra.",
    "Augment along the *cheapest* path each round; correctness fails if you take any path.",
    "Need min cost at a *fixed* flow value f? Stop augmenting once `flow == f`.",
  ],
  interviewQA: [
    {
      q: "Why can't you just run Dijkstra inside min-cost max-flow?",
      a: "Because the residual graph contains negative edges by construction. Every reverse edge carries the negated cost of its forward edge, so the moment any flow is pushed, negative-weight residual edges appear even if all input costs were positive. Dijkstra finalises a node on pop and cannot handle that. Two fixes: use a label-correcting algorithm like SPFA or Bellman-Ford, giving O(F·V·E), or apply Johnson potentials — maintain pot[v] as the shortest distance found so far and search on reduced costs w(u,v) + pot[u] − pot[v], which is provably non-negative on every residual edge. Then Dijkstra is valid and the whole thing runs in O(F·E·log V). Initialise potentials with one Bellman-Ford pass, or with zeros when the original costs are all non-negative.",
      followUps: ["Why is the reduced cost non-negative on residual edges?", "What breaks if the graph has a negative cost cycle?"],
    },
    {
      q: "Warehouses have supply, stores have demand, and shipping costs vary per pair. Model it.",
      a: "This is the transportation problem, a direct min-cost max-flow instance. Add a super-source with an edge to each warehouse of capacity equal to its supply and cost 0, an edge from each store to a super-sink with capacity equal to its demand and cost 0, and an edge from warehouse i to store j with capacity equal to the per-route limit (or infinity if unrestricted) and cost equal to the unit shipping price. Run MCMF from super-source to super-sink. If the resulting flow equals total demand, every store is served and the reported cost is the minimum possible; if it falls short, demand is infeasible given supply and route capacities. Complexity is O(F·E·log V) with potentials. If each warehouse serves at most one store and sizes match, it collapses to the assignment problem and the Hungarian algorithm's O(n³) is a tighter fit.",
    },
  ],
  flashcards: [
    { front: "MCMF complexity with SPFA vs with potentials?", back: "O(F·V·E) with SPFA/Bellman-Ford; O(F·E·log V) with Johnson potentials plus Dijkstra. Space O(V + E) either way." },
    { front: "What cost does the reverse residual edge carry?", back: "The negation, −cost, so cancelling a unit of flow refunds exactly what it cost." },
    { front: "Reduced cost formula for potentials?", back: "w'(u,v) = w(u,v) + pot[u] − pot[v], non-negative on all residual edges, so Dijkstra applies." },
  ],
};
