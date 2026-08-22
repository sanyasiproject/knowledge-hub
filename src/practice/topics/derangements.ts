import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Count Derangements (Permutation such that no element appears in its original position)",
      difficulty: "Easy",
      variation: "Subfactorial recurrence, the template",
      question: [
        "A derangement of the numbers 1..n is a permutation p in which no element stays in its own place, that is p[i] != i for every index i. Given n, return the number of derangements of 1..n. This count is written D(n) and is also called the subfactorial of n.",
        "Example 1:\nInput: n = 3\nOutput: 2\nExplanation: Of the six permutations of (1,2,3) only (2,3,1) and (3,1,2) move every element. Anything else keeps at least one number in place.",
        "Example 2:\nInput: n = 4\nOutput: 9\nExplanation: D(4) = (4-1) * (D(3) + D(2)) = 3 * (2 + 1) = 9.",
        "Constraints:\n- 0 <= n <= 20 (beyond n = 20 the answer no longer fits in a signed 64-bit integer)",
      ],
      code: `long long countDerangements(int n) {
    if (n == 0) return 1;   // the empty permutation deranges nothing, D(0) = 1
    if (n == 1) return 0;   // the single element has nowhere else to go
    vector<long long> dp(n + 1);
    dp[0] = 1;
    dp[1] = 0;
    for (int i = 2; i <= n; i++)
        dp[i] = (long long)(i - 1) * (dp[i - 1] + dp[i - 2]);   // n-1 choices, two shapes each
    return dp[n];
}`,
      explanation: [
        "State: dp[i] = number of derangements of i labelled items. The recurrence comes from asking where element i goes. It cannot stay at position i, so it lands on one of the i-1 other positions, say position j. That gives the factor (i-1).",
        "Having placed i at j, split on what happens to element j. If element j goes to position i the two swap and the remaining i-2 elements must be deranged among themselves: dp[i-2] ways. If element j does not go to position i, then j has exactly the same restriction as before (it may use any position except i), so relabelling position i as 'position j' turns the situation into a derangement of i-1 items: dp[i-1] ways. The two cases are disjoint and exhaustive, hence dp[i] = (i-1) * (dp[i-1] + dp[i-2]).",
        "The tempting wrong answer is dp[i] = (i-1) * dp[i-1], which silently forbids the swap case and undercounts badly: it gives 3 * 2 = 6 for n = 4 instead of 9.",
        "dp[0] = 1 is not a convention chosen for convenience - it is what makes the closed form and the binomial identities below work, and it matches the fact that there is exactly one way to arrange nothing.",
        "Time: O(n). Space: O(n), trivially reducible to O(1) by keeping only the last two values.",
      ],
    },
    {
      name: "Find the Derangement of An Array",
      difficulty: "Medium",
      variation: "Derangement count modulo 1e9+7, O(1) space",
      link: "https://leetcode.com/problems/find-the-derangement-of-an-array/",
      question: [
        "In combinatorial mathematics, a derangement is a permutation of the elements of a set such that no element appears in its original position. You are given an integer n. There is originally an array consisting of n integers 1..n in ascending order. Return the number of derangements of that array. Because the answer may be huge, return it modulo 10^9 + 7.",
        "Example 1:\nInput: n = 3\nOutput: 2\nExplanation: The original array is [1,2,3]. The two derangements are [2,3,1] and [3,1,2].",
        "Example 2:\nInput: n = 4\nOutput: 9\nExplanation: D(4) = 3 * (D(3) + D(2)) = 3 * (2 + 1) = 9.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `class Solution {
public:
    int findDerangement(int n) {
        const long long MOD = 1000000007LL;
        long long prev2 = 1;   // D(0)
        long long prev1 = 0;   // D(1)
        if (n == 0) return 1;
        for (int i = 2; i <= n; i++) {
            long long cur = (long long)(i - 1) % MOD * ((prev1 + prev2) % MOD) % MOD;
            prev2 = prev1;
            prev1 = cur;
        }
        return (int)prev1;
    }
};`,
      explanation: [
        "Same recurrence as the template, but n reaches 10^6 so every value must be reduced modulo 10^9 + 7 and the multiplication must happen in 64-bit. The transition reads only the previous two entries, so the O(n) table collapses to two rolling variables.",
        "Order of operations matters: reduce (prev1 + prev2) before multiplying by (i-1). Each factor is below 10^9 + 7, so the product stays under about 10^18 and fits in a signed 64-bit value. Multiplying first and reducing later is the usual overflow bug here.",
        "The alternative recurrence D(n) = n * D(n-1) + (-1)^n is also correct and one line shorter, but under a modulus the (-1)^n term has to be added as MOD - 1 on odd n, which is exactly where people slip and produce a negative result.",
        "Do not try to reach the answer as n! minus something computed by a loop over 'permutations with a fixed point' - those sets overlap, so a plain subtraction over-removes. Inclusion-exclusion, shown in a later question, is the correct way to do it in closed form.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Christmas Party",
      difficulty: "Easy",
      variation: "Judge problem, linear recurrence for n up to 1e6",
      link: "https://cses.fi/problemset/task/1717",
      question: [
        "There are n children at a Christmas party. Every child brought one present, and the presents are then redistributed so that each child receives exactly one present and nobody receives the present they themselves brought. Count the number of such distributions modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\nOutput:\n2\nExplanation: Label the children and their own presents 1,2,3. Only the two rotations (2,3,1) and (3,1,2) give everyone somebody else's present.",
        "Example 2:\nInput:\n4\nOutput:\n9\nExplanation: D(4) = 3 * (D(3) + D(2)) = 3 * (2 + 1) = 9.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    long long n;
    cin >> n;
    long long prev2 = 1, prev1 = 0;   // D(0), D(1)
    for (long long i = 2; i <= n; i++) {
        long long cur = (i - 1) % MOD * ((prev1 + prev2) % MOD) % MOD;
        prev2 = prev1;
        prev1 = cur;
    }
    cout << (n == 0 ? 1 : prev1) << "\\n";
    return 0;
}`,
      explanation: [
        "This is the hat-check problem in disguise: a distribution where nobody gets their own present is exactly a permutation with no fixed point, so the answer is D(n).",
        "Recognising the reduction is the whole difficulty. The phrase 'nobody receives their own X' is the signature of a derangement; once spotted, the linear recurrence answers n = 10^6 instantly.",
        "n = 1 must print 0, and the loop naturally handles it by never executing - a common bug is to special-case n = 1 wrongly, or to print D(0) = 1 for it.",
        "A closed-form solution with factorials is equally fast but needs modular inverses; the recurrence needs nothing but multiplication, so prefer it when only one value of n is asked for.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Christmas Party - Inclusion-Exclusion Closed Form",
      difficulty: "Medium",
      variation: "D(n) = n! * sum (-1)^k / k! with inverse factorials",
      link: "https://cses.fi/problemset/task/1717",
      question: [
        "Solve the same counting problem - permutations of 1..n with no fixed point, modulo 10^9 + 7 - but derive the answer from inclusion-exclusion instead of the recurrence, so that the same precomputation can later answer many related queries such as 'exactly k people got their own present'.",
        "Example 1:\nInput:\n4\nOutput:\n9\nExplanation: 4! * (1/0! - 1/1! + 1/2! - 1/3! + 1/4!) = 24 * (1 - 1 + 0.5 - 1/6 + 1/24) = 24 * 0.375 = 9.",
        "Example 2:\nInput:\n5\nOutput:\n44\nExplanation: 120 * (1 - 1 + 1/2 - 1/6 + 1/24 - 1/120) = 120 * (11/30) = 44.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `const long long MOD = 1000000007LL;

long long power(long long b, long long e) {
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
    vector<long long> fact(n + 1), invfact(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    invfact[n] = power(fact[n], MOD - 2);                     // Fermat inverse of n!
    for (int i = n; i >= 1; i--) invfact[i - 1] = invfact[i] * i % MOD;   // walk inverses down
    long long sum = 0;
    for (int k = 0; k <= n; k++) {
        long long term = invfact[k];
        if (k & 1) sum = (sum - term + MOD) % MOD;             // keep it non-negative
        else sum = (sum + term) % MOD;
    }
    cout << fact[n] % MOD * sum % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "Let A_i be the set of permutations that fix position i. A permutation is bad if it lies in some A_i, so D(n) = n! - |union of A_i|. Inclusion-exclusion gives |intersection of any k chosen A_i| = (n-k)!, and there are C(n,k) choices, so D(n) = sum over k of (-1)^k * C(n,k) * (n-k)!. Expanding C(n,k)*(n-k)! = n!/k! yields D(n) = n! * sum over k of (-1)^k / k!.",
        "The reason a naive 'n! - n*(n-1)!' fails is visible here: the sets A_i overlap heavily, and inclusion-exclusion is precisely the bookkeeping that removes each bad permutation exactly once.",
        "Division by k! under a prime modulus means multiplying by the modular inverse. Computing n+1 separate inverses with fast power would be O(n log MOD); inverting n! once and walking down with invfact[i-1] = invfact[i] * i is O(n + log MOD).",
        "Subtraction must be done as (sum - term + MOD) % MOD. Leaving a negative intermediate value is the classic source of a wrong answer on odd n.",
        "The side benefit is reusability: with fact and invfact in hand, the number of permutations fixing exactly k points is C(n,k) * D(n-k), and the whole family of partial-derangement queries becomes O(1) each.",
        "Time: O(n + log MOD). Space: O(n).",
      ],
    },
    {
      name: "Count Permutations with Exactly K Fixed Points",
      difficulty: "Medium",
      variation: "Partial derangement / rencontres number",
      question: [
        "Given n and k, count the permutations of 1..n that satisfy p[i] = i for exactly k indices and p[i] != i for all the others. Return the count modulo 10^9 + 7. These counts are the rencontres numbers, and k = 0 is the ordinary derangement count.",
        "Example 1:\nInput: n = 4, k = 1\nOutput: 8\nExplanation: Choose which single element is fixed - 4 ways - and derange the remaining 3, which has D(3) = 2 ways, so 4 * 2 = 8.",
        "Example 2:\nInput: n = 5, k = 2\nOutput: 20\nExplanation: C(5,2) = 10 ways to pick the fixed pair, times D(3) = 2 derangements of the rest, equals 20.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= k <= n",
      ],
      code: `const long long MOD = 1000000007LL;

long long power(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

long long countExactlyKFixed(int n, int k) {
    if (k < 0 || k > n) return 0;
    if (k == n - 1) return 0;   // fixing all but one forces that one too, so it is impossible
    vector<long long> fact(n + 1), invfact(n + 1), d(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    invfact[n] = power(fact[n], MOD - 2);
    for (int i = n; i >= 1; i--) invfact[i - 1] = invfact[i] * i % MOD;
    d[0] = 1;
    if (n >= 1) d[1] = 0;
    for (int i = 2; i <= n; i++) d[i] = (long long)(i - 1) % MOD * ((d[i - 1] + d[i - 2]) % MOD) % MOD;
    long long comb = fact[n] * invfact[k] % MOD * invfact[n - k] % MOD;
    return comb * d[n - k] % MOD;
}`,
      explanation: [
        "Split the permutation into the set of fixed points and the rest. Choosing which k indices are fixed is C(n,k); the remaining n-k indices must form a permutation of themselves with no fixed point at all, which is D(n-k) by definition. The two choices are independent, so the answer is C(n,k) * D(n-k).",
        "The word 'exactly' is what forces the D factor. If the problem said 'at least k fixed points' the answer would be a sum over j >= k of C(n,j) * D(n-j), and using C(n,k) * (n-k)! there instead would count permutations many times over - once for every superset of fixed points they contain.",
        "The impossible case is k = n-1: once n-1 elements sit in their own place, the last element has only its own place left, so the count is 0. The formula already produces this because D(1) = 0, but knowing it is a good sanity check on any implementation.",
        "Summing the answer over all k from 0 to n must give exactly n!, since every permutation has some number of fixed points. That identity, sum C(n,k) * D(n-k) = n!, is the cheapest full test of a derangement table.",
        "Time: O(n + log MOD) for the precomputation, O(1) per query afterwards. Space: O(n).",
      ],
    },
    {
      name: "Almost Identity Permutations",
      difficulty: "Medium",
      variation: "At least n-k fixed points, small k",
      link: "https://codeforces.com/problemset/problem/888/D",
      question: [
        "A permutation p of length n is called almost identity if there are at least n-k indices i such that p[i] = i. Given n and k, count the almost identity permutations of length n. The answer fits in a 64-bit integer and no modulus is applied.",
        "Example 1:\nInput: n = 4, k = 1\nOutput: 1\nExplanation: At least 3 of the 4 positions must be fixed, and fixing 3 forces the fourth, so only the identity permutation qualifies.",
        "Example 2:\nInput: n = 4, k = 2\nOutput: 7\nExplanation: The identity contributes 1, and permutations that move exactly 2 elements contribute C(4,2) * D(2) = 6 * 1 = 6, for a total of 7.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= k <= 4",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, k;
    cin >> n >> k;
    const long long d[5] = {1, 0, 1, 2, 9};   // D(0..4): only these are ever needed
    long long ans = 0, comb = 1;              // comb holds C(n, i) as i grows
    for (long long i = 0; i <= k && i <= 4; i++) {
        if (i > 0) comb = comb * (n - i + 1) / i;   // exact division in this build order
        ans += comb * d[i];
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Group the permutations by the number of moved elements i, which is n minus the number of fixed points. 'At least n-k fixed points' is exactly 'at most k moved elements', so the answer is the sum over i = 0..k of C(n,i) * D(i): pick which i elements move, then derange those i among themselves.",
        "Because k <= 4 the only derangement numbers needed are D(0)=1, D(1)=0, D(2)=1, D(3)=2, D(4)=9. The D(1) = 0 term is what encodes 'you can never move exactly one element'.",
        "The build order comb = comb * (n-i+1) / i is exact integer arithmetic at every step because C(n,i-1) * (n-i+1) is always divisible by i - reordering it into comb * (n-i+1) first and dividing at the end, or dividing before multiplying, breaks it.",
        "The tempting wrong formula is C(n,i) * i! for the moved block, which counts arrangements that leave some of the chosen i elements in place and therefore double counts against smaller i.",
        "Size check: the largest term is C(1000,4) * 9, about 3.7 * 10^11, comfortably inside a signed 64-bit integer, so no modulus is required.",
        "Time: O(k). Space: O(1).",
      ],
    },
    {
      name: "Iahub and Permutations",
      difficulty: "Hard",
      variation: "Derangement with some positions already fixed",
      link: "https://codeforces.com/problemset/problem/340/E",
      question: [
        "Iahub wrote down a permutation of 1..n that had no fixed point, meaning p[i] != i for every i, but then erased some of its entries. You are given the damaged array a of length n, where a[i] = -1 marks an erased entry and every other entry is one of the surviving values. The surviving values are distinct and none of them satisfies a[i] = i. Count how many permutations of 1..n agree with a on the surviving positions and have no fixed point anywhere. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n5\n-1 -1 4 3 -1\nOutput:\n2\nExplanation: The missing values are 1, 2, 5 and the empty positions are 1, 2, 5. Of the 6 ways to place them, only (2,5,1) and (5,1,2) at positions (1,2,5) avoid putting a value on its own index.",
        "Example 2:\nInput:\n3\n-1 -1 -1\nOutput:\n2\nExplanation: Nothing survived, so this is a plain derangement of 1..3, giving D(3) = 2.",
        "Constraints:\n- 2 <= n <= 2000\n- a[i] = -1 or 1 <= a[i] <= n, surviving values pairwise distinct\n- every surviving entry satisfies a[i] != i, and at least one valid permutation exists",
      ],
      code: `const long long MOD = 1000000007LL;

long long power(long long b, long long e) {
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
    vector<int> a(n + 1);
    vector<char> valueUsed(n + 2, 0), posFilled(n + 2, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        if (a[i] != -1) {
            valueUsed[a[i]] = 1;
            posFilled[i] = 1;
        }
    }
    int m = 0, k = 0;   // m = free slots, k = free slots whose own index is still available
    for (int i = 1; i <= n; i++) {
        if (!posFilled[i]) {
            m++;
            if (!valueUsed[i]) k++;
        }
    }
    vector<long long> fact(n + 1), invfact(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    invfact[n] = power(fact[n], MOD - 2);
    for (int i = n; i >= 1; i--) invfact[i - 1] = invfact[i] * i % MOD;
    long long ans = 0;
    for (int j = 0; j <= k; j++) {
        long long comb = fact[k] * invfact[j] % MOD * invfact[k - j] % MOD;
        long long term = comb * fact[m - j] % MOD;   // force j bad matches, free-fill the rest
        if (j & 1) ans = (ans - term + MOD) % MOD;
        else ans = (ans + term) % MOD;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The surviving entries are already legal and consume some values and some positions. What remains is a bipartite filling problem: m free positions must receive the m missing values in some order, and the only forbidden pairings are those where position i receives the value i.",
        "Not every free position is dangerous. A free position i is dangerous only if the value i is itself among the missing values; otherwise value i is already parked elsewhere and position i can take anything. Let k be the number of dangerous positions - note k <= m.",
        "Inclusion-exclusion over the dangerous positions: choosing j of them to deliberately violate costs C(k,j), after which the other m-j slots are filled freely in (m-j)! ways. Summing with alternating signs gives sum over j of (-1)^j * C(k,j) * (m-j)!. When k = m and nothing survived this is exactly the classical derangement expansion.",
        "The dominant trap is treating all m free positions as dangerous, or equivalently answering D(m). On the first example that would give D(3) = 2 by coincidence, but as soon as a surviving value occupies some index i whose slot is still open, the two answers diverge and only the k-based count is right.",
        "Time: O(n) after the factorial precomputation, since k <= n. Space: O(n).",
      ],
    },
    {
      name: "NEQ",
      difficulty: "Hard",
      variation: "Two-sequence generalised derangement",
      link: "https://atcoder.jp/contests/abc172/tasks/abc172_e",
      question: [
        "You are given integers N and M with N <= M. Count the pairs of integer sequences A and B, each of length N, satisfying all of the following: every element of A and of B lies between 1 and M inclusive; the elements of A are pairwise distinct; the elements of B are pairwise distinct; and A[i] != B[i] for every index i. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n2 2\nOutput:\n2\nExplanation: A must be a permutation of (1,2) and then B is forced to be the reverse, so the pairs are ((1,2),(2,1)) and ((2,1),(1,2)).",
        "Example 2:\nInput:\n2 3\nOutput:\n18\nExplanation: There are P(3,2) = 6 choices of A, and for each of them 3 valid choices of B by inclusion-exclusion: 6 - 2*2 + 1 = 3, so 6 * 3 = 18.",
        "Constraints:\n- 1 <= N <= M <= 5 * 10^5",
      ],
      code: `const long long MOD = 1000000007LL;

long long power(long long b, long long e) {
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
    long long n, m;
    cin >> n >> m;
    vector<long long> fact(m + 1), invfact(m + 1);
    fact[0] = 1;
    for (long long i = 1; i <= m; i++) fact[i] = fact[i - 1] * i % MOD;
    invfact[m] = power(fact[m], MOD - 2);
    for (long long i = m; i >= 1; i--) invfact[i - 1] = invfact[i] * i % MOD;
    auto perm = [&](long long a, long long b) {          // ordered choices P(a, b)
        if (b < 0 || b > a) return 0LL;
        return fact[a] * invfact[a - b] % MOD;
    };
    long long inner = 0;
    for (long long i = 0; i <= n; i++) {
        long long comb = fact[n] * invfact[i] % MOD * invfact[n - i] % MOD;
        long long term = comb * perm(m - i, n - i) % MOD;   // i positions forced to clash
        if (i & 1) inner = (inner - term + MOD) % MOD;
        else inner = (inner + term) % MOD;
    }
    cout << perm(m, n) * inner % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "Fix A first. Since its entries are distinct values from 1..M, there are P(M,N) = M!/(M-N)! choices, and by symmetry the number of valid B does not depend on which A was chosen. So the answer factors as P(M,N) times a single count of valid B.",
        "Counting B is a derangement with an enlarged value pool: B must be an injective sequence avoiding the one forbidden value A[i] at each position i. Inclusion-exclusion over the set of positions where B[i] = A[i]: choose i such positions in C(N,i) ways, which pins i distinct values, and the remaining N-i positions take distinct values from the remaining M-i values in P(M-i, N-i) ways. Alternating signs give the exact count.",
        "When M = N this degenerates to sum (-1)^i C(N,i) (N-i)! = D(N), so the classical derangement is the special case where the pool is exactly the index set - a good way to test the implementation.",
        "The trap is to think the two sequences interact beyond the per-position inequality and try a DP over used values. There is no such coupling once A is fixed, and any O(N*M) formulation dies at M = 5 * 10^5.",
        "Watch the sign handling and the guard inside perm: with i up to N the argument m-i never goes negative because N <= M, but the guard keeps the lambda safe if it is reused elsewhere.",
        "Time: O(M + log MOD). Space: O(M).",
      ],
    },
    {
      name: "Matching (Educational DP Contest, Problem O)",
      difficulty: "Hard",
      variation: "Arbitrary forbidden positions, permanent by bitmask DP",
      link: "https://atcoder.jp/contests/dp/tasks/dp_o",
      question: [
        "There are N men and N women. You are given an N x N matrix a where a[i][j] = 1 means man i and woman j are compatible and a[i][j] = 0 means they are not. Count the ways to form N pairs so that every man and every woman belongs to exactly one pair and every pair is compatible. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\n0 1 1\n1 0 1\n1 1 0\nOutput:\n2\nExplanation: The forbidden pairs are exactly the diagonal ones, so a valid matching is a derangement of 1..3, and D(3) = 2.",
        "Example 2:\nInput:\n2\n0 1\n1 0\nOutput:\n1\nExplanation: Man 1 must take woman 2 and man 2 must take woman 1, one matching in total, matching D(2) = 1.",
        "Constraints:\n- 1 <= N <= 21\n- a[i][j] is 0 or 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    int n;
    cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> a[i][j];
    vector<long long> dp(1 << n, 0);
    dp[0] = 1;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == 0) continue;
        int i = __builtin_popcount(mask);   // men 0..i-1 are already paired, man i is next
        if (i == n) continue;
        for (int j = 0; j < n; j++) {
            if (a[i][j] && !((mask >> j) & 1)) {
                int nxt = mask | (1 << j);
                dp[nxt] = (dp[nxt] + dp[mask]) % MOD;
            }
        }
    }
    cout << dp[(1 << n) - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the fully general version of the derangement question: counting permutations that avoid an arbitrary set of forbidden (position, value) pairs is the permanent of the 0/1 compatibility matrix. Derangement is the case where the forbidden set is exactly the diagonal.",
        "State: dp[mask] = number of ways to pair the first popcount(mask) men using precisely the women in mask. The index of the next man is determined by the mask, so no second dimension is needed - that observation is what keeps the table at 2^N instead of N * 2^N.",
        "Correctness relies on processing men in a fixed order. Each matching is generated exactly once, in the unique order man 0, man 1, ..., man N-1, so no double counting is possible.",
        "Why not inclusion-exclusion here? With an arbitrary forbidden set there is no clean product formula - the closed forms in the earlier questions exist only because the diagonal is so structured. Ryser's formula also computes the permanent in O(2^N * N) but is no better here and is easier to get wrong.",
        "For a diagonal-only forbidden set never run this DP: N = 21 is 2 million states times 21, while the recurrence gives D(n) in O(n) for n far larger. Reach for the permanent only when the forbidden pattern is irregular.",
        "Time: O(2^N * N). Space: O(2^N).",
      ],
    },
  ],
};
