import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Area of a Polygon with Given n Ordered Vertices",
      difficulty: "Easy",
      variation: "Shoelace formula, the template",
      link: "https://www.geeksforgeeks.org/area-of-a-polygon-with-given-n-ordered-vertices/",
      question: [
        "You are given the vertices of a simple polygon (no self-intersections) in order - either clockwise or counter-clockwise - as two arrays X and Y of length n, where vertex i is (X[i], Y[i]). Return the area of the polygon. The polygon does not have to be convex.",
        "Example 1:\nInput: X = [0, 4, 4, 0], Y = [0, 0, 4, 4]\nOutput: 16\nExplanation: The vertices form a 4 by 4 axis-aligned square, so the area is 4 * 4 = 16.",
        "Example 2:\nInput: X = [1, 4, 4], Y = [1, 1, 5]\nOutput: 6\nExplanation: A right triangle with legs of length 3 (from (1,1) to (4,1)) and 4 (from (4,1) to (4,5)), so the area is 3 * 4 / 2 = 6.",
        "Constraints:\n- 3 <= n <= 10^5\n- -10^6 <= X[i], Y[i] <= 10^6\n- The vertices are given in order and the polygon is simple",
      ],
      code: `double polygonArea(vector<int>& X, vector<int>& Y) {
    int n = X.size();
    long long twice = 0;
    // j walks one vertex behind i, wrapping around from n-1 to 0
    for (int i = 0, j = n - 1; i < n; j = i++)
        twice += (long long)X[j] * Y[i] - (long long)X[i] * Y[j];
    return llabs(twice) / 2.0;   // sign only encodes orientation
}`,
      explanation: [
        "Each term X[j]*Y[i] - X[i]*Y[j] is the cross product of the two position vectors of consecutive vertices, which equals twice the signed area of the triangle (origin, vertex j, vertex i). Summing over all edges sweeps a fan of triangles from the origin around the whole boundary.",
        "Triangles that the boundary traverses 'backwards' contribute a negative signed area and cancel exactly the part of the fan that lies outside the polygon. That cancellation is why the origin may sit anywhere - inside, outside, or on the polygon - and why the formula needs no special cases for concave vertices.",
        "The total sign tells you the orientation: positive for counter-clockwise, negative for clockwise. Take the absolute value only at the very end; taking it per term would destroy the cancellation and give a wildly wrong answer.",
        "Accumulate in a 64-bit integer and divide by 2 only once, at the end. Summing doubles term by term loses precision, and coordinates of 10^6 make each product 10^12, which overflows a 32-bit int.",
        "Time: O(n). Space: O(1) beyond the input.",
      ],
    },
    {
      name: "Polygon Area (CSES)",
      difficulty: "Easy",
      variation: "Twice-area as an exact integer",
      link: "https://cses.fi/problemset/task/2191",
      question: [
        "Your task is to calculate the area of a given polygon. The polygon consists of n vertices given in order (either clockwise or counter-clockwise) and is simple. Print the area multiplied by two, so that the answer is always an integer.",
        "Example 1:\nInput:\n4\n1 1\n4 1\n5 3\n1 3\nOutput: 14\nExplanation: The shape is a trapezoid with parallel horizontal sides of length 3 (y = 1, from x = 1 to 4) and 4 (y = 3, from x = 1 to 5), with height 2, so its area is (3 + 4) / 2 * 2 = 7 and twice the area is 14.",
        "Example 2:\nInput:\n3\n0 0\n2 0\n0 2\nOutput: 4\nExplanation: A right triangle with legs 2 and 2 has area 2, so twice the area is 4.",
        "Constraints:\n- 3 <= n <= 1000\n- -10^9 <= x, y <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    long long twice = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        twice += x[i] * y[j] - x[j] * y[i];   // cross product of consecutive vertices
    }
    cout << llabs(twice) << "\\n";
    return 0;
}`,
      explanation: [
        "The judge asks for twice the area precisely so the shoelace sum can be printed as-is: no division, no floating point, no rounding question.",
        "Why twice the area is always an integer here: every coordinate is an integer, so every cross product term is an integer, so the sum is an integer. The real area may be a half-integer (any triangle on lattice points with odd twice-area), which is exactly why doubling is the natural output format.",
        "Range check before choosing types: a single term can be about 10^9 * 10^9 = 10^18, which already fills a signed 64-bit value, and n = 1000 terms could in principle push past it. In the actual CSES bounds the sum stays inside 64 bits, but this is the calculation to do rather than assume - with looser bounds you would need __int128.",
        "A common wrong instinct is to first test whether the input is clockwise and reverse it. That is unnecessary: orientation only flips the sign, and the absolute value handles it.",
        "Time: O(n). Space: O(n) to hold the vertices.",
      ],
    },
    {
      name: "Largest Triangle Area",
      difficulty: "Easy",
      variation: "Triangle area from a cross product",
      link: "https://leetcode.com/problems/largest-triangle-area/",
      question: [
        "Given an array of points on the plane, return the area of the largest triangle that can be formed by any three of those points. Answers within 1e-5 of the true value are accepted.",
        "Example 1:\nInput: points = [[0,0],[0,1],[1,0],[0,2],[2,0]]\nOutput: 2.00000\nExplanation: The triangle (0,0), (0,2), (2,0) has legs of length 2 along the axes, so its area is 2 * 2 / 2 = 2, and no triple does better.",
        "Example 2:\nInput: points = [[1,0],[0,0],[0,1]]\nOutput: 0.50000\nExplanation: Only one triangle exists; it has legs of length 1, so its area is 0.5.",
        "Constraints:\n- 3 <= points.length <= 50\n- -50 <= x, y <= 50\n- All points are distinct",
      ],
      code: `double largestTriangleArea(vector<vector<int>>& points) {
    int n = points.size();
    double best = 0.0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                // cross product of (j - i) and (k - i) = twice the signed area
                long long cross = (long long)(points[j][0] - points[i][0]) * (points[k][1] - points[i][1])
                                - (long long)(points[k][0] - points[i][0]) * (points[j][1] - points[i][1]);
                best = max(best, llabs(cross) / 2.0);
            }
    return best;
}`,
      explanation: [
        "A triangle is the n = 3 case of the shoelace formula, and it collapses to a single cross product: for vertices A, B, C the value (B-A) x (C-A) is twice the signed area. Its absolute value halved is the area.",
        "With n <= 50 there are only C(50,3) = 19600 triples, so brute force over all of them is trivially fast and exact. The cross product keeps every intermediate value an integer, so there is no accumulated floating-point error - the single division by 2 at the end is the only inexact step.",
        "The tempting wrong approach is Heron's formula from the three side lengths. It needs three square roots per triple and is numerically unstable for thin, nearly degenerate triangles, where the subtraction inside Heron's formula cancels catastrophically. The cross product has neither problem.",
        "Only the convex hull vertices can form the maximum-area triangle, so on large inputs you would hull first and then run rotating calipers; at n <= 50 that optimisation buys nothing but bugs.",
        "Time: O(n^3). Space: O(1).",
      ],
    },
    {
      name: "Check Whether a Given Point Lies Inside a Triangle or Not",
      difficulty: "Easy",
      variation: "Area additivity as a containment test",
      link: "https://www.geeksforgeeks.org/check-whether-a-given-point-lies-inside-a-triangle-or-not/",
      question: [
        "Given three points A, B, C forming a triangle with non-zero area, and a fourth point P, determine whether P lies inside the triangle (points on the boundary count as inside).",
        "Example 1:\nInput: A = (0,0), B = (20,0), C = (10,30), P = (10,15)\nOutput: true\nExplanation: area(ABC) = 300, and area(PAB) + area(PBC) + area(PAC) = 150 + 75 + 75 = 300, so the three sub-triangles tile ABC exactly and P is inside.",
        "Example 2:\nInput: A = (0,0), B = (20,0), C = (10,30), P = (30,15)\nOutput: false\nExplanation: area(PAB) + area(PBC) + area(PAC) = 150 + 225 + 225 = 600, which exceeds area(ABC) = 300, so P lies outside.",
        "Constraints:\n- -10^6 <= every coordinate <= 10^6\n- All coordinates are integers\n- A, B, C are not collinear",
      ],
      code: `// twice the unsigned area of triangle (a, b, c)
long long area2(pair<long long,long long> a, pair<long long,long long> b, pair<long long,long long> c) {
    return llabs((b.first - a.first) * (c.second - a.second)
               - (c.first - a.first) * (b.second - a.second));
}

bool isInside(pair<long long,long long> a, pair<long long,long long> b,
              pair<long long,long long> c, pair<long long,long long> p) {
    long long total = area2(a, b, c);
    long long parts = area2(p, a, b) + area2(p, b, c) + area2(p, a, c);
    return total == parts;   // exact integer comparison, no epsilon needed
}`,
      explanation: [
        "If P is inside ABC, the three triangles PAB, PBC, PAC partition ABC, so their areas sum to exactly area(ABC). If P is outside, at least one of them spills over the boundary and the sum is strictly larger. So equality is both necessary and sufficient.",
        "Working in twice-area keeps everything in integers: each area2 is a cross product of integer differences, so the comparison total == parts is exact. This is the whole reason to prefer twice-area over area - it removes the epsilon question from a decision problem.",
        "A point exactly on an edge makes one of the three sub-triangles degenerate (area 0) and the other two still sum to the total, so the boundary is reported as inside. If you need the boundary excluded, check separately that no sub-area is 0.",
        "The alternative and slightly faster test is the sign test: compute the three signed cross products (B-A)x(P-A), (C-B)x(P-B), (A-C)x(P-C) and require they all share a sign (allowing zero). It avoids the three absolute values but you must handle the polygon's orientation, which the area-sum test does not care about.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Rectangle Area",
      difficulty: "Easy",
      variation: "Union area by inclusion-exclusion",
      link: "https://leetcode.com/problems/rectangle-area/",
      question: [
        "You are given the coordinates of two axis-aligned rectangles. The first has bottom-left corner (ax1, ay1) and top-right corner (ax2, ay2); the second has bottom-left (bx1, by1) and top-right (bx2, by2). Return the total area covered by the two rectangles, counting the overlapping region only once.",
        "Example 1:\nInput: ax1 = -3, ay1 = 0, ax2 = 3, ay2 = 4, bx1 = 0, by1 = -1, bx2 = 9, by2 = 2\nOutput: 45\nExplanation: The rectangles have areas 6 * 4 = 24 and 9 * 3 = 27. They overlap on x in [0,3] and y in [0,2], an area of 3 * 2 = 6, so the union is 24 + 27 - 6 = 45.",
        "Example 2:\nInput: ax1 = -2, ay1 = -2, ax2 = 2, ay2 = 2, bx1 = -2, by1 = -2, bx2 = 2, by2 = 2\nOutput: 16\nExplanation: The rectangles are identical, so the union is just one of them: 4 * 4 = 16.",
        "Constraints:\n- -10^4 <= all coordinates <= 10^4\n- ax1 <= ax2 and ay1 <= ay2, likewise for the second rectangle",
      ],
      code: `int computeArea(int ax1, int ay1, int ax2, int ay2,
                int bx1, int by1, int bx2, int by2) {
    long long areaA = (long long)(ax2 - ax1) * (ay2 - ay1);
    long long areaB = (long long)(bx2 - bx1) * (by2 - by1);
    // overlap of two intervals; clamp at 0 when they miss each other
    long long ow = max(0, min(ax2, bx2) - max(ax1, bx1));
    long long oh = max(0, min(ay2, by2) - max(ay1, by1));
    return (int)(areaA + areaB - ow * oh);
}`,
      explanation: [
        "Area is additive over disjoint pieces, so |A union B| = |A| + |B| - |A intersect B|. The only real work is the intersection.",
        "Two axis-aligned rectangles intersect in another axis-aligned rectangle, and the intersection separates by dimension: the x-extent of the overlap is the overlap of the two x-intervals, and likewise for y. That is why the width and height can be computed independently and multiplied.",
        "The trap is forgetting to clamp. If the x-intervals miss each other, min(ax2,bx2) - max(ax1,bx1) is negative; multiplying two negative extents gives a positive phantom overlap that gets subtracted from a union with no overlap at all. max(0, ...) on each dimension separately fixes it.",
        "This inclusion-exclusion trick does not scale: for k rectangles it needs 2^k terms. Beyond two or three rectangles, switch to the sweep-line union-area method used in the harder problems in this set.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Number of Integral Points Between Two Points",
      difficulty: "Easy",
      variation: "Lattice points on a segment via gcd",
      link: "https://www.geeksforgeeks.org/number-of-integral-points-between-two-points/",
      question: [
        "Given two distinct points with integer coordinates (p, q) and (r, s), count the number of points with integer coordinates that lie strictly between them on the straight line segment joining the two points (the endpoints themselves are not counted).",
        "Example 1:\nInput: (p, q) = (1, 9), (r, s) = (8, 16)\nOutput: 6\nExplanation: dx = 7 and dy = 7, so gcd = 7 and the segment is cut into 7 equal steps of (1, 1); the 6 interior cut points (2,10) through (7,15) are all integral.",
        "Example 2:\nInput: (p, q) = (2, 2), (r, s) = (5, 5)\nOutput: 2\nExplanation: dx = dy = 3, gcd = 3, so the interior integral points are (3,3) and (4,4).",
        "Constraints:\n- -10^9 <= p, q, r, s <= 10^9\n- The two points are distinct",
      ],
      code: `long long integralPointsBetween(long long p, long long q, long long r, long long s) {
    long long dx = llabs(r - p), dy = llabs(s - q);
    return gcd(dx, dy) - 1;   // gcd counts lattice steps, minus the far endpoint
}`,
      explanation: [
        "Let g = gcd(|dx|, |dy|). The direction vector (dx/g, dy/g) is primitive - its components share no common factor - and every lattice point on the segment is the start point plus an integer multiple of that primitive vector. There are exactly g + 1 such points including both endpoints, hence g - 1 strictly between.",
        "Why nothing finer can appear: a lattice point at fraction t along the segment needs t*dx and t*dy both integral, and the smallest such positive t is 1/g. Any denominator smaller than g would force a common divisor of dx and dy larger than g, a contradiction.",
        "Axis-parallel and degenerate cases fall out for free because gcd(k, 0) = k: a horizontal segment of length k has gcd(k, 0) = k and therefore k - 1 interior lattice points, which is right.",
        "This is the building block for the boundary count b in Pick's theorem: summing gcd(|dx|, |dy|) over all polygon edges counts every boundary lattice point exactly once, because each vertex is charged to exactly one of its two incident edges.",
        "Time: O(log(max coordinate)) for the gcd. Space: O(1).",
      ],
    },
    {
      name: "Convex Polygon",
      difficulty: "Medium",
      variation: "Orientation consistency from signed areas",
      link: "https://leetcode.com/problems/convex-polygon/",
      question: [
        "You are given the vertices of a polygon in order as points[i] = [xi, yi]. Adjacent vertices are joined by edges and the last vertex joins back to the first. The polygon is guaranteed to be simple (no edge crosses another) and no two consecutive vertices coincide. Return true if the polygon is convex, false otherwise.",
        "Example 1:\nInput: points = [[0,0],[0,5],[5,5],[5,0]]\nOutput: true\nExplanation: All four turns are right turns of 90 degrees, so every cross product has the same sign.",
        "Example 2:\nInput: points = [[0,0],[0,10],[10,10],[10,0],[5,5]]\nOutput: false\nExplanation: The extra vertex (5,5) pushes inward, so the turn at (10,0) has the opposite sign from the others - the polygon is concave there.",
        "Constraints:\n- 3 <= points.length <= 10^4\n- -10^4 <= xi, yi <= 10^4\n- The polygon is simple",
      ],
      code: `bool isConvex(vector<vector<int>>& points) {
    int n = points.size();
    long long prev = 0;   // sign of the last non-zero turn seen
    for (int i = 0; i < n; i++) {
        int a = i, b = (i + 1) % n, c = (i + 2) % n;
        long long dx1 = points[b][0] - points[a][0], dy1 = points[b][1] - points[a][1];
        long long dx2 = points[c][0] - points[b][0], dy2 = points[c][1] - points[b][1];
        long long cr = dx1 * dy2 - dy1 * dx2;   // twice the signed area of (a,b,c)
        if (cr != 0) {
            if (prev != 0 && ((cr > 0) != (prev > 0))) return false;   // turn direction flipped
            prev = cr;
        }
    }
    return true;
}`,
      explanation: [
        "The cross product of two consecutive edge vectors is twice the signed area of the triangle formed by the three vertices, and its sign is the turn direction at the middle vertex. A simple polygon is convex exactly when every turn goes the same way, so all non-zero signed areas must share one sign.",
        "You must walk all n triples with wraparound, not just the interior ones: the turns at the first and last vertices are just as capable of breaking convexity as any other.",
        "Zero cross products mean three collinear vertices. They must be skipped, not rejected - a straight-through vertex keeps the shape convex, and treating 0 as a sign would make almost every rectangle with a redundant midpoint fail. Equally, do not seed prev with the first cross product blindly; if that one happens to be 0 you have locked in a meaningless sign.",
        "Simplicity is what makes the local test sufficient. A self-intersecting star can have all turns the same sign yet not be convex, so this check is only valid under the problem's guarantee.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Area Rectangle II",
      difficulty: "Medium",
      variation: "Area of a rotated rectangle from a point set",
      link: "https://leetcode.com/problems/minimum-area-rectangle-ii/",
      question: [
        "You are given an array of points in the plane. Find the minimum area of any rectangle whose four corners are all points from the array. The rectangle's sides need not be parallel to the axes. If no rectangle can be formed, return 0. Answers within 1e-5 of the true value are accepted.",
        "Example 1:\nInput: points = [[1,2],[2,1],[1,0],[0,1]]\nOutput: 2.00000\nExplanation: The four points form a square tilted 45 degrees with side length sqrt(2), so its area is 2.",
        "Example 2:\nInput: points = [[0,1],[2,1],[1,1],[1,0],[2,0]]\nOutput: 1.00000\nExplanation: The points (1,0), (2,0), (2,1), (1,1) form a unit square of area 1.",
        "Constraints:\n- 1 <= points.length <= 50\n- -4 * 10^4 <= xi, yi <= 4 * 10^4\n- All points are distinct",
      ],
      code: `double minAreaFreeRect(vector<vector<int>>& points) {
    int n = points.size();
    set<pair<int,int>> have;
    for (auto& p : points) have.insert({p[0], p[1]});
    double best = -1.0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (j == i) continue;
            for (int k = 0; k < n; k++) {
                if (k == i || k == j) continue;
                long long ax = points[j][0] - points[i][0], ay = points[j][1] - points[i][1];
                long long bx = points[k][0] - points[i][0], by = points[k][1] - points[i][1];
                if (ax * bx + ay * by != 0) continue;   // need a right angle at i
                int fx = (int)(points[i][0] + ax + bx);  // the implied fourth corner
                int fy = (int)(points[i][1] + ay + by);
                if (!have.count({fx, fy})) continue;
                double area = sqrt((double)(ax * ax + ay * ay)) * sqrt((double)(bx * bx + by * by));
                if (best < 0 || area < best) best = area;
            }
        }
    return best < 0 ? 0.0 : best;
}`,
      explanation: [
        "Fix one corner i and two neighbours j and k. Those three points determine a rectangle if and only if the vectors i->j and i->k are perpendicular, which the integer dot product tests exactly. The fourth corner is then forced: it is i + (j-i) + (k-i), and the rectangle exists only if that point is in the set.",
        "Perpendicularity via the dot product is the key to staying in integers - no angles, no slopes, and therefore no division-by-zero special case for vertical sides. The only floating point enters at the very end when converting squared side lengths into an area.",
        "Multiplying two square roots is safer than sqrt of the product of the two squared lengths: with coordinates up to 4 * 10^4 each squared length reaches about 1.3 * 10^10, and their product overflows nothing in double but loses more mantissa than the two-root form.",
        "The tempting wrong shortcut is to only consider axis-aligned rectangles by grouping points by x or y. That solves the easier sibling problem and misses every tilted rectangle, including example 1.",
        "Return 0 rather than a sentinel when nothing is found, and note that at n <= 50 the O(n^3) scan is fine; the standard scaling alternative is to group point pairs by (midpoint, diagonal length), since two diagonals sharing both are exactly the diagonals of one rectangle.",
        "Time: O(n^3 log n) with the set lookups. Space: O(n).",
      ],
    },
    {
      name: "Polygon Lattice Points",
      difficulty: "Medium",
      variation: "Pick's theorem",
      link: "https://cses.fi/problemset/task/2193",
      question: [
        "Given a simple polygon whose n vertices all have integer coordinates, count the lattice points that lie strictly inside the polygon and the lattice points that lie on its boundary. Print the two counts, interior first.",
        "Example 1:\nInput:\n4\n1 1\n5 1\n5 3\n1 3\nOutput: 3 12\nExplanation: The rectangle spans x in [1,5] and y in [1,3], so twice its area is 16 and the boundary carries 4 + 2 + 4 + 2 = 12 lattice points. Pick's theorem gives interior = (16 - 12 + 2) / 2 = 3, namely (2,2), (3,2) and (4,2).",
        "Example 2:\nInput:\n3\n0 0\n3 0\n0 3\nOutput: 1 9\nExplanation: Twice the area is 9 and the boundary holds 3 + 3 + 3 = 9 lattice points, so interior = (9 - 9 + 2) / 2 = 1, namely (1,1).",
        "Constraints:\n- 3 <= n <= 1000\n- -10^6 <= x, y <= 10^6\n- The polygon is simple and all vertices are lattice points",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    long long twice = 0, boundary = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        twice += x[i] * y[j] - x[j] * y[i];
        // lattice points on edge i->j, counting only one of its two endpoints
        boundary += gcd(llabs(x[j] - x[i]), llabs(y[j] - y[i]));
    }
    twice = llabs(twice);
    long long inside = (twice - boundary + 2) / 2;   // Pick: A = i + b/2 - 1
    cout << inside << " " << boundary << "\\n";
    return 0;
}`,
      explanation: [
        "Pick's theorem says that for a simple lattice polygon, A = i + b/2 - 1, where A is the area, i the interior lattice count and b the boundary lattice count. Rearranged for the unknown i and written in terms of the exact integer S = 2A, this is i = (S - b + 2) / 2, which is why the shoelace sum should never be halved here.",
        "The boundary count is the sum over edges of gcd(|dx|, |dy|). That gcd counts the lattice points on the edge excluding one endpoint, so summing around the closed cycle charges each vertex to exactly one edge and counts every boundary point once - no double counting to correct.",
        "The parity is automatically right: S - b is always even for a lattice polygon, so the integer division is exact rather than truncating. If your computed value ever comes out odd, the bug is upstream - typically an unclosed polygon or a sign lost by taking absolute values term by term.",
        "The naive alternative - looping over every lattice point in the bounding box and running a point-in-polygon test - is up to 4 * 10^12 tests at these bounds. Pick's theorem replaces that with one linear pass.",
        "Time: O(n log C) where C bounds the coordinates. Space: O(n).",
      ],
    },
    {
      name: "Rectangle Area II",
      difficulty: "Hard",
      variation: "Union area by coordinate compression",
      link: "https://leetcode.com/problems/rectangle-area-ii/",
      question: [
        "You are given a list of axis-aligned rectangles, where rectangles[i] = [xi1, yi1, xi2, yi2] denotes the rectangle with bottom-left corner (xi1, yi1) and top-right corner (xi2, yi2). Return the total area covered by all the rectangles; any region covered by two or more rectangles must be counted only once. Since the answer may be huge, return it modulo 10^9 + 7.",
        "Example 1:\nInput: rectangles = [[0,0,2,2],[1,0,2,3],[1,0,3,1]]\nOutput: 6\nExplanation: The vertical strip x in [0,1] is covered for y in [0,2] (area 2), the strip x in [1,2] is covered for y in [0,3] (area 3), and the strip x in [2,3] is covered for y in [0,1] (area 1), totalling 6.",
        "Example 2:\nInput: rectangles = [[0,0,1000000000,1000000000]]\nOutput: 49\nExplanation: The true area is 10^18, and 10^18 mod (10^9 + 7) = 49.",
        "Constraints:\n- 1 <= rectangles.length <= 200\n- 0 <= xi1 <= xi2 <= 10^9 and 0 <= yi1 <= yi2 <= 10^9",
      ],
      code: `int rectangleArea(vector<vector<int>>& rectangles) {
    const long long MOD = 1000000007LL;
    vector<long long> xs;
    for (auto& r : rectangles) { xs.push_back(r[0]); xs.push_back(r[2]); }
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    long long ans = 0;
    for (size_t s = 0; s + 1 < xs.size(); s++) {
        long long x1 = xs[s], x2 = xs[s + 1];
        if (x2 == x1) continue;
        // inside this strip the covering set is constant, so it reduces to a 1D union
        vector<pair<long long,long long>> iv;
        for (auto& r : rectangles)
            if (r[0] <= x1 && x2 <= r[2] && r[1] < r[3]) iv.push_back({r[1], r[3]});
        sort(iv.begin(), iv.end());
        long long covered = 0, cur = LLONG_MIN;
        for (auto& [lo, hi] : iv) {
            if (lo > cur) { covered += hi - lo; cur = hi; }
            else if (hi > cur) { covered += hi - cur; cur = hi; }
        }
        ans = (ans + (x2 - x1) % MOD * (covered % MOD)) % MOD;
    }
    return (int)ans;
}`,
      explanation: [
        "Cut the plane along every rectangle's left and right edge. Inside one resulting vertical strip no rectangle starts or stops, so the set of rectangles covering that strip is fixed and the covered area is simply the strip width times the length of the 1D union of their y-intervals.",
        "That reduction is the whole idea: a 2D union problem becomes O(n) independent 1D union problems, and 1D union of intervals is a sort plus a single sweep tracking the rightmost covered endpoint.",
        "A rectangle belongs to a strip only if it spans the strip completely, hence the r[0] <= x1 && x2 <= r[2] test rather than a partial-overlap test. Strips are half-open, so degenerate rectangles with zero width or height contribute nothing and are skipped.",
        "The modulus is the classic trap. Reduce only at the end of each strip and never before comparing or accumulating interval lengths - a reduced coordinate would corrupt the 1D union. Also keep the running product in 64-bit: a strip can be 10^9 wide with 10^9 of coverage.",
        "Time: O(n^2 log n) for n rectangles. Space: O(n).",
      ],
    },
    {
      name: "Area of Rectangles (CSES)",
      difficulty: "Hard",
      variation: "Union area with a sweep line and segment tree",
      link: "https://cses.fi/problemset/task/1741",
      question: [
        "Given n axis-aligned rectangles, each described by the coordinates of its bottom-left corner (x1, y1) and top-right corner (x2, y2), calculate the total area of their union - regions covered by several rectangles are counted once.",
        "Example 1:\nInput:\n2\n0 0 2 2\n1 1 3 3\nOutput: 7\nExplanation: Each rectangle has area 4 and they overlap on the unit square x in [1,2], y in [1,2], so the union is 4 + 4 - 1 = 7.",
        "Example 2:\nInput:\n1\n-1 -1 1 1\nOutput: 4\nExplanation: A single 2 by 2 square has area 4.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^6 <= x1 < x2 <= 10^6\n- -10^6 <= y1 < y2 <= 10^6",
      ],
      code: `vector<long long> ys;   // compressed y coordinates
vector<int> cnt;         // how many active rectangles fully cover this node
vector<long long> cov;   // covered length inside this node

// tree node covers elementary intervals [l, r) i.e. y from ys[l] to ys[r]
void update(int node, int l, int r, int ql, int qr, int v) {
    if (qr <= l || r <= ql) return;
    if (ql <= l && r <= qr) cnt[node] += v;
    else {
        int mid = (l + r) / 2;
        update(2 * node, l, mid, ql, qr, v);
        update(2 * node + 1, mid, r, ql, qr, v);
    }
    // recompute without lazy propagation: a fully covered node knows its own length
    if (cnt[node] > 0) cov[node] = ys[r] - ys[l];
    else if (r - l == 1) cov[node] = 0;
    else cov[node] = cov[2 * node] + cov[2 * node + 1];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<array<long long,4>> rect(n);
    for (auto& q : rect) {
        cin >> q[0] >> q[1] >> q[2] >> q[3];
        ys.push_back(q[1]);
        ys.push_back(q[3]);
    }
    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());
    int m = ys.size();
    cnt.assign(4 * m, 0);
    cov.assign(4 * m, 0);
    // event: x, y-index range, +1 on the left edge and -1 on the right edge
    vector<array<long long,4>> ev;
    for (auto& q : rect) {
        int lo = lower_bound(ys.begin(), ys.end(), q[1]) - ys.begin();
        int hi = lower_bound(ys.begin(), ys.end(), q[3]) - ys.begin();
        ev.push_back({q[0], lo, hi, 1});
        ev.push_back({q[2], lo, hi, -1});
    }
    sort(ev.begin(), ev.end());
    long long ans = 0, prevX = ev.empty() ? 0 : ev[0][0];
    for (size_t i = 0; i < ev.size(); ) {
        long long x = ev[i][0];
        ans += cov[1] * (x - prevX);   // area swept since the previous event column
        while (i < ev.size() && ev[i][0] == x) {
            update(1, 0, m - 1, (int)ev[i][1], (int)ev[i][2], (int)ev[i][3]);
            i++;
        }
        prevX = x;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Sweep a vertical line left to right. Between two consecutive event x-values the set of active rectangles does not change, so the swept area is (x - prevX) times the total covered y-length at that moment. The only thing the data structure must maintain is that covered length under insertions and deletions of y-intervals.",
        "The segment tree is built over elementary intervals between consecutive compressed y-coordinates, so an inserted interval always aligns with node boundaries. Each node keeps cnt, the number of active rectangles covering the node entirely, and cov, the covered length inside it.",
        "This is the one segment tree that needs no lazy propagation, and the reason is the invariant: cov is recomputed on the way back up from cnt and the children. If cnt > 0 the node is fully covered regardless of its children, otherwise its coverage is exactly the sum of the children's. Because deletions only ever match an earlier insertion, cnt never goes negative and the invariant is preserved.",
        "Two traps. First, coordinates must be compressed in y but the covered length must be measured in original units - ys[r] - ys[l], never r - l. Second, all events at the same x must be applied before the next area contribution is taken, otherwise a rectangle that ends and one that begins at the same column will double count or drop a sliver.",
        "The answer can reach (2 * 10^6)^2 = 4 * 10^12, so it must be accumulated in a 64-bit integer.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
