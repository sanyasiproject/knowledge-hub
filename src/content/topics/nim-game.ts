import type { TopicContent } from "../types";

export const nimGame: TopicContent = {
  quickSummary: [
    "Normal-play Nim: players alternately remove any positive number of stones from one pile; whoever cannot move loses.",
    "The position is losing for the player to move exactly when the XOR (`nim-sum`) of all pile sizes is `0`.",
    "Deciding the winner and producing a winning move both cost **O(n)** time and **O(1)** extra space.",
  ],
  detailed: [
    "A Nim position is just a multiset of pile sizes, and its whole fate is decided by `x = a1 ^ a2 ^ ... ^ an`. If `x == 0` the player to move loses under perfect play; if `x != 0` that player wins. Nothing else about the piles matters — not their count, not their order, not their total.\n\nKey insight: XOR is the right operation because it is addition without carries, and a carry-free sum is exactly what makes each bit independently mirror-able.",
    "## Why the XOR rule works\n\nThe proof is a two-part mirroring argument.\n\n- **From `x != 0` you can always reach `x == 0`.** Let `b` be the highest set bit of `x`. Some pile `ai` has bit `b` set, and for that pile `ai ^ x < ai`, so shrinking it to `ai ^ x` is a legal move that makes the nim-sum `0`.\n- **From `x == 0` every move leaves `x != 0`.** Changing one pile from `ai` to `ai' != ai` changes the nim-sum to `ai ^ ai' != 0`.\n\nSo the losing player is handed a zero every turn, and the terminal all-empty position has nim-sum `0` — the loser is the one who receives it with no move left.",
    "## Misère Nim\n\nMisère play flips the ending: whoever takes the **last** stone loses. The rule is almost the same but not quite.\n\n- If **every** pile has size `1`, the first player wins iff the number of piles is **even**.\n- Otherwise (at least one pile of size `≥ 2`), the first player wins iff the nim-sum is nonzero — same as normal play.\n\nCommon mistake: assuming misère games in general just invert the normal-play answer. That shortcut happens to work for Nim only; for most impartial games the misère theory is genuinely harder, so always solve misère variants explicitly.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Normal-play Nim: winner plus an explicit winning move — O(n) time, O(1) extra space",
      source: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    long long x = 0;                    // nim-sum
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        x ^= a[i];
    }

    if (x == 0) {
        cout << "second player wins\\n";
        return 0;
    }

    // x != 0: some pile has the top bit of x set, and for it a[i] ^ x < a[i].
    for (int i = 0; i < n; ++i) {
        long long target = a[i] ^ x;
        if (target < a[i]) {
            cout << "first player wins: remove " << a[i] - target
                 << " from pile " << i << " (leaving " << target << ")\\n";
            break;
        }
    }
}`,
    },
    {
      language: "cpp",
      caption: "Misère Nim decision — the all-ones case is the only deviation",
      source: `// Misere play: the player who removes the LAST stone LOSES.
bool misereFirstPlayerWins(const vector<long long>& a) {
    long long x = 0;
    bool allOnes = true;
    for (long long v : a) {
        x ^= v;
        if (v > 1) allOnes = false;
    }
    if (allOnes) return a.size() % 2 == 0;   // parity decides
    return x != 0;                            // otherwise: normal-play rule
}`,
    },
  ],
  cheatSheet: [
    "Normal play: nim-sum `a1 ^ ... ^ an == 0` ⇒ player to move loses.",
    "Winning move: pick any pile with `a[i] ^ x < a[i]`, shrink it to `a[i] ^ x`.",
    "Misère: all piles == 1 ⇒ win iff pile count is even; else use the normal-play rule.",
    "Complexity: O(n) time, O(1) extra space — no search, no DP.",
    "A single pile of size k is a first-player win for any k ≥ 1 (normal play).",
  ],
  interviewQA: [
    {
      q: "Prove that a Nim position with nim-sum zero is losing for the player to move.",
      a: "Two facts suffice. (1) From nim-sum zero, every legal move changes exactly one pile from `ai` to a different `ai'`, so the new nim-sum is `ai ^ ai'`, which is nonzero because `ai != ai'`. (2) From a nonzero nim-sum `x`, take the highest set bit `b` of `x`; some pile has bit `b` set, and for that pile `ai ^ x < ai`, so reducing it to `ai ^ x` is legal and yields nim-sum zero. Therefore the player facing zero must hand back a nonzero position, and the opponent can always hand zero back. The terminal position (all piles empty) has nim-sum zero and no moves, so the player who keeps receiving zeros is the one who eventually cannot move.",
      followUps: [
        "What changes if a move may remove stones from two piles at once?",
        "How would you handle a cap of at most k stones per move?",
      ],
    },
    {
      q: "Given piles [3, 4, 5], who wins and what is a winning first move?",
      a: "The nim-sum is 3 ^ 4 ^ 5 = 2, which is nonzero, so the first player wins. Scan for a pile where `a[i] ^ 2 < a[i]`: for 3 we get 1 (< 3), so removing 2 stones from the pile of 3 leaves [1, 4, 5] with nim-sum 0. The pile of 4 gives 4 ^ 2 = 6 > 4 (not legal), and the pile of 5 gives 5 ^ 2 = 7 > 5 (not legal), so that first pile is the only winning move here.",
      followUps: ["What if the same position were played under misère rules?"],
    },
  ],
  flashcards: [
    { front: "Normal-play Nim losing condition?", back: "XOR of all pile sizes equals 0. The player to move loses under perfect play." },
    { front: "How do you construct a winning Nim move?", back: "Let x be the nim-sum. Find a pile with `a[i] ^ x < a[i]` and reduce it to `a[i] ^ x`, making the nim-sum 0." },
    { front: "Misère Nim rule?", back: "If all piles are size 1, first player wins iff the pile count is even. Otherwise use the normal-play nim-sum rule." },
  ],
};
