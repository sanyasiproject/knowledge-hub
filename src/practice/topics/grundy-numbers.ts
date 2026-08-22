import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Stick Game",
      difficulty: "Easy",
      variation: "Single-pile win/lose DP - Grundy zero vs non-zero",
      link: "https://cses.fi/problemset/task/1729",
      question: [
        "There is a heap of n sticks. On each turn the player to move removes some sticks from the heap; the allowed removal sizes are given as a set of k values. The player who removes the last stick wins, so a player facing an empty heap loses. For every heap size 1..n decide who wins when both players play optimally.",
        "Print a string of length n whose i-th character is W if the first player wins a heap of i sticks and L if the first player loses it.",
        "Example 1:\nInput:\n10 2\n2 3\nOutput: LWWWLLWWWL\nExplanation: With 1 stick no move is legal so the mover loses. With 5 sticks both moves lead to 3 and 2, which are both wins for the opponent, so 5 is a loss. The pattern of losing sizes here is 1, 5, 6, 10.",
        "Example 2:\nInput:\n6 3\n1 3 4\nOutput: WLWWWW\nExplanation: 1 is a win (take the last stick). 2 is the only losing size here: the sole legal move is to take 1, which hands the opponent a winning heap of 1. Every size from 3 to 6 can reach 2 in one move and is therefore a win.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= k <= 100\n- 1 <= p_i <= n, all p_i distinct",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<int> p(k);
    for (int &x : p) cin >> x;
    vector<char> win(n + 1, 0);          // win[i] = mover wins a heap of i sticks
    for (int i = 1; i <= n; i++) {
        for (int x : p) {
            if (x <= i && !win[i - x]) { // one losing child is enough
                win[i] = 1;
                break;
            }
        }
    }
    string ans(n, 'L');
    for (int i = 1; i <= n; i++) ans[i - 1] = win[i] ? 'W' : 'L';
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "State: the heap size. A position is a win for the mover exactly when at least one legal move lands on a losing position, and a loss when every legal move lands on a win. Size 0 is the terminal loss, and everything else follows by induction on the size.",
        "This is the Grundy machinery with the values collapsed to a single bit. The Grundy number g(i) is mex of the g values of the children, and mex of a set is 0 precisely when 0 is absent from that set. So g(i) = 0 iff no child has g = 0, which is exactly the win/lose recurrence above. Because this game has one component only, the bit is all the information you need.",
        "The tempting shortcut is to look for a formula. Subtraction games are eventually periodic, but the pre-period and the period both depend on the move set, so guessing a period from the first few values is unreliable. The O(n * k) table is cheap and exact.",
        "Do not collapse this to a bit once several heaps are in play - then a 0/1 flag loses the information needed to XOR components, and you must keep the full Grundy value.",
        "Time: O(n * k). Space: O(n).",
      ],
    },
    {
      name: "Nim Game I",
      difficulty: "Easy",
      variation: "Grundy of a Nim pile equals its size - XOR of components",
      link: "https://cses.fi/problemset/task/1730",
      question: [
        "There are n heaps of coins. On each turn the player to move chooses one non-empty heap and removes any positive number of coins from it. The player who takes the last coin wins. For each test case decide whether the first or the second player wins under optimal play.",
        "Example 1:\nInput:\n3\n1\n5\n2\n2 3\n3\n1 2 3\nOutput:\nfirst\nfirst\nsecond\nExplanation: A single heap is always a win - take it all. For (2,3) the XOR is 1, so the first player wins by taking one coin from the 3-heap to reach (2,2). For (1,2,3) the XOR is 1 xor 2 xor 3 = 0, so the first player loses.",
        "Constraints:\n- 1 <= t <= 200000\n- 1 <= n <= 200000, and the sum of n over all tests is at most 200000\n- 1 <= x_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        long long x = 0;
        for (int i = 0; i < n; i++) {
            long long p;
            cin >> p;
            x ^= p;                       // Grundy of a Nim heap of size p is p
        }
        cout << (x ? "first" : "second") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "A single Nim heap of size p has Grundy value p: its children are the heaps 0..p-1, whose Grundy values are exactly 0..p-1 by induction, and mex of that set is p.",
        "The Sprague-Grundy theorem says the Grundy value of a sum of independent games is the XOR of their Grundy values, and a position is losing for the mover iff that XOR is 0. So the whole game reduces to XOR-ing the heap sizes.",
        "Why the XOR works constructively: if x = XOR of heaps is non-zero, look at its highest set bit. Some heap p has that bit set, and p xor x < p, so you can legally shrink that heap to p xor x and hand the opponent a total XOR of 0. From a zero XOR any move changes exactly one heap and therefore makes the XOR non-zero, so the opponent can always hand it back to you as zero until you face all-empty heaps.",
        "The trap is misere play. Under 'the player who takes the last coin loses' the XOR rule is wrong: there you win iff either some heap has at least 2 coins and the XOR is non-zero, or all heaps are of size 1 and their count is even. This problem is normal play, so plain XOR is correct.",
        "Time: O(n) per test. Space: O(1).",
      ],
    },
    {
      name: "Stone Game IV",
      difficulty: "Medium",
      variation: "Subtraction game with an irregular move set (squares)",
      link: "https://leetcode.com/problems/stone-game-iv/",
      question: [
        "Alice and Bob take turns with a pile of n stones, Alice first. On each turn the player to move removes a non-zero square number of stones (1, 4, 9, 16, ...) from the pile. A player who cannot make a move loses. Return true if Alice wins the game assuming both play optimally.",
        "Example 1:\nInput: n = 4\nOutput: true\nExplanation: Alice removes all 4 stones at once and Bob cannot move.",
        "Example 2:\nInput: n = 7\nOutput: false\nExplanation: Alice can only move to 6 (take 1) or 3 (take 4), and both of those are winning positions for the player who moves next, so Alice loses. The losing sizes below 8 are 0, 2, 5 and 7.",
        "Constraints:\n- 1 <= n <= 10^5",
      ],
      code: `bool winnerSquareGame(int n) {
    vector<char> dp(n + 1, 0);           // dp[i] = mover wins with i stones
    for (int i = 1; i <= n; i++) {
        for (int r = 1; r * r <= i; r++) {
            if (!dp[i - r * r]) {        // reachable losing position -> current is a win
                dp[i] = 1;
                break;
            }
        }
    }
    return dp[n];
}`,
      explanation: [
        "Same single-component subtraction game as the stick problem, only with move set { 1, 4, 9, ... }. State is the pile size, dp[0] = false is the terminal loss, and dp[i] is true iff some square r*r <= i leads to a false state.",
        "The move set has O(sqrt n) entries at each state, so the whole table costs O(n sqrt n) - about 3*10^7 basic steps at n = 10^5, which is fine.",
        "The wrong-but-tempting approach is a greedy or pattern rule such as 'Alice loses iff n mod 7 is in {0,2,5}'. The losing sizes start 0, 2, 5, 7, 10, 12, 15, 17, 20, 22, 34, ... and are not periodic in any small modulus, so any hand-fitted rule breaks. Squares are too sparse for the game to settle into a short period.",
        "Reading dp[i] as 'Grundy is non-zero' is exactly right here, and dp[i] = false is the mirror of g(i) = 0.",
        "Time: O(n sqrt n). Space: O(n).",
      ],
    },
    {
      name: "Nim Game II",
      difficulty: "Medium",
      variation: "Bounded subtraction game - periodic Grundy, then XOR",
      link: "https://cses.fi/problemset/task/1098",
      question: [
        "There are n heaps of coins. On each turn the player to move chooses one non-empty heap and removes 1, 2 or 3 coins from it. The player who takes the last coin wins. For each test case decide whether the first or the second player wins.",
        "Example 1:\nInput:\n3\n2\n5 2\n2\n4 4\n3\n1 2 3\nOutput:\nfirst\nsecond\nsecond\nExplanation: The Grundy value of a heap of size p is p mod 4. For (5,2) it is 1 xor 2 = 3, non-zero, so the first player wins. For (4,4) it is 0 xor 0 = 0. For (1,2,3) it is 1 xor 2 xor 3 = 0.",
        "Constraints:\n- 1 <= t <= 200000\n- 1 <= n <= 200000, and the sum of n over all tests is at most 200000\n- 1 <= x_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        long long x = 0;
        for (int i = 0; i < n; i++) {
            long long p;
            cin >> p;
            x ^= p % 4;                   // Grundy of a heap in the {1,2,3} subtraction game
        }
        cout << (x ? "first" : "second") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "First find the Grundy value of one heap. g(0) = 0, g(1) = mex{0} = 1, g(2) = mex{1,0} = 2, g(3) = mex{2,1,0} = 3, g(4) = mex{g(3),g(2),g(1)} = mex{3,2,1} = 0. From there the window of three predecessors repeats, so g(p) = p mod 4 for all p. In general a subtraction game with move set {1..m} has g(p) = p mod (m+1).",
        "The heaps are independent - a move touches exactly one of them - so Sprague-Grundy applies and the position is losing iff the XOR of the per-heap Grundy values is 0.",
        "The classic mistake is XOR-ing the raw heap sizes as in ordinary Nim. That is wrong here: (4,4) has raw XOR 0 and is indeed a second-player win, but (4,1) has raw XOR 5 while its Grundy XOR is 0 xor 1 = 1, and (5,1) has raw XOR 4 (non-zero) while its Grundy XOR is 1 xor 1 = 0, a loss for the mover. You must reduce each component to its Grundy value first.",
        "The other mistake is XOR-ing p mod 4 with the wrong modulus - it is m+1 with m the largest legal removal, not m.",
        "Time: O(n) per test. Space: O(1).",
      ],
    },
    {
      name: "1-2-K Game",
      difficulty: "Medium",
      variation: "Parametrised subtraction game - period k+1",
      link: "https://codeforces.com/problemset/problem/1194/D",
      question: [
        "Alice and Bob play with a pile of n stones, Alice moving first. On each turn the player to move removes exactly 1, exactly 2, or exactly k stones from the pile (a move is illegal if the pile has fewer stones than that). The player who cannot move loses. Given n and k, determine the winner for each test case.",
        "Example 1:\nInput:\n4\n0 3\n3 3\n3 4\n4 4\nOutput:\nBob\nAlice\nBob\nAlice\nExplanation: With n = 0 Alice cannot move at all. With n = 3, k = 3 Alice takes all three stones. With n = 3, k = 4 the k-move is unavailable, so the game is the {1,2} game where multiples of 3 are losing. With n = 4, k = 4 Alice takes all four.",
        "Example 2:\nInput:\n2\n6 3\n5 3\nOutput:\nAlice\nAlice\nExplanation: For k = 3 the pattern has period k+1 = 4. Inside each block of 4 the losing residues are those that are multiples of 3 and are not equal to k, i.e. residue 0 only, so n = 6 (residue 2) and n = 5 (residue 1) are both wins.",
        "Constraints:\n- 1 <= T <= 100\n- 0 <= n <= 10^9\n- 3 <= k <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long n, k;
        cin >> n >> k;
        bool alice;
        if (k % 3 != 0) {
            alice = (n % 3 != 0);         // the k-move never helps: plain {1,2} game
        } else {
            long long m = n % (k + 1);    // pattern repeats with period k+1
            alice = !(m % 3 == 0 && m != k);
        }
        cout << (alice ? "Alice" : "Bob") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Start from the {1,2} subtraction game, where g(p) = p mod 3 and the losing positions are the multiples of 3. Now add the extra move of size k and ask when it changes anything. A move only matters if it can reach a losing position, i.e. if it can turn a multiple-of-3 gap into a non-multiple. Since removing k shifts the residue by k mod 3, when k is not a multiple of 3 the k-move from a multiple of 3 lands on a non-multiple, which is already a winning position for the opponent - so the k-move never rescues a losing position and the answer is simply n mod 3 != 0.",
        "When k is a multiple of 3 the k-move preserves the residue class, so from the losing position n = k the mover can take all k stones and win. That single exception propagates: within each block of k+1 consecutive sizes the losing positions are the multiples of 3 except the size congruent to k, and the whole picture repeats with period k+1 because beyond k the {1,2} structure resets.",
        "Concretely for k = 6 the values n = 0..6 are L W W L W W W (n = 6 flips from losing to winning), and n = 7..13 repeats that block. Reducing n modulo k+1 and applying the rule is therefore exact.",
        "The trap is computing the DP table - n is up to 10^9, so you must reason to the closed form, or at least verify a small brute force against it before trusting the formula.",
        "Time: O(1) per test. Space: O(1).",
      ],
    },
    {
      name: "Stair Game",
      difficulty: "Medium",
      variation: "Staircase Nim - reduction to ordinary Nim on alternate stairs",
      link: "https://cses.fi/problemset/task/1099",
      question: [
        "There is a staircase with n stairs numbered 1..n, and stair i initially holds p_i coins. On each turn the player to move chooses a stair k with k >= 2 and moves any positive number of coins from stair k to stair k-1. Coins that reach stair 1 can never move again. The player who cannot move loses. For each test case decide whether the first or the second player wins.",
        "Example 1:\nInput:\n2\n2\n2 3\n3\n0 0 1\nOutput:\nfirst\nsecond\nExplanation: In the first case stair 2 holds 3 coins; the XOR over the even-numbered stairs is 3, non-zero, so the first player wins - move all 3 coins down and the position becomes 5 0 with no legal move left. In the second case the only coin sits on stair 3, so the XOR over even stairs is 0: whatever the first player does the second player mirrors it and the first player runs out of moves.",
        "Example 2:\nInput:\n1\n4\n3 1 2 4\nOutput:\nfirst\nExplanation: The even stairs are 2 and 4 holding 1 and 4 coins, XOR = 5, non-zero.",
        "Constraints:\n- 1 <= t <= 200\n- 1 <= n <= 200\n- 0 <= p_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        long long x = 0;
        for (int i = 1; i <= n; i++) {
            long long p;
            cin >> p;
            if (i % 2 == 0) x ^= p;       // only coins an odd distance from stair 1 matter
        }
        cout << (x ? "first" : "second") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Think of a coin on stair i as needing i-1 moves to become dead. Coins sitting an even distance from stair 1 (odd stair indices, including stair 1 itself) are junk: whenever the opponent pushes coins from an odd stair down to an even one, you push exactly those coins one more step and restore the invariant. This mirroring argument shows the odd stairs contribute nothing to the outcome.",
        "What remains is a Nim game whose heaps are the even stairs: moving c coins from stair 2j to stair 2j-1 removes c from that heap, and moving coins from an odd stair only adds to a heap - a move the opponent can always immediately undo. So the position is losing iff the XOR of the coin counts on the even-numbered stairs is 0.",
        "Formally each coin at distance d from the bottom is a Nim heap of size d, and a heap contributes nothing when its size is even because pairs cancel under XOR - the same reason only alternate stairs survive.",
        "Two easy slips: indexing from 0 and XOR-ing the wrong parity class, and XOR-ing every stair. Sanity-check with n = 2 and coins only on stair 1 - no move is legal, so the mover must lose, and the even-stair XOR is indeed 0.",
        "Time: O(n) per test. Space: O(1).",
      ],
    },
    {
      name: "Another Game",
      difficulty: "Medium",
      variation: "Move touches many components at once - parity, not XOR",
      link: "https://cses.fi/problemset/task/2208",
      question: [
        "There are n heaps of coins. On each turn the player to move chooses any non-empty subset of the non-empty heaps and removes exactly one coin from each chosen heap. The player who takes the last coin wins, so a player facing all-empty heaps loses. For each test case decide whether the first or the second player wins.",
        "Example 1:\nInput:\n3\n2\n2 2\n2\n2 3\n1\n1\nOutput:\nsecond\nfirst\nfirst\nExplanation: (2,2) is a loss for the mover - every move creates at least one odd heap, and the opponent can always answer by making all heaps even again. (2,3) has an odd heap, so the first player removes one coin from the 3-heap only, reaching (2,2). A single heap of 1 is taken outright.",
        "Example 2:\nInput:\n1\n3\n2 4 6\nOutput:\nsecond\nExplanation: All heaps are even, so the first player loses.",
        "Constraints:\n- 1 <= t <= 200000\n- 1 <= n <= 200000, and the sum of n over all tests is at most 200000\n- 1 <= x_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        bool anyOdd = false;
        for (int i = 0; i < n; i++) {
            long long p;
            cin >> p;
            if (p & 1) anyOdd = true;     // one odd heap is enough to win
        }
        cout << (anyOdd ? "first" : "second") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the standard warning that Sprague-Grundy needs the components to be independent. A single move here changes many heaps at once, so the game is not a disjunctive sum of per-heap games and XOR-ing per-heap Grundy values is simply invalid.",
        "The correct invariant is the parity vector. Claim: the mover loses iff every heap is even. If all heaps are even, any move takes one coin from a chosen subset and makes exactly those heaps odd, and since some heap must be chosen the resulting position has at least one odd heap.",
        "Conversely, from a position with at least one odd heap, remove one coin from exactly the odd heaps. Every odd heap becomes even, every even heap is untouched, and the subset is non-empty because some heap was odd - so the opponent is handed an all-even position. All-even positions therefore lose, all-others win, and since each move drops the total coin count the game terminates at the all-zero all-even loss.",
        "The tempting wrong answer is 'XOR of heap sizes', which gets (2,2) right by luck and (1,2,3) wrong: XOR is 0 there, yet the position has odd heaps and the mover wins by taking one coin from the 1-heap and the 3-heap.",
        "Time: O(n) per test. Space: O(1).",
      ],
    },
    {
      name: "Game of Stones",
      difficulty: "Hard",
      variation: "Per-pile move restriction - triangular-number Grundy",
      link: "https://codeforces.com/problemset/problem/768/E",
      question: [
        "There are n piles of stones. On each turn the player to move chooses a pile and removes a positive number of stones from it, with one restriction: for a given pile, a removal amount that has already been used on that pile earlier in the game may not be used on it again. Different piles keep separate histories. The player who cannot move loses. Sam moves first and Jon moves second; print YES if Jon wins and NO otherwise.",
        "Example 1:\nInput:\n1\n5\nOutput: NO\nExplanation: One pile of 5. Its Grundy value is 2 because 2*3/2 = 3 <= 5 while 3*4/2 = 6 > 5. The total is non-zero, so the first player Sam wins and Jon loses.",
        "Example 2:\nInput:\n2\n1\n2\nOutput: YES\nExplanation: A pile of 1 and a pile of 2 both have Grundy value 1 (1*2/2 = 1 <= 1 and 2*3/2 = 3 > 2), so the total is 1 xor 1 = 0 and the second player Jon wins.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= s_i <= 60",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        long long s;
        cin >> s;
        long long k = 0;
        // largest k with 1 + 2 + ... + k <= s
        while ((k + 1) * (k + 2) / 2 <= s) k++;
        total ^= (int)k;
    }
    cout << (total == 0 ? "YES" : "NO") << "\\n";
    return 0;
}`,
      explanation: [
        "Each pile is an independent game - the no-repeat rule is per pile - so Sprague-Grundy applies and the answer is the XOR of the per-pile Grundy values. The whole difficulty is finding that value, since the state of a pile is (stones left, set of amounts already used on it).",
        "Claim: a pile of s stones has Grundy value k, the largest k with k(k+1)/2 <= s. Intuition for the upper bound: the pile can support at most k more moves in total, because the cheapest way to spend m moves on it is to remove 1, then 2, then 3 and so on, costing m(m+1)/2 stones. So the length of the game on that pile is capped at k, which caps its Grundy value at k. For the lower bound, every value 0..k-1 is reachable: taking a suitable single amount leaves a pile whose remaining budget is exactly any smaller number of moves, so the mex is exactly k.",
        "With s_i <= 60 the Grundy value never exceeds 10 (10*11/2 = 55 <= 60, 11*12/2 = 66 > 60), so the loop is a handful of iterations. The counting bound is what makes the problem tractable at all - a direct DP over (stones, used-amount bitmask) is exponential.",
        "The wrong-but-tempting approach is to treat the piles as ordinary Nim and XOR the sizes: piles of 1 and 2 give raw XOR 3 yet the position is a second-player win, because both piles have the same Grundy value 1.",
        "Time: O(n * sqrt(max s)). Space: O(1).",
      ],
    },
    {
      name: "Interesting Game",
      difficulty: "Hard",
      variation: "A move splits one game into several subgames - Grundy table with prefix XOR",
      link: "https://codeforces.com/problemset/problem/87/C",
      question: [
        "The game starts with a single pile of n stones. On each turn the player to move picks a pile and splits it into k >= 2 piles whose sizes are consecutive increasing integers a, a+1, ..., a+k-1 with a >= 1 (so the sizes are pairwise different and consecutive). A player who cannot split any pile loses. Both players play optimally. Print the minimum k the first player can use on the very first move and still win, or -1 if the first player loses no matter what.",
        "Example 1:\nInput: 3\nOutput: 2\nExplanation: 3 = 1 + 2 is the only split, and it produces piles of 1 and 2 which cannot be split further, so the second player is stuck immediately.",
        "Example 2:\nInput: 6\nOutput: -1\nExplanation: The only split of 6 into consecutive parts is 1 + 2 + 3. The resulting position has Grundy value g(1) xor g(2) xor g(3) = 0 xor 0 xor 1 = 1, which is non-zero, so it is a win for the second player. With no other option the first player loses.",
        "Example 3:\nInput: 100\nOutput: 8\nExplanation: Splitting 100 into 8 consecutive parts, 9 + 10 + ... + 16, gives a total Grundy value of 0, and no split into fewer parts does.",
        "Constraints:\n- 1 <= n <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> g(n + 1, 0), pre(n + 2, 0);   // pre[i] = g[0] xor ... xor g[i-1]
    for (int m = 0; m <= n; m++) {
        if (m > 0) {
            vector<char> seen(512, 0);        // mex is bounded by the number of moves, O(sqrt m)
            for (int k = 2; (long long)k * (k + 1) / 2 <= m; k++) {
                long long rem = m - (long long)k * (k - 1) / 2;
                if (rem % k) continue;        // the k parts must start at an integer a = rem / k
                long long a = rem / k;
                int v = pre[a + k] ^ pre[a];  // xor of g[a..a+k-1] in O(1)
                if (v < 512) seen[v] = 1;
            }
            int mex = 0;
            while (mex < 512 && seen[mex]) mex++;
            g[m] = mex;
        }
        pre[m + 1] = pre[m] ^ g[m];
    }
    int ans = -1;
    for (int k = 2; (long long)k * (k + 1) / 2 <= n; k++) {
        long long rem = n - (long long)k * (k - 1) / 2;
        if (rem % k) continue;
        long long a = rem / k;
        if ((pre[a + k] ^ pre[a]) == 0) {     // hand the opponent a zero position
            ans = k;
            break;
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "A move here replaces one pile by several piles that are then played independently, which is exactly the disjunctive sum Sprague-Grundy was built for. The value of the resulting multiset is the XOR of the parts, and g(m) = mex over all legal splits of that XOR.",
        "Enumerating splits is arithmetic: k parts starting at a sum to k*a + k(k-1)/2, so a = (m - k(k-1)/2) / k must be a positive integer. The smallest possible total for k parts is 1+2+...+k = k(k+1)/2, so k ranges only up to O(sqrt m) and there are O(n sqrt n) candidate splits overall.",
        "Because every part is strictly smaller than m, computing g in increasing order of m is valid. The parts of any split form a contiguous range a..a+k-1, so a running prefix-XOR array turns each candidate into an O(1) lookup instead of an O(k) loop - that is what keeps the total near 5*10^7 operations rather than an order of magnitude more.",
        "The final answer is not just 'is g(n) non-zero'. The problem asks for the smallest first move, so after building the table you re-scan k in increasing order and take the first split whose XOR is 0. Note g(n) != 0 is equivalent to such a k existing, which is exactly the definition of mex.",
        "The trap is trying to shortcut with the parity of k or a formula for g. The Grundy values here are irregular (g(1) = g(2) = 0, g(3) = 1, g(9) = 2, g(11) = 1), and no small closed form fits.",
        "Time: O(n sqrt n). Space: O(n).",
      ],
    },
    {
      name: "Lieges of Legendre",
      difficulty: "Hard",
      variation: "Splitting into k equal copies - Grundy depends on the parity of k",
      link: "https://codeforces.com/problemset/problem/603/C",
      question: [
        "There are n piles of cows and a fixed integer k. On each turn the player to move makes one of two moves: remove a single cow from a non-empty pile, or choose a pile with an even number 2x of cows and replace that pile by k new piles of x cows each. The player who cannot move loses. Kevin moves first and Nicky moves second. Print the winner under optimal play.",
        "Example 1:\nInput:\n2 1\n3 4\nOutput: Kevin\nExplanation: With k odd the Grundy values are g(3) = 1 and g(4) = 2, so the total is 1 xor 2 = 3, non-zero, and the first player wins.",
        "Example 2:\nInput:\n1 2\n3\nOutput: Nicky\nExplanation: With k even, splitting a pile of 2x into an even number of identical piles contributes nothing, and for pile sizes at least 3 the Grundy value is 1 for even sizes and 0 for odd ones. Here g(3) = 0, so the first player loses.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= 10^9\n- 1 <= a_i <= 10^9",
      ],
      code: `long long K;
map<long long, int> memo;

int grundy(long long x) {
    if (K % 2 == 0) {
        // k copies of the same value XOR to 0 when k is even, so the split move
        // always offers Grundy 0 and the values settle immediately
        if (x <= 2) return (int)x;               // g(0)=0, g(1)=1, g(2)=2
        return x % 2 == 0 ? 1 : 0;
    }
    if (x == 0) return 0;
    if (x == 1) return 1;
    if (x == 2) return 0;
    if (x == 3) return 1;
    if (x % 2 == 1) return 0;                    // odd x >= 5: only child is even with g >= 1
    auto it = memo.find(x);
    if (it != memo.end()) return it->second;
    int a = grundy(x - 1);                       // remove one cow
    int b = grundy(x / 2);                       // k odd: XOR of k copies of g(x/2) is g(x/2)
    int mex = 0;
    while (mex == a || mex == b) mex++;
    return memo[x] = mex;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n >> K;
    int total = 0;
    for (int i = 0; i < n; i++) {
        long long a;
        cin >> a;
        total ^= grundy(a);
    }
    cout << (total ? "Kevin" : "Nicky") << "\\n";
    return 0;
}`,
      explanation: [
        "The piles are independent, so the answer is the XOR of per-pile Grundy values; everything hinges on evaluating g(x) for x up to 10^9. The split move turns a pile of 2x into k piles of x, whose combined value is the XOR of k copies of g(x) - that is 0 when k is even and g(x) when k is odd. So the parity of k, not its size, drives the whole analysis.",
        "k even: the split move always offers value 0. Then g(0) = 0, g(1) = mex{0} = 1, g(2) = mex{g(1), 0} = mex{1,0} = 2, g(3) = mex{g(2)} = mex{2} = 0, g(4) = mex{g(3), 0} = mex{0} = 1, g(5) = mex{g(4)} = mex{1} = 0, and from there the pair (0 for odd, 1 for even) repeats. Only x = 2 is exceptional.",
        "k odd: g(2x) = mex{ g(2x-1), g(x) } and g(odd) = mex{ g(odd-1) }. Hand-computing gives 0,1,0,1,2,0,2,0,1,0,1 for x = 0..10, and for odd x >= 5 the single child is an even pile whose value is at least 1, so g = 0. That collapses the recursion to even x only, and each step halves x, so the memoised recursion has depth O(log x) and each pile costs O(log a_i).",
        "The trap is treating the split as if it multiplied the Grundy value, or assuming k odd behaves like k = 1 in the base cases. x = 2 and x = 3 genuinely differ between the two parity branches (g(2) is 2 when k is even but 0 when k is odd), and getting those two wrong silently flips answers on small inputs. Always cross-check a closed form like this against a brute-force mex table for x up to a few thousand.",
        "Time: O(n log(max a)). Space: O(log(max a)) memo entries.",
      ],
    },
    {
      name: "Interval Game 2",
      difficulty: "Hard",
      variation: "Grundy over intervals - choosing a move splits the board in two",
      link: "https://atcoder.jp/contests/abc206/tasks/abc206_f",
      question: [
        "You are given N half-open intervals, the i-th being [L_i, R_i). Alice and Bob take turns, Alice first. On each turn the player to move chooses one of the N intervals that does not intersect any interval chosen earlier in the game (an interval may be chosen only once, and half-open means [1,2) and [2,3) do not intersect). The player who cannot choose an interval loses. Determine the winner for each test case.",
        "Example 1:\nInput:\n1\n2\n1 2\n2 3\nOutput: Bob\nExplanation: The two intervals are disjoint, so Alice takes one, Bob takes the other, and Alice has nothing left.",
        "Example 2:\nInput:\n1\n2\n1 3\n2 4\nOutput: Alice\nExplanation: The two intervals overlap, so only one can ever be chosen. Alice takes either of them and Bob is stuck.",
        "Example 3:\nInput:\n1\n4\n2 5\n4 9\n6 10\n1 3\nOutput: Bob\nExplanation: The Grundy value of the whole line turns out to be 0, so the second player wins.",
        "Constraints:\n- 1 <= T <= 100\n- 1 <= N <= 100\n- 1 <= L_i < R_i <= 100",
      ],
      code: `int g[105][105];
bool done_[105][105];
vector<pair<int,int>> iv;

int G(int l, int r) {
    if (l >= r) return 0;
    if (done_[l][r]) return g[l][r];
    set<int> s;
    for (auto &p : iv) {
        // an interval usable inside [l, r) splits the board into [l, L) and [R, r)
        if (p.first >= l && p.second <= r) s.insert(G(l, p.first) ^ G(p.second, r));
    }
    int mex = 0;
    while (s.count(mex)) mex++;
    done_[l][r] = true;
    return g[l][r] = mex;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        iv.assign(n, {0, 0});
        for (auto &p : iv) cin >> p.first >> p.second;
        memset(done_, 0, sizeof done_);
        cout << (G(0, 101) ? "Alice" : "Bob") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The key modelling step: once an interval [L, R) has been taken, no future interval may cross it, so the remaining usable space splits into two ranges that never interact again - everything strictly left of L and everything from R on. That is a disjunctive sum, so its value is the XOR of the two sub-values and the game is a Grundy DP over ranges.",
        "State is a range [l, r) of coordinates, and g(l, r) = mex over all given intervals [L, R) with l <= L and R <= r of g(l, L) xor g(R, r). Both children are strictly shorter than [l, r) because L < R, so the recursion is well founded and memoisation over the O(C^2) coordinate pairs terminates.",
        "Coordinates are at most 100, so there are about 5000 states and each scans N <= 100 intervals: a few hundred thousand operations per test, trivially fast. Answer the whole board with g(0, 101) and Alice wins iff that is non-zero.",
        "The trap is trying to make the state 'set of already chosen intervals' - that is exponential - or trying a greedy such as counting a maximum set of pairwise disjoint intervals and reading its parity. Parity of a maximum packing is wrong because the loser can steer the game towards a differently sized packing; only the Grundy recursion accounts for both players choosing.",
        "Remember to clear the memo between test cases, since the interval set changes and stale values are silently wrong.",
        "Time: O(T * C^2 * N) with C = 101. Space: O(C^2).",
      ],
    },
  ],
};
