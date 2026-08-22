import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Frog 3",
      difficulty: "Easy",
      variation: "Monotone CHT template (squared distance cost)",
      link: "https://atcoder.jp/contests/dp/tasks/dp_z",
      question: [
        "There are N stones numbered 1..N with heights h_1 < h_2 < ... < h_N, and a constant C. A frog starts on stone 1 and repeatedly jumps to any stone with a larger index. Jumping from stone i to stone j costs (h_i - h_j)^2 + C. Print the minimum total cost to reach stone N.",
        "Input: the first line has N and C, the second line has h_1 ... h_N. Output a single integer.",
        "Example 1:\nInput:\n5 6\n1 2 3 4 5\nOutput: 20\nExplanation: The cheapest route is 1 -> 3 -> 5: (1-3)^2 + 6 = 10 and (3-5)^2 + 6 = 10, total 20. Jumping stone by stone costs 4 * 7 = 28.",
        "Example 2:\nInput:\n2 1000000000000\n500000 1000000\nOutput: 1250000000000\nExplanation: Only one jump is possible: (1000000 - 500000)^2 + 10^12 = 2.5 * 10^11 + 10^12.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= C <= 10^12\n- 1 <= h_1 < h_2 < ... < h_N <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long C;
    cin >> n >> C;
    vector<long long> h(n);
    for (int i = 0; i < n; i++) cin >> h[i];
    vector<long long> hm, hb;   // hull of lines y = hm*x + hb, slopes strictly decreasing
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        // middle line i2 can never be the minimum once i3 exists; products need 128 bits
        return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) <=
               (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
    };
    auto addLine = [&](long long m, long long b) {
        hm.push_back(m);
        hb.push_back(b);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        // queries arrive with x non-decreasing, so the winner only moves forward
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] <= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    vector<long long> dp(n, 0);
    addLine(-2 * h[0], h[0] * h[0]);
    for (int j = 1; j < n; j++) {
        dp[j] = query(h[j]) + h[j] * h[j] + C;
        addLine(-2 * h[j], dp[j] + h[j] * h[j]);
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "The plain DP is dp[j] = min over i < j of dp[i] + (h[j] - h[i])^2 + C, which is O(n^2). Expand the square: dp[j] = h[j]^2 + C + min over i of (dp[i] + h[i]^2 - 2*h[i]*h[j]). Everything depending on i is now packed into a line: slope m_i = -2*h[i], intercept b_i = dp[i] + h[i]^2, evaluated at x = h[j].",
        "So each finished state contributes one line and each new state is one lower-envelope query. Two monotonicities make this cheap: h is increasing, so the slopes -2*h[i] arrive strictly decreasing, and the query points h[j] also increase. A vector used as a stack plus a single forward-only pointer therefore suffices - no binary search and no Li Chao tree.",
        "The hull invariant is that consecutive breakpoints increase. When a new line is appended, the previous line is popped while the intersection of its two neighbours lies at or before its own left breakpoint, meaning it is nowhere strictly below both. That is exactly the bad() test, written as a cross-multiplication so no floating point is involved.",
        "Two traps. First, comparing breakpoints with doubles loses precision here, and the cross-multiplied products reach about 3*10^12 * 4*10^6, so they must be done in __int128. Second, the query pointer can end up past the end of the hull after pops, so it must be clamped; forgetting that is the classic out-of-range bug in this template.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Kalila and Dimna in the Logging Industry",
      difficulty: "Medium",
      variation: "Lines given directly by the input (monotone slopes)",
      link: "https://codeforces.com/problemset/problem/319/C",
      question: [
        "There are n trees; tree i has height a_i and a charge cost b_i, with a_1 < a_2 < ... < a_n and b_1 >= b_2 >= ... >= b_n = 0. A chainsaw must be recharged before each cut; recharging costs b_j where j is the index of any tree that has already been cut to height 0. Cutting one unit of height off a tree costs nothing, and the saw starts charged, so tree 1 can always be cut first. Every tree must be reduced to height 0. Print the minimum total recharge cost.",
        "Input: the first line has n, the second line has a_1 ... a_n, the third line has b_1 ... b_n. Output a single integer.",
        "Example 1:\nInput:\n5\n1 2 3 4 5\n5 4 3 2 0\nOutput: 25\nExplanation: Cut tree 1 for free, then cut tree 5 directly, paying b_1 * a_5 = 5 * 5 = 25 in recharges. Every mixed order costs at least 30.",
        "Example 2:\nInput:\n6\n1 2 3 10 20 30\n6 5 4 3 2 0\nOutput: 138\nExplanation: Cut tree 1 free, then tree 3 for b_1 * a_3 = 18, then tree 6 for b_3 * a_6 = 4 * 30 = 120, total 138.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a_i <= 10^9 and a is strictly increasing\n- 0 <= b_i <= 10^9, b is non-increasing and b_n = 0",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n), b(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < n; i++) cin >> b[i];
    vector<long long> hm, hb;
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) <=
               (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
    };
    auto addLine = [&](long long m, long long c) {
        if (!hm.empty() && hm.back() == m) {   // equal slopes: keep only the lower intercept
            if (hb.back() <= c) return;
            hm.pop_back();
            hb.pop_back();
        }
        hm.push_back(m);
        hb.push_back(c);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] <= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    vector<long long> dp(n, 0);
    addLine(b[0], 0);                          // tree 1 is cuttable for free
    for (int i = 1; i < n; i++) {
        dp[i] = query(a[i]);
        addLine(b[i], dp[i]);
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "Because b is non-increasing and a is increasing, cutting the tallest tree last is never forced to be expensive: once tree n is down, b_n = 0 makes every remaining cut free, so the answer is exactly the cheapest cost of getting tree n to zero. Let dp[i] be the minimum recharge cost to fell tree i; then dp[i] = min over j < i of dp[j] + b[j] * a[i], because a tree is felled by paying for a_i recharges at the rate of some already-felled tree j.",
        "Each state j is a line with slope b[j] and intercept dp[j], and the transition for i is a lower-envelope query at x = a[i]. The slopes arrive non-increasing (b is sorted by the statement) and the queries increase, so this is the pure monotone hull again with a stack and a forward pointer.",
        "The one detail this problem adds over the template is repeated slopes: b_j can tie. Two parallel lines make the breakpoint denominator zero, so before pushing, a tie is resolved by keeping only the smaller intercept. Skipping that check divides by zero inside the geometry test.",
        "A tempting wrong reading is to always recharge at the cheapest available rate greedily, i.e. always use the last tree felled. That fails because reaching a tree with a small b may itself cost more than it saves; the DP is what balances the two.",
        "Products reach 10^9 * 10^9, so dp values need 64-bit storage and the hull comparison needs __int128.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Land Acquisition",
      difficulty: "Medium",
      variation: "Dominance pruning, then CHT over groups",
      link: "https://www.spoj.com/problems/ACQUIRE/",
      question: [
        "Farmer John wants to buy N rectangular plots; plot i has width w_i and height h_i. He buys the plots in groups: the price of a group is (maximum width in the group) times (maximum height in the group). Each plot must belong to exactly one group, and groups may be formed arbitrarily. Print the minimum total price.",
        "Input: the first line has N, then N lines each hold w_i and h_i. Output a single integer.",
        "Example 1:\nInput:\n4\n100 1\n15 15\n20 5\n1 100\nOutput: 500\nExplanation: Buy {100x1} for 100, {20x5, 15x15} for 20 * 15 = 300, and {1x100} for 100. Total 500. Buying all four separately costs 525.",
        "Example 2:\nInput:\n2\n2 3\n1 1\nOutput: 6\nExplanation: Plot 1x1 is dominated by 2x3, so it can join that group for free: 2 * 3 = 6.",
        "Constraints:\n- 1 <= N <= 50000\n- 1 <= w_i, h_i <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<long long,long long>> r(n);
    for (auto& p : r) cin >> p.first >> p.second;
    sort(r.begin(), r.end(), [](const pair<long long,long long>& x,
                                const pair<long long,long long>& y) {
        if (x.first != y.first) return x.first > y.first;
        return x.second > y.second;
    });
    vector<pair<long long,long long>> v;      // drop every dominated plot
    long long bestH = 0;
    for (auto& p : r) {
        if (p.second > bestH) {
            v.push_back(p);
            bestH = p.second;
        }
    }
    reverse(v.begin(), v.end());              // width increasing, height decreasing
    int k = v.size();
    vector<long long> hm, hb;
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) <=
               (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
    };
    auto addLine = [&](long long m, long long c) {
        hm.push_back(m);
        hb.push_back(c);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] <= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    vector<long long> dp(k + 1, 0);
    for (int i = 1; i <= k; i++) {
        addLine(v[i - 1].second, dp[i - 1]);  // a group that starts at plot i
        dp[i] = query(v[i - 1].first);
    }
    cout << dp[k] << "\\n";
    return 0;
}`,
      explanation: [
        "First prune: if some plot has both width and height at least as large as another, the smaller plot can always be dropped into the larger one's group without changing that group's price. Sorting by width descending and keeping only plots whose height beats every height seen so far removes all dominated plots in one pass.",
        "What survives has width strictly increasing and height strictly decreasing. In that order an optimal solution uses contiguous groups: a group of plots i+1..j costs w_j * h_(i+1), the largest width times the largest height. So dp[j] = min over i < j of dp[i] + w_j * h_(i+1), with dp[0] = 0.",
        "Fix i and this is a line in the query variable w_j: slope h_(i+1), intercept dp[i]. Heights decrease, so slopes are added strictly decreasing, and widths increase, so queries are increasing - the monotone hull applies directly. Note that the line for i must be inserted before dp[i+1] is queried, which is why addLine comes first inside the loop.",
        "Skipping the dominance pruning is the usual mistake: without it the sorted order does not make heights monotone, contiguity of optimal groups fails, and the slopes are no longer sorted.",
        "Time: O(n log n) for the sort, O(n) for the DP. Space: O(n).",
      ],
    },
    {
      name: "The Fair Nut and Rectangles",
      difficulty: "Medium",
      variation: "Upper envelope (maximum CHT), decreasing queries",
      link: "https://codeforces.com/problemset/problem/1083/E",
      question: [
        "You are given n rectangles, the i-th with opposite corners (0, 0) and (x_i, y_i) and a cost a_i. No rectangle is contained inside another. Choose a non-empty subset of rectangles; the profit is the area of the union of the chosen rectangles minus the sum of their costs. Print the maximum possible profit.",
        "Input: the first line has n, then n lines each hold x_i, y_i and a_i. Output a single integer.",
        "Example 1:\nInput:\n3\n4 4 8\n1 5 0\n5 2 10\nOutput: 9\nExplanation: Take the 1x5 and 4x4 rectangles. Their union has area 5 + (4-1)*4 = 17 and the costs are 0 + 8 = 8, giving 9.",
        "Example 2:\nInput:\n4\n6 2 4\n1 6 2\n2 4 3\n5 3 8\nOutput: 10\nExplanation: Take the 1x6 and 6x2 rectangles: union area 6 + (6-1)*2 = 16, costs 2 + 4 = 6, profit 10.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= x_i, y_i <= 10^9\n- 0 <= a_i <= x_i * y_i\n- No rectangle contains another, so sorting by x makes y decrease",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<array<long long,3>> r(n);
    for (auto& t : r) cin >> t[0] >> t[1] >> t[2];
    sort(r.begin(), r.end());                 // x increasing, therefore y decreasing
    vector<long long> hm, hb;
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        // upper envelope, slopes strictly decreasing: middle line is never the maximum
        return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) >=
               (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
    };
    auto addLine = [&](long long m, long long c) {
        hm.push_back(m);
        hb.push_back(c);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        // queries arrive with x decreasing, so the winner still only moves forward
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] >= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    long long ans = 0;
    addLine(0, 0);                            // the empty prefix: start a fresh chain
    for (int i = 0; i < n; i++) {
        long long cur = r[i][0] * r[i][1] - r[i][2] + query(r[i][1]);
        ans = max(ans, cur);
        addLine(-r[i][0], cur);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Sort by x increasing; since no rectangle contains another, y then decreases. For a chosen subset in this order the union is a staircase, and the area added by rectangle i on top of the previously chosen rectangle j is x_i*y_i - x_j*y_i. So with dp[i] = best profit for a subset whose largest-x member is i, dp[i] = x_i*y_i - a_i + max(0, max over j < i of (dp[j] - x_j*y_i)).",
        "Each earlier state j is the line slope = -x_j, intercept = dp[j], queried at x = y_i, and this time we want the maximum, i.e. the upper envelope. The virtual line (slope 0, intercept 0) represents starting a new chain at i, which is what the max(0, ...) term means.",
        "Both monotonicities still hold but with flipped signs: slopes -x_j decrease as i grows, and the query points y_i decrease. For an upper envelope with decreasing slopes, the optimal line index grows as x shrinks, so a single forward-only pointer is again correct - the direction of the query sweep is what decides whether you need max or min in the pointer test.",
        "The trap is treating the area as a simple sum of x_i*y_i, which double counts the overlapping parts, or forgetting the max with 0 and forcing every subset to extend an earlier one.",
        "Values reach 10^18, so dp is 64-bit and the envelope test needs __int128; also read input fast, since n can be 10^6.",
        "Time: O(n log n) dominated by the sort. Space: O(n).",
      ],
    },
    {
      name: "Commando",
      difficulty: "Medium",
      variation: "Quadratic group cost, upper envelope with increasing slopes",
      question: [
        "A commander has n soldiers in a fixed line, soldier i having strength x_i. He must split the line into consecutive, non-empty groups. A group whose total strength is t fights with adjusted effectiveness a*t^2 + b*t + c, where a < 0. Print the maximum total adjusted effectiveness over all ways of splitting the line.",
        "Input: the first line has n, the second line has a, b and c, the third line has x_1 ... x_n. Output a single integer.",
        "Example 1:\nInput:\n5\n-1 10 -20\n2 2 3 4 1\nOutput: 10\nExplanation: With f(t) = -t^2 + 10t - 20 the split [2,2][3][4,1] gives f(4) + f(3) + f(5) = 4 + 1 + 5 = 10, and no other split beats it.",
        "Example 2:\nInput:\n3\n-1 5 -1\n1 1 1\nOutput: 9\nExplanation: f(t) = -t^2 + 5t - 1, so f(1) = 3 and three singleton groups give 9, better than f(2) + f(1) = 8 or f(3) = 5.",
        "Constraints:\n- 1 <= n <= 10^6\n- -5 <= a <= -1\n- 0 <= b, c <= 10^7\n- 1 <= x_i <= 100",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long ca, cb, cc;
    cin >> n >> ca >> cb >> cc;
    vector<long long> s(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        s[i] = s[i - 1] + x;
    }
    vector<long long> hm, hb;   // upper envelope, slopes strictly increasing
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        return (__int128)(hb[i1] - hb[i3]) * (hm[i2] - hm[i1]) <=
               (__int128)(hb[i1] - hb[i2]) * (hm[i3] - hm[i1]);
    };
    auto addLine = [&](long long m, long long b) {
        hm.push_back(m);
        hb.push_back(b);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] >= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    vector<long long> dp(n + 1, 0);
    addLine(-2 * ca * s[0], dp[0] + ca * s[0] * s[0] - cb * s[0]);
    for (int i = 1; i <= n; i++) {
        dp[i] = ca * s[i] * s[i] + cb * s[i] + cc + query(s[i]);
        addLine(-2 * ca * s[i], dp[i] + ca * s[i] * s[i] - cb * s[i]);
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Let s be the prefix sums of x and dp[i] the best total for the first i soldiers. Then dp[i] = max over j < i of dp[j] + f(s[i] - s[j]) with f(t) = a*t^2 + b*t + c. Expanding f(s[i] - s[j]) separates the two indices: a*s[i]^2 + b*s[i] + c is constant for the query, and the j-dependent part is (dp[j] + a*s[j]^2 - b*s[j]) + (-2*a*s[j])*s[i] - a line in the query variable s[i].",
        "Since a < 0, the slope -2*a*s[j] is a positive increasing function of s[j], so lines arrive with strictly increasing slopes, and the query points s[i] also increase. That is the mirror image of the first template: an upper envelope maintained as a stack, swept by one forward pointer. The sign of a is what makes the slopes sorted at all, which is why the problem guarantees it.",
        "Concavity is the deeper reason this works: f is concave, so the cost of merging groups is well behaved and the envelope of the transition lines is exactly what the DP needs. If a were positive the slopes would still be monotone but the envelope would be a lower one, and the pointer test would flip.",
        "Watch the arithmetic: s can reach 10^8, so a*s^2 is about 5*10^16 and the envelope cross products must be done in __int128. Reading 10^6 numbers also needs fast input.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Batch Scheduling",
      difficulty: "Medium",
      variation: "Suffix DP: cost charged to all later jobs",
      question: [
        "N jobs must run on one machine in the given order. Job i needs T_i units of machine time and has a cost factor F_i. The jobs are partitioned into consecutive batches; before each batch the machine needs a setup time S. A batch starts when the previous batch has finished, and every job in a batch is considered finished at the moment the whole batch finishes. If a job finishes at time t, its cost is t * F_i. Print the minimum total cost, where time starts at 0.",
        "Input: the first line has N, the second line has S, then N lines each hold T_i and F_i. Output a single integer.",
        "Example 1:\nInput:\n3\n2\n1 10\n3 1\n1 10\nOutput: 129\nExplanation: Batch {1} finishes at 2 + 1 = 3, costing 3 * 10 = 30. Batch {2,3} then finishes at 3 + 2 + 3 + 1 = 9, costing 9 * (1 + 10) = 99. Total 129, better than one single batch (7 * 21 = 147) or three singleton batches (30 + 8 * 1 + 11 * 10 = 148).",
        "Example 2:\nInput:\n1\n5\n2 3\nOutput: 21\nExplanation: The only batch finishes at 5 + 2 = 7, so the cost is 7 * 3 = 21.",
        "Constraints:\n- 1 <= N <= 10000\n- 0 <= S <= 50000\n- 1 <= T_i, F_i <= 100",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    vector<long long> T(n + 1), F(n + 1);
    for (int i = 1; i <= n; i++) cin >> T[i] >> F[i];
    vector<long long> TP(n + 1, 0), FS(n + 2, 0);
    for (int i = 1; i <= n; i++) TP[i] = TP[i - 1] + T[i];
    for (int i = n; i >= 1; i--) FS[i] = FS[i + 1] + F[i];
    vector<long long> hm, hb;
    int ptr = 0;
    auto bad = [&](int i1, int i2, int i3) {
        return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) <=
               (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
    };
    auto addLine = [&](long long m, long long c) {
        if (!hm.empty() && hm.back() == m) {   // T_i can tie, so parallel lines can appear
            if (hb.back() <= c) return;
            hm.pop_back();
            hb.pop_back();
        }
        hm.push_back(m);
        hb.push_back(c);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
        if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
    };
    auto query = [&](long long x) {
        while (ptr + 1 < (int)hm.size() &&
               hm[ptr + 1] * x + hb[ptr + 1] <= hm[ptr] * x + hb[ptr]) ptr++;
        return hm[ptr] * x + hb[ptr];
    };
    vector<long long> dp(n + 2, 0);
    addLine(TP[n], 0);                          // the sentinel state j = n + 1
    for (int i = n; i >= 1; i--) {
        dp[i] = FS[i] * (S - TP[i - 1]) + query(FS[i]);
        addLine(TP[i - 1], dp[i]);
    }
    cout << dp[1] << "\\n";
    return 0;
}`,
      explanation: [
        "Doing this DP forwards fails, because the finish time of a batch depends on everything scheduled before it, so a prefix state does not carry enough information. The fix is to run the DP backwards over suffixes: let dp[i] be the minimum cost of jobs i..n assuming the machine is free at time 0 for them. Choosing the first batch to be i..j-1 gives dp[i] = min over j > i of dp[j] + (S + TP[j-1] - TP[i-1]) * FS[i].",
        "The reason that recurrence is right is the charging trick: the elapsed time S + (batch time) delays every job from i onward, so multiplying by the suffix sum FS[i] accounts for that delay once and for all, and dp[j] can then pretend it starts at time 0 again.",
        "Rearranged, dp[i] = FS[i]*(S - TP[i-1]) + min over j of (dp[j] + TP[j-1]*FS[i]): line slope TP[j-1], intercept dp[j], queried at x = FS[i]. Sweeping i downwards adds slopes in decreasing order (prefix sums shrink) and queries in increasing order (suffix sums grow), so the plain monotone lower hull works.",
        "Two details bite. T_i values are positive here but the same recurrence is often written with possible zero-length jobs, so the parallel-line guard is kept. And the sentinel line for j = n+1, slope TP[n] with intercept 0, must be inserted before the loop, otherwise the last batch has no way to terminate.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Product Sum",
      difficulty: "Hard",
      variation: "Monotone insertion, arbitrary queries (binary search on the hull)",
      link: "https://codeforces.com/problemset/problem/631/E",
      question: [
        "You are given an array a_1..a_n. Its characteristic is the sum of i * a_i over all i. You must move exactly one element to any position of the array (possibly back to its own position), shifting the elements in between accordingly. Print the maximum characteristic the array can have afterwards.",
        "Input: the first line has n, the second line has a_1 ... a_n. Output a single integer.",
        "Example 1:\nInput:\n4\n4 3 2 5\nOutput: 39\nExplanation: The starting characteristic is 4 + 6 + 6 + 20 = 36. Moving a_1 = 4 to position 3 gives [3, 2, 4, 5] with characteristic 3 + 4 + 12 + 20 = 39.",
        "Example 2:\nInput:\n5\n1 1 2 7 1\nOutput: 49\nExplanation: Moving the last element to the front gives [1, 1, 1, 2, 7] with characteristic 1 + 2 + 3 + 8 + 35 = 49, up from 42.",
        "Example 3:\nInput:\n3\n1 1 2\nOutput: 9\nExplanation: The characteristic is already 1 + 2 + 6 = 9 and no move improves it, so the element is moved back onto itself.",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- |a_i| <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n + 1), P(n + 1, 0);
    long long base = 0;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        P[i] = P[i - 1] + a[i];
        base += (long long)i * a[i];
    }
    vector<long long> hm, hb;   // upper envelope, slopes strictly increasing, random queries
    auto bad = [&](int i1, int i2, int i3) {
        return (__int128)(hb[i1] - hb[i3]) * (hm[i2] - hm[i1]) <=
               (__int128)(hb[i1] - hb[i2]) * (hm[i3] - hm[i1]);
    };
    auto addLine = [&](long long m, long long c) {
        if (!hm.empty() && hm.back() == m) {
            if (hb.back() >= c) return;
            hm.pop_back();
            hb.pop_back();
        }
        hm.push_back(m);
        hb.push_back(c);
        while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
            hm.erase(hm.end() - 2);
            hb.erase(hb.end() - 2);
        }
    };
    auto query = [&](long long x) {
        // no monotonicity in x, so bisect on the breakpoints of the envelope
        int lo = 0, hi = (int)hm.size() - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (hm[mid] * x + hb[mid] <= hm[mid + 1] * x + hb[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        return hm[lo] * x + hb[lo];
    };
    long long best = 0;                        // moving an element onto itself gains 0
    for (int i = 1; i <= n; i++) {             // move a_i left to some position j <= i
        addLine(i, -P[i - 1]);
        best = max(best, -a[i] * i + P[i - 1] + query(a[i]));
    }
    hm.clear();
    hb.clear();
    for (int i = n; i >= 1; i--) {             // move a_i right to some position j >= i
        addLine(-i, -P[i]);                    // slope -j grows as i walks down
        best = max(best, -a[i] * i + P[i] + query(-a[i]));
    }
    cout << base + best << "\\n";
    return 0;
}`,
      explanation: [
        "Write P for the prefix sums. Moving a_i left into position j (j <= i) shifts a_j..a_(i-1) one step right, so the characteristic changes by (P[i-1] - P[j-1]) + a_i*(j - i). Moving it right into position j (j >= i) shifts a_(i+1)..a_j one step left, changing it by a_i*(j - i) - (P[j] - P[i]). Both are maximised independently, and moving onto its own position gives 0, which is why best starts at 0.",
        "Group each expression by j: the left case is (-a_i*i + P[i-1]) + max over j <= i of (j*a_i - P[j-1]), i.e. lines with slope j and intercept -P[j-1] evaluated at x = a_i. The right case is the same with intercept -P[j] and j >= i. Both are upper-envelope queries.",
        "The new difficulty is that the query points a_i are arbitrary integers in no particular order, so the forward-only pointer is invalid. Insertions are still monotone, though: sweeping i upwards adds slope j = i in increasing order. That combination - append-only hull, unordered queries - is answered by bisecting the envelope, because along the hull the value at a fixed x first rises then falls, so the first index where the next line stops improving is the maximum.",
        "For the right-hand pass the natural slope j decreases as i walks down, which would break append-only insertion. Rewriting j*a_i as (-j)*(-a_i) fixes it: insert slope -j, which now increases, and query at -a_i. This reflection trick is worth remembering; the alternative is a second hull implementation or a Li Chao tree.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Cats Transport",
      difficulty: "Hard",
      variation: "Layered DP: one hull per group count",
      link: "https://codeforces.com/problemset/problem/311/B",
      question: [
        "There are n hills in a row; d_i is the distance between hill i-1 and hill i. Feeders walk from hill 1 towards hill n at speed one distance unit per unit time. There are m cats: cat j finishes its trip on hill h_j at time t_j and then waits until a feeder passes and picks it up (a feeder picks up every cat already waiting on the hill it walks over). Exactly p feeders leave hill 1, each at a time of your choosing (times may be any integers, including negative). Print the minimum possible total waiting time of all cats.",
        "Input: the first line has n, m and p, the second line has d_2 ... d_n, then m lines each hold h_j and t_j. Output a single integer.",
        "Example 1:\nInput:\n3 3 2\n2 3\n1 0\n2 5\n3 10\nOutput: 2\nExplanation: Prefix distances are 0, 2, 5, so the three cats are ready for a feeder that departs at times 0, 3 and 5 respectively. One feeder departing at 0 collects the first cat with zero waiting; another departing at 5 collects the other two, making the second cat wait 5 - 3 = 2.",
        "Example 2:\nInput:\n2 2 1\n1\n1 0\n2 5\nOutput: 4\nExplanation: The cats need departures 0 and 4, and the single feeder must leave at 4, so the first cat waits 4.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= m <= 10^5\n- 1 <= p <= 100\n- 1 <= d_i <= 10^4\n- 1 <= h_j <= n, 0 <= t_j <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, p;
    cin >> n >> m >> p;
    vector<long long> D(n + 1, 0);
    for (int i = 2; i <= n; i++) {
        long long d;
        cin >> d;
        D[i] = D[i - 1] + d;
    }
    vector<long long> A(m);
    for (int j = 0; j < m; j++) {
        int h;
        long long t;
        cin >> h >> t;
        A[j] = t - D[h];                       // earliest departure that can collect this cat
    }
    sort(A.begin(), A.end());
    vector<long long> pre(m + 1, 0);
    for (int j = 0; j < m; j++) pre[j + 1] = pre[j] + A[j];
    const long long INF = (long long)4e18;
    vector<long long> prv(m + 1, INF), cur(m + 1, INF);
    prv[0] = 0;
    for (int layer = 1; layer <= p; layer++) {
        vector<long long> hm, hb;
        int ptr = 0;
        auto bad = [&](int i1, int i2, int i3) {
            return (__int128)(hb[i3] - hb[i1]) * (hm[i1] - hm[i2]) <=
                   (__int128)(hb[i2] - hb[i1]) * (hm[i1] - hm[i3]);
        };
        auto addLine = [&](long long mm, long long c) {
            hm.push_back(mm);
            hb.push_back(c);
            while ((int)hm.size() >= 3 && bad((int)hm.size() - 3, (int)hm.size() - 2, (int)hm.size() - 1)) {
                hm.erase(hm.end() - 2);
                hb.erase(hb.end() - 2);
            }
            if (ptr >= (int)hm.size()) ptr = (int)hm.size() - 1;
        };
        auto query = [&](long long x) {
            while (ptr + 1 < (int)hm.size() &&
                   hm[ptr + 1] * x + hb[ptr + 1] <= hm[ptr] * x + hb[ptr]) ptr++;
            return hm[ptr] * x + hb[ptr];
        };
        cur.assign(m + 1, INF);
        cur[0] = 0;
        for (int k = 1; k <= m; k++) {
            if (prv[k - 1] < INF) addLine(-(long long)(k - 1), prv[k - 1] + pre[k - 1]);
            if (!hm.empty()) cur[k] = A[k - 1] * k - pre[k] + query(A[k - 1]);
            cur[k] = min(cur[k], prv[k]);      // this feeder may simply stay home
        }
        prv = cur;
    }
    cout << prv[m] << "\\n";
    return 0;
}`,
      explanation: [
        "Reduce every cat to one number. A feeder departing at time s reaches hill h at s + D[h], so it can collect cat j exactly when s >= t_j - D[h_j]; call that value A_j, and the waiting time is s - A_j. Now the hills are gone: we have m numbers and p departure times, each cat is served by some departure at or after its own A_j, and the cost is the difference.",
        "Sort A. In an optimal plan each feeder serves a contiguous block of the sorted array and departs exactly at the largest A in its block, so the problem is: cut the sorted array into at most p contiguous blocks minimising sum over blocks of (max - each element). With dp[k][layer] = best cost for the first k cats using layer feeders, dp[k][layer] = min over i < k of dp[i][layer-1] + A[k]*(k-i) - (pre[k] - pre[i]).",
        "Fix the layer and this is A[k]*k - pre[k] + min over i of (dp[i][layer-1] + pre[i] + (-i)*A[k]): line slope -i, intercept dp[i][layer-1] + pre[i], queried at x = A[k]. Slopes decrease as i grows and the queries A[k] increase, so each layer is one linear sweep of a fresh monotone hull, turning O(p*m^2) into O(p*m).",
        "Two easy mistakes: forgetting that A_j can be negative (a cat on a far hill may be ready long before any feeder is needed), and forgetting that a feeder may be useless, which is what the min against prv[k] allows - without it the DP would be forced to use exactly p non-empty blocks and could return INF or an inflated cost.",
        "Time: O(m log m + p*m). Space: O(m).",
      ],
    },
    {
      name: "Building Bridges",
      difficulty: "Hard",
      variation: "Unsorted slopes: Li Chao tree instead of a monotone hull",
      question: [
        "There are n pillars in a row, the i-th of height h_i, and removing pillar i costs c_i. A bridge must be built from pillar 1 to pillar n: it consists of segments between consecutive pillars that are kept, and a segment between pillars i and j costs (h_i - h_j)^2. Every pillar strictly between two kept pillars must be removed, paying its cost. Pillars 1 and n are always kept. Print the minimum total cost of segments plus removals.",
        "Input: the first line has n, the second line has h_1 ... h_n, the third line has c_1 ... c_n. Output a single integer.",
        "Example 1:\nInput:\n3\n1 4 2\n7 1 3\nOutput: 2\nExplanation: Keeping all three pillars costs (1-4)^2 + (4-2)^2 = 13. Removing pillar 2 instead costs c_2 = 1 plus the single span (1-2)^2 = 1, so 2.",
        "Example 2:\nInput:\n5\n1 100 2 101 3\n1 1 100 1 1\nOutput: 4\nExplanation: Keep pillars 1, 3, 5 and remove pillars 2 and 4 for 1 + 1 = 2, paying spans (1-2)^2 + (2-3)^2 = 2, total 4. Removing pillar 3 as well would cost 100, and keeping the tall pillars costs almost 10^4 per span.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= h_i <= 10^6\n- 1 <= c_i <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> h(n + 1), c(n + 1), C(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> h[i];
    for (int i = 1; i <= n; i++) cin >> c[i];
    for (int i = 1; i <= n; i++) C[i] = C[i - 1] + c[i];
    vector<long long> xs(h.begin() + 1, h.end());          // queries only ever hit some h value
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    int k = xs.size();
    const long long INF = (long long)2e18;
    vector<long long> tm(4 * k, 0), tb(4 * k, INF);        // one candidate line per node
    function<void(int,int,int,long long,long long)> addLine =
        [&](int node, int l, int r, long long m, long long b) {
            int mid = (l + r) / 2;
            bool lef = m * xs[l] + b < tm[node] * xs[l] + tb[node];
            bool md = m * xs[mid] + b < tm[node] * xs[mid] + tb[node];
            if (md) {                                      // new line owns the midpoint
                swap(m, tm[node]);
                swap(b, tb[node]);
            }
            if (l == r) return;
            if (lef != md) addLine(2 * node, l, mid, m, b); // the loser can only win on one side
            else addLine(2 * node + 1, mid + 1, r, m, b);
        };
    function<long long(int,int,int,int)> query =
        [&](int node, int l, int r, int pos) {
            long long res = tm[node] * xs[pos] + tb[node];
            if (l == r) return res;
            int mid = (l + r) / 2;
            if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
            return min(res, query(2 * node + 1, mid + 1, r, pos));
        };
    auto idx = [&](long long v) {
        return (int)(lower_bound(xs.begin(), xs.end(), v) - xs.begin());
    };
    vector<long long> dp(n + 1, 0);
    addLine(1, 0, k - 1, -2 * h[1], h[1] * h[1] - C[1]);
    for (int j = 2; j <= n; j++) {
        dp[j] = query(1, 0, k - 1, idx(h[j])) + h[j] * h[j] + C[j - 1];
        addLine(1, 0, k - 1, -2 * h[j], dp[j] + h[j] * h[j] - C[j]);
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Let C be the prefix sums of the removal costs. If the pillar before j is i, everything in between is removed, so dp[j] = min over i < j of (dp[i] + (h[j] - h[i])^2 + C[j-1] - C[i]). Expanding gives dp[j] = h[j]^2 + C[j-1] + min over i of (dp[i] - C[i] + h[i]^2 + (-2*h[i])*h[j]) - a lower-envelope query at x = h[j], with each state contributing slope -2*h[i] and intercept dp[i] - C[i] + h[i]^2.",
        "This is where the monotone template breaks. The heights are in no particular order, so the slopes -2*h[i] arrive unsorted, and the query points h[j] are unsorted too. The stack-plus-pointer hull silently produces wrong answers here; that is the single most common bug in this family of problems.",
        "A Li Chao tree fixes both at once. Each node of a segment tree over the x-axis stores the one line that wins at its midpoint; inserting a line compares at the midpoint, keeps the winner in the node, and pushes the loser into the single child where it can still win. Queries walk root to leaf taking the minimum over O(log X) candidates, so insertion order stops mattering entirely.",
        "Because only the values h_1..h_n are ever queried, the x-axis is compressed to those at most n distinct coordinates, keeping the tree at 4n nodes instead of 4*10^6. A balanced BST of hull lines (the classic dynamic LineContainer) is the other standard answer and is preferable if the query points are not known in advance.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Escape Through Leaf",
      difficulty: "Hard",
      variation: "Merging Li Chao trees up a tree (small to large)",
      link: "https://codeforces.com/problemset/problem/932/F",
      question: [
        "You are given a rooted tree of n vertices, rooted at vertex 1, where vertex i has two integers a_i and b_i. From vertex i you may jump to any vertex j in the subtree of i, at a cost of a_i * b_j. For every vertex, print the minimum total cost of a sequence of jumps that ends at some leaf (a leaf is a vertex with no children, so the answer is 0 for leaves).",
        "Input: the first line has n, the second line has a_1 ... a_n, the third line has b_1 ... b_n, then n-1 lines each hold an edge u v. Output n integers.",
        "Example 1:\nInput:\n3\n1 2 3\n4 5 6\n1 2\n1 3\nOutput: 5 0 0\nExplanation: Vertices 2 and 3 are leaves. From vertex 1 the two options cost a_1*b_2 = 5 and a_1*b_3 = 6, so 5.",
        "Example 2:\nInput:\n4\n2 -3 1 1\n1 2 -4 5\n1 2\n2 3\n2 4\nOutput: -11 -15 0 0\nExplanation: Vertices 3 and 4 are leaves. From vertex 2 the options are a_2*b_3 = 12 and a_2*b_4 = -15, so dp[2] = -15. From vertex 1 the options are jumping straight to leaf 3 for a_1*b_3 = -8, straight to leaf 4 for 10, or to vertex 2 for a_1*b_2 = 4 and then -15, giving -11.",
        "Constraints:\n- 2 <= n <= 10^5\n- |a_i| <= 10^5\n- |b_i| <= 10^5",
      ],
      code: `const int LO = -100000, HI = 100000;
const long long INFL = (long long)4e18;

struct Node {
    long long m, b;
    int l, r;
};

vector<Node> t;   // index 0 is the null node

int newNode(long long m, long long b) {
    t.push_back({m, b, 0, 0});
    return (int)t.size() - 1;
}

void insertLine(int node, int lo, int hi, long long m, long long b) {
    int mid = lo + (hi - lo) / 2;              // floor division, safe for negative lo
    if (m * mid + b < t[node].m * (long long)mid + t[node].b) {
        swap(m, t[node].m);
        swap(b, t[node].b);
    }
    if (lo == hi) return;
    if (m * lo + b < t[node].m * (long long)lo + t[node].b) {
        if (!t[node].l) {
            int id = newNode(m, b);            // take the id first: t may reallocate
            t[node].l = id;
        } else insertLine(t[node].l, lo, mid, m, b);
    } else if (m * hi + b < t[node].m * (long long)hi + t[node].b) {
        if (!t[node].r) {
            int id = newNode(m, b);
            t[node].r = id;
        } else insertLine(t[node].r, mid + 1, hi, m, b);
    }
}

long long queryMin(int node, int lo, int hi, long long x) {
    if (!node) return INFL;
    long long res = t[node].m * x + t[node].b;
    if (lo == hi) return res;
    int mid = lo + (hi - lo) / 2;
    if (x <= mid) return min(res, queryMin(t[node].l, lo, mid, x));
    return min(res, queryMin(t[node].r, mid + 1, hi, x));
}

int mergeTree(int u, int v, int lo, int hi) {
    if (!u || !v) return u ? u : v;
    insertLine(u, lo, hi, t[v].m, t[v].b);     // reinsert v's own line into u
    if (lo == hi) return u;
    int mid = lo + (hi - lo) / 2;
    int L = mergeTree(t[u].l, t[v].l, lo, mid);
    t[u].l = L;
    int R = mergeTree(t[u].r, t[v].r, mid + 1, hi);
    t[u].r = R;
    return u;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n + 1), b(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= n; i++) cin >> b[i];
    vector<vector<int>> adj(n + 1);
    for (int e = 0; e < n - 1; e++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    t.clear();
    t.push_back({0, 0, 0, 0});
    vector<int> par(n + 1, 0), seen(n + 1, 0), order, st{1};
    seen[1] = 1;
    while (!st.empty()) {                      // iterative DFS: n can be 10^5 deep
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) {
            if (!seen[v]) {
                seen[v] = 1;
                par[v] = u;
                st.push_back(v);
            }
        }
    }
    vector<long long> dp(n + 1, 0);
    vector<int> root(n + 1, 0);
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i];
        dp[u] = (root[u] == 0) ? 0 : queryMin(root[u], LO, HI, a[u]);
        if (root[u] == 0) root[u] = newNode(b[u], dp[u]);
        else insertLine(root[u], LO, HI, b[u], dp[u]);
        if (par[u]) root[par[u]] = mergeTree(root[par[u]], root[u], LO, HI);
    }
    for (int i = 1; i <= n; i++) cout << dp[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "dp[u] = 0 for a leaf, and otherwise dp[u] = min over vertices v in the subtree of u, v not equal to u, of (dp[v] + a_u * b_v). Each candidate v is the line slope b_v, intercept dp[v], and the query point is x = a_u. So every vertex needs a lower envelope over all lines coming from its own subtree.",
        "Slopes b_v and queries a_u are arbitrary signed integers, so a monotone hull is out; each vertex needs a Li Chao tree over x in [-10^5, 10^5]. The structural problem is that a vertex needs the union of all its children's structures, which is solved by dynamic (pointer-based) Li Chao trees plus a merge routine: merging two nodes reinserts one node's line into the other and then merges the children recursively, exactly like segment tree merging.",
        "Order of operations matters. Process vertices in reverse DFS order so all children are finished first, answer dp[u] from the already merged tree of its children, and only then insert u's own line - inserting it earlier would let u jump to itself for cost a_u * b_u.",
        "The wrong-but-tempting shortcut is to only consider jumps to children rather than to any subtree vertex. Example 2 shows why it fails: from vertex 1 the direct jump to the deep leaf 3 is cheaper than any single-step route, and with negative values these long jumps are exactly where the optimum lives.",
        "Merging is amortised well because each merge either destroys a node or does O(log X) work per surviving line; the total cost is O(n log n) merges plus O(log X) per insertion. Small-to-large by subtree size gives the same bound with a simpler implementation but a heavier constant.",
        "Time: O(n log^2 X) worst case, where X is the coordinate range. Space: O(n log X).",
      ],
    },
  ],
};
