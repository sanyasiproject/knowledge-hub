import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Palindromic Subsequence",
      difficulty: "Medium",
      variation: "Interval DP template, shrink from both ends",
      link: "https://leetcode.com/problems/longest-palindromic-subsequence/",
      question: [
        "Given a string s, return the length of the longest palindromic subsequence in s. A subsequence is obtained by deleting zero or more characters without reordering the ones that remain.",
        "Example 1:\nInput: s = 'bbbab'\nOutput: 4\nExplanation: One longest palindromic subsequence is 'bbbb'.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 2\nExplanation: 'bb' is the longest palindromic subsequence.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of lowercase English letters only",
      ],
      code: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;            // every single char is a palindrome
    for (int len = 2; len <= n; len++)                   // grow intervals from short to long
        for (int l = 0, r = len - 1; r < n; l++, r++)
            dp[l][r] = (s[l] == s[r]) ? dp[l + 1][r - 1] + 2
                                      : max(dp[l + 1][r], dp[l][r - 1]);
    return dp[0][n - 1];
}`,
      explanation: [
        "State: dp[l][r] is the answer for the substring s[l..r] only. That is the defining shape of L-R DP - the subproblem is an interval, not a prefix, so the table is two-dimensional and every cell depends on strictly shorter intervals.",
        "Transition: look only at the two ends. If s[l] == s[r] those two characters can be the outermost pair of an optimal palindrome, so dp[l][r] = dp[l+1][r-1] + 2. This is safe because taking a matching outer pair never blocks anything - any palindrome inside s[l+1..r-1] can still be wrapped by it. If the ends differ, at least one of them cannot be used, so drop one end and take the better of dp[l+1][r] and dp[l][r-1].",
        "The iteration order is the part people get wrong. Because dp[l][r] reads dp[l+1][...] (a larger row) and dp[...][r-1] (a smaller column), you cannot loop l and r naively upward. Looping by interval length, or looping l downward and r upward, guarantees every dependency is already filled. Every problem in this bank uses one of those two orders.",
        "When len == 2 and the ends match, dp[l+1][r-1] refers to the empty interval l+1 > r-1, which must be 0 - and it is, because the table was zero-initialised. Getting that degenerate cell wrong is the classic off-by-one here.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n) with two rolling rows.",
      ],
    },
    {
      name: "Longest Palindromic Substring",
      difficulty: "Medium",
      variation: "Boolean interval table",
      link: "https://leetcode.com/problems/longest-palindromic-substring/",
      question: [
        "Given a string s, return the longest contiguous substring of s that is a palindrome. If several have the same maximum length, returning any one of them is accepted.",
        "Example 1:\nInput: s = 'babad'\nOutput: 'bab'\nExplanation: 'aba' is also a valid answer of the same length.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 'bb'\nExplanation: 'bb' is the only palindromic substring of length greater than 1.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of digits and English letters",
      ],
      code: `string longestPalindrome(string s) {
    int n = s.size();
    vector<vector<char>> dp(n, vector<char>(n, 0));   // char, not bool: faster than vector<bool>
    int bestL = 0, bestLen = 1;
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int l = 0, r = len - 1; r < n; l++, r++) {
            if (s[l] != s[r]) continue;
            if (len == 2 || dp[l + 1][r - 1]) {        // ends match and the inside is a palindrome
                dp[l][r] = 1;
                if (len > bestLen) { bestLen = len; bestL = l; }
            }
        }
    }
    return s.substr(bestL, bestLen);
}`,
      explanation: [
        "Here the interval DP carries a predicate rather than a value: dp[l][r] is true exactly when s[l..r] is a palindrome. The recurrence is the definition itself - s[l..r] is a palindrome iff its ends match and the interval one step inside is a palindrome.",
        "Because the state is a plain boolean over intervals, filling the table in increasing length gives you every palindromic substring at once. Tracking the best (start, length) while filling avoids a second pass.",
        "The len == 2 short circuit exists because dp[l+1][r-1] is the empty interval there, which is vacuously a palindrome. Leaving it out and relying on the zero-initialised table would wrongly reject every two-character palindrome, so 'bb' above would return 'b'.",
        "The tempting wrong move is to reuse the Longest Palindromic Subsequence recurrence with max(). Substrings are not subsequences: for a substring you may not skip a character, so there is no 'drop one end' branch - if the ends differ the interval is simply not a palindrome.",
        "Expand-around-centre solves this in O(n^2) time with O(1) space and Manacher's does it in O(n), but the boolean interval table is the one that generalises - the next problem in this bank reuses it verbatim.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Insertion Steps to Make a String Palindrome",
      difficulty: "Medium",
      variation: "Cost-minimising interval DP",
      link: "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
      question: [
        "Given a string s, in one step you may insert any single character at any position of s. Return the minimum number of steps needed to make s a palindrome.",
        "Example 1:\nInput: s = 'zzazz'\nOutput: 0\nExplanation: s is already a palindrome.",
        "Example 2:\nInput: s = 'mbadm'\nOutput: 2\nExplanation: 'mbdadbm' is one palindrome reachable in two insertions.",
        "Example 3:\nInput: s = 'leetcode'\nOutput: 5\nExplanation: One result is 'leetcodocteel'.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters only",
      ],
      code: `int minInsertions(string s) {
    int n = s.size();
    // dp[l][r] = insertions needed to make s[l..r] a palindrome; empty and single are already 0
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int l = 0, r = len - 1; r < n; l++, r++)
            dp[l][r] = (s[l] == s[r]) ? dp[l + 1][r - 1]                    // ends already pair up
                                      : 1 + min(dp[l + 1][r], dp[l][r - 1]); // mirror one end
    return dp[0][n - 1];
}`,
      explanation: [
        "State: dp[l][r] is the cost to fix the interval s[l..r] in isolation. The two-end case analysis is the same as Longest Palindromic Subsequence, only the objective flipped from maximise-kept to minimise-inserted.",
        "If the ends match they need no work and the problem reduces to the inside. If they differ, whichever end you decide to leave unmatched must be mirrored by inserting a copy of it on the opposite side, which costs 1 and consumes that end - hence 1 + min(dp[l+1][r], dp[l][r-1]). Insertions never interfere across nested intervals, which is exactly why the interval decomposition is valid.",
        "Equivalent shortcut worth knowing: the answer is n minus the length of the longest palindromic subsequence, because the characters you keep form a palindromic subsequence and every other character needs one mirroring insertion. Both formulations are O(n^2); the direct one generalises better when insertions have per-character costs.",
        "The wrong-but-tempting approach is n minus the longest palindromic *substring*. That fails on 'mbadm': the longest palindromic substring has length 1, giving 4, while the true answer is 2 because 'mam' is a usable palindromic subsequence.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Matrix Chain Multiplication",
      difficulty: "Medium",
      variation: "Split point inside the interval",
      question: [
        "You are given an array arr of length n describing a chain of n-1 matrices, where the i-th matrix has dimensions arr[i-1] x arr[i]. Multiplying a p x q matrix by a q x r matrix costs p*q*r scalar multiplications. Matrix multiplication is associative, so the chain can be parenthesised in many ways. Return the minimum total number of scalar multiplications needed to compute the whole product.",
        "Example 1:\nInput: arr = [40, 20, 30, 10, 30]\nOutput: 26000\nExplanation: The matrices are 40x20, 20x30, 30x10, 10x30. Parenthesising as (A(BC))D costs 20*30*10 + 40*20*10 + 40*10*30 = 6000 + 8000 + 12000 = 26000.",
        "Example 2:\nInput: arr = [1, 2, 3, 4, 3]\nOutput: 30\nExplanation: ((AB)C)D costs 1*2*3 + 1*3*4 + 1*4*3 = 6 + 12 + 12 = 30.",
        "Constraints:\n- 2 <= n <= 100\n- 1 <= arr[i] <= 200",
      ],
      code: `int matrixMultiplication(vector<int>& arr) {
    int n = arr.size();
    // dp[i][j] = min cost to multiply matrices i..j, matrix k being arr[k-1] x arr[k]
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len <= n - 1; len++) {          // len = number of matrices in the chain
        for (int i = 1; i + len - 1 <= n - 1; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++)               // last multiplication joins i..k with k+1..j
                dp[i][j] = min(dp[i][j],
                               dp[i][k] + dp[k + 1][j] + arr[i - 1] * arr[k] * arr[j]);
        }
    }
    return dp[1][n - 1];
}`,
      explanation: [
        "This is the archetype of the second L-R shape: instead of peeling the ends, you choose a split point k strictly inside the interval. Whatever the optimal parenthesisation is, there is exactly one multiplication performed last, and it joins the block i..k with the block k+1..j for some k. Trying every k and taking the minimum is therefore exhaustive, not heuristic.",
        "State: dp[i][j] is the cost of collapsing matrices i..j into a single matrix. That collapsed matrix always has dimensions arr[i-1] x arr[j] regardless of the order chosen, which is the property that makes the subproblem self-contained - the cost of the final join depends only on i, k and j, never on how the halves were internally bracketed.",
        "The dimension bookkeeping is the whole difficulty. Indexing matrices 1..n-1 and reading dimensions as arr[i-1] x arr[i] keeps the join cost as the clean arr[i-1] * arr[k] * arr[j]. Off-by-one here silently produces a plausible-looking wrong number.",
        "The natural greedy - always multiply the cheapest adjacent pair first - is wrong. On [40, 20, 30, 10, 30] the cheapest single product is BC at 6000, which happens to be part of the optimum here, but on other inputs an early cheap join leaves behind an expensive shape. Only the full split search is safe.",
        "Time: O(n^3) - O(n^2) intervals times O(n) split points. Space: O(n^2). Because the cost function satisfies the quadrangle inequality, Knuth optimisation cuts this to O(n^2).",
      ],
    },
    {
      name: "Minimum Score Triangulation of Polygon",
      difficulty: "Medium",
      variation: "Split point on a fixed chord",
      link: "https://leetcode.com/problems/minimum-score-triangulation-of-polygon/",
      question: [
        "You are given a convex polygon with n vertices labelled 0..n-1 in clockwise order, where vertex i has integer value values[i]. Triangulate the polygon into n-2 triangles using non-crossing diagonals. The score of a triangle is the product of the values of its three vertices, and the score of a triangulation is the sum of its triangle scores. Return the minimum possible total score.",
        "Example 1:\nInput: values = [1, 2, 3]\nOutput: 6\nExplanation: The polygon is already a triangle, so the only score is 1*2*3 = 6.",
        "Example 2:\nInput: values = [3, 7, 4, 5]\nOutput: 144\nExplanation: Cutting along the diagonal 0-2 gives 3*7*4 + 3*4*5 = 84 + 60 = 144, which beats cutting along 1-3 (7*4*5 + 3*7*5 = 140 + 105 = 245).",
        "Example 3:\nInput: values = [1, 3, 1, 4, 1, 5]\nOutput: 13",
        "Constraints:\n- 3 <= n <= 50\n- 1 <= values[i] <= 100",
      ],
      code: `int minScoreTriangulation(vector<int>& values) {
    int n = values.size();
    // dp[i][j] = min score to triangulate the sub-polygon on vertices i..j plus the chord i-j
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 3; len <= n; len++) {              // fewer than 3 vertices: nothing to cut
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i + 1; k < j; k++)            // k is the apex of the triangle on chord i-j
                dp[i][j] = min(dp[i][j],
                               dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]);
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "Treat the chord from i to j as the fixed base. In any triangulation of that sub-polygon the base belongs to exactly one triangle, whose third vertex k lies strictly between i and j. Choosing k splits the region into the sub-polygon i..k, the sub-polygon k..j, and the triangle (i, k, j) - three regions that share only boundaries, so their costs add.",
        "Notice the halves are dp[i][k] and dp[k][j], not dp[k+1][j]. The apex vertex k is shared by both sides because vertices, not items, are being split - a chord is defined by its two endpoints. Writing k+1 here is the single most common bug in polygon and stick-cutting interval DP.",
        "Intervals of length 1 and 2 cost 0: a single vertex or a single edge encloses no area and needs no triangle. Those are the base cases the zero-initialisation supplies.",
        "A greedy 'always cut off the triangle with the smallest product' fails because removing a cheap ear can force an expensive vertex to participate in many later triangles. The values [3, 7, 4, 5] case is a good sanity check that the two candidate diagonals differ a lot.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Cost to Cut a Stick",
      difficulty: "Hard",
      variation: "Cost depends on the interval, not the split",
      link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
      question: [
        "A wooden stick of length n is labelled from 0 to n. You are given an array cuts of positions where cuts must be made, and you may perform them in any order. The cost of one cut is the current length of the stick being cut, and after a cut the stick splits into two independent sticks. Return the minimum total cost of performing all the cuts.",
        "Example 1:\nInput: n = 7, cuts = [1, 3, 4, 5]\nOutput: 16\nExplanation: Cutting in the order 3, 5, 1, 4 costs 7 + 4 + 3 + 2 = 16, which is optimal. The naive left-to-right order 1, 3, 4, 5 costs 7 + 6 + 4 + 3 = 20.",
        "Example 2:\nInput: n = 9, cuts = [5, 6, 1, 4, 2]\nOutput: 22",
        "Constraints:\n- 2 <= n <= 10^6\n- 1 <= cuts.length <= min(n - 1, 100)\n- 1 <= cuts[i] <= n - 1, all cuts distinct",
      ],
      code: `int minCost(int n, vector<int>& cuts) {
    cuts.push_back(0);
    cuts.push_back(n);                 // treat the two stick ends as sentinel cut positions
    sort(cuts.begin(), cuts.end());
    int m = cuts.size();
    // dp[i][j] = min cost to make every required cut strictly inside the piece cuts[i]..cuts[j]
    vector<vector<int>> dp(m, vector<int>(m, 0));
    for (int len = 3; len <= m; len++) {
        for (int i = 0; i + len - 1 < m; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i + 1; k < j; k++)   // k is the cut performed FIRST on this piece
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + cuts[j] - cuts[i]);
        }
    }
    return dp[0][m - 1];
}`,
      explanation: [
        "The order of cuts is a permutation, so brute force is factorial. The DP works because a cut only ever affects the piece it lands in: once position k is cut, the two sides never interact again. So the state can be a piece, identified by the pair of cut positions bounding it.",
        "Sorting and appending the sentinels 0 and n is what turns positions into a clean interval index space. dp[i][j] then means 'all required cuts strictly between index i and index j are done', and the endpoints of the piece are always themselves cut positions or stick ends.",
        "Transition: guess which cut k is made *first* in this piece. Its cost is the piece's current full length cuts[j] - cuts[i], because nothing inside has been cut yet. After it, the two sub-pieces are independent, giving dp[i][k] + dp[k][j]. As in polygon triangulation, k is shared by both halves, so it is dp[k][j] and not dp[k+1][j].",
        "The interesting structural point: the added cost depends only on the interval, never on k. That means the total cost is a sum of piece lengths and the DP is really choosing a binary tree shape - the same structure as optimal binary search trees and Huffman-like merges.",
        "Note n can be 10^6 but cuts.length is at most 100, so the table is indexed by cuts, not by stick positions. Sizing the DP by n would be hopeless and is the trap the constraints are hinting at.",
        "Time: O(m^3) where m = cuts.length + 2. Space: O(m^2).",
      ],
    },
    {
      name: "Guess Number Higher or Lower II",
      difficulty: "Medium",
      variation: "Minimax over intervals",
      link: "https://leetcode.com/problems/guess-number-higher-or-lower-ii/",
      question: [
        "I pick a number between 1 and n. You guess numbers; after each wrong guess x you pay x dollars and are told whether my number is higher or lower. Return the minimum amount of money you need to guarantee a win, that is the least amount that suffices no matter which number I picked.",
        "Example 1:\nInput: n = 10\nOutput: 16\nExplanation: Guess 7 first. The expensive branch is 'higher', leaving the range 8..10, which costs 9 more (guess 9, then the survivor is forced). That worst-case path pays 7 + 9 = 16, and the 'lower' branch on 1..6 costs less.",
        "Example 2:\nInput: n = 1\nOutput: 0\nExplanation: There is only one candidate, so your first guess is certainly right and you pay nothing.",
        "Example 3:\nInput: n = 2\nOutput: 1\nExplanation: Guess 1. If it is wrong you pay 1 and now know the answer is 2.",
        "Constraints:\n- 1 <= n <= 200",
      ],
      code: `int getMoneyAmount(int n) {
    // dp[l][r] = worst-case cost to pin down a number known to be in [l, r]
    // sized n+2 so the empty ranges dp[l][l-1] and dp[r+1][r] are legal reads of 0
    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
    for (int len = 2; len <= n; len++) {
        for (int l = 1; l + len - 1 <= n; l++) {
            int r = l + len - 1;
            dp[l][r] = INT_MAX;
            for (int k = l; k <= r; k++)      // guess k; adversary picks the worse surviving side
                dp[l][r] = min(dp[l][r], k + max(dp[l][k - 1], dp[k + 1][r]));
        }
    }
    return dp[1][n];
}`,
      explanation: [
        "State: dp[l][r] is the money you must have in hand to guarantee identifying a number known to lie in [l, r]. Ranges of size 0 or 1 cost 0 - with one candidate left you simply guess it and it is right, so you are never charged.",
        "The min-max structure encodes the two players. You control the guess, so you minimise over k. The feedback is adversarial, so once you guess k you must survive the more expensive of the two surviving ranges - hence max(dp[l][k-1], dp[k+1][r]), plus the k you pay for guessing wrong. Using an average or a sum instead answers a different question (expected cost) and gives the wrong number.",
        "Guessing k is charged unconditionally even though k might be correct. That is fine: if k is correct the true cost is lower, so the value is still a valid guarantee, and for the range that actually determines the worst case k really was wrong. Trying to be clever and not charging k breaks the guarantee.",
        "The tempting wrong answer is plain binary search - always guess the midpoint. That minimises the number of guesses, not the money, and large midpoints are expensive. For n = 10 the optimum starts at 7, deliberately off-centre so that the costly upper region is resolved in fewer paid guesses.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Strange Printer",
      difficulty: "Hard",
      variation: "Matching-character split",
      link: "https://leetcode.com/problems/strange-printer/",
      question: [
        "There is a strange printer that can only print a sequence of the same character each time, and at each turn it may print the new sequence over any existing characters, fully covering them. Given a target string s, return the minimum number of turns the printer needs to print it.",
        "Example 1:\nInput: s = 'aaabbb'\nOutput: 2\nExplanation: Print 'aaa' then print 'bbb'.",
        "Example 2:\nInput: s = 'aba'\nOutput: 2\nExplanation: Print 'aaa', then overprint the middle position with 'b'.",
        "Example 3:\nInput: s = 'tbfbt'\nOutput: 3\nExplanation: Print 'ttttt', then 'bbb' over positions 1..3, then 'f' over position 2.",
        "Constraints:\n- 1 <= s.length <= 100\n- s consists of lowercase English letters only",
      ],
      code: `int strangePrinter(string s) {
    string t;
    for (char c : s) if (t.empty() || t.back() != c) t.push_back(c);  // runs cost the same as one char
    int n = t.size();
    if (n == 0) return 0;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int l = 0, r = len - 1; r < n; l++, r++) {
            dp[l][r] = dp[l][r - 1] + 1;                  // print t[r] in a turn of its own
            for (int k = l; k < r; k++)
                if (t[k] == t[r])                         // t[r] rides along with the turn for t[k]
                    dp[l][r] = min(dp[l][r],
                                   dp[l][k] + (k + 1 <= r - 1 ? dp[k + 1][r - 1] : 0));
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "State: dp[l][r] is the minimum turns to produce t[l..r] on a blank strip. Collapsing runs first is not just an optimisation - it removes a whole class of duplicate states, since 'aaa' and 'a' are indistinguishable to this printer.",
        "The transition asks what happens to the last character t[r]. Either it needs a turn of its own, giving dp[l][r-1] + 1, or it was painted by the same turn that painted some earlier equal character t[k]. In the second case that turn covers the span k..r with t[k], and everything strictly between - the interval k+1..r-1 - must then be overprinted afterwards, independently of the prefix l..k. That gives dp[l][k] + dp[k+1][r-1].",
        "Why the two pieces are independent: the long stroke of t[k] separates them, so no later stroke ever needs to cross from the prefix into the middle. This 'one stroke absorbs a matching character, splitting the rest in two' idea is the reusable trick, and it reappears in Remove Boxes with an extra counter.",
        "The wrong intuition is to count distinct characters, or to count run boundaries. 'tbfbt' has five runs and three distinct letters but the answer is 3, achieved only by nesting strokes - the outer 't' stroke covers both ends at once.",
        "Time: O(n^3) on the collapsed string. Space: O(n^2).",
      ],
    },
    {
      name: "Palindrome Partitioning II",
      difficulty: "Hard",
      variation: "Interval table feeding a linear DP",
      link: "https://leetcode.com/problems/palindrome-partitioning-ii/",
      question: [
        "Given a string s, partition it so that every part is a palindrome. Return the minimum number of cuts needed. A partition into k parts uses k-1 cuts.",
        "Example 1:\nInput: s = 'aab'\nOutput: 1\nExplanation: One cut gives ['aa', 'b'], and both parts are palindromes.",
        "Example 2:\nInput: s = 'a'\nOutput: 0\nExplanation: The whole string is already a palindrome.",
        "Example 3:\nInput: s = 'ab'\nOutput: 1\nExplanation: Cut into ['a', 'b'].",
        "Constraints:\n- 1 <= s.length <= 2000\n- s consists of lowercase English letters only",
      ],
      code: `int minCut(string s) {
    int n = s.size();
    // Phase 1: the interval DP - pal[l][r] tells whether s[l..r] is a palindrome.
    vector<vector<char>> pal(n, vector<char>(n, 0));
    for (int len = 1; len <= n; len++)
        for (int l = 0, r = len - 1; r < n; l++, r++)
            pal[l][r] = (s[l] == s[r]) && (len <= 2 || pal[l + 1][r - 1]);

    // Phase 2: a prefix DP - dp[i] = fewest palindromic parts covering the first i characters.
    vector<int> dp(n + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (pal[j][i - 1] && dp[j] != INT_MAX) dp[i] = min(dp[i], dp[j] + 1);
    return dp[n] - 1;                 // k parts means k-1 cuts
}`,
      explanation: [
        "This is the pattern where interval DP is a precomputation rather than the answer. The expensive question 'is this substring a palindrome' is answered for all O(n^2) intervals up front in O(1) each, and then a simple one-dimensional prefix DP does the optimisation on top.",
        "Phase 2 state: dp[i] is the fewest palindromic pieces covering s[0..i-1]. The last piece is some s[j..i-1] that must itself be a palindrome, so dp[i] = min over valid j of dp[j] + 1. Answering in parts and subtracting one at the end is cleaner than tracking cuts directly, because the empty prefix then has the natural base value dp[0] = 0.",
        "The palindrome table must be filled by increasing length even though phase 2 does not care about order, because pal[l][r] reads pal[l+1][r-1]. Building it with the naive double loop over l and r ascending reads uninitialised cells and silently produces wrong answers on long inputs.",
        "The trap is recomputing the palindrome check inside phase 2, which makes each check O(n) and the whole solution O(n^3) - too slow at n = 2000. The other trap is a greedy 'take the longest palindromic prefix each time', which fails on 'aaba': the longest palindromic prefix is 'aa', forcing 'b' and 'a' as separate parts for 2 cuts, while 'a' + 'aba' needs only 1.",
        "Time: O(n^2). Space: O(n^2) for the palindrome table.",
      ],
    },
    {
      name: "Burst Balloons",
      difficulty: "Hard",
      variation: "Reverse thinking: pick the LAST element",
      link: "https://leetcode.com/problems/burst-balloons/",
      question: [
        "You are given n balloons in a row, where balloon i is painted with the number nums[i]. Bursting balloon i earns nums[left] * nums[i] * nums[right] coins, where left and right are the balloons immediately adjacent to i at that moment; if a side has no balloon, treat its value as 1. After a burst the row closes up, so neighbours change. Burst all the balloons and return the maximum coins you can collect.",
        "Example 1:\nInput: nums = [3, 1, 5, 8]\nOutput: 167\nExplanation: Bursting in the order 1, 5, 3, 8 earns 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15 + 120 + 24 + 8 = 167.",
        "Example 2:\nInput: nums = [1, 5]\nOutput: 10\nExplanation: Burst 1 first for 1*1*5 = 5, then 5 for 1*5*1 = 5, total 10.",
        "Constraints:\n- 1 <= n <= 300\n- 0 <= nums[i] <= 100",
      ],
      code: `int maxCoins(vector<int>& nums) {
    int n = nums.size(), m = n + 2;
    vector<int> a(m, 1);                       // pad both ends with virtual value-1 balloons
    for (int i = 0; i < n; i++) a[i + 1] = nums[i];
    // dp[l][r] = best coins from bursting everything strictly between l and r,
    // given that balloons l and r are still standing.
    vector<vector<int>> dp(m, vector<int>(m, 0));
    for (int len = 3; len <= m; len++) {
        for (int l = 0; l + len - 1 < m; l++) {
            int r = l + len - 1;
            for (int k = l + 1; k < r; k++)     // k is the LAST balloon burst in this range
                dp[l][r] = max(dp[l][r], dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]);
        }
    }
    return dp[0][m - 1];
}`,
      explanation: [
        "The obstacle is that bursting changes the neighbours, so 'first burst k' leaves a range whose boundary values are not known locally - the subproblems are not independent. The fix is to guess the *last* balloon burst in the open range (l, r) instead of the first.",
        "That single reversal makes everything local. If k is burst last inside (l, r), then at the moment of its burst every other balloon strictly between l and r is already gone, so its immediate neighbours are exactly l and r, and it earns a[l] * a[k] * a[r] - a value that depends only on the state indices. Everything before splits into the two independent ranges (l, k) and (k, r), because no burst on one side ever becomes a neighbour of a balloon on the other while k still stands.",
        "State convention: l and r are surviving boundaries, not members. So dp[l][k] and dp[k][r] both keep k, and the base cases are intervals with nothing inside (len < 3), worth 0. Writing dp[k+1][r] here is wrong for the same reason as in polygon triangulation.",
        "Padding with two virtual balloons of value 1 removes all edge handling, since the problem already says a missing neighbour counts as 1.",
        "The natural greedy - always burst the balloon with the smallest current product, or always burst the smallest value first - is wrong. On [3, 1, 5, 8] you must burst the 1 early to let 3 and 5 become neighbours, but the large 8 has to survive until the end so that its final burst is not wasted.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Cost to Merge Stones",
      difficulty: "Hard",
      variation: "Interval DP with an extra pile-count dimension",
      link: "https://leetcode.com/problems/minimum-cost-to-merge-stones/",
      question: [
        "There are n piles of stones arranged in a row, where stones[i] is the number of stones in pile i. In one move you may merge exactly k consecutive piles into one pile, at a cost equal to the total number of stones in those k piles. Return the minimum total cost to merge all the piles into a single pile, or -1 if it is impossible.",
        "Example 1:\nInput: stones = [3, 2, 4, 1], k = 2\nOutput: 20\nExplanation: Merge [3,2] for 5 giving [5,4,1], merge [4,1] for 5 giving [5,5], merge [5,5] for 10. Total 5 + 5 + 10 = 20.",
        "Example 2:\nInput: stones = [3, 2, 4, 1], k = 3\nOutput: -1\nExplanation: Each move reduces the pile count by 2, so from 4 piles you can only reach 2, never 1.",
        "Example 3:\nInput: stones = [3, 5, 1, 2, 6], k = 3\nOutput: 25\nExplanation: Merge [5,1,2] for 8 giving [3,8,6], then merge [3,8,6] for 17. Total 8 + 17 = 25.",
        "Constraints:\n- 1 <= n <= 30\n- 1 <= stones[i] <= 100\n- 2 <= k <= 30",
      ],
      code: `int mergeStones(vector<int>& stones, int k) {
    int n = stones.size();
    if ((n - 1) % (k - 1) != 0) return -1;   // each move costs k piles and returns 1: net -(k-1)
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];
    const int INF = 1e9;
    // dp[l][r][p] = min cost to reduce piles l..r to exactly p piles
    vector<vector<vector<int>>> dp(n, vector<vector<int>>(n, vector<int>(k + 1, INF)));
    for (int i = 0; i < n; i++) dp[i][i][1] = 0;
    for (int len = 2; len <= n; len++) {
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            for (int p = 2; p <= k; p++)
                // the leftmost of the p piles covers l..mid, so that block must collapse to 1
                for (int mid = l; mid < r; mid += k - 1)
                    if (dp[l][mid][1] < INF && dp[mid + 1][r][p - 1] < INF)
                        dp[l][r][p] = min(dp[l][r][p], dp[l][mid][1] + dp[mid + 1][r][p - 1]);
            // p == 1 is p == k followed by one final merge charging the whole interval
            if (dp[l][r][k] < INF) dp[l][r][1] = dp[l][r][k] + pre[r + 1] - pre[l];
        }
    }
    return dp[0][n - 1][1];
}`,
      explanation: [
        "Plain dp[l][r] is not enough here. An interval cannot always be squeezed to one pile - only lengths with (len - 1) divisible by (k - 1) can - so intermediate states must be allowed to be several piles. Adding the count p as a third dimension is the standard fix when an interval DP's subproblem does not close cleanly.",
        "Feasibility first: every move turns k piles into 1, so the pile count drops by exactly k-1 each time. Reaching 1 pile from n therefore requires (n-1) % (k-1) == 0, which is why example 2 is impossible and why the mid loop steps by k-1 rather than by 1.",
        "Transition for p >= 2: consider the leftmost of the p final piles. It is formed from some prefix l..mid of the interval, fully collapsed into a single pile, and the rest must become p-1 piles. Splitting on mid enumerates all possibilities exactly once. The dp[l][mid][1] factor is what forces mid to be at a length that can collapse, hence the k-1 stride.",
        "Transition for p == 1: reaching one pile means first reaching exactly k piles and then merging them. That last merge costs the sum of the entire interval - every stone in l..r is present in those k piles - which is why the prefix-sum term appears only in the p == 1 line and never inside the split loop. Charging the interval sum on every split would massively overcount.",
        "The tempting wrong approach is greedy: repeatedly merge the cheapest k consecutive piles. It fails because a cheap early merge can be forced to be re-merged later at the top, and the total is dominated by how many times each stone is counted, not by any single move.",
        "Time: O(n^3 * k). Space: O(n^2 * k).",
      ],
    },
    {
      name: "Remove Boxes",
      difficulty: "Hard",
      variation: "Interval DP with a carried-count third state",
      link: "https://leetcode.com/problems/remove-boxes/",
      question: [
        "You are given several boxes of different colours represented by an array boxes, where boxes[i] is the colour of box i. In each round you may choose any contiguous run of k boxes of the same colour and remove them, scoring k*k points, after which the row closes up. Return the maximum points you can collect by removing all the boxes.",
        "Example 1:\nInput: boxes = [1, 3, 2, 2, 2, 3, 4, 3, 1]\nOutput: 23\nExplanation: Remove the single 4 for 1 point, leaving [1,3,2,2,2,3,3,1]. Remove the three 2s for 9, leaving [1,3,3,3,1]. Remove the three 3s, now contiguous, for 9, leaving [1,1]. Remove the two 1s for 4. Total 1 + 9 + 9 + 4 = 23.",
        "Example 2:\nInput: boxes = [1, 1, 1]\nOutput: 9\nExplanation: Remove all three at once for 3*3 = 9, which beats any split.",
        "Constraints:\n- 1 <= boxes.length <= 100\n- 1 <= boxes[i] <= 100",
      ],
      code: `int removeBoxes(vector<int>& boxes) {
    int n = boxes.size();
    // memo[l][r][c]: best score for boxes[l..r] given c extra boxes of colour boxes[l]
    // already attached immediately to the left of l.
    vector<vector<vector<int>>> memo(n, vector<vector<int>>(n, vector<int>(n, 0)));
    function<int(int,int,int)> solve = [&](int l, int r, int c) -> int {
        if (l > r) return 0;
        if (memo[l][r][c]) return memo[l][r][c];   // 0 is never a real score for a non-empty range
        int l2 = l, c2 = c;
        while (l2 + 1 <= r && boxes[l2 + 1] == boxes[l2]) { l2++; c2++; }  // absorb the leading run
        int best = (c2 + 1) * (c2 + 1) + solve(l2 + 1, r, 0);   // cash the whole group in now
        for (int m = l2 + 2; m <= r; m++)
            if (boxes[m] == boxes[l2])                          // save the group to join box m later
                best = max(best, solve(l2 + 1, m - 1, 0) + solve(m, r, c2 + 1));
        return memo[l][r][c] = best;
    };
    return solve(0, n - 1, 0);
}`,
      explanation: [
        "Two interval indices are provably insufficient. Removing a middle block can make boxes from outside the interval become adjacent to boxes inside it, so the value of an interval genuinely depends on context. The third dimension c captures exactly the context that matters: how many boxes of the same colour as boxes[l] are already glued to the left edge.",
        "That is the whole insight - the only way the outside can help is by contributing same-coloured boxes to the group that boxes[l] belongs to, and a count is enough to represent them because k*k depends only on the group size, not on where those boxes came from.",
        "Transition: after absorbing the leading run into a group of size c2+1, you either cash it in immediately for (c2+1)^2 and recurse on the remainder with a fresh count, or you postpone it, clear out some interval l2+1..m-1 to bring a same-coloured box at position m into contact, and recurse with the count increased by c2+1. Scanning every matching m tries every possible eventual group.",
        "The reason it is legal to always deal with the leftmost group first is that removals commute in the following sense: any optimal schedule can be reordered so that everything removed strictly inside a chosen gap happens before the merge across that gap. Without that argument the recursion would be a heuristic.",
        "The trap is expecting greedy 'always remove the longest available run' to work. On the example the isolated 4 must be removed first even though it scores only 1, purely so that three separated 3s become one run worth 9 - a local loss that unlocks the largest term.",
        "Memoising on 0 as 'unseen' is safe only because a non-empty range always scores at least 1; if scores could be 0 you would need a separate visited flag.",
        "Time: O(n^4) states-times-transitions. Space: O(n^3).",
      ],
    },
  ],
};
