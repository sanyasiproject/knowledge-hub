import type { TopicContent } from "../types";

export const wildcardRegexMatching: TopicContent = {
  quickSummary: [
    "Both variants are the same 2D DP: `dp[i][j]` = does the first `i` chars of the text match the first `j` chars of the pattern.",
    "The whole difference is what `*` means. **Wildcard**: `*` stands alone and eats any run of characters. **Regex**: `*` binds to the character *before* it and repeats that character zero or more times.",
    "DP is O(n·m) time and O(n·m) space (O(m) rolled). Wildcard alone also has a greedy two-pointer solution: O(n·m) worst case but O(n) typical, O(1) space.",
  ],
  detailed: [
    "Both problems ask the same question — can this pattern consume this entire text — and both answer it with a table indexed by prefix lengths. `dp[i][j]` is true when text prefix of length `i` is fully matched by pattern prefix of length `j`. The answer is `dp[n][m]`, and `dp[0][0]` is true because an empty pattern matches empty text.\n\nKey insight: `*` is the only cell that branches. Every non-star pattern character is a plain diagonal step, so if you get the star rule right the rest writes itself.",
    "## The two star semantics\n\n| | Wildcard (`?` `*`) | Regex (`.` `*`) |\n| --- | --- | --- |\n| Single-char joker | `?` | `.` |\n| `*` means | any sequence, standing alone | zero or more of the **preceding** element |\n| Valid alone? | yes — `*` is a whole pattern | no — `*` must follow a char or `.` |\n| Star recurrence | `dp[i][j] = dp[i-1][j] \\|\\| dp[i][j-1]` | `dp[i][j] = dp[i][j-2] \\|\\| (prevMatches && dp[i-1][j])` |\n| Star look-back | none | `p[j-2]` |\n\nIn the wildcard rule, `dp[i][j-1]` means the star matches the empty string and `dp[i-1][j]` means it swallows one more text character. In the regex rule, `dp[i][j-2]` **drops the whole `x*` unit** (two pattern cells, hence `j-2`), and `dp[i-1][j]` consumes one more copy of `p[j-2]` while keeping the unit alive.\n\nClassic problems: **Wildcard Matching**, **Regular Expression Matching**.",
    "## Base row: the only place people lose points\n\nRow 0 is \"can this pattern prefix match the empty text\". It is not all-false, and getting it wrong makes every leading-star case fail.\n\n- Wildcard: `dp[0][j] = dp[0][j-1] && p[j-1] == '*'` — true only while the pattern is an unbroken run of stars.\n- Regex: start at `j = 2` and set `dp[0][j] = dp[0][j-2]` when `p[j-1] == '*'` — because `a*b*c*` matches empty, but the units are two cells wide.\n\nCommon mistake: initialising only `dp[0][0]` and leaving row 0 false. Then `\"\"` vs `\"*\"` and `\"\"` vs `\"a*b*\"` both wrongly return false, and so does anything whose match requires a leading star to absorb a prefix.",
    "## Recognition cue and the greedy alternative\n\nReach for this when the input is a text plus a **pattern with metacharacters**, matching must cover the entire string (not a substring search), and you need an exact yes/no. If there are no metacharacters, it is plain comparison; if you need all occurrences of a literal, use KMP or Z-algorithm instead.\n\nFor wildcards only, a greedy two-pointer works: walk both strings, and when you hit `*` remember its position and the text index, then on a later mismatch backtrack to \"that star eats one more character\". This is correct because a wildcard `*` is unconstrained, so a longest-viable-prefix strategy never needs to revisit an earlier star. That reasoning fails for regex `*`, where the star is tied to a specific character — regex needs the DP (or a backtracking matcher).\n\nIn practice: quote the DP as O(n·m) time, O(m) space with a rolled row, and mention the greedy O(1)-space wildcard variant as the follow-up optimisation.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Wildcard matching — 2D DP, plus the O(1)-space greedy two-pointer",
      source: `// '?' matches exactly one char; '*' matches any sequence, including empty.
bool wildcardDP(const string& s, const string& p) {
    int n = (int)s.size(), m = (int)p.size();
    vector<vector<char>> dp(n + 1, vector<char>(m + 1, false));
    dp[0][0] = true;
    for (int j = 1; j <= m; ++j)                       // leading run of '*' matches ""
        dp[0][j] = dp[0][j - 1] && p[j - 1] == '*';

    for (int i = 1; i <= n; ++i)
        for (int j = 1; j <= m; ++j) {
            if (p[j - 1] == '*')
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];   // eat one more | match empty
            else
                dp[i][j] = dp[i - 1][j - 1] &&
                           (p[j - 1] == '?' || p[j - 1] == s[i - 1]);
        }
    return dp[n][m];
}
// Time O(n*m), space O(n*m) — rolls to O(m) since row i needs only row i-1.

// Greedy: correct only because a wildcard '*' is unconstrained.
bool wildcardGreedy(const string& s, const string& p) {
    int i = 0, j = 0, star = -1, mark = 0;
    int n = (int)s.size(), m = (int)p.size();
    while (i < n) {
        if (j < m && (p[j] == '?' || p[j] == s[i])) { ++i; ++j; }
        else if (j < m && p[j] == '*') { star = j++; mark = i; }  // star eats nothing yet
        else if (star >= 0) { j = star + 1; i = ++mark; }         // backtrack: eat one more
        else return false;
    }
    while (j < m && p[j] == '*') ++j;                  // trailing stars may match empty
    return j == m;
}
// Space O(1). Linear on typical inputs; worst case still O(n*m).`,
    },
    {
      language: "cpp",
      caption: "Regex matching — '*' binds to the PREVIOUS character",
      source: `// '.' matches exactly one char; '*' repeats the preceding element zero or more times.
bool regexDP(const string& s, const string& p) {
    int n = (int)s.size(), m = (int)p.size();
    vector<vector<char>> dp(n + 1, vector<char>(m + 1, false));
    dp[0][0] = true;
    for (int j = 2; j <= m; ++j)                       // "a*b*c*" can match ""
        if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];  // units are TWO cells wide

    for (int i = 1; i <= n; ++i)
        for (int j = 1; j <= m; ++j) {
            if (p[j - 1] == '*') {
                bool prevMatches = j >= 2 &&
                    (p[j - 2] == '.' || p[j - 2] == s[i - 1]);
                dp[i][j] = dp[i][j - 2]                       // drop the whole "x*" unit
                        || (prevMatches && dp[i - 1][j]);     // consume one more copy
            } else {
                dp[i][j] = dp[i - 1][j - 1] &&
                           (p[j - 1] == '.' || p[j - 1] == s[i - 1]);
            }
        }
    return dp[n][m];
}
// Time O(n*m), space O(n*m) -> O(m) rolled.
// Verified edge cases: ("","") true, ("","a*b*") true, ("",".*") true, ("","a") false,
// ("aa","a") false, ("aa","a*") true, ("aab","c*a*b") true, ("a","ab*") true,
// ("abcd","d*") false, ("ab",".*c") false.`,
    },
  ],
  cheatSheet: [
    "`dp[i][j]` = first `i` text chars matched by first `j` pattern chars; answer `dp[n][m]`, `dp[0][0] = true`.",
    "Wildcard star: `dp[i][j] = dp[i-1][j] || dp[i][j-1]` (eat one more, or match empty).",
    "Regex star: `dp[i][j] = dp[i][j-2] || (p[j-2] matches s[i-1] && dp[i-1][j])` — `j-2` because `x*` is one two-cell unit.",
    "Base row is mandatory: wildcard needs an unbroken star run; regex starts at `j=2` with `dp[0][j] = dp[0][j-2]`.",
    "Both O(n·m) time, O(m) space rolled. Wildcard only also has a greedy two-pointer in O(1) space.",
  ],
  interviewQA: [
    {
      q: "What is the difference between wildcard `*` and regex `*`, and how does it change the recurrence?",
      a: "Wildcard `*` is a standalone token meaning 'any sequence of characters, possibly empty', so it consumes text without reference to any other pattern character. Its recurrence at a star cell is `dp[i][j] = dp[i-1][j] || dp[i][j-1]`: either the star swallows one more text character while staying alive, or it matches the empty string and I move past it by one pattern cell. Regex `*` is a quantifier on the element immediately before it, so `a*` is a single two-cell unit meaning zero or more `a`s. Its recurrence is `dp[i][j] = dp[i][j-2] || (p[j-2] matches s[i-1] && dp[i-1][j])`: either I drop the entire unit, which is why the index steps back by two rather than one, or the preceding element matches the current text character and I consume one more copy. Everything else — the table shape, the diagonal step for literals and for `?`/`.`, the O(n·m) time and O(m) rolled space — is identical.",
      followUps: [
        "Why does the regex zero-case use `j-2` instead of `j-1`?",
        "How would you extend the regex DP to support `+`?",
      ],
    },
    {
      q: "How do you initialise the DP table, and what breaks if you skip it?",
      a: "`dp[0][0]` is true — empty pattern matches empty text — and column 0 for `i > 0` is all false, since a non-empty text cannot be matched by an empty pattern. The subtle part is row 0: which pattern prefixes match the empty text. For wildcards that is an unbroken leading run of stars, so `dp[0][j] = dp[0][j-1] && p[j-1] == '*'`; the conjunction with the previous cell is what stops the run at the first non-star. For regex it is any sequence of `x*` units, so I loop from `j = 2` and set `dp[0][j] = dp[0][j-2]` whenever `p[j-1]` is a star. If I skip row 0, matching `\"\"` against `\"*\"` or against `\"a*b*\"` returns false, and worse, any real match that needs a leading star to absorb a prefix silently fails because the whole first row it depends on is dead. It is the single most common bug in both problems.",
      followUps: [
        "What does column 0 look like and why is it all false below row 0?",
        "How do you validate a malformed pattern that starts with `*` in the regex variant?",
      ],
    },
    {
      q: "Wildcard matching has an O(1)-space greedy solution. Why does the same trick not work for regex?",
      a: "The greedy scan walks both strings; on a mismatch it falls back to the most recent `*` and lets that star absorb one additional text character. This is correct for wildcards because a `*` is unconstrained — it accepts any characters at all — so if a match exists, there is one in which each star greedily takes the shortest run that lets the scan proceed, and backtracking to the latest star is always sufficient. No earlier star ever needs revisiting, because any text an earlier star could have absorbed the later star can absorb just as well. Regex `*` is tied to a specific character or to `.`, so a star cannot absorb arbitrary text; the choice of how many copies each quantifier takes interacts across quantifiers and a single local backtrack point is not enough. That is precisely the case the DP handles by keeping every `(i, j)` state. So: wildcard greedy is O(1) space with O(n·m) worst case and near-linear typical behaviour; regex needs the O(n·m) DP or a memoised backtracking matcher with the same bound.",
      followUps: [
        "Construct an input that drives the wildcard greedy to its worst case.",
        "How does a memoised recursive regex matcher compare to the bottom-up table?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Wildcard `*` vs regex `*`",
      back: "Wildcard: standalone, matches any sequence — `dp[i-1][j] || dp[i][j-1]`. Regex: quantifies the PREVIOUS element — `dp[i][j-2] || (prev matches && dp[i-1][j])`.",
    },
    {
      front: "Base row for pattern matching DP",
      back: "Wildcard: `dp[0][j] = dp[0][j-1] && p[j-1]=='*'`. Regex: from `j=2`, `dp[0][j] = dp[0][j-2]` when `p[j-1]=='*'`. Skipping it breaks every leading-star case.",
    },
    {
      front: "Complexity of pattern matching DP",
      back: "O(n·m) time, O(n·m) space, rolls to O(m). Wildcard-only greedy two-pointer: O(1) space, O(n) typical, O(n·m) worst case.",
    },
  ],
};
