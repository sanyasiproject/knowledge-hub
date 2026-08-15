import type { TopicContent } from "../types";

export const kadane: TopicContent = {
  quickSummary: [
    "Maintain `best_here` = the best subarray sum *ending exactly at `i`*, and `best` = the best seen anywhere. One pass, **O(n) time and O(1) space**.",
    "The reset rule is the whole algorithm: if the running sum before `i` is negative, it can only hurt, so start fresh at `a[i]`.",
    "Initialising `best = 0` silently breaks all-negative arrays — seed with `a[0]` instead.",
  ],
  detailed: [
    "Kadane is linear DP with the array thrown away. The state is `dp[i]` = the maximum sum of a subarray that *ends at index `i`*, and the transition is `dp[i] = max(a[i], dp[i-1] + a[i])` — either extend the previous subarray or start a new one here. The answer is `max` over all `dp[i]`, because every subarray ends somewhere. Since `dp[i]` reads only `dp[i-1]`, one scalar replaces the array.\n\nKey insight: `dp[i-1] + a[i] > a[i]` exactly when `dp[i-1] > 0`. So \"extend vs restart\" is really \"is the running sum still positive?\" — that is the reset rule.",
    "## The all-negative trap\n\nWith `best` initialised to `0`, an array like `[-5, -2, -9]` returns `0` — the sum of the empty subarray. That is correct only if the problem permits an empty selection. When at least one element must be chosen, initialise both `best_here` and `best` to `a[0]` and loop from `i = 1`.\n\nCommon mistake: writing `best_here = max(0, best_here + a[i])`. It bakes in the empty-subarray assumption and can never return a negative answer. Use `max(a[i], best_here + a[i])` and let the seed decide the semantics.",
    "## Recovering the indices\n\nTrack a tentative start. When the running sum restarts, the candidate start moves to `i`; when `best` improves, freeze that candidate as the real start and set the end to `i`. Two extra variables, still O(1) space.\n\nIn practice: keeping indices makes the reset rule visible during debugging — if the reported window disagrees with the sum, the reset branch is where the bug is.",
    "The same one-pass shape generalises: minimum subarray sum (flip the comparisons), maximum product subarray (carry both the running max and running min, since a negative flips them), and maximum circular subarray (`max(kadane, total − minSubarray)`, with the all-negative case handled separately).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Kadane with index recovery — O(n) time, O(1) space",
      source: `// Maximum sum over a NON-EMPTY contiguous subarray, plus its [l, r] range.
// Time O(n).  Space O(1).
struct Result { long long sum; int l, r; };

Result maxSubarray(const vector<int>& a) {
    int n = (int)a.size();
    // Seed with a[0], NOT 0 -- otherwise an all-negative array returns 0.
    long long bestHere = a[0], best = a[0];
    int curStart = 0, l = 0, r = 0;

    for (int i = 1; i < n; ++i) {
        if (bestHere < 0) {         // running sum hurts -> restart at i
            bestHere = a[i];
            curStart = i;
        } else {                    // extend the current subarray
            bestHere += a[i];
        }
        if (bestHere > best) {      // new global best: freeze the window
            best = bestHere;
            l = curStart;
            r = i;
        }
    }
    return {best, l, r};
}

// Note: 'bestHere < 0' is exactly the condition under which
// a[i] > bestHere + a[i], i.e. restarting beats extending.`,
    },
    {
      language: "cpp",
      caption: "Maximum product subarray — carry the running min as well",
      source: `// A negative element swaps max and min, so both must be tracked.
// Time O(n).  Space O(1).
long long maxProduct(const vector<int>& a) {
    long long best = a[0], curMax = a[0], curMin = a[0];
    for (size_t i = 1; i < a.size(); ++i) {
        long long x = a[i];
        long long prevMax = curMax, prevMin = curMin;
        curMax = max({x, prevMax * x, prevMin * x});  // prevMin*x wins if both negative
        curMin = min({x, prevMax * x, prevMin * x});
        best = max(best, curMax);
    }
    return best;
}
// Snapshot prevMax before overwriting curMax -- computing curMin from the
// already-updated curMax is the classic bug here.`,
    },
  ],
  cheatSheet: [
    "`bestHere = max(a[i], bestHere + a[i])`; `best = max(best, bestHere)`. O(n) time, O(1) space.",
    "Reset rule: restart at `a[i]` exactly when the running sum is negative.",
    "Non-empty subarray required ⇒ seed `best = bestHere = a[0]`, never 0.",
    "Indices: move a tentative start on reset, freeze `[l, r]` only when `best` improves.",
    "Product variant: track max *and* min, snapshot both before updating either.",
  ],
  interviewQA: [
    {
      q: "Derive Kadane's algorithm from a DP recurrence and state its complexity.",
      a: "I define `dp[i]` as the maximum sum of a subarray that ends exactly at index `i`. A subarray ending at `i` either consists of `a[i]` alone or is a subarray ending at `i-1` extended by `a[i]`, so `dp[i] = max(a[i], dp[i-1] + a[i])`, with `dp[0] = a[0]`. Every subarray ends at some index, so the answer is `max` over all `dp[i]`. That is O(n) time and O(n) space as written, but `dp[i]` reads only `dp[i-1]`, so I collapse the array to one scalar and get O(1) space. The simplification that gives Kadane its familiar form is noticing that `dp[i-1] + a[i]` beats `a[i]` precisely when `dp[i-1] > 0` — so instead of a max I can write: if the running sum went negative, drop it and restart at `a[i]`.",
      followUps: [
        "How do you recover the actual subarray, not just the sum?",
        "How would you adapt this to a circular array?",
      ],
    },
    {
      q: "What breaks when every element is negative, and how do you fix it?",
      a: "The common formulation initialises the answer to 0 and clamps the running sum with `max(0, running + a[i])`. On an all-negative array such as `[-5, -2, -9]` that returns 0, which corresponds to selecting the empty subarray. Whether that is a bug depends on the problem statement: if the empty subarray is allowed, 0 is right; if the subarray must be non-empty, the correct answer is -2, the largest single element. The fix is to remove the clamp and seed with the first element — set `bestHere = best = a[0]` and loop from index 1, using `bestHere = max(a[i], bestHere + a[i])`. That form never assumes an empty selection is available, so it is correct for both mixed and all-negative inputs. I always ask which convention the interviewer wants before writing the seed.",
      followUps: [
        "What does your version return for a single-element array?",
        "How does the circular variant handle the all-negative case?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Kadane's recurrence",
      back: "`dp[i] = max(a[i], dp[i-1] + a[i])` — best subarray ending at `i`. Answer = max over all `i`. O(n) time, O(1) space after rolling.",
    },
    {
      front: "Kadane's all-negative edge case",
      back: "Seeding `best = 0` returns the empty subarray's sum. For a required non-empty subarray, seed `best = bestHere = a[0]` and start the loop at `i = 1`.",
    },
    {
      front: "Maximum product subarray — why two running values?",
      back: "A negative element swaps the roles of max and min, so a large negative running min can become the new max. Track both, from pre-update snapshots.",
    },
  ],
};
