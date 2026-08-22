import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Dynamic Range Sum Queries",
      difficulty: "Easy",
      variation: "Point assign, range sum - the template",
      link: "https://cses.fi/problemset/task/1648",
      question: [
        "You are given an array of n integers. Process q queries of two kinds. Query '1 k u' sets the value at position k to u. Query '2 a b' asks for the sum of values in positions a..b inclusive. Print the answer to every query of the second kind.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 1 4\n1 4 9\n2 1 4\n2 5 8\nOutput:\n14\n18\n10\nExplanation: 3+2+4+5 = 14. Setting position 4 to 9 makes the same prefix 3+2+4+9 = 18. The last query sums 1+1+5+3 = 10.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value <= 10^9\n- 1 <= k <= n and 1 <= a <= b <= n",
      ],
      code: `struct BIT {
    int n;
    vector<long long> f;
    BIT(int n = 0) : n(n), f(n + 1, 0) {}
    void add(int i, long long v) { for (; i <= n; i += i & -i) f[i] += v; }
    long long sum(int i) const {              // prefix sum of 1..i
        long long s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }
    long long range(int l, int r) const { return sum(r) - sum(l - 1); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n + 1, 0);
    BIT bit(n);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        bit.f[i] += a[i];                     // O(n) build: push each cell to its parent
        int j = i + (i & -i);
        if (j <= n) bit.f[j] += bit.f[i];
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k;
            long long u;
            cin >> k >> u;
            bit.add(k, u - a[k]);             // a BIT stores deltas, so apply the difference
            a[k] = u;
        } else {
            int l, r;
            cin >> l >> r;
            cout << bit.range(l, r) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "A Fenwick tree stores, at index i, the sum of the block of a of length lowbit(i) = i & -i ending at i. That layout makes a prefix sum a walk of at most log n blocks (strip the lowest set bit each step) and a point update a walk of at most log n ancestors (add the lowest set bit each step).",
        "Range sum comes from prefix sums: sum(l..r) = prefix(r) - prefix(l-1). This works only because addition has an inverse. Fenwick cannot answer range min or gcd this way, which is exactly where a segment tree is required instead.",
        "The key habit: a BIT natively supports 'add v at position i', not 'set position i to u'. Keeping the plain array a alongside and pushing u - a[k] is what turns assignment into an increment. Forgetting this and adding u directly is the most common bug in this template.",
        "Values reach 10^9 and n reaches 2 * 10^5, so a full sum can hit 2 * 10^14 - the tree must be 64-bit even though the inputs fit in an int.",
        "The O(n) build shown here beats n separate add calls: each cell is added once and then folded into its parent, so the whole tree is built in linear time instead of O(n log n).",
        "Time: O(n) build, O(log n) per update and per query. Space: O(n).",
      ],
    },
    {
      name: "Range Sum Query - Mutable",
      difficulty: "Medium",
      variation: "Point update, range sum behind a class API",
      link: "https://leetcode.com/problems/range-sum-query-mutable/",
      question: [
        "Design a data structure over an integer array nums that supports two operations. update(index, val) sets nums[index] to val. sumRange(left, right) returns the sum of nums[left..right] inclusive. Both must be fast enough for a large number of interleaved calls.",
        "Example 1:\nInput: NumArray([1, 3, 5]); sumRange(0, 2); update(1, 2); sumRange(0, 2)\nOutput: 9, then 8\nExplanation: 1+3+5 = 9. After nums becomes [1, 2, 5] the same range sums to 8.",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -100 <= nums[i], val <= 100\n- At most 3 * 10^4 calls to update and sumRange",
      ],
      code: `class NumArray {
    int n;
    vector<int> a;        // the live array, needed to turn assignment into a delta
    vector<long long> f;  // Fenwick tree, 1-indexed

    void add(int i, long long v) { for (; i <= n; i += i & -i) f[i] += v; }
    long long sum(int i) const {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    NumArray(vector<int>& nums) : n(nums.size()), a(nums), f(nums.size() + 1, 0) {
        for (int i = 1; i <= n; i++) {
            f[i] += a[i - 1];
            int j = i + (i & -i);
            if (j <= n) f[j] += f[i];
        }
    }

    void update(int index, int val) {
        add(index + 1, val - a[index]);       // shift to 1-indexed, apply the difference
        a[index] = val;
    }

    int sumRange(int left, int right) {
        return (int)(sum(right + 1) - sum(left));
    }
};`,
      explanation: [
        "This is the canonical reason a Fenwick tree exists. A prefix-sum array gives O(1) queries but O(n) updates; recomputing sums from scratch gives O(1) updates but O(n) queries. With mixed workloads both degrade to O(n * q). The BIT balances them at O(log n) each.",
        "Everything here is 1-indexed internally because i & -i is meaningless at index 0 - the update loop would never terminate. The +1 shifts in update and sumRange are the whole adapter between the problem's 0-indexed API and the tree.",
        "sumRange(left, right) = prefix(right+1) - prefix(left) in tree coordinates; note the second term is prefix(left) not prefix(left+1), because prefix(left) in 1-indexed terms already means 'everything strictly before nums[left]'.",
        "Values can be negative here, which is harmless for a sum BIT - but it does rule out any of the binary-descent tricks used later in this bank, which assume non-negative entries.",
        "Time: O(n) to build, O(log n) per update and per query. Space: O(n).",
      ],
    },
    {
      name: "Queries on a Permutation With Key",
      difficulty: "Medium",
      variation: "BIT as a dynamic 'how many alive before me' counter",
      link: "https://leetcode.com/problems/queries-on-a-permutation-with-key/",
      question: [
        "You start with the permutation P = [1, 2, 3, ..., m]. Process the array queries in order. For each value queries[i]: find its current 0-indexed position in P, append that position to the answer, then move that value to the very front of P (everything before it shifts one place right). Return the array of positions.",
        "Example 1:\nInput: queries = [3, 1, 2, 1], m = 5\nOutput: [2, 1, 2, 1]\nExplanation: 3 sits at index 2, P becomes [3,1,2,4,5]. 1 sits at index 1, P becomes [1,3,2,4,5]. 2 sits at index 2, P becomes [2,1,3,4,5]. 1 sits at index 1.",
        "Example 2:\nInput: queries = [4, 1, 2, 2], m = 4\nOutput: [3, 1, 2, 0]\nExplanation: 4 is at index 3, P becomes [4,1,2,3]. 1 is at index 1, P becomes [1,4,2,3]. 2 is at index 2, P becomes [2,1,4,3]. 2 is now already at index 0.",
        "Constraints:\n- 1 <= m <= 10^3\n- 1 <= queries.length <= m\n- 1 <= queries[i] <= m",
      ],
      code: `class Solution {
    int n;
    vector<int> f;
    void add(int i, int v) { for (; i <= n; i += i & -i) f[i] += v; }
    int sum(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    vector<int> processQueries(vector<int>& queries, int m) {
        int q = queries.size();
        n = m + q;                            // slots 1..q are reserved for future front moves
        f.assign(n + 1, 0);
        vector<int> pos(m + 1);
        for (int v = 1; v <= m; v++) {
            pos[v] = q + v;                   // value v starts in slot q+v, so order is preserved
            add(pos[v], 1);
        }
        vector<int> res;
        res.reserve(q);
        int front = q;                         // next free slot to the left of everything
        for (int x : queries) {
            res.push_back(sum(pos[x] - 1));    // how many live values sit strictly before x
            add(pos[x], -1);
            pos[x] = front--;                  // reinsert x further left than any current value
            add(pos[x], 1);
        }
        return res;
    }
};`,
      explanation: [
        "The trick is to stop moving elements and instead give the array a coordinate system with room to grow at the front. Reserve q empty slots on the left; a 'move to front' becomes 'delete from the old slot, insert into the next unused reserved slot'. Relative order of everything else is untouched, so no shifting is ever needed.",
        "With that in place, a value's logical 0-indexed position is simply the number of still-present values in strictly smaller slots - a prefix count, which is exactly what a BIT of 0/1 markers gives in O(log n).",
        "The tempting approach is a vector plus find and erase and insert at begin. For m, q <= 1000 that O(m * q) solution actually passes, which is why many people never learn the BIT version. Push m and q to 10^5 and only the BIT survives - and the same slot-reservation idea powers the CSES 'List Removals' style problems.",
        "front is decremented after each use, so query i lands in slot q-i+1: later queries get smaller slots and therefore correctly sit in front of earlier ones.",
        "Time: O((m + q) log(m + q)). Space: O(m + q).",
      ],
    },
    {
      name: "Longest Increasing Subsequence",
      difficulty: "Medium",
      variation: "Prefix max BIT instead of prefix sum",
      link: "https://leetcode.com/problems/longest-increasing-subsequence/",
      question: [
        "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence keeps the original order but may skip elements.",
        "Example 1:\nInput: nums = [10, 9, 2, 5, 3, 7, 101, 18]\nOutput: 4\nExplanation: [2, 3, 7, 18] and [2, 3, 7, 101] are both length 4; no length-5 increasing subsequence exists.",
        "Example 2:\nInput: nums = [0, 1, 0, 3, 2, 3]\nOutput: 4\nExplanation: [0, 1, 2, 3] has length 4.",
        "Constraints:\n- 1 <= nums.length <= 2500\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
    int n;
    vector<int> f;                             // f[i] = max over the block ending at i
    void upd(int i, int v) { for (; i <= n; i += i & -i) f[i] = max(f[i], v); }
    int qry(int i) const {                      // max over prefix 1..i
        int best = 0;
        for (; i > 0; i -= i & -i) best = max(best, f[i]);
        return best;
    }

public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> vals(nums.begin(), nums.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        f.assign(n + 1, 0);
        int ans = 0;
        for (int x : nums) {
            int r = lower_bound(vals.begin(), vals.end(), x) - vals.begin() + 1;  // rank, 1-indexed
            int len = qry(r - 1) + 1;           // best chain ending in a value strictly smaller
            upd(r, len);
            ans = max(ans, len);
        }
        return ans;
    }
};`,
      explanation: [
        "State: dp[x] = length of the longest increasing subsequence ending with value x. Scanning left to right, dp[x] = 1 + max over all strictly smaller values already seen. That maximum over a value prefix is what the BIT provides, turning the O(n^2) DP into O(n log n).",
        "A max-BIT is not a sum-BIG in disguise: it only supports 'raise the value at i' and 'max over a prefix'. There is no inverse of max, so a range max over l..r is impossible - and that is fine here, because the query is always a prefix ending just below the current rank.",
        "Coordinate compression is needed so ranks index an array of size n rather than the value range, and it also handles negative values for free. Querying r-1 rather than r is what makes the subsequence strictly increasing; querying r would allow equal values and compute the longest non-decreasing subsequence instead.",
        "The classic alternative is the patience-sorting tails array with binary search, also O(n log n) and shorter to write. The BIT version is the one that generalises: swap 'length' for 'max sum' or add a second dimension and it still works, which the tails trick cannot do.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Best Team With No Conflicts",
      difficulty: "Medium",
      variation: "Weighted LIS via prefix max BIT",
      link: "https://leetcode.com/problems/best-team-with-no-conflicts/",
      question: [
        "You are given scores and ages, two arrays of the same length, where player i has scores[i] points and age ages[i]. A team has a conflict if a strictly younger player has a strictly higher score than an older player; two players of the same age never conflict regardless of score. Choose any subset of players with no conflict and return the largest possible total score.",
        "Example 1:\nInput: scores = [1, 3, 5, 10, 15], ages = [1, 2, 3, 4, 5]\nOutput: 34\nExplanation: Scores already increase with age, so everyone can play: 1+3+5+10+15 = 34.",
        "Example 2:\nInput: scores = [4, 5, 6, 5], ages = [2, 1, 2, 1]\nOutput: 16\nExplanation: Take both age-1 players (5 and 5) and the age-2 player scoring 6. The older player's score 6 is not below any younger player's score, so there is no conflict: 5+5+6 = 16.",
        "Constraints:\n- 1 <= scores.length == ages.length <= 1000\n- 1 <= scores[i] <= 10^6\n- 1 <= ages[i] <= 1000",
      ],
      code: `class Solution {
    int n;
    vector<long long> f;
    void upd(int i, long long v) { for (; i <= n; i += i & -i) f[i] = max(f[i], v); }
    long long qry(int i) const {
        long long best = 0;
        for (; i > 0; i -= i & -i) best = max(best, f[i]);
        return best;
    }

public:
    int bestTeamScore(vector<int>& scores, vector<int>& ages) {
        int m = scores.size();
        vector<pair<int,int>> p(m);
        for (int i = 0; i < m; i++) p[i] = {ages[i], scores[i]};
        sort(p.begin(), p.end());              // by age, then by score
        n = 1000000;                            // scores are bounded, so use them as indices directly
        f.assign(n + 1, 0);
        long long ans = 0;
        for (auto& [age, sc] : p) {
            long long best = qry(sc) + sc;      // qry(sc) allows an equal score: same age is legal
            upd(sc, best);
            ans = max(ans, best);
        }
        return (int)ans;
    }
};`,
      explanation: [
        "Sort players by age, then by score. A conflict-free team is now exactly a subsequence of that order whose scores are non-decreasing, so the problem is a maximum-weight non-decreasing subsequence and the answer is a weighted LIS.",
        "State: dp[s] = best total score of a valid team whose highest-score member scores s. Processing in sorted order, dp[sc] = sc + max over dp[s'] for s' <= sc, which is a prefix max - a BIT gives it in O(log(max score)).",
        "Two subtleties decide correctness. The prefix is inclusive (qry(sc), not qry(sc-1)) because equal scores never conflict. And the tie-break within the same age must be by increasing score: sorting age ascending but score descending would let a same-age pair look like a decreasing pair and be wrongly rejected.",
        "The tempting greedy - take the highest scorers, or take everyone above some age - fails on example 2, where the globally best single player (score 6, age 2) must be combined with two lower scorers and the score-4 age-2 player must be dropped.",
        "Indexing the BIT by raw score works because scores are bounded by 10^6; with unbounded scores you would compress them first, which is the general form.",
        "Time: O(m log m + m log S) where S is the score bound. Space: O(S).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Hard",
      variation: "Counting smaller elements to the right",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "Given an integer array nums, return an array counts where counts[i] is the number of indices j > i with nums[j] < nums[i].",
        "Example 1:\nInput: nums = [5, 2, 6, 1]\nOutput: [2, 1, 1, 0]\nExplanation: To the right of 5 there are 2 and 1, so 2. To the right of 2 there is 1, so 1. To the right of 6 there is 1, so 1. Nothing is to the right of 1.",
        "Example 2:\nInput: nums = [-1, -1]\nOutput: [0, 0]\nExplanation: Neither value is strictly smaller than the other.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
    int n;
    vector<int> f;
    void add(int i) { for (; i <= n; i += i & -i) f[i]++; }
    int sum(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    vector<int> countSmaller(vector<int>& nums) {
        vector<int> vals(nums.begin(), nums.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        f.assign(n + 1, 0);
        int m = nums.size();
        vector<int> res(m);
        for (int i = m - 1; i >= 0; i--) {     // sweep right to left: the BIT holds the suffix
            int r = lower_bound(vals.begin(), vals.end(), nums[i]) - vals.begin() + 1;
            res[i] = sum(r - 1);                // ranks strictly below nums[i]
            add(r);
        }
        return res;
    }
};`,
      explanation: [
        "Reframe the question as a sweep with a multiset. Walk from the right, and before inserting nums[i] the structure contains exactly the elements to its right. The answer for i is 'how many stored values are strictly less than nums[i]', a prefix count over value space.",
        "A BIT over compressed ranks gives that count in O(log n). Compression is not optional: raw values are negative and would index out of bounds, and even shifting them only works because the range here happens to be small.",
        "sum(r - 1) is the strictness. Using sum(r) would also count the equal values already inserted, which is the standard off-by-one on this problem - example 2 is the minimal case that exposes it, returning [1, 0] instead of [0, 0].",
        "The other well-known solution is a merge sort that credits each element when it jumps over a block of smaller ones. Same complexity, but the BIT sweep generalises immediately to 'count values in a range' or 'count values above 2x', as the next problems show.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Reverse Pairs",
      difficulty: "Hard",
      variation: "Counting pairs with a scaled comparison",
      link: "https://leetcode.com/problems/reverse-pairs/",
      question: [
        "A reverse pair is a pair of indices (i, j) with i < j and nums[i] > 2 * nums[j]. Given an integer array nums, return the number of reverse pairs.",
        "Example 1:\nInput: nums = [1, 3, 2, 3, 1]\nOutput: 2\nExplanation: The pairs are (1, 4) with 3 > 2*1, and (3, 4) with 3 > 2*1. The pair (2, 4) fails because 2 > 2*1 is false.",
        "Example 2:\nInput: nums = [2, 4, 3, 5, 1]\nOutput: 3\nExplanation: The pairs are (1, 4) with 4 > 2, (2, 4) with 3 > 2, and (3, 4) with 5 > 2.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `class Solution {
    int n;
    vector<int> f;
    void add(int i) { for (; i <= n; i += i & -i) f[i]++; }
    int sum(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    int reversePairs(vector<int>& nums) {
        vector<long long> vals(nums.begin(), nums.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        f.assign(n + 1, 0);
        long long ans = 0;
        int inserted = 0;
        for (int j = 0; j < (int)nums.size(); j++) {
            long long lim = 2LL * nums[j];      // 64-bit: 2 * nums[j] overflows an int
            int k = upper_bound(vals.begin(), vals.end(), lim) - vals.begin();  // ranks with value <= lim
            ans += inserted - sum(k);           // everything inserted that is NOT <= lim
            int r = lower_bound(vals.begin(), vals.end(), (long long)nums[j]) - vals.begin() + 1;
            add(r);
            inserted++;
        }
        return (int)ans;
    }
};`,
      explanation: [
        "Fix the right endpoint j and sweep left to right, so the BIT always holds exactly the prefix nums[0..j-1]. The count needed is how many stored values exceed 2 * nums[j].",
        "A BIT counts prefixes, not suffixes, so complement: (number inserted so far) - (number of stored values <= 2 * nums[j]). The second term is a prefix count up to the rank found by upper_bound on the compressed value list.",
        "Note the asymmetry - the compressed array is built from the nums values only, but the query threshold 2 * nums[j] need not be one of them. upper_bound handles that correctly: it returns the count of distinct stored values that are <= the threshold, which is precisely the BIT prefix to read.",
        "Two traps. First, 2 * nums[j] overflows a 32-bit int when nums[j] is near 2^31 - 1, so the multiplication must be done in long long before comparison. Second, using lower_bound instead of upper_bound for the threshold would drop values exactly equal to 2 * nums[j], which are correctly not reverse pairs but must still be excluded from the 'greater' side - upper_bound puts them on the right side of the cut.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Create Sorted Array through Instructions",
      difficulty: "Hard",
      variation: "Simultaneous smaller-and-greater counts",
      link: "https://leetcode.com/problems/create-sorted-array-through-instructions/",
      question: [
        "Start with an empty container. Insert the values of instructions one at a time, keeping the container sorted. The cost of inserting a value v is the smaller of two numbers: how many elements already in the container are strictly less than v, and how many are strictly greater than v. Return the total cost of all insertions modulo 10^9 + 7.",
        "Example 1:\nInput: instructions = [1, 5, 6, 2]\nOutput: 1\nExplanation: Inserting 1, 5 and 6 costs 0 each (one side is always empty). Inserting 2 into [1,5,6] costs min(1, 2) = 1.",
        "Example 2:\nInput: instructions = [1, 2, 3, 6, 5, 4]\nOutput: 3\nExplanation: The first four insertions cost 0. Inserting 5 into [1,2,3,6] costs min(3, 1) = 1. Inserting 4 into [1,2,3,5,6] costs min(3, 2) = 2. Total 3.",
        "Constraints:\n- 1 <= instructions.length <= 10^5\n- 1 <= instructions[i] <= 10^5",
      ],
      code: `class Solution {
    int n;
    vector<int> f;
    void add(int i) { for (; i <= n; i += i & -i) f[i]++; }
    int sum(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    int createSortedArray(vector<int>& instructions) {
        const long long MOD = 1000000007LL;
        n = 100000;                             // values are bounded, index the BIT by value
        f.assign(n + 1, 0);
        long long ans = 0;
        int placed = 0;
        for (int v : instructions) {
            int less = sum(v - 1);              // strictly smaller
            int lessOrEq = sum(v);
            int greater = placed - lessOrEq;    // strictly greater = placed - (<= v)
            ans = (ans + min(less, greater)) % MOD;
            add(v);
            placed++;
        }
        return (int)ans;
    }
};`,
      explanation: [
        "The container never needs to exist. All that matters per step is two counts over the values inserted so far, and both are prefix counts of a frequency BIT indexed by value: strictly-less is prefix(v-1), and strictly-greater is placed - prefix(v).",
        "Because values are bounded by 10^5, the BIT can be indexed by the value itself - no compression needed. The gap between prefix(v-1) and prefix(v) is exactly the multiplicity of v, and this problem is a good check on whether you handle duplicates correctly: duplicates count toward neither side.",
        "The wrong-but-tempting version is greater = placed - less, which silently counts every earlier copy of v as greater and inflates the cost on any input with repeats.",
        "Take the modulo on the running total only. The individual min(less, greater) terms are at most 10^5, and reducing them early would be harmless here but is the habit that breaks when the per-step term itself needs reduction.",
        "An ordered multiset (a balanced BST or a Fenwick-free skip list) would also work, but the STL has no order-statistic set in standard C++ - which is why the BIT is the default answer for this shape.",
        "Time: O(n log V) where V is the value bound. Space: O(V).",
      ],
    },
    {
      name: "Count Good Triplets in an Array",
      difficulty: "Hard",
      variation: "Triplet counting with left and right prefix counts",
      link: "https://leetcode.com/problems/count-good-triplets-in-an-array/",
      question: [
        "You are given two 0-indexed arrays nums1 and nums2, both permutations of the integers 0..n-1. A good triplet is a set of three distinct values (x, y, z) that appears in the same relative order in both arrays: x before y before z in nums1, and also x before y before z in nums2. Return the number of good triplets.",
        "Example 1:\nInput: nums1 = [2, 0, 1, 3], nums2 = [0, 1, 2, 3]\nOutput: 1\nExplanation: The only triplet in increasing position order in both arrays is (0, 1, 3).",
        "Example 2:\nInput: nums1 = [4, 0, 1, 3, 2], nums2 = [4, 1, 0, 2, 3]\nOutput: 4\nExplanation: The good triplets are (4, 0, 3), (4, 0, 2), (4, 1, 3) and (4, 1, 2).",
        "Constraints:\n- 3 <= n <= 10^5\n- 0 <= nums1[i], nums2[i] <= n - 1\n- Both arrays are permutations of 0..n-1",
      ],
      code: `class Solution {
    int n;
    vector<int> f;
    void add(int i) { for (; i <= n; i += i & -i) f[i]++; }
    int sum(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }

public:
    long long goodTriplets(vector<int>& nums1, vector<int>& nums2) {
        int m = nums1.size();
        vector<int> pos2(m);
        for (int i = 0; i < m; i++) pos2[nums2[i]] = i;
        vector<int> a(m);
        for (int i = 0; i < m; i++) a[i] = pos2[nums1[i]];  // a is a permutation of 0..m-1
        n = m;
        f.assign(n + 1, 0);
        long long ans = 0;
        for (int j = 0; j < m; j++) {
            long long left = sum(a[j]);         // i < j with a[i] < a[j]  (ranks 1..a[j])
            // a is a permutation, so exactly a[j] values are below a[j] overall;
            // those not counted on the left must lie to the right.
            long long right = (long long)(m - 1 - j) - (a[j] - left);
            ans += left * right;
            add(a[j] + 1);
        }
        return ans;
    }
};`,
      explanation: [
        "Relabel by position: let a[i] be the index in nums2 of the value sitting at index i of nums1. Then x before y in both arrays means i < j and a[i] < a[j], so a good triplet is exactly a triple of indices i < j < k with a[i] < a[j] < a[k] - an increasing triple in a single permutation.",
        "Count by pivot. Fixing the middle element j, the number of triples through it is left(j) * right(j), where left(j) counts i < j with a[i] < a[j] and right(j) counts k > j with a[k] > a[j]. Summing over j counts every triple exactly once, because each triple has exactly one middle element.",
        "left(j) is a plain BIT prefix count during a left-to-right sweep. right(j) needs no second sweep: since a is a permutation, exactly a[j] values in the whole array are smaller than a[j], and left(j) of them are on the left, so a[j] - left(j) smaller values sit to the right. Subtracting those from the m - 1 - j elements to the right leaves the larger ones.",
        "The natural mistake is to fix the smallest element instead of the middle one, which forces a nested count and drifts back toward O(n^2). Pivoting on the middle is what keeps it to one prefix query per index.",
        "The product left * right can reach roughly (n/3)^2 per index and the total is on the order of n^3, so the accumulator must be 64-bit - a 32-bit sum overflows well before n = 10^5.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "List Removals",
      difficulty: "Hard",
      variation: "Binary descent on the BIT to find the k-th alive",
      question: [
        "You are given a list of n integers and then n positions. Process the positions in order: for each given position p, remove the element currently at position p of the list (1-indexed, counting only elements that have not been removed yet) and print the removed value. Every element is removed exactly once.",
        "Example 1:\nInput:\n5\n2 6 1 4 2\n2 1 1 2 1\nOutput:\n6 2 1 2 4\nExplanation: Position 2 of [2,6,1,4,2] is 6, leaving [2,1,4,2]. Position 1 is 2, leaving [1,4,2]. Position 1 is 1, leaving [4,2]. Position 2 is 2, leaving [4]. Position 1 is 4.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= value <= 10^9\n- The p-th query satisfies 1 <= p <= n - (number already removed)",
      ],
      code: `struct BIT {
    int n, LOG;
    vector<int> f;
    BIT(int n) : n(n), LOG(0), f(n + 1, 0) {
        while ((1 << (LOG + 1)) <= n) LOG++;
    }
    void add(int i, int v) { for (; i <= n; i += i & -i) f[i] += v; }
    // Smallest index whose prefix sum is >= k, walking down powers of two.
    int kth(int k) const {
        int idx = 0;
        for (int pw = LOG; pw >= 0; pw--) {
            int nxt = idx + (1 << pw);
            if (nxt <= n && f[nxt] < k) {
                idx = nxt;
                k -= f[nxt];
            }
        }
        return idx + 1;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    BIT bit(n);
    for (int i = 1; i <= n; i++) {
        bit.f[i] += 1;                          // O(n) build of the all-ones tree
        int j = i + (i & -i);
        if (j <= n) bit.f[j] += bit.f[i];
    }
    for (int q = 0; q < n; q++) {
        int p;
        cin >> p;
        int idx = bit.kth(p);                   // original index of the p-th surviving element
        cout << a[idx] << " \\n"[q == n - 1];
        bit.add(idx, -1);                       // mark it removed
    }
    return 0;
}`,
      explanation: [
        "Keep the elements in their original positions forever and store a 1 for alive and a 0 for removed. Then 'the p-th element of the current list' is 'the smallest original index whose prefix sum of alive markers equals p' - a select query, the inverse of the usual prefix-count query.",
        "The naive way to invert is binary search over the answer with a prefix query inside, which is O(log^2 n). The descent shown here is O(log n): start at index 0 and try adding the largest power of two first. Because f[nxt] with nxt = idx + 2^pw stores the sum of the whole block (idx, nxt], comparing it against the remaining k tells you in one step whether the target lies inside that block or past it. Skipping a block subtracts its count from k.",
        "This descent is only valid because all stored values are non-negative, which makes prefix sums monotone. On a BIT holding mixed signs there is no such monotonicity and the descent silently returns garbage.",
        "The alternative structures - an order-statistic tree, or a linked list with sqrt blocks - solve it too, but the BIT descent is the shortest correct O(n log n) and is the same routine used for Josephus-style rotations.",
        "Time: O(n log n) overall, O(log n) per removal. Space: O(n).",
      ],
    },
    {
      name: "Josephus Problem II",
      difficulty: "Hard",
      variation: "Circular k-th select with wraparound",
      question: [
        "There are n children numbered 1..n standing in a circle. Starting from the beginning of the circle, repeatedly skip k children and remove the next one, continuing around the circle from the position just vacated. Print the order in which the children are removed.",
        "Example 1:\nInput:\n7 2\nOutput:\n3 6 2 7 5 1 4\nExplanation: Skip 1 and 2, remove 3. Skip 4 and 5, remove 6. Skip 7 and 1, remove 2. Skip 4 and 5, remove 7. Skip 1 and 4, remove 5. Skip 1 and 4 (wrapping), remove 1. Finally remove 4.",
        "Example 2:\nInput:\n4 1\nOutput:\n2 4 3 1\nExplanation: Skip 1, remove 2. Skip 3, remove 4. Skip 1 (wrapping), remove 3. Finally remove 1.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= k <= 10^9",
      ],
      code: `struct BIT {
    int n, LOG;
    vector<int> f;
    BIT(int n) : n(n), LOG(0), f(n + 1, 0) {
        while ((1 << (LOG + 1)) <= n) LOG++;
    }
    void add(int i, int v) { for (; i <= n; i += i & -i) f[i] += v; }
    int kth(int k) const {                      // smallest index with prefix sum >= k
        int idx = 0;
        for (int pw = LOG; pw >= 0; pw--) {
            int nxt = idx + (1 << pw);
            if (nxt <= n && f[nxt] < k) {
                idx = nxt;
                k -= f[nxt];
            }
        }
        return idx + 1;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, k;
    cin >> n >> k;
    BIT bit((int)n);
    for (int i = 1; i <= n; i++) {
        bit.f[i] += 1;
        int j = i + (i & -i);
        if (j <= n) bit.f[j] += bit.f[i];
    }
    long long alive = n, pos = 0;                // pos = 0-based rank of the next start
    for (long long step = 0; step < n; step++) {
        long long idx = (pos + k % alive) % alive;   // reduce k first: it can dwarf alive
        int who = bit.kth((int)(idx + 1));           // 0-based rank -> 1-based select
        cout << who << " \\n"[step == n - 1];
        bit.add(who, -1);
        alive--;
        pos = alive > 0 ? idx % alive : 0;           // the survivor now at idx is the next start
    }
    return 0;
}`,
      explanation: [
        "The circle is only bookkeeping. Keep a BIT of alive markers over the original numbering and track pos, the 0-based rank of the child who would be counted first. Skipping k and removing the next one means removing the child of rank (pos + k) mod alive.",
        "Converting a rank to an actual child is the same O(log n) binary descent as in List Removals: find the smallest original index whose alive-prefix-sum reaches idx+1.",
        "After a removal, the child who used to sit at rank idx+1 slides down into rank idx, and that is exactly where the next round should start counting from - so pos = idx, reduced modulo the new alive count to handle wrapping off the end. Setting pos = idx + 1 is the classic off-by-one and shifts the entire output by one child.",
        "k can be 10^9 while alive shrinks to 1, so k must be reduced modulo alive before adding; skipping that reduction risks both overflow-adjacent arithmetic and a wrong index. Note k % alive is recomputed every round because alive changes.",
        "A std::list rotation simulates this directly but costs O(n * k) and times out; the closed-form recurrence for the classic Josephus problem only gives the final survivor, not the whole removal order, which is why the select-capable BIT is the intended structure.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
