import type { TopicContent } from "../types";

export const smallToLarge: TopicContent = {
  quickSummary: [
    "When merging two auxiliary containers, always **move the smaller one into the larger** and swap the handles — never blindly copy the left into the right.",
    "Each element is moved only when its container at least doubles, so it moves at most `log n` times: **O(n log n)** total moves, **O(n)** live memory.",
    "Canonical use: bottom-up merging of per-subtree sets, for example counting **distinct colours in every subtree** in O(n log^2 n) with `std::set`.",
  ],
  detailed: [
    "The bound is a charging argument, not a recurrence. Charge the cost of a merge to the elements that actually move — the ones from the smaller side. An element only moves when the container holding it merges into one at least as large, so the container it lives in at least doubles in size. A container can double at most `log2 n` times before it holds all `n` elements, so each element is moved at most `log n` times and total movement is O(n log n), regardless of the tree's shape.",
    "The swap is what makes it correct and cheap. `std::set`, `std::map` and `unordered_set` all swap in O(1) because only internal pointers change. Swapping the child's container into the parent's slot when the child is bigger costs nothing and keeps the invariant that we always iterate the smaller side.\n\nCommon mistake: comparing sizes but still iterating the container you were about to keep. After `if (s[v].size() > s[u].size()) s[u].swap(s[v]);` the smaller set is *always* `s[v]`, so the insertion loop must read from `s[v]` and write into `s[u]`.",
    "Mind the log factor in the container itself. Moving an element into a `std::set` costs O(log n), so distinct-colour counting is O(n log^2 n) time; an `unordered_set` or a hash map brings it to O(n log n) expected. Memory stays O(n) as long as each merged-away container is cleared, because at any moment the live containers partition the elements.\n\nIn practice: for problems where you only need per-subtree counts and can process queries offline, DSU-on-tree (small-to-large over the heavy child) does the same work with a single shared counter array and no per-node containers — same O(n log n), much smaller constant.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Distinct colours in every subtree via small-to-large set merging",
      source: `#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<int>> adj;
vector<int> colour, ans;
vector<set<int>> s;          // s[u] holds the colours of u's subtree

void dfs(int u, int p) {
    s[u].insert(colour[u]);
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs(v, u);
        if (s[v].size() > s[u].size()) s[u].swap(s[v]);   // O(1) handle swap
        for (int c : s[v]) s[u].insert(c);                // iterate the SMALL one
        s[v].clear();                                     // keep memory at O(n)
    }
    ans[u] = (int)s[u].size();
}

// dfs(0, -1);  ->  ans[u] = number of distinct colours in subtree of u
// Time O(n log^2 n) with std::set, O(n log n) expected with unordered_set.`,
    },
    {
      language: "cpp",
      caption: "Generic count-map merge: most frequent value per subtree",
      source: `vector<map<int, int>> cnt;      // value -> occurrences in the subtree
vector<int> bestVal, bestCnt;

void dfsCounts(int u, int p) {
    cnt[u][colour[u]] = 1;
    bestVal[u] = colour[u];
    bestCnt[u] = 1;

    for (int v : adj[u]) {
        if (v == p) continue;
        dfsCounts(v, u);
        if (cnt[v].size() > cnt[u].size()) {
            cnt[u].swap(cnt[v]);
            swap(bestVal[u], bestVal[v]);
            swap(bestCnt[u], bestCnt[v]);
        }
        for (auto [val, c] : cnt[v]) {
            int total = (cnt[u][val] += c);
            if (total > bestCnt[u] || (total == bestCnt[u] && val < bestVal[u])) {
                bestCnt[u] = total;
                bestVal[u] = val;
            }
        }
        cnt[v].clear();
    }
}

// NOTE: the running best must be recomputed against merged totals, as above --
// carrying only the child's best without re-checking would be wrong.`,
    },
  ],
  cheatSheet: [
    "Rule: `if (small.size() > big.size()) small.swap(big);` then drain `small` into `big`.",
    "Total element moves O(n log n); each move doubles the owning container.",
    "With `std::set`: O(n log^2 n) time. With a hash set: O(n log n) expected.",
    "Live memory O(n) only if you `clear()` the merged-away container.",
    "DSU-on-tree is the same idea with one global counter array and a smaller constant.",
  ],
  interviewQA: [
    {
      q: "Prove the O(n log n) bound for small-to-large merging.",
      a: "Charge each unit of work to the element that moves. An element is only ever copied out of the smaller of the two containers being merged, so immediately after the merge it lives in a container of size at least twice the one it came from. Starting from size 1, an element's container can double at most log2 n times before reaching size n, so any single element is moved at most log n times. Summing over all n elements gives O(n log n) moves in total, independent of the tree's shape — a path and a star both hit the same bound. Multiply by the per-insertion cost of the container: O(log n) for std::set gives O(n log^2 n), O(1) expected for a hash set gives O(n log n).",
      followUps: ["Where does the bound break if you skip the size comparison?", "How does DSU-on-tree reduce the constant?"],
    },
    {
      q: "What goes wrong if you merge the larger container into the smaller one?",
      a: "The charging argument disappears — an element can be moved without its container growing, so there is no doubling to bound the number of moves. The worst case becomes quadratic: consider a caterpillar tree where you repeatedly fold a large accumulated set into a fresh singleton, moving the whole set at every step for O(n^2) work. The fix is one line, the size comparison plus an O(1) swap of the two handles, which costs nothing because standard containers swap by exchanging internal pointers. The subtle version of the same bug is comparing sizes correctly but then iterating the wrong variable afterwards, which silently reintroduces the quadratic behaviour while still producing correct answers.",
    },
  ],
  flashcards: [
    { front: "Small-to-large merging rule?", back: "Swap so the larger container stays, then iterate the smaller one into it — O(1) swap, elements only ever move out of the smaller side." },
    { front: "Why is small-to-large O(n log n) moves?", back: "Each move at least doubles the size of the container holding that element, and doubling can happen at most log n times per element." },
    { front: "Distinct colours per subtree: complexity?", back: "O(n log^2 n) time with std::set (O(n log n) with a hash set), O(n) live memory if merged sets are cleared." },
  ],
};
