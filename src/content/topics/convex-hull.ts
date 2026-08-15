import type { TopicContent } from "../types";

export const convexHull: TopicContent = {
  quickSummary: [
    "**Andrew's monotone chain**: sort points by (x, y), then sweep once left-to-right for the lower hull and once right-to-left for the upper hull.",
    "**O(n log n) time** — dominated by the sort; the two sweeps are O(n) amortised. **O(n) space** for the output stack.",
    "The pop condition encodes the **collinear-point policy**: `cross(...) <= 0` drops points on hull edges, `< 0` keeps them.",
  ],
  detailed: [
    "## Monotone chain in one idea\n\nSort the points lexicographically by x then y. The leftmost and rightmost points are certainly hull vertices, and they split the hull into a **lower chain** and an **upper chain**. Each chain is monotone in x, so it can be built by a single left-to-right stack sweep: push each point, and while the last three make a non-left turn, pop the middle one.\n\nThe lower hull is that sweep over the sorted points; the upper hull is the same sweep over the reversed order. Concatenate, dropping the duplicated endpoints, and you have the hull in counter-clockwise order.",
    "## Why it is O(n log n)\n\nThe sort is O(n log n). Each sweep pushes every point once and pops it at most once, so both sweeps together are O(n) — the inner `while` loop is amortised, not nested cost. Total **O(n log n) time, O(n) space**, and if the points arrive pre-sorted the hull itself is linear.\n\nKey insight: the sort is the whole cost. Any hull algorithm that avoids sorting — like Chan's O(n log h), where h is the hull size — only pays off when the hull is far smaller than the input.",
    "## The collinear policy is a decision, not a detail\n\nThe pop condition is where you choose what to do with points lying exactly on a hull edge:\n\n| Condition | Effect |\n| --- | --- |\n| `cross(h[k-2], h[k-1], p) <= 0` | pops collinear points → **minimal** hull, vertices only |\n| `cross(h[k-2], h[k-1], p) < 0` | keeps collinear points → every boundary point retained |\n\nUse `<= 0` by default: a minimal vertex set is what rotating calipers, hull diameter and most downstream algorithms expect. Use `< 0` only when the problem explicitly asks for all points on the boundary.\n\nWarning: with `< 0` you must also deduplicate the input, or two identical points produce a zero cross product that never pops and the hull degenerates. The `<= 0` variant is far more forgiving.",
    "## Degenerate inputs\n\nFewer than 3 distinct points, all points collinear, and duplicate points are the cases that break naive implementations. Deduplicate after sorting — one `std::unique` call — and return early when fewer than 3 distinct points remain. With `<= 0` popping, a fully collinear set correctly collapses to its two extreme points.\n\nIn practice: the hull is a preprocessing step. Once you have it in CCW order you get O(log n) point location, O(n) rotating-calipers diameter and width, and Minkowski sums — all of which assume a minimal, correctly-wound vertex list.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Andrew's monotone chain — CCW output, collinear points removed",
      source: `struct P { long long x, y; };
P operator-(const P& a, const P& b) { return {a.x - b.x, a.y - b.y}; }
long long cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
long long cross(const P& o, const P& a, const P& b) { return cross(a - o, b - o); }

// Returns the hull in counter-clockwise order, first vertex not repeated.
// Policy: cross(...) <= 0 pops, so points lying ON a hull edge are DROPPED.
// Switch both comparisons to < 0 to KEEP collinear boundary points.
std::vector<P> convexHull(std::vector<P> p) {
    std::sort(p.begin(), p.end(), [](const P& a, const P& b) {
        return a.x != b.x ? a.x < b.x : a.y < b.y;
    });
    p.erase(std::unique(p.begin(), p.end(), [](const P& a, const P& b) {
        return a.x == b.x && a.y == b.y;
    }), p.end());

    int n = (int)p.size();
    if (n < 3) return p;                       // 0, 1 or 2 distinct points

    std::vector<P> h(2 * n);
    int k = 0;

    // Lower hull: left to right.
    for (int i = 0; i < n; ++i) {
        while (k >= 2 && cross(h[k - 2], h[k - 1], p[i]) <= 0) --k;
        h[k++] = p[i];
    }

    // Upper hull: right to left. 't' protects the lower hull from being popped.
    for (int i = n - 2, t = k + 1; i >= 0; --i) {
        while (k >= t && cross(h[k - 2], h[k - 1], p[i]) <= 0) --k;
        h[k++] = p[i];
    }

    h.resize(k - 1);                           // drop the repeated start point
    return h;
}
// O(n log n) time (the sort), O(n) space. Exact in long long for |coord| <= 1e9.`,
    },
    {
      language: "cpp",
      caption: "Rotating calipers on the hull — diameter in O(n)",
      source: `long long dist2(const P& a, const P& b) {
    long long dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

// Squared diameter (farthest pair) of a point set, given its CCW hull.
// The farthest pair is always a pair of hull vertices.
long long hullDiameter2(const std::vector<P>& h) {
    int n = (int)h.size();
    if (n < 2) return 0;
    if (n == 2) return dist2(h[0], h[1]);

    long long best = 0;
    for (int i = 0, j = 1; i < n; ++i) {
        // Advance the antipodal vertex while it increases the supporting area.
        while (cross(h[i], h[(i + 1) % n], h[(j + 1) % n]) >
               cross(h[i], h[(i + 1) % n], h[j])) {
            j = (j + 1) % n;
        }
        best = std::max({best, dist2(h[i], h[j]), dist2(h[(i + 1) % n], h[j])});
    }
    return best;
}
// O(n) time, O(1) extra space on top of the hull. Requires the MINIMAL CCW hull,
// which is why the <= 0 collinear policy matters.`,
    },
  ],
  diagrams: [
    {
      title: "Monotone chain construction",
      kind: "flow",
      caption: "One sort, two identical stack sweeps in opposite directions.",
      mermaid: `flowchart TD
  A["Sort points by x, then y"] --> B["Deduplicate"]
  B --> C{"fewer than 3 distinct ?"}
  C -- yes --> D["Return the points as-is"]
  C -- no --> E["Lower hull: sweep left to right"]
  E --> F["Upper hull: sweep right to left"]
  F --> G["Concatenate, drop repeated endpoints"]
  G --> H["CCW hull, O(n log n)"]`,
    },
  ],
  cheatSheet: [
    "Monotone chain: sort by (x, y) → lower hull sweep → upper hull sweep → concatenate. Output is CCW.",
    "O(n log n) time (sort dominates; sweeps are O(n) amortised), O(n) space.",
    "Pop while `cross(h[k-2], h[k-1], p) <= 0` → minimal hull; use `< 0` to keep collinear boundary points.",
    "`t = k + 1` before the upper sweep stops it from eating the lower hull.",
    "Always deduplicate after sorting and early-return on fewer than 3 distinct points.",
  ],
  interviewQA: [
    {
      q: "Explain Andrew's monotone chain and prove its O(n log n) bound.",
      a: "Sort the points lexicographically by x then y. The leftmost and rightmost points are hull vertices, and they split the hull boundary into a lower chain and an upper chain, each monotone in x. That monotonicity is what makes a single stack sweep sufficient: process the sorted points left to right, push each one, and while the top two stack entries plus the new point form a non-left turn — `cross(h[k-2], h[k-1], p) <= 0` — pop the middle entry, because it cannot be a hull vertex. Repeat over the reversed order for the upper chain, using a floor index so the second sweep cannot pop the first chain, then concatenate and drop the duplicated endpoints. For the bound: the sort is O(n log n); in each sweep every point is pushed exactly once and popped at most once, so the total work in the `while` loops is O(n) amortised even though it is written as a nested loop. Total O(n log n) time and O(n) space, and O(n) if the input is already sorted. It is the algorithm I reach for over gift wrapping, which is O(nh) and degrades to O(n²) when most points are on the hull.",
      followUps: [
        "Why does the upper sweep need the t = k + 1 floor?",
        "When is Chan's O(n log h) algorithm actually worth it?",
      ],
    },
    {
      q: "What is your policy for points lying exactly on a hull edge, and what breaks if you get it wrong?",
      a: "It is a deliberate choice encoded in one comparison. With `cross(...) <= 0` as the pop condition, a collinear point produces a zero cross product, gets popped, and the hull contains only true corner vertices. With `< 0` it survives and every boundary point is retained. My default is `<= 0`, because downstream algorithms assume a minimal vertex set: rotating calipers walks antipodal pairs and can stall or double-count if three consecutive vertices are collinear; O(log n) convex point location binary-searches on strictly turning wedges; and Minkowski sums merge edge direction lists that must be strictly increasing in angle. The `< 0` variant is also fragile — duplicate input points give a zero cross product that never pops, so the stack fills with copies and the hull is wrong, which is why deduplication after the sort is mandatory there. I only switch to `< 0` when the problem statement explicitly asks for all points on the boundary, and I say so in a comment, because the two versions differ by one character and produce silently different output.",
      followUps: [
        "How does a collinear triple break rotating calipers?",
        "What does the hull return for input that is entirely collinear?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Outline Andrew's monotone chain and its complexity.",
      back: "Sort by (x, y), deduplicate, sweep left-to-right for the lower hull and right-to-left for the upper hull popping on non-left turns, concatenate. O(n log n) time (sort dominates), O(n) space, CCW output.",
    },
    {
      front: "What does changing the hull pop condition from <= 0 to < 0 do?",
      back: "`<= 0` pops collinear points, giving the minimal hull of true vertices. `< 0` keeps every point lying on a hull edge — and then duplicate input points must be removed or the sweep never pops them.",
    },
    {
      front: "Why is the monotone chain's inner while loop not a nested O(n²)?",
      back: "Each point is pushed exactly once and popped at most once per sweep, so all pops total O(n) amortised. The O(n log n) comes entirely from the initial sort.",
    },
  ],
};
