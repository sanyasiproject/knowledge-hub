import type { TopicContent } from "../types";

export const pointInPolygon: TopicContent = {
  quickSummary: [
    "**Ray casting**: shoot a ray from the query point, count boundary crossings — odd means inside. O(n) time, O(1) space.",
    "The **winding number** counts signed turns instead of parity; it agrees with ray casting on simple polygons and is the correct answer for self-intersecting ones.",
    "A **convex** polygon allows binary search: O(log n) per query after an O(n) (or O(n log n)) preprocessing pass.",
  ],
  detailed: [
    "## Ray casting and the parity rule\n\nFire a ray from the query point `q` — conventionally straight along `+x` — and count how many polygon edges it crosses. Each crossing flips you between outside and inside, so an odd count means inside. The correctness argument is just that: the polygon boundary separates the plane, and infinity is outside.\n\nThe implementation danger is the ray passing exactly through a vertex, which would otherwise be counted twice or zero times. The standard fix is a **half-open rule**: an edge counts only if exactly one endpoint is strictly above `q.y`, written `(a.y > q.y) != (b.y > q.y)`. Each vertex then belongs to exactly one of its two edges, and horizontal edges are skipped entirely.\n\nKey insight: decide which side the crossing falls on with a cross product, not by computing the intersection's x-coordinate. Division introduces floating point and a divide-by-zero on horizontal edges; the orientation sign has neither problem.",
    "## Boundary points\n\nRay casting gives an arbitrary answer for points exactly on the boundary — which way it falls depends on which edge you happen to hit. If \"on the boundary\" matters, test it explicitly *before* the parity loop with the standard on-segment predicate, and return your chosen convention.\n\nCommon mistake: assuming the parity loop reports boundary points consistently. It does not; two logically identical polygons with different vertex orderings can disagree.",
    "## Winding number\n\nInstead of parity, sum the signed number of times the boundary wraps around `q`. Walking the edges, add +1 each time an edge crosses the horizontal ray upward with `q` to its left, and −1 for a downward crossing with `q` to its right. Non-zero winding means inside.\n\nFor a simple polygon the two rules agree. They diverge on **self-intersecting** polygons: a doubly-wound region has winding 2 (inside) but even parity (outside). Graphics APIs expose both as the \"non-zero\" and \"even-odd\" fill rules for exactly this reason. The cost is identical — O(n) time, O(1) space — so on self-intersecting input prefer winding.",
    "## Convex polygons in O(log n)\n\nWith a convex polygon given counter-clockwise, fix `p[0]` as a pivot. The rays `p[0]→p[1] … p[0]→p[n-1]` fan the polygon into `n-2` triangles in angular order. Two orientation tests reject `q` if it is outside the fan entirely; otherwise binary search for the wedge containing `q`, then a single orientation test against that wedge's outer edge decides.\n\n**O(log n) time and O(1) space per query**, after an O(n) check that the polygon is CCW (or O(n log n) if you must build the hull first). This is the right structure whenever you have many queries against one fixed convex region.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Ray casting with the half-open rule — exact, no division",
      source: `struct P { long long x, y; };
P operator-(const P& a, const P& b) { return {a.x - b.x, a.y - b.y}; }
long long cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
long long cross(const P& o, const P& a, const P& b) { return cross(a - o, b - o); }
long long dot(const P& a, const P& b) { return a.x * b.x + a.y * b.y; }

bool onSegment(const P& a, const P& b, const P& q) {
    return cross(a, b, q) == 0 && dot(a - q, b - q) <= 0;
}

// Returns: 1 = strictly inside, 0 = on the boundary, -1 = strictly outside.
// Works for any simple polygon, convex or concave, either winding.
int pointInPolygon(const std::vector<P>& poly, const P& q) {
    int n = (int)poly.size();
    bool inside = false;

    for (int i = 0, j = n - 1; i < n; j = i++) {
        const P& a = poly[j];
        const P& b = poly[i];

        if (onSegment(a, b, q)) return 0;          // boundary, decided up front

        // Half-open rule: exactly one endpoint strictly above q.
        // Horizontal edges fail this and are skipped, as they must be.
        if ((a.y > q.y) != (b.y > q.y)) {
            // q is left of the directed line a->b iff cross > 0.
            // The ray (+x) crosses this edge iff that side matches the edge direction.
            bool goingUp = b.y > a.y;
            if ((cross(a, b, q) > 0) == goingUp) inside = !inside;
        }
    }
    return inside ? 1 : -1;
}
// O(n) time, O(1) space. Fully exact: no division, no epsilon.`,
    },
    {
      language: "cpp",
      caption: "Winding number, and O(log n) location in a CCW convex polygon",
      source: `// Non-zero winding => inside. Differs from parity on self-intersecting polygons.
int windingNumber(const std::vector<P>& poly, const P& q) {
    int n = (int)poly.size(), w = 0;
    for (int i = 0, j = n - 1; i < n; j = i++) {
        const P& a = poly[j];
        const P& b = poly[i];
        if (a.y <= q.y) {
            if (b.y > q.y && cross(a, b, q) > 0) ++w;      // upward, q on the left
        } else {
            if (b.y <= q.y && cross(a, b, q) < 0) --w;     // downward, q on the right
        }
    }
    return w;                                              // w != 0 => inside
}
// O(n) time, O(1) space.

// poly must be CONVEX and counter-clockwise, no three collinear vertices.
// 1 = inside, 0 = on boundary, -1 = outside.
int inConvexPolygon(const std::vector<P>& poly, const P& q) {
    int n = (int)poly.size();
    if (n < 3) return -1;

    // Outside the fan spanned by p[0]->p[1] and p[0]->p[n-1]?
    if (cross(poly[0], poly[1], q) < 0)     return -1;
    if (cross(poly[0], poly[n - 1], q) > 0) return -1;

    // Binary search for the wedge [lo, lo+1] containing q.
    int lo = 1, hi = n - 1;
    while (hi - lo > 1) {
        int mid = lo + (hi - lo) / 2;
        if (cross(poly[0], poly[mid], q) >= 0) lo = mid;
        else                                   hi = mid;
    }

    long long side = cross(poly[lo], poly[lo + 1], q);
    if (side < 0) return -1;
    if (side == 0) return 0;                                 // on the outer edge
    // Inside the wedge; still on the boundary if it lies on a fan ray.
    if (cross(poly[0], poly[1], q) == 0 && lo == 1)          return 0;
    if (cross(poly[0], poly[n - 1], q) == 0 && lo == n - 2)  return 0;
    return 1;
}
// O(log n) time, O(1) space per query.`,
    },
  ],
  cheatSheet: [
    "Ray casting: count crossings with `(a.y > q.y) != (b.y > q.y)`; odd = inside. O(n) time, O(1) space.",
    "Decide the crossing side with `cross(a, b, q)`, never by solving for the intersection x.",
    "Handle boundary points explicitly first — parity is arbitrary on the boundary.",
    "Winding number ≠ 0 = inside; equals parity on simple polygons, differs on self-intersecting ones.",
    "Convex + CCW: fan from `p[0]`, binary search the wedge → O(log n) per query.",
  ],
  interviewQA: [
    {
      q: "Implement point-in-polygon and explain how you handle a ray passing through a vertex.",
      a: "I use ray casting along `+x` with a half-open crossing rule. An edge from `a` to `b` counts only when `(a.y > q.y) != (b.y > q.y)`. That comparison treats the horizontal band as half-open — the lower endpoint belongs to the edge, the upper does not — so a vertex shared by two edges is counted by exactly one of them, and the double-count and zero-count failures both disappear. Horizontal edges automatically fail the test, which is correct because the ray running along an edge has no well-defined crossing. To decide whether the crossing is to the right of `q` I use the orientation sign rather than computing an intersection coordinate: `q` is left of the directed line `a→b` iff `cross(a, b, q) > 0`, and I compare that against whether the edge goes up or down. That keeps the whole routine in exact integer arithmetic — no division, no epsilon, no divide-by-zero on vertical or horizontal edges. Finally, I test the boundary explicitly before the loop, because parity is genuinely undefined there. The result is O(n) time and O(1) space.",
      followUps: [
        "Why does computing the intersection x-coordinate introduce bugs?",
        "How would you answer many queries against the same polygon faster?",
      ],
    },
    {
      q: "When does the winding-number rule disagree with the even-odd rule, and which should you use?",
      a: "They agree on every simple polygon, because a non-self-intersecting boundary wraps any interior point exactly once, so winding is ±1 and parity is odd together. They diverge when the boundary self-intersects. In a figure-eight or a star drawn with a single overlapping stroke, a region wrapped twice has winding 2 — non-zero, so the winding rule calls it inside — but two crossings means even parity, so the even-odd rule calls it outside. These are exactly the `nonzero` and `evenodd` fill rules in SVG and Canvas, and the difference is visible as a hollow versus filled star centre. My default is the winding number: it is the same O(n) time and O(1) space, it is what \"enclosed by the curve\" actually means, and it does not depend on the polygon being simple. I would deliberately pick even-odd only when matching a specification that requires it, such as reproducing a renderer's fill behaviour.",
      followUps: [
        "How do you compute the winding number without trigonometry?",
        "Which rule does a self-intersecting star's centre count as filled?",
      ],
    },
  ],
  flashcards: [
    {
      front: "State the ray-casting crossing condition and why it is half-open.",
      back: "An edge counts iff (a.y > q.y) != (b.y > q.y). Half-open assigns each vertex to exactly one of its two edges, avoiding double-counting, and skips horizontal edges.",
    },
    {
      front: "When do winding number and even-odd parity disagree?",
      back: "Only on self-intersecting polygons. A doubly-wound region has winding 2 (inside) but even parity (outside) — SVG's nonzero versus evenodd fill rules.",
    },
    {
      front: "How do you test point-in-polygon in O(log n)?",
      back: "Only for a convex CCW polygon: fan from p[0], reject with two orientation tests, binary search for the containing wedge, then one orientation test on that wedge's outer edge. O(1) space.",
    },
  ],
};
