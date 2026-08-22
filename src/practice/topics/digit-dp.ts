import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Rotated Digits",
      difficulty: "Medium",
      variation: "The template: position, tight flag, per-digit filter",
      link: "https://leetcode.com/problems/rotated-digits/",
      question: [
        "An integer x is a good number if every one of its digits stays a digit after rotating the whole number 180 degrees, and the rotated number is different from x. Rotation maps 0, 1 and 8 to themselves, swaps 2 with 5, swaps 6 with 9, and destroys 3, 4 and 7. So a good number uses only the digits 0, 1, 8, 2, 5, 6, 9 and contains at least one of 2, 5, 6, 9.",
        "Given a positive integer n, return how many numbers in the range [1, n] are good.",
        "Example 1:\nInput: n = 10\nOutput: 4\nExplanation: The good numbers are 2, 5, 6 and 9. 1, 8 and 10 rotate to themselves, and 3, 4, 7 contain a digit that does not survive rotation.",
        "Example 2:\nInput: n = 857\nOutput: 247",
        "Constraints:\n- 1 <= n <= 10^4",
      ],
      code: `class Solution {
    // -1 marks a digit that does not survive rotation.
    const int rot[10] = {0, 1, 5, -1, -1, 2, 9, -1, 8, 6};
    string s;
    int memo[12][2][2];

    // pos: index into s. tight: the prefix so far equals s's prefix.
    // diff: some digit already changed under rotation.
    int go(int pos, int tight, int diff) {
        if (pos == (int)s.size()) return diff;   // a full number counts only if it changed
        int &m = memo[pos][tight][diff];
        if (m != -1) return m;
        int lim = tight ? s[pos] - '0' : 9;      // the only place the bound is felt
        int res = 0;
        for (int d = 0; d <= lim; d++) {
            if (rot[d] == -1) continue;          // digit filter
            res += go(pos + 1, tight && d == lim, diff || rot[d] != d);
        }
        return m = res;
    }

public:
    int rotatedDigits(int n) {
        s = to_string(n);
        memset(memo, -1, sizeof memo);
        return go(0, 1, 0);                      // counts [0, n]; 0 is not good, so no correction
    }
};`,
      explanation: [
        "Digit DP walks the decimal string of n from the most significant position and builds candidate numbers digit by digit. The one flag that makes it work is tight: it is true exactly while the digits chosen so far are identical to n's digits. When tight is true this position may only go up to s[pos]; the moment a strictly smaller digit is picked, tight drops to false forever and every later position is free to be 0..9.",
        "That flag is what lets a huge range collapse into a tiny table. All the free suffixes below a given position are interchangeable, so the state is only (pos, tight, diff) - a couple of dozen states instead of n numbers.",
        "diff is carried in the state instead of checked at the end because the property 'at least one digit changed' is not a function of pos and tight alone. Any property you cannot recompute at the leaf must become part of the state; that is the single most useful rule in digit DP.",
        "The tempting wrong version memoizes on pos only, or forgets to reset the memo between calls. Both leak answers computed under a different tight value, and because the tight branch is visited once per position the bug often produces an answer that is close but too large.",
        "Leading zeros need no special handling here: 0 is a legal rotating digit and rotates to itself, so a padded number like 0025 is counted exactly once, as 25.",
        "Time: O(L * 10) where L is the number of digits, so effectively O(log n). Space: O(L) states plus the recursion stack.",
      ],
    },
    {
      name: "Number of Digit One",
      difficulty: "Medium",
      variation: "Counting digit occurrences, not numbers",
      link: "https://leetcode.com/problems/number-of-digit-one/",
      question: [
        "Given an integer n, count the total number of times the digit 1 appears in the decimal representations of all the integers from 1 to n inclusive. A number contributes once for every 1 it contains, so 11 contributes 2.",
        "Example 1:\nInput: n = 13\nOutput: 6\nExplanation: The digit 1 appears in 1, 10, 11 (twice), 12 and 13, for a total of 6 occurrences.",
        "Example 2:\nInput: n = 100\nOutput: 21",
        "Constraints:\n- 0 <= n <= 10^9",
      ],
      code: `class Solution {
    string s;
    long long memo[12][2][12];

    // ones = how many 1s the prefix already placed. The leaf returns that count,
    // so the recursion sums occurrences rather than counting numbers.
    long long go(int pos, int tight, int ones) {
        if (pos == (int)s.size()) return ones;
        long long &m = memo[pos][tight][ones];
        if (m != -1) return m;
        int lim = tight ? s[pos] - '0' : 9;
        long long res = 0;
        for (int d = 0; d <= lim; d++)
            res += go(pos + 1, tight && d == lim, ones + (d == 1));
        return m = res;
    }

public:
    int countDigitOne(int n) {
        if (n <= 0) return 0;
        s = to_string(n);
        memset(memo, -1, sizeof memo);
        return (int)go(0, 1, 0);
    }
};`,
      explanation: [
        "The switch from 'how many numbers' to 'how many digit occurrences' is a one-line change: instead of returning 1 at a leaf, return the accumulated count. Summing that over all leaves gives the total occurrences, because each complete number is one leaf and contributes exactly its own number of 1s.",
        "Because the leaf value depends on ones, ones must be part of the memo key. Dropping it would make different prefixes share a cached value that is only valid for one of them. The alternative formulation - return a pair (count of numbers, total 1s) and add ones * count at the parent - removes ones from the state and is what you want when the accumulator has a large range.",
        "The classic closed-form solution splits n by place value and counts 1s per position with a division trick. It is O(log n) too but it is fiddly to get the boundary cases right; the digit DP generalises immediately to 'count occurrences of digit k' or 'count numbers whose digit sum is s' without new algebra.",
        "Use 64-bit accumulators. For n near 2 * 10^9 the answer is around 2 * 10^9 as well, which overflows a signed 32-bit intermediate long before the final cast.",
        "Time: O(L * 10 * L) states times transitions, i.e. O(log^2 n) with a tiny constant. Space: O(L^2).",
      ],
    },
    {
      name: "Sum of Digits (CPCRC1C)",
      difficulty: "Medium",
      variation: "Aggregate DP returning (count, sum), range via f(b) - f(a-1)",
      link: "https://www.spoj.com/problems/CPCRC1C/",
      question: [
        "For a positive integer x let S(x) be the sum of its decimal digits. Given a and b, compute the sum of S(x) over every integer x in [a, b].",
        "The input consists of several test cases, one per line, each holding the two integers a and b. The input ends with a line containing -1 -1, which must not be processed. Print one line per test case.",
        "Example 1:\nInput:\n1 10\n100 777\n-1 -1\nOutput:\n46\n8655\nExplanation: The digit sums of 1..9 add up to 45 and S(10) = 1, giving 46 for the first query.",
        "Example 2:\nInput:\n28 138\n-1 -1\nOutput:\n1023",
        "Constraints:\n- 0 <= a <= b, both fitting in a 32-bit signed integer\n- the number of test cases is not given in advance; read until -1 -1",
      ],
      code: `string S;
long long cntMemo[20][2], sumMemo[20][2];
bool seen[20][2];

// Returns {number of completions from here, total digit sum over those completions}.
pair<long long, long long> go(int pos, int tight) {
    if (pos == (int)S.size()) return {1, 0};
    if (seen[pos][tight]) return {cntMemo[pos][tight], sumMemo[pos][tight]};
    int lim = tight ? S[pos] - '0' : 9;
    long long c = 0, sm = 0;
    for (int d = 0; d <= lim; d++) {
        auto [cc, ss] = go(pos + 1, tight && d == lim);
        c += cc;
        sm += ss + (long long)d * cc;   // digit d is repeated once per completion
    }
    seen[pos][tight] = true;
    cntMemo[pos][tight] = c;
    sumMemo[pos][tight] = sm;
    return {c, sm};
}

// Sum of digit sums over [0, n].
long long f(long long n) {
    if (n < 0) return 0;
    S = to_string(n);
    memset(seen, 0, sizeof seen);
    return go(0, 1).second;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long a, b;
    while (cin >> a >> b && !(a == -1 && b == -1))
        cout << f(b) - f(a - 1) << "\\n";
}`,
      explanation: [
        "Carrying the running digit sum in the state would work but is wasteful: instead return an aggregate pair from every state. count is how many ways the remaining positions can be filled, sum is the total of the remaining digit sums. The parent then folds a chosen digit d in with sum += childSum + d * childCount, because that single digit repeats once for each completion under it.",
        "This 'pair of (count, weighted sum)' shape is the standard trick whenever the quantity you want is a sum over numbers rather than a count of numbers. It keeps the state at O(L) and works unchanged for sums of squares, of digit products, or of the numbers themselves.",
        "The range is handled by the prefix-function identity ans(a, b) = f(b) - f(a-1) with f defined on [0, n]. Including 0 is harmless here since S(0) = 0. Guard f on a negative argument, otherwise a = 0 sends to_string(-1) into the DP and the minus sign corrupts the digit loop.",
        "The memo must be cleared per query because it is keyed on positions of the current S. Reusing a stale table across queries with different bounds is the most common bug in multi-query digit DP.",
        "The answer grows like 9 * L * n / 2, far past 32 bits for n near 10^9, so every accumulator is long long.",
        "Time: O(L * 10) per query, L <= 10. Space: O(L).",
      ],
    },
    {
      name: "Educational DP Contest S - Digit Sum",
      difficulty: "Medium",
      variation: "Bound given as a string, modular counting, digit sum mod D",
      link: "https://atcoder.jp/contests/dp/tasks/dp_s",
      question: [
        "You are given a positive integer K written in decimal, possibly with up to 10000 digits, and an integer D. Count the integers between 1 and K inclusive whose digit sum is a multiple of D. Print the count modulo 1000000007.",
        "Example 1:\nInput:\n30\n4\nOutput: 6\nExplanation: The valid numbers are 4, 8, 13, 17, 22 and 26 - each has digit sum 4 or 8.",
        "Example 2:\nInput:\n1000000009\n1\nOutput: 2\nExplanation: Every number qualifies when D = 1, so the count is 1000000009, and 1000000009 mod 1000000007 = 2.",
        "Constraints:\n- 1 <= K < 10^10000\n- 1 <= D <= 100\n- print the answer modulo 1000000007",
      ],
      code: `const long long MOD = 1000000007;
string K;
int D;
long long memo[10005][105][2];
bool seen[10005][105][2];

long long go(int pos, int rem, int tight) {
    if (pos == (int)K.size()) return rem == 0 ? 1 : 0;
    if (seen[pos][rem][tight]) return memo[pos][rem][tight];
    seen[pos][rem][tight] = true;
    int lim = tight ? K[pos] - '0' : 9;
    long long res = 0;
    for (int d = 0; d <= lim; d++)
        res = (res + go(pos + 1, (rem + d) % D, tight && d == lim)) % MOD;
    return memo[pos][rem][tight] = res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> K >> D;
    // go covers [0, K]; the number 0 has digit sum 0, a multiple of D, so subtract it.
    cout << (go(0, 0, 1) - 1 + MOD) % MOD << "\\n";
}`,
      explanation: [
        "K does not fit in any integer type, which is exactly why digit DP is the right tool: the algorithm never needs the numeric value of the bound, only its digit string. Nothing in the transition changes because K has 10000 digits instead of 10.",
        "State is (pos, digit sum mod D, tight). Keeping the sum modulo D rather than the raw sum is what bounds the table: the raw sum can reach 90000, but only its residue can ever affect whether a completed number qualifies, so residues are interchangeable states.",
        "The result must be taken modulo a prime, which means the count itself is no longer usable for comparisons - notice that 'subtract the number 0' is done as (x - 1 + MOD) % MOD, since x may legitimately be 0 after reduction.",
        "seen is a separate boolean array rather than a -1 sentinel because 0 is a perfectly valid memoized answer under a modulus. Using -1 in the value array works here too, but the habit of a separate visited flag is safer once values are reduced.",
        "Time: O(L * D * 10) which is about 10^7 for the worst case. Space: O(L * D).",
      ],
    },
    {
      name: "Classy Numbers",
      difficulty: "Medium",
      variation: "Budget in the state, many queries on [L, R]",
      link: "https://codeforces.com/problemset/problem/1036/C",
      question: [
        "Call a positive integer classy if its decimal representation contains at most 3 non-zero digits. For example 4, 200000 and 10203 are classy while 4231 and 65536 are not. Answer T independent queries: for each pair L, R report how many classy integers lie in [L, R].",
        "Example 1:\nInput:\n4\n1 1000\n1024 1024\n65536 65536\n999999 1000000\nOutput:\n1000\n1\n0\n1\nExplanation: Every number up to 1000 has at most 3 non-zero digits. 1024 has exactly three (1, 2, 4). 65536 has five. In the last query only 1000000 qualifies.",
        "Example 2:\nInput:\n1\n1 1000000000000000000\nOutput:\n607420\nExplanation: A classy number up to 10^18 is fixed by choosing which of the 19 positions hold the at most 3 non-zero digits and which digits those are.",
        "Constraints:\n- 1 <= T <= 10^4\n- 1 <= L <= R <= 10^18",
      ],
      code: `string S;
long long memo[20][5][2];
bool seen[20][5][2];

// nz = how many non-zero digits the prefix has used.
long long go(int pos, int nz, int tight) {
    if (nz > 3) return 0;                        // budget blown, prune the whole subtree
    if (pos == (int)S.size()) return 1;
    if (seen[pos][nz][tight]) return memo[pos][nz][tight];
    seen[pos][nz][tight] = true;
    int lim = tight ? S[pos] - '0' : 9;
    long long res = 0;
    for (int d = 0; d <= lim; d++)
        res += go(pos + 1, nz + (d > 0), tight && d == lim);
    return memo[pos][nz][tight] = res;
}

long long f(long long n) {                       // classy numbers in [0, n]
    if (n < 0) return 0;
    S = to_string(n);
    memset(seen, 0, sizeof seen);
    return go(0, 0, 1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long l, r;
        cin >> l >> r;
        cout << f(r) - f(l - 1) << "\\n";         // 0 is classy but cancels in the difference
    }
}`,
      explanation: [
        "The property 'at most 3 non-zero digits' is a budget, so the count of non-zero digits used so far joins the state. Capping the dimension at 4 and pruning as soon as it exceeds 3 keeps the table at 20 * 5 * 2 entries.",
        "Leading zeros need no flag: a padded representation such as 000512 has the same non-zero digits as 512, so the budget is measured correctly without knowing where the number really starts. That is only true because zeros are free under this particular property - the moment the property involves 'the first digit' or 'distinct digits' you need an explicit started flag.",
        "0 is counted by f (it has zero non-zero digits) but it appears in both f(r) and f(l-1) whenever l >= 1, so it cancels out of every query. Being explicit about what f includes at 0 saves an off-by-one hunt.",
        "With T up to 10^4 the per-query memset over a 400-entry table is free. Do not be tempted to keep the table between queries; it is keyed on positions of the current bound string, and even two bounds of the same length have different tight branches.",
        "R reaches 10^18, so l - 1 and every accumulator must be 64-bit; the answer for the full range is only about 6 * 10^5 but the intermediate f values are not.",
        "Time: O(T * L * 10) with L <= 19. Space: O(L).",
      ],
    },
    {
      name: "Non-negative Integers without Consecutive Ones",
      difficulty: "Hard",
      variation: "Binary digit DP with a previous-digit constraint",
      link: "https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/",
      question: [
        "Given a positive integer n, return the number of integers in the range [0, n] whose binary representation does not contain two consecutive ones.",
        "Example 1:\nInput: n = 5\nOutput: 5\nExplanation: In binary the candidates are 0, 1, 10, 11, 100, 101. Only 11 (decimal 3) has two adjacent ones, so 5 of the 6 numbers qualify.",
        "Example 2:\nInput: n = 10\nOutput: 8\nExplanation: The forbidden values in [0, 10] are 3 (11), 6 (110), 7 (111), so 11 - 3 = 8 remain.",
        "Constraints:\n- 1 <= n <= 10^9",
      ],
      code: `class Solution {
    vector<int> bit;
    long long memo[32][2][2];

    long long go(int pos, int prev, int tight) {
        if (pos == (int)bit.size()) return 1;
        long long &m = memo[pos][prev][tight];
        if (m != -1) return m;
        int lim = tight ? bit[pos] : 1;           // base 2, so the free limit is 1
        long long res = 0;
        for (int b = 0; b <= lim; b++) {
            if (b == 1 && prev == 1) continue;    // the only forbidden pair
            res += go(pos + 1, b, tight && b == lim);
        }
        return m = res;
    }

public:
    int findIntegers(int n) {
        for (int i = 30; i >= 0; i--)             // most significant bit first, no leading zeros
            if (!bit.empty() || (n >> i & 1)) bit.push_back(n >> i & 1);
        if (bit.empty()) bit.push_back(0);        // n == 0
        memset(memo, -1, sizeof memo);
        return (int)go(0, 0, 1);                  // 0 itself is valid and is counted
    }
};`,
      explanation: [
        "Digit DP is not tied to base 10. Write n in binary, most significant bit first, and the identical template applies with the digit loop running over 0..1. Everything else - the tight flag, the memo, the free-suffix collapse - is unchanged.",
        "The constraint couples adjacent positions, so the previous digit goes into the state. Once prev is known the check is local: reject b = 1 when prev = 1. Local pairwise constraints are always expressible this way, which is why 'no two adjacent equal digits', 'digits non-decreasing' and 'stepping numbers' are all the same DP with a different filter.",
        "Padding with leading zeros is safe because a leading zero can never create a forbidden pair - prev starts at 0 and a 0 digit keeps it 0. That is why this problem needs no started flag, unlike the distinct-digit variants.",
        "The tempting shortcut is the pure Fibonacci counting formula: the number of length-k binary strings with no adjacent ones is a Fibonacci number, and you can sum those while scanning n's bits, stopping at the first adjacent pair inside n itself. It is correct and O(log n) but the stopping rule is easy to get wrong; the DP encodes the same reasoning without the special case.",
        "Time: O(log n) states with 2 transitions each. Space: O(log n).",
      ],
    },
    {
      name: "Count Special Integers",
      difficulty: "Hard",
      variation: "Bitmask of used digits plus a leading-zero flag",
      link: "https://leetcode.com/problems/count-special-integers/",
      question: [
        "A positive integer is called special if no digit appears in it more than once. Given a positive integer n, return how many special integers lie in [1, n].",
        "Example 1:\nInput: n = 20\nOutput: 19\nExplanation: Every number from 1 to 20 is special except 11.",
        "Example 2:\nInput: n = 135\nOutput: 110\nExplanation: 25 numbers in [1, 135] repeat a digit, for instance 11, 22, 100 and 121.",
        "Constraints:\n- 1 <= n <= 2 * 10^9",
      ],
      code: `class Solution {
    string s;
    long long memo[12][1 << 10][2][2];
    bool seen[12][1 << 10][2][2];

    // mask: set of digits already used. started: a non-zero digit has been placed.
    long long go(int pos, int mask, int tight, int started) {
        if (pos == (int)s.size()) return started ? 1 : 0;   // reject the empty number
        if (seen[pos][mask][tight][started]) return memo[pos][mask][tight][started];
        seen[pos][mask][tight][started] = true;
        int lim = tight ? s[pos] - '0' : 9;
        long long res = 0;
        // Keep skipping: a leading zero is not a digit of the number, so mask is untouched.
        // s has no leading zero, so this branch always leaves the tight prefix.
        if (!started) res += go(pos + 1, mask, 0, 0);
        for (int d = started ? 0 : 1; d <= lim; d++) {
            if (mask >> d & 1) continue;                     // digit already used
            res += go(pos + 1, mask | 1 << d, tight && d == lim, 1);
        }
        return memo[pos][mask][tight][started] = res;
    }

public:
    int countSpecialNumbers(int n) {
        s = to_string(n);
        memset(seen, 0, sizeof seen);
        return (int)go(0, 0, 1, 0);
    }
};`,
      explanation: [
        "'All digits distinct' is a set constraint, so the set of used digits enters the state as a 10-bit mask. The state is (pos, mask, tight, started) and the transition simply refuses any digit already in the mask.",
        "The started flag is mandatory here, and this is the classic place where digit DP goes wrong. Padding 7 as 0000000007 would put digit 0 into the mask seven times and wrongly reject the number. While started is false no digit is recorded at all; the very first non-zero digit sets started and begins the mask.",
        "The skip branch passes tight = 0 deliberately. It is only reachable from a state where the chosen digit was strictly below the bound's digit, because n's own leading digit is never 0 - so no legal number is lost and none is over-counted.",
        "The combinatorial alternative counts special numbers by length with falling factorials (9 * 9 * 8 * ... ) and then handles numbers of the same length as n prefix by prefix. It is faster but every boundary must be argued separately; the mask DP is one uniform rule.",
        "Time: O(L * 2^10 * 4 * 10) which is a few hundred thousand steps. Space: O(L * 2^10).",
      ],
    },
    {
      name: "Numbers With Repeated Digits",
      difficulty: "Hard",
      variation: "Complement counting: total minus the good ones",
      link: "https://leetcode.com/problems/numbers-with-repeated-digits/",
      question: [
        "Given a positive integer n, return the number of positive integers in the range [1, n] that have at least one repeated digit.",
        "Example 1:\nInput: n = 20\nOutput: 1\nExplanation: Only 11 repeats a digit.",
        "Example 2:\nInput: n = 1000\nOutput: 262\nExplanation: There are 738 numbers in [1, 1000] with all digits distinct, and 1000 - 738 = 262.",
        "Constraints:\n- 1 <= n <= 10^9",
      ],
      code: `class Solution {
    string s;
    long long memo[12][1 << 10][2][2];
    bool seen[12][1 << 10][2][2];

    // Counts numbers in [1, n] whose digits are all distinct.
    long long distinctCount(int pos, int mask, int tight, int started) {
        if (pos == (int)s.size()) return started ? 1 : 0;
        if (seen[pos][mask][tight][started]) return memo[pos][mask][tight][started];
        seen[pos][mask][tight][started] = true;
        int lim = tight ? s[pos] - '0' : 9;
        long long res = 0;
        if (!started) res += distinctCount(pos + 1, mask, 0, 0);   // still in the leading zeros
        for (int d = started ? 0 : 1; d <= lim; d++) {
            if (mask >> d & 1) continue;
            res += distinctCount(pos + 1, mask | 1 << d, tight && d == lim, 1);
        }
        return memo[pos][mask][tight][started] = res;
    }

public:
    int numDupDigitsAtMostN(int n) {
        s = to_string(n);
        memset(seen, 0, sizeof seen);
        // Complement: everything in [1, n] minus the ones with no repeat.
        return n - (int)distinctCount(0, 0, 1, 0);
    }
};`,
      explanation: [
        "'At least one repeat' is not a state-friendly property while you are still building the number - you never know whether a repeat is still coming. Its negation is: 'all digits distinct' is checkable incrementally with a mask, and it fails permanently the moment it fails. So count the complement and subtract from n.",
        "That inversion is a general move in digit DP. Prefer the phrasing of the property that can be maintained as a monotone invariant along the prefix; 'at least one' constraints almost always become 'none' constraints by complementing.",
        "The total is n and not n + 1 because 0 is excluded from the range, and the DP correspondingly returns 0 for the all-leading-zeros path via the started check. Mixing those two conventions is what produces an answer off by exactly one.",
        "Everything else is identical to the special-integers DP, which is the point: one bank of digit DP machinery answers both the direct and the complementary question.",
        "Time: O(L * 2^10 * 4 * 10). Space: O(L * 2^10).",
      ],
    },
    {
      name: "Count Stepping Numbers in Range",
      difficulty: "Hard",
      variation: "Both bounds as strings, big-number decrement, modular answer",
      link: "https://leetcode.com/problems/count-stepping-numbers-in-range/",
      question: [
        "A positive integer is a stepping number if every pair of adjacent digits differs by exactly 1. You are given two strings low and high representing positive integers without leading zeros. Return the count of stepping numbers x with low <= x <= high, modulo 1000000007.",
        "Example 1:\nInput: low = '1', high = '11'\nOutput: 10\nExplanation: The stepping numbers in the range are 1, 2, 3, 4, 5, 6, 7, 8, 9 and 10. 11 is not one because its adjacent digits are equal.",
        "Example 2:\nInput: low = '90', high = '101'\nOutput: 2\nExplanation: Only 98 and 101 are stepping numbers in the range.",
        "Constraints:\n- 1 <= low.length, high.length <= 100\n- low and high contain only digits and have no leading zeros\n- low <= high as integers",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    string s;
    long long memo[105][11][2][2];
    bool seen[105][11][2][2];

    // prev = 10 is the sentinel for 'no digit placed yet'.
    long long go(int pos, int prev, int tight, int started) {
        if (pos == (int)s.size()) return started ? 1 : 0;
        if (seen[pos][prev][tight][started]) return memo[pos][prev][tight][started];
        seen[pos][prev][tight][started] = true;
        int lim = tight ? s[pos] - '0' : 9;
        long long res = 0;
        for (int d = 0; d <= lim; d++) {
            if (started && abs(d - prev) != 1) continue;      // stepping constraint
            if (!started && d == 0) {                          // still a leading zero
                res = (res + go(pos + 1, 10, 0, 0)) % MOD;
                continue;
            }
            res = (res + go(pos + 1, d, tight && d == lim, started || d > 0)) % MOD;
        }
        return memo[pos][prev][tight][started] = res;
    }

    long long f(const string &n) {                             // stepping numbers in [0, n]
        s = n;
        memset(seen, 0, sizeof seen);
        return go(0, 10, 1, 0);
    }

    // Decimal decrement of a positive number given as a string.
    static string dec(string t) {
        int i = (int)t.size() - 1;
        while (i >= 0 && t[i] == '0') t[i--] = '9';
        t[i]--;
        if (t[0] == '0' && t.size() > 1) t = t.substr(1);      // drop the borrowed leading zero
        return t;
    }

public:
    int countSteppingNumbers(string low, string high) {
        long long hi = f(high), lo = f(dec(low));
        return (int)((hi - lo + MOD) % MOD);
    }
};`,
      explanation: [
        "The bounds have up to 100 digits, so f(low - 1) cannot be computed numerically. Subtracting one from the decimal string is the whole adaptation: propagate the borrow through trailing zeros, decrement the first non-zero digit, and strip the leading zero it may leave behind. Everything downstream is the usual f(high) - f(low - 1).",
        "State is (pos, prev, tight, started). prev carries the last placed digit so the adjacency test is local; started distinguishes 'this position is a leading zero' from 'this position is the digit 0 inside the number', which matters because the adjacency rule must not be applied across the boundary where the number actually begins.",
        "The sentinel prev = 10 exists only to keep the array indexable while started is false. Reusing 0 as the sentinel is the classic bug: 10 would then look like a stepping number only by accident and 1 followed by 0 would be validated against a digit that was never placed.",
        "Because the answer is taken modulo a prime, the subtraction must be done in modular arithmetic with a +MOD correction - f(high) reduced can easily be smaller than f(low - 1) reduced even though the true counts are ordered.",
        "Time: O(L * 11 * 4 * 10) with L <= 100, so a few thousand steps per bound. Space: O(L * 11).",
      ],
    },
    {
      name: "Count the Number of Powerful Integers",
      difficulty: "Hard",
      variation: "Forced suffix plus a per-digit cap",
      link: "https://leetcode.com/problems/count-the-number-of-powerful-integers/",
      question: [
        "You are given three integers start, finish and limit, and a string s representing a positive integer. A positive integer x is powerful if s is a suffix of the decimal representation of x and every digit of x is at most limit. Return the number of powerful integers in the range [start, finish].",
        "Example 1:\nInput: start = 1, finish = 6000, limit = 4, s = '124'\nOutput: 5\nExplanation: The powerful integers are 124, 1124, 2124, 3124 and 4124. 5124 and above exceed limit on the leading digit, and 6124 is out of range anyway.",
        "Example 2:\nInput: start = 15, finish = 215, limit = 6, s = '10'\nOutput: 2\nExplanation: Only 110 and 210 qualify. 10 is below start, and 310 onwards exceed finish.",
        "Example 3:\nInput: start = 1000, finish = 2000, limit = 4, s = '3000'\nOutput: 0\nExplanation: No integer in the range ends with 3000.",
        "Constraints:\n- 1 <= start <= finish <= 10^15\n- 1 <= limit <= 9\n- 1 <= s.length <= floor(log10(finish)) + 1\n- every digit of s is at most limit",
      ],
      code: `class Solution {
    string num, suf;
    int cap;
    long long memo[20][2];
    bool seen[20][2];

    long long go(int pos, int tight) {
        int freeLen = (int)num.size() - (int)suf.size();
        if (pos == freeLen) {
            // The tail is forced to be suf; under a tight prefix it must not exceed num's tail.
            if (!tight) return 1;
            return num.compare(pos, suf.size(), suf) >= 0 ? 1 : 0;
        }
        if (seen[pos][tight]) return memo[pos][tight];
        seen[pos][tight] = true;
        int lim = min(tight ? num[pos] - '0' : 9, cap);   // both the bound and the cap apply
        long long res = 0;
        for (int d = 0; d <= lim; d++)
            res += go(pos + 1, tight && d == num[pos] - '0');
        return memo[pos][tight] = res;
    }

    long long count(long long n) {                        // powerful integers in [0, n]
        if (n < 0) return 0;
        num = to_string(n);
        if (num.size() < suf.size()) return 0;            // too short to end with suf
        memset(seen, 0, sizeof seen);
        return go(0, 1);
    }

public:
    long long numberOfPowerfulInt(long long start, long long finish, int limit, string s) {
        suf = s;
        cap = limit;
        return count(finish) - count(start - 1);
    }
};
`,
      explanation: [
        "Only the free prefix is a real decision; the last s.length() positions are forced to be s. So the DP recurses over the first num.size() - s.length() positions and terminates with a single comparison. If the prefix already dropped strictly below the bound, the forced tail is unconstrained and the branch contributes 1. If the prefix is still tight, the number is <= num only when the forced tail is <= num's own tail, so the branch contributes 1 exactly when num's tail is >= s - which is the compare in the code.",
        "Two independent restrictions meet at each free position: the tight bound from num and the global cap from limit. Taking the min of the two is correct because they are both upper bounds on the same digit, and crucially tight must be updated against num's digit, not against the capped limit - otherwise a digit equal to the cap but below num's digit would wrongly keep the prefix tight.",
        "Leading zeros need no flag. A padded string such as 00124 denotes 124, every pad digit 0 is <= limit, and the suffix condition is unaffected, so shorter powerful integers are counted exactly once by the length-num.size() enumeration.",
        "The early return when num is shorter than s prevents a negative freeLen, which would otherwise index past the string. This is the case that makes Example 3 answer 0.",
        "start - 1 can be 0, and count is defined on [0, n] with 0 never powerful (s is a positive integer with no leading zeros, so a padded all-zero string cannot end with s unless s is itself all zeros, which it is not).",
        "Time: O(L) states with at most 10 transitions each. Space: O(L).",
      ],
    },
    {
      name: "Find All Good Strings",
      difficulty: "Hard",
      variation: "Two-sided bounds plus a forbidden-substring automaton",
      link: "https://leetcode.com/problems/find-all-good-strings/",
      question: [
        "Given the length n and two strings s1 and s2 of length n, and a string evil, return the number of good strings. A string t is good if it has length n, s1 <= t <= s2 in lexicographic order, and t does not contain evil as a substring. Return the answer modulo 1000000007.",
        "Example 1:\nInput: n = 2, s1 = 'aa', s2 = 'da', evil = 'b'\nOutput: 51\nExplanation: There are 4 * 26 - 25 = 79 strings from 'aa' to 'da' inclusive; removing every string containing the letter b leaves 51.",
        "Example 2:\nInput: n = 2, s1 = 'gx', s2 = 'gz', evil = 'x'\nOutput: 2\nExplanation: The range holds 'gx', 'gy', 'gz'; only 'gy' and 'gz' avoid the letter x.",
        "Example 3:\nInput: n = 8, s1 = 'leetcode', s2 = 'leetgoes', evil = 'leet'\nOutput: 0\nExplanation: Every string in the range starts with 'leet'.",
        "Constraints:\n- 1 <= n <= 500\n- s1.length == s2.length == n\n- 1 <= evil.length <= 50\n- all strings consist of lowercase English letters\n- s1 <= s2",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    int n;
    string a, b, e;
    int nxt[51][26];                 // KMP automaton: matched length -> next matched length
    long long memo[501][2][2][51];
    bool seen[501][2][2][51];

    // lo: the prefix still equals s1's prefix. hi: it still equals s2's prefix.
    long long go(int pos, int lo, int hi, int k) {
        if (pos == n) return 1;
        if (seen[pos][lo][hi][k]) return memo[pos][lo][hi][k];
        seen[pos][lo][hi][k] = true;
        char from = lo ? a[pos] : 'a';
        char to = hi ? b[pos] : 'z';
        long long res = 0;
        for (char c = from; c <= to; c++) {
            int nk = nxt[k][c - 'a'];
            if (nk == (int)e.size()) continue;    // completing evil kills the branch
            res = (res + go(pos + 1, lo && c == from, hi && c == to, nk)) % MOD;
        }
        return memo[pos][lo][hi][k] = res;
    }

public:
    int findGoodStrings(int n_, string s1, string s2, string evil) {
        n = n_; a = s1; b = s2; e = evil;
        int m = e.size();
        vector<int> fail(m, 0);
        for (int i = 1; i < m; i++) {             // standard KMP failure function
            int j = fail[i - 1];
            while (j && e[i] != e[j]) j = fail[j - 1];
            if (e[i] == e[j]) j++;
            fail[i] = j;
        }
        for (int k = 0; k <= m; k++)
            for (int c = 0; c < 26; c++) {
                if (k < m && e[k] - 'a' == c) nxt[k][c] = k + 1;
                else nxt[k][c] = k ? nxt[fail[k - 1]][c] : 0;
            }
        memset(seen, 0, sizeof seen);
        return (int)go(0, 1, 1, 0);
    }
};`,
      explanation: [
        "This is digit DP over an alphabet of 26 with two bounds instead of one. The single tight flag becomes a pair: lo means the prefix still matches s1 exactly, hi means it still matches s2 exactly. The allowed range at this position is [lo ? s1[pos] : 'a', hi ? s2[pos] : 'z'], and each flag drops independently the moment its bound is left strictly behind. Keeping both is what makes the two-sided count a single pass instead of f(s2) - f(s1 - 1).",
        "The forbidden-substring condition is not a local test, so it becomes an automaton state: k is the length of the longest prefix of evil that is a suffix of what has been built. The KMP transition table turns 'append character c' into 'move from state k to state nxt[k][c]' in O(1), and reaching state evil.length() means evil just occurred, so that branch is dropped.",
        "Precomputing nxt rather than running the while-loop of KMP inside the DP is what keeps the transition constant time and, more importantly, keeps the state a pure function of (pos, lo, hi, k) - the DP needs the next state to be deterministic in order to memoize.",
        "The tempting wrong approach is inclusion-exclusion on occurrences of evil, or checking for evil only after a full string is built. The first over-counts because occurrences overlap, and the second is exponential. Pruning at the instant the automaton completes a match is both correct and cheap, since a string containing evil anywhere is rejected forever.",
        "Note that lo and hi can both be true simultaneously, which happens on the prefix shared by s1 and s2, and then the allowed range is a single character - that is exactly how Example 3 collapses to zero.",
        "Time: O(n * |evil| * 4 * 26). Space: O(n * |evil|).",
      ],
    },
  ],
};
