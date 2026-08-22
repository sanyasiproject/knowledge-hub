import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Beautiful Arrangement",
      difficulty: "Medium",
      variation: "The template: mask = set of used items, popcount = position",
      link: "https://leetcode.com/problems/beautiful-arrangement/",
      question: [
        "You have n integers labelled 1 through n. A permutation perm of these n integers is called beautiful if, for every 1-indexed position i, at least one of the following holds: perm[i] is divisible by i, or i is divisible by perm[i]. Return the number of beautiful arrangements.",
        "Example 1:\nInput: n = 2\nOutput: 2\nExplanation: Both permutations work. [1, 2]: 1 % 1 == 0 and 2 % 2 == 0. [2, 1]: 2 % 1 == 0 and 1 divides 2.",
        "Example 2:\nInput: n = 3\nOutput: 3\nExplanation: The valid permutations are [1, 2, 3], [2, 1, 3] and [3, 2, 1]. For instance [1, 3, 2] fails at position 2, since neither 3 % 2 nor 2 % 3 is zero.",
        "Constraints:\n- 1 <= n <= 15",
      ],
      code: `int countArrangement(int n) {
    vector<int> dp(1 << n, 0);
    dp[0] = 1;                                  // empty prefix: one way
    for (int mask = 0; mask < (1 << n); mask++) {
        if (!dp[mask]) continue;                // unreachable state, nothing to push
        int pos = __builtin_popcount(mask) + 1;  // the 1-indexed slot being filled next
        if (pos > n) continue;
        for (int v = 1; v <= n; v++) {
            if (mask >> (v - 1) & 1) continue;   // value v already placed
            if (v % pos && pos % v) continue;    // neither divides the other
            dp[mask | 1 << (v - 1)] += dp[mask];
        }
    }
    return dp[(1 << n) - 1];
}`,
      explanation: [
        "The state is a single integer mask whose bit v-1 says 'value v has already been placed'. That is the whole idea behind bitmask DP: a subset of at most about 20 items is small enough to be an array index, so 'which items have I used' becomes a plain O(1) lookup instead of a set you carry down a recursion.",
        "The second half of the state comes for free. Because every placement fills exactly one position, the number of positions already filled is __builtin_popcount(mask). So the position being decided is implied by the mask and does not need its own dimension. Recognising this popcount-implies-index trick is what turns a 2D table into a 1D one in every assignment-style problem.",
        "The transition is a case split on which value goes into position pos. Those cases are disjoint (different values) and exhaustive (some value must go there), so summing them counts every permutation exactly once. dp[full] is the answer because a full mask means all n positions were filled legally.",
        "The tempting wrong approach is plain backtracking over all n! permutations, which at n = 15 is 1.3 * 10^12 orderings. The DP collapses that because two different orders that used the same *set* of values have identical futures - the classic 'the future depends on the set, not the sequence' observation.",
        "Time: O(2^n * n) - each of 2^n masks pushes at most n outgoing edges. Space: O(2^n).",
      ],
    },
    {
      name: "Matching (AtCoder DP Contest O)",
      difficulty: "Medium",
      variation: "Counting perfect matchings in a bipartite graph",
      link: "https://atcoder.jp/contests/dp/tasks/dp_o",
      question: [
        "There are N men and N women. You are given an N x N compatibility matrix a, where a[i][j] is 1 if man i and woman j are compatible and 0 otherwise. Count the number of ways to pair every man with exactly one woman so that every pair is compatible. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\n0 1 1\n1 0 1\n1 1 0\nOutput: 2\nExplanation: Man i may not be paired with woman i, so the valid pairings are exactly the derangements of three elements: (1->2, 2->3, 3->1) and (1->3, 2->1, 3->2).",
        "Example 2:\nInput:\n4\n1 1 1 1\n1 1 1 1\n1 1 1 1\n1 1 1 1\nOutput: 24\nExplanation: Everyone is compatible with everyone, so every one of the 4! = 24 permutations is a valid matching.",
        "Constraints:\n- 1 <= N <= 21\n- a[i][j] is 0 or 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007;
    int n;
    cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> a[i][j];

    int full = 1 << n;
    vector<long long> dp(full, 0);
    dp[0] = 1;
    for (int mask = 0; mask < full; mask++) {
        if (!dp[mask]) continue;
        int i = __builtin_popcount(mask);   // men 0..i-1 are matched, man i is next
        if (i >= n) continue;
        for (int j = 0; j < n; j++) {
            if (mask >> j & 1) continue;    // woman j already taken
            if (!a[i][j]) continue;
            int nxt = mask | 1 << j;
            dp[nxt] = (dp[nxt] + dp[mask]) % MOD;
        }
    }
    cout << dp[full - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "The mask is the set of women already matched, and the popcount trick from the previous problem says the next man to process is index popcount(mask). Processing the men in a fixed order is what prevents double counting: a matching is counted once, in man-index order, rather than once per ordering of its pairs.",
        "The invariant is that dp[mask] counts the number of ways to match men 0..popcount(mask)-1 using exactly the women in mask. That is well defined precisely because the men consumed is a function of the mask, so no information is lost by dropping the man index from the state.",
        "The wrong-but-tempting alternative is to add a second dimension dp[i][mask] for 'man i, women mask'. It is not incorrect, just wasteful: every entry where i != popcount(mask) is unreachable, so you allocate n * 2^n cells to use 2^n of them.",
        "Note that the number of matchings can be huge (up to 21!), so everything is kept modulo 10^9 + 7 in long long. Accumulating into int overflows silently.",
        "Time: O(2^N * N). Space: O(2^N).",
      ],
    },
    {
      name: "Maximum Compatibility Score Sum",
      difficulty: "Medium",
      variation: "Assignment problem, maximise instead of count",
      link: "https://leetcode.com/problems/maximum-compatibility-score-sum/",
      question: [
        "There are m students and m mentors. Every student and every mentor answered n survey questions with 0 or 1, given as rows of the arrays students and mentors. The compatibility score of a student-mentor pair is the number of questions where their answers are equal. You must assign each student to exactly one mentor, and each mentor to exactly one student. Return the maximum possible sum of compatibility scores over all assignments.",
        "Example 1:\nInput: students = [[1,1,0],[1,0,1],[0,0,1]], mentors = [[1,0,0],[0,0,1],[1,1,0]]\nOutput: 8\nExplanation: Assign student 0 to mentor 2 (score 3), student 1 to mentor 0 (score 2) and student 2 to mentor 1 (score 3), for a total of 3 + 2 + 3 = 8.",
        "Example 2:\nInput: students = [[0,0],[0,0],[0,0]], mentors = [[1,1],[1,1],[1,1]]\nOutput: 0\nExplanation: No student agrees with any mentor on any question, so every assignment scores 0.",
        "Constraints:\n- m == students.length == mentors.length\n- n == students[i].length == mentors[j].length\n- 1 <= m, n <= 8\n- answers are 0 or 1",
      ],
      code: `int maxCompatibilitySum(vector<vector<int>>& students, vector<vector<int>>& mentors) {
    int m = students.size(), n = students[0].size();
    vector<vector<int>> score(m, vector<int>(m, 0));
    for (int i = 0; i < m; i++)                     // precompute all m*m pair scores once
        for (int j = 0; j < m; j++)
            for (int q = 0; q < n; q++)
                if (students[i][q] == mentors[j][q]) score[i][j]++;

    int full = 1 << m;
    vector<int> dp(full, -1);                       // -1 marks an unreachable mask
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] < 0) continue;
        int i = __builtin_popcount(mask);           // students 0..i-1 are assigned
        if (i >= m) continue;
        for (int j = 0; j < m; j++) {
            if (mask >> j & 1) continue;            // mentor j already used
            dp[mask | 1 << j] = max(dp[mask | 1 << j], dp[mask] + score[i][j]);
        }
    }
    return dp[full - 1];
}`,
      explanation: [
        "Structurally this is the previous problem with the summation operator swapped for a max. That is the single most useful observation about bitmask assignment DP: counting matchings, maximising a score and minimising a cost are the same recursion over the same state space, differing only in how sibling branches combine.",
        "Precomputing the score matrix matters more than it looks. Without it the inner transition would re-scan n answers, making the loop O(2^m * m * n); with it the transition is O(1) and the O(m^2 * n) precomputation is paid once.",
        "The greedy trap is real here: repeatedly pairing the globally best remaining student-mentor pair is wrong. In Example 1 the best single pair is student 0 with mentor 2 at 3, and student 2 with mentor 1 at 3 - greedy happens to work - but change one row and taking a locally best pair can lock out two better ones. Assignment problems have no exchange argument, which is exactly why they need DP (or Hungarian) rather than sorting.",
        "Using -1 as the unreachable marker is safe only because every score is non-negative, so a genuine dp value is never negative. When values can be negative, use a separate reachability flag or a very negative sentinel.",
        "Time: O(2^m * m + m^2 * n). Space: O(2^m + m^2).",
      ],
    },
    {
      name: "Partition to K Equal Sum Subsets",
      difficulty: "Medium",
      variation: "Mask plus a derived running remainder",
      link: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
      question: [
        "Given an integer array nums and an integer k, decide whether it is possible to split the array into exactly k non-empty subsets whose sums are all equal. Every element must be used in exactly one subset.",
        "Example 1:\nInput: nums = [4,3,2,3,5,2,1], k = 4\nOutput: true\nExplanation: The total is 20, so each subset must sum to 5. One valid split is (5), (1,4), (2,3) and (2,3).",
        "Example 2:\nInput: nums = [1,2,3,4], k = 3\nOutput: false\nExplanation: The total is 10, which is not divisible by 3, so equal sums are impossible.",
        "Constraints:\n- 1 <= k <= nums.length <= 16\n- 1 <= nums[i] <= 10^4\n- The sum of nums fits in a 32-bit signed integer",
      ],
      code: `bool canPartitionKSubsets(vector<int>& nums, int k) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % k) return false;
    int target = total / k, n = nums.size();
    sort(nums.begin(), nums.end());             // ascending, so the inner loop can break early
    if (nums.back() > target) return false;

    int full = 1 << n;
    vector<char> ok(full, 0);
    vector<int> rem(full, 0);                   // sum of the chosen items modulo target
    ok[0] = 1;
    for (int mask = 0; mask < full; mask++) {
        if (!ok[mask]) continue;
        for (int i = 0; i < n; i++) {
            if (mask >> i & 1) continue;
            if (rem[mask] + nums[i] > target) break;   // sorted: every later item is worse
            int nxt = mask | 1 << i;
            if (ok[nxt]) continue;
            ok[nxt] = 1;
            rem[nxt] = (rem[mask] + nums[i]) % target;
        }
    }
    return ok[full - 1];
}`,
      explanation: [
        "The key insight is that you do not need to remember which bucket each item went into, nor how many buckets are already closed. Fill the buckets one at a time: keep adding items to the current bucket until it reaches target, then it closes and the next item starts a fresh bucket. Under that discipline the only extra information needed is how full the current bucket is.",
        "And that extra number is not really extra state - it is a *function* of the mask. The sum of the items in mask is fixed, so the current bucket's load is always sum(mask) mod target. That is why rem is a plain lookup table and never conflicts: two different fill orders reaching the same mask agree on the remainder.",
        "The transition is 'add one unused item to the current bucket', legal only when it does not overflow target. Since nums is sorted ascending, the first item that overflows means every later one does too, so break rather than continue - a pruning that turns this from borderline into fast.",
        "The classic wrong approach is a greedy sort-descending-and-first-fit. It fails on cases like nums = [4,3,2,3,5,2,1], k = 4, where a locally sensible packing strands the leftovers. The other trap is forgetting the two cheap impossibility checks: total not divisible by k, and any single element exceeding target.",
        "Time: O(2^n * n). Space: O(2^n).",
      ],
    },
    {
      name: "Elevator Rides (CSES 1653)",
      difficulty: "Hard",
      variation: "Minimise groups, with a tie-breaking second component",
      link: "https://cses.fi/problemset/task/1653",
      question: [
        "There are n people who want to get to the top floor of a building. The elevator can carry a total weight of at most x. Given the weight of each person, find the minimum number of elevator rides needed to bring everybody up.",
        "Example 1:\nInput:\n4 10\n4 8 6 10\nOutput: 3\nExplanation: Ride one carries the people of weight 4 and 6 (total 10), ride two carries the person of weight 8, ride three carries the person of weight 10. No two of {8, 10} and no triple fits within 10 alongside anything else, so two rides are impossible.",
        "Example 2:\nInput:\n5 12\n5 5 5 5 5\nOutput: 3\nExplanation: At most two people (weight 10) fit in one ride, so five people need at least ceil(5 / 2) = 3 rides, and 2 + 2 + 1 achieves it.",
        "Constraints:\n- 1 <= n <= 20\n- 1 <= x <= 10^9\n- 1 <= w[i] <= x",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> w(n);
    for (auto &v : w) cin >> v;

    int full = 1 << n;
    vector<int> rides(full, n + 1);      // n + 1 is worse than any real answer
    vector<long long> last(full, 0);     // weight already loaded into the current ride
    rides[0] = 1;                        // one empty ride is standing open
    for (int mask = 1; mask < full; mask++) {
        for (int i = 0; i < n; i++) {
            if (!(mask >> i & 1)) continue;
            int prev = mask ^ (1 << i);              // person i boarded last
            int r = rides[prev];
            long long l = last[prev] + w[i];
            if (l > x) { r++; l = w[i]; }            // does not fit, send that ride up
            if (r < rides[mask] || (r == rides[mask] && l < last[mask])) {
                rides[mask] = r;                     // lexicographic minimum of the pair
                last[mask] = l;
            }
        }
    }
    cout << rides[full - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "The state is again a subset, but the value is a *pair*: the number of rides used, and how much weight sits in the ride currently being loaded. Minimising the pair lexicographically is the whole trick - among all ways to transport exactly the people in mask with the fewest rides, keep the one that leaves the last ride emptiest, because that leaves the most room for whoever boards next.",
        "That greedy-inside-the-DP step is correct because the future depends on the state only through those two numbers, and a smaller remaining load is never worse: any continuation valid from a fuller last ride is also valid from an emptier one with the same ride count. Without the tie-break the DP is simply wrong, not just slow.",
        "The transition considers which person boarded last. Adding w[i] either fits in the open ride, or forces that ride to depart and starts a new one containing only person i. Note w[i] <= x is guaranteed, so a person always fits somewhere.",
        "The tempting wrong approach is to enumerate partitions of the set into groups, each group a ride: that is a 3^n subset-of-subset DP and unnecessary here, because the pair state already encodes 'which group is still open'. Sorting people and doing first-fit greedily is also wrong - bin packing has no greedy optimum.",
        "Time: O(2^n * n). Space: O(2^n).",
      ],
    },
    {
      name: "Hamiltonian Flights (CSES 1690)",
      difficulty: "Hard",
      variation: "DP over (mask, last vertex) - the TSP shape",
      link: "https://cses.fi/problemset/task/1690",
      question: [
        "There are n cities and m one-way flight connections. Your task is to count the number of routes from city 1 to city n that visit every city exactly once. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n4 6\n1 2\n1 3\n2 3\n3 2\n2 4\n3 4\nOutput: 2\nExplanation: The two routes are 1 -> 2 -> 3 -> 4 and 1 -> 3 -> 2 -> 4. Both use only listed flights and touch all four cities once.",
        "Example 2:\nInput:\n3 3\n1 2\n2 3\n1 3\nOutput: 1\nExplanation: Only 1 -> 2 -> 3 works. Starting 1 -> 3 arrives at the destination city before city 2 has been visited, so that route can never be completed.",
        "Constraints:\n- 2 <= n <= 20\n- 1 <= m <= n^2\n- Flights are directed and there may be several flights between the same pair",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007;
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a - 1].push_back(b - 1);
    }

    int full = 1 << n;
    vector<vector<long long>> dp(full, vector<long long>(n, 0));
    dp[1][0] = 1;                                // standing in city 1, only city 1 visited
    for (int mask = 1; mask < full; mask++) {
        for (int v = 0; v < n; v++) {
            if (!dp[mask][v]) continue;
            if (v == n - 1) continue;            // city n must be the final stop, never left
            for (int u : adj[v]) {
                if (mask >> u & 1) continue;     // already visited
                int nxt = mask | 1 << u;
                dp[nxt][u] = (dp[nxt][u] + dp[mask][v]) % MOD;
            }
        }
    }
    cout << dp[full - 1][n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the canonical bitmask-DP state for path problems: dp[mask][v] = number of ways to start at city 1, visit exactly the cities in mask, and be standing at v. The vertex v genuinely has to be part of the state here, unlike in the assignment problems, because the legal next moves depend on where you are, not only on what you have used.",
        "Correctness rests on the same 'set, not sequence' argument. Two different orders that visited the same set and ended at the same city have identical sets of completions, so they can be merged into one counter. That is the compression from n! routes down to 2^n * n states.",
        "Handling the endpoint is where solutions go wrong. Rather than filtering at the end, simply never take an outgoing edge from city n: any route that reaches city n before the mask is full is a dead end, and refusing to leave city n prunes it automatically. Reading the answer as dp[full][n-1] then needs no extra checks.",
        "Two smaller traps. The counts must be reduced mod 10^9 + 7 in 64-bit arithmetic, since the raw number of Hamiltonian paths on 20 vertices vastly exceeds a 32-bit integer. And the input may contain a self-loop or repeated flights, so never assume the adjacency list is a clean set - the visited test handles a self-loop, but any per-vertex bookkeeping you add must tolerate duplicates.",
        "Time: O(2^n * n^2) in the worst case, since the adjacency lists total m <= n^2 edges scanned per mask. Space: O(2^n * n).",
      ],
    },
    {
      name: "Shortest Path Visiting All Nodes",
      difficulty: "Hard",
      variation: "Revisits allowed, so BFS over (mask, node)",
      link: "https://leetcode.com/problems/shortest-path-visiting-all-nodes/",
      question: [
        "You are given an undirected connected graph with n nodes labelled 0 to n-1, described by an adjacency list graph, where graph[i] lists the neighbours of node i. Return the length of the shortest walk that visits every node. You may start and stop at any node, you may revisit nodes, and you may reuse edges. The length is the number of edges traversed.",
        "Example 1:\nInput: graph = [[1,2,3],[0],[0],[0]]\nOutput: 4\nExplanation: Node 0 is a hub joined to 1, 2 and 3. The walk 1 -> 0 -> 2 -> 0 -> 3 uses four edges and touches all four nodes; three edges cannot, because leaving each leaf costs an edge and re-entering the hub costs another.",
        "Example 2:\nInput: graph = [[1],[0,2,4],[1,3],[2],[1,5],[4]]\nOutput: 6\nExplanation: The graph is a tree with edges 0-1, 1-2, 2-3, 1-4 and 4-5. The walk 3 -> 2 -> 1 -> 0 -> 1 -> 4 -> 5 uses 6 edges and touches all six nodes. On a tree the best covering walk costs 2 * (edges) - (longest path) = 2 * 5 - 4 = 6, the longest path being 3 - 2 - 1 - 4 - 5.",
        "Constraints:\n- n == graph.length\n- 1 <= n <= 12\n- The graph is connected and has no self-loops or repeated edges",
      ],
      code: `int shortestPathLength(vector<vector<int>>& graph) {
    int n = graph.size();
    if (n == 1) return 0;
    int full = 1 << n;
    vector<vector<char>> seen(full, vector<char>(n, 0));
    queue<pair<int, int>> q;                     // (visited mask, current node)
    for (int v = 0; v < n; v++) {                // every node is a legal start
        q.push({1 << v, v});
        seen[1 << v][v] = 1;
    }
    int steps = 0;
    while (!q.empty()) {
        int sz = q.size();                        // process one BFS layer at a time
        while (sz--) {
            auto [mask, v] = q.front();
            q.pop();
            if (mask == full - 1) return steps;
            for (int u : graph[v]) {
                int nm = mask | 1 << u;           // u may already be in mask: revisits allowed
                if (seen[nm][u]) continue;
                seen[nm][u] = 1;
                q.push({nm, u});
            }
        }
        steps++;
    }
    return -1;                                    // unreachable for a connected graph
}`,
      explanation: [
        "The state is the same (mask, node) pair as the TSP DP, but the transition graph now has cycles: moving to an already-visited node leaves the mask unchanged, so states can be revisited and there is no topological order to iterate in. Whenever a bitmask DP's transitions are not acyclic, the fix is to stop writing loops over masks and run a shortest-path search over the state graph instead.",
        "All edges cost 1, so plain BFS on the 2^n * n state nodes gives the answer: the first time any state with a full mask is dequeued, its layer index is the minimum number of edges. Because BFS visits states in non-decreasing distance, the seen array can be set at push time without risk of finding a shorter route later.",
        "Seeding the queue with all n single-node states is how 'start anywhere' is expressed. This is the multi-source BFS idea: adding a virtual source at distance 0 to every start costs nothing and avoids running n separate searches.",
        "The tempting wrong approach is a Hamiltonian-path DP that forbids revisits. That answers a different question and returns infinity on the star graph of Example 1, which has no Hamiltonian path at all yet is easily covered by a walk of length 4. The other trap is marking a node seen rather than a (mask, node) pair - node 0 in Example 1 must be entered three times.",
        "Time: O(2^n * n^2) - each of 2^n * n states is expanded once over at most n neighbours. Space: O(2^n * n).",
      ],
    },
    {
      name: "Find the Shortest Superstring",
      difficulty: "Hard",
      variation: "TSP path with edge weights plus route reconstruction",
      link: "https://leetcode.com/problems/find-the-shortest-superstring/",
      question: [
        "Given an array of strings words, return the shortest string that contains every word in words as a substring. No word in words is a substring of another. If several answers of the same minimum length exist, return any of them.",
        "Example 1:\nInput: words = [\"alex\",\"loves\",\"leetcode\"]\nOutput: \"alexlovesleetcode\"\nExplanation: No suffix of any word is a prefix of another, so nothing can overlap and the answer has length 4 + 5 + 8 = 17. Every permutation concatenated is equally short and equally acceptable.",
        "Example 2:\nInput: words = [\"catg\",\"ctaagt\",\"gcta\",\"ttca\",\"atgcatc\"]\nOutput: \"gctaagttcatgcatc\"\nExplanation: The order gcta, ctaagt, ttca, catg, atgcatc overlaps by 3, 1, 2 and 3 characters at the four joins, so the length is 4 + 6 + 4 + 4 + 7 - (3 + 1 + 2 + 3) = 25 - 9 = 16.",
        "Constraints:\n- 1 <= words.length <= 12\n- 1 <= words[i].length <= 20\n- words[i] consists of lowercase letters\n- No word is a substring of another word",
      ],
      code: `string shortestSuperstring(vector<string>& words) {
    int n = words.size();
    vector<vector<int>> ov(n, vector<int>(n, 0));   // ov[i][j] = longest suffix of i that is a prefix of j
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            int lim = min(words[i].size(), words[j].size());
            for (int k = lim; k > 0; k--)
                if (words[i].compare(words[i].size() - k, k, words[j], 0, k) == 0) { ov[i][j] = k; break; }
        }

    int full = 1 << n;
    const int NEG = -1000000000;
    vector<vector<int>> dp(full, vector<int>(n, NEG));   // max total overlap
    vector<vector<int>> par(full, vector<int>(n, -1));   // predecessor for reconstruction
    for (int i = 0; i < n; i++) dp[1 << i][i] = 0;
    for (int mask = 1; mask < full; mask++)
        for (int i = 0; i < n; i++) {
            if (dp[mask][i] == NEG) continue;
            for (int j = 0; j < n; j++) {
                if (mask >> j & 1) continue;
                int nm = mask | 1 << j;
                if (dp[mask][i] + ov[i][j] > dp[nm][j]) {
                    dp[nm][j] = dp[mask][i] + ov[i][j];
                    par[nm][j] = i;
                }
            }
        }

    int last = 0;
    for (int i = 1; i < n; i++) if (dp[full - 1][i] > dp[full - 1][last]) last = i;
    vector<int> order;
    for (int mask = full - 1, cur = last; cur != -1; ) {  // walk the parent pointers backwards
        order.push_back(cur);
        int p = par[mask][cur];
        mask ^= 1 << cur;
        cur = p;
    }
    reverse(order.begin(), order.end());

    string res = words[order[0]];
    for (size_t t = 1; t < order.size(); t++) res += words[order[t]].substr(ov[order[t - 1]][order[t]]);
    return res;
}`,
      explanation: [
        "First reduce the string problem to a graph problem. Since no word is a substring of another, an optimal superstring is exactly some permutation of the words glued together, and gluing word i then word j saves ov[i][j] characters. Total length is the fixed sum of word lengths minus the total saving, so minimising length is the same as maximising the sum of overlaps along a Hamiltonian path - a TSP path with weights ov.",
        "That reduction is the entire difficulty. Once stated, dp[mask][i] = best total overlap over an ordering that uses exactly the words in mask and ends with word i, and the transition appends an unused word j gaining ov[i][j]. Masks are processed in increasing order, which is a valid topological order because mask | (1 << j) is strictly greater than mask.",
        "Reconstruction needs parent pointers per state, not per word. Storing par[mask][i] and stripping bit i as you walk back is the standard idiom: the mask tells you which sub-state the pointer refers to, so the path is recovered in O(n) after the fact.",
        "The trap in computing ov is to test overlaps from short to long and stop at the first match, which yields the *shortest* overlap instead of the longest. Scan k downwards from min(len_i, len_j) and break on the first hit. Also note ov[i][i] is deliberately 0 and never used, since a word is placed once.",
        "Time: O(2^n * n^2) for the DP plus O(n^2 * L^2) for the overlap table, where L is the maximum word length. Space: O(2^n * n).",
      ],
    },
    {
      name: "Smallest Sufficient Team",
      difficulty: "Hard",
      variation: "Set cover: the mask is the goal, not the items",
      link: "https://leetcode.com/problems/smallest-sufficient-team/",
      question: [
        "You are given an array req_skills of required skills and a list people, where people[i] is the list of skills that person i has. Form a sufficient team: a set of people whose combined skills include every skill in req_skills. Return the indices of any smallest such team, in any order. It is guaranteed that a sufficient team exists.",
        "Example 1:\nInput: req_skills = [\"java\",\"nodejs\",\"reactjs\"], people = [[\"java\"],[\"nodejs\"],[\"nodejs\",\"reactjs\"]]\nOutput: [0,2]\nExplanation: Person 0 brings java and person 2 brings nodejs and reactjs, covering all three skills. No single person covers everything, so 2 is optimal.",
        "Example 2:\nInput: req_skills = [\"algorithms\",\"math\",\"java\",\"reactjs\",\"csharp\",\"aws\"], people = [[\"algorithms\",\"math\",\"java\"],[\"algorithms\",\"math\",\"reactjs\"],[\"java\",\"csharp\",\"aws\"],[\"reactjs\",\"csharp\"],[\"csharp\",\"math\"],[\"aws\",\"java\"]]\nOutput: [1,2]\nExplanation: Person 1 covers algorithms, math and reactjs; person 2 covers java, csharp and aws. Together that is all six skills.",
        "Constraints:\n- 1 <= req_skills.length <= 16\n- 1 <= people.length <= 60\n- Skill strings are distinct within req_skills and within each person\n- A sufficient team is guaranteed to exist",
      ],
      code: `vector<int> smallestSufficientTeam(vector<string>& req_skills, vector<vector<string>>& people) {
    int m = req_skills.size(), n = people.size();
    unordered_map<string, int> id;
    for (int i = 0; i < m; i++) id[req_skills[i]] = i;
    vector<int> pm(n, 0);                                  // each person compressed to a skill mask
    for (int i = 0; i < n; i++)
        for (auto &s : people[i]) {
            auto it = id.find(s);
            if (it != id.end()) pm[i] |= 1 << it->second;   // ignore skills nobody asked for
        }

    int full = 1 << m;
    const int INF = 1000000000;
    vector<int> dp(full, INF), who(full, -1), from(full, -1);
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] == INF) continue;
        for (int i = 0; i < n; i++) {
            int nxt = mask | pm[i];
            if (nxt == mask) continue;                      // person i adds no new skill
            if (dp[mask] + 1 < dp[nxt]) {
                dp[nxt] = dp[mask] + 1;
                who[nxt] = i;                               // person hired to get here
                from[nxt] = mask;                           // and the state we came from
            }
        }
    }
    vector<int> team;
    for (int mask = full - 1; mask > 0; mask = from[mask]) team.push_back(who[mask]);
    reverse(team.begin(), team.end());
    return team;
}`,
      explanation: [
        "The mask here indexes the *skills covered so far*, not the people used. That inversion is the point: there are up to 60 people (2^60 subsets, hopeless) but at most 16 skills (65536 masks). When one side of a problem is small, make that side the bitmask - the number of people only affects the branching factor.",
        "dp[mask] is the fewest people needed to cover exactly the skills in mask, and hiring one more person moves mask to mask | pm[i], a strict superset. Because the target is always a strictly larger mask, iterating masks in increasing numeric order is a valid evaluation order and no relaxation is ever missed.",
        "Skipping people who add nothing (nxt == mask) is what guarantees progress and also prunes the obviously useless hires. Skills a person has that are not in req_skills must be dropped when building pm, otherwise the mask width is wrong.",
        "Set cover is NP-hard in general, and the greedy 'hire whoever covers the most uncovered skills' heuristic is genuinely wrong here - it has a known log-factor gap. The exponential-in-skills DP is exact precisely because 2^16 is affordable.",
        "Reconstruction stores two arrays instead of a vector of names per mask. Keeping a vector<int> in every one of 65536 cells and copying it on each relaxation is the usual first attempt and it is both slower and heavier; a (person, previous mask) pair per state is enough to replay the answer.",
        "Time: O(2^m * n). Space: O(2^m + n).",
      ],
    },
    {
      name: "Parallel Courses II",
      difficulty: "Hard",
      variation: "Submask enumeration: many items per step",
      link: "https://leetcode.com/problems/parallel-courses-ii/",
      question: [
        "There are n courses labelled 1 to n. You are given relations, where relations[i] = [prev, next] means course prev must be taken before course next. In each semester you may take at most k courses, and you may take a course only if all of its prerequisites were taken in earlier semesters. Return the minimum number of semesters needed to take all n courses. The prerequisite graph is guaranteed to be acyclic.",
        "Example 1:\nInput: n = 4, relations = [[2,1],[3,1],[1,4]], k = 2\nOutput: 3\nExplanation: Take {2, 3} in semester one, {1} in semester two, {4} in semester three. Course 1 needs both 2 and 3 done first, and course 4 needs 1, so the chain forces three semesters.",
        "Example 2:\nInput: n = 5, relations = [[2,1],[3,1],[4,1],[1,5]], k = 2\nOutput: 4\nExplanation: Courses 2, 3 and 4 are prerequisites of course 1 but only two fit in a semester, so they need two semesters, then course 1, then course 5: {2,3}, {4}, {1}, {5}.",
        "Constraints:\n- 1 <= n <= 15\n- 1 <= k <= n\n- 1 <= relations.length <= n * (n - 1) / 2\n- The prerequisite graph is a DAG with no duplicate relations",
      ],
      code: `int minNumberOfSemesters(int n, vector<vector<int>>& relations, int k) {
    vector<int> pre(n, 0);
    for (auto &r : relations) pre[r[1] - 1] |= 1 << (r[0] - 1);   // prerequisite mask per course

    int full = 1 << n;
    vector<int> dp(full, n + 1);                                  // n + 1 marks unreachable
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] > n) continue;
        int avail = 0;
        for (int c = 0; c < n; c++)
            if (!(mask >> c & 1) && (pre[c] & mask) == pre[c]) avail |= 1 << c;   // unlocked, untaken
        for (int sub = avail; ; sub = (sub - 1) & avail) {         // every submask of avail
            if (__builtin_popcount(sub) <= k) dp[mask | sub] = min(dp[mask | sub], dp[mask] + 1);
            if (sub == 0) break;                                  // must run after the body
        }
    }
    return dp[full - 1];
}`,
      explanation: [
        "dp[mask] is the fewest semesters that finish exactly the courses in mask. What changes from the earlier problems is the transition: a semester takes a whole *group* of courses at once, so the DP must consider every subset of the currently unlocked courses of size at most k, not one course at a time.",
        "The submask loop sub = (sub - 1) & avail is the standard idiom for enumerating all subsets of a mask, and summed over all masks it costs 3^n rather than 4^n, because each of the n bits is independently in sub, in mask-but-not-sub, or in neither. At n = 15 that is about 14 million iterations, which is why 3^n is acceptable here and would not be at n = 20.",
        "The unlocked set is computed with (pre[c] & mask) == pre[c], the submask test: course c is available exactly when its prerequisite mask is contained in the set already finished. Only courses not yet taken are included, so dp never re-counts a course.",
        "The seductive wrong answer is greedy: each semester take the k available courses with the most dependents, or the highest depth. Both fail. Example 2 is the small witness for why any 'take as many as you can, prioritised by a local score' rule can be beaten - you sometimes must deliberately delay an available course so that a bottleneck's prerequisites finish together.",
        "Note the loop shape: the sub == 0 break comes after the body, otherwise the empty submask is skipped and the loop never terminates. Taking the empty subset is harmless since dp[mask] + 1 never improves dp[mask].",
        "Time: O(3^n + 2^n * n). Space: O(2^n).",
      ],
    },
    {
      name: "Grouping (AtCoder DP Contest U)",
      difficulty: "Hard",
      variation: "Partition a set into groups, canonical 3^n split",
      link: "https://atcoder.jp/contests/dp/tasks/dp_u",
      question: [
        "There are N rabbits numbered 1 to N. You are given a symmetric N x N matrix a where a[i][j] is the score gained if rabbits i and j end up in the same group, and a[i][i] = 0. Partition all N rabbits into one or more groups. The total score is the sum of a[i][j] over every unordered pair i, j that shares a group. Find the maximum possible total score.",
        "Example 1:\nInput:\n3\n0 10 10\n10 0 -10\n10 -10 0\nOutput: 10\nExplanation: Putting all three together scores 10 + 10 - 10 = 10. So does the partition {1,2}, {3}. Nothing beats 10, since the only positive pairs are (1,2) and (1,3) and keeping both forces the -10 pair as well.",
        "Example 2:\nInput:\n4\n0 5 5 -20\n5 0 5 -20\n5 5 0 -20\n-20 -20 -20 0\nOutput: 15\nExplanation: The partition {1,2,3}, {4} scores 5 + 5 + 5 = 15. Any group that contains rabbit 4 alongside another rabbit loses at least 20, so isolating rabbit 4 is optimal.",
        "Constraints:\n- 1 <= N <= 16\n- |a[i][j]| <= 10^9\n- a[i][j] == a[j][i] and a[i][i] == 0",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<long long>> a(n, vector<long long>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> a[i][j];

    int full = 1 << n;
    vector<long long> val(full, 0);          // score if this whole mask is one single group
    for (int mask = 0; mask < full; mask++)
        for (int i = 0; i < n; i++) {
            if (!(mask >> i & 1)) continue;
            for (int j = i + 1; j < n; j++)
                if (mask >> j & 1) val[mask] += a[i][j];
        }

    vector<long long> dp(full, 0);
    for (int mask = 1; mask < full; mask++) {
        dp[mask] = val[mask];                            // base case: keep mask as one group
        int low = mask & -mask;                          // lowest set bit of mask
        for (int sub = (mask - 1) & mask; sub; sub = (sub - 1) & mask) {
            if (!(sub & low)) continue;                  // fix the lowest element into sub
            dp[mask] = max(dp[mask], dp[sub] + dp[mask ^ sub]);
        }
    }
    cout << dp[full - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the general 'partition a set into groups' DP, the last shape in the bitmask family. dp[mask] is the best score achievable by partitioning exactly the elements of mask, and the transition splits mask into a first group sub and the rest mask ^ sub, recursing on both halves.",
        "Correctness needs one extra idea: without a canonical rule, every partition is found many times (once per ordering of its groups) and, worse, the split is symmetric so the recursion could bounce. Forcing the lowest set bit of mask to belong to sub makes each split unique - given a partition, sub is determined as the single group containing the smallest element. The result is still a maximum, but each partition is generated once and the recursion is strictly decreasing.",
        "val[mask] is the score of putting the whole mask in one group, and it doubles as the base case of the DP. Computing it directly is O(2^n * n^2); it can be built in O(2^n * n) by taking val[mask] = val[mask without its lowest bit i] plus the sum of a[i][j] over j in the rest, but at n = 16 either is fine.",
        "The trap is assuming the answer is either 'all together' or 'all alone'. Example 2 is the counterexample: the optimum is a genuine intermediate partition. A second trap is 32-bit overflow - with |a| up to 10^9 and 120 pairs the total reaches 10^11, so val and dp must be long long.",
        "dp[0] = 0 is the correct base for the empty set, and initialising all of dp to 0 is safe here only because the recursion always overwrites dp[mask] with val[mask] first; a max-DP over possibly negative values must never start from an implicit 0 floor.",
        "Time: O(3^N + 2^N * N^2). Space: O(2^N).",
      ],
    },
  ],
};
