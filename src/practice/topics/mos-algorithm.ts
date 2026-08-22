import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "D-query",
      difficulty: "Easy",
      variation: "Distinct count, the template",
      link: "https://www.spoj.com/problems/DQUERY/",
      question: [
        "Given a sequence of n integers a[1..n] and q queries, each query being a pair (i, j), print for every query the number of distinct values among a[i], a[i+1], ..., a[j]. All queries are given up front, so they may be answered in any order.",
        "Example 1:\nInput:\n5\n1 1 2 1 3\n3\n1 5\n2 4\n3 5\nOutput:\n3\n2\n3\nExplanation: The whole array holds the values 1, 2 and 3. The range [2,4] is 1 2 1 with two distinct values. The range [3,5] is 2 1 3 with three.",
        "Constraints:\n- 1 <= n <= 30000\n- 1 <= q <= 200000\n- 1 <= a[i] <= 10^6",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[30005];
int cnt[1000005];
int cur = 0;

void add(int i) { if (cnt[a[i]]++ == 0) cur++; }   // a new value entered the window
void rem(int i) { if (--cnt[a[i]] == 0) cur--; }   // the last copy left the window

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    int q;
    cin >> q;
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)q + 1)));   // tuned for q >> n
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;    // snake order inside a block
    });
    vector<int> ans(q);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The state is a sliding window [cl, cr] plus whatever aggregate you maintain over it - here a frequency table cnt and a running distinct counter. Mo's algorithm never recomputes an answer; it only ever moves the two window endpoints by one and repairs the aggregate in O(1). That is the single requirement: add(i) and rem(i) must be cheap and must undo each other exactly.",
        "The magic is the ordering. Sort queries by the block of l (block width about sqrt(n)), and inside a block by r. Then l moves at most one block width per query, so O(q * sqrt(n)) total, and r only ever increases while you stay inside one block, so O(n) per block and O(n * sqrt(n)) overall. Nothing about the answers is used in the proof - only the count of pointer steps.",
        "The alternating direction of the r comparison (ascending in even blocks, descending in odd ones) means r does not have to jump back to the left edge when a new block starts. It halves the constant for free and costs one line.",
        "Two traps. First, the four while loops must grow before they shrink; if you shrink first, a far-away query can momentarily push cl past cr + 1 and the counters go negative and never recover. Second, Mo's is strictly offline - if the queries must be answered as they arrive, this whole approach is unavailable and you need a BIT or a wavelet tree instead.",
        "Time: O((n + q) * sqrt(n)). Space: O(n + q + maxValue).",
      ],
    },
    {
      name: "Range Pairing Query",
      difficulty: "Easy",
      variation: "Block size tuned when q exceeds n",
      link: "https://atcoder.jp/contests/abc242/tasks/abc242_g",
      question: [
        "There are N people standing in a row; person i has hair colour A[i]. For each of Q queries (l, r) consider only the people from position l to position r and pair them up so that the two members of every pair have the same hair colour and nobody belongs to more than one pair. Print the maximum possible number of pairs for each query.",
        "Example 1:\nInput:\n6\n1 2 1 3 1 2\n3\n1 6\n2 5\n3 3\nOutput:\n2\n1\n0\nExplanation: Over the whole row colour 1 appears three times and colour 2 twice, giving 1 + 1 = 2 pairs. In [2,5] the colours are 2 1 3 1, so only the two 1s pair up. A single person cannot pair with anybody.",
        "Constraints:\n- 1 <= N <= 10^5\n- 1 <= A[i] <= N\n- 1 <= Q <= 10^6",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[100005];
int cnt[100005];
int cur = 0;

void add(int i) { cnt[a[i]]++; if (cnt[a[i]] % 2 == 0) cur++; }  // an even count closes a pair
void rem(int i) { if (cnt[a[i]] % 2 == 0) cur--; cnt[a[i]]--; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    int q;
    cin >> q;
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)q + 1)));   // q can far exceed n here
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<int> ans(q);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The answer for a window is the sum over colours of floor(cnt / 2), which is exactly what a maximum pairing achieves: each colour is handled independently and a group of c people yields floor(c / 2) pairs. So the aggregate is one integer, updated in O(1).",
        "Raising a count from c to c + 1 increases floor(c / 2) by one precisely when c + 1 is even, so the add hook tests parity after incrementing and the rem hook tests it before decrementing. Getting those two orders the wrong way round is the classic off-by-one in Mo's hooks: add and rem must be exact inverses or the aggregate drifts silently.",
        "This problem is where block size matters. With Q up to 10^6 and N only 10^5, a block of sqrt(n) would spend q * sqrt(n) = 3 * 10^8 steps on the left pointer alone. The general optimum is n / sqrt(q), which balances the two costs and gives O(n * sqrt(q)) total movement - here about 10^8 with a one-instruction body, which passes.",
        "Reading 10^6 queries is itself a bottleneck, so untied fast streams (or a hand-rolled reader) are not optional here.",
        "Time: O(n * sqrt(q) + q log q). Space: O(n + q).",
      ],
    },
    {
      name: "Little Elephant and Array",
      difficulty: "Medium",
      variation: "Counter with a threshold predicate",
      link: "https://codeforces.com/problemset/problem/220/B",
      question: [
        "You are given an array a of n integers and m queries. Each query is a pair (l, r), and its answer is the number of values x such that x occurs exactly x times in the subarray a[l..r]. Print the answer for every query.",
        "Example 1:\nInput:\n7 2\n3 1 2 2 3 3 7\n1 7\n3 4\nOutput:\n3\n1\nExplanation: Over the whole array 1 occurs once, 2 occurs twice and 3 occurs three times, so three values qualify; 7 occurs only once. The range [3,4] is 2 2, where only the value 2 qualifies.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= a[i] <= 10^9",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[100005];
int cnt[100005];
int cur = 0;

void add(int i) {
    int v = a[i];
    if (v == 0) return;                 // value could never equal its own frequency
    cnt[v]++;
    if (cnt[v] == v) cur++;
    else if (cnt[v] == v + 1) cur--;    // it just stopped matching
}

void rem(int i) {
    int v = a[i];
    if (v == 0) return;
    if (cnt[v] == v) cur--;
    else if (cnt[v] == v + 1) cur++;
    cnt[v]--;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        a[i] = (x <= n) ? x : 0;        // x > n can never occur x times
    }
    vector<Query> qs(m);
    for (int i = 0; i < m; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)m + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<int> ans(m);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < m; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Values reach 10^9 but a value x can only qualify if it fits x copies inside the array, so every x > n is dead weight. Mapping those to a sentinel 0 (which is not a legal input value) lets cnt be a plain array of size n + 1 - no hash map, no coordinate compression, and the add hook returns immediately for the sentinel.",
        "The aggregate cur counts qualifying values. A single insertion changes only one value's count, so only that value can enter or leave the qualifying set: it enters when its count becomes exactly v and leaves when the count moves up to v + 1. The removal hook mirrors both transitions before decrementing. Checking only 'cnt == v' and forgetting the 'cnt == v + 1' exit is the bug that makes cur too large.",
        "The tempting alternative is offline prefix counting, but 'occurs exactly x times' is not decomposable over prefixes - the count in [l, r] is a difference, and equality with x cannot be tested from two independent prefix answers. Mo's works precisely because it holds a real window and the predicate is re-tested only for the one value that changed.",
        "Time: O((n + m) * sqrt(n)). Space: O(n + m).",
      ],
    },
    {
      name: "Distinct Values Queries",
      difficulty: "Medium",
      variation: "Distinct count with coordinate compression",
      link: "https://cses.fi/problemset/task/1734",
      question: [
        "You are given an array of n integers and q queries of the form (a, b). For each query, report the number of distinct values in the subarray from position a to position b, inclusive.",
        "Example 1:\nInput:\n5 3\n3 2 3 1 2\n1 5\n2 4\n1 3\nOutput:\n3\n3\n2\nExplanation: The whole array contains the values 3, 2 and 1. The range [2,4] is 2 3 1, all distinct. The range [1,3] is 3 2 3, which has only two distinct values.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= x[i] <= 10^9",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[200005];
int cnt[200005];
int cur = 0;

void add(int i) { if (cnt[a[i]]++ == 0) cur++; }
void rem(int i) { if (--cnt[a[i]] == 0) cur--; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> raw(n);
    for (int i = 0; i < n; i++) cin >> raw[i];
    vector<int> srt = raw;
    sort(srt.begin(), srt.end());
    srt.erase(unique(srt.begin(), srt.end()), srt.end());
    for (int i = 0; i < n; i++)
        a[i] = (int)(lower_bound(srt.begin(), srt.end(), raw[i]) - srt.begin());  // compress
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)q + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<int> ans(q);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Same aggregate as the D-query template; the only new ingredient is that the values are up to 10^9, so they are compressed to 0..n-1 first. Mo's needs an array-indexed frequency table because add and rem sit in the innermost loop - swapping in an unordered_map here typically costs a factor of five or more and is the usual reason a correct Mo's solution still times out.",
        "With n = q = 2 * 10^5 the pointer movement is about (n + q) * sqrt(n), roughly 9 * 10^7 single-increment steps, which is comfortable in C++ but would not be in a slower language.",
        "Worth knowing the sharper alternative: sweep r from left to right keeping a BIT that holds a 1 at the last occurrence of each value; then distinct(l, r) is a suffix sum, and the whole thing is O((n + q) log n). Mo's is the answer when the aggregate is something a BIT cannot decompose - it trades a log factor for near-total freedom in what you maintain.",
        "Time: O((n + q) * sqrt(n)). Space: O(n + q).",
      ],
    },
    {
      name: "XOR and Favorite Number",
      difficulty: "Medium",
      variation: "Mo's over the prefix-xor array",
      link: "https://codeforces.com/problemset/problem/617/E",
      question: [
        "You are given an array a of n integers and a favourite number k. For each of m queries (l, r) count the number of pairs (i, j) with l <= i <= j <= r such that a[i] xor a[i+1] xor ... xor a[j] equals k.",
        "Example 1:\nInput:\n6 2 3\n1 2 1 1 0 3\n1 6\n3 5\nOutput:\n7\n0\nExplanation: Seven subarrays of the whole array xor to 3, while none of the subarrays inside positions 3..5 do.",
        "Example 2:\nInput:\n5 3 1\n1 1 1 1 1\n1 5\n2 4\n1 3\nOutput:\n9\n4\n4\nExplanation: A subarray of ones xors to 1 exactly when its length is odd; in [1,5] there are nine such subarrays.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 0 <= k, a[i] <= 10^6",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int p[100005];              // prefix xors, p[0] = 0
int cnt[1 << 20];
long long cur = 0;
int K;

void add(int i) { cur += cnt[p[i] ^ K]; cnt[p[i]]++; }   // pair the newcomer with earlier members
void rem(int i) { cnt[p[i]]--; cur -= cnt[p[i] ^ K]; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m >> K;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        p[i] = p[i - 1] ^ x;
    }
    vector<Query> qs(m);
    for (int i = 0; i < m; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r, i};          // window over prefix indices l-1 .. r
    }
    blk = max(1, (int)((n + 1) / sqrt((double)m + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<long long> ans(m);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < m; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The xor of a[i..j] is p[j] xor p[i-1], so a subarray inside [l, r] with xor k corresponds to a pair of prefix indices x < y drawn from the set {l-1, l, ..., r} with p[x] xor p[y] = k. The problem becomes: count matching pairs in a window of the prefix array. Note the shift - the query window is [l-1, r] on p, which has n + 1 entries, and forgetting the -1 loses every subarray that starts at l.",
        "The aggregate is the number of matching pairs currently inside the window. Inserting index i adds exactly cnt[p[i] xor k] new pairs, so the counter must be read before p[i] itself is inserted; removal is the mirror, decrementing first and then subtracting. That ordering is what makes k = 0 come out right: a value is never paired with itself.",
        "All prefix xors and k stay below 2^20 because a[i] <= 10^6, so cnt is a flat array of 2^20 ints. Answers can reach about (10^5)^2 / 2, so the accumulator has to be 64-bit even though every individual count is small.",
        "The wrong-but-tempting move is a per-query two-pointer scan: the pair count is not monotone in a way two pointers can exploit, and there is no prefix decomposition either, since the set of pairs inside [l, r] is not a difference of pair counts over prefixes.",
        "Time: O((n + m) * sqrt(n)). Space: O(n + m + 2^20).",
      ],
    },
    {
      name: "Triple Index",
      difficulty: "Medium",
      variation: "Combinatorial aggregate with an O(1) delta",
      link: "https://atcoder.jp/contests/abc293/tasks/abc293_g",
      question: [
        "You are given a sequence A of N positive integers and Q queries. Each query gives a pair (l, r); answer the number of triples of indices (i, j, k) with l <= i < j < k <= r and A[i] = A[j] = A[k].",
        "Example 1:\nInput:\n6\n1 2 1 1 1 2\n2\n1 6\n2 4\nOutput:\n4\n0\nExplanation: Over the whole sequence the value 1 appears four times, giving C(4,3) = 4 triples, and the value 2 appears twice, giving none. Inside [2,4] the values are 2 1 1, so no value appears three times.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- 1 <= A[i] <= 2 * 10^5",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[200005];
long long cnt[200005];
long long cur = 0;

// C(c+1,3) - C(c,3) = C(c,2), so a single insert changes the answer by C(cnt,2).
void add(int i) { long long c = cnt[a[i]]; cur += c * (c - 1) / 2; cnt[a[i]]++; }
void rem(int i) { cnt[a[i]]--; long long c = cnt[a[i]]; cur -= c * (c - 1) / 2; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    int q;
    cin >> q;
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)q + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<long long> ans(q);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The answer for a window is the sum over values of C(cnt[v], 3), because a triple is just an unordered choice of three equal elements and the actual index order is forced. So the aggregate is a single 64-bit number.",
        "The whole trick is the delta. Adding one more copy of v takes C(c, 3) to C(c + 1, 3), and the difference is C(c, 2) - the new element pairs with any two of the c already present. Removal subtracts C(c, 2) using the count after decrementing, which is the same c. This telescoping delta is the general recipe for any 'sum of f(cnt)' aggregate: precompute or derive f(c+1) - f(c) and the hooks stay O(1).",
        "Do not accumulate the answer by rescanning the counts at each query - that is O(maxValue) per query and defeats the point. Also keep cnt as long long or cast before multiplying: c * (c - 1) with c near 2 * 10^5 already exceeds 32-bit range in the worst case.",
        "Time: O((N + Q) * sqrt(N)). Space: O(N + Q).",
      ],
    },
    {
      name: "Powerful array",
      difficulty: "Hard",
      variation: "Weighted aggregate, sum of cnt squared times value",
      link: "https://codeforces.com/problemset/problem/86/D",
      question: [
        "For an array define its power as the sum over all distinct values s of K(s) * K(s) * s, where K(s) is the number of occurrences of s in that array. You are given an array a of n elements and t queries (l, r); print the power of the subarray a[l..r] for each query.",
        "Example 1:\nInput:\n3 2\n1 2 1\n1 2\n1 3\nOutput:\n3\n6\nExplanation: For [1,2] the power is 1*1*1 + 1*1*2 = 3. For [1,3] the value 1 occurs twice, giving 4*1 + 1*2 = 6.",
        "Example 2:\nInput:\n8 3\n1 1 2 2 1 3 1 1\n2 7\n1 6\n2 7\nOutput:\n20\n20\n20\nExplanation: In [2,7] the counts are 1 -> 3, 2 -> 2, 3 -> 1, so the power is 9*1 + 4*2 + 1*3 = 20.",
        "Constraints:\n- 1 <= n, t <= 2 * 10^5\n- 1 <= a[i] <= 10^6",
      ],
      code: `int blk;
struct Query { int l, r, idx; };

int a[200005];
long long cnt[1000005];
long long cur = 0;

// (c+1)^2 * v - c^2 * v = (2c+1) * v
void add(int i) { long long v = a[i]; cur += (2 * cnt[v] + 1) * v; cnt[v]++; }
void rem(int i) { long long v = a[i]; cnt[v]--; cur -= (2 * cnt[v] + 1) * v; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, t;
    cin >> n >> t;
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<Query> qs(t);
    for (int i = 0; i < t; i++) {
        int l, r;
        cin >> l >> r;
        qs[i] = {l - 1, r - 1, i};
    }
    blk = max(1, (int)(n / sqrt((double)t + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<long long> ans(t);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = cur;
    }
    for (int i = 0; i < t; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Another 'sum of f(cnt) weighted by the value' aggregate, so again all that is needed is the delta: going from c to c + 1 copies of v changes c*c*v into (c+1)*(c+1)*v, a difference of (2c + 1) * v. The removal hook decrements first and then subtracts the same expression, keeping the two hooks exact inverses.",
        "Overflow is the real difficulty here. A window of 2 * 10^5 equal elements of value 10^6 gives a power of 4 * 10^16, so the accumulator, the multiplication operands and the answers must all be 64-bit. Computing 2 * cnt[v] + 1 in int and only then widening is the mistake that silently wrecks large tests.",
        "This is the problem that made Mo's algorithm well known, and it is also where the constant factor starts to bite: with n = t = 2 * 10^5 the pointer walks about 9 * 10^7 steps, each doing a multiply and two array touches. Keep the hooks branch-free and inline, use the n / sqrt(t) block width, and prefer the snake ordering. If it still runs long, Hilbert-curve ordering of the (l, r) points is the standard next step - it replaces the block sort with a space-filling-curve key and cuts total pointer movement measurably.",
        "Time: O((n + t) * sqrt(n)). Space: O(n + t + maxValue).",
      ],
    },
    {
      name: "Tree and Queries",
      difficulty: "Hard",
      variation: "Mo's on an Euler tour, subtree queries",
      link: "https://codeforces.com/problemset/problem/375/D",
      question: [
        "You are given a rooted tree on n vertices, rooted at vertex 1, where vertex v has colour c[v]. Answer m queries; each query is a pair (v, k) and asks how many colours occur at least k times among the vertices of the subtree of v.",
        "Example 1:\nInput:\n8 5\n1 2 2 3 3 2 3 3\n1 2\n1 5\n2 3\n2 4\n5 6\n5 7\n5 8\n1 2\n1 3\n1 4\n2 3\n5 3\nOutput:\n2\n2\n1\n0\n1\nExplanation: The whole tree has colour 1 once, colour 2 three times and colour 3 four times, so two colours reach 2, two reach 3 and only one reaches 4. The subtree of vertex 2 is {2,3,4} with colours 2,2,3, so no colour reaches 3, while the subtree of vertex 5 is {5,6,7,8} where colour 3 appears three times.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= c[v] <= 10^5\n- 1 <= k <= 10^5",
      ],
      code: `int blk;
struct Query { int l, r, k, idx; };

int col[100005];          // colour of the vertex sitting at each Euler position
int cnt[100005];          // cnt[c] = occurrences of colour c in the window
int atLeast[100005];      // atLeast[f] = number of colours whose count is >= f

void add(int i) { int c = col[i]; cnt[c]++; atLeast[cnt[c]]++; }
void rem(int i) { int c = col[i]; atLeast[cnt[c]]--; cnt[c]--; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0);
    int timer = 0;
    // iterative Euler tour: each vertex owns the contiguous slice [tin, tout]
    vector<int> st;
    st.push_back(1);
    par[1] = 0;
    tin[1] = timer;
    col[timer++] = c[1];
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;
            par[v] = u;
            tin[v] = timer;
            col[timer++] = c[v];
            st.push_back(v);
        } else {
            tout[u] = timer - 1;
            st.pop_back();
        }
    }
    vector<Query> qs(m);
    for (int i = 0; i < m; i++) {
        int v, k;
        cin >> v >> k;
        qs[i] = {tin[v], tout[v], k, i};
    }
    blk = max(1, (int)(n / sqrt((double)m + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<int> ans(m);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) add(++cr);
        while (cl > e.l) add(--cl);
        while (cr > e.r) rem(cr--);
        while (cl < e.l) rem(cl++);
        ans[e.idx] = (e.k <= n) ? atLeast[e.k] : 0;
    }
    for (int i = 0; i < m; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Flatten the tree with an Euler tour that records each vertex once, at its entry time. Then the subtree of v is exactly the contiguous slice [tin[v], tout[v]] of the flat array, and a subtree query is an ordinary range query - which is all Mo's needs. This reduction is the reason Mo's applies to trees at all.",
        "The aggregate has to answer 'how many colours have count >= k' for a k that changes per query, so a single counter is not enough. Keep a second array atLeast[f] = number of colours whose count is at least f. When a colour's count rises from f to f + 1 only atLeast[f + 1] gains one, and when it falls from f to f - 1 only atLeast[f] loses one; every other entry is untouched. The query is then a single O(1) lookup.",
        "The wrong version of that structure stores exactly[f] = number of colours with count exactly f, which forces an O(n) suffix sum per query. Storing the 'at least' form pushes the prefix work into the update, where it costs nothing.",
        "The Euler tour is written iteratively on purpose: a chain of 10^5 vertices will blow a default recursion stack on some judges. Note also that k can exceed n, in which case the answer is 0 and the atLeast lookup must be guarded.",
        "The classic alternative is DSU on tree (small-to-large merging), which is O(n log n) and beats Mo's here; Mo's wins when the aggregate is awkward to merge or when the queries are paths rather than subtrees.",
        "Time: O((n + m) * sqrt(n)). Space: O(n + m).",
      ],
    },
    {
      name: "Count on a tree II",
      difficulty: "Hard",
      variation: "Mo's on tree paths, double-occurrence trick",
      link: "https://www.spoj.com/problems/COT2/",
      question: [
        "You are given a tree with N nodes, each node carrying an integer weight. Answer M queries; each query gives two nodes u and v and asks for the number of distinct weights on the path from u to v, endpoints included.",
        "Example 1:\nInput:\n8 2\n105 2 9 3 8 5 7 7\n1 2\n1 3\n1 4\n3 5\n3 6\n3 7\n4 8\n2 5\n7 8\nOutput:\n4\n4\nExplanation: The path 2 - 1 - 3 - 5 carries the weights 2, 105, 9, 8, all distinct. The path 7 - 3 - 1 - 4 - 8 carries 7, 9, 105, 3, 7, where the weight 7 repeats, leaving four distinct values.",
        "Constraints:\n- 1 <= N <= 40000\n- 1 <= M <= 100000\n- Each weight fits in a signed 32-bit integer",
      ],
      code: `const int MAXN = 40005;
const int LOG = 17;

int blk;
struct Query { int l, r, extra, idx; };

int w[MAXN];                    // compressed weight per vertex
int flat[2 * MAXN];             // Euler sequence, every vertex appears twice
int tin[MAXN], tout[MAXN], dep[MAXN], up[LOG][MAXN];
int cnt[MAXN], used[MAXN];
int cur = 0;

void toggle(int v) {            // flip whether vertex v is inside the window
    if (used[v]) {
        if (--cnt[w[v]] == 0) cur--;
        used[v] = 0;
    } else {
        if (cnt[w[v]]++ == 0) cur++;
        used[v] = 1;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> raw(n + 1);
    for (int i = 1; i <= n; i++) cin >> raw[i];
    vector<int> srt(raw.begin() + 1, raw.end());
    sort(srt.begin(), srt.end());
    srt.erase(unique(srt.begin(), srt.end()), srt.end());
    for (int i = 1; i <= n; i++)
        w[i] = (int)(lower_bound(srt.begin(), srt.end(), raw[i]) - srt.begin());
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> it(n + 1, 0), st;
    int timer = 0;
    up[0][1] = 0;
    dep[1] = 0;
    tin[1] = timer;
    flat[timer++] = 1;
    st.push_back(1);
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == up[0][u]) continue;
            up[0][v] = u;
            dep[v] = dep[u] + 1;
            tin[v] = timer;
            flat[timer++] = v;
            st.push_back(v);
        } else {
            tout[u] = timer;
            flat[timer++] = u;      // closing occurrence
            st.pop_back();
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        int d = dep[a] - dep[b];
        for (int k = 0; k < LOG; k++) if (d >> k & 1) a = up[k][a];
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--)
            if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    vector<Query> qs(m);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        if (tin[u] > tin[v]) swap(u, v);
        int l = lca(u, v);
        if (l == u) qs[i] = {tin[u], tin[v], 0, i};        // v lies inside u's subtree
        else qs[i] = {tout[u], tin[v], l, i};              // lca falls outside the window
    }
    blk = max(1, (int)(2 * n / sqrt((double)m + 1)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;
    });
    vector<int> ans(m);
    int cl = 0, cr = -1;
    for (const Query& e : qs) {
        while (cr < e.r) toggle(flat[++cr]);
        while (cl > e.l) toggle(flat[--cl]);
        while (cr > e.r) toggle(flat[cr--]);
        while (cl < e.l) toggle(flat[cl++]);
        if (e.extra) toggle(e.extra);
        ans[e.idx] = cur;
        if (e.extra) toggle(e.extra);
    }
    for (int i = 0; i < m; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Paths are not subtrees, so the single-occurrence Euler tour of the previous problem does not help. The fix is to write each vertex twice, at its entry time tin and its exit time tout, giving a flat array of length 2n, and to make the window hooks a toggle rather than an add: processing a position flips whether that vertex is currently counted.",
        "The invariant that makes it work: assume tin[u] <= tin[v]. If u is an ancestor of v, take the window [tin[u], tin[v]]. Every vertex on the path u..v has exactly one of its two occurrences inside that range, and every other vertex has either both or neither - the both-case cancels under toggling and the neither-case never fires. If u and v are in different branches, take [tout[u], tin[v]] instead, and the same cancellation holds for everything except their LCA, which contributes neither occurrence.",
        "So the LCA has to be added by hand: toggle it in, read the answer, toggle it straight back out. It is provably outside the window (tin of the LCA precedes tin[u] and its tout follows tin[v]), so its used flag is 0 when you get there and the toggle is safe. Forgetting this single vertex is the standard off-by-one in tree Mo's, and it only shows up on queries whose endpoints are in different branches.",
        "Everything else is the plain template over an array of length 2n, so the block width is 2n / sqrt(m) and each of the up to 2n toggles is O(1). Weights need compression, and the frequency table is indexed by compressed weight, not by vertex.",
        "Time: O(n log n for the lifting table, then (n + m) * sqrt(n) for the sweep). Space: O(n log n + m).",
      ],
    },
    {
      name: "Machine Learning",
      difficulty: "Hard",
      variation: "Mo's with point updates (three-dimensional Mo)",
      link: "https://codeforces.com/problemset/problem/940/F",
      question: [
        "You are given an array a of n integers and must process q operations. An operation '1 l r' asks for the Mex of the multiset of occurrence counts inside a[l..r]: for every value present in that subarray take how many times it occurs, and report the smallest positive integer that is not among those counts. An operation '2 p x' assigns a[p] = x.",
        "Example 1:\nInput:\n10 4\n1 2 3 1 1 2 2 2 9 9\n1 1 1\n1 2 8\n2 7 1\n1 2 8\nOutput:\n2\n3\n2\nExplanation: The subarray [1,1] holds one value once, so the counts are {1} and the Mex is 2. In [2,8] the counts are 4, 1 and 2, so the Mex is 3. After a[7] becomes 1 the counts in [2,8] are 3 and 1, and the Mex is 2.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- 1 <= a[i], x <= 10^9\n- 1 <= l <= r <= n, 1 <= p <= n",
      ],
      code: `int blk;
struct Query { int l, r, t, idx; };
struct Upd { int pos, oldv, newv; };

vector<int> a;
vector<int> cnt, cntCnt;      // cnt[value], cntCnt[frequency]

void addVal(int v) { cntCnt[cnt[v]]--; cnt[v]++; cntCnt[cnt[v]]++; }
void remVal(int v) { cntCnt[cnt[v]]--; cnt[v]--; cntCnt[cnt[v]]++; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> raw(n);
    for (int i = 0; i < n; i++) cin >> raw[i];
    vector<array<int,3>> ops(q);
    vector<int> all = raw;
    for (int i = 0; i < q; i++) {
        int type, x, y;
        cin >> type >> x >> y;
        ops[i] = {type, x, y};
        if (type == 2) all.push_back(y);          // update values need compressing too
    }
    sort(all.begin(), all.end());
    all.erase(unique(all.begin(), all.end()), all.end());
    auto id = [&](int v) { return (int)(lower_bound(all.begin(), all.end(), v) - all.begin()); };
    a.resize(n);
    for (int i = 0; i < n; i++) a[i] = id(raw[i]);
    vector<int> curArr = a;                        // used only to recover old values
    vector<Query> qs;
    vector<Upd> ups;
    for (int i = 0; i < q; i++) {
        if (ops[i][0] == 1) qs.push_back({ops[i][1] - 1, ops[i][2] - 1, (int)ups.size(), (int)qs.size()});
        else {
            int p = ops[i][1] - 1, v = id(ops[i][2]);
            ups.push_back({p, curArr[p], v});
            curArr[p] = v;
        }
    }
    cnt.assign(all.size(), 0);
    cntCnt.assign(n + 2, 0);
    blk = max(1, (int)(pow((double)n, 2.0 / 3.0)));
    sort(qs.begin(), qs.end(), [](const Query& x, const Query& y) {
        int bx = x.l / blk, by = y.l / blk;
        if (bx != by) return bx < by;
        int rx = x.r / blk, ry = y.r / blk;
        if (rx != ry) return (bx & 1) ? rx > ry : rx < ry;
        return (rx & 1) ? x.t > y.t : x.t < y.t;
    });
    int cl = 0, cr = -1, ct = 0;
    auto applyUpd = [&](int t) {
        Upd& u = ups[t];
        if (u.pos >= cl && u.pos <= cr) { remVal(a[u.pos]); addVal(u.newv); }
        a[u.pos] = u.newv;
    };
    auto undoUpd = [&](int t) {
        Upd& u = ups[t];
        if (u.pos >= cl && u.pos <= cr) { remVal(a[u.pos]); addVal(u.oldv); }
        a[u.pos] = u.oldv;
    };
    vector<int> ans(qs.size());
    for (const Query& e : qs) {
        while (ct < e.t) applyUpd(ct++);
        while (ct > e.t) undoUpd(--ct);
        while (cr < e.r) addVal(a[++cr]);
        while (cl > e.l) addVal(a[--cl]);
        while (cr > e.r) remVal(a[cr--]);
        while (cl < e.l) remVal(a[cl++]);
        int mex = 1;
        while (cntCnt[mex] > 0) mex++;             // answer is O(sqrt(n)), so this is cheap
        ans[e.idx] = mex;
    }
    for (size_t i = 0; i < ans.size(); i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The state grows a third dimension: besides the window [cl, cr] the sweep also carries a time cursor ct counting how many of the point updates have been applied. Each query remembers how many updates preceded it, and moving from one query to the next means rolling the array forwards or backwards through the update list. Storing the old value inside each update record is what makes an update invertible, which is the same requirement Mo's puts on add and rem.",
        "Applying an update only disturbs the aggregate when the touched position lies inside the current window, so the hook checks the position and, if it is inside, removes the old value and inserts the new one before overwriting the array. The order matters: read a[u.pos] to remove it, then write.",
        "Sorting is now by three keys - block of l, then block of r, then time - and the correct block width is n^(2/3) rather than sqrt(n). Balancing the three costs gives O(n^(5/3)) total movement, roughly 2 * 10^8 for n = 10^5, which is why the hooks must stay branch-light. Using sqrt(n) blocks with a time dimension is the standard performance mistake here: it makes the time pointer sweep the whole update list far too often.",
        "The aggregate is two levels deep: cnt[v] is the occurrence count of a value, and cntCnt[f] is how many values currently have count exactly f. The Mex over the nonzero counts is then found by scanning cntCnt upwards from 1. That scan is O(sqrt(n)) at worst, because k distinct counts must consume at least 1 + 2 + ... + k elements, so the answer never exceeds about sqrt(2n) - the bound is what makes the naive scan acceptable.",
        "Values reach 10^9, and the values introduced by updates must go into the same compression table as the original array; compressing only the initial array is a silent wrong answer.",
        "Time: O(n^(5/3)) pointer movement plus O(q sqrt(n)) for the Mex scans. Space: O(n + q).",
      ],
    },
  ],
};
