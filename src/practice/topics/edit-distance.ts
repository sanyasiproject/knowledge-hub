import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "One Edit Distance",
      difficulty: "Easy",
      variation: "Bounded edit distance, no DP table needed",
      link: "https://leetcode.com/problems/one-edit-distance/",
      question: [
        "Given two strings s and t, return true if they are exactly one edit distance apart. One edit means inserting a single character, deleting a single character, or replacing a single character. Two identical strings are zero edits apart, so they must return false.",
        "Example 1:\nInput: s = 'ab', t = 'acb'\nOutput: true\nExplanation: Insert 'c' into s at index 1 to get t.",
        "Example 2:\nInput: s = 'cab', t = 'ad'\nOutput: false\nExplanation: The lengths differ by 1 but the strings share only the leading 'a', so at least two edits are needed.",
        "Constraints:\n- 0 <= s.length, t.length <= 10^4\n- s and t consist of lowercase letters, uppercase letters and digits",
      ],
      code: `bool isOneEditDistance(string s, string t) {
    int m = s.size(), n = t.size();
    if (m > n) return isOneEditDistance(t, s);   // make s the shorter side
    if (n - m > 1) return false;                 // more than one insert needed
    for (int i = 0; i < m; i++) {
        if (s[i] == t[i]) continue;              // still in the common prefix
        if (m == n) return s.substr(i + 1) == t.substr(i + 1);  // replace s[i]
        return s.substr(i) == t.substr(i + 1);   // insert t[i] into s
    }
    return n - m == 1;   // s is a prefix of t: one edit only if t is one longer
}`,
      explanation: [
        "When the answer is capped at one edit you never need the DP table. Walk both strings together until the first mismatch; everything before it is a shared prefix that no optimal edit script would touch.",
        "At the mismatch there are only two shapes left. Equal lengths force a replacement, so the remaining suffixes after skipping one character on each side must match exactly. Unequal lengths force an insertion into the shorter string, so you skip one character on the longer side only and the rest must match.",
        "The loop-exit case is the one people forget: if no mismatch is ever found, the shorter string is a prefix of the longer one. That is one edit when the lengths differ by exactly one, and zero edits when they are equal - and zero edits must return false here.",
        "The tempting wrong approach is to compare character counts or sorted strings. That accepts 'ab' against 'ba', which is a transposition, i.e. two edits under insert/delete/replace.",
        "Time: O(m + n). Space: O(m + n) for the substr copies, O(1) if you compare with index loops instead.",
      ],
    },
    {
      name: "Valid Palindrome II",
      difficulty: "Easy",
      variation: "At most one deletion, greedy two pointers",
      link: "https://leetcode.com/problems/valid-palindrome-ii/",
      question: [
        "Given a string s, return true if s can be made a palindrome by deleting at most one character from it.",
        "Example 1:\nInput: s = 'abca'\nOutput: true\nExplanation: Delete 'c' to get 'aba', which is a palindrome.",
        "Example 2:\nInput: s = 'abc'\nOutput: false\nExplanation: Deleting any one character leaves 'bc', 'ac' or 'ab', none of which is a palindrome.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `bool isPal(const string& s, int i, int j) {
    while (i < j) if (s[i++] != s[j--]) return false;
    return true;
}

bool validPalindrome(string s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        if (s[i] != s[j])
            // spend the single deletion on the left or on the right char
            return isPal(s, i + 1, j) || isPal(s, i, j - 1);
        i++; j--;
    }
    return true;
}`,
      explanation: [
        "This is the deletion-only edit distance between s and its reverse, asked with a budget of one. The general answer is n minus the longest palindromic subsequence, but a budget of one collapses the DP into two pointers.",
        "The invariant: while s[i] == s[j] those two characters can be paired in some optimal palindrome, so matching them off is never worse than deleting either. That justifies advancing both pointers without branching.",
        "At the first mismatch one of the two characters must go, because you cannot pair them and you cannot afford to delete both. So exactly two candidate suffixes remain, and each is checked with a plain palindrome scan since the budget is now zero.",
        "The trap is recursing with the deletion budget still available on both branches - that silently solves 'delete at most two' and accepts 'abcxba'-style strings that the problem rejects.",
        "Time: O(n) - the outer walk is linear and the two verification scans run at most once each. Space: O(1).",
      ],
    },
    {
      name: "Edit Distance",
      difficulty: "Medium",
      variation: "Levenshtein distance, the template",
      link: "https://leetcode.com/problems/edit-distance/",
      question: [
        "Given two strings word1 and word2, return the minimum number of operations required to convert word1 into word2. You may insert a character, delete a character, or replace a character, and each operation costs 1.",
        "Example 1:\nInput: word1 = 'horse', word2 = 'ros'\nOutput: 3\nExplanation: horse -> rorse (replace 'h' with 'r'), rorse -> rose (delete 'r'), rose -> ros (delete 'e').",
        "Example 2:\nInput: word1 = 'intention', word2 = 'execution'\nOutput: 5\nExplanation: Five operations suffice: delete 't', replace 'i' with 'e', replace 'n' with 'x', replace 'n' with 'c', insert 'u'.",
        "Constraints:\n- 0 <= word1.length, word2.length <= 500\n- word1 and word2 consist of lowercase English letters",
      ],
      code: `int minDistance(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) dp[i][0] = i;   // delete every char of a
    for (int j = 0; j <= n; j++) dp[0][j] = j;   // insert every char of b
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];     // free match, no operation
            } else {
                dp[i][j] = 1 + min({ dp[i - 1][j - 1],   // replace a[i-1]
                                     dp[i - 1][j],       // delete a[i-1]
                                     dp[i][j - 1] });    // insert b[j-1]
            }
        }
    }
    return dp[m][n];
}`,
      explanation: [
        "State: dp[i][j] is the edit distance between the first i characters of a and the first j characters of b. The answer is dp[m][n], and the borders are forced - turning a prefix into the empty string costs one deletion per character.",
        "The transition is a case split on what the last operation of an optimal script does to the final characters. Either they are matched (only free when they are equal), or a[i-1] is replaced by b[j-1], or a[i-1] is deleted, or b[j-1] is inserted. Every edit script ends in exactly one of those, so the minimum over them is optimal.",
        "When a[i-1] == b[j-1] you can safely take dp[i-1][j-1] and stop there. Aligning two equal characters is never worse than editing around them, so the other three branches cannot beat it and adding them changes nothing except runtime.",
        "The classic wrong instinct is to make the choice greedily - scan left to right and edit on the first mismatch. That fails on 'horse' vs 'ros': the cheap script starts with a replacement, but a greedy scanner that deletes on mismatch spends 4.",
        "Note the asymmetry to keep straight: dp[i-1][j] consumed a character of a (a deletion) and dp[i][j-1] consumed a character of b (an insertion). Swapping them still produces a symmetric-looking table but the reconstructed edit script is wrong.",
        "Time: O(m * n). Space: O(m * n), reducible to O(min(m, n)) - see the next problem.",
      ],
    },
    {
      name: "Edit Distance (CSES 1639)",
      difficulty: "Medium",
      variation: "Judge version, two-row rolling table",
      link: "https://cses.fi/problemset/task/1639",
      question: [
        "You are given two strings. Print the minimum number of single-character insertions, deletions and replacements needed to transform the first string into the second.",
        "Example 1:\nInput:\nLOVE\nMOVIE\nOutput: 2\nExplanation: Replace 'L' with 'M' to get MOVE, then insert 'I' to get MOVIE.",
        "Constraints:\n- 1 <= length of each string <= 5000\n- The strings consist of uppercase letters A-Z",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b;
    cin >> a >> b;
    int m = a.size(), n = b.size();
    // only the previous row is ever read, so two rows of width n+1 suffice
    vector<int> prev(n + 1), cur(n + 1);
    for (int j = 0; j <= n; j++) prev[j] = j;
    for (int i = 1; i <= m; i++) {
        cur[0] = i;                              // delete the first i chars of a
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) cur[j] = prev[j - 1];
            else cur[j] = 1 + min({ prev[j - 1], prev[j], cur[j - 1] });
        }
        swap(prev, cur);                         // O(1) pointer swap, not a copy
    }
    cout << prev[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Identical recurrence to the template; only the storage changes. Row i reads row i-1 and the cell immediately to its left in row i, so nothing older than one row is ever needed.",
        "Two vectors plus swap is the safest form of this optimisation. The single-array version works too, but only if you stash the old dp[j-1] in a temporary before overwriting dp[j] - forget that and the 'replace' branch silently reads the current row instead of the previous one.",
        "At 5000 by 5000 the full table would be 25 million ints, about 100 MB, over the CSES memory limit. Two rows is 40 KB and the time cost is unchanged.",
        "Since prev and cur are swapped at the end of every iteration, the finished last row lives in prev when the loop exits - reading cur[n] there is a common off-by-one-swap bug.",
        "Time: O(m * n) = 2.5 * 10^7 cell updates. Space: O(n).",
      ],
    },
    {
      name: "Delete Operation for Two Strings",
      difficulty: "Medium",
      variation: "Deletions only (LCS dual)",
      link: "https://leetcode.com/problems/delete-operation-for-two-strings/",
      question: [
        "Given two strings word1 and word2, return the minimum number of steps required to make them equal, where in one step you can delete exactly one character from either string. Replacements and insertions are not allowed.",
        "Example 1:\nInput: word1 = 'sea', word2 = 'eat'\nOutput: 2\nExplanation: Delete 's' from 'sea' and 't' from 'eat', leaving 'ea' on both sides.",
        "Example 2:\nInput: word1 = 'leetcode', word2 = 'etco'\nOutput: 4\nExplanation: The longest common subsequence is 'etco' of length 4, so 8 - 4 = 4 deletions from word1 and none from word2.",
        "Constraints:\n- 1 <= word1.length, word2.length <= 500\n- word1 and word2 consist of lowercase English letters",
      ],
      code: `int minDistance(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                ? dp[i - 1][j - 1] + 1                    // extend the LCS
                : max(dp[i - 1][j], dp[i][j - 1]);        // drop one character
    return m + n - 2 * dp[m][n];   // every char outside the LCS is deleted once
}`,
      explanation: [
        "Removing the replace operation changes the problem into a pure alignment: whatever string both sides end up as must be a common subsequence of a and b, and every character not in it costs one deletion on its own side.",
        "So minimising deletions is exactly maximising the length of that common subsequence, and the answer is m + n - 2 * LCS(a, b). The factor of two is because each unmatched character is deleted once, and characters outside the LCS exist in both strings.",
        "You can also write it directly as an edit DP with only two branches - dp[i][j] = dp[i-1][j-1] when the characters match, else 1 + min(dp[i-1][j], dp[i][j-1]). It gives the same numbers; going through LCS just reuses a table you already know.",
        "The trap is reaching for the Levenshtein answer. Levenshtein on 'leetcode' and 'etco' is 4 too by coincidence of these inputs, but on 'ab' vs 'cd' it is 2 while the deletion-only answer is 4, because a replace has to be paid for as a delete plus a delete here.",
        "Time: O(m * n). Space: O(m * n), or O(min(m, n)) with the two-row trick.",
      ],
    },
    {
      name: "Minimum ASCII Delete Sum for Two Strings",
      difficulty: "Medium",
      variation: "Non-uniform operation costs",
      link: "https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/",
      question: [
        "Given two strings s1 and s2, return the lowest possible sum of ASCII values of deleted characters needed to make the two strings equal. Deleting a character costs its ASCII value rather than 1.",
        "Example 1:\nInput: s1 = 'sea', s2 = 'eat'\nOutput: 231\nExplanation: Delete 's' from 'sea' (115) and 't' from 'eat' (116). 115 + 116 = 231, and both strings become 'ea'.",
        "Example 2:\nInput: s1 = 'delete', s2 = 'leet'\nOutput: 403\nExplanation: The best kept common subsequence is 'let' (108 + 101 + 116 = 325). The total ASCII of both strings is 1053, so the deleted sum is 1053 - 2 * 325 = 403.",
        "Constraints:\n- 1 <= s1.length, s2.length <= 1000\n- s1 and s2 consist of lowercase English letters",
      ],
      code: `int minimumDeleteSum(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    // borders: with one side empty, everything on the other side must go
    for (int i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] + s1[i - 1];
    for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] + s2[j - 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (s1[i - 1] == s2[j - 1])
                ? dp[i - 1][j - 1]                                  // keep both, cost 0
                : min(dp[i - 1][j] + s1[i - 1],                     // delete s1[i-1]
                      dp[i][j - 1] + s2[j - 1]);                    // delete s2[j-1]
    return dp[m][n];
}`,
      explanation: [
        "Same state and same two deletion branches as the previous problem; only the cost attached to each branch changes from 1 to the character's ASCII value. That is the whole point of this variation - the DP skeleton of edit distance is cost-agnostic.",
        "Because the costs differ per character, the borders are no longer i and j but prefix sums of ASCII values, and dp[i][0] must be built incrementally rather than assumed.",
        "The equivalent 'maximise the kept common subsequence weight' formulation also works: answer = total ASCII of both strings minus twice the maximum-weight common subsequence. Note this is not the same as the longest common subsequence - a shorter subsequence of expensive characters can beat a longer cheap one.",
        "That is exactly the trap. Solving LCS and then summing the deleted characters gives the wrong answer in general, because LCS optimises count while this problem optimises weight.",
        "Time: O(m * n). Space: O(m * n), reducible to O(n).",
      ],
    },
    {
      name: "Minimum Insertion Steps to Make a String Palindrome",
      difficulty: "Hard",
      variation: "Aligning a string against its own reverse",
      link: "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
      question: [
        "Given a string s, return the minimum number of characters you must insert anywhere in s to make it a palindrome. You may insert any character at any position.",
        "Example 1:\nInput: s = 'mbadm'\nOutput: 2\nExplanation: 'mbadm' -> 'mbadbm' -> 'mbadabm', a palindrome. The longest common subsequence of 'mbadm' and its reverse 'mdabm' is 'mbm' of length 3, so 5 - 3 = 2.",
        "Example 2:\nInput: s = 'leetcode'\nOutput: 5\nExplanation: One reachable target is 'ledoctetcodel', which is 13 characters long, so 5 characters were inserted. The longest palindromic subsequence of 'leetcode' is 'ete' of length 3, and 8 - 3 = 5.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `int minInsertions(string s) {
    string r = s;
    reverse(r.begin(), r.end());
    int n = s.size();
    // LCS of s with its reverse = longest palindromic subsequence of s
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (s[i - 1] == r[j - 1])
                ? dp[i - 1][j - 1] + 1
                : max(dp[i - 1][j], dp[i][j - 1]);
    return n - dp[n][n];   // every char outside the palindromic core needs a mirror
}`,
      explanation: [
        "The characters you keep untouched must themselves read the same forwards and backwards, i.e. they form a palindromic subsequence of s. Every other character needs one inserted mirror partner, so the answer is n minus the longest palindromic subsequence.",
        "The longest palindromic subsequence of s equals the longest common subsequence of s and reverse(s). Intuition: a common subsequence of s and its reverse is a set of positions readable identically in both directions, which is precisely a palindromic subsequence.",
        "Insertions-only and deletions-only give the same count here. Deleting the non-core characters or inserting their mirrors both cost n - LPS, which is why this problem, 'minimum deletions to make a palindrome', and LPS are the same DP with a different sentence around it.",
        "The trap is trying to reuse Levenshtein distance between s and reverse(s) and halving it. Replacements let you fix two mismatched characters for the price of one operation, so that number is smaller than the true insertion count - on 'abc' Levenshtein to 'cba' is 2, but you need 2 insertions and the coincidence does not survive longer inputs like 'abcd'.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n) with two rows since the reconstruction is not needed.",
      ],
    },
    {
      name: "Shortest Common Supersequence",
      difficulty: "Hard",
      variation: "Reconstructing the edit script, not just its cost",
      link: "https://leetcode.com/problems/shortest-common-supersequence/",
      question: [
        "Given two strings str1 and str2, return the shortest string that has both str1 and str2 as subsequences. If several answers of the same length exist, return any of them.",
        "Example 1:\nInput: str1 = 'abac', str2 = 'cab'\nOutput: 'cabac'\nExplanation: 'abac' is a subsequence of 'cabac' at positions 1,2,3,4 and 'cab' is a subsequence at positions 0,1,2. No string of length 4 works.",
        "Example 2:\nInput: str1 = 'aaaaaaaa', str2 = 'aaaaaaaa'\nOutput: 'aaaaaaaa'\nExplanation: The strings are already equal, so one of them is already a supersequence of both.",
        "Constraints:\n- 1 <= str1.length, str2.length <= 1000\n- str1 and str2 consist of lowercase English letters",
      ],
      code: `string shortestCommonSupersequence(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                ? dp[i - 1][j - 1] + 1
                : max(dp[i - 1][j], dp[i][j - 1]);

    string res;
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) {              // shared char, emit once
            res += a[i - 1]; i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            res += a[--i];                       // a[i-1] is unmatched
        } else {
            res += b[--j];                       // b[j-1] is unmatched
        }
    }
    while (i > 0) res += a[--i];                 // flush the leftover prefixes
    while (j > 0) res += b[--j];
    reverse(res.begin(), res.end());             // we built it back to front
    return res;
}`,
      explanation: [
        "The supersequence must contain every character of both strings, and the only characters it can share between them are those in a common subsequence. So its minimum length is m + n - LCS(a, b), and this problem asks for the witness rather than the number - the same step as printing an edit script instead of an edit distance.",
        "Reconstruction walks the finished table backwards from (m, n) and asks at each cell which branch produced its value. Equal characters were matched, so emit one copy and move diagonally. Otherwise follow the larger of dp[i-1][j] and dp[i][j-1], emitting the character that branch skipped - that character is unmatched and must appear on its own.",
        "The tie-break when dp[i-1][j] == dp[i][j-1] is arbitrary: both give a shortest answer, which is why the problem accepts any. What is not arbitrary is the direction - each step must move strictly towards (0, 0) or the loop never terminates.",
        "The two flush loops matter. When one index hits 0 the other string still has an unconsumed prefix, and every character of it has to be emitted; dropping them produces a string that is shorter than the true optimum and is not a supersequence at all.",
        "The tempting shortcut of concatenating a + b is always a valid supersequence but only optimal when the strings share nothing, and greedily interleaving without the table gets the sharing wrong.",
        "Time: O(m * n) for the table plus O(m + n) for the walk. Space: O(m * n) - the full table is required here because the backward walk needs it, so the two-row trick does not apply.",
      ],
    },
    {
      name: "Wildcard Matching",
      difficulty: "Hard",
      variation: "Pattern matching with unbounded-gap wildcard",
      link: "https://leetcode.com/problems/wildcard-matching/",
      question: [
        "Given an input string s and a pattern p, return true if p matches the entire string s. The pattern may contain '?', which matches any single character, and '*', which matches any sequence of characters including the empty sequence. All other pattern characters must match literally.",
        "Example 1:\nInput: s = 'adceb', p = '*a*b'\nOutput: true\nExplanation: The first '*' matches the empty sequence, 'a' matches 'a', the second '*' matches 'dce', and 'b' matches 'b'.",
        "Example 2:\nInput: s = 'acdcb', p = 'a*c?b'\nOutput: false\nExplanation: There is no way to split 'cdcb' so that 'c', one wildcard character and 'b' line up after 'a'.",
        "Constraints:\n- 0 <= s.length, p.length <= 2000\n- s consists of lowercase English letters\n- p consists of lowercase English letters, '?' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    // empty s matches only a pattern prefix made entirely of stars
    for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && p[j - 1] == '*';
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                // star eats s[i-1], or star matches empty
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else {
                dp[i][j] = (p[j - 1] == '?' || p[j - 1] == s[i - 1]) && dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
      explanation: [
        "Same two-index alignment grid as edit distance, but the cell holds a boolean feasibility instead of a cost, and the moves are dictated by the pattern rather than freely chosen. dp[i][j] means the first i characters of s are matched by the first j characters of p.",
        "A literal or '?' forces the strict diagonal move: consume one character on each side and require the previous state to be reachable. A '*' offers exactly two moves - dp[i-1][j] extends the star by one more character of s while keeping the same star, and dp[i][j-1] closes the star having matched nothing.",
        "That two-branch form is what makes it linear per cell. Writing the star as an OR over every possible split point is also correct but turns each cell into O(m) work and the whole thing into O(m^2 * n).",
        "The row-0 initialisation carries the real subtlety: an empty s can still be matched, but only by a pattern of nothing but stars, and the moment a non-star appears every later cell in row 0 must be false. Leaving row 0 as all-false rejects s = '' against p = '*'.",
        "Note this differs from regex '*': here '*' stands alone and matches any run, whereas in regex it binds to the preceding character. Mixing the two semantics is the most common wrong solution.",
        "Time: O(m * n). Space: O(m * n), reducible to O(n) with two rows.",
      ],
    },
    {
      name: "Regular Expression Matching",
      difficulty: "Hard",
      variation: "Wildcard bound to the preceding character",
      link: "https://leetcode.com/problems/regular-expression-matching/",
      question: [
        "Given an input string s and a pattern p, return true if p matches the entire string s. The pattern supports '.', which matches any single character, and '*', which matches zero or more occurrences of the character immediately preceding it. It is guaranteed that every '*' in p has a valid preceding character.",
        "Example 1:\nInput: s = 'aab', p = 'c*a*b'\nOutput: true\nExplanation: 'c*' matches zero 'c', 'a*' matches 'aa', and 'b' matches 'b'.",
        "Example 2:\nInput: s = 'mississippi', p = 'mis*is*p*.'\nOutput: false\nExplanation: After 'mis*is*' consumes 'missis', 'p*' can match zero or more 'p' but the remaining 'sippi' cannot be reduced to a single character for the final '.'.",
        "Constraints:\n- 1 <= s.length <= 20\n- 1 <= p.length <= 20\n- s consists of lowercase English letters\n- p consists of lowercase English letters, '.' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    // empty s: only 'x*' pairs can be dropped, two pattern chars at a time
    for (int j = 2; j <= n; j++) if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                dp[i][j] = dp[i][j - 2];   // use the x* group zero times
                if (p[j - 2] == '.' || p[j - 2] == s[i - 1])
                    dp[i][j] = dp[i][j] || dp[i - 1][j];   // one more repetition
            } else {
                dp[i][j] = (p[j - 1] == '.' || p[j - 1] == s[i - 1]) && dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
      explanation: [
        "The state is the same alignment grid, but the pattern is now read in tokens rather than characters: a token is either a single character ('a' or '.') or a two-character group ('a*' or '.*'). That is why the star branches jump by two pattern positions, not one.",
        "For a star token there are two moves. Using it zero times skips the whole group, hence dp[i][j-2]. Using it one more time is only legal when the repeated character actually matches s[i-1], and then the group stays open, hence dp[i-1][j] with the same j.",
        "The gate p[j-2] == '.' || p[j-2] == s[i-1] on the second branch is the entire difference from wildcard matching. Dropping it lets 'a*' swallow arbitrary characters and turns the regex into a glob.",
        "Row 0 needs the two-step skip: an empty s is matched only by a pattern that is a run of star groups, so dp[0][j] = dp[0][j-2] whenever p[j-1] is a star. Initialising row 0 to all-false rejects s = '' against p = 'a*b*'.",
        "The tempting recursive solution without memoisation is exponential on inputs like 'aaaaaaaaaaaaaaaaaaaa' against 'a*a*a*a*a*b', because the same (i, j) pair is re-derived through many different splits of the stars.",
        "Time: O(m * n). Space: O(m * n), reducible to O(n) since only rows i and i-1 are ever read.",
      ],
    },
  ],
};
