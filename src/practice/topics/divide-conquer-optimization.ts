import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Allocate Mailboxes",
      difficulty: "Medium",
      variation: "Layered DP baseline, O(k*n^2) transitions",
      link: "https://leetcode.com/problems/allocate-mailboxes/",
      question: [
        "Given an array houses where houses[i] is the position of the i-th house on a street, and an integer k, allocate k mailboxes on the street. The cost of an allocation is the sum, over all houses, of the distance from that house to its nearest mailbox. Return the minimum total cost. Answers fit in a 32-bit integer.",
        "Solve it with the plain layered DP first: dp[t][j] is the cheapest way to serve the first j houses with t mailboxes. This is the shape that divide and conquer optimisation later speeds up, so it is worth writing out once by hand.",
        "Example 1:\nInput: houses = [1,4,8,10,20], k = 3\nOutput: 5\nExplanation: put mailboxes at 1, 9 and 20. House 1 pays 0, houses 8 and 10 pay 1 each, house 4 pays 3, house 20 pays 0, for a total of 5.",
        "Example 2:\nInput: houses = [2,3,5,12,18], k = 2\nOutput: 9\nExplanation: one mailbox at 3 serves 2, 3, 5 for a cost of 1 + 0 + 2 = 3; one mailbox at 12 (or anywhere in [12,18]) serves 12 and 18 for a cost of 6. Total 9.",
        "Constraints:\n- 1 <= k <= houses.length <= 100\n- 1 <= houses[i] <= 10^4\n- all house positions are distinct",
      ],
      code: `class Solution {
public:
    int minDistance(vector<int>& houses, int k) {
        sort(houses.begin(), houses.end());
        int n = houses.size();
        const int INF = 1e9;

        // cost[i][j] = distance total when ONE mailbox serves houses i..j.
        // The optimum for a 1D median problem is any median of the block.
        vector<vector<int>> cost(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                int med = houses[(i + j) / 2];
                for (int t = i; t <= j; t++) cost[i][j] += abs(houses[t] - med);
            }

        // dp[t][j] = cheapest way to serve the first j houses with t mailboxes.
        vector<vector<int>> dp(k + 1, vector<int>(n + 1, INF));
        dp[0][0] = 0;
        for (int t = 1; t <= k; t++)
            for (int j = 1; j <= n; j++)
                for (int i = t - 1; i < j; i++)          // i = houses handed to the first t-1 boxes
                    if (dp[t - 1][i] < INF)
                        dp[t][j] = min(dp[t][j], dp[t - 1][i] + cost[i][j - 1]);
        return dp[k][n];
    }
};`,
      explanation: [
        "Two facts turn this into a layered partition DP. First, once the houses are sorted, every mailbox serves a contiguous block: if a mailbox served houses 1 and 3 but not 2, moving house 2 to that same mailbox could only shorten its walk. So an allocation is exactly a split of the sorted array into k consecutive blocks. Second, the cheapest single mailbox for a fixed block sits at a median of the block, so the block cost is a number we can precompute.",
        "State: dp[t][j] = minimum cost for the first j houses using t mailboxes. Transition: dp[t][j] = min over i < j of dp[t-1][i] + cost(i+1, j). Layer t only reads layer t-1, which is the structural property the whole pattern depends on.",
        "The tempting wrong move is to place mailboxes greedily at the k largest gaps, or to place them at the mean rather than the median. The mean minimises squared distance, the median minimises absolute distance - swapping them silently loses on inputs like [1, 2, 100].",
        "This form costs O(k*n^2) transitions, which is fine at n = 100 but dies at n = 3000. The next problems show how to replace the inner scan with a divide and conquer that exploits monotonicity of the best split.",
        "Time: O(n^2 + k*n^2). Space: O(n^2 + k*n).",
      ],
    },
    {
      name: "Subarray Squares",
      difficulty: "Medium",
      variation: "The divide and conquer optimisation template",
      link: "https://cses.fi/problemset/task/2086",
      question: [
        "You are given an array of n positive integers. Divide it into exactly k non-empty consecutive subarrays. The cost of a subarray is the square of the sum of its elements, and the total cost is the sum of those squares. Print the minimum possible total cost.",
        "The input is a first line with n and k, then a line with the n array values.",
        "Example 1:\nInput:\n5 2\n1 2 3 4 5\nOutput: 117\nExplanation: the four splits give 1^2 + 14^2 = 197, 3^2 + 12^2 = 153, 6^2 + 9^2 = 117 and 10^2 + 5^2 = 125. The best is [1,2,3] and [4,5] at 117.",
        "Example 2:\nInput:\n4 3\n1 1 1 1\nOutput: 6\nExplanation: any split into three parts has one block of size 2 and two of size 1, giving 4 + 1 + 1 = 6.",
        "Constraints:\n- 1 <= k <= n <= 3000\n- 1 <= x_i <= 10^5\n- the answer needs 64-bit arithmetic",
      ],
      code: `int n, k;
vector<long long> pre, prv, cur;
const long long INF = (long long)4e18;

// cost of the block a..b (1-indexed), the square of its sum
long long C(int a, int b) {
    long long s = pre[b] - pre[a - 1];
    return s * s;
}

// Fill cur[lo..hi] knowing every optimal split of those rows lies in [optLo, optHi].
void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;                 // layer t-1 cannot end at i
        long long val = prv[i] + C(i + 1, mid);
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);              // rows below mid split at most at bestI
    compute(mid + 1, hi, bestI, optHi);              // rows above mid split at least at bestI
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> k;
    pre.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        pre[i] = pre[i - 1] + x;
    }
    prv.assign(n + 1, INF);
    prv[0] = 0;                                      // zero blocks cover zero elements
    for (int t = 1; t <= k; t++) {
        cur.assign(n + 1, INF);
        compute(1, n, 0, n - 1);
        prv.swap(cur);
    }
    cout << prv[n] << "\\n";
    return 0;
}`,
      explanation: [
        "State and transition are the same partition DP as before: dp[t][j] = min over i < j of dp[t-1][i] + C(i+1, j), with C(a,b) the squared block sum read off a prefix-sum array in O(1).",
        "The speedup rests on one property of C. For a <= b <= c <= d the quadrangle inequality C(a,c) + C(b,d) <= C(a,d) + C(b,c) holds here, because C is a convex function (x squared) of the block sum and widening the outer block while narrowing the inner one only spreads the two sums further apart. A cost with that property forces opt[t][j], the best split point for row j, to be non-decreasing in j.",
        "Divide and conquer exploits exactly that. Compute row mid of the current layer by scanning its whole allowed window, record where the optimum landed, then recurse left with the window capped above by that position and right with it capped below. Each of the log n recursion levels scans a total of O(n) candidates, so a layer costs O(n log n) instead of O(n^2).",
        "Two traps. First, applying this to a cost that does not satisfy the inequality (block maximum, block average, anything non-convex) gives wrong answers on some inputs and correct ones on most, which is the worst kind of bug - verify the inequality or verify against the O(k*n^2) DP on small random inputs. Second, the recursion must read a frozen previous layer: writing cur into prv as you go breaks the argument because the transition would then depend on values from the same layer.",
        "The window bound is inclusive on both sides: rows left of mid may still split exactly at bestI, and rows right of mid may too. Using bestI - 1 and bestI + 1 loses the optimum whenever several rows share a split point.",
        "Time: O(k*n log n). Space: O(n).",
      ],
    },
    {
      name: "Allocate Mailboxes (Divide and Conquer)",
      difficulty: "Medium",
      variation: "Retrofitting D&C onto a known layered DP",
      link: "https://leetcode.com/problems/allocate-mailboxes/",
      question: [
        "Same problem as Allocate Mailboxes: houses[i] is a position on a street, k mailboxes must be placed, and you must minimise the sum over houses of the distance to the nearest mailbox. This time replace the O(k*n^2) inner scan with divide and conquer optimisation, so the same code would still run if n were 3000 instead of 100.",
        "Example 1:\nInput: houses = [1,4,8,10,20], k = 3\nOutput: 5",
        "Example 2:\nInput: houses = [2,3,5,12,18], k = 2\nOutput: 9",
        "Constraints:\n- 1 <= k <= houses.length <= 100\n- 1 <= houses[i] <= 10^4",
      ],
      code: `class Solution {
    int n;
    static const int INF = 1000000000;
    vector<vector<int>> cost;
    vector<int> prv, cur;

    void compute(int lo, int hi, int optLo, int optHi) {
        if (lo > hi) return;
        int mid = (lo + hi) / 2, bestI = optLo, best = INF;
        for (int i = optLo; i <= min(mid - 1, optHi); i++) {
            if (prv[i] >= INF) continue;
            int val = prv[i] + cost[i][mid - 1];     // block is houses i..mid-1 (0-indexed)
            if (val < best) { best = val; bestI = i; }
        }
        cur[mid] = best;
        compute(lo, mid - 1, optLo, bestI);
        compute(mid + 1, hi, bestI, optHi);
    }

public:
    int minDistance(vector<int>& houses, int k) {
        sort(houses.begin(), houses.end());
        n = houses.size();
        cost.assign(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                int med = houses[(i + j) / 2];
                for (int t = i; t <= j; t++) cost[i][j] += abs(houses[t] - med);
            }
        prv.assign(n + 1, INF);
        prv[0] = 0;
        for (int t = 1; t <= k; t++) {
            cur.assign(n + 1, INF);
            compute(1, n, 0, n - 1);
            prv.swap(cur);
        }
        return prv[n];
    }
};`,
      explanation: [
        "Nothing about the model changes - only the way each layer is filled. That is the point: divide and conquer optimisation is a drop-in replacement for the inner loop of any dp[t][j] = min over i of dp[t-1][i] + C(i+1, j) whose cost satisfies the quadrangle inequality.",
        "Here C(a,b) is the sum of distances from the houses a..b to their median. It satisfies the inequality because widening a block can only add non-negative distance and the median cost is concave-free in the required sense; concretely, the optimal split for j houses never moves left when j grows, since the last block only ever needs to swallow more houses as the street gets longer.",
        "The candidate window is capped by min(mid - 1, optHi) rather than optHi alone. The block ending at mid must be non-empty, so the split index can never reach mid, and forgetting that cap reads cost[mid][mid-1] out of range.",
        "The remaining O(n^2) term is the precomputed cost table, not the DP. At n = 3000 that table no longer fits, and you would instead compute the median cost of a block in O(1) from prefix sums - the DP part is already fast enough.",
        "Time: O(n^2 + k*n log n). Space: O(n^2).",
      ],
    },
    {
      name: "Post Office",
      difficulty: "Hard",
      variation: "k-medians on a line",
      link: "http://poj.org/problem?id=1160",
      question: [
        "A straight highway has V villages at given increasing positions. You must build P post offices, each located in one of the villages, so that the sum over all villages of the distance from the village to its nearest post office is as small as possible. Print that minimum total distance.",
        "Input is V and P, followed by the V village positions.",
        "Example 1:\nInput:\n10 5\n1 2 3 6 7 9 11 22 44 50\nOutput: 9\nExplanation: the optimal blocks are {1,2,3} served from 2 for a cost of 1 + 0 + 1 = 2, {6,7,9,11} served from 7 for a cost of 1 + 0 + 2 + 4 = 7, and then {22}, {44}, {50} each with their own office for 0. Total 9.",
        "Example 2:\nInput:\n5 2\n1 2 3 4 5\nOutput: 3\nExplanation: the blocks {1,2} and {3,4,5} cost 1 + 2 = 3, which no other split beats.",
        "Constraints:\n- 1 <= P <= V <= 300\n- 1 <= position <= 10000, positions strictly increasing",
      ],
      code: `int V, P;
vector<long long> x, W, prv, cur;
const long long INF = (long long)4e18;

int idx(int i, int j) { return i * (V + 2) + j; }

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;
        long long val = prv[i] + W[idx(i + 1, mid)];
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);
    compute(mid + 1, hi, bestI, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> V >> P;
    x.assign(V + 1, 0);
    for (int i = 1; i <= V; i++) cin >> x[i];

    // W[i][j] = cost of serving villages i..j from their median
    W.assign((V + 2) * (V + 2), 0);
    for (int i = 1; i <= V; i++)
        for (int j = i; j <= V; j++) {
            long long med = x[(i + j) / 2], s = 0;
            for (int t = i; t <= j; t++) s += llabs(x[t] - med);
            W[idx(i, j)] = s;
        }

    prv.assign(V + 1, INF);
    prv[0] = 0;
    for (int t = 1; t <= P; t++) {
        cur.assign(V + 1, INF);
        compute(1, V, 0, V - 1);
        prv.swap(cur);
    }
    cout << prv[V] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the original k-medians-on-a-line problem, and it is where the monotone-split idea is easiest to believe. Villages served by one office form a contiguous run, so the answer is a split of the sorted positions into P blocks, each charged its median cost.",
        "Why the optimal split is monotone: suppose the best last block for j villages starts at s, and now consider j + 1 villages. Starting the last block earlier than s would mean the earlier offices cover fewer villages than they did when the street was shorter, which by the exchange argument on the quadrangle inequality can never help. So opt is non-decreasing and the divide and conquer window is valid.",
        "The trap is thinking that offices should be spread evenly, or that the block boundaries fall at the largest gaps. Neither is true: {22, 44} sitting together in one block costs 11, which is still better than spending one of the five offices on it in some configurations. Only the DP knows.",
        "The cost table is O(V^2) memory, fine at V = 300; a flat vector is used instead of a vector of vectors purely to keep the allocation cheap. For large V, replace the table with prefix sums so W(i,j) is O(1).",
        "Time: O(V^2 + P*V log V). Space: O(V^2).",
      ],
    },
    {
      name: "Leaves",
      difficulty: "Hard",
      variation: "Sweeping cost from two prefix sums",
      link: "https://www.spoj.com/problems/NKLEAVES/",
      question: [
        "There are n piles of leaves standing at positions 1, 2, ..., n along a line; pile i contains a_i leaves. You may sweep the leaves of a pile to the right and merge them into another pile, and sweeping w leaves a distance d costs w * d. After all sweeping, at most k piles may remain. Print the minimum total cost.",
        "So the piles are cut into at most k consecutive groups, and every group is gathered at its rightmost position. Input is a first line with n and k, then a line with a_1 ... a_n.",
        "Example 1:\nInput:\n5 2\n1 2 3 4 5\nOutput: 8\nExplanation: group {1,2,3} gathered at position 3 costs 1*2 + 2*1 = 4, and group {4,5} gathered at position 5 costs 4*1 = 4, total 8. Every other split is worse: {1}{2..5} costs 16, {1,2}{3,4,5} costs 11, {1..4}{5} costs 10.",
        "Example 2:\nInput:\n4 1\n1 1 1 1\nOutput: 6\nExplanation: everything must end in one pile at position 4, costing 3 + 2 + 1 + 0 = 6.",
        "Constraints:\n- 1 <= k <= n <= 10^5\n- 0 <= a_i <= 1000\n- the answer needs 64-bit arithmetic",
      ],
      code: `int n, k;
vector<long long> S, T, prv, cur;      // S = prefix of a, T = prefix of i*a
const long long INF = (long long)4e18;

// cost of sweeping piles a..b into pile b
long long C(int a, int b) {
    return (long long)b * (S[b] - S[a - 1]) - (T[b] - T[a - 1]);
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;
        long long val = prv[i] + C(i + 1, mid);
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);
    compute(mid + 1, hi, bestI, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> k;
    S.assign(n + 1, 0);
    T.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long a;
        cin >> a;
        S[i] = S[i - 1] + a;
        T[i] = T[i - 1] + (long long)i * a;
    }
    prv.assign(n + 1, INF);
    prv[0] = 0;
    long long ans = INF;
    for (int t = 1; t <= k; t++) {
        cur.assign(n + 1, INF);
        compute(1, n, 0, n - 1);
        prv.swap(cur);
        ans = min(ans, prv[n]);            // "at most k" - take the best layer seen so far
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The cost of a group is what makes this problem instructive. Gathering piles a..b at position b costs sum over t in [a,b] of a_t * (b - t) = b * (S[b] - S[a-1]) - (T[b] - T[a-1]), where T is the prefix sum of t * a_t. Two prefix arrays turn an O(len) formula into O(1), which is a precondition for the whole optimisation - divide and conquer only removes a factor of n from the number of transitions, not from the cost of one.",
        "That C satisfies the quadrangle inequality: C(a,c) + C(b,d) <= C(a,d) + C(b,c) for a <= b <= c <= d, because moving the right endpoint of a group from c to d charges every leaf in the group an extra (d - c), and the group [a..] contains at least the leaves of [b..]. So the extra charge is larger for the wider group, which is exactly the inequality. Hence the split point is monotone and the D&C window is legitimate.",
        "The problem says at most k piles, not exactly k. Fewer groups can never be better here (merging two groups only adds distance), so dp[k][n] would already be optimal, but taking the running minimum over layers costs nothing and makes the code robust to cost functions where that is not true.",
        "The wrong-but-tempting approach is greedy: repeatedly merge the cheapest adjacent pair until k piles remain. It fails because a merge changes the cost of later merges, and the greedy order is not the optimal partition on inputs like 1 1 1 100.",
        "Time: O(k*n log n). Space: O(n).",
      ],
    },
    {
      name: "Ciel and Gondolas",
      difficulty: "Hard",
      variation: "Cost read from a 2D prefix sum",
      link: "https://codeforces.com/problemset/problem/321/E",
      question: [
        "n people are queued in a fixed order and k gondolas will arrive one after another. Gondola 1 takes the first group from the front of the queue, gondola 2 the next group, and so on, so every gondola carries a non-empty consecutive block of the queue and all n people board. You are given a symmetric matrix u where u[i][j] is the unfamiliarity between person i and person j. The unfamiliarity of a gondola is the sum of u[i][j] over all unordered pairs of people riding it, and the total is the sum over gondolas. Minimise the total.",
        "Input is n and k, then the n by n matrix u.",
        "Example 1:\nInput:\n5 2\n0 0 1 1 1\n0 0 1 1 1\n1 1 0 0 0\n1 1 0 0 0\n1 1 0 0 0\nOutput: 0\nExplanation: put persons 1 and 2 in the first gondola and persons 3, 4, 5 in the second. Every within-group pair has unfamiliarity 0.",
        "Example 2:\nInput:\n3 2\n0 1 1\n1 0 1\n1 1 0\nOutput: 1\nExplanation: any split into two blocks leaves exactly one pair together, and every pair costs 1.",
        "Constraints:\n- 1 <= n <= 4000, 1 <= k <= min(n, 800)\n- 0 <= u[i][j] <= 9, u[i][j] = u[j][i], u[i][i] = 0",
      ],
      code: `int n, k;
vector<int> P;                       // flat (n+1) x (n+1) 2D prefix sum of u
vector<long long> prv, cur;
const long long INF = (long long)4e18;

int at(int i, int j) { return P[i * (n + 1) + j]; }

// pairwise cost of the block a..b: half of the full submatrix sum (diagonal is 0)
long long C(int a, int b) {
    long long tot = (long long)at(b, b) - at(a - 1, b) - at(b, a - 1) + at(a - 1, a - 1);
    return tot / 2;
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;
        long long val = prv[i] + C(i + 1, mid);
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);
    compute(mid + 1, hi, bestI, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> k;
    P.assign((n + 1) * (n + 1), 0);
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) {
            int v;
            cin >> v;
            P[i * (n + 1) + j] = at(i - 1, j) + at(i, j - 1) - at(i - 1, j - 1) + v;
        }
    prv.assign(n + 1, INF);
    prv[0] = 0;
    for (int t = 1; t <= k; t++) {
        cur.assign(n + 1, INF);
        compute(1, n, 0, n - 1);
        prv.swap(cur);
    }
    cout << prv[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The queue order is fixed and gondolas board in order, so an assignment is again a split into k consecutive blocks - the same partition DP, only the cost function is new. C(a,b) is the sum of u over all pairs inside [a,b], which is half the sum of the full submatrix [a..b] x [a..b] since u is symmetric with zero diagonal. A 2D prefix sum makes that O(1).",
        "The quadrangle inequality holds because widening a block adds all pairs between the newcomers and the block; the wider block already contains every member of the narrower one, so it pays at least as much for the same newcomers. That is precisely C(a,d) - C(a,c) >= C(b,d) - C(b,c) for a <= b <= c <= d, so opt[j] is non-decreasing in j.",
        "Naively this is O(k*n^2) = 800 * 4000^2 transitions, far too many. Divide and conquer brings each layer to O(n log n), so the whole DP is about 800 * 4000 * 12 operations, which fits comfortably.",
        "Memory is the other half of the problem. A 4001 by 4001 int prefix table is about 64 MB, so store it flat and as int rather than long long, and keep only two DP rows. Individual block costs can reach 9 * C(4000,2), about 7 * 10^7, and totals stay well inside 64-bit, but the running DP values must not be int.",
        "Time: O(n^2 + k*n log n). Space: O(n^2).",
      ],
    },
    {
      name: "Yet Another Minimization Problem",
      difficulty: "Hard",
      variation: "Cost maintained by moving pointers",
      link: "https://codeforces.com/problemset/problem/868/F",
      question: [
        "You are given an array a of n integers with 1 <= a_i <= n, and an integer k. Split the array into exactly k non-empty consecutive subarrays. The cost of a subarray is the number of unordered pairs of positions inside it holding equal values, and the total cost is the sum over the k subarrays. Print the minimum total cost.",
        "Input is n and k, then the n values.",
        "Example 1:\nInput:\n7 3\n1 1 3 3 3 2 1\nOutput: 1\nExplanation: split as [1], [1,3], [3,3,2,1]. The first two blocks contain no equal pair at all, and the last contains exactly one, the pair of 3s. Splitting instead as [1,1], [3,3,3], [2,1] costs 1 + 3 + 0 = 4.",
        "Example 2:\nInput:\n10 2\n1 2 1 2 1 2 1 2 1 2\nOutput: 8\nExplanation: cutting in the middle gives blocks with three 1s and two 2s on each side, so 3 + 1 + 3 + 1 = 8. Cutting after position 4 gives 2 + 6 = 8 as well, and no split does better.",
        "Constraints:\n- 2 <= n <= 10^5\n- 2 <= k <= min(n, 20)\n- 1 <= a_i <= n",
      ],
      code: `int n, k;
vector<int> a, cnt;
vector<long long> prv, cur;
const long long INF = (long long)4e18;
int L = 1, R = 0;
long long curCost = 0;

void add(int i) { curCost += cnt[a[i]]++; }        // new element pairs with each equal one already in
void rem(int i) { curCost -= --cnt[a[i]]; }

// number of equal pairs inside l..r, maintained incrementally (Mo-style pointers)
long long C(int l, int r) {
    while (L > l) add(--L);                        // grow first, so the window never goes empty
    while (R < r) add(++R);
    while (L < l) rem(L++);
    while (R > r) rem(R--);
    return curCost;
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;
        long long val = prv[i] + C(i + 1, mid);
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);
    compute(mid + 1, hi, bestI, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> k;
    a.assign(n + 2, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    cnt.assign(n + 2, 0);
    prv.assign(n + 1, INF);
    prv[0] = 0;
    for (int t = 1; t <= k; t++) {
        cur.assign(n + 1, INF);
        compute(1, n, 0, n - 1);
        prv.swap(cur);
    }
    cout << prv[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The DP is the standard layered partition: dp[t][j] = min over i < j of dp[t-1][i] + C(i+1, j), where C counts equal pairs inside a block. C satisfies the quadrangle inequality because extending a block to the right adds, for the new element, one pair per equal element already present - and the wider block contains everything the narrower one does, so it gains at least as many pairs. Monotone split points follow.",
        "What is special here is that C has no closed form. Instead a single sliding window [L,R] with a count array is carried through the whole recursion: moving an endpoint by one updates the pair count in O(1). The divide and conquer recursion happens to move those pointers a total of O(n log n) steps per layer, because at each recursion level the windows are nested and sweep the array once.",
        "Order matters inside C: expand before you shrink. If you shrink first, an intermediate window can become empty or inverted and the count array goes negative, which corrupts every later query silently.",
        "The wrong-but-tempting alternative is to precompute all C(i,j), which is O(n^2) memory at n = 10^5 - impossible. Recognising that the cost only ever needs to be queried at points the recursion visits, in near-sorted order, is the whole trick.",
        "The count array must be indexed up to n since 1 <= a_i <= n; sizing it by anything smaller (or forgetting to reset it between runs) is an out-of-bounds write that shows up as a wrong answer, not a crash.",
        "Time: O(k*n log n). Space: O(n).",
      ],
    },
    {
      name: "Lawrence",
      difficulty: "Hard",
      variation: "Minimising within-group pairwise products",
      link: "https://www.spoj.com/problems/LARMY/",
      question: [
        "A railway is a line of n depots; depot i has strategic value a_i. Removing m of the n-1 junctions between consecutive depots cuts the railway into m+1 contiguous sections. The strategic value of a section is the sum of a_i * a_j over all unordered pairs of depots inside it, and the value of the railway is the sum over sections. Choose which m junctions to destroy so that the railway value is minimum, and print that value.",
        "Input has several test cases. Each starts with n and m followed by the n depot values; a line with n = 0 and m = 0 ends the input.",
        "Example 1:\nInput:\n4 1\n4 5 1 2\n0 0\nOutput: 17\nExplanation: cutting after depot 1 gives sections {4} and {5,1,2} worth 0 and 5*1 + 5*2 + 1*2 = 17. The other two cuts give 22 and 29.",
        "Example 2:\nInput:\n4 2\n4 5 1 2\n0 0\nOutput: 2\nExplanation: cutting after depots 1 and 2 gives {4}, {5}, {1,2} worth 0 + 0 + 2 = 2.",
        "Constraints:\n- 1 <= n <= 1000, 0 <= m < n\n- 0 <= a_i <= 1000\n- the answer needs 64-bit arithmetic",
      ],
      code: `int n, m;
vector<long long> S, Q, prv, cur;      // S = prefix of a, Q = prefix of a*a
const long long INF = (long long)4e18;

// sum of a_i * a_j over pairs inside a..b, from the square-of-sum identity
long long C(int a, int b) {
    long long s = S[b] - S[a - 1], q = Q[b] - Q[a - 1];
    return (s * s - q) / 2;
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestI = optLo;
    long long best = INF;
    for (int i = optLo; i <= min(mid - 1, optHi); i++) {
        if (prv[i] >= INF) continue;
        long long val = prv[i] + C(i + 1, mid);
        if (val < best) { best = val; bestI = i; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestI);
    compute(mid + 1, hi, bestI, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    while (cin >> n >> m && (n || m)) {
        S.assign(n + 1, 0);
        Q.assign(n + 1, 0);
        for (int i = 1; i <= n; i++) {
            long long v;
            cin >> v;
            S[i] = S[i - 1] + v;
            Q[i] = Q[i - 1] + v * v;
        }
        prv.assign(n + 1, INF);
        prv[0] = 0;
        for (int t = 1; t <= m + 1; t++) {      // m cuts means m+1 sections
            cur.assign(n + 1, INF);
            compute(1, n, 0, n - 1);
            prv.swap(cur);
        }
        cout << prv[n] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Choosing m junctions to destroy is the same as partitioning the depots into exactly m+1 consecutive sections, so the layered DP applies with the number of layers equal to m+1. Off-by-one here is the most common mistake: m cuts produce m+1 groups, and running m layers answers a different problem.",
        "The section cost uses the identity (sum a)^2 = sum a^2 + 2 * sum over pairs a_i a_j, so C(a,b) = (S^2 - Q) / 2 with two prefix arrays. The division by two is exact because the doubled pair sum is always even.",
        "The quadrangle inequality holds for the same reason as in Ciel and Gondolas: extending a section right charges the new depot's value times the sum of the section, and the wider section has the larger sum. So opt is monotone and each layer runs in O(n log n).",
        "The tempting greedy is to cut at the m largest values of a_i * a_{i+1}, or to cut around the largest depots. It fails because the cost of a section is quadratic in its total, so the DP must trade section sizes globally rather than locally.",
        "With n <= 1000 and m < n the naive O(m*n^2) is up to 10^9 transitions; divide and conquer takes it to roughly 10^7.",
        "Time: O(m*n log n) per test case. Space: O(n).",
      ],
    },
    {
      name: "Money for Nothing",
      difficulty: "Hard",
      variation: "Monotone maxima on a matrix, no DP layer",
      question: [
        "There are m producers and n consumers of a gadget. Producer i can deliver from day pd_i at unit price pp_i. Consumer j needs delivery by day cd_j and will pay up to cp_j. Buying from producer i and selling to consumer j is only legal if cd_j > pd_i and cp_j > pp_i, and the profit of that pair is defined as (cd_j - pd_i) * (cp_j - pp_i). Print the maximum profit over all pairs, or 0 if no legal pair exists.",
        "Input is m and n, then m lines with a producer's day and price, then n lines with a consumer's day and price.",
        "Example 1:\nInput:\n2 2\n1 1\n2 2\n3 5\n4 8\nOutput: 21\nExplanation: producer (1,1) with consumer (4,8) gives (4-1)*(8-1) = 21, which beats (2,2) with (4,8) at 2*6 = 12 and (1,1) with (3,5) at 2*4 = 8.",
        "Example 2:\nInput:\n1 1\n5 5\n1 1\nOutput: 0\nExplanation: the consumer needs the gadget before the producer can make it and pays less than it costs, so no legal trade exists.",
        "Constraints:\n- 1 <= m, n <= 5 * 10^5\n- 1 <= day, price <= 10^9\n- the answer needs 64-bit arithmetic",
      ],
      code: `typedef long long ll;
vector<ll> pd, pp, cd, cp;
ll ans = 0;

// raw product: used only to pick the argmax, may be negative or spurious
ll raw(int i, int j) { return (cd[j] - pd[i]) * (cp[j] - pp[i]); }

// the real profit, 0 when the pair is not a legal trade
ll profit(int i, int j) {
    ll dx = cd[j] - pd[i], dy = cp[j] - pp[i];
    return (dx > 0 && dy > 0) ? dx * dy : 0;
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestJ = optLo;
    ll best = LLONG_MIN;
    for (int j = optLo; j <= optHi; j++) {
        ll v = raw(mid, j);
        if (v > best) { best = v; bestJ = j; }
    }
    ans = max(ans, profit(mid, bestJ));
    compute(lo, mid - 1, optLo, bestJ);
    compute(mid + 1, hi, bestJ, optHi);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m, n;
    cin >> m >> n;
    vector<pair<ll,ll>> A(m), B(n);
    for (auto& p : A) cin >> p.first >> p.second;
    for (auto& p : B) cin >> p.first >> p.second;

    // keep only producers that nothing else beats on both day and price
    sort(A.begin(), A.end());
    vector<pair<ll,ll>> P;
    ll mn = LLONG_MAX;
    for (auto& p : A) if (p.second < mn) { mn = p.second; P.push_back(p); }

    // keep only consumers that nothing else beats on both day and price
    sort(B.begin(), B.end());
    vector<pair<ll,ll>> Cc;
    ll mx = LLONG_MIN;
    for (int i = (int)B.size() - 1; i >= 0; i--)
        if (B[i].second > mx) { mx = B[i].second; Cc.push_back(B[i]); }
    reverse(Cc.begin(), Cc.end());

    for (auto& p : P) { pd.push_back(p.first); pp.push_back(p.second); }
    for (auto& p : Cc) { cd.push_back(p.first); cp.push_back(p.second); }
    if (!pd.empty() && !cd.empty())
        compute(0, (int)pd.size() - 1, 0, (int)cd.size() - 1);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "There is no DP layer here at all: the object being optimised is a matrix, and the pattern being used is the half of divide and conquer optimisation that actually does the work - a totally monotone matrix has non-decreasing row argmax, so the same recursion finds every row maximum in O((rows + cols) log rows) instead of O(rows * cols).",
        "First prune. A producer beaten by another on both day and price is useless, and likewise for consumers. Sorting and sweeping leaves two staircases, each with day increasing and price decreasing. For that pair of staircases the raw product f(i,j) = (cd_j - pd_i) * (cp_j - pp_i) satisfies f(i,j) + f(i',j') > f(i,j') + f(i',j) for i < i' and j < j': the cross terms reduce to (cd_j' - cd_j)(pp_i - pp_i') + (cp_j' - cp_j)(pd_i - pd_i'), and both products are positive given the staircase directions. That is exactly the inverse quadrangle inequality that makes row argmax monotone.",
        "The subtlety is that some entries are illegal trades. Clamping them to 0 destroys monotonicity - a row of ties makes the recursion pick an arbitrary column and prune the true optimum, which is a real failing case, not a theoretical one. Using the raw signed product for the argmax and only then filtering with profit() is what makes it correct, and it is safe: if a row contains any legal trade, every entry of that row with both differences negative belongs to a consumer strictly dominated by the legal one, so it was already pruned. Illegal entries left in such a row have product <= 0, so the raw maximum of that row is the legal maximum.",
        "Prices and days reach 10^9, so a product reaches 10^18 - it fits in a signed 64-bit integer but nothing smaller, and the raw product of two negatives is what makes the intermediate values large.",
        "Time: O((m + n) log(m + n)) for sorting plus O((m + n) log m) for the recursion. Space: O(m + n).",
      ],
    },
    {
      name: "Aliens",
      difficulty: "Hard",
      variation: "Layered D&C, with the Lagrangian trick on top",
      question: [
        "A satellite photographs an m by m grid of cells, rows and columns numbered 0 to m-1. There are n interesting cells at coordinates (r_i, c_i); the grid is symmetric about the main diagonal, so a cell (r, c) and its mirror (c, r) are the same location and may be treated as the one with r >= c. A photo is a square whose two opposite corners lie on the main diagonal, that is, a set of cells [a..b] x [a..b]. You may take at most k photos and every interesting cell must be inside at least one of them. Return the total number of distinct cells covered by the photos, minimised (cells covered by two photos count once).",
        "Example 1:\nInput: n = 3, m = 6, k = 2, cells (0,1), (1,0), (4,4)\nOutput: 5\nExplanation: (0,1) and (1,0) are the same location. The photo [0..1] covers 4 cells and contains it; the photo [4..4] covers 1 cell and contains (4,4). Total 5.",
        "Example 2:\nInput: n = 4, m = 6, k = 2, cells (0,0), (3,1), (4,4), (5,5)\nOutput: 20\nExplanation: photo [0..3] covers 16 cells and contains (0,0) and (3,1); photo [4..5] covers 4 cells and contains (4,4) and (5,5). Total 20, and no other split of these four cells into two squares does better.",
        "Constraints:\n- 1 <= k <= n <= 10^5\n- 1 <= m <= 10^6\n- 0 <= r_i, c_i <= m - 1, cells may repeat",
      ],
      code: `typedef long long ll;
const ll INF = (ll)4e18;
vector<int> R, Cx;                   // staircase: Cx increasing, R increasing
vector<ll> prv, cur;

// cost of one square that must cover staircase points j+1..i (1-indexed),
// minus the part it shares with the square that ended at point j
ll C(int j, int i) {
    ll side = R[i - 1] - Cx[j] + 1;
    ll ov = 0;
    if (j >= 1 && R[j - 1] >= Cx[j]) ov = R[j - 1] - Cx[j] + 1;
    return side * side - ov * ov;
}

void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2, bestJ = optLo;
    ll best = INF;
    for (int j = optLo; j <= min(mid - 1, optHi); j++) {
        if (prv[j] >= INF) continue;
        ll val = prv[j] + C(j, mid);
        if (val < best) { best = val; bestJ = j; }
    }
    cur[mid] = best;
    compute(lo, mid - 1, optLo, bestJ);
    compute(mid + 1, hi, bestJ, optHi);
}

ll take_photos(int n, int m, int k, vector<int> r, vector<int> c) {
    vector<pair<int,int>> pts;
    for (int i = 0; i < n; i++) {
        int a = r[i], b = c[i];
        if (a < b) swap(a, b);                    // fold onto r >= c
        pts.push_back({b, -a});                   // sort by column asc, then row desc
    }
    sort(pts.begin(), pts.end());

    // drop any point already inside the square forced by another point
    R.clear(); Cx.clear();
    int maxR = -1;
    for (auto& p : pts) {
        int col = p.first, row = -p.second;
        if (row > maxR) { maxR = row; Cx.push_back(col); R.push_back(row); }
    }
    int N = R.size();
    k = min(k, N);

    prv.assign(N + 1, INF);
    prv[0] = 0;
    ll ans = INF;
    for (int t = 1; t <= k; t++) {
        cur.assign(N + 1, INF);
        compute(1, N, 0, N - 1);
        prv.swap(cur);
        ans = min(ans, prv[N]);                   // "at most k" photos
    }
    return ans;
}`,
      explanation: [
        "Reduce the geometry first. Mirroring every cell below the diagonal, a point (r, c) with r >= c is covered by the square [a..b] exactly when a <= c and b >= r. So a point is a constraint 'some square must start at or before c and end at or after r'. If one point has c' <= c and r' >= r, the second point is implied by the first and can be deleted; sorting by column ascending and row descending and keeping only strictly increasing rows leaves a staircase where both coordinates increase together.",
        "On that staircase an optimal set of squares covers consecutive runs of points, and the square for the run j+1..i is forced to be exactly [c_{j+1} .. r_i]. So dp[t][i] = min over j of dp[t-1][j] + side^2 - overlap^2, where side = r_i - c_{j+1} + 1 and the overlap with the previous square is the square [c_{j+1} .. r_j] when r_j >= c_{j+1}. Subtracting only the adjacent overlap is enough: if a square overlapped its neighbour-but-one, the middle square would lie inside the union of the other two and could be dropped, which is never worse - so the formula is exact on optimal configurations and only ever overestimates the others.",
        "That cost satisfies the quadrangle inequality, so each layer runs by divide and conquer in O(N log N) and the whole thing in O(k*N log N). That is already enough when k is small, and it is the version worth writing first because you can check it against a brute-force partition search.",
        "For the full constraints k can be as large as n, and O(k*N log N) is too slow. The standard fix is the Aliens trick (Lagrangian relaxation): drop the layer index, charge a penalty lambda for each square, solve the single-layer DP dp[i] = min over j of dp[j] + C(j,i) + lambda, and binary search lambda for the smallest value whose optimal square count is at most k; the answer is that DP value minus lambda*k. The relaxed DP is 1D-into-1D rather than layered, so it needs a convex hull trick or Li Chao tree instead of this recursion - which is the honest reason the two optimisations are usually taught together.",
        "The trap is skipping the domination pruning. Without it the points are not a staircase, the forced square for a run is not [c_first .. r_last], and both the cost formula and the monotonicity argument fail.",
        "Time: O(n log n + k*n log n) for the layered version. Space: O(n).",
      ],
    },
  ],
};
