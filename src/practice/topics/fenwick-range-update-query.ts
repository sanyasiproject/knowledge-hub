import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Range Addition",
      difficulty: "Easy",
      variation: "Difference array, offline range add then read every value",
      link: "https://leetcode.com/problems/range-addition/",
      question: [
        "You are given an integer length and a list updates where updates[i] = [startIndex, endIndex, inc]. You have an array arr of size length initialised with all zeros. For each update you must add inc to every element arr[startIndex..endIndex] inclusive. Return arr after applying all the updates.",
        "Example 1:\nInput: length = 5, updates = [[1,3,2],[2,4,3],[0,2,-2]]\nOutput: [-2,0,3,5,3]\nExplanation: After the first update the array is [0,2,2,2,0]; after the second it is [0,2,5,5,3]; after the third it is [-2,0,3,5,3].",
        "Example 2:\nInput: length = 3, updates = [[0,2,4]]\nOutput: [4,4,4]",
        "Constraints:\n- 1 <= length <= 10^5\n- 0 <= updates.length <= 10^4\n- 0 <= startIndex <= endIndex < length\n- -1000 <= inc <= 1000",
      ],
      code: `vector<int> getModifiedArray(int length, vector<vector<int>>& updates) {
    vector<int> diff(length + 1, 0);   // one extra slot so endIndex + 1 is always valid
    for (auto& u : updates) {
        diff[u[0]] += u[2];
        diff[u[1] + 1] -= u[2];       // cancel the increment just past the range
    }
    vector<int> res(length);
    int run = 0;
    for (int i = 0; i < length; i++) {
        run += diff[i];
        res[i] = run;
    }
    return res;
}`,
      explanation: [
        "This is the identity the whole topic is built on: a range add on an array is a pair of point updates on its difference array. If d[i] = a[i] - a[i-1], then adding x to a[l..r] changes exactly two entries of d - it adds x at l and subtracts x at r+1 - because every interior difference is unaffected when both neighbours move by the same amount.",
        "Recovering a from d is a prefix sum. So k range adds followed by one full read cost O(k + n) rather than O(k * n), which is the naive per-element loop.",
        "The trap is forgetting the r+1 subtraction, or sizing the difference array at exactly length so that r = length - 1 writes out of bounds. Allocate length + 1 slots and let the last one be harmlessly ignored.",
        "This offline version needs no Fenwick tree at all. The tree only becomes necessary when updates and reads are interleaved, which is the next problem.",
        "Time: O(n + k). Space: O(n).",
      ],
    },
    {
      name: "Update the array!",
      difficulty: "Easy",
      variation: "Fenwick over the difference array: range update, point query",
      link: "https://www.spoj.com/problems/UPDATEIT/",
      question: [
        "You are given an array of N elements, all initially zero, and U update operations. Each update gives l, r and val, meaning add val to every element with index in [l, r] (indices are 0-based). After all updates you are given Q queries, each a single index; print the value stored at that index. The first line of input is the number of test cases T.",
        "Example 1:\nInput:\n1\n5 3\n0 1 7\n2 4 8\n1 3 4\n2\n0\n3\nOutput:\n7\n12\nExplanation: After the three updates the array is [7,11,12,12,8]. Index 0 holds 7 and index 3 holds 12.",
        "Constraints:\n- 1 <= T <= 10\n- 1 <= N <= 10^5\n- 1 <= U <= 10^5\n- 1 <= Q <= 10^5\n- 0 <= l <= r < N, 0 <= val <= 10^5",
      ],
      code: `int n;
vector<long long> bit;

void upd(int i, long long v) {          // point add on the difference array
    for (; i <= n; i += i & -i) bit[i] += v;
}

long long qry(int i) {                  // prefix sum = actual array value
    long long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int u;
        cin >> n >> u;
        bit.assign(n + 2, 0);
        while (u--) {
            int l, r;
            long long v;
            cin >> l >> r >> v;
            upd(l + 1, v);              // shift to 1-based indexing
            upd(r + 2, -v);             // r+2 may exceed n; the loop then does nothing
        }
        int q;
        cin >> q;
        while (q--) {
            int idx;
            cin >> idx;
            cout << qry(idx + 1) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Store the difference array inside a Fenwick tree instead of a plain array. A range add becomes two point updates, and a point read becomes a prefix sum - both operations a standard Fenwick tree already supports in O(log n). No new data structure is needed, only a change of what the tree represents.",
        "The invariant is that bit always encodes d, where a[i] equals d[1] + ... + d[i]. Every range add preserves it by construction, so every prefix query returns the true current value.",
        "Indices must be shifted by one because a Fenwick tree cannot hold index 0: the update loop i += i & -i would spin forever on 0. That is why l becomes l+1 and the cancelling write lands at r+2.",
        "This problem is fully offline, so a difference array would also pass. Use the tree when queries and updates interleave, or when the same array must later also answer range sums.",
        "Time: O((U + Q) log N) per test case. Space: O(N).",
      ],
    },
    {
      name: "Range Update Queries",
      difficulty: "Medium",
      variation: "Range add and point query interleaved, with a non-zero initial array",
      link: "https://cses.fi/problemset/task/1651",
      question: [
        "You are given an array of n integers. Process q queries of two kinds. Type '1 a b u' increases every value in positions a..b by u. Type '2 k' prints the current value at position k. Positions are 1-based.",
        "Example 1:\nInput:\n8 3\n3 2 4 5 1 1 5 3\n2 4\n1 2 5 1\n2 4\nOutput:\n5\n6\nExplanation: Position 4 initially holds 5. The update adds 1 to positions 2..5, so position 4 then holds 6.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a <= b <= n, 1 <= k <= n\n- 1 <= array values, u <= 10^9",
      ],
      code: `int n;
vector<long long> bit;

void upd(int i, long long v) {
    for (; i <= n; i += i & -i) bit[i] += v;
}

long long qry(int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    bit.assign(n + 2, 0);               // holds only the deltas, not the base array
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int l, r;
            long long u;
            cin >> l >> r >> u;
            upd(l, u);
            upd(r + 1, -u);
        } else {
            int k;
            cin >> k;
            cout << a[k] + qry(k) << "\\n";   // base value plus accumulated delta
        }
    }
    return 0;
}`,
      explanation: [
        "Keeping the initial array separate from the tree is the clean trick here. The Fenwick tree stores only the difference array of the updates, so its prefix sum at k is exactly the total amount added to position k so far. The answer is a[k] plus that delta.",
        "The alternative - seeding the tree with the difference array of a itself - also works, but it is easier to get wrong and gains nothing, since a[k] is a single array read.",
        "Because updates and queries interleave, no offline sweep is available: this genuinely needs a logarithmic structure. That is the dividing line between this problem and Range Addition.",
        "Watch the arithmetic. Up to 2 * 10^5 updates of 10^9 each can pile onto one position, so a single value can reach 2 * 10^14 - the tree and the base array must both be 64-bit.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Corporate Flight Bookings",
      difficulty: "Medium",
      variation: "Range add over a fixed universe, then one full readout",
      link: "https://leetcode.com/problems/corporate-flight-bookings/",
      question: [
        "There are n flights labelled 1 to n. You are given a list bookings where bookings[i] = [first, last, seats] means that seats seats were reserved on every flight from first to last inclusive. Return an array answer of length n where answer[i] is the total number of seats reserved for flight i + 1.",
        "Example 1:\nInput: n = 5, bookings = [[1,2,10],[2,3,20],[2,5,25]]\nOutput: [10,55,45,25,25]\nExplanation: Flight 2 is covered by all three bookings, giving 10 + 20 + 25 = 55; flight 3 is covered by the last two, giving 45.",
        "Example 2:\nInput: n = 2, bookings = [[1,2,10],[2,2,15]]\nOutput: [10,25]",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- 1 <= bookings.length <= 2 * 10^4\n- 1 <= first <= last <= n\n- 1 <= seats <= 10^4",
      ],
      code: `vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
    vector<long long> diff(n + 2, 0);   // 1-based, with room for last + 1
    for (auto& b : bookings) {
        diff[b[0]] += b[2];
        diff[b[1] + 1] -= b[2];
    }
    vector<int> res(n);
    long long run = 0;
    for (int i = 1; i <= n; i++) {
        run += diff[i];
        res[i - 1] = (int)run;
    }
    return res;
}`,
      explanation: [
        "Every booking is a range add and there is exactly one read phase at the end, so the difference array plus a single prefix-sum pass is optimal. Simulating each booking element by element is O(n * m) and times out on the upper limits.",
        "The prefix sum works because the running total at index i is the sum of all deltas at or before i, which counts precisely the bookings whose first is at most i and whose last + 1 is greater than i - in other words the bookings that cover flight i.",
        "Totals reach 2 * 10^4 bookings times 10^4 seats, or 2 * 10^8, which still fits in a signed 32-bit int but only just; accumulating in 64-bit and narrowing at the end removes any doubt.",
        "Time: O(n + m). Space: O(n).",
      ],
    },
    {
      name: "Car Pooling",
      difficulty: "Medium",
      variation: "Range add plus a running maximum over the swept prefix",
      link: "https://leetcode.com/problems/car-pooling/",
      question: [
        "There is a car with capacity empty seats travelling east only. You are given trips where trips[i] = [numPassengers, from, to] meaning numPassengers passengers board at kilometre from and leave at kilometre to. Return true if and only if it is possible to pick up and drop off all the passengers for all the given trips without ever exceeding capacity.",
        "Example 1:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false\nExplanation: Between kilometres 3 and 5 both trips are on board, giving 5 passengers in a 4-seat car.",
        "Example 2:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 5\nOutput: true",
        "Constraints:\n- 1 <= trips.length <= 1000\n- 1 <= numPassengers <= 100\n- 0 <= from < to <= 1000\n- 1 <= capacity <= 10^5",
      ],
      code: `bool carPooling(vector<vector<int>>& trips, int capacity) {
    vector<int> diff(1002, 0);
    for (auto& t : trips) {
        diff[t[1]] += t[0];
        diff[t[2]] -= t[0];      // passengers leave exactly at 'to', not after it
    }
    int cur = 0;
    for (int i = 0; i <= 1001; i++) {
        cur += diff[i];
        if (cur > capacity) return false;
    }
    return true;
}`,
      explanation: [
        "Each trip is a range add of numPassengers over the half-open interval [from, to). Sweeping the prefix sum left to right replays the occupancy of the car at every kilometre, and the answer is whether that occupancy ever exceeds capacity.",
        "The half-open convention is the whole subtlety. Subtracting at to rather than to + 1 encodes that a passenger who leaves at kilometre 5 does not occupy a seat at kilometre 5, so a trip ending at 5 and another starting at 5 never overlap. Using to + 1 here produces spurious failures.",
        "Because coordinates are bounded by 1000 a plain array suffices. If from and to could reach 10^9 the same sweep would run over sorted, coordinate-compressed event points, or over a Fenwick tree indexed by compressed coordinate - the pattern is unchanged.",
        "Note that the query here is a prefix maximum, not a prefix sum, which a Fenwick difference tree cannot answer directly. That is fine only because the whole sweep is offline; an online version would need a segment tree over the prefix sums.",
        "Time: O(n + C) where C is the coordinate range. Space: O(C).",
      ],
    },
    {
      name: "Little Girl and Maximum Sum",
      difficulty: "Medium",
      variation: "Range add to build coverage counts, then greedy re-pairing",
      link: "https://codeforces.com/problemset/problem/276/C",
      question: [
        "The girl has an array of n integers and q queries, each query being a pair (l, r) whose value is the sum of the array elements at positions l..r. Before answering, she may reorder the array elements however she likes. Print the maximum possible total of the answers to all q queries.",
        "Example 1:\nInput:\n3 3\n5 3 2\n1 2\n2 3\n1 3\nOutput: 25\nExplanation: Position 2 is covered by all 3 queries and positions 1 and 3 by 2 each. Putting 5 at position 2 gives 5*3 + 3*2 + 2*2 = 25.",
        "Example 2:\nInput:\n5 3\n5 2 4 1 3\n1 5\n2 3\n2 3\nOutput: 33\nExplanation: The coverage counts are 1, 3, 3, 1, 1, so the total is 5*3 + 4*3 + 3*1 + 2*1 + 1*1 = 33.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 0 <= array values <= 2 * 10^5\n- 1 <= l <= r <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> diff(n + 2, 0);
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        diff[l]++;
        diff[r + 1]--;
    }
    vector<long long> cnt(n);
    long long run = 0;
    for (int i = 1; i <= n; i++) {
        run += diff[i];
        cnt[i - 1] = run;               // how many queries cover position i
    }
    sort(a.rbegin(), a.rend());
    sort(cnt.rbegin(), cnt.rend());
    long long ans = 0;
    for (int i = 0; i < n; i++) ans += a[i] * cnt[i];   // largest value to largest weight
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The total over all queries equals the sum over positions of value[p] times coverage[p], where coverage[p] is the number of queries containing p. Computing every coverage count is q range adds of 1 followed by one readout, so a difference array does it in O(n + q).",
        "Choosing the arrangement is then the rearrangement inequality: to maximise a sum of pairwise products, pair the sorted values with the sorted weights in the same order. Sorting both descending and multiplying position by position is optimal, and no other pairing can beat it.",
        "The tempting wrong move is answering each query by iterating over its range, which is O(n * q) and hits 4 * 10^10 operations. The other trap is arithmetic: coverage can reach 2 * 10^5 and values 2 * 10^5 across 2 * 10^5 positions, so the total can exceed 10^15 and must be 64-bit.",
        "Time: O(n log n + q). Space: O(n).",
      ],
    },
    {
      name: "Maximum Sum Obtained of Any Permutation",
      difficulty: "Medium",
      variation: "Coverage counts by range add, answer modulo a prime",
      link: "https://leetcode.com/problems/maximum-sum-obtained-of-any-permutation/",
      question: [
        "You are given an array nums and a list requests where requests[i] = [start, end] asks for the sum of nums[start] + nums[start+1] + ... + nums[end]. Both indices are inclusive and 0-based. Return the maximum total sum of all the requests among all permutations of nums, modulo 10^9 + 7.",
        "Example 1:\nInput: nums = [1,2,3,4,5], requests = [[1,3],[0,1]]\nOutput: 19\nExplanation: The coverage counts per index are 1, 2, 1, 1, 0. Pairing sorted values 5,4,3,2,1 with sorted counts 2,1,1,1,0 gives 10 + 4 + 3 + 2 + 0 = 19.",
        "Example 2:\nInput: nums = [1,2,3,4,5,6], requests = [[0,1]]\nOutput: 11\nExplanation: Only two indices are covered once each, so place the two largest values there: 6 + 5 = 11.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] <= 10^5\n- 1 <= requests.length <= 10^5\n- 0 <= start <= end < nums.length",
      ],
      code: `int maxSumRangeQuery(vector<int>& nums, vector<vector<int>>& requests) {
    int n = nums.size();
    vector<long long> diff(n + 1, 0);
    for (auto& r : requests) {
        diff[r[0]]++;
        diff[r[1] + 1]--;
    }
    vector<long long> cnt(n);
    long long run = 0;
    for (int i = 0; i < n; i++) {
        run += diff[i];
        cnt[i] = run;
    }
    sort(cnt.rbegin(), cnt.rend());
    sort(nums.rbegin(), nums.rend());
    const long long MOD = 1000000007LL;
    long long ans = 0;
    for (int i = 0; i < n; i++) ans = (ans + cnt[i] * nums[i]) % MOD;   // products fit in 64 bits
    return (int)ans;
}`,
      explanation: [
        "Identical structure to the coverage-count problem: every request is a range add of one, a single prefix-sum pass turns those adds into a weight per index, and the rearrangement inequality says to match the largest weight with the largest value.",
        "The reason the greedy is exact, not heuristic, is that the objective is linear in the assignment. Swapping any inverted pair - a bigger value sitting on a smaller weight - strictly increases the total, so the sorted pairing is the unique optimum up to ties.",
        "The modulus is the trap. Reduce only at the very end of each accumulation, never when sorting or comparing: taking counts or values modulo before pairing would destroy the ordering that the greedy depends on. Since counts and values are both at most 10^5, each product is at most 10^10 and safe in a signed 64-bit accumulator.",
        "Time: O(n log n + m). Space: O(n).",
      ],
    },
    {
      name: "Number of Flowers in Full Bloom",
      difficulty: "Medium",
      variation: "Range add over compressed coordinates, point query per person",
      link: "https://leetcode.com/problems/number-of-flowers-in-full-bloom/",
      question: [
        "You are given a 0-indexed 2D array flowers where flowers[i] = [start, end] means the i-th flower is in full bloom from start to end inclusive, and a 0-indexed array people where people[j] is the time the j-th person arrives. Return an array answer of the same length as people, where answer[j] is the number of flowers in full bloom when person j arrives.",
        "Example 1:\nInput: flowers = [[1,6],[3,7],[9,12],[4,13]], people = [2,3,7,11]\nOutput: [1,2,2,2]\nExplanation: At time 2 only [1,6] blooms. At time 3 both [1,6] and [3,7] bloom. At time 7 the flowers [3,7] and [4,13] bloom. At time 11 the flowers [9,12] and [4,13] bloom.",
        "Example 2:\nInput: flowers = [[1,10],[3,3]], people = [3,3,2]\nOutput: [2,2,1]",
        "Constraints:\n- 1 <= flowers.length <= 5 * 10^4\n- 1 <= people.length <= 5 * 10^4\n- 1 <= start <= end <= 10^9\n- 1 <= people[j] <= 10^9",
      ],
      code: `vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {
    vector<int> coords;
    for (auto& f : flowers) {
        coords.push_back(f[0]);
        coords.push_back(f[1]);
    }
    for (int p : people) coords.push_back(p);
    sort(coords.begin(), coords.end());
    coords.erase(unique(coords.begin(), coords.end()), coords.end());
    int m = coords.size();
    vector<int> bit(m + 2, 0);
    auto rank1 = [&](int v) {           // 1-based rank of a value among the compressed coords
        return (int)(lower_bound(coords.begin(), coords.end(), v) - coords.begin()) + 1;
    };
    auto upd = [&](int i, int v) {
        for (; i <= m; i += i & -i) bit[i] += v;
    };
    for (auto& f : flowers) {
        upd(rank1(f[0]), 1);
        upd(rank1(f[1]) + 1, -1);      // may be m+1, in which case the loop is a no-op
    }
    vector<int> ans;
    ans.reserve(people.size());
    for (int p : people) {
        int s = 0;
        for (int i = rank1(p); i > 0; i -= i & -i) s += bit[i];
        ans.push_back(s);
    }
    return ans;
}`,
      explanation: [
        "Each flower contributes +1 to every time in [start, end], and each person asks for the value at a single time. That is exactly range update with point query, so a Fenwick tree over the difference array answers it.",
        "Times reach 10^9, so the tree cannot be indexed by time directly. Compressing all flower endpoints together with all query times into at most 1.5 * 10^5 ranks preserves every comparison that matters: no boundary falls strictly between two adjacent ranks, so cancelling the increment at rank(end) + 1 is still correct even though the real gap may be huge.",
        "The endpoints must be compressed together with the query times, not separately. Compressing them in independent arrays makes the ranks incomparable and silently returns wrong counts.",
        "The classic non-tree alternative is to sort all starts and all ends and answer each person with two binary searches: started minus already finished. It is shorter, but only works because every query is known up front - the Fenwick version keeps working if flowers are added online.",
        "Time: O((n + q) log(n + q)). Space: O(n + q).",
      ],
    },
    {
      name: "Horrible Queries",
      difficulty: "Hard",
      variation: "Two Fenwick trees: range update AND range sum",
      link: "https://www.spoj.com/problems/HORRIBLE/",
      question: [
        "You are given an array of N elements, all initially zero, and C commands. A command '0 p q v' adds v to every element in positions p..q. A command '1 p q' prints the sum of the elements in positions p..q. Positions are 1-based. The first line of input is the number of test cases T.",
        "Example 1:\nInput:\n1\n8 6\n0 2 4 26\n0 4 8 80\n0 4 5 20\n1 8 8\n0 5 7 14\n1 4 8\nOutput:\n80\n508\nExplanation: After the first three updates the array is [0,26,26,126,100,80,80,80], so the sum over 8..8 is 80. After adding 14 to positions 5..7 the array is [0,26,26,126,114,94,94,80] and 126+114+94+94+80 = 508.",
        "Constraints:\n- 1 <= T <= 10\n- 1 <= N <= 10^5\n- 1 <= C <= 10^5\n- 1 <= p <= q <= N, 0 <= v <= 10^7",
      ],
      code: `int n;
vector<long long> b1, b2;

void add(vector<long long>& b, int i, long long v) {
    for (; i <= n; i += i & -i) b[i] += v;
}

long long sum(vector<long long>& b, int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) s += b[i];
    return s;
}

void rangeAdd(int l, int r, long long x) {
    add(b1, l, x);
    add(b1, r + 1, -x);
    add(b2, l, x * (l - 1));     // correction terms so prefix() stays exact
    add(b2, r + 1, -x * r);
}

long long prefix(int i) {
    return sum(b1, i) * i - sum(b2, i);
}

long long rangeSum(int l, int r) {
    return prefix(r) - prefix(l - 1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int c;
        cin >> n >> c;
        b1.assign(n + 2, 0);
        b2.assign(n + 2, 0);
        while (c--) {
            int type, p, q;
            cin >> type;
            if (type == 0) {
                long long v;
                cin >> p >> q >> v;
                rangeAdd(p, q, v);
            } else {
                cin >> p >> q;
                cout << rangeSum(p, q) << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "One Fenwick tree over the difference array gives range update with point query, but its prefix sum is a single element, not a sum of elements. The fix is to keep the difference array in b1 and a correction tree b2 such that the true prefix sum of the real array is sum(b1, i) * i - sum(b2, i).",
        "Where that comes from: after adding x to l..r, the real prefix sum at i is 0 for i < l, x * (i - l + 1) for l <= i <= r, and x * (r - l + 1) for i > r. In the middle band sum(b1, i) is x so the term sum(b1, i) * i overshoots by exactly x * (l - 1), which is what b2 stores at l. Past the right end sum(b1, i) is zero, so the whole answer has to come out of b2, which is why the cancelling entry there is -x * r rather than -x * (l - 1). Both cases are linear in i and additive, so they compose over any number of updates.",
        "Once prefix() is exact, a range sum is the usual prefix(r) - prefix(l-1). Every operation is a constant number of Fenwick walks, so this matches a lazy segment tree asymptotically with roughly a third of the code and a much smaller constant.",
        "The trap is the b2 update: writing -x * (l - 1) instead of -x * r at r + 1 gives a structure that looks right on updates touching a prefix and is wrong everywhere else. Test with two overlapping updates and a query strictly to the right of both.",
        "Sizes matter too: v up to 10^7 over 10^5 updates makes a single element reach 10^12 and a full-array sum reach 10^17, so every accumulator including the x * (l - 1) products must be 64-bit.",
        "Time: O((N + C) log N) per test case. Space: O(N).",
      ],
    },
    {
      name: "Range Updates and Sums",
      difficulty: "Hard",
      variation: "Range assign breaks the two-BIT trick: lazy segment tree",
      link: "https://cses.fi/problemset/task/1735",
      question: [
        "You are given an array of n integers and must process q operations of three kinds. Operation '1 a b x' increases each value in positions a..b by x. Operation '2 a b x' sets each value in positions a..b to x. Operation '3 a b' prints the sum of the values in positions a..b. Positions are 1-based.",
        "Example 1:\nInput:\n5 4\n1 2 3 4 5\n3 1 5\n1 2 4 2\n2 3 5 4\n3 1 5\nOutput:\n15\n17\nExplanation: The initial array sums to 15. Adding 2 to positions 2..4 gives [1,4,5,6,5]; assigning 4 to positions 3..5 gives [1,4,4,4,4], which sums to 17.",
        "Example 2:\nInput:\n3 3\n1 1 1\n2 1 3 5\n1 1 1 2\n3 1 3\nOutput:\n17\nExplanation: Assigning 5 everywhere gives [5,5,5]; adding 2 to position 1 gives [7,5,5], which sums to 17.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 0 <= array values, x <= 10^9",
      ],
      code: `int n, q;
vector<long long> sm, lzAdd, lzSet, a;
vector<char> hasSet;

void applySet(int node, int len, long long v) {
    sm[node] = v * len;
    lzSet[node] = v;
    hasSet[node] = 1;
    lzAdd[node] = 0;            // an assignment wipes any pending add below it
}

void applyAdd(int node, int len, long long v) {
    sm[node] += v * len;
    lzAdd[node] += v;
}

void push(int node, int l, int r) {
    int m = (l + r) / 2;
    int ll = m - l + 1, rl = r - m;
    if (hasSet[node]) {         // assignment must be pushed before the add
        applySet(2 * node, ll, lzSet[node]);
        applySet(2 * node + 1, rl, lzSet[node]);
        hasSet[node] = 0;
    }
    if (lzAdd[node] != 0) {
        applyAdd(2 * node, ll, lzAdd[node]);
        applyAdd(2 * node + 1, rl, lzAdd[node]);
        lzAdd[node] = 0;
    }
}

void build(int node, int l, int r) {
    if (l == r) { sm[node] = a[l]; return; }
    int m = (l + r) / 2;
    build(2 * node, l, m);
    build(2 * node + 1, m + 1, r);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

void rangeAdd(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, r - l + 1, v); return; }
    push(node, l, r);
    int m = (l + r) / 2;
    rangeAdd(2 * node, l, m, ql, qr, v);
    rangeAdd(2 * node + 1, m + 1, r, ql, qr, v);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

void rangeSet(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applySet(node, r - l + 1, v); return; }
    push(node, l, r);
    int m = (l + r) / 2;
    rangeSet(2 * node, l, m, ql, qr, v);
    rangeSet(2 * node + 1, m + 1, r, ql, qr, v);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[node];
    push(node, l, r);
    int m = (l + r) / 2;
    return query(2 * node, l, m, ql, qr) + query(2 * node + 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    sm.assign(4 * (n + 1), 0);
    lzAdd.assign(4 * (n + 1), 0);
    lzSet.assign(4 * (n + 1), 0);
    hasSet.assign(4 * (n + 1), 0);
    build(1, 1, n);
    while (q--) {
        int type, l, r;
        cin >> type >> l >> r;
        if (type == 1) {
            long long x;
            cin >> x;
            rangeAdd(1, 1, n, l, r, x);
        } else if (type == 2) {
            long long x;
            cin >> x;
            rangeSet(1, 1, n, l, r, x);
        } else {
            cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the boundary of the topic and worth knowing precisely. The two-Fenwick construction works because range add is linear: its effect on any prefix sum is an affine function of the index, which is what the two trees encode. Range assign is not linear in that sense - its effect depends on the values already present - so no pair of Fenwick trees can represent it, and a lazy segment tree is required.",
        "The state per node is the subtree sum plus two pending operations: an optional assignment and an additive delta. The composition rule is the crux. An incoming assignment overwrites everything below, so it clears the stored add; an incoming add composes with whatever is stored by simply accumulating. Reading a node therefore means 'first assign lzSet if present, then add lzAdd'.",
        "Because of that ordering, push must propagate the assignment to both children before the add. Doing it the other way round loses the add that arrived after the assignment, which is the single most common bug in this problem.",
        "Values reach 10^9 and 2 * 10^5 positions can be assigned at once, so a node sum reaches 2 * 10^14 and every sum, lazy value and v * len product must be 64-bit.",
        "Also note what is lost: the segment tree gives full generality at roughly three times the code and a noticeably larger constant factor. When the only update is a range add, prefer the two-Fenwick version.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
  ],
};
