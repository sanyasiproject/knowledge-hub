import type { TopicContent } from "../types";

export const sweepLine: TopicContent = {
  quickSummary: [
    "Turn geometry into a 1-D timeline: emit **events**, sort them, then move a conceptual line across them while maintaining a small running state.",
    "The delta trick — `+1` at every start, `-1` at every end — converts 'how many intervals overlap' into a running sum.",
    "Cost is dominated by the sort: O(n log n) time, O(n) space for the event list.",
  ],
  detailed: [
    "The whole method is three lines: build events, sort, sweep. What varies between problems is only the state you carry as the line advances — a counter, a heap, a balanced set of active segments. Because everything is processed in sorted order, at any moment you only need to know about what is currently *active*, which is what turns an O(n^2) all-pairs comparison into O(n log n).",
    "## Sort key decides the answer\n\n| Problem | Sort by | Running state |\n|---|---|---|\n| Merge intervals | **start** | current merged interval |\n| Max overlap / meeting rooms | event time, ends before starts | integer counter |\n| Union of interval lengths | start | last covered position |\n| Skyline / rectangle area | x, with +h and -h events | multiset of active heights |\n\nCommon mistake: sorting merge-intervals by end time (that is the *greedy scheduling* key, not the merge key), or sorting max-overlap events so that a start at time t is processed before an end at time t. If a meeting ends exactly when the next begins, they do not overlap — process the `-1` first.",
    "## The +1 / -1 delta trick\nFor meeting rooms, forget the intervals and keep only `(start, +1)` and `(end, -1)`. Sort by time with `-1` winning ties, then scan accumulating the deltas; the maximum value the running sum ever reaches is the peak concurrency, i.e. the minimum number of rooms.\n\nFor example, meetings [0,30], [5,10], [15,20] give events (0,+1), (5,+1), (10,-1), (15,+1), (20,-1), (30,-1); the running sum peaks at 2, so two rooms suffice. O(n log n) time, O(n) space.",
    "## Merging and the closest-pair idea\nMerge intervals sorts by start and keeps one open interval: if the next start is ≤ the current end, extend the end to the max of the two; otherwise flush and open a new one. O(n log n) time, O(n) output, O(1) extra state.\n\nClosest pair of points is the same idea in 2-D: sweep left to right keeping the points within the current best distance `d` in a set ordered by y. For each new point you only compare against those within a `d`-tall strip — provably O(1) of them — so the sweep is O(n log n) rather than O(n^2). In practice: the sort dominates, and you shrink `d` as you go, which keeps the active set tiny.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Merge intervals — sort by start, one pass, O(n log n)",
      source: `#include <algorithm>
#include <vector>
using namespace std;

vector<pair<int,int>> mergeIntervals(vector<pair<int,int>> iv) {
    if (iv.empty()) return {};
    sort(iv.begin(), iv.end());          // by start, then end

    vector<pair<int,int>> out;
    out.push_back(iv[0]);
    for (size_t i = 1; i < iv.size(); ++i) {
        if (iv[i].first <= out.back().second) {   // touches or overlaps
            out.back().second = max(out.back().second, iv[i].second);
        } else {
            out.push_back(iv[i]);                 // gap: start a new interval
        }
    }
    return out;    // O(n log n) time (sort), O(n) output, O(1) extra state
}`,
    },
    {
      language: "cpp",
      caption: "Max overlapping intervals via +1/-1 deltas — minimum meeting rooms",
      source: `#include <algorithm>
#include <vector>
using namespace std;

// Peak concurrency = minimum rooms needed.
int maxOverlap(const vector<pair<int,int>>& iv) {
    vector<pair<int,int>> ev;            // {time, delta}
    ev.reserve(iv.size() * 2);
    for (const auto& [s, e] : iv) {
        ev.push_back({s, +1});
        ev.push_back({e, -1});
    }
    // Ties: -1 sorts before +1 because -1 < +1, so a meeting ending at t
    // frees its room before one starting at t claims it. [0,5] and [5,9]
    // therefore need only ONE room.
    sort(ev.begin(), ev.end());

    int cur = 0, best = 0;
    for (const auto& [time, delta] : ev) {
        cur += delta;
        best = max(best, cur);
    }
    return best;                         // O(n log n) time, O(n) space
}`,
    },
  ],
  comparison: {
    columns: ["Problem", "Sort key", "State carried", "Time", "Space"],
    rows: [
      ["Merge intervals", "start ascending", "current open interval", "O(n log n)", "O(n)"],
      ["Min meeting rooms", "time, -1 before +1", "running counter", "O(n log n)", "O(n)"],
      ["Max non-overlapping (greedy)", "end ascending", "last chosen end", "O(n log n)", "O(1)"],
      ["Skyline", "x, tallest start first", "multiset of heights", "O(n log n)", "O(n)"],
    ],
  },
  interviewQA: [
    {
      q: "Find the minimum number of meeting rooms required.",
      a: "Discard the pairing between starts and ends — you only need concurrency. Emit (start, +1) and (end, -1) for each meeting, sort by time with -1 breaking ties ahead of +1, then sweep accumulating the deltas and track the maximum the running sum reaches. That maximum is the peak number of simultaneous meetings, which equals the minimum rooms. O(n log n) time for the sort, O(n) space for the events. The tie-break is the whole correctness argument: if a meeting ends at time t and another starts at t, they do not overlap, so the -1 must be applied first or you would over-count by one. The alternative formulation — sort starts and ends into two arrays and two-pointer them — is equivalent.",
      followUps: [
        "How would you also report which meetings are in each room?",
        "What if intervals are given as half-open [s, e) versus closed [s, e]?",
      ],
    },
    {
      q: "Why does merge-intervals sort by start while interval scheduling sorts by end?",
      a: "They optimize different things. Merging must not miss any overlap, and sorting by start guarantees that once you pass an interval, no later interval can begin before it — so a single open interval is enough state and any overlap is caught by comparing the next start against the current end. Interval scheduling maximizes the count of non-overlapping picks, and the greedy exchange argument says to take the interval that frees the timeline soonest, which is the earliest finish time. Sorting merge by end would let you extend past an interval you have not merged yet; sorting scheduling by start would let one long early interval block many short ones. Both are O(n log n) time; merge needs O(n) for output, scheduling O(1) extra.",
      followUps: [
        "Which key does 'total length covered by the union of intervals' need?",
        "How do you handle intervals that merely touch, like [1,5] and [5,8]?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The three steps of a sweep line?",
      back: "Emit events, sort them, sweep while maintaining running state (counter, heap, or ordered set of active items). O(n log n) time dominated by the sort, O(n) space.",
    },
    {
      front: "The +1/-1 delta trick?",
      back: "Replace each interval with (start, +1) and (end, -1), sort by time with -1 first on ties, and scan the running sum. Its maximum is peak overlap = minimum meeting rooms.",
    },
    {
      front: "Merge intervals vs max non-overlapping — which sort key?",
      back: "Merge sorts by START (extend end = max(end, next.end) when next.start <= end). Max non-overlapping greedy sorts by END. Mixing them up is the classic error.",
    },
  ],
  cheatSheet: [
    "Sweep = build events → sort → linear scan with running state. O(n log n) time, O(n) space.",
    "Merge intervals: sort by start; overlap iff next.start <= cur.end; extend with max().",
    "Peak overlap: (start,+1) / (end,-1), sort with -1 first on ties, track max prefix sum.",
    "Max non-overlapping count: sort by END time instead — different problem, different key.",
    "Decide up front whether intervals are closed [s,e] or half-open [s,e) — it only changes the tie-break, but it changes the answer.",
  ],
};
