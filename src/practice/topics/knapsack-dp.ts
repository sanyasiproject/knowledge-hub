import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "0/1 Knapsack Problem",
      difficulty: "Easy",
      variation: "Template, full 2D table",
      question: [
        "You are given n items. Item i has weight wt[i] and value val[i], and there is exactly one copy of each item. You also have a bag that can carry a total weight of at most W. Choose a subset of the items so that the sum of their weights is at most W and the sum of their values is as large as possible. Return that maximum value. Items cannot be broken - each one is either taken whole or left behind.",
        "Example 1:\nInput: W = 10, wt = [5, 4, 6, 3], val = [10, 40, 30, 50]\nOutput: 90\nExplanation: Take items 2 and 4 (weights 4 and 3, total 7 <= 10) for value 40 + 50 = 90. Any pair including item 1 or item 3 either exceeds the capacity or is worth less, and no triple fits (the three lightest already weigh 12).",
        "Example 2:\nInput: W = 4, wt = [4, 5, 1], val = [1, 2, 3]\nOutput: 3\nExplanation: Item 3 alone (weight 1, value 3) is best. Adding item 1 would make the weight 5, over the capacity.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= W <= 1000\n- 1 <= wt[i], val[i] <= 1000",
      ],
      code: `int knapsack(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    // dp[i][c] = best value using only the first i items with capacity c
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];                    // skip item i
            if (c >= wt[i - 1])                         // take it if it fits
                dp[i][c] = max(dp[i][c], dp[i - 1][c - wt[i - 1]] + val[i - 1]);
        }
    }
    return dp[n][W];
}`,
      explanation: [
        "State: dp[i][c] is the best value reachable using only the first i items with capacity exactly c available. The two indices are forced on you - the item pointer says how far through the decision list you are, the capacity says how much room is left, and nothing else about the past matters.",
        "Transition: item i is either left out, giving dp[i-1][c], or taken, which costs wt[i-1] of capacity and earns val[i-1], giving dp[i-1][c - wt[i-1]] + val[i-1]. Those two cases are disjoint and cover everything, so the max of them is the true optimum. Correctness rests on the fact that after deciding item i, the remaining subproblem depends only on the leftover capacity - the identity of the earlier picks is irrelevant.",
        "The tempting wrong approach is greedy by value-to-weight ratio. That is optimal for the fractional knapsack, where you can take a fraction of an item, but not here: with W = 10, wt = [6, 5, 5], val = [7, 5, 5], the best ratio item (7/6) is taken first and blocks the pair worth 10.",
        "Note that capacity is a dimension of the table, so the running time depends on the numeric value of W, not on its bit length. This is pseudo-polynomial - with W around 10^9 the table is unusable and you need a different state (see the value-indexed variant later in this bank).",
        "Time: O(n * W). Space: O(n * W), reducible to O(W) as the next problem shows.",
      ],
    },
    {
      name: "Knapsack 1 (AtCoder Educational DP Contest D)",
      difficulty: "Easy",
      variation: "One-dimensional rolling array, reverse capacity loop",
      link: "https://atcoder.jp/contests/dp/tasks/dp_d",
      question: [
        "There are N items numbered 1..N. Item i has weight w_i and value v_i. Taro will choose some of them and put them in a knapsack of capacity W, so that the total weight of the chosen items is at most W. Print the maximum possible total value.",
        "Example 1:\nInput:\n3 8\n3 30\n4 50\n5 60\nOutput: 90\nExplanation: Items 1 and 3 weigh 3 + 5 = 8 <= 8 and are worth 30 + 60 = 90. Items 2 and 3 weigh 9, which does not fit, and items 1 and 2 are worth only 80.",
        "Example 2:\nInput:\n5 5\n1 1000000000\n1 1000000000\n1 1000000000\n1 1000000000\n1 1000000000\nOutput: 5000000000",
        "Constraints:\n- 1 <= N <= 100\n- 1 <= W <= 10^5\n- 1 <= w_i <= W\n- 1 <= v_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, W;
    cin >> n >> W;
    vector<long long> dp(W + 1, 0);   // dp[c] = best value with capacity c
    for (int i = 0; i < n; i++) {
        int w;
        long long v;
        cin >> w >> v;
        // descending c so dp[c - w] is still the PREVIOUS item's row
        for (int c = W; c >= w; c--) dp[c] = max(dp[c], dp[c - w] + v);
    }
    cout << dp[W] << "\\n";
    return 0;
}`,
      explanation: [
        "Row i of the 2D table only ever reads row i-1, so one array suffices. The subtlety is the loop direction: dp[c] must be updated from a value of dp[c-w] that has not yet been touched by the current item, and iterating c downwards guarantees exactly that, because c-w < c is visited later.",
        "Iterating c upwards instead is not a harmless bug - it turns the problem into unbounded knapsack, where each item can be reused any number of times, because dp[c-w] may already include item i. That single character is the difference between 0/1 and unlimited copies, and it is worth memorising as a pair.",
        "Arithmetic trap: 100 items worth 10^9 each is 10^11, far past a 32-bit int, so the value array must be 64-bit even though each individual v_i fits in an int. Weights stay in int because they are bounded by W = 10^5.",
        "dp is initialised to 0 rather than to negative infinity because every capacity is achievable by taking nothing - the problem asks for weight at most W, not exactly W. If it demanded an exact total weight, only dp[0] would start at 0 and the rest at negative infinity.",
        "Time: O(N * W). Space: O(W).",
      ],
    },
    {
      name: "Book Shop (CSES 1158)",
      difficulty: "Medium",
      variation: "Budget as capacity, cost/benefit relabelling",
      link: "https://cses.fi/problemset/task/1158",
      question: [
        "You are in a book shop that sells n different books. You know the price h_i and the number of pages s_i of each book. You have x euros to spend. Each book can be bought at most once. What is the maximum number of pages you can buy without exceeding your budget?",
        "Example 1:\nInput:\n4 10\n4 8 5 3\n5 12 8 1\nOutput: 13\nExplanation: Buy book 1 (price 4, 5 pages) and book 3 (price 5, 8 pages) for 9 euros and 13 pages. Book 2 plus book 4 would give 13 pages too but costs 11 euros, over the budget.",
        "Example 2:\nInput:\n3 4\n5 6 7\n100 200 300\nOutput: 0\nExplanation: Every book costs more than the four euros available, so nothing can be bought.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= x <= 10^5\n- 1 <= h_i, s_i <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> h(n), s(n);
    for (int i = 0; i < n; i++) cin >> h[i];
    for (int i = 0; i < n; i++) cin >> s[i];
    vector<int> dp(x + 1, 0);   // dp[b] = most pages buyable with budget b
    for (int i = 0; i < n; i++)
        for (int b = x; b >= h[i]; b--) dp[b] = max(dp[b], dp[b - h[i]] + s[i]);
    cout << dp[x] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the plain 0/1 knapsack with the nouns swapped: price plays the role of weight, pages play the role of value, and the budget is the capacity. Recognising that relabelling is the entire difficulty of the problem - once the words are mapped, the recurrence is unchanged.",
        "The input format is the trap for people who rush: prices come as one full line and pages as a second full line, not interleaved as pairs, so the two arrays must be read separately before the DP runs.",
        "Values fit comfortably in int here - at most 1000 books of 1000 pages is 10^6 - so no 64-bit promotion is needed, unlike the AtCoder version.",
        "A 2D table would be 1000 * 100001 ints, roughly 400 MB, which blows the memory limit. The rolling array is not an optimisation here, it is the only version that passes, which is why the reverse loop is worth being fluent in.",
        "Time: O(n * x), about 10^8 very cheap operations - fine with fast IO. Space: O(x).",
      ],
    },
    {
      name: "Money Sums (CSES 1745)",
      difficulty: "Medium",
      variation: "Reachability instead of maximisation, bitset speedup",
      link: "https://cses.fi/problemset/task/1745",
      question: [
        "You have n coins with certain values. Your task is to find all money sums you can create using these coins, where each coin may be used at most once. Print the number of distinct positive sums, then the sums themselves in increasing order.",
        "Example 1:\nInput:\n4\n4 2 5 2\nOutput:\n9\n2 4 5 6 7 8 9 11 13\nExplanation: Single coins give 2, 4 and 5; pairs give 4, 6, 7 and 9; triples give 8, 9 and 11; all four give 13. Deduplicated and sorted that is the nine listed sums.",
        "Example 2:\nInput:\n2\n3 3\nOutput:\n2\n3 6\nExplanation: One coin gives 3, both give 6. Using one coin or the other gives the same sum, so 3 is counted once.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= x_i <= 1000, so the total never exceeds 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    bitset<100001> reach;   // reach[s] = sum s is achievable
    reach[0] = 1;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
        reach |= reach << x;   // every old sum s also yields s + x
    }
    vector<int> sums;
    for (int s = 1; s <= total; s++)
        if (reach[s]) sums.push_back(s);
    cout << sums.size() << "\\n";
    for (size_t i = 0; i < sums.size(); i++)
        cout << sums[i] << " \\n"[i + 1 == sums.size()];
    return 0;
}`,
      explanation: [
        "Here the knapsack value is dropped entirely and only feasibility remains: state is 'is sum s reachable with the coins seen so far'. The transition is the same include/exclude split, but with OR replacing max, which is what makes the bitset trick available.",
        "reach |= reach << x is the whole DP for one coin. Shifting left by x maps every reachable sum s to s + x, and the OR keeps the sums reachable without this coin. Because the shift produces a fresh temporary before the OR is applied, no sum can consume the same coin twice - the bitset version is automatically the 0/1 variant, with no reverse loop to remember.",
        "Duplicate coin values need no special handling: reachability is a set, so two coins of value 3 naturally contribute 3 once and 6 once. Counting problems over the same input would need care about identical items, but reachability does not.",
        "The plain boolean array version is O(n * total) = 10^7 and also passes; the bitset does the same work 64 sums at a time, which is the standard rescue when n * total is nearer 10^9.",
        "Time: O(n * total / 64). Space: O(total / 8) bytes for the bitset.",
      ],
    },
    {
      name: "Last Stone Weight II",
      difficulty: "Medium",
      variation: "Minimise partition difference via subset sum",
      link: "https://leetcode.com/problems/last-stone-weight-ii/",
      question: [
        "You are given an array stones where stones[i] is the weight of the i-th stone. Repeatedly pick any two stones of weights x and y with x <= y and smash them together: if x == y both are destroyed, otherwise the stone of weight x is destroyed and the stone of weight y becomes y - x. At the end at most one stone is left. Return the smallest possible weight of that stone, or 0 if none remain.",
        "Example 1:\nInput: stones = [2, 7, 4, 1, 8, 1]\nOutput: 1\nExplanation: The total is 23, so the two groups can differ by 1 at best. The groups {2, 8, 1} = 11 and {7, 4, 1} = 12 achieve that, and 23 - 2 * 11 = 1.",
        "Example 2:\nInput: stones = [31, 26, 33, 21, 40]\nOutput: 5\nExplanation: The total is 151. The best subset sum not exceeding 75 is 33 + 40 = 73, so the answer is 151 - 2 * 73 = 5.",
        "Constraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 100",
      ],
      code: `int lastStoneWeightII(vector<int>& stones) {
    int total = accumulate(stones.begin(), stones.end(), 0);
    int half = total / 2;
    vector<char> dp(half + 1, 0);   // dp[c] = subset summing to exactly c exists
    dp[0] = 1;
    for (int s : stones)
        for (int c = half; c >= s; c--)
            if (dp[c - s]) dp[c] = 1;
    for (int c = half; c >= 0; c--)
        if (dp[c]) return total - 2 * c;   // first hit is the largest such c
    return total;
}`,
      explanation: [
        "The reframing is the insight. Every smash assigns a plus or a minus sign to a stone, so the final remaining weight is the absolute value of a signed sum of all stones. Equivalently, the stones split into two groups A and B and the answer is |sum(A) - sum(B)|. Any such split is achievable, so the problem is: split the multiset to minimise the gap.",
        "With S the total and sum(A) = c <= S/2, the gap is S - 2c, which shrinks as c grows. So minimising the gap means finding the largest achievable subset sum not exceeding S/2 - a boolean 0/1 knapsack with capacity floor(S/2) and no values at all.",
        "The reverse capacity loop is still mandatory: forwards, one stone could be counted several times and would report unreachable sums as reachable.",
        "The tempting wrong approach is greedy - repeatedly smash the two heaviest stones, which is the correct answer to the easier Last Stone Weight problem but not to this one. On [31, 26, 33, 21, 40] the greedy pairing gives 9, not 5, because a locally large cancellation can leave the remaining stones badly balanced.",
        "Time: O(n * S) with S <= 3000 here. Space: O(S).",
      ],
    },
    {
      name: "Target Sum",
      difficulty: "Medium",
      variation: "Counting subsets, sign assignment",
      link: "https://leetcode.com/problems/target-sum/",
      question: [
        "You are given an integer array nums and an integer target. You must place either a '+' or a '-' in front of every element of nums and concatenate them into an expression. Return the number of different sign assignments whose expression evaluates to target.",
        "Example 1:\nInput: nums = [1, 1, 1, 1, 1], target = 3\nOutput: 5\nExplanation: Exactly one of the five ones must be negative, giving 4 - 1 = 3, and there are five choices of which one.",
        "Example 2:\nInput: nums = [1], target = 1\nOutput: 1\nExplanation: The single assignment +1 works; -1 does not.",
        "Constraints:\n- 1 <= nums.length <= 20\n- 0 <= nums[i] <= 1000\n- sum(nums) <= 1000\n- -1000 <= target <= 1000",
      ],
      code: `int findTargetSumWays(vector<int>& nums, int target) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (abs(target) > total) return 0;             // unreachable either way
    if ((total + target) % 2 != 0) return 0;       // parity makes P non-integral
    int cap = (total + target) / 2;                // required sum of the '+' group
    vector<int> dp(cap + 1, 0);   // dp[c] = number of subsets summing to c
    dp[0] = 1;
    for (int v : nums)
        for (int c = cap; c >= v; c--) dp[c] += dp[c - v];
    return dp[cap];
}`,
      explanation: [
        "Let P be the sum of the elements given a plus sign and N the sum of those given a minus. Then P + N = total and P - N = target, so P = (total + target) / 2. Counting sign assignments is therefore counting subsets whose sum equals that fixed number - a counting knapsack with capacity P.",
        "Two feasibility guards come out of that algebra for free. If total + target is odd, P is not an integer and the answer is 0. If |target| > total, no assignment can reach it. Skipping these produces a negative or fractional capacity and either a crash or nonsense.",
        "The transition sums instead of maximising: dp[c] += dp[c - v], again scanning c downwards so each element is used at most once. dp[0] = 1 is the empty subset, and it must be 1 or the whole table stays zero.",
        "Zeros in nums are handled correctly without a special case, and it is worth seeing why. When v = 0 the inner loop runs down to c = 0 and performs dp[c] += dp[c], doubling every count - which is exactly right, because a zero can carry either sign and each existing assignment splits into two.",
        "The sums fit in int because sum(nums) <= 1000 caps the subset count at 2^20, comfortably inside 32 bits.",
        "Time: O(n * total). Space: O(total).",
      ],
    },
    {
      name: "Ones and Zeroes",
      difficulty: "Medium",
      variation: "Two independent capacity dimensions",
      link: "https://leetcode.com/problems/ones-and-zeroes/",
      question: [
        "You are given an array of binary strings strs and two integers m and n. Return the size of the largest subset of strs such that the strings in the subset contain at most m zeros and at most n ones in total. A set x is a subset of y if all elements of x are also elements of y.",
        "Example 1:\nInput: strs = ['10', '0001', '111001', '1', '0'], m = 5, n = 3\nOutput: 4\nExplanation: The subset {'10', '0001', '1', '0'} uses 1 + 3 + 0 + 1 = 5 zeros and 1 + 1 + 1 + 0 = 3 ones, both at the limit. No subset of size 5 fits, because adding '111001' needs three more ones.",
        "Example 2:\nInput: strs = ['10', '0', '1'], m = 1, n = 1\nOutput: 2\nExplanation: {'0', '1'} uses one zero and one one. Taking '10' alone also fits but is only size 1.",
        "Constraints:\n- 1 <= strs.length <= 600\n- 1 <= strs[i].length <= 100\n- 1 <= m, n <= 100",
      ],
      code: `int findMaxForm(vector<string>& strs, int m, int n) {
    // dp[i][j] = most strings selectable using at most i zeros and j ones
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (const string& s : strs) {
        int z = count(s.begin(), s.end(), '0');
        int o = (int)s.size() - z;
        for (int i = m; i >= z; i--)              // both dimensions descend
            for (int j = n; j >= o; j--)
                dp[i][j] = max(dp[i][j], dp[i - z][j - o] + 1);
    }
    return dp[m][n];
}`,
      explanation: [
        "Each string costs two independent resources - zeros and ones - and earns a value of 1. That is a knapsack whose capacity is a pair, so the table gains a dimension while the recurrence is untouched: skip the string, or pay (z, o) and gain 1.",
        "Both capacity loops must run downwards. Descending in only one of them lets a string be reused along the ascending axis, silently turning it into unbounded knapsack in that dimension.",
        "The tempting wrong approach is greedy by string length - take the shortest strings first. It fails when the resources are unbalanced: with m = 0 and n = 3, a short string of zeros is useless while longer all-ones strings are exactly what fits.",
        "Note the answer is a count of items, so values are all 1 and 'at most' capacities mean the table starts at 0 everywhere rather than at negative infinity.",
        "Time: O(L + k * m * n) where k is the number of strings and L their total length. Space: O(m * n).",
      ],
    },
    {
      name: "Printing Items in 0/1 Knapsack",
      difficulty: "Medium",
      variation: "Reconstructing the chosen subset",
      question: [
        "Given a knapsack capacity W and n items with weights wt[i] and values val[i], report not just the maximum achievable value but also which items achieve it. Print the indices of a chosen subset in increasing order. If several subsets tie on value, any one of them is acceptable.",
        "Example 1:\nInput: W = 50, wt = [10, 20, 30], val = [60, 100, 120]\nOutput: value = 220, items = [2, 3]\nExplanation: Items 2 and 3 weigh 20 + 30 = 50 and are worth 100 + 120 = 220. Items 1 and 3 weigh 40 but are worth only 180, and all three weigh 60, which does not fit.",
        "Example 2:\nInput: W = 4, wt = [4, 5, 1], val = [1, 2, 3]\nOutput: value = 3, items = [3]\nExplanation: Item 3 alone is worth 3. Adding item 1 would bring the weight to 5, over capacity.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= W <= 1000\n- 1 <= wt[i], val[i] <= 1000\n- Item indices in the output are 1-based",
      ],
      code: `// Returns the chosen 1-based item indices in increasing order; value is written to best.
vector<int> knapsackItems(int W, vector<int>& wt, vector<int>& val, int& best) {
    int n = wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];
            if (c >= wt[i - 1])
                dp[i][c] = max(dp[i][c], dp[i - 1][c - wt[i - 1]] + val[i - 1]);
        }
    best = dp[n][W];
    vector<int> chosen;
    int c = W;
    for (int i = n; i >= 1; i--) {
        // value changed at this row, so item i had to be taken
        if (dp[i][c] != dp[i - 1][c]) {
            chosen.push_back(i);
            c -= wt[i - 1];
        }
    }
    reverse(chosen.begin(), chosen.end());   // walked backwards, so flip
    return chosen;
}`,
      explanation: [
        "Reconstruction is the reason to keep the full 2D table. The rolling-array version computes the same optimum but destroys the history, so it can report the value and nothing else. Whenever a problem asks 'which items', budget O(n * W) memory up front or store parent pointers.",
        "The backtrack reads the table as a decision log. Starting at (n, W), dp[i][c] == dp[i-1][c] means the optimum at that cell was attainable without item i, so declare it unused and move up. Otherwise the take branch is what produced the value, so record item i and drop the capacity by wt[i-1]. Each step retreats exactly one row, so the walk is O(n).",
        "Comparing against dp[i-1][c] is the safe test. Checking dp[i][c] == dp[i-1][c - wt[i-1]] + val[i-1] instead can be true even when skipping was equally good, which is harmless for the value but produces a heavier subset than necessary when the two branches tie.",
        "The walk visits items from n down to 1, so the collected indices come out descending and need one reverse to satisfy the increasing-order requirement.",
        "Time: O(n * W) for the table plus O(n) for the walk. Space: O(n * W), unavoidable if the subset itself is required.",
      ],
    },
    {
      name: "Knapsack 2 (AtCoder Educational DP Contest E)",
      difficulty: "Hard",
      variation: "Swap the state - index by value, minimise weight",
      link: "https://atcoder.jp/contests/dp/tasks/dp_e",
      question: [
        "There are N items numbered 1..N. Item i has weight w_i and value v_i. Choose some of them so that the total weight is at most W, and print the maximum possible total value. The capacity W is now up to 10^9, but each value v_i is at most 1000.",
        "Example 1:\nInput:\n3 8\n3 30\n4 50\n5 60\nOutput: 90\nExplanation: Items 1 and 3 weigh 8 and are worth 90.",
        "Example 2:\nInput:\n6 15\n6 5\n5 6\n6 4\n6 6\n3 5\n7 2\nOutput: 17\nExplanation: Items 2, 4 and 5 weigh 5 + 6 + 3 = 14 <= 15 and are worth 6 + 6 + 5 = 17. Nothing else fits in the remaining capacity of 1, and no other selection reaches 18.",
        "Constraints:\n- 1 <= N <= 100\n- 1 <= W <= 10^9\n- 1 <= w_i <= 10^9\n- 1 <= v_i <= 1000, so the total value is at most 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long W;
    cin >> n >> W;
    vector<long long> w(n), v(n);
    long long sumV = 0;
    for (int i = 0; i < n; i++) {
        cin >> w[i] >> v[i];
        sumV += v[i];
    }
    const long long INF = (long long)4e18;
    // dp[val] = minimum weight needed to reach total value exactly val
    vector<long long> dp(sumV + 1, INF);
    dp[0] = 0;
    for (int i = 0; i < n; i++)
        for (long long val = sumV; val >= v[i]; val--)
            if (dp[val - v[i]] != INF)   // guard so INF + w never overflows
                dp[val] = min(dp[val], dp[val - v[i]] + w[i]);
    long long ans = 0;
    for (long long val = 0; val <= sumV; val++)
        if (dp[val] <= W) ans = val;   // largest feasible value
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The 0/1 knapsack table is O(N * W), which is 10^11 cells here - hopeless. But the roles of the two quantities are interchangeable: instead of 'best value for a given capacity' use 'least weight for a given value'. The value axis is bounded by sum(v_i) <= 10^5, so the same DP fits in memory once the axes are swapped.",
        "Because dp[val] is now a minimum over weights, the base case flips too: dp[0] = 0 and everything else starts at infinity, since 'value exactly val' is genuinely unachievable until some item makes it so. Initialising the whole array to 0, as in the capacity-indexed version, would report every value as free.",
        "The reverse loop over val plays the same role as the reverse loop over capacity - it keeps dp[val - v[i]] on the previous item's row so each item is used once. The INF guard matters in practice: adding a weight up to 10^9 to a sentinel picked near the top of the long long range would overflow and wrap to a small, apparently feasible weight.",
        "The answer is then a scan for the largest val whose minimum weight fits in W. Do not binary search it: dp is not sorted, because an unreachable value in the middle keeps its INF sentinel while larger values around it are perfectly feasible. A linear scan over 10^5 entries is free anyway.",
        "Recognising which axis is small is the transferable skill: whenever a knapsack has a huge capacity but small values, or a huge value but small weights, the state to index by is the small one.",
        "Time: O(N * sum(v)). Space: O(sum(v)).",
      ],
    },
    {
      name: "Profitable Schemes",
      difficulty: "Hard",
      variation: "Counting knapsack with a clamped 'at least' dimension",
      link: "https://leetcode.com/problems/profitable-schemes/",
      question: [
        "There is a group of n members, and a list of various crimes they could commit. The i-th crime generates profit[i] and requires group[i] members to participate in it. A member who participates in one crime cannot participate in another. A profitable scheme is any subset of crimes that generates at least minProfit profit and uses at most n members in total. Return the number of profitable schemes, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 5, minProfit = 3, group = [2, 2], profit = [2, 3]\nOutput: 2\nExplanation: To make a profit of at least 3, the group could either commit crime 1 and crime 2 (profit 5, using 4 members) or just crime 2 (profit 3, using 2 members). Crime 1 alone gives only profit 2.",
        "Example 2:\nInput: n = 10, minProfit = 5, group = [2, 3, 5], profit = [6, 7, 8]\nOutput: 7\nExplanation: Every single crime already clears minProfit, and the three group sizes total exactly 10, so all 7 non-empty subsets are profitable.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= minProfit <= 100\n- 1 <= group.length <= 100\n- 1 <= group[i] <= 100\n- 0 <= profit[i] <= 100",
      ],
      code: `int profitableSchemes(int n, int minProfit, vector<int>& group, vector<int>& profit) {
    const int MOD = 1000000007;
    int m = group.size();
    // dp[p][g] = schemes using exactly g members, profit clamped to p
    vector<vector<int>> dp(minProfit + 1, vector<int>(n + 1, 0));
    dp[0][0] = 1;   // the empty scheme
    for (int i = 0; i < m; i++) {
        vector<vector<int>> nxt = dp;   // 'skip crime i' copies the whole layer
        for (int p = 0; p <= minProfit; p++)
            for (int g = 0; g + group[i] <= n; g++) {
                if (!dp[p][g]) continue;
                int np = min(minProfit, p + profit[i]);   // clamp: beyond the bar is the bar
                int ng = g + group[i];
                nxt[np][ng] = (nxt[np][ng] + dp[p][g]) % MOD;
            }
        dp = nxt;
    }
    int ans = 0;
    for (int g = 0; g <= n; g++) ans = (ans + dp[minProfit][g]) % MOD;
    return ans;
}`,
      explanation: [
        "Two resources again, but they pull in opposite directions: members are a capacity to stay under, profit is a threshold to get over. Members behave like ordinary knapsack weight. Profit cannot be an unbounded axis, so it is clamped - once the running profit reaches minProfit, all further profit is folded into the single state minProfit, which then means 'at least minProfit'.",
        "Clamping is what makes the state space finite and the counting correct. Without it the profit axis would need to run to 100 * 100 = 10^4 and every one of those states would have to be summed at the end; with it, the answer is exactly the schemes sitting in the p = minProfit bucket. The clamp is only sound because the objective is monotone in profit - extra profit never hurts.",
        "This is a counting DP, so the include/exclude branches must be disjoint. They are, because a scheme is identified by its subset of crimes and each crime is decided exactly once as the item loop advances. Copying the previous layer into nxt implements 'skip' for every state at once, and the second loop adds the 'take' contributions.",
        "The g dimension tracks members used exactly, not 'at most'. Both work, but exactly-g avoids double counting: with an at-most axis, one scheme would be recorded at every g from its true size up to n, and summing the final row would multiply-count it.",
        "The tempting error is forgetting minProfit = 0, where the empty scheme is itself profitable. dp[0][0] = 1 with minProfit = 0 puts it in the answer bucket, which is what LeetCode expects.",
        "Time: O(m * minProfit * n). Space: O(minProfit * n).",
      ],
    },
    {
      name: "Tallest Billboard",
      difficulty: "Hard",
      variation: "Difference-indexed state, three-way partition",
      link: "https://leetcode.com/problems/tallest-billboard/",
      question: [
        "You are installing a billboard and want it to have the largest height. The billboard has two steel supports, one on each side, and each support must be an equal height. You are given a collection of rods that can be welded together end to end. For example, rods of lengths 1, 2 and 3 can be welded into a support of length 6. Return the largest possible height of your billboard installation, using each rod at most once and in at most one support. If the two supports cannot be made equal, return 0.",
        "Example 1:\nInput: rods = [1, 2, 3, 6]\nOutput: 6\nExplanation: Weld 1, 2 and 3 into one support of height 6 and use the rod of length 6 as the other.",
        "Example 2:\nInput: rods = [1, 2, 3, 4, 5, 6]\nOutput: 10\nExplanation: One support is 2 + 3 + 5 = 10 and the other is 4 + 6 = 10. The rod of length 1 is left unused.",
        "Example 3:\nInput: rods = [1, 2]\nOutput: 0\nExplanation: No pair of disjoint subsets has equal sums, so no billboard can be built.",
        "Constraints:\n- 1 <= rods.length <= 20\n- 1 <= rods[i] <= 1000\n- sum(rods[i]) <= 5000",
      ],
      code: `int tallestBillboard(vector<int>& rods) {
    // key = height gap between the two supports, value = best height of the shorter one
    unordered_map<int,int> dp{{0, 0}};
    for (int r : rods) {
        unordered_map<int,int> nxt = dp;   // 'discard this rod' branch
        for (auto& [d, s] : dp) {
            int& a = nxt[d + r];           // weld onto the taller support
            a = max(a, s);
            int nd = abs(d - r);           // weld onto the shorter support
            int ns = s + min(d, r);        // whichever side ends up shorter
            int& b = nxt[nd];
            b = max(b, ns);
        }
        dp = move(nxt);
    }
    return dp[0];
}`,
      explanation: [
        "Each rod has three fates - left support, right support, or unused - so a brute force is 3^20, about 3.5 * 10^9, too slow. The key observation is that the absolute heights of the two supports do not matter, only their difference does, because any future rod's effect depends solely on the gap it has to close.",
        "State: for each reachable gap d, store the largest achievable height of the shorter support. That single number is enough, since the taller support is then shorter + d, and among all ways to reach the same gap the one with the taller shorter-side dominates - it can only lead to a taller final billboard. The answer is the value stored at gap 0.",
        "The transition covers all three fates. Skipping copies the state. Welding onto the taller side widens the gap to d + r and leaves the shorter side untouched. Welding onto the shorter side is the interesting case: if r <= d the shorter side rises by r and the gap narrows to d - r, and if r > d the shorter side overtakes, so the new gap is r - d and the new shorter height is s + d. Both are captured by gap = |d - r| and shorter = s + min(d, r).",
        "The tempting wrong approach is to treat this as 'split the rods into two equal-sum halves', i.e. a plain subset-sum on half the total. That ignores the option of discarding rods, and it is exactly why [1, 2, 3, 4, 5, 6] answers 10 rather than failing - the total 21 is odd, yet dropping the 1 leaves a perfect split.",
        "Using a hash map rather than an array indexed by gap keeps only the reachable gaps, but an array of size sum + 1 with a negative-infinity sentinel works just as well and is faster in practice.",
        "Time: O(n * S) where S = sum(rods), since at most S + 1 distinct gaps exist. Space: O(S).",
      ],
    },
  ],
};
