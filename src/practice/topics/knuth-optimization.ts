import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Slimes",
      difficulty: "Medium",
      variation: "Interval merge template, opt sandwiched between neighbours",
      link: "https://atcoder.jp/contests/dp/tasks/dp_n",
      question: [
        "There are N slimes in a row, the i-th of size a[i]. You repeatedly pick two adjacent slimes and fuse them into one slime whose size is the sum of the two, paying a cost equal to that sum. Repeat until a single slime remains. Find the minimum total cost.",
        "Because every fusion is between adjacent slimes, the whole process is a way of fully parenthesising the row, so the state is an interval and the choice is where to split it.",
        "Example 1:\nInput: N = 4, a = [10, 20, 30, 40]\nOutput: 190\nExplanation: Fuse 10 and 20 (cost 30) to get [30, 30, 40], then fuse 30 and 30 (cost 60) to get [60, 40], then fuse (cost 100). Total 30 + 60 + 100 = 190.",
        "Example 2:\nInput: N = 5, a = [10, 10, 10, 10, 10]\nOutput: 120\nExplanation: A balanced merge order costs 20 + 20 + 30 + 50 = 120.",
        "Constraints:\n- 2 <= N <= 400\n- 1 <= a[i] <= 10^9\n- The answer can exceed 32 bits, use 64-bit arithmetic",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& v : a) cin >> v;
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    vector<vector<int>> opt(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) opt[i][i] = i;
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            int lo = max(i, opt[i][j - 1]);       // Knuth lower bound
            int hi = min(j - 1, opt[i + 1][j]);   // Knuth upper bound
            long long best = LLONG_MAX;
            int bk = lo;
            for (int k = lo; k <= hi; k++) {
                long long v = dp[i][k] + dp[k + 1][j];
                if (v < best) { best = v; bk = k; }
            }
            dp[i][j] = best + pre[j + 1] - pre[i];   // w(i,j) is the interval sum
            opt[i][j] = bk;
        }
    }
    cout << dp[0][n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i][j] is the cheapest way to fuse the slimes in positions i..j into one. Transition: dp[i][j] = min over k in [i, j-1] of dp[i][k] + dp[k+1][j] + w(i,j), where w(i,j) = a[i] + ... + a[j] is the cost of the final fusion of the interval. Note w depends only on the endpoints, never on k - that is the shape Knuth optimization requires.",
        "The interval sum is monotone (w(i,j) <= w(i',j') whenever [i,j] is inside [i',j']) and satisfies the quadrangle inequality w(i,j) + w(i',j') <= w(i',j) + w(i,j') for i <= i' <= j <= j'. For interval sums both hold with equality on the QI, which is enough. Those two facts propagate to dp and force the optimal split to be monotone: opt[i][j-1] <= opt[i][j] <= opt[i+1][j].",
        "So the inner loop only scans between the split chosen by the interval one shorter on the left and the one shorter on the right. Across a whole diagonal those windows telescope: the total scanned length for a fixed length is O(n), not O(n^2), which is where the factor of n disappears.",
        "The trap is applying this blindly. Knuth needs the added term to be independent of k. Burst Balloons and polygon triangulation put the split index inside the cost term, so their split points are not monotone and the same code silently returns a wrong answer. Always check that w(i,j) does not mention k.",
        "Second trap: the bounds must be clamped. For length 2, opt[i+1][j] refers to a single-element cell whose stored value is j, which is not a legal split, so min with j-1 is not cosmetic - without it you read out of range.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Cutting Sticks",
      difficulty: "Medium",
      variation: "Cost of a cut is the length of the piece being cut",
      link: "https://onlinejudge.org/external/100/10003.pdf",
      question: [
        "You are given a stick of length l and n marked positions along it where cuts must be made. Cutting a piece costs the current length of that piece, so the order of cuts changes the total price. Find the cheapest order of making all n cuts.",
        "The input contains several test cases. Each begins with l, then n, then the n cut coordinates in increasing order. A line with l = 0 ends the input. For each case print 'The minimum cutting is X.' where X is the minimum total cost.",
        "Example 1:\nInput:\n100\n3\n25 50 75\n10\n4\n4 5 7 8\n0\nOutput:\nThe minimum cutting is 200.\nThe minimum cutting is 22.\nExplanation: For the first stick, cutting at 50 first costs 100, then the two halves of length 50 each cost 50 to cut, giving 100 + 50 + 50 = 200. Cutting left to right instead costs 100 + 75 + 50 = 225.",
        "Constraints:\n- 1 <= l <= 1000\n- 1 <= n <= 50\n- The cut coordinates are strictly inside (0, l) and strictly increasing",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int l;
    while (cin >> l && l != 0) {
        int n;
        cin >> n;
        vector<long long> c(n + 2);
        c[0] = 0;
        for (int i = 1; i <= n; i++) cin >> c[i];
        c[n + 1] = l;                       // sentinels: the two stick ends
        int m = n + 2;
        vector<vector<long long>> dp(m, vector<long long>(m, 0));
        vector<vector<int>> opt(m, vector<int>(m, 0));
        for (int i = 0; i + 1 < m; i++) opt[i][i + 1] = i;   // one piece, no cut inside
        for (int len = 2; len < m; len++) {
            for (int i = 0; i + len < m; i++) {
                int j = i + len;
                int lo = max(i + 1, opt[i][j - 1]);
                int hi = min(j - 1, opt[i + 1][j]);
                long long best = LLONG_MAX;
                int bk = lo;
                for (int k = lo; k <= hi; k++) {
                    long long v = dp[i][k] + dp[k][j];
                    if (v < best) { best = v; bk = k; }
                }
                dp[i][j] = best + c[j] - c[i];   // pay the length of this piece once
                opt[i][j] = bk;
            }
        }
        cout << "The minimum cutting is " << dp[0][m - 1] << ".\\n";
    }
    return 0;
}`,
      explanation: [
        "Index by cut points, not by stick positions. Put the coordinates in c[0] = 0, c[1..n] = the cuts, c[n+1] = l. Then dp[i][j] is the cost of making every cut strictly between points i and j, and the transition picks which of those cuts is performed first: dp[i][j] = min over k in (i, j) of dp[i][k] + dp[k][j] + (c[j] - c[i]).",
        "The first cut on a piece costs the whole piece length regardless of which cut it is, which is exactly why the extra term c[j] - c[i] is k-independent. That term is a length, so it is monotone in the interval and satisfies the quadrangle inequality, and split monotonicity opt[i][j-1] <= opt[i][j] <= opt[i+1][j] follows.",
        "Reversing the reading is a useful sanity check: reading the recursion bottom-up you are merging adjacent pieces at a cost equal to the merged length, i.e. the same problem as Slimes with a[i] = c[i+1] - c[i]. Any solution to one solves the other.",
        "The tempting wrong approach is greedy - always cut nearest the middle. It happens to be optimal on the sample but fails on skewed coordinate sets, because the cost of a later cut depends on the entire partition history, not on one local balance measure.",
        "At n <= 50 the plain O(n^3) DP passes too; the Knuth window is what makes the identical code survive n in the thousands.",
        "Time: O(n^2) per test case. Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Cost to Cut a Stick",
      difficulty: "Hard",
      variation: "Same cut-cost DP on compressed cut coordinates",
      link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
      question: [
        "A wooden stick of length n is labelled from 0 to n. You are given an array cuts where cuts[i] is a position at which a cut must be made. You may perform the cuts in any order. The cost of one cut is the length of the stick piece it is performed on, and after a cut that piece becomes two independent pieces. Return the minimum total cost of all the cuts.",
        "Example 1:\nInput: n = 7, cuts = [1, 3, 4, 5]\nOutput: 16\nExplanation: Cutting in the order 3, 5, 1, 4 costs 7 + 4 + 3 + 2 = 16, and no order does better.",
        "Example 2:\nInput: n = 9, cuts = [5, 6, 1, 4, 2]\nOutput: 22\nExplanation: Cutting in the order 4, 6, 5, 2, 1 costs 9 (on [0,9]) + 5 (on [4,9]) + 2 (on [4,6]) + 4 (on [0,4]) + 2 (on [0,2]) = 22.",
        "Constraints:\n- 2 <= n <= 10^6\n- 1 <= cuts.length <= min(n - 1, 100)\n- 1 <= cuts[i] <= n - 1, all values distinct",
      ],
      code: `int minCost(int n, vector<int>& cuts) {
    vector<int> c;
    c.push_back(0);
    for (int x : cuts) c.push_back(x);
    c.push_back(n);
    sort(c.begin(), c.end());       // the stick length n is irrelevant, only cut order matters
    int m = c.size();
    vector<vector<int>> dp(m, vector<int>(m, 0));
    vector<vector<int>> opt(m, vector<int>(m, 0));
    for (int i = 0; i + 1 < m; i++) opt[i][i + 1] = i;
    for (int len = 2; len < m; len++) {
        for (int i = 0; i + len < m; i++) {
            int j = i + len;
            int lo = max(i + 1, opt[i][j - 1]);
            int hi = min(j - 1, opt[i + 1][j]);
            int best = INT_MAX, bk = lo;
            for (int k = lo; k <= hi; k++) {
                int v = dp[i][k] + dp[k][j];
                if (v < best) { best = v; bk = k; }
            }
            dp[i][j] = best + c[j] - c[i];
            opt[i][j] = bk;
        }
    }
    return dp[0][m - 1];
}`,
      explanation: [
        "The stick length n is up to 10^6 but there are at most 100 cuts, so the DP must be indexed by cut positions, not by millimetres. Sorting the cuts with 0 and n appended gives m <= 102 coordinates and the state becomes dp[i][j] = cost of all cuts strictly between coordinates i and j.",
        "Once compressed this is exactly the Cutting Sticks recurrence: dp[i][j] = min over interior k of dp[i][k] + dp[k][j] + (c[j] - c[i]). The added term is a segment length, independent of k, monotone under interval inclusion, and satisfies the quadrangle inequality, so Knuth's split monotonicity applies and the inner scan collapses.",
        "The natural wrong instinct is to treat the cuts as a sequence to be processed left to right, or to sort by some cost heuristic. Neither works: whether a cut is cheap depends on which piece it lands in, which is decided by the cuts already made, and only an interval DP captures that dependency.",
        "Forgetting to sort is the other classic bug. The array cuts arrives unsorted (example 2), and the recurrence is only valid when c is increasing, otherwise c[j] - c[i] can be negative.",
        "With m <= 102 both O(m^3) and the Knuth version are instant here; the value of the Knuth version is that it is the same code that scales when the number of cuts grows to a few thousand.",
        "Time: O(m^2) where m = cuts.length + 2, plus O(m log m) to sort. Space: O(m^2).",
      ],
    },
    {
      name: "Optimal Binary Search Tree",
      difficulty: "Hard",
      variation: "Knuth's original problem, root monotonicity",
      link: "https://www.geeksforgeeks.org/optimal-binary-search-tree-dp-24/",
      question: [
        "Given a sorted array keys[0..n-1] of distinct search keys and an array freq[0..n-1] where freq[i] is the number of searches for keys[i], build a binary search tree over the keys that minimises the total search cost. The cost of one successful search is the number of nodes visited, i.e. depth + 1, so the total cost is the sum over i of freq[i] * (depth of keys[i] + 1). Return that minimum total cost.",
        "Example 1:\nInput: keys = [10, 12], freq = [34, 50]\nOutput: 118\nExplanation: With 12 as the root, 12 is visited 50 times at depth 0 and 10 is visited 34 times at depth 1, giving 50 * 1 + 34 * 2 = 118. Rooting at 10 instead costs 34 * 1 + 50 * 2 = 134.",
        "Example 2:\nInput: keys = [10, 12, 20], freq = [34, 8, 50]\nOutput: 142\nExplanation: Rooting at 12 with children 10 and 20 costs 8 * 1 + 34 * 2 + 50 * 2 = 176. Rooting at 10, right child 20, and 12 as 20's left child costs 34 * 1 + 50 * 2 + 8 * 3 = 158. The optimum roots at 20 with left child 10 and then 12 as 10's right child: 50 * 1 + 34 * 2 + 8 * 3 = 142.",
        "Constraints:\n- 1 <= n <= 2000\n- keys is strictly increasing\n- 1 <= freq[i] <= 10^5",
      ],
      code: `int optimalSearchTree(vector<int>& keys, vector<int>& freq) {
    int n = keys.size();
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + freq[i];
    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
    vector<vector<int>> rt(n + 2, vector<int>(n + 2, 0));
    for (int i = 1; i <= n; i++) { dp[i][i] = freq[i - 1]; rt[i][i] = i; }
    for (int len = 2; len <= n; len++) {
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            int lo = max(i, rt[i][j - 1]);      // root monotone along the row
            int hi = min(j, rt[i + 1][j]);      // and along the column
            int best = INT_MAX, br = lo;
            for (int r = lo; r <= hi; r++) {
                int left = (r > i) ? dp[i][r - 1] : 0;
                int right = (r < j) ? dp[r + 1][j] : 0;
                if (left + right < best) { best = left + right; br = r; }
            }
            dp[i][j] = best + pre[j] - pre[i - 1];   // every key in i..j sinks one level
            rt[i][j] = br;
        }
    }
    return dp[1][n];
}`,
      explanation: [
        "State: dp[i][j] (1-indexed, inclusive) is the optimal search cost of a BST built from keys i..j, counting depths relative to that subtree's own root. Choosing r as the subtree root gives dp[i][r-1] + dp[r+1][j] + W(i,j), where W(i,j) is the sum of frequencies in i..j.",
        "Why the frequency sum appears and why it is k-free: attaching two optimal subtrees under r pushes every key of the interval down exactly one level compared to its own subtree, so each key pays one extra visit. That is W(i,j) additional cost no matter which r you pick. This is the recurrence Knuth analysed in 1971, and the frequency prefix sum is monotone and satisfies the quadrangle inequality, so the optimal root obeys rt[i][j-1] <= rt[i][j] <= rt[i+1][j].",
        "Note the root range here is [i, j], not [i, j-1] as in the merge form, since the root may be either endpoint. The empty-subtree guards r > i and r < j replace the usual dp[i][i-1] = 0 sentinel row without needing an offset index.",
        "The wrong-but-tempting approach is to root every subtree at its most frequent key and recurse. It is correct for one and two keys and wrong in general: for freq = [8, 7, 4, 2, 8, 1] that greedy yields 74 while the optimum is 62, because the root must balance the two side weights, not maximise its own.",
        "Do not confuse this with Huffman coding either. Huffman is free to reorder the symbols, but here the in-order sequence is fixed by the BST property, so only contiguous intervals are legal subtrees. And do not confuse it with a balanced tree: the search-cost optimum is deliberately skewed towards hot keys.",
        "Time: O(n^2) with Knuth versus O(n^3) naive. Space: O(n^2).",
      ],
    },
    {
      name: "Monkey Party",
      difficulty: "Hard",
      variation: "Circular interval merge, doubled array",
      question: [
        "n monkeys sit in a circle. Each group of adjacent monkeys can be introduced to a neighbouring group, and merging a group of total familiarity x with a neighbouring group of total familiarity y costs x + y and produces one group of familiarity x + y. Only groups that are adjacent on the circle may merge. Find the minimum total cost to reduce the whole circle to one group.",
        "The input contains several test cases until end of file. Each case gives n on one line and then n integers, the familiarity values in circular order. Print one minimum cost per case.",
        "Example 1:\nInput:\n4\n1 2 3 4\nOutput:\n19\nExplanation: Merge 1 and 2 (cost 3), then that group with 3 (cost 6), then with 4 (cost 10): total 19. Merging 3 and 4 first costs 7, then 1 and 2 costs 3, then the final merge costs 10, which is 20 - worse.",
        "Example 2:\nInput:\n3\n1 2 3\nOutput:\n9\nExplanation: Merge 1 and 2 (cost 3) then merge with 3 (cost 6), total 9. Any other first merge costs at least 4 and then 6, giving 10 or more.",
        "Constraints:\n- 1 <= n <= 1000\n- familiarity values are non-negative and fit in 32 bits\n- the answer needs 64 bits",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<long long> a(n);
        for (auto& v : a) cin >> v;
        int m = 2 * n;                       // unroll the circle into a line of length 2n
        vector<long long> b(m), pre(m + 1, 0);
        for (int i = 0; i < m; i++) b[i] = a[i % n];
        for (int i = 0; i < m; i++) pre[i + 1] = pre[i] + b[i];
        vector<vector<long long>> dp(m, vector<long long>(m, 0));
        vector<vector<int>> opt(m, vector<int>(m, 0));
        for (int i = 0; i < m; i++) opt[i][i] = i;
        for (int len = 2; len <= n; len++) {   // never need windows longer than n
            for (int i = 0; i + len - 1 < m; i++) {
                int j = i + len - 1;
                int lo = max(i, opt[i][j - 1]);
                int hi = min(j - 1, opt[i + 1][j]);
                long long best = LLONG_MAX;
                int bk = lo;
                for (int k = lo; k <= hi; k++) {
                    long long v = dp[i][k] + dp[k + 1][j];
                    if (v < best) { best = v; bk = k; }
                }
                dp[i][j] = best + pre[j + 1] - pre[i];
                opt[i][j] = bk;
            }
        }
        long long ans = LLONG_MAX;
        for (int i = 0; i < n; i++) ans = min(ans, dp[i][i + n - 1]);
        cout << (n <= 1 ? 0 : ans) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "A circular merge has no fixed first element, so the standard trick is to concatenate the array with itself. Every way of collapsing the circle corresponds to some length-n window of the doubled array, because the last merge splits the circle at exactly one seam and cutting there turns the circle into a line.",
        "So run the linear merge DP on the doubled array but only for interval lengths up to n, then take the minimum of dp[i][i+n-1] over the n starting offsets. Lengths beyond n would double-count elements and are never needed.",
        "The Knuth window carries over unchanged: the cost added at each step is still the interval sum, still independent of the split, so opt[i][j-1] <= opt[i][j] <= opt[i+1][j] holds on the doubled array as well. That is what makes n = 1000 comfortable: the naive circular DP is O(n) starting points times O(n^2) or a single O((2n)^3) pass, both far too slow, while this is O(n^2).",
        "Two traps. First, do not try to fix the seam by only rotating a few candidate positions - the optimal seam is not the smallest adjacent pair or any other local feature. Second, the answer overflows 32 bits well before n = 1000 since the total familiarity is charged roughly log n times.",
        "Time: O(n^2) per test case. Space: O(n^2).",
      ],
    },
    {
      name: "Allocate Mailboxes",
      difficulty: "Hard",
      variation: "Layered DP, opt monotone in both the layer and the index",
      link: "https://leetcode.com/problems/allocate-mailboxes/",
      question: [
        "Given an array houses where houses[i] is the position of the i-th house on a street, and an integer k, allocate k mailboxes on the street. The cost is the sum over all houses of the distance from that house to its nearest mailbox. Return the minimum total cost. Answers fit in a 32-bit integer.",
        "Sorting the houses makes each mailbox serve a contiguous block, so the problem becomes: split the sorted houses into k contiguous blocks minimising the sum of within-block distance-to-median costs.",
        "Example 1:\nInput: houses = [1, 4, 8, 10, 20], k = 3\nOutput: 5\nExplanation: Put mailboxes at 3, 9 and 20. Costs are |1-3| + |4-3| = 3, |8-9| + |10-9| = 2, and 0, total 5.",
        "Example 2:\nInput: houses = [2, 3, 5, 12, 18], k = 2\nOutput: 9\nExplanation: Blocks [2,3,5] served from 3 cost 1 + 0 + 2 = 3, and [12,18] served from 12 cost 0 + 6 = 6. Total 9.",
        "Constraints:\n- 1 <= k <= houses.length <= 100\n- 1 <= houses[i] <= 10^4\n- All house positions are distinct",
      ],
      code: `int minDistance(vector<int>& houses, int k) {
    int n = houses.size();
    sort(houses.begin(), houses.end());
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + houses[i];
    // cost of serving houses l..r (1-indexed) from their median
    auto cost = [&](int l, int r) -> long long {
        if (l > r) return 0;
        int mid = (l + r) / 2;
        long long m = houses[mid - 1];
        long long left = (long long)(mid - l) * m - (pre[mid - 1] - pre[l - 1]);
        long long right = (pre[r] - pre[mid]) - (long long)(r - mid) * m;
        return left + right;
    };
    const long long INF = (long long)4e18;
    vector<long long> prv(n + 1, INF), cur(n + 1, INF);
    vector<int> optPrev(n + 2, 0), optCur(n + 2, 0);
    prv[0] = 0;
    for (int j = 1; j <= k; j++) {
        fill(cur.begin(), cur.end(), INF);
        optCur[n + 1] = n - 1;
        for (int i = n; i >= 1; i--) {          // descending i so opt[j][i+1] is already known
            int lo = max(0, optPrev[i]);        // opt[j-1][i] <= opt[j][i]
            int hi = min(i - 1, optCur[i + 1]); // opt[j][i]  <= opt[j][i+1]
            long long best = INF;
            int bt = lo;
            for (int t = lo; t <= hi; t++) {
                if (prv[t] >= INF) continue;
                long long v = prv[t] + cost(t + 1, i);
                if (v < best) { best = v; bt = t; }
            }
            cur[i] = best;
            optCur[i] = bt;
        }
        prv = cur;
        optPrev = optCur;
    }
    return (int)prv[n];
}`,
      explanation: [
        "Two observations turn this into a layered DP. Sorting is safe because an optimal assignment never interleaves: if house x uses mailbox A and a farther house y uses a nearer mailbox B, swapping does not increase the cost. And within one block the optimal mailbox position is the median, since the sum of absolute deviations is minimised there.",
        "State: dp[j][i] = minimum cost of covering the first i sorted houses with j mailboxes, with dp[j][i] = min over t of dp[j-1][t] + cost(t+1, i). The block cost is computed in O(1) from prefix sums, splitting the block at the median and treating the two halves separately.",
        "This is the layered form of Knuth optimization. The block cost satisfies the quadrangle inequality, which makes the optimal split monotone in both arguments: opt[j-1][i] <= opt[j][i] <= opt[j][i+1]. Adding a mailbox can only push the last cut later, and extending the prefix can only push it later too.",
        "The loop order is the subtle part. To use opt[j-1][i] as the lower bound you need layers ascending; to use opt[j][i+1] as the upper bound you need the index descending inside a layer. Doing both - j ascending, i descending - is what makes the two bounds simultaneously available, and the windows telescope to O(n) per layer.",
        "The tempting wrong approach is to place mailboxes greedily at the k densest clusters, or to use k-means style iteration. Both can be arbitrarily bad; only the exact split DP is safe. Another common slip is using the mean instead of the median for a block, which is optimal for squared distance but not for absolute distance.",
        "Time: O(n * k) after sorting, versus O(n^2 * k) naive. Space: O(n).",
      ],
    },
    {
      name: "Post Office",
      difficulty: "Hard",
      variation: "Same layered split DP as a judge problem",
      link: "http://poj.org/problem?id=1160",
      question: [
        "A straight highway has V villages at given integer positions. P post offices must be built, each in one of the villages, and every village is served by the nearest post office. Choose the positions so that the total distance from every village to its serving post office is as small as possible, and print that total.",
        "Input: the first line contains V and P. The second line contains the V village positions in increasing order. Print one integer, the minimum total distance.",
        "Example 1:\nInput:\n10 5\n1 2 3 6 7 9 11 22 44 50\nOutput: 9\nExplanation: Group the villages as [1,2,3], [6,7,9,11], [22], [44], [50] with offices at 2, 9, 22, 44 and 50. The costs are (1+0+1) = 2, (3+2+0+2) = 7, and 0 for each of the three isolated villages, giving 9.",
        "Example 2:\nInput:\n4 2\n1 4 8 10\nOutput: 5\nExplanation: Offices at 1 and 8 serve [1,4] at cost 3 and [8,10] at cost 2, total 5.",
        "Constraints:\n- 1 <= P <= V <= 300\n- 1 <= position <= 10000, positions strictly increasing",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, K;
    cin >> n >> K;
    vector<long long> x(n + 1);
    for (int i = 1; i <= n; i++) cin >> x[i];
    sort(x.begin() + 1, x.end());
    vector<long long> pre(n + 1, 0);
    for (int i = 1; i <= n; i++) pre[i] = pre[i - 1] + x[i];
    auto cost = [&](int l, int r) -> long long {
        if (l > r) return 0;
        int mid = (l + r) / 2;                 // the median village hosts the office
        long long m = x[mid];
        long long left = (long long)(mid - l) * m - (pre[mid - 1] - pre[l - 1]);
        long long right = (pre[r] - pre[mid]) - (long long)(r - mid) * m;
        return left + right;
    };
    const long long INF = (long long)4e18;
    vector<long long> prv(n + 1, INF), cur(n + 1, INF);
    vector<int> optPrev(n + 2, 0), optCur(n + 2, 0);
    prv[0] = 0;
    for (int k = 1; k <= K; k++) {
        fill(cur.begin(), cur.end(), INF);
        optCur[n + 1] = n - 1;
        for (int i = n; i >= 1; i--) {
            int lo = max(0, optPrev[i]), hi = min(i - 1, optCur[i + 1]);
            long long best = INF;
            int bt = lo;
            for (int t = lo; t <= hi; t++) {
                if (prv[t] >= INF) continue;
                long long v = prv[t] + cost(t + 1, i);
                if (v < best) { best = v; bt = t; }
            }
            cur[i] = best;
            optCur[i] = bt;
        }
        prv = cur;
        optPrev = optCur;
    }
    cout << prv[n] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the classic judge form of the layered median-split DP: dp[k][i] = min over t of dp[k-1][t] + cost(t+1, i), where cost(l, r) is the sum of distances from villages l..r to their median. The restriction that an office must sit in a village costs nothing, because the median village is itself a valid site.",
        "cost(l, r) obeys the quadrangle inequality: widening a block never helps more than widening a sub-block, which is what the inequality states formally. Hence the optimal boundary is monotone, opt[k-1][i] <= opt[k][i] <= opt[k][i+1], and each layer's inner scans telescope from O(n^2) to O(n).",
        "Only the previous layer is ever read, so two rolling rows of dp and two of opt suffice. Keeping opt for the previous layer is essential - it supplies the lower bound - so do not roll it away with the dp row by accident.",
        "The trap specific to this problem is assuming each office serves an equal number of villages, or splitting on position gaps. Neither is optimal: a wide gap can be worth paying for if it keeps a dense cluster in one cheap block. Also note the median index (l + r) / 2 with an even-sized block picks the lower median, which is fine since both medians give the same cost.",
        "Time: O(V * P). Space: O(V).",
      ],
    },
    {
      name: "Ciel and Gondolas",
      difficulty: "Hard",
      variation: "Layered Knuth with a 2D prefix-sum block cost",
      link: "https://codeforces.com/problemset/problem/321/E",
      question: [
        "n people queue for k gondolas. The gondolas are boarded in order, so the i-th gondola takes some contiguous stretch of the queue, and every gondola must take at least one person. You are given a symmetric matrix u where u[i][j] is the unfamiliarity between person i and person j (u[i][i] = 0). The unfamiliarity of a gondola is the sum of u[i][j] over all unordered pairs i, j riding it. Minimise the total unfamiliarity over all k gondolas.",
        "Input: n and k on the first line, then the n by n matrix. Print the minimum total.",
        "Example 1:\nInput:\n5 2\n0 0 1 1 1\n0 0 1 1 1\n1 1 0 0 0\n1 1 0 0 0\n1 1 0 0 0\nOutput: 0\nExplanation: Splitting after person 2 gives gondolas {1,2} and {3,4,5}, and every pair inside each gondola has unfamiliarity 0.",
        "Example 2:\nInput:\n8 3\n0 1 1 1 1 1 1 1\n1 0 1 1 1 1 1 1\n1 1 0 1 1 1 1 1\n1 1 1 0 1 1 1 1\n1 1 1 1 0 1 1 1\n1 1 1 1 1 0 1 1\n1 1 1 1 1 1 0 1\n1 1 1 1 1 1 1 0\nOutput: 7\nExplanation: Every pair costs 1, so a gondola of size s costs s * (s - 1) / 2. Sizes 3, 3, 2 give 3 + 3 + 1 = 7, and no other split of 8 into three parts is cheaper.",
        "Constraints:\n- 1 <= n <= 4000\n- 1 <= k <= min(n, 800)\n- 0 <= u[i][j] <= 9, u is symmetric with zero diagonal",
      ],
      code: `static char buf[1 << 16];
static int bufLen = 0, bufPos = 0;

static inline int gc() {
    if (bufPos == bufLen) {
        bufLen = (int)fread(buf, 1, sizeof(buf), stdin);
        bufPos = 0;
        if (bufLen <= 0) return -1;
    }
    return buf[bufPos++];
}

static inline int readInt() {
    int c = gc();
    while (c < '0' || c > '9') c = gc();
    int x = 0;
    while (c >= '0' && c <= '9') { x = x * 10 + (c - '0'); c = gc(); }
    return x;
}

int main() {
    int n = readInt(), K = readInt();
    vector<vector<int>> S(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) {
            int u = readInt();
            S[i][j] = u + S[i - 1][j] + S[i][j - 1] - S[i - 1][j - 1];
        }
    // each unordered pair inside the block is counted twice by the square sum
    auto cost = [&](int l, int r) -> long long {
        return (long long)(S[r][r] - S[l - 1][r] - S[r][l - 1] + S[l - 1][l - 1]) / 2;
    };
    const long long INF = (long long)4e18;
    vector<long long> prv(n + 1, INF), cur(n + 1, INF);
    vector<int> optPrev(n + 2, 0), optCur(n + 2, 0);
    prv[0] = 0;
    for (int k = 1; k <= K; k++) {
        fill(cur.begin(), cur.end(), INF);
        optCur[n + 1] = n - 1;
        for (int i = n; i >= 1; i--) {
            int lo = max(0, optPrev[i]), hi = min(i - 1, optCur[i + 1]);
            long long best = INF;
            int bt = lo;
            for (int t = lo; t <= hi; t++) {
                if (prv[t] >= INF) continue;
                long long v = prv[t] + cost(t + 1, i);
                if (v < best) { best = v; bt = t; }
            }
            cur[i] = best;
            optCur[i] = bt;
        }
        prv = cur;
        optPrev = optCur;
    }
    printf("%lld\\n", prv[n]);
    return 0;
}`,
      explanation: [
        "Boarding in order forces every gondola to be a contiguous block of the queue, so this is the same layered split DP as Post Office with a different block cost: dp[k][i] = min over t of dp[k-1][t] + cost(t+1, i).",
        "cost(l, r) is the sum of u over the square [l..r] x [l..r] divided by two, since the square counts each unordered pair twice and the diagonal is zero. A 2D prefix sum makes it O(1). This cost satisfies the quadrangle inequality because u is non-negative: growing the block only adds pairs, and the pairs added when extending a wide block are a superset of those added when extending a narrow one.",
        "So the optimal boundary is monotone in both directions, opt[k-1][i] <= opt[k][i] <= opt[k][i+1], and layers ascending with the index descending makes both bounds available. That turns 800 layers times 4000 indices times a 4000-wide scan into roughly 800 * 4000 total work.",
        "Practical constraints dominate here. The prefix matrix is 4001 by 4001 ints, about 64 MB, so it must be int rather than long long, which is safe because the largest square sum is under 4000 * 4000 * 9 and fits comfortably. Reading 16 million numbers also needs a buffered reader; cin with sync disabled is borderline and scanf is too slow.",
        "The tempting wrong approach is a convex hull trick: the transition is not of the form min(m * x + c) in any usable variable, since the block cost is not linear in the split index. Divide and conquer optimization is the other valid route with the same complexity, but plain layered DP without any optimization is hopeless at these limits.",
        "Time: O(n^2) to build the prefix sums plus O(n * k) for the DP. Space: O(n^2) for the prefix matrix, O(n) for the DP rows.",
      ],
    },
    {
      name: "Minimum Cost to Merge Stones",
      difficulty: "Hard",
      variation: "K-way merge - the case where split monotonicity fails",
      link: "https://leetcode.com/problems/minimum-cost-to-merge-stones/",
      question: [
        "There are n piles of stones in a row, the i-th containing stones[i] stones. A move consists of merging exactly K consecutive piles into one pile, at a cost equal to the total number of stones in those K piles. Return the minimum cost to merge all piles into one, or -1 if it is impossible.",
        "Example 1:\nInput: stones = [3, 2, 4, 1], K = 2\nOutput: 20\nExplanation: Merge [3,2] for 5 giving [5,4,1], merge [4,1] for 5 giving [5,5], merge for 10. Total 20.",
        "Example 2:\nInput: stones = [3, 2, 4, 1], K = 3\nOutput: -1\nExplanation: Each move reduces the pile count by K - 1 = 2, so from 4 piles you reach 2 and then cannot move again. No sequence ends with one pile.",
        "Example 3:\nInput: stones = [3, 5, 1, 2, 6], K = 3\nOutput: 25\nExplanation: Merge [5,1,2] for 8 giving [3,8,6], then merge all three for 17. Total 25.",
        "Constraints:\n- 1 <= n <= 30\n- 2 <= K <= 30\n- 1 <= stones[i] <= 100",
      ],
      code: `int mergeStones(vector<int>& stones, int K) {
    int n = stones.size();
    if ((n - 1) % (K - 1) != 0) return -1;   // each move removes K-1 piles
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];
    const int INF = 1e9;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = K; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = INF;
            // only splits at multiples of K-1 from i can leave two mergeable halves
            for (int m = i; m < j; m += K - 1)
                dp[i][j] = min(dp[i][j], dp[i][m] + dp[m + 1][j]);
            // pay the interval sum only when i..j can actually collapse to one pile
            if ((len - 1) % (K - 1) == 0) dp[i][j] += pre[j + 1] - pre[i];
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "Feasibility first: every move turns K piles into 1, removing K - 1 piles, so reaching a single pile from n requires (n - 1) to be divisible by (K - 1). Otherwise the answer is -1 regardless of the values.",
        "State: dp[i][j] is the minimum cost of merging i..j into as few piles as possible, which is 1 + (j - i) mod (K - 1) piles. The transition splits at m and adds the interval sum only on those intervals that genuinely collapse to one pile, i.e. when (len - 1) mod (K - 1) == 0. Restricting m to steps of K - 1 from i keeps the left part collapsible to one pile, which is what makes the two sub-results composable.",
        "This is the entry that shows the limits of the pattern. For K = 2 the recurrence is exactly the Slimes recurrence, the added term is the k-independent interval sum, and Knuth's O(n^2) window applies verbatim. For K >= 3 the added cost appears only on some interval lengths, so the cost function is no longer monotone in the required sense, split monotonicity is not guaranteed, and clamping the inner loop to [opt[i][j-1], opt[i+1][j]] can return a wrong answer.",
        "So the tempting mistake is generalising the optimization rather than the DP. The right move is to check the two hypotheses - additive term independent of the split, and quadrangle inequality on that term - before shrinking any loop. Here they fail, and the honest O(n^3 / K) DP is the correct solution; at n <= 30 that is trivial anyway.",
        "A second trap is initialising dp[i][j] for short intervals: any interval shorter than K needs cost 0, not INF, because it is already in its minimal form and contributes nothing on its own.",
        "Time: O(n^3 / K). Space: O(n^2).",
      ],
    },
  ],
};
