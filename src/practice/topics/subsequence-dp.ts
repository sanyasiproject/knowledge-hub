import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Is Subsequence",
      difficulty: "Easy",
      variation: "Subsequence matching, the baseline",
      link: "https://leetcode.com/problems/is-subsequence/",
      question: [
        "Given two strings s and t, return true if s is a subsequence of t. A subsequence is formed by deleting zero or more characters from the original string without changing the relative order of the remaining characters.",
        "Example 1:\nInput: s = 'abc', t = 'ahbgdc'\nOutput: true\nExplanation: Keep positions 0, 2 and 5 of t.",
        "Example 2:\nInput: s = 'axc', t = 'ahbgdc'\nOutput: false\nExplanation: After matching 'a' there is no 'x' left in t.",
        "Constraints:\n- 0 <= s.length <= 100\n- 0 <= t.length <= 10^4\n- Both strings consist of lowercase English letters",
      ],
      code: `bool isSubsequence(string s, string t) {
    int i = 0;
    for (char c : t) {
        // match greedily at the earliest possible position
        if (i < (int)s.size() && s[i] == c) i++;
    }
    return i == (int)s.size();
}`,
      explanation: [
        "Every subsequence-counting DP rests on one decision made at each position of the container string: use this character to match the current target character, or skip it. This problem is that decision stripped down to a yes/no answer.",
        "Greedy works here because of an exchange argument: if some valid embedding matches s[i] at position p, and the earliest available match is at q <= p, then swapping p for q leaves the rest of the suffix at least as long, so the greedy choice is never worse. That is why no DP table is needed for feasibility.",
        "The tempting wrong move is to count matching characters with a frequency map. That answers 'is s a permutation-subset of t', which ignores order: s = 'ba', t = 'ab' passes the frequency test but is not a subsequence.",
        "The moment the question changes from 'does one embedding exist' to 'how many embeddings exist', greedy dies and you must keep a table over (prefix of t, prefix of s) - that is the Distinct Subsequences problem later in this bank.",
        "Time: O(|s| + |t|). Space: O(1).",
      ],
    },
    {
      name: "Perfect Sum Problem",
      difficulty: "Medium",
      variation: "Counting subsequences with a target sum, zeros included",
      question: [
        "Given an array arr of non-negative integers and an integer target, count the number of subsequences of arr whose elements sum to exactly target. Two subsequences are different when they use different sets of indices, so equal values and zeros still produce distinct subsequences. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: arr = [5, 2, 3, 10, 6, 8], target = 10\nOutput: 3\nExplanation: The subsequences are [5, 2, 3], [2, 8] and [10].",
        "Example 2:\nInput: arr = [0, 0, 1], target = 1\nOutput: 4\nExplanation: [1], [0(index 0), 1], [0(index 1), 1] and [0, 0, 1]. Each zero can be taken or skipped independently.",
        "Constraints:\n- 1 <= arr.length <= 10^3\n- 0 <= arr[i] <= 10^3\n- 0 <= target <= 10^3",
      ],
      code: `int perfectSum(vector<int>& arr, int target) {
    const long long MOD = 1000000007LL;
    vector<long long> dp(target + 1, 0);
    dp[0] = 1;                     // the empty subsequence sums to 0
    for (int x : arr) {
        // descending j keeps dp[j - x] on the previous item's row, so x is used at most once
        for (int j = target; j >= x; j--)
            dp[j] = (dp[j] + dp[j - x]) % MOD;
    }
    return (int)dp[target];
}`,
      explanation: [
        "State: dp[j] = number of subsequences of the items processed so far that sum to j. Transition per item x is pure include/exclude - the new dp[j] is the old dp[j] (skip x) plus the old dp[j - x] (take x). Those two families are disjoint because they differ on whether index of x is present, so adding them never double counts.",
        "The 1D rolling array is only correct with the descending inner loop. Ascending would let dp[j - x] already contain x, turning the count into an unbounded-knapsack count where an item may be reused.",
        "dp[0] = 1 is the load-bearing base case: exactly one subsequence (the empty one) sums to zero. Setting it to 0 zeroes the whole table.",
        "Zeros are the classic trap. With x = 0 the inner loop runs down to j = 0 and performs dp[j] += dp[j], doubling every count - which is exactly right, since taking or skipping a zero gives two different index sets. Code that special-cases zeros by skipping them undercounts; code that only counts non-empty subsequences must subtract the empty one when target is 0.",
        "Time: O(n * target). Space: O(target).",
      ],
    },
    {
      name: "Number of Subsequences That Satisfy the Given Sum Condition",
      difficulty: "Medium",
      variation: "Counting by fixing the minimum, powers of two",
      link: "https://leetcode.com/problems/number-of-subsequences-that-satisfy-the-given-sum-condition/",
      question: [
        "Given an array nums and an integer target, return the number of non-empty subsequences of nums such that the sum of the minimum and maximum element of the subsequence is less than or equal to target. Return the answer modulo 10^9 + 7.",
        "Example 1:\nInput: nums = [3, 5, 6, 7], target = 9\nOutput: 4\nExplanation: [3], [3,5], [3,6] and [3,5,6]. Any subsequence containing 7 has min + max >= 10, and [5] alone gives 10.",
        "Example 2:\nInput: nums = [3, 3, 6, 8], target = 10\nOutput: 6\nExplanation: Sorted the array is [3,3,6,8]. Fixing the first 3 as the minimum with maximum at most 6 allows any subset of the two elements between them, giving 4; fixing the second 3 gives 2.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^6\n- 1 <= target <= 10^6",
      ],
      code: `int numSubseq(vector<int>& nums, int target) {
    const int MOD = 1000000007;
    int n = nums.size();
    sort(nums.begin(), nums.end());   // only min and max matter, so order is free
    vector<int> pow2(n);
    pow2[0] = 1;
    for (int i = 1; i < n; i++) pow2[i] = (int)((2LL * pow2[i - 1]) % MOD);
    int l = 0, r = n - 1;
    long long ans = 0;
    while (l <= r) {
        if (nums[l] + nums[r] > target) {
            r--;                      // nums[r] can never be the maximum of a valid subsequence
        } else {
            ans = (ans + pow2[r - l]) % MOD;   // l is the min, any subset of (l, r] joins freely
            l++;
        }
    }
    return (int)ans;
}`,
      explanation: [
        "The condition depends only on the smallest and largest chosen value, never on the positions, so sorting is allowed even though the problem says 'subsequence'. After sorting, a subsequence is characterised by its leftmost index l and its rightmost index r.",
        "Count by fixing the minimum. If nums[l] + nums[r] <= target then every subset of the r - l elements strictly after l is a valid companion set (its own maximum is at most nums[r]), which is 2^(r-l) subsequences, and l itself is always taken. Each subsequence is counted exactly once because its minimum index is unique.",
        "The two-pointer shrink is monotone: once nums[l] + nums[r] exceeds target, nums[r] is too big for every l' >= l too, so r can be dropped permanently. That gives one linear pass instead of a binary search per l.",
        "The wrong-but-tempting approach is a subset-sum style DP over sums; the sums here reach 10^11 and the answer does not depend on the total at all. Also note the powers of two must be precomputed modularly - computing 2^(r-l) with pow each step is both slow and overflow-prone.",
        "Time: O(n log n) for the sort, O(n) afterwards. Space: O(n) for the power table.",
      ],
    },
    {
      name: "Longest Palindromic Subsequence",
      difficulty: "Medium",
      variation: "Optimising over subsequences on intervals",
      link: "https://leetcode.com/problems/longest-palindromic-subsequence/",
      question: [
        "Given a string s, return the length of the longest palindromic subsequence of s. A subsequence is obtained by deleting characters without reordering the rest, and a palindrome reads the same forwards and backwards.",
        "Example 1:\nInput: s = 'bbbab'\nOutput: 4\nExplanation: 'bbbb' is a palindromic subsequence.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 2\nExplanation: 'bb'.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int i = 0, j = len - 1; j < n; i++, j++) {
            if (s[i] == s[j])
                dp[i][j] = 2 + (len == 2 ? 0 : dp[i + 1][j - 1]);   // wrap the inner answer
            else
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);         // drop one end
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "State: dp[i][j] = length of the longest palindromic subsequence inside s[i..j]. The state is an interval rather than a prefix, because a palindrome is constrained from both ends at once.",
        "Transition correctness: if s[i] == s[j] there is always an optimal answer that uses both, since any palindrome inside s[i+1..j-1] can be wrapped by that matching pair to gain 2, and no palindrome in s[i..j] can beat that. If they differ, they cannot both be endpoints of the same palindrome, so at least one is unused and the answer is the better of the two shrunken intervals.",
        "Iterating by increasing interval length is what makes the tabulation legal - dp[i+1][j-1], dp[i+1][j] and dp[i][j-1] are all shorter intervals and therefore already final.",
        "A neat equivalent is LCS(s, reverse(s)), and it gives the same number, but the interval DP generalises to the counting versions that follow while the LCS trick does not.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n) with two rolling rows.",
      ],
    },
    {
      name: "Count Palindromic Subsequences",
      difficulty: "Medium",
      variation: "Counting on intervals with inclusion-exclusion",
      question: [
        "Given a string s, count the number of non-empty palindromic subsequences of s. Subsequences chosen at different index sets are counted separately even when the resulting strings are equal. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: s = 'aab'\nOutput: 4\nExplanation: 'a' (index 0), 'a' (index 1), 'b', and 'aa'.",
        "Example 2:\nInput: s = 'aaa'\nOutput: 7\nExplanation: three single characters, three pairs, and 'aaa'.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `int countPS(string s) {
    const long long MOD = 1000000007LL;
    int n = s.size();
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int i = 0, j = len - 1; j < n; i++, j++) {
            long long inner = (len == 2) ? 0 : dp[i + 1][j - 1];
            if (s[i] == s[j])
                dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] + 1) % MOD;   // inner set counted twice on purpose
            else
                dp[i][j] = ((dp[i + 1][j] + dp[i][j - 1] - inner) % MOD + MOD) % MOD;
        }
    }
    return (int)dp[0][n - 1];
}`,
      explanation: [
        "State: dp[i][j] = number of non-empty palindromic subsequences inside s[i..j], counted by index set. Unlike the length version, the transition needs inclusion-exclusion because dp[i+1][j] and dp[i][j-1] both contain every palindrome of s[i+1..j-1].",
        "When s[i] != s[j]: no palindrome uses both endpoints, so the union of 'lives in s[i+1..j]' and 'lives in s[i..j-1]' covers everything, and their intersection is exactly s[i+1..j-1]. Subtract it once.",
        "When s[i] == s[j]: the overlap is not subtracted, and that is deliberate rather than a bug. Every palindrome p inside s[i+1..j-1] yields a second, distinct palindrome s[i] + p + s[j]; leaving the overlap in place counts each such p twice, once as itself and once as its wrapped version. The extra +1 accounts for the two-character palindrome s[i]s[j] itself, whose inner part is empty.",
        "The trap is mixing this up with counting distinct palindromic strings (LeetCode 730), where two different index sets giving 'aa' must collapse to one. That problem needs a different recurrence based on the first and last occurrence of each letter, not this one.",
        "Because of the subtraction, intermediate values can go negative under the modulus; always add MOD back before storing.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Unique Length-3 Palindromic Subsequences",
      difficulty: "Medium",
      variation: "Dedupe by fixing the outer pair",
      link: "https://leetcode.com/problems/unique-length-3-palindromic-subsequences/",
      question: [
        "Given a string s, return the number of unique palindromic subsequences of length three that appear in s. Two subsequences are the same if they spell the same string, so each distinct string counts once no matter how many index sets produce it.",
        "Example 1:\nInput: s = 'aabca'\nOutput: 3\nExplanation: The distinct length-3 palindromes are 'aba', 'aaa' and 'aca'.",
        "Example 2:\nInput: s = 'adc'\nOutput: 0\nExplanation: No character repeats, so no palindrome of length three exists.",
        "Constraints:\n- 3 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `int countPalindromicSubsequence(string s) {
    int n = s.size(), ans = 0;
    for (char c = 'a'; c <= 'z'; c++) {
        int first = -1, last = -1;
        for (int i = 0; i < n; i++)
            if (s[i] == c) { if (first < 0) first = i; last = i; }
        if (first < 0 || last - first < 2) continue;   // need at least one slot in between
        int seen = 0;
        for (int i = first + 1; i < last; i++) seen |= 1 << (s[i] - 'a');
        ans += __builtin_popcount(seen);              // each distinct middle letter is one answer
    }
    return ans;
}`,
      explanation: [
        "A length-3 palindrome is fully described by two letters: the repeated outer letter c and the middle letter m. So the answer is the number of pairs (c, m) that are realisable, and the whole problem is a deduplication exercise rather than a counting DP.",
        "Widest window argument: the pair (c, m) is realisable if and only if m occurs strictly between the first and the last occurrence of c. Any narrower window of two c's is contained in that widest one, so checking only first and last loses nothing and gains nothing wrong.",
        "The tempting mistake is to count index triples - that returns the number of embeddings, not the number of distinct strings, and blows up on inputs like 100000 copies of 'a'. Whenever a problem says 'unique' or 'distinct', the state must be keyed on the string content (here the pair of letters), never on positions.",
        "The 26 outer passes make this linear in practice; a single pass keeping first-occurrence, last-occurrence and a per-letter bitmask of interior letters is possible but not needed at these limits.",
        "Time: O(26 * n). Space: O(1).",
      ],
    },
    {
      name: "Distinct Subsequences",
      difficulty: "Hard",
      variation: "Counting embeddings of a target string",
      link: "https://leetcode.com/problems/distinct-subsequences/",
      question: [
        "Given two strings s and t, return the number of distinct subsequences of s which equal t. Two subsequences are distinct when they use different sets of indices of s, even though they spell the same string t. The answer is guaranteed to fit in a 32-bit signed integer.",
        "Example 1:\nInput: s = 'rabbbit', t = 'rabbit'\nOutput: 3\nExplanation: There are three ways to choose which of the three b's is dropped.",
        "Example 2:\nInput: s = 'babgbag', t = 'bag'\nOutput: 5",
        "Constraints:\n- 1 <= s.length, t.length <= 1000\n- s and t consist of English letters",
      ],
      code: `int numDistinct(string s, string t) {
    int n = s.size(), m = t.size();
    // dp[j] = number of ways the processed prefix of s forms the first j characters of t
    vector<unsigned long long> dp(m + 1, 0);
    dp[0] = 1;                       // the empty target is formed exactly one way
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= 1; j--)  // descending so dp[j - 1] is still the previous row
            if (s[i - 1] == t[j - 1]) dp[j] += dp[j - 1];
    return (int)dp[m];
}`,
      explanation: [
        "State: dp[i][j] = number of ways to pick indices from s[0..i-1] that spell t[0..j-1]. Transition splits on whether s[i-1] is used: never using it gives dp[i-1][j], and using it is only possible when s[i-1] == t[j-1], contributing dp[i-1][j-1]. The two families are disjoint by construction, so they add.",
        "dp[i][0] = 1 for every i is the base case that carries the count: the empty target is matched by choosing nothing, in exactly one way. dp[0][j] = 0 for j >= 1, since a non-empty target cannot come from an empty source.",
        "In the rolled 1D version the skip case dp[i][j] = dp[i-1][j] becomes a no-op (dp[j] simply stays), which is why the loop only touches dp[j] on a character match. The inner loop must run downwards; going upwards would read a dp[j-1] that already belongs to row i, letting the same character of s match two positions of t.",
        "The tempting wrong approach is greedy or two-pointer matching, which answers the existence question of 'Is Subsequence' and returns 1 whenever a match exists. Counting genuinely needs the table.",
        "Intermediate sums can exceed the final answer's range on adversarial inputs, so accumulate in 64-bit even though the result fits in an int.",
        "Time: O(n * m). Space: O(m).",
      ],
    },
    {
      name: "Count Number of Special Subsequences",
      difficulty: "Hard",
      variation: "Layered automaton counting",
      link: "https://leetcode.com/problems/count-number-of-special-subsequences/",
      question: [
        "A sequence is special if it consists of a positive number of 0s, followed by a positive number of 1s, followed by a positive number of 2s, and nothing else. Given an array nums containing only 0, 1 and 2, count the number of special subsequences of nums. Two subsequences are different when they use different sets of indices. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: nums = [0, 1, 2, 2]\nOutput: 3\nExplanation: [0,1,2] using the first 2, [0,1,2] using the second 2, and [0,1,2,2].",
        "Example 2:\nInput: nums = [0, 1, 2, 0, 1, 2]\nOutput: 7",
        "Example 3:\nInput: nums = [2, 2, 0, 0]\nOutput: 0\nExplanation: No 1 is available, and no 2 comes after a 0.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] <= 2",
      ],
      code: `int countSpecialSubsequences(vector<int>& nums) {
    const long long MOD = 1000000007LL;
    // d0/d1/d2: subsequences currently in the all-0s, 0s-then-1s, 0s-1s-2s stage
    long long d0 = 0, d1 = 0, d2 = 0;
    for (int x : nums) {
        if (x == 0) d0 = (2 * d0 + 1) % MOD;        // extend, ignore, or start fresh here
        else if (x == 1) d1 = (2 * d1 + d0) % MOD;  // extend, ignore, or promote a stage-0 one
        else d2 = (2 * d2 + d1) % MOD;
    }
    return (int)d2;
}`,
      explanation: [
        "Think of the pattern 0+1+2+ as a three-state automaton and let dk be the number of index sets that are valid prefixes sitting in state k after the current position. The answer is d2 at the end, which counts exactly the complete special subsequences.",
        "Each transition is include/exclude plus a promotion. Seeing a 0, every stage-0 subsequence can either take this index or not (2 * d0) and one brand-new subsequence starts (+1). Seeing a 1, every stage-1 subsequence takes it or not (2 * d1) and every stage-0 subsequence may append its first 1 (+ d0). The 2 case is symmetric. Every subsequence is counted once because the multiset of indices is determined by the choices made at each step.",
        "The 'positive number of each' requirement is enforced structurally: d1 can only grow from d0, so it never contains a subsequence with zero 0s, and likewise for d2. No subtraction of degenerate cases is needed.",
        "The tempting wrong route is to count, for each 1 at position i, the number of 0s before it times the number of 2s after it. That counts one 0, one 1 and one 2 - it neither allows longer runs nor avoids double counting once runs are allowed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Distinct Subsequences II",
      difficulty: "Hard",
      variation: "Counting distinct strings with last-occurrence dedupe",
      link: "https://leetcode.com/problems/distinct-subsequences-ii/",
      question: [
        "Given a string s, return the number of distinct non-empty subsequences of s. Subsequences that spell the same string count only once. Return the answer modulo 10^9 + 7.",
        "Example 1:\nInput: s = 'abc'\nOutput: 7\nExplanation: 'a', 'b', 'c', 'ab', 'ac', 'bc', 'abc'.",
        "Example 2:\nInput: s = 'aba'\nOutput: 6\nExplanation: 'a', 'b', 'ab', 'ba', 'aa', 'aba'. Note that 'a' is counted once even though it can be taken from two positions.",
        "Example 3:\nInput: s = 'aaa'\nOutput: 3\nExplanation: 'a', 'aa', 'aaa'.",
        "Constraints:\n- 1 <= s.length <= 2000\n- s consists of lowercase English letters",
      ],
      code: `int distinctSubseqII(string s) {
    const long long MOD = 1000000007LL;
    long long total = 0;                 // distinct non-empty subsequences seen so far
    vector<long long> last(26, 0);       // what this letter contributed the previous time
    for (char ch : s) {
        int c = ch - 'a';
        long long add = (total + 1) % MOD;                    // append ch to all, plus ch alone
        total = ((total + add - last[c]) % MOD + MOD) % MOD;   // remove the repeat of last time
        last[c] = add;
    }
    return (int)total;
}`,
      explanation: [
        "State: total = number of distinct non-empty subsequences of the prefix processed so far. Processing character ch, the set of distinct subsequences ending in ch becomes exactly (every old subsequence with ch appended) plus (ch alone), which is total + 1 strings - and they are all distinct because they differ in their prefix before the final ch.",
        "The dedupe insight: the new set of ch-ending strings completely supersedes the old one. So instead of adding total + 1 blindly, add it and subtract what ch contributed the previous time it appeared, stored in last[ch]. Every distinct string is then represented once, keyed by its last character.",
        "Equivalently, keep endsWith[c] for all 26 letters and answer with their sum. That formulation makes the invariant obvious: the answer is partitioned by final character, and each bucket is overwritten, not accumulated.",
        "The wrong-but-tempting approach is total = 2 * total + 1, which is correct only when every character is unique - it is the count of index sets, not of strings, and on 'aaa' it returns 7 instead of 3.",
        "Because of the subtraction the running value can dip below zero under the modulus; the + MOD before the final reduction is mandatory. If the empty subsequence must be included, add 1 at the end.",
        "Time: O(n). Space: O(1) - a fixed 26-entry table.",
      ],
    },
    {
      name: "Number of Unique Good Subsequences",
      difficulty: "Hard",
      variation: "Distinct subsequences with a leading-zero rule",
      link: "https://leetcode.com/problems/number-of-unique-good-subsequences/",
      question: [
        "You are given a binary string binary. A subsequence is called good if it is not empty and has no leading zeros, with the exception of the single string '0'. Return the number of unique good subsequences of binary, modulo 10^9 + 7. Subsequences spelling the same string count once.",
        "Example 1:\nInput: binary = '001'\nOutput: 2\nExplanation: The good subsequences are '0' and '1'. '00' and '01' have leading zeros.",
        "Example 2:\nInput: binary = '101'\nOutput: 5\nExplanation: '1', '0', '10', '11' and '101'.",
        "Constraints:\n- 1 <= binary.length <= 10^5\n- binary consists only of the characters '0' and '1'",
      ],
      code: `int numberOfUniqueGoodSubsequences(string binary) {
    const long long MOD = 1000000007LL;
    // distinct subsequences that start with '1', split by their final character
    long long endsZero = 0, endsOne = 0;
    bool hasZero = false;
    for (char c : binary) {
        if (c == '1') endsOne = (endsZero + endsOne + 1) % MOD;   // +1 for the bare "1"
        else { endsZero = (endsZero + endsOne) % MOD; hasZero = true; }
    }
    long long ans = (endsZero + endsOne + (hasZero ? 1 : 0)) % MOD;
    return (int)ans;
}`,
      explanation: [
        "Split the answer into two independent parts: the string '0', which is good iff binary contains a zero, and every good string starting with '1'. Counting the second part is Distinct Subsequences II restricted to strings whose first character is '1'.",
        "State: endsZero and endsOne count the distinct subsequences already starting with '1' and ending with that digit. On seeing a digit d, the new set of d-ending strings is (every current string, of either ending, extended by d), which replaces the old d bucket - the same overwrite-not-accumulate dedupe as the general case, but with only two buckets so no last-occurrence array is needed.",
        "The leading-'1' restriction is enforced by seeding: a bare new string is only created on a '1' (the +1 term). A '0' can never start a tracked string, so endsZero only ever grows out of existing '1'-prefixed strings, and strings like '01' are structurally impossible.",
        "The trap is double counting '0' or forgetting it: it must be added exactly once, only if a zero exists, and it must not be produced by the main recurrence. A second trap is running the general 26-letter algorithm and then filtering - the filter is not expressible after the fact, because the algorithm's buckets are keyed by last character, not first.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Arithmetic Slices II - Subsequence",
      difficulty: "Hard",
      variation: "Counting subsequences keyed on a difference",
      link: "https://leetcode.com/problems/arithmetic-slices-ii-subsequence/",
      question: [
        "Given an integer array nums, return the number of arithmetic subsequences of nums. A subsequence is arithmetic if it has at least three elements and the difference between consecutive elements is constant. Subsequences using different index sets are counted separately.",
        "Example 1:\nInput: nums = [2, 4, 6, 8, 10]\nOutput: 7\nExplanation: [2,4,6], [4,6,8], [6,8,10], [2,4,6,8], [4,6,8,10], [2,4,6,8,10] and [2,6,10].",
        "Example 2:\nInput: nums = [7, 7, 7, 7, 7]\nOutput: 16\nExplanation: Every subsequence of length at least three has common difference 0.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `int numberOfArithmeticSlices(vector<int>& nums) {
    int n = nums.size();
    long long ans = 0;
    // dp[i][d] = number of arithmetic subsequences of length >= 2 ending at i with difference d
    vector<unordered_map<long long, long long>> dp(n);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            long long d = (long long)nums[i] - nums[j];   // 64-bit: the gap can overflow int
            long long cnt = 0;
            auto it = dp[j].find(d);
            if (it != dp[j].end()) cnt = it->second;
            dp[i][d] += cnt + 1;   // extend each chain ending at j, plus the new pair (j, i)
            ans += cnt;            // only the extended ones reach length >= 3
        }
    }
    return (int)ans;
}`,
      explanation: [
        "State: dp[i][d] = how many arithmetic subsequences of length at least two end at index i with common difference d. The second dimension has to be a hash map because d ranges over the whole integer line, not a small alphabet.",
        "Transition: for every earlier index j, the pair (j, i) with d = nums[i] - nums[j] either starts a fresh length-2 chain or extends any chain ending at j with the same d. Each chain of length L >= 2 at j becomes a chain of length L + 1 >= 3 at i, so exactly cnt of the newly formed chains are answers, and the +1 length-2 chain is stored but not counted. Every arithmetic subsequence is counted once at its final pair of indices, which is unique.",
        "Length-2 chains must be kept in the table but excluded from the answer. Adding cnt + 1 to ans is the standard off-by-one bug and overcounts every pair in the array.",
        "Duplicates need no special handling: with equal values d becomes 0 and the same recurrence counts each index set once, which is why [7,7,7,7,7] gives 16 - the number of subsets of size at least three of five elements, 10 + 5 + 1.",
        "The differences must be computed in 64-bit; nums[i] - nums[j] on two extreme ints overflows and would collide unrelated differences in the map.",
        "Time: O(n^2) expected, with hash-map operations amortised O(1). Space: O(n^2) in the worst case.",
      ],
    },
  ],
};
