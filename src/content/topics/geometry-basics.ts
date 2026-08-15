import type { TopicContent } from "../types";

export const geometryBasics: TopicContent = {
  quickSummary: [
    "A point and a vector are the same struct; subtraction turns two points into the vector between them.",
    "The **cross product sign** is the primitive: `cross(o, a, b) > 0` means `o → a → b` turns left (counter-clockwise), `< 0` right, `= 0` collinear.",
    "Keep coordinates in `long long` and every predicate exact — floating point is the single biggest source of wrong geometry answers.",
  ],
  detailed: [
    "## Points and vectors\n\nOne struct does both jobs. A point is a position, a vector is a displacement, and `b - a` converts the first into the second. Everything downstream — orientation, area, intersection, hulls — is built from two products on those vectors.\n\n- **Dot product** `a·b = ax·bx + ay·by` measures alignment. Positive means the vectors point the same general way, zero means perpendicular, negative means opposing. It also gives `|a|² = a·a`, which is how you compare distances without a square root.\n- **Cross product** (the 2D scalar version) `a×b = ax·by - ay·bx` measures signed area. Its magnitude is the area of the parallelogram spanned by `a` and `b`; its sign says whether `b` is counter-clockwise from `a`.",
    "## Orientation is the one predicate that matters\n\nDefine `cross(o, a, b) = (a - o) × (b - o)`. Its sign classifies the turn at `o`:\n\n| Sign | Meaning |\n| --- | --- |\n| `> 0` | counter-clockwise / left turn / `b` is left of ray `o→a` |\n| `< 0` | clockwise / right turn |\n| `= 0` | `o`, `a`, `b` are collinear |\n\nKey insight: convex hull, segment intersection, point-in-polygon and polygon area are all just this sign, applied in different loops. Get the convention right once and reuse it everywhere.",
    "## Integer versus floating point\n\nIf the input coordinates are integers, never convert them. `long long` arithmetic makes every orientation test exact, so there are no epsilons, no tie-break ambiguity, and no results that flip when the compiler reorders a multiply.\n\nWarning: with coordinates up to 1e9, a single `cross` term reaches 1e18 and the difference can reach 2e18 — inside `long long` (≈9.2e18) but far outside `int` (2.1e9). An `int` cross product is the classic silent-overflow bug.\n\nWhen doubles are unavoidable (rotations, circle intersections, real-valued inputs), compare against a tolerance scaled to your coordinate magnitude rather than a bare `1e-9`, and never test `x == y` on a computed coordinate.",
    "## Distances without square roots\n\nComparing `|p - q|` is the same as comparing `|p - q|²`, and the squared form stays in integers. Reserve `sqrt` for the final printed answer.\n\nCommon mistake: sorting points by `sqrt(dx*dx + dy*dy)` — it costs more, loses exactness, and can make a comparator inconsistent, which is undefined behaviour in `std::sort`.",
  ],
  code: [
    {
      language: "cpp",
      caption: "The geometry header every other topic reuses — exact, integer-only",
      source: `struct P {
    long long x, y;
};

P operator+(const P& a, const P& b) { return {a.x + b.x, a.y + b.y}; }
P operator-(const P& a, const P& b) { return {a.x - b.x, a.y - b.y}; }
bool operator==(const P& a, const P& b) { return a.x == b.x && a.y == b.y; }

// Alignment. Zero => perpendicular.
long long dot(const P& a, const P& b) { return a.x * b.x + a.y * b.y; }

// Signed parallelogram area of a and b. Sign => orientation of b relative to a.
long long cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }

// THE primitive: turn direction at o when walking o -> a -> b.
//  > 0 counter-clockwise (left turn)
//  < 0 clockwise (right turn)
//  = 0 collinear
long long cross(const P& o, const P& a, const P& b) {
    return cross(a - o, b - o);
}

int sgn(long long v) { return (v > 0) - (v < 0); }

long long dist2(const P& a, const P& b) {
    long long dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;          // squared: stays exact, no sqrt
}
// All O(1) time, O(1) space. Exact for |coord| <= ~2e9 in long long.`,
    },
    {
      language: "cpp",
      caption: "Derived predicates built purely from the orientation sign",
      source: `bool isCCW(const P& o, const P& a, const P& b) { return cross(o, a, b) > 0; }

bool collinear(const P& a, const P& b, const P& c) { return cross(a, b, c) == 0; }

// Is q on segment [a, b]? Collinear AND inside the bounding box.
bool onSegment(const P& a, const P& b, const P& q) {
    return cross(a, b, q) == 0 && dot(a - q, b - q) <= 0;
}

// Twice the signed area of triangle abc. Halve for the real area;
// keep the doubled integer form whenever you only need a comparison.
long long twiceArea(const P& a, const P& b, const P& c) {
    return cross(a, b, c);
}

// Sort points counter-clockwise around the origin (upper half-plane first).
bool angleLess(const P& a, const P& b) {
    auto half = [](const P& p) { return (p.y < 0 || (p.y == 0 && p.x < 0)) ? 1 : 0; };
    if (half(a) != half(b)) return half(a) < half(b);
    long long c = cross(a, b);
    if (c != 0) return c > 0;
    return dist2({0, 0}, a) < dist2({0, 0}, b);   // ties: nearer first
}
// Each predicate O(1); an angular sort is O(n log n) time, O(1) extra space.`,
    },
  ],
  cheatSheet: [
    "`cross(o,a,b) = (a-o) × (b-o)`; sign > 0 = CCW/left turn, < 0 = CW/right turn, 0 = collinear.",
    "`dot > 0` same direction, `= 0` perpendicular, `< 0` opposite. `|a|² = dot(a,a)`.",
    "Use `long long` for coordinates: |coord| ≤ 1e9 makes cross terms ≤ 1e18, safe; `int` overflows silently.",
    "Compare `dist2`, never `sqrt` — exact, faster, and keeps comparators strict-weak.",
    "Doubles only when forced; then use a relative epsilon and never `==` on a computed value.",
  ],
  interviewQA: [
    {
      q: "Why is the 2D cross product the fundamental primitive in computational geometry?",
      a: "Because almost every geometric question reduces to a turn direction. `cross(o, a, b) = (a-o) × (b-o)` is a single expression whose sign tells you whether walking `o → a → b` turns left, turns right, or goes straight, and whose magnitude is twice the triangle's area. Convex hull keeps or pops a candidate based on that sign. Segment intersection is four orientation tests. Point-in-polygon uses it to decide which side of an edge the query point falls on. Polygon area is the sum of cross products of consecutive vertices. Using one predicate everywhere means one convention to get right and one place to worry about overflow, instead of scattered ad-hoc slope or division logic — and slopes are exactly what you want to avoid, because vertical edges divide by zero.",
      followUps: [
        "How does the sign of the cross product relate to the sign of the shoelace sum?",
        "What changes if the polygon is given clockwise instead of counter-clockwise?",
      ],
    },
    {
      q: "When should you use floating point in geometry code, and how do you stay safe if you must?",
      a: "Only when the problem genuinely produces irrational values — rotations, circle-line intersections, real-valued input, or a final distance you have to print. If the inputs are integers, every predicate I need (orientation, on-segment, area comparison, distance comparison) can be evaluated exactly in `long long`, so I keep them there. When doubles are unavoidable I do three things. First, I bound the magnitudes and pick an epsilon relative to the coordinate scale, not a fixed `1e-9`, because absolute tolerances are meaningless at 1e9. Second, I make every comparison go through one `sgn(double)` helper so the tolerance is defined in exactly one place, which also keeps sort comparators consistent. Third, I avoid operations that amplify error — division by a near-zero determinant, subtracting two nearly equal large numbers — by rearranging into cross products where possible. The failure mode of getting this wrong is nasty: an inconsistent comparator or a hull that self-intersects, producing wrong answers only on degenerate inputs.",
      followUps: [
        "What does an inconsistent comparator do to std::sort?",
        "How would you handle rational coordinates exactly without floating point?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What does the sign of cross(o, a, b) tell you?",
      back: "The turn at o when walking o → a → b: positive = counter-clockwise (left), negative = clockwise (right), zero = collinear. Its magnitude is twice the triangle's area.",
    },
    {
      front: "Why store coordinates in long long rather than int?",
      back: "A cross product multiplies two coordinates. With |coord| up to 1e9 the terms reach 1e18 and the difference 2e18 — fine in long long (~9.2e18), a silent overflow in int (2.1e9).",
    },
    {
      front: "How do you compare distances between points without sqrt?",
      back: "Compare squared distances, dx*dx + dy*dy. Monotone in the true distance, exact in integers, and cheaper. Only take sqrt for the final output.",
    },
  ],
};
