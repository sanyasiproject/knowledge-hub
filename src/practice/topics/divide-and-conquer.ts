import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Majority Element",
      difficulty: "Easy",
      variation: "D&C vote merging",
      link: "https://leetcode.com/problems/majority-element/",
      question: [
        "Given an array nums of size n, return the majority element. The majority element is the element that appears more than n / 2 times. You may assume that the majority element always exists in the array. Solve it with divide and conquer.",
        "Example 1:\nInput: nums = [2,2,1,1,1,2,2]\nOutput: 2",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 5 * 10^4\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `int majorityElement(vector<int>& nums) {
    function<int(int, int)> solve = [&](int lo, int hi) {
        if (lo == hi) return nums[lo];
        int mid = lo + (hi - lo) / 2;
        int left = solve(lo, mid);
        int right = solve(mid + 1, hi);
        if (left == right) return left;
        int lc = (int)count(nums.begin() + lo, nums.begin() + hi + 1, left);
        int rc = (int)count(nums.begin() + lo, nums.begin() + hi + 1, right);
        return lc > rc ? left : right;
    };
    return solve(0, (int)nums.size() - 1);
}`,
      explanation: [
        "Key lemma: if x is the majority of a range, it must be the majority of at least one of its halves. So the majority of the whole range is either the left half's answer or the right half's answer.",
        "When the two candidates disagree, a linear count over the current range decides the winner; the recurrence T(n) = 2T(n/2) + O(n) follows.",
        "Time: O(n log n). Space: O(log n) recursion depth.",
      ],
    },
    {
      name: "Pow(x, n)",
      difficulty: "Medium",
      variation: "Fast exponentiation by squaring",
      link: "https://leetcode.com/problems/powx-n/",
      question: [
        "Implement pow(x, n), which calculates x raised to the power n (that is, x^n).",
        "Example 1:\nInput: x = 2.00000, n = 10\nOutput: 1024.00000",
        "Example 2:\nInput: x = 2.00000, n = -2\nOutput: 0.25000",
        "Constraints:\n- -100.0 < x < 100.0\n- -2^31 <= n <= 2^31 - 1\n- n is an integer\n- The result is within [-10^4, 10^4]",
      ],
      code: `double myPow(double x, int n) {
    long long m = n;
    if (m < 0) {
        x = 1.0 / x;
        m = -m;
    }
    double res = 1.0;
    while (m > 0) {
        if (m & 1) res *= x;
        x *= x;
        m >>= 1;
    }
    return res;
}`,
      explanation: [
        "Divide and conquer on the exponent: x^n = (x^(n/2))^2, with one extra factor of x when n is odd; the iterative form squares the base while scanning the exponent's bits.",
        "Negative exponents are handled by inverting x, and the exponent is widened to 64 bits so that negating INT_MIN does not overflow.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Subarray",
      difficulty: "Medium",
      variation: "D&C with crossing sum",
      link: "https://leetcode.com/problems/maximum-subarray/",
      question: [
        "Given an integer array nums, find the subarray with the largest sum, and return its sum. Solve it with the divide-and-conquer approach (rather than Kadane's algorithm).",
        "Example 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int maxSubArray(vector<int>& nums) {
    function<int(int, int)> solve = [&](int lo, int hi) {
        if (lo == hi) return nums[lo];
        int mid = lo + (hi - lo) / 2;
        int best = max(solve(lo, mid), solve(mid + 1, hi));
        int leftBest = INT_MIN, sum = 0;
        for (int i = mid; i >= lo; i--) {
            sum += nums[i];
            leftBest = max(leftBest, sum);
        }
        int rightBest = INT_MIN;
        sum = 0;
        for (int i = mid + 1; i <= hi; i++) {
            sum += nums[i];
            rightBest = max(rightBest, sum);
        }
        return max(best, leftBest + rightBest);
    };
    return solve(0, (int)nums.size() - 1);
}`,
      explanation: [
        "The best subarray either lies entirely in the left half, entirely in the right half, or crosses the midpoint. The two contained cases are the recursive calls; the crossing case is the best suffix ending at mid plus the best prefix starting at mid + 1.",
        "Both crossing scans are linear, giving the recurrence T(n) = 2T(n/2) + O(n).",
        "Time: O(n log n). Space: O(log n) recursion depth.",
      ],
    },
    {
      name: "Sort an Array",
      difficulty: "Medium",
      variation: "Merge sort",
      link: "https://leetcode.com/problems/sort-an-array/",
      question: [
        "Given an array of integers nums, sort the array in ascending order and return it. You must solve the problem without using any built-in sort functions, in O(n log n) time complexity and with the smallest space complexity possible.",
        "Example 1:\nInput: nums = [5,2,3,1]\nOutput: [1,2,3,5]",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -5 * 10^4 <= nums[i] <= 5 * 10^4",
      ],
      code: `vector<int> sortArray(vector<int>& nums) {
    int n = nums.size();
    vector<int> tmp(n);
    function<void(int, int)> ms = [&](int lo, int hi) {  // [lo, hi)
        if (hi - lo <= 1) return;
        int mid = lo + (hi - lo) / 2;
        ms(lo, mid);
        ms(mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid || j < hi) {
            if (j == hi || (i < mid && nums[i] <= nums[j])) tmp[k++] = nums[i++];
            else tmp[k++] = nums[j++];
        }
        for (int t = lo; t < hi; t++) nums[t] = tmp[t];
    };
    ms(0, n);
    return nums;
}`,
      explanation: [
        "Classic merge sort: split the range in half, sort each half recursively, then merge the two sorted halves in one linear pass using a scratch buffer.",
        "Merging with <= on the left element keeps the sort stable; the recurrence T(n) = 2T(n/2) + O(n) solves to O(n log n) regardless of input order.",
        "Time: O(n log n). Space: O(n) scratch buffer plus O(log n) recursion depth.",
      ],
    },
    {
      name: "Count Inversions",
      difficulty: "Medium",
      variation: "Merge sort with counting",
      link: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
      question: [
        "Given an array of integers, count the number of inversions. Two elements arr[i] and arr[j] form an inversion if arr[i] > arr[j] and i < j. Inversion count indicates how far the array is from being sorted.",
        "Example 1:\nInput: arr = [2,4,1,3,5]\nOutput: 3\nExplanation: The inversions are (2,1), (4,1) and (4,3)",
        "Constraints:\n- 1 <= arr.length <= 5 * 10^5\n- 1 <= arr[i] <= 10^18 (use 64-bit counters)",
      ],
      code: `long long inversionCount(vector<long long>& arr) {
    int n = arr.size();
    vector<long long> tmp(n);
    function<long long(int, int)> ms = [&](int lo, int hi) -> long long {  // [lo, hi)
        if (hi - lo <= 1) return 0LL;
        int mid = lo + (hi - lo) / 2;
        long long cnt = ms(lo, mid) + ms(mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid || j < hi) {
            if (j == hi || (i < mid && arr[i] <= arr[j])) {
                tmp[k++] = arr[i++];
            } else {
                cnt += mid - i;  // arr[i..mid) are all > arr[j]
                tmp[k++] = arr[j++];
            }
        }
        for (int t = lo; t < hi; t++) arr[t] = tmp[t];
        return cnt;
    };
    return ms(0, n);
}`,
      explanation: [
        "Every inversion is either inside the left half, inside the right half, or split across the middle. The split inversions are counted for free during the merge: when a right-half element is placed before the remaining left-half elements, it inverts with all mid - i of them.",
        "Because both halves are sorted at merge time, that batch count is O(1) per step instead of a pairwise scan.",
        "Time: O(n log n). Space: O(n) scratch buffer.",
      ],
    },
    {
      name: "Different Ways to Add Parentheses",
      difficulty: "Medium",
      variation: "Split on every operator",
      link: "https://leetcode.com/problems/different-ways-to-add-parentheses/",
      question: [
        "Given a string expression of numbers and operators (+, -, *), return all possible results from computing all the different possible ways to group numbers and operators. You may return the answer in any order.",
        "Example 1:\nInput: expression = \"2-1-1\"\nOutput: [0,2]\nExplanation: ((2-1)-1) = 0 and (2-(1-1)) = 2",
        "Constraints:\n- 1 <= expression.length <= 20\n- expression consists of digits and the operators '+', '-', and '*'\n- All integer values in the input expression are in the range [0, 99]",
      ],
      code: `vector<int> diffWaysToCompute(string expression) {
    vector<int> res;
    int n = expression.size();
    bool isNumber = true;
    for (int i = 0; i < n; i++) {
        char c = expression[i];
        if (c == '+' || c == '-' || c == '*') {
            isNumber = false;
            vector<int> left = diffWaysToCompute(expression.substr(0, i));
            vector<int> right = diffWaysToCompute(expression.substr(i + 1));
            for (int a : left) {
                for (int b : right) {
                    if (c == '+') res.push_back(a + b);
                    else if (c == '-') res.push_back(a - b);
                    else res.push_back(a * b);
                }
            }
        }
    }
    if (isNumber) res.push_back(stoi(expression));
    return res;
}`,
      explanation: [
        "Every full parenthesization has some operator applied last; picking each operator as that final split and recursing on both sides enumerates all groupings, combining every left result with every right result.",
        "The base case is a pure number substring. Memoizing on the substring avoids recomputation but is optional at this input size; result counts follow the Catalan numbers.",
        "Time: O(Catalan(k) * k) where k is the number of operators. Space: O(n) per recursion level.",
      ],
    },
    {
      name: "Longest Substring with At Least K Repeating Characters",
      difficulty: "Medium",
      variation: "Split on invalid characters",
      link: "https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters/",
      question: [
        "Given a string s and an integer k, return the length of the longest substring of s such that the frequency of each character in this substring is greater than or equal to k. If no such substring exists, return 0.",
        "Example 1:\nInput: s = \"aaabb\", k = 3\nOutput: 3\nExplanation: The longest substring is \"aaa\", as 'a' is repeated 3 times",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of only lowercase English letters\n- 1 <= k <= 10^5",
      ],
      code: `int longestSubstring(string s, int k) {
    function<int(int, int)> solve = [&](int l, int r) {  // [l, r)
        if (r - l < k) return 0;
        int cnt[26] = {0};
        for (int i = l; i < r; i++) cnt[s[i] - 'a']++;
        for (int i = l; i < r; i++) {
            if (cnt[s[i] - 'a'] < k) {
                int j = i + 1;
                while (j < r && cnt[s[j] - 'a'] < k) j++;
                return max(solve(l, i), solve(j, r));
            }
        }
        return r - l;  // every character in [l, r) appears >= k times
    };
    return solve(0, (int)s.size());
}`,
      explanation: [
        "Any character whose total count in the current window is below k can never belong to a valid substring, so it acts as a hard separator: the answer must lie entirely on one side of it.",
        "Splitting on the first such character (and its rare neighbors) and recursing on the pieces terminates because each level removes at least one character class; a window with no rare character is entirely valid.",
        "Time: O(26 * n) since each recursion level loses at least one distinct letter. Space: O(26) per level, at most 26 levels.",
      ],
    },
    {
      name: "Beautiful Array",
      difficulty: "Medium",
      variation: "Construct via odd/even mapping",
      link: "https://leetcode.com/problems/beautiful-array/",
      question: [
        "An array nums of length n is beautiful if it is a permutation of the integers 1..n and for every 0 <= i < j < n there is no index k with i < k < j such that 2 * nums[k] == nums[i] + nums[j]. Given n, return any beautiful array of length n.",
        "Example 1:\nInput: n = 4\nOutput: [2,1,4,3]",
        "Constraints:\n- 1 <= n <= 1000",
      ],
      code: `vector<int> beautifulArray(int n) {
    vector<int> res = {1};
    while ((int)res.size() < n) {
        vector<int> next;
        next.reserve(res.size() * 2);
        for (int x : res) {
            if (2 * x - 1 <= n) next.push_back(2 * x - 1);  // odds
        }
        for (int x : res) {
            if (2 * x <= n) next.push_back(2 * x);          // evens
        }
        res = next;
    }
    return res;
}`,
      explanation: [
        "An arithmetic triple needs nums[i] + nums[j] to be even, which forces both endpoints to share parity. Placing all odd values before all even values means any cross-parity pair can never be the endpoints of a violation.",
        "Beauty is preserved under affine maps x -> 2x - 1 and x -> 2x, so a beautiful array of half the size generates a beautiful odd block and even block; doubling from [1] builds the answer bottom-up, mirroring the top-down halving recursion.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Karatsuba Multiplication Drill",
      difficulty: "Medium",
      variation: "Three-multiplication recursion (original drill)",
      question: [
        "Implement Karatsuba's algorithm to multiply two non-negative integers x and y (each up to 10^9) using recursion, without ever multiplying two large numbers directly: only recursive calls on roughly half-length numbers plus additions, subtractions, and shifts by powers of 10 are allowed. Return the 64-bit product.",
        "Example 1:\nInput: x = 1234, y = 5678\nOutput: 7006652",
        "Constraints:\n- 0 <= x, y <= 10^9\n- Base-case multiplication is allowed only when either operand is a single digit",
      ],
      code: `long long karatsuba(long long x, long long y) {
    if (x < 10 || y < 10) return x * y;
    auto digits = [](long long v) {
        int d = 0;
        while (v > 0) { v /= 10; d++; }
        return d;
    };
    int m = max(digits(x), digits(y)) / 2;
    long long p = 1;
    for (int i = 0; i < m; i++) p *= 10;
    long long xh = x / p, xl = x % p;
    long long yh = y / p, yl = y % p;
    long long z2 = karatsuba(xh, yh);
    long long z0 = karatsuba(xl, yl);
    long long z1 = karatsuba(xh + xl, yh + yl) - z2 - z0;
    return z2 * p * p + z1 * p + z0;
}`,
      explanation: [
        "Splitting x = xh * 10^m + xl and y likewise, the schoolbook product needs four half-size multiplications; Karatsuba's identity (xh + xl)(yh + yl) - xh*yh - xl*yl = xh*yl + xl*yh recovers the middle term from just one extra multiplication, for three total.",
        "The recurrence T(n) = 3T(n/2) + O(n) solves to O(n^log2(3)) which is about O(n^1.585) in the number of digits, beating the O(n^2) schoolbook method; the same idea powers big-integer libraries.",
        "Time: O(d^1.585) for d-digit inputs. Space: O(log d) recursion depth.",
      ],
    },
    {
      name: "Closest Pair of Points Drill",
      difficulty: "Hard",
      variation: "Planar D&C with strip (original drill)",
      question: [
        "Given n points in the plane as (x, y) coordinate pairs, return the smallest Euclidean distance between any two distinct points. An O(n^2) scan is too slow for n up to 2 * 10^5; use the classic divide-and-conquer algorithm.",
        "Example 1:\nInput: points = [(0,0),(3,4),(1,1),(7,7)]\nOutput: 1.41421356\nExplanation: The closest pair is (0,0) and (1,1)",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- Coordinates fit in double precision",
      ],
      code: `double closestPair(vector<pair<double, double>> pts) {
    sort(pts.begin(), pts.end());  // by x, then y
    function<double(int, int)> solve = [&](int lo, int hi) -> double {  // [lo, hi)
        if (hi - lo <= 3) {
            double best = 1e18;
            for (int i = lo; i < hi; i++) {
                for (int j = i + 1; j < hi; j++) {
                    best = min(best, hypot(pts[i].first - pts[j].first,
                                           pts[i].second - pts[j].second));
                }
            }
            return best;
        }
        int mid = lo + (hi - lo) / 2;
        double midX = pts[mid].first;
        double d = min(solve(lo, mid), solve(mid, hi));
        vector<pair<double, double>> strip;  // (y, x) for points near the split line
        for (int i = lo; i < hi; i++) {
            if (fabs(pts[i].first - midX) < d) strip.push_back({pts[i].second, pts[i].first});
        }
        sort(strip.begin(), strip.end());
        for (int i = 0; i < (int)strip.size(); i++) {
            for (int j = i + 1; j < (int)strip.size() && strip[j].first - strip[i].first < d; j++) {
                d = min(d, hypot(strip[i].second - strip[j].second,
                                 strip[i].first - strip[j].first));
            }
        }
        return d;
    };
    return solve(0, (int)pts.size());
}`,
      explanation: [
        "Split the points by a vertical line, solve each side, then handle pairs that straddle the line: only points within d of the line matter, and within that strip a packing argument shows each point needs to be compared with O(1) neighbors when scanned in y order.",
        "This version re-sorts the strip by y at every level, giving O(n log^2 n); pre-sorting by y and merging brings it to the optimal O(n log n).",
        "Time: O(n log^2 n) as written. Space: O(n) for the strip.",
      ],
    },
    {
      name: "The Skyline Problem",
      difficulty: "Hard",
      variation: "Merge two skylines",
      link: "https://leetcode.com/problems/the-skyline-problem/",
      question: [
        "Given the locations and heights of all buildings as buildings[i] = [left_i, right_i, height_i], return the skyline formed by these buildings as a list of key points [x, y] sorted by x, where each key point is the left endpoint of a horizontal segment and the last point has y = 0. Consecutive horizontal lines of equal height must be merged.",
        "Example 1:\nInput: buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]\nOutput: [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]",
        "Constraints:\n- 1 <= buildings.length <= 10^4\n- 0 <= left_i < right_i <= 2^31 - 1\n- 1 <= height_i <= 2^31 - 1\n- buildings is sorted by left_i in non-decreasing order",
      ],
      code: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    function<vector<pair<int, int>>(int, int)> solve =
        [&](int lo, int hi) -> vector<pair<int, int>> {
        if (lo == hi) {
            return {{buildings[lo][0], buildings[lo][2]}, {buildings[lo][1], 0}};
        }
        int mid = lo + (hi - lo) / 2;
        vector<pair<int, int>> A = solve(lo, mid);
        vector<pair<int, int>> B = solve(mid + 1, hi);
        vector<pair<int, int>> res;
        size_t i = 0, j = 0;
        int h1 = 0, h2 = 0;
        while (i < A.size() && j < B.size()) {
            int x;
            if (A[i].first < B[j].first) { x = A[i].first; h1 = A[i].second; i++; }
            else if (A[i].first > B[j].first) { x = B[j].first; h2 = B[j].second; j++; }
            else { x = A[i].first; h1 = A[i].second; h2 = B[j].second; i++; j++; }
            int h = max(h1, h2);
            if (res.empty() || res.back().second != h) res.push_back({x, h});
        }
        while (i < A.size()) {
            if (res.empty() || res.back().second != A[i].second) res.push_back(A[i]);
            i++;
        }
        while (j < B.size()) {
            if (res.empty() || res.back().second != B[j].second) res.push_back(B[j]);
            j++;
        }
        return res;
    };
    vector<pair<int, int>> sky = solve(0, (int)buildings.size() - 1);
    vector<vector<int>> out;
    out.reserve(sky.size());
    for (auto& p : sky) out.push_back({p.first, p.second});
    return out;
}`,
      explanation: [
        "A single building's skyline is two key points; two skylines merge like sorted lists: track the current height of each side (h1, h2), advance the smaller x, and emit a key point whenever max(h1, h2) changes.",
        "Emitting only on height change automatically merges consecutive equal-height segments, and processing equal x values together avoids spurious spikes. The recurrence T(n) = 2T(n/2) + O(n) mirrors merge sort.",
        "Time: O(n log n). Space: O(n) for the intermediate skylines.",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Hard",
      variation: "Merge sort over indices",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i].",
        "Example 1:\nInput: nums = [5,2,6,1]\nOutput: [2,1,1,0]\nExplanation: To the right of 5 there are 2 smaller elements (2 and 1); to the right of 2 there is 1 (1); to the right of 6 there is 1 (1); to the right of 1 there are 0",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `vector<int> countSmaller(vector<int>& nums) {
    int n = nums.size();
    vector<int> idx(n), tmp(n), counts(n, 0);
    iota(idx.begin(), idx.end(), 0);
    function<void(int, int)> ms = [&](int lo, int hi) {  // [lo, hi)
        if (hi - lo <= 1) return;
        int mid = lo + (hi - lo) / 2;
        ms(lo, mid);
        ms(mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid || j < hi) {
            if (j == hi || (i < mid && nums[idx[i]] <= nums[idx[j]])) {
                counts[idx[i]] += j - mid;  // right elements already passed are smaller
                tmp[k++] = idx[i++];
            } else {
                tmp[k++] = idx[j++];
            }
        }
        for (int t = lo; t < hi; t++) idx[t] = tmp[t];
    };
    ms(0, n);
    return counts;
}`,
      explanation: [
        "Merge sort an array of indices by value; during a merge, every right-half element already moved past came originally after the left elements and is strictly smaller, so when a left element is placed, j - mid such elements are credited to its count.",
        "Sorting indices instead of values lets each credit land on the element's original position; using <= for ties ensures equal right-side values are not counted as smaller.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Reverse Pairs",
      difficulty: "Hard",
      variation: "Merge sort with two-pointer count",
      link: "https://leetcode.com/problems/reverse-pairs/",
      question: [
        "Given an integer array nums, return the number of reverse pairs. A reverse pair is a pair (i, j) where 0 <= i < j < nums.length and nums[i] > 2 * nums[j].",
        "Example 1:\nInput: nums = [1,3,2,3,1]\nOutput: 2",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `int reversePairs(vector<int>& nums) {
    int n = nums.size();
    vector<int> tmp(n);
    function<int(int, int)> ms = [&](int lo, int hi) -> int {  // [lo, hi)
        if (hi - lo <= 1) return 0;
        int mid = lo + (hi - lo) / 2;
        int cnt = ms(lo, mid) + ms(mid, hi);
        int j = mid;
        for (int i = lo; i < mid; i++) {
            while (j < hi && (long long)nums[i] > 2LL * nums[j]) j++;
            cnt += j - mid;
        }
        int a = lo, b = mid, k = lo;
        while (a < mid || b < hi) {
            if (b == hi || (a < mid && nums[a] <= nums[b])) tmp[k++] = nums[a++];
            else tmp[k++] = nums[b++];
        }
        for (int t = lo; t < hi; t++) nums[t] = tmp[t];
        return cnt;
    };
    return ms(0, n);
}`,
      explanation: [
        "Like inversion counting, but the condition nums[i] > 2 * nums[j] is different from the merge order, so counting is done in a separate two-pointer pass before merging: since both halves are sorted, the boundary j only moves forward as i advances, making the count linear per level.",
        "The multiplication uses 2LL to avoid 32-bit overflow when nums[j] is near the integer limits.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Count of Range Sum",
      difficulty: "Hard",
      variation: "Merge sort over prefix sums",
      link: "https://leetcode.com/problems/count-of-range-sum/",
      question: [
        "Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive. Range sum S(i, j) is the sum of the elements in nums between indices i and j inclusive, where i <= j.",
        "Example 1:\nInput: nums = [-2,5,-1], lower = -2, upper = 2\nOutput: 3\nExplanation: The ranges are [0,0], [2,2] and [0,2] with sums -2, -1 and 2",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1\n- -10^5 <= lower <= upper <= 10^5",
      ],
      code: `int countRangeSum(vector<int>& nums, int lower, int upper) {
    int n = nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    vector<long long> tmp(n + 1);
    function<int(int, int)> ms = [&](int lo, int hi) -> int {  // [lo, hi)
        if (hi - lo <= 1) return 0;
        int mid = lo + (hi - lo) / 2;
        int cnt = ms(lo, mid) + ms(mid, hi);
        int j1 = mid, j2 = mid;
        for (int i = lo; i < mid; i++) {
            while (j1 < hi && pre[j1] - pre[i] < lower) j1++;
            while (j2 < hi && pre[j2] - pre[i] <= upper) j2++;
            cnt += j2 - j1;
        }
        int a = lo, b = mid, k = lo;
        while (a < mid || b < hi) {
            if (b == hi || (a < mid && pre[a] <= pre[b])) tmp[k++] = pre[a++];
            else tmp[k++] = pre[b++];
        }
        for (int t = lo; t < hi; t++) pre[t] = tmp[t];
        return cnt;
    };
    return ms(0, n + 1);
}`,
      explanation: [
        "S(i, j) in [lower, upper] is equivalent to pre[j+1] - pre[i] in [lower, upper], so the problem becomes counting ordered pairs across the prefix-sum array; merge sort on the prefixes counts cross pairs where i is in the left half and j in the right half.",
        "Because both halves are sorted, the window [j1, j2) of valid right prefixes only slides forward as the left pointer advances, so counting is linear per level. 64-bit prefix sums prevent overflow.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      variation: "Binary search on partition",
      link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      question: [
        "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m + n)).",
        "Example 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000",
        "Example 2:\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.50000",
        "Constraints:\n- 0 <= m, n <= 1000\n- 1 <= m + n\n- -10^6 <= nums1[i], nums2[i] <= 10^6",
      ],
      code: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
    int m = nums1.size(), n = nums2.size();
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2;            // elements taken from nums1's left side
        int j = (m + n + 1) / 2 - i;      // elements taken from nums2's left side
        int l1 = (i == 0) ? INT_MIN : nums1[i - 1];
        int r1 = (i == m) ? INT_MAX : nums1[i];
        int l2 = (j == 0) ? INT_MIN : nums2[j - 1];
        int r2 = (j == n) ? INT_MAX : nums2[j];
        if (l1 <= r2 && l2 <= r1) {
            if ((m + n) % 2 == 1) return max(l1, l2);
            return (max(l1, l2) + min(r1, r2)) / 2.0;
        }
        if (l1 > r2) hi = i - 1;
        else lo = i + 1;
    }
    return 0.0;  // unreachable for valid input
}`,
      explanation: [
        "The median is defined by a partition that puts (m + n + 1) / 2 elements on the left with every left element at most every right element. Choosing how many come from nums1 fixes how many come from nums2, so only one cut needs to be searched.",
        "Binary search on that cut over the shorter array: if nums1's left max exceeds nums2's right min, move the cut left, otherwise right; sentinels handle empty sides. This halves the decision space each step, the pure divide-and-conquer discard argument.",
        "Time: O(log(min(m, n))). Space: O(1).",
      ],
    },
  ],
};
