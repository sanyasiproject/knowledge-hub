import type { TopicContent } from "../types";

export const segmentIntersection: TopicContent = {
  quickSummary: [
    "Two segments cross **properly** when each one straddles the other's supporting line — four orientation signs, two strict sign flips.",
    "The **degenerate cases** are where implementations break: an endpoint lying on the other segment, and fully collinear overlap.",
    "The whole test is O(1) time and O(1) space, and stays exact in `long long` if you never compute the intersection point.",
  ],
  detailed: [
    "## The four orientation signs\n\nFor segments `[a, b]` and `[c, d]`, compute\n\n```\nd1 = sgn(cross(a, b, c))   d2 = sgn(cross(a, b, d))\nd3 = sgn(cross(c, d, a))   d4 = sgn(cross(c, d, b))\n```\n\nIf `d1·d2 < 0` **and** `d3·d4 < 0`, the segments cross at a single interior point — each segment has its endpoints strictly on opposite sides of the other's line. That is the proper-intersection case, and it needs no special handling.",
    "## The cases that actually break code\n\nAny zero among the four signs means an endpoint is collinear with the other segment. Collinear is not the same as touching: the point still has to lie *within* the other segment's extent. So for every zero sign you additionally run an on-segment check.\n\nThe cleanest on-segment test avoids min/max juggling: `q` lies on `[a, b]` when `cross(a, b, q) == 0` **and** `dot(a - q, b - q) <= 0` — the dot product is negative exactly when `q` sits strictly between the endpoints, and zero when it coincides with one.\n\nCommon mistake: returning `false` for collinear overlapping segments because all four cross products are zero and the strict straddle test fails. Two identical segments do intersect. The endpoint checks are what catch this.",
    "## Do you need the intersection point?\n\nUsually not — and not computing it is a real advantage, because the point is generally rational, so producing it forces you into doubles or fractions. If you do need it, parametrise `a + t·(b - a)` and solve with cross products:\n\n```\nt = cross(c - a, d - c) / cross(b - a, d - c)\n```\n\nThe denominator is zero exactly when the segments are parallel, which is your collinear/no-intersection branch.\n\nWarning: with `|coord| ≤ 1e9` the numerator and denominator each reach ~4e18 — right at the edge of `long long`. If you need the point, either keep it as an exact fraction, or scale down the coordinates first.",
    "## Complexity\n\nA single pair test is **O(1) time, O(1) space**. Testing all pairs among n segments is O(n²); if you need *any* intersection among n segments, use the Bentley–Ottmann sweep line at **O((n + k) log n)** for k reported intersections, or O(n log n) just to detect whether one exists.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Full segment intersection test — handles collinear and touching cases",
      source: `struct P { long long x, y; };
P operator-(const P& a, const P& b) { return {a.x - b.x, a.y - b.y}; }
long long cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
long long cross(const P& o, const P& a, const P& b) { return cross(a - o, b - o); }
long long dot(const P& a, const P& b) { return a.x * b.x + a.y * b.y; }
int sgn(long long v) { return (v > 0) - (v < 0); }

// q on segment [a, b], endpoints included. Assumes nothing; checks collinearity too.
bool onSegment(const P& a, const P& b, const P& q) {
    return cross(a, b, q) == 0 && dot(a - q, b - q) <= 0;
}

// Do [a,b] and [c,d] share at least one point? Degenerate segments allowed.
bool segmentsIntersect(const P& a, const P& b, const P& c, const P& d) {
    int d1 = sgn(cross(a, b, c));
    int d2 = sgn(cross(a, b, d));
    int d3 = sgn(cross(c, d, a));
    int d4 = sgn(cross(c, d, b));

    // Proper crossing: each segment straddles the other's line.
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;

    // Touching / collinear-overlap: some endpoint lies on the other segment.
    if (d1 == 0 && onSegment(a, b, c)) return true;
    if (d2 == 0 && onSegment(a, b, d)) return true;
    if (d3 == 0 && onSegment(c, d, a)) return true;
    if (d4 == 0 && onSegment(c, d, b)) return true;

    return false;
}
// O(1) time, O(1) space. Fully exact in long long for |coord| <= ~1e9.`,
    },
    {
      language: "cpp",
      caption: "Strict crossing only, plus the collinear-overlap classifier",
      source: `// True only for a single crossing point in the interior of BOTH segments.
bool crossesProperly(const P& a, const P& b, const P& c, const P& d) {
    return sgn(cross(a, b, c)) * sgn(cross(a, b, d)) < 0 &&
           sgn(cross(c, d, a)) * sgn(cross(c, d, b)) < 0;
}

// Are the two segments collinear AND overlapping in more than a point?
bool collinearOverlap(const P& a, const P& b, const P& c, const P& d) {
    if (cross(a, b, c) != 0 || cross(a, b, d) != 0) return false;   // not collinear
    // Project onto the dominant axis and test interval overlap.
    auto lo = [](long long u, long long v) { return u < v ? u : v; };
    auto hi = [](long long u, long long v) { return u > v ? u : v; };
    bool useX = (a.x != b.x) || (c.x != d.x);
    long long a1 = useX ? lo(a.x, b.x) : lo(a.y, b.y);
    long long a2 = useX ? hi(a.x, b.x) : hi(a.y, b.y);
    long long b1 = useX ? lo(c.x, d.x) : lo(c.y, d.y);
    long long b2 = useX ? hi(c.x, d.x) : hi(c.y, d.y);
    return lo(a2, b2) > hi(a1, b1);      // strict: shared interval has length > 0
}
// Both O(1) time, O(1) space.`,
    },
  ],
  diagrams: [
    {
      title: "Segment intersection decision path",
      kind: "flow",
      caption: "Four orientation signs first; every zero sign routes to an on-segment check.",
      mermaid: `flowchart TD
  S["Compute d1..d4 = sgn(cross)"] --> Q1{"d1*d2 < 0 and d3*d4 < 0 ?"}
  Q1 -- yes --> T1["Proper crossing: intersect"]
  Q1 -- no --> Q2{"any di == 0 ?"}
  Q2 -- no --> F["No intersection"]
  Q2 -- yes --> Q3{"that endpoint on the other segment ?"}
  Q3 -- yes --> T2["Touching or collinear overlap: intersect"]
  Q3 -- no --> F`,
    },
  ],
  cheatSheet: [
    "Proper crossing: `sgn(cross(a,b,c))·sgn(cross(a,b,d)) < 0` AND `sgn(cross(c,d,a))·sgn(cross(c,d,b)) < 0`.",
    "Any zero sign → run `onSegment`; that is the only way collinear overlap and touching endpoints are caught.",
    "`onSegment(a,b,q)` = `cross(a,b,q) == 0 && dot(a-q, b-q) <= 0`.",
    "Avoid computing the intersection point — it is rational; the boolean test stays exact in integers.",
    "Pair test O(1)/O(1); all intersections among n segments via sweep line O((n + k) log n).",
  ],
  interviewQA: [
    {
      q: "Write and justify a segment intersection test that handles all degenerate cases.",
      a: "I compute four orientation signs: `d1 = sgn(cross(a,b,c))`, `d2 = sgn(cross(a,b,d))`, `d3 = sgn(cross(c,d,a))`, `d4 = sgn(cross(c,d,b))`. If `d1·d2 < 0` and `d3·d4 < 0`, each segment has its endpoints strictly on opposite sides of the other's supporting line, so they must cross at exactly one interior point — that is the clean case. Everything else involves a zero sign, meaning some endpoint is collinear with the other segment. Collinearity alone is not enough; the point must also lie inside that segment's extent, so for each zero I run `onSegment`, which I implement as `cross(a,b,q) == 0 && dot(a-q, b-q) <= 0`. The dot product is non-positive exactly when `q` is between the endpoints or equal to one. Those four checks cover a shared endpoint, a T-junction, partial collinear overlap, one segment contained in the other, and degenerate zero-length segments. The whole thing is O(1) and, crucially, stays in exact integer arithmetic because I never compute the intersection point.",
      followUps: [
        "Which case does the strict straddle test alone get wrong?",
        "How would you extend this to report the intersection as a segment when they overlap?",
      ],
    },
    {
      q: "How do you find all intersections among n segments faster than O(n²)?",
      a: "A Bentley–Ottmann sweep line. A vertical line sweeps left to right, and I maintain the segments it currently cuts, ordered by their y-coordinate at the sweep position, in a balanced BST. An event queue holds segment left endpoints, right endpoints and discovered intersection points, ordered by x. On a left endpoint I insert the segment and test it against its new neighbours; on a right endpoint I remove it and test the two segments that become adjacent; on an intersection I report it, swap the two segments in the order, and test each against its new neighbour. The invariant that makes it work is that two segments must become adjacent in the sweep order at some point before they intersect, so testing only neighbours is sufficient. That gives O((n + k) log n) time for k intersections and O(n + k) space. The practical difficulties are all degeneracies — vertical segments, three or more segments through one point, shared endpoints — which are handled by a careful event comparator, and by exact arithmetic or rational intersection coordinates rather than doubles, since a misordered event corrupts the whole sweep.",
      followUps: [
        "Why is testing only adjacent pairs in the sweep order sufficient?",
        "What breaks if the event ordering uses doubles?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What is the strict (proper) segment crossing test?",
      back: "sgn(cross(a,b,c))·sgn(cross(a,b,d)) < 0 AND sgn(cross(c,d,a))·sgn(cross(c,d,b)) < 0 — each segment straddles the other's line. O(1) time and space.",
    },
    {
      front: "Which segment-intersection cases does the strict test miss?",
      back: "Everything with a zero orientation sign: shared endpoints, T-junctions, and collinear overlap. Each needs an explicit onSegment check.",
    },
    {
      front: "How do you test whether q lies on segment [a, b] using integers only?",
      back: "cross(a, b, q) == 0 (collinear) AND dot(a - q, b - q) <= 0 (between the endpoints, inclusive).",
    },
  ],
};
