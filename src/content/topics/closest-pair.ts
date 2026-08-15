import type { TopicContent } from "../types";

export const closestPair: TopicContent = {
  quickSummary: [
    "**Divide and conquer**: split by x, recurse on both halves, then check only the strip of width `d` around the split line — O(n log n) time, O(n) space.",
    "The strip check is O(n) because a `d × 2d` rectangle holds at most a constant number of points that are already ≥ `d` apart — so each point compares against a bounded number of neighbours.",
    "A **sweep line with an ordered set** gives the same O(n log n) with far less code, and is what to write under interview time pressure.",
  ],
  detailed: [
    "## The recursion\n\nSort the points by x once. Split at the median into left and right halves and recurse, giving the best distance `d = min(dₗ, dᵣ)`. Any pair beating `d` must have one point in each half, and both must lie within horizontal distance `d` of the split line. Collect that **strip**, sort it by y, and compare each point only against the following points whose y-difference is under `d`.\n\nThe recurrence is `T(n) = 2T(n/2) + O(n)`, so `T(n) = O(n log n)` — provided the strip step really is linear.",
    "## Why the strip is O(n)\n\nConsider a point `p` in the strip and the `d × 2d` rectangle extending `d` upward from it, `d` to each side of the split line. Every point inside the left half of that rectangle is at least `d` from every other left point (that is what the recursion guarantees), and the same holds on the right. A `d × d` square can hold at most 4 points that are pairwise ≥ `d` apart, so the rectangle holds a small constant — the classic bound is 7 candidates after `p`.\n\nKey insight: the constant is what makes the strip scan linear rather than quadratic. The inner loop condition `(q.y - p.y)² < d²` is not an optimisation, it is the proof — remove it and the algorithm becomes O(n²) on clustered input.",
    "## Keeping the log out of the strip sort\n\nRe-sorting the strip by y at each level costs O(n log n) per level and O(n log² n) overall. The fix is to have each recursive call return its subarray sorted by y, then **merge** the two y-sorted halves in O(n) — mergesort's merge step, piggybacked on the recursion. That restores O(n log n) total. Space is O(n) for the scratch buffer plus O(log n) recursion stack.",
    "## The sweep-line alternative\n\nProcess points in increasing x, keeping the candidates within the current best distance `d` in a `std::set` ordered by (y, x). For each new point, evict from the front everything with `x < p.x - d`, then examine only set entries with y in `[p.y - d, p.y + d]` — again a constant number. Same **O(n log n) time, O(n) space**, and roughly a third of the code.\n\nIn practice: reach for the sweep line unless the interviewer explicitly asks for divide and conquer. It is easier to get right, and its constant factor is competitive.",
    "## Precision and overflow\n\nCompare **squared** distances throughout and never call `sqrt` until you print. With `|coord| ≤ 1e9` a squared distance reaches ~8e18, which fits in `long long` but leaves almost no headroom.\n\nWarning: `dx*dx + dy*dy` with coordinates beyond ~2e9 overflows silently. Either bound the input, use `__int128` for the comparison, or translate the coordinates to the origin first.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Divide and conquer with merged y-order — O(n log n) time, O(n) space",
      source: `struct P { long long x, y; };

long long dist2(const P& a, const P& b) {
    long long dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;                    // squared: exact, no sqrt
}

// a[lo, hi) is sorted by x on entry and left sorted by y on exit.
// Returns the minimum SQUARED distance within that range.
static long long solve(std::vector<P>& a, int lo, int hi, std::vector<P>& buf) {
    auto byY = [](const P& u, const P& v) { return u.y < v.y; };

    if (hi - lo <= 3) {                          // base case: brute force
        long long best = LLONG_MAX;
        for (int i = lo; i < hi; ++i)
            for (int j = i + 1; j < hi; ++j)
                best = std::min(best, dist2(a[i], a[j]));
        std::sort(a.begin() + lo, a.begin() + hi, byY);
        return best;
    }

    int mid = lo + (hi - lo) / 2;
    long long midX = a[mid].x;                   // capture BEFORE the y re-sort
    long long best = std::min(solve(a, lo, mid, buf), solve(a, mid, hi, buf));

    // Merge the two now-y-sorted halves in O(n): keeps the total at O(n log n).
    std::merge(a.begin() + lo, a.begin() + mid,
               a.begin() + mid, a.begin() + hi,
               buf.begin() + lo, byY);
    std::copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);

    // Strip: points within sqrt(best) horizontally of the split line, y-sorted.
    int m = 0;
    for (int i = lo; i < hi; ++i) {
        long long dx = a[i].x - midX;
        if (dx * dx < best) buf[lo + m++] = a[i];
    }

    // Each point compares against O(1) successors -- the y-window is the proof.
    for (int i = 0; i < m; ++i) {
        for (int j = i + 1; j < m; ++j) {
            long long dy = buf[lo + j].y - buf[lo + i].y;
            if (dy * dy >= best) break;          // DO NOT remove: this is the bound
            best = std::min(best, dist2(buf[lo + i], buf[lo + j]));
        }
    }
    return best;
}

long long closestPair2(std::vector<P> pts) {
    if (pts.size() < 2) return LLONG_MAX;
    std::sort(pts.begin(), pts.end(), [](const P& u, const P& v) {
        return u.x != v.x ? u.x < v.x : u.y < v.y;
    });
    std::vector<P> buf(pts.size());
    return solve(pts, 0, (int)pts.size(), buf);  // squared distance
}
// O(n log n) time, O(n) space + O(log n) stack.`,
    },
    {
      language: "cpp",
      caption: "Sweep line with std::set — same bound, much less code",
      source: `// Minimum squared distance by sweeping in x, keeping a y-ordered active window.
long long closestPairSweep(std::vector<P> pts) {
    int n = (int)pts.size();
    if (n < 2) return LLONG_MAX;

    std::sort(pts.begin(), pts.end(), [](const P& u, const P& v) {
        return u.x != v.x ? u.x < v.x : u.y < v.y;
    });

    auto byYX = [](const P& u, const P& v) {
        return u.y != v.y ? u.y < v.y : u.x < v.x;
    };
    std::set<P, decltype(byYX)> active(byYX);

    long long best = LLONG_MAX;
    int left = 0;

    for (int i = 0; i < n; ++i) {
        // Evict points too far behind in x to ever beat 'best'.
        while (left < i) {
            long long dx = pts[i].x - pts[left].x;
            if (dx * dx < best) break;
            active.erase(pts[left++]);
        }

        // 'best' bounds the y-window, so only O(1) entries are scanned.
        long long d = (long long)std::sqrt((long double)best) + 1;
        auto it = active.lower_bound({LLONG_MIN, pts[i].y - d});
        for (; it != active.end() && it->y <= pts[i].y + d; ++it)
            best = std::min(best, dist2(*it, pts[i]));

        active.insert(pts[i]);
    }
    return best;
}
// O(n log n) time, O(n) space. sqrt is used only to size the y-window,
// never in a distance comparison -- those stay exact in long long.`,
    },
  ],
  cheatSheet: [
    "Divide and conquer: sort by x, recurse on halves, scan the strip of half-width `d` around the split. O(n log n) time, O(n) space.",
    "Merge the y-order on the way back up; re-sorting the strip each level costs O(n log² n).",
    "The strip inner loop must `break` when `(Δy)² ≥ best` — that window is what bounds it to O(1) comparisons per point.",
    "Sweep line: x-ordered scan + `std::set` by (y, x), evict `x < p.x - d`, scan `y ∈ [p.y-d, p.y+d]`. Same bound, less code.",
    "Compare squared distances only. `|coord| ≤ 1e9` → `dist2` ≈ 8e18, near the `long long` ceiling.",
  ],
  interviewQA: [
    {
      q: "Why is the strip step of the closest-pair recursion O(n) and not O(n²)?",
      a: "Because of a packing argument. After both recursive calls, `d` is the minimum distance within each half. Take a strip point `p` and the rectangle of width `2d` (d either side of the split line) and height `d` above `p`. Every point of that rectangle lying in the left half is at least `d` from every other left point, by the recursion's guarantee, and the same holds on the right. A `d × d` square can contain at most 4 points that are pairwise at least `d` apart, so the whole `2d × d` rectangle contains at most a small constant — the standard bound is that `p` needs to be compared with at most 7 following points. Since the strip is sorted by y, those candidates are exactly the next few entries, and the loop stops as soon as the y-difference reaches `d`. So the scan is O(1) per point, O(n) per level, and the recurrence `T(n) = 2T(n/2) + O(n)` gives O(n log n). The `break` on the y-window is not an optimisation — it is the entire argument. Drop it and a clustered input makes the strip scan quadratic.",
      followUps: [
        "Why must the y-order be merged rather than re-sorted at each level?",
        "How does the argument change in three dimensions?",
      ],
    },
    {
      q: "Give an O(n log n) closest-pair solution that is not divide and conquer.",
      a: "A sweep line with an ordered set. Sort the points by x and sweep left to right, maintaining an active set of the points within the current best distance `d` behind the sweep, ordered by (y, x) in a `std::set`. For each new point `p` I first evict everything with `x < p.x - d` from the front of the sorted order — each point is inserted once and erased once, so that is O(n log n) total. Then I query the set for entries with y in `[p.y - d, p.y + d]` using `lower_bound`, and compare `p` against each. The same packing argument as the divide-and-conquer strip applies: that window is a `d × 2d` rectangle whose points are pairwise at least `d` apart, so it holds O(1) of them, and each query is O(log n) plus a constant scan. When a closer pair is found, `d` shrinks, which only tightens the window. Total O(n log n) time and O(n) space. I prefer it in an interview because it is about a third of the code, has no recursion or merge bookkeeping, and I can keep every distance comparison in exact squared integer arithmetic.",
      followUps: [
        "What happens to the bound if d never shrinks?",
        "Why order the set by (y, x) rather than y alone?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What is the closest-pair divide-and-conquer recurrence and result?",
      back: "Sort by x, recurse on halves, scan the strip of half-width d in O(n): T(n) = 2T(n/2) + O(n) = O(n log n) time, O(n) space.",
    },
    {
      front: "Why can each strip point stop after a constant number of comparisons?",
      back: "The candidates lie in a 2d × d rectangle whose points are pairwise ≥ d apart, so at most ~7 fit. The y-sorted loop breaks once (Δy)² ≥ best — that break is the proof, not an optimisation.",
    },
    {
      front: "What is the sweep-line alternative for closest pair?",
      back: "Sweep in x with a std::set ordered by (y, x); evict points with x < p.x - d, scan only y ∈ [p.y-d, p.y+d]. O(n log n) time, O(n) space, much shorter code.",
    },
  ],
};
