import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Next Greater Element I",
      difficulty: "Easy",
      variation: "Next greater element with lookup",
      link: "https://leetcode.com/problems/next-greater-element-i/",
      question: [
        "You are given two distinct integer arrays nums1 and nums2, where nums1 is a subset of nums2. For each element nums1[i], find its position j in nums2 and determine the next greater element of nums2[j] in nums2 (the first element to its right that is strictly larger). Return an array of these answers, using -1 when no greater element exists.",
        "Example 1:\nInput: nums1 = [4,1,2], nums2 = [1,3,4,2]\nOutput: [-1,3,-1]\nExplanation: 4 has no greater element to its right, 1 is followed by 3, and 2 has nothing greater after it.",
        "Constraints:\n- 1 <= nums1.length <= nums2.length <= 1000\n- 0 <= nums1[i], nums2[i] <= 10^4\n- All integers in nums1 and nums2 are unique\n- All integers of nums1 also appear in nums2",
      ],
      code: `vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
    unordered_map<int, int> nge;
    stack<int> st;
    for (int x : nums2) {
        while (!st.empty() && x > st.top()) {
            nge[st.top()] = x;
            st.pop();
        }
        st.push(x);
    }
    vector<int> ans;
    ans.reserve(nums1.size());
    for (int x : nums1)
        ans.push_back(nge.count(x) ? nge[x] : -1);
    return ans;
}`,
      explanation: [
        "Scan nums2 once with a stack that stays strictly decreasing from bottom to top. When a new value is larger than the top, that new value is the next greater element for every smaller value popped off, and the answers are recorded in a hash map keyed by value (values are unique).",
        "Each element of nums2 is pushed and popped at most once, so the resolution work is linear, and nums1 answers become O(1) map lookups.",
        "Time: O(n1 + n2). Space: O(n2).",
      ],
    },
    {
      name: "Next Greater Element II",
      difficulty: "Medium",
      variation: "Next greater element, circular array",
      link: "https://leetcode.com/problems/next-greater-element-ii/",
      question: [
        "Given a circular integer array nums (the element after nums[n-1] is nums[0]), return the next greater number for every element. The next greater number of nums[i] is the first strictly greater number found by traversing forward, possibly wrapping around; return -1 if it does not exist.",
        "Example 1:\nInput: nums = [1,2,1]\nOutput: [2,-1,2]\nExplanation: The second 1 wraps around and finds 2.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `vector<int> nextGreaterElements(vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n, -1);
    stack<int> st;
    for (int i = 0; i < 2 * n; i++) {
        int x = nums[i % n];
        while (!st.empty() && x > nums[st.top()]) {
            ans[st.top()] = x;
            st.pop();
        }
        if (i < n) st.push(i);
    }
    return ans;
}`,
      explanation: [
        "Simulate the circular traversal by iterating the array twice while keeping a stack of indices with decreasing values. The second pass lets elements near the end see candidates at the front, but indices are only pushed during the first pass so nothing is answered twice.",
        "Any index left on the stack after both passes has no greater element anywhere in the circle, and its answer stays -1.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Daily Temperatures",
      difficulty: "Medium",
      variation: "Next greater element, distance form",
      link: "https://leetcode.com/problems/daily-temperatures/",
      question: [
        "Given an array of daily temperatures, return an array answer where answer[i] is the number of days you have to wait after day i to get a warmer temperature, or 0 if none.",
        "Example 1:\nInput: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]",
        "Constraints:\n- 1 <= temperatures.length <= 10^5\n- 30 <= temperatures[i] <= 100",
      ],
      code: `vector<int> dailyTemperatures(vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> ans(n, 0);
    stack<int> st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
            ans[st.top()] = i - st.top();
            st.pop();
        }
        st.push(i);
    }
    return ans;
}`,
      explanation: [
        "The stack keeps indices of a strictly decreasing run of temperatures; a new warmer day resolves every colder day still waiting on the stack, and the answer is the index difference rather than the value itself.",
        "Each index is pushed and popped at most once, so the total work across all while-loop iterations is linear.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Online Stock Span",
      difficulty: "Medium",
      variation: "Previous greater element, streaming",
      link: "https://leetcode.com/problems/online-stock-span/",
      question: [
        "Design a class that receives daily stock prices one at a time and returns the span of the current price: the maximum number of consecutive days ending today for which the price was less than or equal to today's price.",
        "Example 1:\nInput: prices arriving as 100, 80, 60, 70, 60, 75, 85\nOutput of next() calls: 1, 1, 1, 2, 1, 4, 6",
        "Constraints:\n- 1 <= price <= 10^5\n- At most 10^4 calls to next",
      ],
      code: `class StockSpanner {
    stack<pair<int, int>> st; // {price, span it absorbed}
public:
    int next(int price) {
        int span = 1;
        while (!st.empty() && st.top().first <= price) {
            span += st.top().second;
            st.pop();
        }
        st.push({price, span});
        return span;
    }
};`,
      explanation: [
        "The stack holds a strictly decreasing sequence of prices, each paired with the span of days it already swallowed. A new price pops every stored price that is less than or equal to it and accumulates their spans, because those days are all part of today's run.",
        "Popped entries never need to be revisited: any future price large enough to see past today would also see past everything today absorbed. Each day is pushed and popped at most once across all calls.",
        "Time: O(1) amortized per call. Space: O(n).",
      ],
    },
    {
      name: "Asteroid Collision",
      difficulty: "Medium",
      variation: "Stack simulation of collisions",
      link: "https://leetcode.com/problems/asteroid-collision/",
      question: [
        "You are given an array of integers representing asteroids in a row. The absolute value is the size and the sign is the direction (positive = right, negative = left). All asteroids move at the same speed. When two asteroids meet, the smaller explodes; if equal, both explode. Asteroids moving in the same direction never meet. Return the state after all collisions.",
        "Example 1:\nInput: asteroids = [5,10,-5]\nOutput: [5,10]\nExplanation: The 10 and -5 collide and 10 survives; 5 and 10 never meet.",
        "Constraints:\n- 2 <= asteroids.length <= 10^4\n- -1000 <= asteroids[i] <= 1000\n- asteroids[i] != 0",
      ],
      code: `vector<int> asteroidCollision(vector<int>& asteroids) {
    vector<int> st;
    for (int a : asteroids) {
        bool alive = true;
        while (alive && a < 0 && !st.empty() && st.back() > 0) {
            if (st.back() < -a) {
                st.pop_back();
            } else if (st.back() == -a) {
                st.pop_back();
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) st.push_back(a);
    }
    return st;
}`,
      explanation: [
        "Only a left-moving asteroid meeting a right-moving one on the stack top can collide, so each incoming negative asteroid fights the stack top repeatedly: it destroys smaller right-movers, annihilates on a tie, and dies against a bigger one.",
        "Every asteroid enters the stack at most once and leaves at most once, so the fights are amortized constant per asteroid.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Remove K Digits",
      difficulty: "Medium",
      variation: "Greedy monotonic increasing stack",
      link: "https://leetcode.com/problems/remove-k-digits/",
      question: [
        "Given string num representing a non-negative integer and an integer k, remove exactly k digits from num so that the resulting number is the smallest possible. Return it as a string without leading zeros; return \"0\" if the result is empty.",
        "Example 1:\nInput: num = \"1432219\", k = 3\nOutput: \"1219\"",
        "Example 2:\nInput: num = \"10200\", k = 1\nOutput: \"200\"",
        "Constraints:\n- 1 <= k <= num.length <= 10^5\n- num consists of only digits and has no leading zeros except the number 0 itself",
      ],
      code: `string removeKdigits(string num, int k) {
    string st;
    for (char c : num) {
        while (!st.empty() && k > 0 && st.back() > c) {
            st.pop_back();
            k--;
        }
        st.push_back(c);
    }
    while (k > 0 && !st.empty()) {
        st.pop_back();
        k--;
    }
    int i = 0;
    while (i < (int)st.size() && st[i] == '0') i++;
    string res = st.substr(i);
    return res.empty() ? "0" : res;
}`,
      explanation: [
        "To minimize a number of fixed length, earlier digits matter most, so whenever the current digit is smaller than the last kept digit and removals remain, deleting that larger earlier digit is always at least as good. The kept digits therefore form a non-decreasing stack.",
        "If removals are left over after the scan, the tail digits are the largest remaining, so they are dropped; finally leading zeros are stripped.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Remove Duplicate Letters",
      difficulty: "Medium",
      variation: "Lexicographic greedy stack with counts",
      link: "https://leetcode.com/problems/remove-duplicate-letters/",
      question: [
        "Given a string s, remove duplicate letters so that every letter appears exactly once and the result is the smallest in lexicographical order among all possible results.",
        "Example 1:\nInput: s = \"bcabc\"\nOutput: \"abc\"",
        "Example 2:\nInput: s = \"cbacdcbc\"\nOutput: \"acdb\"",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of lowercase English letters",
      ],
      code: `string removeDuplicateLetters(string s) {
    vector<int> last(26, 0), inStack(26, 0);
    for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;
    string st;
    for (int i = 0; i < (int)s.size(); i++) {
        char c = s[i];
        if (inStack[c - 'a']) continue;
        while (!st.empty() && st.back() > c && last[st.back() - 'a'] > i) {
            inStack[st.back() - 'a'] = 0;
            st.pop_back();
        }
        st.push_back(c);
        inStack[c - 'a'] = 1;
    }
    return st;
}`,
      explanation: [
        "Build the answer as a stack. A kept letter is popped when a smaller letter arrives and the popped letter still occurs later (last occurrence index beyond i), because it can be re-added in a better position; letters already in the stack are skipped.",
        "The guard on the last occurrence guarantees every letter still appears exactly once, and popping only larger removable letters guarantees the lexicographically smallest result.",
        "Time: O(n). Space: O(1) beyond the output (26-entry tables).",
      ],
    },
    {
      name: "132 Pattern",
      difficulty: "Medium",
      variation: "Reverse scan tracking the popped maximum",
      link: "https://leetcode.com/problems/132-pattern/",
      question: [
        "Given an array of n integers nums, return true if there exist indices i < j < k such that nums[i] < nums[k] < nums[j] (a 132 pattern).",
        "Example 1:\nInput: nums = [3,1,4,2]\nOutput: true\nExplanation: The subsequence [1,4,2] forms the pattern.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^5\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `bool find132pattern(vector<int>& nums) {
    long long third = LLONG_MIN; // best candidate for the '2'
    stack<int> st;               // candidates for the '3', decreasing
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        if ((long long)nums[i] < third) return true;
        while (!st.empty() && st.top() < nums[i]) {
            third = st.top();
            st.pop();
        }
        st.push(nums[i]);
    }
    return false;
}`,
      explanation: [
        "Scanning right to left, the stack keeps candidates for the middle peak (the '3'). When the current value beats the top, everything popped is a valid '2': it is smaller than some '3' to its left in scan order (i.e., to the right in the array); third tracks the largest such '2'.",
        "If the current element is strictly below third, it serves as the '1' and a full 132 pattern exists. Keeping the largest popped value as third makes the test as permissive as possible, so no pattern is missed.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Car Fleet",
      difficulty: "Medium",
      variation: "Monotonic arrival times",
      link: "https://leetcode.com/problems/car-fleet/",
      question: [
        "There are n cars at given positions traveling toward a target at given speeds along a one-lane road. A faster car that catches up to a slower one slows down and forms a fleet with it (same position and speed). Return the number of fleets that arrive at the target.",
        "Example 1:\nInput: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 < target <= 10^6\n- 0 <= position[i] < target, all positions distinct\n- 0 < speed[i] <= 10^6",
      ],
      code: `int carFleet(int target, vector<int>& position, vector<int>& speed) {
    int n = position.size();
    vector<pair<int, double>> cars(n);
    for (int i = 0; i < n; i++)
        cars[i] = {position[i], (double)(target - position[i]) / speed[i]};
    sort(cars.begin(), cars.end());
    int fleets = 0;
    double slowest = 0.0;
    for (int i = n - 1; i >= 0; i--) {
        if (cars[i].second > slowest) {
            fleets++;
            slowest = cars[i].second;
        }
    }
    return fleets;
}`,
      explanation: [
        "Sort cars by starting position and compute each car's solo arrival time. Walking from the car nearest the target backwards, a car whose solo time exceeds the current fleet-leader time can never catch up, so it starts a new fleet; otherwise it merges into the fleet ahead.",
        "This is a monotonic-stack idea collapsed to a single variable: only the largest arrival time seen so far (the slowest fleet ahead) matters.",
        "Time: O(n log n) for the sort. Space: O(n).",
      ],
    },
    {
      name: "Sum of Subarray Minimums",
      difficulty: "Medium",
      variation: "Contribution counting with span boundaries",
      link: "https://leetcode.com/problems/sum-of-subarray-minimums/",
      question: [
        "Given an array of integers arr, find the sum of min(b) over every contiguous subarray b of arr. Return the answer modulo 10^9 + 7.",
        "Example 1:\nInput: arr = [3,1,2,4]\nOutput: 17\nExplanation: Minimums are 3,1,2,4,1,1,2,1,1,1 and their sum is 17.",
        "Constraints:\n- 1 <= arr.length <= 3 * 10^4\n- 1 <= arr[i] <= 3 * 10^4",
      ],
      code: `int sumSubarrayMins(vector<int>& arr) {
    const long long MOD = 1000000007;
    int n = arr.size();
    vector<long long> left(n), right(n);
    stack<int> st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && arr[st.top()] > arr[i]) st.pop();
        left[i] = st.empty() ? i + 1 : i - st.top();
        st.push(i);
    }
    while (!st.empty()) st.pop();
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && arr[st.top()] >= arr[i]) st.pop();
        right[i] = st.empty() ? n - i : st.top() - i;
        st.push(i);
    }
    long long ans = 0;
    for (int i = 0; i < n; i++)
        ans = (ans + arr[i] % MOD * (left[i] * right[i] % MOD)) % MOD;
    return (int)ans;
}`,
      explanation: [
        "Instead of enumerating subarrays, count each element's contribution: arr[i] is the minimum of exactly left[i] * right[i] subarrays, where left[i] counts extensions to the previous strictly smaller element and right[i] to the next smaller-or-equal element.",
        "Using strict comparison on one side and non-strict on the other assigns every subarray with tied minimums to exactly one owner, avoiding double counting. Both boundary arrays come from linear monotonic-stack passes.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Sum of Subarray Ranges",
      difficulty: "Medium",
      variation: "Contribution counting, max minus min",
      link: "https://leetcode.com/problems/sum-of-subarray-ranges/",
      question: [
        "Given an integer array nums, the range of a subarray is the difference between its largest and smallest element. Return the sum of ranges over all contiguous subarrays of nums.",
        "Example 1:\nInput: nums = [1,2,3]\nOutput: 4\nExplanation: Ranges are 0,0,0,1,1,2 and sum to 4.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- -10^9 <= nums[i] <= 10^9\n- The answer fits in a 64-bit integer",
      ],
      code: `long long subArrayRanges(vector<int>& nums) {
    int n = nums.size();
    auto contribution = [&](bool isMax) {
        vector<long long> left(n), right(n);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() &&
                   (isMax ? nums[st.top()] < nums[i] : nums[st.top()] > nums[i]))
                st.pop();
            left[i] = st.empty() ? i + 1 : i - st.top();
            st.push(i);
        }
        while (!st.empty()) st.pop();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.empty() &&
                   (isMax ? nums[st.top()] <= nums[i] : nums[st.top()] >= nums[i]))
                st.pop();
            right[i] = st.empty() ? n - i : st.top() - i;
            st.push(i);
        }
        long long total = 0;
        for (int i = 0; i < n; i++)
            total += (long long)nums[i] * left[i] * right[i];
        return total;
    };
    return contribution(true) - contribution(false);
}`,
      explanation: [
        "Sum of ranges equals (sum of subarray maximums) minus (sum of subarray minimums). Each sum is computed by contribution counting: for every index, monotonic stacks find how far the element extends left and right while remaining the max (or min), and it contributes value * left * right.",
        "The strict/non-strict comparison split assigns ties to the leftmost occurrence exactly once for both the max and min passes.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Sliding Window Maximum",
      difficulty: "Hard",
      variation: "Monotonic deque over a fixed window",
      link: "https://leetcode.com/problems/sliding-window-maximum/",
      question: [
        "You are given an array nums and a window of size k sliding from left to right; you can only see the k numbers inside the window. Return the maximum of each window position.",
        "Example 1:\nInput: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- 1 <= k <= nums.length",
      ],
      code: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; // indices, values decreasing front to back
    vector<int> ans;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) ans.push_back(nums[dq.front()]);
    }
    return ans;
}`,
      explanation: [
        "The deque stores indices whose values decrease from front to back, so the front is always the window maximum. New elements evict smaller elements from the back because those can never be a future maximum while the newer, larger element is still in the window.",
        "The front is evicted when its index slides out of the window. Every index enters and leaves the deque at most once.",
        "Time: O(n) amortized. Space: O(k).",
      ],
    },
    {
      name: "Trapping Rain Water",
      difficulty: "Hard",
      variation: "Stack of bounded basins",
      link: "https://leetcode.com/problems/trapping-rain-water/",
      question: [
        "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "Example 1:\nInput: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
        "Constraints:\n- 1 <= height.length <= 2 * 10^4\n- 0 <= height[i] <= 10^5",
      ],
      code: `int trap(vector<int>& height) {
    stack<int> st;
    int water = 0;
    for (int i = 0; i < (int)height.size(); i++) {
        while (!st.empty() && height[i] > height[st.top()]) {
            int bottom = st.top();
            st.pop();
            if (st.empty()) break;
            int width = i - st.top() - 1;
            int bounded = min(height[i], height[st.top()]) - height[bottom];
            water += width * bounded;
        }
        st.push(i);
    }
    return water;
}`,
      explanation: [
        "The stack keeps indices with non-increasing heights. When a taller bar arrives, the popped bar becomes the floor of a basin whose walls are the new bar and the bar now on top of the stack; the trapped layer is width times the bounded height above the floor.",
        "Water is accumulated layer by horizontal layer as basins close, so every unit of water is counted exactly once, and each bar is pushed and popped at most once.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Largest Rectangle in Histogram",
      difficulty: "Hard",
      variation: "Nearest smaller on both sides",
      link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
      question: [
        "Given an array of integers heights representing a histogram where each bar has width 1, return the area of the largest rectangle that fits entirely within the histogram.",
        "Example 1:\nInput: heights = [2,1,5,6,2,3]\nOutput: 10\nExplanation: The rectangle of height 5 spans the bars 5 and 6.",
        "Constraints:\n- 1 <= heights.length <= 10^5\n- 0 <= heights[i] <= 10^4",
      ],
      code: `int largestRectangleArea(vector<int>& heights) {
    int n = heights.size();
    stack<int> st;
    int best = 0;
    for (int i = 0; i <= n; i++) {
        int h = (i == n) ? 0 : heights[i];
        while (!st.empty() && heights[st.top()] >= h) {
            int height = heights[st.top()];
            st.pop();
            int left = st.empty() ? -1 : st.top();
            best = max(best, height * (i - left - 1));
        }
        st.push(i);
    }
    return best;
}`,
      explanation: [
        "For each bar, the widest rectangle using that bar's full height stretches to the nearest strictly shorter bar on each side. An increasing stack finds both boundaries in one pass: when a bar is popped, the current index i is its right boundary and the new stack top is its left boundary.",
        "A sentinel height 0 at i = n flushes the stack so every bar is evaluated. Each index is pushed and popped once.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Maximal Rectangle",
      difficulty: "Hard",
      variation: "Histogram per matrix row",
      link: "https://leetcode.com/problems/maximal-rectangle/",
      question: [
        "Given a rows x cols binary matrix filled with '0' and '1' characters, find the largest rectangle containing only 1s and return its area.",
        "Example 1:\nInput: matrix = [[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]\nOutput: 6",
        "Constraints:\n- 1 <= rows, cols <= 200\n- matrix[i][j] is '0' or '1'",
      ],
      code: `int maximalRectangle(vector<vector<char>>& matrix) {
    if (matrix.empty() || matrix[0].empty()) return 0;
    int rows = matrix.size(), cols = matrix[0].size();
    vector<int> heights(cols, 0);
    int best = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++)
            heights[c] = matrix[r][c] == '1' ? heights[c] + 1 : 0;
        stack<int> st;
        for (int i = 0; i <= cols; i++) {
            int h = (i == cols) ? 0 : heights[i];
            while (!st.empty() && heights[st.top()] >= h) {
                int height = heights[st.top()];
                st.pop();
                int left = st.empty() ? -1 : st.top();
                best = max(best, height * (i - left - 1));
            }
            st.push(i);
        }
    }
    return best;
}`,
      explanation: [
        "Treat each row as the base of a histogram where heights[c] counts consecutive 1s ending at this row in column c. Any all-ones rectangle has some bottom row, and on that row it is exactly a rectangle inside the histogram, so running the largest-rectangle-in-histogram stack per row finds the global maximum.",
        "The histogram is updated incrementally in O(cols) per row and each per-row stack pass is linear.",
        "Time: O(rows * cols). Space: O(cols).",
      ],
    },
    {
      name: "Number of Visible People in a Queue",
      difficulty: "Hard",
      variation: "Right-to-left decreasing stack, count pops",
      link: "https://leetcode.com/problems/number-of-visible-people-in-a-queue/",
      question: [
        "There are n people in a queue, all with distinct heights, given left to right in the array heights. Person i can see person j (i < j) if everyone strictly between them is shorter than both of them. Return an array where answer[i] is the number of people person i can see to their right.",
        "Example 1:\nInput: heights = [10,6,8,5,11,9]\nOutput: [3,1,2,1,1,0]",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= heights[i] <= 10^5\n- All heights are distinct",
      ],
      code: `vector<int> canSeePersonsCount(vector<int>& heights) {
    int n = heights.size();
    vector<int> ans(n, 0);
    stack<int> st; // heights, increasing from top to bottom
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && heights[i] > st.top()) {
            ans[i]++;
            st.pop();
        }
        if (!st.empty()) ans[i]++;
        st.push(heights[i]);
    }
    return ans;
}`,
      explanation: [
        "Scanning right to left with a decreasing stack: everyone person i pops is visible to them (each popped person is taller than all between, since shorter intermediates were already popped by that person), and the pops stop at the first person taller than i, who is also visible — hence the extra +1 when the stack is non-empty.",
        "People shorter than a previously seen taller person are permanently hidden from anyone further left, which is exactly why popping them is safe. Each person is pushed and popped once.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Shortest Subarray with Sum at Least K",
      difficulty: "Hard",
      variation: "Monotonic deque on prefix sums",
      link: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
      question: [
        "Given an integer array nums (which may contain negative numbers) and an integer k, return the length of the shortest non-empty subarray with a sum of at least k, or -1 if none exists.",
        "Example 1:\nInput: nums = [2,-1,2], k = 3\nOutput: 3",
        "Example 2:\nInput: nums = [84,-37,32,40,95], k = 167\nOutput: 3",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^5 <= nums[i] <= 10^5\n- 1 <= k <= 10^9",
      ],
      code: `int shortestSubarray(vector<int>& nums, int k) {
    int n = nums.size();
    vector<long long> prefix(n + 1, 0);
    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
    deque<int> dq; // indices with increasing prefix values
    int best = n + 1;
    for (int i = 0; i <= n; i++) {
        while (!dq.empty() && prefix[i] - prefix[dq.front()] >= (long long)k) {
            best = min(best, i - dq.front());
            dq.pop_front();
        }
        while (!dq.empty() && prefix[dq.back()] >= prefix[i]) dq.pop_back();
        dq.push_back(i);
    }
    return best <= n ? best : -1;
}`,
      explanation: [
        "With negatives present the plain sliding window fails, so work on prefix sums: a subarray (j, i] qualifies when prefix[i] - prefix[j] >= k. The deque keeps candidate start indices with strictly increasing prefix values.",
        "Two prunings make it linear: a front index that already satisfies the condition is popped permanently because any later i would only give a longer subarray, and a back index whose prefix is >= prefix[i] is dominated by i (later and lower) so it can never be the best start again.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
  ],
};
