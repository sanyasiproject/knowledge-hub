import type { TopicContent } from "../types";

export const functionalGraphs: TopicContent = {
  quickSummary: [
    "A **functional graph** gives every node exactly one outgoing edge `f[v]`, so walking forward from any start is deterministic and eventually repeats.",
    "Each walk traces a **rho shape**: a tail of length `mu` feeding into a cycle of length `lambda`. Floyd and Brent find both in **O(mu + lambda)** time and **O(1)** space.",
    "Answering “where am I after k steps?” for many queries is a binary-lifting table: **O(n log k)** build, **O(log k)** per query.",
  ],
  detailed: [
    "Out-degree exactly one is the whole structure. With `n` nodes and one edge each, following `f` for `n` steps must revisit a node, so every component is a single cycle with trees hanging off it, all edges pointing toward the cycle. That is why the traversal from any node looks like the Greek letter rho: a straight tail, then a loop it never leaves.\n\nKey insight: the cycle is a property of the component, not of the start node. Every start in the same component lands on the same cycle; only the tail length `mu` differs.",
    "Floyd's tortoise-and-hare finds the meeting point first, then the tail. Advance `slow` one step and `fast` two steps until they collide inside the cycle. Then reset `slow` to the start and move both one step at a time — they meet exactly at the cycle entry, which gives `mu`. Walking once more around from there gives `lambda`.",
    "Brent's algorithm does the same job with fewer `f` evaluations. It keeps the tortoise parked while the hare walks a power-of-two budget; when the budget runs out the tortoise teleports to the hare and the budget doubles. It finds `lambda` directly, then recovers `mu` by starting two pointers `lambda` apart. Same O(mu + lambda) bound, roughly 25% fewer function calls, which matters when `f` is expensive (Pollard's rho, hash iteration).\n\nCommon mistake: initialising Floyd with `slow = fast = start`. They are already equal, so the loop exits immediately. Start them one and two steps in.",
    "For repeated k-th successor queries, precompute `up[b][v] = f^(2^b)(v)`. Decompose `k` into its binary bits and jump. Build cost is **O(n log K)** time and space where `K` is the largest `k`; each query is **O(log K)**. The alternative — computing `mu` and `lambda` per component and taking `k` modulo `lambda` once you are on the cycle — is O(n) memory but needs careful handling of `k < mu`.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Floyd and Brent: tail length mu and cycle length lambda",
      source: `#include <bits/stdc++.h>
using namespace std;

// f[v] is the unique successor of v. Returns {mu, lambda}.
pair<int, int> floydRho(const vector<int>& f, int start) {
    int slow = f[start], fast = f[f[start]];   // NOT both at start
    while (slow != fast) { slow = f[slow]; fast = f[f[fast]]; }

    int mu = 0;
    slow = start;
    while (slow != fast) { slow = f[slow]; fast = f[fast]; ++mu; }

    int lambda = 1;
    fast = f[slow];
    while (fast != slow) { fast = f[fast]; ++lambda; }
    return {mu, lambda};
}

pair<int, int> brentRho(const vector<int>& f, int start) {
    int power = 1, lambda = 1;
    int tortoise = start, hare = f[start];
    while (tortoise != hare) {
        if (power == lambda) {          // budget spent: teleport and double
            tortoise = hare;
            power <<= 1;
            lambda = 0;
        }
        hare = f[hare];
        ++lambda;
    }

    tortoise = hare = start;            // put hare exactly lambda ahead
    for (int i = 0; i < lambda; ++i) hare = f[hare];
    int mu = 0;
    while (tortoise != hare) { tortoise = f[tortoise]; hare = f[hare]; ++mu; }
    return {mu, lambda};
}`,
    },
    {
      language: "cpp",
      caption: "Successor queries by binary lifting: O(n log K) build, O(log K) query",
      source: `// up[b][v] = node reached from v after exactly 2^b steps.
vector<vector<int>> buildJump(const vector<int>& f, int LOG) {
    int n = (int)f.size();
    vector<vector<int>> up(LOG, vector<int>(n));
    up[0] = f;
    for (int b = 1; b < LOG; ++b)
        for (int v = 0; v < n; ++v)
            up[b][v] = up[b - 1][up[b - 1][v]];
    return up;
}

// k must satisfy k < 2^LOG.
int kthSuccessor(const vector<vector<int>>& up, int v, long long k) {
    for (int b = 0; b < (int)up.size(); ++b)
        if ((k >> b) & 1LL) v = up[b][v];
    return v;
}`,
    },
  ],
  diagrams: [
    {
      title: "Rho shape of a functional-graph walk",
      kind: "flow",
      caption: "A tail of mu steps feeds into a cycle of length lambda that the walk can never leave.",
      mermaid: `flowchart LR
    S["start"] --> T1["tail node"]
    T1 --> T2["tail node"]
    T2 --> E["cycle entry"]
    E --> C1["c1"]
    C1 --> C2["c2"]
    C2 --> C3["c3"]
    C3 --> E`,
    },
  ],
  cheatSheet: [
    "Out-degree 1 for every node: each component is one cycle plus in-trees.",
    "Floyd / Brent: O(mu + lambda) time, O(1) extra space.",
    "Floyd init must be `slow = f[start]`, `fast = f[f[start]]`.",
    "k-th successor table: O(n log K) time and space, O(log K) per query.",
    "On the cycle, k steps == (k mod lambda) steps — only after you pass the entry.",
  ],
  interviewQA: [
    {
      q: "In Floyd's cycle detection, why does resetting one pointer to the start and stepping both by one land exactly on the cycle entry?",
      a: "Let mu be the tail length and lambda the cycle length. When the pointers meet, the slow pointer has taken some number of steps t and the fast pointer 2t, so the difference t is a multiple of lambda. The meeting point is therefore t steps from the start and, equivalently, sits on the cycle at a position that is a whole number of laps ahead. Restarting one pointer at the start and advancing both one step at a time means after mu steps the restarted pointer reaches the entry, while the other has moved t + mu steps — also the entry, because t is a multiple of lambda. They collide there, and the step count is mu. Total work is O(mu + lambda) with O(1) memory.",
      followUps: ["When is Brent's variant preferable?", "How would you find the cycle for every node in O(n) total?"],
    },
    {
      q: "You must answer 10^5 queries of the form “node v, k steps forward” with k up to 10^18. What do you build?",
      a: "A binary-lifting table over the successor function: up[0] = f and up[b][v] = up[b-1][up[b-1][v]] for b up to about 60. Build is O(n log K) time and the same in space; each query decomposes k into bits and applies at most log K jumps, so O(log K) per query. If memory is tight, the alternative is one linear pass per component to record the cycle entry, mu and lambda, plus the cycle laid out as an array: then k steps is a walk of min(k, mu) tail steps followed by an index shift of (k - mu) mod lambda, giving O(n) memory and O(1) queries after O(n) preprocessing — at the cost of more fiddly edge cases when k is smaller than mu.",
    },
  ],
  flashcards: [
    { front: "Defining property of a functional graph?", back: "Every node has out-degree exactly 1, so each component is a single cycle with trees rooted on it." },
    { front: "Floyd tortoise-and-hare complexity?", back: "O(mu + lambda) time, O(1) extra space, where mu is the tail length and lambda the cycle length." },
    { front: "Cost of k-th successor queries via binary lifting?", back: "O(n log K) build time and space, O(log K) per query." },
  ],
};
