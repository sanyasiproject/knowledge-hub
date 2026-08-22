import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Binary Indexed Tree or Fenwick Tree",
      difficulty: "Easy",
      variation: "1D template: point update, prefix sum",
      link: "https://www.geeksforgeeks.org/binary-indexed-tree-or-fenwick-tree-2/",
      question: [
        "Given an array of n integers, support two operations efficiently: add a value v to a single position, and return the sum of the first k elements. Build a Fenwick tree (binary indexed tree) so that both operations cost O(log n). Also derive the range sum of positions l..r from two prefix sums.",
        "This 1D structure is the single dimension that a 2D or 3D Fenwick tree nests inside itself, so the index arithmetic here is the whole pattern.",
        "Example 1:\nInput: arr = [1, 2, 3, 4, 5], prefix(3), then add 6 at position 2, then prefix(3), then range(2, 4)\nOutput: 6, 12, 15\nExplanation: 1+2+3 = 6. After the update the array is [1, 8, 3, 4, 5], so 1+8+3 = 12 and 8+3+4 = 15.",
        "Example 2:\nInput: arr = [0, 0, 0], add 5 at position 3, then range(1, 3)\nOutput: 5\nExplanation: Only position 3 is non-zero, and it lies inside 1..3.",
        "Constraints:\n- 1 <= n <= 10^5\n- Positions are 1-indexed, 1 <= i <= n\n- Values fit in 64 bits after all updates",
      ],
      code: `struct Fenwick {
    int n;
    vector<long long> b;

    Fenwick(int n) : n(n), b(n + 1, 0) {}

    void add(int i, long long v) {
        for (; i <= n; i += i & -i) b[i] += v;   // walk to the parents that cover i
    }

    long long prefix(int i) const {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += b[i];    // strip the lowest set bit each step
        return s;
    }

    long long range(int l, int r) const { return prefix(r) - prefix(l - 1); }
};

Fenwick build(vector<int>& arr) {
    Fenwick f((int)arr.size());
    for (int i = 0; i < (int)arr.size(); i++) f.add(i + 1, arr[i]);
    return f;
}`,
      explanation: [
        "Node i of the tree owns the half-open block of positions (i - lowbit(i), i], where lowbit(i) = i & -i. Every index has exactly one owner at each level, so the blocks form a forest of size O(log n) chains.",
        "prefix(i) decomposes 1..i into the blocks ending at i, i - lowbit(i), and so on down to 0. Because each step clears one set bit of i, the walk takes at most as many steps as i has bits, and the blocks tile 1..i exactly once - no overlap, no gap.",
        "add(i, v) must repair every block that contains i. Those are found by repeatedly adding lowbit, which is the exact inverse of the query walk. This symmetry is what makes the structure extensible: for d dimensions you simply nest d such loops.",
        "The tempting wrong move is to store the array itself in b and try to patch prefix sums lazily. Fenwick nodes are partial sums, not elements, so b[i] is never arr[i] except when i is odd - reading b directly gives garbage. Recovering a single element means range(i, i).",
        "Time: O(log n) per update and per prefix query, O(n log n) to build naively (O(n) with the in-place variant). Space: O(n).",
      ],
    },
    {
      name: "Range Sum Query - Mutable",
      difficulty: "Medium",
      variation: "Point assign turned into a delta add",
      link: "https://leetcode.com/problems/range-sum-query-mutable/",
      question: [
        "Design a data structure over an integer array nums that supports update(index, val), which sets nums[index] = val, and sumRange(left, right), which returns the sum of nums[left..right] inclusive. Both indices are 0-based.",
        "Example 1:\nInput: nums = [1, 3, 5]; sumRange(0, 2); update(1, 2); sumRange(0, 2)\nOutput: 9, then 8\nExplanation: 1+3+5 = 9. After nums becomes [1, 2, 5] the sum is 1+2+5 = 8.",
        "Example 2:\nInput: nums = [-1, 4]; sumRange(1, 1); update(0, 3); sumRange(0, 1)\nOutput: 4, then 7\nExplanation: A single-element range is just that element, and 3 + 4 = 7.",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -100 <= nums[i], val <= 100\n- At most 3 * 10^4 calls to update and sumRange",
      ],
      code: `class NumArray {
    int n;
    vector<long long> bit;
    vector<int> a;

    void add(int i, long long v) {
        for (++i; i <= n; i += i & -i) bit[i] += v;   // shift to 1-indexed
    }

    long long prefix(int i) const {
        long long s = 0;
        for (++i; i > 0; i -= i & -i) s += bit[i];
        return s;
    }

public:
    NumArray(vector<int>& nums) : n((int)nums.size()), bit(n + 1, 0), a(nums) {
        for (int i = 0; i < n; i++) add(i, nums[i]);
    }

    void update(int index, int val) {
        add(index, (long long)val - a[index]);   // assignment = add the difference
        a[index] = val;
    }

    int sumRange(int left, int right) {
        return (int)(prefix(right) - prefix(left - 1));
    }
};`,
      explanation: [
        "A Fenwick tree only knows how to add. An assignment is expressed as add(index, val - old), which needs the current value, so a plain copy of the array is kept alongside the tree. Forgetting that shadow array is the classic bug: the tree then accumulates values instead of replacing them.",
        "sumRange is the difference of two prefix sums. prefix(left - 1) with left = 0 becomes prefix(-1), which after the ++i shift is prefix(0) and correctly returns 0 - so no special case is needed.",
        "A prefix-sum array alone answers queries in O(1) but costs O(n) per update, and a plain array is the mirror image. Fenwick balances both at O(log n), which is why it wins when updates and queries are interleaved in roughly equal numbers.",
        "Time: O(n log n) construction, O(log n) per update and per query. Space: O(n).",
      ],
    },
    {
      name: "Range Sum Query 2D - Mutable",
      difficulty: "Medium",
      variation: "Nesting: 2D point update, rectangle sum",
      link: "https://leetcode.com/problems/range-sum-query-2d-mutable/",
      question: [
        "Design a structure over a 2D matrix that supports update(row, col, val), setting matrix[row][col] = val, and sumRegion(row1, col1, row2, col2), returning the sum of the submatrix whose upper-left corner is (row1, col1) and lower-right corner is (row2, col2). Indices are 0-based and inclusive.",
        "Example 1:\nInput: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]; sumRegion(2,1,4,3); update(3,2,2); sumRegion(2,1,4,3)\nOutput: 8, then 10\nExplanation: Rows 2..4 and columns 1..3 hold (2,0,1), (1,0,1), (0,3,0), summing to 8. Setting matrix[3][2] = 2 raises the middle row to 1+2+1 = 4, so the total becomes 10.",
        "Example 2:\nInput: matrix = [[1,2],[3,4]]; sumRegion(0,0,1,1); update(1,1,0); sumRegion(1,0,1,1)\nOutput: 10, then 3\nExplanation: 1+2+3+4 = 10; after the update the bottom row is (3, 0), summing to 3.",
        "Constraints:\n- 1 <= rows, cols <= 200\n- -10^5 <= matrix[i][j], val <= 10^5\n- At most 5000 calls to update and sumRegion",
      ],
      code: `class NumMatrix {
    int R, C;
    vector<vector<long long>> bit;
    vector<vector<int>> a;

    void add(int r, int c, long long v) {
        for (int i = r + 1; i <= R; i += i & -i)
            for (int j = c + 1; j <= C; j += j & -j) bit[i][j] += v;
    }

    long long prefix(int r, int c) const {          // sum of [0..r] x [0..c]
        long long s = 0;
        for (int i = r + 1; i > 0; i -= i & -i)
            for (int j = c + 1; j > 0; j -= j & -j) s += bit[i][j];
        return s;
    }

public:
    NumMatrix(vector<vector<int>>& matrix)
        : R((int)matrix.size()), C((int)matrix[0].size()),
          bit(R + 1, vector<long long>(C + 1, 0)), a(matrix) {
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++) add(i, j, matrix[i][j]);
    }

    void update(int row, int col, int val) {
        add(row, col, (long long)val - a[row][col]);
        a[row][col] = val;
    }

    int sumRegion(int r1, int c1, int r2, int c2) {
        long long s = prefix(r2, c2) - prefix(r1 - 1, c2)
                    - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1);
        return (int)s;
    }
};`,
      explanation: [
        "A 2D Fenwick is a Fenwick tree whose every node is itself a Fenwick tree over the second coordinate. Concretely, bit[i][j] holds the sum of the rectangle (i - lowbit(i), i] x (j - lowbit(j), j]. Both loops are the same 1D walk, just nested.",
        "prefix(r, c) returns the sum of the corner rectangle anchored at the origin. An arbitrary rectangle needs 2^2 = 4 corner terms with alternating signs - the inclusion-exclusion of two independent intervals. In d dimensions this becomes 2^d terms, which is the single fact that makes the 3D version look intimidating and is in fact mechanical.",
        "The signs come from expanding the product of indicator differences, one per axis, so every subset of axes that is 'clipped' contributes with sign (-1) to the power of its size. Writing them by intuition rather than by that rule is where most implementations go wrong.",
        "Do not rebuild the tree on an update. Only one cell changes, and exactly O(log R * log C) nodes cover it - that is the point of the structure.",
        "Time: O(log R * log C) per update and per query, O(R * C * log R * log C) to build. Space: O(R * C).",
      ],
    },
    {
      name: "Forest Queries II",
      difficulty: "Medium",
      variation: "2D toggle updates, rectangle count (judge I/O)",
      link: "https://cses.fi/problemset/task/1739",
      question: [
        "You are given an n x n forest grid where each square is either empty ('.') or contains a tree ('*'). Process q queries of two kinds. Type '1 y x' toggles the square (y, x): a tree is removed if one is there, otherwise a tree is planted. Type '2 y1 x1 y2 x2' asks for the number of trees inside the rectangle whose corners are (y1, x1) and (y2, x2), inclusive. Rows and columns are numbered from 1.",
        "Example 1:\nInput:\n4 3\n.*..\n*.**\n**..\n****\n2 2 2 3 4\n1 2 2\n2 2 2 3 4\nOutput:\n3\n4\nExplanation: Rows 2..3, columns 2..4 initially hold trees at (2,3), (2,4) and (3,2), so the answer is 3. The toggle plants a tree at (2,2), which lies inside the same rectangle, so the count becomes 4.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= q <= 2 * 10^5\n- 1 <= y1 <= y2 <= n, 1 <= x1 <= x2 <= n",
      ],
      code: `int n;
vector<vector<int>> bit;
vector<string> g;

void add(int y, int x, int v) {
    for (int i = y; i <= n; i += i & -i)
        for (int j = x; j <= n; j += j & -j) bit[i][j] += v;
}

int prefix(int y, int x) {
    int s = 0;
    for (int i = y; i > 0; i -= i & -i)
        for (int j = x; j > 0; j -= j & -j) s += bit[i][j];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    g.assign(n + 1, string(n + 1, '.'));
    bit.assign(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++) {
        string row;
        cin >> row;
        for (int j = 1; j <= n; j++) {
            g[i][j] = row[j - 1];
            if (g[i][j] == '*') add(i, j, 1);
        }
    }
    while (q--) {
        int t;
        cin >> t;
        if (t == 1) {
            int y, x;
            cin >> y >> x;
            int delta = (g[y][x] == '*') ? -1 : 1;   // toggle is a +1 / -1 delta
            g[y][x] = (g[y][x] == '*') ? '.' : '*';
            add(y, x, delta);
        } else {
            int y1, x1, y2, x2;
            cin >> y1 >> x1 >> y2 >> x2;
            int ans = prefix(y2, x2) - prefix(y1 - 1, x2)
                    - prefix(y2, x1 - 1) + prefix(y1 - 1, x1 - 1);
            cout << ans << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The counting version of the previous problem: each cell holds 0 or 1, so a rectangle query is a rectangle sum and a toggle is an add of +1 or -1. Keeping the raw grid lets the toggle decide its own sign in O(1).",
        "n is only 1000, so the tree is a million ints - comfortable. The reason a 2D Fenwick is the right answer rather than a static prefix-sum table is the 2 * 10^5 updates: rebuilding a prefix table costs 10^6 each time, which is 2 * 10^11 operations.",
        "The four-corner inclusion-exclusion needs y1 - 1 and x1 - 1 to be legal arguments. Because the tree is 1-indexed, prefix(0, x) naturally returns 0 with no branch, so keeping the structure 1-indexed removes an entire class of off-by-one bugs.",
        "Fast input matters here. With 2 * 10^5 queries plus a million grid characters, unsynchronised cin (or scanf) is the difference between passing and timing out.",
        "Time: O(n^2 log^2 n) to build plus O(log^2 n) per operation. Space: O(n^2).",
      ],
    },
    {
      name: "Matrix Summation",
      difficulty: "Medium",
      variation: "2D assign vs add, delta bookkeeping",
      link: "https://www.spoj.com/problems/MATSUM/",
      question: [
        "You are given an initially all-zero N x N matrix, indexed from 0. Process a stream of commands. 'SET x y num' assigns num to cell (x, y), replacing whatever was there. 'SUM x1 y1 x2 y2' prints the sum of the submatrix from (x1, y1) to (x2, y2), inclusive. 'END' terminates the current test case. The first line of input gives the number of test cases, and each test case starts with N.",
        "Example 1:\nInput:\n1\n4\nSET 0 0 1\nSET 1 1 2\nSUM 0 0 1 1\nSET 1 1 5\nSUM 0 0 3 3\nEND\nOutput:\n3\n6\nExplanation: After the first two SETs the 2x2 corner holds 1 and 2, so the sum is 3. The third SET replaces the 2 at (1,1) with 5 rather than adding to it, so the whole matrix now sums to 1 + 5 = 6.",
        "Constraints:\n- 1 <= N <= 1024\n- Number of commands per test case <= 10^5\n- -10^9 <= num <= 10^9, so sums need 64-bit arithmetic",
      ],
      code: `int n;
vector<vector<long long>> bit, val;

void add(int x, int y, long long v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= n; j += j & -j) bit[i][j] += v;
}

long long prefix(int x, int y) {
    long long s = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j) s += bit[i][j];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        cin >> n;
        bit.assign(n + 1, vector<long long>(n + 1, 0));
        val.assign(n + 1, vector<long long>(n + 1, 0));
        string cmd;
        while (cin >> cmd && cmd != "END") {
            if (cmd == "SET") {
                int x, y;
                long long v;
                cin >> x >> y >> v;
                ++x; ++y;                       // to 1-indexed
                add(x, y, v - val[x][y]);       // replace, do not accumulate
                val[x][y] = v;
            } else {
                int x1, y1, x2, y2;
                cin >> x1 >> y1 >> x2 >> y2;
                ++x1; ++y1; ++x2; ++y2;
                if (x1 > x2) swap(x1, x2);      // corners may arrive unordered
                if (y1 > y2) swap(y1, y2);
                cout << prefix(x2, y2) - prefix(x1 - 1, y2)
                      - prefix(x2, y1 - 1) + prefix(x1 - 1, y1 - 1) << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Same 2D Fenwick as before, but the update is an assignment, so the shadow matrix val is mandatory: the tree stores sums of blocks and cannot tell you what a single cell currently holds without an extra query, and doing that query per SET would double the work for no reason.",
        "Values reach 10^9 and up to 10^5 of them can be live at once, so a query can exceed 10^14. Using int for the tree is the most common wrong answer on this problem, and it fails silently.",
        "Reallocating the tree per test case is cheaper and safer than clearing 1024^2 entries by hand only where they were touched - and unlike a memset-based reset it cannot leak state between cases, which is the second most common wrong answer here.",
        "Time: O(log^2 N) per command, O(N^2) per test case for the allocation. Space: O(N^2).",
      ],
    },
    {
      name: "Count Number of Teams",
      difficulty: "Medium",
      variation: "Triplet counting by splitting on the middle element",
      link: "https://leetcode.com/problems/count-number-of-teams/",
      question: [
        "There are n soldiers standing in a line, each with a distinct rating. A team of 3 soldiers is chosen by picking indices i < j < k such that either rating[i] < rating[j] < rating[k] or rating[i] > rating[j] > rating[k]. Return the number of such teams.",
        "Example 1:\nInput: rating = [2, 5, 3, 4, 1]\nOutput: 3\nExplanation: The increasing team is (2, 3, 4). The decreasing teams are (5, 3, 1) and (5, 4, 1).",
        "Example 2:\nInput: rating = [2, 1, 3]\nOutput: 0\nExplanation: 2 > 1 but 1 < 3, so neither direction gives a monotone triple.",
        "Constraints:\n- 3 <= n <= 1000\n- 1 <= rating[i] <= 10^5\n- All ratings are distinct",
      ],
      code: `int numTeams(vector<int>& rating) {
    const int M = 100000;
    vector<int> bit(M + 1, 0);
    auto add = [&](int v) { for (; v <= M; v += v & -v) bit[v]++; };
    auto cntLess = [&](int v) {                 // how many inserted values are < v
        int s = 0;
        for (int i = v - 1; i > 0; i -= i & -i) s += bit[i];
        return s;
    };

    int n = (int)rating.size();
    vector<int> lessBefore(n), greaterBefore(n), lessAfter(n), greaterAfter(n);

    for (int j = 0; j < n; j++) {               // left to right: j elements inserted
        lessBefore[j] = cntLess(rating[j]);
        greaterBefore[j] = j - lessBefore[j];
        add(rating[j]);
    }
    fill(bit.begin(), bit.end(), 0);
    for (int j = n - 1; j >= 0; j--) {          // right to left: n-1-j inserted
        lessAfter[j] = cntLess(rating[j]);
        greaterAfter[j] = (n - 1 - j) - lessAfter[j];
        add(rating[j]);
    }

    long long ans = 0;
    for (int j = 0; j < n; j++)
        ans += (long long)lessBefore[j] * greaterAfter[j]
             + (long long)greaterBefore[j] * lessAfter[j];
    return (int)ans;
}`,
      explanation: [
        "Fix the middle soldier j. An increasing team through j is any smaller rating to its left paired with any larger rating to its right, and those two choices are independent, so the count multiplies. Summing over j counts every team exactly once because a triple has exactly one middle index.",
        "Each of the four counts is a prefix-count query over the value axis, which is precisely what a Fenwick tree of frequencies answers. Sweeping left to right inserts values in index order, so the tree always contains exactly the prefix of already-seen elements - position is encoded by time, value by the tree index. That trick of trading one dimension for sweep order is the core idea behind every higher-dimensional Fenwick application.",
        "greaterBefore is derived as j - lessBefore rather than queried, using the fact that all ratings are distinct: of the j elements already inserted, every one is either less or greater. Querying it separately is harmless but doubles the work, and with duplicates the subtraction would silently overcount.",
        "With n <= 1000 the O(n^2) double loop also passes, which is why many solutions never reach the Fenwick version. The structural insight matters more than the speed: this same split-on-the-middle argument is what turns 3D dominance counting into a sequence of Fenwick queries.",
        "Time: O(n log C) where C is the value range. Space: O(C).",
      ],
    },
    {
      name: "Three Dimensional Binary Indexed Tree or BIT",
      difficulty: "Medium",
      variation: "3D template: point update, box sum",
      question: [
        "Given an n x n x n cube of numbers, all initially zero, support two operations. update(x, y, z, v) adds v to the cell (x, y, z). boxSum(x1, y1, z1, x2, y2, z2) returns the sum of all cells inside the axis-aligned box with those two opposite corners, inclusive. Coordinates are 1-indexed. Both operations must run in O(log^3 n).",
        "Example 1:\nInput: n = 4; update(1,1,1,5); update(2,2,2,3); update(4,4,4,2); boxSum(1,1,1,2,2,2); boxSum(2,2,2,4,4,4); boxSum(1,1,1,4,4,4)\nOutput: 8, 5, 10\nExplanation: The first box contains the 5 and the 3. The second contains the 3 and the 2. The third contains all three values.",
        "Example 2:\nInput: n = 2; update(2,1,2,7); boxSum(1,1,1,1,1,1); boxSum(2,1,1,2,1,2)\nOutput: 0, 7\nExplanation: Cell (1,1,1) was never touched. The second box spans z = 1..2 at x = 2, y = 1, and so contains (2,1,2).",
        "Constraints:\n- 1 <= n <= 100 (an n^3 tree of 64-bit values must fit in memory)\n- 1 <= x1 <= x2 <= n, and likewise for y and z\n- Sums fit in a signed 64-bit integer",
      ],
      code: `struct BIT3D {
    int n;
    vector<vector<vector<long long>>> t;

    BIT3D(int n)
        : n(n), t(n + 1, vector<vector<long long>>(n + 1, vector<long long>(n + 1, 0))) {}

    void update(int x, int y, int z, long long v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= n; j += j & -j)
                for (int k = z; k <= n; k += k & -k) t[i][j][k] += v;
    }

    // sum of the corner box [1..x] x [1..y] x [1..z]
    long long prefix(int x, int y, int z) const {
        long long s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                for (int k = z; k > 0; k -= k & -k) s += t[i][j][k];
        return s;
    }

    long long boxSum(int x1, int y1, int z1, int x2, int y2, int z2) const {
        --x1; --y1; --z1;                     // 8 signed corner terms
        return prefix(x2, y2, z2)
             - prefix(x1, y2, z2) - prefix(x2, y1, z2) - prefix(x2, y2, z1)
             + prefix(x1, y1, z2) + prefix(x1, y2, z1) + prefix(x2, y1, z1)
             - prefix(x1, y1, z1);
    }
};`,
      explanation: [
        "The structure is a Fenwick tree of Fenwick trees of Fenwick trees. Node (i, j, k) stores the sum of the box (i - lowbit(i), i] x (j - lowbit(j), j] x (k - lowbit(k), k]. Nothing about the 1D argument changes; each axis is decomposed independently, so the three loops simply compose.",
        "The box query is inclusion-exclusion over three independent intervals: the indicator of x1 <= x <= x2 is [x <= x2] - [x <= x1 - 1], and multiplying three such differences expands into 2^3 = 8 prefix terms whose sign is minus-one-to-the-number-of-clipped-axes. Writing the eight terms from that rule is safer than reasoning geometrically about corners.",
        "Memory is the real constraint, not time. An n^3 tree of long long is 8n^3 bytes, so n = 100 is 8 MB and n = 500 is already a gigabyte. When the coordinate range is large but the number of non-empty cells is small, the answer is not a bigger array: compress coordinates first, or drop a dimension with an offline sweep and use a 2D tree.",
        "The tempting wrong shortcut is to subtract only three faces and add back three edges without the final minus-one corner term, which happens to be correct in 2D and wrong in 3D. Test any 3D implementation against a brute-force triple loop on a small random cube - the sign errors are invisible otherwise.",
        "Time: O(log^3 n) per update, O(8 * log^3 n) per box query. Space: O(n^3).",
      ],
    },
    {
      name: "Cube",
      difficulty: "Hard",
      variation: "3D range flip, point query (XOR difference cube)",
      question: [
        "You are given an n x n x n cube in which every cell is 0. Process m operations. An operation '1 x1 y1 z1 x2 y2 z2' flips every cell inside the given box (0 becomes 1 and 1 becomes 0). An operation '0 x y z' prints the current value of the single cell (x, y, z). Coordinates are 1-indexed. The input contains several test cases and ends at end of file; each case starts with a line holding n and m. This is HDU problem 3584.",
        "Example 1:\nInput:\n2 5\n1 1 1 1 2 2 2\n0 1 1 1\n1 1 1 1 1 1 1\n0 1 1 1\n0 2 2 2\nOutput:\n1\n0\n1\nExplanation: The first operation flips the whole 2x2x2 cube, so (1,1,1) becomes 1. The third operation flips only (1,1,1), returning it to 0, while (2,2,2) is still 1 from the first flip.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= 10^4\n- 1 <= x1 <= x2 <= n, and likewise for y and z",
      ],
      code: `int n, m;
int t[105][105][105];

void toggle(int x, int y, int z) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= n; j += j & -j)
            for (int k = z; k <= n; k += k & -k) t[i][j][k] ^= 1;
}

int query(int x, int y, int z) {              // parity of flips covering the cell
    int s = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j)
            for (int k = z; k > 0; k -= k & -k) s ^= t[i][j][k];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    while (cin >> n >> m) {
        memset(t, 0, sizeof(t));
        while (m--) {
            int op;
            cin >> op;
            if (op == 1) {
                int x1, y1, z1, x2, y2, z2;
                cin >> x1 >> y1 >> z1 >> x2 >> y2 >> z2;
                int xs[2] = {x1, x2 + 1}, ys[2] = {y1, y2 + 1}, zs[2] = {z1, z2 + 1};
                for (int a = 0; a < 2; a++)
                    for (int b = 0; b < 2; b++)
                        for (int c = 0; c < 2; c++) toggle(xs[a], ys[b], zs[c]);
            } else {
                int x, y, z;
                cin >> x >> y >> z;
                cout << query(x, y, z) << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "This is the dual of the previous problem: range update with point query instead of point update with range query. The standard trick is to store a difference cube D and define the real value A[x][y][z] as the prefix XOR of D over the box [1..x] x [1..y] x [1..z]. The Fenwick tree then holds D, and a point query becomes a prefix query - the roles of the two walks swap.",
        "A box flip changes D at exactly 8 positions, the corners (x1 or x2+1) x (y1 or y2+1) x (z1 or z2+1). In the additive version those corners carry alternating signs; under XOR the signs are irrelevant because plus one and minus one are the same modulo two, which is why the eight toggles are written with no sign bookkeeping at all.",
        "Correctness rests on a parity argument: the prefix XOR of the difference cube counts, modulo two, how many of the applied boxes contain the queried cell. A cell inside a flipped box is covered by an odd number of that box's eight corner contributions, and a cell outside by an even number, so the parity is exactly the number of flips affecting it.",
        "Coordinate x2 + 1 can equal n + 1, which is outside the tree. Toggling there is a no-op only if the loop is written to start at that index and immediately exceed n - which the given loop does, since i <= n fails at once. Clamping or skipping those calls by hand is a common source of wrong answers.",
        "The tempting wrong approach is a lazy 3D segment tree. It works, but the code is an order of magnitude longer, and for pure flip-and-read the difference-cube Fenwick needs 20 lines.",
        "Time: O(8 * log^3 n) per flip and O(log^3 n) per query. Space: O(n^3).",
      ],
    },
    {
      name: "Intersection Points",
      difficulty: "Hard",
      variation: "Sweep to drop a dimension",
      link: "https://cses.fi/problemset/task/1740",
      question: [
        "You are given n line segments, each of which is either horizontal or vertical. Count the number of points where two segments intersect. No two horizontal segments touch each other and no two vertical segments touch each other, so every intersection is between one horizontal and one vertical segment. Each segment is given as x1 y1 x2 y2.",
        "Example 1:\nInput:\n3\n2 1 2 5\n1 2 4 2\n1 4 4 4\nOutput:\n2\nExplanation: The first segment is vertical at x = 2 spanning y = 1..5. The two horizontal segments at y = 2 and y = 4 both cross it, at (2, 2) and (2, 4).",
        "Example 2:\nInput:\n2\n1 1 5 1\n3 2 3 6\nOutput:\n0\nExplanation: The vertical segment spans y = 2..6, which never reaches the horizontal segment at y = 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- -10^6 <= coordinates <= 10^6\n- The answer can be as large as about 2.5 * 10^9, so it needs 64-bit output",
      ],
      code: `const int OFF = 1000001, SZ = 2000003;      // shift coordinates to 1..SZ
vector<int> bit(SZ + 1, 0);

void add(int y, int v) { for (int i = y; i <= SZ; i += i & -i) bit[i] += v; }

long long prefix(int y) {
    long long s = 0;
    for (int i = y; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    // event: x, kind (0 = insert horizontal, 1 = vertical query, 2 = erase), a, b
    vector<array<int,4>> ev;
    ev.reserve(2 * n);
    for (int i = 0; i < n; i++) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        x1 += OFF; y1 += OFF; x2 += OFF; y2 += OFF;
        if (x1 == x2) {                                  // vertical
            if (y1 > y2) swap(y1, y2);
            ev.push_back({x1, 1, y1, y2});
        } else {                                         // horizontal
            if (x1 > x2) swap(x1, x2);
            ev.push_back({x1, 0, y1, 0});
            ev.push_back({x2, 2, y1, 0});
        }
    }
    sort(ev.begin(), ev.end(), [](const array<int,4>& a, const array<int,4>& b) {
        if (a[0] != b[0]) return a[0] < b[0];
        return a[1] < b[1];          // insert, then query, then erase at the same x
    });
    long long ans = 0;
    for (auto& e : ev) {
        if (e[1] == 0) add(e[2], 1);
        else if (e[1] == 2) add(e[2], -1);
        else ans += prefix(e[3]) - prefix(e[2] - 1);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "A vertical segment at x spanning y in [ylo, yhi] meets a horizontal segment at y spanning x in [xlo, xhi] exactly when xlo <= x <= xhi and ylo <= y <= yhi. That is a three-constraint condition, and the naive reading of it is a 3D range structure over (x, xlo, xhi).",
        "Sweeping x removes one whole dimension. Process events in increasing x, keeping in the Fenwick tree the y-coordinate of exactly those horizontal segments currently spanning the sweep line - inserted at xlo, erased just after xhi. Then each vertical segment only needs a 1D count of stored y values in [ylo, yhi]. This is the standard alternative to building a true 3D tree, and it is why genuine 3D Fenwick problems are rare.",
        "Event ordering at a shared x is what makes closed intervals correct: inserts must land before queries, and erases must happen after queries, so a touching endpoint still counts as an intersection. Sorting by (x, kind) with kind ordered insert < query < erase encodes exactly that.",
        "Coordinates are negative, so they are shifted by 10^6 + 1 to become valid 1-based tree indices; index 0 must stay unused or the query walk never terminates. With only 10^5 segments one could compress instead, but a 2 * 10^6 int array is 8 MB and simpler.",
        "The count can approach 2.5 * 10^9 when about half the segments run each way, so the accumulator must be 64-bit even though every individual query fits in an int.",
        "Time: O(n log n) for the sort plus O(n log C) for the sweep. Space: O(n + C) where C is the coordinate range.",
      ],
    },
    {
      name: "Count Good Triplets in an Array",
      difficulty: "Hard",
      variation: "3D dominance triples over two permutations",
      link: "https://leetcode.com/problems/count-good-triplets-in-an-array/",
      question: [
        "You are given two 0-indexed arrays nums1 and nums2, each a permutation of the integers 0..n-1. A value triple (x, y, z) is good if x appears before y and y appears before z in nums1, and also x appears before y and y appears before z in nums2. Return the total number of good triples.",
        "Example 1:\nInput: nums1 = [2, 0, 1, 3], nums2 = [0, 1, 2, 3]\nOutput: 1\nExplanation: The only triple in increasing order in both arrays is (0, 1, 3).",
        "Example 2:\nInput: nums1 = [4, 0, 1, 3, 2], nums2 = [4, 1, 0, 2, 3]\nOutput: 4\nExplanation: The good triples are (4, 0, 3), (4, 0, 2), (4, 1, 3) and (4, 1, 2).",
        "Constraints:\n- 3 <= n <= 10^5\n- 0 <= nums1[i], nums2[i] <= n - 1\n- Both arrays are permutations of 0..n-1",
      ],
      code: `long long goodTriplets(vector<int>& nums1, vector<int>& nums2) {
    int n = (int)nums1.size();
    vector<int> pos(n);
    for (int i = 0; i < n; i++) pos[nums2[i]] = i;

    vector<int> a(n);                    // a[i] = position in nums2 of nums1[i]
    for (int i = 0; i < n; i++) a[i] = pos[nums1[i]];

    vector<int> bit(n + 1, 0);
    auto add = [&](int v) { for (++v; v <= n; v += v & -v) bit[v]++; };
    auto cntAtMost = [&](int v) {        // values <= v already inserted
        int s = 0;
        for (int i = v + 1; i > 0; i -= i & -i) s += bit[i];
        return s;
    };

    long long ans = 0;
    for (int j = 0; j < n; j++) {
        long long left = cntAtMost(a[j] - 1);              // i < j with a[i] < a[j]
        long long smallerAfter = a[j] - left;              // a is a permutation
        long long right = (long long)(n - 1 - j) - smallerAfter;
        ans += left * right;
        add(a[j]);
    }
    return ans;
}`,
      explanation: [
        "Relabel every value by its position in nums2. Then 'x before y in nums2' becomes 'label(x) < label(y)', and the array a, which lists those labels in nums1 order, turns the whole problem into counting index triples i < j < k with a[i] < a[j] < a[k]. Two order constraints per pair collapse into one comparison.",
        "Fix the middle index j. The number of good triples through j is (count of i < j with a[i] < a[j]) times (count of k > j with a[k] > a[j]), because the two sides are chosen independently. A single left-to-right sweep with a Fenwick tree over labels gives the left factor directly.",
        "The right factor needs no second sweep. Since a is a permutation, exactly a[j] labels in the entire array are smaller than a[j]; of those, left sit before j, so a[j] - left sit after j. Everything else after j is larger, giving right = (n - 1 - j) - (a[j] - left). Recognising that identity is the difference between one pass and two.",
        "This is the classic 3D dominance count, and it is the honest answer to 'when do I need a 3D Fenwick tree'. You do not: one dimension is consumed by the sweep order, a second by the relabelling, and only the third needs a tree. Building an actual n^3 structure for n = 10^5 is impossible anyway.",
        "The answer can reach roughly C(10^5, 3), about 1.7 * 10^14, so the accumulator must be 64-bit and the multiplication must be done in 64-bit - casting only the result overflows first.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Maximum Sum Queries",
      difficulty: "Hard",
      variation: "Offline 2D dominance with a max-Fenwick",
      link: "https://leetcode.com/problems/maximum-sum-queries/",
      question: [
        "You are given two arrays nums1 and nums2 of length n and a list of queries, where queries[i] = [xi, yi]. For each query, find the maximum value of nums1[j] + nums2[j] over all indices j that satisfy nums1[j] >= xi and nums2[j] >= yi. If no index satisfies both conditions, the answer for that query is -1. Return the answers in the order the queries were given.",
        "Example 1:\nInput: nums1 = [4, 3, 1, 2], nums2 = [2, 4, 9, 5], queries = [[4,1],[1,3],[2,5]]\nOutput: [6, 10, 7]\nExplanation: Only j = 0 has nums1[j] >= 4, giving 4 + 2 = 6. For [1,3] every index qualifies on the first condition and j = 2 gives 1 + 9 = 10. For [2,5] only j = 3 satisfies both, giving 2 + 5 = 7.",
        "Example 2:\nInput: nums1 = [2, 1], nums2 = [2, 3], queries = [[3,3]]\nOutput: [-1]\nExplanation: No index has nums1[j] >= 3.",
        "Constraints:\n- 1 <= n <= 10^5, 1 <= queries.length <= 10^5\n- 1 <= nums1[j], nums2[j], xi, yi <= 10^9\n- Answers fit in a 32-bit signed integer",
      ],
      code: `vector<int> maximumSumQueries(vector<int>& nums1, vector<int>& nums2,
                              vector<vector<int>>& queries) {
    int n = (int)nums1.size(), q = (int)queries.size();

    vector<int> ys = nums2;                       // compress the second coordinate
    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());
    int m = (int)ys.size();

    vector<long long> bit(m + 1, -1);             // prefix-max over reversed ranks
    auto rankOf = [&](int y) {
        return m - (int)(lower_bound(ys.begin(), ys.end(), y) - ys.begin());
    };
    auto add = [&](int y, long long v) {
        for (int i = rankOf(y); i <= m; i += i & -i) bit[i] = max(bit[i], v);
    };
    auto best = [&](int y) {                      // max over stored values with y' >= y
        long long r = -1;
        for (int i = rankOf(y); i > 0; i -= i & -i) r = max(r, bit[i]);
        return r;
    };

    vector<int> idx(n), qi(q);
    iota(idx.begin(), idx.end(), 0);
    iota(qi.begin(), qi.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) { return nums1[a] > nums1[b]; });
    sort(qi.begin(), qi.end(), [&](int a, int b) {
        return queries[a][0] > queries[b][0];
    });

    vector<int> ans(q, -1);
    int p = 0;
    for (int t : qi) {
        while (p < n && nums1[idx[p]] >= queries[t][0]) {   // activate qualifying points
            int j = idx[p++];
            add(nums2[j], (long long)nums1[j] + nums2[j]);
        }
        int yq = queries[t][1];
        if (yq > ys.back()) continue;             // no stored y can reach it
        ans[t] = (int)best(yq);
    }
    return ans;
}`,
      explanation: [
        "Each index is a point (nums1[j], nums2[j]) carrying a weight, and each query asks for the maximum weight in an upper-right quadrant. Sorting both points and queries by the first coordinate descending and sweeping means the tree always holds exactly the points that already satisfy the first condition, so only the second coordinate remains to be filtered - the same dimension-shedding move as the sweep problems above.",
        "Fenwick supports prefix aggregates, not suffix ones, so the y-axis is reversed by mapping y to m - rank(y). A suffix condition nums2[j] >= yi becomes a prefix condition on the reversed ranks, and one ordinary prefix walk answers it.",
        "Max is idempotent but has no inverse, which is why this tree only ever answers prefix queries and never a general range. Trying to get max over [l, r] by combining two prefix results is the trap: unlike sums, maxima cannot be subtracted. Fortunately quadrant queries only need prefixes.",
        "The identity for max is -1 rather than 0, matching the problem's 'no such index' answer, and rankOf uses lower_bound so that a query y equal to a stored y is included. A query y strictly larger than every stored y maps to rank 0 and must be short-circuited, otherwise the walk starts at index 0 and returns the identity - correct here, but only by accident, so the explicit check documents the intent.",
        "Time: O((n + q) log n) after O((n + q) log(n + q)) sorting. Space: O(n + q).",
      ],
    },
  ],
};
