import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Optimal Strategy For A Game",
      difficulty: "Medium",
      variation: "Pick from either end, maximise own total - the template",
      link: "https://www.geeksforgeeks.org/optimal-strategy-for-a-game-dp-31/",
      question: [
        "A row of n coins with values arr[0..n-1] is placed on a table, where n is even. You and an opponent alternate turns and you move first. On a turn a player must take either the leftmost or the rightmost remaining coin and keeps its value. Both players play optimally to maximise their own total. Return the maximum total value you can guarantee for yourself.",
        "Example 1:\nInput: arr = [5, 3, 7, 10]\nOutput: 15\nExplanation: Take 10. Whatever the opponent takes (5 or 7) the remaining pair leaves you the other one plus 5, and the best guaranteed line is 10 + 5 = 15.",
        "Example 2:\nInput: arr = [8, 15, 3, 7]\nOutput: 22\nExplanation: Take 7. The opponent must take 8 or 3; either way 15 is exposed on an end and you take it, for 7 + 15 = 22.",
        "Constraints:\n- 2 <= n <= 1000, n is even\n- 1 <= arr[i] <= 10^6",
      ],
      code: `long long optimalStrategyOfGame(vector<int>& a) {
    int n = a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];

    // dp[i][j] = best total the player who moves on interval [i, j] can collect.
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = a[i];

    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            long long total = pre[j + 1] - pre[i];
            // After I take an end, the opponent plays the smaller interval optimally,
            // so what is left for me out of that interval is (its sum) - dp[opponent].
            long long takeLeft  = a[i] + (total - a[i]) - dp[i + 1][j];
            long long takeRight = a[j] + (total - a[j]) - dp[i][j - 1];
            dp[i][j] = max(takeLeft, takeRight);
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "State is the surviving interval. Because every move deletes an end, the set of remaining coins is always a contiguous block [i, j], which is why an O(n^2) interval DP is enough instead of an exponential subset DP.",
        "The key modelling trick is that dp[i][j] is defined for whoever is to move, not for a fixed player. That makes the recurrence self-referential in a useful way: if I take a[i], my opponent becomes the mover on [i+1, j] and collects dp[i+1][j], so the leftovers I eventually collect from that interval are sum(i+1..j) - dp[i+1][j].",
        "The tempting wrong approach is greedy - always grab the larger end. On [5, 3, 7, 10] greedy takes 10 then 7 for 17, which looks better but is not achievable, because after you take 10 the opponent takes 7 and you are left with 10 + 5 = 15. Greedy is provably wrong on [1, 20, 3]: taking 3 first is what exposes the 20.",
        "Fill by increasing length so that both dp[i+1][j] and dp[i][j-1] are already known. Prefix sums keep the interval sum O(1); recomputing it inside the loop would make the whole thing O(n^3).",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Removal Game",
      difficulty: "Medium",
      variation: "Score-difference formulation with O(n) rolling memory",
      link: "https://cses.fi/problemset/task/1097",
      question: [
        "There is a list of n numbers. Two players take turns removing a number from either the left end or the right end of the list, and each player adds the removed number to their own score. The first player moves first and both players play optimally. Print the maximum score the first player can obtain.",
        "Example 1:\nInput:\n4\n4 5 1 3\nOutput: 8\nExplanation: Player 1 takes 3, player 2 takes 4, player 1 takes 5, player 2 takes 1. Scores are 8 and 5.",
        "Example 2:\nInput:\n5\n4 5 1 3 10\nOutput: 15\nExplanation: Optimal play splits the total 23 as 15 for player 1 and 8 for player 2.",
        "Constraints:\n- 1 <= n <= 5000\n- 1 <= x_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    long long total = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        total += a[i];
    }

    // d[i][j] = (mover's score) - (other player's score) on interval [i, j].
    // It only depends on intervals one shorter, so index by start and roll by length.
    vector<long long> prev(n), cur(n);
    for (int i = 0; i < n; i++) prev[i] = a[i];

    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            // Taking an end flips who is "the mover", hence the minus sign.
            cur[i] = max(a[i] - prev[i + 1], a[j] - prev[i]);
        }
        swap(prev, cur);
    }

    long long diff = prev[0];
    cout << (total + diff) / 2 << "\\n";   // score1 + score2 = total, score1 - score2 = diff
    return 0;
}`,
      explanation: [
        "Tracking the difference instead of the absolute score removes the 'whose turn is it' bookkeeping entirely. If d is the mover's advantage, then after taking a[i] the opponent becomes the mover on [i+1, j] with advantage d[i+1][j] from their point of view, so my advantage is a[i] - d[i+1][j]. Maximising my advantage is the same as maximising my score because the total is fixed.",
        "Recovering the score is pure algebra: s1 + s2 = total and s1 - s2 = diff give s1 = (total + diff) / 2. The sum and difference always share parity, so the division is exact.",
        "The memory reduction is the point of this version. dp[i][j] reads only dp[i+1][j] and dp[i][j-1], both of length len-1, so if you index states by (start, length) the whole previous layer is one array of size n. A plain 5000 x 5000 table of 64-bit values is 200 MB and risks the memory limit; two rows are 80 KB.",
        "Note n can be odd here, unlike the classic coin game, and the DP does not care - nothing in the recurrence assumes an even count.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Predict the Winner",
      difficulty: "Medium",
      variation: "Decide the winner from the sign of the advantage",
      link: "https://leetcode.com/problems/predict-the-winner/",
      question: [
        "You are given an integer array nums. Player 1 and player 2 alternately take a number from either end of the array, player 1 first, and each adds it to their score. Both play optimally. Return true if player 1 can win, where a tie also counts as a win for player 1.",
        "Example 1:\nInput: nums = [1, 5, 2]\nOutput: false\nExplanation: Player 1 takes 1 or 2. Either way player 2 takes 5 and wins 5 to 3.",
        "Example 2:\nInput: nums = [1, 5, 233, 7]\nOutput: true\nExplanation: Player 1 takes 1. Player 2 must take 5 or 7, exposing 233, which player 1 takes. Player 1 wins by 222.",
        "Constraints:\n- 1 <= nums.length <= 20\n- 0 <= nums[i] <= 10^7",
      ],
      code: `bool predictTheWinner(vector<int>& nums) {
    int n = nums.size();
    // dp[i] holds the mover's advantage on the interval starting at i, current length.
    vector<int> prev(nums), cur(n, 0);
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            cur[i] = max(nums[i] - prev[i + 1], nums[j] - prev[i]);
        }
        swap(prev, cur);
    }
    return prev[0] >= 0;   // tie counts as a win for player 1
}`,
      explanation: [
        "Identical recurrence to the removal game; only the reported value changes. Because the question asks who wins and not by how much, the advantage DP answers it directly and the total sum is never needed.",
        "The base layer is len = 1, where the mover simply takes the single number, so the advantage is nums[i]. Every longer interval is built from the layer below.",
        "The trap is a memoised recursion that carries a turn flag and separate score accumulators. It works but it doubles the state space and invites sign errors; the single signed value is the same information with none of the bookkeeping.",
        "With n <= 20 an exponential 2^n search also passes, which is why people mistake this for a brute-force problem. The interval DP is what generalises to n = 5000.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Stone Game",
      difficulty: "Medium",
      variation: "Same game with a parity shortcut",
      link: "https://leetcode.com/problems/stone-game/",
      question: [
        "Alice and Bob play with an even-length array piles, where piles[i] is the number of stones in the i-th pile and the total number of stones is odd. Alice moves first and players alternately take the entire first or last remaining pile. The player with more stones wins. Assuming both play optimally, return true if Alice wins.",
        "Example 1:\nInput: piles = [5, 3, 4, 5]\nOutput: true\nExplanation: Optimal play ends 9 to 8 out of the 17 stones, so Alice wins.",
        "Example 2:\nInput: piles = [3, 7, 2, 3]\nOutput: true\nExplanation: Alice takes the 3 on the right. Bob now faces [3, 7, 2] and cannot avoid exposing the 7, so Alice ends with 10 to Bob's 5.",
        "Constraints:\n- 2 <= piles.length <= 500, piles.length is even\n- 1 <= piles[i] <= 500\n- The sum of piles[i] is odd",
      ],
      code: `bool stoneGame(vector<int>& piles) {
    int n = piles.size();
    vector<int> prev(piles), cur(n, 0);
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            cur[i] = max(piles[i] - prev[i + 1], piles[j] - prev[i]);
        }
        swap(prev, cur);
    }
    return prev[0] > 0;   // sum is odd, so a draw is impossible

    // One-liner alternative: return true. See the explanation for why.
}`,
      explanation: [
        "The DP is unchanged from Predict the Winner, with a strict comparison because an odd total rules out a tie. Solving it this way is the honest answer in an interview and is what you extend when the constraints change.",
        "There is also a pairing proof that the answer is always true. Colour the indices alternately: Alice can decide on move one whether she will collect every even index or every odd index, because after she takes an end the two exposed ends always have opposite colours to each other, so she can keep taking her chosen colour forever. One of the two colour classes has more than half the odd total, so she picks that one.",
        "The parity argument depends on both hypotheses - even length and odd total. Drop the even length and it collapses: on [1, 5, 2] the first player loses, which is exactly the previous problem.",
        "Beware of using the parity shortcut as your only tool. Stone Game II, III and V change the move rules and the shortcut evaporates, while the interval DP framing survives with a modified transition.",
        "Time: O(n^2) for the DP, O(1) for the parity argument. Space: O(n).",
      ],
    },
    {
      name: "Stone Game VII",
      difficulty: "Medium",
      variation: "Boundary removal where the reward is the remaining sum",
      link: "https://leetcode.com/problems/stone-game-vii/",
      question: [
        "Alice and Bob play with an array stones. On each turn the current player removes either the leftmost or the rightmost stone and scores the sum of the values of the stones that remain after the removal. Play continues until no stones are left. Alice starts and wants to maximise the difference between her score and Bob's, while Bob wants to minimise it. Both play optimally. Return that difference.",
        "Example 1:\nInput: stones = [5, 3, 1, 4, 2]\nOutput: 6\nExplanation: Alice removes 2 (scoring 5+3+1+4 = 13), Bob removes 5 (scoring 8), Alice removes 3 (scoring 5), Bob removes 1 (scoring 4), Alice removes 4 (scoring 0). Alice has 18, Bob has 12.",
        "Example 2:\nInput: stones = [7, 90, 5, 1, 100, 10, 10, 2]\nOutput: 122",
        "Constraints:\n- 2 <= stones.length <= 1000\n- 1 <= stones[i] <= 1000",
      ],
      code: `int stoneGameVII(vector<int>& stones) {
    int n = stones.size();
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];

    // dp[i][j] = best achievable (mover - other) difference on interval [i, j].
    vector<vector<int>> dp(n, vector<int>(n, 0));   // dp[i][i] = 0: removing the last stone scores 0
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            int dropLeft  = pre[j + 1] - pre[i + 1] - dp[i + 1][j];   // score = sum(i+1..j)
            int dropRight = pre[j] - pre[i] - dp[i][j - 1];           // score = sum(i..j-1)
            dp[i][j] = max(dropLeft, dropRight);
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "Same interval state, but the payoff now sits on the transition rather than on the removed element: dropping an end pays the sum of what survives. Prefix sums give that in O(1), and without them the DP is O(n^3).",
        "Because Alice maximises the difference and Bob minimises it, this is a zero-sum minimax, which is exactly what the single signed value dp[i][j] encodes. The mover's difference is (points scored now) - (opponent's difference on the leftover interval), so one max suffices and no separate min layer is needed.",
        "dp[i][i] = 0 is the base case that people get wrong: removing the final stone leaves nothing, so it scores zero, not stones[i].",
        "A greedy 'remove the smaller end to keep the sum high' heuristic fails because a big value near one end can be worth preserving as ammunition for a later turn; only the DP accounts for whose turn will benefit.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n) by rolling over length.",
      ],
    },
    {
      name: "Maximum Score from Performing Multiplication Operations",
      difficulty: "Hard",
      variation: "Boundary picks with a separate operation counter",
      link: "https://leetcode.com/problems/maximum-score-from-performing-multiplication-operations/",
      question: [
        "You are given integer arrays nums of length n and multipliers of length m, with m <= n. You perform exactly m operations. On the i-th operation (0-indexed) you choose either the first or the last remaining element x of nums, gain multipliers[i] * x, and remove x from nums. Return the maximum total score.",
        "Example 1:\nInput: nums = [1, 2, 3], multipliers = [3, 2, 1]\nOutput: 14\nExplanation: Take 3 (3*3 = 9), then 2 (2*2 = 4), then 1 (1*1 = 1), total 14.",
        "Example 2:\nInput: nums = [-5, -3, -3, -2, 7, 1], multipliers = [-10, -5, 3, 4, 6]\nOutput: 102",
        "Constraints:\n- n == nums.length, m == multipliers.length\n- 1 <= m <= 300, m <= n <= 10^5\n- -1000 <= nums[i], multipliers[i] <= 1000",
      ],
      code: `int maximumScore(vector<int>& nums, vector<int>& multipliers) {
    int n = nums.size(), m = multipliers.size();
    // State: (i operations done, left taken from the front).
    // The right pointer is forced: right = n - 1 - (i - left).
    vector<long long> cur(m + 1, 0), nxt(m + 1, 0);   // nxt = layer i+1, all zero at i = m

    for (int i = m - 1; i >= 0; i--) {
        for (int left = 0; left <= i; left++) {
            int right = n - 1 - (i - left);
            cur[left] = max((long long)multipliers[i] * nums[left] + nxt[left + 1],
                            (long long)multipliers[i] * nums[right] + nxt[left]);
        }
        swap(cur, nxt);
    }
    return (int)nxt[0];
}`,
      explanation: [
        "The surviving array is still an interval, but with n up to 10^5 an (i, j) table is impossible. The saving observation is that after i operations exactly i elements are gone, so knowing how many came from the left pins both ends: right = n - 1 - (i - left). That collapses the state to (i, left) with i, left <= m <= 300.",
        "Iterating i downwards makes the dependency trivial - layer i only reads layer i+1 - so two arrays of size m+1 replace the full table. Layer m is all zeros because no operations remain.",
        "The trap here is the naive O(n^2) interval DP over [i, j]; it is the correct recurrence but 10^10 states. Recognising a redundant dimension is the whole difficulty of this problem, and it is a common trick in boundary-pick DPs whenever the number of moves is capped well below n.",
        "Use 64-bit accumulation: 300 operations at up to 1000 * 1000 each stay inside int32 here, but the intermediate products are exactly the kind of thing that overflows once constraints grow, and negative multipliers mean the optimum can require taking a bad-looking element now.",
        "Time: O(m^2). Space: O(m).",
      ],
    },
    {
      name: "Longest Palindromic Subsequence",
      difficulty: "Medium",
      variation: "Boundary matching - both ends kept or one dropped",
      link: "https://leetcode.com/problems/longest-palindromic-subsequence/",
      question: [
        "Given a string s, return the length of the longest palindromic subsequence of s. A subsequence is obtained by deleting some or no characters without changing the order of the rest.",
        "Example 1:\nInput: s = 'bbbab'\nOutput: 4\nExplanation: 'bbbb' is the longest palindromic subsequence.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 2\nExplanation: 'bb'.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists only of lowercase English letters",
      ],
      code: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;

    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s[i] == s[j])
                dp[i][j] = 2 + (len == 2 ? 0 : dp[i + 1][j - 1]);   // keep both ends
            else
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);         // drop one end
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "The decision is again at the boundary, but the two branches are now driven by the data rather than by a player. If s[i] == s[j] those two characters can wrap any palindrome found strictly inside, so keeping both is never worse than dropping either - a cheap exchange argument, since any palindrome using at most one of them can be extended by the pair.",
        "If the ends differ they cannot both be the outermost pair of the same palindrome, so at least one is useless as an endpoint and the answer is the better of the two shorter intervals. The two branches overlap in the middle, which is fine for a maximum but would double count in a counting DP.",
        "The len == 2 guard exists because dp[i+1][j-1] would be the empty interval j - 1 < i + 1; treating that as 0 is correct, and a memoised recursion with an i > j base case avoids the special case entirely.",
        "A popular shortcut is LCS of s with its reverse, which gives the same number. It is correct but slower to reason about and hides the boundary structure that the harder variants build on.",
        "Time: O(n^2). Space: O(n^2), reducible to O(n) with two rows.",
      ],
    },
    {
      name: "Strange Printer",
      difficulty: "Hard",
      variation: "Boundary matching with an inner split point",
      link: "https://leetcode.com/problems/strange-printer/",
      question: [
        "A strange printer can only print a sequence of one identical character each turn, and each new print may overwrite any existing characters, starting and ending anywhere on the paper. Given a target string s, return the minimum number of turns needed to print it.",
        "Example 1:\nInput: s = 'aaabbb'\nOutput: 2\nExplanation: Print 'aaa' then 'bbb'.",
        "Example 2:\nInput: s = 'aba'\nOutput: 2\nExplanation: Print 'aaa', then overwrite the middle character with 'b'.",
        "Constraints:\n- 1 <= s.length <= 100\n- s consists of lowercase English letters",
      ],
      code: `int strangePrinter(string s) {
    string t;
    for (char c : s) if (t.empty() || t.back() != c) t += c;   // runs cost the same as one char
    int n = t.size();
    if (n == 0) return 0;

    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;

    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = dp[i][j - 1] + 1;                       // print t[j] on its own turn
            for (int k = i; k < j; k++)
                if (t[k] == t[j])                              // extend the turn that printed t[k]
                    dp[i][j] = min(dp[i][j], dp[i][k] + (k + 1 <= j - 1 ? dp[k + 1][j - 1] : 0));
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "Think backwards: the last character t[j] was produced by some print of that character, and that print may have covered an earlier position k with t[k] == t[j], in which case printing positions k and j costs one turn between them. So either t[j] needs a fresh turn, giving dp[i][j-1] + 1, or it shares a turn with some matching k, splitting the interval into [i, k] and [k+1, j-1].",
        "The correctness of the split rests on non-crossing structure: a single print covers a contiguous stretch, so the work inside (k, j) is independent of the work in [i, k] and no cheaper solution can interleave them. That is the same non-crossing argument that licenses interval DP for matrix chain and triangulation problems.",
        "Collapsing runs first is not just an optimisation - it also keeps the recurrence honest, since 'aaa' and 'a' cost the same and leaving the duplicates in makes the split loop repeat identical work.",
        "The tempting wrong recurrence is to match only the two extreme ends (if t[i] == t[j] then dp[i+1][j-1] style) as in the palindrome DP. That misses the case where t[j] pairs with an interior occurrence, which is exactly what makes 'abab' cost 3 rather than 2.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Palindrome Removal",
      difficulty: "Hard",
      variation: "Removing palindromic blocks, three-way transition",
      link: "https://leetcode.com/problems/palindrome-removal/",
      question: [
        "You are given an integer array arr. In one move you may select a palindromic subarray arr[i..j] with i <= j and remove it; the remaining elements close the gap and keep their relative order. Return the minimum number of moves needed to remove all of arr.",
        "Example 1:\nInput: arr = [1, 2]\nOutput: 2\nExplanation: No subarray of length 2 is a palindrome, so each element is removed on its own.",
        "Example 2:\nInput: arr = [1, 3, 4, 1, 5]\nOutput: 3\nExplanation: Remove [4], leaving [1, 3, 1, 5]. Remove [1, 3, 1], leaving [5]. Remove [5].",
        "Constraints:\n- 1 <= arr.length <= 100\n- 1 <= arr[i] <= 20",
      ],
      code: `int minimumMoves(vector<int>& arr) {
    int n = arr.size();
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;

    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = 1 + dp[i + 1][j];                    // arr[i] leaves alone
            if (arr[i] == arr[i + 1])
                dp[i][j] = min(dp[i][j], 1 + (i + 2 <= j ? dp[i + 2][j] : 0));   // pair leaves together
            for (int k = i + 2; k <= j; k++)
                if (arr[i] == arr[k])                       // arr[i] and arr[k] leave together,
                    dp[i][j] = min(dp[i][j],                // wrapping whatever is between them
                                   dp[i + 1][k - 1] + (k + 1 <= j ? dp[k + 1][j] : 0));
        }
    }
    return dp[0][n - 1];
}`,
      explanation: [
        "State is dp[i][j] = minimum moves to clear the interval [i, j]. The transition classifies the fate of the left endpoint: it is removed in a move of its own, or it is removed together with some later equal element arr[k].",
        "The wrapping branch is the subtle one. If arr[i] == arr[k] and the whole block arr[i+1..k-1] is cleared first, then arr[i] and arr[k] become adjacent and vanish inside the very last move that clears that block - so the cost is dp[i+1][k-1], not dp[i+1][k-1] + 1. That is why the branch adds nothing for the pair itself, and it is the single most common source of off-by-one answers here.",
        "The arr[i] == arr[i+1] case is written out separately because k = i+1 would ask for dp[i+1][i], an empty interval, where the wrapping argument does not apply: an adjacent equal pair is itself a palindrome and costs one move.",
        "Only subarrays are removable, not subsequences, so the answer is never simply 1 for a palindromic-subsequence-rich array. It is also always at most n and at least 1, which makes for a quick sanity bound.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Remove Boxes",
      difficulty: "Hard",
      variation: "Interval DP with a carried run length, third dimension",
      link: "https://leetcode.com/problems/remove-boxes/",
      question: [
        "You are given several boxes of different colours represented by an array boxes, where boxes[i] is the colour of the i-th box. Each round you may choose a maximal-or-shorter contiguous group of k boxes of the same colour, remove them, and gain k * k points; the remaining boxes close the gap. Return the maximum points you can obtain by removing every box.",
        "Example 1:\nInput: boxes = [1, 3, 2, 2, 2, 3, 4, 3, 1]\nOutput: 23\nExplanation: Remove the three 2s for 9, then the array is [1, 3, 3, 4, 3, 1]; remove the 4 for 1, then the three 3s for 9, then the two 1s for 4. Total 9 + 1 + 9 + 4 = 23.",
        "Example 2:\nInput: boxes = [1, 1, 1]\nOutput: 9\nExplanation: Remove all three at once for 3 * 3 = 9.",
        "Constraints:\n- 1 <= boxes.length <= 100\n- 1 <= boxes[i] <= 100",
      ],
      code: `class Solution {
    vector<int> b;
    int memo[100][100][100] = {};   // 0 means "not computed": a real answer is always >= 1

    int solve(int i, int j, int k) {   // k boxes of colour b[i] are already glued to the left of i
        if (i > j) return 0;
        int &res = memo[i][j][k];
        if (res) return res;

        // Absorb the run starting at i into k so the choice below is made once per group.
        int p = i, q = k;
        while (p < j && b[p + 1] == b[p]) { p++; q++; }

        int best = (q + 1) * (q + 1) + solve(p + 1, j, 0);   // cash the group in now

        // Or clear a middle block first so a later equal box joins the group.
        for (int m = p + 1; m <= j; m++)
            if (b[m] == b[p])
                best = max(best, solve(p + 1, m - 1, 0) + solve(m, j, q + 1));

        return res = best;
    }

public:
    int removeBoxes(vector<int>& boxes) {
        b = boxes;
        return solve(0, boxes.size() - 1, 0);
    }
};`,
      explanation: [
        "A two-dimensional interval state is not enough here, and seeing why is the whole problem: the value of clearing [i, j] depends on how many boxes of colour b[i] are waiting immediately to its left, because they will be scored together. So the state is (i, j, k) with k the carried run length.",
        "Because k * k is superadditive, delaying a removal to merge groups can pay: 2 * 2 + 1 * 1 = 5 is worse than 3 * 3 = 9. The second branch encodes exactly that - clear the strict interior [i+1, m-1] first so that b[m] becomes adjacent to the run at i, then solve [m, j] with k+1 carried.",
        "Note the two recursive calls in that branch are on disjoint intervals and the carried count is passed only to the right one; getting that split wrong (for example passing k into the interior call) silently double counts.",
        "The greedy 'always remove the longest run' is wrong for the same superadditivity reason, and the memo must be indexed by all three coordinates - a common bug is memoising on (i, j) only, which returns a stale value computed under a different k.",
        "Time: O(n^4) states-times-transitions in the worst case. Space: O(n^3).",
      ],
    },
  ],
};
