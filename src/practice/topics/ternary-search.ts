import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Peak Index in a Mountain Array",
      difficulty: "Easy",
      variation: "Integer ternary search on an array",
      link: "https://leetcode.com/problems/peak-index-in-a-mountain-array/",
      question: [
        "An array arr is a mountain if it strictly increases to a single peak and then strictly decreases. Given a mountain array, return the index of the peak. You must solve it in O(log n) time.",
        "Example 1:\nInput: arr = [0,10,5,2]\nOutput: 1",
        "Example 2:\nInput: arr = [0,2,1,0]\nOutput: 1",
        "Constraints:\n- 3 <= arr.length <= 10^5\n- 0 <= arr[i] <= 10^6\n- arr is guaranteed to be a mountain array",
      ],
      code: `int peakIndexInMountainArray(vector<int>& arr) {
    int lo = 0, hi = arr.size() - 1;
    while (lo < hi) {
        int m1 = lo + (hi - lo) / 3;
        int m2 = hi - (hi - lo) / 3;
        if (arr[m1] < arr[m2]) lo = m1 + 1;
        else hi = m2 - 1;
    }
    return lo;
}`,
      explanation: [
        "A mountain array is strictly unimodal, so ternary search applies: probe two interior points m1 < m2. If arr[m1] < arr[m2], the peak cannot lie in [lo, m1], so discard it; otherwise the peak cannot lie in [m2, hi].",
        "Each iteration removes about a third of the interval while the invariant keeps the peak inside [lo, hi], so the loop converges to the peak index.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Maximum of a Unimodal Array",
      difficulty: "Easy",
      variation: "Integer ternary search drill",
      question: [
        "You are given an array a that strictly increases and then strictly decreases (either part may be empty). Return the maximum value in the array in O(log n) time.",
        "Example 1:\nInput: a = [1,4,9,7,3]\nOutput: 9",
        "Example 2:\nInput: a = [1,2,3,4,5]\nOutput: 5",
        "Constraints:\n- 1 <= a.length <= 10^5\n- -10^9 <= a[i] <= 10^9\n- No two adjacent elements are equal",
      ],
      code: `int unimodalMax(vector<int>& a) {
    int lo = 0, hi = a.size() - 1;
    while (hi - lo > 2) {
        int m1 = lo + (hi - lo) / 3;
        int m2 = hi - (hi - lo) / 3;
        if (a[m1] < a[m2]) lo = m1 + 1;
        else hi = m2;
    }
    int best = a[lo];
    for (int i = lo + 1; i <= hi; ++i) best = max(best, a[i]);
    return best;
}`,
      explanation: [
        "Ternary search compares two interior probes: since the array is strictly unimodal, the side with the smaller probe value cannot contain the maximum and is discarded.",
        "The loop stops when at most three candidates remain and scans them directly, which sidesteps off-by-one pitfalls when m1 and m2 collide on tiny ranges.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Valley of a Unimodal Array",
      difficulty: "Easy",
      variation: "Minimum instead of maximum",
      question: [
        "You are given an array a that strictly decreases and then strictly increases (either part may be empty). Return the index of the minimum element in O(log n) time.",
        "Example 1:\nInput: a = [9,4,1,3,8]\nOutput: 2",
        "Constraints:\n- 1 <= a.length <= 10^5\n- -10^9 <= a[i] <= 10^9\n- No two adjacent elements are equal",
      ],
      code: `int valleyIndex(vector<int>& a) {
    int lo = 0, hi = a.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > a[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      explanation: [
        "For a valley the slope test flips: if a[mid] > a[mid + 1] we are still on the descending part, so the minimum lies strictly to the right; otherwise the minimum is at mid or to its left.",
        "This is the binary-search formulation of ternary search on discrete unimodal data; comparing adjacent elements gives the local slope, which is enough because there is exactly one valley.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Minimum in a Bitonic Array",
      difficulty: "Easy",
      variation: "Bitonic minimum via two-probe ternary",
      question: [
        "A bitonic array first strictly decreases and then strictly increases. Given a bitonic array a, return the minimum value using ternary search (two interior probes per step).",
        "Example 1:\nInput: a = [8,5,2,7,9]\nOutput: 2",
        "Constraints:\n- 3 <= a.length <= 10^5\n- -10^9 <= a[i] <= 10^9\n- Exactly one valley exists",
      ],
      code: `int bitonicMin(vector<int>& a) {
    int lo = 0, hi = a.size() - 1;
    while (hi - lo > 2) {
        int m1 = lo + (hi - lo) / 3;
        int m2 = hi - (hi - lo) / 3;
        if (a[m1] > a[m2]) lo = m1 + 1;
        else hi = m2;
    }
    int best = a[lo];
    for (int i = lo + 1; i <= hi; ++i) best = min(best, a[i]);
    return best;
}`,
      explanation: [
        "For a minimum, the comparison direction reverses relative to peak finding: if a[m1] > a[m2], the valley cannot be in [lo, m1], so that part is discarded; otherwise [m2, hi] is discarded.",
        "Strict unimodality guarantees that whichever probe is larger sits on a monotone slope leading away from the valley, so discarding its outer segment is always safe.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Find Peak Element",
      difficulty: "Medium",
      variation: "Local peak with slope comparison",
      link: "https://leetcode.com/problems/find-peak-element/",
      question: [
        "A peak element is strictly greater than its neighbours. Given an array nums with nums[i] != nums[i+1], return the index of any peak, treating out-of-bounds neighbours as negative infinity. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [1,2,1,3,5,6,4]\nOutput: 5\nExplanation: Index 1 (value 2) or index 5 (value 6) are both valid peaks.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- -2^31 <= nums[i] <= 2^31 - 1\n- nums[i] != nums[i + 1] for all valid i",
      ],
      code: `int findPeakElement(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      explanation: [
        "Even though the whole array is not unimodal, the slope argument still works locally: an ascending slope at mid guarantees some peak to the right, a descending slope guarantees one at mid or to the left.",
        "This adjacent-comparison form is the discrete cousin of ternary search: with distinct neighbours, one comparison per step reveals the climbing direction, and the interval always retains at least one peak.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Minimize a Convex Quadratic",
      difficulty: "Medium",
      variation: "Real-valued ternary search drill",
      question: [
        "Given real coefficients a > 0, b and c, find the value x in [-10^6, 10^6] that minimizes f(x) = a*x^2 + b*x + c, and return f(x). Your answer must be within 1e-6 of the true minimum.",
        "Example 1:\nInput: a = 1, b = -4, c = 7\nOutput: 3.0\nExplanation: f is minimized at x = 2, where f(2) = 3.",
        "Constraints:\n- 0 < a <= 10^3\n- |b|, |c| <= 10^6",
      ],
      code: `double minimizeQuadratic(double a, double b, double c) {
    auto f = [&](double x) { return a * x * x + b * x + c; };
    double lo = -1e6, hi = 1e6;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (f(m1) < f(m2)) hi = m2;
        else lo = m1;
    }
    return f((lo + hi) / 2.0);
}`,
      explanation: [
        "A convex function is strictly unimodal, so with probes m1 < m2: if f(m1) < f(m2), the minimum lies to the left of m2, otherwise to the right of m1. A third of the interval is discarded each step.",
        "Running a fixed 200 iterations shrinks the interval by (2/3)^200, far below any practical epsilon, and avoids the floating-point pitfalls of while-based epsilon termination.",
        "Time: O(iterations). Space: O(1).",
      ],
    },
    {
      name: "Minimize Max Distance on a Line",
      difficulty: "Medium",
      variation: "Minimize a maximum of convex pieces",
      question: [
        "You are given n house positions on a number line. Choose a real coordinate x for a water well so that the maximum distance from the well to any house is minimized. Return that minimum possible maximum distance within 1e-6.",
        "Example 1:\nInput: houses = [1, 5, 11]\nOutput: 5.0\nExplanation: Place the well at x = 6; the farthest houses (1 and 11) are 5 away.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^9 <= houses[i] <= 10^9",
      ],
      code: `double minimizeMaxDistance(vector<double>& houses) {
    auto worst = [&](double x) {
        double d = 0;
        for (double h : houses) d = max(d, fabs(x - h));
        return d;
    };
    double lo = -1e9, hi = 1e9;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (worst(m1) < worst(m2)) hi = m2;
        else lo = m1;
    }
    return worst((lo + hi) / 2.0);
}`,
      explanation: [
        "Each |x - h| is convex in x, and the pointwise maximum of convex functions is convex, so worst(x) is unimodal and ternary search finds its minimizer.",
        "This is the template for many geometry problems: whenever the objective is max (or sum) of convex pieces, ternary search on the placement coordinate works even when no closed form is obvious (here the closed form is the midpoint of the extremes, which makes it easy to verify).",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
    {
      name: "Weighted Sum of Absolute Deviations",
      difficulty: "Medium",
      variation: "Piecewise-linear convex cost",
      question: [
        "Given n points p[i] on a line, each with positive weight w[i], choose a real x minimizing cost(x) = sum of w[i] * |x - p[i]|. Return the minimum cost within 1e-6.",
        "Example 1:\nInput: p = [0, 10], w = [1, 3]\nOutput: 10.0\nExplanation: The optimum is at x = 10, costing 1*10 + 3*0 = 10.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^6 <= p[i] <= 10^6\n- 1 <= w[i] <= 10^4",
      ],
      code: `double minWeightedDeviation(vector<double>& p, vector<double>& w) {
    auto cost = [&](double x) {
        double total = 0;
        for (size_t i = 0; i < p.size(); ++i) total += w[i] * fabs(x - p[i]);
        return total;
    };
    double lo = -1e6, hi = 1e6;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (cost(m1) < cost(m2)) hi = m2;
        else lo = m1;
    }
    return cost((lo + hi) / 2.0);
}`,
      explanation: [
        "The cost is a sum of convex V-shaped functions, hence convex. It can have a flat optimal segment (piecewise linear), and ternary search still converges because the strict-decrease-then-increase structure holds outside the flat bottom, and f(m1) < f(m2) never discards the whole optimum.",
        "The exact optimum is the weighted median of the points, which is a good cross-check for the numeric answer.",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
    {
      name: "Maximize a Concave Integer Function",
      difficulty: "Medium",
      variation: "Integer ternary search on a function",
      question: [
        "Given an integer n >= 2, find an integer k with 0 <= k <= n maximizing f(k) = k * (n - k), the product of the two parts when n is split into k and n - k. Return the maximum product using O(log n) evaluations of f.",
        "Example 1:\nInput: n = 10\nOutput: 25\nExplanation: k = 5 gives 5 * 5 = 25.",
        "Example 2:\nInput: n = 7\nOutput: 12\nExplanation: k = 3 or k = 4 gives 3 * 4 = 12.",
        "Constraints:\n- 2 <= n <= 10^9",
      ],
      code: `long long maxSplitProduct(long long n) {
    auto f = [&](long long k) { return k * (n - k); };
    long long lo = 0, hi = n;
    while (hi - lo > 2) {
        long long m1 = lo + (hi - lo) / 3;
        long long m2 = hi - (hi - lo) / 3;
        if (f(m1) < f(m2)) lo = m1 + 1;
        else hi = m2;
    }
    long long best = f(lo);
    for (long long k = lo + 1; k <= hi; ++k) best = max(best, f(k));
    return best;
}`,
      explanation: [
        "f(k) is a downward parabola sampled at integers, so it is unimodal over the integer domain and integer ternary search applies directly, even when there is a two-point plateau at the top (odd n).",
        "The pattern generalises to any concave black-box function of an integer parameter; finishing with a small linear scan over at most three candidates avoids boundary bugs.",
        "Time: O(log n) evaluations. Space: O(1).",
      ],
    },
    {
      name: "Closest Approach of Two Moving Points",
      difficulty: "Medium",
      variation: "Convex function of time",
      question: [
        "Two points move with constant velocities: A starts at (ax, ay) with velocity (avx, avy), B starts at (bx, by) with velocity (bvx, bvy). Over t in [0, T], return the minimum distance between them within 1e-6.",
        "Example 1:\nInput: A = (0,0) v = (1,0); B = (10,0) v = (-1,0); T = 10\nOutput: 0.0\nExplanation: They meet at t = 5.",
        "Constraints:\n- 0 <= T <= 10^6\n- All coordinates and velocities have absolute value <= 10^4",
      ],
      code: `double closestApproach(double ax, double ay, double avx, double avy,
                       double bx, double by, double bvx, double bvy, double T) {
    auto dist = [&](double t) {
        double dx = (ax + avx * t) - (bx + bvx * t);
        double dy = (ay + avy * t) - (by + bvy * t);
        return sqrt(dx * dx + dy * dy);
    };
    double lo = 0, hi = T;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (dist(m1) < dist(m2)) hi = m2;
        else lo = m1;
    }
    return dist((lo + hi) / 2.0);
}`,
      explanation: [
        "The relative position is linear in t, so squared distance is a quadratic in t with a non-negative leading coefficient, making distance convex on [0, T]. Ternary search finds its minimum without any calculus.",
        "Restricting to [0, T] is handled naturally: if the unconstrained minimum lies outside the window, the search converges to the nearer endpoint because the function is monotone inside the window.",
        "Time: O(iterations). Space: O(1).",
      ],
    },
    {
      name: "Sum of Squared Distances Minimisation",
      difficulty: "Medium",
      variation: "Smooth convex drill",
      question: [
        "Given n points p[i] on a line, choose a real x minimizing g(x) = sum of (x - p[i])^2. Return the minimizing x within 1e-6.",
        "Example 1:\nInput: p = [1, 2, 6]\nOutput: 3.0\nExplanation: The mean of the points minimizes the sum of squared distances.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^6 <= p[i] <= 10^6",
      ],
      code: `double minSquaredDistancePoint(vector<double>& p) {
    auto g = [&](double x) {
        double total = 0;
        for (double v : p) total += (x - v) * (x - v);
        return total;
    };
    double lo = -1e6, hi = 1e6;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (g(m1) < g(m2)) hi = m2;
        else lo = m1;
    }
    return (lo + hi) / 2.0;
}`,
      explanation: [
        "g is a sum of convex parabolas, hence strictly convex with a unique minimizer (the arithmetic mean), which the ternary search recovers numerically.",
        "This drill is useful for validating a ternary-search template: compare the converged x against the known closed-form answer to confirm the implementation and iteration count are adequate.",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
    {
      name: "Minimize Max Distance to Gas Station",
      difficulty: "Hard",
      variation: "Real-valued search on answer",
      link: "https://leetcode.com/problems/minimize-max-distance-to-gas-station/",
      question: [
        "You are given a sorted array stations of gas-station positions and an integer k. Add k new stations anywhere on the line to minimize the maximum distance between adjacent stations. Return the smallest possible maximum distance, within 1e-6.",
        "Example 1:\nInput: stations = [1,2,3,4,5,6,7,8,9,10], k = 9\nOutput: 0.5",
        "Constraints:\n- 10 <= stations.length <= 2000\n- 0 <= stations[i] <= 10^8\n- stations is sorted strictly increasing\n- 1 <= k <= 10^6",
      ],
      code: `double minmaxGasDist(vector<int>& stations, int k) {
    auto neededStations = [&](double d) {
        long long need = 0;
        for (size_t i = 1; i < stations.size(); ++i) {
            double gap = stations[i] - stations[i - 1];
            need += (long long)(gap / d);
        }
        return need;
    };
    double lo = 0, hi = stations.back() - stations.front();
    for (int iter = 0; iter < 100; ++iter) {
        double mid = (lo + hi) / 2.0;
        if (neededStations(mid) <= k) hi = mid;
        else lo = mid;
    }
    return hi;
}`,
      explanation: [
        "Search directly on the answer d: a gap of length g needs floor(g / d) extra stations to make every sub-gap at most d. The total needed is non-increasing in d, giving a monotonic feasibility predicate.",
        "Because d is real-valued there is no exact boundary to land on; a fixed number of bisection iterations shrinks the bracket below the required precision, the same convergence idea used in real-valued ternary search.",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
    {
      name: "Minimize the Weakness",
      difficulty: "Hard",
      variation: "Ternary search over a subtracted constant",
      question: [
        "Given an array a of n reals, choose a real x to minimize the weakness of b[i] = a[i] - x, where weakness is the maximum absolute sum over all contiguous segments of b. Return the minimum weakness within 1e-6.",
        "Example 1:\nInput: a = [1, 2, 3]\nOutput: 1.0\nExplanation: With x = 2, b = [-1, 0, 1]; the largest absolute segment sum is 1.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- |a[i]| <= 10^4",
      ],
      code: `double minimizeWeakness(vector<double>& a) {
    auto weakness = [&](double x) {
        double maxEnd = 0, maxSeg = 0, minEnd = 0, minSeg = 0;
        for (double v : a) {
            double d = v - x;
            maxEnd = max(d, maxEnd + d);
            maxSeg = max(maxSeg, maxEnd);
            minEnd = min(d, minEnd + d);
            minSeg = min(minSeg, minEnd);
        }
        return max(maxSeg, -minSeg);
    };
    double lo = -1e4, hi = 1e4;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (weakness(m1) < weakness(m2)) hi = m2;
        else lo = m1;
    }
    return weakness((lo + hi) / 2.0);
}`,
      explanation: [
        "For a fixed segment, its sum after subtracting x is linear in x, so its absolute value is convex in x; weakness is the maximum of these convex functions over all segments and is therefore convex, so ternary search over x is valid.",
        "Evaluating weakness for a given x uses Kadane's algorithm twice (maximum and minimum segment sums) in one pass, keeping each probe linear.",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
    {
      name: "Geometric Median in the Plane",
      difficulty: "Hard",
      variation: "Nested ternary search (2D)",
      question: [
        "Given n points in the plane, find the minimum possible total Euclidean distance from a chosen point (x, y) to all n points. Return the minimum total distance within 1e-4.",
        "Example 1:\nInput: points = [(0,0), (2,0), (1,2)]\nOutput: 3.2360679...\nExplanation: The optimum is near (1, 0.618); the exact optimum for a triangle is its Fermat point.",
        "Constraints:\n- 1 <= n <= 10^4\n- |x[i]|, |y[i]| <= 10^4",
      ],
      code: `double geometricMedianCost(vector<pair<double, double>>& pts) {
    auto costAt = [&](double x, double y) {
        double total = 0;
        for (auto& p : pts) {
            double dx = x - p.first, dy = y - p.second;
            total += sqrt(dx * dx + dy * dy);
        }
        return total;
    };
    auto bestForX = [&](double x) {
        double lo = -1e4, hi = 1e4;
        for (int iter = 0; iter < 100; ++iter) {
            double m1 = lo + (hi - lo) / 3.0;
            double m2 = hi - (hi - lo) / 3.0;
            if (costAt(x, m1) < costAt(x, m2)) hi = m2;
            else lo = m1;
        }
        return costAt(x, (lo + hi) / 2.0);
    };
    double lo = -1e4, hi = 1e4;
    for (int iter = 0; iter < 100; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (bestForX(m1) < bestForX(m2)) hi = m2;
        else lo = m1;
    }
    return bestForX((lo + hi) / 2.0);
}`,
      explanation: [
        "Total Euclidean distance is convex in (x, y) jointly, so h(x) = min over y of cost(x, y) is convex in x. That justifies an outer ternary search on x whose evaluation runs an inner ternary search on y.",
        "Nested ternary search is the standard CP technique for 2D convex objectives when gradient methods are overkill; iteration counts multiply, so keep the inner loop as tight as precision allows.",
        "Time: O(n * innerIters * outerIters). Space: O(1).",
      ],
    },
    {
      name: "Minimum of a Lower Envelope Maximum",
      difficulty: "Hard",
      variation: "Convex function given as max of lines",
      question: [
        "You are given n lines y = m[i] * x + c[i]. Define F(x) = max over i of (m[i] * x + c[i]), the upper envelope. Find the minimum value of F(x) over x in [-10^6, 10^6], within 1e-6.",
        "Example 1:\nInput: lines = [(-1, 0), (1, -4)]\nOutput: -2.0\nExplanation: F(x) = max(-x, x - 4) is minimized at x = 2 where F(2) = -2.",
        "Constraints:\n- 1 <= n <= 10^5\n- |m[i]|, |c[i]| <= 10^6",
      ],
      code: `double minUpperEnvelope(vector<pair<double, double>>& lines) {
    auto F = [&](double x) {
        double best = lines[0].first * x + lines[0].second;
        for (auto& ln : lines) best = max(best, ln.first * x + ln.second);
        return best;
    };
    double lo = -1e6, hi = 1e6;
    for (int iter = 0; iter < 200; ++iter) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (F(m1) < F(m2)) hi = m2;
        else lo = m1;
    }
    return F((lo + hi) / 2.0);
}`,
      explanation: [
        "The maximum of linear functions is convex, so F is unimodal (decreasing then increasing) and ternary search finds its minimum, even though F is not differentiable at line crossings.",
        "This 'minimize a max of lines' shape appears frequently in scheduling and parametric-cost problems; ternary search solves it in near-linear time without building the geometric envelope.",
        "Time: O(n * iterations). Space: O(1).",
      ],
    },
  ],
};
