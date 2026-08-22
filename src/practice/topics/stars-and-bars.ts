import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Distributing Apples",
      difficulty: "Easy",
      variation: "The template: identical items into distinct boxes",
      link: "https://cses.fi/problemset/task/1716",
      question: [
        "There are n children and m identical apples. Count the number of ways to distribute all m apples among the children. Children are distinguishable, apples are not, and a child may receive zero apples. Print the answer modulo 10^9 + 7.",
        "Formally, count the number of tuples (x1, x2, ..., xn) of non-negative integers with x1 + x2 + ... + xn = m.",
        "Example 1:\nInput:\n3 2\nOutput: 6\nExplanation: The six splits are (2,0,0), (0,2,0), (0,0,2), (1,1,0), (1,0,1), (0,1,1).",
        "Example 2:\nInput:\n1 5\nOutput: 1\nExplanation: With one child there is nothing to choose - that child takes all five apples.",
        "Constraints:\n- 1 <= n, m <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long power(long long b, long long e) {
    long long r = 1;
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
    long long n, m;
    cin >> n >> m;
    long long top = n + m;                 // largest factorial index we can need
    vector<long long> fact(top + 1, 1);
    for (long long i = 1; i <= top; i++) fact[i] = fact[i - 1] * i % MOD;
    long long a = n + m - 1, b = n - 1;    // answer is C(n + m - 1, n - 1)
    long long ans = fact[a] * power(fact[b], MOD - 2) % MOD;
    ans = ans * power(fact[a - b], MOD - 2) % MOD;   // Fermat inverse, MOD is prime
    cout << ans << "\\n";
}`,
      explanation: [
        "Write the distribution as a physical string: m stars for the apples and n-1 bars for the walls between children. Every arrangement of those m + n - 1 symbols is one distribution, and every distribution is one arrangement, because the number of stars in each of the n regions cut out by the bars reads off directly as x1, ..., xn. So the count is the number of ways to choose which n-1 of the m + n - 1 positions hold bars: C(m + n - 1, n - 1), equivalently C(m + n - 1, m).",
        "The bijection is the whole proof, and the two things that make it work are that stars are identical (so only counts matter) and that bars may be adjacent or sit at an end (so a child may get zero). If you demanded every child get at least one apple, bars could not touch, and the count would instead be C(m - 1, n - 1) - the gaps-between-stars version.",
        "The tempting wrong formula is C(m + n, n) or C(m + n - 1, n): both are off by one because they miscount the number of bars. Sanity-check every stars-and-bars formula on a tiny case such as n = 3, m = 2, where the answer 6 is easy to enumerate by hand.",
        "Since n and m each reach 10^6 the top index reaches 2 * 10^6, so precompute factorials linearly and get the two inverses with Fermat's little theorem. Do not build a Pascal triangle - it would need 4 * 10^12 cells.",
        "Time: O(n + m + log MOD). Space: O(n + m).",
      ],
    },
    {
      name: "Multiple Choice (AtCoder ABC 021 D)",
      difficulty: "Easy",
      variation: "Combinations with repetition",
      link: "https://atcoder.jp/contests/abc021/tasks/abc021_d",
      question: [
        "You may choose integers from 1 to n. You must make k choices in total, you are allowed to pick the same integer more than once, and the order of the choices does not matter. Count the number of distinct selections modulo 10^9 + 7.",
        "Equivalently, count the non-decreasing sequences a1 <= a2 <= ... <= ak with every ai in [1, n].",
        "Example 1:\nInput:\n3\n2\nOutput: 6\nExplanation: The multisets are {1,1}, {1,2}, {1,3}, {2,2}, {2,3}, {3,3}.",
        "Example 2:\nInput:\n2\n3\nOutput: 4\nExplanation: {1,1,1}, {1,1,2}, {1,2,2}, {2,2,2}.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= 10^5",
      ],
      code: `const long long MOD = 1000000007;

long long power(long long b, long long e) {
    long long r = 1;
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
    long long n, k;
    cin >> n >> k;
    long long top = n + k;
    vector<long long> fact(top + 1, 1);
    for (long long i = 1; i <= top; i++) fact[i] = fact[i - 1] * i % MOD;
    long long a = n + k - 1;               // answer is C(n + k - 1, k)
    long long ans = fact[a] * power(fact[k], MOD - 2) % MOD;
    ans = ans * power(fact[a - k], MOD - 2) % MOD;
    cout << ans << "\\n";
}`,
      explanation: [
        "Let ci be how many times the integer i was chosen. Then c1 + c2 + ... + cn = k with every ci >= 0, which is exactly the apples problem with n boxes and k items. The answer is therefore C(n + k - 1, k), the standard 'multiset coefficient' or combinations-with-repetition count.",
        "The other route to the same formula is the non-decreasing-sequence view: map a1 <= ... <= ak to b i = a i + (i - 1), which is strictly increasing with values in [1, n + k - 1]. That is an explicit bijection with k-subsets of a set of size n + k - 1, so the count is C(n + k - 1, k) again. Seeing both views is useful because problems disguise this pattern as either one.",
        "The classic trap is answering n^k (that counts ordered choices) or C(n, k) (that forbids repeats). Order-does-not-matter plus repeats-allowed is precisely the stars-and-bars regime, and neither of those two formulas belongs to it.",
        "Note that k may exceed n, which is fine here and is a quick signal that you are not in the C(n, k) world.",
        "Time: O(n + k + log MOD). Space: O(n + k).",
      ],
    },
    {
      name: "Unique Paths",
      difficulty: "Easy",
      variation: "Lattice paths as an arrangement of two symbol types",
      link: "https://leetcode.com/problems/unique-paths/",
      question: [
        "A robot starts at the top-left corner of an m x n grid and wants to reach the bottom-right corner. At each step it can move only one cell right or one cell down. Return the number of distinct paths.",
        "Example 1:\nInput: m = 3, n = 7\nOutput: 28\nExplanation: Every path uses exactly 2 down moves and 6 right moves, so the count is C(8, 2) = 28.",
        "Example 2:\nInput: m = 3, n = 2\nOutput: 3\nExplanation: DDR, DRD, RDD.",
        "Constraints:\n- 1 <= m, n <= 100\n- The answer is guaranteed to be at most 2 * 10^9",
      ],
      code: `int uniquePaths(int m, int n) {
    long long total = m + n - 2;           // total moves
    long long r = min(m, n) - 1;           // pick the smaller count to shorten the loop
    long long res = 1;
    for (long long i = 1; i <= r; i++) {
        res = res * (total - r + i) / i;   // exact at every step, so no rounding drift
    }
    return (int)res;
}`,
      explanation: [
        "Any path is a word in the alphabet {D, R} with exactly m-1 D's and n-1 R's, and every such word is a legal path. So the count is the number of ways to place the m-1 down moves among the m+n-2 slots: C(m + n - 2, m - 1). The 'bars' here are the down moves and the 'stars' are the right moves within each row - it is the same arrangement count wearing a grid costume.",
        "This is worth doing by formula rather than by the O(mn) DP because it shows the direction the pattern travels: whenever a DP counts sequences whose only freedom is where a fixed number of one kind of step occurs, a single binomial replaces the whole table.",
        "There is no modulus here, so overflow is the real hazard: C(198, 99) is astronomically larger than the guaranteed answer bound, so you must not compute the factorials. The multiplicative loop res = res * (total - r + i) / i is exact after each iteration because after i steps res equals C(total - r + i, i), an integer, so the division never truncates. Reordering it to divide last would overflow.",
        "Choosing r = min(m, n) - 1 uses the symmetry C(N, k) = C(N, N-k) to halve the worst-case loop and keep the intermediate values as small as possible.",
        "Time: O(min(m, n)). Space: O(1).",
      ],
    },
    {
      name: "Number of Ways to Split a String",
      difficulty: "Medium",
      variation: "Placing bars into fixed gaps",
      link: "https://leetcode.com/problems/number-of-ways-to-split-a-string/",
      question: [
        "Given a binary string s, split it into three non-empty parts s1 + s2 + s3 such that each part contains the same number of '1' characters. Return the number of ways to make the split, modulo 10^9 + 7.",
        "Example 1:\nInput: s = '10101'\nOutput: 4\nExplanation: Each part must hold exactly one '1'. The first cut can go in either of 2 places between the first and second '1', and the second cut in either of 2 places between the second and third '1', giving 2 * 2 = 4.",
        "Example 2:\nInput: s = '0000'\nOutput: 3\nExplanation: There are no '1' characters, so any two of the three internal cut positions work: C(3, 2) = 3.",
        "Constraints:\n- 3 <= s.length <= 10^5\n- s[i] is '0' or '1'",
      ],
      code: `int numWays(string s) {
    const long long MOD = 1000000007;
    long long n = s.size();
    vector<long long> ones;
    for (long long i = 0; i < n; i++) if (s[i] == '1') ones.push_back(i);
    long long t = ones.size();
    if (t % 3) return 0;                          // cannot share the ones equally
    if (t == 0) return (int)((n - 1) * (n - 2) / 2 % MOD);   // C(n-1, 2) free bar placements
    long long k = t / 3;
    long long gap1 = ones[k] - ones[k - 1];       // zeros between block 1 and block 2, plus one
    long long gap2 = ones[2 * k] - ones[2 * k - 1];
    return (int)(gap1 % MOD * (gap2 % MOD) % MOD);
}`,
      explanation: [
        "Two cuts are two bars dropped into the string. Once the total number of ones t is divisible by three, the identity of the ones in each part is forced: the first part must end after the k-th one and before the (k+1)-th, and the second part must end after the 2k-th one and before the (2k+1)-th. The only freedom left is where inside each of those two zero-runs the bar lands, and the two choices are independent, so the answer multiplies.",
        "The number of legal spots for the first bar is the number of positions strictly after index ones[k-1] and at most index ones[k] - 1, which is ones[k] - ones[k-1]. That is one more than the count of zeros in the run, because the bar may sit immediately after the k-th one. Off-by-one here is the single most common bug in this problem.",
        "The all-zeros case is a genuinely different regime and must be handled separately: nothing is forced, so you are choosing 2 of the n-1 internal boundaries freely, giving C(n-1, 2). Falling through to the multiplication path would read past the end of the ones list.",
        "The tempting wrong approach is to iterate all O(n^2) pairs of cut positions with prefix sums. It is correct but too slow at n = 10^5 in the harder variants of this shape, and it hides the fact that the answer is a product of two independent gap sizes.",
        "Time: O(n). Space: O(n) for the list of one-positions, reducible to O(1) with a single counting pass.",
      ],
    },
    {
      name: "Blue and Red Balls (AtCoder ABC 132 D)",
      difficulty: "Medium",
      variation: "Positive parts times gap selection",
      link: "https://atcoder.jp/contests/abc132/tasks/abc132_d",
      question: [
        "There are n balls in a row, k of them blue and n-k of them red. Balls of the same colour are indistinguishable. For every i from 1 to k, count the number of arrangements in which the blue balls form exactly i maximal contiguous blocks. Print the k answers on separate lines, each modulo 10^9 + 7.",
        "Example 1:\nInput:\n5 3\nOutput:\n3\n6\n1\nExplanation: With 3 blue and 2 red balls there are C(5,3) = 10 arrangements total, and 3 + 6 + 1 = 10 checks out. The single i = 3 arrangement is BRBRB.",
        "Example 2:\nInput:\n4 1\nOutput:\n4\nExplanation: One blue ball is always exactly one block, and it can sit in any of the 4 positions.",
        "Constraints:\n- 1 <= k <= n <= 2 * 10^5",
      ],
      code: `const long long MOD = 1000000007;

long long power(long long b, long long e) {
    long long r = 1;
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
    long long n, k;
    cin >> n >> k;
    vector<long long> fact(n + 2, 1), inv_fact(n + 2, 1);
    for (long long i = 1; i <= n + 1; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[n + 1] = power(fact[n + 1], MOD - 2);
    for (long long i = n + 1; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
    auto C = [&](long long a, long long b) -> long long {
        if (b < 0 || a < 0 || b > a) return 0;
        return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
    };
    for (long long i = 1; i <= k; i++) {
        // split k blues into i positive blocks, then drop those blocks into i of the n-k+1 red gaps
        cout << C(k - 1, i - 1) * C(n - k + 1, i) % MOD << "\\n";
    }
}`,
      explanation: [
        "Fix i. The arrangement is determined by two independent choices. First, how the k blue balls are split across the i blocks: that is a composition of k into i strictly positive parts, which is the positive-variables form of stars and bars, C(k - 1, i - 1) - you are choosing i-1 of the k-1 gaps between consecutive stars to hold a bar, and no two bars may share a gap because every block is non-empty.",
        "Second, where those i blocks go. Lay out the n-k red balls; they create n-k+1 gaps (including the two ends), and each blue block must occupy a distinct gap, since two blocks in the same gap would merge into one and change i. Choosing which gaps are used is C(n - k + 1, i). Multiplying the two independent counts gives the answer.",
        "This problem is the clean illustration of the two faces of the pattern: 'at least one per part' becomes C(k-1, i-1) while 'zero allowed' becomes C(k+i-1, i-1). Using the zero-allowed form for the block sizes is the classic wrong answer, because it silently counts empty blocks and so double counts arrangements that really have fewer blocks.",
        "A free correctness check that costs nothing: the k printed values must sum to C(n, k), since every arrangement has exactly one block count. If they do not, one of the two binomials is off by one.",
        "Precompute factorials and inverse factorials once with the backward inverse recurrence so each of the k queries is O(1); recomputing a modular inverse per line would add a log factor for no reason.",
        "Time: O(n + log MOD). Space: O(n).",
      ],
    },
    {
      name: "Number of Sets of K Non-Overlapping Line Segments",
      difficulty: "Medium",
      variation: "Segments and gaps collapsed into one binomial",
      link: "https://leetcode.com/problems/number-of-sets-of-k-non-overlapping-line-segments/",
      question: [
        "There are n points on a one-dimensional plane at coordinates 0, 1, ..., n-1. Draw exactly k line segments so that every segment covers two or more points (its two endpoints are distinct points) and no two segments overlap, although two segments may share an endpoint. Return the number of ways to draw them, modulo 10^9 + 7. Two ways are different if any segment differs.",
        "Example 1:\nInput: n = 4, k = 2\nOutput: 5\nExplanation: The five sets, written as endpoint pairs, are {[0,1],[1,2]}, {[0,1],[1,3]}, {[0,1],[2,3]}, {[0,2],[2,3]}, {[1,2],[2,3]}.",
        "Example 2:\nInput: n = 3, k = 1\nOutput: 3\nExplanation: The segments [0,1], [0,2] and [1,2].",
        "Constraints:\n- 2 <= n <= 1000\n- 1 <= k <= n-1",
      ],
      code: `int numberOfSets(int n, int k) {
    const long long MOD = 1000000007;
    long long a = (long long)n + k - 1, b = 2LL * k;   // answer is C(n + k - 1, 2k)
    if (b > a) return 0;
    vector<long long> fact(a + 1, 1);
    for (long long i = 1; i <= a; i++) fact[i] = fact[i - 1] * i % MOD;
    auto power = [&](long long base, long long e) {
        long long r = 1;
        while (e) {
            if (e & 1) r = r * base % MOD;
            base = base * base % MOD;
            e >>= 1;
        }
        return r;
    };
    long long ans = fact[a] * power(fact[b], MOD - 2) % MOD;
    ans = ans * power(fact[a - b], MOD - 2) % MOD;
    return (int)ans;
}`,
      explanation: [
        "A valid configuration is a sequence of coordinates a1 <= b1 <= a2 <= b2 <= ... <= ak <= bk where each segment is [ai, bi] and ai < bi. So it is a weakly increasing sequence of 2k values in [0, n-1] whose only strict inequalities are the k inside-a-segment ones. The standard trick converts weak to strict: add 0 to a1, 0 to b1, 1 to a2, 1 to b2, 2 to a3, and so on - that is, add floor(j/2) to the j-th value, 0-indexed. The k already-strict inequalities stay strict and the k-1 shared-endpoint ties become strict, so the result is a strictly increasing 2k-tuple in [0, n + k - 2]. Hence the answer is C(n + k - 1, 2k).",
        "The equivalent stars-and-bars reading: let g0 be the gap before the first segment, L1..Lk the segment lengths (each >= 1), and g1..g(k-1) the gaps between consecutive segments and gk after the last, all >= 0. Then sum of everything is n-1. Substituting Li = Li' + 1 to make all variables non-negative leaves a total of n - 1 - k spread over 2k + 1 non-negative variables, giving C(n - 1 - k + 2k, 2k) = C(n + k - 1, 2k). Both derivations must land on the same binomial, which is a good place to catch an off-by-one.",
        "The obvious O(n * k) DP with a 'segment open / closed' state also works within the constraints, and is the safer answer under interview pressure. The point of the closed form is to recognise that adjacency-allowed non-overlapping placements are just a weak-to-strict conversion away from a plain subset count.",
        "The main trap is treating the segments as ordered or as allowed to be empty. They are an unordered set, and the derivation above already imposes an order by sorting, so no k! factor appears anywhere; and 'covers two or more points' is what forces each length to be at least 1.",
        "Time: O(n + k + log MOD). Space: O(n + k).",
      ],
    },
    {
      name: "Distribute Candies Among Children II",
      difficulty: "Medium",
      variation: "Upper bounds via inclusion-exclusion",
      link: "https://leetcode.com/problems/distribute-candies-among-children-ii/",
      question: [
        "You are given two positive integers n and limit. Count the total number of ways to distribute n identical candies among 3 children so that no child receives more than limit candies. Every candy must be handed out, and a child may receive zero.",
        "Example 1:\nInput: n = 5, limit = 2\nOutput: 3\nExplanation: The valid triples are (1,2,2), (2,1,2) and (2,2,1).",
        "Example 2:\nInput: n = 3, limit = 3\nOutput: 10\nExplanation: The limit never bites, so this is the unrestricted count C(3 + 2, 2) = 10.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= limit <= 10^6",
      ],
      code: `class Solution {
    // number of non-negative solutions of x + y + z = t, i.e. C(t + 2, 2)
    long long ways(long long t) {
        if (t < 0) return 0;
        return (t + 1) * (t + 2) / 2;
    }

public:
    long long distributeCandies(int n, int limit) {
        long long L = (long long)limit + 1;    // "child i is over the limit" means it got >= L
        long long ans = ways(n);
        ans -= 3 * ways(n - L);                // subtract each single violation
        ans += 3 * ways(n - 2 * L);            // add back double-counted pairs
        ans -= ways(n - 3 * L);                // remove the triple overlap
        return ans;
    }
};`,
      explanation: [
        "Start from the unrestricted stars-and-bars count of x + y + z = n with all variables non-negative, which is C(n + 2, 2). Then remove the arrangements that break a ceiling. Let Ai be the set where child i gets at least limit+1 candies. Forcing that is a substitution: pre-pay limit+1 candies to child i and distribute the remaining n - (limit+1) freely, so |Ai| = C(n - L + 2, 2) with L = limit + 1. The same pre-payment trick applied twice or three times gives the intersections.",
        "Inclusion-exclusion then reads |A1 u A2 u A3| = 3|A1| - 3|A1 n A2| + |A1 n A2 n A3| by symmetry, and the answer is the unrestricted count minus that. Every term is a shifted version of the same C(t+2, 2), which is why the whole solution is four evaluations of one helper.",
        "Clamping the helper to 0 when its argument is negative is not a convenience, it is required: a negative remainder means that violation is impossible, and plugging the negative t into (t+1)(t+2)/2 gives a nonzero garbage value (t = -3 gives 1, for instance) that silently corrupts the answer.",
        "The tempting wrong approach is looping over one child's share and adding a clamped range for the other two. That is workable for three children but O(n) and it does not generalise; the inclusion-exclusion form is O(1) here and extends to k children as a sum over j of (-1)^j C(k, j) C(n - jL + k - 1, k - 1), which is the general answer to 'stars and bars with upper bounds'.",
        "Use 64-bit arithmetic throughout: C(10^6 + 2, 2) is about 5 * 10^11, well past a 32-bit int, and the LeetCode signature returns long long for exactly this reason.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Number of Dice Rolls With Target Sum",
      difficulty: "Medium",
      variation: "Lower and upper bounds on every variable",
      link: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
      question: [
        "You have n dice, and each die has k faces numbered from 1 to k. Return the number of ways to roll the dice so that the sum of the face-up numbers equals target. Two ways differ if any single die shows a different number. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: One die, one way to show a 3.",
        "Example 2:\nInput: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.",
        "Constraints:\n- 1 <= n, k <= 30\n- 1 <= target <= 1000",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    vector<long long> fact, inv_fact;

    long long power(long long b, long long e) {
        long long r = 1;
        while (e) {
            if (e & 1) r = r * b % MOD;
            b = b * b % MOD;
            e >>= 1;
        }
        return r;
    }

    long long C(long long a, long long b) {
        if (a < 0 || b < 0 || b > a) return 0;
        return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
    }

public:
    int numRollsToTarget(int n, int k, int target) {
        int top = target + n + 5;
        fact.assign(top, 1);
        for (int i = 1; i < top; i++) fact[i] = fact[i - 1] * i % MOD;
        inv_fact.assign(top, 1);
        inv_fact[top - 1] = power(fact[top - 1], MOD - 2);
        for (int i = top - 1; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;

        long long m = (long long)target - n;   // after y_i = x_i - 1, each y_i is in [0, k-1]
        long long ans = 0;
        for (int j = 0; j <= n; j++) {
            long long t = m - (long long)j * k;   // force j chosen dice to exceed k-1
            if (t < 0) break;
            long long term = C(n, j) * C(t + n - 1, n - 1) % MOD;
            if (j & 1) ans = (ans - term + MOD) % MOD;
            else ans = (ans + term) % MOD;
        }
        return (int)ans;
    }
};`,
      explanation: [
        "Each die contributes an integer in [1, k], so this is stars and bars with both a floor and a ceiling on every variable. Handle the floor by substitution: set yi = xi - 1, which turns the equation into y1 + ... + yn = target - n with every yi in [0, k-1]. Floors are always free - you just pre-pay the minimum for each variable and reduce the total.",
        "Ceilings are not free, so peel them off with inclusion-exclusion. Choosing which j of the n dice are declared 'too large' costs C(n, j) ways, and forcing a chosen die to satisfy yi >= k pre-pays k more from the total. What remains is an unrestricted stars-and-bars count C(t + n - 1, n - 1) with t = target - n - jk, and the signs alternate. The break when t goes negative is just an early exit; those terms are all zero.",
        "The reason inclusion-exclusion is needed at all is that the sets 'die 1 overflows' and 'die 2 overflows' can happen simultaneously, and the naive subtraction of n single-overflow counts removes those arrangements twice. Subtracting once and stopping is the classic wrong answer, and it shows up as a negative result on inputs like n = 3, k = 2, target = 4.",
        "Under these constraints the O(n * target * k) DP is the expected interview answer and is simpler to get right. The closed form matters when n or target grows past what a table allows, and it is the reusable piece: bounded stars and bars is always 'substitute away the floors, inclusion-exclude the ceilings'.",
        "Keep the running total non-negative by adding MOD before each subtraction, otherwise a negative intermediate poisons every later term.",
        "Time: O(n + target) for the factorials plus O(n) terms. Space: O(n + target).",
      ],
    },
    {
      name: "Count Ways to Make Array With Product",
      difficulty: "Hard",
      variation: "Distributing prime exponents independently",
      link: "https://leetcode.com/problems/count-ways-to-make-array-with-product/",
      question: [
        "You are given a 2D array of queries where queries[i] = [ni, ki]. For each query, count the number of arrays of ni positive integers whose product is exactly ki. Return an array of the answers, each modulo 10^9 + 7.",
        "Example 1:\nInput: queries = [[2,6],[5,1]]\nOutput: [4,1]\nExplanation: For [2,6] the arrays are [1,6], [2,3], [3,2], [6,1]. For [5,1] every entry must be 1, so there is exactly one array.",
        "Example 2:\nInput: queries = [[1,1],[2,2],[3,3],[4,4],[5,5]]\nOutput: [1,2,3,10,5]\nExplanation: For [4,4], 4 = 2^2 and the two factors of 2 are spread over 4 slots in C(2 + 3, 3) = 10 ways.",
        "Constraints:\n- 1 <= queries.length <= 10^4\n- 1 <= ni, ki <= 10^4",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    vector<long long> fact, inv_fact;

    long long power(long long b, long long e) {
        long long r = 1;
        while (e) {
            if (e & 1) r = r * b % MOD;
            b = b * b % MOD;
            e >>= 1;
        }
        return r;
    }

    long long C(long long a, long long b) {
        if (a < 0 || b < 0 || b > a) return 0;
        return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
    }

public:
    vector<int> waysToFillArray(vector<vector<int>>& queries) {
        const int TOP = 10040;             // n <= 10^4 and any exponent is <= 13
        fact.assign(TOP, 1);
        for (int i = 1; i < TOP; i++) fact[i] = fact[i - 1] * i % MOD;
        inv_fact.assign(TOP, 1);
        inv_fact[TOP - 1] = power(fact[TOP - 1], MOD - 2);
        for (int i = TOP - 1; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;

        vector<int> res;
        res.reserve(queries.size());
        for (auto& q : queries) {
            long long n = q[0], k = q[1], ans = 1;
            for (long long p = 2; p * p <= k; p++) {
                if (k % p) continue;
                long long e = 0;
                while (k % p == 0) { k /= p; e++; }
                ans = ans * C(e + n - 1, n - 1) % MOD;   // spread e copies of p over n slots
            }
            if (k > 1) ans = ans * (n % MOD) % MOD;      // leftover prime, exponent 1: C(n, n-1) = n
            res.push_back((int)ans);
        }
        return res;
    }
};`,
      explanation: [
        "Write k = p1^e1 * p2^e2 * ... An array of n positive integers with product k is exactly a choice, for each prime pi, of how its ei copies are dealt out to the n array slots. Those choices are independent across primes, because a slot's value is just the product of whatever primes landed in it and any combination of per-prime deals yields a distinct array. So the answer is the product over primes of the number of ways to write ei as an ordered sum of n non-negative integers, which is C(ei + n - 1, n - 1).",
        "This is the multiplicative face of stars and bars: 'distribute identical items into distinct boxes' becomes 'distribute identical prime factors into distinct positions'. Recognising it turns an apparently hard counting problem into one binomial per prime. Note that entries equal to 1 need no special treatment - a slot that received nothing simply holds 1, which is why the non-negative form and not the positive form is correct here.",
        "Trial division to sqrt(k) is enough at k <= 10^4, and the leftover k > 1 after the loop is a single prime with exponent 1, contributing C(n, n-1) = n. Forgetting that leftover is the standard bug and it makes every prime answer come out as 1.",
        "The factorial table must reach n + max exponent. Since 2^13 = 8192 <= 10^4 < 2^14, no exponent exceeds 13, so n + 13 <= 10013 and a table of about 10^4 entries built once serves all 10^4 queries in O(1) each. Rebuilding factorials inside the query loop is what turns a fast solution into a timeout.",
        "Time: O(TOP + Q * sqrt(maxK)). Space: O(TOP).",
      ],
    },
    {
      name: "Count the Number of Ideal Arrays",
      difficulty: "Hard",
      variation: "Compositions layered on divisibility chains",
      link: "https://leetcode.com/problems/count-the-number-of-ideal-arrays/",
      question: [
        "Call an array arr of length n ideal if every entry lies in [1, maxValue] and every entry divides the next, that is arr[i] divides arr[i+1] for all valid i. Return the number of distinct ideal arrays of length n, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 2, maxValue = 5\nOutput: 10\nExplanation: The 5 constant arrays [x,x], plus [1,2], [1,3], [1,4], [1,5], [2,4].",
        "Example 2:\nInput: n = 5, maxValue = 3\nOutput: 11\nExplanation: The 3 constant arrays, plus the 8 arrays that use exactly one strict increase: 4 placements each for the value pair (1,2) and for (1,3).",
        "Constraints:\n- 2 <= n <= 10^4\n- 1 <= maxValue <= 10^4",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;

    long long power(long long b, long long e) {
        long long r = 1;
        while (e) {
            if (e & 1) r = r * b % MOD;
            b = b * b % MOD;
            e >>= 1;
        }
        return r;
    }

public:
    int idealArrays(int n, int maxValue) {
        // an ideal array is non-decreasing, so it is a strict divisibility chain
        // of some length m, plus a choice of where the m-1 jumps sit among n-1 gaps
        int maxLen = 1;
        while ((1LL << maxLen) <= maxValue) maxLen++;   // each strict step at least doubles

        vector<long long> fact(n + 1, 1), inv_fact(n + 1, 1);
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
        inv_fact[n] = power(fact[n], MOD - 2);
        for (int i = n; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
        auto C = [&](long long a, long long b) -> long long {
            if (a < 0 || b < 0 || b > a) return 0;
            return fact[a] * inv_fact[b] % MOD * inv_fact[a - b] % MOD;
        };

        vector<long long> f(maxValue + 1, 1), g(maxValue + 1, 0);   // f[v]: chains of length m ending at v
        long long ans = 0;
        for (int m = 1; m <= maxLen && m <= n; m++) {
            long long chains = 0;
            for (int v = 1; v <= maxValue; v++) chains = (chains + f[v]) % MOD;
            ans = (ans + chains * C(n - 1, m - 1)) % MOD;
            fill(g.begin(), g.end(), 0LL);
            for (int v = 1; v <= maxValue; v++)
                if (f[v])
                    for (int w = 2 * v; w <= maxValue; w += v) g[w] = (g[w] + f[v]) % MOD;
            f.swap(g);
        }
        return (int)ans;
    }
};`,
      explanation: [
        "Divisibility forces the array to be non-decreasing, so an ideal array is fully described by two independent pieces: the sequence of distinct values it visits, which must be a strict divisibility chain v1 | v2 | ... | vm with all vi <= maxValue, and the pattern of repetitions. Given the chain, choosing the array means choosing which m-1 of the n-1 adjacent gaps hold a jump, which is C(n - 1, m - 1) - the positive-parts form of stars and bars, since each of the m runs must be non-empty.",
        "Summing chains[m] * C(n - 1, m - 1) over m is therefore exact, with no double counting, because the (chain, jump-position) pair is recoverable from the array: the chain is its sorted distinct values and the jumps are where consecutive entries differ.",
        "chains[m] comes from a layered sieve DP. Start with f[v] = 1 for every v, meaning one chain of length 1 ending at v, then push each f[v] to every proper multiple of v to advance the chain by one strict step. The sieve-style inner loop costs O(maxValue log maxValue) per layer.",
        "The bound on m is what makes this cheap: a strict divisibility step at least doubles the value, so m <= floor(log2(maxValue)) + 1, at most 14 layers here. Without that cutoff you would loop m up to n = 10^4 over all-zero tables. Note that only m <= n matters as well, since an array of length n cannot visit more than n distinct values.",
        "The tempting wrong model is a DP over (position, value), which is O(n * maxValue log maxValue) and too slow, and it also misses the insight that the positions of the jumps are independent of which values are used. Factoring the count into 'shape' times 'placement' is the reusable idea.",
        "Time: O(maxValue * log(maxValue) * log(maxValue) + n). Space: O(maxValue + n).",
      ],
    },
  ],
};
