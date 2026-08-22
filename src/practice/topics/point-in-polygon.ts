import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Point Location Test",
      difficulty: "Easy",
      variation: "Orientation primitive (the cross product)",
      link: "https://cses.fi/problemset/task/2189",
      question: [
        "You are given a line that goes through the points p1 and p2, and a third point p3. Your task is to decide whether p3 is located on the left side of the line, on the right side of the line, or exactly on the line, when looking along the direction from p1 to p2. Answer t independent queries, printing LEFT, RIGHT or TOUCH for each.",
        "Example 1:\nInput:\n3\n1 1 5 3 2 3\n1 1 5 3 4 1\n1 1 5 3 3 2\nOutput:\nLEFT\nRIGHT\nTOUCH\nExplanation: The cross product of (p2 - p1) with (p3 - p1) is 4*2 - 2*1 = 6 in the first query, 4*0 - 2*3 = -6 in the second, and 4*1 - 2*2 = 0 in the third.",
        "Constraints:\n- 1 <= t <= 10^5\n- All coordinates are integers with absolute value at most 10^9\n- p1 and p2 are distinct",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long x1, y1, x2, y2, x3, y3;
        cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
        // signed area of the triangle p1 p2 p3, doubled
        long long cr = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
        if (cr > 0) cout << "LEFT\\n";
        else if (cr < 0) cout << "RIGHT\\n";
        else cout << "TOUCH\\n";
    }
    return 0;
}`,
      explanation: [
        "Every containment routine in this topic is built on one number: the z-component of the cross product of the vectors p1->p2 and p1->p3. It equals twice the signed area of the triangle p1 p2 p3, so its sign says which way the triangle is wound - positive for counter-clockwise (p3 to the left), negative for clockwise (p3 to the right), zero for collinear.",
        "The point of using the sign and never the magnitude is exactness. As long as the inputs are integers the cross product is an integer, so LEFT / RIGHT / TOUCH are decided with no rounding at all. The tempting alternative - compute the line as y = m*x + c and compare - introduces a division, breaks on vertical lines, and turns the TOUCH case into a floating-point coin flip.",
        "Watch the range. Coordinate differences reach 2 * 10^9, so each product reaches 4 * 10^18 and their difference 8 * 10^18. That fits in a signed 64-bit integer but overflows a 32-bit one, so every intermediate must be long long. If coordinates could reach 10^18 you would need __int128 here.",
        "Time: O(1) per query. Space: O(1).",
      ],
    },
    {
      name: "Valid Boomerang",
      difficulty: "Easy",
      variation: "Degenerate polygon: collinearity check",
      link: "https://leetcode.com/problems/valid-boomerang/",
      question: [
        "Given an array points where points[i] = [xi, yi] holds exactly three points in the plane, return true if these points form a boomerang. A boomerang is a set of three points that are all distinct and not in a straight line.",
        "Example 1:\nInput: points = [[1,1],[2,3],[3,2]]\nOutput: true\nExplanation: The cross product is (2-1)*(2-1) - (3-1)*(3-1) = 1 - 4 = -3, which is non-zero, so the three points are not collinear.",
        "Example 2:\nInput: points = [[1,1],[2,2],[3,3]]\nOutput: false\nExplanation: The cross product is (2-1)*(3-1) - (2-1)*(3-1) = 0, so all three lie on the line y = x.",
        "Constraints:\n- points.length == 3\n- points[i].length == 2\n- 0 <= xi, yi <= 100",
      ],
      code: `bool isBoomerang(vector<vector<int>>& points) {
    long long x1 = points[0][0], y1 = points[0][1];
    long long x2 = points[1][0], y2 = points[1][1];
    long long x3 = points[2][0], y3 = points[2][1];
    // zero area covers both the collinear case and any two coincident points
    return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1) != 0;
}`,
      explanation: [
        "A triangle is degenerate exactly when its signed area is zero, so the whole problem is one orientation test. This is worth doing before any polygon work because a polygon whose vertices are collinear has no interior at all, and most containment routines silently return garbage on such input.",
        "The distinctness requirement needs no separate check: if two of the three points coincide, two of the three edge vectors are parallel (one of them is the zero vector), the cross product is zero, and the answer is already false.",
        "The wrong-but-tempting version compares slopes: (y2 - y1) / (x2 - x1) against (y3 - y1) / (x3 - x1). That divides by zero on vertical input and loses exactness on non-integer results. Cross-multiplying the two slopes is precisely the cross product, so just write the cross product.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Check whether a given point lies inside a rectangle or not",
      difficulty: "Easy",
      variation: "Area-sum containment test",
      question: [
        "You are given the four corners A, B, C, D of a rectangle, listed in order around its boundary (the rectangle need not be axis-aligned), and a query point P. Decide whether P lies inside the rectangle or on its boundary.",
        "The classic approach is the area-sum test: P is inside the rectangle if and only if the areas of the four triangles APB, BPC, CPD and DPA add up to exactly the area of the rectangle. For any P outside, at least one triangle spills over and the sum is strictly larger.",
        "Example 1:\nInput: A = (0,10), B = (10,10), C = (10,0), D = (0,0), P = (5,5)\nOutput: true\nExplanation: Each of the four triangles has area 25 and 25 * 4 = 100, which equals the area of the 10 x 10 rectangle.",
        "Example 2:\nInput: A = (0,10), B = (10,10), C = (10,0), D = (0,0), P = (15,5)\nOutput: false\nExplanation: The four triangle areas are 25, 25, 25 and 75; the sum 150 exceeds the rectangle area 100, so P is outside.",
        "Constraints:\n- All coordinates are integers with absolute value at most 10^9\n- A, B, C, D really do form a rectangle, given in boundary order",
      ],
      code: `long long twiceArea(pair<long long,long long> a, pair<long long,long long> b,
                    pair<long long,long long> c) {
    long long cr = (b.first - a.first) * (c.second - a.second)
                 - (b.second - a.second) * (c.first - a.first);
    return llabs(cr);   // twice the unsigned area, so it stays an exact integer
}

bool insideRectangle(pair<long long,long long> a, pair<long long,long long> b,
                     pair<long long,long long> c, pair<long long,long long> d,
                     pair<long long,long long> p) {
    long long rect = twiceArea(a, b, c) + twiceArea(a, c, d);   // split along diagonal AC
    long long sum = twiceArea(a, p, b) + twiceArea(b, p, c)
                  + twiceArea(c, p, d) + twiceArea(d, p, a);
    return sum == rect;
}`,
      explanation: [
        "Doubling every area keeps the arithmetic in exact integers: twice the area of a triangle is the absolute value of a cross product, always a whole number for integer input. Comparing doubled areas is the same comparison as comparing the real areas, so no precision is lost and no epsilon is needed.",
        "Why the test is sound: the four triangles tile the rectangle exactly when P is in it, and for any P outside the union of the four triangles strictly covers the rectangle plus extra area. Equality therefore characterises containment, and points on an edge or at a corner give equality too (one or two triangles simply degenerate to zero area), which is why the boundary counts as inside.",
        "The trap is using floating-point halves and then testing sum == rect. With doubles that comparison fails at random on legitimately-inside points; if you must work in floating point you have to compare with a tolerance, which then misclassifies points a hair outside. Integers sidestep the whole question.",
        "For an axis-aligned rectangle none of this is necessary - two interval tests on x and y decide it - but the area-sum test is the version that survives rotation, and it generalises to any convex polygon by fanning triangles from one vertex.",
        "Time: O(1) for a rectangle, O(n) for a convex n-gon. Space: O(1).",
      ],
    },
    {
      name: "Check whether a given point lies inside a triangle or not",
      difficulty: "Easy",
      variation: "Half-plane sign test on a triangle",
      link: "https://www.geeksforgeeks.org/check-whether-a-given-point-lies-inside-a-triangle-or-not/",
      question: [
        "Given the three vertices A, B, C of a non-degenerate triangle and a point P, determine whether P lies inside the triangle. Points on an edge or at a vertex count as inside.",
        "Example 1:\nInput: A = (0,0), B = (20,0), C = (10,30), P = (10,15)\nOutput: true\nExplanation: The cross products for the edges AB, BC and CA are 300, 150 and 150 - all the same sign, so P is on the same side of every edge.",
        "Example 2:\nInput: A = (0,0), B = (20,0), C = (10,30), P = (30,15)\nOutput: false\nExplanation: The edge AB gives 300 but the edge BC gives -450, so P is outside the half-plane cut by BC.",
        "Constraints:\n- All coordinates are integers with absolute value at most 10^9\n- A, B, C are not collinear",
      ],
      code: `bool pointInTriangle(vector<int>& A, vector<int>& B, vector<int>& C, vector<int>& P) {
    auto cross = [](const vector<int>& o, const vector<int>& a, const vector<int>& b) {
        return (long long)(a[0] - o[0]) * (b[1] - o[1])
             - (long long)(a[1] - o[1]) * (b[0] - o[0]);
    };
    long long d1 = cross(A, B, P), d2 = cross(B, C, P), d3 = cross(C, A, P);
    bool hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    bool hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    // mixed signs mean P is outside; zeros are boundary and never force a decision
    return !(hasNeg && hasPos);
}`,
      explanation: [
        "A triangle is the intersection of three half-planes, one per edge. Walking the boundary in a fixed rotational direction, the interior is always on the same side of every edge, so P is inside exactly when the three cross products A->B x A->P, B->C x B->P and C->A x C->P never disagree in sign.",
        "Testing for a mix of strict signs rather than for all-positive is what makes the routine orientation-agnostic: it works whether A, B, C were handed to you clockwise or counter-clockwise, and it treats a zero as neutral so edge and vertex points are accepted. To exclude the boundary instead, demand that all three values are strictly positive or all three strictly negative.",
        "The usual alternative is barycentric coordinates, which is the same computation divided by the total area; the division buys nothing here and costs exactness. The area-sum test also works but needs four multiplications more and cannot tell you which edge was violated.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Convex Polygon",
      difficulty: "Medium",
      variation: "Convexity test (turn-direction consistency)",
      link: "https://leetcode.com/problems/convex-polygon/",
      question: [
        "You are given an array of points forming a polygon when joined in order (the last point connects back to the first). Return true if this polygon is convex, and false otherwise. A polygon is convex if every interior angle is at most 180 degrees.",
        "Example 1:\nInput: points = [[0,0],[0,5],[5,5],[5,0]]\nOutput: true\nExplanation: All four turns are in the same rotational direction.",
        "Example 2:\nInput: points = [[0,0],[0,10],[10,10],[10,0],[5,5]]\nOutput: false\nExplanation: The vertex (5,5) is a reflex corner - the turn there is opposite in sign to the others, so the polygon is concave.",
        "Constraints:\n- 3 <= points.length <= 10^4\n- All coordinates are integers with absolute value at most 10^4\n- The polygon is simple: its edges do not intersect each other except at shared endpoints",
      ],
      code: `bool isConvex(vector<vector<int>>& points) {
    int n = points.size();
    long long prev = 0;
    for (int i = 0; i < n; i++) {
        long long dx1 = points[(i + 1) % n][0] - points[i][0];
        long long dy1 = points[(i + 1) % n][1] - points[i][1];
        long long dx2 = points[(i + 2) % n][0] - points[(i + 1) % n][0];
        long long dy2 = points[(i + 2) % n][1] - points[(i + 1) % n][1];
        long long cr = dx1 * dy2 - dy1 * dx2;
        if (cr != 0) {
            // a turn opposite to the first non-zero turn means a reflex vertex
            if (prev != 0 && (cr > 0) != (prev > 0)) return false;
            prev = cr;
        }
    }
    return true;
}`,
      explanation: [
        "Walk the boundary and cross-multiply consecutive edge vectors. The sign of each cross product is the direction of the turn at that vertex. For a simple polygon, convexity is exactly the statement that no two turns disagree in direction, so a single pass over the n vertices decides it.",
        "Zero cross products must be skipped rather than treated as a direction. Three consecutive collinear vertices produce a zero, which is a perfectly legal flat corner in a convex polygon; if you seeded prev with the very first cross product without the non-zero check, a leading collinear triple would fix prev at zero and every later comparison would be meaningless.",
        "The wrap-around matters. All n vertices must be examined, not n - 2: the corners at points[n-1] and points[0] are real corners, and skipping them is the standard way this passes the samples and fails on a polygon whose only reflex vertex sits at the seam.",
        "This test is the gate for the fast containment routine two questions down: only for a convex polygon can a point be located in O(log n), so in practice you either know convexity from the construction (a hull) or you establish it with this scan first.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "How to check if a given point lies inside or outside a polygon?",
      difficulty: "Medium",
      variation: "Ray casting (even-odd rule), arbitrary simple polygon",
      link: "https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/",
      question: [
        "Given a simple polygon as an array of n vertices listed in order along its boundary, and a query point p, determine whether p lies inside the polygon. The polygon may be convex or concave. A point on the boundary is reported as inside.",
        "Example 1:\nInput: polygon = [(0,0),(10,0),(10,10),(0,10)], p = (20,20)\nOutput: false\nExplanation: A horizontal ray shot to the right from (20,20) crosses no edge, so the crossing count is 0 - even, hence outside.",
        "Example 2:\nInput: polygon = [(0,0),(5,5),(5,0)], p = (3,3)\nOutput: true\nExplanation: (3,3) lies exactly on the edge from (0,0) to (5,5), which the on-segment check catches before any crossing is counted.",
        "Constraints:\n- 3 <= n <= 10^5\n- All coordinates are integers with absolute value at most 10^9\n- The polygon is simple (no self-intersections)",
      ],
      code: `struct Point { long long x, y; };

long long cross(Point o, Point a, Point b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

bool onSegment(Point a, Point b, Point p) {
    if (cross(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool isInside(vector<Point>& poly, Point p) {
    int n = poly.size();
    bool inside = false;
    for (int i = 0, j = n - 1; i < n; j = i++) {
        Point a = poly[j], b = poly[i];
        if (onSegment(a, b, p)) return true;      // boundary, decided immediately
        // half-open in y: exactly one endpoint may sit at or below p.y
        if ((a.y > p.y) != (b.y > p.y)) {
            long long cr = cross(a, b, p);
            // p strictly left of an upward edge, or strictly right of a downward one
            if ((cr > 0) == (b.y > a.y)) inside = !inside;
        }
    }
    return inside;
}`,
      explanation: [
        "Shoot a ray from p in a fixed direction - conventionally straight to the right - and count how many edges it crosses. Each crossing moves you between the inside and the outside, so an odd count means inside. The state carried through the loop is just that single parity bit.",
        "Everything hard about this algorithm is the degenerate cases, and both are handled without a single special case. First, the y-straddle test (a.y > p.y) != (b.y > p.y) is deliberately half-open: an edge counts only if one endpoint is strictly above p.y and the other is at or below it. A vertex exactly at the ray's height therefore belongs to exactly one of its two edges, so passing through a vertex is counted once rather than zero or two times, and horizontal edges - both endpoints at the same height - are never counted at all.",
        "Second, the crossing is located with a cross product rather than by computing the intersection's x-coordinate. Solving for x needs a division by (b.y - a.y) and a floating comparison; the equivalent exact statement is that p lies strictly to the left of an upward-going edge, which is what the (cr > 0) == (b.y > a.y) line says. Because the on-segment check has already returned for cr == 0 combined with a y-straddle, no zero ever reaches this comparison.",
        "The tempting broken version counts an edge whenever min(a.y, b.y) <= p.y <= max(a.y, b.y). That double-counts every vertex the ray passes through and flips the answer for whole regions of a concave polygon.",
        "Ray casting uses the even-odd rule. The winding-number rule adds +1 for each upward crossing and -1 for each downward one and calls p inside when the total is non-zero; the two agree on every simple polygon and differ only on self-intersecting ones, where winding is usually the answer you want.",
        "Time: O(n) per query. Space: O(1).",
      ],
    },
    {
      name: "Point in Polygon",
      difficulty: "Medium",
      variation: "Inside / boundary / outside for m queries",
      link: "https://cses.fi/problemset/task/2192",
      question: [
        "You are given a simple polygon with n vertices, listed in order along its boundary, and m query points. For each query point, print INSIDE if it is strictly inside the polygon, BOUNDARY if it lies on the polygon's boundary, and OUTSIDE otherwise.",
        "Example 1:\nInput:\n4 3\n0 0\n4 0\n4 4\n0 4\n2 2\n4 2\n5 5\nOutput:\nINSIDE\nBOUNDARY\nOUTSIDE\nExplanation: The polygon is the square with corners (0,0) and (4,4). The point (4,2) sits on its right edge.",
        "Example 2:\nInput:\n5 4\n0 0\n4 0\n4 4\n2 1\n0 4\n1 1\n2 3\n2 1\n3 3\nOutput:\nINSIDE\nOUTSIDE\nBOUNDARY\nOUTSIDE\nExplanation: The polygon has a notch: its top boundary runs from (4,4) down to (2,1) and back up to (0,4). So (2,3) sits in the notch, above the boundary, and (3,3) is above the edge from (4,4) to (2,1), which passes through (3,2.5).",
        "Constraints:\n- 3 <= n <= 1000\n- 1 <= m <= 1000\n- All coordinates are integers with absolute value at most 10^9\n- The polygon is simple and its vertices are given in order",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> X(n), Y(n);
    for (int i = 0; i < n; i++) cin >> X[i] >> Y[i];
    while (m--) {
        long long px, py;
        cin >> px >> py;
        bool inside = false, boundary = false;
        for (int i = 0, j = n - 1; i < n; j = i++) {
            long long ax = X[j], ay = Y[j], bx = X[i], by = Y[i];
            long long cr = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
            // collinear and inside the edge's bounding box means on the edge
            if (cr == 0 && min(ax, bx) <= px && px <= max(ax, bx)
                        && min(ay, by) <= py && py <= max(ay, by)) {
                boundary = true;
                break;
            }
            if ((ay > py) != (by > py) && (cr > 0) == (by > ay)) inside = !inside;
        }
        if (boundary) cout << "BOUNDARY\\n";
        else cout << (inside ? "INSIDE\\n" : "OUTSIDE\\n");
    }
    return 0;
}`,
      explanation: [
        "Same ray-casting parity as the previous problem, but now the boundary is a third answer rather than folded into inside, so the on-edge test has to be checked for every edge and reported separately instead of being an early exit into INSIDE.",
        "The on-edge test is two conditions: the cross product is zero, which puts the point on the infinite line, and the point lies inside the axis-aligned bounding box of the segment, which restricts it to the segment itself. The bounding-box half is essential - without it every point on the extension of any edge would be misreported as BOUNDARY.",
        "Because a collinear-and-in-box point breaks out of the loop, the parity branch only ever sees a non-zero cross product, so the crossing rule stays exact and no tie-breaking is needed there. Note that the boundary check must be done before the parity toggle for that edge, otherwise a point sitting on a slanted edge can toggle parity and leave the loop with an inconsistent state.",
        "With n and m both up to 1000 the plain O(n) scan per query is only a million cross products, so no preprocessing is required. If m were 10^5 with the same n you would sort the edges into a sweep structure or, for a convex polygon, use the O(log n) fan search.",
        "All coordinates reach 10^9, so differences reach 2 * 10^9 and the cross product reaches 8 * 10^18 - the single most common cause of a wrong answer here is computing it in 32-bit ints.",
        "Time: O(n * m). Space: O(n).",
      ],
    },
    {
      name: "Polygon Lattice Points",
      difficulty: "Medium",
      variation: "Counting contained lattice points (Pick's theorem)",
      link: "https://cses.fi/problemset/task/2193",
      question: [
        "You are given a simple polygon whose n vertices all have integer coordinates. Your task is to calculate the number of lattice points strictly inside the polygon and the number of lattice points on its boundary. A lattice point is a point whose coordinates are both integers.",
        "Example 1:\nInput:\n4\n0 0\n4 0\n4 4\n0 4\nOutput: 9 16\nExplanation: The interior lattice points are the 3 x 3 grid from (1,1) to (3,3), and the boundary carries 4 points per side times 4 sides.",
        "Example 2:\nInput:\n3\n0 0\n4 0\n0 4\nOutput: 3 12\nExplanation: The interior points are (1,1), (1,2) and (2,1). The boundary contributes 4 + 4 + 4 lattice points, the hypotenuse from (4,0) to (0,4) passing through gcd(4,4) = 4 of them.",
        "Constraints:\n- 3 <= n <= 1000\n- All coordinates are integers with absolute value at most 10^6\n- The polygon is simple and its vertices are given in order",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> X(n), Y(n);
    for (int i = 0; i < n; i++) cin >> X[i] >> Y[i];
    long long twiceArea = 0, boundary = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        twiceArea += X[i] * Y[j] - X[j] * Y[i];          // shoelace, accumulated doubled
        boundary += gcd(llabs(X[j] - X[i]), llabs(Y[j] - Y[i]));
    }
    twiceArea = llabs(twiceArea);
    // Pick: A = i + b/2 - 1, so i = (2A - b + 2) / 2
    long long interior = (twiceArea - boundary + 2) / 2;
    cout << interior << " " << boundary << "\\n";
    return 0;
}`,
      explanation: [
        "Instead of testing each candidate point for containment - hopeless when the polygon spans 10^6 in each direction - count the interior points in closed form with Pick's theorem: for a lattice polygon, area A = i + b/2 - 1 where i is the number of strictly interior lattice points and b the number on the boundary.",
        "Both inputs to the formula are cheap. Twice the area is the shoelace sum, which is exactly the sum of the cross products of consecutive vertices and stays an integer. The boundary count is a sum over edges of gcd(|dx|, |dy|): a segment from one lattice point to another contains gcd(|dx|, |dy|) + 1 lattice points, and summing the count per edge while excluding one endpoint each time makes each vertex counted exactly once, so the +1 terms cancel against the n shared endpoints.",
        "Keeping the area doubled is the trick that avoids fractions entirely. Rearranged, i = (2A - b + 2) / 2, and since 2A and b always have the same parity for a lattice polygon the division is exact.",
        "Two traps: take the absolute value of the shoelace sum only at the very end, because the sign just records whether the vertices were given clockwise or counter-clockwise; and use 64-bit arithmetic, since products of 10^6-sized coordinates summed over 1000 edges overflow 32 bits.",
        "Pick's theorem only holds for lattice polygons - all vertices at integer coordinates - and only for simple ones. It says nothing about a polygon with a fractional vertex, where you are back to per-point containment tests or a sweep.",
        "Time: O(n log C) for the gcds. Space: O(n).",
      ],
    },
    {
      name: "Polygons",
      difficulty: "Hard",
      variation: "O(log n) point in convex polygon (fan binary search)",
      link: "https://codeforces.com/problemset/problem/166/B",
      question: [
        "You are given a strictly convex polygon A with n vertices, and then a convex polygon B with m vertices, both listed in traversal order (either rotational direction). Decide whether B lies strictly inside A, that is, whether every vertex of B is strictly inside A with none of them on A's boundary. Print YES or NO.",
        "Because B is convex and A is convex, B lies inside A exactly when all m vertices of B do, so the task reduces to m independent point-in-convex-polygon queries. With n and m this large an O(n) scan per query is too slow and each query must be answered in O(log n).",
        "Example 1:\nInput:\n4\n-5 -5\n5 -5\n5 5\n-5 5\n4\n-1 -1\n1 -1\n1 1\n-1 1\nOutput: YES\nExplanation: The small square sits well inside the large one.",
        "Example 2:\nInput:\n4\n-5 -5\n5 -5\n5 5\n-5 5\n4\n-5 -1\n1 -1\n1 1\n-5 1\nOutput: NO\nExplanation: The vertices (-5,-1) and (-5,1) lie on the left edge of A, and touching the boundary is not strictly inside.",
        "Constraints:\n- 3 <= n <= 10^5\n- 3 <= m <= 2 * 10^4\n- All coordinates are integers with absolute value at most 10^9\n- Both polygons are strictly convex",
      ],
      code: `struct P { long long x, y; };

long long cross(P o, P a, P b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<P> a(n);
    for (auto& p : a) cin >> p.x >> p.y;
    long long area2 = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        area2 += a[i].x * a[j].y - a[j].x * a[i].y;
    }
    if (area2 < 0) reverse(a.begin(), a.end());   // normalise to counter-clockwise
    int m;
    cin >> m;
    bool ok = true;
    for (int t = 0; t < m; t++) {
        P q;
        cin >> q.x >> q.y;
        if (!ok) continue;                        // still must consume the input
        // q has to be strictly inside the wedge spanned by the fan at a[0]
        if (cross(a[0], a[1], q) <= 0 || cross(a[0], a[n - 1], q) >= 0) { ok = false; continue; }
        int lo = 1, hi = n - 1;
        while (hi - lo > 1) {
            int mid = (lo + hi) / 2;
            if (cross(a[0], a[mid], q) > 0) lo = mid;
            else hi = mid;
        }
        if (cross(a[lo], a[hi], q) <= 0) ok = false;   // on or beyond the closing edge
    }
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}`,
      explanation: [
        "Anchor a triangle fan at a[0]. Because A is convex and counter-clockwise, the values cross(a[0], a[i], q) are positive for the vertices whose ray is clockwise of q and negative for the rest, so that sequence is monotone in i - and monotone means binary search. The invariant maintained by the loop is cross(a[0], a[lo], q) > 0 and cross(a[0], a[hi], q) <= 0, which converges on the single fan triangle a[0], a[lo], a[hi] that could contain q.",
        "That is only two thirds of the answer. Landing in the right wedge says q is between the two rays from a[0]; it still has to be on the inner side of the far edge, which is the final cross(a[lo], a[hi], q) > 0. Skipping that check is the classic bug: every point beyond the polygon in the direction of the fan reports as inside.",
        "The two guards before the search establish the invariant and simultaneously handle strictness. Requiring cross(a[0], a[1], q) > 0 and cross(a[0], a[n-1], q) < 0 rejects anything on either bounding ray of the fan, which includes the two edges of A that touch a[0] and the vertex a[0] itself. Using >= and <= instead of > and < throughout would answer the non-strict version of the question.",
        "Normalising orientation up front by the sign of the shoelace sum makes the routine independent of how the input happened to wind, which is much safer than trusting a statement's claim about vertex order. Note also that the loop keeps reading queries after the answer is already NO - abandoning the read stream early desynchronises the input.",
        "Testing only B's vertices is enough because containment of convex sets is determined by extreme points: if every vertex of B is inside the convex region A, so is their whole convex hull, which is B. This would be false if A were merely simple rather than convex - a concave notch in A can slice through an edge of B while missing all its vertices.",
        "Time: O(n + m log n). Space: O(n).",
      ],
    },
    {
      name: "Professor's task",
      difficulty: "Hard",
      variation: "Containment queries against a dynamic convex hull",
      link: "https://codeforces.com/problemset/problem/70/D",
      question: [
        "Maintain a set S of points under q online queries. A query of type '1 x y' adds the point (x, y) to S. A query of type '2 x y' asks whether the point (x, y) lies inside the convex hull of S, where lying on the hull's boundary counts as inside; print YES or NO. The first three queries are always additions and the three points they add are not collinear, so the hull is a genuine polygon from the start.",
        "Example 1:\nInput:\n8\n1 0 0\n1 2 0\n1 2 2\n2 1 0\n2 0 2\n2 2 1\n1 0 2\n2 0 2\nOutput:\nYES\nNO\nYES\nYES\nExplanation: The hull starts as the triangle (0,0), (2,0), (2,2). The point (1,0) is on its bottom edge and (2,1) on its right edge, while (0,2) is outside it. After (0,2) is inserted the hull becomes the full square, so the last query answers YES.",
        "Constraints:\n- 1 <= q <= 10^5\n- All coordinates are integers with absolute value at most 10^9\n- The first three queries are of type 1 and add three non-collinear points",
      ],
      code: `typedef long long ll;
typedef pair<ll,ll> Pt;

ll cross(Pt o, Pt a, Pt b) {
    return (a.first - o.first) * (b.second - o.second)
         - (a.second - o.second) * (b.first - o.first);
}

// One monotone chain: for every x it remembers the highest hull point.
struct UpperHull {
    map<ll,ll> h;

    bool covers(ll x, ll y) const {           // is (x, y) on or below the chain
        auto it = h.lower_bound(x);
        if (it == h.end()) return false;      // right of the rightmost point
        if (it->first == x) return y <= it->second;
        if (it == h.begin()) return false;    // left of the leftmost point
        auto j = prev(it);
        return cross(*j, *it, Pt(x, y)) <= 0; // right of a left-to-right chain is below it
    }

    void add(ll x, ll y) {
        if (covers(x, y)) return;             // adds nothing to this chain
        h[x] = y;
        auto it = h.find(x);
        while (true) {                        // drop right neighbours that lost cornerhood
            auto r = next(it);
            if (r == h.end()) break;
            auto rr = next(r);
            if (rr == h.end()) break;
            if (cross(*it, *r, *rr) >= 0) h.erase(r);
            else break;
        }
        while (it != h.begin()) {             // and the same walking left
            auto l = prev(it);
            if (l == h.begin()) break;
            auto ll_ = prev(l);
            if (cross(*ll_, *l, *it) >= 0) h.erase(l);
            else break;
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    UpperHull up, dn;                         // dn holds the same points with y negated
    while (q--) {
        int t;
        ll x, y;
        cin >> t >> x >> y;
        if (t == 1) {
            up.add(x, y);
            dn.add(x, -y);
        } else {
            bool in = up.covers(x, y) && dn.covers(x, -y);
            cout << (in ? "YES\\n" : "NO\\n");
        }
    }
    return 0;
}`,
      explanation: [
        "Split the hull into its upper and lower monotone chains. A point is inside the hull exactly when it is below or on the upper chain and above or on the lower chain, so containment becomes two independent chain queries. Reflecting y turns the lower chain into an upper chain, so one data structure written once serves both - that symmetry is what keeps this implementation short enough to get right.",
        "Each chain is a map keyed by x holding the extreme y at that x, which makes it sorted by x for free. A query locates the bracketing pair of hull vertices with one lower_bound and then does a single orientation test against that edge: for a chain traversed left to right, being clockwise of the edge means being below it. Falling off either end of the map means the x-coordinate is outside the hull's span, which is immediately outside.",
        "Insertion first asks the same containment question: a point already under the chain changes nothing and must not be stored, or the chain would stop being convex. Otherwise the point is written and the two neighbourhood loops delete the vertices that are no longer corners - a neighbour is redundant precisely when its own turn is not strict, that is when cross(prev, mid, next) >= 0 for an upper chain. Using > 0 there instead would leave collinear points in the map, which is harmless for correctness but inflates the structure.",
        "The amortised argument is the same as for the static monotone chain: every deletion removes a point permanently, so across q insertions the loops perform O(q) erases in total, and each insertion or query costs O(log q) for the map operations.",
        "The tempting approach - rebuild the hull from scratch after each insertion, or keep the points in a vector and run Andrew's monotone chain per query - is O(q^2 log q) and times out. Going the other way, an offline solution is not available either: the queries are interleaved, and a type 2 query must be answered against exactly the points inserted before it.",
        "Time: O(q log q). Space: O(q).",
      ],
    },
  ],
};
