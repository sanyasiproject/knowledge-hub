import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Largest Triangle Area",
      difficulty: "Easy",
      variation: "The cross-product primitive",
      link: "https://leetcode.com/problems/largest-triangle-area/",
      question: [
        "You are given an array of points on a 2D plane, points[i] = [xi, yi]. Return the area of the largest triangle that can be formed by any three of those points. Answers within 1e-5 of the true value are accepted.",
        "Example 1:\nInput: points = [[0,0],[0,1],[1,0],[0,2],[2,0]]\nOutput: 2.00000\nExplanation: The triangle (0,2), (2,0), (0,0) has legs of length 2 along both axes, so its area is 2 * 2 / 2 = 2.",
        "Example 2:\nInput: points = [[1,0],[0,0],[0,1]]\nOutput: 0.50000\nExplanation: Only one triangle exists, a right triangle with both legs of length 1.",
        "Constraints:\n- 3 <= points.length <= 50\n- -50 <= xi, yi <= 50\n- All the given points are unique",
      ],
      code: `double largestTriangleArea(vector<vector<int>>& points) {
    int n = points.size();
    double best = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                // cross product of (Pj - Pi) and (Pk - Pi) = twice the signed area
                long long twice = (long long)(points[j][0] - points[i][0]) * (points[k][1] - points[i][1])
                                - (long long)(points[j][1] - points[i][1]) * (points[k][0] - points[i][0]);
                best = max(best, llabs(twice) / 2.0);
            }
    return best;
}`,
      explanation: [
        "Every convex hull routine rests on one primitive: the cross product of two edge vectors. For points O, A, B the value (A-O) x (B-O) is twice the signed area of triangle OAB. Its magnitude measures area, its sign tells you the turn direction - positive means B lies to the left of ray O->A (counterclockwise), negative means right, zero means the three points are collinear.",
        "This problem is the primitive with the sign thrown away. With n <= 50 there are only 19600 triples, so scanning all of them is fine, and the answer is the largest absolute cross product halved.",
        "The idea worth carrying forward: the three vertices of the maximum-area triangle must all lie on the convex hull, because moving any vertex outward to the hull can only increase the area. On large inputs you would build the hull first and then run rotating calipers over hull vertices only, which is why this problem is the natural entry point to the pattern.",
        "Do the cross product in integers, not doubles, and divide by 2.0 only at the very end. Computing side lengths with sqrt and then applying Heron's formula is the tempting route and it loses precision on nearly degenerate triangles.",
        "Time: O(n^3). Space: O(1).",
      ],
    },
    {
      name: "Convex Quadrilateral",
      difficulty: "Easy",
      variation: "Convexity from consistent turn direction",
      link: "https://atcoder.jp/contests/abc266/tasks/abc266_c",
      question: [
        "You are given the four vertices of a quadrilateral in counterclockwise order: (x1,y1), (x2,y2), (x3,y3), (x4,y4). No three of them are collinear and the quadrilateral is not self-intersecting. Print 'Yes' if the quadrilateral is convex and 'No' otherwise.",
        "Example 1:\nInput:\n0 0\n1 0\n1 1\n0 1\nOutput: Yes\nExplanation: The unit square turns left at every vertex, so every interior angle is less than 180 degrees.",
        "Example 2:\nInput:\n0 0\n4 0\n1 1\n0 4\nOutput: No\nExplanation: Walking (4,0) -> (1,1) -> (0,4) turns right (cross product -8), so the interior angle at (1,1) exceeds 180 degrees and the shape is a dart, not a convex quadrilateral.",
        "Constraints:\n- -100 <= xi, yi <= 100\n- The vertices are given in counterclockwise order\n- No three vertices are collinear",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long x[4], y[4];
    for (int i = 0; i < 4; i++) cin >> x[i] >> y[i];
    bool convex = true;
    for (int i = 0; i < 4; i++) {
        int a = i, b = (i + 1) % 4, c = (i + 2) % 4;
        // sign of the turn made at vertex b when walking a -> b -> c
        long long cr = (x[b] - x[a]) * (y[c] - y[b]) - (y[b] - y[a]) * (x[c] - x[b]);
        if (cr <= 0) convex = false;
    }
    cout << (convex ? "Yes" : "No") << "\\n";
    return 0;
}`,
      explanation: [
        "A simple polygon whose vertices are listed counterclockwise is convex exactly when the walk turns the same way at every vertex, that is when the cross product at each of the four corners is positive. A single negative cross product marks a reflex vertex, which is precisely a vertex that the convex hull would discard.",
        "Because the input order is guaranteed counterclockwise, you may hard-code the expected sign as positive. If the orientation were unknown you would instead collect all four signs and require them to agree with each other, which is the next problem.",
        "The tempting wrong approach is computing angles with atan2 and comparing against pi. It works on paper but introduces floating point error for no benefit - the cross product answers the same question exactly in integers.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Convex Polygon",
      difficulty: "Medium",
      variation: "Convexity test for an n-gon",
      link: "https://leetcode.com/problems/convex-polygon/",
      question: [
        "You are given an array of points forming a polygon when joined in order, points[i] = [xi, yi]. Return true if the polygon is convex and false otherwise. The polygon has at least 3 vertices, is simple (no self-intersections), and no two consecutive vertices coincide. The vertices may be listed clockwise or counterclockwise.",
        "Example 1:\nInput: points = [[0,0],[0,5],[5,5],[5,0]]\nOutput: true\nExplanation: The square turns the same way at all four corners.",
        "Example 2:\nInput: points = [[0,0],[0,10],[10,10],[10,0],[5,5]]\nOutput: false\nExplanation: The turn at (0,10) has cross product -100 while the turn at (5,5) has cross product +50. The signs disagree, so (5,5) is a reflex notch pushed into the square.",
        "Constraints:\n- 3 <= points.length <= 10^4\n- -10^4 <= xi, yi <= 10^4\n- The polygon is simple and no two consecutive points are identical",
      ],
      code: `bool isConvex(vector<vector<int>>& points) {
    int n = points.size();
    long long prev = 0;               // sign of the last non-zero turn seen
    for (int i = 0; i < n; i++) {
        long long ax = points[(i + 1) % n][0] - points[i][0];
        long long ay = points[(i + 1) % n][1] - points[i][1];
        long long bx = points[(i + 2) % n][0] - points[(i + 1) % n][0];
        long long by = points[(i + 2) % n][1] - points[(i + 1) % n][1];
        long long cur = ax * by - ay * bx;
        if (cur == 0) continue;       // straight vertex, carries no orientation
        if (prev != 0 && ((cur > 0) != (prev > 0))) return false;
        prev = cur;
    }
    return true;
}`,
      explanation: [
        "Walk the boundary once and take the cross product of consecutive edge vectors at every vertex, wrapping with modulo so the last two turns are included. The polygon is convex if and only if all non-zero cross products share one sign, which is the same statement as 'the boundary never reverses its turn direction'.",
        "Zero cross products must be skipped rather than rejected: a vertex where three consecutive points are collinear is a flat point on a still-convex polygon, and it carries no information about orientation. Treating zero as a mismatch would wrongly reject a square with a midpoint listed on one of its edges.",
        "Since the orientation of the input is unknown, the first non-zero cross product defines the reference sign and everything after must agree with it. That is why prev starts at 0 and is only ever assigned a non-zero value.",
        "Coordinates reach 10^4, so an edge vector reaches 2 * 10^4 and a cross product reaches 8 * 10^8 - close enough to the int limit that 64-bit arithmetic is the safe habit. Note that this local test is only valid because the polygon is promised to be simple; a self-intersecting star can pass a sign-consistency check.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Convex Hull using Monotone Chain",
      difficulty: "Medium",
      variation: "Andrew's monotone chain, the template",
      question: [
        "Given a set of n points in the plane, compute their convex hull: the smallest convex polygon that contains every point. Return the hull vertices in counterclockwise order. Points that lie strictly inside the hull, and points that lie in the middle of a hull edge, must not be reported - only the actual corners.",
        "Example 1:\nInput: points = [[0,3],[1,1],[2,2],[4,4],[0,0],[1,2],[3,1],[3,3]]\nOutput: [[0,0],[3,1],[4,4],[0,3]]\nExplanation: (1,1), (1,2), (2,2) and (3,3) all fall inside the quadrilateral (0,0), (3,1), (4,4), (0,3), so only those four corners survive.",
        "Example 2:\nInput: points = [[0,0],[2,0],[4,0],[4,4],[0,4]]\nOutput: [[0,0],[4,0],[4,4],[0,4]]\nExplanation: (2,0) sits exactly on the bottom edge between (0,0) and (4,0). It is on the hull boundary but it is not a corner, so it is dropped.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^9 <= xi, yi <= 10^9\n- Points may repeat",
      ],
      code: `long long cross(const vector<int>& O, const vector<int>& A, const vector<int>& B) {
    return (long long)(A[0] - O[0]) * (B[1] - O[1]) - (long long)(A[1] - O[1]) * (B[0] - O[0]);
}

vector<vector<int>> convexHull(vector<vector<int>> pts) {
    sort(pts.begin(), pts.end());                                  // lexicographic by (x, y)
    pts.erase(unique(pts.begin(), pts.end()), pts.end());          // duplicates break the chain logic
    int n = pts.size();
    if (n < 3) return pts;
    vector<vector<int>> h(2 * n);
    int k = 0;
    for (int i = 0; i < n; i++) {                                  // lower chain, left to right
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {                  // upper chain, right to left
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    h.resize(k - 1);                                               // last point equals the first
    return h;
}`,
      explanation: [
        "Sort the points by x, breaking ties by y. Then the hull splits into two monotone chains: a lower chain from the leftmost to the rightmost point, and an upper chain back again. Each chain is built with a stack, and the invariant maintained is that the last three points on the stack always make a left turn.",
        "The pop rule is the whole algorithm. When the new point p makes the top of the stack a right turn or a straight line, that top point lies on or below the segment from its predecessor to p, so it can never be a hull corner; pop it and re-check. Each point is pushed at most twice and popped at most once per chain, which is why the scan is linear after the sort.",
        "The comparison threshold decides how collinear points are handled. Popping on cross <= 0 discards points lying in the middle of a hull edge and yields only true corners; popping on cross < 0 keeps them. Several judges demand one behaviour or the other, so know which one your code implements.",
        "The bookkeeping traps are all small and all fatal: t = k + 1 stops the upper chain from eating the lower chain's final vertex; the trailing resize removes the duplicated starting point; and duplicate input points must be uniqued away, otherwise a repeated point produces a zero-length edge whose cross product is 0 and the stack logic misbehaves.",
        "Do not reach for the sort-by-polar-angle variant (Graham scan) as your default. It needs a pivot, comparator tie-breaking on distance, and careful handling of collinear extremes; monotone chain gets the same result from a plain lexicographic sort.",
        "Time: O(n log n), dominated by the sort. Space: O(n).",
      ],
    },
    {
      name: "Convex Hull using Jarvis's Algorithm (Gift Wrapping)",
      difficulty: "Medium",
      variation: "Output-sensitive gift wrapping",
      question: [
        "Given n points in the plane, compute the convex hull without sorting, by wrapping a string around the point set: start at an extreme point and repeatedly find the next hull vertex such that every remaining point lies to the left of the current hull edge. Return the hull vertices in counterclockwise order, starting from the lexicographically smallest point.",
        "Example 1:\nInput: points = [[0,3],[1,1],[2,2],[4,4],[0,0],[1,2],[3,1],[3,3]]\nOutput: [[0,0],[3,1],[4,4],[0,3]]\nExplanation: Starting at (0,0), the edge (0,0)->(3,1) has every other point on its left, so (3,1) is the next hull vertex. Wrapping continues through (4,4) and (0,3) and closes back at (0,0).",
        "Example 2:\nInput: points = [[0,0],[1,1],[2,2]]\nOutput: [[0,0],[1,1],[2,2]]\nExplanation: All three points are collinear, so there is no polygon and the degenerate case returns the sorted point set.",
        "Constraints:\n- 1 <= n <= 5000\n- -10^4 <= xi, yi <= 10^4\n- The hull size h can be as small as 3 and as large as n",
      ],
      code: `long long cross(const vector<int>& O, const vector<int>& A, const vector<int>& B) {
    return (long long)(A[0] - O[0]) * (B[1] - O[1]) - (long long)(A[1] - O[1]) * (B[0] - O[0]);
}

long long dist2(const vector<int>& a, const vector<int>& b) {
    long long dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

vector<vector<int>> jarvisHull(vector<vector<int>> pts) {
    sort(pts.begin(), pts.end());
    pts.erase(unique(pts.begin(), pts.end()), pts.end());
    int n = pts.size();
    if (n < 3) return pts;
    vector<vector<int>> hull;
    int cur = 0;                                  // pts[0] is lexicographically smallest, so on the hull
    do {
        hull.push_back(pts[cur]);
        int nxt = (cur + 1) % n;                  // any candidate other than cur
        for (int i = 0; i < n; i++) {
            long long c = cross(pts[cur], pts[nxt], pts[i]);
            // i lies right of cur->nxt, or is collinear but farther: it is the better wrap
            if (c < 0 || (c == 0 && dist2(pts[cur], pts[i]) > dist2(pts[cur], pts[nxt]))) nxt = i;
        }
        cur = nxt;
    } while (cur != 0);
    return hull;
}`,
      explanation: [
        "Gift wrapping keeps one invariant: the current point is a hull vertex, and the next hull vertex is the unique point such that all others lie to the left of the directed edge between them. The inner loop finds it by holding a best candidate and replacing it whenever some point is found on the right - after a full pass nothing is on the right, so the candidate is correct by definition.",
        "The lexicographically smallest point is guaranteed to be on the hull (nothing is further left, and among equal x nothing is further down), which gives a safe starting vertex and makes the output order deterministic.",
        "The collinear tie-break is the subtle line. When cross is 0 the two candidates and the current vertex lie on one line; taking the farther one skips over intermediate points so they never enter the hull, and just as importantly it prevents the walk from stalling on a point that would send it back where it came from.",
        "The trade-off against monotone chain: this is O(n * h) where h is the hull size, so it is faster when the hull is tiny (h around 5 on a million random points) and degrades to O(n^2) when most points are extreme, for example points sampled on a circle. Monotone chain is O(n log n) regardless, which is why it is the default.",
        "Time: O(n * h), worst case O(n^2). Space: O(h) beyond the input.",
      ],
    },
    {
      name: "Build the Fence",
      difficulty: "Medium",
      variation: "Hull perimeter",
      link: "https://www.spoj.com/problems/BSHEEP/",
      question: [
        "A farmer has n sheep at given positions in the plane and wants to enclose all of them with the shortest possible fence. Compute the length of that fence for each test case and print it with two digits after the decimal point.",
        "The first line contains the number of test cases t. Each test case starts with n, followed by n lines each holding the coordinates of one sheep. Note the degenerate cases: with one sheep the fence has length 0, and with two sheep the fence runs out and back, so its length is twice the distance between them.",
        "Example 1:\nInput:\n3\n4\n0 0\n0 1\n1 1\n1 0\n3\n0 0\n3 0\n0 4\n2\n0 0\n0 5\nOutput:\n4.00\n12.00\n10.00\nExplanation: The unit square has perimeter 4. The right triangle has sides 3, 4 and 5, total 12. Two points give 2 * 5 = 10.",
        "Constraints:\n- 1 <= t <= 100\n- 1 <= n <= 100000\n- Coordinates are real numbers of moderate magnitude",
      ],
      code: `struct P {
    double x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
};

double cross(const P& o, const P& a, const P& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int main() {
    int t;
    if (scanf("%d", &t) != 1) return 0;
    while (t--) {
        int n;
        scanf("%d", &n);
        vector<P> p(n);
        for (auto& q : p) scanf("%lf %lf", &q.x, &q.y);
        sort(p.begin(), p.end());
        vector<P> h(2 * n);
        int k = 0;
        for (int i = 0; i < n; i++) {
            while (k >= 2 && cross(h[k - 2], h[k - 1], p[i]) <= 1e-9) k--;   // eps, coords are real
            h[k++] = p[i];
        }
        for (int i = n - 2, s = k + 1; i >= 0; i--) {
            while (k >= s && cross(h[k - 2], h[k - 1], p[i]) <= 1e-9) k--;
            h[k++] = p[i];
        }
        h.resize(max(1, k - 1));
        int m = h.size();
        double per = 0;
        if (m == 2) per = 2 * hypot(h[0].x - h[1].x, h[0].y - h[1].y);       // degenerate segment
        else if (m >= 3)
            for (int i = 0; i < m; i++)
                per += hypot(h[i].x - h[(i + 1) % m].x, h[i].y - h[(i + 1) % m].y);
        printf("%.2f\\n", per);
    }
    return 0;
}`,
      explanation: [
        "The shortest closed curve enclosing a point set is exactly the convex hull boundary, so the problem is 'build the hull, then sum the edge lengths'. Any non-convex fence can be shortened by replacing a reflex dent with the straight chord across it, which is the informal proof.",
        "Collinear hull points are dropped here (pop on cross <= eps) because they add nothing to the perimeter but do add pointless work and floating point noise. That is a case where the two flavours of the pop rule genuinely do not matter for the answer.",
        "The degenerate small cases carry the real risk. For n = 1 the hull is a single point and the perimeter is 0; for n = 2 or for a set of collinear points the hull collapses to a segment and the fence must be counted twice, once in each direction. Code that blindly loops over hull edges reports half the correct answer for the two-point case.",
        "Coordinates are real, so the strict comparison cross(...) < 0 is replaced by a small epsilon to keep points that are collinear only up to rounding from creating spurious tiny edges. Reading with scanf and printing with printf also matters: 100000 points per test case across 100 test cases makes iostream without sync_with_stdio(false) too slow.",
        "Time: O(n log n) per test case. Space: O(n).",
      ],
    },
    {
      name: "Convex Hull (CSES Geometry)",
      difficulty: "Medium",
      variation: "Hull keeping collinear boundary points",
      link: "https://cses.fi/problemset/task/2195",
      question: [
        "Given n points in the plane, construct their convex hull. Print the number of points that belong to the hull, then the points themselves in counterclockwise order. A point lying on a boundary line of the hull between two corners also belongs to the hull and must be printed.",
        "Example 1:\nInput:\n3\n2 1\n2 5\n1 3\nOutput:\n3\n1 3\n2 1\n2 5\nExplanation: Three non-collinear points form a triangle, so all of them are hull points. Listed counterclockwise starting from the leftmost point (1,3).",
        "Example 2:\nInput:\n5\n0 0\n2 0\n4 0\n4 4\n0 4\nOutput:\n5\n0 0\n2 0\n4 0\n4 4\n0 4\nExplanation: (2,0) lies on the bottom edge between (0,0) and (4,0). Because boundary points count, the hull has 5 points and not 4.",
        "Constraints:\n- 1 <= n <= 200000\n- -10^9 <= x, y <= 10^9",
      ],
      code: `struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
    bool operator==(const P& o) const { return x == o.x && y == o.y; }
};

long long cross(const P& o, const P& a, const P& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<P> p(n);
    for (auto& q : p) cin >> q.x >> q.y;
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    n = p.size();
    vector<P> h;
    bool line = true;
    for (int i = 2; i < n && line; i++)
        if (cross(p[0], p[1], p[i]) != 0) line = false;
    if (n < 3 || line) {
        h = p;                                    // degenerate: a point or a segment
    } else {
        h.assign(2 * n, P{0, 0});
        int k = 0;
        for (int i = 0; i < n; i++) {             // pop on < 0 only, so collinear points stay
            while (k >= 2 && cross(h[k - 2], h[k - 1], p[i]) < 0) k--;
            h[k++] = p[i];
        }
        for (int i = n - 2, t = k + 1; i >= 0; i--) {
            while (k >= t && cross(h[k - 2], h[k - 1], p[i]) < 0) k--;
            h[k++] = p[i];
        }
        h.resize(k - 1);
    }
    cout << h.size() << "\\n";
    for (auto& q : h) cout << q.x << " " << q.y << "\\n";
    return 0;
}`,
      explanation: [
        "This is the same monotone chain as the template with one character changed: the stack pops only on a strict right turn (cross < 0) instead of on cross <= 0. A point in the middle of a hull edge produces cross == 0, so it survives and is reported, which is what this judge asks for.",
        "Coordinates reach 10^9, so a difference reaches 2 * 10^9 and a cross product reaches 8 * 10^18. That still fits in a signed 64-bit integer (about 9.2 * 10^18), but only just - store coordinates as long long from the start rather than casting inside the cross function and hoping.",
        "Keeping collinear points introduces a failure mode that the strict version does not have: if every input point lies on one line, the two chains both walk the whole line and the merged result repeats interior points. The explicit all-collinear check up front sidesteps it, and deduplicating the input handles repeated points for the same reason.",
        "The hull is produced counterclockwise starting at the lexicographically smallest point, because the lower chain is built left to right and the upper chain returns right to left.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Erect the Fence",
      difficulty: "Hard",
      variation: "All boundary points, with degenerate inputs",
      link: "https://leetcode.com/problems/erect-the-fence/",
      question: [
        "You are given an array trees where trees[i] = [xi, yi] is the position of a tree in a garden. You must fence the whole garden using the minimum length of rope, so that all the trees are enclosed. Return the coordinates of the trees that are exactly touched by the rope. You may return the answer in any order, and duplicates in the input should appear once in the answer.",
        "Example 1:\nInput: trees = [[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]]\nOutput: [[1,1],[2,0],[4,2],[3,3],[2,4]]\nExplanation: Only (2,2) is strictly inside, so the rope touches the other five trees. Note that (3,3) lies on the straight segment from (4,2) to (2,4) and is still touched by the rope, so it must be reported.",
        "Example 2:\nInput: trees = [[1,2],[2,2],[4,2]]\nOutput: [[4,2],[2,2],[1,2]]\nExplanation: All three trees are on one horizontal line. The rope stretches from (1,2) to (4,2) and back, touching all three.",
        "Constraints:\n- 1 <= trees.length <= 3000\n- 0 <= xi, yi <= 100\n- All the given positions are distinct",
      ],
      code: `long long cross(const vector<int>& O, const vector<int>& A, const vector<int>& B) {
    return (long long)(A[0] - O[0]) * (B[1] - O[1]) - (long long)(A[1] - O[1]) * (B[0] - O[0]);
}

vector<vector<int>> outerTrees(vector<vector<int>>& trees) {
    vector<vector<int>> t = trees;
    sort(t.begin(), t.end());
    t.erase(unique(t.begin(), t.end()), t.end());
    int n = t.size();
    if (n < 3) return t;
    bool line = true;
    for (int i = 2; i < n && line; i++)
        if (cross(t[0], t[1], t[i]) != 0) line = false;
    if (line) return t;                        // every tree on one line: the rope touches them all
    vector<vector<int>> h(2 * n);
    int k = 0;
    for (int i = 0; i < n; i++) {              // strict pop keeps points lying on hull edges
        while (k >= 2 && cross(h[k - 2], h[k - 1], t[i]) < 0) k--;
        h[k++] = t[i];
    }
    for (int i = n - 2, s = k + 1; i >= 0; i--) {
        while (k >= s && cross(h[k - 2], h[k - 1], t[i]) < 0) k--;
        h[k++] = t[i];
    }
    h.resize(k - 1);
    return h;
}`,
      explanation: [
        "The rope traces the convex hull, and 'exactly touched by the rope' includes points sitting flat on a hull edge - so this is the collinear-inclusive hull, built by popping only on a strict right turn.",
        "The reason this variation is rated Hard is entirely the degenerate case. With cross < 0 as the pop rule and all points collinear, the lower chain walks the full line left to right and the upper chain walks it back right to left, and the merged array reports the interior points twice. Detecting the all-collinear case first and returning the sorted points is the clean fix; special-casing it after the fact by deduplicating the output hides the bug rather than removing it.",
        "n < 3 needs the same early exit: one or two points have no polygon at all, and every one of them is touched.",
        "A tempting alternative is to run the strict hull and then walk each hull edge re-testing all points for collinearity, adding back the ones on the boundary. That is O(n * h) extra work and it still needs the same degenerate guard, so it buys nothing.",
        "Because the problem allows any output order, the counterclockwise order that monotone chain produces needs no post-processing.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Maximum distance between two points in a plane using Rotating Calipers",
      difficulty: "Hard",
      variation: "Hull diameter via rotating calipers",
      question: [
        "Given n points in the plane, find the maximum Euclidean distance between any two of them - the diameter of the point set. To keep the arithmetic exact, return the maximum squared distance. A quadratic scan over all pairs is too slow for large n, so first restrict attention to the convex hull and then sweep antipodal pairs.",
        "Example 1:\nInput: points = [[0,0],[4,0],[4,3],[0,3],[2,1]]\nOutput: 25\nExplanation: The farthest pair is a diagonal of the 4x3 rectangle, for example (0,0) and (4,3), at squared distance 16 + 9 = 25. The interior point (2,1) cannot be part of the farthest pair.",
        "Example 2:\nInput: points = [[1,1],[2,2],[3,3]]\nOutput: 8\nExplanation: The points are collinear so the hull is the segment from (1,1) to (3,3), whose squared length is 4 + 4 = 8.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^9 <= xi, yi <= 10^9 (use 64-bit arithmetic)",
      ],
      code: `long long cross(const vector<int>& O, const vector<int>& A, const vector<int>& B) {
    return (long long)(A[0] - O[0]) * (B[1] - O[1]) - (long long)(A[1] - O[1]) * (B[0] - O[0]);
}

long long dist2(const vector<int>& a, const vector<int>& b) {
    long long dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

vector<vector<int>> convexHull(vector<vector<int>> pts) {
    sort(pts.begin(), pts.end());
    pts.erase(unique(pts.begin(), pts.end()), pts.end());
    int n = pts.size();
    if (n < 3) return pts;
    vector<vector<int>> h(2 * n);
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    h.resize(k - 1);
    return h;
}

long long maxDistSquared(vector<vector<int>>& points) {
    vector<vector<int>> h = convexHull(points);
    int m = h.size();
    if (m == 1) return 0;
    if (m == 2) return dist2(h[0], h[1]);           // collinear input, hull is a segment
    long long best = 0;
    int j = 1;
    for (int i = 0; i < m; i++) {
        int ni = (i + 1) % m;
        // advance j while it gets farther from the edge i -> ni (area = distance times base)
        while (cross(h[i], h[ni], h[(j + 1) % m]) > cross(h[i], h[ni], h[j])) j = (j + 1) % m;
        best = max(best, max(dist2(h[i], h[j]), dist2(h[ni], h[j])));
    }
    return best;
}`,
      explanation: [
        "Two facts combine here. First, the farthest pair of a point set is always a pair of hull vertices, since pushing either endpoint outward to the hull only increases the distance - so the hull reduces n candidates to m. Second, the farthest pair is an antipodal pair: there exist two parallel supporting lines, one through each point, with the whole set between them.",
        "Rotating calipers enumerates exactly those antipodal pairs. For each hull edge i -> i+1, the vertex farthest from the line through that edge is the point maximising the triangle area cross(h[i], h[i+1], h[j]) - the base is fixed, so area is proportional to distance. As the edge rotates counterclockwise around the hull, that farthest vertex also only moves counterclockwise, so j never needs to be reset. It travels around the hull once in total across all iterations, making the sweep linear.",
        "Both endpoints of the edge must be measured against j, not just h[i]. The maximum distance is realised by a vertex-vertex pair, and a pair can be missed if only one endpoint of each edge is checked.",
        "The traps: returning squared distances keeps everything in exact integers (with coordinates at 10^9 a squared distance reaches 8 * 10^18, still inside signed 64-bit, while sqrt would throw away exactness for no reason); and the hull collapsing to one or two points must be handled separately, because the calipers loop assumes a real polygon. Skipping the hull and scanning all pairs is the tempting O(n^2) route that times out at n = 10^5.",
        "Time: O(n log n) for the hull plus O(m) for the sweep. Space: O(n).",
      ],
    },
    {
      name: "Polygons",
      difficulty: "Hard",
      variation: "Convex containment via a combined hull",
      link: "https://codeforces.com/problemset/problem/166/B",
      question: [
        "You are given a strictly convex polygon A with n vertices (no three of them collinear), listed in clockwise order, and a second set of m points forming polygon B. Determine whether polygon B lies strictly inside polygon A. Print 'YES' if every point of B is strictly inside A, and 'NO' otherwise - in particular a point of B lying on the boundary of A means the answer is NO.",
        "The input gives n, then the n vertices of A, then m, then the m vertices of B.",
        "Example 1:\nInput:\n4\n0 0\n0 4\n4 4\n4 0\n3\n1 1\n2 2\n3 1\nOutput: YES\nExplanation: All three points of B are strictly inside the square, so the convex hull of the eight points is still the four corners of A.",
        "Example 2:\nInput:\n4\n0 0\n0 4\n4 4\n4 0\n2\n2 2\n4 2\nOutput: NO\nExplanation: (4,2) lies on the right edge of the square. It is inside the closed square but not strictly inside, so the answer is NO.",
        "Constraints:\n- 3 <= n <= 10^5\n- 3 <= m <= 2 * 10^4\n- -10^9 <= coordinates <= 10^9\n- Polygon A is strictly convex",
      ],
      code: `struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
    bool operator==(const P& o) const { return x == o.x && y == o.y; }
};

long long cross(const P& o, const P& a, const P& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

vector<P> hullKeepCollinear(vector<P> p) {
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    int n = p.size();
    if (n < 3) return p;
    vector<P> h(2 * n);
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(h[k - 2], h[k - 1], p[i]) < 0) k--;
        h[k++] = p[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(h[k - 2], h[k - 1], p[i]) < 0) k--;
        h[k++] = p[i];
    }
    h.resize(k - 1);
    return h;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<P> a(n);
    for (auto& q : a) cin >> q.x >> q.y;
    vector<P> sortedA = a;
    sort(sortedA.begin(), sortedA.end());
    int m;
    cin >> m;
    vector<P> all = a;
    bool ok = true;
    for (int i = 0; i < m; i++) {
        P q;
        cin >> q.x >> q.y;
        // a point of B sitting exactly on a vertex of A is on the border, not strictly inside
        if (binary_search(sortedA.begin(), sortedA.end(), q)) ok = false;
        all.push_back(q);
    }
    if (ok) {
        for (const P& v : hullKeepCollinear(all))
            if (!binary_search(sortedA.begin(), sortedA.end(), v)) { ok = false; break; }
    }
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}`,
      explanation: [
        "Reformulate containment as a hull identity: B lies strictly inside A exactly when the convex hull of the combined point set is still A itself. If a point of B were outside A it would become a hull vertex, and if it lay on an edge of A it would appear as a collinear boundary point - which is why the hull here must be the collinear-keeping variant.",
        "That B is a polygon is irrelevant. Only its vertices matter, because a convex region contains a polygon exactly when it contains all of its vertices, and B being contained in the hull of A follows from all of B's vertices being contained.",
        "The wrong-but-tempting check is comparing sizes: 'hull of A plus B has n vertices, therefore nothing was added'. It fails. Take A as the square (0,0),(0,4),(4,4),(4,0) and B as the single point (5,5): the combined hull is (0,0),(4,0),(5,5),(0,4), still four vertices, because the outside point knocked out a vertex of A as it joined. The size can stay the same while the vertex set changes, so verify that every hull vertex is a vertex of A instead.",
        "The other hole is a point of B coinciding with a vertex of A. It is on the border, so the answer must be NO, but it is deduplicated away and leaves the hull looking untouched. Testing each point of B against the sorted vertices of A closes it.",
        "Coordinates at 10^9 push cross products to 8 * 10^18, which still fits in signed 64-bit but leaves no headroom - do not add an extra factor anywhere in that expression.",
        "Time: O((n + m) log(n + m)). Space: O(n + m).",
      ],
    },
    {
      name: "Professor's task",
      difficulty: "Hard",
      variation: "Dynamic convex hull with online queries",
      link: "https://codeforces.com/problemset/problem/70/D",
      question: [
        "Process q queries online on a growing set S of points. Query '1 x y' adds the point (x,y) to S. Query '2 x y' asks whether (x,y) lies inside or on the boundary of the convex hull of S; print 'YES' or 'NO'. The first three queries are guaranteed to be additions of three non-collinear points, so the hull is always a proper polygon when a question is asked.",
        "Example 1:\nInput:\n8\n1 0 0\n1 2 0\n1 2 2\n2 1 0\n2 1 1\n2 1 2\n2 0 2\n2 2 1\nOutput:\nYES\nYES\nNO\nNO\nYES\nExplanation: The hull is the triangle (0,0), (2,0), (2,2). (1,0) is on the bottom edge and (1,1) is on the hypotenuse, so both are YES. (1,2) and (0,2) sit above the line y = x, outside the triangle. (2,1) is on the vertical edge x = 2, so YES.",
        "Constraints:\n- 1 <= q <= 10^5\n- -10^6 <= x, y <= 10^6\n- The first three queries are of type 1 and their points are not collinear",
      ],
      code: `typedef long long ll;

map<ll, ll> lo, up;    // x -> y along the lower hull, and along the upper hull

ll crs(ll ax, ll ay, ll bx, ll by, ll cx, ll cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

// s = +1 for the lower chain (its inside is above), s = -1 for the upper chain
bool covered(map<ll, ll>& h, int s, ll x, ll y) {
    auto it = h.lower_bound(x);
    if (it == h.end()) return false;                  // right of the rightmost vertex
    if (it->first == x) return s * (y - it->second) >= 0;
    if (it == h.begin()) return false;                // left of the leftmost vertex
    auto jt = prev(it);                               // the chain edge spanning x
    return s * crs(jt->first, jt->second, it->first, it->second, x, y) >= 0;
}

void add(map<ll, ll>& h, int s, ll x, ll y) {
    if (covered(h, s, x, y)) return;                  // this chain already dominates the point
    h[x] = y;
    auto it = h.find(x);
    while (true) {                                    // peel off vertices to the right
        auto b = next(it);
        if (b == h.end()) break;
        auto c = next(b);
        if (c == h.end()) break;
        if (s * crs(x, y, b->first, b->second, c->first, c->second) <= 0) h.erase(b);
        else break;
    }
    while (it != h.begin()) {                         // peel off vertices to the left
        auto b = prev(it);
        if (b == h.begin()) break;
        auto a = prev(b);
        if (s * crs(a->first, a->second, b->first, b->second, x, y) <= 0) h.erase(b);
        else break;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    while (q--) {
        int t;
        ll x, y;
        cin >> t >> x >> y;
        if (t == 1) {
            add(lo, 1, x, y);
            add(up, -1, x, y);
        } else {
            cout << (covered(lo, 1, x, y) && covered(up, -1, x, y) ? "YES" : "NO") << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The state is the hull stored as its two monotone chains, each as a map from x to y: the lower chain and the upper chain. A point is inside the hull exactly when it is on or above the lower chain and on or below the upper chain, so one containment query is two chain queries, each a single lower_bound plus one cross product.",
        "Insertion reuses the monotone chain pop rule, but locally instead of over a sorted array. If the new point is already covered by a chain, that chain does not change at all. Otherwise the point becomes a vertex, and the neighbours that are now redundant - those where the triple of consecutive vertices no longer turns the right way - are erased outward in both directions until the turn condition holds again.",
        "The amortisation is what makes this fast: each map insertion adds one vertex, and every iteration of the peeling loops permanently erases one, so the total number of erasures over the whole run is bounded by the number of insertions. Each query and each amortised step costs O(log n) for the map operations.",
        "Passing the orientation as a sign s lets one pair of routines serve both chains, which halves the code and, more importantly, halves the number of places a sign can be flipped by mistake. Getting a sign wrong on one chain produces answers that look right on symmetric test data and fail on skewed inputs.",
        "The traps: replacing an existing x must keep the more extreme y (handled because covered() returns early when the old point already dominates), and both peeling loops need at least two neighbours before they can judge a turn, hence the begin and end guards. Rebuilding the hull from scratch after each addition is the tempting fallback and is O(q^2 log q), far too slow at q = 10^5.",
        "Time: O(q log q) amortised. Space: O(q).",
      ],
    },
  ],
};
