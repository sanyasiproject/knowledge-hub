import type { TopicContent } from "../types";

export const monotonicStack: TopicContent = {
  quickSummary: [
    "Keep a stack whose values stay sorted; before pushing, pop everything that violates the order — those pops are exactly the answers to next-greater / previous-smaller.",
    "Every element is pushed once and popped once, so the total cost is O(n) time and O(n) space despite the inner `while` loop.",
    "The deque variant (monotonic queue) gives sliding-window maximum in O(n) time and O(k) space.",
  ],
  detailed: [
    "The stack stores *pending* elements — ones whose answer is not yet known. For next-greater-element you keep a **decreasing** stack of indices. When a new value arrives that is larger than the top, that new value is the answer for the top, so pop it and record. Repeat until the order is restored, then push the new index. Anything left on the stack at the end has no next greater element.\n\nKey insight: the inner while loop looks like it makes this quadratic, but each index enters the stack once and leaves once. Total pops ≤ n, so the whole scan is O(n) time and O(n) space.",
    "## Which direction to keep\n\n| Want | Scan | Stack order | Pop while |\n|---|---|---|---|\n| Next greater | left → right | decreasing | `a[st.top()] < a[i]` |\n| Next smaller | left → right | increasing | `a[st.top()] > a[i]` |\n| Previous greater | left → right | decreasing | pop, then top is the answer |\n| Previous smaller | left → right | increasing | pop, then top is the answer |\n\nOne scan can answer both directions at once: when you pop index `t` because of `i`, then `i` is `t`'s next-smaller/greater **and** the new stack top is `t`'s previous one.",
    "## Largest rectangle in a histogram\nFor each bar, the widest rectangle of that bar's height extends until the first strictly shorter bar on each side. That is previous-smaller and next-smaller — exactly what an increasing monotonic stack produces. Maintain increasing heights; when bar `i` is shorter than the top, pop `t` and its rectangle is `h[t] × (i - st.top() - 1)`, with width `i` when the stack empties.\n\nCommon mistake: forgetting to drain the stack after the loop. Append a sentinel bar of height 0 (or run a second pass) so every remaining bar gets popped and measured. Total: O(n) time, O(n) space, versus O(n^2) for the brute-force expand-around-each-bar.",
    "## Monotonic deque for sliding-window maximum\nThe queue variant adds eviction from the front. Keep indices in a deque with **decreasing** values.\n\n1. Pop from the **front** while the front index has slid out of the window (`front <= i - k`).\n2. Pop from the **back** while `a[back] <= a[i]` — a smaller older element can never be the max again.\n3. Push `i` at the back; once `i >= k - 1`, the front is the window's maximum.\n\nO(n) time (each index enters and leaves once), O(k) space — beating a multiset's O(n log k).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Next greater element — decreasing stack of indices, O(n) time / O(n) space",
      source: `#include <stack>
#include <vector>
using namespace std;

// res[i] = value of the first element right of i that is greater than a[i],
// or -1 if none exists.
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> res(n, -1);
    stack<int> st;                      // indices, values strictly decreasing

    for (int i = 0; i < n; ++i) {
        // a[i] resolves every pending index whose value it exceeds.
        while (!st.empty() && a[st.top()] < a[i]) {
            res[st.top()] = a[i];
            st.pop();
        }
        st.push(i);
    }
    // Whatever remains has no greater element to its right; already -1.
    return res;                         // each index pushed/popped once => O(n)
}`,
    },
    {
      language: "cpp",
      caption: "Largest rectangle in histogram + sliding-window maximum",
      source: `#include <deque>
#include <stack>
#include <vector>
#include <algorithm>
using namespace std;

// Increasing stack: popping bar t gives its maximal width span.
long long largestRectangle(vector<int> h) {
    h.push_back(0);                       // sentinel drains the stack
    stack<int> st;
    long long best = 0;

    for (int i = 0; i < (int)h.size(); ++i) {
        while (!st.empty() && h[st.top()] >= h[i]) {
            int height = h[st.top()];
            st.pop();
            // Left edge is the new top (previous smaller); right edge is i.
            int width = st.empty() ? i : i - st.top() - 1;
            best = max(best, 1LL * height * width);
        }
        st.push(i);
    }
    return best;                          // O(n) time, O(n) space
}

// Monotonic deque: indices with strictly decreasing values.
vector<int> slidingWindowMax(const vector<int>& a, int k) {
    vector<int> out;
    deque<int> dq;

    for (int i = 0; i < (int)a.size(); ++i) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();  // slid out
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) out.push_back(a[dq.front()]);            // window max
    }
    return out;                           // O(n) time, O(k) space
}`,
    },
  ],
  comparison: {
    columns: ["Problem", "Structure", "Time", "Space", "Naive alternative"],
    rows: [
      ["Next greater / smaller", "Monotonic stack", "O(n)", "O(n)", "O(n^2) double loop"],
      ["Largest rectangle in histogram", "Increasing stack", "O(n)", "O(n)", "O(n^2) expand per bar"],
      ["Sliding-window maximum", "Monotonic deque", "O(n)", "O(k)", "O(n log k) multiset"],
      ["Daily temperatures / stock span", "Decreasing stack", "O(n)", "O(n)", "O(n^2) scan right"],
    ],
  },
  interviewQA: [
    {
      q: "Why is a monotonic stack O(n) when it has a nested while loop?",
      a: "Amortized analysis. Each index is pushed exactly once, and once popped it is never pushed again, so across the entire outer loop the total number of pop operations is at most n. The inner while loop can run many times on one iteration and zero times on many others, but the sum over all iterations is bounded by n. Total work is O(n) pushes plus O(n) pops, giving O(n) time. Space is O(n) for the stack in the worst case — a strictly increasing input for a decreasing stack means nothing is ever popped until the end.",
      followUps: [
        "How would you also recover the previous-smaller element in the same pass?",
        "What changes if you need next greater-or-equal instead of strictly greater?",
      ],
    },
    {
      q: "Solve largest rectangle in a histogram and justify the width formula.",
      a: "Maintain a stack of indices with increasing heights. When bar i is shorter than the stack top t, bar t's rectangle can extend no further right than i-1, and no further left than the element below t on the stack (the previous strictly smaller bar). So the width is i - st.top() - 1 after popping t, or i if the stack became empty (t was the global minimum so far and extends to index 0). Multiply by h[t] and track the maximum. Push a sentinel bar of height 0 at the end so every bar gets popped and measured. O(n) time by the push-once/pop-once argument, O(n) space. Brute force expanding around each bar is O(n^2).",
      followUps: [
        "How does this extend to maximal rectangle in a binary matrix?",
        "Why does using >= vs > when popping equal heights not break the answer?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Which stack order for next-greater-element, and what is the complexity?",
      back: "A decreasing stack of indices; pop while a[top] < a[i] and the popped index's answer is a[i]. O(n) time (push-once/pop-once), O(n) space.",
    },
    {
      front: "Width formula when popping bar t in largest-rectangle?",
      back: "width = i - st.top() - 1 after popping (or i if the stack is now empty); area = h[t] * width. Push a height-0 sentinel so the stack fully drains.",
    },
    {
      front: "Sliding-window maximum in O(n)?",
      back: "Monotonic deque of indices with decreasing values: pop_front if front <= i - k, pop_back while a[back] <= a[i], push i, then a[front] is the max once i >= k-1. O(n) time, O(k) space.",
    },
  ],
  cheatSheet: [
    "Store indices, not values — you almost always need distances.",
    "Next greater: decreasing stack, pop while a[top] < a[i]. Next smaller: increasing stack, flip the comparison.",
    "One pop gives two answers: i is the popped element's next-smaller, the new top is its previous-smaller.",
    "Histogram: increasing stack + height-0 sentinel; width = i - top - 1, or i if empty.",
    "Window max: deque, evict stale front by index, evict dominated back by value — O(n) time, O(k) space.",
  ],
};
