import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Dice Probability",
      difficulty: "Easy",
      variation: "Probability distribution DP, the template",
      question: [
        "You throw a fair six-sided die n times. Each throw independently shows one of 1, 2, 3, 4, 5, 6 with probability 1/6. Compute the probability that the sum of all n throws is between a and b inclusive.",
        "Print the answer with at least six decimals of precision.",
        "Example 1:\nInput: n = 2, a = 9, b = 11\nOutput: 0.250000\nExplanation: Out of the 36 equally likely outcomes, 4 give sum 9, 3 give sum 10 and 2 give sum 11. That is 9 favourable outcomes, so the probability is 9/36 = 0.25.",
        "Example 2:\nInput: n = 3, a = 10, b = 12\nOutput: 0.365741\nExplanation: With three dice there are 216 outcomes; 27 sum to 10, 27 sum to 11 and 25 sum to 12, giving 79/216 = 0.3657407...",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= a <= b <= 6n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, a, b;
    cin >> n >> a >> b;
    // dp[s] = probability that the throws so far sum to exactly s.
    vector<double> dp(6 * n + 1, 0.0);
    dp[0] = 1.0;
    for (int i = 0; i < n; i++) {
        vector<double> nxt(6 * n + 1, 0.0);
        for (int s = 0; s <= 6 * i; s++) {          // only reachable sums matter
            if (dp[s] == 0.0) continue;
            for (int f = 1; f <= 6; f++) nxt[s + f] += dp[s] / 6.0;
        }
        dp = move(nxt);
    }
    double ans = 0.0;
    for (int s = a; s <= b; s++) ans += dp[s];
    cout << fixed << setprecision(6) << ans << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i][s] = probability that the first i throws sum to s. The transition pushes each state forward through the six equally likely faces, dp[i+1][s+f] += dp[i][s] / 6. This is the whole template of probability DP: a state holds a probability mass, and every outgoing transition splits that mass by the transition probability, so the total mass stays 1.",
        "Correctness comes from the law of total probability. The events 'throw i+1 shows f' for f = 1..6 partition the sample space, so the probability of reaching sum s+f after i+1 throws is the sum over the disjoint ways of getting there. Independence is what lets us multiply by 1/6 without conditioning on the history.",
        "The tempting wrong move is to count outcomes as integers and divide by 6^n at the end. That is mathematically identical but 6^100 does not fit in any integer type, and with n = 100 the counts overflow long long almost immediately. Carrying probabilities as doubles keeps every value in [0, 1] and the relative error stays around 1e-15 per step.",
        "Note the sum is capped at 6n, so the table is small. The inner bound 6*i avoids touching unreachable sums, which is a constant-factor win rather than an asymptotic one.",
        "Time: O(n * 6n) = O(n^2) states times O(1) faces. Space: O(n) for two rolling rows of size 6n+1.",
      ],
    },
    {
      name: "Toss Strange Coins",
      difficulty: "Medium",
      variation: "Probability of exactly k successes",
      link: "https://leetcode.com/problems/toss-strange-coins/",
      question: [
        "You have some coins. The i-th coin has probability prob[i] of landing heads when tossed. Toss every coin exactly once, and return the probability that the number of coins showing heads equals target.",
        "Example 1:\nInput: prob = [0.4], target = 1\nOutput: 0.40000\nExplanation: A single coin shows heads with probability 0.4.",
        "Example 2:\nInput: prob = [0.5, 0.5, 0.5, 0.5, 0.5], target = 0\nOutput: 0.03125\nExplanation: All five fair coins must show tails, which happens with probability 0.5^5 = 1/32.",
        "Constraints:\n- 1 <= prob.length <= 1000\n- 0 <= prob[i] <= 1\n- 0 <= target <= prob.length",
      ],
      code: `double probabilityOfHeads(vector<double>& prob, int target) {
    int n = prob.size();
    vector<double> dp(n + 1, 0.0);
    dp[0] = 1.0;                        // zero coins tossed, zero heads
    for (int i = 0; i < n; i++) {
        // Walk j downwards so dp[j-1] is still the value from coin i-1.
        for (int j = i + 1; j >= 1; j--)
            dp[j] = dp[j] * (1 - prob[i]) + dp[j - 1] * prob[i];
        dp[0] *= (1 - prob[i]);
    }
    return dp[target];
}`,
      explanation: [
        "State: dp[j] = probability that exactly j of the coins processed so far are heads. Adding one coin gives dp'[j] = dp[j] * (1 - p) + dp[j-1] * p, because reaching j heads means either you already had j and this coin was tails, or you had j-1 and this coin was heads. Those two cases are disjoint and exhaustive, which is exactly the requirement for adding probabilities.",
        "This is the Poisson binomial distribution. With equal probabilities it collapses to the binomial coefficient formula, but with distinct per-coin probabilities there is no closed form, so the DP is the answer rather than a shortcut.",
        "The 1D rolling array must be filled from high j to low j. Going upwards would overwrite dp[j-1] with the new coin's value before dp[j] reads it, and you would silently count the same coin twice. The dp[0] update is peeled out of the loop because it has no dp[-1] term.",
        "A tempting wrong approach is to enumerate subsets of size target and sum their products. That is 2^n work for the same number. Another trap is expecting the answer to be a nice rational: with arbitrary doubles it is not, so the judge compares within 1e-5.",
        "Time: O(n^2) - n coins times up to n heads counts. Space: O(n).",
      ],
    },
    {
      name: "Knight Probability in Chessboard",
      difficulty: "Medium",
      variation: "Survival probability over a fixed number of steps",
      link: "https://leetcode.com/problems/knight-probability-in-chessboard/",
      question: [
        "On an n x n chessboard a knight starts at the cell (row, column) and makes exactly k moves. Each move is chosen uniformly at random from the 8 knight moves, even if the move would leave the board. Once the knight leaves the board it stops moving and cannot come back. Return the probability that the knight is still on the board after it has finished making all k moves.",
        "Example 1:\nInput: n = 3, k = 2, row = 0, column = 0\nOutput: 0.06250\nExplanation: From (0,0) only 2 of the 8 moves stay on a 3x3 board, and from each of those two cells again only 2 of 8 moves stay on. The probability is (2/8) * (2/8) = 0.0625.",
        "Example 2:\nInput: n = 1, k = 0, row = 0, column = 0\nOutput: 1.00000\nExplanation: The knight makes no moves, so it is trivially still on the board.",
        "Constraints:\n- 1 <= n <= 25\n- 0 <= k <= 100\n- 0 <= row, column <= n - 1",
      ],
      code: `double knightProbability(int n, int k, int row, int column) {
    static const int dr[8] = {1, 1, -1, -1, 2, 2, -2, -2};
    static const int dc[8] = {2, -2, 2, -2, 1, -1, 1, -1};
    vector<vector<double>> dp(n, vector<double>(n, 0.0));
    dp[row][column] = 1.0;
    for (int step = 0; step < k; step++) {
        vector<vector<double>> nxt(n, vector<double>(n, 0.0));
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                if (dp[r][c] == 0.0) continue;
                for (int d = 0; d < 8; d++) {
                    int a = r + dr[d], b = c + dc[d];
                    // Mass that leaves the board is simply dropped, never stored.
                    if (a >= 0 && a < n && b >= 0 && b < n) nxt[a][b] += dp[r][c] / 8.0;
                }
            }
        dp = move(nxt);
    }
    double total = 0.0;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) total += dp[r][c];
    return total;
}`,
      explanation: [
        "State: dp[step][r][c] = probability that the knight is alive and standing on (r,c) after step moves. The key modelling decision is that dp is not a conditional distribution - it does not sum to 1 after the first step. The missing mass is exactly the probability of having already fallen off, so summing the final layer gives the survival probability directly.",
        "Every one of the 8 moves has probability 1/8 regardless of whether it is legal, which is why the divisor is a constant 8 and not the number of in-board moves. Normalising by the legal-move count is the classic wrong answer here: it would compute the probability conditioned on never leaving, a different and larger number.",
        "Pushing forward and dropping off-board mass is cleaner than pulling, because the off-board states are absorbing and never need to be represented. Equivalently you can pull with dp[step][r][c] = sum over in-board predecessors, which gives the same table.",
        "Doubles are safe here: k <= 100 steps of multiplying by 1/8 can underflow to values near 8^-100, but the answer only needs 1e-5 absolute precision and underflow to zero costs nothing at that scale.",
        "Time: O(k * n^2 * 8). Space: O(n^2) with two rolling layers.",
      ],
    },
    {
      name: "Little Pony and Expected Maximum",
      difficulty: "Medium",
      variation: "Expected value of a maximum",
      link: "https://codeforces.com/problemset/problem/453/A",
      question: [
        "A fair m-sided die shows each of the values 1..m with probability 1/m. You throw it exactly n times. Compute the expected value of the maximum value shown across the n throws.",
        "Example 1:\nInput: m = 6, n = 1\nOutput: 3.500000\nExplanation: With a single throw the maximum is just the throw, and the mean of 1..6 is 3.5.",
        "Example 2:\nInput: m = 2, n = 2\nOutput: 1.750000\nExplanation: The maximum is 1 only when both throws are 1, probability 1/4. Otherwise it is 2. So the expected value is 1 * 0.25 + 2 * 0.75 = 1.75.",
        "Example 3:\nInput: m = 6, n = 3\nOutput: 4.958333\nExplanation: Summing x * (number of outcomes with maximum exactly x) over x = 1..6 gives 1071 out of 216 total weight, and 1071/216 = 4.9583333...",
        "Constraints:\n- 1 <= m, n <= 100000\n- The answer must be accurate to within 1e-4",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long m, n;
    cin >> m >> n;
    double ans = 0.0;
    for (long long x = 1; x <= m; x++) {
        // P(max <= x) = (x/m)^n, so P(max == x) is the difference of two CDFs.
        double pLE = pow((double)x / (double)m, (double)n);
        double pLT = pow((double)(x - 1) / (double)m, (double)n);
        ans += (double)x * (pLE - pLT);
    }
    cout << fixed << setprecision(9) << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The maximum of independent throws has a trivially computable CDF: the maximum is at most x exactly when every one of the n throws is at most x, and those throws are independent, so P(max <= x) = (x/m)^n. Differencing consecutive CDF values gives P(max = x) and the expectation is the usual sum of x * P(max = x).",
        "There is a second, often cleaner route using the tail-sum identity E[X] = sum over x >= 1 of P(X >= x). Here that becomes E[max] = sum over x = 1..m of (1 - ((x-1)/m)^n), which needs one pow per term instead of two and avoids the differencing entirely. Both are O(m log n).",
        "The instructive trap is trying to build a DP over throws with the maximum as part of the state. dp[i][v] = probability the max of the first i throws is v is O(n * m) states, which is 10^10 here and far too slow. Recognising that the whole distribution of a maximum is captured by one CDF formula is what makes the problem easy - the DP intuition actively hurts.",
        "Numerically, ((x-1)/m)^n underflows to zero for small x when n is large, which is harmless: those terms genuinely contribute nothing. Using pow on doubles keeps relative error far below the 1e-4 tolerance.",
        "Time: O(m log n) for the pow calls. Space: O(1).",
      ],
    },
    {
      name: "Moving Robots",
      difficulty: "Medium",
      variation: "Linearity of expectation over indicators",
      question: [
        "There is an 8x8 board with a robot standing on every one of the 64 squares. In one step every robot simultaneously moves to a uniformly random square adjacent to its current square, where adjacent means sharing an edge; a robot on the border chooses uniformly among its 2 or 3 available neighbours. Robots do not interact and several may share a square. After exactly k steps, compute the expected number of squares that contain at least one robot.",
        "Example 1:\nInput: k = 1\nOutput: 44.326388889\nExplanation: For the corner square (1,1) only the two robots that started on its neighbours can arrive, each with probability 1/3, so the square is occupied with probability 1 - (2/3)^2 = 5/9. Summing the analogous quantity over all 64 squares gives 44.3263888...",
        "Example 2:\nInput: k = 2\nOutput: 42.719020162",
        "Constraints:\n- 1 <= k <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int k;
    cin >> k;
    const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    // p[s][c] = probability that the robot which started on square s is on square c now.
    static double p[64][64], nx[64][64];
    for (int s = 0; s < 64; s++) {
        for (int c = 0; c < 64; c++) p[s][c] = 0.0;
        p[s][s] = 1.0;
    }
    for (int step = 0; step < k; step++) {
        for (int s = 0; s < 64; s++)
            for (int c = 0; c < 64; c++) nx[s][c] = 0.0;
        for (int c = 0; c < 64; c++) {
            int r = c / 8, col = c % 8;
            int nb[4], deg = 0;
            for (int d = 0; d < 4; d++) {
                int a = r + dr[d], b = col + dc[d];
                if (a >= 0 && a < 8 && b >= 0 && b < 8) nb[deg++] = a * 8 + b;
            }
            for (int s = 0; s < 64; s++) {
                if (p[s][c] == 0.0) continue;
                for (int i = 0; i < deg; i++) nx[s][nb[i]] += p[s][c] / deg;
            }
        }
        for (int s = 0; s < 64; s++)
            for (int c = 0; c < 64; c++) p[s][c] = nx[s][c];
    }
    double ans = 0.0;
    for (int c = 0; c < 64; c++) {
        double empty = 1.0;
        for (int s = 0; s < 64; s++) empty *= (1.0 - p[s][c]);  // robots are independent
        ans += 1.0 - empty;                                     // P(square c is occupied)
    }
    cout << fixed << setprecision(6) << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Linearity of expectation is the entire idea. Let X_c be the indicator that square c is occupied after k steps. The number of occupied squares is the sum of the 64 indicators, so its expectation is the sum of the 64 probabilities P(X_c = 1) - and this holds even though the indicators are heavily dependent on each other. Never try to reason about the joint distribution of occupancies.",
        "For a single square, P(occupied) = 1 - P(no robot lands here), and because the robots move independently the empty probability factorises into a product over the 64 robots of (1 - p[s][c]). So all we need is the per-robot position distribution, which is a plain Markov chain: 64 independent random walks, each a probability DP over the board.",
        "The transition divides by the actual degree of the current square, not by 4, because a robot on an edge or corner picks uniformly among the neighbours that exist. Using 4 everywhere loses mass and produces answers that are too small.",
        "The tempting wrong model is to compute the expected number of robots on a square, which by symmetry-flavoured reasoning is easy but wrong: a square holding three robots still counts once. Expected count and expected number of non-empty squares are different quantities.",
        "As k grows the walk converges to its stationary distribution, so the answer settles near 40.44 and hardly moves after a few hundred steps. That is a useful sanity check but the loop is cheap enough to run all k steps directly.",
        "Time: O(k * 64 * 64 * 4) which is about 1.6 * 10^7 for k = 1000. Space: O(64 * 64).",
      ],
    },
    {
      name: "New 21 Game",
      difficulty: "Medium",
      variation: "Sliding-window probability DP",
      link: "https://leetcode.com/problems/new-21-game/",
      question: [
        "Alice starts with 0 points and draws numbers while her total is strictly less than k. Each draw independently gains her an integer chosen uniformly at random from 1 to maxPts inclusive. She stops drawing as soon as her total reaches k or more. Return the probability that her final total is n or fewer.",
        "Example 1:\nInput: n = 10, k = 1, maxPts = 10\nOutput: 1.00000\nExplanation: Alice draws exactly once, gets a value in 1..10, and every possible total is at most 10.",
        "Example 2:\nInput: n = 6, k = 1, maxPts = 10\nOutput: 0.60000\nExplanation: Alice draws exactly once. Six of the ten equally likely values (1 through 6) are at most 6.",
        "Example 3:\nInput: n = 21, k = 17, maxPts = 10\nOutput: 0.73278",
        "Constraints:\n- 0 <= k <= n <= 10000\n- 1 <= maxPts <= 10000",
      ],
      code: `double new21Game(int n, int k, int maxPts) {
    if (k == 0) return 1.0;                     // she never draws, total is 0 <= n
    if (n >= k + maxPts - 1) return 1.0;        // even the largest reachable total is fine
    vector<double> dp(n + 1, 0.0);
    dp[0] = 1.0;
    double window = 1.0;   // sum of dp[j] for the drawable j in [i-maxPts, i-1], j < k
    double win = 0.0;      // total probability of stopping at a value <= n
    for (int i = 1; i <= n; i++) {
        dp[i] = window / maxPts;
        if (i < k) window += dp[i];             // i is still a drawing state
        else win += dp[i];                      // i is terminal and within n
        int out = i - maxPts;
        if (out >= 0 && out < k) window -= dp[out];   // slid past this predecessor
    }
    return win;
}`,
      explanation: [
        "State: dp[i] = probability that Alice's running total is ever exactly i. A total of i is reached from some j with i - maxPts <= j <= i - 1, and crucially only from a j that was still a drawing state, meaning j < k. So dp[i] = (1/maxPts) * sum of dp[j] over that window intersected with [0, k-1]. The answer is the sum of dp[i] for k <= i <= n, the terminal states within the bound.",
        "The naive form of that recurrence is O(n * maxPts), which is 10^8 and too slow. Because the window is contiguous and slides by one as i increases, keeping a running sum makes each step O(1). Adding dp[i] only when i < k and subtracting dp[i-maxPts] only when it was in the window is what enforces the j < k restriction correctly.",
        "The two early exits are not micro-optimisations, they are correctness guards. When k = 0 there is no draw at all. When n >= k + maxPts - 1 the largest total she can possibly stop at is k - 1 + maxPts, which is within n, so the answer is exactly 1 - and without this check the loop would still be right but the array indices for terminal states would run past n.",
        "The classic mistake is treating dp[i] as the probability of stopping at i for all i, or forgetting that states i >= k are absorbing and must not feed the window. Feeding them back in double counts paths that continue after Alice has already stopped.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Airplane Seat Assignment Probability",
      difficulty: "Medium",
      variation: "Self-referential recurrence collapsing to a constant",
      link: "https://leetcode.com/problems/airplane-seat-assignment-probability/",
      question: [
        "There are n passengers and n seats, and passenger i has been assigned seat i. Passengers board in order 1, 2, ..., n. The first passenger has lost their ticket and picks a seat uniformly at random. Every later passenger takes their own assigned seat if it is free, and otherwise picks uniformly at random among the remaining free seats. Return the probability that the n-th passenger ends up in their own seat n.",
        "Example 1:\nInput: n = 1\nOutput: 1.00000\nExplanation: The only passenger picks the only seat, which is theirs.",
        "Example 2:\nInput: n = 2\nOutput: 0.50000\nExplanation: Passenger 1 picks seat 1 or seat 2 with probability 1/2 each. Only the first case leaves seat 2 free.",
        "Constraints:\n- 1 <= n <= 100000",
      ],
      code: `double nthPersonGetsNthSeat(int n) {
    return n == 1 ? 1.0 : 0.5;
}

// The recurrence the constant comes from, kept for reference:
// f(1) = 1, and for n > 1
//   f(n) = 1/n                    (passenger 1 sits in seat 1: everyone is fine)
//        + 1/n * 0                (passenger 1 sits in seat n: last seat is gone)
//        + sum over i = 2..n-1 of (1/n) * f(n - i + 1)
double nthPersonBrute(int n) {
    vector<double> f(n + 1, 0.0);
    f[1] = 1.0;
    for (int m = 2; m <= n; m++) {
        double acc = 1.0 / m;                 // passenger 1 takes seat 1
        for (int i = 2; i <= m - 1; i++)      // displaces passenger i, subproblem of size m-i+1
            acc += f[m - i + 1] / m;
        f[m] = acc;
    }
    return f[n];
}`,
      explanation: [
        "The recursive structure is the interesting part. If passenger 1 takes seat 1 (probability 1/n) everyone else sits correctly and the answer is 1. If passenger 1 takes seat n (probability 1/n) the answer is 0. Otherwise passenger 1 takes some seat i with 2 <= i <= n-1, everyone before i sits normally, and passenger i faces exactly the original problem on the remaining n-i+1 seats with the roles of seat 1 and seat i swapped. So f(n) = 1/n + (1/n) * sum of f(m) for m = 2..n-1.",
        "Feeding that recurrence forward gives f(2) = 1/2, f(3) = 1/3 + (1/3)*f(2) = 1/2, and by induction f(n) = 1/2 for every n >= 2. The self-similar structure collapses to a constant, which is why the one-line solution is legitimate rather than a hack.",
        "There is a slicker symmetry argument: at every point in the process, the only two seats that can end up wrongly occupied are seat 1 and seat n, and by symmetry of the uniform random choices neither is ever more likely than the other to be taken first. Hence probability 1/2.",
        "The trap is answering 1/n, reasoning that the last passenger gets a uniformly random seat. That is wrong because almost every passenger sits in their own seat and the randomness is concentrated on just two seats. Writing the O(n^2) brute force for small n and seeing the constant 0.5 emerge is the fastest way to catch the error.",
        "Time: O(1) for the closed form, O(n^2) for the reference recurrence. Space: O(1) and O(n) respectively.",
      ],
    },
    {
      name: "Soup Servings",
      difficulty: "Hard",
      variation: "Two-dimensional probability DP with a convergence cutoff",
      link: "https://leetcode.com/problems/soup-servings/",
      question: [
        "There are two types of soup, A and B, with exactly n mL of each to start. On every turn one of the following four operations is chosen with equal probability 0.25, independently of previous turns: serve 100 mL of A and 0 of B; serve 75 of A and 25 of B; serve 50 of A and 50 of B; serve 25 of A and 75 of B. If an operation asks for more soup than remains of a type, serve all that is left of it. The process stops as soon as at least one soup is empty. Return the probability that A becomes empty first, plus half the probability that A and B become empty at the same turn.",
        "Answers within 1e-5 of the true value are accepted.",
        "Example 1:\nInput: n = 50\nOutput: 0.62500\nExplanation: In units of 25 mL both soups start at 2. The four operations give: A empty alone, A empty alone, both empty together, B empty alone. That is (1 + 1 + 0.5 + 0) / 4 = 0.625.",
        "Example 2:\nInput: n = 100\nOutput: 0.71875\nExplanation: With 4 units each, expanding the recursion one level gives (1 + 0.875 + 0.625 + 0.375) / 4 = 0.71875.",
        "Constraints:\n- 0 <= n <= 1000000000",
      ],
      code: `class Solution {
    static const int LIM = 200;
    double memo[LIM + 1][LIM + 1];
    bool seen[LIM + 1][LIM + 1];

    // a, b are amounts measured in units of 25 mL.
    double f(int a, int b) {
        if (a <= 0 && b <= 0) return 0.5;   // emptied together
        if (a <= 0) return 1.0;             // A emptied first
        if (b <= 0) return 0.0;             // B emptied first
        if (seen[a][b]) return memo[a][b];
        seen[a][b] = true;
        return memo[a][b] = 0.25 * (f(a - 4, b) + f(a - 3, b - 1)
                                  + f(a - 2, b - 2) + f(a - 1, b - 3));
    }

public:
    double soupServings(int n) {
        // Each turn removes 4 units total and A loses at least as much as B,
        // so for large n the process almost surely empties A first.
        if (n >= 4800) return 1.0;
        int units = (n + 24) / 25;          // round up: a partial unit still needs a serve
        memset(seen, 0, sizeof(seen));
        return f(units, units);
    }
};`,
      explanation: [
        "State: f(a, b) = the requested probability given a units of A and b units of B remain, where one unit is 25 mL. Every operation removes exactly 4 units in total, split as (4,0), (3,1), (2,2) or (1,3), so scaling by 25 turns messy millilitres into a clean small grid. Rounding n up to whole units is correct because a leftover partial unit is still emptied by one serve, exactly like a full unit.",
        "Clamping is handled in the base cases rather than in the transition: 'serve all that is left' is equivalent to letting the counter go negative and then testing a <= 0. Checking both a <= 0 and b <= 0 first is what encodes the simultaneous-empty tie as 0.5, and getting that ordering wrong is the most common bug.",
        "The real difficulty is n up to 10^9, which would be 4 * 10^7 units and far too many states. The saving observation is that A never loses less than B on any turn and loses strictly more on three of the four operations, so the gap drifts in A's favour. By the law of large numbers the probability that B empties first decays exponentially in n, and past a few thousand millilitres it is below the 1e-5 tolerance. Returning 1.0 for large n is therefore accurate, not a guess - the cutoff around 4800 mL leaves a comfortable margin.",
        "Without that cutoff the only options are wrong (integer overflow or timeout) rather than slow. Recognising a probability DP whose answer converges, and bounding the tail instead of computing it, is the transferable lesson.",
        "Time: O(LIM^2) states with O(1) work each after the cutoff, so effectively O(1) in n. Space: O(LIM^2).",
      ],
    },
    {
      name: "Bag of Mice",
      difficulty: "Hard",
      variation: "Alternating-turn probability DP with a compound transition",
      link: "https://codeforces.com/problemset/problem/148/D",
      question: [
        "A bag contains w white mice and b black mice. The princess and the dragon take turns drawing one mouse uniformly at random from the bag, the princess first. The first player to draw a white mouse wins immediately. Additionally, after the dragon draws a mouse, one more mouse chosen uniformly at random panics and jumps out of the bag (it does not count as anybody's draw). If the bag becomes empty and nobody has drawn a white mouse, the dragon wins. Compute the probability that the princess wins.",
        "Example 1:\nInput: w = 1, b = 3\nOutput: 0.500000000\nExplanation: The princess wins immediately with probability 1/4. Otherwise she drew black; the dragon must also draw black (2/3) and then one of the two remaining mice jumps out. If the white one jumps out the dragon wins; if the black one jumps out the princess draws the last white mouse and wins. That adds (3/4)(2/3)(1/2) = 1/4, for a total of 1/2.",
        "Example 2:\nInput: w = 5, b = 5\nOutput: 0.658730159",
        "Constraints:\n- 0 <= w, b <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int W, B;
    cin >> W >> B;
    // dp[w][b] = probability the princess wins when w white and b black remain
    // and it is the princess's turn to draw.
    vector<vector<double>> dp(W + 1, vector<double>(B + 1, 0.0));
    for (int w = 1; w <= W; w++) dp[w][0] = 1.0;   // only white left, she draws it
    for (int w = 1; w <= W; w++)
        for (int b = 1; b <= B; b++) {
            double tot = w + b;
            double res = w / tot;                  // she draws white and wins now
            if (b >= 2) {
                // She drew black, then the dragon also drew black (else he wins).
                double pBoth = (b / tot) * ((b - 1) / (tot - 1));
                double rem = w + b - 2;            // rem >= 1 here since b >= 2
                if (b >= 3)                        // a black mouse jumps out
                    res += pBoth * ((b - 2) / rem) * dp[w][b - 3];
                if (w >= 1)                        // a white mouse jumps out
                    res += pBoth * (w / rem) * dp[w - 1][b - 2];
            }
            dp[w][b] = res;
        }
    cout << fixed << setprecision(9) << dp[W][B] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[w][b] with the convention that it is always the princess's turn. Folding the dragon's move into the transition is what keeps the state two-dimensional - adding a 'whose turn' flag also works but doubles the table for nothing, since the dragon's turn is fully determined by what follows the princess's black draw.",
        "One transition therefore covers three random events: the princess draws (white means she wins outright, contributing w/(w+b)), the dragon draws (if white the princess has already lost, so only his black draw with probability (b-1)/(w+b-1) continues the game), and then the panicking mouse leaves, which is white with probability w/(w+b-2) and black with probability (b-2)/(w+b-2). Each branch multiplies into a smaller state: dp[w-1][b-2] or dp[w][b-3].",
        "The boundary work is where this problem is actually won or lost. dp[w][0] = 1 for w >= 1 because she draws white immediately. dp[0][b] = 0 for all b. When b = 1 the princess either wins now or the dragon draws the last black mouse and, with no white ever drawn, wins - so the b = 1 column is just w/(w+1), which the formula produces because the b >= 2 block is skipped. The guards on b >= 3 and w >= 1 stop indexing into states that cannot exist.",
        "The tempting error is to forget that the escaping mouse changes the parity of who faces which bag, or to divide by w+b-1 instead of w+b-2 when the mouse jumps out. Both give answers that look plausible on the first sample and fail on the second, so checking w = 5, b = 5 against 0.658730159 is essential.",
        "Time: O(w * b) states with O(1) transitions. Space: O(w * b), reducible to a few rows since b only ever drops by 2 or 3.",
      ],
    },
    {
      name: "Sushi (Educational DP Contest J)",
      difficulty: "Hard",
      variation: "Expected number of steps with self-loop states",
      link: "https://atcoder.jp/contests/dp/tasks/dp_j",
      question: [
        "There are N dishes numbered 1..N, and dish i initially holds a_i pieces of sushi, where a_i is 1, 2 or 3. Repeat the following until no sushi remains: choose one of the N dishes uniformly at random; if the chosen dish still has sushi, eat one piece from it, otherwise do nothing. Compute the expected number of operations performed.",
        "Example 1:\nInput: N = 3, a = [1, 1, 1]\nOutput: 5.500000000\nExplanation: Writing E(k) for the expected operations when k dishes each hold one piece, E(1) = 3, E(2) = (3 + 2*E(1))/2 = 4.5, and E(3) = (3 + 3*E(2))/3 = 5.5.",
        "Example 2:\nInput: N = 1, a = [3]\nOutput: 3.000000000\nExplanation: Every operation picks the only dish and it always has sushi, so exactly 3 operations are needed.",
        "Example 3:\nInput: N = 2, a = [1, 2]\nOutput: 4.500000000",
        "Constraints:\n- 1 <= N <= 300\n- 1 <= a_i <= 3\n- The answer must be accurate to within 1e-9 relative or absolute error",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int cnt[4] = {0, 0, 0, 0};
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        cnt[a]++;
    }
    // E[i][j][k] = expected remaining operations when i dishes hold 1 piece,
    // j hold 2 pieces and k hold 3 pieces. Dish identities do not matter.
    static vector<vector<vector<double>>> E;
    E.assign(n + 1, vector<vector<double>>(n + 1, vector<double>(n + 1, 0.0)));
    for (int k = 0; k <= n; k++)
        for (int j = 0; j + k <= n; j++)
            for (int i = 0; i + j + k <= n; i++) {
                int nonEmpty = i + j + k;
                if (nonEmpty == 0) continue;             // E[0][0][0] = 0
                double v = n;                            // the self-loop, already solved
                if (i) v += i * E[i - 1][j][k];           // 1-piece dish becomes empty
                if (j) v += j * E[i + 1][j - 1][k];       // 2-piece dish becomes a 1-piece
                if (k) v += k * E[i][j + 1][k - 1];       // 3-piece dish becomes a 2-piece
                E[i][j][k] = v / nonEmpty;
            }
    cout << fixed << setprecision(10) << E[cnt[1]][cnt[2]][cnt[3]] << "\\n";
    return 0;
}`,
      explanation: [
        "State compression comes first: only the multiset of remaining counts matters, and each count is 1, 2 or 3, so the state is the triple (i, j, k) of how many dishes hold one, two and three pieces. The number of empty dishes is n - i - j - k, so it needs no separate coordinate. That is O(n^3) states instead of 4^n.",
        "The self-loop is the whole point of this problem. Writing the raw expectation gives E = 1 + (c0/n) * E + (i/n) * E[i-1][j][k] + (j/n) * E[i+1][j-1][k] + (k/n) * E[i][j+1][k-1], where c0 = n - i - j - k. The unknown E appears on both sides because picking an empty dish returns to the same state. This is not a circular dependency you have to give up on - it is a linear equation in one unknown. Move the term across: E * (1 - c0/n) = 1 + ..., multiply through by n, and since n - c0 = i + j + k you get E = (n + i*E1 + j*E2 + k*E3) / (i + j + k). The numerator's n is exactly the inflated cost of the wasted picks.",
        "Equivalently, the number of consecutive useless picks before a productive one is geometric with success probability (i+j+k)/n, so its expected value is n/(i+j+k); that is the same algebra read probabilistically. Either derivation is fine, but ignoring the self-loop entirely - dividing by n instead of by i+j+k - is the classic wrong answer, and it under-reports badly when most dishes are already empty.",
        "The evaluation order is forced by the transitions: j-1 and k-1 mean the loops over k and j must be outer and increasing, while i can move either way inside them because the i-1 term only reaches a state with the same j and k. Note that i increases in two of the transitions, which is why i cannot be the outermost increasing loop.",
        "Memory is the practical constraint: a full (n+1)^3 array of doubles at n = 300 is about 218 MB. Since k only ever decreases, you can keep just two k-layers and cut that to a few megabytes if the limit is tight.",
        "Time: O(n^3) states with O(1) transitions, about 2.7 * 10^7 for n = 300. Space: O(n^3), reducible to O(n^2).",
      ],
    },
  ],
};
