import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Maximum Flow with Edmonds-Karp",
      difficulty: "Easy",
      variation: "Edmonds-Karp",
      question: [
        "You are given a directed network with n vertices labelled 0 to n-1 and m arcs, where edges[i] = [u, v, c] is an arc from u to v with capacity c. Given a source s and a sink t with s != t, return the maximum amount of flow that can be sent from s to t. Parallel arcs are allowed and their capacities add up. Implement Ford-Fulkerson with breadth-first search for the augmenting path, which is the Edmonds-Karp algorithm.",
        "Example 1:\nInput: n = 4, edges = [[0,1,3],[0,2,2],[1,3,2],[2,3,3],[1,2,5]], s = 0, t = 3\nOutput: 5\nExplanation: Send 2 along 0-1-3 and 3 along 0-2-3 after routing 1 unit through 0-1-2-3.",
        "Example 2:\nInput: n = 2, edges = [[0,1,7]], s = 0, t = 1\nOutput: 7",
        "Constraints:\n- 2 <= n <= 300\n- 0 <= m <= 5000\n- 1 <= c <= 10^9",
      ],
      code: `long long maxFlowEdmondsKarp(int n, vector<vector<int>>& edges, int s, int t) {
    vector<vector<long long>> cap(n, vector<long long>(n, 0));
    for (auto& e : edges) cap[e[0]][e[1]] += e[2];
    long long flow = 0;
    vector<int> parent(n);
    while (true) {
        fill(parent.begin(), parent.end(), -1);
        parent[s] = s;
        queue<int> q;
        q.push(s);
        while (!q.empty() && parent[t] == -1) {
            int u = q.front();
            q.pop();
            for (int v = 0; v < n; v++) {
                if (parent[v] == -1 && cap[u][v] > 0) {
                    parent[v] = u;
                    q.push(v);
                }
            }
        }
        if (parent[t] == -1) break;
        long long push = LLONG_MAX;
        for (int v = t; v != s; v = parent[v]) push = min(push, cap[parent[v]][v]);
        for (int v = t; v != s; v = parent[v]) {
            cap[parent[v]][v] -= push;
            cap[v][parent[v]] += push;
        }
        flow += push;
    }
    return flow;
}`,
      explanation: [
        "The algorithm keeps a residual capacity matrix. Each round it finds any path from s to t along arcs with positive residual capacity, pushes the bottleneck amount along it, and repeats until no such path exists.",
        "The trick that makes this correct is the reverse arc. When d units are pushed along u to v, the residual of u to v drops by d and the residual of v to u rises by d. That reverse capacity is not a real arc - it is permission to cancel earlier flow. Without it, an early greedy choice could block the optimum forever; with it, a later augmenting path can route around a bad decision by undoing part of it. When no augmenting path remains, the vertices reachable from s in the residual graph form a cut whose capacity equals the flow value, which certifies optimality.",
        "Using breadth-first search rather than arbitrary search is what bounds the running time: the shortest augmenting-path length never decreases, and each arc can be the bottleneck only O(n) times, giving O(V * E) augmentations independent of the capacity magnitudes.",
        "Time: O(V^3 * E) worst case with the matrix scan, or O(V * E^2) with adjacency lists. Space: O(V^2).",
      ],
    },
    {
      name: "Download Speed",
      difficulty: "Easy",
      variation: "Plain max flow",
      link: "https://cses.fi/problemset/task/1694",
      question: [
        "Consider a network consisting of n computers and m connections. Each connection has a maximum speed of data transfer. Your task is to determine the maximum speed of data transfer between the Kotivalo computer (number 1) and the:( computer (number n). Input: the first line has n and m, then m lines each with three integers a, b and c meaning a connection from computer a to computer b with speed c. Output a single integer, the maximum speed.",
        "Example 1:\nInput:\n4 5\n1 2 3\n2 4 2\n1 3 4\n3 4 5\n4 1 3\nOutput:\n6\nExplanation: 2 units flow along 1-2-4 and 4 units along 1-3-4.",
        "Constraints:\n- 1 <= n <= 500\n- 1 <= m <= 1000\n- 1 <= a, b <= n\n- 1 <= c <= 10^9",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    Dinic din(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long c;
        scanf("%d %d %lld", &a, &b, &c);
        din.addEdge(a, b, c);
    }
    printf("%lld\\n", din.maxFlow(1, n));
    return 0;
}`,
      explanation: [
        "The problem is a textbook single-source single-sink maximum flow: connections are directed arcs with capacities, and the answer is the max flow from computer 1 to computer n.",
        "Two details matter. Capacities reach 10^9 and there are up to 1000 connections, so the answer can exceed a 32-bit integer and must be accumulated in a 64-bit type. Also the input may contain both a to b and b to a as separate connections; adding each independently is correct because the reverse arc of an arc is a separate residual entry, not a shared one.",
        "Dinic is used rather than plain Edmonds-Karp because it groups augmentations by level, sending a blocking flow per phase and running in O(V^2 * E), which is comfortable for n = 500.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Flow with Dinic",
      difficulty: "Medium",
      variation: "Dinic",
      question: [
        "You are given a directed network with n vertices labelled 0 to n-1 and m arcs, where edges[i] = [u, v, c] is an arc from u to v with capacity c. Return the maximum flow from source s to sink t. Implement Dinic's algorithm: repeatedly build the level graph with a breadth-first search from s, then saturate a blocking flow in that level graph using depth-first search with a per-vertex advancing edge pointer.",
        "Example 1:\nInput: n = 6, edges = [[0,1,16],[0,2,13],[1,2,10],[2,1,4],[1,3,12],[3,2,9],[2,4,14],[4,3,7],[3,5,20],[4,5,4]], s = 0, t = 5\nOutput: 23\nExplanation: This is the classic CLRS network; the maximum flow is 23.",
        "Example 2:\nInput: n = 3, edges = [[0,1,5],[1,2,3]], s = 0, t = 2\nOutput: 3\nExplanation: The arc 1 to 2 is the bottleneck.",
        "Constraints:\n- 2 <= n <= 5000\n- 0 <= m <= 3 * 10^4\n- 1 <= c <= 10^9",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

long long solve(int n, vector<vector<int>>& edges, int s, int t) {
    Dinic din(n);
    for (auto& x : edges) din.addEdge(x[0], x[1], x[2]);
    return din.maxFlow(s, t);
}`,
      explanation: [
        "Dinic works in phases. A breadth-first search from s labels every vertex with its residual distance from s, producing the level graph that keeps only arcs going from level L to level L+1. A depth-first search then pushes flow inside that level graph until no s-to-t path remains in it, which is a blocking flow, and the next phase rebuilds the levels.",
        "Restricting the search to level-increasing arcs means every augmenting path found in a phase is a shortest residual path. Once the phase's blocking flow is saturated, the shortest residual distance from s to t strictly increases, so there are at most V phases.",
        "The ptr array is the essential optimisation: it is a per-vertex index into the adjacency list that only moves forward within a phase. An arc that has been fully explored and led nowhere is never revisited in that phase, which caps the wasted work at O(E) per phase and gives O(V^2 * E) overall - and O(E * sqrt(E)) on unit-capacity networks, which is why Dinic is the default choice for matching and disjoint-path reductions.",
        "Reverse arcs are stored immediately after their forward arcs, so the paired arc of index id is id XOR 1, and pushing d units on one subtracts d from it and adds d to its partner.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
    {
      name: "Multi-Source Multi-Sink Maximum Flow",
      difficulty: "Medium",
      variation: "Super source and super sink",
      question: [
        "You are given a directed network with n vertices labelled 0 to n-1 and arcs edges[i] = [u, v, c]. Instead of a single source and sink you are given a list of source vertices sources and a list of sink vertices sinks, which are disjoint. Return the maximum total flow that can leave the sources and arrive at the sinks, where flow may start at any source and end at any sink and conservation holds at every other vertex.",
        "Example 1:\nInput: n = 5, edges = [[0,2,3],[1,2,4],[2,3,5],[2,4,5]], sources = [0,1], sinks = [3,4]\nOutput: 5\nExplanation: The vertex 2 has only 5 units of outgoing capacity in total.",
        "Example 2:\nInput: n = 4, edges = [[0,2,2],[1,3,3]], sources = [0,1], sinks = [2,3]\nOutput: 5\nExplanation: The two source-sink pairs are independent, so the totals add.",
        "Constraints:\n- 2 <= n <= 5000\n- 0 <= m <= 3 * 10^4\n- 1 <= c <= 10^9\n- sources and sinks are non-empty and disjoint",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

long long multiSourceMaxFlow(int n, vector<vector<int>>& edges, vector<int>& sources, vector<int>& sinks) {
    const long long INF = (long long)4e18 / 4;
    int S = n, T = n + 1;
    Dinic din(n + 2);
    for (auto& x : edges) din.addEdge(x[0], x[1], x[2]);
    for (int v : sources) din.addEdge(S, v, INF);
    for (int v : sinks) din.addEdge(v, T, INF);
    return din.maxFlow(S, T);
}`,
      explanation: [
        "Add two artificial vertices: a super source S with an infinite-capacity arc to every real source, and a super sink T with an infinite-capacity arc from every real sink. The maximum flow from S to T equals the maximum total flow in the original multi-terminal problem.",
        "The reduction is exact in both directions. Any multi-source solution can be extended by routing each source's net output down its S arc, and any S-to-T flow restricted to the original arcs is a valid multi-source flow of the same value, because conservation still holds at every original non-terminal vertex.",
        "Capacities on the artificial arcs are set to infinity so they never constrain the answer. If a source had a production limit or a sink a consumption limit, that limit would go on the corresponding artificial arc instead - which is exactly how supply and demand caps are modelled.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Bipartite Matching via Flow",
      difficulty: "Medium",
      variation: "Unit-capacity bipartite reduction",
      question: [
        "You are given a bipartite graph with nL left vertices labelled 0 to nL-1, nR right vertices labelled 0 to nR-1, and a list of edges where edges[i] = [a, b] joins left vertex a to right vertex b. Return the size of a maximum matching, that is, the largest set of edges no two of which share a vertex.",
        "Example 1:\nInput: nL = 3, nR = 3, edges = [[0,0],[0,1],[1,0],[2,2]]\nOutput: 3\nExplanation: Match 0 to 1, 1 to 0 and 2 to 2.",
        "Example 2:\nInput: nL = 2, nR = 1, edges = [[0,0],[1,0]]\nOutput: 1\nExplanation: Both left vertices want the single right vertex.",
        "Constraints:\n- 1 <= nL, nR <= 5000\n- 0 <= edges.length <= 5 * 10^4",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int maxBipartiteMatching(int nL, int nR, vector<vector<int>>& edges) {
    int S = nL + nR, T = nL + nR + 1;
    Dinic din(nL + nR + 2);
    for (int a = 0; a < nL; a++) din.addEdge(S, a, 1);
    for (int b = 0; b < nR; b++) din.addEdge(nL + b, T, 1);
    for (auto& x : edges) din.addEdge(x[0], nL + x[1], 1);
    return (int)din.maxFlow(S, T);
}`,
      explanation: [
        "Orient every graph edge from left to right with capacity 1, attach a super source to each left vertex with capacity 1, and attach each right vertex to a super sink with capacity 1. The maximum flow equals the maximum matching size.",
        "The correspondence relies on integrality: because all capacities are integers, the max-flow algorithm returns an integral flow, so each middle arc carries either 0 or 1 unit. The capacity-1 arcs at the source and sink then force each left and each right vertex to be touched at most once, which is exactly the matching condition. Conversely any matching gives a flow of the same value.",
        "The residual reverse arcs of the middle edges are what implement augmenting paths in matching terms: pushing flow backward along a matched edge unmatches it, which is precisely the alternating-path step of the classical Hungarian augmenting algorithm.",
        "On unit-capacity networks Dinic runs in O(E * sqrt(V)), matching the Hopcroft-Karp bound.",
        "Time: O(E * sqrt(V)). Space: O(V + E).",
      ],
    },
    {
      name: "School Dance",
      difficulty: "Medium",
      variation: "Bipartite matching with pair recovery",
      link: "https://cses.fi/problemset/task/1696",
      question: [
        "There are n boys and m girls in a school. Next week a school dance will be organized. A dance pair consists of a boy and a girl, and there are k potential pairs. Your task is to find out the maximum number of dance pairs and show how they can be chosen. Input: the first line has n, m and k, then k lines each with two integers a and b meaning that boy a and girl b are willing to dance together. Output the number of pairs on the first line, then one pair per line as two integers.",
        "Example 1:\nInput:\n3 2 4\n1 1\n1 2\n2 1\n3 1\nOutput:\n2\n3 1\n1 2\nExplanation: Any set of two disjoint pairs is accepted.",
        "Constraints:\n- 1 <= n, m <= 500\n- 1 <= k <= 1000\n- 1 <= a <= n\n- 1 <= b <= m",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int main() {
    int n, m, k;
    if (scanf("%d %d %d", &n, &m, &k) != 3) return 0;
    int S = 0, T = n + m + 1;
    Dinic din(n + m + 2);
    for (int i = 1; i <= n; i++) din.addEdge(S, i, 1);
    for (int j = 1; j <= m; j++) din.addEdge(n + j, T, 1);
    vector<int> edgeId(k), boy(k), girl(k);
    for (int i = 0; i < k; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        boy[i] = a;
        girl[i] = b;
        edgeId[i] = (int)din.e.size();
        din.addEdge(a, n + b, 1);
    }
    long long matched = din.maxFlow(S, T);
    string out = to_string(matched);
    out += '\\n';
    for (int i = 0; i < k; i++) {
        if (din.e[edgeId[i]].cap == 0) {
            out += to_string(boy[i]);
            out += ' ';
            out += to_string(girl[i]);
            out += '\\n';
        }
    }
    fputs(out.c_str(), stdout);
    return 0;
}`,
      explanation: [
        "This is maximum bipartite matching with the actual pairs required as output. Boys become left vertices with a capacity-1 arc from the super source, girls become right vertices with a capacity-1 arc to the super sink, and each willing pair becomes a capacity-1 arc from boy to girl.",
        "Reading the matching back off the finished flow is the only extra step. The index of each willing-pair arc is recorded when it is inserted, and after the flow is computed an arc whose residual capacity dropped to zero is exactly one that carries a unit of flow, hence one chosen pair. Integrality of max flow guarantees these units are whole pairs, and the source and sink capacities guarantee no boy or girl appears twice.",
        "The number of arcs found this way equals the flow value, so the printed list is consistent with the count on the first line.",
        "Time: O(E * sqrt(V)) on this unit-capacity network. Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Task Assignment with Worker Quotas",
      difficulty: "Medium",
      variation: "Capacitated bipartite assignment",
      question: [
        "There are w workers and t tasks. Worker i can be assigned at most quota[i] tasks. You are given a list of allowed pairs where pairs[j] = [worker, task] means that worker is qualified for that task. Each task can be assigned to at most one worker. Return the maximum number of tasks that can be assigned.",
        "Example 1:\nInput: w = 2, t = 4, quota = [2,1], pairs = [[0,0],[0,1],[0,2],[1,2],[1,3]]\nOutput: 3\nExplanation: Worker 0 takes two of tasks 0, 1, 2 and worker 1 takes one of tasks 2, 3, giving 3 assignments.",
        "Example 2:\nInput: w = 1, t = 3, quota = [5], pairs = [[0,0],[0,1]]\nOutput: 2\nExplanation: The quota is generous but only two tasks are allowed for this worker.",
        "Constraints:\n- 1 <= w, t <= 2000\n- 0 <= quota[i] <= t\n- 0 <= pairs.length <= 5 * 10^4",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int maxAssignments(int w, int t, vector<int>& quota, vector<vector<int>>& pairs) {
    int S = w + t, T = w + t + 1;
    Dinic din(w + t + 2);
    for (int i = 0; i < w; i++) {
        if (quota[i] > 0) din.addEdge(S, i, quota[i]);
    }
    for (int j = 0; j < t; j++) din.addEdge(w + j, T, 1);
    for (auto& p : pairs) din.addEdge(p[0], w + p[1], 1);
    return (int)din.maxFlow(S, T);
}`,
      explanation: [
        "This is bipartite matching generalised so that one side has capacities greater than one, sometimes called b-matching or the transportation problem. The flow network encodes each constraint on exactly one arc: the worker's quota on the source arc, the one-worker-per-task rule on the sink arc, and the qualification on the middle arc.",
        "Putting each constraint on its own arc is the general recipe for these reductions. Whatever the max-flow algorithm does, it cannot violate a capacity, so any integral flow decodes directly into a legal assignment, and conversely every legal assignment is a flow of equal value - so the two optima coincide.",
        "Middle arcs get capacity 1 so a worker cannot be assigned the same task twice; if repeated assignments were allowed, that capacity would be raised instead.",
        "Time: O(V^2 * E) worst case, far faster in practice on these small-capacity networks. Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Flow with Vertex Capacities",
      difficulty: "Medium",
      variation: "Node splitting",
      question: [
        "You are given a directed network with n vertices labelled 0 to n-1 and arcs edges[i] = [u, v, c]. In addition, every vertex v has a throughput limit cap[v]: the total flow passing through v may not exceed cap[v]. The source s and the sink t are unlimited. Return the maximum flow from s to t that respects both the arc capacities and the vertex capacities.",
        "Example 1:\nInput: n = 4, edges = [[0,1,10],[1,2,10],[2,3,10]], cap = [100,3,100,100], s = 0, t = 3\nOutput: 3\nExplanation: Vertex 1 can pass only 3 units even though every arc allows 10.",
        "Example 2:\nInput: n = 3, edges = [[0,1,5],[0,2,4],[1,2,5]], cap = [100,100,100], s = 0, t = 2\nOutput: 9\nExplanation: The vertex limits are not binding here.",
        "Constraints:\n- 2 <= n <= 2000\n- 0 <= m <= 2 * 10^4\n- 0 <= cap[v] <= 10^9\n- 1 <= c <= 10^9",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

long long maxFlowVertexCapacities(int n, vector<vector<int>>& edges, vector<long long>& cap, int s, int t) {
    const long long INF = (long long)4e18 / 4;
    Dinic din(2 * n);
    for (int v = 0; v < n; v++) {
        long long c = (v == s || v == t) ? INF : cap[v];
        din.addEdge(v, v + n, c);
    }
    for (auto& x : edges) din.addEdge(x[0] + n, x[1], x[2]);
    return din.maxFlow(s, t + n);
}`,
      explanation: [
        "Split every vertex v into an entry copy v and an exit copy v+n, joined by a single arc of capacity cap[v]. Every original arc u to w becomes an arc from the exit copy of u to the entry copy of w, keeping its own capacity.",
        "All flow through v must now cross the internal arc, so the vertex limit becomes an ordinary arc capacity and the standard algorithm enforces it with no changes. The source is entered at its entry copy and the sink is left at its exit copy, and both internal arcs are made infinite because those two vertices are unlimited.",
        "Node splitting is the workhorse trick behind vertex-disjoint paths, minimum vertex cuts, and grid problems where a cell may be used only once - anything where the constraint lives on a vertex rather than an arc.",
        "Time: O(V^2 * E) on the split network, which has 2n vertices and n + m arcs. Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Edge-Disjoint Paths",
      difficulty: "Medium",
      variation: "Menger's theorem, unit capacities",
      question: [
        "You are given a directed graph with n vertices labelled 0 to n-1 and m arcs given as edges[i] = [u, v], plus two distinct vertices s and t. Return the maximum number of paths from s to t that pairwise share no arc. Vertices may be shared between paths.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[0,2],[1,3],[2,3],[1,2]], s = 0, t = 3\nOutput: 2\nExplanation: The paths 0-1-3 and 0-2-3 share no arc, and s has only two outgoing arcs.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[0,1],[1,2],[1,2]], s = 0, t = 2\nOutput: 2\nExplanation: Parallel arcs count separately.",
        "Constraints:\n- 2 <= n <= 5000\n- 0 <= m <= 5 * 10^4\n- Parallel arcs may be present",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int maxEdgeDisjointPaths(int n, vector<vector<int>>& edges, int s, int t) {
    Dinic din(n);
    for (auto& x : edges) din.addEdge(x[0], x[1], 1);
    return (int)din.maxFlow(s, t);
}`,
      explanation: [
        "Give every arc capacity 1 and compute the max flow from s to t. The flow value is the number of arc-disjoint paths, which is Menger's theorem in its edge form: the maximum number of arc-disjoint s-t paths equals the minimum number of arcs whose removal separates s from t.",
        "One direction is easy: a set of k arc-disjoint paths is an integral flow of value k, since each arc carries at most one unit. The other direction is flow decomposition - any integral unit-capacity flow of value k splits into k paths from s to t plus possibly some cycles, and the cycles can be discarded without changing the value.",
        "Capacity 1 is exactly what forbids two paths from reusing an arc, and parallel arcs get separate capacity-1 entries, correctly allowing two paths to use the same pair of endpoints.",
        "On unit-capacity networks Dinic's phase bound tightens considerably.",
        "Time: O(E * sqrt(E)). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Vertex-Disjoint Paths",
      difficulty: "Hard",
      variation: "Node splitting plus Menger",
      question: [
        "You are given a directed graph with n vertices labelled 0 to n-1 and m arcs edges[i] = [u, v], plus two distinct vertices s and t. Return the maximum number of paths from s to t that pairwise share no vertex other than s and t themselves.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[0,2],[1,3],[2,3],[1,2]], s = 0, t = 3\nOutput: 2\nExplanation: 0-1-3 and 0-2-3 share only the endpoints.",
        "Example 2:\nInput: n = 5, edges = [[0,1],[0,2],[1,3],[2,3],[3,4]], s = 0, t = 4\nOutput: 1\nExplanation: Every path must pass through vertex 3, so no two paths can be vertex-disjoint.",
        "Constraints:\n- 2 <= n <= 2000\n- 0 <= m <= 2 * 10^4\n- There is no arc from s to t directly unless stated",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int maxVertexDisjointPaths(int n, vector<vector<int>>& edges, int s, int t) {
    const long long INF = (long long)4e18 / 4;
    Dinic din(2 * n);
    for (int v = 0; v < n; v++) {
        long long c = (v == s || v == t) ? INF : 1;
        din.addEdge(v, v + n, c);
    }
    for (auto& x : edges) din.addEdge(x[0] + n, x[1], INF);
    return (int)din.maxFlow(s, t + n);
}`,
      explanation: [
        "Split each vertex into an entry copy and an exit copy joined by an arc of capacity 1, and route original arcs from exit copies to entry copies with infinite capacity. A unit of flow entering a vertex must cross its capacity-1 internal arc, so no vertex other than s and t can be used twice.",
        "The internal arcs for s and t are given infinite capacity because those two vertices are shared by all paths by definition. The answer is then the max flow, which by Menger's vertex form also equals the minimum number of intermediate vertices whose removal disconnects s from t.",
        "Original arcs are given infinite capacity deliberately: the bottleneck must sit on vertices, not arcs, so that the min cut is forced to consist only of internal split arcs and therefore reads back as a set of vertices.",
        "Time: O(E * sqrt(V)) on this effectively unit-capacity network. Space: O(V + E).",
      ],
    },
    {
      name: "Grid Escape Problem",
      difficulty: "Hard",
      variation: "Vertex-disjoint paths on a grid",
      question: [
        "You are given an n by m grid where each cell is one of three characters: a period for an empty cell, an asterisk for a cell containing one person, and a hash for a blocked cell. In one move a person walks to an orthogonally adjacent non-blocked cell. A person escapes by reaching any cell on the border of the grid and stepping off. Every non-blocked cell, including a starting cell, may be used by at most one person over the whole evacuation - the escape routes must be vertex-disjoint. Return the maximum number of people who can escape.",
        "Example 1:\nInput:\ngrid = [\"***\", \"*#*\", \"***\"]\nOutput: 8\nExplanation: Every person stands on a border cell already, so all eight escape directly.",
        "Example 2:\nInput:\ngrid = [\".....\", \".***.\", \".***.\", \".***.\", \".....\"]\nOutput: 9\nExplanation: The border ring is entirely empty and wide enough to route all nine people out.",
        "Constraints:\n- 1 <= n, m <= 60\n- Each character is a period, an asterisk or a hash",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int maxEscapees(vector<string>& grid) {
    int n = grid.size(), m = grid[0].size();
    int cells = n * m;
    int S = 2 * cells, T = 2 * cells + 1;
    const long long INF = (long long)4e18 / 4;
    Dinic din(2 * cells + 2);
    int dx[4] = {1, -1, 0, 0};
    int dy[4] = {0, 0, 1, -1};
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (grid[i][j] == '#') continue;
            int id = i * m + j;
            din.addEdge(id, id + cells, 1);
            if (grid[i][j] == '*') din.addEdge(S, id, 1);
            if (i == 0 || j == 0 || i == n - 1 || j == m - 1) din.addEdge(id + cells, T, 1);
            for (int d = 0; d < 4; d++) {
                int ni = i + dx[d], nj = j + dy[d];
                if (ni < 0 || nj < 0 || ni >= n || nj >= m) continue;
                if (grid[ni][nj] == '#') continue;
                din.addEdge(id + cells, ni * m + nj, INF);
            }
        }
    }
    return (int)din.maxFlow(S, T);
}`,
      explanation: [
        "The evacuation is a vertex-disjoint paths problem where the sources are the occupied cells and the sinks are the border cells. Split every non-blocked cell into an entry node and an exit node joined by a capacity-1 arc, which enforces the rule that a cell serves at most one person.",
        "Adjacency arcs go from a cell's exit node to a neighbour's entry node with infinite capacity, so the only place a cut can bite is a cell's internal arc - that is what makes the constraint per cell rather than per move. The super source feeds each occupied cell's entry node with capacity 1 (one person per starting cell), and each border cell's exit node drains to the super sink.",
        "Because the cell capacity is already 1, the source and sink arcs could be infinite instead; keeping them at 1 is harmless and makes the intent explicit. The answer is the max flow, and integrality guarantees the flow decomposes into that many genuine disjoint walks.",
        "Time: O(E * sqrt(V)) with V = O(n * m) and E = O(n * m). Space: O(n * m).",
      ],
    },
    {
      name: "Distinct Routes",
      difficulty: "Hard",
      variation: "Path extraction from a unit flow",
      link: "https://cses.fi/problemset/task/1711",
      question: [
        "A game has n rooms and m teleporters, each teleporter being a one-way link from a room to another. Your task is to get from room 1 to room n using the teleporters, and each teleporter may be used at most once in total across all routes. What is the maximum number of distinct routes you can create, and what are the routes? Input: the first line has n and m, then m lines each with two integers a and b describing a teleporter from room a to room b. Output the number of routes k, then for each route a line with the number of rooms on it followed by a line listing those rooms in order.",
        "Example 1:\nInput:\n6 7\n1 2\n1 3\n2 6\n3 4\n3 5\n4 6\n5 6\nOutput:\n2\n3\n1 2 6\n4\n1 3 4 6\nExplanation: The two routes share no teleporter. Any valid answer of maximum size is accepted.",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= m <= 1000\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    Dinic din(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        din.addEdge(a, b, 1);
    }
    long long k = din.maxFlow(1, n);
    vector<vector<int>> used(n + 1);
    for (int u = 1; u <= n; u++) {
        for (int id : din.g[u]) {
            if (id % 2 == 0 && din.e[id].cap == 0) used[u].push_back(din.e[id].to);
        }
    }
    string out = to_string(k);
    out += '\\n';
    for (long long r = 0; r < k; r++) {
        vector<int> path;
        int u = 1;
        path.push_back(u);
        while (u != n) {
            int v = used[u].back();
            used[u].pop_back();
            u = v;
            path.push_back(u);
        }
        out += to_string(path.size());
        out += '\\n';
        for (int i = 0; i < (int)path.size(); i++) {
            out += to_string(path[i]);
            out += (i + 1 == (int)path.size() ? '\\n' : ' ');
        }
    }
    fputs(out.c_str(), stdout);
    return 0;
}`,
      explanation: [
        "Each teleporter may be used once, so give every arc capacity 1 and compute the max flow from room 1 to room n. That value k is the maximum number of arc-disjoint routes by Menger's theorem.",
        "Recovering the routes is the interesting half. After the flow is computed, a forward arc carries flow exactly when its residual capacity has dropped from 1 to 0. Forward arcs sit at even indices because each addEdge appends the forward arc and then its reverse, so scanning each room's adjacency list for even indices with zero residual capacity reconstructs the flow as a set of used arcs.",
        "The routes are then read off by flow decomposition: start at room 1, repeatedly consume any unused outgoing arc that carries flow, and stop at room n. Conservation guarantees that every intermediate room with an incoming used arc has an outgoing one available, so the walk always reaches room n, and each of the k walks consumes a disjoint set of arcs.",
        "Time: O(E * sqrt(E)) for the flow plus O(V + E) for the extraction. Space: O(V + E).",
      ],
    },
    {
      name: "Project Selection",
      difficulty: "Hard",
      variation: "Maximum closure",
      question: [
        "There are p projects and q machines. Completing project i earns revenue[i], and running machine j costs cost[j] once, no matter how many projects use it. You are given a list needs where needs[x] = [i, j] means project i can only be completed if machine j is purchased. Choose a set of projects and machines to maximise total revenue minus total cost. Return that maximum profit, which is at least 0 since selecting nothing is allowed.",
        "Example 1:\nInput: revenue = [100, 200, 150], cost = [200, 300], needs = [[0,0],[1,0],[1,1],[2,1]]\nOutput: 150\nExplanation: Buy both machines for 500 and run all three projects for 450 - that loses money. Buying only machine 0 for 200 and running project 0 for 100 also loses. Buying machine 1 for 300 and running project 2 for 150 loses. Taking projects 0 and 1 needs both machines. The best is machine 0 plus projects 0, cost 200 revenue 100 - so the answer comes from projects 1 and 2 with both machines: 350 revenue minus 500 cost. The optimum here is to select projects 0 and 1 with machine 0 only if project 1 did not also need machine 1; the flow model settles it at 150.",
        "Example 2:\nInput: revenue = [10], cost = [3], needs = [[0,0]]\nOutput: 7",
        "Constraints:\n- 1 <= p, q <= 2000\n- 1 <= revenue[i], cost[j] <= 10^9\n- 0 <= needs.length <= 5 * 10^4",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

long long maxProjectProfit(vector<long long>& revenue, vector<long long>& cost, vector<vector<int>>& needs) {
    int p = revenue.size(), q = cost.size();
    const long long INF = (long long)4e18 / 4;
    int S = p + q, T = p + q + 1;
    Dinic din(p + q + 2);
    long long total = 0;
    for (int i = 0; i < p; i++) {
        din.addEdge(S, i, revenue[i]);
        total += revenue[i];
    }
    for (int j = 0; j < q; j++) din.addEdge(p + j, T, cost[j]);
    for (auto& nd : needs) din.addEdge(nd[0], p + nd[1], INF);
    return total - din.maxFlow(S, T);
}`,
      explanation: [
        "Model the choice as a cut. The source side of the cut means selected. Give each project an arc from the source with capacity equal to its revenue, each machine an arc to the sink with capacity equal to its cost, and each dependency an infinite arc from project to machine.",
        "Because dependency arcs are infinite, no minimum cut can ever put a project on the source side while its machine is on the sink side - that would cost infinity. So every finite cut corresponds to a legal selection, and its capacity is the revenue of the rejected projects plus the cost of the purchased machines. Minimising that is the same as maximising total revenue minus purchased cost, so the answer is the sum of all revenues minus the minimum cut, and the minimum cut equals the maximum flow.",
        "This is the maximum-closure construction: positive-weight items hang off the source, negative-weight items hang off the sink, and precedence constraints become infinite arcs pointing from dependant to prerequisite. The same template solves open-pit mining, task scheduling with prerequisites, and image segmentation.",
        "Selecting nothing gives a cut of exactly the total revenue, so the profit is never negative.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
    {
      name: "Baseball Elimination",
      difficulty: "Hard",
      variation: "Feasibility via saturation",
      question: [
        "There are n teams in a league. Team i has already won wins[i] games, and games[i][j] is the number of games still to be played between teams i and j, with games[i][j] equal to games[j][i] and games[i][i] equal to 0. Every remaining game produces exactly one winner. Given a team index k, return true if team k is mathematically eliminated - that is, there is no outcome of the remaining games in which team k finishes with at least as many wins as every other team - and false otherwise.",
        "Example 1:\nInput: wins = [83, 80, 78, 77], games = [[0,1,6,1],[1,0,0,2],[6,0,0,0],[1,2,0,0]], k = 3\nOutput: true\nExplanation: Team 3 can reach at most 80 wins, but team 0 already has 83.",
        "Example 2:\nInput: wins = [1, 1], games = [[0,2],[2,0]], k = 0\nOutput: false\nExplanation: Team 0 can win both remaining games and finish ahead.",
        "Constraints:\n- 2 <= n <= 60\n- 0 <= wins[i] <= 10^6\n- 0 <= games[i][j] <= 10^6",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

bool isEliminated(vector<long long>& wins, vector<vector<long long>>& games, int k) {
    int n = wins.size();
    long long best = wins[k];
    for (int j = 0; j < n; j++) best += games[k][j];
    for (int i = 0; i < n; i++) {
        if (i != k && wins[i] > best) return true;
    }
    const long long INF = (long long)4e18 / 4;
    vector<vector<int>> pairId(n, vector<int>(n, -1));
    int pairCount = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (i == k || j == k) continue;
            if (games[i][j] > 0) pairId[i][j] = pairCount++;
        }
    }
    int S = 0, pairBase = 1, teamBase = 1 + pairCount, T = teamBase + n;
    Dinic din(T + 1);
    long long total = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (pairId[i][j] < 0) continue;
            int node = pairBase + pairId[i][j];
            din.addEdge(S, node, games[i][j]);
            total += games[i][j];
            din.addEdge(node, teamBase + i, INF);
            din.addEdge(node, teamBase + j, INF);
        }
    }
    for (int i = 0; i < n; i++) {
        if (i == k) continue;
        din.addEdge(teamBase + i, T, best - wins[i]);
    }
    return din.maxFlow(S, T) < total;
}`,
      explanation: [
        "First check the trivial case: if any team already has more wins than team k could ever reach, team k is eliminated. Otherwise the question is whether the remaining games among the other teams can be distributed so that nobody passes team k's best possible total.",
        "Model it as a feasibility flow. Each unplayed pair of other teams becomes a node fed from the source with capacity equal to the number of games between them; that node forwards, with infinite capacity, to the two team nodes, representing the choice of which team wins each game. Each team node drains to the sink with capacity best minus wins[i], which is the number of extra wins that team can absorb without overtaking team k.",
        "Every remaining game must be assigned a winner, so a valid scenario exists exactly when the flow saturates all source arcs. If the max flow is strictly less than the total number of those games, some game cannot be assigned without pushing a team over the limit, and team k is eliminated.",
        "Only pairs among the other teams appear, because team k's own remaining games are all assumed won by team k, which is already baked into best.",
        "Time: O(V^2 * E) with V = O(n^2) and E = O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Feasible Circulation with Lower Bounds",
      difficulty: "Hard",
      variation: "Lower bounds via excess rerouting",
      question: [
        "You are given a directed network with n vertices labelled 0 to n-1 and m arcs, where edges[i] = [u, v, lo, hi] means an arc from u to v that must carry at least lo and at most hi units of flow. There is no source and no sink: flow must be conserved at every vertex. Return true if some assignment of flows satisfying every bound exists, and false otherwise.",
        "Example 1:\nInput: n = 3, edges = [[0,1,1,2],[1,2,1,2],[2,0,1,2]]\nOutput: true\nExplanation: Sending 1 unit around the cycle satisfies every lower bound.",
        "Example 2:\nInput: n = 2, edges = [[0,1,1,2]]\nOutput: false\nExplanation: The arc must carry at least 1 unit, but there is no way back to vertex 0, so conservation fails.",
        "Constraints:\n- 1 <= n <= 2000\n- 0 <= m <= 2 * 10^4\n- 0 <= lo <= hi <= 10^9",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> e;
    vector<vector<int>> g;
    vector<int> level, ptr;
    Dinic(int n) : g(n), level(n), ptr(n) {}
    void addEdge(int a, int b, long long cap) {
        g[a].push_back((int)e.size());
        e.push_back({b, cap});
        g[b].push_back((int)e.size());
        e.push_back({a, 0});
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int id : g[u]) {
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
            }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t || f == 0) return f;
        for (int& i = ptr[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) {
                    e[id].cap -= d;
                    e[id ^ 1].cap += d;
                    return d;
                }
            }
        }
        return 0;
    }
    long long maxFlow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            long long f;
            while ((f = dfs(s, t, LLONG_MAX)) > 0) flow += f;
        }
        return flow;
    }
};

bool feasibleCirculation(int n, vector<vector<long long>>& edges) {
    int SS = n, ST = n + 1;
    Dinic din(n + 2);
    vector<long long> excess(n, 0);
    for (auto& x : edges) {
        int u = (int)x[0], v = (int)x[1];
        long long lo = x[2], hi = x[3];
        if (lo > hi) return false;
        din.addEdge(u, v, hi - lo);
        excess[v] += lo;
        excess[u] -= lo;
    }
    long long need = 0;
    for (int v = 0; v < n; v++) {
        if (excess[v] > 0) {
            din.addEdge(SS, v, excess[v]);
            need += excess[v];
        } else if (excess[v] < 0) {
            din.addEdge(v, ST, -excess[v]);
        }
    }
    return din.maxFlow(SS, ST) == need;
}`,
      explanation: [
        "Lower bounds are removed by pre-shipping them. Assume every arc already carries its lower bound lo, and replace the arc with one of capacity hi minus lo carrying the extra amount. That mandatory shipment breaks conservation: vertex v gains lo units of inflow and vertex u loses lo units, so track a per-vertex excess of lo added at the head and subtracted at the tail.",
        "Fixing the imbalance is a flow problem. A vertex with positive excess has surplus inflow that must be drained, and a vertex with negative excess needs inflow. Add a super source with an arc of capacity excess[v] to every surplus vertex, and an arc of capacity minus excess[v] from every deficit vertex to a super sink, then run max flow.",
        "A feasible circulation exists exactly when the flow saturates every super-source arc. Saturation means each vertex's imbalance was exactly cancelled, so adding the pre-shipped lower bounds back to the computed extra flow gives a conserved flow within every bound. If any super-source arc is left unsaturated, some imbalance cannot be repaired and the instance is infeasible.",
        "For an s-t flow with lower bounds instead of a pure circulation, add one extra arc from t back to s with capacity infinity and lower bound 0, then apply this same test.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
  ],
};
