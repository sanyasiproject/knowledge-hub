import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Matrix Diagonal Sum",
      difficulty: "Easy",
      variation: "Diagonal indexing",
      link: "https://leetcode.com/problems/matrix-diagonal-sum/",
      question: [
        "Given a square matrix mat, return the sum of the matrix diagonals. Include the primary diagonal and the secondary diagonal, but do not double-count the center element when n is odd.",
        "Example 1:\nInput: mat = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: 25\nExplanation: 1 + 5 + 9 + 3 + 7 = 25. The center 5 is counted once.",
        "Constraints:\n- n == mat.length == mat[i].length\n- 1 <= n <= 100\n- 1 <= mat[i][j] <= 100",
      ],
      code: `int diagonalSum(vector<vector<int>>& mat) {
    int n = mat.size(), sum = 0;
    for (int i = 0; i < n; i++) {
        sum += mat[i][i];
        sum += mat[i][n - 1 - i];
    }
    if (n % 2 == 1) sum -= mat[n / 2][n / 2];
    return sum;
}`,
      explanation: [
        "Row i contributes mat[i][i] from the primary diagonal and mat[i][n-1-i] from the secondary diagonal.",
        "When n is odd both diagonals cross at the center cell (n/2, n/2), so it is added twice and must be subtracted once.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Transpose Matrix",
      difficulty: "Easy",
      variation: "Index swap (r,c) -> (c,r)",
      link: "https://leetcode.com/problems/transpose-matrix/",
      question: [
        "Given a 2D integer array matrix, return the transpose of matrix. The transpose flips the matrix over its main diagonal, switching the row and column indices.",
        "Example 1:\nInput: matrix = [[1,2,3],[4,5,6]]\nOutput: [[1,4],[2,5],[3,6]]",
        "Constraints:\n- 1 <= m, n <= 1000\n- 1 <= m * n <= 100000\n- -10^9 <= matrix[i][j] <= 10^9",
      ],
      code: `vector<vector<int>> transpose(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> out(n, vector<int>(m));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            out[c][r] = matrix[r][c];
    return out;
}`,
      explanation: [
        "An m x n matrix transposes to n x m, so a new array is required in general; only square matrices can be transposed in place by swapping across the diagonal.",
        "Each element (r, c) maps to (c, r) exactly once.",
        "Time: O(mn). Space: O(mn) for the output.",
      ],
    },
    {
      name: "Toeplitz Matrix",
      difficulty: "Easy",
      variation: "Diagonal invariant check",
      link: "https://leetcode.com/problems/toeplitz-matrix/",
      question: [
        "Given an m x n matrix, return true if the matrix is Toeplitz. A matrix is Toeplitz if every diagonal from top-left to bottom-right has the same elements.",
        "Example 1:\nInput: matrix = [[1,2,3,4],[5,1,2,3],[9,5,1,2]]\nOutput: true",
        "Example 2:\nInput: matrix = [[1,2],[2,2]]\nOutput: false\nExplanation: The diagonal 1 -> 2 changes value.",
        "Constraints:\n- 1 <= m, n <= 20\n- 0 <= matrix[i][j] <= 99",
      ],
      code: `bool isToeplitzMatrix(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            if (matrix[r][c] != matrix[r - 1][c - 1])
                return false;
    return true;
}`,
      explanation: [
        "All cells on one top-left diagonal share the same r - c value, so it suffices to check that every cell equals its upper-left neighbor.",
        "If every local pair matches, the equality chains along the whole diagonal by transitivity.",
        "Time: O(mn). Space: O(1).",
      ],
    },
    {
      name: "Reshape the Matrix",
      difficulty: "Easy",
      variation: "Flatten index arithmetic",
      link: "https://leetcode.com/problems/reshape-the-matrix/",
      question: [
        "Given an m x n matrix mat and two integers r and c, reshape the matrix into a new r x c matrix filled with all the elements in the same row-traversal order. If the reshape is impossible, return the original matrix.",
        "Example 1:\nInput: mat = [[1,2],[3,4]], r = 1, c = 4\nOutput: [[1,2,3,4]]",
        "Constraints:\n- 1 <= m, n <= 100\n- 1 <= r, c <= 300\n- -1000 <= mat[i][j] <= 1000",
      ],
      code: `vector<vector<int>> matrixReshape(vector<vector<int>>& mat, int r, int c) {
    int m = mat.size(), n = mat[0].size();
    if ((long long)m * n != (long long)r * c) return mat;
    vector<vector<int>> out(r, vector<int>(c));
    for (int i = 0; i < m * n; i++)
        out[i / c][i % c] = mat[i / n][i % n];
    return out;
}`,
      explanation: [
        "Treat the matrix as a flat array of length m*n: flat index i sits at (i / cols, i % cols) in any matrix with that many columns.",
        "The reshape is valid only when both shapes hold the same number of elements.",
        "Time: O(mn). Space: O(mn) for the output.",
      ],
    },
    {
      name: "Flipping an Image",
      difficulty: "Easy",
      variation: "Row reverse + invert",
      link: "https://leetcode.com/problems/flipping-an-image/",
      question: [
        "Given an n x n binary matrix image, flip the image horizontally (reverse each row), then invert it (replace 0 with 1 and 1 with 0), and return the resulting image.",
        "Example 1:\nInput: image = [[1,1,0],[1,0,1],[0,0,0]]\nOutput: [[1,0,0],[0,1,0],[1,1,1]]",
        "Constraints:\n- n == image.length == image[i].length\n- 1 <= n <= 20\n- image[i][j] is 0 or 1",
      ],
      code: `vector<vector<int>> flipAndInvertImage(vector<vector<int>>& image) {
    int n = image[0].size();
    for (auto& row : image) {
        for (int l = 0, r = n - 1; l <= r; l++, r--) {
            int a = row[l] ^ 1, b = row[r] ^ 1;
            row[l] = b;
            row[r] = a;
        }
    }
    return image;
}`,
      explanation: [
        "Reversing and inverting can be fused: swap the mirrored pair and XOR each value with 1 in one pass, including the middle element when the row length is odd (l == r swaps with itself).",
        "Time: O(n^2). Space: O(1) extra, done in place.",
      ],
    },
    {
      name: "Zigzag Row Traversal",
      difficulty: "Easy",
      variation: "Snake / boustrophedon order",
      question: [
        "Given an m x n matrix, return its elements in zigzag (snake) row order: the first row left to right, the second row right to left, alternating for every row.",
        "Example 1:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,5,4,7,8,9]",
        "Constraints:\n- 1 <= m, n <= 1000\n- -10^9 <= matrix[i][j] <= 10^9",
      ],
      code: `vector<int> zigzagTraversal(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<int> out;
    out.reserve(m * n);
    for (int r = 0; r < m; r++) {
        if (r % 2 == 0)
            for (int c = 0; c < n; c++) out.push_back(matrix[r][c]);
        else
            for (int c = n - 1; c >= 0; c--) out.push_back(matrix[r][c]);
    }
    return out;
}`,
      explanation: [
        "Even-indexed rows are read left to right and odd-indexed rows right to left; the row parity alone decides the direction, so no state needs to be carried between rows.",
        "This is the classic drill behind problems like Rotating the Box and level-order zigzag variants.",
        "Time: O(mn). Space: O(1) extra beyond the output.",
      ],
    },
    {
      name: "Search a 2D Matrix",
      difficulty: "Medium",
      variation: "Binary search on flattened index",
      link: "https://leetcode.com/problems/search-a-2d-matrix/",
      question: [
        "You are given an m x n matrix where each row is sorted in non-decreasing order and the first integer of each row is greater than the last integer of the previous row. Given target, return true if target is in the matrix. You must write a solution in O(log(m*n)) time.",
        "Example 1:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: true",
        "Constraints:\n- 1 <= m, n <= 100\n- -10^4 <= matrix[i][j], target <= 10^4",
      ],
      code: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int val = matrix[mid / n][mid % n];
        if (val == target) return true;
        if (val < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
      explanation: [
        "The row-boundary property makes the whole matrix one sorted list of m*n values, so a single binary search works.",
        "Flat index i converts to row i / n and column i % n without materializing the flattened array.",
        "Time: O(log(mn)). Space: O(1).",
      ],
    },
    {
      name: "Spiral Matrix",
      difficulty: "Medium",
      variation: "Shrinking boundaries",
      link: "https://leetcode.com/problems/spiral-matrix/",
      question: [
        "Given an m x n matrix, return all elements of the matrix in spiral order.",
        "Example 1:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]",
        "Constraints:\n- 1 <= m, n <= 10\n- -100 <= matrix[i][j] <= 100",
      ],
      code: `vector<int> spiralOrder(vector<vector<int>>& matrix) {
    int top = 0, bottom = matrix.size() - 1;
    int left = 0, right = matrix[0].size() - 1;
    vector<int> out;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.push_back(matrix[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.push_back(matrix[r][right]);
        right--;
        if (top <= bottom)
            for (int c = right; c >= left; c--) out.push_back(matrix[bottom][c]);
        bottom--;
        if (left <= right)
            for (int r = bottom; r >= top; r--) out.push_back(matrix[r][left]);
        left++;
    }
    return out;
}`,
      explanation: [
        "Four boundary indices shrink inward after each side is consumed; the two guards prevent double-visiting when a single row or column remains.",
        "Time: O(mn). Space: O(1) extra.",
      ],
    },
    {
      name: "Spiral Matrix II",
      difficulty: "Medium",
      variation: "Spiral fill (generation)",
      link: "https://leetcode.com/problems/spiral-matrix-ii/",
      question: [
        "Given a positive integer n, generate an n x n matrix filled with elements from 1 to n^2 in spiral order.",
        "Example 1:\nInput: n = 3\nOutput: [[1,2,3],[8,9,4],[7,6,5]]",
        "Constraints:\n- 1 <= n <= 20",
      ],
      code: `vector<vector<int>> generateMatrix(int n) {
    vector<vector<int>> mat(n, vector<int>(n));
    int top = 0, bottom = n - 1, left = 0, right = n - 1;
    int val = 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) mat[top][c] = val++;
        top++;
        for (int r = top; r <= bottom; r++) mat[r][right] = val++;
        right--;
        for (int c = right; c >= left; c--) mat[bottom][c] = val++;
        bottom--;
        for (int r = bottom; r >= top; r--) mat[r][left] = val++;
        left++;
    }
    return mat;
}`,
      explanation: [
        "Same shrinking-boundary walk as Spiral Matrix, but writing an incrementing counter instead of reading.",
        "Because the matrix is square, exactly n^2 cells are written and the loop ends precisely when val exceeds n^2, so the extra single-row guards are unnecessary here.",
        "Time: O(n^2). Space: O(1) extra beyond the output.",
      ],
    },
    {
      name: "Rotate Image",
      difficulty: "Medium",
      variation: "Transpose + reverse rows",
      link: "https://leetcode.com/problems/rotate-image/",
      question: [
        "You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees clockwise, in place. You must not allocate another 2D matrix.",
        "Example 1:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]",
        "Constraints:\n- n == matrix.length == matrix[i].length\n- 1 <= n <= 20\n- -1000 <= matrix[i][j] <= 1000",
      ],
      code: `void rotate(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int r = 0; r < n; r++)
        for (int c = r + 1; c < n; c++)
            swap(matrix[r][c], matrix[c][r]);
    for (int r = 0; r < n; r++)
        reverse(matrix[r].begin(), matrix[r].end());
}`,
      explanation: [
        "A clockwise 90-degree rotation maps (r, c) to (c, n-1-r), which decomposes into transpose followed by reversing each row; both steps are in place.",
        "For counterclockwise rotation, transpose then reverse each column instead.",
        "Time: O(n^2). Space: O(1).",
      ],
    },
    {
      name: "Diagonal Traverse",
      difficulty: "Medium",
      variation: "Anti-diagonals with direction flip",
      link: "https://leetcode.com/problems/diagonal-traverse/",
      question: [
        "Given an m x n matrix, return all elements of the matrix in diagonal order: start at (0,0), move up-right, and alternate direction on each anti-diagonal.",
        "Example 1:\nInput: mat = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,4,7,5,3,6,8,9]",
        "Constraints:\n- 1 <= m, n <= 10^4\n- 1 <= m * n <= 10^4\n- -10^5 <= mat[i][j] <= 10^5",
      ],
      code: `vector<int> findDiagonalOrder(vector<vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector<int> out;
    out.reserve(m * n);
    for (int d = 0; d <= m + n - 2; d++) {
        if (d % 2 == 0) {
            int r = min(d, m - 1), c = d - r;
            while (r >= 0 && c < n) out.push_back(mat[r--][c++]);
        } else {
            int c = min(d, n - 1), r = d - c;
            while (c >= 0 && r < m) out.push_back(mat[r++][c--]);
        }
    }
    return out;
}`,
      explanation: [
        "Cells on the same anti-diagonal share r + c = d. There are m + n - 1 diagonals; even d is walked upward (row decreasing) and odd d downward.",
        "Each diagonal's start point is clamped to the matrix edge: for the upward pass start at the largest legal row, for the downward pass at the largest legal column.",
        "Time: O(mn). Space: O(1) extra beyond the output.",
      ],
    },
    {
      name: "Set Matrix Zeroes",
      difficulty: "Medium",
      variation: "First row/col as marker (O(1) space)",
      link: "https://leetcode.com/problems/set-matrix-zeroes/",
      question: [
        "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. You must do it in place; a constant-space solution is the goal.",
        "Example 1:\nInput: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]",
        "Constraints:\n- 1 <= m, n <= 200\n- -2^31 <= matrix[i][j] <= 2^31 - 1",
      ],
      code: `void setZeroes(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    bool firstRowZero = false, firstColZero = false;
    for (int c = 0; c < n; c++) if (matrix[0][c] == 0) firstRowZero = true;
    for (int r = 0; r < m; r++) if (matrix[r][0] == 0) firstColZero = true;
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            if (matrix[r][c] == 0) {
                matrix[r][0] = 0;
                matrix[0][c] = 0;
            }
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0)
                matrix[r][c] = 0;
    if (firstRowZero) for (int c = 0; c < n; c++) matrix[0][c] = 0;
    if (firstColZero) for (int r = 0; r < m; r++) matrix[r][0] = 0;
}`,
      explanation: [
        "The first row and first column double as marker arrays: a zero anywhere in row r or column c is recorded at matrix[r][0] and matrix[0][c].",
        "Two boolean flags remember whether the first row and column themselves originally contained a zero, since they get overwritten by markers; they are cleared last.",
        "Time: O(mn). Space: O(1).",
      ],
    },
    {
      name: "Valid Sudoku",
      difficulty: "Medium",
      variation: "Row/col/box occupancy sets",
      link: "https://leetcode.com/problems/valid-sudoku/",
      question: [
        "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated: each row, each column, and each of the nine 3 x 3 sub-boxes must contain the digits 1-9 without repetition. Empty cells are '.'.",
        "Example 1:\nInput: board with '5','3' in row 0 and no duplicates anywhere\nOutput: true",
        "Constraints:\n- board.length == 9, board[i].length == 9\n- board[i][j] is a digit 1-9 or '.'",
      ],
      code: `bool isValidSudoku(vector<vector<char>>& board) {
    bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int d = board[r][c] - '1';
            int b = (r / 3) * 3 + c / 3;
            if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
            rows[r][d] = cols[c][d] = boxes[b][d] = true;
        }
    }
    return true;
}`,
      explanation: [
        "One pass over the board marks each digit in three occupancy tables; a repeat mark in any table is a violation.",
        "The box index (r/3)*3 + c/3 maps every cell to one of the nine 3 x 3 sub-boxes.",
        "Time: O(81) = O(1) for the fixed board. Space: O(1).",
      ],
    },
    {
      name: "Game of Life",
      difficulty: "Medium",
      variation: "In-place with 2-bit state encoding",
      link: "https://leetcode.com/problems/game-of-life/",
      question: [
        "Given an m x n board of cells (1 = live, 0 = dead), compute the next generation of Conway's Game of Life in place. A live cell with fewer than 2 or more than 3 live neighbors dies; a live cell with 2 or 3 lives on; a dead cell with exactly 3 live neighbors becomes live. All updates happen simultaneously.",
        "Example 1:\nInput: board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]\nOutput: [[0,0,0],[1,0,1],[0,1,1],[0,1,0]]",
        "Constraints:\n- 1 <= m, n <= 25\n- board[i][j] is 0 or 1",
      ],
      code: `void gameOfLife(vector<vector<int>>& board) {
    int m = board.size(), n = board[0].size();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++)
                for (int dc = -1; dc <= 1; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    int nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n)
                        live += board[nr][nc] & 1;
                }
            int cur = board[r][c] & 1;
            int next = (cur == 1) ? (live == 2 || live == 3) : (live == 3);
            board[r][c] = cur | (next << 1);
        }
    }
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            board[r][c] >>= 1;
}`,
      explanation: [
        "Store the current state in bit 0 and the next state in bit 1 of each cell, so neighbor counts always read the original generation via the low bit.",
        "A second pass shifts every cell right by one, promoting the next state.",
        "Time: O(mn). Space: O(1).",
      ],
    },
    {
      name: "Search a 2D Matrix II",
      difficulty: "Medium",
      variation: "Staircase search from a corner",
      link: "https://leetcode.com/problems/search-a-2d-matrix-ii/",
      question: [
        "Write an efficient algorithm that searches for a target in an m x n matrix where each row is sorted left to right and each column is sorted top to bottom (rows are not globally sorted relative to each other).",
        "Example 1:\nInput: matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16]], target = 5\nOutput: true",
        "Constraints:\n- 1 <= m, n <= 300\n- -10^9 <= matrix[i][j], target <= 10^9",
      ],
      code: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int r = 0, c = n - 1;
    while (r < m && c >= 0) {
        int val = matrix[r][c];
        if (val == target) return true;
        if (val > target) c--;
        else r++;
    }
    return false;
}`,
      explanation: [
        "Start at the top-right corner: the current value is the largest in its row prefix and the smallest in its column suffix, so one comparison always eliminates a full row or a full column.",
        "The walk takes at most m + n steps, which beats binary searching every row (O(m log n)) for wide matrices.",
        "Time: O(m + n). Space: O(1).",
      ],
    },
    {
      name: "Rotating the Box",
      difficulty: "Medium",
      variation: "Gravity simulation + rotate",
      link: "https://leetcode.com/problems/rotating-the-box/",
      question: [
        "You are given an m x n grid box where each cell is a stone '#', a fixed obstacle '*', or empty '.'. The box is rotated 90 degrees clockwise, after which gravity pulls every stone down until it rests on an obstacle, another stone, or the bottom. Return the resulting n x m grid.",
        "Example 1:\nInput: box = [[\"#\",\".\",\"#\"]]\nOutput: [[\".\"],[\"#\"],[\"#\"]]",
        "Constraints:\n- 1 <= m, n <= 500\n- box[i][j] is '#', '*', or '.'",
      ],
      code: `vector<vector<char>> rotateTheBox(vector<vector<char>>& box) {
    int m = box.size(), n = box[0].size();
    for (int r = 0; r < m; r++) {
        int write = n - 1;
        for (int c = n - 1; c >= 0; c--) {
            if (box[r][c] == '*') {
                write = c - 1;
            } else if (box[r][c] == '#') {
                box[r][c] = '.';
                box[r][write--] = '#';
            }
        }
    }
    vector<vector<char>> out(n, vector<char>(m));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            out[c][m - 1 - r] = box[r][c];
    return out;
}`,
      explanation: [
        "Apply gravity before rotating: falling down after a clockwise rotation is the same as sliding right within each original row, done with a two-pointer sweep from the right where obstacles reset the write position.",
        "Then rotate clockwise with the mapping (r, c) -> (c, m-1-r).",
        "Time: O(mn). Space: O(mn) for the rotated output.",
      ],
    },
    {
      name: "Longest Increasing Path in a Matrix",
      difficulty: "Hard",
      variation: "DFS + memoization over cells",
      link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
      question: [
        "Given an m x n integers matrix, return the length of the longest strictly increasing path. From each cell you can move in the four cardinal directions; you may not wrap around.",
        "Example 1:\nInput: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest increasing path is 1 -> 2 -> 6 -> 9.",
        "Constraints:\n- 1 <= m, n <= 200\n- 0 <= matrix[i][j] <= 2^31 - 1",
      ],
      code: `class Solution {
    int m, n;
    vector<vector<int>> memo;
    int dfs(vector<vector<int>>& mat, int r, int c) {
        if (memo[r][c] != 0) return memo[r][c];
        static const int dr[4] = {1, -1, 0, 0};
        static const int dc[4] = {0, 0, 1, -1};
        int best = 1;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && mat[nr][nc] > mat[r][c])
                best = max(best, 1 + dfs(mat, nr, nc));
        }
        return memo[r][c] = best;
    }
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        m = matrix.size();
        n = matrix[0].size();
        memo.assign(m, vector<int>(n, 0));
        int ans = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                ans = max(ans, dfs(matrix, r, c));
        return ans;
    }
};`,
      explanation: [
        "The strictly-increasing constraint makes the move graph a DAG, so DFS with memoization computes the longest path from each cell exactly once and cycles are impossible.",
        "memo[r][c] caches the best path length starting at (r, c); every cell and edge is processed a constant number of times.",
        "Time: O(mn). Space: O(mn) for the memo table and recursion stack.",
      ],
    },
  ],
};
