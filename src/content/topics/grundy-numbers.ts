import type { TopicContent } from "../types";

export const grundyNumbers: TopicContent = {
  quickSummary: [
    "The Grundy value of a position is `mex` of the Grundy values of positions reachable in one move; `0` means losing for the player to move.",
    "Sprague-Grundy: any impartial normal-play game equals a Nim pile of size `g`, so independent components combine by **XOR**.",
    "Tabulating Grundy values for states `0..n` with `m` moves each costs **O(n·m)** time and **O(n)** space.",
  ],
  detailed: [
    "`mex(S)` — minimum excludant — is the smallest non-negative integer missing from `S`. Define `g(v) = mex{ g(u) : v → u }`, with `g(v) = 0` at terminal positions since the reachable set is empty. A position is losing for the player to move exactly when `g(v) == 0`, which generalises the Nim zero-sum rule to any impartial game.\n\nKey insight: `g(v)` is not a boolean win/lose flag — it is a *size*. It says which single Nim pile the position is interchangeable with, and that number is what lets you add games together.",
    "## Sprague-Grundy theorem\n\nIf a game is a disjoint sum of independent components `G1, G2, ..., Gk` (a move touches exactly one component), then\n\n`g(G1 + G2 + ... + Gk) = g(G1) ^ g(G2) ^ ... ^ g(Gk)`\n\nThe combined position is losing iff that XOR is `0`. This is what turns Nim from a puzzle into a general tool: solve each component in isolation, then XOR.\n\nThe theorem needs three conditions — **impartial** (both players have the same moves), **normal play** (no move = loss), and **finite** (no infinite play).",
    "## Computing Grundy tables\n\nFor a subtraction game on a pile of size `i` with move set `S`, `g(i) = mex{ g(i - s) : s ∈ S, s ≤ i }`. Since the reachable set has at most `|S|` elements, `g(i) ≤ |S|`, so a fixed-size boolean scratch array of length `|S| + 1` computes each `mex` in **O(|S|)**.\n\nFor example, `S = {1, 3, 4}` gives `g[0..10] = 0 1 0 1 2 3 2 0 1 0 1` — periodic with period 7, which is typical: Grundy sequences of subtraction games are eventually periodic, so you can tabulate a prefix and extrapolate.\n\nCommon mistake: computing Grundy values for the *whole* multi-pile state instead of per pile. That blows the state space up exponentially when the Sprague-Grundy XOR would have collapsed it.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Grundy table for a subtraction game — O(n·|S|) time, O(n) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Subtraction game: from a pile of size i you may remove any s in S.
// g[i] = mex{ g[i - s] : s in S, s <= i }.  Since |reachable| <= |S|, g[i] <= |S|.
vector<int> grundyTable(int n, const vector<int>& S) {
    vector<int> g(n + 1, 0);
    vector<char> seen(S.size() + 1, 0);
    for (int i = 1; i <= n; ++i) {
        fill(seen.begin(), seen.end(), 0);
        for (int s : S)
            if (s <= i && g[i - s] < (int)seen.size())
                seen[g[i - s]] = 1;
        int m = 0;
        while (m < (int)seen.size() && seen[m]) ++m;
        g[i] = m;
    }
    return g;
}

// S = {1,3,4} -> g[0..10] = 0 1 0 1 2 3 2 0 1 0 1   (period 7 from index 0)`,
    },
    {
      language: "cpp",
      caption: "Sprague-Grundy: XOR the components to decide a multi-pile game",
      source: `int main() {
    vector<int> S = {1, 3, 4};
    const int MAXPILE = 100000;
    vector<int> g = grundyTable(MAXPILE, S);

    int piles;
    cin >> piles;
    int x = 0;
    for (int i = 0; i < piles; ++i) {
        int v;
        cin >> v;
        x ^= g[v];                 // independent components combine by XOR
    }
    cout << (x != 0 ? "first" : "second") << " player wins\\n";
}`,
    },
  ],
  cheatSheet: [
    "`g(v) = mex{ g(u) : v → u }`; terminal ⇒ `g = 0`; `g == 0` ⇒ losing for the mover.",
    "Sum of independent games: XOR their Grundy values.",
    "Plain Nim is the special case `g(pile of k) = k`.",
    "Subtraction game with move set S: `g ≤ |S|`, and the sequence is eventually periodic.",
    "Table cost: O(n·|S|) time, O(n) space; each mex is O(|S|) with a reusable scratch array.",
  ],
  interviewQA: [
    {
      q: "What does the Sprague-Grundy theorem actually let you do, and what are its preconditions?",
      a: "It says every position of a finite impartial normal-play game is equivalent to a single Nim pile whose size is that position's Grundy value, and that the Grundy value of a sum of independent games is the XOR of the parts. Practically, that lets you solve a complicated compound game by solving each independent component separately and XOR-ing. The preconditions are: impartial (the move set depends only on the position, not on whose turn it is — so chess and other partisan games are excluded), normal play (a player with no move loses), and finiteness (play always terminates).",
      followUps: ["Why does the theorem fail under misère rules?", "How would you handle a game that is not impartial?"],
    },
    {
      q: "How do you compute a Grundy value, and why mex rather than 'any missing number'?",
      a: "Enumerate every position reachable in one move, collect their Grundy values into a set, and take the minimum excludant. mex is forced by the equivalence to Nim: a position of Grundy value g must be able to move to positions of every value 0..g-1 (mirroring the moves that shrink a Nim pile of size g) and must not be able to move to another position of value g (otherwise a zero-sum position could move to another zero-sum position, breaking the losing-position argument). mex is exactly the number satisfying both conditions.",
      followUps: ["What is the Grundy value of a terminal position?"],
    },
  ],
  flashcards: [
    { front: "Definition of mex?", back: "Minimum excludant — the smallest non-negative integer not in the set. mex({}) = 0, mex({0,1,3}) = 2." },
    { front: "Grundy value recurrence?", back: "`g(v) = mex{ g(u) : v → u }`. Terminal positions have g = 0, and g == 0 means the player to move loses." },
    { front: "How do independent impartial games combine?", back: "XOR of their Grundy values (Sprague-Grundy). The sum is losing for the mover iff that XOR is 0." },
  ],
};
