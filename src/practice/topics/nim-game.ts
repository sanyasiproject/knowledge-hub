import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Nim Game",
      difficulty: "Easy",
      variation: "Single pile subtraction game, the template",
      link: "https://leetcode.com/problems/nim-game/",
      question: [
        "You are playing the following game with a friend. There is a heap of n stones on the table. You and your friend take turns removing 1, 2, or 3 stones from the heap, and you always move first. The player who removes the last stone wins. Assuming both players play optimally, return true if you can win the game and false otherwise.",
        "Example 1:\nInput: n = 4\nOutput: false\nExplanation: Whatever you take (1, 2, or 3), the friend takes the remaining 1, 2, or 3 stones and wins.",
        "Example 2:\nInput: n = 7\nOutput: true\nExplanation: Take 3 stones, leaving 4. From 4 the friend is in the losing position of Example 1.",
        "Constraints:\n- 1 <= n <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    bool canWinNim(int n) {
        return n % 4 != 0;   // multiples of 4 are the losing positions
    }
};`,
      explanation: [
        "Classify every position as W (the player to move wins) or L (the player to move loses). A position is L exactly when every legal move lands on a W position, and W when at least one move lands on an L position. Position 0 is L, because the player facing an empty heap has already lost.",
        "Filling in the first few values gives L W W W L W W W ...: from 1, 2, or 3 you can take everything and hand the opponent 0; from 4 all three moves lead to 1, 2, or 3, which are all W. Once the block L W W W repeats, induction closes it: from any 4m you can only reach 4m-1, 4m-2, 4m-3, all W by hypothesis, and from anything else you can subtract the remainder to reach the nearest multiple of 4.",
        "The general rule for a subtraction game with allowed moves 1..k is that multiples of k+1 are losing: the winner's strategy is to keep restoring a multiple of k+1, which is possible because the opponent can never skip over a whole block.",
        "The tempting wrong instinct is to reason greedily ('take as many as possible'). Greed loses at n = 4. Optimal play here is about the residue you leave behind, not about how much you take.",
        "Time: O(1). Space: O(1). Note that a win/lose DP over 0..n would also be correct but is O(n) and cannot run at n = 2^31 - 1.",
      ],
    },
    {
      name: "Divisor Game",
      difficulty: "Easy",
      variation: "Parity invariant instead of an explicit DP",
      link: "https://leetcode.com/problems/divisor-game/",
      question: [
        "Alice and Bob take turns playing a game, with Alice starting first. Initially there is a number n on the chalkboard. On each player's turn that player makes a move consisting of choosing any x with 0 < x < n and n % x == 0, then replacing the number n on the chalkboard with n - x. If a player cannot make a move, they lose the game. Return true if and only if Alice wins the game, assuming both players play optimally.",
        "Example 1:\nInput: n = 2\nOutput: true\nExplanation: Alice chooses x = 1, leaving 1 on the board. Bob has no legal x, so Bob loses.",
        "Example 2:\nInput: n = 3\nOutput: false\nExplanation: Alice must choose x = 1, leaving 2. Bob is now in the winning position of Example 1.",
        "Constraints:\n- 1 <= n <= 1000",
      ],
      code: `class Solution {
public:
    bool divisorGame(int n) {
        return n % 2 == 0;   // even numbers are the winning positions
    }
};`,
      explanation: [
        "Claim: every odd n is a losing position and every even n is a winning position. Base case n = 1 is losing, since no x satisfies 0 < x < 1.",
        "The invariant that proves it is a parity fact about divisors: every proper divisor of an odd number is odd, so from an odd n every move produces odd minus odd = even. An even n always has the divisor x = 1, so it can move to the odd number n - 1. So the mover at an even number can always hand the opponent an odd number, while the mover at an odd number is forced to hand over an even one.",
        "By induction on n, odd is L and even is W, which is exactly n % 2 == 0.",
        "The tempting approach is a full win/lose DP with a divisor enumeration inside, O(n sqrt n) or O(n log n). It is correct and worth writing once to discover the pattern, but the parity argument is the real solution. This is the standard workflow for take-away games: brute force small n, read off the pattern, then prove the invariant.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Nim Game I",
      difficulty: "Easy",
      variation: "Classic multi-pile Nim, normal play (XOR)",
      question: [
        "There are n heaps of sticks. On each turn a player chooses one heap and removes any positive number of sticks from it. The player who removes the last stick wins, so equivalently a player who cannot move loses. Both players play optimally and the first player starts. For each test case print 'first' if the first player wins and 'second' otherwise.",
        "The input begins with the number of test cases t. Each test case has a line with n, then a line with the n heap sizes.",
        "Example 1:\nInput:\n3\n2\n2 2\n2\n2 3\n3\n1 2 3\nOutput:\nsecond\nfirst\nsecond\nExplanation: The XOR of the heap sizes is 0, 1, and 0. A zero XOR means the player to move loses.",
        "Constraints:\n- 1 <= t <= 2 * 10^5\n- 1 <= n <= 2 * 10^5, and the sum of n over all test cases is at most 2 * 10^5\n- 1 <= heap size <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int x = 0;
        for (int i = 0; i < n; i++) {
            int a;
            cin >> a;
            x ^= a;                       // nim-sum of all heaps
        }
        cout << (x != 0 ? "first" : "second") << "\\n";
    }
}`,
      explanation: [
        "The Sprague-Grundy value of a single Nim heap of size a is a itself, and independent games add by XOR, so the whole position has value x = a1 XOR a2 XOR ... XOR an. A position is losing for the player to move exactly when its value is 0.",
        "Both halves of that claim are easy to check directly. If x = 0, every move changes exactly one heap, so it changes exactly one term of the XOR and the new value cannot stay 0 - the mover always hands back a nonzero position. If x != 0, let b be the highest set bit of x; some heap ai has that bit set, and reducing it to ai XOR x is a legal decrease (it clears bit b, so the value drops) and makes the total XOR zero. So nonzero positions can always move to zero ones, and zero positions never can.",
        "The trap is treating this as a sum or a count. Two heaps of 5 is a loss for the mover and one heap of 5 is a win, even though 10 > 5; only the XOR matters. A second trap is assuming this covers all take-away games - the XOR rule is specific to 'remove any amount from one heap', normal play. Change the move set or the winning condition and you must redo the analysis.",
        "Time: O(n) per test case. Space: O(1) - never store the heaps, XOR them as you read.",
      ],
    },
    {
      name: "Stones (Educational DP Contest K)",
      difficulty: "Medium",
      variation: "Arbitrary subtraction set, win/lose DP",
      link: "https://atcoder.jp/contests/dp/tasks/dp_k",
      question: [
        "There is a set A of N distinct positive integers and a single pile of K stones. Taro and Jiro take turns, Taro first. In each turn a player chooses an element x of A and removes exactly x stones from the pile; the choice must be legal, so x must not exceed the number of stones left. A player who cannot move loses. Assuming both play optimally, print 'First' if Taro wins and 'Second' otherwise.",
        "The input is N and K on the first line, then the N elements of A in increasing order.",
        "Example 1:\nInput:\n2 4\n2 3\nOutput: First\nExplanation: Taro removes 3, leaving 1 stone. Jiro cannot remove 2 or 3, so Jiro loses.",
        "Example 2:\nInput:\n2 5\n2 3\nOutput: Second\nExplanation: From 5 both moves lead to 3 or 2, and from either of those the mover wins by emptying the pile. So every move from 5 hands Jiro a winning position.",
        "Constraints:\n- 1 <= N <= 100\n- 1 <= K <= 10^5\n- 1 <= A[0] < A[1] < ... < A[N-1] <= K",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    vector<char> win(k + 1, 0);           // win[i] = mover with i stones wins
    for (int i = 1; i <= k; i++) {
        for (int x : a) {
            if (x <= i && !win[i - x]) {  // one move to a losing state is enough
                win[i] = 1;
                break;
            }
        }
    }
    cout << (win[k] ? "First" : "Second") << "\\n";
}`,
      explanation: [
        "State: the number of stones remaining, since the pile is the entire position and whose turn it is does not change the rules (the game is impartial). win[i] is true when the player about to move with i stones can force a win.",
        "Transition: win[i] is true if there exists x in A with x <= i and win[i-x] false. That is the definition of a winning position, and it is well founded because every move strictly decreases i, so filling i upward always reads already-final entries. win[0] = false is the base case - no legal move.",
        "This is the general machinery that the closed forms in the earlier questions are shortcuts for. With A = {1,2,3} the table comes out as the period-4 pattern of the first problem. When the move set has no nice structure, or K is small enough, the DP is the answer.",
        "The trap is trying to write a minimax DP that tracks 'best score' or whose turn it is. For an impartial game with a win/lose outcome you only need one boolean per state; doubling the state on the player is wasted work and invites off-by-one bugs. The other trap is scanning for x <= i with a break but forgetting that A is not necessarily a prefix of 1..K, so you cannot assume small moves exist.",
        "Time: O(N * K). Space: O(K).",
      ],
    },
    {
      name: "1-2-K Game",
      difficulty: "Medium",
      variation: "Subtraction game with a closed form for huge n",
      link: "https://codeforces.com/problemset/problem/1194/D",
      question: [
        "Alice and Bob play a game with n stones. On each turn the current player removes exactly 1, 2, or k stones from the pile, where k is fixed for the game. A player who cannot make a move loses. Alice moves first and both play optimally. For each of t independent games given by n and k, print the winner's name, 'Alice' or 'Bob'.",
        "Because n can be as large as 10^9, a per-state DP is too slow and you must find the periodic structure of the losing positions.",
        "Example 1:\nInput:\n2\n4 3\n3 3\nOutput:\nBob\nAlice\nExplanation: With k = 3 and n = 4 every move leaves 1, 2, or 3, and from each of those the opponent empties the pile. With n = 3 Alice removes all 3 stones at once.",
        "Example 2:\nInput:\n2\n3 4\n4 4\nOutput:\nBob\nAlice\nExplanation: With k = 4 the move k is unusable below 4, so the game is the plain 1-2 game whose losing positions are the multiples of 3. n = 3 loses, n = 4 wins.",
        "Constraints:\n- 1 <= t <= 100\n- 1 <= n <= 10^9\n- 3 <= k <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long n, k;
        cin >> n >> k;
        bool alice;
        if (k % 3 != 0) {
            alice = (n % 3 != 0);         // the k move never breaks the 1-2 pattern
        } else {
            long long r = n % (k + 1);    // pattern has period k+1
            alice = (r % 3 != 0 || r == k);
        }
        cout << (alice ? "Alice" : "Bob") << "\\n";
    }
}`,
      explanation: [
        "Start from the game with moves {1,2} only: losing positions are exactly the multiples of 3, because a mover at 3m can be answered by taking 3 minus whatever the opponent took. Adding the third move k either respects that pattern or breaks it, and which one happens depends on k mod 3.",
        "If k is not a multiple of 3, then from a multiple of 3 the move k lands on a non-multiple of 3, i.e. still a winning position for the opponent, so the set of losing positions is unchanged: Alice wins iff n mod 3 != 0.",
        "If k is a multiple of 3, the move k maps multiples of 3 to multiples of 3, so it turns the losing position n = k into a win. Working the table out, the pattern becomes periodic with period k+1: inside a block, r = n mod (k+1) is a win iff r mod 3 != 0, plus the single extra win at r = k. The reason the period is k+1 is that after the position k the position k+1 recreates the situation at 0 (from k+1 the k move leaves 1, which is already a win, so it adds nothing new).",
        "The trap is writing the O(n) DP - correct but hopeless at n = 10^9 - or guessing the closed form without checking the r == k special case, which is precisely the position the extra move creates. Verify any conjectured formula against a brute-force table for k up to 20 and n up to a few hundred before trusting it.",
        "Time: O(1) per query. Space: O(1).",
      ],
    },
    {
      name: "Nim Game II",
      difficulty: "Medium",
      variation: "Misere Nim, last stone loses",
      question: [
        "There are n heaps of sticks. On each turn a player chooses one heap and removes any positive number of sticks from it. This time the player who removes the last stick loses, so the player who cannot move wins. Both players play optimally and the first player starts. For each test case print 'first' if the first player wins and 'second' otherwise.",
        "The input begins with the number of test cases t. Each test case has a line with n, then a line with the n heap sizes.",
        "Example 1:\nInput:\n3\n1\n1\n2\n1 1\n2\n2 2\nOutput:\nsecond\nfirst\nsecond\nExplanation: With one heap of one stick the first player is forced to take the last stick and loses. With two heaps of one stick the moves are forced and the second player takes the last stick. With two heaps of two sticks the XOR is 0 and some heap exceeds 1, so the first player loses just as in normal play.",
        "Example 2:\nInput:\n2\n1\n5\n3\n1 1 1\nOutput:\nfirst\nsecond\nExplanation: From a single heap of 5 the first player leaves exactly 1 stick and the opponent must take it. Three heaps of one stick is an odd forced sequence, so the first player takes the last stick.",
        "Constraints:\n- 1 <= t <= 2 * 10^5\n- 1 <= n <= 2 * 10^5, and the sum of n over all test cases is at most 2 * 10^5\n- 1 <= heap size <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int x = 0, big = 0, ones = 0;
        for (int i = 0; i < n; i++) {
            int a;
            cin >> a;
            x ^= a;
            if (a > 1) big++;             // heaps of size >= 2 give the mover a choice
            else if (a == 1) ones++;
        }
        bool first;
        if (big > 0) first = (x != 0);    // same rule as normal play
        else first = (ones % 2 == 0);     // all heaps are 1: pure parity, flipped
        cout << (first ? "first" : "second") << "\\n";
    }
}`,
      explanation: [
        "Split on whether any heap has at least 2 sticks. If all heaps are single sticks, nobody has a choice: with c heaps the game lasts exactly c moves and the player making move c takes the last stick and loses. So the first player wins iff c is even - the exact opposite of normal play, where the first player wins iff c is odd.",
        "If some heap has at least 2 sticks, the answer is the same as normal Nim: first wins iff the XOR is nonzero. The reason is that the player who is winning under the normal-play rule can steer the endgame. They play the ordinary XOR-zeroing strategy until the position is about to become all-ones, and at that moment they choose whether to leave an even or an odd number of single sticks by taking a whole heap or all but one stick from it. That one degree of freedom is exactly what the big heap buys, and the loser never gets it.",
        "The trap is to assume misere always inverts the answer. It does not - it only inverts the all-ones endgame. Writing 'return x == 0' for misere Nim fails on a single heap of 5, where the first player still wins by leaving one stick.",
        "The other trap is thinking misere is generally this easy. For Nim it is, because the deviation is confined to heaps of size 1. For most other impartial games misere play has no clean Sprague-Grundy theory at all.",
        "Time: O(n) per test case. Space: O(1).",
      ],
    },
    {
      name: "Another Game",
      difficulty: "Medium",
      variation: "Remove one stick from any subset of heaps",
      question: [
        "There are n heaps of sticks. On each turn a player chooses any non-empty subset of the non-empty heaps and removes exactly one stick from every heap in the chosen subset. The player who cannot move, i.e. the one facing all-empty heaps, loses. Both players play optimally and the first player starts. For each test case print 'first' if the first player wins and 'second' otherwise.",
        "The input begins with the number of test cases t. Each test case has a line with n, then a line with the n heap sizes.",
        "Example 1:\nInput:\n2\n2\n1 2\n2\n2 2\nOutput:\nfirst\nsecond\nExplanation: From (1,2) the first player removes a stick from the first heap only, leaving (0,2) with all sizes even. From (2,2) every move creates an odd heap, so the second player can always restore all-even parity.",
        "Example 2:\nInput:\n2\n3\n1 1 1\n3\n4 2 6\nOutput:\nfirst\nsecond\nExplanation: From (1,1,1) the first player empties all three heaps in one move. In (4,2,6) all heaps are even, so the first player is lost.",
        "Constraints:\n- 1 <= t <= 2 * 10^5\n- 1 <= n <= 2 * 10^5, and the sum of n over all test cases is at most 2 * 10^5\n- 1 <= heap size <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        bool odd = false;
        for (int i = 0; i < n; i++) {
            int a;
            cin >> a;
            if (a % 2) odd = true;        // only parity of each heap matters
        }
        cout << (odd ? "first" : "second") << "\\n";
    }
}`,
      explanation: [
        "The invariant is 'every heap has even size'. Claim: those positions are exactly the losing ones. All-zero is all-even and is terminal, so the base case holds.",
        "From an all-even position, any move takes one stick from a non-empty subset, and every heap it touches becomes odd, so the resulting position has at least one odd heap. From a position with at least one odd heap, the mover removes one stick from exactly the odd heaps - all of them are non-empty since they are odd - and hands back an all-even position. So all-even positions can only move to non-all-even ones and vice versa, which by induction makes all-even losing.",
        "The trap is reaching for XOR because the words look like Nim. This is not Nim: a move touches many heaps at once, so the XOR argument does not apply and the answer depends on nothing but the parity of each heap. Note also that only individual parities matter, not how many heaps are odd - one odd heap is already a win.",
        "It is worth noticing why the mover must strip every odd heap rather than just one: leaving a second odd heap behind would leave the opponent in a winning position again.",
        "Time: O(n) per test case. Space: O(1).",
      ],
    },
    {
      name: "Stair Game",
      difficulty: "Medium",
      variation: "Staircase Nim, moves that only relocate tokens",
      question: [
        "There is a staircase whose stairs are numbered 1..n, and stair i initially holds p[i] coins. On each turn a player chooses a stair i with 2 <= i <= n that holds at least one coin and moves any positive number of coins from stair i down to stair i-1. Coins that reach stair 1 can never move again. The player who cannot move loses. Both players play optimally and the first player starts. For each test case print 'first' if the first player wins and 'second' otherwise.",
        "The input begins with the number of test cases t. Each test case has a line with n, then a line with p[1] ... p[n].",
        "Example 1:\nInput:\n2\n3\n1 2 1\n4\n1 3 0 3\nOutput:\nfirst\nsecond\nExplanation: XOR the coins on the even-numbered stairs. For the first case that is p[2] = 2, which is nonzero. For the second it is p[2] XOR p[4] = 3 XOR 3 = 0.",
        "Example 2:\nInput:\n2\n2\n5 0\n2\n0 1\nOutput:\nsecond\nfirst\nExplanation: In the first case only stair 1 has coins, so the first player has no move at all. In the second the first player slides the single coin down to stair 1 and the opponent is stuck.",
        "Constraints:\n- 1 <= t <= 2 * 10^5\n- 1 <= n <= 2 * 10^5, and the sum of n over all test cases is at most 2 * 10^5\n- 0 <= p[i] <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int x = 0;
        for (int i = 1; i <= n; i++) {
            int p;
            cin >> p;
            if (i % 2 == 0) x ^= p;       // only even-numbered stairs are real nim heaps
        }
        cout << (x != 0 ? "first" : "second") << "\\n";
    }
}`,
      explanation: [
        "Nothing is ever removed here, only moved, so the game is not Nim on the face of it. The trick is to decide which coins are genuine Nim heaps. Count distance to the dead stair: a coin on stair i needs i-1 more moves. Call the stairs at odd distance (stairs 2, 4, 6, ... in this 1-based numbering) the active stairs, and treat the coins sitting on them as Nim heaps.",
        "Moving c coins from an active stair to the stair below removes c from a Nim heap, which is exactly a Nim move. Moving c coins from an inactive stair onto an active one adds c to a Nim heap, which is not a Nim move - but it is harmless, because the opponent immediately mirrors it by pushing those same c coins one stair further down, restoring the previous nim-sum. Such wasted moves cannot be repeated forever since every coin only ever descends, so they cannot change who wins.",
        "Therefore the position is losing for the mover exactly when the XOR of the coin counts on the even-numbered stairs is 0, and the winning strategy is the ordinary Nim strategy on those heaps, answering every 'mirror' move immediately.",
        "Two traps: XOR-ing all the stairs instead of alternate ones, and getting the parity backwards. Anchor it with the smallest case - a single coin on stair 2 must be a first-player win, and that stair must therefore be counted; a single coin on stair 3 is a two-move forced sequence and must not be counted.",
        "Time: O(n) per test case. Space: O(1).",
      ],
    },
    {
      name: "Can I Win",
      difficulty: "Medium",
      variation: "Impartial game over subsets, memoized on a bitmask",
      link: "https://leetcode.com/problems/can-i-win/",
      question: [
        "In the 100 game two players alternately add any integer from 1 to 10 to a running total, and the player who first makes the total reach or exceed 100 wins. Generalise it: the integers 1..maxChoosableInteger may each be used at most once in the whole game, and the player who makes the running total reach or exceed desiredTotal wins. Return true if the first player can force a win, assuming both play optimally.",
        "Example 1:\nInput: maxChoosableInteger = 10, desiredTotal = 11\nOutput: false\nExplanation: Whatever the first player picks, the second player can pick a number that reaches 11, because the numbers 1..10 pair up to cover every remaining amount.",
        "Example 2:\nInput: maxChoosableInteger = 4, desiredTotal = 6\nOutput: true\nExplanation: The first player picks 1, leaving 5 to reach with {2,3,4}. Any reply leaves at least one remaining number large enough for the first player to finish.",
        "Constraints:\n- 1 <= maxChoosableInteger <= 20\n- 0 <= desiredTotal <= 300",
      ],
      code: `class Solution {
    int m;
    vector<char> memo;   // 0 = unknown, 1 = mover wins, 2 = mover loses

    bool win(int mask, int rem) {
        if (memo[mask]) return memo[mask] == 1;
        bool res = false;
        for (int i = 1; i <= m && !res; i++) {
            if (mask >> i & 1) continue;                 // i already used
            if (i >= rem || !win(mask | 1 << i, rem - i)) res = true;
        }
        memo[mask] = res ? 1 : 2;
        return res;
    }

public:
    bool canIWin(int maxChoosableInteger, int desiredTotal) {
        m = maxChoosableInteger;
        if (desiredTotal <= 0) return true;              // already won before moving
        if (m * (m + 1) / 2 < desiredTotal) return false; // nobody can ever reach it
        memo.assign(1 << (m + 1), 0);
        return win(0, desiredTotal);
    }
};`,
      explanation: [
        "This is an impartial game whose position is the set of numbers still available, so the state is a bitmask over 1..m. It is impartial because both players draw from the same pool and the same moves are legal for either - which is why a single win/lose boolean per state is enough and no minimax value is needed.",
        "The key memoization insight is that the remaining target is a function of the mask: rem = desiredTotal minus the sum of the used numbers. So the cache is keyed on the mask alone, giving 2^(m+1) states rather than mask times total. Passing rem down as a parameter is just an optimisation to avoid recomputing the sum.",
        "Transition: the mover wins if some unused i either finishes the game outright (i >= rem) or leads to a state that is losing for the opponent. The two early exits matter for correctness as much as for speed: desiredTotal <= 0 is a win before any move, and if the sum 1+2+...+m is below the target the game ends with everything used and nobody reaching it, which the recursion would report as a loss for whoever moves last rather than the required false.",
        "The trap is recursing without memoization, which is O(m!) and times out at m = 20, or keying the memo on (mask, rem) and blowing the memory for no benefit. Another trap is confusing this with a scoring game such as Stone Game - here the outcome is binary, so there is no value to maximise.",
        "Time: O(2^m * m) states times transitions. Space: O(2^m).",
      ],
    },
    {
      name: "Moore's Nim (Nim_k)",
      difficulty: "Hard",
      variation: "Remove from up to k heaps in one move",
      question: [
        "There are n heaps of stones. On each turn a player picks at least one and at most k heaps, all non-empty, and removes any positive number of stones from each of the chosen heaps independently. The player who cannot move, i.e. the one facing all-empty heaps, loses. Given the heap sizes and k, decide whether the first player wins, assuming optimal play. For k = 1 this is ordinary Nim.",
        "Example 1:\nInput: piles = [1, 2, 3], k = 2\nOutput: true\nExplanation: Write the heaps in binary as 01, 10, 11. Bit 0 is set in two heaps and 2 mod 3 != 0, so the first player wins - the move to (1,1,1) touches two heaps and makes every bit count a multiple of 3.",
        "Example 2:\nInput: piles = [1, 1, 1], k = 2\nOutput: false\nExplanation: Bit 0 is set in three heaps and 3 mod 3 = 0, and every other bit count is 0. Whatever the first player does with at most two heaps, at least one stone survives for the opponent to take last.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= n\n- 0 <= heap size <= 10^9",
      ],
      code: `// Moore's theorem: the mover loses iff for every bit position the number of
// heaps having that bit set is divisible by k+1. For k = 1 this is XOR == 0.
bool firstWinsNimK(const vector<int>& piles, int k) {
    for (int b = 0; b < 31; b++) {
        int cnt = 0;
        for (int p : piles)
            if (p >> b & 1) cnt++;
        if (cnt % (k + 1) != 0) return true;   // some digit column is unbalanced
    }
    return false;
}`,
      explanation: [
        "Ordinary Nim adds heap sizes in base 2 without carries; Moore's generalisation adds them in base 2 but reduces each bit column modulo k+1. Concretely, count for each bit b how many heaps have that bit set, and call the position balanced when every one of those counts is divisible by k+1. Claim: balanced positions are exactly the losing ones.",
        "One direction is the easy one. From a balanced position the mover changes at most k heaps, so in the highest bit column where anything changed the count moves by at least 1 and at most k, and since it started at a multiple of k+1 it cannot land on another multiple. So a balanced position can never move to a balanced position.",
        "The other direction is the content of the theorem: from an unbalanced position you can always rebalance by touching at most k heaps. Work from the highest unbalanced bit downward; at each column you may choose to zero out that bit in some of the heaps you have already decided to shrink, and the heaps you commit to are exactly those whose value you first decrease at that top column. The bookkeeping shows k heaps always suffice, because each unbalanced column contributes at most one new heap to the set.",
        "The trap is generalising the wrong quantity - trying XOR of all heaps, or the count of non-empty heaps modulo k+1. Neither works: (1,2,3) with k = 2 has XOR 0 yet is a first-player win, which immediately rules out the plain XOR rule. Sanity-check any candidate rule at k = 1, where it must collapse to XOR == 0.",
        "Time: O(n * B) with B = 31 bit positions. Space: O(1).",
      ],
    },
    {
      name: "Game of Stones",
      difficulty: "Hard",
      variation: "Per-heap Grundy value, then the Nim sum",
      question: [
        "There are n heaps of stones, heap i holding a[i] stones. On each turn a player chooses a heap and removes any positive number of stones from it, subject to one restriction: for a given heap, no two moves in the whole game may remove the same number of stones. So if a player once took 3 stones from heap 5, nobody may ever take exactly 3 stones from heap 5 again, though taking 3 from a different heap is fine. The player who cannot move loses. Both players play optimally and the first player moves first. Print 'First' if the first player wins and 'Second' otherwise.",
        "The input is n on the first line and then the n heap sizes.",
        "Example 1:\nInput:\n1\n1\nOutput: First\nExplanation: The only heap has one stone; the first player takes it and the opponent is stuck.",
        "Example 2:\nInput:\n2\n1 2\nOutput: Second\nExplanation: Both heaps have Grundy value 1 - a heap of 2 is equivalent to a heap of 1, because after taking 1 stone from it you may never take 1 from it again, so the leftover stone is dead. The Nim sum 1 XOR 1 is 0.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= a[i] <= 60",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int x = 0;
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        int k = 0;
        // k = largest value with 1 + 2 + ... + k <= a
        while ((k + 1) * (k + 2) / 2 <= a) k++;
        x ^= k;                                   // Grundy value of this heap
    }
    cout << (x != 0 ? "First" : "Second") << "\\n";
}`,
      explanation: [
        "The heaps are independent games with their own history of forbidden amounts, so Sprague-Grundy applies: compute a Grundy value per heap and XOR them. The whole difficulty is the single-heap value, since a heap's state is really (stones left, set of amounts already taken from it).",
        "The answer is that a heap of a stones has Grundy value k, where k is the largest integer with k(k+1)/2 <= a. The intuition is that the number of moves a heap can ever absorb is bounded: the distinct amounts must be pairwise different positive integers, so the cheapest way to spend m moves on one heap costs at least 1+2+...+m stones. A heap of a stones therefore supports at most k moves, and the leftover a - k(k+1)/2 stones can always be dumped into an earlier move without changing that count - which is why the value depends only on how many triangular numbers fit and not on the remainder.",
        "The values for a = 0,1,2,3,4,5,6 come out as 0,1,1,2,2,2,3, and a brute force over (stones left, bitmask of used amounts) confirms them; that brute force is the right way to discover the formula, and only afterwards should you argue why it holds.",
        "Two traps. First, assuming the Grundy value of a heap is a itself as in ordinary Nim - the no-repeat rule makes heaps of 4 and 5 equivalent. Second, XOR-ing the heap sizes instead of the Grundy values; with a[i] <= 60 the Grundy values live in 0..10, so the mistake changes the answer on almost every input.",
        "Time: O(n) with a constant-bounded inner loop, since a[i] <= 60 gives k <= 10. Space: O(1).",
      ],
    },
  ],
};
