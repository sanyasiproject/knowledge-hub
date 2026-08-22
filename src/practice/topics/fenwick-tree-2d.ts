import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Forest Queries",
      difficulty: "Easy",
      variation: "Static baseline: 2D prefix sums, no Fenwick needed",
      link: "https://cses.fi/problemset/task/1652",
      question: [
        "You are given an n x n grid describing a forest. Each cell is either empty ('.') or contains a tree ('*'). Your task is to process q queries of the form: how many trees are inside a given rectangle of the forest? A query gives y1 x1 y2 x2, the top-left and bottom-right corners of the rectangle, with rows and columns numbered from 1.",
        "The grid never changes, so this is the static version of the problem - it is the baseline every Fenwick variation below is measured against.",
        "Example 1:\nInput:\n4 3\n.*..\n*.**\n**..\n****\n2 2 3 4\n3 1 3 1\n1 1 2 2\nOutput:\n3\n1\n2\nExplanation: Rows 2..3 and columns 2..4 hold the trees at (2,3), (2,4) and (3,2), so 3. The single cell (3,1) is a tree, so 1. Rows 1..2 and columns 1..2 hold (1,2) and (2,1), so 2.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= q <= 2 * 10^5\n- 1 <= y1 <= y2 <= n and 1 <= x1 <= x2 <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<string> g(n + 1);
    for (int i = 1; i <= n; i++) cin >> g[i];
    vector<vector<int>> p(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            // g is 0-indexed inside each row string, the table is 1-indexed
            p[i][j] = p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1] + (g[i][j - 1] == '*');
        }
    }
    while (q--) {
        int r1, c1, r2, c2;
        cin >> r1 >> c1 >> r2 >> c2;
        long long ans = p[r2][c2] - p[r1 - 1][c2] - p[r2][c1 - 1] + p[r1 - 1][c1 - 1];
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The state is p[i][j] = number of trees in the whole prefix rectangle (1,1)..(i,j). Building it needs the same inclusion-exclusion that every 2D range structure uses: the two overlapping prefixes p[i-1][j] and p[i][j-1] double count p[i-1][j-1], so that term is subtracted back out.",
        "A rectangle sum is then four table lookups: p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1]. Memorise this identity - a 2D Fenwick answers exactly the same four prefix queries, only each one costs O(log^2 n) instead of O(1) because the table is now updatable.",
        "The trap is reaching for a Fenwick tree here. With no updates a Fenwick is strictly worse: same memory, log^2 per query instead of constant, and more code. Only pay for a Fenwick once cells actually change.",
        "The other trap is the query order: CSES gives row bounds before column bounds (y1 x1 y2 x2), so reading them as x1 y1 x2 y2 silently transposes every query.",
        "Time: O(n^2 + q). Space: O(n^2).",
      ],
    },
    {
      name: "Two Dimensional Binary Indexed Tree (Fenwick Tree)",
      difficulty: "Easy",
      variation: "Template: point add, submatrix sum",
      question: [
        "Implement a data structure over an n x m matrix, indexed from 1, that supports two operations, each in O(log n * log m): update(x, y, v) adds v to the single cell (x, y), and rect(x1, y1, x2, y2) returns the sum of all cells inside that rectangle. The structure must be built from an initial matrix.",
        "This is the template of the pattern: a Fenwick tree whose every node stores, instead of one number, a whole Fenwick tree over the second coordinate.",
        "Example 1:\nInput: n = 2, m = 2, matrix = [[1,2],[3,4]], operations = rect(1,1,2,2), update(1,2,5), rect(1,1,1,2)\nOutput: 10, then 8\nExplanation: The full matrix sums to 1+2+3+4 = 10. After adding 5 to cell (1,2) the first row is 1 and 7, which sums to 8.",
        "Example 2:\nInput: n = 3, m = 3, matrix = all zeros, operations = update(2,2,4), rect(1,1,3,3), rect(3,3,3,3)\nOutput: 4, then 0\nExplanation: Only cell (2,2) is non-zero, so it is counted by the first rectangle and missed by the second.",
        "Constraints:\n- 1 <= n, m <= 2000\n- cell values fit in a 64-bit integer\n- 1 <= x1 <= x2 <= n and 1 <= y1 <= y2 <= m",
      ],
      code: `struct BIT2D {
    int n, m;
    vector<vector<long long>> t;

    BIT2D(int n, int m) : n(n), m(m), t(n + 1, vector<long long>(m + 1, 0)) {}

    // add v to cell (x, y)
    void update(int x, int y, long long v) {
        for (int i = x; i <= n; i += i & -i)          // walk the row Fenwick upward
            for (int j = y; j <= m; j += j & -j)      // inside it, walk the column Fenwick
                t[i][j] += v;
    }

    // sum of the prefix rectangle (1,1)..(x,y)
    long long pref(int x, int y) const {
        long long s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s += t[i][j];
        return s;
    }

    long long rect(int x1, int y1, int x2, int y2) const {
        return pref(x2, y2) - pref(x1 - 1, y2) - pref(x2, y1 - 1) + pref(x1 - 1, y1 - 1);
    }
};

BIT2D build(vector<vector<long long>>& a) {
    int n = a.size(), m = a[0].size();
    BIT2D bit(n, m);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            bit.update(i + 1, j + 1, a[i][j]);
    return bit;
}`,
      explanation: [
        "A 1D Fenwick node i is responsible for the block of indices (i - lowbit(i), i]. The 2D version keeps that idea on both axes at once: t[i][j] holds the sum of the rectangle (i - lowbit(i), i] x (j - lowbit(j), j]. So the outer index selects a band of rows and the inner index a band of columns, and the whole structure is a Fenwick tree of Fenwick trees stored in one flat 2D array.",
        "A prefix query decomposes x into at most log n disjoint row blocks and, for each of them, y into at most log m disjoint column blocks. Those blocks tile the prefix rectangle exactly once each, which is why a plain sum is correct with no overlap correction. A point update touches exactly the blocks that cover that cell, which is the same log n * log m set.",
        "Only the four-corner inclusion-exclusion turns prefix rectangles into arbitrary rectangles, and it needs the operation to be invertible. Sum, XOR and count all qualify; min and max do not, which is precisely why a 2D Fenwick cannot answer submatrix minimum and a 2D segment tree is needed there.",
        "Do not build by calling update on every cell if the matrix is large and time is tight - that is O(n m log n log m). An O(n m) build is possible by loading the raw values into t and then pushing each t[i][j] into its parent on each axis, exactly as in 1D.",
        "Time: O(log n * log m) per update and per prefix query, so O(log n * log m) per rectangle sum; O(n m log n log m) for this build. Space: O(n m).",
      ],
    },
    {
      name: "Range Sum Query 2D - Mutable",
      difficulty: "Medium",
      variation: "Point assignment via delta",
      link: "https://leetcode.com/problems/range-sum-query-2d-mutable/",
      question: [
        "Given a 2D matrix, design a class NumMatrix that handles two operations: update(row, col, val) sets the value of matrix[row][col] to val, and sumRegion(row1, col1, row2, col2) returns the sum of the elements inside the rectangle with upper-left corner (row1, col1) and lower-right corner (row2, col2). Indices are 0-based. There will be many interleaved calls of both kinds.",
        "Example 1:\nInput:\nNumMatrix([[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]])\nsumRegion(2, 1, 4, 3)\nupdate(3, 2, 2)\nsumRegion(2, 1, 4, 3)\nOutput: 8, then 10\nExplanation: The rectangle covers rows 2..4 and columns 1..3: (2,0,1) sums to 3, (1,0,1) sums to 2, (0,3,0) sums to 3, for a total of 8. Setting cell (3,2) from 0 to 2 raises that total by 2.",
        "Constraints:\n- 1 <= rows, cols <= 200\n- -1000 <= matrix[i][j], val <= 1000\n- At most 5000 calls to update and sumRegion",
      ],
      code: `class NumMatrix {
    int n, m;
    vector<vector<int>> a;                // the current cell values
    vector<vector<long long>> t;          // the 2D Fenwick tree

    void bump(int x, int y, long long v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= m; j += j & -j)
                t[i][j] += v;
    }

    long long pref(int x, int y) {
        long long s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s += t[i][j];
        return s;
    }

public:
    NumMatrix(vector<vector<int>>& matrix) {
        n = matrix.size();
        m = matrix[0].size();
        a = matrix;
        t.assign(n + 1, vector<long long>(m + 1, 0));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                bump(i + 1, j + 1, matrix[i][j]);
    }

    void update(int row, int col, int val) {
        bump(row + 1, col + 1, (long long)val - a[row][col]);   // push only the change
        a[row][col] = val;
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        // shift to 1-based, then four-corner inclusion-exclusion
        return (int)(pref(row2 + 1, col2 + 1) - pref(row1, col2 + 1)
                     - pref(row2 + 1, col1) + pref(row1, col1));
    }
};`,
      explanation: [
        "A Fenwick tree only knows how to add, never how to assign. The bridge is to keep the raw matrix alongside the tree: an assignment of val to a cell whose current value is old is the additive update val - old, and the mirror copy is what lets you compute that difference in O(1).",
        "Everything else is the template. The 0-based interface is converted to the 1-based tree by adding one to each coordinate, which also makes pref(0, y) and pref(x, 0) return zero for free, so the row1 = 0 or col1 = 0 edge cases need no special handling.",
        "The tempting wrong approach is a plain 2D prefix-sum table, which answers queries in O(1) but needs O(rows * cols) work to repair after every update - 5000 updates on a 200 x 200 matrix is 2 * 10^8 cell rewrites. The other extreme, summing the rectangle cell by cell, is O(rows * cols) per query. The Fenwick balances both at O(log rows * log cols).",
        "Accumulate in 64-bit even though every value fits in an int: 200 x 200 cells at 1000 each is 4 * 10^7, safe here, but the habit is what saves you when the bounds grow.",
        "Time: O(rows * cols * log rows * log cols) to build, O(log rows * log cols) per update and per query. Space: O(rows * cols).",
      ],
    },
    {
      name: "Forest Queries II",
      difficulty: "Medium",
      variation: "Cell toggle plus rectangle count",
      link: "https://cses.fi/problemset/task/1739",
      question: [
        "You are given an n x n grid forest where each cell is either empty ('.') or contains a tree ('*'). Process q operations of two kinds: '1 y x' toggles the cell at row y, column x (a tree is chopped down, or a tree grows on an empty cell), and '2 y1 x1 y2 x2' asks for the number of trees inside the rectangle with corners (y1,x1) and (y2,x2). Print the answer to every query of the second kind.",
        "Example 1:\nInput:\n4 3\n.*..\n*.**\n**..\n****\n2 2 2 3 4\n1 3 3\n2 2 2 3 4\nOutput:\n3\n4\nExplanation: Rows 2..3 by columns 2..4 initially hold the trees (2,3), (2,4) and (3,2), so 3. The toggle grows a tree on the empty cell (3,3), which lies inside the same rectangle, so the count becomes 4.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= q <= 2 * 10^5\n- 1 <= y, x, y1 <= y2 <= n and 1 <= x1 <= x2 <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<string> g(n + 1);
    for (int i = 1; i <= n; i++) cin >> g[i];
    vector<vector<int>> t(n + 1, vector<int>(n + 1, 0));
    auto bump = [&](int x, int y, int v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= n; j += j & -j)
                t[i][j] += v;
    };
    auto pref = [&](int x, int y) {
        int s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s += t[i][j];
        return s;
    };
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            if (g[i][j - 1] == '*') bump(i, j, 1);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int y, x;
            cin >> y >> x;
            if (g[y][x - 1] == '*') {                 // chop it down
                g[y][x - 1] = '.';
                bump(y, x, -1);
            } else {                                  // a tree grows
                g[y][x - 1] = '*';
                bump(y, x, 1);
            }
        } else {
            int r1, c1, r2, c2;
            cin >> r1 >> c1 >> r2 >> c2;
            int ans = pref(r2, c2) - pref(r1 - 1, c2) - pref(r2, c1 - 1) + pref(r1 - 1, c1 - 1);
            cout << ans << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is Forest Queries with updates, which is exactly where the Fenwick earns its keep. The tree stores counts (0 or 1 per cell) rather than arbitrary values, so a rectangle sum is a rectangle count.",
        "A toggle is not a special operation - it is +1 or -1 depending on the current character, so the grid must be kept as the source of truth beside the tree. Blindly adding 1 on every operation of type 1 is the classic bug: the statement toggles, it does not plant.",
        "The build loops n^2 cells and calls update on each, which is 10^6 * 100 elementary steps in the worst case and still comfortably fast. If it were not, load the raw counts into t and propagate each node into its parent on both axes for an O(n^2) build.",
        "Counts stay below n^2 = 10^6, so int is enough here; the moment cell values are real numbers instead of flags, switch to long long.",
        "Time: O(n^2 log^2 n) to build, O(log^2 n) per toggle and per query. Space: O(n^2).",
      ],
    },
    {
      name: "Matrix Summation",
      difficulty: "Medium",
      variation: "Multi-test judge harness, SET semantics, unordered corners",
      link: "https://www.spoj.com/problems/MATSUM/",
      question: [
        "You are given an N x N matrix of integers, initially all zero, with rows and columns numbered from 0. Process a sequence of commands: 'SET x y num' sets the cell (x, y) to num, 'SUM x1 y1 x2 y2' prints the sum of all cells inside the rectangle spanned by (x1,y1) and (x2,y2), and 'END' terminates the current test case. The first line of input is the number of test cases, and each test case starts with its own N.",
        "Note two judge quirks: SET replaces the cell's value rather than adding to it, and the corners of a SUM query are not guaranteed to arrive in increasing order.",
        "Example 1:\nInput:\n1\n4\nSET 0 0 1\nSET 3 3 5\nSUM 0 0 3 3\nSET 0 0 4\nSUM 0 0 1 1\nEND\nOutput:\n6\n4\nExplanation: After the two SET commands the only non-zero cells are (0,0) = 1 and (3,3) = 5, so the whole matrix sums to 6. Overwriting (0,0) with 4 makes the top-left 2 x 2 block sum to 4, since (3,3) lies outside it.",
        "Constraints:\n- 1 <= number of test cases <= 20\n- 1 <= N <= 1024\n- 0 <= x, y < N\n- cell values fit in a signed 32-bit integer, sums may not",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        vector<vector<long long>> val(n + 1, vector<long long>(n + 1, 0));   // current values
        vector<vector<long long>> t(n + 1, vector<long long>(n + 1, 0));     // Fenwick
        auto bump = [&](int x, int y, long long v) {
            for (int i = x; i <= n; i += i & -i)
                for (int j = y; j <= n; j += j & -j)
                    t[i][j] += v;
        };
        auto pref = [&](int x, int y) {
            long long s = 0;
            for (int i = x; i > 0; i -= i & -i)
                for (int j = y; j > 0; j -= j & -j)
                    s += t[i][j];
            return s;
        };
        string cmd;
        while (cin >> cmd && cmd != "END") {
            if (cmd == "SET") {
                int x, y;
                long long v;
                cin >> x >> y >> v;
                x++; y++;                                // 0-based input, 1-based tree
                bump(x, y, v - val[x][y]);               // SET means push the delta
                val[x][y] = v;
            } else {
                int r1, c1, r2, c2;
                cin >> r1 >> c1 >> r2 >> c2;
                r1++; c1++; r2++; c2++;
                if (r1 > r2) swap(r1, r2);               // corners may arrive reversed
                if (c1 > c2) swap(c1, c2);
                long long ans = pref(r2, c2) - pref(r1 - 1, c2) - pref(r2, c1 - 1) + pref(r1 - 1, c1 - 1);
                cout << ans << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Algorithmically this is the template again, but it is the cleanest drill for the two things that actually break 2D Fenwick submissions on judges: assignment semantics and coordinate hygiene.",
        "SET is an assignment, so the value pushed into the tree is v - val[x][y] and the mirror array must then be refreshed. Pushing v itself makes repeated SETs on the same cell accumulate, which passes the sample and fails the hidden tests.",
        "Corners are not sorted, so an unswapped query computes pref over an inverted rectangle and returns garbage - usually a plausible-looking wrong number rather than a crash. Sorting the two corners costs nothing and removes the whole class of bug.",
        "Both the tree and the mirror must be reallocated per test case, since N changes; reusing a stale tree across test cases leaks values from the previous one. Sums of up to 1024^2 cells at int magnitude overflow 32 bits, so accumulate in long long.",
        "Time: O(log^2 N) per command. Space: O(N^2) per test case.",
      ],
    },
    {
      name: "Two Dimensional Binary Indexed Tree: Range Update, Point Query",
      difficulty: "Medium",
      variation: "2D difference array inside a Fenwick",
      question: [
        "Implement a structure over an n x m matrix, initially all zeros and indexed from 1, supporting rangeAdd(x1, y1, x2, y2, v), which adds v to every cell of that rectangle, and pointValue(x, y), which returns the current value of a single cell. Both operations must run in O(log n * log m).",
        "Example 1:\nInput: n = 4, m = 4, operations = rangeAdd(2,2,3,3,5), pointValue(2,3), pointValue(1,1), then rangeAdd(1,1,4,4,2), pointValue(2,2), pointValue(4,4)\nOutput: 5, 0, 7, 2\nExplanation: The first rectangle covers rows 2..3 and columns 2..3, so (2,3) holds 5 while (1,1) is untouched. The second rectangle covers everything, so (2,2) becomes 5+2 = 7 and (4,4), which the first rectangle missed, becomes 2.",
        "Example 2:\nInput: n = 2, m = 2, operations = rangeAdd(1,1,1,2,3), pointValue(1,2), pointValue(2,2)\nOutput: 3, 0\nExplanation: Only the first row was raised.",
        "Constraints:\n- 1 <= n, m <= 2000\n- 1 <= x1 <= x2 <= n and 1 <= y1 <= y2 <= m\n- values fit in a 64-bit integer",
      ],
      code: `struct RangeAddPointQuery {
    int n, m;
    vector<vector<long long>> t;

    RangeAddPointQuery(int n, int m) : n(n), m(m), t(n + 2, vector<long long>(m + 2, 0)) {}

    void bump(int x, int y, long long v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= m; j += j & -j)
                t[i][j] += v;
    }

    // add v to every cell of the rectangle: four corners of the 2D difference array
    void rangeAdd(int x1, int y1, int x2, int y2, long long v) {
        bump(x1, y1, v);
        bump(x1, y2 + 1, -v);
        bump(x2 + 1, y1, -v);
        bump(x2 + 1, y2 + 1, v);
    }

    // the cell value is the prefix sum of the difference array
    long long pointValue(int x, int y) const {
        long long s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s += t[i][j];
        return s;
    }
};`,
      explanation: [
        "Flip what the tree stores. Instead of holding cell values and answering prefix sums, it holds a 2D difference array d, and the value of a cell is the prefix sum of d over (1,1)..(x,y). Adding v to a rectangle is then four point updates on d, and reading a cell is one prefix query - the exact dual of the previous structure, using the same code.",
        "Why four corners: the quadrant (i >= x1, j >= y1) gets +v, which overshoots by covering everything to the right of y2 and below x2. Subtracting v at (x1, y2+1) and at (x2+1, y1) cancels those two overhangs, and the bottom-right region beyond both was cancelled twice, so +v at (x2+1, y2+1) restores it. That is the same inclusion-exclusion as the four-corner sum, read backwards.",
        "Out-of-range corners need no guard: bump with x = n+1 or y = m+1 enters a loop whose condition is immediately false, so the write is silently dropped, which is exactly right because such a marker could never influence any legal prefix query. Padding the arrays to n+2 by m+2 keeps that harmless even if the loop bounds are later relaxed.",
        "This structure cannot answer rectangle sums - only single cells. Attempting to sum a rectangle by adding pointValue over its cells is O(area * log^2), and the correct fix is the four-Fenwick construction in the next problem.",
        "Time: O(log n * log m) per range update and per point query. Space: O(n m).",
      ],
    },
    {
      name: "Nested Ranges Count",
      difficulty: "Medium",
      variation: "Offline 2D dominance counting: sort one axis, Fenwick the other",
      link: "https://cses.fi/problemset/task/2169",
      question: [
        "Given n ranges, your task is to count for each range how many other ranges it contains and how many other ranges contain it. Range [a,b] contains range [c,d] if a <= c and d <= b. Print two lines: on the first line, for each range in input order, the number of ranges it contains; on the second line, for each range, the number of ranges that contain it.",
        "Each range is a point (a, b) in the plane and containment is a dominance relation between two coordinates, so this is the archetypal problem people reach for a 2D Fenwick on - and the archetypal case where sorting one coordinate away is far better.",
        "Example 1:\nInput:\n4\n1 6\n2 4\n4 8\n3 6\nOutput:\n2 0 0 0\n0 1 0 1\nExplanation: [1,6] contains [2,4] and [3,6], so 2. No other range contains another, since [3,6] does not start early enough for [2,4] and [4,8] starts too late for everything. In the other direction, [2,4] and [3,6] are both inside [1,6].",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= a < b <= 10^9\n- coordinates may repeat between ranges",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    vector<int> ys;
    ys.reserve(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i] >> b[i];
        ys.push_back(b[i]);
    }
    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());
    int K = ys.size();
    vector<int> pos(n);
    for (int i = 0; i < n; i++)
        pos[i] = (int)(lower_bound(ys.begin(), ys.end(), b[i]) - ys.begin()) + 1;

    vector<int> bit(K + 1, 0);
    auto add = [&](int i) { for (; i <= K; i += i & -i) bit[i] += 1; };
    auto pref = [&](int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; };

    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    vector<int> holds(n, 0), inside(n, 0);

    // pass 1: how many ranges contain i. Sweep a ascending, b descending.
    sort(idx.begin(), idx.end(), [&](int x, int y) {
        if (a[x] != a[y]) return a[x] < a[y];
        return b[x] > b[y];
    });
    int seen = 0;
    for (int s = 0; s < n; ) {
        int e = s;
        while (e < n && a[idx[e]] == a[idx[s]] && b[idx[e]] == b[idx[s]]) e++;
        for (int k = s; k < e; k++) {
            int i = idx[k];
            // among already-swept ranges (a <= a_i), count those with b >= b_i,
            // then add the identical duplicates of this range, which contain it too
            inside[i] = seen - pref(pos[i] - 1) + (e - s - 1);
        }
        for (int k = s; k < e; k++) { add(pos[idx[k]]); seen++; }
        s = e;
    }

    // pass 2: how many ranges i contains. Sweep a descending, b ascending.
    fill(bit.begin(), bit.end(), 0);
    sort(idx.begin(), idx.end(), [&](int x, int y) {
        if (a[x] != a[y]) return a[x] > a[y];
        return b[x] < b[y];
    });
    for (int s = 0; s < n; ) {
        int e = s;
        while (e < n && a[idx[e]] == a[idx[s]] && b[idx[e]] == b[idx[s]]) e++;
        for (int k = s; k < e; k++) {
            int i = idx[k];
            holds[i] = pref(pos[i]) + (e - s - 1);
        }
        for (int k = s; k < e; k++) add(pos[idx[k]]);
        s = e;
    }

    for (int i = 0; i < n; i++) cout << holds[i] << " \\n"[i == n - 1];
    for (int i = 0; i < n; i++) cout << inside[i] << " \\n"[i == n - 1];
    return 0;
}`,
      explanation: [
        "Containment is a 2D dominance test on the point (a, b). A 2D Fenwick over compressed coordinates would work, but it costs O(n^2) memory in the worst case, which is fatal at n = 2 * 10^5. Sorting kills one dimension instead: process points in order of a, and every range already swept automatically satisfies the a condition, so only the b condition is left and a plain 1D Fenwick over compressed b values answers it.",
        "That is the single most useful lesson about 2D Fenwicks: a genuine two-dimensional tree is only needed when both dimensions must stay live at the same time, which really means when queries are online. Offline, one dimension is almost always sortable away.",
        "The tie-break carries the whole correctness argument. For 'how many contain me', equal a must be swept with larger b first, so a same-start longer range is already in the Fenwick when the shorter one queries. For 'how many do I contain', the sweep runs a descending with b ascending for the mirror reason.",
        "Fully identical ranges are the trap: each contains the other, but a sweep can only see one of them before the other. Processing identical pairs as a block - query all of them, then insert all of them, then credit each with (blockSize - 1) - fixes both directions. Forgetting this passes the sample and fails on duplicate ranges.",
        "Coordinates reach 10^9, so b must be coordinate-compressed before it can index the Fenwick.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Two Dimensional Binary Indexed Tree: Range Update, Range Query",
      difficulty: "Hard",
      variation: "Four Fenwick trees for rectangle add plus rectangle sum",
      question: [
        "Implement a structure over an n x m matrix, initially all zeros and indexed from 1, that supports both rangeAdd(x1, y1, x2, y2, v), adding v to every cell of a rectangle, and rangeSum(x1, y1, x2, y2), returning the sum of a rectangle. Both must run in O(log n * log m), with no lazy segment tree.",
        "Example 1:\nInput: n = 4, m = 4, operations = rangeAdd(2,2,3,3,3), rangeSum(1,1,4,4), rangeSum(1,1,2,2), then rangeAdd(1,1,4,4,1), rangeSum(2,2,3,3)\nOutput: 12, 3, 16\nExplanation: The first update raises four cells by 3, so the whole matrix sums to 12, while the top-left 2 x 2 block contains only one of those cells and sums to 3. The second update adds 1 to all 16 cells, so the central 2 x 2 block now holds 4 * 3 + 4 * 1 = 16.",
        "Example 2:\nInput: n = 2, m = 2, operations = rangeAdd(1,1,1,1,5), rangeSum(1,1,2,2), rangeSum(2,2,2,2)\nOutput: 5, 0",
        "Constraints:\n- 1 <= n, m <= 2000\n- 1 <= x1 <= x2 <= n and 1 <= y1 <= y2 <= m\n- all sums fit in a signed 64-bit integer",
      ],
      code: `struct BIT2DRangeRange {
    int n, m;
    vector<vector<long long>> b1, b2, b3, b4;

    BIT2DRangeRange(int n, int m) : n(n), m(m),
        b1(n + 2, vector<long long>(m + 2, 0)), b2(n + 2, vector<long long>(m + 2, 0)),
        b3(n + 2, vector<long long>(m + 2, 0)), b4(n + 2, vector<long long>(m + 2, 0)) {}

    void bump(vector<vector<long long>>& t, int x, int y, long long v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= m; j += j & -j)
                t[i][j] += v;
    }

    // add v to the whole quadrant i >= x, j >= y, encoded as four coefficients
    void quad(int x, int y, long long v) {
        bump(b1, x, y, v);
        bump(b2, x, y, v * (y - 1));
        bump(b3, x, y, v * (x - 1));
        bump(b4, x, y, v * (long long)(x - 1) * (y - 1));
    }

    void rangeAdd(int x1, int y1, int x2, int y2, long long v) {
        quad(x1, y1, v);
        quad(x1, y2 + 1, -v);
        quad(x2 + 1, y1, -v);
        quad(x2 + 1, y2 + 1, v);
    }

    long long pref(int x, int y) const {
        long long s1 = 0, s2 = 0, s3 = 0, s4 = 0;
        for (int i = x; i > 0; i -= i & -i) {
            for (int j = y; j > 0; j -= j & -j) {
                s1 += b1[i][j];
                s2 += b2[i][j];
                s3 += b3[i][j];
                s4 += b4[i][j];
            }
        }
        // sum over the prefix rectangle (1,1)..(x,y)
        return (long long)x * y * s1 - (long long)x * s2 - (long long)y * s3 + s4;
    }

    long long rangeSum(int x1, int y1, int x2, int y2) const {
        return pref(x2, y2) - pref(x1 - 1, y2) - pref(x2, y1 - 1) + pref(x1 - 1, y1 - 1);
    }
};`,
      explanation: [
        "Build the update out of quadrant adds: adding v to every cell with i >= p and j >= q contributes v * (x - p + 1) * (y - q + 1) to the prefix sum at (x, y), whenever p <= x and q <= y. Expanding that product gives v*x*y - v*x*(q-1) - v*y*(p-1) + v*(p-1)*(q-1), which is a linear combination of x*y, x, y and 1 with coefficients that depend only on the update, not on the query.",
        "So store those four coefficients in four separate Fenwick trees at the point (p, q). A prefix query sums each tree over the same prefix - which automatically restricts to exactly the quadrants with p <= x and q <= y, the ones that contribute - and reassembles the answer as x*y*S1 - x*S2 - y*S3 + S4. This is the direct 2D generalisation of the two-tree trick from the 1D range-update range-query Fenwick.",
        "A rectangle add is four quadrant adds with alternating signs, and a rectangle sum is four prefix queries with alternating signs, so a single range update touches 16 Fenwick paths and a single query walks 4. Both stay O(log n * log m).",
        "The wrong-but-tempting shortcut is to use the difference-array Fenwick from the previous problem and then sum point values over the rectangle. That is correct but O(area * log^2). The other trap is arithmetic: x*y*S1 can reach 2000 * 2000 * (sum of updates), so every product must be computed in 64-bit, with an explicit cast before multiplying int coordinates.",
        "A lazy segment tree solves the same problem, but in 2D it means a segment tree of segment trees with lazy tags - vastly more code and memory for the same complexity.",
        "Time: O(log n * log m) per range update and per range sum. Space: O(n m), four trees.",
      ],
    },
    {
      name: "The Untended Antiquity",
      difficulty: "Hard",
      variation: "Rectangle add of random hashes, point query for connectivity",
      link: "https://codeforces.com/problemset/problem/869/E",
      question: [
        "You have an n x m grid. Process q operations of three kinds. '1 r1 c1 r2 c2' places a barrier along the outside border of the sub-rectangle with corners (r1,c1) and (r2,c2). '2 r1 c1 r2 c2' removes the barrier that was previously placed with exactly those corners. '3 r1 c1 r2 c2' asks whether it is possible to walk between cells (r1,c1) and (r2,c2) through side-adjacent cells without ever crossing a barrier; print 'Yes' or 'No'. It is guaranteed that barriers never touch or cross each other, so at any moment the set of barriers is a laminar family: any two are either disjoint or nested.",
        "Example 1:\nInput:\n5 6 5\n1 2 2 4 5\n1 3 3 3 3\n3 4 4 1 1\n2 2 2 4 5\n3 1 1 4 4\nOutput:\nNo\nYes\nExplanation: The first barrier encloses rows 2..4 and columns 2..5. Cell (4,4) is inside it while (1,1) is outside, so the walk is blocked. After that barrier is removed, cell (4,4) is enclosed by no barrier (the second barrier encloses only cell (3,3)), and neither is (1,1), so they are connected.",
        "Constraints:\n- 1 <= n, m <= 2500\n- 1 <= q <= 10^5\n- 1 <= r1 <= r2 <= n and 1 <= c1 <= c2 <= m\n- a removal always refers to a barrier that is currently present",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, q;
    cin >> n >> m >> q;
    // 2D Fenwick used as a difference array: rectangle add, point query
    vector<vector<unsigned long long>> t(n + 2, vector<unsigned long long>(m + 2, 0ULL));
    auto bump = [&](int x, int y, unsigned long long v) {
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= m; j += j & -j)
                t[i][j] += v;
    };
    auto rectAdd = [&](int r1, int c1, int r2, int c2, unsigned long long v) {
        bump(r1, c1, v);
        bump(r1, c2 + 1, 0ULL - v);
        bump(r2 + 1, c1, 0ULL - v);
        bump(r2 + 1, c2 + 1, v);
    };
    auto at = [&](int x, int y) {
        unsigned long long s = 0;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s += t[i][j];
        return s;
    };
    mt19937_64 rng(998244353ULL);
    map<array<int,4>, unsigned long long> tag;
    while (q--) {
        int type, r1, c1, r2, c2;
        cin >> type >> r1 >> c1 >> r2 >> c2;
        array<int,4> key = {r1, c1, r2, c2};
        if (type == 1) {
            unsigned long long h = rng();             // a fresh random id for this barrier
            tag[key] = h;
            rectAdd(r1, c1, r2, c2, h);               // stamp every enclosed cell
        } else if (type == 2) {
            unsigned long long h = tag[key];
            tag.erase(key);
            rectAdd(r1, c1, r2, c2, 0ULL - h);        // unstamp with the same id
        } else {
            cout << (at(r1, c1) == at(r2, c2) ? "Yes" : "No") << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The key observation is about the geometry, not the data structure: because barriers never cross, two cells are connected exactly when they are enclosed by the same set of barriers. If some barrier encloses one cell but not the other, its closed border separates them; if their enclosing sets match, no border lies between them and a path exists.",
        "So the task reduces to comparing two sets of enclosing barriers, cheaply. Give each barrier a fresh random 64-bit id and add that id to every cell it encloses; a cell then carries the sum of the ids enclosing it. Equal sums mean equal sets with overwhelming probability - a collision needs a random 64-bit subset sum to coincide, so the failure probability over 10^5 queries is about 10^-14. This is exactly the Zobrist-hashing idea applied to set equality.",
        "Adding an id to a whole rectangle and reading a single cell is range-update point-query, so the structure is the 2D difference-array Fenwick, with unsigned 64-bit arithmetic so that wraparound on both the addition and the negation is well defined rather than undefined signed overflow.",
        "The tempting wrong approaches: comparing counts of enclosing barriers instead of hashes (two different barriers give the same count), or trying to maintain connected components with a DSU (barriers are removable, and DSU cannot un-merge).",
        "Store each barrier's id in a map keyed by its four corners so a removal can subtract the same value it added. Memory is the real constraint here: 2501 x 2501 64-bit cells is about 50 MB, which fits but leaves no room for a second grid of the same size.",
        "Time: O(q log n log m + q log q). Space: O(n m).",
      ],
    },
    {
      name: "Iahub and Xors",
      difficulty: "Hard",
      variation: "XOR range update and range query via four parity-classed trees",
      link: "https://codeforces.com/problemset/problem/341/D",
      question: [
        "You are given an n x n matrix, initially all zeros, indexed from 1. Process m operations of two kinds. '1 x1 y1 x2 y2' asks for the XOR of all values inside the rectangle with corners (x1,y1) and (x2,y2), and prints it. '2 x1 y1 x2 y2 v' replaces every value inside that rectangle by its XOR with v.",
        "Example 1:\nInput:\n3 5\n2 1 1 2 2 1\n2 1 3 2 3 2\n2 3 1 3 3 3\n1 2 2 3 3\n1 2 2 3 2\nOutput:\n3\n2\nExplanation: After the three updates the matrix is [[1,1,2],[1,1,2],[3,3,3]]. The rectangle rows 2..3 by columns 2..3 holds 1, 2, 3, 3, whose XOR is 3. The rectangle rows 2..3 by column 2 holds 1 and 3, whose XOR is 2.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= m <= 10^5\n- 1 <= x1 <= x2 <= n and 1 <= y1 <= y2 <= n\n- 1 <= v < 2^62",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    // one Fenwick per parity class of the update point
    vector<vector<unsigned long long>> t[2][2];
    for (int p = 0; p < 2; p++)
        for (int r = 0; r < 2; r++)
            t[p][r].assign(n + 2, vector<unsigned long long>(n + 2, 0ULL));
    auto bump = [&](int x, int y, unsigned long long v) {
        int px = x & 1, py = y & 1;
        for (int i = x; i <= n; i += i & -i)
            for (int j = y; j <= n; j += j & -j)
                t[px][py][i][j] ^= v;
    };
    // XOR of the prefix rectangle (1,1)..(x,y)
    auto pref = [&](int x, int y) {
        unsigned long long s = 0;
        int px = x & 1, py = y & 1;
        for (int i = x; i > 0; i -= i & -i)
            for (int j = y; j > 0; j -= j & -j)
                s ^= t[px][py][i][j];
        return s;
    };
    while (m--) {
        int type, r1, c1, r2, c2;
        cin >> type;
        if (type == 1) {
            cin >> r1 >> c1 >> r2 >> c2;
            unsigned long long ans = pref(r2, c2) ^ pref(r1 - 1, c2) ^ pref(r2, c1 - 1) ^ pref(r1 - 1, c1 - 1);
            cout << ans << "\\n";
        } else {
            unsigned long long v;
            cin >> r1 >> c1 >> r2 >> c2 >> v;
            bump(r1, c1, v);                 // XOR is its own inverse, so all four
            bump(r1, c2 + 1, v);             // difference corners get the same v
            bump(r2 + 1, c1, v);
            bump(r2 + 1, c2 + 1, v);
        }
    }
    return 0;
}`,
      explanation: [
        "XOR is its own inverse, so it is an invertible operation and inclusion-exclusion works with XOR in place of plus and minus: the rectangle XOR is pref(x2,y2) ^ pref(x1-1,y2) ^ pref(x2,y1-1) ^ pref(x1-1,y1-1), and the four difference corners of a range update all carry the same v with no sign flips.",
        "The subtlety is what a prefix XOR of a difference array means. Let d be the difference array, so a[i][j] is the XOR of d[p][q] over p <= i, q <= j. Then the prefix XOR at (x,y) is the XOR of every d[p][q] repeated (x-p+1)*(y-q+1) times - and a repeated XOR only survives when that count is odd, which happens exactly when both factors are odd, that is when p and x share a parity and q and y share a parity.",
        "So d must be split into four independent Fenwick trees indexed by (p mod 2, q mod 2), and a query at (x,y) reads only the tree matching (x mod 2, y mod 2). Using a single tree is the classic wrong answer: it XORs in contributions that cancelled themselves out.",
        "Values reach 2^62, so 64-bit storage is mandatory; unsigned long long avoids any signed-shift worries and prints cleanly. Four trees of 1001^2 64-bit words is about 32 MB, which is why the four-tree split is affordable only because n is capped at 1000.",
        "Out-of-range corners at n+1 are dropped automatically by the update loop, since its condition fails immediately - the same free guard the additive difference Fenwick relies on.",
        "Time: O(log^2 n) per operation. Space: O(n^2), four trees.",
      ],
    },
  ],
};
