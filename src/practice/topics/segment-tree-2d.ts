import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Forest Queries",
      difficulty: "Easy",
      variation: "Static rectangle sum, 2D prefix baseline",
      link: "https://cses.fi/problemset/task/1652",
      question: [
        "You are given an n x n forest map where each square is either a tree ('*') or empty ('.'). Answer q queries: given the corners of an axis-aligned rectangle (y1, x1) as the top-left cell and (y2, x2) as the bottom-right cell, report how many trees lie inside that rectangle. Rows and columns are numbered from 1.",
        "This is the baseline every 2D range-query structure is measured against: when the grid never changes, no tree is needed at all.",
        "Example 1:\nInput:\n4 3\n.*..\n*.**\n**..\n****\n2 2 3 4\n3 1 3 1\n1 1 2 2\nOutput:\n3\n1\n2\nExplanation: Rows 2..3 and columns 2..4 hold '.**' and '*..' -> 2 + 1 = 3 trees. Row 3 column 1 is a single '*' -> 1. Rows 1..2 and columns 1..2 hold '.*' and '*.' -> 1 + 1 = 2.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= q <= 2 * 10^5\n- 1 <= y1 <= y2 <= n, 1 <= x1 <= x2 <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<string> g(n);
    for (auto& row : g) cin >> row;
    vector<vector<int>> pre(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            // inclusion-exclusion: up + left - overlap + own cell
            pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + (g[i - 1][j - 1] == '*');
    while (q--) {
        int y1, x1, y2, x2;
        cin >> y1 >> x1 >> y2 >> x2;
        cout << pre[y2][x2] - pre[y1 - 1][x2] - pre[y2][x1 - 1] + pre[y1 - 1][x1 - 1] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "State: pre[i][j] is the number of trees in the whole rectangle from (1,1) to (i,j). Every 2D range structure - prefix array, 2D Fenwick, segment tree of segment trees - is ultimately a way of maintaining exactly this quantity; they differ only in how cheaply it can be changed.",
        "The rectangle formula is inclusion-exclusion on four corner prefixes. Subtracting the strip above and the strip to the left removes the top-left block twice, so it must be added back once. The extra row and column of zeros removes all boundary special cases: y1 - 1 and x1 - 1 are always valid indices.",
        "The tempting mistake is to reach for a Fenwick or segment tree immediately. With no updates the prefix array is strictly better: it answers in O(1) instead of O(log^2 n) and needs one array instead of a tree. Only a single update in the input justifies moving up to a Fenwick tree.",
        "Time: O(n^2) build, O(1) per query. Space: O(n^2).",
      ],
    },
    {
      name: "Range Sum Query 2D - Immutable",
      difficulty: "Medium",
      variation: "Static rectangle sum on arbitrary integers",
      link: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
      question: [
        "Implement a class NumMatrix initialised with an m x n integer matrix. Support sumRegion(row1, col1, row2, col2), which returns the sum of the elements of the submatrix whose upper-left corner is (row1, col1) and whose lower-right corner is (row2, col2), inclusive. Indices are 0-based. The matrix is never modified, and there can be many queries.",
        "Example 1:\nInput: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]], then sumRegion(2,1,4,3), sumRegion(1,1,2,2), sumRegion(1,2,2,4)\nOutput: 8, 11, 12\nExplanation: Rows 2..4 and columns 1..3 hold (2,0,1), (1,0,1), (0,3,0) which sum to 8. Rows 1..2 and columns 1..2 hold 6,3,2,0 which sum to 11. Rows 1..2 and columns 2..4 hold 3,2,1,0,1,5 which sum to 12.",
        "Constraints:\n- 1 <= m, n <= 200\n- -10^4 <= matrix[i][j] <= 10^4\n- up to 10^4 calls to sumRegion",
      ],
      code: `class NumMatrix {
    vector<vector<int>> pre;   // pre[i][j] = sum of matrix[0..i-1][0..j-1]

public:
    NumMatrix(vector<vector<int>>& matrix) {
        int n = matrix.size(), m = matrix[0].size();
        pre.assign(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + matrix[i - 1][j - 1];
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        // shift by one because pre is 1-indexed
        return pre[row2 + 1][col2 + 1] - pre[row1][col2 + 1]
             - pre[row2 + 1][col1] + pre[row1][col1];
    }
};`,
      explanation: [
        "The invariant is the same as in the previous problem, only over signed values: pre[i][j] is the sum of the top-left i x j block. Negative entries change nothing, because the derivation never assumes monotonicity - it is pure addition and subtraction.",
        "The one implementation detail worth care is the index shift. Keeping pre 1-indexed while the query is 0-indexed means every corner gains a +1, and the exclusive corners row1 and col1 stay unshifted. Writing it any other way invites an off-by-one that only shows up on queries touching row 0 or column 0.",
        "Sums here stay inside a 32-bit int (200 * 200 * 10^4 = 4 * 10^8), but that is luck of the constraints. As soon as the bound on a single entry or the dimension grows, promote pre to long long - a silent overflow in a prefix array is invisible until a specific rectangle is asked for.",
        "Time: O(m * n) build, O(1) per query. Space: O(m * n).",
      ],
    },
    {
      name: "Count Number of Rectangles Containing Each Point",
      difficulty: "Medium",
      variation: "2D dominance counting with one tiny dimension",
      link: "https://leetcode.com/problems/count-number-of-rectangles-containing-each-point/",
      question: [
        "You are given rectangles where rectangles[i] = [li, hi] describes the i-th rectangle with its bottom-left corner at the origin and its top-right corner at (li, hi). You are also given points where points[j] = [xj, yj]. For every point, count how many rectangles contain it. A rectangle contains the point if 0 <= xj <= li and 0 <= yj <= hi; a point on the border counts as contained. Return the counts in query order.",
        "Example 1:\nInput: rectangles = [[1,2],[2,3],[2,5]], points = [[2,1],[1,4]]\nOutput: [2,1]\nExplanation: For (2,1) we need li >= 2 and hi >= 1, which holds for [2,3] and [2,5] but not [1,2]. For (1,4) we need li >= 1 (all three) and hi >= 4, which only [2,5] satisfies.",
        "Example 2:\nInput: rectangles = [[1,1],[2,2],[3,3]], points = [[1,3],[1,1]]\nOutput: [1,3]\nExplanation: (1,3) needs hi >= 3, so only [3,3] qualifies. (1,1) is contained by all three rectangles.",
        "Constraints:\n- 1 <= rectangles.length, points.length <= 5 * 10^4\n- 1 <= li, xj <= 10^9\n- 1 <= hi, yj <= 100",
      ],
      code: `class Solution {
public:
    vector<int> countRectangles(vector<vector<int>>& rectangles, vector<vector<int>>& points) {
        vector<vector<int>> byHeight(101);          // height is bounded by 100
        for (auto& r : rectangles) byHeight[r[1]].push_back(r[0]);
        for (auto& v : byHeight) sort(v.begin(), v.end());
        vector<int> ans;
        ans.reserve(points.size());
        for (auto& p : points) {
            int cnt = 0;
            for (int h = p[1]; h <= 100; h++) {
                auto& v = byHeight[h];
                // rectangles of this exact height whose width is >= p[0]
                cnt += v.end() - lower_bound(v.begin(), v.end(), p[0]);
            }
            ans.push_back(cnt);
        }
        return ans;
    }
};`,
      explanation: [
        "Stripped of geometry this is a 2D dominance count: how many stored pairs (l, h) satisfy l >= x and h >= y. That is exactly the query a 2D Fenwick or a segment tree of segment trees answers, so the honest general solution is a 2D structure over compressed coordinates.",
        "The constraints make a full 2D structure unnecessary: the second coordinate has only 100 distinct values. Bucketing by height turns the query into 100 independent 1D suffix counts, each a binary search on a sorted vector. This is the standard reduction - when one dimension of a 2D query is tiny, replace the outer tree by a plain loop over that dimension.",
        "The trap is treating 'contains' as strict. Both comparisons are non-strict, so the answer for a point sitting exactly on a corner must include that rectangle; lower_bound (first element >= x) is the correct boundary, upper_bound would drop the ties.",
        "Sorting once per bucket and never resorting is what keeps this fast; a per-query sort would make it quadratic. An alternative with the same complexity is suffix counts over a 100 x compressed-width grid, but the sorted buckets need no compression pass.",
        "Time: O(n log n + q * 100 * log n). Space: O(n).",
      ],
    },
    {
      name: "Range Sum Query 2D - Mutable",
      difficulty: "Hard",
      variation: "2D Fenwick template: point update, rectangle sum",
      link: "https://leetcode.com/problems/range-sum-query-2d-mutable/",
      question: [
        "Implement a class NumMatrix initialised with an m x n integer matrix that supports two operations interleaved arbitrarily: update(row, col, val) sets the single cell (row, col) to val, and sumRegion(row1, col1, row2, col2) returns the sum of the submatrix from (row1, col1) to (row2, col2) inclusive. Indices are 0-based.",
        "This is the canonical template for the whole family: a Fenwick tree whose every node holds a Fenwick tree.",
        "Example 1:\nInput: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]], then sumRegion(2,1,4,3), update(3,2,2), sumRegion(2,1,4,3)\nOutput: 8, then 10\nExplanation: The first query sums (2,0,1),(1,0,1),(0,3,0) = 8. Cell (3,2) held 0 and becomes 2, a delta of +2, and that cell lies inside the queried rectangle, so the second query returns 8 + 2 = 10.",
        "Constraints:\n- 1 <= m, n <= 200\n- -1000 <= matrix[i][j] <= 1000, -1000 <= val <= 1000\n- up to 5000 calls to update and sumRegion combined",
      ],
      code: `class NumMatrix {
    int n, m;
    vector<vector<int>> a, bit;   // a keeps current cell values so update can form a delta

    void add(int r, int c, int delta) {          // 1-indexed
        for (int i = r; i <= n; i += i & -i)
            for (int j = c; j <= m; j += j & -j)
                bit[i][j] += delta;
    }

    int pref(int r, int c) {                     // sum of rows 1..r, cols 1..c
        int s = 0;
        for (int i = r; i > 0; i -= i & -i)
            for (int j = c; j > 0; j -= j & -j)
                s += bit[i][j];
        return s;
    }

public:
    NumMatrix(vector<vector<int>>& matrix) {
        n = matrix.size();
        m = matrix[0].size();
        a = matrix;
        bit.assign(n + 1, vector<int>(m + 1, 0));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                add(i + 1, j + 1, a[i][j]);
    }

    void update(int row, int col, int val) {
        int delta = val - a[row][col];           // Fenwick stores sums, so push the difference
        a[row][col] = val;
        add(row + 1, col + 1, delta);
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        return pref(row2 + 1, col2 + 1) - pref(row1, col2 + 1)
             - pref(row2 + 1, col1) + pref(row1, col1);
    }
};`,
      explanation: [
        "The structure is a Fenwick tree of Fenwick trees. bit[i][j] covers the rows in i's Fenwick range crossed with the columns in j's Fenwick range, so a point update touches O(log n) row nodes and inside each of them O(log m) column nodes, and a prefix query walks the same shape downward. Both loops are the ordinary 1D Fenwick loops, nested.",
        "The invariant is unchanged from the static version: pref(r, c) is the sum of the top-left block, and a rectangle is four prefixes combined by inclusion-exclusion. That is why a 2D Fenwick works at all - the aggregate must be invertible so that a rectangle can be expressed as a signed sum of prefixes.",
        "The classic bug is calling update with the new value instead of the difference. A Fenwick node holds a sum, not an assignment, so the caller must keep a shadow copy of the matrix and add val - old. Forgetting this makes every repeated update on the same cell accumulate garbage.",
        "The other trap is the choice of aggregate. Sum works because it has an inverse; maximum does not, so a 2D Fenwick cannot answer rectangle maxima and a segment tree of segment trees (which descends into real subranges rather than subtracting prefixes) is required instead.",
        "Time: O(m * n * log m * log n) build (or O(m * n) with a linear-time Fenwick build), O(log m * log n) per update and per query. Space: O(m * n).",
      ],
    },
    {
      name: "Matrix Summation",
      difficulty: "Medium",
      variation: "Point assignment plus rectangle sum, multi-test judge",
      link: "https://www.spoj.com/problems/MATSUM/",
      question: [
        "A matrix of size N x N is initially all zeros. Process a sequence of commands: 'SET x y num' assigns the value num to the cell at row x and column y, and 'SUM x1 y1 x2 y2' prints the sum of the submatrix whose corners are (x1, y1) and (x2, y2), inclusive. The command 'END' terminates the current test case. Coordinates are 0-based. The first line of input holds the number of test cases, and each test case starts with N.",
        "Example 1:\nInput:\n1\n4\nSET 0 0 1\nSUM 0 0 3 3\nEND\nOutput:\n1\nExplanation: Only one cell is non-zero, and it lies inside the queried 4 x 4 rectangle.",
        "Example 2:\nInput:\n1\n3\nSET 1 1 5\nSET 2 2 7\nSUM 0 0 2 2\nSET 1 1 2\nSUM 1 1 2 2\nEND\nOutput:\n12\n9\nExplanation: After the two assignments the whole 3 x 3 matrix sums to 5 + 7 = 12. Reassigning (1,1) from 5 to 2 leaves cells 2 and 7 inside rows 1..2 and columns 1..2, giving 9.",
        "Constraints:\n- 1 <= N <= 1024\n- 0 <= x, y, x1, y1, x2, y2 < N with x1 <= x2 and y1 <= y2\n- values fit in a 32-bit integer, but sums should be accumulated in 64-bit",
      ],
      code: `int N;
vector<vector<long long>> bit, cur;   // cur holds the current value of each cell

void add(int x, int y, long long d) {
    for (int i = x; i <= N; i += i & -i)
        for (int j = y; j <= N; j += j & -j)
            bit[i][j] += d;
}

long long pref(int x, int y) {
    long long s = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j)
            s += bit[i][j];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        cin >> N;
        bit.assign(N + 1, vector<long long>(N + 1, 0));      // fresh tree per test case
        cur.assign(N + 2, vector<long long>(N + 2, 0));
        string cmd;
        while (cin >> cmd && cmd != "END") {
            if (cmd == "SET") {
                int x, y;
                long long v;
                cin >> x >> y >> v;
                x++; y++;                                    // move to 1-indexed
                add(x, y, v - cur[x][y]);                    // assignment becomes a delta
                cur[x][y] = v;
            } else {
                int x1, y1, x2, y2;
                cin >> x1 >> y1 >> x2 >> y2;
                x1++; y1++; x2++; y2++;
                cout << pref(x2, y2) - pref(x1 - 1, y2)
                      - pref(x2, y1 - 1) + pref(x1 - 1, y1 - 1) << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Same 2D Fenwick as the previous problem, wrapped in a judge harness. The two things the judge actually tests are the assignment-to-delta conversion and the per-test-case reset.",
        "SET is an assignment, not an addition, and the same cell can be set repeatedly. Keeping cur[x][y] and pushing v - cur[x][y] is what makes repeated SETs idempotent; pushing v directly is the single most common wrong answer on this problem.",
        "Reallocating bit at the start of every test case matters just as much. Reusing a dirty tree from the previous case leaks values across cases, and with N shrinking between cases a stale tree also has the wrong dimensions.",
        "The 0-based-to-1-based shift is not cosmetic: a Fenwick index must be at least 1, because i & -i is zero at index 0 and the update loop would never terminate.",
        "Time: O(log^2 N) per command. Space: O(N^2) per test case.",
      ],
    },
    {
      name: "Forest Queries II",
      difficulty: "Medium",
      variation: "Cell toggle plus rectangle count",
      link: "https://cses.fi/problemset/task/1739",
      question: [
        "You are given an n x n forest map where each square is a tree ('*') or empty ('.'). Process q operations of two kinds: '1 y x' toggles the square at row y and column x (a tree is removed, an empty square gains a tree), and '2 y1 x1 y2 x2' reports the number of trees inside the rectangle with corners (y1, x1) and (y2, x2), inclusive. Rows and columns are numbered from 1.",
        "Example 1:\nInput:\n4 3\n.*..\n*.**\n**..\n****\n2 2 2 3 4\n1 2 3\n2 2 2 3 4\nOutput:\n3\n2\nExplanation: Rows 2..3 and columns 2..4 initially hold '.**' and '*..' -> 3 trees. Toggling (2,3) removes the tree there, and that cell is inside the rectangle, so the count drops to 2.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= q <= 2 * 10^5\n- 1 <= y1 <= y2 <= n, 1 <= x1 <= x2 <= n",
      ],
      code: `int n;
vector<vector<int>> bit;

void add(int x, int y, int v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= n; j += j & -j)
            bit[i][j] += v;
}

int pref(int x, int y) {
    int s = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j)
            s += bit[i][j];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<string> g(n);
    for (auto& row : g) cin >> row;
    bit.assign(n + 1, vector<int>(n + 1, 0));
    vector<vector<int>> has(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            if (g[i - 1][j - 1] == '*') { has[i][j] = 1; add(i, j, 1); }
    while (q--) {
        int t;
        cin >> t;
        if (t == 1) {
            int y, x;
            cin >> y >> x;
            add(y, x, has[y][x] ? -1 : 1);   // toggle = delta of +1 or -1
            has[y][x] ^= 1;
        } else {
            int y1, x1, y2, x2;
            cin >> y1 >> x1 >> y2 >> x2;
            cout << pref(y2, x2) - pref(y1 - 1, x2)
                  - pref(y2, x1 - 1) + pref(y1 - 1, x1 - 1) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the exact problem a 2D Fenwick exists for: the static prefix array of Forest Queries I would need O(n^2) work to repair after a single toggle, while the tree repairs itself in O(log^2 n).",
        "A toggle is a point update of +1 or -1, so the has array is needed to know which. Without it you cannot tell an 'add a tree' from a 'remove a tree' operation, and the counts drift.",
        "Note that the update is unconditional in the sense that the judge may toggle the same cell repeatedly; the has bit flips each time and keeps the delta correct forever.",
        "The seductive wrong idea is a Fenwick over rows only, recomputing a row's contribution on each query - that is O(n) per query and times out at q = 2 * 10^5. The other trap is building the tree with n^2 separate add calls when n = 1000: that is 10^6 * log^2 calls, still acceptable here, but on tighter limits build the Fenwick in O(n^2) by adding each node into its parent instead.",
        "Time: O(n^2 log^2 n) build plus O(log^2 n) per operation. Space: O(n^2).",
      ],
    },
    {
      name: "Two Dimensional Segment Tree | Sub-Matrix Sum",
      difficulty: "Medium",
      variation: "Segment tree of segment trees, point update",
      question: [
        "Given an n x m matrix, support two operations: assign a value to a single cell (x, y), and report the sum of a submatrix given by its row range x1..x2 and column range y1..y2. Build the structure as a segment tree over rows in which every node stores a segment tree over columns, so that the same skeleton later works for aggregates that a Fenwick tree cannot handle (maximum, minimum, gcd).",
        "Indices are 0-based.",
        "Example 1:\nInput: matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]], query rows 1..2 and columns 1..2\nOutput: 34\nExplanation: The submatrix holds 6, 7, 10, 11 which sum to 34.",
        "Example 2:\nInput: same matrix, then assign 100 to cell (0,0), then query rows 0..1 and columns 0..1\nOutput: 113\nExplanation: The submatrix now holds 100, 2, 5, 6 which sum to 113.",
        "Constraints:\n- 1 <= n, m <= 1000\n- values fit in a 32-bit integer; sums need 64-bit\n- up to 10^5 operations",
      ],
      code: `struct SegTree2D {
    int n, m;
    vector<vector<long long>> t, a;   // t[rowNode][colNode]

    SegTree2D(vector<vector<long long>>& mat) {
        n = mat.size();
        m = mat[0].size();
        a = mat;
        t.assign(4 * n, vector<long long>(4 * m, 0));
        buildX(1, 0, n - 1);
    }

    // build the column tree of a fixed row node; leaves of the row tree read the
    // matrix, internal row nodes merge the two children column-wise
    void buildY(int vx, int lx, int rx, int vy, int ly, int ry) {
        if (ly == ry) {
            if (lx == rx) t[vx][vy] = a[lx][ly];
            else t[vx][vy] = t[2 * vx][vy] + t[2 * vx + 1][vy];
        } else {
            int my = (ly + ry) / 2;
            buildY(vx, lx, rx, 2 * vy, ly, my);
            buildY(vx, lx, rx, 2 * vy + 1, my + 1, ry);
            t[vx][vy] = t[vx][2 * vy] + t[vx][2 * vy + 1];
        }
    }

    void buildX(int vx, int lx, int rx) {
        if (lx != rx) {
            int mx = (lx + rx) / 2;
            buildX(2 * vx, lx, mx);
            buildX(2 * vx + 1, mx + 1, rx);
        }
        buildY(vx, lx, rx, 1, 0, m - 1);   // children first, then merge into this node
    }

    void updY(int vx, int lx, int rx, int vy, int ly, int ry, int x, int y, long long val) {
        if (ly == ry) {
            if (lx == rx) t[vx][vy] = val;
            else t[vx][vy] = t[2 * vx][vy] + t[2 * vx + 1][vy];
        } else {
            int my = (ly + ry) / 2;
            if (y <= my) updY(vx, lx, rx, 2 * vy, ly, my, x, y, val);
            else updY(vx, lx, rx, 2 * vy + 1, my + 1, ry, x, y, val);
            t[vx][vy] = t[vx][2 * vy] + t[vx][2 * vy + 1];
        }
    }

    void update(int vx, int lx, int rx, int x, int y, long long val) {
        if (lx != rx) {
            int mx = (lx + rx) / 2;
            if (x <= mx) update(2 * vx, lx, mx, x, y, val);
            else update(2 * vx + 1, mx + 1, rx, x, y, val);
        }
        updY(vx, lx, rx, 1, 0, m - 1, x, y, val);
    }

    long long qY(int vx, int vy, int ly, int ry, int y1, int y2) {
        if (y1 > y2) return 0;
        if (y1 == ly && y2 == ry) return t[vx][vy];
        int my = (ly + ry) / 2;
        return qY(vx, 2 * vy, ly, my, y1, min(y2, my))
             + qY(vx, 2 * vy + 1, my + 1, ry, max(y1, my + 1), y2);
    }

    long long query(int vx, int lx, int rx, int x1, int x2, int y1, int y2) {
        if (x1 > x2) return 0;
        if (x1 == lx && x2 == rx) return qY(vx, 1, 0, m - 1, y1, y2);
        int mx = (lx + rx) / 2;
        return query(2 * vx, lx, mx, x1, min(x2, mx), y1, y2)
             + query(2 * vx + 1, mx + 1, rx, max(x1, mx + 1), x2, y1, y2);
    }
};`,
      explanation: [
        "The state is two nested decompositions. The outer tree splits the rows; each of its nodes owns a complete segment tree over all columns holding the aggregate of that node's row band. A query first cuts the row range into O(log n) canonical row nodes, then asks each of their column trees for the column range, which costs O(log m) each.",
        "Correctness of the build and of the update rests on one rule: a column node of an internal row node is always the merge of the same column node of its two row children. That is why buildX recurses into the children before calling buildY, and why updY at an internal row node recomputes from t[2*vx][vy] and t[2*vx+1][vy] instead of writing val - only the row leaf owns the raw value.",
        "This is heavier than a 2D Fenwick (about 16 * n * m memory and a bigger constant), so for sums a Fenwick is the right tool. The reason to know this template is aggregates without an inverse: rectangle maximum cannot be recovered from four prefix maxima, but it is a plain merge here, and switching from sum to max means changing the merge operator and the identity element only.",
        "The trap is range updates. This structure supports point updates cleanly; lazy propagation over a 2D segment tree is genuinely hard because a lazy tag on a row node would have to be pushed into an entire column tree. When a problem needs rectangle updates plus rectangle sums, reach for the four-Fenwick range-update trick instead.",
        "Time: O(n * m) build, O(log n * log m) per point update, O(log n * log m) per rectangle query. Space: O(n * m) with a constant near 16.",
      ],
    },
    {
      name: "Maximum Sum Queries",
      difficulty: "Hard",
      variation: "2D maximum dominance query, offline sweep",
      link: "https://leetcode.com/problems/maximum-sum-queries/",
      question: [
        "You are given two 0-indexed integer arrays nums1 and nums2 of equal length n, and a list of queries where queries[i] = [xi, yi]. For the i-th query, find the maximum value of nums1[j] + nums2[j] over all indices j with nums1[j] >= xi and nums2[j] >= yi. If no index satisfies both conditions, the answer is -1. Return the answers in query order.",
        "Example 1:\nInput: nums1 = [4,3,1,2], nums2 = [2,4,9,5], queries = [[4,1],[1,3],[2,5]]\nOutput: [6,10,7]\nExplanation: For [4,1] only j = 0 has nums1[j] >= 4, giving 4 + 2 = 6. For [1,3] the candidates with nums2[j] >= 3 are j = 1 (7), j = 2 (10), j = 3 (7), so 10. For [2,5] only j = 3 satisfies both bounds, giving 2 + 5 = 7.",
        "Example 2:\nInput: nums1 = [2,1], nums2 = [2,3], queries = [[3,3]]\nOutput: [-1]\nExplanation: No index has nums1[j] >= 3.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= nums1[i], nums2[i] <= 10^9\n- 1 <= queries.length <= 10^5\n- 1 <= xi, yi <= 10^9",
      ],
      code: `class Solution {
    vector<int> seg;   // iterative max segment tree over compressed nums2
    int sz;

    void update(int pos, int val) {
        for (pos += sz; pos > 0; pos >>= 1) seg[pos] = max(seg[pos], val);
    }

    int query(int l, int r) {          // max on [l, r], -1 when empty
        int res = -1;
        for (l += sz, r += sz + 1; l < r; l >>= 1, r >>= 1) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    vector<int> maximumSumQueries(vector<int>& nums1, vector<int>& nums2, vector<vector<int>>& queries) {
        int n = nums1.size(), q = queries.size();
        vector<int> ys = nums2;
        sort(ys.begin(), ys.end());
        ys.erase(unique(ys.begin(), ys.end()), ys.end());
        sz = ys.size();
        seg.assign(2 * sz, -1);

        vector<int> idx(n), qi(q);
        iota(idx.begin(), idx.end(), 0);
        iota(qi.begin(), qi.end(), 0);
        sort(idx.begin(), idx.end(), [&](int a, int b) { return nums1[a] > nums1[b]; });
        sort(qi.begin(), qi.end(), [&](int a, int b) { return queries[a][0] > queries[b][0]; });

        vector<int> ans(q, -1);
        int p = 0;
        for (int k : qi) {
            // insert every point whose first coordinate still clears this query's bound
            while (p < n && nums1[idx[p]] >= queries[k][0]) {
                int j = idx[p++];
                int pos = lower_bound(ys.begin(), ys.end(), nums2[j]) - ys.begin();
                update(pos, nums1[j] + nums2[j]);
            }
            int lo = lower_bound(ys.begin(), ys.end(), queries[k][1]) - ys.begin();
            if (lo < sz) ans[k] = query(lo, sz - 1);
        }
        return ans;
    }
};`,
      explanation: [
        "The query is a 2D dominance maximum: over points (nums1[j], nums2[j]) with weight nums1[j] + nums2[j], find the largest weight in the quadrant x >= xi, y >= yi. A literal 2D structure would work, but sweeping one dimension removes it entirely.",
        "Sort both the points and the queries by the first coordinate in decreasing order and sweep. When a query is processed, every point already inserted satisfies nums1[j] >= xi and nothing else has been inserted, so the first constraint is enforced by time rather than by the data structure. What remains is a 1D suffix maximum over the second coordinate - a single max segment tree on compressed nums2 values.",
        "The tree only ever grows values (update takes a max up the path), which is exactly right because points are never removed during the sweep. That is what allows the cheap update instead of a full assign-and-recompute.",
        "Two traps. First, maximum has no inverse, so a Fenwick prefix-subtraction trick is unavailable and the query must be a genuine range max - here the suffix [lo, sz-1]. Second, both comparisons are non-strict: the while loop must use >= for the sweep and lower_bound (not upper_bound) for the y bound, otherwise ties are silently dropped. Note also that answers can be up to 2 * 10^9, so on judges where int is 32 bits the weight must be widened; here the problem guarantees it fits the returned type.",
        "Time: O((n + q) log n). Space: O(n + q).",
      ],
    },
    {
      name: "Operations on a Matrix",
      difficulty: "Hard",
      variation: "Column range add plus row assignment, offline",
      link: "https://atcoder.jp/contests/abc253/tasks/abc253_f",
      question: [
        "There is an N x M matrix initially filled with zeros. Process Q queries of three kinds: '1 l r x' adds x to every element in columns l..r of every row; '2 i x' replaces every element of row i with x; '3 i j' asks for the current value of the element at row i, column j. Print the answer to every query of the third kind.",
        "The matrix is far too large to store, so each type-3 answer must be reconstructed from the operation history.",
        "Example 1:\nInput:\n2 3 6\n1 1 2 5\n3 1 2\n2 1 3\n3 1 2\n1 2 3 1\n3 2 3\nOutput:\n5\n3\n1\nExplanation: After the first query the matrix is [[5,5,0],[5,5,0]], so (1,2) is 5. Row 1 is then overwritten with 3s, so (1,2) is 3. The next query adds 1 to columns 2..3, and (2,3) - never touched by the first add and never overwritten - becomes 0 + 1 = 1.",
        "Constraints:\n- 1 <= N, M, Q <= 2 * 10^5\n- 1 <= l <= r <= M, 1 <= i <= N, 1 <= j <= M\n- 1 <= x <= 10^9 (accumulated values need 64-bit)",
      ],
      code: `int M;
vector<long long> bitc;

void add(int i, long long v) { for (; i <= M; i += i & -i) bitc[i] += v; }
long long pref(int i) { long long s = 0; for (; i > 0; i -= i & -i) s += bitc[i]; return s; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> M >> q;
    vector<array<long long, 4>> op(q + 1);
    for (int i = 1; i <= q; i++) {
        long long t;
        cin >> t;
        op[i][0] = t;
        if (t == 1) cin >> op[i][1] >> op[i][2] >> op[i][3];
        else cin >> op[i][1] >> op[i][2];
    }

    // pass 1: for each type-3 query, remember when its row was last overwritten
    vector<long long> lastTime(n + 1, 0), lastVal(n + 1, 0);
    vector<array<long long, 4>> ev;   // (time, column, sign, answer index)
    vector<long long> ans;
    for (int i = 1; i <= q; i++) {
        if (op[i][0] == 2) { lastTime[op[i][1]] = i; lastVal[op[i][1]] = op[i][2]; }
        else if (op[i][0] == 3) {
            int r = (int)op[i][1], c = (int)op[i][2];
            int k = ans.size();
            ans.push_back(lastTime[r] ? lastVal[r] : 0);
            ev.push_back({(long long)i, c, 1, k});                       // add adds up to now
            if (lastTime[r]) ev.push_back({lastTime[r], c, -1, k});      // minus adds before the assign
        }
    }

    // pass 2: replay only the column adds and evaluate the scheduled point queries
    sort(ev.begin(), ev.end());
    bitc.assign(M + 2, 0);
    size_t p = 0;
    for (int i = 1; i <= q; i++) {
        while (p < ev.size() && ev[p][0] == i) { ans[ev[p][3]] += ev[p][2] * pref(ev[p][1]); p++; }
        if (op[i][0] == 1) { add((int)op[i][1], op[i][3]); add((int)op[i][2] + 1, -op[i][3]); }
    }
    for (long long v : ans) cout << v << "\\n";
    return 0;
}`,
      explanation: [
        "The key observation collapses the second dimension: a column add treats every row identically, so the value at (i, j) is (the value written by the last assignment to row i) plus (the total column-j adds that happened after that assignment). If row i was never assigned, the base is 0 and all adds count.",
        "So the answer is lastVal[i] + C(t, j) - C(s, j), where C(time, j) is the accumulated column-j adds up to that time, t is the query time and s the time of the last assignment to row i. C is a 1D range-add point-query problem: a difference-array Fenwick where '1 l r x' becomes add(l, x) and add(r+1, -x), and C(time, j) is the prefix sum up to j.",
        "The difficulty is that C(s, j) refers to a past state and j is unknown at time s. Going offline fixes it: pass 1 discovers which (time, column) pairs are needed and with which sign, pass 2 replays the adds in chronological order and evaluates each scheduled probe at exactly the right moment. Evaluating events at time i before applying operation i is what makes 'before the assignment' precise.",
        "The tempting wrong approach is a real 2D structure over an N x M grid, or storing a row offset per row - both are too slow or simply wrong, because an assignment must cancel all earlier column adds for that row only, and a per-row scalar cannot express which columns had been raised.",
        "Values reach 2 * 10^5 * 10^9, so every accumulator must be 64-bit.",
        "Time: O((Q + M) log M). Space: O(N + M + Q).",
      ],
    },
    {
      name: "Iahub and Xors",
      difficulty: "Hard",
      variation: "Rectangle update and rectangle query with a parity-split Fenwick",
      link: "https://codeforces.com/problemset/problem/341/D",
      question: [
        "You are given an n x n matrix initially filled with zeros. Process m operations of two kinds: '2 x0 y0 x1 y1 v' xors the value v into every element of the submatrix with corners (x0, y0) and (x1, y1); '1 x0 y0 x1 y1' prints the xor of all elements of that submatrix. Rows and columns are numbered from 1.",
        "Example 1:\nInput:\n3 5\n2 1 1 2 2 1\n2 1 3 2 3 2\n2 3 1 3 3 3\n1 2 2 3 3\n1 2 2 3 2\nOutput:\n3\n2\nExplanation: After the three updates the matrix is [[1,1,2],[1,1,2],[3,3,3]]. The first query xors cells 1, 2, 3, 3 giving 1 xor 2 = 3. The second query xors cells 1 and 3, giving 2.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= m <= 10^5\n- 0 <= v < 2^62\n- 1 <= x0 <= x1 <= n, 1 <= y0 <= y1 <= n",
      ],
      code: `const int MAXN = 1005;
long long t[2][2][MAXN][MAXN];   // one Fenwick per parity class of the update corner
int n;

void upd(int x, int y, long long v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= n; j += j & -j)
            t[x & 1][y & 1][i][j] ^= v;
}

long long qry(int x, int y) {     // xor of the submatrix (1,1)..(x,y)
    long long r = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j)
            r ^= t[x & 1][y & 1][i][j];
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    while (m--) {
        int op, x0, y0, x1, y1;
        cin >> op >> x0 >> y0 >> x1 >> y1;
        if (op == 1) {
            cout << (qry(x1, y1) ^ qry(x0 - 1, y1) ^ qry(x1, y0 - 1) ^ qry(x0 - 1, y0 - 1)) << "\\n";
        } else {
            long long v;
            cin >> v;
            // xor is its own inverse, so the 2D difference stamp uses v four times
            upd(x0, y0, v); upd(x0, y1 + 1, v); upd(x1 + 1, y0, v); upd(x1 + 1, y1 + 1, v);
        }
    }
    return 0;
}`,
      explanation: [
        "Store a 2D difference array d, so that A[x][y] is the xor of d[i][j] over all i <= x, j <= y. A rectangle xor-update is then four point stamps of v at the corners, exactly like the additive difference trick - and because xor is its own inverse, all four stamps carry the same v with no sign to track.",
        "Now expand a prefix query. The xor of A over (1,1)..(X,Y) counts each d[i][j] once for every cell of the rectangle that lies at or below-right of (i,j), that is (X-i+1) * (Y-j+1) times. Under xor only the parity matters, and that product is odd exactly when X-i+1 and Y-j+1 are both odd, i.e. when i has the same parity as X and j the same parity as Y.",
        "That is the whole trick: keep four independent Fenwick trees indexed by (i mod 2, j mod 2), route each stamp into the tree for its own corner parity, and answer a prefix query from the single tree matching the parity of (X, Y). Everything else is the usual four-corner inclusion-exclusion, with xor replacing plus and minus.",
        "The naive alternatives both fail: a lazy 2D segment tree with rectangle tags is very awkward to write, and a plain single-Fenwick difference array is simply wrong here because xor is not linear in the repetition count - dropping the parity split silently returns garbage on any rectangle wider than one cell.",
        "Practical notes: v can reach 2^62 so the trees must be long long, memory is 4 * 1001^2 * 8 bytes which is about 32 MB, and stamps at index n+1 are harmless because the update loop starts above n and does nothing.",
        "Time: O(log^2 n) per operation. Space: O(n^2) with a factor of 4.",
      ],
    },
    {
      name: "The Untended Antiquity",
      difficulty: "Hard",
      variation: "Rectangle update, point query, plus hashing for reachability",
      link: "https://codeforces.com/problemset/problem/869/E",
      question: [
        "You have an n x m grid. Process q operations: '1 r1 c1 r2 c2' places a barrier along the perimeter of the rectangle with corners (r1, c1) and (r2, c2); '2 r1 c1 r2 c2' removes the barrier previously placed on that exact perimeter; '3 r1 c1 r2 c2' asks whether it is possible to walk from cell (r1, c1) to cell (r2, c2) moving between side-adjacent cells without crossing any barrier. Print 'Yes' or 'No' for each query of the third kind. Barriers never touch or intersect one another, so any two barriers are either disjoint or nested, and no barrier ever lies on the grid border.",
        "Example 1:\nInput:\n5 6 5\n1 2 2 4 5\n1 3 3 3 3\n3 4 4 1 1\n2 2 2 4 5\n3 1 1 4 4\nOutput:\nNo\nYes\nExplanation: Cell (4,4) sits inside the first barrier while (1,1) does not, so the walk is blocked. After that barrier is removed, neither (1,1) nor (4,4) is enclosed by the remaining barrier around (3,3), so they are mutually reachable.",
        "Example 2:\nInput:\n3 3 3\n1 2 2 2 2\n3 2 2 1 1\n3 1 1 1 3\nOutput:\nNo\nYes\nExplanation: The single barrier encloses only cell (2,2), so (2,2) and (1,1) are separated, while (1,1) and (1,3) are both outside every barrier.",
        "Constraints:\n- 1 <= n, m <= 2500\n- 1 <= q <= 10^5\n- barriers are pairwise non-intersecting and never on the border",
      ],
      code: `int n, m;
vector<vector<unsigned long long>> bit;

void add(int x, int y, unsigned long long v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= m; j += j & -j)
            bit[i][j] += v;
}

// range update via a 2D difference stamp; a point query is then a prefix sum
void rectAdd(int r1, int c1, int r2, int c2, unsigned long long v) {
    add(r1, c1, v);
    add(r2 + 1, c2 + 1, v);
    add(r1, c2 + 1, 0ULL - v);
    add(r2 + 1, c1, 0ULL - v);
}

unsigned long long pointQuery(int x, int y) {
    unsigned long long s = 0;
    for (int i = x; i > 0; i -= i & -i)
        for (int j = y; j > 0; j -= j & -j)
            s += bit[i][j];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> m >> q;
    bit.assign(n + 2, vector<unsigned long long>(m + 2, 0));
    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    map<array<int, 4>, unsigned long long> tag;
    while (q--) {
        int t, r1, c1, r2, c2;
        cin >> t >> r1 >> c1 >> r2 >> c2;
        if (t == 1) {
            unsigned long long v = rng();          // a fresh random id for this barrier
            tag[{r1, c1, r2, c2}] = v;
            rectAdd(r1, c1, r2, c2, v);
        } else if (t == 2) {
            rectAdd(r1, c1, r2, c2, 0ULL - tag[{r1, c1, r2, c2}]);
        } else {
            cout << (pointQuery(r1, c1) == pointQuery(r2, c2) ? "Yes" : "No") << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The reachability condition is combinatorial, not a search. Because barriers are pairwise non-intersecting, they form a laminar family, and a walk can leave or enter a barrier only by crossing it. So two cells are mutually reachable exactly when they are enclosed by the same set of barriers - and then a path avoiding all barriers exists inside their common innermost region.",
        "Comparing sets of barriers cheaply is the hashing step. Give each placed barrier a random 64-bit id and add that id to every cell of its interior; a cell's point value is then the sum of the ids of all barriers containing it. Equal sums means equal sets with overwhelming probability, since a false positive needs a random subset collision in a 64-bit space.",
        "The structure is the mirror image of the earlier template: a 2D Fenwick used for rectangle update and point query. Stamp the four difference corners with +v, +v, -v, -v and a prefix sum recovers the value at a single cell. Working in unsigned long long makes the wraparound on the negative stamps well defined rather than undefined behaviour.",
        "Removal reuses the recorded id with the opposite sign, which is why the map from the four corners to the id is needed - regenerating a random value on removal would leave permanent noise in the tree.",
        "The tempting wrong approach is BFS or flood fill per type-3 query: with a 2500 x 2500 grid and 10^5 queries that is hopeless. A second, subtler error is using a fixed counter (say barrier index) instead of a random id: sums of small distinct integers collide easily, for instance ids 1 and 2 versus a single id 3.",
        "Time: O(log n * log m) per operation, plus O(log q) for the map. Space: O(n * m).",
      ],
    },
  ],
};
