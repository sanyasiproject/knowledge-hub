import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subset Sum Problem",
      difficulty: "Easy",
      variation: "Boolean reachability, the bitset template",
      question: [
        "Given an array arr of non-negative integers and a value target, decide whether some subset of arr adds up to exactly target. Return true if such a subset exists, false otherwise. The empty subset sums to 0.",
        "Example 1:\nInput: arr = [3, 34, 4, 12, 5, 2], target = 9\nOutput: true\nExplanation: The subset [4, 5] adds up to 9.",
        "Example 2:\nInput: arr = [3, 34, 4, 12, 5, 2], target = 30\nOutput: false\nExplanation: Every subset that avoids 34 sums to at most 3+4+12+5+2 = 26, and every subset containing 34 sums to at least 34, so 30 is unreachable.",
        "Constraints:\n- 1 <= arr.size() <= 100\n- 0 <= arr[i] <= 1000\n- 0 <= target <= 100000",
      ],
      code: `bool isSubsetSum(vector<int>& arr, int target) {
    bitset<100001> dp;   // dp[s] == 1 means sum s is reachable so far
    dp[0] = 1;           // the empty subset
    for (int x : arr) dp |= dp << x;   // take x or do not take x, for all s at once
    return dp[target];
}`,
      explanation: [
        "The state is a set, not a number: dp is the set of sums reachable using a prefix of the array. Adding item x maps every reachable sum s to a new reachable sum s + x, and shifting the whole bitset left by x performs exactly that map for all s simultaneously. The OR keeps both branches - skip x (old bits) and take x (shifted bits).",
        "This is the same recurrence as the scalar version dp[s] = dp[s] || dp[s-x], and the shift is safe for the same reason the scalar loop must run downwards: dp << x is computed from the pre-update bitset, so one item is never used twice.",
        "The win is purely constant factor. A bitset processes 64 states per machine word operation, so a 100 x 100000 boolean table that would take 10^7 steps takes about 1.6 * 10^5 word operations. Nothing about the asymptotics changes, which is why bitset DP is the tool of choice when n * target is around 10^8 to 10^10 and hopeless otherwise.",
        "The trap: the bitset size must be a compile-time constant that covers the largest sum you will ever query, and it must be declared inside the function (or reset) if the routine is called more than once - a stale static bitset silently answers with a previous test case's reachability.",
        "Time: O(n * target / 64). Space: O(target / 64) words.",
      ],
    },
    {
      name: "Partition Equal Subset Sum",
      difficulty: "Medium",
      variation: "Equal partition, halve the total",
      link: "https://leetcode.com/problems/partition-equal-subset-sum/",
      question: [
        "Given an integer array nums, return true if you can split it into two subsets whose sums are equal, and false otherwise. Every element must land in exactly one of the two subsets.",
        "Example 1:\nInput: nums = [1, 5, 11, 5]\nOutput: true\nExplanation: [11] and [1, 5, 5] both sum to 11.",
        "Example 2:\nInput: nums = [1, 2, 3, 5]\nOutput: false\nExplanation: The total is 11, which is odd, so no split into two equal halves exists.",
        "Constraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 100",
      ],
      code: `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;              // an odd total can never split evenly
    bitset<10001> dp;                         // total <= 200 * 100, so half <= 10000
    dp[0] = 1;
    for (int x : nums) dp |= dp << x;
    return dp[total / 2];
}`,
      explanation: [
        "Two subsets with equal sums means one of them sums to total/2, and the other is forced to be the complement. So the two-subset question collapses to a single subset-sum feasibility query at target total/2.",
        "The parity check is not an optimisation, it is a correctness guard: with an odd total there is no integer target and dp[total/2] would answer a different question (it would test the floor of the half).",
        "Reachability only ever needs to be tracked up to total/2, so declaring bitset<10001> rather than bitset<20001> halves the word count. Sizing from the constraint bound rather than the actual total is fine because the extra high bits are never set.",
        "The tempting wrong turn is to sort and greedily fill one side up to total/2. Greedy fails on [1, 5, 11, 5]: taking 11 then 5 overshoots, taking 5, 5, 1 stalls at 11 only by luck, and on larger inputs it misses feasible splits outright. Subset sum has no greedy solution.",
        "Time: O(n * sum / 64), about 200 * 10000 / 64 word operations. Space: O(sum / 64).",
      ],
    },
    {
      name: "Money Sums",
      difficulty: "Medium",
      variation: "Enumerate every reachable sum",
      link: "https://cses.fi/problemset/task/1745",
      question: [
        "You have n coins with given values. Your task is to find all money sums you can create using these coins. Print the number of distinct positive sums, then the sums themselves in increasing order.",
        "Example 1:\nInput:\n4\n4 2 5 2\nOutput:\n9\n2 4 5 6 7 8 9 11 13\nExplanation: 2, 4 = 4 or 2+2, 5, 6 = 4+2, 7 = 5+2, 8 = 4+2+2, 9 = 4+5, 11 = 4+5+2 and 13 = 4+5+2+2 are reachable. 1, 3, 10 and 12 are not.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= coin value <= 1000\n- so the largest reachable sum is 100000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    const int MAXS = 100001;
    bitset<MAXS> dp;
    dp[0] = 1;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
        dp |= dp << x;
    }
    vector<int> sums;
    for (int s = 1; s <= total; s++) if (dp[s]) sums.push_back(s);   // total bounds the scan
    cout << sums.size() << "\\n";
    for (size_t i = 0; i < sums.size(); i++) cout << sums[i] << (i + 1 == sums.size() ? '\\n' : ' ');
    return 0;
}`,
      explanation: [
        "This is the subset-sum bitset with the query changed: instead of testing one bit you read out every set bit. The bitset is not just an accelerator here, it is the natural representation of the answer - the DP layer literally is the answer set.",
        "Scanning up to total rather than MAXS matters when the coins are small: no bit above total can be set, so the readout is O(total) instead of a fixed 10^5.",
        "A counting DP (how many subsets reach s) would need big integers or a modulus and answers a strictly harder question than asked. Whenever the output is a yes/no per state, drop the counts and keep bits.",
        "Note that dp.count() would give the number of reachable sums including 0, so the printed answer would be one too high. The problem asks for positive sums only.",
        "Time: O(n * total / 64) for the DP plus O(total) for the readout. Space: O(total / 64) words.",
      ],
    },
    {
      name: "Last Stone Weight II",
      difficulty: "Medium",
      variation: "Minimum achievable difference",
      link: "https://leetcode.com/problems/last-stone-weight-ii/",
      question: [
        "You are given an array stones where stones[i] is the weight of the i-th stone. Repeatedly pick any two stones x and y and smash them: if x == y both are destroyed, otherwise the stone of weight |x - y| remains. Return the smallest possible weight of the last remaining stone, or 0 if none remains.",
        "Example 1:\nInput: stones = [2, 7, 4, 1, 8, 1]\nOutput: 1\nExplanation: Signing the stones as +2 -7 +4 +1 +8 -1 gives a total of 7, and the complement group sums to 8, so a difference of 1 is achievable and nothing smaller is.",
        "Example 2:\nInput: stones = [31, 26, 33, 21, 40]\nOutput: 5\nExplanation: The total is 151. The best reachable subset sum not exceeding 75 is 73 = 33 + 40, so the answer is 151 - 2 * 73 = 5.",
        "Constraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 100",
      ],
      code: `int lastStoneWeightII(vector<int>& stones) {
    int total = accumulate(stones.begin(), stones.end(), 0);
    bitset<3001> dp;                 // total <= 30 * 100
    dp[0] = 1;
    for (int x : stones) dp |= dp << x;
    int best = 0;
    for (int s = total / 2; s >= 0; s--)   // largest reachable sum in the lower half
        if (dp[s]) { best = s; break; }
    return total - 2 * best;
}`,
      explanation: [
        "The smashing process is a disguise. Every sequence of smashes assigns each stone a final sign of + or -, and the surviving weight is the absolute value of the signed total; conversely any signing is realisable. So the task is to split the stones into two groups A and B minimising |sum(A) - sum(B)|.",
        "Writing s = sum(A) gives an objective of |total - 2s|, which is minimised by the reachable s closest to total/2 from below. That is why one downward scan from total/2 suffices - the first set bit found is optimal, and s = 0 always exists so the loop always terminates with an answer.",
        "The trap is a greedy simulation that always smashes the two heaviest stones. On [31, 26, 33, 21, 40] that yields 40-33=7, then 31-26=5, then 21-7=14, then 14-5=9, not 5. Locally largest cancellations are not globally optimal.",
        "Searching upwards from total/2 instead would also work by symmetry, but mixing the two directions and taking the closer value is redundant: s and total-s are both reachable exactly when the partition exists, so one side is enough.",
        "Time: O(n * total / 64). Space: O(total / 64) words.",
      ],
    },
    {
      name: "Coins (HDU 2844)",
      difficulty: "Medium",
      variation: "Bounded knapsack, binary splitting of counts",
      question: [
        "Whuacmers use coins of n distinct values A1..An and hold Ci coins of value Ai. They want to buy a watch priced at most m, and they refuse to receive change, so a price is payable only if it can be formed exactly by some multiset of the coins they hold. Count how many prices in the range 1..m are payable. The input contains several test cases and ends with a line holding two zeros.",
        "Example 1:\nInput:\n3 10\n1 2 4 2 1 1\n2 5\n1 4 2 1\n0 0\nOutput:\n8\n4\nExplanation: The first case holds coins 1, 1, 2, 4, which form 1, 2, 3, 4, 5, 6, 7 and 8 - eight prices at most 10. The second holds 1, 1, 4, which form 1, 2, 4 and 5 within the limit of 5.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= 100000\n- 1 <= Ai <= 100000\n- 1 <= Ci <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MAXM = 100001;
    int n, m;
    while (cin >> n >> m && (n || m)) {
        vector<int> a(n), c(n);
        for (int& x : a) cin >> x;
        for (int& x : c) cin >> x;
        bitset<MAXM> dp;
        dp[0] = 1;
        for (int i = 0; i < n; i++) {
            int left = c[i];
            for (int k = 1; left > 0; k <<= 1) {   // groups of size 1, 2, 4, ..., remainder
                int use = min(k, left);
                left -= use;
                long long shift = 1LL * a[i] * use;
                if (shift <= m) dp |= dp << (size_t)shift;   // bigger groups overshoot m
            }
        }
        int cnt = 0;
        for (int v = 1; v <= m; v++) if (dp[v]) cnt++;
        cout << cnt << "\\n";
    }
    return 0;
}`,
      explanation: [
        "A coin available Ci times is a bounded item, and shifting by Ai once only allows using it once. The fix is binary splitting: replace the Ci copies by groups of size 1, 2, 4, ... and a remainder. Any count from 0 to Ci is the sum of a subset of those group sizes, so treating each group as a single 0/1 item reproduces exactly the reachable set while turning Ci items into O(log Ci) shifts.",
        "That is the whole reason bitset beats the classic approach here. The textbook bounded-knapsack trick is a per-value sliding count array, which is O(n * m) scalar work - about 10^7 per test and far more across the many test cases. Binary splitting plus bitset is O(n * log C * m / 64), roughly 100 * 10 * 1563 word operations per test.",
        "Skipping a group whose shift already exceeds m is safe because a shift by more than m can only set bits above m, and those bits can never be shifted back down. Guarding it also avoids the integer overflow that 1LL is there to prevent when Ai and the group size are both large.",
        "The tempting wrong version is a plain unbounded loop, dp |= dp << Ai repeated Ci times or once for an unbounded coin. Unbounded coins would report prices that need more copies than the shoppers actually hold, and repeating the shift Ci times is correct but back to O(n * C * m / 64), which is 1000x slower than needed.",
        "Time: O(n * log C * m / 64) per test case. Space: O(m / 64) words.",
      ],
    },
    {
      name: "The Values You Can Make",
      difficulty: "Hard",
      variation: "Bitset per DP cell, two nested subset sums",
      link: "https://codeforces.com/problemset/problem/687/C",
      question: [
        "Pari has n coins with values c1..cn and must pay Arya exactly k using some subset of them. Before choosing that subset, she wants to know every value x such that some subset summing to exactly k contains a sub-subset summing to exactly x - in other words, every amount Arya could then hand back. Print the number of such values and the values in increasing order.",
        "Example 1:\nInput:\n6 18\n5 6 1 10 12 2\nOutput:\n16\n0 1 2 3 5 6 7 8 10 11 12 13 15 16 17 18\nExplanation: The subset [5, 1, 10, 2] sums to 18 and its sub-subsets already realise all sixteen listed values.",
        "Example 2:\nInput:\n3 50\n25 25 50\nOutput:\n3\n0 25 50\nExplanation: The subsets paying 50 are [25, 25], whose sub-subsets give 0, 25, 50, and [50], which gives 0 and 50.",
        "Constraints:\n- 1 <= n, k <= 500\n- 1 <= ci <= 500",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<bitset<501>> dp(k + 1);   // dp[j] = sub-sums achievable when the chosen coins total j
    dp[0][0] = 1;
    for (int i = 0; i < n; i++) {
        int c;
        cin >> c;
        if (c > k) continue;                       // a coin bigger than k is never chosen
        for (int j = k; j >= c; j--)               // downwards: use each coin at most once
            dp[j] |= dp[j - c] | (dp[j - c] << c); // coin goes to Arya, or stays with Pari
    }
    vector<int> vals;
    for (int x = 0; x <= k; x++) if (dp[k][x]) vals.push_back(x);
    cout << vals.size() << "\\n";
    for (size_t i = 0; i < vals.size(); i++) cout << vals[i] << (i + 1 == vals.size() ? '\\n' : ' ');
    return 0;
}`,
      explanation: [
        "Two sums must be tracked at once: the total of the chosen subset, which has to hit k, and the total of the sub-subset handed back, which is the thing being enumerated. A boolean table over both would be dp[j][x], size 501 * 501, so the natural move is to keep the second dimension as a bitset and let dp[j] be the whole set of achievable x for that j.",
        "When a coin of value c joins the chosen subset the outer sum grows by c, so the source cell is dp[j-c]. Inside that cell the coin either goes into the returned sub-subset, shifting every achievable x up by c, or it does not, leaving the set alone. Hence dp[j] |= dp[j-c] | (dp[j-c] << c) - the union of the two roles.",
        "The outer loop must descend over j for the usual 0/1-knapsack reason: an ascending loop would read a dp[j-c] that this same coin already updated and would spend the coin twice, wrongly reporting values such as 2c from a single coin.",
        "The trap is trying to answer with one flat subset-sum bitset. Reachability of x on its own is meaningless here, because x must be witnessed by a subset that is itself contained in a subset summing to exactly k; the outer constraint cannot be checked after the fact.",
        "Time: O(n * k * k / 64), about 500 * 500 * 8 word operations. Space: O(k * k / 64) words.",
      ],
    },
    {
      name: "Course Schedule IV",
      difficulty: "Medium",
      variation: "Transitive closure as a bitset per node",
      link: "https://leetcode.com/problems/course-schedule-iv/",
      question: [
        "There are numCourses courses labelled 0..numCourses-1. prerequisites[i] = [a, b] means course a must be taken before course b. A course a is a prerequisite of course c if a is a direct prerequisite of c or a is a prerequisite of some course that is a prerequisite of c. Given a list of queries [u, v], return a boolean array whose i-th entry says whether u is a prerequisite of v. The prerequisite graph is acyclic.",
        "Example 1:\nInput: numCourses = 2, prerequisites = [[1, 0]], queries = [[0, 1], [1, 0]]\nOutput: [false, true]\nExplanation: Course 1 must be taken before course 0, so 1 is a prerequisite of 0 but not the other way round.",
        "Example 2:\nInput: numCourses = 3, prerequisites = [[1, 2], [1, 0], [2, 0]], queries = [[1, 0], [1, 2]]\nOutput: [true, true]\nExplanation: Course 1 is a direct prerequisite of both 0 and 2.",
        "Constraints:\n- 2 <= numCourses <= 100\n- 0 <= prerequisites.length <= (numCourses * (numCourses - 1)) / 2\n- 1 <= queries.length <= 10^4",
      ],
      code: `vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites,
                                 vector<vector<int>>& queries) {
    int n = numCourses;
    vector<vector<int>> g(n);
    vector<int> indeg(n, 0);
    for (auto& e : prerequisites) {
        g[e[0]].push_back(e[1]);
        indeg[e[1]]++;
    }
    vector<int> order, stk;
    for (int v = 0; v < n; v++) if (!indeg[v]) stk.push_back(v);
    while (!stk.empty()) {                       // Kahn: topological order
        int u = stk.back(); stk.pop_back();
        order.push_back(u);
        for (int v : g[u]) if (--indeg[v] == 0) stk.push_back(v);
    }
    vector<bitset<100>> reach(n);
    for (int i = n - 1; i >= 0; i--) {           // reverse topological order
        int u = order[i];
        for (int v : g[u]) {
            reach[u].set(v);
            reach[u] |= reach[v];                // successors of v are final already
        }
    }
    vector<bool> ans;
    ans.reserve(queries.size());
    for (auto& q : queries) ans.push_back(reach[q[0]].test(q[1]));
    return ans;
}`,
      explanation: [
        "reach[u] is the set of nodes reachable from u, stored as one bit per node. The recurrence is set-valued: reach[u] is the union over out-edges u->v of {v} together with reach[v]. Unioning sets is exactly what OR on a bitset does, so an entire row of the transitive closure merges in n/64 word operations.",
        "Correctness comes from the processing order. Walking the topological order backwards guarantees every successor v of u has already been finalised, so no reach[u] is ever read before it is complete. This is a DP over a DAG, not a graph search - each edge is relaxed exactly once.",
        "The alternative is a BFS or DFS per query source, which is O(V + E) per distinct source and degenerates when queries repeat sources, or Floyd-Warshall style closure at O(V^3) = 10^6 here. The bitset closure is O(V * E / 64) and, more importantly, generalises to V in the tens of thousands where V^3 does not.",
        "Two easy mistakes: doing the sweep in forward topological order (reading incomplete rows and under-reporting), and forgetting reach[u].set(v) so that only paths of length two or more are recorded.",
        "Time: O(V * E / 64 + Q). Space: O(V^2 / 64) words.",
      ],
    },
    {
      name: "Reachable Nodes",
      difficulty: "Hard",
      variation: "Closure of a large DAG, batched bitset columns",
      link: "https://cses.fi/problemset/task/2138",
      question: [
        "A game consists of n levels and m teleporters between them. The teleporters form a directed acyclic graph. For every level, count how many levels are reachable from it, counting the level itself.",
        "Example 1:\nInput:\n5 6\n1 2\n1 3\n2 4\n3 4\n3 5\n4 5\nOutput:\n5 3 3 2 1\nExplanation: From level 1 everything is reachable. From 2 you reach 2, 4, 5. From 3 you reach 3, 4, 5. From 4 you reach 4, 5. From 5 only itself.",
        "Constraints:\n- 1 <= n <= 5 * 10^4\n- 1 <= m <= 10^5\n- the graph is acyclic",
      ],
      code: `const int B = 2048;   // number of target nodes handled per pass

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        indeg[b]++;
    }
    vector<int> order, stk;
    order.reserve(n);
    for (int v = 1; v <= n; v++) if (!indeg[v]) stk.push_back(v);
    while (!stk.empty()) {
        int u = stk.back(); stk.pop_back();
        order.push_back(u);
        for (int v : g[u]) if (--indeg[v] == 0) stk.push_back(v);
    }
    vector<long long> ans(n + 1, 0);
    vector<bitset<B>> reach(n + 1);
    for (int off = 1; off <= n; off += B) {          // one pass per block of targets
        for (int v = 1; v <= n; v++) reach[v].reset();
        for (int i = (int)order.size() - 1; i >= 0; i--) {
            int u = order[i];
            if (u - off >= 0 && u - off < B) reach[u].set(u - off);   // u reaches itself
            for (int v : g[u]) reach[u] |= reach[v];
        }
        for (int v = 1; v <= n; v++) ans[v] += (long long)reach[v].count();
    }
    for (int v = 1; v <= n; v++) cout << ans[v] << (v == n ? '\\n' : ' ');
    return 0;
}`,
      explanation: [
        "The DP is the same one-line closure as Course Schedule IV - reach[u] is the union of reach[v] over out-edges, swept in reverse topological order - but the full closure needs n^2 bits, and 5 * 10^4 squared is 2.5 * 10^9 bits, about 312 MB. That is the real difficulty of this problem: the algorithm is easy, the memory is not.",
        "The fix is to restrict each pass to a block of B target nodes. reach[u] then answers only 'which of these B targets does u reach', which is a correct sub-question because reachability of a target does not depend on which other targets are being tracked. Summing the popcounts over all ceil(n/B) passes gives the true count, with memory n * B bits instead of n^2.",
        "Setting the self bit before merging successors is what makes the count include u itself, and it must happen while u is being processed rather than afterwards, since predecessors of u read reach[u] later in the sweep.",
        "Total work is unchanged at O(n * m / 64) - the blocks trade one big pass for ceil(n/B) cheap ones - so B is a pure memory-versus-cache knob. Very small B wastes time re-walking the graph, very large B blows the limit; a couple of thousand keeps the working set comfortable.",
        "Do not reach for counting-based shortcuts such as summing child counts: reachable sets overlap, so ans[u] is not 1 plus the sum over children. Only the set union is correct, which is precisely why bits are needed.",
        "Time: O(n * m / 64 + n^2 / 64). Space: O(n * B / 64) words.",
      ],
    },
    {
      name: "Reachability Queries",
      difficulty: "Hard",
      variation: "General digraph: condensation plus batched closure",
      link: "https://cses.fi/problemset/task/2143",
      question: [
        "There are n nodes and m directed edges in a graph that may contain cycles. Answer q queries: for a given pair (a, b), can you get from node a to node b by following the edges? Print YES or NO for each query.",
        "Example 1:\nInput:\n4 3\n1 2\n2 3\n3 1\n4\n1 3\n3 2\n1 4\n4 1\nOutput:\nYES\nYES\nNO\nNO\nExplanation: Nodes 1, 2, 3 form a cycle so each of them reaches the other two. Node 4 has no edges at all, so it neither reaches nor is reached by anything.",
        "Constraints:\n- 1 <= n <= 5 * 10^4\n- 1 <= m, q <= 10^5",
      ],
      code: `const int B = 2048;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1), rg(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        rg[b].push_back(a);
    }
    // Kosaraju pass 1: iterative DFS, record nodes in order of finishing time
    vector<int> order, stk, it(n + 1, 0);
    vector<char> vis(n + 1, 0);
    order.reserve(n);
    for (int s = 1; s <= n; s++) {
        if (vis[s]) continue;
        vis[s] = 1;
        stk.push_back(s);
        while (!stk.empty()) {
            int u = stk.back();
            if (it[u] < (int)g[u].size()) {
                int v = g[u][it[u]++];
                if (!vis[v]) { vis[v] = 1; stk.push_back(v); }
            } else {
                order.push_back(u);
                stk.pop_back();
            }
        }
    }
    // Kosaraju pass 2 on the reverse graph; component ids come out topologically sorted
    vector<int> comp(n + 1, -1);
    int C = 0;
    for (int i = n - 1; i >= 0; i--) {
        int s = order[i];
        if (comp[s] != -1) continue;
        comp[s] = C;
        stk.push_back(s);
        while (!stk.empty()) {
            int u = stk.back(); stk.pop_back();
            for (int v : rg[u]) if (comp[v] == -1) { comp[v] = C; stk.push_back(v); }
        }
        C++;
    }
    vector<vector<int>> cg(C);
    for (int u = 1; u <= n; u++)
        for (int v : g[u]) if (comp[u] != comp[v]) cg[comp[u]].push_back(comp[v]);
    int q;
    cin >> q;
    vector<int> qa(q), qb(q);
    vector<char> res(q, 0);
    for (int i = 0; i < q; i++) cin >> qa[i] >> qb[i];
    vector<bitset<B>> reach(C);
    for (int off = 0; off < C; off += B) {
        for (int c = 0; c < C; c++) reach[c].reset();
        for (int c = C - 1; c >= 0; c--) {          // ids descend = reverse topological order
            if (c - off >= 0 && c - off < B) reach[c].set(c - off);
            for (int d : cg[c]) reach[c] |= reach[d];
        }
        for (int i = 0; i < q; i++) {
            int tb = comp[qb[i]] - off;
            if (tb >= 0 && tb < B && reach[comp[qa[i]]].test(tb)) res[i] = 1;
        }
    }
    for (int i = 0; i < q; i++) cout << (res[i] ? "YES" : "NO") << "\\n";
    return 0;
}`,
      explanation: [
        "Reachability is not a DAG DP until the cycles are gone. Every node of a strongly connected component reaches exactly the same set of nodes, so contracting each component to a single vertex loses nothing and produces a DAG on which the bitset closure applies. A query (a, b) becomes 'does comp[a] reach comp[b]', which is also correct when both endpoints land in the same component.",
        "Kosaraju is used rather than Tarjan for one concrete reason beyond taste: the component ids it produces are already a topological order of the condensation, so every edge runs from a smaller id to a larger one and the closure sweep is just a descending loop over ids - no second topological sort.",
        "Both DFS passes are written with an explicit stack. With n = 5 * 10^4 a recursive DFS on a path-shaped graph is a plausible stack overflow, and that failure mode looks like a wrong answer on the judge rather than an obvious bug.",
        "The batching is the same memory trick as Reachable Nodes, with the queries folded into each pass: a pass knows the truth only about targets in its own block, so every query is tested during the pass whose block contains its destination component. Each query is resolved exactly once, and res starts at 0 so untouched pairs correctly read NO.",
        "The trap is answering per query with a fresh BFS. With q = 10^5 and m = 10^5 that is 10^10 edge visits. The closure pays O(n * m / 64) once and then answers each query with a single bit test.",
        "Time: O(n + m) for the components plus O(C * m / 64) for the closure and O(q * C / B) for the query sweeps. Space: O(C * B / 64) words.",
      ],
    },
    {
      name: "Longest Common Subsequence",
      difficulty: "Hard",
      variation: "Bit-parallel LCS, whole DP row in one word chain",
      link: "https://leetcode.com/problems/longest-common-subsequence/",
      question: [
        "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is formed by deleting zero or more characters without reordering the rest; a common subsequence is a subsequence of both strings. Return 0 if there is none.",
        "Example 1:\nInput: text1 = 'abcde', text2 = 'ace'\nOutput: 3\nExplanation: The longest common subsequence is 'ace'.",
        "Example 2:\nInput: text1 = 'abc', text2 = 'def'\nOutput: 0\nExplanation: The two strings share no character at all.",
        "Constraints:\n- 1 <= text1.length, text2.length <= 1000\n- both strings consist of lowercase English letters",
      ],
      code: `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size();
    int W = (m + 63) / 64;
    unsigned long long lastMask = (m % 64) ? ((1ULL << (m % 64)) - 1) : ~0ULL;
    // match[c] marks the positions of character c inside text1
    vector<vector<unsigned long long>> match(26, vector<unsigned long long>(W, 0));
    for (int i = 0; i < m; i++) match[text1[i] - 'a'][i >> 6] |= 1ULL << (i & 63);
    vector<unsigned long long> V(W, ~0ULL), keep(W);
    V[W - 1] &= lastMask;                  // only the low m bits are meaningful
    for (char ch : text2) {
        const vector<unsigned long long>& M = match[ch - 'a'];
        for (int w = 0; w < W; w++) keep[w] = V[w] & ~M[w];   // from the pre-update V
        unsigned long long carry = 0;
        for (int w = 0; w < W; w++) {      // V = V + (V & M) as one big m-bit addition
            unsigned long long u = V[w] & M[w];
            unsigned long long s = V[w] + u;
            unsigned long long c1 = (s < V[w]);
            s += carry;
            c1 |= (s < carry);
            V[w] = s;
            carry = c1;
        }
        V[W - 1] &= lastMask;              // the carry out of bit m-1 is discarded
        for (int w = 0; w < W; w++) V[w] |= keep[w];
    }
    int ones = 0;
    for (int w = 0; w < W; w++) ones += __builtin_popcountll(V[w]);
    return m - ones;                       // zero bits count the LCS length
}`,
      explanation: [
        "Standard LCS is a two-dimensional DP whose row is monotone: dp[i][j] increases by 0 or 1 as j grows. Such a row is fully described by the positions where it steps up, so a row of m+1 numbers compresses into m bits - here V holds a 0 exactly where the row increments. Length is therefore the number of zero bits, and the whole row advances in W = m/64 word operations per character of text2.",
        "The update is Hyyro's identity: with U = V & match[c], the new row is (V + U) | (V & ~match[c]), truncated to m bits. The addition is doing the real work - a carry ripples across a run of set bits, which is exactly how one match position pushes the step of the DP row leftwards, and the OR restores the positions that character c cannot influence.",
        "Two details make or break the implementation. keep must be computed from the old V before the addition overwrites it, and the carry leaving bit m-1 must be dropped rather than allowed to set junk bits above m, since those bits would be counted by popcount and shrink the answer.",
        "Only the length survives this compression. If the actual subsequence is needed, or if per-cell values matter, fall back to the O(n * m) table - bit-parallel LCS gives a number, not a traceback.",
        "For 1000 by 1000 the plain table is already fast; the point of this version is the regime where n and m are tens of thousands and the 64x factor is what makes the problem fit in the time limit.",
        "Time: O(n * m / 64) plus O(26 * m / 64) for the match masks. Space: O(26 * m / 64) words.",
      ],
    },
  ],
};
