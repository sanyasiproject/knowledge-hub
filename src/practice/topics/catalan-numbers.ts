import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Program for nth Catalan Number",
      difficulty: "Easy",
      variation: "The convolution recurrence, the template",
      question: [
        "The Catalan numbers are defined by C(0) = 1 and C(n) = sum over i from 0 to n-1 of C(i) * C(n-1-i). Given n, return the n-th Catalan number. The answer fits in a signed 64-bit integer for the given range.",
        "Example 1:\nInput: n = 5\nOutput: 42\nExplanation: The sequence starts 1, 1, 2, 5, 14, 42, so C(5) = 42.",
        "Example 2:\nInput: n = 0\nOutput: 1\nExplanation: C(0) = 1 by definition - there is exactly one empty object.",
        "Constraints:\n- 0 <= n <= 30",
      ],
      code: `long long catalan(int n) {
    vector<long long> C(n + 1, 0);
    C[0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            C[i] += C[j] * C[i - 1 - j];   // one unit is spent on the split itself
    return C[n];
}`,
      explanation: [
        "State: C(i) is the number of Catalan objects of size i. The transition is a convolution, and every Catalan problem is really the same convolution wearing a different costume: pick one distinguished element (the root, the matching partner of the first bracket, the edge of the polygon), and it splits the remaining i-1 units into a left part of size j and a right part of size i-1-j.",
        "The split is a bijection, which is what makes the sum correct: every object of size i corresponds to exactly one pair (left object, right object) for exactly one value of j, so the cases are disjoint and exhaustive. The single unit consumed by the split is the reason the indices sum to i-1 and not i.",
        "The closed form C(n) = binom(2n, n) / (n + 1) is faster, but the tempting shortcut of computing (2n)! / (n! * n! * (n+1)) with plain integers overflows long before the answer does. Build the binomial multiplicatively, or work modulo a prime with inverses, as the later problems here do.",
        "Growth is roughly 4^n / n^1.5, so C(35) already leaves 64-bit range. Any problem with n beyond about 33 and no modulus is asking for big integers, not a bigger int type.",
        "Time: O(n^2) for the recurrence, O(n) for the closed form. Space: O(n).",
      ],
    },
    {
      name: "Unique Binary Search Trees",
      difficulty: "Medium",
      variation: "BST shapes, split on the root",
      link: "https://leetcode.com/problems/unique-binary-search-trees/",
      question: [
        "Given an integer n, return the number of structurally unique binary search trees which have exactly n nodes with distinct values 1..n.",
        "Example 1:\nInput: n = 3\nOutput: 5\nExplanation: The five shapes come from choosing each of 1, 2, 3 as the root; root 2 gives one shape, roots 1 and 3 give two each.",
        "Example 2:\nInput: n = 1\nOutput: 1",
        "Constraints:\n- 1 <= n <= 19",
      ],
      code: `int numTrees(int n) {
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;                         // the empty tree is one shape
    for (int i = 1; i <= n; i++)
        for (int r = 1; r <= i; r++)   // r = rank of the root among the i sorted values
            dp[i] += dp[r - 1] * dp[i - r];
    return (int)dp[n];
}`,
      explanation: [
        "The BST property fixes everything once the root is chosen: if the root is the r-th smallest value, the r-1 smaller values must all sit in the left subtree and the i-r larger ones in the right subtree. So dp[i] = sum over r of dp[r-1] * dp[i-r], the Catalan convolution again.",
        "Only the count of nodes matters, never their actual values, because any set of i distinct values relabels to 1..i order-isomorphically. That is why a one-dimensional state is enough and no interval [lo, hi] state is needed.",
        "dp[0] = 1 is load-bearing. Setting it to 0 kills every term where the root is the smallest or largest value and collapses the answer.",
        "The tempting wrong model is to count the permutations of insertion order, which overcounts: many different insertion sequences build the same shape. Structure, not history, is what is being counted.",
        "n <= 19 keeps C(19) = 1767263190 inside 32-bit range, but accumulating in long long avoids relying on that.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Generate Parentheses",
      difficulty: "Medium",
      variation: "Enumerating the objects instead of counting them",
      link: "https://leetcode.com/problems/generate-parentheses/",
      question: [
        "Given n pairs of parentheses, generate all combinations of well-formed parentheses. A string is well-formed if every prefix has at least as many opening brackets as closing brackets and the totals are equal.",
        "Example 1:\nInput: n = 3\nOutput: ['((()))', '(()())', '(())()', '()(())', '()()()']\nExplanation: There are C(3) = 5 balanced strings of 3 pairs.",
        "Example 2:\nInput: n = 1\nOutput: ['()']",
        "Constraints:\n- 1 <= n <= 8",
      ],
      code: `class Solution {
    vector<string> res;
    string cur;
    int n;

    void dfs(int open, int close) {
        if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }
        if (open < n) {                 // an extra '(' is always legal
            cur.push_back('(');
            dfs(open + 1, close);
            cur.pop_back();
        }
        if (close < open) {             // a ')' only while something is unmatched
            cur.push_back(')');
            dfs(open, close + 1);
            cur.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int nn) {
        n = nn;
        dfs(0, 0);
        return res;
    }
};`,
      explanation: [
        "The two guards encode the balanced-prefix invariant directly: an opener is legal while fewer than n have been placed, and a closer is legal only while the running balance open - close is positive. Because the invariant is never violated, every leaf reached at length 2n is a valid string and no filtering pass is needed.",
        "Every valid string is produced exactly once, since the recursion fixes the characters left to right and the two branches differ in the character placed at the current position. So the number of leaves is exactly C(n) - this problem is the Catalan count made visible.",
        "The naive alternative - generate all 2^(2n) strings and test each - is correct but wastes a factor of roughly n^1.5 * (2^(2n) / 4^n), and more importantly it hides the invariant that makes the pruned search obvious.",
        "The output size is itself C(n), which is why n is capped at 8: C(8) = 1430 strings. No enumeration algorithm can beat that lower bound.",
        "Time: O(C(n) * n) - work proportional to the output, since the pruning means no dead branches. Space: O(n) recursion depth plus the output.",
      ],
    },
    {
      name: "Bracket Sequences I",
      difficulty: "Medium",
      variation: "Closed form modulo a prime",
      link: "https://cses.fi/problemset/task/2064",
      question: [
        "Your task is to calculate the number of valid bracket sequences of length n. A bracket sequence is valid if it can be built from '(' and ')' so that every prefix has at least as many openers as closers and the whole string is balanced. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n4\nOutput: 2\nExplanation: The two sequences are '(())' and '()()'.",
        "Example 2:\nInput:\n3\nOutput: 0\nExplanation: An odd length can never be balanced.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    if (n % 2) { cout << 0 << "\\n"; return 0; }   // odd length is impossible
    int h = n / 2;
    vector<long long> fact(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    long long invH = pw(fact[h], MOD - 2);        // Fermat inverse of h!
    long long ans = fact[n] * invH % MOD;
    ans = ans * invH % MOD;                       // now ans = binom(2h, h)
    ans = ans * pw(h + 1, MOD - 2) % MOD;         // divide by h + 1
    cout << ans << "\\n";
}`,
      explanation: [
        "With n up to 10^6 the O(n^2) convolution is far too slow, so the closed form is required: the count is C(h) = binom(2h, h) / (h + 1) where h = n / 2.",
        "Why that formula: a sequence of h openers and h closers is a lattice path of +1 and -1 steps returning to 0, and binom(2h, h) counts all of them. The bad paths are those that dip to -1; reflecting a bad path about the line y = -1 after its first touch is a bijection onto all paths ending at -2, of which there are binom(2h, h-1). Subtracting gives binom(2h, h) - binom(2h, h-1), which simplifies to binom(2h, h) / (h + 1).",
        "Division by h + 1 is not integer division here - modular arithmetic has no ordering, so use the Fermat inverse pw(h + 1, MOD - 2), valid because 10^9 + 7 is prime and h + 1 < MOD.",
        "The trap is reducing the numerator and denominator separately with plain integer division, or forgetting that fact[i - 1] * i can reach 10^18: keep every product in long long and take the modulus at each step.",
        "Time: O(n) for the factorials plus O(log MOD) per inverse. Space: O(n).",
      ],
    },
    {
      name: "Unique Binary Search Trees II",
      difficulty: "Medium",
      variation: "Building every shape, not just counting",
      link: "https://leetcode.com/problems/unique-binary-search-trees-ii/",
      question: [
        "Given an integer n, return all the structurally unique binary search trees which have exactly n nodes with distinct values 1..n. The trees may be returned in any order.",
        "Example 1:\nInput: n = 3\nOutput: 5 trees, namely the ones rooted at 1 with right chain 2,3; rooted at 1 with right child 3 and its left child 2; rooted at 2 with children 1 and 3; rooted at 3 with left child 1 and its right child 2; rooted at 3 with left chain 2,1.\nExplanation: The count matches C(3) = 5.",
        "Example 2:\nInput: n = 1\nOutput: 1 tree, the single node 1.",
        "Constraints:\n- 1 <= n <= 8",
      ],
      code: `class Solution {
    vector<TreeNode*> build(int lo, int hi) {
        if (lo > hi) return {nullptr};              // one way to build an empty subtree
        vector<TreeNode*> res;
        for (int root = lo; root <= hi; root++) {
            vector<TreeNode*> L = build(lo, root - 1);
            vector<TreeNode*> R = build(root + 1, hi);
            for (TreeNode* l : L)
                for (TreeNode* r : R)
                    res.push_back(new TreeNode(root, l, r));   // shared subtrees are fine
        }
        return res;
    }

public:
    vector<TreeNode*> generateTrees(int n) {
        return build(1, n);
    }
};`,
      explanation: [
        "This is the constructive twin of Unique Binary Search Trees. The same root split drives it, but now the state must be the interval [lo, hi] rather than a size, because the nodes carry the actual values and a subtree over 4..6 is a different object from one over 1..3 even though the counts agree.",
        "Returning the single-element list {nullptr} for an empty range is what makes the double loop produce the right cross product. Returning an empty list instead would silently drop every tree whose root is an endpoint - the exact same bug as setting dp[0] = 0 in the counting version.",
        "The number of trees produced is C(n), and the cross product of left and right lists reproduces the convolution term by term, so no duplicate shape is ever emitted.",
        "Sharing subtree pointers between different output trees is allowed here and saves a large amount of allocation; if a problem required disjoint trees you would have to deep-copy each subtree, multiplying the work by the tree size.",
        "Time: O(C(n) * n) nodes produced overall, dominated by the output size. Space: O(C(n) * n) for the trees returned.",
      ],
    },
    {
      name: "Different Ways to Add Parentheses",
      difficulty: "Medium",
      variation: "All parenthesizations of an expression",
      link: "https://leetcode.com/problems/different-ways-to-add-parentheses/",
      question: [
        "Given a string expression of numbers and the operators '+', '-' and '*', return all possible results from computing all the different possible ways to group numbers and operators. The results may be returned in any order.",
        "Example 1:\nInput: expression = '2-1-1'\nOutput: [0, 2]\nExplanation: (2-1)-1 = 0 and 2-(1-1) = 2.",
        "Example 2:\nInput: expression = '2*3-4*5'\nOutput: [-34, -14, -10, -10, 10]\nExplanation: There are C(3) = 5 groupings of three operators: (2*(3-(4*5))) = -34, ((2*3)-(4*5)) = -14, ((2*(3-4))*5) = -10, (2*((3-4)*5)) = -10, (((2*3)-4)*5) = 10.",
        "Constraints:\n- 1 <= expression.length <= 20\n- expression consists of digits and the operators '+', '-', '*'\n- all integer values in the input are in the range [0, 99]",
      ],
      code: `vector<int> diffWaysToCompute(string expr) {
    vector<int> res;
    bool isNumber = true;
    for (int i = 0; i < (int)expr.size(); i++) {
        char c = expr[i];
        if (c == '+' || c == '-' || c == '*') {
            isNumber = false;                                  // c is the last operator applied
            vector<int> L = diffWaysToCompute(expr.substr(0, i));
            vector<int> R = diffWaysToCompute(expr.substr(i + 1));
            for (int a : L)
                for (int b : R) {
                    if (c == '+') res.push_back(a + b);
                    else if (c == '-') res.push_back(a - b);
                    else res.push_back(a * b);
                }
        }
    }
    if (isNumber) res.push_back(stoi(expr));                    // a bare number, no split
    return res;
}`,
      explanation: [
        "A full parenthesization of k operators is exactly a binary tree with k internal nodes, so the number of groupings is C(k). Choosing the operator evaluated last picks the root, and the operators to its left and right form the two subexpressions - the Catalan split, with the operator as the consumed unit.",
        "The recursion returns the multiset of values a subexpression can take, and combining a left value with a right value under the chosen root operator covers every grouping exactly once. Duplicates in the output are intentional: two structurally different groupings that happen to evaluate to the same number are both counted, as -10 twice in the second example shows.",
        "The tempting mistake is to treat the split as 'try every position' including inside a number, or to reuse operator precedence. Precedence is irrelevant here because the parentheses are explicit - only the tree shape matters.",
        "Memoizing on the substring (a map from string to vector<int>) is the standard speedup; with length <= 20 the plain recursion is already fast enough, and each substring is re-derived at most a constant number of times per split point.",
        "Time: O(C(k) * k) values produced for k operators, exponential in the length as it must be. Space: O(n) recursion depth plus the output.",
      ],
    },
    {
      name: "Number of Ways to Triangulate a Convex Polygon",
      difficulty: "Medium",
      variation: "Polygon triangulations, interval DP",
      question: [
        "Given a convex polygon with n vertices, count the number of ways to cut it into n-2 triangles using n-3 non-crossing diagonals. Two triangulations are different if they use a different set of diagonals. The answer fits in a signed 64-bit integer for the given range.",
        "Example 1:\nInput: n = 4\nOutput: 2\nExplanation: A convex quadrilateral can be split by either of its two diagonals.",
        "Example 2:\nInput: n = 5\nOutput: 5\nExplanation: A convex pentagon has 5 triangulations, which is C(3).",
        "Constraints:\n- 3 <= n <= 32",
      ],
      code: `long long countTriangulations(int n) {
    if (n < 3) return 1;                                  // degenerate: nothing to cut
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    for (int i = 0; i + 1 < n; i++) dp[i][i + 1] = 1;     // a single edge, no area
    for (int len = 3; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            for (int k = i + 1; k < j; k++)
                dp[i][j] += dp[i][k] * dp[k][j];          // triangle (i, k, j) is fixed
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "State: dp[i][j] is the number of triangulations of the sub-polygon on the consecutive vertices i..j together with the closing chord (i, j). The distinguished object is that chord: in any triangulation it belongs to exactly one triangle, whose third vertex k lies strictly between i and j, and that triangle cuts the sub-polygon into two independent smaller ones.",
        "Because the third vertex k is unique per triangulation, summing over k counts every triangulation exactly once - the same disjoint-and-exhaustive argument as the bracket split. The answer dp[0][n-1] therefore equals C(n-2).",
        "The base case dp[i][i+1] = 1 says a two-vertex 'polygon' is just an edge and contributes a factor of 1. Setting it to 0 zeroes the whole table; forgetting it entirely and starting at len = 3 with uninitialised entries gives the same failure.",
        "The naive wrong approach is to count choices of diagonals independently, or to multiply n-3 by something: diagonals interact through the non-crossing condition, and only the recursive cut respects it.",
        "Since the answer is just C(n-2), the closed form is the practical solution; the interval DP is worth knowing because the same skeleton solves weighted versions such as minimum-score triangulation, where no closed form exists.",
        "Time: O(n^3) for the DP, O(n) for the closed form. Space: O(n^2).",
      ],
    },
    {
      name: "Handshakes That Don't Cross",
      difficulty: "Hard",
      variation: "Non-crossing chords on a circle",
      link: "https://leetcode.com/problems/handshakes-that-dont-cross/",
      question: [
        "You are given an even number of people numPeople standing in a circle, numbered 1..numPeople clockwise. Each person shakes hands with exactly one other person, so there are numPeople / 2 handshakes in total. Return the number of ways these handshakes can occur such that no two handshakes cross, modulo 10^9 + 7.",
        "Example 1:\nInput: numPeople = 4\nOutput: 2\nExplanation: Either 1 pairs with 2 and 3 pairs with 4, or 1 pairs with 4 and 2 pairs with 3. Pairing 1 with 3 and 2 with 4 crosses.",
        "Example 2:\nInput: numPeople = 6\nOutput: 5\nExplanation: C(3) = 5 non-crossing perfect matchings on 6 points.",
        "Constraints:\n- 2 <= numPeople <= 1000\n- numPeople is even",
      ],
      code: `int numberOfWays(int numPeople) {
    const long long MOD = 1000000007;
    int n = numPeople / 2;                  // count in handshakes, not people
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)         // j handshakes sealed off inside the chord
            dp[i] = (dp[i] + dp[j] * dp[i - 1 - j]) % MOD;
    return (int)dp[n];
}`,
      explanation: [
        "Fix person 1. Their chord splits the remaining people into an arc on one side and an arc on the other, and no handshake may cross that chord, so the two arcs are solved independently. If the inside arc holds 2j people the outside holds numPeople - 2 - 2j, giving dp[i] = sum of dp[j] * dp[i-1-j] in units of handshakes.",
        "The parity argument is the real content: person 1 must pair with someone an odd number of positions away, otherwise one of the two arcs has an odd number of people and cannot be matched at all. That is exactly why the sum runs over whole handshakes j and not over individual people.",
        "This is the same convolution as brackets and BSTs, so the answer is C(numPeople / 2). Writing the chord as person 1 with person 2k and reasoning in people rather than pairs is where most off-by-one and parity errors appear.",
        "The modulus is mandatory: numPeople = 1000 means C(500), a number with hundreds of digits. Reduce inside the inner loop so no product exceeds about 10^18.",
        "Time: O(n^2) with n = numPeople / 2, comfortably fast at 500; the factorial closed form would be O(n). Space: O(n).",
      ],
    },
    {
      name: "White and Black Balls",
      difficulty: "Hard",
      variation: "Ballot problem, reflection with an offset",
      link: "https://atcoder.jp/contests/abc205/tasks/abc205_e",
      question: [
        "You have N white balls and M black balls, all identical within a colour. Count the arrangements of all N + M balls in a row such that for every prefix of the row, (number of white balls so far) + K >= (number of black balls so far). Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n2 2 1\nOutput: 5\nExplanation: Of the 6 arrangements of WWBB, only BBWW fails, since after two balls 0 + 1 < 2.",
        "Example 2:\nInput:\n1 1 0\nOutput: 1\nExplanation: Only WB works; BW already fails at the first ball.",
        "Constraints:\n- 1 <= N, M <= 10^6\n- 0 <= K <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

vector<long long> fact, inv_fact;

long long binom(long long a, long long b) {
    if (b < 0 || b > a) return 0;                     // out-of-range binomials vanish
    return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m, k;
    cin >> n >> m >> k;
    long long tot = n + m;
    fact.assign(tot + 1, 1);
    inv_fact.assign(tot + 1, 1);
    for (long long i = 1; i <= tot; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[tot] = pw(fact[tot], MOD - 2);
    for (long long i = tot; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
    long long ans = (binom(tot, n) - binom(tot, m - k - 1) + MOD) % MOD;
    cout << ans << "\\n";
}`,
      explanation: [
        "Read white as a +1 step and black as a -1 step. An arrangement is a lattice path of N + M steps from 0 to N - M, and the constraint says the path never drops below the line y = -K. Without the constraint there are binom(N+M, N) paths.",
        "Reflection kills the bad ones. A path is bad exactly when it touches y = -(K+1); reflecting the portion after its first touch about that line is a bijection from bad paths onto all paths ending at -2(K+1) - (N - M). Such a path has (N + M + endpoint) / 2 = M - K - 1 up steps, so there are binom(N+M, M-K-1) bad paths and the answer is binom(N+M, N) - binom(N+M, M-K-1).",
        "The K = 0 case is the plain Catalan / ballot count, and N = M with K = 0 reduces to C(N). Treating this problem as its own special trick, rather than as Catalan with the barrier lowered by K, is what makes it look hard.",
        "The out-of-range guard in binom does more than avoid a bad index: when M - K - 1 < 0 no path can reach the barrier and the subtraction must contribute nothing, and when M > N + K the two binomials cancel to 0, which is correct because the final prefix itself violates the constraint. Also subtract with + MOD before the final modulus, since the raw difference can be negative.",
        "Precompute factorials once and derive all inverse factorials from the top with a single modular inverse; calling pw per query would add a log factor for nothing.",
        "Time: O(N + M + log MOD). Space: O(N + M).",
      ],
    },
    {
      name: "Bracket Sequences II",
      difficulty: "Hard",
      variation: "Completions of a fixed prefix",
      link: "https://cses.fi/problemset/task/2187",
      question: [
        "Your task is to count the number of valid bracket sequences of length n whose first m characters are a given string of '(' and ')'. Print the answer modulo 10^9 + 7. The first input line has two integers n and m, and the second line has the m-character prefix.",
        "Example 1:\nInput:\n4 2\n()\nOutput: 1\nExplanation: The only completion is '()()'.",
        "Example 2:\nInput:\n6 2\n((\nOutput: 3\nExplanation: The completions are '((()))', '(()())' and '(())()'.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= m <= n",
      ],
      code: `const long long MOD = 1000000007;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

vector<long long> fact, inv_fact;

long long binom(long long a, long long b) {
    if (b < 0 || b > a) return 0;
    return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m;
    cin >> n >> m;
    string s;
    if (m > 0) cin >> s;
    long long bal = 0;
    for (char c : s) {
        bal += (c == '(' ? 1 : -1);
        if (bal < 0) { cout << 0 << "\\n"; return 0; }   // prefix already invalid
    }
    long long r = n - m;                                  // free positions left
    if (bal > r || (r - bal) % 2 != 0) { cout << 0 << "\\n"; return 0; }
    fact.assign(n + 1, 1);
    inv_fact.assign(n + 1, 1);
    for (long long i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[n] = pw(fact[n], MOD - 2);
    for (long long i = n; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
    long long up = (r - bal) / 2;                         // openers among the free slots
    long long ans = (binom(r, up) - binom(r, up - 1) + MOD) % MOD;
    cout << ans << "\\n";
}`,
      explanation: [
        "The prefix matters only through one number: the balance bal it leaves behind, provided the prefix itself never went negative. After that the task is to count paths of r = n - m steps of +1 and -1 that start at height bal, end at 0, and never go below 0.",
        "Such a path has up = (r - bal) / 2 openers, so there are binom(r, up) paths ignoring the floor. A path is bad exactly when it touches -1, and reflecting about y = -1 after the first touch maps bad paths bijectively onto paths from bal to -2, which have up - 1 openers. Hence the answer binom(r, up) - binom(r, up - 1). With bal = 0 and m = 0 this collapses to the Catalan number, which is a good sanity check.",
        "Three impossibility filters are needed and each one is a real test case: a prefix that dips below zero, a leftover balance larger than the remaining length, and a parity mismatch between r and bal (which also covers odd n).",
        "The tempting approach is a DP over (position, balance), which is O(n^2) - fine for n = 1000 and hopeless at 10^6. The reflection argument is what replaces the whole table with two binomials.",
        "Build the inverse factorials by walking down from inv_fact[n], one modular exponentiation in total; computing an inverse per factorial would be O(n log MOD) and can time out at this size.",
        "Time: O(n + log MOD). Space: O(n).",
      ],
    },
  ],
};
