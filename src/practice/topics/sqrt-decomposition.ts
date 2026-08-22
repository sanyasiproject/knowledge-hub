import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Dynamic Range Sum Queries",
      difficulty: "Easy",
      variation: "Block sums with point update, the template",
      link: "https://cses.fi/problemset/task/1648",
      question: [
        "You are given an array of n integers and q queries of two kinds. Query '1 k u' sets the value at position k to u. Query '2 a b' asks for the sum of the values in positions a..b. Positions are 1-indexed. Print the answer to every query of the second kind.",
        "Split the array into consecutive blocks of about sqrt(n) elements and keep the sum of each block, so a point update touches one block and a range query touches at most two partial blocks plus a run of whole blocks.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 1 4\n2 5 6\n1 3 1\n2 1 4\nOutput:\n14\n2\n11\nExplanation: 3+2+4+5 = 14, then 1+1 = 2. Setting position 3 to 1 makes the array 3 2 1 5 1 1 5 3, so the first range becomes 3+2+1+5 = 11.",
        "Example 2:\nInput:\n3 3\n1 2 3\n2 1 3\n1 1 10\n2 1 3\nOutput:\n6\n15\nExplanation: 1+2+3 = 6, then position 1 becomes 10 and 10+2+3 = 15.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values, u <= 10^9\n- 1 <= k <= n and 1 <= a <= b <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));      // block size about sqrt(n)
    int nb = (n + B - 1) / B;
    vector<long long> blk(nb, 0);
    for (int i = 0; i < n; i++) blk[i / B] += a[i];
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k;
            long long u;
            cin >> k >> u;
            --k;
            blk[k / B] += u - a[k];            // repair the block sum by the delta
            a[k] = u;
        } else {
            int l, r;
            cin >> l >> r;
            --l; --r;
            long long s = 0;
            int bl = l / B, br = r / B;
            if (bl == br) {
                for (int i = l; i <= r; i++) s += a[i];
            } else {
                for (int i = l; i < (bl + 1) * B; i++) s += a[i];   // left partial block
                for (int b = bl + 1; b < br; b++) s += blk[b];      // whole blocks
                for (int i = br * B; i <= r; i++) s += a[i];        // right partial block
            }
            cout << s << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The stored state is one aggregate per block: blk[b] is the sum of the elements whose index divides into block b. The invariant is that blk[b] always equals the sum of the live values in that block, and every write restores it immediately.",
        "A range query decomposes into at most two partial blocks and the whole blocks strictly between them. There are fewer than n/B whole blocks and fewer than 2B partial elements, so the cost is O(n/B + B), minimised at B = sqrt(n) giving O(sqrt(n)) per operation.",
        "Because the aggregate here is a sum, the point update is O(1): add the delta u - a[k] to the block instead of rescanning the block. That shortcut only exists for invertible aggregates - see the minimum version of this problem.",
        "The tempting wrong approach is a prefix-sum array, which answers queries in O(1) but needs O(n) per update; sqrt decomposition trades a slower query for a much cheaper update, and it is far less code than a Fenwick tree or segment tree when the aggregate is unusual.",
        "Time: O(n) to build plus O(sqrt(n)) per query, so O((n + q) sqrt(n)). Space: O(n).",
      ],
    },
    {
      name: "Dynamic Range Minimum Queries",
      difficulty: "Easy",
      variation: "Non-invertible block aggregate, rebuild on update",
      link: "https://cses.fi/problemset/task/1649",
      question: [
        "You are given an array of n integers and q queries of two kinds. Query '1 k u' sets the value at position k to u. Query '2 a b' asks for the minimum value in positions a..b. Positions are 1-indexed. Print the answer to every query of the second kind.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 1 4\n2 5 6\n1 3 1\n2 1 4\nOutput:\n2\n1\n1\nExplanation: min(3,2,4,5) = 2 and min(1,1) = 1. After position 3 becomes 1 the first range is 3 2 1 5 with minimum 1.",
        "Example 2:\nInput:\n5 3\n5 4 3 2 1\n2 1 5\n1 5 9\n2 1 5\nOutput:\n1\n2\nExplanation: the minimum is 1, then raising the last element to 9 leaves 5 4 3 2 9 whose minimum is 2.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values, u <= 10^9\n- 1 <= k <= n and 1 <= a <= b <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));
    int nb = (n + B - 1) / B;
    const long long INF = (long long)4e18;
    vector<long long> bm(nb, INF);
    auto rebuild = [&](int b) {                 // recompute one block minimum
        long long m = INF;
        for (int i = b * B; i < min(n, (b + 1) * B); i++) m = min(m, a[i]);
        bm[b] = m;
    };
    for (int b = 0; b < nb; b++) rebuild(b);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k;
            long long u;
            cin >> k >> u;
            --k;
            a[k] = u;
            rebuild(k / B);                     // a raised value can destroy the old minimum
        } else {
            int l, r;
            cin >> l >> r;
            --l; --r;
            long long res = INF;
            int bl = l / B, br = r / B;
            if (bl == br) {
                for (int i = l; i <= r; i++) res = min(res, a[i]);
            } else {
                for (int i = l; i < (bl + 1) * B; i++) res = min(res, a[i]);
                for (int b = bl + 1; b < br; b++) res = min(res, bm[b]);
                for (int i = br * B; i <= r; i++) res = min(res, a[i]);
            }
            cout << res << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Same block layout as the sum version, but the aggregate is a minimum, and minimum has no inverse. Knowing the old value and the new value is not enough to repair bm[b]: if the element that was the unique minimum grows, the new block minimum could be any other element.",
        "So the update rebuilds the whole block in O(B) = O(sqrt(n)). That keeps both operations at O(sqrt(n)) and is the general recipe: sqrt decomposition needs only that the aggregate be mergeable across blocks, never that it be invertible.",
        "A one-sided shortcut is legal and worth knowing: if u <= bm[b] you may set bm[b] = u directly, since lowering a value can only lower the minimum. Only the case where the value increases forces a rescan.",
        "The trap is initialising res or bm with a sentinel that a real value can reach. With values up to 10^9 a 32-bit INT_MAX sentinel is safe here, but the moment sums or offsets enter the aggregate a 64-bit sentinel avoids silent wrap-around.",
        "Time: O((n + q) sqrt(n)). Space: O(n).",
      ],
    },
    {
      name: "Range Sum Query - Mutable",
      difficulty: "Medium",
      variation: "Class API, point update plus range sum",
      link: "https://leetcode.com/problems/range-sum-query-mutable/",
      question: [
        "Design a data structure over an integer array nums that supports two operations. update(index, val) replaces nums[index] with val. sumRange(left, right) returns the sum of nums[left..right] inclusive. Both indices are 0-indexed and both operations may be called many times in any order.",
        "Example 1:\nInput:\nNumArray([1, 3, 5])\nsumRange(0, 2)\nupdate(1, 2)\nsumRange(0, 2)\nOutput: [null, 9, null, 8]\nExplanation: 1+3+5 = 9. After update the array is [1, 2, 5], so 1+2+5 = 8.",
        "Example 2:\nInput:\nNumArray([-1, 0, 4, 2])\nsumRange(1, 3)\nupdate(0, 5)\nsumRange(0, 1)\nOutput: [null, 6, null, 5]\nExplanation: 0+4+2 = 6. After update the array is [5, 0, 4, 2], so 5+0 = 5.",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -100 <= nums[i], val <= 100\n- 0 <= index < nums.length and 0 <= left <= right < nums.length\n- At most 3 * 10^4 calls to update and sumRange",
      ],
      code: `class NumArray {
    vector<int> a;
    vector<long long> blk;
    int n, B;

public:
    NumArray(vector<int>& nums) : a(nums), n((int)nums.size()) {
        B = max(1, (int)sqrt((double)n));
        blk.assign((n + B - 1) / B, 0);
        for (int i = 0; i < n; i++) blk[i / B] += a[i];
    }

    void update(int index, int val) {
        blk[index / B] += val - a[index];      // sums are invertible, so O(1)
        a[index] = val;
    }

    int sumRange(int left, int right) {
        long long s = 0;
        int bl = left / B, br = right / B;
        if (bl == br) {
            for (int i = left; i <= right; i++) s += a[i];
        } else {
            for (int i = left; i < (bl + 1) * B; i++) s += a[i];
            for (int b = bl + 1; b < br; b++) s += blk[b];
            for (int i = br * B; i <= right; i++) s += a[i];
        }
        return (int)s;
    }
};`,
      explanation: [
        "This is the canonical interview framing of the pattern. The array is partitioned into blocks of sqrt(n); blk[b] caches the sum of block b, and the raw array stays authoritative so partial blocks can be scanned element by element.",
        "Correctness rests on the partition being a disjoint cover: every index belongs to exactly one block, so summing whole blocks plus the leftover ends counts each element exactly once. Off-by-one bugs come from letting the whole-block loop overlap the partial ends, which is why it runs strictly from bl+1 to br-1.",
        "The single-block case must be special-cased. If bl == br there is no interior run, and the two-partial-block code would scan past right into the rest of the block.",
        "A Fenwick tree solves this in O(log n) per operation and is the better answer if the interviewer only wants sums. Sqrt decomposition earns its place when the aggregate is something a Fenwick tree cannot merge - order statistics, counts under a threshold, mode - and here it is the easiest correct thing to write under time pressure.",
        "Time: O(n) construction, O(1) update, O(sqrt(n)) sumRange. Space: O(n).",
      ],
    },
    {
      name: "Range Update Queries",
      difficulty: "Medium",
      variation: "Block lazy add with point query",
      link: "https://cses.fi/problemset/task/1651",
      question: [
        "You are given an array of n integers and q queries of two kinds. Query '1 a b u' increases every value in positions a..b by u. Query '2 k' asks for the current value at position k. Positions are 1-indexed. Print the answer to every query of the second kind.",
        "Example 1:\nInput:\n8 3\n3 2 4 5 1 1 5 3\n2 4\n1 2 5 1\n2 4\nOutput:\n5\n6\nExplanation: position 4 starts at 5. Adding 1 to positions 2..5 makes it 6.",
        "Example 2:\nInput:\n4 4\n1 1 1 1\n1 1 4 5\n2 1\n1 3 4 2\n2 3\nOutput:\n6\n8\nExplanation: after adding 5 everywhere the array is 6 6 6 6, so position 1 is 6. Adding 2 to positions 3..4 gives 6 6 8 8, so position 3 is 8.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values, u <= 10^9\n- 1 <= a <= b <= n and 1 <= k <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));
    int nb = (n + B - 1) / B;
    vector<long long> lz(nb, 0);               // pending add shared by a whole block
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int l, r;
            long long u;
            cin >> l >> r >> u;
            --l; --r;
            int bl = l / B, br = r / B;
            if (bl == br) {
                for (int i = l; i <= r; i++) a[i] += u;
            } else {
                for (int i = l; i < (bl + 1) * B; i++) a[i] += u;   // partial: touch elements
                for (int b = bl + 1; b < br; b++) lz[b] += u;       // whole: touch one counter
                for (int i = br * B; i <= r; i++) a[i] += u;
            }
        } else {
            int k;
            cin >> k;
            --k;
            cout << a[k] + lz[k / B] << "\\n";  // true value = own value + block tag
        }
    }
    return 0;
}`,
      explanation: [
        "This is the mirror image of the previous problems: the range work moves to the update and the point work to the query. The representation is a[i] plus a per-block tag, and the invariant is that the real value at index i is always a[i] + lz[i / B].",
        "A range add hits at most two blocks partially, and those elements are updated individually so their own a[i] absorbs the delta. Every fully covered block instead bumps a single tag, which is why the update is O(sqrt(n)) and not O(n).",
        "The tag is never pushed down, so nothing needs a flush pass. That works precisely because addition is commutative and the query recombines a[i] with the tag at read time; a mixture of range-add and range-assign would break this and require real lazy propagation.",
        "Two traps: with u up to 10^9 and 2 * 10^5 updates a single cell can exceed 2 * 10^14, so 64-bit is mandatory; and a partial-block update must NOT also touch the tag, or the affected elements get the delta twice.",
        "Time: O(sqrt(n)) per update, O(1) per point query. Space: O(n).",
      ],
    },
    {
      name: "Horrible Queries",
      difficulty: "Medium",
      variation: "Range add plus range sum with block tags",
      link: "https://www.spoj.com/problems/HORRIBLE/",
      question: [
        "There are t test cases. Each test case starts with n and c: an array of n elements all initially 0, followed by c commands. A command '0 p q v' adds v to every element in positions p..q. A command '1 p q' asks for the sum of the elements in positions p..q. Positions are 1-indexed. Print the answer to every command of the second kind.",
        "Combine the two previous ideas: each block carries both the sum of its own stored values and a pending add tag, so a range add and a range sum are both O(sqrt(n)).",
        "Example 1:\nInput:\n1\n8 6\n0 2 4 26\n0 4 8 80\n0 4 5 20\n1 8 8\n0 5 7 14\n1 4 8\nOutput:\n80\n508\nExplanation: after the first three adds the array is 0 26 26 126 100 80 80 80, so position 8 alone is 80. Adding 14 to positions 5..7 gives 0 26 26 126 114 94 94 80, and 126+114+94+94+80 = 508.",
        "Example 2:\nInput:\n1\n5 3\n0 1 3 2\n0 2 5 3\n1 1 5\nOutput:\n19\nExplanation: the array becomes 2 5 5 3 3 and 2+5+5+3+3 = 19.",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= n <= 10^5 and 1 <= c <= 10^5\n- 0 <= v <= 10^7\n- 1 <= p <= q <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long n, c;
        cin >> n >> c;
        int N = (int)n;
        int B = max(1, (int)sqrt((double)N));
        int nb = (N + B - 1) / B;
        vector<long long> a(N, 0), bs(nb, 0), lz(nb, 0);   // values, block sums, block tags
        auto blockEnd = [&](int b) { return min(N, (b + 1) * B); };
        while (c--) {
            int type, l, r;
            cin >> type >> l >> r;
            --l; --r;
            int bl = l / B, br = r / B;
            if (type == 0) {
                long long v;
                cin >> v;
                if (bl == br) {
                    for (int i = l; i <= r; i++) a[i] += v;
                    bs[bl] += v * (r - l + 1);
                } else {
                    for (int i = l; i < blockEnd(bl); i++) a[i] += v;
                    bs[bl] += v * (blockEnd(bl) - l);
                    for (int b = bl + 1; b < br; b++) lz[b] += v;
                    for (int i = br * B; i <= r; i++) a[i] += v;
                    bs[br] += v * (r - br * B + 1);
                }
            } else {
                long long s = 0;
                if (bl == br) {
                    for (int i = l; i <= r; i++) s += a[i];
                    s += lz[bl] * (r - l + 1);                 // tag applies to each element read
                } else {
                    for (int i = l; i < blockEnd(bl); i++) s += a[i];
                    s += lz[bl] * (blockEnd(bl) - l);
                    for (int b = bl + 1; b < br; b++)
                        s += bs[b] + lz[b] * (blockEnd(b) - b * B);   // whole block: sum + tag * length
                    for (int i = br * B; i <= r; i++) s += a[i];
                    s += lz[br] * (r - br * B + 1);
                }
                cout << s << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Two pieces of state per block: bs[b], the sum of the values actually stored in block b, and lz[b], an amount added to every element of block b but not yet folded into a[i] or bs[b]. The invariant is that the true value of index i is a[i] + lz[i / B], so the true sum of a whole block is bs[b] + lz[b] * len(b).",
        "Both operations respect the same decomposition. Partial blocks are handled elementwise, and bs must be corrected by v times the number of elements touched, because those elements changed while the block's tag did not.",
        "The subtle bug is forgetting the tag when reading a partial block. Scanning a[i] over part of a block undercounts by lz[b] per element, and it is easy to miss because full-block reads look right.",
        "The last block may be short, which is why the length comes from blockEnd(b) - b * B rather than a hardcoded B; using B would over-apply the tag on the tail block.",
        "Range values reach 10^7 and up to 10^5 additions can stack on one cell, so a single element can hold about 10^12 and a full range sum about 10^17 - well past 32-bit, so every accumulator is long long.",
        "Time: O(sqrt(n)) per command, O((n + c) sqrt(n)) overall. Space: O(n).",
      ],
    },
    {
      name: "Race Against Time",
      difficulty: "Hard",
      variation: "Sorted blocks plus lazy add, counting values <= X",
      link: "https://www.spoj.com/problems/RACETIME/",
      question: [
        "There are n cows in a row, cow i having an integer value A[i]. You must process q operations. 'M i j X' adds X to A[k] for every k in i..j. 'C i j X' asks how many indices k in i..j satisfy A[k] <= X. Indices are 1-indexed. Print the answer to every operation of the second kind.",
        "Keep every block both in original order and as a sorted copy, plus a pending add tag. A count query then answers whole blocks with a binary search on the sorted copy and scans only the two partial ends.",
        "Example 1:\nInput:\n5 3\n1\n5\n2\n4\n3\nC 1 5 3\nM 2 4 2\nC 1 5 3\nOutput:\n3\n2\nExplanation: values 1, 2 and 3 are <= 3, so the first answer is 3. After adding 2 to positions 2..4 the array is 1 7 4 6 3, and only 1 and 3 are <= 3.",
        "Example 2:\nInput:\n4 2\n2\n2\n2\n2\nC 1 4 2\nC 2 3 1\nOutput:\n4\n0\nExplanation: all four values equal 2, so all are <= 2; none is <= 1.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- values, X and the accumulated sums fit comfortably in 64-bit\n- 1 <= i <= j <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));
    int nb = (n + B - 1) / B;
    vector<vector<long long>> srt(nb);
    vector<long long> lz(nb, 0);
    auto blockEnd = [&](int b) { return min(n, (b + 1) * B); };
    auto rebuild = [&](int b) {                 // re-sort one block after elementwise writes
        srt[b].assign(a.begin() + b * B, a.begin() + blockEnd(b));
        sort(srt[b].begin(), srt[b].end());
    };
    for (int b = 0; b < nb; b++) rebuild(b);
    while (q--) {
        char op;
        int l, r;
        long long x;
        cin >> op >> l >> r >> x;
        --l; --r;
        int bl = l / B, br = r / B;
        if (op == 'M') {
            if (bl == br) {
                for (int i = l; i <= r; i++) a[i] += x;
                rebuild(bl);
            } else {
                for (int i = l; i < blockEnd(bl); i++) a[i] += x;
                rebuild(bl);
                for (int b = bl + 1; b < br; b++) lz[b] += x;   // order inside a block is unchanged
                for (int i = br * B; i <= r; i++) a[i] += x;
                rebuild(br);
            }
        } else {
            long long cnt = 0;
            if (bl == br) {
                for (int i = l; i <= r; i++) cnt += (a[i] + lz[bl] <= x);
            } else {
                for (int i = l; i < blockEnd(bl); i++) cnt += (a[i] + lz[bl] <= x);
                for (int b = bl + 1; b < br; b++)
                    cnt += upper_bound(srt[b].begin(), srt[b].end(), x - lz[b]) - srt[b].begin();
                for (int i = br * B; i <= r; i++) cnt += (a[i] + lz[br] <= x);
            }
            cout << cnt << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The aggregate here - how many elements are below a threshold - is an order statistic, not something you can merge from two child values, so a plain segment tree over sums is useless. Sqrt decomposition handles it by keeping each block sorted, which is enough structure to answer the threshold question inside a block in O(log B).",
        "The key observation that makes the lazy tag work is that adding the same constant to every element of a block preserves their relative order. So a fully covered block only needs lz[b] += x, and the sorted copy stays valid: asking how many stored values are <= x is the same as asking how many are <= x - lz[b].",
        "Partial blocks break that: individual elements change, so the sorted copy of those one or two blocks must be rebuilt in O(B log B). At most two rebuilds per operation, so the cost per operation is O(sqrt(n) log n).",
        "The classic bug is comparing against x instead of x - lz[b] in the binary search, or applying the tag twice on a partial block by first adding lz to a[i] and then also reading the tag. Pick one representation - value = a[i] + lz[block] - and apply it everywhere.",
        "Time: O((n + q) sqrt(n) log n). Space: O(n).",
      ],
    },
    {
      name: "GIVEAWAY",
      difficulty: "Hard",
      variation: "Sorted blocks with point assignment, counting values >= C",
      link: "https://www.spoj.com/problems/GIVEAWAY/",
      question: [
        "You are given an array of n integers and q queries. A query '0 a b c' asks how many indices i with a <= i <= b satisfy A[i] >= c. A query '1 i v' assigns A[i] = v. Indices are 1-indexed. Print the answer to every query of the first kind.",
        "Example 1:\nInput:\n5\n1 4 2 7 3\n3\n0 1 5 3\n1 2 1\n0 1 5 3\nOutput:\n3\n2\nExplanation: the values >= 3 are 4, 7 and 3, so the answer is 3. After A[2] = 1 the array is 1 1 2 7 3 and only 7 and 3 remain >= 3.",
        "Example 2:\nInput:\n6\n5 5 5 1 1 1\n2\n0 2 5 5\n0 4 6 1\nOutput:\n2\n3\nExplanation: in positions 2..5 the values are 5 5 1 1, two of which are >= 5. In positions 4..6 all three values equal 1, which is >= 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= q <= 10^5\n- values, v and c fit in 32-bit signed integers\n- 1 <= a <= b <= n and 1 <= i <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));
    int nb = (n + B - 1) / B;
    vector<vector<long long>> srt(nb);
    auto blockEnd = [&](int b) { return min(n, (b + 1) * B); };
    for (int b = 0; b < nb; b++) {
        srt[b].assign(a.begin() + b * B, a.begin() + blockEnd(b));
        sort(srt[b].begin(), srt[b].end());
    }
    int q;
    cin >> q;
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int i;
            long long v;
            cin >> i >> v;
            --i;
            int b = i / B;
            // drop the old value from the sorted copy, then splice the new one in
            srt[b].erase(lower_bound(srt[b].begin(), srt[b].end(), a[i]));
            srt[b].insert(upper_bound(srt[b].begin(), srt[b].end(), v), v);
            a[i] = v;
        } else {
            int l, r;
            long long c;
            cin >> l >> r >> c;
            --l; --r;
            long long cnt = 0;
            int bl = l / B, br = r / B;
            if (bl == br) {
                for (int i = l; i <= r; i++) cnt += (a[i] >= c);
            } else {
                for (int i = l; i < blockEnd(bl); i++) cnt += (a[i] >= c);
                for (int b = bl + 1; b < br; b++)
                    cnt += srt[b].end() - lower_bound(srt[b].begin(), srt[b].end(), c);
                for (int i = br * B; i <= r; i++) cnt += (a[i] >= c);
            }
            cout << cnt << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Same sorted-block idea as the previous problem, but the update is an assignment rather than a shift, so no tag can absorb it. The sorted copy of the affected block must genuinely change.",
        "Rather than re-sorting the block in O(B log B), delete the old value and insert the new one at its sorted position. Both are O(B) because of the vector shift, but the constant is tiny and it avoids the comparison-sort overhead entirely.",
        "The deletion must remove exactly one occurrence of the old value. lower_bound finds the first copy; erasing by value or removing every match would corrupt blocks that contain duplicates - the most common failure on this problem.",
        "Counting values >= c in a sorted block is size minus the index of the first element >= c, i.e. end() - lower_bound(c). Reaching for upper_bound instead miscounts by exactly the number of elements equal to c, which passes on distinct-value tests and fails on duplicate-heavy ones.",
        "A merge sort tree also answers this in O(log^2 n) per query, but it cannot handle point assignment without a rebuild; the sqrt structure supports updates naturally, which is why it is the standard answer here.",
        "Time: O(n log n) to build, O(sqrt(n)) per update, O(sqrt(n) log n) per query. Space: O(n).",
      ],
    },
    {
      name: "Holes",
      difficulty: "Hard",
      variation: "Block jump-pointer compression on a functional graph",
      link: "https://codeforces.com/problemset/problem/13/E",
      question: [
        "There are n holes in a row, hole i having power a[i]. A ball thrown into hole i jumps to hole i + a[i], then keeps jumping by the power of whatever hole it lands in, until it jumps past hole n and leaves the row. Process m queries of two kinds. '0 x y' sets a[x] = y. '1 x' throws a ball into hole x and asks for two numbers: the index of the last hole the ball visited before leaving, and the total number of jumps it made.",
        "Simulating a throw one jump at a time can cost O(n). Instead precompute, for each hole, where the ball exits its own block, how many jumps that takes, and which hole inside the block it left from - so a throw crosses only O(sqrt(n)) blocks.",
        "Example 1:\nInput:\n8 5\n1 1 1 1 1 2 8 2\n1 1\n0 1 3\n1 1\n0 3 4\n1 2\nOutput:\n8 7\n8 5\n7 3\nExplanation: the first throw visits 1,2,3,4,5,6,8 and then leaves, so the last hole is 8 after 7 jumps. Setting a[1] = 3 makes the path 1,4,5,6,8 with 5 jumps. Setting a[3] = 4 makes a throw into hole 2 visit 2,3,7 and then leave, 3 jumps, last hole 7.",
        "Example 2:\nInput:\n3 2\n5 1 1\n1 1\n1 2\nOutput:\n1 1\n3 2\nExplanation: hole 1 has power 5 so the ball leaves immediately after one jump, last hole 1. From hole 2 the path is 2,3 and then out, 2 jumps.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= a[i] <= 10^9\n- 1 <= x <= n and 1 <= y <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int B = max(1, (int)sqrt((double)n));
    vector<int> to(n), cnt(n), lst(n);   // exit index, jumps to exit, last hole inside the block
    auto blockEnd = [&](int b) { return min(n, (b + 1) * B); };
    auto rebuild = [&](int b) {
        int e = blockEnd(b);
        for (int i = e - 1; i >= b * B; i--) {          // right to left: to[j] is already final
            long long j = i + a[i];
            if (j >= e) {                                // leaves this block in one jump
                to[i] = (int)min(j, (long long)n);       // clamp: anything >= n means out of the row
                cnt[i] = 1;
                lst[i] = i;
            } else {
                to[i] = to[j];
                cnt[i] = cnt[j] + 1;
                lst[i] = lst[j];
            }
        }
    };
    int nb = (n + B - 1) / B;
    for (int b = 0; b < nb; b++) rebuild(b);
    while (m--) {
        int type;
        cin >> type;
        if (type == 0) {
            int x;
            long long y;
            cin >> x >> y;
            --x;
            a[x] = y;
            rebuild(x / B);            // only x's own block can change
        } else {
            int x;
            cin >> x;
            --x;
            long long jumps = 0;
            int last = x;
            int cur = x;
            while (cur < n) {
                jumps += cnt[cur];
                last = lst[cur];
                cur = to[cur];
            }
            cout << last + 1 << " " << jumps << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The holes form a functional graph: every hole has exactly one successor and the powers are positive, so the successor index strictly increases and no cycle is possible. Every path therefore terminates by leaving the row.",
        "The compressed state for hole i summarises the entire portion of the path that stays inside i's block: to[i] is the first index outside the block, cnt[i] the number of jumps to get there, lst[i] the last in-block hole visited. Filling a block from right to left is what makes this a single O(B) pass - when i is processed, any target j still inside the block has already been finalised.",
        "A throw now advances block by block. Since the index only increases, each block is entered at most once, so a query is O(n/B) = O(sqrt(n)). An update rewrites only one block, O(B) = O(sqrt(n)).",
        "The tempting wrong approach is plain simulation with a per-query cache, which degrades to O(n) per throw on chains of power 1 - exactly the adversarial input this problem ships. The other trap is the answer semantics: the required hole is the last one actually visited, not to[...] which is the out-of-range index the ball flew to.",
        "Powers reach 10^9 so i + a[i] overflows nothing in 64-bit but does overflow the meaningful index range; clamping the exit target to n keeps the loop condition cur < n simple and the arrays in bounds.",
        "Time: O(n) build, O(sqrt(n)) per query and per update. Space: O(n).",
      ],
    },
    {
      name: "Time to Raid Cowavans",
      difficulty: "Hard",
      variation: "Threshold on step size, small and large cases split",
      link: "https://codeforces.com/problemset/problem/103/D",
      question: [
        "You are given an array w of n weights, 1-indexed. There are p queries, each a pair (a, b). For a query, sum w[a] + w[a+b] + w[a+2b] + ... taking every index of the form a + k*b that is at most n. Print the answer to every query in the order given.",
        "A single query costs O(n/b) if you walk it directly, which is fine when b is large and terrible when b is 1. Answer the large steps directly and batch the small steps: for a fixed small b one O(n) suffix pass answers all queries with that step at once.",
        "Example 1:\nInput:\n3\n1 2 3\n2\n1 1\n1 2\nOutput:\n6\n4\nExplanation: with step 1 from index 1 the indices are 1,2,3 giving 1+2+3 = 6. With step 2 they are 1,3 giving 1+3 = 4.",
        "Example 2:\nInput:\n4\n2 3 5 7\n3\n1 3\n2 3\n2 2\nOutput:\n9\n3\n10\nExplanation: from 1 with step 3 the indices are 1,4 giving 2+7 = 9. From 2 with step 3 only index 2 is in range, giving 3. From 2 with step 2 the indices are 2,4 giving 3+7 = 10.",
        "Constraints:\n- 1 <= n <= 3 * 10^5\n- 1 <= w[i] <= 10^9\n- 1 <= p <= 3 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> w(n + 2, 0);
    for (int i = 1; i <= n; i++) cin >> w[i];
    int p;
    cin >> p;
    int S = max(1, (int)sqrt((double)n));        // step threshold
    vector<long long> ans(p, 0);
    // group the small-step queries by their step so each step is swept once
    vector<vector<pair<int,int>>> byStep(S + 1);  // byStep[b] = list of (start, query id)
    for (int id = 0; id < p; id++) {
        int a, b;
        cin >> a >> b;
        if (b > S) {
            long long s = 0;
            for (int i = a; i <= n; i += b) s += w[i];   // at most n/S = O(sqrt(n)) terms
            ans[id] = s;
        } else {
            byStep[b].push_back({a, id});
        }
    }
    vector<long long> suf(n + 2, 0);
    for (int b = 1; b <= S; b++) {
        if (byStep[b].empty()) continue;
        for (int i = n; i >= 1; i--) suf[i] = w[i] + (i + b <= n ? suf[i + b] : 0);
        for (auto &[a, id] : byStep[b]) ans[id] = suf[a];
    }
    for (int i = 0; i < p; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "This is sqrt decomposition applied to the queries rather than to the array. The parameter being split is the step b, with threshold S = sqrt(n): the direct walk is cheap exactly when b > S, and the precomputation is affordable exactly when there are few distinct small b.",
        "For a fixed step b define suf[i] = w[i] + suf[i+b], computed right to left. That is precisely the answer for start i, so every query with that step becomes an O(1) lookup after one O(n) sweep. There are at most S distinct small steps, giving O(n sqrt(n)) for the whole small side.",
        "The large side is bounded per query: a step above sqrt(n) visits fewer than n/S = O(sqrt(n)) indices, so p queries cost O(p sqrt(n)).",
        "Because the small-step answers are produced out of order, the solution must be offline - queries are read, tagged with their original index, and printed only at the end. That is the structural cost of this technique and the reason it cannot serve an interactive judge.",
        "Two traps: reusing a stale suf array without recomputing it for the current b, and 32-bit overflow, since 3 * 10^5 weights of 10^9 sum to about 3 * 10^14.",
        "Time: O((n + p) sqrt(n)). Space: O(n + p).",
      ],
    },
    {
      name: "Anton and Permutation",
      difficulty: "Hard",
      variation: "Inversion count maintained under swaps",
      link: "https://codeforces.com/problemset/problem/785/E",
      question: [
        "Start from the identity permutation 1, 2, ..., n. You are given q queries; query (l, r) swaps the elements at positions l and r. After each swap, print the number of inversions of the current permutation, that is the number of index pairs i < j with p[i] > p[j].",
        "Recomputing the inversion count from scratch is far too slow. Only the pairs involving positions l and r can change, so derive the delta and count the qualifying elements between them with sorted blocks.",
        "Example 1:\nInput:\n5 4\n4 5\n2 4\n2 5\n2 2\nOutput:\n1\n4\n3\n3\nExplanation: after swapping positions 4 and 5 the permutation is 1 2 3 5 4 with 1 inversion. Swapping positions 2 and 4 gives 1 5 3 2 4 with 4 inversions. Swapping 2 and 5 gives 1 4 3 2 5 with 3. Swapping a position with itself changes nothing.",
        "Example 2:\nInput:\n3 2\n1 3\n1 3\nOutput:\n3\n0\nExplanation: swapping the ends of 1 2 3 gives 3 2 1, which is fully reversed and has all 3 pairs inverted. Swapping back restores the identity with 0 inversions.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= q <= 5 * 10^4\n- 1 <= l, r <= n (l and r may be equal, and l may exceed r)",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    iota(a.begin(), a.end(), 1);
    int B = max(1, (int)sqrt((double)n));
    int nb = (n + B - 1) / B;
    auto blockEnd = [&](int b) { return min(n, (b + 1) * B); };
    vector<vector<int>> srt(nb);
    auto rebuild = [&](int b) {
        srt[b].assign(a.begin() + b * B, a.begin() + blockEnd(b));
        sort(srt[b].begin(), srt[b].end());
    };
    for (int b = 0; b < nb; b++) rebuild(b);
    // how many indices in [ql, qr] hold a value strictly between lo and hi
    auto countStrict = [&](int ql, int qr, int lo, int hi) -> long long {
        if (ql > qr || hi - lo < 2) return 0;
        long long c = 0;
        int bl = ql / B, br = qr / B;
        if (bl == br) {
            for (int i = ql; i <= qr; i++) c += (a[i] > lo && a[i] < hi);
            return c;
        }
        for (int i = ql; i < blockEnd(bl); i++) c += (a[i] > lo && a[i] < hi);
        for (int b = bl + 1; b < br; b++)
            c += lower_bound(srt[b].begin(), srt[b].end(), hi)
               - upper_bound(srt[b].begin(), srt[b].end(), lo);
        for (int i = br * B; i <= qr; i++) c += (a[i] > lo && a[i] < hi);
        return c;
    };
    long long inv = 0;
    while (q--) {
        int l, r;
        cin >> l >> r;
        --l; --r;
        if (l > r) swap(l, r);
        if (l != r) {
            int x = a[l], y = a[r];
            long long mid = countStrict(l + 1, r - 1, min(x, y), max(x, y));
            if (x < y) inv += 2 * mid + 1;      // the pair itself flips, plus each middle element twice
            else inv -= 2 * mid + 1;
            swap(a[l], a[r]);
            rebuild(l / B);
            rebuild(r / B);
        }
        cout << inv << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Swapping positions l < r leaves every pair not involving l or r untouched, so only three groups matter: the pair (l, r) itself, pairs of l with the interior, and pairs of r with the interior. Elements outside [l, r] see both values on the same side as before, so their inversion status is unchanged.",
        "Let x = a[l], y = a[r]. For an interior element v, the pairs (l, k) and (k, r) both flip exactly when v lies strictly between x and y - if v is outside that range it compares the same way to both x and y, so one pair gains an inversion and the other loses one. Adding the flip of (l, r) itself gives a delta of exactly 2 * mid + 1, positive when x < y and negative when x > y.",
        "So the whole problem reduces to one range-count-of-values-in-a-band query per swap, which is exactly what sorted blocks answer: two partial scans plus one binary search per interior block. Because the swap changes only two positions, only two blocks need re-sorting.",
        "The values are strictly between the two endpoints, hence lower_bound(hi) minus upper_bound(lo); using inclusive bounds would double-count x and y themselves. The l == r and adjacent-position cases must be handled explicitly, since there is no interior to scan.",
        "The tempting wrong approach is to recount inversions with a merge sort or Fenwick sweep after each swap, which is O(n log n) per query and roughly 10^10 operations here. Maintaining the count incrementally is what makes it feasible.",
        "Time: O(n log n) build, O(sqrt(n) log n) per query. Space: O(n).",
      ],
    },
  ],
};
