import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Is Subsequence",
      difficulty: "Easy",
      variation: "Matching with no wildcards, the greedy baseline",
      link: "https://leetcode.com/problems/is-subsequence/",
      question: [
        "Given two strings s and t, return true if s is a subsequence of t. A subsequence of a string is a new string formed from the original by deleting some (possibly zero) characters without disturbing the relative order of the remaining characters.",
        "Example 1:\nInput: s = 'abc', t = 'ahbgdc'\nOutput: true\nExplanation: Keep a, b and c from t in that order and delete h, g and d.",
        "Example 2:\nInput: s = 'axc', t = 'ahbgdc'\nOutput: false\nExplanation: t contains a and c in order but no x between them.",
        "Constraints:\n- 0 <= s.length <= 100\n- 0 <= t.length <= 10^4\n- s and t consist only of lowercase English letters",
      ],
      code: `bool isSubsequence(string s, string t) {
    int i = 0;
    for (char c : t) {
        if (i < (int)s.size() && s[i] == c) i++;   // greedily take the earliest match
    }
    return i == (int)s.size();
}`,
      explanation: [
        "This is the degenerate case of the whole family: a pattern with no wildcards at all, where every pattern character must be spent on some text character in order. The full DP would be dp[i][j] = can the first i characters of t cover the first j characters of s, but the choice structure here is so weak that a single pointer suffices.",
        "The exchange argument behind the greedy: if any valid embedding of s into t exists, the one that always matches s[i] at the earliest possible position in t is also valid. Moving a match later can only shrink the suffix of t left for the remaining characters, so taking the earliest match is never worse.",
        "The trap is over-generalising this greedy. It survives here because a plain character matches exactly one text character. The moment the pattern gains a '*' that can absorb a variable number of characters, greedy alone stops being complete and you need either backtracking or the 2D table - that is exactly what the later problems in this bank are about.",
        "Time: O(n) where n is the length of t. Space: O(1).",
      ],
    },
    {
      name: "Valid Word Abbreviation",
      difficulty: "Easy",
      variation: "Numeric wildcard - a run that skips a fixed count",
      link: "https://leetcode.com/problems/valid-word-abbreviation/",
      question: [
        "A string can be abbreviated by replacing any number of non-adjacent, non-empty substrings with their lengths, written in decimal with no leading zeros. For example 'substitution' can be abbreviated as 's10n' or as 'sub4u4', but not as 's55n', because there the two replaced substrings are adjacent and their counts would run together. Given a non-empty string word and an abbreviation abbr, return whether abbr is a valid abbreviation of word.",
        "Example 1:\nInput: word = 'internationalization', abbr = 'i12iz4n'\nOutput: true\nExplanation: i, then 12 skipped characters (nternationa), then iz, then 4 skipped (atio), then n - exactly 20 characters, the length of word.",
        "Example 2:\nInput: word = 'apple', abbr = 'a2e'\nOutput: false\nExplanation: a matches index 0, then 2 skipped characters land on index 3, which is l and not e. The count would have to be 3 for 'a3e' to work.",
        "Constraints:\n- 1 <= word.length <= 20\n- 1 <= abbr.length <= 10\n- word consists of lowercase English letters\n- abbr consists of lowercase English letters and digits",
      ],
      code: `bool validWordAbbreviation(string word, string abbr) {
    int n = word.size(), m = abbr.size();
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (isdigit(abbr[j])) {
            if (abbr[j] == '0') return false;      // a count may not start with zero
            int num = 0;
            while (j < m && isdigit(abbr[j])) num = num * 10 + (abbr[j++] - '0');
            i += num;                              // skip exactly num characters
        } else {
            if (word[i] != abbr[j]) return false;
            i++;
            j++;
        }
    }
    return i == n && j == m;                       // both must finish together
}`,
      explanation: [
        "The wildcard here is quantified rather than free: a number skips a known count, so there is no branching and no DP. One left-to-right scan with two cursors decides the answer, which is why this sits at the easy end even though it is a genuine pattern-matching problem.",
        "Two rules make the parse unambiguous. Digit runs are read maximally, so 'i12' is one skip of twelve and not a skip of one followed by a skip of two. And a leading zero is rejected, which is what forbids both '0' and things like '01' - otherwise 'a01e' and 'a1e' would be different encodings of the same skip and the problem would not be well posed.",
        "The classic bug is stopping at the first mismatch and forgetting the tail check. If i runs past the end of word (an overlong count) the loop simply exits and i == n fails, so the final conjunction is what catches it. Equally, returning true as soon as word is consumed would accept 'apple' vs 'apple9'.",
        "Time: O(n + m). Space: O(1).",
      ],
    },
    {
      name: "Camelcase Matching",
      difficulty: "Medium",
      variation: "Subsequence match with a constraint on skipped characters",
      link: "https://leetcode.com/problems/camelcase-matching/",
      question: [
        "Given an array of strings queries and a string pattern, return a boolean array where answer[i] is true if queries[i] matches pattern. A query matches the pattern if you can insert lowercase English letters into pattern (at any positions, any number of them, including none) to make it equal to the query. Uppercase letters may not be inserted.",
        "Example 1:\nInput: queries = ['FooBar', 'FooBarTest', 'FootBall', 'FrameBuffer', 'ForceFeedBack'], pattern = 'FB'\nOutput: [true, false, true, true, false]\nExplanation: 'FooBar' is F + oo + B + ar. 'FooBarTest' fails because the trailing T is an uppercase letter that would have to be inserted. 'ForceFeedBack' fails for the same reason - the F of Feed is an unmatched capital.",
        "Example 2:\nInput: queries = ['FooBar', 'FooBarTest', 'FootBall', 'FrameBuffer', 'ForceFeedBack'], pattern = 'FoBa'\nOutput: [true, false, true, false, false]\nExplanation: 'FootBall' is Fo + ot + Ba + ll. 'FrameBuffer' fails because after F the pattern needs an o, and the capital B is reached before any o is found.",
        "Constraints:\n- 1 <= queries.length <= 100\n- 1 <= queries[i].length, pattern.length <= 100\n- All strings consist of English letters only",
      ],
      code: `vector<bool> camelMatch(vector<string>& queries, string pattern) {
    vector<bool> ans;
    int m = pattern.size();
    for (const string& q : queries) {
        int j = 0;
        bool ok = true;
        for (char c : q) {
            if (j < m && c == pattern[j]) {
                j++;                       // consume a pattern character
            } else if (isupper(c)) {
                ok = false;                // an unmatched capital can never be inserted
                break;
            }
        }
        ans.push_back(ok && j == m);
    }
    return ans;
}`,
      explanation: [
        "Read the rule as matching, not as insertion: the pattern must be a subsequence of the query, and every query character left over must be a lowercase letter. Once phrased that way it is the Is Subsequence scan with one extra rejection test.",
        "Greedy consumption is still safe. For an uppercase query character the choice is forced - skipping it is illegal, so if it equals pattern[j] it must be consumed and otherwise the query is dead. For a lowercase character the usual earliest-match exchange argument applies, since skipping it is always permitted.",
        "The subtle case is a capital that matches pattern[j] but is 'wanted' later, for example pattern 'BB' against query 'aBcB'. Consuming the first B is correct and the check j == m at the end catches genuine shortfalls, so no separate backtracking is needed.",
        "The wrong-but-tempting approach is splitting both strings on capital letters and comparing chunk by chunk with prefix tests. It works on the sample but breaks when the pattern has fewer capital groups than the query, and it hides the simpler subsequence invariant.",
        "Time: O(total length of all queries). Space: O(number of queries) for the output.",
      ],
    },
    {
      name: "Design Add and Search Words Data Structure",
      difficulty: "Medium",
      variation: "Single-character wildcard '.' resolved by trie branching",
      link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
      question: [
        "Design a data structure that supports adding words and searching for words, where a search string may contain the wildcard character '.' matching any single letter. Implement WordDictionary with addWord(word), which stores a word, and search(word), which returns true if any stored word matches the given string.",
        "Example 1:\nInput:\naddWord('bad'), addWord('dad'), addWord('mad')\nsearch('pad'), search('bad'), search('.ad'), search('b..')\nOutput: false, true, true, true\nExplanation: 'pad' was never added. '.ad' matches bad, dad and mad. 'b..' matches bad.",
        "Constraints:\n- 1 <= word.length <= 25\n- Words added consist of lowercase English letters\n- Search strings consist of lowercase English letters and dots, with at most 2 dots\n- At most 10^4 calls to addWord and search",
      ],
      code: `class WordDictionary {
    struct Node {
        Node* nxt[26] = {};
        bool end = false;
    };
    Node* root = new Node();

    bool dfs(Node* cur, const string& w, int i) {
        if (!cur) return false;
        if (i == (int)w.size()) return cur->end;
        if (w[i] != '.') return dfs(cur->nxt[w[i] - 'a'], w, i + 1);
        for (int c = 0; c < 26; c++) {                    // a dot branches over every child
            if (dfs(cur->nxt[c], w, i + 1)) return true;
        }
        return false;
    }

public:
    void addWord(string word) {
        Node* cur = root;
        for (char ch : word) {
            int c = ch - 'a';
            if (!cur->nxt[c]) cur->nxt[c] = new Node();
            cur = cur->nxt[c];
        }
        cur->end = true;
    }

    bool search(string word) {
        return dfs(root, word, 0);
    }
};`,
      explanation: [
        "This is the wildcard family without the hard part. A '.' consumes exactly one character, so the pattern length pins the word length and there is no variable-length branching - only a 26-way choice at each dot.",
        "The state is (trie node, pattern index), and the trie is what keeps the search cheap: instead of testing the pattern against every stored word, a fixed prefix walks a single edge and only a dot fans out, and dead branches are cut off the moment a child pointer is null.",
        "Note where the terminal test lives. Reaching the end of the pattern is not a match unless the node is marked end of word, otherwise search('ba') would succeed after adding 'bad'.",
        "The naive alternative - store a vector of words and run a linear matcher per query - is O(number of words times length) per search and times out at 10^4 queries. Bucketing words by length helps but still degrades; the trie shares prefixes so repeated work disappears.",
        "Time: O(L) per search with no dots and O(26^d * L) with d dots, where L is the pattern length. Space: O(total characters added * 26).",
      ],
    },
    {
      name: "Wildcard Matching",
      difficulty: "Hard",
      variation: "'?' and '*' with a 2D DP table - the core template",
      link: "https://leetcode.com/problems/wildcard-matching/",
      question: [
        "Given an input string s and a pattern p, implement wildcard pattern matching where '?' matches any single character and '*' matches any sequence of characters, including the empty sequence. The match must cover the entire input string, not a partial substring.",
        "Example 1:\nInput: s = 'adceb', p = '*a*b'\nOutput: true\nExplanation: The first star matches the empty sequence, then a matches a, the second star matches dce, and b matches b.",
        "Example 2:\nInput: s = 'acdcb', p = 'a*c?b'\nOutput: false\nExplanation: After a and the star, the pattern still needs c, one arbitrary character and b, and no split of cdcb satisfies that.",
        "Constraints:\n- 0 <= s.length, p.length <= 2000\n- s contains only lowercase English letters\n- p contains lowercase English letters plus '?' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    // dp[i][j] = does the first i characters of s match the first j of p
    vector<vector<char>> dp(n + 1, vector<char>(m + 1, 0));
    dp[0][0] = 1;
    for (int j = 1; j <= m; j++) {
        dp[0][j] = dp[0][j - 1] && p[j - 1] == '*';   // only a run of stars matches empty s
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (p[j - 1] == '*') {
                // star matches empty, or absorbs s[i-1] and stays available
                dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
            } else {
                bool same = (p[j - 1] == '?' || p[j - 1] == s[i - 1]);
                dp[i][j] = same && dp[i - 1][j - 1];
            }
        }
    }
    return dp[n][m];
}`,
      explanation: [
        "State: dp[i][j] is true when the prefix s[0..i-1] is fully matched by the prefix p[0..j-1]. Both indices are prefix lengths, which is what makes the empty-string row and column expressible.",
        "The star transition is the only interesting one, and it is a two-case split on what the star does with the last text character. Either the star matches nothing, in which case the pattern prefix without it must already match all of s[0..i-1], giving dp[i][j-1]; or the star absorbs s[i-1] and remains available for more, giving dp[i-1][j]. Every possible star length is covered because dp[i-1][j] itself unfolds the same two cases one character earlier. A non-star pattern character consumes exactly one text character, so it reduces to dp[i-1][j-1] gated by a character test.",
        "The base row is where most wrong submissions live. dp[0][j] must stay true only while the pattern prefix is nothing but stars, and it must break permanently at the first non-star. Filling that row with a plain 'p[j-1] == star' test rather than chaining from dp[0][j-1] wrongly accepts patterns like 'a*' against the empty string.",
        "The tempting wrong transition is dp[i][j] = dp[i-1][j-1] || dp[i-1][j] for a star, which quietly forbids the star from matching the empty sequence and fails on s = 'ab', p = 'a*b*'.",
        "Because each row depends only on the previous row and on cells to its left, the table collapses to two rows of size m+1, or one row plus a saved diagonal.",
        "Time: O(n*m). Space: O(n*m), reducible to O(m).",
      ],
    },
    {
      name: "Wildcard Matching - Greedy Two Pointers",
      difficulty: "Hard",
      variation: "'?' and '*' in O(1) space with star backtracking",
      link: "https://leetcode.com/problems/wildcard-matching/",
      question: [
        "Same problem as above: match s against a pattern p containing '?' (any single character) and '*' (any sequence, possibly empty), covering the whole of s. This time solve it in constant extra space, without building a table.",
        "Example 1:\nInput: s = 'aa', p = '*'\nOutput: true\nExplanation: One star absorbs the whole string.",
        "Example 2:\nInput: s = 'cb', p = '?a'\nOutput: false\nExplanation: The '?' takes c, then a must match b, which fails, and there is no star to fall back on.",
        "Constraints:\n- 0 <= s.length, p.length <= 2000\n- s contains only lowercase English letters\n- p contains lowercase English letters plus '?' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    int i = 0, j = 0;
    int star = -1;      // pattern index of the most recent star
    int iAtStar = 0;    // text index that star is currently assumed to start absorbing at
    while (i < n) {
        if (j < m && (p[j] == '?' || p[j] == s[i])) {
            i++;
            j++;
        } else if (j < m && p[j] == '*') {
            star = j++;          // tentatively let this star absorb nothing
            iAtStar = i;
        } else if (star != -1) {
            j = star + 1;        // undo everything after the star
            i = ++iAtStar;       // and let it absorb one more character
        } else {
            return false;        // mismatch with no star to blame
        }
    }
    while (j < m && p[j] == '*') j++;   // trailing stars may match empty
    return j == m;
}`,
      explanation: [
        "The same recursion as the table, but with a key observation that removes the need to remember more than one branch point: only the most recent star ever has to be revisited. If a mismatch occurs, extending an earlier star instead of the latest one produces a text suffix that the latest star could have absorbed anyway, so the latest star dominates.",
        "So the algorithm walks forward assuming every star absorbs as little as possible, and on failure rewinds the pattern to just past the last star and hands that star one more character. Progress is guaranteed because iAtStar strictly increases on every rewind, so the loop cannot cycle.",
        "The tail loop is not cosmetic. Exiting with i == n means the text is consumed, but the pattern may still hold stars, and only stars are allowed to remain. Returning true without skipping them accepts s = 'a', p = 'ab'.",
        "The trap is thinking this is a pure greedy. It is backtracking with a bound of one saved state - which is why the worst case is quadratic rather than linear, on inputs like s = 'aaaa...aab' with p = '*a*a*a*b'.",
        "In practice this beats the DP on typical inputs and uses no memory, but the table is the version that generalises - to regex, to counting matches, to edit distance. Know both and reach for the table when the pattern language grows.",
        "Time: O(n*m) worst case, close to O(n + m) in practice. Space: O(1).",
      ],
    },
    {
      name: "Regular Expression Matching",
      difficulty: "Hard",
      variation: "'.' and '*' where the star binds to the preceding character",
      link: "https://leetcode.com/problems/regular-expression-matching/",
      question: [
        "Given an input string s and a pattern p, implement regular expression matching with support for '.' which matches any single character, and '*' which matches zero or more of the element immediately before it. The match must cover the entire input string. It is guaranteed that every '*' in p has a valid preceding element.",
        "Example 1:\nInput: s = 'aab', p = 'c*a*b'\nOutput: true\nExplanation: c* matches zero c characters, a* matches aa, then b matches b.",
        "Example 2:\nInput: s = 'mississippi', p = 'mis*is*p*.'\nOutput: false\nExplanation: The pattern can reach mississip at best, and the final '.' then has nothing valid left to align with the remaining pi.",
        "Constraints:\n- 1 <= s.length <= 20\n- 1 <= p.length <= 20\n- s contains only lowercase English letters\n- p contains lowercase English letters plus '.' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    // dp[i][j] = does the first i characters of s match the first j of p
    vector<vector<char>> dp(n + 1, vector<char>(m + 1, 0));
    dp[0][0] = 1;
    for (int j = 2; j <= m; j++) {
        if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];   // x* drops out entirely
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (j >= 2 && p[j - 1] == '*') {
                dp[i][j] = dp[i][j - 2];               // zero copies of p[j-2]
                bool same = (p[j - 2] == '.' || p[j - 2] == s[i - 1]);
                if (same) dp[i][j] = dp[i][j] || dp[i - 1][j];   // one more copy
            } else if (p[j - 1] != '*') {
                bool same = (p[j - 1] == '.' || p[j - 1] == s[i - 1]);
                dp[i][j] = same && dp[i - 1][j - 1];
            }
        }
    }
    return dp[n][m];
}`,
      explanation: [
        "Same state as wildcard matching - dp[i][j] over prefix lengths - but the alphabet of the pattern changes the transitions in one crucial way: '*' is a postfix operator on the previous token, not a standalone token. So the unit of pattern consumption is two characters wide whenever p[j-1] is a star, which is why every index steps by 2 there.",
        "The star transition splits on how many copies of the element are used. Zero copies deletes the pair p[j-2]p[j-1] from consideration, giving dp[i][j-2] with no character test at all. One or more copies means p[j-2] must match s[i-1] and the same starred pair remains live, giving dp[i-1][j]. Recursively unfolding the second case reproduces every possible repetition count, so the two cases are exhaustive.",
        "The base row shows why 'zero copies' needs no character test: 'a*b*c*' matches the empty string, and dp[0][j] = dp[0][j-2] propagates that through the pairs while any bare letter permanently blocks it.",
        "The difference from '?' and '*' is worth stating plainly. In wildcard matching a star is self-contained and matches anything; here 'a*' can only absorb a characters, so the wildcard transition dp[i-1][j] must be guarded by a character comparison. Copying the wildcard code without that guard makes 'a*' behave like '.*'.",
        "The other classic bug is checking dp[i-1][j-1] instead of dp[i-1][j] for the consume case, which allows only a single copy and fails on s = 'aaa', p = 'a*'.",
        "Time: O(n*m). Space: O(n*m), reducible to O(m) with two rows.",
      ],
    },
    {
      name: "Distinct Subsequences",
      difficulty: "Hard",
      variation: "Counting matches instead of deciding a boolean",
      link: "https://leetcode.com/problems/distinct-subsequences/",
      question: [
        "Given two strings s and t, return the number of distinct subsequences of s which equal t. Two subsequences are distinct if they use different sets of positions in s, even when the resulting strings are identical.",
        "Example 1:\nInput: s = 'rabbbit', t = 'rabbit'\nOutput: 3\nExplanation: Keep r, a, then two of the three b characters, then i and t - there are three ways to choose which b to drop.",
        "Example 2:\nInput: s = 'babgbag', t = 'bag'\nOutput: 5\nExplanation: Indexing s as b0 a1 b2 g3 b4 a5 g6, the five position sets are (0,1,3), (0,1,6), (0,5,6), (2,5,6) and (4,5,6).",
        "Constraints:\n- 1 <= s.length, t.length <= 1000\n- s and t consist of English letters\n- The answer fits in a 32-bit signed integer",
      ],
      code: `int numDistinct(string s, string t) {
    int n = s.size(), m = t.size();
    // dp[j] = number of ways the processed prefix of s spells the first j of t
    vector<unsigned long long> dp(m + 1, 0);
    dp[0] = 1;                       // the empty target is spelled exactly one way
    for (int i = 1; i <= n; i++) {
        // descending j so dp[j-1] still holds the previous row
        for (int j = m; j >= 1; j--) {
            if (s[i - 1] == t[j - 1]) dp[j] += dp[j - 1];
        }
    }
    return (int)dp[m];
}`,
      explanation: [
        "Turn the matching table into a counting table: dp[i][j] is the number of ways the first i characters of s produce the first j characters of t. The recurrence is the boolean one with OR replaced by addition, which is the standard upgrade from 'is there a match' to 'how many matches'.",
        "Split on whether s[i-1] is used. Not using it leaves dp[i-1][j] always. Using it is only legal when s[i-1] == t[j-1], and then it accounts for dp[i-1][j-1] ways. The two sets of position choices are disjoint - they differ on whether index i-1 is in the set - so adding them neither double counts nor loses anything.",
        "dp[i][0] = 1 for every i is the base case that makes the whole thing work: there is exactly one way to spell nothing, namely take no positions. Setting it to 0 collapses the table.",
        "The rolling-array direction is the subtle part. Because the transition reads dp[i-1][j] and dp[i-1][j-1], iterating j downward means dp[j-1] has not yet been overwritten this row and still holds the previous row's value. Iterating upward would read a value already updated for row i and count subsequences that reuse the same character of s twice.",
        "The problem guarantees the answer fits in 32 bits, but intermediate cells can exceed that on adversarial inputs, so accumulating in a 64-bit unsigned type and narrowing only at the end avoids signed overflow.",
        "Time: O(n*m). Space: O(m).",
      ],
    },
    {
      name: "Minimum Window Subsequence",
      difficulty: "Hard",
      variation: "Locating the shortest matching window, not just testing a match",
      link: "https://leetcode.com/problems/minimum-window-subsequence/",
      question: [
        "Given strings s1 and s2, find the minimum contiguous substring w of s1 such that s2 is a subsequence of w. If there is no such window return the empty string. If there are multiple shortest windows, return the leftmost one.",
        "Example 1:\nInput: s1 = 'abcdebdde', s2 = 'bde'\nOutput: 'bcde'\nExplanation: 'bcde' has length 4 and contains b, d, e in order. 'bdde' also has length 4, so the leftmost one wins.",
        "Example 2:\nInput: s1 = 'abcdebdde', s2 = 'bdf'\nOutput: ''\nExplanation: s1 contains no f at all, so no window can hold s2 as a subsequence.",
        "Constraints:\n- 1 <= s1.length <= 2 * 10^4\n- 1 <= s2.length <= 100\n- Both strings consist of lowercase English letters",
      ],
      code: `string minWindow(string s1, string s2) {
    int n = s1.size(), m = s2.size();
    int best = INT_MAX, bestStart = -1;
    int i = 0;
    while (i < n) {
        int j = 0, k = i;
        while (k < n) {                        // forward: find any match starting at or after i
            if (s1[k] == s2[j] && ++j == m) break;
            k++;
        }
        if (j < m) break;                      // no match left anywhere
        int end = k;
        j = m - 1;
        while (j >= 0) {                       // backward: pull the start as far right as possible
            if (s1[k] == s2[j]) j--;
            k--;
        }
        int start = k + 1;
        if (end - start + 1 < best) {
            best = end - start + 1;
            bestStart = start;
        }
        i = start + 1;                         // next candidate must begin later
    }
    return bestStart == -1 ? "" : s1.substr(bestStart, best);
}`,
      explanation: [
        "Matching is only half the problem: the answer is a pair of endpoints, so the algorithm has to reconstruct where a match sits, not merely whether one exists. The technique is a forward-then-backward sweep. Scan forward greedily until s2 is fully matched, which fixes a valid end position, then scan backward greedily from that end to pull the start as far right as possible.",
        "Both sweeps are greedy for the same exchange reason as Is Subsequence. The forward pass yields the earliest end for a match beginning at or after i, and the backward pass then yields the latest start compatible with that end, so the window it reports is minimal among all windows with that end. Iterating i over start+1 enumerates one candidate per distinct feasible start, and every optimal window is a candidate.",
        "Using strictly less-than when updating best is what delivers the leftmost tie-break - candidates are generated left to right, so an equal-length later window never replaces an earlier one.",
        "The DP alternative is dp[i][j] = the largest start index such that s2[0..j-1] is a subsequence of s1[start..i-1]. It is easier to prove correct but costs O(n*m) time and memory, which at n = 2*10^4 and m = 100 is 2 million cells - workable but wasteful next to the two-pointer sweep.",
        "The trap is treating this like the classic Minimum Window Substring with a frequency map. Order matters here, so counting characters is simply the wrong model - it would accept 'edb' as containing 'bde'.",
        "Time: O(n*m) worst case for the repeated sweeps. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Decode Ways II",
      difficulty: "Hard",
      variation: "'*' as a wildcard digit, counted under a modulus",
      link: "https://leetcode.com/problems/decode-ways-ii/",
      question: [
        "A message is encoded by mapping A to '1' through Z to '26' and concatenating the codes. Some digits have been replaced by '*', which may stand for any digit from 1 to 9. Given the encoded string s, return the number of ways to decode it, modulo 10^9 + 7. A group of one or two digits is only decodable if it has no leading zero and its value is between 1 and 26.",
        "Example 1:\nInput: s = '*'\nOutput: 9\nExplanation: The star can be any of 1 through 9, giving A through I.",
        "Example 2:\nInput: s = '1*'\nOutput: 18\nExplanation: The string can be 11 through 19. Each of those nine strings decodes two ways - as two single digits, or as one two-digit code - so 9 * 2 = 18.",
        "Example 3:\nInput: s = '2*'\nOutput: 15\nExplanation: Nine strings 21 through 29, each decodable as two singles, plus the six of them from 21 to 26 that also decode as one code: 9 + 6 = 15.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of digits and the character '*'",
      ],
      code: `int numDecodings(string s) {
    const long long MOD = 1000000007LL;
    int n = s.size();
    long long prev2 = 0, prev1 = 1;   // dp[i-2] and dp[i-1]; dp[0] = 1 for the empty prefix
    for (int i = 1; i <= n; i++) {
        char c = s[i - 1];
        long long cur = 0;
        // take the last character alone
        if (c == '*') cur = 9 * prev1 % MOD;
        else if (c != '0') cur = prev1;
        // take the last two characters as one code
        if (i >= 2) {
            char b = s[i - 2];
            if (b == '*' && c == '*') cur = (cur + 15 * prev2) % MOD;        // 11..19 and 21..26
            else if (b == '*') cur = (cur + (c <= '6' ? 2 : 1) * prev2) % MOD;  // 1c always, 2c if c <= 6
            else if (c == '*') {
                if (b == '1') cur = (cur + 9 * prev2) % MOD;                 // 11..19
                else if (b == '2') cur = (cur + 6 * prev2) % MOD;            // 21..26
            } else {
                int v = (b - '0') * 10 + (c - '0');
                if (v >= 10 && v <= 26) cur = (cur + prev2) % MOD;
            }
        }
        prev2 = prev1;
        prev1 = cur % MOD;
    }
    return (int)prev1;
}`,
      explanation: [
        "State: dp[i] is the number of decodings of the first i characters. The split is on the size of the last code, one character or two, and those two families are disjoint because a decoding has exactly one final group. That makes dp[i] = (ways the last char stands alone) * dp[i-1] + (ways the last two form a code) * dp[i-2].",
        "The wildcard turns each coefficient from a 0/1 test into a count of admissible digit assignments. A lone '*' has 9 choices. For a two-character group the count is the number of (first, second) digit pairs in 10..26 consistent with the given characters: 15 for '**' (nine values 11..19 plus six values 21..26), 9 for '1*', 6 for '2*', and for '*d' either 2 when d <= 6 or 1 otherwise, since '1d' is always valid and '2d' only up to 26.",
        "A star never stands for 0, which is what keeps '*0' at exactly two pairs (10 and 20) and makes a literal '0' contribute nothing on its own. Forgetting that and allowing 0 inflates every star coefficient by one.",
        "Zeros are the classic source of wrong answers: a '0' has no single-character decoding at all, so its dp entry comes only from the two-character branch, and a string like '100' correctly yields 0 because the trailing 0 can pair only with the preceding 0.",
        "Only two previous values are ever read, so the table collapses to two variables - necessary in spirit here since n reaches 10^5. Reducing at each step keeps every product under about 15 * 10^9, which fits in a signed 64-bit value.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Check if an Original String Exists Given Two Encoded Strings",
      difficulty: "Hard",
      variation: "Variable-length wildcards on both sides, state = length difference",
      link: "https://leetcode.com/problems/check-if-an-original-string-exists-given-two-encoded-strings/",
      question: [
        "An original string is encoded by splitting it into an arbitrary sequence of non-empty substrings and then replacing each chosen substring, independently, either by itself or by its length written in decimal. Given two encoded strings s1 and s2, return true if some single original string could have produced both.",
        "Example 1:\nInput: s1 = 'internationalization', s2 = 'i18n'\nOutput: true\nExplanation: Both encode the original 'internationalization' - the second replaced the 18-character middle by its length.",
        "Example 2:\nInput: s1 = 'l123e', s2 = '44'\nOutput: true\nExplanation: Both encode 'leetcode'. The first splits it as l | ee | tco | de and replaces the last three by 1, 2 and 3 - note that the digit run 123 has to be read as three separate tokens. The second splits it as leet | code and replaces both by 4.",
        "Example 3:\nInput: s1 = 'a5b', s2 = 'c5b'\nOutput: false\nExplanation: The originals must start with a and with c respectively, and no choice for the length-5 runs can reconcile that.",
        "Constraints:\n- 1 <= s1.length, s2.length <= 40\n- Each string consists of lowercase English letters and digits\n- Any digit run in either string has length 1 to 3 (so a length token is at most 999)",
      ],
      code: `class Solution {
    string a, b;
    int n1 = 0, n2 = 0;
    // memo[i][j][diff + 1000]: -1 unknown, 0 false, 1 true.
    // diff = characters of the original already committed by a minus those by b.
    vector<vector<vector<signed char>>> memo;

    bool dfs(int i, int j, int diff) {
        int key = diff + 1000;
        if (memo[i][j][key] != -1) return memo[i][j][key] == 1;
        bool res = false;
        if (diff == 0) {
            if (i == n1 && j == n2) {
                res = true;
            } else if (i < n1 && isdigit(a[i])) {
                int v = 0;                                  // expand a's digit run
                for (int k = i; k < n1 && isdigit(a[k]) && !res; k++) {
                    v = v * 10 + (a[k] - '0');
                    res = dfs(k + 1, j, v);
                }
            } else if (j < n2 && isdigit(b[j])) {
                int v = 0;
                for (int k = j; k < n2 && isdigit(b[k]) && !res; k++) {
                    v = v * 10 + (b[k] - '0');
                    res = dfs(i, k + 1, -v);
                }
            } else if (i < n1 && j < n2 && a[i] == b[j]) {
                res = dfs(i + 1, j + 1, 0);                 // both aligned on letters
            }
        } else if (diff > 0) {
            if (j < n2) {                                   // b is behind, advance only b
                if (isdigit(b[j])) {
                    int v = 0;
                    for (int k = j; k < n2 && isdigit(b[k]) && !res; k++) {
                        v = v * 10 + (b[k] - '0');
                        res = dfs(i, k + 1, diff - v);
                    }
                } else {
                    res = dfs(i, j + 1, diff - 1);          // this letter falls inside a's number
                }
            }
        } else {
            if (i < n1) {                                   // a is behind, advance only a
                if (isdigit(a[i])) {
                    int v = 0;
                    for (int k = i; k < n1 && isdigit(a[k]) && !res; k++) {
                        v = v * 10 + (a[k] - '0');
                        res = dfs(k + 1, j, diff + v);
                    }
                } else {
                    res = dfs(i + 1, j, diff + 1);
                }
            }
        }
        memo[i][j][key] = res ? 1 : 0;
        return res;
    }

public:
    bool possiblyEquals(string s1, string s2) {
        a = s1;
        b = s2;
        n1 = a.size();
        n2 = b.size();
        memo.assign(n1 + 1, vector<vector<signed char>>(n2 + 1, vector<signed char>(2001, -1)));
        return dfs(0, 0, 0);
    }
};`,
      explanation: [
        "The hardest member of the family: both sides carry variable-length wildcards, since a digit run is a wildcard of known length but unknown content, and the run itself can be split many ways (the three characters '123' can be read as 123, or 1 then 23, or 12 then 3, or 1 then 2 then 3). So the state must record how far each side has got and how far out of step the two reconstructions are.",
        "State: (i, j, diff), where i and j are cursors into s1 and s2 and diff is the number of original characters s1's reconstruction has committed beyond s2's. Concrete letters are only compared when diff == 0; when one side is ahead, the characters the other side produces are being swallowed by a number on the leading side and their identity is irrelevant, which is exactly why a letter can be consumed with diff - 1 and no comparison.",
        "Always advancing the lagging side is what bounds the state space. From diff == 0 an expansion adds at most 999, and the next expansion on the other side subtracts at most 999, so diff never leaves roughly [-999, 999] and a 2001-wide third dimension suffices. Expanding whichever side you feel like instead lets diff drift and blows up the table.",
        "Expanding a digit run one character at a time inside the loop is how all splittings of that run are enumerated: the prefix read so far becomes one number, and the recursion re-enters at k+1 where the rest of the run is treated as fresh tokens.",
        "The tempting wrong model is to reduce each string to (letters, total skipped length) and compare - it ignores where the gaps sit, and accepts pairs like 'a5b' with 'c5b'. Equally wrong is committing a whole digit run to a single number, which would reject cases needing '1' then '23'.",
        "Time: O(n1 * n2 * 2000 * 3) states-with-transitions, which is fine for lengths up to 40. Space: O(n1 * n2 * 2000).",
      ],
    },
  ],
};
