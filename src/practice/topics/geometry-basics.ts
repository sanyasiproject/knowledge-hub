import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Minimum Time Visiting All Points",
      difficulty: "Easy",
      variation: "Vector difference and Chebyshev distance",
      link: "https://leetcode.com/problems/minimum-time-visiting-all-points/",
      question: [
        "You are given an array points where points[i] = [xi, yi] is an integer point on a 2D plane. You must visit the points in the exact order given. In one second you may move one unit vertically, one unit horizontally, or one unit diagonally (both coordinates change by one). Return the minimum number of seconds needed to visit every point in order.",
        "Example 1:\nInput: points = [[1,1],[3,4],[-1,0]]\nOutput: 7\nExplanation: From (1,1) to (3,4) the difference vector is (2,3): three diagonal-or-straight moves suffice, so 3 seconds. From (3,4) to (-1,0) the difference is (-4,-4): four diagonal moves, so 4 seconds. Total 7.",
        "Example 2:\nInput: points = [[3,2],[-2,2]]\nOutput: 5\nExplanation: The difference vector is (-5,0), so five horizontal moves.",
        "Constraints:\n- points.length == n, 1 <= n <= 100\n- points[i].length == 2\n- -1000 <= xi, yi <= 1000",
      ],
      code: `int minTimeToVisitAllPoints(vector<vector<int>>& points) {
    int total = 0;
    for (size_t i = 1; i < points.size(); i++) {
        int dx = abs(points[i][0] - points[i - 1][0]);
        int dy = abs(points[i][1] - points[i - 1][1]);
        total += max(dx, dy);   // Chebyshev distance: diagonals pay for both axes at once
    }
    return total;
}`,
      explanation: [
        "This is the warm-up for thinking in vectors rather than in coordinates. The only quantity that matters for a hop is the difference vector d = (dx, dy) between consecutive points; the absolute positions are irrelevant because the move set is translation invariant.",
        "A diagonal move changes both components by one, so it retires one unit of |dx| and one unit of |dy| simultaneously. Take min(|dx|, |dy|) diagonals to burn the smaller component down to zero, then | |dx| - |dy| | straight moves for the remainder. That sums to max(|dx|, |dy|), the Chebyshev (L-infinity) distance.",
        "You cannot do better than max(|dx|, |dy|): each move changes each coordinate by at most one, so at least |dx| moves are needed to fix x and at least |dy| to fix y, hence at least the maximum of the two.",
        "The tempting wrong answers are |dx| + |dy| (Manhattan, which forgets that diagonals exist) and sqrt(dx*dx + dy*dy) (Euclidean, which is not a legal move here). Also note the total is a plain sum over independent hops - the order is fixed, so there is nothing to optimise globally.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Valid Boomerang",
      difficulty: "Easy",
      variation: "Cross product as a degeneracy test",
      link: "https://leetcode.com/problems/valid-boomerang/",
      question: [
        "Given an array points where points[i] = [xi, yi] holds exactly three points on a 2D plane, return true if these points form a boomerang. A boomerang is a set of three points that are all distinct and not in a straight line.",
        "Example 1:\nInput: points = [[1,1],[2,3],[3,2]]\nOutput: true\nExplanation: With A = (1,1), the vectors are AB = (1,2) and AC = (2,1). The cross product is 1*1 - 2*2 = -3, which is non-zero, so the three points are not collinear (and therefore also pairwise distinct).",
        "Example 2:\nInput: points = [[1,1],[2,2],[3,3]]\nOutput: false\nExplanation: AB = (1,1) and AC = (2,2) give a cross product of 1*2 - 1*2 = 0, so all three lie on one line.",
        "Constraints:\n- points.length == 3\n- points[i].length == 2\n- 0 <= xi, yi <= 100",
      ],
      code: `bool isBoomerang(vector<vector<int>>& p) {
    long long ax = p[1][0] - p[0][0], ay = p[1][1] - p[0][1];
    long long bx = p[2][0] - p[0][0], by = p[2][1] - p[0][1];
    return ax * by - ay * bx != 0;   // non-zero cross product => not collinear
}`,
      explanation: [
        "The orientation primitive is cross(A, B, C) = (B - A) x (C - A) = (Bx - Ax)*(Cy - Ay) - (By - Ay)*(Cx - Ax). Its sign says whether A -> B -> C turns counter-clockwise (positive), clockwise (negative), or is degenerate (zero). Every routine in this topic is a wrapper around this one expression.",
        "Geometrically the cross product is the signed area of the parallelogram spanned by AB and AC, so it vanishes exactly when the two vectors are parallel - which for vectors sharing the origin A means A, B, C lie on a common line.",
        "A single non-zero test covers both conditions the problem asks for. If two of the points coincided, one of the vectors would be the zero vector or the two vectors would be identical, and either way the cross product would be zero. So there is no need for a separate distinctness check.",
        "The wrong-but-tempting version compares slopes: (By - Ay)/(Bx - Ax) against (Cy - Ay)/(Cx - Ax). That divides by zero on a vertical line and loses precision in floating point. Cross-multiplying to remove the division is exactly the cross product - always write it that way.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Check If It Is a Straight Line",
      difficulty: "Easy",
      variation: "Collinearity of n points without division",
      link: "https://leetcode.com/problems/check-if-it-is-a-straight-line/",
      question: [
        "You are given an array coordinates where coordinates[i] = [x, y] is a point on the 2D plane. Return true if all of these points lie on the same straight line.",
        "Example 1:\nInput: coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6]]\nOutput: true\nExplanation: Anchoring at (1,2), every other point has a direction vector that is a positive multiple of (1,1), so the cross product against (1,1) is zero every time.",
        "Example 2:\nInput: coordinates = [[1,1],[2,2],[3,4],[4,5],[5,6],[7,7]]\nOutput: false\nExplanation: With the base vector (1,1) taken from (1,1) to (2,2), the point (3,4) gives the vector (2,3) and a cross product of 1*3 - 1*2 = 1, which is non-zero.",
        "Constraints:\n- 2 <= coordinates.length <= 1000\n- coordinates[i].length == 2\n- -10^4 <= x, y <= 10^4\n- coordinates contains no duplicate points",
      ],
      code: `bool checkStraightLine(vector<vector<int>>& c) {
    long long bx = c[1][0] - c[0][0], by = c[1][1] - c[0][1];   // reference direction
    for (size_t i = 2; i < c.size(); i++) {
        long long dx = c[i][0] - c[0][0], dy = c[i][1] - c[0][1];
        if (bx * dy - by * dx != 0) return false;   // c[i] leaves the line
    }
    return true;
}`,
      explanation: [
        "Fix the first point as an anchor and the vector to the second point as the reference direction. Every remaining point must produce a direction vector from the anchor that is parallel to the reference, i.e. cross product zero. Collinearity is transitive through a shared anchor, so checking each point against the same pair is enough - you do not need all triples.",
        "The reference vector is guaranteed non-zero because the input has no duplicates, and n >= 2 means indices 0 and 1 always exist. If duplicates were allowed you would first have to scan for a point different from c[0] to build a usable direction.",
        "Coordinates up to 10^4 make each difference fit in an int, but the product of two differences can reach 4*10^8, which still fits in a signed 32-bit int here. Promoting to long long anyway is the habit worth keeping: with coordinates up to 10^9 the same expression overflows silently and returns nonsense.",
        "The slope-based solution is the classic trap. Sorting by x first and comparing consecutive slopes as doubles fails on vertical lines and can also fail on values like 1/3 that are not exactly representable.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Point Location Test",
      difficulty: "Easy",
      variation: "Sign of the cross product: left, right, touch",
      link: "https://cses.fi/problemset/task/2189",
      question: [
        "There is a line that goes through the points p1 = (x1, y1) and p2 = (x2, y2). There is also a point p3 = (x3, y3). Your task is to determine whether p3 is located on the left side of the line, on the right side of the line, or touches the line, when the line is traversed from p1 towards p2. Answer t independent queries.",
        "Example 1:\nInput:\n3\n1 1 5 3 2 3\n1 1 5 3 4 1\n1 1 5 3 3 2\nOutput:\nLEFT\nRIGHT\nTOUCH\nExplanation: The direction vector is p2 - p1 = (4,2). For p3 = (2,3) the vector p3 - p1 is (1,2) and the cross product is 4*2 - 2*1 = 6 > 0, so LEFT. For (4,1) it is (3,0) giving 4*0 - 2*3 = -6 < 0, so RIGHT. For (3,2) it is (2,1) giving 4*1 - 2*2 = 0, so TOUCH.",
        "Constraints:\n- 1 <= t <= 10^5\n- -10^9 <= x1, y1, x2, y2, x3, y3 <= 10^9\n- p1 and p2 are distinct",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long x1, y1, x2, y2, x3, y3;
        cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
        // cross of (p2 - p1) with (p3 - p1); magnitude can reach ~8e18, so 64-bit is mandatory
        long long cr = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
        if (cr > 0) cout << "LEFT" << "\\n";
        else if (cr < 0) cout << "RIGHT" << "\\n";
        else cout << "TOUCH" << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the orientation primitive with nothing else attached, so it is the right place to nail down the sign convention. In a standard right-handed coordinate system (x right, y up), a positive cross product means p3 lies to the left of the directed line p1 -> p2, negative means right, zero means exactly on the line. Reversing p1 and p2 flips the sign, which is why the problem is careful to say 'traversed from p1 towards p2'.",
        "The reason a single scalar answers a 'which side' question is that the plane minus a line has exactly two connected components, and the cross product is a linear function of p3 that is zero precisely on the line. So its sign is constant on each side.",
        "Overflow is the whole difficulty of this problem. With coordinates up to 10^9 in absolute value, each difference reaches 2*10^9 and the product reaches 4*10^18; the difference of two such products can approach 8*10^18, which sits just inside the signed 64-bit range of about 9.22*10^18. Computing the differences in int and only then widening is the classic silent failure: the subtraction wraps before the promotion happens.",
        "With t up to 10^5, untied iostreams alone can dominate the runtime, hence the sync_with_stdio and tie calls. Never use endl in a loop like this - it flushes every line.",
        "Time: O(1) per query, O(t) overall. Space: O(1).",
      ],
    },
    {
      name: "Largest Triangle Area",
      difficulty: "Easy",
      variation: "Triangle area from the cross product",
      link: "https://leetcode.com/problems/largest-triangle-area/",
      question: [
        "Given an array of points on the X-Y plane, where points[i] = [xi, yi], return the area of the largest triangle that can be formed by any three of those points.",
        "Example 1:\nInput: points = [[0,0],[0,1],[1,0],[0,2],[2,0]]\nOutput: 2.00000\nExplanation: Take A = (0,0), B = (0,2), C = (2,0). Then AB = (0,2) and AC = (2,0), so cross = 0*0 - 2*2 = -4 and the area is 4 / 2 = 2. No other triple beats it.",
        "Example 2:\nInput: points = [[1,0],[0,0],[0,1]]\nOutput: 0.50000\nExplanation: The only triple is a right triangle with legs of length 1, so the area is 0.5. Via the primitive, A = (1,0), B = (0,0), C = (0,1) gives cross = (-1)*(1) - (0)*(-1) = -1 and area 0.5.",
        "Constraints:\n- 3 <= points.length <= 50\n- -50 <= xi, yi <= 50\n- All the given points are unique",
      ],
      code: `double largestTriangleArea(vector<vector<int>>& p) {
    int n = p.size();
    long long best = 0;                      // twice the area, kept exact in integers
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                long long cr = (long long)(p[j][0] - p[i][0]) * (p[k][1] - p[i][1])
                             - (long long)(p[j][1] - p[i][1]) * (p[k][0] - p[i][0]);
                best = max(best, llabs(cr));
            }
    return best / 2.0;                       // single division at the very end
}`,
      explanation: [
        "The cross product of AB and AC is the signed area of the parallelogram they span, so the triangle ABC has area |cross| / 2. This is the shoelace formula for a three-vertex polygon, and it needs no square roots, no angles, and no case analysis for degenerate or obtuse triangles - a collinear triple simply gives zero.",
        "The important engineering point is to maximise twice the area as an exact integer and divide once at the end. Dividing inside the loop introduces rounding into every comparison; keeping integers means the comparison chain is exact and only the final result is a double.",
        "n <= 50 gives about 19600 triples, so brute force over all of them is comfortably fast and there is no reason to be clever. If n were large you would instead note that the largest-area triangle has all three vertices on the convex hull and use rotating calipers.",
        "The tempting alternative is Heron's formula from the three side lengths. It needs three square roots per triple and is numerically unstable for thin triangles, where the subtraction (s - a) cancels catastrophically. The cross product has neither problem.",
        "Time: O(n^3). Space: O(1).",
      ],
    },
    {
      name: "Valid Square",
      difficulty: "Medium",
      variation: "Squared distances and dot products, no floating point",
      link: "https://leetcode.com/problems/valid-square/",
      question: [
        "Given the coordinates of four points in 2D space p1, p2, p3 and p4, return true if the four points construct a square. The coordinates of a point pi are [xi, yi], the input is not given in any particular order, and a valid square must have four sides of equal positive length and four right angles.",
        "Example 1:\nInput: p1 = [0,0], p2 = [1,1], p3 = [1,0], p4 = [0,1]\nOutput: true\nExplanation: The six pairwise squared distances are 2, 1, 1, 1, 1, 2. Sorted they are 1,1,1,1,2,2: four equal sides of squared length 1 and two equal diagonals of squared length 2 = 2*1.",
        "Example 2:\nInput: p1 = [0,0], p2 = [1,1], p3 = [1,0], p4 = [0,12]\nOutput: false\nExplanation: The multiset of squared distances is 2, 1, 144, 1, 122, 145, which has no group of four equal smallest values, so the shape is not a square.",
        "Constraints:\n- p1.length == p2.length == p3.length == p4.length == 2\n- -10^4 <= xi, yi <= 10^4",
      ],
      code: `bool validSquare(vector<int>& p1, vector<int>& p2, vector<int>& p3, vector<int>& p4) {
    vector<vector<int>> p = {p1, p2, p3, p4};
    vector<long long> d;
    for (int i = 0; i < 4; i++)
        for (int j = i + 1; j < 4; j++) {
            long long dx = p[i][0] - p[j][0], dy = p[i][1] - p[j][1];
            d.push_back(dx * dx + dy * dy);      // squared length: stays an exact integer
        }
    sort(d.begin(), d.end());
    if (d[0] == 0) return false;                 // two points coincide
    // four equal sides, two equal diagonals, diagonal^2 == 2 * side^2
    return d[0] == d[3] && d[4] == d[5] && d[5] == 2 * d[0];
}`,
      explanation: [
        "Working with squared distances keeps everything in exact integer arithmetic - the moment you take a square root you are comparing doubles and inviting an epsilon argument. Since squaring is monotone on non-negative values, every equality and ordering question about lengths can be asked about squared lengths instead.",
        "The characterisation is: among the six pairwise squared distances of four points, the four smallest are equal and positive, the two largest are equal, and the large value is twice the small one. Sorting makes this a constant number of comparisons. It is a complete test because the four equal short distances force a rhombus, and the diagonal condition d^2 = 2s^2 is exactly the Pythagorean statement that the rhombus angles are right angles.",
        "The d[0] == 0 guard matters: without it, four identical points give all six distances equal to 0 and every equality above holds vacuously, so a degenerate point would be reported as a square.",
        "The tempting wrong approach is to test some fixed labelling, for instance assuming p1-p2-p3-p4 walk the square in order. The input order is arbitrary, so any such assumption fails on a permuted input. Trying all 4! = 24 orderings works but is far more code than the distance-multiset argument. An equally valid alternative is a vector-based check: pick the diagonal by midpoint agreement, then verify the two diagonals bisect each other, are equal in length, and are perpendicular via a zero dot product.",
        "Time: O(1) - sixteen pairs at most, a fixed-size sort. Space: O(1).",
      ],
    },
    {
      name: "Convex Polygon",
      difficulty: "Medium",
      variation: "Consistent turn direction around a polygon",
      link: "https://leetcode.com/problems/convex-polygon/",
      question: [
        "You are given an array of points on the X-Y plane points where points[i] = [xi, yi]. The points form a polygon when joined in order: points[0] to points[1], points[1] to points[2], and so on, with the last point joined back to points[0]. Return true if this polygon is convex and false otherwise. You may assume the polygon formed by the given points is always a simple polygon - its line segments do not intersect each other except at consecutive vertices, and no vertex is repeated.",
        "Example 1:\nInput: points = [[0,0],[0,5],[5,5],[5,0]]\nOutput: true\nExplanation: Walking the four vertices in order, every consecutive triple turns the same way. For instance (0,0) -> (0,5) -> (5,5) has direction vectors (0,5) and (5,0) with cross product 0*0 - 5*5 = -25, a clockwise turn, and all four turns are likewise negative.",
        "Example 2:\nInput: points = [[0,0],[0,10],[10,10],[10,0],[5,5]]\nOutput: false\nExplanation: The vertex (5,5) is a dent. The triple (10,0) -> (5,5) -> (0,0) turns the opposite way from the earlier triples, so at least one cross product has the wrong sign.",
        "Constraints:\n- 3 <= points.length <= 10^4\n- points[i].length == 2\n- -10^4 <= xi, yi <= 10^4\n- The polygon is simple",
      ],
      code: `bool isConvex(vector<vector<int>>& p) {
    int n = p.size();
    int sign = 0;                                   // 0 until the first genuine turn is seen
    for (int i = 0; i < n; i++) {
        auto& a = p[i];
        auto& b = p[(i + 1) % n];
        auto& c = p[(i + 2) % n];                   // wrap so every vertex is the middle once
        long long cr = (long long)(b[0] - a[0]) * (c[1] - a[1])
                     - (long long)(b[1] - a[1]) * (c[0] - a[0]);
        int s = (cr > 0) - (cr < 0);
        if (s == 0) continue;                       // straight vertex: allowed, carries no info
        if (sign == 0) sign = s;
        else if (s != sign) return false;           // a turn the other way means a reflex vertex
    }
    return true;
}`,
      explanation: [
        "A simple polygon is convex exactly when the traversal never changes turn direction. Take every consecutive triple, wrapping around the end, and compute the orientation. If all non-zero orientations share one sign, every interior angle is at most 180 degrees and the polygon is convex; a single opposite sign is a reflex vertex, so it is not.",
        "The wrap is what makes the test complete: each of the n vertices must get its turn as the middle element, which means n triples, not n-2. Stopping early is the most common bug - a dent placed at the last vertex slips through.",
        "Zero cross products are collinear vertices lying on a straight edge. They must be skipped rather than rejected, because a convex polygon is allowed to have a vertex in the middle of a side. That is also why sign is only latched on the first non-zero value instead of being seeded from the first triple.",
        "Simplicity of the polygon is load-bearing. Consistent turn direction alone does not imply convexity for a self-intersecting closed path - a pentagram turns the same way at every vertex, yet it is not convex. The problem guarantees a simple polygon, so the check is sound; if it did not, you would also need to verify that the total turning is exactly 360 degrees.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Area Rectangle II",
      difficulty: "Medium",
      variation: "Rotated rectangles via diagonal midpoint and length",
      link: "https://leetcode.com/problems/minimum-area-rectangle-ii/",
      question: [
        "You are given an array of points in the X-Y plane points where points[i] = [xi, yi]. Return the minimum area of any rectangle formed from these points, with sides not necessarily parallel to the X and Y axes. If there is no such rectangle, return 0.",
        "Example 1:\nInput: points = [[1,2],[2,1],[1,0],[0,1]]\nOutput: 2.00000\nExplanation: The pair (1,2)-(1,0) and the pair (2,1)-(0,1) share the midpoint (1,1) and both have squared length 4, so they are the two diagonals of one rectangle. Its sides run from (1,2) to (2,1) and from (1,2) to (0,1), each of length sqrt(2), giving area 2.",
        "Example 2:\nInput: points = [[0,1],[2,1],[1,1],[1,0],[2,0]]\nOutput: 1.00000\nExplanation: The diagonals (1,1)-(2,0) and (1,0)-(2,1) share the midpoint (1.5, 0.5) and both have squared length 2. The resulting axis-aligned unit square has area 1.",
        "Example 3:\nInput: points = [[0,3],[1,2],[3,1],[1,3],[2,1]]\nOutput: 0\nExplanation: No four of these points form a rectangle, so the answer is 0.",
        "Constraints:\n- 1 <= points.length <= 50\n- points[i].length == 2\n- 0 <= xi, yi <= 4 * 10^4\n- All the given points are unique",
      ],
      code: `double minAreaFreeRect(vector<vector<int>>& points) {
    int n = points.size();
    // key = (2*centre x, 2*centre y, squared diagonal length) -> the diagonals sharing it
    map<tuple<int,int,long long>, vector<pair<int,int>>> groups;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int cx = points[i][0] + points[j][0];     // doubled centre keeps it integral
            int cy = points[i][1] + points[j][1];
            long long dx = points[i][0] - points[j][0];
            long long dy = points[i][1] - points[j][1];
            groups[{cx, cy, dx * dx + dy * dy}].push_back({i, j});
        }
    double best = 0;
    for (auto& entry : groups) {
        auto& v = entry.second;
        for (size_t a = 0; a < v.size(); a++)
            for (size_t b = a + 1; b < v.size(); b++) {
                // diagonals (P,_) and (Q,R): P is adjacent to both Q and R
                auto& P = points[v[a].first];
                auto& Q = points[v[b].first];
                auto& R = points[v[b].second];
                double s1 = hypot(P[0] - Q[0], P[1] - Q[1]);
                double s2 = hypot(P[0] - R[0], P[1] - R[1]);
                double area = s1 * s2;
                if (best == 0 || area < best) best = area;
            }
    }
    return best;
}`,
      explanation: [
        "The characterising fact is that a quadrilateral is a rectangle if and only if its diagonals bisect each other and have equal length. Equal-length bisecting diagonals give a parallelogram (bisection) whose diagonals match (equality), and that forces right angles. So instead of enumerating four points at a time, enumerate pairs and group them by the signature (midpoint, squared length): any two pairs in the same group are the two diagonals of a rectangle.",
        "Both parts of the key are stored exactly. The midpoint is kept as the doubled sum xi + xj so it stays an integer rather than a half-integer double, and the length is kept squared for the same reason. Hashing a rounded double here would merge distinct groups and produce phantom rectangles.",
        "Given two diagonals P-P' and Q-R from the same group, the four vertices in cyclic order are P, Q, P', R, so PQ and PR are the two adjacent sides and the area is |PQ| * |PR|. Picking the wrong pair - say |PQ| * |QP'| - would multiply a side by a diagonal.",
        "The obvious alternative is to fix three points and test for a right angle with a dot product, then look up the fourth in a hash set. That is O(n^3) and easy to get wrong on duplicate configurations. The diagonal-grouping version is O(n^2 log n) to build plus the cost of the pairs inside each group, and with n <= 50 both fit, but the grouping idea is the one that scales.",
        "Return 0, not infinity, when no group has two or more diagonals - the sentinel best == 0 doubles as 'nothing found yet' because a real rectangle always has strictly positive area.",
        "Time: O(n^2 log n) to build the groups, plus O(sum over groups of size^2) to scan them. Space: O(n^2).",
      ],
    },
    {
      name: "Max Points on a Line",
      difficulty: "Hard",
      variation: "Normalised direction vectors as a canonical slope",
      link: "https://leetcode.com/problems/max-points-on-a-line/",
      question: [
        "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane, return the maximum number of points that lie on the same straight line.",
        "Example 1:\nInput: points = [[1,1],[2,2],[3,3]]\nOutput: 3\nExplanation: All three points lie on the line y = x.",
        "Example 2:\nInput: points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]\nOutput: 4\nExplanation: Anchoring at (1,1), the points (3,2), (5,3) all share the reduced direction (2,1), so the line through (1,1) with that direction also passes through (3,2) and (5,3) - three points. Anchoring at (1,4) instead, the points (2,3), (3,2) and (4,1) all share the reduced direction (1,-1), giving four points on the line x + y = 5.",
        "Constraints:\n- 1 <= points.length <= 300\n- points[i].length == 2\n- -10^4 <= xi, yi <= 10^4\n- All the points are unique",
      ],
      code: `int maxPoints(vector<vector<int>>& p) {
    int n = p.size(), best = 1;
    for (int i = 0; i < n; i++) {
        map<pair<int,int>, int> cnt;
        for (int j = i + 1; j < n; j++) {
            int dx = p[j][0] - p[i][0], dy = p[j][1] - p[i][1];
            int g = (int)gcd(abs(dx), abs(dy));       // never 0: points are unique
            dx /= g;
            dy /= g;
            // canonicalise the sign so a direction and its opposite share one key
            if (dx < 0 || (dx == 0 && dy < 0)) { dx = -dx; dy = -dy; }
            best = max(best, ++cnt[{dx, dy}] + 1);    // +1 for the anchor itself
        }
    }
    return best;
}`,
      explanation: [
        "Any line with at least two points contains a pair, so it is enough to anchor at each point in turn and bucket the other points by the direction of the vector to them. Points sharing a direction from the same anchor are collinear with it, and the largest bucket plus the anchor is the best line through that anchor. Taking the maximum over anchors covers every line.",
        "The whole difficulty is making the direction a hashable exact key. Dividing dy by dx as a double breaks on vertical lines and can collide unrelated slopes through rounding. Instead reduce (dx, dy) by its gcd, then fix the sign so that a direction and its exact opposite map to the same key - here by forcing dx > 0, or dy > 0 when dx == 0. Without the sign fix, (2,1) and (-2,-1) would be counted as two different lines and a line would be split in half.",
        "Only j > i is scanned. That is not an optimisation you have to reason about carefully - a line through points with indices i < j < k is fully discovered when the anchor is its smallest index i, so nothing is missed, and it halves the work.",
        "best starts at 1 rather than 0 so a single-point input returns 1; the inner loop never executes in that case, so the initial value is the answer.",
        "The O(n^3) approach of testing every triple with an orientation check is correct but too slow past a few hundred points, and it also makes the 'how many on this line' bookkeeping awkward. Bucketing by direction is O(n^2) work with an O(log n) map factor, or O(n^2) with a hash map on the packed pair.",
        "Time: O(n^2 log n). Space: O(n).",
      ],
    },
    {
      name: "Line Segment Intersection",
      difficulty: "Hard",
      variation: "Full segment intersection including collinear and touching cases",
      link: "https://cses.fi/problemset/task/2190",
      question: [
        "There is a line segment from point p1 = (x1, y1) to point p2 = (x2, y2), and another line segment from p3 = (x3, y3) to p4 = (x4, y4). Determine whether the segments intersect, meaning they have at least one common point. Touching at an endpoint counts as intersecting, and so does overlapping along a shared stretch. Answer t independent queries by printing YES or NO.",
        "Example 1:\nInput:\n3\n1 1 5 3 1 2 4 3\n1 1 5 3 2 3 4 1\n1 1 5 3 2 2 5 3\nOutput:\nNO\nYES\nYES\nExplanation: In the first query the second segment stays strictly above the first over the whole overlap in x, so they never meet. In the second query the segments cross properly: (2,3) is left of the directed line (1,1)->(5,3) while (4,1) is right of it, and symmetrically for the other pair. In the third query the point (5,3) is an endpoint of both segments, which counts as an intersection.",
        "Constraints:\n- 1 <= t <= 10^5\n- -10^9 <= x1, y1, x2, y2, x3, y3, x4, y4 <= 10^9\n- Each segment may be degenerate (both endpoints equal)",
      ],
      code: `long long crossOf(long long ox, long long oy, long long ax, long long ay,
                  long long bx, long long by) {
    return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
}

int sgn(long long v) { return (v > 0) - (v < 0); }

// assumes r is already known to be collinear with segment p-q
bool onSegment(long long px, long long py, long long qx, long long qy,
               long long rx, long long ry) {
    return min(px, qx) <= rx && rx <= max(px, qx)
        && min(py, qy) <= ry && ry <= max(py, qy);
}

bool segmentsIntersect(long long x1, long long y1, long long x2, long long y2,
                       long long x3, long long y3, long long x4, long long y4) {
    int d1 = sgn(crossOf(x1, y1, x2, y2, x3, y3));
    int d2 = sgn(crossOf(x1, y1, x2, y2, x4, y4));
    int d3 = sgn(crossOf(x3, y3, x4, y4, x1, y1));
    int d4 = sgn(crossOf(x3, y3, x4, y4, x2, y2));
    // proper crossing: each segment strictly straddles the other's line
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    // degenerate and touching cases: some endpoint lies on the other segment
    if (d1 == 0 && onSegment(x1, y1, x2, y2, x3, y3)) return true;
    if (d2 == 0 && onSegment(x1, y1, x2, y2, x4, y4)) return true;
    if (d3 == 0 && onSegment(x3, y3, x4, y4, x1, y1)) return true;
    if (d4 == 0 && onSegment(x3, y3, x4, y4, x2, y2)) return true;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long x1, y1, x2, y2, x3, y3, x4, y4;
        cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3 >> x4 >> y4;
        cout << (segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Split the problem into the generic case and the degenerate cases. Generic: the segments cross at one interior point exactly when each segment has its two endpoints strictly on opposite sides of the other segment's line. In signs, d1 and d2 have opposite non-zero signs and so do d3 and d4. Both conditions are needed - two endpoints straddling a line only means the infinite line is crossed, not the finite segment.",
        "Any zero among d1..d4 means an endpoint is collinear with the other segment's line, which is where the interesting failures live: T-shaped touching, shared endpoints, and full or partial overlap of collinear segments. All of these are handled by one uniform rule - if an endpoint is collinear with the other segment and lies inside that segment's bounding box, it lies on the segment, so the answer is yes. Because collinearity is already established, the bounding-box test is exact and not merely necessary.",
        "The four collinear checks together also handle degenerate segments where both endpoints coincide, and the case of two collinear segments that overlap: at least one of the four endpoints must fall inside the other segment whenever collinear segments share any point.",
        "Overflow is again the real adversary. With coordinates up to 10^9, differences reach 2*10^9 and each product reaches 4*10^18, so every coordinate must be read into a 64-bit type before any subtraction. Reducing the cross products to their signs immediately, rather than carrying the magnitudes around, also keeps d1*d2 tiny and safe.",
        "The tempting wrong approach is to solve the two-line system for the intersection parameter and test whether both parameters land in [0,1]. That divides by a determinant that is zero for parallel and collinear inputs - precisely the cases that need the most care - and in floating point it misdecides exact endpoint touches. The sign-only formulation stays in exact integers throughout.",
        "Time: O(1) per query, O(t) overall. Space: O(1).",
      ],
    },
    {
      name: "Maximum Number of Visible Points",
      difficulty: "Hard",
      variation: "Angular sorting and a sliding window over a circular order",
      link: "https://leetcode.com/problems/maximum-number-of-visible-points/",
      question: [
        "You are given an array points where points[i] = [xi, yi] is a point on the plane, an integer angle, and your location location = [posx, posy]. You can rotate freely about your location but cannot move. Your field of view is an angular range of exactly angle degrees; a point is visible if the angle from your location to it lies inside your current field of view, inclusive of both boundaries. Points located at exactly your position are always visible regardless of where you look. Return the maximum number of points you can see at once.",
        "Example 1:\nInput: points = [[2,1],[2,2],[3,3]], angle = 90, location = [1,1]\nOutput: 3\nExplanation: Relative to (1,1) the points sit at 0, 45 and 45 degrees, an angular spread of 45, so a 90 degree window covers all three.",
        "Example 2:\nInput: points = [[2,1],[2,2],[3,4],[1,1]], angle = 90, location = [1,1]\nOutput: 4\nExplanation: The point (1,1) is at your own location and is always counted. The other three sit at 0, 45 and about 56.31 degrees, all inside one 90 degree window, so 3 + 1 = 4.",
        "Example 3:\nInput: points = [[1,0],[2,1]], angle = 13, location = [1,1]\nOutput: 1\nExplanation: The two points sit at -90 and 0 degrees, 90 degrees apart, so a 13 degree window can only ever contain one of them.",
        "Constraints:\n- 1 <= points.length <= 10^5\n- points[i].length == 2\n- 0 <= angle < 360\n- 0 <= posx, posy, xi, yi <= 100",
      ],
      code: `int visiblePoints(vector<vector<int>>& points, int angle, vector<int>& location) {
    const double PI = acos(-1.0);
    vector<double> ang;
    int atSelf = 0;
    for (auto& p : points) {
        int dx = p[0] - location[0], dy = p[1] - location[1];
        if (dx == 0 && dy == 0) { atSelf++; continue; }   // always visible, no angle exists
        ang.push_back(atan2((double)dy, (double)dx) * 180.0 / PI);
    }
    sort(ang.begin(), ang.end());
    int m = ang.size();
    for (int i = 0; i < m; i++) ang.push_back(ang[i] + 360.0);   // unroll the circle once
    int best = 0, l = 0;
    for (int r = 0; r < (int)ang.size(); r++) {
        while (ang[r] - ang[l] > angle + 1e-9) l++;   // epsilon: inclusive boundary
        best = max(best, r - l + 1);
    }
    return best + atSelf;
}`,
      explanation: [
        "Each point that is not at your location contributes exactly one bearing, computed with atan2(dy, dx) - the two-argument form, because it is the only one that gets the quadrant right and does not divide by zero on a vertical direction. Once every point is a number on a circle, the question becomes: which window of width angle contains the most of these numbers?",
        "The window slides over a circular domain, and the standard trick is to sort the bearings and then append every value plus 360. A window that wraps past 180 degrees in the original list becomes a contiguous window in the unrolled list, so one ordinary two-pointer scan finds the answer. Duplicating the whole array is what makes the wrap-around case need no special code.",
        "The two pointers are monotone: as r advances, the smallest valid l never moves backwards, because the window width constraint only tightens. That makes the scan linear despite the nested while loop.",
        "The field of view is inclusive at both ends, so a point exactly angle degrees away must count. Comparing against angle exactly would drop it whenever atan2 rounding pushes the difference a hair over, hence the small epsilon. This is the one place floating point is unavoidable in this problem, and getting the comparison direction wrong is the usual cause of an off-by-one failure on the boundary tests.",
        "Points sitting exactly at your location have no defined bearing and would make atan2(0,0) meaningless, so they are counted separately and added at the end rather than being fed into the window.",
        "Time: O(n log n) for the sort, O(n) for the scan. Space: O(n).",
      ],
    },
  ],
};
