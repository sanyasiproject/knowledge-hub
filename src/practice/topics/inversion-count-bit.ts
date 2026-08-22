import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Count Inversions",
      difficulty: "Easy",
      variation: "Plain inversion count, the template",
      link: "https://www.geeksforgeeks.org/counting-inversions/",
      question: [
        "An inversion of an array is a pair of indices (i, j) with i < j and arr[i] > arr[j]. Given an array of integers, return the total number of inversions. The value tells you how far the array is from being sorted in non-decreasing order: zero means already sorted, and the maximum n*(n-1)/2 means strictly decreasing.",
        "Solve it in O(n log n) with a Binary Indexed Tree (Fenwick tree) over the compressed values, not with the O(n^2) double loop.",
        "Example 1:\nInput: arr = [2, 4, 1, 3, 5]\nOutput: 3\nExplanation: The inversions are (2,1), (4,1) and (4,3).",
        "Example 2:\nInput: arr = [2, 3, 4, 5, 6]\nOutput: 0\nExplanation: The array is already sorted, so no pair is out of order.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= arr[i] <= 10^9\n- The answer can be about 5 * 10^9, so it needs a 64-bit accumulator",
      ],
      code: `struct BIT {
    int n;
    vector<int> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i) { for (; i <= n; i += i & -i) t[i]++; }
    int sum(int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }
};

long long countInversions(vector<int>& a) {
    int n = a.size();
    vector<int> s(a);                                   // coordinate compression: values can be huge
    sort(s.begin(), s.end());
    s.erase(unique(s.begin(), s.end()), s.end());
    BIT bit((int)s.size());
    long long ans = 0;
    for (int i = n - 1; i >= 0; i--) {                  // sweep right to left
        int r = int(lower_bound(s.begin(), s.end(), a[i]) - s.begin()) + 1;   // 1-based rank
        ans += bit.sum(r - 1);                          // already-seen values strictly smaller
        bit.add(r);
    }
    return ans;
}`,
      explanation: [
        "Every inversion has a unique right endpoint, so instead of asking 'how many pairs are out of order' you ask, for each position j, 'how many elements to my right are strictly smaller than me'. Summing that over all j counts each inversion exactly once.",
        "Sweeping from right to left, the BIT holds the multiset of values already visited, i.e. exactly the elements at positions > i. A prefix sum up to rank(a[i]) - 1 is the count of those that are strictly smaller. Using rank - 1 rather than rank is what makes equal values not count, which matches the strict a[i] > a[j] definition.",
        "Values must be compressed first because a Fenwick tree is indexed by value, and 10^9 slots is impossible. Compression preserves order, which is all the counting argument needs.",
        "Two traps: an int accumulator overflows (n = 10^5 gives up to ~5 * 10^9 inversions), and off-by-one on the rank silently turns a strict comparison into a non-strict one, which inflates the answer whenever duplicates exist.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "How Many Numbers Are Smaller Than the Current Number",
      difficulty: "Easy",
      variation: "Rank query without an order constraint",
      link: "https://leetcode.com/problems/how-many-numbers-are-smaller-than-the-current-number/",
      question: [
        "Given an array nums, for each nums[i] count the number of valid j such that j != i and nums[j] < nums[i]. Return the answers as an array in the same order as nums.",
        "Example 1:\nInput: nums = [8, 1, 2, 2, 3]\nOutput: [4, 0, 1, 1, 3]\nExplanation: For 8 there are four smaller values (1, 2, 2, 3). For 1 there are none. For each 2 only the 1 is smaller. For 3 the values 1, 2, 2 are smaller.",
        "Example 2:\nInput: nums = [6, 5, 4, 8]\nOutput: [2, 1, 0, 3]\nExplanation: 6 beats 5 and 4; 5 beats 4; 4 beats nothing; 8 beats all three others.",
        "Constraints:\n- 2 <= nums.length <= 500\n- 0 <= nums[i] <= 100",
      ],
      code: `vector<int> smallerNumbersThanCurrent(vector<int>& nums) {
    const int M = 101;                              // values 0..100 shifted into indices 1..101
    vector<int> t(M + 1, 0);
    auto add = [&](int i) { for (; i <= M; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    for (int x : nums) add(x + 1);                  // build the frequency tree for the whole array
    vector<int> res;
    res.reserve(nums.size());
    for (int x : nums) res.push_back(sum(x));       // indices 1..x hold the values 0..x-1
    return res;
}`,
      explanation: [
        "This is the inversion-count building block stripped of the i < j condition: there is no position constraint, so you can insert the whole array first and then answer every query against the finished tree. That separation makes the pattern easy to see - the BIT is only ever a 'how many inserted values are below this one' oracle.",
        "Because the values are bounded by 100 the tree is indexed directly by value with a +1 shift (a Fenwick tree cannot use index 0, since i & -i would loop forever). No compression step is needed.",
        "sum(x) covers tree indices 1..x, which correspond to values 0..x-1, so duplicates of x are correctly excluded and the j != i condition takes care of itself.",
        "For these constraints a bucket count plus a prefix sum is simpler and O(n + V). The BIT earns its keep only once the query and the insertion have to interleave, which is what the later problems in this bank do.",
        "Time: O((n + V) log V) with V = 101. Space: O(V).",
      ],
    },
    {
      name: "Inversion Count (INVCNT)",
      difficulty: "Medium",
      variation: "Judge problem, multiple test cases",
      link: "https://www.spoj.com/problems/INVCNT/",
      question: [
        "Let A be an array of n distinct-or-repeated integers. An inversion is a pair (i, j) with i < j and A[i] > A[j]. The first line of input gives the number of test cases t. Each test case gives n on one line followed by the n array elements, one per line. For each test case print the number of inversions on its own line.",
        "Example 1:\nInput:\n2\n3\n3\n1\n2\n5\n2\n3\n8\n6\n1\nOutput:\n2\n5\nExplanation: For [3,1,2] the inversions are (3,1) and (3,2). For [2,3,8,6,1] they are (2,1), (3,1), (8,6), (8,1) and (6,1).",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= n <= 2 * 10^5\n- 1 <= A[i] <= 10^7\n- Reading with fast I/O matters: up to 2 * 10^6 integers overall",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        vector<int> s(a);
        sort(s.begin(), s.end());
        s.erase(unique(s.begin(), s.end()), s.end());
        int m = (int)s.size();
        vector<int> tree(m + 1, 0);                 // fresh tree per test case
        auto add = [&](int i) { for (; i <= m; i += i & -i) tree[i]++; };
        auto qsum = [&](int i) { int r = 0; for (; i > 0; i -= i & -i) r += tree[i]; return r; };
        long long ans = 0;
        for (int i = n - 1; i >= 0; i--) {
            int r = int(lower_bound(s.begin(), s.end(), a[i]) - s.begin()) + 1;
            ans += qsum(r - 1);
            add(r);
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Same right-to-left sweep as the template; the only new concern is that the state must be reset between test cases. Reusing a dirty tree is the single most common wrong answer here, and it produces answers that are too large in a way that looks like an off-by-one.",
        "Values reach 10^7, which would fit in a direct-indexed tree, but compressing to at most n distinct ranks keeps the per-test allocation proportional to n instead of 10^7 and is strictly faster when n is small.",
        "The answer for n = 2 * 10^5 can approach 2 * 10^10, far past a 32-bit int, so the accumulator is long long while the tree itself only ever stores counts that fit in int.",
        "Merge sort counts the same quantity in the same complexity and needs no compression; the BIT is preferred when the same sweep must also answer other rank queries, or when the elements arrive online.",
        "Time: O(n log n) per test case. Space: O(n).",
      ],
    },
    {
      name: "Global and Local Inversions",
      difficulty: "Medium",
      variation: "Global count versus adjacent count",
      link: "https://leetcode.com/problems/global-and-local-inversions/",
      question: [
        "You are given a permutation nums of the integers 0..n-1. A global inversion is a pair (i, j) with i < j and nums[i] > nums[j]. A local inversion is an index i with nums[i] > nums[i+1]. Return true if the number of global inversions equals the number of local inversions.",
        "Every local inversion is also a global one, so the two counts are equal exactly when no global inversion spans a gap of more than one position.",
        "Example 1:\nInput: nums = [1, 0, 2]\nOutput: true\nExplanation: One global inversion (1,0) and one local inversion at i = 0.",
        "Example 2:\nInput: nums = [1, 2, 0]\nOutput: false\nExplanation: Two global inversions, (1,0) and (2,0), but only one local inversion at i = 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- nums is a permutation of 0..n-1",
      ],
      code: `bool isIdealPermutation(vector<int>& nums) {
    int n = nums.size();
    vector<int> t(n + 1, 0);
    auto add = [&](int i) { for (; i <= n; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    long long global_ = 0, local_ = 0;
    for (int i = n - 1; i >= 0; i--) {
        int r = nums[i] + 1;                // it is a permutation of 0..n-1, so the value is the rank
        global_ += sum(r - 1);              // smaller values already seen on the right
        add(r);
    }
    for (int i = 0; i + 1 < n; i++)
        if (nums[i] > nums[i + 1]) local_++;
    return global_ == local_;
}`,
      explanation: [
        "Because the input is a permutation of 0..n-1 the value is its own rank, so the compression step disappears entirely and the BIT is indexed by nums[i] + 1 directly. Recognising that saves a sort and is worth spotting whenever a problem promises a permutation.",
        "Local inversions are a subset of global ones: index i with nums[i] > nums[i+1] is a global inversion with j = i+1. Equality therefore means every out-of-order pair is adjacent, and the direct comparison of the two counts is exactly the required test.",
        "The one-line O(n) alternative is to check abs(nums[i] - i) <= 1 for every i: if any element moves two or more positions from its sorted slot it necessarily creates a non-adjacent inversion. That is the intended trick, but computing both counts explicitly is what generalises to non-permutation inputs.",
        "The tempting wrong approach is to count global inversions with the O(n^2) double loop and call it fine because n is only 10^5 - that is 5 * 10^9 iterations and will time out.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Hard",
      variation: "Per-index inversion contribution",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "Given an integer array nums, return an array counts where counts[i] is the number of indices j with j > i and nums[j] < nums[i]. In other words, report each element's individual contribution to the total inversion count instead of the sum.",
        "Example 1:\nInput: nums = [5, 2, 6, 1]\nOutput: [2, 1, 1, 0]\nExplanation: To the right of 5 there are two smaller values (2 and 1); to the right of 2 there is one (1); to the right of 6 there is one (1); to the right of 1 there is none.",
        "Example 2:\nInput: nums = [-1, -1]\nOutput: [0, 0]\nExplanation: The values are equal, and equality is not a strict decrease, so neither index counts the other.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `vector<int> countSmaller(vector<int>& nums) {
    const int M = 20001;                        // values -10^4..10^4 shifted into indices 1..20001
    vector<int> t(M + 1, 0);
    auto add = [&](int i) { for (; i <= M; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    int n = nums.size();
    vector<int> res(n);
    for (int i = n - 1; i >= 0; i--) {
        int r = nums[i] + 10001;                // -10000 maps to 1, 10000 maps to 20001
        res[i] = sum(r - 1);                    // strictly smaller values already inserted
        add(r);
    }
    return res;
}`,
      explanation: [
        "This is the template with the accumulator removed: the right-to-left sweep already computes bit.sum(rank - 1) per index, and that number is precisely counts[i]. Summing the returned array gives the inversion count, so the two problems are the same computation at different granularity.",
        "The insertion must happen strictly after the query for index i, otherwise nums[i] counts itself when a duplicate rank is involved. The order query-then-insert is what encodes the j > i constraint.",
        "The value range is small and known, so a fixed offset replaces coordinate compression. With unbounded values you would sort-and-unique first; nothing else changes, which is worth remembering because the offset trick quietly breaks the moment the range grows.",
        "An alternative is a merge sort that carries original indices and credits each element with the number of right-half elements pulled before it, or an order-statistics BST. The BIT version is shorter and has better constants.",
        "Time: O(n log V) with V = 20001. Space: O(n + V).",
      ],
    },
    {
      name: "Reverse Pairs",
      difficulty: "Hard",
      variation: "Weighted inversion condition nums[i] > 2 * nums[j]",
      link: "https://leetcode.com/problems/reverse-pairs/",
      question: [
        "Given an integer array nums, a reverse pair is a pair of indices (i, j) with 0 <= i < j < nums.length and nums[i] > 2 * nums[j]. Return the number of reverse pairs.",
        "Example 1:\nInput: nums = [1, 3, 2, 3, 1]\nOutput: 2\nExplanation: The pairs are (1, 4) with 3 > 2 * 1 and (3, 4) with 3 > 2 * 1. The pair (2, 4) fails because 2 > 2 * 1 is false.",
        "Example 2:\nInput: nums = [2, 4, 3, 5, 1]\nOutput: 3\nExplanation: All three pairs end at the last index: 4 > 2, 3 > 2 and 5 > 2, while 2 > 2 is false.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `int reversePairs(vector<int>& nums) {
    int n = nums.size();
    vector<long long> s(nums.begin(), nums.end());
    sort(s.begin(), s.end());
    s.erase(unique(s.begin(), s.end()), s.end());
    int m = (int)s.size();
    vector<int> t(m + 1, 0);
    auto add = [&](int i) { for (; i <= m; i += i & -i) t[i]++; };
    auto qsum = [&](int i) { int r = 0; for (; i > 0; i -= i & -i) r += t[i]; return r; };
    long long ans = 0;
    for (int j = 0; j < n; j++) {
        // inserted values that are <= 2*nums[j] do not qualify; the rest do
        int le = int(upper_bound(s.begin(), s.end(), 2LL * nums[j]) - s.begin());
        ans += j - qsum(le);                    // j values inserted so far, minus the small ones
        int r = int(lower_bound(s.begin(), s.end(), (long long)nums[j]) - s.begin()) + 1;
        add(r);
    }
    return (int)ans;
}`,
      explanation: [
        "The pair condition is no longer 'out of order' but a weighted comparison, so the sweep direction flips: iterate j left to right, keep every nums[i] with i < j in the tree, and ask how many of them exceed the threshold 2 * nums[j]. That is a suffix count, obtained as (number inserted) - (prefix up to the threshold).",
        "The threshold 2 * nums[j] is generally not an element of the array, so the compressed coordinate for it must be found with upper_bound over the sorted distinct values: that returns how many distinct values are <= the threshold, which is exactly the prefix length to subtract. Using lower_bound here would wrongly include the equality case when the threshold happens to be present.",
        "Arithmetic is the real trap. nums[j] can be 2^31 - 1 or -2^31, so 2 * nums[j] overflows a 32-bit int; the multiply must be done in 64 bits (2LL * nums[j]) and the compressed array stored as long long. A signed overflow here is undefined behaviour and typically shows up as a wrong answer on one hidden test only.",
        "Negative numbers are handled for free: doubling a negative value makes it smaller, so a negative nums[j] admits fewer partners, and the ordering logic never needs a special case.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Number of Pairs Satisfying Inequality",
      difficulty: "Hard",
      variation: "Rearranging a two-array condition into one",
      link: "https://leetcode.com/problems/number-of-pairs-satisfying-inequality/",
      question: [
        "You are given two 0-indexed integer arrays nums1 and nums2, each of size n, and an integer diff. Count the pairs (i, j) with 0 <= i < j <= n-1 that satisfy nums1[i] - nums1[j] <= nums2[i] - nums2[j] + diff.",
        "Example 1:\nInput: nums1 = [3, 2, 5], nums2 = [2, 2, 1], diff = 1\nOutput: 3\nExplanation: With d[i] = nums1[i] - nums2[i] the array d is [1, 0, 4], and the condition becomes d[i] <= d[j] + diff. Pair (0,1): 1 <= 0 + 1. Pair (0,2): 1 <= 4 + 1. Pair (1,2): 0 <= 4 + 1. All three hold.",
        "Example 2:\nInput: nums1 = [3, -1], nums2 = [-2, 2], diff = -1\nOutput: 0\nExplanation: d = [5, -3], and the only pair needs 5 <= -3 - 1 = -4, which is false.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^4 <= nums1[i], nums2[i] <= 10^4\n- -10^4 <= diff <= 10^4",
      ],
      code: `long long numberOfPairs(vector<int>& nums1, vector<int>& nums2, int diff) {
    const int OFF = 30001, M = 60001;       // d lies in [-2*10^4, 2*10^4], the query bound in [-3*10^4, 3*10^4]
    vector<int> t(M + 1, 0);
    auto add = [&](int i) { for (; i <= M; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    int n = nums1.size();
    long long ans = 0;
    for (int j = 0; j < n; j++) {
        int d = nums1[j] - nums2[j];
        long long q = (long long)d + diff + OFF;          // highest index still satisfying the inequality
        q = max(0LL, min((long long)M, q));               // clamp: the bound can fall outside the tree
        ans += sum((int)q);
        add(d + OFF);
    }
    return ans;
}`,
      explanation: [
        "The condition mixes both arrays and both indices, which looks like it needs two dimensions. Moving the i-terms to one side gives nums1[i] - nums2[i] <= nums1[j] - nums2[j] + diff, so with d[k] = nums1[k] - nums2[k] it collapses to d[i] <= d[j] + diff - a one-dimensional non-strict inversion condition on a single derived array.",
        "Sweep j left to right with all earlier d[i] in the tree and query the prefix up to d[j] + diff. This is a non-strict comparison, so the query index includes the bound itself, unlike the strict template which stops at rank - 1. Getting that boundary wrong is the classic off-by-one for this problem.",
        "The tree spans -30000..30000 because the query bound d[j] + diff can leave the range that d itself occupies. Clamping to [0, M] is not cosmetic: an index above M would silently do nothing in add but an unclamped negative or oversized value in sum is a real out-of-bounds read.",
        "The count is up to about 5 * 10^9 pairs, so the return type must be long long even though every input value fits in an int.",
        "Time: O(n log V) with V = 60001. Space: O(n + V).",
      ],
    },
    {
      name: "Shift and Inversions",
      difficulty: "Hard",
      variation: "Inversions of every cyclic rotation",
      link: "https://atcoder.jp/contests/abc190/tasks/abc190_f",
      question: [
        "You are given a permutation a[0..n-1] of the integers 0..n-1. For each k = 0, 1, ..., n-1 let b be the array obtained by rotating a left by k positions, that is b[i] = a[(i + k) mod n]. Print the inversion number of b for every k, one per line.",
        "Input is n on the first line and the n values of a on the second line.",
        "Example 1:\nInput:\n4\n0 3 1 2\nOutput:\n2\n5\n2\n3\nExplanation: k = 0 gives [0,3,1,2] with inversions (3,1) and (3,2), so 2. k = 1 gives [3,1,2,0] with 5. k = 2 gives [1,2,0,3] with 2. k = 3 gives [2,0,3,1] with 3.",
        "Example 2:\nInput:\n2\n1 0\nOutput:\n1\n0\nExplanation: [1,0] has one inversion and its rotation [0,1] has none.",
        "Constraints:\n- 2 <= n <= 3 * 10^5\n- a is a permutation of 0..n-1\n- Answers can reach about 4.5 * 10^10, so they need 64-bit output",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<int> t(n + 1, 0);
    auto add = [&](int i) { for (; i <= n; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    long long inv = 0;
    for (int i = n - 1; i >= 0; i--) {          // inversions of the unrotated array
        int r = a[i] + 1;                       // permutation values are already ranks
        inv += sum(r - 1);
        add(r);
    }
    for (int k = 0; k < n; k++) {
        cout << inv << "\\n";
        long long x = a[k];                     // this element moves from the front to the back
        inv -= x;                               // it loses the x smaller values that were behind it
        inv += (long long)(n - 1) - x;          // it gains the n-1-x larger values now in front of it
    }
    return 0;
}`,
      explanation: [
        "Computing all n rotations independently would be O(n^2 log n). The saving observation is that consecutive rotations differ by a single move: rotation k+1 is rotation k with its first element x = a[k] deleted and appended at the end. Only the pairs involving x change.",
        "Because a is a permutation of 0..n-1, the number of values strictly smaller than x is exactly x and the number strictly larger is exactly n-1-x - no data structure needed for the update. While x sits at the front it forms an inversion with each of the x smaller values; once it sits at the back it forms an inversion with each of the n-1-x larger values. So inv(k+1) = inv(k) - x + (n-1-x).",
        "The BIT is used exactly once, to seed inv(0); the rest is O(1) per step. That split - one logarithmic pass for the base case plus a constant-time delta recurrence - is the reusable idea, and it appears again in problems that ask for inversions after a single swap or a single insertion.",
        "Trap: the value n-1-x is only correct because the elements are distinct and dense in 0..n-1. With duplicates or arbitrary values you must instead query the tree for the counts of smaller and larger elements, and the O(1) update disappears.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Sorting Color Balls",
      difficulty: "Hard",
      variation: "Inversions minus same-group inversions",
      link: "https://atcoder.jp/contests/abc261/tasks/abc261_f",
      question: [
        "There are N balls in a row. Ball i has a colour C[i] and a value X[i]. In one operation you may swap two adjacent balls; the swap is free if the two balls have the same colour and costs 1 otherwise. Find the minimum total cost to rearrange the balls so that the values are non-decreasing from left to right.",
        "Input is N on the first line, then the N colours, then the N values.",
        "Example 1:\nInput:\n3\n1 1 2\n3 2 1\nOutput:\n2\nExplanation: There are 3 pairs out of order by value: (3,2), (3,1) and (2,1). The pair (3,2) is two same-coloured balls, so it can be fixed for free. Cost 2.",
        "Example 2:\nInput:\n4\n1 2 1 2\n2 1 2 1\nOutput:\n3\nExplanation: The out-of-order pairs are (index 0, index 1), (index 0, index 3) and (index 2, index 3), all with value 2 before value 1. No out-of-order pair shares a colour, so every one of them costs 1.",
        "Constraints:\n- 1 <= N <= 3 * 10^5\n- 1 <= C[i] <= N\n- 1 <= X[i] <= N",
      ],
      code: `struct BIT {
    int n;
    vector<int> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i) { for (; i <= n; i += i & -i) t[i]++; }
    int sum(int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }
};

long long countInv(const vector<int>& v) {
    int m = (int)v.size();
    vector<int> s(v);
    sort(s.begin(), s.end());
    s.erase(unique(s.begin(), s.end()), s.end());
    BIT bit((int)s.size());
    long long inv = 0;
    for (int i = m - 1; i >= 0; i--) {
        int r = int(lower_bound(s.begin(), s.end(), v[i]) - s.begin()) + 1;
        inv += bit.sum(r - 1);                  // strictly smaller values to the right
        bit.add(r);
    }
    return inv;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> c(n), x(n);
    for (int i = 0; i < n; i++) cin >> c[i];
    for (int i = 0; i < n; i++) cin >> x[i];
    long long ans = countInv(x);                // every out-of-order pair costs 1 by default
    vector<vector<int>> byColor(n + 1);
    for (int i = 0; i < n; i++) byColor[c[i]].push_back(x[i]);   // left-to-right order is preserved
    for (int col = 1; col <= n; col++) ans -= countInv(byColor[col]);   // refund the free ones
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Sorting by adjacent swaps costs one swap per inversion, and each swap fixes exactly one inversion, so the unweighted answer is the inversion count of X. Making same-coloured swaps free means an inversion whose two balls share a colour contributes 0, hence answer = inv(X) - sum over colours of inv(X restricted to that colour).",
        "The subtraction is legitimate because a swap only ever exchanges the relative order of one pair. There is always a schedule that fixes each inversion exactly once (repeatedly swap any adjacent out-of-order pair), so the cost decomposes pair by pair and no interaction between pairs can make a cheaper or more expensive plan.",
        "Extracting each colour's values in original left-to-right order preserves the index order within the group, so a plain inversion count on that subsequence counts exactly the same-coloured out-of-order pairs. The groups partition the array, so the total extra work over all colours is one more O(n log n) pass, not one pass per colour.",
        "Equal values must not be counted: two balls with the same X are never out of order, so the strict rank - 1 query matters here more than usual given X[i] <= N allows many duplicates.",
        "Trap: subtracting the count of same-coloured pairs rather than same-coloured inversions. Only the pairs that are actually out of order were ever being paid for.",
        "Time: O(N log N). Space: O(N).",
      ],
    },
    {
      name: "Count of Range Sums",
      difficulty: "Hard",
      variation: "Inversions on prefix sums, range-bounded",
      link: "https://leetcode.com/problems/count-of-range-sums/",
      question: [
        "Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive. The range sum S(i, j) is the sum of nums[i] through nums[j] with i <= j.",
        "Example 1:\nInput: nums = [-2, 5, -1], lower = -2, upper = 2\nOutput: 3\nExplanation: The qualifying ranges are S(0,0) = -2, S(2,2) = -1 and S(0,2) = 2. The others are S(0,1) = 3, S(1,1) = 5 and S(1,2) = 4, all above the upper bound.",
        "Example 2:\nInput: nums = [0], lower = 0, upper = 0\nOutput: 1\nExplanation: The single range sum is 0, which is inside the interval.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1\n- -3 * 10^4 <= lower <= upper <= 3 * 10^4\n- The answer is guaranteed to fit in a 32-bit integer",
      ],
      code: `int countRangeSum(vector<int>& nums, int lower, int upper) {
    int n = nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];   // 64-bit: sums reach ~2*10^14
    vector<long long> all;
    all.reserve(3 * (n + 1));
    for (int j = 0; j <= n; j++) {                    // compress the queried bounds too
        all.push_back(pre[j]);
        all.push_back(pre[j] - lower);
        all.push_back(pre[j] - upper);
    }
    sort(all.begin(), all.end());
    all.erase(unique(all.begin(), all.end()), all.end());
    int m = (int)all.size();
    vector<int> t(m + 1, 0);
    auto add = [&](int i) { for (; i <= m; i += i & -i) t[i]++; };
    auto qsum = [&](int i) { int r = 0; for (; i > 0; i -= i & -i) r += t[i]; return r; };
    auto rankOf = [&](long long v) {
        return int(lower_bound(all.begin(), all.end(), v) - all.begin()) + 1;
    };
    int ans = 0;
    add(rankOf(pre[0]));
    for (int j = 1; j <= n; j++) {
        int hi = rankOf(pre[j] - lower);              // largest acceptable pre[i]
        int lo = rankOf(pre[j] - upper);              // smallest acceptable pre[i]
        ans += qsum(hi) - qsum(lo - 1);
        add(rankOf(pre[j]));
    }
    return ans;
}`,
      explanation: [
        "Write S(i, j) = pre[j+1] - pre[i]. The condition lower <= pre[j] - pre[i] <= upper rearranges to pre[j] - upper <= pre[i] <= pre[j] - lower, so the problem becomes: for each prefix index j, count earlier prefix indices whose value falls in a window. That is the inversion sweep with a two-sided bound instead of a one-sided one.",
        "Sweep j from 1 to n with pre[0..j-1] in the tree and take the difference of two prefix sums to get the window count. Seeding the tree with pre[0] before the loop is what allows ranges that start at index 0, and forgetting it undercounts every such range.",
        "The subtlety is compression. The queried bounds pre[j] - lower and pre[j] - upper are usually not prefix sums themselves, so they must be inserted into the coordinate set before sorting. Once they are present, lower_bound maps them exactly and both ends of the window are representable - otherwise you would need careful strict/non-strict reasoning around a missing coordinate.",
        "Prefix sums must be 64-bit: 10^5 elements near 2^31 give magnitudes around 2 * 10^14, and a 32-bit prefix array silently wraps.",
        "The alternative is a merge sort over the prefix array with a two-pointer window per merge, or a balanced BST. Both are O(n log n) as well; the BIT version is the most mechanical once the compression set is right.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Count Good Triplets in an Array",
      difficulty: "Hard",
      variation: "Three-element order, left and right counts per pivot",
      link: "https://leetcode.com/problems/count-good-triplets-in-an-array/",
      question: [
        "You are given two 0-indexed arrays nums1 and nums2 of length n, both permutations of 0..n-1. A good triplet is a set of three distinct values (x, y, z) that appears in increasing order of position in both arrays: pos1(x) < pos1(y) < pos1(z) and pos2(x) < pos2(y) < pos2(z). Return the total number of good triplets.",
        "Example 1:\nInput: nums1 = [2, 0, 1, 3], nums2 = [0, 1, 2, 3]\nOutput: 1\nExplanation: Mapping each element of nums1 to its position in nums2 gives p = [2, 0, 1, 3]. The only strictly increasing triple of p is (0, 1, 3), coming from indices 1, 2, 3.",
        "Example 2:\nInput: nums1 = [4, 0, 1, 3, 2], nums2 = [4, 1, 0, 2, 3]\nOutput: 4\nExplanation: Here p = [0, 2, 1, 4, 3], whose strictly increasing triples are (0,2,4), (0,2,3), (0,1,4) and (0,1,3).",
        "Constraints:\n- 3 <= n <= 10^5\n- nums1 and nums2 are permutations of 0..n-1",
      ],
      code: `long long goodTriplets(vector<int>& nums1, vector<int>& nums2) {
    int n = nums1.size();
    vector<int> pos(n);
    for (int i = 0; i < n; i++) pos[nums2[i]] = i;
    vector<int> p(n);
    for (int i = 0; i < n; i++) p[i] = pos[nums1[i]];   // relabel by position in nums2
    vector<int> t(n + 1, 0);
    auto add = [&](int i) { for (; i <= n; i += i & -i) t[i]++; };
    auto sum = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; };
    long long ans = 0;
    for (int j = 0; j < n; j++) {
        long long left = sum(p[j]);                    // earlier indices holding a smaller p value
        long long smallerAfter = (long long)p[j] - left;               // p is a permutation
        long long right = (long long)(n - 1 - j) - smallerAfter;       // later indices, larger value
        ans += left * right;
        add(p[j] + 1);
    }
    return ans;
}`,
      explanation: [
        "First kill one of the two arrays. Relabel every element by its position in nums2, producing p[i] = pos2(nums1[i]). Now 'increasing position in both arrays' is simply 'increasing index and increasing p value', so a good triplet is a strictly increasing subsequence of p of length 3.",
        "Count by pivot. Fix the middle element j and let L be the number of i < j with p[i] < p[j] and R the number of k > j with p[k] > p[j]. Every good triplet has exactly one middle element, so the answer is the sum of L * R - no triplet is counted twice and none is missed.",
        "L comes straight from the BIT prefix sum during the left-to-right sweep. R needs no second pass: because p is a permutation, exactly p[j] values in the whole array are smaller than p[j], of which L are before j, so p[j] - L are after it. Subtracting those from the n-1-j elements after j leaves R.",
        "Traps: L * R must be multiplied in 64-bit (both factors reach 10^5, and the total reaches roughly 10^14), and the pivot must be the middle element - fixing the smallest or largest element instead requires counting increasing pairs on one side, which is a strictly harder subproblem.",
        "The same pivot decomposition extends to length-k increasing subsequences with k-2 stacked BIT passes, each pass storing counts of shorter subsequences rather than plain ones.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
