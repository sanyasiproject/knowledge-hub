import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Range Sum Query - Mutable",
      difficulty: "Easy",
      variation: "Point update, range sum - the template",
      link: "https://leetcode.com/problems/range-sum-query-mutable/",
      question: [
        "Design a data structure over an integer array nums that supports two operations interleaved in any order: update(index, val) sets nums[index] = val, and sumRange(left, right) returns the sum of nums[left..right] inclusive.",
        "Both operations must be fast enough that thousands of updates and thousands of queries can be mixed freely, so recomputing a prefix-sum array after every update is not acceptable.",
        "Example 1:\nInput: nums = [1, 3, 5]; sumRange(0, 2); update(1, 2); sumRange(0, 2)\nOutput: 9, then 8\nExplanation: 1 + 3 + 5 = 9. After nums becomes [1, 2, 5] the same range sums to 1 + 2 + 5 = 8.",
        "Example 2:\nInput: nums = [1, 2, 5] (state after the update above); sumRange(1, 2)\nOutput: 7\nExplanation: 2 + 5 = 7 - a query that does not start at index 0, so no single prefix sum answers it.",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -100 <= nums[i] <= 100\n- 0 <= index < nums.length, 0 <= left <= right < nums.length\n- At most 3 * 10^4 calls to update and sumRange combined",
      ],
      code: `class NumArray {
    int n;
    vector<int> t;

    void build(int node, int l, int r, vector<int>& a) {
        if (l == r) { t[node] = a[l]; return; }
        int mid = (l + r) / 2;
        build(2 * node, l, mid, a);
        build(2 * node + 1, mid + 1, r, a);
        t[node] = t[2 * node] + t[2 * node + 1];
    }

    void upd(int node, int l, int r, int i, int v) {
        if (l == r) { t[node] = v; return; }
        int mid = (l + r) / 2;
        if (i <= mid) upd(2 * node, l, mid, i, v);
        else upd(2 * node + 1, mid + 1, r, i, v);
        t[node] = t[2 * node] + t[2 * node + 1];   // pull the child values back up
    }

    int qry(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;            // disjoint: contribute the identity
        if (ql <= l && r <= qr) return t[node];    // fully covered: use the stored value
        int mid = (l + r) / 2;
        return qry(2 * node, l, mid, ql, qr) + qry(2 * node + 1, mid + 1, r, ql, qr);
    }

public:
    NumArray(vector<int>& nums) : n(nums.size()), t(4 * nums.size(), 0) {
        build(1, 0, n - 1, nums);
    }

    void update(int index, int val) { upd(1, 0, n - 1, index, val); }

    int sumRange(int left, int right) { return qry(1, 0, n - 1, left, right); }
};`,
      explanation: [
        "The tree is an implicit binary tree over index ranges: node 1 owns [0, n-1], and a node owning [l, r] splits into children owning [l, mid] and [mid+1, r]. Each node caches the aggregate of its own range, so the array is summarised at every scale at once.",
        "A query decomposes [ql, qr] into O(log n) fully-covered nodes. The recursion proves it: at each level the query boundary can only cut through at most two nodes, so at most two nodes per level are partially covered and get expanded further. Everything else returns immediately as covered or disjoint.",
        "An update touches exactly one leaf and then re-aggregates on the way back up, which is one node per level - O(log n) writes rather than the O(n) rebuild a prefix-sum array would need.",
        "The two traps here are sizing and identity. Allocate 4*n nodes, not 2*n: when n is not a power of two the recursive indexing skips slots and 2*n overflows. And the disjoint case must return the identity of the operation - 0 for sum, INT_MAX for min, 0 for OR. Returning 0 for a min tree silently poisons every answer.",
        "Time: O(n) to build, O(log n) per update and per query. Space: O(n).",
      ],
    },
    {
      name: "Dynamic Range Sum Queries",
      difficulty: "Easy",
      variation: "Point assign, range sum on a judge",
      link: "https://cses.fi/problemset/task/1648",
      question: [
        "You are given an array of n integers. Process q queries of two kinds. Query '1 k u' sets the value at position k to u. Query '2 a b' asks for the sum of values in positions a..b inclusive. Positions are 1-indexed. Print the answer to every query of the second kind on its own line.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 1 4\n2 5 6\n1 3 1\n2 1 4\nOutput:\n14\n2\n11\nExplanation: 3+2+4+5 = 14, then 1+1 = 2. The third query rewrites position 3 from 4 to 1, so the first range becomes 3+2+1+5 = 11.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values and 1 <= u <= 10^9\n- 1 <= k <= n, 1 <= a <= b <= n",
      ],
      code: `int n, q;
vector<long long> t;

void build(int node, int l, int r, vector<long long>& a) {
    if (l == r) { t[node] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = t[2 * node] + t[2 * node + 1];
}

void update(int node, int l, int r, int i, long long v) {
    if (l == r) { t[node] = v; return; }
    int mid = (l + r) / 2;
    if (i <= mid) update(2 * node, l, mid, i, v);
    else update(2 * node + 1, mid + 1, r, i, v);
    t[node] = t[2 * node] + t[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    t.assign(4 * (n + 1), 0);
    build(1, 1, n, a);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k;
            long long u;
            cin >> k >> u;
            update(1, 1, n, k, u);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Exactly the sum template, built on 1-indexed positions so the input needs no shifting. Working the tree over [1, n] instead of [0, n-1] costs nothing and removes a whole class of off-by-one bugs in judge problems.",
        "The arithmetic is the real trap: 2 * 10^5 values of up to 10^9 sum to 2 * 10^14, far past a 32-bit int. Node values, the query return type and the input variable for u all have to be 64-bit. An int tree here overflows silently and gives wrong answers only on large tests.",
        "Note that query 1 assigns rather than adds. With a segment tree the distinction is free because the leaf is overwritten and ancestors are recomputed from children; a Fenwick tree would need the delta u - a[k] and a separate copy of the current array.",
        "A Fenwick tree would in fact be the shorter solution for this exact problem. The segment tree earns its extra lines only once the operation stops being invertible - min, max, gcd, or a composite node - which is why this problem is the baseline rather than the destination.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Dynamic Range Minimum Queries",
      difficulty: "Easy",
      variation: "Non-invertible monoid: range min",
      link: "https://cses.fi/problemset/task/1649",
      question: [
        "You are given an array of n integers. Process q queries. Query '1 k u' sets the value at position k to u. Query '2 a b' asks for the minimum value in positions a..b inclusive. Positions are 1-indexed. Print each minimum on its own line.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 1 4\n2 5 6\n1 3 1\n2 1 4\nOutput:\n2\n1\n1\nExplanation: min(3,2,4,5) = 2 and min(1,1) = 1. After position 3 becomes 1, min(3,2,1,5) = 1.",
        "Example 2:\nInput:\n3 3\n5 5 5\n2 2 2\n1 2 9\n2 1 3\nOutput:\n5\n5\nExplanation: a single-element range returns that element; after raising the middle value to 9 the overall minimum is still 5, which no prefix-based structure could recover without a rescan.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values and 1 <= u <= 10^9\n- 1 <= k <= n, 1 <= a <= b <= n",
      ],
      code: `int n, q;
vector<int> t;
const int INF = INT_MAX;

void build(int node, int l, int r, vector<int>& a) {
    if (l == r) { t[node] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = min(t[2 * node], t[2 * node + 1]);
}

void update(int node, int l, int r, int i, int v) {
    if (l == r) { t[node] = v; return; }
    int mid = (l + r) / 2;
    if (i <= mid) update(2 * node, l, mid, i, v);
    else update(2 * node + 1, mid + 1, r, i, v);
    t[node] = min(t[2 * node], t[2 * node + 1]);
}

int query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return INF;          // identity of min, never 0
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return min(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    t.assign(4 * (n + 1), INF);
    build(1, 1, n, a);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k, u;
            cin >> k >> u;
            update(1, 1, n, k, u);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Only the combine function and its identity change from the sum version. That is the whole point of the structure: any associative operation with an identity works, because the query decomposition never assumes anything except that combining adjacent pieces in order is valid.",
        "This is the first problem where a Fenwick tree genuinely cannot substitute. Fenwick prefix queries rely on subtracting one prefix from another, and min has no inverse - knowing min over [1, b] and min over [1, a-1] tells you nothing about min over [a, b]. A sparse table handles min queries in O(1) but only on a static array, and here values change.",
        "Two failure modes to avoid: returning 0 from the disjoint branch, which makes every query containing a boundary report 0; and initialising the tree vector to 0 instead of INF, which does the same damage for positions past n.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Xenia and Bit Operations",
      difficulty: "Medium",
      variation: "Merge rule depends on the tree level",
      link: "https://codeforces.com/problemset/problem/339/D",
      question: [
        "You are given a sequence of 2^n non-negative integers. Combine adjacent pairs with bitwise OR to get 2^(n-1) values, combine those adjacent pairs with bitwise XOR to get 2^(n-2) values, and keep alternating OR and XOR until a single value remains. Answer m queries; each query replaces the element at position p with value b and then asks for the final single value produced by the whole process.",
        "Updates are cumulative: every query permanently changes the sequence for all later queries.",
        "Example 1:\nInput:\n2 4\n1 6 3 5\n1 4\n3 4\n1 2\n1 2\nOutput:\n1\n3\n3\n3\nExplanation: after the first query the sequence is [4,6,3,5]; the OR level gives [4|6, 3|5] = [6,7] and the XOR level gives 6^7 = 1. After the second query it is [4,6,4,5], giving [6,5] then 6^5 = 3. The third query makes it [2,6,4,5], again [6,5] then 3, and the fourth query rewrites the same value so nothing changes.",
        "Constraints:\n- 1 <= n <= 17, so the sequence has up to 131072 elements\n- 1 <= m <= 10^5\n- 0 <= element values and b <= 2^30 - 1\n- 1 <= p <= 2^n",
      ],
      code: `int sz;
vector<int> t;

// segments of length 2 are OR-ed; the operation alternates on the way up
inline int combine(int len, int a, int b) {
    return (__builtin_ctz(len) & 1) ? (a | b) : (a ^ b);
}

void build(int node, int l, int r, vector<int>& a) {
    if (l == r) { t[node] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = combine(r - l + 1, t[2 * node], t[2 * node + 1]);
}

void update(int node, int l, int r, int i, int v) {
    if (l == r) { t[node] = v; return; }
    int mid = (l + r) / 2;
    if (i <= mid) update(2 * node, l, mid, i, v);
    else update(2 * node + 1, mid + 1, r, i, v);
    t[node] = combine(r - l + 1, t[2 * node], t[2 * node + 1]);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    sz = 1 << n;
    vector<int> a(sz + 1);
    for (int i = 1; i <= sz; i++) cin >> a[i];
    t.assign(4 * (sz + 1), 0);
    build(1, 1, sz, a);
    while (m--) {
        int p, b;
        cin >> p >> b;
        update(1, 1, sz, p, b);
        cout << t[1] << "\\n";   // the root already holds the fully folded value
    }
    return 0;
}`,
      explanation: [
        "The described folding process is literally a perfect binary tree over the sequence, so the segment tree is not a trick to speed something up - it is the same object. The answer is always the root, and a query is just one point update.",
        "The one new idea is that the combine function is not fixed: it depends on the height of the node. Since the length of a node's range is exactly 2^height, the parity of that height is __builtin_ctz(len), which is why the operation can be read straight off the range length instead of threading a depth parameter through every call.",
        "Because the array size is exactly 2^n the tree is perfect and every leaf sits at the same depth, which is what makes the level-parity rule well defined. Neither OR nor XOR is used as a range query here, and that is fine - only the root is ever read, so we never need an identity element.",
        "Rebuilding the fold from scratch after each query is O(2^n) and, with 10^5 queries over 131072 elements, roughly 10^10 operations. The update path is 17 nodes instead.",
        "Time: O(2^n + m * n) - one node per level per query. Space: O(2^n).",
      ],
    },
    {
      name: "KGSS - Maximum Sum",
      difficulty: "Medium",
      variation: "Composite node: two largest elements",
      link: "https://www.spoj.com/problems/KGSS/",
      question: [
        "You are given a sequence of n positive integers. Process q operations. 'U x y' sets the element at position x to y. 'Q x y' asks for the maximum value of a[i] + a[j] over all pairs of distinct positions i and j with x <= i < j <= y. Positions are 1-indexed and every query range contains at least two positions. Print each query answer on its own line.",
        "Example 1:\nInput:\n5\n1 2 3 4 5\n6\nQ 2 4\nQ 2 5\nU 1 6\nQ 1 5\nU 1 7\nQ 1 5\nOutput:\n7\n9\n11\n12\nExplanation: over positions 2..4 the two largest values are 4 and 3, giving 7; over 2..5 they are 5 and 4, giving 9. After position 1 becomes 6 the best pair over the whole array is 6 + 5 = 11, and after it becomes 7 it is 7 + 5 = 12.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= q <= 10^5\n- 0 <= element values <= 10^4\n- 1 <= x < y <= n for every query",
      ],
      code: `// node = (largest, second largest) inside the segment
using Node = pair<int,int>;
const Node NEG = {INT_MIN, INT_MIN};

Node merge(const Node& a, const Node& b) {
    if (a.first == INT_MIN) return b;
    if (b.first == INT_MIN) return a;
    int hi = max(a.first, b.first);
    int lo = min(a.first, b.first);
    int second = max(lo, max(a.second, b.second));   // top two of the four candidates
    return {hi, second};
}

int n;
vector<Node> t;

void build(int node, int l, int r, vector<int>& a) {
    if (l == r) { t[node] = {a[l], INT_MIN}; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

void update(int node, int l, int r, int i, int v) {
    if (l == r) { t[node] = {v, INT_MIN}; return; }
    int mid = (l + r) / 2;
    if (i <= mid) update(2 * node, l, mid, i, v);
    else update(2 * node + 1, mid + 1, r, i, v);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

Node query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return NEG;
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return merge(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    t.assign(4 * (n + 1), NEG);
    build(1, 1, n, a);
    int q;
    cin >> q;
    while (q--) {
        char op;
        int x, y;
        cin >> op >> x >> y;
        if (op == 'U') update(1, 1, n, x, y);
        else {
            Node res = query(1, 1, n, x, y);
            cout << res.first + res.second << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The quantity asked for - the best pair sum - is not itself mergeable: knowing the best pair in the left half and the best pair in the right half says nothing about a pair split across the boundary. The fix is the standard one: store more per node until the state does become mergeable. Here the two largest values suffice, because the best pair in a union is always drawn from the top two of each side.",
        "Correctness of the merge: the overall largest is one of the two candidates' maxima; the overall second largest is either the loser of that comparison or the second largest of the side that won. Taking the max of those three covers every case, and the operation is associative because it only ever depends on the multiset of top-two values.",
        "The tempting shortcut is to keep just the maximum and query twice - find the max, then re-query excluding it. That needs two range queries plus a positional exclusion, turning a clean O(log n) merge into fragile index surgery, and it breaks when the maximum appears more than once.",
        "INT_MIN in the second slot marks 'this segment has fewer than two elements', and the merge short-circuits on an empty side so the sentinel never gets added into a real answer. The problem guarantees every query range has length at least two, so the final sum is always well defined.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Hotel Queries",
      difficulty: "Medium",
      variation: "Descend the tree to find the first fitting index",
      link: "https://cses.fi/problemset/task/1143",
      question: [
        "There are n hotels in a row; hotel i has h[i] free rooms. Then m groups of tourists arrive one at a time. A group of r people always takes the leftmost hotel that currently has at least r free rooms, occupying r rooms there. Print the 1-indexed position of the hotel each group takes, or 0 if no hotel can accommodate that group.",
        "Groups are processed in the given order and each assignment reduces that hotel's free rooms for all later groups.",
        "Example 1:\nInput:\n8 5\n3 2 4 1 5 5 2 6\n4 4 7 1 1\nOutput:\n3 5 0 1 1\nExplanation: the first group of 4 skips hotels 1 and 2 (only 3 and 2 rooms) and takes hotel 3, leaving it with 0. The next group of 4 skips hotels 1,2,3,4 and takes hotel 5, leaving it with 1. The group of 7 finds no hotel with 7 rooms - the largest remaining is hotel 8 with 6 - so it prints 0. The two groups of 1 both fit in hotel 1, which drops 3 to 2 and then to 1.",
        "Constraints:\n- 1 <= n, m <= 2 * 10^5\n- 1 <= h[i] <= 10^9\n- 1 <= r <= 10^9",
      ],
      code: `int n, m;
vector<long long> t;

void build(int node, int l, int r, vector<long long>& h) {
    if (l == r) { t[node] = h[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, h);
    build(2 * node + 1, mid + 1, r, h);
    t[node] = max(t[2 * node], t[2 * node + 1]);
}

// walk down to the leftmost leaf whose value is >= need, and pay there
int assign(int node, int l, int r, long long need) {
    if (t[node] < need) return 0;              // nothing in this segment fits
    if (l == r) { t[node] -= need; return l; }
    int mid = (l + r) / 2;
    int res = (t[2 * node] >= need) ? assign(2 * node, l, mid, need)
                                   : assign(2 * node + 1, mid + 1, r, need);
    t[node] = max(t[2 * node], t[2 * node + 1]);
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    vector<long long> h(n + 1);
    for (int i = 1; i <= n; i++) cin >> h[i];
    t.assign(4 * (n + 1), 0);
    build(1, 1, n, h);
    for (int i = 0; i < m; i++) {
        long long r;
        cin >> r;
        cout << assign(1, 1, n, r) << " \\n"[i == m - 1];
    }
    return 0;
}`,
      explanation: [
        "This is the segment tree used as a search structure rather than an aggregator. The array holds free rooms and each node holds the max of its range; the max is exactly the predicate 'some hotel in here can host a group of size need'.",
        "The descent works because the predicate is monotone downward: if the root's max is at least need, then at least one child's max is too. Prefer the left child whenever it qualifies and you land on the leftmost qualifying leaf. Since the search never backtracks, the whole find-and-update is a single root-to-leaf path.",
        "The wrong-but-tempting approach is to binary search on the answer position with a range-max query at each step, which is O(log^2 n) per group, or worse to scan hotels left to right, which is O(n) per group and 4 * 10^10 operations at the limits. The descent fuses the search and the update into one O(log n) pass.",
        "Do not forget to re-aggregate on the way back up after decrementing the leaf - the node whose value changed is on the path, so the same recursion that found it can fix the ancestors for free. Room counts and group sizes reach 10^9; sums are never taken here so int would technically survive, but 64-bit costs nothing and removes the question.",
        "Time: O(n + m log n). Space: O(n).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Hard",
      variation: "Tree over the value domain, sweep the array",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "Given an integer array nums, return an array counts where counts[i] is the number of indices j > i such that nums[j] < nums[i].",
        "Example 1:\nInput: nums = [5, 2, 6, 1]\nOutput: [2, 1, 1, 0]\nExplanation: to the right of 5 there are two smaller values (2 and 1); to the right of 2 there is one (1); to the right of 6 there is one (1); to the right of 1 there are none.",
        "Example 2:\nInput: nums = [-1, -1]\nOutput: [0, 0]\nExplanation: the comparison is strict, so an equal value to the right does not count.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
    int m;
    vector<int> t;

    void add(int node, int l, int r, int i) {
        t[node]++;                                 // one more occurrence in this range
        if (l == r) return;
        int mid = (l + r) / 2;
        if (i <= mid) add(2 * node, l, mid, i);
        else add(2 * node + 1, mid + 1, r, i);
    }

    int qry(int node, int l, int r, int ql, int qr) {
        if (ql > qr || qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return t[node];
        int mid = (l + r) / 2;
        return qry(2 * node, l, mid, ql, qr) + qry(2 * node + 1, mid + 1, r, ql, qr);
    }

public:
    vector<int> countSmaller(vector<int>& nums) {
        int n = nums.size();
        vector<int> vals(nums);
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        m = vals.size();
        t.assign(4 * m, 0);
        vector<int> ans(n);
        for (int i = n - 1; i >= 0; i--) {
            int id = lower_bound(vals.begin(), vals.end(), nums[i]) - vals.begin();
            ans[i] = qry(1, 0, m - 1, 0, id - 1);   // inserted values strictly smaller
            add(1, 0, m - 1, id);
        }
        return ans;
    }
};`,
      explanation: [
        "The pivot here is what the tree is indexed by. In every earlier problem the leaves were array positions; here they are compressed values, and each node stores how many elements with a value in that range have been inserted so far. The array index becomes time instead of space.",
        "Sweeping right to left makes the invariant simple: when we reach position i, the tree contains exactly the elements strictly to the right of i. So counts[i] is a prefix count over the value domain - the number of inserted values with rank strictly less than the rank of nums[i]. Using id - 1 as the right end is what makes the comparison strict, which Example 2 pins down.",
        "Coordinate compression keeps the tree at O(n) leaves. It is also what lets negative values work at all; indexing by raw value would need an offset, and would waste space when values are sparse.",
        "The natural alternative is a modified merge sort counting inversions during the merge, which is the same complexity and less code. The segment tree version generalises better: swap the prefix-count query for a range-count and you answer 'how many later elements lie in [x, y]' with no extra thought.",
        "Time: O(n log n) - one insert and one query per element. Space: O(n).",
      ],
    },
    {
      name: "Prefix Sum Queries",
      difficulty: "Hard",
      variation: "Composite node: sum plus best prefix",
      link: "https://cses.fi/problemset/task/2166",
      question: [
        "You are given an array of n integers. Process q queries. Query '1 k x' sets the value at position k to x. Query '2 a b' asks for the maximum prefix sum in the range a..b, that is the maximum of 0 and of the sums a[a] + a[a+1] + ... + a[i] over all i with a <= i <= b. The empty prefix is allowed, so the answer is never negative. Positions are 1-indexed.",
        "Example 1:\nInput:\n4 3\n1 -2 3 4\n2 1 4\n1 2 5\n2 1 4\nOutput:\n6\n13\nExplanation: the prefix sums of [1,-2,3,4] are 1, -1, 2, 6 and with the empty prefix 0 the maximum is 6. After position 2 becomes 5 the array is [1,5,3,4] with prefix sums 1, 6, 9, 13, so the answer is 13.",
        "Example 2:\nInput:\n4 2\n1 -2 3 4\n2 2 3\n2 2 2\nOutput:\n1\n0\nExplanation: over positions 2..3 the values are -2 and 3, whose prefix sums are -2 and 1, so the best is 1. Over position 2 alone the only non-empty prefix is -2, so the empty prefix wins and the answer is 0.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- -10^9 <= values and x <= 10^9\n- 1 <= k <= n, 1 <= a <= b <= n",
      ],
      code: `struct Node {
    long long sum;    // total of the segment
    long long best;   // best prefix sum inside it, empty prefix allowed
};

const Node ID = {0, 0};

Node merge(const Node& a, const Node& b) {
    // a prefix either ends inside a, or covers all of a plus a prefix of b
    return {a.sum + b.sum, max(a.best, a.sum + b.best)};
}

int n, q;
vector<Node> t;

void build(int node, int l, int r, vector<long long>& a) {
    if (l == r) { t[node] = {a[l], max(0LL, a[l])}; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

void update(int node, int l, int r, int i, long long v) {
    if (l == r) { t[node] = {v, max(0LL, v)}; return; }
    int mid = (l + r) / 2;
    if (i <= mid) update(2 * node, l, mid, i, v);
    else update(2 * node + 1, mid + 1, r, i, v);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

Node query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return ID;
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return merge(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    t.assign(4 * (n + 1), ID);
    build(1, 1, n, a);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k;
            long long x;
            cin >> k >> x;
            update(1, 1, n, k, x);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r).best << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The answer alone is not mergeable, so the node carries an extra field. State: for each segment, its total sum and its best prefix sum. Those two together are closed under concatenation, which is the property the segment tree actually needs.",
        "Why the merge is right: a prefix of the concatenated segment either stops somewhere inside the left part - value a.best - or it swallows the left part entirely and continues into the right part, contributing a.sum + b.best. There is no third case, and the two-field state is enough to evaluate both.",
        "The identity {0, 0} is legitimate precisely because the empty prefix is allowed: an empty segment has sum 0 and best prefix 0, and merging it in changes nothing. If the problem had required a non-empty prefix, best would need a minus-infinity sentinel and the merge would need an emptiness check.",
        "The tempting non-solution is to keep only prefix sums of the whole array and answer with max over i of P(i) - P(a-1). That is correct for a static array but each point update shifts every later prefix, so it degrades to O(n) per update. The tree localises the damage to one path.",
        "Values reach 10^9 in magnitude across 2 * 10^5 positions, so both sum and best must be 64-bit even though individual values fit an int.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Sereja and Brackets",
      difficulty: "Hard",
      variation: "Composite node: matched pairs plus unmatched leftovers",
      link: "https://codeforces.com/problemset/problem/380/C",
      question: [
        "You are given a bracket sequence s consisting only of the characters '(' and ')'. Answer m queries; each query gives l and r and asks for the length of the longest subsequence of s[l..r] that is a correct bracket sequence. A subsequence may skip characters but must keep their order, and a correct bracket sequence is one where every opening bracket is matched by a later closing bracket. Positions are 1-indexed.",
        "Example 1:\nInput:\n())(())(())(\n7\n1 1\n2 3\n1 2\n1 12\n8 12\n5 11\n2 10\nOutput:\n0\n0\n2\n10\n4\n6\n6\nExplanation: a single '(' matches nothing, and '))' has no opener, so both give 0. '()' gives 2. Over the whole string of length 12 exactly five pairs can be matched, leaving the leading ')' at position 3 and the trailing '(' at position 12 unused, so the answer is 10. Positions 8..12 are '(())(' with two matched pairs, giving 4.",
        "Constraints:\n- 1 <= length of s <= 10^6\n- 1 <= m <= 10^5\n- 1 <= l <= r <= length of s",
      ],
      code: `struct Node {
    int matched;   // pairs already matched inside the segment
    int open;      // leftover unmatched opening brackets
    int close;     // leftover unmatched closing brackets
};

const Node ID = {0, 0, 0};

Node merge(const Node& a, const Node& b) {
    int add = min(a.open, b.close);   // a's spare openers absorb b's spare closers
    return {a.matched + b.matched + add, a.open + b.open - add, a.close + b.close - add};
}

int n;
vector<Node> t;

void build(int node, int l, int r, const string& s) {
    if (l == r) {
        t[node] = (s[l] == '(') ? Node{0, 1, 0} : Node{0, 0, 1};
        return;
    }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, s);
    build(2 * node + 1, mid + 1, r, s);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

Node query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return ID;
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return merge(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    n = s.size();
    s = " " + s;                 // shift to 1-indexed
    t.assign(4 * (n + 1), ID);
    build(1, 1, n, s);
    int m;
    cin >> m;
    while (m--) {
        int l, r;
        cin >> l >> r;
        cout << 2 * query(1, 1, n, l, r).matched << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Think of the single-pass stack algorithm for one range: push every '(', and on a ')' either pop a waiting '(' to score a pair or discard the ')'. Its entire state after processing a block is three numbers - pairs scored, openers still waiting, closers that were discarded - and that triple is exactly the node.",
        "The merge composes two such runs. The only new pairs are formed by the left block's waiting openers meeting the right block's discarded closers, and min(a.open, b.close) of them can pair up. Both leftover counts drop by that amount. Association is what makes this a valid segment-tree monoid: composing runs in either grouping yields the same triple.",
        "Greediness is safe here because the openers are interchangeable - every waiting '(' in the left block sits before every discarded ')' in the right block, so pairing as many as possible can never block a better pairing later. This is why a simple maximum works instead of a DP over the range.",
        "The tempting approach is to run the stack scan per query, which is O(n) each and 10^11 character steps at the limits. Note also that there are no updates in this problem, so the tree is built once; the reason it is not just a prefix-sum trick is that the answer for [l, r] depends on interior cancellation, not on endpoint values.",
        "Time: O(n) to build plus O(log n) per query. Space: O(n).",
      ],
    },
    {
      name: "GSS1 - Can you answer these queries I",
      difficulty: "Hard",
      variation: "Composite node: maximum subarray sum in a range",
      link: "https://www.spoj.com/problems/GSS1/",
      question: [
        "You are given a sequence of n integers. Answer q queries; each query gives x and y and asks for the maximum value of a[i] + a[i+1] + ... + a[j] over all i, j with x <= i <= j <= y. The chosen subarray must be non-empty, so a range of only negative numbers has a negative answer. Positions are 1-indexed.",
        "Example 1:\nInput:\n3\n-1 2 3\n3\n1 2\n1 3\n1 1\nOutput:\n2\n5\n-1\nExplanation: over positions 1..2 the candidate sums are -1, 2 and 1, so the best is 2. Over 1..3 the best is 2 + 3 = 5. Over 1..1 the only subarray is -1 itself, which must be taken because the empty subarray is not allowed.",
        "Constraints:\n- 1 <= n <= 50000\n- 1 <= q <= 50000\n- -15007 <= a[i] <= 15007",
      ],
      code: `struct Node {
    long long sum, pref, suf, best;
};

const long long NEG = -(long long)4e18;
const Node ID = {0, NEG, NEG, NEG};   // empty segment: no usable subarray

Node merge(const Node& a, const Node& b) {
    if (a.best == NEG) return b;
    if (b.best == NEG) return a;
    Node c;
    c.sum = a.sum + b.sum;
    c.pref = max(a.pref, a.sum + b.pref);
    c.suf = max(b.suf, b.sum + a.suf);
    c.best = max(max(a.best, b.best), a.suf + b.pref);   // best crossing the split
    return c;
}

int n;
vector<Node> t;

void build(int node, int l, int r, vector<long long>& a) {
    if (l == r) { t[node] = {a[l], a[l], a[l], a[l]}; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid, a);
    build(2 * node + 1, mid + 1, r, a);
    t[node] = merge(t[2 * node], t[2 * node + 1]);
}

Node query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return ID;
    if (ql <= l && r <= qr) return t[node];
    int mid = (l + r) / 2;
    return merge(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    t.assign(4 * (n + 1), ID);
    build(1, 1, n, a);
    int q;
    cin >> q;
    while (q--) {
        int x, y;
        cin >> x >> y;
        cout << query(1, 1, n, x, y).best << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is Kadane's problem made range-queryable. The node stores four numbers: the total sum, the best prefix, the best suffix, and the best subarray anywhere inside. Four is the minimum that closes under concatenation.",
        "The merge enumerates where the answer can live. A best subarray of the union lies entirely in the left part, entirely in the right part, or straddles the boundary - and a straddling one is exactly a suffix of the left glued to a prefix of the right, so a.suf + b.pref covers all of them at once. Prefixes and suffixes update by the same case split: a prefix of the union either stays inside the left or spans all of it and continues.",
        "Because the subarray must be non-empty, prefix, suffix and best cannot use 0 as an identity - a range of all-negative values would then wrongly answer 0, as Example 1's last query shows. The clean fix is a minus-infinity sentinel plus an explicit empty check in the merge, which is why merge starts by short-circuiting on either side being the identity.",
        "It is also important that the query recursion merges partial results in left-to-right order. The merge is associative but not commutative - swapping the operands swaps the roles of prefix and suffix - so combining the child results in the wrong order gives wrong answers on straddling subarrays.",
        "There are no updates in GSS1, but the same node makes point updates work unchanged, which is what separates this from a static divide-and-conquer solution.",
        "Time: O(n) to build plus O(log n) per query. Space: O(n).",
      ],
    },
    {
      name: "Longest Increasing Subsequence II",
      difficulty: "Hard",
      variation: "DP over the value domain with a range-max query",
      link: "https://leetcode.com/problems/longest-increasing-subsequence-ii/",
      question: [
        "You are given an integer array nums and an integer k. Find the length of the longest subsequence of nums that is strictly increasing and in which the difference between every pair of adjacent chosen elements is at most k.",
        "Example 1:\nInput: nums = [4, 2, 1, 4, 3, 4, 5, 8, 15], k = 3\nOutput: 5\nExplanation: [1, 3, 4, 5, 8] is strictly increasing with consecutive gaps 2, 1, 1, 3, all at most 3. Extending it with 15 is illegal because 15 - 8 = 7 > 3.",
        "Example 2:\nInput: nums = [7, 4, 5, 1, 8, 12, 4, 7], k = 5\nOutput: 4\nExplanation: [4, 5, 8, 12] has gaps 1, 3, 4, all at most 5.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^5\n- 1 <= k <= 10^5",
      ],
      code: `class Solution {
    int m;
    vector<int> t;

    void upd(int node, int l, int r, int i, int v) {
        if (l == r) { t[node] = max(t[node], v); return; }   // keep the best chain per value
        int mid = (l + r) / 2;
        if (i <= mid) upd(2 * node, l, mid, i, v);
        else upd(2 * node + 1, mid + 1, r, i, v);
        t[node] = max(t[2 * node], t[2 * node + 1]);
    }

    int qry(int node, int l, int r, int ql, int qr) {
        if (ql > qr || qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return t[node];
        int mid = (l + r) / 2;
        return max(qry(2 * node, l, mid, ql, qr), qry(2 * node + 1, mid + 1, r, ql, qr));
    }

public:
    int lengthOfLIS(vector<int>& nums, int k) {
        m = *max_element(nums.begin(), nums.end()) + 1;
        t.assign(4 * m, 0);
        int ans = 0;
        for (int x : nums) {
            int lo = max(0, x - k);
            int best = qry(1, 0, m - 1, lo, x - 1);   // best chain ending in [x-k, x-1]
            upd(1, 0, m - 1, x, best + 1);
            ans = max(ans, best + 1);
        }
        return ans;
    }
};`,
      explanation: [
        "State: f[v] = the length of the longest valid subsequence, among elements processed so far, whose last value is exactly v. The transition for a new element x is f[x] = 1 + max over v in [x-k, x-1] of f[v] - strictly less than x for the increasing condition, at least x-k for the gap condition.",
        "The two conditions together are precisely a contiguous window of the value domain, which is the whole reason a segment tree indexed by value works. That window is what a plain O(n^2) LIS scan spends linear time re-deriving for every element.",
        "Processing the array left to right means the tree only ever contains values from earlier positions, so the subsequence order is automatically respected. The update is a max-assign rather than an overwrite: a later, shorter chain ending on the same value must not erase a better earlier one.",
        "Two easy mistakes: using [x-k, x] instead of [x-k, x-1], which allows equal adjacent values and breaks strictness; and letting the query return a sentinel other than 0 - here 0 is exactly right, since 'no predecessor found' means x starts a chain of length 1.",
        "The classic patience-sorting LIS in O(n log n) does not extend to this problem, because the gap constraint means a longer chain is no longer always preferable to a shorter one with a smaller tail. The value-indexed tree keeps every tail value separately, which is what makes the constraint expressible.",
        "Time: O((n + V) log V) where V is the largest value. Space: O(V).",
      ],
    },
  ],
};
