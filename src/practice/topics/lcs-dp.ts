import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Common Subsequence",
      difficulty: "Medium",
      variation: "Two-string LCS length, the template",
      link: "https://leetcode.com/problems/longest-common-subsequence/",
      question: [
        "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string formed by deleting some (possibly zero) characters without changing the relative order of the remaining characters. A common subsequence of two strings is a subsequence that is common to both.",
        "Example 1:\nInput: text1 = 'abcde', text2 = 'ace'\nOutput: 3\nExplanation: The longest common subsequence is 'ace', of length 3.",
        "Example 2:\nInput: text1 = 'abc', text2 = 'def'\nOutput: 0\nExplanation: No character appears in both strings, so nothing is common.",
        "Constraints:\n- 1 <= text1.length, text2.length <= 1000\n- Both strings consist of lowercase English letters only",
      ],
      code: `int longestCommonSubsequence(string a, string b) {
    int n = a.size(), m = b.size();
    // dp[i][j] = LCS of the first i chars of a and the first j chars of b.
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[n][m];
}`,
      explanation: [
        "State: dp[i][j] is the LCS length of the prefixes a[0..i) and b[0..j). Prefix lengths are the right state because a subsequence decision only ever consumes characters from the front of what is left, so the two remaining suffixes fully describe the subproblem.",
        "Transition by looking at the last character of each prefix. If a[i-1] == b[j-1] there is always an optimal LCS that pairs them: given any optimal common subsequence, you can rewrite it so this matching pair is the final element without shortening it, so dp[i][j] = dp[i-1][j-1] + 1 and no max is needed. If they differ, at least one of the two characters cannot be the last matched element, so drop one: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
        "The trap on the equal branch is writing max(dp[i-1][j-1] + 1, dp[i-1][j], dp[i][j-1]). It is not wrong, just unnecessary - and on the unequal branch adding dp[i-1][j-1] as a third candidate is what people reach for instead, which is also redundant since dp[i-1][j-1] <= dp[i-1][j].",
        "Row i only reads row i-1, so two rows of size m+1 (or one row plus a saved diagonal value) replace the full table when memory is tight. Reconstructing the actual string, however, needs the whole table.",
        "Time: O(n*m). Space: O(n*m), reducible to O(min(n,m)) if only the length is required.",
      ],
    },
    {
      name: "Uncrossed Lines",
      difficulty: "Medium",
      variation: "LCS on integer arrays, disguised statement",
      link: "https://leetcode.com/problems/uncrossed-lines/",
      question: [
        "You are given two integer arrays nums1 and nums2, written on two separate horizontal lines in the given order. You may draw a connecting line between nums1[i] and nums2[j] whenever nums1[i] == nums2[j], and the drawn lines must not intersect each other: any two lines must not cross, and each number may belong to at most one line. Return the maximum number of connecting lines you can draw.",
        "Example 1:\nInput: nums1 = [1,4,2], nums2 = [1,2,4]\nOutput: 2\nExplanation: Connect the two 1s, then either the two 4s or the two 2s. Connecting both 4s and 2s would make the lines cross.",
        "Example 2:\nInput: nums1 = [2,5,1,2,5], nums2 = [10,5,2,1,5,2]\nOutput: 3\nExplanation: One valid set matches the subsequence 5, 1, 5.",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 500\n- 1 <= nums1[i], nums2[j] <= 2000",
      ],
      code: `int maxUncrossedLines(vector<int>& a, vector<int>& b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[n][m];
}`,
      explanation: [
        "The point of this problem is recognising the pattern, not writing new code. A set of non-crossing lines is exactly a set of index pairs (i1,j1), (i2,j2), ... with i1 < i2 < ... and j1 < j2 < ... and equal values at each pair. That is precisely a common subsequence of the two arrays, so the answer is the LCS length.",
        "Two lines cross if and only if one pair has a larger first index and a smaller second index, which is the same as saying the index sequences are not both increasing. So 'non-crossing' and 'order-preserving' are the same constraint, and the LCS recurrence applies unchanged.",
        "Because the alphabet is integers up to 2000 rather than letters, nothing about the DP changes - LCS never cared about the alphabet, only about equality tests. Watch out for the tempting greedy 'match every equal pair you can, left to right': in example 2 that grabs the wrong 5 first and loses a line.",
        "Time: O(n*m). Space: O(n*m), easily cut to O(m) with a rolling row.",
      ],
    },
    {
      name: "Printing Longest Common Subsequence",
      difficulty: "Medium",
      variation: "Reconstructing the subsequence from the table",
      link: "https://www.geeksforgeeks.org/printing-longest-common-subsequence/",
      question: [
        "Given two strings s1 and s2, print any one longest common subsequence of them. If there is no common subsequence, print the empty string. When several subsequences share the maximum length, printing any of them is accepted.",
        "Example 1:\nInput: s1 = 'AGGTAB', s2 = 'GXTXAYB'\nOutput: GTAB\nExplanation: 'GTAB' has length 4 and no common subsequence is longer.",
        "Example 2:\nInput: s1 = 'abcde', s2 = 'ace'\nOutput: ace",
        "Constraints:\n- 1 <= s1.length, s2.length <= 1000\n- Both strings consist of English letters",
      ],
      code: `string lcsString(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1]) ? dp[i - 1][j - 1] + 1
                                              : max(dp[i - 1][j], dp[i][j - 1]);

    string res;
    int i = n, j = m;
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) {          // this pair was matched
            res.push_back(a[i - 1]);
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;                             // dropping a[i-1] kept the value
        } else {
            j--;
        }
    }
    reverse(res.begin(), res.end());         // built back to front
    return res;
}`,
      explanation: [
        "Reconstruction re-runs the decision that produced each cell. Standing at dp[i][j]: if the two characters are equal the transition must have come from dp[i-1][j-1] with a match, so emit that character and step diagonally. Otherwise the value came from whichever neighbour ties it, so move that way without emitting anything.",
        "Ties on the unequal branch are genuine ambiguity - both neighbours can equal dp[i][j] - and either choice yields a valid, equally long answer. That is why these problems say 'print any'. Enumerating all distinct LCS strings is a different and much more expensive task.",
        "Characters come out from the end of the strings backwards, so the result must be reversed at the finish. Forgetting the reverse is the classic bug here, and it hides in symmetric test cases like 'aba'.",
        "Note the cost of reconstruction: the rolling-row space optimisation is no longer available, because the walk needs the whole table. Hirschberg's divide-and-conquer recovers an LCS in O(min(n,m)) space if that matters.",
        "Time: O(n*m) to fill plus O(n+m) to walk. Space: O(n*m).",
      ],
    },
    {
      name: "Longest Common Substring",
      difficulty: "Medium",
      variation: "Contiguous version - no inheritance on mismatch",
      link: "https://www.geeksforgeeks.org/problems/longest-common-substring1452/1",
      question: [
        "Given two strings s1 and s2, return the length of their longest common substring. A substring is a contiguous block of characters, unlike a subsequence, which may skip characters.",
        "Example 1:\nInput: s1 = 'ABCDGH', s2 = 'ACDGHR'\nOutput: 4\nExplanation: 'CDGH' appears contiguously in both strings.",
        "Example 2:\nInput: s1 = 'ABC', s2 = 'ACB'\nOutput: 1\nExplanation: No two consecutive characters appear in the same order in both, so the best is a single character.",
        "Constraints:\n- 1 <= s1.length, s2.length <= 1000\n- Both strings consist of uppercase English letters",
      ],
      code: `int longestCommonSubstr(string a, string b) {
    int n = a.size(), m = b.size();
    // dp[i][j] = length of the common suffix of a[0..i) and b[0..j).
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    int best = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                best = max(best, dp[i][j]);
            }
            // on a mismatch dp[i][j] stays 0: the run is broken
        }
    }
    return best;
}`,
      explanation: [
        "The state changes meaning: dp[i][j] is no longer the best common subsequence of the prefixes but the length of the longest common block that *ends exactly* at a[i-1] and b[j-1]. Forcing the block to end at the current pair is what makes contiguity expressible.",
        "That is why a mismatch resets to 0 instead of inheriting max(dp[i-1][j], dp[i][j-1]). Inheriting is what allows a subsequence to skip a character, and skipping is exactly what a substring may not do. This one line is the whole difference between the two problems.",
        "Because no cell holds a running maximum any more, the answer is not dp[n][m] - it is the maximum over the entire table, tracked as you fill. Returning dp[n][m] here is the standard wrong answer.",
        "The table can be rolled to two rows since dp[i][j] only reads dp[i-1][j-1]. For much longer strings the linear-time alternatives are a suffix automaton of one string run against the other, or binary search on length plus hashing.",
        "Time: O(n*m). Space: O(n*m), reducible to O(m).",
      ],
    },
    {
      name: "Delete Operation for Two Strings",
      difficulty: "Medium",
      variation: "Minimum deletions from both strings",
      link: "https://leetcode.com/problems/delete-operation-for-two-strings/",
      question: [
        "Given two strings word1 and word2, return the minimum number of steps required to make them the same. In one step you may delete exactly one character from either string.",
        "Example 1:\nInput: word1 = 'sea', word2 = 'eat'\nOutput: 2\nExplanation: Delete 's' from 'sea' and 't' from 'eat'; both become 'ea'.",
        "Example 2:\nInput: word1 = 'leetcode', word2 = 'etco'\nOutput: 4\nExplanation: The LCS is 'etco' of length 4, so 8 + 4 - 2*4 = 4 deletions are needed, all from word1.",
        "Constraints:\n- 1 <= word1.length, word2.length <= 500\n- Both strings consist of lowercase English letters",
      ],
      code: `int minDistance(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1]) ? dp[i - 1][j - 1] + 1
                                              : max(dp[i - 1][j], dp[i][j - 1]);
    return n + m - 2 * dp[n][m];   // everything outside the LCS is deleted
}`,
      explanation: [
        "Deletions only, no insertions or replacements, so whatever survives in word1 must be a subsequence of word1 and equally a subsequence of word2 - that is, a common subsequence. Every character not kept costs one step, in whichever string it sits.",
        "So the cost is n + m - 2*k where k is the length of the kept common subsequence, and minimising cost is the same as maximising k. Maximum k is the LCS length, which reduces the problem to the template with one arithmetic line on top.",
        "The direct DP is equally valid: dp[i][j] = dp[i-1][j-1] on a match, else 1 + min(dp[i-1][j], dp[i][j-1]) with dp[i][0] = i and dp[0][j] = j. It is worth being able to write both, because the direct form is the one that generalises when deletions have different costs.",
        "The tempting mistake is counting mismatched positions after aligning the strings from the left, which ignores that deletions shift everything - alignment is a choice, and the DP is what searches over all of them.",
        "Time: O(n*m). Space: O(n*m), reducible to O(m).",
      ],
    },
    {
      name: "Minimum ASCII Delete Sum for Two Strings",
      difficulty: "Medium",
      variation: "Weighted deletions - LCS reduction fails",
      link: "https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/",
      question: [
        "Given two strings s1 and s2, return the lowest ASCII sum of deleted characters needed to make the two strings equal. Deleting a character costs its ASCII value, and you may delete from either string.",
        "Example 1:\nInput: s1 = 'sea', s2 = 'eat'\nOutput: 231\nExplanation: Delete 's' from 'sea' (115) and 't' from 'eat' (116); 115 + 116 = 231.",
        "Example 2:\nInput: s1 = 'delete', s2 = 'leet'\nOutput: 403\nExplanation: Keeping the common subsequence 'let' costs 1053 - 2*325 = 403, which beats keeping the longer 'eet' (417).",
        "Constraints:\n- 1 <= s1.length, s2.length <= 1000\n- Both strings consist of lowercase English letters",
      ],
      code: `int minimumDeleteSum(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    // empty target: delete every remaining character of the other string
    for (int i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + a[i - 1];
    for (int j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + b[j - 1];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];   // keep both, free
            else dp[i][j] = min(dp[i - 1][j] + a[i - 1], dp[i][j - 1] + b[j - 1]);
        }
    }
    return dp[n][m];
}`,
      explanation: [
        "Same alignment structure as the deletion problem, but now dp[i][j] is a *cost*: the cheapest total ASCII sum to make the prefixes a[0..i) and b[0..j) equal. Minimising replaces maximising, and the base row and column are no longer zeros - emptying a prefix costs the sum of its characters.",
        "This is the question that shows why the LCS reduction is a shortcut and not the pattern itself. Example 2 makes the point: 'eet' is a longer common subsequence than 'let', yet keeping the cheaper-to-delete characters wins, so 'longest' and 'best' come apart the moment characters carry different weights.",
        "Equivalently you could maximise the ASCII weight of the kept common subsequence and subtract twice that from the total - the maximum-weight common subsequence, not the longest. Either formulation works; mixing them up by running plain LCS and then weighting the result does not.",
        "On a mismatch there is no third candidate to consider: deleting both a[i-1] and b[j-1] is already covered by taking one branch and then the other in the next cell, so adding it changes nothing.",
        "Time: O(n*m). Space: O(n*m), reducible to O(m) with a rolling row.",
      ],
    },
    {
      name: "Longest Palindromic Subsequence",
      difficulty: "Medium",
      variation: "LCS of a string with its reverse",
      link: "https://leetcode.com/problems/longest-palindromic-subsequence/",
      question: [
        "Given a string s, find the length of the longest palindromic subsequence of s. A subsequence may skip characters but must keep the relative order of those it keeps.",
        "Example 1:\nInput: s = 'bbbab'\nOutput: 4\nExplanation: 'bbbb' is a palindromic subsequence of length 4.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 2\nExplanation: 'bb' is the longest palindromic subsequence.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `int longestPalindromeSubseq(string s) {
    string r = s;
    reverse(r.begin(), r.end());
    int n = s.size();
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (s[i - 1] == r[j - 1]) ? dp[i - 1][j - 1] + 1
                                              : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[n][n];   // LCS(s, reverse(s))
}`,
      explanation: [
        "A subsequence of s is a palindrome exactly when reading it forwards and backwards gives the same string, and reading a subsequence of s backwards is reading a subsequence of reverse(s) forwards. So every palindromic subsequence of s is a common subsequence of s and reverse(s), and the longest one is LCS(s, reverse(s)).",
        "The converse direction is the part worth checking, because it is where people suspect a bug: a common subsequence of s and reverse(s) of length L can always be realised as a palindrome of length L in s. The standard argument pairs the i-th matched position from the front with the i-th from the back; when a character would be reused in the middle of an odd-length match, it still contributes a valid centre, so the length is preserved.",
        "The interval DP is the alternative worth knowing: dp[i][j] over substrings with dp[i][j] = dp[i+1][j-1] + 2 when s[i] == s[j], else max(dp[i+1][j], dp[i][j-1]). Same O(n^2), and it is the version that extends to counting palindromic subsequences.",
        "Do not confuse this with the longest palindromic *substring*, which is a contiguous problem solved by expand-around-centre or Manacher. Running LCS(s, reverse(s)) for the substring version is a well-known wrong answer: 'abacdfgdcaba' returns a long common subsequence that is not contiguous in either copy.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n).",
      ],
    },
    {
      name: "Minimum Insertion Steps to Make a String Palindrome",
      difficulty: "Hard",
      variation: "Length minus LPS",
      link: "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
      question: [
        "Given a string s, return the minimum number of insertions needed to make s a palindrome. In one step you may insert any single character at any position in the string.",
        "Example 1:\nInput: s = 'mbadm'\nOutput: 2\nExplanation: Insert to reach 'mbdadbm', a palindrome, in two steps.",
        "Example 2:\nInput: s = 'leetcode'\nOutput: 5\nExplanation: One result is 'leetcodocteel', of length 13. The longest palindromic subsequence is 'ete' of length 3, so 8 - 3 = 5 insertions.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `int minInsertions(string s) {
    string r = s;
    reverse(r.begin(), r.end());
    int n = s.size();
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (s[i - 1] == r[j - 1]) ? dp[i - 1][j - 1] + 1
                                              : max(dp[i - 1][j], dp[i][j - 1]);
    return n - dp[n][n];   // characters left unpaired by the longest palindromic subsequence
}`,
      explanation: [
        "Insertions never remove anything, so the original string survives as a subsequence of the final palindrome. Pick the longest palindromic subsequence of s, of length L: those characters are already mirrored, and each of the remaining n - L characters needs exactly one partner inserted on the other side. That gives n - L as an upper bound.",
        "It is also a lower bound: in any palindrome containing s as a subsequence, the characters of s that map to mirror-image positions form a palindromic subsequence of s, so at most L of them can be paired among themselves and the other n - L each force at least one inserted character. Bound meets construction, so n - L is exactly the answer.",
        "Since LPS(s) = LCS(s, reverse(s)), the code is the LCS template plus one subtraction. Recognising this chain - insertions to palindrome, then LPS, then LCS with the reverse - is the reason this problem is filed under LCS rather than under interval DP.",
        "The same identity answers the deletion form of the question, 'minimum deletions to make s a palindrome', with the same n - L. It is a nice check on the reasoning that inserting and deleting cost the same here.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n).",
      ],
    },
    {
      name: "Shortest Common Supersequence",
      difficulty: "Hard",
      variation: "Building the merged string from the LCS table",
      link: "https://leetcode.com/problems/shortest-common-supersequence/",
      question: [
        "Given two strings str1 and str2, return the shortest string that has both str1 and str2 as subsequences. If more than one answer has the minimum length, return any of them.",
        "Example 1:\nInput: str1 = 'abac', str2 = 'cab'\nOutput: cabac\nExplanation: 'abac' is a subsequence of 'cabac' (positions 1,2,3,4) and 'cab' is a subsequence of 'cabac' (positions 0,1,2). No common supersequence is shorter than 5.",
        "Example 2:\nInput: str1 = 'aaaaaaaa', str2 = 'aaaaaaaa'\nOutput: aaaaaaaa",
        "Constraints:\n- 1 <= str1.length, str2.length <= 1000\n- Both strings consist of lowercase English letters",
      ],
      code: `string shortestCommonSupersequence(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1]) ? dp[i - 1][j - 1] + 1
                                              : max(dp[i - 1][j], dp[i][j - 1]);

    string res;
    int i = n, j = m;
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) {              // shared character, written once
            res.push_back(a[i - 1]);
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            res.push_back(a[i - 1]);             // a's character is exclusive here
            i--;
        } else {
            res.push_back(b[j - 1]);
            j--;
        }
    }
    while (i > 0) res.push_back(a[--i]);         // flush whichever string is left
    while (j > 0) res.push_back(b[--j]);
    reverse(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "A supersequence must contain every character of both strings, and the only way to save space is to let one character serve both strings at once. A set of characters that can be shared must appear in the same relative order in both, so it is a common subsequence - hence the minimum length is n + m - LCS(n, m), achieved by sharing a longest common subsequence.",
        "Construction walks the same LCS table as the reconstruction problem, but now nothing is discarded. On a match, emit the character once and step diagonally; on a mismatch, emit the character from the string whose index the LCS walk decrements, since that character is not part of the shared skeleton and must be written on its own.",
        "The two flush loops at the end are essential and easy to forget. When one index hits zero the other string still has a prefix left, and every one of those characters must be emitted or the result stops being a supersequence.",
        "Interleaving greedily - always take the smaller character, or always take from str1 first - produces a valid supersequence but not a shortest one, because it shares characters only by luck. The LCS is what guarantees the maximum amount of sharing.",
        "Time: O(n*m). Space: O(n*m); the table cannot be rolled here because the walk needs it.",
      ],
    },
    {
      name: "Longest Common Subsequence of Three Strings",
      difficulty: "Hard",
      variation: "Three-dimensional LCS",
      link: "https://www.geeksforgeeks.org/lcs-longest-common-subsequence-three-strings/",
      question: [
        "Given three strings s1, s2 and s3, return the length of the longest subsequence common to all three.",
        "Example 1:\nInput: s1 = 'geeks', s2 = 'geeksfor', s3 = 'geeksforgeeks'\nOutput: 5\nExplanation: 'geeks' is a subsequence of all three strings.",
        "Example 2:\nInput: s1 = 'abcd', s2 = 'acbd', s3 = 'abdc'\nOutput: 3\nExplanation: 'abd' is common to all three; no length-4 subsequence is, since 'abcd' is not a subsequence of 'acbd'.",
        "Constraints:\n- 1 <= s1.length, s2.length, s3.length <= 100\n- The strings consist of lowercase English letters",
      ],
      code: `int lcsOfThree(string a, string b, string c) {
    int n = a.size(), m = b.size(), p = c.size();
    // dp[i][j][k] = LCS of the first i, j, k characters respectively.
    vector<vector<vector<int>>> dp(n + 1,
        vector<vector<int>>(m + 1, vector<int>(p + 1, 0)));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            for (int k = 1; k <= p; k++) {
                if (a[i - 1] == b[j - 1] && b[j - 1] == c[k - 1])
                    dp[i][j][k] = dp[i - 1][j - 1][k - 1] + 1;
                else
                    dp[i][j][k] = max({dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1]});
            }
        }
    }
    return dp[n][m][p];
}`,
      explanation: [
        "One dimension per string. dp[i][j][k] is the LCS of the three prefixes, and the exchange argument that justified the two-string match branch still holds when all three last characters agree: some optimal solution ends with that triple, so dp[i-1][j-1][k-1] + 1 is safe.",
        "If the three characters are not all equal, at least one of them is not the final matched character, so dropping that one loses nothing - hence the max over the three neighbours that shrink a single prefix. There is no need to also consider dropping two at once; that is reached by two successive single drops.",
        "The trap is trying to compose pairwise answers: LCS(LCS(s1,s2), s3) is wrong, because the two-string LCS may pick a shared subsequence that s3 cannot follow while a shorter one could. LCS is not associative in that sense, so the third dimension is not optional.",
        "Cost is the reason the constraints are small. The generalisation to k strings is O(product of lengths), which is exponential in k, and the problem is NP-hard for arbitrary k - so 3D is roughly where this direct approach stops.",
        "Time: O(n*m*p). Space: O(n*m*p), reducible to O(m*p) by keeping only the previous i layer.",
      ],
    },
    {
      name: "Minimum Operations to Make a Subsequence",
      difficulty: "Hard",
      variation: "LCS with one distinct side reduces to LIS",
      link: "https://leetcode.com/problems/minimum-operations-to-make-a-subsequence/",
      question: [
        "You are given an array target that contains distinct integers, and another integer array arr that may contain duplicates. In one operation you may insert any integer at any position in arr. Return the minimum number of operations needed to make target a subsequence of arr.",
        "Example 1:\nInput: target = [5,1,3], arr = [9,4,2,3,4]\nOutput: 2\nExplanation: Only the 3 can be reused, so 5 and 1 must be inserted around it.",
        "Example 2:\nInput: target = [6,4,8,1,3,2], arr = [4,7,6,2,3,8,6,1]\nOutput: 3\nExplanation: A longest common subsequence of the two arrays has length 3 (for example 4, 8, 1), so 6 - 3 = 3 insertions remain.",
        "Constraints:\n- 1 <= target.length, arr.length <= 10^5\n- 1 <= target[i], arr[i] <= 10^9\n- All integers in target are pairwise distinct",
      ],
      code: `int minOperations(vector<int>& target, vector<int>& arr) {
    unordered_map<int,int> pos;
    for (int i = 0; i < (int)target.size(); i++) pos[target[i]] = i;

    // Rewrite arr as the target-indices of its usable elements.
    vector<int> tails;   // tails[len-1] = smallest possible tail of an increasing run of that length
    for (int x : arr) {
        auto it = pos.find(x);
        if (it == pos.end()) continue;                 // value can never help
        int p = it->second;
        auto lb = lower_bound(tails.begin(), tails.end(), p);   // strictly increasing LIS
        if (lb == tails.end()) tails.push_back(p);
        else *lb = p;
    }
    return (int)target.size() - (int)tails.size();
}`,
      explanation: [
        "Insertions only, so the answer is target.size() minus the number of target elements already usable in order inside arr - that is, target.size() - LCS(target, arr). With both lengths up to 10^5 the O(n*m) table is far out of reach, so the reduction is the whole problem.",
        "Because target holds distinct values, each element of arr matches at most one position of target. Replace every element of arr by that unique index (dropping elements absent from target) and a common subsequence becomes a strictly increasing sequence of indices. So LCS(target, arr) equals the LIS of the rewritten array - the Hunt-Szymanski idea, and the reason 'distinct on one side' is stated so prominently.",
        "The LIS is then computed in O(n log n) with the patience-sorting tails array: lower_bound finds the first tail at least as large as p and overwrites it, keeping every prefix length's tail as small as possible. Use lower_bound for a strictly increasing LIS; upper_bound would allow equal indices, which would mean reusing one target position twice.",
        "tails is not itself a valid subsequence of the input - only its length is meaningful. Reconstructing the actual matching needs parent pointers alongside it.",
        "Time: O(n log n) after O(m) hashing. Space: O(m) for the position map plus O(n) for tails.",
      ],
    },
  ],
};
