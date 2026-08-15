import type { TopicContent } from "../types";

export const polygonArea: TopicContent = {
  quickSummary: [
    "The **shoelace formula** gives the area of any simple polygon in O(n): sum the cross products of consecutive vertices and halve.",
    "The sum's **sign carries the orientation** — positive means the vertices are listed counter-clockwise, negative clockwise.",
    "**Pick's theorem** links a lattice polygon's area to its lattice points: `A = I + B/2 - 1`, where `B` is a sum of gcds along the edges.",
  ],
  detailed: [
    "## The shoelace formula\n\nFor vertices `p₀ … pₙ₋₁` in order around a simple polygon,\n\n```\n2·A_signed = Σ cross(pᵢ, pᵢ₊₁)   (indices mod n)\n```\n\nEach term is twice the signed area of the triangle `origin, pᵢ, pᵢ₊₁`. Triangles that face away cancel the ones that face toward, so the sum collapses to exactly twice the polygon's signed area regardless of where the origin sits or whether the polygon is convex.\n\nKey insight: keep the doubled integer value `2A` and only divide at the end. With integer coordinates `2A` is always an exact integer, so the whole computation stays in `long long` — and Pick's theorem needs `2A`, not `A`.",
    "## Sign gives orientation for free\n\nA positive sum means counter-clockwise, negative means clockwise. That single number is the cheapest orientation test there is, and many algorithms depend on a known winding: convex point-location assumes CCW, and outward normals flip with the winding. Normalising is one line — if the sum is negative, reverse the vertex list.\n\nCommon mistake: taking `abs` too early. Once you have discarded the sign you have thrown away the orientation, and any later code that assumed CCW input silently misbehaves.",
    "## Pick's theorem\n\nFor a **simple polygon whose vertices are all lattice points**:\n\n| Symbol | Meaning |\n| --- | --- |\n| `A` | area |\n| `I` | lattice points strictly inside |\n| `B` | lattice points on the boundary |\n\n`A = I + B/2 - 1`, so `I = (2A - B + 2) / 2`.\n\nThe boundary count is computed edge by edge: the segment from `a` to `b` contains `gcd(|Δx|, |Δy|)` lattice points if you count one endpoint per edge, so `B = Σ gcd(|Δx|, |Δy|)` over all edges. Combine with the shoelace `2A` and you get the interior count in O(n log C) time, where C bounds the coordinates.\n\nWarning: Pick's theorem requires integer vertices and a non-self-intersecting boundary. It says nothing about polygons with holes unless you adjust the constant, and it is simply false for non-lattice vertices.",
    "## Complexity\n\nShoelace is **O(n) time, O(1) extra space**. Pick's theorem adds one gcd per edge: **O(n log C) time, O(1) space**. Both are single passes — there is no reason to build extra structures.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Shoelace — returns twice the signed area, exact in integers",
      source: `struct P { long long x, y; };
long long cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }

// Twice the SIGNED area. > 0 => vertices are counter-clockwise.
long long twiceSignedArea(const std::vector<P>& poly) {
    int n = (int)poly.size();
    long long s = 0;
    for (int i = 0; i < n; ++i)
        s += cross(poly[i], poly[(i + 1) % n]);
    return s;                       // real area = |s| / 2.0
}

bool isCounterClockwise(const std::vector<P>& poly) {
    return twiceSignedArea(poly) > 0;
}

// Normalise winding so downstream code can assume CCW.
void makeCCW(std::vector<P>& poly) {
    if (twiceSignedArea(poly) < 0)
        std::reverse(poly.begin(), poly.end());
}
// O(n) time, O(1) space. With |coord| <= 1e9 and n <= 1e6 the sum fits in long long.`,
    },
    {
      language: "cpp",
      caption: "Pick's theorem — boundary and interior lattice point counts",
      source: `// Lattice points ON the boundary: one gcd per edge (each endpoint counted once).
long long boundaryLatticePoints(const std::vector<P>& poly) {
    int n = (int)poly.size();
    long long b = 0;
    for (int i = 0; i < n; ++i) {
        const P& a = poly[i];
        const P& c = poly[(i + 1) % n];
        b += std::gcd(std::llabs(a.x - c.x), std::llabs(a.y - c.y));
    }
    return b;
}

// Pick:  A = I + B/2 - 1   =>   I = (2A - B + 2) / 2
long long interiorLatticePoints(const std::vector<P>& poly) {
    long long twoA = std::llabs(twiceSignedArea(poly));
    long long b    = boundaryLatticePoints(poly);
    return (twoA - b + 2) / 2;      // 2A and B share parity, so this is exact
}
// O(n log C) time, O(1) space. Requires a SIMPLE polygon with integer vertices.`,
    },
  ],
  cheatSheet: [
    "`2A_signed = Σ cross(p[i], p[i+1])` over all edges, indices mod n. Area = |sum| / 2.",
    "Sum > 0 → counter-clockwise, < 0 → clockwise. Reverse the vector to normalise.",
    "Pick: `A = I + B/2 - 1`, so `I = (2A - B + 2)/2` — integer vertices, simple polygon only.",
    "`B = Σ gcd(|Δx|, |Δy|)` over edges.",
    "Shoelace O(n)/O(1); Pick O(n log C)/O(1). Keep `2A` as an integer, halve only at output.",
  ],
  interviewQA: [
    {
      q: "Derive the shoelace formula and explain why it works for concave polygons.",
      a: "Pick any origin O and fan the polygon into triangles `O, pᵢ, pᵢ₊₁`. Each triangle's signed area is `cross(pᵢ, pᵢ₊₁) / 2`, where the sign depends on whether the edge is traversed counter-clockwise or clockwise as seen from O. Summing over all edges, the regions covered by triangles that face away from the polygon get counted with a negative sign and exactly cancel the excess from the positive ones, leaving the polygon's signed area. Nothing in that argument needs convexity — it only needs the boundary to be a closed, non-self-intersecting loop, so it holds for concave polygons and for any choice of origin, including one outside the polygon. In code I keep `2A` as a `long long` sum of cross products, which is exact for integer input, and only divide by two at the very end.",
      followUps: [
        "What does the formula return for a self-intersecting polygon?",
        "How would you compute the centroid with the same loop?",
      ],
    },
    {
      q: "You are given a lattice polygon and must count the integer points strictly inside it. How?",
      a: "Pick's theorem. It states `A = I + B/2 - 1` for a simple polygon with integer vertices, so `I = (2A - B + 2) / 2`. I compute `2A` with the shoelace formula as an exact `long long`, take its absolute value so the winding does not matter, and compute `B` by summing `gcd(|Δx|, |Δy|)` over the edges — that gcd is exactly the number of lattice points on a segment when you count one endpoint per edge, which makes the sum count each vertex once. `2A` and `B` always share parity for a lattice polygon, so the final division is exact and there is no rounding. Total cost is O(n log C) time and O(1) extra space. The preconditions matter: integer vertices and a non-self-intersecting boundary. If those do not hold I would fall back to explicit counting or decomposition.",
      followUps: [
        "Why does a segment from a to b contain gcd(|Δx|,|Δy|) + 1 lattice points inclusive?",
        "How does Pick's theorem change for a polygon with holes?",
      ],
    },
  ],
  flashcards: [
    {
      front: "State the shoelace formula and what its sign means.",
      back: "2·A_signed = Σ cross(p[i], p[i+1]) over all edges (mod n). Positive sum = counter-clockwise vertex order, negative = clockwise. O(n) time, O(1) space.",
    },
    {
      front: "State Pick's theorem and its preconditions.",
      back: "A = I + B/2 - 1 for a simple polygon with all vertices at lattice points. I = interior lattice points, B = boundary lattice points = Σ gcd(|Δx|, |Δy|) over edges.",
    },
    {
      front: "Why keep 2A instead of A?",
      back: "With integer coordinates 2A is always an exact integer, so the whole shoelace stays in long long. Pick's rearrangement I = (2A - B + 2)/2 also needs the doubled form.",
    },
  ],
};
