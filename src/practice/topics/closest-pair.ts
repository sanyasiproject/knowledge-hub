import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Minimum Absolute Difference",
      difficulty: "Easy",
      variation: "One-dimensional closest pair by sorting",
      link: "https://leetcode.com/problems/minimum-absolute-difference/",
      question: [
        "Given an array of distinct integers, let m be the minimum absolute difference between any two elements. Return every pair [a, b] with a < b and b - a == m, listed in ascending order of a.",
        "Example 1:\nInput: arr = [4, 2, 1, 3]\nOutput: [[1,2],[2,3],[3,4]]\nExplanation: Sorted the array is 1,2,3,4 and every neighbouring gap is 1, which is the minimum, so all three neighbouring pairs qualify.",
        "Example 2:\nInput: arr = [3, 8, -10, 23, 19, -4, -14, 27]\nOutput: [[-14,-10],[19,23],[23,27]]\nExplanation: Sorted the array is -14,-10,-4,3,8,19,23,27 with gaps 4,6,7,5,11,4,4. The minimum gap is 4, achieved by three neighbouring pairs.",
        "Constraints:\n- 2 <= arr.length <= 10^5\n- -10^6 <= arr[i] <= 10^6\n- all values are distinct",
      ],
      code: `vector<vector<int>> minimumAbsDifference(vector<int>& arr) {
    sort(arr.begin(), arr.end());
    int n = arr.size();
    int best = INT_MAX;
    for (int i = 1; i < n; i++) best = min(best, arr[i] - arr[i - 1]);
    vector<vector<int>> res;
    for (int i = 1; i < n; i++)
        if (arr[i] - arr[i - 1] == best) res.push_back({arr[i - 1], arr[i]});
    return res;
}`,
      explanation: [
        "This is the closest-pair problem collapsed to one dimension, and the whole pattern is visible here in miniature: the closest pair cannot be far apart in sorted order, so sorting turns a quadratic search into a linear scan.",
        "The invariant that makes the single pass legal: if i < j - 1 in sorted order then arr[j] - arr[i] >= arr[i+1] - arr[i], because the values in between are sandwiched. So a non-adjacent pair is never strictly better than some adjacent pair, and only the n-1 adjacent gaps need to be examined.",
        "The tempting wrong approach is the double loop over all pairs. It is not just slow - it also hides the structural fact that in higher dimensions gets replaced by the strip argument, which is the same idea: only geometric neighbours can be the answer.",
        "Two passes keep it simple: find the minimum gap first, then collect every adjacent pair matching it. Collecting during the first pass means clearing the result list whenever a smaller gap appears, which is easy to get wrong.",
        "Time: O(n log n) dominated by the sort. Space: O(1) extra beyond the output.",
      ],
    },
    {
      name: "Minimum Absolute Difference in BST",
      difficulty: "Easy",
      variation: "One-dimensional closest pair with the sort already done",
      link: "https://leetcode.com/problems/minimum-absolute-difference-in-bst/",
      question: [
        "Given the root of a binary search tree with at least two nodes, return the minimum absolute difference between the values of any two different nodes.",
        "Example 1:\nInput: root = [4,2,6,1,3]\nOutput: 1\nExplanation: The values in order are 1,2,3,4,6 with neighbouring gaps 1,1,1,2, so the answer is 1.",
        "Example 2:\nInput: root = [1,0,48,null,null,12,49]\nOutput: 1\nExplanation: The values in order are 0,1,12,48,49 with gaps 1,11,36,1, so the answer is 1.",
        "Constraints:\n- 2 <= number of nodes <= 10^5\n- 0 <= Node.val <= 10^5\n- the tree is a valid binary search tree",
      ],
      code: `class Solution {
    int best = INT_MAX;
    long long prevVal = LLONG_MIN;   // value of the previously visited node, or "none"

    void inorder(TreeNode* node) {
        if (!node) return;
        inorder(node->left);
        if (prevVal != LLONG_MIN) best = min<long long>(best, node->val - prevVal);
        prevVal = node->val;         // in-order visit: values arrive sorted
        inorder(node->right);
    }

public:
    int getMinimumDifference(TreeNode* root) {
        inorder(root);
        return best;
    }
};`,
      explanation: [
        "An in-order walk of a BST emits the values in non-decreasing order, so the sort step of the previous problem is free. Everything else is identical: compare each value only with its immediate predecessor.",
        "Correctness rests on the same sandwich argument - between two nodes that are not in-order neighbours there sits at least one more value, so their difference is at least as large as one of the neighbouring gaps.",
        "Materialising the whole traversal into a vector and then scanning it works too but costs O(n) memory; carrying a single previous value is enough because the transition only looks one step back.",
        "The trap is the sentinel. Node values can be 0, so initialising the previous value to 0 or -1 silently produces a bogus first comparison; use an out-of-range sentinel or an explicit flag.",
        "Time: O(n). Space: O(h) for the recursion stack, where h is the tree height.",
      ],
    },
    {
      name: "Closest Pair of Points",
      difficulty: "Medium",
      variation: "The divide-and-conquer template with the strip",
      link: "https://www.geeksforgeeks.org/closest-pair-of-points-using-divide-and-conquer-algorithm/",
      question: [
        "Given n points in the plane with integer coordinates, find the smallest Euclidean distance between any two of them. Solve it in O(n log n) rather than by checking all pairs.",
        "Example 1:\nInput: points = [(2,3),(12,30),(40,50),(5,1),(12,10),(3,4)]\nOutput: 1.414214\nExplanation: The pair (2,3) and (3,4) is at distance sqrt(2) = 1.414214, and no other pair is closer - the next best are (2,3)-(5,1) and (5,1)-(3,4), both at sqrt(13).",
        "Example 2:\nInput: points = [(0,0),(3,4)]\nOutput: 5.000000\nExplanation: With only two points the answer is the single distance, sqrt(9 + 16) = 5.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^9 <= x, y <= 10^9",
      ],
      code: `struct Point { long long x, y; };

long long sq(long long v) { return v * v; }
long long d2(const Point& a, const Point& b) { return sq(a.x - b.x) + sq(a.y - b.y); }

// a[l..r) enters sorted by x and leaves sorted by y; returns the min squared distance.
long long closestSq(vector<Point>& a, int l, int r) {
    if (r - l <= 3) {
        long long best = LLONG_MAX;
        for (int i = l; i < r; i++)
            for (int j = i + 1; j < r; j++) best = min(best, d2(a[i], a[j]));
        sort(a.begin() + l, a.begin() + r,
             [](const Point& p, const Point& q) { return p.y < q.y; });
        return best;
    }
    int m = (l + r) / 2;
    long long midx = a[m].x;                     // capture before recursion reorders the halves
    long long best = min(closestSq(a, l, m), closestSq(a, m, r));
    inplace_merge(a.begin() + l, a.begin() + m, a.begin() + r,
                  [](const Point& p, const Point& q) { return p.y < q.y; });
    vector<Point> strip;
    for (int i = l; i < r; i++)
        if (sq(a[i].x - midx) < best) strip.push_back(a[i]);   // strip is y-sorted
    for (size_t i = 0; i < strip.size(); i++)
        for (size_t j = i + 1; j < strip.size() && sq(strip[j].y - strip[i].y) < best; j++)
            best = min(best, d2(strip[i], strip[j]));
    return best;
}

double closestPair(vector<Point> pts) {
    sort(pts.begin(), pts.end(),
         [](const Point& p, const Point& q) { return p.x < q.x; });
    return sqrt((double)closestSq(pts, 0, (int)pts.size()));
}`,
      explanation: [
        "Split the x-sorted points at the median into left and right halves and recurse. The best pair either lives entirely in one half - handled by the recursion - or straddles the dividing line, and in that case both of its points must lie within distance d of the line, where d is the better of the two half answers. Only that strip needs extra work.",
        "The strip could still hold every point, so the quadratic scan inside it must be bounded. Sort the strip by y and, for each point, only compare with later points whose y difference is below d. Any d-by-2d rectangle can hold at most a constant number of points that are pairwise at least d apart, so each point does O(1) comparisons and the merge step is linear.",
        "Sorting the strip by y from scratch at every level gives O(n log^2 n). Returning each subrange in y order and merging the two halves - the inplace_merge here - drops it to O(n log n): the recursion doubles as a merge sort on y.",
        "All arithmetic stays on squared distances, so the whole algorithm is exact integer work with no floating-point comparisons; the single sqrt happens once at the end. Coordinates up to 10^9 make a squared distance up to 8 * 10^18, which still fits in a signed 64-bit integer, but a squared distance in int would overflow.",
        "The classic bug is computing the split coordinate from a[m] after the recursive calls have permuted the array into y order. Capture it first, or the strip test filters the wrong points and the answer is silently too large.",
        "Time: O(n log n). Space: O(n) for the strip buffers plus O(log n) recursion.",
      ],
    },
    {
      name: "Maximum Gap",
      difficulty: "Medium",
      variation: "Farthest neighbouring pair in 1D, bucket pigeonhole",
      link: "https://leetcode.com/problems/maximum-gap/",
      question: [
        "Given an unsorted integer array, return the maximum difference between two successive elements in its sorted form. If the array has fewer than two elements, return 0. Aim for linear time and linear extra space.",
        "Example 1:\nInput: nums = [3, 6, 9, 1]\nOutput: 3\nExplanation: Sorted the array is 1,3,6,9 with successive gaps 2,3,3, so the maximum is 3.",
        "Example 2:\nInput: nums = [10]\nOutput: 0\nExplanation: Fewer than two elements, so there is no successive pair.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] <= 10^9",
      ],
      code: `int maximumGap(vector<int>& nums) {
    int n = nums.size();
    if (n < 2) return 0;
    int lo = *min_element(nums.begin(), nums.end());
    int hi = *max_element(nums.begin(), nums.end());
    if (lo == hi) return 0;
    int width = max(1, (hi - lo) / (n - 1));   // no gap can be smaller than this
    int cnt = (hi - lo) / width + 1;
    vector<int> mn(cnt, INT_MAX), mx(cnt, INT_MIN);
    for (int x : nums) {
        int b = (x - lo) / width;
        mn[b] = min(mn[b], x);
        mx[b] = max(mx[b], x);
    }
    int ans = 0, prev = lo;
    for (int i = 0; i < cnt; i++) {
        if (mn[i] == INT_MAX) continue;        // empty bucket: gap spans across it
        ans = max(ans, mn[i] - prev);
        prev = mx[i];
    }
    return ans;
}`,
      explanation: [
        "This is the mirror image of the 1D closest pair: the answer is again attained by a neighbouring pair in sorted order, but now it is the largest such gap rather than the smallest. That lets the same pigeonhole trick that bounds the strip here bound the bucket contents.",
        "The n values span a range of hi - lo, so the largest successive gap is at least (hi - lo) / (n - 1). Choose that as the bucket width. Then two numbers inside one bucket differ by less than the guaranteed maximum, so no maximum gap can be internal to a bucket - only bucket-boundary pairs matter, and per bucket just the minimum and maximum are needed.",
        "Walking the buckets in order and pairing each bucket's minimum with the previous non-empty bucket's maximum therefore examines every candidate. Empty buckets are skipped, which is exactly how a wide gap gets measured.",
        "The naive route is to sort and scan, which is correct but O(n log n); the point of the problem is the linear-time bound. The subtle bugs are the width becoming 0 by integer division when the range is smaller than n, fixed by the max with 1, and the all-equal case where the answer is 0.",
        "Time: O(n). Space: O(n) for the buckets.",
      ],
    },
    {
      name: "Contains Duplicate III",
      difficulty: "Medium",
      variation: "Closest pair restricted to a sliding index window",
      link: "https://leetcode.com/problems/contains-duplicate-iii/",
      question: [
        "Given an integer array nums and two integers indexDiff and valueDiff, decide whether there exists a pair of indices i and j with i != j, abs(i - j) <= indexDiff, and abs(nums[i] - nums[j]) <= valueDiff. Return true if such a pair exists.",
        "Example 1:\nInput: nums = [1,2,3,1], indexDiff = 3, valueDiff = 0\nOutput: true\nExplanation: i = 0 and j = 3 give abs(0 - 3) = 3 <= 3 and abs(1 - 1) = 0 <= 0.",
        "Example 2:\nInput: nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3\nOutput: false\nExplanation: Within any window of three consecutive positions the values differ by at least 4, so no pair qualifies.",
        "Constraints:\n- 2 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n- 1 <= indexDiff <= nums.length\n- 0 <= valueDiff <= 10^9",
      ],
      code: `bool containsNearbyAlmostDuplicate(vector<int>& nums, int indexDiff, int valueDiff) {
    set<long long> win;                     // values of the last indexDiff + 1 positions
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > indexDiff) win.erase((long long)nums[i - indexDiff - 1]);
        long long v = nums[i];
        auto it = win.lower_bound(v - valueDiff);   // smallest value not below v - valueDiff
        if (it != win.end() && *it <= v + valueDiff) return true;
        win.insert(v);
    }
    return false;
}`,
      explanation: [
        "Think of the input as points (index, value). The question asks whether two points are close in both coordinates, which is the closest-pair question under the Chebyshev-style box test with different tolerances per axis.",
        "Sweeping i left to right makes the index constraint a sliding window, so the remaining job is a nearest-value query inside that window. An ordered set of the window's values answers it: the only candidates are the in-order predecessor and successor of nums[i], and a single lower_bound plus one comparison covers both, because the first value at or above v - valueDiff is the one most likely to also be at most v + valueDiff.",
        "Arithmetic is the classic trap. nums[i] - valueDiff and nums[i] + valueDiff both overflow 32-bit integers at the constraint limits, so the window must hold 64-bit values.",
        "Duplicate values collapsing in the set is harmless: whenever an insert would duplicate an existing window value, valueDiff >= 0 means that pair already satisfied the test and the function returned on the previous line.",
        "The bucket alternative maps each value to floor(v / (valueDiff + 1)) and checks three buckets, giving O(n) expected time; the ordered set is easier to get right and fast enough.",
        "Time: O(n log k) where k = indexDiff. Space: O(k).",
      ],
    },
    {
      name: "Magnetic Force Between Two Balls",
      difficulty: "Medium",
      variation: "Maximise the minimum pairwise distance",
      link: "https://leetcode.com/problems/magnetic-force-between-two-balls/",
      question: [
        "There are n baskets at the given integer positions on a line, and m balls to distribute into distinct baskets. The magnetic force between two balls is the distance between their baskets. Place the m balls so that the minimum magnetic force between any two of them is as large as possible, and return that maximum possible minimum force.",
        "Example 1:\nInput: position = [1,2,3,4,7], m = 3\nOutput: 3\nExplanation: Placing the balls at 1, 4 and 7 gives pairwise distances 3, 3 and 6, so the minimum is 3. No placement of three balls achieves a minimum of 4.",
        "Example 2:\nInput: position = [5,4,3,2,1,1000000000], m = 2\nOutput: 999999999\nExplanation: With two balls, use the extremes 1 and 1000000000.",
        "Constraints:\n- 2 <= position.length <= 10^5\n- 1 <= position[i] <= 10^9\n- all positions are distinct\n- 2 <= m <= position.length",
      ],
      code: `int maxDistance(vector<int>& position, int m) {
    sort(position.begin(), position.end());
    int lo = 1, hi = position.back() - position.front(), ans = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;       // candidate minimum force
        int cnt = 1, last = position[0];    // greedy: leftmost basket is always usable
        for (int x : position)
            if (x - last >= mid) { cnt++; last = x; }
        if (cnt >= m) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
}`,
      explanation: [
        "The quantity being optimised is the closest pair among the chosen baskets, so this is the closest-pair objective turned into a decision: can m balls be placed with every pair at distance at least d?",
        "That predicate is monotone - if d works then any smaller d works - which licenses a binary search on the answer. Checking one d is a greedy left-to-right sweep: taking the leftmost feasible basket each time is optimal by an exchange argument, since pushing any chosen basket further right only reduces the room left for the remaining balls.",
        "Sorting first is what makes the greedy meaningful; on unsorted input the sweep counts nonsense. Note also that only consecutive chosen baskets need checking, because in sorted order a non-adjacent pair is at least as far apart.",
        "The tempting wrong model is a DP or a direct search over subsets, both far too slow at n = 10^5. The other common slip is a binary search on positions rather than on the distance value.",
        "Time: O(n log n + n log C) where C is the coordinate range. Space: O(1) extra.",
      ],
    },
    {
      name: "Maximum of Absolute Value Expression",
      difficulty: "Medium",
      variation: "Farthest pair under Manhattan distance",
      link: "https://leetcode.com/problems/maximum-of-absolute-value-expression/",
      question: [
        "Given two integer arrays arr1 and arr2 of equal length n, return the maximum over all pairs i, j of the value abs(arr1[i] - arr1[j]) + abs(arr2[i] - arr2[j]) + abs(i - j).",
        "Example 1:\nInput: arr1 = [1,2,3,4], arr2 = [-1,4,5,6]\nOutput: 13\nExplanation: Taking i = 0 and j = 3 gives abs(1 - 4) + abs(-1 - 6) + abs(0 - 3) = 3 + 7 + 3 = 13.",
        "Example 2:\nInput: arr1 = [1,-2,-5,0,10], arr2 = [0,-2,-1,-7,-4]\nOutput: 20\nExplanation: Taking i = 2 and j = 4 gives abs(-5 - 10) + abs(-1 - (-4)) + abs(2 - 4) = 15 + 3 + 2 = 20.",
        "Constraints:\n- 2 <= arr1.length == arr2.length <= 40000\n- -10^6 <= arr1[i], arr2[i] <= 10^6",
      ],
      code: `int maxAbsValExpr(vector<int>& arr1, vector<int>& arr2) {
    int n = arr1.size(), ans = 0;
    for (int s1 : {1, -1})
        for (int s2 : {1, -1}) {
            int mx = INT_MIN, mn = INT_MAX;
            for (int i = 0; i < n; i++) {
                int v = s1 * arr1[i] + s2 * arr2[i] + i;   // one linear form
                mx = max(mx, v);
                mn = min(mn, v);
            }
            ans = max(ans, mx - mn);       // best pair for this sign pattern
        }
    return ans;
}`,
      explanation: [
        "Each index is a point (arr1[i], arr2[i], i) and the expression is exactly its Manhattan distance to another point, so the task is the farthest pair in 3D under the L1 metric - the maximisation twin of closest pair.",
        "The key identity: abs(a) = max(a, -a), so a sum of three absolute values equals the maximum over the eight sign patterns of the corresponding signed sum. Half of those patterns are negations of the other half and give the same pair value, so four suffice, and each is a linear form f(i) = s1 * arr1[i] + s2 * arr2[i] + i.",
        "For a fixed sign pattern the best pair is simply max f minus min f over all i, computable in one pass. Taking the maximum over the four patterns can never exceed the true answer because every signed sum is a lower bound on the absolute sum, and it attains it because the pattern matching the actual signs of the optimal pair is one of the four.",
        "The i term needs no separate handling - it is just a third coordinate whose sign is fixed to +1 in one axis and absorbed by the negated pattern in the other. This L1-to-linear-forms reduction is the standard way to avoid any geometry for Manhattan extremal problems.",
        "The trap is trying to reason about which i is larger, or splitting on abs(i - j) by cases; the sign enumeration handles all of it at once. The naive double loop is 1.6 * 10^9 operations at the limit.",
        "Time: O(n) with a constant factor of 4. Space: O(1).",
      ],
    },
    {
      name: "Minimum Euclidean Distance",
      difficulty: "Hard",
      variation: "Sweep line with an ordered set, exact integer answer",
      link: "https://cses.fi/problemset/task/2194",
      question: [
        "Given n points with integer coordinates, print the minimum squared Euclidean distance between two distinct points. The answer is asked as a squared distance precisely so that it is an exact integer.",
        "Example 1:\nInput:\n4\n2 1\n3 4\n1 1\n5 2\nOutput: 1\nExplanation: The points (2,1) and (1,1) are at squared distance 1. Every other pair is farther: (3,4)-(5,2) gives 8, (2,1)-(3,4) and (2,1)-(5,2) give 10, (3,4)-(1,1) gives 13, and (1,1)-(5,2) gives 17.",
        "Example 2:\nInput:\n3\n0 0\n0 3\n4 0\nOutput: 9\nExplanation: The closest pair is (0,0) and (0,3) at squared distance 9; the others are 16 and 25.",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- -10^9 <= x, y <= 10^9\n- two points may coincide, in which case the answer is 0",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<long long,long long>> p(n);
    for (auto& q : p) cin >> q.first >> q.second;
    sort(p.begin(), p.end());                  // by x, then y
    long long best = LLONG_MAX;
    set<pair<long long,long long>> active;     // (y, x) of points inside the strip
    int j = 0;
    for (int i = 0; i < n; i++) {
        long long d = (long long)sqrtl((long double)best) + 1;   // safe upper bound on sqrt(best)
        while (j < i && p[i].first - p[j].first >= d) {
            active.erase({p[j].second, p[j].first});
            j++;
        }
        auto it = active.lower_bound({p[i].second - d, LLONG_MIN});
        for (; it != active.end() && it->first <= p[i].second + d; ++it) {
            long long dx = p[i].first - it->second;
            long long dy = p[i].second - it->first;
            best = min(best, dx * dx + dy * dy);
        }
        active.insert({p[i].second, p[i].first});
    }
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "This is the divide-and-conquer strip argument reorganised as a left-to-right sweep, which is shorter to write and easier to keep correct. Process points in x order, maintaining the set of already-seen points whose x is within the current best distance d of the sweep line - the same strip as before, now as a moving window.",
        "For the new point only set members whose y lies in [y - d, y + d] can beat d, and the same packing bound applies: a d-by-2d box holds O(1) points that are pairwise at least d apart, so each point inspects a constant number of neighbours amortised. Every point that leaves the window is erased exactly once, so the two pointers are linear.",
        "Whenever best shrinks the window shrinks with it, which is what keeps the set small. Recomputing d from the previous best rather than the newest one is deliberate and safe: an overestimate of d only widens the search, never misses a pair.",
        "Order the set by (y, x) so lower_bound can seek by y alone; ordering by x would make the y-range query impossible. The x is carried along only to compute dx.",
        "Overflow is the real difficulty. With coordinates up to 10^9 a squared distance reaches 8 * 10^18, which fits in a signed 64-bit integer but leaves no room for products of intermediate sums, and sqrt on a double loses precision near that magnitude - hence the long double and the plus one. Printing sqrt of the answer instead of the squared value is the other classic way to lose the problem.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Tricky Function",
      difficulty: "Hard",
      variation: "Reducing a cost function to closest pair",
      link: "https://codeforces.com/problemset/problem/429/D",
      question: [
        "You are given an array a of n integers. Let s(i) be the prefix sum a[1] + ... + a[i]. For indices i != j define f(i, j) = (i - j)^2 + (s(i) - s(j))^2. Print the minimum value of f over all pairs i != j.",
        "Example 1:\nInput:\n4\n1 0 0 -1\nOutput: 1\nExplanation: The prefix sums are s = 1,1,1,0. Taking i = 1 and j = 2 gives (1-2)^2 + (1-1)^2 = 1, and no pair can do better since i != j forces the first term to be at least 1.",
        "Example 2:\nInput:\n2\n1 -1\nOutput: 2\nExplanation: s = 1,0, so the only pair gives (1-2)^2 + (1-0)^2 = 1 + 1 = 2.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^4 <= a[i] <= 10^4",
      ],
      code: `struct Point { long long x, y; };

long long sq(long long v) { return v * v; }
long long d2(const Point& a, const Point& b) { return sq(a.x - b.x) + sq(a.y - b.y); }

// a[l..r) enters sorted by x and leaves sorted by y; returns the min squared distance.
long long closestSq(vector<Point>& a, int l, int r) {
    if (r - l <= 3) {
        long long best = LLONG_MAX;
        for (int i = l; i < r; i++)
            for (int j = i + 1; j < r; j++) best = min(best, d2(a[i], a[j]));
        sort(a.begin() + l, a.begin() + r,
             [](const Point& p, const Point& q) { return p.y < q.y; });
        return best;
    }
    int m = (l + r) / 2;
    long long midx = a[m].x;
    long long best = min(closestSq(a, l, m), closestSq(a, m, r));
    inplace_merge(a.begin() + l, a.begin() + m, a.begin() + r,
                  [](const Point& p, const Point& q) { return p.y < q.y; });
    vector<Point> strip;
    for (int i = l; i < r; i++)
        if (sq(a[i].x - midx) < best) strip.push_back(a[i]);
    for (size_t i = 0; i < strip.size(); i++)
        for (size_t j = i + 1; j < strip.size() && sq(strip[j].y - strip[i].y) < best; j++)
            best = min(best, d2(strip[i], strip[j]));
    return best;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<Point> p(n);
    long long s = 0;
    for (int i = 0; i < n; i++) {
        long long v;
        cin >> v;
        s += v;
        p[i] = {(long long)i + 1, s};   // point (index, prefix sum), already x-sorted
    }
    cout << closestSq(p, 0, n) << "\\n";
    return 0;
}`,
      explanation: [
        "The whole problem is the reduction. f(i, j) is literally the squared Euclidean distance between the plane points (i, s(i)) and (j, s(j)), so minimising f over all pairs is the closest-pair problem on those n points, and the same divide-and-conquer applies verbatim.",
        "The points come out of the input already sorted by x, since the x coordinate is the index itself, so the initial sort can be skipped; only the y ordering has to be built up by the merges inside the recursion.",
        "Because the answer is wanted as f itself, no square root ever appears: the algorithm works entirely on squared distances and prints one. Prefix sums reach 10^9 in magnitude, so a squared term reaches 10^18 and 64-bit arithmetic is mandatory - 32-bit overflows quietly and produces a wrong but plausible answer.",
        "The tempting alternatives both fail. The quadratic double loop is 5 * 10^9 pairs. Restricting attention to nearby indices is wrong in general: when the prefix sums move slowly, close-in-value points can be very far apart in index, and vice versa when the array oscillates.",
        "One useful sanity check: since i != j the first term is at least 1, so the answer is never 0 no matter how flat the prefix sums are.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
