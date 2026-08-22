import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Point Location Test",
      difficulty: "Easy",
      variation: "Orientation primitive, the template",
      link: "https://cses.fi/problemset/task/2189",
      question: [
        "There is a line that goes through the points p1 = (x1, y1) and p2 = (x2, y2). There is also a point p3 = (x3, y3). Your task is to determine whether p3 is located on the left side of the line, on the right side of the line, or touching the line, when the line is looked at in the direction from p1 to p2. Answer t independent queries.",
        "Example 1:\nInput:\n3\n1 1 5 3 2 3\n1 1 5 3 4 1\n1 1 5 3 3 2\nOutput:\nLEFT\nRIGHT\nTOUCH\nExplanation: The direction vector is p2 - p1 = (4, 2). For (2, 3) the cross product is 4*2 - 2*1 = 6 > 0, so it is to the left. For (4, 1) it is 4*0 - 2*3 = -6 < 0, so it is to the right. For (3, 2) it is 4*1 - 2*2 = 0, so the point lies exactly on the line.",
        "Constraints:\n- 1 <= t <= 10^5\n- -10^9 <= each coordinate <= 10^9\n- p1 and p2 are distinct",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long x1, y1, x2, y2, x3, y3;
        cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
        // cross((p2 - p1), (p3 - p1)); magnitude up to 2e9 * 2e9 * 2 = 8e18, still inside long long
        long long cr = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
        if (cr > 0) cout << "LEFT\\n";
        else if (cr < 0) cout << "RIGHT\\n";
        else cout << "TOUCH\\n";
    }
    return 0;
}`,
      explanation: [
        "The whole of segment-intersection geometry rests on one number: the z-component of the cross product of (p2 - p1) with (p3 - p1). Its sign says which side of the directed line p1 -> p2 the point p3 falls on - positive for a counter-clockwise turn (left), negative for clockwise (right), zero for collinear.",
        "Why a sign is enough: the cross product equals |p2-p1| * |p3-p1| * sin(theta), and the two lengths are positive, so only the sine of the turn angle decides the sign. That also means you never need the magnitude, so you never need a square root or a division, and the test stays exact in integers.",
        "The tempting wrong approach is to compute slopes and compare them, or to solve for the line as y = m*x + c. Both die on vertical lines and both introduce floating-point error that turns exactly-collinear inputs into random left/right answers. Keep everything as integer cross products.",
        "The one real hazard here is overflow. Coordinate differences reach 2*10^9, so each product reaches 4*10^18 and the difference 8*10^18 - that fits in a signed 64-bit value but blows an int by nine orders of magnitude. Use __int128 if coordinates can be larger.",
        "Time: O(1) per query, O(t) overall. Space: O(1).",
      ],
    },
    {
      name: "Check If It Is a Straight Line",
      difficulty: "Easy",
      variation: "Collinearity of a point set",
      link: "https://leetcode.com/problems/check-if-it-is-a-straight-line/",
      question: [
        "You are given an array coordinates where coordinates[i] = [x, y] is a point in the XY plane. Return true if all the points lie on the same straight line, and false otherwise.",
        "Example 1:\nInput: coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6]]\nOutput: true\nExplanation: Every point satisfies y = x + 1, so all five are on one line.",
        "Example 2:\nInput: coordinates = [[1,1],[2,2],[3,4],[4,5],[5,6],[7,7]]\nOutput: false\nExplanation: Taking the base line through (1,1) and (2,2), the point (3,4) gives cross = (2-1)*(4-1) - (2-1)*(3-1) = 3 - 2 = 1, which is non-zero, so (3,4) is off the line.",
        "Constraints:\n- 2 <= coordinates.length <= 1000\n- -10^4 <= x, y <= 10^4",
      ],
      code: `bool checkStraightLine(vector<vector<int>>& coordinates) {
    int n = coordinates.size();
    long long dx = coordinates[1][0] - coordinates[0][0];
    long long dy = coordinates[1][1] - coordinates[0][1];
    for (int i = 2; i < n; i++) {
        long long ex = coordinates[i][0] - coordinates[0][0];
        long long ey = coordinates[i][1] - coordinates[0][1];
        if (dx * ey - dy * ex != 0) return false;   // point i is off the base line
    }
    return true;
}`,
      explanation: [
        "Fix the first two points as the reference line and test every remaining point for collinearity with a single cross product. Zero means the turn from the base direction is neither left nor right, so the point sits on the line.",
        "The reference direction is well defined even if the first two points coincide: then dx = dy = 0, the cross product is 0 for everything, and the answer is true - which is right, because a degenerate pair plus arbitrary points still cannot be contradicted by that pair alone. Problems that forbid duplicate points sidestep this entirely.",
        "The classic wrong version compares (y[i]-y[0])/(x[i]-x[0]) against the first slope. It divides by zero on a vertical line and, worse, silently passes floating-point comparisons for near-collinear points. Cross-multiplying to dx*ey == dy*ex is the same test done exactly.",
        "Time: O(n) - one cross product per point. Space: O(1).",
      ],
    },
    {
      name: "Check if a Point Lies on a Given Line Segment",
      difficulty: "Easy",
      variation: "On-segment test (collinear plus bounding box)",
      question: [
        "Given a line segment with endpoints p and q, and a third point r, decide whether r lies on the segment pq (endpoints included). All coordinates are integers, and the answer must be exact - a point that is collinear with the line pq but outside the segment does not count.",
        "Example 1:\nInput: p = (1,1), q = (5,5), r = (3,3)\nOutput: true\nExplanation: cross(p, q, r) = (5-1)*(3-1) - (5-1)*(3-1) = 0, so r is collinear, and x = 3 lies in [1,5] while y = 3 lies in [1,5].",
        "Example 2:\nInput: p = (1,1), q = (5,5), r = (7,7)\nOutput: false\nExplanation: r is collinear with the line, but x = 7 is outside the range [1,5], so it lies on the extension of the segment rather than on the segment itself.",
        "Constraints:\n- -10^9 <= all coordinates <= 10^9\n- p and q may coincide, in which case the segment is a single point",
      ],
      code: `struct Point { long long x, y; };

// z-component of (a - o) x (b - o): >0 left turn, <0 right turn, 0 collinear
long long cross(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

bool onSegment(const Point& p, const Point& q, const Point& r) {
    if (cross(p, q, r) != 0) return false;              // not even on the infinite line
    // collinear, so the axis-aligned bounding box test is exact
    return min(p.x, q.x) <= r.x && r.x <= max(p.x, q.x) &&
           min(p.y, q.y) <= r.y && r.y <= max(p.y, q.y);
}`,
      explanation: [
        "The test splits into two independent halves. The cross product pins r to the infinite line through p and q; the bounding-box comparison then pins it to the finite piece between the endpoints.",
        "The bounding box alone is not sufficient - the point (5,1) sits inside the box of (1,1)-(5,5) but nowhere near the segment. Conversely the cross product alone is not sufficient, as Example 2 shows. Only the conjunction is correct.",
        "Once collinearity is established, however, the box test becomes exact rather than merely necessary: a collinear point inside the bounding box must lie between p and q, because the segment is the intersection of its own line with that box.",
        "A dot-product alternative, checking dot(r-p, r-q) <= 0 after collinearity, works too and is a single comparison, but it multiplies coordinate differences and so needs the same 64-bit care. The box version only compares, never multiplies, past the initial cross product.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Rectangle Overlap",
      difficulty: "Easy",
      variation: "Axis-aligned overlap as two 1D interval tests",
      link: "https://leetcode.com/problems/rectangle-overlap/",
      question: [
        "An axis-aligned rectangle is given as a list [x1, y1, x2, y2], where (x1, y1) is the bottom-left corner and (x2, y2) is the top-right corner. Two rectangles overlap if the area of their intersection is positive; rectangles that only touch along an edge or at a corner do not count as overlapping. Given two rectangles rec1 and rec2, return true if they overlap.",
        "Example 1:\nInput: rec1 = [0,0,2,2], rec2 = [1,1,3,3]\nOutput: true\nExplanation: The x ranges [0,2] and [1,3] share (1,2), and the y ranges share (1,2), so the overlap is the unit square from (1,1) to (2,2).",
        "Example 2:\nInput: rec1 = [0,0,1,1], rec2 = [1,0,2,1]\nOutput: false\nExplanation: The x ranges [0,1] and [1,2] meet only at x = 1, so the intersection is a segment of zero area.",
        "Constraints:\n- rec1.length == rec2.length == 4\n- -10^9 <= each coordinate <= 10^9\n- Each rectangle has positive width and height",
      ],
      code: `bool isRectangleOverlap(vector<int>& rec1, vector<int>& rec2) {
    // Overlap in 2D is overlap on the x axis AND overlap on the y axis.
    // Strict inequalities because touching edges have zero area.
    return rec1[0] < rec2[2] && rec2[0] < rec1[2] &&
           rec1[1] < rec2[3] && rec2[1] < rec1[3];
}`,
      explanation: [
        "An axis-aligned rectangle is the Cartesian product of an x interval and a y interval, so the intersection of two of them is the product of the two interval intersections. The area is positive exactly when both interval intersections are non-empty, which decouples the problem into two independent 1D overlap tests.",
        "Two intervals [a,b] and [c,d] overlap with positive length iff a < d and c < b. Writing it that way avoids enumerating the six relative arrangements of two intervals, which is where hand-rolled case analyses usually lose a case.",
        "This is the degenerate, axis-aligned end of the segment-intersection family: no cross products are needed because every edge is parallel to an axis, so 'which side' collapses into 'which coordinate is bigger'. It is also the standard cheap pre-filter before running a real segment test - if the bounding boxes miss, the segments cannot touch.",
        "The trap is <= versus <. Using <= reports edge-touching rectangles as overlapping, which this problem explicitly excludes; a problem that counts touching as overlap needs exactly the opposite choice.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Check if Two Line Segments Intersect",
      difficulty: "Medium",
      variation: "General segment intersection with collinear cases",
      question: [
        "Given two line segments, the first with endpoints p1 and q1 and the second with endpoints p2 and q2, decide whether they intersect. Any shared point counts: a proper crossing, a touch at an endpoint, or a collinear overlap.",
        "Example 1:\nInput: p1 = (10,0), q1 = (0,10), p2 = (0,0), q2 = (10,10)\nOutput: true\nExplanation: The segments are the diagonals of the square from (0,0) to (10,10) and cross at (5,5). Each segment has its two endpoints on strictly opposite sides of the other segment's line.",
        "Example 2:\nInput: p1 = (0,0), q1 = (5,5), p2 = (6,6), q2 = (10,10)\nOutput: false\nExplanation: All four points are collinear, so every cross product is zero, but the ranges [0,5] and [6,10] along the common line do not overlap, so there is no shared point.",
        "Constraints:\n- -10^9 <= all coordinates <= 10^9\n- A segment may be degenerate (its two endpoints equal)",
      ],
      code: `struct Point { long long x, y; };

long long cross(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int sgn(long long v) { return (v > 0) - (v < 0); }

bool onSegment(const Point& p, const Point& q, const Point& r) {
    if (cross(p, q, r) != 0) return false;
    return min(p.x, q.x) <= r.x && r.x <= max(p.x, q.x) &&
           min(p.y, q.y) <= r.y && r.y <= max(p.y, q.y);
}

bool segmentsIntersect(const Point& p1, const Point& q1,
                       const Point& p2, const Point& q2) {
    int d1 = sgn(cross(p1, q1, p2));
    int d2 = sgn(cross(p1, q1, q2));
    int d3 = sgn(cross(p2, q2, p1));
    int d4 = sgn(cross(p2, q2, q1));
    // proper crossing: each segment strictly straddles the other's line
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    // degenerate cases: some endpoint is collinear with the other segment
    if (d1 == 0 && onSegment(p1, q1, p2)) return true;
    if (d2 == 0 && onSegment(p1, q1, q2)) return true;
    if (d3 == 0 && onSegment(p2, q2, p1)) return true;
    if (d4 == 0 && onSegment(p2, q2, q1)) return true;
    return false;
}`,
      explanation: [
        "Two segments cross properly iff each one separates the endpoints of the other: p2 and q2 lie on strictly opposite sides of line p1q1, and p1 and q1 lie on strictly opposite sides of line p2q2. Both directions are needed - one alone only says the other segment's line is crossed, not the finite segment.",
        "Everything with a zero cross product is a boundary case and cannot be settled by signs. If an endpoint is collinear with the other segment's line, the only question left is whether it lands inside that segment, which is precisely the on-segment test. Four such checks cover endpoint touching and collinear overlap, including the fully collinear case where all four signs are zero.",
        "The invariant that makes the four extra checks exhaustive: if the segments share a point but do not straddle each other, the shared point must be an endpoint of at least one of them, and that endpoint is then collinear with and inside the other segment.",
        "The usual wrong solution writes if (d1 != d2 and d3 != d4) return true, which treats a zero sign as 'different' and reports intersections for parallel non-touching segments whose endpoint happens to be collinear-adjacent, and also mishandles disjoint collinear pairs like Example 2. Treat zero as its own case, never as 'the other side'.",
        "Degenerate segments fall out for free: a point-segment gives all-zero cross products and reduces to the on-segment test, which is the right answer.",
        "Time: O(1) - at most eight cross products. Space: O(1).",
      ],
    },
    {
      name: "Line Segment Intersection",
      difficulty: "Medium",
      variation: "Judge version, t queries with all degenerate cases",
      link: "https://cses.fi/problemset/task/2190",
      question: [
        "There are two line segments: the first goes through the points (x1, y1) and (x2, y2), and the second goes through the points (x3, y3) and (x4, y4). For each of t queries, print YES if the segments intersect (touching at a single point or overlapping both count) and NO otherwise.",
        "Example 1:\nInput:\n4\n1 1 5 3 1 2 4 3\n1 1 5 3 2 3 4 1\n0 0 4 4 2 2 6 6\n0 0 3 0 0 1 3 1\nOutput:\nNO\nYES\nYES\nNO\nExplanation: Query 1: both (1,2) and (4,3) give positive cross products against the line (1,1)->(5,3) (values 4 and 2), so the second segment stays entirely on one side. Query 2: the signs are 6 and -6 one way and -6 and 7 the other way, so the segments straddle each other and cross. Query 3: all four points are collinear on y = x and the ranges [0,4] and [2,6] overlap. Query 4: the segments are parallel horizontal lines one unit apart.",
        "Constraints:\n- 1 <= t <= 10^5\n- -10^9 <= each coordinate <= 10^9",
      ],
      code: `struct Point { long long x, y; };

long long cross(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int sgn(long long v) { return (v > 0) - (v < 0); }

bool onSegment(const Point& p, const Point& q, const Point& r) {
    if (cross(p, q, r) != 0) return false;
    return min(p.x, q.x) <= r.x && r.x <= max(p.x, q.x) &&
           min(p.y, q.y) <= r.y && r.y <= max(p.y, q.y);
}

bool segmentsIntersect(const Point& p1, const Point& q1,
                       const Point& p2, const Point& q2) {
    int d1 = sgn(cross(p1, q1, p2)), d2 = sgn(cross(p1, q1, q2));
    int d3 = sgn(cross(p2, q2, p1)), d4 = sgn(cross(p2, q2, q1));
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    if (d1 == 0 && onSegment(p1, q1, p2)) return true;
    if (d2 == 0 && onSegment(p1, q1, q2)) return true;
    if (d3 == 0 && onSegment(p2, q2, p1)) return true;
    if (d4 == 0 && onSegment(p2, q2, q1)) return true;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        Point a, b, c, d;
        cin >> a.x >> a.y >> b.x >> b.y >> c.x >> c.y >> d.x >> d.y;
        cout << (segmentsIntersect(a, b, c, d) ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the judge form of the general test, and it exists mainly to punish solutions that ignore the boundary cases: the test data contains shared endpoints, T-shaped touches, collinear overlaps, and collinear disjoint pairs, all of which have at least one zero cross product.",
        "Keeping only the sign of each cross product is what makes the case analysis readable: the product d1*d2 is negative exactly when the two endpoints are strictly on opposite sides, and comparing a sign to 0 is unambiguous where comparing a raw huge value is easy to get wrong.",
        "Do not reach for a parametric solve. Computing the intersection parameter t = cross(...)/den with doubles loses exactness at coordinates near 10^9 and needs a separate branch for den == 0 anyway, which is the collinear case you were trying to avoid. Signs plus a bounding-box test answer the yes/no question without any division.",
        "Overflow is again the silent killer: differences up to 2*10^9 squared and doubled reach 8*10^18, so every intermediate must be 64-bit. With 10^5 queries also keep I/O unsynchronised, or reading alone dominates the runtime.",
        "Time: O(1) per query, O(t) overall. Space: O(1).",
      ],
    },
    {
      name: "Point of Intersection of Two Lines",
      difficulty: "Medium",
      variation: "Computing the intersection point of infinite lines",
      question: [
        "Two infinite lines are given, the first passing through points A and B and the second through points C and D. Determine whether they intersect in exactly one point, and if so report that point. If the lines are parallel or identical, report that there is no unique intersection point.",
        "Example 1:\nInput: A = (0,0), B = (2,2), C = (0,4), D = (4,0)\nOutput: (2.0, 2.0)\nExplanation: The lines are y = x and x + y = 4. The denominator is (2-0)*(0-4) - (2-0)*(4-0) = -8 - 8 = -16 and the numerator is (0-0)*(0-4) - (4-0)*(4-0) = -16, so t = 1 and the point is A + 1*(B-A) = (2,2).",
        "Example 2:\nInput: A = (1,1), B = (10,1), C = (1,2), D = (10,2)\nOutput: no unique intersection\nExplanation: Both direction vectors are (9,0), so the denominator is 9*0 - 0*9 = 0 and the lines are parallel.",
        "Constraints:\n- -10^4 <= all coordinates <= 10^4\n- A != B and C != D",
      ],
      code: `struct Point { long long x, y; };

// Solve A + t*(B-A) = C + u*(D-C) for t using cross products.
// Returns false when the lines are parallel or identical.
bool lineIntersection(const Point& A, const Point& B,
                      const Point& C, const Point& D,
                      double& X, double& Y) {
    long long rx = B.x - A.x, ry = B.y - A.y;   // direction of line 1
    long long sx = D.x - C.x, sy = D.y - C.y;   // direction of line 2
    long long den = rx * sy - ry * sx;          // cross(r, s)
    if (den == 0) return false;                 // parallel: no unique point
    long long num = (C.x - A.x) * sy - (C.y - A.y) * sx;   // cross(C - A, s)
    double t = (double)num / (double)den;
    X = A.x + t * rx;
    Y = A.y + t * ry;
    return true;
}`,
      explanation: [
        "Write both lines parametrically, A + t*r and C + u*s. Crossing both sides of A + t*r = C + u*s with s kills the u term, because cross(s, s) = 0, and leaves t = cross(C - A, s) / cross(r, s) - one division and no linear system to solve.",
        "cross(r, s) = 0 is exactly the condition that the directions are parallel, so the same denominator that would divide by zero is the flag for the degenerate case. To tell 'parallel and distinct' from 'the same line', additionally test cross(C - A, r): zero means C lies on line 1, so the lines coincide and share infinitely many points.",
        "For segments rather than infinite lines, compute u = cross(C - A, r) / cross(r, s) as well and require both t and u to lie in [0,1]. Prefer comparing the numerators against the denominator with the sign of the denominator folded in, so the range check stays in integers.",
        "The trap is the slope-intercept route: y = m*x + c cannot represent a vertical line, and solving two such equations loses precision when the slopes are close. The cross-product form treats all orientations identically and only introduces floating point at the very last division, where the input to the division is exact.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Self Crossing",
      difficulty: "Hard",
      variation: "Path self-intersection in O(1) memory",
      link: "https://leetcode.com/problems/self-crossing/",
      question: [
        "You are given an array of integers distance. You start at the point (0,0) on an XY plane and you move distance[0] metres to the north, then distance[1] metres to the west, distance[2] metres to the south, distance[3] metres to the east, and so on - the direction rotates counter-clockwise by 90 degrees after each move. Return true if your path crosses itself at any point, and false if it never does.",
        "Example 1:\nInput: distance = [2,1,1,2]\nOutput: true\nExplanation: The path visits (0,0) -> (0,2) -> (-1,2) -> (-1,1) -> (1,1). The last move runs along y = 1 from x = -1 to x = 1 and cuts the first move, the vertical segment x = 0 from y = 0 to y = 2, at (0,1).",
        "Example 2:\nInput: distance = [1,2,3,4]\nOutput: false\nExplanation: The path spirals outward to (0,1) -> (-2,1) -> (-2,-2) -> (2,-2) and each move is longer than the one two steps back, so it never comes back to an earlier segment.",
        "Example 3:\nInput: distance = [1,1,1,2,1]\nOutput: true\nExplanation: The path is (0,0) -> (0,1) -> (-1,1) -> (-1,0) -> (1,0) -> (1,1). The fourth move along y = 0 already touches the start of the first move at (0,0), which counts as a crossing.",
        "Constraints:\n- 1 <= distance.length <= 10^5\n- 1 <= distance[i] <= 10^5",
      ],
      code: `bool isSelfCrossing(vector<int>& d) {
    int n = d.size();
    for (int i = 3; i < n; i++) {
        // Case 1: the current move crosses the move three steps back (spiral closes inward)
        if (d[i] >= d[i - 2] && d[i - 1] <= d[i - 3]) return true;
        // Case 2: the current move touches the move four steps back
        if (i >= 4 && d[i - 1] == d[i - 3] && d[i] + d[i - 4] >= d[i - 2]) return true;
        // Case 3: the current move crosses the move five steps back
        if (i >= 5 && d[i - 2] >= d[i - 4] && d[i] + d[i - 4] >= d[i - 2] &&
            d[i - 1] <= d[i - 3] && d[i - 1] + d[i - 5] >= d[i - 3]) return true;
    }
    return false;
}`,
      explanation: [
        "The naive solution stores every segment and runs the pairwise segment-intersection test, which is O(n^2). The structural fact that kills the quadratic factor: because the turns are always 90 degrees in the same rotational direction, a move can only ever cross the move 3, 4, or 5 steps before it. Anything older is separated from the current move by a strictly growing or strictly shrinking spiral and is unreachable.",
        "Case 1 is the inward-turning spiral: the path was expanding, then the current move reaches back at least as far as the move two steps ago while the previous move did not exceed the one three steps ago, so segment i cuts segment i-3.",
        "Case 2 is the exact-touch alignment where move i-1 has the same length as move i-3, putting move i on the same line as move i-4; then it only takes d[i] + d[i-4] >= d[i-2] for them to meet. This is the case most hand-written solutions miss, and it is the one Example 3 exercises.",
        "Case 3 is the widening-then-narrowing spiral where segment i reaches segment i-5; it needs all four inequalities, one per side of the enclosing rectangle, and dropping any of them produces false positives on outward spirals.",
        "The safer route in an interview is to state the O(n^2) segment-intersection baseline first, prove that only the last five moves matter, and only then write the three cases - the case analysis is impossible to justify without that lemma.",
        "Time: O(n) - a constant number of comparisons per move. Space: O(1).",
      ],
    },
    {
      name: "Given a Set of Line Segments, Find if Any Two Intersect",
      difficulty: "Hard",
      variation: "Shamos-Hoey sweep line, existence of any crossing",
      question: [
        "Given n line segments in the plane, determine whether any two of them intersect. You only need a yes/no answer, not the intersecting pair or the intersection point, and the solution must be better than the quadratic all-pairs check.",
        "Example 1:\nInput: segments = [ (1,1)-(4,4), (1,4)-(4,1), (5,1)-(6,2) ]\nOutput: true\nExplanation: The first two segments are the diagonals of the square from (1,1) to (4,4) and cross at (2.5, 2.5). The third segment is far to the right and irrelevant.",
        "Example 2:\nInput: segments = [ (1,1)-(2,2), (3,1)-(4,2), (5,1)-(6,2) ]\nOutput: false\nExplanation: The three segments are parallel and their x ranges [1,2], [3,4] and [5,6] are disjoint, so no two of them ever share a point.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^9 <= all coordinates <= 10^9\n- No segment is vertical in the general version of the algorithm; vertical segments need the tie-breaking rules described in the explanation",
      ],
      code: `struct Point { long long x, y; };
struct Seg { long long x1, y1, x2, y2; };

long long cross(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
int sgn(long long v) { return (v > 0) - (v < 0); }
bool onSegment(const Point& p, const Point& q, const Point& r) {
    if (cross(p, q, r) != 0) return false;
    return min(p.x, q.x) <= r.x && r.x <= max(p.x, q.x) &&
           min(p.y, q.y) <= r.y && r.y <= max(p.y, q.y);
}
bool segmentsIntersect(const Point& p1, const Point& q1,
                       const Point& p2, const Point& q2) {
    int d1 = sgn(cross(p1, q1, p2)), d2 = sgn(cross(p1, q1, q2));
    int d3 = sgn(cross(p2, q2, p1)), d4 = sgn(cross(p2, q2, q1));
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    if (d1 == 0 && onSegment(p1, q1, p2)) return true;
    if (d2 == 0 && onSegment(p1, q1, q2)) return true;
    if (d3 == 0 && onSegment(p2, q2, p1)) return true;
    if (d4 == 0 && onSegment(p2, q2, q1)) return true;
    return false;
}

vector<Seg> S;      // segments, normalised so that x1 <= x2
double sweepX;      // current position of the sweep line

double yAtX(const Seg& s, double x) {
    if (s.x1 == s.x2) return (double)min(s.y1, s.y2);
    return s.y1 + (double)(s.y2 - s.y1) * (x - s.x1) / (double)(s.x2 - s.x1);
}

// Orders active segments by their height on the current sweep line.
struct Cmp {
    bool operator()(int a, int b) const {
        double ya = yAtX(S[a], sweepX), yb = yAtX(S[b], sweepX);
        if (ya != yb) return ya < yb;
        return a < b;
    }
};

bool hit(int a, int b) {
    return segmentsIntersect({S[a].x1, S[a].y1}, {S[a].x2, S[a].y2},
                             {S[b].x1, S[b].y1}, {S[b].x2, S[b].y2});
}

bool anyIntersection(vector<Seg> segs) {
    S = segs;
    int n = S.size();
    for (auto& s : S)
        if (s.x1 > s.x2) { swap(s.x1, s.x2); swap(s.y1, s.y2); }

    // (x, type, id) with type 0 = insert, 1 = erase; lexicographic sort puts
    // insertions before deletions at the same x so touching ends are caught.
    vector<array<long long, 3>> ev;
    for (int i = 0; i < n; i++) {
        ev.push_back({S[i].x1, 0, (long long)i});
        ev.push_back({S[i].x2, 1, (long long)i});
    }
    sort(ev.begin(), ev.end());

    set<int, Cmp> active;
    for (auto& e : ev) {
        sweepX = (double)e[0];
        int id = (int)e[2];
        if (e[1] == 0) {
            auto it = active.insert(id).first;
            if (it != active.begin() && hit(*prev(it), id)) return true;
            auto nx = next(it);
            if (nx != active.end() && hit(id, *nx)) return true;
        } else {
            auto it = active.find(id);
            if (it == active.end()) continue;
            auto nx = next(it);
            if (it != active.begin() && nx != active.end() && hit(*prev(it), *nx)) return true;
            active.erase(it);
        }
    }
    return false;
}`,
      explanation: [
        "The sweep-line invariant: run a vertical line left to right and keep the segments it currently cuts, ordered by the height at which they are cut. If two segments intersect, then just before the leftmost intersection point they must be neighbours in that order, because between them there can be no third segment that neither of them has crossed yet.",
        "That invariant is what makes the algorithm sub-quadratic. Since only neighbours can be the first crossing pair, it is enough to test the new segment against its two neighbours on insertion, and to test the two orphaned neighbours against each other on deletion. Every other pair is provably not the leftmost intersection.",
        "The ordering key depends on the sweep position, which sounds like it would corrupt the balanced tree, but it does not: as long as no two active segments have crossed, their relative order is the same at every x where both are active, so the tree stays consistent. The moment that stops being true the algorithm has already returned true - which is exactly why the sweep must abort at the first crossing rather than continue.",
        "The trap is comparing segments by the y of their left endpoint instead of by y at the current sweep x. That gives the wrong neighbour relation as soon as two segments have different slopes, and the algorithm then misses crossings. Equally, deleting a segment without first moving sweepX to its right endpoint makes std::set unable to find it.",
        "Degeneracies deserve their own pass: vertical segments have no single y on the sweep line, and several endpoints sharing an x need a deterministic tie-break (insert before erase, and lower y first). Counting all intersections rather than detecting one requires the full Bentley-Ottmann algorithm, which pushes intersection points back into the event queue and costs O((n + k) log n) for k crossings.",
        "Time: O(n log n) - 2n events, each doing O(log n) tree work and O(1) intersection tests. Space: O(n).",
      ],
    },
    {
      name: "Intersection Points",
      difficulty: "Hard",
      variation: "Counting horizontal-vertical crossings with a BIT sweep",
      link: "https://cses.fi/problemset/task/1740",
      question: [
        "There are n line segments, each of which is either horizontal or vertical. Your task is to count the number of points where a horizontal segment and a vertical segment intersect. Segments may touch at their endpoints, and such a touch counts as an intersection point.",
        "Example 1:\nInput:\n3\n2 3 6 3\n4 1 4 5\n1 2 5 2\nOutput: 2\nExplanation: The vertical segment x = 4 spanning y in [1,5] crosses the horizontal segment y = 3 spanning x in [2,6] at (4,3), and it crosses the horizontal segment y = 2 spanning x in [1,5] at (4,2). The two horizontal segments are parallel and never meet.",
        "Example 2:\nInput:\n3\n2 3 2 5\n1 4 5 4\n1 2 5 2\nOutput: 1\nExplanation: The vertical segment x = 2 spanning y in [3,5] meets the horizontal segment y = 4 at (2,4). It misses y = 2 because 2 is below its lower end.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^9 <= all coordinates <= 10^9\n- Each segment is horizontal or vertical (a single point counts as vertical here)",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<array<long long, 4>> seg(n);
    vector<long long> ys;
    for (int i = 0; i < n; i++) {
        long long x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        seg[i] = {x1, y1, x2, y2};
        ys.push_back(y1);
        ys.push_back(y2);
    }
    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());
    int m = ys.size();
    auto idx = [&](long long y) {
        return (int)(lower_bound(ys.begin(), ys.end(), y) - ys.begin()) + 1;
    };

    // events: (x, type, a, b) with type 0 = add horizontal, 1 = vertical query,
    // 2 = remove horizontal, so touching endpoints are counted.
    vector<array<long long, 4>> ev;
    for (int i = 0; i < n; i++) {
        long long x1 = seg[i][0], y1 = seg[i][1], x2 = seg[i][2], y2 = seg[i][3];
        if (y1 == y2 && x1 != x2) {
            int p = idx(y1);
            ev.push_back({min(x1, x2), 0, p, 0});
            ev.push_back({max(x1, x2), 2, p, 0});
        } else {
            int lo = idx(min(y1, y2)), hi = idx(max(y1, y2));
            ev.push_back({x1, 1, lo, hi});
        }
    }
    sort(ev.begin(), ev.end());

    vector<int> bit(m + 1, 0);
    auto upd = [&](int i, int v) {
        for (; i <= m; i += i & (-i)) bit[i] += v;
    };
    auto qry = [&](int i) {
        int s = 0;
        for (; i > 0; i -= i & (-i)) s += bit[i];
        return s;
    };

    long long ans = 0;
    for (auto& e : ev) {
        if (e[1] == 0) upd((int)e[2], 1);
        else if (e[1] == 2) upd((int)e[2], -1);
        else ans += qry((int)e[3]) - qry((int)e[2] - 1);   // active horizontals in the y range
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Because every segment is axis-aligned, a horizontal segment at height y over x in [xl, xr] meets a vertical segment at x = X over y in [ylo, yhi] iff xl <= X <= xr and ylo <= y <= yhi. That is a pure dominance condition, so no cross products appear at all - the geometry has collapsed into a 2D counting problem.",
        "Sweep x from left to right and keep the heights of the currently active horizontal segments in a Fenwick tree. When the sweep reaches a vertical segment, the first condition is satisfied by construction for everything in the tree, so the answer contribution is just the number of stored heights in [ylo, yhi], a single range sum.",
        "Event ordering carries the endpoint semantics. Sorting by (x, type) with add = 0, query = 1, remove = 2 means a horizontal segment that starts or ends exactly at the vertical segment's x is still in the tree during the query, which is what makes touching count. Swap the type codes and you silently switch to strict crossings.",
        "Coordinates reach 10^9, so the Fenwick tree must be indexed by compressed y values rather than by raw coordinates; compress the union of all endpoint y values once up front. The count itself can approach n^2/4, roughly 2.5*10^9, so the accumulator must be 64-bit even though every individual query returns a small int.",
        "The all-pairs check is O(n^2), which is 10^10 operations here. The sweep replaces the 'is x in range' half of the test with the position of the sweep line and the 'is y in range' half with a prefix sum, and each half then costs O(log n).",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
